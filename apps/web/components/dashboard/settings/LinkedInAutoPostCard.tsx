"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2, ExternalLink, Linkedin, Loader2, RefreshCw, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toggle } from "./SettingsToggle";

type Connection = {
  organizationUrn: string;
  organizationName: string | null;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string | null;
  hasRefreshToken: boolean;
  connectedByEmail: string;
  autoPublish: boolean;
  enabled: boolean;
};

type Draft = {
  postDate: string;
  status: "draft" | "publishing" | "published" | "failed";
  commentary: string;
  items: unknown[];
  shownCount: number;
  errorCode: string | null;
  publishedAt: string | null;
};

type RecentPost = {
  postDate: string;
  status: Draft["status"];
  shownCount: number;
  totalCount: number;
  errorCode: string | null;
  postUrl: string | null;
};

type Status = {
  configured: boolean;
  reconnectSoon: boolean;
  today: string;
  connection: Connection | null;
  draft: Draft | null;
  recent: RecentPost[];
};

const OUTCOME_MESSAGES: Record<string, { ok: boolean; text: string }> = {
  connected: { ok: true, text: "LinkedIn page connected." },
  cancelled: { ok: false, text: "LinkedIn sign-in was cancelled." },
  state_mismatch: { ok: false, text: "The sign-in link expired. Please click Connect again." },
  not_configured: { ok: false, text: "LinkedIn app keys are not set in Vercel yet." },
  no_admin_page: { ok: false, text: "This LinkedIn account is not a super admin of any company page." },
  choose_page: {
    ok: false,
    text: "You administer several pages. Set LINKEDIN_ORGANIZATION_ID in Vercel to the TrackMyOPT page ID, then connect again.",
  },
  connect_failed: { ok: false, text: "LinkedIn did not accept the connection. Please try again." },
};

const ERROR_MESSAGES: Record<string, string> = {
  not_connected: "Connect the LinkedIn page first.",
  reconnect_required: "LinkedIn access expired. Click Reconnect.",
  already_publishing: "This post is already being published.",
  no_jobs_found: "No new matching jobs were found in the last 3 days.",
  not_configured: "LinkedIn app keys are not set in Vercel yet.",
  post_unauthorized: "LinkedIn refused the post. Reconnect the page and try again.",
};

function errorText(code: string | null | undefined): string {
  return (code && ERROR_MESSAGES[code]) || "Something went wrong. We've been notified.";
}

function shortDate(value: string | null): string {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** Null for non-admins (403) and on any failure, which hides the card. */
async function fetchStatus(): Promise<Status | null> {
  try {
    const res = await fetch("/api/admin/linkedin", { credentials: "include", cache: "no-store" });
    return res.ok ? ((await res.json()) as Status) : null;
  } catch {
    return null;
  }
}

const STATUS_STYLES: Record<Draft["status"], string> = {
  draft: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  publishing: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
  published: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200",
  failed: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
};

/**
 * Admin-only: connects the TrackMyOPT LinkedIn company page and manages the
 * daily jobs post. Renders nothing for everyone else (the API answers 403).
 */
export function LinkedInAutoPostCard() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status | null>(null);
  const [busy, setBusy] = useState<"draft" | "publish" | "settings" | "disconnect" | null>(null);
  // The connect callback returns here with ?linkedin=<outcome>.
  const outcome = searchParams.get("linkedin");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    () => (outcome && OUTCOME_MESSAGES[outcome]) || null
  );

  const load = useCallback(() => fetchStatus().then(setStatus), []);

  useEffect(() => {
    let active = true;
    void fetchStatus().then((next) => {
      if (active) setStatus(next);
    });
    return () => {
      active = false;
    };
  }, []);

  const act = async (action: "draft" | "publish" | "settings" | "disconnect", extra: Record<string, unknown> = {}) => {
    setBusy(action);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/linkedin", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; postUrl?: string | null };
      if (!res.ok || !data.ok) {
        setMessage({ ok: false, text: errorText(data.error) });
      } else if (action === "publish") {
        setMessage({ ok: true, text: "Posted to LinkedIn." });
      } else if (action === "draft") {
        setMessage({ ok: true, text: "Today's preview is ready." });
      }
    } catch {
      setMessage({ ok: false, text: errorText(null) });
    } finally {
      setBusy(null);
      await load();
    }
  };

  if (!status) return null;

  const { connection, draft } = status;
  const reconnectSoon = status.reconnectSoon;
  const canPublish = Boolean(connection) && draft?.status !== "published" && draft?.status !== "publishing";

  return (
    <div id="linkedin" className="pt-8 border-t border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-2">
        <Linkedin className="w-5 h-5 text-[#0A66C2]" aria-hidden />
        LinkedIn daily jobs post
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Every day at 2:30 PM ET, the TrackMyOPT company page gets a post with fresh Software, Data &amp; AI,
        Cybersecurity and Networking jobs.
      </p>

      {message && (
        <div
          className={`mb-4 flex items-start gap-2 rounded-xl p-3 text-sm ${
            message.ok
              ? "bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-200"
              : "bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-200"
          }`}
        >
          {message.ok ? <CheckCircle2 className="w-4 h-4 mt-0.5" /> : <AlertCircle className="w-4 h-4 mt-0.5" />}
          {message.text}
        </div>
      )}

      {!status.configured && (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-sm text-amber-900 dark:text-amber-100">
          Add LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET and LINKEDIN_TOKEN_ENCRYPTION_KEY in Vercel, then redeploy.
        </div>
      )}

      {status.configured && !connection && (
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">Not connected</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Sign in with the LinkedIn account that is a super admin of the TrackMyOPT page.
            </p>
          </div>
          <Button asChild className="h-10 bg-[#0A66C2] hover:bg-[#004182] text-white">
            <a href="/api/admin/linkedin/connect">Connect LinkedIn</a>
          </Button>
        </div>
      )}

      {connection && (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                Connected: {connection.organizationName || connection.organizationUrn}
              </p>
              <p className={`text-sm ${reconnectSoon ? "text-red-600 dark:text-red-400" : "text-gray-500 dark:text-gray-400"}`}>
                {connection.hasRefreshToken
                  ? `Renews automatically until ${shortDate(connection.refreshTokenExpiresAt)}`
                  : `Access expires ${shortDate(connection.accessTokenExpiresAt)} — reconnect before then`}
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" className="h-10">
                <a href="/api/admin/linkedin/connect">Reconnect</a>
              </Button>
              <Button
                variant="outline"
                className="h-10"
                disabled={busy !== null}
                onClick={() => {
                  if (window.confirm("Disconnect the LinkedIn page? Daily posts stop until you connect again.")) {
                    void act("disconnect");
                  }
                }}
              >
                Disconnect
              </Button>
            </div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Daily post</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Turn off to pause all daily posts.</p>
              </div>
              <Toggle
                enabled={connection.enabled}
                onToggle={() => void act("settings", { enabled: !connection.enabled })}
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Publish automatically</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Off: a preview is ready at 2:30 PM ET and you click Publish. On: it posts by itself.
                </p>
              </div>
              <Toggle
                enabled={connection.autoPublish}
                onToggle={() => void act("settings", { autoPublish: !connection.autoPublish })}
              />
            </div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900 dark:text-gray-100">Today ({status.today})</p>
                {draft && (
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[draft.status]}`}>
                    {draft.status}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  className="h-9"
                  disabled={busy !== null || draft?.status === "published" || draft?.status === "publishing"}
                  onClick={() => void act("draft")}
                >
                  {busy === "draft" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                  {draft ? "Refresh preview" : "Build preview"}
                </Button>
                <Button
                  className="h-9 bg-[#0A66C2] hover:bg-[#004182] text-white"
                  disabled={busy !== null || !canPublish}
                  onClick={() => {
                    if (window.confirm("Publish today's post to the TrackMyOPT LinkedIn page now?")) void act("publish");
                  }}
                >
                  {busy === "publish" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                  Publish now
                </Button>
              </div>
            </div>

            {draft ? (
              <>
                {draft.status === "failed" && (
                  <p className="mb-2 text-sm text-red-600 dark:text-red-400">{errorText(draft.errorCode)}</p>
                )}
                <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200">
                  {draft.commentary.replace(/\\([\\|{}@[\]()<>#*_~])/g, "$1")}
                </pre>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {draft.shownCount} of {draft.items.length} jobs fit in the post · {draft.commentary.length}/3000
                  characters ·{" "}
                  <a
                    href={`/opt-jobs/${draft.postDate}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline dark:text-blue-400"
                  >
                    daily page
                  </a>
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No post yet today. Build a preview to see it now, or wait for 2:30 PM ET.
              </p>
            )}
          </div>

          {status.recent.length > 0 && (
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
              <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">Last 7 days</p>
              <ul className="space-y-1 text-sm">
                {status.recent.map((post) => (
                  <li key={post.postDate} className="flex flex-wrap items-center gap-2 text-gray-600 dark:text-gray-300">
                    <span className="w-24 shrink-0">{post.postDate}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[post.status]}`}>
                      {post.status}
                    </span>
                    <span>
                      {post.shownCount}/{post.totalCount} jobs
                    </span>
                    {post.postUrl && (
                      <a
                        href={post.postUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400"
                      >
                        View <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
