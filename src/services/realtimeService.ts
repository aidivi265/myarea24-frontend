import { LiveAlertItem } from './liveIntelligence';
import { MerchantLeadItem, MerchantReviewItem } from '../merchant/types';

export const REALTIME_STATUS_EVENT = 'myarea24_realtime_status';
export const CIVIC_ALERT_EVENT = 'myarea24_live_civic_alert';
export const MERCHANT_LEAD_EVENT = 'myarea24_merchant_live_lead';
export const MERCHANT_INQUIRY_EVENT = 'myarea24_merchant_live_message';
export const MERCHANT_REVIEW_EVENT = 'myarea24_merchant_live_review';
export const ORDER_STATUS_EVENT = 'myarea24_order_status_update';
export const MERCHANT_ORDER_EVENT = 'myarea24_merchant_live_order';

export type RealtimeConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected';

export interface RealtimeSubscriptionOptions {
  area?: string;
  businessId?: string;
  lat?: number;
  lon?: number;
}

export interface LiveCivicAlertEventDetail {
  alert: LiveAlertItem;
  timestamp: string;
}

export interface LiveMerchantLeadEventDetail {
  lead: MerchantLeadItem;
  businessId: string;
  timestamp: string;
}

export interface LiveMerchantInquiryEventDetail {
  inquiry: {
    id: string;
    customerName: string;
    message: string;
    timeAgo: string;
    business_id?: string;
  };
  businessId: string;
  timestamp: string;
}

export interface LiveMerchantReviewEventDetail {
  review: MerchantReviewItem;
  businessId: string;
  timestamp: string;
}

export interface LiveOrderStatusEventDetail {
  orderNumber: string;
  status: string;
  paymentStatus?: string;
  notes?: string;
  updatedAt: string;
}

export interface LiveMerchantOrderEventDetail {
  order: any;
  businessId: string;
  timestamp: string;
}

import { getApiBaseUrl } from '../config/apiClient';

function getBackendUrl(): string | null {
  return getApiBaseUrl();
}

let sharedAudioCtx: AudioContext | null = null;

function getSharedAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedAudioCtx) {
    try {
      sharedAudioCtx = new AudioCtx();
    } catch {
      return null;
    }
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

// User-gesture unlock listener to resume suspended AudioContext on first interaction
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
  window.addEventListener('click', unlockAudio, { passive: true, once: true });
  window.addEventListener('touchstart', unlockAudio, { passive: true, once: true });
  window.addEventListener('keydown', unlockAudio, { passive: true, once: true });
}

// Gentle Web Audio API synthesizer for instant zero-dependency sound alerts
function playSoundNotification(type: 'alert' | 'lead' | 'order') {
  try {
    const ctx = getSharedAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
      return;
    }

    if (type === 'alert') {
      // 2-tone urgent alert ping (880Hz -> 440Hz)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.36);
    } else if (type === 'order') {
      // 3-tone cheerful cash register chime for new orders (D5: 587Hz -> G5: 784Hz -> B5: 988Hz)
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, t);
      osc.frequency.setValueAtTime(783.99, t + 0.1);
      osc.frequency.setValueAtTime(987.77, t + 0.2);
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.46);
    } else {
      // Pleasant 2-tone chime for leads & messages (523Hz -> 659Hz)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.31);
    }
  } catch {
    // Ignore audio autoplays blocked by user gesture policy
  }
}

class RealtimePushService {
  private socket: WebSocket | null = null;
  private sseSource: EventSource | null = null;
  private status: RealtimeConnectionStatus = 'disconnected';
  private reconnectAttempts = 0;
  private maxReconnectDelay = 15000;
  private reconnectTimer: any = null;
  private pingTimer: any = null;
  private options: RealtimeSubscriptionOptions = {};
  private clientId = `client-${Math.random().toString(36).substring(2, 9)}`;
  private activeOrderSubscriptions: Set<string> = new Set();

  constructor() {
    // Listen for tab focus to quickly re-establish socket if suspended by browser
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.reconnect());
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && this.status === 'disconnected') {
          this.reconnect();
        }
      });
    }
  }

  public getStatus(): RealtimeConnectionStatus {
    return this.status;
  }

  private setStatus(s: RealtimeConnectionStatus) {
    this.status = s;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(REALTIME_STATUS_EVENT, { detail: { status: s } })
      );
    }
  }

  public connect(options: RealtimeSubscriptionOptions = {}) {
    this.options = { ...this.options, ...options };
    this.cleanup();
    this.initWebSocket();
  }

  public subscribeToOrder(orderNumber: string) {
    if (!orderNumber) return;
    const clean = orderNumber.trim();
    this.activeOrderSubscriptions.add(clean);
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(
        JSON.stringify({ type: 'SUBSCRIBE', channel: `order:${clean.toLowerCase()}` })
      );
    }
  }

  public unsubscribeFromOrder(orderNumber: string) {
    if (!orderNumber) return;
    const clean = orderNumber.trim();
    this.activeOrderSubscriptions.delete(clean);
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(
        JSON.stringify({ type: 'UNSUBSCRIBE', channel: `order:${clean.toLowerCase()}` })
      );
    }
  }

  public updateSubscriptions(updates: Partial<RealtimeSubscriptionOptions>) {
    const oldArea = this.options.area;
    const oldBiz = this.options.businessId;
    this.options = { ...this.options, ...updates };

    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      if (updates.area && updates.area !== oldArea) {
        if (oldArea) {
          this.socket.send(
            JSON.stringify({ type: 'UNSUBSCRIBE', channel: `civic:${oldArea.toLowerCase()}` })
          );
        }
        this.socket.send(
          JSON.stringify({ type: 'SUBSCRIBE', channel: `civic:${updates.area.toLowerCase()}` })
        );
      }
      if (updates.businessId && updates.businessId !== oldBiz) {
        if (oldBiz) {
          this.socket.send(
            JSON.stringify({ type: 'UNSUBSCRIBE', channel: `merchant:${oldBiz}` })
          );
        }
        this.socket.send(
          JSON.stringify({ type: 'SUBSCRIBE', channel: `merchant:${updates.businessId}` })
        );
      }
    }
  }

  private getWebSocketUrl(): string | null {
    const rawBackend = getBackendUrl();
    if (rawBackend === null) return null;

    let baseWs = '';
    if (rawBackend === '') {
      if (typeof window !== 'undefined') {
        const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        baseWs = `${proto}//${window.location.host}`;
      } else {
        baseWs = 'ws://127.0.0.1:8000';
      }
    } else {
      baseWs = rawBackend.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:').replace(/\/+$/, '');
    }

    const params = new URLSearchParams();
    params.set('client_id', this.clientId);
    if (this.options.area) params.set('area', this.options.area);
    if (this.options.businessId) params.set('business_id', this.options.businessId);

    return `${baseWs}/api/v1/ws?${params.toString()}`;
  }

  private initWebSocket() {
    const wsUrl = this.getWebSocketUrl();
    if (!wsUrl) {
      this.setStatus('disconnected');
      return;
    }

    this.setStatus('connecting');

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        this.reconnectAttempts = 0;
        this.setStatus('connected');
        this.startHeartbeat();

        // Resubscribe to tracked order channels
        if (this.activeOrderSubscriptions.size > 0 && this.socket) {
          for (const ord of this.activeOrderSubscriptions) {
            try {
              this.socket.send(
                JSON.stringify({ type: 'SUBSCRIBE', channel: `order:${ord.toLowerCase()}` })
              );
            } catch {}
          }
        }
      };

      this.socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          this.handleIncomingMessage(msg);
        } catch (e) {
          console.warn('[ws] could not parse frame', e);
        }
      };

      this.socket.onerror = (e) => {
        console.warn('[ws] socket error, falling back if offline', e);
      };

      this.socket.onclose = () => {
        this.stopHeartbeat();
        this.setStatus('reconnecting');
        this.scheduleReconnect();
      };
    } catch (err) {
      console.warn('[ws] failed to construct websocket, starting fallback', err);
      this.startSseFallback();
    }
  }

  private handleIncomingMessage(msg: any) {
    if (!msg || !msg.type) return;

    switch (msg.type) {
      case 'CONNECTED':
        // If initial active alerts returned, broadcast them
        if (Array.isArray(msg.active_alerts) && msg.active_alerts.length > 0) {
          for (const a of msg.active_alerts) {
            this.dispatchCivicAlert(a, false);
          }
        }
        break;

      case 'CIVIC_ALERT':
        if (msg.alert) {
          playSoundNotification('alert');
          this.dispatchCivicAlert(msg.alert, true);
        }
        break;

      case 'MERCHANT_LEAD':
        if (msg.data) {
          playSoundNotification('lead');
          this.dispatchMerchantLead(msg.data, msg.business_id);
        }
        break;

      case 'MERCHANT_INQUIRY':
        if (msg.data) {
          playSoundNotification('lead');
          this.dispatchMerchantInquiry(msg.data, msg.business_id);
        }
        break;

      case 'MERCHANT_REVIEW':
        if (msg.data) {
          playSoundNotification('lead');
          this.dispatchMerchantReview(msg.data, msg.business_id);
        }
        break;

      case 'MERCHANT_ORDER':
        if (msg.data) {
          playSoundNotification('order');
          this.dispatchMerchantOrder(msg.data, msg.business_id);
        }
        break;

      case 'ORDER_STATUS_UPDATE':
        if (msg.order_number || msg.data?.order_number) {
          playSoundNotification('lead');
          this.dispatchOrderStatusUpdate(msg);
        }
        break;

      case 'PONG':
        // Heartbeat acknowledged
        break;
    }
  }

  private dispatchCivicAlert(rawAlert: any, isPush: boolean) {
    const sev = rawAlert.severity === 'Critical' ? 'Critical' : 'Important';
    const alertItem: LiveAlertItem = {
      id: rawAlert.id || `alert-${Date.now()}`,
      title: rawAlert.title || 'Civic Notice',
      description: rawAlert.description || '',
      instruction: rawAlert.instruction || 'Follow local municipal guidance.',
      areaDescription: rawAlert.areaDescription || this.options.area || 'Local Area',
      category: rawAlert.category || 'Civic',
      severity: sev,
      sender: rawAlert.sender || 'NDMA SACHET',
      timeAgo: rawAlert.timeAgo || 'Just now',
      badgeClass:
        sev === 'Critical'
          ? 'bg-rose-600 text-white animate-pulse'
          : 'bg-amber-500 text-white',
      icon: 'AlertTriangle',
    };

    window.dispatchEvent(
      new CustomEvent(CIVIC_ALERT_EVENT, {
        detail: {
          alert: alertItem,
          isPush,
          timestamp: new Date().toISOString(),
        },
      })
    );
  }

  private dispatchMerchantLead(data: any, businessId: string) {
    const now = new Date();
    const lead: MerchantLeadItem = {
      id: data.id || `lead-${Date.now()}`,
      customerName: data.customerName || 'Inquiring Customer',
      phone: data.phone || '+91 98000 00000',
      email: data.email || 'customer@example.com',
      enquiryText: `${data.topic ? `[${data.topic}] ` : ''}${data.message || 'Direct quote request'}`,
      source: 'Website',
      date: now.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      status: 'New',
      interestedCategory: data.topic || 'General Services',
      preferredDate: 'Flexible',
    };

    window.dispatchEvent(
      new CustomEvent(MERCHANT_LEAD_EVENT, {
        detail: {
          lead,
          businessId: businessId || this.options.businessId || 'default',
          timestamp: now.toISOString(),
        },
      })
    );
  }

  private dispatchMerchantInquiry(data: any, businessId: string) {
    window.dispatchEvent(
      new CustomEvent(MERCHANT_INQUIRY_EVENT, {
        detail: {
          inquiry: data,
          businessId: businessId || this.options.businessId || 'default',
          timestamp: new Date().toISOString(),
        },
      })
    );
  }

  private dispatchMerchantReview(data: any, businessId: string) {
    const review: MerchantReviewItem = {
      id: data.id || `rev-${Date.now()}`,
      customerName: data.customerName || 'Verified Patron',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      rating: Number(data.rating) || 5,
      timeAgo: data.timeAgo || 'Just now',
      isVerified: true,
      comment: data.comment || 'Wonderful service and quick turnaround!',
      tags: ['Verified Customer', 'Prompt Service'],
    };

    window.dispatchEvent(
      new CustomEvent(MERCHANT_REVIEW_EVENT, {
        detail: {
          review,
          businessId: businessId || this.options.businessId || 'default',
          timestamp: new Date().toISOString(),
        },
      })
    );
  }

  private dispatchMerchantOrder(orderData: any, businessId: string) {
    window.dispatchEvent(
      new CustomEvent(MERCHANT_ORDER_EVENT, {
        detail: {
          order: orderData,
          businessId: businessId || this.options.businessId || 'default',
          timestamp: new Date().toISOString(),
        },
      })
    );
  }

  private dispatchOrderStatusUpdate(updateData: any) {
    const raw = updateData.data || updateData;
    window.dispatchEvent(
      new CustomEvent(ORDER_STATUS_EVENT, {
        detail: {
          orderNumber: raw.order_number || updateData.order_number,
          status: raw.status || updateData.status,
          paymentStatus: raw.payment_status || updateData.payment_status,
          notes: raw.notes || updateData.notes,
          updatedAt: raw.updated_at || updateData.timestamp || new Date().toISOString(),
        },
      })
    );
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.pingTimer = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: 'PING' }));
      }
    }, 25000);
  }

  private stopHeartbeat() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectAttempts++;
    if (this.reconnectAttempts > 3) {
      // Avoid infinite retry loops when backend is offline
      this.setStatus('disconnected');
      return;
    }

    // Exponential backoff: 1.5s, 3s, 6s
    const delay = Math.min(
      this.maxReconnectDelay,
      1500 * Math.pow(2, this.reconnectAttempts - 1) + Math.random() * 500
    );

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.initWebSocket();
    }, delay);
  }

  private startSseFallback() {
    if (typeof EventSource === 'undefined') return;
    this.stopHeartbeat();
    if (this.socket) {
      try {
        this.socket.close();
      } catch {}
      this.socket = null;
    }

    const rawBackend = getBackendUrl();
    if (rawBackend === null) {
      this.setStatus('disconnected');
      return;
    }
    const channels = ['civic', `merchant:${this.options.businessId || 'biz-daily-brew'}`].join(',');
    const sseUrl = `${rawBackend.replace(/\/+$/, '')}/api/v1/ws/sse?channels=${encodeURIComponent(channels)}`;

    let sseErrorCount = 0;
    try {
      this.sseSource = new EventSource(sseUrl);
      this.sseSource.onopen = () => {
        this.setStatus('connected');
      };
      this.sseSource.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          this.handleIncomingMessage(msg);
        } catch {}
      };
      this.sseSource.onerror = () => {
        sseErrorCount++;
        if (sseErrorCount > 2) {
          if (this.sseSource) {
            this.sseSource.close();
            this.sseSource = null;
          }
          this.setStatus('disconnected');
        } else {
          this.setStatus('reconnecting');
        }
      };
    } catch (e) {
      console.warn('[sse] fallback could not connect', e);
    }
  }

  public reconnect() {
    this.reconnectAttempts = 0;
    this.cleanup();
    this.initWebSocket();
  }

  public cleanup() {
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.socket) {
      try {
        this.socket.close();
      } catch {}
      this.socket = null;
    }
    if (this.sseSource) {
      try {
        this.sseSource.close();
      } catch {}
      this.sseSource = null;
    }
    this.setStatus('disconnected');
  }

  // =========================================================================
  // SIMULATION / TRIGGER HELPER METHODS
  // =========================================================================

  public async triggerCivicAlert(alertData?: Partial<LiveAlertItem>): Promise<boolean> {
    const rawBackend = getBackendUrl();
    if (rawBackend) {
      try {
        const res = await fetch(`${rawBackend.replace(/\/+$/, '')}/api/v1/ws/trigger-civic-alert`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: alertData?.title || '🚨 Flash Flood & Waterlogging Warning — NDMA SACHET',
            description:
              alertData?.description ||
              `Waterlogging and traffic diversions active near low-lying roads in ${this.options.area || 'your area'}.`,
            severity: alertData?.severity || 'Critical',
            category: 'Civic Emergency',
            sender: 'NDMA SACHET (CAP v1.2)',
            target_area: this.options.area,
            instruction: 'Avoid arterial underpasses and follow civic emergency lines (1077).',
          }),
        });
        if (res.ok) return true;
      } catch {
        // Fall back to client dispatch
      }
    }
    // If backend offline, simulate client-side frame
      this.dispatchCivicAlert(
        {
          id: `sim-${Date.now()}`,
          title: alertData?.title || '🚨 Flash Flood & Waterlogging Warning — NDMA SACHET',
          description:
            alertData?.description ||
            `Waterlogging and traffic diversions active near low-lying roads in ${this.options.area || 'your area'}.`,
          severity: 'Critical',
          category: 'Weather',
          sender: 'NDMA SACHET (CAP v1.2)',
          instruction: 'Avoid arterial underpasses and follow civic emergency lines (1077).',
          timeAgo: 'Just now',
        },
        true
      );
      return true;
  }

  public async triggerMerchantLead(custom?: {
    customerName?: string;
    topic?: string;
    phone?: string;
    message?: string;
  }): Promise<boolean> {
    const rawBackend = getBackendUrl();
    const bizId = this.options.businessId || 'biz-daily-brew';

    if (rawBackend) {
      try {
        const res = await fetch(`${rawBackend.replace(/\/+$/, '')}/api/v1/ws/trigger-merchant-lead`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            business_id: bizId,
            customer_name: custom?.customerName || 'Aarav Sharma',
            customer_phone: custom?.phone || '+91 98112 44321',
            customer_email: 'aarav.sharma@example.com',
            enquiry_type: 'quote',
            topic: custom?.topic || 'Catering & Bulk Coffee Order',
            message:
              custom?.message ||
              'Hi! Inquiring for 35 corporate snack & coffee kits for this Friday afternoon.',
            locality: this.options.area || 'Local Area',
          }),
        });
        if (res.ok) return true;
      } catch {
        // Fallback local dispatch
      }
    }
      this.dispatchMerchantLead(
        {
          id: `lead-sim-${Date.now()}`,
          customerName: custom?.customerName || 'Aarav Sharma',
          phone: custom?.phone || '+91 98112 44321',
          email: 'aarav.sharma@example.com',
          topic: custom?.topic || 'Catering & Bulk Coffee Order',
          message:
            custom?.message ||
            'Hi! Inquiring for 35 corporate snack & coffee kits for this Friday afternoon.',
        },
        bizId
      );
      return true;
  }

  public async triggerMerchantInquiry(customerName = 'Neha Kapoor', message = 'Do you offer vegan almond milk options for delivery?'): Promise<boolean> {
    const rawBackend = getBackendUrl();
    const bizId = this.options.businessId || 'biz-daily-brew';

    if (rawBackend) {
      try {
        const res = await fetch(`${rawBackend.replace(/\/+$/, '')}/api/v1/ws/trigger-merchant-inquiry`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            business_id: bizId,
            customer_name: customerName,
            message,
            time_ago: 'Just now',
          }),
        });
        if (res.ok) return true;
      } catch {
        // Fallback local dispatch
      }
    }
    this.dispatchMerchantInquiry(
      {
        id: `inq-${Date.now()}`,
        customerName,
        message,
        timeAgo: 'Just now',
      },
      bizId
    );
    return true;
  }

  public async triggerMerchantReview(customerName = 'Rahul Mehra', rating = 5, comment = 'Super fast delivery and the packaging was top notch! 10/10'): Promise<boolean> {
    const rawBackend = getBackendUrl();
    const bizId = this.options.businessId || 'biz-daily-brew';

    if (rawBackend) {
      try {
        const res = await fetch(`${rawBackend.replace(/\/+$/, '')}/api/v1/ws/trigger-merchant-review`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            business_id: bizId,
            customer_name: customerName,
            rating,
            comment,
            time_ago: 'Just now',
          }),
        });
        if (res.ok) return true;
      } catch {
        // Fallback local dispatch
      }
    }
      this.dispatchMerchantReview(
        {
          id: `rev-${Date.now()}`,
          customerName,
          rating,
          comment,
          timeAgo: 'Just now',
        },
        bizId
      );
      return true;
  }

  public async triggerMerchantOrder(custom?: {
    orderNumber?: string;
    businessName?: string;
    customerName?: string;
    customerPhone?: string;
    deliveryAddress?: string;
    finalPayable?: number;
    items?: any[];
  }): Promise<boolean> {
    const rawBackend = getBackendUrl();
    const bizId = this.options.businessId || 'biz-registered-store';

    if (rawBackend) {
      try {
        const res = await fetch(`${rawBackend.replace(/\/+$/, '')}/api/v1/ws/trigger-merchant-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            business_id: bizId,
            business_name: custom?.businessName || (this.options.businessId ? 'Your Storefront' : 'Verified Storefront'),
            customer_name: custom?.customerName || 'Local Citizen',
            customer_phone: custom?.customerPhone || '+91 98765 43210',
            delivery_address: custom?.deliveryAddress || (this.options.area ? `Flat 402, Tower B, ${this.options.area}` : 'Local Residential Complex'),
            final_payable: custom?.finalPayable || 380.0,
            items: custom?.items,
          }),
        });
        if (res.ok) return true;
      } catch {
        // Fallback local dispatch
      }
    }

    const orderNum = custom?.orderNumber || `MA24-ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    this.dispatchMerchantOrder(
      {
        id: `ord-local-${Date.now()}`,
        order_number: orderNum,
        business_id: bizId,
        business_name: custom?.businessName || 'Verified Storefront',
        customer_name: custom?.customerName || 'Local Citizen',
        customer_phone: custom?.customerPhone || '+91 98765 43210',
        delivery_address: custom?.deliveryAddress || (this.options.area ? `Flat 402, Tower B, ${this.options.area}` : 'Local Residential Complex'),
        final_payable: custom?.finalPayable || 380.0,
        payment_method: 'upi_qr',
        payment_status: 'paid',
        status: 'placed',
        estimated_delivery_mins: 20,
        created_at: new Date().toISOString(),
        items: custom?.items || [
          { product_name: 'Caramel Macchiato (Large)', unit_price: 190.0, quantity: 1, total_price: 190.0 },
          { product_name: 'Fresh Blueberry Muffin', unit_price: 190.0, quantity: 1, total_price: 190.0 },
        ],
      },
      bizId
    );
    return true;
  }

  public async triggerOrderStatusUpdate(orderNumber: string, status: string): Promise<boolean> {
    const rawBackend = getBackendUrl();
    if (rawBackend) {
      try {
        const res = await fetch(`${rawBackend.replace(/\/+$/, '')}/api/v1/ws/trigger-order-status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order_number: orderNumber,
            status,
            payment_status: 'paid',
            notes: `Order transitioned to ${status}`,
          }),
        });
        if (res.ok) return true;
      } catch {
        // Fallback local dispatch
      }
    }
      this.dispatchOrderStatusUpdate({
        order_number: orderNumber,
        status,
        payment_status: 'paid',
        notes: `Order transitioned to ${status}`,
        updated_at: new Date().toISOString(),
      });
      return true;
    }
  }

// Global singleton instance
export const realtimeService = new RealtimePushService();
