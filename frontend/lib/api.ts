/**
 * API client for MilletMarg backend communication.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

const TOKEN_KEY = "milletmarg_auth_token";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const local = localStorage.getItem(TOKEN_KEY);
    if (local) return local;
  } catch { }
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch { }
  return null;
}

export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch { }
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
  } catch { }
}

export function clearAuthToken(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch { }
  try {
    sessionStorage.removeItem(TOKEN_KEY);
  } catch { }
}

export interface ApiErrorResponse {
  detail?: string;
  message?: string;
  [key: string]: unknown;
}

export class ApiError extends Error {
  status: number;
  data: ApiErrorResponse;

  constructor(message: string, status: number, data: ApiErrorResponse) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers as Record<string, string>),
  };
  if (isFormData) {
    delete headers["Content-Type"];
  }

  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Token ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    let errorData: ApiErrorResponse = {};
    try {
      errorData = (await response.json()) as ApiErrorResponse;
    } catch {
      errorData = { detail: `HTTP error ${response.status}: ${response.statusText}` };
    }
    const message =
      errorData.detail ||
      errorData.message ||
      JSON.stringify(errorData) ||
      "Request failed";
    throw new ApiError(message, response.status, errorData);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// ----------------- Auth & Profile -----------------

export interface UserProfileData {
  id: number;
  email: string;
  username: string;
  role: "customer" | "owner" | "developer";
  display_name: string;
  profile_image_url: string | null;
  phone_number: string | null;
  gender: string | null;
  is_email_verified: boolean;
  is_staff: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfileData;
}

export async function loginWithGoogle(credential: string): Promise<AuthResponse> {
  const result = await apiRequest<AuthResponse>("/auth/google/", {
    method: "POST",
    body: JSON.stringify({ credential }),
  });
  if (result.token) {
    setAuthToken(result.token);
  }
  return result;
}

export async function getCurrentUserProfile(): Promise<UserProfileData> {
  return apiRequest<UserProfileData>("/auth/me/");
}

export async function updateCurrentUserProfile(data: {
  display_name?: string;
  phone_number?: string;
  gender?: string;
}): Promise<UserProfileData> {
  return apiRequest<UserProfileData>("/auth/me/", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function logoutUser(): Promise<{ detail: string }> {
  try {
    return await apiRequest<{ detail: string }>("/auth/logout/", {
      method: "POST",
    });
  } finally {
    clearAuthToken();
  }
}

// ----------------- Products -----------------

export interface ProductData {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  image: string | null;
  category: string;
  weight_grams: number;
  ingredients: string;
  is_vegetarian: boolean;
  allergen_information: string | null;
  nutritional_information: Record<string, unknown> | null;
  stock_quantity: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export async function getProducts(params?: {
  search?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  ordering?: string;
  page?: number;
}): Promise<PaginatedResponse<ProductData>> {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.category) query.set("category", params.category);
  if (params?.min_price !== undefined) query.set("min_price", String(params.min_price));
  if (params?.max_price !== undefined) query.set("max_price", String(params.max_price));
  if (params?.ordering) query.set("ordering", params.ordering);
  if (params?.page) query.set("page", String(params.page));

  const qs = query.toString();
  return apiRequest<PaginatedResponse<ProductData>>(`/items/${qs ? `?${qs}` : ""}`);
}

export async function getProductBySlug(slug: string): Promise<ProductData> {
  return apiRequest<ProductData>(`/items/${slug}/`);
}

export async function createProduct(formData: FormData): Promise<ProductData> {
  return apiRequest<ProductData>("/items/", {
    method: "POST",
    body: formData,
  });
}

export async function updateProduct(slug: string, formData: FormData): Promise<ProductData> {
  return apiRequest<ProductData>(`/items/${slug}/`, {
    method: "PATCH",
    body: formData,
  });
}

export async function deleteProduct(slug: string): Promise<void> {
  return apiRequest<void>(`/items/${slug}/`, {
    method: "DELETE",
  });
}

export async function markAllOutOfStock(): Promise<{ detail: string }> {
  return apiRequest<{ detail: string }>("/items/mark-all-out-of-stock/", {
    method: "POST",
  });
}

// ----------------- Addresses -----------------

export interface AddressData {
  id?: number;
  label: string;
  recipient_name: string;
  phone_number: string;
  address_line: string;
  house_number?: string;
  room_number?: string;
  landmark?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  latitude: string;
  longitude: string;
  formatted_address?: string;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

export async function getSavedAddresses(): Promise<PaginatedResponse<AddressData>> {
  return apiRequest<PaginatedResponse<AddressData>>("/addresses/");
}

export async function createSavedAddress(address: Partial<AddressData>): Promise<AddressData> {
  return apiRequest<AddressData>("/addresses/", {
    method: "POST",
    body: JSON.stringify(address),
  });
}

export async function updateSavedAddress(
  id: number,
  address: Partial<AddressData>
): Promise<AddressData> {
  return apiRequest<AddressData>(`/addresses/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(address),
  });
}

export async function deleteSavedAddress(id: number): Promise<void> {
  return apiRequest<void>(`/addresses/${id}/`, {
    method: "DELETE",
  });
}

export async function setDefaultAddress(id: number): Promise<AddressData> {
  return apiRequest<AddressData>(`/addresses/${id}/set_default/`, {
    method: "POST",
  });
}

// ----------------- Cart -----------------

export interface CartItemData {
  id: number;
  product_id: number;
  product_name: string;
  product_slug: string;
  product_image: string | null;
  unit_price: string;
  quantity: number;
  line_total: string;
  weight_grams: number;
  is_available: boolean;
  stock_quantity: number;
}

export interface CartData {
  id: number;
  items: CartItemData[];
  subtotal: string;
  total_items: number;
  updated_at: string;
}

export async function getCart(): Promise<CartData> {
  return apiRequest<CartData>("/cart/");
}

export async function addToCart(productId: number, quantity = 1): Promise<CartData> {
  return apiRequest<CartData>("/cart/items/", {
    method: "POST",
    body: JSON.stringify({ product_id: productId, quantity }),
  });
}

export async function updateCartItem(itemId: number, quantity: number): Promise<CartData> {
  return apiRequest<CartData>(`/cart/items/${itemId}/`, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
  });
}

export async function removeCartItem(itemId: number): Promise<CartData> {
  return apiRequest<CartData>(`/cart/items/${itemId}/`, {
    method: "DELETE",
  });
}

export async function clearCart(): Promise<{ detail: string }> {
  return apiRequest<{ detail: string }>("/cart/", {
    method: "DELETE",
  });
}

// ----------------- Delivery Quotes -----------------

export interface DeliveryQuote {
  road_distance_km: string | number;
  billable_distance_km: number;
  is_eligible: boolean;
  base_delivery_fee: string | number;
  delivery_fee_charged: string | number;
  is_free_delivery: boolean;
  free_delivery_threshold: string | number;
  amount_needed_for_free_delivery: string | number;
}

export async function getDeliveryQuote(params: {
  address_id?: number;
  latitude?: string | number;
  longitude?: string | number;
  subtotal?: string | number;
}): Promise<DeliveryQuote> {
  return apiRequest<DeliveryQuote>("/delivery/quote/", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

// ----------------- Checkout & Orders -----------------

export interface OrderItemData {
  id: number;
  product_name: string;
  product_slug: string;
  unit_price: string;
  quantity: number;
  line_total: string;
  weight_grams: number;
  product_image_url: string | null;
}

export interface PaymentReceiptData {
  id: number;
  file_name: string;
  file_size_bytes: number;
  uploaded_at: string;
  status: string;
  review_note: string;
  download_url: string;
}

export interface DeliveryStatusLogData {
  id: number;
  status: string;
  driver_name: string;
  driver_phone: string;
  note: string;
  created_at: string;
  created_by_name: string | null;
}

export interface ReviewData {
  id: number;
  order_public_id: string;
  order_reference: string;
  user_name: string;
  rating: number;
  comment: string;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderData {
  public_id: string;
  reference: string;
  status:
  | "pending"
  | "approved"
  | "preparing"
  | "ready_for_dispatch"
  | "out_for_delivery"
  | "delivered"
  | "rejected"
  | "cancelled";
  payment_status: "unpaid" | "submitted" | "verified" | "rejected";
  subtotal: string;
  road_distance_km: string;
  billable_distance_km: number;
  delivery_fee: string;
  delivery_fee_charged: string;
  is_free_delivery: boolean;
  free_delivery_threshold: string;
  total: string;
  currency: string;
  address_snapshot: Record<string, unknown>;
  recipient_name: string;
  phone_number: string;
  delivery_instructions: string;
  payment_instructions?: string | null;
  rejection_reason?: string;
  payment_rejection_reason?: string;
  payment_submitted_at?: string | null;
  payment_verified_at?: string | null;
  payment_verified_by?: number | null;
  payment_verified_by_name?: string | null;
  has_payment_receipt?: boolean;
  receipt_url?: string | null;
  internal_note?: string;
  driver_name?: string | null;
  driver_phone?: string | null;
  driver_call_url?: string | null;
  driver_whatsapp_url?: string | null;
  dispatched_at?: string | null;
  estimated_delivery_time?: string | null;
  delivered_at?: string | null;
  is_customer_confirmed?: boolean;
  customer_confirmed_at?: string | null;
  review?: ReviewData | null;
  delivery_logs?: DeliveryStatusLogData[];
  items: OrderItemData[];
  whatsapp_url: string;
  created_at: string;
  updated_at: string;
}

export interface OwnerDashboardSummary {
  pending_approval: number;
  approved_awaiting_payment: number;
  payment_verification_pending: number;
  paid_verified: number;
  preparing?: number;
  ready_for_dispatch?: number;
  out_for_delivery?: number;
  delivered?: number;
  rejected_or_cancelled: number;
  total_orders: number;
  total_revenue: string;
}

export interface OwnerOrderListItem {
  public_id: string;
  reference: string;
  status:
  | "pending"
  | "approved"
  | "preparing"
  | "ready_for_dispatch"
  | "out_for_delivery"
  | "delivered"
  | "rejected"
  | "cancelled";
  payment_status: "unpaid" | "submitted" | "verified" | "rejected";
  recipient_name: string;
  phone_number: string;
  customer_username: string;
  customer_email: string;
  items_count: number;
  subtotal: string;
  delivery_fee_charged: string;
  total: string;
  currency: string;
  driver_name?: string | null;
  driver_phone?: string | null;
  is_customer_confirmed?: boolean;
  has_payment_receipt: boolean;
  payment_submitted_at: string | null;
  payment_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OwnerDashboardData {
  summary: OwnerDashboardSummary;
  recent_orders: OwnerOrderListItem[];
}

export interface OwnerOrderDetailData extends OrderData {
  user_id: number;
  customer_username: string;
  customer_email: string;
  receipt_history: PaymentReceiptData[];
}

export interface NotificationData {
  id: number;
  notification_type: string;
  title: string;
  message: string;
  order_public_id: string | null;
  order_reference: string | null;
  is_read: boolean;
  created_at: string;
}

export async function checkoutBuyNow(data: {
  product_id?: number;
  product_slug?: string;
  quantity?: number;
  address_id?: number;
  new_address?: Partial<AddressData>;
  save_address?: boolean;
  phone_number?: string;
  recipient_name?: string;
  room_number?: string;
  delivery_instructions?: string;
  idempotency_key?: string;
}): Promise<OrderData> {
  return apiRequest<OrderData>("/checkout/buy-now/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function checkoutCart(data: {
  address_id?: number;
  new_address?: Partial<AddressData>;
  save_address?: boolean;
  phone_number?: string;
  recipient_name?: string;
  room_number?: string;
  delivery_instructions?: string;
  idempotency_key?: string;
}): Promise<OrderData> {
  return apiRequest<OrderData>("/checkout/cart/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getOrders(): Promise<PaginatedResponse<OrderData>> {
  return apiRequest<PaginatedResponse<OrderData>>("/orders/");
}

export async function getOrderByPublicId(publicId: string): Promise<OrderData> {
  return apiRequest<OrderData>(`/orders/${publicId}/`);
}

export async function cancelOrder(publicId: string): Promise<OrderData> {
  return apiRequest<OrderData>(`/orders/${publicId}/cancel/`, {
    method: "POST",
  });
}

export async function uploadPaymentReceipt(publicId: string, file: File): Promise<OrderData> {
  const token = getAuthToken();
  const formData = new FormData();
  formData.append("receipt", file);

  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Token ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/orders/${publicId}/payment-receipt/`, {
    method: "POST",
    headers,
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    let errorData: ApiErrorResponse = {};
    try {
      errorData = (await response.json()) as ApiErrorResponse;
    } catch {
      errorData = { detail: `HTTP error ${response.status}: ${response.statusText}` };
    }
    const message =
      errorData.detail ||
      errorData.message ||
      JSON.stringify(errorData) ||
      "Upload failed";
    throw new ApiError(message, response.status, errorData);
  }

  return response.json();
}

// ----------------- Owner Dashboard & Management -----------------

export async function getOwnerDashboard(): Promise<OwnerDashboardData> {
  return apiRequest<OwnerDashboardData>("/owner/dashboard/");
}

export async function getOwnerOrders(params?: {
  status?: string;
  payment_status?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
}): Promise<PaginatedResponse<OwnerOrderListItem>> {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.payment_status) query.set("payment_status", params.payment_status);
  if (params?.search) query.set("search", params.search);
  if (params?.date_from) query.set("date_from", params.date_from);
  if (params?.date_to) query.set("date_to", params.date_to);
  if (params?.page) query.set("page", params.page.toString());

  const queryString = query.toString() ? `?${query.toString()}` : "";
  return apiRequest<PaginatedResponse<OwnerOrderListItem>>(`/owner/orders/${queryString}`);
}

export async function getOwnerOrderDetail(publicId: string): Promise<OwnerOrderDetailData> {
  return apiRequest<OwnerOrderDetailData>(`/owner/orders/${publicId}/`);
}

export async function approveOrder(
  publicId: string,
  data?: {
    payment_instructions?: string;
    internal_note?: string;
    driver_name?: string;
    driver_phone?: string;
    estimated_delivery_time?: string;
  }
): Promise<OwnerOrderDetailData> {
  return apiRequest<OwnerOrderDetailData>(`/owner/orders/${publicId}/approve/`, {
    method: "POST",
    body: JSON.stringify(data || {}),
  });
}

export async function updateOwnerOrderDriver(
  publicId: string,
  data: {
    driver_name?: string;
    driver_phone?: string;
    estimated_delivery_time?: string;
    internal_note?: string;
  }
): Promise<OwnerOrderDetailData> {
  return apiRequest<OwnerOrderDetailData>(`/owner/orders/${publicId}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function rejectOrder(
  publicId: string,
  data: { rejection_reason: string; internal_note?: string }
): Promise<OwnerOrderDetailData> {
  return apiRequest<OwnerOrderDetailData>(`/owner/orders/${publicId}/reject/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function verifyOrderPayment(
  publicId: string,
  data?: { internal_note?: string }
): Promise<OwnerOrderDetailData> {
  return apiRequest<OwnerOrderDetailData>(`/owner/orders/${publicId}/verify-payment/`, {
    method: "POST",
    body: JSON.stringify(data || {}),
  });
}

export async function rejectOrderPayment(
  publicId: string,
  data: { payment_rejection_reason: string; internal_note?: string }
): Promise<OwnerOrderDetailData> {
  return apiRequest<OwnerOrderDetailData>(`/owner/orders/${publicId}/reject-payment/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ----------------- Stage 5 Delivery & Reviews -----------------

export async function updateDeliveryStatus(
  publicId: string,
  data: { status: "preparing" | "ready_for_dispatch" | "delivered"; note?: string }
): Promise<OwnerOrderDetailData> {
  return apiRequest<OwnerOrderDetailData>(`/owner/orders/${publicId}/delivery-status/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function dispatchOrder(
  publicId: string,
  data: {
    driver_name: string;
    driver_phone: string;
    estimated_delivery_time?: string;
    note?: string;
  }
): Promise<OwnerOrderDetailData> {
  return apiRequest<OwnerOrderDetailData>(`/owner/orders/${publicId}/dispatch/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function confirmDelivery(publicId: string): Promise<OrderData> {
  return apiRequest<OrderData>(`/orders/${publicId}/confirm-delivery/`, {
    method: "POST",
  });
}

export async function getOrderReview(publicId: string): Promise<ReviewData> {
  return apiRequest<ReviewData>(`/orders/${publicId}/review/`);
}

export async function submitOrderReview(
  publicId: string,
  data: { rating: number; comment?: string }
): Promise<ReviewData> {
  return apiRequest<ReviewData>(`/orders/${publicId}/review/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getOwnerReviews(params?: {
  is_visible?: boolean;
  page?: number;
}): Promise<PaginatedResponse<ReviewData>> {
  const query = new URLSearchParams();
  if (params?.is_visible !== undefined) query.set("is_visible", String(params.is_visible));
  if (params?.page) query.set("page", String(params.page));
  const queryString = query.toString() ? `?${query.toString()}` : "";
  return apiRequest<PaginatedResponse<ReviewData>>(`/owner/reviews/${queryString}`);
}

export async function moderateReview(
  reviewId: number,
  isVisible: boolean
): Promise<ReviewData> {
  return apiRequest<ReviewData>(`/owner/reviews/${reviewId}/moderate/`, {
    method: "POST",
    body: JSON.stringify({ is_visible: isVisible }),
  });
}

// ----------------- Notifications -----------------

export async function getNotifications(): Promise<NotificationData[]> {
  return apiRequest<NotificationData[]>("/notifications/");
}

export async function getNotificationUnreadCount(): Promise<{ unread_count: number }> {
  return apiRequest<{ unread_count: number }>("/notifications/unread-count/");
}

export async function markNotificationRead(id: number): Promise<{ detail: string }> {
  return apiRequest<{ detail: string }>(`/notifications/${id}/mark-read/`, {
    method: "POST",
  });
}

export async function markAllNotificationsRead(): Promise<{ detail: string }> {
  return apiRequest<{ detail: string }>("/notifications/mark-all-read/", {
    method: "POST",
  });
}

// ----------------- Shop Info -----------------

export interface ShopInfo {
  name: string;
  address: string;
  latitude: string;
  longitude: string;
}

export async function getShopInfo(): Promise<ShopInfo> {
  return apiRequest<ShopInfo>("/shop/info/");
}

