import { describe, expect, it } from 'vitest';
import {
    countRoleMacros,
    escapeLatexForPromptInjection,
    extractEmployerNamesFromResume,
    extractLatexPreamble,
    extractResumeStructuralAnchors,
    findLeakedTemplatePlaceholders,
    mergeModelLatexWithTemplate,
    sanitizeTemplateForPrompt,
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

describe('mergeModelLatexWithTemplate', () => {
    it('replaces the model preamble with the shipped template preamble', () => {
        const template = String.raw`% TrackMyOPT template header
\documentclass{article}
\newcommand{\rRole}[4]{#1}
\begin{document}
demo
\end{document}`;
        const model = String.raw`\documentclass{report}
\begin{document}
\rRole{Engineer}{Acme}{}{}
\end{document}`;

        const merged = mergeModelLatexWithTemplate(template, model);
        expect(merged).toContain(String.raw`\newcommand{\rRole}[4]{#1}`);
        expect(merged).toContain(String.raw`\rRole{Engineer}{Acme}{}{}`);
        expect(merged).not.toContain(String.raw`\documentclass{report}`);
    });

    it('does not re-inject template demo contact macros', () => {
        const template = String.raw`% header
\documentclass{article}
\newcommand{\rRole}[4]{#1}
\def\name{Marcus Feld}
\def\email{marcus.feld@example.com}
\begin{document}
demo
\end{document}`;
        const model = String.raw`\documentclass{article}
\def\name{Ashish Dikonda}
\def\email{dikondaashish7@gmail.com}
\begin{document}
\rRole{Analyst}{Zyene, Inc.}{}{}
\end{document}`;

        const merged = mergeModelLatexWithTemplate(template, model);
        expect(merged).toContain(String.raw`\def\name{Ashish Dikonda}`);
        expect(merged).not.toContain('Marcus Feld');
        expect(merged).not.toContain('marcus.feld@example.com');
    });
});

describe('sanitizeTemplateForPrompt', () => {
    it('removes demo employers and contact values from the prompt template', () => {
        const template = String.raw`\documentclass{article}
\def\name{Marcus Feld}
\begin{document}
\rRole{Engineer}{Developer Tools Company}{}{}
\end{document}`;

        const sanitized = sanitizeTemplateForPrompt(template);
        expect(sanitized).not.toContain('Marcus Feld');
        expect(sanitized).not.toContain('Developer Tools Company');
        expect(sanitized).toContain('CANDIDATE NAME');
    });
});

describe('extractResumeStructuralAnchors', () => {
    it('extracts the candidate name and employers from a plain-text resume', () => {
        const resume = [
            'Ashish Dikonda',
            'Zyene, Inc.\t\tDec 2025 – Current',
            'Bank of America\t\tSep 2025 – May 2026',
            'OptumRx (UnitedHealth Group)\t\tMay 2024 – Aug 2025',
        ].join('\n');

        const anchors = extractResumeStructuralAnchors(resume);
        expect(anchors.candidateName).toBe('Ashish Dikonda');
        expect(anchors.employers.some((name) => /Zyene/i.test(name))).toBe(true);
        expect(anchors.employers.some((name) => /Bank of America/i.test(name))).toBe(true);
        expect(anchors.employers.some((name) => /OptumRx/i.test(name))).toBe(true);
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

    it('rejects fabricated employers and missing candidate name', () => {
        const resume = [
            'Ashish Dikonda',
            'Zyene, Inc.\t\tDec 2025 – Current',
            'Bank of America\t\tSep 2025 – May 2026',
            'OptumRx (UnitedHealth Group)\t\tMay 2024 – Aug 2025',
        ].join('\n');
        const latex = String.raw`\documentclass{article}
\begin{document}
\def\name{Marcus Feld}
\rRole{Analyst}{Healthcare and Enterprise Solutions}{}{}
\rRole{Analyst}{Technology and Analytics Solutions}{}{}
\end{document}`;

        const result = validateGeneratedResumeOutput({
            latex,
            templateTex: latex,
            resumeText: resume,
        });
        expect(result.ok).toBe(false);
        expect(result.issues.some((issue) => issue.includes('Ashish Dikonda'))).toBe(true);
        expect(result.issues.some((issue) => issue.includes('missing employers'))).toBe(true);
    });

    it('does not fail when one of several date ranges lacks a matching role macro', () => {
        const resume = [
            'Jane Candidate',
            'Engineer, Foo Inc    2021 -- Present',
            'Intern, Bar LLC    2019 -- 2020',
        ].join('\n');
        const latex = String.raw`\documentclass{article}
\newcommand{\rRole}[4]{#1}
\begin{document}
\def\name{Jane Candidate}
\rRole{A}{Foo Inc}{}{}
\rRole{B}{Bar LLC}{}{}
\end{document}`;

        const result = validateGeneratedResumeOutput({
            latex,
            templateTex: String.raw`\documentclass{article}\begin{document}\end{document}`,
            resumeText: resume,
        });
        expect(result.issues, result.issues.join('; ')).toEqual([]);
        expect(result.ok).toBe(true);
    });
});
