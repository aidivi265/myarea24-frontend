import React, { useState } from 'react';
import {
  MapPin,
  Search,
  LocateFixed,
  Home,
  Briefcase,
  Bookmark,
  Clock,
  Plus,
  Check,
  X,
  ChevronRight,
  Navigation,
  Loader2,
} from 'lucide-react';

export interface UserLocation {
  id: string;
  label: string; // e.g. "Home", "Work", or area name
  areaName: string; // e.g. "Rohini Sector 10, Delhi"
  fullAddress: string; // e.g. "Pocket B-4, Sector 10, Rohini, Outer North Delhi 110085"
  pincode: string;
  coords?: { lat: number; lng: number };
}

export const DEFAULT_SAVED_LOCATIONS: UserLocation[] = [
  {
    id: 'loc-home',
    label: 'Home',
    areaName: 'Outer North Delhi, Delhi',
    fullAddress: 'Pocket B-4, Rohini Sector 10, Outer North Delhi, Delhi 110085',
    pincode: '110085',
  },
  {
    id: 'loc-work',
    label: 'Work',
    areaName: 'Pitampura, Delhi',
    fullAddress: 'Netaji Subhash Place (NSP), Pitampura, North West Delhi 110034',
    pincode: '110034',
  },
  {
    id: 'loc-other',
    label: 'Other',
    areaName: 'Shalimar Bagh, Delhi',
    fullAddress: 'Block BQ Market, Shalimar Bagh, Delhi 110088',
    pincode: '110088',
  },
];

export const POPULAR_AREAS: UserLocation[] = [
  {
    id: 'pop-1',
    label: 'Rohini Sector 10',
    areaName: 'Rohini Sector 10, Delhi',
    fullAddress: 'Near Japanese Park & Rohini West Metro, Outer North Delhi 110085',
    pincode: '110085',
  },
  {
    id: 'pop-2',
    label: 'Rohini Sector 9',
    areaName: 'Rohini Sector 9, Delhi',
    fullAddress: 'DDA Community Centre, Sector 9, Rohini, Delhi 110085',
    pincode: '110085',
  },
  {
    id: 'pop-3',
    label: 'Rithala',
    areaName: 'Rithala, Rohini, Delhi',
    fullAddress: 'Rithala Metro Corridor, Outer North Delhi 110085',
    pincode: '110085',
  },
  {
    id: 'pop-4',
    label: 'Model Town',
    areaName: 'Model Town, Delhi',
    fullAddress: 'Model Town Phase II, Ring Road Corridor, North Delhi 110009',
    pincode: '110009',
  },
  {
    id: 'pop-5',
    label: 'Azadpur',
    areaName: 'Azadpur, Delhi',
    fullAddress: 'NH-44 GT Karnal Road, Azadpur, Delhi 110033',
    pincode: '110033',
  },
  {
    id: 'pop-6',
    label: 'Keshav Puram',
    areaName: 'Keshav Puram, Delhi',
    fullAddress: 'Lawrence Road Industrial & Residential Area, Delhi 110035',
    pincode: '110035',
  },
  {
    id: 'pop-7',
    label: 'Connaught Place',
    areaName: 'Connaught Place, New Delhi',
    fullAddress: 'Inner Circle, Rajiv Chowk, Central Delhi 110001',
    pincode: '110001',
  },
];

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: UserLocation;
  onSelectLocation: (loc: UserLocation) => void;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [savedLocations, setSavedLocations] = useState<UserLocation[]>(DEFAULT_SAVED_LOCATIONS);
  const [detectingGps, setDetectingGps] = useState(false);
  const [addingNew, setAddingNew] = useState(false);
  const [newLabel, setNewLabel] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [newArea, setNewArea] = useState('');
  const [newAddress, setNewAddress] = useState('');

  if (!isOpen) return null;

  const filteredAreas = POPULAR_AREAS.filter(
    (a) =>
      !searchQuery.trim() ||
      a.areaName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.fullAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.pincode.includes(searchQuery.trim())
  );

  const handleUseCurrentGps = () => {
    setDetectingGps(true);
    const finishGps = (lat?: number, lng?: number) => {
      setTimeout(() => {
        setDetectingGps(false);
        const gpsLoc: UserLocation = {
          id: 'loc-gps',
          label: 'Current Location',
          areaName: 'Outer North Delhi, Delhi',
          fullAddress: lat
            ? `GPS Pin (${lat.toFixed(4)}°N, ${lng?.toFixed(4)}°E) • Rohini Sector 10, Outer North Delhi 110085`
            : 'Live GPS • Rohini Sector 10, Near Japanese Park, Outer North Delhi 110085',
          pincode: '110085',
        };
        onSelectLocation(gpsLoc);
        onClose();
      }, 650);
    };

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => finishGps(pos.coords.latitude, pos.coords.longitude),
        () => finishGps(),
        { timeout: 3000 }
      );
    } else {
      finishGps();
    }
  };

  const handleSaveNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArea.trim()) return;
    const created: UserLocation = {
      id: `loc-${Date.now()}`,
      label: newLabel,
      areaName: newArea.trim(),
      fullAddress: newAddress.trim() || `${newArea.trim()}, Delhi NCR`,
      pincode: '110085',
    };
    setSavedLocations((prev) => [created, ...prev]);
    onSelectLocation(created);
    setAddingNew(false);
    setNewArea('');
    setNewAddress('');
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Select Your Location</h3>
            <p className="text-xs text-slate-500">
              Hyperlocal signals, traffic, weather & stores sync to your exact area
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input Bar (Blinkit / Uber style) */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/60">
          <div className="bg-white border-2 border-indigo-500/80 focus-within:border-indigo-600 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 shadow-xs">
            <Search className="w-4 h-4 text-indigo-600 shrink-0" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for area, sector, street name, metro or pincode..."
              className="flex-1 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Use Current Location GPS Action */}
          <button
            type="button"
            onClick={handleUseCurrentGps}
            disabled={detectingGps}
            className="mt-2.5 w-full bg-white hover:bg-indigo-50/60 border border-slate-200/90 rounded-xl p-3 flex items-center justify-between gap-3 text-left transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition">
                {detectingGps ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LocateFixed className="w-4 h-4" />
                )}
              </div>
              <div>
                <p className="text-xs font-extrabold text-indigo-600">
                  {detectingGps ? 'Detecting your live GPS coordinates...' : 'Use current location'}
                </p>
                <p className="text-[11px] text-slate-500">
                  Using GPS • Rohini Sector 10, Outer North Delhi
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Saved Addresses Section */}
          {!searchQuery && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  Saved Addresses
                </p>
                <button
                  type="button"
                  onClick={() => setAddingNew((v) => !v)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add New
                </button>
              </div>

              {addingNew && (
                <form
                  onSubmit={handleSaveNewAddress}
                  className="mb-3 p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200/80 space-y-2.5"
                >
                  <div className="flex gap-1.5">
                    {(['Home', 'Work', 'Other'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setNewLabel(t)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold ${
                          newLabel === t
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white text-slate-600 border border-slate-200'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    required
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value)}
                    placeholder="Locality / Sector (e.g. Rohini Sector 15, Delhi)"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs focus:outline-none"
                  />
                  <input
                    type="text"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="House / Flat / Landmark (optional)"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs focus:outline-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setAddingNew(false)}
                      className="px-3 py-1.5 rounded-lg bg-white text-slate-600 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold"
                    >
                      Save & Select
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                {savedLocations.map((loc) => {
                  const isSelected = currentLocation.areaName === loc.areaName && currentLocation.label === loc.label;
                  const Icon =
                    loc.label === 'Home' ? Home : loc.label === 'Work' ? Briefcase : Bookmark;
                  return (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => {
                        onSelectLocation(loc);
                        onClose();
                      }}
                      className={`w-full p-3 rounded-xl border text-left flex items-start justify-between gap-3 transition ${
                        isSelected
                          ? 'bg-indigo-50/70 border-indigo-500 ring-1 ring-indigo-500/30'
                          : 'bg-white hover:bg-slate-50 border-slate-200/80'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-slate-900">{loc.label}</span>
                            <span className="text-[11px] font-semibold text-indigo-600 truncate">
                              • {loc.areaName}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {loc.fullAddress}
                          </p>
                        </div>
                      </div>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-1">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Popular / Searched Localities */}
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2.5">
              {searchQuery ? 'Matching Areas & Sectors' : 'Nearby Sectors & Localities'}
            </p>
            <div className="space-y-1.5">
              {filteredAreas.map((area) => {
                const isSelected = currentLocation.areaName === area.areaName;
                return (
                  <button
                    key={area.id}
                    type="button"
                    onClick={() => {
                      onSelectLocation(area);
                      onClose();
                    }}
                    className={`w-full p-2.5 rounded-xl flex items-center justify-between gap-3 text-left transition ${
                      isSelected ? 'bg-indigo-50 text-indigo-900' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{area.areaName}</p>
                        <p className="text-[11px] text-slate-500 truncate">{area.fullAddress}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                      {area.pincode}
                    </span>
                  </button>
                );
              })}

              {/* Custom typed location fallback if user types any new city/area */}
              {searchQuery.trim().length > 2 && filteredAreas.length === 0 && (
                <button
                  type="button"
                  onClick={() => {
                    onSelectLocation({
                      id: `custom-${Date.now()}`,
                      label: searchQuery.trim(),
                      areaName: searchQuery.trim(),
                      fullAddress: `${searchQuery.trim()}, India`,
                      pincode: '110001',
                    });
                    onClose();
                  }}
                  className="w-full p-3 rounded-xl border border-indigo-200 bg-indigo-50/50 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3">
                    <Navigation className="w-4 h-4 text-indigo-600" />
                    <div>
                      <p className="text-xs font-extrabold text-indigo-950">
                        Set location to "{searchQuery.trim()}"
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Switch MyArea24 intelligence feed to this area
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-indigo-600" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
