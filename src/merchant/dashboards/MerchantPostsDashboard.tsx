import React, { useState } from 'react';
import { MerchantPostItem, MerchantBusinessInfo } from '../types';
import {
  FileText,
  Search,
  Filter,
  Plus,
  Eye,
  Heart,
  Share2,
  TrendingUp,
  Clock,
  Sparkles,
  Edit2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Info,
} from 'lucide-react';

interface MerchantPostsDashboardProps {
  business: MerchantBusinessInfo;
  posts: MerchantPostItem[];
  onOpenCreatePostModal: () => void;
  onToggleLikePost: (id: string) => void;
}

export function MerchantPostsDashboard({
  business,
  posts,
  onOpenCreatePostModal,
  onToggleLikePost,
}: MerchantPostsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'scheduled' | 'drafts' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const totalPosts = posts.length;
  const publishedPosts = posts.filter((p) => p.status === 'Published').length;
  const scheduledPosts = posts.filter((p) => p.status === 'Scheduled').length;
  const draftPosts = posts.filter((p) => p.status === 'Draft').length;
  const archivedPosts = posts.filter((p) => p.status === 'Archived').length;
  const totalViews = posts.reduce((acc, p) => acc + (p.views || 0), 0);
  const totalInteractions = posts.reduce((acc, p) => acc + (p.likes || 0), 0);
  const totalShares = posts.reduce((acc, p) => acc + (p.shares || 0), 0);

  const filteredPosts = posts.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'drafts' && p.status === 'Draft') ||
      p.status.toLowerCase() === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6">
      {/* =========================================================================
          HERO BANNER
         ========================================================================= */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#1E124A] via-[#2E166A] to-[#461F92] p-6 sm:p-8 text-white overflow-hidden shadow-xl border border-indigo-900/30">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="max-w-xl">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
              Posts & Updates
            </h1>
            <p className="text-sm text-purple-200/90 leading-relaxed">
              Share the latest news, announcements, and updates with your local customers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenCreatePostModal}
              className="px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create New Post</span>
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
          STATISTICS STRIP
         ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-500">Total Posts</span>
            <FileText className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{totalPosts}</p>
          <span className="text-[10px] text-slate-500 font-medium">All published updates</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-500">Total Views</span>
            <Eye className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{totalViews.toLocaleString()}</p>
          <span className="text-[10px] text-slate-500 font-medium">Total impressions</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-500">Total Interactions</span>
            <Heart className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{totalInteractions.toLocaleString()}</p>
          <span className="text-[10px] text-slate-500 font-medium">Likes and reactions</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-500">Total Shares</span>
            <Share2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{totalShares.toLocaleString()}</p>
          <span className="text-[10px] text-slate-500 font-medium">Shared with neighbors</span>
        </div>
      </div>

      {/* =========================================================================
          TWO-COLUMN MAIN SECTION
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Posts Feed / Table (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Filter and Search Bar */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: `All Posts (${totalPosts})` },
                { id: 'published', label: `Published (${publishedPosts})` },
                { id: 'scheduled', label: `Scheduled (${scheduledPosts})` },
                { id: 'drafts', label: `Drafts (${draftPosts})` },
                { id: 'archived', label: `Archived (${archivedPosts})` },
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
                  placeholder="Search posts..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-purple-600"
                />
              </div>
              <button
                type="button"
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer"
              >
                <span>Latest First</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Posts List */}
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs divide-y divide-slate-100">
            {filteredPosts.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-12 h-12 text-purple-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-800">No Posts Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                  {posts.length === 0
                    ? 'You have not published any posts or announcements yet. Keep your neighborhood updated!'
                    : 'No posts match your selected filter or search query.'}
                </p>
                <button
                  type="button"
                  onClick={onOpenCreatePostModal}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create First Post</span>
                </button>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <div key={post.id} className="p-4 sm:p-5 hover:bg-slate-50/70 transition">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-extrabold">
                            {post.type}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                              post.status === 'Published'
                                ? 'bg-emerald-50 text-emerald-700'
                                : post.status === 'Scheduled'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {post.status}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">
                          {post.title}
                        </h4>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {post.caption}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {post.date}
                        </p>
                      </div>
                    </div>

                    {/* Actions & Metrics */}
                    <div className="flex items-center sm:flex-col items-end justify-between sm:justify-start gap-3 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1" title="Views">
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          {post.views}
                        </span>
                        <button
                          type="button"
                          onClick={() => onToggleLikePost(post.id)}
                          className={`flex items-center gap-1 transition cursor-pointer ${
                            post.isLiked ? 'text-rose-600 font-bold' : 'hover:text-rose-500'
                          }`}
                          title="Likes"
                        >
                          <Heart className={`w-3.5 h-3.5 ${post.isLiked ? 'fill-rose-600' : ''}`} />
                          {post.likes}
                        </button>
                        <span className="flex items-center gap-1" title="Shares">
                          <Share2 className="w-3.5 h-3.5 text-slate-400" />
                          {post.shares}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => alert(`Edit post: ${post.title}`)}
                        className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Insights & Quick Actions (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Post Insights Box */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                Post Insights
              </h4>
              <span className="text-xs font-bold text-slate-500">Live</span>
            </div>

            <div className="p-3 bg-purple-50/60 rounded-2xl border border-purple-100 mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-purple-800">Total Post Reach</p>
                <p className="text-xl font-extrabold text-purple-950 mt-0.5">{totalViews.toLocaleString()}</p>
              </div>
              <span className="text-[10px] font-extrabold text-purple-700 px-2 py-0.5 bg-purple-100 rounded-full">
                Active Feed
              </span>
            </div>

            <div className="h-20 w-full pt-1">
              <svg className="w-full h-full" viewBox="0 0 200 60">
                <path
                  d="M 0 45 Q 40 30, 70 35 T 130 15 T 180 25 T 200 10"
                  fill="none"
                  stroke="#7C3AED"
                  strokeWidth="2.5"
                />
              </svg>
            </div>
          </div>

          {/* Quick Actions Box */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <h4 className="text-xs font-extrabold text-slate-900 mb-3">Quick Actions</h4>
            <div className="space-y-2 text-xs">
              <button
                type="button"
                onClick={onOpenCreatePostModal}
                className="w-full p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold flex items-center gap-2.5 transition cursor-pointer"
              >
                <Edit2 className="w-4 h-4 text-purple-600" />
                <span>Write a Post</span>
              </button>
              <button
                type="button"
                onClick={onOpenCreatePostModal}
                className="w-full p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold flex items-center gap-2.5 transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-rose-600" />
                <span>Share an Offer</span>
              </button>
              <button
                type="button"
                onClick={onOpenCreatePostModal}
                className="w-full p-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold flex items-center gap-2.5 transition cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>Create Event Post</span>
              </button>
              <button
                type="button"
                onClick={() => alert('Post Templates: Festive Greetings, Monsoon Special, Weekly Special')}
                className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold flex items-center gap-2.5 transition cursor-pointer"
              >
                <FileText className="w-4 h-4 text-slate-600" />
                <span>Use Template</span>
              </button>
            </div>
          </div>

          {/* Post Tips Callout Box */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-3xl border border-indigo-100 shadow-xs">
            <h4 className="text-xs font-extrabold text-indigo-950 mb-2 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-indigo-600" />
              Post Tips
            </h4>
            <p className="text-[11px] text-indigo-900 font-semibold mb-2">
              Keep your customers informed:
            </p>
            <ul className="space-y-1.5 text-[11px] text-slate-700">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                Share photos and real updates
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                Announce special offers and events
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                Inform about changes in timings
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                Showcase new products or services
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                Engage with your local community
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
