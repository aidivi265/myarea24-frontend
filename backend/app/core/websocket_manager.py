import asyncio
import datetime
import json
from typing import Any, Dict, List, Optional, Set
from fastapi import WebSocket, WebSocketDisconnect
from backend.app.core.logging import logger


class WebSocketConnectionManager:
    """
    High-performance real-time connection manager for MyArea24.
    Supports channel-based pub/sub for:
      - civic alerts (NDMA SACHET, flash floods, civil advisories)
      - merchant events (leads, customer inquiries, reviews, orders)
      - area-scoped notifications (e.g. civic:Rohini, civic:Pitampura)
    """

    def __init__(self):
        # All active WebSocket connections mapped to client metadata
        self.active_connections: Dict[WebSocket, Dict[str, Any]] = {}
        # Channel subscriptions: channel_name -> Set[WebSocket]
        self.channel_subscribers: Dict[str, Set[WebSocket]] = {
            "civic": set(),
            "broadcast": set(),
        }
        self._lock = asyncio.Lock()

    async def connect(
        self,
        websocket: WebSocket,
        client_id: str,
        area: Optional[str] = None,
        business_id: Optional[str] = None,
    ):
        await websocket.accept()
        async with self._lock:
            self.active_connections[websocket] = {
                "client_id": client_id,
                "area": (area or "").strip().lower(),
                "business_id": business_id,
                "connected_at": datetime.datetime.utcnow().isoformat(),
            }
            # Auto-subscribe to default channels
            self._add_to_channel(websocket, "civic")
            self._add_to_channel(websocket, "broadcast")

            if area:
                clean_area = area.strip().lower()
                self._add_to_channel(websocket, f"civic:{clean_area}")

            if business_id:
                clean_biz = str(business_id).strip()
                self._add_to_channel(websocket, f"merchant:{clean_biz}")

        logger.info(
            f"[ws] Client connected: {client_id} (area: {area}, business_id: {business_id}). "
            f"Total active connections: {len(self.active_connections)}"
        )

    async def disconnect(self, websocket: WebSocket):
        async with self._lock:
            client_info = self.active_connections.pop(websocket, None)
            for channel, subscribers in list(self.channel_subscribers.items()):
                subscribers.discard(websocket)
                # Cleanup empty dynamic channels
                if not subscribers and channel not in ["civic", "broadcast"]:
                    del self.channel_subscribers[channel]

        client_id = client_info.get("client_id", "unknown") if client_info else "unknown"
        logger.info(f"[ws] Client disconnected: {client_id}. Remaining active: {len(self.active_connections)}")

    def _add_to_channel(self, websocket: WebSocket, channel: str):
        if channel not in self.channel_subscribers:
            self.channel_subscribers[channel] = set()
        self.channel_subscribers[channel].add(websocket)

    async def subscribe(self, websocket: WebSocket, channel: str):
        async with self._lock:
            if websocket in self.active_connections:
                clean_ch = channel.strip().lower()
                self._add_to_channel(websocket, clean_ch)
                logger.debug(f"[ws] Client subscribed to channel: {clean_ch}")

    async def unsubscribe(self, websocket: WebSocket, channel: str):
        async with self._lock:
            clean_ch = channel.strip().lower()
            if clean_ch in self.channel_subscribers:
                self.channel_subscribers[clean_ch].discard(websocket)

    async def send_personal_message(self, message: Dict[str, Any], websocket: WebSocket):
        try:
            await websocket.send_text(json.dumps(message))
        except Exception as e:
            logger.warning(f"[ws] Error sending personal message: {e}")

    async def broadcast_to_channel(self, channel: str, message: Dict[str, Any]):
        """
        Broadcasts a structured JSON payload to all subscribers of a specific channel.
        Dead connections are pruned safely.
        """
        clean_ch = channel.strip().lower()
        subscribers = set()
        async with self._lock:
            if clean_ch in self.channel_subscribers:
                subscribers = set(self.channel_subscribers[clean_ch])

        if not subscribers:
            logger.debug(f"[ws] Broadcast to channel '{clean_ch}' with 0 active subscribers.")
            return 0

        payload = json.dumps(message)
        dead_sockets: List[WebSocket] = []
        sent_count = 0

        for ws in subscribers:
            try:
                await ws.send_text(payload)
                sent_count += 1
            except Exception as e:
                logger.warning(f"[ws] Failed to send frame to subscriber on channel {clean_ch}: {e}")
                dead_sockets.append(ws)

        if dead_sockets:
            for dead_ws in dead_sockets:
                await self.disconnect(dead_ws)

        logger.info(f"[ws] Broadcasted to channel '{clean_ch}': delivered to {sent_count} client(s).")
        return sent_count

    async def broadcast_civic_alert(self, alert_data: Dict[str, Any], target_area: Optional[str] = None):
        """
        Broadcasts an urgent NDMA / civic / emergency alert to:
          - Target area channel (if provided)
          - Global 'civic' channel
        """
        msg = {
            "type": "CIVIC_ALERT",
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "alert": alert_data,
        }
        delivered = await self.broadcast_to_channel("civic", msg)
        if target_area:
            clean_area = target_area.strip().lower()
            if clean_area:
                delivered += await self.broadcast_to_channel(f"civic:{clean_area}", msg)
        return delivered

    async def send_merchant_event(
        self,
        business_id: str,
        event_type: str,
        payload: Dict[str, Any],
    ):
        """
        Delivers real-time lead, review, or inquiry to a merchant storefront.
        event_type: 'MERCHANT_LEAD' | 'MERCHANT_INQUIRY' | 'MERCHANT_REVIEW' | 'MERCHANT_ORDER'
        """
        clean_biz = str(business_id).strip()
        msg = {
            "type": event_type,
            "business_id": clean_biz,
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "data": payload,
        }
        # Also deliver to generic 'merchant:all' for admin / superuser portals if subscribed
        count = await self.broadcast_to_channel(f"merchant:{clean_biz}", msg)
        count += await self.broadcast_to_channel("merchant:all", msg)
        return count

    async def broadcast_order_update(
        self,
        order_number: str,
        status: str,
        payload: Dict[str, Any],
    ):
        """
        Broadcasts order lifecycle updates (placed, confirmed, out_for_delivery, delivered)
        to the order-specific channel, global broadcast, and citizen subscribers.
        """
        clean_num = order_number.strip().lower()
        msg = {
            "type": "ORDER_STATUS_UPDATE",
            "order_number": order_number,
            "status": status,
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "data": payload,
        }
        delivered = await self.broadcast_to_channel(f"order:{clean_num}", msg)
        delivered += await self.broadcast_to_channel("broadcast", msg)
        return delivered

    def get_stats(self) -> Dict[str, Any]:
        return {
            "active_connections_count": len(self.active_connections),
            "channels_count": len(self.channel_subscribers),
            "channels": {
                k: len(v) for k, v in self.channel_subscribers.items() if len(v) > 0
            },
        }


# Global singleton instance
ws_manager = WebSocketConnectionManager()
