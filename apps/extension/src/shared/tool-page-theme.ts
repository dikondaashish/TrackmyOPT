export type ToolSurfaceTone = 'blue' | 'green' | 'orange' | 'red' | 'neutral';

/**
 * Shared surface-card language for popup tool pages. Tones communicate status
 * through a quiet border/background while text remains readable in both themes.
 */
export function toolSurfaceCard(tone: ToolSurfaceTone = 'neutral'): string {
  return [
    `background:var(--tool-${tone}-surface)`,
    `border:1px solid var(--tool-${tone}-border)`,
    'color:var(--ink)',
    'box-shadow:none',
  ].join(';');
}
