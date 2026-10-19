/**
 * MyArea24 — Unified API Client & Environment Configuration
 * Provides centralized backend URL resolution, mixed-content prevention,
 * and graceful handling for static deployments (e.g. GitHub Pages).
 */

export function getApiBaseUrl(): string | null {
  const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env || {};
  const configured = metaEnv.VITE_API_BASE_URL || metaEnv.VITE_BACKEND_URL;
  if (configured && typeof configured === 'string' && configured.trim().length > 0) {
    return configured.trim().replace(/\/+$/, '');
  }

  // If running locally in development or test, Vite proxy or local FastAPI is available
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0') {
      return ''; // Uses local Vite dev proxy to http://127.0.0.1:8000
    }
  }

  // On remote hosting (e.g. aidivi265.github.io) without configured VITE_API_BASE_URL:
  // Return null to prevent sending failing relative requests to GitHub Pages (which 404s)
  // or insecure HTTP requests to 127.0.0.1 (blocked as mixed-content by browsers).
  return null;
}

export function isBackendConfigured(): boolean {
  return getApiBaseUrl() !== null;
}

export async function requestBackendJson<T>(
  path: string,
  options: RequestInit = {},
  timeoutMs = 4500
): Promise<T | null> {
  const baseUrl = getApiBaseUrl();

  // If on remote static host without configured backend, don't spam 404s or ERR_CONNECTION_REFUSED
  if (baseUrl === null) {
    return null;
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const targetUrl = baseUrl === '' ? cleanPath : `${baseUrl}${cleanPath}`;

  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('myarea24_auth_token') : null;
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(targetUrl, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (res.ok) {
      return (await res.json()) as T;
    }
    return null;
  } catch {
    clearTimeout(timer);
    // In local dev, if proxy fails, try direct 127.0.0.1:8000 as secondary attempt
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      if (baseUrl === '') {
        try {
          const directRes = await fetch(`http://127.0.0.1:8000${cleanPath}`, {
            ...options,
            headers,
          });
          if (directRes.ok) {
            return (await directRes.json()) as T;
          }
        } catch {
          return null;
        }
      }
    }
    return null;
  }
}
