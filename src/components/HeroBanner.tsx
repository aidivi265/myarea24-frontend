import React, { useState } from 'react';
import { DashboardId } from '../types';
import { Sparkles, ArrowRight, Search } from 'lucide-react';

interface HeroBannerProps {
  dashboardId: DashboardId;
  tag?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: string;
  description?: string;
  bottomPills?: {
    icon?: React.ReactNode;
    label: string;
    active?: boolean;
    onClick?: () => void;
  }[];
  primaryCta?: {
    label: string;
    onClick: () => void;
  };
  rightWidget?: React.ReactNode;
  askAiWidget?: {
    placeholder: string;
    chips: string[];
    onAsk: (prompt: string) => void;
  };
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  dashboardId,
  tag,
  title,
  subtitle,
  description,
  bottomPills,
  primaryCta,
  rightWidget,
  askAiWidget,
}) => {
  const [aiQuery, setAiQuery] = useState('');

  const handleAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim() || !askAiWidget) return;
    askAiWidget.onAsk(aiQuery.trim());
    setAiQuery('');
  };

  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#0B1739] via-[#1B2B65] to-[#2E2A72] text-white shadow-card border border-indigo-950/30 mb-4">
      {/* Authentic PDF Hero Artwork Layer blended seamlessly */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-55 mix-blend-lighten pointer-events-none"
        style={{
          backgroundImage: `url('./assets/crops/hero-art-${dashboardId}.webp'), url('./assets/crops/hero-skyline-art.webp')`,
        }}
      />
      {/* Left-to-right readability gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0B1536]/95 via-[#162454]/80 to-[#1E1B4B]/70 pointer-events-none" />

      <div className="relative z-10 p-5 lg:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          {/* Left Hero Copy */}
          <div className="max-w-2xl">
            {tag && (
              <div className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-200/95 mb-1.5">
                {tag}
              </div>
            )}
            <h1 className="text-2xl lg:text-[30px] font-extrabold tracking-tight leading-[1.15] text-white">
              {title}
            </h1>
            {subtitle && (
              <p className="text-base lg:text-lg font-semibold text-blue-200 mt-1">
                {subtitle}
              </p>
            )}
            {description && (
              <p className="text-xs lg:text-sm text-slate-200/90 mt-1.5 max-w-xl leading-relaxed">
                {description}
              </p>
            )}
          </div>

          {/* Right Widget or Ask MyArea AI Glass Box */}
          {askAiWidget ? (
            <div className="w-full lg:w-[370px] shrink-0 bg-white/12 backdrop-blur-md rounded-2xl p-3.5 border border-white/20 shadow-lg">
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/40 border border-indigo-300/40 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-blue-200" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white leading-tight">Ask MyArea AI</p>
                  <p className="text-[11px] text-blue-100/85">Get instant insights about your area.</p>
                </div>
              </div>
              <form onSubmit={handleAiSubmit} className="relative flex items-center mb-2.5">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3" />
                <input
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder={askAiWidget.placeholder}
                  className="w-full bg-white text-slate-800 placeholder:text-slate-400 text-xs rounded-full pl-8 pr-9 py-2 focus:outline-none shadow-sm"
                />
                <button
                  type="submit"
                  className="absolute right-1 w-6 h-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
              <div className="flex flex-wrap gap-1.5">
                {askAiWidget.chips.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => askAiWidget.onAsk(chip)}
                    className="px-2.5 py-1 rounded-full bg-slate-900/50 hover:bg-slate-900/75 border border-white/15 text-[10px] font-medium text-blue-100 transition"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            rightWidget && <div className="shrink-0">{rightWidget}</div>
          )}
        </div>

        {/* Bottom Interactive Pills / Tabs inside Hero */}
        {(bottomPills || primaryCta) && (
          <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {bottomPills?.map((pill, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={pill.onClick}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition shadow-sm ${
                    pill.active
                      ? 'bg-blue-600 text-white ring-2 ring-blue-300/50'
                      : 'bg-white/95 hover:bg-white text-slate-800'
                  }`}
                >
                  {pill.icon}
                  <span>{pill.label}</span>
                </button>
              ))}
            </div>
            {primaryCta && (
              <button
                type="button"
                onClick={primaryCta.onClick}
                className="px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md ring-1 ring-white/25 transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{primaryCta.label}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
