"use client";

import React from "react";
import Image from "next/image";
import {
  ArrowRight,
  Clock,
  ShieldCheck,
  Truck,
} from "lucide-react";

const ZOMATO_URL =
  "https://www.zomato.com/indore/milletmarg-sudama-nagar";

const SWIGGY_URL =
  "https://www.swiggy.com/city/indore/milletmarg-sudama-nagar-rest1040717";

export default function OrderMilletMargSection() {
  const orderingOptions = [
    {
      id: "zomato",
      title: "Order on Zomato",
      tagline: "Get your favourite millet creations delivered.",
      perk: "Order through our Zomato restaurant listing.",
      buttonText: "Order on Zomato",
      href: ZOMATO_URL,
      accentColor: "#E23744",
      background: "from-[#FFF5F5] to-[#FFECEC]",
      external: true,
      visual: (
        <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-[#F5D1D3] bg-gradient-to-br from-[#FFF8F8] to-[#FFEAEA] p-6 transition-colors duration-300 group-hover:border-[#E23744]/40">
          <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#E23744]/5 blur-xl" />

          <div className="relative flex h-[76px] w-full max-w-[210px] items-center justify-center rounded-2xl bg-[#E23744] px-5 shadow-sm transition-transform duration-300 group-hover:scale-105">
            <span className="font-sans text-3xl font-black italic tracking-tight text-white">
              zomato
            </span>
          </div>

          <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#E23744]">
            <Clock className="h-4 w-4" />
            <span>Convenient food delivery</span>
          </div>
        </div>
      ),
    },
    {
      id: "swiggy",
      title: "Order on Swiggy",
      tagline: "Discover MilletMarg on Swiggy.",
      perk: "Order through our Swiggy restaurant listing.",
      buttonText: "Order on Swiggy",
      href: SWIGGY_URL,
      accentColor: "#FC8019",
      background: "from-[#FFF8F0] to-[#FFF0E1]",
      external: true,
      visual: (
        <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-[#F7DFC9] bg-gradient-to-br from-[#FFFAF4] to-[#FFF0E2] p-6 transition-colors duration-300 group-hover:border-[#FC8019]/40">
          <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#FC8019]/5 blur-xl" />

          <div className="relative flex items-center justify-center gap-3 rounded-2xl bg-[#FC8019] px-6 py-5 shadow-sm transition-transform duration-300 group-hover:scale-105">
            <svg
              viewBox="0 0 24 24"
              className="h-8 w-8 fill-white"
              aria-hidden="true"
            >
              <path d="M12 2C7.58 2 4 5.58 4 10c0 5.25 7.15 11.45 7.45 11.71.32.28.78.28 1.1 0C12.85 21.45 20 15.25 20 10c0-4.42-3.58-8-8-8Zm0 12a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z" />
            </svg>

            <span className="font-sans text-2xl font-black tracking-wide text-white">
              SWIGGY
            </span>
          </div>

          <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#D9690C]">
            <Clock className="h-4 w-4" />
            <span>Order online with ease</span>
          </div>
        </div>
      ),
    },
    {
      id: "delivery",
      title: "Free Delivery",
      tagline: "Enjoy MilletMarg wherever you are.",
      perk: "Check the available delivery offers when ordering.",
      buttonText: "Explore Products",
      href: "/products",
      accentColor: "#71358B",
      background: "from-[#F8F0FC] to-[#F0E4F7]",
      external: false,
      visual: (
        <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-[#E5D1F0] bg-gradient-to-br from-[#7B2396] to-[#4F126C] p-6 text-white transition-colors duration-300 group-hover:from-[#6C1B86] group-hover:to-[#43105C]">
          <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full border border-white/10" />
          <div className="absolute -bottom-12 -left-8 h-36 w-36 rounded-full border border-white/10" />

          <div className="relative flex h-20 w-24 items-center justify-center">
            <Truck
              className="h-16 w-16 stroke-[1.5]"
              aria-hidden="true"
            />
          </div>

          <h4 className="relative mt-2 text-xl font-extrabold uppercase tracking-wide">
            Free Delivery
          </h4>

          <p className="relative mt-2 text-center text-xs leading-relaxed text-white/85">
            Check available delivery offers
          </p>

          <div className="relative mt-4 flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold">
            <ShieldCheck className="h-4 w-4" />
            <span>Freshness delivered</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section
      id="ordering-options"
      aria-labelledby="ordering-heading"
      className="relative overflow-hidden border-b border-[#EDE2CF]/70 bg-[#FAF2E6] py-16 sm:py-20 lg:py-24"
    >
      {/* Subtle decorative background elements */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-[#D8A641]/5 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-[#183D2B]/5 blur-3xl"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#D8A641]/30 bg-[#D8A641]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#8B6820]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D8A641]" />
            Freshness, your way
          </span>

          <h2
            id="ordering-heading"
            className="mt-5 font-serif text-3xl font-bold leading-tight tracking-tight text-[#183D2B] sm:text-4xl lg:text-5xl"
          >
            Enjoy MilletMarg Your Way
          </h2>

          <div className="mt-4 flex justify-center">
            <svg
              className="h-3 w-32 text-[#C66A45] sm:w-36"
              viewBox="0 0 140 12"
              fill="none"
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

          <p className="mt-4 text-base leading-relaxed text-[#252820]/75 sm:text-lg">
            Your favourite millet creations are just a click away.
            Choose your preferred way to enjoy MilletMarg.
          </p>
        </div>

        {/* Three ordering cards */}
        <div className="mt-10 grid grid-cols-1 gap-6 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {orderingOptions.map((option) => (
            <article
              key={option.id}
              className="group flex h-full flex-col rounded-3xl border border-[#E8DCC9] bg-[#FFFCF8] p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#D8A641]/50 hover:shadow-xl sm:p-5 lg:p-6"
            >
              {/* Card visual */}
              <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl">
                {option.visual}
              </div>

              {/* Card information */}
              <div className="mt-5 flex-1">
                <h3 className="font-serif text-xl font-bold text-[#183D2B] transition-colors duration-200 group-hover:text-[#C66A45] sm:text-2xl">
                  {option.title}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-[#252820]/85 sm:text-base">
                  {option.tagline}
                </p>

                <p className="mt-2 text-xs leading-relaxed text-[#879568] sm:text-sm">
                  {option.perk}
                </p>
              </div>

              {/* Card button */}
              <div className="mt-6 border-t border-[#EDE2CF] pt-5">
                <a
                  href={option.href}
                  target={option.external ? "_blank" : undefined}
                  rel={
                    option.external
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFFCF8] active:translate-y-0"
                  style={{
                    backgroundColor: option.accentColor,
                    ["--button-hover" as string]: option.accentColor,
                  }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.filter = "brightness(0.92)";
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.filter = "brightness(1)";
                  }}
                >
                  <span>{option.buttonText}</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </a>
              </div>
            </article>
          ))}
        </div>

        {/* Small supporting note */}
        <div className="mt-10 flex justify-center sm:mt-12">
          <p className="inline-flex max-w-2xl items-start gap-2 rounded-2xl border border-[#EDE2CF] bg-[#EDE2CF]/35 px-4 py-3 text-center text-xs leading-relaxed text-[#53664B] sm:items-center sm:text-sm">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#879568] sm:mt-0" />
            <span>
              Delivery availability and promotional offers may vary.
              Check the selected ordering platform for current details.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}