/**
 * MyArea24 — Merchant Portal Backend Service
 * Bridges the React Merchant Portal with FastAPI /api/v1/merchant endpoints
 * with localStorage synchronization for offline-first responsiveness.
 */

import { MerchantBusinessInfo } from '../types';
import { getApiBaseUrl } from '../../config/apiClient';

function getMerchantEndpoint(path: string): string | null {
  const base = getApiBaseUrl();
  if (base === null) return null;
  return `${base}${path}`;
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  try {
    const sessionRaw = localStorage.getItem('myarea24_merchant_session_v1');
    if (sessionRaw) {
      const session = JSON.parse(sessionRaw);
      if (session.phone) headers['X-Merchant-Phone'] = session.phone;
      if (session.businessId) headers['X-Merchant-Id'] = String(session.businessId);
    }
    const token = localStorage.getItem('myarea24_auth_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  } catch {}

  return headers;
}

async function merchantFetch(path: string, init: RequestInit = {}): Promise<Response | null> {
  const ep = getMerchantEndpoint(path);
  if (!ep) return null;
  return fetch(ep, {
    ...init,
    headers: {
      ...getAuthHeaders(),
      ...((init.headers as Record<string, string>) || {}),
    },
  });
}

// 1. Storefront Profile & Telemetry
export interface MerchantOverviewMetrics {
  activeProductsCount: number;
  totalProductsCount: number;
  activeServicesCount: number;
  totalServicesCount: number;
  activeOffersCount: number;
  totalOrdersCount: number;
  placedOrdersCount: number;
  totalLeadsCount: number;
  newLeadsCount: number;
  profileViews: number;
  directionClicks: number;
  callClicks: number;
  totalInteractions: number;
}

export async function getMerchantOverview(): Promise<{ business: any; metrics: MerchantOverviewMetrics } | null> {
  try {
    const res = await merchantFetch('/api/v1/merchant/overview');
    if (!res || !res.ok) return null;
    const data = await res.json();
    return { business: data.business, metrics: data.metrics };
  } catch {
    return null;
  }
}

export async function getStorefrontProfile(): Promise<any> {
  try {
    const res = await merchantFetch('/api/v1/merchant/storefront');
    if (!res || !res.ok) return null;
    const data = await res.json();
    return data.storefront;
  } catch {
    return null;
  }
}

export async function updateStorefrontProfile(payload: Partial<MerchantBusinessInfo>): Promise<boolean> {
  try {
    const res = await merchantFetch('/api/v1/merchant/storefront', {
      method: 'PUT',
      body: JSON.stringify({
        name: payload.name,
        tagline: payload.tagline,
        category: payload.category,
        description: payload.fullAddress ? `Serving ${payload.serviceArea || payload.locationArea}` : undefined,
        address: payload.fullAddress,
        locality: payload.locationArea?.split(',')[0]?.trim(),
        city: payload.locationArea?.split(',')[1]?.trim(),
        phone: payload.phone,
        email: payload.email,
        website: payload.website,
        owner_name: payload.ownerName,
      }),
    });
    return res ? res.ok : true;
  } catch {
    return false;
  }
}

// 2. Settings & Preferences
export interface MerchantSettingsPayload {
  notifications: {
    enquiries: boolean;
    reviews: boolean;
    promotions: boolean;
    billing: boolean;
    queries: boolean;
    updates: boolean;
  };
  preferences: {
    language: string;
    timezone: string;
    dateFormat: string;
    currency: string;
    measurement: string;
  };
  security: {
    twoFactorEnabled: boolean;
    lastPasswordChange: string;
  };
  integrations: {
    googleBusinessConnected: boolean;
    whatsAppConnected: boolean;
  };
}

export const SETTINGS_STORAGE_KEY = 'myarea24_merchant_settings_v1';

export const DEFAULT_MERCHANT_SETTINGS: MerchantSettingsPayload = {
  notifications: {
    enquiries: true,
    reviews: true,
    promotions: true,
    billing: true,
    queries: true,
    updates: false,
  },
  preferences: {
    language: 'English',
    timezone: '(GMT +5:30) India Standard Time',
    dateFormat: 'DD MMM YYYY (e.g. 30 Apr 2026)',
    currency: 'INR (₹)',
    measurement: 'Metric (km, m, °C)',
  },
  security: {
    twoFactorEnabled: false,
    lastPasswordChange: 'Recently',
  },
  integrations: {
    googleBusinessConnected: true,
    whatsAppConnected: true,
  },
};

export async function getMerchantSettings(): Promise<MerchantSettingsPayload | null> {
  // 1. Try fetching from active backend API
  try {
    const res = await merchantFetch('/api/v1/merchant/settings');
    if (res && res.ok) {
      const data = await res.json();
      if (data && data.settings) {
        try {
          localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(data.settings));
        } catch {}
        return data.settings;
      }
    }
  } catch {}

  // 2. Offline / Local fallback from localStorage
  try {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_MERCHANT_SETTINGS,
        ...parsed,
        notifications: { ...DEFAULT_MERCHANT_SETTINGS.notifications, ...(parsed.notifications || {}) },
        preferences: { ...DEFAULT_MERCHANT_SETTINGS.preferences, ...(parsed.preferences || {}) },
        security: { ...DEFAULT_MERCHANT_SETTINGS.security, ...(parsed.security || {}) },
        integrations: { ...DEFAULT_MERCHANT_SETTINGS.integrations, ...(parsed.integrations || {}) },
      };
    }
  } catch {}

  return DEFAULT_MERCHANT_SETTINGS;
}

export async function updateMerchantSettings(settings: Partial<MerchantSettingsPayload>): Promise<boolean> {
  // 1. Persist to localStorage immediately
  try {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    const current: MerchantSettingsPayload = saved ? JSON.parse(saved) : { ...DEFAULT_MERCHANT_SETTINGS };
    const merged: MerchantSettingsPayload = {
      ...current,
      ...settings,
      notifications: { ...current.notifications, ...(settings.notifications || {}) },
      preferences: { ...current.preferences, ...(settings.preferences || {}) },
      security: { ...current.security, ...(settings.security || {}) },
      integrations: { ...current.integrations, ...(settings.integrations || {}) },
    };
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged));
  } catch {}

  // 2. Synchronize to backend if available
  try {
    const res = await merchantFetch('/api/v1/merchant/settings', {
      method: 'PUT',
      body: JSON.stringify({
        notifications: settings.notifications,
        preferences: settings.preferences,
        google_business_connected: settings.integrations?.googleBusinessConnected,
        whatsapp_connected: settings.integrations?.whatsAppConnected,
      }),
    });
    return res ? res.ok : true;
  } catch {
    return true; // Still true because saved locally
  }
}

// 3. Security (Password & 2FA)
export async function changeMerchantPassword(newPin: string, oldPin?: string): Promise<{ success: boolean; message: string }> {
  // 1. Update local session & accounts in localStorage
  try {
    const sessionRaw = localStorage.getItem('myarea24_merchant_session_v1');
    if (sessionRaw) {
      const session = JSON.parse(sessionRaw);
      session.storePin = newPin;
      localStorage.setItem('myarea24_merchant_session_v1', JSON.stringify(session));
    }

    const accountsRaw = localStorage.getItem('myarea24_merchant_accounts_v1');
    if (accountsRaw) {
      const accounts = JSON.parse(accountsRaw);
      if (Array.isArray(accounts)) {
        accounts.forEach((acc: any) => {
          acc.storePin = newPin;
        });
        localStorage.setItem('myarea24_merchant_accounts_v1', JSON.stringify(accounts));
      }
    }

    // Update lastPasswordChange in settings
    const currentSettingsRaw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    const currentSettings = currentSettingsRaw ? JSON.parse(currentSettingsRaw) : { ...DEFAULT_MERCHANT_SETTINGS };
    if (!currentSettings.security) currentSettings.security = { twoFactorEnabled: false, lastPasswordChange: 'Just now' };
    currentSettings.security.lastPasswordChange = 'Just now';
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(currentSettings));
  } catch {}

  // 2. Try backend sync
  try {
    const res = await merchantFetch('/api/v1/merchant/security/password', {
      method: 'POST',
      body: JSON.stringify({ old_pin: oldPin, new_pin: newPin }),
    });
    if (res) {
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to update PIN on backend');
      return { success: true, message: data.message || 'Password / PIN updated successfully' };
    }
  } catch (err: any) {
    if (err.message && !err.message.includes('fetch')) {
      return { success: false, message: err.message };
    }
  }

  return { success: true, message: 'Security PIN updated successfully and saved locally.' };
}

export async function toggleMerchant2FA(enabled: boolean, phone?: string): Promise<{ success: boolean; message: string }> {
  // 1. Persist to localStorage
  try {
    const currentSettingsRaw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    const currentSettings = currentSettingsRaw ? JSON.parse(currentSettingsRaw) : { ...DEFAULT_MERCHANT_SETTINGS };
    if (!currentSettings.security) currentSettings.security = { twoFactorEnabled: enabled, lastPasswordChange: 'Recently' };
    currentSettings.security.twoFactorEnabled = enabled;
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(currentSettings));
  } catch {}

  // 2. Try backend sync
  try {
    const res = await merchantFetch('/api/v1/merchant/security/2fa', {
      method: 'POST',
      body: JSON.stringify({ enabled, phone }),
    });
    if (res) {
      const data = await res.json();
      return { success: res.ok, message: data.message || (enabled ? '2FA enabled' : '2FA disabled') };
    }
  } catch {}

  return { success: true, message: enabled ? '2-Factor Authentication enabled' : '2-Factor Authentication disabled' };
}

// 4. Data Management & Actions
export async function exportMerchantData(): Promise<any> {
  // 1. Try backend export
  try {
    const res = await merchantFetch('/api/v1/merchant/export-data');
    if (res && res.ok) {
      return await res.json();
    }
  } catch {}

  // 2. Comprehensive local data export aggregation
  try {
    const parse = (k: string) => {
      try {
        const v = localStorage.getItem(k);
        return v ? JSON.parse(v) : null;
      } catch {
        return null;
      }
    };

    return {
      exportMetadata: {
        platform: 'MyArea24 — Local Intelligence Network',
        version: '1.0.0-mvp',
        exportedAt: new Date().toISOString(),
        environment: 'Offline / Browser-Synchronized',
      },
      business: parse('myarea24_merchant_session_v1'),
      accounts: parse('myarea24_merchant_accounts_v1') || [],
      products: parse('myarea24_merchant_products_v1') || [],
      services: parse('myarea24_merchant_services_v1') || [],
      offers: parse('myarea24_merchant_offers_v1') || [],
      orders: parse('myarea24_merchant_orders_v1') || [],
      posts: parse('myarea24_merchant_posts_v1') || [],
      events: parse('myarea24_merchant_events_v1') || [],
      reviews: parse('myarea24_merchant_reviews_v1') || [],
      leads: parse('myarea24_merchant_leads_v1') || [],
      settings: parse(SETTINGS_STORAGE_KEY) || DEFAULT_MERCHANT_SETTINGS,
    };
  } catch {
    return null;
  }
}

export async function deactivateMerchantAccount(): Promise<{ success: boolean; message: string }> {
  try {
    const res = await merchantFetch('/api/v1/merchant/account/deactivate', {
      method: 'POST',
    });
    if (res) {
      const data = await res.json();
      return { success: res.ok, message: data.message || 'Account deactivated' };
    }
  } catch {}

  return { success: true, message: 'Account deactivated. Listings are temporarily paused.' };
}

export async function deleteMerchantAccountPermanently(): Promise<{ success: boolean; message: string }> {
  try {
    const res = await merchantFetch('/api/v1/merchant/account', {
      method: 'DELETE',
    });
    if (res) {
      const data = await res.json();
      return { success: res.ok, message: data.message || 'Account deleted permanently' };
    }
  } catch {}

  // Clean local data
  try {
    localStorage.removeItem('myarea24_merchant_session_v1');
    localStorage.removeItem('myarea24_merchant_accounts_v1');
    localStorage.removeItem('myarea24_merchant_products_v1');
    localStorage.removeItem('myarea24_merchant_services_v1');
    localStorage.removeItem('myarea24_merchant_offers_v1');
    localStorage.removeItem('myarea24_merchant_orders_v1');
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
  } catch {}

  return { success: true, message: 'Account and storefront data permanently deleted.' };
}

// 5. Orders & Leads Management
export async function updateMerchantOrderStatus(orderId: number | string, status: string): Promise<boolean> {
  try {
    const cleanId = typeof orderId === 'string' ? parseInt(orderId.replace(/\D/g, ''), 10) || 1 : orderId;
    const res = await merchantFetch(`/api/v1/merchant/orders/${cleanId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return res ? res.ok : true;
  } catch {
    return false;
  }
}

export async function updateMerchantLeadStatus(leadId: number | string, status: string): Promise<boolean> {
  try {
    const cleanId = typeof leadId === 'string' ? parseInt(leadId.replace(/\D/g, ''), 10) || 1 : leadId;
    const res = await merchantFetch(`/api/v1/merchant/leads/${cleanId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return res ? res.ok : true;
  } catch {
    return false;
  }
}

// 6. Products, Services, Offers & Events Sync
export async function createMerchantProduct(payload: {
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  inStock?: boolean;
  image?: string;
  description?: string;
}): Promise<boolean> {
  try {
    const res = await merchantFetch('/api/v1/merchant/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res ? res.ok : true;
  } catch {
    return false;
  }
}

export async function createMerchantService(payload: {
  name: string;
  category: string;
  priceValue?: number;
  phone?: string;
  description?: string;
}): Promise<boolean> {
  try {
    const res = await merchantFetch('/api/v1/merchant/services', {
      method: 'POST',
      body: JSON.stringify({
        title: payload.name,
        category: payload.category,
        price_starting: payload.priceValue || 500,
        phone: payload.phone,
        description: payload.description,
      }),
    });
    return res ? res.ok : true;
  } catch {
    return false;
  }
}

export async function createMerchantOffer(payload: {
  title: string;
  discountText: string;
  code?: string;
  validDays?: number;
}): Promise<boolean> {
  try {
    const res = await merchantFetch('/api/v1/merchant/offers', {
      method: 'POST',
      body: JSON.stringify({
        title: payload.title,
        discount_text: payload.discountText,
        coupon_code: payload.code || 'LOCALDEAL',
        valid_until: new Date(Date.now() + (payload.validDays || 14) * 86400000).toISOString(),
      }),
    });
    return res ? res.ok : true;
  } catch {
    return false;
  }
}

export async function createMerchantEvent(payload: {
  title: string;
  category: string;
  venue?: string;
  dateDisplay?: string;
}): Promise<boolean> {
  try {
    const res = await merchantFetch('/api/v1/merchant/events', {
      method: 'POST',
      body: JSON.stringify({
        title: payload.title,
        category: payload.category,
        venue: payload.venue || 'Local Community Venue',
        event_date: new Date(Date.now() + 7 * 86400000).toISOString(),
      }),
    });
    return res ? res.ok : true;
  } catch {
    return false;
  }
}
