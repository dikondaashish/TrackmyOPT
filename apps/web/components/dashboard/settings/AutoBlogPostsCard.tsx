"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, ExternalLink, Loader2, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type AutoPost = {
  slug: string;
  title: string;
  publishedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
};

type Byline = "news_desk" | "vinay_kumar";

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "America/New_York",
});

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

  const pending = posts === "error" ? 0 : posts.filter((post) => !post.reviewedAt).length;

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
            {posts === "error"
              ? "Could not load the automatic posts."
              : posts.length === 0
                ? "No automatic posts yet."
                : `${posts.length} published · ${pending} waiting for review`}
          </p>
        </div>
        <Button
          variant="outline"
          className="h-10"
          onClick={() => (posts === "error" ? void load() : setOpen(true))}
        >
          {posts === "error" ? "Try again" : "Review posts"}
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-h-[85vh] max-w-3xl overflow-y-auto border border-gray-200 bg-white max-md:max-w-[calc(100vw-1.5rem)] dark:border-gray-800 dark:bg-gray-900"
          onClose={() => setOpen(false)}
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Automatic blog posts</DialogTitle>
            <DialogDescription>
              New posts are published with the TrackMyOPT News Desk byline. After you have read a post and
              confirmed it is accurate, choose &ldquo;Written by Vinay Kumar&rdquo; to give it Vinay&rsquo;s
              byline and the &ldquo;reviewed for accuracy&rdquo; author box.
            </DialogDescription>
          </DialogHeader>

          {posts !== "error" && posts.length === 0 && (
            <p className="py-6 text-sm text-gray-500 dark:text-gray-400">No automatic posts yet.</p>
          )}

          <ul className="mt-4 divide-y divide-gray-200 dark:divide-gray-800">
            {posts !== "error" &&
              posts.map((post) => (
                <li key={post.slug} className="py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <a
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 dark:text-blue-400 hover:underline inline-flex items-start gap-1"
                    >
                      <span className="break-words">{post.title}</span>
                      <ExternalLink className="w-4 h-4 mt-0.5 shrink-0" aria-hidden />
                    </a>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Published {dateFormat.format(new Date(post.publishedAt))}
                      {post.reviewedAt && ` · Reviewed ${dateFormat.format(new Date(post.reviewedAt))}`}
                    </p>
                    {failed === post.slug && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" aria-hidden /> Could not save. Try again.
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {saving === post.slug && <Loader2 className="w-4 h-4 animate-spin text-gray-400" aria-hidden />}
                    <label className="sr-only" htmlFor={`byline-${post.slug}`}>
                      Byline for {post.title}
                    </label>
                    <select
                      id={`byline-${post.slug}`}
                      value={post.reviewedAt ? "vinay_kumar" : "news_desk"}
                      disabled={saving !== null}
                      onChange={(event) => void setByline(post.slug, event.target.value as Byline)}
                      className="h-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="news_desk">TrackMyOPT News Desk</option>
                      <option value="vinay_kumar">Written by Vinay Kumar</option>
                    </select>
                  </div>
                </li>
              ))}
          </ul>
        </DialogContent>
      </Dialog>
    </div>
  );
}
