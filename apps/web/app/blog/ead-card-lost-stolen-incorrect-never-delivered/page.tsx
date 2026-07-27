import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock, ExternalLink, ShieldCheck, CreditCard } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
import { AuthorBio } from "@/components/blog/AuthorBio";

const CANONICAL = "https://www.trackmyopt.com/blog/ead-card-lost-stolen-incorrect-never-delivered";

export const metadata: Metadata = {
  title: "EAD Card Lost, Stolen, Incorrect or Never Delivered? Complete Recovery Guide",
  description:
    "Step-by-step guide for every OPT EAD problem: lost or stolen cards, USCIS printing errors, applicant data errors, and cards that were never delivered. Covers Form I-765 replacement, USCIS non-delivery inquiry, and what not to do.",
  keywords: [
    "lost OPT EAD card",
    "stolen EAD replacement",
    "OPT EAD never delivered",
    "incorrect EAD card USCIS",
    "replace OPT EAD",
    "EAD card USCIS error",
    "OPT work card lost",
    "EAD non delivery inquiry",
  ],
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: "EAD Card Lost, Stolen, Incorrect or Never Delivered? Complete Recovery Guide",
    description: "The complete EAD card recovery guide — 4 issue types, the right remedy for each, USCIS form instructions, and what to do while you wait.",
    url: CANONICAL,
    type: "article",
    images: [{ url: "https://www.trackmyopt.com/og-image.png", width: 1200, height: 630, alt: "EAD Card Recovery Guide" }],
  },
};

export default function EadCardLostStolenPage() {
  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <BlogPostSchema title={metadata.title as string} description={metadata.description as string} publishedDate="2026-07-27" modifiedDate="2026-07-27" author="TrackMyOPT Immigration Team" canonicalUrl={CANONICAL} />
      <BreadcrumbSchema items={[{ name: "Home", url: "https://www.trackmyopt.com" }, { name: "Blog", url: "https://www.trackmyopt.com/blog" }, { name: "EAD Card Lost, Stolen, Incorrect or Never Delivered", url: CANONICAL }]} />

      <header className="mb-10">
        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold mb-4">
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">USCIS and EAD</span>
          <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-3 py-1 rounded-full">Urgent</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
          EAD Card Lost, Stolen, Incorrect or Never Delivered? Complete Recovery Guide
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Not all EAD problems are solved the same way. A card that never arrived, a card with
          the wrong dates, and a card that was stolen each require a different response. Use this
          guide to identify which situation you are in and exactly what to do next.
        </p>
        <div className="mt-6 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 13 min read</span>
          <span>•</span>
          <span>Updated July 27, 2026</span>
        </div>
      </header>

      <div className="relative w-full h-[420px] md:h-[520px] rounded-2xl overflow-hidden mb-12 shadow-xl">
        <img src="/blog/ead-card-lost-stolen-incorrect-never-delivered.png" alt="Open empty wallet, USCIS case status showing Card Was Mailed, USPS tracking printout and Form I-765" className="object-cover w-full h-full" />
      </div>

      {/* Direct Answer */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">Direct Answer</p>
        <p className="text-gray-800 dark:text-gray-100 font-medium leading-relaxed">
          Diagnose the problem first—is the card lost/stolen/damaged, was it printed with
          incorrect data, or was it never delivered? Each category has a different USCIS remedy.
          Do not apply the wrong remedy (e.g., filing a lost-card replacement when the issue is
          a USCIS printing error). Save the approval notice, USPS tracking number, and any
          returned-mail evidence before contacting USCIS. Do not work without confirmed work
          authorization, regardless of the cause of the delay.
        </p>
      </div>

      <div className="prose prose-lg dark:prose-invert max-w-none">

        {/* Issue Classifier */}
        <h2>Step 1: Diagnose Your EAD Problem</h2>
        <p>
          Before you take any action, identify which of the four EAD problem categories applies
          to your situation. The remedy differs significantly between categories.
        </p>
        <div className="not-prose grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {[
            {
              cat: "Category A",
              title: "Lost, Stolen, or Damaged Card",
              desc: "You received a valid card, but it was later lost, stolen, damaged, or destroyed.",
              color: "border-red-400",
              remedy: "File a new Form I-765 as a replacement with applicable fee.",
            },
            {
              cat: "Category B",
              title: "USCIS Printing Error",
              desc: "The card arrived but contains incorrect data due to a USCIS or printing error (wrong name, dates, or A-number).",
              color: "border-orange-400",
              remedy: "Follow USCIS's correction process for agency errors — may not require a new fee.",
            },
            {
              cat: "Category C",
              title: "Applicant Data Error",
              desc: "The card data is wrong because of an error in your original Form I-765 application.",
              color: "border-yellow-400",
              remedy: "File a new Form I-765 to correct the error — fee may apply.",
            },
            {
              cat: "Category D",
              title: "Card Never Delivered",
              desc: "USCIS shows the card as mailed but it never arrived. USPS tracking may show delivered but you never received it.",
              color: "border-blue-400",
              remedy: "Use the USCIS Non-Delivery of Card inquiry tool at the appropriate time.",
            },
          ].map((item) => (
            <div key={item.cat} className={`bg-white dark:bg-zinc-900 border-l-4 ${item.color} border border-gray-200 dark:border-zinc-700 rounded-xl p-4`}>
              <p className="text-xs font-bold text-gray-400 mb-1">{item.cat}</p>
              <p className="font-bold text-gray-900 dark:text-white mb-2 text-sm">{item.title}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">{item.desc}</p>
              <p className="text-xs font-medium text-primary">{item.remedy}</p>
            </div>
          ))}
        </div>

        <div className="not-prose bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-5 rounded-r-xl mb-8">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-900 dark:text-red-300 mb-1">Do not work without confirmed authorization</p>
              <p className="text-red-800 dark:text-red-200 text-sm">
                Regardless of which EAD problem you are dealing with, do not assume that your
                underlying OPT approval allows you to work without the physical card. Confirm
                with your employer&apos;s HR and your DSO what documentation is acceptable for
                I-9 purposes during the replacement process. An approval notice or receipt
                notice is generally NOT sufficient on its own for I-9 completion.
              </p>
            </div>
          </div>
        </div>

        <h2>Category A: Lost, Stolen, or Damaged EAD</h2>

        <h3>Immediate steps</h3>
        <ol>
          <li>
            <strong>Write down when and where you last had the card</strong> and when you first
            noticed it was missing. This information may be requested by USCIS or law enforcement.
          </li>
          <li>
            <strong>File a police report if the card was stolen.</strong> This is not required by
            USCIS for a replacement but can be useful evidence and protects you if the card
            is misused.
          </li>
          <li>
            <strong>Photograph both sides of any remaining documentation</strong> — your approval
            notice, receipt notice, passport, and any old copies of the EAD you may have taken.
          </li>
          <li>
            <strong>Contact your DSO</strong> and inform them of the situation. Your DSO may
            need to provide a letter or updated I-20 depending on your school&apos;s process
            for replacement applications.
          </li>
        </ol>

        <h3>Filing the replacement Form I-765</h3>
        <p>
          Download the current Form I-765 and instructions from{" "}
          <a href="https://www.uscis.gov/i-765" target="_blank" rel="noopener noreferrer">uscis.gov/i-765</a>.
          For a replacement due to loss, theft, or damage, you will need to:
        </p>
        <ul>
          <li>Select the correct eligibility category on the form (the same category as the original application)</li>
          <li>Pay the current filing fee (check the USCIS fee schedule — it changes periodically)</li>
          <li>Include a signed explanation of the loss or theft</li>
          <li>Include the police report if one exists</li>
          <li>Include copies of your original approval notice and other supporting documents</li>
        </ul>
        <p>
          Processing times for replacement EADs can be several months. You may request premium
          processing if USCIS offers it for your category at the time of filing—check the current{" "}
          <a href="https://www.uscis.gov/forms/all-forms/direct-filing-addresses-for-form-i-765" target="_blank" rel="noopener noreferrer">
            I-765 filing address and premium processing information
          </a>{" "}
          before submitting.
        </p>

        <h2>Category B: USCIS Printing or Data Entry Error</h2>
        <p>
          If you compare the card to your approval notice and find that USCIS printed the
          wrong data (wrong name spelling, wrong dates, wrong A-number, wrong category code),
          the correction process is different from a replacement.
        </p>

        <h3>How to identify a USCIS error vs. your own error</h3>
        <div className="not-prose overflow-x-auto my-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-primary/10">
                <th className="text-left p-3 font-semibold border border-gray-200 dark:border-zinc-700">USCIS or Printing Error</th>
                <th className="text-left p-3 font-semibold border border-gray-200 dark:border-zinc-700">Applicant Error</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Card says different name than approval notice", "Card matches the name submitted on Form I-765 (which had a typo)"],
                ["Card dates differ from approval notice dates", "Card matches the dates but the Form I-765 had wrong dates"],
                ["A-number on card differs from notice", "A-number was entered incorrectly on the application form"],
                ["Wrong category code printed on card", "Wrong eligibility category was selected on the form"],
              ].map(([uscis, applicant], i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white dark:bg-zinc-900" : "bg-gray-50 dark:bg-zinc-800"}>
                  <td className="p-3 border border-gray-200 dark:border-zinc-700 text-orange-700 dark:text-orange-400">{uscis}</td>
                  <td className="p-3 border border-gray-200 dark:border-zinc-700 text-yellow-700 dark:text-yellow-400">{applicant}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3>Correcting a USCIS printing error</h3>
        <p>
          Follow the USCIS correction instructions for agency errors, which typically require:
        </p>
        <ul>
          <li>A cover letter explaining the discrepancy with evidence</li>
          <li>Copies of both the incorrect card and the approval notice</li>
          <li>Identity documents that show the correct information</li>
          <li>Submission to the address listed in current USCIS guidance</li>
        </ul>
        <p>
          Do not alter the card in any way. Photograph it as-is, then send the original card
          with the correction package if USCIS requires it. Check the current{" "}
          <a href="https://www.uscis.gov/i-765" target="_blank" rel="noopener noreferrer">
            I-765 instructions
          </a>{" "}
          for the latest correction procedure, as USCIS may update these periodically.
        </p>

        <h2>Category C: Applicant Error on Form I-765</h2>
        <p>
          If the error on the card stems from incorrect information you submitted on Form I-765,
          a correction for agency error does not apply. You will generally need to file a new
          Form I-765 with the correct information and pay the applicable fee. Include a cover
          letter explaining the original error and providing the corrected information.
        </p>
        <p>
          Ask your DSO whether a new I-20 or updated I-765 supporting documents are needed
          for the corrected application.
        </p>

        <h2>Category D: EAD Card Never Delivered</h2>
        <p>
          This is one of the most stressful situations because USCIS shows the card as mailed
          and the responsibility seems unclear. Follow these steps in order:
        </p>

        <h3>Step 1: Check USCIS case status</h3>
        <p>
          Log in to your USCIS online account or use the case status tool at{" "}
          <a href="https://egov.uscis.gov/casestatus/landing.do" target="_blank" rel="noopener noreferrer">
            egov.uscis.gov
          </a>{" "}
          and confirm the case status shows the card was mailed (or produced). Note the exact
          status text and the date.
        </p>

        <h3>Step 2: Check USPS tracking</h3>
        <p>
          USCIS typically mails EADs via USPS First Class Mail with tracking. If you have
          the tracking number (it may appear in your online account or in a notification email),
          check the USPS tracking status at{" "}
          <a href="https://tools.usps.com/go/TrackConfirmAction" target="_blank" rel="noopener noreferrer">
            USPS Tracking
          </a>
          .
        </p>
        <ul>
          <li><strong>Status: Delivered</strong> — Check with neighbors, building management, or your mail carrier. File a USPS Mail Theft report if you believe the card was stolen from your mailbox.</li>
          <li><strong>Status: In transit / no update for many days</strong> — The card may be lost in transit. Proceed to the non-delivery inquiry.</li>
          <li><strong>Status: Return to sender</strong> — The card may have been sent to an old address. Contact your DSO to verify and update your address in SEVIS, then inquire about reissuance.</li>
        </ul>

        <h3>Step 3: File a USCIS Non-Delivery of Card inquiry</h3>
        <p>
          USCIS provides a specific tool for EAD non-delivery situations at{" "}
          <a href="https://egov.uscis.gov/e-request/ndc" target="_blank" rel="noopener noreferrer">
            egov.uscis.gov/e-request/ndc
          </a>
          . The tool will ask for your receipt number and explain the conditions for submitting
          an inquiry (typically, a specific number of days must have passed since the card was
          mailed). Submit the inquiry when you qualify, and record the inquiry confirmation number.
        </p>
        <p>
          Track your case in the{" "}
          <Link href="/dashboard/case-status">TrackMyOPT USCIS case status dashboard</Link>{" "}
          so you are notified immediately when the status changes.
        </p>

        <h3>Address issues</h3>
        <p>
          USCIS mails to the address on your Form I-765. If you moved after filing, the card
          goes to the old address. Contact your DSO immediately about updating your address in
          SEVIS. Check the USPS mail forwarding status if you filed a forwarding request.
        </p>

        <h2>While You Wait for a Replacement</h2>
        <p>
          The EAD replacement process can take weeks to months. During this time:
        </p>
        <div className="not-prose">
          <ul className="space-y-3 my-4">
            {[
              { item: "Do not assume you can work", sub: "Confirm with your employer HR and DSO what documentation is acceptable for I-9 during the replacement." },
              { item: "Keep your USCIS approval notice accessible", sub: "This is your proof of the underlying approval even without the physical card." },
              { item: "Track unemployment days", sub: "If you cannot work because of the EAD problem, days may count toward your 90-day limit. Contact your DSO." },
              { item: "Save all correspondence", sub: "Every inquiry number, USPS tracking update, USCIS response, and DSO email should be preserved." },
              { item: "Consider premium processing if available", sub: "Check whether premium processing is available for your replacement filing to reduce processing time." },
            ].map((row, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-800 dark:text-gray-200">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">{row.item}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{row.sub}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* FAQ */}
        <h2>Frequently Asked Questions</h2>
        <div itemScope itemType="https://schema.org/FAQPage" className="not-prose space-y-4">
          {[
            {
              q: "Can I work if my OPT EAD was lost?",
              a: "Do not assume that losing the physical card eliminates your work authorization. However, your employer needs to complete Form I-9 and typically needs to see the EAD card. Discuss your specific situation with your employer's HR team, DSO, and ideally an immigration attorney before performing any work without the physical card.",
            },
            {
              q: "What if USCIS printed my name incorrectly?",
              a: "Follow USCIS's correction process for agency errors, not the standard replacement process. Include the incorrect card, your approval notice, and identity documents showing the correct name. Do not alter the card. Check the current I-765 instructions for the correction submission address.",
            },
            {
              q: "When can I submit an EAD non-delivery inquiry?",
              a: "The USCIS Non-Delivery of Card tool at egov.uscis.gov/e-request/ndc specifies the timing requirements — typically a set number of days after the card was mailed. Check the tool directly for current requirements before submitting, as timing rules can change.",
            },
            {
              q: "Does an approval notice replace the EAD for work purposes?",
              a: "Generally no — the I-9 process requires presenting specific documents from a specific list. An approval notice or receipt notice is not automatically an acceptable I-9 work authorization document. Confirm with your employer's HR team and an immigration attorney.",
            },
            {
              q: "My EAD shows as delivered by USPS but I never received it. What do I do?",
              a: "Check with neighbors and building management first. File a USPS mail theft report if you believe it was stolen. Then file the USCIS Non-Delivery of Card inquiry. In the meantime, contact your DSO about the situation and whether any action is needed in your SEVIS record.",
            },
            {
              q: "Does the time waiting for a replacement EAD count as OPT unemployment?",
              a: "If your OPT authorization period has started and you cannot work because you lack the physical EAD, those days may count toward your unemployment limit depending on the facts. Contact your DSO to understand how the situation is being recorded and whether it affects your unemployment count.",
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
            { label: "USCIS Form I-765 and Instructions", href: "https://www.uscis.gov/i-765" },
            { label: "USCIS Non-Delivery of Card Inquiry", href: "https://egov.uscis.gov/e-request/ndc" },
            { label: "USCIS Case Status Online", href: "https://egov.uscis.gov/casestatus/landing.do" },
            { label: "USPS Mail Theft Report", href: "https://postalinspectors.uspis.gov/forms/MailTheftComplaint.aspx" },
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
              advice. EAD replacement rules and USCIS processes change frequently. Always consult
              your DSO and a licensed immigration attorney before making decisions about working
              without a valid EAD card.
            </p>
          </div>
        </div>

        <div className="not-prose mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Guides</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { href: "/blog/can-you-start-work-before-opt-ead-arrives", title: "Can You Work Before Your EAD Arrives?", desc: "The authorization timing, I-9 requirements, and employer communication guide." },
              { href: "/blog/opt-ead-card-guide", title: "Complete OPT EAD Card Guide", desc: "Everything about the EAD card: categories, reading the card, and common questions." },
              { href: "/blog/how-to-track-uscis-case-status-guide", title: "How to Track Your USCIS Case Status", desc: "Case status tools, inquiry timelines, and next steps for pending cases." },
              { href: "/blog/opt-employment-evidence-checklist", title: "OPT Employment Evidence Checklist", desc: "Every document to keep — including your EAD approval notice and card copies." },
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
