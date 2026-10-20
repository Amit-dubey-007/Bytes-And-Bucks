"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { MapPin, Navigation, Loader2, AlertCircle, Info } from "lucide-react";
import { reverseGeocode, GeocodingResult } from "@/lib/geocoding";
import type { Map as LeafletMap, Marker as LeafletMarker, LeafletMouseEvent } from "leaflet";

// Default shop coordinates (Indore, MP)
export const DEFAULT_SHOP_LAT = 22.6955176;
export const DEFAULT_SHOP_LNG = 75.8333253;

interface AddressMapPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number, geocoded?: GeocodingResult | null) => void;
}

export default function AddressMapPicker({
  initialLat = DEFAULT_SHOP_LAT,
  initialLng = DEFAULT_SHOP_LNG,
  onLocationSelect,
}: AddressMapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);

  // Keep latest onLocationSelect in a ref so callback changes don't re-trigger map effects
  const onLocationSelectRef = useRef(onLocationSelect);
  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);

  // Request counter to discard out-of-order reverse-geocoding responses
  const latestRequestIdRef = useRef(0);

  const [position, setPosition] = useState<[number, number]>([initialLat, initialLng]);
  const [locating, setLocating] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [geocodedAddress, setGeocodedAddress] = useState<string>("");

  const updateLocation = useCallback(async (lat: number, lng: number) => {
    const fixedLat = parseFloat(lat.toFixed(6));
    const fixedLng = parseFloat(lng.toFixed(6));
    setPosition([fixedLat, fixedLng]);
    setLocationError(null);

    const requestId = ++latestRequestIdRef.current;
    setGeocoding(true);

    try {
      const geoResult = await reverseGeocode(fixedLat, fixedLng);
      // Discard stale responses if a newer location was clicked in the meantime
      if (requestId !== latestRequestIdRef.current) return;

      if (geoResult?.formatted_address) {
        setGeocodedAddress(geoResult.formatted_address);
      }
      onLocationSelectRef.current(fixedLat, fixedLng, geoResult);
    } catch {
      if (requestId !== latestRequestIdRef.current) return;
      onLocationSelectRef.current(fixedLat, fixedLng, null);
    } finally {
      if (requestId === latestRequestIdRef.current) {
        setGeocoding(false);
      }
    }
  }, []);

  // Initialize Leaflet Map ONCE on mount
  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (!isMounted || !mapContainerRef.current) return;

      // Delivery location pin (emerald theme)
      const deliveryIcon = L.divIcon({
        className: "custom-delivery-marker",
        html: `
          <div style="background-color: #183D2B; color: #FFF; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2px solid #FFF;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -34],
      });

      // Shop marker (gold theme)
      const shopIcon = L.divIcon({
        className: "custom-shop-marker",
        html: `
          <div style="background-color: #C07F00; color: #FFF; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2px solid #FFF;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/>
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
              <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/>
              <path d="M2 7h20"/>
            </svg>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 14,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Add Shop marker (provisional reference point)
      L.marker([DEFAULT_SHOP_LAT, DEFAULT_SHOP_LNG], { icon: shopIcon })
        .addTo(map)
        .bindPopup("<strong>MilletMarg Cafe & Store</strong><br/>Provisional Delivery Hub, Indore");

      // Delivery location marker (draggable)
      const marker = L.marker([initialLat, initialLng], {
        icon: deliveryIcon,
        draggable: true,
      }).addTo(map);

      marker.bindPopup("<strong>Selected Delivery Location</strong><br/>Drag pin or click map to move").openPopup();

      // On marker drag
      marker.on("dragend", () => {
        const latLng = marker.getLatLng();
        updateLocation(latLng.lat, latLng.lng);
      });

      // On map click
      map.on("click", (e: LeafletMouseEvent) => {
        marker.setLatLng(e.latlng);
        updateLocation(e.latlng.lat, e.latlng.lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      // Initial reverse geocode only on initial mount
      updateLocation(initialLat, initialLng);
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
    // Only run on mount with initial coordinates
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUseCurrentLocation = () => {
    setLocationError(null);

    // Browser security check: Geolocation requires HTTPS or localhost
    if (typeof window !== "undefined") {
      const isLocalhost = Boolean(
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname === "[::1]"
      );
      if (!isLocalhost && window.location.protocol !== "https:") {
        setLocationError("Browser geolocation requires a secure HTTPS connection. Please select your location on the map.");
        return;
      }
    }

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your current browser.");
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 16, { duration: 1.0 });
          markerRef.current.setLatLng([lat, lng]);
          markerRef.current.openPopup();
        }
        updateLocation(lat, lng);
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError("Location permission denied. You can click on the map or type your address manually.");
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setLocationError("Location information is currently unavailable from your device. Please click on the map to set your pin.");
        } else if (err.code === err.TIMEOUT) {
          setLocationError("Location request timed out. Please select your location on the map.");
        } else {
          setLocationError("Unable to retrieve location. Please pin your location on the map.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  };

  return (
    <div className="space-y-3">
      {/* Action header and controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-stone-600">
          <Info className="w-4 h-4 text-[#C07F00] shrink-0" />
          <span>Click anywhere on the map or drag the pin to set your delivery point.</span>
        </div>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={locating}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#183D2B] text-white hover:bg-[#23583e] active:scale-95 transition-all disabled:opacity-60 shadow-sm"
        >
          {locating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Locating...</span>
            </>
          ) : (
            <>
              <Navigation className="w-3.5 h-3.5" />
              <span>Use My Location</span>
            </>
          )}
        </button>
      </div>

      {/* Geolocation warning/error alert */}
      {locationError && (
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
          <span>{locationError}</span>
        </div>
      )}

      {/* Map Container */}
      <div className="relative w-full h-64 sm:h-72 rounded-xl overflow-hidden border border-stone-300 shadow-inner bg-stone-100 z-0">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Coordinates Tag */}
        <div className="absolute bottom-2 left-2 z-[1000] bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded text-[11px] font-mono text-stone-700 shadow border border-stone-200 flex items-center gap-2">
          <span>Lat: {position[0].toFixed(5)}</span>
          <span>Lng: {position[1].toFixed(5)}</span>
          {geocoding && <Loader2 className="w-3 h-3 animate-spin text-[#C07F00]" />}
        </div>
      </div>

      {/* Geocoded Address Preview */}
      {geocodedAddress && (
        <div className="flex items-start gap-2 p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-700">
          <MapPin className="w-4 h-4 text-[#183D2B] mt-0.5 shrink-0" />
          <div>
            <span className="font-semibold text-stone-800">Detected Location:</span>{" "}
            <span>{geocodedAddress}</span>
          </div>
        </div>
      )}
    </div>
  );
}
