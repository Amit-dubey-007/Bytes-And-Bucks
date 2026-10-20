"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  getOrderByPublicId,
  cancelOrder,
  uploadPaymentReceipt,
  confirmDelivery,
  submitOrderReview,
  OrderData,
  ReviewData,
  getAuthToken,
  ApiError,
} from "@/lib/api";
import {
  Package,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  AlertTriangle,
  MessageSquare,
  ArrowLeft,
  Loader2,
  Calendar,
  Upload,
  CreditCard,
  RefreshCw,
  Info,
  Truck,
  Phone,
  Star,
  Send,
  Navigation,
  ShieldCheck,
  Check,
} from "lucide-react";

function OrderDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Receipt Upload State
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stage 5: Delivery Confirmation & Review State
  const [confirmingDelivery, setConfirmingDelivery] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const loadOrder = useCallback(async () => {
    if (!orderId) return;

    const token = getAuthToken();
    if (!token) {
      router.push(`/profile?redirect=/orders/${orderId}/details`);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getOrderByPublicId(orderId);
      setOrder(data);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 404) {
        setError("Order not found or you do not have permission to view it.");
      } else {
        const msg = err instanceof Error ? err.message : "Failed to load order details";
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, [orderId, router]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    setCancelling(true);
    setError(null);
    try {
      const updated = await cancelOrder(orderId);
      setOrder(updated);
      setSuccessMessage("Order has been cancelled successfully.");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to cancel order";
      setError(msg);
    } finally {
      setCancelling(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      setUploadError(`File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds 5 MB limit.`);
      return;
    }

    // Validate type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setUploadError("Only JPG, JPEG, PNG, or WEBP images are supported.");
      return;
    }

    setReceiptFile(file);
    const objectUrl = URL.createObjectURL(file);
    setReceiptPreview(objectUrl);
  };

  const handleUploadReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptFile || !order) return;

    setUploadingReceipt(true);
    setUploadError(null);
    try {
      const updated = await uploadPaymentReceipt(order.public_id, receiptFile);
      setOrder(updated);
      setReceiptFile(null);
      setReceiptPreview(null);
      setSuccessMessage("Payment receipt submitted successfully! Store owner will verify it shortly.");
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload receipt";
      setUploadError(msg);
    } finally {
      setUploadingReceipt(false);
    }
  };

  const handleConfirmDelivery = async () => {
    if (!order) return;
    setConfirmingDelivery(true);
    setError(null);
    try {
      const updated = await confirmDelivery(order.public_id);
      setOrder(updated);
      setSuccessMessage("Thank you! You have confirmed delivery of your order.");
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to confirm delivery";
      setError(msg);
    } finally {
      setConfirmingDelivery(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setSubmittingReview(true);
    setReviewError(null);
    try {
      const rev = await submitOrderReview(order.public_id, {
        rating: reviewRating,
        comment: reviewComment,
      });
      setOrder({ ...order, review: rev });
      setSuccessMessage("Thank you! Your review has been submitted successfully.");
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit review";
      setReviewError(msg);
    } finally {
      setSubmittingReview(false);
    }
  };

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
    preparing: "bg-orange-100 text-orange-900 border-orange-300",
    ready_for_dispatch: "bg-indigo-100 text-indigo-800 border-indigo-200",
    out_for_delivery: "bg-sky-100 text-sky-800 border-sky-300",
    delivered: "bg-emerald-100 text-emerald-800 border-emerald-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
    cancelled: "bg-stone-100 text-stone-600 border-stone-200",
  };

  const statusLabels: Record<string, string> = {
    pending: "Pending Store Review",
    approved: "Order Approved",
    preparing: "Kitchen Preparing",
    ready_for_dispatch: "Ready for Dispatch",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    rejected: "Order Rejected",
    cancelled: "Order Cancelled",
  };

  const statusDescriptions: Record<string, string> = {
    pending: "Our cafe team is reviewing your order items and stock. We will approve your order shortly.",
    approved: "Order approved by MilletMarg! Please complete manual payment using the details below.",
    preparing: "Your wholesome millet dishes are freshly being prepared in our cafe kitchen.",
    ready_for_dispatch: "Your food is neatly packed and waiting for delivery driver pickup.",
    out_for_delivery: "Your driver is on the way to your delivery address! You can call or WhatsApp them directly.",
    delivered: "Your fresh millet items have been safely delivered. Thank you!",
    rejected: "This order could not be accepted by the store.",
    cancelled: "You cancelled this order.",
  };

  const paymentStatusBadges: Record<string, { label: string; color: string; desc: string }> = {
    unpaid: {
      label: "Payment Pending",
      color: "bg-amber-50 text-amber-800 border-amber-200",
      desc: "Awaiting your payment and receipt upload.",
    },
    submitted: {
      label: "Proof Submitted",
      color: "bg-blue-50 text-blue-800 border-blue-200",
      desc: "Receipt uploaded. Store verification in progress.",
    },
    verified: {
      label: "Payment Verified",
      color: "bg-emerald-50 text-emerald-800 border-emerald-200",
      desc: "Payment verified! Kitchen is preparing your order.",
    },
    rejected: {
      label: "Proof Rejected",
      color: "bg-red-50 text-red-800 border-red-200",
      desc: "Payment proof could not be verified. Please re-upload.",
    },
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F1E5] text-[#183D2B]">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-28 w-full">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-[#183D2B] transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Orders
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
          <div className="py-20 flex flex-col items-center justify-center text-stone-500">
            <Loader2 className="w-8 h-8 animate-spin text-[#C07F00] mb-3" />
            <p className="text-sm">Retrieving order details...</p>
          </div>
        ) : !order ? (
          <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center">
            <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-stone-700">No order found with this identifier.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Order Status Banner */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase tracking-wider text-stone-500 font-semibold">
                    Order Reference
                  </span>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-[#183D2B] mt-0.5">
                    {order.reference}
                  </h1>
                  <p className="text-xs text-stone-500 flex items-center gap-1.5 mt-1 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    Placed on {new Date(order.created_at).toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    {/* Order Status Badge */}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        statusColors[order.status] || "bg-stone-100 text-stone-800 border-stone-200"
                      }`}
                    >
                      {statusLabels[order.status] || order.status}
                    </span>

                    {/* Payment Status Badge */}
                    {order.payment_status && paymentStatusBadges[order.payment_status] && (
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          paymentStatusBadges[order.payment_status].color
                        }`}
                      >
                        {paymentStatusBadges[order.payment_status].label}
                      </span>
                    )}
                  </div>

                  {/* WhatsApp Support Chat */}
                  {order.whatsapp_url && (
                    <a
                      href={order.whatsapp_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] text-white text-xs font-semibold hover:bg-[#20ba59] transition shadow-sm"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Chat with Store on WhatsApp
                    </a>
                  )}
                </div>
              </div>

              {/* Status Explanation Helper */}
              <div className="p-3 bg-stone-50 rounded-xl text-xs text-stone-600 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-[#C07F00] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-stone-800">Status update: </span>
                  {statusDescriptions[order.status] || ""}
                  {order.payment_status && paymentStatusBadges[order.payment_status] && (
                    <span className="block mt-0.5 text-stone-500">
                      Payment note: {paymentStatusBadges[order.payment_status].desc}
                    </span>
                  )}
                </div>
              </div>

              {/* Stage 5: Live Order Progress Stepper */}
              {order.status !== "rejected" && order.status !== "cancelled" && (
                <div className="pt-2 pb-1">
                  <div className="flex items-center justify-between relative px-2">
                    <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-stone-200 z-0" />
                    <div
                      className="absolute left-4 top-1/2 -translate-y-1/2 h-1 bg-emerald-600 transition-all duration-500 z-0"
                      style={{
                        width: `calc(${(Math.max(0, ["pending", "approved", "preparing", "ready_for_dispatch", "out_for_delivery", "delivered"].indexOf(order.status)) / 5) * 100}% - 2rem)`,
                      }}
                    />

                    {[
                      { key: "pending", label: "Placed" },
                      { key: "approved", label: "Approved" },
                      { key: "preparing", label: "Kitchen" },
                      { key: "ready_for_dispatch", label: "Ready" },
                      { key: "out_for_delivery", label: "On Way" },
                      { key: "delivered", label: "Delivered" },
                    ].map((step, idx) => {
                      const currentIdx = ["pending", "approved", "preparing", "ready_for_dispatch", "out_for_delivery", "delivered"].indexOf(order.status);
                      const isComplete = currentIdx >= idx;
                      const isCurrent = currentIdx === idx;
                      return (
                        <div key={step.key} className="flex flex-col items-center relative z-10">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all ${
                              isComplete
                                ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                                : "bg-white border-stone-300 text-stone-400"
                            } ${isCurrent ? "ring-4 ring-emerald-100" : ""}`}
                          >
                            {isComplete ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                          </div>
                          <span
                            className={`text-[10px] mt-1.5 font-semibold hidden sm:block ${
                              isComplete ? "text-emerald-900" : "text-stone-400"
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Order Rejection Alert */}
              {order.status === "rejected" && order.rejection_reason && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
                  <div className="flex items-center gap-2 font-bold text-red-900 mb-1">
                    <XCircle className="w-4 h-4 text-red-600" />
                    Store Rejection Reason
                  </div>
                  <p className="pl-6 text-red-700">{order.rejection_reason}</p>
                </div>
              )}
            </div>

            {/* Stage 4: Manual Payment Section for Approved Orders */}
            {order.status === "approved" && (
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-5">
                <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                  <CreditCard className="w-5 h-5 text-[#C07F00]" />
                  <h2 className="text-base font-bold text-[#183D2B]">
                    Manual Payment & Verification
                  </h2>
                </div>

                {/* Important Reminder Alert */}
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Security verification: </span>
                    Always verify the recipient name and account number before initiating transfer. Never pay into any account other than the official MilletMarg details shown below.
                  </div>
                </div>

                {/* Payment Instructions Box */}
                {order.payment_instructions && (
                  <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                    <span className="text-xs uppercase font-bold text-stone-500 tracking-wider">
                      Store Payment Instructions
                    </span>
                    <pre className="text-xs font-mono whitespace-pre-wrap text-stone-800 leading-relaxed bg-white p-3 rounded-lg border border-stone-200">
                      {order.payment_instructions}
                    </pre>
                  </div>
                )}

                {/* Verification Status Banner */}
                {order.payment_status === "verified" && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-xs text-emerald-800">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-bold text-emerald-950">Payment Verified by Store</p>
                      <p className="mt-0.5">
                        Your manual payment has been verified
                        {order.payment_verified_at && ` on ${new Date(order.payment_verified_at).toLocaleString("en-IN")}`}.
                        Your fresh millet order is now being fulfilled!
                      </p>
                    </div>
                  </div>
                )}

                {/* Submitted - Awaiting Verification */}
                {order.payment_status === "submitted" && (
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-3 text-xs text-blue-800">
                    <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-blue-950">Payment Proof Submitted & Under Review</p>
                      <p className="mt-0.5 text-blue-700">
                        We received your payment proof
                        {order.payment_submitted_at && ` on ${new Date(order.payment_submitted_at).toLocaleString("en-IN")}`}.
                        The store owner is reviewing the transaction details. This page will reflect verification once approved.
                      </p>
                    </div>
                  </div>
                )}

                {/* Payment Rejected Notice */}
                {order.payment_status === "rejected" && order.payment_rejection_reason && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
                    <div className="flex items-center gap-2 font-bold text-red-900 mb-1">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      Payment Proof Rejected by Owner
                    </div>
                    <p className="pl-6 text-red-700 mb-2">{order.payment_rejection_reason}</p>
                    <p className="pl-6 text-stone-600 italic">
                      Please upload a clear screenshot showing transaction reference (UTR) and recipient name below.
                    </p>
                  </div>
                )}

                {/* Customer Receipt Upload Form (Available for unpaid or rejected proofs) */}
                {(order.payment_status === "unpaid" || order.payment_status === "rejected") && (
                  <form onSubmit={handleUploadReceipt} className="space-y-4 pt-2 border-t border-stone-100">
                    <div>
                      <label className="block text-xs font-bold text-stone-800 mb-1">
                        {order.payment_status === "rejected" ? "Re-upload Clear Payment Receipt" : "Upload Payment Screenshot or Receipt"}
                      </label>
                      <p className="text-xs text-stone-500 mb-2">
                        Accepted formats: JPG, PNG, WEBP (Maximum size: 5 MB).
                      </p>

                      <div className="flex items-center gap-3">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleFileChange}
                          disabled={uploadingReceipt}
                          className="text-xs text-stone-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-stone-100 file:text-[#183D2B] hover:file:bg-stone-200 cursor-pointer"
                        />

                        {receiptFile && (
                          <button
                            type="button"
                            onClick={() => {
                              setReceiptFile(null);
                              setReceiptPreview(null);
                              if (fileInputRef.current) fileInputRef.current.value = "";
                            }}
                            className="text-xs text-stone-400 hover:text-stone-700 underline"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>

                    {uploadError && (
                      <p className="text-xs font-semibold text-red-600 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {uploadError}
                      </p>
                    )}

                    {/* Receipt Preview */}
                    {receiptPreview && (
                      <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 inline-block">
                        <span className="block text-[11px] font-bold text-stone-500 mb-1.5">
                          Receipt Preview:
                        </span>
                        <div className="relative w-48 h-48 rounded-lg overflow-hidden border border-stone-300">
                          <Image
                            src={receiptPreview}
                            alt="Receipt Preview"
                            fill
                            className="object-contain"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <button
                        type="submit"
                        disabled={!receiptFile || uploadingReceipt}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#183D2B] text-white text-xs font-bold hover:bg-[#122e20] transition shadow disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {uploadingReceipt ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Uploading & Verifying...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            Submit Payment Proof
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Stage 5: Assigned Driver Contact Card */}
            {Boolean(order.driver_name || order.driver_phone) && (
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-stone-900">Assigned Delivery Driver</h3>
                      <p className="text-[11px] text-stone-500">MilletMarg Direct Fleet Dispatch</p>
                    </div>
                  </div>

                  {order.estimated_delivery_time && (
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-stone-400 block">Est. Delivery</span>
                      <span className="text-xs font-semibold text-stone-800">{order.estimated_delivery_time}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-base font-extrabold text-[#183D2B]">
                      {order.driver_name || "Delivery Partner"}
                    </p>
                    {order.driver_phone && (
                      <p className="text-xs text-stone-600 font-mono flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-stone-400" />
                        +91 {order.driver_phone}
                      </p>
                    )}
                    {order.dispatched_at && (
                      <p className="text-[11px] text-stone-400 font-mono">
                        Dispatched at {new Date(order.dispatched_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    )}
                  </div>

                  {/* Driver Contact Actions */}
                  <div className="flex items-center gap-2">
                    {order.driver_phone && (
                      <a
                        href={order.driver_call_url || `tel:${order.driver_phone}`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition shadow-sm"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        Call Driver
                      </a>
                    )}

                    {order.driver_phone && (
                      <a
                        href={order.driver_whatsapp_url || `https://wa.me/91${order.driver_phone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#25D366] text-white text-xs font-bold hover:bg-[#20ba59] transition shadow-sm"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        WhatsApp Driver
                      </a>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-sky-50 rounded-xl text-[11px] text-sky-800 flex items-start gap-2">
                  <Navigation className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                  <span>
                    Direct phone dispatch active. For real-time delivery queries or gate directions, please call or WhatsApp your driver directly.
                  </span>
                </div>
              </div>
            )}

            {/* Stage 5: Customer Delivery Confirmation Action */}
            {(order.status === "out_for_delivery" || (order.status === "delivered" && !order.is_customer_confirmed)) && (
              <div className="bg-gradient-to-r from-emerald-500/10 via-amber-500/10 to-emerald-500/10 p-6 rounded-2xl border border-emerald-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-700" />
                    Customer Delivery Confirmation
                  </h3>
                  <p className="text-xs text-stone-600 mt-1 max-w-xl">
                    Have you received your millet food package fresh and in good condition? Confirming helps us complete your order and release driver delivery logs.
                  </p>
                </div>

                <button
                  onClick={handleConfirmDelivery}
                  disabled={confirmingDelivery}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition shadow disabled:opacity-50 shrink-0"
                >
                  {confirmingDelivery ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      I Received My Order
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Stage 5: Delivery Confirmed Receipt Notice */}
            {order.is_customer_confirmed && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-xs text-emerald-900 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold text-emerald-950">Delivery Confirmed by Customer</p>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    Thank you for confirming receipt of your order
                    {order.customer_confirmed_at && ` on ${new Date(order.customer_confirmed_at).toLocaleString("en-IN")}`}.
                  </p>
                </div>
              </div>
            )}

            {/* Stage 5: Rating & Review Card */}
            {order.status === "delivered" && (
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                  <h2 className="text-base font-bold text-[#183D2B]">
                    Rate Your Millet Experience
                  </h2>
                </div>

                {order.review ? (
                  <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-500">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= order.review!.rating
                                ? "fill-amber-400 text-amber-500"
                                : "text-stone-300"
                            }`}
                          />
                        ))}
                        <span className="text-xs font-bold text-stone-700 ml-1.5">
                          {order.review.rating} / 5 Stars
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-stone-400">
                        {new Date(order.review.created_at).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                    {order.review.comment ? (
                      <p className="text-xs text-stone-700 italic">"{order.review.comment}"</p>
                    ) : (
                      <p className="text-xs text-stone-500 italic">No additional comment provided.</p>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">
                        Your Rating (1 to 5 Stars)
                      </label>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setReviewRating(star)}
                            className="p-1 hover:scale-110 transition focus:outline-none"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                star <= reviewRating
                                  ? "fill-amber-400 text-amber-500"
                                  : "text-stone-300 hover:text-amber-300"
                              }`}
                            />
                          </button>
                        ))}
                        <span className="text-xs font-semibold text-stone-600 ml-2">
                          {reviewRating} out of 5 stars
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Review / Feedback (Optional)
                      </label>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        rows={3}
                        placeholder="Tell us what you loved about the freshness, taste, and delivery speed..."
                        className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20"
                      />
                    </div>

                    {reviewError && (
                      <p className="text-xs font-semibold text-red-600 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {reviewError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#183D2B] text-white text-xs font-bold hover:bg-[#122e20] transition shadow disabled:opacity-50"
                    >
                      {submittingReview ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Submit Review
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Stage 5: Delivery Status Activity Logs */}
            {order.delivery_logs && order.delivery_logs.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Delivery Activity Timeline
                </h3>
                <div className="space-y-2 border-l-2 border-stone-200 pl-4 ml-1">
                  {order.delivery_logs.map((log) => (
                    <div key={log.id} className="relative pb-2 last:pb-0">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-600 ring-4 ring-white" />
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-xs font-bold text-stone-900 capitalize">
                          {statusLabels[log.status] || log.status}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {new Date(log.created_at).toLocaleString("en-IN", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>
                      {log.note && <p className="text-xs text-stone-600 mt-0.5">{log.note}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Items Snapshot Table */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-[#183D2B] border-b border-stone-100 pb-3">
                Items Ordered
              </h2>

              <div className="space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 text-xs py-2 border-b border-stone-100 last:border-0"
                  >
                    <div>
                      <h4 className="font-bold text-stone-900 text-sm">{item.product_name}</h4>
                      <p className="text-stone-500 font-mono mt-0.5">
                        ₹{item.unit_price} &times; {item.quantity} &middot; {item.weight_grams}g
                      </p>
                    </div>

                    <span className="font-bold text-stone-900 text-sm">
                      ₹{item.line_total}
                    </span>
                  </div>
                ))}
              </div>

              {/* Order Totals Breakdown */}
              <div className="pt-4 border-t border-stone-200 space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Merchandise Subtotal</span>
                  <span className="font-semibold text-stone-800">₹{order.subtotal}</span>
                </div>

                <div className="flex justify-between text-stone-600">
                  <span>
                    Delivery Charge ({order.road_distance_km} km &middot; {order.billable_distance_km} billable km)
                  </span>
                  {order.is_free_delivery ? (
                    <span className="font-bold text-emerald-600">FREE (₹0.00)</span>
                  ) : (
                    <span>₹{order.delivery_fee_charged}</span>
                  )}
                </div>

                <div className="flex justify-between items-center text-sm font-extrabold text-[#183D2B] pt-2 border-t border-stone-200">
                  <span>Grand Total</span>
                  <span className="text-xl">₹{order.total}</span>
                </div>
              </div>
            </div>

            {/* Delivery Address Snapshot */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-3 text-xs">
              <h2 className="text-base font-bold text-[#183D2B] flex items-center gap-2 border-b border-stone-100 pb-2">
                <MapPin className="w-4 h-4 text-[#C07F00]" />
                Delivery Address Details
              </h2>

              <div className="text-stone-700 space-y-1">
                <p className="font-bold text-stone-900 text-sm">
                  {order.recipient_name} &middot; {order.phone_number}
                </p>
                <p className="leading-relaxed">
                  {order.address_snapshot && (
                    <>
                      {Boolean(order.address_snapshot.house_number) && `${order.address_snapshot.house_number}, `}
                      {Boolean(order.address_snapshot.room_number) && `Unit ${order.address_snapshot.room_number}, `}
                      {order.address_snapshot.address_line as string}
                      {Boolean(order.address_snapshot.landmark) && ` (Near ${order.address_snapshot.landmark})`}
                      <br />
                      {order.address_snapshot.city as string}, {order.address_snapshot.state as string} — {order.address_snapshot.postal_code as string}
                    </>
                  )}
                </p>

                {order.delivery_instructions && (
                  <p className="italic text-stone-500 pt-1">
                    <span className="font-semibold text-stone-700 not-italic">Instructions: </span>
                    {order.delivery_instructions}
                  </p>
                )}
              </div>
            </div>

            {/* Cancel Action for Pending Orders */}
            {order.status === "pending" && (
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-stone-900">Need to cancel?</h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    You can cancel your order while it is still awaiting store approval.
                  </p>
                </div>

                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition disabled:opacity-50"
                >
                  {cancelling ? "Cancelling..." : "Cancel Order"}
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function OrderDetailsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex flex-col min-h-screen bg-[#F7F1E5] items-center justify-center py-20 text-stone-500">
          <Loader2 className="w-8 h-8 animate-spin text-[#C07F00] mb-3" />
          <p className="text-sm">Loading order details...</p>
        </div>
      }
    >
      <OrderDetailsContent />
    </React.Suspense>
  );
}


