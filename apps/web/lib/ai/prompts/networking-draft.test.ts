import { describe, expect, it } from 'vitest';
import { buildNetworkingDraftPrompt } from './networking-draft';

describe('buildNetworkingDraftPrompt', () => {
  it('includes the candidate intent as data and forbids invented claims', () => {
    const prompt = buildNetworkingDraftPrompt({
      companyName: 'Amazon',
      roleTitle: 'Software Engineer',
      contactName: 'Alex',
      contactTitle: 'Recruiter',
      messageIntent: 'Ask about the team and mention my application.',
      includeEmail: true,
    });

    expect(prompt).toContain('Ask about the team and mention my application.');
    expect(prompt).toContain('Do not invent a referral');
    expect(prompt).toContain('under 300 characters');
  });
});
