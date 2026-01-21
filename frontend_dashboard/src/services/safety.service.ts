import { apiClient, handleApiError } from '@/lib/api.config';

export interface SensorData {
  timestamp: string;
  eye_closure_duration?: number;
  blink_rate?: number;
  head_tilt_angle?: number;
  yawn_detected?: boolean;
  g_force_x?: number;
  g_force_y?: number;
  g_force_z?: number;
  fall_detected?: boolean;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  speed?: number;
}

export interface SensorDataBatch {
  driver_id: string;
  session_id: string;
  sensor_data: SensorData[];
  location_data: LocationData;
}

export interface SensorDataResponse {
  status: string;
  record_id: string;
  fatigue_score?: number;
  movement_risk?: string;
  alerts_generated: number;
  recommendation: string;
}

export interface DistanceStats {
  driver_id: string;
  session_id: string;
  total_distance_km: number;
  total_points: number;
  start_time: string;
  end_time: string;
  average_speed_kmh?: number;
}

export const safetyService = {
  // Submit sensor data (Driver only)
  async submitSensorData(data: SensorDataBatch): Promise<SensorDataResponse> {
    try {
      const response = await apiClient.post('/safety/sensor-data', data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get distance stats for a session (Driver only)
  async getDistanceStats(sessionId: string): Promise<DistanceStats> {
    try {
      const response = await apiClient.get(`/safety/distance-stats/${sessionId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get today's distance (Driver only)
  async getTodayDistance(): Promise<{
    driver_id: string;
    date: string;
    total_distance_km: number;
  }> {
    try {
      const response = await apiClient.get('/safety/distance/today');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
