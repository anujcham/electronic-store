import {
  PRODUCT_CATEGORIES,
  PRODUCT_SUBCATEGORIES,
  PRODUCT_CONDITIONS,
  PRODUCT_TAGS,
} from "../constants/productConstants.js";

// Helper to determine color hex if not explicitly passed
const getColorHex = (colorName) => {
  if (!colorName) return "#64748b";
  const name = colorName.toLowerCase();
  if (name.includes("black") || name.includes("midnight") || name.includes("graphite") || name.includes("onyx") || name.includes("obsidian")) return "#0f172a";
  if (name.includes("white") || name.includes("starlight") || name.includes("silver") || name.includes("porcelain") || name.includes("snow")) return "#f8fafc";
  if (name.includes("blue") || name.includes("bay") || name.includes("pacific") || name.includes("sierra") || name.includes("icy")) return "#3b82f6";
  if (name.includes("green") || name.includes("emerald") || name.includes("mint") || name.includes("alpine") || name.includes("hazel")) return "#10b981";
  if (name.includes("red") || name.includes("product(red)")) return "#ef4444";
  if (name.includes("purple") || name.includes("lavender") || name.includes("violet") || name.includes("deep purple")) return "#a855f7";
  if (name.includes("gold") || name.includes("cream") || name.includes("yellow") || name.includes("amber") || name.includes("champagne")) return "#f59e0b";
  if (name.includes("pink") || name.includes("rose")) return "#ec4899";
  if (name.includes("natural titanium") || name.includes("titanium natural")) return "#9ca3af";
  if (name.includes("gray") || name.includes("grey") || name.includes("space") || name.includes("titanium")) return "#64748b";
  return "#94a3b8";
};

export const buildProduct = ({
  id,
  slug,
  name,
  brand,
  category = PRODUCT_CATEGORIES.SMARTPHONES,
  subcategory = PRODUCT_SUBCATEGORIES.SMARTPHONES,
  price,
  originalPrice,
  condition = PRODUCT_CONDITIONS.EXCELLENT,
  rating = 4.8,
  reviewCount = 50,
  images = [],
  shortDescription,
  description,
  storage,
  color,
  availableColors,
  availableStorage,
  stock = 15,
  featured = false,
  isHotDeal = false,
  tags = [],
  conditionOptions,
  batteryOptions,
  simOptions,
  specifications,
  shippingIncluded = true,
  deliveryRange = "2-4 working days",
  warrantyMonths = 12,
  colorVariants,
  variantPricing,
}) => {
  // Normalize colors & storage
  const normalizedColors =
    colorVariants && colorVariants.length
      ? colorVariants.map((c) => c.colorName)
      : availableColors && availableColors.length
      ? availableColors
      : [color].filter(Boolean);

  const normalizedStorage = availableStorage && availableStorage.length ? availableStorage : [storage].filter(Boolean);
  const normalizedConditions = conditionOptions && conditionOptions.length ? conditionOptions : ["Like New", "Excellent", "Very Good", "Good"];

  // Normalize colorVariants
  const normalizedColorVariants =
    colorVariants && colorVariants.length
      ? colorVariants.map((cv) => ({
          colorName: cv.colorName,
          hexCode: cv.hexCode || getColorHex(cv.colorName),
          images: Array.isArray(cv.images) && cv.images.length > 0 ? cv.images : images,
        }))
      : normalizedColors.map((colorName, idx) => ({
          colorName,
          hexCode: getColorHex(colorName),
          images: images && images.length > 0 ? images : ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80"],
        }));

  // Resolve primary product images if not provided
  const resolvedImages =
    images && images.length > 0
      ? images
      : normalizedColorVariants[0]?.images && normalizedColorVariants[0].images.length > 0
      ? normalizedColorVariants[0].images
      : ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80"];

  // Generate complete variant pricing matrix (Storage x Color x Condition)
  const generatedVariantPricing =
    variantPricing && variantPricing.length
      ? variantPricing
      : normalizedStorage.flatMap((storageOption, storageIndex) =>
          normalizedColors.flatMap((colorOption, colorIndex) =>
            normalizedConditions.map((condOption, condIndex) => {
              let condOffset = 0;
              const condLower = condOption.toLowerCase();
              if (condLower.includes("like new") || condLower.includes("superb") || condLower.includes("pristine")) {
                condOffset = 50;
              } else if (condLower.includes("excellent")) {
                condOffset = 25;
              } else if (condLower.includes("very good")) {
                condOffset = 10;
              } else {
                condOffset = 0;
              }

              const storageOffset = storageIndex * 40;
              const colorOffset = colorIndex * 5;

              const variantBasePrice = price + storageOffset + colorOffset + condOffset;
              const variantBaseOrig = originalPrice + storageOffset + colorOffset + condOffset;

              return {
                sku: `${slug}-${(colorOption || "std").toLowerCase().replace(/\s+/g, "-")}-${(storageOption || "base").toLowerCase()}-${condOption.toLowerCase().replace(/\s+/g, "-")}`,
                storage: storageOption || null,
                color: colorOption || null,
                condition: condOption,
                battery: batteryOptions?.[0] || "Optimal (85%+)",
                sim: simOptions?.[0] || "Single SIM",
                price: variantBasePrice,
                originalPrice: variantBaseOrig,
                stock: Math.max(1, (stock || 10) - storageIndex - colorIndex),
                isAvailable: true,
                warrantyMonths,
                deliveryRange,
                shippingIncluded,
              };
            })
          )
        );

  return {
    id,
    slug,
    name,
    brand,
    category,
    subcategory,
    price,
    originalPrice,
    discountPercentage: Math.round(((originalPrice - price) / originalPrice) * 100),
    condition,
    rating,
    reviewCount,
    images: resolvedImages,
    shortDescription,
    description,
    storage: normalizedStorage[0] || storage,
    color: normalizedColors[0] || color,
    availableColors: normalizedColors,
    availableStorage: normalizedStorage,
    stock,
    featured,
    isHotDeal,
    tags,
    conditionOptions: normalizedConditions,
    batteryOptions: batteryOptions || ["Optimal (85%+)", "New Replacement Battery (100%)"],
    simOptions: simOptions || ["Single SIM", "Dual-SIM (physical SIM + eSIM)"],
    specifications: specifications || {
      display: "Super Retina OLED Display, 120Hz ProMotion",
      processor: "Apple / Qualcomm Flagship Processor",
      camera: "High Resolution Multi-Lens System with Optical Zoom",
      batterySpec: "Guaranteed 85%+ Battery Health with Fast Charging",
      os: "Latest iOS / Android",
      network: "5G Cellular, Wi-Fi 6, Bluetooth 5.3",
      waterResistance: "IP68 Dust & Water Resistant",
    },
    shippingIncluded,
    deliveryRange,
    warrantyMonths,
    colorVariants: normalizedColorVariants,
    variantPricing: generatedVariantPricing,
  };
};

export const products = [
  // =========================================================================
  // 1. APPLE iPHONES
  // =========================================================================
  buildProduct({
    id: 1,
    slug: "iphone-15-pro-max-256gb-like-new",
    name: "iPhone 15 Pro Max",
    brand: "Apple",
    price: 899,
    originalPrice: 1199,
    condition: PRODUCT_CONDITIONS.LIKE_NEW,
    rating: 4.9,
    reviewCount: 210,
    shortDescription: "Grade A+ pristine condition iPhone 15 Pro Max with titanium finish and 5x optical zoom camera.",
    description:
      "A flagship pre-owned iPhone 15 Pro Max in pristine condition. Passes 50-point diagnostics with 95%+ battery health guaranteed. Includes 12-month seller warranty and original USB-C cable.",
    storage: "256GB",
    color: "Natural Titanium",
    availableStorage: ["256GB", "512GB", "1TB"],
    stock: 15,
    featured: true,
    isHotDeal: true,
    tags: [PRODUCT_TAGS.BESTSELLER, PRODUCT_TAGS.FLAGSHIP, PRODUCT_TAGS.APPLE],
    colorVariants: [
      {
        colorName: "Natural Titanium",
        hexCode: "#9ca3af",
        images: [
          "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&w=1200&q=80",
        ],
      },
      {
        colorName: "Black Titanium",
        hexCode: "#0f172a",
        images: [
          "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=1200&q=80",
        ],
      },
      {
        colorName: "Blue Titanium",
        hexCode: "#3b82f6",
        images: [
          "https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80",
        ],
      },
      {
        colorName: "White Titanium",
        hexCode: "#f8fafc",
        images: [
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&w=1200&q=80",
        ],
      },
    ],
    specifications: {
      display: "6.7-inch Super Retina XDR OLED (2796x1290 at 460 ppi, 120Hz ProMotion)",
      processor: "Apple A17 Pro (3nm) with 6-core GPU",
      camera: "48MP Main + 12MP Ultra-Wide + 12MP 5x Telephoto with OIS",
      batterySpec: "4,422 mAh with 25W MagSafe Wireless Charging",
      os: "iOS 17 (Upgradable to latest iOS)",
      network: "5G Sub-6/mmWave, Wi-Fi 6E, Bluetooth 5.3, Thread, NFC",
      waterResistance: "IP68 Rating (Maximum 6 meters up to 30 minutes)",
    },
  }),

  buildProduct({
    id: 2,
    slug: "iphone-15-pro-128gb-like-new",
    name: "iPhone 15 Pro",
    brand: "Apple",
    price: 799,
    originalPrice: 999,
    condition: PRODUCT_CONDITIONS.LIKE_NEW,
    rating: 4.9,
    reviewCount: 165,
    shortDescription: "Compact 6.1-inch titanium flagship with A17 Pro performance, Action button, and 48MP Pro camera.",
    description:
      "Certified refurbished iPhone 15 Pro in pristine condition. Features grade 5 aerospace titanium design, Ceramic Shield front, and lightning-fast USB-C transfer speeds.",
    storage: "128GB",
    color: "Natural Titanium",
    availableStorage: ["128GB", "256GB", "512GB"],
    stock: 14,
    featured: true,
    isHotDeal: true,
    tags: [PRODUCT_TAGS.BESTSELLER, PRODUCT_TAGS.FLAGSHIP, PRODUCT_TAGS.APPLE],
    colorVariants: [
      {
        colorName: "Natural Titanium",
        hexCode: "#9ca3af",
        images: [
          "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80",
        ],
      },
      {
        colorName: "Black Titanium",
        hexCode: "#0f172a",
        images: [
          "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1200&q=80",
        ],
      },
      {
        colorName: "White Titanium",
        hexCode: "#f8fafc",
        images: [
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80",
        ],
      },
      {
        colorName: "Blue Titanium",
        hexCode: "#3b82f6",
        images: [
          "https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&w=1200&q=80",
        ],
      },
    ],
    specifications: {
      display: "6.1-inch Super Retina XDR OLED (2556x1179 at 460 ppi, 120Hz ProMotion)",
      processor: "Apple A17 Pro (3nm) with ray tracing support",
      camera: "48MP Main + 12MP Ultra-Wide + 12MP 3x Telephoto",
      batterySpec: "3,274 mAh with MagSafe Fast Wireless Charging",
      os: "iOS 17 (Upgradable to latest iOS)",
      network: "5G, Wi-Fi 6E, Bluetooth 5.3, Action Button",
      waterResistance: "IP68 (6m depth up to 30 mins)",
    },
  }),

  buildProduct({
    id: 3,
    slug: "iphone-15-128gb-excellent",
    name: "iPhone 15",
    brand: "Apple",
    price: 579,
    originalPrice: 799,
    condition: PRODUCT_CONDITIONS.EXCELLENT,
    rating: 4.8,
    reviewCount: 142,
    shortDescription: "Color-infused back glass iPhone 15 with Dynamic Island, 48MP main camera, and USB-C connectivity.",
    description:
      "Fully inspected and certified pre-owned iPhone 15. Equipped with the A16 Bionic chip, vibrant Super Retina display, and 2x optical-quality telephoto capability.",
    storage: "128GB",
    color: "Black",
    availableStorage: ["128GB", "256GB", "512GB"],
    stock: 18,
    featured: true,
    isHotDeal: false,
    tags: [PRODUCT_TAGS.BESTSELLER, PRODUCT_TAGS.APPLE],
    colorVariants: [
      {
        colorName: "Black",
        hexCode: "#0f172a",
        images: [
          "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=1200&q=80",
        ],
      },
      {
        colorName: "Pink",
        hexCode: "#ec4899",
        images: [
          "https://images.unsplash.com/photo-1603921326210-6edd2d60ca68?auto=format&fit=crop&w=1200&q=80",
        ],
      },
      {
        colorName: "Blue",
        hexCode: "#3b82f6",
        images: [
          "https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&w=1200&q=80",
        ],
      },
      {
        colorName: "Green",
        hexCode: "#10b981",
        images: [
          "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80",
        ],
      },
    ],
    specifications: {
      display: "6.1-inch Super Retina XDR OLED (2556x1179 at 460 ppi, 2000 nits peak)",
      processor: "Apple A16 Bionic (4nm) 6-core CPU",
      camera: "48MP Main + 12MP Ultra-Wide with sensor-shift OIS & 2x Telephoto",
      batterySpec: "3,349 mAh with USB-C and MagSafe support",
      os: "iOS 17 (Upgradable)",
      network: "5G, Wi-Fi 6, Bluetooth 5.3, Second-gen Ultra Wideband",
      waterResistance: "IP68 Rated",
    },
  }),

  buildProduct({
    id: 4,
    slug: "iphone-14-pro-128gb-excellent",
    name: "iPhone 14 Pro",
    brand: "Apple",
    price: 549,
    originalPrice: 899,
    condition: PRODUCT_CONDITIONS.EXCELLENT,
    rating: 4.8,
    reviewCount: 188,
    shortDescription: "Pro camera system with Dynamic Island, Always-On display, and durable surgical stainless steel frame.",
    description:
      "A powerhouse refurbished iPhone 14 Pro. Includes Apple's pioneering Dynamic Island, Photonic Engine for low-light shots, and Crash Detection safety tech.",
    storage: "128GB",
    color: "Space Black",
    availableStorage: ["128GB", "256GB", "512GB"],
    stock: 12,
    featured: true,
    tags: [PRODUCT_TAGS.FLAGSHIP, PRODUCT_TAGS.APPLE],
    colorVariants: [
      {
        colorName: "Space Black",
        hexCode: "#1e293b",
        images: [
          "https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1200&q=80",
        ],
      },
      {
        colorName: "Deep Purple",
        hexCode: "#581c87",
        images: [
          "https://images.unsplash.com/photo-1565630916779-e303be97b6f5?auto=format&fit=crop&w=1200&q=80",
        ],
      },
      {
        colorName: "Silver",
        hexCode: "#f8fafc",
        images: [
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80",
        ],
      },
    ],
    specifications: {
      display: "6.1-inch Super Retina XDR OLED (120Hz ProMotion, Always-On)",
      processor: "Apple A16 Bionic (4nm)",
      camera: "48MP Main + 12MP Ultra-Wide + 12MP 3x Telephoto",
      batterySpec: "3,200 mAh with Qi and MagSafe Wireless Charging",
      os: "iOS 16 (Upgradable)",
      network: "5G, Wi-Fi 6, Bluetooth 5.3, Emergency SOS via satellite",
      waterResistance: "IP68 Rated",
    },
  }),

  buildProduct({
    id: 5,
    slug: "iphone-13-128gb-good",
    name: "iPhone 13",
    brand: "Apple",
    price: 429,
    originalPrice: 699,
    condition: PRODUCT_CONDITIONS.GOOD,
    rating: 4.8,
    reviewCount: 240,
    shortDescription: "Best-value refurbished iPhone 13 with super-bright OLED display, Cinematic mode, and all-day battery.",
    description:
      "A premium refurbished iPhone 13 in Good condition, fully tested and professionally restored. Perfect for everyday use with fast A15 Bionic performance.",
    storage: "128GB",
    color: "Midnight",
    availableStorage: ["128GB", "256GB"],
    stock: 22,
    featured: true,
    isHotDeal: true,
    tags: [PRODUCT_TAGS.BESTSELLER, PRODUCT_TAGS.VALUE, PRODUCT_TAGS.APPLE],
    colorVariants: [
      {
        colorName: "Midnight",
        hexCode: "#0f172a",
        images: [
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1200&q=80",
        ],
      },
      {
        colorName: "Starlight",
        hexCode: "#f8fafc",
        images: [
          "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1200&q=80",
        ],
      },
      {
        colorName: "Blue",
        hexCode: "#2563eb",
        images: [
          "https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&w=1200&q=80",
        ],
      },
    ],
    specifications: {
      display: "6.1-inch Super Retina XDR OLED (2532x1170 at 460 ppi)",
      processor: "Apple A15 Bionic (5nm) 6-core CPU",
      camera: "Dual 12MP Main + Ultra-Wide with Sensor-shift OIS",
      batterySpec: "3,240 mAh with MagSafe Wireless Charging",
      os: "iOS 15 (Upgradable to latest iOS)",
      network: "5G, Wi-Fi 6, Bluetooth 5.0, NFC",
      waterResistance: "IP68 Rated",
    },
  }),

  buildProduct({
    id: 6,
    slug: "iphone-12-64gb-very-good",
    name: "iPhone 12",
    brand: "Apple",
    price: 289,
    originalPrice: 499,
    condition: PRODUCT_CONDITIONS.VERY_GOOD,
    rating: 4.7,
    reviewCount: 310,
    shortDescription: "Ultra-affordable 5G iPhone with flat aerospace-aluminum edges and crisp OLED display.",
    description:
      "Refurbished iPhone 12 in Very Good cosmetic condition. Tested with our comprehensive 50-point diagnostic check. Reliable performance and MagSafe compatibility.",
    storage: "64GB",
    color: "Black",
    availableStorage: ["64GB", "128GB", "256GB"],
    stock: 25,
    featured: false,
    tags: [PRODUCT_TAGS.VALUE, PRODUCT_TAGS.APPLE],
    colorVariants: [
      {
        colorName: "Black",
        hexCode: "#0f172a",
        images: [
          "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1200&q=80",
        ],
      },
      {
        colorName: "Blue",
        hexCode: "#1d4ed8",
        images: [
          "https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&w=1200&q=80",
        ],
      },
      {
        colorName: "White",
        hexCode: "#f8fafc",
        images: [
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80",
        ],
      },
    ],
    specifications: {
      display: "6.1-inch Super Retina XDR OLED (2532x1170 pixels)",
      processor: "Apple A14 Bionic (5nm)",
      camera: "Dual 12MP Ultra-Wide and Wide cameras with Night mode",
      batterySpec: "2,815 mAh with MagSafe 15W charging",
      os: "iOS (Upgradable)",
      network: "5G, Wi-Fi 6, Bluetooth 5.0",
      waterResistance: "IP68 Rated",
    },
  }),

  buildProduct({
    id: 7,
    slug: "iphone-se-3rd-gen-64gb-good",
    name: "iPhone SE (3rd Gen)",
    brand: "Apple",
    price: 219,
    originalPrice: 429,
    condition: PRODUCT_CONDITIONS.GOOD,
    rating: 4.5,
    reviewCount: 96,
    shortDescription: "Compact classic iPhone with fast A15 Bionic chip and reliable Touch ID fingerprint sensor.",
    description:
      "Affordable certified second-hand iPhone SE 2022. Provides flagship processing speed in a familiar pocket-sized 4.7-inch format.",
    storage: "64GB",
    color: "Midnight",
    availableStorage: ["64GB", "128GB"],
    stock: 18,
    featured: false,
    tags: [PRODUCT_TAGS.VALUE, PRODUCT_TAGS.APPLE],
    colorVariants: [
      {
        colorName: "Midnight",
        hexCode: "#0f172a",
        images: [
          "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1200&q=80",
        ],
      },
      {
        colorName: "Starlight",
        hexCode: "#f8fafc",
        images: [
          "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=1200&q=80",
        ],
      },
    ],
    specifications: {
      display: "4.7-inch Retina HD Display (1334x750 at 326 ppi)",
      processor: "Apple A15 Bionic (5nm)",
      camera: "12MP Main Camera with Smart HDR 4 & Portrait Mode",
      batterySpec: "2,018 mAh with Qi Wireless Charging",
      os: "iOS 15 (Upgradable to latest iOS)",
      network: "5G, Wi-Fi 6, Bluetooth 5.0, Touch ID",
      waterResistance: "IP67 Rated",
    },
  }),

  // =========================================================================
  // 2. SAMSUNG GALAXY
  // =========================================================================
  buildProduct({
    id: 8,
    slug: "samsung-galaxy-s24-ultra-512gb-like-new",
    name: "Samsung Galaxy S24 Ultra",
    brand: "Samsung",
    price: 899,
    originalPrice: 1349,
    condition: PRODUCT_CONDITIONS.LIKE_NEW,
    rating: 4.9,
    reviewCount: 174,
    shortDescription: "Pristine pre-owned Galaxy S24 Ultra with Galaxy AI features, titanium body, and integrated S Pen.",
    description:
      "Top-grade Galaxy S24 Ultra featuring Titanium Frame, 200MP Quad Telephoto camera, Snapdragon 8 Gen 3, and integrated Galaxy AI capabilities.",
    storage: "512GB",
    color: "Titanium Gray",
    availableStorage: ["256GB", "512GB", "1TB"],
    stock: 12,
    featured: true,
    isHotDeal: true,
    tags: [PRODUCT_TAGS.FLAGSHIP, PRODUCT_TAGS.SAMSUNG, PRODUCT_TAGS.AI],
    colorVariants: [
      {
        colorName: "Titanium Gray",
        hexCode: "#64748b",
        images: [
          "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1200&q=80",
        ],
      },
      {
        colorName: "Titanium Black",
        hexCode: "#0f172a",
        images: [
          "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1200&q=80",
        ],
      },
      {
        colorName: "Titanium Violet",
        hexCode: "#7c3aed",
        images: [
          "https://images.unsplash.com/photo-1565630916779-e303be97b6f5?auto=format&fit=crop&w=1200&q=80",
        ],
      },
    ],
    specifications: {
      display: "6.8-inch Dynamic AMOLED 2X (3120x1440 QHD+, 120Hz, 2600 nits peak)",
      processor: "Qualcomm Snapdragon 8 Gen 3 for Galaxy (4nm)",
      camera: "200MP Main + 50MP 5x Zoom + 10MP 3x Zoom + 12MP Ultra-Wide",
      batterySpec: "5,000 mAh with 45W Fast Wired Charging",
      os: "Android 14 with One UI 6.1 (7 Years OS Updates)",
      network: "5G SA/NSA, Wi-Fi 7, Bluetooth 5.3, UWB, NFC",
      waterResistance: "IP68 Dust & Water Resistance",
    },
  }),

  buildProduct({
    id: 9,
    slug: "samsung-galaxy-s24-128gb-like-new",
    name: "Samsung Galaxy S24",
    brand: "Samsung",
    price: 549,
    originalPrice: 799,
    condition: PRODUCT_CONDITIONS.LIKE_NEW,
    rating: 4.8,
    reviewCount: 92,
    shortDescription: "Compact 6.2-inch flagship with Galaxy AI, vibrant 120Hz Dynamic AMOLED, and all-day battery life.",
    description:
      "Pristine refurbished Galaxy S24. Features Live Translate, Circle to Search with Google, and armor aluminum frame for exceptional durability.",
    storage: "128GB",
    color: "Onyx Black",
    availableStorage: ["128GB", "256GB"],
    stock: 14,
    featured: false,
    tags: [PRODUCT_TAGS.SAMSUNG, PRODUCT_TAGS.AI],
    colorVariants: [
      {
        colorName: "Onyx Black",
        hexCode: "#0f172a",
        images: [
          "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=1200&q=80",
        ],
      },
      {
        colorName: "Marble Gray",
        hexCode: "#cbd5e1",
        images: [
          "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1200&q=80",
        ],
      },
      {
        colorName: "Cobalt Violet",
        hexCode: "#6d28d9",
        images: [
          "https://images.unsplash.com/photo-1565630916779-e303be97b6f5?auto=format&fit=crop&w=1200&q=80",
        ],
      },
    ],
    specifications: {
      display: "6.2-inch FHD+ Dynamic AMOLED 2X (1-120Hz adaptive)",
      processor: "Snapdragon 8 Gen 3 / Exynos 2400 Deca-Core",
      camera: "50MP Main + 10MP 3x Telephoto + 12MP Ultra-Wide",
      batterySpec: "4,000 mAh with 25W Fast Charging",
      os: "Android 14 with One UI 6.1",
      network: "5G, Wi-Fi 6E, Bluetooth 5.3",
      waterResistance: "IP68 Rated",
    },
  }),

  buildProduct({
    id: 10,
    slug: "samsung-galaxy-s23-ultra-256gb-excellent",
    name: "Samsung Galaxy S23 Ultra",
    brand: "Samsung",
    price: 619,
    originalPrice: 1149,
    condition: PRODUCT_CONDITIONS.EXCELLENT,
    rating: 4.8,
    reviewCount: 220,
    shortDescription: "Flagship 200MP camera system with 100x Space Zoom, built-in S Pen, and long-lasting 5,000 mAh battery.",
    description:
      "Certified refurbished Galaxy S23 Ultra. Remarkable Nightography camera capabilities, Snapdragon 8 Gen 2 efficiency, and brilliant 6.8-inch Edge display.",
    storage: "256GB",
    color: "Phantom Black",
    availableStorage: ["256GB", "512GB"],
    stock: 16,
    featured: true,
    tags: [PRODUCT_TAGS.BESTSELLER, PRODUCT_TAGS.FLAGSHIP, PRODUCT_TAGS.SAMSUNG],
    colorVariants: [
      {
        colorName: "Phantom Black",
        hexCode: "#0f172a",
        images: [
          "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=1200&q=80",
        ],
      },
      {
        colorName: "Green",
        hexCode: "#166534",
        images: [
          "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80",
        ],
      },
    ],
    specifications: {
      display: "6.8-inch Dynamic AMOLED 2X (3088x1440, 120Hz)",
      processor: "Qualcomm Snapdragon 8 Gen 2 for Galaxy",
      camera: "200MP Main + 10MP 10x Periscope + 10MP 3x Zoom + 12MP Ultra-Wide",
      batterySpec: "5,000 mAh with 45W Super Fast Charging",
      os: "Android 13 (Upgradable to Android 14)",
      network: "5G, Wi-Fi 6E, Bluetooth 5.3, S Pen",
      waterResistance: "IP68 Rated",
    },
  }),

  buildProduct({
    id: 11,
    slug: "samsung-galaxy-z-flip-5-256gb-excellent",
    name: "Samsung Galaxy Z Flip 5",
    brand: "Samsung",
    price: 529,
    originalPrice: 999,
    condition: PRODUCT_CONDITIONS.EXCELLENT,
    rating: 4.7,
    reviewCount: 110,
    shortDescription: "Iconic foldable phone featuring expanded 3.4-inch Flex Window cover screen and zero-gap hinge.",
    description:
      "Fully tested Galaxy Z Flip 5. Fits effortlessly in any pocket, lets you take hands-free selfies with FlexCam, and delivers smooth 120Hz AMOLED main display.",
    storage: "256GB",
    color: "Mint",
    availableStorage: ["256GB", "512GB"],
    stock: 9,
    featured: true,
    tags: [PRODUCT_TAGS.FLAGSHIP, PRODUCT_TAGS.SAMSUNG],
    colorVariants: [
      {
        colorName: "Mint",
        hexCode: "#a7f3d0",
        images: [
          "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80",
        ],
      },
      {
        colorName: "Graphite",
        hexCode: "#1e293b",
        images: [
          "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=1200&q=80",
        ],
      },
      {
        colorName: "Lavender",
        hexCode: "#e9d5ff",
        images: [
          "https://images.unsplash.com/photo-1565630916779-e303be97b6f5?auto=format&fit=crop&w=1200&q=80",
        ],
      },
    ],
    specifications: {
      display: "6.7-inch Dynamic AMOLED 2X (120Hz) + 3.4-inch Super AMOLED Flex Window",
      processor: "Qualcomm Snapdragon 8 Gen 2 for Galaxy",
      camera: "Dual 12MP Wide + 12MP Ultra-Wide with Flex Mode",
      batterySpec: "3,700 mAh with 25W Fast Charging",
      os: "Android 13 (Upgradable to Android 14)",
      network: "5G, Wi-Fi 6E, Bluetooth 5.3",
      waterResistance: "IPX8 Water Resistant",
    },
  }),

  // =========================================================================
  // 3. GOOGLE PIXEL & ONEPLUS
  // =========================================================================
  buildProduct({
    id: 12,
    slug: "google-pixel-8-pro-128gb-excellent",
    name: "Google Pixel 8 Pro",
    brand: "Google",
    price: 549,
    originalPrice: 999,
    condition: PRODUCT_CONDITIONS.EXCELLENT,
    rating: 4.8,
    reviewCount: 148,
    shortDescription: "Pro AI camera handset with Google Tensor G3 chip, temperature sensor, and bright Super Actua display.",
    description:
      "Fully inspected Pixel 8 Pro. Known for industry-leading computational photography, Magic Eraser, Best Take, Audio Magic Eraser, and 7 years of Android updates.",
    storage: "128GB",
    color: "Bay Blue",
    availableStorage: ["128GB", "256GB"],
    stock: 15,
    featured: true,
    isHotDeal: true,
    tags: [PRODUCT_TAGS.BESTSELLER, PRODUCT_TAGS.GOOGLE, PRODUCT_TAGS.AI],
    colorVariants: [
      {
        colorName: "Bay Blue",
        hexCode: "#38bdf8",
        images: [
          "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1200&q=80",
        ],
      },
      {
        colorName: "Obsidian",
        hexCode: "#0f172a",
        images: [
          "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1200&q=80",
        ],
      },
      {
        colorName: "Porcelain",
        hexCode: "#f1f5f9",
        images: [
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80",
        ],
      },
    ],
    specifications: {
      display: "6.7-inch Super Actua LTPO OLED (1344x2992, 1-120Hz, 2400 nits)",
      processor: "Google Tensor G3 (4nm) with Titan M2 Security Coprocessor",
      camera: "50MP Main (f/1.68) + 48MP Ultra-Wide + 48MP 5x Telephoto",
      batterySpec: "5,050 mAh with 30W Fast Charging & Battery Share",
      os: "Android 14 (Guaranteed 7 Years of Feature Drops)",
      network: "5G, Wi-Fi 7, Bluetooth 5.3, NFC, Built-in Temperature Sensor",
      waterResistance: "IP68 Submersible",
    },
  }),

  buildProduct({
    id: 13,
    slug: "google-pixel-8-128gb-like-new",
    name: "Google Pixel 8",
    brand: "Google",
    price: 439,
    originalPrice: 699,
    condition: PRODUCT_CONDITIONS.LIKE_NEW,
    rating: 4.8,
    reviewCount: 94,
    shortDescription: "Compact AI smartphone with brilliant 120Hz Actua display, Tensor G3, and extraordinary camera smarts.",
    description:
      "Grade A+ refurbished Google Pixel 8. Features pocket-friendly form factor, satin finish back glass, Macro Focus, and cutting-edge Google AI processing.",
    storage: "128GB",
    color: "Obsidian",
    availableStorage: ["128GB", "256GB"],
    stock: 14,
    featured: false,
    tags: [PRODUCT_TAGS.GOOGLE, PRODUCT_TAGS.AI],
    colorVariants: [
      {
        colorName: "Obsidian",
        hexCode: "#0f172a",
        images: [
          "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?auto=format&fit=crop&w=1200&q=80",
        ],
      },
      {
        colorName: "Rose",
        hexCode: "#fda4af",
        images: [
          "https://images.unsplash.com/photo-1603921326210-6edd2d60ca68?auto=format&fit=crop&w=1200&q=80",
        ],
      },
      {
        colorName: "Hazel",
        hexCode: "#78716c",
        images: [
          "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1200&q=80",
        ],
      },
    ],
    specifications: {
      display: "6.2-inch Actua OLED (1080x2400, 60-120Hz, 2000 nits)",
      processor: "Google Tensor G3 (4nm)",
      camera: "50MP Octa PD Main + 12MP Ultra-Wide with Macro Focus",
      batterySpec: "4,575 mAh with 27W Fast Charge",
      os: "Android 14 (7 Years OS Updates)",
      network: "5G, Wi-Fi 7, Bluetooth 5.3, NFC",
      waterResistance: "IP68 Rated",
    },
  }),

  buildProduct({
    id: 14,
    slug: "oneplus-12-256gb-like-new",
    name: "OnePlus 12",
    brand: "OnePlus",
    price: 599,
    originalPrice: 849,
    condition: PRODUCT_CONDITIONS.LIKE_NEW,
    rating: 4.9,
    reviewCount: 88,
    shortDescription: "Extreme speed phone with 100W SUPERVOOC charging, 5400mAh battery, and 4th Gen Hasselblad camera.",
    description:
      "Grade A+ refurbished OnePlus 12. Snapdragon 8 Gen 3 processor, 5400mAh dual-cell battery, and ultra-bright 4500 nits 2K ProXDR screen.",
    storage: "256GB",
    color: "Emerald Green",
    availableStorage: ["256GB", "512GB"],
    stock: 11,
    featured: true,
    tags: [PRODUCT_TAGS.FLAGSHIP, PRODUCT_TAGS.ONEPLUS],
    colorVariants: [
      {
        colorName: "Emerald Green",
        hexCode: "#047857",
        images: [
          "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1598327105877-6e3f75cab52d?auto=format&fit=crop&w=1200&q=80",
        ],
      },
      {
        colorName: "Silky Black",
        hexCode: "#0f172a",
        images: [
          "https://images.unsplash.com/photo-1598327105877-6e3f75cab52d?auto=format&fit=crop&w=1200&q=80",
        ],
      },
    ],
    specifications: {
      display: "6.82-inch 2K LTPO AMOLED (3168x1440, 120Hz, 4500 nits Peak)",
      processor: "Qualcomm Snapdragon 8 Gen 3 (4nm)",
      camera: "50MP Sony LYT-808 + 64MP 3x Periscope + 48MP Ultra-Wide",
      batterySpec: "5,400 mAh with 100W SUPERVOOC Charge (1-100% in 26 mins)",
      os: "OxygenOS 14 based on Android 14",
      network: "5G, Wi-Fi 7, Bluetooth 5.4, IR Blaster, NFC",
      waterResistance: "IP65 Rated",
    },
  }),

  // =========================================================================
  // 4. TABLETS (iPADS)
  // =========================================================================
  buildProduct({
    id: 15,
    slug: "ipad-pro-11-inch-m2-128gb-like-new",
    name: "Apple iPad Pro 11-inch (M2)",
    brand: "Apple",
    category: PRODUCT_CATEGORIES.TABLETS,
    subcategory: PRODUCT_SUBCATEGORIES.TABLETS,
    price: 649,
    originalPrice: 899,
    condition: PRODUCT_CONDITIONS.LIKE_NEW,
    rating: 4.9,
    reviewCount: 130,
    shortDescription: "Astonishing performance with Apple M2 chip, 120Hz ProMotion Liquid Retina display, and Apple Pencil hover.",
    description:
      "Grade A+ refurbished iPad Pro 11-inch. Powered by the groundbreaking M2 chip, dual rear cameras with LiDAR scanner, and thunderbolt port for professional workflows.",
    storage: "128GB",
    color: "Space Gray",
    availableStorage: ["128GB", "256GB", "512GB"],
    stock: 10,
    featured: true,
    tags: [PRODUCT_TAGS.TABLET, PRODUCT_TAGS.APPLE, PRODUCT_TAGS.FLAGSHIP],
    colorVariants: [
      {
        colorName: "Space Gray",
        hexCode: "#334155",
        images: [
          "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?auto=format&fit=crop&w=1200&q=80",
        ],
      },
      {
        colorName: "Silver",
        hexCode: "#e2e8f0",
        images: [
          "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?auto=format&fit=crop&w=1200&q=80",
        ],
      },
    ],
    specifications: {
      display: "11-inch Liquid Retina LED (2388x1668 at 264 ppi, 120Hz ProMotion, True Tone)",
      processor: "Apple M2 (8-core CPU, 10-core GPU, 16-core Neural Engine)",
      camera: "12MP Wide + 10MP Ultra-Wide with LiDAR Scanner & 12MP TrueDepth Front",
      batterySpec: "28.65-watt-hour rechargeable lithium-polymer (Up to 10 hours)",
      os: "iPadOS 16 (Upgradable to latest iPadOS)",
      network: "Wi-Fi 6E (802.11ax), Bluetooth 5.3, Thunderbolt / USB 4 port",
      waterResistance: "Not water resistant",
    },
  }),

  buildProduct({
    id: 16,
    slug: "ipad-air-5th-gen-m1-64gb-excellent",
    name: "Apple iPad Air 5 (M1)",
    brand: "Apple",
    category: PRODUCT_CATEGORIES.TABLETS,
    subcategory: PRODUCT_SUBCATEGORIES.TABLETS,
    price: 449,
    originalPrice: 649,
    condition: PRODUCT_CONDITIONS.EXCELLENT,
    rating: 4.8,
    reviewCount: 95,
    shortDescription: "Ultra-portable iPad Air with desktop-class Apple M1 performance, 10.9-inch Liquid Retina, and Touch ID.",
    description:
      "Certified refurbished iPad Air (5th Generation). Provides incredible creative power for digital artists, students, and professionals with Apple Pencil 2 support.",
    storage: "64GB",
    color: "Space Gray",
    availableStorage: ["64GB", "256GB"],
    stock: 12,
    featured: false,
    tags: [PRODUCT_TAGS.TABLET, PRODUCT_TAGS.APPLE],
    colorVariants: [
      {
        colorName: "Space Gray",
        hexCode: "#334155",
        images: [
          "https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=1200&q=80",
        ],
      },
      {
        colorName: "Blue",
        hexCode: "#3b82f6",
        images: [
          "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=1200&q=80",
        ],
      },
    ],
    specifications: {
      display: "10.9-inch Liquid Retina IPS (2360x1640 at 264 ppi, True Tone)",
      processor: "Apple M1 chip (8-core CPU, 8-core graphics)",
      camera: "12MP Wide rear camera + 12MP Ultra-Wide front with Center Stage",
      batterySpec: "Up to 10 hours of web surfing on Wi-Fi",
      os: "iPadOS",
      network: "Wi-Fi 6, Bluetooth 5.0, USB-C",
      waterResistance: "Standard",
    },
  }),

  // =========================================================================
  // 5. LAPTOPS (MACBOOKS)
  // =========================================================================
  buildProduct({
    id: 17,
    slug: "macbook-air-13-inch-m2-256gb-like-new",
    name: "Apple MacBook Air 13-inch (M2)",
    brand: "Apple",
    category: PRODUCT_CATEGORIES.LAPTOPS,
    subcategory: PRODUCT_SUBCATEGORIES.LAPTOPS,
    price: 799,
    originalPrice: 1099,
    condition: PRODUCT_CONDITIONS.LIKE_NEW,
    rating: 4.9,
    reviewCount: 160,
    shortDescription: "Strikingly thin aluminum unibody MacBook Air with M2 speed, MagSafe charging, and silent fanless design.",
    description:
      "Pristine refurbished MacBook Air M2. Incredible 18-hour battery endurance, 13.6-inch Liquid Retina display with 500 nits brightness, and 1080p FaceTime HD camera.",
    storage: "256GB",
    color: "Midnight",
    availableStorage: ["256GB", "512GB"],
    stock: 8,
    featured: true,
    tags: [PRODUCT_TAGS.LAPTOP, PRODUCT_TAGS.APPLE, PRODUCT_TAGS.PREMIUM],
    colorVariants: [
      {
        colorName: "Midnight",
        hexCode: "#0f172a",
        images: [
          "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80",
        ],
      },
      {
        colorName: "Space Gray",
        hexCode: "#475569",
        images: [
          "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80",
        ],
      },
      {
        colorName: "Silver",
        hexCode: "#e2e8f0",
        images: [
          "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=1200&q=80",
        ],
      },
    ],
    specifications: {
      display: "13.6-inch Liquid Retina display (2560x1664, 500 nits, P3 wide color)",
      processor: "Apple M2 (8-core CPU, 8-core or 10-core GPU, 8GB unified memory)",
      camera: "1080p FaceTime HD camera with advanced image signal processor",
      batterySpec: "52.6-watt-hour lithium-polymer (Up to 18 hours battery life)",
      os: "macOS Sonoma (Upgradable)",
      network: "Wi-Fi 6 (802.11ax), Bluetooth 5.3, MagSafe 3, Two Thunderbolt ports",
      waterResistance: "Not water resistant",
    },
  }),

  // =========================================================================
  // 6. SMARTWATCHES (WEARABLES)
  // =========================================================================
  buildProduct({
    id: 18,
    slug: "apple-watch-series-9-gps-cellular-45mm-like-new",
    name: "Apple Watch Series 9 (GPS + Cellular)",
    brand: "Apple",
    category: PRODUCT_CATEGORIES.SMARTWATCHES,
    subcategory: PRODUCT_SUBCATEGORIES.SMARTWATCHES,
    price: 329,
    originalPrice: 499,
    condition: PRODUCT_CONDITIONS.LIKE_NEW,
    rating: 4.8,
    reviewCount: 115,
    shortDescription: "Advanced smartwatch with Double Tap gesture, brighter Always-On display, and independent cellular connectivity.",
    description:
      "Grade A+ refurbished Apple Watch Series 9. Control the watch with a pinch of your fingers, monitor ECG and Blood Oxygen, and track fitness with unmatched precision.",
    storage: "45mm",
    color: "Midnight",
    availableColors: ["Midnight", "Starlight", "Silver"],
    availableStorage: ["41mm", "45mm"],
    stock: 15,
    featured: true,
    tags: [PRODUCT_TAGS.SMARTWATCH, PRODUCT_TAGS.APPLE, PRODUCT_TAGS.FITNESS],
    colorVariants: [
      {
        colorName: "Midnight",
        hexCode: "#0f172a",
        images: [
          "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=1200&q=80",
        ],
      },
      {
        colorName: "Starlight",
        hexCode: "#fef08a",
        images: [
          "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=1200&q=80",
        ],
      },
      {
        colorName: "Silver",
        hexCode: "#e2e8f0",
        images: [
          "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=1200&q=80",
        ],
      },
    ],
    specifications: {
      display: "Always-On Retina LTPO OLED (Up to 2000 nits brightness)",
      processor: "S9 SiP with 64-bit dual-core processor & 4-core Neural Engine",
      camera: "N/A (Optical heart rate, electrical heart sensor, temperature sensing)",
      batterySpec: "Up to 18 hours (Up to 36 hours in Low Power Mode) with Fast Charge",
      os: "watchOS 10",
      network: "LTE and UMTS, Wi-Fi 4, Bluetooth 5.3, Second-gen UWB",
      waterResistance: "50 meters water resistant (Swimproof)",
    },
  }),

  // =========================================================================
  // 7. AUDIO & ACCESSORIES
  // =========================================================================
  buildProduct({
    id: 19,
    slug: "sony-wh-1000xm5-wireless-headphones-like-new",
    name: "Sony WH-1000XM5 Wireless Headphones",
    brand: "Sony",
    category: PRODUCT_CATEGORIES.ACCESSORIES,
    subcategory: PRODUCT_SUBCATEGORIES.ACCESSORIES,
    price: 259,
    originalPrice: 380,
    condition: PRODUCT_CONDITIONS.LIKE_NEW,
    rating: 4.9,
    reviewCount: 205,
    shortDescription: "Industry-leading noise cancelling with Auto NC Optimizer, 30-hour battery life, and ultra-comfortable fit.",
    description:
      "Grade A+ refurbished Sony WH-1000XM5 flagship headphones. Features 8 microphones for unparalleled voice calls and ambient noise suppression, High-Resolution Audio, and multipoint connection.",
    storage: "Standard",
    color: "Black",
    availableColors: ["Black", "Silver", "Midnight Blue"],
    availableStorage: ["Standard"],
    stock: 12,
    featured: true,
    tags: [PRODUCT_TAGS.ACCESSORY, PRODUCT_TAGS.AUDIO, PRODUCT_TAGS.SONY],
    colorVariants: [
      {
        colorName: "Black",
        hexCode: "#0f172a",
        images: [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80",
        ],
      },
      {
        colorName: "Silver",
        hexCode: "#e2e8f0",
        images: [
          "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1200&q=80",
        ],
      },
      {
        colorName: "Midnight Blue",
        hexCode: "#1e3a8a",
        images: [
          "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80",
        ],
      },
    ],
    specifications: {
      display: "Touch Sensor Control Panel on Earcups",
      processor: "Integrated Processor V1 + HD Noise Cancelling Processor QN1",
      camera: "4 Beamforming Microphones with AI Noise Reduction",
      batterySpec: "Up to 30 hours battery life (3 min quick charge gives 3 hours playback)",
      os: "Sony Headphones Connect App (iOS / Android)",
      network: "Bluetooth 5.2, LDAC, AAC, SBC, Multipoint pairing",
      waterResistance: "Moisture resistant",
    },
  }),
];

export const featuredProducts = products.filter((product) => product.featured);

export const productsByCategory = {
  [PRODUCT_CATEGORIES.SMARTPHONES]: products.filter((p) => p.category === PRODUCT_CATEGORIES.SMARTPHONES),
  [PRODUCT_CATEGORIES.TABLETS]: products.filter((p) => p.category === PRODUCT_CATEGORIES.TABLETS),
  [PRODUCT_CATEGORIES.LAPTOPS]: products.filter((p) => p.category === PRODUCT_CATEGORIES.LAPTOPS),
  [PRODUCT_CATEGORIES.SMARTWATCHES]: products.filter((p) => p.category === PRODUCT_CATEGORIES.SMARTWATCHES),
  [PRODUCT_CATEGORIES.ACCESSORIES]: products.filter((p) => p.category === PRODUCT_CATEGORIES.ACCESSORIES),
};
