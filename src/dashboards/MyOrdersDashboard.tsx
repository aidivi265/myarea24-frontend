import React, { useState, useEffect } from 'react';
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  FileText,
  Phone,
  Calendar,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
  Wrench,
  ChevronRight,
  ExternalLink,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import { getStoredAuthUser } from '../services/communityMarketplaceService';

interface OrderItem {
  product_name: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  store_name?: string;
  image_url?: string;
}

interface OrderRecord {
  id: number;
  order_number: string;
  business_name?: string;
  status: 'placed' | 'confirmed' | 'out_for_delivery' | 'delivered' | 'cancelled';
  total_amount: number;
  delivery_fee: number;
  platform_fee: number;
  discount_amount: number;
  final_payable: number;
  payment_method: string;
  payment_status: string;
  transaction_id?: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  delivery_landmark?: string;
  delivery_pincode?: string;
  estimated_delivery_mins?: number;
  created_at: string;
  items_count: number;
  items: OrderItem[];
}

interface BookingRecord {
  id: number;
  booking_number: string;
  service_title: string;
  category: string;
  provider_name: string;
  provider_phone: string;
  customer_name: string;
  customer_phone: string;
  service_address: string;
  scheduled_date: string;
  scheduled_slot: string;
  status: 'requested' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  estimated_cost: number;
  otp_code?: string;
  created_at: string;
}

export function MyOrdersDashboard() {
  const [activeTab, setActiveTab] = useState<'orders' | 'bookings'>('orders');
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchPhone, setSearchPhone] = useState<string>('');
  const [guestOrderNum, setGuestOrderNum] = useState<string>('');
  const [guestToken, setGuestToken] = useState<string>('');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<OrderRecord | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const currentUser = getStoredAuthUser();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const token = localStorage.getItem('myarea24_auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const orderUrl = '/api/v1/orders';
      const bookingUrl = '/api/v1/services/bookings';

      const [orderRes, bookingRes] = await Promise.all([
        fetch(orderUrl, { headers }).then((r) => r.json()),
        fetch(bookingUrl, { headers }).then((r) => r.json()),
      ]);

      if (orderRes.orders) {
        setOrders(orderRes.orders);
      }
      if (bookingRes.bookings) {
        setBookings(bookingRes.bookings);
      }
    } catch (err: any) {
      setError('Could not retrieve orders. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestOrderNum.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const cleanNum = guestOrderNum.trim();
      const url = guestToken.trim()
        ? `/api/v1/orders/${encodeURIComponent(cleanNum)}?token=${encodeURIComponent(guestToken.trim())}`
        : `/api/v1/orders/${encodeURIComponent(cleanNum)}`;

      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.order) {
        setOrders([data.order]);
        setActiveTab('orders');
      } else {
        setError(data.detail || 'Order not found. Please provide a valid order number and tracking token.');
      }
    } catch (err) {
      setError('Network error while looking up order.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCancelOrder = async (orderNumber: string) => {
    if (!window.confirm(`Are you sure you want to cancel order ${orderNumber}?`)) return;
    setCancellingId(orderNumber);
    try {
      const token = localStorage.getItem('myarea24_auth_token');
      const res = await fetch(`/api/v1/orders/${orderNumber}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: 'cancelled', notes: 'Cancelled by customer' }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.order_number === orderNumber ? { ...o, status: 'cancelled' } : o))
        );
      } else {
        const data = await res.json();
        alert(data.detail || 'Could not cancel order.');
      }
    } catch (e) {
      alert('Network error while cancelling order.');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'placed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Placed
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle className="w-3.5 h-3.5" /> Confirmed
          </span>
        );
      case 'out_for_delivery':
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Truck className="w-3.5 h-3.5" /> Out for Delivery
          </span>
        );
      case 'delivered':
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5" /> Delivered
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  const renderStageTracker = (status: string) => {
    if (status === 'cancelled') {
      return (
        <div className="bg-rose-50/50 border border-rose-200 rounded-xl p-3 flex items-center gap-2.5 text-xs text-rose-700">
          <XCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>This order was cancelled. Items have been returned to store inventory.</span>
        </div>
      );
    }

    const stages = [
      { key: 'placed', label: 'Placed' },
      { key: 'confirmed', label: 'Accepted' },
      { key: 'out_for_delivery', label: 'On Way' },
      { key: 'delivered', label: 'Delivered' },
    ];

    const stageIndexMap: Record<string, number> = {
      placed: 0,
      confirmed: 1,
      out_for_delivery: 2,
      delivered: 3,
    };

    const currentIdx = stageIndexMap[status] ?? 0;

    return (
      <div className="w-full py-2">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 z-0" />
          <div
            className="absolute top-1/2 left-0 h-1 bg-emerald-500 -translate-y-1/2 z-0 transition-all duration-500"
            style={{ width: `${(currentIdx / (stages.length - 1)) * 100}%` }}
          />

          {stages.map((stage, idx) => {
            const isCompleted = idx <= currentIdx;
            const isCurrent = idx === currentIdx;
            return (
              <div key={stage.key} className="flex flex-col items-center relative z-10">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                      : 'bg-white text-slate-400 border-2 border-slate-300'
                  }`}
                >
                  {isCompleted ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                </div>
                <span
                  className={`text-[11px] mt-1 font-semibold ${
                    isCurrent ? 'text-emerald-700 font-bold' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                  }`}
                >
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <ShoppingBag className="w-7 h-7 text-emerald-600" />
            My Orders & Bookings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track your hyper-local neighborhood deliveries and service appointments
          </p>
        </div>

        {/* Guest tracking lookup if not logged in */}
        {!currentUser && (
          <form onSubmit={handleGuestLookup} className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Order # (e.g. MA24-ORD-1234)"
              value={guestOrderNum}
              onChange={(e) => setGuestOrderNum(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none w-44"
              required
            />
            <input
              type="text"
              placeholder="Tracking Key"
              value={guestToken}
              onChange={(e) => setGuestToken(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none w-32"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Track
            </button>
          </form>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-2xl px-6 pt-3">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 py-3 px-5 text-sm font-bold border-b-2 transition cursor-pointer ${
            activeTab === 'orders'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Package className="w-4 h-4" />
          Store Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`flex items-center gap-2 py-3 px-5 text-sm font-bold border-b-2 transition cursor-pointer ${
            activeTab === 'bookings'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Wrench className="w-4 h-4" />
          Service Bookings ({bookings.length})
        </button>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
          <p className="text-slate-600 text-sm font-medium">Fetching your orders from nearby stores...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-700">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-rose-500" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      ) : activeTab === 'orders' ? (
        orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Orders Found</h3>
            <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
              You haven't placed any orders yet. Browse products from your local kirana and stores to get started!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:border-emerald-200 transition space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-900 text-sm bg-slate-100 px-3 py-1 rounded-lg">
                      {order.order_number}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(order.status)}
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                        order.payment_status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.payment_status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Tracking Progress */}
                {renderStageTracker(order.status)}

                {/* Items preview */}
                <div className="bg-slate-50/70 rounded-xl p-4 divide-y divide-slate-200/60">
                  <div className="text-xs font-bold text-slate-700 pb-2 flex justify-between items-center">
                    <span>Store: {order.business_name || 'Neighborhood Store'}</span>
                    <span>{order.items_count} item{order.items_count > 1 ? 's' : ''}</span>
                  </div>

                  <div className="pt-2 space-y-2">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="text-slate-800 font-medium">
                          {it.product_name} <span className="text-slate-400">× {it.quantity}</span>
                        </span>
                        <span className="font-semibold text-slate-900">₹{it.total_price}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 mt-2 flex justify-between items-center text-xs">
                    <span className="text-slate-500">
                      Deliver to: <strong className="text-slate-700">{order.delivery_address}</strong>
                    </span>
                    <span className="text-sm font-black text-emerald-700">
                      Total: ₹{order.final_payable}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setSelectedInvoiceOrder(order)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    Sale Receipt / Challan
                  </button>

                  {order.status === 'placed' && (
                    <button
                      onClick={() => handleCancelOrder(order.order_number)}
                      disabled={cancellingId === order.order_number}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-rose-200 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      {cancellingId === order.order_number ? 'Cancelling...' : 'Cancel Order'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Bookings Tab */
        bookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Service Bookings</h3>
            <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
              Need an electrician, plumber, or appliance technician? Book verified local service professionals with instant OTP verification!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-900 text-sm bg-slate-100 px-3 py-1 rounded-lg">
                      {booking.booking_number}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {booking.category}
                    </span>
                  </div>
                  {getStatusBadge(booking.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1">{booking.service_title}</h4>
                    <p className="text-slate-500">Provider: <strong className="text-slate-700">{booking.provider_name}</strong></p>
                    <p className="text-slate-500 mt-1">Phone: <strong className="text-slate-700">{booking.provider_phone}</strong></p>
                    <p className="text-slate-500 mt-1">Address: <span className="text-slate-700">{booking.service_address}</span></p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl flex flex-col justify-between">
                    <div>
                      <p className="text-slate-500">Scheduled Date & Slot:</p>
                      <p className="font-bold text-slate-800 mt-0.5">{booking.scheduled_date} ({booking.scheduled_slot})</p>
                      <p className="text-slate-500 mt-2">Estimated Visit Cost: <strong className="text-emerald-700">₹{booking.estimated_cost}</strong></p>
                    </div>

                    {booking.otp_code && (
                      <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Service Completion OTP:</span>
                        <span className="font-mono font-black text-sm tracking-widest bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                          {booking.otp_code}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Tax Invoice Modal */}
      {selectedInvoiceOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-slate-900 text-lg">
                  {selectedInvoiceOrder.payment_status === 'paid'
                    ? 'Official Payment Receipt & Challan'
                    : selectedInvoiceOrder.payment_status === 'cod'
                    ? 'Cash on Delivery Memo & Challan'
                    : 'Order Summary & Proforma Challan'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInvoiceOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="text-xs space-y-4 font-mono text-slate-700">
              <div className="flex justify-between border-b border-dashed pb-3">
                <div>
                  <p className="font-bold text-slate-900">Seller / Merchant:</p>
                  <p>{selectedInvoiceOrder.business_name || 'Neighborhood Store'}</p>
                  <p>Verified Hyperlocal Merchant</p>
                  <p className="text-[10px] text-slate-500">Tax Category: Micro / Small Retail Enterprise (GST Exemption / Section 10)</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">Order / Receipt Ref:</p>
                  <p>{selectedInvoiceOrder.order_number}</p>
                  <p>Date: {new Date(selectedInvoiceOrder.created_at).toLocaleDateString()}</p>
                  <p>Txn: {selectedInvoiceOrder.transaction_id || 'COD-PENDING'}</p>
                </div>
              </div>

              <div>
                <p className="font-bold text-slate-900 mb-1">Billed & Delivered To:</p>
                <p>{selectedInvoiceOrder.customer_name} ({selectedInvoiceOrder.customer_phone})</p>
                <p>{selectedInvoiceOrder.delivery_address}</p>
              </div>

              {/* Items Table */}
              <table className="w-full text-left border-collapse border-y border-dashed py-2">
                <thead>
                  <tr className="border-b border-slate-200 font-bold text-slate-900">
                    <th className="py-1">Item</th>
                    <th className="py-1 text-center">Qty</th>
                    <th className="py-1 text-right">Unit (₹)</th>
                    <th className="py-1 text-right">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedInvoiceOrder.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-1">{it.product_name}</td>
                      <td className="py-1 text-center">{it.quantity}</td>
                      <td className="py-1 text-right">{it.unit_price}</td>
                      <td className="py-1 text-right font-semibold">{it.total_price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Summary */}
              <div className="space-y-1 text-right pt-2">
                <p>Items Subtotal: ₹{selectedInvoiceOrder.total_amount}</p>
                <p>Delivery Fee: ₹{selectedInvoiceOrder.delivery_fee}</p>
                <p>Platform & Tech Fee: ₹{selectedInvoiceOrder.platform_fee}</p>
                {selectedInvoiceOrder.discount_amount > 0 && (
                  <p className="text-emerald-600">Discount: -₹{selectedInvoiceOrder.discount_amount}</p>
                )}
                <p className="font-black text-slate-900 text-sm pt-1 border-t border-slate-300">
                  Grand Total Paid: ₹{selectedInvoiceOrder.final_payable}
                </p>
                <p className="text-[10px] text-slate-400 italic">
                  Payment Mode: {selectedInvoiceOrder.payment_method.toUpperCase()} ({selectedInvoiceOrder.payment_status.toUpperCase()})
                </p>
                <p className="text-[9px] text-slate-400 italic pt-1">
                  Sec. 31(3)(c) CGST: Composition / Unregistered Local Retail. Price inclusive of all local taxes. No input tax credit admissible.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-400">Authentic digital receipt generated by MyArea24.</span>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
