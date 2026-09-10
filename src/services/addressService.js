import { apiGet, apiPost, apiDelete, apiPut } from "./apiClient";

export async function getSavedAddresses(userId) {
  if (!userId) return [];
  try {
    const apiResult = await apiGet(`/user/addresses?userId=${userId}`);
    if (apiResult?.success && Array.isArray(apiResult.addresses)) {
      return apiResult.addresses;
    }
  } catch (error) {
    console.error("Error fetching addresses:", error);
  }
  return [];
}

export async function saveAddress(userId, addressData) {
  try {
    const apiResult = await apiPost("/user/addresses", {
      userId,
      ...addressData,
    });
    if (apiResult?.success && Array.isArray(apiResult.addresses)) {
      return { success: true, addresses: apiResult.addresses, message: apiResult.message };
    }
    return {
      success: false,
      error: apiResult?.message || apiResult?.error || "Unable to save address. Please check your details.",
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Unable to save address. Please try again.",
    };
  }
}

export async function deleteAddress(userId, addressId) {
  try {
    const apiResult = await apiDelete(`/user/addresses?userId=${userId}&addressId=${addressId}`);
    if (apiResult?.success && Array.isArray(apiResult.addresses)) {
      return { success: true, addresses: apiResult.addresses, message: apiResult.message };
    }
    return {
      success: false,
      error: apiResult?.message || apiResult?.error || "Unable to delete address.",
    };
  } catch (error) {
    return { success: false, error: error.message || "Unable to delete address." };
  }
}

export async function setDefaultAddress(userId, addressId) {
  try {
    const apiResult = await apiPut("/user/addresses", { userId, addressId });
    if (apiResult?.success && Array.isArray(apiResult.addresses)) {
      return { success: true, addresses: apiResult.addresses, message: apiResult.message };
    }
    return {
      success: false,
      error: apiResult?.message || apiResult?.error || "Unable to set default address.",
    };
  } catch (error) {
    return { success: false, error: error.message || "Unable to set default address." };
  }
}
