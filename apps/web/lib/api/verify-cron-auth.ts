import { NextRequest, NextResponse } from "next/server";
import { safeEqual } from "@/lib/api/secure-compare";

/** Returns an error response if cron auth fails; null when authorized. */
export function verifyCronAuth(req: NextRequest): NextResponse | null {
    const secret = process.env.CRON_SECRET;
    if (!secret) {
        return NextResponse.json({ error: "Cron not configured" }, { status: 503 });
    }
    const auth = req.headers.get("authorization");
    if (!auth || !safeEqual(auth, `Bearer ${secret}`)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return null;
}
