import { flashAutofillField } from './autofill-visual-feedback';
import { trackPrefillChange } from './prefill-undo';

export interface JobPortalLoginCredential {
  email: string;
  password: string;
}

export interface JobPortalLoginFillResult {
  emailFilled: number;
  passwordFilled: number;
  totalFilled: number;
}

const BLOCKED_PASSWORD_FIELD_RE =
  /\b(?:ssn|social security(?: number)?|tax(?:payer)?(?: identification)?(?: number| id)?|tin|ein|date of birth|birth date|dob|financial|bank|routing(?: number)?|account(?: number| no\.?| #)|security answer|secret answer|authentication code|auth code|one[ -]?time(?: code| password)?|verification(?: code| password)?|otp|mfa|2fa|passcode|pin|cvv|cvc|credit card|debit card)\b/i;
const PASSWORD_CHANGE_FIELD_RE =
  /\b(?:old|previous|current)\s+password\b/i;
const POSITIVE_PASSWORD_FIELD_RE =
  /\b(?:password|create password|choose password|new password|confirm password|password confirmation|re[ -]?enter password|repeat password)\b/i;
const LOGIN_IDENTITY_RE =
  /\b(?:e[ -]?mail|email address|login|log in|user ?name|account id)\b/i;

export function normalizeJobPortalHostname(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 2048) return null;
  try {
    const parsed = new URL(
      /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)
        ? trimmed
        : `https://${trimmed}`
    );
    const hostname = parsed.hostname.toLowerCase().replace(/\.$/, '');
    if (
      parsed.username ||
      parsed.password ||
      !hostname.includes('.') ||
      hostname === 'trackmyopt.com' ||
      hostname.endsWith('.trackmyopt.com') ||
      !/^[a-z0-9.-]+$/.test(hostname)
    ) {
      return null;
    }
    return hostname;
  } catch {
    return null;
  }
}

export function normalizeDefaultJobPortalLogin(
  value: unknown
): JobPortalLoginCredential | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const candidate = value as Record<string, unknown>;
  if (
    'hostname' in candidate ||
    typeof candidate.email !== 'string' ||
    typeof candidate.password !== 'string'
  ) {
    return null;
  }
  const email = candidate.email.trim();
  const password = candidate.password;
  if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    password.length < 8 ||
    password.length > 256
  ) {
    return null;
  }
  return { email, password };
}

function visible(input: HTMLInputElement): boolean {
  if (
    !input.isConnected ||
    input.hidden ||
    input.matches(':disabled') ||
    input.readOnly ||
    input.getAttribute('aria-hidden') === 'true'
  ) {
    return false;
  }
  const view = input.ownerDocument.defaultView;
  if (!view) return false;
  for (let node: Element | null = input; node; node = node.parentElement ?? (node.getRootNode() as ShadowRoot).host ?? null) {
    if (node.hasAttribute('hidden') || node.hasAttribute('inert') || node.getAttribute('aria-hidden') === 'true') return false;
    const style = view.getComputedStyle(node);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
  }
  const isJsdom = /jsdom/i.test(view.navigator.userAgent || '');
  return isJsdom || input.getClientRects().length > 0;
}

function queryAllDeep<T extends Element>(
  root: ParentNode,
  selector: string
): T[] {
  const matches = Array.from(root.querySelectorAll<T>(selector));
  for (const host of Array.from(root.querySelectorAll<HTMLElement>('*'))) {
    if (host.shadowRoot) {
      matches.push(...queryAllDeep<T>(host.shadowRoot, selector));
    }
  }
  return matches;
}

function labelFor(input: HTMLInputElement): string {
  const labelRoot = input.getRootNode() as Document | ShadowRoot;
  const parts: Array<string | null | undefined> = [
    input.getAttribute('aria-label'),
    input.getAttribute('name'),
    input.getAttribute('id'),
    input.getAttribute('placeholder'),
    input.getAttribute('data-automation-id'),
    input.getAttribute('autocomplete'),
    input.closest('label')?.textContent,
  ];
  if (input.id) {
    parts.push(
      Array.from(labelRoot.querySelectorAll('label[for]')).find(
        (label) => label.getAttribute('for') === input.id
      )?.textContent
    );
  }
  const labelledBy = input.getAttribute('aria-labelledby');
  if (labelledBy) {
    for (const id of labelledBy.split(/\s+/)) {
      parts.push(labelRoot.getElementById(id)?.textContent);
    }
  }
  return parts.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}

function passwordFieldDescriptor(input: HTMLInputElement): string {
  const labelRoot = input.getRootNode() as Document | ShadowRoot;
  const parts: Array<string | null | undefined> = [
    input.getAttribute('aria-label'),
    input.getAttribute('name'),
    input.getAttribute('id'),
    input.getAttribute('placeholder'),
    input.getAttribute('data-automation-id'),
    input.closest('label')?.textContent,
  ];
  if (input.id) {
    parts.push(
      Array.from(labelRoot.querySelectorAll('label[for]')).find(
        (label) => label.getAttribute('for') === input.id
      )?.textContent
    );
  }
  const labelledBy = input.getAttribute('aria-labelledby');
  if (labelledBy) {
    for (const id of labelledBy.split(/\s+/)) {
      parts.push(labelRoot.getElementById(id)?.textContent);
    }
  }
  return parts
    .filter(Boolean)
    .join(' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_:/.-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Password controls are deny-by-default: a clear password label is required. */
export function isApprovedJobPortalPasswordField(
  input: HTMLInputElement
): boolean {
  if ((input.type || '').toLowerCase() !== 'password') return false;
  const descriptor = passwordFieldDescriptor(input);
  return (
    (POSITIVE_PASSWORD_FIELD_RE.test(descriptor) || /^(?:new-password|current-password)$/.test(input.autocomplete)) &&
    !BLOCKED_PASSWORD_FIELD_RE.test(descriptor) &&
    !PASSWORD_CHANGE_FIELD_RE.test(descriptor)
  );
}

export function findApprovedJobPortalPasswordField(
  root: ParentNode
): HTMLInputElement | null {
  return queryAllDeep<HTMLInputElement>(root, 'input[type="password"]').find(
    (input) =>
      visible(input) &&
      !input.value &&
      isApprovedJobPortalPasswordField(input)
  ) ?? null;
}

export function hasApprovedJobPortalPasswordField(root: ParentNode): boolean {
  return findApprovedJobPortalPasswordField(root) !== null;
}

function setNativeValue(input: HTMLInputElement, value: string): void {
  trackPrefillChange(input, () => {
  const view = input.ownerDocument.defaultView;
  const setter = view
    ? Object.getOwnPropertyDescriptor(
        view.HTMLInputElement.prototype,
        'value'
      )?.set
    : undefined;
  if (setter) setter.call(input, value);
  else input.value = value;
  const EventCtor = view?.Event || Event;
  input.dispatchEvent(new EventCtor('input', { bubbles: true, composed: true }));
  input.dispatchEvent(new EventCtor('change', { bubbles: true, composed: true }));
  });
}

function loginScopeFor(
  password: HTMLInputElement
): ParentNode {
  return (
    password.form ||
    password.closest(
      '[role="form"],[data-automation-id*="form" i],[data-testid*="form" i],dialog,main,section'
    ) ||
    password.ownerDocument
  );
}

function isLoginIdentityField(input: HTMLInputElement): boolean {
  const type = (input.type || 'text').toLowerCase();
  if (!['text', 'email'].includes(type)) return false;
  const autocomplete = input.autocomplete.toLowerCase();
  return (
    type === 'email' ||
    autocomplete === 'username' ||
    LOGIN_IDENTITY_RE.test(labelFor(input))
  );
}

/**
 * Fill a verified employer-portal login form. It never clicks controls,
 * overwrites values, fills password-change/OTP fields, or returns secret data.
 */
export function fillJobPortalLogin(
  root: ParentNode,
  credential: JobPortalLoginCredential,
  currentHostname: string,
  shouldContinue: () => boolean = () => true,
): JobPortalLoginFillResult {
  const verified = normalizeDefaultJobPortalLogin(credential);
  if (!verified || !normalizeJobPortalHostname(currentHostname)) {
    return { emailFilled: 0, passwordFilled: 0, totalFilled: 0 };
  }

  const passwordInputs = queryAllDeep<HTMLInputElement>(
    root,
    'input[type="password"]'
  ).filter(
    (input) =>
      visible(input) &&
      !input.value &&
      isApprovedJobPortalPasswordField(input)
  );
  const scopes = new Set<ParentNode>(
    passwordInputs.map((password) => loginScopeFor(password))
  );
  let emailFilled = 0;
  let passwordFilled = 0;

  for (const scope of scopes) {
    const scopePasswords = queryAllDeep<HTMLInputElement>(
      scope,
      'input[type="password"]'
    ).filter((input) => visible(input));
    const identities = queryAllDeep<HTMLInputElement>(scope, 'input[type="text"],input[type="email"],input:not([type])')
      .filter(input => visible(input) && isLoginIdentityField(input));
    const scopeHeading = Array.from(scope.querySelectorAll('h1,h2,h3,legend,[role="heading"]')).map(el => el.textContent).join(' ');
    const conflicts = () => identities.some(input => input.value.trim() && input.value.trim().toLowerCase() !== verified.email.toLowerCase()) ||
      scopePasswords.some(input => isApprovedJobPortalPasswordField(input) && input.value && input.value !== verified.password);
    if (
      /\b(?:reset|change|forgot|recover)\b.{0,30}\bpassword\b/i.test(scopeHeading) ||
      scopePasswords.some(input => PASSWORD_CHANGE_FIELD_RE.test(labelFor(input))) ||
      conflicts()
    ) {
      continue;
    }

    for (const input of identities) {
      if (!shouldContinue() || conflicts() || !visible(input) || input.value) {
        continue;
      }
      setNativeValue(input, verified.email);
      flashAutofillField(input, 'filled');
      emailFilled += 1;
    }

    for (const input of scopePasswords) {
      if (!shouldContinue() || conflicts() || !visible(input) || input.value || !isApprovedJobPortalPasswordField(input)) continue;
      setNativeValue(input, verified.password);
      flashAutofillField(input, 'filled');
      passwordFilled += 1;
    }
  }

  return {
    emailFilled,
    passwordFilled,
    totalFilled: emailFilled + passwordFilled,
  };
}
