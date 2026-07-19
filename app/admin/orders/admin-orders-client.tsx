"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Package,
  Phone,
  MapPin,
  CreditCard,
  ChevronDown,
  ExternalLink,
  Loader2,
} from "lucide-react";

const formatINR = (rupees: number) => `₹${rupees.toLocaleString("en-IN")}`;

type OrderItem = {
  id: string;
  productId: number;
  quantity: number;
  unitPrice: number;
  product: {
    id: number;
    title: string;
    price: number;
  } | null;
};

type AdminOrder = {
  id: string;
  orderNumber: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  payment: string;
  paymentStatus: string;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  status: string;
  recipientName: string;
  phone: string;
  addressLine: string;
  city: string;
  pincode: string;
  createdAt: string;
  user: {
    name: string | null;
    email: string | null;
  };
  items: OrderItem[];
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const DELIVERY_STATUSES = [
  { value: "confirmed", label: "Confirmed", color: "bg-blue-100 text-blue-700" },
  { value: "processing", label: "Processing", color: "bg-yellow-100 text-yellow-700" },
  { value: "shipped", label: "Shipped", color: "bg-purple-100 text-purple-700" },
  { value: "delivered", label: "Delivered", color: "bg-green-100 text-green-700" },
] as const;

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  PAID: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
  REFUNDED: "bg-gray-100 text-gray-700",
};

export default function AdminOrdersClient() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const fetchOrders = async (page = 1, search = "", status = "all", paymentStatus = "all") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      if (search) params.set("search", search);
      if (status !== "all") params.set("status", status);
      if (paymentStatus !== "all") params.set("paymentStatus", paymentStatus);

      const response = await fetch(`/api/admin/orders?${params}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSearch = () => {
    fetchOrders(1, searchQuery, statusFilter, paymentStatusFilter);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    fetchOrders(1, searchQuery, status, paymentStatusFilter);
  };

  const handlePaymentStatusFilter = (paymentStatus: string) => {
    setPaymentStatusFilter(paymentStatus);
    fetchOrders(1, searchQuery, statusFilter, paymentStatus);
  };

  const updateDeliveryStatus = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(orderId);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusConfig = (status: string) => {
    return DELIVERY_STATUSES.find((s) => s.value === status) || DELIVERY_STATUSES[0];
  };

  return (
    <div className="min-h-screen min-h-dvh bg-canvas">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-ink-950">Order Management</h1>
          <p className="mt-1 text-ink-500 text-sm">
            View and manage customer orders, update delivery status
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4 rounded-2xl border border-line bg-white p-4">
          {/* Search */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
              />
              <input
                type="text"
                placeholder="Search by order ID, name, phone, or payment ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full rounded-xl border border-line bg-canvas py-2.5 pl-10 pr-4 text-sm focus:border-accent focus:outline-none"
              />
            </div>
            <button
              onClick={handleSearch}
              className="rounded-xl bg-accent px-6 py-2.5 text-sm font-bold text-white hover:bg-accent-deep transition"
            >
              Search
            </button>
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-bold text-ink-500 self-center mr-2">Delivery:</span>
            {["all", "confirmed", "processing", "shipped", "delivered"].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusFilter(status)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                  statusFilter === status
                    ? "bg-accent text-white"
                    : "bg-canvas text-ink-600 hover:bg-ink-100"
                }`}
              >
                {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}

            <span className="text-xs font-bold text-ink-500 self-center ml-4 mr-2">Payment:</span>
            {["all", "PAID", "PENDING", "FAILED"].map((status) => (
              <button
                key={status}
                onClick={() => handlePaymentStatusFilter(status)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                  paymentStatusFilter === status
                    ? "bg-accent text-white"
                    : "bg-canvas text-ink-600 hover:bg-ink-100"
                }`}
              >
                {status === "all" ? "All" : status}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-accent" />
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-line bg-white p-12 text-center">
            <Package size={48} className="mx-auto text-ink-300" />
            <p className="mt-4 text-lg font-bold text-ink-950">No orders found</p>
            <p className="mt-2 text-sm text-ink-500">
              {searchQuery || statusFilter !== "all" || paymentStatusFilter !== "all"
                ? "Try adjusting your filters"
                : "Orders will appear here once customers start placing them"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const isExpanded = expandedOrder === order.id;

              return (
                <div
                  key={order.id}
                  className="rounded-2xl border border-line bg-white overflow-hidden"
                >
                  {/* Order Header */}
                  <div
                    className="flex cursor-pointer items-center justify-between p-4 sm:p-5 hover:bg-canvas/50 transition"
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="hidden sm:block">
                        <p className="font-bold text-ink-950">{order.orderNumber}</p>
                        <p className="text-sm text-ink-500">
                          {order.user.name || order.user.email || "Unknown"}
                        </p>
                      </div>
                      <div className="sm:hidden">
                        <p className="font-bold text-ink-950 text-sm">{order.orderNumber}</p>
                        <p className="text-xs text-ink-500">
                          {order.user.name || order.user.email || "Unknown"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-black text-ink-950">{formatINR(order.total)}</p>
                        <div className="flex gap-1.5 mt-1">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${PAYMENT_STATUS_COLORS[order.paymentStatus] || "bg-gray-100 text-gray-700"}`}>
                            {order.paymentStatus}
                          </span>
                        </div>
                      </div>
                      <ChevronDown
                        size={20}
                        className={`text-ink-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-line p-4 sm:p-6 space-y-6">
                      {/* Customer & Address */}
                      <div className="grid gap-6 sm:grid-cols-2">
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-wider text-ink-500 mb-3">
                            Customer Details
                          </h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Package size={14} className="text-ink-400" />
                              <span className="text-ink-950 font-medium">{order.recipientName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone size={14} className="text-ink-400" />
                              <span className="text-ink-600">{order.phone}</span>
                            </div>
                            {order.user.email && (
                              <p className="text-ink-500 text-xs">{order.user.email}</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-wider text-ink-500 mb-3">
                            Shipping Address
                          </h3>
                          <div className="flex items-start gap-2 text-sm text-ink-600">
                            <MapPin size={14} className="mt-0.5 shrink-0 text-ink-400" />
                            <p>
                              {order.addressLine}<br />
                              {order.city} – {order.pincode}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Payment Details */}
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-ink-500 mb-3">
                          Payment Details
                        </h3>
                        <div className="grid gap-3 sm:grid-cols-3 text-sm">
                          <div>
                            <span className="text-ink-500">Method:</span>
                            <span className="ml-2 font-bold text-ink-950">{order.payment}</span>
                          </div>
                          <div>
                            <span className="text-ink-500">Status:</span>
                            <span className={`ml-2 rounded-full px-2 py-0.5 text-[11px] font-bold ${PAYMENT_STATUS_COLORS[order.paymentStatus] || "bg-gray-100 text-gray-700"}`}>
                              {order.paymentStatus}
                            </span>
                          </div>
                          {order.razorpayPaymentId && (
                            <div className="flex items-center gap-1">
                              <CreditCard size={12} className="text-ink-400" />
                              <span className="font-mono text-xs text-ink-600">
                                {order.razorpayPaymentId}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Products */}
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-ink-500 mb-3">
                          Products
                        </h3>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between rounded-xl bg-canvas p-3 text-sm"
                            >
                              <div>
                                <span className="font-medium text-ink-950">
                                  {item.product?.title || `Product #${item.productId}`}
                                </span>
                                <span className="ml-2 text-ink-500">× {item.quantity}</span>
                              </div>
                              <span className="font-bold text-ink-950">
                                {formatINR(item.unitPrice * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Order Totals */}
                        <div className="mt-3 space-y-1 border-t border-line-soft pt-3 text-sm">
                          <div className="flex justify-between text-ink-500">
                            <span>Subtotal</span>
                            <span>{formatINR(order.subtotal)}</span>
                          </div>
                          <div className="flex justify-between text-ink-500">
                            <span>Delivery</span>
                            <span>{order.deliveryFee === 0 ? "Free" : formatINR(order.deliveryFee)}</span>
                          </div>
                          {order.discount > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Discount</span>
                              <span>-{formatINR(order.discount)}</span>
                            </div>
                          )}
                          <div className="flex justify-between border-t border-line-soft pt-2 font-black text-ink-950">
                            <span>Total</span>
                            <span>{formatINR(order.total)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Delivery Status Update */}
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-ink-500 mb-3">
                          Update Delivery Status
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {DELIVERY_STATUSES.map((status) => (
                            <button
                              key={status.value}
                              onClick={() => updateDeliveryStatus(order.id, status.value)}
                              disabled={updatingStatus === order.id || order.status === status.value}
                              className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                                order.status === status.value
                                  ? "bg-accent text-white cursor-default"
                                  : "bg-canvas text-ink-600 hover:bg-accent hover:text-white"
                              } disabled:opacity-50`}
                            >
                              {updatingStatus === order.id ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                status.label
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Quick Links */}
                      <div className="flex gap-3">
                        <a
                          href={`/track-order?id=${order.orderNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-xs font-bold text-ink-600 hover:border-accent hover:text-accent transition"
                        >
                          <ExternalLink size={12} />
                          Track Order
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => fetchOrders(page, searchQuery, statusFilter, paymentStatusFilter)}
                className={`h-10 w-10 rounded-xl text-sm font-bold transition ${
                  pagination.page === page
                    ? "bg-accent text-white"
                    : "bg-white text-ink-600 hover:bg-canvas border border-line"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}

        {/* Stats Footer */}
        {pagination && (
          <p className="mt-4 text-center text-xs text-ink-400">
            Showing {orders.length} of {pagination.total} orders
          </p>
        )}
      </div>
    </div>
  );
}
