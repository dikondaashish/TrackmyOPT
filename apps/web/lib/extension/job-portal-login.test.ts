// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  fillJobPortalLogin,
  type JobPortalLoginCredential,
} from "../../../extension/src/job-portal-login";
import { runStandaloneJobPortalLoginPrefill } from "../../../extension/src/standalone-job-portal-prefill";

const CREDENTIAL: JobPortalLoginCredential = {
  hostname: "acme.wd5.myworkdayjobs.com",
  email: "Candidate@example.com",
  password: "Application-only!9A",
};

describe("exact-site job-portal login filling", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <form id="login-form">
        <label>Login email
          <input id="login-email" type="email" autocomplete="username" required>
        </label>
        <label>Password
          <input id="password" type="password" autocomplete="new-password" required>
        </label>
        <label>Password (Re-enter)
          <input id="password-confirmation" type="password" autocomplete="new-password" required>
        </label>
        <button id="continue" type="button">Continue to the next page</button>
        <button id="submit" type="submit">Submit application</button>
      </form>
    `;
  });

  it("fills exact login values without clicking or submitting", () => {
    const continueHandler = vi.fn();
    const submitHandler = vi.fn((event: Event) => event.preventDefault());
    document
      .querySelector("#continue")!
      .addEventListener("click", continueHandler);
    document
      .querySelector("#login-form")!
      .addEventListener("submit", submitHandler);

    const result = fillJobPortalLogin(
      document,
      CREDENTIAL,
      "acme.wd5.myworkdayjobs.com"
    );

    expect(result).toEqual({
      emailFilled: 1,
      passwordFilled: 2,
      totalFilled: 3,
    });
    expect(
      document.querySelector<HTMLInputElement>("#login-email")?.value
    ).toBe("Candidate@example.com");
    expect(document.querySelector<HTMLInputElement>("#password")?.value).toBe(
      CREDENTIAL.password
    );
    expect(
      document.querySelector<HTMLInputElement>("#password-confirmation")?.value
    ).toBe(CREDENTIAL.password);
    expect(continueHandler).not.toHaveBeenCalled();
    expect(submitHandler).not.toHaveBeenCalled();
  });

  it("does not fill another hostname or overwrite existing values", () => {
    const email =
      document.querySelector<HTMLInputElement>("#login-email")!;
    email.value = "already-entered@example.com";

    expect(
      fillJobPortalLogin(document, CREDENTIAL, "evil.example.com").totalFilled
    ).toBe(0);
    expect(
      fillJobPortalLogin(
        document,
        CREDENTIAL,
        "acme.wd5.myworkdayjobs.com"
      )
    ).toMatchObject({ emailFilled: 0, passwordFilled: 2 });
    expect(email.value).toBe("already-entered@example.com");
  });

  it("refuses password-change and one-time-code controls", () => {
    document.body.innerHTML = `
      <form>
        <label>Login email <input type="email"></label>
        <label>Current password <input type="password"></label>
        <label>New password <input type="password"></label>
      </form>
      <form>
        <label>OTP <input id="otp" type="password"></label>
      </form>
    `;

    expect(
      fillJobPortalLogin(
        document,
        CREDENTIAL,
        "acme.wd5.myworkdayjobs.com"
      ).totalFilled
    ).toBe(0);
    expect(document.querySelector<HTMLInputElement>("#otp")?.value).toBe("");
  });

  it("fills only positively identified password controls and rejects masked sensitive fields", () => {
    document.body.innerHTML = `
      <form>
        <label>Login email <input id="email" type="email"></label>
        <label>Password <input id="password" type="password"></label>
        <label>Create Password <input id="create-password" type="password"></label>
        <label>Confirm Password <input id="confirm-password" type="password"></label>
        <label>Social Security Number <input id="ssn" name="ssn" type="password"></label>
        <label>Tax ID <input id="tax-id" type="password"></label>
        <label>Bank account number <input id="bank-account" type="password"></label>
        <label>Date of birth <input id="dob" type="password"></label>
        <label>Security answer <input id="security-answer" type="password"></label>
        <label>Authentication code <input id="auth-code" type="password"></label>
        <label>PIN <input id="pin" type="password"></label>
        <input id="ambiguous" name="value" type="password">
      </form>
    `;

    const result = fillJobPortalLogin(
      document,
      CREDENTIAL,
      "acme.wd5.myworkdayjobs.com"
    );

    expect(result).toMatchObject({ emailFilled: 1, passwordFilled: 3 });
    for (const id of ["password", "create-password", "confirm-password"]) {
      expect(document.querySelector<HTMLInputElement>(`#${id}`)?.value).toBe(
        CREDENTIAL.password
      );
    }
    for (const id of [
      "ssn",
      "tax-id",
      "bank-account",
      "dob",
      "security-answer",
      "auth-code",
      "pin",
      "ambiguous",
    ]) {
      expect(document.querySelector<HTMLInputElement>(`#${id}`)?.value).toBe(
        ""
      );
    }
  });

  it("requires Review then Fill on a standalone login page and never submits", async () => {
    document.body.innerHTML = `
      <form id="standalone-login">
        <label>Login email <input id="standalone-email" type="email"></label>
        <label>Password <input id="standalone-password" type="password"></label>
        <label>Masked SSN <input id="standalone-ssn" type="password"></label>
        <button type="submit">Sign in</button>
      </form>
    `;
    const submitHandler = vi.fn((event: Event) => event.preventDefault());
    document
      .querySelector("#standalone-login")!
      .addEventListener("submit", submitHandler);
    const requestCredential = vi.fn().mockResolvedValue({
      ok: true,
      credential: CREDENTIAL,
    });

    expect(
      runStandaloneJobPortalLoginPrefill({
        root: document,
        currentHostname: CREDENTIAL.hostname,
        requestCredential,
      })
    ).toBe("shown");
    expect(requestCredential).not.toHaveBeenCalled();

    const reviewHost = document.querySelector<HTMLElement>(
      "#tmo-job-portal-login-review"
    )!;
    const reviewButton = Array.from(
      reviewHost.shadowRoot!.querySelectorAll("button")
    ).find((button) => button.textContent === "Review saved login")!;
    reviewButton.click();
    await vi.waitFor(() => {
      expect(reviewButton.textContent).toBe("Fill login fields");
    });
    expect(
      document.querySelector<HTMLInputElement>("#standalone-password")?.value
    ).toBe("");

    reviewButton.click();

    expect(
      document.querySelector<HTMLInputElement>("#standalone-email")?.value
    ).toBe(CREDENTIAL.email);
    expect(
      document.querySelector<HTMLInputElement>("#standalone-password")?.value
    ).toBe(CREDENTIAL.password);
    expect(
      document.querySelector<HTMLInputElement>("#standalone-ssn")?.value
    ).toBe("");
    expect(submitHandler).not.toHaveBeenCalled();
  });

  it("mounts credential review inside an employer dialog so outside-click handling cannot close it", () => {
    document.body.innerHTML = `
      <section id="workday-dialog" role="dialog" aria-label="Sign In">
        <form>
          <label>Email Address <input type="email"></label>
          <label>Password <input type="password"></label>
        </form>
      </section>
    `;

    expect(
      runStandaloneJobPortalLoginPrefill({
        root: document,
        currentHostname: CREDENTIAL.hostname,
        requestCredential: vi.fn(),
      })
    ).toBe("shown");

    const employerDialog = document.querySelector("#workday-dialog")!;
    const reviewHost = document.querySelector(
      "#tmo-job-portal-login-review"
    )!;
    expect(employerDialog.contains(reviewHost)).toBe(true);
  });
});
