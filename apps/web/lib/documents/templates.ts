export type TemplateColor = {
    name: string;
    /** Tailwind swatch class for the picker dot. */
    class: string;
    ring: string;
    /** Accent hex applied to the template's \definecolor{accent} rule. */
    hex: string;
};

/**
 * Every shipped template is single-column with no tables, graphics, or text
 * boxes, so all of them parse cleanly in Workday/Greenhouse/Taleo.
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
    /** Body size + page margins, surfaced in the quick view. */
    typography: string;
}

/**
 * Section order is identical across every template and matches what US tech
 * recruiters scan for:
 *   Contact -> Summary -> Skills -> Experience -> Projects -> Education
 *   -> Certifications
 * (Research & Academic additionally declares Publications after Education.)
 */
export const RESUME_TEMPLATE_SECTION_ORDER = [
    "Summary",
    "Skills",
    "Experience",
    "Projects",
    "Education",
    "Certifications",
] as const;

export const RESUME_TEMPLATES: Template[] = [
    {
        id: "modern",
        name: "Modern Minimalist",
        description:
            "Clean Helvetica layout with a single accent rule. The safest default for most software roles.",
        bestFor: "0–6 years experience · Software engineering",
        latexFile: "modern.tex",
        tags: ["ATS-Safe", "Software", "Default"],
        category: "General",
        isPremium: false,
        atsRating: "safe",
        typeface: "Helvetica",
        typography: "10pt body · 0.65in margins",
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
        typeface: "Helvetica",
        typography: "10pt body · 0.6in margins",
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
            "Charter serif with restrained charcoal rules. Reads as senior without looking dated.",
        bestFor: "5–12 years experience · Senior IC roles",
        latexFile: "professional.tex",
        tags: ["ATS-Safe", "Senior", "Serif"],
        category: "Professional",
        isPremium: true,
        atsRating: "safe",
        typeface: "Charter (Georgia-class serif)",
        typography: "10pt body · 0.7in margins",
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
        typeface: "Charter (Georgia-class serif)",
        typography: "11pt body · 0.75in margins",
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
        typeface: "Charter (Georgia-class serif)",
        typography: "10pt body · 0.65in margins",
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
        typeface: "Helvetica",
        typography: "10pt body · 0.65in margins",
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
