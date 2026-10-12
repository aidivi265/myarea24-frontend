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
  // Intelligence section
  {
    id: 'intelligence',
    label: 'Intelligence',
    section: 'intelligence',
    searchPlaceholder: 'Search for places, insights, weather, traffic, alert...',
    appSearchPlaceholder: 'Search for places, insights, weather, traffic, alert...',
  },
  {
    id: 'weather',
    label: 'Weather',
    section: 'intelligence',
    searchPlaceholder: 'Search for weather, air quality, forecast, alerts...',
    appSearchPlaceholder: 'Search for weather, air quality, alerts...',
  },
  {
    id: 'air-quality',
    label: 'Air Quality',
    section: 'intelligence',
    searchPlaceholder: 'Search for air quality, locations, or health insights...',
    appSearchPlaceholder: 'Search for areas, air quality, pollution, health tips...',
  },
  {
    id: 'traffic',
    label: 'Traffic',
    section: 'intelligence',
    searchPlaceholder: 'Search for places, traffic, routes, alerts...',
    appSearchPlaceholder: 'Search for a location, route or place...',
  },
  {
    id: 'alerts',
    label: 'Alerts',
    section: 'intelligence',
    searchPlaceholder: 'Search for alerts, incidents, emergencies, areas...',
    appSearchPlaceholder: 'Search for alerts, areas, incidents...',
    badge: '8',
  },
  {
    id: 'ai-assistant',
    label: 'AI Assistant',
    section: 'intelligence',
    searchPlaceholder: 'Ask anything about your area...',
    appSearchPlaceholder: 'Ask anything about your area...',
  },
  // Community section
  {
    id: 'map',
    label: 'Map',
    section: 'community',
    searchPlaceholder: 'Search for a location, landmark, service or address...',
    appSearchPlaceholder: 'Search for location, landmark, service...',
  },
  {
    id: 'emergency',
    label: 'Emergency',
    section: 'community',
    searchPlaceholder: 'Search for emergency services, hospitals, police, fire stations...',
    appSearchPlaceholder: 'Search for emergency services, hospitals...',
  },
  {
    id: 'market-rates',
    label: 'Market Rates',
    section: 'community',
    searchPlaceholder: 'Search for items (e.g., tomatoes, petrol, gold, rent...)',
    appSearchPlaceholder: 'Search for vegetables, groceries, fuel, property...',
  },
  {
    id: 'fuel-rates',
    label: 'Fuel Rates',
    section: 'community',
    searchPlaceholder: 'Search for fuel stations, areas, or cities...',
    appSearchPlaceholder: 'Search for fuel stations, petrol, CNG...',
  },
  {
    id: 'bulletins',
    label: 'Bulletins',
    section: 'community',
    searchPlaceholder: 'Search bulletins, announcements, alerts...',
    appSearchPlaceholder: 'Search bulletins, announcements, alerts...',
  },
  {
    id: 'saved',
    label: 'Saved',
    section: 'community',
    searchPlaceholder: 'Search for stations, properties, markets, bulletins...',
    appSearchPlaceholder: 'Search your saved items...',
  },
];

export const AREAS = [
  'Outer North Delhi, Delhi',
  'Rohini Sector 10, Delhi',
  'Rohini Sector 9, Delhi',
  'Pitampura, Delhi',
  'Shalimar Bagh, Delhi',
  'Model Town, Delhi',
  'Azadpur, Delhi',
];

export const INITIAL_SAVED_ITEMS: SavedEntry[] = [
  {
    id: 'fuel-indianoil',
    title: 'Indian Oil',
    subtitle: 'Rohini Sector 9, Delhi',
    category: 'Fuel Stations',
    meta: '1.2 km',
    priceOrStatus: '₹94.72/L',
    secondaryPrice: '₹87.62/L',
    changeText: '▲ 1%',
    image: './assets/crops/saved-indianoil.webp',
    savedAt: '2 hours ago',
  },
  {
    id: 'fuel-bharat',
    title: 'Bharat Petroleum',
    subtitle: 'Shalimar Bagh, Delhi',
    category: 'Fuel Stations',
    meta: '2.4 km',
    priceOrStatus: '₹94.75/L',
    secondaryPrice: '₹87.65/L',
    changeText: '▲ 1%',
    image: './assets/crops/saved-bharatpetrol.webp',
    savedAt: '6 hours ago',
  },
  {
    id: 'fuel-hp',
    title: 'HP Petrol Pump',
    subtitle: 'Azadpur, Delhi',
    category: 'Fuel Stations',
    meta: '3.1 km',
    priceOrStatus: '₹94.68/L',
    secondaryPrice: '₹87.55/L',
    changeText: '▲ 1%',
    image: './assets/crops/saved-hppetrol.webp',
    savedAt: '1 day ago',
  },
  {
    id: 'prop-2bhk',
    title: '₹18,000 / month',
    subtitle: '2 BHK Apartment • Shalimar Bagh, Delhi',
    category: 'Properties',
    meta: '900 sq ft • 2 Beds • 2 Baths',
    badge: 'For Rent',
    image: './assets/crops/saved-prop-2bhk.webp',
    savedAt: '5 hours ago',
  },
  {
    id: 'prop-3bhk-floor',
    title: '₹26,000 / month',
    subtitle: '3 BHK Builder Floor • Rohini Sector 8, Delhi',
    category: 'Properties',
    meta: '1,250 sq ft • 3 Beds • 2 Baths',
    badge: 'For Rent',
    image: './assets/crops/saved-prop-3bhk-floor.webp',
    savedAt: '1 day ago',
  },
  {
    id: 'prop-3bhk-sale',
    title: '₹1.25 Cr',
    subtitle: '3 BHK Apartment • Rohini Sector 16, Delhi',
    category: 'Properties',
    meta: '1,450 sq ft • 3 Beds • 2 Baths',
    badge: 'For Sale',
    image: './assets/crops/saved-prop-3bhk-sale.webp',
    savedAt: '2 days ago',
  },
];

export const AI_KNOWLEDGE_BASE: Record<string, string> = {
  default:
    "Based on live hyperlocal signals across **Outer North Delhi (Rohini Sector 10)**:\n\n• **Weather & Air Quality**: Currently **28°C (Clear Sky)** with **AQI 82 (Good)** (142 Moderate near Ring Road corridors). Rain is expected after **10:00 PM** tonight.\n• **Traffic Correlation**: **Rohini Summer Fest 2024** starts at 6:00 PM in Sector 10. Combined with tonight's rain window, arterial roads near Sector 10 & Outer Ring Road may experience **15–20 min delays** and higher parking demand.\n• **Actionable Tip**: Leave 15 mins earlier if heading toward Connaught Place (currently 28 min via NH-44) and carry an umbrella.",
  weather:
    "🌦️ **Weather Intelligence for Outer North Delhi (Rohini)**:\n\n• **Current**: 28°C, Clear Sky (Feels like 30°C), Humidity 46%, Wind 12 km/h NW.\n• **Tonight's Impact**: Rain is expected after **10:00 PM** in Rohini, which may slow down traffic near **Sector 10** and increase travel time by **15–20 mins**.\n• **Best Time for Outdoor Activity**: Tomorrow **6:00 AM – 10:00 AM** (Pleasant weather, AQI 82 Good).",
  traffic:
    "🚦 **Traffic Intelligence & Dynamic Route Check**:\n\n• **Overall Flow**: Smooth to Moderate (Avg speed **32 km/h** across Rohini, **18 km/h** on heavy Ring Road stretches).\n• **Active Bottlenecks**:\n  1. **Outer Ring Road (near Pitampura)**: Right lane blocked due to minor accident (+15 min delay).\n  2. **NH-44 (Azadpur)**: Partial road work diversion (+15–20 min delay).\n  3. **Mukarba Chowk**: Left lane maintenance closure.\n• **Recommended Route to Connaught Place**: Take **Rohini Sector 10 → Inner Ring Road corridor** (28–42 mins, lower risk before 5 PM peak).",
  air:
    "🍃 **Air Quality Intelligence (Outer North Delhi)**:\n\n• **Current AQI**: **82 (Good)** in residential Rohini sectors | **142 (Moderate)** along arterial traffic corridors.\n• **Pollutant Breakdown**: PM2.5: 32 µg/m³ (Good), PM10: 54 µg/m³ (Good), NO₂: 21 µg/m³ (Good), SO₂: 8 µg/m³ (Good), O₃: 67 µg/m³ (Moderate).\n• **Health Guidance**: Air quality is satisfactory and poses little to no risk. Ideal for parks and jogging.",
  events:
    "🎪 **Event Intelligence Around Rohini**:\n\n1. **Rohini Summer Fest 2024** — *Today, 6:00 PM – 10:00 PM* at Sector 10, Rohini (Live Music, Family Friendly). ⚠️ *AI Impact Note: Venue parking demand rising + rain probability high during exit window.*\n2. **Community Cleanup Drive** — *Tomorrow, 8:00 AM – 11:00 AM* at Rithala, Rohini.\n3. **Standup Comedy Night** — *Sat, 24 Aug, 7:00 PM – 9:00 PM* at The Laugh Box, Rohini.",
  alerts:
    "🔔 **Active Civic & Safety Alerts in Your Area**:\n\n• **CRITICAL**: Heavy Rainfall Expected in Rohini, Pitampura & Keshav Puram (15 min ago).\n• **IMPORTANT**: Waterlogging reported on Outer Ring Road, Rohini (1 hr ago).\n• **CIVIC NOTICE**: Planned Water Supply Maintenance in **Rohini Sector 8, 9, 10** tomorrow **10:00 AM – 4:00 PM**.\n• **EMERGENCY HELPLINE**: Dial **112** (Police/SOS), **108/102** (Ambulance), **101** (Fire).",
  restaurants:
    "🍽️ **Top Recommended Places Around Rohini Sector 10**:\n\n1. **The Urban Chai Café** — ⭐ 4.5 (1.2K) • Sector 10 (800 m) • *Quiet Wi-Fi cafe, great for work & evening tea.*\n2. **Bikanervala** — ⭐ 4.3 (2.4K) • Rohini (1.2 km) • *Popular family dining, open now.*\n3. **La Pino'z Pizza** — ⭐ 4.5 (1.2K) • 800 m • *Active Offer: 50% OFF on Medium Pizzas!*\n4. **Burger Singh** — ⭐ 4.3 • 900 m • *Flat 40% OFF on orders above ₹299.*",
};
