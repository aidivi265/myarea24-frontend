import React, { useState, useEffect } from 'react';
import { MerchantBusinessInfo } from '../types';
import {
  Settings,
  User,
  Store,
  Globe,
  Bell,
  Lock,
  Link as LinkIcon,
  CreditCard,
  Trash2,
  Download,
  AlertTriangle,
  CheckCircle2,
  Save,
  Check,
  Edit2,
  X,
  ShieldCheck,
  KeyRound,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import {
  getMerchantSettings,
  updateMerchantSettings,
  updateStorefrontProfile,
  changeMerchantPassword,
  toggleMerchant2FA,
  exportMerchantData,
  deactivateMerchantAccount,
  deleteMerchantAccountPermanently,
  MerchantSettingsPayload,
} from '../services/merchantApiService';

interface MerchantSettingsDashboardProps {
  business: MerchantBusinessInfo;
  onUpdateBusiness: (updated: Partial<MerchantBusinessInfo>) => void;
}

export function MerchantSettingsDashboard({
  business,
  onUpdateBusiness,
}: MerchantSettingsDashboardProps) {
  // 1. Profile state
  const [profileForm, setProfileForm] = useState({
    ownerName: business.ownerName || 'Store Owner',
    phone: business.phone || '',
    email: business.email || '',
  });

  // 2. Business details edit modal state
  const [bizModalOpen, setBizModalOpen] = useState(false);
  const [bizForm, setBizForm] = useState({
    name: business.name || '',
    category: business.category || '',
    tagline: business.tagline || '',
    fullAddress: business.fullAddress || '',
    serviceArea: business.serviceArea || '',
    phone: business.phone || '',
    email: business.email || '',
    website: business.website || '',
  });

  // 3. Password change modal state
  const [pwModalOpen, setPwModalOpen] = useState(false);
  const [pwForm, setPwForm] = useState({ oldPin: '', newPin: '', confirmPin: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  // 4. Notifications state
  const [notifications, setNotifications] = useState({
    enquiries: true,
    reviews: true,
    promotions: true,
    billing: true,
    queries: true,
    updates: false,
  });

  // 5. Preferences state
  const [preferences, setPreferences] = useState({
    language: 'English',
    timezone: '(GMT +5:30) India Standard Time',
    dateFormat: 'DD MMM YYYY (e.g. 30 Apr 2026)',
    currency: 'INR (₹)',
    measurement: 'Metric (km, m, °C)',
  });

  // 6. Security & Integrations state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [lastPasswordChange, setLastPasswordChange] = useState('Recently');
  const [integrations, setIntegrations] = useState({
    googleBusinessConnected: true,
    whatsAppConnected: Boolean(business.phone),
  });

  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Load live settings from backend on mount
  useEffect(() => {
    let isMounted = true;
    getMerchantSettings().then((res) => {
      if (res && isMounted) {
        if (res.notifications) setNotifications(res.notifications);
        if (res.preferences) setPreferences((prev) => ({ ...prev, ...res.preferences }));
        if (res.security) {
          setTwoFactorEnabled(res.security.twoFactorEnabled);
          setLastPasswordChange(res.security.lastPasswordChange);
        }
        if (res.integrations) setIntegrations(res.integrations);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 3500);
  };

  // Profile Save
  const handleUpdateProfile = async () => {
    const updated = {
      ownerName: profileForm.ownerName,
      phone: profileForm.phone,
      email: profileForm.email,
    };
    onUpdateBusiness(updated);
    await updateStorefrontProfile(updated);
    showStatus('Owner profile details updated and synced to backend!');
  };

  // Business Details Save
  const handleSaveBusinessInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      name: bizForm.name,
      category: bizForm.category,
      tagline: bizForm.tagline,
      fullAddress: bizForm.fullAddress,
      serviceArea: bizForm.serviceArea,
      phone: bizForm.phone,
      email: bizForm.email,
      website: bizForm.website,
    };
    onUpdateBusiness(updated);
    await updateStorefrontProfile(updated);
    setBizModalOpen(false);
    showStatus('Business storefront info updated across citizen & merchant portals!');
  };

  // Preferences Save
  const handleSavePreferences = async () => {
    await updateMerchantSettings({ preferences });
    showStatus('System preferences and locale saved successfully!');
  };

  // Notification Toggle
  const handleToggleNotification = async (key: keyof typeof notifications) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    await updateMerchantSettings({ notifications: updated });
    showStatus(`Notification for ${key} ${updated[key] ? 'enabled' : 'disabled'}.`);
  };

  // Password / PIN Submit
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    if (pwForm.newPin.length < 4) {
      setPwError('New PIN/Password must be at least 4 digits long.');
      return;
    }
    if (pwForm.newPin !== pwForm.confirmPin) {
      setPwError('New PIN and confirmation PIN do not match.');
      return;
    }
    setPwLoading(true);
    const result = await changeMerchantPassword(pwForm.newPin, pwForm.oldPin);
    setPwLoading(false);
    if (result.success) {
      setPwModalOpen(false);
      setPwForm({ oldPin: '', newPin: '', confirmPin: '' });
      setLastPasswordChange('Just now');
      showStatus('Security PIN / Password changed successfully!');
    } else {
      setPwError(result.message);
    }
  };

  // 2FA Toggle
  const handleToggle2FA = async () => {
    const nextVal = !twoFactorEnabled;
    const res = await toggleMerchant2FA(nextVal, business.phone);
    if (res.success) {
      setTwoFactorEnabled(nextVal);
      showStatus(res.message);
    } else {
      showStatus(res.message, 'error');
    }
  };

  // WhatsApp Business Toggle
  const handleToggleWhatsApp = async () => {
    const nextVal = !integrations.whatsAppConnected;
    const updated = { ...integrations, whatsAppConnected: nextVal };
    setIntegrations(updated);
    await updateMerchantSettings({ integrations: updated });
    showStatus(`WhatsApp Business ${nextVal ? 'connected' : 'disconnected'}.`);
  };

  // Download Data Export
  const handleDownloadData = async () => {
    setIsExporting(true);
    try {
      const data = await exportMerchantData();
      const blob = new Blob([JSON.stringify(data || business, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `myarea24_merchant_export_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showStatus('Merchant data exported as JSON archive!');
    } catch {
      showStatus('Failed to generate export file', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // Deactivate
  const handleDeactivate = async () => {
    const ok = window.confirm(
      'Are you sure you want to deactivate your storefront? Your listings will be temporarily hidden from citizens until reactivated.'
    );
    if (ok) {
      const res = await deactivateMerchantAccount();
      showStatus(res.message);
    }
  };

  // Delete
  const handleDeleteAccount = async () => {
    const ok = window.confirm(
      'WARNING: This will permanently delete your store, catalog, offers, and all order history. This action CANNOT be undone! Proceed?'
    );
    if (ok) {
      const res = await deleteMerchantAccountPermanently();
      alert(res.message);
      window.location.reload();
    }
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
              Merchant Settings & Control Center
            </h1>
            <p className="text-sm text-purple-200/90 leading-relaxed">
              Configure storefront credentials, operating preferences, security keys, and live integrations.
            </p>
          </div>

          <div className="hidden sm:flex flex-col items-end bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20">
            <span className="text-[10px] font-extrabold tracking-widest uppercase text-purple-200">
              Verified Control
            </span>
            <span className="text-base font-extrabold text-white mt-0.5">Zero-Commission MVP</span>
          </div>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 border transition ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
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
              {profileForm.ownerName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2) || 'MO'}
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
            className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition cursor-pointer shadow-xs"
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
              <button
                type="button"
                onClick={() => {
                  setBizForm({
                    name: business.name,
                    category: business.category,
                    tagline: business.tagline,
                    fullAddress: business.fullAddress,
                    serviceArea: business.serviceArea || '',
                    phone: business.phone,
                    email: business.email,
                    website: business.website || '',
                  });
                  setBizModalOpen(true);
                }}
                className="text-purple-600 hover:text-purple-700 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
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
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Service Area</span>
                <p className="font-semibold text-slate-800">{business.serviceArea || business.locationArea}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Operating Hours</span>
                <p className="font-semibold text-slate-800">Mon–Sun 9:00 AM – 10:00 PM</p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100 flex items-center justify-between">
            <span className="font-bold text-purple-900">Storefront Status</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-extrabold">
              Live & Synced
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
                >
                </input>
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
            className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition cursor-pointer shadow-xs"
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
            { key: 'enquiries', title: 'New Customer Enquiries', desc: 'Alerts when residents submit enquiries or contact store' },
            { key: 'reviews', title: 'Customer Reviews & Feedback', desc: 'Instant alerts on 1-5 star ratings and reviews' },
            { key: 'promotions', title: 'Promotion & Banner Performance', desc: 'Weekly digests on local billboard impressions and reach' },
            { key: 'billing', title: 'Orders & Settlements', desc: 'Order receipts and payment reconciliation digests' },
            { key: 'queries', title: 'Catalog Product Queries', desc: 'Direct questions on your listed catalog items' },
            { key: 'updates', title: 'System & Local Civic Announcements', desc: 'New merchant features and neighborhood advisories' },
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
                  onClick={() => handleToggleNotification(item.key as any)}
                  className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                    isChecked ? 'bg-purple-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      isChecked ? 'left-5' : 'left-1'
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
              <h4 className="font-extrabold text-slate-900">Security & Access</h4>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <div>
                <p className="font-bold text-slate-900">Store Login PIN / Password</p>
                <p className="text-[11px] text-slate-500">Last updated: {lastPasswordChange}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPwError(null);
                  setPwModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 font-bold text-purple-700 cursor-pointer"
              >
                Change PIN
              </button>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-bold text-slate-900">Two-Factor Authentication (2FA)</p>
                <p className="text-[11px] text-slate-500">Require OTP code for merchant portal access</p>
              </div>
              <button
                type="button"
                onClick={handleToggle2FA}
                className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition ${
                  twoFactorEnabled
                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {twoFactorEnabled ? 'Enabled ✓' : 'Enable 2FA'}
              </button>
            </div>
          </div>

          {/* Connected Integrations */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 text-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <LinkIcon className="w-4 h-4 text-purple-600" />
              <h4 className="font-extrabold text-slate-900">Connected Storefront Integrations</h4>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <div>
                <p className="font-bold text-slate-900">Google Business Profile</p>
                <p className="text-[11px] text-slate-500">Sync operating hours, photos, and ratings</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-[10px]">
                Connected ✓
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-bold text-slate-900">WhatsApp Business Direct</p>
                <p className="text-[11px] text-slate-500">Receive citizen orders directly on WhatsApp</p>
              </div>
              <button
                type="button"
                onClick={handleToggleWhatsApp}
                className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition ${
                  integrations.whatsAppConnected
                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                }`}
              >
                {integrations.whatsAppConnected ? 'Connected ✓' : 'Connect'}
              </button>
            </div>
          </div>

          {/* Account Actions */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2 text-xs">
            <h4 className="font-extrabold text-slate-900 mb-2">Account Actions</h4>
            <div
              onClick={handleDownloadData}
              className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-slate-50 cursor-pointer transition text-slate-700"
            >
              <span className="flex items-center gap-2 font-bold">
                <Download className="w-4 h-4 text-blue-600" />
                <span>{isExporting ? 'Generating JSON Package...' : 'Download My Data (JSON Export)'}</span>
              </span>
              <span className="text-purple-600 font-bold">&gt;</span>
            </div>
            <div
              onClick={handleDeactivate}
              className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-rose-50 cursor-pointer transition text-rose-600"
            >
              <span className="flex items-center gap-2 font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-500" /> Deactivate Storefront
              </span>
              <span className="font-bold">&gt;</span>
            </div>
            <div
              onClick={handleDeleteAccount}
              className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-rose-100/50 cursor-pointer transition text-rose-700"
            >
              <span className="flex items-center gap-2 font-bold">
                <Trash2 className="w-4 h-4 text-rose-600" /> Delete Account Permanently
              </span>
              <span className="font-bold">&gt;</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MODAL: EDIT BUSINESS INFORMATION
         ========================================================================= */}
      {bizModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Store className="w-5 h-5 text-purple-600" />
                <span>Edit Business Storefront</span>
              </h3>
              <button
                type="button"
                onClick={() => setBizModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBusinessInfo} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Business Name</label>
                <input
                  type="text"
                  required
                  value={bizForm.name}
                  onChange={(e) => setBizForm({ ...bizForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={bizForm.category}
                    onChange={(e) => setBizForm({ ...bizForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:outline-none focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Store Phone</label>
                  <input
                    type="text"
                    required
                    value={bizForm.phone}
                    onChange={(e) => setBizForm({ ...bizForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Full Commercial Address</label>
                <input
                  type="text"
                  required
                  value={bizForm.fullAddress}
                  onChange={(e) => setBizForm({ ...bizForm, fullAddress: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Service Area (Neighborhoods Served)</label>
                <input
                  type="text"
                  value={bizForm.serviceArea}
                  onChange={(e) => setBizForm({ ...bizForm, serviceArea: e.target.value })}
                  placeholder="e.g. Rohini Sector 10 and nearby areas"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Store Email</label>
                  <input
                    type="email"
                    value={bizForm.email}
                    onChange={(e) => setBizForm({ ...bizForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800 focus:outline-none focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Website URL</label>
                  <input
                    type="text"
                    value={bizForm.website}
                    onChange={(e) => setBizForm({ ...bizForm, website: e.target.value })}
                    placeholder="www.mystore.in"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800 focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setBizModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold cursor-pointer shadow-sm"
                >
                  Save Storefront Info
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CHANGE PASSWORD / PIN
         ========================================================================= */}
      {pwModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-indigo-600" />
                <span>Change Store PIN</span>
              </h3>
              <button
                type="button"
                onClick={() => setPwModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {pwError && (
              <div className="p-2.5 mb-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold">
                {pwError}
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Current PIN / Password (Optional)</label>
                <input
                  type="password"
                  value={pwForm.oldPin}
                  onChange={(e) => setPwForm({ ...pwForm, oldPin: e.target.value })}
                  placeholder="Enter current PIN"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">New 4 to 6 Digit PIN</label>
                <input
                  type="password"
                  required
                  value={pwForm.newPin}
                  onChange={(e) => setPwForm({ ...pwForm, newPin: e.target.value })}
                  placeholder="••••"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:border-purple-600 tracking-widest text-center text-base"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Confirm New PIN</label>
                <input
                  type="password"
                  required
                  value={pwForm.confirmPin}
                  onChange={(e) => setPwForm({ ...pwForm, confirmPin: e.target.value })}
                  placeholder="••••"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:border-purple-600 tracking-widest text-center text-base"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPwModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pwLoading}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {pwLoading ? 'Saving...' : 'Update PIN'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
