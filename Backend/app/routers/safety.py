from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from typing import List
from datetime import datetime
from app.services.safety_monitoring_service import SafetyMonitoringService
from app.services.distance_tracking_service import DistanceTrackingService
from app.core.dependencies import get_current_driver
from app.schemas.sensor import SensorDataBatch, DistanceStats

router = APIRouter()

@router.post("/sensor-data")
def submit_sensor_data(
    sensor_batch: SensorDataBatch,
    current_driver = Depends(get_current_driver),
    db: Session = Depends(get_db)
):
    if sensor_batch.driver_id != current_driver.driver_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to submit data for this driver.")
    
    safety_service = SafetyMonitoringService(db)
    results = safety_service.process_sensor_data_batch(sensor_batch)

    distance_service = DistanceTrackingService(db)
    distance_service.record_gps_point(
        driver_id=sensor_batch.driver_id,
        session_id=sensor_batch.session_id,
        location_data=sensor_batch.location_data
    )

    return {
        "status": "processed",
        "record_id": results["record_id"],
        "fatigue_score": results["fatigue_analysis"].fatigue_score if results["fatigue_analysis"] else None,
        "movement_risk": results["movement_analysis"].risk_level if results["movement_analysis"] else None,
        "alerts_generated": len(results["alerts"]),
        "recommendation": results["fatigue_analysis"].recommendation if results["fatigue_analysis"] else "Keep driving safely."
    }

@router.get("/distance-stats/{session_id}", response_model=DistanceStats)
def get_distance_stats(
    session_id: str,
    current_driver = Depends(get_current_driver),
    db: Session = Depends(get_db)
):
    distance_service = DistanceTrackingService(db)
    stats = distance_service.compute_distance_stats(
        driver_id=current_driver.driver_id,
        session_id=session_id
    )
    if not stats:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No distance data found for this session.")
    return stats

@router.get("/distance/today")
def get_today_distance(
    current_driver = Depends(get_current_driver),
    db: Session = Depends(get_db)
):
    distance_service = DistanceTrackingService(db)
    total_distance = distance_service.get_today_distance(driver_id=current_driver.driver_id)
    return {"driver_id": current_driver.driver_id, "date": datetime.utcnow().date(), "total_distance_km": total_distance}