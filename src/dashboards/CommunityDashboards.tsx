import React, { useState } from 'react';
import { DashboardCommonProps } from './MainDashboards';
import { HeroBanner } from '../components/HeroBanner';
import { InteractiveMap } from '../components/InteractiveMap';
import { SavedEntry } from '../types';
import {
  MapPin,
  Phone,
  AlertTriangle,
  Shield,
  Heart,
  Navigation,
  ChevronRight,
  Plus,
  Bell,
  Clock,
  MoreHorizontal,
  Fuel,
  Home as HomeIcon,
  ShoppingBag,
  RefreshCw,
} from 'lucide-react';

/* ============================================================================
   13. MAP DASHBOARD (Page 26 Desktop)
   ============================================================================ */
export const MapDashboard: React.FC<DashboardCommonProps> = ({
  onOpenModal,
  selectedArea,
  liveIntel,
}) => {
  const [selectedCat, setSelectedCat] = useState('All');
  const [layers, setLayers] = useState<Record<string, boolean>>({
    'Services & Businesses': true,
    'Emergency Services': true,
    'Active Alerts': true,
    'Traffic Conditions': true,
    'Air Quality': false,
    Weather: false,
    'CCTV Cameras': false,
    'Metro & Public Transport': true,
    'Boundaries (Wards)': false,
  });

  const toggleLayer = (name: string) => {
    setLayers((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const { location, alerts, airQuality, traffic, nearbyPois } = liveIntel;
  const shortArea = selectedArea.split(',')[0]?.trim() || selectedArea;
  const displayedServices =
    nearbyPois.length >= 3
      ? nearbyPois.slice(0, 3).map((p) => ({
          name: p.name,
          sub: `${p.distanceKm} km • ${p.category.toUpperCase()}`,
          rating: 'Verified OSM',
        }))
      : [
          { name: 'City Care Hospital', sub: `2.1 km • ${shortArea}`, rating: '4.5 (320)' },
          { name: `${shortArea} Police Station`, sub: `2.8 km • ${shortArea}`, rating: '4.2 (180)' },
          { name: 'Public Utility & Civic Center', sub: `1.5 km • ${shortArea}`, rating: '4.6 (210)' },
        ];

  return (
    <div className="space-y-4">
      <HeroBanner
        dashboardId="map"
        tag={
          <>
            <MapPin className="w-3.5 h-3.5 text-blue-300" />
            <span>{selectedArea}</span>
          </>
        }
        title={
          <>
            Explore <span className="text-[#93C5FD]">{shortArea}</span>
          </>
        }
        description="Interactive map of services, alerts, infrastructure and real-time updates — everything you need in one place."
        rightWidget={
          <div className="grid grid-cols-4 gap-2">
            {[
              { val: String(Math.max(18, nearbyPois.length)), label: 'Live POIs', icon: '🏪' },
              { val: String(alerts.length), label: 'Active Alerts', icon: '🔺' },
              { val: `AQI ${airQuality.aqiValue}`, label: airQuality.aqiCategory, icon: '🍃' },
              { val: traffic.congestionLevel, label: `${traffic.averageSpeedKmh} km/h`, icon: '🚗' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-slate-900/55 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2 text-center"
              >
                <span className="text-base">{stat.icon}</span>
                <p className="text-sm font-extrabold text-white mt-0.5">{stat.val}</p>
                <p className="text-[10px] text-blue-100/80 whitespace-nowrap">{stat.label}</p>
              </div>
            ))}
          </div>
        }
      />

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {[
          'All',
          'Hospitals',
          'Police',
          'Fire Stations',
          'Schools',
          'Roads & Traffic',
          'Public Services',
          'Markets',
          'Fuel Stations',
          'ATMs',
          'More',
        ].map((cat) => (
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

      {/* Main Content Split: Left (8 cols) + Right (4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl p-3 shadow-card border border-slate-200/70">
            <InteractiveMap
              heightClass="h-[380px]"
              coords={{ lat: location.lat, lng: location.lng }}
              showSearchOverlay
              showLiveViewBadge
              showLeftControls
              showTrafficRoutes={layers['Traffic Conditions']}
              centerLabel={shortArea}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-6 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-extrabold text-slate-900">📍 Nearby Services ({shortArea})</h3>
                <span className="text-xs font-semibold text-blue-600">OpenStreetMap ›</span>
              </div>
              <div className="space-y-2.5">
                {displayedServices.map((srv) => (
                  <div key={srv.name} className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50">
                    <div>
                      <p className="text-xs font-extrabold text-slate-900">{srv.name}</p>
                      <p className="text-[10px] text-slate-500">{srv.sub}</p>
                      <p className="text-[10px] font-bold text-amber-600">★ {srv.rating}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        onOpenModal({
                          title: srv.name,
                          subtitle: srv.sub,
                          category: 'Turn-by-Turn Navigation',
                          rating: srv.rating,
                          description: 'Fastest low-risk route calculated using MyArea24 live traffic & roadwork signals.',
                          primaryActionLabel: 'Start Navigation',
                        })
                      }
                      className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-bold flex items-center gap-1"
                    >
                      <Navigation className="w-3 h-3" /> Directions
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-6 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-extrabold text-slate-900">🔺 Active Alerts on Map</h3>
                <span className="text-xs font-semibold text-blue-600">View All ›</span>
              </div>
              <div className="space-y-2.5">
                {[
                  { t: 'Road Construction', loc: 'Outer Ring Road (Rohini)', tag: 'Critical', ago: '15 min ago', cls: 'bg-rose-50 text-rose-600' },
                  { t: 'Waterlogging Reported', loc: 'Shalimar Bagh', tag: 'Important', ago: '1 hour ago', cls: 'bg-orange-50 text-orange-600' },
                  { t: 'Traffic Congestion', loc: 'NH 44 (Azadpur)', tag: 'Advisory', ago: '2 hours ago', cls: 'bg-amber-50 text-amber-700' },
                  { t: 'Poor Air Quality', loc: 'Outer North Delhi', tag: 'Advisory', ago: '3 hours ago', cls: 'bg-amber-50 text-amber-700' },
                ].map((al) => (
                  <div key={al.t} className="flex items-center justify-between gap-2 text-xs py-1">
                    <div>
                      <p className="font-bold text-slate-900">{al.t}</p>
                      <p className="text-[10px] text-slate-500">{al.loc}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${al.cls}`}>{al.tag}</span>
                      <span className="text-[9px] text-slate-400">{al.ago}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right 4 cols: Map Layers + Live Conditions + Map Legend */}
        <div className="xl:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-900">🗂️ Map Layers</h3>
              <button
                type="button"
                onClick={() =>
                  setLayers({
                    'Services & Businesses': true,
                    'Emergency Services': true,
                    'Active Alerts': true,
                    'Traffic Conditions': true,
                    'Air Quality': false,
                    Weather: false,
                    'CCTV Cameras': false,
                    'Metro & Public Transport': true,
                    'Boundaries (Wards)': false,
                  })
                }
                className="text-xs font-semibold text-blue-600"
              >
                Reset
              </button>
            </div>
            <div className="space-y-2">
              {Object.entries(layers).map(([name, active]) => (
                <div key={name} className="flex items-center justify-between text-xs py-1">
                  <span className="font-medium text-slate-700">{name}</span>
                  <button
                    type="button"
                    onClick={() => toggleLayer(name)}
                    className={`w-9 h-5 rounded-full transition relative ${
                      active ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
                        active ? 'left-4' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-sm font-extrabold text-slate-900">Live Conditions</h3>
              <span className="text-xs font-semibold text-blue-600">View Details ›</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">🚗 Traffic</span>
                <span className="font-bold text-amber-600">Moderate</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">🍃 Air Quality</span>
                <span className="font-bold text-emerald-600">82 (Good)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-600">☀️ Weather</span>
                <span className="font-bold text-slate-900">28°C Sunny</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <h3 className="text-sm font-extrabold text-slate-900 mb-2.5">Map Legend</h3>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
              <span>🏥 Hospital</span>
              <span>🔺 Active Alert</span>
              <span>🛡️ Police Station</span>
              <span>🚧 Road Work</span>
              <span>🚒 Fire Station</span>
              <span>🚗 Traffic Congestion</span>
              <span>🏫 School/College</span>
              <span>🏧 ATM/Bank</span>
              <span>🛒 Market</span>
              <span>🏛️ Public Service</span>
              <span>⛽ Fuel Station</span>
              <span>🔵 Your Location</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   14. EMERGENCY DASHBOARD (Page 28 Desktop)
   ============================================================================ */
export const EmergencyDashboard: React.FC<DashboardCommonProps> = ({
  onOpenModal,
}) => {
  const [selectedTab, setSelectedTab] = useState('Hospitals');

  const triggerSos = (serviceName: string, number: string) => {
    onOpenModal({
      title: `Emergency Dispatch: ${serviceName} (${number})`,
      category: 'Priority Emergency SOS',
      badge: '24/7 Active',
      location: 'Live GPS Coordinates: Rohini Sector 10, Outer North Delhi',
      description: `Connecting immediately to ${serviceName} (${number}). Your live neighborhood coordinates and ward emergency contacts are ready to share.`,
      primaryActionLabel: `Dial ${number} Immediately`,
    });
  };

  return (
    <div className="space-y-4">
      <HeroBanner
        dashboardId="emergency"
        tag={<span className="text-rose-300 font-bold">⚡ Emergency Services</span>}
        title={
          <>
            Help is <span className="text-[#93C5FD]">Always Nearby</span>
          </>
        }
        description="Quick access to emergency services, nearby hospitals, police, fire stations and more — when you need it most."
        bottomPills={[
          { icon: <span>🕒</span>, label: '24/7 Emergency Support' },
          { icon: <span>📍</span>, label: 'Live Location Sharing' },
          { icon: <span>⚡</span>, label: 'Fast Response' },
          { icon: <span>🛡️</span>, label: 'Trusted Services' },
        ]}
        rightWidget={
          <div className="bg-white text-slate-900 rounded-2xl p-4 shadow-lg w-full lg:w-[270px]">
            <div className="flex items-start gap-2.5 mb-3">
              <span className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </span>
              <div>
                <p className="text-xs font-extrabold text-slate-900">In an emergency?</p>
                <p className="text-[11px] text-slate-500">Press the SOS button or call 112</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => triggerSos('National Emergency Helpline', '112')}
              className="w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow transition"
            >
              <Phone className="w-3.5 h-3.5" /> Call 112
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Left 5 cols: Quick Emergency Actions + Map + Contacts */}
        <div className="xl:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <h3 className="text-sm font-extrabold text-slate-900">⚡ Quick Emergency Actions</h3>
            <p className="text-[11px] text-slate-500 mb-3">One tap access to essential emergency services</p>
            <div className="grid grid-cols-5 gap-2">
              {[
                { title: 'Call 112', sub: 'Emergency', num: '112', bg: 'bg-rose-500 text-white', icon: '📞' },
                { title: 'Ambulance', sub: 'Request', num: '102', bg: 'bg-blue-500 text-white', icon: '🚑' },
                { title: 'Police', sub: 'Assistance', num: '100', bg: 'bg-indigo-600 text-white', icon: '🛡️' },
                { title: 'Fire', sub: 'Department', num: '101', bg: 'bg-orange-500 text-white', icon: '🚒' },
                { title: 'Share Location', sub: 'Contacts', num: 'SOS', bg: 'bg-emerald-500 text-white', icon: '📍' },
              ].map((act) => (
                <button
                  key={act.title}
                  type="button"
                  onClick={() => triggerSos(act.title, act.num)}
                  className={`${act.bg} rounded-xl p-2.5 flex flex-col items-center text-center gap-1 shadow-sm hover:opacity-95 transition`}
                >
                  <span className="text-xl">{act.icon}</span>
                  <span className="text-[11px] font-extrabold leading-tight">{act.title}</span>
                  <span className="text-[9px] opacity-85">{act.sub}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <h3 className="text-sm font-extrabold text-slate-900 mb-2.5">📍 Find Emergency Services Near You</h3>
            <InteractiveMap heightClass="h-52" showLiveViewBadge showSearchBottomButton={false} />
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-sm font-extrabold text-slate-900">Emergency Contacts</h3>
              <span className="text-xs font-semibold text-blue-600">View All</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { name: 'Police', num: '100' },
                { name: 'Ambulance', num: '102' },
                { name: 'Fire Department', num: '101' },
                { name: 'Disaster Management', num: '1078' },
              ].map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => triggerSos(c.name, c.num)}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-100 text-left transition"
                >
                  <p className="text-[10px] text-slate-500 truncate">{c.name}</p>
                  <p className="text-sm font-extrabold text-slate-900">{c.num}</p>
                  <p className="text-[10px] font-bold text-blue-600 mt-0.5">Call Now</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Middle 4 cols: Nearby Emergency Services + Tips */}
        <div className="xl:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-sm font-extrabold text-slate-900">🏥 Nearby Emergency Services</h3>
              <span className="text-xs font-semibold text-blue-600">View All ›</span>
            </div>
            <div className="flex gap-1.5 mb-3">
              {['Hospitals', 'Police', 'Fire Station', 'Ambulance'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedTab(t)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                    selectedTab === t ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="space-y-2.5">
              {[
                { name: 'City Care Hospital', sub: '2.1 km • Rohini Sec 9', rating: '4.5 (320)' },
                { name: 'Rohini Police Station', sub: '2.8 km • Rohini Sec 16', rating: '4.2 (180)' },
                { name: 'Saraswati Public Relief Center', sub: '1.5 km • Shalimar Bagh', rating: '4.6 (210)' },
                { name: 'Apex Trauma Center', sub: '3.2 km • Pitampura', rating: '4.4 (145)' },
                { name: 'Max Super Speciality Hospital', sub: '4.5 km • Shalimar Bagh', rating: '4.7 (540)' },
              ].map((h) => (
                <div key={h.name} className="p-2.5 rounded-xl bg-slate-50 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-extrabold text-slate-900">{h.name}</p>
                    <p className="text-[10px] text-slate-500">{h.sub}</p>
                    <p className="text-[10px] font-bold text-emerald-600 mt-0.5">
                      ★ {h.rating} • 24/7 Available
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => triggerSos(h.name, '108')}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold"
                  >
                    📞 Call
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <h3 className="text-sm font-extrabold text-slate-900 mb-2">💡 Emergency Help Tips</h3>
            <ol className="text-xs text-slate-600 space-y-1 list-decimal list-inside">
              <li>Keep emergency numbers saved.</li>
              <li>Share your live location when in danger.</li>
              <li>Keep a first aid kit at home and in your vehicle.</li>
              <li>Stay informed with real-time alerts.</li>
            </ol>
          </div>
        </div>

        {/* Right 3 cols: Live Emergency Alerts + SOS Card */}
        <div className="xl:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-900">🔺 Live Emergency Alerts</h3>
              <span className="text-xs font-semibold text-blue-600">View All ›</span>
            </div>
            <div className="space-y-3 text-xs">
              {[
                { t: 'Road Accident', loc: 'Outer Ring Road (Rohini)', ago: '15 min ago', tag: 'Critical', cls: 'bg-rose-50 text-rose-600' },
                { t: 'Waterlogging', loc: 'Shalimar Bagh', ago: '1 hour ago', tag: 'Important', cls: 'bg-orange-50 text-orange-600' },
                { t: 'Traffic Congestion', loc: 'NH 44 (Azadpur)', ago: '2 hours ago', tag: 'Advisory', cls: 'bg-amber-50 text-amber-700' },
                { t: 'Fire Incident', loc: 'Rohini Sector 16', ago: '3 hours ago', tag: 'Advisory', cls: 'bg-amber-50 text-amber-700' },
                { t: 'Medical Emergency', loc: 'Model Town', ago: '4 hours ago', tag: 'Resolved', cls: 'bg-emerald-50 text-emerald-700' },
              ].map((ea) => (
                <div key={ea.t} className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100 last:border-none">
                  <div>
                    <p className="font-bold text-slate-900">{ea.t}</p>
                    <p className="text-[10px] text-slate-500">{ea.loc}</p>
                    <p className="text-[9px] text-slate-400">{ea.ago}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${ea.cls}`}>{ea.tag}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-rose-50/80 rounded-2xl p-4 border border-rose-200">
            <h4 className="text-xs font-extrabold text-rose-950">🆘 Need Immediate Help?</h4>
            <p className="text-[11px] text-rose-800/80 mt-1 mb-3">
              If you are in immediate danger, press the SOS button below or call 112.
            </p>
            <button
              type="button"
              onClick={() => triggerSos('Immediate SOS Dispatch', '112')}
              className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow transition"
            >
              📞 SOS - Call 112
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   15. MARKET RATE DASHBOARD (Page 30 Desktop)
   ============================================================================ */
export const MarketRatesDashboard: React.FC<DashboardCommonProps> = ({
  selectedArea,
}) => {
  const [selectedCat, setSelectedCat] = useState('All');

  const vegRows = [
    { item: 'Tomato', icon: '🍅', unit: '1 kg', price: '42', ch: '▼ 12%', up: false },
    { item: 'Onion', icon: '🧅', unit: '1 kg', price: '28', ch: '▲ 8%', up: true },
    { item: 'Potato', icon: '🥔', unit: '1 kg', price: '24', ch: '▼ 5%', up: false },
    { item: 'Capsicum', icon: '🫑', unit: '1 kg', price: '48', ch: '▲ 6%', up: true },
    { item: 'Carrot', icon: '🥕', unit: '1 kg', price: '36', ch: '▼ 3%', up: false },
    { item: 'Cabbage', icon: '🥬', unit: '1 kg', price: '22', ch: '▼ 4%', up: false },
    { item: 'Apple', icon: '🍎', unit: '1 kg', price: '120', ch: '▲ 5%', up: true },
    { item: 'Banana', icon: '🍌', unit: '1 kg', price: '40', ch: 'No change', up: false },
  ];

  return (
    <div className="space-y-4">
      <HeroBanner
        dashboardId="market-rates"
        title="Market Rates"
        description="Stay updated with real-time prices of essential commodities, fuel, property, and more in your area."
        rightWidget={
          <div className="bg-slate-900/55 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-xs">
            <p className="font-bold text-white flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-300" /> {selectedArea}
            </p>
            <p className="text-[11px] text-blue-100/80 mt-1">Showing latest market rates for your area</p>
            <div className="mt-2 pt-2 border-t border-white/15 flex items-center justify-between text-[11px] text-blue-200">
              <span>Last updated: Today, 10:25 AM</span>
              <RefreshCw className="w-3.5 h-3.5 ml-3 cursor-pointer" />
            </div>
          </div>
        }
      />

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {[
          'All',
          'Vegetables & Fruits',
          'Groceries',
          'Dairy & Eggs',
          'Meat & Seafood',
          'Fuel',
          'LPG & Gas',
          'Property',
          'Metals',
          'Electronics',
        ].map((cat) => (
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

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Left 6 cols: Price Trends + Veg Table */}
        <div className="xl:col-span-6 space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-900">📊 Price Trends</h3>
              <div className="flex gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-semibold text-slate-700">Vegetables ⌄</span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-semibold text-slate-700">Last 7 Days ⌄</span>
              </div>
            </div>
            <div className="h-36 pt-2">
              <svg viewBox="0 0 500 110" className="w-full h-full overflow-visible">
                <path d="M0,35 Q80,42 160,30 T320,38 T500,25" fill="none" stroke="#3b82f6" strokeWidth="2.5" />
                <path d="M0,55 Q80,48 160,52 T320,44 T500,50" fill="none" stroke="#ef4444" strokeWidth="2.5" />
                <path d="M0,70 Q80,68 160,64 T320,72 T500,66" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
                <path d="M0,82 Q80,85 160,78 T320,84 T500,80" fill="none" stroke="#10b981" strokeWidth="2.5" />
              </svg>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>May 6</span>
              <span>May 7</span>
              <span>May 8</span>
              <span>May 9</span>
              <span>May 10</span>
              <span>May 11</span>
              <span>May 12</span>
            </div>
            <div className="flex items-center justify-center gap-4 mt-2 text-[11px] font-semibold text-slate-600">
              <span>🔴 Tomato</span>
              <span>🟠 Onion</span>
              <span>🟢 Potato</span>
              <span>🔵 Capsicum</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-900">🥦 Vegetables & Fruits Prices</h3>
              <span className="text-xs font-semibold text-blue-600">View All ›</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100">
                    <th className="py-2 font-semibold">Item</th>
                    <th className="py-2 font-semibold">Unit</th>
                    <th className="py-2 font-semibold">Today's Price (₹)</th>
                    <th className="py-2 font-semibold">Change (vs last week)</th>
                  </tr>
                </thead>
                <tbody>
                  {vegRows.map((r) => (
                    <tr key={r.item} className="border-b border-slate-50 last:border-none">
                      <td className="py-2 font-bold text-slate-800 flex items-center gap-2">
                        <span>{r.icon}</span> {r.item}
                      </td>
                      <td className="py-2 text-slate-500">{r.unit}</td>
                      <td className="py-2 font-extrabold text-slate-900">{r.price}</td>
                      <td className={`py-2 font-bold ${r.up ? 'text-rose-600' : 'text-emerald-600'}`}>{r.ch}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 6 cols: Today's Rate Highlights + Fuel Prices + Property Rates */}
        <div className="xl:col-span-6 space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-900">📈 Today's Rate Highlights</h3>
              <span className="text-xs font-semibold text-blue-600">View All ›</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { name: 'Tomato', val: '₹42 / kg', ch: '▼ 12%', cls: 'text-emerald-600', icon: '🍅' },
                { name: 'Onion', val: '₹28 / kg', ch: '▲ 8%', cls: 'text-rose-600', icon: '🧅' },
                { name: 'Potato', val: '₹24 / kg', ch: '▼ 5%', cls: 'text-emerald-600', icon: '🥔' },
                { name: 'Petrol', val: '₹94.72 / L', ch: '▲ 1%', cls: 'text-rose-600', icon: '⛽' },
                { name: 'Diesel', val: '₹87.62 / L', ch: '▲ 1%', cls: 'text-rose-600', icon: '🛢️' },
                { name: 'LPG (14.2 kg)', val: '₹903', ch: 'No change', cls: 'text-slate-500', icon: '🔥' },
                { name: 'Milk (Toned)', val: '₹56 / L', ch: '▲ 4%', cls: 'text-rose-600', icon: '🥛' },
                { name: 'Gold (24K)', val: '₹72,350 / 10g', ch: '▲ 2%', cls: 'text-rose-600', icon: '🪙' },
              ].map((hl) => (
                <div key={hl.name} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span>{hl.icon}</span>
                    <span className="text-xs font-bold text-slate-700 truncate">{hl.name}</span>
                  </div>
                  <p className="text-sm font-extrabold text-slate-900 mt-1">{hl.val}</p>
                  <p className={`text-[10px] font-bold mt-0.5 ${hl.cls}`}>{hl.ch} vs last week</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-sm font-extrabold text-slate-900">⛽ Fuel Prices</h3>
              <span className="text-xs font-semibold text-blue-600">View All ›</span>
            </div>
            <div className="space-y-2 text-xs">
              {[
                { f: 'Petrol', p: '94.72 / L', ch: '▲ 1%', cls: 'text-rose-600' },
                { f: 'Diesel', p: '87.62 / L', ch: '▲ 1%', cls: 'text-rose-600' },
                { f: 'CNG', p: '76.50 / kg', ch: 'No change', cls: 'text-slate-500' },
                { f: 'LPG (14.2 kg)', p: '903', ch: 'No change', cls: 'text-slate-500' },
              ].map((fp) => (
                <div key={fp.f} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-none">
                  <span className="font-bold text-slate-800">{fp.f}</span>
                  <span className="font-extrabold text-slate-900">{fp.p}</span>
                  <span className={`font-bold ${fp.cls}`}>{fp.ch}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-sm font-extrabold text-slate-900">🏠 Property Rates (Rental)</h3>
              <span className="text-xs font-semibold text-blue-600">View All ›</span>
            </div>
            <div className="space-y-2 text-xs">
              {[
                { t: '1 BHK (Apartment)', r: '12,000 / month', ch: '▲ 3%' },
                { t: '2 BHK (Apartment)', r: '18,000 / month', ch: '▲ 4%' },
                { t: '3 BHK (Apartment)', r: '26,000 / month', ch: '▲ 5%' },
                { t: 'Independent House', r: '35,000 / month', ch: '▲ 3%' },
              ].map((pr) => (
                <div key={pr.t} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-none">
                  <span className="font-bold text-slate-800">{pr.t}</span>
                  <span className="font-extrabold text-slate-900">₹{pr.r}</span>
                  <span className="font-bold text-rose-600">{pr.ch}</span>
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
   16. FUEL RATE DASHBOARD (Page 32 Desktop)
   ============================================================================ */
export const FuelRatesDashboard: React.FC<DashboardCommonProps> = ({
  onOpenModal,
}) => {
  const [alertFuel, setAlertFuel] = useState('Petrol');

  return (
    <div className="space-y-4">
      <HeroBanner
        dashboardId="fuel-rates"
        tag={<span className="text-amber-300 font-bold">⛽ Fuel Rates</span>}
        title={
          <>
            Find the Best <span className="text-[#93C5FD]">Fuel Prices</span>
          </>
        }
        description="Compare real-time petrol, diesel, CNG and LPG prices near you and save on every refill."
      />

      {/* Top 4 Fuel KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3.5">
        {[
          { name: 'Petrol', val: '₹94.72 / L', ch: '▲ 1% vs last week', cls: 'text-rose-600', icon: '⛽', bg: 'bg-rose-500' },
          { name: 'Diesel', val: '₹87.62 / L', ch: '▲ 1% vs last week', cls: 'text-rose-600', icon: '🛢️', bg: 'bg-blue-600' },
          { name: 'CNG', val: '₹76.50 / kg', ch: 'No change vs last week', cls: 'text-slate-500', icon: '🟢', bg: 'bg-emerald-600' },
          { name: 'LPG (14.2 kg)', val: '₹903', ch: 'No change vs last week', cls: 'text-slate-500', icon: '🔥', bg: 'bg-orange-500' },
        ].map((f) => (
          <div key={f.name} className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70 flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl ${f.bg} text-white flex items-center justify-center text-xl shrink-0`}>
              {f.icon}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500">{f.name}</p>
              <p className="text-xl font-extrabold text-slate-900">{f.val}</p>
              <p className={`text-[10px] font-bold mt-0.5 ${f.cls}`}>{f.ch}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Middle Row + Bottom Table */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-9 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-6 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-sm font-extrabold text-slate-900">Fuel Stations Near You</h3>
                <span className="text-xs font-semibold text-blue-600">View All ›</span>
              </div>
              <InteractiveMap
                heightClass="h-60"
                showLiveViewBadge
                showSearchBottomButton={false}
                showLegendBar={[
                  { label: 'Petrol', color: 'bg-rose-500' },
                  { label: 'Diesel', color: 'bg-blue-600' },
                  { label: 'CNG', color: 'bg-emerald-500' },
                  { label: 'LPG', color: 'bg-orange-500' },
                ]}
              />
            </div>

            <div className="lg:col-span-6 space-y-4">
              <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-extrabold text-slate-900">📈 Price Trends</h3>
                  <span className="text-xs text-slate-500">Petrol • Last 7 Days</span>
                </div>
                <div className="h-24 pt-2">
                  <svg viewBox="0 0 400 70" className="w-full h-full">
                    <path d="M0,45 L65,42 L130,35 L195,40 L260,30 L325,32 L400,26" fill="none" stroke="#ef4444" strokeWidth="3" />
                  </svg>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-extrabold text-slate-900">📊 Fuel Price Comparison</h3>
                  <span className="text-xs text-slate-500">All Fuels</span>
                </div>
                <div className="grid grid-cols-5 gap-2 text-center pt-2">
                  {['Delhi (Avg)', 'Noida', 'Gurgaon', 'Faridabad', 'Ghaziabad'].map((city) => (
                    <div key={city} className="flex flex-col items-center">
                      <div className="flex items-end gap-1 h-16">
                        <span className="w-2 bg-rose-500 h-14 rounded-t" />
                        <span className="w-2 bg-blue-600 h-12 rounded-t" />
                        <span className="w-2 bg-emerald-500 h-10 rounded-t" />
                        <span className="w-2 bg-amber-500 h-11 rounded-t" />
                      </div>
                      <span className="text-[9px] text-slate-500 mt-1 truncate w-full">{city}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Nearby Fuel Stations Table */}
          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-900">⛽ Nearby Fuel Stations</h3>
              <span className="text-xs font-semibold text-blue-600">View All ›</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100">
                    <th className="py-2">Station Name</th>
                    <th className="py-2">Distance</th>
                    <th className="py-2">Petrol (₹/L)</th>
                    <th className="py-2">Diesel (₹/L)</th>
                    <th className="py-2">CNG (₹/kg)</th>
                    <th className="py-2">Amenities</th>
                    <th className="py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Indian Oil', loc: 'Rohini Sector 9', d: '1.2 km', p: '94.72', dl: '87.62', cng: '76.50' },
                    { name: 'Bharat Petroleum', loc: 'Shalimar Bagh', d: '2.4 km', p: '94.75', dl: '87.65', cng: '76.50' },
                    { name: 'HP Petrol Pump', loc: 'Azadpur', d: '3.1 km', p: '94.68', dl: '87.55', cng: '76.00' },
                    { name: 'Reliance Fuel Station', loc: 'Model Town', d: '4.3 km', p: '94.80', dl: '87.70', cng: '76.50' },
                  ].map((st) => (
                    <tr key={st.name} className="border-b border-slate-50 last:border-none">
                      <td className="py-2.5">
                        <p className="font-extrabold text-slate-900">{st.name}</p>
                        <p className="text-[10px] text-slate-400">{st.loc}</p>
                      </td>
                      <td className="py-2.5 font-semibold text-slate-600">{st.d}</td>
                      <td className="py-2.5 font-extrabold text-slate-900">{st.p}</td>
                      <td className="py-2.5 font-extrabold text-slate-900">{st.dl}</td>
                      <td className="py-2.5 font-extrabold text-slate-900">{st.cng}</td>
                      <td className="py-2.5 text-slate-500">🚻 💨 💳</td>
                      <td className="py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            onOpenModal({
                              title: `${st.name} — ${st.loc}`,
                              category: 'Fuel Station Navigation',
                              price: `Petrol ₹${st.p}/L • Diesel ₹${st.dl}/L • CNG ₹${st.cng}/kg`,
                              location: `${st.d} away`,
                              description: '24/7 fuel station with free air check, digital UPI/card payments, and clean restroom facilities.',
                              primaryActionLabel: 'Start Route Navigation',
                            })
                          }
                          className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 font-bold"
                        >
                          🧭 Directions
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 3 cols */}
        <div className="xl:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <h3 className="text-sm font-extrabold text-slate-900 mb-3">⚡ Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2.5 text-center">
              {[
                { icon: '📍', label: 'Find Nearest Fuel Station' },
                { icon: '🧭', label: 'Get Directions' },
                { icon: '📊', label: 'Compare Prices' },
                { icon: '❤️', label: 'Save to Favorites' },
              ].map((qa) => (
                <button
                  key={qa.label}
                  type="button"
                  className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 text-[11px] font-bold text-slate-700 flex flex-col items-center gap-1.5"
                >
                  <span className="text-xl">{qa.icon}</span>
                  <span>{qa.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <h3 className="text-sm font-extrabold text-slate-900">🔔 Price Alerts</h3>
            <p className="text-[11px] text-slate-500 mt-1 mb-3">
              Get notified when fuel prices change in your area.
            </p>
            <select
              value={alertFuel}
              onChange={(e) => setAlertFuel(e.target.value)}
              className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold mb-2.5"
            >
              <option>Petrol</option>
              <option>Diesel</option>
              <option>CNG</option>
              <option>LPG (14.2 kg)</option>
            </select>
            <button
              type="button"
              onClick={() =>
                onOpenModal({
                  title: `Fuel Price Alert Active (${alertFuel})`,
                  category: 'Daily 6 AM Price Revision Alert',
                  description: `You will receive an instant notification whenever ${alertFuel} rates change in Outer North Delhi.`,
                  primaryActionLabel: 'Done',
                })
              }
              className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition"
            >
              🔔 Set Alert
            </button>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <h3 className="text-sm font-extrabold text-slate-900 mb-2.5">💡 Tips & Insights</h3>
            <ul className="text-[11px] text-slate-600 space-y-2">
              <li>• Fuel prices are revised daily at 6 AM based on global crude oil rates.</li>
              <li>• Use CNG for lower running costs and a cleaner environment.</li>
              <li>• Compare nearby stations to find the best prices in your area.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   17. BULLETINS DASHBOARD (Page 34 Desktop)
   ============================================================================ */
export const BulletinsDashboard: React.FC<DashboardCommonProps> = ({
  onOpenModal,
}) => {
  const [selectedCat, setSelectedCat] = useState('All Bulletins');

  const bulletins = [
    {
      cat: 'Safety Alert',
      catCls: 'text-rose-600',
      title: 'Heatwave Advisory Issued for Delhi',
      desc: 'IMD has issued a heatwave warning for the next 3 days. Avoid outdoor activities between 12 PM – 4 PM.',
      ago: '1 hour ago',
      badge: 'High Priority',
      badgeCls: 'bg-rose-50 text-rose-600',
      icon: '🔺',
    },
    {
      cat: 'Government Update',
      catCls: 'text-indigo-600',
      title: 'New Water Supply Schedule in Rohini',
      desc: 'Due to maintenance work, water supply in select sectors of Rohini will be affected on May 15.',
      ago: '3 hours ago',
      badge: 'Official',
      badgeCls: 'bg-blue-50 text-blue-600',
      icon: '🏛️',
    },
    {
      cat: 'Traffic Update',
      catCls: 'text-amber-600',
      title: 'Diversion on NH-44 (Azadpur)',
      desc: 'Partial diversion due to repair work. Expect delays of 30–45 minutes.',
      ago: '5 hours ago',
      badge: 'Important',
      badgeCls: 'bg-amber-50 text-amber-700',
      icon: '🚗',
    },
    {
      cat: 'Civic Notice',
      catCls: 'text-emerald-600',
      title: 'Special Cleanliness Drive This Weekend',
      desc: 'MCD will conduct a cleanliness drive across wards in Outer North Delhi. Public participation requested.',
      ago: '1 day ago',
      badge: 'General',
      badgeCls: 'bg-emerald-50 text-emerald-700',
      icon: '📢',
    },
    {
      cat: 'Health Advisory',
      catCls: 'text-rose-500',
      title: 'Increase in Viral Fever Cases',
      desc: 'Health department advises precautionary measures and early consultation for symptoms.',
      ago: '1 day ago',
      badge: 'Advisory',
      badgeCls: 'bg-orange-50 text-orange-600',
      icon: '❤️',
    },
    {
      cat: 'Environment Update',
      catCls: 'text-emerald-600',
      title: "Air Quality Improves to 'Moderate'",
      desc: 'AQI in Outer North Delhi recorded at 98 today, a significant improvement from last week.',
      ago: '2 days ago',
      badge: 'Positive',
      badgeCls: 'bg-emerald-50 text-emerald-700',
      icon: '🌱',
    },
    {
      cat: 'Upcoming Event',
      catCls: 'text-blue-600',
      title: 'Free Health Check-up Camp',
      desc: 'Organized by North Delhi Municipal Corporation at Rohini Sector 16 Community Center.',
      ago: '2 days ago',
      badge: 'Event',
      badgeCls: 'bg-blue-50 text-blue-600',
      icon: '📅',
    },
    {
      cat: 'Utility Update',
      catCls: 'text-amber-600',
      title: 'Scheduled Power Maintenance',
      desc: 'Power supply will be interrupted in parts of Shalimar Bagh on May 18 from 10 AM to 2 PM.',
      ago: '3 days ago',
      badge: 'Scheduled',
      badgeCls: 'bg-purple-50 text-purple-700',
      icon: '⚡',
    },
  ];

  return (
    <div className="space-y-4">
      <HeroBanner
        dashboardId="bulletins"
        title={
          <>
            Community <span className="text-[#93C5FD]">Bulletins</span>
          </>
        }
        description="Stay informed with the latest announcements, advisories, and updates from your area."
      />

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {[
          'All Bulletins',
          'Government',
          'Civic Updates',
          'Safety Alerts',
          'Traffic & Transport',
          'Utilities',
          'Events',
          'Health',
          'Environment',
        ].map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setSelectedCat(c)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition ${
              selectedCat === c
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Left 8 cols */}
        <div className="xl:col-span-8 bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-extrabold text-slate-900">📰 Latest Bulletins</h3>
            <div className="flex gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-semibold text-slate-700">All Categories ⌄</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-semibold text-slate-700">Latest First ⌄</span>
            </div>
          </div>

          <div className="space-y-2.5">
            {bulletins.map((b) => (
              <div
                key={b.title}
                onClick={() =>
                  onOpenModal({
                    title: b.title,
                    subtitle: `${b.cat} • ${b.ago}`,
                    category: 'Official Civic & Community Bulletin',
                    badge: b.badge,
                    description: `${b.desc} Verified by MyArea24 Civic Signal Filter for Outer North Delhi residents.`,
                    primaryActionLabel: 'Share Notice with Neighbors',
                  })
                }
                className="cursor-pointer p-3 rounded-xl border border-slate-200/70 hover:border-indigo-300 flex items-center justify-between gap-3 transition"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-lg shrink-0">
                    {b.icon}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-[10px] font-bold ${b.catCls}`}>{b.cat}</p>
                    <h4 className="text-xs font-extrabold text-slate-900 truncate">{b.title}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{b.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 mb-1">{b.ago}</p>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${b.badgeCls}`}>{b.badge}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 4 cols */}
        <div className="xl:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-900">🔺 Important Alerts</h3>
              <span className="text-xs font-semibold text-blue-600">View All ›</span>
            </div>
            <div className="space-y-2.5 text-xs">
              {[
                { t: 'Heatwave Warning', s: 'Extreme heat conditions expected May 12 – May 15.', cls: 'bg-rose-50/70 border-rose-100' },
                { t: 'Traffic Diversion', s: 'NH-44 (Azadpur) — repair work ongoing. Expect delays.', cls: 'bg-amber-50/70 border-amber-100' },
                { t: 'Water Supply Notice', s: 'Supply disruption in Rohini on May 15.', cls: 'bg-blue-50/70 border-blue-100' },
              ].map((ia) => (
                <div key={ia.t} className={`p-3 rounded-xl border ${ia.cls}`}>
                  <p className="font-extrabold text-slate-900">{ia.t}</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">{ia.s}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-900">📅 Upcoming Events</h3>
              <span className="text-xs font-semibold text-blue-600">View All ›</span>
            </div>
            <div className="space-y-2.5 text-xs">
              {[
                { m: 'MAY', d: '14', t: 'Free Health Check-up Camp', loc: 'Rohini Sector 16 Community Center', tm: '10:00 AM – 2:00 PM' },
                { m: 'MAY', d: '18', t: 'Tree Plantation Drive', loc: 'Japanese Park, Rohini', tm: '8:00 AM – 11:00 AM' },
                { m: 'MAY', d: '21', t: 'Resident Welfare Meeting', loc: 'Rohini Sector 9 RWA Hall', tm: '6:00 PM – 7:30 PM' },
              ].map((ev) => (
                <div key={ev.t} className="flex items-center gap-3 p-2 rounded-xl bg-slate-50">
                  <div className="w-10 text-center bg-white rounded-lg py-1 border border-slate-200/60 shrink-0">
                    <p className="text-[9px] font-bold text-indigo-600">{ev.m}</p>
                    <p className="text-sm font-extrabold text-slate-900 leading-none">{ev.d}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="font-extrabold text-slate-900 truncate">{ev.t}</p>
                    <p className="text-[10px] text-slate-500 truncate">{ev.loc}</p>
                    <p className="text-[10px] text-slate-400">{ev.tm}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-4 border border-indigo-200/70">
            <h4 className="text-sm font-extrabold text-slate-900">🔔 Subscribe to Bulletins</h4>
            <p className="text-xs text-slate-600 mt-1 mb-3">
              Get instant notifications for important updates in your area.
            </p>
            <button
              type="button"
              onClick={() =>
                onOpenModal({
                  title: 'Subscribed to Rohini Civic Bulletins!',
                  category: 'Verified Municipal & RWA Feed',
                  description: 'You will receive plain-English AI summaries whenever official water, electricity, or road notices affect your sector.',
                  primaryActionLabel: 'Done',
                })
              }
              className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition"
            >
              🔔 Enable Notifications
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   18. SAVED DASHBOARD (Page 36 Desktop)
   ============================================================================ */
export const SavedDashboard: React.FC<
  DashboardCommonProps & { savedEntries: SavedEntry[] }
> = ({ savedEntries, onToggleSave, onOpenModal }) => {
  const [selectedCat, setSelectedCat] = useState('All Saved');

  const fuelSaved = savedEntries.filter((e) => e.category === 'Fuel Stations');
  const propSaved = savedEntries.filter((e) => e.category === 'Properties');

  return (
    <div className="space-y-4">
      <HeroBanner
        dashboardId="saved"
        title={
          <span className="flex items-center gap-2.5">
            <Heart className="w-7 h-7 text-rose-500 fill-rose-500" />
            <span>Saved</span>
          </span>
        }
        subtitle="Your favorites in one place"
        description="Quickly access your saved fuel stations, properties, market items, alerts, and more."
        rightWidget={
          <button
            type="button"
            onClick={() =>
              onOpenModal({
                title: 'Add Custom Bookmark to Saved',
                category: 'Personal Area Favorites',
                description: 'Bookmark any fuel station, property listing, market commodity, or business across Outer North Delhi.',
                primaryActionLabel: 'Save New Bookmark',
              })
            }
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" /> Add New
          </button>
        }
      />

      {/* Category Filter Pills with Counts */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {[
          { label: 'All Saved', count: savedEntries.length + 18 },
          { label: 'Fuel Stations', count: fuelSaved.length + 3 },
          { label: 'Properties', count: propSaved.length + 5 },
          { label: 'Market Items', count: 5 },
          { label: 'Alerts', count: 3 },
          { label: 'Businesses', count: 2 },
        ].map((tab) => (
          <button
            key={tab.label}
            type="button"
            onClick={() => setSelectedCat(tab.label)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 border whitespace-nowrap transition ${
              selectedCat === tab.label
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                selectedCat === tab.label ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Left 8 cols: Saved Fuel Stations + Saved Properties */}
        <div className="xl:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-900">⛽ Saved Fuel Stations</h3>
              <span className="text-xs font-semibold text-blue-600">View All ›</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {fuelSaved.map((st) => (
                <div key={st.id} className="rounded-xl border border-slate-200/80 overflow-hidden bg-white">
                  <div className="relative h-28">
                    <img src={st.image} alt={st.title} className="w-full h-full object-cover" />
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-white/95 text-slate-800 text-[10px] font-bold shadow">
                      📍 {st.meta}
                    </span>
                    <button
                      type="button"
                      onClick={() => onToggleSave(st)}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 text-rose-500 flex items-center justify-center shadow"
                    >
                      <Heart className="w-3.5 h-3.5 fill-rose-500" />
                    </button>
                  </div>
                  <div className="p-3">
                    <h4 className="text-xs font-extrabold text-slate-900">{st.title}</h4>
                    <p className="text-[10px] text-slate-500">{st.subtitle}</p>
                    <div className="grid grid-cols-2 gap-2 my-2 pt-2 border-t border-slate-100 text-xs">
                      <div>
                        <p className="text-[10px] text-slate-400">Petrol</p>
                        <p className="font-extrabold text-slate-900">{st.priceOrStatus}</p>
                        <p className="text-[9px] text-rose-600 font-bold">{st.changeText}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400">Diesel</p>
                        <p className="font-extrabold text-slate-900">{st.secondaryPrice}</p>
                        <p className="text-[9px] text-rose-600 font-bold">{st.changeText}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() =>
                          onOpenModal({
                            title: st.title,
                            subtitle: st.subtitle,
                            category: 'Saved Fuel Station',
                            price: `Petrol ${st.priceOrStatus} • Diesel ${st.secondaryPrice}`,
                            description: 'Navigate to your saved fuel station with live price lock and queue status.',
                            primaryActionLabel: 'Start Directions',
                            image: st.image,
                          })
                        }
                        className="text-xs font-bold text-blue-600 flex items-center gap-1"
                      >
                        <Navigation className="w-3 h-3" /> Get Directions
                      </button>
                      <MoreHorizontal className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-900">🏠 Saved Properties</h3>
              <span className="text-xs font-semibold text-blue-600">View All ›</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {propSaved.map((pr) => (
                <div key={pr.id} className="rounded-xl border border-slate-200/80 overflow-hidden bg-white">
                  <div className="relative h-28">
                    <img src={pr.image} alt={pr.title} className="w-full h-full object-cover" />
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-white/95 text-slate-800 text-[10px] font-bold shadow">
                      {pr.badge}
                    </span>
                    <button
                      type="button"
                      onClick={() => onToggleSave(pr)}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 text-rose-500 flex items-center justify-center shadow"
                    >
                      <Heart className="w-3.5 h-3.5 fill-rose-500" />
                    </button>
                  </div>
                  <div className="p-3">
                    <h4 className="text-sm font-extrabold text-blue-700">{pr.title}</h4>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">{pr.subtitle.split('•')[0]}</p>
                    <p className="text-[10px] text-slate-500">{pr.subtitle.split('•')[1]}</p>
                    <p className="text-[10px] text-slate-500 mt-2 pt-2 border-t border-slate-100">{pr.meta}</p>
                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() =>
                          onOpenModal({
                            title: `${pr.subtitle} (${pr.title})`,
                            category: 'Saved Property Listing',
                            badge: pr.badge,
                            description: `${pr.meta}. Verified owner listing in Outer North Delhi with zero brokerage option.`,
                            primaryActionLabel: 'Contact Property Owner',
                            image: pr.image,
                          })
                        }
                        className="text-xs font-bold text-blue-600"
                      >
                        View Details ›
                      </button>
                      <MoreHorizontal className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 4 cols: Saved Insights + Recent Activity */}
        <div className="xl:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <h3 className="text-sm font-extrabold text-slate-900 mb-3">📊 Saved Insights</h3>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { n: '6', l: 'Fuel Stations', s: 'Saved for quick access', icon: '⛽' },
                { n: '8', l: 'Properties', s: 'Rental & sale listings', icon: '🏠' },
                { n: '5', l: 'Market Items', s: 'Track price changes', icon: '🛒' },
                { n: '3', l: 'Alerts', s: 'Stay informed', icon: '🔔' },
              ].map((si) => (
                <div key={si.l} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{si.icon}</span>
                    <span className="text-lg font-extrabold text-slate-900">{si.n}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 mt-1.5">{si.l}</p>
                  <p className="text-[10px] text-slate-400">{si.s}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/70">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-900">🕒 Recent Activity</h3>
              <span className="text-xs font-semibold text-blue-600">View All ›</span>
            </div>
            <div className="space-y-2.5 text-xs">
              {[
                { t: 'Saved Indian Oil (Rohini Sector 9)', ago: '2 hours ago', icon: '⛽' },
                { t: 'Saved 2 BHK Apartment (Shalimar Bagh)', ago: '5 hours ago', icon: '🏠' },
                { t: 'Saved Tomato (Market Rates)', ago: '1 day ago', icon: '🍅' },
                { t: 'Saved Heatwave Alert', ago: '2 days ago', icon: '🔔' },
                { t: 'Saved Reliance Fresh (Rohini)', ago: '3 days ago', icon: '🏪' },
              ].map((ac) => (
                <div key={ac.t} className="flex items-center justify-between gap-2 py-1.5 border-b border-slate-100 last:border-none">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base">{ac.icon}</span>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 truncate">{ac.t}</p>
                      <p className="text-[10px] text-slate-400">{ac.ago}</p>
                    </div>
                  </div>
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
