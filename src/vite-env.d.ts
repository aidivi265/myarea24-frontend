/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_BACKEND_URL?: string;
  readonly VITE_GEMINI_API_KEY?: string;
  readonly VITE_GEMINI_MODEL?: string;
  readonly VITE_SARVAM_API_KEY?: string;
  readonly VITE_SARVAM_AI_API_KEY?: string;
  readonly VITE_SARVAM_API_BASE_URL?: string;
  readonly VITE_GOOGLE_MAPS_API_KEY?: string;
  readonly VITE_WEATHER_API_KEY?: string;
  readonly VITE_OPENWEATHERMAP_API_KEY?: string;
  readonly VITE_OPENWEATHER_API_KEY?: string;
  readonly VITE_TRAFFIC_API_KEY?: string;
  readonly VITE_TOMTOM_API_KEY?: string;
  readonly VITE_AQI_API_KEY?: string;
  readonly VITE_OPENAQ_API_KEY?: string;
  readonly VITE_AQICN_API_KEY?: string;
  readonly VITE_SACHET_FEED_URL?: string;
  readonly VITE_RAZORPAY_KEY_ID?: string;
  readonly VITE_AGMARKNET_API_KEY?: string;
  readonly VITE_OMC_FUEL_API_KEY?: string;
  readonly VITE_PLACES_API_KEY?: string;
  readonly VITE_PROPERTY_API_KEY?: string;
  readonly VITE_WHATSAPP_API_TOKEN?: string;
  readonly VITE_MAPBOX_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
