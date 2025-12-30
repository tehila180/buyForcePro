import { storage } from './storage';

const API_BASE = 'https://buyforcepro-production.up.railway.app';

/**
 * apiFetch
 * --------
 * עטיפה ל-fetch עם:
 * - Authorization אוטומטי
 * - החזרת JSON
 * - זריקת שגיאה עם status
 */
export async function apiFetch(
  path: string,
  options: RequestInit = {}
) {
  const token = await storage.get('token');

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // response בלי body
  }

  if (!res.ok) {
    const error: any = new Error(
      data?.message || 'Request failed'
    );
    error.status = res.status; // ⭐️ חשוב מאוד
    throw error;
  }

  return data;
}
