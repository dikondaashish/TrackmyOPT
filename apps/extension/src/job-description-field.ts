import { button, row, stack, text, textarea } from './design/primitives';
import { looksLikeRealJobPostingText } from './job-description';
import type { JobDescriptionResolution } from './job-description-scrape';

/** Small inline recovery, never a modal or a navigation away from the draft. */
export function jobDescriptionField(options: {
  initial: JobDescriptionResolution;
  onChange: () => void;
  onRetry: () => Promise<JobDescriptionResolution>;
  onOpenOverview: () => void;
}) {
  const input = textarea({rows:7, placeholder:'Paste the full job description here',
    value:looksLikeRealJobPostingText(options.initial.text) ? options.initial.text : '',
    attrs:{'aria-label':'Job description'}});
  input.style.cssText += ';box-sizing:border-box;max-width:100%;min-width:0;resize:vertical;line-height:1.6;';
  const disclosure = document.createElement('details');
  disclosure.open = !looksLikeRealJobPostingText(options.initial.text);
  const summary = document.createElement('summary');
  summary.textContent = 'Job description';
  summary.style.cssText = 'cursor:pointer;min-height:36px;padding:8px 0;font-weight:600;font-size:var(--tmo-text-sm);';
  const hint = text({text:'Review or edit the description used to tailor your resume.',size:'xs',tone:'muted',style:'margin-bottom:8px'});
  disclosure.append(summary,hint,input);
  let source = options.initial.source;
  let edited = false;
  let revision = 0;
  const status = text({text:'',size:'xs',tone:'muted'});
  status.setAttribute('role','status');
  const isValid = () => looksLikeRealJobPostingText(input.value);
  const refresh = () => {
    const valid = isValid();
    input.setAttribute('aria-invalid',String(Boolean(input.value) && !valid));
    status.textContent = valid
      ? `${edited ? 'Provided by you' : source === 'saved' ? 'Saved from this job’s posting' : source === 'original_listing' ? 'Retrieved from the original posting' : 'Read from this job’s posting'} · ${input.value.length.toLocaleString()} characters`
      : input.value ? 'This does not look like a job description. Paste the role’s responsibilities and qualifications.'
      : 'We couldn’t retrieve this job’s description. Retry or paste it below.';
    recovery.hidden = valid;
    recovery.style.display = valid ? 'none' : '';
    if (!valid) disclosure.open = true;
  };
  const retry = button({label:'Retry',variant:'secondary',size:'sm',onClick:async()=>{
    const started = revision;
    retry.disabled = true;
    status.textContent = 'Looking for the original job description…';
    try {
      const result = await options.onRetry();
      if (!node.isConnected || revision !== started) return;
      if (looksLikeRealJobPostingText(result.text)) {input.value=result.text;source=result.source;edited=false;}
    } catch { /* recovery copy remains actionable */ }
    finally {
      if (node.isConnected) {retry.disabled=false;refresh();options.onChange();}
    }
  }});
  const overview = button({label:'Open job overview',variant:'secondary',size:'sm',onClick:options.onOpenOverview});
  overview.hidden = !/^https?:\/\//.test(options.initial.sourceUrl);
  const paste = button({label:'Paste description',variant:'ghost',size:'sm',onClick:()=>{disclosure.open=true;input.focus();}});
  const recovery=row({gap:'2',children:[retry,overview,paste]});
  recovery.style.flexWrap='wrap';
  const node=stack({gap:'2',children:[disclosure,status,recovery]});
  input.addEventListener('input',()=>{revision++;edited=true;refresh();options.onChange();});
  refresh();
  return {node,input,isValid};
}
