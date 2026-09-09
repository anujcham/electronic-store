"use client";

import { createContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "electroVault.wishlist";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [items, setItems] = useState(() => {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const storedWishlist = window.localStorage.getItem(STORAGE_KEY);

      if (!storedWishlist) {
        return [];
      }

      const parsedWishlist = JSON.parse(storedWishlist);

      if (Array.isArray(parsedWishlist)) {
        return parsedWishlist.filter((item) => item !== null && item !== undefined);
      }
    } catch {
      // Ignore invalid persisted wishlist data.
    }

    return [];
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore persistence errors in restricted environments.
    }
  }, [items]);

  const value = useMemo(() => ({
    items,
    wishlistCount: items.length,
    addItem: (product) => {
      const productId = product?.id;

      if (productId === undefined || productId === null) {
        return;
      }

      setItems((currentItems) => {
        if (currentItems.includes(productId)) {
          return currentItems;
        }

        return [...currentItems, productId];
      });
    },
    removeItem: (product) => {
      const productId = product?.id ?? product;

      if (productId === undefined || productId === null) {
        return;
      }

      setItems((currentItems) => currentItems.filter((item) => item !== productId));
    },
    toggleWishlist: (product) => {
      const productId = product?.id;

      if (productId === undefined || productId === null) {
        return;
      }

      setItems((currentItems) => {
        if (currentItems.includes(productId)) {
          return currentItems.filter((item) => item !== productId);
        }

        return [...currentItems, productId];
      });
    },
    isWishlisted: (product) => {
      const productId = product?.id ?? product;

      if (productId === undefined || productId === null) {
        return false;
      }

      return items.includes(productId);
    },
  }), [items]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export { WishlistContext };
