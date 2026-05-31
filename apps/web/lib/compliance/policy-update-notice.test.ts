import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { RISKY_MARKETING_PHRASES } from "@/lib/legal/legal-config";
import { EMAIL } from "@/lib/notifications/email-brand";
import {
  buildPolicyUpdateNoticeEmailContent,
  filterPolicyNoticeRecipients,
  getRecipientExclusionReason,
  POLICY_UPDATE_NOTICE_SUBJECT,
  recipientShowsBillingUnchangedNotice,
  redactEmail,
  type PolicyNoticeAuthRow,
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
  const proEmail = buildPolicyUpdateNoticeEmailContent("Alex", {
    showBillingUnchangedNotice: true,
  });
  const freeEmail = buildPolicyUpdateNoticeEmailContent("Alex", {
    showBillingUnchangedNotice: false,
  });
  const combined = `${proEmail.subject}\n${proEmail.html}\n${proEmail.text}`.toLowerCase();

  it("uses the required subject line", () => {
    expect(proEmail.subject).toBe(POLICY_UPDATE_NOTICE_SUBJECT);
    expect(proEmail.subject).toBe("TrackMyOPT policy update");
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
    expect(combined).toContain(
      "not affiliated with, endorsed by, or operated by uscis"
    );
  });

  it("includes billing unchanged notice for Pro recipients only", () => {
    const notice = "these updates do not change your current plan price";
    expect(`${proEmail.html}\n${proEmail.text}`.toLowerCase()).toContain(notice);
    expect(`${freeEmail.html}\n${freeEmail.text}`.toLowerCase()).not.toContain(notice);
  });

  it("personalizes greeting when first name is provided", () => {
    expect(proEmail.html).toContain("Hi Alex,");
  });

  it("uses branded header with product logo and team sign-off", () => {
    expect(proEmail.html).toContain("trackmyopt.com");
    expect(proEmail.html).toContain("logo.gif");
    expect(proEmail.html).toContain("Policy update");
    expect(proEmail.html).toContain("TrackMyOPT Team");
    expect(proEmail.html).toContain("Review policies");
    expect(proEmail.html).toContain(EMAIL.headerGradient.slice(0, 20));
  });

  it("uses generic greeting when profile first name is missing", () => {
    const generic = buildPolicyUpdateNoticeEmailContent(null);
    expect(generic.html).toContain("Hi,");
    expect(generic.html).not.toContain("Hi null,");
  });
});

describe("policy-update-notice recipient filter", () => {
  const baseRows: PolicyNoticeAuthRow[] = [
    {
      userId: "11111111-1111-1111-1111-111111111111",
      email: "student@university.edu",
      hasProfile: true,
      firstName: "Sam",
      planTier: "free",
    },
    {
      userId: "22222222-2222-2222-2222-222222222222",
      email: "orphan@gmail.com",
      hasProfile: false,
      firstName: null,
      planTier: null,
    },
  ];

  it("flags Pro plan for billing unchanged notice", () => {
    expect(recipientShowsBillingUnchangedNotice("pro")).toBe(true);
    expect(recipientShowsBillingUnchangedNotice("free")).toBe(false);
    expect(recipientShowsBillingUnchangedNotice("dedicated")).toBe(false);
  });

  it("sets showBillingUnchangedNotice only for Pro tier", () => {
    const rows: PolicyNoticeAuthRow[] = [
      {
        userId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        email: "pro@school.edu",
        hasProfile: true,
        firstName: "Pat",
        planTier: "pro",
      },
      {
        userId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        email: "free@school.edu",
        hasProfile: true,
        firstName: "Kim",
        planTier: "free",
      },
    ];
    const result = filterPolicyNoticeRecipients(rows, {
      blockedEmails: new Set(),
      alreadySentEmails: new Set(),
    });
    const proUser = result.eligible.find((r) => r.email === "pro@school.edu");
    const freeUser = result.eligible.find((r) => r.email === "free@school.edu");
    expect(proUser?.showBillingUnchangedNotice).toBe(true);
    expect(freeUser?.showBillingUnchangedNotice).toBe(false);
  });

  it("excludes example and test accounts", () => {
    expect(getRecipientExclusionReason("user@example.com")).toBe("invalid_domain");
    expect(getRecipientExclusionReason("test@company.com")).toBe("test_account");
    expect(getRecipientExclusionReason("dev@startup.io")).toBe("test_account");
  });

  it("allows normal student emails", () => {
    expect(getRecipientExclusionReason("student@university.edu")).toBeNull();
  });

  it("includes active auth user without profile", () => {
    const result = filterPolicyNoticeRecipients(baseRows, {
      blockedEmails: new Set(),
      alreadySentEmails: new Set(),
    });
    expect(result.eligible).toHaveLength(2);
    expect(result.stats.eligibleAuthOnly).toBe(1);
    expect(result.stats.eligibleProfileBacked).toBe(1);
    const authOnly = result.eligible.find((r) => r.email === "orphan@gmail.com");
    expect(authOnly?.firstName).toBeNull();
  });

  it("excludes blocked email", () => {
    const result = filterPolicyNoticeRecipients(baseRows, {
      blockedEmails: new Set(["orphan@gmail.com"]),
      alreadySentEmails: new Set(),
    });
    expect(result.eligible).toHaveLength(1);
    expect(result.stats.excludedBlocked).toBe(1);
  });

  it("excludes internal domain", () => {
    const rows: PolicyNoticeAuthRow[] = [
      {
        userId: "33333333-3333-3333-3333-333333333333",
        email: "staff@zyene.com",
        hasProfile: false,
        firstName: null,
        planTier: null,
      },
    ];
    const result = filterPolicyNoticeRecipients(rows, {
      blockedEmails: new Set(),
      alreadySentEmails: new Set(),
    });
    expect(result.eligible).toHaveLength(0);
    expect(result.stats.excludedInternalOrTest).toBeGreaterThan(0);
  });

  it("skips already-sent notice", () => {
    const result = filterPolicyNoticeRecipients(baseRows, {
      blockedEmails: new Set(),
      alreadySentEmails: new Set(["student@university.edu"]),
    });
    expect(result.eligible).toHaveLength(1);
    expect(result.stats.alreadySentSkipped).toBe(1);
  });

  it("removes duplicate emails preferring profile-backed row", () => {
    const rows: PolicyNoticeAuthRow[] = [
      {
        userId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        email: "dup@gmail.com",
        hasProfile: false,
        firstName: null,
        planTier: null,
      },
      {
        userId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        email: "dup@gmail.com",
        hasProfile: true,
        firstName: "Pat",
        planTier: "pro",
      },
    ];
    const result = filterPolicyNoticeRecipients(rows, {
      blockedEmails: new Set(),
      alreadySentEmails: new Set(),
    });
    expect(result.eligible).toHaveLength(1);
    expect(result.eligible[0]?.userId).toBe("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
    expect(result.eligible[0]?.firstName).toBe("Pat");
    expect(result.stats.duplicateEmailsRemoved).toBe(1);
  });

  it("redacts emails for debug output", () => {
    expect(redactEmail("alex.student@gmail.com")).toBe("a***@gmail.com");
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
