import { describe, expect, it } from 'vitest';
import {
  getServiceCenterLabel,
  getServiceCenterLocation,
} from './case-status-display';

describe('case status service-center display', () => {
  it('maps known receipt prefixes and leaves unknown prefixes unresolved', () => {
    expect(getServiceCenterLabel('IOE9138644807')).toBe(
      'Electronic processing'
    );
    expect(getServiceCenterLocation('IOE9138644807')).toBeNull();
    expect(getServiceCenterLabel('  ioe9138644807 ')).toBe('Electronic processing');
    expect(getServiceCenterLocation('MSC1234567890')).toBe("Lee's Summit, MO");
    expect(getServiceCenterLabel('YSC1234567890')).toBe(
      'Potomac Service Center'
    );
    expect(getServiceCenterLocation('YSC1234567890')).toBe('Arlington, VA');
    expect(getServiceCenterLocation('ZZZ1234567890')).toBeNull();
  });
});
