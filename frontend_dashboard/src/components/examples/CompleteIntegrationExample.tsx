/**
 * Example Component: Complete Integration Demo
 * 
 * This component demonstrates how to use all the API integration features:
 * - Data fetching with hooks
 * - Auto-refresh with polling
 * - Error handling
 * - Loading states
 * - Authentication
 * - Direct API calls
 * - Real-time updates
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  useDriversSummary, 
  useOrderStats, 
  useDrivers,
  usePolling 
} from '@/hooks/use-api';
import { 
  driverService, 
  orderService,
  authService 
} from '@/services';
import { useAuth } from '@/contexts/AuthContext';
import { 
  showSuccess, 
  showError, 
  formatCurrency,
  formatDuration,
  getStatusColor 
} from '@/lib/utils.api';
import { useRealtimeEvent } from '@/services/realtime.service';

export function CompleteIntegrationExample() {
  // 1. Authentication
  const { user, isAdmin, logout } = useAuth();
  
  // 2. Data fetching with hooks (auto loading & error states)
  const { 
    data: driverSummary, 
    loading: driversLoading, 
    error: driversError,
    refetch: refetchDrivers 
  } = useDriversSummary();
  
  const { 
    data: orderStats, 
    loading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders 
  } = useOrderStats();
  
  const {
    data: driversData,
    loading: driversListLoading
  } = useDrivers(0, 10);
  
  // 3. Auto-refresh every 5 seconds
  usePolling(() => {
    refetchDrivers();
    refetchOrders();
  }, 5000);
  
  // 4. Real-time updates
  useRealtimeEvent('driver_location', (data) => {
    console.log('Driver location updated:', data);
    refetchDrivers();
  });
  
  useRealtimeEvent('safety_alert', (data) => {
    showError(`Safety Alert: ${data.message}`);
  });
  
  // 5. Local state
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  
  // 6. Direct API calls
  const handleCreateTestOrder = async () => {
    setIsCreatingOrder(true);
    try {
      const order = await orderService.createOrder({
        pickup_address: "123 Main St, Dubai",
        pickup_latitude: 25.2048,
        pickup_longitude: 55.2708,
        dropoff_address: "456 Park Ave, Dubai",
        dropoff_latitude: 25.2548,
        dropoff_longitude: 55.3108,
        customer_name: "John Doe",
        customer_contact: "+971501234567",
        restaurant_name: "Test Restaurant",
        price: 50.00
      });
      
      showSuccess(`Order ${order.order_id} created successfully!`);
      refetchOrders();
      
      // Auto-assign the order
      await orderService.autoAssignOrder(order.order_id);
      showSuccess('Order auto-assigned to nearest driver!');
      
    } catch (error: any) {
      showError(error.message || 'Failed to create order');
    } finally {
      setIsCreatingOrder(false);
    }
  };
  
  const handleGetDriverDetails = async (driverId: string) => {
    try {
      const driver = await driverService.getDriverById(driverId);
      const stats = await driverService.getDriverPerformanceStats(driverId);
      
      console.log('Driver:', driver);
      console.log('Stats:', stats);
      setSelectedDriver(driverId);
      
      showSuccess(`Loaded details for driver ${driver.driver_id}`);
    } catch (error: any) {
      showError('Failed to load driver details');
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      showSuccess('Logged out successfully');
    } catch (error) {
      showError('Logout failed');
    }
  };
  
  // 7. Conditional rendering based on loading/error states
  if (driversLoading || ordersLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (driversError || ordersError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Error loading data: {driversError?.message || ordersError?.message}
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="p-6 space-y-6">
      {/* Header with User Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Complete Integration Example</CardTitle>
              <p className="text-sm text-muted-foreground">
                Demonstrating all API features
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.email}</p>
                <Badge variant={isAdmin ? "default" : "secondary"}>
                  {user?.user_type}
                </Badge>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      {/* Real-time Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Drivers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {driverSummary?.total_drivers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {driverSummary?.on_duty_drivers || 0} on duty
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {driverSummary?.available_drivers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Ready for orders
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orderStats?.total_orders || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {orderStats?.delivered_orders || 0} delivered
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(orderStats?.total_revenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatDuration(orderStats?.average_delivery_time || 0)} avg time
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button 
            onClick={handleCreateTestOrder}
            disabled={isCreatingOrder}
          >
            {isCreatingOrder ? 'Creating...' : 'Create Test Order'}
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => {
              refetchDrivers();
              refetchOrders();
              showSuccess('Data refreshed!');
            }}
          >
            Refresh Data
          </Button>
          
          {isAdmin && (
            <Button variant="outline">
              Admin Panel
            </Button>
          )}
        </CardContent>
      </Card>
      
      {/* Driver List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Drivers</CardTitle>
        </CardHeader>
        <CardContent>
          {driversListLoading ? (
            <p>Loading drivers...</p>
          ) : (
            <div className="space-y-2">
              {driversData?.drivers.slice(0, 5).map((driver) => (
                <div 
                  key={driver.driver_id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleGetDriverDetails(driver.driver_id)}
                >
                  <div>
                    <p className="font-medium">{driver.driver_id}</p>
                    <p className="text-sm text-muted-foreground">
                      {driver.vehicle_type} - {driver.vehicle_plate}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(driver.status)}>
                      {driver.status}
                    </Badge>
                    <Badge variant="outline">
                      ⭐ {driver.rating.toFixed(1)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Status Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Driver Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <StatusBar 
              label="Busy" 
              value={driverSummary?.busy_drivers || 0}
              total={driverSummary?.total_drivers || 1}
              color="bg-primary"
            />
            <StatusBar 
              label="Available" 
              value={driverSummary?.available_drivers || 0}
              total={driverSummary?.total_drivers || 1}
              color="bg-success"
            />
            <StatusBar 
              label="On Break" 
              value={driverSummary?.on_break_drivers || 0}
              total={driverSummary?.total_drivers || 1}
              color="bg-warning"
            />
            <StatusBar 
              label="Offline" 
              value={driverSummary?.offline_drivers || 0}
              total={driverSummary?.total_drivers || 1}
              color="bg-muted"
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <StatusBar 
              label="Pending" 
              value={orderStats?.pending_orders || 0}
              total={orderStats?.total_orders || 1}
              color="bg-warning"
            />
            <StatusBar 
              label="In Transit" 
              value={orderStats?.in_transit_orders || 0}
              total={orderStats?.total_orders || 1}
              color="bg-primary"
            />
            <StatusBar 
              label="Delivered" 
              value={orderStats?.delivered_orders || 0}
              total={orderStats?.total_orders || 1}
              color="bg-success"
            />
            <StatusBar 
              label="Cancelled" 
              value={orderStats?.cancelled_orders || 0}
              total={orderStats?.total_orders || 1}
              color="bg-destructive"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper component for status bars
function StatusBar({ 
  label, 
  value, 
  total, 
  color 
}: { 
  label: string; 
  value: number; 
  total: number; 
  color: string;
}) {
  const percentage = (value / total) * 100;
  
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value} ({percentage.toFixed(1)}%)</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default CompleteIntegrationExample;
