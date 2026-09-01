import { NextRequest, NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { getUserId } from '@/lib/auth/get-user-id';
import {
    loadTemplateSource,
    isKnownTemplateId,
    normalizeAccentHex,
} from '@/lib/documents/template-source';
import { compileLatex } from '@/lib/resume/latex-compiler';

/**
 * Renders a template's built-in demo resume to PDF.
 *
 * Compiles the same .tex file the AI generation flow uses, through the same
 * compiler, so the selection-page thumbnail matches the final document.
 *
 * Vercel serverless instances do not share process memory, so the in-process
 * Map is only an L1. `unstable_cache` is the L2 that actually survives
 * across invocations (demo PDFs only change on deploy).
 */

const previewCache = new Map<string, ArrayBuffer>();
const inFlight = new Map<string, Promise<ArrayBuffer | null>>();

const compilePreviewPdf = unstable_cache(
    async (templateId: string, accentHex: string | null): Promise<string | null> => {
        const template = loadTemplateSource(templateId, accentHex);
        if (!template) return null;

        // Demo templates contain no PII — fall back to public compilers when the
        // private API is misconfigured or temporarily unavailable.
        const result = await compileLatex(template.tex, { publicFallback: true });
        if (!result.ok) {
            // Throw so Next does not cache a failed compile for 24h.
            throw new Error(`[template-preview] ${templateId}: ${result.error}`);
        }

        return Buffer.from(result.pdf).toString('base64');
    },
    ['resume-template-preview'],
    { revalidate: 86400 }
);

async function renderPreview(
    templateId: string,
    accentHex: string | null
): Promise<ArrayBuffer | null> {
    const key = `${templateId}:${accentHex ?? 'default'}`;
    const cached = previewCache.get(key);
    if (cached) return cached;

    const pending = inFlight.get(key);
    if (pending) return pending;

    const task = (async () => {
        try {
            const b64 = await compilePreviewPdf(templateId, accentHex);
            if (!b64) return null;
            const bytes = Buffer.from(b64, 'base64');
            const copy = bytes.buffer.slice(
                bytes.byteOffset,
                bytes.byteOffset + bytes.byteLength
            );
            previewCache.set(key, copy);
            return copy;
        } catch (err) {
            console.error(err);
            return null;
        }
    })();

    inFlight.set(key, task);
    try {
        return await task;
    } finally {
        inFlight.delete(key);
    }
}

export async function GET(req: NextRequest) {
    const userId = await getUserId(req);
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const templateId = req.nextUrl.searchParams.get('templateId') ?? '';
    if (!isKnownTemplateId(templateId)) {
        return NextResponse.json({ error: 'Unknown template' }, { status: 404 });
    }

    const accentHex = normalizeAccentHex(req.nextUrl.searchParams.get('accent'));
    const pdf = await renderPreview(templateId, accentHex);
    if (!pdf) {
        return NextResponse.json(
            { error: 'Preview unavailable' },
            { status: 503 }
        );
    }

    return new NextResponse(pdf, {
        status: 200,
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename="${templateId}-preview.pdf"`,
            'Cache-Control': 'private, max-age=86400, stale-while-revalidate=604800',
        },
    });
}
