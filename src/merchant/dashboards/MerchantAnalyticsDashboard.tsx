import React, { useState } from 'react';
import { MerchantBusinessInfo } from '../types';
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
}

export function MerchantAnalyticsDashboard({ business }: MerchantAnalyticsDashboardProps) {
  const [metricTab, setMetricTab] = useState<'views' | 'enquiries' | 'calls' | 'actions'>('views');
  const [dateRange, setDateRange] = useState('Last 30 Days');

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
              Understand your performance, discover trends and make data-driven decisions to grow your business.
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
          <p className="text-xl font-extrabold text-slate-900">12,458</p>
          <span className="text-[10px] text-emerald-600 font-bold">▲ 28% from last month</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-500">Unique Visitors</span>
            <Users className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <p className="text-xl font-extrabold text-slate-900">8,236</p>
          <span className="text-[10px] text-emerald-600 font-bold">▲ 22% from last month</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-500">Total Enquiries</span>
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="text-xl font-extrabold text-slate-900">152</p>
          <span className="text-[10px] text-emerald-600 font-bold">▲ 35% from last month</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-500">Phone Calls</span>
            <PhoneCall className="w-3.5 h-3.5 text-cyan-600" />
          </div>
          <p className="text-xl font-extrabold text-slate-900">64</p>
          <span className="text-[10px] text-emerald-600 font-bold">▲ 18% from last month</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-500">Profile Actions</span>
            <MousePointerClick className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <p className="text-xl font-extrabold text-slate-900">298</p>
          <span className="text-[10px] text-emerald-600 font-bold">▲ 26% from last month</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-500">Direction Requests</span>
            <Navigation className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <p className="text-xl font-extrabold text-slate-900">120</p>
          <span className="text-[10px] text-emerald-600 font-bold">▲ 40% from last month</span>
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

            {/* Simulated Dual Curve SVG Line Chart */}
            <div className="h-48 w-full relative pt-2">
              <svg className="w-full h-full" viewBox="0 0 500 130" preserveAspectRatio="none">
                {/* Horizontal Guide Lines */}
                <line x1="0" y1="30" x2="500" y2="30" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="70" x2="500" y2="70" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="110" x2="500" y2="110" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />

                {/* Last Month Line (Blue) */}
                <path
                  d="M 0 100 Q 50 95, 100 90 T 200 80 T 300 70 T 400 65 T 500 60"
                  fill="none"
                  stroke="#93C5FD"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />

                {/* This Month Line (Purple) */}
                <path
                  d="M 0 105 Q 60 85, 120 90 T 240 60 T 340 30 T 420 50 T 500 35"
                  fill="none"
                  stroke="#7C3AED"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Tooltip on Peak */}
                <circle cx="340" cy="30" r="5" fill="#7C3AED" stroke="#FFFFFF" strokeWidth="2.5" />
              </svg>

              {/* Float Tooltip Pill */}
              <div className="absolute top-2 left-2/3 -translate-x-1/2 bg-slate-900 text-white px-3 py-1.5 rounded-xl shadow-lg text-[10px] space-y-0.5 pointer-events-none">
                <span className="font-bold block">May 3, 2025</span>
                <span className="text-purple-300 block">● This Month: 820</span>
                <span className="text-blue-300 block">● Last Month: 520</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            <span>Apr 15</span>
            <span>Apr 18</span>
            <span>Apr 21</span>
            <span>Apr 24</span>
            <span>Apr 27</span>
            <span>Apr 30</span>
            <span>May 3</span>
            <span>May 6</span>
            <span>May 9</span>
            <span>May 12</span>
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
                <path
                  stroke="#4F46E5"
                  strokeWidth="4"
                  strokeDasharray="32, 100"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  stroke="#06B6D4"
                  strokeWidth="4"
                  strokeDasharray="24, 100"
                  strokeDashoffset="-32"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  stroke="#F59E0B"
                  strokeWidth="4"
                  strokeDasharray="18, 100"
                  strokeDashoffset="-56"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  stroke="#EC4899"
                  strokeWidth="4"
                  strokeDasharray="12, 100"
                  strokeDashoffset="-74"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-xs font-extrabold text-slate-900">8,236</span>
                <span className="block text-[8px] text-slate-400">Unique</span>
              </div>
            </div>

            <div className="space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex justify-between">
                <span>• Direct Search</span> <span className="font-bold">32% (2,636)</span>
              </div>
              <div className="flex justify-between">
                <span>• Google Search</span> <span className="font-bold">24% (1,976)</span>
              </div>
              <div className="flex justify-between">
                <span>• Social Media</span> <span className="font-bold">18% (1,482)</span>
              </div>
              <div className="flex justify-between">
                <span>• Maps / Directions</span> <span className="font-bold">12% (988)</span>
              </div>
              <div className="flex justify-between">
                <span>• Posts & Updates</span> <span className="font-bold">8% (659)</span>
              </div>
              <div className="flex justify-between">
                <span>• Others</span> <span className="font-bold">6% (495)</span>
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
              <span className="font-bold text-slate-900">68% (5,598)</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-purple-600 rounded-full" style={{ width: '68%' }} />
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-700">
                <Monitor className="w-4 h-4 text-indigo-600" /> Desktop
              </span>
              <span className="font-bold text-slate-900">24% (1,976)</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: '24%' }} />
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-700">
                <Tablet className="w-4 h-4 text-cyan-600" /> Tablet
              </span>
              <span className="font-bold text-slate-900">8% (659)</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-cyan-500 rounded-full" style={{ width: '8%' }} />
            </div>
          </div>
        </div>

        {/* Customer Demographics */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-extrabold text-slate-900">Customer Demographics</h4>
            <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
              Age Group
            </span>
          </div>
          <div className="flex items-end justify-between gap-2 h-36 pt-4 text-center">
            {[
              { label: '18-24', val: 12, height: '35%' },
              { label: '25-34', val: 28, height: '75%' },
              { label: '35-44', val: 32, height: '90%' },
              { label: '45-54', val: 18, height: '50%' },
              { label: '55+', val: 10, height: '28%' },
            ].map((d) => (
              <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-slate-600">{d.val}%</span>
                <div className="w-full rounded-t-xl bg-purple-500 hover:bg-purple-600 transition" style={{ height: d.height }} />
                <span className="text-[10px] text-slate-400 mt-1">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Hours Heatmap */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-extrabold text-slate-900">Peak Hours</h4>
            <span className="text-[10px] text-slate-500 font-semibold">Enquiries</span>
          </div>
          {/* Simulated 7-day hourly matrix */}
          <div className="space-y-1 text-[9px] text-slate-400">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
              <div key={day} className="flex items-center gap-1.5">
                <span className="w-6 font-bold">{day}</span>
                <div className="flex-1 grid grid-cols-8 gap-0.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((slot) => {
                    const intensity =
                      (idx === 4 || idx === 5) && (slot === 4 || slot === 5)
                        ? 'bg-purple-700'
                        : slot >= 4 && slot <= 6
                        ? 'bg-purple-500'
                        : slot >= 2 && slot <= 7
                        ? 'bg-purple-300'
                        : 'bg-purple-100';
                    return (
                      <span
                        key={slot}
                        className={`h-3 rounded-xs ${intensity} hover:scale-110 transition`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
            <div className="flex justify-between pl-7 text-[8px] text-slate-400 pt-1">
              <span>12AM</span>
              <span>4AM</span>
              <span>8AM</span>
              <span>12PM</span>
              <span>4PM</span>
              <span>8PM</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ROW 4: TOP PERFORMING CONTENT & KEY INSIGHTS
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Performing Content (8 cols) */}
        <div className="lg:col-span-8 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-extrabold text-slate-900">Top Performing Content</h4>
            <span className="text-xs font-bold text-purple-600 cursor-pointer">View All</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-extrabold uppercase text-slate-400">
                  <th className="pb-2">#</th>
                  <th className="pb-2">Content</th>
                  <th className="pb-2 text-right">Views</th>
                  <th className="pb-2 text-right">Enquiries</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {[
                  { rank: 1, title: 'Weekend Special Menu', views: '2,845', enquiries: 48 },
                  { rank: 2, title: 'Live Music Event', views: '1,923', enquiries: 36 },
                  { rank: 3, title: 'New Dessert Launch', views: '1,456', enquiries: 28 },
                  { rank: 4, title: 'Happy Hour Offer', views: '1,102', enquiries: 22 },
                  { rank: 5, title: 'Catering Services', views: '968', enquiries: 18 },
                ].map((row) => (
                  <tr key={row.rank} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 font-bold text-slate-400">{row.rank}</td>
                    <td className="py-2.5 font-bold text-slate-900">{row.title}</td>
                    <td className="py-2.5 text-right font-semibold text-slate-700">{row.views}</td>
                    <td className="py-2.5 text-right font-extrabold text-purple-700">{row.enquiries}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Key Insights Callouts (4 cols) */}
        <div className="lg:col-span-4 bg-gradient-to-br from-indigo-50/70 via-purple-50/50 to-pink-50/30 p-5 rounded-3xl border border-purple-100 shadow-xs space-y-3.5 text-xs">
          <h4 className="text-xs font-extrabold text-indigo-950 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-600" />
            Key Insights
          </h4>

          <div className="p-3 bg-white rounded-2xl border border-purple-100 shadow-2xs space-y-1">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              📈 Enquiries increased by 35% this month
            </span>
            <p className="text-[11px] text-slate-500">
              Your active combo promotions and menu posts drove peak engagement.
            </p>
          </div>

          <div className="p-3 bg-white rounded-2xl border border-purple-100 shadow-2xs space-y-1">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              ⏰ Peak Engagement Time
            </span>
            <p className="text-[11px] text-slate-500">
              Most enquiries arrive between 12 PM – 4 PM. Schedule offers accordingly.
            </p>
          </div>

          <div className="p-3 bg-white rounded-2xl border border-purple-100 shadow-2xs space-y-1">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              🎯 Top Source: Direct Search
            </span>
            <p className="text-[11px] text-slate-500">
              32% of your enquiries are from direct profile visits on MyArea24.
            </p>
          </div>

          <div className="p-3 bg-white rounded-2xl border border-purple-100 shadow-2xs space-y-1">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              🎁 Offers & Events drive more enquiries
            </span>
            <p className="text-[11px] text-slate-500">
              Posts about offers and events get 40% higher customer engagement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
