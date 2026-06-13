import { describe, expect, it } from "vitest";
import { WELCOME_FREE_RESEND_DEFAULT_BATCH } from "./welcome-free-resend";

describe("welcome-free-resend constants", () => {
  it("uses a conservative default batch size", () => {
    expect(WELCOME_FREE_RESEND_DEFAULT_BATCH).toBe(25);
  });
});
