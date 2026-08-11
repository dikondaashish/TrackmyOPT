// Blog Post Schema Component with FAQ + HowTo + Article schemas
// Uses safeSerializeJsonLd — malformed props never crash SSR or client render.

import { safeSerializeJsonLd } from "@/lib/safe-json-ld";

interface BlogPostSchemaProps {
  title?: string | null | { toString(): string };
  description?: string | null | { toString(): string };
  publishedDate: string;
  modifiedDate: string;
  author?: string;
  /** Full canonical URL for this blog post (enables url + mainEntityOfPage in schema). */
  canonicalUrl?: string;
  /** Absolute 1200x630 article image URL. */
  imageUrl?: string;
  faqItems?: Array<{
    question: string;
    answer: string;
  }>;
  howToItems?: Array<{
    step: number;
    name: string;
    url: string;
    image: string;
  }>;
}

export function BlogPostSchema({
  title = "TrackMyOPT Blog",
  description = "Read our latest insights on OPT, H-1B, and F-1 visa information",
  publishedDate,
  modifiedDate,
  author = "Vinay Kumar",
  canonicalUrl,
  imageUrl = "https://www.trackmyopt.com/og-image.png",
  faqItems = [],
  howToItems = [],
}: BlogPostSchemaProps) {
  const safeTitle =
    typeof title === "string" || (title && typeof title.toString === "function")
      ? String(title)
      : "TrackMyOPT Blog";
  const safeDescription =
    typeof description === "string" ||
    (description && typeof description.toString === "function")
      ? String(description)
      : "Read our latest insights on OPT, H-1B, and F-1 visa information";

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: safeTitle,
    description: safeDescription,
    ...(canonicalUrl
      ? {
          url: canonicalUrl,
          mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
          image: imageUrl,
        }
      : {}),
    datePublished: publishedDate,
    dateModified: modifiedDate,
    author: {
      "@type": "Person",
      name: author,
      jobTitle: "Content Writer",
      worksFor: {
        "@type": "Organization",
        name: "Zyene Inc",
      },
      sameAs: [
        "https://www.linkedin.com/company/trackmyopt",
        "https://www.trackmyopt.com/about",
      ],
    },
    publisher: {
      "@type": "Organization",
      name: "TrackMyOPT",
      logo: {
        "@type": "ImageObject",
        url: "https://www.trackmyopt.com/logo.png",
        width: 256,
        height: 256,
      },
    },
    isPartOf: {
      "@type": "WebSite",
      name: "TrackMyOPT",
      url: "https://www.trackmyopt.com",
    },
  };

  const faqSchema =
    faqItems.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        }
      : null;

  const howToSchema =
    howToItems.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: safeTitle,
          description: safeDescription,
          image: imageUrl,
          step: howToItems.map((item) => ({
            "@type": "HowToStep",
            position: item.step,
            name: item.name,
            url: item.url,
            image: item.image,
          })),
        }
      : null;

  const articleSerialized = safeSerializeJsonLd(articleSchema);
  const faqSerialized = faqSchema ? safeSerializeJsonLd(faqSchema) : null;
  const howToSerialized = howToSchema ? safeSerializeJsonLd(howToSchema) : null;

  return (
    <>
      {articleSerialized && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: articleSerialized }}
        />
      )}
      {faqSerialized && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: faqSerialized }}
        />
      )}
      {howToSerialized && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: howToSerialized }}
        />
      )}
    </>
  );
}
