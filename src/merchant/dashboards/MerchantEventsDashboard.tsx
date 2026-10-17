import React, { useState } from 'react';
import { MerchantEventItem, MerchantBusinessInfo } from '../types';
import {
  Calendar,
  Search,
  Filter,
  Plus,
  Users,
  MapPin,
  Clock,
  Sparkles,
  Edit2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface MerchantEventsDashboardProps {
  business: MerchantBusinessInfo;
  events: MerchantEventItem[];
  onOpenCreateEventModal: () => void;
}

export function MerchantEventsDashboard({
  business,
  events,
  onOpenCreateEventModal,
}: MerchantEventsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'ongoing' | 'past' | 'drafts'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'upcoming' && (e.status === 'Upcoming' || e.status === 'Published')) ||
      e.status.toLowerCase() === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6">
      {/* =========================================================================
          HERO BANNER
         ========================================================================= */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#1E124A] via-[#2F1668] to-[#481F94] p-6 sm:p-8 text-white overflow-hidden shadow-xl border border-indigo-900/30">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="max-w-xl">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
              Events
            </h1>
            <p className="text-sm text-purple-200/90 leading-relaxed">
              Create, manage and promote your events to engage your local community.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenCreateEventModal}
              className="px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Event</span>
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
          STATISTICS COUNTERS
         ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-500">Total Events</span>
            <Calendar className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <p className="text-xl font-extrabold text-slate-900">24</p>
          <span className="text-[10px] text-emerald-600 font-bold">▲ 20% from last month</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-500">Published</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="text-xl font-extrabold text-emerald-700">14</p>
          <span className="text-[10px] text-emerald-600 font-bold">▲ 27% from last month</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-500">Upcoming</span>
            <Clock className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <p className="text-xl font-extrabold text-amber-600">5</p>
          <span className="text-[10px] text-emerald-600 font-bold">▲ 15% from last month</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-500">Ongoing</span>
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <p className="text-xl font-extrabold text-indigo-600">3</p>
          <span className="text-[10px] text-slate-400">Active today</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-500">Completed</span>
            <Users className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <p className="text-xl font-extrabold text-slate-500">2</p>
          <span className="text-[10px] text-slate-400">Past events</span>
        </div>
      </div>

      {/* =========================================================================
          UPCOMING EVENTS HIGHLIGHT CAROUSEL / ROW
         ========================================================================= */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-purple-600" />
            Upcoming Events
          </h3>
          <button
            type="button"
            className="text-xs font-bold text-purple-600 hover:text-purple-700"
          >
            View All &gt;
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="relative h-32 w-full bg-slate-900 overflow-hidden">
                  <img
                    src={evt.image}
                    alt={evt.title}
                    className="w-full h-full object-cover opacity-85"
                  />
                  <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-purple-600 text-white text-[10px] font-extrabold shadow-xs">
                    {evt.category}
                  </span>
                  {/* Date badge */}
                  <div className="absolute bottom-2 left-2.5 px-2 py-1 rounded-xl bg-white/95 text-center shadow-xs">
                    <span className="block text-xs font-extrabold text-purple-700 leading-none">
                      {evt.dayNumber}
                    </span>
                    <span className="block text-[8px] font-extrabold text-slate-500 uppercase leading-none">
                      {evt.monthText}
                    </span>
                  </div>
                </div>

                <div className="p-3.5">
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1 mb-1">
                    {evt.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mb-2">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{evt.venue}</span>
                  </p>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    {evt.description}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <div className="text-[10px] text-slate-500 font-semibold">
                  <span>{evt.interestedCount} Interested</span> •{' '}
                  <span className="text-emerald-600">{evt.goingCount} Going</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => alert(`View details for: ${evt.title}`)}
                    className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-[10px] hover:bg-slate-50"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => alert(`Edit event: ${evt.title}`)}
                    className="px-2 py-1 rounded-lg bg-purple-600 text-white font-bold text-[10px] hover:bg-purple-700 shadow-2xs"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
          TWO-COLUMN MAIN SECTION (Left: All Events Table | Right: Calendar & Categories)
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: All Events Table (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'All Events (24)' },
                { id: 'upcoming', label: 'Upcoming (5)' },
                { id: 'ongoing', label: 'Ongoing (3)' },
                { id: 'past', label: 'Past (16)' },
                { id: 'drafts', label: 'Drafts (2)' },
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
                  placeholder="Search events..."
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

          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
            <div className="divide-y divide-slate-100">
              {filteredEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-4 hover:bg-slate-50/70 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                      <img src={evt.image} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 truncate">{evt.title}</h4>
                      <p className="text-[11px] text-slate-500 truncate">{evt.venue}</p>
                      <span className="inline-block mt-0.5 px-2 py-0.2 rounded-md bg-purple-50 text-purple-700 text-[10px] font-extrabold">
                        {evt.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div>
                      <p className="font-semibold text-slate-700">{evt.dateDisplay}</p>
                      <span className="text-[10px] font-bold text-emerald-600">
                        {evt.status}
                      </span>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-slate-900">
                        {evt.interestedCount} / {evt.goingCount}
                      </p>
                      <p className="text-[10px] text-slate-400">Int / Going</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => alert(`Edit event: ${evt.title}`)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive May 2025 Calendar & Categories (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Calendar Widget */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-extrabold text-slate-900">May 2025</h4>
              <div className="flex items-center gap-1">
                <button type="button" className="p-1 hover:bg-slate-100 rounded-lg text-slate-500">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button type="button" className="p-1 hover:bg-slate-100 rounded-lg text-slate-500">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days of week header */}
            <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 mb-2">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 text-center text-xs gap-y-2">
              <span className="text-slate-300">27</span>
              <span className="text-slate-300">28</span>
              <span className="text-slate-300">29</span>
              <span className="text-slate-300">30</span>
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
              <span>6</span>
              <span>7</span>
              <span>8</span>
              <span>9</span>
              <span>10</span>
              <span>11</span>
              {/* Event day 12 */}
              <span className="font-extrabold text-white bg-purple-600 rounded-full w-6 h-6 flex items-center justify-center mx-auto shadow-xs">
                12
              </span>
              <span>13</span>
              <span>14</span>
              {/* Event day 15 */}
              <span className="font-extrabold text-white bg-rose-500 rounded-full w-6 h-6 flex items-center justify-center mx-auto shadow-xs">
                15
              </span>
              <span>16</span>
              <span>17</span>
              <span>18</span>
              <span>19</span>
              {/* Event day 20 */}
              <span className="font-extrabold text-white bg-indigo-600 rounded-full w-6 h-6 flex items-center justify-center mx-auto shadow-xs">
                20
              </span>
              <span>21</span>
              <span>22</span>
              <span>23</span>
              <span>24</span>
              {/* Event day 25 */}
              <span className="font-extrabold text-white bg-emerald-600 rounded-full w-6 h-6 flex items-center justify-center mx-auto shadow-xs">
                25
              </span>
              <span>26</span>
              <span>27</span>
              <span>28</span>
              <span>29</span>
              <span>30</span>
              <span>31</span>
            </div>

            <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500 mt-4 pt-3 border-t border-slate-100">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-600" /> Event
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500" /> Ongoing
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-300" /> Past
              </span>
            </div>
          </div>

          {/* Event Categories List */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-extrabold text-slate-900">Event Categories</h4>
              <button
                type="button"
                className="text-xs font-bold text-purple-600 hover:text-purple-700"
              >
                Manage
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1">
                <span className="flex items-center gap-2 text-slate-700">
                  🎵 Music
                </span>
                <span className="font-bold text-slate-900">6</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="flex items-center gap-2 text-slate-700">
                  🍴 Food & Drinks
                </span>
                <span className="font-bold text-slate-900">5</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="flex items-center gap-2 text-slate-700">
                  🎓 Workshops & Learning
                </span>
                <span className="font-bold text-slate-900">4</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="flex items-center gap-2 text-slate-700">
                  ⚽ Sports & Fitness
                </span>
                <span className="font-bold text-slate-900">3</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="flex items-center gap-2 text-slate-700">
                  💼 Business & Networking
                </span>
                <span className="font-bold text-slate-900">2</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="flex items-center gap-2 text-slate-700">
                  ✨ Others
                </span>
                <span className="font-bold text-slate-900">0</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <h4 className="text-xs font-extrabold text-slate-900 mb-3">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={onOpenCreateEventModal}
                className="p-3 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold flex flex-col items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-4 h-4 text-purple-600" />
                <span>Create New Event</span>
              </button>
              <button
                type="button"
                onClick={() => alert('Event Templates')}
                className="p-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold flex flex-col items-center gap-1.5 transition cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>Event Templates</span>
              </button>
              <button
                type="button"
                onClick={() => alert('Manage Categories')}
                className="p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold flex flex-col items-center gap-1.5 transition cursor-pointer"
              >
                <Users className="w-4 h-4 text-amber-600" />
                <span>Manage Categories</span>
              </button>
              <button
                type="button"
                onClick={() => alert('View Public Listing')}
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
