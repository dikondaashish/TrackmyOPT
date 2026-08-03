/**
 * USCIS nearby / neighbor receipt scanning kill switch.
 * Default OFF — no runtime override. Set NEARBY_SCAN_ENABLED=true only after
 * counsel review and USCIS compliance sign-off.
 */

export class NearbyScanDisabledError extends Error {
  readonly code = "NEARBY_SCAN_DISABLED";

  constructor(message = "Nearby receipt scanning is disabled for USCIS API compliance.") {
    super(message);
    this.name = "NearbyScanDisabledError";
  }
}

/** Reads env only at call time; accepts explicit "true" (case-insensitive). */
function isNearbyScanEnabled(): boolean {
  return process.env.NEARBY_SCAN_ENABLED?.trim().toLowerCase() === "true";
}

export function assertNearbyScanEnabled(): void {
  if (!isNearbyScanEnabled()) {
    throw new NearbyScanDisabledError();
  }
}
