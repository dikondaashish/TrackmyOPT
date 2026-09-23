/** Bounded public Ashby question markup, shared by filling and scanning. */
export function ashbyQuestion(control: Element): HTMLElement | null {
  return control.closest('.ashby-application-form-field-entry, .ashby-application-form-input-radio-group')
    ?.querySelector<HTMLElement>(':scope > .ashby-application-form-question-title') || null;
}

export function ashbyQuestionRequired(control: Element): boolean {
  const question = ashbyQuestion(control);
  // Ashby renders the required asterisk via its CSS-module class, not text.
  return !!question && Array.from(question.classList).some(name => /^_required_/.test(name));
}

export function ashbyExistingUpload(control: Element): boolean {
  const field = control.closest('.ashby-application-form-input-file');
  return !!field?.querySelector('.ashby-application-form-input-file-item-name')?.textContent?.trim();
}
