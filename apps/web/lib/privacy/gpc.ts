/**
 * Global Privacy Control (https://globalprivacycontrol.org). Browsers expose
 * it as `navigator.globalPrivacyControl === true` and the `Sec-GPC: 1`
 * request header. No consent decision is made on the server, so only the
 * navigator property is read. Do Not Track is a different signal and is
 * intentionally not treated as GPC.
 */
export function readGlobalPrivacyControl(): boolean {
  if (typeof navigator === 'undefined') return false;
  try {
    return (
      (navigator as Navigator & { globalPrivacyControl?: unknown })
        .globalPrivacyControl === true
    );
  } catch {
    return false;
  }
}
