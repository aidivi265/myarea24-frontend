import React, { useState } from 'react';
import { DashboardId, ActionModalData, SavedEntry } from '../types';
import { HeroBanner } from '../components/HeroBanner';
import { InteractiveMap } from '../components/InteractiveMap';
import {
  MapPin,
  Sun,
  CloudRain,
  Wind,
  Droplets,
  Car,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Heart,
  Bookmark,
  Star,
  Clock,
  Calendar,
  Utensils,
  Coffee,
  ShoppingBag,
  Hospital,
  GraduationCap,
  Trees,
  CreditCard,
  Dumbbell,
  Scissors,
  Landmark,
  MoreHorizontal,
  ShieldCheck,
  Radio,
  MessageSquare,
  SlidersHorizontal,
  Plus,
  Check,
  Wrench,
  Zap,
  Gift,
  Bell,
  Tag,
  Music,
  Users,
  Search,
} from 'lucide-react';

export interface DashboardCommonProps {
  onNavigate: (id: DashboardId) => void;
  onOpenModal: (data: ActionModalData) => void;
  onAskAi: (prompt: string) => void;
  savedIds: string[];
  onToggleSave: (entry: SavedEntry) => void;
  searchQuery: string;
  selectedArea: string;
  onAddToCart?: (item: { name: string; price: number }) => void;
}

/* ============================================================================
   1. HOME DASHBOARD (Page 2 Desktop)
   ============================================================================ */
export const HomeDashboard: React.FC<DashboardCommonProps> = ({
  onNavigate,
  onOpenModal,
  onAskAi,
  savedIds,
  onToggleSave,
  selectedArea,
}) => {
  const exploreCategories = [
    { label: 'Restaurants', icon: Utensils, bg: 'bg-orange-50 text-orange-500', target: 'businesses' as DashboardId },
    { label: 'Cafes', icon: Coffee, bg: 'bg-amber-50 text-amber-600', target: 'businesses' as DashboardId },
    { label: 'Shopping', icon: ShoppingBag, bg: 'bg-violet-50 text-violet-600', target: 'products' as DashboardId },
    { label: 'Hospitals', icon: Hospital, bg: 'bg-blue-50 text-blue-600', target: 'emergency' as DashboardId },
    { label: 'Schools', icon: GraduationCap, bg: 'bg-indigo-50 text-indigo-600', target: 'map' as DashboardId },
    { label: 'Parks', icon: Trees, bg: 'bg-emerald-50 text-emerald-600', target: 'map' as DashboardId },
    { label: 'ATMs', icon: CreditCard, bg: 'bg-sky-50 text-sky-600', target: 'map' as DashboardId },
    { label: 'Gyms', icon: Dumbbell, bg: 'bg-purple-50 text-purple-600', target: 'businesses' as DashboardId },
    { label: 'Salons', icon: Scissors, bg: 'bg-pink-50 text-pink-600', target: 'services' as DashboardId },
    { label: 'Temples', icon: Landmark, bg: 'bg-orange-50 text-orange-600', target: 'map' as DashboardId },
    { label: 'More', icon: MoreHorizontal, bg: 'bg-slate-100 text-slate-600', target: 'businesses' as DashboardId },
  ];

  const homeEvents = [
    {
      id: 'evt-summer-fest',
      badge: 'TODAY',
      title: 'Rohini Summer Fest 2024',
      time: '6:00 PM – 10:00 PM',
      loc: 'Sector 10, Rohini',
      tags: [
        { label: 'Live Music', cls: 'bg-rose-50 text-rose-600' },
        { label: 'Family Friendly', cls: 'bg-emerald-50 text-emerald-600' },
      ],
      img: './assets/crops/event-summer-fest.webp',
    },
    {
      id: 'evt-cleanup',
      badge: 'TOMORROW',
      title: 'Community Cleanup Drive',
      time: '8:00 AM – 11:00 AM',
      loc: 'Rithala, Rohini',
      tags: [{ label: 'Community', cls: 'bg-blue-50 text-blue-600' }],
      img: './assets/crops/event-cleanup.webp',
    },
    {
      id: 'evt-comedy',
      badge: 'SAT, 24 AUG',
      title: 'Standup Comedy Night',
      time: '7:00 PM – 9:00 PM',
      loc: 'The Laugh Box, Rohini',
      tags: [
        { label: 'Comedy', cls: 'bg-pink-50 text-pink-600' },
        { label: 'Indoor', cls: 'bg-indigo-50 text-indigo-600' },
      ],
      img: './assets/crops/event-comedy.webp',
    },
  ];

  const popularPlaces = [
    {
      id: 'biz-chai',
      name: 'The Urban Chai Café',
      rating: '4.5',
      reviews: '(1.2K)',
      sub: 'Café • Sector 10',
      dist: '800 m',
      img: './assets/crops/biz-urban-chai.webp',
    },
    {
      id: 'biz-bikanervala',
      name: 'Bikanervala',
      rating: '4.3',
      reviews: '(2.4K)',
      sub: 'Restaurant • Rohini',
      dist: '1.2 km',
      img: './assets/crops/biz-bikanervala.webp',
    },
    {
      id: 'biz-sports',
      name: 'Rohini Sports Complex',
      rating: '4.6',
      reviews: '(980)',
      sub: 'Sports • Sector 11',
      dist: '1.5 km',
      img: './assets/crops/biz-sports-complex.webp',
    },
  ];

  return (
    <div className="space-y-4">
      {/* HERO BANNER */}
      <HeroBanner
        dashboardId="home"
        tag={<span className="text-sm font-medium text-blue-100">Good Evening, Divyansh 👋</span>}
        title={
          <>
            Your neighbourhood,
            <br />
            <span className="text-[#7DD3FC]">in the know.</span>
          </>
        }
        description="Live local signals, AI-powered insights and everything you need to make better everyday decisions."
        rightWidget={
          <div className="flex flex-col items-end gap-2.5">
            <div className="bg-slate-900/55 backdrop-blur-md border border-white/20 rounded-full px-3.5 py-1.5 flex items-center gap-2 text-xs">
              <MapPin className="w-3.5 h-3.5 text-blue-300" />
              <span className="font-medium text-white">{selectedArea}</span>
              <span className="text-blue-200/80 ml-1 text-[11px] bg-white/10 px-2 py-0.5 rounded-full">
                Change ›
              </span>
            </div>
            <div
              onClick={() => onNavigate('weather')}
              className="cursor-pointer bg-slate-900/55 hover:bg-slate-900/70 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 flex items-center gap-5 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-400/20 flex items-center justify-center">
                  <Sun className="w-6 h-6 text-amber-400 fill-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-white leading-none">28°C</p>
                  <p className="text-xs text-blue-100 mt-0.5">Clear Sky</p>
                </div>
              </div>
              <div className="h-8 w-px bg-white/15" />
              <div className="text-right">
                <p className="text-xs text-blue-100">Tue, 20 Aug</p>
                <p className="text-sm font-bold text-white mt-0.5">6:24 PM</p>
              </div>
            </div>
          </div>
        }
        bottomPills={[
          {
            icon: <span className="text-amber-500">💬</span>,
            label: "What's the traffic like?",
            onClick: () => onAskAi("What's the traffic like in Rohini right now?"),
          },
          {
            icon: <span className="text-blue-500">🌧️</span>,
            label: 'Will it rain today?',
            onClick: () => onAskAi('Will it rain today in Outer North Delhi?'),
          },
          {
            icon: <span className="text-purple-500">📅</span>,
            label: 'Any events nearby?',
            onClick: () => onNavigate('events'),
          },
          {
            icon: <span className="text-orange-500">🍽️</span>,
            label: 'Good restaurants around?',
            onClick: () => onNavigate('businesses'),
          },
        ]}
        primaryCta={{
          label: 'Ask AI Assistant',
          onClick: () => onNavigate('ai-assistant'),
        }}
      />

      {/* ROW 2: 4 SIGNAL CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-3.5">
        {/* 1. Weather Card (3 cols) */}
        <div className="xl:col-span-3 bg-gradient-to-br from-white via-white to-sky-50/70 rounded-2xl p-4 shadow-card border border-slate-200/70 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-2">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Weather</span>
            </div>
            <div className="flex items-center gap-3 my-1">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 flex items-center justify-center">
                <Sun className="w-7 h-7 text-amber-400 fill-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-slate-900 leading-none">28°C</p>
                <p className="text-[11px] text-slate-500 mt-1">H: 32° &nbsp; L: 24°</p>
              </div>
            </div>
            <p className="text-xs font-medium text-slate-700 mt-1.5">Clear sky, pleasant evening</p>
            <div className="grid grid-cols-3 gap-1.5 pt-3 mt-3 border-t border-slate-100 text-[11px]">
              <div>
                <p className="font-bold text-slate-800 flex items-center gap-1">
                  <Droplets className="w-3 h-3 text-blue-500" /> 72%
                </p>
                <p className="text-[10px] text-slate-400">Humidity</p>
              </div>
              <div>
                <p className="font-bold text-slate-800 flex items-center gap-1">
                  <Wind className="w-3 h-3 text-blue-500" /> 18 km/h
                </p>
                <p className="text-[10px] text-slate-400">Wind</p>
              </div>
              <div>
                <p className="font-bold text-slate-800 flex items-center gap-1">
                  <CloudRain className="w-3 h-3 text-blue-500" /> 0 mm
                </p>
                <p className="text-[10px] text-slate-400">Rain</p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('weather')}
            className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>See detailed forecast</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 2. Air Quality Card (2 cols) */}
        <div className="xl:col-span-2 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Air Quality</span>
            </div>
            <div className="mt-1">
              <p className="text-2xl font-extrabold text-slate-900">
                142 <span className="text-sm font-bold text-slate-700">AQI</span>
              </p>
              <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[11px] font-bold">
                Moderate
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-2.5">Air quality is acceptable.</p>
            <div className="mt-3 flex items-center gap-1">
              <span className="h-1.5 flex-1 rounded-l-full bg-emerald-400" />
              <span className="h-2 flex-1 bg-amber-400 ring-2 ring-amber-200 rounded-sm" />
              <span className="h-1.5 flex-1 bg-orange-400" />
              <span className="h-1.5 flex-1 bg-rose-400" />
              <span className="h-1.5 flex-1 rounded-r-full bg-purple-400" />
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('air-quality')}
            className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>Air quality details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3. Traffic Card (3 cols) */}
        <div className="xl:col-span-3 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70 flex flex-col justify-between overflow-hidden relative">
          <div className="flex justify-between gap-2">
            <div className="z-10">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-2">
                <Car className="w-4 h-4 text-rose-500" />
                <span>Traffic</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                  ✓
                </span>
                <span className="text-sm font-extrabold text-slate-900">Smooth Traffic</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">No major incidents nearby</p>
            </div>
            <img
              src="/assets/crops/traffic-highway-thumb.webp"
              alt="Traffic preview"
              className="w-28 h-20 object-cover rounded-xl border border-slate-100 shrink-0"
            />
          </div>

          <div className="grid grid-cols-3 gap-1.5 pt-2.5 mt-2 border-t border-slate-100 text-[11px]">
            <div>
              <p className="font-bold text-slate-800">⚠️ 0</p>
              <p className="text-[10px] text-slate-400">Incidents</p>
            </div>
            <div>
              <p className="font-bold text-slate-800">🛣️ Normal</p>
              <p className="text-[10px] text-slate-400">Road conditions</p>
            </div>
            <div>
              <p className="font-bold text-slate-800">🚗 28 min</p>
              <p className="text-[10px] text-slate-400 truncate">To Connaught Place</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('traffic')}
            className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View live traffic</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4. AI Insight for You Card (4 cols) */}
        <div className="xl:col-span-4 bg-gradient-to-br from-[#EEF2FF] via-[#E8EDFF] to-[#F3E8FF] rounded-2xl p-4 shadow-card border border-indigo-200/70 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-start justify-between gap-2">
            <div className="z-10 pr-20">
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-extrabold text-indigo-950">AI Insight for You</span>
                <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[9px] font-bold uppercase tracking-wider">
                  BETA
                </span>
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                Pleasant evening, but some impact later tonight.
              </h3>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                Rain is expected after 10 PM in Rohini which may slow down traffic near Sector 10 and increase travel time by 15–20 mins.
              </p>
            </div>
            <img
              src="/assets/crops/ai-robot-umbrella.webp"
              alt="AI Assistant Robot"
              className="w-20 h-24 object-contain absolute right-2 top-3 pointer-events-none rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-1.5 mt-3 z-10">
            {[
              { label: 'Leave a bit earlier', prompt: 'When should I leave to avoid Sector 10 traffic tonight?' },
              { label: 'Check alternate routes', prompt: 'Suggest alternate routes avoiding Rohini Sector 10 after 9 PM' },
              { label: 'Carry an umbrella', prompt: 'What is the rain probability after 10 PM in Rohini?' },
              { label: 'Check parking availability', prompt: 'How is parking availability near Rohini Sector 10 event venue?' },
            ].map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => onAskAi(chip.prompt)}
                className="bg-white/85 hover:bg-white text-indigo-950 border border-indigo-200/70 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold flex items-center gap-1.5 shadow-sm transition text-left truncate"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                <span className="truncate">{chip.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ROW 3: EXPLORE AROUND YOU */}
      <div className="bg-white rounded-2xl px-5 py-3.5 shadow-card border border-slate-200/70 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <h3 className="text-sm font-extrabold text-slate-900 shrink-0">Explore Around You</h3>
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar w-full">
          {exploreCategories.map((cat) => (
            <button
              key={cat.label}
              type="button"
              onClick={() => onNavigate(cat.target)}
              className="flex flex-col items-center gap-1.5 min-w-[64px] group"
            >
              <div
                className={`w-11 h-11 rounded-2xl ${cat.bg} flex items-center justify-center shadow-sm group-hover:scale-105 transition`}
              >
                <cat.icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium text-slate-700 group-hover:text-indigo-600">
                {cat.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ROW 4: UPCOMING EVENTS + CIVIC UPDATES + POPULAR IN YOUR AREA */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3.5">
        {/* Upcoming Events Near You (5 cols) */}
        <div className="xl:col-span-5 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-extrabold text-slate-900">Upcoming Events Near You</h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('events')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {homeEvents.map((ev) => {
              const isSaved = savedIds.includes(ev.id);
              return (
                <div
                  key={ev.id}
                  onClick={() =>
                    onOpenModal({
                      title: ev.title,
                      category: 'Local Event',
                      badge: ev.badge,
                      location: ev.loc,
                      price: 'Free / Open Entry',
                      description: `Happening ${ev.time} at ${ev.loc}. AI Signal Correlation: Expect moderate crowd surge and rain probability near exit window.`,
                      primaryActionLabel: 'Book / RSVP Now',
                      image: ev.img,
                    })
                  }
                  className="cursor-pointer rounded-xl border border-slate-200/80 overflow-hidden hover:shadow-md transition flex flex-col justify-between bg-white group"
                >
                  <div>
                    <div className="relative h-24 overflow-hidden">
                      <img
                        src={ev.img}
                        alt={ev.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-white/95 text-[9px] font-extrabold text-slate-800 shadow-sm">
                        {ev.badge}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSave({
                            id: ev.id,
                            title: ev.title,
                            subtitle: ev.loc,
                            category: 'Events',
                            meta: ev.time,
                            image: ev.img,
                            savedAt: 'Just now',
                          });
                        }}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-rose-500 transition"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>
                    </div>
                    <div className="p-2.5">
                      <h4 className="text-xs font-extrabold text-slate-900 line-clamp-1">{ev.title}</h4>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3 text-blue-500 shrink-0" />
                        <span className="truncate">{ev.time}</span>
                      </p>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                        <span className="truncate">{ev.loc}</span>
                      </p>
                    </div>
                  </div>
                  <div className="px-2.5 pb-2.5 flex flex-wrap gap-1">
                    {ev.tags.map((t) => (
                      <span key={t.label} className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${t.cls}`}>
                        {t.label}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Civic Updates (4 cols) */}
        <div className="xl:col-span-4 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-orange-500">📢</span>
              <h3 className="text-sm font-extrabold text-slate-900">Civic Updates</h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('bulletins')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {[
              {
                badge: 'WATER SUPPLY',
                badgeCls: 'bg-sky-50 text-sky-700',
                ago: '2 hrs ago',
                title: 'Planned Water Supply Maintenance',
                loc: 'Rohini Sector 8, 9, 10',
                time: 'Tomorrow, 10:00 AM – 4:00 PM',
                img: './assets/crops/civic-water.webp',
              },
              {
                badge: 'ROAD WORK',
                badgeCls: 'bg-amber-50 text-amber-700',
                ago: '5 hrs ago',
                title: 'Road Repair Work on Outer Ring Road',
                loc: 'Near Rithala Metro Station',
                time: 'Aug 24 – Aug 28',
                img: './assets/crops/civic-road.webp',
              },
              {
                badge: 'GOVERNMENT',
                badgeCls: 'bg-emerald-50 text-emerald-700',
                ago: '1 day ago',
                title: 'Ward Office Special Camp',
                loc: 'Rohini Ward Office',
                time: 'Aug 25, 10:00 AM – 2:00 PM',
                img: './assets/crops/civic-gov.webp',
              },
            ].map((c) => (
              <div
                key={c.title}
                onClick={() => onNavigate('bulletins')}
                className="cursor-pointer flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200/70 transition"
              >
                <img src={c.img} alt={c.badge} className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-100" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${c.badgeCls}`}>
                      {c.badge}
                    </span>
                    <span className="text-[10px] text-slate-400">{c.ago}</span>
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-900 truncate mt-1">{c.title}</h4>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">📍 {c.loc}</p>
                  <p className="text-[10px] text-slate-500 truncate">🕒 {c.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular in Your Area (3 cols) */}
        <div className="xl:col-span-3 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-extrabold text-slate-900">Popular in Your Area</h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('businesses')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {popularPlaces.map((pl) => {
              const isSaved = savedIds.includes(pl.id);
              return (
                <div
                  key={pl.id}
                  onClick={() => onNavigate('businesses')}
                  className="cursor-pointer flex items-center justify-between gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={pl.img}
                      alt={pl.name}
                      className="w-16 h-12 rounded-xl object-cover shrink-0 border border-slate-200/60"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-extrabold text-slate-900 truncate">{pl.name}</h4>
                      <p className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="font-bold text-slate-800">{pl.rating}</span>
                        <span className="text-slate-400">{pl.reviews}</span>
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">{pl.sub}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold">
                      {pl.dist}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSave({
                          id: pl.id,
                          title: pl.name,
                          subtitle: pl.sub,
                          category: 'Businesses',
                          meta: pl.dist,
                          image: pl.img,
                          savedAt: 'Just now',
                        });
                      }}
                      className="text-slate-400 hover:text-indigo-600"
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-indigo-600 text-indigo-600' : ''}`} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   2. BUSINESSES DASHBOARD (Page 4 Desktop)
   ============================================================================ */
export const BusinessesDashboard: React.FC<DashboardCommonProps> = ({
  onOpenModal,
  onAskAi,
  savedIds,
  onToggleSave,
}) => {
  const [selectedCat, setSelectedCat] = useState('All');
  const [localSearch, setLocalSearch] = useState('');
  const [openNowOnly, setOpenNowOnly] = useState(true);

  const categories = [
    'All',
    'Restaurants',
    'Cafes',
    'Shopping',
    'Healthcare',
    'Education',
    'Gyms & Fitness',
    'Salons & Beauty',
    'Home Services',
    'Automotive',
  ];

  const popularBusinesses = [
    {
      id: 'biz-chai',
      name: 'The Urban Chai Café',
      rating: '4.5',
      reviews: '(1.2K)',
      cat: 'Cafes',
      sub: 'Café • Sector 10',
      dist: '800 m',
      img: './assets/crops/biz-card-chai.webp',
    },
    {
      id: 'biz-bikanervala',
      name: 'Bikanervala',
      rating: '4.3',
      reviews: '(2.4K)',
      cat: 'Restaurants',
      sub: 'Restaurant • Rohini',
      dist: '1.2 km',
      img: './assets/crops/biz-card-bikanervala.webp',
    },
    {
      id: 'biz-cultfit',
      name: 'Cult Fit Gym',
      rating: '4.6',
      reviews: '(980)',
      cat: 'Gyms & Fitness',
      sub: 'Gym • Sector 11',
      dist: '1.5 km',
      img: './assets/crops/biz-card-cultfit.webp',
    },
    {
      id: 'biz-looks',
      name: 'Looks Salon',
      rating: '4.4',
      reviews: '(420)',
      cat: 'Salons & Beauty',
      sub: 'Salon • Rohini',
      dist: '1.2 km',
      img: './assets/crops/biz-card-looks.webp',
    },
  ];

  const filteredBiz = popularBusinesses.filter((b) => {
    const matchesCat = selectedCat === 'All' || b.cat === selectedCat;
    const matchesQuery =
      !localSearch ||
      b.name.toLowerCase().includes(localSearch.toLowerCase()) ||
      b.sub.toLowerCase().includes(localSearch.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const browseGrid = [
    { name: 'Restaurants', count: '320+ places', icon: Utensils, color: 'bg-orange-50 text-orange-600' },
    { name: 'Cafes', count: '140+ places', icon: Coffee, color: 'bg-amber-50 text-amber-600' },
    { name: 'Shopping', count: '250+ places', icon: ShoppingBag, color: 'bg-violet-50 text-violet-600' },
    { name: 'Healthcare', count: '120+ places', icon: Hospital, color: 'bg-rose-50 text-rose-600' },
    { name: 'Education', count: '90+ places', icon: GraduationCap, color: 'bg-blue-50 text-blue-600' },
    { name: 'Gyms & Fitness', count: '75+ places', icon: Dumbbell, color: 'bg-indigo-50 text-indigo-600' },
    { name: 'Salons & Beauty', count: '180+ places', icon: Scissors, color: 'bg-pink-50 text-pink-600' },
    { name: 'Home Services', count: '200+ places', icon: Wrench, color: 'bg-teal-50 text-teal-600' },
    { name: 'Automotive', count: '85+ places', icon: Car, color: 'bg-sky-50 text-sky-600' },
    { name: 'More Categories', count: 'View all', icon: MoreHorizontal, color: 'bg-slate-100 text-slate-600' },
  ];

  return (
    <div className="space-y-4">
      <HeroBanner
        dashboardId="businesses"
        tag={
          <>
            <MapPin className="w-3.5 h-3.5 text-blue-300" />
            <span>Businesses in Outer North Delhi</span>
          </>
        }
        title="Discover Local Businesses"
        subtitle="Real places. Real people. Right around you."
        description="Explore restaurants, shops, services and more — with real reviews, live status and AI-powered recommendations."
        rightWidget={
          <div className="grid grid-cols-2 gap-2.5 w-full lg:w-[360px]">
            {[
              { icon: ShieldCheck, title: 'Verified Listings', sub: 'Trusted information', cls: 'text-blue-300' },
              { icon: Radio, title: 'Live Status', sub: 'Open/Closed, wait times', cls: 'text-emerald-300' },
              { icon: MessageSquare, title: 'Real Reviews', sub: 'From local users', cls: 'text-amber-300' },
              { icon: Sparkles, title: 'AI Recommendations', sub: 'Based on what matters to you', cls: 'text-purple-300' },
            ].map((feat) => (
              <div
                key={feat.title}
                className="bg-slate-900/50 backdrop-blur-md border border-white/15 rounded-xl p-2.5 flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <feat.icon className={`w-4 h-4 ${feat.cls}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{feat.title}</p>
                  <p className="text-[10px] text-blue-100/80 truncate">{feat.sub}</p>
                </div>
              </div>
            ))}
          </div>
        }
      />

      {/* Category Pills Strip */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCat(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition shadow-sm border ${
              selectedCat === cat
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white rounded-xl p-2.5 shadow-card border border-slate-200/70 flex flex-wrap items-center gap-2.5">
        <div className="flex-1 min-w-[220px] flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200/70">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search for any business (e.g. cafe, salon, hospital...)"
            className="bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none w-full"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 font-medium text-slate-700 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-blue-600" /> Outer North Delhi ⌄
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 font-medium text-slate-700">
            <span className="text-slate-400 mr-1">Sort by:</span> Relevance ⌄
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 font-medium text-slate-700">
            <span className="text-slate-400 mr-1">Rating:</span> Any ⌄
          </span>
          <button
            type="button"
            onClick={() => setOpenNowOnly((v) => !v)}
            className={`px-3 py-1.5 rounded-lg border font-semibold transition ${
              openNowOnly
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-slate-50 border-slate-200/80 text-slate-700'
            }`}
          >
            Open Now ⌄
          </button>
          <button
            type="button"
            className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 font-semibold text-slate-700 flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
          </button>
        </div>
      </div>

      {/* Main Content Split: Left (8 cols) + Right Map (4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-8 space-y-4">
          {/* Popular Near You */}
          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> Popular Near You
                </h3>
                <p className="text-[11px] text-slate-500">Top rated and trending businesses in your area</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCat('All')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                View all
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {filteredBiz.map((b) => {
                const isSaved = savedIds.includes(b.id);
                return (
                  <div
                    key={b.id}
                    onClick={() =>
                      onOpenModal({
                        title: b.name,
                        subtitle: b.sub,
                        category: b.cat,
                        badge: 'Open Now',
                        rating: `${b.rating} ${b.reviews}`,
                        location: `${b.dist} away • Outer North Delhi`,
                        description: `Verified local business in Rohini with live status tracking, digital catalog, and community reviews.`,
                        primaryActionLabel: 'Get Directions & Call',
                        image: b.img,
                      })
                    }
                    className="cursor-pointer rounded-xl border border-slate-200/80 overflow-hidden hover:shadow-md transition bg-white group"
                  >
                    <div className="relative h-28 overflow-hidden">
                      <img
                        src={b.img}
                        alt={b.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-emerald-500 text-white text-[10px] font-bold shadow">
                        Open Now
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSave({
                            id: b.id,
                            title: b.name,
                            subtitle: b.sub,
                            category: 'Businesses',
                            meta: b.dist,
                            image: b.img,
                            savedAt: 'Just now',
                          });
                        }}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/45 text-white flex items-center justify-center hover:bg-rose-500 transition"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>
                    </div>
                    <div className="p-2.5">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-extrabold text-slate-900 truncate">{b.name}</h4>
                        <Bookmark className={`w-3.5 h-3.5 shrink-0 ${isSaved ? 'fill-indigo-600 text-indigo-600' : 'text-slate-400'}`} />
                      </div>
                      <p className="text-[11px] text-slate-600 flex items-center gap-1 mt-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="font-bold text-slate-800">{b.rating}</span>
                        <span className="text-slate-400">{b.reviews}</span>
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5 truncate">{b.sub}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Browse by Category */}
          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <h3 className="text-sm font-extrabold text-slate-900 mb-3">Browse by Category</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {browseGrid.map((cat) => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setSelectedCat(cat.name === 'More Categories' ? 'All' : cat.name)}
                  className="p-2.5 rounded-xl border border-slate-200/70 hover:border-indigo-300 hover:bg-indigo-50/30 flex items-center justify-between gap-2 text-left transition"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-8 h-8 rounded-lg ${cat.color} flex items-center justify-center shrink-0`}>
                      <cat.icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{cat.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{cat.count}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Interactive Map (4 cols) */}
        <div className="xl:col-span-4">
          <div className="bg-white rounded-2xl p-3 shadow-card border border-slate-200/70 h-full">
            <InteractiveMap
              heightClass="h-[395px]"
              showTopFilterPills={['All', 'Restaurants', 'Healthcare', 'Shopping', 'More ⌄']}
              centerLabel={'Rohini\nSector 10'}
            />
          </div>
        </div>
      </div>

      {/* Bottom Row: AI Recommendations for You */}
      <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" /> AI Recommendations for You
            </h3>
            <p className="text-[11px] text-slate-500">
              Personalized suggestions based on your location, time, weather and local activity
            </p>
          </div>
          <button
            type="button"
            onClick={() => onAskAi('Recommend the best local businesses in Rohini for tonight')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {[
            {
              title: 'Best Places for Dinner Tonight',
              sub: 'Popular and open now near you',
              img: './assets/crops/biz-ai-dinner.webp',
            },
            {
              title: 'Good Cafes to Work From',
              sub: 'Quiet cafes with Wi-Fi in Rohini',
              img: './assets/crops/biz-ai-cafe.webp',
            },
            {
              title: 'Fitness Options Nearby',
              sub: 'Top rated gyms within 2 km',
              img: './assets/crops/biz-ai-fitness.webp',
            },
            {
              title: 'Essential Services Nearby',
              sub: 'Pharmacies, clinics and more',
              img: './assets/crops/biz-ai-essential.webp',
            },
          ].map((rec) => (
            <div
              key={rec.title}
              onClick={() => onAskAi(`Show me ${rec.title} in Outer North Delhi`)}
              className="cursor-pointer p-2.5 rounded-xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-sm flex items-center justify-between gap-2.5 transition"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <img src={rec.img} alt={rec.title} className="w-14 h-12 rounded-lg object-cover shrink-0" />
                <div className="min-w-0">
                  <h4 className="text-xs font-extrabold text-slate-900 line-clamp-1">{rec.title}</h4>
                  <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{rec.sub}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   3. PRODUCT DASHBOARD (Page 6 Desktop)
   ============================================================================ */
export const ProductsDashboard: React.FC<DashboardCommonProps> = ({
  onNavigate,
  onOpenModal,
  onAskAi,
  onAddToCart,
}) => {
  const [selectedCat, setSelectedCat] = useState('All');
  const [addedIds, setAddedIds] = useState<string[]>([]);

  const categories = [
    'All',
    'Groceries',
    'Fruits & Vegetables',
    'Dairy & Beverages',
    'Pharmacy',
    'Electronics',
    'Fashion',
    'Home & Kitchen',
    'Stationery',
    'Bakery',
  ];

  const popularProducts = [
    {
      id: 'prod-dal',
      name: 'Arhar Dal',
      unit: '1 kg',
      price: 120,
      stores: '5 stores nearby',
      badge: 'Popular',
      cat: 'Groceries',
      img: './assets/crops/prod-arhar-dal.webp',
    },
    {
      id: 'prod-milk',
      name: 'Amul Fresh Milk',
      unit: '1 L',
      price: 58,
      stores: '5 stores nearby',
      cat: 'Dairy & Beverages',
      img: './assets/crops/prod-amul-milk.webp',
    },
    {
      id: 'prod-atta',
      name: 'Aashirvaad Atta',
      unit: '5 kg',
      price: 265,
      stores: '4 stores nearby',
      cat: 'Groceries',
      img: './assets/crops/prod-atta.webp',
    },
    {
      id: 'prod-banana',
      name: 'Banana (Fresh)',
      unit: '1 kg',
      price: 40,
      stores: '6 stores nearby',
      cat: 'Fruits & Vegetables',
      img: './assets/crops/prod-banana.webp',
    },
    {
      id: 'prod-dettol',
      name: 'Dettol Handwash',
      unit: '200 ml',
      price: 99,
      stores: '3 stores nearby',
      cat: 'Pharmacy',
      img: './assets/crops/prod-dettol.webp',
    },
  ];

  const nearbyStores = [
    {
      name: 'Apna Super Mart',
      rating: '4.5 (1.2K)',
      type: 'Grocery Store',
      dist: '650 m',
      img: './assets/crops/store-apna-mart.webp',
    },
    {
      name: 'Sharma Fresh Mart',
      rating: '4.3 (980)',
      type: 'Fruits & Vegetables',
      dist: '800 m',
      img: './assets/crops/store-sharma-fresh.webp',
    },
    {
      name: 'Gupta Electronics',
      rating: '4.4 (620)',
      type: 'Electronics',
      dist: '1.1 km',
      img: './assets/crops/store-gupta-elec.webp',
    },
    {
      name: 'MedPlus Pharmacy',
      rating: '4.6 (2.1K)',
      type: 'Pharmacy',
      dist: '1.3 km',
      img: './assets/crops/store-medplus.webp',
    },
  ];

  const handleAdd = (p: { id: string; name: string; price: number }) => {
    setAddedIds((prev) => (prev.includes(p.id) ? prev : [...prev, p.id]));
    onAddToCart?.({ name: p.name, price: p.price });
  };

  return (
    <div className="space-y-4">
      <HeroBanner
        dashboardId="products"
        tag={
          <>
            <MapPin className="w-3.5 h-3.5 text-blue-300" />
            <span>Outer North Delhi, Delhi</span>
          </>
        }
        title={
          <>
            Everyday Products,
            <br />
            <span className="text-[#93C5FD]">Right Around You</span>
          </>
        }
        description="Find local stores, compare prices, check availability and discover the best places to buy everyday essentials in your area."
        bottomPills={[
          { icon: <span>🧺</span>, label: 'Groceries nearby', onClick: () => setSelectedCat('Groceries') },
          { icon: <span>🍎</span>, label: 'Fresh fruits & vegetables', onClick: () => setSelectedCat('Fruits & Vegetables') },
          { icon: <span>💊</span>, label: 'Pharmacies open now', onClick: () => setSelectedCat('Pharmacy') },
          { icon: <span>📱</span>, label: 'Electronics stores', onClick: () => setSelectedCat('Electronics') },
        ]}
        primaryCta={{
          label: 'Ask AI for recommendations',
          onClick: () => onAskAi('Where can I find the best prices on daily essentials in Rohini today?'),
        }}
      />

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCat(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition ${
              selectedCat === cat
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Grid: Left (8 cols) + Right (4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-8 space-y-4">
          {/* Popular Products in Your Area */}
          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5 mb-3">
              <span>🔥</span> Popular Products in Your Area
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {popularProducts
                .filter((p) => selectedCat === 'All' || p.cat === selectedCat)
                .map((p) => {
                  const isAdded = addedIds.includes(p.id);
                  return (
                    <div
                      key={p.id}
                      className="rounded-xl border border-slate-200/80 p-2.5 flex flex-col justify-between hover:shadow-md transition bg-white relative"
                    >
                      <div>
                        <div className="relative h-24 rounded-lg overflow-hidden bg-slate-50 mb-2">
                          <img src={p.img} alt={p.name} className="w-full h-full object-contain" />
                          {p.badge && (
                            <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-amber-400 text-slate-950 text-[9px] font-extrabold">
                              {p.badge}
                            </span>
                          )}
                        </div>
                        <div className="flex items-start justify-between gap-1">
                          <div>
                            <h4 className="text-xs font-extrabold text-slate-900 line-clamp-1">{p.name}</h4>
                            <p className="text-[10px] text-slate-400">{p.unit}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAdd(p)}
                            className={`w-6 h-6 rounded-full flex items-center justify-center border transition shrink-0 ${
                              isAdded
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white'
                            }`}
                          >
                            {isAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-100">
                        <p className="text-sm font-extrabold text-slate-900">₹{p.price}</p>
                        <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">📍 {p.stores}</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Nearby Stores */}
          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-900">Nearby Stores</h3>
              <button
                type="button"
                onClick={() => onNavigate('businesses')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {nearbyStores.map((st) => (
                <div
                  key={st.name}
                  onClick={() =>
                    onOpenModal({
                      title: st.name,
                      subtitle: st.type,
                      category: 'Verified Local Merchant',
                      badge: 'Open Now',
                      rating: st.rating,
                      location: `${st.dist} away • Outer North Delhi`,
                      description: 'Live product inventory synced with MyArea24 Local Discovery Network. Supports in-store pickup and home delivery.',
                      primaryActionLabel: 'View Store Catalog',
                      image: st.img,
                    })
                  }
                  className="cursor-pointer rounded-xl border border-slate-200/80 overflow-hidden hover:shadow-md transition bg-white"
                >
                  <div className="relative h-24">
                    <img src={st.img} alt={st.name} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded bg-slate-900/80 text-white text-[9px] font-bold">
                      Open Now
                    </span>
                  </div>
                  <div className="p-2.5">
                    <h4 className="text-xs font-extrabold text-slate-900 truncate">{st.name}</h4>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                      <span className="text-amber-600 font-bold">★ {st.rating}</span>
                      <span>📍 {st.dist}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">{st.type}</p>
                    <p className="text-[10px] font-bold text-emerald-600 mt-0.5">Open Now</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommendations for You */}
          <div className="bg-gradient-to-r from-indigo-50/80 to-blue-50/60 rounded-2xl p-4 border border-indigo-100">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-extrabold text-slate-900">AI Recommendations for You</h3>
                <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[9px] font-bold">BETA</span>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('ai-assistant')}
                className="text-xs font-semibold text-blue-600"
              >
                See more →
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {[
                { title: 'Best places to buy fresh vegetables', sub: 'Top rated stores within 1 km', icon: '🥦' },
                { title: 'Pharmacies open now near you', sub: 'With home delivery options', icon: '💊' },
                { title: 'Electronics stores with ongoing offers', sub: 'Smart TVs, mobiles and more', icon: '📱' },
              ].map((item) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => onAskAi(item.title)}
                  className="bg-white rounded-xl p-2.5 border border-slate-200/80 hover:border-indigo-300 flex items-center justify-between gap-2 text-left transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xl">{item.icon}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 line-clamp-1">{item.title}</p>
                      <p className="text-[10px] text-slate-500 line-clamp-1">{item.sub}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Today's Best Deals + Price Insights */}
        <div className="xl:col-span-4 space-y-4">
          {/* Today's Best Deals Near You */}
          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-900">Today's Best Deals Near You</h3>
              <button
                type="button"
                onClick={() => onNavigate('offers')}
                className="text-xs font-semibold text-blue-600 flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { name: 'Fresh Carrots', price: '₹30/kg', old: '₹40', off: '25% OFF', store: 'Sharma Fresh Mart', icon: '🥕' },
                { name: 'Farm Eggs (12)', price: '₹72', old: '₹90', off: '20% OFF', store: 'Daily Fresh Store', icon: '🥚' },
                { name: 'India Gate Rice', price: '₹280 (5 kg)', old: '₹320', off: '12% OFF', store: 'Gupta Store', icon: '🌾' },
                { name: 'Fortune Sunlite Oil', price: '₹160 (1 L)', old: '₹185', off: '14% OFF', store: 'Aggarwal Store', icon: '🌻' },
              ].map((deal) => (
                <div
                  key={deal.name}
                  className="p-2.5 rounded-xl border border-slate-200/80 hover:border-blue-300 transition bg-slate-50/40"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{deal.icon}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{deal.name}</p>
                      <p className="text-xs font-extrabold text-slate-900 mt-0.5">
                        {deal.price} <span className="text-[10px] text-slate-400 line-through font-normal">{deal.old}</span>
                      </p>
                      <span className="inline-block px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 text-[9px] font-extrabold mt-0.5">
                        {deal.off}
                      </span>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">{deal.store}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price Insights for Your Area */}
          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <span className="text-blue-600">📈</span> Price Insights for Your Area
              </h3>
              <button
                type="button"
                onClick={() => onNavigate('market-rates')}
                className="text-xs font-semibold text-blue-600 flex items-center gap-1"
              >
                <span>View full insights</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {[
                { name: 'Tomato (1 kg)', price: '₹30', change: '↓ 15%', cls: 'text-emerald-600', icon: '🍅', path: 'M0,8 Q20,10 40,16 T80,22', stroke: '#10b981' },
                { name: 'Onion (1 kg)', price: '₹28', change: '↓ 10%', cls: 'text-emerald-600', icon: '🧅', path: 'M0,10 Q25,12 50,18 T80,20', stroke: '#10b981' },
                { name: 'Milk (1 L)', price: '₹58', change: '→ 0%', cls: 'text-blue-600', icon: '🥛', path: 'M0,14 L80,14', stroke: '#3b82f6' },
                { name: 'Cooking Oil (1 L)', price: '₹160', change: '↑ 8%', cls: 'text-rose-600', icon: '🍾', path: 'M0,22 Q30,18 55,10 T80,6', stroke: '#ef4444' },
              ].map((row) => (
                <div key={row.name} className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100 last:border-none last:pb-0">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{row.icon}</span>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{row.name}</p>
                      <p className="text-xs font-extrabold text-slate-900">
                        {row.price} <span className={`text-[10px] font-bold ml-1 ${row.cls}`}>{row.change}</span>
                      </p>
                    </div>
                  </div>
                  <svg width="80" height="28" className="overflow-visible">
                    <path d={row.path} fill="none" stroke={row.stroke} strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   4. SERVICES DASHBOARD (Page 8 Desktop)
   ============================================================================ */
export const ServicesDashboard: React.FC<DashboardCommonProps> = ({
  onOpenModal,
  onAskAi,
}) => {
  const [selectedCat, setSelectedCat] = useState('All');

  const serviceCats = [
    { label: 'Home Repairs', icon: '🔧' },
    { label: 'Cleaning', icon: '🧹' },
    { label: 'Electrical', icon: '⚡' },
    { label: 'Plumbing', icon: '🚰' },
    { label: 'AC & Appliances', icon: '❄️' },
    { label: 'Beauty & Wellness', icon: '✂️' },
    { label: 'Tutoring & Education', icon: '📚' },
    { label: 'Pet Care', icon: '🐾' },
    { label: 'Vehicle Services', icon: '🚗' },
    { label: 'Event & Party', icon: '🎉' },
    { label: 'More', icon: '⊞' },
  ];

  const popularServices = [
    {
      title: 'AC Service & Repair',
      badge: 'Popular',
      rating: '4.6 (1.2K)',
      bookings: '500+ bookings',
      price: '₹499 onwards',
      img: './assets/crops/srv-ac-repair.webp',
    },
    {
      title: 'Home Deep Cleaning',
      rating: '4.4 (980)',
      bookings: '300+ bookings',
      price: '₹1,499 onwards',
      img: './assets/crops/srv-cleaning.webp',
    },
    {
      title: 'Electrician Services',
      rating: '4.5 (870)',
      bookings: '400+ bookings',
      price: '₹299 onwards',
      img: './assets/crops/srv-electrician.webp',
    },
    {
      title: 'Plumbing Services',
      rating: '4.6 (620)',
      bookings: '250+ bookings',
      price: '₹349 onwards',
      img: './assets/crops/srv-plumbing.webp',
    },
  ];

  const professionals = [
    {
      name: 'Amit AC Services',
      rating: '4.6 (520 reviews)',
      loc: 'Rohini Sector 9',
      spec: 'AC Repair • Installation',
      img: './assets/crops/pro-amit.webp',
    },
    {
      name: 'Sharma Home Cleaning',
      rating: '4.4 (430 reviews)',
      loc: 'Rohini Sector 10',
      spec: 'Deep Cleaning • Regular',
      img: './assets/crops/pro-sharma.webp',
    },
    {
      name: 'Delhi Electric Solutions',
      rating: '4.7 (390 reviews)',
      loc: 'Rohini Sector 8',
      spec: 'Wiring • Repairs • Installation',
      img: './assets/crops/pro-delhi-elec.webp',
    },
  ];

  return (
    <div className="space-y-4">
      <HeroBanner
        dashboardId="services"
        tag={
          <>
            <MapPin className="w-3.5 h-3.5 text-blue-300" />
            <span>Outer North Delhi, Delhi</span>
          </>
        }
        title="Local Services"
        subtitle="Trusted people. Reliable services. Right in your area."
        description="Book home services, find local professionals and get things done easily — all from your neighbourhood."
        bottomPills={[
          { icon: <span>🛡️</span>, label: 'Verified professionals' },
          { icon: <span>📍</span>, label: 'Local & nearby' },
          { icon: <span>⭐</span>, label: 'Ratings & reviews' },
          { icon: <span>💰</span>, label: 'Transparent pricing' },
          { icon: <span>✨</span>, label: 'AI recommendations', onClick: () => onAskAi('Recommend top-rated AC repair & home services in Rohini') },
        ]}
        askAiWidget={{
          placeholder: 'Search for a service...',
          chips: ['AC Repair', 'Electrician', 'Plumber', 'Deep Cleaning'],
          onAsk: (q) => onAskAi(`Find trusted local professionals for ${q} in Rohini`),
        }}
      />

      {/* Service Category Strip */}
      <div className="bg-white rounded-2xl p-3 shadow-card border border-slate-200/70 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        {serviceCats.map((c) => (
          <button
            key={c.label}
            type="button"
            onClick={() => setSelectedCat(c.label === selectedCat ? 'All' : c.label)}
            className={`flex flex-col items-center gap-1.5 min-w-[82px] py-1.5 px-2 rounded-xl transition ${
              selectedCat === c.label ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-700'
            }`}
          >
            <span className="text-xl">{c.icon}</span>
            <span className="text-[10px] font-semibold whitespace-nowrap">{c.label}</span>
          </button>
        ))}
      </div>

      {/* Main Content Split: Left (8 cols) + Right (4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-8 space-y-4">
          {/* Popular Services Near You */}
          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> Popular Services Near You
                </h3>
                <p className="text-[11px] text-slate-500">Most booked services in Outer North Delhi</p>
              </div>
              <span className="text-xs font-semibold text-blue-600 cursor-pointer">See All ›</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {popularServices.map((srv) => (
                <div
                  key={srv.title}
                  className="rounded-xl border border-slate-200/80 overflow-hidden bg-white flex flex-col justify-between hover:shadow-md transition"
                >
                  <div>
                    <div className="relative h-28">
                      <img src={srv.img} alt={srv.title} className="w-full h-full object-cover" />
                      {srv.badge && (
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-emerald-500 text-white text-[9px] font-bold">
                          {srv.badge}
                        </span>
                      )}
                    </div>
                    <div className="p-2.5">
                      <h4 className="text-xs font-extrabold text-slate-900 truncate">{srv.title}</h4>
                      <p className="text-[11px] text-amber-600 font-bold mt-0.5">★ {srv.rating}</p>
                      <p className="text-[10px] text-slate-500">{srv.bookings}</p>
                      <p className="text-xs font-extrabold text-slate-900 mt-1">{srv.price}</p>
                      <p className="text-[10px] font-semibold text-emerald-600">Open Today</p>
                    </div>
                  </div>
                  <div className="px-2.5 pb-2.5">
                    <button
                      type="button"
                      onClick={() =>
                        onOpenModal({
                          title: srv.title,
                          category: 'Home Service Booking',
                          price: srv.price,
                          rating: srv.rating,
                          location: 'Same-day visit in Outer North Delhi',
                          description: `Book a background-verified local professional for ${srv.title}. Includes 30-day service warranty and transparent upfront pricing.`,
                          primaryActionLabel: 'Confirm Booking Slot',
                          image: srv.img,
                        })
                      }
                      className="w-full py-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white text-xs font-bold transition"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Featured Local Professionals */}
          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" /> Featured Local Professionals
                </h3>
                <p className="text-[11px] text-slate-500">Verified and top-rated service providers in your area</p>
              </div>
              <span className="text-xs font-semibold text-blue-600 cursor-pointer">See All ›</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {professionals.map((pro) => (
                <div key={pro.name} className="p-3 rounded-xl border border-slate-200/80 flex flex-col justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <img src={pro.img} alt={pro.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                    <div className="min-w-0">
                      <h4 className="text-xs font-extrabold text-slate-900 truncate">{pro.name}</h4>
                      <p className="text-[10px] text-amber-600 font-bold">★ {pro.rating}</p>
                      <p className="text-[10px] text-slate-500 truncate">📍 {pro.loc}</p>
                      <p className="text-[10px] text-slate-500 truncate">🔧 {pro.spec}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onOpenModal({
                        title: `Contact ${pro.name}`,
                        subtitle: pro.spec,
                        category: 'Verified Professional',
                        rating: pro.rating,
                        location: pro.loc,
                        description: 'Connect directly via phone or WhatsApp for instant quote and doorstep visit.',
                        primaryActionLabel: 'Call Professional Now',
                        image: pro.img,
                      })
                    }
                    className="w-full py-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white text-xs font-bold transition"
                  >
                    Contact
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Need a Custom Service Banner */}
          <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-100/80 rounded-2xl p-4 border border-indigo-200/70 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">Need a Custom Service?</h4>
                <p className="text-xs text-slate-600">
                  Can't find what you're looking for? Tell us your requirement and we'll find the best local professionals for you.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                onOpenModal({
                  title: 'Post a Custom Service Request',
                  category: 'Custom Service Match',
                  description: 'Describe what needs fixing or installation in your home/office and receive verified quotes within 15 minutes.',
                  primaryActionLabel: 'Submit Service Request',
                })
              }
              className="px-4 py-2 rounded-xl bg-white hover:bg-indigo-600 text-indigo-700 hover:text-white text-xs font-bold border border-indigo-200 shadow-sm shrink-0 transition"
            >
              Post a Request →
            </button>
          </div>
        </div>

        {/* Right Column (4 cols): Map + AI Recommendations */}
        <div className="xl:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-sm font-extrabold text-slate-900">Service Providers Near You</h3>
              <span className="text-xs font-semibold text-blue-600 cursor-pointer">View Full Map →</span>
            </div>
            <InteractiveMap heightClass="h-56" centerLabel={'Rohini\nSector 10'} />
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-extrabold text-slate-900">AI Recommendations for You</h3>
              <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[9px] font-bold">BETA</span>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">Based on your area, weather and recent activity</p>
            <div className="space-y-2.5">
              {[
                { icon: '☂️', title: 'Get AC serviced before peak summer', sub: 'High temperatures expected next week' },
                { icon: '🧹', title: 'Deep cleaning services in demand this week', sub: 'Popular in Rohini with good reviews' },
                { icon: '⚡', title: 'Nearby electricians available now', sub: '2 verified professionals within 2 km' },
                { icon: '🚰', title: 'Plumbing services with same-day support', sub: 'Top rated providers in your area' },
              ].map((item) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => onAskAi(item.title)}
                  className="w-full p-2.5 rounded-xl border border-slate-200/70 hover:border-indigo-300 flex items-center justify-between gap-2 text-left transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-lg">{item.icon}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{item.title}</p>
                      <p className="text-[10px] text-slate-500 truncate">{item.sub}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   5. OFFERS DASHBOARD (Page 10 Desktop)
   ============================================================================ */
export const OffersDashboard: React.FC<DashboardCommonProps> = ({
  onOpenModal,
  onAskAi,
  savedIds,
  onToggleSave,
}) => {
  const [selectedCat, setSelectedCat] = useState('All Offers');

  const offerCats = [
    { label: 'All Offers', icon: '⊞' },
    { label: 'Food & Dining', icon: '🍴' },
    { label: 'Shopping', icon: '🛍️' },
    { label: 'Beauty & Wellness', icon: '✂️' },
    { label: 'Health & Fitness', icon: '🏋️' },
    { label: 'Services', icon: '🔧' },
    { label: 'Education', icon: '🎓' },
    { label: 'Healthcare', icon: '🏥' },
    { label: 'Automotive', icon: '🚗' },
    { label: 'Home & Living', icon: '🏠' },
    { label: 'Entertainment', icon: '🎬' },
    { label: 'More', icon: '⋯' },
  ];

  const trendingOffers = [
    {
      id: 'off-lapinoz',
      brand: "La Pino'z Pizza",
      badge: '50% OFF',
      title: '50% OFF on Medium Pizzas',
      sub: 'Dine-in & Takeaway',
      cat: 'Food & Dining',
      rating: '4.5 (1.2K)',
      dist: '800 m',
      img: './assets/crops/offer-lapinoz.webp',
    },
    {
      id: 'off-looks',
      brand: 'Looks Salon',
      badge: '30% OFF',
      title: '30% OFF on All Hair Services',
      sub: 'Valid till 30 Apr 2025',
      cat: 'Beauty & Wellness',
      rating: '4.4 (980)',
      dist: '1.2 km',
      img: './assets/crops/offer-looks.webp',
    },
    {
      id: 'off-cultfit',
      brand: 'Cult.fit',
      badge: '1 MONTH FREE',
      title: '1 Month Free + 50% OFF on Annual Plan',
      sub: 'Limited Period',
      cat: 'Health & Fitness',
      rating: '4.6 (2.1K)',
      dist: '1.5 km',
      img: './assets/crops/offer-cultfit.webp',
    },
    {
      id: 'off-dmart',
      brand: 'DMart',
      badge: 'UP TO 40% OFF',
      title: 'Up to 40% OFF on Daily Essentials',
      sub: 'In-store & Online',
      cat: 'Shopping',
      rating: '4.5 (3.4K)',
      dist: '2.1 km',
      img: './assets/crops/offer-dmart.webp',
    },
  ];

  const limitedOffers = [
    {
      brand: 'Burger Singh',
      left: '2 days left',
      deal: 'Flat 40% OFF',
      sub: 'On orders above ₹299',
      meta: '★ 4.3 | 900 m',
      img: './assets/crops/offer-burger-singh.webp',
    },
    {
      brand: 'Croma',
      left: '3 days left',
      deal: 'Up to 35% OFF',
      sub: 'On selected electronics',
      meta: '★ 4.6 | 1.8 km',
      img: './assets/crops/offer-croma.webp',
    },
    {
      brand: 'Urban Company',
      left: '1 day left',
      deal: '₹200 OFF',
      sub: 'On AC Service',
      meta: '★ 4.8 | 2.3 km',
      img: './assets/crops/offer-urban-company.webp',
    },
    {
      brand: 'Chaayos',
      left: '4 days left',
      deal: 'Buy 1 Get 1 Free',
      sub: 'On selected beverages',
      meta: '★ 4.2 | 1.1 km',
      img: './assets/crops/offer-chaayos.webp',
    },
  ];

  return (
    <div className="space-y-4">
      <HeroBanner
        dashboardId="offers"
        tag={
          <>
            <MapPin className="w-3.5 h-3.5 text-blue-300" />
            <span>Outer North Delhi, Delhi</span>
          </>
        }
        title="Best Local Offers"
        subtitle="Save more. Explore more. Support local."
        description="Exclusive deals from restaurants, shops, salons, gyms and more — right here in your neighbourhood."
        bottomPills={[
          { icon: <span>🛡️</span>, label: 'Verified offers' },
          { icon: <span>🏪</span>, label: 'Real local businesses' },
          { icon: <span>⏳</span>, label: 'Limited time deals' },
          { icon: <span>✨</span>, label: 'AI personalised offers' },
        ]}
        rightWidget={
          <div className="w-full lg:w-[340px] bg-white/12 backdrop-blur-md border border-white/20 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-pink-500/30 border border-pink-300/40 flex items-center justify-center">
                <Gift className="w-5 h-5 text-pink-200" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-white">Never miss a great deal!</p>
                <p className="text-[11px] text-blue-100/85">
                  Get personalised offers from your favourite local businesses.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                onOpenModal({
                  title: 'Instant Deal Alerts Enabled!',
                  category: 'Hyperlocal Offer Notifications',
                  description: 'You will now receive real-time alerts when restaurants, salons, and supermarkets in Rohini drop flash discounts.',
                  primaryActionLabel: 'Awesome, Got It',
                })
              }
              className="w-full bg-white text-slate-800 hover:bg-blue-50 rounded-full px-3.5 py-2 text-xs font-bold flex items-center justify-between shadow-sm transition"
            >
              <span className="flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-indigo-600" /> Enable Notifications
              </span>
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">→</span>
            </button>
          </div>
        }
      />

      {/* Category Strip */}
      <div className="bg-white rounded-2xl p-2.5 shadow-card border border-slate-200/70 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        {offerCats.map((c) => (
          <button
            key={c.label}
            type="button"
            onClick={() => setSelectedCat(c.label)}
            className={`flex flex-col items-center gap-1 min-w-[76px] py-1.5 px-2 rounded-xl transition ${
              selectedCat === c.label
                ? 'bg-blue-600 text-white shadow-sm'
                : 'hover:bg-slate-50 text-slate-700'
            }`}
          >
            <span className="text-base">{c.icon}</span>
            <span className="text-[10px] font-semibold whitespace-nowrap">{c.label}</span>
          </button>
        ))}
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-8 space-y-4">
          {/* Trending Offers Near You */}
          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <span>🔥</span> Trending Offers Near You
              </h3>
              <span className="text-xs font-semibold text-blue-600 cursor-pointer">See All ›</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {trendingOffers
                .filter((o) => selectedCat === 'All Offers' || o.cat === selectedCat)
                .map((off) => {
                  const isSaved = savedIds.includes(off.id);
                  return (
                    <div
                      key={off.id}
                      className="rounded-xl border border-slate-200/80 overflow-hidden bg-white flex flex-col justify-between hover:shadow-md transition"
                    >
                      <div>
                        <div className="relative h-28">
                          <img src={off.img} alt={off.brand} className="w-full h-full object-cover" />
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-rose-600 text-white text-[9px] font-extrabold shadow">
                            {off.badge}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              onToggleSave({
                                id: off.id,
                                title: `${off.brand} — ${off.badge}`,
                                subtitle: off.title,
                                category: 'Offers',
                                meta: off.dist,
                                image: off.img,
                                savedAt: 'Just now',
                              })
                            }
                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/40 text-white flex items-center justify-center"
                          >
                            <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
                          </button>
                        </div>
                        <div className="p-2.5">
                          <p className="text-[10px] font-bold text-slate-500">{off.brand}</p>
                          <h4 className="text-xs font-extrabold text-slate-900 line-clamp-2 mt-0.5">{off.title}</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">{off.sub}</p>
                          <span className="inline-block mt-1.5 px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[9px] font-semibold">
                            {off.cat}
                          </span>
                          <p className="text-[10px] text-slate-500 mt-1.5">
                            ★ {off.rating} • 📍 {off.dist}
                          </p>
                        </div>
                      </div>
                      <div className="px-2.5 pb-2.5">
                        <button
                          type="button"
                          onClick={() =>
                            onOpenModal({
                              title: `${off.brand}: ${off.title}`,
                              subtitle: off.sub,
                              category: off.cat,
                              badge: off.badge,
                              rating: off.rating,
                              location: `${off.dist} away in Rohini`,
                              description: 'Use coupon code MYAREA24 at checkout or show this QR code at the store counter to redeem immediately.',
                              primaryActionLabel: 'Redeem Coupon Code',
                              image: off.img,
                            })
                          }
                          className="w-full py-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white text-xs font-bold transition"
                        >
                          View Offer
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Limited Time Offers */}
          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-rose-500" /> Limited Time Offers
              </h3>
              <span className="text-xs font-semibold text-blue-600 cursor-pointer">See All ›</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {limitedOffers.map((lim) => (
                <div key={lim.brand} className="rounded-xl border border-slate-200/80 overflow-hidden bg-white hover:shadow-md transition">
                  <div className="relative h-20">
                    <img src={lim.img} alt={lim.brand} className="w-full h-full object-cover" />
                    <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-rose-600 text-white text-[9px] font-bold">
                      🕒 {lim.left}
                    </span>
                  </div>
                  <div className="p-2.5">
                    <h4 className="text-xs font-extrabold text-slate-900">{lim.brand}</h4>
                    <p className="text-xs font-extrabold text-rose-600">{lim.deal}</p>
                    <p className="text-[10px] text-slate-500 truncate">{lim.sub}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{lim.meta}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Categories This Week */}
          <div className="bg-white rounded-2xl p-3.5 shadow-card border border-slate-200/70 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <span>📊</span> Top Categories This Week
              </h4>
              <p className="text-[10px] text-slate-400">Most popular offer categories in your area</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {[
                { rank: 1, name: 'Food & Dining', count: '120+ offers', icon: '🍴' },
                { rank: 2, name: 'Shopping', count: '95+ offers', icon: '🛍️' },
                { rank: 3, name: 'Beauty & Wellness', count: '75+ offers', icon: '✂️' },
                { rank: 4, name: 'Health & Fitness', count: '60+ offers', icon: '🏋️' },
                { rank: 5, name: 'Services', count: '50+ offers', icon: '🔧' },
              ].map((tc) => (
                <div key={tc.name} className="flex items-center gap-1.5 text-xs">
                  <span className="text-[10px] font-bold text-slate-400">{tc.rank}</span>
                  <span>{tc.icon}</span>
                  <div>
                    <p className="text-[11px] font-bold text-slate-800 leading-none">{tc.name}</p>
                    <p className="text-[9px] text-slate-400">{tc.count}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="xl:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-sm font-extrabold text-slate-900">Offers Around You</h3>
              <span className="text-xs font-semibold text-blue-600 cursor-pointer">View Full Map →</span>
            </div>
            <InteractiveMap heightClass="h-52" centerLabel={'Rohini\nSector 10'} />
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-extrabold text-slate-900">AI Recommended Offers for You</h3>
              <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[9px] font-bold">BETA</span>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">Based on your interests, past activity and local trends</p>
            <div className="space-y-2">
              {[
                { icon: '🍴', title: 'Best food deals near you', sub: 'Great offers at top-rated restaurants' },
                { icon: '✂️', title: 'Salon offers this week', sub: 'Popular deals at nearby salons' },
                { icon: '🏋️', title: 'Gym memberships with discounts', sub: 'Limited time offers on fitness plans' },
                { icon: '🛍️', title: 'Deals on daily essentials', sub: 'Save more at local supermarkets' },
              ].map((rec) => (
                <button
                  key={rec.title}
                  type="button"
                  onClick={() => onAskAi(rec.title)}
                  className="w-full p-2.5 rounded-xl border border-slate-200/70 hover:border-indigo-300 flex items-center justify-between gap-2 text-left transition"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{rec.icon}</span>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{rec.title}</p>
                      <p className="text-[10px] text-slate-500">{rec.sub}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   6. EVENTS DASHBOARD (Page 12 Desktop)
   ============================================================================ */
export const EventsDashboard: React.FC<DashboardCommonProps> = ({
  onOpenModal,
  onAskAi,
}) => {
  const [selectedTab, setSelectedTab] = useState('This Week');
  const [selectedDay, setSelectedDay] = useState(16);

  const featuredEvents = [
    {
      day: 'SAT',
      date: '16',
      title: 'Rohini Live Music Fest',
      cat: 'Music • Concert',
      time: '6:00 PM – 11:00 PM',
      loc: 'Japanese Park, Rohini',
      cta: 'Book Tickets',
      primary: true,
      img: './assets/crops/evt-music-fest.webp',
    },
    {
      day: 'SUN',
      date: '17',
      title: 'Rohini Food Carnival',
      cat: 'Food • Festival',
      time: '12:00 PM – 10:00 PM',
      loc: 'Rohini Sec 10, DDA Ground',
      cta: 'View Details',
      primary: false,
      img: './assets/crops/evt-food-carnival.webp',
    },
    {
      day: 'SAT',
      date: '23',
      title: 'Yoga in the Park',
      cat: 'Health • Wellness',
      time: '7:00 AM – 9:00 AM',
      loc: 'Central Park, Rohini',
      cta: 'Register Now',
      primary: false,
      img: './assets/crops/evt-yoga.webp',
    },
    {
      day: 'SUN',
      date: '24',
      title: 'Local Art Exhibition',
      cat: 'Art • Culture',
      time: '10:00 AM – 7:00 PM',
      loc: 'Rohini Art Gallery',
      cta: 'View Details',
      primary: false,
      img: './assets/crops/evt-art-exhib.webp',
    },
  ];

  const upcomingRows = [
    {
      month: 'MAR',
      date: '18',
      title: 'Dance Workshop',
      time: '3:00 PM – 5:00 PM',
      loc: 'Rohini Sec 8, Community Centre',
      badge: 'Free',
      badgeCls: 'bg-emerald-50 text-emerald-700',
      img: './assets/crops/evt-dance.webp',
    },
    {
      month: 'MAR',
      date: '20',
      title: 'Tech Talk: AI in Daily Life',
      time: '5:00 PM – 7:00 PM',
      loc: 'Rohini Tech Hub',
      badge: 'Workshop',
      badgeCls: 'bg-indigo-50 text-indigo-700',
      img: './assets/crops/evt-techtalk.webp',
    },
    {
      month: 'MAR',
      date: '22',
      title: 'Cricket Tournament',
      time: '8:00 AM – 6:00 PM',
      loc: 'Rohini Sports Complex',
      badge: 'Sports',
      badgeCls: 'bg-sky-50 text-sky-700',
      img: './assets/crops/evt-cricket.webp',
    },
  ];

  return (
    <div className="space-y-4">
      <HeroBanner
        dashboardId="events"
        tag={
          <>
            <MapPin className="w-3.5 h-3.5 text-blue-300" />
            <span>Outer North Delhi, Delhi</span>
          </>
        }
        title={
          <>
            Local Events,
            <br />
            <span className="text-[#93C5FD]">Closer to You</span>
          </>
        }
        description="Discover what's happening in your area — concerts, workshops, festivals, community events and more."
        rightWidget={
          <div className="bg-slate-900/55 backdrop-blur-md border border-white/20 rounded-2xl p-4 w-full lg:w-[330px]">
            <div className="flex items-center gap-3 pb-3 border-b border-white/15">
              <div className="w-10 h-10 rounded-xl bg-blue-500/30 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-200" />
              </div>
              <div>
                <p className="text-xl font-extrabold text-white leading-none">25+</p>
                <p className="text-xs text-blue-100 mt-0.5">Events this week</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 text-[10px] text-blue-100">
              <span>🎉 Festivals</span>
              <span>🎨 Workshops</span>
              <span>🎵 Live Music</span>
              <span>🤝 Community</span>
            </div>
          </div>
        }
      />

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {[
          'All Events',
          'Music & Concerts',
          'Festivals',
          'Workshops',
          'Community',
          'Sports',
          'Food & Drinks',
          'Art & Culture',
          'Business & Tech',
        ].map((cat, idx) => (
          <button
            key={cat}
            type="button"
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition ${
              idx === 0
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-8 space-y-4">
          {/* Featured Events Near You */}
          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> Featured Events Near You
              </h3>
              <span className="text-xs font-semibold text-blue-600 cursor-pointer">See All ›</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {featuredEvents.map((ev) => (
                <div
                  key={ev.title}
                  className="rounded-xl border border-slate-200/80 overflow-hidden bg-white flex flex-col justify-between hover:shadow-md transition"
                >
                  <div>
                    <div className="relative h-28">
                      <img src={ev.img} alt={ev.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-2.5">
                      <div className="flex items-start gap-2">
                        <div className="px-1.5 py-0.5 rounded bg-blue-50 text-center shrink-0">
                          <p className="text-[8px] font-bold text-blue-600">{ev.day}</p>
                          <p className="text-sm font-extrabold text-slate-900 leading-none">{ev.date}</p>
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-extrabold text-slate-900 line-clamp-1">{ev.title}</h4>
                          <p className="text-[10px] text-slate-400">{ev.cat}</p>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-2 truncate">🕒 {ev.time}</p>
                      <p className="text-[10px] text-slate-500 truncate">📍 {ev.loc}</p>
                    </div>
                  </div>
                  <div className="px-2.5 pb-2.5">
                    <button
                      type="button"
                      onClick={() =>
                        onOpenModal({
                          title: ev.title,
                          subtitle: ev.cat,
                          category: 'Featured Local Event',
                          location: `${ev.loc} • ${ev.time}`,
                          description: 'Live Event Intelligence: High footfall expected. Venue parking fills up 30 mins prior to start.',
                          primaryActionLabel: ev.cta,
                          image: ev.img,
                        })
                      }
                      className={`w-full py-1.5 rounded-lg text-xs font-bold transition ${
                        ev.primary
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                          : 'bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white'
                      }`}
                    >
                      {ev.cta}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events + Map Split */}
          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-slate-900">Upcoming Events</h3>
                <div className="flex items-center gap-1 ml-2">
                  {['This Week', 'This Month', 'Free Events', 'For Families'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSelectedTab(t)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition ${
                        selectedTab === t ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <span className="text-xs font-semibold text-blue-600 cursor-pointer">See All ›</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
              <div className="lg:col-span-7 space-y-2.5">
                {upcomingRows.map((row) => (
                  <div
                    key={row.title}
                    className="p-2 rounded-xl border border-slate-200/70 hover:border-blue-300 flex items-center justify-between gap-2.5 transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 text-center shrink-0">
                        <p className="text-[9px] font-bold text-rose-500">{row.month}</p>
                        <p className="text-base font-extrabold text-slate-900 leading-none">{row.date}</p>
                      </div>
                      <img src={row.img} alt={row.title} className="w-14 h-11 rounded-lg object-cover shrink-0" />
                      <div className="min-w-0">
                        <h4 className="text-xs font-extrabold text-slate-900 truncate">{row.title}</h4>
                        <p className="text-[10px] text-slate-500 truncate">🕒 {row.time}</p>
                        <p className="text-[10px] text-slate-500 truncate">📍 {row.loc}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${row.badgeCls}`}>
                      {row.badge}
                    </span>
                  </div>
                ))}
              </div>
              <div className="lg:col-span-5">
                <InteractiveMap heightClass="h-52" centerLabel={'Rohini\nSector 10'} showSearchBottomButton={false} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Events Calendar + Today's Highlights */}
        <div className="xl:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-900">Events Calendar</h3>
              <span className="text-xs font-semibold text-blue-600">March 2025</span>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-slate-400 mb-1.5">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                const hasEvent = [12, 16, 17, 18, 20, 22, 23, 24].includes(day);
                const isSelected = selectedDay === day;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    className={`h-7 rounded-full flex flex-col items-center justify-center font-semibold transition ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-bold shadow'
                        : hasEvent
                        ? 'bg-indigo-50 text-indigo-700 font-bold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{day}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <span>✨</span> Today's Highlights
              </h3>
              <span className="text-xs font-semibold text-blue-600 cursor-pointer">See All ›</span>
            </div>
            <div className="space-y-2.5">
              {[
                { title: 'RWA Community Meeting', sub: '6:00 PM • Rohini Sec 9 Community Centre', icon: '🤝' },
                { title: 'Kids Art & Craft Workshop', sub: '4:00 PM • Rohini Public Library', icon: '🎨' },
                { title: 'Street Food Pop-up', sub: '5:00 PM • Rohini Sec 11 Market', icon: '🍔' },
                { title: 'Open Mic Night', sub: '7:00 PM • The Brew Room, Rohini', icon: '🎤' },
              ].map((hl) => (
                <div
                  key={hl.title}
                  onClick={() => onAskAi(`Tell me more about ${hl.title} today`)}
                  className="cursor-pointer p-2 rounded-xl hover:bg-slate-50 flex items-center justify-between gap-2 transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-base shrink-0">
                      {hl.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{hl.title}</p>
                      <p className="text-[10px] text-slate-500 truncate">{hl.sub}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[9px] font-bold shrink-0">
                    Today
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
