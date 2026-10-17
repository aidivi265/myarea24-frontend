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
  Megaphone,
  Calendar,
  Star,
  MessageSquare,
  Users,
  TrendingUp,
  CreditCard,
  Settings,
  Search,
  Filter,
  Plus,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  CheckCheck,
  Clock,
  ShieldCheck,
  ExternalLink,
  Phone,
  Video,
  MoreVertical,
  X,
  CheckCircle2,
  Bell,
  Share2,
  Heart,
  Download,
  Globe,
  MapPin,
  Edit3,
  ArrowRight,
  Camera,
  Sparkles,
  Send,
  Smile,
  Paperclip,
  Check,
  Activity,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';

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

  // Filter states
  const [productTab, setProductTab] = useState<'all' | 'products' | 'services'>('all');
  const [offerTab, setOfferTab] = useState<'all' | 'active' | 'scheduled' | 'paused' | 'expired'>('all');
  const [postTab, setPostTab] = useState<'all' | 'published' | 'scheduled' | 'drafts'>('all');
  const [reviewTab, setReviewTab] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all');
  const [messageTab, setMessageTab] = useState<'all' | 'unread' | 'enquiries' | 'customers'>('all');
  const [leadTab, setLeadTab] = useState<'all' | 'new' | 'inprogress' | 'converted'>('all');
  const [promoTab, setPromoTab] = useState<'all' | 'active' | 'scheduled' | 'completed'>('all');

  // Interactive Message Composer State
  const [chatInput, setChatInput] = useState('');
  const [activeReplyReviewId, setActiveReplyReviewId] = useState<string | null>(null);
  const [replyInput, setReplyInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const currentConv =
    props.conversations.find((c) => c.id === props.activeConversationId) || props.conversations[0];

  // Helper for tab switching
  const handleTabClick = (tab: MerchantDashboardId) => {
    props.onNavigate(tab);
    setMoreDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* =========================================================================
      1. SCREEN: OVERVIEW / DASHBOARD (Page 3 of PDF Guide)
     ========================================================================= */
  const renderMobileOverview = () => (
    <div className="space-y-4">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#1E124A] via-[#2D1B69] to-[#4527A0] p-4 text-white overflow-hidden shadow-lg border border-indigo-900/40">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-extrabold text-white leading-tight">
              Welcome back, <span className="text-[#C084FC]">{props.business.ownerName.split(' ')[0]}!</span>
            </h2>
            <p className="text-[11px] text-purple-200/90 mt-1 leading-snug">
              Manage your business, connect with local customers and grow with MyArea24.
            </p>
          </div>
          <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-white/20 shadow-md">
            <img src={props.business.coverImage} alt={props.business.name} className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      {/* Verification Status Card */}
      <div
        onClick={() => props.onNavigate('profile')}
        className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3 cursor-pointer"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">Verification Status</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-extrabold border border-amber-200">
                {props.business.verificationStatus}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Submitted on {props.business.submissionDate} • Tap to view details</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
      </div>

      {/* 6 Quick Stats Grid (3 columns matching Page 3) */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1.5">
            <Eye className="w-4 h-4" />
          </div>
          <p className="text-base font-extrabold text-slate-900 leading-none">1,248</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Profile Views</p>
          <span className="text-[9px] font-bold text-emerald-600">▲ 18%</span>
        </div>

        <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-1.5">
            <Users className="w-4 h-4" />
          </div>
          <p className="text-base font-extrabold text-slate-900 leading-none">356</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Interactions</p>
          <span className="text-[9px] font-bold text-emerald-600">▲ 12%</span>
        </div>

        <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1.5">
            <Phone className="w-4 h-4" />
          </div>
          <p className="text-base font-extrabold text-slate-900 leading-none">112</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Calls Received</p>
          <span className="text-[9px] font-bold text-emerald-600">▲ 8%</span>
        </div>

        <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-1.5">
            <MapPin className="w-4 h-4" />
          </div>
          <p className="text-base font-extrabold text-slate-900 leading-none">92</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Directions</p>
          <span className="text-[9px] font-bold text-emerald-600">▲ 24%</span>
        </div>

        <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="w-7 h-7 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-1.5">
            <MessageSquare className="w-4 h-4" />
          </div>
          <p className="text-base font-extrabold text-slate-900 leading-none">68</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Enquiries</p>
          <span className="text-[9px] font-bold text-emerald-600">▲ 16%</span>
        </div>

        <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center mb-1.5">
            <Star className="w-4 h-4 fill-amber-400" />
          </div>
          <p className="text-base font-extrabold text-slate-900 leading-none">{props.business.rating}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Average Rating</p>
          <span className="text-[9px] font-bold text-emerald-600">▲ 0.3</span>
        </div>
      </div>

      {/* Business Performance Line Chart */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <h3 className="text-xs font-extrabold text-slate-900">Business Performance</h3>
          </div>
          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">Last 30 Days ⌄</span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {['Profile Views', 'Interactions', 'Calls', 'Directions'].map((pill, idx) => (
            <span
              key={pill}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-bold whitespace-nowrap ${
                idx === 0 ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {pill}
            </span>
          ))}
        </div>

        {/* SVG Performance Curve */}
        <div className="pt-2">
          <svg viewBox="0 0 320 90" className="w-full h-20 overflow-visible">
            <defs>
              <linearGradient id="grad-perf" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d="M 10 70 Q 50 60 90 45 T 170 30 T 250 40 T 310 20"
              fill="none"
              stroke="#7C3AED"
              strokeWidth="2.5"
            />
            <path
              d="M 10 70 Q 50 60 90 45 T 170 30 T 250 40 T 310 20 L 310 85 L 10 85 Z"
              fill="url(#grad-perf)"
            />
            {[
              { cx: 10, cy: 70 },
              { cx: 90, cy: 45 },
              { cx: 170, cy: 30 },
              { cx: 250, cy: 40 },
              { cx: 310, cy: 20 },
            ].map((p, i) => (
              <circle key={i} cx={p.cx} cy={p.cy} r="3.5" fill="#7C3AED" stroke="#FFFFFF" strokeWidth="2" />
            ))}
          </svg>
          <div className="flex justify-between text-[9px] text-slate-400 font-semibold px-1 mt-1">
            <span>Apr 15</span>
            <span>Apr 25</span>
            <span>May 05</span>
            <span>May 15</span>
          </div>
        </div>
      </div>

      {/* Quick Actions (4 Action Buttons in a row matching Page 3) */}
      <div className="p-3.5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Quick Actions
          </span>
          <span className="text-[10px] font-bold text-purple-600 cursor-pointer">View All ›</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <button
            type="button"
            onClick={props.onOpenAddProductModal}
            className="p-2.5 rounded-2xl bg-indigo-50/70 hover:bg-indigo-100/70 border border-indigo-100 flex flex-col items-center text-center gap-1 cursor-pointer transition active:scale-95"
          >
            <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <Package className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-bold text-indigo-900 leading-tight">Add Product</span>
          </button>

          <button
            type="button"
            onClick={props.onOpenCreateOfferModal}
            className="p-2.5 rounded-2xl bg-pink-50/70 hover:bg-pink-100/70 border border-pink-100 flex flex-col items-center text-center gap-1 cursor-pointer transition active:scale-95"
          >
            <div className="w-7 h-7 rounded-xl bg-pink-600 text-white flex items-center justify-center">
              <Tag className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-bold text-pink-900 leading-tight">Add Offer</span>
          </button>

          <button
            type="button"
            onClick={props.onOpenCreatePostModal}
            className="p-2.5 rounded-2xl bg-purple-50/70 hover:bg-purple-100/70 border border-purple-100 flex flex-col items-center text-center gap-1 cursor-pointer transition active:scale-95"
          >
            <div className="w-7 h-7 rounded-xl bg-purple-600 text-white flex items-center justify-center">
              <Megaphone className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-bold text-purple-900 leading-tight">Create Post</span>
          </button>

          <button
            type="button"
            onClick={props.onOpenCreateEventModal}
            className="p-2.5 rounded-2xl bg-amber-50/70 hover:bg-amber-100/70 border border-amber-100 flex flex-col items-center text-center gap-1 cursor-pointer transition active:scale-95"
          >
            <div className="w-7 h-7 rounded-xl bg-amber-600 text-white flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-bold text-amber-900 leading-tight">Host Event</span>
          </button>
        </div>
      </div>

      {/* Two Row Mini Widgets: Recent Enquiries & Latest Reviews */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Recent Enquiries */}
        <div
          onClick={() => props.onNavigate('messages')}
          className="p-3.5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-2 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-purple-600" /> Recent Enquiries
            </span>
            <span className="text-[10px] font-bold text-purple-600">View All ›</span>
          </div>

          <div className="flex items-start gap-2.5 p-2 rounded-2xl bg-slate-50">
            <span className="w-8 h-8 rounded-full bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
              PM
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Priya Mehta</span>
                <span className="text-[9px] text-slate-400">10m ago</span>
              </div>
              <p className="text-[10px] text-slate-600 truncate mt-0.5">
                Do you have outdoor seating available tomorrow evening?
              </p>
            </div>
          </div>
        </div>

        {/* Latest Reviews */}
        <div
          onClick={() => props.onNavigate('reviews')}
          className="p-3.5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-2 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" /> Latest Reviews
            </span>
            <span className="text-[10px] font-bold text-purple-600">View All ›</span>
          </div>

          <div className="flex items-start gap-2.5 p-2 rounded-2xl bg-slate-50">
            <span className="w-8 h-8 rounded-full bg-amber-500 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
              AV
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Ankit Verma</span>
                <span className="text-[9px] text-amber-500 font-bold">★★★★★</span>
              </div>
              <p className="text-[10px] text-slate-600 truncate mt-0.5">
                Great food, cozy ambiance and very friendly staff!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /* =========================================================================
      2. SCREEN: PROFILE & STOREFRONT (Page 5 of PDF Guide)
     ========================================================================= */
  const renderMobileProfile = () => (
    <div className="space-y-4">
      {/* Cover Photo with Change Cover button */}
      <div className="relative rounded-3xl overflow-hidden h-40 bg-slate-900 shadow-md">
        <img src={props.business.coverImage} alt={props.business.name} className="w-full h-full object-cover opacity-90" />
        <button
          type="button"
          onClick={() => alert('Upload Cover Photo: Select an image from your device')}
          className="absolute bottom-3 right-3 px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1 border border-white/20"
        >
          <Camera className="w-3 h-3" /> Change Cover
        </button>

        {/* Circular Avatar */}
        <div className="absolute -bottom-2 left-4 translate-y-1/2">
          <div className="relative w-18 h-18 rounded-2xl bg-white p-1 shadow-lg border-2 border-white">
            <img src={props.business.logo} alt={props.business.name} className="w-full h-full object-cover rounded-xl" />
            <button
              type="button"
              onClick={() => alert('Change Store Logo: Select image')}
              className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center shadow"
            >
              <Camera className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Store Header Details */}
      <div className="pt-8 px-1">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-1.5">
              {props.business.name}
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
                {props.business.verificationStatus}
              </span>
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {props.business.category} • {props.business.locationArea}
            </p>
            <p className="text-[10px] text-purple-700 font-medium italic mt-0.5">
              "{props.business.tagline}"
            </p>
          </div>
          <button
            type="button"
            onClick={() => alert('Public Storefront Listing view')}
            className="p-2 rounded-2xl bg-purple-50 text-purple-600 hover:bg-purple-100 transition"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Nav Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
        {['Overview', 'Basic Info', 'Location', 'Hours', 'Photos', 'Details'].map((t, idx) => (
          <span
            key={t}
            className={`px-3 py-1 rounded-xl text-[10px] font-bold whitespace-nowrap ${
              idx === 0 ? 'bg-purple-600 text-white shadow-2xs' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            {t}
          </span>
        ))}
      </div>

      {/* Basic Information Card */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5 text-purple-600" /> Basic Information
          </h3>
          <button
            type="button"
            onClick={() => props.onUpdateBusiness({ name: prompt('Edit Store Name:', props.business.name) || props.business.name })}
            className="text-[10px] font-bold text-purple-600"
          >
            Edit
          </button>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-400 text-[11px]">Business Name</span>
            <span className="font-bold text-slate-800">{props.business.name}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-400 text-[11px]">Category</span>
            <span className="font-bold text-slate-800">{props.business.category}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-400 text-[11px]">Phone Number</span>
            <span className="font-bold text-purple-600">{props.business.phone}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-400 text-[11px]">Email Address</span>
            <span className="font-bold text-slate-800">{props.business.email}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400 text-[11px]">Website</span>
            <span className="font-bold text-purple-600">{props.business.website}</span>
          </div>
        </div>
      </div>

      {/* Location & Map Card */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-purple-600" /> Location Details
          </h3>
          <span className="text-[10px] font-bold text-purple-600 cursor-pointer">Edit</span>
        </div>

        <p className="text-xs text-slate-700 font-medium">{props.business.fullAddress}</p>
        <p className="text-[11px] text-slate-400">Landmark: {props.business.landmark}</p>

        {/* Map Preview Pill */}
        <div className="h-24 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-center p-3">
          <div>
            <MapPin className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
            <p className="text-xs font-bold text-indigo-950">Pinned at {props.business.locationArea}</p>
            <span className="text-[10px] text-indigo-600 font-extrabold">Open in Google Maps ›</span>
          </div>
        </div>
      </div>

      {/* Operating Hours Card */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-purple-600" /> Operating Hours
          </h3>
          <span className="text-[10px] font-bold text-purple-600 cursor-pointer">Edit</span>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <div key={d} className="p-1.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="block text-[9px] font-extrabold text-slate-400 uppercase">{d}</span>
              <span className="block text-[9px] font-bold text-slate-800 mt-0.5">9 AM</span>
              <span className="block text-[9px] text-slate-500">11 PM</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /* =========================================================================
      3. SCREEN: PRODUCTS & SERVICES (Page 7 of PDF Guide)
     ========================================================================= */
  const renderMobileProducts = () => (
    <div className="space-y-4">
      {/* Segmented Control (All / Products / Services) */}
      <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs">
        <button
          type="button"
          onClick={() => setProductTab('all')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition ${
            productTab === 'all' ? 'bg-purple-600 text-white shadow-2xs' : 'text-slate-600'
          }`}
        >
          All Listings
        </button>
        <button
          type="button"
          onClick={() => setProductTab('products')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition ${
            productTab === 'products' ? 'bg-purple-600 text-white shadow-2xs' : 'text-slate-600'
          }`}
        >
          Products ({props.products.length})
        </button>
        <button
          type="button"
          onClick={() => setProductTab('services')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition ${
            productTab === 'services' ? 'bg-purple-600 text-white shadow-2xs' : 'text-slate-600'
          }`}
        >
          Services ({props.services.length})
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-white border border-slate-200 rounded-2xl px-3 py-2 flex items-center gap-2 shadow-2xs">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products or services..."
            className="text-xs text-slate-800 bg-transparent focus:outline-none w-full"
          />
        </div>
        <button
          type="button"
          onClick={props.onOpenAddProductModal}
          className="px-3.5 py-2 rounded-2xl bg-purple-600 text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {/* 6 Metric Stat Pills */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2.5 rounded-2xl bg-white border border-slate-200 text-center">
          <span className="text-base font-extrabold text-slate-900">{props.products.length}</span>
          <span className="block text-[9px] text-slate-400 font-semibold">Total Products</span>
        </div>
        <div className="p-2.5 rounded-2xl bg-white border border-slate-200 text-center">
          <span className="text-base font-extrabold text-purple-600">{props.services.length}</span>
          <span className="block text-[9px] text-slate-400 font-semibold">Total Services</span>
        </div>
        <div className="p-2.5 rounded-2xl bg-white border border-slate-200 text-center">
          <span className="text-base font-extrabold text-emerald-600">
            {props.products.filter((p) => p.status === 'Active').length + props.services.filter((s) => s.status === 'Active').length}
          </span>
          <span className="block text-[9px] text-slate-400 font-semibold">Active Listings</span>
        </div>
      </div>

      {/* Products Section (Matching Page 7 Cards) */}
      {(productTab === 'all' || productTab === 'products') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-slate-900">Products Catalog</h3>
            <span className="text-[10px] font-bold text-purple-600">{props.products.length} items</span>
          </div>

          <div className="space-y-2.5">
            {props.products.map((prod) => (
              <div
                key={prod.id}
                className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                    <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{prod.name}</h4>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-slate-100 text-slate-600">
                        {prod.category}
                      </span>
                    </div>
                    <p className="text-xs font-extrabold text-purple-700 mt-0.5">₹{prod.price}</p>
                    <div className="flex items-center gap-2 text-[9px] text-slate-400 mt-1">
                      <span>👁️ {prod.views} views</span>
                      <span>💬 {prod.enquiries} enquiries</span>
                    </div>
                  </div>
                </div>

                {/* Status Toggle Switch */}
                <button
                  type="button"
                  onClick={() => props.onToggleProductStatus(prod.id)}
                  className={`w-11 h-6 rounded-full transition p-0.5 flex items-center cursor-pointer shrink-0 ${
                    prod.status === 'Active' ? 'bg-purple-600 justify-end' : 'bg-slate-300 justify-start'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-white shadow-md" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Services Section */}
      {(productTab === 'all' || productTab === 'services') && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-slate-900">Services Offered</h3>
            <span className="text-[10px] font-bold text-purple-600">{props.services.length} services</span>
          </div>

          <div className="space-y-2.5">
            {props.services.map((srv) => (
              <div
                key={srv.id}
                className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                    <img src={srv.image} alt={srv.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{srv.name}</h4>
                    <p className="text-xs font-extrabold text-purple-700 mt-0.5">Starting from ₹{srv.startingPrice}</p>
                    <div className="flex items-center gap-2 text-[9px] text-slate-400 mt-1">
                      <span>👁️ {srv.views} views</span>
                      <span>💬 {srv.enquiries} enquiries</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => props.onToggleServiceStatus(srv.id)}
                  className={`w-11 h-6 rounded-full transition p-0.5 flex items-center cursor-pointer shrink-0 ${
                    srv.status === 'Active' ? 'bg-purple-600 justify-end' : 'bg-slate-300 justify-start'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-white shadow-md" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  /* =========================================================================
      4. SCREEN: OFFERS & DEALS (Page 9 of PDF Guide)
     ========================================================================= */
  const renderMobileOffers = () => (
    <div className="space-y-4">
      {/* Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold">Active Offers & Deals</h3>
          <p className="text-[10px] text-pink-100 mt-0.5">Attract local footfall with instant coupons</p>
        </div>
        <button
          type="button"
          onClick={props.onOpenCreateOfferModal}
          className="px-3 py-1.5 rounded-xl bg-white text-purple-900 text-xs font-bold shadow-xs shrink-0"
        >
          + Create
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: 'All (12)' },
          { id: 'active', label: 'Active (8)' },
          { id: 'scheduled', label: 'Scheduled (2)' },
          { id: 'paused', label: 'Paused (1)' },
          { id: 'expired', label: 'Expired (1)' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setOfferTab(tab.id as any)}
            className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              offerTab === tab.id ? 'bg-purple-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Offers List (Matching Page 9 of PDF) */}
      <div className="space-y-3">
        {props.offers.map((offer) => (
          <div
            key={offer.id}
            className="p-3.5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Tag className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.2 rounded-full bg-pink-50 text-pink-700 text-[9px] font-extrabold">
                      {offer.badge}
                    </span>
                    <span className="px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-extrabold">
                      {offer.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 truncate mt-0.5">{offer.title}</h4>
                </div>
              </div>

              <button
                type="button"
                onClick={() => props.onToggleOfferStatus(offer.id)}
                className={`w-11 h-6 rounded-full transition p-0.5 flex items-center cursor-pointer shrink-0 ${
                  offer.status === 'Active' ? 'bg-purple-600 justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-white shadow-md" />
              </button>
            </div>

            <p className="text-[11px] text-slate-500 line-clamp-2">{offer.description}</p>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-semibold">
              <span className="text-purple-700 font-extrabold text-xs">{offer.discountPercent}% OFF</span>
              <span>Valid till {offer.validTill}</span>
              <span className="text-slate-600 font-bold">{offer.claimsCount} claimed</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  /* =========================================================================
      5. SCREEN: POSTS & UPDATES (Page 11 of PDF Guide)
     ========================================================================= */
  const renderMobilePosts = () => (
    <div className="space-y-4">
      {/* Top Action */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-extrabold text-slate-900">Neighbourhood Feed</h3>
          <p className="text-[10px] text-slate-400">Share updates directly to citizen timeline</p>
        </div>
        <button
          type="button"
          onClick={props.onOpenCreatePostModal}
          className="px-3 py-1.5 rounded-2xl bg-purple-600 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
        >
          <Plus className="w-4 h-4" /> Post
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
        {['All Posts (18)', 'Published (14)', 'Scheduled (2)', 'Drafts (1)'].map((tab, i) => (
          <span
            key={tab}
            className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap ${
              i === 0 ? 'bg-purple-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            {tab}
          </span>
        ))}
      </div>

      {/* Posts Feed Cards */}
      <div className="space-y-3.5">
        {props.posts.map((post) => (
          <div
            key={post.id}
            className="rounded-3xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden"
          >
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={props.business.logo} alt="" className="w-8 h-8 rounded-full object-cover" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{props.business.name}</h4>
                  <span className="text-[9px] text-slate-400">{post.date}</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-extrabold">
                {post.badge}
              </span>
            </div>

            <p className="px-3.5 pb-2 text-xs text-slate-700">{post.content}</p>

            {post.image && (
              <div className="h-44 w-full bg-slate-100 overflow-hidden">
                <img src={post.image} alt="" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="p-3 flex items-center justify-between border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => props.onToggleLikePost(post.id)}
                className={`flex items-center gap-1.5 font-bold transition ${
                  post.isLiked ? 'text-rose-600' : 'text-slate-500'
                }`}
              >
                <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-rose-600' : ''}`} />
                <span>{post.likes}</span>
              </button>

              <div className="flex items-center gap-3 text-slate-400 text-[11px] font-medium">
                <span>💬 {post.comments} comments</span>
                <span>↗ {post.shares} shares</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  /* =========================================================================
      6. SCREEN: EVENTS (Page 13 of PDF Guide)
     ========================================================================= */
  const renderMobileEvents = () => (
    <div className="space-y-4">
      <div className="p-4 rounded-3xl bg-gradient-to-r from-purple-700 to-indigo-800 text-white shadow-md flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold">Events & Workshops</h3>
          <p className="text-[10px] text-purple-200 mt-0.5">Host local gatherings & attract footfall</p>
        </div>
        <button
          type="button"
          onClick={props.onOpenCreateEventModal}
          className="px-3 py-1.5 rounded-xl bg-white text-indigo-900 text-xs font-bold shadow-xs shrink-0"
        >
          + Host
        </button>
      </div>

      <div className="space-y-3">
        {props.events.map((evt) => (
          <div key={evt.id} className="p-3.5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-extrabold">
                {evt.category}
              </span>
              <span className="text-xs font-extrabold text-emerald-600">
                {evt.ticketPrice === 0 ? 'FREE' : `₹${evt.ticketPrice}`}
              </span>
            </div>

            <h4 className="text-xs font-extrabold text-slate-900">{evt.title}</h4>
            <p className="text-[11px] text-slate-500">{evt.description}</p>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-500">
              <span>📅 {evt.date} • {evt.time}</span>
              <span className="font-bold text-purple-700">{evt.attendeesCount} RSVP'd</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  /* =========================================================================
      7. SCREEN: CUSTOMER REVIEWS (Page 15 of PDF Guide)
     ========================================================================= */
  const renderMobileReviews = () => (
    <div className="space-y-4">
      {/* Overall Score Card */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex flex-col items-center justify-center border border-amber-200">
            <span className="text-xl font-black leading-none">{props.business.rating}</span>
            <span className="text-[9px] font-bold text-amber-600">★★★★★</span>
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-slate-900">4.6 / 5 Customer Score</h3>
            <p className="text-[10px] text-slate-500">{props.reviews.length} Verified local reviews</p>
            <span className="text-[9px] font-bold text-emerald-600">92% Positive Sentiment</span>
          </div>
        </div>

        <button
          type="button"
          onClick={props.onOpenRequestReviewModal}
          className="px-3 py-1.5 rounded-xl bg-purple-600 text-white text-[11px] font-bold shadow-xs cursor-pointer"
        >
          + Request
        </button>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {props.reviews.map((rev) => (
          <div key={rev.id} className="p-3.5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center">
                  {rev.customerName.charAt(0)}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{rev.customerName}</h4>
                  <span className="text-[9px] text-slate-400">{rev.date}</span>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-500">
                {'★'.repeat(rev.rating)}
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">{rev.reviewText}</p>

            {/* Owner Reply */}
            {rev.reply ? (
              <div className="p-2.5 rounded-2xl bg-purple-50/70 border border-purple-100 text-xs">
                <p className="font-extrabold text-purple-900 text-[10px] mb-0.5">Your Response:</p>
                <p className="text-slate-700 text-[11px]">{rev.reply.text}</p>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  const reply = prompt(`Reply to ${rev.customerName}:`);
                  if (reply) props.onAddReplyToReview(rev.id, reply);
                }}
                className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
              >
                💬 Reply as Owner
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  /* =========================================================================
      8. SCREEN: MESSAGES & CHAT (Page 17 of PDF Guide)
     ========================================================================= */
  const renderMobileMessages = () => (
    <div className="space-y-4">
      {/* Conversations Horizontal Filter Bar */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
        {['All (24)', 'Unread (3)', 'Enquiries (12)', 'Customers (9)'].map((t, i) => (
          <span
            key={t}
            className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap ${
              i === 0 ? 'bg-purple-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            {t}
          </span>
        ))}
      </div>

      {/* Conversations Carousel */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {props.conversations.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => props.onSelectConversation(c.id)}
            className={`p-2 rounded-2xl border text-left shrink-0 w-36 transition cursor-pointer ${
              c.id === props.activeConversationId
                ? 'bg-purple-50 border-purple-300 text-purple-900'
                : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-[10px] font-extrabold flex items-center justify-center">
                {c.avatar}
              </span>
              {c.unreadCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500" />
              )}
            </div>
            <p className="text-[11px] font-bold truncate">{c.customerName}</p>
            <p className="text-[9px] text-slate-400 truncate">{c.lastMessage}</p>
          </button>
        ))}
      </div>

      {/* Active Conversation Chat Window (Matching Page 17 of PDF) */}
      {currentConv && (
        <div className="rounded-3xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
          {/* Chat Header */}
          <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-indigo-600 text-white text-xs font-extrabold flex items-center justify-center">
                {currentConv.avatar}
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-900">{currentConv.customerName}</h4>
                <span className="text-[9px] text-emerald-600 font-bold">Online • {currentConv.badge}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => alert(`Calling ${currentConv.customerName} at ${currentConv.phone}`)}
                className="p-1.5 rounded-xl bg-white text-purple-600 border border-slate-200"
              >
                <Phone className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => alert(`Video Call with ${currentConv.customerName}`)}
                className="p-1.5 rounded-xl bg-white text-purple-600 border border-slate-200"
              >
                <Video className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="p-3.5 space-y-3 min-h-[220px] max-h-[300px] overflow-y-auto bg-slate-50/40">
            {currentConv.messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.sender === 'merchant' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-2.5 rounded-2xl text-xs ${
                    m.sender === 'merchant'
                      ? 'bg-purple-600 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                  }`}
                >
                  <p>{m.text}</p>
                  <span
                    className={`block text-[9px] mt-1 text-right ${
                      m.sender === 'merchant' ? 'text-purple-200' : 'text-slate-400'
                    }`}
                  >
                    {m.time}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-2 border-t border-slate-100 bg-white flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && chatInput.trim()) {
                  props.onSendMessage(currentConv.id, chatInput.trim());
                  setChatInput('');
                }
              }}
              placeholder="Type message..."
              className="flex-1 text-xs text-slate-800 bg-slate-100 rounded-xl px-3 py-2 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => {
                if (chatInput.trim()) {
                  props.onSendMessage(currentConv.id, chatInput.trim());
                  setChatInput('');
                }
              }}
              className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  /* =========================================================================
      9. SCREEN: LEADS & CRM (Page 19 of PDF Guide)
     ========================================================================= */
  const renderMobileLeads = () => (
    <div className="space-y-4">
      {/* 4 Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 rounded-2xl bg-white border border-slate-200">
          <span className="text-xl font-black text-slate-900">152</span>
          <span className="block text-[10px] text-slate-400">Total Enquiries</span>
          <span className="text-[9px] font-bold text-emerald-600">▲ 28%</span>
        </div>
        <div className="p-3 rounded-2xl bg-white border border-slate-200">
          <span className="text-xl font-black text-purple-600">102</span>
          <span className="block text-[10px] text-slate-400">Converted Customers</span>
          <span className="text-[9px] font-bold text-emerald-600">▲ 35%</span>
        </div>
      </div>

      {/* Leads List */}
      <div className="space-y-3">
        {props.leads.map((lead) => (
          <div key={lead.id} className="p-3.5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-extrabold text-xs flex items-center justify-center">
                  {lead.customerName.charAt(0)}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{lead.customerName}</h4>
                  <span className="text-[9px] text-slate-400">{lead.source} • {lead.date}</span>
                </div>
              </div>

              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  lead.status === 'Converted'
                    ? 'bg-emerald-50 text-emerald-700'
                    : lead.status === 'In Progress'
                    ? 'bg-purple-50 text-purple-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {lead.status}
              </span>
            </div>

            <p className="text-xs text-slate-700 font-medium">"{lead.enquiryText}"</p>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => alert(`Calling ${lead.customerName}: ${lead.phone}`)}
                className="font-bold text-purple-600 flex items-center gap-1"
              >
                <Phone className="w-3.5 h-3.5" /> Call
              </button>
              <button
                type="button"
                onClick={() => props.onNavigate('messages')}
                className="font-bold text-indigo-600 flex items-center gap-1"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Message
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  /* =========================================================================
      10. SCREEN: ANALYTICS & INSIGHTS (Page 21 of PDF Guide)
     ========================================================================= */
  const renderMobileAnalytics = () => (
    <div className="space-y-4">
      <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
        <h3 className="text-xs font-extrabold text-slate-900">Total Discovery & Traffic</h3>
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-3 rounded-2xl bg-slate-50">
            <span className="text-lg font-black text-slate-900">12,458</span>
            <span className="block text-[10px] text-slate-400">Total Views</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50">
            <span className="text-lg font-black text-purple-600">8,236</span>
            <span className="block text-[10px] text-slate-400">Unique Visitors</span>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
        <h3 className="text-xs font-extrabold text-slate-900">Peak Footfall Hours</h3>
        <p className="text-[10px] text-slate-500">Highest footfall on Fridays & Saturdays (6 PM - 9 PM)</p>
        <div className="h-20 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-800 text-xs font-bold">
          🔥 Peak Rush: 11 AM – 1 PM & 6 PM – 9 PM
        </div>
      </div>
    </div>
  );

  /* =========================================================================
      11. SCREEN: PROMOTIONS & ADS (Page 23 of PDF Guide)
     ========================================================================= */
  const renderMobilePromotions = () => (
    <div className="space-y-4">
      <div className="p-4 rounded-3xl bg-gradient-to-r from-purple-800 to-indigo-900 text-white shadow-md flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold">Hyperlocal Promotions</h3>
          <p className="text-[10px] text-purple-200 mt-0.5">Reach citizens in 5km radius</p>
        </div>
        <button
          type="button"
          onClick={() => props.onOpenCreatePromoModal()}
          className="px-3 py-1.5 rounded-xl bg-white text-purple-900 text-xs font-bold shrink-0"
        >
          + Launch Ad
        </button>
      </div>

      <div className="space-y-3">
        {props.promotions.map((promo) => (
          <div key={promo.id} className="p-3.5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-extrabold">
                {promo.type}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold">
                {promo.status}
              </span>
            </div>
            <h4 className="text-xs font-extrabold text-slate-900">{promo.title}</h4>
            <div className="grid grid-cols-3 gap-1 text-center py-1 bg-slate-50 rounded-xl text-[10px]">
              <div>
                <span className="font-extrabold text-slate-800">{promo.reach}</span>
                <span className="block text-slate-400 text-[9px]">Reach</span>
              </div>
              <div>
                <span className="font-extrabold text-slate-800">{promo.clicks}</span>
                <span className="block text-slate-400 text-[9px]">Clicks</span>
              </div>
              <div>
                <span className="font-extrabold text-purple-700">{promo.redemptions}</span>
                <span className="block text-slate-400 text-[9px]">Redemptions</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  /* =========================================================================
      12. SCREEN: PAYMENTS & PLANS (Page 25 of PDF Guide)
     ========================================================================= */
  const renderMobilePayments = () => (
    <div className="space-y-4">
      <div className="p-4 rounded-3xl bg-gradient-to-r from-[#1C1045] to-[#3B1F80] text-white shadow-md space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase text-purple-300">Active Membership</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">Active</span>
        </div>
        <h3 className="text-xl font-extrabold">Pro Growth Plan</h3>
        <p className="text-xs text-purple-200">₹1,999/month • Renews on 30 May 2025</p>
      </div>

      <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
        <h4 className="text-xs font-extrabold text-slate-900">Recent Invoices</h4>
        {props.invoices.slice(0, 3).map((inv) => (
          <div key={inv.id} className="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
            <div>
              <p className="font-bold text-slate-900">{inv.id}</p>
              <p className="text-[10px] text-slate-400">{inv.date} • {inv.plan}</p>
            </div>
            <div className="text-right">
              <span className="font-extrabold text-slate-900">₹{inv.amount}</span>
              <span className="block text-[9px] font-bold text-emerald-600">✓ Paid</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  /* =========================================================================
      13. SCREEN: SETTINGS (Page 27 of PDF Guide)
     ========================================================================= */
  const renderMobileSettings = () => (
    <div className="space-y-4">
      {/* Profile Card */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-3">
        <span className="w-12 h-12 rounded-full bg-purple-600 text-white font-extrabold text-base flex items-center justify-center">
          RS
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-extrabold text-slate-900">{props.business.ownerName}</h3>
          <p className="text-xs text-slate-500">{props.business.name}</p>
          <span className="px-2 py-0.2 rounded-full bg-purple-50 text-purple-700 text-[9px] font-extrabold mt-1 inline-block">
            Verified Storefront
          </span>
        </div>
      </div>

      {/* Switch to Citizen Button */}
      <div
        onClick={props.onSwitchToCitizen}
        className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between shadow-sm cursor-pointer active:scale-98 transition"
      >
        <div className="flex items-center gap-2.5">
          <Globe className="w-5 h-5 text-blue-200" />
          <div>
            <h4 className="text-xs font-extrabold text-white">Switch to Citizen View</h4>
            <p className="text-[10px] text-blue-100">See your store through the customer app</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-white" />
      </div>

      {/* Store Preferences */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
        <h4 className="text-xs font-extrabold text-slate-900">Notifications & Alerts</h4>
        {[
          { label: 'Instant Order Enquiries', active: true },
          { label: 'WhatsApp Customer Leads', active: true },
          { label: 'New Review Notifications', active: true },
          { label: 'Promotional Ad Reports', active: false },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between text-xs">
            <span className="text-slate-700">{item.label}</span>
            <span
              className={`w-10 h-5 rounded-full flex items-center p-0.5 ${
                item.active ? 'bg-purple-600 justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white shadow-xs" />
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  /* Main Body Switcher */
  const renderActiveBody = () => {
    switch (props.activeDashboard) {
      case 'overview':
        return renderMobileOverview();
      case 'profile':
        return renderMobileProfile();
      case 'products':
        return renderMobileProducts();
      case 'offers':
        return renderMobileOffers();
      case 'posts':
        return renderMobilePosts();
      case 'events':
        return renderMobileEvents();
      case 'reviews':
        return renderMobileReviews();
      case 'messages':
        return renderMobileMessages();
      case 'leads':
        return renderMobileLeads();
      case 'analytics':
        return renderMobileAnalytics();
      case 'promotions':
        return renderMobilePromotions();
      case 'payments':
        return renderMobilePayments();
      case 'settings':
        return renderMobileSettings();
      default:
        return renderMobileOverview();
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F4F6FB] flex flex-col text-slate-900 pb-20 select-none">
      {/* =====================================================================
          NATIVE MOBILE APP BAR (Sticky Top Header matching Page 3 & Page 5)
         ===================================================================== */}
      <header className="sticky top-0 z-30 bg-[#1C1045] text-white shadow-md">
        {/* Row 1: Brand Logo + Store Switcher Pill + Notifications + RS Avatar */}
        <div className="px-4 pt-3 pb-2.5 flex items-center justify-between gap-2">
          {/* Brand Logo */}
          <div className="flex items-center gap-1.5">
            <span className="text-base font-extrabold tracking-tight">
              MyArea<span className="text-[#A855F7]">24</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white text-[9px] font-extrabold uppercase">
              Merchant
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Storefront Selector Dropdown */}
            <button
              type="button"
              onClick={() => setBusinessPickerOpen((v) => !v)}
              className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-[11px] font-bold text-white flex items-center gap-1 cursor-pointer truncate max-w-[155px]"
            >
              <Store className="w-3 h-3 text-purple-300 shrink-0" />
              <span className="truncate">{props.business.name.split(' ')[0]}</span>
              <ChevronDown className="w-3 h-3 text-purple-300 shrink-0" />
            </button>

            {/* Notification Bell */}
            <button
              type="button"
              onClick={() => handleTabClick('messages')}
              className="relative w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5 ring-1 ring-[#1C1045]" />
            </button>

            {/* Rohit Sharma Avatar */}
            <button
              type="button"
              onClick={() => handleTabClick('settings')}
              className="w-8 h-8 rounded-full bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center border border-white/30"
            >
              RS
            </button>
          </div>
        </div>

        {/* Row 2: Screen Sub-Header & Dynamic Context Actions (if not overview) */}
        {props.activeDashboard !== 'overview' && (
          <div className="px-4 pb-2.5 pt-0.5 flex items-center justify-between border-t border-white/10">
            <button
              type="button"
              onClick={() => handleTabClick('overview')}
              className="flex items-center gap-1 text-xs font-bold text-purple-200 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <span className="text-xs font-extrabold text-white capitalize">
              {props.activeDashboard.replace('-', ' ')}
            </span>
            <div className="w-8" />
          </div>
        )}
      </header>

      {/* Store Switcher Dropdown Bottom Sheet / Popover */}
      {businessPickerOpen && (
        <div
          onClick={() => setBusinessPickerOpen(false)}
          className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center pt-16 px-4 backdrop-blur-2xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-3 w-full max-w-sm space-y-1.5 animate-in zoom-in-95 duration-100"
          >
            <div className="flex items-center justify-between pb-1 px-1">
              <p className="text-[10px] font-extrabold uppercase text-slate-400">Select Storefront</p>
              <button
                type="button"
                onClick={() => setBusinessPickerOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                props.onSwitchBusiness('biz-daily-brew');
                setBusinessPickerOpen(false);
              }}
              className={`w-full p-3 rounded-2xl text-left text-xs font-bold transition flex items-center justify-between ${
                props.business.id === 'biz-daily-brew'
                  ? 'bg-purple-50 text-purple-900 border border-purple-200'
                  : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div>
                <p className="text-sm font-extrabold text-slate-900">☕ The Daily Brew</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Café & Restaurant • Rohini Sector 9</p>
              </div>
              {props.business.id === 'biz-daily-brew' && (
                <span className="text-xs font-extrabold text-purple-600">✓ Active</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                props.onSwitchBusiness('biz-sharma-fuel');
                setBusinessPickerOpen(false);
              }}
              className={`w-full p-3 rounded-2xl text-left text-xs font-bold transition flex items-center justify-between ${
                props.business.id === 'biz-sharma-fuel'
                  ? 'bg-purple-50 text-purple-900 border border-purple-200'
                  : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div>
                <p className="text-sm font-extrabold text-slate-900">⛽ Sharma Fuel Station</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Fuel & Convenience • Rohini Sector 9</p>
              </div>
              {props.business.id === 'biz-sharma-fuel' && (
                <span className="text-xs font-extrabold text-purple-600">✓ Active</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          MAIN SCROLLABLE APP BODY (Full screen, fluid mobile layout)
         ===================================================================== */}
      <main className="flex-1 p-4 space-y-4">{renderActiveBody()}</main>

      {/* =====================================================================
          FIXED 6-BUTTON MERCHANT BOTTOM NAVIGATION BAR
          Strictly matching Page 3 & Page 5 of the PDF:
          Dashboard | Profile | Products | Offers | Posts | More
         ===================================================================== */}
      <nav
        aria-label="Merchant mobile bottom navigation"
        className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(15,23,42,0.06)] px-2 py-1.5 z-40 pb-[max(env(safe-area-inset-bottom),0.5rem)]"
      >
        <div className="grid grid-cols-6 items-center max-w-md mx-auto">
          {/* 1. Dashboard */}
          <button
            type="button"
            onClick={() => handleTabClick('overview')}
            className={`flex flex-col items-center justify-center py-1 gap-0.5 transition ${
              props.activeDashboard === 'overview' && !moreDrawerOpen
                ? 'text-purple-600 font-extrabold'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] leading-tight">Dashboard</span>
          </button>

          {/* 2. Profile */}
          <button
            type="button"
            onClick={() => handleTabClick('profile')}
            className={`flex flex-col items-center justify-center py-1 gap-0.5 transition ${
              props.activeDashboard === 'profile' && !moreDrawerOpen
                ? 'text-purple-600 font-extrabold'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <Store className="w-5 h-5" />
            <span className="text-[10px] leading-tight">Profile</span>
          </button>

          {/* 3. Products */}
          <button
            type="button"
            onClick={() => handleTabClick('products')}
            className={`flex flex-col items-center justify-center py-1 gap-0.5 transition ${
              props.activeDashboard === 'products' && !moreDrawerOpen
                ? 'text-purple-600 font-extrabold'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <Package className="w-5 h-5" />
            <span className="text-[10px] leading-tight">Products</span>
          </button>

          {/* 4. Offers */}
          <button
            type="button"
            onClick={() => handleTabClick('offers')}
            className={`flex flex-col items-center justify-center py-1 gap-0.5 transition ${
              props.activeDashboard === 'offers' && !moreDrawerOpen
                ? 'text-purple-600 font-extrabold'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <Tag className="w-5 h-5" />
            <span className="text-[10px] leading-tight">Offers</span>
          </button>

          {/* 5. Posts */}
          <button
            type="button"
            onClick={() => handleTabClick('posts')}
            className={`flex flex-col items-center justify-center py-1 gap-0.5 transition ${
              props.activeDashboard === 'posts' && !moreDrawerOpen
                ? 'text-purple-600 font-extrabold'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <Megaphone className="w-5 h-5" />
            <span className="text-[10px] leading-tight">Posts</span>
          </button>

          {/* 6. More */}
          <button
            type="button"
            onClick={() => setMoreDrawerOpen(true)}
            className={`flex flex-col items-center justify-center py-1 gap-0.5 transition ${
              moreDrawerOpen ||
              ['events', 'reviews', 'messages', 'leads', 'analytics', 'promotions', 'payments', 'settings'].includes(
                props.activeDashboard
              )
                ? 'text-purple-600 font-extrabold'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <div className="flex gap-0.5 items-center justify-center h-5">
              <span className="w-1 h-1 rounded-full bg-current" />
              <span className="w-1 h-1 rounded-full bg-current" />
              <span className="w-1 h-1 rounded-full bg-current" />
            </div>
            <span className="text-[10px] leading-tight">More</span>
          </button>
        </div>
      </nav>

      {/* =====================================================================
          MORE BOTTOM SHEET DRAWER (Reviews, Messages, Leads, Analytics, etc.)
         ===================================================================== */}
      {moreDrawerOpen && (
        <div
          onClick={() => setMoreDrawerOpen(false)}
          className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center backdrop-blur-2xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-t-3xl w-full p-4 space-y-3 max-h-[85%] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-200"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">Merchant Hub Navigation</h4>
                <p className="text-[10px] text-slate-400">All business modules & citizen switch</p>
              </div>
              <button
                type="button"
                onClick={() => setMoreDrawerOpen(false)}
                className="p-1.5 rounded-full bg-slate-100 text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Switch to Citizen Mode Banner */}
            <div
              onClick={() => {
                setMoreDrawerOpen(false);
                props.onSwitchToCitizen();
              }}
              className="p-3 rounded-2xl bg-gradient-to-r from-[#0B1739] via-[#1E1B4B] to-[#312E81] text-white flex items-center justify-between shadow-sm border border-indigo-900/60 cursor-pointer active:scale-98 transition"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
                  <Globe className="w-5 h-5 text-indigo-300" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                    Switch to Citizen Portal
                  </h4>
                  <p className="text-[10px] text-indigo-200">View live weather, AQI & local neighborhood feed</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-extrabold shrink-0 shadow-xs">
                Switch ›
              </span>
            </div>

            {/* Grid of Remaining Merchant Sections */}
            <div className="space-y-3 pt-1">
              <div>
                <p className="text-[10px] font-extrabold uppercase text-slate-400 mb-1.5 px-1">
                  Customer Relations
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleTabClick('reviews')}
                    className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-center flex flex-col items-center gap-1 cursor-pointer"
                  >
                    <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                    <span className="text-[11px] font-bold text-slate-800">Reviews</span>
                    <span className="text-[9px] text-amber-600 font-extrabold">4.6 ★</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTabClick('messages')}
                    className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-center flex flex-col items-center gap-1 cursor-pointer relative"
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2" />
                    <MessageSquare className="w-4 h-4 text-purple-600" />
                    <span className="text-[11px] font-bold text-slate-800">Messages</span>
                    <span className="text-[9px] text-purple-600 font-extrabold">3 New</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTabClick('leads')}
                    className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-center flex flex-col items-center gap-1 cursor-pointer"
                  >
                    <Users className="w-4 h-4 text-indigo-600" />
                    <span className="text-[11px] font-bold text-slate-800">Leads CRM</span>
                    <span className="text-[9px] text-indigo-600 font-extrabold">5 New</span>
                  </button>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-extrabold uppercase text-slate-400 mb-1.5 px-1">
                  Growth & Business Tools
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleTabClick('events')}
                    className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-center flex flex-col items-center gap-1 cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <span className="text-[11px] font-bold text-slate-800">Events</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTabClick('analytics')}
                    className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-center flex flex-col items-center gap-1 cursor-pointer"
                  >
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span className="text-[11px] font-bold text-slate-800">Analytics</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTabClick('promotions')}
                    className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-center flex flex-col items-center gap-1 cursor-pointer"
                  >
                    <Megaphone className="w-4 h-4 text-rose-600" />
                    <span className="text-[11px] font-bold text-slate-800">Promotions</span>
                  </button>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-extrabold uppercase text-slate-400 mb-1.5 px-1">
                  Account & Settings
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleTabClick('payments')}
                    className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-center flex flex-col items-center gap-1 cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    <span className="text-[11px] font-bold text-slate-800">Payments & Plans</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTabClick('settings')}
                    className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-center flex flex-col items-center gap-1 cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-slate-600" />
                    <span className="text-[11px] font-bold text-slate-800">Store Settings</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
