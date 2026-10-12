import React, { useState } from 'react';
import { DashboardId, ActionModalData, SavedEntry } from '../types';
import { NAV_ITEMS } from '../data/mockData';
import { InteractiveMap } from './InteractiveMap';
import { UserLocation } from './LocationPickerModal';
import {
  MapPin,
  Bell,
  Search,
  Mic,
  SlidersHorizontal,
  Sun,
  Sparkles,
  ChevronRight,
  ChevronDown,
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
  X,
  Plus,
  Send,
  Navigation,
} from 'lucide-react';

const ICON_MAP: Record<DashboardId, React.ElementType> = {
  home: Home,
  businesses: Store,
  products: Package,
  services: Wrench,
  offers: Tag,
  events: Calendar,
  intelligence: BarChart3,
  weather: Sun,
  'air-quality': Wind,
  traffic: Car,
  alerts: Bell,
  'ai-assistant': Bot,
  map: MapIcon,
  emergency: ShieldAlert,
  'market-rates': TrendingUp,
  'fuel-rates': Fuel,
  bulletins: FileText,
  saved: Heart,
};

const EXPLORE_IDS: DashboardId[] = ['businesses', 'products', 'services', 'offers', 'events'];

interface MobileAppViewProps {
  activeDashboard: DashboardId;
  onNavigate: (id: DashboardId) => void;
  onOpenModal: (data: ActionModalData) => void;
  onAskAi: (prompt: string) => void;
  savedIds: string[];
  savedEntries: SavedEntry[];
  onToggleSave: (entry: SavedEntry) => void;
  selectedArea: string;
  currentLocation: UserLocation;
  onOpenLocationPicker: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
}

export const MobileAppView: React.FC<MobileAppViewProps> = ({
  activeDashboard,
  onNavigate,
  onOpenModal,
  onAskAi,
  savedEntries,
  selectedArea,
  currentLocation,
  onOpenLocationPicker,
  onOpenNotifications,
  onOpenProfile,
}) => {
  const [moreDrawerOpen, setMoreDrawerOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState('');
  const [aiInput, setAiInput] = useState('');

  const currentNav = NAV_ITEMS.find((n) => n.id === activeDashboard) || NAV_ITEMS[0];
  const isExploreSection = EXPLORE_IDS.includes(activeDashboard);
  const isMoreSection =
    !['home', 'map', 'alerts'].includes(activeDashboard) && !isExploreSection;

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

      case 'map':
        return (
          <div className="p-3 space-y-3">
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
              {['All', '🍴 Food', '🏥 Hospitals', '🛍️ Shopping', '⛽ Fuel', '🏧 ATMs'].map((c, i) => (
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
            <div className="bg-white rounded-2xl p-2 shadow-xs border border-slate-200/70">
              <InteractiveMap
                heightClass="h-64"
                showLiveViewBadge
                showTrafficRoutes
                centerLabel={`${currentLocation.areaName}\nLive Map`}
              />
            </div>
            <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/70">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-extrabold text-slate-900">📍 Popular Places Around You</h4>
                <button
                  type="button"
                  onClick={() => onNavigate('businesses')}
                  className="text-[10px] font-bold text-blue-600"
                >
                  Explore All ›
                </button>
              </div>
              <div className="space-y-2">
                {[
                  { n: 'The Urban Chai Café', s: 'Café • Open Now', d: '800 m', img: './assets/crops/biz-card-chai.webp' },
                  { n: 'Bikanervala', s: 'Restaurant • Open Now', d: '1.2 km', img: './assets/crops/biz-card-bikanervala.webp' },
                  { n: 'Rohini Sports Complex', s: 'Sports & Park • Open', d: '1.5 km', img: './assets/crops/biz-sports-complex.webp' },
                ].map((pl) => (
                  <div
                    key={pl.n}
                    onClick={() =>
                      onOpenModal({
                        title: pl.n,
                        subtitle: pl.s,
                        category: 'Live Area Map Pin',
                        location: `${pl.d} from ${currentLocation.areaName}`,
                        description: 'Tap below to launch turn-by-turn navigation or view live crowd status.',
                        primaryActionLabel: 'Start Navigation',
                        image: pl.img,
                      })
                    }
                    className="cursor-pointer flex items-center justify-between gap-2.5 p-2 rounded-xl bg-slate-50 hover:bg-indigo-50/40 transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img src={pl.img} alt={pl.n} className="w-11 h-11 rounded-lg object-cover shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold text-slate-900 truncate">{pl.n}</p>
                        <p className="text-[10px] text-slate-500 truncate">{pl.s}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-bold shrink-0">
                      {pl.d} ›
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'alerts':
        return (
          <div className="p-3 space-y-3">
            <div className="p-3 rounded-2xl bg-gradient-to-r from-rose-600 to-orange-500 text-white shadow-sm">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-white/20 text-[9px] font-extrabold uppercase">
                  Critical Area Alert
                </span>
                <span className="text-[10px] text-rose-100">12 mins ago</span>
              </div>
              <h4 className="text-xs font-extrabold mt-1.5">
                Heavy Traffic & Waterlogging Near Madhuban Chowk Underpass
              </h4>
              <p className="text-[10px] text-rose-100 mt-0.5">
                Expect 15–20 min delay on Outer Ring Road. Use Sector 9 internal road as alternate route.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/70">
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-xs font-extrabold text-slate-900">
                  🔔 Active Alerts in {currentLocation.areaName}
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[9px] font-extrabold">
                  4 Active
                </span>
              </div>
              <div className="space-y-2">
                {[
                  {
                    t: 'Planned Water Supply Maintenance',
                    s: 'Sector 8, 9 & 10 • Tomorrow 10 AM – 2 PM',
                    b: 'Civic',
                    cls: 'bg-sky-50 text-sky-700',
                  },
                  {
                    t: 'High UV Index Advisory (UV 7)',
                    s: 'Peak sun hours 12 PM – 3 PM. Carry sunglasses & water.',
                    b: 'Weather',
                    cls: 'bg-amber-50 text-amber-700',
                  },
                  {
                    t: 'Metro Feeder Bus Route Diversion',
                    s: 'Due to Rohini Summer Fest near District Park Gate 2.',
                    b: 'Transit',
                    cls: 'bg-indigo-50 text-indigo-700',
                  },
                  {
                    t: 'Night Police Patrol & Beat Box Active',
                    s: 'Verified PCR van stationed near Sector 10 Main Market.',
                    b: 'Safety',
                    cls: 'bg-emerald-50 text-emerald-700',
                  },
                ].map((al) => (
                  <div
                    key={al.t}
                    className="p-2.5 rounded-xl border border-slate-200/70 flex items-start justify-between gap-2 bg-slate-50/50"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-slate-900">{al.t}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{al.s}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold shrink-0 ${al.cls}`}>
                      {al.b}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'weather':
        return (
          <div className="p-3 space-y-3">
            <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-200/70">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase">Current Conditions</span>
                  <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">28°C • Clear Sky</h3>
                  <p className="text-[11px] text-slate-500">Feels like 30°C • High 32° / Low 20°</p>
                </div>
                <Sun className="w-12 h-12 text-amber-400 fill-amber-400" />
              </div>
              <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-100 text-center">
                {[
                  ['💧 Humidity', '42%'],
                  ['🌬️ Wind', '12 km/h'],
                  ['☀️ UV Index', '6 Mod'],
                  ['🌧️ Rain', '10%'],
                ].map(([k, v]) => (
                  <div key={k} className="p-2 rounded-xl bg-slate-50">
                    <p className="text-[9px] text-slate-500">{k}</p>
                    <p className="text-xs font-extrabold text-slate-900 mt-0.5">{v}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/70">
              <h4 className="text-xs font-extrabold text-slate-900 mb-2">🕒 Hourly Forecast</h4>
              <div className="grid grid-cols-5 gap-1.5 text-center">
                {[
                  ['Now', '28°', '☀️'],
                  ['2 PM', '31°', '☀️'],
                  ['5 PM', '29°', '⛅'],
                  ['8 PM', '25°', '🌙'],
                  ['11 PM', '22°', '🌧️'],
                ].map(([t, d, ic]) => (
                  <div key={t} className="p-2 rounded-xl bg-slate-50">
                    <p className="text-[9px] text-slate-500 font-semibold">{t}</p>
                    <p className="text-base my-0.5">{ic}</p>
                    <p className="text-xs font-extrabold text-slate-900">{d}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'air-quality':
        return (
          <div className="p-3 space-y-3">
            <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-200/70 flex items-center gap-4">
              <div className="w-20 h-20 rounded-full border-8 border-emerald-500 flex flex-col items-center justify-center shrink-0">
                <span className="text-xl font-extrabold text-slate-900 leading-none">82</span>
                <span className="text-[10px] font-bold text-emerald-600">Good</span>
              </div>
              <div>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[9px] font-extrabold">
                  SATISFACTORY AIR
                </span>
                <h4 className="text-xs font-extrabold text-slate-900 mt-1">
                  Safe for outdoor walks & sports in {currentLocation.areaName}
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  PM2.5: 34 µg/m³ • PM10: 68 µg/m³
                </p>
              </div>
            </div>
          </div>
        );

      case 'traffic':
        return (
          <div className="p-3 space-y-3">
            <div className="bg-white rounded-2xl p-2 shadow-xs border border-slate-200/70">
              <InteractiveMap
                heightClass="h-52"
                showTrafficRoutes
                showLiveViewBadge
                centerLabel={`${currentLocation.areaName}\nLive Traffic`}
              />
            </div>
            <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/70 space-y-2">
              <h4 className="text-xs font-extrabold text-slate-900">🚗 Live Corridor Status</h4>
              {[
                ['Outer Ring Road (Madhuban Chowk)', '+14 min delay', 'text-rose-600 bg-rose-50'],
                ['Rithala Metro Station Road', 'Moderate (+5m)', 'text-amber-700 bg-amber-50'],
                ['Sector 10 Internal Market Road', 'Smooth Flow', 'text-emerald-700 bg-emerald-50'],
              ].map(([rd, st, cls]) => (
                <div key={rd} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-xs">
                  <span className="font-bold text-slate-800 truncate">{rd}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold shrink-0 ${cls}`}>{st}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'market-rates':
      case 'fuel-rates':
      case 'bulletins':
        return (
          <div className="p-3 space-y-3">
            <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/70 space-y-2">
              <h4 className="text-xs font-extrabold text-slate-900">
                {activeDashboard === 'fuel-rates'
                  ? '⛽ Today’s Fuel Rates in Delhi NCR'
                  : activeDashboard === 'market-rates'
                  ? '📈 Daily Mandi & Commodity Rates'
                  : '📢 Official Civic Bulletins'}
              </h4>
              {activeDashboard === 'fuel-rates'
                ? [
                    ['Petrol (1 L)', '₹94.72', 'No change'],
                    ['Diesel (1 L)', '₹87.62', 'No change'],
                    ['CNG (1 kg)', '₹74.09', '↓ ₹0.50'],
                    ['Domestic LPG (14.2 kg)', '₹803.00', 'Subsidized'],
                  ].map(([n, p, c]) => (
                    <div key={n} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                      <span className="text-xs font-bold text-slate-800">{n}</span>
                      <div className="text-right">
                        <p className="text-xs font-extrabold text-slate-900">{p}</p>
                        <p className="text-[9px] text-emerald-600 font-bold">{c}</p>
                      </div>
                    </div>
                  ))
                : activeDashboard === 'market-rates'
                ? [
                    ['🍅 Tomato (Hybrid)', '₹30 / kg', '↓ 15% today'],
                    ['🧅 Onion (Nashik)', '₹28 / kg', '↓ 10% today'],
                    ['🥔 Potato (Fresh)', '₹24 / kg', 'Stable'],
                    ['🥛 Amul Full Cream Milk', '₹66 / L', 'MRP'],
                  ].map(([n, p, c]) => (
                    <div key={n} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                      <span className="text-xs font-bold text-slate-800">{n}</span>
                      <div className="text-right">
                        <p className="text-xs font-extrabold text-slate-900">{p}</p>
                        <p className="text-[9px] text-emerald-600 font-bold">{c}</p>
                      </div>
                    </div>
                  ))
                : [
                    ['Water Supply Maintenance', 'Tomorrow 10 AM – 2 PM in Sec 9 & 10', 'DJB Notice'],
                    ['Free Dengue Checkup Camp', 'Sunday 9 AM at Sector 10 Dispensary', 'Health Dept'],
                    ['Solar Rooftop Subsidy Registration', 'Apply before 30th of this month', 'Civic Portal'],
                  ].map(([t, s, b]) => (
                    <div key={t} className="p-2.5 rounded-xl bg-slate-50 flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-extrabold text-slate-900">{t}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{s}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[9px] font-bold shrink-0">
                        {b}
                      </span>
                    </div>
                  ))}
            </div>
          </div>
        );

      default:
        // Default rich mobile view (Home & Intelligence Overview)
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
                  src="./assets/crops/ai-robot-umbrella.webp"
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
                    Rain is expected after 10 PM in {currentLocation.areaName} which may slow down traffic near Sector 10.
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
                  src="./assets/crops/event-summer-fest.webp"
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
                  src="./assets/crops/civic-water.webp"
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
    <div className="w-full min-h-screen bg-[#F3F5FB] flex flex-col pb-20 select-none">
      {/* Dark Navy Mobile Header + Hero */}
      <div className="relative bg-gradient-to-b from-[#0D1B42] via-[#1B2B65] to-[#2A2968] text-white px-4 pt-3.5 pb-4 rounded-b-3xl shadow-md overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-lighten pointer-events-none"
          style={{
            backgroundImage: `url('./assets/crops/hero-art-${activeDashboard}.webp'), url('./assets/crops/hero-skyline-art.webp')`,
          }}
        />
        <div className="relative z-10">
          {/* Top Bar: Logo + Weather + Bell + Profile */}
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="cursor-pointer flex items-center gap-1.5 text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-400 flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-extrabold tracking-tight">
                MyArea<span className="text-indigo-300">24</span>
              </span>
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate('weather')}
                className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-[11px] font-semibold flex items-center gap-1"
              >
                <Sun className="w-3.5 h-3.5 text-amber-300 fill-amber-300" /> 28°C
              </button>
              <button
                type="button"
                onClick={onOpenNotifications}
                className="relative w-7 h-7 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 flex items-center justify-center"
              >
                <Bell className="w-3.5 h-3.5" />
                <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1 right-1" />
              </button>
              <button
                type="button"
                onClick={onOpenProfile}
                className="w-7 h-7 rounded-full bg-indigo-500 border border-white/40 text-xs font-extrabold flex items-center justify-center"
              >
                D
              </button>
            </div>
          </div>

          {/* Blinkit / Uber Style Location Selector Pill */}
          <button
            type="button"
            onClick={onOpenLocationPicker}
            className="w-full mb-2.5 px-3 py-1.5 rounded-xl bg-slate-950/35 hover:bg-slate-950/50 border border-white/15 flex items-center justify-between gap-2 text-left transition"
          >
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-extrabold text-white">{currentLocation.label}</span>
                  <span className="text-[11px] font-semibold text-sky-300 truncate">
                    • {currentLocation.areaName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-blue-200 shrink-0" />
                </div>
                <p className="text-[10px] text-blue-100/75 truncate max-w-[240px]">
                  {currentLocation.fullAddress}
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-white/15 text-[10px] font-bold text-blue-100 shrink-0">
              Change ›
            </span>
          </button>

          {/* Search Bar + Quick More Trigger */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex-1 bg-white/95 text-slate-800 rounded-xl px-3 py-2 flex items-center gap-2 shadow-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={mobileSearch}
                onChange={(e) => setMobileSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && mobileSearch.trim()) {
                    onAskAi(mobileSearch);
                  }
                }}
                placeholder={currentNav.appSearchPlaceholder}
                className="bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none w-full"
              />
              <Mic className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </div>
            <button
              type="button"
              onClick={() => setMoreDrawerOpen(true)}
              className="w-9 h-9 rounded-xl bg-white/95 text-slate-700 flex items-center justify-center shadow-xs shrink-0"
              title="All Categories & Sections"
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
                  <p className="text-[10px] text-blue-100/90 mt-1 max-w-[230px]">
                    Live local signals and AI insights to help you make better decisions every day.
                  </p>
                </div>
                <div
                  onClick={() => onNavigate('weather')}
                  className="cursor-pointer bg-slate-900/50 backdrop-blur border border-white/20 rounded-xl px-2.5 py-1.5 text-center shrink-0"
                >
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
                Real-time hyperlocal updates & AI intelligence for {currentLocation.areaName}
              </p>
            </div>
          )}

          {/* Contextual Sub-Navigation Pills when browsing Explore sections */}
          {isExploreSection && (
            <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-white/15 overflow-x-auto no-scrollbar">
              {[
                { id: 'businesses' as DashboardId, label: 'Businesses', icon: '🏪' },
                { id: 'products' as DashboardId, label: 'Products', icon: '🛍️' },
                { id: 'services' as DashboardId, label: 'Services', icon: '🔧' },
                { id: 'offers' as DashboardId, label: 'Offers', icon: '🏷️' },
                { id: 'events' as DashboardId, label: 'Events', icon: '📅' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onNavigate(t.id)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 whitespace-nowrap transition ${
                    activeDashboard === t.id
                      ? 'bg-white text-indigo-950 shadow-xs'
                      : 'bg-white/10 text-blue-100 hover:bg-white/20'
                  }`}
                >
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Mobile Screen Body */}
      <div className="flex-1">{renderMobileScreenBody()}</div>

      {/* =====================================================================
          FIXED 5-BUTTON BOTTOM NAVIGATION BAR
          Strictly matches user's screenshot:
          Home | Map | Explore | Alerts (with red dot) | More
         ===================================================================== */}
      <nav
        aria-label="Mobile bottom navigation"
        className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(15,23,42,0.06)] px-2 py-1.5 z-40"
      >
        <div className="grid grid-cols-5 items-center max-w-md mx-auto">
          {/* 1. Home */}
          <button
            type="button"
            onClick={() => {
              setMoreDrawerOpen(false);
              onNavigate('home');
            }}
            className={`flex flex-col items-center justify-center py-1 gap-0.5 transition ${
              activeDashboard === 'home' && !moreDrawerOpen
                ? 'text-[#2563EB] font-extrabold'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <Home
              className={`w-5 h-5 ${
                activeDashboard === 'home' && !moreDrawerOpen ? 'stroke-[2.5]' : 'stroke-[1.8]'
              }`}
            />
            <span className="text-[11px] leading-tight">Home</span>
          </button>

          {/* 2. Map */}
          <button
            type="button"
            onClick={() => {
              setMoreDrawerOpen(false);
              onNavigate('map');
            }}
            className={`flex flex-col items-center justify-center py-1 gap-0.5 transition ${
              activeDashboard === 'map' && !moreDrawerOpen
                ? 'text-[#2563EB] font-extrabold'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <MapPin
              className={`w-5 h-5 ${
                activeDashboard === 'map' && !moreDrawerOpen ? 'stroke-[2.5]' : 'stroke-[1.8]'
              }`}
            />
            <span className="text-[11px] leading-tight">Map</span>
          </button>

          {/* 3. Explore */}
          <button
            type="button"
            onClick={() => {
              setMoreDrawerOpen(false);
              onNavigate(isExploreSection ? activeDashboard : 'businesses');
            }}
            className={`flex flex-col items-center justify-center py-1 gap-0.5 transition ${
              isExploreSection && !moreDrawerOpen
                ? 'text-[#2563EB] font-extrabold'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <Compass
              className={`w-5 h-5 ${
                isExploreSection && !moreDrawerOpen ? 'stroke-[2.5]' : 'stroke-[1.8]'
              }`}
            />
            <span className="text-[11px] leading-tight">Explore</span>
          </button>

          {/* 4. Alerts (with red notification dot) */}
          <button
            type="button"
            onClick={() => {
              setMoreDrawerOpen(false);
              onNavigate('alerts');
            }}
            className={`flex flex-col items-center justify-center py-1 gap-0.5 transition ${
              activeDashboard === 'alerts' && !moreDrawerOpen
                ? 'text-[#2563EB] font-extrabold'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <div className="relative">
              <Bell
                className={`w-5 h-5 ${
                  activeDashboard === 'alerts' && !moreDrawerOpen ? 'stroke-[2.5]' : 'stroke-[1.8]'
                }`}
              />
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute -top-0.5 -right-0.5 ring-2 ring-white" />
            </div>
            <span className="text-[11px] leading-tight">Alerts</span>
          </button>

          {/* 5. More (4-squares grid icon — opens drawer with all leftover sections) */}
          <button
            type="button"
            onClick={() => setMoreDrawerOpen((v) => !v)}
            className={`flex flex-col items-center justify-center py-1 gap-0.5 transition ${
              moreDrawerOpen || isMoreSection
                ? 'text-[#2563EB] font-extrabold'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <LayoutGrid
              className={`w-5 h-5 ${
                moreDrawerOpen || isMoreSection ? 'stroke-[2.5]' : 'stroke-[1.8]'
              }`}
            />
            <span className="text-[11px] leading-tight">More</span>
          </button>
        </div>
      </nav>

      {/* =====================================================================
          "MORE" CATEGORIZED BOTTOM SHEET DRAWER (All Leftover Sections)
         ===================================================================== */}
      {moreDrawerOpen && (
        <div
          onClick={() => setMoreDrawerOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex flex-col justify-end"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-t-3xl p-4 max-h-[82vh] overflow-y-auto pb-8 animate-in slide-in-from-bottom-5 duration-200"
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">More Sections & Services</h3>
                  <p className="text-[11px] text-slate-500">
                    All local discovery, intelligence & community tools
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMoreDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Location Bar inside More Drawer */}
            <div
              onClick={() => {
                setMoreDrawerOpen(false);
                onOpenLocationPicker();
              }}
              className="mb-4 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2 cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Navigation className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-extrabold text-slate-900">
                    {currentLocation.label} • {currentLocation.areaName}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">{currentLocation.fullAddress}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-bold shrink-0">
                Change ›
              </span>
            </div>

            <div className="space-y-4">
              {/* Explore & Local Commerce */}
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2 px-1">
                  Explore & Local Commerce
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {NAV_ITEMS.filter((i) => i.section === 'main' && i.id !== 'home').map((item) => {
                    const Icon = ICON_MAP[item.id];
                    const active = activeDashboard === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onNavigate(item.id);
                          setMoreDrawerOpen(false);
                        }}
                        className={`p-2.5 rounded-2xl border flex flex-col items-center text-center gap-1.5 transition ${
                          active
                            ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                            : 'bg-slate-50 text-slate-700 border-slate-200/70 hover:bg-indigo-50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[11px] font-bold leading-tight">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Local Intelligence */}
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2 px-1">
                  Neighbourhood Intelligence & AI
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {NAV_ITEMS.filter((i) => i.section === 'intelligence').map((item) => {
                    const Icon = ICON_MAP[item.id];
                    const active = activeDashboard === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onNavigate(item.id);
                          setMoreDrawerOpen(false);
                        }}
                        className={`p-2.5 rounded-2xl border flex flex-col items-center text-center gap-1.5 transition relative ${
                          active
                            ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                            : 'bg-slate-50 text-slate-700 border-slate-200/70 hover:bg-indigo-50'
                        }`}
                      >
                        {item.badge && (
                          <span className="absolute top-1.5 right-1.5 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[8px] font-extrabold">
                            {item.badge}
                          </span>
                        )}
                        <Icon className="w-4 h-4" />
                        <span className="text-[11px] font-bold leading-tight">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Community & Emergency */}
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2 px-1">
                  Community, Rates & Emergency
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {NAV_ITEMS.filter((i) => i.section === 'community').map((item) => {
                    const Icon = ICON_MAP[item.id];
                    const active = activeDashboard === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onNavigate(item.id);
                          setMoreDrawerOpen(false);
                        }}
                        className={`p-2.5 rounded-2xl border flex flex-col items-center text-center gap-1.5 transition ${
                          active
                            ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                            : 'bg-slate-50 text-slate-700 border-slate-200/70 hover:bg-indigo-50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[11px] font-bold leading-tight">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
