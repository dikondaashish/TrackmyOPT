export type TemplateColor = {
    name: string;
    class: string;
    ring: string;
};

export type AtsRating = "safe" | "design";

export interface Template {
    id: string;
    name: string;
    description: string;
    previewImage: string;
    previewGradient: string;
    latexFile: string;
    tags: string[];
    colors: TemplateColor[];
    category: string;
    isPremium: boolean;
    /** ATS-safe templates parse reliably in Workday/Greenhouse. */
    atsRating: AtsRating;
}

export const RESUME_TEMPLATES: Template[] = [
    {
        id: "tech",
        name: "Tech Focused",
        description: "Highlights technical skills and projects. Optimized for software engineering roles.",
        previewImage: "/templates/tech-preview.png",
        previewGradient: "from-indigo-500 to-violet-500",
        latexFile: "tech.tex",
        tags: ["Engineering", "Developer", "Startups"],
        category: "Technical",
        isPremium: true,
        atsRating: "safe",
        colors: [
            { name: "Dark", class: "bg-neutral-900", ring: "ring-neutral-900" },
            { name: "Cyan", class: "bg-cyan-600", ring: "ring-cyan-600" }
        ]
    },
    {
        id: "professional",
        name: "Professional Executive",
        description: "Traditional layout with a touch of modern typography. Ideal for senior roles.",
        previewImage: "/templates/professional-preview.png",
        previewGradient: "from-gray-600 to-gray-800",
        latexFile: "professional.tex",
        tags: ["Executive", "Finance", "Standard"],
        category: "Professional",
        isPremium: true,
        atsRating: "safe",
        colors: [
            { name: "Navy", class: "bg-indigo-900", ring: "ring-indigo-900" },
            { name: "Charcoal", class: "bg-gray-800", ring: "ring-gray-800" },
            { name: "Burgundy", class: "bg-red-900", ring: "ring-red-900" },
        ]
    },
    {
        id: "modern",
        name: "Modern Minimalist",
        description: "Clean, ATS-friendly design focusing on readability. Perfect for tech and corporate roles.",
        previewImage: "/templates/modern-preview.png",
        previewGradient: "from-blue-500 to-cyan-500",
        latexFile: "modern.tex",
        tags: ["ATS-Friendly", "Tech", "Corporate"],
        category: "General",
        isPremium: false,
        atsRating: "design",
        colors: [
            { name: "Slate", class: "bg-slate-900", ring: "ring-slate-900" },
            { name: "Blue", class: "bg-blue-600", ring: "ring-blue-600" },
            { name: "Emerald", class: "bg-emerald-600", ring: "ring-emerald-600" },
        ]
    },
    {
        id: "academic",
        name: "Academic CV",
        description: "Dense, detailed layout optimized for publications and research experience.",
        previewImage: "/templates/academic-preview.png",
        previewGradient: "from-emerald-500 to-teal-500",
        latexFile: "academic.tex",
        tags: ["Academic", "Research", "Education"],
        category: "Academic",
        isPremium: false,
        atsRating: "design",
        colors: [
            { name: "Default", class: "bg-gray-900", ring: "ring-gray-900" }
        ]
    },
    {
        id: "executive",
        name: "Executive Brief",
        description: "Concise and impactful. Designed for leadership positions requiring quick scanning.",
        previewImage: "/templates/executive-preview.png",
        previewGradient: "from-amber-500 to-orange-500",
        latexFile: "executive.tex",
        tags: ["Management", "Leadership", "Brief"],
        category: "Executive",
        isPremium: true,
        atsRating: "safe",
        colors: [
            { name: "Royal", class: "bg-blue-800", ring: "ring-blue-800" },
            { name: "Gold", class: "bg-yellow-600", ring: "ring-yellow-600" }
        ]
    },
    {
        id: "creative",
        name: "Creative Portfolio",
        description: "Two-column layout designed to showcase skills and experience with flair.",
        previewImage: "/templates/creative-preview.png",
        previewGradient: "from-purple-500 to-pink-500",
        latexFile: "creative.tex",
        tags: ["Creative", "Design", "Marketing"],
        category: "Creative",
        isPremium: true,
        atsRating: "design",
        colors: [
            { name: "Black", class: "bg-black", ring: "ring-black" },
            { name: "Purple", class: "bg-purple-600", ring: "ring-purple-600" },
            { name: "Teal", class: "bg-teal-600", ring: "ring-teal-600" },
        ]
    }
];
