import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { createUploadProbe, waitForUploadEvidence, type UploadEvidence } from '../src/upload-verification';
import { resumeStatusAfterPrefill } from '../src/resume-status-row';

async function simulate(probe: (time: number) => Partial<UploadEvidence>, cancelAt = Infinity, timeoutMs = 3000) {
  let time = 0;
  const result = await waitForUploadEvidence({
    probe: () => ({ accepted: false, busy: false, rejected: false, signature: 'form', ...probe(time) }),
    current: () => time < cancelAt,
    now: () => time,
    sleep: async ms => { time += ms; },
    timeoutMs,
  });
  return { result, time };
}
test('file selection alone never confirms acceptance', async () => {
  assert.equal((await simulate(() => ({}))).result, 'unverified');
});
test('parser changes extend settlement even after an acceptance marker appears', async () => {
  const actual = await simulate(time => ({ accepted: true, busy: time < 800, signature: time < 1200 ? 'old fields' : 'parsed fields' }));
  assert.equal(actual.result, 'verified');
  assert.equal(actual.time, 1800);
});
test('transient acceptance cannot finish verification', async () => {
  assert.equal((await simulate(time => ({ accepted: time % 500 < 200 }))).result, 'unverified');
});
test('rejection wins over acceptance; stuck parsing times out; navigation cancels', async () => {
  assert.equal((await simulate(() => ({ accepted: true, rejected: true }))).result, 'rejected');
  assert.equal((await simulate(() => ({ busy: true }))).result, 'timed_out');
  assert.equal((await simulate(() => ({ busy: true }), 400)).result, 'cancelled');
});
test('DOM evidence is scoped to the same file and ignores hidden or unrelated errors', () => {
  const { JSDOM } = createRequire(resolve('package.json'))('jsdom');
  const dom = new JSDOM('<form><div class="application-field"><input type="file"><span class="resume-upload-success">other.pdf</span><span class="resume-upload-failure" hidden>Invalid file</span></div><div class="resume-upload-failure">Upload error</div></form>', { url: 'https://jobs.lever.co/example/apply' });
  const doc = dom.window.document;
  const input = doc.querySelector('input');
  Object.defineProperty(input, 'files', { value: [{ name: 'demo.pdf' }] });
  const probe = createUploadProbe(input, doc.querySelector('form'), 'lever');
  assert.equal(probe().accepted, false);
  assert.equal(probe().rejected, false);
  doc.querySelector('.resume-upload-success').textContent = 'demo.pdf';
  assert.equal(probe().accepted, true);
  doc.querySelector('[hidden]').hidden = false;
  assert.equal(probe().rejected, true);
  dom.window.close();
});
test('status never reports a rejected or unverified file as attached', () => {
  for (const verification of ['unverified','rejected','timed_out','cancelled'] as const) {
    const status = resumeStatusAfterPrefill({ attachedCount: 1, hasResume: true, verification });
    assert.notEqual(status.state, 'attached');
    assert.ok(status.detail);
  }
});

test('a form-level parser busy state cannot be missed while success text is visible',()=>{
  const {JSDOM}=createRequire(resolve('package.json'))('jsdom');
  const dom=new JSDOM('<form aria-busy="true"><div class="application-field"><input type="file"><span class="resume-upload-success">demo.pdf</span></div></form>');
  const input=dom.window.document.querySelector('input');Object.defineProperty(input,'files',{value:[{name:'demo.pdf'}]});
  const probe=createUploadProbe(input,dom.window.document.querySelector('form'),'lever');
  assert.equal(probe().accepted,true);assert.equal(probe().busy,true);
  dom.window.close();
});
