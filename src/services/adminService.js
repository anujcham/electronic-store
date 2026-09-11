import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from "./apiClient";

export async function fetchAdminOrders(params = {}) {
  try {
    const query = new URLSearchParams();
    if (params.search && params.search.trim()) query.set("search", params.search.trim());
    if (params.status && params.status !== "all") query.set("status", params.status);
    const queryString = query.toString();
    const endpoint = queryString ? `/orders?${queryString}` : "/orders";
    const res = await apiGet(endpoint);
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

export async function fetchAdminProducts(params = {}) {
  try {
    const query = new URLSearchParams();
    query.set("limit", params.limit || "200");
    if (params.search && params.search.trim()) query.set("search", params.search.trim());
    if (params.brand && params.brand !== "all") query.set("brand", params.brand);
    const queryString = query.toString();
    const res = await apiGet(`/products?${queryString}`);
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

export async function fetchAdminUsers(params = {}) {
  try {
    const query = new URLSearchParams();
    if (params.search && params.search.trim()) query.set("search", params.search.trim());
    const queryString = query.toString();
    const endpoint = queryString ? `/admin/users?${queryString}` : "/admin/users";
    const res = await apiGet(endpoint);
    if (res?.success && Array.isArray(res.users)) {
      return res.users;
    }
  } catch (err) {
    console.error("Error fetching admin users:", err);
  }
  return [];
}

export async function adminStaffLogin({ email, password }) {
  try {
    const res = await apiPost("/admin/login", { email, password });
    if (res?.success && res.user) {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("electroVault.adminUser", JSON.stringify(res.user));
        if (res.token) {
          window.localStorage.setItem("electroVault.adminAuthToken", res.token);
        }
      }
      return { success: true, user: res.user };
    }
    return { success: false, error: res?.error || "Staff login failed." };
  } catch (err) {
    return { success: false, error: err.message || "Network error logging in staff." };
  }
}

export async function fetchAdminStaffList(params = {}) {
  try {
    const query = new URLSearchParams();
    if (params.search && params.search.trim()) query.set("search", params.search.trim());
    const queryString = query.toString();
    const endpoint = queryString ? `/admin/staff?${queryString}` : "/admin/staff";
    const res = await apiGet(endpoint);
    if (res?.success && Array.isArray(res.staff)) {
      return res.staff;
    }
  } catch (err) {
    console.error("Error fetching admin staff list:", err);
  }
  return [];
}

export async function createAdminStaffAccount({ name, email, password, phone, requesterEmail }) {
  try {
    const res = await apiPost("/admin/staff", { name, email, password, phone, requesterEmail });
    if (res?.success && res.staff) {
      return { success: true, staff: res.staff, message: res.message };
    }
    return { success: false, error: res?.error || "Failed to create Admin account." };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

