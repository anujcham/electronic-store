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
  try {
    const apiResult = await apiPost("/auth/login", { email, password });
    if (apiResult?.success && apiResult?.user) {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(apiResult.user));
        if (apiResult.token) {
          window.localStorage.setItem("electroVault.authToken", apiResult.token);
        }
      }
      notifyUserChanged();
      return { success: true, user: apiResult.user };
    }
    return { success: false, error: apiResult?.error || "Account not found or invalid credentials." };
  } catch (err) {
    return { success: false, error: err.message || "Invalid credentials. Please check or create an account." };
  }
}

export async function loginDemoUser() {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(defaultDemoUser));
  }
  notifyUserChanged();
  return defaultDemoUser;
}

export async function registerUser(userData) {
  try {
    const apiResult = await apiPost("/auth/register", userData);
    if (apiResult?.success) {
      return {
        success: true,
        user: apiResult.user,
        otp: apiResult.otp, // Dev OTP returned for instant testing
      };
    }
    return { success: false, error: apiResult?.error || "Registration failed." };
  } catch (err) {
    return { success: false, error: err.message || "Registration failed." };
  }
}

export async function sendOtpApi({ email, phone }) {
  try {
    return await apiPost("/auth/send-otp", { email, phone });
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function verifyOtpApi({ email, phone, otp }) {
  try {
    const apiResult = await apiPost("/auth/verify-otp", { email, phone, otp });
    if (apiResult?.success && apiResult?.user) {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(apiResult.user));
      }
      notifyUserChanged();
      return { success: true, user: apiResult.user };
    }
    return { success: false, error: apiResult?.error || "Invalid OTP entered." };
  } catch (err) {
    return { success: false, error: err.message || "OTP verification failed." };
  }
}

export async function logoutUser() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(USER_STORAGE_KEY);
    window.localStorage.removeItem("electroVault.authToken");
  }
  notifyUserChanged();
  return true;
}
