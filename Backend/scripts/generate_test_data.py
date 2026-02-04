"""
Test Data Generation Script for OptiRide Database
Generates realistic test data for all tables with PostGIS geometry support (WKT format).
Run from Backend directory: python scripts/generate_test_data.py
"""

import uuid
import random
from datetime import datetime, timedelta, date
from faker import Faker
import json

fake = Faker()

# Dubai area coordinates (covering major delivery zones)
DUBAI_CENTER = (25.2048, 55.2708)
DUBAI_ZONES = [
    {"zone_id": "zone_dubai_marina", "name": "Dubai Marina", "lat": 25.0805, "lon": 55.1403},
    {"zone_id": "zone_downtown_dubai", "name": "Downtown Dubai", "lat": 25.1972, "lon": 55.2744},
    {"zone_id": "zone_jumeirah", "name": "Jumeirah", "lat": 25.2048, "lon": 55.2350},
    {"zone_id": "zone_deira", "name": "Deira", "lat": 25.2697, "lon": 55.3095},
    {"zone_id": "zone_bur_dubai", "name": "Bur Dubai", "lat": 25.2532, "lon": 55.2920},
    {"zone_id": "zone_al_barsha", "name": "Al Barsha", "lat": 25.1123, "lon": 55.1943},
    {"zone_id": "zone_business_bay", "name": "Business Bay", "lat": 25.1850, "lon": 55.2620},
    {"zone_id": "zone_jlt", "name": "Jumeirah Lake Towers", "lat": 25.0712, "lon": 55.1450},
    {"zone_id": "zone_al_quoz", "name": "Al Quoz", "lat": 25.1380, "lon": 55.2280},
    {"zone_id": "zone_palm_jumeirah", "name": "Palm Jumeirah", "lat": 25.1124, "lon": 55.1390},
]

# Constants for realistic data
VEHICLE_TYPES = ["motorcycle", "scooter", "bicycle", "car"]
DRIVER_STATUSES = ["available", "offline", "busy", "on_break"]
DUTY_STATUSES = ["on_duty", "off_duty", "break"]
SHIFT_TYPES = ["Morning", "Evening", "Night"]
NETWORK_STRENGTHS = ["strong", "moderate", "weak"]
ORDER_STATUSES = ["pending", "assigned", "picked_up", "delivered", "cancelled"]
ASSIGNMENT_STATUSES = ["assigned", "in_progress", "completed", "cancelled"]
ALERT_TYPES = ["fatigue_warning", "speed_violation", "harsh_braking", "fall_detected", "accident", "zone_deviation", "battery_low"]
EVENT_TYPES = ["zone_enter", "zone_exit", "order_accepted", "order_picked", "order_delivered", "break_start", "break_end", "shift_start", "shift_end"]
BREAK_TYPES = ["rest", "meal", "emergency", "personal"]
WEATHER_CONDITIONS = ["sunny", "cloudy", "rainy", "windy", "stormy", "partly_cloudy"]
INSIGHT_TOPICS = ["Safety", "Efficiency", "Performance", "Delivery", "Navigation", "Demand"]
PATTERN_TYPES = ["hourly", "daily", "weekly", "monthly", "seasonal", "event"]
RESTAURANTS = [
    "Al Machboos House", "Ravi Restaurant", "Bu Qtair", "Al Mallah", "Zahr El Laymoun",
    "Operation Falafel", "Zaroob", "Arabian Tea House", "Al Safadi", "Tresind Studio",
    "Pierchic", "Nusr-Et Steakhouse", "La Petite Maison", "Zuma Dubai", "Nobu Dubai",
    "Tashas JBR", "The Cheesecake Factory", "PF Chang's", "Texas Roadhouse Dubai",
    "Salt Burger", "Shake Shack Dubai", "Five Guys Marina", "McDonald's Downtown",
    "KFC Deira", "Subway Business Bay", "Tim Hortons JLT", "Starbucks Marina Walk"
]


def random_point_near(center_lat, center_lon, radius_km=2.0):
    """Generate a random point within radius_km of center."""
    lat_offset = random.uniform(-radius_km / 111, radius_km / 111)
    lon_offset = random.uniform(-radius_km / (111 * abs(cos_deg(center_lat))), radius_km / (111 * abs(cos_deg(center_lat))))
    return (center_lat + lat_offset, center_lon + lon_offset)


def cos_deg(degrees):
    import math
    return math.cos(math.radians(degrees))


def point_wkt(lat, lon):
    """Return WKT POINT for PostGIS (note: PostGIS uses lon, lat order)."""
    return f"SRID=4326;POINT({lon} {lat})"


def polygon_wkt_from_center(lat, lon, size_km=0.5):
    """Create a simple square polygon around a center point."""
    offset = size_km / 111  # Approximate degree offset
    coords = [
        (lon - offset, lat - offset),
        (lon + offset, lat - offset),
        (lon + offset, lat + offset),
        (lon - offset, lat + offset),
        (lon - offset, lat - offset),  # Close the polygon
    ]
    coord_str = ", ".join([f"{c[0]} {c[1]}" for c in coords])
    return f"SRID=4326;POLYGON(({coord_str}))"


def linestring_wkt(points):
    """Create a LINESTRING from list of (lat, lon) tuples."""
    coord_str = ", ".join([f"{lon} {lat}" for lat, lon in points])
    return f"SRID=4326;LINESTRING({coord_str})"


def random_datetime(start_days_ago=30, end_days_ago=0):
    """Generate random datetime within range."""
    start = datetime.utcnow() - timedelta(days=start_days_ago)
    end = datetime.utcnow() - timedelta(days=end_days_ago)
    delta = end - start
    random_seconds = random.randint(0, int(delta.total_seconds()))
    return start + timedelta(seconds=random_seconds)


def random_date(start_days_ago=30, end_days_ago=0):
    """Generate random date within range."""
    return random_datetime(start_days_ago, end_days_ago).date()


def generate_uuid():
    return str(uuid.uuid4())


# ============== DATA GENERATORS ==============

def generate_zones():
    """Generate zone data."""
    zones = []
    for z in DUBAI_ZONES:
        zones.append({
            "zone_id": z["zone_id"],
            "name": z["name"],
            "centroid": point_wkt(z["lat"], z["lon"]),
            "boundary": polygon_wkt_from_center(z["lat"], z["lon"], 0.8),
            "demand_score": round(random.uniform(0.1, 1.0), 2),
            "active_drivers": random.randint(0, 15),
            "available_drivers": random.randint(0, 10),
            "pending_orders": random.randint(0, 20),
            "avg_daily_orders": round(random.uniform(30, 150), 1),
            "avg_peak_demand": round(random.uniform(0.5, 1.0), 2),
            "area_km2": round(random.uniform(1.5, 5.0), 2),
            "population_density": round(random.uniform(1500, 5000), 0),
            "restaurant_count": random.randint(5, 30),
        })
    return zones


def generate_users(count=50):
    """Generate user data."""
    users = []
    for i in range(count):
        user_id = generate_uuid()
        user_type = "driver" if i < 40 else "administrator"
        users.append({
            "user_id": user_id,
            "email": fake.unique.email(),
            "phone_number": fake.unique.phone_number()[:15],
            "name": fake.name(),
            "user_type": user_type,
            "last_login": random_datetime(7, 0).isoformat(),
            "created_by": "system" if user_type == "driver" else "admin",
        })
    return users


def generate_administrators(users):
    """Generate administrator data from admin users."""
    admins = []
    admin_users = [u for u in users if u["user_type"] == "administrator"]
    roles = ["fleet_manager", "safety_officer", "operations_lead", "analyst", "supervisor"]
    departments = ["Operations", "Safety", "Analytics", "Customer Support", "Fleet Management"]
    
    for user in admin_users:
        admins.append({
            "user_id": user["user_id"],
            "admin_id": f"ADM-{generate_uuid()[:8].upper()}",
            "role": random.choice(roles),
            "department": random.choice(departments),
            "access_level": random.randint(1, 5),
        })
    return admins


def generate_drivers(users, zones):
    """Generate driver data."""
    drivers = []
    driver_users = [u for u in users if u["user_type"] == "driver"]
    zone_ids = [z["zone_id"] for z in zones]
    
    for user in driver_users:
        zone_ref = random.choice(DUBAI_ZONES)
        lat, lon = random_point_near(zone_ref["lat"], zone_ref["lon"], 1.0)
        
        shift_type = random.choice(SHIFT_TYPES)
        if shift_type == "Morning":
            shift_start, shift_end = "06:00", "14:00"
        elif shift_type == "Evening":
            shift_start, shift_end = "14:00", "22:00"
        else:
            shift_start, shift_end = "22:00", "06:00"
        
        drivers.append({
            "driver_id": generate_uuid(),
            "user_id": user["user_id"],
            "name": user["name"],
            "vehicle_type": random.choice(VEHICLE_TYPES),
            "license_plate": f"{random.choice(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'])}{random.randint(10000, 99999)}",
            "current_zone": zone_ref["zone_id"],
            "status": random.choice(DRIVER_STATUSES),
            "location": point_wkt(lat, lon),
            "current_speed": round(random.uniform(0, 80), 1),
            "heading": round(random.uniform(0, 360), 1),
            "battery_level": random.randint(20, 100),
            "network_strength": random.choice(NETWORK_STRENGTHS),
            "camera_active": random.choice([True, True, True, False]),
            "report_time": random_datetime(0, 0).isoformat() if random.random() > 0.3 else None,
            "exit_time": None,
            "duty_status": random.choice(DUTY_STATUSES),
            "orders_received": random.randint(0, 500),
            "rating": round(random.uniform(3.5, 5.0), 2),
            "breaks": random.randint(0, 50),
            "safety_alerts": random.randint(0, 20),
            "fatigue_score": round(random.choices([random.uniform(0, 3), random.uniform(3, 6), random.uniform(6, 10)], weights=[0.6, 0.3, 0.1])[0], 2),  # 60% normal, 30% warning, 10% severe
            "shift_type": shift_type,
            "shift_start_time": shift_start,
            "shift_end_time": shift_end,
            "created_at": random_datetime(180, 30).isoformat(),
            "updated_at": random_datetime(7, 0).isoformat(),
        })
    return drivers


def generate_assignments(drivers, count=100):
    """Generate assignment data."""
    assignments = []
    for _ in range(count):
        driver = random.choice(drivers)
        zone = next((z for z in DUBAI_ZONES if z["zone_id"] == driver["current_zone"]), random.choice(DUBAI_ZONES))
        
        # Generate route as linestring
        route_points = []
        start_lat, start_lon = random_point_near(zone["lat"], zone["lon"], 1.0)
        route_points.append((start_lat, start_lon))
        for _ in range(random.randint(2, 5)):
            next_point = random_point_near(route_points[-1][0], route_points[-1][1], 0.5)
            route_points.append(next_point)
        
        assigned_at = random_datetime(14, 0)
        status = random.choice(ASSIGNMENT_STATUSES)
        completed_at = (assigned_at + timedelta(minutes=random.randint(15, 90))).isoformat() if status == "completed" else None
        
        assignments.append({
            "assignment_id": generate_uuid(),
            "driver_id": driver["driver_id"],
            "route": linestring_wkt(route_points),
            "eta": (assigned_at + timedelta(minutes=random.randint(10, 45))).isoformat(),
            "status": status,
            "assigned_at": assigned_at.isoformat(),
            "completed_at": completed_at,
        })
    return assignments


def generate_orders(drivers, assignments, zones, count=300):
    """Generate order data with today, yesterday, and historical data for proper comparisons."""
    orders = []
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    yesterday_start = today_start - timedelta(days=1)
    
    # ========== TODAY'S ORDERS (20% of orders) ==========
    today_count = int(count * 0.2)
    
    for i in range(today_count):
        pickup_zone = random.choice(DUBAI_ZONES)
        dropoff_zone = random.choice(DUBAI_ZONES)
        
        pickup_lat, pickup_lon = random_point_near(pickup_zone["lat"], pickup_zone["lon"], 0.8)
        dropoff_lat, dropoff_lon = random_point_near(dropoff_zone["lat"], dropoff_zone["lon"], 0.8)
        
        # Realistic status distribution for today
        status_weights = ["pending"] * 15 + ["assigned"] * 20 + ["picked_up"] * 25 + ["delivered"] * 35 + ["cancelled"] * 5
        status = random.choice(status_weights)
        
        driver = random.choice(drivers) if status != "pending" else None
        assignment = random.choice(assignments) if status in ["assigned", "picked_up", "delivered"] and random.random() > 0.3 else None
        
        # Create order at random time today (earlier in the day)
        hours_ago = random.uniform(0.1, min((now - today_start).total_seconds() / 3600, 12))
        created_at = now - timedelta(hours=hours_ago)
        
        # Realistic timing based on status
        if status == "pending":
            # Pending orders should be recent (within last 5-30 minutes for realistic wait time)
            created_at = now - timedelta(minutes=random.randint(5, 30))
            assigned_at = None
            picked_up_at = None
            delivered_at = None
        elif status == "assigned":
            assigned_at = (created_at + timedelta(minutes=random.randint(1, 5))).isoformat()
            picked_up_at = None
            delivered_at = None
        elif status == "picked_up":
            assigned_at = (created_at + timedelta(minutes=random.randint(1, 5))).isoformat()
            picked_up_at = (created_at + timedelta(minutes=random.randint(8, 15))).isoformat()
            delivered_at = None
        elif status == "delivered":
            pickup_offset = random.randint(8, 12)
            delivery_offset = pickup_offset + random.randint(15, 25)  # 15-25 min from pickup to delivery (today = fast)
            assigned_at = (created_at + timedelta(minutes=random.randint(1, 5))).isoformat()
            picked_up_at = (created_at + timedelta(minutes=pickup_offset)).isoformat()
            delivered_at = (created_at + timedelta(minutes=delivery_offset)).isoformat()
        else:  # cancelled
            assigned_at = (created_at + timedelta(minutes=random.randint(1, 5))).isoformat() if random.random() > 0.5 else None
            picked_up_at = None
            delivered_at = None
        
        distance_km = round(random.uniform(1.0, 12.0), 2)
        
        orders.append({
            "order_id": generate_uuid(),
            "pickup": point_wkt(pickup_lat, pickup_lon),
            "dropoff": point_wkt(dropoff_lat, dropoff_lon),
            "pickup_address": fake.street_address() + ", Dubai, UAE",
            "dropoff_address": fake.street_address() + ", Dubai, UAE",
            "pickup_latitude": round(pickup_lat, 6),
            "pickup_longitude": round(pickup_lon, 6),
            "dropoff_latitude": round(dropoff_lat, 6),
            "dropoff_longitude": round(dropoff_lon, 6),
            "status": status,
            "driver_id": driver["driver_id"] if driver else None,
            "customer_name": fake.name(),
            "customer_contact": fake.phone_number()[:15],
            "restaurant_name": random.choice(RESTAURANTS),
            "restaurant_contact": fake.phone_number()[:15],
            "price": round(random.uniform(12.0, 65.0), 2),
            "distance_km": distance_km,
            "duration_min": round(distance_km * random.uniform(3, 6), 1),
            "pickup_time": picked_up_at,
            "dropoff_time": delivered_at,
            "pickup_zone": pickup_zone["zone_id"],
            "dropoff_zone": dropoff_zone["zone_id"],
            "route_polyline": None,
            "assignment_id": assignment["assignment_id"] if assignment else None,
            "created_at": created_at.isoformat(),
            "assigned_at": assigned_at,
            "picked_up_at": picked_up_at,
            "delivered_at": delivered_at,
            "customer_rating": random.randint(3, 5) if status == "delivered" and random.random() > 0.3 else None,
        })
    
    # ========== YESTERDAY'S ORDERS (10% - for today vs yesterday comparison) ==========
    yesterday_count = int(count * 0.1)
    
    for _ in range(yesterday_count):
        pickup_zone = random.choice(DUBAI_ZONES)
        dropoff_zone = random.choice(DUBAI_ZONES)
        
        pickup_lat, pickup_lon = random_point_near(pickup_zone["lat"], pickup_zone["lon"], 0.8)
        dropoff_lat, dropoff_lon = random_point_near(dropoff_zone["lat"], dropoff_zone["lon"], 0.8)
        
        # Yesterday orders - slightly lower performance to show improvement
        status = random.choice(["delivered"] * 70 + ["cancelled"] * 30)
        driver = random.choice(drivers)
        assignment = random.choice(assignments) if random.random() > 0.3 else None
        
        # Random time yesterday
        hours_into_yesterday = random.uniform(0, 24)
        created_at = yesterday_start + timedelta(hours=hours_into_yesterday)
        pickup_offset = random.randint(10, 20)
        delivery_offset = pickup_offset + random.randint(25, 45)  # Yesterday was slightly slower
        assigned_at = (created_at + timedelta(minutes=random.randint(2, 8))).isoformat()
        picked_up_at = (created_at + timedelta(minutes=pickup_offset)).isoformat()
        delivered_at = (created_at + timedelta(minutes=delivery_offset)).isoformat() if status == "delivered" else None
        
        distance_km = round(random.uniform(1.0, 12.0), 2)
        
        orders.append({
            "order_id": generate_uuid(),
            "pickup": point_wkt(pickup_lat, pickup_lon),
            "dropoff": point_wkt(dropoff_lat, dropoff_lon),
            "pickup_address": fake.street_address() + ", Dubai, UAE",
            "dropoff_address": fake.street_address() + ", Dubai, UAE",
            "pickup_latitude": round(pickup_lat, 6),
            "pickup_longitude": round(pickup_lon, 6),
            "dropoff_latitude": round(dropoff_lat, 6),
            "dropoff_longitude": round(dropoff_lon, 6),
            "status": status,
            "driver_id": driver["driver_id"],
            "customer_name": fake.name(),
            "customer_contact": fake.phone_number()[:15],
            "restaurant_name": random.choice(RESTAURANTS),
            "restaurant_contact": fake.phone_number()[:15],
            "price": round(random.uniform(10.0, 55.0), 2),  # Slightly lower revenue yesterday
            "distance_km": distance_km,
            "duration_min": round(distance_km * random.uniform(3, 6), 1),
            "pickup_time": picked_up_at,
            "dropoff_time": delivered_at,
            "pickup_zone": pickup_zone["zone_id"],
            "dropoff_zone": dropoff_zone["zone_id"],
            "route_polyline": None,
            "assignment_id": assignment["assignment_id"] if assignment else None,
            "created_at": created_at.isoformat(),
            "assigned_at": assigned_at,
            "picked_up_at": picked_up_at,
            "delivered_at": delivered_at,
            "customer_rating": random.randint(1, 5) if status == "delivered" and random.random() > 0.3 else None,
        })
    
    # ========== HISTORICAL ORDERS (70% - for 30-day and 60-day analytics) ==========
    # 35% for current 30d period, 35% for prior 30d period
    historical_count = count - today_count - yesterday_count
    
    # Split evenly: 50% recent (2-30 days), 50% older (31-60 days) for balanced comparison
    recent_count = historical_count // 2
    older_count = historical_count - recent_count
    
    # Recent historical orders (2-30 days ago)
    for _ in range(recent_count):
        pickup_zone = random.choice(DUBAI_ZONES)
        dropoff_zone = random.choice(DUBAI_ZONES)
        
        pickup_lat, pickup_lon = random_point_near(pickup_zone["lat"], pickup_zone["lon"], 0.8)
        dropoff_lat, dropoff_lon = random_point_near(dropoff_zone["lat"], dropoff_zone["lon"], 0.8)
        
        # Historical orders are mostly completed
        status = random.choice(["delivered"] * 80 + ["cancelled"] * 20)
        driver = random.choice(drivers)
        assignment = random.choice(assignments) if random.random() > 0.3 else None
        
        # Created 2-30 days ago (skip today and yesterday)
        created_at = random_datetime(30, 2)
        pickup_offset = random.randint(10, 20)
        delivery_offset = pickup_offset + random.randint(30, 50)  # 30-50 min from pickup to delivery (historical = slower)
        assigned_at = (created_at + timedelta(minutes=random.randint(1, 10))).isoformat()
        picked_up_at = (created_at + timedelta(minutes=pickup_offset)).isoformat()
        delivered_at = (created_at + timedelta(minutes=delivery_offset)).isoformat() if status == "delivered" else None
        
        distance_km = round(random.uniform(1.0, 12.0), 2)
        
        orders.append({
            "order_id": generate_uuid(),
            "pickup": point_wkt(pickup_lat, pickup_lon),
            "dropoff": point_wkt(dropoff_lat, dropoff_lon),
            "pickup_address": fake.street_address() + ", Dubai, UAE",
            "dropoff_address": fake.street_address() + ", Dubai, UAE",
            "pickup_latitude": round(pickup_lat, 6),
            "pickup_longitude": round(pickup_lon, 6),
            "dropoff_latitude": round(dropoff_lat, 6),
            "dropoff_longitude": round(dropoff_lon, 6),
            "status": status,
            "driver_id": driver["driver_id"],
            "customer_name": fake.name(),
            "customer_contact": fake.phone_number()[:15],
            "restaurant_name": random.choice(RESTAURANTS),
            "restaurant_contact": fake.phone_number()[:15],
            "price": round(random.uniform(12.0, 65.0), 2),
            "distance_km": distance_km,
            "duration_min": round(distance_km * random.uniform(3, 6), 1),
            "pickup_time": picked_up_at,
            "dropoff_time": delivered_at,
            "pickup_zone": pickup_zone["zone_id"],
            "dropoff_zone": dropoff_zone["zone_id"],
            "route_polyline": None,
            "assignment_id": assignment["assignment_id"] if assignment else None,
            "created_at": created_at.isoformat(),
            "assigned_at": assigned_at,
            "picked_up_at": picked_up_at,
            "delivered_at": delivered_at,
            "customer_rating": random.randint(1, 5) if status == "delivered" and random.random() > 0.3 else None,
        })
    
    # Older historical orders (31-60 days ago) - for comparison data
    for _ in range(older_count):
        pickup_zone = random.choice(DUBAI_ZONES)
        dropoff_zone = random.choice(DUBAI_ZONES)
        
        pickup_lat, pickup_lon = random_point_near(pickup_zone["lat"], pickup_zone["lon"], 0.8)
        dropoff_lat, dropoff_lon = random_point_near(dropoff_zone["lat"], dropoff_zone["lon"], 0.8)
        
        # Older orders - slightly fewer completions to show improvement trend
        status = random.choice(["delivered"] * 70 + ["cancelled"] * 30)
        driver = random.choice(drivers)
        assignment = random.choice(assignments) if random.random() > 0.3 else None
        
        # Created 31-60 days ago
        created_at = random_datetime(60, 31)
        pickup_offset = random.randint(12, 25)
        delivery_offset = pickup_offset + random.randint(35, 55)  # Slightly slower (older period)
        assigned_at = (created_at + timedelta(minutes=random.randint(2, 12))).isoformat()
        picked_up_at = (created_at + timedelta(minutes=pickup_offset)).isoformat()
        delivered_at = (created_at + timedelta(minutes=delivery_offset)).isoformat() if status == "delivered" else None
        
        distance_km = round(random.uniform(1.0, 12.0), 2)
        
        orders.append({
            "order_id": generate_uuid(),
            "pickup": point_wkt(pickup_lat, pickup_lon),
            "dropoff": point_wkt(dropoff_lat, dropoff_lon),
            "pickup_address": fake.street_address() + ", Dubai, UAE",
            "dropoff_address": fake.street_address() + ", Dubai, UAE",
            "pickup_latitude": round(pickup_lat, 6),
            "pickup_longitude": round(pickup_lon, 6),
            "dropoff_latitude": round(dropoff_lat, 6),
            "dropoff_longitude": round(dropoff_lon, 6),
            "status": status,
            "driver_id": driver["driver_id"],
            "customer_name": fake.name(),
            "customer_contact": fake.phone_number()[:15],
            "restaurant_name": random.choice(RESTAURANTS),
            "restaurant_contact": fake.phone_number()[:15],
            "price": round(random.uniform(10.0, 55.0), 2),  # Slightly lower prices in older period
            "distance_km": distance_km,
            "duration_min": round(distance_km * random.uniform(3, 6), 1),
            "pickup_time": picked_up_at,
            "dropoff_time": delivered_at,
            "pickup_zone": pickup_zone["zone_id"],
            "dropoff_zone": dropoff_zone["zone_id"],
            "route_polyline": None,
            "assignment_id": assignment["assignment_id"] if assignment else None,
            "created_at": created_at.isoformat(),
            "assigned_at": assigned_at,
            "picked_up_at": picked_up_at,
            "delivered_at": delivered_at,
            "customer_rating": random.randint(1, 5) if status == "delivered" and random.random() > 0.3 else None,
        })
    
    return orders


def generate_alerts(drivers, count=80):
    """Generate alert data spanning 60 days for comparison analytics."""
    alerts = []
    
    # Alerts from past 30 days (current period)
    for _ in range(count // 2):
        driver = random.choice(drivers)
        zone = next((z for z in DUBAI_ZONES if z["zone_id"] == driver["current_zone"]), random.choice(DUBAI_ZONES))
        lat, lon = random_point_near(zone["lat"], zone["lon"], 0.5)
        
        alerts.append({
            "alert_id": generate_uuid(),
            "driver_id": driver["driver_id"],
            "alert_type": random.choice(ALERT_TYPES),
            "severity": random.randint(1, 4),
            "location": point_wkt(lat, lon),
            "timestamp": random_datetime(30, 1).isoformat(),
            "acknowledged": random.choice([True, False]),
        })
    
    # Alerts from 31-60 days ago (prior period for comparison)
    for _ in range(count // 4):
        driver = random.choice(drivers)
        zone = next((z for z in DUBAI_ZONES if z["zone_id"] == driver["current_zone"]), random.choice(DUBAI_ZONES))
        lat, lon = random_point_near(zone["lat"], zone["lon"], 0.5)
        
        alerts.append({
            "alert_id": generate_uuid(),
            "driver_id": driver["driver_id"],
            "alert_type": random.choice(ALERT_TYPES),
            "severity": random.randint(1, 4),
            "location": point_wkt(lat, lon),
            "timestamp": random_datetime(60, 31).isoformat(),
            "acknowledged": random.choice([True, False]),
        })
    
    # Generate alerts for TODAY specifically (so today_safety_score reflects real data)
    for _ in range(20):
        driver = random.choice(drivers)
        zone = next((z for z in DUBAI_ZONES if z["zone_id"] == driver["current_zone"]), random.choice(DUBAI_ZONES))
        lat, lon = random_point_near(zone["lat"], zone["lon"], 0.5)
        
        # Generate timestamp for today (random time earlier today)
        now = datetime.utcnow()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        random_seconds = random.randint(0, int((now - today_start).total_seconds()))
        today_timestamp = today_start + timedelta(seconds=random_seconds)
        
        alerts.append({
            "alert_id": generate_uuid(),
            "driver_id": driver["driver_id"],
            "alert_type": random.choice(["harsh_braking", "speed_violation", "speeding", "fatigue_warning", "fatigue"]),
            "severity": random.randint(1, 4),
            "location": point_wkt(lat, lon),
            "timestamp": today_timestamp.isoformat(),
            "acknowledged": False,
        })
    
    return alerts


def generate_events(drivers, count=200):
    """Generate event data."""
    events = []
    for _ in range(count):
        driver = random.choice(drivers)
        events.append({
            "event_id": generate_uuid(),
            "driver_id": driver["driver_id"],
            "event_type": random.choice(EVENT_TYPES),
            "priority": random.randint(1, 4),
            "timestamp": random_datetime(14, 0).isoformat(),
        })
    return events


def generate_sensor_records(drivers, count=300):
    """Generate sensor record data."""
    records = []
    for _ in range(count):
        driver = random.choice(drivers)
        zone = next((z for z in DUBAI_ZONES if z["zone_id"] == driver["current_zone"]), random.choice(DUBAI_ZONES))
        lat, lon = random_point_near(zone["lat"], zone["lon"], 1.0)
        
        accel_x = round(random.uniform(-2, 2), 3)
        accel_y = round(random.uniform(-2, 2), 3)
        accel_z = round(random.uniform(8, 11), 3)
        gyro_x = round(random.uniform(-1, 1), 3)
        gyro_y = round(random.uniform(-1, 1), 3)
        gyro_z = round(random.uniform(-1, 1), 3)
        
        records.append({
            "record_id": generate_uuid(),
            "driver_id": driver["driver_id"],
            "accelerometer_x": accel_x,
            "accelerometer_y": accel_y,
            "accelerometer_z": accel_z,
            "gyroscope_x": gyro_x,
            "gyroscope_y": gyro_y,
            "gyroscope_z": gyro_z,
            "acceleration_magnitude": round((accel_x**2 + accel_y**2 + accel_z**2)**0.5, 3),
            "angular_velocity_magnitude": round((gyro_x**2 + gyro_y**2 + gyro_z**2)**0.5, 3),
            "fatigue_score": round(random.uniform(0, 0.9), 2),
            "eye_blink_rate": round(random.uniform(10, 25), 1),
            "yawn_detected": random.choice([False, False, False, True]),
            "head_tilt_rate": round(random.uniform(0, 15), 1),
            "harsh_braking": random.choice([False, False, False, False, True]),
            "harsh_acceleration": random.choice([False, False, False, False, True]),
            "sharp_turn": random.choice([False, False, False, False, True]),
            "sudden_impact": random.choice([False] * 19 + [True]),
            "latitude": round(lat, 6),
            "longitude": round(lon, 6),
            "speed": round(random.uniform(0, 70), 1),
            "recorded_at": random_datetime(7, 0).isoformat(),
            "processed_at": random_datetime(7, 0).isoformat(),
        })
    return records


def generate_gps_tracks(drivers, count=400):
    """Generate GPS track data."""
    tracks = []
    for _ in range(count):
        driver = random.choice(drivers)
        zone = next((z for z in DUBAI_ZONES if z["zone_id"] == driver["current_zone"]), random.choice(DUBAI_ZONES))
        lat, lon = random_point_near(zone["lat"], zone["lon"], 1.5)
        
        tracks.append({
            "track_id": generate_uuid(),
            "driver_id": driver["driver_id"],
            "location": point_wkt(lat, lon),
            "latitude": round(lat, 6),
            "longitude": round(lon, 6),
            "speed": round(random.uniform(0, 60), 1),
            "heading": round(random.uniform(0, 360), 1),
            "altitude": round(random.uniform(0, 100), 1),
            "accuracy": round(random.uniform(3, 20), 1),
            "distance_from_last": round(random.uniform(0, 500), 1),
            "cumulative_distance": round(random.uniform(0, 50000), 1),
            "session_id": generate_uuid() if random.random() > 0.3 else None,
            "recorded_at": random_datetime(7, 0).isoformat(),
        })
    return tracks


def generate_breaks(drivers, count=100):
    """Generate break data spanning 60 days for proper analytics."""
    breaks = []
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    
    # 20% today's breaks
    for _ in range(count // 5):
        driver = random.choice(drivers)
        zone = next((z for z in DUBAI_ZONES if z["zone_id"] == driver["current_zone"]), random.choice(DUBAI_ZONES))
        start_lat, start_lon = random_point_near(zone["lat"], zone["lon"], 0.5)
        
        # Random time today
        hours_into_day = random.uniform(0, min((now - today_start).total_seconds() / 3600, 12))
        start_time = today_start + timedelta(hours=hours_into_day)
        duration = random.randint(5, 60)
        end_time = start_time + timedelta(minutes=duration)
        
        end_lat, end_lon = random_point_near(start_lat, start_lon, 0.1)
        
        breaks.append({
            "break_id": generate_uuid(),
            "driver_id": driver["driver_id"],
            "break_type": random.choice(BREAK_TYPES),
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat() if random.random() > 0.1 else None,
            "duration_minutes": duration if random.random() > 0.1 else None,
            "start_latitude": round(start_lat, 6),
            "start_longitude": round(start_lon, 6),
            "end_latitude": round(end_lat, 6) if random.random() > 0.1 else None,
            "end_longitude": round(end_lon, 6) if random.random() > 0.1 else None,
            "notes": random.choice([None, "Lunch break", "Quick rest", "Bathroom break", "Coffee stop"]),
            "created_at": start_time.isoformat(),
        })
    
    # 40% breaks in last 30 days (for 30d comparison)
    for _ in range(count * 2 // 5):
        driver = random.choice(drivers)
        zone = next((z for z in DUBAI_ZONES if z["zone_id"] == driver["current_zone"]), random.choice(DUBAI_ZONES))
        start_lat, start_lon = random_point_near(zone["lat"], zone["lon"], 0.5)
        
        start_time = random_datetime(30, 1)
        duration = random.randint(5, 60)
        end_time = start_time + timedelta(minutes=duration)
        
        end_lat, end_lon = random_point_near(start_lat, start_lon, 0.1)
        
        breaks.append({
            "break_id": generate_uuid(),
            "driver_id": driver["driver_id"],
            "break_type": random.choice(BREAK_TYPES),
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat() if random.random() > 0.1 else None,
            "duration_minutes": duration if random.random() > 0.1 else None,
            "start_latitude": round(start_lat, 6),
            "start_longitude": round(start_lon, 6),
            "end_latitude": round(end_lat, 6) if random.random() > 0.1 else None,
            "end_longitude": round(end_lon, 6) if random.random() > 0.1 else None,
            "notes": random.choice([None, "Lunch break", "Quick rest", "Bathroom break", "Coffee stop"]),
            "created_at": start_time.isoformat(),
        })
    
    # 40% breaks in 31-60 days ago (for period comparison)
    for _ in range(count * 2 // 5):
        driver = random.choice(drivers)
        zone = next((z for z in DUBAI_ZONES if z["zone_id"] == driver["current_zone"]), random.choice(DUBAI_ZONES))
        start_lat, start_lon = random_point_near(zone["lat"], zone["lon"], 0.5)
        
        start_time = random_datetime(60, 31)
        duration = random.randint(5, 60)
        end_time = start_time + timedelta(minutes=duration)
        
        end_lat, end_lon = random_point_near(start_lat, start_lon, 0.1)
        
        breaks.append({
            "break_id": generate_uuid(),
            "driver_id": driver["driver_id"],
            "break_type": random.choice(BREAK_TYPES),
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat() if random.random() > 0.1 else None,
            "duration_minutes": duration if random.random() > 0.1 else None,
            "start_latitude": round(start_lat, 6),
            "start_longitude": round(start_lon, 6),
            "end_latitude": round(end_lat, 6) if random.random() > 0.1 else None,
            "end_longitude": round(end_lon, 6) if random.random() > 0.1 else None,
            "notes": random.choice([None, "Lunch break", "Quick rest", "Bathroom break", "Coffee stop"]),
            "created_at": start_time.isoformat(),
        })
    
    return breaks


def generate_weather(zones, count=100):
    """Generate weather data."""
    weather = []
    for _ in range(count):
        zone = random.choice(zones)
        condition = random.choice(WEATHER_CONDITIONS)
        is_extreme = condition in ["stormy"] or random.random() > 0.95
        
        weather.append({
            "weather_id": generate_uuid(),
            "zone_id": zone["zone_id"],
            "timestamp": random_datetime(14, 0).isoformat(),
            "temperature_c": round(random.uniform(10, 35), 1),
            "humidity_percent": round(random.uniform(30, 95), 1),
            "wind_speed_kmh": round(random.uniform(0, 50), 1),
            "precipitation_mm": round(random.uniform(0, 30), 1) if condition in ["rainy", "stormy"] else 0,
            "weather_condition": condition,
            "is_extreme_weather": is_extreme,
        })
    return weather


def generate_daily_metrics(count=30):
    """Generate daily metrics data."""
    metrics = []
    for i in range(count):
        d = date.today() - timedelta(days=i)
        total_orders = random.randint(80, 300)
        completed = int(total_orders * random.uniform(0.75, 0.95))
        cancelled = int(total_orders * random.uniform(0.02, 0.1))
        
        metrics.append({
            "metric_id": generate_uuid(),
            "date": d.isoformat(),
            "total_orders": total_orders,
            "completed_orders": completed,
            "cancelled_orders": cancelled,
            "avg_delivery_time_min": round(random.uniform(20, 45), 1),
            "avg_distance_km": round(random.uniform(3, 8), 2),
            "total_revenue": round(total_orders * random.uniform(18, 28), 2),
            "total_alerts": random.randint(5, 40),
            "fatigue_alerts": random.randint(1, 15),
            "accident_alerts": random.randint(0, 3),
            "avg_pickup_time_min": round(random.uniform(8, 18), 1),
            "driver_utilization_rate": round(random.uniform(0.5, 0.9), 2),
            "order_completion_rate": round(completed / total_orders, 2),
            "busiest_zone": random.choice([z["zone_id"] for z in DUBAI_ZONES]),
            "active_drivers_peak": random.randint(15, 35),
        })
    return metrics


def generate_demands(zones, count=100):
    """Generate demand data."""
    demands = []
    factors_options = [
        ["rush_hour"], ["rain"], ["holiday"], ["weekend"],
        ["rush_hour", "rain"], ["holiday", "event"], ["lunch_peak"]
    ]
    
    for _ in range(count):
        zone = random.choice(zones)
        score = round(random.uniform(0.1, 1.0), 2)
        
        demands.append({
            "demand_id": generate_uuid(),
            "zone_id": zone["zone_id"],
            "demand_score": score,
            "confidence": round(random.uniform(0.6, 0.99), 2),
            "demand_threshold_exceeded": score > 0.75,
            "influencing_factors": json.dumps(random.choice(factors_options)),
            "timestamp": random_datetime(7, 0).isoformat(),
        })
    return demands


def generate_demand_forecasts(zones, count=100):
    """Generate demand forecast data."""
    forecasts = []
    models = ["xgboost_v2", "lstm_demand", "gradient_boost", "ensemble_v1"]
    
    for _ in range(count):
        zone = random.choice(zones)
        predicted = round(random.uniform(0.1, 1.0), 2)
        
        forecasts.append({
            "forecast_id": generate_uuid(),
            "zone_id": zone["zone_id"],
            "forecast_time": random_datetime(0, -7).isoformat(),  # Future forecasts
            "forecast_horizon": random.choice([15, 30, 60, 120]),
            "predicted_demand": predicted,
            "demand_score": round(predicted * random.uniform(0.9, 1.1), 2),
            "confidence_interval_lower": round(predicted * 0.8, 2),
            "confidence_interval_upper": round(predicted * 1.2, 2),
            "model_used": random.choice(models),
            "model_version": f"1.{random.randint(0, 5)}",
            "confidence": round(random.uniform(0.7, 0.98), 2),
            "features": json.dumps({"hour": random.randint(0, 23), "day": random.randint(0, 6), "weather": random.choice(WEATHER_CONDITIONS)}),
            "threshold_exceeded": predicted > 0.7,
            "alert_level": random.choice(["low", "medium", "high"]) if predicted > 0.7 else None,
            "created_at": random_datetime(1, 0).isoformat(),
        })
    return forecasts


def generate_demand_patterns(zones, count=70):
    """Generate demand pattern data."""
    patterns = []
    for _ in range(count):
        zone = random.choice(zones)
        avg_demand = round(random.uniform(0.2, 0.8), 2)
        
        patterns.append({
            "pattern_id": generate_uuid(),
            "zone_id": zone["zone_id"],
            "pattern_type": random.choice(PATTERN_TYPES),
            "hour_of_day": random.randint(0, 23) if random.random() > 0.3 else None,
            "day_of_week": random.randint(0, 6) if random.random() > 0.3 else None,
            "week_of_month": random.randint(1, 4) if random.random() > 0.5 else None,
            "month": random.randint(1, 12) if random.random() > 0.6 else None,
            "avg_demand": avg_demand,
            "std_demand": round(avg_demand * random.uniform(0.1, 0.3), 2),
            "peak_demand": round(avg_demand * random.uniform(1.2, 1.8), 2),
            "min_demand": round(avg_demand * random.uniform(0.3, 0.6), 2),
            "influencing_factors": json.dumps({"primary": random.choice(["time", "weather", "events", "holidays"])}),
            "sample_size": random.randint(100, 1000),
            "last_updated": random_datetime(3, 0).isoformat(),
        })
    return patterns


def generate_gen_insights(drivers, count=50):
    """Generate AI-generated insights."""
    insights = []
    messages = [
        "Consider taking a break to maintain alertness during your shift.",
        "Your delivery times have improved by 15% this week. Great job!",
        "High demand expected in your zone in the next hour.",
        "You've completed 100 deliveries this month with excellent ratings.",
        "Traffic congestion detected on your route. Consider alternate path.",
        "Your safety score is above average. Keep up the good work!",
        "Peak hours approaching. Position yourself near high-demand areas.",
        "Weather conditions may affect deliveries. Drive carefully.",
    ]
    
    for _ in range(count):
        driver = random.choice(drivers) if random.random() > 0.2 else None
        
        insights.append({
            "insight_id": generate_uuid(),
            "recipient_id": driver["driver_id"] if driver else None,
            "topic": random.choice(INSIGHT_TOPICS),
            "message": random.choice(messages),
            "priority": random.randint(1, 5),
            "created_at": random_datetime(7, 0).isoformat(),
        })
    return insights


def generate_driver_metrics(drivers, count=200):
    """Generate driver metrics data."""
    metrics = []
    for _ in range(count):
        driver = random.choice(drivers)
        d = random_date(30, 0)
        orders_completed = random.randint(5, 25)
        hours_worked = round(random.uniform(4, 10), 1)
        
        metrics.append({
            "metric_id": generate_uuid(),
            "driver_id": driver["driver_id"],
            "date": d.isoformat(),
            "orders_completed": orders_completed,
            "orders_cancelled": random.randint(0, 3),
            "total_distance_km": round(random.uniform(20, 100), 1),
            "total_earnings": round(orders_completed * random.uniform(8, 15), 2),
            "hours_worked": hours_worked,
            "hours_active": round(hours_worked * random.uniform(0.6, 0.9), 1),
            "hours_idle": round(hours_worked * random.uniform(0.1, 0.3), 1),
            "safety_alerts": random.randint(0, 5),
            "harsh_braking_count": random.randint(0, 10),
            "harsh_acceleration_count": random.randint(0, 8),
            "avg_delivery_time_min": round(random.uniform(18, 40), 1),
            "orders_per_hour": round(orders_completed / hours_worked, 2),
        })
    return metrics


def generate_zone_metrics(zones, count=150):
    """Generate zone metrics data."""
    metrics = []
    for _ in range(count):
        zone = random.choice(zones)
        d = random_date(30, 0)
        total_orders = random.randint(10, 80)
        
        metrics.append({
            "metric_id": generate_uuid(),
            "zone_id": zone["zone_id"],
            "date": d.isoformat(),
            "hour": random.randint(0, 23) if random.random() > 0.5 else None,
            "total_orders": total_orders,
            "completed_orders": int(total_orders * random.uniform(0.8, 0.95)),
            "avg_demand_score": round(random.uniform(0.2, 0.9), 2),
            "peak_hour": random.randint(11, 20),
            "avg_drivers_available": round(random.uniform(2, 12), 1),
            "driver_shortage_minutes": random.randint(0, 60),
            "avg_wait_time_min": round(random.uniform(5, 20), 1),
            "fulfillment_rate": round(random.uniform(0.75, 0.98), 2),
        })
    return metrics


def generate_performance_reports(drivers, zones, count=20):
    """Generate performance reports."""
    reports = []
    
    for i in range(count):
        report_type = random.choice(["weekly", "monthly"])
        entity = random.choice([None, random.choice(drivers)["driver_id"], random.choice(zones)["zone_id"]])
        
        if report_type == "weekly":
            start = date.today() - timedelta(days=7 * (i + 1))
            end = start + timedelta(days=6)
        else:
            start = date.today().replace(day=1) - timedelta(days=30 * i)
            end = (start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        
        reports.append({
            "report_id": generate_uuid(),
            "report_type": report_type,
            "entity_id": entity,
            "start_date": start.isoformat(),
            "end_date": end.isoformat(),
            "summary": json.dumps({"total_orders": random.randint(500, 2000), "completion_rate": round(random.uniform(0.85, 0.95), 2)}),
            "metrics": json.dumps({"avg_delivery_time": round(random.uniform(25, 40), 1), "total_revenue": round(random.uniform(10000, 50000), 2)}),
            "insights": json.dumps(["Peak demand on weekends", "Driver utilization improved", "Safety incidents reduced"]),
            "recommendations": json.dumps(["Add more drivers during lunch hours", "Focus on Zone CBD for growth"]),
            "generated_by": "system",
            "generated_at": random_datetime(1, 0).isoformat(),
        })
    return reports


# ============== SQL GENERATION ==============

def escape_sql_string(value):
    """Escape single quotes for SQL."""
    if value is None:
        return "NULL"
    if isinstance(value, bool):
        return "TRUE" if value else "FALSE"
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, str):
        escaped = value.replace("'", "''")
        # Handle geometry WKT
        if escaped.startswith("SRID="):
            return f"ST_GeomFromEWKT('{escaped}')"
        return f"'{escaped}'"
    return f"'{value}'"


def dict_to_insert_sql(table_name, data_list):
    """Convert list of dicts to INSERT statements."""
    if not data_list:
        return ""
    
    columns = data_list[0].keys()
    column_str = ", ".join(columns)
    
    values_list = []
    for row in data_list:
        vals = [escape_sql_string(row[col]) for col in columns]
        values_list.append(f"({', '.join(vals)})")
    
    # Split into batches to avoid huge statements
    batch_size = 50
    statements = []
    for i in range(0, len(values_list), batch_size):
        batch = values_list[i:i + batch_size]
        statements.append(f"INSERT INTO {table_name} ({column_str}) VALUES\n" + ",\n".join(batch) + ";")
    
    return "\n\n".join(statements)


def generate_sql_script():
    """Generate complete SQL script."""
    print("Generating test data...")
    
    # Generate data
    zones = generate_zones()
    users = generate_users(50)
    admins = generate_administrators(users)
    drivers = generate_drivers(users, zones)
    assignments = generate_assignments(drivers, 100)
    orders = generate_orders(drivers, assignments, zones, 150)
    alerts = generate_alerts(drivers, 80)
    events = generate_events(drivers, 200)
    sensor_records = generate_sensor_records(drivers, 300)
    gps_tracks = generate_gps_tracks(drivers, 400)
    breaks = generate_breaks(drivers, 100)
    weather = generate_weather(zones, 100)
    daily_metrics = generate_daily_metrics(30)
    demands = generate_demands(zones, 100)
    demand_forecasts = generate_demand_forecasts(zones, 100)
    demand_patterns = generate_demand_patterns(zones, 70)
    gen_insights = generate_gen_insights(drivers, 50)
    driver_metrics = generate_driver_metrics(drivers, 200)
    zone_metrics = generate_zone_metrics(zones, 150)
    performance_reports = generate_performance_reports(drivers, zones, 20)
    
    # Generate SQL
    sql_parts = [
        "-- OptiRide Test Data Generation Script",
        "-- Generated on: " + datetime.now().isoformat(),
        "-- Dubai, UAE area data with PostGIS geometry",
        "",
        "-- Ensure PostGIS extension is enabled",
        "CREATE EXTENSION IF NOT EXISTS postgis;",
        "",
        "-- Clear existing data (in reverse dependency order)",
        "TRUNCATE TABLE performance_reports, zone_metrics, driver_metrics, gen_insights CASCADE;",
        "TRUNCATE TABLE demand_patterns, demand_forecasts, demands, daily_metrics CASCADE;",
        "TRUNCATE TABLE weather, breaks, gps_tracks, sensor_records, events, alerts CASCADE;",
        "TRUNCATE TABLE orders, assignments, drivers, administrators, users, zones CASCADE;",
        "",
        "-- ============== ZONES ==============",
        dict_to_insert_sql("zones", zones),
        "",
        "-- ============== USERS ==============",
        dict_to_insert_sql("users", users),
        "",
        "-- ============== ADMINISTRATORS ==============",
        dict_to_insert_sql("administrators", admins),
        "",
        "-- ============== DRIVERS ==============",
        dict_to_insert_sql("drivers", drivers),
        "",
        "-- ============== ASSIGNMENTS ==============",
        dict_to_insert_sql("assignments", assignments),
        "",
        "-- ============== ORDERS ==============",
        dict_to_insert_sql("orders", orders),
        "",
        "-- ============== ALERTS ==============",
        dict_to_insert_sql("alerts", alerts),
        "",
        "-- ============== EVENTS ==============",
        dict_to_insert_sql("events", events),
        "",
        "-- ============== SENSOR RECORDS ==============",
        dict_to_insert_sql("sensor_records", sensor_records),
        "",
        "-- ============== GPS TRACKS ==============",
        dict_to_insert_sql("gps_tracks", gps_tracks),
        "",
        "-- ============== BREAKS ==============",
        dict_to_insert_sql("breaks", breaks),
        "",
        "-- ============== WEATHER ==============",
        dict_to_insert_sql("weather", weather),
        "",
        "-- ============== DAILY METRICS ==============",
        dict_to_insert_sql("daily_metrics", daily_metrics),
        "",
        "-- ============== DEMANDS ==============",
        dict_to_insert_sql("demands", demands),
        "",
        "-- ============== DEMAND FORECASTS ==============",
        dict_to_insert_sql("demand_forecasts", demand_forecasts),
        "",
        "-- ============== DEMAND PATTERNS ==============",
        dict_to_insert_sql("demand_patterns", demand_patterns),
        "",
        "-- ============== GEN INSIGHTS ==============",
        dict_to_insert_sql("gen_insights", gen_insights),
        "",
        "-- ============== DRIVER METRICS ==============",
        dict_to_insert_sql("driver_metrics", driver_metrics),
        "",
        "-- ============== ZONE METRICS ==============",
        dict_to_insert_sql("zone_metrics", zone_metrics),
        "",
        "-- ============== PERFORMANCE REPORTS ==============",
        dict_to_insert_sql("performance_reports", performance_reports),
        "",
        "-- Data generation complete!",
        "-- Summary:",
        f"--   Zones: {len(zones)}",
        f"--   Users: {len(users)}",
        f"--   Administrators: {len(admins)}",
        f"--   Drivers: {len(drivers)}",
        f"--   Assignments: {len(assignments)}",
        f"--   Orders: {len(orders)}",
        f"--   Alerts: {len(alerts)}",
        f"--   Events: {len(events)}",
        f"--   Sensor Records: {len(sensor_records)}",
        f"--   GPS Tracks: {len(gps_tracks)}",
        f"--   Breaks: {len(breaks)}",
        f"--   Weather Records: {len(weather)}",
        f"--   Daily Metrics: {len(daily_metrics)}",
        f"--   Demands: {len(demands)}",
        f"--   Demand Forecasts: {len(demand_forecasts)}",
        f"--   Demand Patterns: {len(demand_patterns)}",
        f"--   Gen Insights: {len(gen_insights)}",
        f"--   Driver Metrics: {len(driver_metrics)}",
        f"--   Zone Metrics: {len(zone_metrics)}",
        f"--   Performance Reports: {len(performance_reports)}",
    ]
    
    return "\n".join(sql_parts)


if __name__ == "__main__":
    sql_script = generate_sql_script()
    
    output_path = "scripts/test_data.sql"
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(sql_script)
    
    print(f"\nSQL script generated: {output_path}")
    print("Run the script with: psql -d your_database -f scripts/test_data.sql")
    print("Or execute it through your database client.")
