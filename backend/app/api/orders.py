import datetime
import hashlib
import hmac
import os
import random
import secrets
import string
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.app.api.deps import get_current_user_optional, get_current_user
from backend.app.core.config import settings
from backend.app.core.logging import logger
from backend.app.core.websocket_manager import ws_manager
from backend.app.database.models import Order, OrderItem, Product, ServiceBooking, User, Business
from backend.app.database.session import get_db

router = APIRouter(prefix="/api/v1", tags=["E-Commerce Orders & Service Bookings"])


# ---------------------------------------------------------
# Pydantic Request Schemas
# ---------------------------------------------------------
class OrderItemPayload(BaseModel):
    product_id: Optional[int] = None
    product_name: str
    unit_price: float
    quantity: int = 1
    store_name: Optional[str] = "Apna Super Mart"
    image_url: Optional[str] = None


class OrderCreateRequest(BaseModel):
    business_id: Optional[int] = None
    business_name: Optional[str] = "Neighborhood Commerce Partner"
    items: List[OrderItemPayload]
    delivery_fee: float = 0.0
    platform_fee: float = 5.0
    discount_amount: float = 0.0
    payment_method: str = "upi_qr"  # 'upi_qr', 'razorpay', 'phonepe', 'cod'
    customer_name: str
    customer_phone: str
    delivery_address: str
    delivery_landmark: Optional[str] = None
    delivery_pincode: Optional[str] = None
    delivery_lat: Optional[float] = None
    delivery_lng: Optional[float] = None
    notes: Optional[str] = None


class OrderStatusUpdateRequest(BaseModel):
    status: str  # 'placed', 'confirmed', 'out_for_delivery', 'delivered', 'cancelled'
    payment_status: Optional[str] = None
    notes: Optional[str] = None


class PaymentVerificationRequest(BaseModel):
    payment_method: str
    transaction_id: Optional[str] = None
    upi_ref_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    razorpay_order_id: Optional[str] = None
    razorpay_signature: Optional[str] = None
    amount: Optional[float] = None


class ServiceBookingCreateRequest(BaseModel):
    service_id: Optional[int] = None
    service_title: str
    category: str
    provider_name: str
    provider_phone: str
    customer_name: str
    customer_phone: str
    service_address: str
    scheduled_date: str
    scheduled_slot: str
    estimated_cost: float = 0.0
    notes: Optional[str] = None


class ServiceBookingStatusUpdateRequest(BaseModel):
    status: str  # 'requested', 'confirmed', 'in_progress', 'completed', 'cancelled'
    notes: Optional[str] = None


# ---------------------------------------------------------
# Helper Functions
# ---------------------------------------------------------
def generate_order_number() -> str:
    digits = "".join(random.choices(string.digits, k=4))
    return f"MA24-ORD-{digits}"


def generate_booking_number() -> str:
    digits = "".join(random.choices(string.digits, k=4))
    return f"MA24-SRV-{digits}"


def generate_service_otp() -> str:
    return "".join(random.choices(string.digits, k=4))


# ---------------------------------------------------------
# Order Endpoints
# ---------------------------------------------------------
@router.post("/orders", status_code=status.HTTP_201_CREATED)
async def create_order(
    req: OrderCreateRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    if not req.items:
        raise HTTPException(status_code=400, detail="Order must contain at least one item.")

    items_subtotal = sum(item.unit_price * item.quantity for item in req.items)
    final_payable = max(0.0, items_subtotal + req.delivery_fee + req.platform_fee - req.discount_amount)
    order_num = generate_order_number()

    # Determine initial payment status
    payment_status = "cod" if req.payment_method == "cod" else "pending"

    # Cryptographic tracking token for secure guest access without exposing private data
    guest_tracking_token = secrets.token_urlsafe(24)

    order = Order(
        order_number=order_num,
        user_id=current_user.id if current_user else None,
        business_id=req.business_id,
        business_name=req.business_name,
        status="placed",
        total_amount=round(items_subtotal, 2),
        delivery_fee=round(req.delivery_fee, 2),
        platform_fee=round(req.platform_fee, 2),
        discount_amount=round(req.discount_amount, 2),
        final_payable=round(final_payable, 2),
        payment_method=req.payment_method,
        payment_status=payment_status,
        tracking_token=guest_tracking_token,
        customer_name=req.customer_name,
        customer_phone=req.customer_phone,
        delivery_address=req.delivery_address,
        delivery_landmark=req.delivery_landmark,
        delivery_pincode=req.delivery_pincode,
        delivery_lat=req.delivery_lat,
        delivery_lng=req.delivery_lng,
        estimated_delivery_mins=20,
        notes=req.notes,
    )
    db.add(order)
    db.flush()

    order_items_list = []
    for item in req.items:
        # Inventory stock validation & transactional decrement
        if item.product_id:
            db_prod = db.query(Product).filter(Product.id == item.product_id).first()
            if db_prod and db_prod.stock_quantity is not None:
                if db_prod.stock_quantity < item.quantity:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Insufficient inventory for '{db_prod.name}'. Only {db_prod.stock_quantity} available, but {item.quantity} requested.",
                    )
                db_prod.stock_quantity = max(0, db_prod.stock_quantity - item.quantity)
                if db_prod.stock_quantity == 0:
                    db_prod.availability_status = "out_of_stock"
                elif db_prod.stock_quantity < 5:
                    db_prod.availability_status = "low_stock"
                db_prod.updated_at = datetime.datetime.utcnow()

        oi = OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            product_name=item.product_name,
            unit_price=item.unit_price,
            quantity=item.quantity,
            total_price=round(item.unit_price * item.quantity, 2),
            store_name=item.store_name,
            image_url=item.image_url,
        )
        db.add(oi)
        order_items_list.append(oi)

    db.commit()
    db.refresh(order)

    # UPI Dynamic Pay URI
    upi_intent_uri = (
        f"upi://pay?pa=myarea24@upi&pn=MyArea24%20Commerce&am={order.final_payable:.2f}&cu=INR&tr={order.order_number}"
    )

    order_items_summary = [
        {
            "product_name": it.product_name,
            "unit_price": it.unit_price,
            "quantity": it.quantity,
            "total_price": it.total_price,
            "store_name": it.store_name,
            "image_url": it.image_url,
        }
        for it in order.items
    ]

    # Real-Time WebSocket Push to Merchant Storefront & Order Channel
    try:
        biz_id = str(order.business_id or "biz-daily-brew")
        order_ws_data = {
            "id": order.id,
            "order_number": order.order_number,
            "business_id": biz_id,
            "business_name": order.business_name,
            "status": order.status,
            "total_amount": order.total_amount,
            "delivery_fee": order.delivery_fee,
            "platform_fee": order.platform_fee,
            "discount_amount": order.discount_amount,
            "final_payable": order.final_payable,
            "payment_method": order.payment_method,
            "payment_status": order.payment_status,
            "customer_name": order.customer_name,
            "customer_phone": order.customer_phone,
            "delivery_address": order.delivery_address,
            "estimated_delivery_mins": order.estimated_delivery_mins,
            "created_at": order.created_at.isoformat(),
            "items": order_items_summary,
        }
        await ws_manager.send_merchant_event(biz_id, "MERCHANT_ORDER", order_ws_data)
        await ws_manager.broadcast_order_update(order.order_number, order.status, {
            "order_number": order.order_number,
            "status": order.status,
            "payment_status": order.payment_status,
            "updated_at": order.created_at.isoformat(),
        })
    except Exception as e:
        logger.warning(f"[ws] Could not broadcast new order over websockets: {e}")

    return {
        "status": "success",
        "message": "Order placed successfully!",
        "order": {
            "id": order.id,
            "order_number": order.order_number,
            "status": order.status,
            "total_amount": order.total_amount,
            "delivery_fee": order.delivery_fee,
            "platform_fee": order.platform_fee,
            "discount_amount": order.discount_amount,
            "final_payable": order.final_payable,
            "payment_method": order.payment_method,
            "payment_status": order.payment_status,
            "tracking_token": order.tracking_token,
            "customer_name": order.customer_name,
            "customer_phone": order.customer_phone,
            "delivery_address": order.delivery_address,
            "estimated_delivery_mins": order.estimated_delivery_mins,
            "created_at": order.created_at.isoformat(),
            "items": order_items_summary,
        },
        "payment": {
            "method": order.payment_method,
            "payable_amount": order.final_payable,
            "upi_intent_uri": upi_intent_uri,
            "upi_id": "myarea24@upi",
            "razorpay_order_id": f"rzp_order_{order.order_number.replace('-', '_')}",
            "phonepe_txn_id": f"pp_txn_{order.order_number.replace('-', '_')}",
        },
    }


@router.get("/orders")
def list_orders(
    status_filter: Optional[str] = Query(None, alias="status"),
    limit: int = Query(20, le=100),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """
    Retrieves orders strictly scoped to the authenticated caller.
    Unauthenticated callers receive an empty list to prevent user account enumeration
    and arbitrary phone data harvesting.
    """
    if not current_user:
        return {
            "status": "success",
            "count": 0,
            "orders": [],
            "message": "Authentication required to access order history. Please sign in to view your orders.",
        }

    query = db.query(Order)
    if current_user.role == "admin":
        pass  # Platform administrator can inspect orders
    elif current_user.role == "merchant":
        merchant_biz_ids = [b[0] for b in db.query(Business.id).filter(Business.owner_id == current_user.id).all()]
        if merchant_biz_ids:
            query = query.filter(
                (Order.user_id == current_user.id)
                | (current_user.phone and Order.customer_phone == current_user.phone)
                | (Order.business_id.in_(merchant_biz_ids))
            )
        else:
            query = query.filter(
                (Order.user_id == current_user.id)
                | (current_user.phone and Order.customer_phone == current_user.phone)
            )
    else:
        # Resident can only view their own authenticated orders
        query = query.filter(
            (Order.user_id == current_user.id)
            | (current_user.phone and Order.customer_phone == current_user.phone)
        )

    if status_filter:
        query = query.filter(Order.status == status_filter)

    orders = query.order_by(desc(Order.created_at)).limit(limit).all()

    return {
        "status": "success",
        "count": len(orders),
        "orders": [
            {
                "id": o.id,
                "order_number": o.order_number,
                "business_name": o.business_name,
                "status": o.status,
                "total_amount": o.total_amount,
                "delivery_fee": o.delivery_fee,
                "platform_fee": o.platform_fee,
                "discount_amount": o.discount_amount,
                "final_payable": o.final_payable,
                "payment_method": o.payment_method,
                "payment_status": o.payment_status,
                "transaction_id": o.transaction_id,
                "customer_name": o.customer_name,
                "customer_phone": o.customer_phone,
                "delivery_address": o.delivery_address,
                "delivery_landmark": o.delivery_landmark,
                "delivery_pincode": o.delivery_pincode,
                "estimated_delivery_mins": o.estimated_delivery_mins,
                "created_at": o.created_at.isoformat(),
                "items_count": len(o.items),
                "items": [
                    {
                        "product_name": it.product_name,
                        "unit_price": it.unit_price,
                        "quantity": it.quantity,
                        "total_price": it.total_price,
                        "store_name": it.store_name,
                        "image_url": it.image_url,
                    }
                    for it in o.items
                ],
            }
            for o in orders
        ],
    }


@router.get("/orders/{order_identifier}")
def get_order_details(
    order_identifier: str,
    token: Optional[str] = Query(None, description="Cryptographic tracking token issued at checkout"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """
    Retrieves full details of a single order.
    Enforces authorization:
      - Authenticated customer owner (user_id / verified phone)
      - Store merchant owner (owns order.business_id)
      - Platform administrator (role == 'admin')
      - Guest with verified cryptographic tracking token issued at checkout.
    Arbitrary unverified phone numbers are strictly rejected.
    """
    if order_identifier.isdigit():
        order = db.query(Order).filter(Order.id == int(order_identifier)).first()
    else:
        order = db.query(Order).filter(Order.order_number == order_identifier).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Authorization Check
    authorized = False
    if current_user:
        if current_user.role == "admin":
            authorized = True
        elif order.user_id == current_user.id:
            authorized = True
        elif current_user.phone and order.customer_phone and current_user.phone.endswith(order.customer_phone[-10:]):
            authorized = True
        elif order.business_id:
            biz = db.query(Business).filter(Business.id == order.business_id).first()
            if biz and biz.owner_id == current_user.id:
                authorized = True
    elif token and order.tracking_token:
        # Secure cryptographic guest tracking token comparison
        if secrets.compare_digest(order.tracking_token, token.strip()):
            authorized = True

    if not authorized:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Authentication or valid cryptographic order tracking token required.",
        )

    # Dynamic status lifecycle description
    status_descriptions = {
        "placed": "Order placed with nearby store. Merchant is acknowledging your basket.",
        "confirmed": "Merchant has accepted your order and is packing fresh items.",
        "out_for_delivery": "Rider has picked up your packet and is navigating to your address.",
        "delivered": "Package safely handed over at your doorstep. Thank you for shopping local!",
        "cancelled": "Order was cancelled.",
    }

    return {
        "status": "success",
        "order": {
            "id": order.id,
            "order_number": order.order_number,
            "business_name": order.business_name,
            "status": order.status,
            "status_description": status_descriptions.get(order.status, "Processing"),
            "total_amount": order.total_amount,
            "delivery_fee": order.delivery_fee,
            "platform_fee": order.platform_fee,
            "discount_amount": order.discount_amount,
            "final_payable": order.final_payable,
            "payment_method": order.payment_method,
            "payment_status": order.payment_status,
            "transaction_id": order.transaction_id,
            "customer_name": order.customer_name,
            "customer_phone": order.customer_phone,
            "delivery_address": order.delivery_address,
            "delivery_landmark": order.delivery_landmark,
            "delivery_pincode": order.delivery_pincode,
            "delivery_lat": order.delivery_lat,
            "delivery_lng": order.delivery_lng,
            "estimated_delivery_mins": order.estimated_delivery_mins,
            "created_at": order.created_at.isoformat(),
            "updated_at": order.updated_at.isoformat(),
            "items": [
                {
                    "product_name": it.product_name,
                    "unit_price": it.unit_price,
                    "quantity": it.quantity,
                    "total_price": it.total_price,
                    "store_name": it.store_name,
                    "image_url": it.image_url,
                }
                for it in order.items
            ],
        },
    }


@router.patch("/orders/{order_identifier}/status")
async def update_order_status(
    order_identifier: str,
    payload: OrderStatusUpdateRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """
    Updates the lifecycle status of an order.
    Enforces authorization:
      - Admins & store merchants can update to confirmed, out_for_delivery, delivered, cancelled.
      - Customers can only cancel their own order while it is in 'placed' state.
    """
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required to modify order status.",
        )

    if order_identifier.isdigit():
        order = db.query(Order).filter(Order.id == int(order_identifier)).first()
    else:
        order = db.query(Order).filter(Order.order_number == order_identifier).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    valid_statuses = ["placed", "confirmed", "out_for_delivery", "delivered", "cancelled"]
    if payload.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")

    # Determine caller permissions
    is_admin = current_user.role == "admin"
    is_merchant = False
    if order.business_id:
        biz = db.query(Business).filter(Business.id == order.business_id).first()
        if biz and biz.owner_id == current_user.id:
            is_merchant = True

    is_customer = (
        order.user_id == current_user.id
        or (current_user.phone and order.customer_phone and current_user.phone.endswith(order.customer_phone[-10:]))
    )

    if not (is_admin or is_merchant or is_customer):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You do not have permission to modify this order.",
        )

    # Terminal state checks
    if order.status == "cancelled":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot modify an order that is already cancelled.",
        )
    if order.status == "delivered" and payload.status != "delivered":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot modify a delivered order.",
        )

    # If customer is modifying, they can ONLY cancel an order that is still in 'placed' stage
    if is_customer and not (is_admin or is_merchant):
        if payload.status != "cancelled":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Customers can only cancel orders.",
            )
        if order.status not in ("placed",):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot cancel order: Order is already in progress or completed.",
            )

    old_status = order.status
    order.status = payload.status
    if payload.payment_status:
        order.payment_status = payload.payment_status
    elif payload.status == "delivered" and order.payment_method == "cod":
        order.payment_status = "paid"

    if payload.notes:
        order.notes = payload.notes

    # Restock inventory on order cancellation
    if payload.status == "cancelled" and old_status != "cancelled":
        for it in order.items:
            if it.product_id:
                try:
                    db_prod = db.query(Product).filter(Product.id == it.product_id).first()
                    if db_prod and db_prod.stock_quantity is not None:
                        db_prod.stock_quantity += it.quantity
                        if db_prod.stock_quantity > 0 and db_prod.availability_status == "out_of_stock":
                            db_prod.availability_status = "in_stock"
                        db_prod.updated_at = datetime.datetime.utcnow()
                except Exception as e:
                    logger.warning(f"[inventory] Failed to restock product {it.product_id}: {e}")

    order.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(order)

    # Broadcast status transition to citizen, merchant, and tracking subscribers
    try:
        status_msg = {
            "type": "ORDER_STATUS_UPDATE",
            "order_number": order.order_number,
            "status": order.status,
            "payment_status": order.payment_status,
            "notes": order.notes,
            "updated_at": order.updated_at.isoformat(),
        }
        await ws_manager.broadcast_order_update(order.order_number, order.status, status_msg)
        biz_id = str(order.business_id or "biz-daily-brew")
        await ws_manager.send_merchant_event(biz_id, "ORDER_STATUS_UPDATE", status_msg)
    except Exception as e:
        logger.warning(f"[ws] Could not broadcast order status update over websockets: {e}")

    return {
        "status": "success",
        "message": f"Order status updated to '{order.status}'",
        "order_number": order.order_number,
        "new_status": order.status,
        "payment_status": order.payment_status,
    }


@router.post("/orders/{order_identifier}/verify-payment")
async def verify_payment(
    order_identifier: str,
    payload: PaymentVerificationRequest,
    db: Session = Depends(get_db),
):
    """
    Verifies payment for an order and transitions payment_status to 'paid'.
    Enforces:
      - Rejection of payments on cancelled orders.
      - Idempotent handling for re-submitted transactions.
      - Cryptographic HMAC-SHA256 signature verification for Razorpay.
    """
    if order_identifier.isdigit():
        order = db.query(Order).filter(Order.id == int(order_identifier)).first()
    else:
        order = db.query(Order).filter(Order.order_number == order_identifier).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status == "cancelled":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot verify payment for a cancelled order.",
        )

    # Validate amount if provided in payload to prevent underpayment exploits
    if payload.amount is not None:
        if abs(payload.amount - order.final_payable) > 0.05:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Amount mismatch. Expected ₹{order.final_payable:.2f}, received ₹{payload.amount:.2f}.",
            )

    incoming_txn = (
        payload.transaction_id
        or payload.upi_ref_id
        or payload.razorpay_payment_id
        or f"TXN_{int(datetime.datetime.utcnow().timestamp())}"
    )

    # Idempotency check: if order is already paid with this transaction ID
    if order.payment_status == "paid":
        if order.transaction_id and order.transaction_id == incoming_txn:
            return {
                "status": "success",
                "message": "Payment already verified (idempotent confirmation).",
                "transaction_id": order.transaction_id,
                "order_number": order.order_number,
                "order_status": order.status,
            }
        elif order.transaction_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Order has already been paid and settled with a different transaction ID.",
            )

    # Cryptographic HMAC-SHA256 signature verification for Razorpay
    if payload.payment_method == "razorpay":
        razorpay_secret = settings.RAZORPAY_KEY_SECRET or os.getenv("RAZORPAY_KEY_SECRET", "")
        if not razorpay_secret:
            if settings.APP_ENV in ("production", "prod", "staging"):
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Razorpay gateway secret is not configured on server.",
                )
            logger.warning("[razorpay] RAZORPAY_KEY_SECRET is unset; skipping signature check in development mode.")
        else:
            if not payload.razorpay_signature:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cryptographic razorpay_signature is required when Razorpay gateway is configured.",
                )
            order_id_to_check = payload.razorpay_order_id or f"rzp_order_{order.order_number.replace('-', '_')}"
            payment_id_to_check = payload.razorpay_payment_id or payload.transaction_id or ""
            expected_payload = f"{order_id_to_check}|{payment_id_to_check}".encode("utf-8")
            expected_sig = hmac.new(
                razorpay_secret.encode("utf-8"),
                expected_payload,
                hashlib.sha256
            ).hexdigest()
            if not hmac.compare_digest(expected_sig, payload.razorpay_signature):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cryptographic payment signature verification failed. Untrusted payload.",
                )

    order.payment_status = "paid"
    order.transaction_id = incoming_txn
    order.status = "confirmed"  # Auto advance to confirmed once paid
    order.updated_at = datetime.datetime.utcnow()

    db.commit()
    db.refresh(order)

    # Broadcast payment verification & auto-confirmed stage
    try:
        status_msg = {
            "type": "ORDER_STATUS_UPDATE",
            "order_number": order.order_number,
            "status": order.status,
            "payment_status": order.payment_status,
            "transaction_id": incoming_txn,
            "updated_at": order.updated_at.isoformat(),
        }
        await ws_manager.broadcast_order_update(order.order_number, order.status, status_msg)
        biz_id = str(order.business_id or "biz-daily-brew")
        await ws_manager.send_merchant_event(biz_id, "ORDER_STATUS_UPDATE", status_msg)
    except Exception as e:
        logger.warning(f"[ws] Could not broadcast payment verification over websockets: {e}")

    return {
        "status": "success",
        "message": "Payment verified successfully!",
        "transaction_id": incoming_txn,
        "order_number": order.order_number,
        "order_status": order.status,
    }


@router.post("/orders/webhook/razorpay")
async def razorpay_webhook(
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Direct server-to-server webhook from Razorpay for payment status synchronization.
    Verifies raw body signature using configured RAZORPAY_KEY_SECRET.
    """
    raw_body = await request.body()
    received_signature = request.headers.get("X-Razorpay-Signature")

    razorpay_secret = settings.RAZORPAY_KEY_SECRET or os.getenv("RAZORPAY_KEY_SECRET", "")
    if not razorpay_secret and settings.APP_ENV in ("production", "prod", "staging"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Razorpay webhook secret is not configured on server.",
        )
    if razorpay_secret:
        if not received_signature:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing X-Razorpay-Signature header.",
            )
        computed_sig = hmac.new(
            razorpay_secret.encode("utf-8"),
            raw_body,
            hashlib.sha256,
        ).hexdigest()
        if not hmac.compare_digest(computed_sig, received_signature):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid webhook signature.",
            )

    try:
        import json as _json
        event_payload = _json.loads(raw_body.decode("utf-8"))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload in webhook body.")

    event_type = event_payload.get("event", "")
    payment_entity = event_payload.get("payload", {}).get("payment", {}).get("entity", {})
    refund_entity = event_payload.get("payload", {}).get("refund", {}).get("entity", {})
    order_id = payment_entity.get("order_id", "")
    payment_id = payment_entity.get("id", "") or refund_entity.get("payment_id", "")
    notes = payment_entity.get("notes", {}) or refund_entity.get("notes", {})
    order_number = notes.get("order_number") or notes.get("tr")

    if not order_number and order_id and order_id.startswith("rzp_order_MA24_ORD_"):
        order_number = order_id.replace("rzp_order_", "").replace("_", "-")

    order = None
    if order_number:
        order = db.query(Order).filter(Order.order_number == order_number).first()
    elif payment_id:
        order = db.query(Order).filter(Order.transaction_id == payment_id).first()

    if order:
        if event_type in ("payment.captured", "order.paid"):
            # Currency validation: only INR is accepted
            currency = payment_entity.get("currency")
            if currency and currency.upper() != "INR":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Unsupported currency '{currency}'. Only INR transactions are accepted.",
                )

            # Idempotent duplicate event check
            if order.payment_status == "paid":
                if order.transaction_id == payment_id:
                    return {"status": "ok", "message": "Duplicate payment event ignored (idempotent)."}
                else:
                    logger.warning(
                        f"[webhook] Payment ID conflict for order {order.order_number}: "
                        f"existing={order.transaction_id}, incoming={payment_id}"
                    )
                    return {"status": "ignored", "detail": "Order already settled with another payment ID."}

            # Underpayment protection: Razorpay reports amount in paise
            paid_amount_paise = payment_entity.get("amount")
            if paid_amount_paise is not None:
                expected_paise = int(round(order.final_payable * 100))
                if abs(paid_amount_paise - expected_paise) > 5:
                    logger.warning(
                        f"[webhook] Amount mismatch on order {order.order_number}: "
                        f"expected {expected_paise} paise, received {paid_amount_paise} paise."
                    )
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Paid amount mismatch against order final payable.",
                    )

            # Check if order was already cancelled before webhook arrived
            if order.status == "cancelled":
                order.payment_status = "refund_pending"
                order.notes = (order.notes or "") + f" [Webhook: payment captured after cancellation, refund pending for {payment_id}]"
                order.updated_at = datetime.datetime.utcnow()
                db.commit()
            else:
                order.payment_status = "paid"
                order.transaction_id = payment_id or order.transaction_id
                order.status = "confirmed"
                order.updated_at = datetime.datetime.utcnow()
                db.commit()

                # Broadcast
                try:
                    status_msg = {
                        "type": "ORDER_STATUS_UPDATE",
                        "order_number": order.order_number,
                        "status": order.status,
                        "payment_status": "paid",
                        "transaction_id": order.transaction_id,
                        "updated_at": order.updated_at.isoformat(),
                    }
                    await ws_manager.broadcast_order_update(order.order_number, order.status, status_msg)
                except Exception:
                    pass

        elif event_type == "payment.failed":
            if order.payment_status != "paid":
                order.payment_status = "failed"
                order.updated_at = datetime.datetime.utcnow()
                db.commit()

        elif event_type in ("refund.processed", "refund.created"):
            refund_id_str = refund_entity.get("id", "REFUND")
            refund_amount_paise = refund_entity.get("amount", 0)
            order.payment_status = "refunded"
            if order.status != "cancelled":
                order.status = "cancelled"
            order.notes = (order.notes or "") + f" [Refund: {refund_id_str} processed for ₹{refund_amount_paise / 100:.2f}]"
            order.updated_at = datetime.datetime.utcnow()
            db.commit()

            try:
                status_msg = {
                    "type": "ORDER_STATUS_UPDATE",
                    "order_number": order.order_number,
                    "status": order.status,
                    "payment_status": "refunded",
                    "transaction_id": order.transaction_id,
                    "updated_at": order.updated_at.isoformat(),
                }
                await ws_manager.broadcast_order_update(order.order_number, order.status, status_msg)
            except Exception:
                pass

    return {"status": "ok", "event": event_type}


# ---------------------------------------------------------
# Service Booking Endpoints
# ---------------------------------------------------------
@router.post("/services/book", status_code=status.HTTP_201_CREATED)
async def create_service_booking(
    req: ServiceBookingCreateRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    booking_num = generate_booking_number()
    otp_code = generate_service_otp()

    booking = ServiceBooking(
        booking_number=booking_num,
        user_id=current_user.id if current_user else None,
        service_id=req.service_id,
        service_title=req.service_title,
        category=req.category,
        provider_name=req.provider_name,
        provider_phone=req.provider_phone,
        customer_name=req.customer_name,
        customer_phone=req.customer_phone,
        service_address=req.service_address,
        scheduled_date=req.scheduled_date,
        scheduled_slot=req.scheduled_slot,
        status="requested",
        estimated_cost=req.estimated_cost,
        payment_status="pay_after_service",
        otp_code=otp_code,
        notes=req.notes,
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)

    booking_data = {
        "id": booking.id,
        "booking_number": booking.booking_number,
        "service_title": booking.service_title,
        "category": booking.category,
        "provider_name": booking.provider_name,
        "provider_phone": booking.provider_phone,
        "customer_name": booking.customer_name,
        "customer_phone": booking.customer_phone,
        "service_address": booking.service_address,
        "scheduled_date": booking.scheduled_date,
        "scheduled_slot": booking.scheduled_slot,
        "status": booking.status,
        "estimated_cost": booking.estimated_cost,
        "otp_code": booking.otp_code,
        "created_at": booking.created_at.isoformat(),
    }

    try:
        provider_id = f"provider-{booking.service_id or 1}"
        await ws_manager.send_merchant_event(provider_id, "MERCHANT_BOOKING", booking_data)
        await ws_manager.broadcast_to_channel(f"booking:{booking.booking_number.lower()}", {
            "type": "BOOKING_STATUS_UPDATE",
            "booking_number": booking.booking_number,
            "status": booking.status,
            "updated_at": booking.created_at.isoformat(),
        })
    except Exception as e:
        logger.warning(f"[ws] Could not broadcast service booking over websockets: {e}")

    return {
        "status": "success",
        "message": "Service booked successfully!",
        "booking": booking_data,
    }


@router.get("/services/bookings")
def list_service_bookings(
    limit: int = Query(20, le=100),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """
    Retrieves service bookings strictly scoped to the authenticated caller.
    Unauthenticated callers receive an empty list to prevent user account enumeration
    and arbitrary phone data harvesting.
    """
    if not current_user:
        return {
            "status": "success",
            "count": 0,
            "bookings": [],
            "message": "Authentication required to access service bookings. Please sign in.",
        }

    query = db.query(ServiceBooking)
    if current_user.role == "admin":
        pass  # Platform administrator can inspect all bookings
    elif current_user.role in ("merchant", "provider"):
        query = query.filter(
            (ServiceBooking.user_id == current_user.id)
            | (current_user.phone and ServiceBooking.customer_phone == current_user.phone)
            | (current_user.phone and ServiceBooking.provider_phone == current_user.phone)
        )
    else:
        # Resident customer can only view their own bookings
        query = query.filter(
            (ServiceBooking.user_id == current_user.id)
            | (current_user.phone and ServiceBooking.customer_phone == current_user.phone)
        )

    bookings = query.order_by(desc(ServiceBooking.created_at)).limit(limit).all()

    return {
        "status": "success",
        "count": len(bookings),
        "bookings": [
            {
                "id": b.id,
                "booking_number": b.booking_number,
                "service_title": b.service_title,
                "category": b.category,
                "provider_name": b.provider_name,
                "provider_phone": b.provider_phone,
                "customer_name": b.customer_name,
                "customer_phone": b.customer_phone,
                "service_address": b.service_address,
                "scheduled_date": b.scheduled_date,
                "scheduled_slot": b.scheduled_slot,
                "status": b.status,
                "estimated_cost": b.estimated_cost,
                "otp_code": b.otp_code,
                "created_at": b.created_at.isoformat(),
            }
            for b in bookings
        ],
    }


@router.get("/services/bookings/{booking_identifier}")
def get_service_booking_details(
    booking_identifier: str,
    otp: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """
    Retrieves details for a specific service booking.
    Access is authorized only if:
      - Authenticated user is the customer, assigned provider, or an admin.
      - OR unauthenticated guest presents the secret booking verification OTP.
    """
    if booking_identifier.isdigit():
        booking = db.query(ServiceBooking).filter(ServiceBooking.id == int(booking_identifier)).first()
    else:
        booking = db.query(ServiceBooking).filter(ServiceBooking.booking_number == booking_identifier).first()

    if not booking:
        raise HTTPException(status_code=404, detail="Service booking not found")

    authorized = False
    if current_user:
        if current_user.role == "admin":
            authorized = True
        elif booking.user_id == current_user.id or (current_user.phone and booking.customer_phone == current_user.phone):
            authorized = True
        elif current_user.role in ("merchant", "provider") and (current_user.phone and booking.provider_phone == current_user.phone):
            authorized = True
    elif otp and booking.otp_code:
        if secrets.compare_digest(booking.otp_code.strip(), otp.strip()):
            authorized = True

    if not authorized:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Authentication or valid booking verification OTP required.",
        )

    return {
        "status": "success",
        "booking": {
            "id": booking.id,
            "booking_number": booking.booking_number,
            "service_title": booking.service_title,
            "category": booking.category,
            "provider_name": booking.provider_name,
            "provider_phone": booking.provider_phone,
            "customer_name": booking.customer_name,
            "customer_phone": booking.customer_phone,
            "service_address": booking.service_address,
            "scheduled_date": booking.scheduled_date,
            "scheduled_slot": booking.scheduled_slot,
            "status": booking.status,
            "estimated_cost": booking.estimated_cost,
            "payment_status": booking.payment_status,
            "otp_code": booking.otp_code,
            "notes": booking.notes,
            "created_at": booking.created_at.isoformat(),
            "updated_at": booking.updated_at.isoformat(),
        },
    }


@router.patch("/services/bookings/{booking_identifier}/status")
async def update_service_booking_status(
    booking_identifier: str,
    payload: ServiceBookingStatusUpdateRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required to modify service booking status.",
        )

    if booking_identifier.isdigit():
        booking = db.query(ServiceBooking).filter(ServiceBooking.id == int(booking_identifier)).first()
    else:
        booking = db.query(ServiceBooking).filter(ServiceBooking.booking_number == booking_identifier).first()

    if not booking:
        raise HTTPException(status_code=404, detail="Service booking not found")

    valid_statuses = ["requested", "confirmed", "in_progress", "completed", "cancelled"]
    if payload.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")

    # Determine caller permissions
    is_admin = current_user.role == "admin"
    is_customer = (
        booking.user_id == current_user.id
        or (current_user.phone and booking.customer_phone and current_user.phone.endswith(booking.customer_phone[-10:]))
    )
    is_provider = current_user.role in ("merchant", "provider")

    if not (is_admin or is_customer or is_provider):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You do not have permission to modify this booking.",
        )

    # Customer can only cancel
    if is_customer and not (is_admin or is_provider):
        if payload.status != "cancelled":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Customers can only cancel bookings.",
            )
        if booking.status not in ("requested",):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot cancel booking once confirmed or in progress.",
            )

    booking.status = payload.status
    if payload.notes:
        booking.notes = payload.notes

    booking.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(booking)

    try:
        booking_msg = {
            "type": "BOOKING_STATUS_UPDATE",
            "booking_number": booking.booking_number,
            "status": booking.status,
            "updated_at": booking.updated_at.isoformat(),
        }
        await ws_manager.broadcast_to_channel(f"booking:{booking.booking_number.lower()}", booking_msg)
        await ws_manager.broadcast_to_channel("broadcast", booking_msg)
    except Exception as e:
        logger.warning(f"[ws] Could not broadcast service booking update over websockets: {e}")

    return {
        "status": "success",
        "message": f"Booking status updated to '{booking.status}'",
        "booking_number": booking.booking_number,
        "new_status": booking.status,
    }
