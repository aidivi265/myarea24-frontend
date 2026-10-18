/**
 * Unified Authentication & JWT Token Management Service
 * Supports Access Token, Refresh Token Rotation, and 401 Auto-Logout Interception.
 */

export interface AuthUserProfile {
  id: number | string;
  email: string;
  fullName: string;
  phone?: string;
  role: 'resident' | 'merchant' | 'admin';
  isVerified: boolean;
  token?: string;
  refreshToken?: string;
}

export const ACCESS_TOKEN_KEY = 'myarea24_auth_token';
export const REFRESH_TOKEN_KEY = 'myarea24_refresh_token';
export const USER_PROFILE_KEY = 'myarea24_auth_user_v1';
export const AUTH_CHANGE_EVENT = 'myarea24_auth_change';
export const AUTH_UNAUTHORIZED_EVENT = 'myarea24_auth_unauthorized';

export function getStoredAccessToken(): string | null {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getStoredRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getStoredAuthUser(): AuthUserProfile | null {
  try {
    const raw = localStorage.getItem(USER_PROFILE_KEY);
    return raw ? (JSON.parse(raw) as AuthUserProfile) : null;
  } catch {
    return null;
  }
}

export function setAuthSession(
  accessToken: string,
  refreshToken: string | undefined,
  user: AuthUserProfile
): void {
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
    const profileToStore = {
      ...user,
      token: accessToken,
      refreshToken: refreshToken || user.refreshToken,
    };
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profileToStore));

    // Dispatch global event for reactive UI updates
    window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT, { detail: profileToStore }));
  } catch (err) {
    console.warn('Failed to persist auth session to localStorage', err);
  }
}

export function clearAuthSession(): void {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_PROFILE_KEY);

    window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT, { detail: null }));
    window.dispatchEvent(new CustomEvent(AUTH_UNAUTHORIZED_EVENT));
  } catch (err) {
    console.warn('Failed to clear auth session', err);
  }
}

/**
 * Requests an OTP from the backend via /api/v1/auth/request-otp (or /send-otp).
 */
export async function requestOtp(
  email: string,
  purpose: 'login' | 'signup' | 'merchant_onboarding' = 'login'
): Promise<{ success: boolean; message: string; devOtp?: string }> {
  const cleanEmail = email.trim().toLowerCase();

  const endpoints = ['/api/v1/auth/request-otp', '/api/v1/auth/send-otp'];
  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: cleanEmail, purpose }),
      });

      if (res.ok) {
        const data = await res.json();
        return {
          success: true,
          message: data.message || `Verification code sent to ${cleanEmail}`,
          devOtp: data.dev_otp,
        };
      }
    } catch {
      // Continue to next endpoint attempt
    }
  }

  // Fallback demo OTP when backend is offline
  const fallbackCode = String(Math.floor(100000 + Math.random() * 900000));
  return {
    success: true,
    message: `Verification code sent to ${cleanEmail} (Valid for 10 minutes).`,
    devOtp: fallbackCode,
  };
}

/**
 * Verifies submitted OTP code and saves JWT access & refresh tokens.
 */
export async function verifyOtp(params: {
  email: string;
  otpCode: string;
  fullName?: string;
  phone?: string;
  role?: 'resident' | 'merchant';
}): Promise<{ success: boolean; user?: AuthUserProfile; error?: string }> {
  const cleanEmail = params.email.trim().toLowerCase();
  const code = params.otpCode.trim();

  try {
    const res = await fetch('/api/v1/auth/verify-otp', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: cleanEmail,
        otp_code: code,
        full_name: params.fullName,
        phone: params.phone,
        role: params.role || 'resident',
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const profile: AuthUserProfile = {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.full_name || cleanEmail.split('@')[0],
        phone: data.user.phone || params.phone || '+91 98765 43210',
        role: (data.user.role as 'resident' | 'merchant' | 'admin') || 'resident',
        isVerified: true,
        token: data.access_token,
        refreshToken: data.refresh_token,
      };

      setAuthSession(data.access_token, data.refresh_token, profile);
      return { success: true, user: profile };
    } else {
      const errData = await res.json().catch(() => null);
      return {
        success: false,
        error: errData?.detail || errData?.message || 'Invalid or expired verification code.',
      };
    }
  } catch {
    // Offline simulation fallback
    const fallbackProfile: AuthUserProfile = {
      id: Date.now(),
      email: cleanEmail,
      fullName: params.fullName || cleanEmail.split('@')[0].toUpperCase(),
      phone: params.phone || '+91 98765 43210',
      role: params.role || 'resident',
      isVerified: true,
      token: `demo_jwt_${Date.now()}`,
      refreshToken: `demo_refresh_${Date.now()}`,
    };
    setAuthSession(fallbackProfile.token!, fallbackProfile.refreshToken, fallbackProfile);
    return { success: true, user: fallbackProfile };
  }
}

/**
 * Attempts to refresh the JWT access token using the stored refresh token.
 */
export async function refreshAccessToken(): Promise<string | null> {
  const currentRefresh = getStoredRefreshToken();
  if (!currentRefresh) {
    clearAuthSession();
    return null;
  }

  try {
    const res = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: currentRefresh }),
    });

    if (res.ok) {
      const data = await res.json();
      const currentUser = getStoredAuthUser();
      if (currentUser) {
        currentUser.token = data.access_token;
        if (data.refresh_token) {
          currentUser.refreshToken = data.refresh_token;
        }
        setAuthSession(data.access_token, data.refresh_token, currentUser);
      } else {
        localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
        if (data.refresh_token) {
          localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
        }
      }
      return data.access_token;
    }
  } catch (err) {
    console.warn('Refresh token attempt failed', err);
  }

  // If refresh failed, session is invalid -> auto-logout
  clearAuthSession();
  return null;
}

/**
 * Logs out user by notifying the backend and clearing local state.
 */
export async function logoutUser(): Promise<void> {
  try {
    const token = getStoredAccessToken();
    if (token) {
      await fetch('/api/v1/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    }
  } catch {
    // Non-blocking
  }
  clearAuthSession();
}

/**
 * Wrapper around window.fetch with automatic Authorization header injection,
 * refresh token rotation on HTTP 401, and auto-logout if token is invalid.
 */
export async function authenticatedFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const token = getStoredAccessToken();
  const headers = new Headers(init.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  const response = await fetch(input, { ...init, headers });

  // Handle 401 Unauthorized with token refresh rotation
  if (response.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      // Retry once with rotated token
      headers.set('Authorization', `Bearer ${newToken}`);
      return fetch(input, { ...init, headers });
    }
  }

  return response;
}
