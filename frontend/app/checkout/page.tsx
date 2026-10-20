"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AddressMapPicker from "@/components/address/AddressMapPicker";
import { GeocodingResult } from "@/lib/geocoding";
import {
  getCart,
  getProductBySlug,
  getSavedAddresses,
  getCurrentUserProfile,
  UserProfileData,
  getDeliveryQuote,
  checkoutBuyNow,
  checkoutCart,
  AddressData,
  ProductData,
  DeliveryQuote,
  CartData,
  getAuthToken,
  ApiError,
} from "@/lib/api";
import {
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  MessageSquare,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const buyNowSlug = searchParams.get("buy_now");
  const buyNowQty = parseInt(searchParams.get("quantity") || "1", 10);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cart or Single Product State
  const [cart, setCart] = useState<CartData | null>(null);
  const [singleProduct, setSingleProduct] = useState<ProductData | null>(null);

  // Address State
  const [addresses, setAddresses] = useState<AddressData[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

  // New Address Form State
  const [isNewAddress, setIsNewAddress] = useState(false);
  const [saveAddress, setSaveAddress] = useState(true);
  const [newLabel, setNewLabel] = useState("Home");
  const [newRecipient, setNewRecipient] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newLine, setNewLine] = useState("");
  const [newHouse, setNewHouse] = useState("");
  const [newRoom, setNewRoom] = useState("");
  const [newLandmark, setNewLandmark] = useState("");
  const [newCity, setNewCity] = useState("Indore");
  const [newState, setNewState] = useState("Madhya Pradesh");
  const [newPin, setNewPin] = useState("");
  const [newLat, setNewLat] = useState("22.695518");
  const [newLng, setNewLng] = useState("75.833325");
  const [newFormatted, setNewFormatted] = useState("");

  // Delivery Notes & Contact
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [contactPhone, setContactPhone] = useState("");
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [roomNumber, setRoomNumber] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");

  // Live Delivery Quote
  const [quote, setQuote] = useState<DeliveryQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  const merchandiseSubtotal = singleProduct
    ? (parseFloat(singleProduct.price) * buyNowQty).toFixed(2)
    : cart?.subtotal || "0.00";

  // Initial Load
  const loadCheckoutData = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      router.push(`/profile?redirect=/checkout`);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // 1. Fetch item(s) to checkout
      if (buyNowSlug) {
        const prod = await getProductBySlug(buyNowSlug);
        setSingleProduct(prod);
      } else {
        const cartData = await getCart();
        setCart(cartData);
        if (cartData.items.length === 0) {
          router.push("/cart");
          return;
        }
      }

      // 2. Fetch saved addresses and current profile in parallel
      const [addrRes, userProfileRes] = await Promise.allSettled([
        getSavedAddresses(),
        getCurrentUserProfile(),
      ]);

      const addrList = addrRes.status === "fulfilled" ? addrRes.value.results || [] : [];
      setAddresses(addrList);

      const userProfile = userProfileRes.status === "fulfilled" ? userProfileRes.value : null;
      if (userProfile) {
        setProfile(userProfile);
      }

      // Pre-select default address and autofill name & phone
      const defaultAddr = addrList.find((a) => a.is_default) || addrList[0];
      const initialName = userProfile?.display_name || defaultAddr?.recipient_name || "";
      const initialPhone = defaultAddr?.phone_number || userProfile?.phone_number || "";

      if (initialName) {
        setNewRecipient((prev) => prev || initialName);
      }
      if (initialPhone) {
        setNewPhone((prev) => prev || initialPhone);
        setContactPhone((prev) => prev || initialPhone);
      }

      if (defaultAddr && defaultAddr.id) {
        setSelectedAddressId(defaultAddr.id);
        if (defaultAddr.phone_number) {
          setContactPhone(defaultAddr.phone_number);
        }
      } else {
        setIsNewAddress(true);
      }
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 401) {
        router.push(`/profile?redirect=/checkout`);
      } else {
        const msg = err instanceof Error ? err.message : "Failed to load checkout";
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, [buyNowSlug, router]);

  useEffect(() => {
    loadCheckoutData();
  }, [loadCheckoutData]);

  // Request Delivery Quote whenever address or subtotal changes
  const fetchQuote = useCallback(async () => {
    if (isNewAddress) {
      if (!newLat || !newLng) return;
      setQuoteLoading(true);
      setQuoteError(null);
      try {
        const res = await getDeliveryQuote({
          latitude: newLat,
          longitude: newLng,
          subtotal: merchandiseSubtotal,
        });
        setQuote(res);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unable to calculate delivery distance";
        setQuoteError(msg);
        setQuote(null);
      } finally {
        setQuoteLoading(false);
      }
    } else if (selectedAddressId) {
      setQuoteLoading(true);
      setQuoteError(null);
      try {
        const res = await getDeliveryQuote({
          address_id: selectedAddressId,
          subtotal: merchandiseSubtotal,
        });
        setQuote(res);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unable to calculate delivery distance";
        setQuoteError(msg);
        setQuote(null);
      } finally {
        setQuoteLoading(false);
      }
    }
  }, [isNewAddress, newLat, newLng, selectedAddressId, merchandiseSubtotal]);

  useEffect(() => {
    if (!loading) {
      fetchQuote();
    }
  }, [fetchQuote, loading]);

  const handleMapLocationSelect = useCallback((lat: number, lng: number, geo?: GeocodingResult | null) => {
    setNewLat(lat.toFixed(6));
    setNewLng(lng.toFixed(6));
    if (geo) {
      if (geo.formatted_address) setNewFormatted(geo.formatted_address);
      if (geo.road) setNewLine(geo.road);
      if (geo.house_number) setNewHouse(geo.house_number);
      if (geo.city) setNewCity(geo.city);
      if (geo.state) setNewState(geo.state);
      if (geo.postal_code) setNewPin(geo.postal_code);
    }
  }, []);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quote?.is_eligible) {
      setError("Delivery is not available for this location (> 20 km cafe delivery radius). Please choose an address closer to Indore.");
      return;
    }

    const targetPhone = contactPhone || newPhone;
    const cleanPhone = targetPhone.replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError("Please provide a valid 10-digit Indian contact phone number starting with 6, 7, 8, or 9.");
      return;
    }

    if (isNewAddress) {
      const cleanNewPhone = newPhone.replace(/\D/g, "");
      if (!/^[6-9]\d{9}$/.test(cleanNewPhone)) {
        setError("Please provide a valid 10-digit recipient phone number for the new delivery address.");
        return;
      }
      if (!newRecipient.trim()) {
        setError("Recipient name is required for the delivery address.");
        return;
      }
      if (!newLine.trim()) {
        setError("Street / area address is required. Click the map or enter your street.");
        return;
      }
      if (!newPin.trim()) {
        setError("Postal code (PIN) is required.");
        return;
      }
    }

    setSubmitting(true);
    setError(null);

    const idempotencyKey = `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    try {
      const checkoutPayload: any = {
        phone_number: cleanPhone,
        room_number: roomNumber || newRoom,
        delivery_instructions: deliveryInstructions,
        idempotency_key: idempotencyKey,
      };

      if (isNewAddress) {
        checkoutPayload.new_address = {
          label: newLabel,
          recipient_name: newRecipient,
          phone_number: newPhone,
          address_line: newLine,
          house_number: newHouse,
          room_number: newRoom,
          landmark: newLandmark,
          city: newCity,
          state: newState,
          postal_code: newPin,
          country: "India",
          latitude: newLat,
          longitude: newLng,
          formatted_address: newFormatted,
        };
        checkoutPayload.save_address = saveAddress;
      } else {
        checkoutPayload.address_id = selectedAddressId;
      }

      let orderResult;
      if (singleProduct) {
        orderResult = await checkoutBuyNow({
          ...checkoutPayload,
          product_id: singleProduct.id,
          quantity: buyNowQty,
        });
      } else {
        orderResult = await checkoutCart(checkoutPayload);
      }

      // Open WhatsApp click-to-chat
      if (orderResult.whatsapp_url) {
        window.open(orderResult.whatsapp_url, "_blank");
      }

      // Redirect to order details
      router.push(`/orders/${orderResult.public_id}/details`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Checkout failed. Please check your details.";
      setError(msg);
      setSubmitting(false);
    }
  };

  const deliveryFeeNumber = quote ? parseFloat(String(quote.delivery_fee_charged)) : 0;
  const grandTotal = (parseFloat(merchandiseSubtotal) + deliveryFeeNumber).toFixed(2);

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F1E5] text-[#183D2B]">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-28 w-full">
        {/* Header */}
        <div className="border-b border-stone-200 pb-5 mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#183D2B]">Checkout</h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Complete your order and connect with MilletMarg on WhatsApp.
          </p>
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
            <p className="text-sm">Preparing checkout...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Columns: Address & Delivery Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Address Selector */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <h2 className="text-base font-bold text-[#183D2B] flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#C07F00]" />
                    Delivery Address
                  </h2>

                  {addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsNewAddress(!isNewAddress)}
                      className="text-xs font-semibold text-[#183D2B] hover:underline"
                    >
                      {isNewAddress ? "Select from saved addresses" : "+ Add new address"}
                    </button>
                  )}
                </div>

                {!isNewAddress && addresses.length > 0 ? (
                  <div className="space-y-3">
                    {addresses.map((addr) => (
                      <label
                        key={addr.id}
                        className={`block p-4 rounded-xl border cursor-pointer transition ${
                          selectedAddressId === addr.id
                            ? "border-[#183D2B] bg-emerald-50/40 ring-1 ring-[#183D2B]/30"
                            : "border-stone-200 hover:border-stone-300"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="selectedAddress"
                            checked={selectedAddressId === addr.id}
                            onChange={() => {
                              if (addr.id) {
                                setSelectedAddressId(addr.id);
                                if (addr.phone_number) setContactPhone(addr.phone_number);
                              }
                            }}
                            className="mt-1 text-[#183D2B] focus:ring-[#183D2B]"
                          />
                          <div className="flex-1 text-xs text-stone-700">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-stone-900">{addr.label}</span>
                              {addr.is_default && (
                                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-semibold">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="font-medium text-stone-800">{addr.recipient_name} &middot; {addr.phone_number}</p>
                            <p className="text-stone-600 mt-0.5">
                              {addr.house_number && `${addr.house_number}, `}
                              {addr.address_line}, {addr.city} ({addr.postal_code})
                            </p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  /* New Address Map Picker & Fields */
                  <div className="space-y-4 pt-1">
                    <AddressMapPicker onLocationSelect={handleMapLocationSelect} />

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-stone-700 mb-1">Label</label>
                        <select
                          value={newLabel}
                          onChange={(e) => setNewLabel(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white"
                        >
                          <option value="Home">Home</option>
                          <option value="Work">Work</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-stone-700 mb-1">Recipient Name *</label>
                        <input
                          type="text"
                          value={newRecipient}
                          onChange={(e) => setNewRecipient(e.target.value)}
                          required={isNewAddress}
                          placeholder="e.g. Priya Sharma"
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-stone-700 mb-1">Phone Number *</label>
                        <input
                          type="tel"
                          value={newPhone}
                          onChange={(e) => setNewPhone(e.target.value)}
                          required={isNewAddress}
                          placeholder="10-digit mobile"
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-stone-700 mb-1">Street / Area *</label>
                        <input
                          type="text"
                          value={newLine}
                          onChange={(e) => setNewLine(e.target.value)}
                          required={isNewAddress}
                          placeholder="Area, road, or colony"
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-stone-700 mb-1">House/Flat No.</label>
                        <input
                          type="text"
                          value={newHouse}
                          onChange={(e) => setNewHouse(e.target.value)}
                          placeholder="e.g. 102"
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-stone-700 mb-1">Unit / Room</label>
                        <input
                          type="text"
                          value={newRoom}
                          onChange={(e) => setNewRoom(e.target.value)}
                          placeholder="e.g. 4B"
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-stone-700 mb-1">Landmark</label>
                        <input
                          type="text"
                          value={newLandmark}
                          onChange={(e) => setNewLandmark(e.target.value)}
                          placeholder="Nearby spot"
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-stone-700 mb-1">City</label>
                        <input
                          type="text"
                          value={newCity}
                          onChange={(e) => setNewCity(e.target.value)}
                          required={isNewAddress}
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-stone-700 mb-1">PIN Code *</label>
                        <input
                          type="text"
                          value={newPin}
                          onChange={(e) => setNewPin(e.target.value)}
                          required={isNewAddress}
                          placeholder="452001"
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="saveAddressCheckbox"
                        checked={saveAddress}
                        onChange={(e) => setSaveAddress(e.target.checked)}
                        className="rounded text-[#183D2B] focus:ring-[#183D2B]"
                      />
                      <label htmlFor="saveAddressCheckbox" className="text-xs text-stone-700">
                        Save this address to my account for future orders
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Delivery Instructions & Confirmation Phone */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
                <h2 className="text-base font-bold text-[#183D2B] flex items-center gap-2 border-b border-stone-100 pb-3">
                  <FileText className="w-5 h-5 text-[#C07F00]" />
                  Delivery Contact & Instructions
                </h2>

                <div className="space-y-4">
                  {!isEditingPhone && contactPhone && contactPhone.length >= 10 ? (
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-emerald-950">Contact Mobile Number Confirmed</p>
                          <p className="text-xs font-mono text-emerald-800 font-semibold">+91 {contactPhone}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsEditingPhone(true)}
                        className="text-xs font-semibold text-[#183D2B] bg-white hover:bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-200 transition shadow-sm"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-medium text-stone-700">
                          Contact Mobile Number *
                        </label>
                        {contactPhone && isEditingPhone && (
                          <button
                            type="button"
                            onClick={() => setIsEditingPhone(false)}
                            className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 underline"
                          >
                            Done Editing
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-xs font-medium text-stone-400">+91</span>
                        <input
                          type="tel"
                          value={contactPhone}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                            setContactPhone(val);
                          }}
                          required
                          placeholder="10-digit mobile number"
                          className="w-full pl-11 pr-3 py-2 text-xs border border-stone-300 rounded-lg outline-none focus:ring-1 focus:ring-[#183D2B]"
                        />
                      </div>
                      <p className="text-[11px] text-stone-500 mt-1">
                        Prefilled from your profile. Order and delivery driver updates will be sent to this number.
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">
                        Unit / Room Number (Optional)
                      </label>
                      <input
                        type="text"
                        value={roomNumber}
                        onChange={(e) => setRoomNumber(e.target.value)}
                        placeholder="e.g. Flat 301, Tower B"
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">
                        Delivery Instructions (Optional)
                      </label>
                      <textarea
                        rows={1}
                        value={deliveryInstructions}
                        onChange={(e) => setDeliveryInstructions(e.target.value)}
                        placeholder="e.g. Leave at door, call upon arrival"
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary, Delivery Quote & Submit */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-5">
                <h2 className="text-base font-bold text-[#183D2B] border-b border-stone-100 pb-3">
                  Order Summary
                </h2>

                {/* Items Mini List */}
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1 text-xs">
                  {singleProduct ? (
                    <div className="flex items-center justify-between gap-3 pb-2 border-b border-stone-100">
                      <div>
                        <p className="font-bold text-stone-900">{singleProduct.name}</p>
                        <p className="text-[11px] text-stone-500">Qty: {buyNowQty} &middot; ₹{singleProduct.price} each</p>
                      </div>
                      <span className="font-bold text-stone-800">
                        ₹{(parseFloat(singleProduct.price) * buyNowQty).toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    cart?.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-3 pb-2 border-b border-stone-100">
                        <div>
                          <p className="font-bold text-stone-900">{item.product_name}</p>
                          <p className="text-[11px] text-stone-500">Qty: {item.quantity} &middot; ₹{item.unit_price} each</p>
                        </div>
                        <span className="font-bold text-stone-800">₹{item.line_total}</span>
                      </div>
                    ))
                  )}
                </div>

                {/* Delivery Quote Display */}
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-700">Road Distance</span>
                    {quoteLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C07F00]" />
                    ) : quote ? (
                      <span className="font-mono text-stone-900">
                        {quote.road_distance_km} km ({quote.billable_distance_km} billable km)
                      </span>
                    ) : (
                      <span className="text-stone-400">Selecting address...</span>
                    )}
                  </div>

                  {quote && !quote.is_eligible && (
                    <div className="p-2 rounded bg-red-50 border border-red-200 text-red-700 text-[11px] flex items-start gap-1.5">
                      <ShieldAlert className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                      <span>Delivery is unavailable because distance exceeds our 20 km cafe limit.</span>
                    </div>
                  )}

                  {quote && quote.is_eligible && (
                    <>
                      {quote.is_free_delivery ? (
                        <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-1.5 font-medium">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>FREE Delivery applied! (Subtotal qualifies)</span>
                        </div>
                      ) : (
                        parseFloat(String(quote.amount_needed_for_free_delivery)) > 0 && (
                          <div className="p-2 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>
                              Add ₹{quote.amount_needed_for_free_delivery} more of products for FREE delivery!
                            </span>
                          </div>
                        )
                      )}
                    </>
                  )}

                  {quoteError && (
                    <p className="text-[11px] text-red-600">{quoteError}</p>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 text-xs border-t border-stone-100 pt-3">
                  <div className="flex justify-between text-stone-600">
                    <span>Merchandise Subtotal</span>
                    <span className="font-semibold text-stone-800">₹{merchandiseSubtotal}</span>
                  </div>

                  <div className="flex justify-between text-stone-600">
                    <span>Delivery Fee</span>
                    {quote?.is_free_delivery ? (
                      <span className="font-bold text-emerald-600">
                        FREE (₹0.00)
                        {quote?.base_delivery_fee && (
                          <span className="text-stone-400 font-normal line-through ml-1.5">
                            ₹{Number(quote.base_delivery_fee).toFixed(2)}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span>₹{deliveryFeeNumber.toFixed(2)}</span>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-sm font-extrabold text-[#183D2B] border-t border-stone-200 pt-3">
                    <span>Total Amount</span>
                    <span className="text-xl">₹{grandTotal}</span>
                  </div>
                </div>

                {/* Submit to WhatsApp Button */}
                <button
                  type="submit"
                  disabled={submitting || (quote ? !quote.is_eligible : false)}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#25D366] text-white text-xs font-bold hover:bg-[#20ba59] active:scale-98 transition shadow-md disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Order...</span>
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4" />
                      <span>Place Order on WhatsApp</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-stone-500 leading-tight">
                  Clicking will open WhatsApp with your prefilled order reference and details link.
                </p>
              </div>
            </div>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F7F1E5] text-[#183D2B]">
          <Loader2 className="w-8 h-8 animate-spin text-[#C07F00]" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
