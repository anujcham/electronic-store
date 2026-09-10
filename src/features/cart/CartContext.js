"use client";

import { createContext, useEffect, useMemo, useReducer, useState, useCallback } from "react";
import { apiGet, apiPost } from "../../services/apiClient";
import { getCurrentUser } from "../../services/authService";
import {
  STORAGE_KEY,
  addItemToCart,
  clearCartItems,
  decreaseQuantity,
  getCartTotals,
  increaseQuantity,
  removeItemFromCart,
  setItemQuantity,
} from "./cartUtils";

const initialState = {
  items: [],
};

const CartContext = createContext(null);

function cartReducer(state, action) {
  switch (action.type) {
    case "HYDRATE": {
      return {
        items: Array.isArray(action.payload.items) ? action.payload.items : [],
      };
    }
    case "ADD_ITEM": {
      return {
        items: addItemToCart(
          state.items,
          action.payload.product,
          action.payload.selectedOptions,
          action.payload.quantity
        ),
      };
    }
    case "REMOVE_ITEM": {
      return {
        items: removeItemFromCart(state.items, action.payload.itemKey),
      };
    }
    case "INCREASE_QUANTITY": {
      return {
        items: increaseQuantity(state.items, action.payload.itemKey),
      };
    }
    case "DECREASE_QUANTITY": {
      return {
        items: decreaseQuantity(state.items, action.payload.itemKey),
      };
    }
    case "SET_QUANTITY": {
      return {
        items: setItemQuantity(
          state.items,
          action.payload.itemKey,
          action.payload.quantity
        ),
      };
    }
    case "CLEAR_CART": {
      return {
        items: clearCartItems(),
      };
    }
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [hydrated, setHydrated] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const openCartDrawer = useCallback(() => setIsCartDrawerOpen(true), []);
  const closeCartDrawer = useCallback(() => setIsCartDrawerOpen(false), []);
  const toggleCartDrawer = useCallback(() => setIsCartDrawerOpen((prev) => !prev), []);

  // Listen for auth changes and sync cart from MongoDB
  useEffect(() => {
    async function loadCartData() {
      const user = await getCurrentUser();
      setCurrentUser(user);

      if (user) {
        try {
          const res = await apiGet(`/cart?userId=${user.id || user._id}`);
          if (res?.success && Array.isArray(res.items) && res.items.length > 0) {
            dispatch({ type: "HYDRATE", payload: { items: res.items } });
          }
        } catch (e) {
          console.error("Cart sync error:", e);
        }
      } else {
        if (typeof window !== "undefined") {
          try {
            const storedCart = window.localStorage.getItem(STORAGE_KEY);
            if (storedCart) {
              const parsed = JSON.parse(storedCart);
              if (parsed && Array.isArray(parsed.items)) {
                dispatch({ type: "HYDRATE", payload: { items: parsed.items } });
              }
            }
          } catch {}
        }
      }
      setHydrated(true);
    }

    loadCartData();

    function handleAuthChange() {
      loadCartData();
    }

    if (typeof window !== "undefined") {
      window.addEventListener("electroVault-user-changed", handleAuthChange);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("electroVault-user-changed", handleAuthChange);
      }
    };
  }, []);

  // Persist cart to MongoDB when logged in, or localStorage when guest
  useEffect(() => {
    if (!hydrated) return;

    if (currentUser) {
      apiPost("/cart", {
        userId: currentUser.id || currentUser._id,
        items: state.items,
      }).catch(() => null);
    } else if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {}
    }
  }, [hydrated, state.items, currentUser]);

  const addItem = useCallback((product, selectedOptions = {}, quantity = 1) => {
    dispatch({
      type: "ADD_ITEM",
      payload: { product, selectedOptions, quantity },
    });
    setIsCartDrawerOpen(true);
  }, []);

  const removeItem = useCallback((itemKey) => {
    dispatch({
      type: "REMOVE_ITEM",
      payload: { itemKey },
    });
  }, []);

  const increaseQty = useCallback((itemKey) => {
    dispatch({
      type: "INCREASE_QUANTITY",
      payload: { itemKey },
    });
  }, []);

  const decreaseQty = useCallback((itemKey) => {
    dispatch({
      type: "DECREASE_QUANTITY",
      payload: { itemKey },
    });
  }, []);

  const setQty = useCallback((itemKey, quantity) => {
    dispatch({
      type: "SET_QUANTITY",
      payload: { itemKey, quantity },
    });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" });
  }, []);

  const totals = useMemo(() => getCartTotals(state.items), [state.items]);

  const value = useMemo(() => {
    return {
      items: state.items,
      itemCount: totals.itemCount,
      subtotal: totals.subtotal,
      totalPrice: totals.totalPrice,
      totalItems: totals.totalItems,
      isCartDrawerOpen,
      openCartDrawer,
      closeCartDrawer,
      toggleCartDrawer,
      addItem,
      removeItem,
      increaseQuantity: increaseQty,
      decreaseQuantity: decreaseQty,
      setQuantity: setQty,
      clearCart,
    };
  }, [
    state.items,
    totals,
    isCartDrawerOpen,
    openCartDrawer,
    closeCartDrawer,
    toggleCartDrawer,
    addItem,
    removeItem,
    increaseQty,
    decreaseQty,
    setQty,
    clearCart,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export { CartContext };
