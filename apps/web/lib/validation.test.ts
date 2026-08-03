import { describe, it, expect } from 'vitest';
import {
    caseStatusRequestSchema,
    emailNotificationRequestSchema,
    validateRequest,
} from './validation';

/**
 * These schemas guard live endpoints, so the cases below are the payloads real
 * callers actually send — not invented ones. A schema that drifts from its
 * route rejects genuine traffic in production and nowhere else, which is how
 * all three of these ended up written but never connected.
 */

describe('caseStatusRequestSchema — POST /api/case-status', () => {
    it('accepts the payload CaseStatusSection sends when adding a case', () => {
        const result = validateRequest(
            {
                receipt_number: 'IOE1234567890',
                notifications_enabled: true,
                set_primary: true,
            },
            caseStatusRequestSchema
        );

        expect(result.success).toBe(true);
        if (!result.success) return;
        expect(result.data.receipt_number).toBe('IOE1234567890');
        expect(result.data.set_primary).toBe(true);
        // Untouched fields fall back to what the route used to default them to.
        expect(result.data.case_type).toBe('I-765');
        expect(result.data.label).toBeNull();
    });

    it('accepts the payload SettingsSection sends, ignoring its extra keys', () => {
        // SettingsSection posts auto_check_frequency / notify_on_change, which
        // this route has never read. They must be dropped, not rejected — a
        // `.strict()` schema here would turn a silent no-op into a 400.
        const result = validateRequest(
            {
                receipt_number: 'IOE1234567890',
                auto_check_frequency: 'daily',
                notify_on_change: true,
            },
            caseStatusRequestSchema
        );

        expect(result.success).toBe(true);
        if (!result.success) return;
        expect(result.data).not.toHaveProperty('auto_check_frequency');
        expect(result.data.notifications_enabled).toBe(true);
    });

    it('normalises receipt numbers exactly as the route did by hand', () => {
        const result = validateRequest(
            { receipt_number: 'ioe1234567890' },
            caseStatusRequestSchema
        );
        expect(result.success).toBe(true);
        if (!result.success) return;
        expect(result.data.receipt_number).toBe('IOE1234567890');
    });

    it.each([
        ['wrong length', 'IOE123'],
        ['letters where digits belong', 'IOEABCDEFGHIJ'],
        ['digits where letters belong', '1231234567890'],
    ])('rejects a receipt with %s', (_label, receipt_number) => {
        expect(validateRequest({ receipt_number }, caseStatusRequestSchema).success).toBe(false);
    });

    it('rejects a missing receipt number', () => {
        expect(validateRequest({}, caseStatusRequestSchema).success).toBe(false);
        expect(validateRequest(null, caseStatusRequestSchema).success).toBe(false);
    });

    it('bounds the fields that previously reached the database unchecked', () => {
        expect(
            validateRequest(
                { receipt_number: 'IOE1234567890', label: 'x'.repeat(101) },
                caseStatusRequestSchema
            ).success
        ).toBe(false);

        expect(
            validateRequest(
                { receipt_number: 'IOE1234567890', case_type: 'y'.repeat(21) },
                caseStatusRequestSchema
            ).success
        ).toBe(false);
    });
});

describe('emailNotificationRequestSchema — POST /api/user/notification-email', () => {
    it('accepts the camelCase toolType the route and its callers use', () => {
        const result = validateRequest(
            { email: 'Student@Example.COM', toolType: ' case-status ' },
            emailNotificationRequestSchema
        );

        expect(result.success).toBe(true);
        if (!result.success) return;
        expect(result.data.email).toBe('student@example.com');
        expect(result.data.toolType).toBe('case-status');
    });

    it('still rejects surrounding whitespace, as the old regex did', () => {
        // The previous check was anchored `^[^\s@]+@[^\s@]+\.[^\s@]+$`, so a
        // padded address was already a 400. Behaviour is unchanged.
        expect(
            validateRequest({ email: 'a@b.com ' }, emailNotificationRequestSchema).success
        ).toBe(false);
    });

    it('treats a missing or blank toolType as null, as the route did', () => {
        for (const body of [
            { email: 'a@b.com' },
            { email: 'a@b.com', toolType: '' },
            { email: 'a@b.com', toolType: '   ' },
            { email: 'a@b.com', toolType: null },
        ]) {
            const result = validateRequest(body, emailNotificationRequestSchema);
            expect(result.success).toBe(true);
            if (!result.success) continue;
            expect(result.data.toolType).toBeNull();
        }
    });

    it('allows tool types beyond the ones shipped today', () => {
        // The route persists whatever it is given, so an enum here would
        // silently drop a newly added tool.
        const result = validateRequest(
            { email: 'a@b.com', toolType: 'some-future-tool' },
            emailNotificationRequestSchema
        );
        expect(result.success).toBe(true);
        if (!result.success) return;
        expect(result.data.toolType).toBe('some-future-tool');
    });

    it('rejects what the old hand-rolled regex let through', () => {
        // `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` had no length bound at all.
        const tooLong = `${'a'.repeat(250)}@example.com`;
        expect(validateRequest({ email: tooLong }, emailNotificationRequestSchema).success).toBe(false);

        for (const email of ['not-an-email', '', 'a@b', null, 12345]) {
            expect(validateRequest({ email }, emailNotificationRequestSchema).success).toBe(false);
        }
    });
});
