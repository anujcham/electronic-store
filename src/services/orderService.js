import { apiGet, apiPost } from "./apiClient";

const ORDER_STORAGE_KEY = "electroVault.latestOrder";

export const demoOrderHistory = [
  {
    orderId: "ORD-849201",
    placedAt: "2026-03-02T14:32:00Z",
    status: "Dispatched",
    courier: "Royal Mail Tracked 24",
    trackingNum: "GB940281048291",
    total: 489.0,
    items: [
      {
        name: "iPhone 13",
        brand: "Apple",
        price: 489.0,
        quantity: 1,
        condition: "Excellent",
        storage: "128GB",
        color: "Midnight",
        battery: "Optimal (85%+)",
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
        inspectionCertId: "CERT-940281",
      },
    ],
  },
  {
    orderId: "ORD-739104",
    placedAt: "2025-11-18T10:15:00Z",
    status: "Delivered",
    courier: "DPD Tracked Express",
    trackingNum: "DPD849102847",
    total: 629.0,
    items: [
      {
        name: "Samsung Galaxy S22 Ultra",
        brand: "Samsung",
        price: 629.0,
        quantity: 1,
        condition: "Pristine",
        storage: "256GB",
        color: "Phantom Black",
        battery: "Optimal (92%)",
        image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80",
        inspectionCertId: "CERT-739104",
      },
    ],
  },
];

export async function createOrder(orderData) {
  const apiResult = await apiPost("/orders", orderData).catch(() => null);
  if (apiResult?.orderId) {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(apiResult));
    }
    return apiResult;
  }

  const orderNumber = orderData.orderId || "ORD-" + Math.floor(100000 + Math.random() * 900000);
  const order = {
    ...orderData,
    orderId: orderNumber,
    placedAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    window.localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(order));
  }

  return order;
}

export async function getLatestOrder() {
  const apiResult = await apiGet("/orders/latest").catch(() => null);
  if (apiResult) return apiResult;

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

export async function getUserOrders() {
  const apiResult = await apiGet("/orders").catch(() => null);
  if (Array.isArray(apiResult)) return apiResult;

  const latest = await getLatestOrder();
  if (latest && latest.orderId) {
    return [latest, ...demoOrderHistory.filter((o) => o.orderId !== latest.orderId)];
  }

  return demoOrderHistory;
}

