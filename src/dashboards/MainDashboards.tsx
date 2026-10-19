import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { DashboardId, ActionModalData, SavedEntry } from '../types';
import { HeroBanner } from '../components/HeroBanner';
import { InteractiveMap } from '../components/InteractiveMap';
import { LiveAreaIntelligence } from '../services/liveIntelligence';
import { UserLocation } from '../components/LocationPickerModal';
import {
  LiveCommunityMarketplaceState,
  useLiveCommunityMarketplace,
} from '../services/communityMarketplaceService';
import {
  MapPin,
  Sun,
  CloudRain,
  Wind,
  Droplets,
  Car,
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
  Plus,
  Check,
  Wrench,
  Gift,
  Bell,
  Search,
  Fuel,
  TrendingUp,
  Phone,
  Copy,
  Store,
  X,
} from 'lucide-react';

export interface DashboardCommonProps {
  onNavigate: (id: DashboardId) => void;
  onOpenModal: (data: ActionModalData) => void;
  onAskAi: (prompt: string) => void;
  savedIds: string[];
  onToggleSave: (entry: SavedEntry) => void;
  searchQuery: string;
  selectedArea: string;
  currentLocation: UserLocation;
  liveIntel: LiveAreaIntelligence;
  marketplace?: LiveCommunityMarketplaceState;
  onAddToCart?: (item: any) => void;
  onBookService?: (service: any) => void;
  onOpenCart?: () => void;
  onOpenLocationPicker?: () => void;
  onOpenMerchantRegistration?: () => void;
}

/* ============================================================================
   1. HOME DASHBOARD (Page 2 Desktop) — 100% LIVE SIGNALS + MANDI & FUEL WIDGET
   ============================================================================ */
export const HomeDashboard: React.FC<DashboardCommonProps> = ({
  onNavigate,
  onOpenModal,
  onAskAi,
  savedIds,
  onToggleSave,
  selectedArea,
  liveIntel,
  marketplace: propMarketplace,
  onOpenLocationPicker,
}) => {
  const fallbackMarketplace = useLiveCommunityMarketplace(liveIntel);
  const marketplace = propMarketplace || fallbackMarketplace;

  const { weather, airQuality, traffic, mandiRates, fuelRates, alerts } = liveIntel;
  const shortArea = selectedArea.split(',')[0]?.trim() || selectedArea;
  const nowDateLabel = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  const topRoute = traffic.popularRoutes[0];
  const topCorridor = traffic.corridors[0];

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

  // Live Events from /api/v1/events via marketplace
  const homeEvents = marketplace.events.slice(0, 3);
  // Live Businesses from /api/v1/businesses + OpenStreetMap Overpass
  const popularPlaces = marketplace.businesses.slice(0, 3);

  return (
    <div className="space-y-4">
      {/* HERO BANNER */}
      <HeroBanner
        dashboardId="home"
        tag={<span className="text-sm font-medium text-blue-100">Good Day, Divyansh 👋</span>}
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
            <button
              type="button"
              onClick={() => onOpenLocationPicker?.()}
              className="bg-slate-900/55 hover:bg-slate-900/75 backdrop-blur-md border border-white/20 rounded-full px-3.5 py-1.5 flex items-center gap-2 text-xs transition cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-blue-300" />
              <span className="font-medium text-white">{selectedArea}</span>
              <span className="text-blue-200/90 ml-1 text-[11px] bg-white/15 hover:bg-white/25 px-2 py-0.5 rounded-full font-semibold">
                Change ›
              </span>
            </button>
            <div
              onClick={() => onNavigate('weather')}
              className="cursor-pointer bg-slate-900/55 hover:bg-slate-900/70 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 flex items-center gap-5 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-400/20 flex items-center justify-center">
                  <Sun className="w-6 h-6 text-amber-400 fill-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-white leading-none">{weather.temperatureC}°C</p>
                  <p className="text-xs text-blue-100 mt-0.5">{weather.conditionText}</p>
                </div>
              </div>
              <div className="h-8 w-px bg-white/15" />
              <div className="text-right">
                <p className="text-xs text-blue-100">{nowDateLabel}</p>
                <p className="text-sm font-bold text-white mt-0.5">{liveIntel.lastUpdated}</p>
              </div>
            </div>
          </div>
        }
        bottomPills={[
          {
            icon: <span className="text-amber-500">💬</span>,
            label: "What's the traffic like?",
            onClick: () => onAskAi(`What's the traffic like in ${selectedArea} right now?`),
          },
          {
            icon: <span className="text-blue-500">🌧️</span>,
            label: 'Will it rain today?',
            onClick: () => onAskAi(`Will it rain today in ${selectedArea}?`),
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

      {/* CITIZEN HELP & RAPID EMERGENCY ASSISTANCE HUB */}
      <div className="bg-gradient-to-r from-rose-50/90 via-indigo-50/70 to-blue-50/90 border border-indigo-100 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <span className="text-xl">🚨</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-100/90 px-2 py-0.5 rounded-md">
                Citizen Help Hub
              </span>
              <span className="text-xs font-extrabold text-slate-900">
                Need Immediate Help or Emergency Services in {shortArea}?
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              1-tap access to 24×7 emergency helplines, nearest trauma facilities, open pharmacies, verified doorstep repair, and civic alerts.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('emergency')}
            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <span>Emergency SOS (112 / 108)</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('services')}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <span>Doorstep Electrician / Plumber</span>
          </button>
          <button
            type="button"
            onClick={() => onAskAi(`I need urgent help in ${selectedArea}. What are the open emergency services nearby?`)}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask AI for Help</span>
          </button>
        </div>
      </div>

      {/* ROW 2: 4 LIVE SIGNAL CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-3.5">
        {/* 1. Unified Weather & Air Quality Card (3 cols) */}
        <div className="xl:col-span-3 bg-gradient-to-br from-white via-white to-sky-50/70 rounded-2xl p-4 shadow-card border border-slate-200/70 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
              <div className="flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Weather & Air Quality</span>
              </div>
              <span className={`px-2 py-0.5 rounded-md ${airQuality.colorBg} ${airQuality.colorText} text-[10px] font-bold`}>
                AQI {airQuality.aqiValue} • {airQuality.aqiCategory}
              </span>
            </div>
            <div className="flex items-center gap-3 my-1">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 flex items-center justify-center">
                <Sun className="w-7 h-7 text-amber-400 fill-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-slate-900 leading-none">{weather.temperatureC}°C</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  H: {weather.maxTempC}° &nbsp; L: {weather.minTempC}° • Feels {weather.feelsLikeC}°C
                </p>
              </div>
            </div>
            <p className="text-xs font-medium text-slate-700 mt-1.5 line-clamp-1">
              {weather.conditionText} • PM2.5: {airQuality.pm25} µg/m³
            </p>
            <div className="grid grid-cols-3 gap-1.5 pt-3 mt-3 border-t border-slate-100 text-[11px]">
              <div>
                <p className="font-bold text-slate-800 flex items-center gap-1">
                  <Droplets className="w-3 h-3 text-blue-500" /> {weather.humidity}%
                </p>
                <p className="text-[10px] text-slate-400">Humidity</p>
              </div>
              <div>
                <p className="font-bold text-slate-800 flex items-center gap-1">
                  <Wind className="w-3 h-3 text-blue-500" /> {weather.windKph} km/h
                </p>
                <p className="text-[10px] text-slate-400">Wind ({weather.windDir})</p>
              </div>
              <div>
                <p className="font-bold text-slate-800 flex items-center gap-1">
                  <CloudRain className="w-3 h-3 text-blue-500" /> {weather.chanceOfRain}%
                </p>
                <p className="text-[10px] text-slate-400">Rain Chance</p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('weather')}
            className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>Open Weather & AQI Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 2. Area Readiness & Step-Out Verdicts Card (2 cols) */}
        <div className="xl:col-span-2 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span>Area Readiness</span>
              </div>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">Score</span>
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <p className="text-2xl font-extrabold text-slate-900">
                {liveIntel.safetyScore}
                <span className="text-xs font-bold text-slate-400">/100</span>
              </p>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${liveIntel.safetyScore >= 75 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                {liveIntel.safetyStatus}
              </span>
            </div>
            <div className="mt-2.5 space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between bg-slate-50 px-2 py-1 rounded-lg">
                <span className="text-slate-600 font-medium">🚶 Outdoor Walk</span>
                <span className={`font-extrabold text-[10px] ${airQuality.aqiValue <= 120 && weather.chanceOfRain < 50 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {airQuality.aqiValue <= 120 && weather.chanceOfRain < 50 ? 'GO' : 'CAUTION'}
                </span>
              </div>
              <div className="flex items-center justify-between bg-slate-50 px-2 py-1 rounded-lg">
                <span className="text-slate-600 font-medium">🛵 2-Wheeler</span>
                <span className={`font-extrabold text-[10px] ${weather.chanceOfRain < 40 && airQuality.aqiValue <= 150 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {weather.chanceOfRain < 40 && airQuality.aqiValue <= 150 ? 'GO' : 'MASK UP'}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('intelligence')}
            className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>All 6 step-out verdicts</span>
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
                <span
                  className={`w-4 h-4 rounded-full ${
                    traffic.congestionLevel === 'Smooth'
                      ? 'bg-emerald-500'
                      : traffic.congestionLevel === 'Moderate'
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  } text-white flex items-center justify-center text-[10px]`}
                >
                  ✓
                </span>
                <span className="text-sm font-extrabold text-slate-900">{traffic.congestionLevel} Traffic</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 truncate max-w-[150px]">
                {topCorridor ? `${topCorridor.roadName} (${topCorridor.speedKmh} km/h)` : 'Live corridor monitoring'}
              </p>
            </div>
            <img
              src="./assets/crops/traffic-highway-thumb.webp"
              alt="Traffic preview"
              className="w-28 h-20 object-cover rounded-xl border border-slate-100 shrink-0"
            />
          </div>

          <div className="grid grid-cols-3 gap-1.5 pt-2.5 mt-2 border-t border-slate-100 text-[11px]">
            <div>
              <p className="font-bold text-slate-800">⚠️ {traffic.totalIncidents}</p>
              <p className="text-[10px] text-slate-400">Incidents</p>
            </div>
            <div>
              <p className="font-bold text-slate-800">🛣️ {traffic.averageSpeedKmh} km/h</p>
              <p className="text-[10px] text-slate-400">Avg speed</p>
            </div>
            <div>
              <p className="font-bold text-slate-800">🚗 {topRoute ? topRoute.durationText : '25 min'}</p>
              <p className="text-[10px] text-slate-400 truncate">
                {topRoute ? topRoute.route.split('→')[1]?.trim() || 'City Center' : 'City Center'}
              </p>
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
                  LIVE
                </span>
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                {weather.temperatureC}°C ({weather.conditionText}) • AQI {airQuality.aqiValue} ({airQuality.aqiCategory})
              </h3>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed line-clamp-3">
                {weather.outdoorActivityAdvice}{' '}
                {topCorridor
                  ? `Traffic on ${topCorridor.roadName} is ${topCorridor.status.toLowerCase()} at ${topCorridor.speedKmh} km/h.`
                  : ''}
              </p>
            </div>
            <img
              src="./assets/crops/ai-robot-umbrella.webp"
              alt="AI Assistant Robot"
              className="w-20 h-24 object-contain absolute right-2 top-3 pointer-events-none rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-1.5 mt-3 z-10">
            {[
              { label: 'Best time to commute', prompt: `When is the best time to commute in ${selectedArea} today?` },
              { label: 'Check alternate routes', prompt: `Suggest best traffic routes around ${selectedArea} right now` },
              { label: 'Rain & weather check', prompt: `What is the rain probability and forecast in ${selectedArea}?` },
              { label: 'Air quality & health tip', prompt: `Is AQI ${airQuality.aqiValue} safe for outdoor exercise in ${selectedArea}?` },
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

      {/* LIVE LOCAL FUEL & VEGETABLE MANDI RATES WIDGET (Connected to /api/v1/market-rates & /api/v1/fuel-rates) */}
      <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <span>Local Fuel & Vegetable Mandi Rates ({fuelRates.city})</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold">
                  ● Live APMC & OMC Feed
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Daily retail commodity prices & fuel benchmarks for {shortArea}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('fuel-rates')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Fuel className="w-3.5 h-3.5 text-rose-500" />
              <span>Fuel Stations</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('market-rates')}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
            >
              <span>Full Mandi & Fuel Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {/* 4 Fuel Pills */}
          <div
            onClick={() => onNavigate('fuel-rates')}
            className="cursor-pointer p-2.5 rounded-xl bg-rose-50/60 border border-rose-100 hover:border-rose-300 transition"
          >
            <p className="text-[10px] font-bold text-rose-700 flex items-center gap-1">⛽ Petrol</p>
            <p className="text-sm font-extrabold text-slate-900 mt-0.5">
              {fuelRates.petrol > 0 ? `₹${fuelRates.petrol.toFixed(2)}/L` : 'Awaiting API'}
            </p>
            <p className="text-[9px] text-slate-500 truncate">{fuelRates.city} OMC</p>
          </div>
          <div
            onClick={() => onNavigate('fuel-rates')}
            className="cursor-pointer p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 hover:border-blue-300 transition"
          >
            <p className="text-[10px] font-bold text-blue-700 flex items-center gap-1">🛢️ Diesel</p>
            <p className="text-sm font-extrabold text-slate-900 mt-0.5">
              {fuelRates.diesel > 0 ? `₹${fuelRates.diesel.toFixed(2)}/L` : 'Awaiting API'}
            </p>
            <p className="text-[9px] text-slate-500 truncate">{fuelRates.city} OMC</p>
          </div>
          <div
            onClick={() => onNavigate('fuel-rates')}
            className="cursor-pointer p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 hover:border-emerald-300 transition"
          >
            <p className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">🟢 CNG</p>
            <p className="text-sm font-extrabold text-slate-900 mt-0.5">
              {fuelRates.cng > 0 ? `₹${fuelRates.cng.toFixed(2)}/kg` : 'Awaiting API'}
            </p>
            <p className="text-[9px] text-slate-500 truncate">City Gas Retail</p>
          </div>
          <div
            onClick={() => onNavigate('fuel-rates')}
            className="cursor-pointer p-2.5 rounded-xl bg-orange-50/60 border border-orange-100 hover:border-orange-300 transition"
          >
            <p className="text-[10px] font-bold text-orange-700 flex items-center gap-1">🔥 LPG (14.2kg)</p>
            <p className="text-sm font-extrabold text-slate-900 mt-0.5">
              {fuelRates.lpg > 0 ? `₹${fuelRates.lpg.toFixed(0)}` : 'Awaiting API'}
            </p>
            <p className="text-[9px] text-slate-500 truncate">Domestic Refill</p>
          </div>

          {/* 4 Live Mandi Vegetable Pills or Empty Slot */}
          {mandiRates.length > 0 ? (
            mandiRates.slice(0, 4).map((m) => (
              <div
                key={m.commodity}
                onClick={() => onNavigate('market-rates')}
                className="cursor-pointer p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 hover:border-indigo-300 transition"
              >
                <p className="text-[10px] font-bold text-slate-700 truncate">
                  {m.icon} {m.commodity}
                </p>
                <div className="flex items-baseline justify-between mt-0.5">
                  <p className="text-sm font-extrabold text-slate-900">
                    ₹{m.pricePerKg}/{m.unit}
                  </p>
                  <span className="text-[9px] font-bold text-emerald-600">{m.trend}</span>
                </div>
                <p className="text-[9px] text-slate-400 truncate">{m.mandiName}</p>
              </div>
            ))
          ) : (
            <div
              onClick={() => onNavigate('market-rates')}
              className="col-span-2 sm:col-span-4 cursor-pointer p-2.5 rounded-xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-between text-xs text-slate-500 hover:bg-slate-100/70 transition"
            >
              <span className="font-medium text-[11px] truncate">🥦 Mandi Rates: Awaiting Agmarknet / APMC API Key</span>
              <span className="text-[10px] text-indigo-600 font-bold shrink-0 ml-2">Connect Feed ›</span>
            </div>
          )}
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
              <h3 className="text-sm font-extrabold text-slate-900">Upcoming Events in {shortArea}</h3>
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
            {homeEvents.length > 0 ? (
              homeEvents.map((ev) => {
                const isSaved = savedIds.includes(ev.id);
                return (
                  <div
                    key={ev.id}
                    onClick={() =>
                      onOpenModal({
                        title: ev.title,
                        category: `${ev.cat} • ${ev.organizer}`,
                        badge: ev.date,
                        location: ev.loc,
                        price: ev.price,
                        description: `Happening ${ev.time} at ${ev.loc}. Contextual Event Intelligence: ~${ev.expectedAttendance} attendees expected, Parking Pressure: ${ev.parkingPressure}. ${ev.exitWeatherAdvisory}`,
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
                          {ev.date}
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
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-indigo-50 text-indigo-700">
                        {ev.cat}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-50 text-emerald-700">
                        {ev.rsvp}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-3 py-10 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200 p-4">
                <p className="font-extrabold text-slate-700 text-xs">No Upcoming Events in {shortArea}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Local organizers and registered merchants can post events via the merchant portal.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Civic Updates (4 cols) */}
        <div className="xl:col-span-4 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-orange-500">📢</span>
              <h3 className="text-sm font-extrabold text-slate-900">Live Alerts & Civic Updates</h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('alerts')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {alerts.length > 0 ? (
              alerts.slice(0, 3).map((c, idx) => {
                const thumbs = [
                  './assets/crops/civic-water.webp',
                  './assets/crops/civic-road.webp',
                  './assets/crops/civic-gov.webp',
                ];
                return (
                  <div
                    key={c.id}
                    onClick={() => onNavigate('alerts')}
                    className="cursor-pointer flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200/70 transition"
                  >
                    <img
                      src={thumbs[idx % thumbs.length]}
                      alt={c.category}
                      className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-100"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${c.badgeClass}`}>
                          {c.category.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-slate-400">{c.timeAgo}</span>
                      </div>
                      <h4 className="text-xs font-extrabold text-slate-900 truncate mt-1">{c.title}</h4>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">📍 {c.areaDescription}</p>
                      <p className="text-[10px] text-slate-500 truncate">🏛️ {c.sender}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200 p-4">
                <p className="font-extrabold text-slate-700 text-xs">All Civic Utilities Normal</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  No NDMA alerts or municipal notices for {shortArea}.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Popular in Your Area (3 cols) */}
        <div className="xl:col-span-3 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-extrabold text-slate-900">Popular in {shortArea}</h3>
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
            {popularPlaces.length > 0 ? (
              popularPlaces.map((pl) => {
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
                        className="text-slate-400 hover:text-indigo-600 cursor-pointer"
                      >
                        <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-indigo-600 text-indigo-600' : ''}`} />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200 p-4">
                <p className="font-extrabold text-slate-700 text-xs">No Places in Active Radius</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  OpenStreetMap places and verified merchants will populate here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   2. BUSINESSES DASHBOARD (Page 4 Desktop) — WIRED TO /api/v1/businesses + OVERPASS
   ============================================================================ */
export const BusinessesDashboard: React.FC<DashboardCommonProps> = ({
  onNavigate,
  onOpenMerchantRegistration,
  onOpenModal,
  onAskAi,
  savedIds,
  onToggleSave,
  selectedArea,
  liveIntel,
  marketplace: propMarketplace,
}) => {
  const fallbackMarketplace = useLiveCommunityMarketplace(liveIntel);
  const marketplace = propMarketplace || fallbackMarketplace;

  const [searchParams, setSearchParams] = useSearchParams();
  const urlCat = searchParams.get('cat') || 'All';
  const [selectedCat, setSelectedCat] = useState(urlCat);

  useEffect(() => {
    if (urlCat !== selectedCat) {
      setSelectedCat(urlCat);
    }
  }, [urlCat]);

  const handleSelectCategory = (cat: string) => {
    setSelectedCat(cat);
    const next = new URLSearchParams(searchParams);
    if (cat === 'All') {
      next.delete('cat');
    } else {
      next.set('cat', cat);
    }
    setSearchParams(next, { replace: true });
  };

  const [localSearch, setLocalSearch] = useState('');
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'Nearest' | 'Top Rated' | 'Relevance'>('Nearest');
  const [minRating, setMinRating] = useState<'Any' | '4.5+' | '4.0+'>('Any');

  const shortArea = selectedArea.split(',')[0]?.trim() || selectedArea;

  const categories = [
    'All',
    'Restaurants',
    'Cafés',
    'Groceries',
    'Pharmacies',
    'Electronics',
    'Fitness',
    'Salons',
    'Services',
  ];

  const filteredBiz = marketplace.businesses
    .filter((b) => {
      const matchesCat =
        selectedCat === 'All' ||
        b.cat.toLowerCase().includes(selectedCat.toLowerCase()) ||
        selectedCat.toLowerCase().includes(b.cat.toLowerCase());
      const matchesQuery =
        !localSearch ||
        b.name.toLowerCase().includes(localSearch.toLowerCase()) ||
        b.sub.toLowerCase().includes(localSearch.toLowerCase()) ||
        b.cat.toLowerCase().includes(localSearch.toLowerCase());
      const numRating = parseFloat(b.rating);
      const matchesRating =
        minRating === 'Any' || (minRating === '4.5+' ? numRating >= 4.5 : numRating >= 4.0);
      const matchesOpen = !openNowOnly || b.status === 'Open';
      return matchesCat && matchesQuery && matchesRating && matchesOpen;
    })
    .sort((a, b) => {
      if (sortBy === 'Top Rated') return parseFloat(b.rating) - parseFloat(a.rating);
      if (sortBy === 'Nearest') return a.distanceKm - b.distanceKm;
      return 0;
    });

  const browseGrid = [
    { name: 'Restaurants', count: 'Live OSM & Verified', icon: Utensils, color: 'bg-orange-50 text-orange-600' },
    { name: 'Cafés', count: 'Work & Hangout', icon: Coffee, color: 'bg-amber-50 text-amber-600' },
    { name: 'Groceries', count: 'Supermarkets & Mandi', icon: ShoppingBag, color: 'bg-violet-50 text-violet-600' },
    { name: 'Pharmacies', count: '24×7 Chemists', icon: Hospital, color: 'bg-rose-50 text-rose-600' },
    { name: 'Electronics', count: 'Mobiles & Repair', icon: GraduationCap, color: 'bg-blue-50 text-blue-600' },
    { name: 'Fitness', count: 'Gyms & Arenas', icon: Dumbbell, color: 'bg-indigo-50 text-indigo-600' },
    { name: 'Salons', count: 'Grooming & Spa', icon: Scissors, color: 'bg-pink-50 text-pink-600' },
    { name: 'Services', count: 'Home & Utility', icon: Wrench, color: 'bg-teal-50 text-teal-600' },
    { name: 'All', count: `${marketplace.businesses.length} discovered`, icon: MoreHorizontal, color: 'bg-slate-100 text-slate-600' },
  ];

  return (
    <div className="space-y-4">
      <HeroBanner
        dashboardId="businesses"
        tag={
          <>
            <MapPin className="w-3.5 h-3.5 text-blue-300" />
            <span>Businesses in {selectedArea}</span>
          </>
        }
        title="Discover Local Businesses"
        subtitle="Real places. Real people. Right around you."
        description={`Live OpenStreetMap Overpass POI discovery & verified merchant storefronts around ${shortArea} (${marketplace.businesses.length} active listings).`}
        rightWidget={
          <div className="flex flex-col gap-2.5 w-full lg:w-[360px]">
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: ShieldCheck, title: 'OSM + API Live', sub: `${marketplace.businesses.length} nearby places`, cls: 'text-blue-300' },
                { icon: Radio, title: 'Live Status', sub: 'Open/Closed & distance', cls: 'text-emerald-300' },
                { icon: MessageSquare, title: 'Direct Call', sub: 'Zero middleman commission', cls: 'text-amber-300' },
                { icon: Sparkles, title: 'AI Discovery', sub: `Grounded in ${shortArea}`, cls: 'text-purple-300' },
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
          </div>
        }
      />

      {/* Category Pills Strip */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => handleSelectCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition shadow-sm border cursor-pointer ${
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
        <div className="flex-1 min-w-[200px] flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200/70">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder={`Search ${marketplace.businesses.length} businesses in ${shortArea} (e.g. cafe, chemist, mart)...`}
            className="bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none w-full"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() =>
              setSortBy((prev) =>
                prev === 'Nearest' ? 'Top Rated' : prev === 'Top Rated' ? 'Relevance' : 'Nearest'
              )
            }
            className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 font-medium text-slate-700 transition cursor-pointer"
          >
            <span className="text-slate-400 mr-1">Sort by:</span>{' '}
            <strong className="text-slate-800">{sortBy}</strong> ⌄
          </button>
          <button
            type="button"
            onClick={() =>
              setMinRating((prev) => (prev === 'Any' ? '4.5+' : prev === '4.5+' ? '4.0+' : 'Any'))
            }
            className={`px-3 py-1.5 rounded-lg border font-medium transition cursor-pointer ${
              minRating !== 'Any'
                ? 'bg-amber-50 border-amber-200 text-amber-800 font-bold'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200/80 text-slate-700'
            }`}
          >
            <span className="text-slate-400 mr-1">Rating:</span> {minRating} ⌄
          </button>
          <button
            type="button"
            onClick={() => setOpenNowOnly((v) => !v)}
            className={`px-3 py-1.5 rounded-lg border font-semibold transition cursor-pointer ${
              openNowOnly
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-slate-50 border-slate-200/80 text-slate-700'
            }`}
          >
            {openNowOnly ? '● Open Now' : 'Open Now'}
          </button>
          {(selectedCat !== 'All' || localSearch || minRating !== 'Any') && (
            <button
              type="button"
              onClick={() => {
                setSelectedCat('All');
                setLocalSearch('');
                setMinRating('Any');
              }}
              className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 font-semibold text-rose-600 text-[11px]"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Main Content Split: Left (8 cols) + Right Map (4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-8 space-y-4">
          {/* Discovered Businesses Near You */}
          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> Businesses Near {shortArea} ({filteredBiz.length})
                </h3>
                <p className="text-[11px] text-slate-500">
                  Live commercial POIs via OpenStreetMap Overpass & FastAPI `/api/v1/businesses`
                </p>
              </div>
              <button
                type="button"
                onClick={() => marketplace.refreshMarketplace()}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                {marketplace.loading ? 'Syncing...' : '↻ Refresh Live POIs'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {filteredBiz.slice(0, 8).map((b) => {
                const isSaved = savedIds.includes(b.id);
                return (
                  <div
                    key={b.id}
                    onClick={() =>
                      onOpenModal({
                        title: b.name,
                        subtitle: `${b.sub} (${b.source})`,
                        category: b.cat,
                        badge: `${b.status} • ${b.closes}`,
                        rating: `${b.rating} ${b.reviews}`,
                        location: `${b.dist} away • ${b.address}`,
                        description: `${b.description}\n\n📞 Phone / WhatsApp: ${b.phone}\n📦 Active Catalog: ${b.activeProductsCount} products • ${b.activeOffersCount} live offers.`,
                        primaryActionLabel: `Call ${b.phone}`,
                        image: b.img,
                      })
                    }
                    className="cursor-pointer rounded-xl border border-slate-200/80 overflow-hidden hover:shadow-md transition bg-white group flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-28 overflow-hidden">
                        <img
                          src={b.img}
                          alt={b.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-emerald-500 text-white text-[10px] font-bold shadow">
                          {b.status} • {b.dist}
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
                    <div className="px-2.5 pb-2.5 flex items-center justify-between text-[10px] text-indigo-600 font-bold">
                      <span className="truncate">{b.source.includes('OpenStreetMap') ? '● Live OSM POI' : '✓ Verified'}</span>
                      <span>📞 Call ›</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Browse by Category */}
          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <h3 className="text-sm font-extrabold text-slate-900 mb-3">Browse by Category in {shortArea}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2.5">
              {browseGrid.map((cat) => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setSelectedCat(cat.name)}
                  className="p-2.5 rounded-xl border border-slate-200/70 hover:border-indigo-300 hover:bg-indigo-50/30 flex items-center justify-between gap-2 text-left transition cursor-pointer"
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
              centerLabel={selectedArea}
              centerCoords={{ lat: liveIntel.location.lat, lng: liveIntel.location.lng }}
              pois={liveIntel.nearbyPois}
            />
          </div>
        </div>
      </div>

      {/* Bottom Row: AI Recommendations for You */}
      <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" /> AI Recommendations for {shortArea}
            </h3>
            <p className="text-[11px] text-slate-500">
              Personalized suggestions based on your location ({selectedArea}), weather ({liveIntel.weather.temperatureC}°C) and local activity
            </p>
          </div>
          <button
            type="button"
            onClick={() => onAskAi(`Recommend the best local businesses in ${selectedArea} for tonight`)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>Ask AI</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {[
            {
              title: 'Best Places for Dinner Tonight',
              sub: `Popular and open now near ${shortArea}`,
              img: './assets/crops/biz-ai-dinner.webp',
            },
            {
              title: 'Good Cafes to Work From',
              sub: `Quiet cafes with Wi-Fi in ${shortArea}`,
              img: './assets/crops/biz-ai-cafe.webp',
            },
            {
              title: 'Fitness Options Nearby',
              sub: `Top rated gyms within 2 km of ${shortArea}`,
              img: './assets/crops/biz-ai-fitness.webp',
            },
            {
              title: 'Essential Services Nearby',
              sub: `24×7 pharmacies & clinics in ${shortArea}`,
              img: './assets/crops/biz-ai-essential.webp',
            },
          ].map((rec) => (
            <div
              key={rec.title}
              onClick={() => onAskAi(`Show me ${rec.title} in ${selectedArea}`)}
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
   3. PRODUCT DASHBOARD (Page 6 Desktop) — WIRED TO /api/v1/products & MANDI/FUEL
   ============================================================================ */
export const ProductsDashboard: React.FC<DashboardCommonProps> = ({
  onNavigate,
  onOpenModal,
  onAskAi,
  selectedArea,
  liveIntel,
  marketplace: propMarketplace,
  onAddToCart,
}) => {
  const fallbackMarketplace = useLiveCommunityMarketplace(liveIntel);
  const marketplace = propMarketplace || fallbackMarketplace;

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCat = searchParams.get('cat') || 'All';
  const [selectedCat, setSelectedCat] = useState(urlCat);

  useEffect(() => {
    if (urlCat !== selectedCat) {
      setSelectedCat(urlCat);
    }
  }, [urlCat]);

  const handleSelectCategory = (cat: string) => {
    setSelectedCat(cat);
    const next = new URLSearchParams(searchParams);
    if (cat === 'All') {
      next.delete('cat');
    } else {
      next.set('cat', cat);
    }
    setSearchParams(next, { replace: true });
  };

  const [addedIds, setAddedIds] = useState<string[]>([]);

  const shortArea = selectedArea.split(',')[0]?.trim() || selectedArea;
  const { mandiRates, fuelRates } = liveIntel;

  const categories = [
    'All',
    'Groceries',
    'Bakery & Dairy',
    'Medicines',
    'Electronics',
    'Home & Kitchen',
  ];

  const filteredProducts = marketplace.products.filter(
    (p) => selectedCat === 'All' || p.cat.toLowerCase().includes(selectedCat.toLowerCase())
  );

  const nearbyStores = marketplace.businesses.slice(0, 4);

  const handleAdd = (p: any) => {
    setAddedIds((prev) => (prev.includes(p.id) ? prev : [...prev, p.id]));
    onAddToCart?.({
      id: p.id,
      name: p.name,
      price: p.localPriceNum || 99,
      oldPrice: p.oldPrice,
      image: p.img,
      store: p.store || 'Apna Super Mart',
      dist: p.dist || '650m',
      quantity: 1,
      cat: p.cat,
    });
  };

  return (
    <div className="space-y-4">
      <HeroBanner
        dashboardId="products"
        tag={
          <>
            <MapPin className="w-3.5 h-3.5 text-blue-300" />
            <span>{selectedArea}</span>
          </>
        }
        title={
          <>
            Everyday Products,
            <br />
            <span className="text-[#93C5FD]">Right Around You</span>
          </>
        }
        description={`Compare offline neighborhood store prices vs. quick-commerce apps in ${shortArea} and check live APMC Mandi & Fuel benchmarks.`}
        bottomPills={[
          { icon: <span>🧺</span>, label: 'Groceries nearby', onClick: () => setSelectedCat('Groceries') },
          { icon: <span>🥛</span>, label: 'Fresh Dairy & Bakery', onClick: () => setSelectedCat('Bakery & Dairy') },
          { icon: <span>💊</span>, label: 'Pharmacies open now', onClick: () => setSelectedCat('Medicines') },
          { icon: <span>📱</span>, label: 'Electronics stores', onClick: () => setSelectedCat('Electronics') },
        ]}
        primaryCta={{
          label: 'Compare Offline vs Online Savings',
          onClick: () => handleSelectCategory('Groceries'),
        }}
      />

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => handleSelectCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition cursor-pointer ${
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
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <span>🔥</span> Popular Products & Offline vs. Online Price Comparison ({shortArea})
              </h3>
              <span className="text-[11px] font-semibold text-emerald-600">
                ● Live Store Inventory
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
              {filteredProducts.map((p) => {
                const isAdded = addedIds.includes(p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      navigate(`/products/${p.id}`);
                      onOpenModal({
                        title: p.name,
                        subtitle: `${p.store} • ${p.dist} away`,
                        category: `${p.cat} • Offline vs Online Comparison`,
                        badge: p.discount || 'Verified Price',
                        price: `Local: ${p.price} (Online: ${p.oldPrice || p.price})`,
                        location: p.storeAddress,
                        description: `${p.freshnessLabel}. Buy directly from ${p.store} at ${p.price} instead of ${p.oldPrice || p.price} on ${p.onlineProvider} (Save ₹${p.savingsAmount}).`,
                        primaryActionLabel: 'Reserve for Pickup / Delivery',
                        image: p.img,
                      });
                    }}
                    className="cursor-pointer rounded-xl border border-slate-200/80 p-3 flex flex-col justify-between hover:shadow-md transition bg-white relative"
                  >
                    <div>
                      <div className="relative h-24 rounded-lg overflow-hidden bg-slate-50 mb-2">
                        <img src={p.img} alt={p.name} className="w-full h-full object-contain" />
                        {p.discount && (
                          <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-emerald-500 text-white text-[9px] font-extrabold">
                            {p.discount}
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
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAdd(p);
                          }}
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
                      <div className="flex items-baseline gap-1.5">
                        <p className="text-sm font-extrabold text-slate-900">{p.price}</p>
                        {p.oldPrice && (
                          <span className="text-[10px] text-slate-400 line-through">{p.oldPrice}</span>
                        )}
                      </div>
                      <p className="text-[10px] text-emerald-600 font-semibold mt-0.5 truncate">
                        🏪 {p.store} ({p.dist})
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Nearby Stores */}
          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-900">Nearby Stores in {shortArea}</h3>
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
                  key={st.id}
                  onClick={() =>
                    onOpenModal({
                      title: st.name,
                      subtitle: st.sub,
                      category: 'Verified Local Merchant',
                      badge: st.status,
                      rating: `${st.rating} ${st.reviews}`,
                      location: `${st.dist} away • ${st.address}`,
                      description: `${st.description}\n📞 Direct Store Contact: ${st.phone}`,
                      primaryActionLabel: 'View Store Catalog',
                      image: st.img,
                    })
                  }
                  className="cursor-pointer rounded-xl border border-slate-200/80 overflow-hidden hover:shadow-md transition bg-white"
                >
                  <div className="relative h-24">
                    <img src={st.img} alt={st.name} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded bg-slate-900/80 text-white text-[9px] font-bold">
                      {st.status}
                    </span>
                  </div>
                  <div className="p-2.5">
                    <h4 className="text-xs font-extrabold text-slate-900 truncate">{st.name}</h4>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                      <span className="text-amber-600 font-bold">★ {st.rating} {st.reviews}</span>
                      <span>📍 {st.dist}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate">{st.cat}</p>
                    <p className="text-[10px] font-bold text-emerald-600 mt-0.5">{st.closes}</p>
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
                <h3 className="text-xs font-extrabold text-slate-900">AI Shopping Insights for {shortArea}</h3>
                <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[9px] font-bold">LIVE</span>
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
                { title: `Best places to buy fresh vegetables in ${shortArea}`, sub: 'APMC Mandi linked stores within 1 km', icon: '🥦' },
                { title: `24×7 Pharmacies open now in ${shortArea}`, sub: 'With doorstep delivery options', icon: '💊' },
                { title: `Electronics stores with ongoing offers in ${shortArea}`, sub: 'Smart TVs, accessories and repair', icon: '📱' },
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

        {/* Right Column (4 cols): Today's Best Deals + Live APMC Mandi & Fuel Price Insights */}
        <div className="xl:col-span-4 space-y-4">
          {/* Today's Best Deals Near You */}
          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-900">Today's Best Deals in {shortArea}</h3>
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
              {marketplace.products.slice(0, 4).map((deal) => (
                <div
                  key={deal.id}
                  onClick={() => handleAdd(deal)}
                  className="cursor-pointer p-2.5 rounded-xl border border-slate-200/80 hover:border-blue-300 transition bg-slate-50/40"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{deal.name}</p>
                    <p className="text-xs font-extrabold text-slate-900 mt-0.5">
                      {deal.price}{' '}
                      {deal.oldPrice && (
                        <span className="text-[10px] text-slate-400 line-through font-normal">{deal.oldPrice}</span>
                      )}
                    </p>
                    <span className="inline-block px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 text-[9px] font-extrabold mt-0.5">
                      {deal.discount || `Save ${deal.savingsPercent}%`}
                    </span>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">{deal.store}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live APMC Mandi & Fuel Price Insights for Your Area */}
          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <span className="text-blue-600">📈</span> Live Mandi & Fuel Rates ({fuelRates.city})
              </h3>
              <button
                type="button"
                onClick={() => onNavigate('market-rates')}
                className="text-xs font-semibold text-blue-600 flex items-center gap-1"
              >
                <span>Full table</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5">
              {mandiRates.map((row) => (
                <div
                  key={row.commodity}
                  onClick={() => onNavigate('market-rates')}
                  className="cursor-pointer flex items-center justify-between gap-2 pb-2 border-b border-slate-100"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{row.icon}</span>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {row.commodity} (1 {row.unit})
                      </p>
                      <p className="text-[10px] text-slate-400">{row.mandiName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-extrabold text-slate-900">₹{row.pricePerKg}</p>
                    <p className="text-[10px] font-bold text-emerald-600">{row.trend}</p>
                  </div>
                </div>
              ))}

              {/* Fuel Benchmark Row */}
              <div
                onClick={() => onNavigate('fuel-rates')}
                className="cursor-pointer pt-1 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-extrabold text-slate-900">⛽ Petrol / Diesel / CNG</p>
                  <p className="text-[10px] text-slate-500">{fuelRates.city} OMC Retail</p>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-slate-900">
                    {fuelRates.petrol > 0
                      ? `₹${fuelRates.petrol.toFixed(2)} / ₹${fuelRates.diesel.toFixed(2)}`
                      : 'Awaiting API'}
                  </p>
                  <p className="text-[10px] font-bold text-emerald-600">
                    {fuelRates.cng > 0 ? `CNG ₹${fuelRates.cng.toFixed(2)}/kg` : 'Pending OMC Key'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   4. SERVICES DASHBOARD (Page 8 Desktop) — WIRED TO /api/v1/services
   ============================================================================ */
export const ServicesDashboard: React.FC<DashboardCommonProps> = ({
  onOpenModal,
  onAskAi,
  selectedArea,
  liveIntel,
  marketplace: propMarketplace,
  onBookService,
}) => {
  const fallbackMarketplace = useLiveCommunityMarketplace(liveIntel);
  const marketplace = propMarketplace || fallbackMarketplace;

  const [selectedCat, setSelectedCat] = useState('All');
  const shortArea = selectedArea.split(',')[0]?.trim() || selectedArea;

  const serviceCats = [
    { label: 'All', icon: '⊞' },
    { label: 'Home Repair', icon: '🔧' },
    { label: 'Cleaning', icon: '🧹' },
    { label: 'Beauty & Salon', icon: '✂️' },
    { label: 'Tutoring', icon: '📚' },
    { label: 'Health', icon: '🏥' },
    { label: 'Moving', icon: '🚚' },
  ];

  const filteredServices = marketplace.services.filter(
    (s) => selectedCat === 'All' || s.cat.toLowerCase().includes(selectedCat.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <HeroBanner
        dashboardId="services"
        tag={
          <>
            <MapPin className="w-3.5 h-3.5 text-blue-300" />
            <span>{selectedArea}</span>
          </>
        }
        title="Local Services"
        subtitle="Trusted people. Reliable services. Right in your area."
        description={`Book verified home professionals in ${shortArea} with transparent pricing and direct phone/WhatsApp contact.`}
        bottomPills={[
          { icon: <span>🛡️</span>, label: 'Verified professionals' },
          { icon: <span>📍</span>, label: `Local in ${shortArea}` },
          { icon: <span>⭐</span>, label: 'Ratings & reviews' },
          { icon: <span>⚡</span>, label: 'Instant Emergency Repair', onClick: () => setSelectedCat('Home Repair') },
        ]}
        askAiWidget={{
          placeholder: `Search for a service in ${shortArea}...`,
          chips: ['AC Repair', 'Electrician', 'Plumber', 'Deep Cleaning'],
          onAsk: (q) => onAskAi(`Find trusted local professionals for ${q} in ${selectedArea}`),
        }}
      />

      {/* Service Category Strip */}
      <div className="bg-white rounded-2xl p-3 shadow-card border border-slate-200/70 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        {serviceCats.map((c) => (
          <button
            key={c.label}
            type="button"
            onClick={() => setSelectedCat(c.label)}
            className={`flex flex-col items-center gap-1.5 min-w-[82px] py-1.5 px-2 rounded-xl transition cursor-pointer ${
              selectedCat === c.label ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
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
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> Available Services in {shortArea} ({filteredServices.length})
                </h3>
                <p className="text-[11px] text-slate-500">Live verified doorstep professionals in {shortArea}</p>
              </div>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                ✓ 100% Background Verified
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {filteredServices.map((srv) => (
                <div
                  key={srv.id}
                  className="rounded-xl border border-slate-200/80 overflow-hidden bg-white flex flex-col justify-between hover:shadow-md transition"
                >
                  <div>
                    <div className="relative h-28">
                      <img src={srv.img} alt={srv.name} className="w-full h-full object-cover" />
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-emerald-500 text-white text-[9px] font-bold">
                        {srv.dist} • {srv.exp}
                      </span>
                    </div>
                    <div className="p-2.5">
                      <h4 className="text-xs font-extrabold text-slate-900 truncate">{srv.name}</h4>
                      <p className="text-[11px] text-amber-600 font-bold mt-0.5">
                        ★ {srv.rating} {srv.reviews}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">{srv.role}</p>
                      <p className="text-xs font-extrabold text-slate-900 mt-1">{srv.price}</p>
                      <p className="text-[10px] font-semibold text-emerald-600">{srv.avail}</p>
                    </div>
                  </div>
                  <div className="px-2.5 pb-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (onBookService) {
                          onBookService(srv);
                        } else {
                          onOpenModal({
                            title: srv.name,
                            subtitle: srv.role,
                            category: `${srv.cat} • Verified Local Pro`,
                            price: `${srv.price} (${srv.priceUnit})`,
                            rating: `${srv.rating} ${srv.reviews}`,
                            location: `${srv.dist} away in ${srv.locality}, ${srv.city}`,
                            description: `${srv.description}\n\n📞 Phone / WhatsApp: ${srv.phone}\n🕒 Hours: ${srv.timing}`,
                            primaryActionLabel: `Book / Call ${srv.phone}`,
                            image: srv.img,
                          });
                        }
                      }}
                      className="w-full py-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white text-xs font-bold transition cursor-pointer"
                    >
                      Book / Call Now
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
                  <ShieldCheck className="w-4 h-4 text-blue-600" /> Direct-Call Local Professionals ({shortArea})
                </h3>
                <p className="text-[11px] text-slate-500">Background-verified specialists in {selectedArea}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {marketplace.services.slice(0, 3).map((pro) => (
                <div key={pro.id} className="p-3 rounded-xl border border-slate-200/80 flex flex-col justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <img src={pro.img} alt={pro.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                    <div className="min-w-0">
                      <h4 className="text-xs font-extrabold text-slate-900 truncate">{pro.name}</h4>
                      <p className="text-[10px] text-amber-600 font-bold">
                        ★ {pro.rating} {pro.reviews}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">📍 {pro.locality} ({pro.dist})</p>
                      <p className="text-[10px] text-slate-500 truncate">🔧 {pro.cat}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onOpenModal({
                        title: `Contact ${pro.name}`,
                        subtitle: pro.role,
                        category: 'Verified Professional',
                        rating: `${pro.rating} ${pro.reviews}`,
                        location: `${pro.locality}, ${pro.city}`,
                        description: `${pro.description}\nDirect Phone / WhatsApp: ${pro.phone}`,
                        primaryActionLabel: `Call ${pro.phone}`,
                        image: pro.img,
                      })
                    }
                    className="w-full py-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Phone className="w-3 h-3" /> Contact ({pro.phone})
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Map + AI Recommendations */}
        <div className="xl:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-sm font-extrabold text-slate-900">Service Providers Near {shortArea}</h3>
            </div>
            <InteractiveMap
              heightClass="h-56"
              centerLabel={selectedArea}
              centerCoords={{ lat: liveIntel.location.lat, lng: liveIntel.location.lng }}
              pois={liveIntel.nearbyPois}
            />
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-extrabold text-slate-900">AI Service Insights ({shortArea})</h3>
              <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[9px] font-bold">LIVE</span>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              Based on {shortArea} weather ({liveIntel.weather.temperatureC}°C) and local demand
            </p>
            <div className="space-y-2.5">
              {[
                { icon: '❄️', title: `AC servicing in ${shortArea}`, sub: `Current temp is ${liveIntel.weather.temperatureC}°C — book same-day slot` },
                { icon: '🧹', title: `Deep cleaning services in ${shortArea}`, sub: 'Top rated providers with eco-friendly supplies' },
                { icon: '⚡', title: `Emergency electricians in ${shortArea}`, sub: 'Verified technicians within 1 km' },
                { icon: '🚰', title: `Plumbing & water motor repair`, sub: 'Same-day visit across your block' },
              ].map((item) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => onAskAi(item.title)}
                  className="w-full p-2.5 rounded-xl border border-slate-200/70 hover:border-indigo-300 flex items-center justify-between gap-2 text-left transition cursor-pointer"
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
   5. OFFERS DASHBOARD (Page 10 Desktop) — WIRED TO /api/v1/offers
   ============================================================================ */
export const OffersDashboard: React.FC<DashboardCommonProps> = ({
  onNavigate,
  onOpenMerchantRegistration,
  onOpenModal,
  onAskAi,
  savedIds,
  onToggleSave,
  selectedArea,
  liveIntel,
  marketplace: propMarketplace,
}) => {
  const fallbackMarketplace = useLiveCommunityMarketplace(liveIntel);
  const marketplace = propMarketplace || fallbackMarketplace;

  const [selectedCat, setSelectedCat] = useState('All Offers');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const shortArea = selectedArea.split(',')[0]?.trim() || selectedArea;

  const offerCats = [
    { label: 'All Offers', icon: '⊞' },
    { label: 'Food & Dining', icon: '🍴' },
    { label: 'Groceries', icon: '🛍️' },
    { label: 'Salon & Spa', icon: '✂️' },
    { label: 'Fitness & Health', icon: '🏋️' },
    { label: 'Services', icon: '🔧' },
  ];

  const filteredOffers = marketplace.offers.filter(
    (o) => selectedCat === 'All Offers' || o.cat.toLowerCase().includes(selectedCat.toLowerCase())
  );

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2200);
  };

  return (
    <div className="space-y-4">
      <HeroBanner
        dashboardId="offers"
        tag={
          <>
            <MapPin className="w-3.5 h-3.5 text-blue-300" />
            <span>{selectedArea}</span>
          </>
        }
        title="Best Local Offers"
        subtitle="Save more. Explore more. Support local."
        description={`Exclusive verified deals and instant coupon codes from businesses in ${shortArea} (powered by /api/v1/offers).`}
        bottomPills={[
          { icon: <span>🛡️</span>, label: 'Verified offers' },
          { icon: <span>🏪</span>, label: `Local stores in ${shortArea}` },
          { icon: <span>⚡</span>, label: 'Instant Coupon Redemption', onClick: () => setSelectedCat('All Offers') },
        ]}
        rightWidget={
          <div className="w-full lg:w-[340px] bg-white/12 backdrop-blur-md border border-white/20 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-2.5">
              <div className="w-10 h-10 rounded-xl bg-pink-500/30 border border-pink-300/40 flex items-center justify-center">
                <Gift className="w-5 h-5 text-pink-200" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-white">Local Neighborhood Savings</p>
                <p className="text-[11px] text-blue-100/85">
                  Exclusive in-store discounts, BOGO & coupons across {shortArea}.
                </p>
              </div>
            </div>
            <div className="pt-2.5 border-t border-white/15 flex items-center justify-between text-[11px] font-semibold text-blue-100">
              <span>🎟️ Verified Promos</span>
              <span>⚡ Direct Walk-in</span>
              <span>💰 Zero Convenience Fee</span>
            </div>
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
            className={`flex flex-col items-center gap-1 min-w-[95px] py-1.5 px-2 rounded-xl transition cursor-pointer ${
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
                <span>🔥</span> Live Offers in {shortArea} ({filteredOffers.length})
              </h3>
              <span className="text-xs font-semibold text-emerald-600">● Instant Coupon Redemption</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {filteredOffers.map((off) => {
                const isSaved = savedIds.includes(off.id);
                return (
                  <div
                    key={off.id}
                    className="rounded-xl border border-slate-200/80 overflow-hidden bg-white flex flex-col justify-between hover:shadow-md transition"
                  >
                    <div>
                      <div className="relative h-28">
                        <img src={off.img} alt={off.store} className="w-full h-full object-cover" />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-rose-600 text-white text-[9px] font-extrabold shadow">
                          {off.badge}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            onToggleSave({
                              id: off.id,
                              title: `${off.store} — ${off.badge}`,
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
                        <p className="text-[10px] font-bold text-slate-500 truncate">{off.store}</p>
                        <h4 className="text-xs font-extrabold text-slate-900 line-clamp-2 mt-0.5">{off.title}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{off.sub}</p>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[9px] font-semibold">
                            {off.cat}
                          </span>
                          <span className="text-[10px] text-rose-600 font-bold">⏳ {off.valid}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">📍 {off.dist} away</p>
                      </div>
                    </div>
                    <div className="px-2.5 pb-2.5 space-y-1.5">
                      <button
                        type="button"
                        onClick={() => handleCopyCode(off.code)}
                        className="w-full py-1 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-extrabold flex items-center justify-between cursor-pointer"
                      >
                        <span>Code: {off.code}</span>
                        <span className="text-indigo-600 flex items-center gap-0.5">
                          <Copy className="w-3 h-3" /> {copiedCode === off.code ? 'Copied!' : 'Copy'}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onOpenModal({
                            title: `${off.store}: ${off.title}`,
                            subtitle: off.sub,
                            category: `${off.cat} • Code: ${off.code}`,
                            badge: off.badge,
                            location: `${off.dist} away • ${off.storeAddress}`,
                            description: `${off.description}\n\nCoupon Code: ${off.code} (${off.valid})\nStore Contact: ${off.phone}`,
                            primaryActionLabel: `Redeem Code ${off.code}`,
                            image: off.img,
                          })
                        }
                        className="w-full py-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white text-xs font-bold transition cursor-pointer"
                      >
                        View & Redeem
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="xl:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-sm font-extrabold text-slate-900">Offers Around {shortArea}</h3>
            </div>
            <InteractiveMap
              heightClass="h-52"
              centerLabel={selectedArea}
              centerCoords={{ lat: liveIntel.location.lat, lng: liveIntel.location.lng }}
              pois={liveIntel.nearbyPois}
            />
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-extrabold text-slate-900">AI Recommended Deals ({shortArea})</h3>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">Based on your location and active merchant promos</p>
            <div className="space-y-2">
              {[
                { icon: '🍴', title: `Best food deals in ${shortArea}`, sub: 'Up to 50% OFF at nearby restaurants' },
                { icon: '✂️', title: `Salon offers in ${shortArea}`, sub: 'Popular grooming packages nearby' },
                { icon: '🏋️', title: `Gym memberships with discounts`, sub: 'Free trial + annual savings' },
                { icon: '🛍️', title: `Deals on daily essentials`, sub: 'Compare local supermarket vs online' },
              ].map((rec) => (
                <button
                  key={rec.title}
                  type="button"
                  onClick={() => onAskAi(rec.title)}
                  className="w-full p-2.5 rounded-xl border border-slate-200/70 hover:border-indigo-300 flex items-center justify-between gap-2 text-left transition cursor-pointer"
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
   6. EVENTS DASHBOARD (Page 12 Desktop) — WIRED TO /api/v1/events + CONTEXTUAL INTEL
   ============================================================================ */
export const EventsDashboard: React.FC<DashboardCommonProps> = ({
  onNavigate,
  onOpenMerchantRegistration,
  onOpenModal,
  onAskAi,
  selectedArea,
  liveIntel,
  marketplace: propMarketplace,
}) => {
  const fallbackMarketplace = useLiveCommunityMarketplace(liveIntel);
  const marketplace = propMarketplace || fallbackMarketplace;

  const [selectedCat, setSelectedCat] = useState('All Events');
  const [selectedDay, setSelectedDay] = useState(16);

  const shortArea = selectedArea.split(',')[0]?.trim() || selectedArea;

  const eventCats = [
    'All Events',
    'Music & Arts',
    'Food & Markets',
    'Sports & Fitness',
    'Workshops',
    'Civic & Health',
    'Community',
  ];

  const filteredEvents = marketplace.events.filter(
    (e) => selectedCat === 'All Events' || e.cat.toLowerCase().includes(selectedCat.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <HeroBanner
        dashboardId="events"
        tag={
          <>
            <MapPin className="w-3.5 h-3.5 text-blue-300" />
            <span>{selectedArea}</span>
          </>
        }
        title={
          <>
            Local Events,
            <br />
            <span className="text-[#93C5FD]">Closer to You</span>
          </>
        }
        description={`Discover concerts, farmers markets, RWA meetups & health camps in ${shortArea} — enriched with live Contextual Event Intelligence (parking, traffic & dispersal weather).`}
        rightWidget={
          <div className="bg-slate-900/55 backdrop-blur-md border border-white/20 rounded-2xl p-4 w-full lg:w-[330px] space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-white/15">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/30 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-200" />
                </div>
                <div>
                  <p className="text-xl font-extrabold text-white leading-none">{marketplace.events.length}</p>
                  <p className="text-xs text-blue-100 mt-0.5">Live events in {shortArea}</p>
                </div>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-white/20 text-white text-xs font-extrabold flex items-center gap-1">
                <span>Neighborhood Calendar</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-blue-100">
              <span>🎉 Festivals</span>
              <span>🎨 Workshops</span>
              <span>🎵 Live Music</span>
              <span>🤝 RWA Civic</span>
            </div>
          </div>
        }
      />

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {eventCats.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCat(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition cursor-pointer ${
              selectedCat === cat
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
          {/* Featured Events Near You with Contextual Event Intelligence */}
          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> Events Near {shortArea} ({filteredEvents.length})
                </h3>
                <p className="text-[11px] text-slate-500">
                  Includes live Contextual Event Intelligence (`/api/v1/events/contextual-intelligence`)
                </p>
              </div>
              <span className="text-xs font-semibold text-blue-600">● Live Feed</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3.5">
              {filteredEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="rounded-xl border border-slate-200/80 overflow-hidden bg-white flex flex-col justify-between hover:shadow-md transition"
                >
                  <div>
                    <div className="relative h-32">
                      <img src={ev.img} alt={ev.title} className="w-full h-full object-cover" />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-900/85 text-white text-[10px] font-extrabold">
                        {ev.date} • {ev.price}
                      </span>
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-emerald-500 text-white text-[9px] font-bold">
                        👥 {ev.rsvp}
                      </span>
                    </div>
                    <div className="p-3">
                      <span className="text-[10px] font-extrabold text-indigo-600 uppercase">{ev.cat}</span>
                      <h4 className="text-xs font-extrabold text-slate-900 mt-0.5">{ev.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-1">🕒 {ev.time}</p>
                      <p className="text-[10px] text-slate-500 truncate">📍 {ev.loc} ({ev.dist})</p>

                      {/* Contextual Event Intelligence Box */}
                      <div className="mt-2.5 p-2 rounded-lg bg-slate-50 border border-slate-200/60 space-y-1 text-[10px]">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-semibold">🅿️ Parking Pressure:</span>
                          <span
                            className={`font-extrabold ${
                              ev.parkingPressure === 'LOW' ? 'text-emerald-600' : 'text-amber-600'
                            }`}
                          >
                            {ev.parkingPressure} (~{ev.expectedAttendance} expected)
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-semibold">🛣️ Corridor:</span>
                          <span className="font-bold text-slate-800 truncate max-w-[160px]">{ev.commuteCorridor}</span>
                        </div>
                        <p className="text-slate-600 truncate">🌦️ {ev.exitWeatherAdvisory}</p>
                      </div>
                    </div>
                  </div>
                  <div className="px-3 pb-3">
                    <button
                      type="button"
                      onClick={() =>
                        onOpenModal({
                          title: ev.title,
                          subtitle: `${ev.cat} • Organized by ${ev.organizer}`,
                          category: `Contextual Event Intelligence (${ev.source})`,
                          badge: ev.price,
                          location: `${ev.loc} • ${ev.time}`,
                          description: `👥 Expected Attendance: ~${ev.expectedAttendance} people\n🅿️ Parking Pressure: ${ev.parkingPressure}\n🚗 Arterial Traffic Impact: ${ev.trafficImpact} on ${ev.commuteCorridor}\n🌦️ Exit Weather Advisory: ${ev.exitWeatherAdvisory}`,
                          primaryActionLabel: 'Confirm Free RSVP / Book Pass',
                          image: ev.img,
                        })
                      }
                      className="w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer"
                    >
                      RSVP & View Event Intelligence
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Interactive Map + Calendar + Highlights */}
        <div className="xl:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <h3 className="text-sm font-extrabold text-slate-900 mb-2.5">Event Venues Around {shortArea}</h3>
            <InteractiveMap
              heightClass="h-52"
              centerLabel={selectedArea}
              centerCoords={{ lat: liveIntel.location.lat, lng: liveIntel.location.lng }}
              pois={liveIntel.nearbyPois}
              showSearchBottomButton={false}
            />
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-900">Events Calendar</h3>
              <span className="text-xs font-semibold text-blue-600">{shortArea}</span>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-slate-400 mb-1.5">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {(() => {
                const eventDays = new Set(
                  marketplace.events
                    .map((e) => {
                      const match = e.date?.match(/\b(\d{1,2})\b/);
                      return match ? parseInt(match[1], 10) : null;
                    })
                    .filter((d): d is number => d !== null)
                );
                return Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
                  const hasEvent = eventDays.has(day);
                  const isSelected = selectedDay === day;
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setSelectedDay(day)}
                      className={`h-7 rounded-full flex flex-col items-center justify-center font-semibold transition cursor-pointer ${
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
                });
              })()}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <span>✨</span> Ask AI About Local Events
              </h3>
            </div>
            <div className="space-y-2">
              {[
                { title: `Weekend family events in ${shortArea}`, sub: 'Check weather & parking before stepping out', icon: '👨‍👩‍👧' },
                { title: `Free health & RWA camps in ${shortArea}`, sub: 'Community wellness schedules', icon: '🏥' },
                { title: `Live music & food fests near ${shortArea}`, sub: 'Evening dispersal traffic check', icon: '🎵' },
              ].map((hl) => (
                <div
                  key={hl.title}
                  onClick={() => onAskAi(hl.title)}
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
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
