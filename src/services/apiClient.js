/**
 * Centralized API Client Abstraction
 * Pointing directly to our Next.js App Router live backend API endpoints (/api)
 * Features automatic JWT Authorization headers, cookie credentials, and silent token refresh on 401
 */

export const USE_MOCK_API = false;
export const API_BASE_URL = "/api";

let isRefreshingCustomer = false;
let isRefreshingAdmin = false;
let customerRefreshSubscribers = [];
let adminRefreshSubscribers = [];

function subscribeCustomerRefresh(cb) {
  customerRefreshSubscribers.push(cb);
}

function onCustomerRefreshed(token) {
  customerRefreshSubscribers.forEach((cb) => cb(token));
  customerRefreshSubscribers = [];
}

function subscribeAdminRefresh(cb) {
  adminRefreshSubscribers.push(cb);
}

function onAdminRefreshed(token) {
  adminRefreshSubscribers.forEach((cb) => cb(token));
  adminRefreshSubscribers = [];
}

/**
 * Generic HTTP Fetch wrapper for API integration with automatic silent refresh
 */
export async function apiRequest(endpoint, options = {}) {
  const isAdminRequest = endpoint.startsWith("/admin");
  const isAuthEndpoint =
    endpoint.includes("/login") ||
    endpoint.includes("/register") ||
    endpoint.includes("/refresh") ||
    endpoint.includes("/logout");

  let token = null;
  if (typeof window !== "undefined") {
    token = isAdminRequest
      ? window.localStorage.getItem("electroVault.adminAuthToken")
      : window.localStorage.getItem("electroVault.authToken");
  }

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const url = `${API_BASE_URL}${endpoint}`;
  
  // Include credentials for HttpOnly cookie exchange
  const fetchConfig = {
    ...options,
    credentials: "include",
    headers,
  };

  const response = await fetch(url, fetchConfig);
  const data = await response.json().catch(() => ({}));

  // Handle 401 Unauthorized with Automatic Silent Refresh
  if (response.status === 401 && !isAuthEndpoint) {
    if (isAdminRequest) {
      // Attempt silent refresh for Admin Staff
      if (!isRefreshingAdmin) {
        isRefreshingAdmin = true;
        try {
          const refreshRes = await fetch(`${API_BASE_URL}/admin/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          });
          const refreshData = await refreshRes.json().catch(() => ({}));

          if (refreshRes.ok && refreshData.success && refreshData.accessToken) {
            if (typeof window !== "undefined") {
              window.localStorage.setItem("electroVault.adminAuthToken", refreshData.accessToken);
              if (refreshData.user) {
                window.localStorage.setItem("electroVault.adminUser", JSON.stringify(refreshData.user));
              }
            }
            onAdminRefreshed(refreshData.accessToken);
            // Retry original request
            return apiRequest(endpoint, {
              ...options,
              headers: { ...options.headers, Authorization: `Bearer ${refreshData.accessToken}` },
            });
          } else {
            // Admin refresh failed: session expired
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("electroVault-admin-session-expired", { detail: { reason: "expired" } }));
            }
          }
        } catch (err) {
          console.error("Admin silent refresh failed:", err);
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("electroVault-admin-session-expired", { detail: { reason: "network" } }));
          }
        } finally {
          isRefreshingAdmin = false;
        }
      } else {
        // Queue until ongoing admin refresh finishes
        return new Promise((resolve) => {
          subscribeAdminRefresh((newToken) => {
            resolve(
              apiRequest(endpoint, {
                ...options,
                headers: { ...options.headers, Authorization: `Bearer ${newToken}` },
              })
            );
          });
        });
      }
    } else {
      // Attempt silent refresh for Customer
      if (!isRefreshingCustomer) {
        isRefreshingCustomer = true;
        try {
          const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          });
          const refreshData = await refreshRes.json().catch(() => ({}));

          if (refreshRes.ok && refreshData.success && refreshData.accessToken) {
            if (typeof window !== "undefined") {
              window.localStorage.setItem("electroVault.authToken", refreshData.accessToken);
              if (refreshData.user) {
                window.localStorage.setItem("electroVault.user", JSON.stringify(refreshData.user));
              }
            }
            onCustomerRefreshed(refreshData.accessToken);
            // Retry original request
            return apiRequest(endpoint, {
              ...options,
              headers: { ...options.headers, Authorization: `Bearer ${refreshData.accessToken}` },
            });
          } else {
            // Customer refresh failed
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("electroVault-session-expired"));
            }
          }
        } catch (err) {
          console.error("Customer silent refresh failed:", err);
        } finally {
          isRefreshingCustomer = false;
        }
      } else {
        return new Promise((resolve) => {
          subscribeCustomerRefresh((newToken) => {
            resolve(
              apiRequest(endpoint, {
                ...options,
                headers: { ...options.headers, Authorization: `Bearer ${newToken}` },
              })
            );
          });
        });
      }
    }
  }

  if (!response.ok) {
    throw new Error(data.error || data.message || `API Error: ${response.status} ${response.statusText}`);
  }

  return data;
}

export function apiGet(endpoint) {
  return apiRequest(endpoint, { method: "GET" });
}

export function apiPost(endpoint, data) {
  return apiRequest(endpoint, { method: "POST", body: JSON.stringify(data) });
}

export function apiPut(endpoint, data) {
  return apiRequest(endpoint, { method: "PUT", body: JSON.stringify(data) });
}

export function apiPatch(endpoint, data) {
  return apiRequest(endpoint, { method: "PATCH", body: JSON.stringify(data) });
}

export function apiDelete(endpoint) {
  return apiRequest(endpoint, { method: "DELETE" });
}
