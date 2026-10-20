"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Script from "next/script";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AddressMapPicker from "@/components/address/AddressMapPicker";
import { GeocodingResult } from "@/lib/geocoding";
import {
  getCurrentUserProfile,
  updateCurrentUserProfile,
  loginWithGoogle,
  logoutUser,
  getSavedAddresses,
  createSavedAddress,
  deleteSavedAddress,
  setDefaultAddress,
  UserProfileData,
  AddressData,
  getAuthToken,
  ApiError,
} from "@/lib/api";
import {
  User,
  MapPin,
  Plus,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Phone,
  Mail,
  Home,
  Briefcase,
  Loader2,
  AlertCircle,
  LogOut,
  Package,
} from "lucide-react";

interface GoogleCredentialResponse {
  credential?: string;
  [key: string]: unknown;
}

interface GoogleAccountsId {
  initialize: (config: { client_id: string; callback: (res: GoogleCredentialResponse) => void }) => void;
  renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
}

export default function ProfileAndAddressesPage() {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [addresses, setAddresses] = useState<AddressData[]>([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Profile Edit State
  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Add Address Form State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [submittingAddress, setSubmittingAddress] = useState(false);
  const [addressFormError, setAddressFormError] = useState<string | null>(null);

  const [label, setLabel] = useState("Home");
  const [recipientName, setRecipientName] = useState("");
  const [addressPhone, setAddressPhone] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("Indore");
  const [state, setState] = useState("Madhya Pradesh");
  const [postalCode, setPostalCode] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [selectedLat, setSelectedLat] = useState("22.695518");
  const [selectedLng, setSelectedLng] = useState("75.833325");
  const [formattedAddress, setFormattedAddress] = useState("");

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  const loadUserData = useCallback(async () => {
    setLoading(true);
    setAuthError(null);
    try {
      const token = getAuthToken();
      if (!token) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const userData = await getCurrentUserProfile();
      setProfile(userData);
      setDisplayName(userData.display_name || "");
      setPhoneNumber(userData.phone_number || "");
      setGender(userData.gender || "");

      const addressData = await getSavedAddresses();
      setAddresses(addressData.results || []);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 401) {
        setProfile(null);
      } else {
        const msg = err instanceof Error ? err.message : "Failed to load user profile";
        setAuthError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Handle Google Identity Services response
  const handleGoogleCredentialResponse = useCallback(async (response: GoogleCredentialResponse) => {
    if (!response.credential) {
      setAuthError("No credential returned from Google Sign-In.");
      return;
    }

    setLoading(true);
    setAuthError(null);
    try {
      const authRes = await loginWithGoogle(response.credential);
      setProfile(authRes.user);
      setDisplayName(authRes.user.display_name || "");
      setPhoneNumber(authRes.user.phone_number || "");
      setGender(authRes.user.gender || "");

      const addressData = await getSavedAddresses();
      setAddresses(addressData.results || []);
      setSuccessMessage("Signed in successfully with Google!");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to authenticate with Google";
      setAuthError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize Google One Tap / Button when script loads
  useEffect(() => {
    if (typeof window !== "undefined") {
      const win = window as unknown as { google?: { accounts?: { id?: GoogleAccountsId } } };
      if (win.google?.accounts?.id && googleClientId && !profile) {
        try {
          win.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleCredentialResponse,
          });
          const btnElement = document.getElementById("googleSignInBtn");
          if (btnElement) {
            win.google.accounts.id.renderButton(btnElement, {
              theme: "outline",
              size: "large",
              text: "signin_with",
              shape: "rectangular",
            });
          }
        } catch (e) {
          console.error("Google accounts init error:", e);
        }
      }
    }
  }, [googleClientId, profile, handleGoogleCredentialResponse]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setAuthError(null);
    try {
      const updated = await updateCurrentUserProfile({
        display_name: displayName,
        phone_number: phoneNumber,
        gender: gender || undefined,
      });
      setProfile(updated);
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update profile";
      setAuthError(msg);
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setProfile(null);
      setAddresses([]);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleLocationSelect = (lat: number, lng: number, geo?: GeocodingResult | null) => {
    setSelectedLat(lat.toFixed(6));
    setSelectedLng(lng.toFixed(6));
    if (geo) {
      if (geo.formatted_address) setFormattedAddress(geo.formatted_address);
      if (geo.road && !addressLine) setAddressLine(geo.road);
      if (geo.house_number && !houseNumber) setHouseNumber(geo.house_number);
      if (geo.city) setCity(geo.city);
      if (geo.state) setState(geo.state);
      if (geo.postal_code && !postalCode) setPostalCode(geo.postal_code);
    }
  };

  const resetAddressForm = () => {
    setLabel("Home");
    setRecipientName("");
    setAddressPhone("");
    setAddressLine("");
    setHouseNumber("");
    setRoomNumber("");
    setLandmark("");
    setPostalCode("");
    setIsDefault(false);
    setAddressFormError(null);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingAddress(true);
    setAddressFormError(null);

    try {
      await createSavedAddress({
        label,
        recipient_name: recipientName,
        phone_number: addressPhone,
        address_line: addressLine,
        house_number: houseNumber,
        room_number: roomNumber || undefined,
        landmark: landmark || undefined,
        city,
        state,
        postal_code: postalCode,
        country: "India",
        latitude: selectedLat,
        longitude: selectedLng,
        formatted_address: formattedAddress,
        is_default: isDefault,
      });

      // Reload addresses
      const updatedList = await getSavedAddresses();
      setAddresses(updatedList.results || []);
      setShowAddressForm(false);
      resetAddressForm();
      setSuccessMessage("Address saved successfully!");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save address. Please check fields.";
      setAddressFormError(msg);
    } finally {
      setSubmittingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    try {
      await deleteSavedAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete address";
      alert("Failed to delete address: " + msg);
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await setDefaultAddress(id);
      const updated = await getSavedAddresses();
      setAddresses(updated.results || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to set default address";
      alert("Failed to set default address: " + msg);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F1E5] text-[#183D2B]">
      {/* Load Google Identity Services SDK */}
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="lazyOnload"
        onLoad={() => {
          const win = window as unknown as { google?: { accounts?: { id?: GoogleAccountsId } } };
          if (win.google?.accounts?.id && googleClientId && !profile) {
            try {
              win.google.accounts.id.initialize({
                client_id: googleClientId,
                callback: handleGoogleCredentialResponse,
              });
              const btn = document.getElementById("googleSignInBtn");
              if (btn) {
                win.google.accounts.id.renderButton(btn, {
                  theme: "outline",
                  size: "large",
                  text: "signin_with",
                });
              }
            } catch (e) {
              console.error(e);
            }
          }
        }}
      />

      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-28 w-full">
        {/* Banner Alert Messages */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-sm font-medium">{successMessage}</p>
          </div>
        )}

        {authError && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <p className="text-sm font-medium">{authError}</p>
          </div>
        )}

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-stone-500">
            <Loader2 className="w-8 h-8 animate-spin text-[#C07F00] mb-3" />
            <p className="text-sm">Loading your account...</p>
          </div>
        ) : !profile ? (
          /* ================= GUEST / LOGIN CARD ================= */
          <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-sm border border-stone-200 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-emerald-50 text-[#183D2B] rounded-full flex items-center justify-center">
              <User className="w-8 h-8" />
            </div>

            <h1 className="text-2xl font-bold text-[#183D2B] mb-2">Welcome to MilletMarg</h1>
            <p className="text-sm text-stone-600 mb-6">
              Sign in with your Google account to access your customer profile, saved delivery addresses, and fast checkout.
            </p>

            {/* Google Sign-in Container */}
            <div className="flex flex-col items-center justify-center min-h-[50px] mb-4">
              <div id="googleSignInBtn" className="inline-block" />
            </div>

            {!googleClientId && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 text-left">
                <p className="font-semibold mb-1">Configuration Note:</p>
                <p>
                  Google OAuth Client ID is not yet configured in <code className="bg-amber-100 px-1 py-0.5 rounded">.env</code>.
                  Please configure <code className="bg-amber-100 px-1 py-0.5 rounded">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> and backend <code className="bg-amber-100 px-1 py-0.5 rounded">GOOGLE_CLIENT_ID</code>.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* ================= AUTHENTICATED USER DASHBOARD ================= */
          <div className="space-y-8">
            {/* Header with Role & Logout */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-5">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#183D2B]">My Account</h1>
                <p className="text-xs sm:text-sm text-stone-600 mt-1">
                  Manage your personal details and delivery addresses.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-100 text-[#183D2B] border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {profile.role}
                </span>

                <Link
                  href="/orders"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 text-xs font-semibold transition shadow-sm"
                >
                  <Package className="w-3.5 h-3.5 text-[#C07F00]" />
                  My Orders
                </Link>

                {profile.role === "owner" && (
                  <Link
                    href="/owner"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#C07F00] text-white hover:bg-[#a06a00] text-xs font-bold transition shadow-sm"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Owner Dashboard
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 text-xs font-medium transition shadow-sm"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>

            {/* Profile Overview & Edit Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Profile Card */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col items-center text-center">
                <div className="relative w-20 h-20 rounded-full overflow-hidden mb-3 border-2 border-[#183D2B] bg-stone-100 flex items-center justify-center">
                  {profile.profile_image_url ? (
                    <Image
                      src={profile.profile_image_url}
                      alt={profile.display_name}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-stone-400" />
                  )}
                </div>

                <h2 className="text-lg font-bold text-stone-900">{profile.display_name || "Millet Foodie"}</h2>
                <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                  <Mail className="w-3 h-3" />
                  {profile.email}
                </p>

                {profile.phone_number && (
                  <p className="text-xs text-stone-600 flex items-center gap-1 mt-1 font-mono">
                    <Phone className="w-3 h-3" />
                    {profile.phone_number}
                  </p>
                )}
              </div>

              {/* Edit Profile Form */}
              <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                <h3 className="text-base font-semibold text-[#183D2B] mb-4">Edit Profile Information</h3>

                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        required
                        className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#183D2B] focus:border-transparent outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">
                        Phone Number (10 digits)
                      </label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#183D2B] focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Gender (Optional)
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#183D2B] focus:border-transparent outline-none bg-white"
                    >
                      <option value="">Prefer not to say</option>
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={updatingProfile}
                      className="inline-flex items-center gap-2 px-5 py-2 text-xs font-medium rounded-lg bg-[#183D2B] text-white hover:bg-[#23583e] active:scale-95 transition disabled:opacity-60 shadow-sm"
                    >
                      {updatingProfile && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* ================= SAVED ADDRESSES SECTION ================= */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div>
                  <h2 className="text-xl font-bold text-[#183D2B]">Saved Delivery Addresses</h2>
                  <p className="text-xs text-stone-600">Choose or add addresses for speedy cafe delivery.</p>
                </div>

                {!showAddressForm && (
                  <button
                    onClick={() => {
                      resetAddressForm();
                      if (profile) {
                        setRecipientName(profile.display_name);
                        setAddressPhone(profile.phone_number || "");
                      }
                      setShowAddressForm(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#C07F00] text-white hover:bg-[#a66d00] transition shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add New Address
                  </button>
                )}
              </div>

              {/* Add Address Interactive Modal / Form */}
              {showAddressForm && (
                <div className="bg-white p-6 rounded-2xl border-2 border-[#C07F00]/40 shadow-md">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-200">
                    <h3 className="text-base font-bold text-[#183D2B] flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-[#C07F00]" />
                      Add New Delivery Address
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="text-stone-400 hover:text-stone-600 text-sm"
                    >
                      Cancel
                    </button>
                  </div>

                  {addressFormError && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{addressFormError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveAddress} className="space-y-4">
                    {/* Map Selection */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-800 mb-1">
                        Select Location on Map
                      </label>
                      <AddressMapPicker onLocationSelect={handleLocationSelect} />
                    </div>

                    {/* Address Meta & Recipient Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-stone-700 mb-1">
                          Address Label
                        </label>
                        <select
                          value={label}
                          onChange={(e) => setLabel(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white"
                        >
                          <option value="Home">Home</option>
                          <option value="Work">Work</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-stone-700 mb-1">
                          Recipient Name *
                        </label>
                        <input
                          type="text"
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                          required
                          placeholder="e.g. Rahul Verma"
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-stone-700 mb-1">
                          Contact Phone *
                        </label>
                        <input
                          type="tel"
                          value={addressPhone}
                          onChange={(e) => setAddressPhone(e.target.value)}
                          required
                          placeholder="10-digit mobile number"
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg outline-none"
                        />
                      </div>
                    </div>

                    {/* Street Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-stone-700 mb-1">
                          Street / Area / Colony *
                        </label>
                        <input
                          type="text"
                          value={addressLine}
                          onChange={(e) => setAddressLine(e.target.value)}
                          required
                          placeholder="Road, colony, or area"
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-stone-700 mb-1">
                          House / Flat No.
                        </label>
                        <input
                          type="text"
                          value={houseNumber}
                          onChange={(e) => setHouseNumber(e.target.value)}
                          placeholder="e.g. 102, Silver Heights"
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg outline-none"
                        />
                      </div>
                    </div>

                    {/* Room, Landmark, Postal Code */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-stone-700 mb-1">
                          Room / Unit (Optional)
                        </label>
                        <input
                          type="text"
                          value={roomNumber}
                          onChange={(e) => setRoomNumber(e.target.value)}
                          placeholder="e.g. 4B"
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-stone-700 mb-1">
                          Landmark (Optional)
                        </label>
                        <input
                          type="text"
                          value={landmark}
                          onChange={(e) => setLandmark(e.target.value)}
                          placeholder="Near TI Mall"
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-stone-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          required
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-stone-700 mb-1">
                          PIN Code *
                        </label>
                        <input
                          type="text"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          required
                          placeholder="452001"
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg outline-none"
                        />
                      </div>
                    </div>

                    {/* Default Checkbox */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="isDefaultCheckbox"
                        checked={isDefault}
                        onChange={(e) => setIsDefault(e.target.checked)}
                        className="rounded text-[#183D2B] focus:ring-[#183D2B]"
                      />
                      <label htmlFor="isDefaultCheckbox" className="text-xs text-stone-700">
                        Set as my default delivery address
                      </label>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-800"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={submittingAddress}
                        className="inline-flex items-center gap-2 px-5 py-2 text-xs font-medium rounded-lg bg-[#183D2B] text-white hover:bg-[#23583e] active:scale-95 transition disabled:opacity-60 shadow-sm"
                      >
                        {submittingAddress && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        Save Address
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Address List */}
              {addresses.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center">
                  <MapPin className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-stone-700">No saved addresses yet</p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Add your delivery address to enjoy seamless ordering from MilletMarg Cafe.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`p-5 rounded-2xl bg-white border transition shadow-sm flex flex-col justify-between ${
                        addr.is_default
                          ? "border-[#183D2B] ring-1 ring-[#183D2B]/20"
                          : "border-stone-200 hover:border-stone-300"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-800">
                            {addr.label === "Home" && <Home className="w-3 h-3 text-[#183D2B]" />}
                            {addr.label === "Work" && <Briefcase className="w-3 h-3 text-[#C07F00]" />}
                            {addr.label}
                          </span>

                          {addr.is_default && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Default
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-sm text-stone-900">{addr.recipient_name}</h4>
                        <p className="text-xs text-stone-600 mt-0.5 font-mono">{addr.phone_number}</p>

                        <p className="text-xs text-stone-700 mt-2 leading-relaxed">
                          {addr.house_number && <span>{addr.house_number}, </span>}
                          {addr.room_number && <span>Unit {addr.room_number}, </span>}
                          {addr.address_line}
                          {addr.landmark && <span className="italic text-stone-500"> (Near {addr.landmark})</span>}
                          <br />
                          {addr.city}, {addr.state} — {addr.postal_code}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 mt-4 border-t border-stone-100 text-xs">
                        {!addr.is_default ? (
                          <button
                            onClick={() => addr.id && handleSetDefault(addr.id)}
                            className="text-[#183D2B] hover:underline font-medium"
                          >
                            Set as Default
                          </button>
                        ) : (
                          <span className="text-stone-400">Primary Delivery</span>
                        )}

                        <button
                          onClick={() => addr.id && handleDeleteAddress(addr.id)}
                          className="text-red-500 hover:text-red-700 inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
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
