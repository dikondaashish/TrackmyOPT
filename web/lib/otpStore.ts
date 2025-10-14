/**
 * In-memory OTP storage
 * 
 * WARNING: This is for development/demo purposes only.
 * In production, use Redis, Vercel KV, or a database with TTL support.
 */

interface OTPData {
  code: string;
  expiresAt: number;
}

class OTPStore {
  private store: Map<string, OTPData>;

  constructor() {
    this.store = new Map();
    
    // Cleanup expired OTPs every 5 minutes
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }
  }

  set(email: string, code: string, expiresInMs: number): void {
    this.store.set(email.toLowerCase(), {
      code,
      expiresAt: Date.now() + expiresInMs,
    });
  }

  get(email: string): OTPData | undefined {
    const data = this.store.get(email.toLowerCase());
    
    // Check if expired
    if (data && Date.now() > data.expiresAt) {
      this.delete(email);
      return undefined;
    }
    
    return data;
  }

  delete(email: string): void {
    this.store.delete(email.toLowerCase());
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [email, data] of this.store.entries()) {
      if (data.expiresAt < now) {
        this.store.delete(email);
      }
    }
  }
}

// Export singleton instance
export const otpStore = new OTPStore();

