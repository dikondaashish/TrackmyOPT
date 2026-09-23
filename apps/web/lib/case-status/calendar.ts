import { calendarDateISO } from '@/lib/immigration/calendar-days';

const escapeText = (value: string) =>
  value
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,');
/** All-day dates avoid UTC shifting a notice deadline. No receipt numbers included. */
export function deadlineCalendar(
  title: string,
  date: string,
  id: string,
  now = new Date()
): string {
  const iso = calendarDateISO(date);
  if (!iso) throw new Error('Invalid deadline');
  const next = new Date(`${iso}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TrackMyOPT//Case deadlines//EN',
    'BEGIN:VEVENT',
    `UID:${escapeText(id)}@trackmyopt.com`,
    `DTSTAMP:${now
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '')}`,
    `DTSTART;VALUE=DATE:${iso.replace(/-/g, '')}`,
    `DTEND;VALUE=DATE:${next.toISOString().slice(0, 10).replace(/-/g, '')}`,
    `SUMMARY:${escapeText(title)}`,
    'DESCRIPTION:Verify the exact deadline against your official notice and with your DSO. Calendar reminders are not USCIS notifications.',
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    'DESCRIPTION:Review your saved deadline',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  // RFC 5545 content lines are folded at 75 octets, without splitting UTF-8.
  return (
    lines
      .map((line) => {
        let out = '';
        let length = 0;
        for (const character of line) {
          const size = new TextEncoder().encode(character).length;
          if (length + size > 75) {
            out += '\r\n ';
            length = 1;
          }
          out += character;
          length += size;
        }
        return out;
      })
      .join('\r\n') + '\r\n'
  );
}

export function downloadDeadlineCalendar(
  title: string,
  date: string,
  id: string
) {
  const url = URL.createObjectURL(
    new Blob([deadlineCalendar(title, date, id)], {
      type: 'text/calendar;charset=utf-8',
    })
  );
  const a = document.createElement('a');
  a.href = url;
  a.download = 'trackmyopt-deadline.ics';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
