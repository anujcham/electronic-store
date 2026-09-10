import { apiGet, apiPost } from "./apiClient";

const ORDER_STORAGE_KEY = "electroVault.latestOrder";

export async function createOrder(orderData) {
  try {
    const apiResult = await apiPost("/orders", orderData);
    if (apiResult?.success && apiResult?.order) {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(apiResult.order));
      }
      return { success: true, order: apiResult.order };
    }
    return { success: false, error: apiResult?.error || "Order creation failed." };
  } catch (err) {
    return { success: false, error: err.message || "Order placement failed." };
  }
}

export async function getLatestOrder() {
  if (typeof window !== "undefined") {
    try {
      const stored = window.localStorage.getItem(ORDER_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }
  return null;
}

export async function getUserOrders(userId, email) {
  try {
    const params = new URLSearchParams();
    if (userId) params.append("userId", userId);
    if (email) params.append("email", email);

    const url = `/orders?${params.toString()}`;
    const apiResult = await apiGet(url);

    if (apiResult?.success && Array.isArray(apiResult.orders)) {
      return apiResult.orders;
    }
  } catch (error) {
    console.error("Error fetching user orders from backend:", error);
  }
  
  const latest = await getLatestOrder();
  return latest ? [latest] : [];
}
