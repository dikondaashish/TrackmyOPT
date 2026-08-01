import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Style-debt ratchet.
 *
 * content-job-portal.ts is 5,200+ lines of imperative DOM built from inline
 * `cssText` strings. Migrating all of it to the design primitives at once is
 * high risk, so it is being done incrementally.
 *
 * These budgets lock in the current numbers. They may only ever be LOWERED.
 * If a change pushes a count up, this test fails — which is the point: no new
 * hardcoded styling gets added while the migration is in progress.
 *
 * When you migrate a batch, lower the matching budget in the same commit.
 */
const WIDGET = path.join(process.cwd(), 'src', 'content-job-portal.ts');
const source = fs.readFileSync(WIDGET, 'utf-8');

const count = (pattern: RegExp): number => (source.match(pattern) ?? []).length;

const BUDGETS: Array<{ label: string; pattern: RegExp; max: number; why: string }> = [
    {
        label: 'inline cssText assignments',
        pattern: /cssText/g,
        max: 178,
        why: 'use the factories in src/design/primitives.ts instead',
    },
    {
        label: 'hardcoded 6-digit hex colours',
        pattern: /#[0-9a-fA-F]{6}\b/g,
        max: 40,
        why: 'use var(--tmo-color-*) so the colour adapts to dark mode',
    },
    {
        label: 'hardcoded #fff',
        pattern: /#fff\b/g,
        max: 15,
        why: 'use var(--tmo-color-surface) or var(--tmo-color-on-accent)',
    },
    {
        label: 'fractional font sizes',
        pattern: /font-size:\s*\d+\.\d+px/g,
        max: 41,
        why: 'use the type scale: var(--tmo-text-xs) … var(--tmo-text-3xl)',
    },
];

for (const budget of BUDGETS) {
    const actual = count(budget.pattern);
    assert.ok(
        actual <= budget.max,
        `content-job-portal.ts has ${actual} ${budget.label}, budget is ${budget.max}. ` +
            `Do not add more — ${budget.why}.`
    );
}

// Report how much slack is left, so the ratchet gets tightened rather than
// silently drifting below its budget.
const slack = BUDGETS.map((budget) => {
    const actual = count(budget.pattern);
    return `${budget.label}: ${actual}/${budget.max}`;
}).join(', ');

/**
 * Status colours must never be hardcoded again — these specific values were
 * migrated because they stayed light-mode in dark theme.
 */
const MIGRATED_STATUS_COLOURS = [
    '#fffbeb', '#92400e', '#b45309',  // warning
    '#eff6ff', '#dbeafe',             // info
    '#b91c1c', '#dc2626',             // danger
    '#14532d', '#065f46', '#047857',  // success
];
for (const colour of MIGRATED_STATUS_COLOURS) {
    assert.ok(
        !source.includes(colour),
        `${colour} is back in content-job-portal.ts. It was replaced with a ` +
            `--tmo-color-* token because a hardcoded status colour does not ` +
            `adapt to dark mode.`
    );
}

console.log(`style-debt ratchet: ${slack}`);
