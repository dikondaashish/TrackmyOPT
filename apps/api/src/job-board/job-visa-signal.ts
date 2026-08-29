export type VisaSignalType =
  | 'no_sponsorship_stated'
  | 'future_sponsorship_stated'
  | 'opt_accepted_stated';

export type DetectedPostingSignal = {
  signalType: VisaSignalType;
  evidenceSnippet: string;
  confidence: number;
};

function plainText(value: string) {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function excerpt(value: string, matchIndex: number, matchLength: number) {
  const start = Math.max(0, matchIndex - 100);
  const end = Math.min(value.length, matchIndex + matchLength + 180);
  return value.slice(start, end).trim();
}

export function detectPostingVisaSignals(description: string | null): DetectedPostingSignal[] {
  if (!description) return [];
  const text = plainText(description);
  const patterns: Array<{ signalType: VisaSignalType; pattern: RegExp; confidence: number }> = [
    {
      signalType: 'no_sponsorship_stated',
      pattern: /(?:does not|do not|will not|cannot|unable to|no)\s+(?:provide |offer )?(?:visa|immigration|h-?1b)\s+sponsorship/i,
      confidence: 0.98,
    },
    {
      signalType: 'future_sponsorship_stated',
      pattern: /(?:will|can|may|offer|provide)\s+(?:visa|immigration|h-?1b)\s+sponsorship/i,
      confidence: 0.9,
    },
    {
      signalType: 'opt_accepted_stated',
      pattern: /(?:STEM\s+)?OPT\b/i,
      confidence: 0.85,
    },
  ];

  return patterns.flatMap(({ signalType, pattern, confidence }) => {
    const match = pattern.exec(text);
    return match?.index === undefined
      ? []
      : [{ signalType, evidenceSnippet: excerpt(text, match.index, match[0].length), confidence }];
  });
}

export function deriveSponsorshipTag(signalTypes: string[]): string {
  if (signalTypes.includes('no_sponsorship_stated')) return 'no_sponsorship_stated';
  if (signalTypes.includes('future_sponsorship_stated')) return 'future_sponsorship_stated';
  if (signalTypes.includes('historical_h1b_sponsor')) return 'historical_h1b_sponsor';
  return 'unknown';
}
