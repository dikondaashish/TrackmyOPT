"use client";

import { useEffect } from "react";

interface CanonicalURLProps {
  url: string;
}

/**
 * Component to add canonical URL to client-side rendered pages
 * Usage: <CanonicalURL url="https://www.trackmyopt.com/page-path" />
 */
export function CanonicalURL({ url }: CanonicalURLProps) {
  useEffect(() => {
    // Remove existing canonical link if it exists
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.remove();
    }

    // Create and add new canonical link
    const link = document.createElement("link");
    link.rel = "canonical";
    link.href = url;
    document.head.appendChild(link);

    return () => {
      link.remove();
    };
  }, [url]);

  return null;
}
