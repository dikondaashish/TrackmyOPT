import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth/getUserId';
import {
    loadTemplateSource,
    isKnownTemplateId,
    normalizeAccentHex,
} from '@/lib/documents/template-source';
import { compileLatex } from '@/lib/resume/latex-compiler';

/**
 * Renders a template's built-in demo resume to PDF.
 *
 * This deliberately compiles the same .tex file that the AI generation flow is
 * given, through the same compiler. That is what makes the selection-page
 * thumbnail and the quick-view preview a 1:1 match with the final generated
 * document — there is no second, hand-maintained HTML replica to drift.
 *
 * Results are cached in-process because the demo PDFs only change when a
 * template file changes (i.e. on deploy).
 */

const previewCache = new Map<string, ArrayBuffer>();
const inFlight = new Map<string, Promise<ArrayBuffer | null>>();

async function renderPreview(
    templateId: string,
    accentHex: string | null
): Promise<ArrayBuffer | null> {
    const key = `${templateId}:${accentHex ?? 'default'}`;
    const cached = previewCache.get(key);
    if (cached) return cached;

    // Collapse concurrent requests for the same template into one compile.
    const pending = inFlight.get(key);
    if (pending) return pending;

    const task = (async () => {
        const template = loadTemplateSource(templateId, accentHex);
        if (!template) return null;

        const result = await compileLatex(template.tex);
        if (!result.ok) {
            console.error(`[template-preview] ${templateId}: ${result.error}`);
            return null;
        }

        previewCache.set(key, result.pdf);
        return result.pdf;
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
            // Demo previews only change on deploy.
            'Cache-Control': 'private, max-age=86400',
        },
    });
}
