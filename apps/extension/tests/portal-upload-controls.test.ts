import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import vm from 'node:vm';
import { buildResumePdfFilename } from '../src/resume-filename';

const local = createRequire(resolve('package.json'));
const { JSDOM } = local('jsdom');
const jsdomLocal = createRequire(local.resolve('jsdom'));
const fileLists = jsdomLocal('./generated/idl/FileList.js');
const { implForWrapper } = jsdomLocal('./generated/idl/utils.js');
const code = local('esbuild').buildSync({
  stdin: {
    contents:
      "export * from './easy-apply-attachments'; export * from './prefill-undo';",
    resolveDir: resolve('src'),
  },
  bundle: true,
  write: false,
  format: 'cjs',
  platform: 'node',
}).outputFiles[0].text;
const pdf = Buffer.from(
  '%PDF-1.7\nJob-specific generated document\n%%EOF'
).toString('base64');
const resume = { pdfBase64: pdf, filename: 'generated-role-resume.pdf' };
const cover = {
  base64: pdf,
  filename: 'generated-role-cover.pdf',
  sourceContentHash: 'job-content',
  sha256: 'artifact-hash',
  generatedAt: '2026-09-22T12:00:00Z',
};

function harness(html: string) {
  // No resources or scripts are loaded. Only DataTransfer (absent in jsdom)
  // is shimmed; FileList, input.files, labels, styles and events are real DOM.
  const dom = new JSDOM(html, { url: 'https://portal.example.test/apply' });
  const win = dom.window;
  class DataTransfer {
    files = fileLists.create(win);
    items = {
      add: (file: File) =>
        implForWrapper(this.files).push(implForWrapper(file)),
    };
  }
  win.DataTransfer = DataTransfer;
  const module = { exports: {} as any };
  vm.runInNewContext(code, {
    module,
    exports: module.exports,
    window: win,
    document: win.document,
    File: win.File,
    Event: win.Event,
    DataTransfer,
    HTMLElement: win.HTMLElement,
    HTMLInputElement: win.HTMLInputElement,
    atob: win.atob.bind(win),
    getComputedStyle: win.getComputedStyle.bind(win),
  });
  return {
    dom,
    win,
    api: module.exports,
    input: () => win.document.querySelector('input') as HTMLInputElement,
    files: (file: File) => {
      const dt = new DataTransfer();
      dt.items.add(file);
      return dt.files;
    },
    attach(
      kind: 'resume' | 'cover',
      root = win.document.body,
      callback?: (input: HTMLInputElement) => void
    ) {
      return kind === 'resume'
        ? module.exports.attachGeneratedResume(root, resume, callback)
        : module.exports.attachGeneratedCoverLetter(
            root,
            cover,
            'job-content',
            callback
          );
    },
  };
}

test('Prefill preserves the generated name in the actual uploaded File', (t) => {
  const h = harness('<label>Resume<input type="file" accept=".pdf"></label>');
  t.after(() => h.dom.window.close());
  const filename = buildResumePdfFilename({ latex: String.raw`\name{Jane}{Smith}`, jobDescription: 'Role: Data Engineer' });
  assert.equal(h.api.attachGeneratedResume(h.win.document.body, { pdfBase64: pdf, filename }), 'attached');
  assert.equal(h.input().files?.[0]?.name, 'Jane_Smith_Resume_Data_Engineer.pdf');
});

test('Ashby server-rendered upload is preserved when native FileList is empty', t => {
 const h=harness('<label for="resume">Resume</label><div class="ashby-application-form-input-file"><input id="resume" type="file"><p class="ashby-application-form-input-file-item-name">Existing.pdf</p></div>');
 t.after(()=>h.dom.window.close());
 assert.equal(h.attach('resume'),'already_present');
 assert.equal(h.input().files?.length,0);
});
for (const kind of ['resume', 'cover'] as const) {
  const label = kind === 'resume' ? 'Resume' : 'Cover letter';
  test(`${kind}: attaches generated PDF, emits events and preserves unsupported undo accounting`, async () => {
    const h = harness(
      `<label for="upload">${label}</label><input id="upload" type="file" accept=".PDF">`
    );
    try {
      const events: string[] = [];
      for (const name of ['input', 'change'])
        h.input().addEventListener(name, () => events.push(name));
      let callbacks = 0;
      await h.api.withPrefillUndo(async () => {
        assert.equal(
          h.attach(kind, undefined, () => callbacks++),
          'attached'
        );
      });
      assert.equal(
        h.input().files?.[0].name,
        kind === 'resume' ? resume.filename : cover.filename
      );
      assert.deepEqual(events, ['input', 'change']);
      assert.equal(callbacks, 1);
      assert.equal(h.api.undoLastPrefill().unsupported, 1);
      assert.equal(
        h.input().files?.length,
        1,
        'undo must not clear an uploaded document'
      );
    } finally {
      h.dom.window.close();
    }
  });

  for (const wrapper of [
    'hidden',
    'inert',
    'aria-hidden="true"',
    'aria-disabled="true"',
    'style="display:none"',
    'style="visibility:hidden"',
    'style="content-visibility:hidden"',
  ]) {
    test(`${kind}: skips inactive ancestor ${wrapper}`, () => {
      const h = harness(
        `<section ${wrapper}><input type="file" aria-label="${label}"></section><input type="file" aria-label="${label}">`
      );
      try {
        assert.equal(h.attach(kind), 'attached');
        const inputs = h.win.document.querySelectorAll('input');
        assert.equal(inputs[0].files.length, 0);
        assert.equal(inputs[1].files.length, 1);
      } finally {
        h.dom.window.close();
      }
    });
  }

  for (const attributes of [
    'hidden aria-hidden="true"',
    'style="display:none"',
    'style="opacity:0;position:absolute;width:1px;height:1px"',
  ]) {
    test(`${kind}: allows visually hidden native picker ${attributes}`, () => {
      const h = harness(
        `<label for="upload">${label}</label><input id="upload" type="file" ${attributes}>`
      );
      try {
        assert.equal(h.attach(kind), 'attached');
      } finally {
        h.dom.window.close();
      }
    });
  }

  for (const attributes of [
    'disabled',
    'inert',
    'aria-disabled="true"',
    'accept=".docx,image/*"',
    'webkitdirectory',
  ]) {
    test(`${kind}: respects upload constraint ${attributes}`, () => {
      const h = harness(
        `<input type="file" aria-label="${label}" ${attributes}>`
      );
      try {
        assert.equal(h.attach(kind), 'unsupported');
        assert.equal(h.input().files?.length, 0);
      } finally {
        h.dom.window.close();
      }
    });
  }

  test(`${kind}: respects disabled fieldsets and their first-legend exception`, () => {
    const h = harness(
      `<fieldset disabled><legend><input type="file" aria-label="${label}"></legend><input type="file" aria-label="${label}"></fieldset>`
    );
    try {
      const [allowed, blocked] = h.win.document.querySelectorAll('input');
      const file = new h.win.File(['%PDF-1.7'], 'generated.pdf', {
        type: 'application/pdf',
      });
      assert.equal(h.api.tryAttachPdfToInput(blocked, file), 'unsupported');
      assert.equal(h.api.tryAttachPdfToInput(allowed, file), 'attached');
    } finally {
      h.dom.window.close();
    }
  });

  test(`${kind}: preserves an existing user file without events, callback or undo marking`, async () => {
    const h = harness(`<input type="file" aria-label="${label}">`);
    try {
      const original = new h.win.File(['user document'], 'my-document.pdf');
      h.input().files = h.files(original);
      let writes = 0;
      h.input().addEventListener('change', () => writes++);
      await h.api.withPrefillUndo(async () =>
        assert.equal(
          h.attach(kind, undefined, () => writes++),
          'already_present'
        )
      );
      assert.equal(h.input().files?.[0], original);
      assert.equal(writes, 0);
      assert.equal(h.api.getPrefillUndoState().available, false);
    } finally {
      h.dom.window.close();
    }
  });

  for (const rejection of [
    'setter ignores',
    'setter throws',
    'input clears',
    'change clears',
    'change replaces',
  ]) {
    test(`${kind}: synchronous portal rejection (${rejection}) never reports attachment`, async () => {
      const h = harness(`<input type="file" aria-label="${label}">`);
      try {
        const input = h.input();
        if (rejection.startsWith('setter')) {
          const descriptor = Object.getOwnPropertyDescriptor(
            h.win.HTMLInputElement.prototype,
            'files'
          )!;
          Object.defineProperty(input, 'files', {
            get: () => descriptor.get!.call(input),
            set: () => {
              if (rejection === 'setter throws')
                throw new Error('Portal rejected assignment');
            },
          });
        } else {
          input.addEventListener(
            rejection.startsWith('input') ? 'input' : 'change',
            () => {
              if (rejection === 'change replaces')
                input.files = h.files(new h.win.File(['other'], 'portal.pdf'));
              else input.value = '';
            }
          );
        }
        let callbacks = 0;
        await h.api.withPrefillUndo(async () =>
          assert.equal(
            h.attach(kind, undefined, () => callbacks++),
            'unsupported'
          )
        );
        assert.equal(callbacks, 0);
        if (rejection !== 'change replaces')
          assert.equal(h.api.getPrefillUndoState().available, false);
      } finally {
        h.dom.window.close();
      }
    });
  }

  for (const relation of ['aria-labelledby', 'aria-describedby', 'label']) {
    for (const scope of ['frame', 'shadow']) {
      test(`${kind}: resolves ${relation} in its own ${scope} despite duplicate outer IDs`, () => {
        const other = kind === 'resume' ? 'Cover letter' : 'Resume';
        const h = harness(
          `<span id="caption">${other}</span><label for="upload">${other}</label><iframe></iframe><div id="host"></div>`
        );
        try {
          const root =
            scope === 'frame'
              ? h.win.document.querySelector('iframe').contentDocument.body
              : h.win.document
                  .querySelector('#host')
                  .attachShadow({ mode: 'open' });
          root.innerHTML =
            relation === 'label'
              ? `<label for="upload">${label}</label><input id="upload" type="file">`
              : `<span id="caption">${label}</span><input id="upload" type="file" ${relation}="caption">`;
          assert.equal(h.attach(kind, root), 'attached');
          assert.equal(root.querySelector('input').files.length, 1);
        } finally {
          h.dom.window.close();
        }
      });
    }
  }

  test(`${kind}: rejects picker inside an inactive shadow host`, () => {
    const h = harness('<div hidden id="host"></div>');
    try {
      const root = h.win.document
        .querySelector('#host')
        .attachShadow({ mode: 'open' });
      root.innerHTML = `<input type="file" aria-label="${label}">`;
      assert.equal(h.attach(kind), 'unsupported');
      assert.equal(root.querySelector('input').files.length, 0);
    } finally {
      h.dom.window.close();
    }
  });
}

for (const label of [
  '',
  'Supporting document',
  'Work sample',
  'CoverLetter',
  'cover_letter',
  'Letter of interest',
  'Résumé / Cover letter',
  'Curriculum vitae / Cover letter',
]) {
  test(`resume: does not guess an ambiguous or non-resume upload (${label || 'unlabelled'})`, () => {
    const h = harness(
      `<input type="file" aria-label="${label}" accept="application/pdf">`
    );
    try {
      assert.equal(h.attach('resume'), 'not_found');
      assert.equal(h.input().files?.length, 0);
    } finally {
      h.dom.window.close();
    }
  });
}

test('separate labels in one field group do not contaminate document classification', () => {
  const h = harness(
    '<div class="form-group"><label for="r">Resume</label><input id="r" type="file"><label for="c">Cover letter</label><input id="c" type="file"></div>'
  );
  try {
    assert.equal(h.attach('resume'), 'attached');
    assert.equal(h.attach('cover'), 'attached');
    assert.equal(
      h.win.document.querySelector('#r').files[0].name,
      resume.filename
    );
    assert.equal(
      h.win.document.querySelector('#c').files[0].name,
      cover.filename
    );
  } finally {
    h.dom.window.close();
  }
});

for (const label of [
  'Résumé / Cover letter',
  'Curriculum vitae / Cover letter',
  'Cover letter / Headshot',
]) {
  test(`cover: does not guess a mixed document label (${label})`, () => {
    const h = harness(`<input type="file" aria-label="${label}">`);
    try {
      assert.equal(h.attach('cover'), 'not_found');
    } finally {
      h.dom.window.close();
    }
  });
}

test('nearby resume upload cannot label a following generic document picker', () => {
  const h = harness(
    '<div><label>Resume<input type="file" disabled></label></div><div><input type="file"></div>'
  );
  try {
    assert.equal(h.attach('resume'), 'unsupported');
    assert.equal(h.win.document.querySelectorAll('input')[1].files.length, 0);
  } finally {
    h.dom.window.close();
  }
});

test('generated attachments are required and cover letters must match current content', () => {
  const h = harness(
    '<input type="file" aria-label="Resume"><input type="file" aria-label="Cover letter">'
  );
  try {
    assert.equal(
      h.api.attachGeneratedResume(h.win.document.body),
      'not_requested'
    );
    assert.equal(
      h.api.attachGeneratedCoverLetter(
        h.win.document.body,
        undefined,
        'job-content'
      ),
      'not_requested'
    );
    for (const hash of [undefined, 'another-job']) {
      assert.equal(
        h.api.attachGeneratedCoverLetter(h.win.document.body, cover, hash),
        'source_mismatch'
      );
    }
    for (const input of h.win.document.querySelectorAll('input'))
      assert.equal(input.files.length, 0);
  } finally {
    h.dom.window.close();
  }
});

test('SmartRecruiters nested resume picker uses its explicit host marker, not the Easy Apply import', () => {
  const h = harness(
    '<spl-dropzone data-test="apply-with-resume-container"></spl-dropzone><spl-dropzone data-test="resume-upload"></spl-dropzone>'
  );
  try {
    const hosts = h.win.document.querySelectorAll('spl-dropzone');
    for (const host of hosts)
      host.attachShadow({ mode: 'open' }).innerHTML =
        '<label for="file-input">Choose a file</label><input id="file-input" type="file">';
    assert.equal(h.attach('resume'), 'attached');
    assert.equal(hosts[0].shadowRoot.querySelector('input').files.length, 0);
    assert.equal(hosts[1].shadowRoot.querySelector('input').files.length, 1);
  } finally {
    h.dom.window.close();
  }
});
