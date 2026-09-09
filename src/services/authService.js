import { apiGet, apiPost } from "./apiClient";

const USER_STORAGE_KEY = "electroVault.user";

export const defaultDemoUser = {
  id: "user-101",
  name: "John Doe",
  email: "john.doe@example.co.uk",
  phone: "+44 7700 900077",
  memberSince: "January 2024",
  isVerified: true,
};

function notifyUserChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("electroVault-user-changed"));
  }
}

export async function getCurrentUser() {
  const apiResult = await apiGet("/auth/me").catch(() => null);
  if (apiResult) return apiResult;

  if (typeof window !== "undefined") {
    try {
      const stored = window.localStorage.getItem(USER_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }
  return null;
}

export async function loginUser({ email, password }) {
  const apiResult = await apiPost("/auth/login", { email, password }).catch(() => null);
  if (apiResult?.user) {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(apiResult.user));
      if (apiResult.token) {
        window.localStorage.setItem("electroVault.authToken", apiResult.token);
      }
    }
    notifyUserChanged();
    return apiResult.user;
  }

  // Fallback demo authentication
  const user = {
    id: "user-" + Date.now(),
    name: email.split("@")[0].replace(".", " ") || "John Doe",
    email: email || "john.doe@example.co.uk",
    phone: "+44 7700 900077",
    memberSince: "Just Now",
    isVerified: true,
  };

  if (typeof window !== "undefined") {
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }
  notifyUserChanged();
  return user;
}

export async function loginDemoUser() {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(defaultDemoUser));
  }
  notifyUserChanged();
  return defaultDemoUser;
}

export async function registerUser(userData) {
  const apiResult = await apiPost("/auth/register", userData).catch(() => null);
  if (apiResult?.user) {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(apiResult.user));
    }
    notifyUserChanged();
    return apiResult.user;
  }

  const user = {
    id: "user-" + Date.now(),
    name: userData.name || "John Doe",
    email: userData.email || "john.doe@example.co.uk",
    phone: userData.phone || "+44 7700 900077",
    memberSince: "Just Now",
    isVerified: true,
  };

  if (typeof window !== "undefined") {
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }
  notifyUserChanged();
  return user;
}

export async function logoutUser() {
  await apiPost("/auth/logout", {}).catch(() => null);

  if (typeof window !== "undefined") {
    window.localStorage.removeItem(USER_STORAGE_KEY);
    window.localStorage.removeItem("electroVault.authToken");
  }
  notifyUserChanged();
  return true;
}

