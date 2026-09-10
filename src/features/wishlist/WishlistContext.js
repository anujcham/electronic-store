"use client";

import { createContext, useEffect, useMemo, useState, useCallback } from "react";
import { apiGet, apiPost } from "../../services/apiClient";
import { getCurrentUser } from "../../services/authService";

const STORAGE_KEY = "electroVault.wishlist";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Helper to normalize product item object for wishlist storage
  const normalizeItem = useCallback((product) => {
    if (!product) return null;
    const id = product.id || product._id || product.slug;
    return {
      id: String(id),
      slug: product.slug || String(id),
      name: product.name || product.title || "Refurbished Smartphone",
      price: product.price || 0,
      originalPrice: product.originalPrice || product.price || 0,
      image: Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : (product.image || ""),
      addedAt: product.addedAt || new Date().toISOString(),
    };
  }, []);

  // Sync wishlist from MongoDB or LocalStorage
  const loadWishlistData = useCallback(async () => {
    const user = await getCurrentUser();
    setCurrentUser(user);

    let localItems = [];
    if (typeof window !== "undefined") {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            localItems = parsed.map((item) => (typeof item === "string" ? { id: item, slug: item } : item)).filter(Boolean);
          }
        }
      } catch {}
    }

    if (user) {
      try {
        const res = await apiGet(`/wishlist?userId=${user.id || user._id}`);
        let dbItems = (res?.success && Array.isArray(res.items)) ? res.items : [];
        
        // Merge guest localStorage items with user's MongoDB wishlist items
        if (localItems.length > 0) {
          const mergedMap = new Map();
          dbItems.forEach((item) => {
            const key = item.slug || item.id;
            if (key) mergedMap.set(String(key), item);
          });
          localItems.forEach((item) => {
            const key = item.slug || item.id;
            if (key && !mergedMap.has(String(key))) {
              mergedMap.set(String(key), item);
            }
          });
          dbItems = Array.from(mergedMap.values());
          
          // Clear guest local storage once merged
          if (typeof window !== "undefined") {
            window.localStorage.removeItem(STORAGE_KEY);
          }
          
          // Persist merged wishlist to MongoDB
          await apiPost("/wishlist", {
            userId: user.id || user._id,
            items: dbItems,
          });
        }

        setItems(dbItems);
      } catch (e) {
        console.error("Wishlist sync error:", e);
        setItems(localItems);
      }
    } else {
      setItems(localItems);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    loadWishlistData();

    function handleAuthChange() {
      loadWishlistData();
    }

    if (typeof window !== "undefined") {
      window.addEventListener("electroVault-user-changed", handleAuthChange);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("electroVault-user-changed", handleAuthChange);
      }
    };
  }, [loadWishlistData]);

  // Save changes to MongoDB or LocalStorage
  useEffect(() => {
    if (!hydrated) return;

    if (currentUser) {
      apiPost("/wishlist", {
        userId: currentUser.id || currentUser._id,
        items,
      }).catch(() => null);
    } else if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch {}
    }
  }, [hydrated, items, currentUser]);

  const isWishlisted = useCallback((productOrId) => {
    if (!productOrId) return false;
    const targetId = String(productOrId.id || productOrId._id || productOrId.slug || productOrId);
    return items.some((item) => String(item.id || item.slug) === targetId);
  }, [items]);

  const addItem = useCallback((product) => {
    const normalized = normalizeItem(product);
    if (!normalized) return;

    setItems((prev) => {
      if (prev.some((item) => String(item.id || item.slug) === normalized.id)) {
        return prev;
      }
      return [...prev, normalized];
    });
  }, [normalizeItem]);

  const removeItem = useCallback((productOrId) => {
    if (!productOrId) return;
    const targetId = String(productOrId.id || productOrId._id || productOrId.slug || productOrId);
    setItems((prev) => prev.filter((item) => String(item.id || item.slug) !== targetId));
  }, []);

  const toggleWishlist = useCallback((product) => {
    if (!product) return;
    const targetId = String(product.id || product._id || product.slug || product);
    const exists = items.some((item) => String(item.id || item.slug) === targetId);

    if (exists) {
      removeItem(product);
    } else {
      addItem(product);
    }
  }, [items, addItem, removeItem]);

  const clearWishlist = useCallback(() => {
    setItems([]);
  }, []);

  const value = useMemo(
    () => ({
      items,
      wishlistCount: items.length,
      addItem,
      removeItem,
      toggleWishlist,
      isWishlisted,
      clearWishlist,
    }),
    [items, addItem, removeItem, toggleWishlist, isWishlisted, clearWishlist]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export { WishlistContext };
