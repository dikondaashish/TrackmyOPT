import { WEBSITE_URL } from './config';
import { isJobFitLimitResponse } from './job-fit';
import { buildScoreComparison } from './smart-flow';
import {
  buildGeneratedResumeResult,
  type SnapshotExtractionHandoff,
} from './resume-generation-result';
import { compileLatexWithSingleRepair } from './compile-latex-with-repair';
import type { RunSession } from './agent/run-session';
import type {
  GeneratedResumeArtifactV1,
  ResumeAutofillSnapshotV1,
} from './resume-autofill-contract';
import { buildGeneratedResumeArtifactV1 } from './resume-artifact-lifecycle';
import { arrayBufferToBase64 } from './resume-file-upload';
import { getExtensionBearerToken } from './background-auth';
import {
  cacheCurrentGeneratedResumeArtifact,
  clearCurrentGeneratedResumeArtifact,
} from './background-resume-artifact';

export interface GenerateResumeResult {
  ok: boolean;
  error?: string;
  detail?: string;
  pdfBase64?: string;
  editorUrl?: string;
  baselineScore?: number;
  generatedScore?: number;
  scoreError?: 'limit_reached' | 'scan_failed';
  structuredFieldsAvailable?: boolean;
  generatedContentHash?: string;
  snapshot?: ResumeAutofillSnapshotV1;
  artifact?: GeneratedResumeArtifactV1;
}

/**
 * base resume (resumes table) -> tailored LaTeX (/generate) -> PDF (/compile).
 * All calls use the extension Bearer token; only the finished PDF (base64) is
 * returned to the caller.
 */
export async function generateTailoredResume(input: {
  jobDescription: string;
  resumeId: string;
  templateId: string;
  companyName: string;
  roleTitle: string;
  jobUrl: string;
  jobKey: string;
  outputFilename: string;
  focusKeywords?: string[];
  alignJobTitles?: boolean;
  baselineScore?: number;
  applicationId?: string;
  /**
   * Raw resume text pasted directly into the side panel. Takes priority over
   * resumeId when present — the caller only needs to supply one of the two.
   */
  resumeText?: string;
}, run?: RunSession): Promise<GenerateResumeResult> {
  // When a run session is supplied the pipeline reports each step and honours
  // cancellation; without one it behaves exactly as before.
  const signal = run?.signal;
  const bearer = await getExtensionBearerToken();
  if (!bearer) return { ok: false, error: 'not_signed_in' };
  const {
    jobDescription,
    resumeId,
    templateId,
    companyName,
    roleTitle,
    jobUrl,
    jobKey,
    outputFilename,
    applicationId,
  } = input;
  const focusKeywords = [...new Set((input.focusKeywords ?? [])
    .map((keyword) => keyword.replace(/\s+/g, ' ').trim().slice(0, 80))
    .filter(Boolean))].slice(0, 12);
  const alignJobTitles = input.alignJobTitles === true;
  const pastedResumeText = input.resumeText?.trim();
  if (!jobDescription.trim()) return { ok: false, error: 'no_job_description' };
  if (!pastedResumeText && !resumeId.trim()) return { ok: false, error: 'no_base_resume' };
  if (!templateId.trim()) return { ok: false, error: 'no_template' };

  const auth = { 'Content-Type': 'application/json', Authorization: `Bearer ${bearer}` };

  // 1. Pasted text, or the user-selected saved resume
  run?.step('load_resume', 'active');
  let base: { content?: string; filename?: string };
  if (pastedResumeText) {
    base = { content: pastedResumeText, filename: 'Pasted resume' };
  } else {
    const baseUrl = new URL(`${WEBSITE_URL}/api/resume-generator/base-resume`);
    if (resumeId !== '__latest__') {
      baseUrl.searchParams.set('resumeId', resumeId);
    }
    const baseRes = await fetch(baseUrl.toString(), {
      method: 'GET',
      signal,
      headers: auth,
    });
    if (baseRes.status === 404) return { ok: false, error: 'no_base_resume' };
    if (!baseRes.ok) return { ok: false, error: 'base_failed' };
    base = (await baseRes.json()) as { content?: string; filename?: string };
  }
  if (!base.content) return { ok: false, error: 'no_base_resume' };
  run?.step('load_resume', 'done', base.filename);
  run?.throwIfCancelled();

  // Reuse the in-widget analysis score when the user followed Analyze →
  // Generate. A direct Generate click has no prior score in page memory, so
  // compute the baseline once here before tailoring.
  let baselineScore = buildScoreComparison(undefined, input.baselineScore)?.generated;
  let scoreError: GenerateResumeResult['scoreError'];
  if (baselineScore === undefined) {
    run?.step('baseline_score', 'active');
    try {
      const baselineRes = await fetch(`${WEBSITE_URL}/api/resume-generator/analyze-gap`, {
        method: 'POST',
        signal,
        headers: auth,
        body: JSON.stringify({
          resumeText: base.content,
          jobDescription: jobDescription.slice(0, 15000),
        }),
      });
      const baselineData = await baselineRes.json().catch(() => ({})) as {
        code?: string;
        matchScore?: number;
      };
      if (isJobFitLimitResponse(baselineRes.status, baselineData.code)) {
        scoreError = 'limit_reached';
      } else if (baselineRes.ok) {
        baselineScore = buildScoreComparison(undefined, baselineData.matchScore)?.generated;
      }
    } catch {
      // Tailoring remains available even if the optional baseline comparison fails.
    }
    run?.step(
      'baseline_score',
      baselineScore === undefined ? 'skipped' : 'done',
      baselineScore === undefined ? 'unavailable' : `${baselineScore}/100`
    );
  } else {
    run?.step('baseline_score', 'done', `${baselineScore}/100`);
  }
  run?.throwIfCancelled();

  // 2. Tailored LaTeX
  run?.step('tailor', 'active');
  const genRes = await fetch(`${WEBSITE_URL}/api/resume-generator/generate`, {
    method: 'POST',
    signal,
    headers: auth,
    body: JSON.stringify({
      resumeText: base.content,
      jobDescription: jobDescription.slice(0, 15000),
      templateId,
      focusKeywords,
      alignJobTitles,
    }),
  });
  if (genRes.status === 403) {
    const j = (await genRes.json().catch(() => ({}))) as { details?: string };
    return { ok: false, error: 'limit', detail: j.details };
  }
  if (!genRes.ok) return { ok: false, error: 'generate_failed' };
  const gen = (await genRes.json()) as { latex?: string };
  if (!gen.latex) return { ok: false, error: 'generate_failed' };
  run?.step('tailor', 'done');
  run?.throwIfCancelled();
  run?.step('compile', 'active');

  // 3. Compile to PDF — with one AI repair-and-retry on failure. Some Gemini
  //    LaTeX has syntax errors the compiler rejects; fix-latex repairs them and
  //    we compile again (mirrors the website's editor flow).
  const compile = async (latexCode: string): Promise<{ pdf?: ArrayBuffer; error?: string }> => {
    const r = await fetch(`${WEBSITE_URL}/api/resume-generator/compile`, {
      method: 'POST',
      signal,
      headers: auth,
      body: JSON.stringify({ latexCode }),
    });
    if (!r.ok) {
      const j = (await r.json().catch(() => ({}))) as { error?: string };
      return { error: j.error || `HTTP ${r.status}` };
    }
    const buf = await r.arrayBuffer();
    return buf.byteLength ? { pdf: buf } : { error: 'empty pdf' };
  };

  const compiled = await compileLatexWithSingleRepair({
    initialLatex: gen.latex,
    compile,
    repair: async (latexCode, errorMessage) => {
      // The first compile failed; surface the repair rather than leaving the
      // user on a stalled "Compiling" step.
      run?.step('compile', 'failed');
      run?.step('repair', 'active');
      const fixRes = await fetch(`${WEBSITE_URL}/api/resume-generator/fix-latex`, {
        method: 'POST',
        signal,
        headers: auth,
        body: JSON.stringify({ latexCode, errorMessage }),
      });
      if (fixRes.ok) {
        const fixed = (await fixRes.json()) as { latex?: string };
        return fixed.latex;
      }
      return undefined;
    },
  });
  if (!compiled.pdf) {
    run?.step(compiled.repaired ? 'repair' : 'compile', 'failed');
    return { ok: false, error: 'compile_failed' };
  }
  if (compiled.repaired) run?.step('repair', 'done', 'formatting fixed');
  run?.step('compile', 'done');
  run?.throwIfCancelled();
  run?.step('extract', 'active');
  const latex = compiled.finalLatex;

  // Extract a structured snapshot only after the exact, possibly repaired,
  // LaTeX has compiled. Extraction is deliberately non-blocking: the PDF is
  // still returned when the endpoint, model, or reconciliation is unavailable.
  let snapshotExtraction: SnapshotExtractionHandoff | undefined;
  try {
    const snapshotRes = await fetch(`${WEBSITE_URL}/api/resume-generator/autofill-snapshot`, {
      method: 'POST',
      signal,
      headers: auth,
      body: JSON.stringify({ finalLatex: latex, sourceResumeId: resumeId }),
    });
    const snapshotData = (await snapshotRes.json().catch(() => ({}))) as {
      structuredFieldsAvailable?: boolean;
      generatedContentHash?: string;
      snapshot?: ResumeAutofillSnapshotV1;
      reason?: string;
    };
    snapshotExtraction = {
      structuredFieldsAvailable: snapshotRes.ok && snapshotData.structuredFieldsAvailable === true,
      generatedContentHash: snapshotData.generatedContentHash,
      snapshot: snapshotData.snapshot,
      reason: snapshotData.reason,
    };
  } catch {
    snapshotExtraction = { structuredFieldsAvailable: false };
  }
  run?.step(
    'extract',
    snapshotExtraction?.structuredFieldsAvailable ? 'done' : 'skipped',
    snapshotExtraction?.structuredFieldsAvailable ? 'fields ready' : 'not available'
  );
  run?.throwIfCancelled();
  run?.step('package', 'active');

  const pdfBase64 = arrayBufferToBase64(compiled.pdf);
  let artifact: GeneratedResumeArtifactV1 | undefined;
  try {
    const builtArtifact = await buildGeneratedResumeArtifactV1({
      sourceResumeId: resumeId,
      sourceResumeFilename: base.filename || 'resume',
      templateId,
      jobKey: jobKey || `${companyName}|${roleTitle}|${jobUrl}`,
      jobContext: {
        jobUrl,
        companyName,
        roleTitle,
      },
      jobDescription,
      finalLatex: latex,
      extractedContentHash: snapshotExtraction?.generatedContentHash,
      extractedSnapshot: snapshotExtraction?.snapshot,
      pdfBase64,
      pdfFilename: outputFilename,
    });
    artifact = builtArtifact.artifact;
    await cacheCurrentGeneratedResumeArtifact(artifact);
    snapshotExtraction = {
      structuredFieldsAvailable: builtArtifact.structuredFieldsAvailable,
      generatedContentHash: artifact.generatedContentHash,
      snapshot: builtArtifact.structuredFieldsAvailable
        ? artifact.snapshot
        : undefined,
      reason: snapshotExtraction?.reason,
    };
  } catch {
    await clearCurrentGeneratedResumeArtifact();
    // PDF download remains available if local hashing is unexpectedly unavailable.
  }

  // 4. Score the exact generated LaTeX after any compile repair. This is
  // non-blocking from a product perspective: a quota/network failure never
  // discards an otherwise valid generated resume.
  let generatedScore: number | undefined;
  if (scoreError !== 'limit_reached') {
    try {
      const scanRes = await fetch(`${WEBSITE_URL}/api/resume-generator/scan`, {
        method: 'POST',
        signal,
        headers: auth,
        body: JSON.stringify({
          latexCode: latex,
          jobDescription: jobDescription.slice(0, 15000),
        }),
      });
      const scanData = await scanRes.json().catch(() => ({})) as { code?: string; score?: number };
      if (isJobFitLimitResponse(scanRes.status, scanData.code)) {
        scoreError = 'limit_reached';
      } else if (scanRes.ok) {
        generatedScore = buildScoreComparison(baselineScore, scanData.score)?.generated;
        if (generatedScore === undefined) scoreError = 'scan_failed';
      } else {
        scoreError = 'scan_failed';
      }
    } catch {
      scoreError = 'scan_failed';
    }
  }

  // 5. Persist a short-lived, user-scoped handoff so "Edit" opens the actual
  // generated LaTeX in the editor instead of restarting the three-step flow.
  let editorUrl: string | undefined;
  try {
    const handoffRes = await fetch(`${WEBSITE_URL}/api/resume-generator/extension-handoff`, {
      method: 'POST',
      signal,
      headers: auth,
      body: JSON.stringify({
        latex,
        resumeText: base.content,
        resumeFilename: base.filename,
        jobDescription: jobDescription.slice(0, 15000),
        jobTitle: roleTitle
          ? (companyName ? `${roleTitle} at ${companyName}` : roleTitle)
          : companyName,
        templateId,
        applicationId: applicationId || undefined,
        atsScore: generatedScore ?? null,
      }),
    });
    const handoff = (await handoffRes.json().catch(() => ({}))) as { handoffId?: string };
    if (handoffRes.ok && handoff.handoffId) {
      const editor = new URL(`${WEBSITE_URL}/dashboard/career/resume-generator/editor`);
      editor.searchParams.set('handoffId', handoff.handoffId);
      if (applicationId) editor.searchParams.set('applicationId', applicationId);
      editorUrl = editor.toString();
    }
  } catch {
    // PDF download remains available even if the optional editor handoff fails.
  }

  run?.step('package', 'done');
  return buildGeneratedResumeResult({
    pdfBase64,
    editorUrl,
    baselineScore,
    generatedScore,
    scoreError,
    artifact,
  }, snapshotExtraction);
}
