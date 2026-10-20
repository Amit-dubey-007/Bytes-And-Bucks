"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  getCurrentUserProfile,
  getOwnerDashboard,
  getOwnerOrders,
  getOwnerOrderDetail,
  approveOrder,
  rejectOrder,
  verifyOrderPayment,
  rejectOrderPayment,
  updateDeliveryStatus,
  dispatchOrder,
  getOwnerReviews,
  moderateReview,
  ReviewData,
  UserProfileData,
  OwnerDashboardSummary,
  OwnerOrderListItem,
  OwnerOrderDetailData,
  getAuthToken,
  ApiError,
} from "@/lib/api";
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Eye,
  FileCheck,
  CreditCard,
  DollarSign,
  Package,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  Loader2,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Truck,
  Star,
  EyeOff,
  Navigation,
} from "lucide-react";

export default function OwnerDashboardPage() {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  // Top level active tab: "orders" | "reviews"
  const [activeTab, setActiveTab] = useState<"orders" | "reviews">("orders");

  // Dashboard Data State
  const [summary, setSummary] = useState<OwnerDashboardSummary | null>(null);
  const [orders, setOrders] = useState<OwnerOrderListItem[]>([]);
  const [totalOrdersCount, setTotalOrdersCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Reviews Tab State
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewsCount, setReviewsCount] = useState(0);

  // Filter & Search State
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Inspect Order Modal State
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OwnerOrderDetailData | null>(null);
  const [loadingOrderDetail, setLoadingOrderDetail] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Action Form States
  const [actionType, setActionType] = useState<
    "approve" | "reject" | "verify" | "reject_payment" | "preparing" | "ready_for_dispatch" | "dispatch" | "mark_delivered" | null
  >(null);
  const [paymentInstructionsInput, setPaymentInstructionsInput] = useState("");
  const [rejectionReasonInput, setRejectionReasonInput] = useState("");
  const [paymentRejectionReasonInput, setPaymentRejectionReasonInput] = useState("");
  const [internalNoteInput, setInternalNoteInput] = useState("");
  const [driverNameInput, setDriverNameInput] = useState("");
  const [driverPhoneInput, setDriverPhoneInput] = useState("");
  const [estimatedDeliveryTimeInput, setEstimatedDeliveryTimeInput] = useState("30-40 mins");
  const [deliveryStatusNoteInput, setDeliveryStatusNoteInput] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);

  // Initial Auth & Role Check
  useEffect(() => {
    async function checkAuth() {
      const token = getAuthToken();
      if (!token) {
        setAuthChecked(true);
        setIsOwner(false);
        setLoading(false);
        return;
      }
      try {
        const userData = await getCurrentUserProfile();
        setProfile(userData);
        if (userData.role === "owner") {
          setIsOwner(true);
        } else {
          setIsOwner(false);
        }
      } catch {
        setIsOwner(false);
      } finally {
        setAuthChecked(true);
      }
    }
    checkAuth();
  }, []);

  // Fetch Summary & Orders
  const loadDashboardData = useCallback(async () => {
    if (!isOwner) return;
    setLoading(true);
    setError(null);

    try {
      // Load summary and orders in parallel
      const [dashData, ordersData] = await Promise.all([
        getOwnerDashboard(),
        getOwnerOrders({
          status: selectedStatus || undefined,
          payment_status: selectedPaymentStatus || undefined,
          search: searchQuery || undefined,
          page: currentPage,
        }),
      ]);

      setSummary(dashData.summary);
      setOrders(ordersData.results || []);
      setTotalOrdersCount(ordersData.count || 0);
      setTotalPages(Math.ceil((ordersData.count || 0) / 12) || 1);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load dashboard data";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [isOwner, selectedStatus, selectedPaymentStatus, searchQuery, currentPage]);

  useEffect(() => {
    if (isOwner) {
      loadDashboardData();
    }
  }, [isOwner, loadDashboardData]);

  const loadReviews = useCallback(async () => {
    if (!isOwner) return;
    setLoadingReviews(true);
    try {
      const res = await getOwnerReviews();
      const list = Array.isArray(res) ? res : res.results || [];
      setReviews(list);
      setReviewsCount(Array.isArray(res) ? list.length : res.count || list.length);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load reviews";
      setError(msg);
    } finally {
      setLoadingReviews(false);
    }
  }, [isOwner]);

  useEffect(() => {
    if (isOwner && activeTab === "reviews") {
      loadReviews();
    }
  }, [isOwner, activeTab, loadReviews]);

  const handleModerateReview = async (reviewId: number, currentVisible: boolean) => {
    try {
      const updated = await moderateReview(reviewId, !currentVisible);
      setReviews((prev) => prev.map((r) => (r.id === reviewId ? updated : r)));
      setSuccessMessage(`Review visibility updated to ${updated.is_visible ? "Visible" : "Hidden"}.`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to moderate review";
      setError(msg);
    }
  };

  // Inspect order click
  const handleInspectOrder = async (publicId: string) => {
    setLoadingOrderDetail(true);
    setActionError(null);
    setActionType(null);
    setInspectModalOpen(true);
    try {
      const detail = await getOwnerOrderDetail(publicId);
      setSelectedOrder(detail);
      setPaymentInstructionsInput(detail.payment_instructions || "");
      setInternalNoteInput(detail.internal_note || "");
      setRejectionReasonInput("");
      setPaymentRejectionReasonInput("");
      setDriverNameInput(detail.driver_name || "");
      setDriverPhoneInput(detail.driver_phone || "");
      setEstimatedDeliveryTimeInput(detail.estimated_delivery_time || "30-40 mins");
      setDeliveryStatusNoteInput("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load order detail";
      setActionError(msg);
    } finally {
      setLoadingOrderDetail(false);
    }
  };

  // Submit Action (Approve / Reject / Verify / Reject Payment / Preparing / Ready / Dispatch / Delivered)
  const handleExecuteAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !actionType) return;

    setSubmittingAction(true);
    setActionError(null);

    try {
      let updated: OwnerOrderDetailData;

      if (actionType === "approve") {
        updated = await approveOrder(selectedOrder.public_id, {
          payment_instructions: paymentInstructionsInput.trim() || undefined,
          internal_note: internalNoteInput.trim() || undefined,
        });
        setSuccessMessage(`Order ${updated.reference} approved successfully!`);
      } else if (actionType === "reject") {
        if (!rejectionReasonInput.trim()) {
          setActionError("Rejection reason is required.");
          setSubmittingAction(false);
          return;
        }
        updated = await rejectOrder(selectedOrder.public_id, {
          rejection_reason: rejectionReasonInput.trim(),
          internal_note: internalNoteInput.trim() || undefined,
        });
        setSuccessMessage(`Order ${updated.reference} rejected.`);
      } else if (actionType === "verify") {
        updated = await verifyOrderPayment(selectedOrder.public_id, {
          internal_note: internalNoteInput.trim() || undefined,
        });
        setSuccessMessage(`Payment for ${updated.reference} verified!`);
      } else if (actionType === "reject_payment") {
        if (!paymentRejectionReasonInput.trim()) {
          setActionError("Payment rejection reason is required.");
          setSubmittingAction(false);
          return;
        }
        updated = await rejectOrderPayment(selectedOrder.public_id, {
          payment_rejection_reason: paymentRejectionReasonInput.trim(),
          internal_note: internalNoteInput.trim() || undefined,
        });
        setSuccessMessage(`Payment proof for ${updated.reference} rejected.`);
      } else if (actionType === "preparing") {
        updated = await updateDeliveryStatus(selectedOrder.public_id, {
          status: "preparing",
          note: deliveryStatusNoteInput.trim() || undefined,
        });
        setSuccessMessage(`Order ${updated.reference} marked as kitchen preparing!`);
      } else if (actionType === "ready_for_dispatch") {
        updated = await updateDeliveryStatus(selectedOrder.public_id, {
          status: "ready_for_dispatch",
          note: deliveryStatusNoteInput.trim() || undefined,
        });
        setSuccessMessage(`Order ${updated.reference} marked ready for dispatch!`);
      } else if (actionType === "dispatch") {
        if (!driverNameInput.trim()) {
          setActionError("Driver name is required.");
          setSubmittingAction(false);
          return;
        }
        const cleanedPhone = driverPhoneInput.replace(/\D/g, "");
        if (cleanedPhone.length !== 10 || !/^[6-9]/.test(cleanedPhone)) {
          setActionError("Driver phone must be a valid 10-digit Indian mobile number (e.g. 9876543210).");
          setSubmittingAction(false);
          return;
        }
        updated = await dispatchOrder(selectedOrder.public_id, {
          driver_name: driverNameInput.trim(),
          driver_phone: cleanedPhone,
          estimated_delivery_time: estimatedDeliveryTimeInput.trim() || undefined,
          note: deliveryStatusNoteInput.trim() || undefined,
        });
        setSuccessMessage(`Order ${updated.reference} dispatched with driver ${driverNameInput}!`);
      } else {
        // mark_delivered
        updated = await updateDeliveryStatus(selectedOrder.public_id, {
          status: "delivered",
          note: deliveryStatusNoteInput.trim() || undefined,
        });
        setSuccessMessage(`Order ${updated.reference} marked as delivered!`);
      }

      setSelectedOrder(updated);
      setActionType(null);
      loadDashboardData(); // Refresh summary and table
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Action failed";
      setActionError(msg);
    } finally {
      setSubmittingAction(false);
    }
  };

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-900 border-amber-300",
    approved: "bg-emerald-100 text-emerald-900 border-emerald-300",
    preparing: "bg-orange-100 text-orange-900 border-orange-300",
    ready_for_dispatch: "bg-indigo-100 text-indigo-900 border-indigo-300",
    out_for_delivery: "bg-sky-100 text-sky-900 border-sky-300",
    delivered: "bg-emerald-100 text-emerald-900 border-emerald-300",
    rejected: "bg-red-100 text-red-900 border-red-300",
    cancelled: "bg-stone-100 text-stone-700 border-stone-300",
  };

  const paymentColors: Record<string, string> = {
    unpaid: "bg-amber-50 text-amber-800 border-amber-200",
    submitted: "bg-blue-50 text-blue-800 border-blue-200",
    verified: "bg-emerald-50 text-emerald-800 border-emerald-200",
    rejected: "bg-red-50 text-red-800 border-red-200",
  };

  // If Auth check finished and user is not owner
  if (authChecked && !isOwner) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F7F1E5] text-[#183D2B]">
        <Navbar />
        <main className="flex-1 max-w-xl mx-auto px-4 py-36 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#183D2B]">Owner Access Required</h1>
            <p className="text-sm text-stone-600 mt-2 leading-relaxed">
              This dashboard is strictly restricted to authenticated MilletMarg store owners.
              {profile ? (
                <> Your current account role is <span className="font-bold underline">{profile.role}</span>.</>
              ) : (
                <> Please sign in with an authorized owner account.</>
              )}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/profile"
              className="px-5 py-2.5 rounded-xl bg-[#183D2B] text-white text-xs font-bold hover:bg-[#122e20] transition shadow"
            >
              Go to Account / Login
            </Link>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-700 text-xs font-bold hover:bg-stone-50 transition shadow"
            >
              Return to Store
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F1E5] text-[#183D2B]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-28 w-full space-y-8">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#C07F00] text-white tracking-wider uppercase">
                Owner Portal
              </span>
              <span className="text-xs text-stone-500 font-medium">MilletMarg Indore</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#183D2B] mt-1">
              Store Order Management
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadDashboardData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-stone-200 text-xs font-bold text-stone-700 hover:text-[#183D2B] hover:bg-stone-50 transition shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-stone-200">
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition ${
              activeTab === "orders"
                ? "border-[#183D2B] text-[#183D2B]"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            Orders & Delivery Operations
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "reviews"
                ? "border-[#183D2B] text-[#183D2B]"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            Customer Reviews {reviewsCount > 0 ? `(${reviewsCount})` : ""}
          </button>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-sm font-semibold">{successMessage}</p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        {/* 1. Summary Metrics Cards (Visible in Orders Tab) */}
        {summary && activeTab === "orders" && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block mb-1">
                Pending Approval
              </span>
              <span className="text-xl sm:text-2xl font-black text-amber-800">
                {summary.pending_approval}
              </span>
              <span className="text-[10px] text-stone-400 block mt-0.5">Review</span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block mb-1">
                Verify Payment
              </span>
              <span className="text-xl sm:text-2xl font-black text-purple-800">
                {summary.payment_verification_pending}
              </span>
              <span className="text-[10px] text-stone-400 block mt-0.5">Receipt</span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 block mb-1">
                Kitchen Preparing
              </span>
              <span className="text-xl sm:text-2xl font-black text-orange-800">
                {summary.preparing || 0}
              </span>
              <span className="text-[10px] text-stone-400 block mt-0.5">Cooking</span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block mb-1">
                Ready for Dispatch
              </span>
              <span className="text-xl sm:text-2xl font-black text-indigo-800">
                {summary.ready_for_dispatch || 0}
              </span>
              <span className="text-[10px] text-stone-400 block mt-0.5">Packed</span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 block mb-1">
                Out for Delivery
              </span>
              <span className="text-xl sm:text-2xl font-black text-sky-800">
                {summary.out_for_delivery || 0}
              </span>
              <span className="text-[10px] text-stone-400 block mt-0.5">On way</span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
                Delivered
              </span>
              <span className="text-xl sm:text-2xl font-black text-emerald-800">
                {summary.delivered || 0}
              </span>
              <span className="text-[10px] text-stone-400 block mt-0.5">Completed</span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block mb-1">
                Closed
              </span>
              <span className="text-xl sm:text-2xl font-black text-rose-800">
                {summary.rejected_or_cancelled}
              </span>
              <span className="text-[10px] text-stone-400 block mt-0.5">Rejected/Cancel</span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C07F00] block mb-1">
                Verified Rev.
              </span>
              <span className="text-lg sm:text-xl font-black text-[#183D2B]">
                ₹{summary.total_revenue}
              </span>
              <span className="text-[10px] text-stone-400 block mt-0.5">{summary.total_orders} total</span>
            </div>
          </div>
        )}

        {/* Orders View */}
        {activeTab === "orders" && (
          <>
            {/* 2. Filters & Search Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search reference (MM-XXXX), customer, phone, email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#183D2B]"
              />
            </div>

            {/* Order Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 text-stone-700 focus:outline-none"
            >
              <option value="">All Order Statuses</option>
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="preparing">Kitchen Preparing</option>
              <option value="ready_for_dispatch">Ready for Dispatch</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Payment Status Filter */}
            <select
              value={selectedPaymentStatus}
              onChange={(e) => {
                setSelectedPaymentStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 text-stone-700 focus:outline-none"
            >
              <option value="">All Payment Statuses</option>
              <option value="unpaid">Unpaid</option>
              <option value="submitted">Proof Submitted</option>
              <option value="verified">Verified</option>
              <option value="rejected">Proof Rejected</option>
            </select>

            {(selectedStatus || selectedPaymentStatus || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedStatus("");
                  setSelectedPaymentStatus("");
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="text-xs text-stone-500 hover:text-stone-800 underline"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* 3. Orders Table */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-stone-500">
              <Loader2 className="w-8 h-8 animate-spin text-[#C07F00] mb-3" />
              <p className="text-sm">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center text-stone-500 space-y-2">
              <Package className="w-12 h-12 text-stone-300 mx-auto" />
              <p className="text-sm font-semibold text-stone-800">No orders match criteria</p>
              <p className="text-xs text-stone-400">Try adjusting your status filters or search term.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[11px] font-bold">
                  <tr>
                    <th className="py-3.5 px-4">Order Ref</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Items</th>
                    <th className="py-3.5 px-4">Total</th>
                    <th className="py-3.5 px-4">Order Status</th>
                    <th className="py-3.5 px-4">Payment Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {orders.map((ord) => (
                    <tr key={ord.public_id} className="hover:bg-stone-50/70 transition">
                      <td className="py-3.5 px-4 font-bold text-[#183D2B]">
                        {ord.reference}
                      </td>
                      <td className="py-3.5 px-4 text-stone-500 font-mono whitespace-nowrap">
                        {new Date(ord.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-stone-900">{ord.recipient_name}</div>
                        <div className="text-[11px] text-stone-500 font-mono">{ord.phone_number}</div>
                      </td>
                      <td className="py-3.5 px-4 text-stone-600">
                        {ord.items_count} item{ord.items_count > 1 ? "s" : ""}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-[#183D2B]">
                        ₹{ord.total}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            statusColors[ord.status] || "bg-stone-100 text-stone-700"
                          }`}
                        >
                          {ord.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                              paymentColors[ord.payment_status] || "bg-stone-100 text-stone-700"
                            }`}
                          >
                            {ord.payment_status}
                          </span>
                          {ord.has_payment_receipt && (
                            <span title="Receipt proof uploaded" className="p-0.5 bg-blue-100 text-blue-700 rounded">
                              <FileCheck className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleInspectOrder(ord.public_id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#183D2B] text-white text-[11px] font-bold hover:bg-[#122e20] transition shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-stone-200 flex items-center justify-between text-xs text-stone-600">
              <span>
                Showing page {currentPage} of {totalPages} ({totalOrdersCount} orders)
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg border border-stone-200 disabled:opacity-40 hover:bg-stone-50"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-lg border border-stone-200 disabled:opacity-40 hover:bg-stone-50"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </>
    )}

    {/* Customer Reviews Tab */}
    {activeTab === "reviews" && (
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden space-y-0">
        <div className="p-5 border-b border-stone-100 flex flex-wrap items-center justify-between gap-3 bg-stone-50/50">
          <div>
            <h3 className="text-base font-bold text-[#183D2B] flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
              Customer Reviews & Feedback Moderation
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Review, verify, and moderate customer ratings on delivered millet orders.
            </p>
          </div>

          <button
            onClick={loadReviews}
            disabled={loadingReviews}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-xs font-bold text-stone-700 hover:text-[#183D2B] hover:bg-stone-50 transition shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingReviews ? "animate-spin" : ""}`} />
            Refresh Reviews
          </button>
        </div>

        {loadingReviews ? (
          <div className="py-20 text-center text-stone-500">
            <Loader2 className="w-8 h-8 animate-spin text-[#C07F00] mx-auto mb-2" />
            <p className="text-xs">Loading customer reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-16 text-center text-stone-500">
            <Star className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-stone-800">No reviews submitted yet.</p>
            <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
              Customer reviews appear here automatically when diners rate their delivered meals.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50/40 transition"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= rev.rating ? "fill-amber-400 text-amber-500" : "text-stone-200"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-stone-800">{rev.rating} / 5</span>
                    <span className="text-xs text-stone-300">&bull;</span>
                    <span className="text-xs font-bold text-stone-800">{rev.user_name}</span>
                    <span className="text-xs text-stone-300">&bull;</span>
                    <span className="text-xs font-mono font-semibold text-[#183D2B]">
                      Order #{rev.order_reference}
                    </span>
                    <span className="text-[10px] font-mono text-stone-400">
                      {new Date(rev.created_at).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  {rev.comment ? (
                    <p className="text-xs text-stone-700 leading-relaxed italic pl-1">
                      "{rev.comment}"
                    </p>
                  ) : (
                    <p className="text-xs text-stone-400 italic pl-1">No written feedback provided.</p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                      rev.is_visible
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-stone-100 text-stone-600 border-stone-200"
                    }`}
                  >
                    {rev.is_visible ? "Visible in Store" : "Hidden"}
                  </span>

                  <button
                    onClick={() => handleModerateReview(rev.id, rev.is_visible)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                      rev.is_visible
                        ? "border-red-200 text-red-700 hover:bg-red-50"
                        : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                    }`}
                  >
                    {rev.is_visible ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        Hide Review
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        Show in Store
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )}

        {/* 4. Order Details Modal / Drawer */}
        {inspectModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden my-auto">
              {/* Modal Header */}
              <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#C07F00]">
                    Order Review & Management
                  </span>
                  <h3 className="text-xl font-extrabold text-[#183D2B]">
                    {selectedOrder ? selectedOrder.reference : "Loading Order..."}
                  </h3>
                </div>

                <button
                  onClick={() => setInspectModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 flex items-center justify-center text-stone-600 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-stone-700">
                {loadingOrderDetail ? (
                  <div className="py-20 text-center text-stone-500">
                    <Loader2 className="w-8 h-8 animate-spin text-[#C07F00] mx-auto mb-2" />
                    <p>Loading full order details...</p>
                  </div>
                ) : !selectedOrder ? (
                  <div className="py-10 text-center text-stone-500">
                    <p>Could not load order information.</p>
                  </div>
                ) : (
                  <>
                    {/* Status & Payment Badges */}
                    <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-stone-500 font-semibold">Status:</span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            statusColors[selectedOrder.status]
                          }`}
                        >
                          {selectedOrder.status.toUpperCase()}
                        </span>

                        <span className="text-stone-500 font-semibold ml-2">Payment:</span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            paymentColors[selectedOrder.payment_status]
                          }`}
                        >
                          {selectedOrder.payment_status.toUpperCase()}
                        </span>
                      </div>

                      {/* WhatsApp Link for Owner to Customer */}
                      {selectedOrder.whatsapp_url && (
                        <a
                          href={selectedOrder.whatsapp_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#25D366] text-white text-[11px] font-bold hover:bg-[#20ba59] transition"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          Chat Customer on WhatsApp
                        </a>
                      )}
                    </div>

                    {/* Customer & Delivery Snapshot */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Customer Contact */}
                      <div className="p-4 rounded-xl border border-stone-200 space-y-1.5 bg-white">
                        <h4 className="font-bold text-stone-900 border-b border-stone-100 pb-1 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[#C07F00]" />
                          Customer Info
                        </h4>
                        <p className="font-semibold text-stone-800">{selectedOrder.recipient_name}</p>
                        <p className="font-mono text-stone-600 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-stone-400" />
                          {selectedOrder.phone_number}
                        </p>
                        <p className="text-stone-500 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-stone-400" />
                          {selectedOrder.customer_email || "N/A"}
                        </p>
                        <p className="text-[11px] text-stone-400">Username: {selectedOrder.customer_username}</p>
                      </div>

                      {/* Delivery Address */}
                      <div className="p-4 rounded-xl border border-stone-200 space-y-1.5 bg-white">
                        <h4 className="font-bold text-stone-900 border-b border-stone-100 pb-1 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#C07F00]" />
                          Delivery Address & Distance
                        </h4>
                        <p className="text-stone-800 leading-relaxed">
                          {selectedOrder.address_snapshot && (
                            <>
                              {Boolean(selectedOrder.address_snapshot.house_number) && `${selectedOrder.address_snapshot.house_number}, `}
                              {Boolean(selectedOrder.address_snapshot.room_number) && `Unit ${selectedOrder.address_snapshot.room_number}, `}
                              {selectedOrder.address_snapshot.address_line as string}
                              <br />
                              {selectedOrder.address_snapshot.city as string}, {selectedOrder.address_snapshot.state as string} — {selectedOrder.address_snapshot.postal_code as string}
                            </>
                          )}
                        </p>
                        <p className="font-mono text-stone-500 text-[11px] pt-1">
                          Distance: {selectedOrder.road_distance_km} km ({selectedOrder.billable_distance_km} billable km)
                        </p>
                      </div>
                    </div>

                    {/* Ordered Items Table */}
                    <div className="p-4 rounded-xl border border-stone-200 space-y-3 bg-white">
                      <h4 className="font-bold text-stone-900 border-b border-stone-100 pb-1 flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-[#C07F00]" />
                        Ordered Items
                      </h4>
                      <div className="space-y-2">
                        {selectedOrder.items.map((it) => (
                          <div key={it.id} className="flex justify-between items-center py-1 border-b border-stone-50 last:border-0">
                            <div>
                              <span className="font-bold text-stone-800">{it.product_name}</span>
                              <span className="text-stone-500 font-mono ml-2">
                                (₹{it.unit_price} &times; {it.quantity} &middot; {it.weight_grams}g)
                              </span>
                            </div>
                            <span className="font-bold text-stone-900 font-mono">₹{it.line_total}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-stone-200 space-y-1 text-right">
                        <div>Subtotal: <span className="font-semibold">₹{selectedOrder.subtotal}</span></div>
                        <div>
                          Delivery Fee:{" "}
                          <span className="font-semibold">
                            {selectedOrder.is_free_delivery ? "FREE (₹0.00)" : `₹${selectedOrder.delivery_fee_charged}`}
                          </span>
                        </div>
                        <div className="text-sm font-extrabold text-[#183D2B] pt-1 border-t border-stone-100">
                          Total Amount: ₹{selectedOrder.total}
                        </div>
                      </div>
                    </div>

                    {/* Payment Verification & Receipt Section */}
                    <div className="p-4 rounded-xl border border-stone-200 space-y-3 bg-white">
                      <h4 className="font-bold text-stone-900 border-b border-stone-100 pb-1 flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-[#C07F00]" />
                        Payment Verification & Submitted Proof
                      </h4>

                      {selectedOrder.receipt_url ? (
                        <div className="space-y-3">
                          <p className="text-stone-600">
                            Customer has uploaded a payment proof image. View/verify it below:
                          </p>
                          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex flex-wrap items-center gap-4">
                            <a
                              href={selectedOrder.receipt_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#183D2B] text-white font-bold hover:bg-[#122e20] transition shadow-sm"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              View / Download Full Receipt
                            </a>

                            {selectedOrder.payment_submitted_at && (
                              <span className="text-stone-500 font-mono text-[11px]">
                                Submitted at: {new Date(selectedOrder.payment_submitted_at).toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-stone-400 italic">No payment proof uploaded yet.</p>
                      )}

                      {/* Rejection reasons if applicable */}
                      {selectedOrder.rejection_reason && (
                        <div className="p-3 rounded-lg bg-red-50 text-red-800 border border-red-200">
                          <span className="font-bold">Order Rejection Reason: </span>
                          {selectedOrder.rejection_reason}
                        </div>
                      )}
                      {selectedOrder.payment_rejection_reason && (
                        <div className="p-3 rounded-lg bg-red-50 text-red-800 border border-red-200">
                          <span className="font-bold">Payment Rejection Reason: </span>
                          {selectedOrder.payment_rejection_reason}
                        </div>
                      )}
                    </div>

                    {/* Stage 5: Delivery & Driver Information */}
                    {(selectedOrder.driver_name || selectedOrder.driver_phone) && (
                      <div className="p-4 rounded-xl border border-stone-200 space-y-2 bg-sky-50/50">
                        <div className="flex items-center justify-between border-b border-stone-200/60 pb-2">
                          <h4 className="font-bold text-stone-900 flex items-center gap-1.5">
                            <Truck className="w-4 h-4 text-sky-700" />
                            Assigned Delivery Driver
                          </h4>
                          {selectedOrder.is_customer_confirmed && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              Customer Confirmed Receipt
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-stone-500 font-semibold block text-[11px]">Driver Name</span>
                            <span className="font-bold text-stone-900">{selectedOrder.driver_name}</span>
                          </div>
                          <div>
                            <span className="text-stone-500 font-semibold block text-[11px]">Contact Phone</span>
                            <span className="font-mono text-stone-900">+91 {selectedOrder.driver_phone}</span>
                          </div>
                          {selectedOrder.estimated_delivery_time && (
                            <div>
                              <span className="text-stone-500 font-semibold block text-[11px]">Estimated Time</span>
                              <span className="text-stone-800">{selectedOrder.estimated_delivery_time}</span>
                            </div>
                          )}
                          {selectedOrder.dispatched_at && (
                            <div>
                              <span className="text-stone-500 font-semibold block text-[11px]">Dispatched At</span>
                              <span className="font-mono text-stone-800">
                                {new Date(selectedOrder.dispatched_at).toLocaleString("en-IN")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Stage 5: Customer Review in Modal */}
                    {selectedOrder.review && (
                      <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
                        <div className="flex items-center justify-between border-b border-amber-200/60 pb-1">
                          <h4 className="font-bold text-amber-950 flex items-center gap-1.5">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                            Customer Review & Rating
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              selectedOrder.review.is_visible
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : "bg-stone-200 text-stone-700"
                            }`}
                          >
                            {selectedOrder.review.is_visible ? "Visible in Store" : "Hidden"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-amber-500">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= selectedOrder.review!.rating
                                  ? "fill-amber-400 text-amber-500"
                                  : "text-stone-300"
                              }`}
                            />
                          ))}
                          <span className="text-xs font-bold text-stone-800 ml-1">
                            {selectedOrder.review.rating} / 5
                          </span>
                        </div>

                        {selectedOrder.review.comment ? (
                          <p className="text-xs text-stone-700 italic">"{selectedOrder.review.comment}"</p>
                        ) : (
                          <p className="text-xs text-stone-400 italic">No text comment provided.</p>
                        )}
                      </div>
                    )}

                    {/* Stage 5: Delivery Status Logs */}
                    {selectedOrder.delivery_logs && selectedOrder.delivery_logs.length > 0 && (
                      <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2">
                        <h4 className="font-bold text-stone-800 text-[11px] uppercase tracking-wider">
                          Delivery Activity Logs
                        </h4>
                        <div className="space-y-1.5 border-l-2 border-stone-200 pl-3">
                          {selectedOrder.delivery_logs.map((log) => (
                            <div key={log.id} className="text-xs">
                              <div className="flex items-center justify-between text-stone-700">
                                <span className="font-semibold capitalize">{log.status.replace("_", " ")}</span>
                                <span className="font-mono text-[10px] text-stone-400">
                                  {new Date(log.created_at).toLocaleString("en-IN", {
                                    dateStyle: "short",
                                    timeStyle: "short",
                                  })}
                                </span>
                              </div>
                              {log.note && <p className="text-[11px] text-stone-500">{log.note}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Execution Form */}
                    {actionType && (
                      <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">
                            Confirm Action: {actionType.replace("_", " ")}
                          </h4>
                          <button
                            type="button"
                            onClick={() => setActionType(null)}
                            className="text-stone-400 hover:text-stone-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {actionError && (
                          <div className="p-3 rounded-lg bg-red-100 text-red-800 text-xs font-semibold">
                            {actionError}
                          </div>
                        )}

                        <form onSubmit={handleExecuteAction} className="space-y-3">
                          {actionType === "approve" && (
                            <div>
                              <label className="block font-bold text-stone-800 mb-1">
                                Payment Instructions (Customizable or leave as default):
                              </label>
                              <textarea
                                rows={4}
                                value={paymentInstructionsInput}
                                onChange={(e) => setPaymentInstructionsInput(e.target.value)}
                                placeholder="Store UPI ID, Bank Transfer details, and instructions..."
                                className="w-full p-2.5 rounded-lg border border-stone-300 text-xs font-mono bg-white focus:outline-none"
                              />
                            </div>
                          )}

                          {actionType === "reject" && (
                            <div>
                              <label className="block font-bold text-red-900 mb-1">
                                Rejection Reason (Required - sent to customer):
                              </label>
                              <textarea
                                rows={3}
                                value={rejectionReasonInput}
                                onChange={(e) => setRejectionReasonInput(e.target.value)}
                                placeholder="e.g. Items out of stock, weather delay, delivery unavailable..."
                                className="w-full p-2.5 rounded-lg border border-red-300 text-xs bg-white focus:outline-none"
                                required
                              />
                            </div>
                          )}

                          {actionType === "reject_payment" && (
                            <div>
                              <label className="block font-bold text-red-900 mb-1">
                                Payment Rejection Reason (Required - sent to customer):
                              </label>
                              <textarea
                                rows={3}
                                value={paymentRejectionReasonInput}
                                onChange={(e) => setPaymentRejectionReasonInput(e.target.value)}
                                placeholder="e.g. UTR number not visible, wrong amount paid, blurry image..."
                                className="w-full p-2.5 rounded-lg border border-red-300 text-xs bg-white focus:outline-none"
                                required
                              />
                            </div>
                          )}

                          {actionType === "dispatch" && (
                            <div className="space-y-3">
                              <div>
                                <label className="block font-bold text-stone-800 mb-1">
                                  Driver Full Name:
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={driverNameInput}
                                  onChange={(e) => setDriverNameInput(e.target.value)}
                                  placeholder="e.g. Ramesh Kumar"
                                  className="w-full p-2.5 rounded-lg border border-stone-300 text-xs bg-white focus:outline-none"
                                />
                              </div>

                              <div>
                                <label className="block font-bold text-stone-800 mb-1">
                                  Driver Mobile Phone (10-digit Indian Number):
                                </label>
                                <input
                                  type="tel"
                                  required
                                  maxLength={10}
                                  value={driverPhoneInput}
                                  onChange={(e) => setDriverPhoneInput(e.target.value)}
                                  placeholder="e.g. 9876543210"
                                  className="w-full p-2.5 rounded-lg border border-stone-300 text-xs font-mono bg-white focus:outline-none"
                                />
                                <span className="text-[10px] text-stone-400 mt-0.5 block">
                                  Will be clickable for Direct Phone Call and WhatsApp on customer page.
                                </span>
                              </div>

                              <div>
                                <label className="block font-bold text-stone-800 mb-1">
                                  Estimated Delivery Time / Window (Optional):
                                </label>
                                <input
                                  type="text"
                                  value={estimatedDeliveryTimeInput}
                                  onChange={(e) => setEstimatedDeliveryTimeInput(e.target.value)}
                                  placeholder="e.g. 30-40 mins, By 7:30 PM"
                                  className="w-full p-2.5 rounded-lg border border-stone-300 text-xs bg-white focus:outline-none"
                                />
                              </div>
                            </div>
                          )}

                          {(actionType === "preparing" ||
                            actionType === "ready_for_dispatch" ||
                            actionType === "mark_delivered") && (
                            <div>
                              <label className="block font-bold text-stone-800 mb-1">
                                Status Note (Optional - visible in tracking timeline):
                              </label>
                              <input
                                type="text"
                                value={deliveryStatusNoteInput}
                                onChange={(e) => setDeliveryStatusNoteInput(e.target.value)}
                                placeholder="e.g. Fresh batch in oven, Sealed with tamper tape, Handed to customer"
                                className="w-full p-2.5 rounded-lg border border-stone-300 text-xs bg-white focus:outline-none"
                              />
                            </div>
                          )}

                          <div>
                            <label className="block font-semibold text-stone-700 mb-1">
                              Internal Staff Note (Optional - visible only to owner):
                            </label>
                            <input
                              type="text"
                              value={internalNoteInput}
                              onChange={(e) => setInternalNoteInput(e.target.value)}
                              placeholder="e.g. Checked phone call with customer"
                              className="w-full p-2 rounded-lg border border-stone-300 text-xs bg-white focus:outline-none"
                            />
                          </div>

                          <div className="flex items-center gap-2 pt-2">
                            <button
                              type="submit"
                              disabled={submittingAction}
                              className={`px-4 py-2 rounded-xl text-white font-bold transition shadow disabled:opacity-50 ${
                                actionType.startsWith("reject")
                                  ? "bg-red-600 hover:bg-red-700"
                                  : "bg-[#183D2B] hover:bg-[#122e20]"
                              }`}
                            >
                              {submittingAction ? "Processing..." : `Confirm ${actionType.replace("_", " ")}`}
                            </button>
                            <button
                              type="button"
                              onClick={() => setActionType(null)}
                              className="px-3 py-2 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-100"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Modal Footer Action Buttons */}
              {selectedOrder && !actionType && (
                <div className="p-4 border-t border-stone-200 bg-stone-50 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Approve / Reject buttons for Pending orders */}
                    {selectedOrder.status === "pending" && (
                      <>
                        <button
                          onClick={() => setActionType("approve")}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-sm"
                        >
                          Approve Order
                        </button>
                        <button
                          onClick={() => setActionType("reject")}
                          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition shadow-sm"
                        >
                          Reject Order
                        </button>
                      </>
                    )}

                    {/* Verify / Reject Payment buttons for Approved & Submitted orders */}
                    {selectedOrder.status === "approved" && selectedOrder.payment_status === "submitted" && (
                      <>
                        <button
                          onClick={() => setActionType("verify")}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-sm"
                        >
                          Verify Payment
                        </button>
                        <button
                          onClick={() => setActionType("reject_payment")}
                          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition shadow-sm"
                        >
                          Reject Payment Proof
                        </button>
                      </>
                    )}

                    {/* Stage 5: Fulfillment & Delivery Transition Buttons (Requires Verified Payment) */}
                    {selectedOrder.payment_status === "verified" && (
                      <>
                        {selectedOrder.status === "approved" && (
                          <button
                            onClick={() => setActionType("preparing")}
                            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition shadow-sm"
                          >
                            Mark Preparing (Kitchen)
                          </button>
                        )}

                        {(selectedOrder.status === "approved" || selectedOrder.status === "preparing") && (
                          <button
                            onClick={() => setActionType("ready_for_dispatch")}
                            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-sm"
                          >
                            Mark Ready for Dispatch
                          </button>
                        )}

                        {["approved", "preparing", "ready_for_dispatch"].includes(selectedOrder.status) && (
                          <button
                            onClick={() => setActionType("dispatch")}
                            className="px-4 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold transition shadow-sm flex items-center gap-1.5"
                          >
                            <Truck className="w-4 h-4" />
                            Dispatch & Assign Driver
                          </button>
                        )}

                        {selectedOrder.status === "out_for_delivery" && (
                          <button
                            onClick={() => setActionType("mark_delivered")}
                            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition shadow-sm flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Mark Delivered
                          </button>
                        )}
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => setInspectModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-stone-300 bg-white text-stone-700 font-bold hover:bg-stone-100 transition"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
