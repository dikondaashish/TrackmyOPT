import {
  SENSITIVE_FIELD_RE,
  classifyField,
  normalizeFieldSignal,
  type FieldKind,
} from '../easy-apply/easy-apply-matchers';
import type { PlatformFieldRules } from '../platform-config/remote-config';

/**
 * Bundled classification plus server-delivered label phrases. Remote phrases
 * are data, not logic: they can only (a) mark a label as one to leave alone,
 * or (b) add a synonym for a bundled, non-sensitive field kind when the
 * bundled matcher found nothing. They can never reclassify a sensitive
 * question or override a bundled classification.
 */
export function classifyFieldWithRules(labelText: string, rules: PlatformFieldRules | undefined): FieldKind | null {
  const signal = normalizeFieldSignal(labelText);
  if (!signal) return null;
  const contains = (phrase: string) => ` ${signal} `.includes(` ${phrase} `);
  if (rules?.ignoreLabels?.some(contains)) return null;
  const bundled = classifyField(labelText);
  if (bundled || !rules?.labelAliases?.length || SENSITIVE_FIELD_RE.test(signal)) return bundled;
  const matches = new Set(rules.labelAliases.filter(alias => alias.phrases.some(contains)).map(alias => alias.kind));
  // Ambiguous phrases (matching two kinds) are never guessed.
  return matches.size === 1 ? ([...matches][0] as FieldKind) : null;
}
