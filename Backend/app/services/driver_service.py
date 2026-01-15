from fastapi import HTTPException, status, Depends
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
from geoalchemy2.functions import ST_Distance, ST_X, ST_Y
from geoalchemy2.elements import WKTElement
from datetime import datetime
from app.models.driver import Driver
from app.models.order import Order
from app.models.alert import Alert
from app.db.database import get_db
from app.schemas.driver import (
    DriverCreate, DriverUpdate, LocationSchema, StatusUpdate,
    DriverResponse, DriverPerformanceStats, NearbyDriverResponse,
    ShiftStart, ShiftEnd, ShiftSummary, BreakRequest, DriverStatus, DutyStatus
)


class DriverService:
    @staticmethod
    def create_driver(db: Session, driver_data: DriverCreate) -> Driver:
        driver = Driver(
            user_id=driver_data.user_id,
            name=driver_data.name,
            current_zone=driver_data.current_zone,
            vehicle_type=driver_data.vehicle_type,
            license_plate=driver_data.license_plate,
            status="offline",
            duty_status="off_duty"
        )
        db.add(driver)
        db.commit()
        db.refresh(driver)

        return driver
    
    @staticmethod
    def get_driver_by_id(db: Session, driver_id: str) -> Optional[Driver]:
        return db.query(Driver).filter(Driver.driver_id == driver_id).first()
    
    @staticmethod
    def get_driver_by_user_id(db: Session, user_id: str) -> Optional[Driver]:
        return db.query(Driver).filter(Driver.user_id == user_id).first()
    
    @staticmethod
    def update_driver(db: Session, driver: Driver, update_data: DriverUpdate) -> Driver:
        driver = DriverService.get_driver_by_id(db, driver.driver_id)

        if not driver:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Driver not found"
            )
        
        if update_data.name is not None:
            driver.name = update_data.name
        if update_data.current_zone is not None:
            driver.current_zone = update_data.current_zone
        if update_data.vehicle_type is not None:
            driver.vehicle_type = update_data.vehicle_type
        if update_data.license_plate is not None:
            driver.license_plate = update_data.license_plate
        
        db.commit()
        db.refresh(driver)

        return driver
    
    @staticmethod
    def delete_driver(db: Session, driver_id: str) -> None:
        driver = DriverService.get_driver_by_id(db, driver_id)
        if not driver:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Driver not found"
            )
        db.delete(driver)
        db.commit()
    
    @staticmethod
    def update_location(db: Session, driver_id: str, location_data: LocationSchema) -> Driver:
        driver = DriverService.get_driver_by_id(db, driver_id)

        if not driver:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Driver not found"
            )
        
        point_wkt = WKTElement(f'POINT({location_data.longitude} {location_data.latitude})', srid=4326)
        driver.location = point_wkt

        db.commit()
        # TODO : Implement kafka publishing for location updates

        return driver
    
    @staticmethod
    def get_location(db: Session, driver_id: str) -> Optional[LocationSchema]:
        driver = DriverService.get_driver_by_id(db, driver_id)

        if not driver or not driver.location:
            return None
        
        longitude = db.scalar(ST_X(driver.location))
        latitude = db.scalar(ST_Y(driver.location))

        return LocationSchema(latitude=latitude, longitude=longitude)
    
    @staticmethod
    def get_nearby_drivers(db: Session, latitude: float, longitude: float, radius_km: float, status: Optional[DriverStatus] = DriverStatus.AVAILABLE, limit: int = 10):
        point_wkt = WKTElement(f'POINT({longitude} {latitude})', srid=4326)
        radius_meters = radius_km * 1000  

        query = db.query(
            Driver,
            ST_Distance(Driver.location, point_wkt).label('distance')
        ).filter(
            ST_Distance(Driver.location, point_wkt) <= radius_meters
        )

        if status:
            query = query.filter(Driver.status == status.value)

        query = query.order_by('distance').limit(limit)

        results = query.all()

        nearby_drivers = []
        for driver, distance in results:
            driver_location = db.scalar(ST_Y(driver.location)), db.scalar(ST_X(driver.location))
            nearby_drivers.append(
                NearbyDriverResponse(
                    driver_id=driver.driver_id,
                    name=driver.name,
                    status=DriverStatus(driver.status),
                    rating=driver.rating,
                    latitude=driver_location[0],
                    longitude=driver_location[1],
                    distance_meters=float(distance),
                    current_zone=driver.current_zone
                )
            )

        return nearby_drivers
    
    @staticmethod
    def update_status(db: Session, driver_id: str, new_status: DriverStatus) -> Driver:
        driver = DriverService.get_driver_by_id(db, driver_id)

        if not driver:
            raise HTTPException(
                status_code=404,
                detail="Driver not found"
            )
        driver.status = new_status.value
        db.commit()
        db.refresh(driver)
        return driver
    
    @staticmethod
    def update_duty_status(db: Session, driver_id: str, duty_status: DutyStatus) -> Driver:
        driver = DriverService.get_driver_by_id(db, driver_id)

        if not driver:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Driver not found"
            )
        driver.duty_status = duty_status.value
        db.commit()
        db.refresh(driver)
        return driver
    
    @staticmethod
    def start_shift(db: Session, driver_id: str, shift_start: ShiftStart) -> Driver:
        driver = DriverService.get_driver_by_id(db, driver_id)
        if not driver:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Driver not found"
            )
        
        if driver.duty_status == DutyStatus.ON_DUTY.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Driver is already on duty"
            )
        
        driver.duty_status = DutyStatus.ON_DUTY.value
        driver.status = DriverStatus.AVAILABLE.value
        driver.report_time = shift_start.start_time

        driver.location = WKTElement(f'POINT({shift_start.start_longitude} {shift_start.start_latitude})', srid=4326)

        driver.orders_received = 0
        driver.breaks = 0
        driver.safety_alerts = 0
        driver.fatigue_score = 0.0

        db.commit()
        db.refresh(driver)
        return driver
    
    @staticmethod
    def end_shift(db: Session, driver_id: str, shift_end: ShiftEnd) -> ShiftSummary:
        driver = DriverService.get_driver_by_id(db, driver_id)
        if not driver:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Driver not found"
            )
        
        if driver.duty_status == DutyStatus.OFF_DUTY.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Driver is already off duty"
            )
        
        driver.duty_status = DutyStatus.OFF_DUTY.value
        driver.status = DriverStatus.OFFLINE.value
        driver.exit_time = shift_end.end_time

        driver.location = WKTElement(f'POINT({shift_end.end_longitude} {shift_end.end_latitude})', srid=4326)
        shift_duration = (driver.exit_time - driver.report_time).total_seconds() / 3600.0

        orders_completed = db.query(Order).filter(
            Order.driver_id == driver.driver_id,
            Order.status == 'delivered',
            Order.delivered_at >= driver.report_time,
            Order.delivered_at <= driver.exit_time
        ).count()

        safety_alerts = db.query(Alert).filter(
            Alert.driver_id == driver.driver_id,
            Alert.timestamp >= driver.report_time,
            Alert.timestamp <= driver.exit_time
        ).count()

        summary = ShiftSummary(
            driver_id=driver.driver_id,
            name=driver.name,
            start_time=driver.report_time,
            end_time=driver.exit_time,
            total_hours=round(shift_duration, 2),
            total_orders=orders_completed,
            total_distance=0.0, # Placeholder for distance calculation 
            breaks_taken=driver.breaks,
            safety_alerts=safety_alerts,
            average_rating=driver.rating
        )
        db.commit()
        return summary
    
    @staticmethod
    def request_break(db: Session, driver_id: str, break_request: BreakRequest) -> Driver:
        driver = DriverService.get_driver_by_id(db, driver_id)
        if not driver:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Driver not found"
            )
        
        if driver.duty_status != DutyStatus.ON_DUTY.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Driver must be on duty to request a break"
            )
        
        if driver.status == DriverStatus.BUSY.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Driver is currently delivering and cannot take a break"
            )
        
        if driver.status == DriverStatus.ON_BREAK.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Driver is already on a break"
            )
        
        driver.status = DriverStatus.ON_BREAK.value
        driver.breaks += 1
        if break_request.latitude is not None and break_request.longitude is not None:
            driver.location = WKTElement(f'POINT({break_request.longitude} {break_request.latitude})', srid=4326)

        db.commit()
        db.refresh(driver)
        return driver
    
    @staticmethod
    def end_break(db: Session, driver_id: str) -> Driver:
        driver = DriverService.get_driver_by_id(db, driver_id)
        if not driver:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Driver not found"
            )
        
        if driver.status != DriverStatus.ON_BREAK.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Driver is not currently on a break"
            )
        
        driver.status = DriverStatus.AVAILABLE.value
        db.commit()
        db.refresh(driver)
        return driver
    
    @staticmethod
    def get_performance_stats(db: Session, driver_id: str) -> DriverPerformanceStats:
        driver = DriverService.get_driver_by_id(db, driver_id)
        if not driver:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Driver not found"
            )
        
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

        today_orders = db.query(Order).filter(
            Order.driver_id == driver.driver_id,
            Order.status == 'delivered',
            Order.delivered_at >= today_start
        ).count()

        total_orders = db.query(Order).filter(
            Order.driver_id == driver.driver_id,
            Order.status == 'delivered'
        ).count()

        total_assigned = db.query(Order).filter(
            Order.driver_id == driver.driver_id,
        ).count()

        completion_rate = (total_orders / total_assigned * 100) if total_assigned > 0 else 0.0

        today_safety_alerts = db.query(Alert).filter(
            Alert.driver_id == driver.driver_id,
            Alert.timestamp >= today_start
        ).count()

        return DriverPerformanceStats(
            driver_id=driver.driver_id,
            name=driver.name,
            today_orders=today_orders,
            today_breaks=driver.breaks,
            today_distance=0.0,  # Placeholder for distance calculation
            today_safety_alerts=today_safety_alerts,
            average_fatigue_score=driver.fatigue_score, # Calculate average fatigue score
            total_orders=total_orders,
            average_rating=driver.rating, # Calculate average rating
            completion_rate=round(completion_rate, 2)
        )
    
    @staticmethod
    def update_zone(db: Session, driver_id: str, new_zone: str) -> Driver:
        driver = DriverService.get_driver_by_id(db, driver_id)

        if not driver:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Driver not found"
            )
        
        driver.current_zone = new_zone
        db.commit()
        # TODO : Implement kafka publishing for zone updates
        return driver
        
    @staticmethod
    def get_drivers_by_zone(db: Session, zone: str) -> List[Driver]:
        drivers = db.query(Driver).filter(
            Driver.current_zone == zone,
            Driver.duty_status == DutyStatus.ON_DUTY.value).all()
        return drivers
    
    @staticmethod
    def list_drivers(db: Session, skip: int = 0, limit: int = 100) -> List[Driver]:
        return db.query(Driver).offset(skip).limit(limit).all()
    
    @staticmethod
    def count_total_drivers(db: Session) -> int:
        return db.query(Driver).count()
    
    @staticmethod
    def count_drivers_by_status(db: Session, status: DriverStatus) -> int:
        return db.query(Driver).filter(
            Driver.status == status.value,
            Driver.duty_status == DutyStatus.ON_DUTY.value).count()
    
    @staticmethod
    def count_drivers_by_duty_status(db: Session, duty_status: DutyStatus) -> int:
        return db.query(Driver).filter(
            Driver.duty_status == duty_status.value).count()
    
    @staticmethod
    def get_all_active_drivers_locations(db: Session) -> List[Dict[str, Any]]:
        drivers = db.query(Driver).filter(
            Driver.duty_status == DutyStatus.ON_DUTY.value,
            Driver.location.isnot(None)
        ).all()

        return [
            {
                "driver_id": driver.driver_id,
                "name": driver.name,
                "current_zone": driver.current_zone,
                "latitude": db.scalar(ST_Y(driver.location)),
                "longitude": db.scalar(ST_X(driver.location))
            }
            for driver in drivers
        ]