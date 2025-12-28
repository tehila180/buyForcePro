import { storage } from './storage';

const API_BASE = 'https://buyforcepro-production.up.railway.app';

export async function apiFetch(
  path: string,
  options: RequestInit = {}
) {
  const token = await storage.get('token');

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : {}),
      ...(options.headers || {}),
    },
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {}

  if (!res.ok) {
    throw new Error(data?.message || 'Unauthorized');
  }

  return data;
}
