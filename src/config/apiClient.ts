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

  // If running in a browser environment:
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // 1. Local development or preview mode on any localhost port (proxied to backend)
    if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0') {
      return '';
    }
    // 2. Staging or production domain served via Nginx reverse proxy (same-origin /api)
    if (host.includes('myarea24.in')) {
      return '';
    }
    // 3. GitHub Pages static showcase without backend attached
    if (host.endsWith('github.io')) {
      return null;
    }
    // 4. Default for custom web deployments with same-origin reverse proxy
    if (window.location.protocol.startsWith('http')) {
      return '';
    }
  }

  // When no backend URL is configured (static preview or GitHub Pages without backend):
  // Return null to prevent spamming 503s/404s or insecure mixed-content requests.
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
    return null;
  }
}
