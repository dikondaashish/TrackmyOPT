export function renderCampaignSource(html: string, sourceText: string, postalAddress: string) {
  const address = postalAddress.trim();
  if (address.length < 15 || address.length > 500 || /^[^\s]+@[^\s]+$/.test(address) || /\{\{|\}\}/.test(address)) {
    throw new Error('Provide the verified physical mailing address, not an email address or placeholder');
  }
  const lines = sourceText.replace(/\r\n/g, '\n').split('\n');
  if (!lines[0]?.startsWith('Subject: ') || !lines[1]?.startsWith('Preheader: ')) throw new Error('Template subject/preheader metadata is missing');
  const subject = lines[0].slice('Subject: '.length).trim();
  if (!subject || subject.length > 200) throw new Error('Invalid campaign subject');
  const escape = (value: string) => value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
  const renderedHtml = html.replaceAll('{{POSTAL_ADDRESS}}', () => escape(address).replace(/\r?\n/g, '<br>'));
  const text = lines.slice(2).join('\n').trim().replaceAll('{{POSTAL_ADDRESS}}', () => address);
  const remaining = (renderedHtml + text).replace(/\{\{(?:firstName|UNSUBSCRIBE_URL)\}\}/g, '');
  if (/\{\{[^{}]+\}\}/.test(remaining)) throw new Error('Unexpected unresolved template field');
  if (!renderedHtml.includes('{{UNSUBSCRIBE_URL}}') || !text.includes('{{UNSUBSCRIBE_URL}}')) throw new Error('Both email bodies need an unsubscribe field');
  return { subject, html: renderedHtml, text };
}
