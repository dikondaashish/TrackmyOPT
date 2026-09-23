import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { webcrypto } from 'node:crypto';
import vm from 'node:vm';
const req = createRequire(resolve('package.json'));
const { JSDOM } = req('jsdom');
const code = req('esbuild').buildSync({
  entryPoints: ['src/smart-answers.ts'],
  bundle: true,
  write: false,
  format: 'cjs',
  platform: 'node',
}).outputFiles[0].text;
function fixture(label = 'What do you use dbt with?') {
  const dom = new JSDOM(
    '<form><label for="q"></label><textarea id="q"></textarea><button type="button">Next</button></form>',
    { url: 'https://example.test/jobs/1' }
  );
  const doc = dom.window.document;
  doc.querySelector('label').textContent = label;
  const field = doc.querySelector('textarea');
  dom.window.HTMLElement.prototype.getBoundingClientRect = () => ({
    width: 100,
    height: 30,
  });
  dom.window.HTMLElement.prototype.getClientRects = () => [{}];
  const messages: any[] = [];
  let handler = async (m: any): Promise<any> =>
    m.type === 'LOAD_SCREENING_ANSWER'
      ? { ok: true, answer: null }
      : {
          ok: true,
          draft:
            'I use dbt with Snowflake to transform and test analytics models.',
        };
  const module = { exports: {} as any };
  vm.runInNewContext(code, {
    module,
    exports: module.exports,
    window: dom.window,
    document: doc,
    crypto: webcrypto,
    TextEncoder,
    chrome: {
      runtime: {
        sendMessage: async (m: any) => {
          messages.push(m);
          return handler(m);
        },
      },
    },
    HTMLInputElement: dom.window.HTMLInputElement,
    HTMLTextAreaElement: dom.window.HTMLTextAreaElement,
    HTMLSelectElement: dom.window.HTMLSelectElement,
    HTMLElement: dom.window.HTMLElement,
  });
  let active = true;
  return {
    dom,
    doc,
    field,
    messages,
    setHandler: (h: typeof handler) => (handler = h),
    cancel: () => (active = false),
    run: (hasResume = true) =>
      module.exports.runSmartAnswers({
        root: doc.querySelector('form'),
        job: {
          jobUrl: dom.window.location.href,
          companyName: 'Example',
          roleTitle: 'Analyst',
          jobDescription: 'Build analytics models',
        },
        hasResume,
        snapshot: { skills: ['dbt', 'Snowflake'] },
        shouldContinue: () => active,
      }),
  };
}
test('one click drafts an eligible question, inserts it, labels it for review, and does not save automatically', async () => {
  const f = fixture();
  try {
    await f.run();
    assert.match(f.field.value, /Snowflake/);
    assert.match(f.doc.body.textContent, /AI draft · Review/);
    assert.equal(
      f.messages.filter((m) => m.type === 'GENERATE_SCREENING_DRAFT').length,
      1
    );
    assert.equal(
      f.messages.some((m) => m.type === 'SAVE_SCREENING_ANSWER'),
      false
    );
    await f.run();
    assert.equal(
      f.messages.filter((m) => m.type === 'GENERATE_SCREENING_DRAFT').length,
      1
    );
  } finally {
    f.dom.window.close();
  }
});
test('a previously reviewed exact answer fills without AI or a generated resume', async () => {
  const f = fixture();
  try {
    f.setHandler(async () => ({
      ok: true,
      answer: {
        normalizedQuestionText: 'What do you use dbt with?',
        editedAnswer: 'My saved answer',
        source: 'user_written',
      },
    }));
    await f.run(false);
    assert.equal(f.field.value, 'My saved answer');
    assert.equal(f.messages.length, 1);
  } finally {
    f.dom.window.close();
  }
});
for (const label of [
  'What salary do you expect?',
  'What is your work authorization?',
  'What is your password?',
  'What accommodations do you need?',
  'Email',
  'What is your date of birth?',
])
  test(`never sends excluded question to AI: ${label}`, async () => {
    const f = fixture(label);
    try {
      await f.run();
      assert.equal(f.messages.length, 0);
      assert.equal(f.field.value, '');
    } finally {
      f.dom.window.close();
    }
  });
for (const change of [
  'edit',
  'cancel',
  'navigate',
  'readonly',
  'remove',
] as const)
  test(`does not insert an async draft after ${change}`, async () => {
    const f = fixture();
    try {
      f.setHandler(async (m) => {
        if (m.type === 'LOAD_SCREENING_ANSWER') return { ok: true };
        if (change === 'edit') f.field.value = 'My own answer';
        if (change === 'cancel') f.cancel();
        if (change === 'navigate')
          f.dom.window.history.pushState({}, '', '/jobs/2');
        if (change === 'readonly') f.field.readOnly = true;
        if (change === 'remove') f.field.remove();
        return { ok: true, draft: 'AI answer' };
      });
      await f.run();
      assert.equal(f.field.value, change === 'edit' ? 'My own answer' : '');
    } finally {
      f.dom.window.close();
    }
  });
test('missing context stays blank with guidance; repeated Prefill does not charge again', async () => {
  const f = fixture();
  try {
    f.setHandler(async (m) =>
      m.type === 'LOAD_SCREENING_ANSWER'
        ? { ok: true }
        : { ok: false, error: 'insufficient_context' }
    );
    await f.run();
    await f.run();
    assert.equal(f.field.value, '');
    assert.match(f.doc.body.textContent, /Add your own answer/);
    assert.equal(
      f.messages.filter((m) => m.type === 'GENERATE_SCREENING_DRAFT').length,
      1
    );
  } finally {
    f.dom.window.close();
  }
});
test('oversized drafts are not silently truncated or inserted', async () => {
  const f = fixture();
  try {
    f.field.maxLength = 10;
    f.setHandler(async (m) =>
      m.type === 'LOAD_SCREENING_ANSWER'
        ? { ok: true }
        : { ok: true, draft: 'An answer much longer than allowed' }
    );
    await f.run();
    assert.equal(f.field.value, '');
  } finally {
    f.dom.window.close();
  }
});
test('saved company-specific responses are not blindly reused at another employer', async () => {
  const f = fixture('Why do you want to work at this company?');
  try {
    f.setHandler(async (m) =>
      m.type === 'LOAD_SCREENING_ANSWER'
        ? {
            ok: true,
            answer: {
              normalizedQuestionText:
                'Why do you want to work at this company?',
              editedAnswer: 'I love Old Employer',
              source: 'user_written',
            },
          }
        : { ok: true, draft: 'My relevant current answer' }
    );
    await f.run();
    assert.equal(f.field.value, 'My relevant current answer');
  } finally {
    f.dom.window.close();
  }
});
test('no resume gives an actionable message without a generation request', async () => {
  const f = fixture();
  try {
    await f.run(false);
    assert.match(f.doc.body.textContent, /Generate a resume/);
    assert.equal(
      f.messages.some((m) => m.type === 'GENERATE_SCREENING_DRAFT'),
      false
    );
  } finally {
    f.dom.window.close();
  }
});
test('AI failure and quota limits leave an honest status', async () => {
  const f = fixture();
  try {
    f.setHandler(async (m) =>
      m.type === 'LOAD_SCREENING_ANSWER'
        ? { ok: true }
        : { ok: false, error: 'ai_monthly_limit_reached' }
    );
    await f.run();
    assert.equal(f.field.value, '');
    assert.match(f.doc.body.textContent, /AI limit reached/);
  } finally {
    f.dom.window.close();
  }
});
test('an input in a disabled fieldset never triggers AI', async () => {
  const f = fixture();
  try {
    const wrapper = f.doc.createElement('fieldset');
    wrapper.disabled = true;
    f.field.before(wrapper);
    wrapper.append(f.field);
    await f.run();
    assert.equal(f.messages.length, 0);
  } finally {
    f.dom.window.close();
  }
});
test('an input inside a hidden container never triggers AI', async () => {
  const f = fixture();
  try {
    f.field.parentElement.hidden = true;
    await f.run();
    assert.equal(f.messages.length, 0);
  } finally {
    f.dom.window.close();
  }
});
test('remember uses the current user-edited text only after explicit click', async () => {
  const f = fixture();
  try {
    await f.run();
    f.field.value = 'My real experience';
    f.doc.querySelector('.tmo-smart-answer-note button').click();
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(
      f.messages.find((m) => m.type === 'SAVE_SCREENING_ANSWER').answer
        .editedAnswer,
      'My real experience'
    );
    assert.match(f.doc.body.textContent, /Saved for future/);
  } finally {
    f.dom.window.close();
  }
});
test('concurrent clicks share one run instead of generating twice', async () => {
  const f = fixture();
  try {
    await Promise.all([f.run(), f.run()]);
    assert.equal(
      f.messages.filter((m) => m.type === 'GENERATE_SCREENING_DRAFT').length,
      1
    );
  } finally {
    f.dom.window.close();
  }
});
test('quota exhaustion stops further AI requests on the same form', async () => {
  const f = fixture();
  try {
    const second = f.doc.createElement('textarea');
    second.setAttribute('aria-label', 'Describe a project you built');
    f.doc.querySelector('form').append(second);
    f.setHandler(async (m) =>
      m.type === 'LOAD_SCREENING_ANSWER'
        ? { ok: true }
        : { ok: false, error: 'ai_daily_limit_reached' }
    );
    await f.run();
    assert.equal(
      f.messages.filter((m) => m.type === 'GENERATE_SCREENING_DRAFT').length,
      1
    );
    assert.equal(second.value, '');
  } finally {
    f.dom.window.close();
  }
});
