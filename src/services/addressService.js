import { apiGet, apiPost, apiDelete } from "./apiClient";

const SAVED_ADDRESSES_STORAGE_KEY = "electroVault.savedAddresses";

export const defaultSavedAddresses = [
  {
    id: "addr-1",
    label: "Home Address",
    isDefault: true,
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.co.uk",
    phone: "+44 7700 900077",
    address: "124 High Street, Suite 4B",
    city: "London",
    postcode: "SW1A 1AA",
    country: "United Kingdom",
  },
  {
    id: "addr-2",
    label: "Office / Work",
    isDefault: false,
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@techcorp.co.uk",
    phone: "+44 7700 900888",
    address: "45 Innovation Way, Floor 3",
    city: "Manchester",
    postcode: "M1 4BT",
    country: "United Kingdom",
  },
];

export async function getSavedAddresses() {
  const apiResult = await apiGet("/user/addresses").catch(() => null);
  if (Array.isArray(apiResult) && apiResult.length > 0) return apiResult;

  if (typeof window !== "undefined") {
    try {
      const stored = window.localStorage.getItem(SAVED_ADDRESSES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
  }

  return defaultSavedAddresses;
}

export async function saveAddress(addressData) {
  const apiResult = await apiPost("/user/addresses", addressData).catch(() => null);
  if (apiResult?.id) return apiResult;

  const currentList = await getSavedAddresses();
  let updatedList = [];

  if (addressData.id) {
    // Edit existing address
    updatedList = currentList.map((item) =>
      item.id === addressData.id
        ? { ...item, ...addressData }
        : addressData.isDefault
        ? { ...item, isDefault: false }
        : item
    );
  } else {
    // Add new address
    const newAddressItem = {
      id: "addr-" + Date.now(),
      ...addressData,
    };
    if (addressData.isDefault) {
      updatedList = currentList.map((item) => ({ ...item, isDefault: false }));
      updatedList.push(newAddressItem);
    } else {
      updatedList = [...currentList, newAddressItem];
    }
  }

  if (typeof window !== "undefined") {
    window.localStorage.setItem(SAVED_ADDRESSES_STORAGE_KEY, JSON.stringify(updatedList));
  }

  return updatedList;
}

export async function deleteAddress(addressId) {
  await apiDelete(`/user/addresses/${addressId}`).catch(() => null);

  const currentList = await getSavedAddresses();
  const updatedList = currentList.filter((item) => item.id !== addressId);

  if (typeof window !== "undefined") {
    window.localStorage.setItem(SAVED_ADDRESSES_STORAGE_KEY, JSON.stringify(updatedList));
  }

  return updatedList;
}

