export type TemplateColor = {
    name: string;
    /** Tailwind swatch class for the picker dot. */
    class: string;
    ring: string;
    /** Accent hex applied to the template's \definecolor{accent} rule. */
    hex: string;
};

/**
 * Every shipped template is single-column with standard section headings, real
 * selectable text, and no tables, graphics, or text boxes — the layout
 * Workday, Greenhouse, iCIMS, and Taleo read top to bottom without scrambling.
 */
export type AtsRating = "safe";

export interface Template {
    id: string;
    name: string;
    description: string;
    /** Who this template is actually for — shown on the card. */
    bestFor: string;
    latexFile: string;
    tags: string[];
    colors: TemplateColor[];
    category: string;
    isPremium: boolean;
    atsRating: AtsRating;
    /** Typeface family the compiled PDF uses. */
    typeface: string;
    /**
     * Section headings in the order the template's .tex file declares them.
     * resume-templates.test.ts fails when this drifts from the file.
     */
    sections: readonly string[];
    /** Body size + page margins, surfaced in the quick view. */
    typography: string;
}

/**
 * Experience-led order for candidates with a work history: the summary and a
 * keyword-dense skills block sit in the top third, where recruiters and
 * keyword searches land first.
 */
export const RESUME_TEMPLATE_SECTION_ORDER = [
    "Summary",
    "Skills",
    "Experience",
    "Projects",
    "Education",
    "Certifications",
] as const;

/**
 * Education-first order for students and new grads, whose degree is their
 * strongest and most recent credential.
 */
export const EDUCATION_FIRST_SECTION_ORDER = [
    "Summary",
    "Education",
    "Experience",
    "Projects",
    "Technical Skills",
    "Certifications",
] as const;

export const DEFAULT_RESUME_TEMPLATE_ID = "tech";

export const RESUME_TEMPLATES: Template[] = [
    {
        id: "classic",
        name: "Classic One-Page",
        description:
            "The plain black-and-white format engineering recruiters see most. Education first, dense spacing, nothing decorative.",
        bestFor: "Students, new grads, 0–3 years · Software & data",
        latexFile: "classic.tex",
        tags: ["ATS-Safe", "New Grad", "Most Recommended"],
        category: "New Grad",
        isPremium: false,
        atsRating: "safe",
        typeface: "Latin Modern Roman (classic serif)",
        typography: "11pt body · 0.5in margins",
        sections: EDUCATION_FIRST_SECTION_ORDER,
        colors: [
            { name: "Black", class: "bg-[#000000]", ring: "ring-[#000000]", hex: "000000" },
            { name: "Navy", class: "bg-[#1B365D]", ring: "ring-[#1B365D]", hex: "1B365D" },
        ],
    },
    {
        id: "corporate",
        name: "Corporate Navy",
        description:
            "Word-style corporate layout: navy name and headings, hairline rules, a bulleted summary, and the employer leading each role with dates at a right tab.",
        bestFor: "Finance, banking, data & AI roles · 3+ years",
        latexFile: "corporate.tex",
        tags: ["ATS-Safe", "Corporate", "Calibri-style"],
        category: "Corporate",
        isPremium: false,
        atsRating: "safe",
        typeface: "Carlito (Calibri-compatible sans)",
        typography: "10pt body · 0.5in margins",
        sections: [
            "Professional Summary",
            "Technical Skills",
            "Educational Details",
            "Professional Experience",
            "Certifications",
        ],
        colors: [
            { name: "Navy", class: "bg-[#002060]", ring: "ring-[#002060]", hex: "002060" },
            { name: "Black", class: "bg-[#000000]", ring: "ring-[#000000]", hex: "000000" },
            { name: "Burgundy", class: "bg-[#7A2E2E]", ring: "ring-[#7A2E2E]", hex: "7A2E2E" },
        ],
    },
    {
        id: "traditional",
        name: "Traditional",
        description:
            "The conservative, education-first format university career offices teach. Leads each entry with the organization and adds Leadership & Activities.",
        bestFor: "Business, finance, consulting, analyst roles",
        latexFile: "traditional.tex",
        tags: ["ATS-Safe", "Business", "Education First"],
        category: "Business",
        isPremium: false,
        atsRating: "safe",
        typeface: "Latin Modern Roman (classic serif)",
        typography: "11pt body · 0.75in margins",
        sections: [
            "Summary",
            "Education",
            "Experience",
            "Projects",
            "Leadership & Activities",
            "Skills",
            "Certifications",
        ],
        colors: [
            { name: "Black", class: "bg-[#000000]", ring: "ring-[#000000]", hex: "000000" },
            { name: "Navy", class: "bg-[#1B365D]", ring: "ring-[#1B365D]", hex: "1B365D" },
        ],
    },
    {
        id: "modern",
        name: "Modern Minimalist",
        description:
            "Clean sans-serif layout with a single accent rule. The safest default for most software roles.",
        bestFor: "0–6 years experience · Software engineering",
        latexFile: "modern.tex",
        tags: ["ATS-Safe", "Software", "Default"],
        category: "General",
        isPremium: false,
        atsRating: "safe",
        typeface: "Latin Modern Sans (clean sans-serif)",
        typography: "10pt body · 0.65in margins",
        sections: RESUME_TEMPLATE_SECTION_ORDER,
        colors: [
            { name: "Navy", class: "bg-[#1F4E79]", ring: "ring-[#1F4E79]", hex: "1F4E79" },
            { name: "Slate", class: "bg-[#334155]", ring: "ring-[#334155]", hex: "334155" },
            { name: "Teal", class: "bg-[#0F766E]", ring: "ring-[#0F766E]", hex: "0F766E" },
        ],
    },
    {
        id: "tech",
        name: "Tech Focused",
        description:
            "Slightly denser than Modern to fit a deeper skills matrix. Built for infrastructure and backend resumes.",
        bestFor: "3–8 years experience · Backend, infra, SRE",
        latexFile: "tech.tex",
        tags: ["ATS-Safe", "Backend", "Infrastructure"],
        category: "Technical",
        isPremium: true,
        atsRating: "safe",
        typeface: "Latin Modern Sans (clean sans-serif)",
        typography: "10pt body · 0.6in margins",
        sections: RESUME_TEMPLATE_SECTION_ORDER,
        colors: [
            { name: "Teal", class: "bg-[#0F766E]", ring: "ring-[#0F766E]", hex: "0F766E" },
            { name: "Indigo", class: "bg-[#3730A3]", ring: "ring-[#3730A3]", hex: "3730A3" },
            { name: "Graphite", class: "bg-[#1F2937]", ring: "ring-[#1F2937]", hex: "1F2937" },
        ],
    },
    {
        id: "professional",
        name: "Professional",
        description:
            "Classic serif with restrained charcoal rules. Reads as senior without looking dated.",
        bestFor: "5–12 years experience · Senior IC roles",
        latexFile: "professional.tex",
        tags: ["ATS-Safe", "Senior", "Serif"],
        category: "Professional",
        isPremium: true,
        atsRating: "safe",
        typeface: "Latin Modern Roman (classic serif)",
        typography: "10pt body · 0.7in margins",
        sections: RESUME_TEMPLATE_SECTION_ORDER,
        colors: [
            { name: "Charcoal", class: "bg-[#2F3E46]", ring: "ring-[#2F3E46]", hex: "2F3E46" },
            { name: "Navy", class: "bg-[#1B365D]", ring: "ring-[#1B365D]", hex: "1B365D" },
            { name: "Burgundy", class: "bg-[#7A2E2E]", ring: "ring-[#7A2E2E]", hex: "7A2E2E" },
        ],
    },
    {
        id: "executive",
        name: "Executive Brief",
        description:
            "Airier spacing at 11pt so a dense leadership record stays readable however long it runs.",
        bestFor: "Manager, Director, VP · Large role histories",
        latexFile: "executive.tex",
        tags: ["ATS-Safe", "Leadership", "Roomy"],
        category: "Executive",
        isPremium: true,
        atsRating: "safe",
        typeface: "Latin Modern Roman (classic serif)",
        typography: "11pt body · 0.75in margins",
        sections: RESUME_TEMPLATE_SECTION_ORDER,
        colors: [
            { name: "Navy", class: "bg-[#1B365D]", ring: "ring-[#1B365D]", hex: "1B365D" },
            { name: "Charcoal", class: "bg-[#2F3E46]", ring: "ring-[#2F3E46]", hex: "2F3E46" },
        ],
    },
    {
        id: "academic",
        name: "Research & Academic",
        description:
            "Adds a Publications section after Education. Sized for PhD and applied-science applicants targeting industry.",
        bestFor: "Research scientist · Applied ML · PhD candidates",
        latexFile: "academic.tex",
        tags: ["ATS-Safe", "Research", "Publications"],
        category: "Research",
        isPremium: false,
        atsRating: "safe",
        typeface: "Latin Modern Roman (classic serif)",
        typography: "10pt body · 0.65in margins",
        sections: ["Summary", "Skills", "Experience", "Projects", "Education", "Publications", "Certifications"],
        colors: [
            { name: "Black", class: "bg-[#1A1A1A]", ring: "ring-[#1A1A1A]", hex: "1A1A1A" },
            { name: "Navy", class: "bg-[#1B365D]", ring: "ring-[#1B365D]", hex: "1B365D" },
        ],
    },
    {
        id: "creative",
        name: "Creative Clean",
        description:
            "Heavier accent rules for product and design-adjacent engineers. Still strictly single-column — two-column resumes get scrambled by ATS parsers.",
        bestFor: "0–5 years experience · Frontend, product engineering",
        latexFile: "creative.tex",
        tags: ["ATS-Safe", "Frontend", "Product"],
        category: "Creative",
        isPremium: true,
        atsRating: "safe",
        typeface: "Latin Modern Sans (clean sans-serif)",
        typography: "10pt body · 0.65in margins",
        sections: RESUME_TEMPLATE_SECTION_ORDER,
        colors: [
            { name: "Violet", class: "bg-[#6D28D9]", ring: "ring-[#6D28D9]", hex: "6D28D9" },
            { name: "Magenta", class: "bg-[#A21CAF]", ring: "ring-[#A21CAF]", hex: "A21CAF" },
            { name: "Emerald", class: "bg-[#047857]", ring: "ring-[#047857]", hex: "047857" },
        ],
    },
];

export function getTemplateById(id: string | null | undefined): Template | undefined {
    if (!id) return undefined;
    return RESUME_TEMPLATES.find((t) => t.id === id);
}
