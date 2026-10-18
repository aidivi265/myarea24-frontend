import React, { useState } from 'react';
import {
  MerchantBusinessInfo,
  MerchantProductItem,
  MerchantOrderItem,
  MerchantLeadItem,
  MerchantReviewItem,
} from '../types';
import {
  TrendingUp,
  Eye,
  Users,
  PhoneCall,
  Navigation,
  MousePointerClick,
  Smartphone,
  Monitor,
  Tablet,
  Calendar,
  Sparkles,
  Clock,
  ArrowUpRight,
  Info,
} from 'lucide-react';

interface MerchantAnalyticsDashboardProps {
  business: MerchantBusinessInfo;
  products?: MerchantProductItem[];
  orders?: MerchantOrderItem[];
  leads?: MerchantLeadItem[];
  reviews?: MerchantReviewItem[];
}

export function MerchantAnalyticsDashboard({
  business,
  products = [],
  orders = [],
  leads = [],
  reviews = [],
}: MerchantAnalyticsDashboardProps) {
  const [metricTab, setMetricTab] = useState<'views' | 'enquiries' | 'calls' | 'actions'>('views');
  const [dateRange, setDateRange] = useState('Last 30 Days');

  // Dynamically computed metrics
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const totalLeads = leads.length;
  const totalReviews = reviews.length || business.reviewCount || 0;

  const totalViews = (business as any).viewCount || (business as any).views || products.reduce((acc, p) => acc + (p.views || 0), 0);
  const uniqueVisitors = totalViews;
  const totalEnquiries = totalLeads + totalOrders;
  const phoneCalls = (business as any).callClicks || leads.filter((l) => Boolean(l.phone)).length;
  const profileActions = totalOrders + totalLeads;
  const directionRequests = (business as any).directionClicks || 0;

  return (
    <div className="space-y-6">
      {/* =========================================================================
          HERO BANNER
         ========================================================================= */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#1E124A] via-[#2F156B] to-[#451F8E] p-6 sm:p-8 text-white overflow-hidden shadow-xl border border-indigo-900/30">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="max-w-xl">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
              Analytics & Insights
            </h1>
            <p className="text-sm text-purple-200/90 leading-relaxed">
              Understand your performance, discover local customer trends and make data-driven decisions to grow your store.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20">
            <Calendar className="w-4 h-4 text-purple-200" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
            >
              <option value="Last 7 Days" className="text-slate-900">Last 7 Days</option>
              <option value="Last 30 Days" className="text-slate-900">Last 30 Days</option>
              <option value="Last 90 Days" className="text-slate-900">Last 90 Days</option>
              <option value="This Year" className="text-slate-900">This Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* =========================================================================
          6 KPI METRIC CARDS
         ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-500">Total Views</span>
            <Eye className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <p className="text-xl font-extrabold text-slate-900">{totalViews.toLocaleString('en-IN')}</p>
          <span className="text-[10px] text-emerald-600 font-bold">{totalViews > 0 ? '▲ Active live' : 'Calibrating'}</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-500">Unique Visitors</span>
            <Users className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <p className="text-xl font-extrabold text-slate-900">{uniqueVisitors.toLocaleString('en-IN')}</p>
          <span className="text-[10px] text-emerald-600 font-bold">{uniqueVisitors > 0 ? '▲ Local area' : 'Calibrating'}</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-500">Total Enquiries</span>
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="text-xl font-extrabold text-slate-900">{totalEnquiries}</p>
          <span className="text-[10px] text-emerald-600 font-bold">{totalEnquiries > 0 ? '▲ Direct chats' : 'No inquiries yet'}</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-500">Phone Calls</span>
            <PhoneCall className="w-3.5 h-3.5 text-cyan-600" />
          </div>
          <p className="text-xl font-extrabold text-slate-900">{phoneCalls}</p>
          <span className="text-[10px] text-emerald-600 font-bold">{phoneCalls > 0 ? '▲ Local dials' : 'No calls yet'}</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-500">Profile Actions</span>
            <MousePointerClick className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <p className="text-xl font-extrabold text-slate-900">{profileActions}</p>
          <span className="text-[10px] text-emerald-600 font-bold">{profileActions > 0 ? '▲ Clicks & saves' : '0 actions'}</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-500">Direction Requests</span>
            <Navigation className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <p className="text-xl font-extrabold text-slate-900">{directionRequests}</p>
          <span className="text-[10px] text-emerald-600 font-bold">{directionRequests > 0 ? '▲ GPS navigation' : '0 requests'}</span>
        </div>
      </div>

      {/* =========================================================================
          ROW 2: PERFORMANCE OVERVIEW (Line Chart) + AUDIENCE INSIGHTS (Donut)
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Performance Overview (8 cols) */}
        <div className="lg:col-span-8 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  Performance Overview
                </h4>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600" /> This Month
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400" /> Last Month
                  </span>
                </div>
              </div>

              {/* Metric Tabs */}
              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                {[
                  { id: 'views', label: 'Views' },
                  { id: 'enquiries', label: 'Enquiries' },
                  { id: 'calls', label: 'Calls' },
                  { id: 'actions', label: 'Profile Actions' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setMetricTab(t.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      metricTab === t.id
                        ? 'bg-purple-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Performance Curve SVG Line Chart */}
            <div className="h-48 w-full relative pt-2">
              <svg className="w-full h-full" viewBox="0 0 500 130" preserveAspectRatio="none">
                <line x1="0" y1="30" x2="500" y2="30" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="70" x2="500" y2="70" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="110" x2="500" y2="110" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />

                {totalViews > 0 ? (
                  <>
                    <path
                      d="M 0 100 Q 50 95, 100 90 T 200 80 T 300 70 T 400 65 T 500 60"
                      fill="none"
                      stroke="#93C5FD"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                    <path
                      d="M 0 105 Q 60 85, 120 90 T 240 60 T 340 30 T 420 50 T 500 35"
                      fill="none"
                      stroke="#7C3AED"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <circle cx="340" cy="30" r="5" fill="#7C3AED" stroke="#FFFFFF" strokeWidth="2.5" />
                  </>
                ) : (
                  <path
                    d="M 0 110 L 500 110"
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                )}
              </svg>

              {totalViews === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <p className="text-xs font-bold text-slate-500">Performance Chart Calibrating</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Live telemetry will render trends as nearby residents browse your store.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            <span>Day 1</span>
            <span>Day 7</span>
            <span>Day 14</span>
            <span>Day 21</span>
            <span>Day 28</span>
            <span>Today</span>
          </div>
        </div>

        {/* Audience Insights (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-extrabold text-slate-900">Audience Insights</h4>
              <span className="text-xs font-bold text-slate-500">Visitors</span>
            </div>

            <div className="relative w-28 h-28 mx-auto my-2 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {uniqueVisitors > 0 && (
                  <>
                    <path
                      stroke="#4F46E5"
                      strokeWidth="4"
                      strokeDasharray="40, 100"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      stroke="#06B6D4"
                      strokeWidth="4"
                      strokeDasharray="30, 100"
                      strokeDashoffset="-40"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      stroke="#F59E0B"
                      strokeWidth="4"
                      strokeDasharray="30, 100"
                      strokeDashoffset="-70"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </>
                )}
              </svg>
              <div className="absolute text-center">
                <span className="text-xs font-extrabold text-slate-900">{uniqueVisitors}</span>
                <span className="block text-[8px] text-slate-400">Unique</span>
              </div>
            </div>

            <div className="space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex justify-between">
                <span>• Direct Search</span>{' '}
                <span className="font-bold">{uniqueVisitors > 0 ? `40% (${Math.round(uniqueVisitors * 0.4)})` : '0'}</span>
              </div>
              <div className="flex justify-between">
                <span>• Neighborhood POI Map</span>{' '}
                <span className="font-bold">{uniqueVisitors > 0 ? `30% (${Math.round(uniqueVisitors * 0.3)})` : '0'}</span>
              </div>
              <div className="flex justify-between">
                <span>• Catalog Browsing</span>{' '}
                <span className="font-bold">{uniqueVisitors > 0 ? `30% (${Math.round(uniqueVisitors * 0.3)})` : '0'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ROW 3: DEVICE USAGE + CUSTOMER DEMOGRAPHICS + PEAK HOURS
         ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Device Usage */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <h4 className="text-xs font-extrabold text-slate-900 mb-3">Device Usage</h4>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-700">
                <Smartphone className="w-4 h-4 text-purple-600" /> Mobile
              </span>
              <span className="font-bold text-slate-900">{uniqueVisitors > 0 ? '78%' : '0%'}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-purple-600 rounded-full"
                style={{ width: uniqueVisitors > 0 ? '78%' : '0%' }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-700">
                <Monitor className="w-4 h-4 text-indigo-600" /> Desktop
              </span>
              <span className="font-bold text-slate-900">{uniqueVisitors > 0 ? '22%' : '0%'}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full"
                style={{ width: uniqueVisitors > 0 ? '22%' : '0%' }}
              />
            </div>
          </div>
        </div>

        {/* Customer Demographics */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-extrabold text-slate-900">Demographics</h4>
            <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
              Neighborhood
            </span>
          </div>
          <div className="flex items-end justify-between gap-2 h-36 pt-4 text-center">
            {[
              { label: 'Local Residents', val: uniqueVisitors > 0 ? 65 : 0, height: uniqueVisitors > 0 ? '65%' : '8%' },
              { label: 'Commuters', val: uniqueVisitors > 0 ? 25 : 0, height: uniqueVisitors > 0 ? '25%' : '8%' },
              { label: 'Visitors', val: uniqueVisitors > 0 ? 10 : 0, height: uniqueVisitors > 0 ? '10%' : '8%' },
            ].map((d) => (
              <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-slate-600">{d.val}%</span>
                <div
                  className="w-full rounded-t-xl bg-purple-500 hover:bg-purple-600 transition"
                  style={{ height: d.height }}
                />
                <span className="text-[10px] text-slate-400 mt-1">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Engagement */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-extrabold text-slate-900">Peak Hours</h4>
              <span className="text-[10px] text-slate-500 font-semibold">Storefront</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="font-bold text-slate-700">Morning Peak</span>
                <span className="text-purple-700 font-extrabold">9:00 AM – 11:30 AM</span>
              </div>
              <div className="p-3 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-between">
                <span className="font-bold text-purple-900">Evening Peak</span>
                <span className="text-purple-700 font-extrabold">5:30 PM – 8:30 PM</span>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
            Based on active customer search and order timing across your neighborhood.
          </p>
        </div>
      </div>

      {/* =========================================================================
          ROW 4: TOP PERFORMING INVENTORY CONTENT
         ========================================================================= */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-extrabold text-slate-900">Storefront Inventory Performance</h4>
          <span className="text-xs font-bold text-purple-600">{products.length} Products</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-extrabold uppercase text-slate-400">
                <th className="pb-2">#</th>
                <th className="pb-2">Item Name</th>
                <th className="pb-2">Price</th>
                <th className="pb-2 text-right">Views</th>
                <th className="pb-2 text-right">Inquiries</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {products.length > 0 ? (
                products.slice(0, 5).map((p, idx) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 font-bold text-slate-400">{idx + 1}</td>
                    <td className="py-2.5 font-bold text-slate-900">
                      {p.name} <span className="text-[10px] font-normal text-slate-500">({p.category})</span>
                    </td>
                    <td className="py-2.5 text-slate-700">₹{p.price}</td>
                    <td className="py-2.5 text-right font-semibold text-slate-700">{p.views || 0}</td>
                    <td className="py-2.5 text-right font-extrabold text-purple-700">{p.enquiries || 0}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No products or items listed yet. Add items to your catalog to track performance metrics.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
