// Comprehensive SEO Structured Data for TrackMyOPT
// This file contains all JSON-LD schemas for AI models, search engines, and crawlers

export const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://trackmyopt.com/#organization",
    name: "TrackMyOPT",
    url: "https://trackmyopt.com",
    logo: {
        "@type": "ImageObject",
        url: "https://trackmyopt.com/logo.png",
        width: 512,
        height: 512,
    },
    description:
        "TrackMyOPT is the #1 comprehensive platform for F-1 international students on OPT and STEM OPT in the United States. We help students track immigration deadlines, manage unemployment days, monitor USCIS case status, and find H-1B sponsors.",
    foundingDate: "2024",
    sameAs: [
        "https://twitter.com/trackmyopt",
        "https://linkedin.com/company/trackmyopt",
    ],
    contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "support@trackmyopt.com",
    },
};

export const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://trackmyopt.com/#website",
    name: "TrackMyOPT",
    url: "https://trackmyopt.com",
    description:
        "Track your OPT timeline, unemployment days, USCIS case status, and find H-1B sponsors. The complete toolkit for international students in the United States.",
    publisher: {
        "@id": "https://trackmyopt.com/#organization",
    },
    potentialAction: {
        "@type": "SearchAction",
        target: {
            "@type": "EntryPoint",
            urlTemplate: "https://trackmyopt.com/search?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
    },
};

export const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": "https://trackmyopt.com/#application",
    name: "TrackMyOPT",
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Immigration Management Software",
    operatingSystem: "Web Browser",
    offers: [
        {
            "@type": "Offer",
            name: "Free Plan",
            price: "0",
            priceCurrency: "USD",
            description:
                "Basic OPT timeline tracking, unemployment clock, 1 USCIS case tracker",
        },
        {
            "@type": "Offer",
            name: "Premium Plan",
            price: "19.99",
            priceCurrency: "USD",
            description:
                "Unlimited case tracking, Document Vault, expiry reminders, priority support",
        },
    ],
    aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        bestRating: "5",
        worstRating: "1",
        ratingCount: "1500",
        reviewCount: "1200",
    },
    description:
        "TrackMyOPT helps F-1 international students track their OPT timeline, monitor the 90-day unemployment limit, check USCIS case status, store immigration documents securely, and find H-1B sponsor companies. Trusted by 15,000+ students from 100+ countries.",
    featureList: [
        "OPT Timeline Dashboard with real-time countdown",
        "Unemployment Clock (90-day OPT / 150-day STEM OPT)",
        "USCIS Case Status Tracker with email notifications",
        "Secure Document Vault with AES-256 encryption",
        "H-1B Sponsor Database with 25,000+ companies",
        "Job Application Tracker with Kanban board",
        "Resume Manager with AI parsing",
        "Tax Filing Guide for international students",
        "Health Insurance Finder by state",
        "OPT and STEM Extension Application Guides",
        "Email alerts before deadlines",
        "Dark mode support",
    ],
    screenshot: "https://trackmyopt.com/dashboard-screenshot.png",
    softwareVersion: "2.0",
    author: {
        "@id": "https://trackmyopt.com/#organization",
    },
};

// FAQ Schema for Featured Snippets
export const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": "https://trackmyopt.com/#faq",
    mainEntity: [
        {
            "@type": "Question",
            name: "What is OPT (Optional Practical Training)?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "OPT (Optional Practical Training) is a temporary employment authorization that allows F-1 students to work in the United States for up to 12 months after completing their academic program. The work must be directly related to the student's major field of study. STEM degree holders may apply for a 24-month extension, allowing up to 36 months of total OPT work authorization.",
            },
        },
        {
            "@type": "Question",
            name: "How many days of unemployment are allowed on OPT?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "For initial Post-Completion OPT, you are allowed a maximum of 90 days of unemployment. For STEM OPT extension, the aggregate limit is 150 days total (including any days used during initial OPT). Exceeding these limits can result in falling out of F-1 status. TrackMyOPT helps you track these days automatically.",
            },
        },
        {
            "@type": "Question",
            name: "How can I track my USCIS case status?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "You can track your USCIS case status by entering your 13-character receipt number (e.g., IOE1234567890) into TrackMyOPT's Case Status Tracker. The tool checks USCIS directly, shows your current status with plain-English explanations, and sends you email notifications when your status changes.",
            },
        },
        {
            "@type": "Question",
            name: "What is the 90-day rule for OPT?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "The 90-day rule states that F-1 students on Post-Completion OPT cannot accumulate more than 90 days of unemployment during their OPT period. Days start counting from your EAD start date or program end date (whichever is later). Working part-time (20+ hours) or as a volunteer stops the clock. Exceeding 90 days violates your F-1 status.",
            },
        },
        {
            "@type": "Question",
            name: "Which companies sponsor H-1B visas?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "TrackMyOPT provides a searchable database of 25,000+ companies that sponsor H-1B visas. Top sponsors include technology companies (Google, Microsoft, Amazon, Meta), consulting firms (Deloitte, Accenture, Cognizant), and financial institutions. You can filter by industry, location, approval rate, and number of petitions filed. The database is updated regularly with LCA data.",
            },
        },
        {
            "@type": "Question",
            name: "Is TrackMyOPT free?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Yes! TrackMyOPT offers a free plan that includes OPT timeline tracking, unemployment clock, 1 USCIS case tracker, and basic email alerts - all free forever. The Premium plan ($19.99 lifetime, not subscription) adds unlimited case tracking, secure Document Vault with AI extraction, expiry reminders, and priority support.",
            },
        },
        {
            "@type": "Question",
            name: "What documents do I need for OPT application?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "For OPT application (Form I-765) you need: passport-style photos, copy of Form I-94, copies of all previously issued I-20s, copy of passport ID page, copy of current visa stamp, copy of any previous EADs (if applicable), and the $410 filing fee. Your DSO must recommend OPT in SEVIS before you apply.",
            },
        },
        {
            "@type": "Question",
            name: "How do I apply for STEM OPT extension?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "To apply for STEM OPT extension: 1) Verify your degree qualifies as STEM (CIP code list), 2) Ensure your employer is enrolled in E-Verify, 3) Complete Form I-983 Training Plan with your employer, 4) Get new I-20 from your DSO recommending STEM extension, 5) File Form I-765 with USCIS before your current OPT expires. You can apply up to 90 days before and must apply before your current EAD expires.",
            },
        },
        {
            "@type": "Question",
            name: "Do F-1 students need to file taxes?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Yes, F-1 students must file taxes even with no income. If you have no income, you must file Form 8843 (Statement for Exempt Individuals). If you have income, most F-1 students file as non-resident aliens using Form 1040-NR. The Substantial Presence Test determines if you're a resident for tax purposes. TrackMyOPT's Tax Guide helps determine your filing requirements.",
            },
        },
        {
            "@type": "Question",
            name: "What is cap-gap extension?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Cap-gap extension automatically extends your OPT work authorization if you have a pending or approved H-1B petition subject to the annual cap. It bridges the gap between your OPT expiration and October 1 (when H-1B status can begin). Your employer must file the H-1B petition, and you must have valid F-1 status when it's filed.",
            },
        },
    ],
};

// HowTo Schema for Step-by-Step Guides
export const howToSchemas = [
    {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: "How to Track Your OPT Timeline",
        description:
            "Step-by-step guide to setting up OPT timeline tracking with TrackMyOPT",
        totalTime: "PT5M",
        step: [
            {
                "@type": "HowToStep",
                name: "Create Your Account",
                text: "Sign up for TrackMyOPT using Google or email. No credit card required.",
                position: 1,
            },
            {
                "@type": "HowToStep",
                name: "Enter Your Key Dates",
                text: "Enter your program end date, OPT start date, and EAD expiration date. The system calculates all other deadlines automatically.",
                position: 2,
            },
            {
                "@type": "HowToStep",
                name: "Enable Notifications",
                text: "Turn on email alerts to receive reminders 30, 14, and 7 days before critical deadlines.",
                position: 3,
            },
        ],
    },
    {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: "How to Apply for OPT (Optional Practical Training)",
        description:
            "Complete guide to applying for Post-Completion OPT as an F-1 student",
        totalTime: "PT2H",
        step: [
            {
                "@type": "HowToStep",
                name: "Request OPT Recommendation from DSO",
                text: "Contact your Designated School Official (DSO) to request an OPT recommendation in SEVIS. They will issue a new I-20.",
                position: 1,
            },
            {
                "@type": "HowToStep",
                name: "Complete Form I-765",
                text: "Fill out USCIS Form I-765 (Application for Employment Authorization). Select category (c)(3)(B) for Post-Completion OPT.",
                position: 2,
            },
            {
                "@type": "HowToStep",
                name: "Gather Supporting Documents",
                text: "Collect passport photos, I-94, all I-20s, passport copy, visa stamp copy, and any previous EADs.",
                position: 3,
            },
            {
                "@type": "HowToStep",
                name: "Pay Filing Fee",
                text: "Pay the $410 filing fee (check current fee on USCIS website).",
                position: 4,
            },
            {
                "@type": "HowToStep",
                name: "Submit Application",
                text: "File online at USCIS or mail to the designated lockbox. Keep copies of everything.",
                position: 5,
            },
            {
                "@type": "HowToStep",
                name: "Track Your Case",
                text: "Use your receipt number to track case status on TrackMyOPT or USCIS website.",
                position: 6,
            },
        ],
    },
];

// Breadcrumb Schema
export const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
        {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://trackmyopt.com",
        },
        {
            "@type": "ListItem",
            position: 2,
            name: "Features",
            item: "https://trackmyopt.com/#features",
        },
        {
            "@type": "ListItem",
            position: 3,
            name: "Pricing",
            item: "https://trackmyopt.com/#pricing",
        },
    ],
};

// Service Schema for each major feature
export const serviceSchemas = [
    {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "OPT Timeline Tracker",
        description:
            "Real-time countdown to OPT deadlines including EAD expiration, filing windows, and STEM extension dates",
        provider: { "@id": "https://trackmyopt.com/#organization" },
        serviceType: "Immigration Timeline Management",
    },
    {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Unemployment Days Calculator",
        description:
            "Track 90-day OPT and 150-day STEM OPT unemployment limits with visual progress and email alerts",
        provider: { "@id": "https://trackmyopt.com/#organization" },
        serviceType: "Employment Compliance Tracking",
    },
    {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "USCIS Case Status Tracker",
        description:
            "Real-time USCIS case status monitoring with email notifications for I-765, I-140, and other immigration forms",
        provider: { "@id": "https://trackmyopt.com/#organization" },
        serviceType: "Immigration Case Tracking",
    },
    {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "H-1B Sponsor Database",
        description:
            "Searchable database of 80,000+ companies that sponsor H-1B visas with approval rates and petition counts",
        provider: { "@id": "https://trackmyopt.com/#organization" },
        serviceType: "Employment Sponsorship Research",
    },
];

// ============================================
// AEO (Answer Engine Optimization) Schemas
// Optimized for AI models: ChatGPT, Claude, Perplexity, Google AI
// ============================================

// Speakable Schema - For voice search and AI assistants
export const speakableSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://trackmyopt.com/#webpage",
    name: "TrackMyOPT - OPT Timeline Tracker for F-1 Students",
    speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: [
            "h1",
            "h2",
            "[data-speakable]",
            ".direct-answer",
            ".key-fact",
        ],
    },
    mainEntity: {
        "@id": "https://trackmyopt.com/#application",
    },
};

// DefinedTermSet - Glossary/Knowledge Base for AI Models
export const definedTermSetSchema = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    "@id": "https://trackmyopt.com/#glossary",
    name: "OPT and F-1 Visa Terminology",
    description: "Comprehensive glossary of immigration terms for F-1 students",
    hasDefinedTerm: [
        {
            "@type": "DefinedTerm",
            name: "OPT",
            description: "Optional Practical Training - 12 months of work authorization for F-1 students after completing their academic program in the United States. Work must be directly related to major field of study.",
            termCode: "OPT",
        },
        {
            "@type": "DefinedTerm",
            name: "STEM OPT",
            description: "24-month extension of OPT for students with STEM degrees. Requires E-Verify enrolled employer and Form I-983 training plan. Total authorization: 36 months.",
            termCode: "STEM-OPT",
        },
        {
            "@type": "DefinedTerm",
            name: "F-1 Visa",
            description: "Non-immigrant student visa for academic studies in the United States. Allows full-time enrollment and limited on-campus employment.",
            termCode: "F1",
        },
        {
            "@type": "DefinedTerm",
            name: "EAD",
            description: "Employment Authorization Document - work permit card issued by USCIS that proves authorization to work in the United States.",
            termCode: "EAD",
        },
        {
            "@type": "DefinedTerm",
            name: "I-20",
            description: "Certificate of Eligibility for Nonimmigrant Student Status issued by SEVP-certified schools. Required for F-1 visa application and maintaining status.",
            termCode: "I20",
        },
        {
            "@type": "DefinedTerm",
            name: "I-765",
            description: "Application for Employment Authorization - USCIS form used to apply for OPT and STEM OPT work permits.",
            termCode: "I765",
        },
        {
            "@type": "DefinedTerm",
            name: "I-983",
            description: "Training Plan for STEM OPT Students - form completed by employer and student outlining the training program for STEM OPT extension.",
            termCode: "I983",
        },
        {
            "@type": "DefinedTerm",
            name: "DSO",
            description: "Designated School Official - school administrator authorized to issue I-20s and manage student records in SEVIS.",
            termCode: "DSO",
        },
        {
            "@type": "DefinedTerm",
            name: "SEVIS",
            description: "Student and Exchange Visitor Information System - DHS database tracking international students and exchange visitors in the US.",
            termCode: "SEVIS",
        },
        {
            "@type": "DefinedTerm",
            name: "E-Verify",
            description: "Web-based system that allows employers to verify employment eligibility. Required for STEM OPT employers.",
            termCode: "EVERIFY",
        },
        {
            "@type": "DefinedTerm",
            name: "90-Day Rule",
            description: "OPT unemployment limit - F-1 students cannot accumulate more than 90 days of unemployment during initial OPT period, or status is violated.",
            termCode: "90DAY",
        },
        {
            "@type": "DefinedTerm",
            name: "150-Day Rule",
            description: "STEM OPT aggregate unemployment limit - total unemployment from initial OPT plus STEM extension cannot exceed 150 days.",
            termCode: "150DAY",
        },
        {
            "@type": "DefinedTerm",
            name: "Cap-Gap",
            description: "Automatic extension of F-1 status and OPT work authorization for students with pending or approved H-1B petitions until October 1.",
            termCode: "CAPGAP",
        },
        {
            "@type": "DefinedTerm",
            name: "H-1B",
            description: "Specialty occupation work visa for foreign workers with bachelor's degree or higher. Subject to annual cap of 85,000 visas.",
            termCode: "H1B",
        },
        {
            "@type": "DefinedTerm",
            name: "LCA",
            description: "Labor Condition Application - DOL certification required before employer can file H-1B petition. Contains wage and working condition attestations.",
            termCode: "LCA",
        },
    ],
};

// Article Schema with Direct Answers - For AI model training/citation
export const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": "https://trackmyopt.com/#article",
    headline: "Complete Guide to OPT for F-1 International Students",
    description: "Everything you need to know about Optional Practical Training (OPT), STEM OPT extension, unemployment rules, USCIS case tracking, and H-1B sponsorship.",
    author: {
        "@id": "https://trackmyopt.com/#organization",
    },
    publisher: {
        "@id": "https://trackmyopt.com/#organization",
    },
    datePublished: "2024-01-01",
    dateModified: "2026-01-26",
    mainEntityOfPage: {
        "@id": "https://trackmyopt.com/#webpage",
    },
    about: [
        { "@type": "Thing", name: "Optional Practical Training" },
        { "@type": "Thing", name: "F-1 Student Visa" },
        { "@type": "Thing", name: "STEM OPT Extension" },
        { "@type": "Thing", name: "H-1B Visa Sponsorship" },
        { "@type": "Thing", name: "International Student Employment" },
    ],
    keywords: "OPT, STEM OPT, F-1 visa, international students, USCIS, EAD, H-1B sponsor, 90-day rule, unemployment tracker",
    articleSection: [
        "OPT Basics",
        "STEM OPT Extension",
        "USCIS Case Tracking",
        "H-1B Sponsorship",
        "Taxes and Requirements",
    ],
    speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: [".direct-answer", "h2", "h3"],
    },
};

// Knowledge Graph Entity - For AI entity recognition
export const knowledgeGraphSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": "https://trackmyopt.com/#knowledge-base",
    name: "OPT Knowledge Base",
    description: "Direct answers to common questions about OPT, STEM OPT, and F-1 visa regulations",
    numberOfItems: 10,
    itemListElement: [
        {
            "@type": "ListItem",
            position: 1,
            item: {
                "@type": "Answer",
                text: "OPT (Optional Practical Training) is 12 months of work authorization for F-1 international students after completing their academic program.",
                url: "https://trackmyopt.com/#what-is-opt",
            },
        },
        {
            "@type": "ListItem",
            position: 2,
            item: {
                "@type": "Answer",
                text: "F-1 students on OPT are allowed a maximum of 90 days of unemployment. STEM OPT has a 150-day aggregate limit.",
                url: "https://trackmyopt.com/#unemployment-limit",
            },
        },
        {
            "@type": "ListItem",
            position: 3,
            item: {
                "@type": "Answer",
                text: "STEM OPT is a 24-month extension for students with STEM degrees, requiring an E-Verify enrolled employer and Form I-983.",
                url: "https://trackmyopt.com/#stem-opt",
            },
        },
        {
            "@type": "ListItem",
            position: 4,
            item: {
                "@type": "Answer",
                text: "To apply for OPT: get I-20 from DSO, complete Form I-765, gather documents (photos, I-94, passport), pay $410 fee, submit to USCIS.",
                url: "https://trackmyopt.com/#how-to-apply-opt",
            },
        },
        {
            "@type": "ListItem",
            position: 5,
            item: {
                "@type": "Answer",
                text: "Over 25,000 US companies sponsor H-1B visas including Google, Microsoft, Amazon, Deloitte, Cognizant, and JPMorgan.",
                url: "https://trackmyopt.com/#h1b-sponsors",
            },
        },
    ],
};

// Combine all schemas including AEO schemas
export function getAllSchemas() {
    return [
        organizationSchema,
        websiteSchema,
        softwareApplicationSchema,
        faqSchema,
        ...howToSchemas,
        breadcrumbSchema,
        ...serviceSchemas,
        // AEO Schemas
        speakableSchema,
        definedTermSetSchema,
        articleSchema,
        knowledgeGraphSchema,
    ];
}

// Get schemas as script tags
export function getSchemaScripts() {
    return getAllSchemas().map((schema, index) => ({
        key: `schema-${index}`,
        type: "application/ld+json",
        content: JSON.stringify(schema),
    }));
}

