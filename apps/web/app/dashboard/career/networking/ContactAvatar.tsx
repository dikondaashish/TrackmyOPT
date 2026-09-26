import { cn } from '@/lib/utils';

export function ContactAvatar({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || '?';

  return (
    <span
      aria-hidden="true"
      className={cn(
        'grid size-12 shrink-0 place-items-center rounded-full bg-slate-900 text-sm font-semibold text-white dark:bg-slate-100 dark:text-slate-900',
        className
      )}
    >
      {initials}
    </span>
  );
}
