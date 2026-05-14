import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { EmailReminderData } from '../../email-service';
import { getDailyReminderSubject, renderDailyReminderEmailHtml } from '../daily-reminder-html';

function optApplyFixture(): EmailReminderData['tools'][number] {
  return {
    name: 'OPT Apply',
    toolType: 'opt-apply',
    daysLeft: 80,
    totalDays: 120,
    startDate: 'Jan 1, 2026',
    endDate: 'Apr 1, 2026',
    urgency: 'safe',
    message: 'Keep going',
    programEndDate: 'May 15, 2026',
  };
}

describe('daily-reminder-html', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-14T13:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('getDailyReminderSubject uses min days across tools', () => {
    const tools = [optApplyFixture(), { ...optApplyFixture(), toolType: 'opt-clock' as const, daysLeft: 5 }];
    expect(getDailyReminderSubject(tools)).toContain('5');
    expect(getDailyReminderSubject(tools)).toContain('days');
  });

  it('renderDailyReminderEmailHtml includes greeting and opt-apply section', () => {
    const data: EmailReminderData = {
      userId: 'u1',
      userEmail: 'sam@example.com',
      firstName: 'Sam',
      tools: [optApplyFixture()],
    };
    const html = renderDailyReminderEmailHtml(data);
    expect(html).toContain('Hi Sam');
    expect(html).toContain('Daily OPT summary');
    expect(html).toContain('OPT Application Dates');
    expect(html).toContain('Open dashboard');
  });
});
