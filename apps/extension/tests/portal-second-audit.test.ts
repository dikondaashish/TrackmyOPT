import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import vm from 'node:vm';
const local = createRequire(resolve('package.json'));
const { JSDOM } = local('jsdom');
const code = local('esbuild').buildSync({
  stdin: {
    contents:
      "export * from './easy-apply-engine'; export * from './easy-apply-dom'; export * from './ats-prefill-adapters'; export * from './easy-apply-matchers'; export * from './application-field-scan'; export * from './job-portal-prefill-coverage-ui';",
    resolveDir: resolve('src'),
  },
  bundle: true,
  write: false,
  format: 'cjs',
  platform: 'node',
}).outputFiles[0].text;
function setup(
  t: any,
  html: string,
  url = 'https://jobs.ashbyhq.com/example/job/application'
) {
  const dom = new JSDOM(html, { url });
  t.after(() => dom.window.close());
  const w = dom.window;
  w.HTMLElement.prototype.getBoundingClientRect = () => ({
    width: 100,
    height: 30,
  });
  const module = { exports: {} as any };
  vm.runInNewContext(code, {
    module,
    exports: module.exports,
    window: w,
    document: w.document,
    HTMLElement: w.HTMLElement,
    HTMLInputElement: w.HTMLInputElement,
    HTMLSelectElement: w.HTMLSelectElement,
    HTMLTextAreaElement: w.HTMLTextAreaElement,
  });
  return { w, d: w.document, api: module.exports };
}
test('Ashby upload-only application panel is found without mistaking Overview or importer for a form', (t) => {
  const h = setup(
    t,
    '<div role="tabpanel" id="overview">Overview</div><div role="tabpanel" aria-labelledby="job-application-form" id="form"><label for="resume">Resume</label><input id="resume" type="file"></div>'
  );
  assert.equal(h.api.selectAtsPrefillAdapter(h.d).id, 'ashby');
  assert.equal(h.api.findApplicationForm()?.id, 'form');
});
test('Cherry plain Name with machine name and placeholder is classified safely', t => {
 const h=setup(t,'<div class="ashby-application-form-field-entry" data-field-path="_systemfield_name"><label class="ashby-application-form-question-title">Name</label><input name="_systemfield_name" placeholder="Type here..."></div>');
 assert.equal(h.api.classifyField(h.api.getLabelText(h.d.querySelector('input'))),'fullName');
});
test('Cherry scan counts required city, radio and yes/no groups, excluding resume importer', t => {
 const h=setup(t,`<div class="ashby-application-form-autofill-input-root"><input type="file"></div><div class="ashby-application-form-field-entry"><label class="ashby-application-form-question-title _required_x_1">Location</label><input role="combobox" placeholder="Start typing..."></div><fieldset class="ashby-application-form-input-radio-group"><label class="ashby-application-form-question-title _required_x_1">Are you legally authorized to work?</label><input type="radio" name="auth" id="yes"><label for="yes">Yes</label><input type="radio" name="auth"></fieldset><div class="ashby-application-form-field-entry"><label class="ashby-application-form-question-title _required_x_1">Are you currently employed?</label><div class="ashby-application-form-input-yesno"><button aria-pressed="false">Yes</button><button aria-pressed="true">No</button><input type="checkbox" style="display:none"></div></div>`);
 const scan=h.api.scanApplicationFields(h.d.body);
 assert.equal(scan.requiredTotal,3); assert.equal(scan.optionalTotal,0); assert.equal(scan.requiredFilled,1);
 assert.equal(scan.required[1].label,'Are you legally authorized to work?');
});
test('coverage painter sets readable line height even inside zero-line-height host',t=>{
 const h=setup(t,'<div id="line" style="line-height:0"></div>');
 const line=h.d.querySelector('#line');
 h.api.paintPrefillCoverage(line,{total:1,skipped:1,filled:0,groups:Object.fromEntries(['resume','cover_letter','contact','skills','experience','education'].map(key=>[key,{filled:0,skipped:0,total:0}])),applicationScan:h.api.summarizeApplicationFields([{key:'name',label:'Name',required:true,filled:false}])});
 assert.notEqual(line.style.lineHeight,'0');
});
test('Ashby adapter rejects a spoofed host', (t) => {
  const h = setup(t, '', 'https://jobs.ashbyhq.com.evil.example/application');
  assert.equal(h.api.selectAtsPrefillAdapter(h.d).id, 'generic');
});
test('Ashby city input reads only its own question label', (t) => {
  const h = setup(
    t,
    '<div class="ashby-application-form-field-entry" data-field-path="_systemfield_location"><label class="ashby-application-form-question-title" for="_systemfield_location">Where are you currently located?</label><div><input role="combobox" aria-autocomplete="list" placeholder="Start typing..."></div></div>'
  );
  assert.equal(
    h.api.classifyField(h.api.getLabelText(h.d.querySelector('input'))),
    'location'
  );
});
test('Ashby contact Prefill works in the application tab panel', async (t) => {
  const h = setup(
    t,
    '<div role="tabpanel" aria-labelledby="job-application-form" id="form"><label for="name">Legal Name</label><input id="name"><label for="email">Email</label><input id="email" type="email"></div>'
  );
  await h.api.runPrefill({
    profileFallback: { fullName: 'Test Applicant', email: 'test@example.test' },
    quietResultToast: true,
    animateFields: false,
  });
  assert.equal(h.d.querySelector('#email').value, 'test@example.test');
  assert.equal(h.d.querySelector('#name').value, 'Test Applicant');
});
for (const wrapper of [
  '<fieldset disabled>',
  '<div inert>',
  '<div aria-hidden="true">',
  '<div aria-disabled="true">',
])
  test(`contact controls respect ancestor ${wrapper}`, (t) => {
    const h = setup(
      t,
      `${wrapper}<input aria-label="Email"><select aria-label="Country"><option value="">Select</option><option value="US">United States</option></select>${wrapper.startsWith('<fieldset') ? '</fieldset>' : '</div>'}`
    );
    assert.equal(h.api.isFillable(h.d.querySelector('input')), false);
    assert.equal(h.api.isFillableSelect(h.d.querySelector('select')), false);
  });
test('disabled fieldset first-legend exception remains fillable', (t) => {
  const h = setup(
    t,
    '<fieldset disabled><legend><input aria-label="Email"></legend><input></fieldset>'
  );
  assert.equal(h.api.isFillable(h.d.querySelector('legend input')), true);
});
test('native dropdown ignores disabled optgroups and duplicate storage values', (t) => {
  for (const options of [
    '<optgroup disabled><option value="US">United States</option></optgroup>',
    '<option value="US">Canada</option><option value="US">United States</option>',
  ]) {
    const h = setup(
      t,
      `<select><option value="">Select</option>${options}</select>`
    );
    assert.equal(
      h.api.matchingSelectValue(
        h.d.querySelector('select'),
        'country',
        'United States'
      ),
      null
    );
  }
});
test('a real selected answer containing choose is never mistaken for a placeholder', (t) => {
  const h = setup(
    t,
    '<select><option value="user" selected>I choose not to disclose</option></select>'
  );
  assert.equal(h.api.isFillableSelect(h.d.querySelector('select')), false);
});
test('a disabled but previously selected real answer is preserved', (t) => {
  const h = setup(t, '<select><option value="CA" selected disabled>Canada</option><option value="US">United States</option></select>');
  assert.equal(h.api.isFillableSelect(h.d.querySelector('select')), false);
});

test('contact fields rejected synchronously by a portal are not reported filled', async (t) => {
  const h = setup(
    t,
    '<form id="application-form"><input aria-label="Email" type="email"><select aria-label="Country"><option value="">Select</option><option value="US">United States</option></select></form>'
  );
  for (const el of h.d.querySelectorAll('input,select'))
    el.addEventListener('change', () => {
      el.value = '';
    });
  const result = await h.api.runPrefill({
    profileFallback: { email: 'test@example.test', country: 'United States' },
    quietResultToast: true,
    animateFields: false,
  });
  assert.equal(result.groups.contact.filled, 0);
});
test('Workday split month/year labels take precedence over their startDate container signal', (t) => {
  const h = setup(
    t,
    '<main><section data-automation-id="workExperienceCard"><input aria-label="Start month" data-automation-id="startDate"><input aria-label="Start year" data-automation-id="startDate"></section></main>'
  );
  const fields = h.api.workdayPrefillAdapter
    .classifyRepeatableSections(h.d.querySelector('main'))
    .map((c: any) => c.field);
  assert.deepEqual(Array.from(fields), ['startMonth', 'startYear']);
});
