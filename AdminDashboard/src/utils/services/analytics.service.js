import { apiClient, handleApiError } from '@/utils/api.config';

export const analyticsService = {
    async getDashboardOverview(period = 'today') {
        try {
            const response = await apiClient.get('/analytics/dashboard', {
                params: { period }
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },
    async getRealtimeMetrics() {
        try {
            const response = await apiClient.get('/analytics/realtime');
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },
    async getFleetDashboardCharts() {
        try {
            const response = await apiClient.get('/analytics/fleet-charts');
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },
    async getTrends(metric, period = 'last_7_days', granularity = 'daily') {
        try {
            const response = await apiClient.get(`/analytics/trends/${metric}`, {
                params: { period, granularity }
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },
    async analyzePerformance(entityType, entityId = null, period = 'this_month') {
        try {
            const response = await apiClient.get(`/analytics/performance/${entityType}`, {
                params: {
                    entity_id: entityId,
                    period
                }
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },
    async getZoneHeatmap(hour = null) {
        try {
            const response = await apiClient.get('/analytics/zones/heatmap', {
                params: { hour }
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },
    async getZoneSummary(zoneId, period = 'this_month') {
        try {
            const response = await apiClient.get(`/analytics/zones/${zoneId}/summary`, {
                params: { period }
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },
    async getDriverSummary(driverId, period = 'this_month') {
        try {
            const response = await apiClient.get(`/analytics/drivers/${driverId}/summary`, {
                params: { period }
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },
    async generateReport(reportRequest) {
        try {
            const response = await apiClient.post('/analytics/reports', reportRequest);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // ============================================
    // NEW AGGREGATED ANALYTICS ENDPOINTS
    // ============================================

    /**
     * Get aggregated alerts summary for analytics dashboard
     * @param {string} period - 'today', 'last_7_days', 'this_month'
     */
    async getAlertsSummary(period = 'last_7_days') {
        try {
            const response = await apiClient.get('/analytics/alerts/summary', {
                params: { period }
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    /**
     * Get fleet-wide safety score with component breakdown
     * @param {string} period - 'today', 'last_7_days', 'this_month'
     */
    async getSafetyScore(period = 'last_7_days') {
        try {
            const response = await apiClient.get('/analytics/safety/score', {
                params: { period }
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    /**
     * Get top performing drivers
     * @param {string} period - 'today', 'last_7_days', 'this_month'
     * @param {number} limit - Number of top performers to return (1-20)
     */
    async getTopPerformers(period = 'last_7_days', limit = 5) {
        try {
            const response = await apiClient.get('/analytics/drivers/top-performers', {
                params: { period, limit }
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    /**
     * Get demand forecast for next N hours
     * @param {number} hours - Number of hours to forecast (1-24)
     */
    async getDemandForecast(hours = 12) {
        try {
            const response = await apiClient.get('/analytics/demand/forecast', {
                params: { hours }
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    /**
     * Get hourly actual vs predicted demand for a specific date
     * @param {string|null} date - Target date in YYYY-MM-DD format, null for today
     */
    async getDemandHistory(date = null) {
        try {
            const params = {};
            if (date) params.date = date;
            const response = await apiClient.get('/analytics/demand/history', { params });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    /**
     * Get hourly actual vs predicted demand per zone for a specific date
     * @param {string|null} date - Target date in YYYY-MM-DD format, null for today
     */
    async getZoneDemandHistory(date = null) {
        try {
            const params = {};
            if (date) params.date = date;
            const response = await apiClient.get('/analytics/demand/zones', { params });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }
};