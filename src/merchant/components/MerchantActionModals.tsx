import React, { useState } from 'react';
import {
  MerchantProductItem,
  MerchantServiceItem,
  MerchantOfferItem,
  MerchantPostItem,
  MerchantEventItem,
  MerchantPromotionItem,
} from '../types';
import {
  X,
  Package,
  Wrench,
  Tag,
  FileText,
  Calendar,
  Sparkles,
  Share2,
  Check,
  Megaphone,
} from 'lucide-react';

interface MerchantActionModalsProps {
  modalType: string | null;
  onClose: () => void;
  onAddProduct: (prod: MerchantProductItem) => void;
  onAddService: (srv: MerchantServiceItem) => void;
  onAddOffer: (offer: MerchantOfferItem) => void;
  onAddPost: (post: MerchantPostItem) => void;
  onAddEvent: (event: MerchantEventItem) => void;
  onAddPromotion: (promo: MerchantPromotionItem) => void;
  businessName: string;
}

export function MerchantActionModals({
  modalType,
  onClose,
  onAddProduct,
  onAddService,
  onAddOffer,
  onAddPost,
  onAddEvent,
  onAddPromotion,
  businessName,
}: MerchantActionModalsProps) {
  if (!modalType) return null;

  // Form states
  const [prodForm, setProdForm] = useState({
    name: '',
    category: 'Beverages' as MerchantProductItem['category'],
    price: 150,
    description: '',
  });

  const [srvForm, setSrvForm] = useState({
    name: '',
    category: 'Event Services',
    priceText: 'Starting from ₹1,000',
    description: '',
  });

  const [offerForm, setOfferForm] = useState({
    title: '',
    description: '',
    type: 'Discount' as MerchantOfferItem['type'],
    discountText: '20% OFF',
    code: 'SAVE20',
    validityDays: 14,
  });

  const [postForm, setPostForm] = useState({
    title: '',
    caption: '',
    type: 'Announcement' as MerchantPostItem['type'],
  });

  const [eventForm, setEventForm] = useState({
    title: '',
    category: 'Music' as MerchantEventItem['category'],
    venue: 'The Daily Brew, Rohini',
    dateDisplay: '28 May 2025, 07:00 PM',
    description: '',
  });

  const [promoForm, setPromoForm] = useState({
    title: '',
    type: 'Special Offer' as MerchantPromotionItem['type'],
    budget: 500,
  });

  const [copiedReviewLink, setCopiedReviewLink] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const getProductImage = (cat: string) => {
    switch (cat) {
      case 'Groceries':
        return './assets/crops/prod-arhar-dal.webp';
      case 'Desserts':
        return './assets/crops/offer-lapinoz.webp';
      case 'Beverages':
        return './assets/crops/biz-urban-chai.webp';
      case 'Fuel':
        return './assets/crops/store-apna-mart.webp';
      default:
        return './assets/crops/prod-atta.webp';
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden text-xs"
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-[#1E124A] to-[#3B1F8C] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              {modalType.includes('product') ? (
                <Package className="w-4 h-4 text-purple-200" />
              ) : modalType.includes('service') ? (
                <Wrench className="w-4 h-4 text-indigo-200" />
              ) : modalType.includes('offer') ? (
                <Tag className="w-4 h-4 text-rose-200" />
              ) : modalType.includes('event') ? (
                <Calendar className="w-4 h-4 text-purple-200" />
              ) : modalType.includes('post') ? (
                <FileText className="w-4 h-4 text-purple-200" />
              ) : (
                <Sparkles className="w-4 h-4 text-amber-200" />
              )}
            </span>
            <div>
              <h3 className="font-extrabold text-sm text-white capitalize">
                {modalType.replace(/_/g, ' ')}
              </h3>
              <p className="text-[10px] text-purple-200">{businessName} • Live Area Network</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/20 text-white/80 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold text-[11px]">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Form 1: Add Product */}
          {modalType.includes('product') && (
            <div className="space-y-3">
              <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-100 text-purple-900 text-[11px] leading-relaxed">
                ⚡ <strong>Live Global Synchronization:</strong> When added, this product will immediately publish to citizen search, price comparison, and local store inventory with verified savings.
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Product Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vanilla Bean Cold Brew (300ml)"
                  value={prodForm.name}
                  onChange={(e) => {
                    setErrorMsg(null);
                    setProdForm({ ...prodForm, name: e.target.value });
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:border-purple-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={prodForm.category}
                    onChange={(e) => setProdForm({ ...prodForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none"
                  >
                    <option value="Beverages">Beverages</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Groceries">Groceries</option>
                    <option value="Fuel">Fuel</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Store Price (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={prodForm.price}
                    onChange={(e) => {
                      setErrorMsg(null);
                      setProdForm({ ...prodForm, price: Number(e.target.value) });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Freshness</label>
                <textarea
                  rows={2}
                  placeholder="Freshly prepared, in-stock for immediate pickup or delivery..."
                  value={prodForm.description}
                  onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!prodForm.name.trim() || prodForm.name.trim().length < 2) {
                    setErrorMsg('Please enter a valid product name (minimum 2 characters).');
                    return;
                  }
                  if (!prodForm.price || prodForm.price <= 0) {
                    setErrorMsg('Product price must be greater than ₹0.');
                    return;
                  }

                  onAddProduct({
                    id: `prod-${Date.now()}`,
                    name: prodForm.name.trim(),
                    category: prodForm.category,
                    price: prodForm.price,
                    status: 'Active',
                    views: 1,
                    enquiries: 0,
                    image: getProductImage(prodForm.category),
                    description: prodForm.description.trim() || 'Fresh store stock ready for pickup',
                  });
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Publish Live to Local Citizens</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Form 2: Add Service */}
          {modalType.includes('service') && (
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Service Name</label>
                <input
                  type="text"
                  placeholder="e.g. Birthday Party Hall Booking"
                  value={srvForm.name}
                  onChange={(e) => setSrvForm({ ...srvForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:border-purple-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={srvForm.category}
                    onChange={(e) => setSrvForm({ ...srvForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pricing Text</label>
                  <input
                    type="text"
                    value={srvForm.priceText}
                    onChange={(e) => setSrvForm({ ...srvForm, priceText: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Full sound system, catering and decor setup included..."
                  value={srvForm.description}
                  onChange={(e) => setSrvForm({ ...srvForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!srvForm.name) return;
                  onAddService({
                    id: `srv-${Date.now()}`,
                    name: srvForm.name,
                    category: srvForm.category,
                    priceText: srvForm.priceText,
                    priceValue: 1000,
                    status: 'Active',
                    views: 0,
                    enquiries: 0,
                    image: './assets/crops/event-comedy.webp',
                    description: srvForm.description,
                  });
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-xs cursor-pointer"
              >
                Register Service
              </button>
            </div>
          )}

          {/* Form 3: Create Offer */}
          {(modalType.includes('offer') || modalType === 'add_offer') && (
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Offer Title</label>
                <input
                  type="text"
                  placeholder="e.g. 25% Off on All Mocktails"
                  value={offerForm.title}
                  onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:border-purple-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Offer Type</label>
                  <select
                    value={offerForm.type}
                    onChange={(e) => setOfferForm({ ...offerForm, type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none"
                  >
                    <option value="Discount">Discount</option>
                    <option value="Combo">Combo</option>
                    <option value="BOGO">BOGO</option>
                    <option value="Special Price">Special Price</option>
                    <option value="Event Offer">Event Offer</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Tag</label>
                  <input
                    type="text"
                    value={offerForm.discountText}
                    onChange={(e) => setOfferForm({ ...offerForm, discountText: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Promo Code</label>
                <input
                  type="text"
                  value={offerForm.code}
                  onChange={(e) => setOfferForm({ ...offerForm, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none tracking-widest text-purple-700 uppercase"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!offerForm.title) return;
                  onAddOffer({
                    id: `off-${Date.now()}`,
                    title: offerForm.title,
                    description: `Special limited-time deal on ${businessName}. Use code ${offerForm.code}.`,
                    type: offerForm.type,
                    discountText: offerForm.discountText,
                    validityStart: 'Today',
                    validityEnd: 'In 14 Days',
                    status: 'Active',
                    views: 0,
                    redemptions: 0,
                    image: './assets/crops/biz-urban-chai.webp',
                    code: offerForm.code,
                  });
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition shadow-xs cursor-pointer"
              >
                Publish Live Offer
              </button>
            </div>
          )}

          {/* Form 4: Create Post */}
          {(modalType.includes('post') || modalType === 'create_post') && (
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Post Headline</label>
                <input
                  type="text"
                  placeholder="e.g. Try our new Monsooon Special Brews!"
                  value={postForm.title}
                  onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:border-purple-600"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Post Type</label>
                <select
                  value={postForm.type}
                  onChange={(e) => setPostForm({ ...postForm, type: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none"
                >
                  <option value="Announcement">Announcement</option>
                  <option value="Offer">Offer</option>
                  <option value="Update">Update</option>
                  <option value="Event">Event</option>
                  <option value="Community">Community</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Post Caption</label>
                <textarea
                  rows={3}
                  placeholder="Share details, timings, or photos with your neighborhood..."
                  value={postForm.caption}
                  onChange={(e) => setPostForm({ ...postForm, caption: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!postForm.title) return;
                  onAddPost({
                    id: `post-${Date.now()}`,
                    title: postForm.title,
                    caption: postForm.caption || 'Special update from our storefront.',
                    type: postForm.type,
                    status: 'Published',
                    date: 'Just Now',
                    views: 0,
                    likes: 0,
                    shares: 0,
                    image: './assets/crops/biz-urban-chai.webp',
                  });
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition shadow-xs cursor-pointer"
              >
                Publish Post
              </button>
            </div>
          )}

          {/* Form 5: Create Event */}
          {(modalType.includes('event') || modalType === 'create_event') && (
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Event Title</label>
                <input
                  type="text"
                  placeholder="e.g. Acoustic Indie Live Music"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:border-purple-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={eventForm.category}
                    onChange={(e) => setEventForm({ ...eventForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none"
                  >
                    <option value="Music">Music</option>
                    <option value="Food">Food</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Community">Community</option>
                    <option value="Fitness">Fitness</option>
                    <option value="Networking">Networking</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date & Time</label>
                  <input
                    type="text"
                    value={eventForm.dateDisplay}
                    onChange={(e) => setEventForm({ ...eventForm, dateDisplay: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Venue Location</label>
                <input
                  type="text"
                  value={eventForm.venue}
                  onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!eventForm.title) return;
                  onAddEvent({
                    id: `evt-${Date.now()}`,
                    title: eventForm.title,
                    category: eventForm.category,
                    dateDisplay: eventForm.dateDisplay,
                    dayNumber: '28',
                    monthText: 'MAY',
                    timeText: '07:00 PM',
                    venue: eventForm.venue,
                    status: 'Published',
                    interestedCount: 1,
                    goingCount: 1,
                    image: './assets/crops/evt-music-fest.webp',
                    description: eventForm.description || 'Join our local event!',
                  });
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-xs cursor-pointer"
              >
                Host & Publish Event
              </button>
            </div>
          )}

          {/* Form 6: Request Review */}
          {modalType.includes('review') && (
            <div className="space-y-4 text-center">
              <p className="text-slate-600">
                Share this personalized link with your customers via WhatsApp, SMS or Bill receipts to collect genuine ratings on MyArea24:
              </p>
              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 flex items-center justify-between gap-2 font-mono text-[11px] text-purple-900">
                <span className="truncate">https://myarea24.in/review/the-daily-brew</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText('https://myarea24.in/review/the-daily-brew');
                    setCopiedReviewLink(true);
                    setTimeout(() => setCopiedReviewLink(false), 2000);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-purple-600 text-white text-[10px] font-bold shrink-0 cursor-pointer"
                >
                  {copiedReviewLink ? 'Copied ✓' : 'Copy'}
                </button>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    window.open(
                      'https://api.whatsapp.com/send?text=We%20loved%20serving%20you%20at%20The%20Daily%20Brew!%20Please%20leave%20us%20a%20quick%20review%20on%20MyArea24:%20https://myarea24.in/review/the-daily-brew',
                      '_blank'
                    );
                    onClose();
                  }}
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Send via WhatsApp</span>
                </button>
              </div>
            </div>
          )}

          {/* Form 7: Create Promotion / Ads */}
          {modalType.includes('promo') && (
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Campaign Name</label>
                <input
                  type="text"
                  placeholder="e.g. Weekend Special Dinner Push"
                  value={promoForm.title}
                  onChange={(e) => setPromoForm({ ...promoForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:border-purple-600"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Promotion Type</label>
                <select
                  value={promoForm.type}
                  onChange={(e) => setPromoForm({ ...promoForm, type: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none"
                >
                  <option value="Special Offer">Special Offer (Flash Deal)</option>
                  <option value="Event">Event Promotion</option>
                  <option value="Featured Listing">Featured Listing on Map & Search</option>
                  <option value="Custom Campaign">Custom Campaign</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Daily Budget (₹{promoForm.budget})</label>
                <input
                  type="range"
                  min="200"
                  max="5000"
                  step="100"
                  value={promoForm.budget}
                  onChange={(e) => setPromoForm({ ...promoForm, budget: Number(e.target.value) })}
                  className="w-full accent-purple-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>₹200/day (Est. 1.2K reach)</span>
                  <span>₹5,000/day (Est. 25K reach)</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!promoForm.title) return;
                  onAddPromotion({
                    id: `promo-${Date.now()}`,
                    title: promoForm.title,
                    type: promoForm.type,
                    startDate: 'Today',
                    endDate: 'In 7 Days',
                    reach: 500,
                    clicks: 80,
                    redemptions: 12,
                    status: 'Active',
                  });
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition shadow-xs cursor-pointer"
              >
                Launch Campaign
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
