import { NextRequest, NextResponse } from "next/server";

/** Returns an error response if admin Bearer auth fails; null when authorized. */
export function verifyAdminAuth(req: NextRequest): NextResponse | null {
    const secret = process.env.ADMIN_SECRET;
    if (!secret) {
        return NextResponse.json({ error: "Admin API not configured" }, { status: 503 });
    }
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return null;
}
