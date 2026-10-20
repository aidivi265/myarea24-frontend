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
  Trash2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { reverseGeocodeLive, searchLocationsLive } from '../services/liveIntelligence';
import { DEFAULT_SAVED_LOCATIONS, type UserLocation } from '../types';
export { DEFAULT_SAVED_LOCATIONS, type UserLocation };

const SAVED_LOCATIONS_STORAGE_KEY = 'myarea24_saved_locations_v1';
const RECENT_LOCATIONS_STORAGE_KEY = 'myarea24_recent_locations_v1';

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

  // User-created Saved Addresses only — never fake pre-populated addresses!
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
    return [];
  });

  // Recent user search history
  const [recentLocations, setRecentLocations] = useState<UserLocation[]>(() => {
    try {
      const raw = localStorage.getItem(RECENT_LOCATIONS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
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
        // ignore
      }
      return next;
    });
  };

  const addLocationToRecent = (loc: UserLocation) => {
    setRecentLocations((prev) => {
      const filtered = prev.filter((item) => item.areaName !== loc.areaName);
      const next = [loc, ...filtered].slice(0, 5);
      try {
        localStorage.setItem(RECENT_LOCATIONS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleSelect = (loc: UserLocation) => {
    addLocationToRecent(loc);
    onSelectLocation(loc);
    onClose();
  };

  const handleDeleteSavedLocation = (e: React.MouseEvent, idToDelete: string) => {
    e.stopPropagation();
    updateSavedLocations((prev) => prev.filter((item) => item.id !== idToDelete));
  };

  const handleClearRecents = () => {
    setRecentLocations([]);
    try {
      localStorage.removeItem(RECENT_LOCATIONS_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  // Debounced Pan-India Live Location Search via Nominatim / FastAPI
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
          handleSelect(resolved);
        } catch {
          setDetectingGps(false);
          const fallbackGps: UserLocation = {
            id: `loc-gps-${Date.now()}`,
            label: 'Current Location',
            areaName: `Location (${pos.coords.latitude.toFixed(3)}°N, ${pos.coords.longitude.toFixed(3)}°E)`,
            fullAddress: `Detected via device GPS at coordinates ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`,
            pincode: '',
            coords: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          };
          handleSelect(fallbackGps);
        }
      },
      (err) => {
        setDetectingGps(false);
        setGpsError(
          err.code === 1
            ? 'Location permission was denied. Please allow location access in your browser settings or search your locality above.'
            : 'Unable to acquire accurate GPS signal. Please search your locality, city, or pincode above.'
        );
      },
      { enableHighAccuracy: true, timeout: 9000 }
    );
  };

  const handleSaveCurrentAsFavorite = (label: 'Home' | 'Work') => {
    const existing = savedLocations.find((s) => s.label === label);
    const updated: UserLocation = {
      ...currentLocation,
      id: existing ? existing.id : `loc-saved-${Date.now()}`,
      label,
    };
    updateSavedLocations((prev) => [updated, ...prev.filter((s) => s.label !== label)]);
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
      coords: best?.coords || currentLocation.coords || { lat: 28.6139, lng: 77.2090 },
    };
    updateSavedLocations((prev) => [created, ...prev]);
    handleSelect(created);
    setAddingNew(false);
    setNewArea('');
    setNewAddress('');
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
              Hyperlocal stores, services, emergency SOS & weather for your area in India
            </p>
          </div>
          <button
            type="button"
            aria-label="Close location selector"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input Bar (Real-world Pan-India Search) */}
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
              placeholder="Search area, landmark, street, city or 6-digit pincode across India..."
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
            className="mt-2.5 w-full bg-white hover:bg-indigo-50/60 border border-slate-200/90 rounded-xl p-3 flex items-center justify-between gap-3 text-left transition group cursor-pointer"
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
                  {detectingGps ? 'Detecting device GPS & reverse-geocoding...' : 'Use Current Location'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {currentLocation.coords && currentLocation.areaName !== 'Select Your Area (India)'
                    ? `Current: ${currentLocation.areaName}`
                    : 'Auto-detect exact coordinates via device GPS anywhere in India'}
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
          {/* Live Search Results Mode */}
          {searchQuery.trim().length >= 2 ? (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  Search Results ({liveResults.length})
                </p>
                {searchingLive && (
                  <span className="text-[10px] font-semibold text-indigo-600 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Searching India...
                  </span>
                )}
              </div>

              {liveResults.length > 0 ? (
                <div className="space-y-1.5">
                  {liveResults.map((area) => {
                    const isSelected = currentLocation.areaName === area.areaName;
                    return (
                      <div
                        key={area.id}
                        onClick={() => handleSelect(area)}
                        className={`w-full p-2.5 rounded-xl flex items-center justify-between gap-2 text-left transition cursor-pointer ${
                          isSelected ? 'bg-indigo-50 border border-indigo-200 text-indigo-900' : 'hover:bg-slate-50 border border-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                            <Navigation className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-slate-900 truncate">{area.areaName}</p>
                              {area.pincode && (
                                <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 shrink-0">
                                  {area.pincode}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 truncate">{area.fullAddress}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                      </div>
                    );
                  })}
                </div>
              ) : !searchingLive ? (
                <div className="text-center py-6">
                  <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">No matching places found</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Try searching with city name, sector number, or 6-digit pincode
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const custom: UserLocation = {
                        id: `loc-custom-${Date.now()}`,
                        label: searchQuery.trim(),
                        areaName: searchQuery.trim(),
                        fullAddress: `${searchQuery.trim()}, India`,
                        pincode: '',
                        coords: currentLocation.coords || { lat: 28.6139, lng: 77.2090 },
                      };
                      handleSelect(custom);
                    }}
                    className="mt-3 px-4 py-1.5 rounded-full bg-indigo-600 text-white text-xs font-bold"
                  >
                    + Use "{searchQuery}" as my location
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <>
              {/* Saved Addresses Section (Strictly user-saved) */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Saved Addresses ({savedLocations.length})
                  </p>
                  <button
                    type="button"
                    onClick={() => setAddingNew((v) => !v)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Address
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
                      placeholder="Area / Locality / City (e.g. Indiranagar Bengaluru, Sector 18 Noida)"
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs focus:outline-none"
                    />
                    <input
                      type="text"
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      placeholder="House / Flat / Street / Landmark (optional)"
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs focus:outline-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setAddingNew(false)}
                        className="px-3 py-1.5 rounded-lg bg-white text-slate-600 text-xs font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold cursor-pointer"
                      >
                        Save Address
                      </button>
                    </div>
                  </form>
                )}

                {savedLocations.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 text-center space-y-2">
                    <p className="text-xs font-semibold text-slate-700">No saved addresses yet</p>
                    <p className="text-[11px] text-slate-400">
                      Save your Home or Work address for quick 1-tap switching.
                    </p>
                    {currentLocation.coords && currentLocation.areaName !== 'Select Your Area (India)' && (
                      <div className="flex justify-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleSaveCurrentAsFavorite('Home')}
                          className="px-3 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 text-slate-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition shadow-xs"
                        >
                          <Home className="w-3 h-3 text-indigo-600" /> Save as Home
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveCurrentAsFavorite('Work')}
                          className="px-3 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 text-slate-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition shadow-xs"
                        >
                          <Briefcase className="w-3 h-3 text-indigo-600" /> Save as Work
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {savedLocations.map((loc) => {
                      const isSelected = currentLocation.areaName === loc.areaName && currentLocation.label === loc.label;
                      const Icon = loc.label === 'Home' ? Home : loc.label === 'Work' ? Briefcase : Bookmark;
                      return (
                        <div
                          key={loc.id}
                          onClick={() => handleSelect(loc)}
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
                                title="Active Location"
                              >
                                <Check className="w-3 h-3" />
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={(e) => handleDeleteSavedLocation(e, loc.id)}
                              title={`Delete ${loc.label}`}
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

              {/* Recent Locations Section */}
              {recentLocations.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> Recent Searches
                    </p>
                    <button
                      type="button"
                      onClick={handleClearRecents}
                      className="text-[10px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="space-y-1">
                    {recentLocations.map((rec) => (
                      <div
                        key={rec.id || rec.areaName}
                        onClick={() => handleSelect(rec)}
                        className="p-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between gap-2 cursor-pointer border border-slate-100 transition"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{rec.areaName}</p>
                            <p className="text-[10px] text-slate-400 truncate">{rec.fullAddress}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pan-India Helpful Discovery Card */}
              {recentLocations.length === 0 && (
                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100/90 text-left">
                  <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-xs">
                    <Sparkles className="w-4 h-4 text-indigo-600" /> Pan-India Hyperlocal Coverage
                  </div>
                  <p className="text-[11px] text-indigo-950/80 mt-1">
                    MyArea24 covers all Indian cities, towns, and districts. Type any landmark, sector, or 6-digit pincode above to explore live local intelligence.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
