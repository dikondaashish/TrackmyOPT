// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { adHeadingIndexes, blogPostSlug, findAdAnchors } from './ad-placement';

const filler = (n: number) => `<p>${'Words about OPT rules. '.repeat(n)}</p>`;

function article(html: string) {
  const root = document.createElement('article');
  root.innerHTML = html;
  return root;
}

describe('adHeadingIndexes', () => {
  it('places nothing on short articles, one ad after the first section, and a second on long ones', () => {
    expect(adHeadingIndexes(2)).toEqual([]);
    expect(adHeadingIndexes(3)).toEqual([1]);
    expect(adHeadingIndexes(5)).toEqual([1]);
    expect(adHeadingIndexes(6)).toEqual([1, 4]);
    expect(adHeadingIndexes(12)).toEqual([1, 8]);
  });
});

describe('blogPostSlug', () => {
  it('matches single posts only', () => {
    expect(blogPostSlug('/blog/opt-extension-guide')).toBe('opt-extension-guide');
    expect(blogPostSlug('/blog')).toBeNull();
    expect(blogPostSlug('/blog/hub/careers')).toBeNull();
    expect(blogPostSlug('/tools/opt-clock')).toBeNull();
  });
});

describe('findAdAnchors', () => {
  it('anchors on the section wrapper, skipping CTA boxes and headings outside the prose', () => {
    const root = article(`
      <div class="summary"><h2>Quick Summary</h2></div>
      <div class="prose">
        <section><h2 id="a">One</h2>${filler(40)}</section>
        <div class="box"><h2 id="b">Two</h2>${filler(40)}</div>
        <div class="not-prose"><h2>Sign up</h2></div>
        <h2 id="c">Three</h2>${filler(40)}
      </div>`);
    const anchors = findAdAnchors(root);
    expect(anchors).toHaveLength(1);
    expect(anchors[0]!.className).toBe('box');
  });

  it('adds a second anchor on long articles', () => {
    const sections = Array.from({ length: 8 }, (_, i) => `<h2 id="h${i}">H${i}</h2>${filler(20)}`).join('');
    const anchors = findAdAnchors(article(`<div class="prose">${sections}</div>`));
    expect(anchors.map((a) => a.id)).toEqual(['h1', 'h5']);
  });

  it('skips thin articles', () => {
    const root = article(`<div class="prose"><h2>A</h2><p>x</p><h2>B</h2><p>y</p><h2>C</h2></div>`);
    expect(findAdAnchors(root)).toEqual([]);
  });
});
