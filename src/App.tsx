import React, { useState, useEffect } from 'react';
import {
  DashboardId,
  ViewDeviceMode,
  RenderFidelityMode,
  ActionModalData,
  SavedEntry,
} from './types';
import { NAV_ITEMS, AREAS, INITIAL_SAVED_ITEMS, AI_KNOWLEDGE_BASE } from './data/mockData';
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
  Monitor,
  Smartphone,
  Columns,
  Eye,
  Code2,
  X,
  Send,
  CheckCircle2,
  ShoppingBag,
  Menu,
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
  const [deviceMode, setDeviceMode] = useState<ViewDeviceMode>('desktop');
  const [fidelityMode, setFidelityMode] = useState<RenderFidelityMode>('interactive');
  const [selectedArea, setSelectedArea] = useState<string>(AREAS[0]);
  const [areaDropdownOpen, setAreaDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [commandOpen, setCommandOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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
    setTimeout(() => setToastMsg(null), 3000);
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
    onNavigate: (id: DashboardId) => {
      setActiveDashboard(id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    onOpenModal: setModalData,
    onAskAi: handleAskAi,
    savedIds,
    onToggleSave: handleToggleSave,
    searchQuery,
    selectedArea,
    onAddToCart: handleAddToCart,
  };

  const renderDesktopDashboard = () => {
    // If Visual-Guide Pixel-Exact Mode is enabled, render the high-res 1536x1024 body crop from the PDF
    if (fidelityMode === 'visual-guide') {
      return (
        <div className="relative rounded-2xl overflow-hidden shadow-card border border-slate-200/80 bg-[#F3F5FB]">
          <img
            src={`./assets/screens/${activeDashboard}-desktop-body.webp`}
            alt={`${currentNav.label} Desktop Visual Guide`}
            className="w-full h-auto block"
          />
          {/* Interactive Hero Ask-AI / Action Hotspot */}
          <button
            type="button"
            onClick={() => handleAskAi(`Give me a live summary for ${currentNav.label} in ${selectedArea}`)}
            className="absolute top-[4%] right-[3%] w-[28%] h-[22%] rounded-2xl bg-transparent hover:bg-indigo-500/10 transition"
            title="Click to interact with MyArea24 AI"
          />
        </div>
      );
    }

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
      {/* PROTOTYPE VIEW SWITCHER BAR (Top Slim Bar for Desktop / Phone App / Split + Fidelity Mode) */}
      <div className="bg-[#0F172A] text-white px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs border-b border-slate-800 z-40">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 font-bold text-[10px]">
            MyArea24 Prototype
          </span>
          <span className="text-slate-300 hidden sm:inline">
            Screen: <strong className="text-white">{currentNav.label} Dashboard</strong> (18/18 Screens Ready)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Device Form Factor Toggle */}
          <div className="flex items-center bg-slate-800/90 p-0.5 rounded-lg border border-slate-700">
            <button
              type="button"
              onClick={() => setDeviceMode('desktop')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1.5 transition ${
                deviceMode === 'desktop' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" /> Desktop Website
            </button>
            <button
              type="button"
              onClick={() => setDeviceMode('app')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1.5 transition ${
                deviceMode === 'app' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" /> Phone App
            </button>
            <button
              type="button"
              onClick={() => setDeviceMode('split')}
              className={`hidden lg:flex px-2.5 py-1 rounded-md text-[11px] font-bold items-center gap-1.5 transition ${
                deviceMode === 'split' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Columns className="w-3.5 h-3.5" /> Desktop + App Split
            </button>
          </div>

          {/* Interactive Coded vs Exact PDF Canvas Toggle */}
          <div className="flex items-center bg-slate-800/90 p-0.5 rounded-lg border border-slate-700">
            <button
              type="button"
              onClick={() => setFidelityMode('interactive')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition ${
                fidelityMode === 'interactive'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" /> Interactive Coded UI
            </button>
            <button
              type="button"
              onClick={() => setFidelityMode('visual-guide')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition ${
                fidelityMode === 'visual-guide'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> Visual Guide 1:1 Canvas
            </button>
          </div>
        </div>
      </div>

      {/* MAIN WORKSPACE */}
      {deviceMode === 'app' ? (
        <div className="flex-1 bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 flex flex-col lg:flex-row items-center justify-center gap-6 p-4">
          {/* Quick 18-Dashboard Switcher Pill List on Left of Phone Simulator */}
          <div className="w-full lg:w-64 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3.5 text-white">
            <p className="text-xs font-extrabold uppercase tracking-wider text-indigo-300 mb-2">
              All 18 App Screens
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-1 max-h-[680px] overflow-y-auto no-scrollbar">
              {NAV_ITEMS.map((item) => {
                const Icon = ICON_MAP[item.id];
                const active = activeDashboard === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveDashboard(item.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition text-left ${
                      active
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-200 hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Phone App Simulator */}
          <MobileAppView
            activeDashboard={activeDashboard}
            onNavigate={setActiveDashboard}
            onOpenModal={setModalData}
            onAskAi={handleAskAi}
            savedIds={savedIds}
            savedEntries={savedEntries}
            onToggleSave={handleToggleSave}
            selectedArea={selectedArea}
            fidelityMode={fidelityMode}
          />
        </div>
      ) : (
        <div className="flex-1 flex min-h-0">
          {/* LEFT SIDEBAR (Exact 235px Desktop Navigation matching PDF) */}
          <aside
            className={`${
              mobileSidebarOpen ? 'fixed inset-y-0 left-0 z-50 flex' : 'hidden lg:flex'
            } w-[235px] shrink-0 bg-white border-r border-slate-200/80 flex-col justify-between select-none`}
          >
            <div className="p-3.5 overflow-y-auto no-scrollbar">
              {/* Brand Logo */}
              <div className="flex items-center justify-between px-2 pt-1 pb-4">
                <button
                  type="button"
                  onClick={() => setActiveDashboard('home')}
                  className="flex items-center gap-2 text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-[19px] font-extrabold tracking-tight text-[#1E1B4B]">
                    MyArea<span className="text-[#4F46E5]">24</span>
                  </span>
                </button>
                {mobileSidebarOpen && (
                  <button
                    type="button"
                    onClick={() => setMobileSidebarOpen(false)}
                    className="lg:hidden text-slate-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
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
                      onClick={() => {
                        setActiveDashboard(item.id);
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
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
                        onClick={() => {
                          setActiveDashboard(item.id);
                          setMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
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
                        onClick={() => {
                          setActiveDashboard(item.id);
                          setMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
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

          {/* RIGHT MAIN AREA (Top Header + Dashboard Content) */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* TOP HEADER BAR */}
            <header className="h-14 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
              <div className="flex items-center gap-3 flex-1 max-w-xl">
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(true)}
                  className="lg:hidden p-1.5 rounded-lg bg-slate-100 text-slate-700"
                >
                  <Menu className="w-4 h-4" />
                </button>
                {/* Global Search Box */}
                <div
                  onClick={() => setCommandOpen(true)}
                  className="cursor-pointer w-full bg-[#F4F6FB] hover:bg-slate-100/90 border border-slate-200/80 rounded-full px-3.5 py-1.5 flex items-center justify-between gap-2 transition"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
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
                {/* Area Selector Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setAreaDropdownOpen((v) => !v)}
                    className="px-3 py-1.5 rounded-full bg-[#F4F6FB] hover:bg-slate-100 border border-slate-200/80 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition"
                  >
                    <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="hidden sm:inline">{selectedArea}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  {areaDropdownOpen && (
                    <div className="absolute right-0 mt-1.5 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50">
                      {AREAS.map((area) => (
                        <button
                          key={area}
                          type="button"
                          onClick={() => {
                            setSelectedArea(area);
                            setAreaDropdownOpen(false);
                            showToast(`Switched hyperlocal signal mesh to ${area}`);
                          }}
                          className={`w-full px-3.5 py-1.5 text-left text-xs font-medium hover:bg-indigo-50 ${
                            selectedArea === area ? 'text-indigo-600 font-bold bg-indigo-50/50' : 'text-slate-700'
                          }`}
                        >
                          📍 {area}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Weather Pill */}
                <button
                  type="button"
                  onClick={() => setActiveDashboard('weather')}
                  className="px-3 py-1.5 rounded-full bg-[#F4F6FB] hover:bg-amber-50 border border-slate-200/80 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition"
                >
                  <Sun className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>28°C</span>
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
                    className="px-2.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{cartItems.length}</span>
                  </button>
                )}

                {/* Notification Bell */}
                <button
                  type="button"
                  onClick={() => setActiveDashboard('alerts')}
                  className="relative w-8 h-8 rounded-full bg-[#F4F6FB] hover:bg-rose-50 border border-slate-200/80 flex items-center justify-center text-slate-700 transition"
                >
                  <Bell className="w-4 h-4" />
                  <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5" />
                </button>

                {/* User Profile Pill */}
                <button
                  type="button"
                  onClick={() => setActiveDashboard('saved')}
                  className="pl-1.5 pr-2.5 py-1 rounded-full bg-[#F4F6FB] hover:bg-slate-100 border border-slate-200/80 flex items-center gap-2 transition"
                >
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-extrabold flex items-center justify-center">
                    D
                  </span>
                  <span className="text-xs font-bold text-slate-800 hidden md:inline">Divyansh Gupta</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:inline" />
                </button>
              </div>
            </header>

            {/* MAIN CONTENT BODY (Supports Full Desktop OR Side-by-Side Split with Mobile App) */}
            <main className="flex-1 p-4 lg:p-5 overflow-y-auto">
              {deviceMode === 'split' ? (
                <div className="grid grid-cols-1 2xl:grid-cols-12 gap-6 items-start">
                  <div className="2xl:col-span-8">{renderDesktopDashboard()}</div>
                  <div className="2xl:col-span-4 flex flex-col items-center sticky top-20">
                    <div className="mb-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-extrabold">
                      📱 Synced Phone Application View ({currentNav.label})
                    </div>
                    <MobileAppView
                      activeDashboard={activeDashboard}
                      onNavigate={setActiveDashboard}
                      onOpenModal={setModalData}
                      onAskAi={handleAskAi}
                      savedIds={savedIds}
                      savedEntries={savedEntries}
                      onToggleSave={handleToggleSave}
                      selectedArea={selectedArea}
                      fidelityMode={fidelityMode}
                    />
                  </div>
                </div>
              ) : (
                <div className="max-w-[1320px] mx-auto">{renderDesktopDashboard()}</div>
              )}
            </main>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* COMMAND PALETTE MODAL (Cmd/Ctrl + K) */}
      {commandOpen && (
        <div
          onClick={() => setCommandOpen(false)}
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex items-start justify-center pt-20 p-4"
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
                placeholder="Jump to any of the 18 dashboards or ask MyArea24 AI..."
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
              <p className="px-2.5 py-1 text-[10px] font-extrabold uppercase text-slate-400">
                All 18 MyArea24 Dashboards
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
                        setActiveDashboard(item.id);
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
                  src="/assets/crops/ai-robot-umbrella.webp"
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
                    setActiveDashboard('ai-assistant');
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
