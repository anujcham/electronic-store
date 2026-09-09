export const PRODUCT_CATEGORIES = {
  SMARTPHONES: "Smartphones",
  TABLETS: "Tablets",
  LAPTOPS: "Laptops",
  SMARTWATCHES: "Smartwatches",
  GAMING: "Gaming",
  ACCESSORIES: "Accessories",
};

export const PRODUCT_SUBCATEGORIES = {
  SMARTPHONES: "Phones",
  TABLETS: "Tablets",
  LAPTOPS: "Laptops",
  SMARTWATCHES: "Wearables",
  GAMING: "Gaming",
  ACCESSORIES: "Accessories",
};

export const PRODUCT_CONDITIONS = {
  LIKE_NEW: "Like New",
  EXCELLENT: "Excellent",
  VERY_GOOD: "Very Good",
  GOOD: "Good",
  FAIR: "Fair",
};

export const PRODUCT_CONDITION_DETAILS = {
  "Like New": {
    badge: "Pristine Grade",
    screen: "Zero scratches or micro-marks",
    body: "Flawless condition, looks brand new",
    functionality: "100% Fully Functional (50+ point diagnostic passed)",
    battery: "85% - 100% Original Capacity guaranteed",
  },
  "Excellent": {
    badge: "Premium Grade",
    screen: "Pristine when screen is turned on (may have faint micro-scratches visible off)",
    body: "Minimal light marks, barely visible from 20cm away",
    functionality: "100% Fully Functional (50+ point diagnostic passed)",
    battery: "85% - 100% Original Capacity guaranteed",
  },
  "Very Good": {
    badge: "Standard Grade",
    screen: "Minor light scratches, unnoticeable during display operation",
    body: "Light scuffs or small marks on sides/back casing",
    functionality: "100% Fully Functional (50+ point diagnostic passed)",
    battery: "85%+ Health Guaranteed",
  },
  "Good": {
    badge: "Value Grade",
    screen: "Visible minor scratches, 100% intact with no cracks or dead pixels",
    body: "Noticeable scratches, scuffs or light corner denting",
    functionality: "100% Fully Functional (50+ point diagnostic passed)",
    battery: "83%+ Health Guaranteed",
  },
  "Fair": {
    badge: "Budget Grade",
    screen: "Moderate surface scratches, touch & display completely responsive",
    body: "Heavier cosmetic wear/dents, structural integrity intact",
    functionality: "100% Fully Functional (50+ point diagnostic passed)",
    battery: "80%+ Health Guaranteed",
  },
};

export const INSPECTION_CATEGORIES = [
  {
    category: "Display & Touch Screen",
    checks: [
      { name: "Multi-Touch Sensitivity", status: "PASSED" },
      { name: "LCD/OLED Color & Brightness", status: "PASSED" },
      { name: "Zero Dead Pixels or Burn-in", status: "PASSED" },
      { name: "True Tone & Ambient Light Sensor", status: "PASSED" },
    ],
  },
  {
    category: "Battery & Power Systems",
    checks: [
      { name: "Battery Health Test (85%+ Minimum)", status: "PASSED" },
      { name: "Wired Fast Charging Test", status: "PASSED" },
      { name: "Wireless Charging Receiver", status: "PASSED" },
      { name: "Overheat & Thermal Regulator", status: "PASSED" },
    ],
  },
  {
    category: "Camera & Optics",
    checks: [
      { name: "Front Selfie Camera & Portrait Lens", status: "PASSED" },
      { name: "Rear Main, Ultra-Wide & Telephoto Lenses", status: "PASSED" },
      { name: "Optical Image Stabilization (OIS)", status: "PASSED" },
      { name: "Flashlight & Video Microphone Sync", status: "PASSED" },
    ],
  },
  {
    category: "Security & Connectivity",
    checks: [
      { name: "IMEI Clean & Unlocked (Global Carriers)", status: "PASSED" },
      { name: "Face ID / Touch ID Biometrics", status: "PASSED" },
      { name: "Wi-Fi 6 & Bluetooth 5.2 Antenna", status: "PASSED" },
      { name: "5G Cellular Data & eSIM Module", status: "PASSED" },
      { name: "GPS Navigation & Gyroscope", status: "PASSED" },
    ],
  },
  {
    category: "Audio, Mic & Buttons",
    checks: [
      { name: "Stereo Speakers (No Distortion)", status: "PASSED" },
      { name: "Noise-Cancelling Microphones", status: "PASSED" },
      { name: "Volume, Mute & Power Tactile Buttons", status: "PASSED" },
      { name: "Haptic Engine & Vibration Motor", status: "PASSED" },
    ],
  },
];

export const PRODUCT_TAGS = {
  BESTSELLER: "Bestseller",
  REFURBISHED: "Refurbished",
  APPLE: "Apple",
  SAMSUNG: "Samsung",
  GOOGLE: "Google",
  PREMIUM: "Premium",
  FLAGSHIP: "Flagship",
  TABLET: "Tablet",
  LAPTOP: "Laptop",
  SMARTWATCH: "Smartwatch",
  FITNESS: "Fitness",
  GAMING: "Gaming",
  ACCESSORY: "Accessory",
  AUDIO: "Audio",
  CHARGING: "Charging",
  BELKIN: "Belkin",
  LENOVO: "Lenovo",
  HP: "HP",
  GARMIN: "Garmin",
  PLAY: "Play",
  NINTENDO: "Nintendo",
  ASUS: "ASUS",
  ONEPLUS: "OnePlus",
  SONY: "Sony",
  VALUE: "Value",
  PORTABLE: "Portable",
  WORK: "Work",
  AI: "AI",
};
