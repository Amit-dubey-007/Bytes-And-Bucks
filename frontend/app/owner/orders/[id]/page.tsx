"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  getCurrentUserProfile,
  getOwnerOrderDetail,
  approveOrder,
  rejectOrder,
  verifyOrderPayment,
  rejectOrderPayment,
  updateOwnerOrderDriver,
  updateDeliveryStatus,
  dispatchOrder,
  UserProfileData,
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
  FileCheck,
  CreditCard,
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
  MessageSquare,
  Truck,
  ArrowLeft,
  Navigation,
  Send,
  Save,
} from "lucide-react";

function OwnerOrderDetailContent() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  const [order, setOrder] = useState<OwnerOrderDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Action Modals & Form States
  const [activeActionModal, setActiveActionModal] = useState<
    "approve" | "reject" | "verify" | "reject_payment" | "dispatch" | null
  >(null);
  const [submittingAction, setSubmittingAction] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Form Inputs
  const [paymentInstructions, setPaymentInstructions] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [paymentRejectionReason, setPaymentRejectionReason] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState("30-40 mins");
  const [deliveryStatusNote, setDeliveryStatusNote] = useState("");
  const [savingDriver, setSavingDriver] = useState(false);

  // 1. Check Auth & Owner Role
  useEffect(() => {
    async function checkAuth() {
      const token = getAuthToken();
      if (!token) {
        // Redirect to profile for login and preserve destination
        router.push(`/profile?redirect=/owner/orders/${orderId}`);
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
  }, [orderId, router]);

  // 2. Load Order Details
  const loadOrder = useCallback(async () => {
    if (!isOwner || !orderId) return;
    setLoading(true);
    setError(null);
    try {
      const detail = await getOwnerOrderDetail(orderId);
      setOrder(detail);
      setPaymentInstructions(
        detail.payment_instructions ||
          "Please pay via UPI to: milletmarg@upi or scan QR. Mention order ref: " + detail.reference
      );
      setInternalNote(detail.internal_note || "");
      setDriverName(detail.driver_name || "");
      setDriverPhone(detail.driver_phone || "");
      setEstimatedDeliveryTime(detail.estimated_delivery_time || "30-40 mins");
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 404) {
        setError(`Order "${orderId}" was not found.`);
      } else {
        const msg = err instanceof Error ? err.message : "Failed to load order detail";
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, [isOwner, orderId]);

  useEffect(() => {
    if (isOwner) {
      loadOrder();
    }
  }, [isOwner, loadOrder]);

  // Save Driver Details Independently (without changing order status)
  const handleSaveDriverDetails = async () => {
    if (!order) return;
    setSavingDriver(true);
    setError(null);
    try {
      const cleanPhone = driverPhone.replace(/\D/g, "");
      if (cleanPhone && (cleanPhone.length !== 10 || !/^[6-9]/.test(cleanPhone))) {
        throw new Error("Driver phone must be a valid 10-digit Indian mobile number (e.g. 9876543210).");
      }
      const updated = await updateOwnerOrderDriver(order.public_id, {
        driver_name: driverName.trim() || undefined,
        driver_phone: cleanPhone || undefined,
        estimated_delivery_time: estimatedDeliveryTime.trim() || undefined,
      });
      setOrder(updated);
      setSuccessMessage("Driver details updated successfully.");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save driver details";
      setError(msg);
    } finally {
      setSavingDriver(false);
    }
  };

  // Submit Modal Actions
  const handleExecuteAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !activeActionModal) return;

    setSubmittingAction(true);
    setActionError(null);

    try {
      let updated: OwnerOrderDetailData;

      if (activeActionModal === "approve") {
        const cleanPhone = driverPhone.replace(/\D/g, "");
        if (cleanPhone && (cleanPhone.length !== 10 || !/^[6-9]/.test(cleanPhone))) {
          throw new Error("Driver phone must be a valid 10-digit Indian mobile number.");
        }
        updated = await approveOrder(order.public_id, {
          payment_instructions: paymentInstructions.trim() || undefined,
          internal_note: internalNote.trim() || undefined,
          driver_name: driverName.trim() || undefined,
          driver_phone: cleanPhone || undefined,
          estimated_delivery_time: estimatedDeliveryTime.trim() || undefined,
        });
        setSuccessMessage(`Order ${updated.reference} approved successfully!`);
      } else if (activeActionModal === "reject") {
        if (!rejectionReason.trim()) {
          throw new Error("Please specify a reason for rejection.");
        }
        updated = await rejectOrder(order.public_id, {
          rejection_reason: rejectionReason.trim(),
          internal_note: internalNote.trim() || undefined,
        });
        setSuccessMessage(`Order ${updated.reference} rejected.`);
      } else if (activeActionModal === "verify") {
        // Manual verification confirmation outside website
        updated = await verifyOrderPayment(order.public_id, {
          internal_note: internalNote.trim() || undefined,
        });
        setSuccessMessage(`Payment for ${updated.reference} verified!`);
      } else if (activeActionModal === "reject_payment") {
        if (!paymentRejectionReason.trim()) {
          throw new Error("Please specify why payment was rejected.");
        }
        updated = await rejectOrderPayment(order.public_id, {
          payment_rejection_reason: paymentRejectionReason.trim(),
          internal_note: internalNote.trim() || undefined,
        });
        setSuccessMessage(`Payment for ${updated.reference} marked as rejected.`);
      } else if (activeActionModal === "dispatch") {
        if (!driverName.trim()) {
          throw new Error("Driver name is required for dispatch.");
        }
        const cleanPhone = driverPhone.replace(/\D/g, "");
        if (cleanPhone.length !== 10 || !/^[6-9]/.test(cleanPhone)) {
          throw new Error("Driver phone must be a valid 10-digit Indian mobile number.");
        }
        updated = await dispatchOrder(order.public_id, {
          driver_name: driverName.trim(),
          driver_phone: cleanPhone,
          estimated_delivery_time: estimatedDeliveryTime.trim() || undefined,
          note: deliveryStatusNote.trim() || undefined,
        });
        setSuccessMessage(`Order ${updated.reference} dispatched with driver ${driverName}!`);
      } else {
        return;
      }

      setOrder(updated);
      setActiveActionModal(null);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Action failed";
      setActionError(msg);
    } finally {
      setSubmittingAction(false);
    }
  };

  // Quick delivery status update (kitchen preparing / ready / delivered)
  const handleQuickStatusUpdate = async (status: "preparing" | "ready_for_dispatch" | "delivered") => {
    if (!order) return;
    try {
      const updated = await updateDeliveryStatus(order.public_id, { status });
      setOrder(updated);
      setSuccessMessage(`Order status updated to: ${status.replace(/_/g, " ")}`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update status";
      setError(msg);
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

  // If user is authenticated but not an owner
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
              Order management is restricted to authorized MilletMarg store owners.
              {profile ? (
                <>
                  {" "}
                  Your signed-in account (<strong>{profile.email}</strong>) has the role{" "}
                  <span className="font-bold underline text-stone-800">{profile.role}</span>.
                </>
              ) : null}
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={`/profile?redirect=/owner/orders/${orderId}`}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#183D2B] text-white text-xs font-bold hover:bg-[#122e20] transition shadow"
            >
              Switch Account (Sign in as Owner)
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition"
            >
              Return Home
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

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-28 w-full">
        {/* Breadcrumb Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/owner"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-[#183D2B] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Owner Dashboard
          </Link>

          <button
            onClick={loadOrder}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-[#183D2B] transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-sm font-medium">{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-stone-500">
            <Loader2 className="w-8 h-8 animate-spin text-[#C07F00] mb-3" />
            <p className="text-sm">Retrieving order details...</p>
          </div>
        ) : !order ? (
          <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center">
            <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-stone-700">Order not found.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Card */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase tracking-wider text-stone-400 font-bold">
                    Owner Management Portal
                  </span>
                  <div className="flex items-center gap-3 mt-1">
                    <h1 className="text-2xl font-extrabold text-[#183D2B]">{order.reference}</h1>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        statusColors[order.status] || "bg-stone-100 text-stone-800"
                      }`}
                    >
                      {order.status.replace(/_/g, " ").toUpperCase()}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        paymentColors[order.payment_status] || "bg-stone-100 text-stone-800"
                      }`}
                    >
                      Payment: {order.payment_status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 flex items-center gap-1.5 mt-1 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    Placed on {new Date(order.created_at).toLocaleString("en-IN")}
                  </p>
                </div>

                {/* Customer Contact Link */}
                <div className="flex items-center gap-2">
                  {order.whatsapp_url && (
                    <a
                      href={order.whatsapp_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#25D366] text-white text-xs font-bold hover:bg-[#20ba59] transition shadow-sm"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Chat with Customer on WhatsApp
                    </a>
                  )}
                  {order.phone_number && (
                    <a
                      href={`tel:${order.phone_number}`}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold hover:bg-stone-200 transition"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      Call
                    </a>
                  )}
                </div>
              </div>

              {/* Action Buttons Bar */}
              <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center gap-2">
                {order.status === "pending" && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setActionError(null);
                        setActiveActionModal("approve");
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition shadow-sm"
                    >
                      Approve Order
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActionError(null);
                        setActiveActionModal("reject");
                      }}
                      className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition shadow-sm"
                    >
                      Reject Order
                    </button>
                  </>
                )}

                {/* Manual Payment Verification (Outside Website) */}
                {order.status !== "pending" &&
                  order.status !== "rejected" &&
                  order.status !== "cancelled" &&
                  order.payment_status !== "verified" && (
                    <button
                      type="button"
                      onClick={() => {
                        setActionError(null);
                        setActiveActionModal("verify");
                      }}
                      className="px-4 py-2 rounded-xl bg-[#C07F00] text-white text-xs font-bold hover:bg-[#a66d00] transition shadow-sm inline-flex items-center gap-1.5"
                    >
                      <FileCheck className="w-4 h-4" />
                      Confirm Payment Received
                    </button>
                  )}

                {/* Delivery Flow Actions */}
                {order.status === "approved" && (
                  <button
                    type="button"
                    onClick={() => handleQuickStatusUpdate("preparing")}
                    className="px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 transition shadow-sm"
                  >
                    Start Kitchen Preparing
                  </button>
                )}

                {order.status === "preparing" && (
                  <button
                    type="button"
                    onClick={() => handleQuickStatusUpdate("ready_for_dispatch")}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition shadow-sm"
                  >
                    Mark Ready for Dispatch
                  </button>
                )}

                {(order.status === "approved" ||
                  order.status === "preparing" ||
                  order.status === "ready_for_dispatch") && (
                  <button
                    type="button"
                    onClick={() => {
                      setActionError(null);
                      setActiveActionModal("dispatch");
                    }}
                    className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 transition shadow-sm inline-flex items-center gap-1.5"
                  >
                    <Truck className="w-4 h-4" />
                    Dispatch with Driver
                  </button>
                )}

                {order.status === "out_for_delivery" && (
                  <button
                    type="button"
                    onClick={() => handleQuickStatusUpdate("delivered")}
                    className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition shadow-sm inline-flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Mark Order Delivered
                  </button>
                )}
              </div>
            </div>

            {/* Verification Status Banner */}
            {order.payment_status === "verified" && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold text-emerald-950">Payment Manually Verified</p>
                  <p className="text-emerald-800 mt-0.5">
                    Verified by{" "}
                    <strong>{order.payment_verified_by_name || "Store Owner"}</strong>
                    {order.payment_verified_at &&
                      ` on ${new Date(order.payment_verified_at).toLocaleString("en-IN")}`}
                    . Receipt was confirmed directly with the customer.
                  </p>
                </div>
              </div>
            )}

            {/* Grid: Order Items & Delivery Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Items & Driver Section */}
              <div className="lg:col-span-2 space-y-6">
                {/* Items Card */}
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
                  <h2 className="text-base font-bold text-[#183D2B] border-b border-stone-100 pb-3 flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#C07F00]" />
                    Ordered Items
                  </h2>

                  <div className="divide-y divide-stone-100">
                    {order.items.map((item) => (
                      <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-stone-900 text-sm">{item.product_name}</p>
                          <p className="text-stone-500">
                            Qty: {item.quantity} &times; ₹{item.unit_price}
                          </p>
                        </div>
                        <span className="font-bold text-stone-900 text-sm">₹{item.line_total}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-stone-200 pt-3 space-y-1.5 text-xs">
                    <div className="flex justify-between text-stone-600">
                      <span>Merchandise Subtotal</span>
                      <span>₹{order.subtotal}</span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>Delivery Fee</span>
                      <span>₹{order.delivery_fee}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-extrabold text-[#183D2B] border-t border-stone-100 pt-2">
                      <span>Total Amount</span>
                      <span className="text-lg">₹{order.total}</span>
                    </div>
                  </div>
                </div>

                {/* Driver Management Card */}
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <h2 className="text-base font-bold text-[#183D2B] flex items-center gap-2">
                      <Truck className="w-4 h-4 text-[#C07F00]" />
                      Assigned Driver Details
                    </h2>
                    <span className="text-xs text-stone-500">
                      Update anytime without changing status
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Driver Name
                      </label>
                      <input
                        type="text"
                        value={driverName}
                        onChange={(e) => setDriverName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Driver Mobile
                      </label>
                      <input
                        type="tel"
                        value={driverPhone}
                        onChange={(e) => setDriverPhone(e.target.value)}
                        placeholder="10-digit number"
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Est. Delivery Time
                      </label>
                      <input
                        type="text"
                        value={estimatedDeliveryTime}
                        onChange={(e) => setEstimatedDeliveryTime(e.target.value)}
                        placeholder="e.g. 30-40 mins"
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      disabled={savingDriver}
                      onClick={handleSaveDriverDetails}
                      className="px-4 py-2 rounded-xl bg-[#183D2B] text-white text-xs font-bold hover:bg-[#122e20] transition shadow-sm inline-flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {savingDriver ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          Save Driver Details
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Col: Customer & Delivery Address */}
              <div className="space-y-6">
                {/* Customer Details */}
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-3 text-xs">
                  <h3 className="font-bold text-[#183D2B] text-sm border-b border-stone-100 pb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-[#C07F00]" />
                    Customer Contact
                  </h3>
                  <div>
                    <p className="font-semibold text-stone-900">{order.recipient_name || order.customer_username}</p>
                    <p className="text-stone-600 font-mono mt-0.5">{order.phone_number}</p>
                    {order.customer_email && (
                      <p className="text-stone-500 mt-0.5">{order.customer_email}</p>
                    )}
                  </div>
                  {order.delivery_instructions && (
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 mt-2">
                      <span className="font-bold text-stone-700 block mb-0.5">Special Instructions:</span>
                      <p className="text-stone-600 italic">{order.delivery_instructions}</p>
                    </div>
                  )}
                </div>

                {/* Delivery Address */}
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-3 text-xs">
                  <h3 className="font-bold text-[#183D2B] text-sm border-b border-stone-100 pb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#C07F00]" />
                    Delivery Destination
                  </h3>
                  <div className="text-stone-700 space-y-1">
                    <p className="font-semibold text-stone-900">
                      {order.recipient_name}
                    </p>
                    <p className="font-mono">{order.phone_number}</p>
                    <p className="leading-relaxed">
                      {String((order.address_snapshot as Record<string, unknown>)?.formatted_address || (order.address_snapshot as Record<string, unknown>)?.address_line || "Delivery Address")}
                      {Boolean((order.address_snapshot as Record<string, unknown>)?.city) && `, ${String((order.address_snapshot as Record<string, unknown>).city)}`}
                      {Boolean((order.address_snapshot as Record<string, unknown>)?.postal_code) && ` (${String((order.address_snapshot as Record<string, unknown>).postal_code)})`}
                    </p>
                  </div>
                  {order.road_distance_km && (
                    <div className="pt-2 border-t border-stone-100 text-stone-500 flex justify-between">
                      <span>Delivery Distance:</span>
                      <span className="font-mono font-semibold text-stone-800">
                        {order.road_distance_km} km
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Modals */}
        {activeActionModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-stone-200">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="text-base font-bold text-[#183D2B] capitalize">
                  {activeActionModal === "verify"
                    ? "Confirm Manual Payment Verification"
                    : activeActionModal === "approve"
                    ? "Approve Order & Set Payment Instructions"
                    : activeActionModal === "reject"
                    ? "Reject Order"
                    : activeActionModal === "dispatch"
                    ? "Dispatch Order with Driver"
                    : "Reject Payment"}
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveActionModal(null)}
                  className="text-stone-400 hover:text-stone-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {actionError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs">
                  {actionError}
                </div>
              )}

              <form onSubmit={handleExecuteAction} className="space-y-4 text-xs">
                {activeActionModal === "verify" && (
                  <div className="space-y-3">
                    <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 leading-relaxed">
                      <p className="font-bold mb-1">Explicit Owner Confirmation</p>
                      <p>
                        Are you sure you want to mark this order payment as <strong>Verified</strong>?
                        You confirm that you have verified receipt of{" "}
                        <strong className="text-emerald-800">₹{order?.total}</strong> outside the
                        website (e.g. via UPI notification, bank transfer SMS, or WhatsApp confirmation).
                      </p>
                    </div>

                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-stone-600">
                      <span>Verified By: </span>
                      <strong className="text-stone-900">
                        {profile?.display_name || "Store Owner"} ({profile?.email})
                      </strong>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Internal Verification Note (Optional)
                      </label>
                      <input
                        type="text"
                        value={internalNote}
                        onChange={(e) => setInternalNote(e.target.value)}
                        placeholder="e.g. UTR #123456789 verified via Google Pay"
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg outline-none"
                      />
                    </div>
                  </div>
                )}

                {activeActionModal === "approve" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Payment Instructions for Customer
                      </label>
                      <textarea
                        rows={3}
                        value={paymentInstructions}
                        onChange={(e) => setPaymentInstructions(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg outline-none font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Driver Name (Optional)
                        </label>
                        <input
                          type="text"
                          value={driverName}
                          onChange={(e) => setDriverName(e.target.value)}
                          placeholder="e.g. Ramesh"
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Driver Phone (Optional)
                        </label>
                        <input
                          type="tel"
                          value={driverPhone}
                          onChange={(e) => setDriverPhone(e.target.value)}
                          placeholder="10-digit number"
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Internal Note (Optional)
                      </label>
                      <input
                        type="text"
                        value={internalNote}
                        onChange={(e) => setInternalNote(e.target.value)}
                        placeholder="Private note for store staff"
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg outline-none"
                      />
                    </div>
                  </div>
                )}

                {activeActionModal === "reject" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Reason for Rejection *
                      </label>
                      <textarea
                        rows={3}
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        required
                        placeholder="e.g. Items out of stock, kitchen closed, etc."
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg outline-none"
                      />
                    </div>
                  </div>
                )}

                {activeActionModal === "dispatch" && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Driver Name *
                        </label>
                        <input
                          type="text"
                          value={driverName}
                          onChange={(e) => setDriverName(e.target.value)}
                          required
                          placeholder="Driver full name"
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Driver Mobile *
                        </label>
                        <input
                          type="tel"
                          value={driverPhone}
                          onChange={(e) => setDriverPhone(e.target.value)}
                          required
                          placeholder="10-digit mobile"
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Estimated Delivery Time
                      </label>
                      <input
                        type="text"
                        value={estimatedDeliveryTime}
                        onChange={(e) => setEstimatedDeliveryTime(e.target.value)}
                        placeholder="e.g. 30-40 mins"
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg outline-none"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveActionModal(null)}
                    className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAction}
                    className="px-5 py-2 rounded-xl bg-[#183D2B] text-white text-xs font-bold hover:bg-[#122e20] transition shadow-sm inline-flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {submittingAction && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Confirm Action
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function OwnerOrderDetailPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex flex-col min-h-screen bg-[#F7F1E5] items-center justify-center py-20 text-stone-500">
          <Loader2 className="w-8 h-8 animate-spin text-[#C07F00] mb-3" />
          <p className="text-sm">Loading owner order details...</p>
        </div>
      }
    >
      <OwnerOrderDetailContent />
    </React.Suspense>
  );
}

