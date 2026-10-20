"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ShoppingBag, Menu, X, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent background scroll when mobile menu or modals are open
  useEffect(() => {
    if (mobileMenuOpen || searchOpen || cartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [mobileMenuOpen, searchOpen, cartOpen]);

  const navLinks = [
    { name: "Home", href: "/", active: pathname === "/" },
    { name: "Products", href: "/products", active: pathname === "/products" },
    { name: "About Us", href: "/about", active: pathname === "/about" },
  ];

  const popularSearches = [
    "Signature MilletBowl",
    "Spiced Chickpea Bowl",
    "Foxtail Millet Khichdi",
    "Avocado & Supergrain Salad",
    "Millet Granola Parfait",
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? "bg-[#F7F1E5]/95 backdrop-blur-md shadow-xs border-b border-[#EDE2CF]/80 py-3.5"
            : "bg-[#F7F1E5] py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* LEFT: Logo & Brand Symbol */}
            <Link
              href="/"
              className="flex items-center gap-2.5 group focus:outline-hidden focus:ring-2 focus:ring-[#183D2B]/30 rounded-lg p-1"
              aria-label="MilletMarg Home"
            >
              {/* Botanical Millet Sprig Icon */}
              <div className="w-9 h-9 rounded-full bg-[#183D2B] flex items-center justify-center text-[#F7F1E5] transition-transform duration-300 group-hover:scale-105 shadow-xs">
                <svg
                  className="w-5 h-5 transition-transform duration-300 group-hover:rotate-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {/* Stem */}
                  <path d="M12 22V6" />
                  {/* Grains / botanical seeds */}
                  <path d="M12 7c-2-2-4-1-4 1s2 3 4 3" />
                  <path d="M12 7c2-2 4-1 4 1s-2 3-4 3" />
                  <path d="M12 12c-2-2-4-1-4 1s2 3 4 3" />
                  <path d="M12 12c2-2 4-1 4 1s-2 3-4 3" />
                  <path d="M12 17c-1.5-1.5-3-0.75-3 0.75s1.5 2.25 3 2.25" />
                  <path d="M12 17c1.5-1.5 3-0.75 3 0.75s-1.5 2.25-3 2.25" />
                  {/* Sun halo / seed top */}
                  <circle cx="12" cy="4" r="1.5" fill="currentColor" stroke="none" />
                </svg>
              </div>

              <div className="flex flex-col">
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#183D2B] leading-none">
                  MilletMarg
                </span>
                <span className="text-[10px] uppercase tracking-widest text-[#879568] font-medium mt-0.5">
                  Farm · Wellness
                </span>
              </div>
            </Link>

            {/* CENTER: Navigation Links (Desktop) */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm tracking-wide font-medium transition-colors duration-200 relative py-1.5 ${
                    link.active
                      ? "text-[#183D2B] font-semibold"
                      : "text-[#252820]/80 hover:text-[#183D2B]"
                  }`}
                >
                  {link.name}
                  {link.active && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#C66A45]" />
                  )}
                </Link>
              ))}
            </nav>

            {/* RIGHT: Actions (Search, Cart, Order Now) */}
            <div className="flex items-center space-x-2.5 sm:space-x-4">
              {/* Search Button */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="p-2 text-[#183D2B]/85 hover:text-[#183D2B] hover:bg-[#EDE2CF]/60 rounded-full transition-colors duration-200"
                aria-label="Search millet bowls and products"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Shopping Bag Button */}
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="relative p-2 text-[#183D2B]/85 hover:text-[#183D2B] hover:bg-[#EDE2CF]/60 rounded-full transition-colors duration-200"
                aria-label="Open cart"
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 text-[10px] font-bold bg-[#C66A45] text-white rounded-full flex items-center justify-center shadow-xs">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Primary CTA: Order Now */}
              <a
                href="/#order"
                className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-[#F7F1E5] bg-[#183D2B] hover:bg-[#10291E] rounded-full transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
              >
                Order Now
              </a>

              {/* Mobile Menu Toggle Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-[#183D2B] hover:bg-[#EDE2CF]/60 rounded-lg transition-colors duration-200"
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE MENU DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#10291E]/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Slide-down Panel */}
          <div className="relative bg-[#F7F1E5] border-b border-[#EDE2CF] px-6 pt-6 pb-8 shadow-xl flex flex-col space-y-6 z-10 animate-fade-in-up">
            <div className="flex items-center justify-between pb-4 border-b border-[#EDE2CF]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#183D2B] flex items-center justify-center text-[#F7F1E5]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="font-serif text-xl font-bold text-[#183D2B]">
                  MilletMarg
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-[#183D2B] hover:bg-[#EDE2CF] rounded-full"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Nav Links */}
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-lg font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-between ${
                    link.active
                      ? "bg-[#EDE2CF] text-[#183D2B] font-semibold"
                      : "text-[#252820] hover:bg-[#EDE2CF]/50"
                  }`}
                >
                  <span>{link.name}</span>
                  {link.active ? (
                    <span className="w-2 h-2 rounded-full bg-[#C66A45]" />
                  ) : (
                    <ChevronRightIcon className="w-4 h-4 text-[#879568]" />
                  )}
                </Link>
              ))}
            </div>

            {/* Mobile CTA */}
            <div className="pt-2">
              <a
                href="/#order"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 px-5 text-base font-semibold text-[#F7F1E5] bg-[#183D2B] hover:bg-[#10291E] rounded-full shadow-sm"
              >
                <span>Order Now</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Farm Tagline */}
            <p className="text-center text-xs text-[#879568] tracking-wide font-medium">
              Ancient Grains · Modern Wellness · Direct from Farms
            </p>
          </div>
        </div>
      )}

      {/* SEARCH MODAL */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
          <div
            className="fixed inset-0 bg-[#10291E]/50 backdrop-blur-xs transition-opacity"
            onClick={() => setSearchOpen(false)}
          />

          <div className="relative w-full max-w-xl bg-[#F7F1E5] rounded-2xl p-6 shadow-2xl border border-[#EDE2CF] z-10 animate-fade-in-up">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDE2CF]">
              <div className="flex items-center gap-3 flex-1">
                <Search className="w-5 h-5 text-[#879568]" />
                <input
                  type="text"
                  placeholder="Search bowls, ingredients, dressings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full bg-transparent text-[#183D2B] placeholder-[#879568] focus:outline-hidden text-base font-medium"
                />
              </div>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-1.5 text-[#183D2B]/70 hover:text-[#183D2B] rounded-md hover:bg-[#EDE2CF]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4">
              <p className="text-xs uppercase tracking-wider font-semibold text-[#879568] mb-2">
                Popular Searches
              </p>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setSearchQuery(item);
                    }}
                    className="text-xs px-3 py-1.5 rounded-full bg-[#EDE2CF] hover:bg-[#D8A641]/20 text-[#183D2B] font-medium transition-colors"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#EDE2CF] flex justify-between items-center text-xs text-[#879568]">
              <span>Press ESC to close</span>
              <a
                href="#milletbowl"
                onClick={() => setSearchOpen(false)}
                className="text-[#C66A45] font-semibold hover:underline"
              >
                View all menu items →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* CART PREVIEW DRAWER */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-[#10291E]/50 backdrop-blur-xs transition-opacity"
            onClick={() => setCartOpen(false)}
          />

          <div className="relative w-full max-w-md bg-[#F7F1E5] h-full shadow-2xl flex flex-col z-10 p-6 border-l border-[#EDE2CF] animate-fade-in-up">
            <div className="flex items-center justify-between pb-4 border-b border-[#EDE2CF]">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#183D2B]" />
                <h3 className="font-serif text-xl font-bold text-[#183D2B]">
                  Your Harvest Bag
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="p-2 text-[#183D2B] hover:bg-[#EDE2CF] rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto py-6 space-y-4">
              {cartCount > 0 ? (
                <div className="bg-white/70 rounded-2xl p-4 border border-[#EDE2CF] flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-[#EDE2CF] overflow-hidden flex-shrink-0 relative">
                    <img
                      src="/millet-bowl-hero.jpg"
                      alt="Signature MilletBowl"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-serif font-bold text-sm text-[#183D2B]">
                      Signature MilletBowl
                    </h4>
                    <p className="text-xs text-[#879568] mt-0.5">
                      Foxtail Millet · Roasted Chickpeas · Tahini
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-semibold text-[#183D2B]">
                        $14.50
                      </span>
                      <div className="flex items-center border border-[#EDE2CF] rounded-full px-2 py-0.5 text-xs bg-[#F7F1E5]">
                        <button
                          type="button"
                          onClick={() => setCartCount(Math.max(0, cartCount - 1))}
                          className="px-1 text-[#183D2B] font-bold"
                        >
                          -
                        </button>
                        <span className="px-2 font-medium">{cartCount}</span>
                        <button
                          type="button"
                          onClick={() => setCartCount(cartCount + 1)}
                          className="px-1 text-[#183D2B] font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-sm text-[#879568]">Your bag is currently empty.</p>
                  <a
                    href="#milletbowl"
                    onClick={() => setCartOpen(false)}
                    className="inline-block mt-3 text-sm text-[#C66A45] font-semibold hover:underline"
                  >
                    Add a MilletBowl →
                  </a>
                </div>
              )}

              {/* Free delivery perk */}
              <div className="bg-[#EDE2CF]/60 rounded-xl p-3 flex items-center gap-2.5 text-xs text-[#183D2B]">
                <CheckCircle2 className="w-4 h-4 text-[#879568] flex-shrink-0" />
                <span>Complimentary eco-friendly wooden spoon & napkin included.</span>
              </div>
            </div>

            {/* Cart Footer */}
            <div className="border-t border-[#EDE2CF] pt-4 space-y-3">
              <div className="flex justify-between text-sm font-medium text-[#252820]">
                <span>Subtotal</span>
                <span>${(cartCount * 14.5).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-[#879568]">
                <span>Taxes & Shipping calculated at checkout</span>
                <span className="text-[#879568]">Farm Fresh</span>
              </div>
              <a
                href="#order"
                onClick={() => setCartOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 px-5 text-sm font-semibold text-[#F7F1E5] bg-[#C66A45] hover:bg-[#B55A37] rounded-full shadow-md transition-all duration-200"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  );
}
