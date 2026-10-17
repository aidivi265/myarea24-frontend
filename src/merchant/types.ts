export type MerchantDashboardId =
  | 'overview'
  | 'profile'
  | 'products'
  | 'offers'
  | 'posts'
  | 'events'
  | 'reviews'
  | 'messages'
  | 'leads'
  | 'analytics'
  | 'promotions'
  | 'payments'
  | 'settings';

export type MerchantDeviceViewMode = 'desktop' | 'app' | 'comparison';

export interface MerchantBusinessInfo {
  id: string;
  name: string;
  tagline: string;
  category: string;
  ownerName: string;
  ownerRole: string;
  locationArea: string;
  pincode: string;
  fullAddress: string;
  landmark: string;
  serviceArea: string;
  phone: string;
  email: string;
  website: string;
  rating: number;
  reviewCount: number;
  verificationStatus: 'Under Review' | 'Verified' | 'Pending' | 'Live';
  submissionDate: string;
  profileCompletion: number;
  logo: string;
  coverImage: string;
}

export interface MerchantProductItem {
  id: string;
  name: string;
  category: 'Beverages' | 'Desserts' | 'Snacks' | 'Fuel' | 'Groceries';
  price: number;
  originalPrice?: number;
  status: 'Active' | 'In Review' | 'Paused' | 'Archived';
  views: number;
  enquiries: number;
  image: string;
  description?: string;
}

export interface MerchantServiceItem {
  id: string;
  name: string;
  category: string;
  priceText: string;
  priceValue: number;
  status: 'Active' | 'In Review' | 'Paused' | 'Archived';
  views: number;
  enquiries: number;
  image: string;
  description?: string;
}

export interface MerchantOfferItem {
  id: string;
  title: string;
  description: string;
  type: 'Discount' | 'Combo' | 'BOGO' | 'Special Price' | 'Event Offer';
  discountText: string;
  badgeText?: string;
  validityStart: string;
  validityEnd: string;
  status: 'Active' | 'Scheduled' | 'Paused' | 'Expired';
  views: number;
  redemptions: number;
  image: string;
  code?: string;
}

export interface MerchantPostItem {
  id: string;
  title: string;
  caption: string;
  type: 'Announcement' | 'Offer' | 'Update' | 'Event' | 'Community';
  status: 'Published' | 'Scheduled' | 'Draft' | 'Archived';
  date: string;
  views: number;
  likes: number;
  shares: number;
  image: string;
  isLiked?: boolean;
}

export interface MerchantEventItem {
  id: string;
  title: string;
  category: 'Music' | 'Food' | 'Workshop' | 'Community' | 'Fitness' | 'Networking';
  dateDisplay: string;
  dayNumber: string;
  monthText: string;
  timeText: string;
  venue: string;
  status: 'Published' | 'Upcoming' | 'Ongoing' | 'Past' | 'Draft';
  interestedCount: number;
  goingCount: number;
  image: string;
  description: string;
}

export interface MerchantReviewItem {
  id: string;
  customerName: string;
  avatar: string;
  rating: number;
  timeAgo: string;
  isVerified: boolean;
  comment: string;
  tags: string[];
  photos?: string[];
  reply?: {
    ownerName: string;
    date: string;
    text: string;
  };
}

export interface MerchantChatMessage {
  id: string;
  sender: 'customer' | 'merchant';
  text: string;
  time: string;
  date?: string;
}

export interface MerchantConversation {
  id: string;
  customerName: string;
  avatar: string;
  badge: 'Enquiry' | 'Customer' | 'Booking';
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
  phone: string;
  email: string;
  location: string;
  memberSince: string;
  tags: string[];
  messages: MerchantChatMessage[];
}

export interface MerchantLeadItem {
  id: string;
  customerName: string;
  phone: string;
  email?: string;
  enquiryText: string;
  source: 'Website' | 'Direct Message' | 'Search' | 'Posts & Updates' | 'Offers & Deals' | 'Events' | 'Other';
  date: string;
  time: string;
  status: 'New' | 'In Progress' | 'Converted' | 'Not Interested' | 'Closed';
  interestedCategory: string;
  preferredDate?: string;
  notes?: string;
}

export interface MerchantPromotionItem {
  id: string;
  title: string;
  type: 'Special Offer' | 'Event' | 'Product Launch' | 'Custom Campaign' | 'Featured Listing';
  startDate: string;
  endDate: string;
  reach: number;
  clicks: number;
  redemptions: number;
  status: 'Active' | 'Scheduled' | 'Completed' | 'Paused';
}

export interface MerchantInvoiceItem {
  id: string;
  date: string;
  plan: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Failed';
}

export interface MerchantPortalState {
  currentBusiness: MerchantBusinessInfo;
  activeDashboard: MerchantDashboardId;
  viewMode: MerchantDeviceViewMode;
  searchQuery: string;
  products: MerchantProductItem[];
  services: MerchantServiceItem[];
  offers: MerchantOfferItem[];
  posts: MerchantPostItem[];
  events: MerchantEventItem[];
  reviews: MerchantReviewItem[];
  conversations: MerchantConversation[];
  activeConversationId: string;
  leads: MerchantLeadItem[];
  promotions: MerchantPromotionItem[];
  invoices: MerchantInvoiceItem[];
  pricingBillingCycle: 'monthly' | 'yearly';
}
