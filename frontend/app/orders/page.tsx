"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getOrders, OrderData, getAuthToken, ApiError } from "@/lib/api";
import {
  Package,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ChevronRight,
  Loader2,
  ShoppingBag,
  CreditCard,
  RefreshCw,
} from "lucide-react";

export default function OrderHistoryPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      router.push("/profile?redirect=/orders");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await getOrders();
      setOrders(response.results || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load order history";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
    cancelled: "bg-stone-100 text-stone-600 border-stone-200",
    delivered: "bg-blue-100 text-blue-800 border-blue-200",
  };

  const statusLabels: Record<string, string> = {
    pending: "Pending Review",
    approved: "Order Approved",
    rejected: "Rejected",
    cancelled: "Cancelled",
    delivered: "Delivered",
  };

  const paymentBadges: Record<string, { label: string; color: string }> = {
    unpaid: { label: "Payment Required", color: "bg-amber-50 text-amber-800 border-amber-200" },
    submitted: { label: "Proof Submitted", color: "bg-blue-50 text-blue-800 border-blue-200" },
    verified: { label: "Paid & Verified", color: "bg-emerald-50 text-emerald-800 border-emerald-200" },
    rejected: { label: "Proof Rejected", color: "bg-red-50 text-red-800 border-red-200" },
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F1E5] text-[#183D2B]">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-28 w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-200">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#C07F00]">
              Account Orders
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#183D2B] mt-1">
              Your Order History
            </h1>
          </div>

          <button
            onClick={loadOrders}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-xs font-semibold text-stone-600 hover:text-[#183D2B] hover:bg-stone-50 transition shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-stone-500">
            <Loader2 className="w-8 h-8 animate-spin text-[#C07F00] mb-3" />
            <p className="text-sm">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center space-y-4 shadow-sm">
            <ShoppingBag className="w-14 h-14 text-stone-300 mx-auto" />
            <div>
              <h3 className="text-base font-bold text-stone-800">No Orders Yet</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                Explore our selection of wholesome, gluten-free millet delicacies and place your first order today.
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#183D2B] text-white text-xs font-bold hover:bg-[#122e20] transition shadow"
            >
              Browse Millet Store
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.public_id}
                href={`/orders/${order.public_id}/details`}
                className="block bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md hover:border-[#C07F00] transition group"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-[#183D2B] text-base group-hover:text-[#C07F00] transition">
                      {order.reference}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        statusColors[order.status] || "bg-stone-100 text-stone-800"
                      }`}
                    >
                      {statusLabels[order.status] || order.status}
                    </span>
                    {order.payment_status && paymentBadges[order.payment_status] && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                          paymentBadges[order.payment_status].color
                        }`}
                      >
                        {paymentBadges[order.payment_status].label}
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-stone-500 flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(order.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="pt-3 flex flex-wrap items-center justify-between gap-4">
                  <div className="text-xs text-stone-600">
                    <p className="font-semibold text-stone-800">
                      {order.items.length} item{order.items.length > 1 ? "s" : ""} &middot;{" "}
                      {order.items.map((i) => i.product_name).slice(0, 2).join(", ")}
                      {order.items.length > 2 && "..."}
                    </p>
                    <p className="text-stone-500 mt-0.5">
                      Deliver to: {order.recipient_name} ({order.phone_number})
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[11px] text-stone-400 uppercase tracking-wider block">Total</span>
                      <span className="text-base font-extrabold text-[#183D2B]">₹{order.total}</span>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-stone-100 group-hover:bg-[#183D2B] group-hover:text-white flex items-center justify-center transition">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
