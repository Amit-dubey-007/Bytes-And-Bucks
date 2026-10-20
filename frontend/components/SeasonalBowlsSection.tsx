"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

export default function SeasonalBowlsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [isInteractive, setIsInteractive] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

    if (prefersReducedMotion || isTouchDevice) {
      setIsInteractive(false);
      return;
    }

    setIsInteractive(true);
    let isRunning = true;

    const animatePhysics = () => {
      if (!isRunning) return;

      const target = targetRef.current;
      const current = currentRef.current;

      // Gentle damping factor (0.05 for fluid, subtle motion)
      current.x += (target.x - current.x) * 0.05;
      current.y += (target.y - current.y) * 0.05;

      setMouseOffset({
        x: Math.round(current.x * 100) / 100,
        y: Math.round(current.y * 100) / 100,
      });

      rafRef.current = requestAnimationFrame(animatePhysics);
    };

    rafRef.current = requestAnimationFrame(animatePhysics);

    return () => {
      isRunning = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Subtle mouse movement tracking with controlled range to prevent any overlap
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!isInteractive || !sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const normY = ((e.clientY - rect.top) / rect.height) * 2 - 1;

    // Constrained parallax range (max 5-6px movement)
    targetRef.current = {
      x: normX * 6,
      y: normY * 5,
    };
  };

  const handleMouseLeave = () => {
    targetRef.current = { x: 0, y: 0 };
  };

  return (
    <section
      ref={sectionRef}
      id="menu"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative overflow-hidden bg-[#FBF4EA] py-16 sm:py-20 lg:py-28 select-none border-y border-[#EDE2CF]/70"
    >
      {/* Background Subtle Organic Curved Terracotta Connecting Lines (routing around text) */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none -z-10 overflow-hidden"
        aria-hidden="true"
      >
        <svg
          className="w-full h-full opacity-45"
          viewBox="0 0 1440 600"
          fill="none"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main sweeping terracotta line curving gracefully behind food and around center */}
          <path
            d="M -20,480 C 120,470 180,390 150,290 C 120,200 200,90 280,100 C 340,110 320,190 240,210 C 160,230 150,140 220,90 C 310,40 460,70 540,80 C 900,50 1020,40 1140,70 C 1280,90 1380,190 1350,300 C 1310,440 1180,490 1460,460"
            stroke="#C66A45"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          {/* Gentle secondary loop in bottom corner */}
          <path
            d="M 60,540 C 160,560 220,510 260,470"
            stroke="#C66A45"
            strokeWidth="1"
            opacity="0.3"
            strokeLinecap="round"
          />
          <path
            d="M 1180,510 C 1260,540 1360,510 1420,450"
            stroke="#C66A45"
            strokeWidth="1"
            opacity="0.3"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* DESKTOP COMPOSITION CONTAINER */}
        <div className="relative min-h-[480px] lg:min-h-[540px] xl:min-h-[580px] flex items-center justify-center">

          {/* ========================================================= */}
          {/* 1. LEFT: Colourful Artisan MilletBowl                     */}
          {/* Scaled down to prevent overlapping central text           */}
          {/* ========================================================= */}
          <div
            className="hidden lg:block absolute left-2 xl:left-6 top-1/2 -translate-y-1/2 w-[240px] xl:w-[280px] aspect-[640/600] z-10 transition-transform duration-200 ease-out animate-float"
            style={{
              transform: `translate3d(${mouseOffset.x * 0.7}px, ${-50 + mouseOffset.y * 0.7}%, 0)`,
            }}
          >
            <div className="relative w-full h-full transition-transform duration-500 ease-out hover:scale-105">
              <picture>
                <source srcSet="/millet-seasonal-bowl.webp" type="image/webp" />
                <Image
                  src="/millet-seasonal-bowl.png"
                  alt="Colourful artisan MilletBowl with cooked millets, chickpeas, roasted sweet potato, edamame, and avocado"
                  fill
                  sizes="(max-width: 1280px) 240px, 280px"
                  className="object-contain drop-shadow-md select-none pointer-events-none"
                />
              </picture>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 2. TOP RIGHT: Warm Chickpea & Millet Pilaf Bowl           */}
          {/* Scaled and positioned in upper-right quadrant             */}
          {/* ========================================================= */}
          <div
            className="hidden lg:block absolute right-24 xl:right-36 top-1 xl:top-3 w-[150px] xl:w-[175px] aspect-[370/362] z-10 transition-transform duration-200 ease-out animate-float-reverse"
            style={{
              transform: `translate3d(${-mouseOffset.x * 0.6}px, ${-mouseOffset.y * 0.6}px, 0)`,
            }}
          >
            <div className="relative w-full h-full transition-transform duration-500 ease-out hover:scale-105">
              <picture>
                <source srcSet="/millet-chickpea-bowl.webp" type="image/webp" />
                <Image
                  src="/millet-chickpea-bowl.png"
                  alt="Warm wooden bowl with spiced chickpeas, millets, fresh coriander, and lemon"
                  fill
                  sizes="(max-width: 1280px) 150px, 175px"
                  className="object-contain drop-shadow-md select-none pointer-events-none"
                />
              </picture>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 3. FAR RIGHT: Millet-based Drink (Fluted Glass Smoothie)   */}
          {/* Positioned on outer perimeter without overlapping text     */}
          {/* ========================================================= */}
          <div
            className="hidden lg:block absolute right-1 xl:right-4 top-24 xl:top-28 w-[100px] xl:w-[115px] aspect-[240/392] z-10 transition-transform duration-200 ease-out animate-float"
            style={{
              transform: `translate3d(${mouseOffset.x * 0.65}px, ${-mouseOffset.y * 0.65}px, 0)`,
            }}
          >
            <div className="relative w-full h-full transition-transform duration-500 ease-out hover:scale-105">
              <picture>
                <source srcSet="/millet-drink.webp" type="image/webp" />
                <Image
                  src="/millet-drink.png"
                  alt="Creamy millet smoothie in a fluted glass garnished with pistachios and saffron"
                  fill
                  sizes="(max-width: 1280px) 100px, 115px"
                  className="object-contain drop-shadow-md select-none pointer-events-none"
                />
              </picture>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 4. BOTTOM RIGHT: Millet Dosa with Chutney & Sambar        */}
          {/* Positioned cleanly in lower-right quadrant                 */}
          {/* ========================================================= */}
          <div
            className="hidden lg:block absolute right-12 xl:right-20 bottom-1 xl:bottom-3 w-[220px] xl:w-[255px] aspect-[526/414] z-10 transition-transform duration-200 ease-out animate-float-reverse"
            style={{
              transform: `translate3d(${-mouseOffset.x * 0.6}px, ${mouseOffset.y * 0.6}px, 0)`,
            }}
          >
            <div className="relative w-full h-full transition-transform duration-500 ease-out hover:scale-105">
              <picture>
                <source srcSet="/millet-dosa-plate.webp" type="image/webp" />
                <Image
                  src="/millet-dosa-plate.png"
                  alt="Crispy golden millet dosa served on ceramic plate with coconut chutney and hot sambar"
                  fill
                  sizes="(max-width: 1280px) 220px, 255px"
                  className="object-contain drop-shadow-md select-none pointer-events-none"
                />
              </picture>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 5. SUBTLE DECORATIVE LEAVES & INGREDIENT FLOURISHES       */}
          {/* Restrained positioning outside the central text box       */}
          {/* ========================================================= */}
          {/* Leaf near top left */}
          <div
            className="hidden lg:block absolute left-8 top-10 w-6 h-6 pointer-events-none z-10 opacity-70"
            style={{
              transform: `translate3d(${mouseOffset.x * 0.9}px, ${mouseOffset.y * 0.9}px, 0)`,
            }}
            aria-hidden="true"
          >
            <span className="text-xl">🌿</span>
          </div>

          {/* Chickpea accent left */}
          <div
            className="hidden lg:block absolute left-48 bottom-16 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-[#D8A641] to-[#AA7428] shadow-xs pointer-events-none z-10 opacity-80"
            style={{
              transform: `translate3d(${-mouseOffset.x * 0.8}px, ${-mouseOffset.y * 0.8}px, 0)`,
            }}
            aria-hidden="true"
          />

          {/* Herb sprig near top-right bowl */}
          <div
            className="hidden lg:block absolute right-20 top-8 w-6 h-6 pointer-events-none z-10 opacity-70"
            style={{
              transform: `translate3d(${mouseOffset.x * 0.8}px, ${-mouseOffset.y * 0.8}px, 0)`,
            }}
            aria-hidden="true"
          >
            <span className="text-lg">🌿</span>
          </div>

          {/* Small leaf near dosa */}
          <div
            className="hidden lg:block absolute right-64 bottom-8 w-5 h-5 pointer-events-none z-10 opacity-75"
            style={{
              transform: `translate3d(${-mouseOffset.x * 0.8}px, ${mouseOffset.y * 0.8}px, 0)`,
            }}
            aria-hidden="true"
          >
            <span className="text-base">🍃</span>
          </div>

          {/* ========================================================= */}
          {/* 6. CENTRAL CONTENT (Guaranteed Breathing Room)             */}
          {/* ========================================================= */}
          <div className="w-full max-w-md sm:max-w-lg lg:max-w-[440px] xl:max-w-[480px] text-center px-4 py-4 z-20 flex flex-col items-center">
            
            {/* Subtle Botanical Olive Branch Line Art above heading */}
            <div className="w-9 h-9 text-[#879568] opacity-80 mb-2 pointer-events-none select-none">
              <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 34 C20 22 20 12 20 6" />
                <path d="M20 24 C14 20 10 24 14 28 C18 30 20 28 20 24 Z" fill="currentColor" fillOpacity="0.15" />
                <path d="M20 24 C26 20 30 24 26 28 C22 30 20 28 20 24 Z" fill="currentColor" fillOpacity="0.15" />
                <path d="M20 16 C15 12 11 16 15 20 C19 22 20 20 20 16 Z" fill="currentColor" fillOpacity="0.15" />
                <path d="M20 16 C25 12 29 16 25 20 C21 22 20 20 20 16 Z" fill="currentColor" fillOpacity="0.15" />
                <path d="M20 8 C17 5 14 8 17 11 C20 12 20 10 20 8 Z" fill="currentColor" fillOpacity="0.2" />
                <path d="M20 8 C23 5 26 8 23 11 C20 12 20 10 20 8 Z" fill="currentColor" fillOpacity="0.2" />
              </svg>
            </div>

            {/* Central Two-Line Heading */}
            <h2 className="font-serif font-bold text-3xl sm:text-4xl lg:text-[44px] xl:text-5xl tracking-tight leading-[1.1] select-none">
              <span className="block text-[#183D2B]">
                Discover the
              </span>
              <span className="block text-[#C66A45] mt-1 relative inline-block">
                Goodness of Millets
                {/* Radiating terracotta accent strokes on the right */}
                <span
                  className="absolute -top-1 sm:-top-2 -right-6 sm:-right-8 text-[#C66A45] pointer-events-none select-none"
                  aria-hidden="true"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 32 32"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="w-4 h-4 sm:w-5 sm:h-5"
                  >
                    <line x1="10" y1="22" x2="16" y2="10" />
                    <line x1="18" y1="24" x2="23" y2="9" />
                    <line x1="26" y1="26" x2="29" y2="14" />
                  </svg>
                </span>
              </span>
            </h2>

            {/* Supporting Description */}
            <p className="mt-4 text-sm sm:text-base text-[#252820]/80 font-normal leading-relaxed max-w-sm sm:max-w-md mx-auto">
              From wholesome MilletBowls to delicious millet-inspired creations,
              discover a fresh, flavourful way to enjoy traditional grains.
            </p>

            {/* Prominent CTA Button */}
            <div className="mt-6 sm:mt-8">
              <a
                href="/products"
                className="group inline-flex items-center justify-center gap-2.5 px-7 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-semibold text-white bg-[#183D2B] hover:bg-[#10291E] rounded-full transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Explore Our Products</span>
                <svg
                  className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </a>
            </div>

          </div>

        </div>

        {/* ========================================================= */}
        {/* MOBILE & TABLET LAYOUT (< 1024px)                          */}
        {/* Clean, beautifully arranged grid below content             */}
        {/* Prevents any image from overlapping the text               */}
        {/* ========================================================= */}
        <div className="mt-10 lg:hidden grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-6 border-t border-[#EDE2CF]/80">
          
          {/* Card 1: MilletBowl */}
          <div className="flex flex-col items-center text-center p-3 sm:p-4 rounded-2xl bg-white/60 border border-[#EDE2CF] shadow-xs hover:shadow-md transition-shadow">
            <div className="relative w-full aspect-[4/3] max-w-[140px] sm:max-w-[160px]">
              <picture>
                <source srcSet="/millet-seasonal-bowl.webp" type="image/webp" />
                <Image
                  src="/millet-seasonal-bowl.png"
                  alt="Signature MilletBowl"
                  fill
                  className="object-contain"
                />
              </picture>
            </div>
            <h3 className="font-serif font-bold text-xs sm:text-sm text-[#183D2B] mt-2">
              Signature Bowls
            </h3>
            <p className="text-[11px] text-[#879568] mt-0.5">Wholesome &amp; Hearty</p>
          </div>

          {/* Card 2: Chickpea & Millet Pilaf */}
          <div className="flex flex-col items-center text-center p-3 sm:p-4 rounded-2xl bg-white/60 border border-[#EDE2CF] shadow-xs hover:shadow-md transition-shadow">
            <div className="relative w-full aspect-[4/3] max-w-[125px] sm:max-w-[145px]">
              <picture>
                <source srcSet="/millet-chickpea-bowl.webp" type="image/webp" />
                <Image
                  src="/millet-chickpea-bowl.png"
                  alt="Chickpea & Millet Bowl"
                  fill
                  className="object-contain"
                />
              </picture>
            </div>
            <h3 className="font-serif font-bold text-xs sm:text-sm text-[#183D2B] mt-2">
              Chickpea Pilaf
            </h3>
            <p className="text-[11px] text-[#879568] mt-0.5">Protein-Packed</p>
          </div>

          {/* Card 3: Millet Drink */}
          <div className="flex flex-col items-center text-center p-3 sm:p-4 rounded-2xl bg-white/60 border border-[#EDE2CF] shadow-xs hover:shadow-md transition-shadow">
            <div className="relative w-full aspect-[4/3] max-w-[100px] sm:max-w-[120px]">
              <picture>
                <source srcSet="/millet-drink.webp" type="image/webp" />
                <Image
                  src="/millet-drink.png"
                  alt="Millet Shake"
                  fill
                  className="object-contain"
                />
              </picture>
            </div>
            <h3 className="font-serif font-bold text-xs sm:text-sm text-[#183D2B] mt-2">
              Millet Smoothie
            </h3>
            <p className="text-[11px] text-[#879568] mt-0.5">Pistachio &amp; Saffron</p>
          </div>

          {/* Card 4: Millet Dosa */}
          <div className="flex flex-col items-center text-center p-3 sm:p-4 rounded-2xl bg-white/60 border border-[#EDE2CF] shadow-xs hover:shadow-md transition-shadow">
            <div className="relative w-full aspect-[4/3] max-w-[140px] sm:max-w-[160px]">
              <picture>
                <source srcSet="/millet-dosa-plate.webp" type="image/webp" />
                <Image
                  src="/millet-dosa-plate.png"
                  alt="Millet Dosa Plate"
                  fill
                  className="object-contain"
                />
              </picture>
            </div>
            <h3 className="font-serif font-bold text-xs sm:text-sm text-[#183D2B] mt-2">
              Crispy Millet Dosa
            </h3>
            <p className="text-[11px] text-[#879568] mt-0.5">Sambar &amp; Chutney</p>
          </div>

        </div>

      </div>
    </section>
  );
}
