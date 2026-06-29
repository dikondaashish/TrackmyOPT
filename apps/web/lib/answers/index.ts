import { AnswerEntry } from "./types";
import { optBasicsAnswers } from "./opt-basics";
import { workEmploymentAnswers } from "./work-employment";
import { uscisImmigrationAnswers } from "./uscis-immigration";
import { taxFinanceAnswers } from "./tax-finance";
import { h1bCareerAnswers } from "./h1b-career";

const allAnswers: AnswerEntry[] = [
    ...optBasicsAnswers,
    ...workEmploymentAnswers,
    ...uscisImmigrationAnswers,
    ...taxFinanceAnswers,
    ...h1bCareerAnswers,
];

export function getAllAnswers(): AnswerEntry[] {
    return allAnswers;
}

export function getAnswerBySlug(slug: string): AnswerEntry | undefined {
    return allAnswers.find((a) => a.slug === slug);
}

export function getAnswersByCategory(category: string): AnswerEntry[] {
    return allAnswers.filter((a) => a.category === category);
}

export type { AnswerEntry, AnswerSection } from "./types";
export { ANSWER_CANONICAL_OVERRIDES } from "./canonical-overrides";
