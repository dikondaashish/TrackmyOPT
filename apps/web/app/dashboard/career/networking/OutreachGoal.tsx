'use client';

const goals = [
  {
    label: 'Ask about a role',
    text: 'I would like to learn more about the role and what the team is looking for.',
  },
  {
    label: 'Request a referral',
    text: 'I am interested in this team. Could we discuss whether my background is a fit for a referral?',
  },
  {
    label: 'Coffee chat',
    text: 'I would love a short conversation about your experience on the team and any advice for someone exploring similar roles.',
  },
];

export function OutreachGoal({
  value,
  onChange,
  optional = false,
}: {
  value: string;
  onChange: (value: string) => void;
  optional?: boolean;
}) {
  return (
    <div className="space-y-3">
      <label
        htmlFor="network-message-intent"
        className="block text-sm font-semibold text-slate-900 dark:text-white"
      >
        Your message goal{' '}
        {optional && (
          <span className="font-normal text-slate-500 dark:text-slate-400">
            (optional)
          </span>
        )}
      </label>
      <div className="flex flex-wrap gap-2" aria-label="Message suggestions">
        {goals.map((goal) => (
          <button
            key={goal.label}
            type="button"
            aria-pressed={value === goal.text}
            onClick={() => onChange(goal.text)}
            className={`min-h-10 rounded-full border px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${value === goal.text ? 'border-blue-600 bg-blue-50 text-blue-800 dark:border-blue-400 dark:bg-blue-950 dark:text-blue-200' : 'border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-700 dark:border-slate-700 dark:text-slate-300 dark:hover:text-blue-300'}`}
          >
            {goal.label}
          </button>
        ))}
      </div>
      <textarea
        id="network-message-intent"
        aria-label="What you want to say"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        maxLength={1000}
        placeholder="Choose a goal above or write your own…"
        className="w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-3 text-base sm:text-sm text-slate-950 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-400"
      />
    </div>
  );
}
