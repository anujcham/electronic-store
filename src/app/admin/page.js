"use client";

import { useState, useEffect, useMemo } from "react";
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
} from "lucide-react";

import { Container, Badge } from "../../components/ui";
import { useToast } from "../../components/common/Toast";
import { getCurrentUser } from "../../services/authService";
import {
  fetchAdminOrders,
  updateOrderFulfillment,
  fetchAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  fetchAdminUsers,
} from "../../services/adminService";

const ORDER_STATUS_STEPS = [
  "Processing",
  "50-Point Checked",
  "Dispatched",
  "Delivered",
  "Cancelled",
];

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
};

export default function AdminDashboardPage() {
  const toast = useToast();

  const [activeTab, setActiveTab] = useState("orders"); // "orders" | "products" | "users"
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Admin Security Gate State
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [passkeyInput, setPasskeyInput] = useState("");
  const [passkeyError, setPasskeyError] = useState("");

  // Data states
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);

  // Search & Filter states
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");

  const [productSearch, setProductSearch] = useState("");
  const [productBrandFilter, setProductBrandFilter] = useState("all");

  const [userSearch, setUserSearch] = useState("");

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

  // Load all admin data & check authorization
  const loadAdminData = async () => {
    setLoading(true);
    try {
      const u = await getCurrentUser();
      setCurrentUser(u);

      const hasAdminRole = u?.role === "admin";
      const hasStoredSession =
        typeof window !== "undefined" &&
        window.sessionStorage.getItem("electroVault.adminSession") === "authenticated";

      if (hasAdminRole || hasStoredSession) {
        setIsAuthorized(true);
        const [ordersRes, productsRes, usersRes] = await Promise.all([
          fetchAdminOrders(),
          fetchAdminProducts(),
          fetchAdminUsers(),
        ]);
        setOrders(ordersRes || []);
        setProducts(productsRes || []);
        setUsers(usersRes || []);
      } else {
        setIsAuthorized(false);
      }
    } catch (err) {
      console.error("Admin data load error:", err);
      toast.error("Data Load Error", "Failed to load dashboard metrics from MongoDB Atlas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleVerifyPasskey = (e) => {
    e.preventDefault();
    setPasskeyError("");

    if (passkeyInput.trim() === "admin123" || passkeyInput.trim().toLowerCase() === "admin") {
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("electroVault.adminSession", "authenticated");
      }
      setIsAuthorized(true);
      toast.success("Staff Verified", "Welcome to Admin Operations Portal!");
      loadAdminData();
    } else {
      setPasskeyError("Invalid Staff Passkey! Please check your credentials.");
      toast.error("Access Denied", "Invalid Admin Passkey entered.");
    }
  };

  const handleLockAdminSession = () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem("electroVault.adminSession");
    }
    setIsAuthorized(false);
    toast.info("Session Locked", "Admin session locked.");
  };

  // Calculated KPI Metrics
  const totalRevenue = useMemo(() => {
    return orders
      .filter((o) => o.orderStatus !== "Cancelled")
      .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
  }, [orders]);

  const lowStockCount = useMemo(() => {
    return products.filter((p) => Number(p.stock) < 5).length;
  }, [products]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        !orderSearch ||
        o.orderNumber?.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.shippingAddress?.fullName?.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.shippingAddress?.email?.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.guestEmail?.toLowerCase().includes(orderSearch.toLowerCase());

      const matchStatus =
        orderStatusFilter === "all" ||
        o.orderStatus?.toLowerCase() === orderStatusFilter.toLowerCase();

      return matchSearch && matchStatus;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        !productSearch ||
        p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.brand?.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.slug?.toLowerCase().includes(productSearch.toLowerCase());

      const matchBrand =
        productBrandFilter === "all" ||
        p.brand?.toLowerCase() === productBrandFilter.toLowerCase();

      return matchSearch && matchBrand;
    });
  }, [products, productSearch, productBrandFilter]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter(
      (u) =>
        !userSearch ||
        u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.phone?.toLowerCase().includes(userSearch.toLowerCase())
    );
  }, [users, userSearch]);

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

  if (!isAuthorized) {
    return (
      <main className="py-5 bg-soft min-vh-100 d-flex align-items-center justify-content-center">
        <Container>
          <div className="row justify-content-center">
            <div className="col-12 col-md-8 col-lg-5">
              <div className="card border-0 rounded-4 shadow-lg overflow-hidden bg-white">
                <div className="p-4 bg-dark text-white text-center">
                  <div className="d-inline-flex align-items-center justify-content-center bg-warning text-dark p-3 rounded-circle mb-2">
                    <Lock size={28} />
                  </div>
                  <h4 className="fw-bold mb-1">Restricted Admin Portal</h4>
                  <small className="text-white-50">Authorized Staff & Store Management Verification</small>
                </div>

                <div className="p-4 p-md-5">
                  <p className="text-muted small mb-4 text-center">
                    This portal is restricted to authorized store staff. Please enter your <strong>Staff Security Passkey</strong> or log in with an administrator account to continue.
                  </p>

                  {passkeyError && (
                    <div className="alert alert-danger border-danger rounded-3 small py-2 mb-3 fw-semibold">
                      ⚠️ {passkeyError}
                    </div>
                  )}

                  <form onSubmit={handleVerifyPasskey}>
                    <div className="mb-4">
                      <label className="form-label small fw-semibold text-dark">Staff Security Passkey</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0 text-muted">
                          <ShieldCheck size={16} />
                        </span>
                        <input
                          type="password"
                          className="form-control border-start-0 font-monospace"
                          placeholder="Enter Passkey (e.g. admin123)"
                          value={passkeyInput}
                          onChange={(e) => setPasskeyInput(e.target.value)}
                          required
                        />
                      </div>
                      <small className="text-muted font-monospace mt-1 d-block" style={{ fontSize: "0.72rem" }}>
                        Hint: Default Staff Passkey is <code>admin123</code>
                      </small>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary btn-lg w-100 py-2.5 rounded-3 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 mb-3"
                    >
                      <span>Unlock Admin Portal</span>
                      <ChevronRight size={18} />
                    </button>

                    <div className="text-center">
                      <Link href="/" className="text-decoration-none small text-muted hover-primary">
                        ← Return to Customer Storefront
                      </Link>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="py-5 bg-soft min-vh-100">
      <Container>
        {/* Header Title & Actions */}
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge bg-primary text-white font-monospace px-2 py-1">STAFF ADMIN PORTAL</span>
              <span className="text-muted small">Live MongoDB Atlas Operations</span>
            </div>
            <h1 className="display-6 fw-bold text-primary mb-0">Store Operations & Inventory Manager</h1>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm rounded-3 d-flex align-items-center gap-1.5 bg-white shadow-xs"
              onClick={loadAdminData}
              disabled={loading}
            >
              <RefreshCw size={14} className={loading ? "spinner-border spinner-border-sm border-2 p-0" : ""} />
              <span>Refresh Atlas Data</span>
            </button>

            <button
              type="button"
              className="btn btn-outline-danger btn-sm rounded-3 d-flex align-items-center gap-1 bg-white shadow-xs"
              onClick={handleLockAdminSession}
              title="Lock Staff Session"
            >
              <Lock size={13} />
              <span>Lock Session</span>
            </button>

            <Link href="/shop" className="btn btn-primary btn-sm rounded-3 fw-bold d-flex align-items-center gap-1">
              <Sparkles size={14} /> View Live Storefront
            </Link>
          </div>
        </div>

        {/* Analytics KPI Metric Cards */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card border-0 rounded-4 shadow-sm p-3.5 bg-white">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="small text-muted fw-bold text-uppercase" style={{ fontSize: "0.72rem" }}>
                  Total Store Revenue
                </span>
                <div className="bg-success bg-opacity-10 text-success p-2 rounded-3">
                  <DollarSign size={20} />
                </div>
              </div>
              <h3 className="fw-bold text-dark mb-0">£{totalRevenue.toLocaleString("en-GB", { minimumFractionDigits: 2 })}</h3>
              <div className="small text-success fw-medium mt-1 d-flex align-items-center gap-1" style={{ fontSize: "0.75rem" }}>
                <TrendingUp size={13} /> {orders.length} orders processed
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card border-0 rounded-4 shadow-sm p-3.5 bg-white">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="small text-muted fw-bold text-uppercase" style={{ fontSize: "0.72rem" }}>
                  Total Orders Placed
                </span>
                <div className="bg-primary bg-opacity-10 text-primary p-2 rounded-3">
                  <ShoppingBag size={20} />
                </div>
              </div>
              <h3 className="fw-bold text-dark mb-0">{orders.length}</h3>
              <div className="small text-muted mt-1" style={{ fontSize: "0.75rem" }}>
                {orders.filter((o) => o.orderStatus === "Processing").length} pending dispatch
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card border-0 rounded-4 shadow-sm p-3.5 bg-white">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="small text-muted fw-bold text-uppercase" style={{ fontSize: "0.72rem" }}>
                  Handset Inventory
                </span>
                <div className="bg-info bg-opacity-10 text-info p-2 rounded-3">
                  <Package size={20} />
                </div>
              </div>
              <h3 className="fw-bold text-dark mb-0">{products.length}</h3>
              <div className="small text-muted mt-1" style={{ fontSize: "0.75rem" }}>
                {products.filter((p) => p.featured).length} featured listings
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card border-0 rounded-4 shadow-sm p-3.5 bg-white">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="small text-muted fw-bold text-uppercase" style={{ fontSize: "0.72rem" }}>
                  Registered Customers
                </span>
                <div className="bg-warning bg-opacity-10 text-warning p-2 rounded-3">
                  <Users size={20} />
                </div>
              </div>
              <h3 className="fw-bold text-dark mb-0">{users.length}</h3>
              <div className="small text-danger fw-medium mt-1 d-flex align-items-center gap-1" style={{ fontSize: "0.75rem" }}>
                {lowStockCount > 0 ? (
                  <>
                    <AlertTriangle size={13} /> {lowStockCount} items low stock!
                  </>
                ) : (
                  <span className="text-success">✓ Stock levels optimal</span>
                )}
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
              onClick={() => setActiveTab("orders")}
            >
              <ShoppingBag size={18} className="me-2" />
              Live Orders & Fulfillment ({orders.length})
            </button>
            <button
              type="button"
              className={`btn px-4 py-2.5 fw-bold rounded-top-3 border-0 transition-all ${
                activeTab === "products" ? "bg-white text-primary shadow-xs border-top border-primary border-3" : "text-muted hover-bg-white"
              }`}
              onClick={() => setActiveTab("products")}
            >
              <Package size={18} className="me-2" />
              Product Catalog & Stock ({products.length})
            </button>
            <button
              type="button"
              className={`btn px-4 py-2.5 fw-bold rounded-top-3 border-0 transition-all ${
                activeTab === "users" ? "bg-white text-primary shadow-xs border-top border-primary border-3" : "text-muted hover-bg-white"
              }`}
              onClick={() => setActiveTab("users")}
            >
              <Users size={18} className="me-2" />
              Customer Directory ({users.length})
            </button>
          </div>

          <div className="p-4">
            {/* TAB 1: ORDERS FULFILLMENT MANAGER */}
            {activeTab === "orders" && (
              <div>
                {/* Search & Status Filters */}
                <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
                  <div className="input-group input-group-sm max-w-360">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <Search size={16} />
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0 ps-0"
                      placeholder="Search Order #, email, or customer name..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                    />
                  </div>

                  <div className="d-flex align-items-center gap-1.5 flex-wrap">
                    <span className="small text-muted fw-bold text-uppercase me-1" style={{ fontSize: "0.7rem" }}>
                      Filter Status:
                    </span>
                    {["all", "Processing", "50-Point Checked", "Dispatched", "Delivered", "Cancelled"].map((st) => (
                      <button
                        key={st}
                        type="button"
                        className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold transition-all ${
                          orderStatusFilter.toLowerCase() === st.toLowerCase()
                            ? "btn-primary shadow-xs"
                            : "btn-outline-secondary border-light-subtle text-dark"
                        }`}
                        style={{ fontSize: "0.78rem" }}
                        onClick={() => setOrderStatusFilter(st)}
                      >
                        {st === "all" ? "All Orders" : st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Orders Table */}
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-5 bg-light rounded-4 border border-dashed">
                    <ShoppingBag size={32} className="text-muted mb-2" />
                    <h6 className="fw-bold text-dark">No orders found</h6>
                    <p className="text-muted small mb-0">Try clearing your search query or status filter.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle border mb-0 rounded-3 overflow-hidden">
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
                        {filteredOrders.map((order) => {
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
                                  {/* Quick Step Buttons */}
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
                                    className="btn btn-sm btn-primary rounded-2 p-1.5"
                                    onClick={() => handleOpenOrderModal(order)}
                                    title="Edit order status & tracking reference"
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

            {/* TAB 2: PRODUCT CATALOG & INVENTORY MANAGER */}
            {activeTab === "products" && (
              <div>
                {/* Search & Actions Header */}
                <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
                  <div className="d-flex align-items-center gap-2 flex-wrap flex-grow-1">
                    <div className="input-group input-group-sm max-w-300">
                      <span className="input-group-text bg-light border-end-0 text-muted">
                        <Search size={16} />
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0 ps-0"
                        placeholder="Search model, brand, slug..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                      />
                    </div>

                    <select
                      className="form-select form-select-sm max-w-160"
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
                    className="btn btn-primary btn-sm px-3 py-2 rounded-3 fw-bold d-flex align-items-center gap-1.5 shadow-sm"
                    onClick={handleOpenAddProductModal}
                  >
                    <Plus size={16} /> Add New Handset Listing
                  </button>
                </div>

                {/* Products Table */}
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-5 bg-light rounded-4 border border-dashed">
                    <Package size={32} className="text-muted mb-2" />
                    <h6 className="fw-bold text-dark">No products found in MongoDB Atlas</h6>
                    <p className="text-muted small mb-3">Add a new listing or adjust your search term.</p>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm rounded-pill px-4"
                      onClick={handleOpenAddProductModal}
                    >
                      <Plus size={14} /> Add Product Now
                    </button>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle border mb-0 rounded-3 overflow-hidden">
                      <thead className="table-light">
                        <tr className="small text-uppercase text-muted" style={{ letterSpacing: "0.05em", fontSize: "0.72rem" }}>
                          <th className="py-3 px-3">Product Item</th>
                          <th className="py-3 px-3">Brand</th>
                          <th className="py-3 px-3">Price</th>
                          <th className="py-3 px-3">Condition</th>
                          <th className="py-3 px-3">Stock Units</th>
                          <th className="py-3 px-3">Home Featured</th>
                          <th className="py-3 px-3 text-end">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((prod) => {
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
                                    <Link
                                      href={`/product/${prod.slug}`}
                                      className="fw-bold text-dark text-decoration-none hover-primary d-block"
                                      style={{ fontSize: "0.88rem" }}
                                      target="_blank"
                                    >
                                      {prod.name}
                                    </Link>
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
                                {prod.originalPrice > prod.price && (
                                  <small className="text-muted text-decoration-line-through d-block" style={{ fontSize: "0.72rem" }}>
                                    £{Number(prod.originalPrice).toFixed(2)}
                                  </small>
                                )}
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
                                    title="Decrease stock"
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
                                    title="Increase stock"
                                  >
                                    +
                                  </button>
                                  {isLowStock && (
                                    <span className="badge bg-danger text-white ms-1" style={{ fontSize: "0.6rem" }}>
                                      Low!
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td className="px-3">
                                <button
                                  type="button"
                                  className={`btn btn-sm py-0.5 px-2 rounded-pill fw-bold ${
                                    prod.featured ? "btn-warning text-dark" : "btn-light text-muted border"
                                  }`}
                                  style={{ fontSize: "0.72rem" }}
                                  onClick={() => handleToggleFeatured(prod)}
                                >
                                  {prod.featured ? "★ Featured" : "Standard"}
                                </button>
                              </td>

                              <td className="px-3 text-end">
                                <div className="d-flex align-items-center justify-content-end gap-1.5">
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary rounded-2 p-1.5"
                                    onClick={() => handleOpenEditProductModal(prod)}
                                    title="Edit listing details"
                                  >
                                    <Pencil size={14} />
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger rounded-2 p-1.5"
                                    onClick={() => handleDeleteProduct(prod)}
                                    title="Delete product listing"
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
            {activeTab === "users" && (
              <div>
                <div className="d-flex align-items-center justify-content-between gap-3 mb-4">
                  <div className="input-group input-group-sm max-w-360">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <Search size={16} />
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0 ps-0"
                      placeholder="Search customer by name, email, phone..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                    />
                  </div>
                  <span className="text-muted small">Showing {filteredUsers.length} accounts</span>
                </div>

                {filteredUsers.length === 0 ? (
                  <div className="text-center py-5 bg-light rounded-4 border border-dashed">
                    <Users size={32} className="text-muted mb-2" />
                    <h6 className="fw-bold text-dark">No customers found</h6>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle border mb-0 rounded-3 overflow-hidden">
                      <thead className="table-light">
                        <tr className="small text-uppercase text-muted" style={{ letterSpacing: "0.05em", fontSize: "0.72rem" }}>
                          <th className="py-3 px-3">Customer Name</th>
                          <th className="py-3 px-3">Email Address</th>
                          <th className="py-3 px-3">Phone</th>
                          <th className="py-3 px-3">Total Orders Placed</th>
                          <th className="py-3 px-3">Lifetime Value (£)</th>
                          <th className="py-3 px-3">Member Since</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((u) => (
                          <tr key={u._id || u.id}>
                            <td className="px-3">
                              <div className="fw-bold text-dark">{u.name}</div>
                              <span className="badge bg-secondary font-monospace" style={{ fontSize: "0.65rem" }}>
                                {u.role || "customer"}
                              </span>
                            </td>
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
                          </tr>
                        ))}
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
            style={{ maxWidth: "540px", animation: "modalPop 0.2s ease-out forwards" }}
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

                <div className="col-12">
                  <label className="form-label small fw-semibold text-dark">Estimated Delivery Range</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="2-4 working days"
                    value={orderModalData.estimatedDelivery}
                    onChange={(e) => setOrderModalData({ ...orderModalData, estimatedDelivery: e.target.value })}
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
            style={{ maxWidth: "680px", maxHeight: "90vh", display: "flex", flexDirection: "column", animation: "modalPop 0.2s ease-out forwards" }}
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

                <div className="col-12">
                  <label className="form-label small fw-semibold text-dark">Short Feature Highlight</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="A17 Pro Chip, 48MP Camera & Titanium Chassis"
                    value={productFormData.shortDescription}
                    onChange={(e) => setProductFormData({ ...productFormData, shortDescription: e.target.value })}
                  />
                </div>

                <div className="col-12">
                  <div className="form-check mt-2">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="featuredCheck"
                      checked={productFormData.featured}
                      onChange={(e) => setProductFormData({ ...productFormData, featured: e.target.checked })}
                    />
                    <label className="form-check-label fw-bold text-dark small" htmlFor="featuredCheck">
                      Highlight as Featured Product on Home Page
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

      <style jsx global>{`
        @keyframes modalPop {
          from {
            opacity: 0;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </main>
  );
}

