/**
 * Document Vault Passcode Utility
 * 
 * Handles secure passcode hashing, verification, and lockout logic
 * Uses bcrypt for hashing with 10 salt rounds
 */

import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;
const MAX_FAILED_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Hash a 6-digit passcode
 * @param passcode - Plain text passcode (should be 6 digits)
 * @returns Hashed passcode
 */
export async function hashPasscode(passcode: string): Promise<string> {
  try {
    // Validate passcode format
    if (!isValidPasscode(passcode)) {
      throw new Error('Passcode must be exactly 6 digits');
    }

    const hash = await bcrypt.hash(passcode, SALT_ROUNDS);

    return hash;
  } catch (error) {
    console.error('❌ Error hashing passcode:', error);
    throw new Error('Failed to hash passcode');
  }
}

/**
 * Verify a passcode against its hash
 * @param passcode - Plain text passcode
 * @param hash - Stored hash
 * @returns true if passcode matches
 */
export async function verifyPasscode(passcode: string, hash: string): Promise<boolean> {
  try {
    const isValid = await bcrypt.compare(passcode, hash);
    
    if (isValid) {
    } else {
    }

    return isValid;
  } catch (error) {
    console.error('❌ Error verifying passcode:', error);
    return false;
  }
}

/**
 * Validate passcode format
 * Must be exactly 6 digits
 * @param passcode - Passcode to validate
 * @returns true if valid format
 */
export function isValidPasscode(passcode: string): boolean {
  const passcodeRegex = /^\d{6}$/;
  return passcodeRegex.test(passcode);
}

/**
 * Check if account is locked due to failed attempts
 * @param failedAttempts - Number of failed attempts
 * @param lockedUntil - Timestamp when lockout expires
 * @returns { isLocked, remainingTime }
 */
export function checkLockoutStatus(
  failedAttempts: number,
  lockedUntil: Date | null
): { isLocked: boolean; remainingTime: number } {
  const now = new Date();

  // Check if currently locked
  if (lockedUntil && lockedUntil > now) {
    const remainingMs = lockedUntil.getTime() - now.getTime();
    const remainingMinutes = Math.ceil(remainingMs / 60000);


    return {
      isLocked: true,
      remainingTime: remainingMinutes,
    };
  }

  // Check if should be locked
  if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
    return {
      isLocked: true,
      remainingTime: 10, // Default to 10 minutes
    };
  }

  return {
    isLocked: false,
    remainingTime: 0,
  };
}

/**
 * Get remaining attempts before lockout
 * @param failedAttempts - Current failed attempts
 * @returns Number of attempts remaining
 */
export function getRemainingAttempts(failedAttempts: number): number {
  const remaining = MAX_FAILED_ATTEMPTS - failedAttempts;
  return Math.max(0, remaining);
}

