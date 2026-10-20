import React from "react";
import Image from "next/image";
import { ArrowRight, ShoppingBag, Store, Sparkles, Clock, ShieldCheck, Heart } from "lucide-react";

// Official platform ordering destination placeholders
// Replace these with official MilletMarg store URLs when live listings are published
const ZOMATO_URL = "https://www.zomato.com";
const SWIGGY_URL = "https://www.swiggy.com";

export default function OrderMilletMargSection() {
  const orderingOptions = [
    {
      id: "zomato",
      title: "Order on Zomato",
      tagline: "Doorstep delivery in 30–45 mins",
      perk: "Live tracking & restaurant partner offers",
      buttonText: "Order on Zomato",
      href: ZOMATO_URL,
      isExternal: true,
      cardBg: "from-[#FFF5F5] to-[#FFF0F0]",
      accentColor: "#E23744",
      renderVisual: () => (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#FFF7F7] to-[#FFEFEF] rounded-2xl border border-[#FCD8D8] relative overflow-hidden group-hover:border-[#E23744]/40 transition-colors">
          {/* Subtle decorative circles */}
          <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-[#E23744]/5 blur-lg pointer-events-none" />
          
          {/* Official Zomato Badge & Wordmark */}
          <div className="w-full max-w-[160px] aspect-[160/52] relative flex items-center justify-center">
            <svg
              viewBox="0 0 160 52"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full drop-shadow-xs"
              aria-label="Zomato logo"
            >
              <rect width="160" height="52" rx="14" fill="#E23744" />
              <text
                x="50%"
                y="54%"
                dominantBaseline="middle"
                textAnchor="middle"
                fill="#FFFFFF"
                fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                fontWeight="900"
                fontStyle="italic"
                fontSize="29"
                letterSpacing="-1.2px"
              >
                zomato
              </text>
            </svg>
          </div>

          <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-[#E23744]">
            <Clock className="w-3.5 h-3.5" />
            <span>30–45 Mins Average</span>
          </div>
        </div>
      ),
    },
    {
      id: "swiggy",
      title: "Order on Swiggy",
      tagline: "Lightning-fast local courier",
      perk: "Contactless delivery with live rider map",
      buttonText: "Order on Swiggy",
      href: SWIGGY_URL,
      isExternal: true,
      cardBg: "from-[#FFF8F0] to-[#FFF2E6]",
      accentColor: "#FC8019",
      renderVisual: () => (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#FFF9F2] to-[#FFF3E6] rounded-2xl border border-[#FCE6D2] relative overflow-hidden group-hover:border-[#FC8019]/40 transition-colors">
          {/* Subtle decorative circle */}
          <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-[#FC8019]/5 blur-lg pointer-events-none" />

          {/* Official Swiggy Badge & Wordmark */}
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#FC8019] shadow-xs">
            {/* Authentic Swiggy Location Pin Symbol */}
            <svg
              className="w-7 h-7 text-white fill-current"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 2C7.58 2 4 5.58 4 10c0 5.25 7.15 11.45 7.45 11.71.32.28.78.28 1.1 0 .3-.26 7.45-6.46 7.45-11.71 0-4.42-3.58-8-8-8zm0 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
            </svg>
            <span
              className="text-white text-xl font-black tracking-tight"
              style={{
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                letterSpacing: "0.5px",
              }}
            >
              SWIGGY
            </span>
          </div>

          <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-[#FC8019]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Swiggy One Benefits</span>
          </div>
        </div>
      ),
    },
    {
      id: "direct",
      title: "Direct Ordering",
      tagline: "Exclusive perks & direct support",
      perk: "15% off first bowl + complimentary spoon",
      buttonText: "Order Directly",
      href: "#milletbowl",
      isExternal: false,
      cardBg: "from-[#F7F3EB] to-[#EFE8DA]",
      accentColor: "#183D2B",
      isHighlighted: true,
      renderVisual: () => (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#F9F5EC] to-[#EDE4D2] rounded-2xl border border-[#DFD5C0] relative overflow-hidden group-hover:border-[#183D2B]/50 transition-colors">
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#183D2B] text-[#F7F1E5] text-[10px] font-bold uppercase tracking-wider">
            Best Value
          </span>

          {/* Photo of artisan MilletBowl */}
          <div className="relative w-28 h-28 rounded-full overflow-hidden shadow-md ring-2 ring-[#183D2B]/15">
            <Image
              src="/millet-bowl-hero.jpg"
              alt="MilletMarg Signature MilletBowl"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-[#183D2B]">
            <Heart className="w-3.5 h-3.5 text-[#C66A45]" />
            <span>Kitchen Direct Freshness</span>
          </div>
        </div>
      ),
    },
    {
      id: "takeaway",
      title: "Takeaway & Pickup",
      tagline: "Order ahead & collect hot",
      perk: "Zero waiting time at the cafe counter",
      buttonText: "Order for Pickup",
      href: "#contact",
      isExternal: false,
      cardBg: "from-[#F6F4ED] to-[#EAE6D8]",
      accentColor: "#879568",
      renderVisual: () => (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#FAF8F2] to-[#ECE8DC] rounded-2xl border border-[#DFD8C4] relative overflow-hidden group-hover:border-[#879568]/50 transition-colors">
          {/* Artisan Takeaway Craft Bag & Bowl Illustration */}
          <div className="w-20 h-20 rounded-2xl bg-white/80 shadow-xs flex items-center justify-center text-[#183D2B] border border-[#EDE2CF]">
            <div className="relative flex items-center justify-center">
              <Store className="w-10 h-10 text-[#183D2B]" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#D8A641] text-[#183D2B] flex items-center justify-center text-xs font-bold shadow-xs">
                🌾
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-[#879568]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Ready in 15 Mins</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section
      id="about"
      className="py-20 lg:py-28 bg-[#FAF2E6] border-b border-[#EDE2CF]/70 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* SECTION HEADING */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#183D2B] tracking-tight leading-tight">
            Enjoy MilletMarg Your Way
          </h2>

          {/* Short Terracotta Underline */}
          <div className="flex justify-center mt-2.5">
            <svg
              className="w-28 sm:w-36 h-3 text-[#C66A45]"
              viewBox="0 0 140 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M3 8 C 45 2, 95 10, 137 5"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Supporting Text */}
          <p className="mt-3.5 text-base sm:text-lg text-[#252820]/75 font-normal leading-relaxed">
            Your favourite millet creations are just a click away.
          </p>
        </div>

        {/* FOUR ORDERING CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-6 xl:gap-8 mt-12 lg:mt-16">
          {orderingOptions.map((option) => (
            <div
              key={option.id}
              className={`group flex flex-col justify-between rounded-3xl p-5 sm:p-6 bg-white/70 hover:bg-white border border-[#EDE2CF] shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 ${
                option.isHighlighted
                  ? "ring-2 ring-[#C66A45]/30 shadow-sm"
                  : ""
              }`}
            >
              {/* TOP: Visual Showcase Area */}
              <div>
                <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-5">
                  {option.renderVisual()}
                </div>

                {/* Card Title & Value Props */}
                <h3 className="font-serif font-bold text-lg sm:text-xl text-[#183D2B] group-hover:text-[#C66A45] transition-colors">
                  {option.title}
                </h3>
                <p className="text-xs sm:text-sm font-medium text-[#252820]/80 mt-1 leading-snug">
                  {option.tagline}
                </p>
                <p className="text-[11px] text-[#879568] mt-1.5 leading-snug">
                  {option.perk}
                </p>
              </div>

              {/* BOTTOM: Action Button */}
              <div className="mt-6 pt-4 border-t border-[#EDE2CF]/60">
                <a
                  href={option.href}
                  target={option.isExternal ? "_blank" : undefined}
                  rel={option.isExternal ? "noopener noreferrer" : undefined}
                  className={`w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 shadow-xs hover:shadow-md active:translate-y-0 ${
                    option.id === "direct"
                      ? "bg-[#C66A45] hover:bg-[#B24B28] text-white hover:-translate-y-0.5"
                      : "bg-[#183D2B] hover:bg-[#10291E] text-white hover:-translate-y-0.5"
                  }`}
                >
                  <span>{option.buttonText}</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Subtext info pill */}
        <div className="mt-12 text-center">
          <p className="inline-flex items-center gap-2 text-xs sm:text-sm text-[#879568] font-medium bg-[#EDE2CF]/50 px-5 py-2 rounded-full border border-[#EDE2CF]">
            <span>🌱</span>
            <span>All meals packed fresh in 100% eco-friendly compostable containers</span>
          </p>
        </div>

      </div>
    </section>
  );
}
