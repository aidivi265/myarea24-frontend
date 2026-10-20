import React, { useState } from 'react';
import { DashboardId, ActionModalData, SavedEntry } from '../types';
import { NAV_ITEMS } from '../data/mockData';
import { InteractiveMap } from './InteractiveMap';
import { UserLocation } from './LocationPickerModal';
import { LiveAreaIntelligence } from '../services/liveIntelligence';
import { LiveCommunityMarketplaceState } from '../services/communityMarketplaceService';
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
  ShoppingBag,
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
  liveIntel: LiveAreaIntelligence;
  marketplace?: LiveCommunityMarketplaceState;
  onOpenLocationPicker: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onSwitchToMerchant?: () => void;
  onAddToCart?: (item: any) => void;
  onBookService?: (service: any) => void;
  onOpenCart?: () => void;
  cartCount?: number;
}

export const MobileAppView: React.FC<MobileAppViewProps> = ({
  activeDashboard,
  onNavigate,
  onOpenModal,
  onAskAi,
  savedEntries,
  currentLocation,
  liveIntel,
  marketplace,
  onOpenLocationPicker,
  onOpenNotifications,
  onOpenProfile,
  onSwitchToMerchant,
  onAddToCart,
  onBookService,
  onOpenCart,
  cartCount,
}) => {
  const [moreDrawerOpen, setMoreDrawerOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState('');
  const [aiInput, setAiInput] = useState('');
  const [mobileBizCat, setMobileBizCat] = useState('All');
  const [mobileProdCat, setMobileProdCat] = useState('All');
  const [mobileSvcCat, setMobileSvcCat] = useState('All');
  const [mobileMapFilter, setMobileMapFilter] = useState('All');
  const { weather, airQuality, traffic, alerts, fuelRates, mandiRates, location } = liveIntel;
  const shortArea = currentLocation.areaName.split(',')[0]?.trim() || currentLocation.areaName;

  const currentNav = NAV_ITEMS.find((n) => n.id === activeDashboard) || NAV_ITEMS[0];
  const isExploreSection = EXPLORE_IDS.includes(activeDashboard);
  const isMoreSection =
    !['home', 'map', 'alerts'].includes(activeDashboard) && !isExploreSection;

  // Dedicated Mobile Body Renderer for all 18 screens matching Odd Pages (3..37) of the Visual Guide PDF
  const renderMobileScreenBody = () => {
    const baseLat = currentLocation.coords?.lat ?? 28.7041;
    const baseLng = currentLocation.coords?.lng ?? 77.1025;

    const allBiz = marketplace?.businesses && marketplace.businesses.length > 0 ? marketplace.businesses : [];
    const filteredBizSource = mobileBizCat === 'All'
      ? allBiz
      : allBiz.filter((b) => b.cat.toLowerCase().includes(mobileBizCat.toLowerCase()) || b.name.toLowerCase().includes(mobileBizCat.toLowerCase()));

    const liveBizList = filteredBizSource.slice(0, 6).map((b) => ({
      id: b.id,
      n: b.name,
      r: `${b.rating} (${b.reviews.replace(/[()]/g, '')})`,
      s: `${b.cat} • ${b.dist}`,
      img: b.img,
      status: b.status,
      phone: b.phone,
      address: b.address,
      lat: b.lat,
      lng: b.lng,
    }));

    const allProd = marketplace?.products && marketplace.products.length > 0 ? marketplace.products : [];
    const filteredProdSource = mobileProdCat === 'All'
      ? allProd
      : allProd.filter((p) => p.cat.toLowerCase().includes(mobileProdCat.toLowerCase()) || p.name.toLowerCase().includes(mobileProdCat.toLowerCase()));

    const liveProdList = filteredProdSource.slice(0, 6).map((p) => ({
      id: p.id,
      n: p.name,
      p: p.price,
      priceNum: p.localPriceNum,
      oldPrice: p.oldPrice,
      savings: p.savingsAmount > 0 ? `Save ₹${p.savingsAmount}` : undefined,
      s: `${p.store} • ${p.dist}`,
      img: p.img,
      storeAddress: p.storeAddress,
    }));

    const allSvc = marketplace?.services && marketplace.services.length > 0 ? marketplace.services : [];
    const filteredSvcSource = mobileSvcCat === 'All'
      ? allSvc
      : allSvc.filter((s) => s.cat.toLowerCase().includes(mobileSvcCat.toLowerCase()) || s.name.toLowerCase().includes(mobileSvcCat.toLowerCase()));

    const liveSvcList = filteredSvcSource.slice(0, 6).map((s) => ({
      id: s.id,
      n: s.name,
      p: s.price,
      r: `${s.rating} (${s.reviews.replace(/[()]/g, '')})`,
      cat: s.cat,
      img: s.img,
      dist: s.dist,
      phone: s.phone,
    }));

    const liveOfferList = marketplace?.offers && marketplace.offers.length > 0
      ? marketplace.offers.slice(0, 6).map((o) => ({
          id: o.id,
          b: o.store,
          off: o.badge,
          t: o.title,
          sub: o.sub,
          code: o.code,
          valid: o.valid,
          img: o.img,
        }))
      : [];

    const liveEventList = marketplace?.events && marketplace.events.length > 0
      ? marketplace.events.slice(0, 6).map((e) => ({
          id: e.id,
          dt: e.date,
          t: e.title,
          loc: e.loc,
          cat: e.cat,
          img: e.img,
          dist: e.dist,
          organizer: e.organizer,
        }))
      : [];

    switch (activeDashboard) {
      case 'businesses':
        return (
          <div className="p-3 space-y-3">
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
              {[
                { label: 'All', key: 'All' },
                { label: '🍴 Restaurants', key: 'Restaurant' },
                { label: '☕ Cafes', key: 'Cafe' },
                { label: '🛍️ Shopping', key: 'Shopping' },
                { label: '💊 Chemist', key: 'Pharmacy' },
              ].map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setMobileBizCat(c.key)}
                  className={`px-3 py-1 rounded-xl text-[10px] font-bold whitespace-nowrap cursor-pointer transition ${
                    mobileBizCat === c.key
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <InteractiveMap
              heightClass="h-36"
              centerLabel={shortArea}
              coords={currentLocation.coords}
              pins={liveBizList.map((b) => ({
                id: b.id,
                label: b.n,
                sublabel: b.s,
                color: 'blue',
                lat: b.lat,
                lng: b.lng,
              }))}
            />
            <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/70">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-extrabold text-slate-900">⭐ Popular Near You ({shortArea})</h4>
                <span onClick={() => onNavigate('map')} className="text-[10px] font-bold text-blue-600 cursor-pointer">View Map ›</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {liveBizList.length > 0 ? (
                  liveBizList.slice(0, 3).map((b) => (
                    <div
                      key={b.n}
                      onClick={() =>
                        onOpenModal({
                          title: b.n,
                          subtitle: b.s,
                          category: 'Local Neighborhood Business',
                          rating: b.r,
                          location: b.address,
                          description: `Verified merchant serving ${shortArea}. Call ${b.phone} or visit in-store.`,
                          primaryActionLabel: 'Call Store',
                          image: b.img,
                        })
                      }
                      className="rounded-xl border border-slate-200/80 overflow-hidden bg-white cursor-pointer active:scale-98 transition"
                    >
                      <div className="relative h-16">
                        <img src={b.img} alt={b.n} className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.2 rounded bg-emerald-500 text-white text-[8px] font-bold">
                          {b.status || 'Open'}
                        </span>
                      </div>
                      <div className="p-1.5">
                        <p className="text-[10px] font-extrabold text-slate-900 truncate">{b.n}</p>
                        <p className="text-[9px] text-amber-600 font-bold">★ {b.r}</p>
                        <p className="text-[8px] text-slate-500 truncate">{b.s}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 py-6 text-center text-slate-400 text-xs">
                    No businesses found in active radius around {shortArea}
                  </div>
                )}
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
              {[
                { label: 'All', key: 'All' },
                { label: '🧺 Groceries', key: 'Groceries' },
                { label: '🍎 Fruits & Veg', key: 'Fruit' },
                { label: '🥛 Dairy', key: 'Dairy' },
                { label: '💊 Medicines', key: 'Medicine' },
              ].map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setMobileProdCat(c.key)}
                  className={`px-3 py-1 rounded-xl text-[10px] font-bold whitespace-nowrap cursor-pointer transition ${
                    mobileProdCat === c.key
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/70">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-extrabold text-slate-900">🔥 Live Deals & Products in {shortArea}</h4>
                <span onClick={() => onOpenCart?.()} className="text-[10px] font-bold text-blue-600 cursor-pointer">View Cart ({cartCount || 0}) ›</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {liveProdList.length > 0 ? (
                  liveProdList.slice(0, 3).map((p) => (
                    <div key={p.n} className="rounded-xl border border-slate-200/80 p-2 bg-white flex flex-col justify-between">
                      <div>
                        <div className="relative">
                          <img src={p.img} alt={p.n} className="w-full h-14 object-contain mb-1" />
                          {p.savings && (
                            <span className="absolute top-0 right-0 px-1 py-0.2 rounded bg-emerald-600 text-white text-[7px] font-black">
                              {p.savings}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] font-extrabold text-slate-900 truncate">{p.n}</p>
                        <div className="flex items-center gap-1">
                          <p className="text-xs font-extrabold text-indigo-700">{p.p}</p>
                          {p.oldPrice && (
                            <p className="text-[9px] text-slate-400 line-through">{p.oldPrice}</p>
                          )}
                        </div>
                        <p className="text-[8px] text-slate-500 truncate">📍 {p.s}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          onAddToCart?.({
                            id: p.id,
                            name: p.n,
                            price: p.priceNum,
                            oldPrice: p.oldPrice,
                            image: p.img,
                            store: p.s.split('•')[0]?.trim() || 'Local Store',
                            dist: p.s.split('•')[1]?.trim() || 'Nearby',
                            quantity: 1,
                          })
                        }
                        className="mt-1.5 w-full py-1 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white text-[9px] font-extrabold transition cursor-pointer flex items-center justify-center gap-0.5 active:scale-95"
                      >
                        <Plus className="w-2.5 h-2.5" /> Add
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 py-6 text-center text-slate-400 text-xs">
                    No products cataloged in {shortArea} yet.
                  </div>
                )}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/70">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-extrabold text-slate-900">🏪 Nearby Stores</h4>
                <span onClick={() => onNavigate('businesses')} className="text-[10px] font-bold text-blue-600 cursor-pointer">See All ›</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {liveBizList.length > 0 ? (
                  liveBizList.slice(0, 3).map((st) => (
                    <div
                      key={st.n}
                      onClick={() => onNavigate('businesses')}
                      className="rounded-xl border border-slate-200/80 overflow-hidden bg-white cursor-pointer"
                    >
                      <img src={st.img} alt={st.n} className="w-full h-14 object-cover" />
                      <div className="p-1.5">
                        <p className="text-[10px] font-extrabold text-slate-900 truncate">{st.n}</p>
                        <p className="text-[9px] text-amber-600 font-bold">★ {st.r}</p>
                        <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 text-[8px] font-bold">
                          {st.status || 'Open'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 py-4 text-center text-slate-400 text-[11px]">
                    Stores will appear as merchants register in {shortArea}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'services':
        return (
          <div className="p-3 space-y-3">
            <div className="grid grid-cols-6 gap-1.5 text-center bg-white p-2.5 rounded-2xl border border-slate-200/70">
              {[
                ['⊞', 'All', 'All'],
                ['🔧', 'Repairs', 'Repair'],
                ['🧹', 'Cleaning', 'Cleaning'],
                ['⚡', 'Electrical', 'Electric'],
                ['🚰', 'Plumbing', 'Plumb'],
                ['✂️', 'Beauty', 'Beauty'],
              ].map(([ic, l, k]) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setMobileSvcCat(k)}
                  className="flex flex-col items-center gap-1 cursor-pointer group"
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm transition ${
                      mobileSvcCat === k
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    {ic}
                  </div>
                  <span
                    className={`text-[8px] font-bold ${
                      mobileSvcCat === k ? 'text-blue-600' : 'text-slate-700'
                    }`}
                  >
                    {l}
                  </span>
                </button>
              ))}
            </div>
            <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/70">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-extrabold text-slate-900">⭐ Popular Services in {shortArea}</h4>
                <span onClick={() => onNavigate('services')} className="text-[10px] font-bold text-blue-600 cursor-pointer">See All ›</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {liveSvcList.length > 0 ? (
                  liveSvcList.slice(0, 3).map((s) => (
                    <div key={s.id || s.n} className="rounded-xl border border-slate-200/80 overflow-hidden bg-white p-1.5 flex flex-col justify-between">
                      <div>
                        <img src={s.img} alt={s.n} className="w-full h-14 rounded-lg object-cover mb-1" />
                        <p className="text-[10px] font-extrabold text-slate-900 truncate">{s.n}</p>
                        <p className="text-[9px] text-amber-600 font-bold">★ {s.r}</p>
                        <p className="text-[10px] font-extrabold text-slate-900">{s.p}</p>
                        {s.dist && <p className="text-[8px] text-slate-500 truncate">📍 {s.dist}</p>}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (onBookService) {
                            onBookService({
                              name: s.n,
                              price: s.p,
                              rating: s.r,
                              cat: s.cat || 'Verified Local Services',
                              img: s.img,
                            });
                          } else {
                            onOpenModal({
                              title: s.n,
                              category: 'Mobile Instant Booking',
                              price: s.p,
                              description: `Verified professional ready for doorstep visit in ${shortArea}. Contact: ${s.phone || 'Available'}`,
                              primaryActionLabel: 'Confirm Booking',
                              image: s.img,
                            });
                          }
                        }}
                        className="mt-1 w-full py-1 rounded bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white text-[9px] font-bold transition cursor-pointer"
                      >
                        Book Now
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 py-6 text-center text-slate-400 text-xs">
                    No services listed in {shortArea} yet.
                  </div>
                )}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/70">
              <h4 className="text-xs font-extrabold text-slate-900 mb-2">🛡️ Top Rated Professionals</h4>
              {liveSvcList.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {liveSvcList.slice(0, 3).map((pro) => (
                    <div key={pro.n} className="p-2 rounded-xl bg-slate-50 text-center">
                      <img src={pro.img} alt={pro.n} className="w-10 h-10 rounded-full object-cover mx-auto mb-1" />
                      <p className="text-[9px] font-extrabold text-slate-900 truncate">{pro.n}</p>
                      <p className="text-[8px] text-amber-600 font-bold">★ {pro.r}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 py-3 text-center">
                  Verified technicians will appear once onboarded in {shortArea}
                </p>
              )}
            </div>
          </div>
        );

      case 'offers':
        return (
          <div className="p-3 space-y-3">
            <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/70">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-extrabold text-slate-900">🔥 Trending Offers in {shortArea}</h4>
                <span onClick={() => onNavigate('offers')} className="text-[10px] font-bold text-blue-600 cursor-pointer">See All ›</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {liveOfferList.length > 0 ? (
                  liveOfferList.slice(0, 3).map((o) => (
                    <div
                      key={o.id || o.b}
                      onClick={() =>
                        onOpenModal({
                          title: o.t,
                          subtitle: `${o.b} • Code: ${o.code}`,
                          category: 'Exclusive Neighborhood Deal',
                          description: `Use promo code ${o.code} at ${o.b}. Valid for next few days. ${o.sub || ''}`,
                          primaryActionLabel: `Claim Offer (${o.code})`,
                          image: o.img,
                        })
                      }
                      className="rounded-xl border border-slate-200/80 overflow-hidden bg-white p-1.5 cursor-pointer active:scale-95 transition"
                    >
                      <div className="relative h-14 mb-1">
                        <img src={o.img} alt={o.b} className="w-full h-full rounded-lg object-cover" />
                        <span className="absolute top-1 left-1 px-1.5 py-0.2 rounded bg-rose-600 text-white text-[8px] font-bold">
                          {o.off}
                        </span>
                      </div>
                      <p className="text-[9px] font-bold text-slate-500 truncate">{o.b}</p>
                      <p className="text-[10px] font-extrabold text-slate-900 line-clamp-2">{o.t}</p>
                      {o.code && (
                        <span className="mt-1 inline-block px-1 py-0.2 bg-amber-50 text-amber-800 border border-amber-200 rounded text-[7px] font-mono font-bold">
                          {o.code}
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 py-6 text-center text-slate-400 text-xs">
                    No active offers in {shortArea} right now
                  </div>
                )}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/70">
              <h4 className="text-xs font-extrabold text-slate-900 mb-2">🕒 Limited Time Offers</h4>
              {liveOfferList.length > 3 ? (
                <div className="grid grid-cols-3 gap-2">
                  {liveOfferList.slice(3, 6).map((lim) => (
                    <div
                      key={lim.b}
                      onClick={() =>
                        onOpenModal({
                          title: lim.t || lim.b,
                          subtitle: `${lim.b} • Promo Offer`,
                          category: 'Exclusive Neighborhood Deal',
                          description: `Limited-time offer from ${lim.b} in ${shortArea}. ${lim.off} discount.`,
                          primaryActionLabel: `Claim Offer`,
                          image: lim.img,
                        })
                      }
                      className="rounded-xl border border-slate-200/80 overflow-hidden bg-white p-1.5 cursor-pointer active:scale-95 transition"
                    >
                      <img src={lim.img} alt={lim.b} className="w-full h-12 rounded-lg object-cover mb-1" />
                      <p className="text-[10px] font-extrabold text-slate-900 truncate">{lim.b}</p>
                      <p className="text-[10px] font-extrabold text-rose-600">{lim.off}</p>
                      <p className="text-[8px] text-slate-400">{lim.valid}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 py-3 text-center">
                  Storefront promotional deals will appear here
                </p>
              )}
            </div>
          </div>
        );

      case 'events':
        return (
          <div className="p-3 space-y-3">
            <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/70">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-extrabold text-slate-900">⭐ Featured Events in {shortArea}</h4>
                <span onClick={() => onNavigate('events')} className="text-[10px] font-bold text-blue-600 cursor-pointer">See All ›</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {liveEventList.length > 0 ? (
                  liveEventList.slice(0, 3).map((ev) => (
                    <div
                      key={ev.id || ev.t}
                      onClick={() =>
                        onOpenModal({
                          title: ev.t,
                          subtitle: `${ev.dt} • ${ev.loc}`,
                          category: ev.cat || 'Neighborhood Community Event',
                          description: `Organized by ${ev.organizer || 'Community Council'}. Free admission for local residents of ${shortArea}.`,
                          primaryActionLabel: 'RSVP / Register',
                          image: ev.img,
                        })
                      }
                      className="rounded-xl border border-slate-200/80 overflow-hidden bg-white p-1.5 cursor-pointer active:scale-95 transition"
                    >
                      <img src={ev.img} alt={ev.t} className="w-full h-14 rounded-lg object-cover mb-1" />
                      <span className="text-[8px] font-extrabold text-blue-600">{ev.dt}</span>
                      <p className="text-[10px] font-extrabold text-slate-900 line-clamp-1">{ev.t}</p>
                      <p className="text-[8px] text-slate-500 truncate">📍 {ev.loc}</p>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 py-6 text-center text-slate-400 text-xs font-medium">
                    No community events scheduled in {shortArea} right now
                  </div>
                )}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/70">
              <h4 className="text-xs font-extrabold text-slate-900 mb-2">📅 Upcoming Events</h4>
              <div className="space-y-2">
                {liveEventList.slice(3, 8).length > 0 ? (
                  liveEventList.slice(3, 8).map((u) => (
                    <div
                      key={u.id || u.t}
                      onClick={() =>
                        onOpenModal({
                          title: u.t,
                          subtitle: `${u.dt} • ${u.loc}`,
                          category: u.cat || 'Community Event',
                          description: `Community event in ${shortArea}.`,
                          primaryActionLabel: 'RSVP / Register',
                          image: u.img,
                        })
                      }
                      className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-slate-50 cursor-pointer hover:bg-slate-100 transition"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[9px] font-extrabold text-rose-500 w-8 text-center">{u.dt}</span>
                        <img src={u.img} alt={u.t} className="w-10 h-8 rounded object-cover shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] font-extrabold text-slate-900 truncate">{u.t}</p>
                          <p className="text-[9px] text-slate-500 truncate">{u.loc}</p>
                        </div>
                      </div>
                      <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 text-[8px] font-bold">
                        {(u as any).price || 'Free'}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-3 text-center">No additional upcoming events this week</p>
                )}
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

      case 'intelligence':
        return (
          <div className="p-3 space-y-3">
            {/* Live Neighborhood Livability Score Card */}
            <div className="bg-gradient-to-br from-[#0F172A] to-[#1E1B4B] text-white rounded-2xl p-3.5 shadow-sm flex items-center gap-3.5">
              <div className="w-16 h-16 rounded-full border-4 border-emerald-400 flex flex-col items-center justify-center shrink-0">
                <span className="text-xl font-extrabold leading-none">{liveIntel.safetyScore}</span>
                <span className="text-[8px] font-bold text-emerald-300 mt-0.5">/ 100</span>
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-sky-300">
                  Neighbourhood Livability Score
                </span>
                <h4 className="text-xs font-extrabold text-white mt-0.5">{liveIntel.safetyVerdict}</h4>
                <p className="text-[10px] text-slate-300 mt-0.5">
                  Synthesized from {weather.temperatureC}°C, AQI {airQuality.aqiValue} & {traffic.congestionLevel} traffic
                </p>
              </div>
            </div>

            {/* Citizen Activity Verdicts ("Should I Step Out?") */}
            <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/70 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-slate-900">
                  🧭 “Should I Step Out?” Verdicts
                </h4>
                <span className="text-[9px] font-bold text-emerald-600">● Cross-Signal</span>
              </div>
              {[
                {
                  icon: '🏃',
                  act: 'Park Walk & Outdoor Jog',
                  verdict: airQuality.aqiValue > 180 ? 'AVOID' : airQuality.aqiValue > 115 ? 'CAUTION' : 'GO',
                  cls:
                    airQuality.aqiValue > 180
                      ? 'bg-rose-100 text-rose-700'
                      : airQuality.aqiValue > 115
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800',
                  sub: `AQI ${airQuality.aqiValue} (${airQuality.aqiCategory}) • ${weather.temperatureC}°C`,
                },
                {
                  icon: '🛵',
                  act: 'Two-Wheeler Commute',
                  verdict: weather.precipitationMm > 1 ? 'AVOID' : weather.chanceOfRain >= 45 ? 'CAUTION' : 'GO',
                  cls:
                    weather.precipitationMm > 1
                      ? 'bg-rose-100 text-rose-700'
                      : weather.chanceOfRain >= 45
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800',
                  sub: `Wind ${weather.windKph} km/h • Rain ${weather.chanceOfRain}%`,
                },
                {
                  icon: '🚇',
                  act: 'Office Commute (Road vs Metro)',
                  verdict:
                    traffic.congestionLevel === 'Heavy' || traffic.congestionLevel === 'Severe'
                      ? 'TAKE METRO'
                      : 'GO BY ROAD',
                  cls:
                    traffic.congestionLevel === 'Heavy' || traffic.congestionLevel === 'Severe'
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-emerald-100 text-emerald-800',
                  sub: `Corridors at ${traffic.averageSpeedKmh} km/h (${traffic.congestionLevel})`,
                },
                {
                  icon: '👶',
                  act: 'Kids & Senior Citizen Outing',
                  verdict: airQuality.aqiValue > 140 || weather.uvIndex >= 7 ? 'CAUTION' : 'GO',
                  cls:
                    airQuality.aqiValue > 140 || weather.uvIndex >= 7
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800',
                  sub: `UV Index ${weather.uvIndex} • Feels like ${weather.feelsLikeC}°C`,
                },
              ].map((v) => (
                <div
                  key={v.act}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base">{v.icon}</span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-extrabold text-slate-900 truncate">{v.act}</p>
                      <p className="text-[9px] text-slate-500 truncate">{v.sub}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold shrink-0 ${v.cls}`}>
                    {v.verdict}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'emergency':
        return (
          <div className="p-3 space-y-3">
            <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/70">
              <h4 className="text-xs font-extrabold text-slate-900 mb-2">⚡ 1-Tap SOS Dispatch ({shortArea})</h4>
              <div className="grid grid-cols-5 gap-1.5 text-center">
                {[
                  ['📞', 'Call 112', '112', 'bg-rose-600 text-white'],
                  ['🚑', '108 Med', '108', 'bg-blue-600 text-white'],
                  ['🛡️', '100 Police', '100', 'bg-indigo-600 text-white'],
                  ['🚒', '101 Fire', '101', 'bg-orange-500 text-white'],
                  ['🆘', '1091 Women', '1091', 'bg-purple-600 text-white'],
                ].map(([ic, l, num, cls]) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() =>
                      onOpenModal({
                        title: `Emergency Dispatch: ${l}`,
                        category: '24x7 Priority SOS',
                        phone: num,
                        location: `${currentLocation.areaName} (${location.lat.toFixed(4)}°N, ${location.lng.toFixed(4)}°E)`,
                        description: `Connecting immediately with live GPS coordinates (${location.lat.toFixed(
                          4
                        )}°N, ${location.lng.toFixed(4)}°E) in ${currentLocation.areaName}.`,
                        primaryActionLabel: `Dial ${num} Now`,
                      })
                    }
                    className={`${cls} p-2 rounded-xl flex flex-col items-center gap-1 cursor-pointer`}
                  >
                    <span className="text-base">{ic}</span>
                    <span className="text-[8px] font-extrabold leading-tight">{l}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/70">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-extrabold text-slate-900">
                  🏥 Verified Hospitals & Police Near {shortArea}
                </h4>
                <span className="text-[9px] font-bold text-emerald-600">● Live OSM</span>
              </div>
              <div className="space-y-2 text-xs">
                {liveIntel.nearbyPois.slice(0, 4).map((poi) => (
                  <div
                    key={poi.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <div className="min-w-0">
                      <p className="text-[11px] font-extrabold text-slate-900 truncate">{poi.name}</p>
                      <p className="text-[9px] text-slate-500 truncate">
                        {poi.distanceKm} km away • {poi.category.toUpperCase()}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        onOpenModal({
                          title: poi.name,
                          subtitle: poi.category.toUpperCase(),
                          category: 'Emergency Responder Dispatch',
                          phone: poi.phone,
                          address: poi.address,
                          location: `${poi.distanceKm} km from ${currentLocation.areaName}`,
                          description: `${poi.distanceKm} km from ${currentLocation.areaName}. Tap below to call immediately.`,
                          primaryActionLabel: `Call ${poi.phone}`,
                        })
                      }
                      className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white text-[10px] font-extrabold shrink-0 cursor-pointer transition"
                    >
                      📞 {poi.phone}
                    </button>
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
                    <div
                      key={st.id}
                      onClick={() =>
                        onOpenModal({
                          title: st.title,
                          subtitle: st.subtitle,
                          category: 'Saved Fuel Station',
                          price: `Petrol ${st.priceOrStatus}`,
                          description: 'Saved fuel station in your area with live pricing and route guidance.',
                          primaryActionLabel: 'Start Directions',
                          image: st.image,
                        })
                      }
                      className="rounded-xl border border-slate-200/80 overflow-hidden bg-white p-1.5 cursor-pointer active:scale-95 transition"
                    >
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
                    <div
                      key={pr.id}
                      onClick={() =>
                        onOpenModal({
                          title: `${pr.subtitle} (${pr.title})`,
                          category: 'Saved Property Listing',
                          description: `${pr.meta}. Verified property listing.`,
                          primaryActionLabel: 'Contact Owner',
                          image: pr.image,
                        })
                      }
                      className="rounded-xl border border-slate-200/80 overflow-hidden bg-white p-1.5 cursor-pointer active:scale-95 transition"
                    >
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
              {['All', '🍴 Food', '🏥 Hospitals', '🛍️ Shopping', '⛽ Fuel', '🏧 ATMs'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setMobileMapFilter(c)}
                  className={`px-3 py-1 rounded-xl text-[10px] font-bold whitespace-nowrap cursor-pointer transition ${
                    mobileMapFilter === c
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="bg-white rounded-2xl p-2 shadow-xs border border-slate-200/70">
              <InteractiveMap
                heightClass="h-64"
                coords={{ lat: location.lat, lng: location.lng }}
                showLiveViewBadge
                showTrafficRoutes
                centerLabel={`${shortArea}\nLive Map`}
              />
            </div>
            <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/70">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-extrabold text-slate-900">📍 Verified Places Around {shortArea}</h4>
                <button
                  type="button"
                  onClick={() => onNavigate('businesses')}
                  className="text-[10px] font-bold text-blue-600"
                >
                  Explore All ›
                </button>
              </div>
              <div className="space-y-2">
                {liveIntel.nearbyPois.slice(0, 3).map((pl) => (
                  <div
                    key={pl.id}
                    onClick={() =>
                      onOpenModal({
                        title: pl.name,
                        subtitle: `${pl.category.toUpperCase()} • ${pl.address}`,
                        category: 'Live Area Map Pin',
                        location: `${pl.distanceKm} km from ${currentLocation.areaName}`,
                        description: 'Tap below to launch turn-by-turn navigation.',
                        primaryActionLabel: 'Start Navigation',
                      })
                    }
                    className="cursor-pointer flex items-center justify-between gap-2.5 p-2 rounded-xl bg-slate-50 hover:bg-indigo-50/40 transition"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-slate-900 truncate">{pl.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {pl.category.toUpperCase()} • {pl.address}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-bold shrink-0">
                      {pl.distanceKm} km ›
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'alerts':
      case 'bulletins':
        return (
          <div className="p-3 space-y-3">
            {alerts[0] && (
              <div className="p-3 rounded-2xl bg-gradient-to-r from-rose-600 to-orange-500 text-white shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-white/20 text-[9px] font-extrabold uppercase">
                    {alerts[0].severity} • {alerts[0].category}
                  </span>
                  <span className="text-[10px] text-rose-100">{alerts[0].timeAgo}</span>
                </div>
                <h4 className="text-xs font-extrabold mt-1.5">{alerts[0].title}</h4>
                <p className="text-[10px] text-rose-100 mt-0.5">{alerts[0].description}</p>
              </div>
            )}

            <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/70">
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-xs font-extrabold text-slate-900">
                  🔔 Official Alerts & Civic Notices ({shortArea})
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[9px] font-extrabold">
                  Live Feed
                </span>
              </div>
              <div className="space-y-2">
                {alerts.map((al) => (
                  <div
                    key={al.id}
                    className="p-2.5 rounded-xl border border-slate-200/70 flex items-start justify-between gap-2 bg-slate-50/50"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-slate-900">
                        {al.icon} {al.title}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{al.description}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold shrink-0 ${al.badgeClass}`}>
                      {al.category}
                    </span>
                  </div>
                ))}
                <div className="p-2.5 rounded-xl border border-slate-200/70 flex items-start justify-between gap-2 bg-blue-50/40">
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-slate-900">
                      🚰 Municipal Water & Power Schedule ({shortArea})
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Normal pressure in morning slot; routine feeder inspection scheduled by local utility.
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-extrabold shrink-0 bg-blue-100 text-blue-700">
                    Civic
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'weather':
      case 'air-quality':
        return (
          <div className="p-3 space-y-3">
            {/* Unified Weather + CPCB Air Quality Card */}
            <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-200/70">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase">
                    Live Weather & Air • {shortArea}
                  </span>
                  <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">
                    {weather.temperatureC}°C • {weather.conditionText}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Feels like {weather.feelsLikeC}°C • High {weather.maxTempC}° / Low {weather.minTempC}°
                  </p>
                </div>
                <Sun className="w-12 h-12 text-amber-400 fill-amber-400" />
              </div>
              <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-100 text-center">
                {[
                  ['💧 Humidity', `${weather.humidity}%`],
                  ['🌬️ Wind', `${weather.windKph} km/h`],
                  ['☀️ UV Index', `${weather.uvIndex}`],
                  ['🌧️ Rain', `${weather.chanceOfRain}%`],
                ].map(([k, v]) => (
                  <div key={k} className="p-2 rounded-xl bg-slate-50">
                    <p className="text-[9px] text-slate-500">{k}</p>
                    <p className="text-xs font-extrabold text-slate-900 mt-0.5">{v}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Official CPCB 2014 NAQI Section */}
            <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-200/70 flex items-center gap-4">
              <div
                style={{ borderColor: airQuality.ringHex }}
                className="w-20 h-20 rounded-full border-8 flex flex-col items-center justify-center shrink-0"
              >
                <span className="text-xl font-extrabold text-slate-900 leading-none">{airQuality.aqiValue}</span>
                <span className={`text-[10px] font-bold ${airQuality.colorText}`}>{airQuality.aqiCategory}</span>
              </div>
              <div>
                <span className={`px-2 py-0.5 rounded ${airQuality.colorBg} ${airQuality.colorText} text-[9px] font-extrabold`}>
                  CPCB NAQI • {airQuality.prominentPollutant}
                </span>
                <h4 className="text-xs font-extrabold text-slate-900 mt-1">{airQuality.healthAdvice}</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {airQuality.pollutants
                    .slice(0, 3)
                    .map((p) => `${p.name}: ${p.value} ${p.unit}`)
                    .join(' • ')}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/70">
              <h4 className="text-xs font-extrabold text-slate-900 mb-2">🕒 Live Hourly Forecast</h4>
              <div className="grid grid-cols-5 gap-1.5 text-center">
                {weather.hourly.slice(0, 5).map((h, i) => (
                  <div key={`${h.timeLabel}-${i}`} className="p-2 rounded-xl bg-slate-50">
                    <p className="text-[9px] text-slate-500 font-semibold">{h.timeLabel}</p>
                    <p className="text-base my-0.5">{h.emoji}</p>
                    <p className="text-xs font-extrabold text-slate-900">{h.tempC}°</p>
                  </div>
                ))}
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
                coords={{ lat: location.lat, lng: location.lng }}
                showTrafficRoutes
                showLiveViewBadge
                centerLabel={`${shortArea}\n${traffic.averageSpeedKmh} km/h`}
                trafficStatusLabel={`${traffic.congestionLevel} (${traffic.averageSpeedKmh} km/h)`}
              />
            </div>
            <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/70 space-y-2">
              <h4 className="text-xs font-extrabold text-slate-900">
                🚗 Live Corridors Near {shortArea}
              </h4>
              {traffic.corridors.slice(0, 4).map((cor) => (
                <div
                  key={cor.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-xs"
                >
                  <span className="font-bold text-slate-800 truncate">{cor.roadName}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold shrink-0 ${cor.badgeClass}`}>
                    {cor.speedKmh} km/h ({cor.status})
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'market-rates':
      case 'fuel-rates':
        return (
          <div className="p-3 space-y-3">
            <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/70 space-y-2">
              <h4 className="text-xs font-extrabold text-slate-900">
                ⛽ Live Fuel & CNG Rates ({fuelRates.city})
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ['Petrol (1 L)', fuelRates.petrol > 0 ? `₹${fuelRates.petrol.toFixed(2)}` : 'Awaiting API', fuelRates.petrol > 0 ? 'Live OMC' : 'Pending API'],
                  ['Diesel (1 L)', fuelRates.diesel > 0 ? `₹${fuelRates.diesel.toFixed(2)}` : 'Awaiting API', fuelRates.diesel > 0 ? 'Live OMC' : 'Pending API'],
                  ['CNG (1 kg)', fuelRates.cng > 0 ? `₹${fuelRates.cng.toFixed(2)}` : 'Awaiting API', fuelRates.cng > 0 ? 'City Gas' : 'Pending API'],
                  ['LPG (14.2 kg)', fuelRates.lpg > 0 ? `₹${fuelRates.lpg.toFixed(0)}` : 'Awaiting API', fuelRates.lpg > 0 ? 'Domestic' : 'Pending API'],
                ].map(([n, p, c]) => (
                  <div key={n} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-500">{n}</p>
                    <p className="text-sm font-extrabold text-slate-900 mt-0.5">{p}</p>
                    <p className={`text-[9px] font-bold ${p === 'Awaiting API' ? 'text-amber-600' : 'text-emerald-600'}`}>{c}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/70 space-y-2">
              <h4 className="text-xs font-extrabold text-slate-900">
                🥦 Daily APMC Mandi Vegetables ({fuelRates.city})
              </h4>
              {mandiRates.length > 0 ? (
                mandiRates.map((m) => (
                  <div key={m.commodity} className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                    <span className="text-xs font-bold text-slate-800">
                      {m.icon} {m.commodity}
                    </span>
                    <div className="text-right">
                      <p className="text-xs font-extrabold text-slate-900">
                        ₹{m.pricePerKg} / {m.unit}
                      </p>
                      <p className="text-[9px] text-emerald-600 font-bold">{m.trend}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-slate-400 text-xs">
                  Awaiting Agmarknet / APMC Mandi API Key for {fuelRates.city}
                </div>
              )}
            </div>
          </div>
        );

      default:
        // Default rich mobile view (Home Portal — 100% Live)
        return (
          <div className="p-3 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div
                onClick={() => onNavigate('weather')}
                className="cursor-pointer bg-white rounded-xl p-2.5 shadow-xs border border-slate-200/70"
              >
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                  <span>🌤️ Weather/AQI</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
                <p className="text-base font-extrabold text-slate-900 mt-1">{weather.temperatureC}°C</p>
                <span
                  className={`inline-block px-1.5 py-0.5 rounded ${airQuality.colorBg} ${airQuality.colorText} text-[9px] font-bold mt-1`}
                >
                  AQI {airQuality.aqiValue} ({airQuality.aqiCategory})
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
                <p className="text-sm font-extrabold text-emerald-700 mt-1">{traffic.congestionLevel}</p>
                <p className="text-[9px] text-slate-500 mt-0.5">Avg {traffic.averageSpeedKmh} km/h</p>
              </div>

              <div
                onClick={() => onNavigate('intelligence')}
                className="cursor-pointer bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-xl p-2.5 shadow-xs"
              >
                <div className="flex items-center justify-between text-[10px] font-bold text-sky-300">
                  <span>🧭 Area Score</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
                <p className="text-base font-extrabold text-white mt-1">{liveIntel.safetyScore}/100</p>
                <p className="text-[9px] text-emerald-300 font-bold mt-0.5">Step-Out Verdicts ›</p>
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
                      LIVE
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-700 mt-0.5 leading-snug line-clamp-2">
                    {weather.outdoorActivityAdvice} {traffic.corridors[0] ? `${traffic.corridors[0].roadName}: ${traffic.corridors[0].speedKmh} km/h.` : ''}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
              <div className="grid grid-cols-3 gap-1.5 mt-2.5">
                {['Today summary', 'Check traffic routes', 'Air quality tip'].map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => onAskAi(`${ch} in ${shortArea}`)}
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
                  <MapPin className="w-3.5 h-3.5 text-blue-600" /> Live Map of {shortArea}
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
                coords={{ lat: location.lat, lng: location.lng }}
                showSearchBottomButton={false}
                showTrafficRoutes={false}
                centerLabel={`${shortArea}\n${weather.temperatureC}°C • AQI ${airQuality.aqiValue}`}
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
                {liveEventList.length > 0 ? (
                  <>
                    <img
                      src={liveEventList[0].img}
                      alt={liveEventList[0].t}
                      className="w-full h-16 rounded-lg object-cover mb-1.5"
                    />
                    <p className="text-[11px] font-extrabold text-slate-900 truncate">{liveEventList[0].t}</p>
                    <p className="text-[9px] text-slate-500 truncate">📍 {liveEventList[0].loc}</p>
                    <p className="text-[9px] text-slate-500">🕒 {liveEventList[0].dt}</p>
                  </>
                ) : (
                  <div className="py-4 text-center text-slate-400">
                    <p className="text-[10px] font-bold text-slate-600">No events scheduled</p>
                    <p className="text-[8px] text-slate-400 mt-0.5">Organizers can list events in {shortArea}</p>
                  </div>
                )}
              </div>

              <div
                onClick={() => onNavigate('alerts')}
                className="cursor-pointer bg-white rounded-2xl p-2.5 shadow-xs border border-slate-200/70"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-extrabold text-slate-900">📢 Civic Updates</span>
                  <span className="text-[9px] font-bold text-blue-600">See All ›</span>
                </div>
                {alerts.length > 0 ? (
                  <>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold ${alerts[0].badgeClass}`}>
                      {alerts[0].category.toUpperCase()}
                    </span>
                    <p className="text-[11px] font-extrabold text-slate-900 truncate mt-1">{alerts[0].title}</p>
                    <p className="text-[9px] text-slate-500 truncate">📍 {alerts[0].areaDescription}</p>
                  </>
                ) : (
                  <div className="py-4 text-center text-slate-400">
                    <p className="text-[10px] font-bold text-slate-600">All utilities normal</p>
                    <p className="text-[8px] text-slate-400 mt-0.5">Power & water operating normally</p>
                  </div>
                )}
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
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onNavigate('weather')}
                className="px-2 py-1 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-[10px] font-semibold flex items-center gap-1"
              >
                <Sun className="w-3 h-3 text-amber-300 fill-amber-300" /> {weather.temperatureC}°C
              </button>
              {onOpenCart && (
                <button
                  type="button"
                  onClick={onOpenCart}
                  className="relative p-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white flex items-center justify-center transition"
                  title="View Cart"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  {typeof cartCount === 'number' && cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 px-1 min-w-[14px] h-[14px] rounded-full bg-blue-500 text-white text-[8px] font-black flex items-center justify-center ring-1 ring-[#0D1B42]">
                      {cartCount}
                    </span>
                  )}
                </button>
              )}
              <button
                type="button"
                aria-label="View neighborhood notifications"
                onClick={onOpenNotifications}
                className="relative w-7 h-7 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 flex items-center justify-center cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5" />
                <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1 right-1" />
              </button>
              <button
                type="button"
                aria-label="User account and profile menu"
                onClick={onOpenProfile}
                className="w-7 h-7 rounded-full bg-indigo-500 border border-white/40 text-xs font-extrabold flex items-center justify-center cursor-pointer"
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
              <p className="text-[11px] text-blue-100">Good Day, Divyansh 👋</p>
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
                  <p className="text-sm font-extrabold">{weather.temperatureC}°C</p>
                  <p className="text-[9px] text-blue-200">{weather.conditionText}</p>
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
      <main className="flex-1 pb-20">{renderMobileScreenBody()}</main>

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
                aria-label="Close navigation menu drawer"
                onClick={() => setMoreDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
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
