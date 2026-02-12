
export function buildFixSyntaxPrompt(latexCode: string, errorMessage: string): string {
    return `
You are a LaTeX Debugging Expert.
The following LaTeX code failed to compile.

--- ERROR MESSAGE ---
${errorMessage}

--- BROKEN CODE ---
${latexCode}

YOUR TASK:
1. Identify the syntax error causing the compilation failure.
2. Fix the error.
3. Return ONLY the corrected LaTeX code.
4. Do NOT remove any content, only fix the syntax.
5. Do NOT return markdown fences or explanations. Just the code.
`;
}
