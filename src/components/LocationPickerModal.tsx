import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Search,
  LocateFixed,
  Home,
  Briefcase,
  Bookmark,
  Plus,
  Check,
  X,
  ChevronRight,
  Navigation,
  Loader2,
  Globe,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { reverseGeocodeLive, searchLocationsLive } from '../services/liveIntelligence';

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
    areaName: 'Rohini Sector 10, Delhi',
    fullAddress: 'Pocket B-4, Rohini Sector 10, Outer North Delhi, Delhi 110085',
    pincode: '110085',
    coords: { lat: 28.7196, lng: 77.1186 },
  },
  {
    id: 'loc-work',
    label: 'Work',
    areaName: 'Connaught Place, New Delhi',
    fullAddress: 'Inner Circle, Rajiv Chowk, Connaught Place, New Delhi 110001',
    pincode: '110001',
    coords: { lat: 28.6315, lng: 77.2167 },
  },
  {
    id: 'loc-akgec',
    label: 'Campus',
    areaName: 'AKGEC, Ghaziabad, Uttar Pradesh',
    fullAddress: '27th Km Milestone, Delhi-Meerut Expressway, Adhyatmik Nagar, Ghaziabad 201009',
    pincode: '201009',
    coords: { lat: 28.6757, lng: 77.5020 },
  },
];

export const POPULAR_AREAS: UserLocation[] = [
  {
    id: 'pop-1',
    label: 'Rohini Sector 10',
    areaName: 'Rohini Sector 10, Delhi',
    fullAddress: 'Near Japanese Park & Rohini West Metro, Outer North Delhi 110085',
    pincode: '110085',
    coords: { lat: 28.7196, lng: 77.1186 },
  },
  {
    id: 'pop-2',
    label: 'Connaught Place',
    areaName: 'Connaught Place, New Delhi',
    fullAddress: 'Inner Circle, Rajiv Chowk, Central Delhi 110001',
    pincode: '110001',
    coords: { lat: 28.6315, lng: 77.2167 },
  },
  {
    id: 'pop-3',
    label: 'Noida Sector 62',
    areaName: 'Noida Sector 62, Uttar Pradesh',
    fullAddress: 'Electronic City Metro Corridor, Sector 62, Noida 201309',
    pincode: '201309',
    coords: { lat: 28.6280, lng: 77.3649 },
  },
  {
    id: 'pop-4',
    label: 'Indiranagar, Bengaluru',
    areaName: 'Indiranagar, Bengaluru',
    fullAddress: '100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038',
    pincode: '560038',
    coords: { lat: 12.9784, lng: 77.6408 },
  },
  {
    id: 'pop-5',
    label: 'Bandra Kurla Complex, Mumbai',
    areaName: 'Bandra Kurla Complex, Mumbai',
    fullAddress: 'G Block BKC, Bandra East, Mumbai, Maharashtra 400051',
    pincode: '400051',
    coords: { lat: 19.0657, lng: 72.8679 },
  },
  {
    id: 'pop-6',
    label: 'Hitec City, Hyderabad',
    areaName: 'Hitec City, Hyderabad',
    fullAddress: 'Cyber Towers, Madhapur, Hyderabad, Telangana 500081',
    pincode: '500081',
    coords: { lat: 17.4504, lng: 78.3808 },
  },
  {
    id: 'pop-7',
    label: 'Hazratganj, Lucknow',
    areaName: 'Hazratganj, Lucknow',
    fullAddress: 'Hazratganj Chauraha, Central Lucknow, Uttar Pradesh 226001',
    pincode: '226001',
    coords: { lat: 26.8467, lng: 80.9462 },
  },
  {
    id: 'pop-8',
    label: 'Hinjewadi, Pune',
    areaName: 'Hinjewadi Phase 1, Pune',
    fullAddress: 'Rajiv Gandhi Infotech Park, Hinjewadi, Pune, Maharashtra 411057',
    pincode: '411057',
    coords: { lat: 18.5913, lng: 73.7389 },
  },
];

const SAVED_LOCATIONS_STORAGE_KEY = 'myarea24_saved_locations_v1';

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
  const [liveResults, setLiveResults] = useState<UserLocation[]>([]);
  const [searchingLive, setSearchingLive] = useState(false);
  const [savedLocations, setSavedLocations] = useState<UserLocation[]>(() => {
    try {
      const raw = localStorage.getItem(SAVED_LOCATIONS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return DEFAULT_SAVED_LOCATIONS;
  });
  const [detectingGps, setDetectingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [newLabel, setNewLabel] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [newArea, setNewArea] = useState('');
  const [newAddress, setNewAddress] = useState('');

  const updateSavedLocations = (updater: (prev: UserLocation[]) => UserLocation[]) => {
    setSavedLocations((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem(SAVED_LOCATIONS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  const handleDeleteSavedLocation = (e: React.MouseEvent, idToDelete: string) => {
    e.stopPropagation();
    updateSavedLocations((prev) => prev.filter((item) => item.id !== idToDelete));
  };

  const handleToggleBookmarkArea = (e: React.MouseEvent, area: UserLocation) => {
    e.stopPropagation();
    const existing = savedLocations.find((s) => s.areaName === area.areaName);
    if (existing) {
      updateSavedLocations((prev) => prev.filter((item) => item.id !== existing.id));
    } else {
      const newSaved: UserLocation = {
        ...area,
        id: `loc-${Date.now()}`,
        label: area.label || area.areaName.split(',')[0],
      };
      updateSavedLocations((prev) => [newSaved, ...prev]);
    }
  };

  // Debounced Pan-India + Nominatim Live Search
  useEffect(() => {
    if (!isOpen) return;
    const q = searchQuery.trim();
    if (q.length < 2) {
      setLiveResults([]);
      setSearchingLive(false);
      return;
    }

    let cancelled = false;
    setSearchingLive(true);
    const timer = setTimeout(async () => {
      const found = await searchLocationsLive(q);
      if (!cancelled) {
        setLiveResults(found);
        setSearchingLive(false);
      }
    }, 280);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery, isOpen]);

  if (!isOpen) return null;

  const localFiltered = POPULAR_AREAS.filter(
    (a) =>
      !searchQuery.trim() ||
      a.areaName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.fullAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.pincode.includes(searchQuery.trim())
  );

  const displayAreas =
    searchQuery.trim().length >= 2
      ? [...liveResults, ...localFiltered.filter((l) => !liveResults.some((r) => r.areaName === l.areaName))]
      : POPULAR_AREAS;

  const handleUseCurrentGps = () => {
    setDetectingGps(true);
    setGpsError(null);

    if (!('geolocation' in navigator)) {
      setDetectingGps(false);
      setGpsError('Browser geolocation is not supported on this device.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const resolved = await reverseGeocodeLive(pos.coords.latitude, pos.coords.longitude);
          setDetectingGps(false);
          onSelectLocation(resolved);
          onClose();
        } catch {
          setDetectingGps(false);
          const fallbackGps: UserLocation = {
            id: 'loc-gps',
            label: 'Current Location',
            areaName: `GPS (${pos.coords.latitude.toFixed(3)}°N, ${pos.coords.longitude.toFixed(3)}°E)`,
            fullAddress: `Live GPS Coordinates: ${pos.coords.latitude.toFixed(4)}°N, ${pos.coords.longitude.toFixed(4)}°E`,
            pincode: '',
            coords: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          };
          onSelectLocation(fallbackGps);
          onClose();
        }
      },
      (err) => {
        setDetectingGps(false);
        setGpsError(
          err.code === 1
            ? 'Location permission denied. Please allow location access in browser settings or search your area above.'
            : 'Unable to lock GPS signal. Please search your locality or city above.'
        );
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSaveNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArea.trim()) return;
    setSearchingLive(true);
    const geocoded = await searchLocationsLive(newArea.trim());
    setSearchingLive(false);
    const best = geocoded[0];

    const created: UserLocation = {
      id: `loc-${Date.now()}`,
      label: newLabel,
      areaName: best ? best.areaName : newArea.trim(),
      fullAddress: newAddress.trim() || best?.fullAddress || `${newArea.trim()}, India`,
      pincode: best?.pincode || '',
      coords: best?.coords || currentLocation.coords || { lat: 28.7196, lng: 77.1186 },
    };
    updateSavedLocations((prev) => [created, ...prev]);
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
              Live weather, CPCB AQI, TomTom traffic & NDMA alerts sync to your exact coordinates
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
            {searchingLive ? (
              <Loader2 className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />
            ) : (
              <Search className="w-4 h-4 text-indigo-600 shrink-0" />
            )}
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any city, sector, landmark, village or pincode in India..."
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
                  {detectingGps ? 'Detecting live GPS & reverse-geocoding...' : 'Use current location'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {currentLocation.coords
                    ? `Active: ${currentLocation.areaName} (${currentLocation.coords.lat.toFixed(3)}°N, ${currentLocation.coords.lng.toFixed(3)}°E)`
                    : 'Auto-detect via browser GPS + OpenStreetMap Nominatim'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          </button>

          {gpsError && (
            <p className="mt-2 text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-1.5">
              {gpsError}
            </p>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Saved Addresses Section */}
          {!searchQuery && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  Saved Addresses ({savedLocations.length})
                </p>
                <div className="flex items-center gap-3">
                  {savedLocations.length < DEFAULT_SAVED_LOCATIONS.length && (
                    <button
                      type="button"
                      onClick={() => updateSavedLocations(() => DEFAULT_SAVED_LOCATIONS)}
                      className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 flex items-center gap-1"
                      title="Restore default saved locations"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setAddingNew((v) => !v)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add New
                  </button>
                </div>
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
                    placeholder="City / Sector / Locality (e.g. Indirapuram Ghaziabad, Koramangala Bengaluru)"
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
                      Geocode & Save
                    </button>
                  </div>
                </form>
              )}

              {savedLocations.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 text-center">
                  <p className="text-xs font-semibold text-slate-600">No saved addresses</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Click "+ Add New" above or bookmark any locality below
                  </p>
                  <button
                    type="button"
                    onClick={() => updateSavedLocations(() => DEFAULT_SAVED_LOCATIONS)}
                    className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-indigo-600 hover:bg-indigo-50 transition"
                  >
                    <RotateCcw className="w-3 h-3" /> Restore Default Addresses
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {savedLocations.map((loc) => {
                    const isSelected =
                      currentLocation.areaName === loc.areaName && currentLocation.label === loc.label;
                    const Icon =
                      loc.label === 'Home' ? Home : loc.label === 'Work' ? Briefcase : Bookmark;
                    return (
                      <div
                        key={loc.id}
                        onClick={() => {
                          onSelectLocation(loc);
                          onClose();
                        }}
                        className={`w-full p-3 rounded-xl border text-left flex items-center justify-between gap-2 transition cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50/70 border-indigo-500 ring-1 ring-indigo-500/30'
                            : 'bg-white hover:bg-slate-50 border-slate-200/80'
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                              isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
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
                        <div className="flex items-center gap-1.5 shrink-0">
                          {isSelected && (
                            <span
                              className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center"
                              title="Currently active location"
                            >
                              <Check className="w-3 h-3" />
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => handleDeleteSavedLocation(e, loc.id)}
                            title={`Delete ${loc.label} (${loc.areaName})`}
                            aria-label={`Delete ${loc.label}`}
                            className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Live Searched / Popular Pan-India Localities */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-500" />
                {searchQuery
                  ? `Live Geocoded Locations (${displayAreas.length})`
                  : 'Popular Pan-India Hubs & Localities'}
              </p>
              {searchingLive && (
                <span className="text-[10px] font-semibold text-indigo-600">Searching India...</span>
              )}
            </div>
            <div className="space-y-1.5">
              {displayAreas.map((area) => {
                const isSelected = currentLocation.areaName === area.areaName;
                const isBookmarked = savedLocations.some((s) => s.areaName === area.areaName);
                return (
                  <div
                    key={area.id}
                    onClick={() => {
                      onSelectLocation(area);
                      onClose();
                    }}
                    className={`w-full p-2.5 rounded-xl flex items-center justify-between gap-2 text-left transition cursor-pointer ${
                      isSelected ? 'bg-indigo-50 text-indigo-900' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                        <Navigation className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-900 truncate">{area.areaName}</p>
                          {area.coords && (
                            <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 shrink-0">
                              {area.coords.lat.toFixed(2)}°N, {area.coords.lng.toFixed(2)}°E
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">{area.fullAddress}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleToggleBookmarkArea(e, area)}
                        title={isBookmarked ? 'Remove from Saved Addresses' : 'Save to Saved Addresses'}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${
                          isBookmarked
                            ? 'text-indigo-600 bg-indigo-50 hover:bg-rose-50 hover:text-rose-600'
                            : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'
                        }`}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                      </button>
                      {isSelected ? (
                        <span className="text-[10px] font-extrabold text-indigo-600 shrink-0">Selected</span>
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </div>
                  </div>
                );
              })}

              {displayAreas.length === 0 && !searchingLive && (
                <div className="text-center py-6">
                  <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">
                    No matching locality found for "{searchQuery}"
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setAddingNew(true);
                      setNewArea(searchQuery);
                      setSearchQuery('');
                    }}
                    className="mt-3 px-4 py-1.5 rounded-full bg-indigo-600 text-white text-xs font-bold"
                  >
                    + Use "{searchQuery}" as Custom Location
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
