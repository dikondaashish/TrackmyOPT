import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PrivateApplicationAnswersSection } from "./PrivateApplicationAnswersSection";

const SAVED_RESPONSE = {
  data: {
    workAuthorization: "yes",
    jobPortalLogins: [
      {
        hostname: "jobs.example.com",
        email: "candidate@example.com",
        password: "Review-only!9A",
      },
    ],
  },
};

describe("PrivateApplicationAnswersSection secret lifecycle", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("does not fetch/decrypt until Review is clicked and clears plaintext on Hide", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => SAVED_RESPONSE,
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<PrivateApplicationAnswersSection />);

    expect(fetchMock).not.toHaveBeenCalled();
    fireEvent.click(
      screen.getByRole("button", { name: /review private answers/i })
    );

    await screen.findByRole("button", { name: /hide answers/i });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(screen.getAllByDisplayValue("Review-only!9A")).toHaveLength(2);

    fireEvent.click(
      screen.getByRole("button", { name: /hide answers/i })
    );
    expect(screen.queryAllByDisplayValue("Review-only!9A")).toHaveLength(0);

    fireEvent.click(
      screen.getByRole("button", { name: /review private answers/i })
    );
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });

  it("aborts an in-flight secret request when the component unmounts", () => {
    let requestSignal: AbortSignal | undefined;
    const fetchMock = vi.fn(
      (_input: RequestInfo | URL, init?: RequestInit) => {
        requestSignal = init?.signal ?? undefined;
        return new Promise<Response>(() => {});
      }
    );
    vi.stubGlobal("fetch", fetchMock);

    const view = render(<PrivateApplicationAnswersSection />);
    fireEvent.click(
      screen.getByRole("button", { name: /review private answers/i })
    );
    expect(requestSignal?.aborted).toBe(false);

    view.unmount();
    expect(requestSignal?.aborted).toBe(true);
  });
});
