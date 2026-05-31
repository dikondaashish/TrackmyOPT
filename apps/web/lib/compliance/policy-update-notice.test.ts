import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { RISKY_MARKETING_PHRASES } from "@/lib/legal/legal-config";
import {
  buildPolicyUpdateNoticeEmailContent,
  getRecipientExclusionReason,
  POLICY_UPDATE_NOTICE_SUBJECT,
} from "./policy-update-notice";

const MARKETING_BLOCKED = ["upgrade", "discount", "limited offer", "try pro"] as const;

const USCIS_BLOCKED = [
  "uscis approved",
  "official uscis api",
  "authorized access",
  "uscis partner",
  ...RISKY_MARKETING_PHRASES.filter((p) => p.includes("uscis") || p.includes("authorized")),
] as const;

describe("policy-update-notice email", () => {
  const { subject, html, text } = buildPolicyUpdateNoticeEmailContent("Alex");
  const combined = `${subject}\n${html}\n${text}`.toLowerCase();

  it("uses the required subject line", () => {
    expect(subject).toBe(POLICY_UPDATE_NOTICE_SUBJECT);
    expect(subject).toBe("TrackMyOPT policy update");
  });

  it("does not include marketing phrases", () => {
    const violations = MARKETING_BLOCKED.filter((p) => combined.includes(p));
    expect(violations).toEqual([]);
  });

  it("does not include risky USCIS phrases", () => {
    const violations = USCIS_BLOCKED.filter((p) => combined.includes(p));
    expect(violations).toEqual([]);
  });

  it("includes required policy links and compliance statements", () => {
    expect(combined).toContain("privacy policy");
    expect(combined).toContain("terms");
    expect(combined).toContain("refund policy");
    expect(combined).toContain("cookie policy");
    expect(combined).toContain("disclaimer");
    expect(combined).toContain("security");
    expect(combined).toContain("these updates do not change your current plan price");
    expect(combined).toContain(
      "not affiliated with, endorsed by, or operated by uscis"
    );
  });

  it("personalizes greeting when first name is provided", () => {
    expect(html).toContain("Hi Alex,");
  });
});

describe("policy-update-notice recipient filter", () => {
  it("excludes example and test accounts", () => {
    expect(getRecipientExclusionReason("user@example.com")).toBe("invalid_domain");
    expect(getRecipientExclusionReason("test@company.com")).toBe("test_account");
    expect(getRecipientExclusionReason("dev@startup.io")).toBe("test_account");
  });

  it("allows normal student emails", () => {
    expect(getRecipientExclusionReason("student@university.edu")).toBeNull();
  });
});

describe("send-policy-update-notice script", () => {
  it("defaults to dry-run unless --send is passed", () => {
    const content = readFileSync(
      join(process.cwd(), "scripts/send-policy-update-notice.ts"),
      "utf8"
    );
    expect(content).toContain("--dry-run");
    expect(content).toContain("--send");
    expect(content).toMatch(/dryRun.*--send/s);
  });
});
