import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Layers, CalendarCheck, Compass } from "lucide-react";

export default function QuizPromoSection() {
  const supportingFeatures = [
    {
      title: "Personalized Product Picks",
      icon: Sparkles,
      color: "#C66A45",
    },
    {
      title: "Smart Millet Combos",
      icon: Layers,
      color: "#D8A641",
    },
    {
      title: "Your 7-Day Meal Plan",
      icon: CalendarCheck,
      color: "#879568",
    },
  ];

  return (
    <section className="relative z-10 w-full bg-[#FAF2E6] border-b border-[#EDE2CF]/80 py-12 sm:py-16 lg:py-20 overflow-hidden">
      {/* Subtle organic background glow accents */}
      <div
        className="pointer-events-none absolute -top-24 right-10 w-96 h-96 rounded-full bg-[#D8A641]/10 blur-3xl -z-10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-20 left-10 w-80 h-80 rounded-full bg-[#C66A45]/8 blur-3xl -z-10"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-5 text-left">
            {/* Eyebrow Label */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#183D2B]/8 border border-[#183D2B]/15 text-[#183D2B] text-xs font-semibold tracking-wider uppercase">
              <Compass className="w-3.5 h-3.5 text-[#C66A45]" />
              <span>PERSONALIZED MILLET DISCOVERY</span>
            </div>

            {/* Main Headline */}
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#183D2B] leading-[1.15] tracking-tight">
              Your Taste. Your Lifestyle.{" "}
              <span className="text-[#C66A45] block sm:inline">Your Millet Match.</span>
            </h2>

            {/* Concise Description */}
            <p className="text-base sm:text-lg text-[#252820]/80 leading-relaxed font-normal max-w-2xl">
              Not sure which millet creation is right for you? Answer a few quick questions to discover products that match your preferences, explore personalized combinations, and build your own seven-day millet meal plan.
            </p>

            {/* Supporting labels / feature badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {supportingFeatures.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-white/70 border border-[#EDE2CF] shadow-2xs backdrop-blur-xs"
                  >
                    <div
                      className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${item.color}18` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: item.color }} />
                    </div>
                    <span className="text-xs font-semibold text-[#183D2B]">
                      {item.title}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* CTA Button */}
            <div className="pt-3">
              <Link
                href="/quiz"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-[#183D2B] text-[#FAF2E6] font-semibold text-sm sm:text-base hover:bg-[#10291E] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#C66A45] focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 group"
              >
                <span>Take the 60-Second Quiz →</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Right Visual Column */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-[380px] sm:max-w-[420px] aspect-square rounded-[36px] bg-gradient-to-br from-white/80 via-[#EDE2CF]/60 to-[#FAF2E6]/90 p-6 sm:p-8 border border-[#EDE2CF] shadow-lg flex flex-col items-center justify-center">
              {/* Product Image */}
              <div className="relative w-[220px] sm:w-[260px] aspect-square transition-transform duration-500 hover:scale-105">
                <Image
                  src="/millet-seasonal-bowl.png"
                  alt="Personalized Millet Discovery Bowl"
                  fill
                  sizes="(max-width: 640px) 220px, 260px"
                  className="object-contain drop-shadow-xl"
                  priority
                />
              </div>

              {/* Floating Pill Badge */}
              <div className="absolute -bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-4 bg-[#183D2B] text-[#FAF2E6] px-4 py-2 rounded-full text-xs font-medium shadow-md flex items-center gap-2 border border-white/20 whitespace-nowrap">
                <Sparkles className="w-3.5 h-3.5 text-[#D8A641]" />
                <span>Tailored Recommendations in 60s</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
