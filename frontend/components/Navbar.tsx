"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  ShoppingBag,
  User,
  Menu,
  X,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(1);

  // Handle navbar scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent background scrolling when overlays are open
  useEffect(() => {
    const shouldLockScroll = mobileMenuOpen || searchOpen || cartOpen;

    document.body.style.overflow = shouldLockScroll ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen, searchOpen, cartOpen]);

  // Close overlays when navigating to another page
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setCartOpen(false);
  }, [pathname]);

  // Close overlays using Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
        setSearchOpen(false);
        setCartOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  // Navigation links
  const navLinks = [
    {
      name: "Home",
      href: "/",
      active: pathname === "/",
    },
    {
      name: "Products",
      href: "/products",
      active: pathname === "/products",
    },
    {
      name: "About Us",
      href: "/about",
      active: pathname === "/about",
    },
    {
      name: "Contact Us",
      href: "/contact",
      active: pathname === "/contact",
    },
  ];

  // Popular searches
  const popularSearches = [
    "Signature MilletBowl",
    "Spiced Chickpea Bowl",
    "Foxtail Millet Khichdi",
    "Avocado & Supergrain Salad",
    "Millet Granola Parfait",
  ];

  return (
    <>
      {/* MAIN NAVBAR */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? "border-b border-[#EDE2CF]/80 bg-[#F7F1E5]/95 py-3.5 shadow-sm backdrop-blur-md"
            : "bg-[#F7F1E5] py-5"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* LOGO */}
            <Link
              href="/"
              className="flex items-center rounded-lg focus:outline-none focus:ring-2 focus:ring-[#183D2B]/30"
              aria-label="MilletMarg Home"
            >
              <Image
                src="/logo.png"
                alt="MilletMarg - Farm and Wellness"
                width={220}
                height={70}
                priority
                className="h-12 w-auto object-contain sm:h-14"
              />
            </Link>

            {/* DESKTOP NAVIGATION */}
            <nav
              className="hidden items-center space-x-6 lg:space-x-8 md:flex"
              aria-label="Main navigation"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  aria-current={link.active ? "page" : undefined}
                  className={`relative py-1.5 text-sm font-medium tracking-wide transition-colors duration-200 ${
                    link.active
                      ? "font-semibold text-[#183D2B]"
                      : "text-[#252820]/80 hover:text-[#183D2B]"
                  }`}
                >
                  {link.name}

                  {link.active && (
                    <span className="absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#C66A45]" />
                  )}
                </Link>
              ))}
            </nav>

            {/* RIGHT ACTIONS */}
            <div className="flex items-center space-x-2.5 sm:space-x-4">
              {/* SEARCH BUTTON */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="rounded-full p-2 text-[#183D2B]/85 transition-colors duration-200 hover:bg-[#EDE2CF]/60 hover:text-[#183D2B]"
                aria-label="Open search"
                title="Search products"
              >
                <Search className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>

              {/* ORDERS LINK (Cart type symbol next to search redirects to orders page) */}
              <Link
                href="/orders"
                className="relative rounded-full p-2 text-[#183D2B]/85 transition-colors duration-200 hover:bg-[#EDE2CF]/60 hover:text-[#183D2B]"
                aria-label="My Orders"
                title="My Orders"
              >
                <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>

              {/* PROFILE LINK */}
              <Link
                href="/profile"
                className="rounded-full p-2 text-[#183D2B]/85 transition-colors duration-200 hover:bg-[#EDE2CF]/60 hover:text-[#183D2B]"
                aria-label="My Profile"
                title="My Profile"
              >
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>

              {/* ORDER NOW */}
              <Link
                href="/products"
                className="hidden items-center justify-center rounded-full bg-[#183D2B] px-5 py-2.5 text-sm font-medium text-[#F7F1E5] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#10291E] hover:shadow-md sm:inline-flex"
              >
                Order Now
              </Link>

              {/* MOBILE MENU BUTTON */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="rounded-lg p-2 text-[#183D2B] transition-colors duration-200 hover:bg-[#EDE2CF]/60 md:hidden"
                aria-expanded={mobileMenuOpen}
                aria-label={
                  mobileMenuOpen
                    ? "Close navigation menu"
                    : "Open navigation menu"
                }
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col md:hidden">
          {/* BACKDROP */}
          <button
            type="button"
            className="fixed inset-0 bg-[#10291E]/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation menu"
          />

          {/* MENU PANEL */}
          <div className="animate-fade-in-up relative z-10 flex flex-col space-y-6 border-b border-[#EDE2CF] bg-[#F7F1E5] px-6 pb-8 pt-6 shadow-xl">
            {/* MOBILE LOGO */}
            <div className="flex items-center justify-between border-b border-[#EDE2CF] pb-4">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="MilletMarg Home"
                className="flex items-center"
              >
                <Image
                  src="/logo.png"
                  alt="MilletMarg"
                  width={180}
                  height={58}
                  className="h-10 w-auto object-contain"
                />
              </Link>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-full p-2 text-[#183D2B] hover:bg-[#EDE2CF]"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* MOBILE NAVIGATION LINKS */}
            <nav
              className="flex flex-col space-y-3"
              aria-label="Mobile navigation"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={link.active ? "page" : undefined}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-lg font-medium transition-colors ${
                    link.active
                      ? "bg-[#EDE2CF] font-semibold text-[#183D2B]"
                      : "text-[#252820] hover:bg-[#EDE2CF]/50"
                  }`}
                >
                  <span>{link.name}</span>

                  {link.active ? (
                    <span className="h-2 w-2 rounded-full bg-[#C66A45]" />
                  ) : (
                    <ChevronRightIcon className="h-4 w-4 text-[#879568]" />
                  )}
                </Link>
              ))}

              <Link
                href="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-lg font-medium transition-colors ${
                  pathname === "/orders"
                    ? "bg-[#EDE2CF] font-semibold text-[#183D2B]"
                    : "text-[#252820] hover:bg-[#EDE2CF]/50"
                }`}
              >
                <span>My Orders</span>
                <ChevronRightIcon className="h-4 w-4 text-[#879568]" />
              </Link>

              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-lg font-medium transition-colors ${
                  pathname === "/profile"
                    ? "bg-[#EDE2CF] font-semibold text-[#183D2B]"
                    : "text-[#252820] hover:bg-[#EDE2CF]/50"
                }`}
              >
                <span>My Profile</span>
                <ChevronRightIcon className="h-4 w-4 text-[#879568]" />
              </Link>
            </nav>

            {/* MOBILE SEARCH */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setSearchOpen(true);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-[#183D2B]/20 py-3 text-sm font-semibold text-[#183D2B] transition-colors hover:bg-[#EDE2CF]/60"
            >
              <Search className="h-4 w-4" />
              Search Products
            </button>

            {/* MOBILE ORDER BUTTON */}
            <div className="pt-2">
              <Link
                href="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#183D2B] px-5 py-3 text-base font-semibold text-[#F7F1E5] shadow-sm hover:bg-[#10291E]"
              >
                <span>Order Now</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* BRAND TAGLINE */}
            <p className="text-center text-xs font-medium tracking-wide text-[#879568]">
              Ancient Grains · Modern Wellness · Direct from Farms
            </p>
          </div>
        </div>
      )}

      {/* SEARCH MODAL */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-16 sm:pt-24">
          {/* BACKDROP */}
          <button
            type="button"
            className="fixed inset-0 bg-[#10291E]/50 backdrop-blur-sm"
            onClick={() => setSearchOpen(false)}
            aria-label="Close search"
          />

          {/* SEARCH PANEL */}
          <div className="animate-fade-in-up relative z-10 w-full max-w-xl rounded-2xl border border-[#EDE2CF] bg-[#F7F1E5] p-6 shadow-2xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
                  setSearchOpen(false);
                }
              }}
              className="flex items-center justify-between border-b border-[#EDE2CF] pb-3"
            >
              <div className="flex flex-1 items-center gap-3">
                <button type="submit" aria-label="Search products">
                  <Search className="h-5 w-5 text-[#879568] hover:text-[#183D2B] transition-colors cursor-pointer" />
                </button>

                <input
                  type="text"
                  placeholder="Search bowls, ingredients, snacks..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  autoFocus
                  className="w-full bg-transparent text-base font-medium text-[#183D2B] placeholder-[#879568] focus:outline-none"
                  aria-label="Search products"
                />
              </div>

              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="rounded-md p-1.5 text-[#183D2B]/70 hover:bg-[#EDE2CF] hover:text-[#183D2B]"
                aria-label="Close search"
              >
                <X className="h-5 w-5" />
              </button>
            </form>

            {/* POPULAR SEARCHES */}
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#879568]">
                Popular Searches
              </p>

              <div className="flex flex-wrap gap-2">
                {popularSearches.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setSearchQuery(item);
                      router.push(`/products?search=${encodeURIComponent(item)}`);
                      setSearchOpen(false);
                    }}
                    className="rounded-full px-3 py-1.5 text-xs font-medium bg-[#EDE2CF] text-[#183D2B] hover:bg-[#D8A641]/20 transition-colors"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* SEARCH FOOTER */}
            <div className="mt-6 flex items-center justify-between border-t border-[#EDE2CF] pt-4 text-xs text-[#879568]">
              <span>Press Enter or ESC</span>

              <Link
                href="/products"
                onClick={() => setSearchOpen(false)}
                className="font-semibold text-[#C66A45] hover:underline"
              >
                View all products →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* CART PREVIEW DRAWER */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* BACKDROP */}
          <button
            type="button"
            className="fixed inset-0 bg-[#10291E]/50 backdrop-blur-sm"
            onClick={() => setCartOpen(false)}
            aria-label="Close cart"
          />

          {/* CART PANEL */}
          <div className="animate-fade-in-up relative z-10 flex h-full w-full max-w-md flex-col border-l border-[#EDE2CF] bg-[#F7F1E5] p-6 shadow-2xl">
            {/* CART HEADER */}
            <div className="flex items-center justify-between border-b border-[#EDE2CF] pb-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-[#183D2B]" />

                <h3 className="font-serif text-xl font-bold text-[#183D2B]">
                  Your Harvest Bag
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="rounded-full p-2 text-[#183D2B] hover:bg-[#EDE2CF]"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* CART ITEMS */}
            <div className="flex-1 space-y-4 overflow-y-auto py-6">
              {cartCount > 0 ? (
                <div className="flex items-center gap-4 rounded-2xl border border-[#EDE2CF] bg-white/70 p-4">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-[#EDE2CF]">
                    <Image
                      src="/millet-bowl-hero.jpg"
                      alt="Signature MilletBowl"
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <h4 className="font-serif text-sm font-bold text-[#183D2B]">
                      Signature MilletBowl
                    </h4>

                    <p className="mt-0.5 text-xs text-[#879568]">
                      Foxtail Millet · Roasted Chickpeas · Tahini
                    </p>

                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm font-semibold text-[#183D2B]">
                        ₹{(cartCount * 14.5).toFixed(2)}
                      </span>

                      <div className="flex items-center rounded-full border border-[#EDE2CF] bg-[#F7F1E5] px-2 py-0.5 text-xs">
                        <button
                          type="button"
                          onClick={() =>
                            setCartCount(Math.max(0, cartCount - 1))
                          }
                          className="px-1 font-bold text-[#183D2B]"
                          aria-label="Remove one item"
                        >
                          −
                        </button>

                        <span className="px-2 font-medium">{cartCount}</span>

                        <button
                          type="button"
                          onClick={() => setCartCount(cartCount + 1)}
                          className="px-1 font-bold text-[#183D2B]"
                          aria-label="Add one item"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <ShoppingBag className="mx-auto h-10 w-10 text-[#879568]/60" />

                  <p className="mt-3 text-sm text-[#879568]">
                    Your bag is currently empty.
                  </p>

                  <Link
                    href="/products"
                    onClick={() => setCartOpen(false)}
                    className="mt-3 inline-block text-sm font-semibold text-[#C66A45] hover:underline"
                  >
                    Explore our products →
                  </Link>
                </div>
              )}

              {/* CART PERK */}
              {cartCount > 0 && (
                <div className="flex items-center gap-2.5 rounded-xl bg-[#EDE2CF]/60 p-3 text-xs text-[#183D2B]">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#879568]" />

                  <span>
                    Complimentary eco-friendly wooden spoon and napkin
                    included.
                  </span>
                </div>
              )}
            </div>

            {/* CART FOOTER */}
            {cartCount > 0 && (
              <div className="space-y-3 border-t border-[#EDE2CF] pt-4">
                <div className="flex justify-between text-sm font-medium text-[#252820]">
                  <span>Subtotal</span>
                  <span>₹{(cartCount * 14.5).toFixed(2)}</span>
                </div>

                <p className="text-xs text-[#879568]">
                  Taxes and delivery details will be confirmed when ordering.
                </p>

                <Link
                  href="/#order"
                  onClick={() => setCartOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#C66A45] px-5 py-3 text-sm font-semibold text-[#F7F1E5] shadow-md transition-all duration-200 hover:bg-[#B55A37]"
                >
                  <span>Continue to Ordering</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// Chevron icon for navigation links
function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m8.25 4.5 7.5 7.5-7.5 7.5"
      />
    </svg>
  );
}