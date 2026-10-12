export type DashboardId =
  | 'home'
  | 'businesses'
  | 'products'
  | 'services'
  | 'offers'
  | 'events'
  | 'intelligence'
  | 'weather'
  | 'air-quality'
  | 'traffic'
  | 'alerts'
  | 'ai-assistant'
  | 'map'
  | 'emergency'
  | 'market-rates'
  | 'fuel-rates'
  | 'bulletins'
  | 'saved';

export type ViewDeviceMode = 'desktop' | 'app' | 'split';
export type RenderFidelityMode = 'interactive' | 'visual-guide';

export interface NavItem {
  id: DashboardId;
  label: string;
  section: 'main' | 'intelligence' | 'community';
  searchPlaceholder: string;
  appSearchPlaceholder: string;
  badge?: string;
}

export interface SavedEntry {
  id: string;
  title: string;
  subtitle: string;
  category: 'Fuel Stations' | 'Properties' | 'Market Items' | 'Alerts' | 'Businesses' | 'Events' | 'Offers';
  meta: string;
  priceOrStatus?: string;
  secondaryPrice?: string;
  changeText?: string;
  badge?: string;
  image?: string;
  savedAt: string;
}

export interface ActionModalData {
  title: string;
  subtitle?: string;
  category: string;
  badge?: string;
  price?: string;
  location?: string;
  rating?: string;
  description: string;
  primaryActionLabel: string;
  secondaryActionLabel?: string;
  image?: string;
  extraDetails?: { label: string; value: string }[];
}
