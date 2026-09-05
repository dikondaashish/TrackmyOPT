import type { Metadata } from "next";

const SITE = "https://www.trackmyopt.com";
const DEFAULT_OG = "/og-image.jpg";

type BlogMetaInput = {
  title: string;
  description: string;
  /** Path after /blog/ or full path starting with /blog/ */
  slugOrPath: string;
  image?: string;
  keywords?: string[];
};

/** Shared blog metadata: canonical + Open Graph + Twitter in sync. */
export function createBlogMetadata({
  title,
  description,
  slugOrPath,
  image = DEFAULT_OG,
  keywords,
}: BlogMetaInput): Metadata {
  const path = slugOrPath.startsWith("/blog/")
    ? slugOrPath
    : `/blog/${slugOrPath.replace(/^\/+/, "")}`;
  const url = `${SITE}${path}`;
  const imageUrl = image.startsWith("http") ? image : image;

  return {
    title,
    description,
    ...(keywords ? { keywords } : {}),
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "TrackMyOPT",
      type: "article",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}
