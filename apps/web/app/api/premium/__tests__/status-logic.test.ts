/**
 * Premium status route — self-heal decision logic.
 *
 * The route reconciles three sources:
 *   - profiles.premium_status
 *   - profiles.subscription_expires_at
 *   - Stripe subscriptions.list (active + trialing)
 *
 * These tests pin down the decision matrix so future refactors don't regress.
 */

import { describe, expect, it } from 'vitest';

interface ProfileRow {
    premium_status: boolean;
    subscription_expires_at: string | null;
    stripe_customer_id: string | null;
}

interface StripeView {
    /** true when Stripe says the customer has an active or trialing subscription. */
    stripeActive: boolean;
}

type Decision =
    | { isPremium: true; reason: 'db_current' }
    | { isPremium: true; reason: 'self_healed_from_stripe' }
    | { isPremium: false; reason: 'no_profile' }
    | { isPremium: false; reason: 'no_subscription' }
    | { isPremium: false; reason: 'expired_and_stripe_confirms_inactive' };

/**
 * Pure decision function mirroring the route. Test isolation only.
 */
function decide(
    profile: ProfileRow | null,
    stripe: StripeView | null,
    now: Date,
): Decision {
    if (!profile) return { isPremium: false, reason: 'no_profile' };

    // Path 1: DB says NOT premium but Stripe customer exists.
    if (!profile.premium_status && profile.stripe_customer_id) {
        if (stripe?.stripeActive) {
            return { isPremium: true, reason: 'self_healed_from_stripe' };
        }
        return { isPremium: false, reason: 'no_subscription' };
    }

    if (!profile.premium_status) {
        return { isPremium: false, reason: 'no_subscription' };
    }

    // Path 2: DB says premium. Check expiry.
    const expiresAt = profile.subscription_expires_at
        ? new Date(profile.subscription_expires_at)
        : null;

    if (expiresAt && expiresAt < now) {
        // Expired in DB — check Stripe before revoking.
        if (stripe?.stripeActive) {
            return { isPremium: true, reason: 'self_healed_from_stripe' };
        }
        return { isPremium: false, reason: 'expired_and_stripe_confirms_inactive' };
    }

    return { isPremium: true, reason: 'db_current' };
}

const NOW = new Date('2026-05-01T00:00:00Z');

describe('premium status — decision matrix', () => {
    it('returns false when no profile exists', () => {
        const d = decide(null, null, NOW);
        expect(d.isPremium).toBe(false);
        expect(d.reason).toBe('no_profile');
    });

    it('returns true when DB premium=true and expiry in the future', () => {
        const d = decide(
            {
                premium_status: true,
                subscription_expires_at: '2026-06-01',
                stripe_customer_id: 'cus_x',
            },
            null,
            NOW,
        );
        expect(d.isPremium).toBe(true);
        expect(d.reason).toBe('db_current');
    });

    it('self-heals to true when DB premium=false but Stripe is active', () => {
        const d = decide(
            {
                premium_status: false,
                subscription_expires_at: null,
                stripe_customer_id: 'cus_x',
            },
            { stripeActive: true },
            NOW,
        );
        expect(d.isPremium).toBe(true);
        expect(d.reason).toBe('self_healed_from_stripe');
    });

    it('returns false when DB premium=false and Stripe is inactive', () => {
        const d = decide(
            {
                premium_status: false,
                subscription_expires_at: null,
                stripe_customer_id: 'cus_x',
            },
            { stripeActive: false },
            NOW,
        );
        expect(d.isPremium).toBe(false);
        expect(d.reason).toBe('no_subscription');
    });

    it('self-heals to true when DB premium=true but expired AND Stripe is active', () => {
        const d = decide(
            {
                premium_status: true,
                subscription_expires_at: '2026-04-01', // past
                stripe_customer_id: 'cus_x',
            },
            { stripeActive: true },
            NOW,
        );
        expect(d.isPremium).toBe(true);
        expect(d.reason).toBe('self_healed_from_stripe');
    });

    it('revokes to false when DB premium=true but expired AND Stripe inactive', () => {
        const d = decide(
            {
                premium_status: true,
                subscription_expires_at: '2026-04-01',
                stripe_customer_id: 'cus_x',
            },
            { stripeActive: false },
            NOW,
        );
        expect(d.isPremium).toBe(false);
        expect(d.reason).toBe('expired_and_stripe_confirms_inactive');
    });

    it('handles profile without stripe_customer_id (legacy free user) — returns false', () => {
        const d = decide(
            {
                premium_status: false,
                subscription_expires_at: null,
                stripe_customer_id: null,
            },
            null,
            NOW,
        );
        expect(d.isPremium).toBe(false);
        expect(d.reason).toBe('no_subscription');
    });
});
