import React, { useState } from 'react';
import {
  MerchantConversation,
  MerchantBusinessInfo,
} from '../types';
import {
  MessageSquare,
  Search,
  Filter,
  Plus,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Send,
  CheckCheck,
  UserCheck,
  Tag,
  ShieldAlert,
  Sparkles,
  ChevronRight,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface MerchantMessagesDashboardProps {
  business: MerchantBusinessInfo;
  conversations: MerchantConversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onSendMessage: (conversationId: string, text: string) => void;
}

export function MerchantMessagesDashboard({
  business,
  conversations,
  activeConversationId,
  onSelectConversation,
  onSendMessage,
}: MerchantMessagesDashboardProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'enquiries' | 'customers'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');

  const currentConv =
    conversations.find((c) => c.id === activeConversationId) || conversations[0];

  const filteredConversations = conversations.filter((c) => {
    const matchesSearch =
      c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'unread' && c.unreadCount > 0) ||
      (activeTab === 'enquiries' && c.badge === 'Enquiry') ||
      (activeTab === 'customers' && c.badge === 'Customer');
    return matchesSearch && matchesTab;
  });

  const handleSend = () => {
    if (!messageInput.trim() || !currentConv) return;
    onSendMessage(currentConv.id, messageInput.trim());
    setMessageInput('');
  };

  const handleQuickReply = (preset: string) => {
    if (!currentConv) return;
    onSendMessage(currentConv.id, preset);
  };

  return (
    <div className="space-y-6">
      {/* =========================================================================
          HERO BANNER
         ========================================================================= */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#1E124A] via-[#2E166A] to-[#451F8D] p-6 sm:p-8 text-white overflow-hidden shadow-xl border border-indigo-900/30">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="max-w-xl">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
              Messages
            </h1>
            <p className="text-sm text-purple-200/90 leading-relaxed">
              Connect with your customers, respond to enquiries, and build stronger relationships.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => alert('New Message: Start chat with a customer by phone or email')}
              className="px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>+ New Message</span>
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
          STATS STRIP
         ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-500">Total Conversations</span>
            <MessageSquare className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">24</p>
          <span className="text-[10px] text-emerald-600 font-bold">▲ 32% from last month</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-500">New Messages</span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-700">18</p>
          <span className="text-[10px] text-emerald-600 font-bold">▲ 40% from last month</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-500">Replied</span>
            <CheckCheck className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">12</p>
          <span className="text-[10px] text-emerald-600 font-bold">▲ 20% from last month</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-500">Pending Reply</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-amber-600">3</p>
          <span className="text-[10px] text-rose-600 font-bold">▼ 25% from last month</span>
        </div>
      </div>

      {/* =========================================================================
          3-PANE MESSAGING WORKSPACE
         ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        {/* PANE 1: Conversations List (4 cols) */}
        <div className="lg:col-span-4 border-r border-slate-200 flex flex-col">
          {/* Tabs */}
          <div className="p-3 border-b border-slate-100 flex items-center gap-1 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All (24)' },
              { id: 'unread', label: 'Unread (3)' },
              { id: 'enquiries', label: 'Enquiries (12)' },
              { id: 'customers', label: 'Customers (9)' },
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

          {/* Search Box */}
          <div className="p-3 border-b border-slate-100 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-purple-600"
              />
            </div>
            <button
              type="button"
              className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800"
            >
              <Filter className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Conversations Scrollable Stream */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredConversations.map((conv) => {
              const isSelected = conv.id === currentConv?.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  className={`p-3.5 transition cursor-pointer flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-purple-50/80 border-l-4 border-purple-600'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-extrabold text-xs flex items-center justify-center shrink-0">
                      {conv.avatar}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {conv.customerName}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-slate-100 text-slate-600">
                          {conv.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{conv.lastMessage}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 block mb-1">
                      {conv.lastTime}
                    </span>
                    {conv.unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold inline-flex items-center justify-center">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PANE 2: Active Chat Window (5 cols on lg, or full on mobile) */}
        <div className="lg:col-span-5 border-r border-slate-200 flex flex-col justify-between bg-slate-50/40">
          {currentConv ? (
            <>
              {/* Chat Header */}
              <div className="p-3.5 bg-white border-b border-slate-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                    {currentConv.avatar}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {currentConv.customerName}
                      </h4>
                      <span className="px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 text-[10px] font-extrabold">
                        {currentConv.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">Last seen 5 minutes ago</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => alert(`Calling ${currentConv.customerName} at ${currentConv.phone}`)}
                    className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition"
                  >
                    <Phone className="w-4 h-4 text-purple-600" />
                  </button>
                  <button
                    type="button"
                    onClick={() => alert(`Starting video call with ${currentConv.customerName}`)}
                    className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition"
                  >
                    <Video className="w-4 h-4 text-purple-600" />
                  </button>
                  <button
                    type="button"
                    onClick={() => alert('Options: Block, Mute, Add Tag')}
                    className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
                <div className="text-center">
                  <span className="px-3 py-1 rounded-full bg-white text-slate-400 border border-slate-200 text-[10px] font-semibold shadow-2xs">
                    Today, 12 May 2025
                  </span>
                </div>

                {currentConv.messages.map((msg) => {
                  const isMerchant = msg.sender === 'merchant';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMerchant ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs shadow-xs leading-relaxed ${
                          isMerchant
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-sm'
                            : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-sm'
                        }`}
                      >
                        <p className="whitespace-pre-line">{msg.text}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 px-1 flex items-center gap-1">
                        {msg.time} {isMerchant && <CheckCheck className="w-3 h-3 text-purple-600" />}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Quick Reply Pills */}
              <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
                <span className="text-[10px] font-bold text-slate-400 shrink-0">Quick:</span>
                {[
                  'Yes, we have 20% off on all beverages today!',
                  'Can I confirm your table for 8 people?',
                  'Here is our full menu: https://myarea24.in/menu',
                ].map((reply, rIdx) => (
                  <button
                    key={rIdx}
                    type="button"
                    onClick={() => handleQuickReply(reply)}
                    className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-purple-50 text-slate-600 hover:text-purple-700 text-[10px] font-medium whitespace-nowrap transition cursor-pointer shrink-0"
                  >
                    {reply}
                  </button>
                ))}
              </div>

              {/* Input Bar */}
              <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => alert('Attach file or photo')}
                  className="p-2 text-slate-400 hover:text-slate-600"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => alert('Emoji picker')}
                  className="p-2 text-slate-400 hover:text-slate-600"
                >
                  <Smile className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-purple-600 font-medium"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  className="w-9 h-9 rounded-xl bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center transition cursor-pointer shadow-xs shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <MessageSquare className="w-12 h-12 mb-2 text-slate-300" />
              <p className="text-xs font-bold text-slate-600">Select a conversation</p>
            </div>
          )}
        </div>

        {/* PANE 3: Customer Details & Quick Actions (3 cols, hidden on smaller screens) */}
        <div className="lg:col-span-3 p-4 bg-white flex flex-col justify-between hidden lg:flex">
          {currentConv ? (
            <div className="space-y-4 text-xs">
              {/* Customer Avatar & Name */}
              <div className="text-center pb-3 border-b border-slate-100">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-extrabold text-lg flex items-center justify-center mx-auto mb-2 shadow-sm">
                  {currentConv.avatar}
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm">
                  {currentConv.customerName}
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold">
                  Regular Customer
                </span>
              </div>

              {/* Contact Information */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Customer Details
                </span>
                <p className="text-slate-600 flex items-center gap-1.5">
                  📞 <span className="font-semibold text-slate-800">{currentConv.phone}</span>
                </p>
                <p className="text-slate-600 flex items-center gap-1.5 truncate">
                  ✉️ <span className="font-semibold text-slate-800 truncate">{currentConv.email}</span>
                </p>
                <p className="text-slate-600 flex items-center gap-1.5">
                  📍 <span className="font-semibold text-slate-800">{currentConv.location}</span>
                </p>
                <p className="text-slate-500 text-[10px]">
                  Joined on {currentConv.memberSince}
                </p>
              </div>

              {/* Tags */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Conversation Tags
                  </span>
                  <button type="button" className="text-[10px] font-bold text-purple-600">
                    Edit
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {currentConv.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold"
                    >
                      {t}
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={() => alert('Add Tag')}
                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold"
                  >
                    + Add Tag
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                  Quick Actions
                </span>
                <button
                  type="button"
                  onClick={() => alert(`Marked conversation as resolved with ${currentConv.customerName}`)}
                  className="w-full py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-bold text-left flex items-center gap-2 transition"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Mark as Resolved</span>
                </button>
                <button
                  type="button"
                  onClick={() => alert(`Added ${currentConv.customerName} to VIP customers`)}
                  className="w-full py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 font-bold text-left flex items-center gap-2 transition"
                >
                  <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                  <span>Add to Customers</span>
                </button>
                <button
                  type="button"
                  onClick={() => alert(`Created exclusive 15% discount coupon for ${currentConv.customerName}`)}
                  className="w-full py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold text-left flex items-center gap-2 transition"
                >
                  <Tag className="w-3.5 h-3.5 text-rose-600" />
                  <span>Create Offer for Customer</span>
                </button>
                <button
                  type="button"
                  onClick={() => alert(`Block user ${currentConv.customerName}`)}
                  className="w-full py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 font-bold text-left flex items-center gap-2 transition"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Block User</span>
                </button>
              </div>

              {/* Past Conversations */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Past Conversations
                  </span>
                  <span className="text-[10px] text-purple-600 font-bold">View All &gt;</span>
                </div>
                <div className="space-y-1.5 text-[10px] text-slate-500">
                  <p>📅 12 Apr 2025: Thanks for the great service!</p>
                  <p>📅 05 Mar 2025: Do you have parking available?</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
