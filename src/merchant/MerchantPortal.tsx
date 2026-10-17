import React, { useState, useEffect } from 'react';
import {
  MerchantDashboardId,
  MerchantDeviceViewMode,
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
} from 'lucide-react';
import { MerchantHomeDashboard } from './dashboards/MerchantHomeDashboard';
import { MerchantProfileDashboard } from './dashboards/MerchantProfileDashboard';
import { MerchantProductsDashboard } from './dashboards/MerchantProductsDashboard';
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
import { MerchantVisualGuideComparison } from './components/MerchantVisualGuideComparison';
import { MerchantActionModals } from './components/MerchantActionModals';

interface MerchantPortalProps {
  onSwitchToCitizen: () => void;
}

const STORAGE_KEY = 'myarea24_merchant_portal_state_v1';

export function MerchantPortal({ onSwitchToCitizen }: MerchantPortalProps) {
  // Business Storefront (The Daily Brew vs Sharma Fuel Station)
  const [currentBusiness, setCurrentBusiness] = useState<MerchantBusinessInfo>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.currentBusiness) return parsed.currentBusiness;
      }
    } catch {}
    return DEFAULT_BUSINESS_THE_DAILY_BREW;
  });

  const [activeDashboard, setActiveDashboard] = useState<MerchantDashboardId>('overview');
  const [viewMode, setViewMode] = useState<MerchantDeviceViewMode>('desktop');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalType, setModalType] = useState<string | null>(null);

  // Data Collections
  const [products, setProducts] = useState<MerchantProductItem[]>(INITIAL_MERCHANT_PRODUCTS);
  const [services, setServices] = useState<MerchantServiceItem[]>(INITIAL_MERCHANT_SERVICES);
  const [offers, setOffers] = useState<MerchantOfferItem[]>(INITIAL_MERCHANT_OFFERS);
  const [posts, setPosts] = useState<MerchantPostItem[]>(INITIAL_MERCHANT_POSTS);
  const [events, setEvents] = useState<MerchantEventItem[]>(INITIAL_MERCHANT_EVENTS);
  const [reviews, setReviews] = useState<MerchantReviewItem[]>(INITIAL_MERCHANT_REVIEWS);
  const [conversations, setConversations] = useState<MerchantConversation[]>(INITIAL_MERCHANT_CONVERSATIONS);
  const [activeConversationId, setActiveConversationId] = useState<string>(INITIAL_MERCHANT_CONVERSATIONS[0].id);
  const [leads, setLeads] = useState<MerchantLeadItem[]>(INITIAL_MERCHANT_LEADS);
  const [promotions, setPromotions] = useState<MerchantPromotionItem[]>(INITIAL_MERCHANT_PROMOTIONS);
  const [invoices] = useState<MerchantInvoiceItem[]>(INITIAL_MERCHANT_INVOICES);

  // Notifications Popover & Profile Menu
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [businessDropdownOpen, setBusinessDropdownOpen] = useState(false);

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
  const handleSwitchBusiness = (id: string) => {
    if (id === 'biz-sharma-fuel') {
      setCurrentBusiness(DEFAULT_BUSINESS_SHARMA_FUEL);
    } else {
      setCurrentBusiness(DEFAULT_BUSINESS_THE_DAILY_BREW);
    }
    setBusinessDropdownOpen(false);
  };

  const handleUpdateBusiness = (updated: Partial<MerchantBusinessInfo>) => {
    setCurrentBusiness((prev) => ({ ...prev, ...updated }));
  };

  const handleToggleProductStatus = (id: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: p.status === 'Active' ? 'Paused' : 'Active' } : p
      )
    );
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

  const renderActiveDashboardContent = () => {
    switch (activeDashboard) {
      case 'overview':
        return (
          <MerchantHomeDashboard
            business={currentBusiness}
            onNavigate={setActiveDashboard}
            onOpenQuickAction={setModalType}
            products={products}
            offers={offers}
            posts={posts}
            reviews={reviews}
            conversations={conversations}
            leads={leads}
          />
        );
      case 'profile':
        return (
          <MerchantProfileDashboard
            business={currentBusiness}
            onUpdateBusiness={handleUpdateBusiness}
            onNavigate={setActiveDashboard}
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
              setActiveDashboard('messages');
            }}
          />
        );
      case 'analytics':
        return <MerchantAnalyticsDashboard business={currentBusiness} />;
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

  return (
    <div className="min-h-screen bg-[#F4F6FB] text-slate-900 flex flex-col font-sans">
      {/* =========================================================================
          TOP BANNER: DEVICE VIEW MODE & SWITCH TO CITIZEN APP
         ========================================================================= */}
      <div className="bg-[#0F0826] text-white px-4 py-2 flex items-center justify-between text-xs border-b border-indigo-950/60 sticky top-0 z-40 select-none">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSwitchToCitizen}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-purple-200 hover:text-white transition font-bold cursor-pointer"
          >
            <span>← Switch to Citizen View</span>
          </button>
          <span className="hidden sm:inline text-white/40">|</span>
          <span className="hidden sm:inline font-bold text-white/90">
            Storefront: <strong className="text-purple-300 font-extrabold">{currentBusiness.name}</strong>
          </span>
        </div>

        {/* View Mode Switcher: Desktop | App | Comparison */}
        <div className="flex items-center gap-1 bg-white/10 p-1 rounded-2xl border border-white/10">
          <button
            type="button"
            onClick={() => setViewMode('desktop')}
            className={`px-3 py-1 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'desktop' ? 'bg-purple-600 text-white shadow-xs' : 'text-purple-200 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Desktop Website</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('app')}
            className={`px-3 py-1 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'app' ? 'bg-purple-600 text-white shadow-xs' : 'text-purple-200 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Phone Application</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('comparison')}
            className={`px-3 py-1 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'comparison' ? 'bg-indigo-600 text-white shadow-xs' : 'text-purple-200 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Visual Guide Comparison</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          IF VIEW MODE === 'app': RENDER THE EXACT PHONE APP MOCKUP
         ========================================================================= */}
      {viewMode === 'app' ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <MerchantMobileAppView
            business={currentBusiness}
            activeDashboard={activeDashboard}
            onNavigate={setActiveDashboard}
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
            promotions={promotions}
            invoices={invoices}
            onToggleProductStatus={handleToggleProductStatus}
            onToggleServiceStatus={handleToggleServiceStatus}
            onToggleOfferStatus={handleToggleOfferStatus}
            onToggleLikePost={handleToggleLikePost}
            onSelectConversation={setActiveConversationId}
            onSendMessage={handleSendMessage}
            onUpdateLeadStatus={handleUpdateLeadStatus}
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
      ) : (
        /* =======================================================================
            DESKTOP WEBSITE LAYOUT (Left Sidebar 235px + Top Header + Main Body)
           ======================================================================= */
        <div className="flex-1 flex min-h-0">
          {/* LEFT SIDEBAR (Exact Navigation from Page 1 of PDF) */}
          <aside className="w-[235px] shrink-0 bg-white border-r border-slate-200/80 flex flex-col justify-between select-none sticky top-10 h-[calc(100vh-40px)]">
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
                      onClick={() => setActiveDashboard(item.id as any)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        active
                          ? 'bg-[#F3E8FF] text-[#7C3AED] font-bold shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? 'text-[#7C3AED]' : 'text-slate-500'}`} />
                      <span>{item.label}</span>
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
                    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: '3' },
                    { id: 'leads', label: 'Leads & Enquiries', icon: Users, badge: '5' },
                  ].map((item) => {
                    const Icon = item.icon;
                    const active = activeDashboard === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveDashboard(item.id as any)}
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
                        onClick={() => setActiveDashboard(item.id as any)}
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
                  onClick={() => setActiveDashboard('settings')}
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
            <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 flex items-center justify-between gap-4 sticky top-10 z-30">
              <div className="flex items-center gap-4 flex-1 max-w-2xl">
                {/* Location / Business Selector */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setBusinessDropdownOpen((v) => !v)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 text-xs font-bold text-slate-800 transition cursor-pointer"
                  >
                    <span>📍 {currentBusiness.locationArea}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {businessDropdownOpen && (
                    <div
                      onClick={() => setBusinessDropdownOpen(false)}
                      className="absolute left-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50"
                    >
                      <p className="px-2 py-1 text-[10px] font-extrabold text-slate-400 uppercase">
                        Select Storefront
                      </p>
                      <button
                        type="button"
                        onClick={() => handleSwitchBusiness('biz-daily-brew')}
                        className="w-full p-2 rounded-xl text-left hover:bg-purple-50 transition text-xs font-bold text-slate-800"
                      >
                        ☕ The Daily Brew (Rohini Sector 9)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSwitchBusiness('biz-sharma-fuel')}
                        className="w-full p-2 rounded-xl text-left hover:bg-purple-50 transition text-xs font-bold text-slate-800"
                      >
                        ⛽ Sharma Fuel Station (Rohini Sector 9)
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
              <div className="flex items-center gap-3 shrink-0">
                <span className="px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800 flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  <span>28°C</span>
                </span>

                <button
                  type="button"
                  onClick={() => setNotificationsOpen((v) => !v)}
                  className="w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 relative cursor-pointer"
                >
                  <Bell className="w-4 h-4" />
                  <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2 ring-2 ring-white" />
                </button>

                {/* User Pill */}
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen((v) => !v)}
                  className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
                >
                  <span className="w-7 h-7 rounded-full bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center">
                    RS
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
              </div>
            </header>

            {/* Notifications Popover */}
            {notificationsOpen && (
              <div
                onClick={() => setNotificationsOpen(false)}
                className="fixed inset-0 z-50 flex items-start justify-end pt-28 px-6 bg-black/20"
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-80 p-3 space-y-2 animate-in zoom-in-95 duration-100"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-extrabold text-slate-900">
                      Storefront Notifications
                    </span>
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                      3 New
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div
                      onClick={() => {
                        setNotificationsOpen(false);
                        setActiveDashboard('messages');
                      }}
                      className="p-2 rounded-xl bg-purple-50/70 hover:bg-purple-100 cursor-pointer"
                    >
                      <p className="font-bold text-purple-900">New Message from Priya Mehta</p>
                      <p className="text-[11px] text-purple-700">"Hi! Do you have any weekend offers...?"</p>
                    </div>
                    <div
                      onClick={() => {
                        setNotificationsOpen(false);
                        setActiveDashboard('leads');
                      }}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer"
                    >
                      <p className="font-bold text-slate-900">New Enquiry for Table Booking</p>
                      <p className="text-[11px] text-slate-500">Amit Kumar requested table for 8</p>
                    </div>
                    <div
                      onClick={() => {
                        setNotificationsOpen(false);
                        setActiveDashboard('reviews');
                      }}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer"
                    >
                      <p className="font-bold text-slate-900">5 ★ Review received</p>
                      <p className="text-[11px] text-slate-500">"Amazing coffee and great staff!"</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                      setActiveDashboard('profile');
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
                      setActiveDashboard('settings');
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
                    className="w-full px-3 py-2 rounded-xl hover:bg-indigo-50 text-left font-bold text-indigo-700 flex items-center justify-between"
                  >
                    <span>Switch to Citizen App</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* DESKTOP MAIN BODY */}
            <main className="flex-1 p-6 pb-12 overflow-y-auto">
              <div className="max-w-[1360px] mx-auto">
                {viewMode === 'comparison' ? (
                  <MerchantVisualGuideComparison activeDashboard={activeDashboard}>
                    {renderActiveDashboardContent()}
                  </MerchantVisualGuideComparison>
                ) : (
                  renderActiveDashboardContent()
                )}
              </div>
            </main>
          </div>
        </div>
      )}

      {/* =========================================================================
          INTERACTIVE ACTION MODALS MANAGER
         ========================================================================= */}
      <MerchantActionModals
        modalType={modalType}
        onClose={() => setModalType(null)}
        onAddProduct={(newProd) => setProducts((prev) => [newProd, ...prev])}
        onAddService={(newSrv) => setServices((prev) => [newSrv, ...prev])}
        onAddOffer={(newOffer) => setOffers((prev) => [newOffer, ...prev])}
        onAddPost={(newPost) => setPosts((prev) => [newPost, ...prev])}
        onAddEvent={(newEvent) => setEvents((prev) => [newEvent, ...prev])}
        onAddPromotion={(newPromo) => setPromotions((prev) => [newPromo, ...prev])}
        businessName={currentBusiness.name}
      />
    </div>
  );
}
