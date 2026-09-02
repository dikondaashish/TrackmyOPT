export type PageResult<T> = {
  data: T[] | null;
  error: { message: string } | null;
};

/** Read a Supabase REST result without relying on its 1,000-row default cap. */
export async function fetchAllPages<T>(
  fetchPage: (from: number, to: number) => Promise<PageResult<T>>,
  pageSize = 1_000,
) {
  const rows: T[] = [];
  for (let from = 0; ; from += pageSize) {
    const page = await fetchPage(from, from + pageSize - 1);
    if (page.error) throw new Error(page.error.message);
    const values = page.data || [];
    rows.push(...values);
    if (values.length < pageSize) return rows;
  }
}
