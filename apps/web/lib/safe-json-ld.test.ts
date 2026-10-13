import { expect, it } from 'vitest';
import { safeSerializeJsonLd } from './safe-json-ld';
import { landingPageSchemas, siteIdentityGraph } from './seo-schemas';

// WebKit bug 255764 reproduces the captured @context.toLowerCase failure
// when a JSON-LD script has an array root. Exercise the reader operation on
// the actual schemas emitted by the root layout and landing page.
it('emits object roots with readable string contexts for the site schemas', () => {
  for (const schema of [siteIdentityGraph, ...landingPageSchemas]) {
    const parsed = JSON.parse(safeSerializeJsonLd(schema));
    expect(Array.isArray(parsed)).toBe(false);
    expect(parsed['@context'].toLowerCase()).toBe('https://schema.org');
  }
});

it.each([undefined, null, '', [], ['https://schema.org']])(
  'normalizes an absent or non-string root context (%j) for that reader',
  context => {
    const parsed = JSON.parse(safeSerializeJsonLd({
      '@context': context,
      '@type': 'WebPage',
      name: 'Synthetic page',
    }));
    expect(parsed['@context'].toLowerCase()).toBe('https://schema.org');
  },
);
