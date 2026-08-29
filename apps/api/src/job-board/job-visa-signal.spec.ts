import { deriveSponsorshipTag, detectPostingVisaSignals } from './job-visa-signal';

describe('job visa signal detection', () => {
  it('stores only explicit posting language with its evidence excerpt', () => {
    const signals = detectPostingVisaSignals(
      'We will provide visa sponsorship for qualified candidates. STEM OPT candidates are welcome.',
    );

    expect(signals.map((signal) => signal.signalType)).toEqual([
      'future_sponsorship_stated',
      'opt_accepted_stated',
    ]);
    expect(signals.every((signal) => signal.evidenceSnippet.length > 0)).toBe(true);
  });

  it('does not infer a visa claim when a posting says nothing about it', () => {
    expect(detectPostingVisaSignals('Build reliable products with a collaborative team.')).toEqual([]);
  });

  it('derives display text from evidence types rather than a mutable job tag', () => {
    expect(deriveSponsorshipTag(['historical_h1b_sponsor'])).toBe('historical_h1b_sponsor');
    expect(deriveSponsorshipTag(['future_sponsorship_stated'])).toBe('future_sponsorship_stated');
    expect(deriveSponsorshipTag([])).toBe('unknown');
  });
});
