import { describe, expect, it } from "vitest";
import {
  D1_ACTIVATION_NUDGE_DELAY_HOURS,
  D1_ACTIVATION_NUDGE_EMAIL_TYPE,
} from "./d1-activation-nudge";

describe("d1-activation-nudge Phase 4 targeting", () => {
  it("uses a 24h signup delay and stable email type", () => {
    expect(D1_ACTIVATION_NUDGE_DELAY_HOURS).toBe(24);
    expect(D1_ACTIVATION_NUDGE_EMAIL_TYPE).toBe("d1_activation_nudge");
  });
});
