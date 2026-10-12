import React, { useState } from 'react';
import { DashboardCommonProps } from './MainDashboards';
import { HeroBanner } from '../components/HeroBanner';
import { InteractiveMap } from '../components/InteractiveMap';
import { AI_KNOWLEDGE_BASE } from '../data/mockData';
import {
  MapPin,
  Sun,
  Moon,
  Wind,
  Droplets,
  Car,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  Phone,
  Send,
  Paperclip,
  Mic,
  CheckCircle2,
  Eye,
  Gauge,
  Compass,
  Video,
  Navigation,
} from 'lucide-react';

/* ============================================================================
   7. INTELLIGENCE DASHBOARD (Page 14 Desktop)
   ============================================================================ */
export const IntelligenceDashboard: React.FC<DashboardCommonProps> = ({
  onNavigate,
  onAskAi,
}) => {
  const [forecastTab, setForecastTab] = useState<'Today' | 'Tomorrow' | '7 Days'>('Today');

  return (
    <div className="space-y-4">
      <HeroBanner
        dashboardId="intelligence"
        tag={
          <>
            <MapPin className="w-3.5 h-3.5 text-blue-300" />
            <span>Outer North Delhi, Delhi</span>
          </>
        }
        title={
          <>
            Local Intelligence,
            <br />
            <span className="text-[#93C5FD]">For a Better You</span>
          </>
        }
        description="Real-time insights on weather, air quality, traffic, safety, market rates and local trends — all in one place."
        askAiWidget={{
          placeholder: 'Ask about weather, traffic, safety...',
          chips: ["Today's summary", 'Is it safe to go out?', 'Will it rain today?', 'Traffic to Connaught Place'],
          onAsk: onAskAi,
        }}
      />

      {/* Sub-navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {[
          { label: 'Overview', icon: '✨', active: true, target: 'intelligence' as const },
          { label: 'Weather', icon: '☀️', active: false, target: 'weather' as const },
          { label: 'Air Quality', icon: '🍃', active: false, target: 'air-quality' as const },
          { label: 'Traffic', icon: '🚗', active: false, target: 'traffic' as const },
          { label: 'Safety & Alerts', icon: '🔺', active: false, target: 'alerts' as const },
          { label: 'Market Rates', icon: '📈', active: false, target: 'market-rates' as const },
          { label: 'Fuel Rates', icon: '⛽', active: false, target: 'fuel-rates' as const },
          { label: 'Local Trends', icon: '📊', active: false, target: 'intelligence' as const },
        ].map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => onNavigate(p.target)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border whitespace-nowrap transition ${
              p.active
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            <span>{p.icon}</span>
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      {/* Top 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
        <div
          onClick={() => onNavigate('weather')}
          className="cursor-pointer bg-white rounded-2xl p-4 shadow-card border border-slate-200/70 flex items-center justify-between hover:border-blue-300 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 flex items-center justify-center">
              <Sun className="w-6 h-6 text-amber-400 fill-amber-400" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-slate-900">28°C</p>
              <p className="text-xs font-bold text-slate-700">Clear Sky</p>
              <p className="text-[10px] text-slate-400">Feels like 30°C</p>
            </div>
          </div>
          <div className="text-right">
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">• Good</span>
            <p className="text-[10px] text-slate-400 mt-2">Weather</p>
          </div>
        </div>

        <div
          onClick={() => onNavigate('air-quality')}
          className="cursor-pointer bg-white rounded-2xl p-4 shadow-card border border-slate-200/70 flex items-center justify-between hover:border-blue-300 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center text-xl">🍃</div>
            <div>
              <p className="text-xl font-extrabold text-slate-900">AQI 82</p>
              <p className="text-xs font-bold text-slate-700">Good Air Quality</p>
              <p className="text-[10px] text-slate-400">PM2.5: 32 µg/m³</p>
            </div>
          </div>
          <div className="text-right">
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">Good</span>
            <p className="text-[10px] text-slate-400 mt-2">Air Quality</p>
          </div>
        </div>

        <div
          onClick={() => onNavigate('traffic')}
          className="cursor-pointer bg-white rounded-2xl p-4 shadow-card border border-slate-200/70 flex items-center justify-between hover:border-blue-300 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center">
              <Car className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-slate-900">Moderate</p>
              <p className="text-xs font-bold text-slate-700">Traffic Flow</p>
              <p className="text-[10px] text-slate-400">Avg. Speed 32 km/h</p>
            </div>
          </div>
          <div className="text-right">
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">Normal</span>
            <p className="text-[10px] text-slate-400 mt-2">Traffic</p>
          </div>
        </div>

        <div
          onClick={() => onNavigate('alerts')}
          className="cursor-pointer bg-white rounded-2xl p-4 shadow-card border border-slate-200/70 flex items-center justify-between hover:border-blue-300 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center text-xl">🛡️</div>
            <div>
              <p className="text-xl font-extrabold text-slate-900">Low Risk</p>
              <p className="text-xs font-bold text-slate-700">Safety Index</p>
              <p className="text-[10px] text-slate-400">No major alerts</p>
            </div>
          </div>
          <div className="text-right">
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">• Safe</span>
            <p className="text-[10px] text-slate-400 mt-2">Safety</p>
          </div>
        </div>
      </div>

      {/* Middle 3-Column Row: Weather Forecast + Air Quality + Traffic Overview */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Weather Forecast (4 cols) */}
        <div className="xl:col-span-4 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-500" /> Weather Forecast
            </h3>
            <button onClick={() => onNavigate('weather')} className="text-xs font-semibold text-blue-600">
              View Details ›
            </button>
          </div>
          <div className="flex gap-1.5 mb-3">
            {(['Today', 'Tomorrow', '7 Days'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForecastTab(t)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  forecastTab === t ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-5 gap-2 text-center pt-2">
            {[
              { time: 'Now', temp: '28°', rain: '0%', sun: true },
              { time: '7 PM', temp: '27°', rain: '0%', sun: false },
              { time: '10 PM', temp: '25°', rain: '0%', sun: false },
              { time: '1 AM', temp: '24°', rain: '0%', sun: false },
              { time: '4 AM', temp: '23°', rain: '10%', sun: false },
            ].map((h) => (
              <div key={h.time} className="p-2 rounded-xl bg-slate-50/80 flex flex-col items-center gap-1.5">
                <span className="text-[10px] font-semibold text-slate-500">{h.time}</span>
                {h.sun ? (
                  <Sun className="w-5 h-5 text-amber-400 fill-amber-400" />
                ) : (
                  <Moon className="w-5 h-5 text-indigo-400 fill-indigo-400" />
                )}
                <span className="text-xs font-extrabold text-slate-900">{h.temp}</span>
                <span className="text-[10px] text-blue-500 font-semibold">💧 {h.rain}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Air Quality (4 cols) */}
        <div className="xl:col-span-4 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <span>🍃</span> Air Quality
            </h3>
            <button onClick={() => onNavigate('air-quality')} className="text-xs font-semibold text-blue-600">
              View Details ›
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-28 h-28 rounded-full border-[8px] border-emerald-500 flex flex-col items-center justify-center shrink-0">
              <span className="text-2xl font-extrabold text-slate-900 leading-none">82</span>
              <span className="text-xs font-bold text-emerald-600 mt-0.5">Good</span>
              <span className="text-[9px] text-slate-400">Air Quality Index</span>
            </div>
            <div className="flex-1 space-y-1.5 text-[11px]">
              {[
                { k: 'PM2.5', v: '32 µg/m³', st: 'Good', cls: 'bg-emerald-50 text-emerald-700' },
                { k: 'PM10', v: '54 µg/m³', st: 'Good', cls: 'bg-emerald-50 text-emerald-700' },
                { k: 'NO₂', v: '21 µg/m³', st: 'Good', cls: 'bg-emerald-50 text-emerald-700' },
                { k: 'SO₂', v: '8 µg/m³', st: 'Good', cls: 'bg-emerald-50 text-emerald-700' },
                { k: 'O₃', v: '67 µg/m³', st: 'Moderate', cls: 'bg-amber-50 text-amber-700' },
                { k: 'CO', v: '0.6 mg/m³', st: 'Good', cls: 'bg-emerald-50 text-emerald-700' },
              ].map((p) => (
                <div key={p.k} className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500 w-12">{p.k}</span>
                  <span className="font-bold text-slate-800">{p.v}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${p.cls}`}>{p.st}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Traffic Overview (4 cols) */}
        <div className="xl:col-span-4 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-900">Traffic Overview</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">• Live</span>
            </div>
            <button onClick={() => onNavigate('traffic')} className="text-xs font-semibold text-blue-600">
              View on Map ›
            </button>
          </div>
          <div className="space-y-2.5">
            {[
              { rd: 'Outer Ring Road', st: 'Moderate traffic', spd: '32 km/h', dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700' },
              { rd: 'GT Karnal Road', st: 'Heavy traffic', spd: '18 km/h', dot: 'bg-rose-500', badge: 'bg-rose-50 text-rose-700' },
              { rd: 'Rohini Sector 10', st: 'Smooth traffic', spd: '42 km/h', dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700' },
              { rd: 'Mukarba Chowk', st: 'Moderate traffic', spd: '28 km/h', dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700' },
            ].map((t) => (
              <div key={t.rd} className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70">
                <div className="flex items-center gap-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${t.dot}`} />
                  <div>
                    <p className="text-xs font-bold text-slate-900">{t.rd}</p>
                    <p className="text-[10px] text-slate-500">{t.st}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-lg text-xs font-extrabold ${t.badge}`}>{t.spd}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lower 3-Column Row: Safety & Alerts + Market Rates + Fuel Prices */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-4 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-500" /> Safety & Alerts
            </h3>
            <button onClick={() => onNavigate('alerts')} className="text-xs font-semibold text-blue-600">
              View All ›
            </button>
          </div>
          <div className="space-y-2.5">
            {[
              { title: 'Road construction on Rohini Sec 14', time: 'Today, 4:30 PM', tag: 'Traffic', cls: 'bg-rose-50 text-rose-600', icon: '🔺' },
              { title: 'Water supply maintenance', time: 'Today, 6:00 PM – 10:00 PM', tag: 'Utility', cls: 'bg-amber-50 text-amber-700', icon: '⚠️' },
              { title: 'Minor power fluctuation in some areas', time: 'Today, 2:15 PM', tag: 'Electricity', cls: 'bg-blue-50 text-blue-600', icon: 'ℹ️' },
              { title: 'No security alerts at the moment', time: 'Your area is safe', tag: 'Safety', cls: 'bg-emerald-50 text-emerald-700', icon: '✅' },
            ].map((a) => (
              <div key={a.title} className="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-slate-50">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span>{a.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{a.title}</p>
                    <p className="text-[10px] text-slate-400">{a.time}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${a.cls}`}>{a.tag}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="xl:col-span-4 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-extrabold text-slate-900">📈 Market Rates (Today)</h3>
            <button onClick={() => onNavigate('market-rates')} className="text-xs font-semibold text-blue-600">
              See All ›
            </button>
          </div>
          <div className="space-y-2">
            {[
              { item: 'Tomato', icon: '🍅', p: '₹22 / kg', ch: '↓ 12%', cls: 'text-emerald-600 bg-emerald-50' },
              { item: 'Onion', icon: '🧅', p: '₹28 / kg', ch: '↑ 8%', cls: 'text-rose-600 bg-rose-50' },
              { item: 'Potato', icon: '🥔', p: '₹20 / kg', ch: '↓ 5%', cls: 'text-emerald-600 bg-emerald-50' },
              { item: 'Milk (1L)', icon: '🥛', p: '₹56 / L', ch: '0.0%', cls: 'text-slate-500 bg-slate-100' },
              { item: 'Cooking Oil (1L)', icon: '🌻', p: '₹142 / L', ch: '↑ 4%', cls: 'text-rose-600 bg-rose-50' },
            ].map((m) => (
              <div key={m.item} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-none text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-2">
                  <span>{m.icon}</span> {m.item}
                </span>
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-slate-900">{m.p}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold w-14 text-center ${m.cls}`}>{m.ch}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="xl:col-span-4 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-extrabold text-slate-900">⛽ Fuel Prices</h3>
            <button onClick={() => onNavigate('fuel-rates')} className="text-xs font-semibold text-blue-600">
              View Trends
            </button>
          </div>
          <div className="space-y-2.5">
            {[
              { f: 'Petrol', icon: '⛽', p: '₹96.72 / L', ch: '↓ 0.5%', cls: 'text-emerald-600 bg-emerald-50' },
              { f: 'Diesel', icon: '🛢️', p: '₹89.62 / L', ch: '↓ 0.4%', cls: 'text-emerald-600 bg-emerald-50' },
              { f: 'CNG', icon: '🟢', p: '₹74.50 / kg', ch: '0%', cls: 'text-slate-500 bg-slate-100' },
              { f: 'LPG (14.2 kg)', icon: '🔴', p: '₹803.00', ch: '↑ 1.2%', cls: 'text-rose-600 bg-rose-50' },
            ].map((fl) => (
              <div key={fl.f} className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-2">
                  <span>{fl.icon}</span> {fl.f}
                </span>
                <div className="flex items-center gap-2.5">
                  <span className="font-extrabold text-slate-900">{fl.p}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${fl.cls}`}>{fl.ch}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Local Trends & Insights + Area Map Insights */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-8 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-extrabold text-slate-900">Local Trends & Insights</h3>
              <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[9px] font-bold">BETA</span>
            </div>
            <span className="text-xs font-semibold text-blue-600 cursor-pointer">See All ›</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: '📈', title: 'Increased demand for AC services', sub: '30% higher searches this week' },
              { icon: '🏠', title: 'Real estate interest rising in Rohini', sub: 'Searches up by 18% this month' },
              { icon: '☕', title: 'More footfall at local cafes', sub: '25% higher than last week' },
              { icon: '🏋️', title: 'Fitness & gym memberships trending', sub: '40% higher signups this week' },
            ].map((tr) => (
              <div key={tr.title} className="p-3 rounded-xl border border-slate-200/70 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-base shrink-0">
                  {tr.icon}
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-900">{tr.title}</p>
                  <p className="text-[11px] text-slate-500">{tr.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="xl:col-span-4 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-sm font-extrabold text-slate-900">Area Map Insights</h3>
            <button onClick={() => onNavigate('map')} className="text-xs font-semibold text-blue-600">
              View Full Map
            </button>
          </div>
          <InteractiveMap heightClass="h-40" showSearchBottomButton={false} />
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   8. WEATHER DASHBOARD (Page 16 Desktop)
   ============================================================================ */
export const WeatherDashboard: React.FC<DashboardCommonProps> = ({
  onNavigate,
  onAskAi,
}) => {
  return (
    <div className="space-y-4">
      <HeroBanner
        dashboardId="weather"
        tag={
          <>
            <MapPin className="w-3.5 h-3.5 text-blue-300" />
            <span>Outer North Delhi, Delhi</span>
          </>
        }
        title="Today's Weather"
        description="Stay prepared with real-time weather updates, forecasts and local alerts."
        bottomPills={[
          { icon: <span>☀️</span>, label: 'Current Weather', active: true },
          { icon: <span>🕒</span>, label: 'Hourly Forecast' },
          { icon: <span>📅</span>, label: '7 Day Forecast' },
          { icon: <span>🍃</span>, label: 'Air Quality', onClick: () => onNavigate('air-quality') },
          { icon: <span>🔺</span>, label: 'Alerts', onClick: () => onNavigate('alerts') },
        ]}
        askAiWidget={{
          placeholder: "Ask about today's weather, rain chances...",
          chips: ['Will it rain today?', 'Best time to travel?', "How's the air quality?"],
          onAsk: onAskAi,
        }}
      />

      {/* Top 3-Column Row */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Current Weather (5 cols) */}
        <div className="xl:col-span-5 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-500" /> Current Weather
            </h3>
            <span className="text-[11px] text-slate-400">Updated 10:30 AM</span>
          </div>

          <div className="flex items-center justify-between gap-4 my-2">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center">
                <Sun className="w-11 h-11 text-amber-400 fill-amber-400" />
              </div>
              <div>
                <p className="text-4xl font-extrabold text-slate-900">28°C</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">Clear Sky</p>
                <p className="text-xs text-slate-500">Feels like 30°C</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                ✨ Good Weather
              </div>
              <div className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold">
                💧 No Rain
              </div>
              <div className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold">
                ☀️ UV Index 6 (High)
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-3 mt-3 border-t border-slate-100 text-xs">
            <div>
              <p className="font-extrabold text-slate-900 flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-blue-500" /> 46%
              </p>
              <p className="text-[10px] text-slate-400">Humidity</p>
            </div>
            <div>
              <p className="font-extrabold text-slate-900 flex items-center gap-1">
                <Wind className="w-3.5 h-3.5 text-blue-500" /> 12 km/h
              </p>
              <p className="text-[10px] text-slate-400">Wind (NW)</p>
            </div>
            <div>
              <p className="font-extrabold text-slate-900 flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-blue-500" /> 1012 hPa
              </p>
              <p className="text-[10px] text-slate-400">Pressure</p>
            </div>
            <div>
              <p className="font-extrabold text-slate-900 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-blue-500" /> 10 km
              </p>
              <p className="text-[10px] text-slate-400">Visibility</p>
            </div>
          </div>
        </div>

        {/* Today's Highlights (4 cols) */}
        <div className="xl:col-span-4 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-extrabold text-slate-900">Today's Highlights</h3>
            <span className="text-xs font-semibold text-blue-600">See Details ›</span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { icon: '🌡️', v: '32°C', l: 'Max Temp' },
              { icon: '🌡️', v: '20°C', l: 'Min Temp' },
              { icon: '💧', v: '0%', l: 'Chance of Rain' },
              { icon: '☀️', v: '11 hrs', l: 'Sunlight Hours' },
            ].map((h) => (
              <div key={h.l} className="p-2.5 rounded-xl bg-slate-50">
                <span className="text-lg">{h.icon}</span>
                <p className="text-sm font-extrabold text-slate-900 mt-1">{h.v}</p>
                <p className="text-[9px] text-slate-400 mt-0.5">{h.l}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2.5 bg-amber-50/60 p-2 rounded-xl">
              <span className="text-xl">🌅</span>
              <div>
                <p className="text-xs font-extrabold text-slate-900">5:46 AM</p>
                <p className="text-[10px] text-slate-500">Sunrise</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 bg-orange-50/60 p-2 rounded-xl">
              <span className="text-xl">🌇</span>
              <div>
                <p className="text-xs font-extrabold text-slate-900">6:52 PM</p>
                <p className="text-[10px] text-slate-500">Sunset</p>
              </div>
            </div>
          </div>
        </div>

        {/* Air Quality Index (3 cols) */}
        <div className="xl:col-span-3 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-extrabold text-slate-900">🍃 Air Quality Index</h3>
            <button onClick={() => onNavigate('air-quality')} className="text-xs font-semibold text-blue-600">
              View Details ›
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-24 h-24 rounded-full border-[7px] border-emerald-500 flex flex-col items-center justify-center shrink-0">
              <span className="text-2xl font-extrabold text-slate-900 leading-none">82</span>
              <span className="text-[11px] font-bold text-emerald-600">Good</span>
            </div>
            <div className="flex-1 space-y-1 text-[10px]">
              {[
                ['PM2.5', '32 µg/m³', 'Good'],
                ['PM10', '54 µg/m³', 'Good'],
                ['NO₂', '21 µg/m³', 'Good'],
                ['SO₂', '8 µg/m³', 'Good'],
                ['O₃', '67 µg/m³', 'Moderate'],
                ['CO', '0.6 mg/m³', 'Good'],
              ].map(([k, v, st]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-slate-500">{k}</span>
                  <span className="font-bold text-slate-800">{v}</span>
                  <span className={st === 'Good' ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>{st}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: Hourly Forecast + 7 Day Forecast */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-6 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-extrabold text-slate-900">🕒 Hourly Forecast</h3>
            <span className="text-xs font-semibold text-blue-600">See Full Forecast ›</span>
          </div>
          <div className="grid grid-cols-8 gap-2 text-center">
            {[
              { t: 'Now', d: '28°', r: '0%', day: true },
              { t: '12 PM', d: '30°', r: '0%', day: true },
              { t: '2 PM', d: '31°', r: '0%', day: true },
              { t: '4 PM', d: '30°', r: '10%', day: true },
              { t: '6 PM', d: '28°', r: '10%', day: true },
              { t: '8 PM', d: '26°', r: '0%', day: false },
              { t: '10 PM', d: '24°', r: '0%', day: false },
              { t: '12 AM', d: '23°', r: '0%', day: false },
            ].map((h) => (
              <div key={h.t} className="p-2 rounded-xl bg-slate-50 flex flex-col items-center gap-1.5">
                <span className="text-[10px] text-slate-500 font-medium">{h.t}</span>
                {h.day ? (
                  <Sun className="w-5 h-5 text-amber-400 fill-amber-400" />
                ) : (
                  <Moon className="w-5 h-5 text-indigo-500 fill-indigo-500" />
                )}
                <span className="text-xs font-extrabold text-slate-900">{h.d}</span>
                <span className="text-[9px] text-blue-500 font-semibold">💧{h.r}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="xl:col-span-6 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-extrabold text-slate-900">📅 7 Day Forecast</h3>
            <span className="text-xs font-semibold text-blue-600">See Full Forecast ›</span>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center">
            {[
              { d: 'Today', dt: '15 Mar', t: '20° / 32°', r: '0%' },
              { d: 'Sun', dt: '16 Mar', t: '21° / 33°', r: '0%' },
              { d: 'Mon', dt: '17 Mar', t: '22° / 34°', r: '10%' },
              { d: 'Tue', dt: '18 Mar', t: '21° / 31°', r: '40%' },
              { d: 'Wed', dt: '19 Mar', t: '20° / 29°', r: '60%' },
              { d: 'Thu', dt: '20 Mar', t: '19° / 28°', r: '20%' },
              { d: 'Fri', dt: '21 Mar', t: '20° / 30°', r: '0%' },
            ].map((day, idx) => (
              <div
                key={day.d}
                className={`p-2 rounded-xl flex flex-col items-center gap-1 ${
                  idx === 0 ? 'bg-blue-50/80 border border-blue-200' : 'bg-slate-50'
                }`}
              >
                <span className="text-[11px] font-bold text-slate-800">{day.d}</span>
                <span className="text-[9px] text-slate-400">{day.dt}</span>
                <Sun className="w-5 h-5 text-amber-400 fill-amber-400 my-0.5" />
                <span className="text-[10px] font-extrabold text-slate-900">{day.t}</span>
                <span className="text-[9px] text-blue-500 font-semibold">💧 {day.r}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom 3-Column Row */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-4 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-sm font-extrabold text-slate-900">Weather Map</h3>
            <span className="text-xs font-semibold text-blue-600">View Full Map ›</span>
          </div>
          <InteractiveMap heightClass="h-48" showSearchBottomButton={false} />
        </div>

        <div className="xl:col-span-4 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-extrabold text-slate-900">Weather Alerts & Updates</h3>
            <span className="text-xs font-semibold text-blue-600">See All ›</span>
          </div>
          <div className="space-y-2.5">
            {[
              { title: 'Heat Wave Advisory', sub: 'High temperatures expected in the next 3 days', ago: '2 hours ago', tag: 'High', cls: 'bg-rose-50 text-rose-600' },
              { title: 'Dust Activity Likely', sub: 'Increased dust levels due to strong winds', ago: '5 hours ago', tag: 'Moderate', cls: 'bg-amber-50 text-amber-700' },
              { title: 'No Rain Expected', sub: 'Clear skies expected for the next 48 hours', ago: '6 hours ago', tag: 'Info', cls: 'bg-emerald-50 text-emerald-700' },
              { title: 'UV Index High', sub: 'Use sunscreen and limit sun exposure', ago: '6 hours ago', tag: 'Moderate', cls: 'bg-amber-50 text-amber-700' },
            ].map((al) => (
              <div key={al.title} className="flex items-center justify-between gap-2 text-xs p-1.5 rounded-lg hover:bg-slate-50">
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 truncate">{al.title}</p>
                  <p className="text-[10px] text-slate-500 truncate">{al.sub}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[9px] text-slate-400">{al.ago}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${al.cls}`}>{al.tag}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="xl:col-span-4 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-extrabold text-slate-900">Local Insights</h3>
            <span className="text-xs font-semibold text-blue-600">See More ›</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { icon: '🚶', label: 'Best Time to Go Out', val: '6 AM – 10 AM', sub: 'Pleasant weather' },
              { icon: '🚗', label: 'Travel Conditions', val: 'Good', sub: 'Smooth for commuting' },
              { icon: '🚲', label: 'Outdoor Activities', val: 'Great Conditions', sub: 'Ideal for parks & sports' },
              { icon: '🧴', label: 'Health Advisory', val: 'Moderate UV', sub: 'Use sunscreen' },
            ].map((ins) => (
              <div key={ins.label} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-lg">{ins.icon}</span>
                <p className="text-[10px] text-slate-500 mt-1">{ins.label}</p>
                <p className="text-xs font-extrabold text-emerald-700">{ins.val}</p>
                <p className="text-[9px] text-slate-400">{ins.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   9. AIR QUALITY DASHBOARD (Page 18 Desktop)
   ============================================================================ */
export const AirQualityDashboard: React.FC<DashboardCommonProps> = ({
  onAskAi,
  selectedArea,
  onOpenLocationPicker,
}) => {
  const [trendRange, setTrendRange] = useState<'24h' | '7d' | '30d'>('24h');

  return (
    <div className="space-y-4">
      <HeroBanner
        dashboardId="air-quality"
        tag={
          <>
            <MapPin className="w-3.5 h-3.5 text-blue-300" />
            <span>{selectedArea}</span>
          </>
        }
        title="Air Quality"
        subtitle="Breathe Better, Live Healthier"
        description="Real-time air quality data, forecasts and personalised insights for a healthier, cleaner tomorrow."
        askAiWidget={{
          placeholder: 'Ask about air quality, health risks...',
          chips: ["Is today's air quality good?", 'How to stay safe?', 'Air quality forecast'],
          onAsk: onAskAi,
        }}
      />

      {/* Top Row: Current Air Quality + Pollutant Levels */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-6 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-extrabold text-slate-900">✅ Current Air Quality</h3>
            <span className="text-[11px] text-slate-400">Updated: 10:30 AM ●</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="w-32 h-32 rounded-full border-[10px] border-emerald-500 flex flex-col items-center justify-center shrink-0">
              <span className="text-3xl font-extrabold text-slate-900 leading-none">82</span>
              <span className="text-sm font-bold text-emerald-600 mt-1">Good</span>
              <span className="text-[10px] text-slate-400">Air Quality Index</span>
            </div>
            <div className="flex-1 space-y-2.5 w-full">
              <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/70 flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <p className="text-xs font-bold text-slate-800">
                  Air quality is satisfactory and poses little to no risk.
                </p>
              </div>
              <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-50 text-xs">
                <span className="font-semibold text-slate-700">📍 {selectedArea}</span>
                <button
                  type="button"
                  onClick={() => onOpenLocationPicker?.()}
                  className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                >
                  Change Location ›
                </button>
              </div>
              <div className="grid grid-cols-5 gap-1 text-center text-[9px] pt-1">
                {[
                  { l: 'Good', r: '(0–50)', c: 'bg-emerald-500' },
                  { l: 'Moderate', r: '(51–100)', c: 'bg-amber-400' },
                  { l: 'Poor', r: '(101–200)', c: 'bg-orange-500' },
                  { l: 'Very Poor', r: '(201–300)', c: 'bg-rose-500' },
                  { l: 'Severe', r: '(301+)', c: 'bg-purple-600' },
                ].map((s) => (
                  <div key={s.l}>
                    <div className={`h-1.5 rounded-full ${s.c} mb-1`} />
                    <p className="font-bold text-slate-700">{s.l}</p>
                    <p className="text-slate-400">{s.r}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-6 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-extrabold text-slate-900">🧪 Pollutant Levels</h3>
            <span className="text-xs font-semibold text-blue-600">View Details ›</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { name: 'PM2.5', val: '32', unit: 'µg/m³', status: 'Good' },
              { name: 'PM10', val: '54', unit: 'µg/m³', status: 'Good' },
              { name: 'NO₂', val: '21', unit: 'µg/m³', status: 'Good' },
              { name: 'SO₂', val: '8', unit: 'µg/m³', status: 'Good' },
            ].map((pol) => (
              <div key={pol.name} className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 flex flex-col items-center">
                <span className="text-xs font-bold text-slate-600 mb-2">{pol.name}</span>
                <div className="w-20 h-20 rounded-full border-[6px] border-emerald-500 flex flex-col items-center justify-center bg-white">
                  <span className="text-xl font-extrabold text-slate-900 leading-none">{pol.val}</span>
                  <span className="text-[9px] text-slate-400 mt-0.5">{pol.unit}</span>
                </div>
                <span className="mt-2 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                  {pol.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Middle Row: Air Quality Map + Forecast + Health Insights */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-4 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-sm font-extrabold text-slate-900">Air Quality Map</h3>
            <span className="text-xs font-semibold text-blue-600">View Full Map ›</span>
          </div>
          <InteractiveMap heightClass="h-44" centerLabel={'Rohini\nAQI: 82 Good'} showSearchBottomButton={false} />
        </div>

        <div className="xl:col-span-4 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-extrabold text-slate-900">Air Quality Forecast</h3>
            <span className="text-xs font-semibold text-blue-600">See 7 Day Forecast ›</span>
          </div>
          <div className="grid grid-cols-5 gap-2 text-center">
            {[
              { d: 'Today', dt: '15 Mar', aqi: '82', st: 'Good', cls: 'text-emerald-600 bg-emerald-50' },
              { d: 'Sun', dt: '16 Mar', aqi: '86', st: 'Good', cls: 'text-emerald-600 bg-emerald-50' },
              { d: 'Mon', dt: '17 Mar', aqi: '88', st: 'Moderate', cls: 'text-amber-700 bg-amber-50' },
              { d: 'Tue', dt: '18 Mar', aqi: '85', st: 'Good', cls: 'text-emerald-600 bg-emerald-50' },
              { d: 'Wed', dt: '19 Mar', aqi: '80', st: 'Good', cls: 'text-emerald-600 bg-emerald-50' },
            ].map((f) => (
              <div key={f.d} className="p-2.5 rounded-xl bg-slate-50 flex flex-col items-center gap-1.5">
                <span className="text-xs font-bold text-slate-800">{f.d}</span>
                <span className="text-[9px] text-slate-400">{f.dt}</span>
                <Sun className="w-5 h-5 text-amber-400 fill-amber-400 my-1" />
                <span className="text-base font-extrabold text-slate-900">{f.aqi}</span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${f.cls}`}>{f.st}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="xl:col-span-4 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 mb-2">❤️ Health Insights</h3>
            <p className="text-base font-extrabold text-emerald-700">Low Risk Today</p>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Air quality is good. Enjoy outdoor activities, but consider masks if you are sensitive to pollution.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onAskAi('What health precautions should sensitive groups take at AQI 82?')}
            className="mt-3 self-start px-3.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-600 hover:text-white transition"
          >
            View Health Tips ›
          </button>
        </div>
      </div>

      {/* Bottom Row: AQI Trend + Smart Tips */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-6 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-extrabold text-slate-900">📈 AQI Trend</h3>
            <div className="flex gap-1">
              {(['24h', '7d', '30d'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setTrendRange(r)}
                  className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                    trendRange === r ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="h-32 relative flex items-end pt-6">
            <svg viewBox="0 0 500 100" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M0,55 Q80,52 160,40 T320,48 T500,52 L500,100 L0,100 Z"
                fill="url(#aqiGrad)"
              />
              <path
                d="M0,55 Q80,52 160,40 T320,48 T500,52"
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
              />
              <circle cx="210" cy="41" r="5" fill="#10b981" stroke="#fff" strokeWidth="2" />
            </svg>
            <div className="absolute top-1 left-[36%] bg-white shadow border border-slate-200 rounded-lg px-2 py-1 text-center">
              <p className="text-[10px] font-extrabold text-slate-900">82 AQI</p>
              <p className="text-[9px] text-slate-400">10:30 AM</p>
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>12 AM</span>
            <span>4 AM</span>
            <span>8 AM</span>
            <span>12 PM</span>
            <span>4 PM</span>
            <span>8 PM</span>
            <span>12 AM</span>
          </div>
        </div>

        <div className="xl:col-span-6 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
          <h3 className="text-sm font-extrabold text-slate-900 mb-3">💡 Smart Tips for Cleaner Air</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { icon: '🪴', text: 'Keep indoor plants for cleaner air' },
              { icon: '🪟', text: 'Keep windows closed during high pollution' },
              { icon: '🚌', text: 'Use public transport or carpool' },
              { icon: '😷', text: 'Wear a mask if AQI is above 200' },
            ].map((tip) => (
              <div key={tip.text} className="p-3 rounded-xl bg-slate-50 text-center flex flex-col items-center justify-center gap-2">
                <span className="text-2xl">{tip.icon}</span>
                <p className="text-[11px] font-semibold text-slate-700 leading-snug">{tip.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   10. TRAFFIC DASHBOARD (Page 20 Desktop)
   ============================================================================ */
export const TrafficDashboard: React.FC<DashboardCommonProps> = ({
  onOpenModal,
  onAskAi,
}) => {
  const [forecastTab, setForecastTab] = useState('Next 1 Hour');

  return (
    <div className="space-y-4">
      <HeroBanner
        dashboardId="traffic"
        tag={
          <>
            <MapPin className="w-3.5 h-3.5 text-blue-300" />
            <span>Outer North Delhi, Delhi</span>
          </>
        }
        title={
          <>
            Traffic in <span className="text-[#93C5FD]">Your Area</span>
          </>
        }
        description="Real-time traffic updates, route suggestions and live alerts to help you reach faster and safer."
        bottomPills={[
          { icon: <span>🚗</span>, label: 'Live Traffic', active: true },
          { icon: <span>🔀</span>, label: 'Best Routes' },
          { icon: <span>🔺</span>, label: 'Traffic Alerts' },
          { icon: <span>📹</span>, label: 'CCTV Feeds' },
          { icon: <span>🚧</span>, label: 'Road Work' },
        ]}
        askAiWidget={{
          placeholder: 'Is there traffic on Ring Road?',
          chips: ['Best route to Connaught Place?', 'Live traffic near me', 'Road closures today?'],
          onAsk: onAskAi,
        }}
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Left 7 cols */}
        <div className="xl:col-span-7 space-y-4">
          {/* Live Traffic Overview */}
          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-900">🚗 Live Traffic Overview</h3>
              <span className="text-[11px] text-slate-400">Updated 10:30 AM</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { val: '18 km/h', label: 'Avg. Speed', sub: '↓ 12%', subCls: 'text-rose-600', icon: '🚗' },
                { val: 'Moderate', label: 'Traffic Condition', sub: '↔ No change', subCls: 'text-slate-500', icon: '📉' },
                { val: '6', label: 'Major Jams', sub: '↑ 2', subCls: 'text-rose-600', icon: '🔺' },
                { val: '3', label: 'Road Closures', sub: '↑ 1', subCls: 'text-amber-600', icon: '🚧' },
              ].map((s) => (
                <div key={s.label} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{s.icon}</span>
                    <div>
                      <p className="text-base font-extrabold text-slate-900 leading-none">{s.val}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{s.label}</p>
                      <p className={`text-[10px] font-bold mt-0.5 ${s.subCls}`}>{s.sub}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Traffic Map */}
          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-900">Live Traffic Map</h3>
              <div className="flex gap-1.5">
                {['Live Traffic', 'Incidents', 'CCTV'].map((b, i) => (
                  <button
                    key={b}
                    type="button"
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                      i === 0 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
            <InteractiveMap
              heightClass="h-64"
              showSearchOverlay
              showSearchBottomButton={false}
              showTrafficRoutes
              showLegendBar={[
                { label: 'Fast', color: 'bg-emerald-500' },
                { label: 'Moderate', color: 'bg-amber-400' },
                { label: 'Slow', color: 'bg-orange-500' },
                { label: 'Heavy', color: 'bg-rose-600' },
              ]}
            />
          </div>

          {/* Bottom Split: Recent Traffic Alerts + CCTV Live Feeds */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-6 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-sm font-extrabold text-slate-900">Recent Traffic Alerts</h3>
                <span className="text-xs font-semibold text-blue-600">See All ›</span>
              </div>
              <div className="space-y-2.5">
                {[
                  { t: 'Accident on Outer Ring Road', s: 'Right lane blocked near Pitampura', ago: '15 min ago', tag: 'High', cls: 'bg-rose-50 text-rose-600' },
                  { t: 'Road Work on NH 44', s: 'Expect delays of 15-20 minutes', ago: '1 hour ago', tag: 'Moderate', cls: 'bg-amber-50 text-amber-700' },
                  { t: 'Lane Closure at Mukarba Chowk', s: 'Left lane closed for maintenance', ago: '2 hours ago', tag: 'High', cls: 'bg-rose-50 text-rose-600' },
                  { t: 'Heavy Traffic on Ring Road', s: 'Slow moving traffic towards Azadpur', ago: '2 hours ago', tag: 'Moderate', cls: 'bg-amber-50 text-amber-700' },
                ].map((al) => (
                  <div key={al.t} className="flex items-center justify-between gap-2 text-xs">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">{al.t}</p>
                      <p className="text-[10px] text-slate-500 truncate">{al.s}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold shrink-0 ${al.cls}`}>{al.tag}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-6 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-sm font-extrabold text-slate-900">📹 CCTV Live Feeds</h3>
                <span className="text-xs font-semibold text-blue-600">View All Cameras ›</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { loc: 'Rohini', st: 'Live', img: './assets/crops/cctv-rohini.webp' },
                  { loc: 'Pitampura', st: 'Live', img: './assets/crops/cctv-pitampura.webp' },
                  { loc: 'Mukarba Chowk', st: 'Moderate', img: './assets/crops/cctv-mukarba.webp' },
                ].map((cam) => (
                  <div
                    key={cam.loc}
                    onClick={() =>
                      onOpenModal({
                        title: `Live Traffic Camera — ${cam.loc}`,
                        category: 'Municipal Traffic Feed',
                        badge: cam.st,
                        description: `Real-time arterial corridor feed from ${cam.loc}. AI vehicle density analysis updated every 30 seconds.`,
                        primaryActionLabel: 'Check Alternate Route',
                        image: cam.img,
                      })
                    }
                    className="cursor-pointer rounded-xl border border-slate-200/80 overflow-hidden bg-slate-50"
                  >
                    <img src={cam.img} alt={cam.loc} className="w-full h-20 object-cover" />
                    <div className="p-1.5">
                      <p className="text-[11px] font-bold text-slate-900 truncate">{cam.loc}</p>
                      <p className="text-[9px] font-bold text-emerald-600">● {cam.st}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 cols */}
        <div className="xl:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-900">Traffic at Key Locations</h3>
              <span className="text-xs font-semibold text-blue-600">View All Locations ›</span>
            </div>
            <div className="space-y-2.5">
              {[
                { loc: 'Ring Road (Rohini)', st: 'Heavy Traffic', stCls: 'bg-rose-50 text-rose-600', spd: '18 km/h', dly: '↑ 15 min', dlyCls: 'text-rose-600' },
                { loc: 'Outer Ring Road (Pitampura)', st: 'Moderate', stCls: 'bg-amber-50 text-amber-700', spd: '32 km/h', dly: '↑ 8 min', dlyCls: 'text-rose-600' },
                { loc: 'NH 44 (Azadpur)', st: 'Smooth', stCls: 'bg-emerald-50 text-emerald-700', spd: '56 km/h', dly: 'On time', dlyCls: 'text-emerald-600' },
                { loc: 'Rohini Sector 10', st: 'Moderate', stCls: 'bg-amber-50 text-amber-700', spd: '28 km/h', dly: '↑ 7 min', dlyCls: 'text-rose-600' },
                { loc: 'Mukarba Chowk', st: 'Heavy Traffic', stCls: 'bg-rose-50 text-rose-600', spd: '16 km/h', dly: '↑ 18 min', dlyCls: 'text-rose-600' },
              ].map((k) => (
                <div key={k.loc} className="flex items-center justify-between gap-2 py-1.5 border-b border-slate-100 last:border-none text-xs">
                  <span className="font-bold text-slate-800 truncate">📍 {k.loc}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${k.stCls}`}>{k.st}</span>
                    <span className="font-bold text-slate-700 w-14 text-right">{k.spd}</span>
                    <span className={`font-bold w-14 text-right ${k.dlyCls}`}>{k.dly}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-900">🕒 Traffic Forecast</h3>
              <span className="text-xs font-semibold text-blue-600">See Full Forecast ›</span>
            </div>
            <div className="flex gap-1.5 mb-3">
              {['Next 1 Hour', 'Next 6 Hours', 'Next 24 Hours'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForecastTab(t)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    forecastTab === t ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="flex items-end justify-between gap-1.5 h-24 pt-4 px-2">
              {[25, 30, 38, 45, 58, 75, 92, 95, 82, 65, 48, 35].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className={`flex-1 rounded-t ${
                    h > 80 ? 'bg-rose-500' : h > 50 ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1.5">
              <span>12 PM</span>
              <span>2 PM</span>
              <span>4 PM</span>
              <span className="text-rose-600 font-bold">6 PM (Peak)</span>
              <span>8 PM</span>
              <span>10 PM</span>
              <span>12 AM</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-900">Popular Routes</h3>
              <span className="text-xs font-semibold text-blue-600">View All Routes ›</span>
            </div>
            <div className="space-y-2">
              {[
                { r: 'Rohini → Connaught Place', t: '42 min', d: '↑ 15 min', cls: 'text-rose-600 bg-rose-50' },
                { r: 'Pitampura → IGI Airport', t: '38 min', d: '↓ 5 min', cls: 'text-emerald-600 bg-emerald-50' },
                { r: 'Rohini → Noida Sector 62', t: '1 hr 12 min', d: '↑ 18 min', cls: 'text-rose-600 bg-rose-50' },
                { r: 'Keshav Puram → Gurgaon', t: '1 hr 5 min', d: '↑ 12 min', cls: 'text-rose-600 bg-rose-50' },
                { r: 'Azadpur → Delhi University', t: '28 min', d: '↓ 8 min', cls: 'text-emerald-600 bg-emerald-50' },
              ].map((rt) => (
                <div key={rt.r} className="flex items-center justify-between text-xs py-1">
                  <span className="font-bold text-slate-800">🔀 {rt.r}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900">{rt.t}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${rt.cls}`}>{rt.d}</span>
                  </div>
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
   11. ALERTS DASHBOARD (Page 22 Desktop)
   ============================================================================ */
export const AlertsDashboard: React.FC<DashboardCommonProps> = ({
  onOpenModal,
  onAskAi,
}) => {
  const [selectedCat, setSelectedCat] = useState('All Alerts');

  return (
    <div className="space-y-4">
      <HeroBanner
        dashboardId="alerts"
        tag={
          <>
            <MapPin className="w-3.5 h-3.5 text-blue-300" />
            <span>Outer North Delhi, Delhi</span>
          </>
        }
        title={
          <>
            Stay Alert, <span className="text-[#93C5FD]">Stay Safe</span>
          </>
        }
        description="Real-time alerts, emergency updates and safety notifications to keep you informed and prepared."
        bottomPills={[
          'All Alerts',
          'Weather',
          'Traffic',
          'Air Quality',
          'Safety',
          'Health',
          'Civic',
        ].map((l) => ({
          label: l,
          active: selectedCat === l,
          onClick: () => setSelectedCat(l),
        }))}
        askAiWidget={{
          placeholder: 'Is there any alert in Rohini right now?',
          chips: ['Any weather alerts?', 'Road closures today?', 'Air quality risk?'],
          onAsk: onAskAi,
        }}
      />

      {/* Top Row: Active Alerts + Alerts by Category + Emergency Contacts */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-5 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-extrabold text-slate-900">🔔 Active Alerts</h3>
            <span className="text-xs font-semibold text-blue-600">View All ›</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { n: '8', l: 'Critical', ch: '↑ 2', bg: 'bg-rose-50/70 border-rose-100', c: 'text-rose-600' },
              { n: '14', l: 'Important', ch: '↑ 4', bg: 'bg-orange-50/70 border-orange-100', c: 'text-orange-600' },
              { n: '12', l: 'Advisories', ch: '↑ 3', bg: 'bg-amber-50/70 border-amber-100', c: 'text-amber-600' },
              { n: '5', l: 'Resolved', ch: 'Today', bg: 'bg-emerald-50/70 border-emerald-100', c: 'text-emerald-600' },
            ].map((a) => (
              <div key={a.l} className={`p-3 rounded-xl border ${a.bg}`}>
                <p className="text-2xl font-extrabold text-slate-900">{a.n}</p>
                <p className="text-xs font-bold text-slate-700 mt-0.5">{a.l}</p>
                <p className={`text-[10px] font-bold mt-1 ${a.c}`}>{a.ch}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="xl:col-span-4 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
          <h3 className="text-sm font-extrabold text-slate-900 mb-3">Alerts by Category</h3>
          <div className="flex items-center gap-4">
            <div className="w-28 h-28 rounded-full border-[10px] border-blue-600 border-r-emerald-500 border-b-amber-400 border-l-rose-500 flex flex-col items-center justify-center shrink-0">
              <span className="text-2xl font-extrabold text-slate-900 leading-none">39</span>
              <span className="text-[10px] text-slate-500">Active Alerts</span>
            </div>
            <div className="flex-1 space-y-1 text-[11px]">
              {[
                { l: 'Weather', v: '12 (31%)', c: 'bg-blue-500' },
                { l: 'Traffic', v: '8 (21%)', c: 'bg-rose-500' },
                { l: 'Air Quality', v: '6 (15%)', c: 'bg-emerald-500' },
                { l: 'Safety', v: '7 (18%)', c: 'bg-amber-500' },
                { l: 'Health', v: '4 (10%)', c: 'bg-purple-500' },
                { l: 'Civic', v: '2 (5%)', c: 'bg-sky-500' },
              ].map((cat) => (
                <div key={cat.l} className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className={`w-2 h-2 rounded-full ${cat.c}`} /> {cat.l}
                  </span>
                  <span className="font-bold text-slate-800">{cat.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="xl:col-span-3 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-sm font-extrabold text-slate-900">📞 Emergency Contacts</h3>
            <span className="text-xs font-semibold text-blue-600">View All ›</span>
          </div>
          <div className="space-y-1.5 text-xs">
            {[
              { name: 'Police', num: '112' },
              { name: 'Ambulance', num: '108' },
              { name: 'Fire Department', num: '101' },
              { name: 'Disaster Helpline', num: '1078' },
              { name: 'Women Helpline', num: '1091' },
            ].map((ec) => (
              <div key={ec.name} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-none">
                <span className="font-bold text-slate-700">{ec.name}</span>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900">{ec.num}</span>
                  <button
                    type="button"
                    onClick={() =>
                      onOpenModal({
                        title: `Dial ${ec.name} (${ec.num})`,
                        category: 'Emergency Dispatch',
                        description: `Initiating priority emergency call to ${ec.name} (${ec.num}) with live location coordinates for Outer North Delhi.`,
                        primaryActionLabel: `Call ${ec.num} Now`,
                      })
                    }
                    className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px] font-bold"
                  >
                    📞 Call
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Middle & Bottom Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-sm font-extrabold text-slate-900">Alert Map</h3>
              <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[10px] font-bold">Live Alerts</span>
            </div>
            <InteractiveMap
              heightClass="h-56"
              showSearchOverlay
              showSearchBottomButton={false}
              showLegendBar={[
                { label: 'Critical', color: 'bg-rose-500' },
                { label: 'Important', color: 'bg-orange-500' },
                { label: 'Advisory', color: 'bg-amber-400' },
                { label: 'Resolved', color: 'bg-emerald-500' },
              ]}
            />
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <h3 className="text-sm font-extrabold text-slate-900 mb-2.5">🛡️ Safety Tips</h3>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { t: 'Stay Indoors', s: 'During heavy rain or thunderstorms' },
                { t: 'Avoid Flooded Areas', s: 'Do not drive through waterlogged roads' },
                { t: 'Wear a Mask', s: 'If air quality is poor' },
                { t: 'Stay Hydrated', s: 'During heatwave conditions' },
              ].map((tip) => (
                <div key={tip.t} className="p-2.5 rounded-xl bg-slate-50">
                  <p className="text-xs font-extrabold text-slate-900">{tip.t}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{tip.s}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-extrabold text-slate-900">Recent Alerts</h3>
            <span className="text-xs font-semibold text-blue-600">View All ›</span>
          </div>
          <div className="space-y-2.5">
            {[
              { t: 'Heavy Rainfall Expected', loc: 'Rohini, Pitampura, Keshav Puram', ago: '15 min ago', tag: 'Critical', cls: 'bg-rose-50 text-rose-600' },
              { t: 'Waterlogging Reported', loc: 'Outer Ring Road (Rohini)', ago: '1 hour ago', tag: 'Important', cls: 'bg-orange-50 text-orange-600' },
              { t: 'Road Closure', loc: 'NH 44 (Azadpur)', ago: '2 hours ago', tag: 'Critical', cls: 'bg-rose-50 text-rose-600' },
              { t: 'Poor Air Quality Advisory', loc: 'Outer North Delhi', ago: '3 hours ago', tag: 'Advisory', cls: 'bg-amber-50 text-amber-700' },
              { t: 'Heatwave Alert', loc: 'Delhi NCR Region', ago: '5 hours ago', tag: 'Advisory', cls: 'bg-amber-50 text-amber-700' },
              { t: 'Accident on Ring Road', loc: 'Near Pitampura Flyover', ago: '6 hours ago', tag: 'Important', cls: 'bg-orange-50 text-orange-600' },
              { t: 'Maintenance Work', loc: 'Mukarba Chowk', ago: '8 hours ago', tag: 'Info', cls: 'bg-blue-50 text-blue-600' },
            ].map((ra) => (
              <div key={ra.t} className="flex items-center justify-between gap-2 py-1.5 border-b border-slate-100 last:border-none text-xs">
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 truncate">{ra.t}</p>
                  <p className="text-[10px] text-slate-500 truncate">{ra.loc}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[9px] text-slate-400">{ra.ago}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${ra.cls}`}>{ra.tag}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="xl:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <h3 className="text-sm font-extrabold text-slate-900 mb-2.5">Upcoming Alerts</h3>
            <div className="space-y-2 text-xs">
              {[
                { t: 'Heavy Rainfall (Possible)', w: 'Tomorrow, 6:00 AM', tag: 'Advisory' },
                { t: 'Air Quality Deterioration', w: 'Tomorrow, 6:00 PM', tag: 'Advisory' },
                { t: 'Heatwave Conditions', w: 'In 2 days', tag: 'Important' },
                { t: 'Road Maintenance', w: 'In 2 days', tag: 'Info' },
              ].map((u) => (
                <div key={u.t} className="flex items-center justify-between py-1">
                  <div>
                    <p className="font-bold text-slate-800">{u.t}</p>
                    <p className="text-[10px] text-slate-400">{u.w}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-[9px] font-bold">{u.tag}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <h3 className="text-sm font-extrabold text-slate-900 mb-2.5">👥 Community Reports</h3>
            <div className="space-y-2 text-xs">
              {[
                { t: 'Waterlogging near Rohini Sec 8', loc: 'Rohini • 20 min ago' },
                { t: 'Fallen tree on side road', loc: 'Model Town • 1 hour ago' },
                { t: 'Power cut in Shalimar Bagh', loc: 'Shalimar Bagh • 2 hours ago' },
              ].map((cr) => (
                <div key={cr.t} className="p-2 rounded-xl bg-slate-50">
                  <p className="font-bold text-slate-800">{cr.t}</p>
                  <p className="text-[10px] text-slate-400">📍 {cr.loc}</p>
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
   12. AI ASSISTANT DASHBOARD (Page 24 Desktop)
   ============================================================================ */
export const AiAssistantDashboard: React.FC<DashboardCommonProps> = ({
  onNavigate,
}) => {
  const [messages, setMessages] = useState<{ role: 'ai' | 'user'; text: string }[]>([]);
  const [input, setInput] = useState('');

  const handleSend = (promptText?: string) => {
    const q = (promptText ?? input).trim();
    if (!q) return;
    const lower = q.toLowerCase();
    let reply = AI_KNOWLEDGE_BASE.default;
    if (lower.includes('weather') || lower.includes('rain') || lower.includes('heat')) {
      reply = AI_KNOWLEDGE_BASE.weather;
    } else if (lower.includes('traffic') || lower.includes('route') || lower.includes('airport') || lower.includes('road')) {
      reply = AI_KNOWLEDGE_BASE.traffic;
    } else if (lower.includes('air') || lower.includes('aqi') || lower.includes('pollution')) {
      reply = AI_KNOWLEDGE_BASE.air;
    } else if (lower.includes('event') || lower.includes('fest')) {
      reply = AI_KNOWLEDGE_BASE.events;
    } else if (lower.includes('alert') || lower.includes('safe') || lower.includes('hospital') || lower.includes('pharmac') || lower.includes('medical')) {
      reply = AI_KNOWLEDGE_BASE.alerts;
    } else if (lower.includes('restaurant') || lower.includes('cafe') || lower.includes('food')) {
      reply = AI_KNOWLEDGE_BASE.restaurants;
    }

    setMessages((prev) => [...prev, { role: 'user', text: q }, { role: 'ai', text: reply }]);
    if (!promptText) setInput('');
  };

  return (
    <div className="space-y-4">
      <HeroBanner
        dashboardId="ai-assistant"
        title="AI Assistant"
        subtitle="Your Smart Companion for a Safer, Smarter and More Connected Neighborhood"
        bottomPills={[
          { icon: <span>⚡</span>, label: 'Real-time information' },
          { icon: <span>📍</span>, label: 'Hyperlocal insights' },
          { icon: <span>⭐</span>, label: 'Personalized recommendations' },
          { icon: <span>🕒</span>, label: 'Available 24/7' },
        ]}
        rightWidget={
          <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl p-3 max-w-xs">
            <img
              src="/assets/crops/ai-robot-umbrella.webp"
              alt="MyArea24 AI Robot"
              className="w-16 h-16 rounded-xl object-contain bg-white/90 p-1 shrink-0"
            />
            <div className="bg-white text-slate-900 rounded-xl p-2.5 text-xs shadow">
              <p className="font-medium">Hi! I'm your</p>
              <p className="font-extrabold text-indigo-700">MyArea24 AI Assistant.</p>
              <p className="text-[11px] text-slate-600">How can I help you today?</p>
            </div>
          </div>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Left 8 cols: Chat Interface + Personalized Insights */}
        <div className="xl:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm">
                  🤖
                </div>
                <h3 className="text-sm font-extrabold text-slate-900">Chat with MyArea24 AI</h3>
              </div>
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={() => setMessages([])}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-600"
                >
                  Clear Chat
                </button>
              )}
            </div>

            {/* Greeting Box */}
            <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200/60 mb-4">
              <p className="text-xs font-extrabold text-slate-900">Hello Divyansh! 👋</p>
              <p className="text-xs text-slate-600 mt-1">
                I'm your MyArea24 AI Assistant. I can help you with:
              </p>
              <ul className="text-xs text-slate-600 space-y-1 mt-2 list-disc list-inside">
                <li>Real-time updates (weather, traffic, air quality, alerts)</li>
                <li>Local information (services, businesses, events)</li>
                <li>Safety and emergency guidance</li>
                <li>Personalized recommendations</li>
                <li>Answers to anything about your area</li>
              </ul>
              <p className="text-xs font-bold text-slate-700 mt-2.5">What would you like to know?</p>
            </div>

            {/* Conversation History */}
            {messages.length > 0 && (
              <div className="space-y-3 mb-4 max-h-72 overflow-y-auto pr-1">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs whitespace-pre-line leading-relaxed ${
                        m.role === 'user'
                          ? 'bg-indigo-600 text-white font-semibold'
                          : 'bg-indigo-50/80 text-slate-800 border border-indigo-100'
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 6 Suggested Prompt Cards (2x3) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
              {[
                { icon: '🌤️', text: "What's the weather like today in Rohini?" },
                { icon: '🔺', text: 'Any important alerts today?' },
                { icon: '🍃', text: 'Show me the current air quality in my area' },
                { icon: '🏥', text: 'Find nearby pharmacies open now' },
                { icon: '🚗', text: 'Are there any traffic jams near me?' },
                { icon: '🧭', text: 'Suggest safe routes to IGI Airport' },
              ].map((p) => (
                <button
                  key={p.text}
                  type="button"
                  onClick={() => handleSend(p.text)}
                  className="p-3 rounded-xl border border-slate-200/80 hover:border-indigo-400 hover:bg-indigo-50/30 flex items-center gap-2.5 text-left text-xs font-semibold text-slate-700 transition"
                >
                  <span className="text-base">{p.icon}</span>
                  <span>{p.text}</span>
                </button>
              ))}
            </div>

            {/* Chat Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
            >
              <Paperclip className="w-4 h-4 text-slate-400 cursor-pointer" />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about your area..."
                className="flex-1 bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
              <Mic className="w-4 h-4 text-slate-400 cursor-pointer" />
              <button
                type="submit"
                className="w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-1.5 mt-2.5 text-[11px]">
              <span className="text-slate-400">Try asking:</span>
              {[
                'Weather today',
                'Traffic to Connaught Place',
                'Air quality forecast',
                'Nearby hospitals',
                'Safety tips',
              ].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleSend(tag)}
                  className="px-2.5 py-0.5 rounded-full bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 font-medium transition"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Personalized Insights for You */}
          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-900">✨ Personalized Insights for You</h3>
              <span className="text-xs font-semibold text-blue-600">See More ›</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: '☀️', title: '28°C', sub: 'Sunny', desc: 'Weather in your area' },
                { icon: '🍃', title: '82 (Good)', sub: 'Air Quality Index', desc: 'Better than yesterday' },
                { icon: '🚗', title: 'Moderate', sub: 'Traffic Condition', desc: 'Outer Ring Road' },
                { icon: '🔺', title: '2 Alerts', sub: 'In your area', desc: '1 Critical • 1 Important' },
              ].map((ins) => (
                <div key={ins.title} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{ins.icon}</span>
                    <div>
                      <p className="text-xs font-extrabold text-slate-900">{ins.title}</p>
                      <p className="text-[10px] font-semibold text-slate-600">{ins.sub}</p>
                      <p className="text-[9px] text-slate-400">{ins.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 4 cols: Quick Actions + Popular Questions + AI Usage Tips */}
        <div className="xl:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <h3 className="text-sm font-extrabold text-slate-900 mb-3">⚡ Quick Actions</h3>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { icon: '🌤️', label: 'Check Weather', nav: 'weather' as const },
                { icon: '🚗', label: 'Live Traffic', nav: 'traffic' as const },
                { icon: '🍃', label: 'Air Quality', nav: 'air-quality' as const },
                { icon: '🔔', label: 'View Alerts', nav: 'alerts' as const },
                { icon: '🏪', label: 'Find Nearby Services', nav: 'services' as const },
                { icon: '🚨', label: 'Emergency Help', nav: 'emergency' as const },
                { icon: '🧭', label: 'Plan a Route', nav: 'map' as const },
                { icon: '📅', label: 'Events Near Me', nav: 'events' as const },
                { icon: '📍', label: 'Local Recommendations', nav: 'businesses' as const },
              ].map((qa) => (
                <button
                  key={qa.label}
                  type="button"
                  onClick={() => onNavigate(qa.nav)}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-100 flex flex-col items-center text-center gap-1.5 transition"
                >
                  <span className="text-xl">{qa.icon}</span>
                  <span className="text-[10px] font-bold text-slate-700 leading-tight">{qa.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-sm font-extrabold text-slate-900">💡 Popular Questions</h3>
              <span className="text-xs font-semibold text-blue-600">View All ›</span>
            </div>
            <div className="space-y-2">
              {[
                'Will it rain today in Delhi?',
                'What is the current air quality in Rohini?',
                'Are there any road closures near me?',
                'Find 24x7 medical stores nearby',
                'What are the safety tips during heatwave?',
                'How to reach IGI Airport from Rohini?',
              ].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleSend(q)}
                  className="w-full py-1.5 px-2 rounded-lg hover:bg-slate-50 flex items-center justify-between text-xs text-slate-700 font-medium text-left"
                >
                  <span className="truncate">{q}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <h3 className="text-sm font-extrabold text-slate-900 mb-2.5">✨ AI Usage Tips</h3>
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              {[
                { t: 'Be specific', s: 'Mention your area or landmark' },
                { t: 'Ask follow-up questions', s: 'Get more detailed insights' },
                { t: 'Use natural language', s: 'Ask like you would to a friend' },
                { t: 'Explore suggestions', s: 'Try the recommended prompts' },
              ].map((u) => (
                <div key={u.t} className="p-2.5 rounded-xl bg-slate-50">
                  <p className="font-bold text-slate-800">{u.t}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{u.s}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
