/**
 * MyArea24 — Production External API Integration Registry
 *
 * Defines all third-party data feeds, environment variable slots,
 * and current integration status across citizen and merchant portals.
 *
 * When an API key is unconfigured or null, MyArea24 renders a clean,
 * non-disruptive empty state with ZERO synthetic or fake data.
 */

function getEnv(key: string): string {
  try {
    return (import.meta as any).env?.[key] || '';
  } catch {
    return '';
  }
}

export interface ExternalApiSlot {
  id: string;
  section: string;
  category: 'Intelligence' | 'Market' | 'Civic' | 'Payments' | 'Communication';
  envVar: string;
  provider: string;
  description: string;
  docsUrl: string;
  isConfigured: boolean;
  emptyStateMessage: string;
}

export const API_REGISTRY: Record<string, ExternalApiSlot> = {
  mandiRates: {
    id: 'mandi_rates',
    section: 'Mandi Rates & Vegetable Market',
    category: 'Market',
    envVar: 'VITE_AGMARKNET_API_KEY',
    provider: 'Agmarknet / e-NAM (Ministry of Agriculture)',
    description: 'Wholesale APMC and daily retail prices for seasonal vegetables, fruits, and foodgrains.',
    docsUrl: 'https://agmarknet.gov.in/',
    isConfigured: Boolean(getEnv('VITE_AGMARKNET_API_KEY')),
    emptyStateMessage: '🥦 Mandi Rates: Awaiting Agmarknet / APMC API Key',
  },

  fuelRates: {
    id: 'fuel_rates',
    section: 'Daily Fuel & CNG Rates',
    category: 'Market',
    envVar: 'VITE_OMC_FUEL_API_KEY',
    provider: 'PPAC / Oil Marketing Companies (IOCL, BPCL, HPCL) Daily Revision Feed',
    description: 'District-wise dynamic daily fuel revisions for Petrol, Diesel, Auto-CNG, and Domestic LPG.',
    docsUrl: 'https://ppac.gov.in/',
    isConfigured: Boolean(getEnv('VITE_OMC_FUEL_API_KEY')),
    emptyStateMessage: '⛽ Fuel Rates: Awaiting OMC / PPAC API Key',
  },

  trafficIncidents: {
    id: 'traffic_incidents',
    section: 'Corridor Traffic & Bottlenecks',
    category: 'Intelligence',
    envVar: 'VITE_TRAFFIC_API_KEY',
    provider: 'TomTom Traffic Incidents v5 / HERE Technologies Traffic API v7',
    description: 'Real-time arterial road congestion, roadworks, choke points, and traffic delay minutes.',
    docsUrl: 'https://developer.tomtom.com/traffic-api',
    isConfigured: Boolean(getEnv('VITE_TRAFFIC_API_KEY')),
    emptyStateMessage: '🚦 Live Traffic: Awaiting TomTom / HERE Traffic API Key',
  },

  weatherForecast: {
    id: 'weather_forecast',
    section: 'Hyperlocal Weather & Heatwave Advisory',
    category: 'Intelligence',
    envVar: 'VITE_WEATHER_API_KEY',
    provider: 'WeatherAPI.com / OpenWeatherMap',
    description: 'Real-time temperature, precipitation probability, humidity, and extreme weather alerts.',
    docsUrl: 'https://www.weatherapi.com/docs/',
    isConfigured: Boolean(getEnv('VITE_WEATHER_API_KEY')),
    emptyStateMessage: '🌤️ Weather: Awaiting WeatherAPI.com Key',
  },

  airQuality: {
    id: 'air_quality',
    section: 'Official Air Quality Index (AQI & CAAQMS)',
    category: 'Intelligence',
    envVar: 'VITE_AQI_API_KEY',
    provider: 'OpenAQ v3 / Central Pollution Control Board (CPCB) CAAQMS',
    description: 'Continuous ambient monitoring station measurements for PM2.5, PM10, and CPCB National AQI sub-indices.',
    docsUrl: 'https://docs.openaq.org/',
    isConfigured: Boolean(getEnv('VITE_AQI_API_KEY')),
    emptyStateMessage: '🍃 AQI Feed: Awaiting OpenAQ / CPCB API Key',
  },

  civicAlerts: {
    id: 'civic_alerts',
    section: 'Disaster Advisories & Municipal Notices',
    category: 'Civic',
    envVar: 'VITE_SACHET_FEED_URL',
    provider: 'NDMA SACHET Common Alerting Protocol (CAP) RSS Feed',
    description: 'Official national disaster management alerts, flood warnings, heatwave alerts, and civic bulletins.',
    docsUrl: 'https://sachet.ndma.gov.in/',
    isConfigured: Boolean(getEnv('VITE_SACHET_FEED_URL')),
    emptyStateMessage: '📢 Civic Alerts: Awaiting NDMA SACHET Feed URL',
  },

  placesDiscovery: {
    id: 'places_discovery',
    section: 'Local Points of Interest & Amenities',
    category: 'Civic',
    envVar: 'VITE_PLACES_API_KEY',
    provider: 'OpenStreetMap Overpass API / Google Places API (New)',
    description: 'Geocoded neighborhood amenities: banks, ATMs, hospitals, police stations, parks, and metro gates.',
    docsUrl: 'https://wiki.openstreetmap.org/wiki/Overpass_API',
    isConfigured: Boolean(getEnv('VITE_PLACES_API_KEY')),
    emptyStateMessage: '📍 Local Places: Awaiting Places API Key',
  },

  rentalBenchmark: {
    id: 'rental_benchmark',
    section: 'Rental Benchmarks & Circle Rates',
    category: 'Market',
    envVar: 'VITE_PROPERTY_API_KEY',
    provider: 'Real Estate / Circle Rate Registry API',
    description: 'BHK rental benchmark averages and government circle rates per square yard/meter by sector.',
    docsUrl: 'https://revenue.delhi.gov.in/',
    isConfigured: Boolean(getEnv('VITE_PROPERTY_API_KEY')),
    emptyStateMessage: '🏢 Property Rates: Awaiting Real Estate / Circle Rate API Key',
  },

  digitalPayments: {
    id: 'digital_payments',
    section: 'Digital Payments & UPI QR Checkout',
    category: 'Payments',
    envVar: 'VITE_RAZORPAY_KEY_ID',
    provider: 'Razorpay / Cashfree Payments / PhonePe PG',
    description: 'Instant UPI dynamic QR generation, zero-fee direct settlement, and netbanking gateway.',
    docsUrl: 'https://razorpay.com/docs/api/',
    isConfigured: Boolean(getEnv('VITE_RAZORPAY_KEY_ID')),
    emptyStateMessage: '💳 Payments: Awaiting Razorpay / Cashfree Key',
  },

  whatsappNotifications: {
    id: 'whatsapp_notifications',
    section: 'Customer WhatsApp Alerts & CRM',
    category: 'Communication',
    envVar: 'VITE_WHATSAPP_API_TOKEN',
    provider: 'Meta WhatsApp Business Cloud API / Twilio WhatsApp',
    description: 'Real-time order confirmation receipts, callback enquiries, and dispatch delivery notifications.',
    docsUrl: 'https://developers.facebook.com/docs/whatsapp/cloud-api',
    isConfigured: Boolean(getEnv('VITE_WHATSAPP_API_TOKEN')),
    emptyStateMessage: '💬 WhatsApp: Awaiting WhatsApp Cloud API Token',
  },
};

/**
 * Returns whether an API slot has been configured with a valid key.
 */
export function isApiConfigured(slotKey: keyof typeof API_REGISTRY): boolean {
  return API_REGISTRY[slotKey]?.isConfigured ?? false;
}

/**
 * Returns the friendly empty state message when an API is awaiting keys.
 */
export function getApiEmptyStateMessage(slotKey: keyof typeof API_REGISTRY): string {
  return API_REGISTRY[slotKey]?.emptyStateMessage || 'Awaiting API Key';
}
