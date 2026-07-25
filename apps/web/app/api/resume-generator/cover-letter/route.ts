import { NextRequest, NextResponse } from 'next/server';

import { AUTOFILL_FEATURE_FLAGS } from '../../../../../extension/src/autofill-feature-flags';

/** Real AI + LaTeX compilation is a later milestone. Never emit placeholder PDF bytes. */
export async function POST(_req: NextRequest) {
  return NextResponse.json(
    {
      error: AUTOFILL_FEATURE_FLAGS.coverLetter
        ? 'not_implemented'
        : 'feature_disabled',
    },
    { status: 501 }
  );
}
