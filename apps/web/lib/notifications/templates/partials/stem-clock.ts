import type { ToolReminderDetail } from '../../email-service';
import { emailToolSummary } from './summary';

export function generateStemClockSection(tool: ToolReminderDetail): string {
  return emailToolSummary(
    'STEM Unemployment Clock',
    [
      ['Unemployment days remaining', `${Math.max(0, tool.daysLeft)} days`],
      [
        'Cumulative OPT/STEM unemployment used',
        `${Math.max(0, tool.totalDays - tool.daysLeft)} / ${tool.totalDays}`,
      ],
      ['STEM start date', tool.startDate],
      ['STEM end date', tool.endDate],
    ],
    tool.message,
    [
      'The 150-day unemployment limit counts initial OPT and STEM OPT together.',
      'Confirm employer eligibility, your Form I-983, and employment changes with your DSO.',
      'Complete STEM validation reports through your school. Check the <a href="https://studyinthestates.dhs.gov/students/stem-opt-hub">official STEM OPT Hub</a> for reporting requirements.',
    ],
    'https://www.trackmyopt.com/dashboard/opt-tools/stem-clock'
  );
}
