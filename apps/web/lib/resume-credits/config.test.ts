import { describe, expect, it } from 'vitest';
import {
  creditsForPackQuantity,
  isAllowedResumeCreditPackQuantity,
} from '@/lib/resume-credits/config';

describe('resume-credit configuration', () => {
  it('grants ten credits for every whole dollar', () => {
    expect(creditsForPackQuantity(2)).toBe(20);
    expect(creditsForPackQuantity(5)).toBe(50);
    expect(creditsForPackQuantity(7)).toBe(70);
  });

  it('accepts whole-dollar purchases from $1 through $100 only', () => {
    expect(isAllowedResumeCreditPackQuantity(1)).toBe(true);
    expect(isAllowedResumeCreditPackQuantity(100)).toBe(true);
    expect(isAllowedResumeCreditPackQuantity(0)).toBe(false);
    expect(isAllowedResumeCreditPackQuantity(1.5)).toBe(false);
    expect(isAllowedResumeCreditPackQuantity(101)).toBe(false);
  });
});
