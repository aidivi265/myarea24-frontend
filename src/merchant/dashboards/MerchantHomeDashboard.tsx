import React from 'react';
import {
  MerchantBusinessInfo,
  MerchantProductItem,
  MerchantServiceItem,
  MerchantOfferItem,
  MerchantPostItem,
  MerchantReviewItem,
  MerchantConversation,
  MerchantLeadItem,
  MerchantOrderItem,
  MerchantDashboardId,
} from '../types';
import {
  Eye,
  Users,
  Navigation,
  PhoneCall,
  Calendar,
  Tag,
  Package,
  Plus,
  TrendingUp,
  MessageSquare,
  Star,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Activity,
  Fuel,
  ShoppingBag,
} from 'lucide-react';

interface MerchantHomeDashboardProps {
  business: MerchantBusinessInfo;
  onNavigate: (tab: MerchantDashboardId) => void;
  onOpenQuickAction: (actionType: string) => void;
  products: MerchantProductItem[];
  services?: MerchantServiceItem[];
  offers: MerchantOfferItem[];
  posts: MerchantPostItem[];
  reviews: MerchantReviewItem[];
  conversations: MerchantConversation[];
  leads: MerchantLeadItem[];
  orders?: MerchantOrderItem[];
}

export function MerchantHomeDashboard({
  business,
  onNavigate,
  onOpenQuickAction,
  products = [],
  services = [],
  offers = [],
  posts = [],
  reviews = [],
  conversations = [],
  leads = [],
  orders = [],
}: MerchantHomeDashboardProps) {
  // Dynamic store metrics
  const activeProductsCount = products.filter((p) => p.status === 'Active').length;
  const activeServicesCount = services.filter((s) => s.status === 'Active').length;
  const activeOffersCount = offers.filter((o) => o.status === 'Active' || (o as any).active).length;
  const totalOrdersCount = orders.length;
  const totalViews = (business as any).viewCount || (business as any).views || products.reduce((acc, p) => acc + (p.views || 0), 0);
  const totalInteractions = totalOrdersCount + leads.length + conversations.length + reviews.length;
  const directionClicks = (business as any).directionClicks || 0;
  const phoneCalls = (business as any).callClicks || leads.filter((l) => Boolean(l.phone)).length;
  const totalCallsAndLeads = leads.length + ((business as any).callClicks || 0);

  // Dynamic Profile Completion
  let completion = 20;
  if (business.name && business.name !== 'My Storefront') completion += 15;
  if (business.phone) completion += 15;
  if (business.fullAddress && business.fullAddress !== 'Local Commercial Address') completion += 15;
  if (products.length > 0 || services.length > 0) completion += 15;
  if (activeOffersCount > 0 || offers.length > 0) completion += 10;
  if (business.logo) completion += 10;
  const profileCompletionPercent = Math.min(100, completion);

  // Dynamic Recent Activities
  const recentActivities: { id: string; title: string; subtitle: string; timeAgo: string; color: string }[] = [];
  if (orders.length > 0) {
    const o = orders[0];
    recentActivities.push({
      id: `act-ord-${o.id}`,
      title: `Order #${o.orderNumber}`,
      subtitle: `₹${o.finalPayable} • ${o.customerName}`,
      timeAgo: 'Just now',
      color: 'bg-emerald-500',
    });
  }
  if (products.length > 0) {
    const p = products[0];
    recentActivities.push({
      id: `act-prod-${p.id}`,
      title: `Product Listed: ${p.name}`,
      subtitle: `Active at ₹${p.price}`,
      timeAgo: 'Recently',
      color: 'bg-blue-600',
    });
  }
  if (services.length > 0) {
    const s = services[0];
    recentActivities.push({
      id: `act-serv-${s.id}`,
      title: `Service Listed: ${s.name}`,
      subtitle: `Starting at ₹${s.startingPrice} • ${s.category}`,
      timeAgo: 'Recently',
      color: 'bg-indigo-600',
    });
  }
  if (offers.length > 0) {
    const off = offers[0];
    recentActivities.push({
      id: `act-off-${off.id}`,
      title: `Offer Published: ${off.title}`,
      subtitle: `${off.discountText} (${off.type})`,
      timeAgo: 'Recently',
      color: 'bg-pink-500',
    });
  }
  if (reviews.length > 0) {
    const r = reviews[0];
    recentActivities.push({
      id: `act-rev-${r.id}`,
      title: `New ${r.rating}★ Review`,
      subtitle: `From ${r.customerName}`,
      timeAgo: r.timeAgo || 'Recently',
      color: 'bg-amber-500',
    });
  }
  if (leads.length > 0) {
    const l = leads[0];
    recentActivities.push({
      id: `act-lead-${l.id}`,
      title: `Inquiry: ${l.interestedCategory}`,
      subtitle: `From ${l.customerName}`,
      timeAgo: 'Recently',
      color: 'bg-purple-500',
    });
  }
  if (recentActivities.length === 0) {
    recentActivities.push({
      id: 'act-live',
      title: 'Storefront Live & Verified',
      subtitle: `Serving ${business.locationArea}`,
      timeAgo: 'Active',
      color: 'bg-emerald-500',
    });
  }

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
      : business.rating
      ? business.rating.toFixed(1)
      : '5.0';

  return (
    <div className="space-y-6">
      {/* Live Order Incoming Urgent Alert Banner */}
      {orders && orders.some((o) => o.status === 'placed') && (
        <div
          onClick={() => onNavigate('orders')}
          className="p-4 rounded-3xl bg-gradient-to-r from-rose-600 via-rose-500 to-pink-600 text-white shadow-xl flex items-center justify-between cursor-pointer hover:shadow-2xl transition animate-in slide-in-from-top-2"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5 text-white animate-bounce" />
            </div>
            <div>
              <h4 className="text-sm font-black flex items-center gap-2">
                <span>{orders.filter((o) => o.status === 'placed').length} New Customer Order(s) Received!</span>
                <span className="px-2 py-0.5 rounded-full bg-white text-rose-600 text-[10px] font-black uppercase">
                  Action Required
                </span>
              </h4>
              <p className="text-xs text-white/90 mt-0.5">
                Neighborhood orders are waiting for store confirmation. Click to manage orders.
              </p>
            </div>
          </div>
          <span className="text-xs font-extrabold bg-white text-rose-700 px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 shadow-sm">
            View Live Orders <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      )}

      {/* =========================================================================
          HERO BANNER
         ========================================================================= */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#1E124A] via-[#2D1B69] to-[#4527A0] p-6 sm:p-8 text-white overflow-hidden shadow-xl border border-indigo-900/30">
        <div className="absolute right-0 top-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-purple-200 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Merchant Portal • Live Active Shop
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
              Welcome back, {business.ownerName ? business.ownerName.split(' ')[0] : 'Partner'}!
            </h1>
            <p className="text-sm text-purple-200/90 leading-relaxed">
              Manage your inventory, connect with neighborhood residents, and drive zero-commission local sales.
            </p>
          </div>

          {/* Right Floating Business Mini Card */}
          <div className="w-full lg:w-auto shrink-0 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 overflow-hidden shrink-0 border border-white/30 flex items-center justify-center">
                {business.coverImage ? (
                  <img
                    src={business.coverImage}
                    alt={business.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <Package className="w-6 h-6 text-purple-200" />
                )}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  {business.name}
                </h4>
                <p className="text-xs text-purple-200 flex items-center gap-1">
                  📍 {business.locationArea}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('profile')}
              className="px-3 py-1.5 rounded-xl bg-white text-indigo-900 text-xs font-bold hover:bg-purple-50 transition flex items-center gap-1 cursor-pointer shrink-0 shadow-sm"
            >
              <span>View Store Profile</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          QUICK ACTIONS STRIP
         ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          type="button"
          onClick={() => onOpenQuickAction('create_post')}
          className="flex items-center gap-2.5 p-3 rounded-2xl bg-white hover:bg-purple-50 border border-slate-200/80 hover:border-purple-200 transition text-left cursor-pointer shadow-xs group"
        >
          <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800 group-hover:text-purple-700">
            Create Post
          </span>
        </button>

        <button
          type="button"
          onClick={() => onOpenQuickAction('add_offer')}
          className="flex items-center gap-2.5 p-3 rounded-2xl bg-white hover:bg-rose-50 border border-slate-200/80 hover:border-rose-200 transition text-left cursor-pointer shadow-xs group"
        >
          <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
            <Tag className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-800 group-hover:text-rose-700">
            Add Offer
          </span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('products')}
          className="flex items-center gap-2.5 p-3 rounded-2xl bg-white hover:bg-amber-50 border border-slate-200/80 hover:border-amber-200 transition text-left cursor-pointer shadow-xs group"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
            <Package className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-800 group-hover:text-amber-700">
            Add Product
          </span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('orders')}
          className="flex items-center gap-2.5 p-3 rounded-2xl bg-white hover:bg-blue-50 border border-slate-200/80 hover:border-blue-200 transition text-left cursor-pointer shadow-xs group"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700">
            Live Orders
          </span>
        </button>

        <button
          type="button"
          onClick={() => onOpenQuickAction('create_event')}
          className="flex items-center gap-2.5 p-3 rounded-2xl bg-white hover:bg-indigo-50 border border-slate-200/80 hover:border-indigo-200 transition text-left cursor-pointer shadow-xs group"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
            <Calendar className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-700">
            Create Event
          </span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('analytics')}
          className="flex items-center gap-2.5 p-3 rounded-2xl bg-white hover:bg-emerald-50 border border-slate-200/80 hover:border-emerald-200 transition text-left cursor-pointer shadow-xs group"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
            View Insights
          </span>
        </button>
      </div>

      {/* =========================================================================
          OVERVIEW STATS ROW (Dynamic Telemetry)
         ========================================================================= */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-extrabold text-slate-900">
              Overview <span className="text-xs font-normal text-slate-500">(Live Store Telemetry)</span>
            </h3>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-600 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active & Synced</span>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-200 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">Profile Views</span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Eye className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">{totalViews.toLocaleString('en-IN')}</span>
              {totalViews > 0 && <span className="text-xs font-bold text-emerald-600 flex items-center">▲ Live</span>}
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-200 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">Customer Interactions</span>
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">{totalInteractions}</span>
              {totalInteractions > 0 && <span className="text-xs font-bold text-emerald-600 flex items-center">▲ Live</span>}
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-200 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">Direction Clicks</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Navigation className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">{directionClicks}</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-200 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">Calls & Leads</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <PhoneCall className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">{totalCallsAndLeads}</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MIDDLE ROW: Trends Chart + Customer Sources Donut + Profile Completion
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Profile Views Trend Line Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                Storefront Traffic Trend
              </h4>
              <span className="text-xs text-slate-500 font-semibold">Active Session</span>
            </div>

            {/* SVG Line Chart */}
            <div className="h-44 w-full relative pt-2">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 400 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="20" x2="400" y2="20" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="60" x2="400" y2="60" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="100" x2="400" y2="100" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />

                {totalViews > 0 ? (
                  <>
                    <path
                      d="M 0 100 Q 40 85, 80 92 T 160 70 T 240 55 T 320 40 T 400 50 L 400 120 L 0 120 Z"
                      fill="url(#purpleGrad)"
                    />
                    <path
                      d="M 0 100 Q 40 85, 80 92 T 160 70 T 240 55 T 320 40 T 400 50"
                      fill="none"
                      stroke="#7C3AED"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </>
                ) : (
                  <path
                    d="M 0 110 L 400 110"
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                )}
              </svg>
              {totalViews === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <p className="text-xs font-bold text-slate-500">Live Traffic Calibrating</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Views will plot as local shoppers browse your store</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            <span>Today</span>
            <span>Last 7 Days</span>
            <span>Last 30 Days</span>
          </div>
        </div>

        {/* Customer Sources Donut & Legend (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 mb-4 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-600" />
              Customer Sources
            </h4>

            <div className="flex items-center justify-between gap-4">
              <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {totalViews > 0 && (
                    <>
                      <path
                        stroke="#4F46E5"
                        strokeWidth="4.5"
                        strokeDasharray="45, 100"
                        strokeLinecap="round"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        stroke="#06B6D4"
                        strokeWidth="4.5"
                        strokeDasharray="30, 100"
                        strokeDashoffset="-45"
                        strokeLinecap="round"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        stroke="#EC4899"
                        strokeWidth="4.5"
                        strokeDasharray="25, 100"
                        strokeDashoffset="-75"
                        strokeLinecap="round"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </>
                  )}
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-xs font-extrabold text-slate-900">{totalViews}</span>
                  <span className="text-[9px] text-slate-400">Total Views</span>
                </div>
              </div>

              <div className="flex-1 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-indigo-600" /> Search
                  </span>
                  <span className="font-bold text-slate-900">{totalViews > 0 ? '45%' : '0%'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-cyan-500" /> Map
                  </span>
                  <span className="font-bold text-slate-900">{totalViews > 0 ? '30%' : '0%'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-pink-500" /> Catalog
                  </span>
                  <span className="font-bold text-slate-900">{totalViews > 0 ? '25%' : '0%'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Listing Completion + Quick Stats Card (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Profile Completion Box */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Storefront Readiness
              </span>
            </div>
            <div className="flex items-center gap-3 my-2">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border-4 border-emerald-500 flex items-center justify-center shrink-0">
                <span className="text-xs font-extrabold text-emerald-700">{profileCompletionPercent}%</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900">
                  {profileCompletionPercent >= 80 ? 'Storefront Ready!' : 'Profile In Progress'}
                </p>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Add more items and offers to boost local discovery.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('profile')}
              className="w-full mt-1 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Manage Profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Stats This Month */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <h5 className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider mb-2.5">
              Live Quick Stats
            </h5>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Active Products</span>
                <span className="font-bold text-slate-900">{activeProductsCount}</span>
              </div>
              {services.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Active Services</span>
                  <span className="font-bold text-slate-900">{activeServicesCount}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Active Offers</span>
                <span className="font-bold text-slate-900">{activeOffersCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Customer Inquiries</span>
                <span className="font-bold text-slate-900">{leads.length + conversations.length}</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <span className="text-slate-600">Store Rating</span>
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  ⭐ {avgRating}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          BOTTOM ROW (3 Columns: Recent Reviews | Latest Messages | Recent Activity)
         ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Col 1: Recent Reviews */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                Recent Reviews
              </h4>
              <button
                type="button"
                onClick={() => onNavigate('reviews')}
                className="text-xs font-bold text-purple-600 hover:text-purple-700"
              >
                View All &gt;
              </button>
            </div>

            {reviews.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <Star className="w-7 h-7 text-slate-300 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-slate-700">No customer reviews yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Reviews from local shoppers will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.slice(0, 2).map((rev) => (
                  <div key={rev.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900">{rev.customerName}</span>
                      <span className="text-[10px] text-slate-400">{rev.timeAgo}</span>
                    </div>
                    <div className="flex items-center gap-0.5 mb-1 text-amber-400">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Col 2: Latest Messages */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                Latest Messages
              </h4>
              <button
                type="button"
                onClick={() => onNavigate('messages')}
                className="text-xs font-bold text-purple-600 hover:text-purple-700"
              >
                View All &gt;
              </button>
            </div>

            {conversations.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <MessageSquare className="w-7 h-7 text-slate-300 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-slate-700">No customer messages yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Direct inquiries from local residents will arrive here.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {conversations.slice(0, 3).map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => onNavigate('messages')}
                    className="py-2.5 flex items-center justify-between gap-2 cursor-pointer hover:bg-slate-50 px-1 rounded-lg transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-extrabold text-xs flex items-center justify-center shrink-0">
                        {conv.avatar}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {conv.customerName}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {conv.lastMessage}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400">{conv.lastTime}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 ml-auto" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Col 3: Recent Activity */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-purple-600" />
                Recent Activity
              </h4>
            </div>

            <div className="space-y-3 text-xs">
              {recentActivities.map((act) => (
                <div key={act.id} className="flex items-start gap-2.5">
                  <div className={`w-2 h-2 rounded-full ${act.color} mt-1.5 shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900">{act.title}</p>
                    <p className="text-[11px] text-slate-500">{act.subtitle}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">{act.timeAgo}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
