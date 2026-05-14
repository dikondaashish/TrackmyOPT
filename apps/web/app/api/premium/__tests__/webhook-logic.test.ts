/**
 * Stripe webhook compliance logic tests.
 *
 * These cover the audit-critical decision rules embedded in the Stripe webhook
 * handler (apps/web/app/api/premium/webhook/route.ts):
 *
 *   1) Subscription status → revoke/keep mapping
 *      - past_due / unpaid → KEEP premium during dunning (do not revoke)
 *      - canceled / incomplete_expired → REVOKE
 *      - active / trialing → KEEP and refresh
 *
 *   2) Partial refund detection
 *      - charge.amount_refunded < charge.amount → NOT a full refund, do not revoke
 *      - charge.amount_refunded >= charge.amount → full refund, revoke
 *
 * Both rules previously had bugs that this test suite locks down.
 */

import { describe, expect, it } from 'vitest';

/**
 * Mirror of the rule in handleSubscriptionUpdated.
 * The actual implementation lives in route.ts; we duplicate it here as a
 * pure function so the test doesn't have to spin up the real handler with
 * Stripe mocks. If either copy changes, both must.
 */
function decideSubscriptionAction(
    status: string,
): 'revoke' | 'keep_and_refresh' | 'no_change' {
    const isTerminal = ['canceled', 'incomplete_expired'].includes(status);
    if (isTerminal) return 'revoke';
    if (['active', 'trialing', 'past_due', 'unpaid'].includes(status)) {
        return 'keep_and_refresh';
    }
    return 'no_change';
}

/** Mirror of the rule in handleChargeRefunded. */
function isFullRefund(charge: { amount: number; amount_refunded?: number }): boolean {
    return (
        typeof charge.amount_refunded === 'number' &&
        typeof charge.amount === 'number' &&
        charge.amount_refunded >= charge.amount
    );
}

describe('Stripe webhook — subscription state mapping', () => {
    it('past_due keeps premium during dunning retries', () => {
        expect(decideSubscriptionAction('past_due')).toBe('keep_and_refresh');
    });

    it('unpaid keeps premium (still pre-cancellation)', () => {
        expect(decideSubscriptionAction('unpaid')).toBe('keep_and_refresh');
    });

    it('active keeps and refreshes expiry', () => {
        expect(decideSubscriptionAction('active')).toBe('keep_and_refresh');
    });

    it('trialing keeps and refreshes expiry', () => {
        expect(decideSubscriptionAction('trialing')).toBe('keep_and_refresh');
    });

    it('canceled revokes premium', () => {
        expect(decideSubscriptionAction('canceled')).toBe('revoke');
    });

    it('incomplete_expired revokes premium', () => {
        expect(decideSubscriptionAction('incomplete_expired')).toBe('revoke');
    });

    it('unknown/paused statuses are no_change (do not touch DB)', () => {
        expect(decideSubscriptionAction('paused')).toBe('no_change');
        expect(decideSubscriptionAction('incomplete')).toBe('no_change');
        expect(decideSubscriptionAction('something_new_from_stripe')).toBe('no_change');
    });
});

describe('Stripe webhook — refund detection', () => {
    it('partial refund (10/100) is NOT a full refund', () => {
        expect(isFullRefund({ amount: 10000, amount_refunded: 1000 })).toBe(false);
    });

    it('almost-full refund (99/100) is NOT a full refund', () => {
        expect(isFullRefund({ amount: 10000, amount_refunded: 9900 })).toBe(false);
    });

    it('exact full refund (100/100) is a full refund', () => {
        expect(isFullRefund({ amount: 10000, amount_refunded: 10000 })).toBe(true);
    });

    it('over-refund (101/100, rare but possible with adjustments) counts as full', () => {
        expect(isFullRefund({ amount: 10000, amount_refunded: 10100 })).toBe(true);
    });

    it('missing amount_refunded is NOT treated as full', () => {
        expect(isFullRefund({ amount: 10000 } as any)).toBe(false);
    });

    it('zero refund is NOT a full refund', () => {
        expect(isFullRefund({ amount: 10000, amount_refunded: 0 })).toBe(false);
    });
});
