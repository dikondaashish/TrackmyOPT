import { describe, expect, it } from 'vitest';
import { normalizeStatusCategory } from '@/lib/posthog/uscis-status-category';
import {
  biometricsAppliesToCase,
  getBiometricsState,
  getVisibleI765Steps,
  mapStatusToRawStep,
  mentionsBiometrics,
  toDisplayStep,
} from '../i765-stepper';

describe('i765-stepper', () => {
  it.each([
    'We scheduled you for a biometrics appointment',
    'Biometrics Appointment Was Scheduled',
  ])('distinguishes an appointment from completed attendance: %s', (status) => {
    expect(getBiometricsState(status)).toBe('scheduled');
    expect(normalizeStatusCategory(status)).toBe('pending');
    expect(
      getBiometricsState('Case Is Being Actively Reviewed', [
        { description: status },
      ])
    ).toBe('scheduled');
  });

  it.each([
    'Case Was Updated To Show Fingerprints Were Taken',
    'Biometrics Appointment Was Completed',
    'Your fingerprints were applied to your case',
    '<p>Your biometrics have been collected.</p>',
  ])('recognizes explicit biometrics completion: %s', (status) => {
    expect(getBiometricsState(status)).toBe('completed');
  });

  it.each([
    'Fingerprint Fee Was Received',
    'Your biometrics fee was processed',
    'Biometrics have not been completed',
    'Your fingerprints will be taken',
    'Biometrics are pending',
    'We were unable to reuse your biometrics',
  ])('does not infer completion: %s', (status) => {
    expect(getBiometricsState(status)).toBe('pending');
  });

  it('preserves completion from history and reads descriptions', () => {
    const history = [
      { status: 'Case update', description: 'Your fingerprints were taken.' },
    ];
    expect(
      biometricsAppliesToCase('Case Is Being Actively Reviewed', history)
    ).toBe(true);
    expect(getBiometricsState('Case Is Being Actively Reviewed', history)).toBe(
      'completed'
    );
    expect(getBiometricsState('Case Was Approved')).toBe('unrecorded');
    expect(getBiometricsState('Biometrics were reused')).toBe('reused');
    expect(getBiometricsState('Biometrics requirement was waived')).toBe(
      'waived'
    );
  });
  it('detects biometrics in status text', () => {
    expect(mentionsBiometrics('Fingerprint Fee Was Received')).toBe(true);
    expect(mentionsBiometrics('Case Was Received')).toBe(false);
  });

  it('skips biometrics step for typical I-765 OPT unless history mentions it', () => {
    expect(
      biometricsAppliesToCase('Case Was Received', [
        { status: 'Case Is Being Actively Reviewed By USCIS' },
      ])
    ).toBe(false);
    expect(getVisibleI765Steps(true)).toHaveLength(4);
    expect(getVisibleI765Steps(true).some((s) => s.key === 'biometrics')).toBe(
      false
    );
  });

  it('shows biometrics when USCIS posted a biometrics-related status', () => {
    expect(
      biometricsAppliesToCase('Case Was Received', [
        { status: 'Biometrics Appointment Was Scheduled' },
      ])
    ).toBe(true);
    expect(getVisibleI765Steps(false)).toHaveLength(5);
  });

  it('remaps raw steps when biometrics is hidden', () => {
    expect(toDisplayStep(3, true)).toBe(2);
    expect(toDisplayStep(5, true)).toBe(4);
    expect(toDisplayStep(2, true)).toBe(1);
  });

  it('maps review and card statuses', () => {
    expect(mapStatusToRawStep('Case Is Being Actively Reviewed')).toBe(3);
    expect(mapStatusToRawStep('Card Was Mailed To Me')).toBe(5);
  });
});
