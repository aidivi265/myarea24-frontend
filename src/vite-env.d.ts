/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_OPENWEATHER_API_KEY?: string;
  readonly VITE_AQICN_API_KEY?: string;
  readonly VITE_DATA_GOV_IN_API_KEY?: string;
  readonly VITE_FUEL_PRICE_API_KEY?: string;
  readonly VITE_TOMTOM_API_KEY?: string;
  readonly VITE_MAPBOX_TOKEN?: string;
  readonly VITE_GEMINI_API_KEY?: string;
  readonly VITE_SARVAM_AI_API_KEY?: string;
  readonly VITE_RAZORPAY_KEY_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
