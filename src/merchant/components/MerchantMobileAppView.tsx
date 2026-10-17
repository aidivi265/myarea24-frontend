import React, { useState } from 'react';
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
} from '../types';
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
  Bell,
  ChevronDown,
  X,
  Plus,
  Wifi,
  Battery,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { MerchantHomeDashboard } from '../dashboards/MerchantHomeDashboard';
import { MerchantProfileDashboard } from '../dashboards/MerchantProfileDashboard';
import { MerchantProductsDashboard } from '../dashboards/MerchantProductsDashboard';
import { MerchantOffersDashboard } from '../dashboards/MerchantOffersDashboard';
import { MerchantPostsDashboard } from '../dashboards/MerchantPostsDashboard';
import { MerchantEventsDashboard } from '../dashboards/MerchantEventsDashboard';
import { MerchantReviewsDashboard } from '../dashboards/MerchantReviewsDashboard';
import { MerchantMessagesDashboard } from '../dashboards/MerchantMessagesDashboard';
import { MerchantLeadsDashboard } from '../dashboards/MerchantLeadsDashboard';
import { MerchantAnalyticsDashboard } from '../dashboards/MerchantAnalyticsDashboard';
import { MerchantPromotionsDashboard } from '../dashboards/MerchantPromotionsDashboard';
import { MerchantPaymentsDashboard } from '../dashboards/MerchantPaymentsDashboard';
import { MerchantSettingsDashboard } from '../dashboards/MerchantSettingsDashboard';

interface MerchantMobileAppViewProps {
  business: MerchantBusinessInfo;
  activeDashboard: MerchantDashboardId;
  onNavigate: (tab: MerchantDashboardId) => void;
  onSwitchBusiness: (id: string) => void;
  onOpenQuickAction: (actionType: string) => void;
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
  onToggleProductStatus: (id: string) => void;
  onToggleServiceStatus: (id: string) => void;
  onToggleOfferStatus: (id: string) => void;
  onToggleLikePost: (id: string) => void;
  onSelectConversation: (id: string) => void;
  onSendMessage: (conversationId: string, text: string) => void;
  onUpdateLeadStatus: (leadId: string, newStatus: MerchantLeadItem['status']) => void;
  onAddReplyToReview: (reviewId: string, text: string) => void;
  onUpdateBusiness: (updated: Partial<MerchantBusinessInfo>) => void;
  onOpenAddProductModal: () => void;
  onOpenAddServiceModal: () => void;
  onOpenCreateOfferModal: () => void;
  onOpenCreatePostModal: () => void;
  onOpenCreateEventModal: () => void;
  onOpenRequestReviewModal: () => void;
  onOpenCreatePromoModal: (type?: string) => void;
  onSwitchToCitizen: () => void;
}

export function MerchantMobileAppView(props: MerchantMobileAppViewProps) {
  const [moreDrawerOpen, setMoreDrawerOpen] = useState(false);
  const [businessPickerOpen, setBusinessPickerOpen] = useState(false);

  const renderActiveDashboard = () => {
    switch (props.activeDashboard) {
      case 'overview':
        return (
          <MerchantHomeDashboard
            business={props.business}
            onNavigate={props.onNavigate}
            onOpenQuickAction={props.onOpenQuickAction}
            products={props.products}
            offers={props.offers}
            posts={props.posts}
            reviews={props.reviews}
            conversations={props.conversations}
            leads={props.leads}
          />
        );
      case 'profile':
        return (
          <MerchantProfileDashboard
            business={props.business}
            onUpdateBusiness={props.onUpdateBusiness}
            onNavigate={props.onNavigate}
            onOpenQuickAction={props.onOpenQuickAction}
          />
        );
      case 'products':
        return (
          <MerchantProductsDashboard
            business={props.business}
            products={props.products}
            services={props.services}
            onToggleProductStatus={props.onToggleProductStatus}
            onToggleServiceStatus={props.onToggleServiceStatus}
            onOpenAddProductModal={props.onOpenAddProductModal}
            onOpenAddServiceModal={props.onOpenAddServiceModal}
          />
        );
      case 'offers':
        return (
          <MerchantOffersDashboard
            business={props.business}
            offers={props.offers}
            onToggleOfferStatus={props.onToggleOfferStatus}
            onOpenCreateOfferModal={props.onOpenCreateOfferModal}
          />
        );
      case 'posts':
        return (
          <MerchantPostsDashboard
            business={props.business}
            posts={props.posts}
            onOpenCreatePostModal={props.onOpenCreatePostModal}
            onToggleLikePost={props.onToggleLikePost}
          />
        );
      case 'events':
        return (
          <MerchantEventsDashboard
            business={props.business}
            events={props.events}
            onOpenCreateEventModal={props.onOpenCreateEventModal}
          />
        );
      case 'reviews':
        return (
          <MerchantReviewsDashboard
            business={props.business}
            reviews={props.reviews}
            onAddReplyToReview={props.onAddReplyToReview}
            onOpenRequestReviewModal={props.onOpenRequestReviewModal}
          />
        );
      case 'messages':
        return (
          <MerchantMessagesDashboard
            business={props.business}
            conversations={props.conversations}
            activeConversationId={props.activeConversationId}
            onSelectConversation={props.onSelectConversation}
            onSendMessage={props.onSendMessage}
          />
        );
      case 'leads':
        return (
          <MerchantLeadsDashboard
            business={props.business}
            leads={props.leads}
            onUpdateLeadStatus={props.onUpdateLeadStatus}
            onOpenMessageWithLead={(lead) => {
              props.onNavigate('messages');
            }}
          />
        );
      case 'analytics':
        return <MerchantAnalyticsDashboard business={props.business} />;
      case 'promotions':
        return (
          <MerchantPromotionsDashboard
            business={props.business}
            promotions={props.promotions}
            onOpenCreatePromoModal={props.onOpenCreatePromoModal}
          />
        );
      case 'payments':
        return (
          <MerchantPaymentsDashboard
            business={props.business}
            invoices={props.invoices}
          />
        );
      case 'settings':
        return (
          <MerchantSettingsDashboard
            business={props.business}
            onUpdateBusiness={props.onUpdateBusiness}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-[440px] mx-auto bg-slate-900 rounded-[44px] p-3 shadow-2xl border-4 border-slate-800 my-4 text-slate-900 relative">
      {/* Outer Phone Bezel / Screen */}
      <div className="bg-[#F4F6FB] rounded-[36px] overflow-hidden flex flex-col min-h-[820px] max-h-[880px] shadow-inner relative">
        {/* =====================================================================
            SMARTPHONE NOTCH & STATUS BAR (9:41, Cellular, Wifi, Battery)
           ===================================================================== */}
        <div className="bg-[#1C1045] text-white px-6 pt-3 pb-2 flex items-center justify-between text-xs font-bold shrink-0 select-none">
          <span>9:41</span>
          {/* Dynamic Island / Notch */}
          <div className="w-24 h-4.5 bg-black rounded-full" />
          <div className="flex items-center gap-1.5 text-white/90">
            <span className="text-[10px] tracking-tighter">5G</span>
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4" />
          </div>
        </div>

        {/* =====================================================================
            APP TOP HEADER (Exact Brand Logo + Business Selector + Notifications)
           ===================================================================== */}
        <div className="bg-[#1C1045] text-white px-4 pb-3 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-base font-extrabold tracking-tight">
              MyArea<span className="text-[#8B5CF6]">24</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-purple-600/80 text-white text-[9px] font-extrabold uppercase">
              Merchant Portal
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Business Dropdown Trigger */}
            <button
              type="button"
              onClick={() => setBusinessPickerOpen((v) => !v)}
              className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-[10px] font-bold text-white flex items-center gap-1 cursor-pointer truncate max-w-[150px]"
            >
              <span>{props.business.name.split(' ')[0]}</span>
              <ChevronDown className="w-3 h-3 text-purple-200 shrink-0" />
            </button>

            {/* Notification Bell */}
            <button
              type="button"
              onClick={() => props.onNavigate('messages')}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white relative"
            >
              <Bell className="w-3.5 h-3.5" />
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1 right-1" />
            </button>

            {/* Rohit Sharma Avatar */}
            <button
              type="button"
              onClick={() => props.onNavigate('settings')}
              className="w-7 h-7 rounded-full bg-purple-500 text-white font-extrabold text-xs flex items-center justify-center border border-white/30"
            >
              RS
            </button>
          </div>
        </div>

        {/* Business Selector Dropdown Popover */}
        {businessPickerOpen && (
          <div
            onClick={() => setBusinessPickerOpen(false)}
            className="absolute inset-0 bg-black/40 z-50 flex items-start justify-center pt-24 px-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 w-full max-w-xs space-y-1 animate-in zoom-in-95 duration-100"
            >
              <p className="px-3 py-1 text-[10px] font-extrabold uppercase text-slate-400">
                Switch Merchant Storefront
              </p>
              <button
                type="button"
                onClick={() => {
                  props.onSwitchBusiness('biz-daily-brew');
                  setBusinessPickerOpen(false);
                }}
                className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition flex items-center justify-between ${
                  props.business.id === 'biz-daily-brew'
                    ? 'bg-purple-50 text-purple-700'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div>
                  <p>☕ The Daily Brew</p>
                  <p className="text-[10px] text-slate-400 font-normal">Café & Restaurant • Rohini</p>
                </div>
                {props.business.id === 'biz-daily-brew' && (
                  <span className="text-[10px] font-extrabold text-purple-600">✓ Active</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  props.onSwitchBusiness('biz-sharma-fuel');
                  setBusinessPickerOpen(false);
                }}
                className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition flex items-center justify-between ${
                  props.business.id === 'biz-sharma-fuel'
                    ? 'bg-purple-50 text-purple-700'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div>
                  <p>⛽ Sharma Fuel Station</p>
                  <p className="text-[10px] text-slate-400 font-normal">Fuel & Convenience • Rohini</p>
                </div>
                {props.business.id === 'biz-sharma-fuel' && (
                  <span className="text-[10px] font-extrabold text-purple-600">✓ Active</span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* =====================================================================
            APP SCROLLABLE MAIN CONTENT BODY
           ===================================================================== */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {renderActiveDashboard()}
        </div>

        {/* =====================================================================
            FIXED 5-BUTTON MERCHANT APP FOOTER (Dashboard, Profile, Products, Offers, More)
           ===================================================================== */}
        <div className="bg-white border-t border-slate-200/90 px-3 py-2 flex items-center justify-around shrink-0 select-none shadow-lg z-20">
          <button
            type="button"
            onClick={() => props.onNavigate('overview')}
            className={`flex flex-col items-center gap-0.5 cursor-pointer ${
              props.activeDashboard === 'overview'
                ? 'text-purple-600 font-bold'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px]">Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => props.onNavigate('profile')}
            className={`flex flex-col items-center gap-0.5 cursor-pointer ${
              props.activeDashboard === 'profile'
                ? 'text-purple-600 font-bold'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <Store className="w-5 h-5" />
            <span className="text-[10px]">Profile</span>
          </button>

          <button
            type="button"
            onClick={() => props.onNavigate('products')}
            className={`flex flex-col items-center gap-0.5 cursor-pointer ${
              props.activeDashboard === 'products'
                ? 'text-purple-600 font-bold'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <Package className="w-5 h-5" />
            <span className="text-[10px]">Products</span>
          </button>

          <button
            type="button"
            onClick={() => props.onNavigate('offers')}
            className={`flex flex-col items-center gap-0.5 cursor-pointer ${
              props.activeDashboard === 'offers'
                ? 'text-purple-600 font-bold'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <Tag className="w-5 h-5" />
            <span className="text-[10px]">Offers</span>
          </button>

          <button
            type="button"
            onClick={() => setMoreDrawerOpen(true)}
            className={`flex flex-col items-center gap-0.5 cursor-pointer ${
              [
                'posts',
                'events',
                'reviews',
                'messages',
                'leads',
                'analytics',
                'promotions',
                'payments',
                'settings',
              ].includes(props.activeDashboard)
                ? 'text-purple-600 font-bold'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <div className="flex gap-0.5 items-center justify-center h-5">
              <span className="w-1 h-1 rounded-full bg-current" />
              <span className="w-1 h-1 rounded-full bg-current" />
              <span className="w-1 h-1 rounded-full bg-current" />
            </div>
            <span className="text-[10px]">More</span>
          </button>
        </div>

        {/* Home Indicator Bar */}
        <div className="bg-white pb-2 flex justify-center shrink-0">
          <div className="w-32 h-1 bg-slate-300 rounded-full" />
        </div>

        {/* =====================================================================
            "MORE" BOTTOM SHEET DRAWER
           ===================================================================== */}
        {moreDrawerOpen && (
          <div
            onClick={() => setMoreDrawerOpen(false)}
            className="absolute inset-0 bg-black/60 z-50 flex items-end justify-center backdrop-blur-2xs"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-3xl w-full p-4 space-y-3 max-h-[85%] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-200"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="text-sm font-extrabold text-slate-900">Merchant Hub Navigation</h4>
                <button
                  type="button"
                  onClick={() => setMoreDrawerOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                {[
                  { id: 'posts', label: 'Posts & Updates', icon: FileText, color: 'text-purple-600' },
                  { id: 'events', label: 'Events', icon: Calendar, color: 'text-indigo-600' },
                  { id: 'reviews', label: 'Reviews', icon: Star, color: 'text-amber-500' },
                  { id: 'messages', label: 'Messages', icon: MessageSquare, color: 'text-blue-600', badge: '3' },
                  { id: 'leads', label: 'Leads', icon: Users, color: 'text-emerald-600', badge: '5' },
                  { id: 'analytics', label: 'Analytics', icon: TrendingUp, color: 'text-purple-600' },
                  { id: 'promotions', label: 'Promotions', icon: Megaphone, color: 'text-pink-600' },
                  { id: 'payments', label: 'Payments', icon: CreditCard, color: 'text-slate-700' },
                  { id: 'settings', label: 'Settings', icon: Settings, color: 'text-slate-700' },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = props.activeDashboard === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        props.onNavigate(item.id as any);
                        setMoreDrawerOpen(false);
                      }}
                      className={`p-3 rounded-2xl flex flex-col items-center gap-1.5 transition cursor-pointer relative ${
                        active
                          ? 'bg-purple-50 text-purple-700 font-bold border border-purple-200'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${item.color}`} />
                      <span className="text-[11px] leading-tight">{item.label}</span>
                      {item.badge && (
                        <span className="absolute top-1.5 right-1.5 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-extrabold">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setMoreDrawerOpen(false);
                    props.onSwitchToCitizen();
                  }}
                  className="w-full py-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  <span>Switch to Citizen App</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
