"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Wheat, RotateCcw, Send } from "lucide-react";

/* ─── Shared Data ───────────────────────────────────────────────────────────── */
export const categories = ["All", "Products", "Ordering", "Café & Location", "About Us"];

export const qaData = [
  {
    category: "Products",
    question: "What are millets and why are they healthy?",
    answer:
      "Millets are ancient Indian supergrains rich in dietary fibre, plant-based protein, iron, calcium, and B vitamins. They have a low glycaemic index — releasing energy slowly — which helps maintain stable blood sugar levels and keeps you feeling full longer. They are nature's original wellness food! 🌾",
  },
  {
    category: "Products",
    question: "Which types of millets do you use?",
    answer:
      "We use a variety of millets including Foxtail Millet (Kangni), Finger Millet (Ragi), Pearl Millet (Bajra), Sorghum (Jowar), and Little Millet. Each brings unique flavour, texture, and nutritional benefits to our dishes. 🌿",
  },
  {
    category: "Products",
    question: "Are your products gluten-free?",
    answer:
      "Most millets are naturally gluten-free — Ragi, Bajra, Jowar, Foxtail, and Little Millet are all inherently gluten-free. If you have coeliac disease or strict gluten sensitivity, please contact us before ordering so we can confirm preparation details for your specific dish. ✅",
  },
  {
    category: "Products",
    question: "Do you have vegan options?",
    answer:
      "Yes! A large portion of our menu is 100% plant-based and vegan-friendly. Millets themselves are plant-based, and many of our bowls use fresh vegetables, legumes, seeds, and natural seasonings. Let our team know your preference when ordering. 🌱",
  },
  {
    category: "Products",
    question: "Can millets help with weight management?",
    answer:
      "Absolutely! Millets are high in fibre which promotes satiety, keeping you full longer and reducing unnecessary snacking. Their low GI prevents blood sugar spikes that trigger cravings. Millet-based meals are a satisfying, wholesome, and mindful approach to everyday eating. 💪",
  },
  {
    category: "Products",
    question: "What dishes do you offer?",
    answer:
      "Our menu includes millet bowls, millet-based noodles, millet salads, healthy shakes and beverages, and seasonal specials. Visit our Products page on the website to explore the full current menu! 🍜",
  },
  {
    category: "Ordering",
    question: "Do you offer home delivery?",
    answer:
      "We primarily serve customers through our café in Indore, Madhya Pradesh. For delivery availability in and around Indore, please contact us at +91 7566713573 or email tivafoods@gmail.com. Our team will confirm delivery arrangements. 🚚",
  },
  {
    category: "Ordering",
    question: "How do I place an order?",
    answer:
      "You can visit us directly at our café in Indore, or contact us via phone at +91 7566713573 or WhatsApp for takeaway and delivery options. Our team is happy to take your order and guide you through the menu! 📞",
  },
  {
    category: "Ordering",
    question: "How can I ask about my order?",
    answer:
      "For any order queries, call or WhatsApp us at +91 7566713573, or email tivafoods@gmail.com. Please share your name and order details and we will get back to you promptly! 📧",
  },
  {
    category: "Café & Location",
    question: "Where is MilletMarg located?",
    answer:
      "We are located in Indore, Madhya Pradesh, India. Visit our Contact page and click 'Get Directions' to open the exact location on Google Maps. We look forward to welcoming you! 📍",
  },
  {
    category: "Café & Location",
    question: "What are your opening hours?",
    answer:
      "Our café is open Monday to Friday, 9:00 AM – 9:00 PM. We are closed on Saturdays and Sundays. Call us at +91 7566713573 to confirm hours on public holidays. ⏰",
  },
  {
    category: "Café & Location",
    question: "Do you have seating at the café?",
    answer:
      "Yes! MilletMarg has comfortable indoor seating as well as a takeaway counter for those on the go. The space is warm, welcoming, and designed for a mindful dining experience. 🪑",
  },
  {
    category: "About Us",
    question: "Who founded MilletMarg?",
    answer:
      "MilletMarg was founded by Tanmay Acharya (Managing Director), Raksha Acharya (Director), and Smt. Vandana Acharya (Director) — the team behind Tiva Food Services Private Limited, incorporated in Indore on August 1, 2020. Their shared passion for India's millet heritage drives everything we do. 👥",
  },
  {
    category: "About Us",
    question: "What is MilletMarg's mission?",
    answer:
      "Our mission is to bring India's traditional millets back to modern households — making them accessible, delicious, and easy to incorporate into everyday life. We celebrate our culinary roots while inspiring people to explore the versatility of these timeless grains. 🌾",
  },
  {
    category: "About Us",
    question: "How can I contact MilletMarg?",
    answer:
      "You can reach us by:\n📞 Phone / WhatsApp: +91 7566713573\n📧 Email: tivafoods@gmail.com\n📸 Instagram: @milletmarg\n📘 Facebook: Milletmarg\n\nOr visit our Contact page on the website!",
  },
];

/* ─── Types ─────────────────────────────────────────────────────────────────── */
type Message =
  | { type: "bot-welcome" }
  | { type: "user"; text: string }
  | { type: "bot"; text: string };

/* ─── Page ──────────────────────────────────────────────────────────────────── */
export default function ChatPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [messages, setMessages] = useState<Message[]>([{ type: "bot-welcome" }]);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Scroll the messages container itself — not the page
  useEffect(() => {
    setTimeout(() => {
      const el = messagesContainerRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    }, 80);
  }, [messages]);

  const filteredQA =
    activeCategory === "All"
      ? qaData
      : qaData.filter((q) => q.category === activeCategory);

  function handleQuestionClick(item: (typeof qaData)[0]) {
    setMessages((prev) => [
      ...prev,
      { type: "user", text: item.question },
      { type: "bot", text: item.answer },
    ]);
  }

  function handleReset() {
    setMessages([{ type: "bot-welcome" }]);
    setActiveCategory("All");
  }

  return (
    /* dvh = dynamic viewport height — accounts for mobile browser chrome */
    <div className="flex h-dvh flex-col overflow-hidden bg-[#F7F1E5] text-[#183D2B]">

      {/* ── Self-contained top bar (replaces Navbar on this page) ── */}
      <header className="flex shrink-0 items-center justify-between border-b border-[#EDE2CF] bg-white px-4 py-3 sm:px-8">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-full border border-[#EDE2CF] bg-[#F7F1E5] px-3 py-1.5 text-xs font-semibold text-[#183D2B] transition hover:bg-[#EDE2CF]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#183D2B]">
              <Wheat className="h-4.5 w-4.5 text-[#D8A641]" />
            </div>
            <div>
              <p className="text-sm font-bold leading-none">MilletMarg Assistant</p>
              <p className="mt-0.5 text-[11px] text-[#879568]">Select a question for an instant answer</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 rounded-full border border-[#EDE2CF] bg-[#F7F1E5] px-3 py-1.5 text-xs font-semibold text-[#183D2B] transition hover:bg-[#EDE2CF]"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          New Chat
        </button>
      </header>

      {/* ── Main 2-col layout — fills remaining height exactly ── */}
      <div className="flex min-h-0 flex-1 gap-4 p-4 sm:p-6">

        {/* LEFT — Question Picker sidebar */}
        <aside className="hidden w-72 shrink-0 flex-col lg:flex">
          <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#EDE2CF] bg-white shadow-sm">
            {/* Sidebar header */}
            <div className="shrink-0 bg-[#183D2B] px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#D8A641]">Browse Questions</p>
              <p className="mt-1 text-sm text-white/70">Choose a topic to filter</p>
            </div>

            {/* Category tabs */}
            <div className="shrink-0 flex flex-wrap gap-1.5 border-b border-[#EDE2CF] px-4 py-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    activeCategory === cat
                      ? "bg-[#183D2B] text-white"
                      : "bg-[#EDE2CF] text-[#183D2B] hover:bg-[#D8C9A8]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Questions — scrolls internally */}
            <div className="min-h-0 flex-1 overflow-y-auto p-3 space-y-1.5">
              {filteredQA.map((item) => (
                <button
                  key={item.question}
                  onClick={() => handleQuestionClick(item)}
                  className="group w-full rounded-xl border border-[#EDE2CF] bg-[#F7F1E5] px-4 py-3 text-left text-sm text-[#183D2B] transition hover:border-[#C66A45]/40 hover:bg-[#EDE2CF]"
                >
                  <div className="flex items-start gap-2">
                    <Send className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#C66A45] opacity-0 transition group-hover:opacity-100" />
                    <span className="font-medium leading-snug">{item.question}</span>
                  </div>
                  <span className="mt-1 inline-block text-[10px] font-semibold uppercase tracking-wider text-[#879568]">
                    {item.category}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* RIGHT — Chat Window */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[#EDE2CF] bg-white shadow-sm">

          {/* Chat messages — ONLY this div scrolls */}
          <div
            ref={messagesContainerRef}
            className="min-h-0 flex-1 overflow-y-auto px-6 py-6 space-y-5"
          >
            {messages.map((msg, i) => {
              if (msg.type === "bot-welcome") {
                return (
                  <div key={i} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#183D2B]">
                      <Wheat className="h-5 w-5 text-[#D8A641]" />
                    </div>
                    <div className="max-w-2xl rounded-2xl rounded-tl-none border border-[#EDE2CF] bg-[#F7F1E5] px-6 py-5 shadow-sm">
                      <p className="text-base leading-7 text-[#183D2B]">
                        👋 <strong>Hello! Welcome to MilletMarg!</strong>
                      </p>
                      <p className="mt-2 text-sm leading-7 text-[#252820]/80">
                        I&apos;m here to help you learn about our millet-based products, café, ordering, and the story behind MilletMarg. Simply <strong>select a question</strong> from the panel on the left (or below on mobile) to get an instant answer.
                      </p>
                      <p className="mt-3 text-xs text-[#879568]">
                        🌾 No typing needed — just browse and click!
                      </p>
                    </div>
                  </div>
                );
              }

              if (msg.type === "user") {
                return (
                  <div key={i} className="flex justify-end">
                    <div className="max-w-2xl rounded-2xl rounded-tr-none bg-[#183D2B] px-6 py-4 shadow-sm">
                      <p className="text-sm leading-7 text-white">{msg.text}</p>
                    </div>
                  </div>
                );
              }

              if (msg.type === "bot") {
                return (
                  <div key={i} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#183D2B]">
                      <Wheat className="h-5 w-5 text-[#D8A641]" />
                    </div>
                    <div className="max-w-2xl rounded-2xl rounded-tl-none border border-[#EDE2CF] bg-[#F7F1E5] px-6 py-5 shadow-sm">
                      <p className="whitespace-pre-line text-sm leading-7 text-[#252820]">
                        {msg.text}
                      </p>
                    </div>
                  </div>
                );
              }

              return null;
            })}
          </div>

          {/* Mobile question picker */}
          <div className="shrink-0 border-t border-[#EDE2CF] lg:hidden">
            <div className="flex gap-1.5 overflow-x-auto px-4 pt-3 pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-semibold transition ${
                    activeCategory === cat
                      ? "bg-[#183D2B] text-white"
                      : "bg-[#EDE2CF] text-[#183D2B] hover:bg-[#D8C9A8]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="max-h-40 overflow-y-auto px-4 pb-3 pt-2 space-y-1.5">
              {filteredQA.map((item) => (
                <button
                  key={item.question}
                  onClick={() => handleQuestionClick(item)}
                  className="w-full rounded-xl border border-[#EDE2CF] bg-[#F7F1E5] px-4 py-2.5 text-left text-xs font-medium text-[#183D2B] transition hover:bg-[#EDE2CF]"
                >
                  {item.question}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop bottom hint bar */}
          <div className="hidden shrink-0 items-center justify-between border-t border-[#EDE2CF] bg-[#F7F1E5] px-6 py-2.5 lg:flex">
            <p className="text-xs text-[#879568]">
              💬 Select a question from the left panel to continue
            </p>
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-xs font-semibold text-[#C66A45] hover:underline"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
