"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  getProductBySlug,
  addToCart,
  ProductData,
  getAuthToken,
  ApiError,
} from "@/lib/api";
import { getShopStatus } from "@/lib/shopHours";
import {
  Package,
  ShoppingBag,
  Zap,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Leaf,
  Plus,
  Minus,
  Truck,
  Heart,
} from "lucide-react";

function ProductDetailContent() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartSuccessMessage, setCartSuccessMessage] = useState<string | null>(null);
  const [shopClosedMsg, setShopClosedMsg] = useState<string | null>(null);

  const loadProduct = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getProductBySlug(slug);
      setProduct(data);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 404) {
        setError("This product could not be found or has been discontinued.");
      } else {
        const msg = err instanceof Error ? err.message : "Failed to load product details";
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const handleAddToCart = async () => {
    if (!product) return;

    // Check shop hours at click time
    const shopStatus = getShopStatus();
    if (!shopStatus.isOpen) {
      setShopClosedMsg(shopStatus.reason);
      return;
    }
    setShopClosedMsg(null);

    const token = getAuthToken();
    if (!token) {
      router.push(`/profile?redirect=/products/${product.slug}`);
      return;
    }

    setAddingToCart(true);
    setCartSuccessMessage(null);
    setError(null);

    try {
      await addToCart(product.id, quantity);
      setCartSuccessMessage(`Added ${quantity} &times; "${product.name}" to your cart!`);
      setTimeout(() => setCartSuccessMessage(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add to cart";
      setError(msg);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleOrderNow = () => {
    if (!product) return;

    // Check shop hours at click time
    const shopStatus = getShopStatus();
    if (!shopStatus.isOpen) {
      setShopClosedMsg(shopStatus.reason);
      return;
    }
    setShopClosedMsg(null);

    const token = getAuthToken();
    if (!token) {
      router.push(`/profile?redirect=/checkout?buy_now=${product.slug}&quantity=${quantity}`);
      return;
    }
    router.push(`/checkout?buy_now=${product.slug}&quantity=${quantity}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F1E5] text-[#183D2B]">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-28 w-full">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-[#183D2B] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Products</span>
          </Link>
        </div>

        {/* Status Messages */}
        {cartSuccessMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between shadow-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span dangerouslySetInnerHTML={{ __html: cartSuccessMessage }} />
            </div>
            <Link
              href="/cart"
              className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition"
            >
              View Cart &rarr;
            </Link>
          </div>
        )}

        {shopClosedMsg && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center gap-2 shadow-sm">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{shopClosedMsg}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-center gap-2 shadow-sm">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-28 flex flex-col items-center justify-center text-stone-500">
            <Loader2 className="w-8 h-8 animate-spin text-[#C07F00] mb-3" />
            <p className="text-sm font-medium">Loading delicious product details...</p>
          </div>
        ) : !product ? (
          <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center max-w-md mx-auto shadow-sm">
            <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-stone-800">Product not found</h3>
            <p className="text-xs text-stone-500 mt-1 mb-4">
              We couldn't locate this millet dish in our menu catalog.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#183D2B] text-white text-xs font-bold hover:bg-[#23583e]"
            >
              Return to Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Product Image Card */}
            <div className="lg:col-span-5 bg-white p-4 sm:p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
              <div className="relative w-full aspect-square bg-stone-100 rounded-xl overflow-hidden flex items-center justify-center">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    priority
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <Package className="w-16 h-16 text-stone-300" />
                )}

                {product.is_vegetarian && (
                  <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-md text-xs font-bold text-emerald-800 border border-emerald-200 shadow-sm flex items-center gap-1">
                    <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                    Vegetarian
                  </span>
                )}

                <span className="absolute top-3 right-3 bg-stone-900/80 text-white backdrop-blur-sm px-2.5 py-1 rounded-md text-xs font-medium">
                  {product.weight_grams} grams
                </span>
              </div>

              {/* Quality & Farm Highlights */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-stone-800 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>MilletMarg Farm Purity Promise</span>
                </div>
                <p className="text-stone-600 leading-relaxed">
                  Stone-ground grains harvested directly from sustainable regional farms in Madhya Pradesh. 100% natural, preservative-free recipes prepared freshly.
                </p>
              </div>
            </div>

            {/* Right: Product Information & Purchase Controls */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm space-y-5">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#C07F00]">
                    {product.category || "Healthy Bowls"}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#183D2B] mt-1 leading-tight">
                    {product.name}
                  </h1>
                </div>

                {/* Price & Stock Badge */}
                <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-[#183D2B]">
                      ₹{product.price}
                    </span>
                    <span className="text-xs text-stone-500 font-medium">
                      inclusive of all cafe taxes
                    </span>
                  </div>

                  <div>
                    {product.is_available ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Available
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                        Unavailable
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Description
                  </h2>
                  <p className="text-sm text-stone-700 leading-relaxed">
                    {product.description ||
                      "A nutrient-dense culinary preparation combining regional millets with fresh vegetables, authentic spices, and healthy dressings."}
                  </p>
                </div>

                {/* Ingredients & Allergens */}
                {product.ingredients && (
                  <div className="space-y-2 pt-2 border-t border-stone-100">
                    <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                      Ingredients
                    </h2>
                    <p className="text-xs text-stone-700 font-mono leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-200">
                      {product.ingredients}
                    </p>
                  </div>
                )}

                {product.allergen_information && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold">Allergen Notice: </strong>
                      {product.allergen_information}
                    </div>
                  </div>
                )}

                {/* Purchase Controls */}
                {product.is_available && (
                  <div className="pt-4 border-t border-stone-200 space-y-4">
                    {/* Quantity Picker */}
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-stone-700 uppercase">Quantity:</span>
                      <div className="flex items-center border border-stone-300 rounded-xl bg-stone-50 overflow-hidden shadow-sm">
                        <button
                          type="button"
                          onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                          className="px-3 py-2 text-stone-700 hover:bg-stone-200 transition active:scale-95"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-4 py-2 text-xs font-extrabold text-[#183D2B] min-w-10 text-center">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity((prev) => prev + 1)}
                          className="px-3 py-2 text-stone-700 hover:bg-stone-200 transition active:scale-95"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-xs text-stone-500">
                        Total: <strong className="text-stone-900">₹{(Number(product.price) * quantity).toFixed(2)}</strong>
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={addingToCart}
                        className="inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl border-2 border-[#183D2B] text-[#183D2B] text-xs font-bold hover:bg-emerald-50 active:scale-98 transition shadow-sm disabled:opacity-50"
                      >
                        {addingToCart ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <ShoppingBag className="w-4 h-4" />
                        )}
                        <span>Add to Cart</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleOrderNow}
                        className="inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[#183D2B] text-white text-xs font-bold hover:bg-[#23583e] active:scale-98 transition shadow-md"
                      >
                        <Zap className="w-4 h-4 text-[#C07F00]" />
                        <span>Order Now</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Delivery Note */}
                <div className="flex items-center gap-2 text-xs text-stone-500 pt-2 border-t border-stone-100">
                  <Truck className="w-4 h-4 text-[#C07F00]" />
                  <span>Direct cafe delivery within 20 km radius in Indore. Calculated at checkout.</span>
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

export default function ProductDetailPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex flex-col min-h-screen bg-[#F7F1E5] items-center justify-center py-20 text-stone-500">
          <Loader2 className="w-8 h-8 animate-spin text-[#C07F00] mb-3" />
          <p className="text-sm">Loading product details...</p>
        </div>
      }
    >
      <ProductDetailContent />
    </React.Suspense>
  );
}
