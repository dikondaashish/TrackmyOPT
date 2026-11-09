import { NextResponse } from 'next/server';

const headers = {
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': 'private, no-store, max-age=0',
  'Referrer-Policy': 'no-referrer',
  'X-Robots-Tag': 'noindex, nofollow',
  'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'",
};

/** Minimal standalone HTML page for email link landings. All inputs must already be escaped. */
export function alertPage(title: string, bodyHtml: string, status = 200) {
  return new NextResponse(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title} · TrackMyOPT</title></head><body style="margin:0;background:#f6f8fb;color:#17243a;font:16px/1.6 system-ui,sans-serif"><main style="max-width:520px;margin:64px auto;padding:24px"><p><a href="/" style="color:#155eef;text-decoration:none;font-weight:600">TrackMyOPT</a></p><h1 style="font-size:28px;line-height:1.25">${title}</h1>${bodyHtml}<p style="color:#5b6b82;font-size:14px">Need help? <a href="mailto:support@trackmyopt.com">support@trackmyopt.com</a></p></main></body></html>`,
    { status, headers }
  );
}

export function alertButtonForm(action: string, label: string) {
  return `<form method="post" action="${action}"><button type="submit" style="border:0;border-radius:8px;background:#155eef;color:white;padding:14px 22px;font:inherit;cursor:pointer">${label}</button></form>`;
}

export function headResponse() {
  return new NextResponse(null, { headers });
}
