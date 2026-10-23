import asyncio
import datetime
import json
import random
import uuid
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

def random_digits(k: int = 4) -> str:
    return "".join(random.choices("0123456789", k=k))

from backend.app.api.deps import get_current_user
from backend.app.core.config import settings
from backend.app.core.logging import logger
from backend.app.core.websocket_manager import ws_manager
from backend.app.database.models import GovernmentNotice, CustomerEnquiry, Business, User
from backend.app.database.session import get_db

router = APIRouter(tags=["Real-Time WebSockets & Push Notifications"])


class TriggerAlertRequest(BaseModel):
    title: str = "🚨 Flash Flood Warning — NDMA SACHET"
    description: str = "Heavy localized rainfall has caused waterlogging near arterial roads and underpasses. Please avoid low-lying routes."
    severity: str = "Critical"  # 'Critical', 'Warning', 'Advisory', 'Information'
    category: str = "Civic Emergency"
    sender: str = "NDMA SACHET (CAP v1.2)"
    target_area: Optional[str] = None
    instruction: Optional[str] = "Stay indoors if possible; follow local municipal traffic advisories."


class TriggerLeadRequest(BaseModel):
    business_id: str = "biz-daily-brew"
    customer_name: str = "Aarav Sharma"
    customer_phone: str = "+91 98112 44321"
    customer_email: Optional[str] = "aarav.sharma@example.com"
    enquiry_type: str = "quote"  # 'quote' | 'callback' | 'availability' | 'catering'
    topic: str = "Bulk Coffee Bean Supply & Espresso Catering"
    message: str = "Hi! We are organizing a 40-person corporate workshop in Rohini Sector 10 this Friday and need hot brew catering & pastries quote."
    locality: str = "Rohini Sector 10"


class TriggerInquiryRequest(BaseModel):
    business_id: str = "biz-daily-brew"
    customer_name: str = "Pooja Verma"
    message: str = "Is outdoor seating available today for a team catchup around 5 PM?"
    time_ago: str = "Just now"


class TriggerReviewRequest(BaseModel):
    business_id: str = "biz-daily-brew"
    customer_name: str = "Vikram Malhotra"
    rating: float = 5.0
    comment: str = "Hands down the best pour-over in Rohini! Quick delivery and exceptional roast quality. ⭐⭐⭐⭐⭐"
    time_ago: str = "Just now"


class TriggerOrderRequest(BaseModel):
    business_id: str = "biz-daily-brew"
    customer_name: str = "Rohan Varma"
    customer_phone: str = "+91 98711 44210"
    delivery_address: str = "Flat 304, Palm Grove Heights, Rohini Sector 9"
    final_payable: float = 345.0
    payment_method: str = "upi_qr"
    payment_status: str = "paid"
    items: Optional[List[Dict[str, Any]]] = None


class TriggerOrderStatusRequest(BaseModel):
    order_number: str = "MA24-ORD-8821"
    status: str = "confirmed"  # 'placed', 'confirmed', 'out_for_delivery', 'delivered', 'cancelled'
    payment_status: Optional[str] = "paid"
    notes: Optional[str] = "Kitchen preparing freshly packed order."


@router.websocket("/api/v1/ws")
@router.websocket("/ws/live")
async def websocket_live_endpoint(
    websocket: WebSocket,
    client_id: Optional[str] = Query(None),
    area: Optional[str] = Query(None),
    business_id: Optional[str] = Query(None),
):
    """
    Bidirectional WebSocket connection for instant push notifications:
      - Critical NDMA SACHET alerts & flash flood notices (civic channel)
      - Instant customer leads, quotes, inquiries, and reviews (merchant channel)
    """
    cid = client_id or f"client-{uuid.uuid4().hex[:8]}"
    await ws_manager.connect(websocket, client_id=cid, area=area, business_id=business_id)

    # Immediately push active critical notices so the client doesn't have to wait for next broadcast
    try:
        from backend.app.database.session import SessionLocal

        active_notices: List[Dict[str, Any]] = []
        with SessionLocal() as db:
            now = datetime.datetime.utcnow()
            notices = (
                db.query(GovernmentNotice)
                .filter(GovernmentNotice.is_active == True)
                .order_by(GovernmentNotice.effective_at.desc())
                .limit(5)
                .all()
            )
            for n in notices:
                active_notices.append(
                    {
                        "id": f"sachet-{n.id}",
                        "title": n.headline or n.event_type or "Official Advisory",
                        "description": n.description or n.area_description or "NDMA Notice",
                        "severity": n.severity or "Critical",
                        "category": "Weather",
                        "sender": n.sender or "NDMA SACHET",
                        "instruction": n.instruction or "Follow civic instructions",
                        "effective_at": n.effective_at.isoformat() if n.effective_at else now.isoformat(),
                    }
                )

        welcome_packet = {
            "type": "CONNECTED",
            "client_id": cid,
            "connected_at": datetime.datetime.utcnow().isoformat(),
            "subscribed_channels": [
                "civic",
                "broadcast",
                *( [f"civic:{area.strip().lower()}"] if area else [] ),
                *( [f"merchant:{business_id.strip()}"] if business_id else [] ),
            ],
            "active_alerts": active_notices,
        }
        await ws_manager.send_personal_message(welcome_packet, websocket)

        # Event loop listening to client frames
        while True:
            data_text = await websocket.receive_text()
            try:
                msg = json.loads(data_text)
                mtype = msg.get("type", "").upper()

                if mtype == "PING":
                    await ws_manager.send_personal_message(
                        {"type": "PONG", "timestamp": datetime.datetime.utcnow().isoformat()},
                        websocket,
                    )

                elif mtype == "SUBSCRIBE":
                    channel = msg.get("channel")
                    if channel:
                        await ws_manager.subscribe(websocket, channel)
                        await ws_manager.send_personal_message(
                            {"type": "SUBSCRIBED", "channel": channel}, websocket
                        )

                elif mtype == "UNSUBSCRIBE":
                    channel = msg.get("channel")
                    if channel:
                        await ws_manager.unsubscribe(websocket, channel)
                        await ws_manager.send_personal_message(
                            {"type": "UNSUBSCRIBED", "channel": channel}, websocket
                        )

                elif mtype in ("SIMULATE_LEAD", "SIMULATE_CIVIC_ALERT", "SIMULATE_ORDER", "SIMULATE_ORDER_STATUS"):
                    # Simulation commands strictly prohibited in production mode
                    if (settings.APP_ENV or "").strip().lower() in ("production", "prod"):
                        await ws_manager.send_personal_message(
                            {"type": "ERROR", "message": "Simulation commands are strictly disabled in production."},
                            websocket,
                        )
                        continue

                    if mtype == "SIMULATE_LEAD":
                        # Instant test frame from client
                        biz = msg.get("business_id", business_id or "biz-daily-brew")
                        await ws_manager.send_merchant_event(
                            biz,
                            "MERCHANT_LEAD",
                            {
                                "id": f"lead-{int(datetime.datetime.utcnow().timestamp() * 1000)}",
                                "customerName": msg.get("customerName", "Priya Sharma"),
                                "phone": msg.get("phone", "+91 98711 22345"),
                                "email": msg.get("email", "priya.sharma@example.com"),
                                "topic": msg.get("topic", "Corporate Catering Inquiry"),
                                "message": msg.get("message", "Need pricing for 25 artisanal coffee combos"),
                                "locality": area or "Rohini Sector 10",
                                "timeAgo": "Just now",
                                "status": "New",
                                "source": "WhatsApp / MyArea24 Live Lead",
                            },
                        )

                    elif mtype == "SIMULATE_CIVIC_ALERT":
                        await ws_manager.broadcast_civic_alert(
                            {
                                "id": f"alert-{int(datetime.datetime.utcnow().timestamp())}",
                                "title": msg.get("title", "🚨 Flash Flood Advisory — NDMA SACHET"),
                                "description": msg.get(
                                    "description",
                                    "Severe water-logging reported under flyovers in Rohini. Municipal pumps deployed.",
                                ),
                                "severity": msg.get("severity", "Critical"),
                                "category": "Disaster / Weather",
                                "sender": "NDMA SACHET (CAP v1.2)",
                                "instruction": "Avoid low-lying underpasses. Dial 1077 for emergency assistance.",
                                "timeAgo": "Just now",
                            },
                            target_area=area,
                        )

                    elif mtype == "SIMULATE_ORDER":
                        biz = msg.get("business_id", business_id or "biz-daily-brew")
                        order_num = msg.get("order_number", f"MA24-ORD-{random_digits()}")
                        order_payload = {
                            "id": f"ord-{int(datetime.datetime.utcnow().timestamp() * 1000)}",
                            "order_number": order_num,
                            "business_id": biz,
                            "business_name": "The Daily Brew (Rohini)",
                            "customer_name": msg.get("customer_name", "Sneha Kapoor"),
                            "customer_phone": msg.get("customer_phone", "+91 98711 55667"),
                            "delivery_address": msg.get("delivery_address", "Flat 402, Tower B, Rohini Sector 9"),
                            "final_payable": float(msg.get("final_payable", 380.0)),
                            "payment_method": msg.get("payment_method", "upi_qr"),
                            "payment_status": msg.get("payment_status", "paid"),
                            "status": "placed",
                            "estimated_delivery_mins": 20,
                            "created_at": datetime.datetime.utcnow().isoformat(),
                            "items": msg.get("items", [
                                {"product_name": "Caramel Macchiato (Large)", "unit_price": 190.0, "quantity": 1, "total_price": 190.0},
                                {"product_name": "Fresh Blueberry Muffin", "unit_price": 190.0, "quantity": 1, "total_price": 190.0},
                            ]),
                        }
                        await ws_manager.send_merchant_event(biz, "MERCHANT_ORDER", order_payload)
                        await ws_manager.broadcast_to_channel(f"order:{order_num.lower()}", {
                            "type": "ORDER_STATUS_UPDATE",
                            "order_number": order_num,
                            "status": "placed",
                            "payment_status": "paid",
                            "updated_at": datetime.datetime.utcnow().isoformat(),
                        })
                        await ws_manager.broadcast_to_channel("broadcast", {
                            "type": "ORDER_STATUS_UPDATE",
                            "order_number": order_num,
                            "status": "placed",
                            "payment_status": "paid",
                            "updated_at": datetime.datetime.utcnow().isoformat(),
                        })

                    elif mtype == "SIMULATE_ORDER_STATUS":
                        order_num = msg.get("order_number", "MA24-ORD-8821")
                        new_status = msg.get("status", "confirmed")
                        update_data = {
                            "type": "ORDER_STATUS_UPDATE",
                            "order_number": order_num,
                            "status": new_status,
                            "payment_status": msg.get("payment_status", "paid"),
                            "notes": msg.get("notes", "Order status transitioned"),
                            "updated_at": datetime.datetime.utcnow().isoformat(),
                        }
                        await ws_manager.broadcast_order_update(order_num, new_status, update_data)
                        biz = msg.get("business_id", business_id or "biz-daily-brew")
                        await ws_manager.send_merchant_event(biz, "ORDER_STATUS_UPDATE", update_data)

            except json.JSONDecodeError:
                logger.warning(f"[ws] Received invalid non-JSON payload from {cid}: {data_text[:50]}")

    except WebSocketDisconnect:
        await ws_manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"[ws] Unexpected error in socket session for {cid}: {e}")
        await ws_manager.disconnect(websocket)


# ============================================================================
# REST BROADCAST & TRIGGER ENDPOINTS
# ============================================================================

@router.post("/api/v1/ws/trigger-civic-alert")
async def trigger_civic_alert(
    req: TriggerAlertRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Broadcasts an urgent NDMA SACHET or Civic Alert to all connected citizen and merchant sockets.
    Restricted strictly to administrators to prevent unauthorized mass panic broadcasting.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Only platform administrators can trigger manual civic alerts.",
        )

    alert_payload = {
        "id": f"alert-push-{int(datetime.datetime.utcnow().timestamp())}",
        "title": req.title,
        "description": req.description,
        "severity": req.severity,
        "category": req.category,
        "sender": req.sender,
        "instruction": req.instruction or "Heed local disaster management guidelines.",
        "timeAgo": "Just now",
    }
    delivered = await ws_manager.broadcast_civic_alert(alert_payload, target_area=req.target_area)
    return {
        "success": True,
        "message": f"Civic alert broadcasted to {delivered} active subscriber(s).",
        "alert": alert_payload,
        "delivered_to_connections": delivered,
    }


@router.post("/api/v1/ws/trigger-merchant-lead")
async def trigger_merchant_lead(req: TriggerLeadRequest, db: Session = Depends(get_db)):
    """
    Broadcasts a live lead or quote inquiry to the merchant's dashboard in real-time.
    Also records an enquiry in the database.
    """
    lead_id = f"lead-live-{int(datetime.datetime.utcnow().timestamp() * 1000)}"
    lead_data = {
        "id": lead_id,
        "customerName": req.customer_name,
        "phone": req.customer_phone,
        "email": req.customer_email or "verified.customer@myarea24.in",
        "topic": req.topic,
        "message": req.message,
        "locality": req.locality,
        "timeAgo": "Just now",
        "status": "New",
        "source": "MyArea24 Instant Lead Generator",
    }

    delivered = await ws_manager.send_merchant_event(
        req.business_id,
        "MERCHANT_LEAD",
        lead_data,
    )

    return {
        "success": True,
        "message": f"Lead delivered live to merchant '{req.business_id}' across {delivered} socket connection(s).",
        "lead": lead_data,
    }


@router.post("/api/v1/ws/trigger-merchant-inquiry")
async def trigger_merchant_inquiry(req: TriggerInquiryRequest):
    """
    Broadcasts an incoming customer chat inquiry to the merchant.
    """
    inquiry_data = {
        "id": f"inq-{int(datetime.datetime.utcnow().timestamp() * 1000)}",
        "customerName": req.customer_name,
        "message": req.message,
        "timeAgo": req.time_ago,
        "business_id": req.business_id,
    }

    delivered = await ws_manager.send_merchant_event(
        req.business_id,
        "MERCHANT_INQUIRY",
        inquiry_data,
    )

    return {
        "success": True,
        "message": f"Inquiry delivered live to merchant '{req.business_id}'.",
        "inquiry": inquiry_data,
    }


@router.post("/api/v1/ws/trigger-merchant-review")
async def trigger_merchant_review(req: TriggerReviewRequest):
    """
    Broadcasts a new verified customer review to the merchant.
    """
    review_data = {
        "id": f"rev-{int(datetime.datetime.utcnow().timestamp() * 1000)}",
        "customerName": req.customer_name,
        "rating": req.rating,
        "comment": req.comment,
        "timeAgo": req.time_ago,
        "business_id": req.business_id,
    }

    delivered = await ws_manager.send_merchant_event(
        req.business_id,
        "MERCHANT_REVIEW",
        review_data,
    )

    return {
        "success": True,
        "message": f"Review delivered live to merchant '{req.business_id}'.",
        "review": review_data,
    }


@router.post("/api/v1/ws/trigger-merchant-order")
async def trigger_merchant_order(req: TriggerOrderRequest):
    """
    Broadcasts a new incoming customer order to the merchant dashboard in real-time.
    Also alerts the order status channel.
    """
    order_num = f"MA24-ORD-{random_digits()}"
    items = req.items or [
        {"product_name": "Caramel Macchiato (Large)", "unit_price": 190.0, "quantity": 1, "total_price": 190.0},
        {"product_name": "Fresh Blueberry Muffin", "unit_price": 155.0, "quantity": 1, "total_price": 155.0},
    ]
    order_data = {
        "id": f"ord-live-{int(datetime.datetime.utcnow().timestamp() * 1000)}",
        "order_number": order_num,
        "business_id": req.business_id,
        "business_name": "The Daily Brew (Rohini)",
        "customer_name": req.customer_name,
        "customer_phone": req.customer_phone,
        "delivery_address": req.delivery_address,
        "final_payable": req.final_payable,
        "payment_method": req.payment_method,
        "payment_status": req.payment_status,
        "status": "placed",
        "estimated_delivery_mins": 20,
        "created_at": datetime.datetime.utcnow().isoformat(),
        "items": items,
    }

    delivered = await ws_manager.send_merchant_event(
        req.business_id,
        "MERCHANT_ORDER",
        order_data,
    )
    # Also push initial status update to order channel and global broadcast
    status_payload = {
        "type": "ORDER_STATUS_UPDATE",
        "order_number": order_num,
        "status": "placed",
        "payment_status": req.payment_status,
        "updated_at": datetime.datetime.utcnow().isoformat(),
    }
    await ws_manager.broadcast_to_channel(f"order:{order_num.lower()}", status_payload)
    await ws_manager.broadcast_to_channel("broadcast", status_payload)

    return {
        "success": True,
        "message": f"Order #{order_num} delivered live to merchant '{req.business_id}'.",
        "order": order_data,
        "delivered_to_connections": delivered,
    }


@router.post("/api/v1/ws/trigger-order-status")
async def trigger_order_status(req: TriggerOrderStatusRequest):
    """
    Broadcasts a real-time order lifecycle stage update to the customer and merchant.
    """
    update_data = {
        "type": "ORDER_STATUS_UPDATE",
        "order_number": req.order_number,
        "status": req.status,
        "payment_status": req.payment_status or "paid",
        "notes": req.notes or f"Order advanced to {req.status}",
        "updated_at": datetime.datetime.utcnow().isoformat(),
    }
    delivered = await ws_manager.broadcast_order_update(req.order_number, req.status, update_data)

    return {
        "success": True,
        "message": f"Status '{req.status}' for Order #{req.order_number} broadcasted to {delivered} connection(s).",
        "update": update_data,
        "delivered_to_connections": delivered,
    }


@router.get("/api/v1/ws/stats")
def get_websocket_stats():
    """
    Returns live connection counts and active channel subscriptions.
    """
    return {
        "status": "online",
        "server_time": datetime.datetime.utcnow().isoformat(),
        **ws_manager.get_stats(),
    }


# ============================================================================
# SSE (SERVER-SENT EVENTS) FALLBACK STREAM
# ============================================================================

@router.get("/api/v1/ws/sse")
async def sse_event_stream(
    channels: str = Query("civic", description="Comma-separated channels to subscribe to, e.g. civic,merchant:biz-daily-brew"),
):
    """
    Server-Sent Events fallback endpoint for corporate firewalls or environments
    where HTTP 101 WebSocket upgrades are blocked.
    """
    requested_channels = [c.strip().lower() for c in channels.split(",") if c.strip()]
    queue: asyncio.Queue = asyncio.Queue()

    class SseListener:
        def __init__(self, q: asyncio.Queue):
            self.q = q

        async def send_text(self, text: str):
            await self.q.put(text)

    listener = SseListener(queue)

    async def event_generator():
        try:
            # Send initial keepalive
            yield f"data: {json.dumps({'type': 'CONNECTED', 'protocol': 'SSE', 'channels': requested_channels})}\n\n"

            while True:
                # Wait for next event or 20s heartbeat
                try:
                    data = await asyncio.wait_for(queue.get(), timeout=20.0)
                    yield f"data: {data}\n\n"
                except asyncio.TimeoutError:
                    # SSE heartbeat keepalive comment
                    yield ": heartbeat\n\n"
        except asyncio.CancelledError:
            pass

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
