"use client";

import { Heart } from "lucide-react";
import { PrivacySettingsLink } from "@/components/privacy/PrivacySettingsLink";
import { useClientYear } from "@/hooks/useClientDate";

const linkClass =
  "inline-flex min-h-[44px] items-center text-base text-ink-muted transition-colors hover:text-white max-md:py-1 md:min-h-0 md:inline md:text-sm";

export function PrivacyChoicesButton() {
  return (
    <PrivacySettingsLink className={linkClass} />
  );
}

export function FooterCopyright() {
  // ponytail: useClientYear — null on SSR/hydration so © year text cannot mismatch (#418).
  const currentYear = useClientYear();
  return (
    <p className="text-sm text-ink-muted flex items-center justify-center md:justify-start gap-1">
      © {currentYear ?? ""} TrackMyOPT. Made with{" "}
      <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" aria-hidden /> for
      international students.
    </p>
  );
}
