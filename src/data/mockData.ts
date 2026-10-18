import { NavItem, SavedEntry } from '../types';

export const NAV_ITEMS: NavItem[] = [
  // Main section
  {
    id: 'home',
    label: 'Home',
    section: 'main',
    searchPlaceholder: 'Search for places, services, events or ask anything...',
    appSearchPlaceholder: 'Search for places, services, events...',
  },
  {
    id: 'businesses',
    label: 'Businesses',
    section: 'main',
    searchPlaceholder: 'Search for businesses, services or "best cafe near me"...',
    appSearchPlaceholder: 'Search for cafes, salons, hospitals...',
  },
  {
    id: 'products',
    label: 'Products',
    section: 'main',
    searchPlaceholder: 'Search for products, stores or anything in your area...',
    appSearchPlaceholder: 'Search for products (e.g. milk, rice, mobile...)',
  },
  {
    id: 'services',
    label: 'Services',
    section: 'main',
    searchPlaceholder: 'Search for services (e.g. plumber, electrician, salon at home...)',
    appSearchPlaceholder: 'Search for services (e.g. plumber, electrician...)',
  },
  {
    id: 'offers',
    label: 'Offers',
    section: 'main',
    searchPlaceholder: 'Search for offers (e.g. restaurant discounts, salon deals, gym offers...)',
    appSearchPlaceholder: 'Search for offers (e.g. restaurant, salon, gym...)',
  },
  {
    id: 'events',
    label: 'Events',
    section: 'main',
    searchPlaceholder: 'Search for events (e.g. concerts, workshops, exhibitions...)',
    appSearchPlaceholder: 'Search events (e.g. music, art, food, workshops...)',
  },
  // Intelligence section (Zero overlap: Decision Engine, Unified Weather & AQI, Live Traffic, Alerts & Civic Notices, AI Assistant)
  {
    id: 'intelligence',
    label: 'Area Intelligence',
    section: 'intelligence',
    searchPlaceholder: 'Search area livability score, activity verdicts, cross-signal correlations...',
    appSearchPlaceholder: 'Search area score, outdoor verdicts, trends...',
  },
  {
    id: 'weather',
    label: 'Weather & AQI',
    section: 'intelligence',
    searchPlaceholder: 'Search live forecast, rain radar, CPCB AQI, PM2.5 & health advice...',
    appSearchPlaceholder: 'Search weather, rain chance, CPCB AQI...',
  },
  {
    id: 'traffic',
    label: 'Live Traffic',
    section: 'intelligence',
    searchPlaceholder: 'Search road corridors, live speeds, route delays & bottlenecks...',
    appSearchPlaceholder: 'Search roads, corridors or commute routes...',
  },
  {
    id: 'alerts',
    label: 'Alerts & Notices',
    section: 'intelligence',
    searchPlaceholder: 'Search NDMA disaster alerts, water/power notices & civic bulletins...',
    appSearchPlaceholder: 'Search official alerts, civic notices & RWA updates...',
    badge: 'Live',
  },
  {
    id: 'ai-assistant',
    label: 'AI Assistant',
    section: 'intelligence',
    searchPlaceholder: 'Ask MyArea24 Saathi anything about your neighbourhood...',
    appSearchPlaceholder: 'Ask anything about your area...',
  },
  // Community & Utility section
  {
    id: 'map',
    label: 'Explore Map',
    section: 'community',
    searchPlaceholder: 'Search for a location, landmark, hospital, ATM or service on map...',
    appSearchPlaceholder: 'Search for location, landmark, service...',
  },
  {
    id: 'market-rates',
    label: 'Market & Fuel Rates',
    section: 'community',
    searchPlaceholder: 'Search mandi vegetables, petrol, diesel, CNG, gold or rent rates...',
    appSearchPlaceholder: 'Search vegetables, petrol, CNG, groceries...',
  },
  {
    id: 'emergency',
    label: 'Emergency SOS',
    section: 'community',
    searchPlaceholder: 'Search 24x7 hospitals, police stations, blood banks & SOS helplines...',
    appSearchPlaceholder: 'Search hospitals, police, ambulance, SOS...',
  },
  {
    id: 'saved',
    label: 'Saved',
    section: 'community',
    searchPlaceholder: 'Search your saved places, fuel stations, properties & items...',
    appSearchPlaceholder: 'Search your saved items...',
  },
];

export const INITIAL_SAVED_ITEMS: SavedEntry[] = [];

