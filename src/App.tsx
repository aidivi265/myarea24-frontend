import React, { useState, useEffect } from 'react';
import {
  DashboardId,
  ActionModalData,
  SavedEntry,
} from './types';
import { NAV_ITEMS, INITIAL_SAVED_ITEMS, AI_KNOWLEDGE_BASE } from './data/mockData';
import {
  HomeDashboard,
  BusinessesDashboard,
  ProductsDashboard,
  ServicesDashboard,
  OffersDashboard,
  EventsDashboard,
} from './dashboards/MainDashboards';
import {
  IntelligenceDashboard,
  WeatherDashboard,
  AirQualityDashboard,
  TrafficDashboard,
  AlertsDashboard,
  AiAssistantDashboard,
} from './dashboards/IntelligenceDashboards';
import {
  MapDashboard,
  EmergencyDashboard,
  MarketRatesDashboard,
  FuelRatesDashboard,
  BulletinsDashboard,
  SavedDashboard,
} from './dashboards/CommunityDashboards';
import { MobileAppView } from './components/MobileAppView';
import {
  LocationPickerModal,
  UserLocation,
  DEFAULT_SAVED_LOCATIONS,
} from './components/LocationPickerModal';
import {
  Home,
  Store,
  Package,
  Wrench,
  Tag,
  Calendar,
  Zap,
  Cloud,
  Wind,
  Car,
  AlertTriangle,
  Bot,
  Map as MapIcon,
  ShieldAlert,
  TrendingUp,
  Fuel,
  FileText,
  Heart,
  Sparkles,
  Search,
  MapPin,
  Sun,
  Bell,
  ChevronDown,
  Crown,
  ArrowRight,
  X,
  CheckCircle2,
  ShoppingBag,
  Clock,
  ChevronRight,
} from 'lucide-react';

const ICON_MAP: Record<DashboardId, React.ElementType> = {
  home: Home,
  businesses: Store,
  products: Package,
  services: Wrench,
  offers: Tag,
  events: Calendar,
  intelligence: Zap,
  weather: Cloud,
  'air-quality': Wind,
  traffic: Car,
  alerts: AlertTriangle,
  'ai-assistant': Bot,
  map: MapIcon,
  emergency: ShieldAlert,
  'market-rates': TrendingUp,
  'fuel-rates': Fuel,
  bulletins: FileText,
  saved: Heart,
};

export function App() {
  const [activeDashboard, setActiveDashboard] = useState<DashboardId>('home');

  // Real-World Blinkit / Uber Style Location State
  const [currentLocation, setCurrentLocation] = useState<UserLocation>(DEFAULT_SAVED_LOCATIONS[0]);
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [commandOpen, setCommandOpen] = useState(false);

  // Header Popovers
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Interactive Saved State synced with Saved Dashboard
  const [savedEntries, setSavedEntries] = useState<SavedEntry[]>(INITIAL_SAVED_ITEMS);
  const savedIds = savedEntries.map((s) => s.id);

  // Shopping Cart / Added Products State
  const [cartItems, setCartItems] = useState<{ name: string; price: number }[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Action Modal State
  const [modalData, setModalData] = useState<ActionModalData | null>(null);

  // Quick AI Assistant Modal State
  const [aiModalPrompt, setAiModalPrompt] = useState<string | null>(null);
  const [aiModalReply, setAiModalReply] = useState<string>('');

  const selectedArea = currentLocation.areaName;

  // Keyboard shortcut Cmd/Ctrl + K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  const handleNavigate = (id: DashboardId) => {
    setActiveDashboard(id);
    setNotificationsOpen(false);
    setProfileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectLocation = (loc: UserLocation) => {
    setCurrentLocation(loc);
    showToast(`Location updated to ${loc.label} (${loc.areaName})`);
  };

  const handleToggleSave = (entry: SavedEntry) => {
    setSavedEntries((prev) => {
      const exists = prev.some((e) => e.id === entry.id);
      if (exists) {
        showToast(`Removed "${entry.title}" from Saved`);
        return prev.filter((e) => e.id !== entry.id);
      } else {
        showToast(`Saved "${entry.title}" to your favorites!`);
        return [entry, ...prev];
      }
    });
  };

  const handleAddToCart = (item: { name: string; price: number }) => {
    setCartItems((prev) => [...prev, item]);
    showToast(`Added ${item.name} (₹${item.price}) to local shopping list`);
  };

  const handleAskAi = (prompt: string) => {
    const lower = prompt.toLowerCase();
    let reply = AI_KNOWLEDGE_BASE.default;
    if (lower.includes('weather') || lower.includes('rain') || lower.includes('umbrella') || lower.includes('heat')) {
      reply = AI_KNOWLEDGE_BASE.weather;
    } else if (lower.includes('traffic') || lower.includes('route') || lower.includes('leave') || lower.includes('parking')) {
      reply = AI_KNOWLEDGE_BASE.traffic;
    } else if (lower.includes('air') || lower.includes('aqi')) {
      reply = AI_KNOWLEDGE_BASE.air;
    } else if (lower.includes('event') || lower.includes('fest')) {
      reply = AI_KNOWLEDGE_BASE.events;
    } else if (lower.includes('alert') || lower.includes('safe') || lower.includes('pharmac')) {
      reply = AI_KNOWLEDGE_BASE.alerts;
    } else if (lower.includes('restaurant') || lower.includes('cafe') || lower.includes('dinner') || lower.includes('food')) {
      reply = AI_KNOWLEDGE_BASE.restaurants;
    }
    setAiModalPrompt(prompt);
    setAiModalReply(reply);
  };

  const currentNav = NAV_ITEMS.find((n) => n.id === activeDashboard) || NAV_ITEMS[0];

  const commonProps = {
    onNavigate: handleNavigate,
    onOpenModal: setModalData,
    onAskAi: handleAskAi,
    savedIds,
    onToggleSave: handleToggleSave,
    searchQuery,
    selectedArea,
    onAddToCart: handleAddToCart,
    onOpenLocationPicker: () => setLocationModalOpen(true),
  };

  const renderDesktopDashboard = () => {
    switch (activeDashboard) {
      case 'home':
        return <HomeDashboard {...commonProps} />;
      case 'businesses':
        return <BusinessesDashboard {...commonProps} />;
      case 'products':
        return <ProductsDashboard {...commonProps} />;
      case 'services':
        return <ServicesDashboard {...commonProps} />;
      case 'offers':
        return <OffersDashboard {...commonProps} />;
      case 'events':
        return <EventsDashboard {...commonProps} />;
      case 'intelligence':
        return <IntelligenceDashboard {...commonProps} />;
      case 'weather':
        return <WeatherDashboard {...commonProps} />;
      case 'air-quality':
        return <AirQualityDashboard {...commonProps} />;
      case 'traffic':
        return <TrafficDashboard {...commonProps} />;
      case 'alerts':
        return <AlertsDashboard {...commonProps} />;
      case 'ai-assistant':
        return <AiAssistantDashboard {...commonProps} />;
      case 'map':
        return <MapDashboard {...commonProps} />;
      case 'emergency':
        return <EmergencyDashboard {...commonProps} />;
      case 'market-rates':
        return <MarketRatesDashboard {...commonProps} />;
      case 'fuel-rates':
        return <FuelRatesDashboard {...commonProps} />;
      case 'bulletins':
        return <BulletinsDashboard {...commonProps} />;
      case 'saved':
        return <SavedDashboard {...commonProps} savedEntries={savedEntries} />;
      default:
        return <HomeDashboard {...commonProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F5FB] text-slate-900 flex flex-col">
      {/* =====================================================================
          1. PHONE APP UI (< lg) — Automatically renders on mobile viewports!
          Uses the dedicated MobileAppView with fixed 5-button footer
          (Home, Map, Explore, Alerts, More) & Blinkit/Uber Location Selector.
         ===================================================================== */}
      <div className="lg:hidden flex-1 flex flex-col">
        <MobileAppView
          activeDashboard={activeDashboard}
          onNavigate={handleNavigate}
          onOpenModal={setModalData}
          onAskAi={handleAskAi}
          savedIds={savedIds}
          savedEntries={savedEntries}
          onToggleSave={handleToggleSave}
          selectedArea={selectedArea}
          currentLocation={currentLocation}
          onOpenLocationPicker={() => setLocationModalOpen(true)}
          onOpenNotifications={() => {
            setNotificationsOpen((v) => !v);
            setProfileMenuOpen(false);
          }}
          onOpenProfile={() => {
            setProfileMenuOpen((v) => !v);
            setNotificationsOpen(false);
          }}
        />
      </div>

      {/* =====================================================================
          2. DESKTOP WEBSITE UI (>= lg) — Left Sidebar + Top Header + Main Body
         ===================================================================== */}
      <div className="hidden lg:flex flex-1 min-h-0">
        {/* LEFT SIDEBAR (Exact 235px Desktop Navigation) */}
        <aside className="w-[235px] shrink-0 bg-white border-r border-slate-200/80 flex flex-col justify-between select-none sticky top-0 h-screen">
          <div className="p-3.5 overflow-y-auto no-scrollbar">
            {/* Brand Logo */}
            <div className="flex items-center justify-between px-2 pt-1 pb-4">
              <button
                type="button"
                onClick={() => handleNavigate('home')}
                className="flex items-center gap-2 text-left cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-[19px] font-extrabold tracking-tight text-[#1E1B4B]">
                  MyArea<span className="text-[#4F46E5]">24</span>
                </span>
              </button>
            </div>

            {/* MAIN SECTION */}
            <nav className="space-y-0.5">
              {NAV_ITEMS.filter((i) => i.section === 'main').map((item) => {
                const Icon = ICON_MAP[item.id];
                const active = activeDashboard === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      active
                        ? 'bg-[#EEF2FF] text-[#4F46E5] font-bold shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-[#4F46E5]' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* INTELLIGENCE SECTION */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <p className="px-3 mb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                INTELLIGENCE
              </p>
              <nav className="space-y-0.5">
                {NAV_ITEMS.filter((i) => i.section === 'intelligence').map((item) => {
                  const Icon = ICON_MAP[item.id];
                  const active = activeDashboard === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavigate(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        active
                          ? 'bg-[#EEF2FF] text-[#4F46E5] font-bold'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${active ? 'text-[#4F46E5]' : 'text-slate-500'}`} />
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

            {/* COMMUNITY SECTION */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <p className="px-3 mb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                COMMUNITY
              </p>
              <nav className="space-y-0.5">
                {NAV_ITEMS.filter((i) => i.section === 'community').map((item) => {
                  const Icon = ICON_MAP[item.id];
                  const active = activeDashboard === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavigate(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        active
                          ? 'bg-[#EEF2FF] text-[#4F46E5] font-bold'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${active ? 'text-[#4F46E5]' : 'text-slate-500'}`} />
                        <span>{item.label}</span>
                      </span>
                      {item.id === 'saved' && (
                        <span className="px-1.5 py-0.2 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold">
                          {savedEntries.length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Upgrade to Pro Card at Bottom of Sidebar */}
          <div className="p-3.5">
            <div
              onClick={() =>
                setModalData({
                  title: 'Upgrade to MyArea24 Pro',
                  subtitle: 'Hyperlocal Intelligence + Merchant Demand Engine',
                  category: 'Pro Membership',
                  price: '₹199 / month',
                  description:
                    'Unlock real-time multi-signal demand forecasting, priority civic SMS alerts, ad-free CCTV corridor streams, and unlimited AI Assistant queries.',
                  primaryActionLabel: 'Start 14-Day Free Trial',
                })
              }
              className="cursor-pointer rounded-2xl bg-gradient-to-r from-[#EEF2FF] via-[#F3E8FF] to-[#E0E7FF] p-3 border border-indigo-200/60 flex items-center justify-between gap-2 hover:shadow-sm transition"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-white text-purple-600 flex items-center justify-center shadow-xs shrink-0">
                  <Crown className="w-4 h-4 fill-purple-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-extrabold text-slate-900 truncate">Upgrade to Pro</p>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    Smarter insights,
                    <br />
                    more features.
                  </p>
                </div>
              </div>
              <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT MAIN AREA (Desktop Header + Dashboard Content) */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* DESKTOP TOP HEADER BAR */}
          <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
            {/* Left: Blinkit / Uber Style Location Selector + Global Search */}
            <div className="flex items-center gap-4 flex-1 max-w-3xl">
              {/* Blinkit / Swiggy / Uber Style Location Trigger */}
              <button
                type="button"
                onClick={() => setLocationModalOpen(true)}
                className="group flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-[#F4F6FB] hover:bg-indigo-50/70 border border-slate-200/90 hover:border-indigo-200 transition text-left shrink-0 max-w-[265px] cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-extrabold text-slate-900">
                      {currentLocation.label}
                    </span>
                    <span className="text-[11px] font-bold text-indigo-600 truncate">
                      • {currentLocation.areaName}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 group-hover:text-indigo-600 transition" />
                  </div>
                  <p className="text-[10px] text-slate-500 truncate">
                    {currentLocation.fullAddress}
                  </p>
                </div>
              </button>

              {/* Global Search Box */}
              <div
                onClick={() => setCommandOpen(true)}
                className="cursor-pointer flex-1 bg-[#F4F6FB] hover:bg-slate-100/90 border border-slate-200/80 rounded-full px-4 py-2 flex items-center justify-between gap-2 transition"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={currentNav.searchPlaceholder}
                    className="bg-transparent text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none w-full"
                  />
                </div>
                <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-semibold text-slate-400 shrink-0">
                  ⌘ K
                </span>
              </div>
            </div>

            {/* Right Header Pills */}
            <div className="flex items-center gap-2.5 shrink-0">
              {/* Weather Pill */}
              <button
                type="button"
                onClick={() => handleNavigate('weather')}
                className="px-3 py-1.5 rounded-full bg-[#F4F6FB] hover:bg-amber-50 border border-slate-200/80 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                title="View Live Local Weather"
              >
                <Sun className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>28°C</span>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded-full">
                  AQI 82
                </span>
              </button>

              {/* Cart Badge if items added */}
              {cartItems.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setModalData({
                      title: `Your Local Shopping List (${cartItems.length} items)`,
                      category: 'Nearby Store Price Match',
                      price: `Total Est: ₹${cartItems.reduce((a, b) => a + b.price, 0)}`,
                      description: `Items added: ${cartItems.map((i) => i.name).join(', ')}. Available for immediate pickup or 20-min delivery from Apna Super Mart (650m).`,
                      primaryActionLabel: 'Send Order to Nearby Store',
                    })
                  }
                  className="px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{cartItems.length} items</span>
                </button>
              )}

              {/* Notification Bell */}
              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen((v) => !v);
                  setProfileMenuOpen(false);
                }}
                className="relative w-9 h-9 rounded-full bg-[#F4F6FB] hover:bg-rose-50 border border-slate-200/80 flex items-center justify-center text-slate-700 transition cursor-pointer"
                title="Live Neighbourhood Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2 ring-2 ring-white" />
              </button>

              {/* User Profile Pill */}
              <button
                type="button"
                onClick={() => {
                  setProfileMenuOpen((v) => !v);
                  setNotificationsOpen(false);
                }}
                className="pl-1.5 pr-3 py-1 rounded-full bg-[#F4F6FB] hover:bg-slate-100 border border-slate-200/80 flex items-center gap-2 transition cursor-pointer"
              >
                <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-extrabold flex items-center justify-center">
                  D
                </span>
                <div className="text-left hidden xl:block">
                  <p className="text-xs font-bold text-slate-800 leading-none">Divyansh Gupta</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{currentLocation.areaName}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </header>

          {/* DESKTOP MAIN CONTENT BODY */}
          <main className="flex-1 p-5 pb-8 overflow-y-auto">
            <div className="max-w-[1320px] mx-auto">{renderDesktopDashboard()}</div>
          </main>
        </div>
      </div>

      {/* =====================================================================
          NOTIFICATIONS POPOVER (Bell Icon Click on Desktop or Mobile)
         ===================================================================== */}
      {notificationsOpen && (
        <div
          onClick={() => setNotificationsOpen(false)}
          className="fixed inset-0 z-50 flex items-start justify-end pt-14 lg:pt-16 px-4 bg-slate-950/20"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-extrabold text-slate-900">
                  Live Area Notifications ({currentLocation.areaName})
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[10px] font-extrabold">
                3 New
              </span>
            </div>
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {[
                {
                  title: 'Heavy Traffic near Madhuban Chowk',
                  sub: 'Delay of ~18 mins reported on Outer Ring Road. Use Sector 9 internal road.',
                  time: '8 mins ago',
                  badge: 'Traffic',
                  cls: 'bg-rose-50 text-rose-600',
                  target: 'traffic' as DashboardId,
                },
                {
                  title: 'Rohini Summer Fest Starts at 6 PM',
                  sub: 'Live music & 25+ food stalls at District Park, Sector 10.',
                  time: '25 mins ago',
                  badge: 'Event',
                  cls: 'bg-indigo-50 text-indigo-600',
                  target: 'events' as DashboardId,
                },
                {
                  title: 'Tomato & Onion Mandi Rates Dropped',
                  sub: 'Fresh vegetable prices down 15% today at Sharma Fresh Mart.',
                  time: '1 hour ago',
                  badge: 'Price Drop',
                  cls: 'bg-emerald-50 text-emerald-700',
                  target: 'market-rates' as DashboardId,
                },
              ].map((n) => (
                <button
                  key={n.title}
                  type="button"
                  onClick={() => handleNavigate(n.target)}
                  className="w-full p-3.5 text-left hover:bg-slate-50 transition flex items-start justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold ${n.cls}`}>
                        {n.badge}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" /> {n.time}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900">{n.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{n.sub}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                </button>
              ))}
            </div>
            <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleNavigate('alerts')}
                className="w-full py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition"
              >
                View All Area Alerts →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          USER PROFILE POPOVER MENU
         ===================================================================== */}
      {profileMenuOpen && (
        <div
          onClick={() => setProfileMenuOpen(false)}
          className="fixed inset-0 z-50 flex items-start justify-end pt-14 lg:pt-16 px-4 bg-slate-950/20"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-72 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="p-4 bg-gradient-to-r from-[#0B1739] to-[#27206A] text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500 border-2 border-white/40 flex items-center justify-center font-extrabold text-sm">
                D
              </div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold truncate">Divyansh Gupta</p>
                <p className="text-[10px] text-blue-200 truncate">
                  📍 {currentLocation.areaName} ({currentLocation.pincode})
                </p>
              </div>
            </div>
            <div className="p-2 space-y-0.5 text-xs">
              <button
                type="button"
                onClick={() => {
                  setProfileMenuOpen(false);
                  setLocationModalOpen(true);
                }}
                className="w-full px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center justify-between font-semibold text-slate-700"
              >
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-600" /> Manage Saved Addresses
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                type="button"
                onClick={() => handleNavigate('saved')}
                className="w-full px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center justify-between font-semibold text-slate-700"
              >
                <span className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500" /> Saved Places & Deals
                </span>
                <span className="px-1.5 py-0.2 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold">
                  {savedEntries.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleNavigate('ai-assistant')}
                className="w-full px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center justify-between font-semibold text-slate-700"
              >
                <span className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-violet-600" /> MyArea24 AI Assistant
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                type="button"
                onClick={() => handleNavigate('emergency')}
                className="w-full px-3 py-2 rounded-xl hover:bg-rose-50 flex items-center justify-between font-semibold text-rose-600"
              >
                <span className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> Emergency SOS Contacts
                </span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          BLINKIT / UBER STYLE LOCATION PICKER MODAL
         ===================================================================== */}
      <LocationPickerModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        currentLocation={currentLocation}
        onSelectLocation={handleSelectLocation}
      />

      {/* TOAST NOTIFICATION */}
      {toastMsg && (
        <div className="fixed bottom-20 lg:bottom-5 right-4 lg:right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* COMMAND PALETTE MODAL (Cmd/Ctrl + K) */}
      {commandOpen && (
        <div
          onClick={() => setCommandOpen(false)}
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex items-start justify-center pt-16 sm:pt-20 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden"
          >
            <div className="p-3.5 border-b border-slate-100 flex items-center gap-2.5">
              <Search className="w-4 h-4 text-indigo-600" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search businesses, products, alerts or jump to any section..."
                className="flex-1 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setCommandOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-600 px-1.5"
              >
                ESC
              </button>
            </div>
            <div className="p-2 max-h-80 overflow-y-auto">
              {searchQuery.trim().length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    setCommandOpen(false);
                    handleAskAi(searchQuery);
                  }}
                  className="w-full mb-2 p-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 flex items-center justify-between text-xs font-bold text-indigo-700 transition"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    Ask MyArea24 AI: “{searchQuery}”
                  </span>
                  <span>Ask →</span>
                </button>
              )}
              <p className="px-2.5 py-1 text-[10px] font-extrabold uppercase text-slate-400">
                Quick Jump Across MyArea24
              </p>
              <div className="grid grid-cols-2 gap-1">
                {NAV_ITEMS.filter(
                  (item) =>
                    !searchQuery || item.label.toLowerCase().includes(searchQuery.toLowerCase())
                ).map((item) => {
                  const Icon = ICON_MAP[item.id];
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        handleNavigate(item.id);
                        setCommandOpen(false);
                      }}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-indigo-50 text-xs font-semibold text-slate-700 hover:text-indigo-700 text-left transition"
                    >
                      <Icon className="w-4 h-4 text-indigo-500" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK AI ASSISTANT INSIGHT MODAL */}
      {aiModalPrompt && (
        <div
          onClick={() => setAiModalPrompt(null)}
          className="fixed inset-0 bg-slate-950/55 backdrop-blur-xs z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl border border-indigo-100 w-full max-w-lg overflow-hidden"
          >
            <div className="bg-gradient-to-r from-[#0B1739] via-[#1B2B65] to-[#312E81] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src="./assets/crops/ai-robot-umbrella.webp"
                  alt="AI Robot"
                  className="w-10 h-10 rounded-xl bg-white/90 p-0.5 object-contain"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                    <h3 className="text-sm font-extrabold">MyArea24 Synthesis Core</h3>
                  </div>
                  <p className="text-[11px] text-blue-200">Cross-Signal Correlation • {selectedArea}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAiModalPrompt(null)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="bg-slate-100 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800">
                “{aiModalPrompt}”
              </div>
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3.5 text-xs text-slate-800 whitespace-pre-line leading-relaxed">
                {aiModalReply}
              </div>
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAiModalPrompt(null);
                    handleNavigate('ai-assistant');
                  }}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
                >
                  Open Full AI Assistant Dashboard →
                </button>
                <button
                  type="button"
                  onClick={() => setAiModalPrompt(null)}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                >
                  Got It
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ACTION / DETAILS MODAL */}
      {modalData && (
        <div
          onClick={() => setModalData(null)}
          className="fixed inset-0 bg-slate-950/55 backdrop-blur-xs z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden"
          >
            {modalData.image && (
              <div className="relative h-44 bg-slate-100">
                <img src={modalData.image} alt={modalData.title} className="w-full h-full object-cover" />
                {modalData.badge && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-emerald-500 text-white text-xs font-extrabold shadow">
                    {modalData.badge}
                  </span>
                )}
              </div>
            )}
            <div className="p-5">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600">
                {modalData.category}
              </p>
              <h3 className="text-base font-extrabold text-slate-900 mt-0.5">{modalData.title}</h3>
              {modalData.subtitle && (
                <p className="text-xs font-semibold text-slate-500 mt-0.5">{modalData.subtitle}</p>
              )}
              {(modalData.price || modalData.rating || modalData.location) && (
                <div className="flex flex-wrap gap-2 mt-2.5 text-xs">
                  {modalData.price && (
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-extrabold text-slate-900">
                      {modalData.price}
                    </span>
                  )}
                  {modalData.rating && (
                    <span className="px-2.5 py-1 rounded-lg bg-amber-50 font-bold text-amber-700">
                      ★ {modalData.rating}
                    </span>
                  )}
                  {modalData.location && (
                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 font-semibold text-blue-700">
                      📍 {modalData.location}
                    </span>
                  )}
                </div>
              )}
              <p className="text-xs text-slate-600 mt-3 leading-relaxed">{modalData.description}</p>
              <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalData(null)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    showToast(`${modalData.primaryActionLabel} confirmed for ${modalData.title}!`);
                    setModalData(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow"
                >
                  {modalData.primaryActionLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default App;
