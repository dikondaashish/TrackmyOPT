/**
 * OPT calculator API load/save for the OPT Apply page.
 */

import { getIdToken } from '../token-store';
import { WEBSITE_URL } from '../config.js';

/**
 * Load saved OPT data from API
 */
export async function loadSavedData(): Promise<any> {
  try {
    // Try using session cookies first (if user is logged in on website)
    let response = await fetch(`${WEBSITE_URL}/api/opt/calculator`, {
      method: 'GET',
      credentials: 'include', // Send cookies from website
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // If session cookies failed, try JWT token
    if (!response.ok) {
      const idToken = await getIdToken();
      if (idToken) {
        response = await fetch(`${WEBSITE_URL}/api/opt/calculator`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json',
          },
        });
      }
    }

    if (!response.ok) return null;

    const result = await response.json();
    return result.ok ? result.data : null;
  } catch (error) {
    return null;
  }
}

/**
 * Save OPT data to API
 */
export async function saveDatesToAPI(
  programEndDate: string | null,
  dsoRecommendationDate: string | null
): Promise<boolean> {
  try {
    // The API preserves omitted fields; never send stale copies of other tools' dates.
    const lastModifiedField = 'program_end_date';

    // Merge: only update the fields this tool manages
    const payload = {
      program_end_date: programEndDate,
      dso_recommendation_date: dsoRecommendationDate,
      _lastModifiedField: lastModifiedField, // Tell API which field was updated
    };


    // Try using session cookies first (if user is logged in on website)
    let response = await fetch(`${WEBSITE_URL}/api/opt/calculator`, {
      method: 'POST',
      credentials: 'include', // Send cookies from website
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // If session cookies failed, try JWT token
    if (!response.ok) {
      const idToken = await getIdToken();
      if (idToken) {
        response = await fetch(`${WEBSITE_URL}/api/opt/calculator`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      }
    }

    const result = await response.json();
    if (result.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}
