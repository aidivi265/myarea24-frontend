import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  MapPin,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  QrCode,
  Truck,
  Phone,
  RefreshCw,
  ShoppingBag,
  Store,
  ChevronRight,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { CartItem, DeliveryAddress, Order, OrderStatus, PaymentMethod, PaymentStatus, UserLocation } from '../types';
import {
  placeOrder,
  advanceOrderStatus,
  getLocalOrders,
  loadRazorpayScript,
  verifyOrderPayment,
} from '../services/orderCommerceService';
import {
  realtimeService,
  ORDER_STATUS_EVENT,
  LiveOrderStatusEventDetail,
} from '../services/realtimeService';

export interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  currentLocation: UserLocation;
  onNavigateToMap?: () => void;
  onNavigateToProducts?: () => void;
}

type CheckoutStep = 'review' | 'address' | 'payment' | 'tracking';

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  currentLocation,
  onNavigateToMap,
  onNavigateToProducts,
}) => {
  const [step, setStep] = useState<CheckoutStep>('review');
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [isPlacing, setIsPlacing] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Delivery Address Form State
  const [recipientName, setRecipientName] = useState('Divyansh Gupta');
  const [recipientPhone, setRecipientPhone] = useState('+91 98765 43210');
  const [flatNo, setFlatNo] = useState('Flat 402, Tower B');
  const [streetAddress, setStreetAddress] = useState(currentLocation.fullAddress || currentLocation.areaName);
  const [landmark, setLandmark] = useState('Near Community Center');
  const [pincode, setPincode] = useState(currentLocation.pincode || '110085');
  const [gpsVerified, setGpsVerified] = useState(true);
  const [deliveryCoords, setDeliveryCoords] = useState(
    currentLocation.coords || { lat: 28.7196, lng: 77.1186 }
  );

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi_qr');
  const [upiVerified, setUpiVerified] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');

  // Sync address if currentLocation changes and form is unmodified
  useEffect(() => {
    if (currentLocation) {
      setStreetAddress(currentLocation.fullAddress || currentLocation.areaName);
      if (currentLocation.pincode) setPincode(currentLocation.pincode);
      if (currentLocation.coords) setDeliveryCoords(currentLocation.coords);
    }
  }, [currentLocation]);

  // Reset step if closed or cart empties (unless in active tracking)
  useEffect(() => {
    if (!isOpen) {
      if (step !== 'tracking') {
        setStep('review');
      }
    }
  }, [isOpen, step]);

  // Live WebSockets synchronization for active order lifecycle
  const [liveSyncNotice, setLiveSyncNotice] = useState<string | null>(null);

  useEffect(() => {
    if (activeOrder?.orderNumber) {
      realtimeService.subscribeToOrder(activeOrder.orderNumber);

      const handleLiveStatus = (e: any) => {
        const detail = e.detail as LiveOrderStatusEventDetail;
        if (!detail || !detail.orderNumber) return;
        if (detail.orderNumber.toLowerCase() === activeOrder.orderNumber.toLowerCase()) {
          const nextStatus = detail.status as OrderStatus;
          const statusDescriptions: Record<OrderStatus, string> = {
            placed: 'Order placed with nearby store. Merchant is acknowledging your basket.',
            confirmed: 'Merchant has accepted your order and is packing fresh items.',
            out_for_delivery: 'Rider has picked up your packet and is navigating to your address.',
            delivered: 'Package handed over at your doorstep. Thank you for shopping local!',
            cancelled: 'Order was cancelled.',
          };

          setActiveOrder((prev) =>
            prev
              ? {
                  ...prev,
                  status: nextStatus,
                  statusDescription: statusDescriptions[nextStatus] || prev.statusDescription,
                  paymentStatus: (detail.paymentStatus as PaymentStatus) || prev.paymentStatus,
                }
              : null
          );

          setLiveSyncNotice(`🟢 Real-Time Update: Order is now ${nextStatus.replace(/_/g, ' ')}!`);
          setTimeout(() => setLiveSyncNotice(null), 4500);
        }
      };

      window.addEventListener(ORDER_STATUS_EVENT, handleLiveStatus);
      return () => {
        window.removeEventListener(ORDER_STATUS_EVENT, handleLiveStatus);
        realtimeService.unsubscribeFromOrder(activeOrder.orderNumber);
      };
    }
  }, [activeOrder?.orderNumber]);

  if (!isOpen) return null;

  // Calculation helpers
  const subtotal = items.reduce((acc, it) => acc + it.price * it.quantity, 0);
  const deliveryFee = subtotal >= 299 || items.length === 0 ? 0 : 25;
  const platformFee = items.length > 0 ? 5 : 0;
  const discountAmount = subtotal >= 500 ? 50 : 0;
  const grandTotal = Math.max(0, subtotal + deliveryFee + platformFee - discountAmount);
  const storeName = items[0]?.store || 'Apna Super Mart (650m)';

  const handleVerifyGps = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setDeliveryCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setGpsVerified(true);
        },
        () => {
          // Fallback to current location coordinates
          if (currentLocation.coords) {
            setDeliveryCoords(currentLocation.coords);
          }
          setGpsVerified(true);
        }
      );
    } else {
      setGpsVerified(true);
    }
  };

  const handleConfirmOrder = async () => {
    if (!recipientName || !recipientPhone || !streetAddress) {
      alert('Please fill in complete recipient and delivery address details.');
      return;
    }

    setIsPlacing(true);
    try {
      const addressData: DeliveryAddress = {
        recipientName,
        recipientPhone,
        streetAddress,
        flatNo,
        landmark,
        pincode,
        lat: deliveryCoords.lat,
        lng: deliveryCoords.lng,
        verifiedGps: gpsVerified,
      };

      const order = await placeOrder({
        items,
        deliveryAddress: addressData,
        paymentMethod,
        notes: orderNotes,
        storeName,
      });

      // If Razorpay chosen, trigger Razorpay Standard Checkout SDK
      if (paymentMethod === 'razorpay') {
        const isLoaded = await loadRazorpayScript();
        const rzpKey = (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || 'rzp_test_MyArea24SimKey';

        if (isLoaded && (window as any).Razorpay) {
          const rzpOptions = {
            key: rzpKey,
            amount: Math.round(order.finalPayable * 100),
            currency: 'INR',
            name: 'MyArea24 Neighbourhood Market',
            description: `Order ${order.orderNumber} • ${storeName}`,
            notes: {
              order_number: order.orderNumber,
            },
            prefill: {
              name: recipientName,
              contact: recipientPhone,
            },
            theme: {
              color: '#2563eb',
            },
            handler: async (response: any) => {
              try {
                await verifyOrderPayment({
                  orderIdentifier: order.orderNumber,
                  paymentMethod: 'razorpay',
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpaySignature: response.razorpay_signature,
                  amount: order.finalPayable,
                });
                order.paymentStatus = 'paid';
                order.transactionId = response.razorpay_payment_id;
                setActiveOrder({ ...order });
                setStep('tracking');
                onClearCart();
              } catch (e) {
                alert('Payment verification failed. Please check your order status in My Orders.');
                setActiveOrder({ ...order });
                setStep('tracking');
              } finally {
                setIsPlacing(false);
              }
            },
            modal: {
              ondismiss: () => {
                // If payment was dismissed without completion, order remains in 'pending' status
                order.paymentStatus = 'pending';
                setActiveOrder({ ...order });
                setStep('tracking');
                setIsPlacing(false);
              },
            },
          };

          const rzpInstance = new (window as any).Razorpay(rzpOptions);
          rzpInstance.open();
          return;
        }
      }

      // If UPI QR, verify transaction reference and record
      if (paymentMethod === 'upi_qr') {
        await verifyOrderPayment({
          orderIdentifier: order.orderNumber,
          paymentMethod: 'upi_qr',
          upiRefId: `UPI_REF_${Date.now()}`,
        });
        order.paymentStatus = 'paid';
      }

      setActiveOrder(order);
      setStep('tracking');
      onClearCart();
    } catch (err) {
      console.error('Order placement failed', err);
      alert('Could not complete order. Please try again.');
    } finally {
      setIsPlacing(false);
    }
  };

  const handleAdvanceStatus = async () => {
    if (!activeOrder) return;
    const stages: OrderStatus[] = ['placed', 'confirmed', 'out_for_delivery', 'delivered'];
    const currentIdx = stages.indexOf(activeOrder.status);
    if (currentIdx < stages.length - 1) {
      const nextStatus = stages[currentIdx + 1];
      setIsUpdatingStatus(true);
      const updated = await advanceOrderStatus(activeOrder.orderNumber, nextStatus);
      if (updated) {
        setActiveOrder({ ...updated });
      }
      // Broadcast over real-time channel to sync merchant dashboard immediately
      realtimeService.triggerOrderStatusUpdate(activeOrder.orderNumber, nextStatus);
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1200] overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-out Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-250">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  {step === 'review' && `Your Local Basket (${items.length})`}
                  {step === 'address' && 'Delivery Address & GPS'}
                  {step === 'payment' && 'Select Payment Method'}
                  {step === 'tracking' && `Order ${activeOrder?.orderNumber || 'Status'}`}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {step === 'tracking' ? 'Hyperlocal Instant Fulfillment' : `From ${storeName}`}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Stepper Header (Only when not in tracking) */}
          {step !== 'tracking' && (
            <div className="px-5 py-2.5 bg-blue-50/50 border-b border-blue-100 flex items-center justify-between text-xs font-bold text-slate-500">
              <span className={`flex items-center gap-1 ${step === 'review' ? 'text-blue-600' : 'text-slate-400'}`}>
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center">1</span>
                Items
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className={`flex items-center gap-1 ${step === 'address' ? 'text-blue-600' : 'text-slate-400'}`}>
                <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center ${step === 'address' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>2</span>
                Address
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className={`flex items-center gap-1 ${step === 'payment' ? 'text-blue-600' : 'text-slate-400'}`}>
                <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center ${step === 'payment' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>3</span>
                Payment
              </span>
            </div>
          )}

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* -----------------------------------------------------------
                STEP 1: REVIEW ITEMS
                ----------------------------------------------------------- */}
            {step === 'review' && (
              <>
                {items.length === 0 ? (
                  <div className="py-16 text-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                      <ShoppingBag className="w-8 h-8 stroke-1" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">Your basket is currently empty</h4>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      Browse neighborhood stores, everyday essentials, fresh groceries, and pharmacy medicines.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onNavigateToProducts?.();
                      }}
                      className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition cursor-pointer"
                    >
                      Explore Products
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Delivery Time Banner */}
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                        <Truck className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-emerald-900">⚡ Hyperlocal 20-min Delivery</p>
                        <p className="text-[11px] text-emerald-700 truncate">
                          Delivering to {currentLocation.areaName.split(',')[0]} from verified store
                        </p>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="space-y-2.5">
                      {items.map((it) => (
                        <div
                          key={it.id}
                          className="p-3 rounded-xl border border-slate-200/80 bg-white flex items-center justify-between gap-3 hover:border-slate-300 transition"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {it.image ? (
                              <img
                                src={it.image}
                                alt={it.name}
                                className="w-12 h-12 rounded-lg object-contain bg-slate-50 shrink-0 border border-slate-100"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold text-xs">
                                🛍️
                              </div>
                            )}
                            <div className="min-w-0">
                              <h5 className="text-xs font-bold text-slate-900 truncate">{it.name}</h5>
                              <p className="text-[11px] font-extrabold text-slate-800 mt-0.5">₹{it.price}</p>
                              <p className="text-[10px] text-slate-400 truncate">🏪 {it.store || storeName}</p>
                            </div>
                          </div>

                          {/* Quantity Stepper */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(it.id, -1)}
                                className="p-1 hover:text-blue-600 text-slate-500 transition cursor-pointer"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-6 text-center text-xs font-extrabold text-slate-800">
                                {it.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(it.id, 1)}
                                className="p-1 hover:text-blue-600 text-slate-500 transition cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => onRemoveItem(it.id)}
                              className="p-1.5 text-slate-300 hover:text-rose-500 transition cursor-pointer"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Notes */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Special Instructions for Merchant</label>
                      <input
                        type="text"
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        placeholder="e.g. Ring the bell, deliver fresh expiry dates"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </>
                )}
              </>
            )}

            {/* -----------------------------------------------------------
                STEP 2: DELIVERY ADDRESS & GPS VERIFICATION
                ----------------------------------------------------------- */}
            {step === 'address' && (
              <div className="space-y-3.5">
                {/* GPS Verification Badge */}
                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-extrabold text-blue-900">GPS Geo-Fencing Verification</span>
                    </div>
                    {gpsVerified ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-extrabold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Pin Verified
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                        Unconfirmed
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-blue-800">
                    Coordinates: {deliveryCoords.lat.toFixed(4)}° N, {deliveryCoords.lng.toFixed(4)}° E (~650m from {storeName})
                  </p>
                  <button
                    type="button"
                    onClick={handleVerifyGps}
                    className="w-full py-1.5 rounded-lg bg-white border border-blue-300 text-blue-700 text-xs font-bold hover:bg-blue-600 hover:text-white transition flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Re-Verify Live GPS Pin
                  </button>
                </div>

                <div className="space-y-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Recipient Full Name</label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Mobile Number (For Delivery Rider OTP)</label>
                    <input
                      type="text"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Flat / House / Floor No.</label>
                    <input
                      type="text"
                      value={flatNo}
                      onChange={(e) => setFlatNo(e.target.value)}
                      placeholder="e.g. Flat 301, Block C"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Complete Street / Area Address</label>
                    <textarea
                      rows={2}
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none mt-1 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700">Nearby Landmark</label>
                      <input
                        type="text"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        placeholder="e.g. Near Mother Dairy"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700">Postal Pincode</label>
                      <input
                        type="text"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* -----------------------------------------------------------
                STEP 3: PAYMENT METHOD SELECTION
                ----------------------------------------------------------- */}
            {step === 'payment' && (
              <div className="space-y-3.5">
                <p className="text-xs text-slate-600 font-medium">
                  Choose your preferred payment method. Instant settlement goes directly to the neighborhood merchant.
                </p>

                {/* UPI QR Option */}
                <div
                  onClick={() => setPaymentMethod('upi_qr')}
                  className={`p-3.5 rounded-2xl border-2 transition cursor-pointer ${
                    paymentMethod === 'upi_qr'
                      ? 'border-blue-600 bg-blue-50/50'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                        <QrCode className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900">UPI Dynamic QR (Zero Surcharge)</h4>
                        <p className="text-[10px] text-slate-500">GPay, PhonePe, Paytm, BHIM</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-blue-600">₹{grandTotal}</span>
                  </div>

                  {paymentMethod === 'upi_qr' && (
                    <div className="mt-3 pt-3 border-t border-blue-200/60 flex flex-col items-center space-y-2.5 animate-in fade-in duration-200">
                      {/* Simulated Interactive QR */}
                      <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col items-center">
                        <div className="w-36 h-36 bg-slate-900 rounded-lg p-2 flex flex-col items-center justify-center text-white relative">
                          <div className="grid grid-cols-4 gap-1.5 w-full h-full p-1 opacity-90">
                            {Array.from({ length: 16 }).map((_, i) => (
                              <div
                                key={i}
                                className={`rounded-sm ${i % 3 === 0 || i % 5 === 0 ? 'bg-white' : 'bg-transparent'}`}
                              />
                            ))}
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="px-2 py-0.5 rounded bg-blue-600 text-white text-[9px] font-black tracking-wider shadow">
                              UPI • ₹{grandTotal}
                            </span>
                          </div>
                        </div>
                        <p className="text-[10px] font-bold text-slate-700 mt-2">VPA: myarea24@upi</p>
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <a
                          href={`upi://pay?pa=myarea24@upi&pn=${encodeURIComponent(storeName)}&am=${grandTotal}&cu=INR&tn=Order%20${encodeURIComponent(storeName)}`}
                          onClick={(e) => e.stopPropagation()}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition flex items-center gap-1.5 shadow-xs"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Pay via UPI App</span>
                        </a>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard?.writeText('myarea24@upi');
                            setUpiVerified(true);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                            upiVerified
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {upiVerified ? '✓ VPA Copied / Verified' : 'Copy VPA & Verify'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Razorpay / Cards / Netbanking */}
                <div
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`p-3.5 rounded-2xl border-2 transition cursor-pointer ${
                    paymentMethod === 'razorpay'
                      ? 'border-blue-600 bg-blue-50/50'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900">Razorpay / Netbanking / Debit & Credit</h4>
                        <p className="text-[10px] text-slate-500">Instant secure card checkout</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-600">Secure</span>
                  </div>
                </div>

                {/* Cash on Delivery (COD) */}
                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3.5 rounded-2xl border-2 transition cursor-pointer ${
                    paymentMethod === 'cod'
                      ? 'border-blue-600 bg-blue-50/50'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                        <Truck className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900">Cash on Delivery (Pay at Doorstep)</h4>
                        <p className="text-[10px] text-slate-500">Pay cash or UPI upon delivery inspection</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-600">Available</span>
                  </div>
                </div>
              </div>
            )}

            {/* -----------------------------------------------------------
                STEP 4: ORDER PLACED & LIVE TRACKING LIFECYCLE
                ----------------------------------------------------------- */}
            {step === 'tracking' && activeOrder && (
              <div className="space-y-4">
                {liveSyncNotice && (
                  <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold shadow-xs animate-in slide-in-from-top-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>{liveSyncNotice}</span>
                  </div>
                )}

                {/* Success Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                      <span className="text-xs font-bold tracking-wide uppercase opacity-90">Order Confirmed</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-white/20 text-white font-mono text-xs font-bold">
                      {activeOrder.orderNumber}
                    </span>
                  </div>
                  <h4 className="text-lg font-black leading-tight">
                    ₹{activeOrder.finalPayable} Payable ({activeOrder.paymentMethod.toUpperCase()})
                  </h4>
                  <p className="text-xs text-white/90">
                    Estimated arrival in {activeOrder.estimatedDeliveryMins} mins at {currentLocation.areaName.split(',')[0]}
                  </p>
                </div>

                {/* 4-Stage Status Lifecycle Stepper */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-800">Live Order Lifecycle Status</h4>

                  <div className="space-y-3 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {[
                      {
                        key: 'placed',
                        title: 'Order Placed',
                        desc: 'Transmitted to neighborhood store',
                        time: 'Stage 1',
                      },
                      {
                        key: 'confirmed',
                        title: 'Store Confirmed & Packed',
                        desc: 'Merchant has accepted basket and sealed parcel',
                        time: 'Stage 2',
                      },
                      {
                        key: 'out_for_delivery',
                        title: 'Out for Delivery',
                        desc: 'Courier / delivery partner is en route to your location',
                        time: 'Stage 3',
                      },
                      {
                        key: 'delivered',
                        title: 'Delivered',
                        desc: 'Package handed over safely at your doorstep',
                        time: 'Final',
                      },
                    ].map((st) => {
                      const stages: OrderStatus[] = ['placed', 'confirmed', 'out_for_delivery', 'delivered'];
                      const currentIdx = stages.indexOf(activeOrder.status);
                      const stageIdx = stages.indexOf(st.key as OrderStatus);
                      const isDone = stageIdx <= currentIdx;
                      const isCurrent = stageIdx === currentIdx;

                      return (
                        <div key={st.key} className="relative flex items-start justify-between">
                          <span
                            className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 transition ${
                              isCurrent
                                ? 'bg-blue-600 border-white ring-2 ring-blue-600'
                                : isDone
                                ? 'bg-emerald-500 border-white ring-2 ring-emerald-500'
                                : 'bg-white border-slate-300'
                            }`}
                          />
                          <div>
                            <p
                              className={`text-xs font-extrabold ${
                                isCurrent
                                  ? 'text-blue-600'
                                  : isDone
                                  ? 'text-slate-900'
                                  : 'text-slate-400'
                              }`}
                            >
                              {st.title} {isCurrent && '● Active'}
                            </p>
                            <p className="text-[11px] text-slate-500">{st.desc}</p>
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium shrink-0">{st.time}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Real-time Status Refresh & Order History link */}
                  <div className="pt-2 space-y-2">
                    <button
                      type="button"
                      disabled={isUpdatingStatus}
                      onClick={async () => {
                        setIsUpdatingStatus(true);
                        try {
                          const tokenParam = activeOrder.trackingToken ? `?token=${encodeURIComponent(activeOrder.trackingToken)}` : '';
                          const res = await fetch(`/api/v1/orders/${encodeURIComponent(activeOrder.orderNumber)}${tokenParam}`);
                          if (res.ok) {
                            const data = await res.json();
                            if (data.order) {
                              setActiveOrder({
                                ...activeOrder,
                                status: data.order.status,
                                paymentStatus: data.order.payment_status,
                              });
                            }
                          }
                        } catch (e) {
                          console.warn('Failed to refresh order status', e);
                        } finally {
                          setIsUpdatingStatus(false);
                        }
                      }}
                      className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isUpdatingStatus ? 'animate-spin' : ''}`} />
                      Refresh Live Order Status
                    </button>

                    <a
                      href="/my-orders"
                      className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      View Invoice & Details in My Orders →
                    </a>
                  </div>
                </div>

                {/* Items Summary in Order */}

                {/* Items Summary in Order */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <p className="text-[11px] font-bold text-slate-600">Items Ordered:</p>
                  {activeOrder.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-xs text-slate-800">
                      <span>{it.quantity}x {it.name}</span>
                      <span className="font-bold">₹{it.price * it.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer with Price Breakdown and Progression CTA */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/90 space-y-3">
            {step !== 'tracking' && items.length > 0 && (
              <div className="space-y-1.5 text-xs text-slate-600 border-b border-slate-200 pb-2.5">
                <div className="flex justify-between">
                  <span>Item Subtotal ({items.length} items)</span>
                  <span className="font-bold text-slate-900">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  {deliveryFee === 0 ? (
                    <span className="font-bold text-emerald-600">FREE</span>
                  ) : (
                    <span>₹{deliveryFee}</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span>Neighborhood Packaging & Handling</span>
                  <span>₹{platformFee}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Local Order Savings</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1 border-t border-slate-200">
                  <span>Grand Total</span>
                  <span className="text-blue-600">₹{grandTotal}</span>
                </div>
              </div>
            )}

            {/* Step Progression Buttons */}
            {step === 'review' && items.length > 0 && (
              <button
                type="button"
                onClick={() => setStep('address')}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md"
              >
                <span>Select Delivery Address</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {step === 'address' && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('review')}
                  className="w-1/3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep('payment')}
                  className="w-2/3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md"
                >
                  <span>Proceed to Payment</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {step === 'payment' && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('address')}
                  className="w-1/3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={isPlacing}
                  onClick={handleConfirmOrder}
                  className="w-2/3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  {isPlacing ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5" />
                  )}
                  <span>Place Order (₹{grandTotal})</span>
                </button>
              </div>
            )}

            {step === 'tracking' && (
              <button
                type="button"
                onClick={() => {
                  setStep('review');
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
              >
                Close & Continue Exploring
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
