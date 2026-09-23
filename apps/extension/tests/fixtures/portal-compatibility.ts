import { runPrefill } from '../../src/easy-apply-engine';
import { fillConfirmedSensitiveAnswers } from '../../src/sensitive-autofill';
import { scanApplicationFields } from '../../src/application-field-scan';
import { paintPrefillCoverage } from '../../src/job-portal-prefill-coverage-ui';
import { emptyPrefillCoverage } from '../../src/prefill-coverage';
import { resumeStatusAfterPrefill } from '../../src/resume-status-row';
import { selectSmartDropdown } from '../../src/smart-dropdown';
import { workdayPrefillAdapter } from '../../src/ats-prefill-adapters';
import { fillRepeatableRecords } from '../../src/repeatable-record-engine';
import {
  attachGeneratedResume,
  attachGeneratedCoverLetter,
} from '../../src/easy-apply-attachments';
import { findApplicationForm } from '../../src/easy-apply-form';
import { withPrefillUndo, undoLastPrefill } from '../../src/prefill-undo';

const fixture = document.querySelector<HTMLElement>('#fixture')!;
const checks = document.querySelector('#checks')!;
const result = document.querySelector('#result')!;
const button = document.querySelector<HTMLButtonElement>('#run')!;
const profile = {
  firstName: 'Test',
  lastName: 'Applicant',
  email: 'test@example.test',
  city: 'New York',
  state: 'NY',
  country: 'United States',
};
const context = { countryName: 'United States', stateName: 'NY' };
const tests: Array<[string, () => Promise<void> | void]> = [];
function check(value: unknown, message: string) {
  if (!value) throw new Error(message);
}
function mount(html: string) {
  fixture.innerHTML = html;
}
function lever(options = ['New York, NY, United States'], reject = false) {
  mount(
    '<form id="application-form"><label>Full name<input name="name"></label><label>Email<input name="email" type="email"></label><label for="location-input">Current location</label><div class="application-field"><input class="location-input" data-qa="location-input" id="location-input" name="location" required><input type="hidden" name="selectedLocation"><div class="dropdown-results"></div></div></form>'
  );
  const input = fixture.querySelector<HTMLInputElement>('#location-input')!;
  const selected = fixture.querySelector<HTMLInputElement>(
    '[name=selectedLocation]'
  )!;
  const list = fixture.querySelector('.dropdown-results')!;
  input.addEventListener('input', () => {
    list.replaceChildren();
    if (input.value !== 'New York') return;
    setTimeout(() => {
      if (input.value !== 'New York') return;
      for (const text of options) {
        const option = document.createElement('div');
        option.textContent = text;
        option.onclick = () => {
          if (reject) return;
          input.value = text;
          selected.value = 'test-place';
          list.replaceChildren();
        };
        list.append(option);
      }
    }, 15);
  });
  return { input, selected };
}
tests.push([
  'Lever-shaped form: production Prefill selects a committed city and contact fields',
  async () => {
    const h = lever();
    await runPrefill({
      profileFallback: profile,
      quietResultToast: true,
      animateFields: false,
    });
    check(h.selected.value === 'test-place', 'City was not committed');
    check(
      fixture.querySelector<HTMLInputElement>('[name=email]')!.value ===
        profile.email,
      'Email missing'
    );
  },
]);
tests.push([
  'Unmatched cities stay blank; unrelated dropdowns are untouched',
  async () => {
    const h = lever(['New York, England, United Kingdom']);
    const other = document.createElement('div');
    other.setAttribute('role', 'option');
    other.textContent = 'New York';
    fixture.append(other);
    let clicked = false;
    other.onclick = () => {
      clicked = true;
    };
    check(
      (
        await selectSmartDropdown(
          h.input,
          'New York',
          'location',
          undefined,
          80,
          context
        )
      ).outcome === 'no_match',
      'Wrong-city result'
    );
    check(
      !clicked && !h.input.value && !h.selected.value,
      'Wrong selection or misleading text'
    );
  },
]);
tests.push([
  'Ignored portal option clicks are not counted as success',
  async () => {
    const h = lever(undefined, true);
    check(
      (
        await selectSmartDropdown(
          h.input,
          'New York',
          'location',
          undefined,
          80,
          context
        )
      ).outcome === 'no_match',
      'False success'
    );
    check(!h.input.value && !h.selected.value, 'Rejected text remains');
  },
]);
tests.push([
  'Cancellation prevents a late city selection',
  async () => {
    const h = lever();
    let active = true;
    h.input.addEventListener('input', () => {
      active = false;
    });
    await selectSmartDropdown(h.input, 'New York', 'location', undefined, 80, {
      ...context,
      shouldContinue: () => active,
    });
    check(!h.selected.value && !h.input.value, 'Cancelled field was filled');
  },
]);
tests.push([
  'In-progress user city edits are preserved',
  async () => {
    const h = lever();
    h.input.value = 'My own city';
    await selectSmartDropdown(
      h.input,
      'New York',
      'location',
      undefined,
      80,
      context
    );
    check(
      h.input.value === 'My own city' && !h.selected.value,
      'User edit overwritten'
    );
  },
]);
tests.push([
  'SmartRecruiters-shaped nested components: labels and asynchronous city options',
  async () => {
    mount(
      '<form id="application-form"><spl-input label="First name"></spl-input><spl-autocomplete></spl-autocomplete></form><div id="cities"><div role="option">New York</div></div>'
    );
    const first = fixture
      .querySelector('spl-input')!
      .attachShadow({ mode: 'open' });
    first.innerHTML = '<input>';
    const outer = fixture
      .querySelector('spl-autocomplete')!
      .attachShadow({ mode: 'open' });
    outer.innerHTML =
      '<spl-input label="City"></spl-input><div id="cities" role="listbox"></div>';
    const inner = outer
      .querySelector('spl-input')!
      .attachShadow({ mode: 'open' });
    inner.innerHTML =
      '<input role="combobox" aria-controls="cities" aria-autocomplete="list" aria-expanded="false">';
    const city = inner.querySelector('input')!;
    city.addEventListener('input', () => {
      if (city.value !== 'New York') return;
      setTimeout(() => {
        const option = document.createElement('spl-select-option');
        option.setAttribute('value', 'test-new-york');
        option.textContent = 'New York, NY, US';
        option.onclick = () => {
          city.value = option.textContent!;
          city.setAttribute('aria-expanded', 'false');
          outer.querySelector('#cities')!.replaceChildren();
        };
        outer.querySelector('#cities')!.replaceChildren(option);
      }, 15);
    });
    await runPrefill({
      profileFallback: profile,
      quietResultToast: true,
      animateFields: false,
    });
    check(
      first.querySelector('input')!.value === 'Test',
      'Component label not read'
    );
    check(city.value === 'New York, NY, US', 'Nested city not selected');
  },
]);
tests.push([
  'Workday records: correct grouping, month precision, zero-based month IDs, and undo',
  async () => {
    mount(
      '<section data-automation-id="workExperienceCard"><div data-automation-id="formField"><label>Company<input></label></div><div data-automation-id="formField"><label>Start date<input type="month"></label></div><label>Start month<select><option value="">Choose</option><option value="2">March</option><option value="3">April</option></select></label><label>End date<input type="date"></label></section>'
    );
    const controls = workdayPrefillAdapter.classifyRepeatableSections(fixture);
    const snapshot: any = {
      contact: {},
      skills: [],
      certifications: [],
      education: [],
      experience: [
        {
          company: 'Test Employer',
          title: 'Engineer',
          startDate: { precision: 'month', year: 2022, month: 3 },
          endDate: { precision: 'month', year: 2023, month: 4 },
        },
      ],
    };
    await withPrefillUndo(async () => {
      const filled = fillRepeatableRecords('experience', controls, snapshot);
      check(filled.filledFields === 3, 'Wrong field count or grouping');
    });
    check(
      fixture.querySelector<HTMLInputElement>('[type=month]')!.value ===
        '2022-03',
      'Month precision wrong'
    );
    check(
      fixture.querySelector('select')!.value === '2',
      'Wrong month selected'
    );
    check(
      !fixture.querySelector<HTMLInputElement>('[type=date]')!.value,
      'Invented a day'
    );
    check(undoLastPrefill().restored === 3, 'History undo failed');
  },
]);
tests.push([
  'PDF attachments use correct fields, respect inactive steps, and keep existing files',
  () => {
    mount(
      '<section hidden><input type="file" aria-label="Resume"></section><div class="form-group"><label for="resume">Resume</label><input id="resume" type="file"><label for="cover">Cover letter</label><input id="cover" type="file"></div><input id="other" type="file">'
    );
    const pdf = btoa('%PDF-1.7\nSynthetic document\n%%EOF');
    check(
      attachGeneratedResume(fixture, {
        pdfBase64: pdf,
        filename: 'test.pdf',
      }) === 'attached',
      'Resume missing'
    );
    check(
      attachGeneratedResume(fixture, {
        pdfBase64: pdf,
        filename: 'other.pdf',
      }) === 'already_present',
      'Existing document overwritten'
    );
    check(
      attachGeneratedCoverLetter(
        fixture,
        {
          base64: pdf,
          filename: 'cover.pdf',
          sourceContentHash: 'test-job',
        } as any,
        'test-job'
      ) === 'attached',
      'Cover missing'
    );
    check(
      !fixture.querySelector<HTMLInputElement>('section input')!.files!.length,
      'Inactive step was filled'
    );
    check(
      !fixture.querySelector<HTMLInputElement>('#other')!.files!.length,
      'Unlabelled picker was filled'
    );
  },
]);
tests.push([
  'SmartRecruiters resume picker: correct shadow host, not Easy Apply importer',
  () => {
    mount(
      '<spl-dropzone data-test="apply-with-resume-container"></spl-dropzone><spl-dropzone data-test="resume-upload"></spl-dropzone>'
    );
    const hosts = fixture.querySelectorAll('spl-dropzone');
    for (const host of hosts)
      host.attachShadow({ mode: 'open' }).innerHTML =
        '<label for="file">Choose a file</label><input id="file" type="file">';
    check(
      attachGeneratedResume(fixture, {
        pdfBase64: btoa('%PDF-1.7\nTest\n%%EOF'),
        filename: 'test.pdf',
      }) === 'attached',
      'Nested resume missing'
    );
    check(
      hosts[0].shadowRoot!.querySelector('input')!.files!.length === 0,
      'Importer incorrectly used'
    );
    check(
      hosts[1].shadowRoot!.querySelector('input')!.files!.length === 1,
      'Correct picker missing'
    );
  },
]);
tests.push([
  'Multi-step discovery ignores inactive forms and recognizes an upload-only Workday step',
  () => {
    mount(
      '<form id="application-form" hidden><input aria-label="Email"></form><div data-automation-id="jobApplicationPage" id="active-step"><label>Resume<input type="file" hidden></label></div>'
    );
    check(findApplicationForm()?.id === 'active-step', 'Wrong step selected');
  },
]);
tests.push([
  'Ashby-shaped city question: delayed portaled menu commits the correct location',
  async () => {
    // The local form wrapper tests controls; host-specific tab-panel discovery
    // is separately covered by portal-second-audit.test.ts.
    mount(`<form id="application-form">
      <div class="ashby-application-form-field-entry">
        <label class="ashby-application-form-question-title" for="_systemfield_location">Where are you currently located?</label>
        <div><input role="combobox" aria-autocomplete="list" aria-haspopup="listbox" aria-expanded="false" placeholder="Start typing..."></div>
      </div>
      <label><input type="checkbox" id="agreement">I agree to the arbitration agreement</label>
      <label>When can you start a new role?<input type="date" id="availability"></label>
    </form><div id="ashby-options" role="listbox"></div>`);
    const city = fixture.querySelector<HTMLInputElement>('[role=combobox]')!;
    const menu = fixture.querySelector('#ashby-options')!;
    city.addEventListener('input', () => {
      if (city.value !== 'Worcester') return;
      setTimeout(() => {
        city.setAttribute('aria-controls', 'ashby-options');
        city.setAttribute('aria-expanded', 'true');
        for (const text of [
          'Worcester, England, United Kingdom',
          'Worcester, Massachusetts, United States',
        ]) {
          const option = document.createElement('div');
          option.setAttribute('role', 'option');
          option.textContent = text;
          option.onclick = () => {
            city.value = text;
            city.setAttribute('aria-expanded', 'false');
            menu.replaceChildren();
          };
          menu.append(option);
        }
      }, 25);
    });
    await runPrefill({
      profileFallback: {
        ...profile,
        city: 'Worcester',
        state: 'Massachusetts',
      },
      quietResultToast: true,
      animateFields: false,
    });
    check(
      city.value === 'Worcester, Massachusetts, United States',
      'City not selected correctly'
    );
    check(
      !fixture.querySelector<HTMLInputElement>('#agreement')!.checked,
      'Legal agreement was checked'
    );
    check(
      !fixture.querySelector<HTMLInputElement>('#availability')!.value,
      'Availability was invented'
    );
  },
]);
tests.push([
  'Disabled controls and optgroups are skipped; rejected contact values are not counted',
  async () => {
    mount(`<form id="application-form">
      <fieldset disabled><label>Email<input type="email" id="disabled-email"></label></fieldset>
      <div aria-disabled="true"><label>First name<input id="disabled-name"></label></div>
      <label>Country<select><option value="">Select</option><optgroup disabled><option value="US">United States</option></optgroup></select></label>
      <label>Email<input id="rejected-email" type="email"></label>
    </form>`);
    const rejected =
      fixture.querySelector<HTMLInputElement>('#rejected-email')!;
    rejected.addEventListener('change', () => {
      rejected.value = '';
    });
    const filled = await runPrefill({
      profileFallback: profile,
      quietResultToast: true,
      animateFields: false,
    });
    check(
      filled.groups.contact.filled === 0,
      'Rejected/disabled fields counted as success'
    );
    check(
      Array.from(
        fixture.querySelectorAll<HTMLInputElement | HTMLSelectElement>(
          'input,select'
        )
      ).every((el) => !el.value),
      'A protected field changed'
    );
  },
]);
tests.push([
  'Ashby-shaped attachment: resume picker is used, not the profile importer',
  () => {
    mount(`<div class="ashby-application-form-autofill-input-root"><input id="importer" type="file"></div>
      <div class="ashby-application-form-field-entry"><label for="_systemfield_resume">Resume</label>
      <div class="ashby-application-form-input-file"><input id="_systemfield_resume" type="file" style="position:absolute;clip:rect(0,0,0,0);width:1px;height:1px"></div></div>`);
    check(
      attachGeneratedResume(fixture, {
        pdfBase64: btoa('%PDF-1.7\nTest\n%%EOF'),
        filename: 'test.pdf',
      }) === 'attached',
      'Resume missing'
    );
    check(
      fixture.querySelector<HTMLInputElement>('#_systemfield_resume')!.files!
        .length === 1,
      'Resume picker empty'
    );
    check(
      !fixture.querySelector<HTMLInputElement>('#importer')!.files!.length,
      'Importer used incorrectly'
    );
  },
]);
tests.push([
  'Multi-step rerun: active step fills while earlier user edits and Next remain untouched',
  async () => {
    mount(
      '<form id="application-form"><label>Email<input type="email"></label><button id="next" type="button">Next</button></form>'
    );
    let navigated = false;
    fixture.querySelector<HTMLButtonElement>('#next')!.onclick = () => {
      navigated = true;
    };
    await runPrefill({
      profileFallback: profile,
      quietResultToast: true,
      animateFields: false,
    });
    const previous = fixture.querySelector('form')!;
    const email = previous.querySelector('input')!;
    check(email.value === profile.email, 'First step not filled');
    email.value = 'user-edited@example.test';
    previous.hidden = true;
    const step = document.createElement('div');
    step.setAttribute('data-automation-id', 'jobApplicationPage');
    step.innerHTML = '<label>First name<input></label>';
    fixture.append(step);
    await runPrefill({
      profileFallback: profile,
      quietResultToast: true,
      animateFields: false,
    });
    check(step.querySelector('input')!.value === 'Test', 'New step not filled');
    check(
      email.value === 'user-edited@example.test',
      'Earlier user edit changed'
    );
    check(!navigated, 'Prefill clicked Next');
  },
]);
tests.push(['Cherry regression: Name, saved radio answers, required scan, existing upload and readable rows', async () => {
  mount(`<style>.ashby-application-form-question-title._required_test:after{content:'*'} #coverage{line-height:0}</style>
  <form id="application-form">
    <div class="ashby-application-form-autofill-input-root"><input type="file"></div>
    <div class="ashby-application-form-field-entry" data-field-path="_systemfield_name"><label class="ashby-application-form-question-title _required_test">Name</label><input name="_systemfield_name" placeholder="Type here..."></div>
    <fieldset class="ashby-application-form-input-radio-group"><label class="ashby-application-form-question-title _required_test">Are you legally authorized to work in the United States?</label><input id="auth-y" name="auth" type="radio"><label for="auth-y">Yes</label><input id="auth-n" name="auth" type="radio"><label for="auth-n">No</label></fieldset>
    <fieldset class="ashby-application-form-input-radio-group"><label class="ashby-application-form-question-title _required_test">Will you require sponsorship?</label><input id="sponsor-y" name="sponsor" type="radio"><label for="sponsor-y">Yes</label><input id="sponsor-n" name="sponsor" type="radio"><label for="sponsor-n">No</label></fieldset>
    <div class="ashby-application-form-field-entry"><label class="ashby-application-form-question-title _required_test">Are you currently employed?</label><div class="ashby-application-form-input-yesno"><button type="button" aria-pressed="false">Yes</button><button type="button" aria-pressed="false">No</button><input type="checkbox" style="display:none"></div></div>
    <label for="resume-file">Resume</label><div class="ashby-application-form-input-file"><input id="resume-file" type="file" required><p class="ashby-application-form-input-file-item-name">Existing.pdf</p></div>
  </form><div id="coverage"></div>`);
  const filled=await runPrefill({profileFallback:profile,quietResultToast:true,animateFields:false,resume:{pdfBase64:btoa('%PDF-1.7\nTest'),filename:'Test_Applicant_Resume.pdf'}});
  check(fixture.querySelector<HTMLInputElement>('[name=_systemfield_name]')!.value==='Test Applicant','Name was not filled');
  let clicks=0; fixture.querySelectorAll('input[type=radio]').forEach(el=>el.addEventListener('click',()=>clicks++));
  await fillConfirmedSensitiveAnswers(fixture,{confirmed:true,workAuthorization:'yes',requiresSponsorship:'no'});
  check(fixture.querySelector<HTMLInputElement>('#auth-y')!.checked && fixture.querySelector<HTMLInputElement>('#sponsor-n')!.checked && clicks===2,'Private answers did not commit');
  check(filled.resumeAttachmentResult==='already_present','Existing upload not recognized');
  check(/already uploaded/.test(resumeStatusAfterPrefill({attachedCount:0,hasResume:true,attachmentResult:filled.resumeAttachmentResult}).detail||''),'Upload status misleading');
  const scan=scanApplicationFields(fixture.querySelector('form')!);
  check(scan.requiredTotal===5 && scan.requiredFilled===4 && scan.optionalTotal===0,'Required counts incorrect');
  const line=fixture.querySelector<HTMLElement>('#coverage')!;
  line.style.width='320px';
  line.style.maxWidth='100%';
  paintPrefillCoverage(line,{...emptyPrefillCoverage(),applicationScan:scan});
  line.querySelector('details')!.open=true;
  const rows=Array.from(line.querySelectorAll<HTMLElement>('details > div > div'));
  check(rows.every(el=>el.getBoundingClientRect().height>=16),'Scan rows collapsed');
  check(rows.slice(1).every((el,i)=>el.getBoundingClientRect().top>=rows[i].getBoundingClientRect().bottom),'Scan rows overlap');
}]);
document.addEventListener('submit', (event) => event.preventDefault());
button.onclick = async () => {
  button.disabled = true;
  checks.replaceChildren();
  let passed = 0;
  for (const [name, run] of tests) {
    result.textContent = `Checking ${passed + 1}/${tests.length}…`;
    const row = document.createElement('li');
    try {
      await run();
      row.textContent = `PASS — ${name}`;
      row.dataset.pass = 'true';
      passed++;
    } catch (error) {
      row.textContent = `FAIL — ${name}: ${error instanceof Error ? error.message : String(error)}`;
      row.dataset.pass = 'false';
    }
    checks.append(row);
  }
  result.textContent = `${passed}/${tests.length} browser checks passed`;
  button.disabled = false;
};
