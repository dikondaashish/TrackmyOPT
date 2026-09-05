import type { Metadata } from "next";
import { BlogPostImage } from "@/components/blog/BlogPostImage";
import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock, ExternalLink, ShieldCheck, FolderOpen } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
import { AuthorBio } from "@/components/blog/AuthorBio";

const CANONICAL = "https://www.trackmyopt.com/blog/opt-employment-evidence-checklist";

export const metadata: Metadata = {
  title: "OPT Employment Evidence Checklist: What to Save for USCIS and Future Visas",
  description:
    "A complete OPT employment evidence guide: every document to collect from every employer, how to organize records by authorization period, and why today's files matter for tomorrow's H-1B petition, green card, or visa application.",
  keywords: [
    "OPT employment evidence",
    "OPT documents to keep",
    "OPT proof of employment checklist",
    "what records to save on OPT",
    "OPT evidence for H1B",
    "OPT employment history documentation",
    "USCIS OPT employment records",
  ],
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: "OPT Employment Evidence Checklist: What to Save for USCIS and Future Visas",
    description: "Every document to collect from every OPT employer — organized by category, with future H-1B and green card filing in mind.",
    url: CANONICAL,
    type: "article",
    images: [{ url: "https://www.trackmyopt.com/og-image.jpg", width: 1200, height: 630, alt: "OPT Employment Evidence Checklist" }],
  },
    twitter: {
        card: "summary_large_image",
        title: "OPT Employment Evidence Checklist: What to Save for USCIS and Future Visas",
        description: "Every document to collect from every OPT employer — organized by category, with future H-1B and green card filing in mind.",
        images: ["https://www.trackmyopt.com/og-image.jpg"],
    },
};

export default function OptEmploymentEvidenceChecklistPage() {
  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <BlogPostSchema title={metadata.title as string} description={metadata.description as string} publishedDate="2026-07-27" modifiedDate="2026-07-27" author="TrackMyOPT Immigration Team" canonicalUrl={CANONICAL} />
      <BreadcrumbSchema items={[{ name: "Home", url: "https://www.trackmyopt.com" }, { name: "Blog", url: "https://www.trackmyopt.com/blog" }, { name: "OPT Employment Evidence Checklist", url: CANONICAL }]} />

      <header className="mb-10">
        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold mb-4">
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">OPT Recordkeeping</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
          OPT Employment Evidence Checklist: What to Save for USCIS and Future Visas
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          The documents you collect today are the proof you will need tomorrow—for your DSO,
          for an RFE, for an H-1B petition, and for every future visa application that asks
          about your work history. This checklist ensures you never face a gap.
        </p>
        <div className="mt-6 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 11 min read</span>
          <span>•</span>
          <span>Updated July 27, 2026</span>
        </div>
      </header>

      <div className="relative w-full h-[420px] md:h-[520px] rounded-2xl overflow-hidden mb-12 shadow-xl">
        <BlogPostImage src="/blog/opt-employment-evidence-checklist.png" alt="OPT evidence folder with pay stubs, W-2, EAD card, offer letter and evidence checklist on legal pad" className="object-cover w-full h-full" sizes="(max-width: 768px) 100vw, 768px" priority />
      </div>

      {/* Direct Answer */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">Direct Answer</p>
        <p className="text-gray-800 dark:text-gray-100 font-medium leading-relaxed">
          For each OPT employer, collect and keep: signed offer letter, job description, start and
          end dates, worksite address, supervisor contact, hours per week, pay records, and a short
          explanation of how the role relates to your degree. Add DSO/SEVP confirmation of the
          employment report and, for STEM OPT, your Form I-983 and all evaluations. Keep records
          in separate employer folders and preserve them after OPT ends — immigration filings can
          require this history years later.
        </p>
      </div>

      <div className="prose prose-lg dark:prose-invert max-w-none">

        <h2>Why OPT Employment Evidence Matters Beyond OPT</h2>
        <p>
          Most students think about OPT documentation as a compliance tool for their DSO.
          That is true—but it is only the short-term view. OPT employment evidence is also:
        </p>
        <ul>
          <li><strong>H-1B petition support:</strong> USCIS may request evidence that your prior OPT employment was in a specialty occupation consistent with the H-1B role being petitioned.</li>
          <li><strong>Green card PERM foundation:</strong> PERM audits can require documentation that the employer has consistently employed you in the specialty occupation during and after OPT.</li>
          <li><strong>O-1A extraordinary ability evidence:</strong> OPT employment records can support an original contribution or high-salary criterion.</li>
          <li><strong>Future visa application history:</strong> Consular officers often ask applicants to account for all employment since graduation. Missing records create credibility issues.</li>
          <li><strong>RFE responses:</strong> USCIS can issue an RFE for an H-1B petition asking for proof that prior OPT employment was related to the specialty occupation. A complete OPT evidence file turns a stressful RFE into a manageable response.</li>
        </ul>

        <div className="not-prose bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-5 rounded-r-xl my-6">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900 dark:text-amber-300 mb-1">The 7-Year Rule for Immigration Records</p>
              <p className="text-amber-800 dark:text-amber-200 text-sm">
                Keep OPT employment records for at least 7 years after the OPT period ends — or
                longer if you are in an ongoing immigration process (green card, naturalization).
                Do not delete files because you think OPT is behind you. A green card application
                or naturalization interview can ask about employment going back to your first
                authorized period in the United States.
              </p>
            </div>
          </div>
        </div>

        <h2>The Folder System: One Folder Per Employer</h2>
        <p>
          The simplest organizational approach is to create one digital folder per employer,
          named with the employer name and employment dates. Within each folder, use sub-folders
          for the categories below.
        </p>

        <h2>Category 1: Offer and Job Documentation</h2>
        <div className="not-prose">
          <ul className="space-y-3 my-4">
            {[
              { item: "Signed offer letter", why: "Confirms the offer date, start date, position, salary, and employer." },
              { item: "Final job description", why: "The version you were actually hired under — not just what was posted online. Print the posting if possible." },
              { item: "Any employment agreement or contractor agreement", why: "Especially important for staffing or consulting arrangements." },
              { item: "Non-disclosure agreement (NDA)", why: "Confirms the employment relationship and employment start date." },
              { item: "Benefits enrollment confirmation", why: "Evidence of the employment relationship and start date." },
            ].map((row, i) => (
              <li key={i} className="text-gray-800 dark:text-gray-200">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-sm">{row.item}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{row.why}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <h2>Category 2: Employment Dates and Work Location</h2>
        <div className="not-prose">
          <ul className="space-y-3 my-4">
            {[
              { item: "Written start date confirmation", why: "Email from HR, offer letter, or I-9 completion date." },
              { item: "Written end date confirmation", why: "Termination notice, resignation acceptance, separation agreement." },
              { item: "Worksite address", why: "Must match what is reported to your DSO. Critical for STEM OPT and remote work situations." },
              { item: "Schedule or work-hours documentation", why: "Evidence that you met the 20-hour minimum for qualifying employment." },
              { item: "Remote work authorization or agreement", why: "Documents that your remote arrangement was authorized and supervised." },
            ].map((row, i) => (
              <li key={i} className="text-gray-800 dark:text-gray-200">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-sm">{row.item}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{row.why}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <h2>Category 3: Proof of Compensation</h2>
        <div className="not-prose">
          <ul className="space-y-3 my-4">
            {[
              { item: "Pay stubs for each pay period", why: "Best proof of actual compensation, dates of employment, and employer identity." },
              { item: "W-2 for each calendar year", why: "Essential for future tax consistency and visa applications." },
              { item: "Direct deposit records", why: "Secondary confirmation of employment dates and pay." },
              { item: "1099 forms (if applicable for initial OPT freelance)", why: "Confirms the employment relationship and amount. Keep all 1099s even for small amounts." },
            ].map((row, i) => (
              <li key={i} className="text-gray-800 dark:text-gray-200">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-sm">{row.item}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{row.why}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <h2>Category 4: Degree Relationship Documentation</h2>
        <div className="not-prose">
          <ul className="space-y-3 my-4">
            {[
              { item: "Degree-relationship statement", why: "Your written explanation of how the role's duties connect to your major. See the degree-relationship guide for how to write this." },
              { item: "Supervisor or hiring manager letter (if needed)", why: "Signed statement confirming the role's technical requirements and how they align with your degree." },
              { item: "Performance reviews or project summaries", why: "Secondary evidence that your actual duties were consistent with what you reported." },
              { item: "Technical documentation or project descriptions", why: "If you can document the projects you worked on without violating NDA, keep a plain-language description." },
            ].map((row, i) => (
              <li key={i} className="text-gray-800 dark:text-gray-200">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-sm">{row.item}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{row.why}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <h2>Category 5: Reporting and Compliance Records</h2>
        <div className="not-prose">
          <ul className="space-y-3 my-4">
            {[
              { item: "DSO confirmation of employment reporting", why: "Email or portal confirmation that the employer, start date, and worksite were reported." },
              { item: "SEVP Portal screenshot at time of reporting", why: "Captures what was in the record when reporting occurred." },
              { item: "I-20 recommending the OPT period", why: "Confirms the authorized period and academic connection." },
              { item: "EAD card copy (front and back)", why: "Confirms your authorization category, dates, and USCIS approval." },
              { item: "USCIS approval notice (I-797 or EAD approval)", why: "Official proof of OPT approval with receipt and approval dates." },
            ].map((row, i) => (
              <li key={i} className="text-gray-800 dark:text-gray-200">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-sm">{row.item}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{row.why}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <h2>Category 6: STEM OPT Additions</h2>
        <p>
          If you are on STEM OPT, add these documents to the employer folder:
        </p>
        <div className="not-prose">
          <ul className="space-y-3 my-4">
            {[
              { item: "Completed and signed Form I-983 (all pages)", why: "The training plan agreement with the employer. Keep every version if the plan is amended." },
              { item: "Employer E-Verify company ID confirmation", why: "Proof that the employer was actively enrolled when you began." },
              { item: "12-month self-evaluation (signed)", why: "Required evaluation at month 12 of STEM OPT — keep the student and employer portions." },
              { item: "Final evaluation (signed)", why: "Required when the STEM training opportunity ends." },
              { item: "Six-month validation confirmations", why: "DSO confirmation that each six-month validation was completed on schedule." },
            ].map((row, i) => (
              <li key={i} className="text-gray-800 dark:text-gray-200">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-sm">{row.item}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{row.why}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <h2>Category 7: Personal Immigration Records (Lifetime File)</h2>
        <p>
          Separate from employer folders, keep a lifetime immigration record that covers your
          entire history in the United States:
        </p>
        <ul>
          <li>Every I-20 issued throughout your academic career</li>
          <li>Every visa stamp (photograph both the visa page and the entry stamp)</li>
          <li>Every EAD card received</li>
          <li>All passports (including expired — the entry stamps matter)</li>
          <li>Travel records (dates of every entry and exit, airline tickets, passport stamps)</li>
          <li>Tax returns for each year you were in the United States</li>
          <li>All USCIS correspondence (receipts, approvals, denials, RFEs, responses)</li>
        </ul>

        <div className="not-prose bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-2xl p-6 my-10">
          <div className="flex items-start gap-4">
            <FolderOpen className="w-8 h-8 text-primary flex-shrink-0" />
            <div>
              <p className="font-bold text-gray-900 dark:text-white text-lg mb-2">TrackMyOPT Document Vault</p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Store your employer folders, I-20s, EADs, and evaluation records in one
                organized, secure location. The Document Vault is structured around the
                OPT compliance categories above so your files are always where you need them.
              </p>
              <Link href="/features/compliance"
                className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm">
                Open Document Vault <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        <h2>Common Gaps and How to Fix Them</h2>
        <div className="not-prose overflow-x-auto my-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-primary/10">
                <th className="text-left p-3 font-semibold border border-gray-200 dark:border-zinc-700">Gap</th>
                <th className="text-left p-3 font-semibold border border-gray-200 dark:border-zinc-700">How to Address It</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["No offer letter from employer", "Request a retroactive confirmation letter with position, start date, salary, and supervisor. An email from HR is acceptable."],
                ["No pay stubs", "Request duplicate statements from your payroll provider. Most employers use ADP, Paychex, or Gusto — contact HR for the payroll access link."],
                ["No degree-relationship statement", "Write one now based on your actual duties. Ask your former supervisor to confirm by email if you can still reach them."],
                ["DSO reporting confirmation was not saved", "Ask your DSO for a copy of the reporting confirmation or SEVIS record entry. DSOs typically have records of employment updates."],
                ["Lost EAD card", "Request a replacement through USCIS. Keep the approval notice, receipt notice, and any non-delivery inquiry records."],
              ].map(([gap, fix], i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white dark:bg-zinc-900" : "bg-gray-50 dark:bg-zinc-800"}>
                  <td className="p-3 border border-gray-200 dark:border-zinc-700 text-red-700 dark:text-red-400 font-medium">{gap}</td>
                  <td className="p-3 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300">{fix}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FAQ */}
        <h2>Frequently Asked Questions</h2>
        <div itemScope itemType="https://schema.org/FAQPage" className="not-prose space-y-4">
          {[
            {
              q: "How long should I keep OPT employment records?",
              a: "Keep them for at least 7 years after the OPT period ends, and longer if you are in an ongoing immigration process such as a green card or naturalization application. Immigration filings can require employment history going back to your first authorized work period in the United States.",
            },
            {
              q: "Do I need pay stubs if I worked an unpaid position on initial OPT?",
              a: "Keep whatever evidence applies to the role — offer letter, volunteer agreement, supervisor contact, hours confirmation, project records, and a statement from the organization confirming your participation. Ask your DSO what additional documentation is appropriate for the specific unpaid position.",
            },
            {
              q: "What if my former employer went out of business?",
              a: "Preserve everything you already have — pay stubs, W-2s, offer letters, email correspondence, and LinkedIn records from the time. If you need additional documentation, a CPA or immigration attorney can sometimes help reconstruct an employment record from tax returns and payroll records.",
            },
            {
              q: "My employer refuses to give me a job description. What should I do?",
              a: "Keep your written request and the employer's refusal (or non-response). Preserve the offer letter, performance reviews, project documentation, supervisor contact, and any other written evidence of duties. Write your own accurate duties summary. Consult your DSO or attorney about whether the available documentation is sufficient.",
            },
            {
              q: "Can I use TrackMyOPT to store sensitive immigration documents?",
              a: "TrackMyOPT's Document Vault is designed for OPT compliance records. Review the product's current privacy policy, data security terms, and backup policies before uploading any sensitive immigration documents.",
            },
            {
              q: "Does the evidence I keep for OPT affect my H-1B petition?",
              a: "Yes — significantly. If USCIS issues an RFE on your H-1B petition asking for evidence that you were engaged in a specialty occupation during OPT, a complete OPT employment evidence file lets your attorney respond with offer letters, job descriptions, pay stubs, degree-relationship statements, and supervisor confirmations. Without this, the response is much harder to build.",
            },
          ].map((item, i) => (
            <div key={i} itemScope itemProp="mainEntity" itemType="https://schema.org/Question"
              className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl p-5">
              <p itemProp="name" className="font-bold text-gray-900 dark:text-white mb-2">{item.q}</p>
              <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                <p itemProp="text" className="text-gray-600 dark:text-gray-300 text-sm">{item.a}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Official Sources */}
        <h2>Official Sources</h2>
        <div className="not-prose grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: "ICE Practical Training Guidance", href: "https://www.ice.gov/sevis/practical-training" },
            { label: "DHS Form I-983 Overview", href: "https://studyinthestates.dhs.gov/form-i-983-overview" },
            { label: "TrackMyOPT Compliance Tools", href: "https://www.trackmyopt.com/features/compliance" },
            { label: "USCIS OPT Information", href: "https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/optional-practical-training-opt-for-f-1-students" },
          ].map((s) => (
            <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:text-primary hover:border-primary/30 transition-colors">
              <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
              {s.label}
            </a>
          ))}
        </div>

        <div className="not-prose mt-10 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl p-5">
          <div className="flex gap-3">
            <ShieldCheck className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <strong className="text-gray-700 dark:text-gray-300">Immigration Disclaimer:</strong>{" "}
              This article is for general informational purposes only and does not constitute legal
              advice. Consult your DSO and a licensed immigration attorney for advice specific to
              your OPT situation and future visa planning.
            </p>
          </div>
        </div>

        <div className="not-prose mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Guides</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { href: "/blog/opt-job-related-to-degree", title: "How to Prove Your OPT Job Relates to Your Degree", desc: "Duty-based relationship statements with examples across 5 fields of study." },
              { href: "/blog/ead-card-lost-stolen-incorrect-never-delivered", title: "Lost or Incorrect EAD Card Guide", desc: "What to do when your EAD is lost, stolen, printed incorrectly, or never delivered." },
              { href: "/blog/laid-off-on-opt", title: "Laid Off on OPT", desc: "Reporting steps, unemployment tracking, and job search after a layoff." },
              { href: "/blog/opt-to-h1b-transition", title: "OPT to H-1B Transition Guide", desc: "How your OPT employment record affects your H-1B petition." },
            ].map((r) => (
              <Link key={r.href} href={r.href} className="group block">
                <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-5 h-full hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-zinc-900">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors text-base">{r.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">{r.desc}</p>
                  <span className="text-primary font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">Read Guide <ArrowRight className="w-4 h-4" /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <AuthorBio />
    </article>
  );
}
