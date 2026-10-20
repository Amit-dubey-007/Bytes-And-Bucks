"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  CartData,
  getAuthToken,
  ApiError,
} from "@/lib/api";
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Loader2,
  AlertCircle,
  Package,
} from "lucide-react";

export default function CartPage() {
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadCart = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setCart(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getCart();
      setCart(data);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 401) {
        setCart(null);
      } else {
        const msg = err instanceof Error ? err.message : "Failed to load cart";
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const handleUpdateQuantity = async (itemId: number, newQty: number) => {
    if (newQty < 1) return;
    setUpdatingId(itemId);
    setError(null);
    try {
      const updatedCart = await updateCartItem(itemId, newQty);
      setCart(updatedCart);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update quantity";
      setError(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    setUpdatingId(itemId);
    setError(null);
    try {
      const updatedCart = await removeCartItem(itemId);
      setCart(updatedCart);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to remove item";
      setError(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm("Are you sure you want to clear your entire order list?")) return;
    setLoading(true);
    setError(null);
    try {
      await clearCart();
      setCart((prev) => (prev ? { ...prev, items: [], subtotal: "0.00", total_items: 0 } : null));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to clear cart";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F1E5] text-[#183D2B]">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-28 w-full">
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-5 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#183D2B] flex items-center gap-2">
              <ShoppingBag className="w-7 h-7 text-[#C07F00]" />
              My Order List
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Review your wholesome millet foods before checkout.
            </p>
          </div>

          {cart && cart.items.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-xs text-stone-500 hover:text-red-600 underline font-medium"
            >
              Clear Order List
            </button>
          )}
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
            <p className="text-sm">Loading your order list...</p>
          </div>
        ) : !cart ? (
          /* Guest prompt */
          <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-sm border border-stone-200 text-center">
            <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-stone-800 mb-2">Please Sign In</h2>
            <p className="text-xs text-stone-600 mb-6">
              Sign in with your Google account to access your persistent order list and saved delivery addresses.
            </p>
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#183D2B] text-white text-xs font-semibold hover:bg-[#23583e] transition shadow"
            >
              Sign In to Continue
            </Link>
          </div>
        ) : cart.items.length === 0 ? (
          /* Empty cart */
          <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center max-w-lg mx-auto shadow-sm">
            <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-stone-800">Your order list is empty</h2>
            <p className="text-xs text-stone-500 mt-1 mb-6">
              Explore our wholesome cafe menu and store goodies crafted with pure millets.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#183D2B] text-white text-xs font-semibold hover:bg-[#23583e] transition shadow"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          /* Cart items and checkout summary */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items Column */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200 flex items-center justify-center">
                      {item.product_image ? (
                        <Image
                          src={item.product_image}
                          alt={item.product_name}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        <Package className="w-8 h-8 text-stone-400" />
                      )}
                    </div>

                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-stone-900">
                        {item.product_name}
                      </h3>
                      <p className="text-xs text-stone-500 font-mono mt-0.5">
                        ₹{item.unit_price} &middot; {item.weight_grams}g
                      </p>
                      {!item.is_available && (
                        <span className="inline-block mt-1 text-[11px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                          Currently Unavailable
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity & Total */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="font-bold text-sm sm:text-base text-[#183D2B]">
                      ₹{item.line_total}
                    </span>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-stone-300 rounded-lg bg-stone-50 overflow-hidden">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={updatingId === item.id || item.quantity <= 1}
                          className="p-1 sm:p-1.5 text-stone-600 hover:bg-stone-200 disabled:opacity-40"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-semibold text-stone-800">
                          {updatingId === item.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            item.quantity
                          )}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={updatingId === item.id}
                          className="p-1 sm:p-1.5 text-stone-600 hover:bg-stone-200 disabled:opacity-40"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={updatingId === item.id}
                        className="p-1.5 text-stone-400 hover:text-red-600 transition"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Subtotal & Checkout Card */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm h-fit space-y-4">
              <h2 className="text-base font-bold text-[#183D2B] border-b border-stone-200 pb-3">
                Order Summary
              </h2>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Total Items</span>
                  <span>{cart.total_items} items</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Merchandise Subtotal</span>
                  <span className="font-semibold text-stone-800">₹{cart.subtotal}</span>
                </div>
                <div className="flex justify-between text-stone-500 pt-1 border-t border-dashed border-stone-200 text-[11px]">
                  <span>Delivery fee</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-200">
                <div className="flex justify-between items-center text-sm font-bold text-[#183D2B] mb-4">
                  <span>Subtotal</span>
                  <span className="text-lg">₹{cart.subtotal}</span>
                </div>

                <Link
                  href="/checkout"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#183D2B] text-white text-xs font-bold hover:bg-[#23583e] active:scale-98 transition shadow"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="text-center mt-3">
                  <Link
                    href="/products"
                    className="text-xs text-stone-500 hover:text-[#183D2B] underline"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
