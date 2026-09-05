"use client";

import { Heart } from "lucide-react";
import { requestOpenPrivacyChoices } from "@/lib/cookie-consent";
import { useClientYear } from "@/hooks/useClientDate";

const linkClass =
  "inline-flex min-h-[44px] items-center text-base text-gray-600 transition-colors hover:text-gray-900 max-md:py-1 md:min-h-0 md:inline md:text-sm dark:text-gray-400 dark:hover:text-white";

export function PrivacyChoicesButton() {
  return (
    <button type="button" onClick={requestOpenPrivacyChoices} className={linkClass}>
      Privacy choices
    </button>
  );
}

export function FooterCopyright() {
  // ponytail: useClientYear — null on SSR/hydration so © year text cannot mismatch (#418).
  const currentYear = useClientYear();
  return (
    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center md:justify-start gap-1">
      © {currentYear ?? ""} TrackMyOPT. Made with{" "}
      <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" aria-hidden /> for
      international students.
    </p>
  );
}
