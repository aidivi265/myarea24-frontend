import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  MerchantDashboardId,
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
} from './types';
import {
  DEFAULT_BUSINESS_THE_DAILY_BREW,
  DEFAULT_BUSINESS_SHARMA_FUEL,
  INITIAL_MERCHANT_PRODUCTS,
  INITIAL_MERCHANT_SERVICES,
  INITIAL_MERCHANT_OFFERS,
  INITIAL_MERCHANT_POSTS,
  INITIAL_MERCHANT_EVENTS,
  INITIAL_MERCHANT_REVIEWS,
  INITIAL_MERCHANT_CONVERSATIONS,
  INITIAL_MERCHANT_LEADS,
  INITIAL_MERCHANT_PROMOTIONS,
  INITIAL_MERCHANT_INVOICES,
  INITIAL_MERCHANT_ORDERS,
} from './data/merchantMockData';
import {
  Home,
  Store,
  Package,
  Tag,
  FileText,
  Calendar,
  Star,
  MessageSquare,
  Users,
  TrendingUp,
  Megaphone,
  CreditCard,
  Settings,
  Sparkles,
  Search,
  Bell,
  ChevronDown,
  ArrowRight,
  Sun,
  Monitor,
  Smartphone,
  Eye,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  CheckCircle2,
  Globe,
  ShoppingBag,
  Lock,
  KeyRound,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import {
  realtimeService,
  REALTIME_STATUS_EVENT,
  MERCHANT_LEAD_EVENT,
  MERCHANT_INQUIRY_EVENT,
  MERCHANT_REVIEW_EVENT,
  MERCHANT_ORDER_EVENT,
  ORDER_STATUS_EVENT,
  RealtimeConnectionStatus,
} from '../services/realtimeService';
import { MerchantHomeDashboard } from './dashboards/MerchantHomeDashboard';
import { MerchantProfileDashboard } from './dashboards/MerchantProfileDashboard';
import { MerchantProductsDashboard } from './dashboards/MerchantProductsDashboard';
import { MerchantOrdersDashboard } from './dashboards/MerchantOrdersDashboard';
import { MerchantOffersDashboard } from './dashboards/MerchantOffersDashboard';
import { MerchantPostsDashboard } from './dashboards/MerchantPostsDashboard';
import { MerchantEventsDashboard } from './dashboards/MerchantEventsDashboard';
import { MerchantReviewsDashboard } from './dashboards/MerchantReviewsDashboard';
import { MerchantMessagesDashboard } from './dashboards/MerchantMessagesDashboard';
import { MerchantLeadsDashboard } from './dashboards/MerchantLeadsDashboard';
import { MerchantAnalyticsDashboard } from './dashboards/MerchantAnalyticsDashboard';
import { MerchantPromotionsDashboard } from './dashboards/MerchantPromotionsDashboard';
import { MerchantPaymentsDashboard } from './dashboards/MerchantPaymentsDashboard';
import { MerchantSettingsDashboard } from './dashboards/MerchantSettingsDashboard';
import { MerchantMobileAppView } from './components/MerchantMobileAppView';
import { MerchantActionModals } from './components/MerchantActionModals';
import {
  LiveCommunityMarketplaceState,
  syncMerchantProductToGlobal,
  syncMerchantProductToggle,
  getStoredMerchantProfile,
  getStoredMerchantSession,
  getStoredMerchantAccounts,
  saveMerchantSession,
  clearMerchantSession,
  MerchantRegistrationProfile,
} from '../services/communityMarketplaceService';
import { UserLocation } from '../types';
import { MerchantRegistrationModal } from '../components/MerchantRegistrationModal';
import {
  getMerchantOverview,
  createMerchantProduct,
  createMerchantService,
  createMerchantOffer,
  createMerchantEvent,
} from './services/merchantApiService';

interface MerchantPortalProps {
  onSwitchToCitizen: () => void;
  marketplace?: LiveCommunityMarketplaceState;
  currentLocation?: UserLocation;
}

const STORAGE_KEY = 'myarea24_merchant_portal_state_v1';

function buildMerchantBusinessInfo(profile: MerchantRegistrationProfile): MerchantBusinessInfo {
  const categoryTaglines: Record<string, string> = {
    'Restaurants & Cafes': 'Fresh Local Dining, Delicacies & Express Delivery',
    'Groceries & Daily Staples': 'Daily Farm-Fresh Staples, Fruits & Supermarket Goods',
    '24×7 Pharmacies & Healthcare': 'Certified Healthcare, Prescription Medicines & Emergency Care',
    'Electronics, Mobiles & Repair': 'Authentic Gadgets, Mobile Accessories & Certified Repairs',
    'Home Utility & Repair Services': 'Prompt Neighborhood Electricians, Plumbers & Technicians',
    'Salons, Spa & Grooming': 'Professional Beauty Care, Haircuts & Wellness Treatments',
    'Fitness, Gyms & Sports Arenas': 'Modern Equipment, Certified Trainers & Fitness Community',
    'Clothing, Footwear & Fashion': 'Trending Apparel, Local Boutiques & Tailoring Services',
    'Event Venues & Hall Bookings': 'Banquet Halls, Event Spaces & Community Celebrations',
  };

  const bizId = profile.id || `biz_${profile.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  const tagline = profile.tagline || categoryTaglines[profile.category] || 'Verified Local Merchant Storefront';

  return {
    id: bizId,
    name: profile.businessName,
    tagline,
    category: profile.category,
    ownerName: profile.ownerName,
    ownerRole: 'Owner & Operator',
    locationArea: `${profile.locality || 'Local'}, ${profile.city || 'India'}`,
    pincode: profile.pincode || '',
    fullAddress: profile.fullAddress,
    landmark: `${profile.locality || 'Commercial'} Market`,
    serviceArea: `${profile.locality || 'Neighborhood'} and nearby sectors`,
    phone: profile.phone,
    email: profile.email,
    website: `www.${profile.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '')}.in`,
    rating: 5.0,
    reviewCount: 0,
    verificationStatus: profile.isVerified ? 'Verified' : 'Under Review',
    submissionDate: new Date(profile.registeredAt || Date.now()).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    profileCompletion: profile.isVerified ? 100 : 75,
    logo: './assets/crops/biz-card-chai.webp',
    coverImage: './assets/crops/biz-ai-cafe.webp',
  };
}

export function MerchantPortal({ onSwitchToCitizen, marketplace, currentLocation }: MerchantPortalProps) {
  // Active Merchant Session & Profile
  const [session, setSession] = useState<MerchantRegistrationProfile | null>(() => {
    return getStoredMerchantSession() || getStoredMerchantProfile();
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Business Storefront: checks verified registration profile first, then fallback
  const [currentBusiness, setCurrentBusiness] = useState<MerchantBusinessInfo>(() => {
    try {
      const activeSession = getStoredMerchantSession() || getStoredMerchantProfile();
      if (activeSession && activeSession.isVerified) {
        return buildMerchantBusinessInfo(activeSession);
      }
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.currentBusiness) return parsed.currentBusiness;
      }
    } catch {}
    return DEFAULT_BUSINESS_THE_DAILY_BREW;
  });

  const location = useLocation();
  const navigate = useNavigate();

  const merchantSubroute = location.pathname.replace(/^\/merchant\/?/, '').split('/')[0].toLowerCase();
  const validMerchantDashboards: MerchantDashboardId[] = [
    'overview',
    'profile',
    'products',
    'orders',
    'offers',
    'posts',
    'events',
    'reviews',
    'messages',
    'leads',
    'analytics',
    'promotions',
    'payments',
    'settings',
  ];
  const activeDashboard: MerchantDashboardId = validMerchantDashboards.includes(
    merchantSubroute as MerchantDashboardId
  )
    ? (merchantSubroute as MerchantDashboardId)
    : 'overview';

  const handleNavigate = (dash: MerchantDashboardId) => {
    navigate(dash === 'overview' ? '/merchant' : `/merchant/${dash}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [modalType, setModalType] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showMerchantToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Helpers for per-business isolated storage
  const loadStoredCollection = <T,>(key: string, bizId: string, demoFallback: T[]): T[] => {
    try {
      const stored = localStorage.getItem(`myarea24_merchant_${key}_${bizId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return demoFallback || [];
  };

  const loadStoredOrders = (bizId: string, bizName: string, demoFallback: MerchantOrderItem[]): MerchantOrderItem[] => {
    try {
      const stored = localStorage.getItem(`myarea24_merchant_orders_${bizId}`);
      let list: MerchantOrderItem[] = [];
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) list = parsed;
      } else if (demoFallback && demoFallback.length > 0) {
        list = [...demoFallback];
      }

      // Automatically sync citizen orders placed for this storefront
      const citizenRaw = localStorage.getItem('myarea24_citizen_orders');
      if (citizenRaw) {
        const citizenOrders: any[] = JSON.parse(citizenRaw);
        citizenOrders.forEach((co) => {
          const matches =
            (co.storeName && co.storeName.trim().toLowerCase() === bizName.trim().toLowerCase()) ||
            co.businessId === bizId ||
            co.business_id === bizId;
          if (matches) {
            const already = list.some((it) => it.orderNumber === co.orderNumber || it.id === co.id);
            if (!already) {
              list.unshift({
                id: co.id,
                orderNumber: co.orderNumber,
                businessId: bizId,
                businessName: bizName,
                customerName:
                  co.customerName ||
                  (typeof co.deliveryAddress === 'object' ? co.deliveryAddress?.recipientName : 'Local Citizen'),
                customerPhone:
                  co.customerPhone ||
                  (typeof co.deliveryAddress === 'object' ? co.deliveryAddress?.recipientPhone : '+91 98000 00000'),
                deliveryAddress:
                  typeof co.deliveryAddress === 'string'
                    ? co.deliveryAddress
                    : co.deliveryAddress?.streetAddress || 'Local Residential Address',
                finalPayable: Number(co.finalPayable || 0),
                paymentMethod: co.paymentMethod || 'upi_qr',
                paymentStatus: co.paymentStatus === 'paid' ? 'paid' : co.paymentStatus === 'cod' ? 'cod' : 'pending',
                status: co.status || 'placed',
                items: (co.items || []).map((it: any) => ({
                  productName: it.name || it.product_name,
                  unitPrice: it.price || it.unit_price,
                  quantity: it.quantity,
                  totalPrice: (it.price || it.unit_price) * it.quantity,
                })),
                estimatedDeliveryMins: co.estimatedDeliveryMins || 20,
                createdAt: co.createdAt || new Date().toISOString(),
              });
            }
          }
        });
      }
      return list;
    } catch {
      return bizId === 'biz-daily-brew' ? demoFallback : [];
    }
  };

  // Data Collections (Stored per business)
  const [products, setProducts] = useState<MerchantProductItem[]>(() =>
    loadStoredCollection('products', currentBusiness.id, INITIAL_MERCHANT_PRODUCTS)
  );
  const [services, setServices] = useState<MerchantServiceItem[]>(() =>
    loadStoredCollection('services', currentBusiness.id, INITIAL_MERCHANT_SERVICES)
  );
  const [offers, setOffers] = useState<MerchantOfferItem[]>(() =>
    loadStoredCollection('offers', currentBusiness.id, INITIAL_MERCHANT_OFFERS)
  );
  const [posts, setPosts] = useState<MerchantPostItem[]>(() =>
    loadStoredCollection('posts', currentBusiness.id, INITIAL_MERCHANT_POSTS)
  );
  const [events, setEvents] = useState<MerchantEventItem[]>(() =>
    loadStoredCollection('events', currentBusiness.id, INITIAL_MERCHANT_EVENTS)
  );
  const [reviews, setReviews] = useState<MerchantReviewItem[]>(() =>
    loadStoredCollection('reviews', currentBusiness.id, INITIAL_MERCHANT_REVIEWS)
  );
  const [conversations, setConversations] = useState<MerchantConversation[]>(() =>
    loadStoredCollection('conversations', currentBusiness.id, INITIAL_MERCHANT_CONVERSATIONS)
  );
  const [activeConversationId, setActiveConversationId] = useState<string>(
    () => loadStoredCollection('conversations', currentBusiness.id, INITIAL_MERCHANT_CONVERSATIONS)[0]?.id || ''
  );
  const [leads, setLeads] = useState<MerchantLeadItem[]>(() =>
    loadStoredCollection('leads', currentBusiness.id, INITIAL_MERCHANT_LEADS)
  );
  const [orders, setOrders] = useState<MerchantOrderItem[]>(() =>
    loadStoredOrders(currentBusiness.id, currentBusiness.name, INITIAL_MERCHANT_ORDERS)
  );
  const [promotions, setPromotions] = useState<MerchantPromotionItem[]>(() =>
    loadStoredCollection('promotions', currentBusiness.id, INITIAL_MERCHANT_PROMOTIONS)
  );
  const [invoices] = useState<MerchantInvoiceItem[]>(INITIAL_MERCHANT_INVOICES);

  // Synchronize collections whenever currentBusiness switches
  useEffect(() => {
    const bizId = currentBusiness.id;
    const bizName = currentBusiness.name;

    const nextProducts = loadStoredCollection('products', bizId, INITIAL_MERCHANT_PRODUCTS);
    const nextServices = loadStoredCollection('services', bizId, INITIAL_MERCHANT_SERVICES);
    const nextOffers = loadStoredCollection('offers', bizId, INITIAL_MERCHANT_OFFERS);
    const nextPosts = loadStoredCollection('posts', bizId, INITIAL_MERCHANT_POSTS);
    const nextEvents = loadStoredCollection('events', bizId, INITIAL_MERCHANT_EVENTS);
    const nextReviews = loadStoredCollection('reviews', bizId, INITIAL_MERCHANT_REVIEWS);
    const nextConversations = loadStoredCollection('conversations', bizId, INITIAL_MERCHANT_CONVERSATIONS);
    const nextLeads = loadStoredCollection('leads', bizId, INITIAL_MERCHANT_LEADS);
    const nextOrders = loadStoredOrders(bizId, bizName, INITIAL_MERCHANT_ORDERS);
    const nextPromotions = loadStoredCollection('promotions', bizId, INITIAL_MERCHANT_PROMOTIONS);

    setProducts(nextProducts);
    setServices(nextServices);
    setOffers(nextOffers);
    setPosts(nextPosts);
    setEvents(nextEvents);
    setReviews(nextReviews);
    setConversations(nextConversations);
    setActiveConversationId(nextConversations[0]?.id || '');
    setLeads(nextLeads);
    setOrders(nextOrders);
    setPromotions(nextPromotions);
  }, [currentBusiness.id, currentBusiness.name]);

  // Sync live backend overview telemetry
  useEffect(() => {
    let isMounted = true;
    getMerchantOverview().then((res) => {
      if (res && isMounted && res.business) {
        setCurrentBusiness((prev) => ({
          ...prev,
          viewCount: res.metrics.profileViews,
          directionClicks: res.metrics.directionClicks,
          callClicks: res.metrics.callClicks,
          rating: res.business.rating,
          reviewCount: res.business.reviewCount,
          verificationStatus: res.business.isVerified ? 'Verified' : prev.verificationStatus,
        }));
      }
    });
    return () => {
      isMounted = false;
    };
  }, [currentBusiness.id]);

  // Persist collections per business
  useEffect(() => {
    try {
      localStorage.setItem(`myarea24_merchant_products_${currentBusiness.id}`, JSON.stringify(products));
    } catch {}
  }, [products, currentBusiness.id]);

  useEffect(() => {
    try {
      localStorage.setItem(`myarea24_merchant_services_${currentBusiness.id}`, JSON.stringify(services));
    } catch {}
  }, [services, currentBusiness.id]);

  useEffect(() => {
    try {
      localStorage.setItem(`myarea24_merchant_offers_${currentBusiness.id}`, JSON.stringify(offers));
    } catch {}
  }, [offers, currentBusiness.id]);

  useEffect(() => {
    try {
      localStorage.setItem(`myarea24_merchant_posts_${currentBusiness.id}`, JSON.stringify(posts));
    } catch {}
  }, [posts, currentBusiness.id]);

  useEffect(() => {
    try {
      localStorage.setItem(`myarea24_merchant_events_${currentBusiness.id}`, JSON.stringify(events));
    } catch {}
  }, [events, currentBusiness.id]);

  useEffect(() => {
    try {
      localStorage.setItem(`myarea24_merchant_reviews_${currentBusiness.id}`, JSON.stringify(reviews));
    } catch {}
  }, [reviews, currentBusiness.id]);

  useEffect(() => {
    try {
      localStorage.setItem(`myarea24_merchant_conversations_${currentBusiness.id}`, JSON.stringify(conversations));
    } catch {}
  }, [conversations, currentBusiness.id]);

  useEffect(() => {
    try {
      localStorage.setItem(`myarea24_merchant_leads_${currentBusiness.id}`, JSON.stringify(leads));
    } catch {}
  }, [leads, currentBusiness.id]);

  useEffect(() => {
    try {
      localStorage.setItem(`myarea24_merchant_orders_${currentBusiness.id}`, JSON.stringify(orders));
    } catch {}
  }, [orders, currentBusiness.id]);

  useEffect(() => {
    try {
      localStorage.setItem(`myarea24_merchant_promotions_${currentBusiness.id}`, JSON.stringify(promotions));
    } catch {}
  }, [promotions, currentBusiness.id]);

  // Notifications Popover & Profile Menu
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [businessDropdownOpen, setBusinessDropdownOpen] = useState(false);

  // Real-Time WebSockets State & Event Listeners
  const [wsStatus, setWsStatus] = useState<RealtimeConnectionStatus>(() => realtimeService.getStatus());
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    // Keep socket subscriptions aligned with active storefront
    realtimeService.updateSubscriptions({
      businessId: currentBusiness.id,
      area: currentBusiness.locationArea,
    });

    const handleStatus = (e: any) => {
      setWsStatus(e.detail?.status || 'disconnected');
    };

    const handleNewLead = (e: any) => {
      const lead = e.detail?.lead as MerchantLeadItem;
      if (!lead) return;
      setLeads((prev) => [lead, ...prev]);
      showMerchantToast(`🎯 Live Lead: ${lead.customerName} - ${lead.interestedCategory}`);
    };

    const handleNewInquiry = (e: any) => {
      const inq = e.detail?.inquiry;
      if (!inq) return;
      const newMsg = {
        id: `msg-${Date.now()}`,
        sender: 'customer' as const,
        text: inq.message,
        time: 'Just now',
      };
      setConversations((prev) => {
        const existingIdx = prev.findIndex(
          (c) => c.customerName.toLowerCase() === inq.customerName.toLowerCase()
        );
        if (existingIdx >= 0) {
          return prev.map((c, i) =>
            i === existingIdx
              ? {
                  ...c,
                  lastMessage: inq.message,
                  lastTime: 'Just now',
                  unreadCount: (c.unreadCount || 0) + 1,
                  messages: [...c.messages, newMsg],
                }
              : c
          );
        } else {
          const newConv: MerchantConversation = {
            id: `conv-${Date.now()}`,
            customerName: inq.customerName,
            avatar:
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
            badge: 'Enquiry',
            lastMessage: inq.message,
            lastTime: 'Just now',
            unreadCount: 1,
            phone: '+91 98112 00000',
            email: `${inq.customerName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
            location: currentBusiness.locationArea,
            memberSince: 'Today',
            tags: ['Live Customer', 'Instant Message'],
            messages: [newMsg],
          };
          return [newConv, ...prev];
        }
      });
      showMerchantToast(`💬 Live Inquiry from ${inq.customerName}: "${inq.message}"`);
    };

    const handleNewReview = (e: any) => {
      const rev = e.detail?.review as MerchantReviewItem;
      if (!rev) return;
      setReviews((prev) => [rev, ...prev]);
      showMerchantToast(`⭐ New ${rev.rating}★ Review from ${rev.customerName}!`);
    };

    const handleNewOrder = (e: any) => {
      const ord = e.detail?.order;
      if (!ord) return;
      const formatted: MerchantOrderItem = {
        id: ord.id || `ord-${Date.now()}`,
        orderNumber: ord.order_number || ord.orderNumber || `MA24-ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        businessId: ord.business_id || ord.businessId || currentBusiness.id,
        businessName: ord.business_name || ord.businessName || currentBusiness.name,
        customerName: ord.customer_name || ord.customerName || 'Local Neighbor',
        customerPhone: ord.customer_phone || ord.customerPhone || '+91 98000 00000',
        deliveryAddress: ord.delivery_address || ord.deliveryAddress || currentBusiness.locationArea,
        finalPayable: Number(ord.final_payable || ord.finalPayable || 350),
        paymentMethod: ord.payment_method || ord.paymentMethod || 'upi_qr',
        paymentStatus: ord.payment_status || ord.paymentStatus || 'paid',
        status: (ord.status as any) || 'placed',
        estimatedDeliveryMins: ord.estimated_delivery_mins || ord.estimatedDeliveryMins || 20,
        createdAt: ord.created_at || ord.createdAt || new Date().toISOString(),
        items: Array.isArray(ord.items)
          ? ord.items.map((it: any) => ({
              productName: it.product_name || it.productName || 'Item',
              unitPrice: Number(it.unit_price || it.unitPrice || 100),
              quantity: Number(it.quantity || 1),
              totalPrice: Number(it.total_price || it.totalPrice || 100),
            }))
          : [],
      };
      setOrders((prev) => [formatted, ...prev.filter((o) => o.orderNumber !== formatted.orderNumber)]);
      showMerchantToast(`🛍️ Live Order: #${formatted.orderNumber} - ₹${formatted.finalPayable} (${formatted.customerName})!`);
    };

    const handleOrderStatusUpdate = (e: any) => {
      const detail = e.detail;
      if (!detail?.orderNumber) return;
      setOrders((prev) =>
        prev.map((o) =>
          o.orderNumber.toLowerCase() === detail.orderNumber.toLowerCase()
            ? { ...o, status: detail.status, paymentStatus: detail.paymentStatus || o.paymentStatus }
            : o
        )
      );
    };

    window.addEventListener(REALTIME_STATUS_EVENT, handleStatus);
    window.addEventListener(MERCHANT_LEAD_EVENT, handleNewLead);
    window.addEventListener(MERCHANT_INQUIRY_EVENT, handleNewInquiry);
    window.addEventListener(MERCHANT_REVIEW_EVENT, handleNewReview);
    window.addEventListener(MERCHANT_ORDER_EVENT, handleNewOrder);
    window.addEventListener(ORDER_STATUS_EVENT, handleOrderStatusUpdate);

    return () => {
      window.removeEventListener(REALTIME_STATUS_EVENT, handleStatus);
      window.removeEventListener(MERCHANT_LEAD_EVENT, handleNewLead);
      window.removeEventListener(MERCHANT_INQUIRY_EVENT, handleNewInquiry);
      window.removeEventListener(MERCHANT_REVIEW_EVENT, handleNewReview);
      window.removeEventListener(MERCHANT_ORDER_EVENT, handleNewOrder);
      window.removeEventListener(ORDER_STATUS_EVENT, handleOrderStatusUpdate);
    };
  }, [currentBusiness.id, currentBusiness.locationArea]);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          currentBusiness,
          activeDashboard,
        })
      );
    } catch {}
  }, [currentBusiness, activeDashboard]);

  // Handlers
  const handleSwitchBusiness = (bizOrId: string | MerchantRegistrationProfile) => {
    if (typeof bizOrId === 'string') {
      const accounts = getStoredMerchantAccounts();
      const found = accounts.find((a) => (a.id || a.businessName) === bizOrId);
      if (found) {
        saveMerchantSession(found);
        setSession(found);
        const updatedBiz = buildMerchantBusinessInfo(found);
        setCurrentBusiness(updatedBiz);
        try {
          const stored = localStorage.getItem(`myarea24_merchant_products_${updatedBiz.id}`);
          setProducts(stored ? JSON.parse(stored) : []);
        } catch {
          setProducts([]);
        }
        setBusinessDropdownOpen(false);
        showMerchantToast(`Switched storefront to ${updatedBiz.name}`);
        return;
      }
      if (bizOrId === 'biz-sharma-fuel') {
        setCurrentBusiness(DEFAULT_BUSINESS_SHARMA_FUEL);
      } else {
        setCurrentBusiness(DEFAULT_BUSINESS_THE_DAILY_BREW);
      }
    } else {
      saveMerchantSession(bizOrId);
      setSession(bizOrId);
      const updatedBiz = buildMerchantBusinessInfo(bizOrId);
      setCurrentBusiness(updatedBiz);
      try {
        const stored = localStorage.getItem(`myarea24_merchant_products_${updatedBiz.id}`);
        setProducts(stored ? JSON.parse(stored) : []);
      } catch {
        setProducts([]);
      }
      showMerchantToast(`Switched storefront to ${updatedBiz.name}`);
    }
    setBusinessDropdownOpen(false);
  };

  const handleLockStorefront = () => {
    clearMerchantSession();
    setSession(null);
    showMerchantToast('Storefront locked.');
    onSwitchToCitizen();
  };

  const handleUpdateBusiness = (updated: Partial<MerchantBusinessInfo>) => {
    const nextBiz = { ...currentBusiness, ...updated };
    setCurrentBusiness(nextBiz);
    marketplace?.addBusiness({
      name: nextBiz.name,
      cat: nextBiz.category,
      phone: nextBiz.phone,
      address: nextBiz.fullAddress,
    });
    window.dispatchEvent(new CustomEvent('myarea24_marketplace_sync'));
    showMerchantToast(`Storefront settings updated & synced live.`);
  };

  const handleToggleProductStatus = (id: string) => {
    const target = products.find((p) => p.id === id);
    const nextStatus: 'Active' | 'Paused' = target?.status === 'Active' ? 'Paused' : 'Active';
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: nextStatus } : p))
    );
    syncMerchantProductToggle(id, nextStatus === 'Paused');
    window.dispatchEvent(new CustomEvent('myarea24_marketplace_sync'));
    showMerchantToast(`Product stock status updated to ${nextStatus}.`);
  };

  const handleToggleServiceStatus = (id: string) => {
    setServices((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status: s.status === 'Active' ? 'Paused' : 'Active' } : s
      )
    );
  };

  const handleToggleOfferStatus = (id: string) => {
    setOffers((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status: o.status === 'Active' ? 'Paused' : 'Active' } : o
      )
    );
  };

  const handleToggleLikePost = (id: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              likes: p.isLiked ? p.likes - 1 : p.likes + 1,
              isLiked: !p.isLiked,
            }
          : p
      )
    );
  };

  const handleSendMessage = (convId: string, text: string) => {
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: 'merchant' as const,
      text,
      time: 'Just now',
    };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? {
              ...c,
              lastMessage: text,
              lastTime: 'Just now',
              messages: [...c.messages, newMsg],
            }
          : c
      )
    );
  };

  const handleUpdateLeadStatus = (leadId: string, newStatus: MerchantLeadItem['status']) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
    );
  };

  const handleAddReplyToReview = (reviewId: string, text: string) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              reply: {
                ownerName: `${currentBusiness.ownerName} (Owner)`,
                date: 'Just now',
                text,
              },
            }
          : r
      )
    );
  };

  const handleUpdateOrderStatus = (
    orderNumber: string,
    nextStatus: 'placed' | 'confirmed' | 'out_for_delivery' | 'delivered' | 'cancelled'
  ) => {
    setOrders((prev) =>
      prev.map((o) => (o.orderNumber === orderNumber ? { ...o, status: nextStatus } : o))
    );
    showMerchantToast(`Order #${orderNumber} marked as ${nextStatus.replace(/_/g, ' ')}.`);
  };

  const handleSimulateOrder = async () => {
    showMerchantToast('Simulating live incoming customer order...');
    await realtimeService.triggerMerchantOrder({
      customerName: 'Aanya Mathur',
      customerPhone: '+91 98112 77889',
      deliveryAddress: `Flat 502, Tower C, ${currentBusiness.locationArea}`,
      finalPayable: 450.0,
      items: [
        {
          productName: products[0]?.name || `${currentBusiness.category.split('&')[0].trim()} Package`,
          unitPrice: 220.0,
          quantity: 1,
          totalPrice: 220.0,
        },
        {
          productName: products[1]?.name || 'Neighborhood Special',
          unitPrice: 230.0,
          quantity: 1,
          totalPrice: 230.0,
        },
      ],
    });
  };

  const renderActiveDashboardContent = () => {
    switch (activeDashboard) {
      case 'overview':
        return (
          <MerchantHomeDashboard
            business={currentBusiness}
            onNavigate={handleNavigate}
            onOpenQuickAction={setModalType}
            products={products}
            services={services}
            offers={offers}
            posts={posts}
            reviews={reviews}
            conversations={conversations}
            leads={leads}
            orders={orders}
          />
        );
      case 'orders':
        return (
          <MerchantOrdersDashboard
            business={currentBusiness}
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onSimulateOrder={handleSimulateOrder}
          />
        );
      case 'profile':
        return (
          <MerchantProfileDashboard
            business={currentBusiness}
            onUpdateBusiness={handleUpdateBusiness}
            onNavigate={handleNavigate}
            onOpenQuickAction={setModalType}
          />
        );
      case 'products':
        return (
          <MerchantProductsDashboard
            business={currentBusiness}
            products={products}
            services={services}
            onToggleProductStatus={handleToggleProductStatus}
            onToggleServiceStatus={handleToggleServiceStatus}
            onOpenAddProductModal={() => setModalType('add_product')}
            onOpenAddServiceModal={() => setModalType('add_service')}
          />
        );
      case 'offers':
        return (
          <MerchantOffersDashboard
            business={currentBusiness}
            offers={offers}
            onToggleOfferStatus={handleToggleOfferStatus}
            onOpenCreateOfferModal={() => setModalType('add_offer')}
          />
        );
      case 'posts':
        return (
          <MerchantPostsDashboard
            business={currentBusiness}
            posts={posts}
            onOpenCreatePostModal={() => setModalType('create_post')}
            onToggleLikePost={handleToggleLikePost}
          />
        );
      case 'events':
        return (
          <MerchantEventsDashboard
            business={currentBusiness}
            events={events}
            onOpenCreateEventModal={() => setModalType('create_event')}
          />
        );
      case 'reviews':
        return (
          <MerchantReviewsDashboard
            business={currentBusiness}
            reviews={reviews}
            onAddReplyToReview={handleAddReplyToReview}
            onOpenRequestReviewModal={() => setModalType('request_review')}
          />
        );
      case 'messages':
        return (
          <MerchantMessagesDashboard
            business={currentBusiness}
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelectConversation={setActiveConversationId}
            onSendMessage={handleSendMessage}
          />
        );
      case 'leads':
        return (
          <MerchantLeadsDashboard
            business={currentBusiness}
            leads={leads}
            onUpdateLeadStatus={handleUpdateLeadStatus}
            onOpenMessageWithLead={(lead) => {
              handleNavigate('messages');
            }}
          />
        );
      case 'analytics':
        return (
          <MerchantAnalyticsDashboard
            business={currentBusiness}
            products={products}
            orders={orders}
            leads={leads}
            reviews={reviews}
          />
        );
      case 'promotions':
        return (
          <MerchantPromotionsDashboard
            business={currentBusiness}
            promotions={promotions}
            onOpenCreatePromoModal={(type) => setModalType(type ? `create_${type}` : 'create_promo')}
          />
        );
      case 'payments':
        return (
          <MerchantPaymentsDashboard
            business={currentBusiness}
            invoices={invoices}
          />
        );
      case 'settings':
        return (
          <MerchantSettingsDashboard
            business={currentBusiness}
            onUpdateBusiness={handleUpdateBusiness}
          />
        );
      default:
        return null;
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#312E81] flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="w-16 h-16 rounded-3xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 mb-4 shadow-xl">
          <Lock className="w-8 h-8 text-indigo-300" />
        </div>
        <div className="max-w-md space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>MyArea24 Merchant Security Shield</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">Merchant Portal Authentication Required</h2>
          <p className="text-xs text-indigo-200/80 leading-relaxed">
            Your neighborhood storefront is password & PIN-protected to safeguard live orders, customer inquiries, and commercial operations.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-8 w-full max-w-sm">
          <button
            type="button"
            onClick={() => {
              setAuthModalMode('login');
              setAuthModalOpen(true);
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer transition active:scale-98"
          >
            <KeyRound className="w-4 h-4" />
            <span>Enter Store PIN / Log In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthModalMode('register');
              setAuthModalOpen(true);
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer transition active:scale-98"
          >
            <Store className="w-4 h-4" />
            <span>Register New Store</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onSwitchToCitizen}
          className="mt-6 text-xs text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer transition"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>← Back to Resident / Citizen Portal</span>
        </button>

        <MerchantRegistrationModal
          isOpen={authModalOpen}
          defaultMode={authModalMode}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={(profile) => {
            setSession(profile);
            setCurrentBusiness(buildMerchantBusinessInfo(profile));
            setAuthModalOpen(false);
            showMerchantToast(`Authenticated into ${profile.businessName}!`);
          }}
          currentArea={currentLocation?.areaName || 'Your Local Area'}
          coords={currentLocation?.coords}
        />
      </div>
    );
  }

  const unreadMsgCount = conversations.reduce(
    (acc, c) => acc + (c.unreadCount || 0),
    0
  );
  const newLeadsCount = leads.filter((l) => l.status === 'New').length;

  return (
    <div className="min-h-screen bg-[#F4F6FB] text-slate-900 flex flex-col font-sans">
      {/* =========================================================================
          1. NATIVE MOBILE APP VIEW (< lg)
             Automatically renders full-screen on mobile devices:
             100% full-width, clean native app bar, native cards, and fixed bottom navigation.
          ========================================================================= */}
      <div className="lg:hidden flex-1 flex flex-col w-full min-h-screen">
        <MerchantMobileAppView
          business={currentBusiness}
          activeDashboard={activeDashboard}
          onNavigate={handleNavigate}
          onSwitchBusiness={handleSwitchBusiness}
          onOpenQuickAction={setModalType}
          products={products}
          services={services}
          offers={offers}
          posts={posts}
          events={events}
          reviews={reviews}
          conversations={conversations}
          activeConversationId={activeConversationId}
          leads={leads}
          orders={orders}
          promotions={promotions}
          invoices={invoices}
          onToggleProductStatus={handleToggleProductStatus}
          onToggleServiceStatus={handleToggleServiceStatus}
          onToggleOfferStatus={handleToggleOfferStatus}
          onToggleLikePost={handleToggleLikePost}
          onSelectConversation={setActiveConversationId}
          onSendMessage={handleSendMessage}
          onUpdateLeadStatus={handleUpdateLeadStatus}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onSimulateOrder={handleSimulateOrder}
          onAddReplyToReview={handleAddReplyToReview}
          onUpdateBusiness={handleUpdateBusiness}
          onOpenAddProductModal={() => setModalType('add_product')}
          onOpenAddServiceModal={() => setModalType('add_service')}
          onOpenCreateOfferModal={() => setModalType('add_offer')}
          onOpenCreatePostModal={() => setModalType('create_post')}
          onOpenCreateEventModal={() => setModalType('create_event')}
          onOpenRequestReviewModal={() => setModalType('request_review')}
          onOpenCreatePromoModal={(type) => setModalType(type ? `create_${type}` : 'create_promo')}
          onSwitchToCitizen={onSwitchToCitizen}
        />
      </div>

      {/* =========================================================================
          2. DESKTOP WEBSITE LAYOUT (>= lg)
             Left Sidebar (235px) + Sticky Top Header (h-16) + Main Body
         ========================================================================= */}
      <div className="hidden lg:flex flex-1 min-h-0">
        {/* LEFT SIDEBAR (Exact Navigation from Page 1 of PDF) */}
        <aside className="w-[235px] shrink-0 bg-white border-r border-slate-200/80 flex flex-col justify-between select-none sticky top-0 h-screen">
            <div className="p-3.5 overflow-y-auto no-scrollbar">
              {/* Brand Logo & Merchant Portal Pill */}
              <div className="px-2 pt-1 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[19px] font-extrabold tracking-tight text-[#1E1B4B]">
                    MyArea<span className="text-[#8B5CF6]">24</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white text-[9px] font-extrabold uppercase">
                    Merchant
                  </span>
                </div>
              </div>

              {/* SECTION 1: OVERVIEW / MAIN */}
              <nav className="space-y-0.5">
                {[
                  { id: 'overview', label: 'Dashboard', icon: Home },
                  {
                    id: 'orders',
                    label: 'Live Orders',
                    icon: ShoppingBag,
                    badge: orders.filter((o) => o.status === 'placed').length > 0
                      ? String(orders.filter((o) => o.status === 'placed').length)
                      : undefined,
                  },
                  { id: 'profile', label: 'Business Profile', icon: Store },
                  { id: 'products', label: 'Products & Services', icon: Package },
                  { id: 'offers', label: 'Offers & Deals', icon: Tag },
                  { id: 'posts', label: 'Posts & Updates', icon: FileText },
                  { id: 'events', label: 'Events', icon: Calendar },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = activeDashboard === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavigate(item.id as any)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        active
                          ? 'bg-[#F3E8FF] text-[#7C3AED] font-bold shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${active ? 'text-[#7C3AED]' : 'text-slate-500'}`} />
                        <span>{item.label}</span>
                      </span>
                      {item.badge && (
                        <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px] font-extrabold animate-pulse">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* SECTION 2: CUSTOMERS */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <p className="px-3 mb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  CUSTOMERS
                </p>
                <nav className="space-y-0.5">
                  {[
                    { id: 'reviews', label: 'Customer Reviews', icon: Star },
                    {
                      id: 'messages',
                      label: 'Messages',
                      icon: MessageSquare,
                      badge: unreadMsgCount > 0 ? String(unreadMsgCount) : undefined,
                    },
                    {
                      id: 'leads',
                      label: 'Leads & Enquiries',
                      icon: Users,
                      badge: newLeadsCount > 0 ? String(newLeadsCount) : undefined,
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    const active = activeDashboard === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleNavigate(item.id as any)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                          active
                            ? 'bg-[#F3E8FF] text-[#7C3AED] font-bold'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 ${active ? 'text-[#7C3AED]' : 'text-slate-500'}`} />
                          <span>{item.label}</span>
                        </span>
                        {item.badge && (
                          <span className="px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-600 text-[10px] font-extrabold">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* SECTION 3: GROWTH */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <p className="px-3 mb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  GROWTH
                </p>
                <nav className="space-y-0.5">
                  {[
                    { id: 'analytics', label: 'Analytics & Insights', icon: TrendingUp },
                    { id: 'promotions', label: 'Promotions', icon: Megaphone },
                    { id: 'payments', label: 'Payments & Plans', icon: CreditCard },
                  ].map((item) => {
                    const Icon = item.icon;
                    const active = activeDashboard === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleNavigate(item.id as any)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                          active
                            ? 'bg-[#F3E8FF] text-[#7C3AED] font-bold'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${active ? 'text-[#7C3AED]' : 'text-slate-500'}`} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* SECTION 4: ACCOUNT */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <p className="px-3 mb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  ACCOUNT
                </p>
                <button
                  type="button"
                  onClick={() => handleNavigate('settings')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    activeDashboard === 'settings'
                      ? 'bg-[#F3E8FF] text-[#7C3AED] font-bold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Settings
                    className={`w-4 h-4 ${activeDashboard === 'settings' ? 'text-[#7C3AED]' : 'text-slate-500'}`}
                  />
                  <span>Settings</span>
                </button>
              </div>
            </div>

            {/* Switch to Citizen Button in Sidebar */}
            <div className="px-3.5 pb-2">
              <button
                type="button"
                onClick={onSwitchToCitizen}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-blue-700 bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200/60 transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span>Citizen Portal</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
              </button>
            </div>

            {/* Need Help? Box at bottom */}
            <div className="p-3.5 border-t border-slate-100">
              <div className="rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 p-3 border border-purple-200/60">
                <p className="text-xs font-extrabold text-slate-900">Need Help?</p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Talk to our merchant support team
                </p>
                <button
                  type="button"
                  onClick={() => alert('Merchant Priority Support: merchant-support@myarea24.in / WhatsApp: +91 98111 22233')}
                  className="w-full mt-2 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer shadow-xs"
                >
                  <span>Contact Support</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </aside>

          {/* MAIN COLUMN: Header + Active Dashboard */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* DESKTOP TOP HEADER */}
            <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
              <div className="flex items-center gap-4 flex-1 max-w-2xl">
                {/* Location / Business Selector */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setBusinessDropdownOpen((v) => !v)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 text-xs font-bold text-slate-800 transition cursor-pointer"
                  >
                    <Store className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="truncate max-w-[170px]">{currentBusiness.name}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {businessDropdownOpen && (
                    <div
                      onClick={() => setBusinessDropdownOpen(false)}
                      className="absolute left-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                    >
                      <p className="px-2 py-1 text-[10px] font-extrabold text-slate-400 uppercase">
                        Select Storefront
                      </p>
                      <div className="space-y-1 max-h-56 overflow-y-auto">
                        {getStoredMerchantAccounts().length > 0 ? (
                          getStoredMerchantAccounts().map((acc) => {
                            const isSelected = acc.businessName === currentBusiness.name;
                            return (
                              <button
                                key={acc.id || acc.businessName}
                                type="button"
                                onClick={() => handleSwitchBusiness(acc)}
                                className={`w-full p-2.5 rounded-xl text-left transition text-xs font-bold flex items-center justify-between cursor-pointer ${
                                  isSelected
                                    ? 'bg-purple-50 text-purple-900 border border-purple-200'
                                    : 'hover:bg-slate-50 text-slate-800'
                                }`}
                              >
                                <div className="truncate pr-2">
                                  <p className="truncate font-extrabold">{acc.businessName}</p>
                                  <p className="text-[10px] text-slate-400 font-medium truncate">
                                    {acc.category} • {acc.locality}
                                  </p>
                                </div>
                                {isSelected && (
                                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                                )}
                              </button>
                            );
                          })
                        ) : (
                          <div className="p-2.5 text-xs font-bold text-slate-800">
                            {currentBusiness.name} ({currentBusiness.category})
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setBusinessDropdownOpen(false);
                          setAuthModalMode('register');
                          setAuthModalOpen(true);
                        }}
                        className="w-full mt-2 pt-2 border-t border-slate-100 p-1.5 rounded-lg text-left hover:bg-slate-50 transition text-xs font-extrabold text-indigo-600 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Register Another Store / Branch</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Global Search */}
                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search features, insights, help..."
                      className="bg-transparent text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none w-full"
                    />
                  </div>
                  <span className="px-1.5 py-0.2 rounded bg-white border border-slate-200 text-[10px] text-slate-400">
                    ⌘ K
                  </span>
                </div>
              </div>

              {/* Right Pills */}
              <div className="flex items-center gap-2.5 shrink-0">
                {/* Switch to Citizen Portal Pill */}
                <button
                  type="button"
                  onClick={onSwitchToCitizen}
                  className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-blue-500/20 transition cursor-pointer"
                  title="Switch to Resident / Citizen View"
                >
                  <Globe className="w-3.5 h-3.5 text-blue-200" />
                  <span>Switch to Citizen View</span>
                </button>

                {/* Lock Storefront Button */}
                <button
                  type="button"
                  onClick={handleLockStorefront}
                  className="px-3 py-1.5 rounded-full bg-slate-50 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                  title="Lock Merchant Portal & Sign Out"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-500 hover:text-rose-600" />
                  <span>Lock Store</span>
                </button>

                {/* Live WebSocket Indicator */}
                <div
                  className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 select-none"
                  title={
                    wsStatus === 'connected'
                      ? 'Real-Time WebSockets Active: Leads, Reviews & Inquiries arrive instantly'
                      : `WebSocket: ${wsStatus}`
                  }
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      wsStatus === 'connected'
                        ? 'bg-emerald-500 animate-pulse'
                        : wsStatus === 'connecting' || wsStatus === 'reconnecting'
                        ? 'bg-amber-400 animate-bounce'
                        : 'bg-slate-400'
                    }`}
                  />
                  <span className="text-[10px] tracking-wider uppercase font-black text-slate-600">
                    {wsStatus === 'connected' ? 'Live Storefront' : wsStatus}
                  </span>
                </div>

                {/* Instant Simulator Pill */}
                <button
                  type="button"
                  disabled={isSimulating}
                  onClick={async () => {
                    setIsSimulating(true);
                    await realtimeService.triggerMerchantLead({
                      customerName: 'Aarav Sharma',
                      topic: 'Espresso Bar & Pastry Catering Quote',
                      phone: '+91 98112 44321',
                      message: 'Inquiring for 40-person corporate team kit delivery this Friday.',
                    });
                    setTimeout(() => setIsSimulating(false), 800);
                  }}
                  className="px-3 py-1.5 rounded-full bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-2xs"
                  title="Simulate instant customer lead over WebSocket"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>{isSimulating ? 'Simulating...' : 'Test Lead'}</span>
                </button>

                <span className="px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800 flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  <span>28°C</span>
                </span>

                {(() => {
                  const placedOrdersList = orders.filter((o) => o.status === 'placed');
                  const unreadConvs = conversations.filter((c) => (c.unreadCount || 0) > 0);
                  const newLeadsList = leads.filter((l) => l.status === 'New');
                  const totalUnread = placedOrdersList.length + unreadConvs.length + newLeadsList.length;
                  const ownerInitials = (currentBusiness.ownerName || 'Merchant')
                    .trim()
                    .split(/\s+/)
                    .map((w: string) => w[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();

                  return (
                    <>
                      <button
                        type="button"
                        onClick={() => setNotificationsOpen((v) => !v)}
                        className="w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 relative cursor-pointer"
                        title="Storefront notifications"
                      >
                        <Bell className="w-4 h-4" />
                        {totalUnread > 0 && (
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 absolute top-1.5 right-1.5 ring-2 ring-white animate-pulse" />
                        )}
                      </button>

                      {/* User Pill */}
                      <button
                        type="button"
                        onClick={() => setProfileMenuOpen((v) => !v)}
                        className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
                      >
                        <span className="w-7 h-7 rounded-full bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center">
                          {ownerInitials || 'MP'}
                        </span>
                        <div className="text-left hidden xl:block">
                          <p className="text-xs font-bold text-slate-800 leading-none">
                            {currentBusiness.ownerName}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {currentBusiness.ownerRole} • {currentBusiness.name}
                          </p>
                        </div>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      </button>

                      {/* Notifications Popover */}
                      {notificationsOpen && (
                        <div
                          onClick={() => setNotificationsOpen(false)}
                          className="fixed inset-0 z-50 flex items-start justify-end pt-28 px-6 bg-black/20"
                        >
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-84 p-3 space-y-2 animate-in zoom-in-95 duration-100"
                          >
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                              <span className="text-xs font-extrabold text-slate-900">
                                Storefront Notifications
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  totalUnread > 0
                                    ? 'text-rose-600 bg-rose-50'
                                    : 'text-emerald-700 bg-emerald-50'
                                }`}
                              >
                                {totalUnread > 0 ? `${totalUnread} New` : 'All Caught Up'}
                              </span>
                            </div>

                            <div className="space-y-2 text-xs max-h-72 overflow-y-auto">
                              {placedOrdersList.length > 0 && (
                                <div
                                  onClick={() => {
                                    setNotificationsOpen(false);
                                    handleNavigate('orders');
                                  }}
                                  className="p-2.5 rounded-xl bg-rose-50/80 hover:bg-rose-100/80 border border-rose-100 cursor-pointer transition"
                                >
                                  <div className="flex items-center justify-between">
                                    <p className="font-bold text-rose-950">
                                      New Order #{placedOrdersList[0].orderNumber}
                                    </p>
                                    <span className="text-[10px] font-black text-rose-700">₹{placedOrdersList[0].finalPayable}</span>
                                  </div>
                                  <p className="text-[11px] text-rose-800 mt-0.5">
                                    From {placedOrdersList[0].customerName} • Tap to view orders
                                  </p>
                                </div>
                              )}

                              {unreadConvs.length > 0 && (
                                <div
                                  onClick={() => {
                                    setNotificationsOpen(false);
                                    handleNavigate('messages');
                                  }}
                                  className="p-2.5 rounded-xl bg-purple-50/80 hover:bg-purple-100/80 border border-purple-100 cursor-pointer transition"
                                >
                                  <p className="font-bold text-purple-950">
                                    Message from {unreadConvs[0].customerName}
                                  </p>
                                  <p className="text-[11px] text-purple-800 line-clamp-1 mt-0.5">
                                    "{unreadConvs[0].lastMessage}"
                                  </p>
                                </div>
                              )}

                              {newLeadsList.length > 0 && (
                                <div
                                  onClick={() => {
                                    setNotificationsOpen(false);
                                    handleNavigate('leads');
                                  }}
                                  className="p-2.5 rounded-xl bg-indigo-50/80 hover:bg-indigo-100/80 border border-indigo-100 cursor-pointer transition"
                                >
                                  <p className="font-bold text-indigo-950">
                                    Inquiry for {newLeadsList[0].interestedCategory}
                                  </p>
                                  <p className="text-[11px] text-indigo-800 mt-0.5">
                                    From {newLeadsList[0].customerName} • Tap to manage leads
                                  </p>
                                </div>
                              )}

                              {reviews.length > 0 && totalUnread === 0 && (
                                <div
                                  onClick={() => {
                                    setNotificationsOpen(false);
                                    handleNavigate('reviews');
                                  }}
                                  className="p-2.5 rounded-xl bg-amber-50/80 hover:bg-amber-100/80 border border-amber-100 cursor-pointer transition"
                                >
                                  <p className="font-bold text-amber-950">
                                    {reviews[0].rating} ★ Review Received
                                  </p>
                                  <p className="text-[11px] text-amber-800 line-clamp-1 mt-0.5">
                                    "{reviews[0].comment}"
                                  </p>
                                </div>
                              )}

                              {totalUnread === 0 && reviews.length === 0 && (
                                <div className="py-6 text-center text-slate-400">
                                  <Bell className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
                                  <p className="text-xs font-bold text-slate-600">No new alerts</p>
                                  <p className="text-[10px] text-slate-400 mt-0.5">
                                    Incoming orders and neighborhood inquiries will pop up here in real time.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </header>

            {/* Profile Menu Popover */}
            {profileMenuOpen && (
              <div
                onClick={() => setProfileMenuOpen(false)}
                className="fixed inset-0 z-50 flex items-start justify-end pt-28 px-6 bg-black/20"
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-72 p-2 space-y-1 animate-in zoom-in-95 duration-100 text-xs"
                >
                  <div className="p-3 bg-purple-50 rounded-xl mb-1">
                    <p className="font-extrabold text-purple-950">{currentBusiness.ownerName}</p>
                    <p className="text-[11px] text-purple-700">{currentBusiness.name}</p>
                    <p className="text-[10px] text-purple-600 font-mono mt-0.5">{currentBusiness.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      handleNavigate('profile');
                    }}
                    className="w-full px-3 py-2 rounded-xl hover:bg-slate-50 text-left font-bold text-slate-700 flex items-center justify-between"
                  >
                    <span>Storefront Profile</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      handleNavigate('settings');
                    }}
                    className="w-full px-3 py-2 rounded-xl hover:bg-slate-50 text-left font-bold text-slate-700 flex items-center justify-between"
                  >
                    <span>Account Settings</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      onSwitchToCitizen();
                    }}
                    className="w-full px-3 py-2 rounded-xl hover:bg-indigo-50 text-left font-bold text-indigo-700 flex items-center justify-between cursor-pointer"
                  >
                    <span>Switch to Citizen App</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      handleLockStorefront();
                    }}
                    className="w-full px-3 py-2 rounded-xl hover:bg-rose-50 text-left font-bold text-rose-600 flex items-center justify-between border-t border-slate-100 mt-1 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Lock & Sign Out</span>
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* DESKTOP MAIN BODY */}
            <main className="flex-1 p-6 pb-12 overflow-y-auto">
              <div className="max-w-[1360px] mx-auto">
                {renderActiveDashboardContent()}
              </div>
            </main>
          </div>
        </div>

      {/* =========================================================================
          INTERACTIVE ACTION MODALS MANAGER & GLOBAL SYNC BRIDGE
         ========================================================================= */}
      <MerchantActionModals
        modalType={modalType}
        onClose={() => setModalType(null)}
        onAddProduct={(newProd) => {
          setProducts((prev) => [newProd, ...prev]);
          createMerchantProduct({
            name: newProd.name,
            category: newProd.category,
            price: newProd.price,
            originalPrice: newProd.originalPrice,
            inStock: newProd.status === 'Active',
            image: newProd.image,
          });
          syncMerchantProductToGlobal(newProd, {
            name: currentBusiness.name,
            address: currentBusiness.fullAddress,
            phone: currentBusiness.phone,
            locality: currentBusiness.locationArea,
          });
          marketplace?.addProduct({
            name: newProd.name,
            brand: currentBusiness.name,
            cat: newProd.category,
            localPriceNum: newProd.price,
            onlinePriceNum: Math.round(newProd.price * 1.18),
            store: currentBusiness.name,
            storeAddress: currentBusiness.fullAddress,
            phone: currentBusiness.phone,
            inStock: newProd.status === 'Active',
            unit: '1 item • Live Storefront',
          });
          window.dispatchEvent(new CustomEvent('myarea24_marketplace_sync'));
          showMerchantToast(`✓ "${newProd.name}" added to catalog & published live to nearby citizens in ${currentBusiness.locationArea}!`);
        }}
        onAddService={(newSrv) => {
          setServices((prev) => [newSrv, ...prev]);
          createMerchantService({
            name: newSrv.name,
            category: newSrv.category,
            priceValue: newSrv.priceValue || 500,
            phone: currentBusiness.phone,
            description: newSrv.description,
          });
          marketplace?.addService({
            name: newSrv.name,
            cat: newSrv.category,
            priceNum: newSrv.priceValue || 500,
            phone: currentBusiness.phone,
            locality: currentBusiness.locationArea,
          });
          window.dispatchEvent(new CustomEvent('myarea24_marketplace_sync'));
          showMerchantToast(`✓ Service "${newSrv.name}" registered and published live!`);
        }}
        onAddOffer={(newOffer) => {
          setOffers((prev) => [newOffer, ...prev]);
          createMerchantOffer({
            title: newOffer.title,
            discountText: newOffer.discountText,
            code: newOffer.code,
          });
          marketplace?.addOffer({
            title: newOffer.title,
            store: currentBusiness.name,
            badge: newOffer.discountText,
            code: newOffer.code,
            cat: 'Food & Dining',
            valid: '14 days left',
          });
          window.dispatchEvent(new CustomEvent('myarea24_marketplace_sync'));
          showMerchantToast(`✓ Offer "${newOffer.title}" published live for area residents!`);
        }}
        onAddPost={(newPost) => {
          setPosts((prev) => [newPost, ...prev]);
          showMerchantToast(`✓ Community post "${newPost.title}" published!`);
        }}
        onAddEvent={(newEvent) => {
          setEvents((prev) => [newEvent, ...prev]);
          createMerchantEvent({
            title: newEvent.title,
            category: newEvent.category,
            venue: newEvent.venue,
            dateDisplay: newEvent.dateDisplay,
          });
          marketplace?.addEvent({
            title: newEvent.title,
            cat: newEvent.category,
            loc: newEvent.venue,
            time: newEvent.dateDisplay,
          });
          window.dispatchEvent(new CustomEvent('myarea24_marketplace_sync'));
          showMerchantToast(`✓ Event "${newEvent.title}" published live in the local calendar!`);
        }}
        onAddPromotion={(newPromo) => {
          setPromotions((prev) => [newPromo, ...prev]);
          showMerchantToast(`✓ Local boost campaign "${newPromo.title}" launched!`);
        }}
        businessName={currentBusiness.name}
      />

      {/* LIVE TOAST FEEDBACK */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-purple-500/40 flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* BRANCH REGISTRATION & AUTH MODAL */}
      <MerchantRegistrationModal
        isOpen={authModalOpen}
        defaultMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(profile) => {
          setSession(profile);
          setCurrentBusiness(buildMerchantBusinessInfo(profile));
          setAuthModalOpen(false);
          showMerchantToast(`Authenticated into ${profile.businessName}!`);
        }}
        currentArea={currentLocation?.areaName || 'Your Local Area'}
        coords={currentLocation?.coords}
      />
    </div>
  );
}
