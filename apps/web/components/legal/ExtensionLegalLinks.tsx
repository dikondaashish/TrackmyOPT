import Link from "next/link";

export function ExtensionLegalLinks({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs text-muted-foreground ${className}`}>
      <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
        Privacy Policy
      </Link>
      {" · "}
      <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">
        Terms
      </Link>
      {" · "}
      <Link href="/disclaimer" className="underline underline-offset-2 hover:text-foreground">
        Disclaimer
      </Link>
      {" · "}
      <Link href="/cookie-policy" className="underline underline-offset-2 hover:text-foreground">
        Cookie Policy
      </Link>
    </p>
  );
}
