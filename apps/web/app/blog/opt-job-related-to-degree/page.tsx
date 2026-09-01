import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, ExternalLink, ShieldCheck, Lightbulb } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
import { AuthorBio } from "@/components/blog/AuthorBio";

const CANONICAL = "https://www.trackmyopt.com/blog/opt-job-related-to-degree";

export const metadata: Metadata = {
  title: "How to Explain How Your OPT Job Relates to Your Degree (SEVP Examples)",
  description:
    "The SEVP portal asks you to explain how your job relates to the degree that qualified you for OPT. Copy-ready examples for CS, Business, Biology, Engineering, and a step-by-step duty-based template.",
  keywords: [
    "explain how this job relates to the degree that qualified you for this opt",
    "relation to field of study OPT",
    "OPT job related to degree",
    "SEVP employment relationship",
    "explain employment related to field of study",
    "OPT degree relationship letter",
    "how to prove OPT job is related",
    "DSO job approval OPT",
  ],
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: "Explain How Your OPT Job Relates to Your Degree — SEVP Examples",
    description: "What to write in the SEVP 'relation to field of study' field — with copy-ready examples for CS, Business, Biology, and more.",
    url: CANONICAL,
    type: "article",
    images: [{ url: "https://www.trackmyopt.com/og-image.png", width: 1200, height: 630, alt: "OPT Job Degree Relationship Guide" }],
  },
};

export default function OptJobRelatedToDegreePage() {
  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <BlogPostSchema title={metadata.title as string} description={metadata.description as string} publishedDate="2026-07-27" modifiedDate="2026-09-01" author="TrackMyOPT Immigration Team" canonicalUrl={CANONICAL} />
      <BreadcrumbSchema items={[{ name: "Home", url: "https://www.trackmyopt.com" }, { name: "Blog", url: "https://www.trackmyopt.com/blog" }, { name: "OPT Job Related to Degree", url: CANONICAL }]} />

      <header className="mb-10">
        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold mb-4">
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">OPT Employment</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
          How to Explain How Your OPT Job Relates to Your Degree (SEVP Field + Examples)
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          When reporting employment in the SEVP portal, you may see: <em>&quot;Explain how this job relates to the degree that qualified you for this OPT.&quot;</em> This is a duties test, not a job-title test. Below: what to write, copy-ready examples, and common mistakes.
        </p>
        <div className="mt-6 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 12 min read</span>
          <span>•</span>
          <span>Updated September 1, 2026</span>
        </div>
      </header>

      <div className="relative w-full h-[420px] md:h-[520px] rounded-2xl overflow-hidden mb-12 shadow-xl">
        <img src="/blog/opt-job-related-to-degree.png" alt="Degree relationship statement letter, university diploma, and LinkedIn job posting on laptop" className="object-cover w-full h-full" />
      </div>

      {/* Direct Answer */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">Direct Answer</p>
        <p className="text-gray-800 dark:text-gray-100 font-medium leading-relaxed">
          An OPT job is related to your degree when the role&apos;s actual duties require knowledge,
          skills, or techniques that you developed through your major or course of study. The standard
          is not whether the job title matches your diploma—it is whether a reasonable explanation
          connects specific duties to specific degree knowledge. Write the explanation using duties,
          not labels. Keep a signed supervisor statement if the connection is not obvious. Update the
          explanation if your duties materially change.
        </p>
      </div>

      <div className="prose prose-lg dark:prose-invert max-w-none">

        <h2>What to Write in the SEVP Portal &quot;Relation to Field of Study&quot; Field</h2>
        <p>
          When you report a new employer in the{" "}
          <a href="https://sevp.ice.gov/opt" target="_blank" rel="noopener noreferrer">SEVP portal</a>,
          the form may require a free-text explanation of how your employment relates to your qualifying degree.
          The prompt often reads exactly:
        </p>
        <blockquote className="border-l-4 border-primary pl-4 italic text-gray-700 dark:text-gray-300 my-4">
          &quot;Explain how this job relates to the degree that qualified you for this OPT.&quot;
        </blockquote>
        <p>
          Write 3–5 sentences using this structure:
        </p>
        <ol>
          <li><strong>Degree:</strong> Name your degree and 2–3 relevant courses or skill areas.</li>
          <li><strong>Duties:</strong> List 3–5 recurring job tasks (not the job title alone).</li>
          <li><strong>Connection:</strong> For each duty, name the specific coursework or degree skill it uses.</li>
        </ol>
        <div className="not-prose bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-5 my-6">
          <p className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase mb-2">Copy-ready SEVP field example (Computer Science)</p>
          <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
            I hold an MS in Computer Science with coursework in Database Systems, Software Engineering, and Data Structures. As a Software Engineer at [Company], I design REST APIs and write backend services in Python (applying Software Engineering and algorithm design), optimize SQL queries and data models (applying Database Systems), and participate in code reviews using object-oriented design patterns from my degree program. Each core duty requires technical knowledge from my qualifying degree.
          </p>
        </div>
        <p>
          Portal walkthrough:{" "}
          <Link href="/blog/sevp-portal-guide-opt">SEVP portal guide for OPT students</Link>.
          Keep a longer version with employer letterhead for your personal records and future H-1B filings.
        </p>

        <h2>The Legal Standard: What &quot;Related&quot; Actually Means</h2>
        <p>
          The ICE practical training guidance says that OPT employment must relate to the
          student&apos;s major area of study. Neither ICE nor DHS provides a rigid formula for what
          qualifies—which means the determination involves judgment. In practice, DSOs and
          immigration officers assess:
        </p>
        <ol>
          <li><strong>The student&apos;s degree:</strong> Major, concentration, relevant coursework, and skill set</li>
          <li><strong>The job&apos;s actual duties:</strong> What you do day-to-day, not what the job title implies</li>
          <li><strong>The connection:</strong> How the specific duties use the specific knowledge from the degree</li>
        </ol>
        <p>
          A title of "Software Engineer" at a company that has you doing unrelated administrative
          work does not automatically qualify. Conversely, a title of "Research Associate" at a
          biotech lab doing cell culture, data analysis, and experiment design absolutely can
          qualify for a biology degree—even if the title sounds generic.
        </p>

        <h2>Why the Duty-Based Approach Matters</h2>
        <p>
          Most students write degree relationship statements that lead with the job title and then
          stop. This is almost always insufficient because:
        </p>
        <ul>
          <li>Job titles are inconsistent across companies and industries</li>
          <li>Employers create new titles frequently that have no agreed-upon definition</li>
          <li>A title that sounds technical may encompass non-technical duties</li>
          <li>Immigration officers evaluating future visa petitions cannot verify job titles—they can read and evaluate duty descriptions</li>
        </ul>

        <div className="not-prose bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-5 rounded-r-xl my-6">
          <div className="flex gap-3">
            <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900 dark:text-amber-300 mb-1">The H-1B consistency test</p>
              <p className="text-amber-800 dark:text-amber-200 text-sm">
                When you later apply for H-1B or a green card, USCIS will review your OPT employment
                history. Adjudicators often look at whether the OPT duties you documented are consistent
                with the specialty occupation claimed in the H-1B petition. A weak or vague OPT
                degree relationship statement can create problems years later.
              </p>
            </div>
          </div>
        </div>

        <h2>The Three-Part Relationship Statement</h2>
        <p>
          A strong degree relationship statement answers three questions in order:
        </p>
        <div className="not-prose grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
          {[
            { num: "01", q: "What did you study?", desc: "Degree, concentration, and 3–5 specific courses or skill areas most relevant to the role." },
            { num: "02", q: "What do you do?", desc: "3–5 core recurring duties—not everything in the job description, just the key technical ones." },
            { num: "03", q: "What connects them?", desc: "For each duty, name the specific course, skill, or knowledge area from your degree that applies." },
          ].map((item) => (
            <div key={item.num} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl p-4">
              <p className="text-3xl font-black text-primary/30 mb-2">{item.num}</p>
              <p className="font-bold text-gray-900 dark:text-white mb-2 text-sm">{item.q}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>

        <h2>Real Examples by Field of Study</h2>
        <p>
          The following are illustrative examples of how to connect specific duties to specific
          degree knowledge. These are templates—adapt them to your actual courses and duties.
        </p>

        <h3>Computer Science — Data Engineer</h3>
        <div className="not-prose bg-gray-50 dark:bg-zinc-800 rounded-xl p-5 my-4 border border-gray-200 dark:border-zinc-700">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">Relationship Statement Example</p>
          <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
            I hold a Master of Science in Computer Science from [University], with coursework in
            Database Systems, Distributed Computing, Machine Learning, and Data Structures. In my
            role as Data Engineer at [Company], I design and maintain ETL pipelines using Apache
            Spark and AWS Redshift (applying Database Systems and Distributed Computing principles),
            write SQL and Python to transform raw event data into analytical models (applying Data
            Structures and algorithm design), and collaborate with ML engineers to prepare training
            datasets (applying machine learning preprocessing techniques). Each core duty directly
            applies technical knowledge from my degree program.
          </p>
        </div>

        <h3>Business Administration — Financial Analyst</h3>
        <div className="not-prose bg-gray-50 dark:bg-zinc-800 rounded-xl p-5 my-4 border border-gray-200 dark:border-zinc-700">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">Relationship Statement Example</p>
          <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
            I hold a Master of Business Administration from [University] with concentrations in
            Finance and Strategy, including coursework in Corporate Finance, Financial Modeling,
            and Managerial Accounting. In my role as Financial Analyst at [Company], I build
            three-statement financial models and DCF valuations for acquisition targets (applying
            Corporate Finance and Financial Modeling principles), prepare monthly variance analysis
            comparing actuals to budget (applying Managerial Accounting techniques), and present
            findings to senior leadership (applying business communication and strategic analysis
            skills from the MBA curriculum).
          </p>
        </div>

        <h3>Biology — Research Associate</h3>
        <div className="not-prose bg-gray-50 dark:bg-zinc-800 rounded-xl p-5 my-4 border border-gray-200 dark:border-zinc-700">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">Relationship Statement Example</p>
          <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
            I hold a Bachelor of Science in Biology from [University] with coursework in Cell
            Biology, Genetics, Biochemistry, and Molecular Laboratory Techniques. In my role as
            Research Associate at [Biotech Company], I perform cell culture maintenance and
            viability assays (applying cell biology and sterile laboratory techniques), conduct
            ELISA and Western blot analyses (applying biochemistry and molecular biology protocols
            from laboratory coursework), and analyze experimental data using R statistical software
            (applying biostatistics methods studied in my degree program).
          </p>
        </div>

        <h3>Mechanical Engineering — Product Design Engineer</h3>
        <div className="not-prose bg-gray-50 dark:bg-zinc-800 rounded-xl p-5 my-4 border border-gray-200 dark:border-zinc-700">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">Relationship Statement Example</p>
          <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
            I hold a Master of Science in Mechanical Engineering from [University] with
            specialization in Product Design and Manufacturing, including coursework in CAD/CAM,
            Thermodynamics, Mechanics of Materials, and Design for Manufacturability. In my role
            as Product Design Engineer at [Company], I create detailed 3D CAD models and
            engineering drawings for consumer product components (applying CAD/CAM and engineering
            drawing principles), perform stress analysis to validate structural integrity (applying
            Mechanics of Materials methodology), and work with manufacturing partners to optimize
            part designs for injection molding (applying Design for Manufacturability principles).
          </p>
        </div>

        <h3>Public Health — Epidemiologist / Data Analyst</h3>
        <div className="not-prose bg-gray-50 dark:bg-zinc-800 rounded-xl p-5 my-4 border border-gray-200 dark:border-zinc-700">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">Relationship Statement Example</p>
          <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
            I hold a Master of Public Health in Epidemiology from [University] with coursework in
            Biostatistics, Epidemiological Methods, Health Policy, and Survey Research Design.
            In my role as Data Analyst at [Healthcare Company], I analyze patient outcome datasets
            using SAS and Python (applying biostatistics and epidemiological analysis methods),
            design survey instruments for patient experience studies (applying survey research
            design principles), and prepare research summaries for regulatory submissions (applying
            scientific writing skills from my graduate coursework).
          </p>
        </div>

        <h2>When the Connection Is Not Obvious: Ask for a Supervisor Letter</h2>
        <p>
          Some roles are genuinely related to a degree but have titles or descriptions that make
          the connection less clear. In these cases, ask your supervisor or hiring manager to
          write a brief letter on company letterhead confirming:
        </p>
        <ul>
          <li>Your position title and primary duties</li>
          <li>The technical or specialized knowledge the role requires</li>
          <li>Their assessment of how your degree prepared you for the role</li>
          <li>Their name, title, and contact information</li>
        </ul>
        <p>
          Keep this letter with your{" "}
          <Link href="/blog/opt-employment-evidence-checklist">OPT employment evidence folder</Link>{" "}
          for that employer. A supervisor letter is particularly valuable for interdisciplinary
          roles, roles where the title is generic (e.g., "Analyst," "Associate," "Consultant"),
          or roles that combine technical and non-technical duties.
        </p>

        <h2>What Weakens a Degree Relationship Statement</h2>
        <div className="not-prose overflow-x-auto my-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-red-50 dark:bg-red-900/20">
                <th className="text-left p-3 font-semibold border border-gray-200 dark:border-zinc-700 text-red-800 dark:text-red-300">Weak Approach</th>
                <th className="text-left p-3 font-semibold border border-gray-200 dark:border-zinc-700 text-green-800 dark:text-green-300">Stronger Approach</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['"The role is technical."', "List 3–5 specific technical duties and the degree skills they require."],
                ['"My title matches my degree."', "Describe recurring duties and map each to a course or skill area."],
                ['"My employer verified the role."', "Ask employer to write a statement confirming the technical requirements."],
                ['"I use computers every day."', "Specify which software, methodologies, and technical frameworks you use."],
                ['"The job description mentions my field."', "Quote specific duties from the job description and explain the connection to your coursework."],
              ].map(([weak, strong], i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white dark:bg-zinc-900" : "bg-gray-50 dark:bg-zinc-800"}>
                  <td className="p-3 border border-gray-200 dark:border-zinc-700 text-red-700 dark:text-red-400 italic">{weak}</td>
                  <td className="p-3 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300">{strong}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2>When to Update Your Degree Relationship Statement</h2>
        <p>Update the statement when:</p>
        <ul>
          <li>Your job duties materially change (new team, new product, new technical domain)</li>
          <li>Your worksite changes</li>
          <li>You change employers</li>
          <li>Your employer is acquired and the role changes substantially</li>
          <li>A DSO or attorney review suggests the current statement needs strengthening</li>
        </ul>

        {/* FAQ */}
        <h2>Frequently Asked Questions</h2>
        <div itemScope itemType="https://schema.org/FAQPage" className="not-prose space-y-4">
          {[
            {
              q: "Does my job title have to match my degree for OPT?",
              a: "No. The degree relationship analysis focuses on duties and the knowledge and skills the duties require, not the job title. A 'Business Analyst' role may be clearly related to a computer science degree if the duties involve data modeling and SQL; a 'Software Engineer' title may not qualify if the actual duties are unrelated to the degree.",
            },
            {
              q: "Can an interdisciplinary or cross-functional role qualify for OPT?",
              a: "Yes, if the duties directly use knowledge from your qualifying degree. A role that combines data analysis and project management may qualify for a statistics degree if the data work is substantial. The key is to document which portion of the duties connects to the degree and ensure that portion is at least 20 hours per week and not trivial.",
            },
            {
              q: "Who should sign a degree-relationship letter?",
              a: "A supervisor, hiring manager, or other person familiar with your technical duties and with standing to write on company letterhead. Include their full name, title, contact information, and the date. For future visa purposes, the letter has more weight when it comes from someone with actual knowledge of your work.",
            },
            {
              q: "What should I write in the SEVP portal 'relation to field of study' field?",
              a: "Write 3–5 sentences: (1) your degree and 2–3 relevant courses, (2) 3–5 actual job duties, and (3) how each duty uses knowledge from those courses. Do not copy only the job title. The field often asks: 'Explain how this job relates to the degree that qualified you for this OPT.'",
            },
            {
              q: "Should I upload my degree-relationship statement to the SEVP Portal?",
              a: "Type the explanation directly in the portal's employment reporting form when prompted. Also keep a longer signed version in your personal records and provide copies to your DSO if your school requires a separate intake process.",
            },
            {
              q: "What if my employer does not understand why a relationship statement is needed?",
              a: "Explain briefly that you are on OPT (Optional Practical Training) under F-1 visa status and that the federal program requires employment to be related to your degree. Point them to the DHS Study in the States website for a brief overview. Most HR professionals are willing to write a simple statement once they understand the requirement.",
            },
            {
              q: "Can I have two OPT jobs with different degree relationships?",
              a: "You can have multiple concurrent positions on initial OPT, and each must independently relate to your qualifying degree. You do not need two separate degrees, but you do need a clear explanation of how each role connects to the same degree. Report both positions to your DSO.",
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
            { label: "DHS Form I-983 Overview (STEM)", href: "https://studyinthestates.dhs.gov/form-i-983-overview" },
            { label: "ICE OPT Employment Guidance", href: "https://www.ice.gov/sevis/employment" },
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
              advice. Always consult your DSO and a licensed immigration attorney for advice
              specific to your employment situation and OPT authorization.
            </p>
          </div>
        </div>

        <div className="not-prose mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Guides</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { href: "/blog/opt-employment-evidence-checklist", title: "OPT Employment Evidence Checklist", desc: "Every document to save for each employer — for DSO reporting and future visa filings." },
              { href: "/blog/what-counts-as-20-hours-on-opt", title: "What Counts as 20 Hours Per Week on OPT?", desc: "The 20-hour threshold, multiple jobs, variable schedules, and evidence requirements." },
              { href: "/blog/form-i983-stem-opt-training-plan-guide", title: "Form I-983 Training Plan Guide", desc: "How to write a strong STEM OPT training plan with specific learning objectives." },
              { href: "/blog/laid-off-on-opt", title: "Laid Off on OPT", desc: "What to do if your OPT employment ends — reporting, tracking, and next steps." },
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
