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
} from "lucide-react";

import { Container, Badge } from "../../components/ui";
import { useToast } from "../../components/common/Toast";
import { useDebounce } from "../../hooks/useDebounce";
import AdminSearchInput from "../../components/admin/AdminSearchInput";
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
  condition: "Excellent",
  storage: "128GB",
  color: "Space Black",
  images: "",
  shortDescription: "",
  description: "",
  featured: false,
  isHotDeal: false,
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
  const [productFormData, setProductFormData] = useState(emptyProductForm);

  const [isNewAdminModalOpen, setIsNewAdminModalOpen] = useState(false);
  const [newAdminFormData, setNewAdminFormData] = useState(emptyNewAdminForm);

  // Detailed Row Inspection Modals State (Requirement: View full details for each row item)
  const [viewingOrder, setViewingOrder] = useState(null);
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
    });

    if (res.success) {
      toast.success("Status Updated", `Order ${order.orderNumber} advanced to '${nextStatus}'`);
      setOrders((prev) =>
        prev.map((o) =>
          (o._id || o.id) === (order._id || order.id) ? { ...o, orderStatus: nextStatus } : o
        )
      );
    } else {
      toast.error("Update Failed", res.error || "Failed to update order.");
    }
  };

  // Product CRUD
  const handleOpenAddProductModal = () => {
    setEditingProductSlug(null);
    setProductFormData(emptyProductForm);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProductModal = (prod) => {
    setEditingProductSlug(prod.slug);
    setProductFormData({
      name: prod.name || "",
      brand: prod.brand || "Apple",
      category: prod.category || "Smartphones",
      price: prod.price || "",
      originalPrice: prod.originalPrice || "",
      stock: prod.stock !== undefined ? prod.stock : 10,
      condition: prod.condition || "Excellent",
      storage: prod.storage || "128GB",
      color: prod.color || "Standard",
      images: Array.isArray(prod.images) ? prod.images.join(", ") : prod.images || "",
      shortDescription: prod.shortDescription || "",
      description: prod.description || "",
      featured: Boolean(prod.featured),
      isHotDeal: Boolean(prod.isHotDeal),
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();

    const imageArray = productFormData.images
      ? productFormData.images.split(",").map((s) => s.trim()).filter(Boolean)
      : ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80"];

    const payload = {
      ...productFormData,
      price: Number(productFormData.price),
      originalPrice: Number(productFormData.originalPrice || productFormData.price * 1.2),
      stock: Number(productFormData.stock),
      images: imageArray,
      featured: Boolean(productFormData.featured),
      isHotDeal: Boolean(productFormData.isHotDeal),
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
                  <span
                    className="badge bg-success bg-opacity-20 text-success border border-success border-opacity-25 rounded-pill px-2 py-0.5 d-none d-md-inline-block"
                    style={{ fontSize: "0.68rem" }}
                  >
                    🔒 JWT Session
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
                                <div className="d-flex align-items-center justify-content-end gap-1.5">
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
                                    className="btn btn-sm btn-outline-secondary rounded-2 p-1.5"
                                    onClick={() => setViewingOrder(order)}
                                    title="View Complete Order Details"
                                  >
                                    <Eye size={14} />
                                  </button>

                                  <button
                                    type="button"
                                    className="btn btn-sm btn-primary rounded-2 p-1.5"
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
                                <div className="d-flex align-items-center justify-content-end gap-1.5">
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-secondary rounded-2 p-1.5"
                                    onClick={() => setViewingProduct(prod)}
                                    title="View Product Full Specifications"
                                  >
                                    <Eye size={14} />
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary rounded-2 p-1.5"
                                    onClick={() => handleOpenEditProductModal(prod)}
                                  >
                                    <Pencil size={14} />
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger rounded-2 p-1.5"
                                    onClick={() => handleDeleteProduct(prod)}
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

      {/* MODAL 2: ADD / EDIT PRODUCT MODAL */}
      {isProductModalOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center p-3"
          style={{ zIndex: 1080, backdropFilter: "blur(4px)" }}
          onClick={() => setIsProductModalOpen(false)}
        >
          <div
            className="bg-white rounded-4 shadow-lg overflow-hidden w-100"
            style={{ maxWidth: "680px", maxHeight: "90vh", display: "flex", flexDirection: "column" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-bottom bg-light d-flex align-items-center justify-content-between flex-shrink-0">
              <div>
                <h5 className="fw-bold text-primary mb-0">
                  {editingProductSlug ? "Edit Handset Listing" : "Add New Handset Listing"}
                </h5>
                <small className="text-muted">Instant synchronization with MongoDB Atlas catalog</small>
              </div>
              <button
                type="button"
                className="btn btn-light btn-sm rounded-circle p-2 border-0"
                onClick={() => setIsProductModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-4 overflow-y-auto flex-grow-1">
              <div className="row g-3">
                <div className="col-12 col-md-8">
                  <label className="form-label small fw-semibold text-dark">Product Name <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. iPhone 15 Pro Max"
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
                  <label className="form-label small fw-semibold text-dark">Price (£) <span className="text-danger">*</span></label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control fw-bold"
                    placeholder="699.00"
                    value={productFormData.price}
                    onChange={(e) => setProductFormData({ ...productFormData, price: e.target.value })}
                    required
                  />
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label small fw-semibold text-dark">Original Price (£)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    placeholder="899.00"
                    value={productFormData.originalPrice}
                    onChange={(e) => setProductFormData({ ...productFormData, originalPrice: e.target.value })}
                  />
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label small fw-semibold text-dark">Stock Units</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="10"
                    value={productFormData.stock}
                    onChange={(e) => setProductFormData({ ...productFormData, stock: e.target.value })}
                  />
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label small fw-semibold text-dark">Refurbished Grade</label>
                  <select
                    className="form-select"
                    value={productFormData.condition}
                    onChange={(e) => setProductFormData({ ...productFormData, condition: e.target.value })}
                  >
                    <option value="Pristine">Pristine (Like New)</option>
                    <option value="Excellent">Excellent Grade</option>
                    <option value="Very Good">Very Good</option>
                    <option value="Good">Good Grade</option>
                  </select>
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label small fw-semibold text-dark">Storage Capacity</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="128GB, 256GB"
                    value={productFormData.storage}
                    onChange={(e) => setProductFormData({ ...productFormData, storage: e.target.value })}
                  />
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label small fw-semibold text-dark">Colour Variant</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Natural Titanium"
                    value={productFormData.color}
                    onChange={(e) => setProductFormData({ ...productFormData, color: e.target.value })}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold text-dark">Image URLs (Comma-separated)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="https://images.unsplash.com/..., https://..."
                    value={productFormData.images}
                    onChange={(e) => setProductFormData({ ...productFormData, images: e.target.value })}
                  />
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
                      ★ Featured Product (Show in Featured Phones)
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
                      🔥 Hot Deal (Show in Home Page Hot Deals Section)
                    </label>
                  </div>
                </div>
              </div>

              <div className="d-flex align-items-center justify-content-end gap-2 mt-4 pt-3 border-top flex-shrink-0">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4 py-2 rounded-3 fw-semibold"
                  onClick={() => setIsProductModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary px-4 py-2 rounded-3 fw-bold shadow-sm">
                  {editingProductSlug ? "Save Listing Changes" : "Create Product Listing"}
                </button>
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

