import React, { useState } from 'react';
import { MerchantBusinessInfo, MerchantDashboardId } from '../types';
import {
  Store,
  MapPin,
  Clock,
  Camera,
  ExternalLink,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Eye,
  Calendar,
  Tag,
  Package,
  Share2,
  Save,
  Check,
} from 'lucide-react';

interface MerchantProfileDashboardProps {
  business: MerchantBusinessInfo;
  onUpdateBusiness: (updated: Partial<MerchantBusinessInfo>) => void;
  onNavigate: (tab: MerchantDashboardId) => void;
  onOpenQuickAction: (actionType: string) => void;
}

export function MerchantProfileDashboard({
  business,
  onUpdateBusiness,
  onNavigate,
  onOpenQuickAction,
}: MerchantProfileDashboardProps) {
  const [activeSubTab, setActiveSubTab] = useState<
    | 'overview'
    | 'basic'
    | 'location'
    | 'hours'
    | 'photos'
    | 'details'
    | 'verification'
    | 'preview'
  >('overview');

  const [isEditingBasic, setIsEditingBasic] = useState(false);
  const [formData, setFormData] = useState({
    name: business.name,
    category: business.category,
    tagline: business.tagline,
    phone: business.phone,
    email: business.email,
    website: business.website,
    address: business.fullAddress,
    landmark: business.landmark,
    serviceArea: business.serviceArea,
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveBasic = () => {
    onUpdateBusiness({
      name: formData.name,
      category: formData.category,
      tagline: formData.tagline,
      phone: formData.phone,
      email: formData.email,
      website: formData.website,
      fullAddress: formData.address,
      landmark: formData.landmark,
      serviceArea: formData.serviceArea,
    });
    setIsEditingBasic(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* =========================================================================
          TOP HERO COVER & BUSINESS IDENTITY CARD
         ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        {/* Cover Image with Camera Edit Badge */}
        <div className="relative h-48 sm:h-60 w-full bg-slate-900 overflow-hidden">
          <img
            src={business.coverImage}
            alt={business.name}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

          {/* Change Cover Button */}
          <button
            type="button"
            onClick={() => alert('Photo upload dialog: Select a new high-res cover banner for your storefront.')}
            className="absolute top-4 right-4 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 text-white text-xs font-semibold backdrop-blur-md border border-white/20 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Change Cover</span>
          </button>

          {/* Public Listing Link */}
          <button
            type="button"
            onClick={() => onNavigate('overview')}
            className="absolute bottom-4 right-4 px-3.5 py-1.5 rounded-xl bg-white/90 hover:bg-white text-slate-900 text-xs font-bold backdrop-blur-md border border-white/40 flex items-center gap-1.5 transition cursor-pointer shadow-sm"
          >
            <span>View Public Listing</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Business Identity Row */}
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-12 relative z-10">
          <div className="flex items-end gap-4">
            {/* Logo Avatar with Camera Upload Icon */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white p-1 shadow-md border-2 border-white shrink-0 overflow-hidden">
              <img
                src={business.logo}
                alt={business.name}
                className="w-full h-full object-cover rounded-xl"
              />
              <button
                type="button"
                onClick={() => alert('Logo upload dialog: Select a new square avatar logo.')}
                className="absolute bottom-1.5 right-1.5 w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition shadow-xs"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {business.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-extrabold">
                  {business.verificationStatus}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-600">
                {business.category} • {business.locationArea}
              </p>
              <p className="text-xs text-slate-500 mt-0.5 italic">
                "{business.tagline}"
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setIsEditingBasic(true)}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
            <button
              type="button"
              onClick={() => alert(`Copied storefront link: https://myarea24.in/biz/${business.id}`)}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub Navigation Tabs Bar */}
        <div className="px-6 border-t border-slate-100 overflow-x-auto no-scrollbar flex items-center gap-1 sm:gap-2">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'basic', label: 'Basic Information' },
            { id: 'location', label: 'Location' },
            { id: 'hours', label: 'Operating Hours' },
            { id: 'photos', label: 'Photos & Media' },
            { id: 'details', label: 'Business Details' },
            { id: 'verification', label: 'Verification' },
            { id: 'preview', label: 'Preview' },
          ].map((tab) => {
            const active = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`px-3 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition cursor-pointer ${
                  active
                    ? 'border-purple-600 text-purple-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Profile changes saved successfully! Updates are now live on MyArea24.</span>
        </div>
      )}

      {/* =========================================================================
          TWO-COLUMN MAIN CONTENT (Left: Information Cards | Right: Side Panels)
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Basic Info + Location + Operating Hours (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Basic Information */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-extrabold text-slate-900">Basic Information</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingBasic((v) => !v)}
                className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>{isEditingBasic ? 'Cancel' : 'Edit'}</span>
              </button>
            </div>

            {isEditingBasic ? (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Business Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-600 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-600 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Short Description / Tagline</label>
                  <textarea
                    rows={2}
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-600 font-semibold"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-600 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-600 font-semibold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Website</label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-600 font-semibold"
                  />
                </div>
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveBasic}
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Business Name</span>
                  <p className="font-bold text-slate-900 mt-0.5">{business.name}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Category</span>
                  <p className="font-bold text-slate-900 mt-0.5">{business.category}</p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400 font-medium">Short Description</span>
                  <p className="font-medium text-slate-700 mt-0.5 leading-relaxed">
                    A cozy café serving fresh coffee, delicious food and a warm, friendly atmosphere.
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Phone Number</span>
                  <p className="font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                    📞 {business.phone}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Email Address</span>
                  <p className="font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                    ✉️ {business.email}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400 font-medium">Website</span>
                  <p className="font-bold text-indigo-600 mt-0.5 flex items-center gap-1">
                    🌐 {business.website}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Location & Interactive Map Preview */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-extrabold text-slate-900">Location</h3>
              </div>
              <button
                type="button"
                onClick={() => alert('Pin Location on Map: Open interactive GPS map pin selector.')}
                className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div className="space-y-3">
                <div>
                  <span className="text-slate-400 font-medium">Address</span>
                  <p className="font-bold text-slate-900 mt-0.5">{business.fullAddress}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Landmark</span>
                  <p className="font-semibold text-slate-700 mt-0.5">{business.landmark}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Map Location</span>
                  <p className="font-bold text-indigo-600 mt-0.5 cursor-pointer hover:underline">
                    📍 View on Map
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Service Area</span>
                  <p className="font-semibold text-slate-700 mt-0.5">{business.serviceArea}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Directions</span>
                  <p className="font-semibold text-slate-700 mt-0.5">Available on MyArea24</p>
                </div>
              </div>

              {/* Visual Map Mockup Box with POI markers */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-[#E8ECEF] min-h-[170px] flex flex-col justify-between p-3 shadow-inner">
                {/* Simulated Road Map SVG Grid */}
                <div className="absolute inset-0 opacity-40 pointer-events-none">
                  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <line x1="0" y1="40" x2="300" y2="40" stroke="#CBD5E1" strokeWidth="8" />
                    <line x1="80" y1="0" x2="80" y2="200" stroke="#CBD5E1" strokeWidth="8" />
                    <line x1="0" y1="130" x2="300" y2="130" stroke="#FBBF24" strokeWidth="6" />
                    <line x1="200" y1="0" x2="200" y2="200" stroke="#CBD5E1" strokeWidth="10" />
                  </svg>
                </div>

                <div className="relative z-10 flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-white/90 text-slate-800 text-[10px] font-extrabold shadow-xs">
                    Rohini Sector 9
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                    GPS 28.7144° N, 77.1197° E
                  </span>
                </div>

                {/* Central Pin */}
                <div className="relative z-10 self-center flex flex-col items-center">
                  <div className="px-2 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-extrabold shadow-md flex items-center gap-1 animate-bounce">
                    <Store className="w-3 h-3" />
                    <span>The Daily Brew</span>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-rose-600 ring-4 ring-rose-200 mt-0.5" />
                </div>

                <div className="relative z-10 flex items-center justify-between">
                  <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[9px] font-bold">
                    Rohini West Metro Station (M)
                  </span>
                  <a
                    href="https://maps.google.com/?q=Rohini+Sector+9+Delhi"
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-800 font-bold text-[10px] shadow-xs flex items-center gap-1"
                  >
                    <span>Open in Maps</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Operating Hours */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-extrabold text-slate-900">Operating Hours</h3>
              </div>
              <button
                type="button"
                onClick={() => alert('Operating Hours Editor: Configure weekly opening & closing hours.')}
                className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Set your regular business hours and special holiday hours.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs">
              {[
                { day: 'Mon', time: '9:00 AM – 11:00 PM' },
                { day: 'Tue', time: '9:00 AM – 11:00 PM' },
                { day: 'Wed', time: '9:00 AM – 11:00 PM' },
                { day: 'Thu', time: '9:00 AM – 11:00 PM' },
                { day: 'Fri', time: '9:00 AM – 12:00 AM' },
                { day: 'Sat', time: '9:00 AM – 12:00 AM' },
                { day: 'Sun', time: '9:00 AM – 11:00 PM' },
              ].map((item) => (
                <div key={item.day} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="block font-bold text-slate-800">{item.day}</span>
                  <span className="block text-[10px] text-slate-500 mt-1 leading-tight">{item.time}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                <div>
                  <span className="font-bold text-slate-800">Special Hours</span>
                  <p className="text-[11px] text-slate-400">No special hours added</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => alert('Add Special Hours: Set festive or holiday timings.')}
                className="text-xs font-bold text-purple-600 hover:text-purple-700"
              >
                + Add Special Hours
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Verification Status + Profile Completion + Quick Actions (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Box 1: Verification Status Card */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                Verification Status
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-extrabold">
                Under Review
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-4">
              Submitted on 12 May 2025. Your business details are submitted for verification.
            </p>

            {/* Timeline Progress */}
            <div className="space-y-3 relative text-xs">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Submitted</p>
                  <p className="text-[10px] text-slate-400">12 May 2025</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 animate-pulse">
                  <Clock className="w-3 h-3" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Under Review</p>
                  <p className="text-[10px] text-amber-600 font-semibold">In Progress by Area Lead</p>
                </div>
              </div>

              <div className="flex items-start gap-3 opacity-50">
                <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px]">3</span>
                </div>
                <div>
                  <p className="font-bold text-slate-700">Verified</p>
                  <p className="text-[10px] text-slate-400">Pending</p>
                </div>
              </div>

              <div className="flex items-start gap-3 opacity-50">
                <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px]">4</span>
                </div>
                <div>
                  <p className="font-bold text-slate-700">Live</p>
                  <p className="text-[10px] text-slate-400">Pending</p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
              <AlertCircle className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span>You'll be able to access all visibility features once verified.</span>
            </div>
          </div>

          {/* Box 2: Profile Completion Progress */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <h4 className="text-xs font-extrabold text-slate-900 mb-2">Profile Completion</h4>
            <div className="flex items-center gap-3 my-2">
              <div className="w-14 h-14 rounded-full bg-purple-50 border-4 border-purple-600 flex items-center justify-center shrink-0">
                <span className="text-sm font-extrabold text-purple-700">72%</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900">Almost there!</p>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Complete your profile to get more visibility and attract more customers.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => alert('Missing items:\n• Add 3 more interior store photos\n• Add FSSAI / Trade License Certificate')}
              className="w-full mt-2 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>View Missing Details</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Box 3: Quick Actions */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-extrabold text-slate-900">Quick Actions</h4>
              <button
                type="button"
                onClick={() => onNavigate('overview')}
                className="text-xs font-bold text-purple-600 hover:text-purple-700"
              >
                View All &gt;
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => onOpenQuickAction('add_offer')}
                className="p-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold flex flex-col items-center gap-1.5 transition cursor-pointer"
              >
                <Tag className="w-4 h-4 text-rose-600" />
                <span>Create Offer</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenQuickAction('create_post')}
                className="p-3 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold flex flex-col items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-4 h-4 text-purple-600" />
                <span>Create Post</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenQuickAction('create_event')}
                className="p-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold flex flex-col items-center gap-1.5 transition cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>Create Event</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('products')}
                className="p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold flex flex-col items-center gap-1.5 transition cursor-pointer"
              >
                <Package className="w-4 h-4 text-blue-600" />
                <span>Add Product</span>
              </button>
            </div>
          </div>

          {/* Box 4: Business Preview */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-5 rounded-3xl text-white shadow-md">
            <h4 className="text-xs font-extrabold text-white mb-1">Business Preview</h4>
            <p className="text-[11px] text-purple-200 leading-tight mb-3">
              See how your business appears to customers on MyArea24.
            </p>
            <div className="rounded-xl overflow-hidden mb-3 border border-white/20">
              <img
                src={business.coverImage}
                alt="preview"
                className="w-full h-24 object-cover"
              />
            </div>
            <button
              type="button"
              onClick={() => onNavigate('overview')}
              className="w-full py-2 rounded-xl bg-white text-slate-950 font-bold text-xs hover:bg-purple-50 transition cursor-pointer"
            >
              View Public Listing →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
