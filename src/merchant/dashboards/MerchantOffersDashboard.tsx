import React, { useState } from 'react';
import { MerchantOfferItem, MerchantBusinessInfo } from '../types';
import {
  Tag,
  Search,
  Filter,
  Plus,
  TrendingUp,
  Eye,
  CheckCircle2,
  Clock,
  PauseCircle,
  Archive,
  Edit2,
  MoreVertical,
  Calendar,
  Sparkles,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

interface MerchantOffersDashboardProps {
  business: MerchantBusinessInfo;
  offers: MerchantOfferItem[];
  onToggleOfferStatus: (id: string) => void;
  onOpenCreateOfferModal: () => void;
}

export function MerchantOffersDashboard({
  business,
  offers,
  onToggleOfferStatus,
  onOpenCreateOfferModal,
}: MerchantOffersDashboardProps) {
  const [activeFilterTab, setActiveFilterTab] = useState<
    'all' | 'active' | 'scheduled' | 'paused' | 'expired'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOffers = offers.filter((o) => {
    const matchesSearch =
      o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab =
      activeFilterTab === 'all' || o.status.toLowerCase() === activeFilterTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6">
      {/* =========================================================================
          HERO BANNER
         ========================================================================= */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#1E124A] via-[#2F1668] to-[#451F8D] p-6 sm:p-8 text-white overflow-hidden shadow-xl border border-indigo-900/30">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-rose-200 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-rose-300" />
              <span>Special Offers & Promotions</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
              Offers & Deals
            </h1>
            <p className="text-sm text-purple-200/90 leading-relaxed">
              Create and manage special offers to attract more customers and grow your business.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenCreateOfferModal}
              className="px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Offer</span>
            </button>
            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/30 hidden sm:block">
              <img
                src={business.coverImage}
                alt={business.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          STATUS STATS COUNTERS
         ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-500">Total Offers</span>
            <Tag className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <p className="text-xl font-extrabold text-slate-900">12</p>
          <span className="text-[10px] text-emerald-600 font-bold">▲ 20% from last month</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-500">Active Offers</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="text-xl font-extrabold text-emerald-700">8</p>
          <span className="text-[10px] text-emerald-600 font-bold">▲ 14% from last month</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-500">Scheduled</span>
            <Clock className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <p className="text-xl font-extrabold text-amber-600">2</p>
          <span className="text-[10px] text-slate-400">Upcoming deals</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-500">Paused</span>
            <PauseCircle className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <p className="text-xl font-extrabold text-rose-600">1</p>
          <span className="text-[10px] text-rose-600 font-bold">▼ 50% from last month</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-500">Expired</span>
            <Archive className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <p className="text-xl font-extrabold text-slate-500">1</p>
          <span className="text-[10px] text-slate-400">Completed validity</span>
        </div>
      </div>

      {/* =========================================================================
          TWO-COLUMN LAYOUT (Left: Offers Table/Cards | Right: Sidebar Insights)
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Table / List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'All Offers (12)' },
                { id: 'active', label: 'Active (8)' },
                { id: 'scheduled', label: 'Scheduled (2)' },
                { id: 'paused', label: 'Paused (1)' },
                { id: 'expired', label: 'Expired (1)' },
              ].map((tab) => {
                const active = activeFilterTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveFilterTab(tab.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                      active
                        ? 'bg-purple-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-48">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search offers..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-purple-600"
                />
              </div>
              <button
                type="button"
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer"
              >
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span>Filter</span>
              </button>
            </div>
          </div>

          {/* Desktop Table & Mobile Cards */}
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
            <div className="divide-y divide-slate-100">
              {filteredOffers.map((offer) => (
                <div
                  key={offer.id}
                  className="p-4 hover:bg-slate-50/70 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                      <img
                        src={offer.image}
                        alt={offer.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-extrabold">
                          {offer.type}
                        </span>
                        <span className="text-xs font-extrabold text-rose-600">
                          {offer.discountText}
                        </span>
                        {offer.badgeText && (
                          <span className="text-[10px] line-through text-slate-400">
                            {offer.badgeText}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {offer.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {offer.description}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {offer.validityStart} – {offer.validityEnd}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          offer.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : offer.status === 'Scheduled'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {offer.status}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1">
                        👁️ {offer.views} Views • 🎟️ {offer.redemptions} Uses
                      </p>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => onToggleOfferStatus(offer.id)}
                      className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                        offer.status === 'Active' ? 'bg-purple-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                          offer.status === 'Active' ? 'left-4.5' : 'left-0.5'
                        }`}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => alert(`Edit offer: ${offer.title}`)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Offer Insights & Top Performing (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Box 1: Offer Insights */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                Offer Insights
              </h4>
              <span className="text-xs font-bold text-slate-500">Last 30 Days</span>
            </div>

            <div className="p-3 bg-purple-50/60 rounded-2xl border border-purple-100 mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-purple-800">Total Views Across Offers</p>
                <p className="text-xl font-extrabold text-purple-950 mt-0.5">1,540</p>
              </div>
              <span className="text-[10px] font-extrabold text-emerald-600 px-2 py-0.5 bg-emerald-100 rounded-full">
                ▲ 24%
              </span>
            </div>

            {/* Simulated mini line chart */}
            <div className="h-20 w-full pt-1">
              <svg className="w-full h-full" viewBox="0 0 200 60">
                <path
                  d="M 0 50 Q 30 40, 60 45 T 120 25 T 170 15 T 200 20"
                  fill="none"
                  stroke="#9333EA"
                  strokeWidth="2.5"
                />
              </svg>
            </div>
          </div>

          {/* Box 2: Top Performing Offers */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <h4 className="text-xs font-extrabold text-slate-900 mb-3">
              Top Performing Offers
            </h4>
            <div className="space-y-3">
              {[
                {
                  rank: '1',
                  title: 'Flat 20% Off on All Beverages',
                  stats: '1.2K Views • 86 Redemptions',
                  image: './assets/crops/biz-urban-chai.webp',
                },
                {
                  rank: '2',
                  title: 'Weekend Special Burger',
                  stats: '980 Views • 64 Redemptions',
                  image: './assets/crops/offer-burger-singh.webp',
                },
                {
                  rank: '3',
                  title: 'Buy 1 Get 1 Free on Cakes',
                  stats: '750 Views • 48 Redemptions',
                  image: './assets/crops/biz-bikanervala.webp',
                },
              ].map((item) => (
                <div key={item.rank} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-xs font-extrabold flex items-center justify-center shrink-0">
                    {item.rank}
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{item.title}</p>
                    <p className="text-[10px] text-slate-500">{item.stats}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Box 3: Quick Actions */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <h4 className="text-xs font-extrabold text-slate-900 mb-3">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={onOpenCreateOfferModal}
                className="p-3 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold flex flex-col items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-4 h-4 text-purple-600" />
                <span>Create New Offer</span>
              </button>
              <button
                type="button"
                onClick={() => alert('Manage Offer Categories: Beverages, Desserts, Combos')}
                className="p-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold flex flex-col items-center gap-1.5 transition cursor-pointer"
              >
                <Tag className="w-4 h-4 text-indigo-600" />
                <span>Manage Categories</span>
              </button>
              <button
                type="button"
                onClick={() => alert('Offer Templates: BOGO, Happy Hour 50%, Festive ₹100 Flat')}
                className="p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold flex flex-col items-center gap-1.5 transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Offer Templates</span>
              </button>
              <button
                type="button"
                onClick={() => alert('Public Storefront Listing view')}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold flex flex-col items-center gap-1.5 transition cursor-pointer"
              >
                <ExternalLink className="w-4 h-4 text-slate-600" />
                <span>View Public Listing</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
