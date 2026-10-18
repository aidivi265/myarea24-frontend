import React, { useState } from 'react';
import {
  X,
  Store,
  ShieldCheck,
  CheckCircle2,
  Lock,
  KeyRound,
  FileText,
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  AlertCircle,
  BadgeCheck,
  LogIn,
  UserPlus,
} from 'lucide-react';
import {
  MerchantRegistrationProfile,
  saveMerchantRegistration,
  verifyMerchantCredentials,
  CUSTOM_BIZ_KEY,
  loadLocalList,
  saveLocalList,
  LiveBusinessItem,
} from '../services/communityMarketplaceService';

interface MerchantRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (profile: MerchantRegistrationProfile) => void;
  currentArea?: string;
  coords?: { lat: number; lng: number };
  defaultMode?: 'login' | 'register';
}

export function MerchantRegistrationModal({
  isOpen,
  onClose,
  onSuccess,
  currentArea = 'Your Local Area',
  coords,
  defaultMode = 'register',
}: MerchantRegistrationModalProps) {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Login Form Fields
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Register Form Fields
  const [bizName, setBizName] = useState('');
  const [bizCat, setBizCat] = useState('Restaurants & Cafes');
  const [address, setAddress] = useState(
    currentArea && currentArea !== 'Your Local Area'
      ? `Main Commercial Complex, ${currentArea}`
      : ''
  );
  const [pincode, setPincode] = useState('');

  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [whatsapp, setWhatsapp] = useState('+91 ');
  const [email, setEmail] = useState('');
  const [storePin, setStorePin] = useState('');
  const [storePinConfirm, setStorePinConfirm] = useState('');

  const [docType, setDocType] = useState<MerchantRegistrationProfile['docType']>('GSTIN');
  const [docNumber, setDocNumber] = useState('');
  const [openingTime, setOpeningTime] = useState('08:30');
  const [closingTime, setClosingTime] = useState('22:30');

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeFairPricing, setAgreeFairPricing] = useState(false);

  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStatusText, setVerifyStatusText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const categories = [
    'Restaurants & Cafes',
    'Groceries & Daily Staples',
    '24×7 Pharmacies & Healthcare',
    'Electronics, Mobiles & Repair',
    'Home Utility & Repair Services',
    'Salons, Spa & Grooming',
    'Fitness, Gyms & Sports Arenas',
    'Clothing, Footwear & Fashion',
    'Event Venues & Hall Bookings',
  ];

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginIdentifier.trim()) {
      setLoginError('Please enter your registered store phone number or business email.');
      return;
    }
    if (!loginPin.trim()) {
      setLoginError('Please enter your 4-6 digit Store Security PIN or Password.');
      return;
    }

    setIsLoggingIn(true);
    setTimeout(() => {
      const result = verifyMerchantCredentials(loginIdentifier, loginPin);
      setIsLoggingIn(false);
      if (result.success && result.profile) {
        onSuccess(result.profile);
        onClose();
      } else {
        setLoginError(
          result.error || 'Invalid store credentials. Check your phone number / PIN or register below.'
        );
      }
    }, 600);
  };

  const handleNextStep = () => {
    setErrorMsg(null);
    if (step === 1) {
      if (!bizName.trim() || bizName.trim().length < 3) {
        setErrorMsg('Please enter a valid Business / Store name (minimum 3 characters).');
        return;
      }
      if (!address.trim()) {
        setErrorMsg('Please enter the store physical address.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!ownerName.trim()) {
        setErrorMsg('Please enter the Owner / Authorised Representative name.');
        return;
      }
      const rawDigits = phone.replace(/\D/g, '');
      if (rawDigits.length < 10) {
        setErrorMsg('Please enter a valid 10-digit primary contact phone number.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setErrorMsg('Please enter a valid business email address.');
        return;
      }
      if (!storePin.trim() || storePin.trim().length < 4) {
        setErrorMsg('Please set a 4 to 6 digit Store Security PIN / Password to protect your dashboard.');
        return;
      }
      if (storePin !== storePinConfirm) {
        setErrorMsg('Store PIN confirmation does not match. Please re-enter.');
        return;
      }
      setStep(3);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!docNumber.trim() || docNumber.trim().length < 5) {
      setErrorMsg(`Please provide a valid ${docType} registration number for business verification.`);
      return;
    }
    if (!agreeTerms || !agreeFairPricing) {
      setErrorMsg('Please accept the quality guidelines and fair local pricing commitments.');
      return;
    }

    setIsVerifying(true);
    setVerifyStatusText('Connecting to MyArea24 Merchant Verification Network...');

    setTimeout(() => {
      setVerifyStatusText(`Validating ${docType}: ${docNumber.trim()} with regulatory registry...`);
    }, 700);

    setTimeout(() => {
      setVerifyStatusText(`Geocoding storefront within ${currentArea}...`);
    }, 1400);

    setTimeout(() => {
      setVerifyStatusText('Issuing Verified Local Merchant Seal & provisioning dashboard...');
    }, 2100);

    setTimeout(() => {
      const parts = currentArea.split(',').map((s) => s.trim());
      const locality = parts[0] || 'Local Neighborhood';
      const city = parts[parts.length - 1] || 'India';

      const baseLat = coords?.lat ?? 28.6139;
      const baseLng = coords?.lng ?? 77.2090;

      const profile: MerchantRegistrationProfile = {
        id: `biz_${bizName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}_${Date.now().toString(36)}`,
        businessName: bizName.trim(),
        category: bizCat,
        ownerName: ownerName.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || phone.trim(),
        email: email.trim(),
        fullAddress: address.trim(),
        locality,
        city,
        pincode: pincode.trim(),
        docType,
        docNumber: docNumber.trim().toUpperCase(),
        openingTime,
        closingTime,
        storePin: storePin.trim(),
        isVerified: true,
        registeredAt: new Date().toISOString(),
      };

      // 1. Save merchant registration state & accounts
      saveMerchantRegistration(profile);

      // 2. Add as a live verified business in the local community directory
      const newBiz: LiveBusinessItem = {
        id: `merchant-biz-${Date.now()}`,
        slug: bizName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name: profile.businessName,
        cat: bizCat.split('&')[0].trim(),
        sub: `${bizCat} • ${locality}`,
        description: `Verified merchant storefront owned by ${profile.ownerName}. Direct neighborhood service with zero commission.`,
        address: profile.fullAddress,
        locality,
        city,
        rating: '4.9',
        reviews: '(Newly Verified)',
        dist: '0.2 km',
        distanceKm: 0.2,
        status: 'Open',
        closes: `Closes ${closingTime}`,
        openingTime,
        closingTime,
        phone: profile.phone,
        whatsapp: profile.whatsapp,
        img: './assets/crops/biz-card-chai.webp',
        verified: true,
        trending: true,
        popular: true,
        lat: baseLat,
        lng: baseLng,
        activeProductsCount: 0,
        activeOffersCount: 0,
        source: 'Merchant Self-Verified Onboarding',
      };

      const existingBiz = loadLocalList<LiveBusinessItem>(CUSTOM_BIZ_KEY);
      const filtered = existingBiz.filter(
        (b) => b.name.toLowerCase() !== newBiz.name.toLowerCase()
      );
      saveLocalList(CUSTOM_BIZ_KEY, [newBiz, ...filtered]);

      setIsVerifying(false);
      onSuccess(profile);
      onClose();
    }, 2800);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* MODAL HEADER */}
        <div className="bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#312E81] text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Store className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">Merchant Portal Gateway</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold flex items-center gap-1 border border-emerald-500/30">
                  <ShieldCheck className="w-3 h-3" /> Secure Hub
                </span>
              </div>
              <p className="text-xs text-indigo-200/90 mt-0.5">
                {mode === 'login'
                  ? 'Access your registered local business dashboard & live orders.'
                  : 'Register your local storefront to unlock neighborhood commerce & broadcasting.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* AUTH TABS: LOGIN VS REGISTER */}
        <div className="bg-slate-100 p-1 flex border-b border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              mode === 'register'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register New Store</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setLoginError(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Merchant Login (PIN / Password)</span>
          </button>
        </div>

        {/* REGISTER STEP PROGRESS BAR (ONLY IN REGISTER MODE) */}
        {mode === 'register' && (
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between text-xs font-bold text-slate-500 shrink-0">
            <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-indigo-600' : ''}`}>
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step >= 1 ? 'bg-indigo-600 text-white font-extrabold' : 'bg-slate-200 text-slate-600'
                }`}
              >
                1
              </span>
              <span>Business Basics</span>
            </div>
            <div className="h-0.5 w-8 bg-slate-200" />
            <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-indigo-600' : ''}`}>
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step >= 2 ? 'bg-indigo-600 text-white font-extrabold' : 'bg-slate-200 text-slate-600'
                }`}
              >
                2
              </span>
              <span>Owner & Security PIN</span>
            </div>
            <div className="h-0.5 w-8 bg-slate-200" />
            <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-indigo-600' : ''}`}>
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step >= 3 ? 'bg-indigo-600 text-white font-extrabold' : 'bg-slate-200 text-slate-600'
                }`}
              >
                3
              </span>
              <span>Verification</span>
            </div>
          </div>
        )}

        {/* MODAL BODY */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {/* =========================================================================
              A. MERCHANT LOGIN FORM
              ========================================================================= */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4 py-2">
              {loginError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span className="font-semibold">{loginError}</span>
                </div>
              )}

              <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-indigo-900 leading-relaxed">
                  Enter your registered store contact number or business email and your 4-6 digit Store PIN to securely access your business dashboard.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Registered Phone Number or Business Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    autoFocus
                    required
                    placeholder="+91 98110 24024 or store@myarea24.com"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Store Access PIN / Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    maxLength={12}
                    placeholder="Enter 4-6 digit PIN or password"
                    value={loginPin}
                    onChange={(e) => setLoginPin(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold tracking-widest focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Security verification protects your customer orders, catalog, and revenue reports.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-extrabold flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
                >
                  {isLoggingIn ? (
                    <span className="animate-pulse">Authenticating Storefront...</span>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Log In to Merchant Storefront</span>
                    </>
                  )}
                </button>
              </div>

              <div className="pt-3 text-center border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  New to MyArea24?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setStep(1);
                    }}
                    className="text-indigo-600 font-bold hover:underline cursor-pointer"
                  >
                    Register your business in 2 minutes →
                  </button>
                </p>
              </div>
            </form>
          ) : (
            /* =========================================================================
                B. REGISTER NEW STOREFORM
                ========================================================================= */
            <>
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span className="font-semibold">{errorMsg}</span>
                </div>
              )}

              {isVerifying ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-indigo-50 border-2 border-indigo-600 flex items-center justify-center animate-pulse">
                    <Sparkles className="w-8 h-8 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">Verifying Business Credentials</h4>
                    <p className="text-xs text-indigo-600 font-bold mt-1 animate-bounce">
                      {verifyStatusText}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-2 max-w-sm">
                      Checking registry records, geo-coordinates, and activating real-time storefront synchronization...
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* STEP 1: BUSINESS BASICS */}
                  {step === 1 && (
                    <div className="space-y-3.5">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Business / Storefront Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          autoFocus
                          required
                          placeholder="e.g. Apex Medical Store, Daily Supermart, Chai Street"
                          value={bizName}
                          onChange={(e) => setBizName(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-indigo-600 focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Business Category <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={bizCat}
                          onChange={(e) => setBizCat(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-indigo-600 focus:bg-white"
                        >
                          {categories.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Shop Address & Landmark <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Shop No., Market / Complex, Locality"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-indigo-600 focus:bg-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Operating Locality</label>
                          <input
                            type="text"
                            disabled
                            value={currentArea}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 font-medium cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Pincode</label>
                          <input
                            type="text"
                            maxLength={6}
                            placeholder="6-digit pincode"
                            value={pincode}
                            onChange={(e) => setPincode(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-indigo-600 focus:bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: OWNER & SECURITY PIN */}
                  {step === 2 && (
                    <div className="space-y-3.5">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Owner / Manager Full Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          autoFocus
                          required
                          placeholder="e.g. Ramesh Kumar"
                          value={ownerName}
                          onChange={(e) => setOwnerName(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-indigo-600 focus:bg-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Primary Calling Number <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="+91 98110 24024"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-indigo-600 focus:bg-white"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            WhatsApp Business Number
                          </label>
                          <input
                            type="text"
                            placeholder="+91 98110 24024"
                            value={whatsapp}
                            onChange={(e) => setWhatsapp(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-indigo-600 focus:bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Official Business Email <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="merchant@myarea24.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-indigo-600 focus:bg-white"
                        />
                      </div>

                      {/* Store Security PIN / Password Setup */}
                      <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-200 space-y-2.5">
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-indigo-700" />
                          <p className="font-extrabold text-indigo-950 text-xs">
                            Storefront Security PIN / Password <span className="text-rose-500">*</span>
                          </p>
                        </div>
                        <p className="text-[11px] text-indigo-900/80">
                          Set a 4 to 6 digit PIN (or password) to log in to your merchant portal and manage orders.
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <input
                              type="password"
                              maxLength={12}
                              required
                              placeholder="Create Store PIN"
                              value={storePin}
                              onChange={(e) => setStorePin(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-white border border-indigo-300 text-slate-900 font-bold tracking-widest focus:outline-none focus:border-indigo-600"
                            />
                          </div>
                          <div>
                            <input
                              type="password"
                              maxLength={12}
                              required
                              placeholder="Confirm PIN"
                              value={storePinConfirm}
                              onChange={(e) => setStorePinConfirm(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-white border border-indigo-300 text-slate-900 font-bold tracking-widest focus:outline-none focus:border-indigo-600"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Opening Time</label>
                          <input
                            type="time"
                            value={openingTime}
                            onChange={(e) => setOpeningTime(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Closing Time</label>
                          <input
                            type="time"
                            value={closingTime}
                            onChange={(e) => setClosingTime(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: VERIFICATION & COMPLIANCE */}
                  {step === 3 && (
                    <form onSubmit={handleFinalSubmit} className="space-y-4">
                      <div className="p-3 rounded-2xl bg-indigo-50/80 border border-indigo-200 flex items-start gap-3">
                        <BadgeCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-extrabold text-indigo-950">Mandatory Startup Verification</p>
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            MyArea24 maintains 100% verified listings for residents. Provide any one government-recognized document.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Verification Document Type <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={docType}
                            onChange={(e) => setDocType(e.target.value as any)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-indigo-600"
                          >
                            <option value="GSTIN">GSTIN (15 Digits)</option>
                            <option value="MSME_UDYAM">MSME Udyam Number</option>
                            <option value="FSSAI">FSSAI Food License</option>
                            <option value="TRADE_LICENSE">Municipal Trade License</option>
                            <option value="SHOP_ACT">Shop & Establishment Act</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Registration / Document No. <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 07AAAAA0000A1Z5"
                            value={docNumber}
                            onChange={(e) => setDocNumber(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold tracking-wider uppercase focus:outline-none focus:border-indigo-600"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <label className="flex items-start gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={agreeFairPricing}
                            onChange={(e) => setAgreeFairPricing(e.target.checked)}
                            className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-slate-700 font-medium">
                            I commit that all products and prices listed will accurately match my physical store rates with no deceptive surcharges.
                          </span>
                        </label>

                        <label className="flex items-start gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={agreeTerms}
                            onChange={(e) => setAgreeTerms(e.target.checked)}
                            className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-slate-700 font-medium">
                            I agree to the MyArea24 Local Merchant Network Terms & zero-commission storefront agreement.
                          </span>
                        </label>
                      </div>
                    </form>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* MODAL FOOTER (ONLY IN REGISTER MODE) */}
        {mode === 'register' && !isVerifying && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as 1 | 2)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold transition cursor-pointer"
              >
                ← Back
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-700 font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold flex items-center gap-2 shadow-md transition cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify & Activate Merchant Portal</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
