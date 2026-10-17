import React, { useState } from 'react';
import { MerchantBusinessInfo } from '../types';
import {
  Settings,
  User,
  Store,
  Globe,
  Bell,
  Lock,
  Link,
  CreditCard,
  Trash2,
  Download,
  AlertTriangle,
  CheckCircle2,
  Save,
  Check,
} from 'lucide-react';

interface MerchantSettingsDashboardProps {
  business: MerchantBusinessInfo;
  onUpdateBusiness: (updated: Partial<MerchantBusinessInfo>) => void;
}

export function MerchantSettingsDashboard({
  business,
  onUpdateBusiness,
}: MerchantSettingsDashboardProps) {
  const [profileForm, setProfileForm] = useState({
    ownerName: business.ownerName,
    phone: business.phone,
    email: business.email,
  });

  const [notifications, setNotifications] = useState({
    enquiries: true,
    reviews: true,
    promotions: true,
    billing: true,
    queries: true,
    updates: false,
  });

  const [preferences, setPreferences] = useState({
    language: 'English',
    timezone: '(GMT +5:30) India Standard Time',
    dateFormat: 'DD MMM YYYY (e.g. 30 Apr 2025)',
    currency: 'INR (₹)',
    measurement: 'Metric (km, m, °C)',
  });

  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleUpdateProfile = () => {
    onUpdateBusiness({
      ownerName: profileForm.ownerName,
      phone: profileForm.phone,
      email: profileForm.email,
    });
    setStatusMsg('Profile settings updated successfully!');
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleSavePreferences = () => {
    setStatusMsg('Preferences saved!');
    setTimeout(() => setStatusMsg(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* =========================================================================
          HERO BANNER
         ========================================================================= */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#1E124A] via-[#2F156B] to-[#461F92] p-6 sm:p-8 text-white overflow-hidden shadow-xl border border-indigo-900/30">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="max-w-xl">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
              Settings
            </h1>
            <p className="text-sm text-purple-200/90 leading-relaxed">
              Manage your profile, business details, preferences and more — all in one place.
            </p>
          </div>

          <div className="hidden sm:flex flex-col items-end bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20">
            <span className="text-[10px] font-extrabold tracking-widest uppercase text-purple-200">
              Your Business
            </span>
            <span className="text-base font-extrabold text-white mt-0.5">Your Control</span>
          </div>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* =========================================================================
          ROW 1: PROFILE SETTINGS + BUSINESS INFORMATION + PREFERENCES
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 text-xs">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 font-extrabold text-sm flex items-center justify-center shrink-0">
              RS
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-extrabold text-slate-900">{profileForm.ownerName}</h4>
                <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 text-[9px] font-extrabold">
                  Verified Merchant
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Owner — {business.name}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-slate-500 font-bold mb-1">Full Name</label>
              <input
                type="text"
                value={profileForm.ownerName}
                onChange={(e) => setProfileForm({ ...profileForm, ownerName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 focus:outline-none focus:border-purple-600"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-bold mb-1">Phone Number</label>
              <input
                type="text"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 focus:outline-none focus:border-purple-600"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-bold mb-1">Email Address</label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 focus:outline-none focus:border-purple-600"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleUpdateProfile}
            className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition cursor-pointer shadow-xs"
          >
            Update Profile
          </button>
        </div>

        {/* Business Information */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 text-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-purple-600" />
                <h4 className="font-extrabold text-slate-900">Business Information</h4>
              </div>
              <button type="button" className="text-purple-600 font-bold">
                Edit
              </button>
            </div>

            <div className="space-y-2.5">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Business Name</span>
                <p className="font-bold text-slate-900">{business.name}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Category</span>
                <p className="font-semibold text-slate-800">{business.category}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Address</span>
                <p className="font-semibold text-slate-800 leading-tight">{business.fullAddress}</p>
                <span className="text-indigo-600 text-[10px] font-bold cursor-pointer">📍 View on Map</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Operating Hours</span>
                <p className="font-semibold text-slate-800">Mon–Sun 9:00 AM – 11:00 PM</p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100 flex items-center justify-between">
            <span className="font-bold text-purple-900">Public Profile Active</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-extrabold">
              Live
            </span>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 text-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-3">
              <Globe className="w-4 h-4 text-indigo-600" />
              <h4 className="font-extrabold text-slate-900">Preferences</h4>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-500 font-bold mb-1">Display Language</label>
                <select
                  value={preferences.language}
                  onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 focus:outline-none"
                >
                  <option>English</option>
                  <option>हिन्दी (Hindi)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-500 font-bold mb-1">Time Zone</label>
                <input
                  type="text"
                  disabled
                  value={preferences.timezone}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-bold mb-1">Currency</label>
                <input
                  type="text"
                  disabled
                  value={preferences.currency}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 font-medium"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSavePreferences}
            className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition cursor-pointer shadow-xs"
          >
            Save Preferences
          </button>
        </div>
      </div>

      {/* =========================================================================
          ROW 2: NOTIFICATIONS + SECURITY + CONNECTED INTEGRATIONS + ACTIONS
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Notifications (6 cols) */}
        <div className="lg:col-span-6 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 text-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-2">
            <Bell className="w-4 h-4 text-purple-600" />
            <h4 className="font-extrabold text-slate-900">Notifications</h4>
          </div>

          {[
            { key: 'enquiries', title: 'New Enquiries', desc: 'Get notified when you receive a new customer enquiry' },
            { key: 'reviews', title: 'Customer Reviews', desc: 'Get notified for new ratings and reviews' },
            { key: 'promotions', title: 'Promotion Performance', desc: 'Weekly digests on your active ads and reach' },
            { key: 'billing', title: 'Payments & Billing', desc: 'Invoices, renewals, and billing receipt alerts' },
            { key: 'queries', title: 'Product/Service Queries', desc: 'Direct questions on your listed catalog items' },
            { key: 'updates', title: 'System Updates', desc: 'New merchant features and area announcements' },
          ].map((item) => {
            const isChecked = notifications[item.key as keyof typeof notifications];
            return (
              <div key={item.key} className="flex items-center justify-between py-1.5">
                <div>
                  <p className="font-bold text-slate-900">{item.title}</p>
                  <p className="text-[11px] text-slate-500">{item.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setNotifications({
                      ...notifications,
                      [item.key]: !isChecked,
                    })
                  }
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                    isChecked ? 'bg-purple-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                      isChecked ? 'left-4.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>

        {/* Security & Integrations & Actions (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Security Box */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 text-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Lock className="w-4 h-4 text-indigo-600" />
              <h4 className="font-extrabold text-slate-900">Security</h4>
            </div>

            <div className="flex items-center justify-between py-1">
              <div>
                <p className="font-bold text-slate-900">Change Password</p>
                <p className="text-[11px] text-slate-500">Update your merchant portal password regularly</p>
              </div>
              <button
                type="button"
                onClick={() => alert('Change Password dialog')}
                className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700"
              >
                Change
              </button>
            </div>

            <div className="flex items-center justify-between py-1">
              <div>
                <p className="font-bold text-slate-900">Two-Factor Authentication (2FA)</p>
                <p className="text-[11px] text-slate-500">Add an extra SMS/OTP layer of protection</p>
              </div>
              <button
                type="button"
                onClick={() => alert('2FA enabled via registered mobile!')}
                className="px-3 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 font-bold text-purple-700"
              >
                Enable
              </button>
            </div>
          </div>

          {/* Connected Integrations */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 text-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Link className="w-4 h-4 text-purple-600" />
              <h4 className="font-extrabold text-slate-900">Connected Integrations</h4>
            </div>

            <div className="flex items-center justify-between py-1">
              <div>
                <p className="font-bold text-slate-900">Google Business Profile</p>
                <p className="text-[11px] text-slate-500">Sync hours, reviews, and storefront info</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-[10px]">
                Connected ✓
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <div>
                <p className="font-bold text-slate-900">WhatsApp Business</p>
                <p className="text-[11px] text-slate-500">Receive customer enquiries directly on WhatsApp</p>
              </div>
              <button
                type="button"
                onClick={() => alert('WhatsApp Business webhook connected!')}
                className="px-3 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 font-bold text-purple-700"
              >
                Connect
              </button>
            </div>
          </div>

          {/* Account Actions */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2 text-xs">
            <h4 className="font-extrabold text-slate-900 mb-2">Account Actions</h4>
            <div className="flex items-center justify-between py-1 text-slate-700">
              <span className="flex items-center gap-2">
                <Download className="w-4 h-4 text-blue-600" /> Download My Data
              </span>
              <span className="text-purple-600 font-bold cursor-pointer">&gt;</span>
            </div>
            <div className="flex items-center justify-between py-1 text-rose-600">
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Deactivate Account
              </span>
              <span className="font-bold cursor-pointer">&gt;</span>
            </div>
            <div className="flex items-center justify-between py-1 text-rose-700">
              <span className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> Delete Account Permanently
              </span>
              <span className="font-bold cursor-pointer">&gt;</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
