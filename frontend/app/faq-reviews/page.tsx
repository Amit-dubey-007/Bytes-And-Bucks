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
      "Millets are ancient Indian supergrains packed with nutritional benefits that refined grains simply cannot match. They are rich in dietary fibre, plant-based protein, iron, calcium, and essential B vitamins. Millets have a low glycaemic index, which means they release energy slowly and help maintain stable blood sugar levels — making them ideal for everyday wellness. At MilletMarg, we celebrate these traditional grains by crafting wholesome, flavourful, farm-to-table dishes that make eating well a genuine pleasure.",
  },
  {
    category: "Products",
    question: "What types of millet products do you offer?",
    answer:
      "MilletMarg offers a curated range of millet-based food and café dishes including millet bowls, millet-based noodles, millet salads, healthy shakes and beverages, and seasonal specials. Our menu is built around the belief that nutritious food should also be delicious and satisfying. We use a variety of millets such as foxtail millet (kangni), finger millet (ragi), pearl millet (bajra), sorghum (jowar), and little millet to keep our offerings diverse and interesting. Visit our Products page to explore the full current menu.",
  },
  {
    category: "Products",
    question: "Are your products suitable for gluten-free diets?",
    answer:
      "Most millets are naturally gluten-free, making them an excellent grain choice for people with gluten sensitivity or those avoiding wheat. Foxtail millet, ragi, bajra, jowar, and little millet are all inherently free of gluten. However, some of our dishes may be prepared in kitchens that also handle wheat-based ingredients. If you have a strict gluten intolerance or coeliac disease, we recommend contacting our team directly before ordering so we can confirm the preparation process and ingredients for a specific dish.",
  },
  {
    category: "Products",
    question: "Do you offer vegan options?",
    answer:
      "Yes! A significant portion of our menu is plant-based and vegan-friendly. Millets themselves are 100% plant-based, and many of our bowls and dishes are prepared with fresh vegetables, legumes, seeds, and natural seasonings. We are happy to guide you to suitable options. Please let our team know your dietary preference when ordering and we will ensure your meal is tailored accordingly.",
  },
  {
    category: "Products",
    question: "Are millets good for weight management?",
    answer:
      "Millets can be a great ally in weight management. Their high dietary fibre content promotes satiety — keeping you fuller for longer and reducing unnecessary snacking. Their low glycaemic index prevents blood sugar spikes that often lead to cravings. Additionally, millets are nutrient-dense, meaning you get significant vitamins and minerals without excess calories. When consumed as part of a balanced diet, millet-based meals at MilletMarg make for a satisfying, wholesome, and mindful approach to everyday eating.",
  },
  {
    category: "Orders & Delivery",
    question: "How can I explore your products?",
    answer:
      "You can browse our full menu and product selection on the Products page of our website. Each item is described with its key ingredients and millet type so you can make an informed choice. For the freshest experience, we also recommend visiting us directly at our café in Indore, Madhya Pradesh, where our team can walk you through the day's offerings.",
  },
  {
    category: "Orders & Delivery",
    question: "Do you offer home delivery?",
    answer:
      "We primarily serve customers through our café in Indore, Madhya Pradesh. For delivery availability in and around Indore, please contact us directly via phone at +91 7566713573 or email us at tivafoods@gmail.com. Our team will confirm current delivery arrangements and coverage areas. You can also reach us on WhatsApp for a quick response.",
  },
  {
    category: "Orders & Delivery",
    question: "How can I ask about an order?",
    answer:
      "For any order-related queries, you can reach us through multiple channels. Call or WhatsApp us at +91 7566713573, email us at tivafoods@gmail.com, or use the Contact Us page on our website. Please share your name, order details, and preferred contact time and our team will get back to you promptly.",
  },
  {
    category: "Café",
    question: "Where is MilletMarg located?",
    answer:
      "MilletMarg — Healthy Cafe & Millet Store is located in Indore, Madhya Pradesh, India. Indore is a vibrant food city and we are proud to bring millet-based nutrition to its heart. You can find our exact location, get turn-by-turn directions, and view us on Google Maps by visiting our Contact Us page and clicking 'Get Directions'.",
  },
  {
    category: "Café",
    question: "What are your café opening hours?",
    answer:
      "Our café is open Monday through Friday from 9:00 AM to 9:00 PM. We are currently closed on Saturdays and Sundays. We recommend calling ahead at +91 7566713573 to confirm hours on public holidays or during special events. We look forward to welcoming you!",
  },
  {
    category: "Café",
    question: "Do you have seating available at the café?",
    answer:
      "Yes, MilletMarg offers a comfortable café experience with indoor seating. We also have a takeaway counter for those on the go. The space is designed to be warm, welcoming, and in line with our philosophy of mindful, wholesome living. Whether you want to dine in or grab a quick millet bowl to go, we have got you covered.",
  },
  {
    category: "General",
    question: "How can I contact MilletMarg?",
    answer:
      "You can reach the MilletMarg team through several ways: Call or WhatsApp us at +91 7566713573, email us at tivafoods@gmail.com, or fill out the form on our Contact Us page. You can also follow us and send a message on Instagram (@milletmarg) or Facebook (Milletmarg). We typically respond within one business day and are happy to answer any questions about our products, café, or the MilletMarg story.",
  },
  {
    category: "General",
    question: "Who is behind MilletMarg?",
    answer:
      "MilletMarg is founded by Tanmay Acharya, Raksha Acharya, and Smt. Vandana Acharya — the core team behind Tiva Food Services Private Limited, incorporated in Indore, Madhya Pradesh on August 1, 2020. Tanmay Acharya, the Managing Director, is the entrepreneur and visionary behind the brand's mission to make millet-based nutrition accessible and enjoyable. The founding team shares a deep passion for India's agricultural heritage and a commitment to bringing farm-to-table millet food into modern everyday life.",
  },
  {
    category: "General",
    question: "Why does MilletMarg focus on millets specifically?",
    answer:
      "India has been cultivating and consuming millets for thousands of years. Grains like ragi, bajra, jowar, and foxtail millet were staples of Indian diets long before refined wheat and white rice took over urban kitchens. Millets are not only nutritionally superior but also drought-resistant and environmentally sustainable — requiring far less water to grow than rice or wheat. At MilletMarg, we believe bringing millets back to modern tables is both a cultural celebration and a step towards healthier, more responsible food choices for individuals and the planet.",
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