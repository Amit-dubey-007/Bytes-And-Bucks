"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  updateOwnerOrderDriver,
  updateDeliveryStatus,
  dispatchOrder,
  getOwnerReviews,
  moderateReview,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  markAllOutOfStock,
  ProductData,
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
  Plus,
  Pencil,
  Trash2,
  Upload,
} from "lucide-react";

function OwnerDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderQueryParam = searchParams.get("order");

  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  // Top level active tab: "orders" | "products" | "reviews"
  const [activeTab, setActiveTab] = useState<"orders" | "products" | "reviews">("orders");

  // Dashboard Data State
  const [summary, setSummary] = useState<OwnerDashboardSummary | null>(null);
  const [orders, setOrders] = useState<OwnerOrderListItem[]>([]);
  const [totalOrdersCount, setTotalOrdersCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Products Tab State
  const [productsList, setProductsList] = useState<ProductData[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<ProductData | null>(null);
  const [submittingProduct, setSubmittingProduct] = useState(false);
  const [productFormError, setProductFormError] = useState<string | null>(null);

  // Product Form Fields
  const [pName, setPName] = useState("");
  const [pPrice, setPPrice] = useState("");
  const [pCategory, setPCategory] = useState("");
  const [pWeightGrams, setPWeightGrams] = useState("250");
  const [pDescription, setPDescription] = useState("");
  const [pIngredients, setPIngredients] = useState("");
  const [pIsVegetarian, setPIsVegetarian] = useState(true);
  const [pInStock, setPInStock] = useState(true);
  const [markingAllOutOfStock, setMarkingAllOutOfStock] = useState(false);
  const [confirmMarkAllOut, setConfirmMarkAllOut] = useState(false);
  const [pIsAvailable, setPIsAvailable] = useState(true);
  const [pImageFile, setPImageFile] = useState<File | null>(null);

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

  // Product Management Handlers
  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const res = await getProducts({ search: productSearchQuery || undefined });
      setProductsList(res.results || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load products";
      setError(msg);
    } finally {
      setLoadingProducts(false);
    }
  }, [productSearchQuery]);

  useEffect(() => {
    if (isOwner && activeTab === "products") {
      loadProducts();
    }
  }, [isOwner, activeTab, loadProducts]);

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setPName("");
    setPPrice("");
    setPCategory("");
    setPWeightGrams("250");
    setPDescription("");
    setPIngredients("");
    setPIsVegetarian(true);
    setPInStock(true);
    setPIsAvailable(true);
    setPImageFile(null);
    setProductFormError(null);
    setProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: ProductData) => {
    setEditingProduct(prod);
    setPName(prod.name);
    setPPrice(String(prod.price));
    setPCategory(prod.category || "");
    setPWeightGrams(String(prod.weight_grams || 250));
    setPDescription(prod.description || "");
    setPIngredients(prod.ingredients || "");
    setPIsVegetarian(prod.is_vegetarian ?? true);
    setPInStock(prod.is_available ?? true);
    setPIsAvailable(prod.is_available ?? true);
    setPImageFile(null);
    setProductFormError(null);
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName.trim()) {
      setProductFormError("Product name is required.");
      return;
    }
    if (!pPrice.trim() || isNaN(Number(pPrice)) || Number(pPrice) < 0) {
      setProductFormError("Please enter a valid non-negative price.");
      return;
    }

    setSubmittingProduct(true);
    setProductFormError(null);

    try {
      const formData = new FormData();
      formData.append("name", pName.trim());
      formData.append("price", Number(pPrice).toFixed(2));
      formData.append("category", pCategory.trim() || "Bowls");
      formData.append("weight_grams", String(parseInt(pWeightGrams) || 250));
      formData.append("description", pDescription.trim());
      formData.append("ingredients", pIngredients.trim());
      formData.append("is_vegetarian", String(pIsVegetarian));
      // stock_quantity=0 means unlimited (never decremented); is_available is the real in/out stock flag
      formData.append("stock_quantity", "0");
      formData.append("is_available", String(pInStock));
      if (pImageFile) {
        formData.append("image", pImageFile);
      }

      if (editingProduct) {
        await updateProduct(editingProduct.slug, formData);
        setSuccessMessage(`Product "${pName}" updated successfully.`);
      } else {
        await createProduct(formData);
        setSuccessMessage(`Product "${pName}" created successfully.`);
      }

      setProductModalOpen(false);
      loadProducts();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save product";
      setProductFormError(msg);
    } finally {
      setSubmittingProduct(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    setSubmittingProduct(true);
    try {
      await deleteProduct(deletingProduct.slug);
      setSuccessMessage(`Product "${deletingProduct.name}" deleted successfully.`);
      setDeletingProduct(null);
      loadProducts();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete product";
      setError(msg);
    } finally {
      setSubmittingProduct(false);
    }
  };

  const handleMarkAllOutOfStock = async () => {
    setMarkingAllOutOfStock(true);
    setConfirmMarkAllOut(false);
    try {
      const res = await markAllOutOfStock();
      setSuccessMessage(res.detail || "All products marked out of stock for today.");
      loadProducts();
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to mark all out of stock";
      setError(msg);
    } finally {
      setMarkingAllOutOfStock(false);
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

  // Auto-inspect order if order query parameter is provided
  useEffect(() => {
    if (isOwner && orderQueryParam) {
      handleInspectOrder(orderQueryParam);
    }
  }, [isOwner, orderQueryParam]);

  // Submit Action (Approve / Reject / Verify / Reject Payment / Preparing / Ready / Dispatch / Delivered)
  const handleExecuteAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !actionType) return;

    setSubmittingAction(true);
    setActionError(null);

    try {
      let updated: OwnerOrderDetailData;

      if (actionType === "approve") {
        const cleanPhone = driverPhoneInput.replace(/\D/g, "");
        if (cleanPhone && (cleanPhone.length !== 10 || !/^[6-9]/.test(cleanPhone))) {
          setActionError("Driver phone must be a valid 10-digit Indian mobile number.");
          setSubmittingAction(false);
          return;
        }
        updated = await approveOrder(selectedOrder.public_id, {
          payment_instructions: paymentInstructionsInput.trim() || undefined,
          internal_note: internalNoteInput.trim() || undefined,
          driver_name: driverNameInput.trim() || undefined,
          driver_phone: cleanPhone || undefined,
          estimated_delivery_time: estimatedDeliveryTimeInput.trim() || undefined,
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

  const handleSaveDriverDetails = async () => {
    if (!selectedOrder) return;
    const cleanPhone = driverPhoneInput.replace(/\D/g, "");
    if (cleanPhone && (cleanPhone.length !== 10 || !/^[6-9]/.test(cleanPhone))) {
      setActionError("Driver phone must be a valid 10-digit Indian mobile number.");
      return;
    }
    setSubmittingAction(true);
    setActionError(null);
    try {
      const updated = await updateOwnerOrderDriver(selectedOrder.public_id, {
        driver_name: driverNameInput.trim() || undefined,
        driver_phone: cleanPhone || undefined,
        estimated_delivery_time: estimatedDeliveryTimeInput.trim() || undefined,
      });
      setSelectedOrder(updated);
      setSuccessMessage(`Driver details updated for order ${updated.reference}.`);
      setTimeout(() => setSuccessMessage(null), 4000);
      loadDashboardData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update driver details";
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
            onClick={() => setActiveTab("products")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "products"
                ? "border-[#183D2B] text-[#183D2B]"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            <Package className="w-3.5 h-3.5 text-[#C07F00]" />
            Products & Menu {productsList.length > 0 ? `(${productsList.length})` : ""}
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

    {/* Products & Menu Tab */}
    {activeTab === "products" && (
      <div className="space-y-5">
        {/* Header */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-[#183D2B] flex items-center gap-2">
              <Package className="w-5 h-5 text-[#C07F00]" />
              Products &amp; Menu Management
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Add, edit, or remove menu items. Changes reflect immediately on the store.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setConfirmMarkAllOut(true)}
              disabled={markingAllOutOfStock}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 hover:bg-red-100 transition shadow-sm"
            >
              <XCircle className="w-3.5 h-3.5" />
              Mark All Out of Stock Today
            </button>
            <button
              onClick={loadProducts}
              disabled={loadingProducts}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-xs font-bold text-stone-700 hover:bg-stone-50 transition shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingProducts ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={handleOpenAddProduct}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#183D2B] text-white text-xs font-bold hover:bg-[#122e20] transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Add New Product
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products by name, category, ingredients..."
            value={productSearchQuery}
            onChange={(e) => setProductSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#183D2B] shadow-sm"
          />
        </div>

        {/* Products List */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          {loadingProducts ? (
            <div className="py-20 text-center text-stone-500">
              <Loader2 className="w-8 h-8 animate-spin text-[#C07F00] mx-auto mb-2" />
              <p className="text-xs">Loading products...</p>
            </div>
          ) : productsList.length === 0 ? (
            <div className="py-16 text-center text-stone-500 space-y-3">
              <Package className="w-12 h-12 text-stone-300 mx-auto" />
              <p className="text-sm font-semibold text-stone-800">No products found</p>
              <p className="text-xs text-stone-400">
                {productSearchQuery ? "Try a different search term." : "Click \"Add New Product\" to create your first menu item."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[11px] font-bold">
                  <tr>
                    <th className="py-3.5 px-4">Product</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Price</th>
                    <th className="py-3.5 px-4">Weight</th>
                    <th className="py-3.5 px-4">Stock Status</th>
                    <th className="py-3.5 px-4">Visibility</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {productsList.map((prod) => (
                    <tr key={prod.id} className="hover:bg-stone-50/60 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {prod.image ? (
                            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-stone-200 bg-stone-100">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={prod.image}
                                alt={prod.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center shrink-0">
                              <Package className="w-4 h-4 text-stone-400" />
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-stone-900 leading-tight">{prod.name}</div>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span
                                className={`inline-block w-2.5 h-2.5 rounded-full border ${
                                  prod.is_vegetarian ? "bg-emerald-500 border-emerald-700" : "bg-red-500 border-red-700"
                                }`}
                              />
                              <span className="text-[10px] text-stone-500">
                                {prod.is_vegetarian ? "Veg" : "Non-veg"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold">
                          {prod.category || "Uncategorised"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-[#183D2B]">₹{prod.price}</td>
                      <td className="py-3.5 px-4 text-stone-500">{prod.weight_grams}g</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            prod.is_available
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          }`}
                        >
                          {prod.is_available ? "In Stock" : "Out of Stock"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            prod.is_available
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-stone-100 text-stone-600 border-stone-200"
                          }`}
                        >
                          {prod.is_available ? "Available" : "Hidden"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditProduct(prod)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#183D2B] text-white text-[11px] font-bold hover:bg-[#122e20] transition shadow-sm"
                          >
                            <Pencil className="w-3 h-3" />
                            Edit
                          </button>
                          <button
                            onClick={() => setDeletingProduct(prod)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 text-white text-[11px] font-bold hover:bg-red-700 transition shadow-sm"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
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
                            {selectedOrder.is_free_delivery ? (
                              <span className="text-emerald-700">
                                FREE (₹0.00)
                                <span className="text-stone-400 font-normal line-through ml-1.5">
                                  ₹{selectedOrder.delivery_fee}
                                </span>
                              </span>
                            ) : (
                              `₹${selectedOrder.delivery_fee_charged}`
                            )}
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
                            <div className="space-y-3">
                              <div>
                                <label className="block font-bold text-stone-800 mb-1">
                                  Payment Instructions (Customizable or leave as default):
                                </label>
                                <textarea
                                  rows={3}
                                  value={paymentInstructionsInput}
                                  onChange={(e) => setPaymentInstructionsInput(e.target.value)}
                                  placeholder="Store UPI ID, Bank Transfer details, and instructions..."
                                  className="w-full p-2.5 rounded-lg border border-stone-300 text-xs font-mono bg-white focus:outline-none"
                                />
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block font-bold text-stone-800 mb-1">
                                    Assign Driver Name (Optional):
                                  </label>
                                  <input
                                    type="text"
                                    value={driverNameInput}
                                    onChange={(e) => setDriverNameInput(e.target.value)}
                                    placeholder="e.g. Ramesh"
                                    className="w-full p-2.5 rounded-lg border border-stone-300 text-xs bg-white focus:outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block font-bold text-stone-800 mb-1">
                                    Driver Phone (Optional):
                                  </label>
                                  <input
                                    type="tel"
                                    value={driverPhoneInput}
                                    onChange={(e) => setDriverPhoneInput(e.target.value)}
                                    placeholder="10-digit number"
                                    className="w-full p-2.5 rounded-lg border border-stone-300 text-xs bg-white focus:outline-none"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {actionType === "verify" && (
                            <div className="space-y-3">
                              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs leading-relaxed">
                                <p className="font-bold mb-1">Confirm Manual Payment Verification</p>
                                <p>
                                  Are you sure you want to mark payment for order <strong>{selectedOrder.reference}</strong> as <strong>Verified</strong>?
                                  You confirm that you have verified receipt of <strong className="text-emerald-800">₹{selectedOrder.total}</strong> outside the website (e.g. via UPI notification, bank transfer SMS, or WhatsApp confirmation).
                                </p>
                              </div>
                              <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-stone-600 text-xs">
                                Verified By: <strong className="text-stone-900">{profile?.display_name || "Store Owner"} ({profile?.email})</strong>
                              </div>
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

                    {/* Manual Payment Verification (Outside Website) */}
                    {selectedOrder.status !== "pending" &&
                      selectedOrder.status !== "rejected" &&
                      selectedOrder.status !== "cancelled" &&
                      selectedOrder.payment_status !== "verified" && (
                        <button
                          onClick={() => setActionType("verify")}
                          className="px-4 py-2 rounded-xl bg-[#C07F00] hover:bg-[#a66d00] text-white font-bold transition shadow-sm inline-flex items-center gap-1.5"
                        >
                          <FileCheck className="w-4 h-4" />
                          Confirm Payment Received
                        </button>
                    )}

                    {/* Save Driver Details button */}
                    {selectedOrder.status !== "rejected" && selectedOrder.status !== "cancelled" && (
                      <button
                        onClick={handleSaveDriverDetails}
                        disabled={submittingAction}
                        className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 text-white font-bold transition shadow-sm inline-flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <Truck className="w-4 h-4" />
                        Save Driver Details
                      </button>
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
        {/* Product Add/Edit Modal */}
        {productModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto">
              <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#C07F00]">
                    {editingProduct ? "Edit Product" : "Add New Product"}
                  </span>
                  <h3 className="text-lg font-extrabold text-[#183D2B]">
                    {editingProduct ? editingProduct.name : "Create Menu Item"}
                  </h3>
                </div>
                <button
                  onClick={() => setProductModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 flex items-center justify-center text-stone-600 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <form id="productForm" onSubmit={handleSaveProduct} className="space-y-5 text-xs">
                  {productFormError && (
                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      <span className="font-semibold">{productFormError}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-stone-800 mb-1.5">Product Name <span className="text-red-500">*</span></label>
                      <input type="text" value={pName} onChange={(e) => setPName(e.target.value)} placeholder="e.g. Jowar Veggie Bowl" required className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#183D2B] text-xs" />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-800 mb-1.5">Price (₹) <span className="text-red-500">*</span></label>
                      <input type="number" min="0" step="0.01" value={pPrice} onChange={(e) => setPPrice(e.target.value)} placeholder="e.g. 199" required className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#183D2B] text-xs" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-stone-800 mb-1.5">Category <span className="text-stone-400 font-normal">(optional)</span></label>
                      <input type="text" value={pCategory} onChange={(e) => setPCategory(e.target.value)} placeholder="Bowls, Snacks, Drinks..." className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#183D2B] text-xs" />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-800 mb-1.5">Weight (grams)</label>
                      <input type="number" min="1" value={pWeightGrams} onChange={(e) => setPWeightGrams(e.target.value)} placeholder="250" className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#183D2B] text-xs" />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-stone-800 mb-1.5">Description</label>
                    <textarea rows={3} value={pDescription} onChange={(e) => setPDescription(e.target.value)} placeholder="Short description shown to customers..." className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#183D2B] text-xs resize-none" />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-800 mb-1.5">Ingredients</label>
                    <textarea rows={2} value={pIngredients} onChange={(e) => setPIngredients(e.target.value)} placeholder="Jowar flour, vegetables, spices..." className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#183D2B] text-xs resize-none" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col justify-end">
                      <label className="block font-bold text-stone-800 mb-2">In Stock</label>
                      <button
                        type="button"
                        onClick={() => setPInStock(!pInStock)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition ${
                          pInStock
                            ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                            : "bg-red-50 border-red-300 text-red-800"
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full ${pInStock ? "bg-emerald-500" : "bg-red-500"}`} />
                        {pInStock ? "Yes — In Stock" : "No — Out of Stock"}
                      </button>
                    </div>
                    <div className="flex flex-col justify-end">
                      <label className="block font-bold text-stone-800 mb-2">Vegetarian</label>
                      <button type="button" onClick={() => setPIsVegetarian(!pIsVegetarian)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition ${pIsVegetarian ? "bg-emerald-50 border-emerald-300 text-emerald-800" : "bg-red-50 border-red-300 text-red-800"}`}>
                        <span className={`w-3 h-3 rounded-full border-2 ${pIsVegetarian ? "bg-emerald-500 border-emerald-700" : "bg-red-500 border-red-700"}`} />
                        {pIsVegetarian ? "Vegetarian" : "Non-Veg"}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-stone-800 mb-1.5">
                      Product Image {editingProduct && <span className="text-stone-400 font-normal">(leave blank to keep existing)</span>}
                    </label>
                    <label htmlFor="productImageInput" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-stone-300 rounded-xl cursor-pointer bg-stone-50 hover:bg-stone-100 transition">
                      {pImageFile ? (
                        <div className="flex flex-col items-center gap-1">
                          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                          <span className="text-xs font-semibold text-emerald-800">{pImageFile.name}</span>
                          <span className="text-[10px] text-stone-400">{(pImageFile.size / 1024).toFixed(0)} KB — click to change</span>
                        </div>
                      ) : editingProduct?.image ? (
                        <div className="flex flex-col items-center gap-1">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={editingProduct.image} alt="current" className="w-12 h-12 object-cover rounded-lg" />
                          <span className="text-[10px] text-stone-500">Current image — click to replace</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-stone-400">
                          <Upload className="w-7 h-7" />
                          <span className="text-xs font-semibold">Click to upload image</span>
                          <span className="text-[10px]">JPG, PNG, WebP — max 5 MB</span>
                        </div>
                      )}
                      <input id="productImageInput" type="file" accept="image/*" className="hidden" onChange={(e) => setPImageFile(e.target.files?.[0] || null)} />
                    </label>
                  </div>
                </form>
              </div>

              <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between gap-3">
                <button type="button" onClick={() => setProductModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-700 text-xs font-bold hover:bg-stone-100 transition">Cancel</button>
                <button type="submit" form="productForm" disabled={submittingProduct} className="px-6 py-2.5 rounded-xl bg-[#183D2B] text-white text-xs font-bold hover:bg-[#122e20] transition shadow-sm inline-flex items-center gap-2 disabled:opacity-60">
                  {submittingProduct ? <Loader2 className="w-4 h-4 animate-spin" /> : editingProduct ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {submittingProduct ? "Saving..." : editingProduct ? "Update Product" : "Create Product"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mark All Out of Stock Confirm Modal */}
        {confirmMarkAllOut && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-md w-full overflow-hidden">
              <div className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
                  <XCircle className="w-6 h-6 text-amber-600" />
                </div>
                <div className="text-center space-y-1.5">
                  <h3 className="text-lg font-extrabold text-stone-900">Mark All Out of Stock?</h3>
                  <p className="text-sm text-stone-600">
                    This will mark <strong className="text-stone-900">every product</strong> as out of stock immediately.
                    Customers will not be able to order anything until you re-enable items individually.
                  </p>
                  <p className="text-xs text-amber-700 font-semibold bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2">
                    Tip: Go to each product and toggle &quot;In Stock → Yes&quot; to re-enable them tomorrow.
                  </p>
                </div>
              </div>
              <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between gap-3">
                <button
                  onClick={() => setConfirmMarkAllOut(false)}
                  disabled={markingAllOutOfStock}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-700 text-xs font-bold hover:bg-stone-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMarkAllOutOfStock}
                  disabled={markingAllOutOfStock}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition inline-flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {markingAllOutOfStock ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  {markingAllOutOfStock ? "Marking..." : "Yes, Mark All Out"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deletingProduct && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-md w-full overflow-hidden">
              <div className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div className="text-center space-y-1.5">
                  <h3 className="text-lg font-extrabold text-stone-900">Delete Product?</h3>
                  <p className="text-sm text-stone-600">Are you sure you want to permanently delete <strong className="text-stone-900">&ldquo;{deletingProduct.name}&rdquo;</strong>?</p>
                  <p className="text-xs text-red-600 font-semibold">This cannot be undone. The product will be removed from the store immediately.</p>
                </div>
              </div>
              <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between gap-3">
                <button onClick={() => setDeletingProduct(null)} disabled={submittingProduct} className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-700 text-xs font-bold hover:bg-stone-100 transition">Cancel</button>
                <button onClick={handleDeleteProduct} disabled={submittingProduct} className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition inline-flex items-center justify-center gap-2 disabled:opacity-60">
                  {submittingProduct ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  {submittingProduct ? "Deleting..." : "Yes, Delete It"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>


      <Footer />
    </div>
  );
}

export default function OwnerDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F7F1E5] text-[#183D2B]">
          <Loader2 className="w-8 h-8 animate-spin text-[#C07F00]" />
        </div>
      }
    >
      <OwnerDashboardContent />
    </Suspense>
  );
}

