from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.db.database import get_db
from app.core.dependencies import get_current_driver, get_current_admin, get_current_user
from app.models.user import User
from app.models.driver import Driver
from app.services.order_service import OrderService
from app.schemas.order import OrderAssign, OrderCreate, OrderDeliver, OrderPickup, OrderResponse, OrderUpdate, OrderStats, OrderStatus
from geoalchemy2.functions import ST_X, ST_Y

router = APIRouter()

@router.post("/", response_model=OrderResponse)
def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    order_service = OrderService(db)
    order = order_service.create_order(order_data)

    return order

@router.post("/webhook/new-order", response_model=OrderResponse)
def webhook_create_order(
    order_data: OrderCreate,
    auto_assign: bool = False,
    db: Session = Depends(get_db)
):
    """
    Order received notif as requested by Patrick
    Example Webhook JSON payload:
    {
        "pickup_address": "123 Main St",
        "pickup_latitude": 40.7128,
        "pickup_longitude": -74.0060,
        "dropoff_address": "456 Park Ave",
        "dropoff_latitude": 40.7589,
        "dropoff_longitude": -73.9851,
        "customer_name": "John Doe",
        "customer_contact": "+1234567890",
        "restaurant_name": "Pizza Palace",
        "restaurant_contact": "+0987654321",
        "price": 25.50
    }
    """
    order_service = OrderService(db)
    
    # Create the order
    order = order_service.create_order(order_data)
    
    if auto_assign:
        try:
            order = order_service.auto_assign_order(order.order_id)
        except HTTPException as e:
            pass
    
    # TODO: Implement real-time notification to drivers (Kafka)
    
    return order

@router.get("/", response_model=List[OrderResponse])
def get_all_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
    status: Optional[OrderStatus] = None,
    driver_id: Optional[str] = None,
    pickup_zone: Optional[str] = None,
):
    order_service = OrderService(db)
    orders = order_service.get_orders(status=status, driver_id=driver_id, pickup_zone=pickup_zone)
    return orders

@router.get("/pending")
def get_pending_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
    zone_id: Optional[str] = None
):
    order_service = OrderService(db)
    orders = order_service.get_pending_orders(zone_id=zone_id)
    
    return {
        "count": len(orders),
        "orders": [OrderResponse.model_validate(order) for order in orders]
    }

@router.get("/stats", response_model=OrderStats)
def get_order_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    order_service = OrderService(db)
    start_dt = datetime.fromisoformat(start_date) if start_date else None
    end_dt = datetime.fromisoformat(end_date) if end_date else None
    stats = order_service.get_order_stats(start_date=start_dt, end_date=end_dt)
    return stats

@router.get("/{order_id}", response_model=OrderResponse)
def get_order_by_id(
    order_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    order_service = OrderService(db)
    order = order_service.get_order(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.patch("/{order_id}", response_model=OrderResponse)
def update_order(
    order_id: str,
    order_data: OrderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    order_service = OrderService(db)
    return order_service.update_order(order_id, order_data)
    
@router.post("/{order_id}/assign", response_model=OrderResponse)
def assign_order(
    order_id: str,
    assign_data: OrderAssign,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    order_service = OrderService(db)
    return order_service.assign_order(order_id, assign_data)

@router.post("/{order_id}/auto-assign", response_model=OrderResponse)
def auto_assign_order(
    order_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    order_service = OrderService(db)
    return order_service.auto_assign_order(order_id)

@router.get("/driver/orders")
def get_driver_orders(
    db: Session = Depends(get_db),
    current_driver: Driver = Depends(get_current_driver),
):
    order_service = OrderService(db)
    orders = order_service.get_active_orders_for_driver(driver_id=current_driver.driver_id)
    return {
        "count": len(orders),
        "orders": [OrderResponse.model_validate(order) for order in orders]
    }

@router.post("/{order_id}/pickup", response_model=OrderResponse)
def pickup_order(
    order_id: str,
    pickup_data: OrderPickup,
    db: Session = Depends(get_db),
    current_driver: Driver = Depends(get_current_driver)
):
    order_service = OrderService(db)
    return order_service.picked_up(order_id, pickup_data)

@router.post("/{order_id}/deliver", response_model=OrderResponse)
def deliver_order(
    order_id: str,
    deliver_data: OrderDeliver,
    db: Session = Depends(get_db),
    current_driver: Driver = Depends(get_current_driver)
):
    order_service = OrderService(db)
    return order_service.delivered(order_id, deliver_data)
