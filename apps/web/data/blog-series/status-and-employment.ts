import { defineArticle, source, standardRelated } from './shared';

export const statusAndEmploymentArticles = [
  defineArticle({
    slug: 'f1-visa-status-i20-i94-differences',
    title:
      'F-1 Visa Stamp vs Status vs I-20 vs I-94: The Difference Every International Student Must Know',
    description:
      'Your visa, F-1 status, Form I-20, and I-94 are connected but not interchangeable. Learn which document controls travel, admission, school records, and authorized stay.',
    category: 'F-1 Basics',
    tags: ['F-1 Status', 'I-20', 'I-94', 'Visa Stamp'],
    readTime: '10 min read',
    cta: 'opt-timeline',
    directAnswer:
      "The F-1 visa is a travel document used to request entry. Status is the legal classification you maintain inside the United States. The I-20 is the school's SEVIS eligibility and recommendation record. The I-94 records CBP's admission class and admit-until notation. An expired visa does not automatically end status inside the United States, but a valid visa does not excuse a status violation.",
    keyTakeaways: [
      'Visa validity and authorized stay are different questions.',
      'The I-94 is the admission record; the I-20 supports the F-1 purpose and SEVIS record.',
      'Travel can turn a nonissue—an expired visa while maintaining status—into a visa-renewal problem.',
    ],
    sections: [
      {
        heading: 'The Four Documents, Four Jobs',
        paragraphs: [
          'A visa is issued by a U.S. consulate and normally matters when you travel to a port of entry. CBP then decides admission and creates the I-94. The school issues the I-20 through SEVIS, while status is maintained through enrollment, authorized employment, reporting, and other F-1 rules.',
          'Because each document answers a different question, checking only the visa expiration date is never a complete status audit.',
        ],
        bullets: [
          'Visa: may I travel to seek F-1 admission?',
          'I-94: how was I admitted and until when?',
          'I-20: what school/program/OPT record supports the classification?',
          'Status: am I complying with the rules after admission?',
        ],
      },
      {
        heading: 'Three Common Scenarios',
        paragraphs: [
          'A student with an expired visa, valid I-20, D/S I-94, and properly maintained status may generally remain inside the United States, but usually needs a new visa after international travel. A student with a valid visa but terminated SEVIS record cannot rely on the stamp to continue studying or working. A student with a corrected I-20 should still verify that the I-94 from the last entry says F-1 and D/S.',
          'When a record conflicts, identify the issuing agency before seeking correction.',
        ],
        note: 'Save a one-page status snapshot after every entry and every new I-20: passport, visa, I-94, SEVIS ID, program dates, and work authorization dates.',
      },
      {
        heading: 'What to Review Before Any Filing or Trip',
        paragraphs: [
          'Compare names, passport numbers, SEVIS IDs, program level, travel signature, and employment authorization. Ask the DSO about SEVIS questions; use CBP correction channels for admission-record errors; use consular processes for visa matters.',
        ],
      },
    ],
    checklist: [
      'Download the latest I-94 after each entry.',
      'Keep every I-20, not only the newest copy.',
      'Track visa and passport expiration separately from status deadlines.',
      'Resolve conflicting records before filing I-765 or traveling.',
    ],
    mistakes: [
      'Calling the visa stamp ‘my status.’',
      'Throwing away old I-20s.',
      'Assuming D/S permits unlimited stay despite a status violation.',
    ],
    faq: [
      {
        question: 'Can I stay in the U.S. with an expired F-1 visa?',
        answer:
          'Often yes if you were properly admitted for D/S and continue maintaining F-1 status; the expired visa normally matters when seeking reentry.',
      },
      {
        question: 'Can I work because my I-20 lists OPT?',
        answer:
          'The recommendation alone is not the EAD. For post-completion OPT, employment generally must wait for USCIS approval and the authorized EAD dates.',
      },
      {
        question: 'Which record shows D/S?',
        answer: 'The I-94 admission record commonly shows F-1 and D/S.',
      },
    ],
    sources: [source.sevpTravel, source.i94],
    related: [
      {
        label: 'Wrong I-94 correction guide',
        href: '/blog/wrong-i94-f1-student-correction',
      },
      {
        label: 'Fall 2026 entry checklist',
        href: '/blog/fall-2026-f1-entry-checklist',
      },
      ...standardRelated.slice(0, 1),
    ],
  }),
  defineArticle({
    slug: 'f1-five-month-rule-travel-study-break',
    title:
      'The F-1 Five-Month Rule: When Travel or Study Breaks Can Require a New SEVIS Record',
    description:
      'The five-month concept can affect absences from classes, status violations, and reentry—but authorized study abroad and approved annual vacations require a more careful analysis.',
    category: 'F-1 Compliance',
    tags: ['Five-Month Rule', 'SEVIS', 'Travel', 'Study Break'],
    readTime: '10 min read',
    cta: 'opt-timeline',
    directAnswer:
      'A student outside the United States and not enrolled in a full course of study for more than five months may need a new initial I-20 and SEVIS record before returning, but the result depends on why the student was away. Approved study abroad tied to the U.S. program, an annual vacation, a leave, or a status violation can be treated differently. Ask the DSO to document the SEVIS plan before departure.',
    keyTakeaways: [
      'Five months is not a universal permission for any break.',
      'The academic and SEVIS reason for the absence matters.',
      'A new SEVIS record can affect I-901 fees and practical-training eligibility.',
    ],
    sections: [
      {
        heading: 'Why the Rule Is Commonly Misunderstood',
        paragraphs: [
          'Students often reduce the issue to days outside the country. SEVP guidance instead requires attention to enrollment, authorized vacation, study abroad, termination, and whether the same active SEVIS record remains valid.',
          'A student who leaves after a termination is not in the same position as one participating in school-approved overseas study. Obtain a written answer tied to your record.',
        ],
        bullets: [
          'How long will you be outside the United States?',
          'Will you remain enrolled or on an authorized vacation?',
          'Will the SEVIS record stay Active?',
          'Will a new initial record reset training eligibility?',
        ],
      },
      {
        heading: 'Plan Before You Leave',
        paragraphs: [
          'Give the DSO the departure date, return date, academic activity, and reason. Ask whether the existing I-20 will remain valid, whether a new SEVIS ID will be issued, and whether the plan affects CPT or OPT eligibility. Preserve the reply with travel records.',
          'If an unplanned delay pushes the absence toward five months, contact the DSO before changing tickets or attempting reentry.',
        ],
        note: 'The hidden cost of a casual semester break can be practical-training eligibility. Ask that question explicitly, not after returning.',
      },
      {
        heading: 'Returning with a New Record',
        paragraphs: [
          'A new initial I-20 may require a new I-901 fee and compliance with initial-entry timing. The visa question can depend on the existing stamp and SEVIS ID, so verify the current consular and SEVP rules rather than assuming the old document set works.',
        ],
      },
    ],
    checklist: [
      'Get the academic leave or study-abroad approval in writing.',
      'Confirm whether SEVIS remains Active.',
      'Ask how CPT/OPT eligibility is affected.',
      'Recheck documents if the return date changes.',
    ],
    mistakes: [
      'Counting five months without considering enrollment.',
      'Assuming a valid visa preserves an inactive SEVIS record.',
      'Returning on an old I-20 after the school issued a new record.',
    ],
    faq: [
      {
        question: 'Does every trip longer than five months require a new I-20?',
        answer:
          'Not automatically. Authorized study abroad connected to the program may be treated differently; the DSO must evaluate the SEVIS facts.',
      },
      {
        question: 'Can a long absence affect OPT eligibility?',
        answer:
          'Yes, particularly if a new initial record resets the academic-year requirement. Confirm before taking leave.',
      },
      {
        question: 'Does the five-month rule apply to a normal summer vacation?',
        answer:
          'An authorized annual vacation follows its own enrollment rules; do not treat it as an unapproved break.',
      },
    ],
    sources: [source.sevpTravel],
    related: [
      {
        label: 'Automatic visa revalidation',
        href: '/blog/automatic-visa-revalidation-f1-canada-mexico',
      },
      {
        label: 'F-1 reinstatement guide',
        href: '/blog/f1-reinstatement-i539-vs-reentry',
      },
      {
        label: 'SEVIS terminated recovery options',
        href: '/blog/sevis-terminated-reasons-recovery-options',
      },
    ],
  }),
  defineArticle({
    slug: 'automatic-visa-revalidation-f1-canada-mexico',
    title:
      'Automatic Visa Revalidation for F-1 Students: Canada and Mexico Travel with an Expired Visa',
    description:
      'Some F-1 students can return after a trip of 30 days or less to Canada, Mexico, or certain adjacent islands using automatic visa revalidation—but the exceptions are strict.',
    category: 'F-1 Travel',
    tags: ['Automatic Visa Revalidation', 'Canada', 'Mexico', 'Expired Visa'],
    readTime: '11 min read',
    cta: 'opt-timeline',
    directAnswer:
      'Automatic visa revalidation may allow an eligible F-1 student with an expired visa to return after a trip of 30 days or less to Canada, Mexico, or in some F/J cases adjacent islands, while maintaining valid status and carrying a valid passport, endorsed I-20, and I-94 evidence. It generally does not apply if you apply for a new U.S. visa during the trip, are denied a visa, travel beyond the permitted territory or time, or fall within excluded nationality rules.',
    keyTakeaways: [
      'AVR is a narrow reentry rule, not a visa renewal.',
      'A visa application during the trip can destroy eligibility.',
      'Canada or Mexico may separately require its own visa or entry permission.',
    ],
    sections: [
      {
        heading: 'The Eligibility Screen',
        paragraphs: [
          'Start with status: you must have maintained the classification and intend to resume it. Then check trip length, destination, passport, I-94, I-20 travel endorsement, and whether you sought a U.S. visa abroad.',
          'Do not surrender the evidence of the unexpired admission period without understanding how the electronic I-94 will be documented for return.',
        ],
        bullets: [
          'Trip is within the permitted territory and no more than 30 days',
          'Valid passport and properly endorsed I-20',
          'Valid underlying F-1 status and admission period',
          'No disqualifying visa application, denial, or nationality restriction',
        ],
      },
      {
        heading: 'Why Visa Interviews During the Trip Are Risky',
        paragraphs: [
          'If you apply for a new U.S. visa in Canada or Mexico, AVR generally cannot be used to return while that application is pending or after refusal. A 221(g) outcome can therefore strand a traveler even when the original plan assumed a quick return.',
          "Read both U.S. reentry rules and the destination country's rules before booking.",
        ],
        note: 'Print the State Department AVR page and carry it, but do not treat a printout as a guarantee of admission. Resolve uncertain eligibility before departure.',
      },
      {
        heading: 'OPT and STEM Travelers',
        paragraphs: [
          'Carry the EAD and evidence of current or prospective employment in addition to the usual F-1 documents. An expired visa may be only one of several travel risks; unemployment, an expired travel signature, or a pending application can require separate analysis.',
        ],
      },
    ],
    checklist: [
      'Verify every AVR condition against the official page.',
      'Check Canadian, Mexican, or island entry requirements.',
      'Do not book a visa interview without understanding the AVR consequence.',
      'Carry proof of status, I-94, I-20, and OPT employment.',
    ],
    mistakes: [
      'Assuming any Western Hemisphere trip qualifies.',
      'Staying 31 days.',
      'Applying for a visa and expecting AVR as a backup after 221(g).',
    ],
    faq: [
      {
        question: 'Can I use AVR after applying for a new F-1 visa in Canada?',
        answer:
          'Generally no. Applying for a new visa during the trip is a major disqualifying condition.',
      },
      {
        question: 'Does AVR guarantee CBP admission?',
        answer:
          'No. It provides a legal mechanism for qualifying travelers, but CBP still decides admission.',
      },
      {
        question: 'Can OPT students use AVR?',
        answer:
          'Potentially, if all requirements are met; carry the EAD and employment evidence and review the trip with the DSO.',
      },
    ],
    sources: [source.avr, source.sevpTravel],
    related: [
      {
        label: 'Travel on OPT',
        href: '/blog/can-you-travel-on-opt-complete-guide',
      },
      {
        label: 'CBP secondary inspection',
        href: '/blog/cbp-secondary-inspection-f1-students',
      },
      {
        label: 'F-1 five-month rule',
        href: '/blog/f1-five-month-rule-travel-study-break',
      },
    ],
  }),
  defineArticle({
    slug: 'f1-reinstatement-i539-vs-reentry',
    title:
      'F-1 Reinstatement Guide: Form I-539 vs Leaving and Re-entering with a New I-20',
    description:
      'After an F-1 status violation, reinstatement inside the U.S. and departure/reentry with a new initial record have different risks, timelines, and training consequences.',
    category: 'F-1 Status',
    tags: ['Reinstatement', 'Form I-539', 'SEVIS', 'Reentry'],
    readTime: '12 min read',
    cta: 'opt-timeline',
    directAnswer:
      'A student who loses F-1 status may ask USCIS for reinstatement using Form I-539 if the regulatory requirements are met, or may leave and seek reentry with a new initial I-20. Reinstatement can preserve continuity but may take time and does not authorize employment while pending. Reentry can be faster but creates travel and visa risk and generally starts a new initial-status timeline that can affect CPT/OPT eligibility.',
    keyTakeaways: [
      'Do not work after a status violation unless separately authorized.',
      'The five-month timing issue for reinstatement requires prompt action or an explanation of exceptional circumstances.',
      'Reentry is not a paper shortcut; CBP and possibly a consulate must accept the new plan.',
    ],
    sections: [
      {
        heading: 'Compare the Two Paths',
        paragraphs: [
          "Reinstatement asks USCIS to restore status without departure. The application typically needs a DSO-issued reinstatement I-20, explanation, financial evidence, and proof that the violation resulted from circumstances beyond the student's control or another qualifying basis. The student must pursue or intend to pursue a full course of study.",
          'Departure/reentry uses a new initial I-20 and often a new I-901 payment. It may resolve the in-country status problem only if the student is admitted, but can reset eligibility clocks.',
        ],
        bullets: [
          'I-539: USCIS adjudication, no departure required, no work while pending',
          'Reentry: consular/CBP risk, new SEVIS record, possible practical-training reset',
          'Both: DSO coordination and full factual disclosure',
        ],
      },
      {
        heading: 'Facts That Change the Decision',
        paragraphs: [
          'Consider how the violation happened, time since termination, visa validity, travel restrictions, academic schedule, funding, prior employment, and need for practical training. Unauthorized employment can make reinstatement unavailable; it is not merely another explanation to attach.',
          'Because the wrong choice can affect years of study or work eligibility, this is a strong candidate for individualized legal advice.',
        ],
        note: 'Ask for a written comparison that includes CPT/OPT timing—not only which route looks faster this month.',
      },
      {
        heading: 'While a Reinstatement Is Pending',
        paragraphs: [
          "Follow the DSO's enrollment instructions, do not engage in unauthorized employment, attend biometrics or respond to notices, and report address changes. Travel can be treated as abandonment of the I-539, so obtain advice before leaving.",
        ],
      },
    ],
    checklist: [
      'Get the SEVIS termination reason and timeline in writing.',
      'Stop unauthorized activity immediately.',
      'Compare training, visa, travel, and timing consequences.',
      'Preserve proof supporting circumstances beyond your control.',
    ],
    mistakes: [
      'Waiting months because the student is embarrassed to contact the DSO.',
      'Working while an I-539 is pending without authorization.',
      'Choosing reentry without checking visa and OPT-reset consequences.',
    ],
    faq: [
      {
        question: 'Can I work while F-1 reinstatement is pending?',
        answer:
          'A pending reinstatement application does not itself grant employment authorization.',
      },
      {
        question: 'Does departure abandon Form I-539?',
        answer:
          'Departure generally results in abandonment of a pending change/extension/reinstatement request; get case-specific advice.',
      },
      {
        question: 'Will reentry preserve my old OPT eligibility clock?',
        answer:
          'A new initial SEVIS record can require a new academic year before practical training. Confirm with the DSO before choosing it.',
      },
    ],
    sources: [source.reinstatement, source.i539],
    related: [
      {
        label: 'SEVIS terminated guide',
        href: '/blog/sevis-terminated-reasons-recovery-options',
      },
      {
        label: 'F-1 five-month rule',
        href: '/blog/f1-five-month-rule-travel-study-break',
      },
      {
        label: 'F-1 status documents explained',
        href: '/blog/f1-visa-status-i20-i94-differences',
      },
    ],
  }),
  defineArticle({
    slug: 'sevis-terminated-reasons-recovery-options',
    title:
      'SEVIS Terminated: Common Reasons, Immediate Consequences, and Recovery Options',
    description:
      'A terminated SEVIS record can end F-1 status and employment authorization. Learn the first questions to ask and how reinstatement differs from a new-record reentry.',
    category: 'F-1 Status',
    tags: ['SEVIS Terminated', 'F-1 Status', 'Reinstatement'],
    readTime: '11 min read',
    cta: 'opt-timeline',
    directAnswer:
      'If your DSO says the SEVIS record is Terminated, stop any employment that depends on F-1 authorization, obtain the exact termination reason and date, and discuss recovery immediately. Depending on the facts, options may include correcting a school error, applying to USCIS for reinstatement, or leaving and returning with a new initial I-20. A valid visa stamp does not override termination.',
    keyTakeaways: [
      'Termination is not the same as I-20 expiration.',
      'OPT, CPT, and on-campus work may end when status is lost.',
      'The correct recovery path depends on the reason, timing, and any unauthorized employment.',
    ],
    sections: [
      {
        heading: 'Common Termination Reasons',
        paragraphs: [
          'SEVIS includes reasons such as unauthorized employment, failure to enroll, unauthorized withdrawal, otherwise failing to maintain status, or transfer issues. Some records are terminated because the school acted on incomplete information; others reflect a real violation.',
          'Ask for the exact SEVIS reason, effective date, event history, and the documents the school relied on. Do not settle for ‘the system ended it.’',
        ],
        bullets: [
          'Unauthorized employment',
          'Failure to enroll or maintain a full course without authorization',
          'Transfer or registration deadline failure',
          'School error or incorrect record action',
        ],
      },
      {
        heading: 'Your First 48 Hours',
        paragraphs: [
          'Stop work unless counsel confirms an independent authorization. Preserve payroll, enrollment, travel, and DSO communications. Do not depart, file an I-539, or request a new record until the consequences are compared.',
          'If the school made a clear data correction error, it may have SEVIS correction options. A genuine status violation requires a different strategy.',
        ],
        note: 'Build a dated timeline before explaining the case. Precise dates often reveal whether a correction, reinstatement, or reentry analysis fits.',
      },
      {
        heading: 'Recovery Is Not One-Size-Fits-All',
        paragraphs: [
          'Reinstatement has eligibility requirements and processing time. Reentry introduces consular and CBP risk and can restart practical-training eligibility. In serious or disputed cases, use both DSO expertise and independent legal counsel; the DSO manages SEVIS but does not represent you legally.',
        ],
      },
    ],
    checklist: [
      'Get the termination reason and date.',
      'Stop F-1-dependent employment.',
      'Preserve academic, work, and communication records.',
      'Compare reinstatement, correction, and reentry consequences.',
    ],
    mistakes: [
      'Continuing OPT work because the EAD card date has not expired.',
      'Traveling before understanding reentry eligibility.',
      'Filing a generic explanation that does not match the SEVIS reason.',
    ],
    faq: [
      {
        question: 'Does an unexpired EAD remain valid after SEVIS termination?',
        answer:
          'The card dates alone do not preserve F-1-based authorization after loss of status. Stop and obtain advice.',
      },
      {
        question: 'Can a DSO reactivate a terminated record?',
        answer:
          'Schools have limited correction/data-fix processes, but a DSO cannot simply erase every valid termination.',
      },
      {
        question: 'Is termination the same as deportation?',
        answer:
          'No, but it can mean loss of status and serious immigration consequences requiring prompt action.',
      },
    ],
    sources: [source.reinstatement, source.sevpEmployment],
    related: [
      {
        label: 'F-1 reinstatement options',
        href: '/blog/f1-reinstatement-i539-vs-reentry',
      },
      {
        label: 'F-1 five-month rule',
        href: '/blog/f1-five-month-rule-travel-study-break',
      },
      {
        label: 'OPT unemployment rule',
        href: '/blog/90-day-unemployment-rule-opt',
      },
    ],
  }),
  defineArticle({
    slug: 'f1-severe-economic-hardship-ead',
    title:
      'F-1 Severe Economic Hardship EAD: Who Qualifies for Off-Campus Employment',
    description:
      'Eligible F-1 students facing unforeseen financial hardship may request DSO recommendation and USCIS authorization for limited off-campus employment.',
    category: 'F-1 Employment',
    tags: ['Economic Hardship', 'EAD', 'Off-Campus Work', 'I-765'],
    readTime: '10 min read',
    cta: 'opt-timeline',
    directAnswer:
      'Severe economic hardship employment is for an F-1 student who has generally completed one full academic year, maintains valid status and good academic standing, and faces serious unforeseen financial circumstances beyond their control. The student must work with the DSO and obtain USCIS approval and an EAD before off-campus work begins; the job does not have to relate to the major.',
    keyTakeaways: [
      'Financial difficulty alone is not enough; it must be severe and tied to unforeseen circumstances.',
      'DSO recommendation does not authorize work.',
      'School remains the primary purpose, so enrollment and work-hour rules continue.',
    ],
    sections: [
      {
        heading: 'What USCIS and the DSO Evaluate',
        paragraphs: [
          'Examples can include unexpected loss of financial aid or on-campus employment, substantial exchange-rate changes, large tuition or living-cost increases, or unexpected medical expenses. The evidence should connect the event to a current budget shortfall.',
          'The student should also explain why on-campus employment is unavailable or insufficient and why accepting work will not interfere with a full course of study.',
        ],
        bullets: [
          'One full academic year in F-1 status',
          'Good standing and full-course enrollment',
          'Unforeseen severe economic circumstances',
          'On-campus work unavailable or inadequate',
        ],
      },
      {
        heading: 'Build Evidence, Not a Sympathy Letter',
        paragraphs: [
          'Prepare a before-and-after budget, sponsor records, bank or exchange-rate evidence, tuition bills, medical invoices, and proof of attempts to find on-campus work. A chronological packet is easier to evaluate than a long personal statement without numbers.',
          'File Form I-765 under the correct category after the DSO updates SEVIS and issues the supporting I-20. Do not start employment while the case is pending.',
        ],
        note: 'Use a simple table: expected funding, unexpected event, current shortfall, and supporting exhibit. That turns a vague hardship into a reviewable record.',
      },
      {
        heading: 'Limits After Approval',
        paragraphs: [
          'Authorization is time-limited and subject to the EAD. Employment is generally limited while school is in session and may be full time during breaks, under the applicable rules. Continue reporting and enrollment compliance.',
        ],
      },
    ],
    checklist: [
      'Meet the DSO before filing anything.',
      'Document the unforeseen event and financial impact.',
      'Use the correct I-765 category and current fee.',
      'Wait for the EAD and authorized start date.',
    ],
    mistakes: [
      'Starting off-campus work after DSO recommendation but before EAD approval.',
      'Submitting only bank balances without explaining the unexpected change.',
      'Dropping below a full course without separate authorization.',
    ],
    faq: [
      {
        question: 'Must hardship employment relate to my degree?',
        answer:
          'No, the employment generally need not be related to the field of study.',
      },
      {
        question: 'Can a first-semester student apply?',
        answer:
          'The category generally requires completion of one full academic year, among other criteria.',
      },
      {
        question: 'Can I work while the I-765 is pending?',
        answer: 'No. Wait for approval, the EAD, and its valid dates.',
      },
    ],
    sources: [source.hardship, source.i765],
    related: [
      { label: 'F-1 employment overview', href: '/blog/f1-visa-jobs-guide' },
      {
        label: 'Form I-765 guide',
        href: '/blog/form-i765-ead-application-guide',
      },
      {
        label: 'Special Student Relief',
        href: '/blog/f1-special-student-relief',
      },
    ],
  }),
  defineArticle({
    slug: 'f1-special-student-relief',
    title:
      'Special Student Relief for F-1 Students: Eligible Countries, Reduced Course Loads, and Work Rules',
    description:
      'Special Student Relief is available only when DHS publishes a country-specific notice. Each notice controls eligibility, dates, employment, and reduced-course-load conditions.',
    category: 'F-1 Employment',
    tags: ['Special Student Relief', 'SSR', 'Reduced Course Load', 'EAD'],
    readTime: '10 min read',
    cta: 'opt-timeline',
    directAnswer:
      "Special Student Relief is not a standing benefit for every F-1 student facing hardship. DHS must publish a Federal Register notice for a country or circumstance, and the student must meet that notice's nationality or habitual-residence, presence, enrollment, status, and financial-hardship requirements. A DSO must authorize any reduced course load, and off-campus work may require Form I-765 and an EAD.",
    keyTakeaways: [
      'The active Federal Register notice is the rulebook.',
      'TPS and SSR are separate programs even when announced for the same country.',
      'Never reduce enrollment or begin off-campus work before the required authorization.',
    ],
    sections: [
      {
        heading: 'How to Confirm Eligibility',
        paragraphs: [
          'Start on Study in the States and open the current notice for the country. Confirm the notice is still active, the required dates, immigration-status conditions, and whether it covers citizens only or certain habitual residents.',
          'Bring the notice to the DSO. A social-media summary may omit registration periods, minimum credits, or renewal rules.',
        ],
        bullets: [
          'Covered nationality or habitual residence',
          'Required U.S. presence and F-1 status dates',
          'Severe economic hardship caused by the emergency',
          'School and course-load requirements',
        ],
      },
      {
        heading: 'Employment and Course Load Work Together',
        paragraphs: [
          'A qualifying student may receive authorization for increased on-campus work or seek off-campus authorization, and may be permitted a reduced course load while still treated as pursuing a full course for F-1 purposes. The exact combination depends on the notice and DSO action.',
          'The employment period cannot be assumed to outlast the published SSR designation.',
        ],
        note: 'Save the exact Federal Register PDF that applied on your filing date. Country pages change as notices are extended or expire.',
      },
      {
        heading: 'Renewal and Expiration',
        paragraphs: [
          'Track the EAD end date, notice expiration, school term, and any extension announcement separately. Do not assume an automatic extension unless the official notice expressly provides one.',
        ],
      },
    ],
    checklist: [
      'Open the current country-specific notice.',
      'Meet the DSO before changing work or enrollment.',
      'Document hardship tied to the covered emergency.',
      'Track notice, I-20, and EAD expiration dates.',
    ],
    mistakes: [
      'Assuming TPS approval automatically grants SSR.',
      'Dropping classes before DSO authorization.',
      'Working past the notice or EAD period.',
    ],
    faq: [
      {
        question: 'Is SSR available to every F-1 student?',
        answer:
          'No. DHS must designate relief through a country-specific notice with detailed eligibility conditions.',
      },
      {
        question: 'Is SSR the same as TPS?',
        answer:
          'No. They are separate benefits with different eligibility and filing rules.',
      },
      {
        question: 'Can SSR permit a reduced course load?',
        answer:
          'Some notices permit it when the DSO authorizes the reduction and all notice conditions are met.',
      },
    ],
    sources: [source.ssr, source.i765],
    related: [
      {
        label: 'Severe economic hardship EAD',
        href: '/blog/f1-severe-economic-hardship-ead',
      },
      { label: 'F-1 employment overview', href: '/blog/f1-visa-jobs-guide' },
      {
        label: 'Form I-765 guide',
        href: '/blog/form-i765-ead-application-guide',
      },
    ],
  }),
  defineArticle({
    slug: 'f1-on-campus-work-after-graduation',
    title:
      'Can F-1 Students Work On Campus After Graduation? Program-End and Grace-Period Rules',
    description:
      'Ordinary on-campus employment generally ends when the academic program ends. The 60-day grace period is not employment authorization.',
    category: 'F-1 Employment',
    tags: ['On-Campus Work', 'Graduation', 'Grace Period', 'OPT'],
    readTime: '9 min read',
    cta: 'opt-timeline',
    directAnswer:
      'Ordinary F-1 on-campus employment generally ends on the program end date because the job authorization is tied to pursuing the program. The 60-day grace period does not authorize work. Employment after program completion requires another valid basis, such as approved post-completion OPT during the EAD dates; a campus employer does not become exempt merely because it is the same university.',
    keyTakeaways: [
      'Graduation ceremony date, last class, and I-20 program end date may differ.',
      'The grace period permits preparation to depart, transfer, or change status—not employment.',
      'An on-campus job can continue on OPT only if it qualifies as OPT employment and the EAD is active.',
    ],
    sections: [
      {
        heading: 'Find the Date That Controls',
        paragraphs: [
          'Review the I-20 program end date and confirm with the DSO whether the school will shorten it after early completion. Payroll schedules do not control immigration authorization. A paycheck after completion can cover work performed earlier, but new hours worked after authorization ends are the concern.',
          'If an assistantship or campus contract extends beyond completion, ask the employer and DSO to identify the new authorization before working.',
        ],
        bullets: [
          'I-20 program end date',
          'Actual completion date as recorded by the school',
          'OPT EAD start date',
          'Any gap between school employment and OPT',
        ],
      },
      {
        heading: 'Campus Work During OPT',
        paragraphs: [
          'A university job may qualify during post-completion OPT when it is directly related to the degree, at least 20 hours per week in the aggregate where required, and properly reported. The authorization comes from OPT—not from the old on-campus rule.',
          'Do not work during a gap between program completion and the EAD start date.',
        ],
        note: 'Give campus HR the new EAD and complete Form I-9 reverification. Familiarity with the student does not replace employment-eligibility records.',
      },
      {
        heading: 'What You May Do During the Grace Period',
        paragraphs: [
          'You may prepare to depart, transfer to another school or level, or pursue a timely status option. Unpaid activity can still be ‘employment’ if it replaces a paid worker or provides services, so do not label work volunteer service without analysis.',
        ],
      },
    ],
    checklist: [
      'Confirm the official program end date.',
      'Tell campus payroll and the supervisor before authorization ends.',
      'Do not work in the gap before an OPT EAD starts.',
      'Report qualifying campus employment under OPT.',
    ],
    mistakes: [
      'Treating the 60-day grace period as permission to work.',
      'Assuming unpaid lab work is automatically volunteering.',
      'Using the graduation ceremony date without checking the I-20.',
    ],
    faq: [
      {
        question: 'Can I work on campus during the 60-day grace period?',
        answer: 'Not under ordinary F-1 on-campus employment authorization.',
      },
      {
        question: 'Can my university employ me on OPT?',
        answer:
          'Yes, if the role independently satisfies OPT requirements and occurs within the EAD dates.',
      },
      {
        question: 'Can I volunteer in my old lab after graduation?',
        answer:
          'Only if it is genuine volunteer activity under applicable labor and immigration rules, not unpaid employment.',
      },
    ],
    sources: [source.sevpEmployment, source.opt],
    related: [
      {
        label: '90-day unemployment rule',
        href: '/blog/90-day-unemployment-rule-opt',
      },
      {
        label: 'OPT employment types',
        href: '/blog/opt-employment-evidence-checklist',
      },
      {
        label: 'OPT application timeline',
        href: '/blog/opt-application-checklist-2026',
      },
    ],
  }),
  defineArticle({
    slug: 'everify-number-vs-ein-i765-i983',
    title:
      'E-Verify Number vs EIN: Which Number Goes on Form I-765 and Form I-983?',
    description:
      "The E-Verify company ID is not the employer's EIN. STEM OPT applicants should obtain the correct number from HR or the E-Verify administrator.",
    category: 'STEM OPT',
    tags: ['E-Verify Number', 'EIN', 'I-765', 'I-983'],
    readTime: '9 min read',
    cta: 'opt-timeline',
    directAnswer:
      "An EIN is the employer's federal tax identification number. The E-Verify company identification number identifies the employer's E-Verify account and is the number requested for the STEM OPT employer in Form I-765. Form I-983 also asks for employer identifiers and details. Do not substitute the EIN, a client company's number, or the memorandum-of-understanding number; obtain the correct E-Verify company ID from the employer's authorized administrator.",
    keyTakeaways: [
      'EIN and E-Verify company ID serve different systems.',
      'The hiring employer—not necessarily a client worksite—must support the training plan.',
      'A wrong number can trigger questions about STEM eligibility.',
    ],
    sections: [
      {
        heading: 'How to Recognize the Numbers',
        paragraphs: [
          'An EIN is typically formatted as nine digits with a hyphen and appears on tax/payroll records. The E-Verify company ID is assigned when the organization enrolls. Large employers may have multiple hiring sites or corporate accounts, so a number copied from the internet may not match the entity signing the I-983.',
          'Ask HR or the E-Verify program administrator to confirm the legal entity name, hiring-site arrangement, and company ID in writing.',
        ],
        bullets: [
          'EIN: IRS tax identifier',
          'E-Verify company ID: enrollment account identifier',
          'MOU number: not a substitute',
          "Client's number: not automatically the student's employer number",
        ],
      },
      {
        heading: 'Cross-Check I-765 and I-983',
        paragraphs: [
          'Compare employer legal name, address, E-Verify number, supervisor, compensation, worksite, and employment start date. Differences may be legitimate, but they should be understood and documented rather than accidental.',
          'The employer must be able to provide a bona fide training experience and required supervision. An E-Verify number alone does not make every arrangement STEM-compliant.',
        ],
        note: 'Send HR a screenshot of the exact field label from the current form instructions. Asking only for ‘the company number’ is how EINs get substituted.',
      },
      {
        heading: 'If You Already Filed the Wrong Number',
        paragraphs: [
          'Tell the DSO and employer, compare the source records, and obtain advice on an appropriate correction. Do not upload several competing numbers without a clear explanation.',
        ],
      },
    ],
    checklist: [
      'Get the E-Verify company ID from an authorized employer contact.',
      'Match the legal employer across the I-765 and I-983.',
      'Keep written confirmation in the document vault.',
      'Review current form editions before filing.',
    ],
    mistakes: [
      'Entering the EIN because it looks official.',
      "Using a client's E-Verify number for a staffing employer.",
      'Assuming E-Verify participation proves the training plan is valid.',
    ],
    faq: [
      {
        question: 'Is an E-Verify number the same as an EIN?',
        answer: 'No. E-Verify and IRS tax identification are separate systems.',
      },
      {
        question: 'Where does the employer find its E-Verify ID?',
        answer:
          "The employer's E-Verify administrator can retrieve it from the company's enrollment/account records.",
      },
      {
        question: 'Can I search the E-Verify number online?',
        answer:
          'Public tools may confirm participation, but the employer should provide the exact account number used for your filing.',
      },
    ],
    sources: [source.ev, source.i765, source.i983],
    related: [
      {
        label: 'I-983 training plan guide',
        href: '/blog/stem-opt-employer-requirements',
      },
      {
        label: 'STEM OPT employer requirements',
        href: '/blog/stem-opt-employer-requirements',
      },
      {
        label: 'Changing STEM OPT employers',
        href: '/blog/change-employer-stem-opt-pending',
      },
    ],
  }),
  defineArticle({
    slug: 'stem-opt-material-changes-new-i983',
    title:
      'STEM OPT Material Changes: When a New I-983 Is Required for Remote Work, Salary, Supervisor, or Worksite',
    description:
      'Material changes to a STEM OPT training plan must be reported through the DSO, and a revised Form I-983 may be required before the change is treated as routine.',
    category: 'STEM OPT',
    tags: ['I-983', 'Material Change', 'Remote Work', 'STEM OPT'],
    readTime: '11 min read',
    cta: 'opt-timeline',
    directAnswer:
      'A new or modified Form I-983 is required when there is a material change to the existing training plan. Examples can include a significant decrease in compensation, reduction in hours below the required minimum, change in employer EIN, or changes that affect the training goals, supervision, learning objectives, or work arrangement. Remote work, supervisor, salary, and worksite changes should be evaluated with the employer and DSO rather than assumed immaterial.',
    keyTakeaways: [
      'Materiality is about the substance of training and employment, not only the employer name.',
      'Students must report required changes within the applicable timeframe.',
      'Keep the old and revised I-983 with proof of DSO submission.',
    ],
    sections: [
      {
        heading: 'Use a Material-Change Test',
        paragraphs: [
          'Compare the proposed arrangement to every section of the signed I-983: employer identity, compensation, hours, worksite, supervisor, goals, methods of supervision, and evaluation measures. If a truthful answer changes in a meaningful way, involve the DSO.',
          'A move from office to remote work may change how the employer provides direct supervision and evaluates progress. A new supervisor may require updates even when the job title stays the same.',
        ],
        bullets: [
          'Employer ownership, EIN, or legal entity',
          'Hours or compensation',
          'Worksite or remote/hybrid arrangement',
          'Supervisor or supervision method',
          'Training goals and duties',
        ],
      },
      {
        heading: 'How to Report Cleanly',
        paragraphs: [
          "Ask the employer to revise the affected sections, sign the new plan, and provide an explanation of the change and effective date. Submit it through the school's required process and retain confirmation. If the employer itself changes, use the employer-change process rather than editing the old employer's plan.",
          'The six-month validation and annual self-evaluation deadlines continue despite interim updates.',
        ],
        note: 'Treat the I-983 as a living compliance document. Review it whenever HR sends a transfer, promotion, pay, manager, or location notice.',
      },
      {
        heading: 'Remote Work Is Not a One-Word Answer',
        paragraphs: [
          'The key is whether the employer can maintain a bona fide employer-employee relationship, provide the training, and meet reporting and site-visit obligations. Document communication cadence, access to supervisors, evaluation, and how the remote worksite supports the plan.',
        ],
      },
    ],
    checklist: [
      'Compare every proposed change to the signed I-983.',
      'Ask the DSO whether a revised plan is required.',
      "Obtain signatures before the school's deadline.",
      'Retain previous plans and submission evidence.',
    ],
    mistakes: [
      'Waiting for the annual evaluation to report a material change.',
      'Updating only the SEVP Portal but not the I-983/DSO process.',
      'Assuming remote work is always prohibited or always acceptable.',
    ],
    faq: [
      {
        question: 'Does every salary increase require a new I-983?',
        answer:
          'Not necessarily, but significant compensation changes and any change affecting the plan should be reviewed with the DSO.',
      },
      {
        question: 'Does changing supervisors require an update?',
        answer:
          'It can, especially when supervision methods, contact details, or training responsibilities change.',
      },
      {
        question: 'How quickly must material changes be reported?',
        answer:
          "STEM OPT reporting rules generally require material changes to be reported to the DSO at the earliest opportunity; follow the school's process promptly.",
      },
    ],
    sources: [source.i983, source.stem],
    related: [
      {
        label: 'I-983 complete guide',
        href: '/blog/stem-opt-employer-requirements',
      },
      {
        label: 'STEM OPT reporting requirements',
        href: '/blog/stem-opt-six-month-validation-report',
      },
      {
        label: 'Changing STEM employers',
        href: '/blog/change-employer-stem-opt-pending',
      },
    ],
  }),
  defineArticle({
    slug: 'change-employer-stem-opt-pending',
    title:
      'Changing Employers While STEM OPT Is Pending: I-983, E-Verify, and USCIS Steps',
    description:
      'A STEM OPT employer change while Form I-765 is pending requires coordinated reporting, a new qualifying employer, and a new I-983—not just an update after approval.',
    category: 'STEM OPT',
    tags: ['STEM OPT Pending', 'Employer Change', 'I-983', 'E-Verify'],
    readTime: '12 min read',
    cta: 'opt-timeline',
    directAnswer:
      'A pending STEM OPT applicant can change employers only if the new job independently meets STEM requirements: E-Verify participation, at least 20 hours per week, compensation, a bona fide employer-employee relationship, and a signed Form I-983. Report the end of the old employment and submit the new I-983 to the DSO promptly. Because USCIS is adjudicating an application based on employer information, ask the DSO or counsel whether and how updated evidence should be sent to USCIS.',
    keyTakeaways: [
      'The new employer must qualify before the student relies on it.',
      'Close the old I-983 with the required final evaluation.',
      'SEVIS/DSO reporting and USCIS evidence are related but separate steps.',
    ],
    sections: [
      {
        heading: 'The Handoff Between Employers',
        paragraphs: [
          "Get the new employer's legal name, EIN, E-Verify company ID, worksite, supervisor, compensation, hours, and training plan. Agree on a start date that does not create unauthorized work and track unemployment days between roles.",
          "Submit the old employer's final self-evaluation when required and the new I-983 through the school's procedure. The DSO updates SEVIS based on complete documents.",
        ],
        bullets: [
          'Old employment end date and final evaluation',
          'New signed I-983',
          'E-Verify and employer-relationship evidence',
          'Unemployment-day calculation',
        ],
      },
      {
        heading: 'What to Do About the Pending I-765',
        paragraphs: [
          "USCIS may not automatically receive every DSO update in the form most useful for adjudication. Follow the DSO's advice and consider a concise unsolicited-evidence upload or other instructed channel that identifies the receipt and replacement employer—especially if an RFE has not been issued.",
          'Do not withdraw and refile casually; timing and fee consequences can be severe.',
        ],
        note: 'Create one transition packet with the old final evaluation, new I-983, DSO confirmation, offer letter, E-Verify evidence, and a dated cover page.',
      },
      {
        heading: 'If the Current EAD Expires While Pending',
        paragraphs: [
          'A timely filed STEM extension may provide an automatic extension of work authorization under the governing rule. The new employer must be able to complete Form I-9 using acceptable evidence and satisfy STEM requirements; confirm the case-specific documentation.',
        ],
      },
    ],
    checklist: [
      'Verify the new employer in E-Verify.',
      'Complete the old final evaluation and new I-983.',
      'Report the transition to the DSO promptly.',
      'Ask how the pending USCIS case should be updated.',
    ],
    mistakes: [
      'Starting with a non-E-Verify employer.',
      "Forgetting the old employer's final evaluation.",
      'Assuming a SEVP Portal edit alone updates the pending I-765 record.',
    ],
    faq: [
      {
        question: 'Can I change employers before STEM OPT is approved?',
        answer:
          'Potentially yes, if the new employer and job meet every STEM condition and the transition is properly reported.',
      },
      {
        question: 'Do I need a new I-983?',
        answer: 'Yes, a new employer requires its own signed training plan.',
      },
      {
        question: 'Does the 180-day automatic extension follow me?',
        answer:
          'A timely filed eligible STEM application may provide the extension, but the new employment must qualify and Form I-9 evidence must be handled correctly.',
      },
    ],
    sources: [source.stem, source.i983, source.ev, source.i765],
    related: [
      {
        label: 'STEM material changes',
        href: '/blog/stem-opt-material-changes-new-i983',
      },
      {
        label: 'STEM employer requirements',
        href: '/blog/stem-opt-employer-requirements',
      },
      {
        label: 'STEM unemployment limit',
        href: '/blog/stem-opt-unemployment-limit',
      },
    ],
  }),
  defineArticle({
    slug: 'h1b-cap-gap-denial-rejection-withdrawal-layoff',
    title:
      'H-1B Cap-Gap After a Denial, Rejection, Withdrawal, or Layoff: When Work Authorization Ends',
    description:
      'Cap-gap protection depends on a timely, qualifying cap-subject H-1B filing and can end differently after rejection, denial, withdrawal, revocation, or job loss.',
    category: 'H-1B',
    tags: ['Cap-Gap', 'H-1B Denial', 'OPT', 'Layoff'],
    readTime: '12 min read',
    cta: 'unemployment',
    directAnswer:
      'Cap-gap is not a standalone EAD. It extends F-1 status—and in qualifying cases OPT work authorization—because a timely cap-subject H-1B petition requesting change of status is pending or approved for the next fiscal-year start. If USCIS rejects, denies, revokes, or the employer withdraws the petition, the extension generally ends under the applicable rule, subject to limited grace-period treatment and exceptions. A layoff can also lead the employer to withdraw the petition, so obtain the receipt and act quickly.',
    keyTakeaways: [
      'Registration selection alone never creates cap-gap.',
      'Consular-notification petitions do not provide the same change-of-status bridge.',
      'The event date and USCIS disposition determine whether work must stop immediately.',
    ],
    sections: [
      {
        heading: 'Map the Case Status to Work Authorization',
        paragraphs: [
          'Start with the OPT EAD expiration, petition receipt date, requested H-1B start date, whether change of status was requested, and the current petition status. Ask the DSO for an updated cap-gap I-20 only after the required SEVIS data appears or evidence is provided.',
          'A rejected petition was not properly filed. A denial is an adjudicated refusal. Withdrawal is employer-initiated; revocation is USCIS action. Those labels can produce different timing and grace-period analyses.',
        ],
        bullets: [
          'Selected registration: no cap-gap by itself',
          'Timely filed qualifying petition: status/work extension may attach',
          'Rejection or denied change of status: extension can terminate',
          'Approved change of status: bridge continues toward October 1 unless later disrupted',
        ],
      },
      {
        heading: 'What a Layoff Changes',
        paragraphs: [
          'A layoff does not create a new F-1 unemployment period after the original OPT EAD has expired. If the H-1B employer no longer intends to employ the beneficiary and withdraws the petition, cap-gap support can collapse.',
          'Get the termination date, petition receipt, withdrawal information, and DSO record. Discuss alternative status, school, or departure options before relying on a general grace period.',
        ],
        note: "Do not let HR's phrase ‘you have 60 days’ replace a legal timeline. Ask which status and regulation the 60 days supposedly comes from.",
      },
      {
        heading: 'After an Adverse USCIS Decision',
        paragraphs: [
          'Read the decision date and basis. Some denials involving fraud, status violations, or unauthorized employment receive different grace treatment than an ordinary denial. Stop work when authorization ends and obtain case-specific advice immediately.',
        ],
      },
    ],
    checklist: [
      'Save the full I-797 receipt and petition filing basis.',
      'Confirm change of status versus consular processing.',
      'Track EAD expiration and every USCIS action date.',
      'Tell the DSO immediately after rejection, denial, withdrawal, or job loss.',
    ],
    mistakes: [
      'Assuming lottery selection extends OPT.',
      'Continuing work after the qualifying petition no longer supports cap-gap.',
      'Relying on a rumored automatic 60-day work period.',
    ],
    faq: [
      {
        question: 'Does an H-1B registration selection create cap-gap?',
        answer:
          'No. A qualifying petition must be timely filed requesting change of status.',
      },
      {
        question: 'Can I work after the H-1B petition is denied?',
        answer:
          'Cap-gap work authorization generally ends when the denial ends the qualifying bridge; stop and obtain advice.',
      },
      {
        question: 'Does a consular-processing H-1B petition extend OPT?',
        answer:
          'It generally does not provide the cap-gap change-of-status extension in the same way.',
      },
    ],
    sources: [source.capgap, source.opt],
    related: [
      { label: 'OPT to H-1B transition', href: '/blog/opt-to-h1b-transition' },
      { label: 'H-1B alternatives', href: '/blog/h1b-alternatives-work-visas' },
      {
        label: 'STEM unemployment limit',
        href: '/blog/stem-opt-unemployment-limit',
      },
    ],
  }),
] as const;
