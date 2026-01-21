# OptiRide - Quick Start Guide

## Frontend-Backend Integration Complete! ✅

Your OptiRide dashboard is now fully connected to the backend API. Here's everything you need to know to get started.

## 🚀 Quick Start

### 1. Start the Backend

```bash
cd Backend
# Activate virtual environment (if not already activated)
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Run the backend
uvicorn app.main:app --reload
```

Backend will be available at: `http://localhost:8000`
API Docs: `http://localhost:8000/docs`

### 2. Start the Frontend

```bash
cd frontend_dashboard
npm install  # Only needed first time
npm run dev
```

Frontend will be available at: `http://localhost:5173`

## 📁 What's Been Added

### New Files Created

#### API Configuration & Services
- ✅ `src/lib/api.config.ts` - Axios configuration with auth interceptors
- ✅ `src/services/auth.service.ts` - Authentication API calls
- ✅ `src/services/driver.service.ts` - Driver management API calls
- ✅ `src/services/order.service.ts` - Order management API calls
- ✅ `src/services/safety.service.ts` - Safety monitoring API calls
- ✅ `src/services/realtime.service.ts` - WebSocket/real-time updates
- ✅ `src/services/index.ts` - Service exports

#### React Hooks & Context
- ✅ `src/hooks/use-api.ts` - Custom hooks for data fetching
- ✅ `src/contexts/AuthContext.tsx` - Authentication context & state

#### Utilities
- ✅ `src/lib/utils.api.ts` - Common API utilities & helpers

#### Documentation
- ✅ `API_INTEGRATION.md` - Complete API integration guide
- ✅ `QUICK_START.md` - This file!

### Updated Files
- ✅ `src/components/admin/FleetDashboard.tsx` - Connected to real API data
- ✅ `src/components/admin/DriverMonitoring.tsx` - Connected to driver API
- ✅ `src/components/admin/HighDemandMap.tsx` - Ready for real-time locations
- ✅ `.env` - Added API configuration

## 🔧 Configuration

### Environment Variables

Make sure your `.env` file has:

```env
VITE_API_BASE_URL=http://localhost:8000
```

### Backend CORS

Ensure your backend allows requests from the frontend. In `Backend/app/core/config.py`:

```python
ALLOWED_ORIGINS: list = ["http://localhost:5173", "*"]
```

## 📊 Available Endpoints

### Authentication
- Login/Logout
- User management (admin)
- Current user info

### Drivers
- List all drivers with pagination
- Driver statistics & summary
- Active driver locations
- Driver performance stats
- Update driver status/location
- Start/end shift
- Start/end break
- Zone management

### Orders
- Create & manage orders
- Order statistics
- Assign orders (manual/auto)
- Driver order actions (pickup/deliver)
- Pending orders by zone

### Safety
- Submit sensor data
- Distance tracking
- Daily distance stats

## 💡 Usage Examples

### In Your Components

```typescript
import { useDriversSummary, useOrderStats } from '@/hooks/use-api';

function Dashboard() {
  const { data: driverStats, loading, error } = useDriversSummary();
  const { data: orderStats } = useOrderStats();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;
  
  return (
    <div>
      <h1>Total Drivers: {driverStats?.total_drivers}</h1>
      <h2>Active Orders: {orderStats?.in_transit_orders}</h2>
    </div>
  );
}
```

### Direct API Calls

```typescript
import { driverService, orderService } from '@/services';

// Get drivers
const drivers = await driverService.listDrivers(0, 20);

// Create order
const order = await orderService.createOrder({
  pickup_address: "123 Main St",
  pickup_latitude: 25.2048,
  pickup_longitude: 55.2708,
  dropoff_address: "456 Park Ave",
  dropoff_latitude: 25.2548,
  dropoff_longitude: 55.3108,
  customer_name: "John Doe",
  customer_contact: "+1234567890"
});

// Auto-assign order
await orderService.autoAssignOrder(order.order_id);
```

## 🔄 Real-time Updates

All data fetching hooks support auto-refresh:

```typescript
import { useDriversSummary, usePolling } from '@/hooks/use-api';

function LiveDashboard() {
  const { data, refetch } = useDriversSummary();
  
  // Refresh every 5 seconds
  usePolling(refetch, 5000);
  
  return <div>{/* Your component */}</div>;
}
```

## 🎯 Key Features

### ✅ Automatic Authentication
- JWT tokens automatically added to requests
- Auto-redirect to login on 401
- Token stored in localStorage

### ✅ Type Safety
- Full TypeScript types for all API responses
- Autocomplete in your IDE
- Compile-time error checking

### ✅ Error Handling
- Centralized error handling
- User-friendly error messages
- Console logging for debugging

### ✅ Loading States
- Built-in loading states in hooks
- Easy to show loading spinners

### ✅ Polling Support
- Auto-refresh data at intervals
- Perfect for real-time dashboards

## 📱 Updated Components

### FleetDashboard
- ✅ Shows real driver statistics
- ✅ Shows real order statistics
- ✅ Auto-refreshes every 10 seconds
- ✅ Calculates metrics from API data

### DriverMonitoring
- ✅ Lists real drivers from API
- ✅ Pagination support
- ✅ Search and filter functionality
- ✅ Auto-refreshes every 5 seconds

### Ready for Integration
- SafetyAlerts - Ready for real alert data
- Analytics - Ready for historical data
- Settings - Ready for configuration

## 🔐 Authentication Flow

1. User logs in via LoginPage
2. Backend returns JWT token
3. Token stored in localStorage
4. All API calls include token in headers
5. On 401 error, redirect to login

## 🐛 Troubleshooting

### Backend not connecting?
- Check backend is running: `http://localhost:8000/docs`
- Check `.env` has correct `VITE_API_BASE_URL`
- Check browser console for CORS errors

### Authentication issues?
- Check token in localStorage: `localStorage.getItem('auth_token')`
- Try logging out and back in
- Check backend JWT configuration

### Data not loading?
- Check browser Network tab for API calls
- Check API response in browser DevTools
- Check backend logs for errors

## 📚 Documentation

For detailed information, see:
- `API_INTEGRATION.md` - Complete integration documentation
- Backend API: `http://localhost:8000/docs` - Interactive API documentation

## 🎉 Next Steps

1. **Test the Integration**: Start both backend and frontend, verify data loads
2. **Add More Components**: Connect remaining components to API
3. **Implement WebSocket**: When backend adds WebSocket endpoint
4. **Add More Features**: Implement file uploads, advanced filters, etc.
5. **Production Build**: Configure for production deployment

## 💻 Development Tips

### Hot Reload
Both frontend and backend support hot reload:
- Frontend: Changes automatically refresh
- Backend: API reloads on file changes (with `--reload` flag)

### API Testing
Test endpoints directly at: `http://localhost:8000/docs`
- Interactive API documentation
- Try out endpoints
- See request/response schemas

### Type Generation
All TypeScript types are manually created to match backend schemas. Keep them in sync when backend changes.

## 🎨 UI Components

All components use shadcn/ui library:
- Buttons, Cards, Badges
- Tables, Dialogs, Popovers
- Charts (Recharts)
- Maps (React-Leaflet)

## 🌐 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 📞 Support

If you encounter issues:
1. Check this guide
2. Check `API_INTEGRATION.md`
3. Check backend API docs
4. Check browser console
5. Check backend logs

---

**Happy Coding! 🚀**

Your OptiRide dashboard is now fully connected and ready for action!
