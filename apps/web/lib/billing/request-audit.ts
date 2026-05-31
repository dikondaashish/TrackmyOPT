import type { NextRequest } from "next/server";

export function getRequestAuditFromHeaders(req: NextRequest | Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    null;
  const userAgent = req.headers.get("user-agent") || null;
  return { ip_address: ip, user_agent: userAgent };
}
