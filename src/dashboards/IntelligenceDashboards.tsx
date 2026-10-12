import React, { useState } from 'react';
import { DashboardCommonProps } from './MainDashboards';
import { HeroBanner } from '../components/HeroBanner';
import { InteractiveMap } from '../components/InteractiveMap';
import { askLiveAiAssistant } from '../services/liveIntelligence';
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
  Send,
  Paperclip,
  Mic,
  CheckCircle2,
  Eye,
  Gauge,
  RefreshCw,
  Radio,
  ShieldCheck,
} from 'lucide-react';

/* ============================================================================
   7. INTELLIGENCE DASHBOARD (Page 14 Desktop) — 100% LIVE LOCATION TELEMETRY
   ============================================================================ */
export const IntelligenceDashboard: React.FC<DashboardCommonProps> = ({
  onNavigate,
  onAskAi,
  selectedArea,
  liveIntel,
}) => {
  const [forecastTab, setForecastTab] = useState<'Today' | 'Tomorrow' | '7 Days'>('Today');
  const { weather, airQuality, traffic, alerts, mandiRates, fuelRates, demandTrends, location } = liveIntel;

  const shortArea = selectedArea.split(',')[0]?.trim() || selectedArea;
  const pm25Obj = airQuality.pollutants.find((p) => p.name === 'PM2.5');
  const criticalCount = alerts.filter((a) => a.severity === 'Critical' || a.severity === 'Important').length;

  return (
    <div className="space-y-4">
      <HeroBanner
        dashboardId="intelligence"
        tag={
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-300" />
              <span>{selectedArea}</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/25 border border-emerald-300/40 text-emerald-200 text-[10px] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {liveIntel.loading
                ? 'Syncing Live Telemetry...'
                : `Live Telemetry • ${location.lat.toFixed(3)}°N, ${location.lng.toFixed(3)}°E`}
            </span>
          </div>
        }
        title={
          <>
            Local Intelligence,
            <br />
            <span className="text-[#93C5FD]">For a Better You</span>
          </>
        }
        description="Real-time insights on weather, air quality, traffic, safety, market rates and local trends — dynamically grounded to your exact location."
        askAiWidget={{
          placeholder: `Ask about weather, traffic, safety in ${shortArea}...`,
          chips: [
            "Today's summary",
            'Is it safe to go out?',
            'Will it rain today?',
            `Traffic around ${shortArea}`,
          ],
          onAsk: onAskAi,
        }}
      />

      {/* Sub-navigation Pills + Live Refresh Status */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { label: 'Overview', icon: '✨', active: true, target: 'intelligence' as const },
            { label: 'Weather', icon: '☀️', active: false, target: 'weather' as const },
            { label: 'Air Quality', icon: '🍃', active: false, target: 'air-quality' as const },
            { label: 'Traffic', icon: '🚗', active: false, target: 'traffic' as const },
            { label: 'Safety & Alerts', icon: '🔺', active: false, target: 'alerts' as const },
            { label: 'Market Rates', icon: '📈', active: false, target: 'market-rates' as const },
            { label: 'Fuel Rates', icon: '⛽', active: false, target: 'fuel-rates' as const },
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

        <button
          type="button"
          onClick={() => liveIntel.refresh()}
          className="px-3 py-1.5 rounded-full bg-white border border-slate-200/80 hover:border-blue-300 text-[11px] font-bold text-slate-600 flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${liveIntel.loading ? 'animate-spin' : ''}`} />
          <span>Updated {liveIntel.lastUpdated}</span>
        </button>
      </div>

      {/* Top 4 KPI Summary Cards (100% Live) */}
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
              <p className="text-xl font-extrabold text-slate-900">{weather.temperatureC}°C</p>
              <p className="text-xs font-bold text-slate-700 truncate max-w-[130px]">{weather.conditionText}</p>
              <p className="text-[10px] text-slate-400">Feels like {weather.feelsLikeC}°C</p>
            </div>
          </div>
          <div className="text-right">
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
              • Live
            </span>
            <p className="text-[10px] text-slate-400 mt-2">Weather</p>
          </div>
        </div>

        <div
          onClick={() => onNavigate('air-quality')}
          className="cursor-pointer bg-white rounded-2xl p-4 shadow-card border border-slate-200/70 flex items-center justify-between hover:border-blue-300 transition"
        >
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl ${airQuality.colorBg} flex items-center justify-center text-xl`}>
              🍃
            </div>
            <div>
              <p className="text-xl font-extrabold text-slate-900">AQI {airQuality.aqiValue}</p>
              <p className="text-xs font-bold text-slate-700">{airQuality.aqiCategory}</p>
              <p className="text-[10px] text-slate-400">
                PM2.5: {pm25Obj ? `${pm25Obj.value} µg/m³` : 'Live'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className={`px-2 py-0.5 rounded-full ${airQuality.colorBg} ${airQuality.colorText} text-[10px] font-bold`}>
              {airQuality.aqiCategory}
            </span>
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
              <p className="text-xl font-extrabold text-slate-900">{traffic.congestionLevel}</p>
              <p className="text-xs font-bold text-slate-700">Traffic Flow</p>
              <p className="text-[10px] text-slate-400">Avg. Speed {traffic.averageSpeedKmh} km/h</p>
            </div>
          </div>
          <div className="text-right">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                traffic.congestionLevel === 'Smooth'
                  ? 'bg-emerald-50 text-emerald-700'
                  : traffic.congestionLevel === 'Moderate'
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              {traffic.congestionLevel}
            </span>
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
              <p className="text-xl font-extrabold text-slate-900">
                {criticalCount > 0 ? `${criticalCount} Active` : 'Low Risk'}
              </p>
              <p className="text-xs font-bold text-slate-700">Safety & Alerts</p>
              <p className="text-[10px] text-slate-400">
                {alerts.length} live notice{alerts.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                criticalCount > 0 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {criticalCount > 0 ? '• Advisory' : '• Safe'}
            </span>
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
                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  forecastTab === t ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {forecastTab === '7 Days' ? (
            <div className="grid grid-cols-5 gap-2 text-center pt-2">
              {weather.daily.slice(0, 5).map((d) => (
                <div key={d.dayLabel} className="p-2 rounded-xl bg-slate-50/80 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold text-slate-700">{d.dayLabel}</span>
                  <span className="text-base">{d.emoji}</span>
                  <span className="text-[11px] font-extrabold text-slate-900">
                    {d.maxTempC}°/{d.minTempC}°
                  </span>
                  <span className="text-[10px] text-blue-500 font-semibold">💧 {d.rainChance}%</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-2 text-center pt-2">
              {(forecastTab === 'Today' ? weather.hourly.slice(0, 5) : weather.tomorrowHourly.slice(0, 5)).map(
                (h, idx) => (
                  <div key={`${h.timeLabel}-${idx}`} className="p-2 rounded-xl bg-slate-50/80 flex flex-col items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-slate-500">{h.timeLabel}</span>
                    {h.isDay ? (
                      <Sun className="w-5 h-5 text-amber-400 fill-amber-400" />
                    ) : (
                      <Moon className="w-5 h-5 text-indigo-400 fill-indigo-400" />
                    )}
                    <span className="text-xs font-extrabold text-slate-900">{h.tempC}°</span>
                    <span className="text-[10px] text-blue-500 font-semibold">💧 {h.rainChance}%</span>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Air Quality (4 cols) */}
        <div className="xl:col-span-4 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <span>🍃</span> Air Quality (CPCB)
            </h3>
            <button onClick={() => onNavigate('air-quality')} className="text-xs font-semibold text-blue-600">
              View Details ›
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div
              style={{ borderColor: airQuality.ringHex }}
              className="w-28 h-28 rounded-full border-[8px] flex flex-col items-center justify-center shrink-0"
            >
              <span className="text-2xl font-extrabold text-slate-900 leading-none">{airQuality.aqiValue}</span>
              <span className={`text-xs font-bold ${airQuality.colorText} mt-0.5`}>{airQuality.aqiCategory}</span>
              <span className="text-[9px] text-slate-400">CPCB NAQI</span>
            </div>
            <div className="flex-1 space-y-1.5 text-[11px]">
              {airQuality.pollutants.slice(0, 6).map((p) => (
                <div key={p.name} className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500 w-12">{p.name}</span>
                  <span className="font-bold text-slate-800">
                    {p.value} {p.unit}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${p.colorBg} ${p.colorText}`}>
                    {p.status}
                  </span>
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
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                • Live
              </span>
            </div>
            <button onClick={() => onNavigate('traffic')} className="text-xs font-semibold text-blue-600">
              View on Map ›
            </button>
          </div>
          <div className="space-y-2.5">
            {traffic.corridors.slice(0, 4).map((t) => (
              <div key={t.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${t.dotColor}`} />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{t.roadName}</p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {t.status} • {t.distanceKm} km away
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-lg text-xs font-extrabold shrink-0 ${t.badgeClass}`}>
                  {t.speedKmh} km/h
                </span>
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
            {alerts.slice(0, 4).map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-slate-50">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span>{a.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{a.title}</p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {a.sender} • {a.timeAgo}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${a.badgeClass}`}>
                  {a.category}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="xl:col-span-4 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-extrabold text-slate-900">📈 Market Rates ({fuelRates.city})</h3>
            <button onClick={() => onNavigate('market-rates')} className="text-xs font-semibold text-blue-600">
              See All ›
            </button>
          </div>
          <div className="space-y-2">
            {mandiRates.map((m) => (
              <div
                key={m.commodity}
                className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-none text-xs"
              >
                <span className="font-bold text-slate-800 flex items-center gap-2">
                  <span>{m.icon}</span> {m.commodity}
                </span>
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-slate-900">
                    ₹{m.pricePerKg} / {m.unit}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold text-emerald-700 bg-emerald-50">
                    {m.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="xl:col-span-4 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-extrabold text-slate-900">⛽ Fuel Prices ({fuelRates.city})</h3>
            <button onClick={() => onNavigate('fuel-rates')} className="text-xs font-semibold text-blue-600">
              View Trends
            </button>
          </div>
          <div className="space-y-2.5">
            {[
              { f: 'Petrol', icon: '⛽', p: `₹${fuelRates.petrol.toFixed(2)} / L`, ch: 'Live OMC', cls: 'text-emerald-600 bg-emerald-50' },
              { f: 'Diesel', icon: '🛢️', p: `₹${fuelRates.diesel.toFixed(2)} / L`, ch: 'Live OMC', cls: 'text-emerald-600 bg-emerald-50' },
              { f: 'CNG', icon: '🟢', p: `₹${fuelRates.cng.toFixed(2)} / kg`, ch: 'Live IGL/MGL', cls: 'text-blue-600 bg-blue-50' },
              { f: 'LPG (14.2 kg)', icon: '🔴', p: `₹${fuelRates.lpg.toFixed(2)}`, ch: 'Domestic', cls: 'text-slate-600 bg-slate-100' },
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
              <h3 className="text-sm font-extrabold text-slate-900">
                Live Hyperlocal Demand & Behavioral Signals
              </h3>
              <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[9px] font-bold">
                LIVE SIGNAL CORRELATION
              </span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">{shortArea}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {demandTrends.map((tr) => (
              <div
                key={tr.title}
                className="p-3 rounded-xl border border-slate-200/70 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-base shrink-0">
                    {tr.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-slate-900 truncate">{tr.title}</p>
                    <p className="text-[11px] text-slate-500 truncate">{tr.subtitle}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-extrabold shrink-0">
                  {tr.multiplier}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="xl:col-span-4 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-sm font-extrabold text-slate-900">Area Map ({shortArea})</h3>
            <button onClick={() => onNavigate('map')} className="text-xs font-semibold text-blue-600">
              View Full Map
            </button>
          </div>
          <InteractiveMap
            heightClass="h-40"
            showSearchBottomButton={false}
            coords={{ lat: location.lat, lng: location.lng }}
            centerLabel={`${shortArea}\n${weather.temperatureC}°C • AQI ${airQuality.aqiValue}`}
          />
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   8. WEATHER DASHBOARD (Page 16 Desktop) — 100% LIVE METEOROLOGICAL TELEMETRY
   ============================================================================ */
export const WeatherDashboard: React.FC<DashboardCommonProps> = ({
  onNavigate,
  onAskAi,
  selectedArea,
  liveIntel,
}) => {
  const { weather, airQuality, location } = liveIntel;
  const shortArea = selectedArea.split(',')[0]?.trim() || selectedArea;

  // Dynamic Weather Alerts derived from live telemetry
  const dynamicWeatherNotices = [
    {
      title:
        weather.temperatureC >= 36
          ? `High Heat Advisory (${weather.temperatureC}°C)`
          : weather.temperatureC <= 14
          ? `Cool Weather Notice (${weather.temperatureC}°C)`
          : `Current Conditions: ${weather.conditionText} (${weather.temperatureC}°C)`,
      sub: weather.outdoorActivityAdvice,
      ago: 'Live now',
      tag: weather.temperatureC >= 36 ? 'High' : 'Live',
      cls: weather.temperatureC >= 36 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-700',
    },
    {
      title:
        weather.precipitationMm > 0
          ? `Active Precipitation (${weather.precipitationMm} mm)`
          : `Rain Probability: ${weather.chanceOfRain}% Today`,
      sub:
        weather.waterloggingRiskIndex > 30
          ? `Waterlogging Risk Index ${weather.waterloggingRiskIndex}/100 — watch low-lying underpasses`
          : `No waterlogging risk in ${shortArea} (Risk Index: ${weather.waterloggingRiskIndex}/100)`,
      ago: 'Live now',
      tag: weather.chanceOfRain >= 50 ? 'Moderate' : 'Info',
      cls: weather.chanceOfRain >= 50 ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-600',
    },
    {
      title: `UV Index ${weather.uvIndex} (${
        weather.uvIndex >= 8 ? 'Very High' : weather.uvIndex >= 6 ? 'High' : weather.uvIndex >= 3 ? 'Moderate' : 'Low'
      })`,
      sub:
        weather.uvIndex >= 6
          ? 'Apply SPF 30+ sunscreen and limit direct midday sun exposure'
          : 'Safe UV levels for outdoor walks and errands',
      ago: 'Live now',
      tag: weather.uvIndex >= 6 ? 'Advisory' : 'Safe',
      cls: weather.uvIndex >= 6 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700',
    },
    {
      title: `Surface Wind ${weather.windKph} km/h (${weather.windDir})`,
      sub: `Atmospheric Pressure ${weather.pressureHpa} hPa • Visibility ${weather.visibilityKm} km`,
      ago: 'Live now',
      tag: weather.windKph >= 28 ? 'Windy' : 'Normal',
      cls: weather.windKph >= 28 ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-700',
    },
  ];

  return (
    <div className="space-y-4">
      <HeroBanner
        dashboardId="weather"
        tag={
          <>
            <MapPin className="w-3.5 h-3.5 text-blue-300" />
            <span>{selectedArea}</span>
          </>
        }
        title="Today's Weather"
        description={`Live meteorological telemetry from ${weather.source} for ${shortArea} (${location.lat.toFixed(
          3
        )}°N, ${location.lng.toFixed(3)}°E).`}
        bottomPills={[
          { icon: <span>☀️</span>, label: 'Current Weather', active: true },
          { icon: <span>🕒</span>, label: 'Hourly Forecast' },
          { icon: <span>📅</span>, label: '7 Day Forecast' },
          { icon: <span>🍃</span>, label: 'Air Quality', onClick: () => onNavigate('air-quality') },
          { icon: <span>🔺</span>, label: 'Alerts', onClick: () => onNavigate('alerts') },
        ]}
        askAiWidget={{
          placeholder: `Ask about ${shortArea}'s weather, rain chances...`,
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
            <span className="text-[11px] text-emerald-600 font-semibold">
              ● Live ({weather.observedAt})
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 my-2">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center">
                <Sun className="w-11 h-11 text-amber-400 fill-amber-400" />
              </div>
              <div>
                <p className="text-4xl font-extrabold text-slate-900">{weather.temperatureC}°C</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{weather.conditionText}</p>
                <p className="text-xs text-slate-500">Feels like {weather.feelsLikeC}°C</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                ✨ {weather.temperatureC >= 36 ? 'Warm Day' : 'Pleasant'}
              </div>
              <div className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold">
                💧 {weather.precipitationMm > 0 ? `${weather.precipitationMm} mm Rain` : `${weather.chanceOfRain}% Rain Chance`}
              </div>
              <div className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold">
                ☀️ UV Index {weather.uvIndex} ({weather.uvIndex >= 6 ? 'High' : weather.uvIndex >= 3 ? 'Mod' : 'Low'})
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-3 mt-3 border-t border-slate-100 text-xs">
            <div>
              <p className="font-extrabold text-slate-900 flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-blue-500" /> {weather.humidity}%
              </p>
              <p className="text-[10px] text-slate-400">Humidity</p>
            </div>
            <div>
              <p className="font-extrabold text-slate-900 flex items-center gap-1">
                <Wind className="w-3.5 h-3.5 text-blue-500" /> {weather.windKph} km/h
              </p>
              <p className="text-[10px] text-slate-400">Wind ({weather.windDir})</p>
            </div>
            <div>
              <p className="font-extrabold text-slate-900 flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-blue-500" /> {weather.pressureHpa} hPa
              </p>
              <p className="text-[10px] text-slate-400">Pressure</p>
            </div>
            <div>
              <p className="font-extrabold text-slate-900 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-blue-500" /> {weather.visibilityKm} km
              </p>
              <p className="text-[10px] text-slate-400">Visibility</p>
            </div>
          </div>
        </div>

        {/* Today's Highlights (4 cols) */}
        <div className="xl:col-span-4 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-extrabold text-slate-900">Today's Highlights</h3>
            <span className="text-[10px] font-semibold text-slate-400">{shortArea}</span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { icon: '🌡️', v: `${weather.maxTempC}°C`, l: 'Max Temp' },
              { icon: '🌡️', v: `${weather.minTempC}°C`, l: 'Min Temp' },
              { icon: '💧', v: `${weather.chanceOfRain}%`, l: 'Chance of Rain' },
              { icon: '☀️', v: weather.sunlightHours, l: 'Sunlight Hours' },
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
                <p className="text-xs font-extrabold text-slate-900">{weather.sunrise}</p>
                <p className="text-[10px] text-slate-500">Sunrise</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 bg-orange-50/60 p-2 rounded-xl">
              <span className="text-xl">🌇</span>
              <div>
                <p className="text-xs font-extrabold text-slate-900">{weather.sunset}</p>
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
            <div
              style={{ borderColor: airQuality.ringHex }}
              className="w-24 h-24 rounded-full border-[7px] flex flex-col items-center justify-center shrink-0"
            >
              <span className="text-2xl font-extrabold text-slate-900 leading-none">{airQuality.aqiValue}</span>
              <span className={`text-[11px] font-bold ${airQuality.colorText}`}>{airQuality.aqiCategory}</span>
            </div>
            <div className="flex-1 space-y-1 text-[10px]">
              {airQuality.pollutants.slice(0, 6).map((p) => (
                <div key={p.name} className="flex justify-between">
                  <span className="text-slate-500">{p.name}</span>
                  <span className="font-bold text-slate-800">
                    {p.value} {p.unit}
                  </span>
                  <span className={`${p.colorText} font-bold`}>{p.status}</span>
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
            <h3 className="text-sm font-extrabold text-slate-900">🕒 Live Hourly Forecast (Next 24h)</h3>
            <span className="text-[11px] font-semibold text-slate-400">Open-Meteo Grid</span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 text-center">
            {weather.hourly.slice(0, 8).map((h, i) => (
              <div key={`${h.timeLabel}-${i}`} className="p-2 rounded-xl bg-slate-50 flex flex-col items-center gap-1.5">
                <span className="text-[10px] text-slate-500 font-medium">{h.timeLabel}</span>
                {h.isDay ? (
                  <Sun className="w-5 h-5 text-amber-400 fill-amber-400" />
                ) : (
                  <Moon className="w-5 h-5 text-indigo-500 fill-indigo-500" />
                )}
                <span className="text-xs font-extrabold text-slate-900">{h.tempC}°</span>
                <span className="text-[9px] text-blue-500 font-semibold">💧{h.rainChance}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="xl:col-span-6 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-extrabold text-slate-900">📅 7 Day Forecast</h3>
            <span className="text-[11px] font-semibold text-slate-400">{shortArea}</span>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center">
            {weather.daily.slice(0, 7).map((day, idx) => (
              <div
                key={`${day.dayLabel}-${idx}`}
                className={`p-2 rounded-xl flex flex-col items-center gap-1 ${
                  idx === 0 ? 'bg-blue-50/80 border border-blue-200' : 'bg-slate-50'
                }`}
              >
                <span className="text-[11px] font-bold text-slate-800">{day.dayLabel}</span>
                <span className="text-[9px] text-slate-400">{day.dateLabel}</span>
                <span className="text-base my-0.5">{day.emoji}</span>
                <span className="text-[10px] font-extrabold text-slate-900">
                  {day.minTempC}° / {day.maxTempC}°
                </span>
                <span className="text-[9px] text-blue-500 font-semibold">💧 {day.rainChance}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom 3-Column Row */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-4 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-sm font-extrabold text-slate-900">Weather Map ({shortArea})</h3>
            <button onClick={() => onNavigate('map')} className="text-xs font-semibold text-blue-600">
              View Full Map ›
            </button>
          </div>
          <InteractiveMap
            heightClass="h-48"
            showSearchBottomButton={false}
            coords={{ lat: location.lat, lng: location.lng }}
            centerLabel={`${shortArea}\n${weather.temperatureC}°C ${weather.conditionText}`}
          />
        </div>

        <div className="xl:col-span-4 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-extrabold text-slate-900">Weather Alerts & Telemetry</h3>
            <button onClick={() => onNavigate('alerts')} className="text-xs font-semibold text-blue-600">
              See All ›
            </button>
          </div>
          <div className="space-y-2.5">
            {dynamicWeatherNotices.map((al) => (
              <div
                key={al.title}
                className="flex items-center justify-between gap-2 text-xs p-1.5 rounded-lg hover:bg-slate-50"
              >
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
            <h3 className="text-sm font-extrabold text-slate-900">Local Weather Insights</h3>
            <span className="text-[10px] font-semibold text-emerald-600">● Live Computed</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              {
                icon: '🚶',
                label: 'Best Time to Go Out',
                val: weather.temperatureC >= 33 ? '6 AM – 9 AM' : 'Now / Evening',
                sub: weather.temperatureC >= 33 ? 'Avoid peak afternoon sun' : `${weather.temperatureC}°C pleasant air`,
              },
              {
                icon: '🚗',
                label: 'Travel Conditions',
                val: weather.precipitationMm > 0 ? 'Wet Roads' : 'Dry & Clear',
                sub: `Visibility ${weather.visibilityKm} km`,
              },
              {
                icon: '🚲',
                label: 'Outdoor Activities',
                val: airQuality.aqiValue <= 150 && weather.precipitationMm === 0 ? 'Favorable' : 'Take Caution',
                sub: `AQI ${airQuality.aqiValue} (${airQuality.aqiCategory})`,
              },
              {
                icon: '🧴',
                label: 'UV & Heat Advisory',
                val: `UV Index ${weather.uvIndex}`,
                sub: weather.uvIndex >= 6 ? 'Use SPF 30+ protection' : 'Low UV exposure risk',
              },
            ].map((ins) => (
              <div key={ins.label} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-lg">{ins.icon}</span>
                <p className="text-[10px] text-slate-500 mt-1">{ins.label}</p>
                <p className="text-xs font-extrabold text-emerald-700">{ins.val}</p>
                <p className="text-[9px] text-slate-400 truncate">{ins.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   9. AIR QUALITY DASHBOARD (Page 18 Desktop) — 100% LIVE CPCB NAQI TELEMETRY
   ============================================================================ */
export const AirQualityDashboard: React.FC<DashboardCommonProps> = ({
  onAskAi,
  selectedArea,
  liveIntel,
  onOpenLocationPicker,
}) => {
  const [trendRange, setTrendRange] = useState<'24h' | '5d'>('24h');
  const { airQuality, location } = liveIntel;
  const shortArea = selectedArea.split(',')[0]?.trim() || selectedArea;

  // Build real SVG path from live 24h or 5-day AQI points
  const chartPoints =
    trendRange === '24h' && airQuality.hourlyTrend24h.length > 1
      ? airQuality.hourlyTrend24h.map((p) => ({ label: p.timeLabel, val: p.aqi }))
      : airQuality.dailyForecast.map((d) => ({ label: d.dayLabel, val: d.aqi }));

  const maxChartAqi = Math.max(150, ...chartPoints.map((p) => p.val));
  const minChartAqi = Math.max(0, Math.min(...chartPoints.map((p) => p.val)) - 15);
  const svgCoords = chartPoints.map((pt, i) => {
    const x = chartPoints.length > 1 ? Math.round((i / (chartPoints.length - 1)) * 500) : 250;
    const norm = (pt.val - minChartAqi) / Math.max(1, maxChartAqi - minChartAqi);
    const y = Math.round(90 - norm * 70);
    return { x, y, ...pt };
  });

  const linePath =
    svgCoords.length > 1
      ? svgCoords.map((c, idx) => `${idx === 0 ? 'M' : 'L'}${c.x},${c.y}`).join(' ')
      : 'M0,55 L500,55';
  const areaPath = `${linePath} L500,100 L0,100 Z`;
  const midPoint = svgCoords[Math.floor(svgCoords.length / 2)] || {
    x: 250,
    y: 45,
    val: airQuality.aqiValue,
    label: 'Now',
  };

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
        description={`Official CPCB 2014 NAQI computed from live atmospheric sensors (${airQuality.source}) around ${shortArea}.`}
        askAiWidget={{
          placeholder: `Ask about air quality & health risks in ${shortArea}...`,
          chips: ["Is today's air quality good?", 'How to stay safe?', 'Air quality forecast'],
          onAsk: onAskAi,
        }}
      />

      {/* Top Row: Current Air Quality + Pollutant Levels */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-6 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-extrabold text-slate-900">✅ Current Air Quality (CPCB Standard)</h3>
            <span className="text-[11px] text-emerald-600 font-semibold">
              Updated: {airQuality.observedAt} ●
            </span>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div
              style={{ borderColor: airQuality.ringHex }}
              className="w-32 h-32 rounded-full border-[10px] flex flex-col items-center justify-center shrink-0"
            >
              <span className="text-3xl font-extrabold text-slate-900 leading-none">{airQuality.aqiValue}</span>
              <span className={`text-sm font-bold ${airQuality.colorText} mt-1`}>{airQuality.aqiCategory}</span>
              <span className="text-[10px] text-slate-400">Prominent: {airQuality.prominentPollutant}</span>
            </div>
            <div className="flex-1 space-y-2.5 w-full">
              <div
                className={`p-3 rounded-xl ${airQuality.colorBg} border border-slate-200/70 flex items-center gap-2.5`}
              >
                <CheckCircle2 className={`w-5 h-5 ${airQuality.colorText} shrink-0`} />
                <p className="text-xs font-bold text-slate-800">{airQuality.healthAdvice}</p>
              </div>
              <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-50 text-xs">
                <span className="font-semibold text-slate-700 truncate">
                  📍 {airQuality.stationName} ({selectedArea})
                </span>
                <button
                  type="button"
                  onClick={() => onOpenLocationPicker?.()}
                  className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer shrink-0 ml-2"
                >
                  Change Location ›
                </button>
              </div>
              <div className="grid grid-cols-5 gap-1 text-center text-[9px] pt-1">
                {[
                  { l: 'Good/Sat', r: '(0–100)', c: 'bg-emerald-500' },
                  { l: 'Moderate', r: '(101–200)', c: 'bg-amber-400' },
                  { l: 'Poor', r: '(201–300)', c: 'bg-orange-500' },
                  { l: 'Very Poor', r: '(301–400)', c: 'bg-rose-500' },
                  { l: 'Severe', r: '(401+)', c: 'bg-purple-600' },
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
            <h3 className="text-sm font-extrabold text-slate-900">🧪 Live Pollutant Concentrations</h3>
            <span className="text-[11px] font-semibold text-slate-400">{airQuality.source}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {airQuality.pollutants.map((pol) => (
              <div
                key={pol.name}
                className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between gap-2"
              >
                <div>
                  <span className="text-xs font-extrabold text-slate-800">{pol.name}</span>
                  <p className="text-lg font-extrabold text-slate-900 leading-tight mt-0.5">
                    {pol.value} <span className="text-[10px] font-medium text-slate-400">{pol.unit}</span>
                  </p>
                  <p className="text-[9px] text-slate-400">Sub-Index: {pol.subIndex}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full ${pol.colorBg} ${pol.colorText} text-[10px] font-bold`}>
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
            <h3 className="text-sm font-extrabold text-slate-900">Air Quality Map ({shortArea})</h3>
            <span className="text-[10px] font-semibold text-emerald-600">● Live Grid</span>
          </div>
          <InteractiveMap
            heightClass="h-44"
            coords={{ lat: location.lat, lng: location.lng }}
            centerLabel={`${shortArea}\nAQI: ${airQuality.aqiValue} ${airQuality.aqiCategory}`}
            showSearchBottomButton={false}
          />
        </div>

        <div className="xl:col-span-4 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-extrabold text-slate-900">Air Quality Forecast (5-Day)</h3>
            <span className="text-[10px] font-semibold text-slate-400">CAMS Atmospheric Model</span>
          </div>
          <div className="grid grid-cols-5 gap-2 text-center">
            {airQuality.dailyForecast.slice(0, 5).map((f, idx) => (
              <div key={`${f.dayLabel}-${idx}`} className="p-2.5 rounded-xl bg-slate-50 flex flex-col items-center gap-1.5">
                <span className="text-xs font-bold text-slate-800">{f.dayLabel}</span>
                <span className="text-[9px] text-slate-400">{f.dateLabel}</span>
                <Sun className="w-5 h-5 text-amber-400 fill-amber-400 my-1" />
                <span className="text-base font-extrabold text-slate-900">{f.aqi}</span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${f.colorClass}`}>{f.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="xl:col-span-4 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 mb-2">❤️ Health Insights</h3>
            <p className={`text-base font-extrabold ${airQuality.colorText}`}>
              {airQuality.aqiValue <= 100
                ? 'Low Health Risk Today'
                : airQuality.aqiValue <= 200
                ? 'Moderate Risk for Sensitive Groups'
                : 'Elevated Respiratory Risk'}
            </p>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{airQuality.healthAdvice}</p>
          </div>
          <button
            type="button"
            onClick={() =>
              onAskAi(
                `What health precautions should sensitive groups take at AQI ${airQuality.aqiValue} (${airQuality.aqiCategory}) in ${selectedArea}?`
              )
            }
            className="mt-3 self-start px-3.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-600 hover:text-white transition cursor-pointer"
          >
            Ask AI Health Advisor ›
          </button>
        </div>
      </div>

      {/* Bottom Row: Live AQI Trend SVG + Smart Tips */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-6 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-extrabold text-slate-900">📈 Live AQI Trend ({shortArea})</h3>
            <div className="flex gap-1">
              {(['24h', '5d'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setTrendRange(r)}
                  className={`px-2.5 py-0.5 rounded text-xs font-bold cursor-pointer ${
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
                  <stop offset="0%" stopColor={airQuality.ringHex} stopOpacity="0.35" />
                  <stop offset="100%" stopColor={airQuality.ringHex} stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d={areaPath} fill="url(#aqiGrad)" />
              <path d={linePath} fill="none" stroke={airQuality.ringHex} strokeWidth="3" />
              <circle
                cx={midPoint.x}
                cy={midPoint.y}
                r="5"
                fill={airQuality.ringHex}
                stroke="#fff"
                strokeWidth="2"
              />
            </svg>
            <div className="absolute top-1 left-[42%] bg-white shadow border border-slate-200 rounded-lg px-2 py-1 text-center">
              <p className="text-[10px] font-extrabold text-slate-900">Now: {airQuality.aqiValue} AQI</p>
              <p className="text-[9px] text-slate-400">{airQuality.aqiCategory}</p>
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            {svgCoords.map((c, i) => (
              <span key={`${c.label}-${i}`}>{c.label}</span>
            ))}
          </div>
        </div>

        <div className="xl:col-span-6 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
          <h3 className="text-sm font-extrabold text-slate-900 mb-3">💡 Smart Tips for Cleaner Air</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { icon: '🪴', text: 'Keep indoor air-purifying plants like Areca Palm & Snake Plant' },
              {
                icon: '🪟',
                text:
                  airQuality.aqiValue > 150
                    ? 'Keep windows closed during morning smog hours'
                    : 'Ventilate rooms between 12 PM and 4 PM',
              },
              { icon: '🚌', text: 'Use Metro or carpool on high-congestion corridors' },
              {
                icon: '😷',
                text:
                  airQuality.aqiValue > 200
                    ? 'Wear an N95 mask when stepping outdoors today'
                    : 'Carry a mask if commuting along busy highways',
              },
            ].map((tip) => (
              <div
                key={tip.text}
                className="p-3 rounded-xl bg-slate-50 text-center flex flex-col items-center justify-center gap-2"
              >
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
   10. TRAFFIC DASHBOARD (Page 20 Desktop) — 100% LIVE CORRIDOR & TOMTOM TELEMETRY
   ============================================================================ */
export const TrafficDashboard: React.FC<DashboardCommonProps> = ({
  onOpenModal,
  onAskAi,
  selectedArea,
  liveIntel,
}) => {
  const [forecastTab, setForecastTab] = useState('Next 1 Hour');
  const { traffic, location } = liveIntel;
  const shortArea = selectedArea.split(',')[0]?.trim() || selectedArea;
  const cctvImages = [
    './assets/crops/cctv-rohini.webp',
    './assets/crops/cctv-pitampura.webp',
    './assets/crops/cctv-mukarba.webp',
  ];

  return (
    <div className="space-y-4">
      <HeroBanner
        dashboardId="traffic"
        tag={
          <>
            <MapPin className="w-3.5 h-3.5 text-blue-300" />
            <span>{selectedArea}</span>
          </>
        }
        title={
          <>
            Traffic in <span className="text-[#93C5FD]">{shortArea}</span>
          </>
        }
        description={`Real-time road corridor speeds, incident alerts and route times powered by ${traffic.source}.`}
        bottomPills={[
          { icon: <span>🚗</span>, label: 'Live Traffic', active: true },
          { icon: <span>🔀</span>, label: 'Best Routes' },
          { icon: <span>🔺</span>, label: 'Traffic Alerts' },
          { icon: <span>📹</span>, label: 'Corridor Feeds' },
          { icon: <span>🚧</span>, label: 'Road Work' },
        ]}
        askAiWidget={{
          placeholder: `Ask about live traffic in ${shortArea}...`,
          chips: [
            `Best route from ${shortArea}?`,
            'Live traffic near me',
            'Road closures today?',
          ],
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
              <span className="text-[11px] text-emerald-600 font-semibold">
                ● Updated {traffic.observedAt}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  val: `${traffic.averageSpeedKmh} km/h`,
                  label: 'Avg. Speed',
                  sub: traffic.averageSpeedKmh < 25 ? 'Slow flow' : 'Normal flow',
                  subCls: traffic.averageSpeedKmh < 25 ? 'text-rose-600' : 'text-emerald-600',
                  icon: '🚗',
                },
                {
                  val: traffic.congestionLevel,
                  label: 'Traffic Condition',
                  sub: `${traffic.corridors.length} corridors live`,
                  subCls: 'text-slate-500',
                  icon: '📉',
                },
                {
                  val: String(traffic.majorJamsCount),
                  label: 'Major Jams',
                  sub: traffic.majorJamsCount > 0 ? `+${traffic.cumulativeDelayMinutes}m total delay` : 'Clear corridors',
                  subCls: traffic.majorJamsCount > 0 ? 'text-rose-600' : 'text-emerald-600',
                  icon: '🔺',
                },
                {
                  val: String(traffic.roadWorkCount),
                  label: 'Road Works / Alerts',
                  sub: `${traffic.totalIncidents} total incidents`,
                  subCls: 'text-amber-600',
                  icon: '🚧',
                },
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
              <h3 className="text-sm font-extrabold text-slate-900">Live Traffic Map ({shortArea})</h3>
              <div className="flex gap-1.5">
                {['Live Traffic', 'Incidents', 'Corridors'].map((b, i) => (
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
              coords={{ lat: location.lat, lng: location.lng }}
              centerLabel={`${shortArea}\nAvg ${traffic.averageSpeedKmh} km/h`}
              trafficStatusLabel={`${traffic.congestionLevel} Traffic (${traffic.averageSpeedKmh} km/h)`}
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

          {/* Bottom Split: Recent Traffic Alerts + Live Corridor Cameras */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-6 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-sm font-extrabold text-slate-900">Live Traffic Alerts</h3>
                <span className="text-[10px] font-semibold text-emerald-600">● {traffic.source}</span>
              </div>
              <div className="space-y-2.5">
                {traffic.incidents.slice(0, 4).map((al) => (
                  <div key={al.id} className="flex items-center justify-between gap-2 text-xs">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">{al.title}</p>
                      <p className="text-[10px] text-slate-500 truncate">{al.subtitle}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold shrink-0 ${al.badgeClass}`}>
                      {al.severity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-6 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-sm font-extrabold text-slate-900">📹 Corridor Telemetry</h3>
                <span className="text-[10px] font-semibold text-blue-600">Inspect ›</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {traffic.corridors.slice(0, 3).map((cor, idx) => {
                  const img = cctvImages[idx % cctvImages.length];
                  return (
                    <div
                      key={cor.id}
                      onClick={() =>
                        onOpenModal({
                          title: `Corridor Telemetry — ${cor.roadName}`,
                          category: 'Live Arterial Sensor',
                          badge: `${cor.speedKmh} km/h (${cor.status})`,
                          location: `${cor.roadName}, ${selectedArea}`,
                          description: `${cor.description}. Distance from your pin: ${cor.distanceKm} km. Estimated delay: ${
                            cor.delayMinutes > 0 ? `+${cor.delayMinutes} mins` : 'On time'
                          }.`,
                          primaryActionLabel: 'Ask AI for Alternate Route',
                          image: img,
                        })
                      }
                      className="cursor-pointer rounded-xl border border-slate-200/80 overflow-hidden bg-slate-50 hover:border-blue-400 transition"
                    >
                      <img src={img} alt={cor.roadName} className="w-full h-20 object-cover" />
                      <div className="p-1.5">
                        <p className="text-[11px] font-bold text-slate-900 truncate">{cor.roadName}</p>
                        <p className="text-[9px] font-bold text-emerald-600">
                          ● {cor.speedKmh} km/h ({cor.status})
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 cols */}
        <div className="xl:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-900">
                Traffic at Key Roads Near {shortArea}
              </h3>
              <span className="text-[10px] font-semibold text-emerald-600">● OSM + TomTom</span>
            </div>
            <div className="space-y-2.5">
              {traffic.corridors.map((k) => (
                <div
                  key={k.id}
                  className="flex items-center justify-between gap-2 py-1.5 border-b border-slate-100 last:border-none text-xs"
                >
                  <span className="font-bold text-slate-800 truncate">📍 {k.roadName}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${k.badgeClass}`}>{k.status}</span>
                    <span className="font-bold text-slate-700 w-14 text-right">{k.speedKmh} km/h</span>
                    <span
                      className={`font-bold w-14 text-right ${
                        k.delayMinutes > 0 ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      {k.delayMinutes > 0 ? `↑ ${k.delayMinutes} min` : 'On time'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-900">🕒 Hourly Congestion Profile</h3>
              <span className="text-[10px] font-semibold text-slate-400">{shortArea}</span>
            </div>
            <div className="flex gap-1.5 mb-3">
              {['Next 1 Hour', 'Next 6 Hours', 'Next 12 Hours'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForecastTab(t)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    forecastTab === t ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="flex items-end justify-between gap-1.5 h-24 pt-4 px-2">
              {traffic.hourlyCongestion.map((h, i) => (
                <div
                  key={`${h.hourLabel}-${i}`}
                  title={`${h.hourLabel}: ${h.loadPct}% congestion load`}
                  style={{ height: `${h.loadPct}%` }}
                  className={`flex-1 rounded-t transition-all ${
                    h.loadPct > 80 ? 'bg-rose-500' : h.loadPct > 55 ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1.5">
              {traffic.hourlyCongestion
                .filter((_, idx) => idx % 2 === 0)
                .map((h, i) => (
                  <span key={`${h.hourLabel}-${i}`} className={h.loadPct > 80 ? 'text-rose-600 font-bold' : ''}>
                    {h.hourLabel}
                  </span>
                ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-900">Live Corridor Routes</h3>
              <span className="text-[10px] font-semibold text-slate-400">From {shortArea}</span>
            </div>
            <div className="space-y-2">
              {traffic.popularRoutes.map((rt) => (
                <div key={rt.route} className="flex items-center justify-between text-xs py-1">
                  <span className="font-bold text-slate-800 truncate max-w-[210px]">🔀 {rt.route}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-extrabold text-slate-900">{rt.durationText}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${rt.badgeClass}`}>
                      {rt.delayText}
                    </span>
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
   11. ALERTS DASHBOARD (Page 22 Desktop) — 100% LIVE CAP & TELEMETRY ALERTS
   ============================================================================ */
export const AlertsDashboard: React.FC<DashboardCommonProps> = ({
  onOpenModal,
  onAskAi,
  selectedArea,
  liveIntel,
}) => {
  const [selectedCat, setSelectedCat] = useState('All Alerts');
  const { alerts, communitySignals, weather, airQuality, location, nearbyPois } = liveIntel;
  const shortArea = selectedArea.split(',')[0]?.trim() || selectedArea;

  const criticalCount = alerts.filter((a) => a.severity === 'Critical').length;
  const importantCount = alerts.filter((a) => a.severity === 'Important').length;
  const advisoryCount = alerts.filter((a) => a.severity === 'Advisory').length;
  const resolvedCount = alerts.filter((a) => a.severity === 'Resolved').length;

  const filteredAlerts =
    selectedCat === 'All Alerts'
      ? alerts
      : alerts.filter((a) => a.category.toLowerCase() === selectedCat.toLowerCase());

  const categoryCounts = (['Weather', 'Traffic', 'Air Quality', 'Safety', 'Health', 'Civic'] as const).map((cat) => {
    const count = alerts.filter((a) => a.category === cat).length;
    const pct = alerts.length > 0 ? Math.round((count / alerts.length) * 100) : 0;
    const colorMap: Record<string, string> = {
      Weather: 'bg-blue-500',
      Traffic: 'bg-rose-500',
      'Air Quality': 'bg-emerald-500',
      Safety: 'bg-amber-500',
      Health: 'bg-purple-500',
      Civic: 'bg-sky-500',
    };
    return { l: cat, v: `${count} (${pct}%)`, c: colorMap[cat] };
  });

  const nearestHospital = nearbyPois.find((p) => p.category === 'hospital');

  return (
    <div className="space-y-4">
      <HeroBanner
        dashboardId="alerts"
        tag={
          <>
            <MapPin className="w-3.5 h-3.5 text-blue-300" />
            <span>{selectedArea}</span>
          </>
        }
        title={
          <>
            Stay Alert, <span className="text-[#93C5FD]">Stay Safe</span>
          </>
        }
        description="Real-time NDMA SACHET CAP disaster alerts, traffic incidents, and environmental advisories for your location."
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
          placeholder: `Is there any alert in ${shortArea} right now?`,
          chips: ['Any weather alerts?', 'Road closures today?', 'Air quality risk?'],
          onAsk: onAskAi,
        }}
      />

      {/* Top Row: Active Alerts + Alerts by Category + Emergency Contacts */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-5 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-extrabold text-slate-900">🔔 Active Alerts ({shortArea})</h3>
            <span className="text-[11px] font-semibold text-emerald-600">● Live Feed</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { n: String(criticalCount), l: 'Critical', ch: 'Immediate', bg: 'bg-rose-50/70 border-rose-100', c: 'text-rose-600' },
              { n: String(importantCount), l: 'Important', ch: 'Active', bg: 'bg-orange-50/70 border-orange-100', c: 'text-orange-600' },
              { n: String(advisoryCount), l: 'Advisories', ch: 'Monitor', bg: 'bg-amber-50/70 border-amber-100', c: 'text-amber-600' },
              { n: String(resolvedCount), l: 'Normal / Clear', ch: 'Verified', bg: 'bg-emerald-50/70 border-emerald-100', c: 'text-emerald-600' },
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
              <span className="text-2xl font-extrabold text-slate-900 leading-none">{alerts.length}</span>
              <span className="text-[10px] text-slate-500">Live Notices</span>
            </div>
            <div className="flex-1 space-y-1 text-[11px]">
              {categoryCounts.map((cat) => (
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
            <span className="text-[10px] font-semibold text-rose-600">24x7 SOS</span>
          </div>
          <div className="space-y-1.5 text-xs">
            {[
              { name: 'National Emergency / Police', num: '112' },
              { name: 'Medical / Ambulance', num: '108' },
              { name: 'Fire & Rescue', num: '101' },
              { name: 'NDMA Disaster Helpline', num: '1078' },
              { name: 'Women Safety Helpline', num: '1091' },
            ].map((ec) => (
              <div
                key={ec.name}
                className="flex items-center justify-between py-1 border-b border-slate-100 last:border-none"
              >
                <span className="font-bold text-slate-700 truncate">{ec.name}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-extrabold text-slate-900">{ec.num}</span>
                  <button
                    type="button"
                    onClick={() =>
                      onOpenModal({
                        title: `Dial ${ec.name} (${ec.num})`,
                        category: 'Emergency Dispatch',
                        location: `${selectedArea} (${location.lat.toFixed(4)}°N, ${location.lng.toFixed(4)}°E)`,
                        description: `Initiating priority emergency call to ${ec.name} (${ec.num}) with live GPS coordinates for ${selectedArea}.${
                          nearestHospital ? ` Nearest verified hospital: ${nearestHospital.name} (${nearestHospital.distanceKm} km).` : ''
                        }`,
                        primaryActionLabel: `Call ${ec.num} Now`,
                      })
                    }
                    className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px] font-bold cursor-pointer"
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
              <h3 className="text-sm font-extrabold text-slate-900">Live Alert Map ({shortArea})</h3>
              <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[10px] font-bold">
                {alerts.length} Active
              </span>
            </div>
            <InteractiveMap
              heightClass="h-56"
              coords={{ lat: location.lat, lng: location.lng }}
              centerLabel={`${shortArea}\n${alerts.length} Active Notice(s)`}
              showSearchOverlay
              showSearchBottomButton={false}
              showLegendBar={[
                { label: 'Critical', color: 'bg-rose-500' },
                { label: 'Important', color: 'bg-orange-500' },
                { label: 'Advisory', color: 'bg-amber-400' },
                { label: 'Clear', color: 'bg-emerald-500' },
              ]}
            />
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <h3 className="text-sm font-extrabold text-slate-900 mb-2.5">🛡️ Live Safety Guidance</h3>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                {
                  t: 'Weather Precaution',
                  s: weather.outdoorActivityAdvice,
                },
                {
                  t: 'Respiratory Protection',
                  s: airQuality.healthAdvice,
                },
                {
                  t: 'Waterlogging Check',
                  s: `Current Risk Index: ${weather.waterloggingRiskIndex}/100 in ${shortArea}`,
                },
                {
                  t: 'Emergency Medical',
                  s: nearestHospital
                    ? `Nearest: ${nearestHospital.name} (${nearestHospital.distanceKm} km)`
                    : 'Dial 108 or 112 for 24x7 emergency response',
                },
              ].map((tip) => (
                <div key={tip.t} className="p-2.5 rounded-xl bg-slate-50">
                  <p className="text-xs font-extrabold text-slate-900">{tip.t}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{tip.s}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-extrabold text-slate-900">
              Live Alerts ({selectedCat})
            </h3>
            <span className="text-[10px] font-semibold text-slate-400">Click for details</span>
          </div>
          <div className="space-y-2.5">
            {filteredAlerts.map((ra) => (
              <div
                key={ra.id}
                onClick={() =>
                  onOpenModal({
                    title: ra.title,
                    category: `${ra.category} • ${ra.sender}`,
                    badge: ra.severity,
                    location: ra.areaDescription,
                    description: `${ra.description}${ra.instruction ? `\n\nRecommended Action: ${ra.instruction}` : ''}`,
                    primaryActionLabel: 'Ask AI About This Alert',
                  })
                }
                className="cursor-pointer flex items-center justify-between gap-2 py-2 px-2 rounded-xl hover:bg-slate-50 border-b border-slate-100 last:border-none text-xs transition"
              >
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 truncate">
                    {ra.icon} {ra.title}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">{ra.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[9px] text-slate-400">{ra.timeAgo}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${ra.badgeClass}`}>
                    {ra.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="xl:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <h3 className="text-sm font-extrabold text-slate-900 mb-2.5">Forecasted Conditions</h3>
            <div className="space-y-2 text-xs">
              {[
                {
                  t: weather.daily[1]
                    ? `Tomorrow: ${weather.daily[1].condition} (${weather.daily[1].maxTempC}°C)`
                    : 'Tomorrow Weather Outlook',
                  w: weather.daily[1] ? `Rain Probability: ${weather.daily[1].rainChance}%` : 'Forecast',
                  tag: (weather.daily[1]?.rainChance ?? 0) >= 40 ? 'Rain Watch' : 'Normal',
                },
                {
                  t: airQuality.dailyForecast[1]
                    ? `Tomorrow AQI: ~${airQuality.dailyForecast[1].aqi} (${airQuality.dailyForecast[1].status})`
                    : 'Tomorrow Air Quality Outlook',
                  w: 'CAMS 24h Projection',
                  tag: airQuality.dailyForecast[1]?.status || 'Projected',
                },
                {
                  t: 'Evening Peak Traffic Window',
                  w: 'Today, 5:30 PM – 8:30 PM',
                  tag: 'Commute',
                },
              ].map((u) => (
                <div key={u.t} className="flex items-center justify-between py-1">
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-slate-800 truncate">{u.t}</p>
                    <p className="text-[10px] text-slate-400">{u.w}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-[9px] font-bold shrink-0">
                    {u.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <h3 className="text-sm font-extrabold text-slate-900 mb-2.5">👥 Citizen Signals ({shortArea})</h3>
            <div className="space-y-2 text-xs">
              {communitySignals.length > 0 ? (
                communitySignals.map((cr) => (
                  <div key={cr.id} className="p-2 rounded-xl bg-slate-50">
                    <p className="font-bold text-slate-800">{cr.title}</p>
                    <p className="text-[10px] text-slate-400">
                      📍 {cr.locality} • {cr.timeAgo} • 👍 {cr.upvotes}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                  <p className="font-bold text-emerald-800">✅ No civic disruptions reported</p>
                  <p className="text-[10px] text-emerald-600 mt-0.5">
                    No citizen-reported power cuts or waterlogging in {shortArea} right now.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   12. AI ASSISTANT DASHBOARD (Page 24 Desktop) — 100% LIVE GROUNDED RAG
   ============================================================================ */
interface ChatMessage {
  role: 'ai' | 'user';
  text: string;
  keyFindings?: string[];
  recommendations?: string[];
  sources?: string[];
  confidence?: string;
}

export const AiAssistantDashboard: React.FC<DashboardCommonProps> = ({
  onNavigate,
  selectedArea,
  liveIntel,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);

  const { weather, airQuality, traffic, alerts } = liveIntel;
  const shortArea = selectedArea.split(',')[0]?.trim() || selectedArea;

  const handleSend = async (promptText?: string) => {
    const q = (promptText ?? input).trim();
    if (!q || thinking) return;
    if (!promptText) setInput('');

    setMessages((prev) => [...prev, { role: 'user', text: q }]);
    setThinking(true);
    try {
      const res = await askLiveAiAssistant(q, liveIntel);
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: res.responseText,
          keyFindings: res.keyFindings,
          recommendations: res.recommendations,
          sources: res.sources,
          confidence: res.confidence,
        },
      ]);
    } finally {
      setThinking(false);
    }
  };

  return (
    <div className="space-y-4">
      <HeroBanner
        dashboardId="ai-assistant"
        title="AI Assistant"
        subtitle="Your Smart Companion Grounded in Live Weather, CPCB AQI, Traffic & SACHET Alerts"
        bottomPills={[
          { icon: <span>⚡</span>, label: 'Live Sensor Grounded' },
          { icon: <span>📍</span>, label: shortArea },
          { icon: <span>⭐</span>, label: 'Multi-Signal Correlation' },
          { icon: <span>🕒</span>, label: `Synced ${liveIntel.lastUpdated}` },
        ]}
        rightWidget={
          <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl p-3 max-w-xs">
            <img
              src="./assets/crops/ai-robot-umbrella.webp"
              alt="MyArea24 AI Robot"
              className="w-16 h-16 rounded-xl object-contain bg-white/90 p-1 shrink-0"
            />
            <div className="bg-white text-slate-900 rounded-xl p-2.5 text-xs shadow">
              <p className="font-medium">Hi! I'm your</p>
              <p className="font-extrabold text-indigo-700">MyArea24 Saathi AI.</p>
              <p className="text-[11px] text-slate-600">
                Monitoring {shortArea} ({weather.temperatureC}°C, AQI {airQuality.aqiValue})
              </p>
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
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Chat with MyArea24 AI ({shortArea})
                  </h3>
                  <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <Radio className="w-3 h-3" /> Grounded in live Open-Meteo, CPCB, TomTom & OSM telemetry
                  </p>
                </div>
              </div>
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={() => setMessages([])}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Clear Chat
                </button>
              )}
            </div>

            {/* Greeting Box with Live Context */}
            <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200/60 mb-4">
              <p className="text-xs font-extrabold text-slate-900">
                Hello Divyansh! 👋 Live Context for <span className="text-indigo-600">{selectedArea}</span>:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-2.5">
                <div className="bg-white p-2 rounded-xl border border-slate-200/60 text-[11px]">
                  <span className="text-slate-400 block text-[9px]">LIVE WEATHER</span>
                  <span className="font-extrabold text-slate-900">
                    {weather.temperatureC}°C • {weather.conditionText}
                  </span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-200/60 text-[11px]">
                  <span className="text-slate-400 block text-[9px]">CPCB AIR QUALITY</span>
                  <span className="font-extrabold text-slate-900">
                    AQI {airQuality.aqiValue} ({airQuality.aqiCategory})
                  </span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-200/60 text-[11px]">
                  <span className="text-slate-400 block text-[9px]">TRAFFIC FLOW</span>
                  <span className="font-extrabold text-slate-900">
                    {traffic.congestionLevel} ({traffic.averageSpeedKmh} km/h)
                  </span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-200/60 text-[11px]">
                  <span className="text-slate-400 block text-[9px]">ACTIVE ALERTS</span>
                  <span className="font-extrabold text-slate-900">{alerts.length} Active Notice(s)</span>
                </div>
              </div>
              <p className="text-xs font-bold text-slate-700">Ask me anything about your area right now:</p>
            </div>

            {/* Conversation History */}
            {messages.length > 0 && (
              <div className="space-y-3 mb-4 max-h-96 overflow-y-auto pr-1">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                        m.role === 'user'
                          ? 'bg-indigo-600 text-white font-semibold'
                          : 'bg-indigo-50/80 text-slate-800 border border-indigo-100 space-y-2'
                      }`}
                    >
                      <p className="whitespace-pre-line">{m.text}</p>

                      {m.keyFindings && m.keyFindings.length > 0 && (
                        <div className="pt-2 border-t border-indigo-200/60">
                          <p className="text-[10px] font-extrabold text-indigo-900 uppercase tracking-wider mb-1">
                            Key Live Telemetry Findings
                          </p>
                          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-700">
                            {m.keyFindings.map((kf, i) => (
                              <li key={i}>{kf}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {m.recommendations && m.recommendations.length > 0 && (
                        <div className="pt-1.5">
                          <p className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider mb-1">
                            Actionable Recommendations
                          </p>
                          <div className="space-y-1">
                            {m.recommendations.map((rec, i) => (
                              <p
                                key={i}
                                className="text-[11px] bg-white/90 px-2.5 py-1 rounded-lg border border-indigo-100 text-slate-800 font-medium"
                              >
                                ✓ {rec}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {m.sources && m.sources.length > 0 && (
                        <div className="flex items-center justify-between flex-wrap gap-1 pt-1 text-[9px] text-slate-500">
                          <span className="flex items-center gap-1 font-semibold text-indigo-700">
                            <ShieldCheck className="w-3 h-3" /> {m.confidence}
                          </span>
                          <span>Sources: {m.sources.join(' • ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {thinking && (
                  <div className="flex justify-start">
                    <div className="bg-indigo-50/80 text-indigo-700 border border-indigo-100 rounded-2xl px-4 py-2.5 text-xs font-semibold flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Synthesizing live telemetry for {shortArea}...</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 6 Suggested Prompt Cards (2x3) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
              {[
                { icon: '🌤️', text: `What's the weather like right now in ${shortArea}?` },
                { icon: '🔺', text: `Any important alerts or safety risks in ${shortArea}?` },
                { icon: '🍃', text: `Show me the current CPCB air quality in ${shortArea}` },
                { icon: '🏥', text: `Find nearby hospitals and pharmacies open in ${shortArea}` },
                { icon: '🚗', text: `Are there any traffic jams on roads near ${shortArea}?` },
                { icon: '🧭', text: `Give me a complete hyperlocal summary for ${shortArea}` },
              ].map((p) => (
                <button
                  key={p.text}
                  type="button"
                  onClick={() => handleSend(p.text)}
                  className="p-3 rounded-xl border border-slate-200/80 hover:border-indigo-400 hover:bg-indigo-50/30 flex items-center gap-2.5 text-left text-xs font-semibold text-slate-700 transition cursor-pointer"
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
                placeholder={`Ask anything about ${shortArea}...`}
                className="flex-1 bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
              <Mic className="w-4 h-4 text-slate-400 cursor-pointer" />
              <button
                type="submit"
                disabled={thinking}
                className="w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white flex items-center justify-center transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-1.5 mt-2.5 text-[11px]">
              <span className="text-slate-400">Try asking:</span>
              {[
                'Weather today',
                `Traffic in ${shortArea}`,
                'Air quality & PM2.5',
                'Nearby hospitals',
                "Today's summary",
              ].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleSend(tag)}
                  className="px-2.5 py-0.5 rounded-full bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 font-medium transition cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Personalized Insights for You (100% Live) */}
          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-900">
                ✨ Live Personalized Insights for {shortArea}
              </h3>
              <span className="text-[11px] font-semibold text-emerald-600">● Real-Time</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  icon: '☀️',
                  title: `${weather.temperatureC}°C`,
                  sub: weather.conditionText,
                  desc: `Feels like ${weather.feelsLikeC}°C`,
                },
                {
                  icon: '🍃',
                  title: `AQI ${airQuality.aqiValue}`,
                  sub: airQuality.aqiCategory,
                  desc: `Prominent: ${airQuality.prominentPollutant}`,
                },
                {
                  icon: '🚗',
                  title: traffic.congestionLevel,
                  sub: `Avg ${traffic.averageSpeedKmh} km/h`,
                  desc: traffic.corridors[0]?.roadName || shortArea,
                },
                {
                  icon: '🔺',
                  title: `${alerts.length} Notice${alerts.length === 1 ? '' : 's'}`,
                  sub: alerts[0]?.severity || 'Safe',
                  desc: alerts[0]?.category || 'All clear',
                },
              ].map((ins) => (
                <div key={ins.title} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{ins.icon}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-slate-900 truncate">{ins.title}</p>
                      <p className="text-[10px] font-semibold text-slate-600 truncate">{ins.sub}</p>
                      <p className="text-[9px] text-slate-400 truncate">{ins.desc}</p>
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
                { icon: '📍', label: 'Local Businesses', nav: 'businesses' as const },
              ].map((qa) => (
                <button
                  key={qa.label}
                  type="button"
                  onClick={() => onNavigate(qa.nav)}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-100 flex flex-col items-center text-center gap-1.5 transition cursor-pointer"
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
              <span className="text-[10px] font-semibold text-indigo-600">{shortArea}</span>
            </div>
            <div className="space-y-2">
              {[
                `Will it rain today in ${shortArea}?`,
                `What is the current CPCB air quality in ${shortArea}?`,
                `Which roads have traffic jams near ${shortArea}?`,
                `Find verified hospitals & pharmacies near ${shortArea}`,
                `Is it safe to exercise outdoors right now?`,
                `Give me a complete live briefing for ${shortArea}`,
              ].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleSend(q)}
                  className="w-full py-1.5 px-2 rounded-lg hover:bg-slate-50 flex items-center justify-between text-xs text-slate-700 font-medium text-left cursor-pointer"
                >
                  <span className="truncate">{q}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <h3 className="text-sm font-extrabold text-slate-900 mb-2.5">✨ How Saathi AI Works</h3>
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              {[
                { t: 'Zero Hallucination', s: 'Every metric is pulled from live sensors' },
                { t: 'CPCB Standard', s: 'Official 2014 Indian NAQI sub-index math' },
                { t: 'Real Road Names', s: 'Queries OpenStreetMap & TomTom corridors' },
                { t: 'Change Location', s: 'Switch city or pin to test any area in India' },
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
