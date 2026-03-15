export interface AnswerSection {
    heading: string;
    paragraphs: string[];
    bulletPoints?: string[];
    importantNote?: string;
}

export interface AnswerEntry {
    slug: string;
    question: string;
    shortAnswer: string;
    lastUpdated: string;
    category: string;
    categoryLabel: string;
    keyTakeaway: string;
    sections: AnswerSection[];
    relatedLinks: { text: string; href: string }[];
    relatedQuestions: { question: string; slug: string }[];
    metadata: {
        title: string;
        description: string;
        keywords: string[];
    };
}
