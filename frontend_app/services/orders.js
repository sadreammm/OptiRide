import { apiFetch } from "@/lib/http";

export async function fetchDriverOrders(token) {
  return apiFetch("/orders/driver/orders", { token });
}

export async function submitPickup(
  token,
  orderId,
  payload,
) {
  return apiFetch(`/orders/${orderId}/pickup`, {
    method: "POST",
    token,
    body: payload,
  });
}

export async function submitDelivery(
  token,
  orderId,
  payload,
) {
  return apiFetch(`/orders/${orderId}/deliver`, {
    method: "POST",
    token,
    body: payload,
  });
}
