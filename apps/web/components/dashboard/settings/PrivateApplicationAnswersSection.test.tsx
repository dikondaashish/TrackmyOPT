import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PrivateApplicationAnswersSection } from "./PrivateApplicationAnswersSection";

const SAVED_RESPONSE = {
  data: {
    workAuthorization: "yes",
    defaultJobPortalLogin: {
      email: "candidate@example.com",
      password: "Review-only!9A",
    },
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

  it("shows one shared login and discloses cross-portal reuse", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => SAVED_RESPONSE,
      })
    );

    render(<PrivateApplicationAnswersSection />);
    fireEvent.click(
      screen.getByRole("button", { name: /review private answers/i })
    );

    expect(
      await screen.findByRole("heading", {
        name: /default job-portal login/i,
      })
    ).toBeInTheDocument();
    expect(screen.queryByText(/portal login 1/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /add portal login/i })
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/same login.*across all third-party job portals/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/security risk if any one portal is compromised/i)
    ).toBeInTheDocument();
  });

  it("requires an explicit choice before a legacy login becomes the default", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            workAuthorization: "yes",
            legacyJobPortalLogins: [
              {
                hostname: "jobs.example.com",
                email: "candidate@example.com",
                password: "Legacy-only!9A",
              },
            ],
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            workAuthorization: "yes",
            defaultJobPortalLogin: {
              email: "candidate@example.com",
              password: "Legacy-only!9A",
            },
          },
        }),
      });
    vi.stubGlobal("fetch", fetchMock);

    render(<PrivateApplicationAnswersSection />);
    fireEvent.click(
      screen.getByRole("button", { name: /review private answers/i })
    );

    const choose = await screen.findByRole("button", {
      name: /use candidate@example\.com as default/i,
    });
    expect(screen.queryByDisplayValue("Legacy-only!9A")).not.toBeInTheDocument();
    fireEvent.click(choose);
    expect(screen.getAllByDisplayValue("Legacy-only!9A")).toHaveLength(2);

    fireEvent.click(
      screen.getByRole("checkbox", { name: /same saved login.*different/i })
    );
    fireEvent.click(screen.getByRole("button", { name: /save private answers/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const saveInit = fetchMock.mock.calls[1]?.[1] as RequestInit;
    const saved = JSON.parse(String(saveInit.body));
    expect(saved.defaultJobPortalLogin).toEqual({
      email: "candidate@example.com",
      password: "Legacy-only!9A",
    });
    expect(saved).not.toHaveProperty("jobPortalLogins");
    expect(saved).not.toHaveProperty("legacyJobPortalLogins");
  });
});
