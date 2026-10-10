import type { ToolReminderDetail } from '../../email-service';
import { emailToolSummary } from './summary';

export function generateOptClockSection(tool: ToolReminderDetail): string {
  return emailToolSummary(
    'OPT Unemployment Clock',
    [
      ['Unemployment days remaining', `${Math.max(0, tool.daysLeft)} days`],
      [
        'Unemployment days used',
        `${Math.max(0, tool.totalDays - tool.daysLeft)} / ${tool.totalDays}`,
      ],
      ['OPT start date', tool.startDate],
      ['OPT end date', tool.endDate],
    ],
    tool.message,
    [
      'Keep employment start and end dates up to date so the count reflects your records.',
      'Confirm qualifying employment and reporting requirements with your DSO.',
      'Review the <a href="https://www.ice.gov/sevis/employment">official student employment guidance</a> when planning your next step.',
    ],
    'https://www.trackmyopt.com/dashboard/opt-tools/opt-clock'
  );
}
