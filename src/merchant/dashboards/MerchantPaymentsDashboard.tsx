import React, { useState } from 'react';
import { MerchantInvoiceItem, MerchantBusinessInfo } from '../types';
import {
  CreditCard,
  CheckCircle2,
  Calendar,
  Download,
  Plus,
  ShieldCheck,
  Check,
  Edit2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface MerchantPaymentsDashboardProps {
  business: MerchantBusinessInfo;
  invoices: MerchantInvoiceItem[];
  onOpenUpgradePlanModal?: () => void;
}

export function MerchantPaymentsDashboard({
  business,
  invoices,
  onOpenUpgradePlanModal,
}: MerchantPaymentsDashboardProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const totalPaid = invoices.reduce((acc, inv) => acc + (inv.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* =========================================================================
          HERO BANNER
         ========================================================================= */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#1E124A] via-[#2F156B] to-[#461F92] p-6 sm:p-8 text-white overflow-hidden shadow-xl border border-indigo-900/30">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="max-w-xl">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
              Payments & Plans
            </h1>
            <p className="text-sm text-purple-200/90 leading-relaxed">
              Manage your subscription, view invoices, make payments and explore plans to grow your business on MyArea24.
            </p>
          </div>

          <div className="hidden sm:flex flex-col items-end bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20">
            <span className="text-[10px] font-extrabold tracking-widest uppercase text-purple-200">
              Community First Model
            </span>
            <span className="text-base font-extrabold text-white mt-0.5">Zero Commission Tier</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          4 STATUS SUMMARY CARDS STRIP
         ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-500">Current Plan</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold">
              Active
            </span>
          </div>
          <p className="text-xl font-extrabold text-slate-900">Community Free</p>
          <span className="text-[10px] text-emerald-600 font-bold">Lifetime zero commission</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-500">Next Payment</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
              ₹0 Due
            </span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">₹0</p>
          <span className="text-[10px] text-slate-400">No upcoming charges</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-500">Total Invoiced</span>
            <CreditCard className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">₹{totalPaid.toLocaleString()}</p>
          <span className="text-[10px] text-slate-400">{invoices.length} invoices recorded</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-500">Tier Features</span>
            <span className="text-xs font-bold text-emerald-600">Active</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">100%</p>
          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden mt-1.5">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }} />
          </div>
        </div>
      </div>

      {/* =========================================================================
          AVAILABLE PLANS (Monthly / Yearly Switch + 4 Tier Cards)
         ========================================================================= */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Available Plans</h3>
            <p className="text-xs text-slate-500">Select the plan tailored for your store scale</p>
          </div>

          {/* Toggle Switch */}
          <div className="inline-flex items-center gap-2 bg-slate-100 p-1 rounded-2xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                billingCycle === 'monthly' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('yearly')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                billingCycle === 'yearly' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              <span>Yearly</span>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-extrabold">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* 4 Tier Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Plan 1: Basic */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500">Basic</span>
              <div className="flex items-baseline gap-1 my-2">
                <span className="text-2xl font-extrabold text-slate-900">₹0</span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>
              <p className="text-xs text-slate-600 mb-4">
                For small businesses getting started
              </p>
              <ul className="space-y-2 text-xs text-slate-700 pb-4 border-t border-slate-100 pt-3">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Business Listing</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Basic Profile</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Post Updates (5/mo)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Customer Reviews</span>
                </li>
              </ul>
            </div>
            <button
              type="button"
              disabled
              className="w-full py-2 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold"
            >
              Current Plan
            </button>
          </div>

          {/* Plan 2: Pro (Highlighted) */}
          <div className="bg-gradient-to-b from-purple-50/50 to-white rounded-3xl p-5 border-2 border-purple-600 shadow-md flex flex-col justify-between relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
              Most Popular
            </span>
            <div>
              <span className="text-xs font-bold text-purple-700">Pro</span>
              <div className="flex items-baseline gap-1 my-2">
                <span className="text-2xl font-extrabold text-slate-900">
                  {billingCycle === 'monthly' ? '₹1,999' : '₹1,599'}
                </span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>
              <p className="text-xs text-slate-600 mb-4">
                For growing businesses with more visibility
              </p>
              <ul className="space-y-2 text-xs text-slate-700 pb-4 border-t border-purple-100 pt-3">
                <li className="flex items-center gap-2 font-semibold">
                  <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>Everything in Basic</span>
                </li>
                <li className="flex items-center gap-2 font-semibold">
                  <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>More Post Updates (50/mo)</span>
                </li>
                <li className="flex items-center gap-2 font-semibold">
                  <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>Featured in Search</span>
                </li>
                <li className="flex items-center gap-2 font-semibold">
                  <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>Access to Analytics</span>
                </li>
                <li className="flex items-center gap-2 font-semibold">
                  <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>Priority Support</span>
                </li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => alert('Manage Pro Plan')}
              className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Upgrade / Manage
            </button>
          </div>

          {/* Plan 3: Business */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500">Business</span>
              <div className="flex items-baseline gap-1 my-2">
                <span className="text-2xl font-extrabold text-slate-900">
                  {billingCycle === 'monthly' ? '₹3,499' : '₹2,799'}
                </span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>
              <p className="text-xs text-slate-600 mb-4">
                For established businesses
              </p>
              <ul className="space-y-2 text-xs text-slate-700 pb-4 border-t border-slate-100 pt-3">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Everything in Pro</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>More Leads & Enquiries</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Advanced Analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Promotions & Offers</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Dedicated Support</span>
                </li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => alert('Switch to Business Plan')}
              className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
            >
              Switch Plan
            </button>
          </div>

          {/* Plan 4: Enterprise */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500">Enterprise</span>
              <div className="flex items-baseline gap-1 my-2">
                <span className="text-2xl font-extrabold text-slate-900">
                  {billingCycle === 'monthly' ? '₹5,999' : '₹4,799'}
                </span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>
              <p className="text-xs text-slate-600 mb-4">
                For large chains with multiple locations
              </p>
              <ul className="space-y-2 text-xs text-slate-700 pb-4 border-t border-slate-100 pt-3">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Everything in Business</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Multiple Locations</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Advanced Promotions</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>API Access</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Account Manager</span>
                </li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => alert('Contact Enterprise Sales: enterprise@myarea24.in')}
              className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ROW 3: PAYMENT HISTORY + PAYMENT METHODS + BILLING INFO
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Payment History (6 cols) */}
        <div className="lg:col-span-6 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-extrabold text-slate-900">Payment History</h4>
            <span className="text-xs font-bold text-purple-600 cursor-pointer">View All Invoices</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {invoices.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <CreditCard className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600">No Invoices Yet</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  You are currently on the Community Free Tier with zero billing or transaction fees.
                </p>
              </div>
            ) : (
              invoices.map((inv) => (
                <div key={inv.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">{inv.id}</span>
                    <span className="text-[11px] text-slate-400 block">{inv.date} • {inv.plan}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-slate-900">₹{inv.amount}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                      {inv.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => alert(`Downloading invoice receipt: ${inv.id}`)}
                      className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"
                      title="Download Invoice PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Payment Methods (3 cols) */}
        <div className="lg:col-span-3 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-extrabold text-slate-900">Payment Methods</h4>
              <span className="text-xs font-bold text-purple-600 cursor-pointer">Manage</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1 mb-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900">UPI / Net Banking</span>
                <span className="px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 text-[10px] font-extrabold">
                  Verified
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Auto-settlements enabled</p>
            </div>

            <button
              type="button"
              onClick={() => alert('Add New Card / UPI ID dialog')}
              className="w-full py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Payment Method</span>
            </button>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-[10px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>All transactions secured with 256-bit encryption.</span>
          </div>
        </div>

        {/* Billing Information (3 cols) */}
        <div className="lg:col-span-3 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-extrabold text-slate-900">Billing Information</h4>
              <button type="button" className="text-xs font-bold text-purple-600 hover:text-purple-700">
                Edit
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 text-[10px]">Business Name</span>
                <p className="font-bold text-slate-900">{business.name}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px]">Contact Person</span>
                <p className="font-bold text-slate-900">{business.ownerName}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px]">Email</span>
                <p className="font-medium text-slate-700 truncate">{business.email}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px]">GST Number</span>
                <p className="font-bold text-indigo-700">{business.gstin || 'Not Required / Unregistered'}</p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Address: {business.fullAddress}
          </div>
        </div>
      </div>
    </div>
  );
}
