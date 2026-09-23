import { button, card, heading, row, stack, text } from './design/primitives';
import type { GeneratedResumeArtifactV1 } from './resume-autofill-contract';

export function savedJobResumeCard(options: {
  artifact: GeneratedResumeArtifactV1;
  generatedAt?: string;
  savedToAccount: boolean;
  onPreview: () => void;
  onDownload: () => void;
  onPrefill: () => Promise<boolean>;
  onRetrySave?: () => Promise<boolean>;
}) {
  const notice = text({ text: '', size: 'xs', tone: 'muted' });
  notice.setAttribute('role', 'status');
  const hint = text({ text: '', size: 'xs', tone: 'warning' });
  hint.hidden = true;
  const date =
    options.generatedAt && Number.isFinite(Date.parse(options.generatedAt))
      ? `Created ${new Date(options.generatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`
      : '';
  const file = text({
    text: options.artifact.pdf.filename,
    size: 'sm',
    weight: 'medium',
    style: 'overflow-wrap:anywhere;min-width:0',
  });
  const retention = text({
    text: 'Saved résumé storage: up to 30 days, 50 recent jobs per account.',
    size: 'xs',
    tone: 'muted',
  });
  const help = document.createElement('details');
  const summary = document.createElement('summary');
  summary.textContent = 'Storage details';
  summary.style.cssText =
    'font-size:var(--tmo-text-xs);color:var(--tmo-color-muted);cursor:pointer';
  help.append(summary, retention);
  const retrySave = button({
    label: 'Retry save',
    size: 'sm',
    onClick: async () => {
      retrySave.disabled = true;
      notice.textContent = 'Saving your résumé…';
      try {
        notice.textContent = (await options.onRetrySave?.())
          ? 'Saved to your account.'
          : 'Still not saved. Download a copy and try again later.';
      } catch {
        notice.textContent =
          'Could not save. Download a copy and try again later.';
      } finally {
        retrySave.disabled = false;
      }
    },
  });
  const prefill = button({
    label: 'Prefill this application',
    variant: 'primary',
    fullWidth: true,
    onClick: async () => {
      prefill.disabled = true;
      notice.textContent = 'Starting Prefill…';
      try {
        notice.textContent = (await options.onPrefill())
          ? 'Prefill started. Review the application before submitting.'
          : 'Open this job’s application and try again.';
      } catch {
        notice.textContent =
          'Could not start Prefill. Try the Prefill button on the application.';
      } finally {
        prefill.disabled = false;
      }
    },
  });
  const node = card({
    label: 'Your tailored résumé',
    tone: 'info',
    children: [
      stack({
        gap: '2',
        children: [
          heading(2, 'Your tailored résumé is ready', { size: 'md' }),
          file,
          text({
            text: [
              date,
              options.savedToAccount
                ? 'Saved to your account'
                : 'Not saved to your account. Download a copy before closing.',
            ]
              .filter(Boolean)
              .join(' · '),
            size: 'xs',
            tone: options.savedToAccount ? 'muted' : 'warning',
          }),
          row({
            gap: '2',
            children: [
              button({
                label: 'Preview',
                size: 'sm',
                onClick: options.onPreview,
              }),
              button({
                label: 'Download',
                size: 'sm',
                onClick: options.onDownload,
              }),
            ],
          }),
          prefill,
          ...(!options.savedToAccount && options.onRetrySave ? [retrySave] : []),
          hint,
          notice,
          help,
        ],
      }),
    ],
  });
  return {
    node,
    setHint(message: string | null) {
      hint.textContent = message || '';
      hint.hidden = !message;
    },
  };
}
