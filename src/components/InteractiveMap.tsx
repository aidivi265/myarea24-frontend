import React, { useState } from 'react';
import {
  Plus,
  Minus,
  LocateFixed,
  Search,
  ArrowRight,
  Radio,
  Utensils,
  ShoppingBag,
  Hospital,
  Shield,
  Flame,
  GraduationCap,
  Trees,
  Fuel,
  AlertTriangle,
  Car,
  Dumbbell,
  Scissors,
  Wrench,
  Layers,
  MapPin,
} from 'lucide-react';

export interface MapPinItem {
  id: string;
  x: number; // percentage 0..100
  y: number; // percentage 0..100
  label: string;
  sublabel?: string;
  color: 'orange' | 'blue' | 'green' | 'red' | 'purple' | 'amber' | 'indigo' | 'pink';
  icon?: 'food' | 'shop' | 'hospital' | 'police' | 'fire' | 'school' | 'park' | 'fuel' | 'alert' | 'car' | 'gym' | 'salon' | 'service';
  callout?: boolean;
}

interface InteractiveMapProps {
  title?: string;
  centerLabel?: string;
  coords?: { lat: number; lng: number };
  heightClass?: string;
  showSearchOverlay?: boolean;
  showSearchBottomButton?: boolean;
  showTopFilterPills?: string[];
  showLiveViewBadge?: boolean;
  showLeftControls?: boolean;
  showLegendBar?: { label: string; color: string }[];
  showTrafficRoutes?: boolean;
  trafficStatusLabel?: { title: string; speed: string };
  pins?: MapPinItem[];
  onPinClick?: (pin: MapPinItem) => void;
}

const DEFAULT_PINS: MapPinItem[] = [
  { id: 'p1', x: 35, y: 60, label: 'Local Café & Dining', sublabel: '⭐ 4.5 • 800m', color: 'orange', icon: 'food' },
  { id: 'p2', x: 58, y: 68, label: 'Central Sector Market', sublabel: 'Shopping Hub', color: 'blue', icon: 'shop' },
  { id: 'p3', x: 66, y: 38, label: '24/7 Emergency Hospital', sublabel: 'Verified Trauma Care', color: 'green', icon: 'hospital' },
  { id: 'p4', x: 75, y: 50, label: 'Super Speciality Clinic', sublabel: '1.4 km away', color: 'purple', icon: 'hospital' },
  { id: 'p5', x: 62, y: 57, label: 'District Green Park', sublabel: 'Walking Track', color: 'green', icon: 'park' },
  { id: 'p6', x: 42, y: 42, label: 'Neighborhood Super Mart', sublabel: 'Open Now', color: 'indigo', icon: 'shop' },
];

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  centerLabel = 'Rohini\nSector 10',
  coords = { lat: 28.7196, lng: 77.1186 },
  heightClass = 'h-64',
  showSearchOverlay = false,
  showSearchBottomButton = true,
  showTopFilterPills,
  showLiveViewBadge = false,
  showLeftControls = false,
  showLegendBar,
  showTrafficRoutes = false,
  trafficStatusLabel,
  pins = DEFAULT_PINS,
  onPinClick,
}) => {
  const [zoom, setZoom] = useState(1);
  const [selectedPin, setSelectedPin] = useState<MapPinItem | null>(null);
  const [activeFilter, setActiveFilter] = useState(showTopFilterPills?.[0] || 'All');
  const [searchQuery, setSearchQuery] = useState('');
  const [useOsmLayer, setUseOsmLayer] = useState(true);

  const lat = coords?.lat ?? 28.7196;
  const lng = coords?.lng ?? 77.1186;
  const delta = 0.022 / zoom;
  const bbox = `${(lng - delta).toFixed(4)},${(lat - delta * 0.65).toFixed(4)},${(lng + delta).toFixed(4)},${(lat + delta * 0.65).toFixed(4)}`;
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
    bbox
  )}&layer=mapnik`;

  const colorClasses: Record<MapPinItem['color'], string> = {
    orange: 'bg-orange-500 text-white ring-orange-200',
    blue: 'bg-blue-600 text-white ring-blue-200',
    green: 'bg-emerald-500 text-white ring-emerald-200',
    red: 'bg-rose-500 text-white ring-rose-200',
    purple: 'bg-purple-600 text-white ring-purple-200',
    amber: 'bg-amber-500 text-white ring-amber-200',
    indigo: 'bg-indigo-600 text-white ring-indigo-200',
    pink: 'bg-pink-500 text-white ring-pink-200',
  };

  const renderIcon = (icon?: MapPinItem['icon']) => {
    switch (icon) {
      case 'food':
        return <Utensils className="w-3.5 h-3.5" />;
      case 'shop':
        return <ShoppingBag className="w-3.5 h-3.5" />;
      case 'hospital':
        return <Hospital className="w-3.5 h-3.5" />;
      case 'police':
        return <Shield className="w-3.5 h-3.5" />;
      case 'fire':
        return <Flame className="w-3.5 h-3.5" />;
      case 'school':
        return <GraduationCap className="w-3.5 h-3.5" />;
      case 'park':
        return <Trees className="w-3.5 h-3.5" />;
      case 'fuel':
        return <Fuel className="w-3.5 h-3.5" />;
      case 'alert':
        return <AlertTriangle className="w-3.5 h-3.5" />;
      case 'car':
        return <Car className="w-3.5 h-3.5" />;
      case 'gym':
        return <Dumbbell className="w-3.5 h-3.5" />;
      case 'salon':
        return <Scissors className="w-3.5 h-3.5" />;
      case 'service':
        return <Wrench className="w-3.5 h-3.5" />;
      default:
        return <MapPin className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div
      className={`relative w-full ${heightClass} rounded-xl overflow-hidden border border-slate-200/80 bg-[#EEF2EC] select-none group`}
    >
      {/* Live OpenStreetMap Cartography Layer Centered at User's Exact (lat, lng) */}
      {useOsmLayer && (
        <iframe
          key={`${lat.toFixed(3)}-${lng.toFixed(3)}-${zoom}`}
          title="Live OpenStreetMap View"
          src={osmEmbedUrl}
          className="absolute inset-0 w-full h-full border-0 pointer-events-none opacity-90"
          loading="lazy"
        />
      )}

      {/* Map Vector & Traffic Overlay Canvas */}
      <div
        className="absolute inset-0 transition-transform duration-300 ease-out"
        style={{ transform: `scale(${useOsmLayer ? 1 : zoom})`, transformOrigin: 'center center' }}
      >
        <svg
          viewBox="0 0 600 400"
          className="w-full h-full object-cover"
          preserveAspectRatio="xMidYMid slice"
        >
          {!useOsmLayer && (
            <>
              <rect width="600" height="400" fill="#F1F4EE" />
              <polygon points="0,40 140,20 180,110 60,150 0,110" fill="#D5ECC8" />
              <polygon points="240,10 380,0 410,95 270,115" fill="#D9F0CC" />
              <polygon points="440,180 590,150 600,290 470,310" fill="#D8EFCB" />
              <polygon points="80,260 220,240 250,360 95,390" fill="#DCEFD0" />
              <path
                d="M 480,0 C 495,90 520,160 545,250 C 565,320 580,360 595,400"
                stroke="#BAE0F5"
                strokeWidth="16"
                fill="none"
              />
              <path
                d="M 0,210 Q 160,180 310,240 T 600,190"
                stroke="#C7E6F7"
                strokeWidth="8"
                fill="none"
              />
              <g stroke="#FFFFFF" strokeWidth="3.5" fill="none" opacity="0.9">
                <line x1="60" y1="0" x2="130" y2="400" />
                <line x1="170" y1="0" x2="210" y2="400" />
                <line x1="290" y1="0" x2="270" y2="400" />
                <line x1="410" y1="0" x2="380" y2="400" />
                <line x1="0" y1="85" x2="600" y2="65" />
                <line x1="0" y1="155" x2="600" y2="140" />
                <line x1="0" y1="285" x2="600" y2="265" />
                <line x1="0" y1="345" x2="600" y2="330" />
              </g>
              <path
                d="M 0,330 Q 190,260 320,190 T 580,40"
                stroke="#FDE08D"
                strokeWidth="8"
                fill="none"
              />
              <path
                d="M 110,0 Q 250,150 360,260 T 540,400"
                stroke="#FDE08D"
                strokeWidth="8.5"
                fill="none"
              />
            </>
          )}

          {/* Live Traffic Overlay Lines when enabled */}
          {showTrafficRoutes && (
            <g fill="none" strokeLinecap="round" opacity="0.88">
              <path d="M 20,322 Q 140,280 230,235" stroke="#22C55E" strokeWidth="6" />
              <path d="M 230,235 Q 295,200 375,145" stroke="#EF4444" strokeWidth="6.5" />
              <path d="M 375,145 Q 465,95 565,45" stroke="#F59E0B" strokeWidth="6" />
              <path d="M 140,35 Q 245,145 335,235" stroke="#EF4444" strokeWidth="6" />
              <path d="M 335,235 Q 430,320 520,385" stroke="#22C55E" strokeWidth="6" />
            </g>
          )}
        </svg>

        {/* Center User Pulsing Location Ring + Callout Pill */}
        <div className="absolute top-[48%] left-[48%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
          <div className="bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-md border border-slate-200/80 text-center mb-1.5 whitespace-pre-line leading-tight">
            <span className="text-[11px] font-bold text-slate-800">{centerLabel}</span>
          </div>
          <div className="relative flex items-center justify-center">
            <span className="absolute w-10 h-10 rounded-full bg-indigo-500/20 animate-ping" />
            <span className="w-7 h-7 rounded-full bg-indigo-500/25 flex items-center justify-center">
              <span className="w-3.5 h-3.5 rounded-full bg-indigo-600 border-2 border-white shadow" />
            </span>
          </div>
        </div>

        {/* Interactive Pins */}
        {pins.map((pin) => (
          <button
            key={pin.id}
            type="button"
            onClick={() => {
              setSelectedPin(pin);
              onPinClick?.(pin);
            }}
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center shadow-md ring-2 transition-transform hover:scale-125 z-10 ${colorClasses[pin.color]}`}
            title={pin.label}
          >
            {renderIcon(pin.icon)}
          </button>
        ))}

        {/* Traffic Incident Floating Callouts when showTrafficRoutes is true */}
        {showTrafficRoutes && (
          <div className="absolute top-[26%] left-[20%] bg-white/95 backdrop-blur px-2.5 py-1 rounded-lg shadow border border-red-200 flex items-center gap-1.5 z-20">
            <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <Car className="w-3 h-3" />
            </span>
            <div className="leading-none">
              <p className="text-[10px] font-bold text-slate-800">
                {trafficStatusLabel?.title || 'Live Arterial Flow'}
              </p>
              <p className="text-[9px] text-red-600 font-semibold">
                {trafficStatusLabel?.speed || 'Live Telemetry'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Top Filter Pills Inside Map */}
      {showTopFilterPills && (
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar z-20">
          {showTopFilterPills.map((pill) => (
            <button
              key={pill}
              type="button"
              onClick={() => setActiveFilter(pill)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold shadow-sm whitespace-nowrap transition ${
                activeFilter === pill
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/95 text-slate-700 hover:bg-white'
              }`}
            >
              {pill}
            </button>
          ))}
        </div>
      )}

      {/* Top Search Input Inside Map */}
      {showSearchOverlay && (
        <div className="absolute top-2.5 left-2.5 right-28 z-20">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200/80 px-2.5 py-1.5 flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search location on map..."
              className="bg-transparent text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none w-full"
            />
          </div>
        </div>
      )}

      {/* Top Right Live View Pill */}
      {showLiveViewBadge && (
        <div className="absolute top-2.5 right-2.5 z-20 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-sm border border-slate-200/80 flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
          <Radio className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
          <span>Live OSM ({lat.toFixed(2)}°N)</span>
        </div>
      )}

      {/* Left Floating Map Tools */}
      {showLeftControls && (
        <div className="absolute top-12 left-2.5 z-20 flex flex-col gap-1.5">
          {[
            { label: 'Current', icon: LocateFixed, onClick: () => setZoom(1) },
            { label: 'Layers', icon: Layers, onClick: () => setUseOsmLayer((v) => !v) },
            { label: 'Traffic', icon: Car, onClick: () => setZoom((z) => (z === 1 ? 1.25 : 1)) },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={item.onClick}
              className="w-9 h-9 rounded-lg bg-white/95 shadow-sm border border-slate-200/80 flex flex-col items-center justify-center text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
              title={item.label}
            >
              <item.icon className="w-3.5 h-3.5" />
              <span className="text-[8px] font-medium mt-0.5">{item.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Selected Pin Mini Popup */}
      {selectedPin && (
        <div className="absolute bottom-11 left-3 z-30 bg-white rounded-xl shadow-lg border border-slate-200 p-2.5 max-w-[210px] animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-bold text-slate-900">{selectedPin.label}</p>
              {selectedPin.sublabel && (
                <p className="text-[10px] text-slate-500 mt-0.5">{selectedPin.sublabel}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setSelectedPin(null)}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold px-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Bottom Left Search This Area Pill */}
      {showSearchBottomButton && (
        <button
          type="button"
          onClick={() => setZoom((z) => (z === 1 ? 1.2 : 1))}
          className="absolute bottom-2.5 left-2.5 z-20 bg-white/95 hover:bg-white text-slate-700 px-3 py-1.5 rounded-full shadow-md border border-slate-200/80 flex items-center gap-1.5 text-[11px] font-semibold transition"
        >
          <Search className="w-3 h-3 text-blue-600" />
          <span>Search this area</span>
          <ArrowRight className="w-3 h-3 text-slate-500" />
        </button>
      )}

      {/* Bottom Legend Bar */}
      {showLegendBar && (
        <div className="absolute bottom-2.5 left-2.5 z-20 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-sm border border-slate-200/80 flex items-center gap-3">
          {showLegendBar.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-1 text-[10px] font-semibold text-slate-700"
            >
              <span className={`w-2 h-2 rounded-full ${item.color}`} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Right Zoom & Locate Controls */}
      <div className="absolute bottom-2.5 right-2.5 z-20 flex flex-col gap-1">
        <div className="bg-white/95 rounded-lg shadow-md border border-slate-200/80 flex flex-col overflow-hidden">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(2.0, +(z + 0.25).toFixed(2)))}
            className="w-7 h-7 flex items-center justify-center text-slate-700 hover:bg-slate-100 border-b border-slate-100"
            title="Zoom in"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.25).toFixed(2)))}
            className="w-7 h-7 flex items-center justify-center text-slate-700 hover:bg-slate-100"
            title="Zoom out"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
        </div>
        <button
          type="button"
          onClick={() => {
            setZoom(1);
            setSelectedPin(null);
          }}
          className="w-7 h-7 rounded-lg bg-white/95 shadow-md border border-slate-200/80 flex items-center justify-center text-blue-600 hover:bg-blue-50"
          title="Re-center map"
        >
          <LocateFixed className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
