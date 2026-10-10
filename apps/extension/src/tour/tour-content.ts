/** Fictional teaching content only. Never fetches account data or invokes AI. */
export const TOUR_CHAPTERS = [
  {
    label: 'Your starting point',
    title: 'Less repetition. More possibility.',
    text: 'Meet your application companion. Try a sample job, then find the tools that keep your OPT journey organized.',
    tip: 'About 3 minutes. Explore any section, or skip and come back from Product tour in the extension.',
  },
  {
    label: 'Try Prefill',
    title: 'One click. A head start.',
    text: 'Click Prefill to try the same contact-filling engine used on supported application pages. Edit a field and try again: your entry stays yours.',
    tip: 'On real applications, save your details in Your application profile first. Saved private answers and portal login details may also fill when you click Prefill. Always review before continuing.',
  },
  {
    label: 'Tailored resumes & AI',
    title: 'Give every application its own resume.',
    text: 'On a job page, choose Generate custom resume, select your source resume, and review the result before using it for that role.',
    tip: 'This is a prepared sample, not an AI generation. Real generation uses your resume and job description, with plan limits. Without a tailored resume, Prefill fills profile fields only.',
  },
  {
    label: 'Keep your jobs together',
    title: 'Save the role. Keep the context.',
    text: 'Use Add this job to tracker on a posting. Check the detected role and company before saving, then follow your progress in the dashboard.',
    tip: 'Saving a role does not apply for it. Update the stage as your application progresses.',
  },
  {
    label: 'OPT tools',
    title: 'Know where you are on your timeline.',
    text: 'OPT Apply Date helps you explore filing dates. OPT Clock helps you follow your employment timeline using the dates and history you save.',
    tip: 'These are illustrative days, not your immigration record. Enter accurate dates in the real tool and confirm filing requirements with your DSO and official guidance.',
  },
  {
    label: 'STEM OPT tools',
    title: 'Your next chapter, in view.',
    text: 'STEM Apply Date helps organize your extension filing timeline. STEM Clock helps track your timeline across OPT and STEM with your saved history.',
    tip: 'STEM does not mean ignoring earlier OPT history. Review the dates and employment records used by the real tools. These sample figures are not legal guidance.',
  },
  {
    label: 'Make it yours',
    title: 'You’re ready for your first real step.',
    text: 'Save your application profile, open a job application, and click Prefill. Keep control of every answer and every submission.',
    tip: 'Replay anytime from Product tour in the extension. The demo never saves profile details, sends an application, or uses AI credits.',
  },
] as const;

export function chapterMarkup(step: number): string {
  switch (step) {
    case 0:
      return `<div class="welcome-demo"><span class="eyebrow">YOUR OPT COMMAND CENTER</span><h2>A little setup.<br>A lot less typing.</h2><div class="journey"><p><span>01</span> Save your application profile</p><p><span>02</span> Tailor, prefill, and review</p><p><span>03</span> Follow your jobs and timelines</p></div><p class="sample-note">Everything in this tour is fictional. Your account stays unchanged.</p></div>`;
    case 1:
      return `<div class="application-layout"><form id="application-form" autocomplete="off"><span class="eyebrow">EXAMPLE CORP · SAMPLE APPLICATION</span><h2>Junior Data Analyst</h2><div class="fields"><label>First name<input name="first_name" autocomplete="off"></label><label>Last name<input name="last_name" autocomplete="off"></label><label class="wide">Email<input name="email" type="email" autocomplete="off"></label><label>Country<select name="country"><option value="">Select country</option><option value="US">United States</option><option value="IN">India</option></select></label><label>City<input name="city" autocomplete="off"></label></div><p class="sample-note">Try changing the first name after filling. Prefill will not replace it.</p></form><aside class="assistant-demo" aria-label="Demo application assistant"><div class="assistant-head">TrackMyOPT</div><div class="assistant-body"><span class="eyebrow">APPLICATION TOOLS</span><h3>Junior Data Analyst</h3><p>Example Corp</p><p class="profile-only">Sample profile ready</p><button class="primary" id="demo-action" type="button">Prefill this application</button><button class="quiet" id="demo-reset" type="button">Reset sample</button><p class="sample-note">No submit button. You stay in control.</p><div class="tmo-prefill-progress-slot"></div></div></aside></div>`;
    case 2:
      return `<div class="resume-demo"><div><span class="eyebrow">SOURCE RESUME + THIS JOB</span><h2>Put relevant experience first.</h2><p>Alex Taylor has experience with SQL, dashboards, and reporting. The sample role asks for the same skills.</p><button class="primary" id="demo-action" type="button">Preview tailored sample</button><details><summary>What does Analyze with AI do?</summary><p>It compares your resume with the role to identify fit and keyword gaps. Review its suggestions; it cannot guarantee an interview.</p></details><details><summary>What about application questions?</summary><p>On supported questions, Prefill may reuse a saved answer or insert an AI draft based on this job’s generated resume. Review the marked drafts and correct anything inaccurate.</p></details></div><article class="resume-paper" aria-label="Sample resume"><span class="eyebrow">PREPARED DEMO · NO AI CREDITS</span><h3>Alex Taylor</h3><p>Data Analyst</p><hr><h4>Experience</h4><p id="resume-bullet">Created weekly reports and maintained team dashboards.</p><h4>Skills</h4><p>SQL · Data visualization · Reporting</p><p class="sample-note" id="resume-note">Choose Preview to see the sample change.</p></article></div>`;
    case 3:
      return `<div class="tracker-demo"><span class="eyebrow">DEMO JOB TRACKER</span><h2>From interesting to in progress.</h2><div class="tracker-row"><div><h3>Junior Data Analyst</h3><p>Example Corp · Sample role</p></div><span id="job-stage" class="badge">Not saved</span></div><button class="primary" id="demo-action" type="button">Save sample job</button><div class="stages" aria-label="Example application stages"><span>Wishlist</span><span>Applied</span><span>Interview</span><span>Offer</span></div><p class="sample-note">Practice only. This does not create a tracker entry.</p></div>`;
    case 4:
    case 5:
      return `<div class="clock-demo ${step === 5 ? 'stem' : ''}"><span class="eyebrow">${step === 5 ? 'STEM OPT' : 'OPT'} · ILLUSTRATIVE TIMELINE</span><h2>Dates and history, together.</h2><div class="clock-reading"><span id="clock-value">21</span><div><b>sample days recorded</b><p>Not your balance or deadline</p></div></div><div class="timeline"><span>Start date</span><div class="timeline-track"><i></i></div><span>Today</span></div><button class="primary" id="demo-action" type="button">Show employment-history example</button><p id="clock-explanation" class="sample-note">A clock needs accurate start dates and employment history, not just the day you installed the extension.</p><details><summary>Apply Date or Clock: which one?</summary><p>Use Apply Date for filing-date planning. Use Clock for the employment timeline. You can open either from OPT tools in the extension.</p></details></div>`;
    default:
      return `<div class="finish-demo"><span class="eyebrow">YOUR NEXT STEP</span><h2>Set up once.<br>Start with confidence.</h2><p>Keep contact details, your optional portal login, and application answers together in your application profile.</p><a class="primary" data-route="/dashboard/extension">Set up my application profile ↗</a><div class="explore-links"><a data-route="/dashboard/case-status">Case status <span>Follow your saved USCIS cases ↗</span></a><a data-route="/dashboard/opt-tools">OPT &amp; STEM tools <span>Add your real dates ↗</span></a><a data-route="/dashboard/career/job-tracker">Job tracker <span>Organize your applications ↗</span></a><a data-route="/dashboard/help">Help &amp; support <span>Find answers and get help ↗</span></a></div><details><summary>Prefill modes, passwords, and safety</summary><p>Step-by-step fills when you click Prefill. Pro Continuous can reuse loaded answers on supported steps of the same application. Guided Autopilot is optional and stops before final submission. Passwords require an explicit Prefill click on a supported secure login form. Enter verification codes yourself.</p></details></div>`;
  }
}
