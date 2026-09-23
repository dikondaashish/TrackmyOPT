/** Resolve legacy aliases at the root so a saved theme also overrides OS preference. */
export function applyPopupTheme(theme: unknown): void {
  const dark = theme === 'dark';
  document.documentElement.setAttribute('data-tmo-theme', dark ? 'dark' : 'light');
  document.body.classList.toggle('dark-mode', dark);
  document.body.classList.remove('light-mode');
}
