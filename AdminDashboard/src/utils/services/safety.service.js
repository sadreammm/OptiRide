import { apiClient, handleApiError } from '@/utils/api.config';

export const safetyService = {
    // List safety alerts
    async listAlerts(driverId, alertType, acknowledged, skip = 0, limit = 50) {
        try {
            const response = await apiClient.get('/safety/alerts', {
                params: {
                    driver_id: driverId,
                    alert_type: alertType,
                    acknowledged,
                    skip,
                    limit
                },
            });
            return response.data;
        }
        catch (error) {
            throw handleApiError(error);
        }
    },

    // Acknowledge safety alert
    async acknowledgeAlert(alertId, acknowledged = true) {
        try {
            const response = await apiClient.patch(`/safety/alerts/${alertId}/acknowledge`, {
                acknowledged,
            });
            return response.data;
        }
        catch (error) {
            throw handleApiError(error);
        }
    },
};
