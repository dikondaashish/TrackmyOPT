import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { buildResumePdfFilename as extensionFilename } from '../src/resume-filename';
import { buildResumePdfFilename } from '../../web/lib/resume/build-resume-filename';

test('web and extension use the identical filename function', () => {
  assert.equal(extensionFilename, buildResumePdfFilename);
});

for (const [template, name] of [
  ['modern', 'Priya_Raghavan'], ['professional', 'Daniel_Okafor'],
  ['academic', 'Wei_Lin_Chen'], ['tech', 'Marcus_Feld'],
  ['executive', 'Alicia_Moreno'], ['creative', 'Jordan_Alvarez'],
]) {
  test(`filename extracts the name from the ${template} product template`, () => {
    const latex = readFileSync(`../web/templates/latex/${template}.tex`, 'utf8');
    assert.equal(extensionFilename({ latex, jobDescription: 'Role: Data Engineer' }), `${name}_Resume_Data_Engineer.pdf`);
  });
}

const cases = [
  ['split name', String.raw`\name{Jane}{Smith}`, 'Role: Senior Data Analyst', 'Jane_Smith_Resume_Senior_Data_Analyst.pdf'],
  ['defined name', String.raw`\def\name{Jane Smith}`, 'Role: Engineer', 'Jane_Smith_Resume_Engineer.pdf'],
  ['single name macro', String.raw`\name{Jane Smith}`, 'Role: Engineer', 'Jane_Smith_Resume_Engineer.pdf'],
  ['heading name', String.raw`\textbf{\Huge Jane Smith}`, 'Role: Engineer', 'Jane_Smith_Resume_Engineer.pdf'],
  ['unsafe filename characters', String.raw`\name{Jane / Smith}`, 'Role: QA / Data: Engineer', 'Jane_Smith_Resume_QA_Data_Engineer.pdf'],
  ['missing name', '', 'Role: Engineer', 'Resume_Engineer.pdf'],
  ['missing role', String.raw`\name{Jane Smith}`, '', 'Jane_Smith_Resume.pdf'],
  ['missing both', '', '', 'Resume_generated.pdf'],
];
for (const [label, latex, jobDescription, expected] of cases) {
  test(`resume filename: ${label}`, () => {
    assert.equal(buildResumePdfFilename({ latex, jobDescription }), expected);
  });
}
test('LaTeX role fallback uses the same name-first format', () => {
  assert.equal(buildResumePdfFilename({ latex: String.raw`\name{Jane Smith}\def\role{Engineer}`, jobDescription: '' }), 'Jane_Smith_Resume_Engineer.pdf');
});
test('filename parts are bounded and fallback template cannot introduce a path', () => {
  const filename = buildResumePdfFilename({ latex: `\\name{${'Jane'.repeat(100)}}`, jobDescription: `Role: ${'Engineer '.repeat(10)}` });
  assert.ok(filename.length <= 180);
  assert.equal(buildResumePdfFilename({ latex: '', jobDescription: '', templateId: '../../classic' }), 'Resume_classic.pdf');
});
