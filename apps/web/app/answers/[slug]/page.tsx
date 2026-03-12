import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, CheckCircle2 } from "lucide-react";
import { answers, type AnswerPageData, type FAQItem } from "../data";

// Generate static params for all 50 answers
export async function generateStaticParams() {
  return Object.keys(answers).map((slug) => ({
    slug,
  }));
}

// Generate metadata for each answer
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const answerData = answers[params.slug];

  if (!answerData) {
    return {};
  }

  return {
    title: `${answerData.question} | TrackMyOPT Answers`,
    description: answerData.shortAnswer,
    openGraph: {
      title: answerData.question,
      description: answerData.shortAnswer,
      type: "article",
      publishedTime: answerData.lastUpdated,
      authors: ["TrackMyOPT"],
      url: `https://www.trackmyopt.com/answers/${answerData.slug}`,
    },
    alternates: {
      canonical: `https://www.trackmyopt.com/answers/${answerData.slug}`,
    },
  };
}

// Schema generation functions
function generateFAQSchema(data: AnswerPageData) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: data.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: data.shortAnswer,
        },
      },
      ...data.faqItems.map((item: FAQItem) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    ],
  };
}

function generateArticleSchema(data: AnswerPageData) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: data.question,
    description: data.shortAnswer,
    datePublished: data.lastUpdated,
    dateModified: data.lastUpdated,
    author: {
      "@type": "Organization",
      name: "TrackMyOPT",
      logo: {
        "@type": "ImageObject",
        url: "https://www.trackmyopt.com/logo.png",
      },
    },
    publisher: {
      "@type": "Organization",
      name: "TrackMyOPT",
      logo: {
        "@type": "ImageObject",
        url: "https://www.trackmyopt.com/logo.png",
      },
    },
    isPartOf: {
      "@type": "WebSite",
      name: "TrackMyOPT",
      url: "https://www.trackmyopt.com",
    },
  };
}

function generateSpeakableSchema(data: AnswerPageData) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [".answer-text"],
    },
  };
}

export default function AnswerPage({ params }: { params: { slug: string } }) {
  const answerData = answers[params.slug];

  if (!answerData) {
    notFound();
  }

  const faqSchema = generateFAQSchema(answerData);
  const articleSchema = generateArticleSchema(answerData);
  const speakableSchema = generateSpeakableSchema(answerData);

  const categoryColors: Record<string, string> = {
    "opt-basics": "bg-blue-100 text-blue-800",
    "stem-opt": "bg-green-100 text-green-800",
    "tax-finance": "bg-purple-100 text-purple-800",
    health: "bg-red-100 text-red-800",
    career: "bg-orange-100 text-orange-800",
    h1b: "bg-indigo-100 text-indigo-800",
  };

  const categoryLabel: Record<string, string> = {
    "opt-basics": "OPT Basics",
    "stem-opt": "STEM OPT",
    "tax-finance": "Tax & Finance",
    health: "Health",
    career: "Career",
    h1b: "H-1B",
  };

  return (
    <>
      {/* Schema Scripts */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableSchema) }}
      />

      {/* Breadcrumb Navigation */}
      <nav className="mb-8 flex items-center gap-2 text-sm text-gray-600">
        <Link href="/" className="hover:text-blue-600 transition-colors">
          Home
        </Link>
        <ChevronRight className="h-4 w-4 text-gray-400" />
        <Link href="/answers" className="hover:text-blue-600 transition-colors">
          Answers
        </Link>
        <ChevronRight className="h-4 w-4 text-gray-400" />
        <span className="text-gray-900 font-medium">{answerData.question}</span>
      </nav>

      {/* Category Badge */}
      <div className="mb-6">
        <span
          className={`inline-block px-4 py-1.5 rounded-full text-xs font-semibold ${categoryColors[answerData.category]}`}
        >
          {categoryLabel[answerData.category]}
        </span>
      </div>

      {/* Main Heading */}
      <h1 className="mb-8 text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
        {answerData.question}
      </h1>

      {/* Quick Answer Box (AI-Extract Friendly) */}
      <div className="mb-10 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 p-8 border-l-4 border-blue-500 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-blue-700 mb-3">
          ⚡ Quick Answer
        </p>
        <p className="answer-text text-lg text-gray-800 leading-relaxed font-medium">
          {answerData.shortAnswer}
        </p>
      </div>

      {/* Detailed Explanation Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          ℹ️ Detailed Explanation
        </h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          The quick answer above is what AI models and search engines cite most frequently. Below, we provide additional context and details to help you fully understand this topic.
        </p>
      </div>

      {/* FAQ Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          ❓ Related Questions
        </h2>
        <div className="space-y-6">
          {answerData.faqItems.map((item: FAQItem, index: number) => (
            <details
              key={index}
              className="group border rounded-lg p-5 hover:border-blue-300 transition-colors"
            >
              <summary className="cursor-pointer font-semibold text-gray-900 hover:text-blue-600 transition-colors flex items-center justify-between">
                <span>{item.question}</span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <p className="mt-4 text-gray-700 leading-relaxed">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>

      {/* Related Content Links */}
      {(answerData.relatedBlogPost || answerData.relatedFeaturePage) && (
        <div className="mb-12 rounded-xl bg-gray-50 p-8 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-6">
            📚 Related Resources
          </h3>
          <div className="space-y-3">
            {answerData.relatedBlogPost && (
              <Link
                href={`/blog/${answerData.relatedBlogPost}`}
                className="flex items-center gap-3 text-blue-600 hover:text-blue-700 font-medium group"
              >
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Read our in-depth guide on this topic
                <span className="ml-auto text-gray-400 group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </Link>
            )}
            {answerData.relatedFeaturePage && (
              <Link
                href={answerData.relatedFeaturePage}
                className="flex items-center gap-3 text-blue-600 hover:text-blue-700 font-medium group"
              >
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Try our {answerData.relatedFeaturePage.split("/").pop()} tool
                <span className="ml-auto text-gray-400 group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Updated Date */}
      <div className="text-xs text-gray-500 mb-8">
        Last updated: {new Date(answerData.lastUpdated).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </div>

      {/* CTA Section */}
      <div className="mt-16 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 p-10 text-white text-center shadow-lg hover:shadow-xl transition-shadow">
        <h3 className="text-3xl font-bold mb-3">
          Stop Manual OPT Tracking
        </h3>
        <p className="mb-8 text-blue-100 text-lg">
          TrackMyOPT automatically calculates deadlines, unemployment days, and reminders. Join 2,500+ F-1 students already tracking their OPT status.
        </p>
        <div className="flex gap-4 flex-col sm:flex-row justify-center">
          <Link
            href="https://app.trackmyopt.com/signup"
            className="inline-block bg-white text-blue-600 font-bold px-8 py-4 rounded-lg hover:bg-blue-50 transition-colors shadow-md hover:shadow-lg"
          >
            Start Your Free Account →
          </Link>
          <Link
            href="/features/case-status"
            className="inline-block border-2 border-white text-white font-bold px-8 py-4 rounded-lg hover:bg-white/10 transition-colors"
          >
            See Features
          </Link>
        </div>
      </div>
    </>
  );
}
