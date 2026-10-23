import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  Phone,
  MessageSquare,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Wrench,
  AlertCircle,
} from 'lucide-react';
import { ServiceBooking, ServiceBookingStatus, UserLocation } from '../types';
import { bookServiceSlot, advanceBookingStatus } from '../services/orderCommerceService';

export interface ServiceData {
  id?: string | number;
  name: string;
  role?: string;
  cat: string;
  price: string;
  priceUnit?: string;
  rating?: string;
  reviews?: string;
  locality?: string;
  city?: string;
  phone?: string;
  whatsapp?: string;
  timing?: string;
  img?: string;
  description?: string;
}

export interface ServiceBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceData | null;
  currentLocation: UserLocation;
}

export const ServiceBookingModal: React.FC<ServiceBookingModalProps> = ({
  isOpen,
  onClose,
  service,
  currentLocation,
}) => {
  const [step, setStep] = useState<'schedule' | 'confirmed'>('schedule');
  const [activeBooking, setActiveBooking] = useState<ServiceBooking | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Form State
  const [selectedDate, setSelectedDate] = useState('Today');
  const [selectedSlot, setSelectedSlot] = useState('Evening (04:00 PM - 06:00 PM)');
  const [customerName, setCustomerName] = useState('Divyansh Gupta');
  const [customerPhone, setCustomerPhone] = useState('+91 98765 43210');
  const [serviceAddress, setServiceAddress] = useState(currentLocation.fullAddress || currentLocation.areaName);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (currentLocation) {
      setServiceAddress(currentLocation.fullAddress || currentLocation.areaName);
    }
  }, [currentLocation]);

  useEffect(() => {
    if (!isOpen) {
      setStep('schedule');
      setActiveBooking(null);
    }
  }, [isOpen]);

  if (!isOpen || !service) return null;

  const numericCost = parseFloat(service.price.replace(/[^\d.]/g, '')) || 299;

  const handleBookSlot = async () => {
    if (!customerName || !customerPhone || !serviceAddress) {
      alert('Please fill in complete contact and address details.');
      return;
    }

    setIsSubmitting(true);
    try {
      const booking = await bookServiceSlot({
        serviceId: typeof service.id === 'number' ? service.id : undefined,
        serviceTitle: service.name,
        category: service.cat || 'Home Services',
        providerName: service.role || service.name,
        providerPhone: service.phone || '+91 98112 34567',
        customerName,
        customerPhone,
        serviceAddress,
        scheduledDate: selectedDate,
        scheduledSlot: selectedSlot,
        estimatedCost: numericCost,
        notes,
      });

      setActiveBooking(booking);
      setStep('confirmed');
    } catch (err) {
      console.error('Service booking failed', err);
      alert('Could not book service slot. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdvanceStatus = async () => {
    if (!activeBooking) return;
    const stages: ServiceBookingStatus[] = ['requested', 'confirmed', 'in_progress', 'completed'];
    const currentIdx = stages.indexOf(activeBooking.status);
    if (currentIdx < stages.length - 1) {
      const nextStatus = stages[currentIdx + 1];
      setIsUpdatingStatus(true);
      const updated = await advanceBookingStatus(activeBooking.bookingNumber, nextStatus);
      if (updated) {
        setActiveBooking({ ...updated });
      }
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1250] flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                {step === 'schedule' ? 'Book Trusted Professional' : 'Service Slot Confirmed'}
              </h3>
              <p className="text-[11px] text-slate-500">{service.cat} • Verified In-Area</p>
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

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {step === 'schedule' ? (
            <>
              {/* Service Details Card */}
              <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-start gap-3">
                {service.img ? (
                  <img
                    src={service.img}
                    alt={service.name}
                    className="w-14 h-14 rounded-xl object-cover shrink-0 border border-blue-200"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xl shrink-0 font-bold">
                    🔧
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-sm font-extrabold text-slate-900 truncate">{service.name}</h4>
                    <span className="text-xs font-black text-blue-700">{service.price}</span>
                  </div>
                  <p className="text-xs text-slate-600">{service.role || service.cat}</p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                    <span className="font-bold text-amber-600">★ {service.rating || '4.8'}</span>
                    <span>• {service.locality || currentLocation.areaName.split(',')[0]}</span>
                    <span className="text-emerald-600 font-bold">✓ 100% Background Checked</span>
                  </div>
                </div>
              </div>

              {/* Slot Selection */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" /> Select Preferred Date
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Today', 'Tomorrow', 'Day After'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setSelectedDate(d)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                        selectedDate === d
                          ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" /> Select Arrival Time Window
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    'Morning (09:00 AM - 11:30 AM)',
                    'Midday (11:30 AM - 02:00 PM)',
                    'Afternoon (02:00 PM - 04:30 PM)',
                    'Evening (04:30 PM - 07:00 PM)',
                  ].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSlot(s)}
                      className={`p-2 rounded-xl border text-left text-xs font-semibold transition cursor-pointer ${
                        selectedSlot === s
                          ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer Contact & Address Form */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Your Full Name</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Mobile Number</label>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none mt-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700">Service Location Address</label>
                  <textarea
                    rows={2}
                    value={serviceAddress}
                    onChange={(e) => setServiceAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none mt-1 resize-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700">Problem Description (Optional)</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. AC not cooling, fan making rattling noise"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none mt-1"
                  />
                </div>
              </div>

              {/* Upfront Transparency Box */}
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 space-y-1">
                <p className="font-extrabold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Standard Transparent Pricing
                </p>
                <p className="text-[11px] text-amber-800">
                  Inspection visit charge is <strong>₹{numericCost}</strong> (adjusted against final repair invoice). Pay directly after service inspection via Cash or UPI QR.
                </p>
              </div>
            </>
          ) : (
            /* STEP 2: CONFIRMED BOOKING VIEW */
            activeBooking && (
              <div className="space-y-4">
                {/* Confirmed Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                      <span className="text-xs font-bold tracking-wide uppercase opacity-90">Slot Reserved</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-white/20 text-white font-mono text-xs font-bold">
                      {activeBooking.bookingNumber}
                    </span>
                  </div>
                  <h4 className="text-lg font-black leading-tight">{activeBooking.serviceTitle}</h4>
                  <p className="text-xs text-white/90">
                    Scheduled for {activeBooking.scheduledDate} • {activeBooking.scheduledSlot}
                  </p>
                </div>

                {/* 4-Digit Security OTP */}
                <div className="p-3.5 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-extrabold text-emerald-950">🔐 Service Start Security OTP</p>
                    <p className="text-[11px] text-emerald-700">Provide this 4-digit code to technician upon arrival</p>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-white border border-emerald-300 text-emerald-800 font-mono text-base font-black tracking-widest shadow-sm">
                    {activeBooking.otpCode || '4892'}
                  </span>
                </div>

                {/* Live Service Lifecycle Stepper */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-800">Booking Lifecycle Progress</h4>

                  <div className="space-y-3 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {[
                      { key: 'requested', title: 'Booking Request Sent', desc: 'Technician notified of your slot' },
                      { key: 'confirmed', title: 'Technician Assigned', desc: `${service.name} confirmed your appointment` },
                      { key: 'in_progress', title: 'Service In Progress', desc: 'Technician on-site with tools' },
                      { key: 'completed', title: 'Completed & Certified', desc: 'Service certified with 30-day warranty' },
                    ].map((st) => {
                      const stages: ServiceBookingStatus[] = ['requested', 'confirmed', 'in_progress', 'completed'];
                      const currentIdx = stages.indexOf(activeBooking.status);
                      const stageIdx = stages.indexOf(st.key as ServiceBookingStatus);
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
                        </div>
                      );
                    })}
                  </div>

                  {/* Actions & Refresh */}
                  <div className="pt-2 space-y-2">
                    <button
                      type="button"
                      disabled={isUpdatingStatus}
                      onClick={async () => {
                        setIsUpdatingStatus(true);
                        try {
                          const otpParam = activeBooking.otpCode ? `?otp=${encodeURIComponent(activeBooking.otpCode)}` : '';
                          const res = await fetch(`/api/v1/services/bookings/${encodeURIComponent(activeBooking.bookingNumber)}${otpParam}`);
                          if (res.ok) {
                            const data = await res.json();
                            if (data.booking) {
                              setActiveBooking({
                                ...activeBooking,
                                status: data.booking.status,
                              });
                            }
                          }
                        } catch (e) {
                          console.warn('Failed to refresh booking status', e);
                        } finally {
                          setIsUpdatingStatus(false);
                        }
                      }}
                      className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isUpdatingStatus ? 'animate-spin' : ''}`} />
                      Refresh Booking Status
                    </button>

                    <a
                      href="/my-bookings"
                      className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      View in My Bookings →
                    </a>
                  </div>
                </div>

                {/* Direct Contact Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  {service.phone ? (
                    <a
                      href={`tel:${service.phone}`}
                      className="py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      <Phone className="w-3.5 h-3.5 text-blue-600" />
                      Call Technician
                    </a>
                  ) : (
                    <div className="py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 text-xs font-medium flex items-center justify-center">
                      Phone unlisted
                    </div>
                  )}
                  {service.whatsapp || service.phone ? (
                    <a
                      href={`https://wa.me/${service.whatsapp || service.phone}?text=Hi%20${encodeURIComponent(service.name)},%20I%20have%20booked%20slot%20${activeBooking.bookingNumber}%20on%20MyArea24`}
                      target="_blank"
                      rel="noreferrer"
                      className="py-2.5 px-3 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      WhatsApp
                    </a>
                  ) : (
                    <div className="py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 text-xs font-medium flex items-center justify-center">
                      WhatsApp unlisted
                    </div>
                  )}
                </div>
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between gap-3">
          {step === 'schedule' ? (
            <>
              <div>
                <p className="text-[10px] text-slate-400">Total Visit Charge</p>
                <p className="text-sm font-extrabold text-slate-900">₹{numericCost} (Pay Later)</p>
              </div>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleBookSlot}
                className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md disabled:opacity-50"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>Confirm Slot Reservation</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
            >
              Done & Return to Services
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
