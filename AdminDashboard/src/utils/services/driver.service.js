import { apiClient, handleApiError } from '@/utils/api.config';
export const driverService = {
    // Create driver profile (Admin only)
    async createDriver(data) {
        try {
            const response = await apiClient.post('/drivers/', data);
            return response.data;
        }
        catch (error) {
            throw handleApiError(error);
        }
    },
    // List all drivers (Admin only)
    async listDrivers(skip = 0, limit = 10) {
        try {
            const response = await apiClient.get('/drivers/', {
                params: { skip, limit },
            });
            return response.data;
        }
        catch (error) {
            throw handleApiError(error);
        }
    },
    // Get active driver locations (Admin only)
    async getActiveDriverLocations() {
        try {
            const response = await apiClient.get('/drivers/active-locations');
            return response.data;
        }
        catch (error) {
            throw handleApiError(error);
        }
    },
    // Get driver statistics summary (Admin only)
    async getDriversSummary() {
        try {
            const response = await apiClient.get('/drivers/stats/summary');
            return response.data;
        }
        catch (error) {
            throw handleApiError(error);
        }
    },
    // Get my driver profile
    async getMyProfile() {
        try {
            const response = await apiClient.get('/drivers/me');
            return response.data;
        }
        catch (error) {
            throw handleApiError(error);
        }
    },
    // Update my driver profile
    async updateMyProfile(data) {
        try {
            const response = await apiClient.patch('/drivers/me', data);
            return response.data;
        }
        catch (error) {
            throw handleApiError(error);
        }
    },
    // Get my performance stats
    async getMyPerformanceStats() {
        try {
            const response = await apiClient.get('/drivers/me/performance-stats');
            return response.data;
        }
        catch (error) {
            throw handleApiError(error);
        }
    },
    // Update my location
    async updateMyLocation(location) {
        try {
            const response = await apiClient.post('/drivers/me/location', location);
            return response.data;
        }
        catch (error) {
            throw handleApiError(error);
        }
    },
    // Get nearby drivers
    async getNearbyDrivers(latitude, longitude, radiusKm = 5, status, limit = 10) {
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
        }
        catch (error) {
            throw handleApiError(error);
        }
    },
    // Update my status
    async updateMyStatus(status) {
        try {
            const response = await apiClient.post('/drivers/me/status', { status });
            return response.data;
        }
        catch (error) {
            throw handleApiError(error);
        }
    },
    // Start shift
    async startShift(data) {
        try {
            const response = await apiClient.post('/drivers/me/shift/start', data);
            return response.data;
        }
        catch (error) {
            throw handleApiError(error);
        }
    },
    // End shift
    async endShift(data) {
        try {
            const response = await apiClient.post('/drivers/me/shift/end', data);
            return response.data;
        }
        catch (error) {
            throw handleApiError(error);
        }
    },
    // Start break
    async startBreak(data) {
        try {
            const response = await apiClient.post('/drivers/me/break/start', data);
            return response.data;
        }
        catch (error) {
            throw handleApiError(error);
        }
    },
    // End break
    async endBreak() {
        try {
            const response = await apiClient.post('/drivers/me/break/end');
            return response.data;
        }
        catch (error) {
            throw handleApiError(error);
        }
    },
    // Update zone
    async updateMyZone(zoneId) {
        try {
            const response = await apiClient.patch('/drivers/me/zone', { zone_id: zoneId });
            return response.data;
        }
        catch (error) {
            throw handleApiError(error);
        }
    },
    // Get drivers in zone (Admin only)
    async getDriversInZone(zoneId) {
        try {
            const response = await apiClient.get(`/drivers/zone/${zoneId}`);
            return response.data;
        }
        catch (error) {
            throw handleApiError(error);
        }
    },
    // Get driver by ID (Admin only)
    async getDriverById(driverId) {
        try {
            const response = await apiClient.get(`/drivers/${driverId}`);
            return response.data;
        }
        catch (error) {
            throw handleApiError(error);
        }
    },
    // Get driver performance stats by ID (Admin only)
    async getDriverPerformanceStats(driverId) {
        try {
            const response = await apiClient.get(`/drivers/${driverId}/performance-stats`);
            return response.data;
        }
        catch (error) {
            throw handleApiError(error);
        }
    },
    // Delete driver (Admin only)
    async deleteDriver(driverId) {
        try {
            const response = await apiClient.delete(`/drivers/${driverId}`);
            return response.data;
        }
        catch (error) {
            throw handleApiError(error);
        }
    },
};

