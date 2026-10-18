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

export interface UserLocation {
  id: string;
  label: string; // e.g. "Home", "Work", or locality name
  areaName: string; // e.g. "Indiranagar, Bengaluru" or "Connaught Place, Delhi"
  fullAddress: string; // e.g. "100 Feet Road, Indiranagar, Bengaluru 560038"
  pincode: string;
  coords?: { lat: number; lng: number };
}

export const DEFAULT_SAVED_LOCATIONS: UserLocation[] = [];

export const INITIAL_FALLBACK_LOCATION: UserLocation = {
  id: 'loc-unselected',
  label: 'Select Location',
  areaName: 'Select Your Area (India)',
  fullAddress: 'Tap to detect your live GPS or search any locality across India',
  pincode: '',
  coords: { lat: 28.6139, lng: 77.2090 },
};

export interface CartItem {
  id: string;
  name: string;
  price: number;
  oldPrice?: string;
  image?: string;
  store: string;
  dist?: string;
  quantity: number;
  cat?: string;
}

export interface DeliveryAddress {
  recipientName: string;
  recipientPhone: string;
  streetAddress: string;
  flatNo?: string;
  landmark?: string;
  pincode: string;
  lat?: number;
  lng?: number;
  verifiedGps?: boolean;
}

export type PaymentMethod = 'upi_qr' | 'razorpay' | 'phonepe' | 'cod';
export type OrderStatus = 'placed' | 'confirmed' | 'out_for_delivery' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'cod' | 'refunded' | 'failed';

export interface Order {
  id: string | number;
  orderNumber: string;
  items: CartItem[];
  status: OrderStatus;
  statusDescription?: string;
  totalAmount: number;
  deliveryFee: number;
  platformFee: number;
  discountAmount: number;
  finalPayable: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionId?: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: DeliveryAddress | string;
  storeName?: string;
  estimatedDeliveryMins: number;
  createdAt: string;
}

export type ServiceBookingStatus = 'requested' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface ServiceBooking {
  id: string | number;
  bookingNumber: string;
  serviceTitle: string;
  category: string;
  providerName: string;
  providerPhone: string;
  customerName: string;
  customerPhone: string;
  serviceAddress: string;
  scheduledDate: string;
  scheduledSlot: string;
  status: ServiceBookingStatus;
  estimatedCost: number;
  otpCode?: string;
  notes?: string;
  createdAt: string;
}


