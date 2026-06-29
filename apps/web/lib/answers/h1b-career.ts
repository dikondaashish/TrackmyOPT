import { AnswerEntry } from "./types";

export const h1bCareerAnswers: AnswerEntry[] = [
    {
        slug: "what-is-cap-gap",
        question: "What Is the H-1B Cap-Gap Extension?",
        shortAnswer:
            "The H-1B cap-gap extension automatically extends an F-1 student's OPT work authorization and F-1 status from the OPT expiration date until October 1, when H-1B status begins. It applies when a timely H-1B cap-subject petition is filed on behalf of a student whose OPT would otherwise expire before October 1.",
        lastUpdated: "February 2026",
        category: "h1b-career",
        categoryLabel: "H-1B & Career",
        keyTakeaway:
            "If your employer files a timely H-1B cap petition and your OPT expires before October 1, your work authorization is automatically extended through the cap-gap provision. Keep your I-20 updated with your DSO to reflect this extension.",
        sections: [
            {
                heading: "Understanding the Cap-Gap",
                paragraphs: [
                    "The H-1B cap-gap is a regulatory provision that bridges the gap between the end of an F-1 student's OPT authorization and the start of H-1B employment on October 1. Without this provision, students whose OPT expires between April and September would face a period where they are neither authorized to work under OPT nor yet in H-1B status, creating a gap in employment authorization.",
                    "The cap-gap applies automatically when an employer files a timely H-1B cap-subject petition (including being selected in the H-1B lottery) on behalf of an F-1 student whose OPT or STEM OPT will expire before October 1. USCIS does not issue a separate approval for the cap-gap extension—it is a regulatory benefit under 8 CFR 214.2(f)(5)(vi).",
                    "Under the cap-gap, both your F-1 status and your employment authorization are extended. If the H-1B petition is approved, the extension lasts until September 30 (the day before your H-1B status begins on October 1). If the petition is denied, revoked, or withdrawn, the cap-gap extension terminates and you have the standard grace period to depart or change status.",
                ],
            },
            {
                heading: "Eligibility Requirements",
                paragraphs: [
                    "To qualify for the cap-gap extension, several conditions must be met. First, you must be in valid F-1 status at the time the H-1B petition is filed. Second, the H-1B petition must be cap-subject (not an exempt petition, such as one filed by a university or research institution). Third, the petition must be filed with a requested start date of October 1 of the upcoming fiscal year.",
                    "Your employer must have been selected in the H-1B lottery and filed the full petition (Form I-129) on your behalf. Simply registering for the lottery is not sufficient to trigger the cap-gap. The petition must be properly filed and received by USCIS during the filing window.",
                ],
                bulletPoints: [
                    "Must be in valid F-1 status when the H-1B petition is filed",
                    "H-1B petition must be cap-subject with an October 1 start date",
                    "Employer must have been selected in the H-1B lottery",
                    "Full I-129 petition must be filed (not just registration)",
                    "OPT or STEM OPT must be the basis for current work authorization",
                ],
                importantNote:
                    "The cap-gap only extends OPT-based work authorization. If your OPT has already expired and you are in a 60-day grace period, the cap-gap extends your status but not your work authorization—meaning you cannot work during the gap period.",
            },
            {
                heading: "What to Do During the Cap-Gap Period",
                paragraphs: [
                    "During the cap-gap period, continue working for your employer as usual. Your EAD card may show an expiration date that has passed, but your work authorization is extended by regulation. Your DSO should update your SEVIS record to reflect the cap-gap extension, and you should request a new I-20 showing the extended dates.",
                    "Carry documentation of the cap-gap extension at all times, including your updated I-20, a copy of the H-1B receipt notice (Form I-797C), and your expired EAD card. Some employers may request E-Verify confirmation or additional documentation for their records. USCIS has issued guidance confirming that the cap-gap serves as valid employment authorization.",
                ],
            },
            {
                heading: "Travel During the Cap-Gap",
                paragraphs: [
                    "Traveling outside the US during the cap-gap period carries significant risk and is generally not recommended. If you leave the US while your H-1B petition is pending and your OPT has expired, re-entry can be complicated. You would need a valid F-1 visa stamp, an updated I-20 with a travel signature, and the H-1B receipt notice.",
                    "If your H-1B petition is approved while you are outside the US and the consulate has not yet issued your H-1B visa stamp, you may face difficulty returning. Many immigration attorneys advise against international travel during the cap-gap period unless absolutely necessary. Consult with your DSO and an immigration attorney before making any travel plans.",
                ],
            },
        ],
        relatedLinks: [
            { text: "H-1B Cap-Gap Extension Guide", href: "/blog/h1b-cap-gap-extension" },
            { text: "OPT to H-1B Transition Guide", href: "/blog/opt-to-h1b-transition" },
            { text: "STEM OPT Extension Guide", href: "/blog/stem-opt-extension-guide" },
            { text: "Case Status Tracker", href: "/features/case-status" },
        ],
        relatedQuestions: [
            { question: "What Is the H-1B Lottery?", slug: "what-is-h1b-lottery" },
            { question: "What Is the Difference Between H-1B and OPT?", slug: "h1b-vs-opt-difference" },
            { question: "What Happens If Your H-1B Is Not Selected in the Lottery?", slug: "what-happens-if-h1b-not-selected" },
            { question: "What Is STEM OPT?", slug: "what-is-stem-opt" },
        ],
        metadata: {
            title: "What Is the H-1B Cap-Gap Extension? | TrackMyOPT",
            description:
                "The H-1B cap-gap extends OPT work authorization until October 1 when H-1B begins. Learn eligibility, documentation, and travel rules during cap-gap.",
            keywords: [
                "H-1B cap-gap",
                "cap-gap extension OPT",
                "OPT to H-1B gap",
                "F-1 to H-1B transition",
                "cap-gap work authorization",
                "H-1B October 1 start",
            ],
        },
    },
    {
        slug: "what-is-h1b-lottery",
        question: "What Is the H-1B Lottery?",
        shortAnswer:
            "The H-1B lottery is a random selection process used by USCIS when the number of H-1B cap-subject registrations exceeds the annual cap of 85,000 visas (65,000 regular + 20,000 for US master's degree holders). Employers register beneficiaries online during a designated period, and selected registrations are invited to file full petitions.",
        lastUpdated: "February 2026",
        category: "h1b-career",
        categoryLabel: "H-1B & Career",
        keyTakeaway:
            "The H-1B lottery is employer-driven—your employer must register you during the registration period (typically March) and pay the $10 registration fee. If selected, they have 90 days to file the full I-129 petition.",
        sections: [
            {
                heading: "How the H-1B Lottery Works",
                paragraphs: [
                    "The H-1B visa program allows US employers to hire foreign workers in specialty occupations that require at least a bachelor's degree or equivalent. Congress has set an annual cap of 65,000 new H-1B visas, with an additional 20,000 reserved for beneficiaries who hold a master's degree or higher from a US institution. Because demand far exceeds supply—USCIS typically receives several hundred thousand registrations—a random lottery determines which petitions can proceed.",
                    "The process begins with electronic registration during a designated period, typically in early March. Employers submit a registration for each beneficiary, including basic information such as the beneficiary's name, date of birth, passport number, and degree level. The registration fee is $10 per beneficiary. USCIS then conducts the random selection and notifies selected registrants.",
                    "For the FY2027 H-1B cap (for employment starting October 1, 2026), the registration period was held in March 2026. USCIS has implemented a beneficiary-centric selection process, meaning each unique beneficiary is entered into the lottery only once, regardless of how many employers register them. This change was designed to reduce duplicate registrations and improve the odds for legitimate applicants.",
                ],
            },
            {
                heading: "The Selection Process",
                paragraphs: [
                    "USCIS conducts the lottery in a specific order. First, all registrations are entered into the regular cap pool of 65,000. Selected registrations from this pool include both regular and advanced degree holders. Unselected registrations for beneficiaries with US master's degrees or higher are then entered into the advanced degree exemption pool of 20,000, giving them a second chance at selection.",
                    "Selection rates vary each year based on the total number of registrations. In recent years, the selection rate for the initial lottery has ranged from approximately 14% to 27%. If USCIS does not receive enough petitions from the initial selection, it may conduct additional selection rounds later in the year.",
                ],
                bulletPoints: [
                    "Round 1: All registrations entered into 65,000 regular cap pool",
                    "Round 2: Unselected US advanced degree holders entered into 20,000 pool",
                    "Selection notifications sent via USCIS online accounts",
                    "Selected employers have 90 days to file the full I-129 petition",
                    "Additional selection rounds may occur if initial selections are insufficient",
                ],
            },
            {
                heading: "What Happens After Selection",
                paragraphs: [
                    "If your registration is selected, your employer has a 90-day filing window to submit the full H-1B petition (Form I-129) with all required documentation. This includes the Labor Condition Application (LCA), your credentials evaluation, degree certificates, transcripts, and the employer's supporting letter describing the specialty occupation and your qualifications.",
                    "The petition filing fee varies but typically includes the base filing fee, the ACWIA training fee ($750 or $1,500 depending on employer size), the fraud prevention fee ($500), and potentially the asylum program fee ($600 for employers with 26+ employees). Premium processing is available for an additional $2,805, which guarantees a response within 15 business days.",
                ],
                importantNote:
                    "Being selected in the lottery does not guarantee H-1B approval. USCIS will evaluate the full petition on its merits, including whether the position qualifies as a specialty occupation and whether the beneficiary meets the educational requirements.",
            },
            {
                heading: "Tips for Maximizing Your Chances",
                paragraphs: [
                    "Since the lottery is random, there is no way to guarantee selection. However, there are strategies to improve your overall chances of obtaining H-1B status. If you hold a bachelor's degree, consider pursuing a US master's degree to qualify for the advanced degree exemption pool, which gives you two chances in the lottery. Some employers may also file for cap-exempt H-1B positions at universities or nonprofit research organizations, which are not subject to the annual cap.",
                    "Having multiple employers willing to register you no longer increases your odds under the beneficiary-centric system, since each person is counted only once. Focus instead on building a strong profile that makes employers willing to sponsor you, and ensure your employer is prepared to file quickly once selected. Explore alternative visa categories such as O-1 (extraordinary ability), L-1 (intracompany transfer), or EB-1/EB-2 (employment-based green card) as backup options.",
                ],
            },
        ],
        relatedLinks: [
            { text: "OPT to H-1B Transition Guide", href: "/blog/opt-to-h1b-transition" },
            { text: "Top H-1B Sponsor Companies 2026", href: "/blog/top-h1b-sponsor-companies-2026" },
            { text: "H-1B Cap-Gap Extension Guide", href: "/blog/h1b-cap-gap-extension" },
            { text: "TrackMyOPT Pricing", href: "/pricing" },
        ],
        relatedQuestions: [
            { question: "What Is the H-1B Cap-Gap Extension?", slug: "what-is-cap-gap" },
            { question: "What Happens If Your H-1B Is Not Selected in the Lottery?", slug: "what-happens-if-h1b-not-selected" },
            { question: "What Is the Prevailing Wage for H-1B?", slug: "what-is-prevailing-wage-h1b" },
            { question: "How Do You Find an H-1B Sponsor?", slug: "how-to-find-h1b-sponsor" },
        ],
        metadata: {
            title: "What Is the H-1B Lottery? Complete Guide | TrackMyOPT",
            description:
                "The H-1B lottery randomly selects from cap-subject registrations for 85,000 annual visas. Learn the process, selection odds, fees, and timeline.",
            keywords: [
                "H-1B lottery",
                "H-1B cap registration",
                "H-1B selection process",
                "FY2027 H-1B",
                "H-1B visa lottery odds",
                "USCIS H-1B lottery",
                "H-1B cap 85000",
            ],
        },
    },
    {
        slug: "opt-vs-cpt-difference",
        question: "What Is the Difference Between OPT and CPT?",
        shortAnswer:
            "OPT (Optional Practical Training) is post-graduation work authorization allowing F-1 students to work in their field of study for up to 12 months (plus 24 months for STEM). CPT (Curricular Practical Training) is work authorization used during enrollment when the employment is an integral part of the curriculum, such as co-ops, internships, or practicums.",
        lastUpdated: "February 2026",
        category: "h1b-career",
        categoryLabel: "H-1B & Career",
        keyTakeaway:
            "Use CPT for internships and co-ops during your studies, and save OPT for after graduation. Using 12 months or more of full-time CPT will disqualify you from post-completion OPT, so plan your work authorization strategy carefully.",
        sections: [
            {
                heading: "What Is OPT?",
                paragraphs: [
                    "Optional Practical Training (OPT) is a type of employment authorization available to F-1 students that allows them to gain practical work experience directly related to their field of study. OPT can be used before graduation (pre-completion OPT) or after graduation (post-completion OPT), though the vast majority of students use it post-completion.",
                    "Post-completion OPT provides up to 12 months of work authorization after completing your degree. Students in designated STEM fields can apply for an additional 24-month STEM OPT extension, bringing the total to 36 months. To apply for OPT, you file Form I-765 with USCIS through your DSO, and upon approval, you receive an Employment Authorization Document (EAD card).",
                    "During OPT, you can work for any employer in a position directly related to your major field of study. You are not tied to a specific employer, and you can work full-time or part-time. However, you must report employment changes to your DSO within 10 days and cannot accumulate more than 90 days of unemployment (150 days on STEM OPT).",
                ],
            },
            {
                heading: "What Is CPT?",
                paragraphs: [
                    "Curricular Practical Training (CPT) is employment authorization that allows F-1 students to work off-campus while still enrolled in school, provided the work is an integral part of their academic program. CPT must be tied to your curriculum—it is typically used for internships, cooperative education programs, practicums, or other work experiences that are required by the curriculum or for which academic credit is given.",
                    "CPT is authorized by your DSO and noted on your I-20. Unlike OPT, you do not need to file with USCIS or obtain an EAD card. Your DSO authorizes CPT directly by updating your I-20 with the employer name, dates, and whether the training is part-time (20 hours or fewer per week) or full-time (more than 20 hours per week).",
                    "To be eligible for CPT, you must have been enrolled in your academic program for at least one full academic year (two semesters or three quarters), unless your program requires immediate participation in curricular training. Graduate students whose programs require immediate practical experience may be eligible for CPT before completing one academic year.",
                ],
            },
            {
                heading: "Key Differences Between OPT and CPT",
                paragraphs: [
                    "The fundamental difference is timing and purpose. CPT is used during your studies as part of your academic curriculum, while OPT is primarily used after graduation to gain professional experience in your field. CPT requires a direct connection to your coursework—either it must be required for your degree or you must receive academic credit for it. OPT only requires that the employment be in your field of study.",
                    "Another critical difference is the application process. CPT is authorized by your DSO and does not require USCIS approval, making it faster to obtain. OPT requires filing Form I-765 with USCIS, paying a filing fee, and waiting for EAD card approval, which can take several months. Planning ahead for OPT is essential to avoid gaps in work authorization.",
                ],
                bulletPoints: [
                    "CPT: During enrollment, part of curriculum | OPT: After graduation (primarily)",
                    "CPT: Authorized by DSO on I-20 | OPT: Requires USCIS approval and EAD card",
                    "CPT: Employer-specific authorization | OPT: Can work for any employer in field",
                    "CPT: No limit on part-time use | OPT: 12 months (+ 24 months STEM extension)",
                    "CPT: No filing fee | OPT: $410 USCIS filing fee",
                    "CPT: Immediate start after DSO authorization | OPT: 3-5 month processing time",
                ],
                importantNote:
                    "If you use 12 months or more of full-time CPT, you become ineligible for post-completion OPT. Part-time CPT does not affect OPT eligibility regardless of duration.",
            },
            {
                heading: "Strategic Considerations",
                paragraphs: [
                    "Planning your use of CPT and OPT strategically can maximize your total work authorization in the US. If you need to complete an internship during school, CPT is the appropriate tool. If you plan to work after graduation, protect your OPT eligibility by limiting full-time CPT to fewer than 12 months.",
                    "Some students use pre-completion OPT for part-time work during school, but this deducts from the 12-month post-completion OPT period. For this reason, CPT is usually the better choice for during-school employment when it is available. Coordinate with your DSO early to understand your program's CPT options and plan your work authorization timeline across both CPT and OPT.",
                ],
            },
        ],
        relatedLinks: [
            { text: "OPT Application Checklist", href: "/blog/opt-application-checklist-2026" },
            { text: "Day-1 CPT vs OPT", href: "/blog/day-1-cpt-vs-opt" },
            { text: "STEM OPT Extension Guide", href: "/blog/stem-opt-extension-guide" },
            { text: "OPT Career Guide", href: "/guides/opt-career" },
        ],
        relatedQuestions: [
            { question: "What Is OPT?", slug: "what-is-opt" },
            { question: "What Is Day-1 CPT?", slug: "what-is-day-1-cpt" },
            { question: "What Is the Difference Between H-1B and OPT?", slug: "h1b-vs-opt-difference" },
            { question: "What Documents Are Needed for OPT Application?", slug: "what-documents-needed-for-opt" },
        ],
        metadata: {
            title: "OPT vs CPT: Key Differences for F-1 Students | TrackMyOPT",
            description:
                "OPT is post-graduation work authorization; CPT is during enrollment. Learn key differences in timing, eligibility, application process, and strategy.",
            keywords: [
                "OPT vs CPT",
                "OPT CPT difference",
                "Curricular Practical Training",
                "Optional Practical Training",
                "F-1 work authorization",
                "CPT internship",
                "OPT after graduation",
            ],
        },
    },
    {
        slug: "h1b-vs-opt-difference",
        question: "What Is the Difference Between H-1B and OPT?",
        shortAnswer:
            "H-1B is an employer-sponsored nonimmigrant work visa for specialty occupations, while OPT is a temporary training authorization tied to F-1 student status. H-1B allows long-term employment (up to 6 years) and is a dual-intent visa permitting green card pursuit, whereas OPT is limited to 12 months (or 36 months for STEM) and tied to your field of study.",
        lastUpdated: "February 2026",
        category: "h1b-career",
        categoryLabel: "H-1B & Career",
        keyTakeaway:
            "OPT is your bridge from student to professional, while H-1B is the long-term work visa that most F-1 students transition into. Start planning the OPT-to-H-1B transition early, ideally during your first year on OPT.",
        sections: [
            {
                heading: "Overview of H-1B and OPT",
                paragraphs: [
                    "Optional Practical Training (OPT) and the H-1B visa serve fundamentally different purposes in the US immigration system. OPT is an extension of your F-1 student status that allows you to gain practical training experience in your major field of study after graduation. It is a temporary benefit designed to complement your academic education, not a permanent work visa.",
                    "The H-1B visa, by contrast, is an employer-sponsored nonimmigrant visa for workers in specialty occupations—positions that require at least a bachelor's degree or equivalent in a specific field. H-1B is not tied to student status and provides a more stable, long-term path for working in the United States. Most F-1 students who want to remain in the US long-term will need to transition from OPT to H-1B or another work visa.",
                    "Understanding the differences between these two work authorizations is critical for planning your career in the US, as the transition from OPT to H-1B involves specific timelines, lottery processes, and employer sponsorship requirements.",
                ],
            },
            {
                heading: "Key Differences at a Glance",
                paragraphs: [
                    "The most fundamental difference is the nature of the authorization. OPT maintains your F-1 student status while adding work authorization, whereas H-1B creates an entirely new visa status. On OPT, you remain an F-1 student with all the associated regulations (SEVIS reporting, DSO oversight, field-of-study requirement). On H-1B, you are a temporary worker with different obligations and benefits.",
                    "Duration is another major difference. Standard OPT provides 12 months of work authorization, extendable to 36 months with the STEM OPT extension. H-1B is initially granted for three years and can be extended for an additional three years, for a total of six years. If an employer-sponsored green card petition is in progress, H-1B can be extended beyond six years under certain conditions.",
                ],
                bulletPoints: [
                    "OPT: F-1 status maintained | H-1B: New visa status as temporary worker",
                    "OPT: 12-36 months | H-1B: Up to 6 years (extendable with green card pending)",
                    "OPT: Any employer in field of study | H-1B: Tied to sponsoring employer",
                    "OPT: Filed by student through DSO | H-1B: Filed by employer",
                    "OPT: No prevailing wage requirement | H-1B: Must pay prevailing wage",
                    "OPT: Single-intent visa | H-1B: Dual-intent (can pursue green card)",
                    "OPT: No annual cap | H-1B: Subject to 85,000 annual cap with lottery",
                ],
            },
            {
                heading: "The OPT to H-1B Transition",
                paragraphs: [
                    "The typical path for F-1 students is to use OPT immediately after graduation while their employer prepares and files an H-1B petition for the next available fiscal year. Since H-1B employment begins on October 1 and the lottery registration typically occurs in March, timing is critical. Students who graduate in May or June should begin OPT as soon as possible and discuss H-1B sponsorship with their employer during the first few months of employment.",
                    "If you are on STEM OPT, you have up to 36 months of work authorization, giving you up to three chances to be selected in the H-1B lottery. If you are on standard 12-month OPT, you may only get one chance. The cap-gap provision extends your OPT if an H-1B petition is filed on your behalf and your OPT would otherwise expire before October 1.",
                ],
                importantNote:
                    "Begin the H-1B sponsorship conversation with your employer early. Many employers need months to prepare the Labor Condition Application, gather documentation, and coordinate with immigration attorneys.",
            },
            {
                heading: "Which Is Better for Your Career?",
                paragraphs: [
                    "OPT and H-1B are not alternatives—they are sequential steps in most F-1 students' career paths. OPT provides the initial work authorization that allows you to start working after graduation, while H-1B provides the long-term stability needed to build a career and potentially pursue permanent residency. You typically need OPT before you can transition to H-1B.",
                    "That said, H-1B offers several advantages over OPT for career stability. H-1B is dual-intent, meaning you can openly pursue a green card while on H-1B status. On OPT, pursuing immigrant intent could theoretically jeopardize your F-1 status. H-1B also does not have a field-of-study restriction, unemployment limits, or SEVIS reporting requirements, making it a less restrictive work authorization overall.",
                ],
            },
        ],
        relatedLinks: [
            { text: "OPT to H-1B Transition Guide", href: "/blog/opt-to-h1b-transition" },
            { text: "Top H-1B Sponsor Companies 2026", href: "/blog/top-h1b-sponsor-companies-2026" },
            { text: "H-1B Cap-Gap Extension Guide", href: "/blog/h1b-cap-gap-extension" },
            { text: "OPT Career Guide", href: "/guides/opt-career" },
        ],
        relatedQuestions: [
            { question: "What Is the H-1B Lottery?", slug: "what-is-h1b-lottery" },
            { question: "What Is the H-1B Cap-Gap Extension?", slug: "what-is-cap-gap" },
            { question: "What Is OPT?", slug: "what-is-opt" },
            { question: "What Is the Prevailing Wage for H-1B?", slug: "what-is-prevailing-wage-h1b" },
        ],
        metadata: {
            title: "H-1B vs OPT: Key Differences Explained | TrackMyOPT",
            description:
                "H-1B is a long-term work visa; OPT is temporary training authorization. Learn the key differences in duration, employer ties, and immigration benefits.",
            keywords: [
                "H-1B vs OPT",
                "H-1B OPT difference",
                "OPT to H-1B",
                "F-1 to H-1B transition",
                "H-1B work visa",
                "OPT work authorization",
                "specialty occupation visa",
            ],
        },
    },
    {
        slug: "what-is-i-983-training-plan",
        question: "What Is the I-983 Training Plan for STEM OPT?",
        shortAnswer:
            "The I-983 Training Plan is a required document for STEM OPT that outlines the training objectives, employer supervision, and learning goals agreed upon between the student and employer. It must be completed and signed by both parties before a DSO can recommend the STEM OPT extension in SEVIS.",
        lastUpdated: "February 2026",
        category: "h1b-career",
        categoryLabel: "H-1B & Career",
        keyTakeaway:
            "Complete the I-983 with your employer before your DSO can recommend STEM OPT. The plan must show a genuine training component—not just regular employment—and must be updated if your employer, role, or training objectives change.",
        sections: [
            {
                heading: "Purpose of the I-983 Training Plan",
                paragraphs: [
                    "The Form I-983, officially titled 'Training Plan for STEM OPT Students,' is a document that establishes the training framework for the 24-month STEM OPT extension. USCIS and SEVP require this form to ensure that the STEM OPT extension serves its intended purpose as a training program, not merely regular employment. The plan must demonstrate that the employer will provide structured training related to the student's STEM degree field.",
                    "The I-983 is a collaborative document completed by both the student and the employer. It describes the student's STEM degree, the employer's training goals, how the training relates to the student's field of study, and the methods the employer will use to supervise and measure progress. Without a completed I-983, your DSO cannot recommend the STEM OPT extension in SEVIS.",
                    "This form replaced the previous employer attestation requirement and provides more detailed oversight of STEM OPT training. SEVP uses I-983 data to monitor compliance with STEM OPT regulations and may conduct site visits to verify that the training described in the plan is actually being provided.",
                ],
            },
            {
                heading: "What the I-983 Covers",
                paragraphs: [
                    "The I-983 is divided into several sections covering student information, employer information, and the training plan details. The student section includes your name, SEVIS number, degree information, and the employer's E-Verify company number. The employer section includes the company name, address, EIN, and the supervisor's contact information.",
                    "The training plan section is the most substantive part. It requires a description of the student's role and how it relates to their STEM degree, specific training goals and objectives, the knowledge and skills to be gained, how the employer will supervise and assess progress, and the estimated hours per week. The plan must show how the training goes beyond standard employment duties to provide educational value.",
                ],
                bulletPoints: [
                    "Student's STEM degree program and field of study",
                    "Employer's E-Verify company ID number (required for STEM OPT)",
                    "Detailed description of training goals and learning objectives",
                    "How the role directly relates to the student's STEM degree",
                    "Methods for employer supervision and performance evaluation",
                    "Estimated hours per week (must be at least 20 hours)",
                ],
                importantNote:
                    "The employer must be enrolled in E-Verify to participate in STEM OPT. The E-Verify company ID number must be included on the I-983. If the employer is not E-Verified, they cannot host STEM OPT students.",
            },
            {
                heading: "When to Update the I-983",
                paragraphs: [
                    "The I-983 is not a one-time filing. You must submit a new or updated I-983 in several circumstances: if you change employers, if your training objectives change significantly, if you are promoted or change roles, or at the 12-month midpoint of your STEM OPT extension for a progress evaluation. Your DSO will require the updated form to maintain your SEVIS record.",
                    "The 12-month evaluation is a formal requirement. At the midpoint of your 24-month STEM OPT extension, both you and your employer must complete a self-evaluation section on the I-983 describing the progress made toward the training goals and any modifications needed for the remaining 12 months. Failure to submit the midpoint evaluation can result in termination of your STEM OPT.",
                ],
            },
            {
                heading: "Tips for Completing the I-983",
                paragraphs: [
                    "Work closely with your employer to craft training objectives that are specific, measurable, and clearly connected to your STEM degree field. Avoid vague language like 'general software development'—instead, describe specific technologies, methodologies, or projects you will learn. For example, 'Develop proficiency in machine learning model deployment using TensorFlow and AWS SageMaker, applying principles from the student's M.S. in Computer Science program.'",
                    "Many employers, especially smaller companies, may be unfamiliar with the I-983. Be prepared to explain the purpose of the form and provide guidance on what is expected. Your university's international student office often has sample I-983 forms, templates, and guides that can help both you and your employer complete the plan accurately and efficiently.",
                ],
            },
        ],
        relatedLinks: [
            { text: "STEM OPT Extension Guide", href: "/blog/stem-opt-extension-guide" },
            { text: "STEM OPT Employer Requirements", href: "/blog/stem-opt-employer-requirements" },
            { text: "OPT Application Checklist", href: "/blog/opt-application-checklist-2026" },
            { text: "Glossary of Immigration Terms", href: "/glossary" },
        ],
        relatedQuestions: [
            { question: "What Is STEM OPT?", slug: "what-is-stem-opt" },
            { question: "What Is the Difference Between OPT and CPT?", slug: "opt-vs-cpt-difference" },
            { question: "What Is the 90-Day Rule?", slug: "what-is-the-90-day-rule" },
            { question: "Can I Be Self-Employed on OPT?", slug: "can-i-be-self-employed-on-opt" },
        ],
        metadata: {
            title: "What Is the I-983 Training Plan for STEM OPT? | TrackMyOPT",
            description:
                "The I-983 Training Plan is required for STEM OPT. Learn what it covers, how to complete it with your employer, and when updates are required.",
            keywords: [
                "I-983 training plan",
                "STEM OPT training plan",
                "Form I-983",
                "STEM OPT requirements",
                "E-Verify STEM OPT",
                "STEM OPT employer",
                "training plan for OPT",
            ],
        },
    },
    {
        slug: "what-happens-if-h1b-not-selected",
        question: "What Happens If Your H-1B Is Not Selected in the Lottery?",
        shortAnswer:
            "If your H-1B is not selected in the lottery, you can continue working on OPT or STEM OPT if your authorization is still valid, and your employer can register you again in the next year's lottery. Alternative options include the O-1 visa for extraordinary ability, employer-sponsored green card, cap-exempt H-1B positions, or transitioning to a different visa category.",
        lastUpdated: "February 2026",
        category: "h1b-career",
        categoryLabel: "H-1B & Career",
        keyTakeaway:
            "Not being selected is not the end of the road. Use your remaining OPT time strategically, re-enter the lottery next year, and explore alternatives like O-1, EB green cards, or cap-exempt employers simultaneously.",
        sections: [
            {
                heading: "Immediate Next Steps",
                paragraphs: [
                    "If your H-1B registration is not selected in the lottery, the most immediate question is whether you still have valid work authorization to continue your employment. If you are on OPT or STEM OPT with time remaining, you can continue working as normal. Your OPT authorization is not affected by the H-1B lottery outcome, and you remain in valid F-1 status.",
                    "If your OPT is expiring soon and you are on STEM OPT with remaining time, you should continue working and plan to re-enter the H-1B lottery the following year. If you are on standard 12-month OPT that is about to expire, you have more limited options and should consult with an immigration attorney immediately to explore alternatives before your work authorization ends.",
                    "Your employer can register you again in the next year's H-1B lottery without any penalty or limitation. There is no restriction on how many years in a row you can participate in the lottery. Many students are successfully selected on their second or third attempt.",
                ],
            },
            {
                heading: "Alternative Visa Options",
                paragraphs: [
                    "The O-1 visa is available for individuals with extraordinary ability or achievement in their field. While it has a high evidentiary standard, it does not have an annual cap or lottery requirement. If you have published research, patents, awards, high salary, or other evidence of distinction in your STEM field, the O-1 may be a viable option. Many immigration attorneys have expanded their O-1 practice as H-1B selection rates have declined.",
                    "Employer-sponsored green card processing can begin while you are on OPT. If your employer is willing to sponsor your permanent residency, they can file a PERM labor certification and the I-140 immigrant petition. Having an approved I-140 can provide additional benefits, including the ability to extend H-1B status beyond six years if you are later selected in the lottery.",
                ],
                bulletPoints: [
                    "O-1 Visa: For extraordinary ability, no cap or lottery required",
                    "EB Green Card: Employer sponsors PERM + I-140 while on OPT",
                    "Cap-Exempt H-1B: Positions at universities, nonprofits, or research institutions",
                    "L-1 Visa: Transfer to a foreign office for one year, then transfer back",
                    "Day-1 CPT: Enroll in a new degree program that offers CPT from day one",
                    "Return Home: Build experience abroad and re-enter the lottery in future years",
                ],
            },
            {
                heading: "Cap-Exempt H-1B Positions",
                paragraphs: [
                    "Not all H-1B positions are subject to the annual cap. Employers that are institutions of higher education, nonprofit research organizations, or government research organizations are exempt from the H-1B cap. If you can find a position at a university, teaching hospital, or affiliated nonprofit, your employer can file an H-1B petition at any time without going through the lottery.",
                    "Additionally, employees of for-profit companies can qualify for cap exemption if they will be working at a qualifying cap-exempt institution (such as a university campus) in a way that directly supports the institution's core mission. This is a nuanced area of immigration law, and the specifics depend on the arrangement between the employer and the institution.",
                ],
            },
            {
                heading: "Planning for the Long Term",
                paragraphs: [
                    "If you are in the early stages of STEM OPT, you have up to three opportunities to be selected in the H-1B lottery. Use this time strategically by building a strong case for alternative visa categories simultaneously. Document your achievements, publications, projects, and any evidence of extraordinary ability that could support an O-1 petition as a backup.",
                    "Consider diversifying your approach. Some students pursue a new master's degree while working on CPT, giving them continued work authorization while re-entering the H-1B lottery. Others explore opportunities with multinational companies that can sponsor an L-1 transfer. The key is to have multiple strategies in progress rather than relying solely on the lottery outcome.",
                ],
                importantNote:
                    "Do not overstay your authorized period. If your OPT expires and you are not selected, you have a 60-day grace period to depart, change status, or transfer to a new school. Staying beyond this grace period will result in unlawful presence.",
            },
        ],
        relatedLinks: [
            { text: "OPT to H-1B Transition Guide", href: "/blog/opt-to-h1b-transition" },
            { text: "Top H-1B Sponsor Companies 2026", href: "/blog/top-h1b-sponsor-companies-2026" },
            { text: "Day-1 CPT vs OPT", href: "/blog/day-1-cpt-vs-opt" },
            { text: "Case Status Tracker", href: "/features/case-status" },
        ],
        relatedQuestions: [
            { question: "What Is the H-1B Lottery?", slug: "what-is-h1b-lottery" },
            { question: "What Is Day-1 CPT?", slug: "what-is-day-1-cpt" },
            { question: "How Do You Find an H-1B Sponsor?", slug: "how-to-find-h1b-sponsor" },
            { question: "What Is STEM OPT?", slug: "what-is-stem-opt" },
        ],
        metadata: {
            title: "What If H-1B Is Not Selected? Alternative Options | TrackMyOPT",
            description:
                "If your H-1B is not selected, continue on OPT, try next year, or explore O-1, EB green card, cap-exempt positions, and other alternatives.",
            keywords: [
                "H-1B not selected",
                "H-1B lottery alternatives",
                "O-1 visa",
                "cap-exempt H-1B",
                "H-1B backup plan",
                "OPT expiring no H-1B",
                "H-1B denial options",
            ],
        },
    },
    {
        slug: "what-is-prevailing-wage-h1b",
        question: "What Is the Prevailing Wage for H-1B?",
        shortAnswer:
            "The prevailing wage is the minimum salary an employer must pay an H-1B worker, as determined by the Department of Labor (DOL). It is based on the specific occupation, geographic area, and experience level, and is divided into four wage levels. Employers must attest to paying at least the prevailing wage on the Labor Condition Application (LCA).",
        lastUpdated: "February 2026",
        category: "h1b-career",
        categoryLabel: "H-1B & Career",
        keyTakeaway:
            "The prevailing wage protects both H-1B workers and US workers by ensuring fair compensation. Check the DOL's Foreign Labor Certification Data Center to look up the prevailing wage for your occupation and location before accepting an H-1B position.",
        sections: [
            {
                heading: "How the Prevailing Wage Is Determined",
                paragraphs: [
                    "The prevailing wage is the average wage paid to workers in similar occupations in the same geographic area. The Department of Labor (DOL) determines prevailing wages using data from the Occupational Employment and Wage Statistics (OEWS) survey published by the Bureau of Labor Statistics. Employers can also request a prevailing wage determination (PWD) directly from the DOL's National Prevailing Wage Center.",
                    "The wage is based on three factors: the Standard Occupational Classification (SOC) code for the position, the metropolitan statistical area (MSA) or geographic location where the work will be performed, and the wage level (I through IV) based on the experience, education, and skill requirements of the position. These three factors together determine the minimum salary the employer must offer.",
                    "Employers must pay the H-1B worker the higher of either the prevailing wage or the actual wage paid to other employees with similar experience and qualifications in the same position. This dual requirement is designed to prevent H-1B workers from being underpaid relative to their peers.",
                ],
            },
            {
                heading: "The Four Wage Levels",
                paragraphs: [
                    "The DOL defines four wage levels that correspond to increasing levels of experience, education, and supervisory responsibility. Level I represents entry-level positions requiring basic understanding of the occupation. Level II represents qualified positions requiring some experience. Level III represents experienced positions requiring specialized knowledge. Level IV represents fully competent positions requiring high levels of expertise or supervisory duties.",
                    "In practice, most H-1B petitions for new graduates are filed at Level I or Level II. The wage difference between levels can be substantial—in high-cost areas like San Francisco or New York, the gap between Level I and Level IV for a software developer can exceed $80,000 per year. USCIS has scrutinized Level I wages in certain specialty occupation adjudications, particularly for positions described as requiring significant expertise.",
                ],
                bulletPoints: [
                    "Level I (17th percentile): Entry-level, limited experience, basic duties",
                    "Level II (34th percentile): Qualified, some experience, moderate complexity",
                    "Level III (50th percentile): Experienced, specialized skills, independent judgment",
                    "Level IV (67th percentile): Expert, supervisory, highest responsibility",
                ],
            },
            {
                heading: "The Labor Condition Application (LCA)",
                paragraphs: [
                    "Before filing an H-1B petition, the employer must submit a Labor Condition Application (LCA) to the DOL, attesting that they will pay the H-1B worker at least the prevailing wage. The LCA also requires attestations about working conditions, strike/lockout status, and notification to workers or their bargaining representative.",
                    "The LCA must be certified by the DOL before the H-1B petition can be filed with USCIS. DOL processing of LCAs is typically completed within 7 business days. The employer must post the LCA at the worksite for 10 business days to provide notice to US workers. The certified LCA is then included as part of the I-129 H-1B petition.",
                ],
                importantNote:
                    "Employers who fail to pay the prevailing wage can face penalties including back pay, fines of up to $35,000 per violation, and debarment from the H-1B program. H-1B workers who are being paid below the prevailing wage should report violations to the DOL Wage and Hour Division.",
            },
            {
                heading: "Looking Up Prevailing Wages",
                paragraphs: [
                    "You can look up prevailing wages for any occupation and location using the DOL's Foreign Labor Certification Data Center (FLCDATACENTER.com). Enter the SOC code or occupation title, select the state and area, and the tool will display the four wage levels. You can also search LCA disclosure data to see what wages other employers are offering for similar positions.",
                    "H-1B salary data is publicly available through the LCA disclosure file published quarterly by the DOL. Websites like H1BGrader, MyVisaJobs, and the DOL's own disclosure data allow you to search by employer, job title, and location to see actual H-1B salaries being offered. This data is valuable for salary negotiations and understanding market rates for your position.",
                ],
            },
        ],
        relatedLinks: [
            { text: "Top H-1B Sponsor Companies 2026", href: "/blog/top-h1b-sponsor-companies-2026" },
            { text: "OPT to H-1B Transition Guide", href: "/blog/opt-to-h1b-transition" },
            { text: "ATS Resume for International Students", href: "/blog/ats-resume-international-students-2026" },
            { text: "OPT Career Guide", href: "/guides/opt-career" },
        ],
        relatedQuestions: [
            { question: "What Is the H-1B Lottery?", slug: "what-is-h1b-lottery" },
            { question: "How Do You Find an H-1B Sponsor?", slug: "how-to-find-h1b-sponsor" },
            { question: "What Is the Difference Between H-1B and OPT?", slug: "h1b-vs-opt-difference" },
            { question: "Can I Work Part-Time on OPT?", slug: "can-i-work-part-time-on-opt" },
        ],
        metadata: {
            title: "What Is the Prevailing Wage for H-1B? | TrackMyOPT",
            description:
                "The H-1B prevailing wage is the DOL-determined minimum salary based on occupation, location, and experience level. Learn the 4 wage levels and LCA process.",
            keywords: [
                "H-1B prevailing wage",
                "prevailing wage levels",
                "DOL wage determination",
                "LCA Labor Condition Application",
                "H-1B salary requirements",
                "H-1B wage levels",
            ],
        },
    },
    {
        slug: "what-is-day-1-cpt",
        question: "What Is Day-1 CPT?",
        shortAnswer:
            "Day-1 CPT refers to academic programs—typically master's degrees—that authorize Curricular Practical Training (CPT) from the first day of enrollment. These programs are structured so that practical work experience is an integral part of the curriculum, allowing students to begin working immediately upon enrollment without the standard one-academic-year waiting period.",
        lastUpdated: "February 2026",
        category: "h1b-career",
        categoryLabel: "H-1B & Career",
        keyTakeaway:
            "Day-1 CPT is a legitimate option when the program genuinely integrates practical training into its curriculum, but it carries immigration risks if USCIS views it as primarily a vehicle for work authorization rather than education. Research programs thoroughly before enrolling.",
        sections: [
            {
                heading: "How Day-1 CPT Programs Work",
                paragraphs: [
                    "Under normal CPT regulations, F-1 students must complete one full academic year (two semesters or three quarters) before becoming eligible for CPT. However, there is an exception: students whose programs require immediate participation in curricular training can begin CPT from their first day of enrollment. Day-1 CPT programs are structured to take advantage of this regulatory exception.",
                    "These programs typically require students to complete internships, practicums, or cooperative education experiences as a core component of the curriculum. Because the practical training is built into the program from the start—not offered as an optional add-on—students can begin working on CPT from day one. The most common Day-1 CPT programs are master's degrees in fields like business administration, information technology, computer science, and data science.",
                    "Day-1 CPT programs are offered by SEVP-certified schools and are legitimate educational programs accredited by recognized accrediting bodies. The key distinction is how the curriculum integrates practical training, which creates the eligibility for immediate CPT authorization.",
                ],
            },
            {
                heading: "Why Students Choose Day-1 CPT",
                paragraphs: [
                    "The primary reason students enroll in Day-1 CPT programs is to maintain work authorization when other options have expired or are unavailable. Common scenarios include students whose OPT has ended and who were not selected in the H-1B lottery, students who want to continue working while pursuing an additional degree, or students transitioning between programs who need continuous work authorization.",
                    "Day-1 CPT can also be attractive for professionals who want to advance their education while continuing to work full-time. The program structure—often with evening or weekend classes and integrated work requirements—is designed for working professionals. This combination of continued employment and academic advancement can be valuable for career development.",
                ],
                bulletPoints: [
                    "OPT expired and H-1B not selected—need continued work authorization",
                    "Gap between academic programs requiring work authorization bridge",
                    "Desire to pursue additional degree while working full-time",
                    "STEM OPT ending with no immediate visa alternative available",
                    "Need for continuous employment while exploring other visa options",
                ],
            },
            {
                heading: "Risks and Controversies",
                paragraphs: [
                    "Day-1 CPT programs are a subject of significant scrutiny by USCIS and immigration authorities. While the programs themselves are legal and offered by accredited institutions, USCIS has expressed concern that some students enroll primarily to obtain work authorization rather than to pursue genuine academic objectives. This perception can create problems in future immigration applications.",
                    "When you later file for H-1B, green card, or other immigration benefits, USCIS may question whether your Day-1 CPT program was legitimate and whether you were genuinely pursuing education. Adjudicators may request detailed evidence of your academic engagement, course completion, grades, and the relationship between your coursework and your employment. Some immigration attorneys advise clients to document their academic participation thoroughly while enrolled in Day-1 CPT programs.",
                ],
                importantNote:
                    "USCIS has increased scrutiny of Day-1 CPT programs. Some schools offering Day-1 CPT have lost their SEVP certification, leaving enrolled students in precarious immigration situations. Research the school's SEVP certification status, accreditation, and reputation before enrolling.",
            },
            {
                heading: "How to Evaluate Day-1 CPT Programs",
                paragraphs: [
                    "Before enrolling in a Day-1 CPT program, conduct thorough due diligence. Verify that the school holds valid SEVP certification by checking the Study in the States school search tool. Confirm that the school is accredited by a DOE-recognized accrediting agency. Research the school's history—has it had any compliance issues with SEVP? Are there reports of students experiencing immigration problems after attending?",
                    "Evaluate the academic quality of the program. A legitimate Day-1 CPT program should have substantive coursework, qualified faculty, genuine academic rigor, and a clear pedagogical reason for integrating practical training from day one. Be cautious of programs with unusually low tuition, minimal academic requirements, or aggressive marketing specifically targeting immigration benefits. These red flags may indicate a program that could face future SEVP scrutiny.",
                ],
            },
        ],
        relatedLinks: [
            { text: "Day-1 CPT vs OPT", href: "/blog/day-1-cpt-vs-opt" },
            { text: "OPT to H-1B Transition Guide", href: "/blog/opt-to-h1b-transition" },
            { text: "OPT Application Checklist", href: "/blog/opt-application-checklist-2026" },
            { text: "Glossary of Immigration Terms", href: "/glossary" },
        ],
        relatedQuestions: [
            { question: "What Is the Difference Between OPT and CPT?", slug: "opt-vs-cpt-difference" },
            { question: "What Happens If Your H-1B Is Not Selected in the Lottery?", slug: "what-happens-if-h1b-not-selected" },
            { question: "What Is OPT?", slug: "what-is-opt" },
            { question: "How Do You Find an H-1B Sponsor?", slug: "how-to-find-h1b-sponsor" },
        ],
        metadata: {
            title: "What Is Day-1 CPT? Risks and Benefits Explained | TrackMyOPT",
            description:
                "Day-1 CPT programs allow F-1 students to work from enrollment start. Learn how they work, common risks, USCIS scrutiny, and how to evaluate programs.",
            keywords: [
                "Day-1 CPT",
                "Day 1 CPT programs",
                "CPT from first day",
                "Day-1 CPT risks",
                "CPT work authorization",
                "F-1 CPT programs",
                "Day-1 CPT USCIS scrutiny",
            ],
        },
    },
    {
        slug: "how-to-find-h1b-sponsor",
        question: "How Do You Find an H-1B Sponsor?",
        shortAnswer:
            "Finding an H-1B sponsor requires targeting companies with a history of sponsoring H-1B visas, which you can identify through DOL LCA disclosure data, H-1B employer databases, and LinkedIn research. Focus on building in-demand skills, networking with professionals at sponsoring companies, and being upfront about your sponsorship needs during the interview process.",
        lastUpdated: "February 2026",
        category: "h1b-career",
        categoryLabel: "H-1B & Career",
        keyTakeaway:
            "Research employers that have sponsored H-1B visas in the past using public DOL data and H-1B databases. Focus your job search on these companies, build relevant skills, and address sponsorship openly but strategically during interviews.",
        sections: [
            {
                heading: "Using Public Data to Find Sponsors",
                paragraphs: [
                    "The Department of Labor publishes quarterly LCA disclosure data that lists every employer who has filed a Labor Condition Application for an H-1B worker. This public dataset includes the employer name, job title, salary, work location, and filing dates. You can search this data directly on the DOL's website or through third-party tools like MyVisaJobs, H1BGrader, or H1BData.info, which provide more user-friendly search interfaces.",
                    "These tools allow you to search by company name, job title, or location to see which employers have a track record of H-1B sponsorship. A company that has sponsored dozens of H-1B workers in your field is more likely to sponsor you than a company that has never filed an H-1B petition. You can also see the salaries offered, which helps with salary negotiations.",
                    "USCIS also publishes H-1B employer data through its H-1B Employer Data Hub, which shows the number of approvals, denials, and petitions filed by each employer. This gives you insight into not just whether a company sponsors H-1B visas, but how successful their petitions typically are.",
                ],
            },
            {
                heading: "Industries and Companies That Commonly Sponsor",
                paragraphs: [
                    "Technology companies are by far the largest sponsors of H-1B visas. Major tech companies like Google, Amazon, Microsoft, Meta, Apple, and their many subsidiaries consistently rank among the top H-1B sponsors. Consulting firms such as Deloitte, Accenture, Infosys, Tata Consultancy Services, and Cognizant are also major sponsors, particularly for IT and business consulting roles.",
                    "Beyond tech, industries that commonly sponsor H-1B visas include finance and banking (Goldman Sachs, JPMorgan, Bank of America), healthcare (hospitals and research institutions), engineering and manufacturing, pharmaceuticals, and academia. Universities and nonprofit research organizations offer cap-exempt H-1B positions, which can be particularly advantageous as they bypass the lottery entirely.",
                ],
                bulletPoints: [
                    "Technology: Google, Amazon, Microsoft, Meta, Apple, Salesforce, Oracle",
                    "Consulting: Deloitte, Accenture, PwC, EY, McKinsey, BCG",
                    "Finance: Goldman Sachs, JPMorgan, Morgan Stanley, Citadel",
                    "Healthcare: Major hospital systems, research centers, pharmaceutical companies",
                    "Academia: Universities and research institutions (cap-exempt)",
                    "Startups: Many well-funded startups sponsor, though process may be less established",
                ],
            },
            {
                heading: "Networking and Job Search Strategies",
                paragraphs: [
                    "Networking is one of the most effective ways to find an H-1B sponsor. Connect with alumni from your university who are working on H-1B visas, attend industry events and career fairs that welcome international students, and build relationships on LinkedIn with professionals at target companies. Many companies are more willing to sponsor employees who come with an internal referral.",
                    "Your university's career center and international student office can be valuable resources. They often maintain lists of employers who have recruited and sponsored their graduates. Career fairs specifically for international students are another excellent venue for connecting with sponsorship-friendly employers. Additionally, some job boards like Myvisajobs and Indeed allow you to filter for positions that offer sponsorship.",
                ],
            },
            {
                heading: "Addressing Sponsorship in Interviews",
                paragraphs: [
                    "When and how to discuss H-1B sponsorship during the interview process is a strategic decision. Many application forms ask directly whether you require sponsorship—answer honestly. If the form does not ask, it is generally best to wait until later stages of the interview process when the employer is more invested in your candidacy before raising the topic.",
                    "Frame the conversation around your value to the company rather than your need for sponsorship. Emphasize the skills and experience you bring, the timeline of your current work authorization (if on OPT), and the fact that the employer can begin benefiting from your work immediately. Be knowledgeable about the H-1B process so you can answer the employer's questions—many companies are unfamiliar with the specifics and may be more receptive once they understand the straightforward nature of the process.",
                ],
                importantNote:
                    "Never misrepresent your work authorization status. If an employer asks whether you are authorized to work in the US, answer accurately. On OPT, you are authorized to work—you can explain that you currently have work authorization and will need sponsorship for long-term employment.",
            },
        ],
        relatedLinks: [
            { text: "Top H-1B Sponsor Companies 2026", href: "/blog/top-h1b-sponsor-companies-2026" },
            { text: "ATS Resume for International Students", href: "/blog/ats-resume-international-students-2026" },
            { text: "OPT to H-1B Transition Guide", href: "/blog/opt-to-h1b-transition" },
            { text: "OPT Career Guide", href: "/guides/opt-career" },
        ],
        relatedQuestions: [
            { question: "What Is the H-1B Lottery?", slug: "what-is-h1b-lottery" },
            { question: "What Is the Prevailing Wage for H-1B?", slug: "what-is-prevailing-wage-h1b" },
            { question: "What Is the Difference Between H-1B and OPT?", slug: "h1b-vs-opt-difference" },
            { question: "What Is the H-1B Cap-Gap Extension?", slug: "what-is-cap-gap" },
        ],
        metadata: {
            title: "How to Find an H-1B Sponsor | TrackMyOPT",
            description:
                "Find H-1B sponsors using DOL data, H-1B databases, and LinkedIn. Learn which industries sponsor most and how to address sponsorship in interviews.",
            keywords: [
                "find H-1B sponsor",
                "H-1B sponsor companies",
                "H-1B job search",
                "companies that sponsor H-1B",
                "H-1B employer data",
                "international student job search",
                "H-1B sponsorship",
            ],
        },
    },
    {
        slug: "what-documents-needed-for-opt",
        question: "What Documents Are Needed for OPT Application?",
        shortAnswer:
            "The OPT application requires Form I-765, an I-20 with your DSO's OPT recommendation, copies of your passport, I-94, previous EAD cards (if any), two passport-style photos, and the USCIS filing fee. For STEM OPT, you also need a completed I-983 Training Plan and an updated I-20 with the STEM OPT recommendation.",
        lastUpdated: "February 2026",
        category: "h1b-career",
        categoryLabel: "H-1B & Career",
        keyTakeaway:
            "Prepare your OPT documents well in advance—request your OPT recommendation from your DSO at least 90 days before your program end date. Double-check every document for accuracy before submitting, as errors can cause significant processing delays.",
        sections: [
            {
                heading: "Required Documents for Initial OPT",
                paragraphs: [
                    "Applying for post-completion OPT requires submitting Form I-765 (Application for Employment Authorization) to USCIS along with several supporting documents. Your DSO must first recommend OPT in SEVIS and issue an updated I-20 with the OPT recommendation before you can file. Begin the process by meeting with your DSO early—ideally 90 days before your program end date—to discuss your OPT request and timeline.",
                    "USCIS requires that the I-765 be filed no earlier than 90 days before your program end date and no later than 60 days after. This creates a 150-day filing window. Filing outside this window will result in a denial. Most DSOs recommend filing as early as possible within the window to allow maximum processing time before your desired start date.",
                    "You can file online through your USCIS online account or by mailing a paper application. Online filing has become the preferred method as it allows for faster receipt notices, easier tracking, and the ability to upload documents digitally. If filing by mail, use a trackable delivery method and keep copies of everything you send.",
                ],
            },
            {
                heading: "Complete Document Checklist",
                paragraphs: [
                    "Gathering all required documents before you begin filling out the application will ensure a smooth submission. Missing or incorrect documents are among the most common reasons for OPT application delays and requests for evidence (RFEs). Review each document carefully and ensure names, dates, and SEVIS numbers are consistent across all forms.",
                    "Your I-20 is the most important supporting document. It must show the OPT recommendation from your DSO in the remarks section, and all your personal information must be current and accurate. If anything on your I-20 is incorrect—such as your name spelling, program dates, or degree level—ask your DSO to correct it before filing.",
                ],
                bulletPoints: [
                    "Form I-765 (completed and signed, either online or on paper)",
                    "I-20 with DSO's OPT recommendation (all pages, signed by you on page 1)",
                    "Copy of passport biographical page (valid for at least 6 months recommended)",
                    "Copy of most recent US visa stamp (if applicable)",
                    "I-94 arrival/departure record (print from i94.cbp.dhs.gov)",
                    "Two passport-style photos (2x2 inches, white background, recent)",
                    "Copy of any previously issued EAD cards",
                    "Filing fee payment ($410 as of 2026, check USCIS for current fee)",
                    "Copy of previous I-20s (recommended but not strictly required)",
                ],
                importantNote:
                    "If filing online, you will upload digital copies of all documents. If filing by mail, send copies—not originals—of your passport, visa, and I-94. Always keep your original documents in your possession.",
            },
            {
                heading: "Additional Documents for STEM OPT Extension",
                paragraphs: [
                    "The STEM OPT extension requires all the documents listed above plus additional items specific to the 24-month extension. The most critical additional document is the Form I-983 (Training Plan for STEM OPT Students), which must be completed and signed by both you and your employer before your DSO can recommend the STEM OPT extension in SEVIS.",
                    "Your DSO will issue a new I-20 with the STEM OPT recommendation, which replaces the initial OPT I-20 for this filing. The STEM OPT I-765 must be filed no later than the expiration date of your current OPT EAD card. USCIS has stated that filing up to the day of expiration is timely, but most immigration experts recommend filing at least 60 to 90 days before expiration to avoid gaps in authorization.",
                ],
                bulletPoints: [
                    "All initial OPT documents listed above",
                    "Form I-983 Training Plan (completed and signed by student and employer)",
                    "New I-20 with STEM OPT extension recommendation from DSO",
                    "Copy of your STEM degree transcript or diploma",
                    "Copy of your current EAD card (front and back)",
                    "Employer's E-Verify company ID number (required for STEM OPT)",
                ],
            },
            {
                heading: "Common Mistakes to Avoid",
                paragraphs: [
                    "The most common filing mistake is inconsistent information across documents. Ensure your name is spelled exactly the same on your I-765, I-20, passport, and I-94. Even minor discrepancies (such as middle name vs. no middle name) can trigger a request for evidence and delay your application by months.",
                    "Other frequent errors include using an outdated form version (always download the latest I-765 from uscis.gov), forgetting to sign and date the application, submitting photos that do not meet USCIS specifications, and filing outside the 90-day-before to 60-day-after window. If you file online, double-check all entries before final submission as corrections after filing require additional correspondence with USCIS.",
                ],
            },
        ],
        relatedLinks: [
            { text: "OPT Application Checklist", href: "/blog/opt-application-checklist-2026" },
            { text: "STEM OPT Extension Guide", href: "/blog/stem-opt-extension-guide" },
            { text: "Case Status Tracker", href: "/features/case-status" },
            { text: "STEM OPT Employer Requirements", href: "/blog/stem-opt-employer-requirements" },
        ],
        relatedQuestions: [
            { question: "How to Apply for OPT?", slug: "how-to-apply-for-opt" },
            { question: "What Is an EAD Card?", slug: "what-is-an-ead-card" },
            { question: "What Is the I-983 Training Plan for STEM OPT?", slug: "what-is-i-983-training-plan" },
            { question: "What Is the I-765?", slug: "what-is-i-765" },
        ],
        metadata: {
            title: "OPT Application Documents Checklist | TrackMyOPT",
            description:
                "Complete checklist of documents needed for OPT and STEM OPT applications including I-765, I-20, passport, I-94, photos, and I-983 Training Plan.",
            keywords: [
                "OPT application documents",
                "I-765 documents needed",
                "OPT checklist",
                "STEM OPT documents",
                "EAD application requirements",
                "OPT filing documents",
                "I-983 training plan",
            ],
        },
    },
];
