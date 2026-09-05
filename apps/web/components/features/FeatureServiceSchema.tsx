// Feature Page Service Schema Component with FAQ + Service schemas
// Uses safeSerializeJsonLd — malformed props never crash SSR or client render.

import { safeSerializeJsonLd } from "@/lib/safe-json-ld";
import { LOGO_URL } from "@/lib/seo-schemas";

interface FeatureServiceSchemaProps {
  name: string;
  description: string;
  faqItems?: Array<{
    question: string;
    answer: string;
  }>;
  featurePath?: string;
}

export function FeatureServiceSchema({
  name,
  description,
  faqItems = [],
  featurePath = "/features",
}: FeatureServiceSchemaProps) {
  void featurePath; // reserved for future use

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    provider: {
      "@type": "Organization",
      name: "TrackMyOPT",
      url: "https://www.trackmyopt.com",
      logo: {
        "@type": "ImageObject",
        url: LOGO_URL,
        width: 256,
        height: 256,
      },
    },
    areaServed: {
      "@type": "Country",
      name: "US",
    },
    isPartOf: {
      "@type": "SoftwareApplication",
      name: "TrackMyOPT",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
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

  const serviceSerialized = safeSerializeJsonLd(serviceSchema);
  const faqSerialized = faqSchema ? safeSerializeJsonLd(faqSchema) : null;

  return (
    <>
      {serviceSerialized && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serviceSerialized }}
        />
      )}
      {faqSerialized && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: faqSerialized }}
        />
      )}
    </>
  );
}
