import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock, ExternalLink, ShieldCheck } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
import { AuthorBio } from "@/components/blog/AuthorBio";

const CANONICAL = "https://www.trackmyopt.com/blog/employer-refuses-form-i983";

export const metadata: Metadata = {
  title: "What If Your Employer Refuses to Complete or Sign Form I-983?",
  description:
    "Step-by-step guide for STEM OPT students whose employer refuses to complete, sign, or return Form I-983: written request strategy, DSO escalation, documentation, and how to protect your status when the opportunity cannot proceed.",
  keywords: [
    "employer refuses I-983",
    "employer will not sign STEM OPT form",
    "Form I-983 signature problem",
    "STEM OPT I-983 refusal",
    "employer does not understand I-983",
    "I-983 employer section blank",
    "STEM OPT no employer signature",
  ],
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: "What If Your Employer Refuses to Complete or Sign Form I-983?",
    description: "When your STEM OPT employer won't sign Form I-983 — written request strategy, DSO escalation, documentation, and your options if the opportunity can't proceed.",
    url: CANONICAL,
    type: "article",
    images: [{ url: "https://www.trackmyopt.com/og-image.jpg", width: 1200, height: 630, alt: "Employer Refuses to Sign Form I-983" }],
  },
    twitter: {
        card: "summary_large_image",
        title: "What If Your Employer Refuses to Complete or Sign Form I-983?",
        description: "When your STEM OPT employer won't sign Form I-983 — written request strategy, DSO escalation, documentation, and your options if the opportunity can't proceed.",
        images: ["https://www.trackmyopt.com/og-image.jpg"],
    },
};

export default function EmployerRefusesI983Page() {
  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <BlogPostSchema title={metadata.title as string} description={metadata.description as string} publishedDate="2026-07-27" modifiedDate="2026-07-27" author="TrackMyOPT Immigration Team" canonicalUrl={CANONICAL} />
      <BreadcrumbSchema items={[{ name: "Home", url: "https://www.trackmyopt.com" }, { name: "Blog", url: "https://www.trackmyopt.com/blog" }, { name: "Employer Refuses Form I-983", url: CANONICAL }]} />

      <header className="mb-10">
        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold mb-4">
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">STEM OPT Compliance</span>
          <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-3 py-1 rounded-full">Urgent</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
          What If Your Employer Refuses to Complete or Sign Form I-983?
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          A refusal to sign Form I-983 is a compliance emergency, not a paperwork inconvenience.
          This guide tells you exactly what to do—step by step—when an employer won&apos;t complete
          the required training plan or evaluation.
        </p>
        <div className="mt-6 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 12 min read</span>
          <span>•</span>
          <span>Updated July 27, 2026</span>
        </div>
      </header>

      <div className="relative w-full h-[420px] md:h-[520px] rounded-2xl overflow-hidden mb-12 shadow-xl">
        <img src="/blog/employer-refuses-form-i983.png" alt="Form I-983 with empty employer signature, HR no-response email printout, and urgent sticky note" className="object-cover w-full h-full" />
      </div>

      {/* Direct Answer */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">Direct Answer</p>
        <p className="text-gray-800 dark:text-gray-100 font-medium leading-relaxed">
          If your employer refuses to complete or sign Form I-983: (1) send a written request
          explaining the federal requirement and providing the form, (2) identify the employer&apos;s
          authorized signatory and escalate to that person specifically, (3) contact your DSO
          immediately with the timeline and evidence of your requests, (4) do not sign the employer
          section yourself or begin STEM training without the required documentation, and (5) if the
          opportunity cannot proceed, report the loss of employment to your DSO and begin searching
          for a compliant replacement before your unemployment buffer is exhausted.
        </p>
      </div>

      <div className="prose prose-lg dark:prose-invert max-w-none">

        <h2>Why Employers Refuse: The Four Most Common Reasons</h2>
        <p>
          Understanding why the employer is refusing helps you choose the right response.
        </p>
        <div className="not-prose grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {[
            {
              reason: "1. Lack of awareness",
              desc: "HR does not know what Form I-983 is or has never processed a STEM OPT student. The form looks complicated and they are not sure who should sign it.",
              fix: "Education — share the DHS I-983 overview and explain the employer's obligation.",
            },
            {
              reason: "2. Legal or compliance hesitation",
              desc: "The company's legal team is worried about liability from signing a federal form and wants to review it or get outside counsel approval.",
              fix: "Patience + resources — provide the DHS guidance and offer to connect them with your school's international student office.",
            },
            {
              reason: "3. No authorized signatory available",
              desc: "The hiring manager is not authorized to sign; the authorized person is unavailable, on leave, or has left the company.",
              fix: "Escalation — work with HR to identify the correct authorized person urgently.",
            },
            {
              reason: "4. Intentional refusal",
              desc: "The employer refuses to participate in the STEM OPT process, either because they misunderstand the obligations or because they do not want to commit to a training plan.",
              fix: "DSO escalation + potential new employer search.",
            },
          ].map((item) => (
            <div key={item.reason} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl p-4">
              <p className="font-bold text-gray-900 dark:text-white mb-2 text-sm">{item.reason}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">{item.desc}</p>
              <p className="text-xs font-medium text-primary">Response: {item.fix}</p>
            </div>
          ))}
        </div>

        <h2>Step 1: Send a Clear Written Request</h2>
        <p>
          Do not start with a verbal conversation or a casual Slack message. The first step is
          a professional written request by email to the relevant HR contact and your direct
          supervisor, copied to their manager if appropriate.
        </p>

        <h3>What the written request should include</h3>
        <div className="not-prose">
          <ul className="space-y-2 my-4">
            {[
              "A brief explanation of STEM OPT and the purpose of Form I-983",
              "The specific sections the employer needs to complete (Sections 2–5 and the signatures)",
              "A link to the DHS Form I-983 overview page for official reference",
              "The DHS STEM OPT reporting requirements PDF as context",
              "A specific deadline by which you need the form completed (10 days from the training end date or before your start date)",
              "Contact information for your DSO if the employer has questions",
              "A request for the name and title of the authorized signatory",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-800 dark:text-gray-200">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <h3>Sample language for the written request</h3>
        <div className="not-prose bg-gray-50 dark:bg-zinc-800 rounded-xl p-5 my-4 border border-gray-200 dark:border-zinc-700">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">Sample Email to HR</p>
          <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
            Subject: Form I-983 — STEM OPT Training Plan — Action Required by [Date]<br /><br />
            Dear [HR Contact],<br /><br />
            I am writing to follow up on a required form for my STEM Optional Practical Training
            (STEM OPT). As an F-1 student on a STEM OPT extension authorized by the U.S. 
            Department of Homeland Security, I am required to have a Form I-983 Training Plan
            completed and signed by an authorized representative of [Company Name].<br /><br />
            Form I-983 is a DHS-required document that establishes the terms of my training
            at your company, including learning objectives, supervision, and compensation. 
            The employer&apos;s obligations under this form are outlined in the DHS STEM OPT 
            guidance at: [DHS link]<br /><br />
            I have attached the form. The sections that require employer completion are Sections
            2 through 5 and the employer signature in Section 5. The deadline for this form to
            be submitted to my university is [date].<br /><br />
            Please let me know who the authorized signatory will be, and feel free to contact
            my DSO at [DSO email and phone] if you have questions about the requirements.<br /><br />
            Thank you for your prompt attention to this matter.
          </p>
        </div>

        <h2>Step 2: Identify and Reach the Authorized Signatory</h2>
        <p>
          Many I-983 refusals stem from the form reaching someone who does not have signing
          authority. The I-983 employer signature must come from someone with actual authority
          to enter the company into a training agreement—typically:
        </p>
        <ul>
          <li>A VP or Director of Human Resources</li>
          <li>The Chief People Officer or General Counsel</li>
          <li>A manager with delegated authority from the above</li>
          <li>For smaller companies: the founder, CEO, or owner</li>
        </ul>
        <p>
          A hiring manager, recruiter, or line manager may not have this authority. Ask HR
          explicitly: "Who at [Company] is authorized to sign legal training agreements with
          federal regulatory bodies?" Frame it as an authority question, not just a signature
          request.
        </p>

        <h2>Step 3: Contact Your DSO — Do Not Wait</h2>
        <p>
          If the first written request does not produce the form within 3–5 business days,
          contact your DSO. Do not wait for the employer to respond on their own timeline.
          Provide your DSO with:
        </p>
        <ul>
          <li>The employer name, HR contact, and your position</li>
          <li>Your written request (forwarded or attached)</li>
          <li>The employer&apos;s response (or lack of one)</li>
          <li>The training start date or end date creating the deadline</li>
          <li>How many unemployment days remain in your authorization period</li>
        </ul>
        <p>
          Your DSO may have resources the employer will respond to differently — official school
          letterhead, direct contact from the international student office, or an explanation
          that makes the obligation clearer.
        </p>

        <div className="not-prose bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-5 rounded-r-xl my-6">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-900 dark:text-red-300 mb-1">Never sign the employer section yourself</p>
              <p className="text-red-800 dark:text-red-200 text-sm">
                If the employer asks you to sign their section, fill it in for them, or guess
                at the employer information — refuse. Completing the employer certification
                without proper authority can constitute a false statement on a federal form.
                Document the request and report it to your DSO immediately.
              </p>
            </div>
          </div>
        </div>

        <h2>Step 4: Understand Your Timeline</h2>
        <p>
          The urgency of an I-983 refusal depends on whether this is a new training opportunity
          or an existing one that is ending.
        </p>
        <div className="not-prose overflow-x-auto my-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-primary/10">
                <th className="text-left p-3 font-semibold border border-gray-200 dark:border-zinc-700">Situation</th>
                <th className="text-left p-3 font-semibold border border-gray-200 dark:border-zinc-700">Urgency</th>
                <th className="text-left p-3 font-semibold border border-gray-200 dark:border-zinc-700">What This Means</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["New employer won't sign before you start", "🔴 Very High", "You cannot begin STEM training without the I-983. Every day is a potential unemployment day."],
                ["Existing employer won't sign final evaluation", "🔴 High", "Final evaluation is due within 10 days of training end. Missing it is a compliance problem."],
                ["Existing employer won't sign 12-month evaluation", "🟡 Medium-High", "12-month evaluation has a deadline; missing it creates a SEVIS record issue."],
                ["Employer won't update a material I-983 change", "🟡 Medium", "The current I-983 may no longer accurately reflect the training. Report to DSO."],
              ].map(([sit, urg, means], i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white dark:bg-zinc-900" : "bg-gray-50 dark:bg-zinc-800"}>
                  <td className="p-3 border border-gray-200 dark:border-zinc-700 text-gray-800 dark:text-gray-200 font-medium">{sit}</td>
                  <td className="p-3 border border-gray-200 dark:border-zinc-700">{urg}</td>
                  <td className="p-3 border border-gray-200 dark:border-zinc-700 text-xs text-gray-600 dark:text-gray-400">{means}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2>Step 5: If the Opportunity Cannot Proceed</h2>
        <p>
          If all escalation efforts fail and the employer will not sign the I-983, the STEM
          training opportunity cannot legally proceed. Your next steps are:
        </p>
        <ol>
          <li>
            <strong>Report the situation to your DSO</strong> and ask how the employment end
            date should be recorded. Do not let the situation drift while unemployment days
            accumulate.
          </li>
          <li>
            <strong>Ask the employer whether they will sign the final evaluation</strong> for
            any period you did work. If they refuse this too, document every refusal.
          </li>
          <li>
            <strong>Begin a compliant search for a replacement employer.</strong> Vet new
            employers for E-Verify enrollment and I-983 willingness before accepting an offer.
            See:{" "}
            <Link href="/blog/change-employers-stem-opt">How to Change Employers on STEM OPT</Link>.
          </li>
          <li>
            <strong>Use the{" "}</strong>
            <Link href="/dashboard/opt-tools/opt-clock">TrackMyOPT unemployment clock</Link>{" "}
            to track remaining days and set urgent alerts.
          </li>
        </ol>

        <h2>Evidence to Preserve Throughout This Process</h2>
        <div className="not-prose">
          <ul className="space-y-3 my-4">
            {[
              "All written requests to HR and management, with timestamps",
              "Any responses received (or documented lack of response)",
              "Notes from verbal conversations (date, time, who said what)",
              "DSO communications regarding the situation",
              "The form itself (blank or partially completed)",
              "Evidence of the training opportunity (offer letter, job description, employment dates)",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-800 dark:text-gray-200">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* FAQ */}
        <h2>Frequently Asked Questions</h2>
        <div itemScope itemType="https://schema.org/FAQPage" className="not-prose space-y-4">
          {[
            {
              q: "Can I sign Form I-983 on behalf of my employer?",
              a: "No. The employer certification must be completed and signed by an individual with actual employer authority. Signing on the employer's behalf is not permitted and could be treated as a false statement on a federal form.",
            },
            {
              q: "What if HR says they do not understand what I-983 is?",
              a: "Share the DHS Form I-983 overview page (studyinthestates.dhs.gov/form-i-983-overview), the DHS STEM OPT reporting requirements PDF, and a brief cover note explaining the employer's obligations. Ask HR to identify the person with legal signatory authority and escalate the request to them directly.",
            },
            {
              q: "Does an employer's refusal to sign Form I-983 automatically terminate my STEM OPT?",
              a: "The effect depends on your authorization and the specific facts. If you cannot start a new training opportunity without the I-983, the employment has not begun. If an existing I-983 is not being updated or signed for an evaluation, the training may be non-compliant. Contact your DSO immediately — do not wait for a deadline to pass.",
            },
            {
              q: "Can I change employers because my current employer refuses Form I-983?",
              a: "Yes, but the employer change must be handled in the correct order: close the current opportunity (even without the final evaluation if the employer refuses), report to your DSO, find a new qualifying employer, and complete a new I-983 before starting. See the employer change guide for the full sequence.",
            },
            {
              q: "What if my employer said they would sign but keeps delaying?",
              a: "After two written requests with a specific deadline and no action, escalate to your DSO. Provide the request history. The DSO can sometimes make contact with the employer's HR department on your behalf, which carries different weight than a student email.",
            },
            {
              q: "My startup employer says no one is authorized to sign federal forms. What do I do?",
              a: "In a startup, the founder, CEO, or any officer typically has signing authority for company agreements. There is no exemption from Form I-983 obligations for small companies. If the employer genuinely cannot identify an authorized signatory, they may not be a qualifying STEM OPT employer. Contact your DSO.",
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
            { label: "DHS Form I-983 Overview", href: "https://studyinthestates.dhs.gov/form-i-983-overview" },
            { label: "DHS STEM OPT Reporting Requirements (PDF)", href: "https://studyinthestates.dhs.gov/assets/sevpstemoptreportingrequirementsfinal.pdf" },
            { label: "SEVP Portal Student Guide", href: "https://studyinthestates.dhs.gov/assets/SEVP%20Portal%20Student%20User%20Guide.pdf" },
            { label: "ICE Practical Training Guidance", href: "https://www.ice.gov/sevis/practical-training" },
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
              advice. Consult your DSO and a licensed immigration attorney before making any
              employment decisions that could affect your STEM OPT authorization.
            </p>
          </div>
        </div>

        <div className="not-prose mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Guides</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { href: "/blog/change-employers-stem-opt", title: "How to Change Employers on STEM OPT", desc: "The full employer-change process — from final evaluation to new I-983." },
              { href: "/blog/laid-off-on-stem-opt", title: "Laid Off on STEM OPT", desc: "What to do when employment ends involuntarily — evaluations and replacement search." },
              { href: "/blog/stem-opt-six-month-validation-report", title: "STEM OPT Reporting Calendar", desc: "All validation and evaluation deadlines across the 24-month STEM OPT period." },
              { href: "/blog/stem-opt-employer-site-visit-preparation", title: "STEM OPT Employer Site Visits", desc: "How ICE site visits work and how students and employers should prepare." },
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
