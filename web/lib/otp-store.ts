// Shared OTP store for export verification
// In production, you'd use Redis or a database table

export const otpStore = new Map<string, { otp: string; expiresAt: number }>();

// Clean up expired OTPs
export function cleanupExpiredOtps() {
  for (const [key, value] of otpStore.entries()) {
    if (value.expiresAt < Date.now()) {
      otpStore.delete(key);
    }
  }
}
