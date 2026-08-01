import assert from 'node:assert/strict';
import {
    deriveAccessibleName,
    interactiveAttributes,
    isActivationKey,
    needsInteractiveTreatment,
    shouldPreventDefaultForKey,
    type ElementFacts,
} from '../src/design/a11y';

const facts = (overrides: Partial<ElementFacts> = {}): ElementFacts => ({
    tag: 'div',
    hasRole: false,
    hasTabIndex: false,
    cursorPointer: false,
    disabled: false,
    ...overrides,
});

/* -------------------------------------------------- who needs retrofitting */

// The widget's core defect: a styled div with a click handler.
assert.equal(needsInteractiveTreatment(facts({ cursorPointer: true })), true);

// Native controls are already operable and must not be given role="button",
// which would override their real semantics.
for (const tag of ['button', 'a', 'input', 'select', 'textarea', 'summary']) {
    assert.equal(
        needsInteractiveTreatment(facts({ tag, cursorPointer: true, hasHref: true })),
        false,
        `${tag} must be left alone`
    );
}

// An anchor without href is not focusable, so it does need treatment.
assert.equal(
    needsInteractiveTreatment(facts({ tag: 'a', cursorPointer: true, hasHref: false })),
    true
);

// Non-clickable elements are left alone — the sweep must not make every div
// a tab stop.
assert.equal(needsInteractiveTreatment(facts({ cursorPointer: false })), false);

// Already-correct elements are skipped, so the sweep is idempotent.
assert.equal(
    needsInteractiveTreatment(facts({ cursorPointer: true, hasRole: true, hasTabIndex: true })),
    false
);

// A half-treated element (role but no tabindex) is still unreachable.
assert.equal(
    needsInteractiveTreatment(facts({ cursorPointer: true, hasRole: true })),
    true
);

// Disabled controls must not become tab stops.
assert.equal(
    needsInteractiveTreatment(facts({ cursorPointer: true, disabled: true })),
    false
);

/* ------------------------------------------------------ keyboard behaviour */

assert.ok(isActivationKey('Enter'));
assert.ok(isActivationKey(' '));
assert.ok(isActivationKey('Spacebar'));
assert.ok(!isActivationKey('a'));
assert.ok(!isActivationKey('Tab'), 'Tab must move focus, not activate');
assert.ok(!isActivationKey('Escape'));

// Space scrolls the page by default and must be suppressed; Enter must not be.
assert.equal(shouldPreventDefaultForKey(' '), true);
assert.equal(shouldPreventDefaultForKey('Enter'), false);

/* -------------------------------------------------------------- attributes */

const attrs = interactiveAttributes('Save job');
assert.equal(attrs.role, 'button');
assert.equal(attrs.tabindex, '0');
assert.equal(attrs['aria-label'], 'Save job');
assert.equal(interactiveAttributes().hasOwnProperty('aria-label'), false);
assert.equal(interactiveAttributes('   ').hasOwnProperty('aria-label'), false);

/* --------------------------------------------------------- accessible name */

assert.equal(deriveAccessibleName('  Save   to tracker '), 'Save to tracker');
assert.equal(deriveAccessibleName(''), undefined);
// Icon-only controls must report "no name" so the caller supplies one, rather
// than shipping a control announced as an unreadable glyph.
assert.equal(deriveAccessibleName('✕'), undefined);
assert.equal(deriveAccessibleName('○'), undefined);
assert.equal(deriveAccessibleName('🎯'), undefined);
// Mixed content keeps the words.
assert.equal(deriveAccessibleName('✓ Applied'), 'Applied');
// Long labels are truncated rather than read out in full.
assert.ok((deriveAccessibleName('x'.repeat(400)) ?? '').length <= 120);

console.log('a11y: retrofit rules, keyboard activation, and naming verified');
