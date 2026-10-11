import Link from 'next/link';
import {
  AccountCalculation,
  AnimatedExample,
  DecisionFlow,
  ResidencyGuide,
  StudentCard,
  StudentComparison,
  StudentTimeline,
  VisaTimeline,
} from './visuals';
import styles from './guide.module.css';

import { faqItems, source } from './data';

export function ResidencyBasics() {
  return (
    <>
      <section id="what-is-fbar">
        <h2>1. What is FBAR, and why does it exist?</h2>
        <p>
          FBAR stands for{' '}
          <strong>Report of Foreign Bank and Financial Accounts</strong>. It is
          FinCEN Form 114, an annual information report to the U.S. Treasury. It
          helps authorities identify foreign financial accounts relevant to
          financial crime and compliance investigations. Filing the report does
          not itself calculate a tax bill.{' '}
          <a href={source.instructions}>
            FinCEN instructions: purpose and definitions
          </a>
          .
        </p>
        <p>
          Think of it as a separate account-reporting obligation. Money saved
          before coming to the United States can still matter. So can an account
          that earned no interest. Whether income from that account belongs on a
          tax return is a different question.
        </p>
        <DecisionFlow />
      </section>
      <section id="f1-students">
        <h2>2. Do F-1 students need to file FBAR?</h2>
        <p>
          Some do; many do not. For an individual who is not a U.S. citizen,
          FBAR residency generally follows the resident-alien tests in Internal
          Revenue Code §7701(b), with the FBAR definition of the United States.
          A qualifying nonresident student generally falls outside the personal
          U.S.-person filing requirement.{' '}
          <a href={source.instructions}>FinCEN’s resident definition</a>.
        </p>
        <p>
          Before using that conclusion, check earlier visits, changes of status
          and residency choices. Do not decide from the F-1 visa stamp alone.
          Also, a U.S. company you own can have its own reporting obligation
          independently of your personal status.
        </p>
      </section>
      <section id="opt-stem-opt">
        <h2>3. Are OPT and STEM OPT students required to file?</h2>
        <p>
          <strong>FBAR for OPT students</strong> and{' '}
          <strong>STEM OPT FBAR filing</strong> follow the same basic sequence:
          determine FBAR residency, identify reportable foreign accounts, then
          apply the aggregate threshold. Authorized practical training does not,
          by itself, make a student a tax resident.
        </p>
        <p>
          OPT and STEM OPT operate within F-1 status. Graduation, earning a
          full-time salary or receiving an EAD does not restart the five-year
          count. The IRS distinguishes immigration status from tax residency and
          discusses authorized student practical training in its guidance.{' '}
          <a href={source.visa}>IRS visa and tax-status guidance</a>;{' '}
          <a href={source.p519}>Publication 519</a>.
        </p>
        <ResidencyGuide />
        <StudentCard
          name="Arjun"
          country="India"
          arrival="August 2023"
          timeline="2023–2024 master’s; 2025 OPT; 2026–2027 STEM OPT"
          residency="Nonresident, assuming qualifying day exclusions and no other residency basis"
          balance="$18,000 across personally owned Indian bank accounts"
          conclusion="Generally not required during 2023–2027 while nonresident for FBAR purposes."
        >
          <p>
            Arjun worries that his new engineering salary changes the answer.
            Under these assumptions, his eligible F-1 days remain excluded. His
            balance exceeds the account threshold, but he has not met the
            U.S.-person condition. Assume no prior exempt-individual years,
            green card, citizenship or first-year residency choice.
          </p>
          <p>
            In 2028 he must reassess. If he remains in the United States,
            countable days and any valid student exception determine whether he
            becomes resident. If he becomes a U.S. person and keeps reportable
            accounts above the threshold, FBAR can become necessary.
          </p>
        </StudentCard>
        <StudentTimeline />
      </section>
      <section id="five-calendar-years">
        <h2>4. What is the five-calendar-year rule?</h2>
        <p>
          The phrase <strong>“FBAR five year rule”</strong> is convenient but
          misleading: the five-year provision concerns student day exclusions
          for the substantial presence test. It is not a stand-alone five-year
          FBAR holiday.
        </p>
        <p>
          Qualifying students who substantially comply with their status
          generally exclude eligible days during their first five calendar
          years. Any part of a qualifying calendar year counts; this is not 60
          months measured from arrival. Earlier exempt years in F, J, M or Q
          categories can matter, including teacher or trainee history. A new
          degree or a return after time abroad does not simply erase that
          history. <a href={source.student}>IRS: who is a student</a>.
        </p>
        <StudentCard
          name="Michael"
          country="Nigeria"
          arrival="December 28, 2023"
          timeline="2023–2025 F-1 studies; January 2026 OPT; continuing qualifying F-1 assumed"
          residency="Nonresident under the stated 2026 assumptions"
          balance="$12,500 maximum in a personally owned Nigerian savings account"
          conclusion="Generally not required while he remains nonresident for FBAR; 2023 still counts as year one."
        >
          <p>
            Michael spent only four days in the United States in 2023. His
            qualifying calendar years are still 2023, 2024, 2025, 2026 and 2027.
            The count does not begin with his first full year in 2024. Assume no
            earlier exempt history or separate residency basis.
          </p>
          <p>
            He should prepare for a residency review in 2028, even though five
            full anniversaries after his arrival do not occur until late
            December that year. Keep the arrival record with annual travel and
            visa documents.
          </p>
        </StudentCard>
        <StudentTimeline december />
      </section>
      <section id="nonresident-alien">
        <h2>5. What does “nonresident alien” mean?</h2>
        <p>
          In federal tax terminology, an “alien” is someone who is not a U.S.
          citizen. A nonresident alien generally does not satisfy the green card
          or substantial presence test, subject to applicable rules and
          exceptions. You can rent an apartment, study and work in the United
          States yet still have this tax classification.{' '}
          <a href={source.nonresident}>IRS nonresident-alien guidance</a>.
        </p>
        <p>
          <strong>
            “Exempt individual” means certain days do not count toward the
            presence test.
          </strong>{' '}
          It does not mean exempt from all U.S. taxes. Wage income, required
          returns and Form 8843 still need attention. Federal tax residency also
          does not settle every state’s residency rules.{' '}
          <a href={source.presence}>IRS explanation of exempt individuals</a>.
        </p>
      </section>
    </>
  );
}

export function ResidencyExamples() {
  return (
    <>
      <section id="substantial-presence">
        <h2>6. How does the substantial presence test work?</h2>
        <p>
          You generally satisfy the test with at least{' '}
          <strong>31 countable days in the current year</strong> and{' '}
          <strong>183 weighted days across three years</strong>. First remove
          days that qualify for exclusion. Then use this formula:
        </p>
        <p className={styles.conclusion}>
          <strong>
            Current-year days + ⅓ of prior-year days + ⅙ of second-prior-year
            days.
          </strong>
        </p>
        <p>
          For example, 120 countable days in each year gives 120 + 40 + 20 =
          180, below 183. Eligible student days are excluded, not added back at
          a discounted rate. Travel and status-change dates therefore matter.{' '}
          <a href={source.presence}>IRS substantial presence test</a>.
        </p>
        <p>
          Record physical presence before applying exclusions. Separate “days
          actually in the U.S.” from “days counted for the test” so your
          calculations can be checked. If you meet the test later in a year, the
          residency starting date can reach back to an earlier qualifying
          presence date; it is not necessarily the 183rd day.
        </p>
      </section>
      <section id="after-five-years">
        <h2>7. What happens after five calendar years?</h2>
        <p>
          Recalculate residency each year. Students who can no longer use the
          ordinary exclusion often become residents if they remain long enough,
          but year six does not automatically make everyone resident or require
          FBAR.
        </p>
        <StudentCard
          name="Priya"
          country="India"
          arrival="August 2020"
          timeline="2020–2025 F-1 PhD; 2025 OPT; 2026 STEM OPT"
          residency="Resident in 2026 under the stated presence assumptions"
          balance="$25,000 in personally owned Indian savings and deposit accounts"
          conclusion="Required for 2026 under these assumptions: U.S. resident, reportable accounts above $10,000, no filing exception."
        >
          <p>
            Priya’s first five qualifying years ended in 2024. Assume she spent
            all of 2025 in the United States, has at least 183 countable days in
            2026, and cannot substantiate continued student exclusion or another
            applicable exception. She meets the presence test while her
            immigration status remains F-1.
          </p>
          <p>
            Her 2025 obligation also deserves review. In the IRS’s comparable
            full-year F-1 example, residency begins January 1 of the sixth year,
            although the 183-day test is reached later. With her $25,000
            reportable accounts, these assumed facts support FBAR for both 2025
            and 2026. <a href={source.examples}>IRS residency examples</a>.
          </p>
        </StudentCard>
        <StudentComparison />
        <p>
          <strong>
            A student exception can sometimes continue beyond five years.
          </strong>{' '}
          The IRS requires facts supporting no intent to reside permanently,
          substantial immigration compliance, no steps toward permanent-resident
          status and a closer connection to a foreign country. The student bears
          the burden of establishing eligibility. It is not enough to say “I
          still have an I-20.”{' '}
          <a href={source.studentException}>IRS foreign-student exception</a>.
        </p>
        <p>
          The separate general closer-connection exception usually requires
          fewer than 183 actual days in the current year, a foreign tax home and
          other conditions, typically claimed with Form 8840. Do not confuse it
          with the student exception.{' '}
          <a href={source.closer}>IRS general closer-connection requirements</a>
          .
        </p>
        <AnimatedExample />
      </section>
      <section id="h1b-transition">
        <h2>8. Does switching from F-1 to H-1B change the requirements?</h2>
        <p>
          Yes, it can change which days count. H-1B days generally do not
          receive the student day exclusion. Use the{' '}
          <strong>effective status-change date</strong>, not just lottery
          selection, petition filing or an approval issued for consular
          processing. <a href={source.residency}>IRS residency rules</a>.
        </p>
        <StudentCard
          name="Daniel"
          country="South Korea"
          arrival="August 2022"
          timeline="2022–2024 F-1 master’s; 2024 OPT; 2025 STEM OPT; H-1B effective October 1, 2026"
          residency="Generally nonresident for 2026 absent an applicable residency choice or other basis"
          balance="$14,000 in personally owned Korean bank accounts"
          conclusion="Generally not required for 2026 under these assumptions; potentially required in 2027 or if a residency choice changes 2026."
        >
          <p>
            Assume all his earlier F-1 days qualify for exclusion and he remains
            in the United States through December 31. October through December
            contributes 92 countable days. Earlier excluded days contribute
            zero, so he does not reach 183 for 2026 just because he changed
            status.
          </p>
          <p>
            If he stays throughout 2027, he will generally meet the presence
            test that year. If his reportable foreign balances still exceed
            $10,000, FBAR generally follows. An eligible first-year choice can
            change the 2026 analysis; ask a professional before making it. Dates
            and exceptions control the result.{' '}
            <a href={source.p519}>Publication 519: first-year choice</a>.
          </p>
        </StudentCard>
        <VisaTimeline />
      </section>
    </>
  );
}

export function AccountsAndForms() {
  return (
    <>
      <section id="foreign-accounts">
        <h2>9. Which foreign bank and financial accounts are reportable?</h2>
        <p>
          Common examples include foreign checking and savings accounts, term
          deposits, brokerage accounts and certain mutual-fund accounts. Some
          cash-value insurance, annuity and pension arrangements also need
          evaluation. The account’s location matters more than the bank’s
          nationality. <a href={source.comparison}>IRS account comparison</a>.
        </p>
        <ul>
          <li>An account at a U.S. bank’s branch abroad can be foreign.</li>
          <li>
            An account at a foreign bank’s branch physically in the United
            States generally is not foreign for FBAR.
          </li>
          <li>
            Joint accounts and authority over someone else’s account can matter.
          </li>
          <li>A bank account with no income can still be reportable.</li>
        </ul>
        <p>
          If you can direct a bank to move money in a family account, evaluate
          signature authority even if the money belongs to your parents.
          Ownership labels, nominee arrangements and specific exceptions can
          require advice. Joint-account reporting generally uses the full
          account value, not just your percentage.{' '}
          <a href={source.instructions}>
            FinCEN account and authority definitions
          </a>
          .
        </p>
      </section>
      <section id="account-threshold">
        <h2>10. How is the $10,000 threshold calculated?</h2>
        <p>
          The threshold applies to the <strong>aggregate value</strong> of
          reportable foreign accounts, not separately to each account. “Exceeds”
          means more than $10,000; exactly $10,000 does not cross it. Closing an
          account or moving money before December 31 does not erase a higher
          earlier value.
        </p>
        <StudentCard
          name="Sara"
          country="Brazil"
          arrival="August 2019"
          timeline="2019–2023 F-1 degree; 2023 OPT; 2024–June 2026 STEM OPT; August 2026 new F-1 master’s"
          residency="Resident in 2026, assuming at least 183 countable days and no applicable exception"
          balance="$4,500 savings + $3,800 term deposit + $2,200 brokerage"
          conclusion="Required under these assumptions: combined reportable values reach $10,500 while she is a U.S. person."
        >
          <p>
            Sara assumes three small accounts mean three exemptions. Her first
            five qualifying years were 2019–2023; a new degree does not restart
            them. Assume she has met the residency test and the three balances
            coexist on the same day, after the appropriate currency conversion.
          </p>
          <p>
            Her combined value crosses the threshold. She reports all three
            accounts, including the $2,200 brokerage account. We assume no
            special account or filing exception applies.
          </p>
        </StudentCard>
        <AccountCalculation />
        <p>
          For filing, determine each account’s annual maximum in its own
          currency and convert using the Treasury rate for the last day of that
          reporting year. Round reported USD amounts up to whole dollars.
          FinCEN’s instructions direct filers to aggregate maximum account
          values. If peaks happen on different dates or transfers complicate the
          total, review those instructions with a professional rather than
          looking only at one year-end snapshot.{' '}
          <a href={source.maximum}>FinCEN valuation steps</a>;{' '}
          <a href={source.rates}>Treasury exchange rates</a>.
        </p>
        <p>
          For 2026 accounts, the required December 31, 2026 rate is not yet
          available as of this article’s October publication date. The student
          balances here are illustrative USD equivalents, not actual currency
          conversions.
        </p>
      </section>
      <section id="forms-compared">
        <h2>
          11. What is the difference between FBAR, Form 8843, Form 1040-NR and
          Form 8938?
        </h2>
        <div className={styles.tableScroll}>
          <table>
            <caption>Different forms answer different questions</caption>
            <thead>
              <tr>
                <th scope="col">Form</th>
                <th scope="col">Purpose</th>
                <th scope="col">Where it goes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">FBAR / FinCEN 114</th>
                <td>
                  Report qualifying foreign financial accounts when the
                  U.S.-person and aggregate threshold rules apply.
                </td>
                <td>Separately to FinCEN through BSA E-Filing.</td>
              </tr>
              <tr>
                <th scope="row">Form 8843</th>
                <td>
                  Explain eligible presence-day exclusions; generally required
                  for qualifying students claiming them, including without
                  income.
                </td>
                <td>
                  IRS, with the income-tax return or separately if no return is
                  required.
                </td>
              </tr>
              <tr>
                <th scope="row">Form 1040-NR</th>
                <td>
                  Income-tax return for nonresident aliens who meet filing
                  requirements.
                </td>
                <td>IRS; it does not replace FBAR.</td>
              </tr>
              <tr>
                <th scope="row">Form 8938</th>
                <td>
                  Report specified foreign financial assets for covered
                  taxpayers above its separate thresholds.
                </td>
                <td>Attached to the required annual income-tax return.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Form 8938 can cover more than bank accounts. For a covered unmarried
          taxpayer living in the United States, thresholds generally exceed
          $50,000 at year end or $75,000 at any time; filing jointly and living
          abroad have different thresholds. Certain nonresidents are covered
          too. If no income-tax return is required, Form 8938 generally is not
          required. Check its instructions separately.{' '}
          <a href={source.i8938}>IRS Form 8938 instructions</a>;{' '}
          <a href={source.f8843}>Form 8843 and instructions</a>.
        </p>
        <p>
          <strong>Watch the residency exceptions:</strong> a treaty-based
          nonresident tax return does not remove FBAR residency if the
          applicable domestic residency test is met. Spousal elections under
          §6013(g)/(h) are not considered when determining FBAR residency, while
          a first-year choice under §7701(b)(4) can matter. Have the exact
          election reviewed.{' '}
          <a href={source.manual}>IRS FBAR manual, U.S. resident rules</a>.
        </p>
      </section>
      <section id="how-to-file">
        <h2>12. How do students file an FBAR if required?</h2>
        <ol>
          <li>
            <strong>Confirm the reporting year and residency.</strong> Review
            arrival, departure and effective status-change dates.
          </li>
          <li>
            <strong>Inventory every reportable account.</strong> Gather account
            numbers, institution names and addresses, ownership and authority
            details.
          </li>
          <li>
            <strong>Calculate annual maximum values.</strong> Use statements
            that fairly reflect the maximum and the required exchange-rate
            method.
          </li>
          <li>
            <strong>Use FinCEN’s official system.</strong> Individuals can file
            without registering for a BSA account. Start at{' '}
            <a href={source.filing}>BSA E-Filing for FBAR</a>.
          </li>
          <li>
            <strong>Review, submit and save the acknowledgement.</strong> A
            preparer needs the appropriate authorization; keep your records.
          </li>
        </ol>
        <p>
          FBAR is filed separately from your income-tax return. Keep the
          required account details and maximum-value records for five years from
          April 15 following the reporting year. A filed copy helps, but retain
          supporting statements and conversion calculations too.{' '}
          <a href={source.records}>FinCEN recordkeeping rule</a>.
        </p>
      </section>
      <section id="deadlines">
        <h2>13. What are the applicable filing deadlines?</h2>
        <div className={styles.tableScroll}>
          <table>
            <caption>
              Standard FBAR dates, absent applicable special relief
            </caption>
            <thead>
              <tr>
                <th scope="col">Accounts during</th>
                <th scope="col">Regular due date</th>
                <th scope="col">Automatic extended deadline</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">2025</th>
                <td>April 15, 2026</td>
                <td>October 15, 2026</td>
              </tr>
              <tr>
                <th scope="row">2026</th>
                <td>April 15, 2027</td>
                <td>October 15, 2027</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          You do not request the automatic FBAR extension. Disaster or other
          specific relief can change a deadline for eligible filers; check
          FinCEN’s current notices. As of October 11, 2026, the standard
          extended deadline for a required 2025 FBAR is only four days away.{' '}
          <a href={source.irsFbar}>IRS FBAR deadlines and relief guidance</a>.
        </p>
        <p>
          Income-tax deadlines are separate. A calendar-year Form 1040-NR filer
          with wages subject to U.S. withholding generally files by April 15;
          without such wages, the standard date is generally June 15. Form 8843
          follows the applicable 1040-NR due-date rules, including extensions.
          Use the correct year’s instructions and applicable holiday
          adjustments. <a href={source.i1040nr}>1040-NR filing instructions</a>;{' '}
          <a href={source.f8843}>8843 instructions</a>.
        </p>
      </section>
    </>
  );
}

export function NextSteps() {
  return (
    <>
      <section id="mistakes">
        <h2>14. What mistakes should international students avoid?</h2>
        <ul>
          <li>
            <strong>Counting anniversaries instead of calendar years.</strong>{' '}
            Michael’s December arrival still starts 2023.
          </li>
          <li>
            <strong>Assuming employment changes residency immediately.</strong>{' '}
            Daniel must calculate countable days.
          </li>
          <li>
            <strong>Treating year six as an automatic filing order.</strong>{' '}
            Priya’s conclusion depends on presence and exceptions.
          </li>
          <li>
            <strong>Checking each account against $10,000.</strong> Sara must
            combine reportable values.
          </li>
          <li>
            <strong>Using only December 31 balances.</strong> Higher annual
            values can matter.
          </li>
          <li>
            <strong>Confusing tax forms with FBAR.</strong> Form 8843, 1040-NR
            or 8938 does not replace FinCEN 114.
          </li>
          <li>
            <strong>Ignoring earlier visa history or joint accounts.</strong>{' '}
            Your first master’s program may not be the beginning of your
            relevant history.
          </li>
        </ul>
        <p>
          If you missed a required report, get advice promptly. Late-filing
          procedures and potential penalties depend on the facts, including
          reported income and prior government contact. This guide does not
          promise penalty relief.{' '}
          <a href={source.irsFbar}>IRS delinquent FBAR guidance</a>.
        </p>
      </section>
      <section id="professional-review">
        <h2>15. When should students consult a qualified tax professional?</h2>
        <p>
          Seek a CPA, enrolled agent or tax attorney experienced in nonresident
          taxation and FBAR when you have prior J/F/M/Q history, more than five
          qualifying years, a midyear status change, a first-year choice, a
          joint-return election, a treaty position or a dual-status year.
        </p>
        <p>
          Foreign pensions, cash-value policies, inherited or family accounts,
          signature authority, uncertain account peaks and missed filings also
          justify review. Bring I-94 travel records, status notices, prior
          returns and Forms 8843, plus account statements. Ask for a separate
          explanation of your <strong>income-tax residency</strong> and{' '}
          <strong>FBAR residency</strong>, including the relevant dates.
        </p>
        <p>
          No student story can resolve those details for you. The examples show
          how to ask better questions; they do not substitute for examining your
          documents.
        </p>
      </section>
      <section id="faq">
        <h2>
          Frequently asked questions about international students and FBAR
        </h2>
        {faqItems.map((item) => (
          <details className={styles.faq} key={item.question}>
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
        <p>
          These answers summarize the{' '}
          <a href={source.student}>IRS student rule</a>,{' '}
          <a href={source.presence}>presence test</a>,{' '}
          <a href={source.manual}>FBAR residency guidance</a> and{' '}
          <a href={source.fbar}>FinCEN filing requirements</a>. Apply the full
          rules to your situation.
        </p>
      </section>
      <section id="checklist">
        <h2>Your next-step checklist</h2>
        <p>
          The core F1 visa FBAR filing requirements are a U.S.-person
          determination, reportable foreign accounts and an aggregate value
          exceeding $10,000. Arjun and Michael illustrate qualifying student day
          exclusions; Priya illustrates reassessment; Daniel illustrates a dated
          status change; Sara illustrates aggregation.
        </p>
        <p>
          Use this checklist to identify what needs investigation. Checking
          boxes does not calculate residency or tell you to file. Nothing is
          saved or submitted.
        </p>
        <div className={styles.checklist}>
          {[
            'I identified the calendar year I am reviewing.',
            'I listed every relevant arrival, visa category and status-change date.',
            'I checked my prior qualifying calendar years and countable presence days.',
            'I reviewed citizenship, green card, exceptions, treaties and elections where relevant.',
            'I listed foreign accounts, joint ownership and signature authority.',
            'I checked aggregate values, annual maxima and the required conversion method.',
            'I confirmed deadlines and arranged professional review for unresolved questions.',
          ].map((label) => (
            <label key={label}>
              <input type="checkbox" />
              {label}
            </label>
          ))}
        </div>
        <p>
          For the immigration side of your planning, explore TrackMyOPT’s{' '}
          <Link href="/blog/stem-opt-extension-guide">
            STEM OPT extension guide
          </Link>{' '}
          and{' '}
          <Link href="/blog/opt-to-h1b-transition">
            OPT-to-H-1B transition guide
          </Link>
          . Keep your immigration timeline alongside your tax records so you can
          review each year with confidence.
        </p>
        <p className={styles.disclaimer}>
          <strong>Educational disclaimer:</strong> This article provides general
          information, not individualized tax or legal advice. All five students
          are fictional. Conclusions rely on stated assumptions and rules
          checked on October 11, 2026. Future rules, filing instructions and
          relief notices may change. A qualified professional should review your
          actual residency, accounts, elections and filing obligations.
        </p>
      </section>
    </>
  );
}
