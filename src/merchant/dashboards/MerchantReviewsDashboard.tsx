import React, { useState } from 'react';
import {
  MerchantReviewItem,
  MerchantBusinessInfo,
} from '../types';
import {
  Star,
  MessageSquare,
  ThumbsUp,
  CheckCircle2,
  Search,
  Filter,
  Plus,
  Share2,
  Reply,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface MerchantReviewsDashboardProps {
  business: MerchantBusinessInfo;
  reviews: MerchantReviewItem[];
  onAddReplyToReview: (reviewId: string, replyText: string) => void;
  onOpenRequestReviewModal: () => void;
}

export function MerchantReviewsDashboard({
  business,
  reviews,
  onAddReplyToReview,
  onOpenRequestReviewModal,
}: MerchantReviewsDashboardProps) {
  const [activeFilterTab, setActiveFilterTab] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyInput, setReplyInput] = useState('');

  const totalReviewsCount = reviews.length;
  const positiveCount = reviews.filter((r) => r.rating >= 4).length;
  const neutralCount = reviews.filter((r) => r.rating === 3).length;
  const negativeCount = reviews.filter((r) => r.rating <= 2).length;

  const avgRating =
    totalReviewsCount > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviewsCount).toFixed(1)
      : business.rating
      ? business.rating.toFixed(1)
      : '5.0';

  const positivePercent = totalReviewsCount > 0 ? Math.round((positiveCount / totalReviewsCount) * 100) : 100;

  const star5 = reviews.filter((r) => r.rating === 5).length;
  const star4 = reviews.filter((r) => r.rating === 4).length;
  const star3 = reviews.filter((r) => r.rating === 3).length;
  const star2 = reviews.filter((r) => r.rating === 2).length;
  const star1 = reviews.filter((r) => r.rating === 1).length;

  const getPercent = (count: number) =>
    totalReviewsCount > 0 ? `${Math.round((count / totalReviewsCount) * 100)}%` : '0%';

  const breakdownRows = [
    { stars: '5 ★', count: star5, percent: getPercent(star5) },
    { stars: '4 ★', count: star4, percent: getPercent(star4) },
    { stars: '3 ★', count: star3, percent: getPercent(star3) },
    { stars: '2 ★', count: star2, percent: getPercent(star2) },
    { stars: '1 ★', count: star1, percent: getPercent(star1) },
  ];

  const uniqueTags = Array.from(new Set(reviews.flatMap((r) => r.tags || [])));

  const filteredReviews = reviews.filter((rev) => {
    const matchesSearch =
      rev.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rev.comment.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRating =
      activeFilterTab === 'all' ||
      (activeFilterTab === 'positive' && rev.rating >= 4) ||
      (activeFilterTab === 'neutral' && rev.rating === 3) ||
      (activeFilterTab === 'negative' && rev.rating <= 2);

    return matchesSearch && matchesRating;
  });

  const handleSendReply = (reviewId: string) => {
    if (!replyInput.trim()) return;
    onAddReplyToReview(reviewId, replyInput.trim());
    setReplyingReviewId(null);
    setReplyInput('');
  };

  return (
    <div className="space-y-6">
      {/* =========================================================================
          HERO BANNER
         ========================================================================= */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#1E124A] via-[#2F156B] to-[#461F92] p-6 sm:p-8 text-white overflow-hidden shadow-xl border border-indigo-900/30">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="max-w-xl">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
              Customer Reviews
            </h1>
            <p className="text-sm text-purple-200/90 leading-relaxed">
              Build neighborhood trust, reply to feedback, and showcase verified experiences from real shoppers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenRequestReviewModal}
              className="px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>+ Request Review</span>
            </button>
            <div className="hidden sm:flex flex-col items-center bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-purple-200">
                Verified Local Store
              </span>
              <div className="flex items-center gap-1 text-amber-400 mt-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          METRICS STRIP
         ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-500">Overall Rating</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{avgRating} / 5</p>
          <span className="text-[10px] text-emerald-600 font-bold">{totalReviewsCount > 0 ? 'Verified Score' : 'New Storefront'}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-500">Total Reviews</span>
            <MessageSquare className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{totalReviewsCount}</p>
          <span className="text-[10px] text-emerald-600 font-bold">{totalReviewsCount > 0 ? '▲ Active' : '0 reviews'}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-500">Positive Reviews</span>
            <ThumbsUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-700">{positivePercent}%</p>
          <span className="text-[10px] text-emerald-600 font-bold">{positiveCount} 4★ & 5★ ratings</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-500">Happy Customers</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{positiveCount}</p>
          <span className="text-[10px] text-slate-400">Delighted shoppers</span>
        </div>
      </div>

      {/* =========================================================================
          TWO-COLUMN MAIN SECTION
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Reviews List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: `All Reviews (${totalReviewsCount})` },
                { id: 'positive', label: `Positive (${positiveCount})` },
                { id: 'neutral', label: `Neutral (${neutralCount})` },
                { id: 'negative', label: `Negative (${negativeCount})` },
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
                  placeholder="Search reviews..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-purple-600"
                />
              </div>
            </div>
          </div>

          {/* Reviews Stream */}
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
            {filteredReviews.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
                  <Star className="w-6 h-6 fill-amber-400" />
                </div>
                <h4 className="text-sm font-extrabold text-slate-900">No Customer Reviews Yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                  Encourage neighborhood customers to leave ratings on your storefront to build trust and boost local discovery.
                </p>
                <button
                  type="button"
                  onClick={onOpenRequestReviewModal}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-sm inline-flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Request First Review</span>
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredReviews.map((rev) => (
                  <div key={rev.id} className="p-5 space-y-3 hover:bg-slate-50/50 transition">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-extrabold text-xs flex items-center justify-center shrink-0">
                          {rev.customerAvatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs text-slate-900">{rev.customerName}</span>
                            {rev.verifiedBuyer && (
                              <span className="flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-bold border border-emerald-200">
                                <ShieldCheck className="w-3 h-3" /> Verified Customer
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="flex items-center gap-0.5 text-amber-400">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${i < rev.rating ? 'fill-amber-400' : 'text-slate-200'}`}
                                />
                              ))}
                            </div>
                            <span className="text-[10px] text-slate-400">{rev.timeAgo}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setReplyingReviewId(rev.id);
                          setReplyInput('');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Reply className="w-3.5 h-3.5" />
                        <span>Reply</span>
                      </button>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed">
                      {rev.comment}
                    </p>

                    {/* Tag Pills */}
                    {rev.tags && rev.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {rev.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-semibold"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Review Photos */}
                    {rev.photos && rev.photos.length > 0 && (
                      <div className="flex items-center gap-2 pt-1 overflow-x-auto no-scrollbar">
                        {rev.photos.map((photo, pIdx) => (
                          <div
                            key={pIdx}
                            className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200"
                          >
                            <img src={photo} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Existing Owner Reply */}
                    {rev.reply && (
                      <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100 text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-purple-900">
                          <span className="flex items-center gap-1.5">
                            <Reply className="w-3.5 h-3.5 text-purple-600" />
                            {rev.reply.ownerName}
                          </span>
                          <span className="text-[10px] text-purple-600 font-normal">
                            {rev.reply.date}
                          </span>
                        </div>
                        <p className="text-[11px] text-purple-800 leading-relaxed">
                          {rev.reply.text}
                        </p>
                      </div>
                    )}

                    {/* Interactive Reply Input Drawer */}
                    {replyingReviewId === rev.id && (
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                        <textarea
                          rows={2}
                          value={replyInput}
                          onChange={(e) => setReplyInput(e.target.value)}
                          placeholder={`Reply as ${business.ownerName || 'Owner'}...`}
                          className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:border-purple-600 font-medium"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setReplyingReviewId(null)}
                            className="px-3 py-1 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSendReply(rev.id)}
                            className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                          >
                            Post Official Reply
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Rating Breakdown, Review Sources, Keywords (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Rating Breakdown */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <h4 className="text-xs font-extrabold text-slate-900 mb-3">Rating Breakdown</h4>
            <div className="space-y-2 text-xs">
              {breakdownRows.map((row) => (
                <div key={row.stars} className="flex items-center gap-2">
                  <span className="w-8 font-bold text-slate-700">{row.stars}</span>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: row.percent }}
                    />
                  </div>
                  <span className="w-16 text-right text-[11px] text-slate-500">
                    {row.count} ({row.percent})
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Review Sources */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <h4 className="text-xs font-extrabold text-slate-900 mb-3">Review Sources</h4>
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-3 rounded-2xl bg-purple-50 border border-purple-100">
                <span className="block font-extrabold text-purple-900 text-sm">{totalReviewsCount}</span>
                <span className="block text-[10px] text-purple-700 mt-0.5">MyArea24 Verified</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="block font-extrabold text-slate-900 text-sm">0</span>
                <span className="block text-[10px] text-slate-500 mt-0.5">External Links</span>
              </div>
            </div>
          </div>

          {/* Keywords / Attributes Cloud */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <h4 className="text-xs font-extrabold text-slate-900 mb-2">Customer Tags</h4>
            {uniqueTags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 text-xs pt-1">
                {uniqueTags.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-100"
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400">
                Tags like "Great Food", "Prompt Service" will automatically populate from customer reviews.
              </p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <h4 className="text-xs font-extrabold text-slate-900 mb-3">Quick Actions</h4>
            <div className="space-y-2 text-xs">
              <button
                type="button"
                onClick={onOpenRequestReviewModal}
                className="w-full p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold flex items-center gap-2.5 transition cursor-pointer"
              >
                <Plus className="w-4 h-4 text-purple-600" />
                <span>Request Reviews</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.origin + `/business/${business.id}`);
                  alert('Storefront review link copied to clipboard!');
                }}
                className="w-full p-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold flex items-center gap-2.5 transition cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-indigo-600" />
                <span>Share Review Link</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
