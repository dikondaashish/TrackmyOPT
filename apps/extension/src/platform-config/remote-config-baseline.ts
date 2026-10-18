import type { BaselineConfig, EffectiveExtensionConfig } from './remote-config';
import { resolveEffectiveConfig } from './remote-config';

/**
 * Bundled baseline used before any server config arrives, when it expires, or
 * when it requires a newer extension. Bump ruleVersion whenever this changes.
 *
 * workday_network ships in shadow mode: its request pattern and success
 * criteria come from static analysis, not from an authorized Workday
 * submission. Shadow mode observes and reports agreement with the page
 * confirmation, but never marks a job Applied on its own. Promote it to
 * 'active' through server config only after real-platform validation
 * (docs/ops/EXTENSION_REMOTE_CONFIG.md).
 */
export const BASELINE_CONFIG: BaselineConfig = Object.freeze({
  ruleVersion: 'baseline-1',
  detectors: { workday_network: 'shadow', page_confirmation: 'active' },
  fieldRules: {},
}) as BaselineConfig;

export function baselineEffectiveConfig(now = Date.now()): EffectiveExtensionConfig {
  return resolveEffectiveConfig({ baseline: BASELINE_CONFIG, stored: null, now, extensionVersion: '0.0.0' });
}
