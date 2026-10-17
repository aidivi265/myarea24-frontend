import React, { useState } from 'react';
import { MerchantLeadItem, MerchantBusinessInfo } from '../types';
import {
  Users,
  Search,
  Filter,
  TrendingUp,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  MessageSquare,
  FileText,
  Tag,
  Share2,
  ExternalLink,
} from 'lucide-react';

interface MerchantLeadsDashboardProps {
  business: MerchantBusinessInfo;
  leads: MerchantLeadItem[];
  onUpdateLeadStatus: (leadId: string, newStatus: MerchantLeadItem['status']) => void;
  onOpenMessageWithLead?: (lead: MerchantLeadItem) => void;
}

export function MerchantLeadsDashboard({
  business,
  leads,
  onUpdateLeadStatus,
  onOpenMessageWithLead,
}: MerchantLeadsDashboardProps) {
  const [activeTab, setActiveTab] = useState<
    'all' | 'new' | 'in progress' | 'converted' | 'not interested' | 'closed'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState<string>(leads[0]?.id || '');

  const selectedLead = leads.find((l) => l.id === selectedLeadId) || leads[0];

  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.enquiryText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.phone.includes(searchQuery);
    const matchesTab = activeTab === 'all' || l.status.toLowerCase() === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6">
      {/* =========================================================================
          HERO BANNER
         ========================================================================= */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#1E124A] via-[#2C1565] to-[#431D8B] p-6 sm:p-8 text-white overflow-hidden shadow-xl border border-indigo-900/30">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="max-w-xl">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
              Leads & Enquiries
            </h1>
            <p className="text-sm text-purple-200/90 leading-relaxed">
              Manage customer enquiries, track interests, and convert them into loyal customers.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-4 shrink-0 shadow-lg hidden sm:flex">
            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/30">
              <img
                src={business.coverImage}
                alt={business.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-xs font-bold text-white">{business.name}</p>
              <p className="text-xs text-purple-200">152 Total Enquiries • 98 New</p>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          STATS STRIP
         ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-500">Total Enquiries</span>
            <Users className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <p className="text-xl font-extrabold text-slate-900">152</p>
          <span className="text-[10px] text-emerald-600 font-bold">▲ 28% from last month</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-500">New Enquiries</span>
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="text-xl font-extrabold text-emerald-700">98</p>
          <span className="text-[10px] text-emerald-600 font-bold">▲ 18% from last month</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-500">Pending Response</span>
            <Clock className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <p className="text-xl font-extrabold text-amber-600">36</p>
          <span className="text-[10px] text-rose-600 font-bold">▼ 12% from last month</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-500">Converted</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <p className="text-xl font-extrabold text-slate-900">102</p>
          <span className="text-[10px] text-emerald-600 font-bold">▲ 35% from last month</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-500">Satisfaction</span>
            <span className="text-xs">⭐</span>
          </div>
          <p className="text-xl font-extrabold text-slate-900">4.6 / 5</p>
          <span className="text-[10px] text-emerald-600 font-bold">▲ 12% from last month</span>
        </div>
      </div>

      {/* =========================================================================
          CHARTS ROW: Trend Line + Sources Donut + Status Donut
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Trend Chart (6 cols) */}
        <div className="lg:col-span-6 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                Enquiries Trend
              </h4>
              <span className="text-xs font-bold text-slate-500">Last 30 Days</span>
            </div>
            <p className="text-[11px] text-purple-700 font-bold">
              Peak: 28 Enquiries on 2 May 2025
            </p>

            <div className="h-36 w-full pt-3">
              <svg className="w-full h-full" viewBox="0 0 350 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="leadGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0 80 Q 40 70, 70 85 T 140 60 T 210 20 T 280 65 T 350 50 L 350 100 L 0 100 Z"
                  fill="url(#leadGrad)"
                />
                <path
                  d="M 0 80 Q 40 70, 70 85 T 140 60 T 210 20 T 280 65 T 350 50"
                  fill="none"
                  stroke="#8B5CF6"
                  strokeWidth="2.5"
                />
                <circle cx="210" cy="20" r="4" fill="#7C3AED" stroke="#FFFFFF" strokeWidth="2" />
              </svg>
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100">
            <span>Apr 15</span>
            <span>Apr 21</span>
            <span>Apr 27</span>
            <span>May 3</span>
            <span>May 9</span>
            <span>May 12</span>
          </div>
        </div>

        {/* Donut 1: Enquiries by Source (3 cols) */}
        <div className="lg:col-span-3 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <h4 className="text-xs font-extrabold text-slate-900 mb-2">Enquiries by Source</h4>
          <div className="relative w-24 h-24 mx-auto my-1 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="4"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                stroke="#6366F1"
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
            </svg>
            <div className="absolute text-center">
              <span className="text-xs font-extrabold text-slate-900">152</span>
              <span className="block text-[8px] text-slate-400">Total</span>
            </div>
          </div>
          <div className="space-y-1 text-[11px] text-slate-600 pt-2 border-t border-slate-100">
            <div className="flex justify-between">
              <span>• Website/Profile</span> <span className="font-bold">32% (49)</span>
            </div>
            <div className="flex justify-between">
              <span>• Direct Message</span> <span className="font-bold">24% (37)</span>
            </div>
            <div className="flex justify-between">
              <span>• Search</span> <span className="font-bold">18% (27)</span>
            </div>
            <div className="flex justify-between">
              <span>• Posts & Updates</span> <span className="font-bold">12% (18)</span>
            </div>
          </div>
        </div>

        {/* Donut 2: Enquiry Status (3 cols) */}
        <div className="lg:col-span-3 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <h4 className="text-xs font-extrabold text-slate-900 mb-2">Enquiry Status</h4>
          <div className="relative w-24 h-24 mx-auto my-1 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="4"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                stroke="#10B981"
                strokeWidth="4"
                strokeDasharray="25, 100"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                stroke="#3B82F6"
                strokeWidth="4"
                strokeDasharray="38, 100"
                strokeDashoffset="-25"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                stroke="#F59E0B"
                strokeWidth="4"
                strokeDasharray="24, 100"
                strokeDashoffset="-63"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-xs font-extrabold text-slate-900">152</span>
              <span className="block text-[8px] text-slate-400">Total</span>
            </div>
          </div>
          <div className="space-y-1 text-[11px] text-slate-600 pt-2 border-t border-slate-100">
            <div className="flex justify-between">
              <span>• New</span> <span className="font-bold text-amber-600">36 (24%)</span>
            </div>
            <div className="flex justify-between">
              <span>• In Progress</span> <span className="font-bold text-blue-600">58 (38%)</span>
            </div>
            <div className="flex justify-between">
              <span>• Converted</span> <span className="font-bold text-emerald-600">38 (25%)</span>
            </div>
            <div className="flex justify-between">
              <span>• Closed</span> <span className="font-bold text-slate-400">8 (5%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          TWO-COLUMN TABLE & DETAILS DRAWER
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Enquiries List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'All (152)' },
                { id: 'new', label: 'New (36)' },
                { id: 'in progress', label: 'In Progress (58)' },
                { id: 'converted', label: 'Converted (38)' },
                { id: 'not interested', label: 'Not Interested (12)' },
                { id: 'closed', label: 'Closed (8)' },
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
                  placeholder="Search enquiries..."
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

          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs divide-y divide-slate-100">
            {filteredLeads.map((lead) => {
              const isSelected = lead.id === selectedLead?.id;
              return (
                <div
                  key={lead.id}
                  onClick={() => setSelectedLeadId(lead.id)}
                  className={`p-4 transition cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
                    isSelected ? 'bg-purple-50/70' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-extrabold text-slate-900 text-xs">
                        {lead.customerName}
                      </span>
                      <span className="text-[11px] text-slate-400 font-normal">
                        {lead.phone}
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px]">
                        {lead.source}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-700 font-medium line-clamp-1">
                      "{lead.enquiryText}"
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {lead.date} • {lead.time}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        lead.status === 'New'
                          ? 'bg-amber-100 text-amber-800'
                          : lead.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-800'
                          : lead.status === 'Converted'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {lead.status}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenMessageWithLead?.(lead);
                      }}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-purple-100 text-purple-700 transition"
                      title="Send Direct Message"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Enquiry Details & Quick Actions (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {selectedLead && (
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    {selectedLead.customerName}
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    {selectedLead.date}, {selectedLead.time}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-extrabold text-[10px]">
                  {selectedLead.status}
                </span>
              </div>

              <div className="space-y-2.5">
                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase">Contact</span>
                  <p className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                    📞 {selectedLead.phone}
                  </p>
                  {selectedLead.email && (
                    <p className="text-slate-600 flex items-center gap-1.5 truncate">
                      ✉️ {selectedLead.email}
                    </p>
                  )}
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase">Source</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedLead.source}</p>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase">Enquiry</span>
                  <p className="p-2.5 rounded-xl bg-slate-50 text-slate-700 font-medium leading-relaxed mt-0.5 border border-slate-100">
                    "{selectedLead.enquiryText}"
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase">Interested In</span>
                  <p className="font-semibold text-purple-700 mt-0.5">
                    {selectedLead.interestedCategory}
                  </p>
                </div>

                {selectedLead.preferredDate && (
                  <div>
                    <span className="text-slate-400 text-[10px] font-bold uppercase">Preferred Date</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{selectedLead.preferredDate}</p>
                  </div>
                )}

                {selectedLead.notes && (
                  <div>
                    <span className="text-slate-400 text-[10px] font-bold uppercase">Notes</span>
                    <p className="text-slate-600 mt-0.5 italic">{selectedLead.notes}</p>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => onUpdateLeadStatus(selectedLead.id, 'Converted')}
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark as Converted</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenMessageWithLead?.(selectedLead)}
                  className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Reply to Enquiry</span>
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">
                  Quick Actions
                </span>
                <button
                  type="button"
                  onClick={() => alert(`Calling ${selectedLead.customerName} at ${selectedLead.phone}`)}
                  className="w-full py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-left flex items-center gap-2"
                >
                  <Phone className="w-3.5 h-3.5 text-purple-600" />
                  <span>Call Customer</span>
                </button>
                <button
                  type="button"
                  onClick={() => alert('Add note to lead CRM profile')}
                  className="w-full py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-left flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Add Note</span>
                </button>
                <button
                  type="button"
                  onClick={() => alert(`Create custom offer for ${selectedLead.customerName}`)}
                  className="w-full py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-left flex items-center gap-2"
                >
                  <Tag className="w-3.5 h-3.5 text-rose-600" />
                  <span>Create Offer</span>
                </button>
                <button
                  type="button"
                  onClick={() => alert('Share Menu link via SMS/WhatsApp')}
                  className="w-full py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-left flex items-center gap-2"
                >
                  <Share2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Share Menu</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
