import datetime
import hashlib
import hmac
import os
import random
import string
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.app.api.deps import get_current_user_optional
from backend.app.core.config import settings
from backend.app.core.logging import logger
from backend.app.core.websocket_manager import ws_manager
from backend.app.database.models import Order, OrderItem, Product, ServiceBooking, User
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

        # Inventory stock decrement & status update
        if item.product_id:
            try:
                db_prod = db.query(Product).filter(Product.id == item.product_id).first()
                if db_prod and db_prod.stock_quantity is not None:
                    db_prod.stock_quantity = max(0, db_prod.stock_quantity - item.quantity)
                    if db_prod.stock_quantity == 0:
                        db_prod.availability_status = "out_of_stock"
                    elif db_prod.stock_quantity < 5:
                        db_prod.availability_status = "low_stock"
                    db_prod.updated_at = datetime.datetime.utcnow()
            except Exception as e:
                logger.warning(f"[inventory] Failed to decrement stock for product {item.product_id}: {e}")

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
    phone: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    limit: int = Query(20, le=100),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    query = db.query(Order)
    if current_user:
        query = query.filter((Order.user_id == current_user.id) | (Order.customer_phone == current_user.phone))
    elif phone:
        query = query.filter(Order.customer_phone == phone)

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
                "final_payable": o.final_payable,
                "payment_method": o.payment_method,
                "payment_status": o.payment_status,
                "customer_name": o.customer_name,
                "customer_phone": o.customer_phone,
                "delivery_address": o.delivery_address,
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
def get_order_details(order_identifier: str, db: Session = Depends(get_db)):
    if order_identifier.isdigit():
        order = db.query(Order).filter(Order.id == int(order_identifier)).first()
    else:
        order = db.query(Order).filter(Order.order_number == order_identifier).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

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
):
    if order_identifier.isdigit():
        order = db.query(Order).filter(Order.id == int(order_identifier)).first()
    else:
        order = db.query(Order).filter(Order.order_number == order_identifier).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    valid_statuses = ["placed", "confirmed", "out_for_delivery", "delivered", "cancelled"]
    if payload.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")

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
    if order_identifier.isdigit():
        order = db.query(Order).filter(Order.id == int(order_identifier)).first()
    else:
        order = db.query(Order).filter(Order.order_number == order_identifier).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Cryptographic HMAC-SHA256 signature verification for Razorpay
    if payload.payment_method == "razorpay" and payload.razorpay_signature:
        razorpay_secret = settings.RAZORPAY_KEY_SECRET or os.getenv("RAZORPAY_KEY_SECRET", "")
        if razorpay_secret:
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

    txn_id = payload.transaction_id or payload.upi_ref_id or payload.razorpay_payment_id or f"TXN_{int(datetime.datetime.utcnow().timestamp())}"
    order.payment_status = "paid"
    order.transaction_id = txn_id
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
            "transaction_id": txn_id,
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
        "transaction_id": txn_id,
        "order_number": order.order_number,
        "order_status": order.status,
    }


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
    phone: Optional[str] = Query(None),
    limit: int = Query(20, le=100),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    query = db.query(ServiceBooking)
    if current_user:
        query = query.filter((ServiceBooking.user_id == current_user.id) | (ServiceBooking.customer_phone == current_user.phone))
    elif phone:
        query = query.filter(ServiceBooking.customer_phone == phone)

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


@router.patch("/services/bookings/{booking_identifier}/status")
async def update_service_booking_status(
    booking_identifier: str,
    payload: ServiceBookingStatusUpdateRequest,
    db: Session = Depends(get_db),
):
    if booking_identifier.isdigit():
        booking = db.query(ServiceBooking).filter(ServiceBooking.id == int(booking_identifier)).first()
    else:
        booking = db.query(ServiceBooking).filter(ServiceBooking.booking_number == booking_identifier).first()

    if not booking:
        raise HTTPException(status_code=404, detail="Service booking not found")

    valid_statuses = ["requested", "confirmed", "in_progress", "completed", "cancelled"]
    if payload.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")

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
