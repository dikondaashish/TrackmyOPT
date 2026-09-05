import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock, ExternalLink } from "lucide-react";
import { AuthorBio } from "@/components/blog/AuthorBio";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { BlogProductCTA, type BlogProductCtaVariant } from "@/components/blog/BlogProductCTA";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";

export type GuideSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type ComplianceGuide = {
  slug: string;
  metadata: Metadata;
  title: string;
  category: string;
  readTime: string;
  publishedDate: string;
  answer: string;
  takeaway: string;
  audience: string;
  keywords: string[];
  facts: Array<[string, string]>;
  sections: GuideSection[];
  checklist: string[];
  faqs: Array<{ question: string; answer: string }>;
  related: Array<{ slug: string; label: string }>;
  sources: Array<{ label: string; href: string }>;
  ctaVariant: BlogProductCtaVariant;
};

const BASE = "https://www.trackmyopt.com/blog";
const DHS_REPORTING = "https://studyinthestates.dhs.gov/assets/sevpstemoptreportingrequirementsfinal.pdf";
const I983 = "https://studyinthestates.dhs.gov/form-i-983-overview";
const ICE_PRACTICAL = "https://www.ice.gov/sevis/practical-training";
const ICE_EMPLOYMENT = "https://www.ice.gov/sevis/employment";
const I765_INSTRUCTIONS = "https://www.uscis.gov/sites/default/files/document/forms/i-765instr.pdf";
const USCIS_NON_DELIVERY = "https://egov.uscis.gov/e-request/ndc";
const SEVP_GUIDE = "https://studyinthestates.dhs.gov/assets/SEVP%20Portal%20Student%20User%20Guide.pdf";

const commonRelated = [
  { slug: "laid-off-on-opt", label: "Laid off on OPT: reporting and next steps" },
  { slug: "laid-off-on-stem-opt", label: "Laid off on STEM OPT: I-983 and 150-day rule" },
  { slug: "change-employers-stem-opt", label: "How to change employers on STEM OPT" },
  { slug: "stem-opt-six-month-validation-report", label: "STEM OPT six-month validation calendar" },
  { slug: "opt-job-related-to-degree", label: "How to prove a job relates to your degree" },
  { slug: "opt-employment-evidence-checklist", label: "OPT employment evidence checklist" },
  { slug: "ead-card-lost-stolen-incorrect-never-delivered", label: "Lost, incorrect, or missing EAD card" },
  { slug: "can-you-start-work-before-opt-ead-arrives", label: "Can you work before your EAD arrives?" },
  { slug: "what-counts-as-20-hours-on-opt", label: "What counts as 20 hours on OPT?" },
  { slug: "employer-refuses-form-i983", label: "Employer refuses to sign Form I-983" },
  { slug: "stem-opt-employer-site-visit-preparation", label: "STEM OPT employer site visits" },
];

function guide(
  slug: string,
  title: string,
  description: string,
  category: string,
  answer: string,
  takeaway: string,
  sections: GuideSection[],
  checklist: string[],
  faqs: Array<{ question: string; answer: string }>,
  sources: Array<{ label: string; href: string }>,
  ctaVariant: BlogProductCtaVariant,
  facts: Array<[string, string]>,
  keywords: string[],
): ComplianceGuide {
  const canonical = `${BASE}/${slug}`;
  return {
    slug,
    title,
    metadata: {
      title,
      description,
      keywords,
      alternates: { canonical },
      openGraph: { title, description, url: canonical, type: "article", images: [{ url: "https://www.trackmyopt.com/og-image.jpg", width: 1200, height: 630, alt: title }] },
    },
    category,
    readTime: "10 min read",
    publishedDate: "2026-07-27",
    answer,
    takeaway,
    audience: "F-1 students on OPT or STEM OPT, and the employers and DSOs helping them maintain accurate records.",
    keywords,
    facts,
    sections,
    checklist,
    faqs,
    related: commonRelated.filter((item) => item.slug !== slug).slice(0, 6),
    sources,
    ctaVariant,
  };
}

export const COMPLIANCE_GUIDES: Record<string, ComplianceGuide> = {
  "laid-off-on-opt": guide(
    "laid-off-on-opt",
    "Laid Off on OPT? Reporting Deadlines, Unemployment Days & Next Steps",
    "Lost your job on OPT? Learn what to report, when unemployment days begin, what records to save, and how to build a compliant job-search plan.",
    "OPT Compliance",
    "If you are laid off during initial post-completion OPT, record your final work date, report the employment change to your DSO/SEVP record promptly, and count the calendar-day gap toward the 90-day unemployment limit unless qualifying employment covers it. Do not start a new job until the job is authorized and related to your degree.",
    "A layoff is an employment change, not an automatic loss of status. Your priorities are accurate dates, prompt reporting, evidence, and a realistic plan for the remaining unemployment days.",
    [
      { heading: "What to do on the day you are laid off", paragraphs: ["Ask HR for a written last-day-of-employment confirmation and keep your termination or severance notice. The date that matters for the unemployment calculation is the last day you actually performed qualifying employment, not necessarily the date the company announced a workforce reduction.", "Contact your DSO and explain the dates, role, location, and whether you have another qualifying offer. Keep the email thread or appointment notes in your document vault so you can show how the record was corrected if the SEVP Portal is delayed."] },
      { heading: "How the unemployment days are counted", paragraphs: ["Initial post-completion OPT generally allows 90 cumulative calendar days of unemployment. Weekends and holidays inside a gap count. A new role stops the clock only when it is qualifying employment and the dates are accurately reported.", "Use the existing [90-day OPT unemployment rule](/blog/90-day-unemployment-rule-opt) for the full calculation, and use TrackMyOPT’s [OPT unemployment clock](/tools/opt-clock) to record the final day, next start date, and warning thresholds."] },
      { heading: "Your new-job strategy after a layoff", paragraphs: ["Start with roles that clearly use the knowledge and skills from your degree. Keep the job description, offer letter, supervisor contact, work location, hours, and a short explanation of the degree relationship for each application that advances.", "Do not accept a role that asks you to work before your EAD authorization, hides the worksite, or refuses to provide basic employment details. Track applications, interviews, start dates, and follow-ups in the [TrackMyOPT job tracker](/features/job-tracker)."] },
    ],
    ["Save the layoff notice and last day worked.", "Contact your DSO and ask how to report the employment end date.", "Update the unemployment clock and set alerts before the remaining buffer becomes critical.", "Preserve the offer letter, job description, worksite, supervisor, hours, and degree-relationship explanation for the next role.", "Use TrackMyOPT AI resume tools to tailor applications, then verify every immigration decision with your DSO or attorney."],
    [
      { question: "How many unemployment days do I have after a layoff on OPT?", answer: "Initial post-completion OPT generally permits up to 90 cumulative calendar days. Subtract all prior qualifying gaps; a layoff does not reset the counter." },
      { question: "Do I have to report a layoff on OPT?", answer: "Report the employment change through the process your DSO provides and keep the confirmation. The SEVP Portal or DSO may be used depending on your authorization and school process." },
      { question: "Can I volunteer after being laid off on OPT?", answer: "A volunteer or unpaid position may qualify during initial OPT only when it is related to your degree and meets the applicable hours and reporting requirements. Ask your DSO before relying on it." },
      { question: "Can TrackMyOPT extend my unemployment limit?", answer: "No. TrackMyOPT calculates dates and sends reminders; it cannot extend an immigration deadline or change a SEVIS record." },
    ],
    [{ label: "ICE practical training guidance", href: ICE_PRACTICAL }, { label: "ICE employment guidance", href: ICE_EMPLOYMENT }, { label: "DHS STEM/OPT reporting PDF", href: DHS_REPORTING }],
    "unemployment",
    [["Initial OPT unemployment limit", "90 cumulative calendar days"], ["STEM OPT combined limit", "150 days across OPT + STEM"], ["First priority after layoff", "Confirm final work date and report the change"]],
    ["laid off on OPT", "OPT layoff unemployment days", "what to do after OPT job loss", "report employment end date OPT", "OPT job search after layoff"],
  ),
  "laid-off-on-stem-opt": guide(
    "laid-off-on-stem-opt",
    "Laid Off on STEM OPT? I-983, Employer Changes & the 150-Day Rule",
    "A practical STEM OPT layoff guide covering final evaluations, the new I-983, reporting deadlines, unemployment days, and safer next steps.",
    "STEM OPT Compliance",
    "After a STEM OPT layoff, report the loss of employment to your DSO within the applicable reporting window, complete a final Form I-983 evaluation with the former employer, and submit a new Form I-983 before beginning a new STEM training opportunity. Initial OPT and STEM OPT together generally allow 150 cumulative unemployment days.",
    "A STEM OPT layoff creates two workstreams: close the old training opportunity correctly and document the new one before you start. Do not simply edit the old employer in the SEVP Portal.",
    [
      { heading: "Close the former STEM OPT opportunity", paragraphs: ["Ask the former employer to review and sign the final Evaluation of Student Progress. The evaluation is due within 10 days after the training opportunity ends, and an early termination does not eliminate the evaluation requirement.", "Give the signed evaluation and the actual last day worked to your DSO. STEM OPT employer records are handled differently from initial OPT employment, so your DSO—not a portal edit alone—may need to update the SEVIS record."] },
      { heading: "Understand the 150-day limit", paragraphs: ["The 150-day figure is cumulative across initial post-completion OPT and the 24-month STEM extension. STEM OPT adds 60 days; it does not reset the 90 days used during initial OPT. Count the calendar-day gap from the first day after the last qualifying employment period.", "Use TrackMyOPT’s [STEM-aware unemployment clock](/tools/opt-clock) and keep your initial OPT and STEM OPT dates in the same timeline."] },
      { heading: "Find a compliant replacement employer", paragraphs: ["The new employer must meet STEM OPT requirements, including E-Verify participation, a qualifying paid training opportunity, at least 20 hours per week, commensurate compensation, supervision, and a real training plan. Complete and sign a new I-983 with the new employer before starting.", "If the replacement role is not clearly related to your qualifying STEM degree, pause and ask your DSO for a written review. A fast start is not worth an avoidable reporting or status problem."] },
    ],
    ["Record the exact final day worked.", "Request the former employer’s final I-983 evaluation.", "Send the evaluation and loss-of-employment update to your DSO.", "Verify the new employer’s E-Verify status and worksite.", "Complete a new I-983 before the new STEM training starts.", "Track the 150-day total and application pipeline in TrackMyOPT."],
    [
      { question: "Does a STEM OPT layoff add 60 new days?", answer: "STEM OPT provides 60 additional days, for a combined limit of 150 days across initial OPT and STEM OPT. It does not create a fresh 60-day counter after every layoff." },
      { question: "What happens to Form I-983 after a STEM OPT layoff?", answer: "You generally need a final evaluation for the former opportunity and a new Form I-983 for a new employer or training opportunity. Ask your DSO for the school’s submission process." },
      { question: "Can I start the new STEM job while the DSO is processing the I-983?", answer: "Do not assume you can. Complete the required documentation and confirm the authorized start date with your DSO before beginning the new STEM training opportunity." },
      { question: "What if the former employer will not sign my final evaluation?", answer: "Document your request and contact your DSO immediately. The DSO can explain the school’s escalation and recordkeeping process; do not sign on the employer’s behalf." },
    ],
    [{ label: "DHS Form I-983 overview", href: I983 }, { label: "DHS STEM reporting requirements", href: DHS_REPORTING }, { label: "SEVP Portal student guide", href: SEVP_GUIDE }],
    "unemployment",
    [["Initial OPT allowance", "Up to 90 days"], ["STEM OPT addition", "60 days"], ["Combined limit", "150 days"], ["Final evaluation timing", "Within 10 days after opportunity ends"]],
    ["laid off on STEM OPT", "STEM OPT job loss", "STEM OPT unemployment after layoff", "final I-983 evaluation", "150 day STEM OPT rule"],
  ),
  "change-employers-stem-opt": guide(
    "change-employers-stem-opt",
    "How to Change Employers on STEM OPT: New I-983 and SEVIS Deadlines",
    "Learn the STEM OPT employer-change sequence, new Form I-983 requirements, final evaluations, reporting deadlines, and unemployment-day risks.",
    "STEM OPT Compliance",
    "To change STEM OPT employers, finish the old training opportunity, complete its final evaluation, report the change to your DSO, verify the new employer and worksite, and submit a new Form I-983 before starting the new opportunity. STEM OPT students should not treat an employer change like a simple SEVP Portal edit.",
    "The safest sequence is: finish and document the old job, contact the DSO, qualify the new employer, complete the new I-983, then start on the confirmed date.",
    [
      { heading: "Before you resign or accept the new offer", paragraphs: ["Ask the new employer for its legal employer name, EIN, E-Verify information, worksite, supervisor, hours, compensation, and training-plan contact. Compare those details with the STEM OPT requirements before you give notice.", "Save the offer letter and a job description that connects the duties to your qualifying STEM degree. The [degree-relationship guide](/blog/opt-job-related-to-degree) explains how to write that explanation without relying on a job title alone."] },
      { heading: "Complete the employer transition in the right order", paragraphs: ["Give the former employer a chance to review the final evaluation, record the actual end date, and send the evaluation to your DSO. Then work with the new employer on a complete Form I-983. The employer’s signatory must have authority and understand the training plan.", "Do not delete the old employer or add the new employer in the portal as a substitute for the DSO/SEVIS process. The [SEVP Portal guide](/blog/sevp-portal-guide-opt) is useful for personal-data edits, but STEM employer changes require DSO coordination."] },
      { heading: "Protect the gap between employers", paragraphs: ["Every calendar day without qualifying employment can reduce the combined unemployment buffer. Use a written end date and a confirmed new start date, and ask the DSO how the school wants the gap entered.", "Track the new employer, I-983 signature status, E-Verify confirmation, and start date in TrackMyOPT’s [STEM planner](/dashboard/opt-tools/stem-opt)."] },
    ],
    ["Collect the new employer’s E-Verify and worksite details.", "Save the old employer’s last-day confirmation.", "Complete and sign the final evaluation within 10 days after the old opportunity ends.", "Submit the new I-983 through your DSO before starting.", "Log the transition gap and set unemployment alerts."],
    [
      { question: "How quickly must I report a STEM OPT employer change?", answer: "DHS reporting materials generally require the student to notify the DSO and submit a new I-983 within 10 days of an employer change. Confirm the exact process with your DSO." },
      { question: "Can I keep working for the old and new STEM employers?", answer: "Concurrent STEM OPT employment can be possible only when each opportunity independently meets the requirements and is documented. Ask your DSO before adding or changing employers." },
      { question: "Do I need a final evaluation when I change employers?", answer: "Yes, a final evaluation is generally due when a STEM training opportunity ends, even if it ends before the planned date." },
      { question: "Can I change employers if the new company is not in E-Verify yet?", answer: "Do not start the STEM opportunity until the employer meets the applicable E-Verify and documentation requirements. Verify with your DSO." },
    ],
    [{ label: "DHS Form I-983 overview", href: I983 }, { label: "DHS STEM reporting requirements", href: DHS_REPORTING }, { label: "SEVP Portal student guide", href: SEVP_GUIDE }],
    "opt-timeline",
    [["New Form I-983", "Required for each new STEM employer"], ["New employer report", "Generally within 10 days"], ["Final evaluation", "Within 10 days after the old opportunity ends"], ["Minimum STEM training", "At least 20 hours per week"]],
    ["change STEM OPT employer", "new I-983 employer change", "STEM OPT job switch", "STEM OPT SEVIS employer change", "STEM OPT deadlines"],
  ),
  "stem-opt-six-month-validation-report": guide(
    "stem-opt-six-month-validation-report",
    "STEM OPT 6-Month Validation Reports and Self-Evaluations: Complete Calendar",
    "A practical STEM OPT calendar for six-month validation reports, the 12-month self-evaluation, final evaluation, and employer-change reporting.",
    "STEM OPT Reporting",
    "STEM OPT students must validate required personal and employment information with their DSO every six months. They also submit a first self-evaluation at 12 months and a final evaluation when the STEM training opportunity ends. The reports and evaluations have different deadlines, so put all of them on one calendar.",
    "Six-month validation confirms that core SEVIS information is still accurate; the 12-month and final evaluations describe training progress. Missing one can create a preventable status and recordkeeping problem.",
    [
      { heading: "The STEM OPT reporting calendar", paragraphs: ["Start with the STEM OPT start date on your EAD and I-20. Mark the six-month validation dates, the 12-month evaluation date, the final evaluation date, and any 10-day reporting windows for address, employer, or employment changes.", "DHS’s [STEM OPT reporting requirements](https://studyinthestates.dhs.gov/assets/sevpstemoptreportingrequirementsfinal.pdf) distinguish student and employer duties. Save the PDF and your school’s instructions alongside your calendar."] },
      { heading: "What goes into each report", paragraphs: ["A validation report confirms information such as your legal name, address, employer name/address, and current practical-training status. The self-evaluation explains progress toward the learning objectives in Form I-983; it is not a generic performance review.", "Ask the employer’s authorized signatory to review and sign the evaluation. Keep a copy of the submitted document and proof that the DSO received it."] },
      { heading: "When the calendar changes", paragraphs: ["An employer change, loss of employment, material I-983 change, address change, or early end date can create a new deadline. Do not wait for the next six-month date. Contact your DSO as soon as the change occurs.", "TrackMyOPT’s [STEM OPT planner](/dashboard/opt-tools/stem-opt) can store the dates and reminders, while the DSO remains the person who updates and confirms your SEVIS record."] },
    ],
    ["Enter the STEM OPT start date and calculate six-month checkpoints.", "Create reminders 30, 14, and 3 days before each validation date.", "Draft the 12-month self-evaluation from the I-983 learning objectives.", "Get the employer’s signature and send the evaluation to your DSO.", "Create a final-evaluation reminder for any early end or employer change."],
    [
      { question: "How often are STEM OPT validation reports due?", answer: "They are generally due every six months during STEM OPT. Confirm the due dates shown in your SEVP Portal and your school’s instructions." },
      { question: "When is the first STEM OPT self-evaluation due?", answer: "The first evaluation is due at the 12-month point after the STEM OPT start date, and a final evaluation is due when the training opportunity ends." },
      { question: "What if I miss a validation report?", answer: "Contact your DSO immediately, explain what happened, and ask how to correct the record. Do not assume a late submission is harmless." },
      { question: "Can my employer write the self-evaluation for me?", answer: "The student completes the self-evaluation and the employer reviews and signs it. The content should accurately describe your progress and training." },
    ],
    [{ label: "DHS STEM OPT reporting requirements", href: DHS_REPORTING }, { label: "DHS Form I-983 overview", href: I983 }, { label: "SEVP Portal student guide", href: SEVP_GUIDE }],
    "opt-timeline",
    [["Validation cadence", "Every 6 months"], ["First evaluation", "At 12 months"], ["Final evaluation", "When the opportunity ends"], ["Typical change window", "Within 10 days"]],
    ["STEM OPT six month validation report", "STEM OPT self evaluation deadline", "STEM OPT reporting calendar", "12 month I-983 evaluation", "STEM OPT final evaluation"],
  ),
  "opt-job-related-to-degree": guide(
    "opt-job-related-to-degree",
    "How to Explain That Your OPT Job Is Related to Your Degree—with Examples",
    "Learn how to document the relationship between your OPT job and degree using duties, skills, coursework, evidence, and a clear explanation.",
    "OPT Employment",
    "An OPT job is related to your degree when the duties use knowledge, skills, or techniques from your major or course of study. Explain the connection with the actual duties—not just the job title—and keep the job description, supervisor details, dates, hours, and a signed relationship letter when the connection is not obvious.",
    "A strong relationship explanation answers three questions: what did you study, what do you do, and which skills or knowledge connect the two? Keep the explanation specific enough for a DSO or future adjudicator to understand it.",
    [
      { heading: "Use duties, not labels", paragraphs: ["Job titles vary widely. Start with the position’s recurring duties, tools, deliverables, and decisions. Then map each duty to a course, technical skill, research method, or professional competency from the qualifying degree.", "For example, a data-analytics graduate might connect SQL modeling, dashboard design, experimentation, and statistical reporting to coursework in databases, statistics, and machine learning. A vague statement such as “the role is technical” is weaker than a duty-by-duty explanation."] },
      { heading: "Build a one-page relationship statement", paragraphs: ["Use a short structure: degree and concentration; role and department; three to five core duties; the knowledge or skills each duty uses; supervisor confirmation; employment dates and hours. Ask the hiring manager or supervisor to sign when the relationship is not clear from the job description.", "Store the statement with the [OPT employment evidence checklist](/blog/opt-employment-evidence-checklist) and update it if your duties materially change."] },
      { heading: "When the role is broad or interdisciplinary", paragraphs: ["Interdisciplinary roles can qualify, but the explanation must show the connection to the degree that supports the OPT period. A job may use transferable skills without being directly related; ask your DSO to review the facts before relying on it.", "The official [ICE practical-training guidance](https://www.ice.gov/sevis/practical-training) confirms that OPT must relate to the student’s major or course of study."] },
    ],
    ["Copy the final job description and offer letter.", "List three to five recurring duties.", "Map each duty to degree knowledge, skills, or coursework.", "Ask the supervisor for a signed relationship letter if the connection is not obvious.", "Save the explanation and update it if duties or worksite change."],
    [
      { question: "Does my job title have to match my degree?", answer: "No. The analysis focuses on duties and the knowledge and skills used, not only the title. Keep a clear explanation connecting the role to your major or course of study." },
      { question: "Can an interdisciplinary job qualify for OPT?", answer: "It may, if the duties are directly related to the qualifying degree. Discuss an unclear or mixed role with your DSO before relying on it." },
      { question: "Who should sign a degree-relationship letter?", answer: "A hiring official, supervisor, or manager who understands your duties can sign it. Keep their name, title, contact information, and the date." },
      { question: "Should I upload the relationship statement to the SEVP Portal?", answer: "Keep it with your records and provide it through the process your DSO recommends. The portal does not replace your evidence file." },
    ],
    [{ label: "ICE practical training guidance", href: ICE_PRACTICAL }, { label: "DHS STEM Form I-983 overview", href: I983 }],
    "opt-timeline",
    [["Best evidence", "Duties + degree-skill mapping"], ["Weak evidence", "Job title alone"], ["Useful extra", "Signed supervisor letter"], ["Update trigger", "Material duty or worksite change"]],
    ["OPT job related to degree", "explain employment related to field of study", "OPT degree relationship letter", "how to prove OPT job is related", "SEVP employment relationship"],
  ),
  "opt-employment-evidence-checklist": guide(
    "opt-employment-evidence-checklist",
    "OPT Employment Evidence Checklist: What to Save for USCIS and Future Visas",
    "A practical OPT recordkeeping checklist for offer letters, duties, dates, hours, supervisors, work locations, payroll, reporting, and future H-1B or visa filings.",
    "OPT Recordkeeping",
    "Save evidence that proves who employed you, what you did, where and when you worked, how many hours you worked, how the job related to your degree, and how you reported the employment. Keep a separate folder for each employer and preserve the records after OPT ends.",
    "The best evidence is contemporaneous: collect it when you start, update it when duties change, and close the folder when the job ends. A future filing is much easier when the dates and documents already agree.",
    [
      { heading: "The core employer folder", paragraphs: ["For each employer, save the signed offer letter, job description, start and end dates, worksite, supervisor contact, hours per week, compensation, and any contract or staffing-agency agreement. Keep a copy of the employer’s E-Verify information for STEM OPT.", "Add a short [degree-relationship statement](/blog/opt-job-related-to-degree) when the job title does not make the connection obvious."] },
      { heading: "The activity and reporting folder", paragraphs: ["Keep pay statements, timesheets or schedules, invoices for authorized contract work, performance reviews, project summaries, and correspondence about material changes. Save SEVP Portal screenshots or DSO confirmation showing the employment was reported.", "Do not create records after the fact or alter dates. If something is missing, write a dated explanation and ask the DSO or attorney how to address it."] },
      { heading: "Preparing for future immigration filings", paragraphs: ["H-1B, O-1, green-card, and travel processes may require a consistent employment history. Keep all I-20s, EADs, USCIS notices, tax documents, and employer evidence in a secure [TrackMyOPT Document Vault](/features/compliance).", "Use AI tools to organize a checklist or draft a neutral summary, but review every date and never upload confidential immigration documents to an untrusted service."] },
    ],
    ["Create one folder per employer.", "Save offer, duties, dates, hours, worksite, supervisor, and pay records.", "Save the degree-relationship explanation.", "Save DSO/SEVP reporting confirmation and screenshots.", "Store I-20s, EADs, USCIS notices, and tax records securely.", "Review the folder at every job change."],
    [
      { question: "How long should I keep OPT employment records?", answer: "Keep them for the entire OPT period and beyond, especially if you may pursue H-1B, O-1, a green card, a future visa, or an immigration benefit that asks about your work history." },
      { question: "Do I need pay stubs for unpaid initial OPT work?", answer: "Keep the evidence that applies to the role, such as the offer, duties, supervisor, dates, hours, and proof of the organization and work performed. Ask your DSO about the specific position." },
      { question: "What if my employer will not give me a job description?", answer: "Request one in writing and keep your request. Preserve your offer letter, manager confirmation, project records, and a factual duties summary, then ask your DSO or attorney what additional evidence is appropriate." },
      { question: "Can TrackMyOPT store my documents?", answer: "TrackMyOPT’s Document Vault is designed to organize OPT documents and reminders. Review the product’s current privacy and security terms before uploading sensitive records." },
    ],
    [{ label: "ICE practical training guidance", href: ICE_PRACTICAL }, { label: "DHS Form I-983 overview", href: I983 }, { label: "TrackMyOPT compliance tools", href: "https://www.trackmyopt.com/features/compliance" }],
    "opt-timeline",
    [["Minimum folder set", "One folder per employer"], ["Critical proof", "Dates, duties, hours, worksite"], ["Future value", "H-1B and visa consistency"], ["Best practice", "Collect documents contemporaneously"]],
    ["OPT employment evidence", "OPT documents to keep", "OPT proof of employment checklist", "what records to save on OPT", "OPT evidence for H1B"],
  ),
  "ead-card-lost-stolen-incorrect-never-delivered": guide(
    "ead-card-lost-stolen-incorrect-never-delivered",
    "EAD Card Lost, Stolen, Incorrect or Never Delivered? Complete Recovery Guide",
    "Learn the correct next step when your OPT EAD is lost, stolen, damaged, incorrect, or marked delivered but never received.",
    "USCIS and EAD",
    "Separate the problem into four categories: lost/stolen/damaged, a USCIS printing error, a non-USCIS error, or non-delivery. Save your receipt and approval notice, check USPS and USCIS case status, use USCIS non-delivery inquiry when appropriate, and follow the current Form I-765 replacement instructions. Do not work without valid authorization.",
    "Do not file the same remedy for every EAD problem. A USCIS printing error, a lost card, and a card that never arrived can require different evidence and fee treatment.",
    [
      { heading: "If the card is lost, stolen, or damaged", paragraphs: ["Write down when and where you noticed the loss, keep a police report if one exists, and gather a copy of the card or approval notice. Follow the current [Form I-765 instructions](https://www.uscis.gov/sites/default/files/document/forms/i-765instr.pdf) for a replacement and filing fee.", "If you are outside the United States, ask an immigration attorney before assuming a replacement process is available from abroad. Your ability to travel and return is a separate issue from replacing the card."] },
      { heading: "If the card contains an error", paragraphs: ["Compare the name, category, dates, A-number, and other fields against your approval notice and identity documents. If the error appears to be USCIS’s fault, follow USCIS’s correction instructions; if the error came from the filing, a new application or fee may be required.", "Do not alter the card. Photograph both sides, preserve the envelope, and ask your DSO or attorney which correction route applies."] },
      { heading: "If the card never arrived", paragraphs: ["Check the case status and USPS tracking first. USCIS’s [Non-Delivery of Card](https://egov.uscis.gov/e-request/ndc) tool explains when an inquiry may be filed and what information you need. A card shown as mailed is not the same as a card in your possession.", "Record the inquiry number, mailing address, date, and any returned-mail message. Track the case in the [TrackMyOPT USCIS dashboard](/dashboard/case-status) so you can see changes while you work with USCIS and your DSO."] },
    ],
    ["Photograph the card, envelope, approval notice, and receipt.", "Classify the issue: lost/stolen/damaged, USCIS error, applicant error, or non-delivery.", "Check USCIS case status and USPS tracking.", "Use the official USCIS remedy and current fee instructions.", "Do not work until your authorization and card situation are confirmed."],
    [
      { question: "Can I work if my OPT EAD was lost?", answer: "Do not assume a lost card changes your work authorization. Keep proof of the underlying approval and ask your employer, DSO, and an attorney what documentation is acceptable for your situation." },
      { question: "What if USCIS printed my name or dates incorrectly?", answer: "Follow USCIS’s correction process for an agency error and include the card and evidence requested. Do not file a replacement as if the card were lost without checking the instructions." },
      { question: "When can I submit an EAD non-delivery inquiry?", answer: "USCIS’s Non-Delivery of Card tool describes timing and required information. Check the current USCIS instructions before submitting an inquiry." },
      { question: "Does an approval notice replace the EAD for work?", answer: "Do not assume it does. Employment verification and work authorization rules are fact-specific; confirm with your employer, DSO, or immigration attorney." },
    ],
    [{ label: "USCIS Form I-765 instructions", href: I765_INSTRUCTIONS }, { label: "USCIS EAD non-delivery inquiry", href: USCIS_NON_DELIVERY }, { label: "TrackMyOPT case-status tracker", href: "https://www.trackmyopt.com/features/case-status" }],
    "case-status",
    [["First check", "USCIS case status + USPS tracking"], ["Issue types", "Lost, error, or non-delivery"], ["Work rule", "Do not work without confirmed authorization"], ["Record to save", "Inquiry number and correspondence"]],
    ["lost OPT EAD card", "stolen EAD replacement", "OPT EAD never delivered", "incorrect EAD card USCIS", "replace OPT EAD"],
  ),
  "can-you-start-work-before-opt-ead-arrives": guide(
    "can-you-start-work-before-opt-ead-arrives",
    "Can You Start Working Before Your OPT EAD Arrives?",
    "Understand the OPT start-date, EAD-in-hand, I-9, unemployment-day, and employer-communication issues before beginning work.",
    "OPT Work Authorization",
    "Do not start an OPT job before you have valid employment authorization and the authorized start date has arrived. An I-765 receipt, approval status, or USPS tracking number is not automatically permission to work. If the EAD is delayed, document the delay and contact your DSO and employer.",
    "The job offer can be signed before the EAD arrives; the work itself should wait until the authorization requirements are satisfied. Never let an employer pressure you into an early start.",
    [
      { heading: "Offer date, start date, and work-authorized date are different", paragraphs: ["An employer may make an offer and plan a start date before the card arrives. That planning does not itself grant employment authorization. Compare the EAD authorization dates, I-20 recommendation, USCIS approval, and employer’s I-9 process.", "ICE’s practical-training guidance says students should wait to begin work until they receive the EAD. Read the [official guidance](https://www.ice.gov/sevis/practical-training) and ask your DSO about a delayed start or revised offer letter."] },
      { heading: "What to do if the start date has passed", paragraphs: ["Tell the employer you cannot begin until the work-authorization condition is satisfied. Ask HR to update the planned start date in writing, and keep the email. Track the USCIS case and the unemployment timeline separately.", "Use the [OPT unemployment clock](/tools/opt-clock) to record the authorization start date and the actual first qualifying work date. If the delay creates a serious concern, speak with your DSO promptly rather than waiting for day 90."] },
      { heading: "Avoid common employer mistakes", paragraphs: ["Do not backdate the start date, perform onboarding work, answer customer tickets, or accept unpaid “training” that is actually productive work before authorization. Ask the employer to confirm what pre-start activities are permitted by its HR and legal teams.", "If the employer cannot accommodate a lawful start date, look for another qualifying opportunity and preserve the written record of the conversation."] },
    ],
    ["Check the EAD authorization start date.", "Confirm the employer’s planned start date in writing.", "Do not perform productive work before authorization.", "Track the USCIS case and card delivery.", "Contact your DSO if the delay affects unemployment or status."],
    [
      { question: "Can I start work after USCIS approves OPT but before the EAD arrives?", answer: "Do not assume approval alone permits work. ICE guidance instructs students to wait for the EAD; confirm your exact situation with your DSO and employer’s I-9 team." },
      { question: "Can I complete orientation before the EAD arrives?", answer: "Orientation can include productive work, so ask the employer and DSO before attending. Do not perform services for the employer until you are authorized." },
      { question: "Does waiting for the EAD use unemployment days?", answer: "If the OPT authorization period has started and you do not have qualifying employment, the days may count. Track the dates and contact your DSO." },
      { question: "Can an employer keep my job offer open?", answer: "Many employers can revise a start date, but that is a business decision. Request the revised date in writing and keep it with your OPT evidence." },
    ],
    [{ label: "ICE practical training guidance", href: ICE_PRACTICAL }, { label: "USCIS EAD non-delivery inquiry", href: USCIS_NON_DELIVERY }, { label: "TrackMyOPT OPT clock", href: "https://www.trackmyopt.com/tools/opt-clock" }],
    "unemployment",
    [["Before work", "Offer and start date can be planned"], ["Before authorization", "Do not perform productive work"], ["If delayed", "Document, notify HR, contact DSO"], ["Track separately", "USCIS case + unemployment days"]],
    ["can I work before OPT EAD arrives", "start job before EAD card", "OPT approval but no EAD", "OPT EAD delay work", "I-9 OPT EAD"],
  ),
  "what-counts-as-20-hours-on-opt": guide(
    "what-counts-as-20-hours-on-opt",
    "What Counts as 20 Hours per Week on OPT? Multiple Jobs, Gaps and Part-Time Work",
    "Understand the 20-hour threshold, multiple jobs, calendar weeks, start and end dates, and evidence for part-time OPT employment.",
    "OPT Employment Rules",
    "For a job to stop the OPT unemployment clock, it generally must be related to your degree and involve at least 20 hours per week. Keep the employer’s stated schedule, actual hours, duties, start/end dates, and reporting confirmation. Multiple qualifying jobs can be possible, but each must independently satisfy the applicable requirements.",
    "Twenty hours is not a permission slip for any job. The degree relationship, authorization period, employer reporting, and evidence matter as much as the number of hours.",
    [
      { heading: "The 20-hour threshold in context", paragraphs: ["The 20-hour figure is a weekly minimum commonly used for qualifying OPT employment. Ask your DSO how your school records part-time work, concurrent roles, contract work, or a schedule that fluctuates from week to week.", "Initial OPT and STEM OPT do not have identical employer rules. STEM OPT also requires a qualifying paid training relationship, E-Verify employer, supervision, and a completed I-983."] },
      { heading: "Multiple jobs and changing schedules", paragraphs: ["A student can have more than one qualifying position in some OPT situations, but the positions should each be related to the degree and accurately reported. Do not add hours from unrelated jobs to reach 20 hours.", "If a job falls below 20 hours, the result can depend on the authorization type and facts. Ask the DSO before relying on a short week, unpaid gap, or reduced schedule to stop the unemployment clock."] },
      { heading: "How to document the hours", paragraphs: ["Save the offer letter, schedule, timesheets, pay statements, supervisor confirmation, and any written change to hours. Keep a simple weekly log when the schedule is variable.", "TrackMyOPT’s [job tracker](/features/job-tracker) can hold applications and start dates, while the [employment evidence checklist](/blog/opt-employment-evidence-checklist) helps you preserve proof."] },
    ],
    ["Confirm the role relates to your degree.", "Get the weekly hours and start date in writing.", "Report the employer through your DSO/SEVP process.", "Keep schedules, time records, pay records, and supervisor details.", "Ask your DSO before relying on multiple jobs or a reduced week."],
    [
      { question: "Does exactly 20 hours per week stop the unemployment clock?", answer: "It may if the employment is otherwise qualifying and related to your degree. Keep evidence and confirm the role with your DSO." },
      { question: "Can I combine two 10-hour jobs?", answer: "Multiple qualifying jobs can be possible in some OPT situations, but each job must independently meet the applicable requirements and be reported accurately." },
      { question: "What if I work 19 hours one week?", answer: "Do not assume one short week is harmless or automatically unemployment. Ask your DSO how the authorization and facts should be treated." },
      { question: "Do volunteer hours count for STEM OPT?", answer: "STEM OPT requires paid employment and a qualifying training plan. Volunteer work does not generally satisfy the STEM OPT employment requirements." },
    ],
    [{ label: "ICE employment guidance", href: ICE_EMPLOYMENT }, { label: "ICE practical training guidance", href: ICE_PRACTICAL }, { label: "DHS Form I-983 overview", href: I983 }],
    "unemployment",
    [["Common minimum", "20 hours per week"], ["Must also be", "Degree-related and authorized"], ["STEM addition", "Paid, E-Verify, I-983 training"], ["Best proof", "Schedule + actual records"]],
    ["what counts as 20 hours on OPT", "OPT part time hours", "multiple jobs OPT 20 hours", "OPT unemployment 20 hours", "STEM OPT hours per week"],
  ),
  "employer-refuses-form-i983": guide(
    "employer-refuses-form-i983",
    "What If Your Employer Refuses to Complete or Sign Form I-983?",
    "Steps to take when a STEM OPT employer will not provide information, sign Form I-983, complete an evaluation, or document a material change.",
    "STEM OPT Employer Issues",
    "Do not sign the employer section yourself or start a STEM OPT training opportunity without the required Form I-983 process. Ask the employer in writing, preserve the refusal, contact your DSO immediately, and prepare a compliant alternative before your unemployment buffer becomes critical.",
    "Form I-983 is a shared training-plan document. A missing employer signature is a compliance problem to escalate—not a blank field to guess or sign for someone else.",
    [
      { heading: "Make one clear written request", paragraphs: ["Send HR or the authorized signatory a checklist of the information needed: employer identity and EIN, worksite, supervisor, duties, learning objectives, compensation, hours, oversight, and signatures. Give a reasonable response date and keep the message.", "Point the employer to the [DHS Form I-983 overview](https://studyinthestates.dhs.gov/form-i-983-overview), which explains the training-plan obligations. Ask who has signatory authority if your manager is not authorized to sign."] },
      { heading: "Contact the DSO before the deadline", paragraphs: ["Give your DSO the offer, job description, employer details, request history, and any deadline. The DSO can tell you whether the position can be reported, whether a different signatory is needed, and what to do if the opportunity cannot proceed.", "Never fill the employer certification from assumptions and never sign on the employer’s behalf. Keep a dated record of every request and response."] },
      { heading: "If the job cannot proceed", paragraphs: ["Ask the DSO how the opportunity should be treated and when loss of employment must be reported. Start a compliant search for another employer before the unemployment buffer is exhausted.", "Use TrackMyOPT’s [STEM planner](/dashboard/opt-tools/stem-opt), [employer evidence checklist](/blog/opt-employment-evidence-checklist), and [AI resume tools](/features/resume-ai) to manage the replacement search without confusing AI suggestions with legal approval."] },
    ],
    ["Request the I-983 information and signature in writing.", "Identify the employer’s authorized signatory.", "Send the offer and refusal evidence to your DSO.", "Do not sign the employer section or start without the required process.", "Record the deadline and build a backup search plan."],
    [
      { question: "Can I sign Form I-983 for my employer?", answer: "No. The employer certification must be completed and signed by an authorized employer official. Contact your DSO if the employer asks you to sign for them." },
      { question: "What if HR does not understand STEM OPT?", answer: "Share the DHS Form I-983 overview and ask for the person with signatory authority. Give your DSO the correspondence if the employer still refuses." },
      { question: "Can I change employers because my employer refuses Form I-983?", answer: "You may need to find a compliant opportunity, but first contact your DSO about reporting, the end date, and a new I-983. Do not switch informally." },
      { question: "Does a refusal automatically terminate my STEM OPT?", answer: "The effect depends on your authorization and facts. Contact your DSO immediately; do not wait for a reporting deadline to pass." },
    ],
    [{ label: "DHS Form I-983 overview", href: I983 }, { label: "DHS STEM reporting requirements", href: DHS_REPORTING }, { label: "SEVP Portal student guide", href: SEVP_GUIDE }],
    "opt-timeline",
    [["Required before filing", "Student + employer complete I-983"], ["Who signs", "Authorized employer official"], ["If refused", "Document, escalate to DSO"], ["Never do", "Sign for employer or guess fields"]],
    ["employer refuses I-983", "employer will not sign STEM OPT form", "Form I-983 signature problem", "STEM OPT HR refuses", "what if employer refuses I983"],
  ),
  "stem-opt-employer-site-visit-preparation": guide(
    "stem-opt-employer-site-visit-preparation",
    "STEM OPT Employer Site Visits: How Students and Employers Should Prepare",
    "A practical preparation guide for STEM OPT students and employers covering Form I-983 accuracy, worksite evidence, supervision, compensation, and training records.",
    "STEM OPT Compliance",
    "A STEM OPT employer should be able to explain and document the training opportunity described in Form I-983. Students and employers should keep the worksite, supervisor, duties, hours, compensation, learning objectives, oversight, and evaluations consistent with the submitted plan. If something changes, report it to the DSO promptly.",
    "Preparation is ordinary recordkeeping, not a performance. The strongest protection is a real training plan that matches the work being performed and can be explained by the student, supervisor, and authorized signatory.",
    [
      { heading: "What the employer should keep ready", paragraphs: ["The employer should be able to locate the signed I-983, E-Verify information, offer and payroll records, worksite details, supervisor information, training objectives, oversight process, and evidence that the role is commensurate with similarly situated U.S. workers.", "The [DHS I-983 overview](https://studyinthestates.dhs.gov/form-i-983-overview) describes the training-plan commitments, including learning objectives, supervision, evaluation, resources, and non-displacement of U.S. workers."] },
      { heading: "What the student should be able to explain", paragraphs: ["Be ready to describe your day-to-day duties, the skills you are learning, how the role relates to your STEM degree, who supervises you, how often you meet, where you work, and how progress is evaluated. Your answers should match the I-983 without memorizing a script.", "Review the [degree relationship guide](/blog/opt-job-related-to-degree) and update your evidence folder if the job changed materially."] },
      { heading: "When the plan no longer matches reality", paragraphs: ["A new worksite, supervisor, compensation change, reduced hours, changed learning objectives, remote-work arrangement, or employer restructuring can require a material-change report or new I-983. Contact the DSO before assuming a small change is immaterial.", "Do not backdate documents or create a paper-only training plan. Accurate records and prompt escalation are safer than trying to make an old document fit new facts."] },
    ],
    ["Keep the signed I-983 and current worksite details accessible.", "Confirm E-Verify, supervisor, hours, compensation, and duties.", "Review the learning objectives and evaluation process.", "Document supervision meetings and training progress.", "Report material changes to the DSO promptly.", "Never backdate or alter records."],
    [
      { question: "Can DHS conduct a STEM OPT site visit?", answer: "STEM OPT rules allow government verification of the training opportunity. Students and employers should keep the I-983 and related records accurate and accessible." },
      { question: "What should a student say during a site visit?", answer: "Answer truthfully about your actual duties, supervisor, worksite, hours, learning objectives, and evaluation process. Do not guess; ask your DSO or attorney about a legal question." },
      { question: "Does remote work change the I-983?", answer: "A remote or hybrid arrangement can affect the worksite, supervision, and training plan. Ask the DSO whether a material-change update or new I-983 is required." },
      { question: "What if my actual duties differ from Form I-983?", answer: "Contact the DSO promptly. Material deviations may need to be reported and documented; do not wait for a site visit." },
    ],
    [{ label: "DHS Form I-983 overview", href: I983 }, { label: "DHS STEM reporting requirements", href: DHS_REPORTING }, { label: "ICE employment guidance", href: ICE_EMPLOYMENT }],
    "opt-timeline",
    [["Core document", "Signed Form I-983"], ["Core consistency", "Duties, worksite, supervisor, hours"], ["Core evidence", "Training and evaluation records"], ["Change trigger", "Material deviation or employer change"]],
    ["STEM OPT site visit", "STEM OPT employer inspection", "prepare for STEM OPT site visit", "Form I-983 site visit", "STEM OPT compliance audit"],
  ),
};

export function getComplianceGuide(slug: string): ComplianceGuide {
  const item = COMPLIANCE_GUIDES[slug];
  if (!item) throw new Error(`Unknown compliance guide: ${slug}`);
  return item;
}

function renderParagraph(text: string) {
  const parts = text.split(/(\[[^\]]+\]\([^\)]+\))/g);
  return parts.map((part, index) => {
    const match = part.match(/^\[([^\]]+)\]\(([^\)]+)\)$/);
    if (!match) return <span key={`${part}-${index}`}>{part}</span>;
    if (match[2].startsWith("http")) {
      return <a key={`${part}-${index}`} href={match[2]} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline dark:text-blue-400">{match[1]}</a>;
    }
    return <Link key={`${part}-${index}`} href={match[2]} className="text-blue-600 underline dark:text-blue-400">{match[1]}</Link>;
  });
}

export function ComplianceClusterGuide({ data }: { data: ComplianceGuide }) {
  const canonical = `${BASE}/${data.slug}`;
  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <BreadcrumbSchema items={[{ name: "Home", url: "https://www.trackmyopt.com" }, { name: "Blog", url: `${BASE}` }, { name: data.title, url: canonical }]} />
      <BlogPostSchema title={data.title} description={data.metadata.description} publishedDate={data.publishedDate} modifiedDate="2026-07-27" canonicalUrl={canonical} faqItems={data.faqs} />

      <nav className="mb-8 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-blue-600">Home</Link><span>/</span><Link href="/blog" className="hover:text-blue-600">Blog</Link><span>/</span><span className="text-gray-900 dark:text-white">{data.category}</span>
      </nav>

      <header className="mb-10">
        <div className="mb-4 flex items-center gap-3"><span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">{data.category}</span><span className="flex items-center gap-1 text-sm text-gray-500"><Clock className="h-3.5 w-3.5" /> {data.readTime}</span></div>
        <h1 className="mb-5 text-4xl font-bold leading-tight text-gray-900 dark:text-white sm:text-5xl">{data.title}</h1>
        <p className="text-xl leading-relaxed text-gray-600 dark:text-gray-300">{data.answer}</p>
        <div className="mt-5 flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400"><span>Last updated: July 27, 2026</span><span>•</span><span>Written by Vinay Kumar</span></div>
      </header>

      <div className="mb-8 rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-950/30"><p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">Key takeaway</p><p className="text-lg font-medium leading-relaxed text-gray-900 dark:text-white">{data.takeaway}</p></div>
      <BlogProductCTA variant={data.ctaVariant} sourcePage={`/blog/${data.slug}`} />

      <div className="prose prose-lg prose-longform max-w-none dark:prose-invert">
        <div className="not-prose mb-10 rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">Who this guide is for</h2><p className="mb-5 text-sm text-gray-600 dark:text-gray-400">{data.audience}</p>
          <div className="grid gap-3 sm:grid-cols-2">{data.facts.map(([label, value]) => <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p><p className="mt-1 font-semibold text-gray-900 dark:text-white">{value}</p></div>)}</div>
        </div>

        {data.sections.map((section, index) => <section key={section.heading} id={`section-${index + 1}`}><h2>{section.heading}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{renderParagraph(paragraph)}</p>)}{section.bullets && <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}</section>)}

        <section id="checklist">
          <h2>Practical checklist</h2>
          <div className="not-prose my-6 space-y-3">{data.checklist.map((item) => <div key={item} className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" /><span className="text-sm text-gray-700 dark:text-gray-300">{item}</span></div>)}</div>
          <p>TrackMyOPT can organize these dates, documents, applications, and reminders. Its <Link href="/features/resume-ai">AI resume tools</Link> can help tailor job-search materials, and the <Link href="/ai-facts">AI facts hub</Link> provides plain-English definitions. Neither replaces your DSO or a licensed immigration attorney.</p>
        </section>

        <section id="sources">
          <h2>Official sources</h2>
          <ul>{data.sources.map((source) => <li key={source.href}><a href={source.href} target="_blank" rel="noopener noreferrer">{source.label} <ExternalLink className="inline h-3.5 w-3.5" /></a></li>)}</ul>
        </section>

        <section id="faq"><h2>Frequently asked questions</h2><div className="not-prose space-y-4">{data.faqs.map((faq) => <div key={faq.question} className="rounded-xl border border-gray-200 p-5 dark:border-zinc-800"><h3 className="font-bold text-gray-900 dark:text-white">{faq.question}</h3><p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{faq.answer}</p></div>)}</div></section>
      </div>

      <div className="mt-10 rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-zinc-800 dark:bg-zinc-900"><h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Related OPT compliance guides</h2><div className="grid gap-3 sm:grid-cols-2">{data.related.map((item) => <Link key={item.slug} href={`/blog/${item.slug}`} className="text-sm text-blue-600 hover:underline dark:text-blue-400">→ {item.label}</Link>)}</div></div>
      <AuthorBio />
      <div className="mt-12 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center text-white"><h2 className="mb-3 text-2xl font-bold">Keep every OPT deadline and document together</h2><p className="mx-auto mb-6 max-w-lg text-blue-100">Track employment, unemployment days, USCIS updates, STEM reporting, and job applications in one dashboard.</p><Link href="/login" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-blue-600 hover:bg-blue-50">Start tracking free <ArrowRight className="h-4 w-4" /></Link></div>
      <p className="mt-8 flex items-start gap-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />This article is educational information, not legal advice. Confirm important decisions with your DSO or a licensed immigration attorney.</p>
    </article>
  );
}
