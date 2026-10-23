"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  QuizAnswers,
  Persona,
  MealPlanWeek,
  generateMealPlan,
  getQuizFromStorage,
  getMealPlanSeed,
  saveMealPlanSeed,
  MILLET_CATALOG,
} from "@/lib/milletCatalog";
import {
  Sparkles,
  ArrowLeft,
  RotateCcw,
  Printer,
  Calendar,
  Layers,
  IndianRupee,
  Utensils,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  Info,
} from "lucide-react";

export default function MealPlanPage() {
  const [answers, setAnswers] = useState<QuizAnswers | undefined>(undefined);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [seed, setSeed] = useState<number>(1);
  const [mealPlan, setMealPlan] = useState<MealPlanWeek | null>(null);
  const [activeDayIndex, setActiveDayIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<"day" | "full">("day");
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [regenerationNotice, setRegenerationNotice] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const saved = getQuizFromStorage();
    const currentSeed = getMealPlanSeed();
    setSeed(currentSeed);

    if (saved && saved.answers && saved.persona) {
      setAnswers(saved.answers);
      setPersona(saved.persona);
      const plan = generateMealPlan(MILLET_CATALOG, saved.answers, currentSeed);
      setMealPlan(plan);
    } else {
      // Default general plan if accessed directly
      const plan = generateMealPlan(MILLET_CATALOG, undefined, currentSeed);
      setMealPlan(plan);
    }
  }, []);

  const handleRegenerate = () => {
    const nextSeed = seed + 1;
    setSeed(nextSeed);
    saveMealPlanSeed(nextSeed);

    const newPlan = generateMealPlan(MILLET_CATALOG, answers, nextSeed);
    setMealPlan(newPlan);

    setRegenerationNotice(`Generated alternative rotation #${nextSeed} while preserving your preferences.`);
    setTimeout(() => setRegenerationNotice(null), 4000);
  };

  const handleReset = () => {
    const defaultSeed = 1;
    setSeed(defaultSeed);
    saveMealPlanSeed(defaultSeed);
    const resetPlan = generateMealPlan(MILLET_CATALOG, answers, defaultSeed);
    setMealPlan(resetPlan);
    setIsResetConfirmOpen(false);
    setActiveDayIndex(0);
    setRegenerationNotice("Meal plan reset to initial recommendation.");
    setTimeout(() => setRegenerationNotice(null), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isMounted || !mealPlan) {
    return (
      <div className="flex flex-col min-h-screen bg-[#FAF2E6] text-[#183D2B]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#183D2B] border-t-transparent rounded-full animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  const activeDay = mealPlan.days[activeDayIndex] || mealPlan.days[0];

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF2E6] text-[#183D2B] print:bg-white print:text-black">
      {/* Hide navbar on print */}
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full print:p-0 print:max-w-none">
        
        {/* ========================================================= */}
        {/* A. PAGE HEADING                                           */}
        {/* ========================================================= */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#183D2B]/8 border border-[#183D2B]/15 text-[#183D2B] text-xs font-semibold tracking-wider uppercase print:border-black/20">
                <Calendar className="w-3.5 h-3.5 text-[#C66A45]" />
                <span>YOUR PERSONALIZED WEEKLY PLAN</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#183D2B] tracking-tight print:text-3xl">
                Seven Days of Millet Goodness
              </h1>

              <p className="text-sm sm:text-base text-[#252820]/75 max-w-2xl font-normal print:text-xs">
                Discover a week of millet-inspired meal ideas tailored to your preferences, with variety and estimated costs to help you plan your meals.
              </p>
            </div>

            {/* Persona Badge if available */}
            {persona && (
              <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-4 border border-[#EDE2CF] shadow-xs flex items-center gap-3 print:border print:border-black/20">
                <div className="w-10 h-10 rounded-xl bg-[#183D2B]/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-[#C66A45]" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#C66A45] block">
                    Curated For
                  </span>
                  <span className="font-serif font-bold text-sm sm:text-base text-[#183D2B]">
                    {persona.name}
                  </span>
                  {answers && (
                    <span className="text-[11px] text-stone-500 block">
                      Target: {answers.budget} · {answers.flavours}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Direct visit prompt if quiz was not completed */}
          {!mealPlan.isPersonalized && (
            <div className="bg-[#D8A641]/15 border border-[#D8A641]/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs print:hidden">
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-[#C66A45] flex-shrink-0" />
                <p className="text-xs sm:text-sm text-[#183D2B]">
                  <strong>Viewing standard chef rotation:</strong> Take the 60-second quiz to personalize this plan according to your taste, budget, and meal routine!
                </p>
              </div>
              <Link
                href="/quiz"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#183D2B] text-white text-xs font-semibold hover:bg-[#10291E] transition-all whitespace-nowrap shadow-2xs"
              >
                <span>Take the Quiz</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Regeneration feedback banner */}
          {regenerationNotice && (
            <div className="bg-[#183D2B] text-white rounded-xl px-4 py-2.5 text-xs font-medium flex items-center gap-2 animate-fadeIn print:hidden">
              <CheckCircle2 className="w-4 h-4 text-[#D8A641]" />
              <span>{regenerationNotice}</span>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* E. WEEKLY COST SUMMARY & STATS                            */}
        {/* ========================================================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <div className="bg-white/80 rounded-2xl p-4 sm:p-5 border border-[#EDE2CF] shadow-xs">
            <span className="text-xs text-stone-500 font-medium block">Total Weekly Cost</span>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-[#183D2B] mt-1">
              ₹{mealPlan.totalWeeklyCost}
            </div>
            <span className="text-[11px] text-[#879568] mt-1 block">28 individual meals</span>
          </div>

          <div className="bg-white/80 rounded-2xl p-4 sm:p-5 border border-[#EDE2CF] shadow-xs">
            <span className="text-xs text-stone-500 font-medium block">Average Cost / Day</span>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-[#C66A45] mt-1">
              ₹{mealPlan.averageDailyCost}
            </div>
            <span className="text-[11px] text-stone-500 mt-1 block">4 balanced meals daily</span>
          </div>

          <div className="bg-white/80 rounded-2xl p-4 sm:p-5 border border-[#EDE2CF] shadow-xs">
            <span className="text-xs text-stone-500 font-medium block">Unique Creations</span>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-[#183D2B] mt-1">
              {mealPlan.uniqueProductCount}
            </div>
            <span className="text-[11px] text-[#879568] mt-1 block">Rotating supergrains</span>
          </div>

          <div className="bg-white/80 rounded-2xl p-4 sm:p-5 border border-[#EDE2CF] shadow-xs">
            <span className="text-xs text-stone-500 font-medium block">Active Rotation</span>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-[#D8A641] mt-1">
              Variant #{mealPlan.seed}
            </div>
            <span className="text-[11px] text-stone-500 mt-1 block">Regenerable on demand</span>
          </div>
        </div>

        {/* Small Disclaimer */}
        <div className="text-[11px] text-stone-500 mb-6 flex items-center gap-1.5 print:hidden">
          <Info className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
          <span>
            Costs are estimated meal-planning prices for product discovery. Not a medical or clinical nutrition plan.
          </span>
        </div>

        {/* ========================================================= */}
        {/* F. MEAL-PLAN CONTROLS                                     */}
        {/* ========================================================= */}
        <div className="bg-white/90 rounded-2xl p-4 border border-[#EDE2CF] shadow-xs flex flex-wrap items-center justify-between gap-4 mb-8 print:hidden">
          {/* Left Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Link
              href="/quiz"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#183D2B]/30 text-[#183D2B] text-xs sm:text-sm font-semibold hover:bg-[#EDE2CF]/60 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Recommendations</span>
            </Link>

            <button
              type="button"
              onClick={handleRegenerate}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#183D2B] text-[#FAF2E6] text-xs sm:text-sm font-semibold hover:bg-[#10291E] active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate Plan</span>
            </button>

            <button
              type="button"
              onClick={() => setIsResetConfirmOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-full border border-stone-300 text-stone-600 text-xs sm:text-sm font-medium hover:text-[#C66A45] hover:border-[#C66A45] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Plan</span>
            </button>
          </div>

          {/* Right Actions: View switch & Print */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* View Mode Toggle */}
            <div className="hidden sm:inline-flex bg-[#FAF2E6] p-1 rounded-xl border border-[#EDE2CF]">
              <button
                type="button"
                onClick={() => setViewMode("day")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "day"
                    ? "bg-white text-[#183D2B] shadow-2xs"
                    : "text-stone-600 hover:text-[#183D2B]"
                }`}
              >
                Day-by-Day View
              </button>
              <button
                type="button"
                onClick={() => setViewMode("full")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "full"
                    ? "bg-white text-[#183D2B] shadow-2xs"
                    : "text-stone-600 hover:text-[#183D2B]"
                }`}
              >
                Full Week Grid
              </button>
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#C66A45] text-white text-xs sm:text-sm font-semibold hover:bg-[#A74427] transition-all shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Plan</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* B & D. WEEKLY PLAN LAYOUT (7 DAYS X 4 SLOTS)              */}
        {/* ========================================================= */}
        
        {/* DAY SELECTOR TABS (Visible in day-by-day mode or mobile) */}
        <div className={`mb-6 print:hidden ${viewMode === "full" ? "sm:hidden" : ""}`}>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {mealPlan.days.map((dayPlan, idx) => {
              const isSelected = idx === activeDayIndex;
              return (
                <button
                  key={dayPlan.day}
                  type="button"
                  onClick={() => setActiveDayIndex(idx)}
                  className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 border ${
                    isSelected
                      ? "bg-[#183D2B] text-white border-[#183D2B] shadow-sm"
                      : "bg-white/80 text-[#183D2B] border-[#EDE2CF] hover:bg-white"
                  }`}
                >
                  <span>{dayPlan.day}</span>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full ${
                      isSelected ? "bg-white/20 text-white" : "bg-[#FAF2E6] text-[#C66A45]"
                    }`}
                  >
                    ₹{dayPlan.dailyCost}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 1. DAY-BY-DAY VIEW (Default on mobile and optional on desktop) */}
        <div className={`${viewMode === "full" ? "hidden sm:hidden" : "block"} print:hidden`}>
          <div className="bg-white/90 rounded-3xl p-6 sm:p-8 border border-[#EDE2CF] shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#EDE2CF] pb-4">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-[#C66A45]">
                  Daily Menu
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#183D2B]">
                  {activeDay.day}
                </h2>
              </div>
              <div className="text-right">
                <span className="text-xs text-stone-500 block">Day Total</span>
                <span className="font-serif text-xl sm:text-2xl font-bold text-[#183D2B]">
                  ₹{activeDay.dailyCost}
                </span>
              </div>
            </div>

            {/* 4 Meal Slots Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {activeDay.meals.map((meal) => (
                <div
                  key={meal.slot}
                  className="bg-[#FAF2E6]/60 rounded-2xl p-4 border border-[#EDE2CF] flex flex-col justify-between hover:bg-white transition-all shadow-2xs hover:shadow-xs group"
                >
                  <div className="space-y-3">
                    {/* Slot Header */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#183D2B] bg-white px-2.5 py-1 rounded-full border border-[#EDE2CF]">
                        {meal.slot}
                      </span>
                      {meal.matchBadge && (
                        <span className="text-[10px] font-semibold text-[#C66A45] bg-[#C66A45]/10 px-2 py-0.5 rounded-full">
                          {meal.matchBadge}
                        </span>
                      )}
                    </div>

                    {/* Image */}
                    <div className="relative aspect-square w-full rounded-xl bg-white p-3 flex items-center justify-center overflow-hidden">
                      <Image
                        src={meal.product.image || "/millet-seasonal-bowl.png"}
                        alt={meal.product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, 220px"
                        className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div>
                      <span className="text-[11px] font-medium text-[#879568]">
                        {meal.product.category}
                      </span>
                      <h3 className="font-serif font-bold text-base text-[#183D2B] line-clamp-1 mt-0.5">
                        {meal.product.name}
                      </h3>
                      <div className="text-sm font-bold text-[#C66A45] mt-1">
                        ₹{meal.product.numericPrice}
                      </div>
                    </div>

                    <p className="text-xs text-[#252820]/75 line-clamp-2">
                      {meal.note}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#EDE2CF] mt-3">
                    <Link
                      href={`/products/${meal.product.slug}`}
                      className="text-xs font-semibold text-[#183D2B] hover:text-[#C66A45] flex items-center justify-between"
                    >
                      <span>Product Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2. FULL WEEK GRID VIEW (Desktop or Print) */}
        <div className={`${viewMode === "full" ? "hidden sm:block" : "hidden"} print:block space-y-8`}>
          {mealPlan.days.map((dayPlan) => (
            <div
              key={dayPlan.day}
              className="bg-white/90 rounded-2xl p-5 border border-[#EDE2CF] shadow-2xs space-y-4 break-inside-avoid print:border-black/30 print:shadow-none print:p-3"
            >
              <div className="flex items-center justify-between border-b border-[#EDE2CF] pb-2 print:border-black/20">
                <h3 className="font-serif font-bold text-xl text-[#183D2B] print:text-base">
                  {dayPlan.day}
                </h3>
                <span className="text-xs font-bold text-[#C66A45] print:text-black">
                  Daily Estimated: ₹{dayPlan.dailyCost}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {dayPlan.meals.map((meal) => (
                  <div
                    key={meal.slot}
                    className="p-3 rounded-xl bg-[#FAF2E6]/50 border border-[#EDE2CF] flex flex-col justify-between print:border-black/10 print:bg-white"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-[#183D2B]">{meal.slot}</span>
                        <span className="text-[#C66A45] print:text-black">₹{meal.product.numericPrice}</span>
                      </div>

                      <div className="relative aspect-[4/3] w-full rounded-lg bg-white overflow-hidden print:hidden">
                        <Image
                          src={meal.product.image || "/millet-seasonal-bowl.png"}
                          alt={meal.product.name}
                          fill
                          sizes="200px"
                          className="object-contain p-1"
                        />
                      </div>

                      <span className="font-serif font-bold text-xs text-[#183D2B] block line-clamp-1">
                        {meal.product.name}
                      </span>
                      <p className="text-[11px] text-stone-600 line-clamp-2">
                        {meal.note}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* PRINT ONLY FOOTER SHEET */}
        <div className="hidden print:block mt-8 pt-4 border-t border-black/30 text-xs text-stone-600 space-y-1">
          <p>
            <strong>MilletMarg Indore</strong> · Farm-to-Table Millet Nutrition · Official Weekly Meal Discovery Sheet
          </p>
          <p>
            Total Estimated Weekly Cost: ₹{mealPlan.totalWeeklyCost} · Unique Supergrain Dishes: {mealPlan.uniqueProductCount}
          </p>
        </div>

      </main>

      {/* Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#EDE2CF] shadow-xl space-y-4">
            <h3 className="font-serif text-xl font-bold text-[#183D2B]">
              Reset Meal Plan?
            </h3>
            <p className="text-xs sm:text-sm text-[#252820]/80 leading-relaxed font-normal">
              This will restore the initial recommended rotation of your seven-day meal plan. Your quiz preferences will remain preserved.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 rounded-full border border-stone-300 text-xs sm:text-sm font-semibold text-stone-600 hover:bg-stone-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-2 rounded-full bg-[#C66A45] text-white text-xs sm:text-sm font-semibold hover:bg-[#A74427] transition-colors cursor-pointer"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hide footer on print */}
      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
