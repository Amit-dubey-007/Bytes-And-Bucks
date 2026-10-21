"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  Leaf,
  MessageCircle,
  Star,
  Sprout,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const faqCategories = [
  "All Questions",
  "Products",
  "Orders & Delivery",
  "Café",
  "General",
];

const faqs = [
  {
    category: "Products",
    question: "What makes millet-based food special?",
    answer:
      "Millets are traditional grains that bring variety, texture, and goodness to everyday meals. MilletMarg explores creative ways to enjoy these grains through wholesome bowls, snacks, and other millet-based dishes.",
  },
  {
    category: "Products",
    question: "What types of millet products do you offer?",
    answer:
      "Our menu focuses on creative millet-based food, including millet bowls, salads, millet-based noodles, shakes, and other innovative dishes. Visit our Products page to explore the current selection.",
  },
  {
    category: "Products",
    question: "Are your products suitable for gluten-free diets?",
    answer:
      "Many millets are naturally gluten-free, but recipes and preparation methods can vary. Please contact our team to confirm the ingredients and cross-contamination precautions for a specific product before ordering.",
  },
  {
    category: "Products",
    question: "Do you offer vegan options?",
    answer:
      "Some dishes may be adaptable to different dietary preferences. Please contact our team to confirm which products are vegan and whether ingredient substitutions are available.",
  },
  {
    category: "Orders & Delivery",
    question: "How can I explore your products?",
    answer:
      "Visit our Products page to browse the available menu and discover millet-based food options. For ordering assistance, contact our team directly.",
  },
  {
    category: "Orders & Delivery",
    question: "Do you offer home delivery?",
    answer:
      "Delivery availability may depend on your location and the current ordering arrangements. Please contact MilletMarg directly to confirm whether delivery is available in your area.",
  },
  {
    category: "Orders & Delivery",
    question: "How can I ask about an order?",
    answer:
      "You can reach our team through the Contact Us page or WhatsApp. Share your query and any relevant order details so the team can assist you.",
  },
  {
    category: "Café",
    question: "Where is MilletMarg located?",
    answer:
      "MilletMarg is located in Indore, Madhya Pradesh, India. Visit our Contact Us page for location information and directions.",
  },
  {
    category: "Café",
    question: "What are your café opening hours?",
    answer:
      "Our listed café hours are 12:00 AM to 10:45 PM, all days. We recommend contacting the café to confirm its current operating hours before visiting.",
  },
  {
    category: "General",
    question: "How can I contact MilletMarg?",
    answer:
      "You can reach us through the Contact Us page, email, phone, or WhatsApp. Our team can help with questions about products, the café, and other enquiries.",
  },
];

const testimonials = [
  {
    quote:
      "I love the idea of bringing traditional millets into modern food. It makes exploring healthier food choices more interesting.",
    name: "Millet Food Enthusiast",
    label: "About millet-based food",
    initials: "MF",
  },
  {
    quote:
      "The concept of combining traditional ingredients with creative food options is refreshing. I am excited to explore more millet-based dishes.",
    name: "Food Explorer",
    label: "About the MilletMarg concept",
    initials: "FE",
  },
  {
    quote:
      "It is great to see a food concept that celebrates millets and connects modern eating habits with traditional grains.",
    name: "Millet Supporter",
    label: "About traditional grains",
    initials: "MS",
  },
];

export default function FAQReviewsPage() {
  const [activeCategory, setActiveCategory] = useState("All Questions");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFaqs =
    activeCategory === "All Questions"
      ? faqs
      : faqs.filter((faq) => faq.category === activeCategory);

  return (
    <>
      <Navbar />

      <main className="overflow-hidden bg-[#F7F1E5] text-[#183D2B]">
        {/* HERO SECTION */}
        <section className="relative px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border border-[#879568]/20"
          />

          <div className="relative mx-auto max-w-5xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#183D2B]/15 bg-white/50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#183D2B]">
              <Leaf className="h-4 w-4 text-[#C66A45]" />
              Your MilletMarg Guide
            </div>

            <h1 className="font-serif text-4xl font-medium leading-tight tracking-tight sm:text-5xl lg:text-7xl">
              Got Questions?
              <br />
              <span className="italic text-[#C66A45]">
                We&apos;ve Got Answers.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#252820]/75 sm:text-lg">
              Everything you need to know about our millet-based food, products,
              and café. Discover what makes MilletMarg different.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href="#faq"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#183D2B] px-7 py-3.5 text-sm font-semibold text-[#F7F1E5] transition hover:bg-[#10291E]"
              >
                Explore FAQs
                <ArrowRight className="h-4 w-4" />
              </a>

              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#183D2B]/20 px-7 py-3.5 text-sm font-semibold text-[#183D2B] transition hover:bg-[#EDE2CF]"
              >
                Contact Our Team
                <MessageCircle className="h-4 w-4" />
              </Link>
            </div>

            {/* BRAND VALUES */}
            <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 border-t border-[#183D2B]/10 pt-7">
              {[
                "Traditional Grains",
                "Thoughtful Food",
                "Modern Wellness",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-sm text-[#183D2B]/75"
                >
                  <Sprout className="h-4 w-4 text-[#879568]" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section id="faq" className="scroll-mt-24 px-5 py-16 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 max-w-2xl">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#C66A45]">
                Frequently Asked Questions
              </p>

              <h2 className="font-serif text-3xl font-medium leading-tight sm:text-4xl lg:text-5xl">
                A little clarity,
                <br />
                <span className="italic text-[#C66A45]">
                  one question at a time.
                </span>
              </h2>

              <p className="mt-4 text-sm leading-7 text-[#252820]/70 sm:text-base">
                Browse the questions below to learn more about MilletMarg.
              </p>
            </div>

            {/* CATEGORY FILTERS */}
            <div className="mb-8 flex gap-2 overflow-x-auto pb-3">
              {faqCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => {
                    setActiveCategory(category);
                    setOpenIndex(0);
                  }}
                  className={`shrink-0 rounded-full border px-4 py-2.5 text-sm font-medium transition ${
                    activeCategory === category
                      ? "border-[#183D2B] bg-[#183D2B] text-[#F7F1E5]"
                      : "border-[#183D2B]/15 bg-white/50 text-[#183D2B] hover:bg-[#EDE2CF]"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* ACCORDION */}
            <div className="divide-y divide-[#183D2B]/10 border-y border-[#183D2B]/10">
              {filteredFaqs.map((faq, index) => {
                const isOpen = openIndex === index;

                return (
                  <article key={faq.question} className="py-1">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() =>
                        setOpenIndex(isOpen ? null : index)
                      }
                      className="flex w-full items-center justify-between gap-5 py-5 text-left sm:py-6"
                    >
                      <span className="flex items-start gap-4">
                        <span className="mt-0.5 font-serif text-sm text-[#C66A45]">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <span
                          className={`font-serif text-lg leading-snug sm:text-xl ${
                            isOpen
                              ? "font-semibold text-[#183D2B]"
                              : "text-[#252820]"
                          }`}
                        >
                          {faq.question}
                        </span>
                      </span>

                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${
                          isOpen
                            ? "rotate-180 bg-[#183D2B] text-[#F7F1E5]"
                            : "bg-[#EDE2CF] text-[#183D2B]"
                        }`}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </span>
                    </button>

                    {isOpen && (
                      <div className="pb-6 pl-9 pr-12 sm:pl-10">
                        <p className="max-w-3xl text-sm leading-7 text-[#252820]/75 sm:text-base">
                          {faq.answer}
                        </p>

                        <span className="mt-3 inline-block text-xs font-semibold uppercase tracking-wider text-[#879568]">
                          {faq.category}
                        </span>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>

            {/* FAQ SUPPORT CTA */}
            <div className="mt-10 flex flex-col items-start justify-between gap-5 rounded-2xl border border-[#183D2B]/10 bg-white/50 p-6 sm:flex-row sm:items-center sm:p-8">
              <div>
                <h3 className="font-serif text-xl font-semibold sm:text-2xl">
                  Still have questions?
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#252820]/70">
                  Our team is here to help you learn more about MilletMarg.
                </p>
              </div>

              <Link
                href="/contact"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#C66A45] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#B55A37]"
              >
                Contact Us
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS SECTION */}
        <section
          id="reviews"
          className="bg-[#10291E] px-5 py-20 text-[#F7F1E5] sm:px-8 sm:py-24 lg:px-10"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#D8A641]">
                <Leaf className="h-4 w-4" />
                Our Community
              </div>

              <h2 className="font-serif text-3xl font-medium leading-tight sm:text-4xl lg:text-5xl">
                Good food brings us together.
              </h2>

              <p className="mt-5 text-sm leading-7 text-[#F7F1E5]/70 sm:text-base">
                We believe that celebrating traditional grains can inspire
                thoughtful food choices and a stronger connection to our roots.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial) => (
                <article
                  key={testimonial.name}
                  className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition-colors hover:border-[#D8A641]/40 sm:p-8"
                >
                  <div className="flex items-center gap-1 text-[#D8A641]">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="h-4 w-4"
                        aria-hidden="true"
                      />
                    ))}
                  </div>

                  <p className="mt-6 flex-1 font-serif text-lg leading-8 text-[#F7F1E5]/90">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>

                  <div className="mt-8 flex items-center gap-3 border-t border-white/10 pt-5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#D8A641]/15 font-serif text-sm font-semibold text-[#D8A641]">
                      {testimonial.initials}
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-[#F7F1E5]">
                        {testimonial.name}
                      </p>

                      <p className="mt-1 text-xs text-[#F7F1E5]/55">
                        {testimonial.label}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <p className="mt-6 text-center text-xs leading-6 text-[#F7F1E5]/50">
              The cards above are sample content to demonstrate the layout.
              Replace them with genuine customer feedback before publishing.
            </p>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-7 rounded-3xl bg-[#EDE2CF] p-7 sm:p-10 lg:flex-row lg:items-center lg:p-14">
            <div className="max-w-2xl">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#C66A45]">
                Your MilletMarg Journey
              </p>

              <h2 className="font-serif text-3xl font-medium leading-tight sm:text-4xl">
                Ready to explore a world of millets?
              </h2>

              <p className="mt-4 text-sm leading-7 text-[#252820]/75 sm:text-base">
                Discover our products and explore creative ways to bring
                traditional grains into modern living.
              </p>
            </div>

            <Link
              href="/products"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#183D2B] px-7 py-3.5 text-sm font-semibold text-[#F7F1E5] transition hover:bg-[#10291E]"
            >
              Explore Products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}