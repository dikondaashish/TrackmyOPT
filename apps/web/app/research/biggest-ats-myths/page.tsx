import { Metadata } from 'next';
import Link from 'next/link';
import { ResearchArticleShell } from '@/components/research/ResearchArticleShell';
import { RESEARCH_POSTS } from '@/data/research-hub';

const post = RESEARCH_POSTS.find((p) => p.slug === 'biggest-ats-myths')!;

export const metadata: Metadata = {
  title: 'The Biggest ATS Myths (From People Who Actually Hire) | TrackMyOPT Research',
  description:
    'No, most resumes are not auto-rejected by a robot. We talked to students, recruiters, and our own hiring stack — here is what really happens after you hit submit on OPT.',
  alternates: { canonical: 'https://www.trackmyopt.com/research/biggest-ats-myths' },
  openGraph: {
    images: [{ url: `https://www.trackmyopt.com${post.image}`, width: 1200, height: 675, alt: post.title }],
  },
};

export default function BiggestAtsMythsPage() {
  return (
    <ResearchArticleShell
      category="Hiring reality"
      title="The biggest ATS myths"
      description="We have watched thousands of OPT applications move through real hiring systems. Most of the advice floating around Reddit is fiction. Here is what actually happens after you click apply."
      readTime="5 min read"
      publishedDate="September 1, 2026"
      image={post.image}
      next={{
        href: '/research/not-getting-interviews',
        label: 'Read this if you are not getting interviews',
      }}
    >
      <p>
        Every week someone in our community posts that &quot;75% of resumes never reach a human.&quot;
        Nobody can point to where that number came from. We have never seen an ATS do that — and we
        pay attention, because TrackMyOPT students apply at scale and we need to know what is real.
      </p>

      <h2>Myth: the ATS auto-rejects the bottom 75%</h2>
      <p>
        An applicant tracking system is basically a searchable inbox. Your application lands in a
        list. It sits there until a human opens that list, runs a keyword search, or moves people
        between stages. There is no secret &quot;reject everyone below rank 500&quot; button.
      </p>
      <p>
        The <em>only</em> automatic no we see reliably is a knockout question the employer set up:
        work authorization, location, security clearance, license, &quot;are you willing to relocate,&quot;
        that sort of thing. On OPT, the sponsorship question is the big one. Answer it wrong and
        you are out before anyone reads your bullets — but that is <strong>your answer</strong>, not
        an algorithm punishing your font choice.
      </p>

      <h2>What actually happens after you submit</h2>
      <ol>
        <li>Your application lands in a queue, usually in the order it arrived.</li>
        <li>
          A knockout answer can close it immediately. This is the only real automatic filter, and it
          is painfully common for international students who click &quot;no sponsorship&quot; on
          autopilot.
        </li>
        <li>
          Someone searches the queue by keyword — often the exact words from the job post. This is
          where literal wording matters. &quot;SRE&quot; and &quot;DevOps&quot; are different
          searches.
        </li>
        <li>
          They skim the first screenful of results. Your most recent role and its first bullet do
          disproportionate work because that is what gets opened.
        </li>
        <li>
          They stop when they have enough people to call. Applying early to a fresh posting still
          helps — but because a human stops reading, not because a robot ranked you.
        </li>
      </ol>
      <p>
        No machine decided you were unqualified. Either a person opened your resume and did not find
        what they needed, or nobody opened it at all.
      </p>

      <h2>Other myths we hear constantly</h2>

      <h3>&quot;Your ATS match score predicts your chances&quot;</h3>
      <p>
        No mainstream ATS prints a score that decides your fate. Tools that show you a percentage are
        measuring keyword overlap with the posting — useful for catching a word you forgot, useless
        as a prophecy. There is no universal ATS standard to optimize for; every vendor parses
        differently and none publish a spec.
      </p>
      <p>
        Yes, TrackMyOPT has resume tooling. We will be straight with you: treat any match number as a
        starting point, not a grade. We are working on making ours explain <em>which</em> words are
        missing and <em>why</em>, not just flashing green/red. Tuning a resume until it &quot;beats&quot;
        a fake score is how you end up with keyword soup.
      </p>

      <h3>&quot;It has to be one page&quot;</h3>
      <p>
        No software enforces page count. Our rule of thumb for new grads: one page until you have
        roughly five years of relevant work, two after that. International students with multiple
        internships and projects often need the space — just do not waste it on a skills paragraph
        nobody reads.
      </p>

      <h3>&quot;Never send a PDF&quot;</h3>
      <p>
        What breaks parsing is an image: a scan, a Canva export, a photo of your resume. A normal,
        text-selectable PDF is fine. We have seen more failures from funky columns than from file
        format.
      </p>

      <h3>&quot;Recruiters spend six seconds&quot;</h3>
      <p>
        The skimming is real. The precise number is marketing. First pass is fast. That is why the
        top third of page one matters more than your GitHub link at the bottom.
      </p>

      <h3>&quot;Hidden white text beats the scanner&quot;</h3>
      <p>
        Parsers read the text layer. We see every word. Worse, it looks like cheating, and unlike a
        rejection email you never got, the record can sit in that company&apos;s system. Do not do
        this.
      </p>

      <h2>What actually matters for OPT students</h2>
      <ul>
        <li>
          <strong>Referrals beat everything.</strong> A perfect resume in the cold pile is still in
          the cold pile.
        </li>
        <li>
          <strong>Read knockout questions.</strong> Sponsorship, location, start date — answer
          honestly and consistently with your visa situation.
        </li>
        <li>
          <strong>Use the posting&apos;s words</strong> where they are true. Not synonyms. Their
          wording.
        </li>
        <li>
          <strong>Plain structure.</strong> Single column. No photo. If it reads in order in Notepad,
          it will parse.
        </li>
        <li>
          <strong>Filter for sponsors before you apply.</strong> TrackMyOPT&apos;s H-1B sponsor
          search exists because cold-applying to companies that never file is how you burn
          unemployment days for nothing.
        </li>
      </ul>

      <p>
        Stop optimizing for a robot that was never the thing rejecting you. The next post is about
        what to work on instead — what TrackMyOPT can take off your plate, and what only you can put
        on your resume.
      </p>

      <p>
        <Link href="/research/not-getting-interviews">Continue: Read this if you are not getting interviews →</Link>
      </p>
    </ResearchArticleShell>
  );
}
