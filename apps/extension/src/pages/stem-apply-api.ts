import { getIdToken } from '../token-store';
import { WEBSITE_URL } from '../config.js';
import { parseDate } from './opt-apply-date-helpers';

export interface StemApplyDates {
  opt_ead_end_date: string | null;
  stem_dso_recommendation_date: string | null;
}

/** Never switch to a website identity when the extension has a bearer token. */
export async function stemApiRequest(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await getIdToken();
  return fetch(`${WEBSITE_URL}${path}`, {
    ...init,
    credentials: token ? 'omit' : 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

export async function loadStemDates(): Promise<StemApplyDates | null> {
  try {
    const response = await stemApiRequest('/api/opt/calculator', { method: 'GET' });
    if (!response.ok) return null;
    const result = await response.json();
    const data = result.data;
    if (result.ok === true && data === null) {
      return { opt_ead_end_date: null, stem_dso_recommendation_date: null };
    }
    const validDate = (value: unknown) => value === null || (typeof value === 'string' && !!parseDate(value));
    // A missing/malformed field is not evidence of an intentionally cleared date.
    if (result.ok !== true || !data || !validDate(data.opt_ead_end_date) || !validDate(data.stem_dso_recommendation_date)) return null;
    return { opt_ead_end_date: data.opt_ead_end_date, stem_dso_recommendation_date: data.stem_dso_recommendation_date };
  } catch {
    return null;
  }
}

export async function saveStemDates(dates: StemApplyDates): Promise<boolean> {
  try {
    const response = await stemApiRequest('/api/opt/calculator', {
      method: 'POST',
      // Only these two fields belong to STEM Apply; omitted calculator fields are preserved.
      body: JSON.stringify({ opt_ead_end_date: dates.opt_ead_end_date, stem_dso_recommendation_date: dates.stem_dso_recommendation_date }),
    });
    if (!response.ok) return false;
    return (await response.json()).ok === true;
  } catch {
    return false;
  }
}
