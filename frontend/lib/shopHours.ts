/**
 * shopHours.ts
 * Utility to check if the MilletMarg café is currently open.
 *
 * Business hours (IST):
 *   Monday – Friday : 09:00 – 21:00
 *   Saturday – Sunday: CLOSED
 *
 * Time is checked only when this function is CALLED (e.g. on button click),
 * not continuously — so there is zero polling overhead.
 */

export interface ShopStatus {
  isOpen: boolean;
  reason: string; // human-readable reason when closed
}

/**
 * Returns whether the shop is open RIGHT NOW (IST).
 * Call this on-demand (e.g. on button click or page load).
 */
export function getShopStatus(): ShopStatus {
  // Always use IST (UTC+5:30) regardless of user's local timezone
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );

  const day = now.getDay(); // 0 = Sunday, 6 = Saturday
  const hour = now.getHours();
  const minute = now.getMinutes();
  const currentMinutes = hour * 60 + minute;

  // Saturday (6) or Sunday (0) → always closed
  if (day === 0 || day === 6) {
    return {
      isOpen: false,
      reason: "Our café is closed on weekends (Saturday & Sunday). We're open Monday–Friday, 9 AM – 9 PM IST.",
    };
  }

  // Weekday: open 09:00–21:00 (540–1260 minutes)
  const openMinutes = 9 * 60;   // 09:00
  const closeMinutes = 21 * 60; // 21:00

  if (currentMinutes < openMinutes) {
    return {
      isOpen: false,
      reason: "Our café hasn't opened yet today. We open at 9:00 AM IST, Monday–Friday.",
    };
  }

  if (currentMinutes >= closeMinutes) {
    return {
      isOpen: false,
      reason: "Our café is closed for the day. We're open Monday–Friday, 9 AM – 9 PM IST.",
    };
  }

  return { isOpen: true, reason: "" };
}

/**
 * Convenience boolean — true only if shop is open AND product is available.
 */
export function isProductOrderable(productIsAvailable: boolean): boolean {
  if (!productIsAvailable) return false;
  return getShopStatus().isOpen;
}
