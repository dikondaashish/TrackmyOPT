import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { isApplicationSuccessPage } from '../src/job-portal-application-success';

const { JSDOM } = createRequire(resolve('package.json'))('jsdom');
const hosts = [
  ['acme.myworkdayjobs.com', 'data-automation-id="applicationSubmitted"'],
  ['job-boards.greenhouse.io', 'id="application_confirmation"'],
  ['jobs.lever.co', 'class="thanks"'],
  ['jobs.ashbyhq.com', 'data-testid="application-success"'],
  ['jobs.smartrecruiters.com', 'data-test="application-success"'],
  ['www.linkedin.com', 'role="dialog"'],
] as const;

for (const [host, marker] of hosts) test(`${host} requires a platform confirmation root outside an active form`, () => {
  const dom = new JSDOM(`<main><div ${marker}><h1>Thank you for applying</h1></div></main>`, { url: `https://${host}/apply` });
  try {
    assert.equal(isApplicationSuccessPage(dom.window.document), true);
    dom.window.document.querySelector(`[${marker.split('=')[0]}]`)!.removeAttribute(marker.split('=')[0]);
    assert.equal(isApplicationSuccessPage(dom.window.document), false, 'a generic main heading is insufficient');
    dom.window.document.querySelector('main > div')!.setAttribute(marker.split('=')[0], marker.split('"')[1]);
    dom.window.document.querySelector('main')!.insertAdjacentHTML('beforeend',
      '<form><input name="email"><button type="submit">Submit Application</button></form>');
    assert.equal(isApplicationSuccessPage(dom.window.document), false);
    dom.window.document.querySelector('button')!.type = 'button';
    assert.equal(isApplicationSuccessPage(dom.window.document), false,
      'Lever and Ashby may use a type=button submission control');
    dom.window.document.querySelector('form')!.remove();
    dom.window.document.querySelector('h1')!.setAttribute('hidden', '');
    assert.equal(isApplicationSuccessPage(dom.window.document), false);
  } finally { dom.window.close(); }
});

test('job-description copy and broad congratulations do not mark an application Applied', () => {
  const dom = new JSDOM('<main><h1>Software Engineer</h1><p>Thank you for applying is what we will say later.</p></main>',
    { url: 'https://jobs.lever.co/acme/123' });
  try {
    assert.equal(isApplicationSuccessPage(dom.window.document), false);
    dom.window.document.querySelector('h1')!.textContent = 'Congratulations on your new opportunity';
    assert.equal(isApplicationSuccessPage(dom.window.document), false);
  } finally { dom.window.close(); }
});
