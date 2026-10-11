/** Hosted Supabase templates. Publishing these must preserve auth settings and notification opt-ins. */
import {
  buildTransactionalEmail,
  emailBodySectionOpen,
  emailBodySectionClose,
  emailTextP,
  emailTextMuted,
  emailOtpBox,
  emailPrimaryButton,
} from './email-layout';

const confirm = '{{ .ConfirmationURL }}';
const support =
  '<a href="mailto:support@trackmyopt.com" style="color:#2563EB;text-decoration:underline;">Contact TrackMyOPT support</a>';

const definitions = [
  {
    id: 'confirm-sign-up',
    key: 'confirmation',
    title: 'Verify your email address',
    subject: 'Your TrackMyOPT verification code',
    body: `${emailTextP('Welcome to TrackMyOPT. Enter this code on the signup screen to verify your email address and finish creating your account.')}${emailOtpBox('{{ .Token }}')}${emailTextMuted('Use the most recent code you requested. If it has expired, request a new one on the signup screen. Never share your code.')}${emailTextMuted('If you did not create a TrackMyOPT account, you can ignore this email.')}`,
  },
  {
    id: 'invite-user',
    key: 'invite',
    title: 'You are invited to TrackMyOPT',
    subject: 'Your invitation to TrackMyOPT',
    body: `${emailTextP('You have been invited to create a TrackMyOPT account. Use the link below to accept your invitation.')}${emailPrimaryButton(confirm, 'Accept invitation')}${emailTextMuted('If you were not expecting this invitation, you can ignore this email.')}`,
  },
  {
    id: 'magic-link-or-otp',
    key: 'magic_link',
    title: 'Sign in to TrackMyOPT',
    subject: 'Your TrackMyOPT sign-in link',
    body: `${emailTextP('Use the secure link below to sign in to your TrackMyOPT account. The link can only be used once.')}${emailPrimaryButton(confirm, 'Sign in to TrackMyOPT')}${emailTextMuted('If the link has expired, request a new sign-in email. If you did not request this, you can ignore this email. Never share your sign-in link.')}`,
  },
  {
    id: 'change-email-address',
    key: 'email_change',
    title: 'Confirm your email change',
    subject: 'Confirm your TrackMyOPT email change',
    body: `${emailTextP('A request was made to change your TrackMyOPT email address from <strong>{{ .Email }}</strong> to <strong>{{ .NewEmail }}</strong>.')}${emailPrimaryButton(confirm, 'Confirm email change')}${emailTextMuted(`If you did not request this change, do not confirm it. ${support}.`)}`,
  },
  {
    id: 'reset-password',
    key: 'recovery',
    title: 'Reset your password',
    subject: 'Reset your TrackMyOPT password',
    body: `${emailTextP('We received a request to reset your TrackMyOPT password. Use the secure link below to choose a new password.')}${emailPrimaryButton(confirm, 'Reset password')}${emailTextMuted('If the link has expired, request a new password-reset email. If you did not request this reset, you can ignore this email. Your password will stay the same.')}`,
  },
  {
    id: 'reauthentication',
    key: 'reauthentication',
    title: 'Verify your identity',
    subject: 'Your TrackMyOPT identity verification code',
    body: `${emailTextP('Enter this code in TrackMyOPT to verify your identity before completing the account action you requested.')}${emailOtpBox('{{ .Token }}')}${emailTextMuted('Use the most recent code you requested. If it has expired, request a new one. Never share your code.')}${emailTextMuted(`If you did not request this action, do not enter the code. ${support}.`)}`,
  },
  {
    id: 'password-changed',
    key: 'password_changed_notification',
    title: 'Your password was changed',
    subject: 'Your TrackMyOPT password was changed',
    body: emailTextP(
      'The password for your TrackMyOPT account <strong>{{ .Email }}</strong> was changed.'
    ),
  },
  {
    id: 'email-address-changed',
    key: 'email_changed_notification',
    title: 'Your email address was changed',
    subject: 'Your TrackMyOPT email address was changed',
    body: emailTextP(
      'Your TrackMyOPT account email was changed from <strong>{{ .OldEmail }}</strong> to <strong>{{ .Email }}</strong>.'
    ),
  },
  {
    id: 'phone-number-changed',
    key: 'phone_changed_notification',
    title: 'Your phone number was changed',
    subject: 'Your TrackMyOPT phone number was changed',
    body: emailTextP(
      'The phone number for your TrackMyOPT account <strong>{{ .Email }}</strong> was changed from <strong>{{ .OldPhone }}</strong> to <strong>{{ .Phone }}</strong>.'
    ),
  },
  {
    id: 'sign-in-method-linked',
    key: 'identity_linked_notification',
    title: 'A sign-in method was added',
    subject: 'A sign-in method was added to TrackMyOPT',
    body: emailTextP(
      'A <strong>{{ .Provider }}</strong> sign-in method was added to your TrackMyOPT account <strong>{{ .Email }}</strong>.'
    ),
  },
  {
    id: 'sign-in-method-removed',
    key: 'identity_unlinked_notification',
    title: 'A sign-in method was removed',
    subject: 'A sign-in method was removed from TrackMyOPT',
    body: emailTextP(
      'The <strong>{{ .Provider }}</strong> sign-in method was removed from your TrackMyOPT account <strong>{{ .Email }}</strong>.'
    ),
  },
  {
    id: 'mfa-method-added',
    key: 'mfa_factor_enrolled_notification',
    title: 'A verification method was added',
    subject: 'A verification method was added to TrackMyOPT',
    body: emailTextP(
      'A <strong>{{ .FactorType }}</strong> verification method was added to your TrackMyOPT account <strong>{{ .Email }}</strong>.'
    ),
  },
  {
    id: 'mfa-method-removed',
    key: 'mfa_factor_unenrolled_notification',
    title: 'A verification method was removed',
    subject: 'A verification method was removed from TrackMyOPT',
    body: emailTextP(
      'A <strong>{{ .FactorType }}</strong> verification method was removed from your TrackMyOPT account <strong>{{ .Email }}</strong>.'
    ),
  },
] as const;

export function getSupabaseAuthTemplates() {
  return definitions.map((d) => ({
    id: d.id,
    key: d.key,
    subject: d.subject,
    html: buildTransactionalEmail({
      headerTitle: d.title,
      bodyHtml: `${emailBodySectionOpen()}${d.body}${d.key.endsWith('_notification') ? emailTextP(`If you did not make this change, ${support} immediately and review your account security.`) : ''}${d.body.includes(confirm) ? emailTextMuted(`If the button does not work, copy this link into your browser:<br><a href="${confirm}" style="color:#2563EB;word-break:break-all;">${confirm}</a>`) : ''}${emailBodySectionClose()}`,
    }).replace(/© \d{4}/g, '©'),
  }));
}
