export const STORAGE_KEY = "electroVault.cart";

const getOptionValue = (value, fallback) => value ?? fallback;

export function buildCartItemKey(product, selectedOptions = {}) {
  const keyParts = [
    product?.slug,
    selectedOptions.condition,
    selectedOptions.battery,
    selectedOptions.storage,
    selectedOptions.color,
    selectedOptions.sim,
  ].filter(Boolean);

  return keyParts.length ? keyParts.join("|") : product?.slug || "cart-item";
}

export function createCartItem(product, selectedOptions = {}, quantity = 1) {
  const normalizedOptions = {
    condition: getOptionValue(selectedOptions.condition, product?.condition ?? null),
    battery: getOptionValue(selectedOptions.battery, product?.batteryOptions?.[0] ?? null),
    storage: getOptionValue(
      selectedOptions.storage,
      product?.storage ?? product?.availableStorage?.[0] ?? null
    ),
    color: getOptionValue(
      selectedOptions.color,
      product?.color ?? product?.availableColors?.[0] ?? null
    ),
    sim: getOptionValue(selectedOptions.sim, product?.simOptions?.[0] ?? "Single SIM"),
  };

  const stock = Math.max(0, Number(selectedOptions.stock ?? product?.stock ?? 0));
  const price = Number(selectedOptions.price ?? product?.price ?? 0);
  const originalPrice = Number(
    selectedOptions.originalPrice ?? product?.originalPrice ?? price
  );

  const safeQuantity = Math.max(
    1,
    Math.min(Number(quantity) || 1, stock > 0 ? stock : 1)
  );

  return {
    id: product?.id,
    slug: product?.slug,
    name: product?.name,
    brand: product?.brand,
    image: selectedOptions.image || product?.images?.[0] || "",
    price,
    originalPrice,
    stock,
    quantity: safeQuantity,
    itemKey: buildCartItemKey(product, normalizedOptions),
    selectedOptions: normalizedOptions,
    category: product?.category,
    condition: normalizedOptions.condition,
    battery: normalizedOptions.battery,
    storage: normalizedOptions.storage,
    color: normalizedOptions.color,
    sim: normalizedOptions.sim,
    deliveryRange: selectedOptions.deliveryRange ?? product?.deliveryRange ?? "2-4 working days",
    warrantyMonths: Number(selectedOptions.warrantyMonths ?? product?.warrantyMonths ?? 12),
    shippingIncluded: selectedOptions.shippingIncluded ?? product?.shippingIncluded ?? true,
  };
}

export function addItemToCart(items, product, selectedOptions = {}, quantity = 1) {
  const stock = Math.max(0, Number(selectedOptions.stock ?? product?.stock ?? 0));

  if (stock <= 0) {
    return items;
  }

  const nextItem = createCartItem(product, selectedOptions, quantity);
  const existingIndex = items.findIndex((item) => item.itemKey === nextItem.itemKey);

  if (existingIndex === -1) {
    return [...items, nextItem];
  }

  const existingItem = items[existingIndex];
  const stockLimit = Math.max(1, Number(existingItem.stock || nextItem.stock || 1));
  const mergedQuantity = Math.min(stockLimit, existingItem.quantity + nextItem.quantity);

  return items.map((item, index) =>
    index === existingIndex
      ? { ...item, quantity: mergedQuantity, stock: stockLimit }
      : item
  );
}

export function removeItemFromCart(items, itemKey) {
  return items.filter((item) => item.itemKey !== itemKey);
}

export function increaseQuantity(items, itemKey) {
  return items.map((item) => {
    if (item.itemKey !== itemKey) {
      return item;
    }

    const stockLimit = Math.max(1, Number(item.stock || 1));
    return { ...item, quantity: Math.min(stockLimit, item.quantity + 1) };
  });
}

export function decreaseQuantity(items, itemKey) {
  return items.flatMap((item) => {
    if (item.itemKey !== itemKey) {
      return [item];
    }

    if (item.quantity <= 1) {
      return [];
    }

    return [{ ...item, quantity: item.quantity - 1 }];
  });
}

export function setItemQuantity(items, itemKey, quantity) {
  if (quantity <= 0) {
    return removeItemFromCart(items, itemKey);
  }

  const safeQuantity = Math.max(1, Number(quantity) || 1);

  return items.map((item) => {
    if (item.itemKey !== itemKey) {
      return item;
    }

    const stockLimit = Math.max(1, Number(item.stock || 1));

    return {
      ...item,
      quantity: Math.min(safeQuantity, stockLimit),
    };
  });
}

export function clearCartItems() {
  return [];
}

export function getCartTotals(items) {
  const itemCount = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  return {
    itemCount,
    subtotal,
    totalItems: itemCount,
    totalPrice: subtotal,
  };
}
