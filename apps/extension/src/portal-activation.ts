/** Skip clear informational routes within broadly matched job-board domains.
 * Unknown/application routes keep the existing detection behavior.
 */
export function shouldActivatePortal(reason: string | null, pathname: string): boolean {
  if (!reason) return false;
  return !(reason.startsWith('known-job-board:') && /^\/(?:about|about-us|privacy|privacy-policy|legal|terms|terms-of-service|help|support)(?:\/|$)/i.test(pathname));
}
