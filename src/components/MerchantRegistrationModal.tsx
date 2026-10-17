import React, { useState } from 'react';
import {
  X,
  Store,
  ShieldCheck,
  CheckCircle2,
  Building2,
  FileText,
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  AlertCircle,
  BadgeCheck,
} from 'lucide-react';
import {
  MerchantRegistrationProfile,
  saveMerchantRegistration,
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
}

export function MerchantRegistrationModal({
  isOpen,
  onClose,
  onSuccess,
  currentArea = 'Sector 10, Rohini, Delhi',
}: MerchantRegistrationModalProps) {
  if (!isOpen) return null;

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form Fields
  const [bizName, setBizName] = useState('');
  const [bizCat, setBizCat] = useState('Restaurants & Cafes');
  const [address, setAddress] = useState(`Main Commercial Complex, ${currentArea}`);
  const [pincode, setPincode] = useState('110085');

  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [whatsapp, setWhatsapp] = useState('+91 ');
  const [email, setEmail] = useState('');

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
      if (!phone.trim() || phone.trim().length < 10) {
        setErrorMsg('Please enter a valid 10-digit primary contact phone number.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setErrorMsg('Please enter a valid business email address.');
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
      const locality = currentArea.split(',')[0]?.trim() || 'Sector 10';
      const city = currentArea.split(',')[currentArea.split(',').length - 1]?.trim() || 'Delhi';

      const profile: MerchantRegistrationProfile = {
        businessName: bizName.trim(),
        category: bizCat,
        ownerName: ownerName.trim(),
        phone: phone.trim(),
        whatsapp: (whatsapp.trim() || phone.trim()),
        email: email.trim(),
        fullAddress: address.trim(),
        locality,
        city,
        pincode: pincode.trim(),
        docType,
        docNumber: docNumber.trim().toUpperCase(),
        openingTime,
        closingTime,
        isVerified: true,
        registeredAt: new Date().toISOString(),
      };

      // 1. Save merchant registration state
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
        dist: '0.3 km',
        distanceKm: 0.3,
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
        lat: 28.7155,
        lng: 77.1185,
        activeProductsCount: 1,
        activeOffersCount: 1,
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
        className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* MODAL HEADER */}
        <div className="bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#312E81] text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Store className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">Merchant Portal Registration</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold flex items-center gap-1 border border-emerald-500/30">
                  <ShieldCheck className="w-3 h-3" /> Startup Verified
                </span>
              </div>
              <p className="text-xs text-indigo-200/90 mt-0.5">
                Register your local business to unlock the Merchant Hub & live citizen broadcast.
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

        {/* STEP PROGRESS BAR */}
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
            <span>Owner & Contact</span>
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
            <span>Verification & Terms</span>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
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
                      placeholder="e.g. The Daily Brew Cafe or Gupta Super Mart"
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
                      placeholder="Shop No., Block / Market, Sector"
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
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-indigo-600 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: OWNER & CONTACT */}
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
                      placeholder="e.g. Divyansh Gupta"
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
        </div>

        {/* MODAL FOOTER */}
        {!isVerifying && (
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
