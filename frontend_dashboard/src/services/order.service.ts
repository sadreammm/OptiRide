import { apiClient, handleApiError } from '@/lib/api.config';

export interface OrderCreate {
  pickup_address: string;
  pickup_latitude: number;
  pickup_longitude: number;
  dropoff_address: string;
  dropoff_latitude: number;
  dropoff_longitude: number;
  customer_name: string;
  customer_contact: string;
  restaurant_name?: string;
  restaurant_contact?: string;
  price?: number;
}

export interface OrderUpdate {
  status?: 'PENDING' | 'ASSIGNED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  pickup_address?: string;
  dropoff_address?: string;
  price?: number;
}

export interface OrderAssign {
  driver_id: string;
}

export interface OrderPickup {
  pickup_time: string;
  pickup_location: {
    latitude: number;
    longitude: number;
  };
}

export interface OrderDeliver {
  delivery_time: string;
  delivery_location: {
    latitude: number;
    longitude: number;
  };
  delivery_notes?: string;
}

export interface OrderResponse {
  order_id: string;
  pickup_address: string;
  pickup_location: {
    latitude: number;
    longitude: number;
  };
  dropoff_address: string;
  dropoff_location: {
    latitude: number;
    longitude: number;
  };
  customer_name: string;
  customer_contact: string;
  restaurant_name?: string;
  restaurant_contact?: string;
  status: string;
  driver_id?: string;
  assigned_at?: string;
  picked_up_at?: string;
  delivered_at?: string;
  price?: number;
  distance?: number;
  created_at: string;
}

export interface OrderStats {
  total_orders: number;
  pending_orders: number;
  assigned_orders: number;
  in_transit_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  total_revenue: number;
  average_delivery_time: number;
}

export const orderService = {
  // Create order (Admin only)
  async createOrder(data: OrderCreate): Promise<OrderResponse> {
    try {
      const response = await apiClient.post('/orders/', data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Webhook to create order (external systems)
  async webhookCreateOrder(data: OrderCreate, autoAssign: boolean = false): Promise<OrderResponse> {
    try {
      const response = await apiClient.post('/orders/webhook/new-order', data, {
        params: { auto_assign: autoAssign },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get all orders (Admin only)
  async getAllOrders(
    status?: string,
    driverId?: string,
    pickupZone?: string
  ): Promise<OrderResponse[]> {
    try {
      const response = await apiClient.get('/orders/', {
        params: { status, driver_id: driverId, pickup_zone: pickupZone },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get pending orders (Admin only)
  async getPendingOrders(zoneId?: string): Promise<{
    count: number;
    orders: OrderResponse[];
  }> {
    try {
      const response = await apiClient.get('/orders/pending', {
        params: { zone_id: zoneId },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get order statistics (Admin only)
  async getOrderStats(startDate?: string, endDate?: string): Promise<OrderStats> {
    try {
      const response = await apiClient.get('/orders/stats', {
        params: { start_date: startDate, end_date: endDate },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get order by ID
  async getOrderById(orderId: string): Promise<OrderResponse> {
    try {
      const response = await apiClient.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update order (Admin only)
  async updateOrder(orderId: string, data: OrderUpdate): Promise<OrderResponse> {
    try {
      const response = await apiClient.patch(`/orders/${orderId}`, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Assign order to driver (Admin only)
  async assignOrder(orderId: string, driverId: string): Promise<OrderResponse> {
    try {
      const response = await apiClient.post(`/orders/${orderId}/assign`, {
        driver_id: driverId,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Auto-assign order (Admin only)
  async autoAssignOrder(orderId: string): Promise<OrderResponse> {
    try {
      const response = await apiClient.post(`/orders/${orderId}/auto-assign`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get driver's orders (Driver only)
  async getDriverOrders(): Promise<{
    count: number;
    orders: OrderResponse[];
  }> {
    try {
      const response = await apiClient.get('/orders/driver/orders');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Pickup order (Driver only)
  async pickupOrder(orderId: string, data: OrderPickup): Promise<OrderResponse> {
    try {
      const response = await apiClient.post(`/orders/${orderId}/pickup`, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Deliver order (Driver only)
  async deliverOrder(orderId: string, data: OrderDeliver): Promise<OrderResponse> {
    try {
      const response = await apiClient.post(`/orders/${orderId}/deliver`, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
