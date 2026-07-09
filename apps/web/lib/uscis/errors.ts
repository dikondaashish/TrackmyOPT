export class UnauthorizedReceiptLookupError extends Error {
  readonly code = "UNAUTHORIZED_RECEIPT_LOOKUP";

  constructor(
    message = "Receipt number is not enrolled for this user; USCIS lookup blocked."
  ) {
    super(message);
    this.name = "UnauthorizedReceiptLookupError";
  }
}

export { NearbyScanDisabledError } from "@/lib/uscis/nearby-scan";
