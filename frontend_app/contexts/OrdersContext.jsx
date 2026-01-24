import { useAuth } from "@/contexts/AuthContext";
import createContextHook from "@nkzw/create-context-hook";
import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchDriverOrders, submitDelivery, submitPickup } from "@/services/orders";
import { mapApiOrderToOrder } from "@/types/order";

const ORDER_QUERY_KEY = ["orders"];

export const [OrdersProvider, useOrders] = createContextHook(() => {
  const { token, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, isRefetching, refetch, error } = useQuery({
    queryKey: ORDER_QUERY_KEY,
    enabled: Boolean(token),
    queryFn: async () => {
      if (!token) return { orders: [], count: 0 };
      return fetchDriverOrders(token);
    },
  });

  const orders = useMemo(
    () => (data?.orders ?? []).map((order) => mapApiOrderToOrder(order)),
    [data?.orders],
  );

  const invalidateOrders = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEY });
  }, [queryClient]);

  const confirmPickup = useCallback(
    async (orderId) => {
      if (!token) throw new Error("Not authenticated");
      const order = orders.find((item) => item.id === orderId);
      await submitPickup(token, orderId, {
        pickup_latitude: order?.pickupLatitude ?? 0,
        pickup_longitude: order?.pickupLongitude ?? 0,
      });
      await invalidateOrders();
    },
    [invalidateOrders, orders, token],
  );

  const completeDelivery = useCallback(
    async (orderId) => {
      if (!token) throw new Error("Not authenticated");
      const order = orders.find((item) => item.id === orderId);
      await submitDelivery(token, orderId, {
        dropoff_latitude: order?.dropoffLatitude ?? 0,
        dropoff_longitude: order?.dropoffLongitude ?? 0,
      });
      await invalidateOrders();
    },
    [invalidateOrders, orders, token],
  );

  return {
    orders,
    isLoadingOrders: isLoading,
    isRefetchingOrders: isRefetching,
    ordersError: error,
    refetchOrders: refetch,
    isAuthenticated,
    completeDelivery,
    confirmPickup,
  };
});
