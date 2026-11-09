import { describe, expect, it } from 'vitest';
import { blogPosts } from '@/app/blog/blog-index-data';
import { researchArticleBySlug } from '@/data/blog-series';
import { TOPIC_LABELS, resolveTopicLabel, topicLabel } from './blog-categories';

const NON_ENGLISH = new Set(['Boletín de visas', 'Tiempos de procesamiento', '영주권 문호']);

describe('blog topic labels', () => {
  it('maps every post on the blog index to a topic', () => {
    const unmapped = blogPosts
      .filter((post) => resolveTopicLabel(post) === null)
      .map((post) => `${post.slug}: "${post.category}"`);
    expect(unmapped).toEqual([]);
  });

  it('maps every structured article to a topic', () => {
    const unmapped = [...researchArticleBySlug.values()]
      .filter((article) => resolveTopicLabel(article) === null)
      .map((article) => `${article.slug}: "${article.category}"`);
    expect(unmapped).toEqual([]);
  });

  it('only ever shows one of the topic labels on English posts', () => {
    const labels = new Set(blogPosts.map((post) => topicLabel(post)));
    for (const label of labels) {
      if (NON_ENGLISH.has(label)) continue;
      expect(TOPIC_LABELS).toContain(label);
    }
    expect(TOPIC_LABELS).toHaveLength(10);
  });

  it('uses the hub name for posts that sit in a hub', () => {
    const inHub = blogPosts.find((post) => post.hub === 'processing-times');
    expect(inHub && topicLabel(inHub)).toBe('Processing times');
  });
});
