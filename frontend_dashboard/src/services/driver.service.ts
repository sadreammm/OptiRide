import { apiClient, handleApiError } from '@/lib/api.config';

export interface DriverCreate {
  user_id: string;
  vehicle_type: string;
  license_number: string;
  vehicle_plate: string;
  phone_number?: string;
  email?: string;
}

export interface DriverUpdate {
  vehicle_type?: string;
  license_number?: string;
  vehicle_plate?: string;
  phone_number?: string;
  email?: string;
}

export interface LocationSchema {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  speed?: number;
}

export interface StatusUpdate {
  status: 'AVAILABLE' | 'BUSY' | 'ON_BREAK' | 'OFFLINE';
}

export interface DriverResponse {
  driver_id: string;
  user_id: string;
  vehicle_type: string;
  license_number: string;
  vehicle_plate: string;
  status: string;
  duty_status: string;
  current_location?: {
    latitude: number;
    longitude: number;
  };
  current_zone?: string;
  rating: number;
  total_deliveries: number;
  total_distance: number;
  phone_number?: string;
  email?: string;
  created_at: string;
}

export interface DriverPerformanceStats {
  driver_id: string;
  total_deliveries: number;
  completed_deliveries: number;
  failed_deliveries: number;
  total_distance: number;
  average_rating: number;
  acceptance_rate: number;
  completion_rate: number;
  on_time_rate: number;
  total_earnings: number;
}

export interface ShiftStart {
  start_location: LocationSchema;
  zone_id?: string;
}

export interface ShiftEnd {
  end_location: LocationSchema;
}

export interface ShiftSummary {
  shift_duration: number;
  total_deliveries: number;
  total_distance: number;
  earnings: number;
  breaks_taken: number;
}

export interface BreakRequest {
  break_type: string;
  location: LocationSchema;
}

export interface ZoneUpdate {
  zone_id: string;
}

export interface DriverListResponse {
  total: number;
  drivers: DriverResponse[];
}

export interface NearbyDriverResponse {
  driver_id: string;
  distance_km: number;
  status: string;
  rating: number;
}

export const driverService = {
  // Create driver profile (Admin only)
  async createDriver(data: DriverCreate): Promise<DriverResponse> {
    try {
      const response = await apiClient.post('/drivers/', data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // List all drivers (Admin only)
  async listDrivers(skip: number = 0, limit: number = 10): Promise<DriverListResponse> {
    try {
      const response = await apiClient.get('/drivers/', {
        params: { skip, limit },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get active driver locations (Admin only)
  async getActiveDriverLocations(): Promise<any[]> {
    try {
      const response = await apiClient.get('/drivers/active-locations');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get driver statistics summary (Admin only)
  async getDriversSummary(): Promise<{
    total_drivers: number;
    available_drivers: number;
    busy_drivers: number;
    on_break_drivers: number;
    offline_drivers: number;
    on_duty_drivers: number;
  }> {
    try {
      const response = await apiClient.get('/drivers/stats/summary');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get my driver profile
  async getMyProfile(): Promise<DriverResponse> {
    try {
      const response = await apiClient.get('/drivers/me');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update my driver profile
  async updateMyProfile(data: DriverUpdate): Promise<DriverResponse> {
    try {
      const response = await apiClient.patch('/drivers/me', data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get my performance stats
  async getMyPerformanceStats(): Promise<DriverPerformanceStats> {
    try {
      const response = await apiClient.get('/drivers/me/performance-stats');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update my location
  async updateMyLocation(location: LocationSchema): Promise<{ detail: string }> {
    try {
      const response = await apiClient.post('/drivers/me/location', location);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get nearby drivers
  async getNearbyDrivers(
    latitude: number,
    longitude: number,
    radiusKm: number = 5,
    status?: string,
    limit: number = 10
  ): Promise<NearbyDriverResponse[]> {
    try {
      const response = await apiClient.get('/drivers/nearby-drivers', {
        params: {
          latitude,
          longitude,
          radius_km: radiusKm,
          status,
          limit,
        },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update my status
  async updateMyStatus(status: StatusUpdate['status']): Promise<{ detail: string }> {
    try {
      const response = await apiClient.post('/drivers/me/status', { status });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Start shift
  async startShift(data: ShiftStart): Promise<DriverResponse> {
    try {
      const response = await apiClient.post('/drivers/me/shift/start', data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // End shift
  async endShift(data: ShiftEnd): Promise<ShiftSummary> {
    try {
      const response = await apiClient.post('/drivers/me/shift/end', data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Start break
  async startBreak(data: BreakRequest): Promise<{ message: string; break_type: string }> {
    try {
      const response = await apiClient.post('/drivers/me/break/start', data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // End break
  async endBreak(): Promise<{ message: string; breaks_today: number }> {
    try {
      const response = await apiClient.post('/drivers/me/break/end');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update zone
  async updateMyZone(zoneId: string): Promise<{ detail: string; zone_id: string }> {
    try {
      const response = await apiClient.patch('/drivers/me/zone', { zone_id: zoneId });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get drivers in zone (Admin only)
  async getDriversInZone(zoneId: string): Promise<{
    zone_id: string;
    total_drivers: number;
    drivers: DriverResponse[];
  }> {
    try {
      const response = await apiClient.get(`/drivers/zone/${zoneId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get driver by ID (Admin only)
  async getDriverById(driverId: string): Promise<DriverResponse> {
    try {
      const response = await apiClient.get(`/drivers/${driverId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get driver performance stats by ID (Admin only)
  async getDriverPerformanceStats(driverId: string): Promise<DriverPerformanceStats> {
    try {
      const response = await apiClient.get(`/drivers/${driverId}/performance-stats`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Delete driver (Admin only)
  async deleteDriver(driverId: string): Promise<{ detail: string }> {
    try {
      const response = await apiClient.delete(`/drivers/${driverId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
