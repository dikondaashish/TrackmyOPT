/** Local disclosure: hover, focus, click and Escape, without document listeners. */
export function sidebarHelp(label: string, description: string): HTMLElement {
  const group = document.createElement('div');
  group.className = 'tmo-sidebar-section-heading';
  const heading = document.createElement('span');
  heading.textContent = label;
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = '?';
  button.className = 'tmo-sidebar-help-button';
  button.setAttribute('aria-label', `About ${label.toLowerCase()}`);
  button.setAttribute('aria-expanded', 'false');
  const detail = document.createElement('p');
  detail.id = `tmo-sidebar-help-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  detail.className = 'tmo-sidebar-help-copy';
  detail.textContent = description;
  detail.hidden = true;
  button.setAttribute('aria-controls', detail.id);
  button.setAttribute('aria-describedby', detail.id);
  let pinned = false;
  const show = (visible: boolean) => {
    detail.hidden = !visible;
    button.setAttribute('aria-expanded', String(visible));
  };
  button.addEventListener('mouseenter', () => show(true));
  button.addEventListener('focus', () => show(true));
  group.addEventListener('mouseleave', () => {
    if (!pinned && !group.contains(document.activeElement)) show(false);
  });
  group.addEventListener('focusout', event => {
    if (!group.contains(event.relatedTarget as Node | null)) { pinned = false; show(false); }
  });
  button.addEventListener('click', () => { pinned = !pinned; show(pinned); });
  group.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || detail.hidden) return;
    event.preventDefault(); event.stopPropagation(); pinned = false; show(false);
  });
  group.append(heading, button, detail);
  return group;
}
