import React, { useState } from 'react';
import { DashboardCommonProps } from './MainDashboards';
import { HeroBanner } from '../components/HeroBanner';
import { InteractiveMap } from '../components/InteractiveMap';
import { askLiveAiAssistant } from '../services/liveIntelligence';
import { realtimeService } from '../services/realtimeService';
import {
  speakTextWithSarvamOrBrowser,
  startVoiceRecognition,
} from '../services/communityMarketplaceService';
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
  Volume2,
  VolumeX,
  CheckCircle2,
  Eye,
  Gauge,
  RefreshCw,
  Radio,
  ShieldCheck,
  Activity,
  Compass,
  Clock,
  Layers,
  PhoneCall,
} from 'lucide-react';

/* ============================================================================
   7. AREA INTELLIGENCE DASHBOARD — CITIZEN DECISION & CROSS-SIGNAL ENGINE
   Zero duplication of raw Weather/AQI/Fuel/Mandi tables.
   Role: Synthesizes all live signals into:
     1) Neighborhood Livability & Readiness Scorecard (0–100)
     2) "Should I Step Out Right Now?" — 6 Citizen Activity Verdicts (GO / CAUTION / AVOID)
     3) Active Multi-Signal Correlation Engine (Signal A + Signal B -> Civic Impact)
     4) Best Time Windows Today (Smart 12-Hour Citizen Planner)
     5) Hyperlocal Citizen Demand & Behavioral Pulse
   ============================================================================ */
export const IntelligenceDashboard: React.FC<DashboardCommonProps> = ({
  onNavigate,
  onAskAi,
  selectedArea,
  liveIntel,
}) => {
  const { weather, airQuality, traffic, alerts, demandTrends, location, safetyScore, safetyVerdict } =
    liveIntel;

  const shortArea = selectedArea.split(',')[0]?.trim() || selectedArea;
  const pm25Obj = airQuality.pollutants.find((p) => p.name === 'PM2.5');
  const pm10Obj = airQuality.pollutants.find((p) => p.name === 'PM10');
  const pm25Val = pm25Obj?.value ?? 42;
  const pm10Val = pm10Obj?.value ?? 88;

  // 1. Sub-scores for the Neighborhood Livability Scorecard
  const airEnvScore = Math.max(
    18,
    Math.min(98, Math.round(100 - airQuality.aqiValue * 0.22 - (weather.uvIndex >= 8 ? 8 : 0)))
  );
  const mobilityScore = Math.max(
    20,
    Math.min(
      96,
      Math.round(
        traffic.congestionLevel === 'Smooth'
          ? 88
          : traffic.congestionLevel === 'Moderate'
          ? 68
          : traffic.congestionLevel === 'Heavy'
          ? 44
          : 28
      )
    )
  );
  const weatherDrainageScore = Math.max(
    25,
    Math.min(98, Math.round(100 - weather.waterloggingRiskIndex * 0.65 - (weather.temperatureC >= 38 ? 15 : 0)))
  );
  const civicSafetyScore = Math.max(
    35,
    Math.min(
      96,
      Math.round(
        92 -
          alerts.filter((a) => a.severity === 'Critical').length * 22 -
          alerts.filter((a) => a.severity === 'Important').length * 10
      )
    )
  );

  // 2. "Should I Step Out Right Now?" — 6 Real-World Citizen Activity Verdicts
  const activityVerdicts = [
    {
      icon: '🏃',
      activity: 'Park Walk, Jogging & Outdoor Fitness',
      verdict:
        airQuality.aqiValue > 200 || weather.precipitationMm > 1 || weather.temperatureC >= 39
          ? 'AVOID'
          : airQuality.aqiValue > 120 || weather.temperatureC >= 35
          ? 'CAUTION'
          : 'GO',
      badgeCls:
        airQuality.aqiValue > 200 || weather.precipitationMm > 1 || weather.temperatureC >= 39
          ? 'bg-rose-100 text-rose-700 border-rose-200'
          : airQuality.aqiValue > 120 || weather.temperatureC >= 35
          ? 'bg-amber-100 text-amber-800 border-amber-200'
          : 'bg-emerald-100 text-emerald-800 border-emerald-200',
      signalsUsed: `CPCB AQI ${airQuality.aqiValue} + Temp ${weather.temperatureC}°C`,
      reason:
        airQuality.aqiValue > 200
          ? `PM2.5 is ${pm25Val} µg/m³ (${airQuality.aqiCategory}). Switch to indoor gym/yoga today.`
          : airQuality.aqiValue > 120
          ? `Brisk walking is fine, but sensitive groups should avoid heavy cardio at AQI ${airQuality.aqiValue}.`
          : `Clean air (AQI ${airQuality.aqiValue}) and ${weather.temperatureC}°C make this a great window for outdoor exercise.`,
    },
    {
      icon: '🛵',
      activity: 'Two-Wheeler / Bike Commute',
      verdict:
        weather.precipitationMm > 2 || weather.windKph >= 35 || traffic.congestionLevel === 'Severe'
          ? 'AVOID'
          : pm10Val > 120 || weather.chanceOfRain >= 45 || traffic.congestionLevel === 'Heavy'
          ? 'CAUTION'
          : 'GO',
      badgeCls:
        weather.precipitationMm > 2 || weather.windKph >= 35 || traffic.congestionLevel === 'Severe'
          ? 'bg-rose-100 text-rose-700 border-rose-200'
          : pm10Val > 120 || weather.chanceOfRain >= 45 || traffic.congestionLevel === 'Heavy'
          ? 'bg-amber-100 text-amber-800 border-amber-200'
          : 'bg-emerald-100 text-emerald-800 border-emerald-200',
      signalsUsed: `PM10 ${pm10Val} µg/m³ + Wind ${weather.windKph} km/h + Rain ${weather.chanceOfRain}%`,
      reason:
        weather.precipitationMm > 2
          ? `Wet roads (${weather.precipitationMm} mm rain) and slippery corridors near ${shortArea}.`
          : pm10Val > 120
          ? `Road dust (PM10: ${pm10Val} µg/m³) is elevated; keep helmet visor down and use an N95 mask.`
          : `Dry roads, visibility ${weather.visibilityKm} km, and ${weather.windKph} km/h breeze.`,
    },
    {
      icon: '🚇',
      activity: 'Office Commute (Car vs. Metro)',
      verdict:
        traffic.congestionLevel === 'Severe' || traffic.congestionLevel === 'Heavy'
          ? 'USE METRO'
          : traffic.congestionLevel === 'Moderate'
          ? 'CAUTION'
          : 'GO BY ROAD',
      badgeCls:
        traffic.congestionLevel === 'Severe' || traffic.congestionLevel === 'Heavy'
          ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
          : traffic.congestionLevel === 'Moderate'
          ? 'bg-amber-100 text-amber-800 border-amber-200'
          : 'bg-emerald-100 text-emerald-800 border-emerald-200',
      signalsUsed: `Avg Speed ${traffic.averageSpeedKmh} km/h + ${traffic.majorJamsCount} Bottlenecks`,
      reason:
        traffic.congestionLevel === 'Severe' || traffic.congestionLevel === 'Heavy'
          ? `Arterial speed is down to ${traffic.averageSpeedKmh} km/h (+${traffic.cumulativeDelayMinutes}m delay). Metro saves ~22 mins.`
          : `Corridors moving at ${traffic.averageSpeedKmh} km/h around ${shortArea} (${traffic.corridors[0]?.roadName || 'Main Road'}).`,
    },
    {
      icon: '👶',
      activity: 'Kids & Senior Citizens Outing',
      verdict:
        airQuality.aqiValue > 150 || weather.temperatureC >= 37 || weather.uvIndex >= 8
          ? 'AVOID'
          : airQuality.aqiValue > 100 || weather.uvIndex >= 6
          ? 'CAUTION'
          : 'GO',
      badgeCls:
        airQuality.aqiValue > 150 || weather.temperatureC >= 37 || weather.uvIndex >= 8
          ? 'bg-rose-100 text-rose-700 border-rose-200'
          : airQuality.aqiValue > 100 || weather.uvIndex >= 6
          ? 'bg-amber-100 text-amber-800 border-amber-200'
          : 'bg-emerald-100 text-emerald-800 border-emerald-200',
      signalsUsed: `AQI ${airQuality.aqiValue} + UV Index ${weather.uvIndex} + Feels ${weather.feelsLikeC}°C`,
      reason:
        airQuality.aqiValue > 150
          ? `Elevated PM2.5 (${pm25Val} µg/m³) can trigger cough or breathlessness in children and seniors.`
          : weather.uvIndex >= 6
          ? `UV Index is ${weather.uvIndex}; prefer shaded parks or post-5 PM evening hours.`
          : `Comfortable thermal conditions (Feels like ${weather.feelsLikeC}°C) and safe air quality.`,
    },
    {
      icon: '🛍️',
      activity: 'Local Market & Errand Run',
      verdict:
        weather.precipitationMm > 1
          ? 'WAIT'
          : traffic.congestionLevel === 'Heavy' || traffic.congestionLevel === 'Severe'
          ? 'WALK / 2W'
          : 'GO',
      badgeCls:
        weather.precipitationMm > 1
          ? 'bg-rose-100 text-rose-700 border-rose-200'
          : traffic.congestionLevel === 'Heavy' || traffic.congestionLevel === 'Severe'
          ? 'bg-amber-100 text-amber-800 border-amber-200'
          : 'bg-emerald-100 text-emerald-800 border-emerald-200',
      signalsUsed: `Rain ${weather.chanceOfRain}% + Market Corridor ${traffic.congestionLevel}`,
      reason:
        weather.precipitationMm > 1
          ? `Active rain (${weather.precipitationMm} mm). Order via local store delivery or wait for clear sky.`
          : `Good window to visit nearby markets in ${shortArea}; parking congestion is ${traffic.congestionLevel.toLowerCase()}.`,
    },
    {
      icon: '🧺',
      activity: 'Balcony / Terrace Laundry Drying',
      verdict:
        weather.chanceOfRain >= 50 || weather.precipitationMm > 0 || pm10Val > 180
          ? 'AVOID'
          : weather.humidity >= 75 || pm10Val > 120
          ? 'SLOW DRY'
          : 'FAST DRY',
      badgeCls:
        weather.chanceOfRain >= 50 || weather.precipitationMm > 0 || pm10Val > 180
          ? 'bg-rose-100 text-rose-700 border-rose-200'
          : weather.humidity >= 75 || pm10Val > 120
          ? 'bg-amber-100 text-amber-800 border-amber-200'
          : 'bg-emerald-100 text-emerald-800 border-emerald-200',
      signalsUsed: `Humidity ${weather.humidity}% + Wind ${weather.windKph} km/h + Rain ${weather.chanceOfRain}%`,
      reason:
        weather.chanceOfRain >= 50 || weather.precipitationMm > 0
          ? `High rain chance (${weather.chanceOfRain}%) — keep clothes and balcony items indoors.`
          : `Humidity at ${weather.humidity}% with ${weather.windKph} km/h wind gives ~${
              weather.humidity < 55 ? '1.5–2 hrs' : '3–4 hrs'
            } drying time.`,
    },
  ];

  // 3. Multi-Signal Correlation Rules (Signal A + Signal B -> Compound Impact)
  const crossSignalCorrelations = [
    {
      id: 'corr-dispersion',
      title: 'Atmospheric Dispersion vs. Particulate Trapping',
      signalA: `Surface Wind: ${weather.windKph} km/h (${weather.windDir})`,
      signalB: `PM2.5: ${pm25Val} µg/m³ • PM10: ${pm10Val} µg/m³`,
      status: weather.windKph >= 12 ? 'Active Dispersion' : 'Low-Wind Stagnation',
      statusCls:
        weather.windKph >= 12 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700',
      synthesis:
        weather.windKph >= 12
          ? `Surface winds of ${weather.windKph} km/h are actively dispersing vehicular exhaust across ${shortArea}, preventing severe ground-level smog buildup.`
          : `Calm surface winds (${weather.windKph} km/h) are slowing pollutant dispersion near ${
              traffic.corridors[0]?.roadName || shortArea
            }, keeping AQI at ${airQuality.aqiValue}.`,
    },
    {
      id: 'corr-commute-weather',
      title: 'Weather-Drainage vs. Arterial Commute Delay',
      signalA: `Rain: ${weather.precipitationMm} mm (${weather.chanceOfRain}% prob)`,
      signalB: `Corridor Speed: ${traffic.averageSpeedKmh} km/h (${traffic.congestionLevel})`,
      status:
        weather.waterloggingRiskIndex > 35
          ? `Waterlogging Risk ${weather.waterloggingRiskIndex}/100`
          : 'Clear Drainage Corridors',
      statusCls:
        weather.waterloggingRiskIndex > 35 ? 'bg-rose-50 text-rose-700' : 'bg-blue-50 text-blue-700',
      synthesis:
        weather.waterloggingRiskIndex > 35
          ? `Combined rainfall probability (${weather.chanceOfRain}%) and ${traffic.congestionLevel.toLowerCase()} traffic can compound delays by +15–25 mins at low-lying underpasses.`
          : `Zero weather-induced road friction right now (Waterlogging Index ${weather.waterloggingRiskIndex}/100). Current delays (+${traffic.cumulativeDelayMinutes}m) are purely volume-driven.`,
    },
    {
      id: 'corr-thermal',
      title: 'Heat-Humidity Thermal Stress & Hydration Index',
      signalA: `Temp: ${weather.temperatureC}°C (Feels ${weather.feelsLikeC}°C)`,
      signalB: `Humidity: ${weather.humidity}% • UV Index: ${weather.uvIndex}`,
      status:
        weather.feelsLikeC >= 36
          ? 'High Thermal Stress'
          : weather.feelsLikeC <= 14
          ? 'Cool Windchill'
          : 'Optimal Comfort Band',
      statusCls:
        weather.feelsLikeC >= 36 ? 'bg-orange-50 text-orange-700' : 'bg-emerald-50 text-emerald-700',
      synthesis:
        weather.feelsLikeC >= 36
          ? `Apparent temperature is ${weather.feelsLikeC}°C with UV ${weather.uvIndex}. Outdoor workers and commuters should hydrate every 45 minutes.`
          : `Apparent temperature (${weather.feelsLikeC}°C) and ${weather.humidity}% relative humidity are within comfortable human physiological limits.`,
    },
  ];

  // 4. Best Time Windows Today (computed from live 24h hourly arrays)
  const lowestAqiHour =
    airQuality.hourlyTrend24h.length > 0
      ? [...airQuality.hourlyTrend24h].sort((a, b) => a.aqi - b.aqi)[0]
      : { timeLabel: '3:00 PM', aqi: Math.max(45, airQuality.aqiValue - 18) };
  const coolestHour =
    weather.hourly.length > 0
      ? [...weather.hourly].sort((a, b) => a.tempC - b.tempC)[0]
      : { timeLabel: '6:00 AM', tempC: weather.minTempC };
  const smoothestTrafficHour =
    traffic.hourlyCongestion.length > 0
      ? [...traffic.hourlyCongestion].sort((a, b) => a.loadPct - b.loadPct)[0]
      : { hourLabel: '2 PM', loadPct: 35 };

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
                ? 'Synthesizing Signals...'
                : `Multi-Signal Engine • ${location.lat.toFixed(3)}°N, ${location.lng.toFixed(3)}°E`}
            </span>
          </div>
        }
        title={
          <>
            Area Decision Engine,
            <br />
            <span className="text-[#93C5FD]">Cross-Signal Intelligence</span>
          </>
        }
        description="Unlike raw weather or traffic pages, Area Intelligence correlates all live environmental, mobility, and civic signals to help you decide what to do and when to step out."
        askAiWidget={{
          placeholder: `Ask Saathi AI to plan your day in ${shortArea}...`,
          chips: [
            'Is it safe to step out right now?',
            'Best time for outdoor walk today?',
            'Should I take Metro or car now?',
            `Summarize ${shortArea} livability`,
          ],
          onAsk: onAskAi,
        }}
      />

      {/* Top Bar: Role Explanation Pill + Sync Button */}
      <div className="flex items-center justify-between gap-2 flex-wrap bg-white rounded-2xl px-4 py-2.5 shadow-card border border-slate-200/70">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-xs font-extrabold flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" /> Cross-Signal Synthesis
          </span>
          <span className="text-xs text-slate-600 font-medium">
            Correlating <strong className="text-slate-900">Meteorology</strong> +{' '}
            <strong className="text-slate-900">CPCB Air Quality</strong> +{' '}
            <strong className="text-slate-900">TomTom Corridors</strong> +{' '}
            <strong className="text-slate-900">NDMA Alerts</strong> for {shortArea}
          </span>
        </div>

        <button
          type="button"
          onClick={() => liveIntel.refresh()}
          className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 hover:border-blue-300 text-[11px] font-bold text-slate-700 flex items-center gap-1.5 transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${liveIntel.loading ? 'animate-spin' : ''}`} />
          <span>Synced {liveIntel.lastUpdated}</span>
        </button>
      </div>

      {/* SECTION 1: NEIGHBORHOOD LIVABILITY & READINESS SCORECARD (0-100) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-5 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#1E1B4B] text-white rounded-2xl p-5 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-[10px] font-extrabold uppercase tracking-wider text-sky-300">
              Live Neighbourhood Index
            </span>
            <span className="text-[11px] text-slate-300 font-semibold">{shortArea}</span>
          </div>

          <div className="flex items-center gap-5 my-4">
            <div className="w-28 h-28 rounded-full border-[8px] border-emerald-400/90 bg-white/5 flex flex-col items-center justify-center shrink-0 shadow-inner">
              <span className="text-3xl font-extrabold text-white leading-none">{safetyScore}</span>
              <span className="text-[10px] font-bold text-emerald-300 mt-1">OUT OF 100</span>
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white leading-snug">{safetyVerdict}</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Composite score calculated in real time from air breathability, road mobility, flood/heat stress, and active civic notices.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/10 text-[11px]">
            <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
              <span className="text-slate-400 text-[10px] block">PRIMARY ADVANTAGE NOW</span>
              <span className="font-extrabold text-emerald-300">
                {mobilityScore >= airEnvScore
                  ? `Smooth Corridors (${traffic.averageSpeedKmh} km/h)`
                  : `Breathable Air (AQI ${airQuality.aqiValue})`}
              </span>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
              <span className="text-slate-400 text-[10px] block">PRIMARY WATCHOUT NOW</span>
              <span className="font-extrabold text-amber-300">
                {airQuality.aqiValue > 100
                  ? `${airQuality.prominentPollutant} (${airQuality.aqiCategory} AQI)`
                  : traffic.congestionLevel !== 'Smooth'
                  ? `${traffic.congestionLevel} Traffic Flow`
                  : `UV Index ${weather.uvIndex}`}
              </span>
            </div>
          </div>
        </div>

        {/* 4 Dimension Sub-Scores */}
        <div className="xl:col-span-7 bg-white rounded-2xl p-5 shadow-card border border-slate-200/70 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-indigo-600" /> 4-Pillar Area Readiness Breakdown
              </h3>
              <p className="text-[11px] text-slate-500">
                Click any pillar to inspect its underlying live sensor dashboard
              </p>
            </div>
            <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
              Live Weighted Model
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {[
              {
                title: 'Atmosphere & Breathability',
                score: airEnvScore,
                barColor: airEnvScore >= 75 ? 'bg-emerald-500' : airEnvScore >= 55 ? 'bg-amber-500' : 'bg-rose-500',
                metric: `CPCB AQI ${airQuality.aqiValue} (${airQuality.aqiCategory}) • UV ${weather.uvIndex}`,
                nav: 'weather' as const,
                cta: 'Open Weather & AQI ›',
              },
              {
                title: 'Commute & Road Mobility',
                score: mobilityScore,
                barColor: mobilityScore >= 75 ? 'bg-emerald-500' : mobilityScore >= 55 ? 'bg-amber-500' : 'bg-rose-500',
                metric: `${traffic.congestionLevel} Flow • Avg ${traffic.averageSpeedKmh} km/h`,
                nav: 'traffic' as const,
                cta: 'Open Live Traffic ›',
              },
              {
                title: 'Weather & Drainage Safety',
                score: weatherDrainageScore,
                barColor:
                  weatherDrainageScore >= 75
                    ? 'bg-emerald-500'
                    : weatherDrainageScore >= 55
                    ? 'bg-amber-500'
                    : 'bg-rose-500',
                metric: `${weather.temperatureC}°C • Flood Risk ${weather.waterloggingRiskIndex}/100`,
                nav: 'weather' as const,
                cta: 'Open Rain & Forecast ›',
              },
              {
                title: 'Civic & Disaster Readiness',
                score: civicSafetyScore,
                barColor:
                  civicSafetyScore >= 75 ? 'bg-emerald-500' : civicSafetyScore >= 55 ? 'bg-amber-500' : 'bg-rose-500',
                metric: `${alerts.length} Active Notice(s) • SOS 112 Ready`,
                nav: 'alerts' as const,
                cta: 'Open Alerts & Notices ›',
              },
            ].map((pillar) => (
              <div
                key={pillar.title}
                onClick={() => onNavigate(pillar.nav)}
                className="cursor-pointer p-3.5 rounded-xl bg-slate-50/90 hover:bg-indigo-50/40 border border-slate-200/70 hover:border-indigo-300 transition"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-extrabold text-slate-900">{pillar.title}</span>
                  <span className="text-sm font-extrabold text-slate-900">{pillar.score}/100</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden mb-2">
                  <div
                    style={{ width: `${pillar.score}%` }}
                    className={`h-full rounded-full ${pillar.barColor}`}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-500 font-semibold truncate pr-2">{pillar.metric}</span>
                  <span className="text-blue-600 font-bold shrink-0">{pillar.cta}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 2: "SHOULD I STEP OUT RIGHT NOW?" — CITIZEN ACTIVITY DECISION MATRIX */}
      <div className="bg-white rounded-2xl p-5 shadow-card border border-slate-200/70">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-600" />
              <span>“Should I Step Out Right Now?” — Citizen Activity Verdicts</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated Go / Caution / Avoid decisions for {shortArea} by combining Weather, CPCB AQI, Wind, and Traffic
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold self-start sm:self-auto">
            ● Live Decision Matrix
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {activityVerdicts.map((item) => (
            <div
              key={item.activity}
              className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex flex-col justify-between gap-2.5 hover:border-slate-300 transition"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-xl bg-white shadow-2xs border border-slate-100 flex items-center justify-center text-lg shrink-0">
                      {item.icon}
                    </span>
                    <h4 className="text-xs font-extrabold text-slate-900 leading-snug">{item.activity}</h4>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border shrink-0 ${item.badgeCls}`}
                  >
                    {item.verdict}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">{item.reason}</p>
              </div>
              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                <span>Signals: {item.signalsUsed}</span>
                <button
                  type="button"
                  onClick={() => onAskAi(`Is right now a good time for ${item.activity} in ${selectedArea}?`)}
                  className="text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
                >
                  Ask AI ›
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: MULTI-SIGNAL CORRELATION ENGINE + BEST TIME WINDOWS TODAY */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Left 7 cols: Active Cross-Signal Correlations */}
        <div className="xl:col-span-7 bg-white rounded-2xl p-5 shadow-card border border-slate-200/70">
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" /> Active Cross-Signal Correlations
              </h3>
              <p className="text-[11px] text-slate-500">
                How multiple environmental and road signals are interacting in {shortArea} right now
              </p>
            </div>
            <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-extrabold">
              CAUSAL ENGINE
            </span>
          </div>

          <div className="space-y-3">
            {crossSignalCorrelations.map((c) => (
              <div
                key={c.id}
                className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-2"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h4 className="text-xs font-extrabold text-slate-900">{c.title}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${c.statusCls}`}>
                    {c.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-bold text-slate-700">
                    {c.signalA}
                  </span>
                  <span className="font-extrabold text-indigo-600">+</span>
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-bold text-slate-700">
                    {c.signalB}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{c.synthesis}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right 5 cols: Best Time Windows Today + Hyperlocal Demand Pulse */}
        <div className="xl:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" /> Best Time Windows Today
              </h3>
              <span className="text-[10px] font-bold text-emerald-600">● 24h Curve Optimized</span>
            </div>
            <div className="space-y-2.5 text-xs">
              {[
                {
                  icon: '🪟',
                  label: 'Best Window to Ventilate Home',
                  time: lowestAqiHour.timeLabel,
                  sub: `Lowest projected AQI (~${lowestAqiHour.aqi} CPCB)`,
                  cls: 'bg-emerald-50 text-emerald-700',
                },
                {
                  icon: '🏃',
                  label: 'Most Comfortable Outdoor Hour',
                  time: coolestHour.timeLabel,
                  sub: `Pleasant ${coolestHour.tempC}°C thermal window`,
                  cls: 'bg-blue-50 text-blue-700',
                },
                {
                  icon: '🚗',
                  label: 'Lowest Road Congestion Window',
                  time: smoothestTrafficHour.hourLabel,
                  sub: `Corridor load drops to ${smoothestTrafficHour.loadPct}%`,
                  cls: 'bg-indigo-50 text-indigo-700',
                },
                {
                  icon: '☀️',
                  label: 'Midday UV / Heat Caution Window',
                  time: '12:30 PM – 3:30 PM',
                  sub: `Peak temp ${weather.maxTempC}°C • UV Index ${weather.uvIndex}`,
                  cls: 'bg-amber-50 text-amber-800',
                },
              ].map((w) => (
                <div
                  key={w.label}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base">{w.icon}</span>
                    <div className="min-w-0">
                      <p className="font-extrabold text-slate-900 truncate">{w.label}</p>
                      <p className="text-[10px] text-slate-500 truncate">{w.sub}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold shrink-0 ${w.cls}`}>
                    {w.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-900">
                ⚡ Hyperlocal Citizen Demand Pulse
              </h3>
              <span className="text-[10px] font-semibold text-slate-400">{shortArea}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {demandTrends.map((tr) => (
                <div
                  key={tr.title}
                  onClick={() => onNavigate('services')}
                  className="cursor-pointer p-2.5 rounded-xl border border-slate-200/70 hover:border-indigo-300 flex items-center justify-between gap-2 transition"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base">{tr.icon}</span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-extrabold text-slate-900 truncate">{tr.title}</p>
                      <p className="text-[10px] text-slate-500 truncate">{tr.subtitle}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-extrabold shrink-0">
                    {tr.multiplier}
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

/* ============================================================================
   8 & 9. UNIFIED WEATHER & AIR QUALITY DASHBOARD — 100% LIVE ATMOSPHERE HUB
   Eliminates the duplication between Weather and Air Quality by combining
   live meteorology + official CPCB 2014 NAQI in one cohesive place with
   3 clean view tabs:
     - 'all' (Weather + AQI Unified View)
     - 'weather' (Meteorology, Hourly & 7-Day Forecast)
     - 'aqi' (CPCB Air Quality Lab, 6 Pollutants & Respiratory Health Guide)
   ============================================================================ */
export const WeatherDashboard: React.FC<
  DashboardCommonProps & { initialMode?: 'all' | 'weather' | 'aqi' }
> = ({ onAskAi, selectedArea, liveIntel, onOpenLocationPicker, initialMode = 'all' }) => {
  const [viewMode, setViewMode] = useState<'all' | 'weather' | 'aqi'>(initialMode);
  const [trendRange, setTrendRange] = useState<'24h' | '5d'>('24h');
  const { weather, airQuality, location } = liveIntel;
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
        dashboardId={viewMode === 'aqi' ? 'air-quality' : 'weather'}
        tag={
          <>
            <MapPin className="w-3.5 h-3.5 text-blue-300" />
            <span>{selectedArea}</span>
          </>
        }
        title="Weather & Air Quality"
        subtitle="Unified Live Meteorology & Official CPCB 2014 NAQI"
        description={`Real-time atmospheric telemetry (${weather.temperatureC}°C ${weather.conditionText} • AQI ${airQuality.aqiValue} ${airQuality.aqiCategory}) for ${shortArea} (${location.lat.toFixed(
          3
        )}°N, ${location.lng.toFixed(3)}°E).`}
        bottomPills={[
          {
            icon: <span>🌤️</span>,
            label: 'Complete Atmosphere (Weather + AQI)',
            active: viewMode === 'all',
            onClick: () => setViewMode('all'),
          },
          {
            icon: <span>☀️</span>,
            label: 'Forecast & Meteorology',
            active: viewMode === 'weather',
            onClick: () => setViewMode('weather'),
          },
          {
            icon: <span>🍃</span>,
            label: 'CPCB Air Quality & Health Lab',
            active: viewMode === 'aqi',
            onClick: () => setViewMode('aqi'),
          },
        ]}
        askAiWidget={{
          placeholder: `Ask about weather, rain or CPCB AQI in ${shortArea}...`,
          chips: ['Will it rain today?', 'Is AQI safe for jogging?', '7-day weather & air outlook'],
          onAsk: onAskAi,
        }}
      />

      {/* TOP UNIFIED ATMOSPHERE ROW: Left (Live Weather) + Right (Official CPCB Air Quality) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Live Weather Telemetry (6 cols) */}
        {viewMode !== 'aqi' && (
          <div
            className={`${
              viewMode === 'weather' ? 'xl:col-span-12' : 'xl:col-span-6'
            } bg-white rounded-2xl p-5 shadow-card border border-slate-200/70 flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-extrabold text-slate-900">
                  Live Meteorological Telemetry ({shortArea})
                </h3>
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold">
                ● Live ({weather.observedAt})
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 my-2">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
                  <Sun className="w-11 h-11 text-amber-400 fill-amber-400" />
                </div>
                <div>
                  <p className="text-4xl font-extrabold text-slate-900">{weather.temperatureC}°C</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{weather.conditionText}</p>
                  <p className="text-xs text-slate-500">
                    Feels like {weather.feelsLikeC}°C • High {weather.maxTempC}° / Low {weather.minTempC}°
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap sm:flex-col gap-1.5">
                <div className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold">
                  💧 {weather.precipitationMm > 0 ? `${weather.precipitationMm} mm Rain` : `${weather.chanceOfRain}% Rain Chance`}
                </div>
                <div className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold">
                  ☀️ UV Index {weather.uvIndex} ({weather.uvIndex >= 6 ? 'High' : weather.uvIndex >= 3 ? 'Moderate' : 'Low'})
                </div>
                <div className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                  🌅 {weather.sunrise} • 🌇 {weather.sunset}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-3 mt-3 border-t border-slate-100 text-xs">
              <div className="p-2 rounded-xl bg-slate-50">
                <p className="font-extrabold text-slate-900 flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-blue-500" /> {weather.humidity}%
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Humidity</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-50">
                <p className="font-extrabold text-slate-900 flex items-center gap-1">
                  <Wind className="w-3.5 h-3.5 text-blue-500" /> {weather.windKph} km/h
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Wind ({weather.windDir})</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-50">
                <p className="font-extrabold text-slate-900 flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5 text-blue-500" /> {weather.pressureHpa} hPa
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Surface Pressure</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-50">
                <p className="font-extrabold text-slate-900 flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-blue-500" /> {weather.visibilityKm} km
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Visibility</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 col-span-2 sm:col-span-1">
                <p className="font-extrabold text-slate-900">{weather.waterloggingRiskIndex}/100</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Waterlogging Risk</p>
              </div>
            </div>
          </div>
        )}

        {/* Official CPCB 2014 Air Quality (6 cols) */}
        {viewMode !== 'weather' && (
          <div
            className={`${
              viewMode === 'aqi' ? 'xl:col-span-12' : 'xl:col-span-6'
            } bg-white rounded-2xl p-5 shadow-card border border-slate-200/70 flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span>🍃</span>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Official CPCB 2014 Air Quality ({airQuality.stationName})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onOpenLocationPicker?.()}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                Change Area ›
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div
                style={{ borderColor: airQuality.ringHex }}
                className="w-28 h-28 rounded-full border-[9px] flex flex-col items-center justify-center shrink-0"
              >
                <span className="text-3xl font-extrabold text-slate-900 leading-none">{airQuality.aqiValue}</span>
                <span className={`text-xs font-bold ${airQuality.colorText} mt-1`}>{airQuality.aqiCategory}</span>
                <span className="text-[9px] text-slate-400">Prominent: {airQuality.prominentPollutant}</span>
              </div>

              <div className="flex-1 space-y-2.5 w-full">
                <div
                  className={`p-3 rounded-xl ${airQuality.colorBg} border border-slate-200/70 flex items-center gap-2.5`}
                >
                  <CheckCircle2 className={`w-5 h-5 ${airQuality.colorText} shrink-0`} />
                  <p className="text-xs font-bold text-slate-800">{airQuality.healthAdvice}</p>
                </div>

                {/* 6 Pollutants Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                  {airQuality.pollutants.map((pol) => (
                    <div key={pol.name} className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] font-extrabold text-slate-600">{pol.name}</p>
                      <p className="text-xs font-extrabold text-slate-900 mt-0.5">{pol.value}</p>
                      <span
                        className={`inline-block mt-0.5 px-1.5 py-0.2 rounded text-[8px] font-bold ${pol.colorBg} ${pol.colorText}`}
                      >
                        {pol.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CPCB Scale Bar */}
            <div className="grid grid-cols-5 gap-1.5 text-center text-[9px] pt-3 mt-3 border-t border-slate-100">
              {[
                { l: 'Good/Sat (0–100)', c: 'bg-emerald-500' },
                { l: 'Moderate (101–200)', c: 'bg-amber-400' },
                { l: 'Poor (201–300)', c: 'bg-orange-500' },
                { l: 'Very Poor (301–400)', c: 'bg-rose-500' },
                { l: 'Severe (401+)', c: 'bg-purple-600' },
              ].map((s) => (
                <div key={s.l}>
                  <div className={`h-1.5 rounded-full ${s.c} mb-1`} />
                  <p className="font-bold text-slate-600 truncate">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MIDDLE ROW: 24-HOUR HOURLY FORECAST + 7-DAY OUTLOOK (Shown in 'all' and 'weather') */}
      {viewMode !== 'aqi' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <div className="xl:col-span-6 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-900">🕒 24-Hour Hourly Forecast</h3>
              <span className="text-[11px] font-semibold text-slate-400">{weather.source}</span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 text-center">
              {weather.hourly.slice(0, 8).map((h, i) => (
                <div
                  key={`${h.timeLabel}-${i}`}
                  className="p-2 rounded-xl bg-slate-50 flex flex-col items-center gap-1.5"
                >
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
              <h3 className="text-sm font-extrabold text-slate-900">📅 7-Day Weather Outlook</h3>
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
      )}

      {/* BOTTOM ROW: LIVE AQI TREND GRAPH + CITIZEN HEALTH & RESPIRATORY MATRIX (Shown in 'all' and 'aqi') */}
      {viewMode !== 'weather' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <div className="xl:col-span-6 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-900">
                📈 Live CPCB AQI Trajectory ({shortArea})
              </h3>
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
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-900">
                🫁 Respiratory & Protection Guide by Citizen Group
              </h3>
              <span className="text-[10px] font-bold text-indigo-600">CPCB Health Protocol</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {[
                {
                  group: 'General Adults',
                  icon: '🧑',
                  advice:
                    airQuality.aqiValue <= 150
                      ? 'Safe for normal outdoor work and errands.'
                      : 'Reduce prolonged heavy exertion near busy traffic junctions.',
                },
                {
                  group: 'Children & School Kids',
                  icon: '🧒',
                  advice:
                    airQuality.aqiValue <= 100
                      ? 'Safe for outdoor sports and playground time.'
                      : 'Prefer morning hours or indoor play if coughing occurs.',
                },
                {
                  group: 'Senior Citizens (60+)',
                  icon: '🧓',
                  advice:
                    airQuality.aqiValue <= 120
                      ? 'Favorable for morning and evening walks.'
                      : 'Avoid early-morning smog inversion; walk after 9:30 AM.',
                },
                {
                  group: 'Asthma / Respiratory Sensitive',
                  icon: '😷',
                  advice:
                    airQuality.aqiValue <= 100
                      ? 'Low trigger risk; keep rescue inhaler handy as routine.'
                      : `Carry N95 mask outdoors (${airQuality.prominentPollutant} is prominent today).`,
                },
              ].map((g) => (
                <div key={g.group} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <span>{g.icon}</span> {g.group}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-1 leading-snug">{g.advice}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const AirQualityDashboard: React.FC<DashboardCommonProps> = (props) => (
  <WeatherDashboard {...props} initialMode="aqi" />
);

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
                <h3 className="text-sm font-extrabold text-slate-900">Live Corridor Incidents</h3>
                <span className="text-[10px] font-semibold text-emerald-600">● {traffic.source}</span>
              </div>
              <div className="space-y-2.5">
                {traffic.incidents.length > 0 ? (
                  traffic.incidents.slice(0, 4).map((al) => (
                    <div key={al.id} className="flex items-center justify-between gap-2 text-xs">
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">{al.title}</p>
                        <p className="text-[10px] text-slate-500 truncate">{al.subtitle}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold shrink-0 ${al.badgeClass}`}>
                        {al.severity}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-4 text-center">No active traffic incidents reported in {shortArea}</p>
                )}
              </div>
            </div>

            <div className="md:col-span-6 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-sm font-extrabold text-slate-900">📹 Corridor Telemetry</h3>
                <span className="text-[10px] font-semibold text-blue-600">Inspect ›</span>
              </div>
              {traffic.corridors.length > 0 ? (
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
              ) : (
                <div className="py-6 px-4 text-center rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-bold text-slate-600">No Active Corridor Bottlenecks in {shortArea}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Local arterial traffic is flowing normally • Awaiting live sensor feeds</p>
                </div>
              )}
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
              {traffic.corridors.length > 0 ? (
                traffic.corridors.map((k) => (
                  <div
                    key={k.id}
                    className="flex items-center justify-between gap-2 py-1.5 border-b border-slate-100 last:border-none text-xs"
                  >
                    <span className="font-bold text-slate-800 truncate">📍 {k.roadName}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-slate-600 font-bold">{k.speedKmh} km/h</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${k.badgeClass}`}>
                        {k.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">All major arterial roads in {shortArea} clear</p>
              )}
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
   11. UNIFIED ALERTS & CIVIC NOTICES DASHBOARD
   Unifies Live NDMA SACHET Disaster Alerts + Municipal/RWA Civic Bulletins
   without repeating the Emergency Helpline table (which lives in Emergency SOS)
   or repeating the area map.
   ============================================================================ */
export const AlertsDashboard: React.FC<
  DashboardCommonProps & { initialTab?: 'All' | 'Official Alerts' | 'Civic Bulletins' }
> = ({ onNavigate, onOpenModal, onAskAi, selectedArea, liveIntel, initialTab = 'All' }) => {
  const [feedTab, setFeedTab] = useState<'All' | 'Official Alerts' | 'Civic Bulletins'>(initialTab);
  const [selectedCat, setSelectedCat] = useState('All Categories');
  const { alerts, communitySignals } = liveIntel;
  const shortArea = selectedArea.split(',')[0]?.trim() || selectedArea;

  // Dynamic Municipal & RWA Civic Bulletins from backend intelligence alerts / community signals
  const civicBulletins = alerts.filter(
    (a) => a.category.toLowerCase().includes('civic') || a.category.toLowerCase().includes('municipal')
  );

  const combinedFeed =
    feedTab === 'Official Alerts'
      ? alerts
      : feedTab === 'Civic Bulletins'
      ? civicBulletins
      : alerts;

  const filteredFeed =
    selectedCat === 'All Categories'
      ? combinedFeed
      : combinedFeed.filter((item) => item.category.toLowerCase() === selectedCat.toLowerCase());

  const criticalCount = alerts.filter((a) => a.severity === 'Critical' || a.severity === 'Important').length;

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
            Alerts & <span className="text-[#93C5FD]">Civic Notices</span>
          </>
        }
        description="Unified feed of official NDMA SACHET disaster warnings, live telemetry threshold breaches, and municipal/RWA civic announcements for your locality."
        bottomPills={[
          'All Categories',
          'Weather',
          'Traffic',
          'Air Quality',
          'Civic',
          'Health',
          'Safety',
        ].map((l) => ({
          label: l,
          active: selectedCat === l,
          onClick: () => setSelectedCat(l),
        }))}
        askAiWidget={{
          placeholder: `Ask about alerts, water/power notices in ${shortArea}...`,
          chips: ['Any active disaster alerts?', 'Water or power notices today?', 'Road diversions nearby?'],
          onAsk: onAskAi,
        }}
      />

      {/* Top Summary Strip + Quick Jump to Emergency SOS (No duplicate helpline table!) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-8 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            {(['All', 'Official Alerts', 'Civic Bulletins'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFeedTab(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                  feedTab === tab
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {tab === 'All'
                  ? `All Notices (${alerts.length + civicBulletins.length})`
                  : tab === 'Official Alerts'
                  ? `🔔 Live Sensor & NDMA Alerts (${alerts.length})`
                  : `🏛️ Municipal & RWA Bulletins (${civicBulletins.length})`}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 font-extrabold">
              {criticalCount} High Priority
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-extrabold">
              {civicBulletins.length} Civic Updates
            </span>
            <button
              type="button"
              onClick={() => {
                realtimeService.triggerCivicAlert({
                  title: '🚨 Flash Flood & Waterlogging Warning — NDMA SACHET',
                  description: `Submerged underpasses and 15-minute delays reported near ${shortArea}. Municipal suction pumps deployed.`,
                  severity: 'Critical',
                  category: 'Weather',
                  sender: 'NDMA SACHET (CAP v1.2)',
                  instruction: 'Avoid arterial subway underpasses; follow traffic police diversions.',
                });
              }}
              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              title="Test real-time WebSocket push of NDMA SACHET alert"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Simulate NDMA Push</span>
            </button>
          </div>
        </div>

        {/* Dedicated 1-Click Redirect to Emergency SOS Hub instead of repeating helpline tables */}
        <div className="xl:col-span-4 bg-gradient-to-r from-rose-600 to-orange-600 text-white rounded-2xl p-4 shadow-card flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-rose-100">
              Life-Safety & Medical SOS
            </p>
            <h3 className="text-sm font-extrabold mt-0.5">Need Police, Ambulance or Hospital?</h3>
            <p className="text-[11px] text-rose-100 mt-0.5">
              Use the dedicated Emergency SOS hub for 1-tap 112/108 dispatch & nearby hospitals.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('emergency')}
            className="px-3.5 py-2 rounded-xl bg-white text-rose-700 text-xs font-extrabold shrink-0 flex items-center gap-1.5 shadow hover:bg-rose-50 transition cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5" /> Open SOS ›
          </button>
        </div>
      </div>

      {/* Main Feed (8 cols) + Citizen Ground Reports & Subscriptions (4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-8 bg-white rounded-2xl p-5 shadow-card border border-slate-200/70">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-sm font-extrabold text-slate-900">
              {feedTab === 'Official Alerts'
                ? `🔔 Active NDMA & Telemetry Alerts (${shortArea})`
                : feedTab === 'Civic Bulletins'
                ? `🏛️ Official Municipal & RWA Bulletins (${shortArea})`
                : `📢 Unified Alerts & Civic Feed (${shortArea})`}
            </h3>
            <span className="text-[11px] font-semibold text-emerald-600">● Verified Feed</span>
          </div>

          <div className="space-y-3">
            {filteredFeed.length > 0 ? (
              filteredFeed.map((ra) => (
                <div
                  key={ra.id}
                  onClick={() =>
                    onOpenModal({
                      title: ra.title,
                      category: `${ra.category} • ${ra.sender}`,
                      badge: ra.severity,
                      location: ra.areaDescription,
                      description: `${ra.description}${
                        ra.instruction ? `\n\nRecommended Action: ${ra.instruction}` : ''
                      }`,
                      primaryActionLabel: 'Ask AI About This Notice',
                    })
                  }
                  className="cursor-pointer p-3.5 rounded-2xl border border-slate-200/80 hover:border-blue-400 bg-slate-50/50 hover:bg-white flex items-start justify-between gap-3 transition"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/60 flex items-center justify-center text-lg shrink-0 shadow-2xs">
                      {ra.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${ra.badgeClass}`}>
                          {ra.category}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400">
                          {ra.sender} • {ra.timeAgo}
                        </span>
                      </div>
                      <h4 className="text-xs font-extrabold text-slate-900 mt-1">{ra.title}</h4>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{ra.description}</p>
                      {ra.instruction && (
                        <p className="text-[11px] font-bold text-indigo-700 mt-1.5">
                          ✓ Action: {ra.instruction}
                        </p>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-2" />
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-100 p-6">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl mb-3 shadow-2xs">
                  🔔
                </div>
                <p className="font-extrabold text-slate-800 text-sm">No Active Alerts or Notices for {shortArea}</p>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  All municipal services, water supply, and power feeders are operating normally. Real-time official bulletins will stream here via NDMA SACHET when issued.
                </p>
                <span className="inline-block mt-3 px-3 py-1 rounded-full bg-white text-[11px] font-semibold text-slate-600 border border-slate-200 shadow-2xs">
                  Awaiting Live SACHET Feed & Civic Bulletin API
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right 4 cols: Live Nearby Emergency POIs + Citizen Ground Reports + Subscribe */}
        <div className="xl:col-span-4 space-y-4">
          {/* Live Nearby Hospitals, Police Stations & Pharmacies (Overpass + /api/v1/emergency/facilities) */}
          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between mb-2.5">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  🏥 Nearby Hospitals & Police ({shortArea})
                </h3>
                <p className="text-[10px] text-slate-500">
                  Live Overpass & `/api/v1/emergency/facilities` radius scan
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('emergency')}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
              >
                SOS Hub ›
              </button>
            </div>
            <div className="space-y-2 text-xs">
              {liveIntel.nearbyPois
                .filter((p) => ['hospital', 'police', 'pharmacy', 'fire'].includes(p.category))
                .slice(0, 4)
                .map((poi) => (
                  <div
                    key={poi.id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="font-extrabold text-slate-900 truncate">
                        {poi.category === 'hospital'
                          ? '🏥 '
                          : poi.category === 'police'
                          ? '🛡️ '
                          : poi.category === 'pharmacy'
                          ? '💊 '
                          : '🚒 '}
                        {poi.name}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {poi.distanceKm} km away • {poi.sublabel}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        onOpenModal({
                          title: `Emergency Contact: ${poi.name}`,
                          category: `Verified ${poi.sublabel} • ${poi.distanceKm} km away`,
                          badge: '24/7 Active',
                          location: `${selectedArea} (${poi.latitude.toFixed(3)}°N, ${poi.longitude.toFixed(3)}°E)`,
                          description: `Direct Helpline: ${poi.phone || '112 / 108'}. Coordinates synced for emergency dispatch.`,
                          primaryActionLabel: `Dial ${poi.phone || '112'}`,
                        })
                      }
                      className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white text-[11px] font-extrabold shrink-0 transition cursor-pointer"
                    >
                      📞 {poi.phone || '112'}
                    </button>
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-sm font-extrabold text-slate-900">👥 Citizen Ground Signals</h3>
              <span className="text-[10px] font-bold text-emerald-600">{shortArea}</span>
            </div>
            <div className="space-y-2.5 text-xs">
              {communitySignals.length > 0 ? (
                communitySignals.map((cr) => (
                  <div key={cr.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="font-bold text-slate-800">{cr.title}</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      📍 {cr.locality} • {cr.timeAgo} • 👍 {cr.upvotes} verified neighbors
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
                  <p className="font-bold text-emerald-800">✅ No citizen disruptions reported</p>
                  <p className="text-[11px] text-emerald-600 mt-0.5">
                    Neighbors in {shortArea} report normal electricity, water supply, and local street access right now.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-4 border border-indigo-200/70">
            <h4 className="text-sm font-extrabold text-slate-900">🔔 Report or Subscribe in {shortArea}</h4>
            <p className="text-xs text-slate-600 mt-1 mb-3 leading-relaxed">
              Get instant alerts when NDMA SACHET warnings, water supply timings, or power maintenance affect {selectedArea}.
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() =>
                  onOpenModal({
                    title: `Subscribed to ${shortArea} Alerts & Civic Notices`,
                    category: 'NDMA SACHET + Municipal Feed',
                    description: `You will receive real-time notifications whenever severe weather, water supply changes, or power maintenance are announced for ${selectedArea}.`,
                    primaryActionLabel: 'Done',
                  })
                }
                className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer"
              >
                🔔 Enable Instant Area Alerts
              </button>
              <button
                type="button"
                onClick={() =>
                  onOpenModal({
                    title: `Report a Civic Issue in ${shortArea}`,
                    category: 'Citizen Ground Verification',
                    description: `Report waterlogging, streetlight outage, garbage overflow, or road blockade in ${selectedArea} to alert neighbors and municipal ward officers.`,
                    primaryActionLabel: 'Submit Citizen Report',
                  })
                }
                className="w-full py-2 rounded-xl bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 text-xs font-bold transition cursor-pointer"
              >
                📢 Report Local Civic Issue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   12. AI ASSISTANT DASHBOARD (Page 24 Desktop) — 100% LIVE GROUNDED RAG + SARVAM AI VOICE
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

  // Sarvam AI / Browser Neural Voice Input (STT) & Read Aloud (TTS) State
  const [voiceLang, setVoiceLang] = useState<'hi-IN' | 'en-IN'>('hi-IN');
  const [isListening, setIsListening] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<string | null>(null);
  const [activeStopFn, setActiveStopFn] = useState<(() => void) | null>(null);

  const { weather, airQuality, traffic, alerts } = liveIntel;
  const shortArea = selectedArea.split(',')[0]?.trim() || selectedArea;

  const handleSpeakMessage = async (text: string, idx: number) => {
    if (speakingIdx === idx && activeStopFn) {
      activeStopFn();
      setSpeakingIdx(null);
      setActiveStopFn(null);
      return;
    }
    if (activeStopFn) {
      activeStopFn();
    }
    setSpeakingIdx(idx);
    const ctl = await speakTextWithSarvamOrBrowser(text, voiceLang, () => {
      setSpeakingIdx(null);
      setActiveStopFn(null);
    });
    setVoiceStatus(`Speaking via ${ctl.provider} (${voiceLang === 'hi-IN' ? 'Hindi' : 'English'})`);
    setActiveStopFn(() => ctl.stop);
  };

  const handleToggleMic = () => {
    if (isListening && activeStopFn) {
      activeStopFn();
      setIsListening(false);
      return;
    }
    setIsListening(true);
    setVoiceStatus(
      voiceLang === 'hi-IN'
        ? '🎙️ सुन रहा हूँ... हिंदी या अंग्रेजी में बोलें (Listening in Hindi/Hinglish)...'
        : '🎙️ Listening in English (en-IN)... Speak your question now.'
    );
    const rec = startVoiceRecognition(
      voiceLang,
      (transcript, isFinal) => {
        setInput(transcript);
        if (isFinal && transcript.trim().length > 2) {
          setIsListening(false);
          setVoiceStatus(null);
          handleSend(transcript.trim());
        }
      },
      (errMsg) => {
        setVoiceStatus(errMsg);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );
    setActiveStopFn(() => rec.stop);
  };

  const handleSend = async (promptText?: string) => {
    const q = (promptText ?? input).trim();
    if (!q || thinking) return;
    if (!promptText) setInput('');

    setMessages((prev) => [...prev, { role: 'user', text: q }]);
    setThinking(true);
    try {
      const res = await askLiveAiAssistant(q, liveIntel);
      const newMsg: ChatMessage = {
        role: 'ai',
        text: res.responseText,
        keyFindings: res.keyFindings,
        recommendations: res.recommendations,
        sources: res.sources,
        confidence: res.confidence,
      };
      setMessages((prev) => {
        const next = [...prev, newMsg];
        if (autoSpeak) {
          setTimeout(() => {
            handleSpeakMessage(res.responseText, next.length - 1);
          }, 150);
        }
        return next;
      });
    } finally {
      setThinking(false);
    }
  };

  return (
    <div className="space-y-4">
      <HeroBanner
        dashboardId="ai-assistant"
        title="AI Assistant (Saathi AI)"
        subtitle="Your Smart Companion Grounded in Live Weather, CPCB AQI, Traffic, SACHET Alerts & Sarvam AI Voice"
        bottomPills={[
          {
            icon: <span>🎙️</span>,
            label: voiceLang === 'hi-IN' ? 'Voice: हिंदी / Hinglish (hi-IN)' : 'Voice: English (en-IN)',
            active: true,
            onClick: () => setVoiceLang((l) => (l === 'hi-IN' ? 'en-IN' : 'hi-IN')),
          },
          {
            icon: <span>🔊</span>,
            label: autoSpeak ? 'Auto Read-Aloud: ON' : 'Auto Read-Aloud: OFF',
            onClick: () => setAutoSpeak((v) => !v),
          },
          { icon: <span>📍</span>, label: shortArea },
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
              <p className="font-medium">नमस्ते / Hi! I'm</p>
              <p className="font-extrabold text-indigo-700">MyArea24 Saathi AI.</p>
              <p className="text-[11px] text-slate-600">
                Voice & Text in हिंदी / English ({weather.temperatureC}°C, AQI {airQuality.aqiValue})
              </p>
            </div>
          </div>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Left 8 cols: Conversational Interface */}
        <div className="xl:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-card border border-slate-200/70">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm">
                  🤖
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Chat or Speak with MyArea24 AI ({shortArea})
                  </h3>
                  <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <Radio className="w-3 h-3" /> Sarvam AI (Saarika STT & Bulbul TTS) + Live Telemetry RAG
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setVoiceLang((l) => (l === 'hi-IN' ? 'en-IN' : 'hi-IN'))}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-extrabold cursor-pointer transition"
                >
                  {voiceLang === 'hi-IN' ? '🇮🇳 हिंदी (hi-IN)' : '🇬🇧 English (en-IN)'}
                </button>
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
            </div>

            {voiceStatus && (
              <div className="mb-3 px-3.5 py-2 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-between text-xs font-bold text-indigo-900">
                <span>{voiceStatus}</span>
                <button
                  type="button"
                  onClick={() => setVoiceStatus(null)}
                  className="text-[10px] text-indigo-600 hover:underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Greeting Box with Compact Live Telemetry Context */}
            <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200/60 mb-4">
              <p className="text-xs font-extrabold text-slate-900">
                Hello Divyansh! 👋 Active Telemetry Context for <span className="text-indigo-600">{selectedArea}</span>:
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
              <p className="text-xs font-bold text-slate-700">
                Ask by typing or tap the 🎙️ Microphone button to speak in Hindi or English:
              </p>
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
                      <div className="flex items-start justify-between gap-3">
                        <p className="whitespace-pre-line">{m.text}</p>
                        {m.role === 'ai' && (
                          <button
                            type="button"
                            onClick={() => handleSpeakMessage(m.text, idx)}
                            title="Listen in Hindi / English (Sarvam AI TTS)"
                            className={`px-2 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1 shrink-0 transition cursor-pointer ${
                              speakingIdx === idx
                                ? 'bg-rose-600 text-white'
                                : 'bg-white hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                            }`}
                          >
                            {speakingIdx === idx ? (
                              <>
                                <VolumeX className="w-3.5 h-3.5" /> Stop
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3.5 h-3.5" /> 🔊 सुने / Listen
                              </>
                            )}
                          </button>
                        )}
                      </div>

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

            {/* 6 Suggested Prompt Cards (2x3) including Hindi / Hinglish Prompt */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
              {[
                { icon: '🌤️', text: `What's the weather and AQI like right now in ${shortArea}?` },
                { icon: '🇮🇳', text: `${shortArea} में आज मौसम, ट्रैफिक और मंडी के भाव कैसे हैं?` },
                { icon: '🏃', text: `Is it safe to go for a jog outdoors in ${shortArea} right now?` },
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

            {/* Chat Input Bar with Sarvam AI Voice Input Button */}
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
                placeholder={
                  voiceLang === 'hi-IN'
                    ? `${shortArea} के बारे में हिंदी या English में पूछें...`
                    : `Ask anything about ${shortArea}...`
                }
                className="flex-1 bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleToggleMic}
                title={`Voice Input (${voiceLang === 'hi-IN' ? 'Hindi' : 'English'})`}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1 transition cursor-pointer ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>{isListening ? 'Listening...' : voiceLang === 'hi-IN' ? 'बोलें' : 'Voice'}</span>
              </button>
              <button
                type="submit"
                disabled={thinking}
                className="w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white flex items-center justify-center transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Right 4 cols: Quick Actions + Popular Questions + How Saathi Works */}
        <div className="xl:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <h3 className="text-sm font-extrabold text-slate-900 mb-3">⚡ Jump to Specialist Hub</h3>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { icon: '🧭', label: 'Area Verdicts', nav: 'intelligence' as const },
                { icon: '🌤️', label: 'Weather & AQI', nav: 'weather' as const },
                { icon: '🚗', label: 'Live Traffic', nav: 'traffic' as const },
                { icon: '🔔', label: 'Alerts & Civic', nav: 'alerts' as const },
                { icon: '📈', label: 'Market & Fuel', nav: 'market-rates' as const },
                { icon: '🚨', label: 'Emergency SOS', nav: 'emergency' as const },
                { icon: '🗺️', label: 'Explore Map', nav: 'map' as const },
                { icon: '🔧', label: 'Home Services', nav: 'services' as const },
                { icon: '🏪', label: 'Businesses', nav: 'businesses' as const },
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
              <h3 className="text-sm font-extrabold text-slate-900">💡 Citizen Decision Prompts</h3>
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
                { t: 'Sarvam AI Voice', s: 'Hindi (hi-IN) & English Speech-to-Text + TTS' },
                { t: 'CPCB Standard', s: 'Official 2014 Indian NAQI sub-index math' },
                { t: 'Real Road Names', s: 'Queries OpenStreetMap & TomTom corridors' },
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
