/**
 * IndexNow Utility Functions
 * Helpers for submitting URLs to IndexNow API for instant indexing
 */

/**
 * Submit a single URL to IndexNow
 * @param url - Full URL to submit (e.g., "https://trackmyopt.com/blog/article-slug")
 * @returns Response from IndexNow API
 */
export async function submitToIndexNow(url: string): Promise<{
  success: boolean;
  message: string;
  status?: number;
}> {
  return submitToIndexNowBatch([url]);
}

/**
 * Submit multiple URLs to IndexNow in a batch
 * @param urls - Array of full URLs to submit
 * @returns Response from IndexNow API
 */
export async function submitToIndexNowBatch(urls: string[]): Promise<{
  success: boolean;
  message: string;
  status?: number;
}> {
  if (!urls || urls.length === 0) {
    return {
      success: false,
      message: 'No URLs provided for submission',
    };
  }

  try {
    const response = await fetch('/api/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        urlList: urls.slice(0, 10000), // IndexNow limits to 10,000 per request
      }),
    });

    const data = (await response.json()) as {
      success: boolean;
      message: string;
      submittedCount?: number;
    };

    return {
      success: data.success,
      message: data.message,
      status: response.status,
    };
  } catch (error) {
    console.error('Error submitting to IndexNow:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to submit to IndexNow',
    };
  }
}

/**
 * Generate full URL from relative path
 * @param path - Relative path (e.g., "/blog/article-slug")
 * @returns Full URL (e.g., "https://trackmyopt.com/blog/article-slug")
 */
export function getFullUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://trackmyopt.com';
  return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
}

/**
 * Helper to submit all blog post URLs in a category
 * Useful for batch indexing on first deploy
 * @param category - Blog category (e.g., "opt-basics", "stem-opt", "h1b")
 * @param articles - Array of article slugs
 */
export async function submitBlogCategoryToIndexNow(
  category: string,
  articles: string[]
): Promise<{ success: boolean; message: string; submittedCount: number }> {
  const urls = articles.map((slug) => getFullUrl(`/blog/${slug}`));

  try {
    const result = await submitToIndexNowBatch(urls);
    return {
      ...result,
      submittedCount: urls.length,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to submit ${category} articles: ${error}`,
      submittedCount: 0,
    };
  }
}
