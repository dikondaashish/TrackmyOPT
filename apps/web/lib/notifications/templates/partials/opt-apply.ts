import type { ToolReminderDetail } from '../../email-service';
import { emailToolSummary } from './summary';

export function generateOptApplySection(tool: ToolReminderDetail): string {
  return emailToolSummary(
    'OPT Application Dates',
    [
      [
        'Days remaining on your saved timeline',
        `${Math.max(0, tool.daysLeft)} days`,
      ],
      ['Earliest apply date', tool.startDate],
      ['Saved filing deadline', tool.endDate],
      ['Program end date', tool.programEndDate || 'Not saved'],
    ],
    tool.message,
    [
      'Confirm your OPT recommendation date and filing window with your DSO before submitting.',
      'Review <a href="https://www.uscis.gov/i-765">USCIS Form I-765 instructions</a> for current evidence, signatures, and filing options.',
      'Check the <a href="https://www.uscis.gov/g-1055">current USCIS fee schedule</a> and keep proof of submission.',
    ],
    'https://www.trackmyopt.com/dashboard/opt-tools/opt-apply'
  );
}
