import React, { useState } from 'react';
import { DashboardId, ActionModalData, SavedEntry, RenderFidelityMode } from '../types';
import { NAV_ITEMS } from '../data/mockData';
import { InteractiveMap } from './InteractiveMap';
import {
  MapPin,
  Bell,
  Search,
  Mic,
  SlidersHorizontal,
  Sun,
  Sparkles,
  ChevronRight,
  Heart,
  Home,
  Compass,
  LayoutGrid,
  Store,
  Package,
  Wrench,
  Tag,
  Calendar,
  BarChart3,
  Wind,
  Car,
  Bot,
  Map as MapIcon,
  ShieldAlert,
  TrendingUp,
  Fuel,
  FileText,
  Wifi,
  BatteryFull,
  Signal,
  X,
  Plus,
  Send,
} from 'lucide-react';

interface MobileAppViewProps {
  activeDashboard: DashboardId;
  onNavigate: (id: DashboardId) => void;
  onOpenModal: (data: ActionModalData) => void;
  onAskAi: (prompt: string) => void;
  savedIds: string[];
  savedEntries: SavedEntry[];
  onToggleSave: (entry: SavedEntry) => void;
  selectedArea: string;
  fidelityMode: RenderFidelityMode;
}

export const MobileAppView: React.FC<MobileAppViewProps> = ({
  activeDashboard,
  onNavigate,
  onOpenModal,
  onAskAi,
  savedEntries,
  selectedArea,
  fidelityMode,
}) => {
  const [moreDrawerOpen, setMoreDrawerOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState('');
  const [aiInput, setAiInput] = useState('');

  const currentNav = NAV_ITEMS.find((n) => n.id === activeDashboard) || NAV_ITEMS[0];

  const getBottomTabs = (): { id: DashboardId | 'more'; label: string; icon: React.ElementType; badge?: boolean }[] => {
    if (activeDashboard === 'home') {
      return [
        { id: 'home', label: 'Home', icon: Home },
        { id: 'map', label: 'Map', icon: MapPin },
        { id: 'businesses', label: 'Explore', icon: Compass },
        { id: 'alerts', label: 'Alerts', icon: Bell, badge: true },
        { id: 'more', label: 'More', icon: LayoutGrid },
      ];
    }
    if (['map', 'emergency', 'market-rates', 'fuel-rates', 'bulletins', 'saved'].includes(activeDashboard)) {
      const fifth: { id: DashboardId | 'more'; label: string; icon: React.ElementType } =
        activeDashboard === 'bulletins'
          ? { id: 'bulletins', label: 'Bulletins', icon: FileText }
          : activeDashboard === 'saved'
          ? { id: 'saved', label: 'Saved', icon: Heart }
          : activeDashboard === 'fuel-rates'
          ? { id: 'fuel-rates', label: 'Fuel Rates', icon: Fuel }
          : { id: 'more', label: 'More', icon: LayoutGrid };
      return [
        { id: 'home', label: 'Home', icon: Home },
        { id: 'map', label: 'Map', icon: MapIcon },
        { id: 'emergency', label: 'Emergency', icon: ShieldAlert },
        { id: 'market-rates', label: 'Market Rates', icon: TrendingUp },
        fifth,
      ];
    }
    const fifthMap: Record<string, { id: DashboardId | 'more'; label: string; icon: React.ElementType }> = {
      offers: { id: 'offers', label: 'Offers', icon: Tag },
      events: { id: 'events', label: 'Events', icon: Calendar },
      intelligence: { id: 'intelligence', label: 'Intelligence', icon: BarChart3 },
      weather: { id: 'weather', label: 'Weather', icon: Sun },
      'air-quality': { id: 'air-quality', label: 'Air Quality', icon: Wind },
      traffic: { id: 'traffic', label: 'Traffic', icon: Car },
      alerts: { id: 'alerts', label: 'Alerts', icon: Bell },
      'ai-assistant': { id: 'ai-assistant', label: 'AI Assistant', icon: Bot },
    };
    return [
      { id: 'home', label: 'Home', icon: Home },
      { id: 'businesses', label: 'Businesses', icon: Store },
      { id: 'products', label: 'Products', icon: Package },
      { id: 'services', label: 'Services', icon: Wrench },
      fifthMap[activeDashboard] || { id: 'more', label: 'More', icon: LayoutGrid },
    ];
  };

  const bottomTabs = getBottomTabs();

  // Dedicated Mobile Body Renderer for all 18 screens matching Odd Pages (3..37) of the Visual Guide PDF
  const renderMobileScreenBody = () => {
    switch (activeDashboard) {
      case 'businesses':
        return (
          <div className="p-3 space-y-3">
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
              {['All', '🍴 Restaurants', '☕ Cafes', '🛍️ Shopping', 'More ⌄'].map((c, i) => (
                <span
                  key={c}
                  className={`px-3 py-1 rounded-xl text-[10px] font-bold whitespace-nowrap ${
                    i === 0 ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  {c}
                </span>
              ))}
            </div>
            <InteractiveMap heightClass="h-36" centerLabel={'Rohini\nSector 10'} />
            <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/70">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-extrabold text-slate-900">⭐ Popular Near You</h4>
                <span className="text-[10px] font-bold text-blue-600">See All ›</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { n: 'The Urban Chai Café', r: '4.5 (1.2K)', s: 'Café • 800 m', img: './assets/crops/biz-card-chai.webp' },
                  { n: 'Bikanervala', r: '4.3 (2.4K)', s: 'Restaurant • 1.2 km', img: './assets/crops/biz-card-bikanervala.webp' },
                  { n: 'Cult Fit Gym', r: '4.6 (980)', s: 'Gym • 1.5 km', img: './assets/crops/biz-card-cultfit.webp' },
                ].map((b) => (
                  <div key={b.n} className="rounded-xl border border-slate-200/80 overflow-hidden bg-white">
                    <div className="relative h-16">
                      <img src={b.img} alt={b.n} className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.2 rounded bg-emerald-500 text-white text-[8px] font-bold">
                        Open Now
                      </span>
                    </div>
                    <div className="p-1.5">
                      <p className="text-[10px] font-extrabold text-slate-900 truncate">{b.n}</p>
                      <p className="text-[9px] text-amber-600 font-bold">★ {b.r}</p>
                      <p className="text-[8px] text-slate-500 truncate">{b.s}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/70">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-extrabold text-slate-900">⊞ Browse by Category</h4>
                <span className="text-[10px] font-bold text-blue-600">See All ›</span>
              </div>
              <div className="grid grid-cols-6 gap-1.5 text-center">
                {[
                  ['🍴', 'Restaurants'],
                  ['☕', 'Cafes'],
                  ['🛍️', 'Shopping'],
                  ['🏥', 'Healthcare'],
                  ['🏋️', 'Gyms'],
                  ['⋯', 'More'],
                ].map(([ic, l]) => (
                  <div key={l} className="flex flex-col items-center gap-1">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-sm">
                      {ic}
                    </div>
                    <span className="text-[8px] font-semibold text-slate-700 truncate w-full">{l}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-indigo-50/70 rounded-2xl p-3 border border-indigo-100">
              <p className="text-[11px] font-extrabold text-indigo-950">✨ AI Recommendations for You BETA</p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {[
                  { t: 'Best Cafes to Work From', s: 'Quiet, great Wi-Fi', img: './assets/crops/biz-ai-cafe.webp' },
                  { t: 'Top Rated Salons Nearby', s: 'Within 2 km', img: './assets/crops/biz-card-looks.webp' },
                ].map((r) => (
                  <div key={r.t} className="bg-white rounded-xl p-1.5 flex items-center gap-2 border border-slate-200/70">
                    <img src={r.img} alt={r.t} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[9px] font-extrabold text-slate-900 line-clamp-2">{r.t}</p>
                      <p className="text-[8px] text-slate-500 truncate">{r.s}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'products':
        return (
          <div className="p-3 space-y-3">
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
              {['All', '🧺 Groceries', '🍎 Fruits & Veg', '🥛 Dairy', 'More ⌄'].map((c, i) => (
                <span
                  key={c}
                  className={`px-3 py-1 rounded-xl text-[10px] font-bold whitespace-nowrap ${
                    i === 0 ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  {c}
                </span>
              ))}
            </div>
            <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/70">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-extrabold text-slate-900">🔥 Popular Products in Your Area</h4>
                <span className="text-[10px] font-bold text-blue-600">See All ›</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { n: 'Amul Fresh Milk', p: '₹58', s: 'Gupta Store • 1.2 km', img: './assets/crops/prod-amul-milk.webp' },
                  { n: 'Banana (1 kg)', p: '₹40', s: 'Apna Mart • 650 m', img: './assets/crops/prod-banana.webp' },
                  { n: 'Aashirvaad Atta', p: '₹265', s: 'Daily Needs • 1.1 km', img: './assets/crops/prod-atta.webp' },
                ].map((p) => (
                  <div key={p.n} className="rounded-xl border border-slate-200/80 p-2 bg-white">
                    <img src={p.img} alt={p.n} className="w-full h-14 object-contain mb-1" />
                    <p className="text-[10px] font-extrabold text-slate-900 truncate">{p.n}</p>
                    <p className="text-xs font-extrabold text-indigo-700">{p.p}</p>
                    <p className="text-[8px] text-slate-500 truncate">📍 {p.s}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/70">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-extrabold text-slate-900">🏪 Nearby Stores</h4>
                <span className="text-[10px] font-bold text-blue-600">See All ›</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { n: 'Apna Super Mart', r: '4.5 (1.2K)', img: './assets/crops/store-apna-mart.webp' },
                  { n: 'Sharma Fresh Mart', r: '4.3 (980)', img: './assets/crops/store-sharma-fresh.webp' },
                  { n: 'MedPlus Pharmacy', r: '4.6 (2.1K)', img: './assets/crops/store-medplus.webp' },
                ].map((st) => (
                  <div key={st.n} className="rounded-xl border border-slate-200/80 overflow-hidden bg-white">
                    <img src={st.img} alt={st.n} className="w-full h-14 object-cover" />
                    <div className="p-1.5">
                      <p className="text-[10px] font-extrabold text-slate-900 truncate">{st.n}</p>
                      <p className="text-[9px] text-amber-600 font-bold">★ {st.r}</p>
                      <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 text-[8px] font-bold">
                        Open Now
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'services':
        return (
          <div className="p-3 space-y-3">
            <div className="grid grid-cols-6 gap-1.5 text-center bg-white p-2.5 rounded-2xl border border-slate-200/70">
              {[
                ['⊞', 'All'],
                ['🔧', 'Repairs'],
                ['🧹', 'Cleaning'],
                ['⚡', 'Electrical'],
                ['🚰', 'Plumbing'],
                ['✂️', 'Beauty'],
              ].map(([ic, l], i) => (
                <div key={l} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm ${
                      i === 0 ? 'bg-blue-600 text-white' : 'bg-slate-50'
                    }`}
                  >
                    {ic}
                  </div>
                  <span className="text-[8px] font-bold text-slate-700">{l}</span>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/70">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-extrabold text-slate-900">⭐ Popular Services Near You</h4>
                <span className="text-[10px] font-bold text-blue-600">See All ›</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { n: 'AC Service & Repair', p: '₹499 onwards', r: '4.6 (1.2K)', img: './assets/crops/srv-ac-repair.webp' },
                  { n: 'Home Deep Cleaning', p: '₹1,499 onwards', r: '4.4 (980)', img: './assets/crops/srv-cleaning.webp' },
                  { n: 'Electrician Services', p: '₹299 onwards', r: '4.5 (870)', img: './assets/crops/srv-electrician.webp' },
                ].map((s) => (
                  <div key={s.n} className="rounded-xl border border-slate-200/80 overflow-hidden bg-white p-1.5">
                    <img src={s.img} alt={s.n} className="w-full h-14 rounded-lg object-cover mb-1" />
                    <p className="text-[10px] font-extrabold text-slate-900 truncate">{s.n}</p>
                    <p className="text-[9px] text-amber-600 font-bold">★ {s.r}</p>
                    <p className="text-[10px] font-extrabold text-slate-900">{s.p}</p>
                    <button
                      type="button"
                      onClick={() =>
                        onOpenModal({
                          title: s.n,
                          category: 'Mobile Instant Booking',
                          price: s.p,
                          description: 'Verified professional ready for doorstep visit in Rohini.',
                          primaryActionLabel: 'Confirm Booking',
                          image: s.img,
                        })
                      }
                      className="mt-1 w-full py-1 rounded bg-blue-50 text-blue-600 text-[9px] font-bold"
                    >
                      Book Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/70">
              <h4 className="text-xs font-extrabold text-slate-900 mb-2">🛡️ Top Rated Professionals</h4>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { n: 'Amit AC Services', r: '4.6', img: './assets/crops/pro-amit.webp' },
                  { n: 'Sharma Cleaning', r: '4.4', img: './assets/crops/pro-sharma.webp' },
                  { n: 'Delhi Electric', r: '4.7', img: './assets/crops/pro-delhi-elec.webp' },
                ].map((pro) => (
                  <div key={pro.n} className="p-2 rounded-xl bg-slate-50 text-center">
                    <img src={pro.img} alt={pro.n} className="w-10 h-10 rounded-full object-cover mx-auto mb-1" />
                    <p className="text-[9px] font-extrabold text-slate-900 truncate">{pro.n}</p>
                    <p className="text-[8px] text-amber-600 font-bold">★ {pro.r}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'offers':
        return (
          <div className="p-3 space-y-3">
            <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/70">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-extrabold text-slate-900">🔥 Trending Offers Near You</h4>
                <span className="text-[10px] font-bold text-blue-600">See All ›</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { b: "La Pino'z Pizza", off: '50% OFF', t: '50% OFF Medium Pizzas', img: './assets/crops/offer-lapinoz.webp' },
                  { b: 'Looks Salon', off: '30% OFF', t: '30% OFF Hair Services', img: './assets/crops/offer-looks.webp' },
                  { b: 'Cult.fit', off: '1 MO FREE', t: '1 Month Free + 50% OFF', img: './assets/crops/offer-cultfit.webp' },
                ].map((o) => (
                  <div key={o.b} className="rounded-xl border border-slate-200/80 overflow-hidden bg-white p-1.5">
                    <div className="relative h-14 mb-1">
                      <img src={o.img} alt={o.b} className="w-full h-full rounded-lg object-cover" />
                      <span className="absolute top-1 left-1 px-1.5 py-0.2 rounded bg-rose-600 text-white text-[8px] font-bold">
                        {o.off}
                      </span>
                    </div>
                    <p className="text-[9px] font-bold text-slate-500 truncate">{o.b}</p>
                    <p className="text-[10px] font-extrabold text-slate-900 line-clamp-2">{o.t}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/70">
              <h4 className="text-xs font-extrabold text-slate-900 mb-2">🕒 Limited Time Offers</h4>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { b: 'Burger Singh', d: 'Flat 40% OFF', l: '2 days left', img: './assets/crops/offer-burger-singh.webp' },
                  { b: 'Croma', d: 'Up to 35% OFF', l: '3 days left', img: './assets/crops/offer-croma.webp' },
                  { b: 'Urban Company', d: '₹200 OFF', l: '1 day left', img: './assets/crops/offer-urban-company.webp' },
                ].map((lim) => (
                  <div key={lim.b} className="rounded-xl border border-slate-200/80 overflow-hidden bg-white p-1.5">
                    <img src={lim.img} alt={lim.b} className="w-full h-12 rounded-lg object-cover mb-1" />
                    <p className="text-[10px] font-extrabold text-slate-900 truncate">{lim.b}</p>
                    <p className="text-[10px] font-extrabold text-rose-600">{lim.d}</p>
                    <p className="text-[8px] text-slate-400">{lim.l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'events':
        return (
          <div className="p-3 space-y-3">
            <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/70">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-extrabold text-slate-900">⭐ Featured Events Near You</h4>
                <span className="text-[10px] font-bold text-blue-600">See All ›</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { dt: 'SAT 16', t: 'Rohini Live Music Fest', loc: 'Japanese Park', img: './assets/crops/evt-music-fest.webp' },
                  { dt: 'SUN 17', t: 'Rohini Food Carnival', loc: 'DDA Ground', img: './assets/crops/evt-food-carnival.webp' },
                  { dt: 'SAT 23', t: 'Yoga in the Park', loc: 'Central Park', img: './assets/crops/evt-yoga.webp' },
                ].map((ev) => (
                  <div key={ev.t} className="rounded-xl border border-slate-200/80 overflow-hidden bg-white p-1.5">
                    <img src={ev.img} alt={ev.t} className="w-full h-14 rounded-lg object-cover mb-1" />
                    <span className="text-[8px] font-extrabold text-blue-600">{ev.dt}</span>
                    <p className="text-[10px] font-extrabold text-slate-900 line-clamp-1">{ev.t}</p>
                    <p className="text-[8px] text-slate-500 truncate">📍 {ev.loc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/70">
              <h4 className="text-xs font-extrabold text-slate-900 mb-2">📅 Upcoming Events</h4>
              <div className="space-y-2">
                {[
                  { d: 'MAR 18', t: 'Dance Workshop', s: '3:00 PM • Rohini Sec 8', b: 'Free', img: './assets/crops/evt-dance.webp' },
                  { d: 'MAR 20', t: 'Tech Talk: AI in Daily Life', s: '5:00 PM • Rohini Tech Hub', b: 'Workshop', img: './assets/crops/evt-techtalk.webp' },
                  { d: 'MAR 22', t: 'Cricket Tournament', s: '8:00 AM • Sports Complex', b: 'Sports', img: './assets/crops/evt-cricket.webp' },
                ].map((u) => (
                  <div key={u.t} className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-slate-50">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[9px] font-extrabold text-rose-500 w-8 text-center">{u.d}</span>
                      <img src={u.img} alt={u.t} className="w-10 h-8 rounded object-cover shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-extrabold text-slate-900 truncate">{u.t}</p>
                        <p className="text-[9px] text-slate-500 truncate">{u.s}</p>
                      </div>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 text-[8px] font-bold">{u.b}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'ai-assistant':
        return (
          <div className="p-3 space-y-3">
            <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-200/70">
              <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100">
                <span className="text-xs font-extrabold text-slate-900">🤖 Chat with MyArea24 AI</span>
                <span className="text-[10px] text-slate-400">24/7 Active</span>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-[11px] text-slate-700 space-y-1 mb-3">
                <p className="font-extrabold text-slate-900">Hello Divyansh! 👋</p>
                <p>I'm your MyArea24 AI Assistant. Ask me about weather, traffic, air quality, services, or safety.</p>
              </div>
              <div className="grid grid-cols-2 gap-1.5 mb-3">
                {[
                  "What's the weather like today?",
                  'Any important alerts today?',
                  'Show current air quality',
                  'Are there traffic jams near me?',
                ].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => onAskAi(q)}
                    className="p-2 rounded-xl border border-slate-200 text-[10px] font-semibold text-slate-700 text-left hover:bg-indigo-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!aiInput.trim()) return;
                  onAskAi(aiInput);
                  setAiInput('');
                }}
                className="flex items-center gap-1.5 bg-slate-100 rounded-xl px-2.5 py-1.5"
              >
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="Ask anything about your area..."
                  className="flex-1 bg-transparent text-xs focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
            <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/70">
              <h4 className="text-xs font-extrabold text-slate-900 mb-2">⚡ Quick Actions</h4>
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  ['🌤️', 'Weather', 'weather'],
                  ['🚗', 'Traffic', 'traffic'],
                  ['🍃', 'Air Quality', 'air-quality'],
                  ['🔔', 'Alerts', 'alerts'],
                ].map(([ic, l, nav]) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => onNavigate(nav as DashboardId)}
                    className="p-2 rounded-xl bg-slate-50 flex flex-col items-center gap-1"
                  >
                    <span className="text-base">{ic}</span>
                    <span className="text-[9px] font-bold text-slate-700">{l}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'emergency':
        return (
          <div className="p-3 space-y-3">
            <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/70">
              <h4 className="text-xs font-extrabold text-slate-900 mb-2">⚡ Quick Emergency Actions</h4>
              <div className="grid grid-cols-5 gap-1.5 text-center">
                {[
                  ['📞', 'Call 112', 'bg-rose-500 text-white'],
                  ['🚑', 'Ambulance', 'bg-blue-500 text-white'],
                  ['🛡️', 'Police', 'bg-indigo-600 text-white'],
                  ['🚒', 'Fire', 'bg-orange-500 text-white'],
                  ['📍', 'Share Loc', 'bg-emerald-500 text-white'],
                ].map(([ic, l, cls]) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() =>
                      onOpenModal({
                        title: `Emergency Action: ${l}`,
                        category: 'SOS Dispatch',
                        description: 'Connecting immediately with live GPS coordinates in Outer North Delhi.',
                        primaryActionLabel: l,
                      })
                    }
                    className={`${cls} p-2 rounded-xl flex flex-col items-center gap-1`}
                  >
                    <span className="text-base">{ic}</span>
                    <span className="text-[8px] font-extrabold leading-tight">{l}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/70">
              <h4 className="text-xs font-extrabold text-slate-900 mb-2">📍 Nearby Emergency Services</h4>
              <InteractiveMap heightClass="h-36" showLiveViewBadge showSearchBottomButton={false} />
            </div>
            <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/70">
              <h4 className="text-xs font-extrabold text-slate-900 mb-2">🔺 Live Emergency Alerts</h4>
              <div className="space-y-1.5 text-xs">
                {[
                  ['Road Accident', 'Outer Ring Road (Rohini)', 'Critical', 'bg-rose-50 text-rose-600'],
                  ['Waterlogging', 'Shalimar Bagh', 'Important', 'bg-orange-50 text-orange-600'],
                  ['Fire Incident', 'Rohini Sector 16', 'Advisory', 'bg-amber-50 text-amber-700'],
                ].map(([t, loc, b, cls]) => (
                  <div key={t} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-none">
                    <div>
                      <p className="text-[11px] font-bold text-slate-900">{t}</p>
                      <p className="text-[9px] text-slate-500">{loc}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${cls}`}>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'saved':
        return (
          <div className="p-3 space-y-3">
            <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/70">
              <h4 className="text-xs font-extrabold text-slate-900 mb-2">⛽ Saved Fuel Stations</h4>
              <div className="grid grid-cols-2 gap-2">
                {savedEntries
                  .filter((e) => e.category === 'Fuel Stations')
                  .slice(0, 2)
                  .map((st) => (
                    <div key={st.id} className="rounded-xl border border-slate-200/80 overflow-hidden bg-white p-1.5">
                      <img src={st.image} alt={st.title} className="w-full h-16 rounded-lg object-cover mb-1" />
                      <p className="text-[10px] font-extrabold text-slate-900">{st.title}</p>
                      <p className="text-[9px] text-slate-500 truncate">{st.subtitle}</p>
                      <p className="text-[10px] font-extrabold text-indigo-700 mt-0.5">Petrol {st.priceOrStatus}</p>
                    </div>
                  ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/70">
              <h4 className="text-xs font-extrabold text-slate-900 mb-2">🏠 Saved Properties</h4>
              <div className="grid grid-cols-2 gap-2">
                {savedEntries
                  .filter((e) => e.category === 'Properties')
                  .slice(0, 2)
                  .map((pr) => (
                    <div key={pr.id} className="rounded-xl border border-slate-200/80 overflow-hidden bg-white p-1.5">
                      <img src={pr.image} alt={pr.title} className="w-full h-16 rounded-lg object-cover mb-1" />
                      <p className="text-[10px] font-extrabold text-blue-700">{pr.title}</p>
                      <p className="text-[9px] font-bold text-slate-900 truncate">{pr.subtitle}</p>
                      <p className="text-[8px] text-slate-500 truncate">{pr.meta}</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        );

      default:
        // Default rich mobile view (Home, Intelligence, Weather, Air Quality, Traffic, Alerts, Map, Market Rates, Fuel Rates, Bulletins)
        return (
          <div className="p-3 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div
                onClick={() => onNavigate('weather')}
                className="cursor-pointer bg-white rounded-xl p-2.5 shadow-xs border border-slate-200/70"
              >
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                  <span>☀️ Weather</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
                <p className="text-base font-extrabold text-slate-900 mt-1">28°C</p>
                <p className="text-[9px] text-slate-500">Clear sky</p>
                <p className="text-[9px] text-slate-400">H: 32° L: 24°</p>
              </div>

              <div
                onClick={() => onNavigate('air-quality')}
                className="cursor-pointer bg-white rounded-xl p-2.5 shadow-xs border border-slate-200/70"
              >
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                  <span>🍃 Air Quality</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
                <p className="text-base font-extrabold text-slate-900 mt-1">142 AQI</p>
                <span className="inline-block px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-bold mt-1">
                  Moderate
                </span>
              </div>

              <div
                onClick={() => onNavigate('traffic')}
                className="cursor-pointer bg-white rounded-xl p-2.5 shadow-xs border border-slate-200/70"
              >
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                  <span>🚗 Traffic</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
                <p className="text-sm font-extrabold text-emerald-600 mt-1">✓ Smooth</p>
                <p className="text-[9px] text-slate-500 mt-0.5">No major incidents</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50 rounded-2xl p-3 border border-indigo-200/70 shadow-xs">
              <div className="flex items-center gap-2.5">
                <img
                  src="/assets/crops/ai-robot-umbrella.webp"
                  alt="AI Robot"
                  className="w-12 h-12 rounded-xl object-contain bg-white/80 p-1 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="text-[11px] font-extrabold text-indigo-950">AI Insight for You</span>
                    <span className="px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 text-[8px] font-bold">
                      BETA
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-700 mt-0.5 leading-snug">
                    Rain is expected after 10 PM in Rohini which may slow down traffic near Sector 10.
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
              <div className="grid grid-cols-3 gap-1.5 mt-2.5">
                {['Leave earlier', 'Check alternate routes', 'Carry an umbrella'].map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => onAskAi(ch)}
                    className="bg-white/90 rounded-lg py-1 px-1.5 text-[9px] font-bold text-indigo-900 border border-indigo-100 truncate"
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/70">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" /> Live Map of Your Area
                </h3>
                <button
                  type="button"
                  onClick={() => onNavigate('map')}
                  className="text-[10px] font-bold text-blue-600"
                >
                  View Full Map ›
                </button>
              </div>
              <InteractiveMap
                heightClass="h-36"
                showSearchBottomButton={false}
                showTrafficRoutes={activeDashboard === 'traffic'}
                centerLabel={'Rohini\nSector 10'}
              />
            </div>

            <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/70">
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-xs font-extrabold text-slate-900">Explore Around You</h3>
                <button
                  type="button"
                  onClick={() => setMoreDrawerOpen(true)}
                  className="text-[10px] font-bold text-blue-600"
                >
                  See All ›
                </button>
              </div>
              <div className="grid grid-cols-6 gap-1.5 text-center">
                {[
                  { l: 'Restaurants', icon: '🍴', nav: 'businesses' as DashboardId },
                  { l: 'Cafes', icon: '☕', nav: 'businesses' as DashboardId },
                  { l: 'Shopping', icon: '🛍️', nav: 'products' as DashboardId },
                  { l: 'Parks', icon: '🌲', nav: 'map' as DashboardId },
                  { l: 'Fuel', icon: '⛽', nav: 'fuel-rates' as DashboardId },
                  { l: 'More', icon: '⋯', nav: 'services' as DashboardId },
                ].map((c) => (
                  <button
                    key={c.l}
                    type="button"
                    onClick={() => onNavigate(c.nav)}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-base">
                      {c.icon}
                    </div>
                    <span className="text-[9px] font-semibold text-slate-700 truncate w-full">{c.l}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div
                onClick={() => onNavigate('events')}
                className="cursor-pointer bg-white rounded-2xl p-2.5 shadow-xs border border-slate-200/70"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-extrabold text-slate-900">📅 Upcoming Events</span>
                  <span className="text-[9px] font-bold text-blue-600">See All ›</span>
                </div>
                <img
                  src="/assets/crops/event-summer-fest.webp"
                  alt="Rohini Summer Fest"
                  className="w-full h-16 rounded-lg object-cover mb-1.5"
                />
                <p className="text-[11px] font-extrabold text-slate-900 truncate">Rohini Summer Fest 2024</p>
                <p className="text-[9px] text-slate-500">📍 Sector 10, Rohini</p>
                <p className="text-[9px] text-slate-500">🕒 Today, 6:00 PM</p>
              </div>

              <div
                onClick={() => onNavigate('bulletins')}
                className="cursor-pointer bg-white rounded-2xl p-2.5 shadow-xs border border-slate-200/70"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-extrabold text-slate-900">📢 Civic Updates</span>
                  <span className="text-[9px] font-bold text-blue-600">See All ›</span>
                </div>
                <img
                  src="/assets/crops/civic-water.webp"
                  alt="Water supply"
                  className="w-full h-16 rounded-lg object-cover mb-1.5"
                />
                <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 text-[8px] font-extrabold">
                  WATER SUPPLY
                </span>
                <p className="text-[11px] font-extrabold text-slate-900 truncate mt-0.5">Planned Maintenance</p>
                <p className="text-[9px] text-slate-500 truncate">📍 Rohini Sec 8, 9, 10</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-2">
      <div className="relative w-[390px] sm:w-[412px] h-[845px] rounded-[52px] bg-[#141726] p-[11px] shadow-[0_25px_70px_-15px_rgba(15,23,42,0.45)] ring-2 ring-slate-700/70 select-none overflow-hidden">
        <div className="relative w-full h-full rounded-[42px] bg-[#F3F5FB] overflow-hidden flex flex-col">
          {fidelityMode === 'visual-guide' ? (
            <div className="relative w-full h-full overflow-y-auto no-scrollbar bg-[#0B1739]">
              <img
                src={`./assets/screens/${activeDashboard}-app-screen.webp`}
                alt={`${currentNav.label} Mobile App`}
                className="w-full h-auto block"
              />
              <button
                type="button"
                onClick={() => onNavigate('alerts')}
                className="absolute top-[5%] right-[16%] w-9 h-9 rounded-full bg-transparent hover:bg-white/15 transition"
                title="View Alerts"
              />
              <button
                type="button"
                onClick={() => setMoreDrawerOpen(true)}
                className="absolute top-[5%] right-[5%] w-9 h-9 rounded-full bg-transparent hover:bg-white/15 transition"
                title="Open All 18 Screens Drawer"
              />
              <div className="sticky bottom-0 left-0 right-0 h-16 grid grid-cols-5 bg-transparent">
                {bottomTabs.map((t) => (
                  <button
                    key={t.label}
                    type="button"
                    onClick={() => {
                      if (t.id === 'more') setMoreDrawerOpen(true);
                      else onNavigate(t.id);
                    }}
                    className="w-full h-full hover:bg-indigo-500/10 transition"
                    title={t.label}
                  />
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* iOS Status Bar (9:41 + Dynamic Island) */}
              <div className="bg-[#0D1B42] text-white px-6 pt-3 pb-2 flex items-center justify-between shrink-0 relative z-20">
                <span className="text-xs font-bold tracking-tight">9:41</span>
                <div className="w-24 h-5 rounded-full bg-black absolute left-1/2 -translate-x-1/2 top-2.5 flex items-center justify-end pr-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-950 border border-indigo-700/50" />
                </div>
                <div className="flex items-center gap-1.5">
                  <Signal className="w-3.5 h-3.5" />
                  <Wifi className="w-3.5 h-3.5" />
                  <BatteryFull className="w-4 h-4" />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
                {/* Dark Navy Mobile Header + Hero */}
                <div className="relative bg-gradient-to-b from-[#0D1B42] via-[#1B2B65] to-[#2A2968] text-white px-4 pt-1 pb-4 rounded-b-3xl shadow-md overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-lighten pointer-events-none"
                    style={{
                      backgroundImage: `url('./assets/crops/hero-art-${activeDashboard}.webp'), url('./assets/crops/hero-skyline-art.webp')`,
                    }}
                  />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-1.5">
                      <div
                        onClick={() => onNavigate('home')}
                        className="cursor-pointer flex items-center gap-1.5"
                      >
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-400 flex items-center justify-center">
                          <Sparkles className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-base font-extrabold tracking-tight">
                          MyArea<span className="text-indigo-300">24</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => onNavigate('weather')}
                          className="px-2 py-0.5 rounded-full bg-white/10 text-[11px] font-semibold flex items-center gap-1"
                        >
                          <Sun className="w-3 h-3 text-amber-300 fill-amber-300" /> 28°C
                        </button>
                        <button
                          type="button"
                          onClick={() => onNavigate('alerts')}
                          className="relative w-7 h-7 rounded-full bg-white/10 flex items-center justify-center"
                        >
                          <Bell className="w-3.5 h-3.5" />
                          <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1 right-1" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setMoreDrawerOpen(true)}
                          className="w-7 h-7 rounded-full bg-indigo-500 border border-white/40 text-xs font-extrabold flex items-center justify-center"
                        >
                          D
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-blue-100 mb-2.5">
                      <MapPin className="w-3 h-3 text-blue-300" />
                      <span className="font-medium">{selectedArea}</span>
                      <span>⌄</span>
                    </div>

                    <div className="flex items-center gap-1.5 mb-3">
                      <div className="flex-1 bg-white/95 text-slate-800 rounded-xl px-3 py-2 flex items-center gap-2 shadow-xs">
                        <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <input
                          type="text"
                          value={mobileSearch}
                          onChange={(e) => setMobileSearch(e.target.value)}
                          placeholder={currentNav.appSearchPlaceholder}
                          className="bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none w-full"
                        />
                        <Mic className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setMoreDrawerOpen(true)}
                        className="w-9 h-9 rounded-xl bg-white/95 text-slate-700 flex items-center justify-center shadow-xs shrink-0"
                      >
                        <SlidersHorizontal className="w-4 h-4" />
                      </button>
                    </div>

                    {activeDashboard === 'home' ? (
                      <div>
                        <p className="text-[11px] text-blue-100">Good Evening, Divyansh 👋</p>
                        <div className="flex items-start justify-between gap-2 mt-0.5">
                          <div>
                            <h2 className="text-xl font-extrabold leading-tight">
                              Your neighbourhood,
                              <br />
                              <span className="text-[#93C5FD]">in the know.</span>
                            </h2>
                            <p className="text-[10px] text-blue-100/90 mt-1 max-w-[220px]">
                              Live local signals and AI insights to help you make better decisions every day.
                            </p>
                          </div>
                          <div className="bg-slate-900/50 backdrop-blur border border-white/20 rounded-xl px-2.5 py-1.5 text-center shrink-0">
                            <p className="text-sm font-extrabold">28°C</p>
                            <p className="text-[9px] text-blue-200">Clear Sky</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 mt-3 overflow-x-auto no-scrollbar">
                          {[
                            { icon: '🚗', label: 'Traffic?', nav: 'traffic' as DashboardId },
                            { icon: '🌧️', label: 'Rain today?', nav: 'weather' as DashboardId },
                            { icon: '📅', label: 'Events?', nav: 'events' as DashboardId },
                          ].map((p) => (
                            <button
                              key={p.label}
                              type="button"
                              onClick={() => onNavigate(p.nav)}
                              className="px-2.5 py-1 rounded-full bg-white text-slate-800 text-[10px] font-bold flex items-center gap-1 shrink-0 shadow-xs"
                            >
                              <span>{p.icon}</span> {p.label}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => onNavigate('ai-assistant')}
                            className="px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[10px] font-bold flex items-center gap-1 shrink-0 shadow"
                          >
                            <Sparkles className="w-3 h-3" /> Ask AI
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h2 className="text-xl font-extrabold leading-tight">{currentNav.label}</h2>
                        <p className="text-[11px] text-blue-100/90 mt-0.5">
                          Real-time hyperlocal updates & AI intelligence for {selectedArea.split(',')[0]}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {renderMobileScreenBody()}
              </div>

              {/* 5-Tab Bottom Navigation Bar */}
              <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 pt-1.5 pb-4 z-30">
                <div className="grid grid-cols-5">
                  {bottomTabs.map((tab) => {
                    const isActive = tab.id === activeDashboard;
                    return (
                      <button
                        key={tab.label}
                        type="button"
                        onClick={() => {
                          if (tab.id === 'more') setMoreDrawerOpen(true);
                          else onNavigate(tab.id);
                        }}
                        className={`flex flex-col items-center justify-center gap-0.5 py-1 rounded-xl transition relative ${
                          isActive ? 'text-indigo-600 font-extrabold' : 'text-slate-400 hover:text-slate-700 font-medium'
                        }`}
                      >
                        <tab.icon className="w-4 h-4" />
                        <span className="text-[9px]">{tab.label}</span>
                        {tab.badge && (
                          <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1 right-5" />
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="w-28 h-1 rounded-full bg-slate-900/80 mx-auto mt-1.5" />
              </div>
            </>
          )}

          {moreDrawerOpen && (
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex flex-col justify-end">
              <div className="bg-white rounded-t-3xl p-4 max-h-[80%] overflow-y-auto">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">All 18 MyArea24 Screens</h3>
                    <p className="text-[10px] text-slate-500">Jump to any mobile app screen from the Visual Guide</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMoreDrawerOpen(false)}
                    className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {NAV_ITEMS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onNavigate(item.id);
                        setMoreDrawerOpen(false);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        activeDashboard === item.id
                          ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                          : 'bg-slate-50 text-slate-700 border-slate-200/70 hover:bg-indigo-50'
                      }`}
                    >
                      <p className="text-xs font-bold truncate">{item.label}</p>
                      <p
                        className={`text-[9px] capitalize mt-0.5 ${
                          activeDashboard === item.id ? 'text-indigo-200' : 'text-slate-400'
                        }`}
                      >
                        {item.section}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
