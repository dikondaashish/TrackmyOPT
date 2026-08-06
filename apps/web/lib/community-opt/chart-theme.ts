/**
 * Chart colours, as CSS custom properties.
 *
 * Defined in globals.css so light and dark swap with the theme and SVG fills
 * can reference them directly. Components import these names rather than
 * repeating hex, which is how the charts drifted apart in the first place —
 * the trend, the histogram and the heatmap each picked their own blue.
 *
 * Two hues only. `series` is the data; `you` is the reader's own case. Keeping
 * the second hue reserved for that one meaning is what makes it readable at a
 * glance, so it is never spent on decoration.
 */
export const CHART = {
  series: "var(--chart-series)",
  seriesSoft: "var(--chart-series-soft)",
  you: "var(--chart-you)",
  youSoft: "var(--chart-you-soft)",
  grid: "var(--chart-grid)",
  axis: "var(--chart-axis)",
} as const;

/** Sequential steps for magnitude, lightest = fewest. */
const SEQ_STEPS = 6;

/**
 * Pick a sequential step for a value in 0..max.
 *
 * Returns the fill and an ink that stays legible on it — the flip point is
 * where the ramp stops taking dark text, which differs by theme, so both sides
 * come from tokens rather than being computed here.
 */
export function sequentialCell(
  value: number,
  max: number
): { fill: string; ink: string } {
  if (max <= 0 || value <= 0) {
    return {
      fill: "var(--chart-seq-1)",
      ink: "var(--chart-seq-ink-low)",
    };
  }
  const step = Math.min(
    SEQ_STEPS,
    Math.max(1, Math.ceil((value / max) * SEQ_STEPS))
  );
  return {
    fill: `var(--chart-seq-${step})`,
    ink:
      step >= 5 ? "var(--chart-seq-ink-high)" : "var(--chart-seq-ink-low)",
  };
}
