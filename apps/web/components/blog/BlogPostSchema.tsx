// Blog Post Schema Component with FAQ + Article schemas
interface BlogPostSchemaProps {
  title?: string | null | { toString(): string };
  description?: string | null | { toString(): string };
  publishedDate: string;
  modifiedDate: string;
  author?: string;
  faqItems?: Array<{
    question: string;
    answer: string;
  }>;
}

export function BlogPostSchema({
  title = "TrackMyOPT Blog",
  description = "Read our latest insights on OPT, H-1B, and F-1 visa information",
  publishedDate,
  modifiedDate,
  author = "TrackMyOPT",
  faqItems = [],
}: BlogPostSchemaProps) {
  const safeTitle = typeof title === 'string' || (title && typeof title.toString === 'function') ? String(title) : "TrackMyOPT Blog";
  const safeDescription = typeof description === 'string' || (description && typeof description.toString === 'function') ? String(description) : "Read our latest insights on OPT, H-1B, and F-1 visa information";
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: safeTitle,
    description: safeDescription,
    datePublished: publishedDate,
    dateModified: modifiedDate,
    author: {
      "@type": "Organization",
      name: author,
      logo: {
        "@type": "ImageObject",
        url: "https://www.trackmyopt.com/logo.png",
        width: 256,
        height: 256,
      },
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
    </>
  );
}
