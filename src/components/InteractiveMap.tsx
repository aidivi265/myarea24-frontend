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
  heightClass?: string;
  showSearchOverlay?: boolean;
  showSearchBottomButton?: boolean;
  showTopFilterPills?: string[];
  showLiveViewBadge?: boolean;
  showLeftControls?: boolean;
  showLegendBar?: { label: string; color: string }[];
  showTrafficRoutes?: boolean;
  pins?: MapPinItem[];
  onPinClick?: (pin: MapPinItem) => void;
}

const DEFAULT_PINS: MapPinItem[] = [
  { id: 'p1', x: 35, y: 60, label: 'The Urban Chai Café', sublabel: '⭐ 4.5 • 800m', color: 'orange', icon: 'food' },
  { id: 'p2', x: 58, y: 68, label: 'Rohini Sector 10 Market', sublabel: 'Shopping Hub', color: 'blue', icon: 'shop' },
  { id: 'p3', x: 66, y: 38, label: 'City Care Hospital', sublabel: '24/7 Emergency', color: 'green', icon: 'hospital' },
  { id: 'p4', x: 75, y: 50, label: 'Max Super Speciality', sublabel: 'Shalimar Bagh', color: 'purple', icon: 'hospital' },
  { id: 'p5', x: 62, y: 57, label: 'Japanese Park', sublabel: 'Rohini Sec 10', color: 'green', icon: 'park' },
  { id: 'p6', x: 42, y: 42, label: 'Apna Super Mart', sublabel: 'Open Now', color: 'indigo', icon: 'shop' },
];

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  centerLabel = 'Rohini\nSector 10',
  heightClass = 'h-64',
  showSearchOverlay = false,
  showSearchBottomButton = true,
  showTopFilterPills,
  showLiveViewBadge = false,
  showLeftControls = false,
  showLegendBar,
  showTrafficRoutes = false,
  pins = DEFAULT_PINS,
  onPinClick,
}) => {
  const [zoom, setZoom] = useState(1);
  const [selectedPin, setSelectedPin] = useState<MapPinItem | null>(null);
  const [activeFilter, setActiveFilter] = useState(showTopFilterPills?.[0] || 'All');
  const [searchQuery, setSearchQuery] = useState('');

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
    <div className={`relative w-full ${heightClass} rounded-xl overflow-hidden border border-slate-200/80 bg-[#EEF2EC] select-none group`}>
      {/* Map Vector Canvas (Matches exact PDF cartography style) */}
      <div
        className="absolute inset-0 transition-transform duration-300 ease-out"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
      >
        <svg viewBox="0 0 600 400" className="w-full h-full object-cover" preserveAspectRatio="xMidYMid slice">
          <rect width="600" height="400" fill="#F1F4EE" />
          {/* Green Park Zones */}
          <polygon points="0,40 140,20 180,110 60,150 0,110" fill="#D5ECC8" />
          <polygon points="240,10 380,0 410,95 270,115" fill="#D9F0CC" />
          <polygon points="440,180 590,150 600,290 470,310" fill="#D8EFCB" />
          <polygon points="80,260 220,240 250,360 95,390" fill="#DCEFD0" />
          {/* Water Canal / River */}
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
          {/* Secondary Neighborhood Grid Roads */}
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
          {/* Major Arterial Highways (Outer Ring Road & NH-44) */}
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

          {/* Live Traffic Overlay Lines when enabled */}
          {showTrafficRoutes && (
            <g fill="none" strokeLinecap="round">
              {/* Green fast segment */}
              <path d="M 20,322 Q 140,280 230,235" stroke="#22C55E" strokeWidth="6" />
              {/* Red heavy traffic segment */}
              <path d="M 230,235 Q 295,200 375,145" stroke="#EF4444" strokeWidth="6.5" />
              {/* Amber moderate traffic segment */}
              <path d="M 375,145 Q 465,95 565,45" stroke="#F59E0B" strokeWidth="6" />
              {/* NH-44 corridor */}
              <path d="M 140,35 Q 245,145 335,235" stroke="#EF4444" strokeWidth="6" />
              <path d="M 335,235 Q 430,320 520,385" stroke="#22C55E" strokeWidth="6" />
            </g>
          )}
        </svg>

        {/* Neighborhood Text Labels matching PDF */}
        <span className="absolute top-[22%] left-[38%] text-[10px] font-semibold text-slate-500/90 pointer-events-none">
          Shalimar Bagh
        </span>
        <span className="absolute top-[55%] left-[12%] text-[11px] font-bold text-slate-700 pointer-events-none">
          Rithala
        </span>
        <span className="absolute top-[36%] left-[24%] text-[11px] font-bold text-slate-700 pointer-events-none">
          Rohini
        </span>
        <span className="absolute top-[42%] left-[56%] text-[10px] font-semibold text-slate-600 pointer-events-none">
          Model Town
        </span>
        <span className="absolute top-[52%] left-[72%] text-[10px] font-semibold text-slate-600 pointer-events-none">
          Keshav Puram
        </span>
        <span className="absolute bottom-[22%] left-[44%] text-[10px] font-semibold text-slate-600 pointer-events-none">
          Azadpur
        </span>
        <span className="absolute bottom-[14%] left-[55%] text-sm font-extrabold text-slate-700/90 tracking-tight pointer-events-none">
          Delhi
        </span>

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
          <>
            <div className="absolute top-[30%] left-[25%] bg-white/95 backdrop-blur px-2.5 py-1 rounded-lg shadow border border-red-200 flex items-center gap-1.5 z-20">
              <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                <Car className="w-3 h-3" />
              </span>
              <div className="leading-none">
                <p className="text-[10px] font-bold text-slate-800">Heavy Traffic</p>
                <p className="text-[9px] text-red-600 font-semibold">18 km/h</p>
              </div>
            </div>
            <div className="absolute top-[56%] left-[44%] bg-white/95 backdrop-blur px-2.5 py-1 rounded-lg shadow border border-amber-200 flex items-center gap-1.5 z-20">
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                <AlertTriangle className="w-3 h-3" />
              </span>
              <div className="leading-none">
                <p className="text-[10px] font-bold text-slate-800">Accident</p>
                <p className="text-[9px] text-slate-500">Right lane blocked</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Top Filter Pills Inside Map (e.g. Businesses Dashboard) */}
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

      {/* Top Search Input Inside Map (e.g. Traffic / Alerts / Map Dashboards) */}
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
          <span>Live View</span>
        </div>
      )}

      {/* Left Floating Map Tools (Map Dashboard) */}
      {showLeftControls && (
        <div className="absolute top-12 left-2.5 z-20 flex flex-col gap-1.5">
          {[
            { label: 'Current', icon: LocateFixed },
            { label: 'Layers', icon: Layers },
            { label: 'Traffic', icon: Car },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
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
          onClick={() => setZoom((z) => (z === 1 ? 1.15 : 1))}
          className="absolute bottom-2.5 left-2.5 z-20 bg-white/95 hover:bg-white text-slate-700 px-3 py-1.5 rounded-full shadow-md border border-slate-200/80 flex items-center gap-1.5 text-[11px] font-semibold transition"
        >
          <Search className="w-3 h-3 text-blue-600" />
          <span>Search this area</span>
          <ArrowRight className="w-3 h-3 text-slate-500" />
        </button>
      )}

      {/* Bottom Legend Bar (Traffic / Alerts / Fuel) */}
      {showLegendBar && (
        <div className="absolute bottom-2.5 left-2.5 z-20 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-sm border border-slate-200/80 flex items-center gap-3">
          {showLegendBar.map((item) => (
            <div key={item.label} className="flex items-center gap-1 text-[10px] font-semibold text-slate-700">
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
            onClick={() => setZoom((z) => Math.min(1.5, +(z + 0.15).toFixed(2)))}
            className="w-7 h-7 flex items-center justify-center text-slate-700 hover:bg-slate-100 border-b border-slate-100"
            title="Zoom in"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(1, +(z - 0.15).toFixed(2)))}
            className="w-7 h-7 flex items-center justify-center text-slate-700 hover:bg-slate-100"
            title="Zoom out"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
        </div>
        <button
          type="button"
          onClick={() => setZoom(1)}
          className="w-7 h-7 rounded-lg bg-white/95 shadow-md border border-slate-200/80 flex items-center justify-center text-slate-700 hover:bg-slate-100"
          title="Reset center"
        >
          <LocateFixed className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
