import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  shopConfig,
  foundersList,
  storyMilestones,
  valuesList,
  approachItems,
  cafeGalleryList,
  futureGoalsList,
} from "@/config/aboutData";
import {
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  Clock,
  Compass,
  ExternalLink,
  Heart,
  Leaf,
  Mail,
  MapPin,
  Phone,
  Quote,
  Sparkles,
  Sprout,
  Wheat,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us — MilletMarg | Modern Millimilastic Wellness",
  description:
    "Discover the story of MilletMarg. We bridge ancient Indian supergrains, local farming communities, and modern mindful living through wholesome cafe creations and conscious food.",
};

// Helper to render icon for Values
function ValueIcon({ name }: { name: string }) {
  switch (name) {
    case "Wheat":
      return <Wheat className="w-6 h-6 text-[#C66A45]" />;
    case "Heart":
      return <Heart className="w-6 h-6 text-[#C66A45]" />;
    case "Sprout":
      return <Sprout className="w-6 h-6 text-[#C66A45]" />;
    case "Sparkles":
      return <Sparkles className="w-6 h-6 text-[#C66A45]" />;
    default:
      return <Leaf className="w-6 h-6 text-[#C66A45]" />;
  }
}

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F7F1E5] text-[#183D2B]">
    

      {/* Shared Navbar */}
      <Navbar />

      <main className="flex-1 w-full">
        {/* ========================================================================= */}
        {/* 1. HERO SECTION — OUR STORY                                              */}
        {/* ========================================================================= */}
        <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-[#F7F1E5]">
          {/* Subtle Organic Background Blob Accents */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#EDE2CF]/60 rounded-full blur-3xl -z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-80 h-80 bg-[#D8A641]/10 rounded-full blur-3xl -z-10 pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* Left Column: Editorial Headline & Actions */}
              <div className="lg:col-span-7 space-y-6">
                {/* Eyebrow Pill */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#183D2B]/10 text-[#183D2B] text-xs font-semibold tracking-widest uppercase">
                  <span className="w-2 h-2 rounded-full bg-[#C66A45]" />
                  <span>Our Story</span>
                </div>

                <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#183D2B] tracking-tight leading-[1.12]">
                  Rooted in Tradition. <br />
                  <span className="text-[#C66A45] italic font-normal">Growing for Tomorrow.</span>
                </h1>

                <p className="text-lg sm:text-xl text-[#252820]/80 leading-relaxed font-normal max-w-2xl">
                  At MilletMarg, we stand at the vibrant intersection of ancient Indian food wisdom
                  and modern mindful living. We cultivate honest, nutrient-dense culinary experiences
                  that honor local farmers, nurture the land, and revive the supergrains that nourished
                  our civilization for millennia.
                </p>

                {/* Call-to-action buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <a
                    href="#story"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#183D2B] text-[#F7F1E5] font-semibold text-sm hover:bg-[#10291E] transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5"
                  >
                    <span>Discover Our Story</span>
                    <ArrowDown className="w-4 h-4" />
                  </a>

                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-[#183D2B]/30 text-[#183D2B] font-semibold text-sm hover:bg-[#EDE2CF]/60 transition-colors"
                  >
                    <span>Explore Our Products</span>
                    <ArrowRight className="w-4 h-4 text-[#C66A45]" />
                  </Link>
                </div>

                {/* Quick Trust Highlights */}
                <div className="pt-6 grid grid-cols-3 gap-4 border-t border-[#EDE2CF]">
                  <div>
                    <span className="block font-serif text-xl sm:text-2xl font-bold text-[#183D2B]">
                      5,000+
                    </span>
                    <span className="text-xs text-[#879568]">Years of Grain Heritage</span>
                  </div>
                  <div>
                    <span className="block font-serif text-xl sm:text-2xl font-bold text-[#183D2B]">
                      100%
                    </span>
                    <span className="text-xs text-[#879568]">Unpolished Supergrains</span>
                  </div>
                  <div>
                    <span className="block font-serif text-xl sm:text-2xl font-bold text-[#183D2B]">
                      0%
                    </span>
                    <span className="text-xs text-[#879568]">Refined Fillers or Flours</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Visual Editorial Composition */}
              <div className="lg:col-span-5 relative">
                <div className="relative mx-auto max-w-md lg:max-w-none">
                  {/* Decorative Frame */}
                  <div className="relative rounded-3xl overflow-hidden bg-white/70 backdrop-blur-xs border border-[#EDE2CF] p-4 shadow-xl">
                    <div className="relative aspect-4/5 rounded-2xl overflow-hidden bg-[#EDE2CF]">
                      <Image
                        src="/millet-bowl-hero.jpg"
                        alt="The art of MilletMarg wholesome grain cooking"
                        fill
                        className="object-cover"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#10291E]/80 via-transparent to-transparent" />
                      
                      <div className="absolute bottom-6 left-6 right-6 text-[#F7F1E5]">
                        <span className="inline-block px-3 py-1 rounded-full bg-[#D8A641] text-[#10291E] text-[11px] font-bold uppercase tracking-wider mb-2">
                          Modern Millimilastic Wellness
                        </span>
                        <h3 className="font-serif text-2xl font-bold leading-snug">
                          A Touch of Farm on Every Plate
                        </h3>
                        <p className="text-xs text-[#F7F1E5]/80 mt-1">
                          Reclaiming biodiversity through joyful, everyday nourishment.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Floating Badge */}
                  <div className="absolute -bottom-6 -left-6 sm:-bottom-8 sm:-left-8 bg-[#183D2B] text-[#F7F1E5] rounded-2xl p-4 shadow-xl border border-[#EDE2CF]/20 max-w-[200px]">
                    <div className="flex items-center gap-2 text-[#D8A641] mb-1">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Ancient Wisdom</span>
                    </div>
                    <p className="text-[11px] text-[#F7F1E5]/80 leading-snug">
                      Climate-smart, low-water crops that nourish soil and human health.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. THE MILLETMARG STORY / OUR JOURNEY                                    */}
        {/* ========================================================================= */}
        <section id="story" className="py-20 lg:py-28 bg-[#EDE2CF]/40 border-y border-[#EDE2CF]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#183D2B]/10 text-[#183D2B] text-xs font-semibold tracking-wider uppercase">
                <Compass className="w-3.5 h-3.5 text-[#C66A45]" />
                <span>Our Journey</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#183D2B]">
                More Than Food. A Return to Our Roots.
              </h2>
              <div className="w-16 h-1 bg-[#C66A45] mx-auto rounded-full" />
              <p className="text-base sm:text-lg text-[#252820]/80 leading-relaxed pt-2">
                For millennia, millets were the lifeblood of Indian kitchens—thriving through droughts,
                recharging the soil, and fueling agrarian communities with slow-burning vitality.
                When modern industrial diets replaced native grains with refined wheat and rice,
                we lost not only vital nutrition, but a sacred balance with nature.
              </p>
            </div>

            {/* Narrative Editorial Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-16 bg-white/70 rounded-3xl p-8 sm:p-12 border border-[#EDE2CF]">
              <div className="space-y-4 text-sm sm:text-base text-[#252820]/80 leading-relaxed">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#183D2B]">
                  The Forgotten Supergrains
                </h3>
                <p>
                  Millets—whether delicate Foxtail (<em>Kangni</em>), pearl-white Barnyard (<em>Sanwa</em>),
                  iron-rich Kodo (<em>Kodon</em>), or calcium-dense Finger Millet (<em>Ragi</em>)—have
                  grown in our subcontinental soil for over 5,000 years. They require less than a third of
                  the water needed by commercial paddy crops and flourish without reliance on heavy synthetic fertilizers.
                </p>
                <p>
                  Yet over recent decades, urbanization and convenience shifted palates toward stripped,
                  hyper-processed grains, resulting in widespread dietary imbalances and depleted agricultural ecosystems.
                </p>
              </div>

              <div className="space-y-4 text-sm sm:text-base text-[#252820]/80 leading-relaxed">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#183D2B]">
                  The MilletMarg Awakening
                </h3>
                <p>
                  MilletMarg began with an unyielding belief: healthy eating does not have to feel clinical,
                  bland, or restrictive. By coupling ancient supergrains with modern culinary artistry,
                  we create vibrant, comforting meals that speak directly to the contemporary palate.
                </p>
                <p>
                  Today, MilletMarg is more than just a menu—it is an invitation to slow down, honor our roots,
                  and savor the wholesome goodness of nature as it was always intended to be enjoyed.
                </p>
              </div>
            </div>

            {/* Milestones Roadmap Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {storyMilestones.map((milestone, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-6 border border-[#EDE2CF] shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#C66A45]">
                      {milestone.period}
                    </span>
                    <h4 className="font-serif text-lg font-bold text-[#183D2B] mt-2 mb-3">
                      {milestone.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-[#252820]/75 leading-relaxed">
                      {milestone.description}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-[#EDE2CF]/60 flex items-center justify-between text-[#879568] text-xs font-medium">
                    <span>Milestone 0{idx + 1}</span>
                    <CheckCircle2 className="w-4 h-4 text-[#879568]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. MEET THE FOUNDERS                                                     */}
        {/* ========================================================================= */}
        <section id="founders" className="py-20 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#183D2B]/10 text-[#183D2B] text-xs font-semibold tracking-wider uppercase">
              <Wheat className="w-3.5 h-3.5 text-[#C66A45]" />
              <span>The Custodians</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#183D2B]">
              Meet the People Behind MilletMarg
            </h2>
            <div className="w-16 h-1 bg-[#C66A45] mx-auto rounded-full" />
            <p className="text-base sm:text-lg text-[#252820]/80 leading-relaxed pt-2">
              Driven by a shared reverence for the soil, ancient Indian food traditions, and modern
              wholesome eating. We work intimately with farming clusters and culinary innovators
              to bring millets back to pride of place.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-12">
            {foundersList.map((founder) => (
              <div
                key={founder.id}
                className="bg-white rounded-3xl border border-[#EDE2CF] overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col"
              >
                {/* Founder Image Banner */}
                <div className="relative aspect-4/3 w-full bg-[#EDE2CF] overflow-hidden">
                  <Image
                    src={founder.image}
                    alt={founder.imageAlt}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#10291E]/70 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-[#F7F1E5]">
                    <span className="px-3 py-1 rounded-full bg-[#10291E]/80 backdrop-blur-xs text-xs font-medium border border-white/20">
                      {founder.role}
                    </span>
                  </div>
                </div>

                {/* Founder Content Details */}
                <div className="p-8 sm:p-10 flex-1 flex flex-col justify-between space-y-6">
                  <div>
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#183D2B]">
                      {founder.name}
                    </h3>
                    <p className="text-sm font-semibold text-[#C66A45] mt-1">
                      {founder.role}
                    </p>

                    <p className="text-sm sm:text-base text-[#252820]/80 leading-relaxed mt-4">
                      {founder.bio}
                    </p>
                  </div>

                  {/* Motivation Quote */}
                  <div className="bg-[#F7F1E5] rounded-2xl p-5 border-l-4 border-[#C66A45] space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C66A45]">
                      <Quote className="w-3.5 h-3.5" />
                      <span>Why Millets?</span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#183D2B]/90 italic leading-relaxed">
                      &ldquo;{founder.motivation}&rdquo;
                    </p>
                  </div>

                  {/* Vision Statement */}
                  <div className="bg-[#183D2B]/5 rounded-2xl p-5 border-l-4 border-[#879568] space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#879568]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>The Vision</span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#183D2B]/90 leading-relaxed">
                      {founder.vision}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Transparent Configuration Note */}
          <div className="mt-8 text-center">
            <span className="inline-block px-4 py-2 rounded-full bg-[#EDE2CF]/60 text-xs text-[#879568] border border-[#EDE2CF]">
              💡 Tip: Founder identities, bios, and portraits can be seamlessly customized in{" "}
              <code className="font-semibold text-[#183D2B]">config/aboutData.ts</code>
            </span>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4 & 5. OUR MISSION & VISION                                              */}
        {/* ========================================================================= */}
        <section className="py-20 lg:py-28 bg-[#10291E] text-[#F7F1E5] relative overflow-hidden">
          {/* Subtle Decorative Background Lines */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#F7F1E5" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-stretch">
              {/* Mission Card */}
              <div className="bg-[#183D2B]/70 rounded-3xl p-8 sm:p-12 border border-[#879568]/30 flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D8A641]/20 text-[#D8A641] text-xs font-semibold tracking-wider uppercase mb-6">
                    <Heart className="w-3.5 h-3.5" />
                    <span>Our Mission</span>
                  </div>

                  <h3 className="font-serif text-3xl sm:text-4xl font-bold leading-tight text-white mb-6">
                    Making Traditional Goodness Part of Everyday Life.
                  </h3>

                  <p className="text-base text-[#F7F1E5]/80 leading-relaxed mb-8">
                    Millets should never be confined to clinical diet charts, specialty health aisles, or
                    fleeting food trends. Our mission is to make whole, indigenous grains effortless, joyful,
                    and craveable for every meal. By crafting chef-driven bowls, modern sourdoughs, and
                    nourishing refreshments, we transform timeless grains into your daily wellness ritual.
                  </p>
                </div>

                <div className="space-y-4 pt-6 border-t border-[#879568]/30">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#D8A641] shrink-0 mt-0.5" />
                    <span className="text-sm text-[#F7F1E5]/90">
                      <strong>Uncompromising Whole Grains:</strong> 100% unpolished, mineral-dense varieties sourced with full integrity.
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#D8A641] shrink-0 mt-0.5" />
                    <span className="text-sm text-[#F7F1E5]/90">
                      <strong>Contemporary Flavor:</strong> Thoughtfully paired with natural legumes, slow-cooked broths, and fresh herbs.
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#D8A641] shrink-0 mt-0.5" />
                    <span className="text-sm text-[#F7F1E5]/90">
                      <strong>Regenerative Future:</strong> Conserving water and elevating agrarian livelihoods with every harvest.
                    </span>
                  </div>
                </div>
              </div>

              {/* Vision Card */}
              <div className="bg-[#183D2B]/70 rounded-3xl p-8 sm:p-12 border border-[#879568]/30 flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C66A45]/30 text-[#C66A45] text-xs font-semibold tracking-wider uppercase mb-6">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Our Vision</span>
                  </div>

                  <h3 className="font-serif text-3xl sm:text-4xl font-bold leading-tight text-white mb-6">
                    A Healthier Future, Rooted in Our Heritage.
                  </h3>

                  <p className="text-base text-[#F7F1E5]/80 leading-relaxed mb-8">
                    We envision an India—and a connected world—where native biodiversity is celebrated on
                    every dining table. A future where smallholder farmers are justly rewarded for cultivating
                    ancient, climate-smart grains, and where mindful dining harmonizes personal vitality
                    with ecological balance.
                  </p>
                </div>

                {/* Highlighted Quote Banner */}
                <div className="bg-[#10291E] rounded-2xl p-6 border border-[#D8A641]/30">
                  <p className="font-serif text-lg sm:text-xl text-[#D8A641] italic leading-snug">
                    &ldquo;When we honor the grain, we heal the soil, empower the farmer, and nourish ourselves.&rdquo;
                  </p>
                  <p className="text-xs text-[#879568] mt-3 uppercase tracking-wider font-semibold">
                    The MilletMarg Creed
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. OUR VALUES                                                            */}
        {/* ========================================================================= */}
        <section id="values" className="py-20 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#183D2B]/10 text-[#183D2B] text-xs font-semibold tracking-wider uppercase">
              <Sprout className="w-3.5 h-3.5 text-[#C66A45]" />
              <span>Core Values</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#183D2B]">
              The Principles That Guide Every Bowl
            </h2>
            <div className="w-16 h-1 bg-[#C66A45] mx-auto rounded-full" />
            <p className="text-base sm:text-lg text-[#252820]/80 leading-relaxed pt-2">
              Four non-negotiable cornerstones shape how we source our grains, curate our recipes,
              and build authentic relationships with our guests and community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {valuesList.map((val) => (
              <div
                key={val.id}
                className="bg-white rounded-3xl p-8 border border-[#EDE2CF] shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-[#EDE2CF]/60 flex items-center justify-center mb-6 group-hover:bg-[#C66A45]/10 transition-colors">
                    <ValueIcon name={val.iconName} />
                  </div>

                  <span className="text-xs font-semibold text-[#879568] uppercase tracking-wider">
                    {val.subtitle}
                  </span>

                  <h3 className="font-serif text-xl font-bold text-[#183D2B] mt-1 mb-3">
                    {val.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#252820]/75 leading-relaxed">
                    {val.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-[#EDE2CF]/60 flex items-center justify-between text-xs text-[#C66A45] font-semibold">
                  <span>Guiding Principle</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C66A45]" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 7. OUR APPROACH TO MILLETS                                               */}
        {/* ========================================================================= */}
        <section className="py-20 lg:py-28 bg-[#EDE2CF]/30 border-y border-[#EDE2CF]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#183D2B]/10 text-[#183D2B] text-xs font-semibold tracking-wider uppercase">
                <Leaf className="w-3.5 h-3.5 text-[#C66A45]" />
                <span>Culinary Philosophy</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#183D2B]">
                Ancient Grains. New Possibilities.
              </h2>
              <div className="w-16 h-1 bg-[#C66A45] mx-auto rounded-full" />
              <p className="text-base sm:text-lg text-[#252820]/80 leading-relaxed pt-2">
                We believe millets are not just an alternative to modern grains—they are an upgrade.
                Here is how we bring this ancient wisdom into contemporary everyday lifestyles.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {approachItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl overflow-hidden border border-[#EDE2CF] shadow-xs hover:shadow-md transition-all duration-300 flex flex-col"
                >
                  {/* Food Image Container */}
                  <div className="relative aspect-4/3 w-full bg-[#EDE2CF]/50 p-4 flex items-center justify-center">
                    <div className="relative w-40 h-40 transform hover:scale-105 transition-transform duration-300">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-contain drop-shadow-md"
                      />
                    </div>
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-xs text-[11px] font-bold text-[#183D2B] border border-[#EDE2CF]">
                      {item.tag}
                    </span>
                  </div>

                  {/* Text Details */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[11px] font-semibold text-[#879568] uppercase tracking-wider">
                        {item.subtitle}
                      </span>
                      <h3 className="font-serif text-lg font-bold text-[#183D2B] mt-1 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#252820]/75 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#EDE2CF]/60 flex items-center gap-1.5 text-xs text-[#183D2B] font-semibold">
                      <Sparkles className="w-3.5 h-3.5 text-[#C66A45]" />
                      <span>Artisan Crafted</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 8. INSIDE MILLETMARG — OUR CAFÉ & SHOP                                   */}
        {/* ========================================================================= */}
        <section className="py-20 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#183D2B]/10 text-[#183D2B] text-xs font-semibold tracking-wider uppercase">
                <MapPin className="w-3.5 h-3.5 text-[#C66A45]" />
                <span>Our Physical Space</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#183D2B]">
                Come Experience MilletMarg.
              </h2>
              <div className="w-16 h-1 bg-[#C66A45] rounded-full" />
              <p className="text-base sm:text-lg text-[#252820]/80 leading-relaxed pt-2">
                A warm, earthy sanctuary where wholesome food and community meet. Step inside our tranquil
                space designed with natural wood, terracotta pots, sunlit seating, and the aroma of
                freshly ground grains.
              </p>
            </div>

            <div>
              <a
                href="#location"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#183D2B] text-[#F7F1E5] font-semibold text-sm hover:bg-[#10291E] transition-colors shadow-xs"
              >
                <span>Find Our Café Table</span>
                <ArrowDown className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Café Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cafeGalleryList.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-3xl overflow-hidden bg-white border border-[#EDE2CF] shadow-xs hover:shadow-xl transition-all duration-300"
              >
                <div className="relative aspect-4/3 w-full bg-[#EDE2CF] overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#10291E]/80 via-transparent to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-xs text-[11px] font-bold text-[#183D2B] border border-[#EDE2CF]">
                      {item.category}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 text-[#F7F1E5]">
                    <h3 className="font-serif text-base font-bold leading-snug">
                      {item.title}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 9. VISIT OUR SHOP / LOCATION MAP                                         */}
        {/* ========================================================================= */}
        <section id="location" className="py-20 lg:py-28 bg-[#EDE2CF]/40 border-y border-[#EDE2CF]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#183D2B]/10 text-[#183D2B] text-xs font-semibold tracking-wider uppercase">
                <MapPin className="w-3.5 h-3.5 text-[#C66A45]" />
                <span>Visit Our Shop</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#183D2B]">
                Find Your Way to MilletMarg
              </h2>
              <div className="w-16 h-1 bg-[#C66A45] mx-auto rounded-full" />
              <p className="text-base sm:text-lg text-[#252820]/80 leading-relaxed pt-2">
                We would love to welcome you to our table. Drop by for an energizing breakfast bowl,
                an afternoon herbal brew, or to pick up fresh pantry supergrains.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Left Column: Location Info Card */}
              <div className="lg:col-span-5 bg-white rounded-3xl p-8 sm:p-10 border border-[#EDE2CF] shadow-xs flex flex-col justify-between space-y-8">
                <div>
                  <div className="space-y-1 mb-6">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#C66A45]">
                      MilletMarg Flagship
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#183D2B]">
                      {shopConfig.name}
                    </h3>
                    <p className="text-xs text-[#879568]">
                      {shopConfig.tagline}
                    </p>
                  </div>

                  {/* Address */}
                  <div className="space-y-4 pt-4 border-t border-[#EDE2CF]">
                    <div className="flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-full bg-[#EDE2CF]/60 flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-4 h-4 text-[#C66A45]" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#183D2B]">
                          Address
                        </h4>
                        <p className="text-sm text-[#252820]/80 mt-0.5 leading-snug">
                          {shopConfig.addressLine1}
                          <br />
                          {shopConfig.addressLine2}
                          <br />
                          {shopConfig.cityStateZip}, {shopConfig.country}
                        </p>
                      </div>
                    </div>

                    {/* Opening Hours */}
                    <div className="flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-full bg-[#EDE2CF]/60 flex items-center justify-center shrink-0 mt-0.5">
                        <Clock className="w-4 h-4 text-[#C66A45]" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#183D2B]">
                          Café &amp; Store Hours
                        </h4>
                        <p className="text-sm text-[#252820]/80 mt-0.5 leading-snug">
                          {shopConfig.openingHours.weekdays}
                          <br />
                          {shopConfig.openingHours.weekends}
                        </p>
                      </div>
                    </div>

                    {/* Phone & Email */}
                    <div className="flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-full bg-[#EDE2CF]/60 flex items-center justify-center shrink-0 mt-0.5">
                        <Phone className="w-4 h-4 text-[#C66A45]" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#183D2B]">
                          Contact Us
                        </h4>
                        <p className="text-sm text-[#252820]/80 mt-0.5 leading-snug">
                          {shopConfig.phone}
                          <br />
                          {shopConfig.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Note & Directions CTA */}
                <div className="space-y-4 pt-6 border-t border-[#EDE2CF]">
                  <div className="flex items-center gap-2 text-xs text-[#879568]">
                    <CheckCircle2 className="w-4 h-4 text-[#879568]" />
                    <span>{shopConfig.note}</span>
                  </div>

                  <a
                    href={shopConfig.googleMapsDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-full bg-[#183D2B] text-[#F7F1E5] font-semibold text-sm hover:bg-[#10291E] transition-all duration-200 shadow-xs hover:shadow-md"
                  >
                    <span>Get Directions on Google Maps</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Right Column: Google Maps Embed Frame */}
              <div className="lg:col-span-7 flex flex-col">
                <div className="relative w-full h-full min-h-[420px] rounded-3xl overflow-hidden border border-[#EDE2CF] shadow-xs bg-white">
                  <iframe
                    title="MilletMarg Café Location Map"
                    src={shopConfig.googleMapsEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0, minHeight: "420px" }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-full"
                  />
                  {/* Subtle map overlay badge */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-[#EDE2CF] shadow-xs text-xs font-semibold text-[#183D2B] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#C66A45]" />
                    <span>Interactive Map</span>
                  </div>
                </div>

                <div className="mt-3 text-right">
                  <span className="text-[11px] text-[#879568]">
                    Edit embed URL and coordinates in <code className="font-semibold">config/aboutData.ts</code>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 10. OUR GOALS — LOOKING AHEAD                                            */}
        {/* ========================================================================= */}
        <section className="py-20 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#183D2B]/10 text-[#183D2B] text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[#C66A45]" />
              <span>Looking Ahead</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#183D2B]">
              Where We Want to Go
            </h2>
            <div className="w-16 h-1 bg-[#C66A45] mx-auto rounded-full" />
            <p className="text-base sm:text-lg text-[#252820]/80 leading-relaxed pt-2">
              Our journey is just beginning. As we cultivate a wider awareness of native crops,
              here are the core milestones guiding our future growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {futureGoalsList.map((goal, index) => (
              <div
                key={goal.number}
                className={`bg-white rounded-3xl p-8 border border-[#EDE2CF] shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between ${
                  index === 0 ? "lg:col-span-2 lg:flex-row lg:items-center lg:gap-8" : ""
                }`}
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#EDE2CF]/60 flex items-center justify-center font-serif text-lg font-bold text-[#C66A45] mb-4">
                    {goal.number}
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[#183D2B] mb-2">
                    {goal.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#252820]/75 leading-relaxed">
                    {goal.description}
                  </p>
                </div>

                <div className="mt-6 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-[#EDE2CF]/60 shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#183D2B]/5 text-[#183D2B] text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#879568]" />
                    <span>Committed Goal</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 11. CLOSING CTA SECTION                                                  */}
        {/* ========================================================================= */}
        <section className="py-20 lg:py-28 bg-[#10291E] text-[#F7F1E5] relative overflow-hidden">
          {/* Subtle Organic Background Glows */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#183D2B] rounded-full blur-3xl opacity-50 pointer-events-none" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D8A641]/20 text-[#D8A641] text-xs font-semibold tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Join the Movement</span>
            </div>

            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.15]">
              Be Part of the MilletMarg Journey.
            </h2>

            <p className="text-base sm:text-xl text-[#F7F1E5]/80 max-w-2xl mx-auto leading-relaxed">
              Whether you drop by our café for a steaming millet brew or order wholesome pantry
              essentials to your doorstep, every single choice is a vote for better health, resilient
              farmers, and a greener earth.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#C66A45] text-white font-semibold text-sm hover:bg-[#B55A37] transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <span>Explore Our Menu &amp; Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="#location"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-[#F7F1E5]/30 text-[#F7F1E5] font-semibold text-sm hover:bg-[#F7F1E5]/10 transition-colors"
              >
                <span>Visit Our Café</span>
                <MapPin className="w-4 h-4 text-[#D8A641]" />
              </a>
            </div>

            {/* Reassurance Pills */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-[#879568]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#D8A641]" />
                100% Unpolished Native Grains
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#D8A641]" />
                Direct Farmer Sourcing
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#D8A641]" />
                Made Fresh Daily with Love
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* Shared Footer */}
      <Footer />
    </div>
  );
}