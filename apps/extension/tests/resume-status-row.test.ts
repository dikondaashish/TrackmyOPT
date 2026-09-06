import assert from 'node:assert/strict';
import test from 'node:test';

import {
  RESUME_STATUS_COPY,
  RESUME_STATUS_ROW_CLASS,
  isResumeStatusAttached,
  prefillEntryCopy,
  resumeStatusAfterPrefill,
  type ResumeStatusState,
} from '../src/resume-status-row';

test('the row reports what happened to the file, not what was offered', () => {
  // A resume can resolve for this posting and still not attach: the upload
  // field may be on a later step of the application.
  assert.deepEqual(
    resumeStatusAfterPrefill({ attachedCount: 1, hasResume: true }),
    { state: 'attached' },
  );

  const notAttached = resumeStatusAfterPrefill({ attachedCount: 0, hasResume: true });
  assert.equal(notAttached.state, 'ready');
  assert.match(String(notAttached.detail), /upload field/i);

  assert.deepEqual(
    resumeStatusAfterPrefill({ attachedCount: 0, hasResume: false }),
    { state: 'none' },
  );
});

test('an attached row is not downgraded by a later availability re-check', () => {
  const attached = { dataset: { resumeStatus: 'attached' } } as unknown as HTMLElement;
  const ready = { dataset: { resumeStatus: 'ready' } } as unknown as HTMLElement;
  assert.equal(isResumeStatusAttached(attached), true);
  assert.equal(isResumeStatusAttached(ready), false);
  assert.equal(isResumeStatusAttached(null), false);
});

test('every state has copy, and only a real attachment claims success', () => {
  const states: ResumeStatusState[] = ['checking', 'none', 'ready', 'attached'];
  for (const state of states) {
    const copy = RESUME_STATUS_COPY[state];
    assert.ok(copy.label.trim(), `${state} needs a label`);
    assert.ok(copy.sublabel.trim(), `${state} needs a sublabel`);
  }
  // "checking" and "none" must never read as success — a green row is the
  // signal a user relies on before submitting an application.
  assert.equal(RESUME_STATUS_COPY.checking.tone, 'muted');
  assert.equal(RESUME_STATUS_COPY.none.tone, 'muted');
  assert.equal(RESUME_STATUS_COPY.ready.tone, 'success');
  assert.equal(RESUME_STATUS_COPY.attached.tone, 'success');

  // Only the attached state may state the file is on the form.
  assert.match(RESUME_STATUS_COPY.attached.label, /attached/i);
  assert.doesNotMatch(RESUME_STATUS_COPY.ready.label, /attached/i);
});

test('every Prefill entry point describes the same action the same way', () => {
  const withResume = prefillEntryCopy(true);
  const withoutResume = prefillEntryCopy(false);

  // Only the resume variant may promise an attachment.
  assert.match(withResume.label, /resume/i);
  assert.match(withResume.sublabel, /resume/i);
  assert.doesNotMatch(withoutResume.label, /resume/i);
  assert.doesNotMatch(withoutResume.sublabel, /resume/i);

  // The in-page widget is 320px wide; a longer sublabel wraps to a second line
  // and pushes the panel taller on a height-constrained job page.
  for (const copy of [withResume, withoutResume]) {
    assert.ok(
      copy.sublabel.length <= 36,
      `sublabel too long for the 320px widget: ${copy.sublabel}`,
    );
    assert.ok(copy.title.length > copy.sublabel.length, 'title carries the detail');
  }
});

test('the popup and the widget read from the same copy source', () => {
  const fs = require('node:fs') as typeof import('node:fs');
  for (const file of ['src/home.ts', 'src/job-portal-tracker-widget.ts']) {
    const source = fs.readFileSync(file, 'utf8');
    assert.match(
      source,
      /prefillEntryCopy/,
      `${file} must label its Prefill control from the shared copy`,
    );
    assert.doesNotMatch(
      source,
      /'Prefill application \+ resume'/,
      `${file} must not hardcode Prefill copy alongside the shared source`,
    );
  }
});

test('the widget mounts the row by its shared class name', () => {
  const source = require('node:fs').readFileSync('src/job-portal-tracker-widget.ts', 'utf8');
  assert.match(
    source,
    /const resumeStatusRow = createResumeStatusRow\(\);[\s\S]{0,200}toolsPanel\.appendChild\(resumeStatusRow\)/,
    'the status row must be mounted above the Prefill button',
  );
  assert.equal(RESUME_STATUS_ROW_CLASS, 'tmo-resume-status-row');
});
