import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { foundersList, valuesList } from "@/config/aboutData";
import {
  ArrowRight,
  Heart,
  Leaf,
  Sprout,
  Sparkles,
  Wheat,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | MilletMarg",
  description:
    "Discover MilletMarg, our story, our people, and our commitment to celebrating traditional Indian millets and thoughtful food choices.",
};

function ValueIcon({ name }: { name: string }) {
  switch (name) {
    case "Wheat":
      return <Wheat className="h-6 w-6" />;
    case "Heart":
      return <Heart className="h-6 w-6" />;
    case "Sprout":
      return <Sprout className="h-6 w-6" />;
    case "Sparkles":
      return <Sparkles className="h-6 w-6" />;
    default:
      return <Leaf className="h-6 w-6" />;
  }
}

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F7F1E5] text-[#183D2B]">
      <Navbar />

      <main className="flex-1">
        {/* HERO */}
        <section className="overflow-hidden py-16 sm:py-20 lg:py-28">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#183D2B]/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest">
                <span className="h-2 w-2 rounded-full bg-[#C66A45]" />
                About MilletMarg
              </span>

              <h1 className="mt-6 font-serif text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Rooted in Tradition
                <span className="mt-2 block font-normal italic text-[#C66A45]">
                  Growing for Tomorrow
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-8 text-[#252820]/80 sm:text-lg">
                At MilletMarg, we bring the goodness of traditional Indian
                millets into modern everyday life. We celebrate our food
                heritage by making traditional grains approachable, enjoyable,
                and relevant to today's lifestyles.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="#our-story"
                  className="inline-flex items-center gap-2 rounded-full bg-[#183D2B] px-6 py-3.5 text-sm font-semibold text-[#F7F1E5] transition-colors hover:bg-[#10291E]"
                >
                  Our Story
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 rounded-full border border-[#183D2B]/30 px-6 py-3.5 text-sm font-semibold transition-colors hover:bg-[#EDE2CF]"
                >
                  Explore Products
                  <ArrowRight className="h-4 w-4 text-[#C66A45]" />
                </Link>
              </div>

              <div className="mt-10 grid grid-cols-3 gap-4 border-t border-[#EDE2CF] pt-6">
                <div>
                  <Wheat className="mb-2 h-5 w-5 text-[#C66A45]" />
                  <p className="text-sm font-semibold">Heritage</p>
                  <p className="mt-1 text-xs text-[#879568]">
                    Traditional grains
                  </p>
                </div>

                <div>
                  <Heart className="mb-2 h-5 w-5 text-[#C66A45]" />
                  <p className="text-sm font-semibold">Wellness</p>
                  <p className="mt-1 text-xs text-[#879568]">
                    Mindful choices
                  </p>
                </div>

                <div>
                  <Sprout className="mb-2 h-5 w-5 text-[#C66A45]" />
                  <p className="text-sm font-semibold">Sustainability</p>
                  <p className="mt-1 text-xs text-[#879568]">
                    Inspired by nature
                  </p>
                </div>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-lg">
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-[#EDE2CF]">
                <Image
                  src="/millet-bowl-hero1.jpg"
                  alt="MilletMarg's wholesome millet-inspired food"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#10291E]/80 via-transparent to-transparent" />

                <div className="absolute bottom-0 p-6 sm:p-8">
                  
                  <h2 className="mt-4 max-w-sm font-serif text-3xl font-bold leading-tight text-white sm:text-4xl">
                    Bringing Our Food Heritage Back to the Table
                  </h2>

                  <p className="mt-3 max-w-sm text-sm leading-6 text-white/85">
                    Celebrating traditional grains through a fresh,
                    contemporary perspective.
                  </p>
                </div>

                {/* "Inspired by Nature" badge — top-right, away from bottom text */}
                <div className="absolute top-4 right-4 z-10 rounded-2xl border border-white/20 bg-white/95 backdrop-blur-sm p-3.5 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EDE2CF]">
                      <Leaf className="h-5 w-5 text-[#C66A45]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#183D2B]">Inspired by Nature</p>
                      <p className="mt-0.5 text-xs text-[#879568]">Rooted in tradition</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* OUR STORY */}
        <section
          id="our-story"
          className="border-y border-[#EDE2CF] bg-[#EDE2CF]/40 py-16 sm:py-20 lg:py-24"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#C66A45]">
                Our Story
              </span>

              <h2 className="mt-4 font-serif text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                Rediscovering the Goodness of Our Roots
              </h2>

              <div className="mx-auto mt-5 h-1 w-16 rounded-full bg-[#C66A45]" />

              <p className="mt-6 text-base leading-8 text-[#252820]/80 sm:text-lg">
                India's traditional grains have nourished communities for
                generations. At MilletMarg, we believe this rich food heritage
                deserves a place in modern life. Our journey is about
                celebrating millets, exploring new ways to enjoy them, and
                encouraging people to reconnect with the food traditions that
                have shaped our culture.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
              <article className="rounded-3xl border border-[#EDE2CF] bg-white p-7 sm:p-9">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EDE2CF]">
                  <Wheat className="h-6 w-6 text-[#C66A45]" />
                </div>

                <h3 className="mt-5 font-serif text-2xl font-bold">
                  Honouring Tradition
                </h3>

                <p className="mt-4 text-sm leading-7 text-[#252820]/80 sm:text-base">
                  Millets such as ragi, jowar, bajra, and foxtail millet are
                  part of India's diverse agricultural and culinary heritage.
                  We want to help people rediscover these grains and appreciate
                  the traditions behind them.
                </p>
              </article>

              <article className="rounded-3xl border border-[#EDE2CF] bg-white p-7 sm:p-9">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EDE2CF]">
                  <Sprout className="h-6 w-6 text-[#C66A45]" />
                </div>

                <h3 className="mt-5 font-serif text-2xl font-bold">
                  Inspiring Modern Choices
                </h3>

                <p className="mt-4 text-sm leading-7 text-[#252820]/80 sm:text-base">
                  We bring traditional ingredients into contemporary food
                  culture. Our goal is to make discovering and enjoying
                  millet-based foods a natural part of everyday life.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* FOUNDERS */}
        <section
          id="founders"
          className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
        >
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#C66A45]">
              The People Behind MilletMarg
            </span>

            <h2 className="mt-4 font-serif text-3xl font-bold sm:text-4xl lg:text-5xl">
              Meet Our Founders
            </h2>

            <p className="mt-5 text-base leading-7 text-[#252820]/80 sm:text-lg">
              Get to know the people and ideas behind the MilletMarg journey
              and our passion for traditional Indian food.
            </p>
          </div>

          {foundersList.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {foundersList.map((founder) => (
                <article
                  key={founder.id}
                  className="group overflow-hidden rounded-3xl border border-[#EDE2CF] bg-white shadow-sm transition-shadow hover:shadow-lg"
                >
                  {/* Portrait image — clean, no overlay */}
                  <div className="relative aspect-[4/5] bg-[#EDE2CF] overflow-hidden">
                    <Image
                      src={founder.image}
                      alt={founder.imageAlt}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  {/* Content below image */}
                  <div className="p-5 sm:p-6">
                    <span className="inline-block rounded-full bg-[#C66A45]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#C66A45]">
                      {founder.role}
                    </span>
                    <h3 className="mt-2 font-serif text-xl font-bold leading-tight text-[#183D2B] sm:text-2xl">
                      {founder.name}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-[#252820]/80">
                      {founder.bio}
                    </p>

                    {founder.motivation && (
                      <blockquote className="mt-5 rounded-2xl border-l-4 border-[#C66A45] bg-[#F7F1E5] p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#C66A45]">
                          Why Millets?
                        </p>
                        <p className="mt-1.5 text-xs italic leading-5 text-[#183D2B]/90 sm:text-sm sm:leading-6">
                          &ldquo;{founder.motivation}&rdquo;
                        </p>
                      </blockquote>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-[#879568]">
              Founder information will be available soon.
            </p>
          )}
        </section>

        {/* MISSION AND VISION */}
        <section className="bg-[#10291E] py-16 text-[#F7F1E5] sm:py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#D8A641]">
                What Guides Us
              </span>

              <h2 className="mt-4 font-serif text-3xl font-bold sm:text-4xl lg:text-5xl">
                Our Mission &amp; Vision
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
              <article className="rounded-3xl border border-white/10 bg-white/5 p-7 sm:p-10">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D8A641]/15">
                  <Heart className="h-6 w-6 text-[#D8A641]" />
                </div>

                <h3 className="mt-6 font-serif text-2xl font-bold sm:text-3xl">
                  Our Mission
                </h3>

                <p className="mt-4 text-sm leading-7 text-white/80 sm:text-base">
                  To bring India's traditional millets closer to modern households by making them accessible, enjoyable, and easy to incorporate into everyday meals. We strive to celebrate our culinary roots while inspiring people to explore the versatility of these timeless grains.
                </p>
              </article>

              <article className="rounded-3xl border border-white/10 bg-white/5 p-7 sm:p-10">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#C66A45]/20">
                  <Sparkles className="h-6 w-6 text-[#D8A641]" />
                </div>

                <h3 className="mt-6 font-serif text-2xl font-bold sm:text-3xl">
                  Our Vision
                </h3>

                <p className="mt-4 text-sm leading-7 text-white/80 sm:text-base">
                  To create a future where millets are celebrated beyond tradition and embraced as part of contemporary food culture. We aspire to connect generations through food, encourage thoughtful choices, and keep India's rich millet heritage alive for years to come.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* CORE VALUES */}
        <section
          id="values"
          className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
        >
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#C66A45]">
              Our Principles
            </span>

            <h2 className="mt-4 font-serif text-3xl font-bold sm:text-4xl lg:text-5xl">
              The Values We Stand For
            </h2>

            <p className="mt-5 text-base leading-7 text-[#252820]/80 sm:text-lg">
              The principles that shape our approach to food, tradition, and
              the future we want to help build.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {valuesList.map((value) => (
              <article
                key={value.id}
                className="rounded-3xl border border-[#EDE2CF] bg-white p-6 sm:p-7"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EDE2CF]/60 text-[#C66A45]">
                  <ValueIcon name={value.iconName} />
                </div>

                <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-[#879568]">
                  {value.subtitle}
                </p>

                <h3 className="mt-2 font-serif text-xl font-bold">
                  {value.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-[#252820]/75">
                  {value.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="bg-[#183D2B] px-4 py-16 text-center text-[#F7F1E5] sm:px-6 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-3xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
              <Sprout className="h-7 w-7 text-[#D8A641]" />
            </div>

            <h2 className="mt-6 font-serif text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              Be Part of the MilletMarg Journey
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
              Discover our products, explore traditional grains, and join us in
              celebrating India's rich food heritage.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-full bg-[#D8A641] px-7 py-3.5 text-sm font-semibold text-[#10291E] transition-colors hover:bg-[#E8BD5F]"
              >
                Explore Products
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Contact Us
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}