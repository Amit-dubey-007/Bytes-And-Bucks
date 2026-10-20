"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

export default function HeroSection() {
  const containerRef = useRef<HTMLElement>(null);
  const targetRef = useRef({ rotateX: 0, rotateY: 0, x: 0, y: 0 });
  const currentRef = useRef({ rotateX: 0, rotateY: 0, x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  const [transforms, setTransforms] = useState({
    rotateX: 0,
    rotateY: 0,
    x: 0,
    y: 0,
  });

  const [isInteractive, setIsInteractive] = useState(false);

  // Setup RAF-based smooth damping interpolation (Lerp physics)
  useEffect(() => {
    // Check if user prefers reduced motion or is on a touch device
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

    const updatePhysics = () => {
      if (!isRunning) return;

      const target = targetRef.current;
      const current = currentRef.current;

      // Silky smooth damping factor (0.075 provides fluid, premium movement)
      current.rotateX += (target.rotateX - current.rotateX) * 0.075;
      current.rotateY += (target.rotateY - current.rotateY) * 0.075;
      current.x += (target.x - current.x) * 0.075;
      current.y += (target.y - current.y) * 0.075;

      setTransforms({
        rotateX: Math.round(current.rotateX * 100) / 100,
        rotateY: Math.round(current.rotateY * 100) / 100,
        x: Math.round(current.x * 100) / 100,
        y: Math.round(current.y * 100) / 100,
      });

      rafRef.current = requestAnimationFrame(updatePhysics);
    };

    rafRef.current = requestAnimationFrame(updatePhysics);

    return () => {
      isRunning = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Mouse move handler over hero section
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!isInteractive || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    // Normalized coordinates from -1.0 to +1.0 relative to container center
    const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const normY = ((e.clientY - rect.top) / rect.height) * 2 - 1;

    // 5-8 degrees of rotation for subtle, elegant depth
    // normX controls Y-axis rotation (tilts horizontally)
    // normY controls X-axis rotation (tilts vertically toward cursor)
    targetRef.current = {
      rotateX: -normY * 7.5,
      rotateY: normX * 8.5,
      x: normX * 14,
      y: normY * 12,
    };
  };

  // When cursor leaves the hero section, bowl returns smoothly to origin
  const handleMouseLeave = () => {
    targetRef.current = { rotateX: 0, rotateY: 0, x: 0, y: 0 };
  };

  return (
    <section
      ref={containerRef}
      id="hero"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative overflow-hidden bg-[#FAF2E6] pt-6 pb-20 sm:pt-10 sm:pb-28 lg:pt-12 lg:pb-36 min-h-[580px] lg:min-h-[660px] flex flex-col justify-center select-none"
    >
      {/* Background delicate sketched botanical line art */}
      <div
        className="absolute top-10 left-8 w-72 h-72 opacity-[0.07] pointer-events-none -z-10"
        aria-hidden="true"
      >
        <svg viewBox="0 0 200 200" fill="none" stroke="#183D2B" strokeWidth="1.5">
          <path d="M40 180 C40 110 80 50 160 30" />
          <path d="M70 140 C55 125 50 100 65 90 C80 80 95 95 90 120 Z" />
          <path d="M100 110 C85 95 85 70 100 60 C115 50 130 65 125 90 Z" />
          <path d="M130 75 C120 60 125 40 140 35 C155 30 165 45 155 65 Z" />
        </svg>
      </div>

      {/* Main Grid Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-6 items-center">
          
          {/* LEFT COLUMN: Editorial Typography & Single CTA (cols: 7 on desktop) */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6 sm:space-y-7 z-20 pr-0 lg:pr-4">
            
            {/* 1. Uppercase Eyebrow Label */}
            <div className="animate-fade-in inline-flex items-center self-start">
              <p className="text-xs sm:text-[13px] font-semibold tracking-[0.24em] uppercase text-[#C66A45] font-sans">
                GOOD FOOD · ANCIENT GRAINS · A HEALTHIER YOU
              </p>
            </div>

            {/* 2. Large Bold Editorial Heading */}
            <h1 className="animate-fade-in-up animation-delay-100 font-serif font-bold text-5xl sm:text-6xl md:text-7xl lg:text-[76px] xl:text-[84px] tracking-tight leading-[0.98]">
              <span className="block text-[#183D2B]">
                Good Millets.
              </span>
              
              {/* Line 2 & 3: Brighter Tomorrows with terracotta styling & accent lines */}
              <span className="block text-[#C66A45] mt-1 relative">
                <span className="inline-block relative">
                  Brighter
                  {/* Three radiating hand-drawn style accent strokes (///) */}
                  <span
                    className="absolute -top-1 sm:-top-2 -right-8 sm:-right-10 text-[#C66A45] pointer-events-none"
                    aria-hidden="true"
                  >
                    <svg
                      width="30"
                      height="30"
                      viewBox="0 0 32 32"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                      className="w-6 h-6 sm:w-8 sm:h-8"
                    >
                      <line x1="8" y1="24" x2="14" y2="8" />
                      <line x1="16" y1="25" x2="21" y2="7" />
                      <line x1="24" y1="26" x2="28" y2="12" />
                    </svg>
                  </span>
                </span>
                <br />
                <span className="inline-block relative mt-0.5">
                  Tomorrows.
                  {/* Hand-drawn organic brush stroke underline */}
                  <svg
                    className="absolute -bottom-2 sm:-bottom-3.5 left-0 w-[105%] max-w-[340px] h-3.5 sm:h-5 text-[#C66A45] pointer-events-none"
                    viewBox="0 0 320 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 11 C 60 5, 170 7, 316 13 C 210 17, 90 16, 3 11 Z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
              </span>
            </h1>

            {/* 3. Supporting Description */}
            <p className="animate-fade-in-up animation-delay-200 text-base sm:text-lg lg:text-[19px] text-[#252820]/85 font-normal max-w-lg leading-relaxed pt-2">
              Wholesome millet bowls crafted with nature&apos;s goodness, fresh
              ingredients, and a love for better food.
            </p>

            {/* 4. Single CTA Button: "Explore Our Products →" */}
            <div className="animate-fade-in-up animation-delay-300 pt-3">
              <a
                href="/products"
                className="group inline-flex items-center justify-center gap-3 px-8 sm:px-9 py-4 sm:py-4.5 text-base font-semibold text-white bg-[#C66A45] hover:bg-[#B24B28] rounded-full transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
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

          {/* RIGHT COLUMN: Interactive 3D Floating MilletBowl with Parallax Ingredients (cols: 5 on desktop) */}
          <div className="lg:col-span-5 relative flex justify-center items-center mt-8 lg:mt-0 w-full min-h-[420px] sm:min-h-[480px] lg:min-h-[520px]">
            
            {/* 1. Organic Terracotta Backdrop Shape with subtle reverse parallax */}
            <div
              className="absolute w-[340px] h-[340px] sm:w-[440px] sm:h-[440px] lg:w-[480px] lg:h-[480px] rounded-[48%_52%_62%_38%_/_48%_44%_56%_52%] bg-gradient-to-tr from-[#C66A45]/30 via-[#D8A641]/20 to-[#C66A45]/15 blur-sm transition-transform duration-300 ease-out pointer-events-none -z-10"
              style={{
                transform: `translate3d(${-transforms.x * 0.35}px, ${-transforms.y * 0.35}px, -40px) rotate(${transforms.rotateY * 0.3}deg)`,
              }}
              aria-hidden="true"
            />

            {/* 2. Soft Warm Ambient Glow */}
            <div
              className="absolute w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] rounded-full bg-[#D8A641]/25 blur-3xl pointer-events-none -z-10"
              aria-hidden="true"
            />

            {/* 3. Floating Parallax Ingredient 1: Roasted Chickpea (Top Left) */}
            <div
              className="absolute top-4 left-4 sm:top-6 sm:left-6 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-[#D8A641] to-[#A86E20] shadow-md flex items-center justify-center p-1.5 pointer-events-none z-20 animate-float"
              style={{
                transform: `translate3d(${-transforms.x * 1.5}px, ${-transforms.y * 1.5}px, 45px)`,
                transition: "transform 0.15s ease-out",
              }}
              aria-hidden="true"
            >
              <div className="w-full h-full rounded-full bg-[#D8A641]/90 shadow-inner flex items-center justify-center text-[10px]">
                🌾
              </div>
            </div>

            {/* 4. Floating Parallax Ingredient 2: Fresh Basil / Herb Leaf (Top Right) */}
            <div
              className="absolute top-8 right-2 sm:top-10 sm:right-6 w-10 h-10 sm:w-12 sm:h-12 pointer-events-none z-20 animate-float-reverse"
              style={{
                transform: `translate3d(${transforms.x * 1.4}px, ${transforms.y * 1.4}px, 40px) rotate(${transforms.rotateY * 1.2}deg)`,
                transition: "transform 0.15s ease-out",
              }}
              aria-hidden="true"
            >
              <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow-md text-[#487346]">
                <path
                  d="M10 32 C12 20 22 10 35 8 C33 22 24 30 10 32 Z"
                  fill="#548652"
                />
                <path
                  d="M10 32 C18 24 26 16 35 8"
                  stroke="#385C36"
                  strokeWidth="1.5"
                />
              </svg>
            </div>

            {/* 5. Floating Parallax Ingredient 3: Glossy Halved Cherry Tomato (Bottom Left) */}
            <div
              className="absolute bottom-12 left-2 sm:bottom-16 sm:left-6 w-10 h-10 sm:w-12 sm:h-12 pointer-events-none z-20 animate-float"
              style={{
                transform: `translate3d(${-transforms.x * 1.25}px, ${-transforms.y * 1.25}px, 35px)`,
                transition: "transform 0.15s ease-out",
              }}
              aria-hidden="true"
            >
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#A63520] to-[#E05238] shadow-md border border-[#F2806B]/40 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white/70 -mt-1 -ml-1 blur-[0.5px]" />
              </div>
            </div>

            {/* 6. Floating Parallax Ingredient 4: Golden Millet Grain Sprig (Bottom Right) */}
            <div
              className="absolute bottom-14 right-4 sm:bottom-16 sm:right-8 w-8 h-8 sm:w-10 sm:h-10 pointer-events-none z-20 animate-float-reverse"
              style={{
                transform: `translate3d(${transforms.x * 1.1}px, ${transforms.y * 1.1}px, 25px)`,
                transition: "transform 0.15s ease-out",
              }}
              aria-hidden="true"
            >
              <span className="text-xl sm:text-2xl drop-shadow-xs">✨</span>
            </div>

            {/* 7. 3D Perspective Viewport for the Interactive Floating MilletBowl */}
            <div
              className="relative w-full max-w-[440px] sm:max-w-[480px] lg:max-w-[520px] aspect-square flex items-center justify-center animate-image-entrance"
              style={{ perspective: "1200px" }}
            >
              {/* Dynamic Mouse Tilt Element */}
              <div
                className="relative w-full h-full flex items-center justify-center"
                style={{
                  transform: `rotateX(${transforms.rotateX}deg) rotateY(${transforms.rotateY}deg) translate3d(${transforms.x}px, ${transforms.y}px, 0px)`,
                  transformStyle: "preserve-3d",
                  transition: isInteractive ? "none" : "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                  willChange: "transform",
                }}
              >
                {/* Dynamic Contact Drop Shadow Beneath the Bowl */}
                <div
                  className="absolute bottom-2 sm:bottom-4 w-[70%] h-10 sm:h-14 rounded-[100%] bg-[#10291E]/30 blur-xl pointer-events-none -z-10 transition-transform duration-150 ease-out"
                  style={{
                    transform: `translate3d(${transforms.x * 0.4}px, ${transforms.y * 0.2}px, -20px) scale(${
                      1 - Math.abs(transforms.y) * 0.012
                    })`,
                  }}
                  aria-hidden="true"
                />

                {/* Nested Continuous Idle Float Element */}
                <div className="relative w-[92%] h-[92%] animate-float transition-transform duration-500 ease-out hover:scale-[1.03]">
                  <picture>
                    <source srcSet="/millet-bowl-transparent.webp" type="image/webp" />
                    <Image
                      src="/millet-bowl-transparent.png"
                      alt="Handcrafted ceramic MilletBowl with cooked fluffy golden foxtail millets, spiced chickpeas, creamy avocado, sweet potato, edamame, and microgreens"
                      fill
                      priority
                      sizes="(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 40vw"
                      className="object-contain drop-shadow-2xl select-none pointer-events-none"
                    />
                  </picture>

                  {/* Tasteful floating badge: Our Hero Product — MilletBowl */}
                  <div
                    className="absolute -bottom-3 sm:-bottom-4 left-1/2 -translate-x-1/2 bg-[#F7F1E5]/95 backdrop-blur-md px-4 py-1.5 rounded-full border border-[#EDE2CF] shadow-lg flex items-center gap-2 pointer-events-auto"
                    style={{
                      transform: "translateZ(30px)",
                    }}
                  >
                    <span className="w-2 h-2 rounded-full bg-[#C66A45] animate-pulse" />
                    <span className="font-serif text-xs font-bold text-[#183D2B] whitespace-nowrap">
                      Our Hero Product — MilletBowl
                    </span>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Layered Organic Bottom Wave Transition (Matching Reference Image) */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none pointer-events-none -z-10">
        <svg
          className="relative block w-full h-16 sm:h-24 lg:h-32"
          viewBox="0 0 1440 160"
          fill="none"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Upper Sand Wave */}
          <path
            d="M0,70 C320,115 560,50 880,85 C1140,115 1320,80 1440,95 L1440,160 L0,160 Z"
            fill="#EADBC6"
            fillOpacity="0.85"
          />
          {/* Lower Deep Forest Green Wave */}
          <path
            d="M0,105 C260,145 600,95 960,125 C1180,145 1340,100 1440,110 L1440,160 L0,160 Z"
            fill="#123B2D"
          />
        </svg>
      </div>

    </section>
  );
}
