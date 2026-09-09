/**
 * Centralized API Client Abstraction
 * Switch USE_MOCK_API = false or set NEXT_PUBLIC_API_URL to point to a live backend.
 */

export const USE_MOCK_API = true;
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.electronicstore.co.uk/v1";

/**
 * Generic HTTP Fetch wrapper for API integration
 */
export async function apiRequest(endpoint, options = {}) {
  if (USE_MOCK_API) {
    // Returns null to signal services to use local fallback logic during demo/offline state
    return null;
  }

  const token = typeof window !== "undefined" ? window.localStorage.getItem("electroVault.authToken") : null;

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
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

export function apiDelete(endpoint) {
  return apiRequest(endpoint, { method: "DELETE" });
}

