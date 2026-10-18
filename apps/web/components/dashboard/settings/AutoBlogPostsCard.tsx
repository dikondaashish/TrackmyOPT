"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Clock, ExternalLink, Loader2, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

export type AutoPost = {
  slug: string;
  title: string;
  publishedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
};

export type Byline = "news_desk" | "vinay_kumar";

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "America/New_York",
});
const formatDate = (iso: string) => dateFormat.format(new Date(iso));

const FOCUS_RING =
  "rounded-md outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900";

async function fetchPosts(): Promise<AutoPost[] | "hidden" | "error"> {
  try {
    const res = await fetch("/api/admin/auto-blog-posts", { credentials: "include", cache: "no-store" });
    if (res.status === 401 || res.status === 403) return "hidden";
    if (!res.ok) return "error";
    const data = (await res.json()) as { posts?: AutoPost[] };
    return data.posts ?? [];
  } catch {
    return "error";
  }
}

function summary(posts: AutoPost[]) {
  const pending = posts.filter((post) => !post.reviewedAt).length;
  return { published: posts.length, pending };
}

/** Admin-only: review automatic policy-news blog posts and set their byline. */
export function AutoBlogPostsCard() {
  const [posts, setPosts] = useState<AutoPost[] | "hidden" | "error" | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [failed, setFailed] = useState<string | null>(null);

  const load = useCallback(async () => setPosts(await fetchPosts()), []);
  useEffect(() => {
    let active = true;
    void fetchPosts().then((next) => {
      if (active) setPosts(next);
    });
    return () => {
      active = false;
    };
  }, []);

  const setByline = async (slug: string, byline: Byline) => {
    setSaving(slug);
    setFailed(null);
    try {
      const res = await fetch("/api/admin/auto-blog-posts", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, byline }),
      });
      if (!res.ok) setFailed(slug);
    } catch {
      setFailed(slug);
    } finally {
      setSaving(null);
      await load();
    }
  };

  if (posts === null || posts === "hidden") return null;

  const counts = posts === "error" ? null : summary(posts);

  return (
    <div id="auto-blog-posts" className="pt-8 border-t border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
        <Newspaper className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden />
        Automatic blog posts
      </h3>
      <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="font-medium text-gray-900 dark:text-gray-100">OPT &amp; STEM OPT policy news</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {counts === null
              ? "Could not load the automatic posts."
              : counts.published === 0
                ? "No automatic posts yet. New government updates are checked every 2 hours."
                : `${counts.published} published · ${counts.pending} waiting for review`}
          </p>
        </div>
        <Button
          variant="outline"
          className="h-10"
          onClick={() => (counts === null ? void load() : setOpen(true))}
        >
          {counts === null ? "Try again" : "Review posts"}
        </Button>
      </div>

      {counts !== null && posts !== "error" && (
        <AutoBlogPostsDialog
          open={open}
          posts={posts}
          saving={saving}
          failed={failed}
          onClose={() => setOpen(false)}
          onByline={(slug, byline) => void setByline(slug, byline)}
        />
      )}
    </div>
  );
}

export function AutoBlogPostsDialog({
  open,
  posts,
  saving,
  failed,
  onClose,
  onByline,
}: {
  open: boolean;
  posts: AutoPost[];
  saving: string | null;
  failed: string | null;
  onClose: () => void;
  onByline: (slug: string, byline: Byline) => void;
}) {
  const { published, pending } = summary(posts);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        className="max-w-2xl rounded-2xl border-gray-200 bg-white p-0 shadow-2xl outline-none focus:outline-none max-md:max-w-[calc(100vw-1.5rem)] dark:border-gray-800 dark:bg-gray-900"
        onClose={onClose}
      >
        <div className="flex items-start gap-4 border-b border-gray-200 px-6 pb-5 pt-6 pr-14 dark:border-gray-800">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
            <Newspaper className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Automatic blog posts
            </DialogTitle>
            <DialogDescription className="mt-1.5 leading-relaxed text-gray-500 dark:text-gray-400">
              New posts go live with the TrackMyOPT News Desk byline. Read a post, then switch it to
              Written by Vinay Kumar to mark it reviewed.
            </DialogDescription>
            {published > 0 && (
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium">
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  {published} published
                </span>
                <span
                  className={
                    pending > 0
                      ? "rounded-full bg-amber-50 px-2.5 py-1 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200"
                      : "rounded-full bg-green-50 px-2.5 py-1 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                  }
                >
                  {pending > 0 ? `${pending} need review` : "All reviewed"}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
          {posts.length === 0 ? (
            <div className="flex flex-col items-center px-4 py-10 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500">
                <Clock className="h-6 w-6" aria-hidden />
              </div>
              <p className="font-medium text-gray-900 dark:text-gray-100">No automatic posts yet</p>
              <p className="mt-1.5 max-w-md text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                Every 2 hours TrackMyOPT checks the Federal Register, USCIS and Study in the States. New
                OPT and STEM OPT updates are published to the blog and appear here for review.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {posts.map((post) => (
                <li
                  key={post.slug}
                  className="rounded-xl border border-gray-200 p-4 dark:border-gray-800"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <a
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`group inline-flex items-start gap-1.5 font-medium text-gray-900 hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400 ${FOCUS_RING}`}
                      >
                        <span className="break-words">{post.title}</span>
                        <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0 text-gray-400 group-hover:text-current" aria-hidden />
                      </a>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <span>Published {formatDate(post.publishedAt)}</span>
                        {post.reviewedAt ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 font-medium text-green-800 dark:bg-green-900/30 dark:text-green-200">
                            <CheckCircle2 className="h-3 w-3" aria-hidden />
                            Reviewed {formatDate(post.reviewedAt)}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                            <Clock className="h-3 w-3" aria-hidden />
                            Needs review
                          </span>
                        )}
                      </div>
                      {failed === post.slug && (
                        <p className="mt-2 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                          <AlertCircle className="h-3.5 w-3.5" aria-hidden /> Could not save. Try again.
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 sm:w-56">
                      <label
                        htmlFor={`byline-${post.slug}`}
                        className="mb-1.5 flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-400"
                      >
                        Byline
                        {saving === post.slug && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-label="Saving" />}
                      </label>
                      <select
                        id={`byline-${post.slug}`}
                        value={post.reviewedAt ? "vinay_kumar" : "news_desk"}
                        disabled={saving !== null}
                        onChange={(event) => onByline(post.slug, event.target.value as Byline)}
                        className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                      >
                        <option value="news_desk">TrackMyOPT News Desk</option>
                        <option value="vinay_kumar">Written by Vinay Kumar</option>
                      </select>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 rounded-b-2xl border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-900/60">
          <a
            href="/blog"
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400 ${FOCUS_RING}`}
          >
            Open the blog <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
          <Button variant="outline" className="h-10" onClick={onClose}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
