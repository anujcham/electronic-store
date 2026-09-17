import { apiGet, apiPost } from "./apiClient";

const USER_STORAGE_KEY = "electroVault.user";
const AUTH_TOKEN_KEY = "electroVault.authToken";

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
        const token = apiResult.accessToken || apiResult.token;
        if (token) {
          window.localStorage.setItem(AUTH_TOKEN_KEY, token);
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
        otp: apiResult.otp,
      };
    }
    return { success: false, error: apiResult?.error || "Registration failed." };
  } catch (err) {
    return { success: false, error: err.message || "Registration failed." };
  }
}

export async function sendOtpApi({ email, phone }) {
  try {
    const result = await apiPost("/auth/send-otp", { email, phone });
    return result;
  } catch (err) {
    return { success: false, error: err.message || "Failed to send OTP code." };
  }
}

export async function verifyOtpApi({ email, phone, otp }) {
  try {
    const apiResult = await apiPost("/auth/verify-otp", { email, phone, otp });
    if (apiResult?.success) {
      if (!apiResult.isNewUser && apiResult.user) {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(apiResult.user));
          const token = apiResult.accessToken || apiResult.token;
          if (token) {
            window.localStorage.setItem(AUTH_TOKEN_KEY, token);
          }
        }
        notifyUserChanged();
      }
      return apiResult;
    }
    return { success: false, error: apiResult?.error || "Invalid OTP entered." };
  } catch (err) {
    return { success: false, error: err.message || "OTP verification failed." };
  }
}

export async function completeSignupApi({ name, firstName, lastName, email, phone }) {
  try {
    const apiResult = await apiPost("/auth/complete-signup", { name, firstName, lastName, email, phone });
    if (apiResult?.success && apiResult?.user) {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(apiResult.user));
        const token = apiResult.accessToken || apiResult.token;
        if (token) {
          window.localStorage.setItem(AUTH_TOKEN_KEY, token);
        }
      }
      notifyUserChanged();
      return apiResult;
    }
    return { success: false, error: apiResult?.error || "Failed to complete signup." };
  } catch (err) {
    return { success: false, error: err.message || "Failed to complete signup." };
  }
}

export async function logoutUser() {
  try {
    await apiPost("/auth/logout", {});
  } catch (err) {
    console.error("Logout request error:", err);
  } finally {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(USER_STORAGE_KEY);
      window.localStorage.removeItem(AUTH_TOKEN_KEY);
    }
    notifyUserChanged();
  }
  return true;
}
