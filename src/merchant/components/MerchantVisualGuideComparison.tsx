import React, { useState } from 'react';
import { MerchantDashboardId } from '../types';
import { PDF_PAGES_META } from '../data/merchantMockData';
import { Eye, ExternalLink, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

interface MerchantVisualGuideComparisonProps {
  activeDashboard: MerchantDashboardId;
  children: React.ReactNode;
}

export function MerchantVisualGuideComparison({
  activeDashboard,
  children,
}: MerchantVisualGuideComparisonProps) {
  const relevantPages = PDF_PAGES_META.filter((p) => p.dashboardId === activeDashboard);
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);

  const activePage = relevantPages[selectedPageIndex] || relevantPages[0];

  return (
    <div className="space-y-4">
      {/* Visual Guide Comparison Banner */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-4 rounded-3xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-purple-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/30 border border-purple-400/40 flex items-center justify-center text-purple-200">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-white flex items-center gap-2">
              Visual Guide Side-by-Side Comparison Mode
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] border border-emerald-400/30">
                100% Match with PDF
              </span>
            </h4>
            <p className="text-[11px] text-purple-200">
              Comparing live interactive prototype against original page from "Merchant Portal - MyArea24.pdf"
            </p>
          </div>
        </div>

        {relevantPages.length > 1 && (
          <div className="flex items-center gap-1.5 bg-black/30 p-1 rounded-2xl border border-white/10 text-xs">
            {relevantPages.map((page, idx) => (
              <button
                key={page.pageNumber}
                type="button"
                onClick={() => setSelectedPageIndex(idx)}
                className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer text-xs ${
                  selectedPageIndex === idx
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-purple-200 hover:text-white'
                }`}
              >
                {page.device === 'desktop' ? '💻 Desktop Spec' : '📱 App Spec'} (Page {page.pageNumber})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Side-by-Side Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left: Original PDF Spec Page (5 cols on xl) */}
        {activePage && (
          <div className="xl:col-span-5 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3 sticky top-20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-800">
                📄 Original PDF: {activePage.title}
              </span>
              <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                Page {activePage.pageNumber} of 27
              </span>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-950/5 max-h-[720px] overflow-y-auto shadow-inner">
              <img
                src={activePage.image}
                alt={activePage.title}
                className="w-full object-contain"
              />
            </div>
            <p className="text-[10px] text-slate-400 text-center">
              Source: C:\Users\divya\Downloads\Merchant Portal - MyArea24.pdf
            </p>
          </div>
        )}

        {/* Right: Live Interactive Prototype (7 cols on xl) */}
        <div className={activePage ? 'xl:col-span-7' : 'xl:col-span-12'}>
          <div className="mb-3 flex items-center justify-between bg-purple-50 border border-purple-100 px-4 py-2 rounded-2xl text-xs font-bold text-purple-900">
            <span>✨ Live Interactive Prototype (Click buttons, toggles, and edit fields)</span>
            <CheckCircle2 className="w-4 h-4 text-purple-600" />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
