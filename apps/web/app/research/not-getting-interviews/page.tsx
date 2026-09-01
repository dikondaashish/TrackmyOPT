import { Metadata } from 'next';
import Link from 'next/link';
import { ResearchArticleShell } from '@/components/research/ResearchArticleShell';
import { RESEARCH_POSTS } from '@/data/research-hub';

const post = RESEARCH_POSTS.find((p) => p.slug === 'not-getting-interviews')!;

export const metadata: Metadata = {
  title: 'Read This If You Are Not Getting Interviews on OPT | TrackMyOPT Research',
  description:
    'TrackMyOPT is not a magic bullet. What recruiters actually screen for, what only you can write on your resume, and how to spend the hours our tools give back.',
  alternates: { canonical: 'https://www.trackmyopt.com/research/not-getting-interviews' },
  openGraph: {
    images: [{ url: `https://www.trackmyopt.com${post.image}`, width: 1200, height: 675, alt: post.title }],
  },
};

export default function NotGettingInterviewsPage() {
  return (
    <ResearchArticleShell
      category="What to work on instead"
      title="Read this if you are not getting interviews"
      description="Our job tracker and Chrome extension save you hours. They do not invent qualifications you never earned. Here is how to spend the time we give back."
      readTime="8 min read"
      publishedDate="September 1, 2026"
      image={post.image}
      next={{
        href: '/research/biggest-ats-myths',
        label: 'The biggest ATS myths',
      }}
    >
      <p>
        <strong>TL;DR:</strong> TrackMyOPT is not a magic bullet. We help you apply faster, track
        sponsors, and watch your unemployment days. If you are serious about landing a role on OPT,
        every hour we save you should go back into three things: a resume that proves real
        qualifications, enough applications to learn whether that resume works, and networking
        (the one thing almost nobody does).
      </p>

      <p>
        The market is brutal right now. Roles that used to take twenty thoughtful applications now
        take hundreds. Every posting you see already has a shortlist forming. If your resume is not
        in the top slice of what a recruiter actually reads, you will not get a call — not because
        you cannot do the job, but because they never got far enough to find out.
      </p>

      <h2>A keyword is not a qualification</h2>
      <p>
        Recruiters are not hunting keywords. They are hunting proof. A real qualification has four
        parts. Miss one and it does not count:
      </p>
      <ul>
        <li>
          <strong>What</strong> — the exact skill they asked for, in their words
        </li>
        <li>
          <strong>How</strong> — the system, workflow, or thing you built with it
        </li>
        <li>
          <strong>Why</strong> — plain English: what it enabled or fixed
        </li>
        <li>
          <strong>Where</strong> — the job, internship, or project it happened inside
        </li>
      </ul>

      <p>Same work, two ways of writing it:</p>

      <p>
        <em>Does not count:</em> &quot;Architected 12 endpoints across authentication and CRUD.
        Increased signups 100%.&quot; Impressive to another engineer. A recruiter cannot tell which
        required skills this proves.
      </p>

      <p>
        <em>Counts:</em> &quot;Built REST APIs in Python with FastAPI and PostgreSQL on AWS so
        customers could schedule email briefings without asking our team to pull data manually.&quot;
        Their words, a real stack, a reason a non-engineer understands, inside a real role.
      </p>

      <h2>What only you can do</h2>
      <p>
        The good bullet is not prettier writing. It is more facts. Nobody else has your facts — which
        is why we cannot generate them for you. Before you add a line, ask:
      </p>
      <ul>
        <li>Where did you use this, and what were you actually building?</li>
        <li>Who was it for, and what could they do afterward that they could not before?</li>
        <li>Who did you work with or convince?</li>
        <li>If there is a number, what is it measuring and is it real?</li>
      </ul>
      <p>If you cannot answer those, leave it off.</p>

      <h2>What TrackMyOPT actually takes off your hands</h2>
      <ul>
        <li>Finding roles at companies with real H-1B filing history — not guessing from the logo</li>
        <li>Saving listings from LinkedIn and Indeed into one tracker with the Chrome extension</li>
        <li>Keeping applications, stages, and follow-ups in one place instead of seventeen tabs</li>
        <li>Counting unemployment days next to your pipeline so compliance does not sneak up on you</li>
        <li>Resume tweaks that mirror wording in a specific posting — the mechanical last mile</li>
      </ul>
      <p>
        All of that is logistics. It buys back hours. It does not put internships on your resume
        that you never did. Spend the hours on the resume itself and on people who can refer you in.
      </p>

      <h2>Rules we see OPT students break</h2>

      <h3>Skills sections do not count as proof</h3>
      <p>
        No &quot;where.&quot; A recruiter reads them as claims. Prove skills inside a job or project
        bullet or they are invisible.
      </p>

      <h3>Order what they ordered</h3>
      <p>
        The job post is the order slip. Impressive adjacent skills — deep framework trivia, obscure
        libraries, shiny side projects — are not substitutes for what they listed first. Lead with
        what they asked for in the top third of the page.
      </p>

      <h3>Front-load the first bullet</h3>
      <p>
        The first bullet under your most recent relevant role is the line most likely to get read.
        Put your strongest proof there. Do not bury the good stuff at the bottom.
      </p>

      <h3>Nothing is implied</h3>
      <p>
        TypeScript does not imply JavaScript. Pydantic does not imply Python. GitHub Actions does not
        imply CI/CD. If they asked for it and you did it, write it. Recruiters will not connect the
        dots for you.
      </p>

      <h3>Vague verbs prove nothing</h3>
      <p>
        &quot;Drove operational excellence.&quot; &quot;Spearheaded key initiatives.&quot; If the
        sentence would still be true for someone in a completely different job, cut it or rewrite it
        with specifics.
      </p>

      <h3>Interns: half the checklist is not technical</h3>
      <p>
        Most intern rubrics want a degree, basic stack knowledge, ability to take feedback, and
        ability to work on a team. Nearly every intern resume we review proves the first two and
        gets rejected for missing the second two. Keep education near the top while it is your
        strongest card.
      </p>

      <h2>How to tell if it is working</h2>
      <p>
        Count applications per interview. That one ratio tells you whether the resume is the problem.
      </p>
      <p>
        In this market, one interview per 100–200 targeted applications is a solid outcome for many
        OPT students — especially cold applications without referrals. If you are far past that with
        nothing back, more volume will not fix it. Pause. Pick one role you actually want. Pull its
        requirements. For each line, ask where on your resume a stranger could see you doing it.
      </p>
      <p>
        Where you cannot find proof, you have two honest options: go build something real and write
        it down, or do not claim it. We get asked to invent experience constantly. We will not do
        that for you. The second path is slower and the only one still helping you in five years.
      </p>

      <h2>What we are building next</h2>
      <p>
        We are wiring sponsor-aware checks and clearer resume feedback into TrackMyOPT so the tool
        tells you <em>what is missing</em> instead of handing you a meaningless score. We also want
        to publish side-by-side resume breakdowns — what a recruiter actually sees in the ones that
        get calls vs the ones that do not.
      </p>
      <p>
        If this helped, or if it did not,{' '}
        <Link href="/contact">tell us</Link>. That is how we pick what to write next.
      </p>

      <div className="not-prose mt-10 flex flex-wrap gap-3">
        <Link
          href="/features/job-tracker"
          className="inline-flex items-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Open Job Tracker
        </Link>
        <Link
          href="/features/resume-ai"
          className="inline-flex items-center rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-800"
        >
          Resume tools
        </Link>
        <Link
          href="/dashboard/h1b-sponsors"
          className="inline-flex items-center rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-800"
        >
          H-1B sponsor search
        </Link>
      </div>
    </ResearchArticleShell>
  );
}
