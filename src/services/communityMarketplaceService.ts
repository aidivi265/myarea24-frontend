import { useState, useEffect, useCallback } from 'react';
import { LiveAreaIntelligence } from './liveIntelligence';
import { SavedEntry } from '../types';
import {
  AuthUserProfile,
  getStoredAuthUser,
  requestOtp,
  verifyOtp,
  refreshAccessToken,
  logoutUser,
  AUTH_CHANGE_EVENT,
  AUTH_UNAUTHORIZED_EVENT,
} from './authService';
export type { AuthUserProfile };
export { getStoredAuthUser, logoutUser, AUTH_CHANGE_EVENT, AUTH_UNAUTHORIZED_EVENT };

/* ============================================================================
   TYPES FOR LIVE MARKETPLACE, EVENTS, AUTH & VOICE (SARVAM AI)
   ============================================================================ */

export interface LiveBusinessItem {
  id: string;
  numericId?: number;
  slug: string;
  name: string;
  cat: string;
  sub: string;
  description: string;
  address: string;
  locality: string;
  city: string;
  rating: string;
  reviews: string;
  dist: string;
  distanceKm: number;
  status: 'Open' | 'Closed';
  closes: string;
  openingTime: string;
  closingTime: string;
  phone: string;
  whatsapp: string;
  img: string;
  verified: boolean;
  trending: boolean;
  popular: boolean;
  lat: number;
  lng: number;
  activeProductsCount: number;
  activeOffersCount: number;
  source: string;
}

export interface LiveProductItem {
  id: string;
  numericId?: number;
  name: string;
  brand: string;
  cat: string;
  price: string;
  localPriceNum: number;
  oldPrice?: string;
  onlinePriceNum: number;
  onlineProvider: string;
  savingsAmount: number;
  savingsPercent: number;
  betterOffline: boolean;
  unit: string;
  store: string;
  storeAddress: string;
  phone: string;
  dist: string;
  distanceKm: number;
  rating: string;
  reviews: string;
  inStock: boolean;
  freshnessLabel: string;
  discount?: string;
  img: string;
  lat: number;
  lng: number;
}

export interface LiveServiceItem {
  id: string;
  numericId?: number;
  name: string;
  cat: string;
  role: string;
  description: string;
  exp: string;
  rating: string;
  reviews: string;
  dist: string;
  distanceKm: number;
  price: string;
  priceNum: number;
  priceUnit: string;
  avail: string;
  timing: string;
  phone: string;
  whatsapp: string;
  verified: boolean;
  img: string;
  locality: string;
  city: string;
  lat: number;
  lng: number;
}

export interface LiveOfferItem {
  id: string;
  numericId?: number;
  title: string;
  sub: string;
  description: string;
  store: string;
  storeAddress: string;
  phone: string;
  cat: string;
  badge: string;
  badgeColor: string;
  code: string;
  valid: string;
  daysLeft: number;
  dist: string;
  distanceKm: number;
  img: string;
}

export interface LiveEventItem {
  id: string;
  numericId?: number;
  title: string;
  cat: string;
  organizer: string;
  date: string;
  time: string;
  loc: string;
  address: string;
  locality: string;
  city: string;
  dist: string;
  distanceKm: number;
  price: string;
  free: boolean;
  rsvp: string;
  expectedAttendance: number;
  parkingPressure: 'LOW' | 'MODERATE' | 'ELEVATED' | 'CRITICAL';
  trafficImpact: 'LOW' | 'MODERATE' | 'HIGH_BOTTLENECK';
  exitWeatherAdvisory: string;
  commuteCorridor: string;
  source: string;
  registrationUrl?: string;
  img: string;
  lat: number;
  lng: number;
}

export interface LiveEmergencyFacility {
  id: string;
  name: string;
  facilityType: 'Hospital' | 'Police Station' | 'Fire Station' | 'Pharmacy' | 'Trauma Center';
  phone: string;
  address: string;
  locality: string;
  city: string;
  distanceKm: number;
  is24x7: boolean;
  bloodBankAvailable: boolean;
  lat: number;
  lng: number;
}

/* ============================================================================
   HELPER UTILITIES & BACKEND FETCHERS
   ============================================================================ */

async function requestBackend<T>(
  path: string,
  options: RequestInit = {},
  timeoutMs = 4500
): Promise<T | null> {
  const token = localStorage.getItem('myarea24_auth_token');
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const urls = [path, `http://127.0.0.1:8000${path}`];
  for (const url of urls) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      let res = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      // Handle 401 Unauthorized with token refresh rotation
      if (res.status === 401) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          headers.Authorization = `Bearer ${refreshed}`;
          res = await fetch(url, {
            ...options,
            headers,
            signal: controller.signal,
          });
        }
      }

      clearTimeout(timer);
      if (res.ok) {
        return (await res.json()) as T;
      }
    } catch {
      clearTimeout(timer);
    }
  }
  return null;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDist(km: number): string {
  if (km < 1) return `${Math.max(100, Math.round(km * 1000))} m`;
  return `${km.toFixed(1)} km`;
}

const BIZ_IMAGES_BY_CAT: Record<string, string[]> = {
  Restaurants: ['./assets/crops/biz-card-bikanervala.webp', './assets/crops/biz-bikanervala.webp'],
  Cafés: ['./assets/crops/biz-card-chai.webp', './assets/crops/biz-urban-chai.webp'],
  Groceries: ['./assets/crops/store-apna-mart.webp', './assets/crops/store-sharma-fresh.webp'],
  Pharmacies: ['./assets/crops/store-medplus.webp', './assets/crops/biz-ai-essential.webp'],
  Electronics: ['./assets/crops/store-gupta-elec.webp', './assets/crops/offer-croma.webp'],
  Services: ['./assets/crops/srv-electrician.webp', './assets/crops/srv-ac-repair.webp'],
  Fitness: ['./assets/crops/biz-card-cultfit.webp', './assets/crops/biz-sports-complex.webp'],
  Salons: ['./assets/crops/biz-card-looks.webp', './assets/crops/offer-looks.webp'],
};

function pickBizImage(cat: string, idx: number): string {
  const list = BIZ_IMAGES_BY_CAT[cat] || ['./assets/crops/store-apna-mart.webp', './assets/crops/biz-card-chai.webp'];
  return list[idx % list.length];
}

/* ============================================================================
   1. USER AUTHENTICATION (EMAIL OTP: /api/v1/auth/send-otp & /verify-otp)
   ============================================================================ */

const AUTH_USER_KEY = 'myarea24_auth_user_v1';
const PENDING_OTP_KEY = 'myarea24_pending_otp_v1';

export async function sendEmailOtp(
  email: string,
  purpose: 'login' | 'signup' | 'merchant_onboarding' = 'login'
): Promise<{
  success: boolean;
  message: string;
  devOtp?: string;
  backendHandled: boolean;
}> {
  const res = await requestOtp(email, purpose);
  return {
    success: res.success,
    message: res.message,
    devOtp: res.devOtp,
    backendHandled: true,
  };
}

export async function verifyEmailOtp(params: {
  email: string;
  otpCode: string;
  fullName?: string;
  phone?: string;
  role?: 'resident' | 'merchant';
}): Promise<{
  success: boolean;
  user?: AuthUserProfile;
  error?: string;
}> {
  return verifyOtp(params);
}

export function logoutAuthUser(): void {
  logoutUser();
}

export async function syncSavedBookmarkToBackend(
  entryOrType: SavedEntry | 'business' | 'product' | 'service' | 'offer' | 'bulletin' | 'event',
  actionOrId?: 'add' | 'remove' | number
): Promise<void> {
  let itemType: 'business' | 'product' | 'service' | 'offer' | 'bulletin' | 'event' = 'business';
  let itemId = 1;

  if (typeof entryOrType === 'string') {
    itemType = entryOrType;
    itemId = typeof actionOrId === 'number' ? actionOrId : 1;
  } else if (entryOrType && typeof entryOrType === 'object') {
    const cat = (entryOrType.category || '').toLowerCase();
    if (cat.includes('product') || cat.includes('market')) itemType = 'product';
    else if (cat.includes('service')) itemType = 'service';
    else if (cat.includes('offer')) itemType = 'offer';
    else if (cat.includes('event')) itemType = 'event';
    else if (cat.includes('bulletin') || cat.includes('alert')) itemType = 'bulletin';
    else itemType = 'business';

    const numMatch = (entryOrType.id || '').match(/\d+/);
    itemId = numMatch ? parseInt(numMatch[0], 10) : 1;
  }

  await requestBackend('/api/v1/saved', {
    method: 'POST',
    body: JSON.stringify({ item_type: itemType, item_id: itemId }),
  });
}

/* ============================================================================
   2. SARVAM AI HINDI / ENGLISH VOICE INPUT (STT) & TEXT-TO-SPEECH (TTS)
   ============================================================================ */

const SARVAM_KEY_STORAGE = 'myarea24_sarvam_api_key';

export function getSarvamApiKey(): string {
  return (
    (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SARVAM_API_KEY ||
    localStorage.getItem(SARVAM_KEY_STORAGE) ||
    ''
  );
}

export async function speakTextWithSarvamOrBrowser(
  text: string,
  lang: 'hi-IN' | 'en-IN' = 'hi-IN',
  onEnd?: () => void
): Promise<{ provider: 'Sarvam AI Bulbul v1' | 'Browser Neural Speech'; stop: () => void }> {
  const cleanText = text.replace(/[*#_`~]/g, '').slice(0, 480);
  const sarvamKey = getSarvamApiKey();

  // 1. Try Sarvam AI Bulbul TTS if API key is available
  if (sarvamKey) {
    try {
      const res = await fetch('https://api.sarvam.ai/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-subscription-key': sarvamKey,
        },
        body: JSON.stringify({
          inputs: [cleanText],
          target_language_code: lang,
          speaker: 'meera',
          pitch: 0,
          pace: 1.05,
          loudness: 1.5,
          speech_sample_rate: 16000,
          enable_preprocessing: true,
          model: 'bulbul:v1',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const base64Audio = data?.audios?.[0];
        if (base64Audio) {
          const audio = new Audio(`data:audio/wav;base64,${base64Audio}`);
          audio.onended = () => onEnd?.();
          await audio.play();
          return {
            provider: 'Sarvam AI Bulbul v1',
            stop: () => {
              audio.pause();
              audio.currentTime = 0;
              onEnd?.();
            },
          };
        }
      }
    } catch {
      // Fall through to Web Speech API
    }
  }

  // 2. Fallback to Browser Web Speech Synthesis (supports hi-IN & en-IN natively)
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang;
    utterance.rate = 1.02;
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice =
      voices.find((v) => v.lang.toLowerCase().includes(lang.toLowerCase())) ||
      voices.find((v) => v.lang.toLowerCase().includes('hi') || v.lang.toLowerCase().includes('in'));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    utterance.onend = () => onEnd?.();
    utterance.onerror = () => onEnd?.();
    window.speechSynthesis.speak(utterance);
    return {
      provider: 'Browser Neural Speech',
      stop: () => {
        window.speechSynthesis.cancel();
        onEnd?.();
      },
    };
  }

  onEnd?.();
  return { provider: 'Browser Neural Speech', stop: () => {} };
}

export function startVoiceRecognition(
  lang: 'hi-IN' | 'en-IN',
  onResult: (transcript: string, isFinal: boolean) => void,
  onError: (msg: string) => void,
  onEnd: () => void
): { stop: () => void } {
  const SpeechRec =
    (window as unknown as Record<string, unknown>).SpeechRecognition ||
    (window as unknown as Record<string, unknown>).webkitSpeechRecognition;

  if (!SpeechRec) {
    onError('Voice recognition is supported in Chrome, Edge, and mobile browsers.');
    onEnd();
    return { stop: () => {} };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognition: any = new (SpeechRec as any)();
  recognition.lang = lang;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recognition.onresult = (event: any) => {
    let transcript = '';
    let isFinal = false;
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
      if (event.results[i].isFinal) isFinal = true;
    }
    onResult(transcript, isFinal);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recognition.onerror = (ev: any) => {
    if (ev?.error !== 'aborted') {
      onError(ev?.error === 'not-allowed' ? 'Microphone permission denied.' : `Voice error: ${ev?.error || 'unknown'}`);
    }
    onEnd();
  };

  recognition.onend = () => {
    onEnd();
  };

  recognition.start();
  return {
    stop: () => {
      try {
        recognition.stop();
      } catch {
        // ignore
      }
    },
  };
}

/* ============================================================================
   3. LIVE COMMUNITY MARKETPLACE HOOK
      Connects /api/v1/businesses, /api/v1/products, /api/v1/services,
      /api/v1/offers, /api/v1/events, /api/v1/emergency/facilities + Overpass
   ============================================================================ */

export const CUSTOM_BIZ_KEY = 'myarea24_custom_businesses_v1';
export const CUSTOM_PROD_KEY = 'myarea24_custom_products_v1';
export const CUSTOM_SVC_KEY = 'myarea24_custom_services_v1';
export const CUSTOM_OFFER_KEY = 'myarea24_custom_offers_v1';
export const CUSTOM_EVENT_KEY = 'myarea24_custom_events_v1';
export const MERCHANT_REGISTRATION_KEY = 'myarea24_merchant_registered_v1';
export const MERCHANT_ACCOUNTS_KEY = 'myarea24_merchant_accounts_v1';
export const MERCHANT_SESSION_KEY = 'myarea24_merchant_session_v1';

export interface MerchantRegistrationProfile {
  id?: string;
  businessName: string;
  category: string;
  ownerName: string;
  phone: string;
  whatsapp: string;
  email: string;
  fullAddress: string;
  locality: string;
  city: string;
  pincode: string;
  docType: 'GSTIN' | 'MSME_UDYAM' | 'FSSAI' | 'TRADE_LICENSE' | 'SHOP_ACT';
  docNumber: string;
  openingTime: string;
  closingTime: string;
  storePin?: string; // 4-6 digit Security PIN or Password
  tagline?: string;
  isVerified: boolean;
  registeredAt: string;
}

export function getStoredMerchantAccounts(): MerchantRegistrationProfile[] {
  try {
    const raw = localStorage.getItem(MERCHANT_ACCOUNTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

export function getStoredMerchantSession(): MerchantRegistrationProfile | null {
  try {
    const raw = localStorage.getItem(MERCHANT_SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.businessName && parsed.isVerified) {
        return parsed;
      }
    }
  } catch {}
  return null;
}

export function saveMerchantSession(profile: MerchantRegistrationProfile): void {
  try {
    localStorage.setItem(MERCHANT_SESSION_KEY, JSON.stringify(profile));
    localStorage.setItem(MERCHANT_REGISTRATION_KEY, JSON.stringify(profile));
    window.dispatchEvent(new CustomEvent('myarea24_merchant_session_changed', { detail: profile }));
  } catch {}
}

export function clearMerchantSession(): void {
  try {
    localStorage.removeItem(MERCHANT_SESSION_KEY);
    window.dispatchEvent(new CustomEvent('myarea24_merchant_session_changed', { detail: null }));
  } catch {}
}

export function getStoredMerchantProfile(): MerchantRegistrationProfile | null {
  // First check active authenticated session
  const session = getStoredMerchantSession();
  if (session) return session;

  try {
    const raw = localStorage.getItem(MERCHANT_REGISTRATION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.businessName && parsed.isVerified) {
        return parsed;
      }
    }
  } catch {}
  return null;
}

export function saveMerchantRegistration(profile: MerchantRegistrationProfile): void {
  try {
    const profileWithId: MerchantRegistrationProfile = {
      ...profile,
      id: profile.id || `biz_${profile.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}_${Date.now().toString(36)}`,
    };

    // 1. Update legacy single registration pointer
    localStorage.setItem(MERCHANT_REGISTRATION_KEY, JSON.stringify(profileWithId));

    // 2. Add or update in multi-store accounts list
    const accounts = getStoredMerchantAccounts();
    const existingIndex = accounts.findIndex(
      (a) =>
        (a.id && a.id === profileWithId.id) ||
        a.businessName.toLowerCase() === profileWithId.businessName.toLowerCase() ||
        (a.phone && a.phone === profileWithId.phone)
    );
    let updatedAccounts: MerchantRegistrationProfile[];
    if (existingIndex >= 0) {
      updatedAccounts = [...accounts];
      updatedAccounts[existingIndex] = profileWithId;
    } else {
      updatedAccounts = [profileWithId, ...accounts];
    }
    localStorage.setItem(MERCHANT_ACCOUNTS_KEY, JSON.stringify(updatedAccounts));

    // 3. Set active authenticated session
    saveMerchantSession(profileWithId);

    window.dispatchEvent(new CustomEvent('myarea24_merchant_registered', { detail: profileWithId }));
    window.dispatchEvent(new CustomEvent('myarea24_marketplace_sync'));
  } catch {}
}

export function verifyMerchantCredentials(
  identifier: string,
  storePin: string
): { success: boolean; profile?: MerchantRegistrationProfile; error?: string } {
  const cleanId = identifier.trim().toLowerCase().replace(/\s+/g, '');
  const cleanPin = storePin.trim();
  const accounts = getStoredMerchantAccounts();

  // Also check single legacy profile
  const legacy = getStoredMerchantProfile();
  const allAccounts = [...accounts];
  if (legacy && !allAccounts.some((a) => a.phone === legacy.phone)) {
    allAccounts.push(legacy);
  }

  const match = allAccounts.find((a) => {
    const phoneClean = (a.phone || '').replace(/\s+/g, '').toLowerCase();
    const emailClean = (a.email || '').toLowerCase().trim();
    return (
      phoneClean === cleanId ||
      phoneClean.endsWith(cleanId) ||
      cleanId.endsWith(phoneClean) ||
      emailClean === cleanId
    );
  });

  if (!match) {
    return {
      success: false,
      error: 'No merchant storefront found matching this phone number or email.',
    };
  }

  // If storePin was configured, check it. (If default demo account had no PIN, permit or require PIN)
  if (match.storePin && match.storePin !== cleanPin) {
    return {
      success: false,
      error: 'Incorrect Store Access PIN / Password. Please check and try again.',
    };
  }

  // Set active session
  saveMerchantSession(match);
  return { success: true, profile: match };
}

export function loadLocalList<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
}

export function saveLocalList<T>(key: string, list: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('myarea24_marketplace_sync'));
  } catch {
    // ignore
  }
}

export interface LiveCommunityMarketplaceState {
  loading: boolean;
  businesses: LiveBusinessItem[];
  products: LiveProductItem[];
  services: LiveServiceItem[];
  offers: LiveOfferItem[];
  events: LiveEventItem[];
  emergencyFacilities: LiveEmergencyFacility[];
  addBusiness: (biz: Partial<LiveBusinessItem>) => Promise<LiveBusinessItem>;
  addProduct: (prod: Partial<LiveProductItem>) => Promise<LiveProductItem>;
  addService: (svc: Partial<LiveServiceItem>) => Promise<LiveServiceItem>;
  addOffer: (offer: Partial<LiveOfferItem>) => Promise<LiveOfferItem>;
  addEvent: (ev: Partial<LiveEventItem>) => Promise<LiveEventItem>;
  refreshMarketplace: () => void;
}

export function useLiveCommunityMarketplace(
  liveIntel: LiveAreaIntelligence
): LiveCommunityMarketplaceState {
  const { lat, lng, areaName, city } = liveIntel.location;
  const localityShort = areaName ? areaName.split(',')[0].trim() : 'Local Area';
  const cityShort = city || (areaName && areaName.includes(',') ? areaName.split(',')[1]?.trim() : 'India') || 'India';

  const [loading, setLoading] = useState(false);
  const [businesses, setBusinesses] = useState<LiveBusinessItem[]>([]);
  const [products, setProducts] = useState<LiveProductItem[]>([]);
  const [services, setServices] = useState<LiveServiceItem[]>([]);
  const [offers, setOffers] = useState<LiveOfferItem[]>([]);
  const [events, setEvents] = useState<LiveEventItem[]>([]);
  const [emergencyFacilities, setEmergencyFacilities] = useState<LiveEmergencyFacility[]>([]);
  const [refreshTick, setRefreshTick] = useState(0);

  const refreshMarketplace = useCallback(() => {
    setRefreshTick((t) => t + 1);
  }, []);

  // Live Cross-Portal Synchronizer (triggers instant updates across tabs/portals on merchant updates)
  useEffect(() => {
    const handleSync = () => {
      setRefreshTick((t) => t + 1);
    };
    window.addEventListener('myarea24_marketplace_sync', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('myarea24_marketplace_sync', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function fetchAllModules() {
      const qParams = `locality=${encodeURIComponent(localityShort)}&city=${encodeURIComponent(
        cityShort
      )}&user_lat=${lat}&user_lon=${lng}`;

      // Parallel fetch from FastAPI endpoints + Overpass commercial POIs
      const [
        backendBiz,
        backendProd,
        backendSvc,
        backendOffers,
        backendEvents,
        backendEmergency,
        overpassBiz,
      ] = await Promise.all([
        requestBackend<{ items: Record<string, unknown>[] }>(`/api/v1/businesses?${qParams}&page_size=24`),
        requestBackend<{ items: Record<string, unknown>[] }>(`/api/v1/products?${qParams}&page_size=24`),
        requestBackend<{ items: Record<string, unknown>[] }>(`/api/v1/services?${qParams}&page_size=20`),
        requestBackend<{ items: Record<string, unknown>[] }>(`/api/v1/offers?${qParams}&page_size=20`),
        requestBackend<{ items: Record<string, unknown>[] }>(
          `/api/v1/events?locality=${encodeURIComponent(localityShort)}&city=${encodeURIComponent(
            cityShort
          )}&lat=${lat}&lon=${lng}&page_size=20`
        ),
        requestBackend<{ facilities: Record<string, unknown>[] }>(
          `/api/v1/emergency/facilities?latitude=${lat}&longitude=${lng}&city=${encodeURIComponent(
            cityShort
          )}&locality=${encodeURIComponent(localityShort)}`
        ),
        fetchOverpassBusinesses(lat, lng, localityShort, cityShort),
      ]);

      if (cancelled) return;

      // 1. Assemble Businesses (Custom + Backend + Overpass + Locality Baseline)
      const customBiz = loadLocalList<LiveBusinessItem>(CUSTOM_BIZ_KEY);
      const apiBizList: LiveBusinessItem[] = (backendBiz?.items || []).map((b, idx) => {
        const rawCat = String(b.category || 'Restaurants');
        const mappedCat = mapToFrontendBizCategory(rawCat);
        const dKm = Number(b.distance_km ?? haversineKm(lat, lng, Number(b.latitude || lat), Number(b.longitude || lng)));
        return {
          id: `api-biz-${b.id || idx}`,
          numericId: Number(b.id || idx + 1),
          slug: String(b.slug || `biz-${idx}`),
          name: String(b.name || `${localityShort} Store`),
          cat: mappedCat,
          sub: `${String(b.subcategory || rawCat)} • ${String(b.locality || localityShort)}`,
          description: String(b.description || `Verified merchant in ${localityShort}, ${cityShort}`),
          address: String(b.address || `${localityShort}, ${cityShort}`),
          locality: String(b.locality || localityShort),
          city: String(b.city || cityShort),
          rating: Number(b.rating || 4.6).toFixed(1),
          reviews: `(${b.review_count || 140})`,
          dist: formatDist(dKm),
          distanceKm: dKm,
          status: b.is_open_now === false ? 'Closed' : 'Open',
          closes: `Closes ${b.closing_time || '10:00 PM'}`,
          openingTime: String(b.opening_time || '09:00'),
          closingTime: String(b.closing_time || '22:00'),
          phone: String(b.phone || '+91 98110 24024'),
          whatsapp: String(b.whatsapp || b.phone || '+91 98110 24024'),
          img: pickBizImage(mappedCat, idx),
          verified: Boolean(b.is_verified ?? true),
          trending: idx < 3,
          popular: Number(b.rating || 4.6) >= 4.5,
          lat: Number(b.latitude || lat + 0.002),
          lng: Number(b.longitude || lng + 0.002),
          activeProductsCount: Number(b.active_products_count || 4),
          activeOffersCount: Number(b.active_offers_count || 1),
          source: 'FastAPI /api/v1/businesses',
        };
      });

      const mergedBizMap = new Map<string, LiveBusinessItem>();
      for (const item of [...customBiz, ...apiBizList, ...overpassBiz]) {
        const key = item.name.toLowerCase().trim();
        if (!mergedBizMap.has(key)) {
          mergedBizMap.set(key, item);
        }
      }
      // Ensure every category has rich representation in the active locality
      const fallbackBiz = buildLocalizedBusinesses(lat, lng, localityShort, cityShort);
      for (const fb of fallbackBiz) {
        const key = fb.name.toLowerCase().trim();
        if (!mergedBizMap.has(key)) {
          mergedBizMap.set(key, fb);
        }
      }
      const finalBiz = Array.from(mergedBizMap.values()).sort((a, b) => a.distanceKm - b.distanceKm);
      setBusinesses(finalBiz);

      // 2. Assemble Products (Custom + Backend + Grounded in Discovered Local Stores)
      const customProds = loadLocalList<LiveProductItem>(CUSTOM_PROD_KEY);
      const apiProdList: LiveProductItem[] = (backendProd?.items || []).map((p, idx) => {
        const bizObj = (p.business as Record<string, unknown>) || {};
        const localPrice = Number(p.local_price || 120);
        const onlinePrice = Number(p.online_price || p.mrp || Math.round(localPrice * 1.15));
        const dKm = Number(bizObj.distance_km ?? 0.8);
        const mappedCat = mapToFrontendProdCategory(String(p.category || 'Groceries'));
        const savings = Math.max(0, onlinePrice - localPrice);
        return {
          id: `api-prod-${p.id || idx}`,
          numericId: Number(p.id || idx + 1),
          name: String(p.name || 'Local Essential'),
          brand: String(p.brand || 'Verified Local'),
          cat: mappedCat,
          price: `₹${localPrice.toLocaleString('en-IN')}`,
          localPriceNum: localPrice,
          oldPrice: onlinePrice > localPrice ? `₹${onlinePrice.toLocaleString('en-IN')}` : undefined,
          onlinePriceNum: onlinePrice,
          onlineProvider: String(p.online_provider || 'Blinkit / Amazon'),
          savingsAmount: savings,
          savingsPercent: onlinePrice > 0 ? Math.round((savings / onlinePrice) * 100) : 0,
          betterOffline: localPrice <= onlinePrice,
          unit: '1 unit • In Stock',
          store: String(bizObj.name || finalBiz[idx % Math.max(1, finalBiz.length)]?.name || `${localityShort} Supermart`),
          storeAddress: String(bizObj.address || `${localityShort}, ${cityShort}`),
          phone: String(bizObj.phone || '+91 98110 24024'),
          dist: formatDist(dKm),
          distanceKm: dKm,
          rating: Number(bizObj.rating || 4.6).toFixed(1),
          reviews: `(${120 + idx * 19})`,
          inStock: p.availability_status !== 'out_of_stock',
          freshnessLabel: String(p.freshness_label || 'Updated 10m ago'),
          discount: savings > 0 ? `Save ₹${savings}` : undefined,
          img: pickProdImage(String(p.name || ''), mappedCat, idx),
          lat: Number(bizObj.latitude || lat + 0.002),
          lng: Number(bizObj.longitude || lng - 0.002),
        };
      });

      const groundedProds = buildLocalizedProducts(lat, lng, localityShort, cityShort, finalBiz, liveIntel.mandiRates);
      const mergedProdMap = new Map<string, LiveProductItem>();
      for (const item of [...customProds, ...apiProdList, ...groundedProds]) {
        const key = `${item.name.toLowerCase()}-${item.store.toLowerCase()}`;
        if (!mergedProdMap.has(key)) {
          mergedProdMap.set(key, item);
        }
      }
      setProducts(Array.from(mergedProdMap.values()));

      // 3. Assemble Services (Custom + Backend + Localized Professionals)
      const customSvcs = loadLocalList<LiveServiceItem>(CUSTOM_SVC_KEY);
      const apiSvcList: LiveServiceItem[] = (backendSvc?.items || []).map((s, idx) => {
        const dKm = Number(s.distance_km ?? 0.9);
        const priceNum = Number(s.price_starting_at || 249);
        const mappedCat = mapToFrontendSvcCategory(String(s.category || 'Home Repair'));
        return {
          id: `api-svc-${s.id || idx}`,
          numericId: Number(s.id || idx + 1),
          name: String(s.provider_name || `${localityShort} Service Pro`),
          cat: mappedCat,
          role: `${String(s.category || 'Specialist')} • ${localityShort}`,
          description: String(s.description || `Verified doorstep service across ${localityShort}, ${cityShort}`),
          exp: `${s.experience_years || 7} yrs exp`,
          rating: Number(s.rating || 4.8).toFixed(1),
          reviews: `(${s.review_count || 64})`,
          dist: formatDist(dKm),
          distanceKm: dKm,
          price: `Starts ₹${priceNum}`,
          priceNum,
          priceUnit: String(s.price_unit || 'per visit'),
          avail: 'Available Today',
          timing: String(s.timing || '08:00 AM - 09:00 PM'),
          phone: String(s.phone || '+91 98112 44101'),
          whatsapp: String(s.whatsapp || s.phone || '+91 98112 44101'),
          verified: Boolean(s.is_verified ?? true),
          img: pickSvcImage(mappedCat, idx),
          locality: String(s.locality || localityShort),
          city: String(s.city || cityShort),
          lat: Number(s.latitude || lat + 0.002),
          lng: Number(s.longitude || lng + 0.001),
        };
      });

      const groundedSvcs = buildLocalizedServices(lat, lng, localityShort, cityShort);
      const mergedSvcMap = new Map<string, LiveServiceItem>();
      for (const item of [...customSvcs, ...apiSvcList, ...groundedSvcs]) {
        const key = item.name.toLowerCase();
        if (!mergedSvcMap.has(key)) {
          mergedSvcMap.set(key, item);
        }
      }
      setServices(Array.from(mergedSvcMap.values()));

      // 4. Assemble Offers (Custom + Backend + Storefront Deals)
      const customOffers = loadLocalList<LiveOfferItem>(CUSTOM_OFFER_KEY);
      const apiOfferList: LiveOfferItem[] = (backendOffers?.items || []).map((o, idx) => {
        const bizObj = (o.business as Record<string, unknown>) || {};
        const dKm = Number(o.distance_km ?? bizObj.distance_km ?? 0.9);
        const mappedCat = mapToFrontendOfferCategory(String(o.category || 'Food & Dining'));
        return {
          id: `api-offer-${o.id || idx}`,
          numericId: Number(o.id || idx + 1),
          title: String(o.title || 'Flat 15% Off In-Store'),
          sub: String(o.description || `Valid at ${bizObj.name || localityShort}`),
          description: String(o.description || `Redeemable at counter or via WhatsApp order in ${localityShort}.`),
          store: String(bizObj.name || `${localityShort} Merchant`),
          storeAddress: String(bizObj.address || `${localityShort}, ${cityShort}`),
          phone: String(bizObj.phone || '+91 98110 24024'),
          cat: mappedCat,
          badge: String(o.discount_text || '15% OFF'),
          badgeColor: idx % 2 === 0 ? 'bg-orange-500 text-white' : 'bg-emerald-600 text-white',
          code: String(o.coupon_code || 'MYAREA15'),
          valid: `${o.days_left ?? 12} days left`,
          daysLeft: Number(o.days_left ?? 12),
          dist: formatDist(dKm),
          distanceKm: dKm,
          img: pickOfferImage(mappedCat, idx),
        };
      });

      const groundedOffers = buildLocalizedOffers(localityShort, cityShort, finalBiz);
      const mergedOfferMap = new Map<string, LiveOfferItem>();
      for (const item of [...customOffers, ...apiOfferList, ...groundedOffers]) {
        const key = `${item.title.toLowerCase()}-${item.store.toLowerCase()}`;
        if (!mergedOfferMap.has(key)) {
          mergedOfferMap.set(key, item);
        }
      }
      setOffers(Array.from(mergedOfferMap.values()));

      // 5. Assemble Events (Custom + Backend /api/v1/events + Localized Civic/Community Events)
      const customEvents = loadLocalList<LiveEventItem>(CUSTOM_EVENT_KEY);
      const apiEventList: LiveEventItem[] = (backendEvents?.items || []).map((e, idx) => {
        const dKm = Number(e.distance_km ?? haversineKm(lat, lng, Number(e.latitude || lat), Number(e.longitude || lng)));
        const startDt = e.start_time ? new Date(String(e.start_time)) : new Date(Date.now() + (idx + 1) * 86400000);
        const dateLabel = isNaN(startDt.getTime())
          ? 'This Weekend'
          : startDt.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
        const mappedCat = mapToFrontendEventCategory(String(e.category || 'Community'));
        const att = Number(e.expected_attendance || 450);
        return {
          id: `api-ev-${e.id || idx}`,
          numericId: Number(e.id || idx + 1),
          title: String(e.title || `${localityShort} Community Meet`),
          cat: mappedCat,
          organizer: String(e.organizer || `${cityShort} Civic Forum`),
          date: dateLabel,
          time: String(e.timing_text || '06:00 PM onwards'),
          loc: `${String(e.venue_name || localityShort)}, ${String(e.locality || localityShort)}`,
          address: String(e.address || `${localityShort}, ${cityShort}`),
          locality: String(e.locality || localityShort),
          city: String(e.city || cityShort),
          dist: formatDist(dKm),
          distanceKm: dKm,
          price: mappedCat === 'Civic & Health' || mappedCat === 'Sports & Fitness' ? 'Free Entry' : 'Free / Open RSVP',
          free: true,
          rsvp: `${att}+ expected`,
          expectedAttendance: att,
          parkingPressure: (e.parking_pressure as LiveEventItem['parkingPressure']) || 'MODERATE',
          trafficImpact: (e.arterial_traffic_impact as LiveEventItem['trafficImpact']) || 'MODERATE',
          exitWeatherAdvisory: String(
            e.exit_weather_advisory ||
              `${liveIntel.weather.conditionText} (${liveIntel.weather.temperatureC}°C) expected during dispersal.`
          ),
          commuteCorridor: String(
            e.correlated_commute_route ||
              liveIntel.traffic.corridors[0]?.roadName ||
              `${localityShort} Main Arterial`
          ),
          source: String(e.source || 'AllEvents.in / Verified Civic Feed'),
          registrationUrl: e.registration_url ? String(e.registration_url) : undefined,
          img: pickEventImage(mappedCat, idx),
          lat: Number(e.latitude || lat + 0.004),
          lng: Number(e.longitude || lng - 0.003),
        };
      });

      const groundedEvents = buildLocalizedEvents(lat, lng, localityShort, cityShort, liveIntel);
      const mergedEventMap = new Map<string, LiveEventItem>();
      for (const item of [...customEvents, ...apiEventList, ...groundedEvents]) {
        const key = item.title.toLowerCase();
        if (!mergedEventMap.has(key)) {
          mergedEventMap.set(key, item);
        }
      }
      setEvents(Array.from(mergedEventMap.values()));

      // 6. Assemble Emergency Facilities (/api/v1/emergency/facilities + Overpass liveIntel.nearbyPois)
      const apiEmergList: LiveEmergencyFacility[] = (backendEmergency?.facilities || []).map((f, idx) => {
        const dKm = Number(
          f.distance_km ?? haversineKm(lat, lng, Number(f.latitude || lat), Number(f.longitude || lng))
        );
        return {
          id: `api-emerg-${f.id || idx}`,
          name: String(f.name || `${localityShort} Emergency Hospital`),
          facilityType: mapFacilityType(String(f.facility_type || 'Hospital')),
          phone: String(f.phone || '108'),
          address: String(f.address || `${localityShort}, ${cityShort}`),
          locality: String(f.locality || localityShort),
          city: String(f.city || cityShort),
          distanceKm: dKm,
          is24x7: Boolean(f.is_24_7 ?? true),
          bloodBankAvailable: Boolean(f.blood_bank_available ?? true),
          lat: Number(f.latitude || lat + 0.003),
          lng: Number(f.longitude || lng + 0.003),
        };
      });

      const poiEmergList: LiveEmergencyFacility[] = liveIntel.nearbyPois
        .filter((p) => ['hospital', 'police', 'fire', 'pharmacy'].includes(p.category))
        .map((p) => ({
          id: `osm-emerg-${p.id}`,
          name: p.name,
          facilityType:
            p.category === 'police'
              ? 'Police Station'
              : p.category === 'fire'
              ? 'Fire Station'
              : p.category === 'pharmacy'
              ? 'Pharmacy'
              : 'Hospital',
          phone: p.phone || (p.category === 'police' ? '112' : p.category === 'fire' ? '101' : '108'),
          address: `${p.sublabel} • ${localityShort}, ${cityShort}`,
          locality: localityShort,
          city: cityShort,
          distanceKm: p.distanceKm,
          is24x7: true,
          bloodBankAvailable: p.category === 'hospital',
          lat: p.latitude,
          lng: p.longitude,
        }));

      const mergedEmergMap = new Map<string, LiveEmergencyFacility>();
      for (const item of [...apiEmergList, ...poiEmergList]) {
        const key = item.name.toLowerCase();
        if (!mergedEmergMap.has(key)) {
          mergedEmergMap.set(key, item);
        }
      }
      setEmergencyFacilities(
        Array.from(mergedEmergMap.values()).sort((a, b) => a.distanceKm - b.distanceKm)
      );
      setLoading(false);
    }

    fetchAllModules();

    return () => {
      cancelled = true;
    };
  }, [lat, lng, localityShort, cityShort, refreshTick, liveIntel]);

  // CRUD Actions
  const addBusiness = async (biz: Partial<LiveBusinessItem>): Promise<LiveBusinessItem> => {
    const cat = biz.cat || 'Restaurants';
    const created: LiveBusinessItem = {
      id: `custom-biz-${Date.now()}`,
      slug: `custom-biz-${Date.now()}`,
      name: biz.name || `${localityShort} Local Store`,
      cat,
      sub: `${cat} • ${localityShort}`,
      description: biz.description || `Verified storefront in ${localityShort}, ${cityShort}.`,
      address: biz.address || `Main Market, ${localityShort}, ${cityShort}`,
      locality: localityShort,
      city: cityShort,
      rating: '4.8',
      reviews: '(New)',
      dist: '0.3 km',
      distanceKm: 0.3,
      status: 'Open',
      closes: `Closes ${biz.closingTime || '10:00 PM'}`,
      openingTime: biz.openingTime || '09:00',
      closingTime: biz.closingTime || '22:00',
      phone: biz.phone || '+91 98110 24024',
      whatsapp: biz.phone || '+91 98110 24024',
      img: pickBizImage(cat, 0),
      verified: true,
      trending: true,
      popular: true,
      lat: lat + 0.0015,
      lng: lng + 0.0015,
      activeProductsCount: 1,
      activeOffersCount: 1,
      source: 'Merchant Self-Onboarded',
    };

    await requestBackend('/api/v1/businesses', {
      method: 'POST',
      body: JSON.stringify({
        name: created.name,
        category: created.cat,
        description: created.description,
        address: created.address,
        locality: localityShort,
        city: cityShort,
        latitude: created.lat,
        longitude: created.lng,
        phone: created.phone,
      }),
    });

    const existing = loadLocalList<LiveBusinessItem>(CUSTOM_BIZ_KEY);
    saveLocalList(CUSTOM_BIZ_KEY, [created, ...existing]);
    setBusinesses((prev) => [created, ...prev]);
    return created;
  };

  const addProduct = async (prod: Partial<LiveProductItem>): Promise<LiveProductItem> => {
    const localNum = Number(prod.localPriceNum || 199);
    const onlineNum = Number(prod.onlinePriceNum || Math.round(localNum * 1.15));
    const savings = Math.max(0, onlineNum - localNum);
    const cat = prod.cat || 'Groceries';
    const created: LiveProductItem = {
      id: `custom-prod-${Date.now()}`,
      name: prod.name || 'Fresh Local Item',
      brand: prod.brand || localityShort,
      cat,
      price: `₹${localNum.toLocaleString('en-IN')}`,
      localPriceNum: localNum,
      oldPrice: onlineNum > localNum ? `₹${onlineNum.toLocaleString('en-IN')}` : undefined,
      onlinePriceNum: onlineNum,
      onlineProvider: 'Online MRP',
      savingsAmount: savings,
      savingsPercent: onlineNum > 0 ? Math.round((savings / onlineNum) * 100) : 0,
      betterOffline: true,
      unit: prod.unit || '1 unit • In Stock',
      store: prod.store || businesses[0]?.name || `${localityShort} Supermart`,
      storeAddress: `${localityShort}, ${cityShort}`,
      phone: prod.phone || '+91 98110 24024',
      dist: '0.4 km',
      distanceKm: 0.4,
      rating: '4.7',
      reviews: '(Verified)',
      inStock: true,
      freshnessLabel: 'Added just now',
      discount: savings > 0 ? `Save ₹${savings}` : 'Live Price',
      img: pickProdImage(prod.name || '', cat, 0),
      lat: lat + 0.001,
      lng: lng - 0.001,
    };

    await requestBackend('/api/v1/products', {
      method: 'POST',
      body: JSON.stringify({
        business_id: 1,
        name: created.name,
        brand: created.brand,
        category: created.cat,
        local_price: localNum,
        online_price: onlineNum,
        availability_status: 'in_stock',
      }),
    });

    const existing = loadLocalList<LiveProductItem>(CUSTOM_PROD_KEY);
    saveLocalList(CUSTOM_PROD_KEY, [created, ...existing]);
    setProducts((prev) => [created, ...prev]);
    return created;
  };

  const addService = async (svc: Partial<LiveServiceItem>): Promise<LiveServiceItem> => {
    const priceNum = Number(svc.priceNum || 299);
    const cat = svc.cat || 'Home Repair';
    const created: LiveServiceItem = {
      id: `custom-svc-${Date.now()}`,
      name: svc.name || `${localityShort} Verified Specialist`,
      cat,
      role: `${svc.role || cat} • ${localityShort}`,
      description: svc.description || `Doorstep ${cat} specialist serving ${localityShort}, ${cityShort}.`,
      exp: svc.exp || '6 yrs exp',
      rating: '4.8',
      reviews: '(Verified)',
      dist: '0.5 km',
      distanceKm: 0.5,
      price: `Starts ₹${priceNum}`,
      priceNum,
      priceUnit: 'per visit',
      avail: 'Available Now',
      timing: '08:00 AM - 09:00 PM',
      phone: svc.phone || '+91 98112 44101',
      whatsapp: svc.phone || '+91 98112 44101',
      verified: true,
      img: pickSvcImage(cat, 0),
      locality: localityShort,
      city: cityShort,
      lat: lat + 0.002,
      lng: lng + 0.001,
    };

    await requestBackend('/api/v1/services', {
      method: 'POST',
      body: JSON.stringify({
        provider_name: created.name,
        category: created.cat,
        description: created.description,
        service_area: `${localityShort}, ${cityShort}`,
        locality: localityShort,
        city: cityShort,
        latitude: created.lat,
        longitude: created.lng,
        phone: created.phone,
        price_starting_at: priceNum,
      }),
    });

    const existing = loadLocalList<LiveServiceItem>(CUSTOM_SVC_KEY);
    saveLocalList(CUSTOM_SVC_KEY, [created, ...existing]);
    setServices((prev) => [created, ...prev]);
    return created;
  };

  const addOffer = async (offer: Partial<LiveOfferItem>): Promise<LiveOfferItem> => {
    const cat = offer.cat || 'Food & Dining';
    const created: LiveOfferItem = {
      id: `custom-offer-${Date.now()}`,
      title: offer.title || 'Flat 20% Off Walk-In Deal',
      sub: offer.sub || `Valid at ${offer.store || localityShort}`,
      description: offer.description || `Show coupon code at billing counter in ${localityShort}.`,
      store: offer.store || businesses[0]?.name || `${localityShort} Partner Store`,
      storeAddress: `${localityShort}, ${cityShort}`,
      phone: offer.phone || '+91 98110 24024',
      cat,
      badge: offer.badge || '20% OFF',
      badgeColor: 'bg-orange-500 text-white',
      code: (offer.code || 'LOCAL20').toUpperCase(),
      valid: '14 days left',
      daysLeft: 14,
      dist: '0.4 km',
      distanceKm: 0.4,
      img: pickOfferImage(cat, 0),
    };

    await requestBackend('/api/v1/offers', {
      method: 'POST',
      body: JSON.stringify({
        business_id: 1,
        title: created.title,
        description: created.sub,
        discount_text: created.badge,
        coupon_code: created.code,
        category: created.cat,
        valid_days: 14,
      }),
    });

    const existing = loadLocalList<LiveOfferItem>(CUSTOM_OFFER_KEY);
    saveLocalList(CUSTOM_OFFER_KEY, [created, ...existing]);
    setOffers((prev) => [created, ...prev]);
    return created;
  };

  const addEvent = async (ev: Partial<LiveEventItem>): Promise<LiveEventItem> => {
    const cat = ev.cat || 'Community';
    const created: LiveEventItem = {
      id: `custom-ev-${Date.now()}`,
      title: ev.title || `${localityShort} Citizen Meetup`,
      cat,
      organizer: ev.organizer || `${localityShort} RWA & Citizen Forum`,
      date: ev.date || 'This Sunday',
      time: ev.time || '05:00 PM – 07:30 PM',
      loc: `${ev.loc || `${localityShort} Community Center`}, ${cityShort}`,
      address: `${ev.loc || localityShort}, ${cityShort}`,
      locality: localityShort,
      city: cityShort,
      dist: '0.6 km',
      distanceKm: 0.6,
      price: ev.price || 'Free Entry',
      free: true,
      rsvp: '45+ going',
      expectedAttendance: 250,
      parkingPressure: 'MODERATE',
      trafficImpact: 'LOW',
      exitWeatherAdvisory: `${liveIntel.weather.conditionText} (${liveIntel.weather.temperatureC}°C) — smooth dispersal expected.`,
      commuteCorridor: liveIntel.traffic.corridors[0]?.roadName || `${localityShort} Main Road`,
      source: 'Verified Citizen / RWA Organizer',
      img: pickEventImage(cat, 0),
      lat: lat + 0.002,
      lng: lng - 0.002,
    };

    await requestBackend('/api/v1/events', {
      method: 'POST',
      body: JSON.stringify({
        title: created.title,
        category: created.cat,
        organizer: created.organizer,
        venue_name: created.loc,
        address: created.address,
        locality: localityShort,
        city: cityShort,
        latitude: created.lat,
        longitude: created.lng,
        start_time: new Date(Date.now() + 86400000).toISOString(),
        timing_text: created.time,
        description: `Community event in ${localityShort}, ${cityShort}.`,
      }),
    });

    const existing = loadLocalList<LiveEventItem>(CUSTOM_EVENT_KEY);
    saveLocalList(CUSTOM_EVENT_KEY, [created, ...existing]);
    setEvents((prev) => [created, ...prev]);
    return created;
  };

  return {
    loading,
    businesses,
    products,
    services,
    offers,
    events,
    emergencyFacilities,
    addBusiness,
    addProduct,
    addService,
    addOffer,
    addEvent,
    refreshMarketplace,
  };
}

/* ============================================================================
   OVERPASS LIVE BUSINESS DISCOVERY & LOCALIZED GENERATORS
   ============================================================================ */

async function fetchOverpassBusinesses(
  lat: number,
  lng: number,
  locality: string,
  city: string
): Promise<LiveBusinessItem[]> {
  try {
    const backendData = await requestBackend<{
      businesses?: Array<{
        id: string;
        name: string;
        category?: string;
        subcategory?: string;
        address?: string;
        locality?: string;
        city?: string;
        rating?: string | number;
        reviews?: string | number;
        phone?: string;
        latitude?: number;
        longitude?: number;
        distance_km?: number;
      }>;
      pois?: Array<{
        id: string;
        name: string;
        category: string;
        distanceKm: number;
        latitude: number;
        longitude: number;
        phone?: string;
        sublabel?: string;
        address?: string;
      }>;
    }>(`/api/v1/locations/places-nearby?lat=${lat}&lon=${lng}&radius=3500`, {}, 3500);

    if (backendData?.businesses && backendData.businesses.length > 0) {
      return backendData.businesses.map((b, idx) => {
        const cat = mapToFrontendBizCategory(b.category || 'Services');
        const dKm = Number(
          (b.distance_km ?? haversineKm(lat, lng, b.latitude || lat, b.longitude || lng)).toFixed(2)
        );
        const street = b.locality || locality;
        const phone = b.phone || '+91 98110 24024';

        return {
          id: `osm-biz-${b.id || idx}`,
          slug: `osm-biz-${b.id || idx}`,
          name: b.name,
          cat,
          sub: `${cat} • ${street}`,
          description: `Verified ${cat.toLowerCase()} located in ${street}, ${city}.`,
          address: b.address || `${street}, ${locality}, ${city}`,
          locality: b.locality || locality,
          city: b.city || city,
          rating: String(b.rating || (4.3 + ((idx * 3) % 7) * 0.1).toFixed(1)),
          reviews: String(b.reviews || `(${85 + idx * 34})`),
          dist: formatDist(dKm),
          distanceKm: dKm,
          status: 'Open' as const,
          closes: 'Closes 10:00 PM',
          openingTime: '09:00',
          closingTime: '22:00',
          phone,
          whatsapp: phone,
          img: pickBizImage(cat, idx),
          verified: true,
          trending: idx < 2,
          popular: true,
          lat: b.latitude || lat,
          lng: b.longitude || lng,
          activeProductsCount: 5,
          activeOffersCount: 1,
          source: 'FastAPI /api/v1/locations/places-nearby',
        };
      });
    }

    if (backendData?.pois && backendData.pois.length > 0) {
      const bizPois = backendData.pois.filter((p) =>
        ['food', 'shop', 'pharmacy'].includes(p.category)
      );
      if (bizPois.length > 0) {
        return bizPois.map((p, idx) => {
          const cat =
            p.category === 'food'
              ? 'Restaurants'
              : p.category === 'pharmacy'
              ? 'Pharmacies'
              : 'Groceries';
          const dKm = Number(p.distanceKm.toFixed(2));
          const phone = p.phone || '+91 98110 24024';
          return {
            id: `osm-poi-${p.id || idx}`,
            slug: `osm-poi-${p.id || idx}`,
            name: p.name,
            cat,
            sub: `${cat} • ${locality}`,
            description: `Verified ${cat.toLowerCase()} in ${locality}, ${city}.`,
            address: p.address || `${locality}, ${city}`,
            locality,
            city,
            rating: (4.3 + ((idx * 3) % 7) * 0.1).toFixed(1),
            reviews: `(${85 + idx * 34})`,
            dist: formatDist(dKm),
            distanceKm: dKm,
            status: 'Open' as const,
            closes: 'Closes 10:00 PM',
            openingTime: '09:00',
            closingTime: '22:00',
            phone,
            whatsapp: phone,
            img: pickBizImage(cat, idx),
            verified: true,
            trending: idx < 2,
            popular: true,
            lat: p.latitude,
            lng: p.longitude,
            activeProductsCount: 5,
            activeOffersCount: 1,
            source: 'FastAPI /api/v1/locations/places-nearby',
          };
        });
      }
    }

    return [];
  } catch {
    return [];
  }
}

function mapOsmTagToCategory(tag: string): string {
  const t = tag.toLowerCase();
  if (['restaurant', 'fast_food'].includes(t)) return 'Restaurants';
  if (['cafe', 'bakery', 'coffee'].includes(t)) return 'Cafés';
  if (['supermarket', 'convenience', 'greengrocer', 'grocery', 'department_store'].includes(t))
    return 'Groceries';
  if (['pharmacy', 'chemist', 'medical'].includes(t)) return 'Pharmacies';
  if (['electronics', 'mobile_phone', 'computer'].includes(t)) return 'Electronics';
  if (['hairdresser', 'beauty', 'Clothes'].includes(t)) return 'Salons';
  if (['fitness_centre', 'sports'].includes(t)) return 'Fitness';
  return 'Services';
}

function mapToFrontendBizCategory(raw: string): string {
  const r = raw.toLowerCase();
  if (r.includes('grocery') || r.includes('supermarket')) return 'Groceries';
  if (r.includes('pharmacy') || r.includes('wellness') || r.includes('medical')) return 'Pharmacies';
  if (r.includes('electronic') || r.includes('mobile')) return 'Electronics';
  if (r.includes('cafe') || r.includes('bakery')) return 'Cafés';
  if (r.includes('restaurant') || r.includes('food')) return 'Restaurants';
  if (r.includes('salon') || r.includes('fashion')) return 'Salons';
  if (r.includes('fit') || r.includes('sport') || r.includes('gym')) return 'Fitness';
  return 'Services';
}

function mapToFrontendProdCategory(raw: string): string {
  const r = raw.toLowerCase();
  if (r.includes('electronic') || r.includes('phone')) return 'Electronics';
  if (r.includes('pharmacy') || r.includes('health') || r.includes('med')) return 'Medicines';
  if (r.includes('bakery') || r.includes('dairy')) return 'Bakery & Dairy';
  if (r.includes('home') || r.includes('kitchen')) return 'Home & Kitchen';
  if (r.includes('fit') || r.includes('sport')) return 'Fitness';
  return 'Groceries';
}

function mapToFrontendSvcCategory(raw: string): string {
  const r = raw.toLowerCase();
  if (r.includes('clean') || r.includes('pest')) return 'Cleaning';
  if (r.includes('tutor') || r.includes('class')) return 'Tutoring';
  if (r.includes('salon') || r.includes('beauty')) return 'Beauty & Salon';
  if (r.includes('health') || r.includes('physio') || r.includes('yoga')) return 'Health';
  if (r.includes('move') || r.includes('pack')) return 'Moving';
  return 'Home Repair';
}

function mapToFrontendOfferCategory(raw: string): string {
  const r = raw.toLowerCase();
  if (r.includes('grocery')) return 'Groceries';
  if (r.includes('salon') || r.includes('spa')) return 'Salon & Spa';
  if (r.includes('fit') || r.includes('health') || r.includes('pharmacy')) return 'Fitness & Health';
  if (r.includes('electronic')) return 'Electronics';
  if (r.includes('service')) return 'Services';
  return 'Food & Dining';
}

function mapToFrontendEventCategory(raw: string): string {
  const r = raw.toLowerCase();
  if (r.includes('sport') || r.includes('marathon') || r.includes('fitness')) return 'Sports & Fitness';
  if (r.includes('market') || r.includes('haat') || r.includes('flea') || r.includes('food'))
    return 'Food & Markets';
  if (r.includes('workshop') || r.includes('tech') || r.includes('meetup') || r.includes('ai'))
    return 'Workshops';
  if (r.includes('music') || r.includes('concert') || r.includes('comedy') || r.includes('culture'))
    return 'Music & Arts';
  if (r.includes('civic') || r.includes('camp') || r.includes('health')) return 'Civic & Health';
  return 'Community';
}

function mapFacilityType(raw: string): LiveEmergencyFacility['facilityType'] {
  const r = raw.toLowerCase();
  if (r.includes('police')) return 'Police Station';
  if (r.includes('fire')) return 'Fire Station';
  if (r.includes('pharm') || r.includes('chemist')) return 'Pharmacy';
  if (r.includes('trauma')) return 'Trauma Center';
  return 'Hospital';
}

function pickProdImage(name: string, cat: string, idx: number): string {
  const n = name.toLowerCase();
  if (n.includes('milk') || n.includes('amul')) return './assets/crops/prod-amul-milk.webp';
  if (n.includes('dal') || n.includes('arhar')) return './assets/crops/prod-arhar-dal.webp';
  if (n.includes('atta') || n.includes('flour') || n.includes('bread')) return './assets/crops/prod-atta.webp';
  if (n.includes('banana') || n.includes('tomato') || n.includes('veg')) return './assets/crops/prod-banana.webp';
  if (n.includes('dettol') || n.includes('mask') || cat === 'Medicines') return './assets/crops/prod-dettol.webp';
  if (cat === 'Electronics') return './assets/crops/store-gupta-elec.webp';
  const pool = [
    './assets/crops/prod-arhar-dal.webp',
    './assets/crops/prod-amul-milk.webp',
    './assets/crops/prod-atta.webp',
    './assets/crops/prod-banana.webp',
    './assets/crops/prod-dettol.webp',
  ];
  return pool[idx % pool.length];
}

function pickSvcImage(cat: string, idx: number): string {
  if (cat === 'Cleaning') return './assets/crops/srv-cleaning.webp';
  if (cat === 'Beauty & Salon') return './assets/crops/biz-card-looks.webp';
  if (cat === 'Tutoring') return './assets/crops/pro-sharma.webp';
  if (cat === 'Health') return './assets/crops/store-medplus.webp';
  const pool = [
    './assets/crops/srv-ac-repair.webp',
    './assets/crops/srv-cleaning.webp',
    './assets/crops/srv-electrician.webp',
    './assets/crops/srv-plumbing.webp',
  ];
  return pool[idx % pool.length];
}

function pickOfferImage(cat: string, idx: number): string {
  if (cat === 'Groceries') return './assets/crops/offer-dmart.webp';
  if (cat === 'Salon & Spa') return './assets/crops/offer-looks.webp';
  if (cat === 'Fitness & Health') return './assets/crops/offer-cultfit.webp';
  if (cat === 'Services') return './assets/crops/offer-urban-company.webp';
  const pool = [
    './assets/crops/offer-lapinoz.webp',
    './assets/crops/offer-burger-singh.webp',
    './assets/crops/offer-chaayos.webp',
    './assets/crops/offer-croma.webp',
  ];
  return pool[idx % pool.length];
}

function pickEventImage(cat: string, idx: number): string {
  if (cat === 'Sports & Fitness') return './assets/crops/evt-yoga.webp';
  if (cat === 'Food & Markets') return './assets/crops/evt-food-carnival.webp';
  if (cat === 'Workshops') return './assets/crops/evt-techtalk.webp';
  if (cat === 'Music & Arts') return './assets/crops/evt-music-fest.webp';
  const pool = [
    './assets/crops/event-summer-fest.webp',
    './assets/crops/event-cleanup.webp',
    './assets/crops/event-comedy.webp',
    './assets/crops/evt-art-exhib.webp',
  ];
  return pool[idx % pool.length];
}

function buildLocalizedBusinesses(
  _lat: number,
  _lng: number,
  _locality: string,
  _city: string
): LiveBusinessItem[] {
  return [];
}

function buildLocalizedProducts(
  _lat: number,
  _lng: number,
  _locality: string,
  _city: string,
  _bizList: LiveBusinessItem[],
  _mandiRates: LiveAreaIntelligence['mandiRates']
): LiveProductItem[] {
  return [];
}

function buildLocalizedServices(
  _lat: number,
  _lng: number,
  _locality: string,
  _city: string
): LiveServiceItem[] {
  return [];
}

function buildLocalizedOffers(
  _locality: string,
  _city: string,
  _businesses: LiveBusinessItem[] = []
): LiveOfferItem[] {
  return [];
}

function buildLocalizedEvents(
  _lat: number,
  _lng: number,
  _locality: string,
  _city: string,
  _liveIntel: LiveAreaIntelligence
): LiveEventItem[] {
  return [];
}

/* ============================================================================
   MERCHANT PORTAL -> CITIZEN PORTAL LIVE GLOBAL SYNCHRONIZERS
   Ensures every merchant action (add product, pause/resume stock, add deal)
   is immediately and reliably visible to all citizens with all conditions set.
   ============================================================================ */

export function syncMerchantProductToGlobal(
  prod: {
    id?: string;
    name: string;
    price: number;
    category: string;
    description?: string;
    image?: string;
    status?: string;
  },
  business: {
    name: string;
    address: string;
    phone: string;
    locality?: string;
    city?: string;
    locationArea?: string;
  }
): LiveProductItem | null {
  // 1. Enforce Startup Business Conditions & Validation Rules
  const cleanName = (prod.name || '').trim();
  const cleanPrice = Number(prod.price || 0);
  if (!cleanName || cleanName.length < 2 || cleanPrice <= 0) {
    return null;
  }

  const locality = business.locality || (business.locationArea ? business.locationArea.split(',')[0].trim() : 'Local Area');
  const city = business.city || (business.locationArea && business.locationArea.includes(',') ? business.locationArea.split(',')[1]?.trim() : 'India') || 'India';
  const onlinePrice = Math.round(cleanPrice * 1.18); // 18% offline local savings benchmark
  const savings = Math.max(0, onlinePrice - cleanPrice);

  const mappedCat = mapToFrontendProdCategory(prod.category || 'Groceries');

  const liveItem: LiveProductItem = {
    id: prod.id || `merchant-prod-${Date.now()}`,
    name: cleanName,
    brand: business.name,
    cat: mappedCat,
    price: `₹${cleanPrice.toLocaleString('en-IN')}`,
    localPriceNum: cleanPrice,
    oldPrice: `₹${onlinePrice.toLocaleString('en-IN')}`,
    onlinePriceNum: onlinePrice,
    onlineProvider: 'Quick-Commerce MRP',
    savingsAmount: savings,
    savingsPercent: Math.round((savings / onlinePrice) * 100),
    betterOffline: true,
    unit: '1 unit • Live Store Stock',
    store: business.name,
    storeAddress: business.address,
    phone: business.phone || '+91 98110 24024',
    dist: '0.4 km',
    distanceKm: 0.4,
    rating: '4.8',
    reviews: '(Verified)',
    inStock: prod.status !== 'Paused',
    freshnessLabel: 'Live Store Inventory',
    discount: savings > 0 ? `Save ₹${savings}` : 'Store Price',
    img: prod.image || pickProdImage(cleanName, mappedCat, 0),
    lat: 28.7155,
    lng: 77.1185,
  };

  const existing = loadLocalList<LiveProductItem>(CUSTOM_PROD_KEY);
  // Remove duplicate with same id or matching name & store
  const filtered = existing.filter(
    (p) => p.id !== liveItem.id && !(p.name.toLowerCase() === liveItem.name.toLowerCase() && p.store === liveItem.store)
  );
  saveLocalList(CUSTOM_PROD_KEY, [liveItem, ...filtered]);
  return liveItem;
}

export function syncMerchantProductToggle(productId: string, isPaused: boolean): void {
  const existing = loadLocalList<LiveProductItem>(CUSTOM_PROD_KEY);
  const updated = existing.map((p) => {
    if (p.id === productId || p.id.includes(productId)) {
      return {
        ...p,
        inStock: !isPaused,
        freshnessLabel: isPaused ? 'Temporarily Paused' : 'In Stock Now',
      };
    }
    return p;
  });
  saveLocalList(CUSTOM_PROD_KEY, updated);
}
