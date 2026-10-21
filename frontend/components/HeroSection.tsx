"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playbackRate = 1.25;

    const playVideo = async () => {
      try {
        await video.play();
      } catch {
        // Autoplay may be blocked by the browser.
      }
    };

    playVideo();
  }, []);

  return (
    <section className="relative isolate h-[calc(100svh-100px)] min-h-[650px] max-h-[900px] w-full overflow-hidden bg-[#FAF2E6]">
      {/* Background video */}
      {!videoError ? (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: "75% center" }}
          src="/millet-hero1.mp4"
          poster="/millet-bowl-hero.jpg"
          autoPlay
          muted
          playsInline
          preload="auto"
          onLoadedMetadata={(event) => {
            event.currentTarget.muted = true;
            event.currentTarget.playbackRate = 1.25;
          }}
          onError={() => setVideoError(true)}
        />
      ) : (
        <div
          className="absolute inset-0 bg-cover"
          style={{
            backgroundImage: "url('/millet-bowl-hero.jpg')",
            backgroundPosition: "75% center",
          }}
        />
      )}

      {/* Increased cream gradient for better headline readability */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-full sm:w-[56%] lg:w-[46%]"
        style={{
          background:
            "linear-gradient(90deg, rgba(250,242,230,0.91) 0%, rgba(250,242,230,0.76) 35%, rgba(250,242,230,0.40) 68%, transparent 100%)",
        }}
      />

      {/* Bottom shading for readable white text */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%]"
        style={{
          background:
            "linear-gradient(to top, rgba(16,41,30,0.78) 0%, rgba(16,41,30,0.42) 45%, transparent 100%)",
        }}
      />

      {/* Hero content */}
      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1600px] flex-col justify-between px-6 py-12 sm:px-10 sm:py-16 lg:px-16 lg:py-16 xl:px-20">
        {/* Headline */}
        <div className="max-w-[540px]">
          <p className="mb-5 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#A74427] sm:text-xs">
            <span className="h-[2px] w-8 bg-[#C66A45]" />
            Good Food. Ancient Grains.
          </p>

          <h1
            className="font-serif text-[clamp(3rem,5.5vw,5.2rem)] font-bold leading-[0.98] tracking-[-0.045em]"
            style={{
              color: "#123B29",
              textShadow: "0 1px 0 rgba(255,255,255,0.65)",
            }}
          >
            Good Millets.
            <span
              className="mt-2 block"
              style={{
                color: "#B94F2F",
                textShadow: "0 1px 0 rgba(255,255,255,0.55)",
              }}
            >
              Brighter
              <br />
              Tomorrows.
            </span>
          </h1>

          <div className="mt-6 h-[3px] w-16 rounded-full bg-[#C66A45]" />
        </div>

        {/* Description and CTA */}
        <div className="flex w-full justify-end">
          <div className="w-full max-w-[380px] sm:mr-4 lg:mr-10 xl:mr-16">
            <p
              className="mb-6 text-base font-semibold leading-7 text-white sm:text-lg sm:leading-8"
              style={{
                textShadow: "0 2px 8px rgba(0,0,0,0.95)",
              }}
            >
              Wholesome millet bowls made with nature&apos;s goodness, fresh
              ingredients, and a love for better food.
            </p>

            <Link
              href="/products"
              className="group inline-flex min-h-[54px] items-center gap-3 rounded-full bg-[#C66A45] px-7 py-4 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-[#A95334] hover:shadow-xl sm:text-base"
            >
              Explore Our Products

              <ArrowRight
                size={19}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>

            <p
              className="mt-4 text-xs font-semibold tracking-wide text-white sm:text-sm"
              style={{
                textShadow: "0 2px 7px rgba(0,0,0,0.95)",
              }}
            >
              Traditional grains. Fresh possibilities.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}