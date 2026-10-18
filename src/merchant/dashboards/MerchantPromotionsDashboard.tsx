import React, { useState } from 'react';
import { MerchantPromotionItem, MerchantBusinessInfo } from '../types';
import {
  Sparkles,
  TrendingUp,
  Tag,
  Calendar,
  Eye,
  MousePointerClick,
  Plus,
  Search,
  Filter,
  ArrowRight,
  CheckCircle2,
  Clock,
  PauseCircle,
  Megaphone,
} from 'lucide-react';

interface MerchantPromotionsDashboardProps {
  business: MerchantBusinessInfo;
  promotions: MerchantPromotionItem[];
  onOpenCreatePromoModal: (type?: string) => void;
}

export function MerchantPromotionsDashboard({
  business,
  promotions,
  onOpenCreatePromoModal,
}: MerchantPromotionsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'scheduled' | 'completed' | 'paused'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const totalPromos = promotions.length;
  const activePromos = promotions.filter((p) => p.status.toLowerCase() === 'active').length;
  const scheduledPromos = promotions.filter((p) => p.status.toLowerCase() === 'scheduled').length;
  const completedPromos = promotions.filter((p) => p.status.toLowerCase() === 'completed').length;
  const pausedPromos = promotions.filter((p) => p.status.toLowerCase() === 'paused').length;
  const totalReach = promotions.reduce((acc, p) => acc + (p.reach || 0), 0);
  const totalViews = promotions.reduce((acc, p) => acc + (p.reach ? Math.round(p.reach * 0.4) : 0), 0);
  const totalClicks = promotions.reduce((acc, p) => acc + (p.clicks || 0), 0);
  const totalRedemptions = promotions.reduce((acc, p) => acc + (p.redemptions || 0), 0);

  const filteredPromos = promotions.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || p.status.toLowerCase() === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6">
      {/* =========================================================================
          HERO BANNER
         ========================================================================= */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#1E124A] via-[#2F156B] to-[#461F92] p-6 sm:p-8 text-white overflow-hidden shadow-xl border border-indigo-900/30">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="max-w-xl">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
              Promotions
            </h1>
            <p className="text-sm text-purple-200/90 leading-relaxed">
              Create, manage and track your promotions to reach more local customers and grow your business.
            </p>
          </div>

          <div className="hidden sm:flex flex-col items-end bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20">
            <span className="text-[10px] font-extrabold tracking-widest uppercase text-purple-200">
              Promote • Engage • Grow Locally
            </span>
            <span className="text-base font-extrabold text-white mt-0.5">MyArea24 Ads</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          6 STATS COUNTERS
         ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-500">Active Promotions</span>
            <Megaphone className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <p className="text-xl font-extrabold text-slate-900">{activePromos}</p>
          <span className="text-[10px] text-emerald-600 font-bold">Currently running</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-500">Total Reach</span>
            <Eye className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <p className="text-xl font-extrabold text-slate-900">{totalReach.toLocaleString()}</p>
          <span className="text-[10px] text-slate-500 font-medium">Local residents</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-500">Total Views</span>
            <Eye className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <p className="text-xl font-extrabold text-slate-900">{totalViews.toLocaleString()}</p>
          <span className="text-[10px] text-slate-500 font-medium">Card impressions</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-500">Total Clicks</span>
            <MousePointerClick className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <p className="text-xl font-extrabold text-slate-900">{totalClicks.toLocaleString()}</p>
          <span className="text-[10px] text-slate-500 font-medium">Direct interactions</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-500">Offer Redemptions</span>
            <Tag className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <p className="text-xl font-extrabold text-slate-900">{totalRedemptions.toLocaleString()}</p>
          <span className="text-[10px] text-slate-500 font-medium">In-store claims</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-500">Total Campaigns</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="text-xl font-extrabold text-emerald-700">{totalPromos}</p>
          <span className="text-[10px] text-emerald-600 font-bold">Lifetime created</span>
        </div>
      </div>

      {/* =========================================================================
          ROW 2: PROMOTION PERFORMANCE CHART & 4 CREATE CARDS
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Promotion Performance (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                Promotion Performance
              </h4>
              <div className="flex items-center gap-3 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-600" /> Views
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500" /> Clicks
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Redemptions
                </span>
              </div>
            </div>

            <div className="h-44 w-full relative pt-2">
              <svg className="w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="none">
                <line x1="0" y1="30" x2="400" y2="30" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="70" x2="400" y2="70" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
                <path
                  d="M 0 100 Q 50 80, 100 85 T 200 50 T 300 40 T 400 30"
                  fill="none"
                  stroke="#7C3AED"
                  strokeWidth="2.5"
                />
                <path
                  d="M 0 110 Q 50 100, 100 105 T 200 80 T 300 70 T 400 65"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            <span>Apr 15</span>
            <span>Apr 21</span>
            <span>Apr 27</span>
            <span>May 3</span>
            <span>May 9</span>
            <span>May 12</span>
          </div>
        </div>

        {/* Create New Promotion 4 Options (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <h4 className="text-xs font-extrabold text-slate-900 mb-2">Create New Promotion</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <button
              type="button"
              onClick={() => onOpenCreatePromoModal('Special Offer')}
              className="p-3 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-100 text-left transition cursor-pointer flex flex-col justify-between min-h-[90px]"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-rose-900">Special Offer</span>
                  <Tag className="w-4 h-4 text-rose-600" />
                </div>
                <p className="text-[10px] text-rose-700 leading-tight">
                  Create limited time offers to attract more customers
                </p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-rose-600 ml-auto mt-2" />
            </button>

            <button
              type="button"
              onClick={() => onOpenCreatePromoModal('Event Promotion')}
              className="p-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-left transition cursor-pointer flex flex-col justify-between min-h-[90px]"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-indigo-900">Event Promotion</span>
                  <Calendar className="w-4 h-4 text-indigo-600" />
                </div>
                <p className="text-[10px] text-indigo-700 leading-tight">
                  Promote your upcoming events to the local community
                </p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-indigo-600 ml-auto mt-2" />
            </button>

            <button
              type="button"
              onClick={() => onOpenCreatePromoModal('Featured Listing')}
              className="p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-100 text-left transition cursor-pointer flex flex-col justify-between min-h-[90px]"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-amber-900">Featured Listing</span>
                  <Sparkles className="w-4 h-4 text-amber-600" />
                </div>
                <p className="text-[10px] text-amber-700 leading-tight">
                  Get higher visibility in search and nearby maps
                </p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-amber-600 ml-auto mt-2" />
            </button>

            <button
              type="button"
              onClick={() => onOpenCreatePromoModal('Custom Campaign')}
              className="p-3 rounded-2xl bg-purple-50 hover:bg-purple-100 border border-purple-100 text-left transition cursor-pointer flex flex-col justify-between min-h-[90px]"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-purple-900">Custom Campaign</span>
                  <Megaphone className="w-4 h-4 text-purple-600" />
                </div>
                <p className="text-[10px] text-purple-700 leading-tight">
                  Create a custom promotion for your business
                </p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-purple-600 ml-auto mt-2" />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ROW 3: RECENT PROMOTIONS TABLE & TOP PERFORMING PROMOTIONS
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: `All (${totalPromos})` },
                { id: 'active', label: `Active (${activePromos})` },
                { id: 'scheduled', label: `Scheduled (${scheduledPromos})` },
                { id: 'completed', label: `Completed (${completedPromos})` },
                { id: 'paused', label: `Paused (${pausedPromos})` },
              ].map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                      active
                        ? 'bg-purple-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search promotions..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-purple-600"
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
            {filteredPromos.length === 0 ? (
              <div className="p-12 text-center">
                <Megaphone className="w-12 h-12 text-purple-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-800">No Promotions Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                  {promotions.length === 0
                    ? 'You have not launched any promotional campaigns yet. Start a special offer or featured listing to get local reach!'
                    : 'No promotions match your selected filter or search keyword.'}
                </p>
                <button
                  type="button"
                  onClick={() => onOpenCreatePromoModal('Special Offer')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create First Campaign</span>
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredPromos.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 hover:bg-slate-50/70 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900">{p.title}</span>
                        <span className="px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 text-[10px] font-extrabold">
                          {p.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {p.startDate} – {p.endDate}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="text-left sm:text-right">
                        <span className="font-bold text-slate-800">
                          👁️ {p.reach} Reach • 🖱️ {p.clicks} Clicks
                        </span>
                        <p className="text-[10px] text-slate-400">{p.redemptions} Redemptions</p>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          p.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : p.status === 'Scheduled'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top Performing Promotions & Quick Actions (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <h4 className="text-xs font-extrabold text-slate-900 mb-3">
              Top Performing Promotions
            </h4>
            {promotions.length === 0 ? (
              <div className="py-6 text-center text-slate-400">
                <TrendingUp className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                <p className="text-xs">No promotions recorded yet</p>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                {[...promotions]
                  .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
                  .slice(0, 5)
                  .map((row, idx) => (
                    <div key={row.id} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-extrabold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-slate-800 truncate">{row.title}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-semibold shrink-0">
                        {row.clicks} Clicks
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <h4 className="text-xs font-extrabold text-slate-900 mb-3">Quick Actions</h4>
            <div className="space-y-2 text-xs">
              <button
                type="button"
                onClick={() => onOpenCreatePromoModal('Special Offer')}
                className="w-full p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold flex items-center gap-2.5 transition cursor-pointer"
              >
                <Plus className="w-4 h-4 text-purple-600" />
                <span>Create New Offer</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenCreatePromoModal('Custom Campaign')}
                className="w-full p-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold flex items-center gap-2.5 transition cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>Schedule Campaign</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
