import { NextRequest } from 'next/server';
import { z } from 'zod';
import { generateAiContent } from '@/lib/ai/google-ai';
import { buildNetworkingDraftPrompt } from '@/lib/ai/prompts/networking-draft';
import { apiFail, apiOk, apiUnauthorized } from '@/lib/api/response';
import { checkRateLimitByUser } from '@/lib/auth/api-rate-limit';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const PRIVATE_HEADERS = { 'Cache-Control': 'no-store, private, max-age=0' };
const RequestSchema = z
  .object({
    companyName: z.string().trim().min(1).max(120).nullable(),
    roleTitle: z.string().trim().min(1).max(120).nullable(),
    contactName: z.string().trim().max(120).nullable(),
    contactTitle: z.string().trim().max(120).nullable(),
    messageIntent: z.string().trim().min(1).max(1000),
    includeEmail: z.boolean(),
  })
  .strict();
const DraftSchema = z.object({
  subject: z.string().trim().min(1).max(160).nullable(),
  emailBody: z.string().trim().min(1).max(2000).nullable(),
  linkedinNote: z.string().trim().min(1).max(300),
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return apiUnauthorized('Sign in to draft outreach', {
      headers: PRIVATE_HEADERS,
    });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiFail('Enter what you want to say first', {
      headers: PRIVATE_HEADERS,
    });
  }
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success)
    return apiFail('Enter valid company and contact details', {
      headers: PRIVATE_HEADERS,
    });

  const limit = await checkRateLimitByUser(user.id, {
    limit: 15,
    windowSeconds: 86_400,
    name: 'networking-draft',
  });
  if (!limit.success) {
    return apiFail(
      limit.unavailable
        ? 'AI drafting is temporarily unavailable.'
        : 'You have reached the daily AI draft limit.',
      {
        status: limit.unavailable ? 503 : 429,
        headers: {
          ...PRIVATE_HEADERS,
          'Retry-After': String(limit.retryAfter ?? 60),
        },
      }
    );
  }

  try {
    const response = await generateAiContent({
      task: 'networking_draft',
      contents: buildNetworkingDraftPrompt(parsed.data),
      config: { responseMimeType: 'application/json' },
      userId: user.id,
    });
    const draft = DraftSchema.safeParse(JSON.parse(response.text || ''));
    if (
      !draft.success ||
      (parsed.data.includeEmail &&
        (!draft.data.subject || !draft.data.emailBody))
    ) {
      return apiFail('AI returned an incomplete draft. Please try again.', {
        status: 502,
        headers: PRIVATE_HEADERS,
      });
    }
    return apiOk(
      {
        subject: parsed.data.includeEmail ? draft.data.subject : null,
        emailBody: parsed.data.includeEmail ? draft.data.emailBody : null,
        linkedinNote: draft.data.linkedinNote,
      },
      { headers: PRIVATE_HEADERS }
    );
  } catch {
    return apiFail('AI drafting is unavailable right now. Please try again.', {
      status: 502,
      headers: PRIVATE_HEADERS,
    });
  }
}
