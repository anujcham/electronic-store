"use client";

import { createContext, useEffect, useMemo, useReducer, useState } from "react";

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

  const openCartDrawer = () => setIsCartDrawerOpen(true);
  const closeCartDrawer = () => setIsCartDrawerOpen(false);
  const toggleCartDrawer = () => setIsCartDrawerOpen((prev) => !prev);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const storedCart = window.localStorage.getItem(STORAGE_KEY);

      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);

        if (parsedCart && Array.isArray(parsedCart.items)) {
          dispatch({
            type: "HYDRATE",
            payload: { items: parsedCart.items },
          });
        }
      }
    } catch {
      // Ignore invalid persisted state.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore persistence errors in restricted environments.
    }
  }, [hydrated, state]);

  const value = useMemo(() => {
    const totals = getCartTotals(state.items);

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
      addItem: (product, selectedOptions = {}, quantity = 1) => {
        dispatch({
          type: "ADD_ITEM",
          payload: { product, selectedOptions, quantity },
        });
        setIsCartDrawerOpen(true);
      },
      removeItem: (itemKey) => {
        dispatch({
          type: "REMOVE_ITEM",
          payload: { itemKey },
        });
      },
      increaseQuantity: (itemKey) => {
        dispatch({
          type: "INCREASE_QUANTITY",
          payload: { itemKey },
        });
      },
      decreaseQuantity: (itemKey) => {
        dispatch({
          type: "DECREASE_QUANTITY",
          payload: { itemKey },
        });
      },
      setQuantity: (itemKey, quantity) => {
        dispatch({
          type: "SET_QUANTITY",
          payload: { itemKey, quantity },
        });
      },
      clearCart: () => {
        dispatch({ type: "CLEAR_CART" });
      },
    };
  }, [state.items, isCartDrawerOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export { CartContext };
