# OptiRide Frontend-Backend Integration

## Overview

The OptiRide frontend dashboard is now fully integrated with the FastAPI backend. This document outlines the integration architecture, available services, and usage patterns.

## Architecture

### API Client Configuration

- **Location**: `src/lib/api.config.ts`
- **Base URL**: Configured via `VITE_API_BASE_URL` environment variable (default: `http://localhost:8000`)
- **Features**:
  - Automatic JWT token management
  - Request/response interceptors
  - Automatic auth token injection
  - 401 handling and redirect to login
  - Centralized error handling

### Service Modules

All backend endpoints are wrapped in TypeScript service modules with full type safety:

#### 1. Authentication Service (`src/services/auth.service.ts`)

**Endpoints:**
- `POST /auth/admin/create-user` - Create new user (admin only)
- `DELETE /auth/admin/delete-user/{user_id}` - Delete user (admin only)
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user info

**Usage:**
```typescript
import { authService } from '@/services/auth.service';

// Login
const response = await authService.login(tokenData);

// Get current user
const user = await authService.getMe();

// Check if authenticated
if (authService.isAuthenticated()) {
  // User is logged in
}
```

#### 2. Driver Service (`src/services/driver.service.ts`)

**Endpoints:**
- `POST /drivers/` - Create driver profile
- `GET /drivers/` - List all drivers
- `GET /drivers/active-locations` - Get active driver locations
- `GET /drivers/stats/summary` - Get driver statistics
- `GET /drivers/me` - Get my driver profile
- `PATCH /drivers/me` - Update my profile
- `GET /drivers/me/performance-stats` - Get my performance stats
- `POST /drivers/me/location` - Update my location
- `GET /drivers/nearby-drivers` - Find nearby drivers
- `POST /drivers/me/status` - Update my status
- `POST /drivers/me/shift/start` - Start shift
- `POST /drivers/me/shift/end` - End shift
- `POST /drivers/me/break/start` - Start break
- `POST /drivers/me/break/end` - End break
- `PATCH /drivers/me/zone` - Update zone
- `GET /drivers/zone/{zone_id}` - Get drivers in zone
- `GET /drivers/{driver_id}` - Get driver by ID
- `GET /drivers/{driver_id}/performance-stats` - Get driver performance
- `DELETE /drivers/{driver_id}` - Delete driver

**Usage:**
```typescript
import { driverService } from '@/services/driver.service';

// Get driver summary
const summary = await driverService.getDriversSummary();

// List drivers with pagination
const drivers = await driverService.listDrivers(0, 20);

// Update driver location
await driverService.updateMyLocation({
  latitude: 25.2048,
  longitude: 55.2708
});

// Start shift
await driverService.startShift({
  start_location: { latitude: 25.2048, longitude: 55.2708 },
  zone_id: "A3"
});
```

#### 3. Order Service (`src/services/order.service.ts`)

**Endpoints:**
- `POST /orders/` - Create order
- `POST /orders/webhook/new-order` - Webhook for external orders
- `GET /orders/` - Get all orders (with filters)
- `GET /orders/pending` - Get pending orders
- `GET /orders/stats` - Get order statistics
- `GET /orders/{order_id}` - Get order by ID
- `PATCH /orders/{order_id}` - Update order
- `POST /orders/{order_id}/assign` - Assign order to driver
- `POST /orders/{order_id}/auto-assign` - Auto-assign order
- `GET /orders/driver/orders` - Get driver's orders
- `POST /orders/{order_id}/pickup` - Mark order as picked up
- `POST /orders/{order_id}/deliver` - Mark order as delivered

**Usage:**
```typescript
import { orderService } from '@/services/order.service';

// Create order
const order = await orderService.createOrder({
  pickup_address: "123 Main St",
  pickup_latitude: 25.2048,
  pickup_longitude: 55.2708,
  dropoff_address: "456 Park Ave",
  dropoff_latitude: 25.2548,
  dropoff_longitude: 55.3108,
  customer_name: "John Doe",
  customer_contact: "+1234567890",
  price: 25.50
});

// Get order stats
const stats = await orderService.getOrderStats();

// Auto-assign order
await orderService.autoAssignOrder(orderId);

// Driver pickup order
await orderService.pickupOrder(orderId, {
  pickup_time: new Date().toISOString(),
  pickup_location: { latitude: 25.2048, longitude: 55.2708 }
});
```

#### 4. Safety Service (`src/services/safety.service.ts`)

**Endpoints:**
- `POST /safety/sensor-data` - Submit sensor data
- `GET /safety/distance-stats/{session_id}` - Get distance stats
- `GET /safety/distance/today` - Get today's distance

**Usage:**
```typescript
import { safetyService } from '@/services/safety.service';

// Submit sensor data
const result = await safetyService.submitSensorData({
  driver_id: "DRV-123",
  session_id: "session-456",
  sensor_data: [{
    timestamp: new Date().toISOString(),
    eye_closure_duration: 0.5,
    blink_rate: 15,
    yawn_detected: false
  }],
  location_data: {
    latitude: 25.2048,
    longitude: 55.2708,
    speed: 45
  }
});

// Get today's distance
const distance = await safetyService.getTodayDistance();
```

## React Hooks

Custom hooks for data fetching with automatic loading and error states:

### Available Hooks (`src/hooks/use-api.ts`)

```typescript
import {
  useDrivers,
  useDriversSummary,
  useActiveDriverLocations,
  useDriverById,
  useDriverPerformanceStats,
  useOrders,
  usePendingOrders,
  useOrderStats,
  usePolling
} from '@/hooks/use-api';

// In your component:
function MyComponent() {
  const { data, loading, error, refetch } = useDriversSummary();
  
  // Auto-refresh every 5 seconds
  usePolling(refetch, 5000);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>Total Drivers: {data?.total_drivers}</div>;
}
```

## Authentication Context

Use the Auth Context for managing authentication state:

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, isAdmin, login, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <LoginPage />;
  }
  
  return (
    <div>
      <p>Welcome, {user?.email}</p>
      {isAdmin && <AdminPanel />}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## Real-time Updates

### WebSocket Service (`src/services/realtime.service.ts`)

For real-time updates when backend WebSocket is available:

```typescript
import { realtimeService, useRealtimeEvent } from '@/services/realtime.service';

// Connect to WebSocket
realtimeService.connect();

// Use in component
function DriverMap() {
  useRealtimeEvent('driver_location', (data) => {
    // Update map with new driver location
    console.log('Driver moved:', data);
  });
  
  useRealtimeEvent('safety_alert', (data) => {
    // Show alert notification
    console.log('Safety alert:', data);
  });
}
```

**Note**: Currently using polling as WebSocket endpoint is not yet implemented on backend. Update `VITE_WS_URL` in `.env` when WebSocket endpoint is ready.

## Environment Configuration

Create/update `.env` file in frontend_dashboard:

```env
# Backend API URL
VITE_API_BASE_URL=http://localhost:8000

# WebSocket URL (when available)
VITE_WS_URL=ws://localhost:8000/ws

# Supabase (if using)
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_PUBLISHABLE_KEY=your_key
VITE_SUPABASE_URL=your_url
```

## Updated Components

The following components have been updated to use real API data:

### 1. FleetDashboard
- Connected to driver summary statistics
- Connected to order statistics
- Auto-refreshes every 10 seconds
- Real-time metric calculations

### 2. DriverMonitoring
- Connected to driver list API
- Pagination support
- Auto-refreshes every 5 seconds
- Search and filter functionality

### 3. Analytics
- Ready to connect to analytics endpoints
- Historical data visualization

### 4. SafetyAlerts
- Ready to display real safety alerts from backend
- Filter by severity and type

## Best Practices

### 1. Error Handling

Always handle errors from API calls:

```typescript
try {
  const data = await driverService.listDrivers();
  // Success handling
} catch (error: any) {
  console.error('Error:', error.message);
  // Show user-friendly error message
}
```

### 2. Loading States

Use loading states from hooks:

```typescript
const { data, loading, error } = useDrivers();

if (loading) return <Skeleton />;
if (error) return <ErrorMessage error={error} />;
return <DriverList drivers={data?.drivers} />;
```

### 3. Auto-refresh

Use polling for real-time updates:

```typescript
const { refetch } = useDriversSummary();

// Refresh every 5 seconds
usePolling(refetch, 5000);
```

### 4. Type Safety

All services are fully typed. Use TypeScript types:

```typescript
import { DriverResponse, OrderResponse } from '@/services/driver.service';

const driver: DriverResponse = await driverService.getDriverById(id);
```

## Running the Application

### Backend
```bash
cd Backend
# Activate virtual environment
source venv/bin/activate  # or venv\Scripts\activate on Windows
# Run backend
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend_dashboard
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173` and will connect to the backend at `http://localhost:8000`.

## Next Steps

1. **Implement WebSocket on Backend**: Add WebSocket endpoint for real-time updates
2. **Add Kafka Consumer**: Connect frontend to Kafka topics for real-time events
3. **Add More Analytics**: Implement advanced analytics endpoints
4. **Add Notifications**: Implement push notifications for critical alerts
5. **Add File Upload**: Implement driver document upload functionality
6. **Add Maps Integration**: Complete Google Maps API integration for routing

## Troubleshooting

### CORS Issues
If you encounter CORS errors, ensure the backend's `ALLOWED_ORIGINS` in `Backend/app/core/config.py` includes your frontend URL:

```python
ALLOWED_ORIGINS: list = ["http://localhost:5173", "*"]
```

### Authentication Issues
If auth tokens aren't working:
1. Check that token is being stored: `localStorage.getItem('auth_token')`
2. Check backend JWT configuration
3. Verify token format in request headers

### API Connection Issues
1. Ensure backend is running: `http://localhost:8000/docs`
2. Check `.env` file has correct `VITE_API_BASE_URL`
3. Check browser console for detailed error messages

## Support

For issues or questions, refer to:
- Backend API docs: `http://localhost:8000/docs`
- Frontend code: Check service files in `src/services/`
- Hooks documentation: Check `src/hooks/use-api.ts`
