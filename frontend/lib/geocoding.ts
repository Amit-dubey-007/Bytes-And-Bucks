/**
 * Geocoding service using OpenStreetMap Nominatim.
 * Complies with Nominatim usage policy:
 * - Specific User-Agent header
 * - Rate-limited to max 1 request/second
 * - Cached to prevent repeated queries
 * - Graceful fallback to manual input if rate-limited or offline
 */

export interface GeocodingResult {
  formatted_address: string;
  road?: string;
  house_number?: string;
  neighbourhood?: string;
  suburb?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

const geocodeCache = new Map<string, GeocodingResult>();
let lastRequestTime = 0;

export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<GeocodingResult | null> {
  const cacheKey = `${latitude.toFixed(5)},${longitude.toFixed(5)}`;
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!;
  }

  // Throttle to respect Nominatim policy (1 req/sec)
  const now = Date.now();
  const timeSinceLast = now - lastRequestTime;
  if (timeSinceLast < 1000) {
    await new Promise((res) => setTimeout(res, 1000 - timeSinceLast));
  }
  lastRequestTime = Date.now();

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "MilletMarg-Store/1.0 (contact@milletmarg.com)",
      },
    });

    if (!response.ok) {
      console.warn(`Geocoding HTTP error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const addr = data.address || {};

    const city =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.municipality ||
      addr.county ||
      "Indore";
    const state = addr.state || "Madhya Pradesh";
    const postal_code = addr.postcode || "";
    const country = addr.country || "India";

    const road = addr.road || addr.pedestrian || addr.street || "";
    const house_number = addr.house_number || "";
    const neighbourhood = addr.neighbourhood || addr.suburb || addr.residential || "";

    const result: GeocodingResult = {
      formatted_address: data.display_name || "",
      road,
      house_number,
      neighbourhood,
      suburb: addr.suburb || "",
      city,
      state,
      postal_code,
      country,
    };

    geocodeCache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.warn("Reverse geocoding failed or network offline:", err);
    return null;
  }
}
