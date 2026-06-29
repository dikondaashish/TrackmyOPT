import { Metadata } from "next";
import { safeSerializeJsonLd } from "@/lib/safe-json-ld";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Immigration Glossary: F-1 Visa Terms Explained | TrackMyOPT",
    description: "Complete glossary of F-1 visa, OPT, STEM OPT, H-1B, and immigration terminology. Definitions for every term you need to understand.",
    alternates: {
        canonical: "https://www.trackmyopt.com/glossary",
    },
};

interface GlossaryTerm {
    term: string;
    definition: string;
    links?: { label: string; href: string }[];
}

const glossaryData: Record<string, GlossaryTerm[]> = {
    A: [
        {
            term: "AOS (Adjustment of Status)",
            definition:
                "The process of changing immigration status to lawful permanent resident (green card holder) while remaining in the United States. Filed using Form I-485 with USCIS. F-1 students may pursue AOS through employer-sponsored petitions (EB category) or family-based petitions without leaving the country.",
        },
        {
            term: "AP (Advance Parole)",
            definition:
                "A travel document that allows individuals with a pending Adjustment of Status application to re-enter the United States after traveling abroad. Without AP, leaving the U.S. while an I-485 is pending can result in abandonment of the application. AP is filed using Form I-131.",
        },
    ],
    B: [
        {
            term: "Biometrics Appointment",
            definition:
                "A scheduled appointment at a USCIS Application Support Center (ASC) where applicants provide fingerprints, photographs, and a digital signature. Required for most immigration benefit applications including EAD cards and Adjustment of Status. USCIS uses biometrics for identity verification and background checks.",
        },
        {
            term: "BLS (Bureau of Labor Statistics)",
            definition:
                "A unit of the U.S. Department of Labor that publishes employment data, wage statistics, and Standard Occupational Classification (SOC) codes. BLS SOC codes are used on the Form I-983 Training Plan for STEM OPT to classify the student's training occupation and demonstrate it is directly related to their STEM degree.",
            links: [
                { label: "I-983 Training Plan Guide", href: "/blog/i-983-training-plan-guide" },
            ],
        },
    ],
    C: [
        {
            term: "Cap-Gap Extension",
            definition:
                "An automatic extension of F-1 status and OPT/EAD authorization for students who are beneficiaries of a timely filed H-1B cap-subject petition. The cap-gap bridges the period between the expiration of OPT and the start of H-1B status on October 1. Authorized under 8 CFR § 214.2(f)(5)(vi).",
            links: [
                { label: "Cap-Gap Extension Guide", href: "/blog/h1b-cap-gap-extension" },
                { label: "OPT to H-1B Transition", href: "/blog/opt-to-h1b-transition" },
            ],
        },
        {
            term: "CBP (Customs and Border Protection)",
            definition:
                "The federal agency responsible for inspecting travelers at U.S. ports of entry, including airports and land borders. CBP officers verify F-1 student documents (passport, visa stamp, I-20) upon entry and create the electronic Form I-94 arrival/departure record that establishes lawful admission.",
        },
        {
            term: "Change of Status",
            definition:
                "The process of switching from one nonimmigrant visa classification to another while inside the United States (e.g., F-1 to H-1B, F-1 to H-4). Filed with USCIS and subject to approval; the applicant must maintain valid status during the pendency of the application.",
        },
        {
            term: "CIP Code",
            definition:
                "Classification of Instructional Programs code — a six-digit identifier assigned by the U.S. Department of Education to categorize academic programs. Your CIP code appears on your I-20 and determines whether your degree qualifies as a STEM-designated program eligible for the 24-month STEM OPT extension. The DHS STEM Designated Degree Program List uses CIP codes.",
            links: [
                { label: "STEM OPT Extension Guide", href: "/blog/stem-opt-extension-guide" },
            ],
        },
        {
            term: "CPT (Curricular Practical Training)",
            definition:
                "Employment authorization available to F-1 students before completing their degree, when the work experience is an integral part of the curriculum (internship, co-op, practicum). Authorized by the DSO and noted on the I-20. Full-time CPT for 12 months or more eliminates eligibility for OPT. Governed by 8 CFR § 214.2(f)(10)(i).",
            links: [
                { label: "Day-1 CPT vs OPT", href: "/blog/day-1-cpt-vs-opt" },
            ],
        },
    ],
    D: [
        {
            term: "DHS (Department of Homeland Security)",
            definition:
                "The cabinet-level federal department overseeing immigration enforcement and benefits in the United States. DHS encompasses USCIS (benefits), ICE (enforcement), and CBP (border protection). DHS sets immigration regulations including those governing F-1 students and OPT employment.",
        },
        {
            term: "DSO (Designated School Official)",
            definition:
                "A school employee authorized by SEVP to access SEVIS and assist F-1 students with immigration-related matters. Your DSO issues and signs your I-20, recommends OPT, reports changes in enrollment or employment, and serves as your primary point of contact for maintaining F-1 status. Every SEVP-certified school must have at least one PDSO and may have additional DSOs.",
        },
    ],
    E: [
        {
            term: "E-Verify",
            definition:
                "A web-based system operated by DHS that allows employers to confirm work authorization of new hires by comparing Form I-9 information against government databases. E-Verify enrollment is mandatory for employers who hire STEM OPT students — without an active E-Verify account, an employer cannot sign the Form I-983 training plan.",
            links: [
                { label: "I-983 Training Plan Guide", href: "/blog/i-983-training-plan-guide" },
            ],
        },
        {
            term: "EAD (Employment Authorization Document)",
            definition:
                "The physical card (also called the work permit) issued by USCIS that proves authorization to work in the United States. F-1 students on OPT receive an EAD card after their I-765 application is approved. The card contains your photo, USCIS number (A-number), validity dates, and employment category code (C03A for pre-completion OPT, C03B for post-completion OPT, C03C for STEM OPT).",
            links: [
                { label: "OPT EAD Card Guide", href: "/blog/opt-ead-card-guide" },
                { label: "OPT Processing Times", href: "/blog/opt-processing-time-2026" },
            ],
        },
    ],
    F: [
        {
            term: "F-1 Visa",
            definition:
                "The nonimmigrant visa classification for international students enrolled full-time at SEVP-certified academic institutions in the United States. F-1 status allows on-campus employment, CPT, OPT, and STEM OPT. The visa stamp in your passport allows entry to the U.S.; F-1 status is maintained through compliance with enrollment and employment regulations under 8 CFR § 214.2(f).",
            links: [
                { label: "F-1 Visa Jobs Guide", href: "/blog/f1-visa-jobs-guide" },
                { label: "Compliance Tracker", href: "/features/compliance" },
            ],
        },
        {
            term: "FICA Tax Exemption",
            definition:
                "F-1 students on OPT or CPT are generally exempt from Social Security and Medicare (FICA) taxes for a defined period — typically the first 5 calendar years of presence in the U.S. The exemption applies under IRC § 3121(b)(19) as long as the student is classified as a nonresident alien for tax purposes. After 5 years, the Substantial Presence Test may reclassify you as a resident alien subject to FICA.",
        },
        {
            term: "Filing Window",
            definition:
                "The eligible time period during which an immigration application can be submitted to USCIS. For OPT, the I-765 filing window is up to 90 days before and no later than 60 days after your program end date. For STEM OPT extension, you must file before your current OPT EAD expires. Missing the filing window forfeits eligibility.",
            links: [
                { label: "OPT Application Checklist", href: "/blog/opt-application-checklist-2026" },
            ],
        },
        {
            term: "Form I-20",
            definition:
                "The Certificate of Eligibility for Nonimmigrant Student Status issued by a SEVP-certified school. The I-20 is the foundational document for F-1 status — it shows your program details, SEVIS ID, OPT recommendation, and requires a valid travel signature for re-entry to the U.S. Your DSO issues updated I-20s for OPT authorization, STEM OPT extension, program extensions, and changes of educational level.",
        },
        {
            term: "Form I-765",
            definition:
                "The Application for Employment Authorization filed with USCIS to obtain an EAD card. F-1 students file the I-765 for initial OPT (category (c)(3)(A) or (c)(3)(B)) and STEM OPT extension (category (c)(3)(C)). The form requires supporting documents including your I-20 with OPT recommendation, passport photos, and applicable fees.",
            links: [
                { label: "OPT Application Checklist", href: "/blog/opt-application-checklist-2026" },
            ],
        },
        {
            term: "Form I-983",
            definition:
                "The Training Plan for STEM OPT Students — a required document for the 24-month STEM OPT extension. Jointly completed by the student and employer, it outlines training objectives, the employer's E-Verify enrollment, the STEM field relationship, and supervision details. Must be submitted to your DSO and updated at 12-month intervals or upon material changes.",
            links: [
                { label: "I-983 Training Plan Guide", href: "/blog/i-983-training-plan-guide" },
            ],
        },
        {
            term: "Form I-94",
            definition:
                "The Arrival/Departure Record that documents a foreign national's admission to the United States. For F-1 students, the I-94 typically shows \"D/S\" (Duration of Status), meaning you are admitted for as long as you maintain valid F-1 status. The electronic I-94 can be retrieved from the CBP website using your passport information.",
        },
        {
            term: "Form 8843",
            definition:
                "The Statement for Exempt Individuals filed with the IRS by F-1 students who are nonresident aliens and had no U.S. income. Even if you earned zero income, you must file Form 8843 annually to document your exempt status under the Substantial Presence Test. Filing deadline aligns with the regular tax deadline (typically April 15).",
        },
        {
            term: "Form 1040-NR",
            definition:
                "The U.S. Nonresident Alien Income Tax Return filed by F-1 students classified as nonresident aliens who earned U.S.-source income. This is the primary federal tax form for international students during their first 5 calendar years in the U.S. (before the Substantial Presence Test reclassifies them). Covers wages, scholarships, fellowships, and other taxable income.",
        },
    ],
    G: [
        {
            term: "Grace Period (60-Day)",
            definition:
                "A 60-day period following the expiration of OPT or completion of studies during which an F-1 student may remain in the United States to prepare for departure, transfer to another school, or change status. During the grace period, you cannot work — it is solely for winding down affairs. Exceeding the 60-day grace period results in unlawful presence. Defined under 8 CFR § 214.2(f)(5)(iv).",
            links: [
                { label: "What Happens If OPT Expires", href: "/blog/what-happens-if-opt-expires" },
            ],
        },
    ],
    H: [
        {
            term: "H-1B Visa",
            definition:
                "A nonimmigrant work visa for specialty occupations requiring at least a bachelor's degree in a specific field. H-1B is the most common visa pathway for F-1 students transitioning from OPT to long-term employment. It is employer-sponsored, has an annual cap of 85,000 (65,000 regular + 20,000 master's exemption), and is valid for up to 6 years. Governed by INA § 101(a)(15)(H)(i)(b).",
            links: [
                { label: "H-1B Approval Rates by Company", href: "/blog/h1b-approval-rates-by-company" },
                { label: "H-1B Sponsor Database", href: "/features/sponsors" },
            ],
        },
        {
            term: "H-1B Cap",
            definition:
                "The annual numerical limit on new H-1B visas issued each fiscal year. The regular cap is 65,000 visas, with an additional 20,000 reserved for beneficiaries with a U.S. master's degree or higher (the \"advanced degree exemption\"). Cap-exempt employers (universities, nonprofit research organizations, government research organizations) are not subject to these limits.",
            links: [
                { label: "H-1B Sponsor Database", href: "/features/sponsors" },
            ],
        },
        {
            term: "H-1B Lottery",
            definition:
                "The random selection process USCIS uses when the number of H-1B cap-subject registrations exceeds the annual cap. Employers submit electronic registrations during a designated period (typically March), and USCIS conducts a lottery to select which petitions may be filed. Since FY2025, USCIS uses a beneficiary-centric selection to prevent duplicate registrations.",
            links: [
                { label: "OPT to H-1B Transition", href: "/blog/opt-to-h1b-transition" },
            ],
        },
        {
            term: "H-4 EAD",
            definition:
                "Employment authorization available to certain H-4 dependent spouses of H-1B visa holders. Eligible H-4 spouses must have an approved I-140 petition or be in a period of H-1B extension beyond 6 years under AC21 § 106(a). H-4 EAD allows unrestricted employment and is filed using Form I-765 with category (c)(26).",
        },
    ],
    I: [
        {
            term: "I-140 (Immigrant Petition)",
            definition:
                "The Immigrant Petition for Alien Workers filed by an employer to sponsor a foreign worker for a green card through an employment-based category (EB-1, EB-2, EB-3). An approved I-140 is a critical milestone — it can provide H-1B extensions beyond the 6-year limit and establishes a priority date for green card processing.",
        },
        {
            term: "I-485 (Adjustment of Status)",
            definition:
                "The Application to Register Permanent Residence or Adjust Status — the final step in the green card process for applicants inside the United States. Filing I-485 allows applicants to request an EAD (I-765) and Advance Parole (I-131) while the application is pending. Processing times vary significantly by service center and preference category.",
        },
        {
            term: "ICE (Immigration and Customs Enforcement)",
            definition:
                "The DHS agency responsible for enforcing immigration laws within the United States. ICE's Homeland Security Investigations (HSI) division handles worksite enforcement and student visa fraud. ICE's Student and Exchange Visitor Program (SEVP) oversees SEVIS and the certification of schools that enroll F-1 students.",
        },
        {
            term: "ISSS/ISS (International Student Services)",
            definition:
                "The office at a U.S. college or university that supports international students with immigration advising, I-20 processing, OPT applications, and cultural adjustment. ISSS staff typically include DSOs authorized to access SEVIS on behalf of the school. Office names vary by institution — common variants include ISSS, ISS, OIS (Office of International Services), and OISS.",
        },
    ],
    L: [
        {
            term: "LCA (Labor Condition Application)",
            definition:
                "A form (ETA-9035) filed by an employer with the Department of Labor before submitting an H-1B petition. The LCA attests that the employer will pay the H-1B worker at least the prevailing wage, that hiring the foreign worker will not adversely affect working conditions of U.S. workers, and that there is no strike or lockout at the place of employment.",
        },
        {
            term: "LPR (Lawful Permanent Resident)",
            definition:
                "A foreign national who has been granted authorization to live and work permanently in the United States, commonly known as a green card holder. LPR status is obtained through family-based, employment-based, or diversity visa petitions. For F-1 students, the typical path is employer-sponsored (EB category) through PERM labor certification, I-140 petition, and I-485 adjustment.",
        },
    ],
    N: [
        {
            term: "NOID (Notice of Intent to Deny)",
            definition:
                "A written notice from USCIS informing an applicant that the agency intends to deny their petition or application and providing an opportunity to respond with additional evidence. A NOID is more serious than an RFE — it indicates USCIS has found grounds for denial. Applicants typically have 30 days to respond with a rebuttal and supporting documentation.",
        },
        {
            term: "NRA (Nonresident Alien for Tax Purposes)",
            definition:
                "A tax classification for foreign nationals who do not meet the Substantial Presence Test or green card test. F-1 students are generally classified as nonresident aliens for their first 5 calendar years in the U.S. NRAs file Form 1040-NR, may be exempt from FICA taxes, and cannot claim the standard deduction (unless from a treaty country with specific provisions).",
        },
    ],
    O: [
        {
            term: "OPT (Optional Practical Training)",
            definition:
                "Temporary employment authorization for F-1 students to work in a position directly related to their major area of study. Post-completion OPT provides up to 12 months of work authorization after program completion. Students in qualifying STEM fields may extend for an additional 24 months. OPT is authorized under 8 CFR § 214.2(f)(10) and requires filing Form I-765 with USCIS.",
            links: [
                { label: "90-Day Unemployment Rule", href: "/blog/90-day-unemployment-rule-opt" },
                { label: "Compliance Tracker", href: "/features/compliance" },
                { label: "What Happens If OPT Expires", href: "/blog/what-happens-if-opt-expires" },
            ],
        },
        {
            term: "OPT 90-Day Unemployment Rule",
            definition:
                "F-1 students on post-completion OPT are limited to a cumulative maximum of 90 days of unemployment. Days without qualifying employment count toward this limit. Exceeding 90 days is a violation of F-1 status. Qualifying employment includes W-2 employment, self-employment, contracted work, and unpaid internships (20+ hours/week) directly related to the major. STEM OPT students receive an additional 60 days (150 total).",
            links: [
                { label: "90-Day Rule Explained", href: "/blog/90-day-unemployment-rule-opt" },
                { label: "STEM OPT 150-Day Rule", href: "/blog/stem-opt-unemployment-limit" },
                { label: "Track Your Unemployment Days", href: "/features/compliance" },
            ],
        },
        {
            term: "OPT Start Date",
            definition:
                "The date on which your OPT employment authorization begins, as shown on your EAD card. For post-completion OPT, the start date must be within 60 days after your program end date. You select a requested start date on your I-765 application, but the actual date is determined by USCIS and printed on your EAD. You cannot begin working before this date, even if your EAD card arrives early.",
        },
    ],
    P: [
        {
            term: "PDSO (Principal Designated School Official)",
            definition:
                "The primary school official responsible for SEVIS compliance at a SEVP-certified institution. Every certified school must have exactly one PDSO who serves as the main liaison with SEVP and holds the highest level of SEVIS access. The PDSO can designate additional DSOs and is ultimately responsible for the school's compliance with federal regulations.",
        },
        {
            term: "PERM (Program Electronic Review Management)",
            definition:
                "The labor certification process administered by the Department of Labor, required as the first step in most employment-based green card applications (EB-2 and EB-3). The employer must demonstrate through recruitment efforts that no qualified, willing, and able U.S. worker is available for the position. PERM processing times range from 6 to 18+ months.",
        },
        {
            term: "Premium Processing",
            definition:
                "An expedited adjudication service offered by USCIS for certain petition types, guaranteeing a response (approval, denial, RFE, or NOID) within 15 business days (or 15/30 calendar days depending on the form type). Available for H-1B petitions (Form I-129) and certain I-140 petitions. Filed using Form I-907 with an additional fee. Not currently available for OPT I-765 applications.",
            links: [
                { label: "OPT Processing Times", href: "/blog/opt-processing-time-2026" },
            ],
        },
    ],
    R: [
        {
            term: "Receipt Number",
            definition:
                "A 13-character alphanumeric code (e.g., EAC-XX-XXX-XXXXX) assigned by USCIS to track an application or petition. The receipt number appears on Form I-797C (Notice of Action) and is used to check case status online at egov.uscis.gov. The three-letter prefix identifies the service center processing the case (e.g., EAC = Vermont, LIN = Nebraska, SRC = Texas, WAC = California).",
        },
        {
            term: "RFE (Request for Evidence)",
            definition:
                "A written notice from USCIS requesting additional documentation or clarification to continue processing an application. Common RFE triggers for OPT include missing signatures on the I-20, incorrect photographs, and insufficient proof of student status. Applicants are given a deadline (typically 60–87 days) to respond; failure to respond results in denial based on the existing record.",
        },
    ],
    S: [
        {
            term: "SEVIS (Student and Exchange Visitor Information System)",
            definition:
                "The web-based system managed by ICE/SEVP that tracks F-1, M-1, and J-1 students and exchange visitors throughout their stay in the United States. SEVIS maintains records of enrollment status, employment authorization, address changes, and program completion. All OPT recommendations and employer updates are recorded in SEVIS by your DSO.",
        },
        {
            term: "SEVIS ID",
            definition:
                "A unique identification number assigned to each student record in SEVIS, formatted as N followed by 10 digits (e.g., N0012345678). The SEVIS ID appears on your I-20, EAD card, and immigration documents. It remains the same across program levels at the same institution but changes if you transfer to a new school or start a new program at a different educational level.",
        },
        {
            term: "SEVP (Student and Exchange Visitor Program)",
            definition:
                "The program within ICE that manages schools and students on F-1, M-1, and J-1 visas. SEVP certifies schools to enroll international students, manages the SEVIS database, and sets policies governing student visa compliance. SEVP conducts site visits to certify and recertify schools and provides regulatory guidance to DSOs.",
        },
        {
            term: "SEVP Portal",
            definition:
                "An online platform where F-1 students on OPT or STEM OPT can directly report and update their employer information, address, and other required details to SEVP/SEVIS. STEM OPT students are required to self-report employer changes and validation within 10 days. The portal supplements — but does not replace — reporting through your DSO.",
        },
        {
            term: "SSN (Social Security Number)",
            definition:
                "A nine-digit number issued by the Social Security Administration for tax reporting and identification purposes. F-1 students are eligible for an SSN only after receiving employment authorization (CPT, OPT, or on-campus employment). Apply at your local SSA office with your I-20, passport, visa, I-94, and EAD card (for OPT). Processing typically takes 2–4 weeks.",
        },
        {
            term: "STEM OPT Extension",
            definition:
                "A 24-month extension of post-completion OPT available to F-1 students who hold a bachelor's, master's, or doctoral degree in a STEM-designated field (per the DHS STEM Designated Degree Program List). Requires an employer enrolled in E-Verify, a completed Form I-983 training plan, and filing of Form I-765 before the initial OPT EAD expires. Governed by 8 CFR § 214.2(f)(10)(ii)(C).",
            links: [
                { label: "STEM OPT Extension Guide", href: "/blog/stem-opt-extension-guide" },
                { label: "I-983 Training Plan Guide", href: "/blog/i-983-training-plan-guide" },
            ],
        },
        {
            term: "STEM OPT 150-Day Rule",
            definition:
                "Students on the STEM OPT extension receive a cumulative unemployment limit of 150 days (the initial 90 days from post-completion OPT plus 60 additional days for the STEM extension period). Days of unemployment during both OPT periods count toward this combined total. Exceeding 150 days is a violation of F-1 status.",
            links: [
                { label: "STEM OPT Unemployment Limit", href: "/blog/stem-opt-unemployment-limit" },
                { label: "Track Your Unemployment Days", href: "/features/compliance" },
            ],
        },
        {
            term: "Substantial Presence Test",
            definition:
                'An IRS test used to determine whether a foreign national is classified as a "resident alien" for U.S. tax purposes. The test counts days of physical presence over a 3-year period using a weighted formula: all days in the current year + 1/3 of days in the prior year + 1/6 of days two years prior. F-1 students are exempt from counting days for the first 5 calendar years of presence. After passing the test, you file taxes as a resident alien using Form 1040.',
        },
    ],
    T: [
        {
            term: "Travel Signature (I-20)",
            definition:
                "A DSO signature on page 2 of the Form I-20 that authorizes an F-1 student to re-enter the United States after international travel. The travel signature is valid for 12 months for students in active status and 6 months for students on OPT. You must obtain a new travel signature before it expires if you plan to travel abroad and return. Traveling without a valid travel signature may result in denial of entry at the port of entry.",
        },
    ],
    U: [
        {
            term: "USCIS (U.S. Citizenship and Immigration Services)",
            definition:
                "The federal agency within DHS responsible for processing immigration benefit applications including work permits (EAD), visa petitions, adjustment of status, and naturalization. USCIS adjudicates OPT I-765 applications, H-1B petitions, and all employment-based green card filings. Case status can be tracked online using the USCIS receipt number at egov.uscis.gov.",
        },
        {
            term: "Unlawful Presence",
            definition:
                "Time spent in the United States after the expiration of authorized stay or after a finding of status violation by USCIS or an immigration judge. For F-1 students admitted for \"Duration of Status\" (D/S), unlawful presence begins after USCIS formally determines a violation or after the student fails to depart within the 60-day grace period. Accruing 180+ days of unlawful presence triggers a 3-year bar on reentry; 365+ days triggers a 10-year bar under INA § 212(a)(9)(B).",
        },
    ],
    V: [
        {
            term: "Visa Stamp",
            definition:
                'The physical visa foil affixed to a page in your passport by a U.S. consulate or embassy abroad. The visa stamp is a travel document — it allows you to present yourself at a U.S. port of entry and request admission. The visa stamp can expire while you are in the U.S. without affecting your F-1 status; however, you will need a valid visa stamp to re-enter the U.S. after international travel. Renewing an F-1 visa stamp generally requires an in-person interview at a U.S. consulate, except under limited "dropbox" eligibility.',
        },
    ],
    W: [
        {
            term: "W-2 Form",
            definition:
                "A wage and tax statement issued annually by employers showing total compensation paid and taxes withheld during the calendar year. F-1 students on OPT receive a W-2 from each employer and use it to file their federal tax return (Form 1040-NR for nonresident aliens or Form 1040 for resident aliens). W-2s must be issued by January 31 for the preceding tax year.",
        },
    ],
};

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const activeLetters = Object.keys(glossaryData);

function getAllTermsForSchema() {
    const terms: { name: string; description: string }[] = [];
    for (const letter of Object.keys(glossaryData)) {
        for (const entry of glossaryData[letter]) {
            terms.push({ name: entry.term, description: entry.definition });
        }
    }
    return terms;
}

function buildJsonLd() {
    const allTerms = getAllTermsForSchema();
    return {
        "@context": "https://schema.org",
        "@type": "DefinedTermSet",
        name: "OPT & Immigration Glossary",
        description:
            "Comprehensive glossary of OPT, STEM OPT, F-1 visa, H-1B, and USCIS immigration terms for international students.",
        url: "https://www.trackmyopt.com/glossary",
        hasDefinedTerm: allTerms.map((t) => ({
            "@type": "DefinedTerm",
            name: t.name,
            description: t.description,
        })),
    };
}

export default function GlossaryPage() {
    const jsonLd = buildJsonLd();

    return (
        <>
            {/* Hero */}
            <section className="relative overflow-hidden pt-16 pb-12 px-4">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950" />
                <div className="relative max-w-4xl mx-auto text-center">
                    <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 mb-6">
                        50+ Terms Defined
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
                        OPT &amp; Immigration Glossary
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                        Every immigration term an F-1 student needs to know — from
                        OPT to H-1B, EAD to SEVIS — explained in plain English with
                        regulatory references.
                    </p>
                </div>
            </section>

            {/* Alphabet Quick-Jump Nav */}
            <nav
                aria-label="Alphabet navigation"
                className="sticky top-16 z-30 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-lg border-b border-gray-200 dark:border-zinc-800"
            >
                <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap justify-center gap-1 sm:gap-1.5">
                    {alphabet.map((letter) => {
                        const isActive = activeLetters.includes(letter);
                        return isActive ? (
                            <a
                                key={letter}
                                href={`#letter-${letter}`}
                                className="w-9 h-9 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                            >
                                {letter}
                            </a>
                        ) : (
                            <span
                                key={letter}
                                className="w-9 h-9 flex items-center justify-center rounded-lg text-sm font-semibold text-gray-300 dark:text-zinc-700 cursor-default"
                            >
                                {letter}
                            </span>
                        );
                    })}
                </div>
            </nav>

            {/* Glossary Terms */}
            <section className="max-w-4xl mx-auto px-4 py-12">
                {Object.entries(glossaryData).map(([letter, terms]) => (
                    <div key={letter} id={`letter-${letter}`} className="mb-12 scroll-mt-32">
                        <div className="flex items-center gap-4 mb-6">
                            <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xl font-bold shadow-lg shadow-blue-500/20">
                                {letter}
                            </span>
                            <div className="flex-1 h-px bg-gray-200 dark:bg-zinc-800" />
                        </div>

                        <div className="space-y-6">
                            {terms.map((entry) => {
                                const slug = entry.term
                                    .toLowerCase()
                                    .replace(/[^a-z0-9]+/g, "-")
                                    .replace(/(^-|-$)/g, "");
                                return (
                                    <div
                                        key={slug}
                                        id={slug}
                                        className="group rounded-2xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 p-6 hover:border-blue-300 dark:hover:border-blue-800 transition-colors scroll-mt-32"
                                    >
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                            {entry.term}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                            {entry.definition}
                                        </p>
                                        {entry.links && entry.links.length > 0 && (
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {entry.links.map((link) => (
                                                    <Link
                                                        key={link.href}
                                                        href={link.href}
                                                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors"
                                                    >
                                                        <span>→</span>
                                                        {link.label}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </section>

            {/* CTA Section */}
            <section className="py-16 px-4">
                <div className="max-w-3xl mx-auto text-center rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-10 sm:p-14 shadow-2xl shadow-blue-600/20">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                        Don&apos;t just learn the terms — track your OPT
                    </h2>
                    <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
                        TrackMyOPT helps you monitor unemployment days, filing
                        deadlines, case status, and more — so you stay in
                        compliance while you focus on your career.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/login"
                            className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-white text-blue-700 font-semibold hover:bg-blue-50 transition-colors shadow-lg"
                        >
                            Get Started — Free
                        </Link>
                        <Link
                            href="/features/compliance"
                            className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl border-2 border-white/30 text-white font-semibold hover:bg-white/10 transition-colors"
                        >
                            Explore Features
                        </Link>
                    </div>
                </div>
            </section>

            {/* JSON-LD Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: safeSerializeJsonLd(jsonLd) }}
            />
        </>
    );
}
