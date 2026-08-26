// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import {
  NPS_REQUEST_EVENT,
  requestNpsSurvey,
  type NpsRequest,
} from "@/lib/posthog/nps-survey";

describe("requestNpsSurvey", () => {
  it("dispatches only a typed success-milestone request", () => {
    let received: NpsRequest | null = null;
    const listener = (event: Event) => {
      received = (event as CustomEvent<NpsRequest>).detail;
    };
    window.addEventListener(NPS_REQUEST_EVENT, listener);

    requestNpsSurvey({
      trigger: "resume_downloaded",
      planTier: "pro",
    });

    window.removeEventListener(NPS_REQUEST_EVENT, listener);
    expect(received).toEqual({
      trigger: "resume_downloaded",
      planTier: "pro",
    });
  });
});
