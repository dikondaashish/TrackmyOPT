import {
  CAPABILITY_IDS,
  featureBlock,
  platformForHostname,
  type CapabilityId,
  type EffectiveExtensionConfig,
  type FeatureBlock,
  type PlatformFieldRules,
  type PlatformId,
} from './remote-config';
import { currentEffectiveConfig } from './effective-config-client';

export interface AutofillGates {
  platform: PlatformId;
  /** All autofill on this page (global or platform switch). */
  block: FeatureBlock;
  /** Capabilities paused for this page; empty when nothing is paused. */
  blockedCapabilities: ReadonlySet<CapabilityId>;
  fieldRules: PlatformFieldRules | undefined;
  ruleVersion: string;
}

/** One decision for every content entry point (widget, Continuous, frames, popup). */
export function autofillGates(
  config: EffectiveExtensionConfig = currentEffectiveConfig(),
  hostname: string = typeof location === 'undefined' ? '' : location.hostname,
): AutofillGates {
  const platform = platformForHostname(hostname);
  return {
    platform,
    block: featureBlock(config, { autofill: true, platform }),
    blockedCapabilities: new Set(CAPABILITY_IDS.filter(capability =>
      featureBlock(config, { capability, platform }).blocked)),
    fieldRules: config.fieldRules[platform],
    ruleVersion: config.ruleVersion,
  };
}

/** Cheap check for hot cancellation paths: is all autofill paused on this page? */
export function autofillBlocked(hostname: string = typeof location === 'undefined' ? '' : location.hostname): FeatureBlock {
  return featureBlock(currentEffectiveConfig(), { autofill: true, platform: platformForHostname(hostname) });
}

/** Why one capability is paused on this page, if it is. */
export function capabilityBlock(capability: CapabilityId, hostname: string = typeof location === 'undefined' ? '' : location.hostname): FeatureBlock {
  return featureBlock(currentEffectiveConfig(), { capability, platform: platformForHostname(hostname) });
}
