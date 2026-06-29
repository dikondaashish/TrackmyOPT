/**
 * BreadcrumbSchema Component
 * Renders JSON-LD BreadcrumbList schema for SEO.
 * Uses safeSerializeJsonLd so malformed props never crash the page.
 */

import { safeSerializeJsonLd } from "@/lib/safe-json-ld";

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  const serialized = safeSerializeJsonLd(schema);
  if (!serialized) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serialized }}
    />
  );
}
