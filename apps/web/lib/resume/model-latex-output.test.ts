import { describe, expect, it } from 'vitest';
import {
    countRoleMacros,
    escapeLatexForPromptInjection,
    extractEmployerNamesFromResume,
    extractLatexPreamble,
    findLeakedTemplatePlaceholders,
    stripModelLatexOutput,
    validateGeneratedResumeOutput,
    validatePreambleMatches,
} from './model-latex-output';

const TEMPLATE = String.raw`\documentclass{article}
\newcommand{\rRole}[4]{#1 at #2}
\begin{document}
\def\name{Daniel Okafor}
\rRole{Engineer}{National Retail Platform}{WA}{2021}
\end{document}`;

describe('stripModelLatexOutput', () => {
    it('removes markdown fences and extracts the document block', () => {
        const raw = 'Here is the LaTeX:\n```latex\n\\documentclass{article}\\begin{document}Hi\\end{document}\n```';
        expect(stripModelLatexOutput(raw)).toBe(
            '\\documentclass{article}\\begin{document}Hi\\end{document}',
        );
    });
});

describe('escapeLatexForPromptInjection', () => {
    it('escapes LaTeX special characters in focus keywords', () => {
        expect(escapeLatexForPromptInjection('R&D / AWS')).toBe('R\\&D / AWS');
    });
});

describe('validatePreambleMatches', () => {
    it('requires byte-identical preamble', () => {
        const output = String.raw`\documentclass{article}
\newcommand{\rRole}[4]{#1}
\begin{document}
\end{document}`;
        const template = String.raw`\documentclass{article}
\newcommand{\rRole}[4]{#2}
\begin{document}
demo
\end{document}`;

        expect(validatePreambleMatches(output, template)).toEqual({
            ok: false,
            reason: 'preamble mismatch',
        });
    });

    it('accepts matching preamble', () => {
        const preamble = String.raw`\documentclass{article}
\newcommand{\rRole}[4]{#1}`;
        const output = `${preamble}\n\\begin{document}\\end{document}`;
        const template = `${preamble}\n\\begin{document}demo\\end{document}`;
        expect(validatePreambleMatches(output, template)).toEqual({ ok: true });
        expect(extractLatexPreamble(output)).toBe(preamble);
    });
});

describe('extractEmployerNamesFromResume', () => {
    it('pulls employers from common resume lines', () => {
        const resume = [
            'Senior Engineer, Acme Corp    Jan 2021 -- Present',
            'Worked at Stripe-scale Payments Startup during 2019',
        ].join('\n');

        const employers = extractEmployerNamesFromResume(resume);
        expect(employers.some((name) => /Acme Corp/i.test(name))).toBe(true);
        expect(employers.some((name) => /Stripe-scale Payments Startup/i.test(name))).toBe(true);
    });
});

describe('validateGeneratedResumeOutput', () => {
    it('flags leaked template demo content', () => {
        const latex = TEMPLATE.replace('Daniel Okafor', 'Jane Candidate');
        const issues = validateGeneratedResumeOutput({
            latex,
            templateTex: TEMPLATE,
            resumeText: 'Jane Candidate at Example Co Jan 2020 -- Present',
        });
        expect(issues.ok).toBe(false);
        expect(issues.issues.some((issue) => issue.includes('National Retail Platform'))).toBe(true);
        expect(findLeakedTemplatePlaceholders(latex, TEMPLATE, 'Jane Candidate')).toContain(
            'National Retail Platform',
        );
    });

    it('counts role macros against source date ranges', () => {
        const resume = [
            'Engineer, Foo Inc    2021 -- Present',
            'Intern, Bar LLC    2019 -- 2020',
        ].join('\n');
        const latex = String.raw`\documentclass{article}
\newcommand{\rRole}[4]{#1}
\begin{document}
\rRole{A}{Foo Inc}{}{}
\end{document}`;

        const result = validateGeneratedResumeOutput({
            latex,
            templateTex: latex,
            resumeText: resume,
        });
        expect(countRoleMacros(latex)).toBe(1);
        expect(result.ok).toBe(false);
        expect(result.issues.some((issue) => issue.includes('\\rRole'))).toBe(true);
    });
});
