import React, { useState } from 'react';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  Phone,
  MapPin,
  RefreshCw,
  Search,
  Filter,
  Check,
  ChevronRight,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CreditCard,
  QrCode,
  DollarSign,
  Printer,
} from 'lucide-react';
import { MerchantOrderItem, MerchantBusinessInfo } from '../types';
import { realtimeService } from '../../services/realtimeService';

interface MerchantOrdersDashboardProps {
  business: MerchantBusinessInfo;
  orders: MerchantOrderItem[];
  onUpdateOrderStatus: (orderNumber: string, nextStatus: 'placed' | 'confirmed' | 'out_for_delivery' | 'delivered' | 'cancelled') => void;
  onSimulateOrder: () => void;
}

export function MerchantOrdersDashboard({
  business,
  orders,
  onUpdateOrderStatus,
  onSimulateOrder,
}: MerchantOrdersDashboardProps) {
  const [filterTab, setFilterTab] = useState<'all' | 'placed' | 'confirmed' | 'out_for_delivery' | 'delivered'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [processingOrderNum, setProcessingOrderNum] = useState<string | null>(null);

  // Status Metrics
  const placedCount = orders.filter((o) => o.status === 'placed').length;
  const confirmedCount = orders.filter((o) => o.status === 'confirmed').length;
  const outCount = orders.filter((o) => o.status === 'out_for_delivery').length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;
  const todayRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.finalPayable, 0);

  // Filtered List
  const filteredOrders = orders.filter((o) => {
    if (filterTab !== 'all' && o.status !== filterTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = o.orderNumber.toLowerCase().includes(q);
      const matchName = o.customerName.toLowerCase().includes(q);
      const matchAddress = o.deliveryAddress.toLowerCase().includes(q);
      return matchNum || matchName || matchAddress;
    }
    return true;
  });

  const handleAdvanceStatus = async (order: MerchantOrderItem) => {
    const nextStatusMap: Record<string, 'confirmed' | 'out_for_delivery' | 'delivered'> = {
      placed: 'confirmed',
      confirmed: 'out_for_delivery',
      out_for_delivery: 'delivered',
    };

    const nextStatus = nextStatusMap[order.status];
    if (!nextStatus) return;

    setProcessingOrderNum(order.orderNumber);
    try {
      // 1. Update in parent merchant state & local cache
      onUpdateOrderStatus(order.orderNumber, nextStatus);

      // 2. Broadcast via WebSockets & update backend
      await realtimeService.triggerOrderStatusUpdate(order.orderNumber, nextStatus);
    } finally {
      setProcessingOrderNum(null);
    }
  };

  const handlePrintKOT = (order: MerchantOrderItem) => {
    const kotWindow = window.open('', '_blank', 'width=400,height=600');
    if (kotWindow) {
      kotWindow.document.write(`
        <html>
          <head>
            <title>KOT - ${order.orderNumber}</title>
            <style>
              body { font-family: monospace; padding: 20px; font-size: 13px; line-height: 1.4; }
              .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 12px; }
              .item { display: flex; justify-content: space-between; margin: 6px 0; }
              .total { border-top: 1px dashed #000; padding-top: 8px; margin-top: 10px; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>${business.name}</h2>
              <p>*** KITCHEN ORDER TICKET (KOT) ***</p>
              <p>Order: ${order.orderNumber}</p>
              <p>Time: ${new Date(order.createdAt).toLocaleTimeString()}</p>
              <p>Customer: ${order.customerName}</p>
            </div>
            <div>
              ${order.items.map((it) => `<div class="item"><span>${it.quantity}x ${it.productName}</span><span>₹${it.totalPrice}</span></div>`).join('')}
            </div>
            <div class="total">
              <div class="item"><span>TOTAL PAYABLE</span><span>₹${order.finalPayable}</span></div>
              <p>Payment: ${order.paymentMethod.toUpperCase()} (${order.paymentStatus})</p>
              <p>Address: ${order.deliveryAddress}</p>
            </div>
            <script>window.print();</script>
          </body>
        </html>
      `);
      kotWindow.document.close();
    }
  };

  return (
    <div className="space-y-6">
      {/* =========================================================================
          HERO BANNER (Live Dispatch Center)
         ========================================================================= */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#170E3A] via-[#2D1664] to-[#4A208D] p-6 sm:p-8 text-white overflow-hidden shadow-xl border border-indigo-900/30">
        <div className="absolute right-0 top-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-purple-200 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Order Dispatch Center • Real-Time WebSockets
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
              Orders & Deliveries
            </h1>
            <p className="text-sm text-purple-200/90 leading-relaxed">
              Accept incoming neighbor baskets, prepare fresh dishes, coordinate rider dispatch, and track doorstep fulfillment.
            </p>
          </div>

          {/* Quick Simulation / Action Button */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onSimulateOrder}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-extrabold shadow-lg hover:shadow-xl transition flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              Simulate Customer Order
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          5 STATUS SUMMARY KPI CARDS
         ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Card 1: New / Placed */}
        <div
          onClick={() => setFilterTab('placed')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            filterTab === 'placed'
              ? 'bg-rose-50/80 border-rose-300 ring-2 ring-rose-400 shadow-sm'
              : 'bg-white border-slate-200/80 hover:border-rose-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wide">New Orders</span>
            <span className={`w-2.5 h-2.5 rounded-full ${placedCount > 0 ? 'bg-rose-500 animate-ping' : 'bg-slate-300'}`} />
          </div>
          <p className="text-2xl font-black text-slate-900">{placedCount}</p>
          <span className="text-[10px] font-bold text-rose-600">Requires Acceptance</span>
        </div>

        {/* Card 2: In Kitchen / Preparing */}
        <div
          onClick={() => setFilterTab('confirmed')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            filterTab === 'confirmed'
              ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-400 shadow-sm'
              : 'bg-white border-slate-200/80 hover:border-blue-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wide">In Kitchen</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{confirmedCount}</p>
          <span className="text-[10px] font-bold text-blue-600">Packing & Prep</span>
        </div>

        {/* Card 3: Out for Delivery */}
        <div
          onClick={() => setFilterTab('out_for_delivery')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            filterTab === 'out_for_delivery'
              ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400 shadow-sm'
              : 'bg-white border-slate-200/80 hover:border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wide">Out on Road</span>
            <Truck className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{outCount}</p>
          <span className="text-[10px] font-bold text-amber-600">En Route to Doorstep</span>
        </div>

        {/* Card 4: Delivered */}
        <div
          onClick={() => setFilterTab('delivered')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            filterTab === 'delivered'
              ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-400 shadow-sm'
              : 'bg-white border-slate-200/80 hover:border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wide">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{deliveredCount}</p>
          <span className="text-[10px] font-bold text-emerald-600">Successfully Delivered</span>
        </div>

        {/* Card 5: Today's Revenue */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-purple-200/80">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-extrabold text-purple-700 uppercase tracking-wide">Today's Sales</span>
            <DollarSign className="w-4 h-4 text-purple-700" />
          </div>
          <p className="text-2xl font-black text-purple-900">₹{todayRevenue}</p>
          <span className="text-[10px] font-bold text-purple-600">Across {orders.length} orders</span>
        </div>
      </div>

      {/* =========================================================================
          CONTROLS STRIP (Tabs & Search)
         ========================================================================= */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Orders', count: orders.length },
            { id: 'placed', label: 'New', count: placedCount },
            { id: 'confirmed', label: 'Preparing', count: confirmedCount },
            { id: 'out_for_delivery', label: 'En Route', count: outCount },
            { id: 'delivered', label: 'Delivered', count: deliveredCount },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                filterTab === tab.id
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                  filterTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search order #, customer, address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition"
          />
        </div>
      </div>

      {/* =========================================================================
          ORDER CARDS LIST
         ========================================================================= */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-7 h-7 stroke-1" />
          </div>
          <h4 className="text-base font-bold text-slate-900">No orders found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {filterTab !== 'all'
              ? `There are currently no orders in "${filterTab.replace(/_/g, ' ')}" status.`
              : 'You have not received any orders yet. Click "Simulate Customer Order" above to test live order processing.'}
          </p>
          <button
            type="button"
            onClick={onSimulateOrder}
            className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition"
          >
            Generate Test Order
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredOrders.map((order) => {
            const isProcessing = processingOrderNum === order.orderNumber;
            const timeAgo = Math.max(
              1,
              Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000)
            );

            return (
              <div
                key={order.orderNumber}
                className={`bg-white rounded-2xl border transition shadow-xs flex flex-col justify-between overflow-hidden ${
                  order.status === 'placed'
                    ? 'border-rose-300 ring-1 ring-rose-200'
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                {/* Order Card Top Header */}
                <div className="p-4 border-b border-slate-100 flex items-start justify-between gap-3 bg-slate-50/50">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-slate-900">
                        {order.orderNumber}
                      </span>
                      {order.status === 'placed' && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-extrabold animate-pulse">
                          ● NEW ORDER
                        </span>
                      )}
                      {order.status === 'confirmed' && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-extrabold">
                          IN KITCHEN
                        </span>
                      )}
                      {order.status === 'out_for_delivery' && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold">
                          OUT FOR DELIVERY
                        </span>
                      )}
                      {order.status === 'delivered' && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                          ✓ DELIVERED
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Received {timeAgo} min(s) ago • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-base font-black text-slate-900">₹{order.finalPayable}</p>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        order.paymentStatus === 'paid'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {order.paymentMethod.toUpperCase()} ({order.paymentStatus})
                    </span>
                  </div>
                </div>

                {/* Customer & Address Details */}
                <div className="p-4 space-y-3 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        {order.customerName}
                      </h4>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="line-clamp-1">{order.deliveryAddress}</span>
                      </p>
                    </div>

                    <a
                      href={`tel:${order.customerPhone}`}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition shrink-0"
                    >
                      <Phone className="w-3 h-3 text-blue-600" />
                      Call
                    </a>
                  </div>

                  {order.notes && (
                    <div className="p-2 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900">
                      <strong>Customer note:</strong> {order.notes}
                    </div>
                  )}

                  {/* Items List */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">
                      Ordered Items ({order.items.length})
                    </p>
                    <div className="space-y-1">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs text-slate-800">
                          <span className="font-medium">
                            <span className="font-extrabold text-purple-700">{it.quantity}x</span> {it.productName}
                          </span>
                          <span className="font-bold text-slate-600">₹{it.totalPrice}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handlePrintKOT(order)}
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition text-xs font-bold flex items-center gap-1 cursor-pointer"
                    title="Print Kitchen Order Ticket (KOT)"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Print KOT</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {order.status === 'placed' && (
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleAdvanceStatus(order)}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        {isProcessing ? 'Accepting...' : 'Accept & Start Packing →'}
                      </button>
                    )}

                    {order.status === 'confirmed' && (
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleAdvanceStatus(order)}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        {isProcessing ? 'Updating...' : 'Handover to Delivery →'}
                      </button>
                    )}

                    {order.status === 'out_for_delivery' && (
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleAdvanceStatus(order)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {isProcessing ? 'Completing...' : 'Mark Delivered ✓'}
                      </button>
                    )}

                    {order.status === 'delivered' && (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
