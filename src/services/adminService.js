import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from "./apiClient";

export async function fetchAdminOrders() {
  try {
    const res = await apiGet("/orders");
    if (res?.success && Array.isArray(res.orders)) {
      return res.orders;
    }
  } catch (err) {
    console.error("Error fetching admin orders:", err);
  }
  return [];
}

export async function updateOrderFulfillment({ orderId, orderNumber, orderStatus, trackingNumber, courierName, estimatedDelivery }) {
  try {
    const payload = {
      ...(orderId ? { orderId } : { orderNumber }),
      ...(orderStatus ? { orderStatus } : {}),
      ...(trackingNumber !== undefined ? { trackingNumber } : {}),
      ...(courierName !== undefined ? { courierName } : {}),
      ...(estimatedDelivery !== undefined ? { estimatedDelivery } : {}),
    };

    const res = await apiPatch("/orders", payload);
    if (res?.success) {
      return { success: true, order: res.order };
    }
    return { success: false, error: res?.error || "Failed to update order status." };
  } catch (err) {
    return { success: false, error: err.message || "Network error updating order." };
  }
}

export async function fetchAdminProducts() {
  try {
    const res = await apiGet("/products?limit=200");
    if (res?.success && Array.isArray(res.products)) {
      return res.products;
    }
  } catch (err) {
    console.error("Error fetching admin products:", err);
  }
  return [];
}

export async function createAdminProduct(productData) {
  try {
    const res = await apiPost("/products", productData);
    if (res?.success && res.product) {
      return { success: true, product: res.product };
    }
    return { success: false, error: res?.error || "Failed to create product." };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function updateAdminProduct(slug, updateData) {
  try {
    const res = await apiPut(`/products/${slug}`, updateData);
    if (res?.success && res.product) {
      return { success: true, product: res.product };
    }
    return { success: false, error: res?.error || "Failed to update product." };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function deleteAdminProduct(slug) {
  try {
    const res = await apiDelete(`/products/${slug}`);
    if (res?.success) {
      return { success: true };
    }
    return { success: false, error: res?.error || "Failed to delete product." };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function fetchAdminUsers() {
  try {
    const res = await apiGet("/admin/users");
    if (res?.success && Array.isArray(res.users)) {
      return res.users;
    }
  } catch (err) {
    console.error("Error fetching admin users:", err);
  }
  return [];
}
