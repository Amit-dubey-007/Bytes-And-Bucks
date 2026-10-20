import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import BrandHighlights from "@/components/BrandHighlights";
import SeasonalBowlsSection from "@/components/SeasonalBowlsSection";
import OrderMilletMargSection from "@/components/OrderMilletMargSection";
import Footer from "@/components/Footer";
import Image from "next/image";
import {
  ArrowRight,
  Sparkles,
  Leaf,
  ShieldCheck,
  Heart,
  Clock,
  MapPin,
  Mail,
  Phone,
  Check,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F7F1E5] text-[#183D2B]">
      {/* 1. TOP ANNOUNCEMENT BANNER */}
      <div className="bg-[#183D2B] text-[#F7F1E5] py-2 px-4 text-center text-xs font-medium tracking-wide">
        <span className="opacity-90">
          🌾 Freshly Harvested Millets from Southern Plains · Use code{" "}
          <span className="font-bold text-[#D8A641]">MILLETMUSH</span> for 15% off your first bowl
        </span>
      </div>

      {/* 2. NAVBAR */}
      <Navbar />

      {/* 3. HERO SECTION */}
      <main className="flex-1">
        <HeroSection />

        {/* 4. BRAND HIGHLIGHTS STRIP */}
        <BrandHighlights />

        {/* 5. HERO PRODUCT SPOTLIGHT (#milletbowl) */}
        <section id="milletbowl" className="py-20 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/60 rounded-3xl sm:rounded-[40px] p-8 sm:p-12 lg:p-16 border border-[#EDE2CF] shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-6 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#183D2B]/10 text-[#183D2B] text-xs font-semibold tracking-wider uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-[#C66A45]" />
                  <span>The MilletBowl™ Story</span>
                </div>

                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#183D2B] leading-tight">
                  Crafted for Wellness.
                  <br />
                  <span className="text-[#C66A45]">Flavored by Nature.</span>
                </h2>

                <p className="text-base sm:text-lg text-[#252820]/80 leading-relaxed font-normal">
                  Each MilletBowl is a harmonious symphony of ancient supergrains, slow-roasted legumes,
                  crisp seasonal vegetables, and probiotic herbs. We replace refined grains with nutrient-dense
                  foxtail, barnyard, and finger millets—nourishing your gut while leaving a lighter footprint on the earth.
                </p>

                {/* Ingredient details */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-[#F7F1E5] p-4 rounded-2xl border border-[#EDE2CF]">
                    <span className="font-serif font-bold text-lg text-[#183D2B]">14g+ Protein</span>
                    <p className="text-xs text-[#879568] mt-1">Complete plant-based energy from millets & chickpeas.</p>
                  </div>
                  <div className="bg-[#F7F1E5] p-4 rounded-2xl border border-[#EDE2CF]">
                    <span className="font-serif font-bold text-lg text-[#183D2B]">Low Glycemic</span>
                    <p className="text-xs text-[#879568] mt-1">Sustained fullness without afternoon sugar spikes.</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-4">
                  <a
                    href="#order"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#183D2B] text-[#F7F1E5] font-semibold text-sm hover:bg-[#10291E] transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5"
                  >
                    <span>Order MilletBowl ($14.50)</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <a
                    href="#menu"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-[#183D2B]/30 text-[#183D2B] font-medium text-sm hover:bg-[#EDE2CF]/60 transition-colors"
                  >
                    View Nutritional Profile
                  </a>
                </div>
              </div>

              {/* Visual Bowl Composition Diagram / Imagery */}
              <div className="lg:col-span-6 relative">
                <div className="relative aspect-square max-w-[480px] mx-auto rounded-[32px] sm:rounded-[44px] overflow-hidden shadow-xl border border-[#EDE2CF]">
                  <Image
                    src="/millet-bowl-hero.jpg"
                    alt="Wholesome MilletBowl detail"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#10291E]/70 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-[#F7F1E5]">
                    <span className="text-xs uppercase tracking-wider text-[#D8A641] font-semibold">
                      Farm Sourced
                    </span>
                    <h3 className="font-serif text-xl font-bold mt-1">
                      100% Unprocessed Goodness
                    </h3>
                    <p className="text-xs opacity-90 mt-1">
                      Foxtail millet base · Spiced chickpeas · Hass avocado · Steamed edamame · Pickled radish · Herb tahini
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. DISCOVER THE GOODNESS OF MILLETS (#menu) */}
        <SeasonalBowlsSection />

        {/* 7. ORDER MILLETMARG (#about) */}
        <OrderMilletMargSection />

        {/* 8. ORDER NOW SECTION (#order) */}
        <section id="order" className="py-16 bg-[#183D2B] text-[#F7F1E5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#D8A641]">
              Fresh Daily Delivery &amp; Pickup
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold">
              Ready for a Brighter Tomorrow?
            </h2>
            <p className="max-w-xl mx-auto text-base text-[#F7F1E5]/80 font-normal leading-relaxed">
              Order your warm artisan MilletBowl now or visit our wellness cafe for a wholesome culinary experience.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <a
                href="#milletbowl"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#C66A45] hover:bg-[#B55A37] text-white font-semibold text-base transition-all duration-200 shadow-md hover:-translate-y-0.5"
              >
                Order Signature MilletBowl ($14.50)
              </a>
              <a
                href="#contact"
                className="w-full sm:w-auto px-8 py-4 rounded-full border border-[#F7F1E5]/40 hover:border-[#F7F1E5] text-[#F7F1E5] font-medium text-base transition-colors"
              >
                Cafe Hours &amp; Locations
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* 9. FOOTER */}
      <Footer />
    </div>
  );
}
