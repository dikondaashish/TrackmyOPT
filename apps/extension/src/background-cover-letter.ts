import { WEBSITE_URL } from './config';
import type { GeneratedResumeArtifactV1 } from './resume-autofill-contract';
import { replaceActiveGeneratedResumeArtifact } from './active-resume-artifact-store';
import { arrayBufferToBase64 } from './resume-file-upload';
import { getExtensionBearerToken } from './background-auth';
import {
  peekCurrentGeneratedResumeArtifact,
  persistGeneratedResumeArtifact,
} from './background-resume-artifact';

export async function generateCoverLetterForCurrentArtifact(input: {
  artifactId: string;
  jobDescription: string;
  isRegeneration: boolean;
}) {
  const artifact = peekCurrentGeneratedResumeArtifact();
  if (!artifact || artifact.artifactId !== input.artifactId) {
    return { ok: false, error: 'artifact_unavailable' };
  }
  const bearer = await getExtensionBearerToken();
  if (!bearer) return { ok: false, error: 'not_signed_in' };
  const response = await fetch(`${WEBSITE_URL}/api/resume-generator/cover-letter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${bearer}` },
    body: JSON.stringify({
      snapshot: artifact.snapshot,
      sourceContentHash: artifact.generatedContentHash,
      isRegeneration: input.isRegeneration,
      job: {
        companyName: artifact.job.companyName,
        roleTitle: artifact.job.roleTitle,
        jobDescription: input.jobDescription,
      },
    }),
  });
  const result = await response.json().catch(() => null) as {
    attachment?: GeneratedResumeArtifactV1['coverLetter'];
    draftText?: string;
    limits?: unknown;
    error?: string;
  } | null;
  if (!response.ok || !result?.attachment) {
    return { ok: false, error: result?.error || 'generation_failed', limits: result?.limits };
  }
  if (result.attachment.sourceContentHash !== artifact.generatedContentHash) {
    return { ok: false, error: 'source_hash_mismatch', limits: result.limits };
  }
  artifact.coverLetter = result.attachment;
  await replaceActiveGeneratedResumeArtifact(artifact);
  await persistGeneratedResumeArtifact(artifact);
  return { ok: true, attachment: result.attachment, draftText: result.draftText || '', limits: result.limits };
}

function escapeCoverLetterLatex(value: string): string {
  return value
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/([#$%&_{}])/g, '\\$1')
    .replace(/\^/g, '\\textasciicircum{}')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\r?\n/g, '\\\\\n');
}

export async function recompileCoverLetterForCurrentArtifact(input: {
  artifactId: string;
  editedText: string;
  sourceContentHash: string;
}) {
  const artifact = peekCurrentGeneratedResumeArtifact();
  if (!artifact || artifact.artifactId !== input.artifactId) return { ok: false, error: 'artifact_unavailable' };
  // Invalidate synchronously before any asynchronous compiler work begins.
  artifact.coverLetter = undefined;
  await replaceActiveGeneratedResumeArtifact(artifact);
  if (input.sourceContentHash !== artifact.generatedContentHash || !input.editedText.trim()) {
    return { ok: false, error: 'source_hash_mismatch' };
  }
  const bearer = await getExtensionBearerToken();
  if (!bearer) return { ok: false, error: 'not_signed_in' };
  const latex = `\\documentclass[11pt]{letter}\n\\usepackage[margin=1in]{geometry}\n\\begin{document}\n${escapeCoverLetterLatex(input.editedText.trim())}\n\\end{document}`;
  const response = await fetch(`${WEBSITE_URL}/api/resume-generator/compile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${bearer}` },
    body: JSON.stringify({ latexCode: latex }),
  });
  if (!response.ok) return { ok: false, error: 'compile_failed' };
  const pdf = await response.arrayBuffer();
  const base64 = arrayBufferToBase64(pdf);
  const digest = await crypto.subtle.digest('SHA-256', pdf);
  const sha256 = Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
  const attachment = {
    filename: 'cover-letter.pdf',
    base64,
    sha256,
    generatedAt: new Date().toISOString(),
    sourceContentHash: artifact.generatedContentHash,
  };
  artifact.coverLetter = attachment;
  await replaceActiveGeneratedResumeArtifact(artifact);
  await persistGeneratedResumeArtifact(artifact);
  return { ok: true, attachment, draftText: input.editedText };
}
