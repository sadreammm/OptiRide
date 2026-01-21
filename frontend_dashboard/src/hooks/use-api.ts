import { useState, useEffect, useCallback } from 'react';
import { driverService, DriverResponse, DriverListResponse, DriverPerformanceStats } from '@/services/driver.service';
import { orderService, OrderResponse, OrderStats } from '@/services/order.service';

// Driver hooks
export const useDrivers = (skip: number = 0, limit: number = 10) => {
  const [data, setData] = useState<DriverListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchDrivers = useCallback(async () => {
    try {
      setLoading(true);
      const result = await driverService.listDrivers(skip, limit);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [skip, limit]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  return { data, loading, error, refetch: fetchDrivers };
};

export const useDriversSummary = () => {
  const [data, setData] = useState<{
    total_drivers: number;
    available_drivers: number;
    busy_drivers: number;
    on_break_drivers: number;
    offline_drivers: number;
    on_duty_drivers: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      const result = await driverService.getDriversSummary();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { data, loading, error, refetch: fetchSummary };
};

export const useActiveDriverLocations = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchLocations = useCallback(async () => {
    try {
      setLoading(true);
      const result = await driverService.getActiveDriverLocations();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  return { data, loading, error, refetch: fetchLocations };
};

export const useDriverById = (driverId: string | null) => {
  const [data, setData] = useState<DriverResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

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
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [driverId]);

  useEffect(() => {
    fetchDriver();
  }, [fetchDriver]);

  return { data, loading, error, refetch: fetchDriver };
};

export const useDriverPerformanceStats = (driverId: string | null) => {
  const [data, setData] = useState<DriverPerformanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

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
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [driverId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { data, loading, error, refetch: fetchStats };
};

// Order hooks
export const useOrders = (status?: string, driverId?: string, pickupZone?: string) => {
  const [data, setData] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const result = await orderService.getAllOrders(status, driverId, pickupZone);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [status, driverId, pickupZone]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { data, loading, error, refetch: fetchOrders };
};

export const usePendingOrders = (zoneId?: string) => {
  const [data, setData] = useState<{
    count: number;
    orders: OrderResponse[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchPending = useCallback(async () => {
    try {
      setLoading(true);
      const result = await orderService.getPendingOrders(zoneId);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [zoneId]);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  return { data, loading, error, refetch: fetchPending };
};

export const useOrderStats = (startDate?: string, endDate?: string) => {
  const [data, setData] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const result = await orderService.getOrderStats(startDate, endDate);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { data, loading, error, refetch: fetchStats };
};

// Custom hook for periodic data refresh
export const usePolling = (callback: () => void, interval: number = 5000) => {
  useEffect(() => {
    const id = setInterval(callback, interval);
    return () => clearInterval(id);
  }, [callback, interval]);
};
