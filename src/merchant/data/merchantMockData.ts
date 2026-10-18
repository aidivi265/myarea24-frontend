import {
  MerchantBusinessInfo,
  MerchantProductItem,
  MerchantServiceItem,
  MerchantOfferItem,
  MerchantPostItem,
  MerchantEventItem,
  MerchantReviewItem,
  MerchantConversation,
  MerchantLeadItem,
  MerchantPromotionItem,
  MerchantInvoiceItem,
  MerchantOrderItem,
} from '../types';

export const EMPTY_MERCHANT_STOREFRONT: MerchantBusinessInfo = {
  id: 'merchant-storefront',
  name: 'My Storefront',
  tagline: 'Verified Neighborhood Storefront',
  category: 'Retail & Services',
  ownerName: 'Store Owner',
  ownerRole: 'Owner & Operator',
  locationArea: 'Local Area',
  pincode: '',
  fullAddress: 'Local Commercial Address',
  landmark: '',
  serviceArea: 'Neighborhood',
  phone: '',
  email: '',
  website: '',
  rating: 5.0,
  reviewCount: 0,
  verificationStatus: 'Under Review',
  submissionDate: new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }),
  profileCompletion: 25,
  logo: '',
  coverImage: '',
};

export const DEFAULT_BUSINESS_THE_DAILY_BREW: MerchantBusinessInfo = EMPTY_MERCHANT_STOREFRONT;
export const DEFAULT_BUSINESS_SHARMA_FUEL: MerchantBusinessInfo = EMPTY_MERCHANT_STOREFRONT;

export const INITIAL_MERCHANT_PRODUCTS: MerchantProductItem[] = [];
export const INITIAL_MERCHANT_SERVICES: MerchantServiceItem[] = [];
export const INITIAL_MERCHANT_OFFERS: MerchantOfferItem[] = [];
export const INITIAL_MERCHANT_POSTS: MerchantPostItem[] = [];
export const INITIAL_MERCHANT_EVENTS: MerchantEventItem[] = [];
export const INITIAL_MERCHANT_REVIEWS: MerchantReviewItem[] = [];
export const INITIAL_MERCHANT_CONVERSATIONS: MerchantConversation[] = [];
export const INITIAL_MERCHANT_LEADS: MerchantLeadItem[] = [];
export const INITIAL_MERCHANT_PROMOTIONS: MerchantPromotionItem[] = [];
export const INITIAL_MERCHANT_INVOICES: MerchantInvoiceItem[] = [];
export const INITIAL_MERCHANT_ORDERS: MerchantOrderItem[] = [];
