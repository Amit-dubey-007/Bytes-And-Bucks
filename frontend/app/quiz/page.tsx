"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  QUIZ_QUESTIONS,
  QuizAnswers,
  Persona,
  ProductMatch,
  SmartBundle,
  determinePersona,
  rankProductsForUser,
  generateSmartBundles,
  saveQuizToStorage,
  getQuizFromStorage,
  clearQuizStorage,
  generateMealPlan,
  saveMealPlanSeed,
} from "@/lib/milletCatalog";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  Calendar,
  ShoppingBag,
  Flame,
  Zap,
  Leaf,
  PiggyBank,
  Compass,
  Check,
  Tag,
  Info,
} from "lucide-react";

export default function QuizPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({
    flavours: "",
    creations: [],
    budget: "",
    timings: [],
    mattersMost: "",
    adventurousness: "",
  });

  const [isCompleted, setIsCompleted] = useState(false);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [rankedProducts, setRankedProducts] = useState<ProductMatch[]>([]);
  const [bundles, setBundles] = useState<SmartBundle[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Restore existing quiz result on client mount
  useEffect(() => {
    setIsMounted(true);
    const saved = getQuizFromStorage();
    if (saved && saved.answers && saved.persona) {
      setAnswers(saved.answers);
      setPersona(saved.persona);
      const ranked = rankProductsForUser(saved.answers);
      setRankedProducts(ranked);
      setBundles(generateSmartBundles(ranked, saved.answers, saved.persona));
      setIsCompleted(true);
    }
  }, []);

  const currentQuestion = QUIZ_QUESTIONS[currentStep];
  const totalQuestions = QUIZ_QUESTIONS.length;
  const progressPercent = Math.round(((currentStep + 1) / totalQuestions) * 100);

  // Check if current step has valid answer
  const isCurrentStepValid = () => {
    if (!currentQuestion) return false;
    const key = currentQuestion.key as keyof QuizAnswers;
    const val = answers[key];
    if (Array.isArray(val)) {
      return val.length > 0;
    }
    return typeof val === "string" && val.trim().length > 0;
  };

  const handleOptionSelect = (optionLabel: string) => {
    const key = currentQuestion.key as keyof QuizAnswers;
    if (currentQuestion.isMultiSelect) {
      const currentList = (answers[key] as string[]) || [];
      if (optionLabel === "I Enjoy Trying Everything" || optionLabel === "Any Time of the Day") {
        // Toggle this option exclusively or toggle back
        if (currentList.includes(optionLabel)) {
          setAnswers((prev) => ({
            ...prev,
            [key]: currentList.filter((item) => item !== optionLabel),
          }));
        } else {
          setAnswers((prev) => ({
            ...prev,
            [key]: [optionLabel],
          }));
        }
      } else {
        const withoutUniversal = currentList.filter(
          (item) => item !== "I Enjoy Trying Everything" && item !== "Any Time of the Day"
        );
        if (withoutUniversal.includes(optionLabel)) {
          setAnswers((prev) => ({
            ...prev,
            [key]: withoutUniversal.filter((item) => item !== optionLabel),
          }));
        } else {
          setAnswers((prev) => ({
            ...prev,
            [key]: [...withoutUniversal, optionLabel],
          }));
        }
      }
    } else {
      setAnswers((prev) => ({
        ...prev,
        [key]: optionLabel,
      }));
    }
  };

  const isOptionSelected = (optionLabel: string) => {
    const key = currentQuestion.key as keyof QuizAnswers;
    const val = answers[key];
    if (Array.isArray(val)) {
      return val.includes(optionLabel);
    }
    return val === optionLabel;
  };

  const handleNext = () => {
    if (!isCurrentStepValid()) return;
    if (currentStep < totalQuestions - 1) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = () => {
    const calculatedPersona = determinePersona(answers);
    const ranked = rankProductsForUser(answers);
    const smartBundles = generateSmartBundles(ranked, answers, calculatedPersona);

    setPersona(calculatedPersona);
    setRankedProducts(ranked);
    setBundles(smartBundles);
    setIsCompleted(true);

    // Persist to storage
    saveQuizToStorage(answers, calculatedPersona);
    // Initialize deterministic meal plan seed
    saveMealPlanSeed(1);
    // Generate meal plan to ensure it is pre-warmed
    generateMealPlan(undefined, answers, 1);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRestart = () => {
    clearQuizStorage();
    setAnswers({
      flavours: "",
      creations: [],
      budget: "",
      timings: [],
      mattersMost: "",
      adventurousness: "",
    });
    setPersona(null);
    setRankedProducts([]);
    setBundles([]);
    setCurrentStep(0);
    setIsCompleted(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPersonaIcon = (iconName: string) => {
    switch (iconName) {
      case "Flame":
        return <Flame className="w-8 h-8 text-[#C66A45]" />;
      case "Zap":
        return <Zap className="w-8 h-8 text-[#D8A641]" />;
      case "Leaf":
        return <Leaf className="w-8 h-8 text-[#879568]" />;
      case "PiggyBank":
        return <PiggyBank className="w-8 h-8 text-[#183D2B]" />;
      case "Compass":
      default:
        return <Compass className="w-8 h-8 text-[#183D2B]" />;
    }
  };

  if (!isMounted) {
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

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF2E6] text-[#183D2B]">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
        {!isCompleted ? (
          /* ========================================================= */
          /* QUIZ QUESTIONS FLOW                                       */
          /* ========================================================= */
          <div className="space-y-8 max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#183D2B]/8 border border-[#183D2B]/15 text-[#183D2B] text-xs font-semibold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5 text-[#C66A45]" />
                <span>YOUR PERSONALIZED MILLET EXPERIENCE</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#183D2B] tracking-tight">
                Let&apos;s Find Your Millet Match
              </h1>
              <p className="text-sm sm:text-base text-[#252820]/75 max-w-xl mx-auto font-normal">
                Tell us a little about your preferences. We&apos;ll help you discover millet creations that suit your taste, budget, and everyday routine.
              </p>
            </div>

            {/* Progress Bar & Step info */}
            <div className="bg-white/70 backdrop-blur-xs rounded-2xl p-4 border border-[#EDE2CF] shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[#183D2B]">
                <span>
                  Question {currentStep + 1} of {totalQuestions}
                </span>
                <span>{progressPercent}% Complete</span>
              </div>
              <div className="w-full h-2.5 bg-[#EDE2CF] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#C66A45] via-[#D8A641] to-[#183D2B] transition-all duration-300 ease-out rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 sm:p-10 border border-[#EDE2CF] shadow-md space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#C66A45]">
                  Step {currentStep + 1}
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#183D2B] mt-1">
                  {currentQuestion.title}
                </h2>
                <p className="text-xs sm:text-sm text-[#252820]/70 mt-1">
                  {currentQuestion.subtitle}{" "}
                  {currentQuestion.isMultiSelect && (
                    <span className="font-medium text-[#C66A45]">(Select all that apply)</span>
                  )}
                </p>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {currentQuestion.options.map((option) => {
                  const selected = isOptionSelected(option.label);
                  return (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => handleOptionSelect(option.label)}
                      className={`relative flex items-start gap-3.5 p-4 sm:p-5 rounded-2xl text-left transition-all duration-200 border cursor-pointer select-none ${
                        selected
                          ? "bg-[#183D2B]/5 border-[#183D2B] ring-2 ring-[#183D2B]/20 shadow-sm"
                          : "bg-white/60 hover:bg-white border-[#EDE2CF] hover:border-[#C66A45]/40 shadow-2xs"
                      }`}
                    >
                      {/* Selection Indicator Circle */}
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                          selected
                            ? "bg-[#183D2B] text-white"
                            : "border-2 border-[#EDE2CF] bg-white"
                        }`}
                      >
                        {selected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      {/* Option details */}
                      <div className="space-y-1">
                        <span className="font-serif font-bold text-base text-[#183D2B] block">
                          {option.label}
                        </span>
                        <p className="text-xs text-[#252820]/75 leading-relaxed">
                          {option.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Validation message if nothing selected */}
              {!isCurrentStepValid() && (
                <div className="flex items-center gap-2 text-xs text-[#C66A45] pt-1 font-medium">
                  <Info className="w-4 h-4 flex-shrink-0" />
                  <span>
                    Please select {currentQuestion.isMultiSelect ? "at least one option" : "an option"}{" "}
                    to continue.
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-[#EDE2CF]">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                    currentStep === 0
                      ? "opacity-30 cursor-not-allowed text-[#252820]"
                      : "text-[#183D2B] hover:bg-[#EDE2CF]/60 active:scale-95 cursor-pointer"
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleRestart}
                    className="text-xs font-semibold text-[#252820]/60 hover:text-[#C66A45] px-3 py-2 transition-colors cursor-pointer"
                  >
                    Reset
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!isCurrentStepValid()}
                    className={`inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-semibold transition-all shadow-sm ${
                      isCurrentStepValid()
                        ? "bg-[#183D2B] text-[#FAF2E6] hover:bg-[#10291E] active:scale-95 cursor-pointer hover:shadow-md"
                        : "bg-[#183D2B]/30 text-white/70 cursor-not-allowed"
                    }`}
                  >
                    <span>
                      {currentStep === totalQuestions - 1
                        ? "Find My Millet Match →"
                        : "Next Question"}
                    </span>
                    {currentStep < totalQuestions - 1 && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* PERSONALIZED RESULTS VIEW (Feature Three)                 */
          /* ========================================================= */
          <div className="space-y-12">
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#183D2B]/8 border border-[#183D2B]/15 text-[#183D2B] text-xs font-semibold tracking-wider uppercase">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#183D2B]" />
                <span>QUIZ COMPLETE · YOUR PERSONALIZED DISCOVERY</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#183D2B] tracking-tight">
                Your Millet Match Results
              </h1>
              <p className="text-sm sm:text-base text-[#252820]/75 max-w-2xl mx-auto font-normal">
                Based on your taste preferences, budget, and daily routine, we have calculated your dining persona and matched our finest millet creations for you.
              </p>
            </div>

            {/* A & B. Persona Result Card */}
            {persona && (
              <div className="bg-gradient-to-br from-white via-[#FAF2E6] to-[#EDE2CF]/60 rounded-3xl p-6 sm:p-10 border border-[#EDE2CF] shadow-lg relative overflow-hidden">
                <div
                  className="pointer-events-none absolute -right-16 -top-16 w-64 h-64 rounded-full bg-[#D8A641]/10 blur-2xl"
                  aria-hidden="true"
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  <div className="lg:col-span-8 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-white shadow-xs border border-[#EDE2CF] flex items-center justify-center flex-shrink-0">
                        {renderPersonaIcon(persona.iconName)}
                      </div>
                      <div>
                        <span className="text-xs uppercase font-bold tracking-wider text-[#C66A45]">
                          Your Dining Persona
                        </span>
                        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#183D2B]">
                          You&apos;re {persona.name}
                        </h2>
                      </div>
                    </div>

                    <p className="text-sm sm:text-base text-[#252820]/80 leading-relaxed font-normal">
                      {persona.description}
                    </p>

                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      {persona.traits.map((trait) => (
                        <span
                          key={trait}
                          className="px-3 py-1 rounded-full bg-white/80 border border-[#EDE2CF] text-[#183D2B] text-xs font-semibold"
                        >
                          ✦ {trait}
                        </span>
                      ))}
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#183D2B]/5 border border-[#183D2B]/10 text-xs text-[#183D2B]">
                      <span className="font-bold">Why this was assigned: </span>
                      <span>{persona.whyAssigned}</span>
                    </div>
                  </div>

                  {/* Summary of Customer's Chosen Preferences */}
                  <div className="lg:col-span-4 bg-white/80 rounded-2xl p-5 border border-[#EDE2CF] space-y-3">
                    <h3 className="font-serif font-bold text-sm text-[#183D2B] border-b border-[#EDE2CF] pb-2">
                      Your Selected Preferences
                    </h3>
                    <ul className="text-xs space-y-2 text-[#252820]/80">
                      <li className="flex justify-between">
                        <span className="text-stone-500">Flavour:</span>
                        <span className="font-semibold text-[#183D2B]">{answers.flavours}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-stone-500">Budget:</span>
                        <span className="font-semibold text-[#183D2B]">{answers.budget}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-stone-500">Priority:</span>
                        <span className="font-semibold text-[#183D2B]">{answers.mattersMost}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-stone-500">Exploration:</span>
                        <span className="font-semibold text-[#183D2B] truncate max-w-[140px]" title={answers.adventurousness}>
                          {answers.adventurousness}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* C. Recommended Hero Product */}
            {rankedProducts.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs uppercase font-bold tracking-wider text-[#C66A45]">
                      TOP MATCH
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#183D2B]">
                      Your Recommended Hero Product
                    </h2>
                  </div>
                  <span className="text-xs text-stone-500 hidden sm:inline">
                    Calculated recommendation score based on your answers
                  </span>
                </div>

                {(() => {
                  const hero = rankedProducts[0];
                  return (
                    <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-[#EDE2CF] shadow-md hover:shadow-lg transition-all duration-300">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        {/* Image */}
                        <div className="lg:col-span-5 relative flex justify-center">
                          <div className="relative w-full max-w-[320px] aspect-square rounded-3xl bg-[#FAF2E6] p-6 border border-[#EDE2CF] flex items-center justify-center overflow-hidden group">
                            <Image
                              src={hero.product.image || "/millet-seasonal-bowl.png"}
                              alt={hero.product.name}
                              fill
                              sizes="(max-width: 640px) 260px, 320px"
                              className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute top-4 left-4 bg-[#183D2B] text-white px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                              {hero.matchScore}% Match
                            </div>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="lg:col-span-7 space-y-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-3 py-1 rounded-full bg-[#183D2B]/10 text-[#183D2B] text-xs font-semibold">
                              {hero.product.category}
                            </span>
                            {hero.product.badge && (
                              <span className="px-3 py-1 rounded-full bg-[#D8A641]/20 text-[#183D2B] text-xs font-semibold">
                                ★ {hero.product.badge}
                              </span>
                            )}
                          </div>

                          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#183D2B]">
                            {hero.product.name}
                          </h3>

                          <div className="text-xl sm:text-2xl font-bold text-[#C66A45]">
                            ₹{hero.product.numericPrice}
                          </div>

                          <p className="text-sm text-[#252820]/80 leading-relaxed font-normal">
                            {hero.product.description}
                          </p>

                          {/* Why this matches */}
                          <div className="bg-[#FAF2E6] rounded-2xl p-4 border border-[#EDE2CF] space-y-2">
                            <span className="text-xs font-bold text-[#183D2B] uppercase tracking-wider block">
                              Why it matches your profile:
                            </span>
                            <ul className="space-y-1">
                              {hero.reasons.map((reason, idx) => (
                                <li key={idx} className="text-xs text-[#252820]/85 flex items-start gap-2">
                                  <span className="text-[#C66A45] font-bold">✓</span>
                                  <span>{reason}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="pt-2 flex flex-wrap items-center gap-4">
                            <Link
                              href={`/products/${hero.product.slug}`}
                              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#183D2B] text-[#FAF2E6] text-sm font-semibold hover:bg-[#10291E] transition-all shadow-xs hover:shadow-md"
                            >
                              <span>View Product Details</span>
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* D. Additional Product Recommendations */}
            {rankedProducts.length > 1 && (
              <div className="space-y-4">
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-[#C66A45]">
                    MORE CURATED OPTIONS
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#183D2B]">
                    Additional High-Match Recommendations
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {rankedProducts.slice(1, 4).map((item) => (
                    <div
                      key={item.product.id}
                      className="bg-white rounded-3xl p-5 border border-[#EDE2CF] shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        {/* Image */}
                        <div className="relative aspect-square w-full rounded-2xl bg-[#FAF2E6] p-4 flex items-center justify-center overflow-hidden">
                          <Image
                            src={item.product.image || "/millet-seasonal-bowl.png"}
                            alt={item.product.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 300px"
                            className="object-contain p-2"
                          />
                          <div className="absolute top-3 left-3 bg-[#183D2B] text-white px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                            {item.matchScore}% Match
                          </div>
                        </div>

                        <div>
                          <span className="text-[11px] font-semibold text-[#879568] uppercase">
                            {item.product.category}
                          </span>
                          <h3 className="font-serif font-bold text-lg text-[#183D2B] line-clamp-1 mt-0.5">
                            {item.product.name}
                          </h3>
                          <div className="text-base font-bold text-[#C66A45] mt-1">
                            ₹{item.product.numericPrice}
                          </div>
                        </div>

                        <p className="text-xs text-[#252820]/75 line-clamp-2">
                          {item.product.description}
                        </p>

                        <div className="p-2.5 rounded-xl bg-[#FAF2E6] border border-[#EDE2CF] text-[11px] text-[#252820]/80">
                          <span className="font-semibold text-[#183D2B]">Match Reason: </span>
                          <span>{item.reasons[0] || "Wholesome millet creation"}</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-[#EDE2CF] mt-4">
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="inline-flex items-center justify-center w-full gap-2 px-4 py-2 rounded-full border border-[#183D2B]/30 text-[#183D2B] text-xs font-semibold hover:bg-[#EDE2CF]/60 transition-colors"
                        >
                          <span>View Product</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* E. Smart Product Bundles */}
            {bundles.length > 0 && (
              <div className="space-y-4">
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-[#C66A45]">
                    SAVINGS & VARIETY
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#183D2B]">
                    Smart Millet Combinations
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    *Illustrative bundle pricing designed for balanced meal discovery and cost planning.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {bundles.map((bundle) => (
                    <div
                      key={bundle.id}
                      className="bg-white/90 rounded-3xl p-6 border border-[#EDE2CF] shadow-xs flex flex-col justify-between relative overflow-hidden"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#C66A45] bg-[#C66A45]/10 px-2.5 py-1 rounded-full">
                            Save {bundle.savingsPercent}%
                          </span>
                          <span className="text-xs font-semibold text-[#879568]">
                            {bundle.products.length} Products
                          </span>
                        </div>

                        <div>
                          <h3 className="font-serif font-bold text-xl text-[#183D2B]">
                            {bundle.name}
                          </h3>
                          <p className="text-xs text-stone-600 mt-1">{bundle.tagline}</p>
                        </div>

                        {/* Products included */}
                        <div className="space-y-2 py-2">
                          <span className="text-[11px] font-bold text-[#183D2B] uppercase tracking-wider block">
                            Includes:
                          </span>
                          <div className="space-y-1.5">
                            {bundle.products.map((p) => (
                              <div
                                key={p.id}
                                className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-[#FAF2E6]"
                              >
                                <span className="font-medium text-[#183D2B] truncate max-w-[160px]">
                                  {p.name}
                                </span>
                                <span className="text-stone-500 font-semibold">₹{p.numericPrice}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Pricing details */}
                        <div className="p-3.5 rounded-2xl bg-[#183D2B]/5 border border-[#183D2B]/10 flex items-baseline justify-between">
                          <div>
                            <span className="text-[11px] text-stone-500 block">Total Individual</span>
                            <span className="text-xs line-through text-stone-400 font-semibold">
                              ₹{bundle.originalTotal}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[11px] font-semibold text-[#879568] block">
                              Bundle Price
                            </span>
                            <span className="text-xl font-bold text-[#183D2B]">
                              ₹{bundle.bundlePrice}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-[#252820]/75 leading-relaxed">
                          {bundle.explanation}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* F. Action Buttons */}
            <div className="bg-[#EDE2CF]/60 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-[#EDE2CF] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={handleRestart}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-[#183D2B]/30 text-[#183D2B] text-sm font-semibold hover:bg-white transition-colors cursor-pointer w-full sm:w-auto justify-center"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retake Quiz</span>
              </button>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white border border-[#EDE2CF] text-[#183D2B] text-sm font-semibold hover:bg-[#FAF2E6] transition-colors shadow-2xs w-full sm:w-auto"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Explore All Products</span>
                </Link>

                <Link
                  href="/meal-plan"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-[#183D2B] text-[#FAF2E6] text-sm font-semibold hover:bg-[#10291E] transition-all shadow-sm hover:shadow-md w-full sm:w-auto"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Create My 7-Day Meal Plan →</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
