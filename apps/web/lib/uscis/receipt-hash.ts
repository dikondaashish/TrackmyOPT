import { createHash } from "crypto";

export function normalizeReceiptNumber(receipt: string): string {
  return receipt.trim().toUpperCase();
}

export function hashReceiptNumber(receipt: string): string {
  return createHash("sha256")
    .update(normalizeReceiptNumber(receipt))
    .digest("hex");
}
