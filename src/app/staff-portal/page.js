"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Package,
  ShoppingBag,
  Users,
  DollarSign,
  Search,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  Truck,
  ShieldCheck,
  Award,
  Clock,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Eye,
  History,
  X,
  Lock,
  ChevronRight,
  Filter,
  Check,
  TrendingUp,
  UserPlus,
  Mail,
  KeyRound,
  User,
  LogOut,
  Shield,
  ShoppingCart,
  MapPin,
  CreditCard,
  Calendar,
  ExternalLink,
  Flame,
  Smartphone,
  Palette,
  Layers,
  Cpu,
} from "lucide-react";

import { Container, Badge } from "../../components/ui";
import { useToast } from "../../components/common/Toast";
import { useDebounce } from "../../hooks/useDebounce";
import AdminSearchInput from "../../components/admin/AdminSearchInput";
import { OrderDetailsModal, OrderActivityModal } from "../../components/admin";
import {
  fetchAdminOrders,
  updateOrderFulfillment,
  fetchAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  fetchAdminUsers,
  fetchAdminCarts,
  adminStaffLogin,
  adminStaffLogout,
  fetchAdminStaffList,
  createAdminStaffAccount,
} from "../../services/adminService";

const emptyProductForm = {
  name: "",
  brand: "Apple",
  category: "Smartphones",
  price: "",
  originalPrice: "",
  stock: 10,
  condition: "Good",
  storage: "128GB",
  color: "Space Black",
  images: "",
  shortDescription: "",
  description: "",
  featured: false,
  isHotDeal: false,
  colorVariants: [
    {
      colorName: "Space Black",
      hexCode: "#1e293b",
      imagesText: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
    },
  ],
  variantPricing: [
    {
      color: "Space Black",
      storage: "128GB",
      condition: "Good",
      price: "499.00",
      originalPrice: "799.00",
      stock: 5,
    },
  ],
  specifications: {
    display: "6.1-inch Super Retina XDR OLED, 2556 x 1179 pixels",
    processor: "Apple A16 Bionic / High performance chipset",
    camera: "48MP Main | 12MP Ultra Wide with Photonic Engine",
    batterySpec: "85%+ Battery health guaranteed with fast wireless charging",
    os: "Latest mobile OS supported",
    network: "5G Ultra Wideband, Wi-Fi 6, Bluetooth 5.3",
    waterResistance: "IP68 rated (maximum depth of 6m up to 30 minutes)",
  },
};

const emptyNewAdminForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
};

export default function StaffPortalPage() {
  const toast = useToast();

  const [activeTab, setActiveTab] = useState("orders"); // "orders" | "products" | "customers" | "staff"
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);

  // Dedicated Admin Auth State
  const [adminUser, setAdminUser] = useState(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Inactivity & Session Expiry State (30 min inactivity timeout, 2-hour max session)
  const [inactivityWarningOpen, setInactivityWarningOpen] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(60);
  const lastActivityRef = useRef(Date.now());

  // Data states (populated directly from backend responses)
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [carts, setCarts] = useState([]);

  // Store-wide Global KPI Metrics (independent of active table search/filters)
  const [kpiMetrics, setKpiMetrics] = useState({
    totalRevenue: 0,
    totalOrdersCount: 0,
    pendingDispatchCount: 0,
    totalProductsCount: 0,
    featuredCount: 0,
    staffCount: 0,
    customersCount: 0,
    avgOrderValue: 0,
    activeCartsCount: 0,
    cartPipelineValue: 0,
  });

  // Tab-specific backend search & filter loading states
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [staffLoading, setStaffLoading] = useState(false);
  const [cartsLoading, setCartsLoading] = useState(false);

  // Search & Filter states
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");

  const [productSearch, setProductSearch] = useState("");
  const [productBrandFilter, setProductBrandFilter] = useState("all");

  const [customerSearch, setCustomerSearch] = useState("");
  const [staffSearch, setStaffSearch] = useState("");
  const [cartSearch, setCartSearch] = useState("");

  // Debounced Search inputs (avoids hammering the backend on every key stroke)
  const debouncedOrderSearch = useDebounce(orderSearch, 350);
  const debouncedProductSearch = useDebounce(productSearch, 350);
  const debouncedCustomerSearch = useDebounce(customerSearch, 350);
  const debouncedStaffSearch = useDebounce(staffSearch, 350);
  const debouncedCartSearch = useDebounce(cartSearch, 350);

  const isInitialLoaded = useRef(false);

  // Modals state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderModalData, setOrderModalData] = useState({
    orderStatus: "Processing",
    courierName: "Royal Mail Tracked 24",
    trackingNumber: "",
    estimatedDelivery: "2-4 working days",
  });

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductSlug, setEditingProductSlug] = useState(null);
  const [productModalTab, setProductModalTab] = useState("general");
  const [productFormData, setProductFormData] = useState(emptyProductForm);

  const [isNewAdminModalOpen, setIsNewAdminModalOpen] = useState(false);
  const [newAdminFormData, setNewAdminFormData] = useState(emptyNewAdminForm);

  // Detailed Row Inspection Modals State (Requirement: View full details for each row item)
  const [viewingOrder, setViewingOrder] = useState(null);
  const [viewingOrderTimeline, setViewingOrderTimeline] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [viewingCustomer, setViewingCustomer] = useState(null);
  const [viewingCart, setViewingCart] = useState(null);
  const [viewingStaff, setViewingStaff] = useState(null);

  // Check stored admin session and persistent active tab on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedAdmin = window.localStorage.getItem("electroVault.adminUser");
        if (storedAdmin) {
          const parsed = JSON.parse(storedAdmin);
          // Verify if session has already expired
          if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
            window.localStorage.removeItem("electroVault.adminUser");
            window.localStorage.removeItem("electroVault.adminAuthToken");
            setLoginError("Previous admin session expired. Please log in again.");
            setAdminUser(null);
          } else {
            setAdminUser(parsed);
            lastActivityRef.current = Date.now();
          }
        }
        const savedTab = window.localStorage.getItem("electroVault.adminActiveTab");
        if (savedTab && ["orders", "products", "customers", "carts", "staff"].includes(savedTab)) {
          setActiveTab(savedTab);
        }
      } catch (err) {
        console.error("Admin session load error:", err);
      } finally {
        setAuthChecking(false);
      }
    } else {
      setAuthChecking(false);
    }
  }, []);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("electroVault.adminActiveTab", tabKey);
    }
  };

  // Helper to compute KPI metrics from full store data
  const updateGlobalKpiMetrics = (allOrders = [], allProducts = [], allUsers = [], allStaff = [], allCarts = []) => {
    const rev = allOrders
      .filter((o) => o.orderStatus !== "Cancelled")
      .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
    const pending = allOrders.filter((o) => o.orderStatus === "Processing" || o.orderStatus === "Placed").length;
    const featured = allProducts.filter((p) => p.featured).length;
    const aov = allOrders.length > 0 ? rev / allOrders.length : 0;
    const cartPipeline = allCarts.reduce((sum, c) => sum + Number(c.cartTotal || 0), 0);

    setKpiMetrics({
      totalRevenue: rev,
      totalOrdersCount: allOrders.length,
      pendingDispatchCount: pending,
      totalProductsCount: allProducts.length,
      featuredCount: featured,
      staffCount: allStaff.length,
      customersCount: allUsers.length,
      avgOrderValue: aov,
      activeCartsCount: allCarts.length,
      cartPipelineValue: cartPipeline,
    });
  };

  // Initial load of dashboard data and global KPI metrics
  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [ordersRes, productsRes, usersRes, staffRes, cartsRes] = await Promise.all([
        fetchAdminOrders(),
        fetchAdminProducts(),
        fetchAdminUsers(),
        fetchAdminStaffList(),
        fetchAdminCarts(),
      ]);

      setOrders(ordersRes || []);
      setProducts(productsRes || []);
      setCustomers(usersRes || []);
      setStaffMembers(staffRes || []);
      setCarts(cartsRes || []);

      updateGlobalKpiMetrics(ordersRes || [], productsRes || [], usersRes || [], staffRes || [], cartsRes || []);
      isInitialLoaded.current = true;
    } catch (err) {
      console.error("Admin data load error:", err);
      toast.error("Data Load Error", "Failed to load dashboard metrics from MongoDB Atlas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminUser) {
      loadAdminData();
    }
  }, [adminUser]);

  // Backend API Filter: Orders (triggered on debounced search or status dropdown change)
  useEffect(() => {
    if (!isInitialLoaded.current || !adminUser) return;
    let isCurrent = true;
    setOrdersLoading(true);

    fetchAdminOrders({
      search: debouncedOrderSearch,
      status: orderStatusFilter,
    })
      .then((res) => {
        if (isCurrent) setOrders(res || []);
      })
      .catch((err) => console.error("Backend orders filter error:", err))
      .finally(() => {
        if (isCurrent) setOrdersLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [debouncedOrderSearch, orderStatusFilter, adminUser]);

  // Backend API Filter: Products (triggered on debounced search or brand dropdown change)
  useEffect(() => {
    if (!isInitialLoaded.current || !adminUser) return;
    let isCurrent = true;
    setProductsLoading(true);

    fetchAdminProducts({
      search: debouncedProductSearch,
      brand: productBrandFilter,
      limit: 200,
    })
      .then((res) => {
        if (isCurrent) setProducts(res || []);
      })
      .catch((err) => console.error("Backend products filter error:", err))
      .finally(() => {
        if (isCurrent) setProductsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [debouncedProductSearch, productBrandFilter, adminUser]);

  // Backend API Filter: Customers (triggered on debounced search change)
  useEffect(() => {
    if (!isInitialLoaded.current || !adminUser) return;
    let isCurrent = true;
    setCustomersLoading(true);

    fetchAdminUsers({
      search: debouncedCustomerSearch,
    })
      .then((res) => {
        if (isCurrent) setCustomers(res || []);
      })
      .catch((err) => console.error("Backend customers filter error:", err))
      .finally(() => {
        if (isCurrent) setCustomersLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [debouncedCustomerSearch, adminUser]);

  // Backend API Filter: Staff (triggered on debounced search change)
  useEffect(() => {
    if (!isInitialLoaded.current || !adminUser) return;
    let isCurrent = true;
    setStaffLoading(true);

    fetchAdminStaffList({
      search: debouncedStaffSearch,
    })
      .then((res) => {
        if (isCurrent) setStaffMembers(res || []);
      })
      .catch((err) => console.error("Backend staff filter error:", err))
      .finally(() => {
        if (isCurrent) setStaffLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [debouncedStaffSearch, adminUser]);

  // Backend API Filter: Carts (triggered on debounced search change)
  useEffect(() => {
    if (!isInitialLoaded.current || !adminUser) return;
    let isCurrent = true;
    setCartsLoading(true);

    fetchAdminCarts({
      search: debouncedCartSearch,
    })
      .then((res) => {
        if (isCurrent) setCarts(res || []);
      })
      .catch((err) => console.error("Backend carts filter error:", err))
      .finally(() => {
        if (isCurrent) setCartsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [debouncedCartSearch, adminUser]);

  // Track Admin Inactivity (30 mins) and Absolute Session Lifetime (2 hours)
  useEffect(() => {
    if (!adminUser) return;

    // Reset activity timer on real user interactions
    const handleUserInteraction = () => {
      lastActivityRef.current = Date.now();
    };

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((evt) => window.addEventListener(evt, handleUserInteraction, { passive: true }));

    // Listen to automatic token expiration notifications from apiClient
    const handleRemoteSessionExpired = (e) => {
      handleAdminLogout();
      setLoginError(
        e.detail?.reason === "expired"
          ? "Administrative session expired on server. Please sign in again."
          : "Session disconnected. Please re-authenticate."
      );
    };
    window.addEventListener("electroVault-admin-session-expired", handleRemoteSessionExpired);

    const INACTIVITY_LIMIT_MS = 30 * 60 * 1000; // 30 minutes
    const WARNING_BUFFER_MS = 60 * 1000; // 60 seconds warning countdown

    const interval = setInterval(() => {
      const now = Date.now();

      // 1. Check absolute session lifetime (2 hours)
      if (adminUser.expiresAt && now >= adminUser.expiresAt) {
        clearInterval(interval);
        setInactivityWarningOpen(false);
        handleAdminLogout();
        setLoginError("Your 2-hour administration session has concluded. Please sign in again.");
        toast.warning("Session Expired", "Maximum 2-hour administrative session reached.");
        return;
      }

      // 2. Check idle inactivity
      const idleTime = now - lastActivityRef.current;
      const timeLeftUntilLock = INACTIVITY_LIMIT_MS - idleTime;

      if (timeLeftUntilLock <= 0) {
        clearInterval(interval);
        setInactivityWarningOpen(false);
        handleAdminLogout();
        setLoginError("Staff portal locked due to 30 minutes of inactivity. Please log in again.");
        toast.error("Session Locked", "Logged out automatically due to 30 minutes of inactivity.");
      } else if (timeLeftUntilLock <= WARNING_BUFFER_MS) {
        setCountdownSeconds(Math.ceil(timeLeftUntilLock / 1000));
        setInactivityWarningOpen(true);
      } else {
        if (inactivityWarningOpen) {
          setInactivityWarningOpen(false);
        }
      }
    }, 1000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleUserInteraction));
      window.removeEventListener("electroVault-admin-session-expired", handleRemoteSessionExpired);
      clearInterval(interval);
    };
  }, [adminUser, inactivityWarningOpen]);

  // Handle Dedicated Admin Login
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    const res = await adminStaffLogin({
      email: loginEmail,
      password: loginPassword,
    });

    setLoginLoading(false);

    if (res.success && res.user) {
      lastActivityRef.current = Date.now();
      setAdminUser(res.user);
      toast.success("Staff Login Successful", `Welcome back, ${res.user.name}!`);
    } else {
      setLoginError(res.error || "Invalid staff email or password.");
      toast.error("Access Denied", res.error || "Staff authentication failed.");
    }
  };

  // Staff Logout with server session revocation and cookie clearing
  const handleAdminLogout = async () => {
    try {
      await adminStaffLogout();
    } catch (err) {
      console.error("Admin logout error:", err);
    }
    setAdminUser(null);
    setActiveTab("orders");
    setInactivityWarningOpen(false);
    toast.info("Staff Logged Out", "Admin session ended securely.");
  };

  // Extend active session when user acknowledges warning modal
  const handleExtendSession = async () => {
    lastActivityRef.current = Date.now();
    setInactivityWarningOpen(false);
    try {
      const res = await fetch("/api/admin/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();
      if (data.success && data.accessToken) {
        if (typeof window !== "undefined") {
          window.localStorage.setItem("electroVault.adminAuthToken", data.accessToken);
        }
        toast.success("Session Extended", "Your administrative session has been refreshed.");
      }
    } catch {
      toast.info("Activity Recorded", "Your session has been renewed.");
    }
  };

  // Handle Order Status Update
  const handleOpenOrderModal = (order) => {
    setSelectedOrder(order);
    setOrderModalData({
      orderStatus: order.orderStatus || "Processing",
      courierName: order.courierName || "Royal Mail Tracked 24",
      trackingNumber: order.trackingNumber || `GB-EV-${Math.floor(10000000 + Math.random() * 90000000)}`,
      estimatedDelivery: order.estimatedDelivery || "2-4 working days",
    });
    setIsOrderModalOpen(true);
  };

  const handleSaveOrderFulfillment = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    const res = await updateOrderFulfillment({
      orderId: selectedOrder._id || selectedOrder.id,
      orderNumber: selectedOrder.orderNumber,
      orderStatus: orderModalData.orderStatus,
      courierName: orderModalData.courierName,
      trackingNumber: orderModalData.trackingNumber,
      estimatedDelivery: orderModalData.estimatedDelivery,
      performedBy: adminUser?.name || "Admin Staff",
      performedByEmail: adminUser?.email || "",
      performedByRole: adminUser?.role || "admin",
      note: `Order status set to '${orderModalData.orderStatus}' with tracking '${orderModalData.trackingNumber}'.`,
    });

    if (res.success) {
      toast.success("Order Updated", `Order ${selectedOrder.orderNumber} status changed to ${orderModalData.orderStatus}`);
      setIsOrderModalOpen(false);
      loadAdminData();
    } else {
      toast.error("Update Failed", res.error || "Failed to update order status.");
    }
  };

  // Quick Inline Status Advancement
  const handleQuickAdvanceStatus = async (order, nextStatus) => {
    const res = await updateOrderFulfillment({
      orderId: order._id || order.id,
      orderNumber: order.orderNumber,
      orderStatus: nextStatus,
      performedBy: adminUser?.name || "Admin Staff",
      performedByEmail: adminUser?.email || "",
      performedByRole: adminUser?.role || "admin",
      note: `Quick advanced status to '${nextStatus}'.`,
    });

    if (res.success) {
      toast.success("Status Updated", `Order ${order.orderNumber} advanced to '${nextStatus}'`);
      setOrders((prev) =>
        prev.map((o) =>
          (o._id || o.id) === (order._id || order.id) ? (res.order || { ...o, orderStatus: nextStatus }) : o
        )
      );
    } else {
      toast.error("Update Failed", res.error || "Failed to update order.");
    }
  };

  // Product CRUD & Multi-Variant Management
  const handleOpenAddProductModal = () => {
    setEditingProductSlug(null);
    setProductModalTab("general");
    setProductFormData({
      ...emptyProductForm,
      colorVariants: [
        {
          colorName: "Space Black",
          hexCode: "#1e293b",
          imagesText: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
        },
      ],
      variantPricing: [
        {
          color: "Space Black",
          storage: "128GB",
          condition: "Good",
          price: "499.00",
          originalPrice: "799.00",
          stock: 5,
        },
      ],
      specifications: { ...emptyProductForm.specifications },
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProductModal = (prod) => {
    setEditingProductSlug(prod.slug);
    setProductModalTab("general");

    const colorVariants = Array.isArray(prod.colorVariants) && prod.colorVariants.length > 0
      ? prod.colorVariants.map((c) => ({
          colorName: c.colorName || "Standard",
          hexCode: c.hexCode || "#1e293b",
          imagesText: Array.isArray(c.images) ? c.images.join("\n") : c.images || "",
        }))
      : [
          {
            colorName: prod.color || "Standard",
            hexCode: "#1e293b",
            imagesText: Array.isArray(prod.images) ? prod.images.join("\n") : prod.images || "",
          },
        ];

    const variantPricing = Array.isArray(prod.variantPricing) && prod.variantPricing.length > 0
      ? prod.variantPricing.map((v) => ({
          color: v.color || prod.color || "Standard",
          storage: v.storage || prod.storage || "128GB",
          condition: v.condition || prod.condition || "Good",
          price: String(v.price ?? prod.price ?? ""),
          originalPrice: String(v.originalPrice ?? prod.originalPrice ?? ""),
          stock: v.stock !== undefined ? Number(v.stock) : 5,
        }))
      : [
          {
            color: prod.color || "Standard",
            storage: prod.storage || "128GB",
            condition: prod.condition || "Good",
            price: String(prod.price || "499.00"),
            originalPrice: String(prod.originalPrice || "799.00"),
            stock: prod.stock !== undefined ? Number(prod.stock) : 5,
          },
        ];

    const specifications = prod.specifications && Object.keys(prod.specifications).length > 0
      ? { ...emptyProductForm.specifications, ...prod.specifications }
      : { ...emptyProductForm.specifications };

    setProductFormData({
      name: prod.name || "",
      brand: prod.brand || "Apple",
      category: prod.category || "Smartphones",
      price: prod.price || "",
      originalPrice: prod.originalPrice || "",
      stock: prod.stock !== undefined ? prod.stock : 10,
      condition: prod.condition || "Good",
      storage: prod.storage || "128GB",
      color: prod.color || "Standard",
      images: Array.isArray(prod.images) ? prod.images.join(", ") : prod.images || "",
      shortDescription: prod.shortDescription || "",
      description: prod.description || "",
      featured: Boolean(prod.featured),
      isHotDeal: Boolean(prod.isHotDeal),
      colorVariants,
      variantPricing,
      specifications,
    });
    setIsProductModalOpen(true);
  };

  // Color Variants Helpers
  const handleAddColorVariant = () => {
    setProductFormData((prev) => ({
      ...prev,
      colorVariants: [
        ...prev.colorVariants,
        { colorName: `Color ${(prev.colorVariants?.length || 0) + 1}`, hexCode: "#3b82f6", imagesText: "" },
      ],
    }));
  };

  const handleRemoveColorVariant = (index) => {
    setProductFormData((prev) => ({
      ...prev,
      colorVariants: prev.colorVariants.filter((_, i) => i !== index),
    }));
  };

  const handleColorVariantChange = (index, field, value) => {
    setProductFormData((prev) => {
      const updated = [...prev.colorVariants];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, colorVariants: updated };
    });
  };

  // Variant Matrix Helpers
  const handleAddVariantRow = () => {
    const firstColor = productFormData.colorVariants?.[0]?.colorName || "Standard";
    setProductFormData((prev) => ({
      ...prev,
      variantPricing: [
        ...prev.variantPricing,
        {
          color: firstColor,
          storage: "128GB",
          condition: "Good",
          price: prev.price || "499.00",
          originalPrice: prev.originalPrice || "799.00",
          stock: 3,
        },
      ],
    }));
  };

  const handleRemoveVariantRow = (index) => {
    setProductFormData((prev) => ({
      ...prev,
      variantPricing: prev.variantPricing.filter((_, i) => i !== index),
    }));
  };

  const handleVariantRowChange = (index, field, value) => {
    setProductFormData((prev) => {
      const updated = [...prev.variantPricing];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, variantPricing: updated };
    });
  };

  // Auto-Matrix Generator across Colors x Storages x Conditions
  const handleGenerateMatrix = () => {
    const colors = (productFormData.colorVariants || []).map((c) => c.colorName.trim()).filter(Boolean);
    const storages = ["128GB", "256GB"];
    const conditions = ["Good", "Excellent"];

    if (colors.length === 0) {
      toast.warning("Add Colors First", "Please add at least one color in the Colors & Photos tab.");
      return;
    }

    const basePrice = Number(productFormData.price) || 499;
    const baseRrp = Number(productFormData.originalPrice) || 799;

    const generated = [];
    colors.forEach((col) => {
      storages.forEach((stg) => {
        conditions.forEach((cond) => {
          const stgOffset = stg === "256GB" ? 50 : 0;
          const condOffset = cond === "Excellent" ? 40 : 0;
          generated.push({
            color: col,
            storage: stg,
            condition: cond,
            price: (basePrice + stgOffset + condOffset).toFixed(2),
            originalPrice: (baseRrp + stgOffset + condOffset).toFixed(2),
            stock: 3,
          });
        });
      });
    });

    setProductFormData((prev) => ({
      ...prev,
      variantPricing: generated,
    }));
    toast.success("Combinations Generated", `Generated ${generated.length} variant inventory rows.`);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();

    // 1. Sanitize Color Variants with dedicated image arrays
    const sanitizedColorVariants = (productFormData.colorVariants || []).map((cv) => {
      const imgList = (cv.imagesText || "")
        .split(/[\n,]+/)
        .map((url) => url.trim())
        .filter(Boolean);
      return {
        colorName: cv.colorName.trim() || "Standard",
        hexCode: cv.hexCode || "#0f172a",
        images: imgList.length > 0 ? imgList : ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80"],
      };
    });

    // 2. Sanitize Variant Matrix
    const sanitizedVariants = (productFormData.variantPricing || []).map((v) => ({
      color: v.color?.trim() || "Standard",
      storage: v.storage?.trim() || "128GB",
      condition: v.condition?.trim() || "Good",
      price: Number(v.price) || Number(productFormData.price) || 0,
      originalPrice: Number(v.originalPrice) || Number(productFormData.originalPrice) || 0,
      stock: Number(v.stock) || 0,
      isAvailable: Number(v.stock) > 0,
    }));

    // 3. Auto-calculate aggregated stock
    const computedTotalStock = sanitizedVariants.length > 0
      ? sanitizedVariants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)
      : Number(productFormData.stock) || 10;

    // 4. Auto-calculate starting price
    const variantPrices = sanitizedVariants.map((v) => Number(v.price)).filter((p) => p > 0);
    const computedBasePrice = variantPrices.length > 0 ? Math.min(...variantPrices) : Number(productFormData.price) || 0;

    // 5. Aggregate all images for catalog card thumbnails
    const allImages = sanitizedColorVariants.flatMap((c) => c.images).filter(Boolean);

    const payload = {
      name: productFormData.name,
      brand: productFormData.brand,
      category: productFormData.category || "Smartphones",
      price: computedBasePrice,
      originalPrice: Number(productFormData.originalPrice || computedBasePrice * 1.2),
      stock: computedTotalStock,
      condition: sanitizedVariants[0]?.condition || productFormData.condition || "Good",
      storage: sanitizedVariants[0]?.storage || productFormData.storage || "128GB",
      color: sanitizedColorVariants[0]?.colorName || productFormData.color || "Standard",
      images: allImages.length > 0 ? allImages : ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80"],
      shortDescription: productFormData.shortDescription || `${productFormData.name} - Certified Refurbished with 12-Month Seller Warranty`,
      description: productFormData.description || `${productFormData.name} refurbished handset. 50-point diagnostic inspection completed.`,
      featured: Boolean(productFormData.featured),
      isHotDeal: Boolean(productFormData.isHotDeal),
      colorVariants: sanitizedColorVariants,
      variantPricing: sanitizedVariants,
      specifications: productFormData.specifications || {},
      availableColors: [...new Set(sanitizedColorVariants.map((c) => c.colorName))],
      availableStorage: [...new Set(sanitizedVariants.map((v) => v.storage))],
      conditionOptions: [...new Set(sanitizedVariants.map((v) => v.condition))],
    };

    let res;
    if (editingProductSlug) {
      res = await updateAdminProduct(editingProductSlug, payload);
    } else {
      res = await createAdminProduct(payload);
    }

    if (res.success) {
      toast.success("Catalog Updated", editingProductSlug ? "Product updated successfully!" : "New product listing created!");
      setIsProductModalOpen(false);
      loadAdminData();
    } else {
      toast.error("Save Failed", res.error || "Failed to save product.");
    }
  };

  const handleToggleFeatured = async (prod) => {
    const newFeatured = !prod.featured;
    const res = await updateAdminProduct(prod.slug, { featured: newFeatured });
    if (res.success) {
      toast.info("Featured Status Changed", `${prod.name} featured state: ${newFeatured ? "ON" : "OFF"}`);
      setProducts((prev) =>
        prev.map((p) => (p.slug === prod.slug ? { ...p, featured: newFeatured } : p))
      );
    }
  };

  const handleToggleHotDeal = async (prod) => {
    const newHotDeal = !prod.isHotDeal;
    const res = await updateAdminProduct(prod.slug, { isHotDeal: newHotDeal });
    if (res.success) {
      toast.info("Hot Deal Status Changed", `${prod.name} hot deal state: ${newHotDeal ? "ON" : "OFF"}`);
      setProducts((prev) =>
        prev.map((p) => (p.slug === prod.slug ? { ...p, isHotDeal: newHotDeal } : p))
      );
    } else {
      toast.error("Update Failed", res.error || "Could not update hot deal status.");
    }
  };

  const handleQuickStockChange = async (prod, delta) => {
    const newStock = Math.max(0, Number(prod.stock || 0) + delta);
    const res = await updateAdminProduct(prod.slug, { stock: newStock });
    if (res.success) {
      setProducts((prev) =>
        prev.map((p) => (p.slug === prod.slug ? { ...p, stock: newStock } : p))
      );
    }
  };

  const handleDeleteProduct = async (prod) => {
    if (!window.confirm(`Are you sure you want to delete "${prod.name}" from MongoDB Atlas?`)) {
      return;
    }
    const res = await deleteAdminProduct(prod.slug);
    if (res.success) {
      toast.success("Product Deleted", `${prod.name} has been removed from inventory.`);
      setProducts((prev) => prev.filter((p) => p.slug !== prod.slug));
    } else {
      toast.error("Delete Failed", res.error || "Failed to delete product.");
    }
  };

  const isSuperAdmin = useMemo(() => {
    if (!adminUser) return false;
    const role = (adminUser.role || "").toLowerCase().trim();
    return role === "superadmin";
  }, [adminUser]);

  // Create Multi-Admin Account Handler (Restricted to Super Admin / Store Owner)
  const handleCreateNewAdmin = async (e) => {
    e.preventDefault();

    if (!isSuperAdmin) {
      toast.error("Permission Denied", "Only Store Owner / Super Admin can create new admin accounts.");
      return;
    }

    const res = await createAdminStaffAccount({
      ...newAdminFormData,
      requesterEmail: adminUser?.email,
    });

    if (res.success) {
      toast.success("Admin Account Created", res.message || `New Admin account created for ${newAdminFormData.name}!`);
      setIsNewAdminModalOpen(false);
      setNewAdminFormData(emptyNewAdminForm);
      loadAdminData();
    } else {
      toast.error("Creation Failed", res.error || "Failed to create Admin account.");
    }
  };

  // Skeleton Layout Loading Gate
  if (authChecking) {
    return (
      <main className="py-4 py-lg-5 bg-soft min-vh-100 placeholder-glow">
        <Container>
          {/* Skeleton Header Top Bar */}
          <header
            className="text-white py-3 px-4 mb-4 shadow-sm rounded-4"
            style={{
              backgroundColor: "#0f172a",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
              {/* Left Brand Skeleton */}
              <div className="d-flex align-items-center gap-3">
                <div
                  className="bg-secondary bg-opacity-25 rounded-3 placeholder"
                  style={{ width: "42px", height: "42px" }}
                />
                <div className="d-flex flex-column gap-1.5" style={{ width: "220px" }}>
                  <span className="placeholder bg-secondary bg-opacity-50 col-10 rounded-pill py-1" />
                  <span className="placeholder bg-secondary bg-opacity-25 col-7 rounded-pill py-1" />
                </div>
              </div>

              {/* Right Profile & Logout Skeleton */}
              <div className="d-flex align-items-center gap-3.5">
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="bg-secondary bg-opacity-25 rounded-circle placeholder"
                    style={{ width: "40px", height: "40px" }}
                  />
                  <div className="d-flex flex-column gap-1.5" style={{ width: "120px" }}>
                    <span className="placeholder bg-secondary bg-opacity-50 col-9 rounded-pill py-1" />
                    <span className="placeholder bg-secondary bg-opacity-25 col-6 rounded-pill py-1" />
                  </div>
                </div>
                <div className="vr bg-secondary opacity-25 d-none d-sm-block my-1" style={{ height: "26px" }} />
                <span
                  className="placeholder bg-secondary bg-opacity-25 rounded-pill"
                  style={{ width: "90px", height: "34px" }}
                />
              </div>
            </div>
          </header>

          {/* Skeleton KPI Metric Cards */}
          <div className="row g-3 g-xl-4 mb-4">
            {[1, 2, 3, 4].map((idx) => (
              <div key={idx} className="col-12 col-sm-6 col-lg-3">
                <div className="card border-0 rounded-4 shadow-sm p-4 h-100 bg-white">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <span className="placeholder bg-secondary bg-opacity-25 col-6 rounded-pill py-1" />
                    <div
                      className="bg-secondary bg-opacity-10 rounded-3 placeholder"
                      style={{ width: "38px", height: "38px" }}
                    />
                  </div>
                  <div className="mb-2">
                    <span className="placeholder bg-secondary bg-opacity-50 col-8 rounded-2 py-2" />
                  </div>
                  <span className="placeholder bg-secondary bg-opacity-25 col-5 rounded-pill py-1" />
                </div>
              </div>
            ))}
          </div>

          {/* Skeleton Tab & Table Card */}
          <div className="card border-0 rounded-4 shadow-sm bg-white overflow-hidden mb-4">
            <div className="d-flex border-bottom bg-light px-3 pt-3 gap-2">
              <span className="placeholder bg-secondary bg-opacity-25 rounded-top-3 py-2.5 px-4 me-2" style={{ width: "140px" }} />
              <span className="placeholder bg-secondary bg-opacity-10 rounded-top-3 py-2.5 px-4 me-2" style={{ width: "150px" }} />
              <span className="placeholder bg-secondary bg-opacity-10 rounded-top-3 py-2.5 px-4 me-2" style={{ width: "160px" }} />
              <span className="placeholder bg-secondary bg-opacity-10 rounded-top-3 py-2.5 px-4" style={{ width: "180px" }} />
            </div>

            <div className="p-4">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <span className="placeholder bg-secondary bg-opacity-25 rounded-pill" style={{ width: "240px", height: "36px" }} />
                <span className="placeholder bg-secondary bg-opacity-25 rounded-pill" style={{ width: "150px", height: "36px" }} />
              </div>

              <div className="d-flex flex-column gap-3">
                {[1, 2, 3, 4, 5].map((row) => (
                  <div key={row} className="d-flex align-items-center justify-content-between py-2 border-bottom border-light">
                    <span className="placeholder bg-secondary bg-opacity-25 col-3 rounded-pill py-1.5" />
                    <span className="placeholder bg-secondary bg-opacity-25 col-2 rounded-pill py-1.5" />
                    <span className="placeholder bg-secondary bg-opacity-25 col-2 rounded-pill py-1.5" />
                    <span className="placeholder bg-secondary bg-opacity-25 col-1 rounded-pill py-1.5" />
                    <span className="placeholder bg-secondary bg-opacity-25 col-1 rounded-pill py-1.5" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </main>
    );
  }

  // IF UNAUTHENTICATED IN STAFF PORTAL: SHOW DEDICATED ADMIN LOGIN SCREEN
  if (!adminUser) {
    return (
      <main className="py-5 bg-dark min-vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: "#0b1329" }}>
        <Container>
          <div className="row justify-content-center">
            <div className="col-12 col-md-8 col-lg-5">
              <div className="card border-0 rounded-4 shadow-lg overflow-hidden bg-white">
                <div className="p-4 bg-primary text-white text-center">
                  <div className="d-inline-flex align-items-center justify-content-center bg-white text-primary p-3 rounded-circle mb-2 shadow-sm">
                    <Shield size={32} />
                  </div>
                  <h4 className="fw-bold mb-1">ElectroVault Staff Portal</h4>
                  <small className="text-white-50">Dedicated Store Operations & Management Login</small>
                </div>

                <div className="p-4 p-md-5">
                  {loginError && (
                    <div className="alert alert-danger border-danger rounded-3 small py-2 mb-3 fw-semibold">
                      ⚠️ {loginError}
                    </div>
                  )}

                  <form onSubmit={handleAdminLogin}>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-dark">Staff Email Address</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0 text-muted">
                          <Mail size={16} />
                        </span>
                        <input
                          type="email"
                          className="form-control border-start-0"
                          placeholder="admin@electronicstore.co.uk"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="form-label small fw-semibold text-dark">Staff Password</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0 text-muted">
                          <KeyRound size={16} />
                        </span>
                        <input
                          type="password"
                          className="form-control border-start-0 font-monospace"
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary btn-lg w-100 py-2.5 rounded-3 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 mb-3"
                      disabled={loginLoading}
                    >
                      {loginLoading ? (
                        <span className="spinner-border spinner-border-sm me-2" />
                      ) : (
                        <>
                          <span>Log In to Staff Dashboard</span>
                          <ChevronRight size={18} />
                        </>
                      )}
                    </button>
                  </form>


                  <div className="text-center mt-4">
                    <Link href="/" className="text-decoration-none small text-muted hover-primary">
                      ← Exit to Main Customer Storefront
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </main>
    );
  }

  // AUTHORIZED STAFF OPERATIONS DASHBOARD
  return (
    <main className="py-4 py-lg-5 bg-soft min-vh-100">
      <Container>
        {/* Dedicated Standalone Admin Top Bar */}
        <header
          className="text-white py-3 px-4 mb-4 shadow-sm rounded-4"
          style={{
            backgroundColor: "#0f172a",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            {/* Left Branding */}
            <div className="d-flex align-items-center gap-3">
              <div
                className="d-flex align-items-center justify-content-center bg-primary bg-gradient text-white rounded-3 shadow-sm flex-shrink-0"
                style={{ width: "42px", height: "42px" }}
              >
                <ShieldCheck size={24} />
              </div>
              <div>
                <div className="d-flex align-items-center gap-2">
                  <h5 className="fw-bold mb-0 text-white" style={{ letterSpacing: "-0.01em" }}>
                    ElectroVault Operations Hub
                  </h5>
                  <span
                    className="badge bg-primary bg-opacity-20 text-info border border-info border-opacity-25 rounded-pill px-2 py-0.5"
                    style={{ fontSize: "0.68rem" }}
                  >
                    Staff Portal
                  </span>
                </div>
                <small className="text-white-50" style={{ fontSize: "0.76rem" }}>
                  Live Store & Inventory Management System
                </small>
              </div>
            </div>

            {/* Right Side: Profile & Logout (no outer border, generous spacing) */}
            <div className="d-flex align-items-center gap-3.5">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="position-relative d-flex align-items-center justify-content-center bg-primary bg-gradient text-white fw-bold rounded-circle shadow-sm flex-shrink-0"
                  style={{ width: "40px", height: "40px", fontSize: "1rem" }}
                >
                  {adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : "A"}
                  <span
                    className="position-absolute bottom-0 end-0 bg-success border border-2 rounded-circle"
                    style={{
                      width: "11px",
                      height: "11px",
                      borderColor: "#0f172a",
                      transform: "translate(15%, 15%)",
                    }}
                    title="Active Admin Session"
                  />
                </div>
                <div className="d-flex flex-column text-start" style={{ lineHeight: "1.25" }}>
                  <span className="fw-semibold text-white fs-6">
                    {adminUser?.name || "Admin Staff"}
                  </span>
                  <span
                    className={`small fw-medium ${isSuperAdmin ? "text-warning" : "text-white-50"}`}
                    style={{ fontSize: "0.74rem" }}
                  >
                    {isSuperAdmin ? "★ Super Admin" : "Staff Administrator"}
                  </span>
                </div>
              </div>

              <div
                className="vr bg-secondary opacity-25 d-none d-sm-block my-1"
                style={{ height: "26px" }}
              />

              {/* Log Out Button */}
              <button
                type="button"
                className="btn btn-outline-danger btn-sm rounded-pill px-3.5 py-1.5 fw-semibold d-flex align-items-center gap-1.5 transition-all shadow-xs"
                onClick={handleAdminLogout}
                title="Log out of Staff Session"
              >
                <LogOut size={14} />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </header>

        {/* Analytics KPI Metric Cards */}
        <div className="row g-3 g-xl-4 mb-4">
          {/* 1. Total Store Revenue */}
          <div className="col-12 col-sm-6 col-lg-3">
            <div
              className="card border rounded-4 shadow-sm p-4 h-100 position-relative overflow-hidden transition-all"
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)",
                borderColor: "#bbf7d0",
              }}
            >
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="small text-muted fw-bold text-uppercase" style={{ fontSize: "0.72rem", letterSpacing: "0.05em" }}>
                  Total Store Revenue
                </span>
                <div
                  className="d-flex align-items-center justify-content-center bg-success text-white rounded-3 shadow-xs"
                  style={{ width: "38px", height: "38px" }}
                >
                  <DollarSign size={20} />
                </div>
              </div>
              <h3 className="fw-bold text-dark mb-1" style={{ letterSpacing: "-0.02em" }}>
                £{kpiMetrics.totalRevenue.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
              </h3>
              <div className="small text-success fw-medium d-flex align-items-center gap-1.5 mt-2" style={{ fontSize: "0.78rem" }}>
                <TrendingUp size={14} />
                <span>{kpiMetrics.totalOrdersCount} orders processed</span>
              </div>
            </div>
          </div>

          {/* 2. Total Orders Placed */}
          <div className="col-12 col-sm-6 col-lg-3">
            <div
              className="card border rounded-4 shadow-sm p-4 h-100 position-relative overflow-hidden transition-all"
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)",
                borderColor: "#bfdbfe",
              }}
            >
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="small text-muted fw-bold text-uppercase" style={{ fontSize: "0.72rem", letterSpacing: "0.05em" }}>
                  Total Orders Placed
                </span>
                <div
                  className="d-flex align-items-center justify-content-center bg-primary text-white rounded-3 shadow-xs"
                  style={{ width: "38px", height: "38px" }}
                >
                  <ShoppingBag size={20} />
                </div>
              </div>
              <h3 className="fw-bold text-dark mb-1" style={{ letterSpacing: "-0.02em" }}>
                {kpiMetrics.totalOrdersCount}
              </h3>
              <div className="small text-primary fw-medium d-flex align-items-center gap-1.5 mt-2" style={{ fontSize: "0.78rem" }}>
                <Clock size={14} />
                <span>{kpiMetrics.pendingDispatchCount} pending dispatch</span>
              </div>
            </div>
          </div>

          {/* 3. Handset Inventory */}
          <div className="col-12 col-sm-6 col-lg-3">
            <div
              className="card border rounded-4 shadow-sm p-4 h-100 position-relative overflow-hidden transition-all"
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)",
                borderColor: "#e9d5ff",
              }}
            >
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="small text-muted fw-bold text-uppercase" style={{ fontSize: "0.72rem", letterSpacing: "0.05em" }}>
                  Handset Inventory
                </span>
                <div
                  className="d-flex align-items-center justify-content-center text-white rounded-3 shadow-xs"
                  style={{ width: "38px", height: "38px", backgroundColor: "#9333ea" }}
                >
                  <Package size={20} />
                </div>
              </div>
              <h3 className="fw-bold text-dark mb-1" style={{ letterSpacing: "-0.02em" }}>
                {kpiMetrics.totalProductsCount}
              </h3>
              <div className="small fw-medium d-flex align-items-center gap-1.5 mt-2" style={{ fontSize: "0.78rem", color: "#7e22ce" }}>
                <Sparkles size={14} />
                <span>{kpiMetrics.featuredCount} featured listings</span>
              </div>
            </div>
          </div>

          {/* 4. Average Order Value (AOV) & Cart Pipeline (Replaced Staff card per user request) */}
          <div className="col-12 col-sm-6 col-lg-3">
            <div
              className="card border rounded-4 shadow-sm p-4 h-100 position-relative overflow-hidden transition-all"
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #fff7ed 100%)",
                borderColor: "#ffedd5",
              }}
            >
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="small text-muted fw-bold text-uppercase" style={{ fontSize: "0.72rem", letterSpacing: "0.05em" }}>
                  Avg. Order Value (AOV)
                </span>
                <div
                  className="d-flex align-items-center justify-content-center text-white rounded-3 shadow-xs"
                  style={{ width: "38px", height: "38px", backgroundColor: "#ea580c" }}
                >
                  <TrendingUp size={20} />
                </div>
              </div>
              <h3 className="fw-bold text-dark mb-1" style={{ letterSpacing: "-0.02em" }}>
                £{Number(kpiMetrics.avgOrderValue || 0).toFixed(2)}
              </h3>
              <div className="small fw-medium d-flex align-items-center gap-1.5 mt-2" style={{ fontSize: "0.78rem", color: "#c2410c" }}>
                <ShoppingCart size={14} />
                <span>{kpiMetrics.activeCartsCount || 0} active carts (£{Number(kpiMetrics.cartPipelineValue || 0).toFixed(2)})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="card border-0 rounded-4 shadow-sm bg-white overflow-hidden mb-4">
          <div className="d-flex border-bottom bg-light px-3 pt-3 gap-2 overflow-x-auto">
            <button
              type="button"
              className={`btn px-4 py-2.5 fw-bold rounded-top-3 border-0 transition-all ${
                activeTab === "orders" ? "bg-white text-primary shadow-xs border-top border-primary border-3" : "text-muted hover-bg-white"
              }`}
              onClick={() => handleTabChange("orders")}
            >
              <ShoppingBag size={18} className="me-2" />
              Live Orders ({kpiMetrics.totalOrdersCount})
            </button>
            <button
              type="button"
              className={`btn px-4 py-2.5 fw-bold rounded-top-3 border-0 transition-all ${
                activeTab === "products" ? "bg-white text-primary shadow-xs border-top border-primary border-3" : "text-muted hover-bg-white"
              }`}
              onClick={() => handleTabChange("products")}
            >
              <Package size={18} className="me-2" />
              Product Catalog ({kpiMetrics.totalProductsCount})
            </button>
            <button
              type="button"
              className={`btn px-4 py-2.5 fw-bold rounded-top-3 border-0 transition-all ${
                activeTab === "customers" ? "bg-white text-primary shadow-xs border-top border-primary border-3" : "text-muted hover-bg-white"
              }`}
              onClick={() => handleTabChange("customers")}
            >
              <Users size={18} className="me-2" />
              Customer Directory ({kpiMetrics.customersCount})
            </button>
            <button
              type="button"
              className={`btn px-4 py-2.5 fw-bold rounded-top-3 border-0 transition-all ${
                activeTab === "carts" ? "bg-white text-primary shadow-xs border-top border-primary border-3" : "text-muted hover-bg-white"
              }`}
              onClick={() => handleTabChange("carts")}
            >
              <ShoppingCart size={18} className="me-2" />
              Items in Cart ({kpiMetrics.activeCartsCount || 0})
            </button>
            <button
              type="button"
              className={`btn px-4 py-2.5 fw-bold rounded-top-3 border-0 transition-all ${
                activeTab === "staff" ? "bg-white text-primary shadow-xs border-top border-primary border-3" : "text-muted hover-bg-white"
              }`}
              onClick={() => handleTabChange("staff")}
            >
              <UserPlus size={18} className="me-2" />
              Admin Team & Staff Accounts ({kpiMetrics.staffCount})
            </button>
          </div>

          <div className="p-4">
            {/* TAB 1: ORDERS FULFILLMENT MANAGER */}
            {activeTab === "orders" && (
              <div>
                {/* Search & Status Filters */}
                <div className="d-flex flex-column flex-md-row align-items-stretch align-items-md-center justify-content-between gap-3 mb-4">
                  <AdminSearchInput
                    value={orderSearch}
                    onChange={setOrderSearch}
                    placeholder="Search Order #, email, customer..."
                    isLoading={ordersLoading}
                    id="order-search-input"
                  />

                  <div className="d-flex align-items-center gap-2 justify-content-between justify-content-md-end flex-wrap">
                    <label htmlFor="order-status-filter" className="small text-muted fw-bold text-uppercase d-none d-sm-inline mb-0" style={{ fontSize: "0.72rem" }}>
                      Filter Status:
                    </label>
                    <select
                      id="order-status-filter"
                      className="form-select form-select-sm bg-white shadow-xs"
                      style={{ minWidth: "160px", maxWidth: "200px" }}
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value)}
                    >
                      <option value="all">All Orders</option>
                      <option value="Processing">Processing</option>
                      <option value="50-Point Checked">50-Point Checked</option>
                      <option value="Dispatched">Dispatched</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Orders Table */}
                {orders.length === 0 ? (
                  <div className="text-center py-5 bg-light rounded-4 border border-dashed">
                    <ShoppingBag size={32} className="text-muted mb-2" />
                    <h6 className="fw-bold text-dark">No orders found</h6>
                    <p className="text-muted small mb-0">Try adjusting your search query or status filter.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className={`table table-hover align-middle border mb-0 rounded-3 overflow-hidden ${ordersLoading ? "opacity-75" : ""}`}>
                      <thead className="table-light">
                        <tr className="small text-uppercase text-muted" style={{ letterSpacing: "0.05em", fontSize: "0.72rem" }}>
                          <th className="py-3 px-3">Order Ref #</th>
                          <th className="py-3 px-3">Customer</th>
                          <th className="py-3 px-3">Items Ordered</th>
                          <th className="py-3 px-3">Total Amount</th>
                          <th className="py-3 px-3">Live Delivery Status</th>
                          <th className="py-3 px-3 text-end">Action / Update</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => {
                          const status = order.orderStatus || "Processing";
                          const recipient = order.shippingAddress?.fullName || order.guestEmail || "Customer";
                          const total = Number(order.totalAmount || 0);

                          return (
                            <tr key={order._id || order.id}>
                              <td className="px-3">
                                <span className="font-monospace fw-bold text-primary d-block" style={{ fontSize: "0.88rem" }}>
                                  {order.orderNumber}
                                </span>
                                <small className="text-muted" style={{ fontSize: "0.72rem" }}>
                                  {new Date(order.createdAt).toLocaleDateString("en-GB", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </small>
                              </td>

                              <td className="px-3">
                                <div className="fw-bold text-dark small">{recipient}</div>
                                <div className="text-muted small" style={{ fontSize: "0.75rem" }}>
                                  ✉️ {order.shippingAddress?.email || order.guestEmail}
                                </div>
                                <div className="text-muted small" style={{ fontSize: "0.72rem" }}>
                                  📍 {order.shippingAddress?.city || "London"}, {order.shippingAddress?.postcode || "UK"}
                                </div>
                              </td>

                              <td className="px-3">
                                <div className="d-flex flex-column gap-1">
                                  {order.items?.slice(0, 2).map((it, idx) => (
                                    <div key={idx} className="small text-dark" style={{ fontSize: "0.8rem" }}>
                                      • <strong>{it.name}</strong> ({it.selectedOptions?.storage || "128GB"}) × {it.quantity || 1}
                                    </div>
                                  ))}
                                  {order.items?.length > 2 && (
                                    <span className="text-muted small" style={{ fontSize: "0.72rem" }}>
                                      +{order.items.length - 2} more item(s)
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td className="px-3 fw-bold text-primary" style={{ fontSize: "0.95rem" }}>
                                £{total.toFixed(2)}
                              </td>

                              <td className="px-3">
                                {status === "Delivered" && (
                                  <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2.5 py-1">
                                    ✓ Delivered
                                  </span>
                                )}
                                {status === "Dispatched" && (
                                  <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2.5 py-1">
                                    🚚 Dispatched
                                  </span>
                                )}
                                {status === "50-Point Checked" && (
                                  <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 px-2.5 py-1">
                                    🛡️ 50-Pt Checked
                                  </span>
                                )}
                                {(status === "Processing" || status === "Placed") && (
                                  <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 px-2.5 py-1">
                                    ⏳ Processing
                                  </span>
                                )}
                                {status === "Cancelled" && (
                                  <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-2.5 py-1">
                                    ✕ Cancelled
                                  </span>
                                )}

                                {order.trackingNumber && (
                                  <small className="d-block text-muted mt-1 font-monospace" style={{ fontSize: "0.7rem" }}>
                                    Ref: {order.trackingNumber}
                                  </small>
                                )}
                              </td>

                              <td className="px-3 text-end">
                                <div className="d-flex align-items-center justify-content-end gap-2">
                                  {status === "Processing" && (
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-info rounded-2 py-1 px-2 fw-semibold"
                                      style={{ fontSize: "0.75rem" }}
                                      onClick={() => handleQuickAdvanceStatus(order, "50-Point Checked")}
                                    >
                                      Mark 50-Pt Check
                                    </button>
                                  )}
                                  {status === "50-Point Checked" && (
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-primary rounded-2 py-1 px-2 fw-semibold"
                                      style={{ fontSize: "0.75rem" }}
                                      onClick={() => handleQuickAdvanceStatus(order, "Dispatched")}
                                    >
                                      Dispatch
                                    </button>
                                  )}
                                  {status === "Dispatched" && (
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-success rounded-2 py-1 px-2 fw-semibold"
                                      style={{ fontSize: "0.75rem" }}
                                      onClick={() => handleQuickAdvanceStatus(order, "Delivered")}
                                    >
                                      Mark Delivered
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-info rounded-2 d-inline-flex align-items-center justify-content-center"
                                    style={{ width: "32px", height: "32px", padding: 0 }}
                                    onClick={() => setViewingOrderTimeline(order)}
                                    title="View Activity Timeline & Admin Audit Log"
                                  >
                                    <History size={15} />
                                  </button>

                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-secondary rounded-2 d-inline-flex align-items-center justify-content-center"
                                    style={{ width: "32px", height: "32px", padding: 0 }}
                                    onClick={() => setViewingOrder(order)}
                                    title="View Complete Order Details"
                                  >
                                    <Eye size={15} />
                                  </button>

                                  <button
                                    type="button"
                                    className="btn btn-sm btn-primary rounded-2 d-inline-flex align-items-center justify-content-center"
                                    style={{ width: "32px", height: "32px", padding: 0 }}
                                    onClick={() => handleOpenOrderModal(order)}
                                    title="Edit order status & tracking"
                                  >
                                    <Pencil size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: PRODUCT CATALOG */}
            {activeTab === "products" && (
              <div>
                <div className="d-flex flex-column flex-md-row align-items-stretch align-items-md-center justify-content-between gap-3 mb-4">
                  <AdminSearchInput
                    value={productSearch}
                    onChange={setProductSearch}
                    placeholder="Search model, brand, slug..."
                    isLoading={productsLoading}
                    id="product-search-input"
                  />

                  <div className="d-flex align-items-center gap-2.5 justify-content-between justify-content-md-end flex-wrap">
                    <div className="d-flex align-items-center gap-2">
                      <label htmlFor="product-brand-filter" className="small text-muted fw-bold text-uppercase d-none d-sm-inline mb-0" style={{ fontSize: "0.72rem" }}>
                        Brand:
                      </label>
                      <select
                        id="product-brand-filter"
                        className="form-select form-select-sm bg-white shadow-xs"
                        style={{ minWidth: "140px", maxWidth: "160px" }}
                        value={productBrandFilter}
                        onChange={(e) => setProductBrandFilter(e.target.value)}
                      >
                        <option value="all">All Brands</option>
                        <option value="Apple">Apple</option>
                        <option value="Samsung">Samsung</option>
                        <option value="Google">Google</option>
                        <option value="OnePlus">OnePlus</option>
                        <option value="Xiaomi">Xiaomi</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      className="btn btn-primary btn-sm px-3 py-1.5 rounded-3 fw-bold d-flex align-items-center gap-1.5 shadow-sm"
                      onClick={handleOpenAddProductModal}
                    >
                      <Plus size={16} /> Add New Handset Listing
                    </button>
                  </div>
                </div>

                {products.length === 0 ? (
                  <div className="text-center py-5 bg-light rounded-4 border border-dashed">
                    <Package size={32} className="text-muted mb-2" />
                    <h6 className="fw-bold text-dark">No products found</h6>
                    <p className="text-muted small mb-0">Try searching a different handset model or changing the brand filter.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className={`table table-hover align-middle border mb-0 rounded-3 overflow-hidden ${productsLoading ? "opacity-75" : ""}`}>
                      <thead className="table-light">
                        <tr className="small text-uppercase text-muted" style={{ letterSpacing: "0.05em", fontSize: "0.72rem" }}>
                          <th className="py-3 px-3">Product Item</th>
                          <th className="py-3 px-3">Brand</th>
                          <th className="py-3 px-3">Price</th>
                          <th className="py-3 px-3">Condition</th>
                          <th className="py-3 px-3">Stock Units</th>
                          <th className="py-3 px-3">Featured &amp; Deals</th>
                          <th className="py-3 px-3 text-end">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((prod) => {
                          const img = prod.images?.[0] || "https://placehold.co/800x800/EEF2F7/0F172A?text=Phone";
                          const isLowStock = Number(prod.stock || 0) < 5;

                          return (
                            <tr key={prod._id || prod.slug}>
                              <td className="px-3">
                                <div className="d-flex align-items-center gap-2.5">
                                  <div
                                    className="position-relative bg-light rounded-2 border flex-shrink-0"
                                    style={{ width: "44px", height: "44px" }}
                                  >
                                    <Image
                                      src={img}
                                      alt={prod.name}
                                      fill
                                      sizes="44px"
                                      style={{ objectFit: "cover" }}
                                      className="rounded-2"
                                      unoptimized
                                    />
                                  </div>
                                  <div>
                                    <div className="fw-bold text-dark" style={{ fontSize: "0.88rem" }}>
                                      {prod.name}
                                    </div>
                                    <span className="text-muted font-monospace" style={{ fontSize: "0.7rem" }}>
                                      slug: {prod.slug}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              <td className="px-3">
                                <Badge variant="outline">{prod.brand}</Badge>
                              </td>

                              <td className="px-3">
                                <span className="fw-bold text-primary" style={{ fontSize: "0.92rem" }}>
                                  £{Number(prod.price).toFixed(2)}
                                </span>
                              </td>

                              <td className="px-3">
                                <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-0.5" style={{ fontSize: "0.72rem" }}>
                                  {prod.condition || "Good"}
                                </span>
                              </td>

                              <td className="px-3">
                                <div className="d-flex align-items-center gap-1.5">
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-light border p-0 px-1.5"
                                    onClick={() => handleQuickStockChange(prod, -1)}
                                  >
                                    -
                                  </button>
                                  <span className={`fw-bold font-monospace px-1 ${isLowStock ? "text-danger" : "text-dark"}`}>
                                    {prod.stock || 0}
                                  </span>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-light border p-0 px-1.5"
                                    onClick={() => handleQuickStockChange(prod, 1)}
                                  >
                                    +
                                  </button>
                                </div>
                              </td>

                              <td className="px-3">
                                <div className="d-flex align-items-center gap-1.5 flex-wrap">
                                  <button
                                    type="button"
                                    className={`btn btn-sm py-0.5 px-2 rounded-pill fw-bold ${
                                      prod.featured ? "btn-warning text-dark shadow-xs" : "btn-light text-muted border"
                                    }`}
                                    style={{ fontSize: "0.72rem" }}
                                    onClick={() => handleToggleFeatured(prod)}
                                    title="Toggle Featured product on Home Page"
                                  >
                                    {prod.featured ? "★ Featured" : "Standard"}
                                  </button>
                                  <button
                                    type="button"
                                    className={`btn btn-sm py-0.5 px-2 rounded-pill fw-bold d-inline-flex align-items-center gap-1 ${
                                      prod.isHotDeal ? "btn-danger text-white shadow-xs" : "btn-light text-muted border"
                                    }`}
                                    style={{ fontSize: "0.72rem" }}
                                    onClick={() => handleToggleHotDeal(prod)}
                                    title="Toggle Hot Deal on Home Page"
                                  >
                                    <Flame size={11} />
                                    <span>{prod.isHotDeal ? "Hot Deal" : "Normal"}</span>
                                  </button>
                                </div>
                              </td>

                              <td className="px-3 text-end">
                                <div className="d-flex align-items-center justify-content-end gap-2">
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-secondary rounded-2 d-inline-flex align-items-center justify-content-center"
                                    style={{ width: "32px", height: "32px", padding: 0 }}
                                    onClick={() => setViewingProduct(prod)}
                                    title="View Product Full Specifications"
                                  >
                                    <Eye size={15} />
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary rounded-2 d-inline-flex align-items-center justify-content-center"
                                    style={{ width: "32px", height: "32px", padding: 0 }}
                                    onClick={() => handleOpenEditProductModal(prod)}
                                    title="Edit Product"
                                  >
                                    <Pencil size={14} />
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger rounded-2 d-inline-flex align-items-center justify-content-center"
                                    style={{ width: "32px", height: "32px", padding: 0 }}
                                    onClick={() => handleDeleteProduct(prod)}
                                    title="Delete Product"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: CUSTOMER DIRECTORY */}
            {activeTab === "customers" && (
              <div>
                <div className="d-flex flex-column flex-md-row align-items-stretch align-items-md-center justify-content-between gap-3 mb-4">
                  <AdminSearchInput
                    value={customerSearch}
                    onChange={setCustomerSearch}
                    placeholder="Search buyers by name, email, phone..."
                    isLoading={customersLoading}
                    id="customer-search-input"
                  />
                  <span className="text-muted small text-md-end">
                    Showing <strong className="text-dark">{customers.length}</strong> registered buyer{customers.length === 1 ? "" : "s"}
                  </span>
                </div>

                {customers.length === 0 ? (
                  <div className="text-center py-5 bg-light rounded-4 border border-dashed">
                    <Users size={32} className="text-muted mb-2" />
                    <h6 className="fw-bold text-dark">No customers found</h6>
                    <p className="text-muted small mb-0">Try searching with a different name, email, or phone number.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className={`table table-hover align-middle border mb-0 rounded-3 overflow-hidden ${customersLoading ? "opacity-75" : ""}`}>
                      <thead className="table-light">
                        <tr className="small text-uppercase text-muted" style={{ letterSpacing: "0.05em", fontSize: "0.72rem" }}>
                          <th className="py-3 px-3">Customer Name</th>
                          <th className="py-3 px-3">Email Address</th>
                          <th className="py-3 px-3">Phone</th>
                          <th className="py-3 px-3">Total Orders</th>
                          <th className="py-3 px-3">Lifetime Spent</th>
                          <th className="py-3 px-3">Member Since</th>
                          <th className="py-3 px-3 text-end">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customers.map((u) => (
                          <tr key={u._id || u.id}>
                            <td className="px-3 fw-bold text-dark">{u.name}</td>
                            <td className="px-3 text-muted small">{u.email}</td>
                            <td className="px-3 text-muted small">{u.phone || "N/A"}</td>
                            <td className="px-3">
                              <span className="badge bg-primary rounded-pill px-2.5 py-1">{u.totalOrders || 0} Orders</span>
                            </td>
                            <td className="px-3 fw-bold text-success">
                              £{Number(u.totalSpent || 0).toFixed(2)}
                            </td>
                            <td className="px-3 text-muted small">
                              {new Date(u.createdAt || Date.now()).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </td>
                            <td className="px-3 text-end">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary rounded-2 py-1 px-2.5 fw-semibold d-inline-flex align-items-center gap-1.5"
                                onClick={() => setViewingCustomer(u)}
                                title="View Customer Profile & History"
                                style={{ fontSize: "0.76rem" }}
                              >
                                <Eye size={13} />
                                <span>View Details</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: ACTIVE SHOPPING CARTS (ITEMS IN CART) */}
            {activeTab === "carts" && (
              <div>
                <div className="d-flex flex-column flex-md-row align-items-stretch align-items-md-center justify-content-between gap-3 mb-4">
                  <AdminSearchInput
                    value={cartSearch}
                    onChange={setCartSearch}
                    placeholder="Search active carts by customer, email, handset..."
                    isLoading={cartsLoading}
                    id="cart-search-input"
                  />

                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-warning bg-opacity-10 text-dark border border-warning px-3 py-2 rounded-3 fw-bold small">
                      🛒 {carts.length} Active Carts (£{Number(carts.reduce((sum, c) => sum + (c.cartTotal || 0), 0)).toFixed(2)} in Cart Value)
                    </span>
                  </div>
                </div>

                {carts.length === 0 && !cartsLoading ? (
                  <div className="text-center py-5 bg-light rounded-4 border border-dashed">
                    <ShoppingCart size={40} className="text-muted mb-2" />
                    <h6 className="fw-bold text-dark">No Active Carts Found</h6>
                    <p className="text-muted small mb-0">No customers currently have pending items in their shopping cart.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className={`table table-hover align-middle border mb-0 rounded-3 overflow-hidden ${cartsLoading ? "opacity-75" : ""}`}>
                      <thead className="table-light">
                        <tr className="small text-uppercase text-muted" style={{ letterSpacing: "0.05em", fontSize: "0.72rem" }}>
                          <th className="py-3 px-3">Customer / Shopper</th>
                          <th className="py-3 px-3">Items in Cart</th>
                          <th className="py-3 px-3">Cart Value</th>
                          <th className="py-3 px-3">Handsets Preview</th>
                          <th className="py-3 px-3">Last Activity</th>
                          <th className="py-3 px-3 text-end">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {carts.map((cart) => (
                          <tr key={cart._id || cart.id}>
                            <td className="px-3">
                              <div className="d-flex align-items-center gap-2.5">
                                <div
                                  className="d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary fw-bold rounded-circle flex-shrink-0"
                                  style={{ width: "36px", height: "36px", fontSize: "0.85rem" }}
                                >
                                  {cart.user?.name ? cart.user.name.charAt(0).toUpperCase() : "G"}
                                </div>
                                <div>
                                  <div className="fw-bold text-dark" style={{ fontSize: "0.88rem" }}>
                                    {cart.user?.name || "Guest Shopper"}
                                  </div>
                                  <span className="text-muted small" style={{ fontSize: "0.75rem" }}>
                                    {cart.user?.email || "No email"}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="px-3">
                              <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill px-2.5 py-1">
                                🛒 {cart.totalItems || (cart.items || []).length} items
                              </span>
                            </td>

                            <td className="px-3 fw-bold text-primary" style={{ fontSize: "0.95rem" }}>
                              £{Number(cart.cartTotal || 0).toFixed(2)}
                            </td>

                            <td className="px-3">
                              <div className="d-flex align-items-center gap-1.5 flex-wrap" style={{ maxWidth: "260px" }}>
                                {(cart.items || []).slice(0, 3).map((it, idx) => (
                                  <div
                                    key={idx}
                                    className="position-relative bg-light rounded-2 border flex-shrink-0"
                                    style={{ width: "36px", height: "36px" }}
                                    title={`${it.name} (x${it.quantity})`}
                                  >
                                    <Image
                                      src={it.image || "https://placehold.co/800x800/EEF2F7/0F172A?text=Phone"}
                                      alt={it.name}
                                      fill
                                      sizes="36px"
                                      style={{ objectFit: "cover" }}
                                      className="rounded-2"
                                      unoptimized
                                    />
                                    {it.quantity > 1 && (
                                      <span
                                        className="position-absolute bottom-0 end-0 bg-dark text-white rounded-circle font-monospace fw-bold"
                                        style={{ fontSize: "0.55rem", width: "16px", height: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}
                                      >
                                        {it.quantity}
                                      </span>
                                    )}
                                  </div>
                                ))}
                                {(cart.items || []).length > 3 && (
                                  <span className="badge bg-secondary bg-opacity-15 text-muted rounded-pill px-2 py-1 small">
                                    +{(cart.items || []).length - 3} more
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="px-3 text-muted small">
                              {new Date(cart.updatedAt || cart.createdAt || Date.now()).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>

                            <td className="px-3 text-end">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary rounded-2 py-1 px-2.5 fw-semibold d-inline-flex align-items-center gap-1.5"
                                onClick={() => setViewingCart(cart)}
                                title="View Cart Details & Items"
                                style={{ fontSize: "0.76rem" }}
                              >
                                <Eye size={13} />
                                <span>View Details</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: ADMIN TEAM & MULTI-ADMIN ACCOUNTS */}
            {activeTab === "staff" && (
              <div>
                <div className="d-flex flex-column flex-md-row align-items-stretch align-items-md-center justify-content-between gap-3 mb-4">
                  <AdminSearchInput
                    value={staffSearch}
                    onChange={setStaffSearch}
                    placeholder="Search admin staff by name, email..."
                    isLoading={staffLoading}
                    id="staff-search-input"
                  />

                  {isSuperAdmin && (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm px-3.5 py-1.5 rounded-3 fw-bold d-flex align-items-center gap-1.5 shadow-sm"
                      onClick={() => setIsNewAdminModalOpen(true)}
                    >
                      <UserPlus size={16} /> Create New Admin Account
                    </button>
                  )}
                </div>

                {staffMembers.length === 0 ? (
                  <div className="text-center py-5 bg-light rounded-4 border border-dashed">
                    <Shield size={32} className="text-muted mb-2" />
                    <h6 className="fw-bold text-dark">No admin staff found</h6>
                    <p className="text-muted small mb-0">Try searching with a different staff name or email address.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className={`table table-hover align-middle border mb-0 rounded-3 overflow-hidden ${staffLoading ? "opacity-75" : ""}`}>
                      <thead className="table-light">
                        <tr className="small text-uppercase text-muted" style={{ letterSpacing: "0.05em", fontSize: "0.72rem" }}>
                          <th className="py-3 px-3">Admin Name</th>
                          <th className="py-3 px-3">Staff Email</th>
                          <th className="py-3 px-3">Access Level</th>
                          <th className="py-3 px-3">Account Status</th>
                          <th className="py-3 px-3">Created Date</th>
                          <th className="py-3 px-3 text-end">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {staffMembers.map((s) => {
                          const isMemberSuperAdmin = s.role === "superadmin";

                          return (
                            <tr key={s._id || s.id}>
                              <td className="px-3">
                                <div className="fw-bold text-dark d-flex align-items-center gap-2">
                                  <Shield size={16} className={isMemberSuperAdmin ? "text-warning" : "text-primary"} />
                                  <span>{s.name}</span>
                                </div>
                              </td>
                              <td className="px-3 text-muted font-monospace small">{s.email}</td>
                              <td className="px-3">
                                <span
                                  className={`badge px-2.5 py-1 ${
                                    isMemberSuperAdmin
                                      ? "bg-warning bg-opacity-10 text-dark border border-warning"
                                      : "bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25"
                                  }`}
                                >
                                  {isMemberSuperAdmin ? "Super Admin" : "Staff Administrator"}
                                </span>
                              </td>
                              <td className="px-3">
                                <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2.5 py-1">
                                  ✓ Active
                                </span>
                              </td>
                              <td className="px-3 text-muted small">
                                {new Date(s.createdAt || Date.now()).toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </td>
                              <td className="px-3 text-end">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-secondary rounded-2 py-1 px-2.5 fw-semibold d-inline-flex align-items-center gap-1.5"
                                  onClick={() => setViewingStaff(s)}
                                  title="View Staff Profile"
                                  style={{ fontSize: "0.76rem" }}
                                >
                                  <Eye size={13} />
                                  <span>View Details</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Container>

      {/* VIEW ORDER DETAILS MODAL */}
      <OrderDetailsModal
        order={viewingOrder}
        isOpen={Boolean(viewingOrder)}
        onClose={() => setViewingOrder(null)}
        onEditStatus={(order) => {
          setViewingOrder(null);
          handleOpenOrderModal(order);
        }}
        onQuickAdvance={(order, newStatus) => {
          handleQuickAdvanceStatus(order, newStatus);
          setViewingOrder((prev) => (prev ? { ...prev, orderStatus: newStatus } : null));
        }}
        onViewTimeline={(order) => {
          setViewingOrder(null);
          setViewingOrderTimeline(order);
        }}
      />

      {/* ACTIVITY TIMELINE & AUDIT LOG MODAL */}
      <OrderActivityModal
        order={viewingOrderTimeline}
        isOpen={Boolean(viewingOrderTimeline)}
        onClose={() => setViewingOrderTimeline(null)}
      />

      {/* MODAL 1: ORDER FULFILLMENT EDIT MODAL */}
      {isOrderModalOpen && selectedOrder && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center p-3"
          style={{ zIndex: 1080, backdropFilter: "blur(4px)" }}
          onClick={() => setIsOrderModalOpen(false)}
        >
          <div
            className="bg-white rounded-4 shadow-lg overflow-hidden w-100"
            style={{ maxWidth: "540px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-bottom bg-light d-flex align-items-center justify-content-between">
              <div>
                <h5 className="fw-bold text-primary mb-0">Update Order {selectedOrder.orderNumber}</h5>
                <small className="text-muted">Live synchronization with customer account timeline</small>
              </div>
              <button
                type="button"
                className="btn btn-light btn-sm rounded-circle p-2 border-0"
                onClick={() => setIsOrderModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveOrderFulfillment} className="p-4">
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label small fw-semibold text-dark">Order Delivery Status</label>
                  <select
                    className="form-select fw-bold border-2"
                    value={orderModalData.orderStatus}
                    onChange={(e) => setOrderModalData({ ...orderModalData, orderStatus: e.target.value })}
                  >
                    <option value="Processing">1. Processing (Order Placed)</option>
                    <option value="50-Point Checked">2. 50-Point Quality Checked</option>
                    <option value="Dispatched">3. Dispatched / Shipped</option>
                    <option value="Delivered">4. Delivered to Customer</option>
                    <option value="Cancelled">✕ Cancelled</option>
                  </select>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold text-dark">Courier Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Royal Mail Tracked 24"
                    value={orderModalData.courierName}
                    onChange={(e) => setOrderModalData({ ...orderModalData, courierName: e.target.value })}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold text-dark">Tracking Reference #</label>
                  <input
                    type="text"
                    className="form-control font-monospace"
                    placeholder="GB-EV-12345678"
                    value={orderModalData.trackingNumber}
                    onChange={(e) => setOrderModalData({ ...orderModalData, trackingNumber: e.target.value })}
                  />
                </div>
              </div>

              <div className="d-flex align-items-center justify-content-end gap-2 mt-4 pt-3 border-top">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4 py-2 rounded-3 fw-semibold"
                  onClick={() => setIsOrderModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary px-4 py-2 rounded-3 fw-bold shadow-sm">
                  Save & Update Live Timeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT PRODUCT MODAL (CASHIFY MULTI-VARIANT INVENTORY MODEL) */}
      {isProductModalOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center p-3"
          style={{ zIndex: 1080, backdropFilter: "blur(4px)" }}
        >
          <div
            className="bg-white rounded-4 shadow-lg overflow-hidden w-100"
            style={{ maxWidth: "940px", maxHeight: "92vh", display: "flex", flexDirection: "column" }}
          >
            {/* Modal Header */}
            <div className="p-3.5 px-4 border-bottom bg-light d-flex align-items-center justify-content-between flex-shrink-0">
              <div>
                <h5 className="fw-bold text-primary mb-0 d-flex align-items-center gap-2">
                  <Smartphone size={20} />
                  <span>{editingProductSlug ? "Edit Handset Listing & Variants" : "Add New Handset Listing"}</span>
                </h5>
                <small className="text-muted">Multi-variant inventory matrix with color-specific image galleries (Cashify model)</small>
              </div>
              <button
                type="button"
                className="btn btn-light btn-sm rounded-circle p-2 border-0"
                onClick={() => setIsProductModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Tab Navigation */}
            <div className="border-bottom bg-white px-4 pt-2 d-flex gap-2 flex-shrink-0 overflow-x-auto">
              <button
                type="button"
                className={`btn btn-sm pb-2.5 px-3 rounded-0 border-0 fw-bold transition-all text-nowrap ${
                  productModalTab === "general"
                    ? "border-bottom border-primary border-3 text-primary"
                    : "text-muted hover-text-dark"
                }`}
                style={{ fontSize: "0.86rem" }}
                onClick={() => setProductModalTab("general")}
              >
                1. General &amp; Info
              </button>
              <button
                type="button"
                className={`btn btn-sm pb-2.5 px-3 rounded-0 border-0 fw-bold transition-all text-nowrap d-flex align-items-center gap-1.5 ${
                  productModalTab === "colors"
                    ? "border-bottom border-primary border-3 text-primary"
                    : "text-muted hover-text-dark"
                }`}
                style={{ fontSize: "0.86rem" }}
                onClick={() => setProductModalTab("colors")}
              >
                <Palette size={14} />
                <span>2. Colors &amp; Photos</span>
                <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-1.5" style={{ fontSize: "0.7rem" }}>
                  {productFormData.colorVariants?.length || 0}
                </span>
              </button>
              <button
                type="button"
                className={`btn btn-sm pb-2.5 px-3 rounded-0 border-0 fw-bold transition-all text-nowrap d-flex align-items-center gap-1.5 ${
                  productModalTab === "inventory"
                    ? "border-bottom border-primary border-3 text-primary"
                    : "text-muted hover-text-dark"
                }`}
                style={{ fontSize: "0.86rem" }}
                onClick={() => setProductModalTab("inventory")}
              >
                <Layers size={14} />
                <span>3. Inventory Matrix</span>
                <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-1.5" style={{ fontSize: "0.7rem" }}>
                  {productFormData.variantPricing?.length || 0}
                </span>
              </button>
              <button
                type="button"
                className={`btn btn-sm pb-2.5 px-3 rounded-0 border-0 fw-bold transition-all text-nowrap d-flex align-items-center gap-1.5 ${
                  productModalTab === "specs"
                    ? "border-bottom border-primary border-3 text-primary"
                    : "text-muted hover-text-dark"
                }`}
                style={{ fontSize: "0.86rem" }}
                onClick={() => setProductModalTab("specs")}
              >
                <Cpu size={14} />
                <span>4. Tech Specs</span>
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveProduct} className="p-4 overflow-y-auto flex-grow-1">
              {/* TAB 1: GENERAL INFO */}
              {productModalTab === "general" && (
                <div className="row g-3">
                  <div className="col-12 col-md-8">
                    <label className="form-label small fw-semibold text-dark">Phone Model / Product Name <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Apple iPhone 14"
                      value={productFormData.name}
                      onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-4">
                    <label className="form-label small fw-semibold text-dark">Brand <span className="text-danger">*</span></label>
                    <select
                      className="form-select"
                      value={productFormData.brand}
                      onChange={(e) => setProductFormData({ ...productFormData, brand: e.target.value })}
                    >
                      <option value="Apple">Apple</option>
                      <option value="Samsung">Samsung</option>
                      <option value="Google">Google</option>
                      <option value="OnePlus">OnePlus</option>
                      <option value="Xiaomi">Xiaomi</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="col-12 col-md-4">
                    <label className="form-label small fw-semibold text-dark">Category</label>
                    <input
                      type="text"
                      className="form-control"
                      value={productFormData.category || "Smartphones"}
                      onChange={(e) => setProductFormData({ ...productFormData, category: e.target.value })}
                    />
                  </div>

                  <div className="col-12 col-md-4">
                    <label className="form-label small fw-semibold text-dark">Base Price (£)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control fw-bold"
                      placeholder="499.00"
                      value={productFormData.price}
                      onChange={(e) => setProductFormData({ ...productFormData, price: e.target.value })}
                    />
                    <small className="text-muted" style={{ fontSize: "0.72rem" }}>
                      Auto-overridden by lowest price in Inventory Matrix.
                    </small>
                  </div>

                  <div className="col-12 col-md-4">
                    <label className="form-label small fw-semibold text-dark">Original RRP (£)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      placeholder="799.00"
                      value={productFormData.originalPrice}
                      onChange={(e) => setProductFormData({ ...productFormData, originalPrice: e.target.value })}
                    />
                    <small className="text-muted" style={{ fontSize: "0.72rem" }}>
                      Used to show strike-through savings.
                    </small>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="form-check form-switch p-3 bg-light rounded-3 border">
                      <input
                        className="form-check-input ms-0 me-2"
                        type="checkbox"
                        role="switch"
                        id="featuredSwitch"
                        checked={Boolean(productFormData.featured)}
                        onChange={(e) => setProductFormData({ ...productFormData, featured: e.target.checked })}
                      />
                      <label className="form-check-label small fw-bold text-dark cursor-pointer" htmlFor="featuredSwitch">
                        ★ Featured Phone (Show in Homepage Featured Carousel)
                      </label>
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="form-check form-switch p-3 bg-danger-subtle rounded-3 border border-danger-subtle">
                      <input
                        className="form-check-input ms-0 me-2"
                        type="checkbox"
                        role="switch"
                        id="hotDealSwitch"
                        checked={Boolean(productFormData.isHotDeal)}
                        onChange={(e) => setProductFormData({ ...productFormData, isHotDeal: e.target.checked })}
                      />
                      <label className="form-check-label small fw-bold text-danger cursor-pointer" htmlFor="hotDealSwitch">
                        🔥 Hot Deal (Show in Homepage Hot Deals Carousel)
                      </label>
                    </div>
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-semibold text-dark">Short Highlights Summary</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 6.1-inch Super Retina display with 12MP camera and 50-point diagnostic check."
                      value={productFormData.shortDescription}
                      onChange={(e) => setProductFormData({ ...productFormData, shortDescription: e.target.value })}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-semibold text-dark">Detailed Product Overview</label>
                    <textarea
                      rows={3}
                      className="form-control"
                      placeholder="Enter warranty details, certification checks, battery health standards..."
                      value={productFormData.description}
                      onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: COLOR VARIANTS & COLOR-SPECIFIC PHOTOS */}
              {productModalTab === "colors" && (
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div>
                      <h6 className="fw-bold text-dark mb-0">Color Galleries</h6>
                      <small className="text-muted">
                        Upload dedicated photos for each color. On the product page, clicking a color immediately displays its matching photos.
                      </small>
                    </div>
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm rounded-pill px-3 fw-bold d-flex align-items-center gap-1 shadow-xs"
                      onClick={handleAddColorVariant}
                    >
                      <Plus size={14} /> Add Color Variant
                    </button>
                  </div>

                  <div className="d-flex flex-column gap-3">
                    {(productFormData.colorVariants || []).map((colorVar, idx) => {
                      const imagePreviewList = (colorVar.imagesText || "")
                        .split(/[\n,]+/)
                        .map((u) => u.trim())
                        .filter(Boolean);

                      return (
                        <div key={idx} className="card border rounded-3 p-3 shadow-xs bg-light bg-opacity-25">
                          <div className="row g-2 align-items-center mb-2">
                            <div className="col-auto">
                              <label className="small text-muted fw-bold text-uppercase d-block" style={{ fontSize: "0.68rem" }}>
                                Swatch
                              </label>
                              <input
                                type="color"
                                className="form-control form-control-color border-0 p-0 rounded-circle cursor-pointer"
                                style={{ width: "32px", height: "32px" }}
                                value={colorVar.hexCode || "#000000"}
                                onChange={(e) => handleColorVariantChange(idx, "hexCode", e.target.value)}
                                title="Choose color swatch"
                              />
                            </div>

                            <div className="col-12 col-md-5">
                              <label className="small text-muted fw-bold text-uppercase d-block" style={{ fontSize: "0.68rem" }}>
                                Color Name (e.g. Midnight, Product(RED), Gold)
                              </label>
                              <input
                                type="text"
                                className="form-control form-control-sm fw-semibold"
                                placeholder="Color name"
                                value={colorVar.colorName}
                                onChange={(e) => handleColorVariantChange(idx, "colorName", e.target.value)}
                                required
                              />
                            </div>

                            <div className="col-12 col-md-5">
                              <label className="small text-muted fw-bold text-uppercase d-block" style={{ fontSize: "0.68rem" }}>
                                Hex Code (optional)
                              </label>
                              <input
                                type="text"
                                className="form-control form-control-sm font-monospace"
                                placeholder="#0f172a"
                                value={colorVar.hexCode}
                                onChange={(e) => handleColorVariantChange(idx, "hexCode", e.target.value)}
                              />
                            </div>

                            <div className="col-auto ms-auto">
                              {productFormData.colorVariants.length > 1 && (
                                <button
                                  type="button"
                                  className="btn btn-outline-danger btn-sm rounded-circle p-1.5"
                                  onClick={() => handleRemoveColorVariant(idx)}
                                  title="Delete Color Variant"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="small text-muted fw-bold text-uppercase d-block mb-1" style={{ fontSize: "0.68rem" }}>
                              Photos for "{colorVar.colorName || `Color ${idx + 1}`}" (Paste image URLs, separated by comma or new line)
                            </label>
                            <textarea
                              rows={2}
                              className="form-control form-control-sm font-monospace"
                              placeholder="https://images.unsplash.com/photo-1, https://images.unsplash.com/photo-2"
                              value={colorVar.imagesText}
                              onChange={(e) => handleColorVariantChange(idx, "imagesText", e.target.value)}
                            />

                            {/* Live Thumbnail Strip */}
                            {imagePreviewList.length > 0 && (
                              <div className="d-flex align-items-center gap-2 mt-2 overflow-x-auto py-1">
                                {imagePreviewList.map((imgUrl, imgIdx) => (
                                  <div
                                    key={imgIdx}
                                    className="position-relative border rounded-2 overflow-hidden flex-shrink-0 bg-white shadow-xs"
                                    style={{ width: "52px", height: "52px" }}
                                  >
                                    <Image
                                      src={imgUrl}
                                      alt={`${colorVar.colorName} preview ${imgIdx + 1}`}
                                      fill
                                      sizes="52px"
                                      style={{ objectFit: "cover" }}
                                      unoptimized
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: INVENTORY VARIANT MATRIX */}
              {productModalTab === "inventory" && (
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                    <div>
                      <h6 className="fw-bold text-dark mb-0">Variant Inventory Matrix</h6>
                      <small className="text-muted">
                        Configure stock quantities and pricing for each Color × Storage × Grade combination.
                      </small>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm rounded-pill px-3 fw-semibold shadow-xs"
                        onClick={handleGenerateMatrix}
                        title="Auto-generate rows based on configured colors"
                      >
                        ⚡ Generate Combinations
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm rounded-pill px-3 fw-bold d-flex align-items-center gap-1 shadow-xs"
                        onClick={handleAddVariantRow}
                      >
                        <Plus size={14} /> Add Variant Row
                      </button>
                    </div>
                  </div>

                  <div className="table-responsive border rounded-3 overflow-hidden mb-3">
                    <table className="table table-sm table-hover align-middle mb-0" style={{ fontSize: "0.82rem" }}>
                      <thead className="table-light">
                        <tr className="text-uppercase text-muted" style={{ fontSize: "0.7rem", letterSpacing: "0.04em" }}>
                          <th className="py-2.5 px-3">Color</th>
                          <th className="py-2.5 px-2" style={{ minWidth: "110px" }}>Storage</th>
                          <th className="py-2.5 px-2" style={{ minWidth: "120px" }}>Cosmetic Grade</th>
                          <th className="py-2.5 px-2" style={{ width: "95px" }}>Stock</th>
                          <th className="py-2.5 px-2" style={{ width: "115px" }}>Price (£)</th>
                          <th className="py-2.5 px-2" style={{ width: "115px" }}>RRP (£)</th>
                          <th className="py-2.5 px-2 text-end" style={{ width: "45px" }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {(productFormData.variantPricing || []).length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center py-4 text-muted">
                              No variants configured. Click <strong>"Generate Combinations"</strong> or <strong>"Add Variant Row"</strong> to set inventory.
                            </td>
                          </tr>
                        ) : (
                          (productFormData.variantPricing || []).map((row, rIdx) => {
                            const availableColorOptions = (productFormData.colorVariants || []).map((c) => c.colorName);

                            return (
                              <tr key={rIdx}>
                                <td className="px-3">
                                  <select
                                    className="form-select form-select-sm fw-semibold"
                                    value={row.color}
                                    onChange={(e) => handleVariantRowChange(rIdx, "color", e.target.value)}
                                  >
                                    {availableColorOptions.map((cName) => (
                                      <option key={cName} value={cName}>{cName}</option>
                                    ))}
                                    {!availableColorOptions.includes(row.color) && (
                                      <option value={row.color}>{row.color}</option>
                                    )}
                                  </select>
                                </td>

                                <td className="px-2">
                                  <select
                                    className="form-select form-select-sm"
                                    value={row.storage}
                                    onChange={(e) => handleVariantRowChange(rIdx, "storage", e.target.value)}
                                  >
                                    <option value="64GB">64GB</option>
                                    <option value="128GB">128GB</option>
                                    <option value="256GB">256GB</option>
                                    <option value="512GB">512GB</option>
                                    <option value="1TB">1TB</option>
                                  </select>
                                </td>

                                <td className="px-2">
                                  <select
                                    className="form-select form-select-sm"
                                    value={row.condition}
                                    onChange={(e) => handleVariantRowChange(rIdx, "condition", e.target.value)}
                                  >
                                    <option value="Pristine">Pristine</option>
                                    <option value="Excellent">Excellent</option>
                                    <option value="Very Good">Very Good</option>
                                    <option value="Good">Good</option>
                                    <option value="Fair">Fair</option>
                                  </select>
                                </td>

                                <td className="px-2">
                                  <input
                                    type="number"
                                    min="0"
                                    className={`form-control form-control-sm text-center fw-bold ${
                                      Number(row.stock || 0) === 0 ? "border-danger text-danger bg-danger-subtle" : ""
                                    }`}
                                    placeholder="3"
                                    value={row.stock}
                                    onChange={(e) => handleVariantRowChange(rIdx, "stock", e.target.value)}
                                  />
                                </td>

                                <td className="px-2">
                                  <div className="input-group input-group-sm">
                                    <span className="input-group-text bg-light text-muted px-1.5">£</span>
                                    <input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      className="form-control form-control-sm fw-bold"
                                      placeholder="429.00"
                                      value={row.price}
                                      onChange={(e) => handleVariantRowChange(rIdx, "price", e.target.value)}
                                    />
                                  </div>
                                </td>

                                <td className="px-2">
                                  <div className="input-group input-group-sm">
                                    <span className="input-group-text bg-light text-muted px-1.5">£</span>
                                    <input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      className="form-control form-control-sm"
                                      placeholder="699.00"
                                      value={row.originalPrice}
                                      onChange={(e) => handleVariantRowChange(rIdx, "originalPrice", e.target.value)}
                                    />
                                  </div>
                                </td>

                                <td className="px-2 text-end">
                                  <button
                                    type="button"
                                    className="btn btn-outline-danger btn-sm p-1 rounded-circle border-0"
                                    onClick={() => handleRemoveVariantRow(rIdx)}
                                    title="Remove row"
                                  >
                                    <X size={14} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Bar */}
                  <div className="bg-light p-2.5 px-3 rounded-3 d-flex align-items-center justify-content-between">
                    <span className="small text-muted fw-semibold">
                      Total Configurations: <strong>{productFormData.variantPricing?.length || 0}</strong>
                    </span>
                    <span className="small text-primary fw-bold">
                      Total In-Stock Units:{" "}
                      <strong>
                        {(productFormData.variantPricing || []).reduce((sum, v) => sum + (Number(v.stock) || 0), 0)} units
                      </strong>
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 4: TECHNICAL SPECIFICATIONS */}
              {productModalTab === "specs" && (
                <div>
                  <div className="mb-3">
                    <h6 className="fw-bold text-dark mb-0">Hardware Specifications</h6>
                    <small className="text-muted">
                      Displayed on the product specifications tab.
                    </small>
                  </div>

                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-dark">Display &amp; Screen</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="6.1-inch Super Retina XDR OLED, 2556 x 1179 pixels"
                        value={productFormData.specifications?.display || ""}
                        onChange={(e) =>
                          setProductFormData({
                            ...productFormData,
                            specifications: { ...productFormData.specifications, display: e.target.value },
                          })
                        }
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-dark">Processor / Chipset</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="A16 Bionic chip, 6-core CPU, 5-core GPU"
                        value={productFormData.specifications?.processor || ""}
                        onChange={(e) =>
                          setProductFormData({
                            ...productFormData,
                            specifications: { ...productFormData.specifications, processor: e.target.value },
                          })
                        }
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-dark">Camera Optics</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="48MP Main | 12MP Ultra Wide | 2x Telephoto optical zoom"
                        value={productFormData.specifications?.camera || ""}
                        onChange={(e) =>
                          setProductFormData({
                            ...productFormData,
                            specifications: { ...productFormData.specifications, camera: e.target.value },
                          })
                        }
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-dark">Battery &amp; Charging</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="85%+ Health Guaranteed, Up to 20h video playback, MagSafe"
                        value={productFormData.specifications?.batterySpec || ""}
                        onChange={(e) =>
                          setProductFormData({
                            ...productFormData,
                            specifications: { ...productFormData.specifications, batterySpec: e.target.value },
                          })
                        }
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold text-dark">Operating System</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="iOS 17, upgradable"
                        value={productFormData.specifications?.os || ""}
                        onChange={(e) =>
                          setProductFormData({
                            ...productFormData,
                            specifications: { ...productFormData.specifications, os: e.target.value },
                          })
                        }
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold text-dark">Network &amp; Connectivity</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="5G, Gigabit LTE, Wi-Fi 6, Bluetooth 5.3"
                        value={productFormData.specifications?.network || ""}
                        onChange={(e) =>
                          setProductFormData({
                            ...productFormData,
                            specifications: { ...productFormData.specifications, network: e.target.value },
                          })
                        }
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold text-dark">Water &amp; Dust Protection</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="IP68 rated (up to 6m for 30 mins)"
                        value={productFormData.specifications?.waterResistance || ""}
                        onChange={(e) =>
                          setProductFormData({
                            ...productFormData,
                            specifications: { ...productFormData.specifications, waterResistance: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="d-flex align-items-center justify-content-between mt-4 pt-3 border-top flex-shrink-0">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4 py-2 rounded-3 fw-semibold"
                  onClick={() => setIsProductModalOpen(false)}
                >
                  Cancel
                </button>

                <div className="d-flex align-items-center gap-2">
                  {productModalTab !== "general" && (
                    <button
                      type="button"
                      className="btn btn-light px-3 py-2 rounded-3 fw-semibold border"
                      onClick={() => {
                        const tabs = ["general", "colors", "inventory", "specs"];
                        const curIdx = tabs.indexOf(productModalTab);
                        if (curIdx > 0) setProductModalTab(tabs[curIdx - 1]);
                      }}
                    >
                      ← Previous
                    </button>
                  )}

                  {productModalTab !== "specs" ? (
                    <button
                      type="button"
                      className="btn btn-outline-primary px-3 py-2 rounded-3 fw-semibold"
                      onClick={() => {
                        const tabs = ["general", "colors", "inventory", "specs"];
                        const curIdx = tabs.indexOf(productModalTab);
                        if (curIdx < tabs.length - 1) setProductModalTab(tabs[curIdx + 1]);
                      }}
                    >
                      Next Step →
                    </button>
                  ) : null}

                  <button type="submit" className="btn btn-primary px-4 py-2 rounded-3 fw-bold shadow-sm">
                    {editingProductSlug ? "Save Listing & All Variants" : "Publish Handset Listing"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CREATE NEW MULTI-ADMIN ACCOUNT MODAL */}
      {isNewAdminModalOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center p-3"
          style={{ zIndex: 1080, backdropFilter: "blur(4px)" }}
          onClick={() => setIsNewAdminModalOpen(false)}
        >
          <div
            className="bg-white rounded-4 shadow-lg overflow-hidden w-100"
            style={{ maxWidth: "520px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-bottom bg-light d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <div className="bg-primary text-white p-2 rounded-3">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h5 className="fw-bold text-primary mb-0">Create New Admin Account</h5>
                  <small className="text-muted">Grant staff login access to MongoDB Atlas</small>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-light btn-sm rounded-circle p-2 border-0"
                onClick={() => setIsNewAdminModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateNewAdmin} className="p-4">
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label small fw-semibold text-dark">Staff Full Name <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Sarah Jenkins (Inventory Manager)"
                    value={newAdminFormData.name}
                    onChange={(e) => setNewAdminFormData({ ...newAdminFormData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold text-dark">Staff Email Address <span className="text-danger">*</span></label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="sarah@electronicstore.co.uk"
                    value={newAdminFormData.email}
                    onChange={(e) => setNewAdminFormData({ ...newAdminFormData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold text-dark">Staff Login Password <span className="text-danger">*</span></label>
                  <input
                    type="password"
                    className="form-control font-monospace"
                    placeholder="••••••••"
                    value={newAdminFormData.password}
                    onChange={(e) => setNewAdminFormData({ ...newAdminFormData, password: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="d-flex align-items-center justify-content-end gap-2 mt-4 pt-3 border-top">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4 py-2 rounded-3 fw-semibold"
                  onClick={() => setIsNewAdminModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary px-4 py-2 rounded-3 fw-bold shadow-sm">
                  Create Admin Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SESSION INACTIVITY WARNING MODAL */}
      {inactivityWarningOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ backgroundColor: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(6px)", zIndex: 1060 }}
        >
          <div
            className="card border-0 rounded-4 shadow-2xl bg-white overflow-hidden"
            style={{ maxWidth: "440px", width: "100%" }}
          >
            <div className="p-4 text-center bg-warning bg-opacity-10 border-bottom border-warning border-opacity-25">
              <div
                className="d-inline-flex align-items-center justify-content-center bg-warning text-dark p-3 rounded-circle mb-2 shadow-sm"
                style={{ width: "56px", height: "56px" }}
              >
                <Clock size={28} />
              </div>
              <h5 className="fw-bold text-dark mb-1">Session Inactivity Warning</h5>
              <p className="text-muted small mb-0">Staff Security Auto-Lock Active</p>
            </div>

            <div className="p-4 text-center">
              <p className="text-secondary small mb-3">
                You have been inactive for nearly 30 minutes. To protect store operations, your staff session will automatically lock in:
              </p>

              <div
                className="d-inline-flex align-items-center justify-content-center px-4 py-2 rounded-3 bg-dark text-white fw-bold fs-4 font-monospace mb-4 shadow-sm"
                style={{ minWidth: "120px" }}
              >
                {countdownSeconds}s
              </div>

              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary w-50 py-2.5 rounded-3 fw-semibold small"
                  onClick={handleAdminLogout}
                >
                  Log Out Now
                </button>
                <button
                  type="button"
                  className="btn btn-primary w-50 py-2.5 rounded-3 fw-bold small shadow-sm d-flex align-items-center justify-content-center gap-1.5"
                  onClick={handleExtendSession}
                >
                  <RefreshCw size={15} />
                  <span>Stay Signed In</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

