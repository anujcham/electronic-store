/**
 * Centralized API Client Abstraction
 * Pointing directly to our Next.js App Router live backend API endpoints (/api)
 */

export const USE_MOCK_API = false;
export const API_BASE_URL = "/api";

/**
 * Generic HTTP Fetch wrapper for API integration
 */
export async function apiRequest(endpoint, options = {}) {
  const token = typeof window !== "undefined" ? window.localStorage.getItem("electroVault.authToken") : null;

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

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
