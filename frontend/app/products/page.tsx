"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  getProducts,
  addToCart,
  ProductData,
  getAuthToken,
} from "@/lib/api";
import { getShopStatus } from "@/lib/shopHours";
import {
  Package,
  ShoppingBag,
  Zap,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";

function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("search") || "";

  const [products, setProducts] = useState<ProductData[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState(urlQuery);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shopClosedMsg, setShopClosedMsg] = useState<string | null>(null);

  useEffect(() => {
    if (urlQuery) {
      setSearchQuery(urlQuery);
    }
  }, [urlQuery]);

  useEffect(() => {
    let isCurrent = true;

    async function fetchCatalog() {
      try {
        const res = await getProducts({
          search: searchQuery || undefined,
          category: selectedCategory || undefined,
        });
        if (isCurrent) {
          setProducts(res.results || []);
          const distinctCats = Array.from(
            new Set((res.results || []).map((p) => p.category).filter(Boolean))
          );
          if (distinctCats.length > 0) {
            setCategories((prev) => (prev.length === 0 ? distinctCats : prev));
          }
        }
      } catch (err: unknown) {
        if (isCurrent) {
          const msg = err instanceof Error ? err.message : "Failed to load products";
          setError(msg);
        }
      } finally {
        if (isCurrent) {
          setLoading(false);
        }
      }
    }

    fetchCatalog();

    return () => {
      isCurrent = false;
    };
  }, [searchQuery, selectedCategory]);

  const handleAddToCart = async (product: ProductData) => {
    // Check shop hours on click
    const shopStatus = getShopStatus();
    if (!shopStatus.isOpen) {
      setShopClosedMsg(shopStatus.reason);
      return;
    }
    setShopClosedMsg(null);

    const token = getAuthToken();
    if (!token) {
      router.push(`/profile?redirect=/products`);
      return;
    }

    setActionLoadingId(product.id);
    setMessage(null);
    setError(null);

    try {
      await addToCart(product.id, 1);
      setMessage(`Added "${product.name}" to your cart!`);
      setTimeout(() => setMessage(null), 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add to cart";
      setError(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleBuyNow = (product: ProductData) => {
    // Check shop hours on click
    const shopStatus = getShopStatus();
    if (!shopStatus.isOpen) {
      setShopClosedMsg(shopStatus.reason);
      return;
    }
    setShopClosedMsg(null);

    const token = getAuthToken();
    if (!token) {
      router.push(`/profile?redirect=/checkout?buy_now=${product.slug}`);
      return;
    }
    router.push(`/checkout?buy_now=${product.slug}&quantity=1`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F1E5] text-[#183D2B]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-28 w-full">
        {/* Page Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-6 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#183D2B] tracking-tight">
              Millet Store & Cafe Menu
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Wholesome grains, artisanal snacks, and fresh bowls from Indore.
            </p>
          </div>

          <Link
            href="/cart"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-stone-300 text-stone-800 text-xs font-semibold hover:border-[#183D2B] transition shadow-sm"
          >
            <ShoppingBag className="w-4 h-4 text-[#C07F00]" />
            <span>View My Cart</span>
          </Link>
        </div>

        {/* Notifications */}
        {message && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{message}</span>
            <Link href="/cart" className="ml-auto underline font-bold">
              Go to Cart &rarr;
            </Link>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-center gap-2 shadow-sm">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {shopClosedMsg && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center gap-2 shadow-sm">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{shopClosedMsg}</span>
          </div>
        )}

        {/* Search & Category Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search millet products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-xl bg-white focus:ring-2 focus:ring-[#183D2B] outline-none shadow-sm"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            <button
              onClick={() => setSelectedCategory("")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition shrink-0 ${
                selectedCategory === ""
                  ? "bg-[#183D2B] text-white shadow-sm"
                  : "bg-white text-stone-700 border border-stone-200 hover:border-stone-300"
              }`}
            >
              All Items
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition shrink-0 ${
                  selectedCategory === cat
                    ? "bg-[#183D2B] text-white shadow-sm"
                    : "bg-white text-stone-700 border border-stone-200 hover:border-stone-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-stone-500">
            <Loader2 className="w-8 h-8 animate-spin text-[#C07F00] mb-3" />
            <p className="text-sm">Fetching wholesome products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center max-w-md mx-auto shadow-sm">
            <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-stone-800">No products found</h3>
            <p className="text-xs text-stone-500 mt-1">
              Try adjusting your search terms or selecting another category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group"
              >
                <div>
                  {/* Image Container - Clickable to detail page */}
                  <Link
                    href={`/products/${product.slug}`}
                    className="relative block w-full h-48 bg-stone-100 overflow-hidden cursor-pointer"
                  >
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-stone-300" />
                      </div>
                    )}

                    {product.is_vegetarian && (
                      <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold text-emerald-800 border border-emerald-200 shadow-sm">
                        Veg
                      </span>
                    )}

                    <span className="absolute top-3 right-3 bg-stone-900/70 text-white backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-medium">
                      {product.weight_grams}g
                    </span>
                  </Link>

                  {/* Body Content */}
                  <div className="p-4 sm:p-5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#C07F00]">
                      {product.category}
                    </span>
                    <Link
                      href={`/products/${product.slug}`}
                      className="block group-hover:text-[#C07F00] transition-colors"
                    >
                      <h3 className="font-bold text-base text-stone-900 mt-0.5 leading-snug">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                      {product.description || "Authentic healthy millet preparation crafted with care."}
                    </p>
                    <Link
                      href={`/products/${product.slug}`}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#183D2B] hover:text-[#C07F00] mt-2"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="p-4 sm:p-5 pt-0 border-t border-stone-100 mt-2">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-[10px] text-stone-400 block uppercase">Price</span>
                      <span className="text-lg font-extrabold text-[#183D2B]">
                        ₹{product.price}
                      </span>
                    </div>

                    {!product.is_available && (
                      <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                        Unavailable
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.is_available || actionLoadingId === product.id}
                      className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-[#183D2B] text-[#183D2B] text-xs font-semibold hover:bg-emerald-50 active:scale-95 transition disabled:opacity-40"
                    >
                      {actionLoadingId === product.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <ShoppingBag className="w-3.5 h-3.5" />
                      )}
                      <span>Add to Cart</span>
                    </button>

                    <button
                      onClick={() => handleBuyNow(product)}
                      disabled={!product.is_available}
                      className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#183D2B] text-white text-xs font-semibold hover:bg-[#23583e] active:scale-95 transition shadow-sm disabled:opacity-40"
                    >
                      <Zap className="w-3.5 h-3.5 text-[#C07F00]" />
                      <span>Buy Now</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex flex-col min-h-screen bg-[#F7F1E5] items-center justify-center py-20 text-stone-500">
          <Loader2 className="w-8 h-8 animate-spin text-[#C07F00] mb-3" />
          <p className="text-sm">Loading products catalog...</p>
        </div>
      }
    >
      <ProductsPageContent />
    </React.Suspense>
  );
}
