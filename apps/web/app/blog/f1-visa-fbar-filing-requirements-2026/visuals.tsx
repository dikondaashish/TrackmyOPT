import Image from 'next/image';
import type { ReactNode } from 'react';
import styles from './guide.module.css';

export function Visual({
  id,
  title,
  children,
  caption,
}: {
  id: string;
  title: string;
  children: ReactNode;
  caption: string;
}) {
  return (
    <figure id={id} className={styles.visual} aria-labelledby={`${id}-title`}>
      <h3 id={`${id}-title`}>{title}</h3>
      {children}
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

export function StudentTimeline({ december = false }: { december?: boolean }) {
  const stages = december
    ? [
        'Dec 28 arrival',
        'F-1 studies',
        'F-1 studies',
        'F-1 OPT',
        'Year five',
        'Reassess',
      ]
    : [
        'Aug arrival',
        'F-1 studies',
        'F-1 OPT',
        'STEM OPT',
        'STEM OPT',
        'Reassess',
      ];
  const years = stages.map((stage, position) => ({
    stage,
    year: 2023 + position,
  }));
  return (
    <Visual
      id={december ? 'michael-calendar' : 'arjun-timeline'}
      title={
        december
          ? 'Michael: four December days still start year one'
          : 'Arjun: five calendar years, then a residency review'
      }
      caption="Assumes no earlier exempt years and continued qualifying status. In 2028, apply the residency tests and evaluate any student exception; FBAR is not automatic."
    >
      <ol
        className={styles.timeline}
        aria-label="2023 through 2027 are the first five qualifying calendar years; 2028 is year six and requires reassessment."
      >
        {years.map(({ stage, year }) => (
          <li key={year} className={year === 2028 ? styles.reviewYear : ''}>
            <span>Year {year - 2022}</span>
            <strong>{year}</strong>
            <span>{stage}</span>
            <small>
              {year === 2028
                ? 'Count days unless an exception applies'
                : 'Qualifying days generally excluded'}
            </small>
          </li>
        ))}
      </ol>
    </Visual>
  );
}

export function DecisionFlow() {
  return (
    <Visual
      id="fbar-flowchart"
      title="Your FBAR decision path"
      caption="Start with FBAR residency, not your visa label or the tax form you filed. Exceptions, elections and part-year residency require individual evaluation."
    >
      <ol className={styles.flow}>
        <li>
          <strong>1. Are you a U.S. person for FBAR purposes?</strong>
          <p>
            For an individual: U.S. citizenship or residency under the
            applicable IRC §7701(b) rules. Review the green card test,
            substantial presence, student day exclusions and first-year choice.
          </p>
          <div className={styles.branches}>
            <span>
              <b>No:</b> generally no personal FBAR.
            </span>
            <span>
              <b>Unsure:</b> have residency reviewed.
            </span>
          </div>
        </li>
        <li>
          <span className={styles.arrow} aria-hidden="true">
            ↓ Yes
          </span>
          <strong>
            2. Financial interest or signature authority over a foreign
            financial account?
          </strong>
          <div className={styles.branches}>
            <span>
              <b>No:</b> no account to report.
            </span>
            <span>
              <b>Yes:</b> combine reportable account values.
            </span>
          </div>
        </li>
        <li>
          <span className={styles.arrow} aria-hidden="true">
            ↓
          </span>
          <strong>
            3. Did aggregate reportable values exceed $10,000 during the
            calendar year?
          </strong>
          <p>
            Follow FinCEN’s maximum-account valuation instructions. Include
            every reportable account, not just accounts individually above
            $10,000.
          </p>
          <div className={styles.branches}>
            <span>
              <b>No:</b> generally no FBAR for that year.
            </span>
            <span>
              <b>Yes:</b> file unless a specific exception applies.
            </span>
          </div>
        </li>
      </ol>
    </Visual>
  );
}

export function ResidencyGuide() {
  return (
    <Visual
      id="status-vs-residency"
      title="Two different questions: immigration status and tax residency"
      caption="OPT and STEM OPT are training authorizations within F-1 status. A student can remain F-1 and become a resident alien under tax law."
    >
      <div className={styles.comparison}>
        <div>
          <h4>Immigration status</h4>
          <p>What permits your stay and work?</p>
          <ol>
            <li>F-1 studies</li>
            <li>F-1 with OPT</li>
            <li>F-1 with STEM OPT</li>
            <li>H-1B after an effective status change</li>
          </ol>
        </div>
        <div>
          <h4>Tax / FBAR residency</h4>
          <p>Which residency tests apply this year?</p>
          <ol>
            <li>Review all visa and presence history</li>
            <li>Exclude eligible student days</li>
            <li>Apply green card / presence rules</li>
            <li>Review exceptions and elections</li>
          </ol>
        </div>
      </div>
    </Visual>
  );
}

export function StudentComparison() {
  return (
    <Visual
      id="student-comparison"
      title="Arjun and Priya: same F-1 status, different residency results"
      caption="2026 comparison under the stated assumptions. Neither arrival year nor foreign balance alone settles FBAR."
    >
      <div className={styles.tableScroll}>
        <table>
          <thead>
            <tr>
              <th scope="col">2026 facts</th>
              <th scope="col">Arjun · India</th>
              <th scope="col">Priya · India</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['First arrival', 'August 2023', 'August 2020'],
              ['Visa status', 'F-1, STEM OPT', 'F-1, STEM OPT'],
              ['First five qualifying years', '2023–2027', '2020–2024'],
              [
                '2026 tax residency',
                'Nonresident under these assumptions',
                'Resident under these assumptions',
              ],
              ['Foreign account value', '$18,000', '$25,000'],
              [
                'FBAR conclusion',
                'Generally not required while nonresident for FBAR',
                'Required if reportable accounts exceed threshold; no exception assumed',
              ],
            ].map(([label, arjun, priya]) => (
              <tr key={label}>
                <th scope="row">{label}</th>
                <td>{arjun}</td>
                <td>{priya}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Visual>
  );
}

export function StudentCard({
  name,
  country,
  arrival,
  timeline,
  residency,
  balance,
  conclusion,
  children,
}: {
  name: string;
  country: string;
  arrival: string;
  timeline: string;
  residency: string;
  balance: string;
  conclusion: string;
  children: ReactNode;
}) {
  return (
    <div
      className={styles.student}
      aria-label={`${name}, fictional student scenario`}
    >
      <div className={styles.studentHeading}>
        <h3>{name}</h3>
        <span>{country} · Fictional example</span>
      </div>
      <dl>
        <div>
          <dt>First U.S. arrival</dt>
          <dd>{arrival}</dd>
        </div>
        <div>
          <dt>Visa timeline</dt>
          <dd>{timeline}</dd>
        </div>
        <div>
          <dt>2026 tax classification</dt>
          <dd>{residency}</dd>
        </div>
        <div>
          <dt>Foreign accounts</dt>
          <dd>{balance}</dd>
        </div>
      </dl>
      <p className={styles.conclusion}>
        <strong>FBAR conclusion:</strong> {conclusion}
      </p>
      {children}
    </div>
  );
}

export function AccountCalculation() {
  return (
    <Visual
      id="account-calculation"
      title="Sara: three small accounts cross one aggregate threshold"
      caption="Illustrative USD values after the required conversion. All three reach these values on the same day in 2026. Sara is a U.S. person under the scenario assumptions."
    >
      <div
        className={styles.calculation}
        aria-label="Savings 4,500 dollars plus deposit 3,800 dollars plus brokerage 2,200 dollars equals 10,500 dollars, exceeding 10,000 dollars."
      >
        <div>
          <span>Savings</span>
          <strong>$4,500</strong>
        </div>
        <b aria-hidden="true">+</b>
        <div>
          <span>Term deposit</span>
          <strong>$3,800</strong>
        </div>
        <b aria-hidden="true">+</b>
        <div>
          <span>Brokerage</span>
          <strong>$2,200</strong>
        </div>
        <b aria-hidden="true">=</b>
        <div className={styles.total}>
          <span>Combined</span>
          <strong>$10,500</strong>
        </div>
      </div>
      <p className={styles.conclusion}>
        Each account is below $10,000. Together they exceed $10,000, so all
        three are reportable, assuming no exception.
      </p>
    </Visual>
  );
}

export function VisaTimeline() {
  return (
    <Visual
      id="daniel-visa-timeline"
      title="Daniel: changing status changes which days count"
      caption="Assumes Daniel stays in the U.S. October 1 through December 31, 2026, and all earlier F-1 days qualify for exclusion. The 2027 result is conditional on continued presence and no exception."
    >
      <ol className={styles.visaTimeline}>
        <li>
          <strong>2022–2025</strong>
          <span>F-1 → OPT → STEM OPT</span>
          <small>Qualifying student days excluded</small>
        </li>
        <li>
          <strong>Jan–Sep 2026</strong>
          <span>F-1 STEM OPT</span>
          <small>Eligible days still excluded</small>
        </li>
        <li>
          <strong>Oct 1–Dec 31, 2026</strong>
          <span>H-1B status effective</span>
          <small>92 countable days, not 183</small>
        </li>
        <li>
          <strong>2027</strong>
          <span>H-1B continues</span>
          <small>Presence test likely met if he stays</small>
        </li>
      </ol>
    </Visual>
  );
}

export function AnimatedExample() {
  return (
    <Visual
      id="animated-example"
      title="Watch the example: arrival year changes the residency review"
      caption="The GIF illustrates Arjun’s five-year calendar and Priya’s earlier review point. The full assumptions and conclusions appear in their student cards. Close the animation to stop viewing it; reduced-motion readers receive the static summary."
    >
      <details className={styles.animation}>
        <summary>Open animated student example (GIF)</summary>
        <Image
          className={styles.motionImage}
          src="/blog/fbar-2026/student-example.gif"
          alt="Animated walkthrough: Arjun’s first qualifying year is 2023, year five is 2027 and 2028 requires residency review; Priya’s first five years ended in 2024. Residency and aggregate foreign accounts determine FBAR."
          width={960}
          height={720}
          unoptimized
        />
        <Image
          className={styles.staticImage}
          src="/blog/fbar-2026/student-example-static.png"
          alt="Static version: Arjun has qualifying student years 2023–2027 and must reassess in 2028. Priya has qualifying years 2020–2024 and must reassess from 2025."
          width={960}
          height={720}
        />
        <a href="/blog/fbar-2026/student-example.gif" download>
          Download the GIF
        </a>
      </details>
    </Visual>
  );
}
