"use client";

/**
 * Forgot-passcode self-service flow (ISS-020).
 *
 * Step 1: request an OTP to the user's verified email.
 * Step 2: enter the OTP + a new passcode. On success, the existing vault
 *         contents are wiped (documented in the email + below) and a new
 *         passcode is set.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Step = "request" | "verify" | "done";

export default function ForgotPasscodePage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>("request");
    const [maskedEmail, setMaskedEmail] = useState<string | null>(null);
    const [otp, setOtp] = useState("");
    const [newPasscode, setNewPasscode] = useState("");
    const [confirmPasscode, setConfirmPasscode] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [acknowledgedWipe, setAcknowledgedWipe] = useState(false);

    async function sendOtp() {
        setError(null);
        setIsSending(true);
        try {
            const res = await fetch("/api/documents/passcode/forgot/send-otp", {
                method: "POST",
                credentials: "include",
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Could not send code");
                return;
            }
            setMaskedEmail(data.email || null);
            setStep("verify");
        } catch (e) {
            setError(e instanceof Error ? e.message : "Network error");
        } finally {
            setIsSending(false);
        }
    }

    async function verifyAndReset() {
        setError(null);
        if (!/^\d{6}$/.test(otp)) {
            setError("Enter the 6-digit code from email.");
            return;
        }
        if (!/^\d{6}$/.test(newPasscode)) {
            setError("New passcode must be exactly 6 digits.");
            return;
        }
        if (newPasscode !== confirmPasscode) {
            setError("Passcode and confirmation don't match.");
            return;
        }
        if (!acknowledgedWipe) {
            setError("Please acknowledge the vault reset.");
            return;
        }
        setIsSending(true);
        try {
            const res = await fetch("/api/documents/passcode/forgot/verify-otp", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ otp, newPasscode }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Could not reset passcode");
                return;
            }
            setStep("done");
            setTimeout(() => router.push("/dashboard/documents"), 1500);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Network error");
        } finally {
            setIsSending(false);
        }
    }

    return (
        <div className="max-w-md mx-auto py-10 px-4 space-y-6" role="main" aria-labelledby="forgot-title">
            <h1 id="forgot-title" className="text-2xl font-bold text-gray-900 dark:text-foreground">
                Reset Document Vault Passcode
            </h1>

            {step === "request" && (
                <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-muted-foreground">
                        We'll email you a 6-digit code to verify it's you. Resetting your passcode
                        will <strong>permanently remove the documents currently in your vault</strong>{" "}
                        because we cannot decrypt them without your current passcode. You can re-upload
                        them after the reset.
                    </p>
                    {error && (
                        <div role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                            {error}
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={sendOtp}
                        disabled={isSending}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:bg-gray-400"
                    >
                        {isSending ? "Sending..." : "Send Reset Code"}
                    </button>
                    <Link
                        href="/dashboard/documents"
                        className="block text-sm text-center text-gray-600 dark:text-muted-foreground hover:underline"
                    >
                        Cancel
                    </Link>
                </div>
            )}

            {step === "verify" && (
                <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-muted-foreground">
                        We sent a 6-digit code to <strong>{maskedEmail}</strong>. It expires in 10 minutes.
                    </p>
                    <div>
                        <label htmlFor="otp" className="block text-sm font-medium mb-1">Verification code</label>
                        <input
                            id="otp"
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-border rounded-lg text-center text-xl tracking-widest"
                            placeholder="● ● ● ● ● ●"
                            autoComplete="one-time-code"
                        />
                    </div>
                    <div>
                        <label htmlFor="newPasscode" className="block text-sm font-medium mb-1">New passcode</label>
                        <input
                            id="newPasscode"
                            type="password"
                            inputMode="numeric"
                            maxLength={6}
                            value={newPasscode}
                            onChange={(e) => setNewPasscode(e.target.value.replace(/\D/g, ""))}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-border rounded-lg"
                            placeholder="6 digits"
                        />
                    </div>
                    <div>
                        <label htmlFor="confirm" className="block text-sm font-medium mb-1">Confirm new passcode</label>
                        <input
                            id="confirm"
                            type="password"
                            inputMode="numeric"
                            maxLength={6}
                            value={confirmPasscode}
                            onChange={(e) => setConfirmPasscode(e.target.value.replace(/\D/g, ""))}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-border rounded-lg"
                            placeholder="6 digits"
                        />
                    </div>
                    <label className="flex items-start gap-2 text-sm text-gray-700 dark:text-muted-foreground">
                        <input
                            type="checkbox"
                            checked={acknowledgedWipe}
                            onChange={(e) => setAcknowledgedWipe(e.target.checked)}
                            className="mt-1"
                        />
                        <span>
                            I understand that completing this reset will permanently remove all current documents in my vault.
                        </span>
                    </label>
                    {error && (
                        <div role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                            {error}
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={verifyAndReset}
                        disabled={isSending}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:bg-gray-400"
                    >
                        {isSending ? "Resetting..." : "Reset Passcode"}
                    </button>
                </div>
            )}

            {step === "done" && (
                <div className="space-y-3 text-center">
                    <p className="text-lg font-semibold text-green-700">Passcode reset complete.</p>
                    <p className="text-sm text-gray-600 dark:text-muted-foreground">Redirecting to your vault...</p>
                </div>
            )}
        </div>
    );
}
