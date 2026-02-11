
import { buildRegeneratePrompt } from '../lib/prompts/regenerate';
import { checkAtsCompliance } from '../lib/validators/ats-checker';

const mockResume = "John Doe\nSoftware Engineer\nExperience: Google...";
const mockJob = "Software Engineer at OpenAI...";
const mockTemplate = "\\documentclass{article}...";
const mockPreviousLatex = "\\documentclass{article}\n\\begin{document}\nJohn Doe\n\\includegraphics{pic.jpg}\n\\end{document}";
const mockFeedback = "Add more quantitative metrics.";

console.log("--- Testing Regeneration Logic ---");

// 1. Test Prompt Builder
console.log("\n1. Building Regeneration Prompt...");
const prompt = buildRegeneratePrompt(mockResume, mockJob, mockTemplate, mockPreviousLatex, mockFeedback);

if (prompt.includes("REGENERATE_SYSTEM_PROMPT") || prompt.includes("Add more quantitative metrics")) {
    console.log("✅ Prompt includes feedback and context.");
} else {
    console.error("❌ Prompt missing feedback or context.");
}

// 2. Test ATS Checker (Negative Case)
console.log("\n2. Testing ATS Checker (Should Fail)...");
const badResult = checkAtsCompliance(mockPreviousLatex);
if (!badResult.passed && badResult.issues.some(i => i.includes("images/graphics"))) {
    console.log("✅ Correctly identified forbidden image command.");
} else {
    console.error("❌ Failed to identify forbidden image command.", badResult);
}

// 3. Test ATS Checker (Positive Case)
console.log("\n3. Testing ATS Checker (Should Pass)...");
const goodLatex = `
\\documentclass{article}
\\begin{document}
\\section{Experience}
Worked at Google.
\\section{Education}
BS CS.
\\section{Skills}
Python, React.
\\end{document}
`;
const goodResult = checkAtsCompliance(goodLatex);
if (goodResult.passed) {
    console.log("✅ legitimate LaTeX passed check.");
} else {
    console.error("❌ legitimate LaTeX failed check.", goodResult);
}
