// Feature Page Service Schema Component with FAQ + Service schemas
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
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: name,
    description: description,
    provider: {
      "@type": "Organization",
      name: "TrackMyOPT",
      url: "https://www.trackmyopt.com",
      logo: {
        "@type": "ImageObject",
        url: "https://www.trackmyopt.com/logo.png",
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
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
