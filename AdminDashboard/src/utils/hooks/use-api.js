import { useState, useEffect, useCallback } from 'react';
import { driverService } from '@/utils/services/driver.service';
import { orderService } from '@/utils/services/order.service';
import { safetyService } from '@/utils/services/safety.service';
// Driver hooks
export const useDrivers = (skip = 0, limit = 10) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchDrivers = useCallback(async () => {
        try {
            setLoading(true);
            const result = await driverService.listDrivers(skip, limit);
            setData(result);
            setError(null);
        }
        catch (err) {
            setError(err);
        }
        finally {
            setLoading(false);
        }
    }, [skip, limit]);
    useEffect(() => {
        fetchDrivers();
    }, [fetchDrivers]);
    return { data, loading, error, refetch: fetchDrivers };
};
export const useDriversSummary = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchSummary = useCallback(async () => {
        try {
            setLoading(true);
            const result = await driverService.getDriversSummary();
            setData(result);
            setError(null);
        }
        catch (err) {
            setError(err);
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        fetchSummary();
    }, [fetchSummary]);
    return { data, loading, error, refetch: fetchSummary };
};
export const useActiveDriverLocations = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchLocations = useCallback(async () => {
        try {
            setLoading(true);
            const result = await driverService.getActiveDriverLocations();
            setData(result);
            setError(null);
        }
        catch (err) {
            setError(err);
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        fetchLocations();
    }, [fetchLocations]);
    return { data, loading, error, refetch: fetchLocations };
};
export const useDriverById = (driverId) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchDriver = useCallback(async () => {
        if (!driverId) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const result = await driverService.getDriverById(driverId);
            setData(result);
            setError(null);
        }
        catch (err) {
            setError(err);
        }
        finally {
            setLoading(false);
        }
    }, [driverId]);
    useEffect(() => {
        fetchDriver();
    }, [fetchDriver]);
    return { data, loading, error, refetch: fetchDriver };
};
export const useDriverPerformanceStats = (driverId) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchStats = useCallback(async () => {
        if (!driverId) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const result = await driverService.getDriverPerformanceStats(driverId);
            setData(result);
            setError(null);
        }
        catch (err) {
            setError(err);
        }
        finally {
            setLoading(false);
        }
    }, [driverId]);
    useEffect(() => {
        fetchStats();
    }, [fetchStats]);
    return { data, loading, error, refetch: fetchStats };
};
// Order hooks
export const useOrders = (status, driverId, pickupZone) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const result = await orderService.getAllOrders(status, driverId, pickupZone);
            setData(result);
            setError(null);
        }
        catch (err) {
            setError(err);
        }
        finally {
            setLoading(false);
        }
    }, [status, driverId, pickupZone]);
    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);
    return { data, loading, error, refetch: fetchOrders };
};
export const usePendingOrders = (zoneId) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchPending = useCallback(async () => {
        try {
            setLoading(true);
            const result = await orderService.getPendingOrders(zoneId);
            setData(result);
            setError(null);
        }
        catch (err) {
            setError(err);
        }
        finally {
            setLoading(false);
        }
    }, [zoneId]);
    useEffect(() => {
        fetchPending();
    }, [fetchPending]);
    return { data, loading, error, refetch: fetchPending };
};
export const useOrderStats = (startDate, endDate) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            const result = await orderService.getOrderStats(startDate, endDate);
            setData(result);
            setError(null);
        }
        catch (err) {
            setError(err);
        }
        finally {
            setLoading(false);
        }
    }, [startDate, endDate]);
    useEffect(() => {
        fetchStats();
    }, [fetchStats]);
    return { data, loading, error, refetch: fetchStats };
};
export const useSafetyAlerts = (driverId, alertType, acknowledged, skip, limit) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchAlerts = useCallback(async () => {
        try {
            setLoading(true);
            const result = await safetyService.listAlerts(driverId, alertType, acknowledged, skip, limit);
            setData(result);
            setError(null);
        }
        catch (err) {
            setError(err);
        }
        finally {
            setLoading(false);
        }
    }, [driverId, alertType, acknowledged, skip, limit]);
    useEffect(() => {
        fetchAlerts();
    }, [fetchAlerts]);
    return { data, loading, error, refetch: fetchAlerts };
};

// Custom hook for periodic data refresh
export const usePolling = (callback, interval = 5000) => {
    useEffect(() => {
        const id = setInterval(callback, interval);
        return () => clearInterval(id);
    }, [callback, interval]);
};

