'use client';

import { useRef, useState } from 'react';
import { Check, FileSearch, LoaderCircle, Sparkles, Upload, X } from 'lucide-react';
import type { ResumeJobProfile } from '@/lib/job-board/resume-match';

export type SavedResumeOption = {
  id: string;
  filename: string;
  updatedAt: string | null;
};

type MatchResponse = {
  ok: boolean;
  filename?: string;
  source?: 'ai' | 'deterministic';
  profile?: ResumeJobProfile;
  error?: string;
};

export type ActiveResumeMatch = {
  filename: string;
  source: 'ai' | 'deterministic';
  profile: ResumeJobProfile;
};

async function responseJson(response: Response): Promise<MatchResponse> {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || 'Unable to analyze this resume');
  return body;
}

export function ResumeJobMatcher({
  savedResumes,
  activeMatch,
  onMatch,
  onClear,
}: {
  savedResumes: SavedResumeOption[];
  activeMatch: ActiveResumeMatch | null;
  onMatch: (match: ActiveResumeMatch) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [resumeId, setResumeId] = useState(savedResumes[0]?.id || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const applyResponse = (body: MatchResponse) => {
    if (!body.ok || !body.filename || !body.profile || !body.source) throw new Error('The resume analysis was incomplete. Please try again.');
    onMatch({ filename: body.filename, profile: body.profile, source: body.source });
    setError(null);
    setOpen(false);
  };

  const matchSavedResume = async () => {
    if (!resumeId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/job-board/resume-match', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ resumeId }),
      });
      applyResponse(await responseJson(response));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to analyze this resume');
    } finally {
      setLoading(false);
    }
  };

  const matchUploadedResume = async (file: File | undefined) => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadResponse = await fetch('/api/resume-generator/upload', { method: 'POST', body: formData });
      const upload = await uploadResponse.json().catch(() => ({}));
      let resumeText = upload.text;
      let filename = upload.filename || file.name;
      if (!uploadResponse.ok && upload.error === 'pdf_no_extractable_text' && upload.can_ocr && upload.fileBuffer) {
        const ocrResponse = await fetch('/api/proxy/ocr/direct', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ fileBuffer: upload.fileBuffer, filename }),
        });
        const ocr = await ocrResponse.json().catch(() => ({}));
        if (!ocrResponse.ok || !ocr.ok || !ocr.text) throw new Error(ocr.message || ocr.error || 'Unable to read this scanned resume');
        resumeText = ocr.text;
        filename = ocr.filename || filename;
      } else if (!uploadResponse.ok || !upload.success || !resumeText) {
        throw new Error(upload.message || upload.error || 'Unable to read this resume');
      }

      const matchResponse = await fetch('/api/job-board/resume-match', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ resumeText, filename }),
      });
      applyResponse(await responseJson(matchResponse));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to analyze this resume');
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  if (activeMatch && !open) {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-blue-200 bg-blue-50/70 p-3 sm:flex-row sm:items-center sm:justify-between dark:border-blue-900/70 dark:bg-blue-950/25">
        <div className="flex min-w-0 items-start gap-2.5">
          <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-700 text-white dark:bg-blue-500"><Check className="size-4" aria-hidden="true" /></span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">Matching from {activeMatch.filename}</p>
            <p className="mt-0.5 text-xs leading-5 text-slate-600 dark:text-slate-300">Jobs are ranked by role, skills, experience, and education. Manual filters still apply.</p>
            {activeMatch.profile.skills.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {activeMatch.profile.skills.slice(0, 6).map((skill) => <span key={skill} className="rounded bg-white/80 px-1.5 py-0.5 text-[0.6875rem] font-medium text-blue-800 dark:bg-blue-950 dark:text-blue-200">{skill}</span>)}
                {activeMatch.profile.skills.length > 6 && <span className="px-1 py-0.5 text-[0.6875rem] text-slate-500 dark:text-slate-400">+{activeMatch.profile.skills.length - 6}</span>}
              </div>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button type="button" onClick={() => setOpen(true)} className="min-h-11 rounded-lg px-3 text-sm font-medium text-blue-800 hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 dark:text-blue-200 dark:hover:bg-blue-900/50">Change</button>
          <button type="button" onClick={onClear} aria-label="Remove resume matching" className="inline-flex size-11 items-center justify-center rounded-lg text-slate-500 hover:bg-blue-100 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 dark:hover:bg-blue-900/50 dark:hover:text-white"><X className="size-4" aria-hidden="true" /></button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-gradient-to-r from-blue-50/70 to-white p-3 dark:border-slate-800 dark:from-blue-950/20 dark:to-slate-950">
      {!open ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2.5">
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200"><Sparkles className="size-4" aria-hidden="true" /></span>
            <div>
              <p className="text-sm font-semibold text-slate-950 dark:text-white">Find jobs that fit your resume</p>
              <p className="mt-0.5 text-xs leading-5 text-slate-600 dark:text-slate-300">Extract your qualifications once, then rank every verified job with clear match reasons.</p>
            </div>
          </div>
          <button type="button" onClick={() => setOpen(true)} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-700 px-3.5 text-sm font-medium text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"><FileSearch className="size-4" aria-hidden="true" /> Match from resume</button>
        </div>
      ) : (
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-950 dark:text-white">Choose a resume</p>
              <p className="mt-0.5 text-xs leading-5 text-slate-600 dark:text-slate-300">We extract job qualifications only. We never infer visa status or other sensitive attributes.</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close resume matching" className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 dark:hover:bg-slate-900"><X className="size-4" aria-hidden="true" /></button>
          </div>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
            {savedResumes.length > 0 && (
              <>
                <label className="min-w-0 flex-1">
                  <span className="sr-only">Saved resume</span>
                  <select value={resumeId} onChange={(event) => setResumeId(event.target.value)} aria-label="Saved resume" disabled={loading} className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-blue-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
                    {savedResumes.map((resume) => <option key={resume.id} value={resume.id}>{resume.filename}</option>)}
                  </select>
                </label>
                <button type="button" onClick={matchSavedResume} disabled={loading || !resumeId} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-3.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">
                  {loading ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Sparkles className="size-4" aria-hidden="true" />} Analyze saved resume
                </button>
                <span className="text-center text-xs text-slate-400">or</span>
              </>
            )}
            <label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-blue-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900">
              {loading ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Upload className="size-4" aria-hidden="true" />}
              Upload PDF, DOCX, or TXT
              <input ref={inputRef} type="file" accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" disabled={loading} aria-label="Upload resume for job matching" className="sr-only" onChange={(event) => void matchUploadedResume(event.target.files?.[0])} />
            </label>
          </div>
          {error && <p role="alert" className="mt-2 text-xs font-medium text-red-700 dark:text-red-300">{error}</p>}
        </div>
      )}
    </div>
  );
}
