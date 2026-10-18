import { CartItem, DeliveryAddress, Order, OrderStatus, PaymentMethod, ServiceBooking, ServiceBookingStatus } from '../types';
import { realtimeService } from './realtimeService';

const STORAGE_KEY_ORDERS = 'myarea24_citizen_orders';
const STORAGE_KEY_BOOKINGS = 'myarea24_citizen_bookings';

/**
 * Reads cached orders from localStorage.
 */
export function getLocalOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ORDERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Saves orders array to localStorage.
 */
export function saveLocalOrders(orders: Order[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
  } catch (err) {
    console.warn('Failed to cache orders to localStorage', err);
  }
}

/**
 * Reads cached service bookings from localStorage.
 */
export function getLocalBookings(): ServiceBooking[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BOOKINGS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Saves service bookings array to localStorage.
 */
export function saveLocalBookings(bookings: ServiceBooking[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(bookings));
  } catch (err) {
    console.warn('Failed to cache bookings to localStorage', err);
  }
}

export interface PlaceOrderParams {
  items: CartItem[];
  deliveryAddress: DeliveryAddress;
  paymentMethod: PaymentMethod;
  notes?: string;
  storeName?: string;
}

/**
 * Places an order via backend REST endpoint, falling back to local simulation.
 */
export async function placeOrder(params: PlaceOrderParams): Promise<Order> {
  const { items, deliveryAddress, paymentMethod, notes, storeName } = params;

  const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const deliveryFee = subtotal >= 299 ? 0 : 25;
  const platformFee = 5;
  const discountAmount = subtotal > 500 ? 50 : 0;
  const finalPayable = Math.max(0, subtotal + deliveryFee + platformFee - discountAmount);
  const orderNumber = `MA24-ORD-${Math.floor(1000 + Math.random() * 9000)}`;

  const orderPayload = {
    business_name: storeName || items[0]?.store || 'Apna Super Mart',
    items: items.map((it) => ({
      product_name: it.name,
      unit_price: it.price,
      quantity: it.quantity,
      store_name: it.store || storeName || 'Apna Super Mart',
      image_url: it.image,
    })),
    delivery_fee: deliveryFee,
    platform_fee: platformFee,
    discount_amount: discountAmount,
    payment_method: paymentMethod,
    customer_name: deliveryAddress.recipientName,
    customer_phone: deliveryAddress.recipientPhone,
    delivery_address: `${deliveryAddress.flatNo ? deliveryAddress.flatNo + ', ' : ''}${deliveryAddress.streetAddress}${deliveryAddress.landmark ? ' (Near ' + deliveryAddress.landmark + ')' : ''}`,
    delivery_landmark: deliveryAddress.landmark,
    delivery_pincode: deliveryAddress.pincode,
    delivery_lat: deliveryAddress.lat,
    delivery_lng: deliveryAddress.lng,
    notes,
  };

  try {
    const res = await fetch('/api/v1/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload),
    });

    if (res.ok) {
      const data = await res.json();
      const backendOrder: Order = {
        id: data.order.id,
        orderNumber: data.order.order_number,
        items,
        status: data.order.status as OrderStatus,
        statusDescription: 'Order placed with nearby store. Merchant is acknowledging your basket.',
        totalAmount: data.order.total_amount,
        deliveryFee: data.order.delivery_fee,
        platformFee: data.order.platform_fee,
        discountAmount: data.order.discount_amount,
        finalPayable: data.order.final_payable,
        paymentMethod: data.order.payment_method as PaymentMethod,
        paymentStatus: data.order.payment_status,
        customerName: data.order.customer_name,
        customerPhone: data.order.customer_phone,
        deliveryAddress,
        storeName: storeName || items[0]?.store || 'Apna Super Mart',
        estimatedDeliveryMins: data.order.estimated_delivery_mins || 20,
        createdAt: data.order.created_at || new Date().toISOString(),
      };

      // Save to local cache
      const existing = getLocalOrders();
      saveLocalOrders([backendOrder, ...existing]);
      return backendOrder;
    }
  } catch (err) {
    console.warn('Backend /api/v1/orders unavailable, placing order in local fallback mode', err);
  }

  // Fallback local order
  const fallbackOrder: Order = {
    id: `local_${Date.now()}`,
    orderNumber,
    items,
    status: 'placed',
    statusDescription: 'Order placed with nearby store. Merchant is acknowledging your basket.',
    totalAmount: subtotal,
    deliveryFee,
    platformFee,
    discountAmount,
    finalPayable,
    paymentMethod,
    paymentStatus: paymentMethod === 'cod' ? 'cod' : 'paid',
    customerName: deliveryAddress.recipientName,
    customerPhone: deliveryAddress.recipientPhone,
    deliveryAddress,
    storeName: storeName || items[0]?.store || 'Apna Super Mart',
    estimatedDeliveryMins: 20,
    createdAt: new Date().toISOString(),
  };

  const existing = getLocalOrders();
  saveLocalOrders([fallbackOrder, ...existing]);

  // Push instant live notification to merchant portal
  realtimeService.triggerMerchantOrder({
    orderNumber: fallbackOrder.orderNumber,
    customerName: fallbackOrder.customerName,
    customerPhone: fallbackOrder.customerPhone,
    deliveryAddress:
      typeof fallbackOrder.deliveryAddress === 'string'
        ? fallbackOrder.deliveryAddress
        : fallbackOrder.deliveryAddress.streetAddress,
    finalPayable: fallbackOrder.finalPayable,
    items: items.map((it) => ({
      product_name: it.name,
      unit_price: it.price,
      quantity: it.quantity,
      total_price: it.price * it.quantity,
    })),
  });

  return fallbackOrder;
}

/**
 * Advances the status of an order:
 * 'placed' -> 'confirmed' -> 'out_for_delivery' -> 'delivered'
 */
export async function advanceOrderStatus(orderNumber: string, nextStatus: OrderStatus): Promise<Order | null> {
  // Update local cache
  const orders = getLocalOrders();
  const idx = orders.findIndex((o) => o.orderNumber === orderNumber || String(o.id) === orderNumber);

  const statusDescriptions: Record<OrderStatus, string> = {
    placed: 'Order placed with nearby store. Merchant is acknowledging your basket.',
    confirmed: 'Merchant has accepted your order and is packing fresh items.',
    out_for_delivery: 'Rider has picked up your packet and is navigating to your address.',
    delivered: 'Package safely handed over at your doorstep. Thank you for shopping local!',
    cancelled: 'Order was cancelled.',
  };

  let updatedOrder: Order | null = null;

  if (idx !== -1) {
    orders[idx].status = nextStatus;
    orders[idx].statusDescription = statusDescriptions[nextStatus];
    if (nextStatus === 'delivered' && orders[idx].paymentMethod === 'cod') {
      orders[idx].paymentStatus = 'paid';
    }
    updatedOrder = orders[idx];
    saveLocalOrders(orders);
  }

  // Attempt backend update
  try {
    await fetch(`/api/v1/orders/${orderNumber}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    });
  } catch {
    // Non-blocking fallback
  }

  return updatedOrder;
}

export interface BookServiceParams {
  serviceId?: number;
  serviceTitle: string;
  category: string;
  providerName: string;
  providerPhone: string;
  customerName: string;
  customerPhone: string;
  serviceAddress: string;
  scheduledDate: string;
  scheduledSlot: string;
  estimatedCost: number;
  notes?: string;
}

/**
 * Books a service slot via backend API with local cache fallback.
 */
export async function bookServiceSlot(params: BookServiceParams): Promise<ServiceBooking> {
  const bookingNumber = `MA24-SRV-${Math.floor(1000 + Math.random() * 9000)}`;
  const otpCode = String(Math.floor(1000 + Math.random() * 9000));

  const payload = {
    service_id: params.serviceId,
    service_title: params.serviceTitle,
    category: params.category,
    provider_name: params.providerName,
    provider_phone: params.providerPhone,
    customer_name: params.customerName,
    customer_phone: params.customerPhone,
    service_address: params.serviceAddress,
    scheduled_date: params.scheduledDate,
    scheduled_slot: params.scheduledSlot,
    estimated_cost: params.estimatedCost,
    notes: params.notes,
  };

  try {
    const res = await fetch('/api/v1/services/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      const booking: ServiceBooking = {
        id: data.booking.id,
        bookingNumber: data.booking.booking_number,
        serviceTitle: data.booking.service_title,
        category: data.booking.category,
        providerName: data.booking.provider_name,
        providerPhone: data.booking.provider_phone,
        customerName: data.booking.customer_name,
        customerPhone: data.booking.customer_phone,
        serviceAddress: data.booking.service_address,
        scheduledDate: data.booking.scheduled_date,
        scheduledSlot: data.booking.scheduled_slot,
        status: data.booking.status as ServiceBookingStatus,
        estimatedCost: data.booking.estimated_cost,
        otpCode: data.booking.otp_code,
        notes: params.notes,
        createdAt: data.booking.created_at || new Date().toISOString(),
      };

      const existing = getLocalBookings();
      saveLocalBookings([booking, ...existing]);
      return booking;
    }
  } catch (err) {
    console.warn('Backend /api/v1/services/book unavailable, creating booking in local fallback mode', err);
  }

  // Fallback booking
  const fallbackBooking: ServiceBooking = {
    id: `local_srv_${Date.now()}`,
    bookingNumber,
    serviceTitle: params.serviceTitle,
    category: params.category,
    providerName: params.providerName,
    providerPhone: params.providerPhone,
    customerName: params.customerName,
    customerPhone: params.customerPhone,
    serviceAddress: params.serviceAddress,
    scheduledDate: params.scheduledDate,
    scheduledSlot: params.scheduledSlot,
    status: 'requested',
    estimatedCost: params.estimatedCost,
    otpCode,
    notes: params.notes,
    createdAt: new Date().toISOString(),
  };

  const existing = getLocalBookings();
  saveLocalBookings([fallbackBooking, ...existing]);
  return fallbackBooking;
}

/**
 * Advances service booking status:
 * 'requested' -> 'confirmed' -> 'in_progress' -> 'completed'
 */
export async function advanceBookingStatus(bookingNumber: string, nextStatus: ServiceBookingStatus): Promise<ServiceBooking | null> {
  const bookings = getLocalBookings();
  const idx = bookings.findIndex((b) => b.bookingNumber === bookingNumber || String(b.id) === bookingNumber);

  let updatedBooking: ServiceBooking | null = null;
  if (idx !== -1) {
    bookings[idx].status = nextStatus;
    updatedBooking = bookings[idx];
    saveLocalBookings(bookings);
  }

  try {
    await fetch(`/api/v1/services/bookings/${bookingNumber}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    });
  } catch {
    // Non-blocking fallback
  }

  return updatedBooking;
}
