"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { MessageCircle, X, ChevronLeft, Wheat, Send, Maximize2 } from "lucide-react";

/* ─── Data ─────────────────────────────────────────────────────────────────── */
const categories = ["All", "Products", "Ordering", "Café & Location", "About Us"];

const qaData = [
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
  | { type: "bot"; text: string }
  | { type: "suggestions" };

/* ─── Component ─────────────────────────────────────────────────────────────── */
export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [messages, setMessages] = useState<Message[]>([
    { type: "bot-welcome" },
    { type: "suggestions" },
  ]);
  const [showQuestions, setShowQuestions] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 80);
    }
  }, [messages, isOpen, showQuestions]);

  const filteredQA =
    activeCategory === "All"
      ? qaData
      : qaData.filter((q) => q.category === activeCategory);

  function handleQuestionClick(item: (typeof qaData)[0]) {
    setShowQuestions(false);
    setMessages((prev) => {
      const filtered = prev.filter((m) => m.type !== "suggestions");
      return [
        ...filtered,
        { type: "user", text: item.question },
        { type: "bot", text: item.answer },
        { type: "suggestions" },
      ];
    });
  }

  function handleReset() {
    setMessages([{ type: "bot-welcome" }, { type: "suggestions" }]);
    setActiveCategory("All");
    setShowQuestions(false);
  }

  return (
    <>
      {/* ── Floating Button ── */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-all duration-300 ${
          isOpen
            ? "bg-[#183D2B] scale-95"
            : "bg-[#183D2B] hover:scale-110 hover:bg-[#10291E]"
        }`}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <>
            <MessageCircle className="h-6 w-6 text-white" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C66A45] opacity-75" />
              <span className="relative inline-flex h-4 w-4 rounded-full bg-[#C66A45]" />
            </span>
          </>
        )}
      </button>

      {/* ── Chat Window ── */}
      <div
        className={`fixed bottom-24 right-6 z-50 flex w-[360px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-[#EDE2CF] bg-[#F7F1E5] shadow-2xl transition-all duration-300 origin-bottom-right ${
          isOpen
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-90 pointer-events-none"
        }`}
        style={{ maxHeight: "520px" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 bg-[#183D2B] px-4 py-3.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D8A641]/20">
            <Wheat className="h-5 w-5 text-[#D8A641]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white leading-none">MilletMarg Assistant</p>
            <p className="mt-0.5 text-[10px] text-white/60">Select a question to get started</p>
          </div>
          <Link
            href="/chat"
            title="Open full screen chat"
            className="rounded-full p-1.5 text-white/50 hover:bg-white/10 hover:text-white transition"
          >
            <Maximize2 className="h-4 w-4" />
          </Link>
          <button
            onClick={handleReset}
            title="Restart chat"
            className="rounded-full p-1.5 text-white/50 hover:bg-white/10 hover:text-white transition"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
          style={{ maxHeight: "340px" }}
        >
          {messages.map((msg, i) => {
            if (msg.type === "bot-welcome") {
              return (
                <div key={i} className="flex items-start gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#183D2B]">
                    <Wheat className="h-3.5 w-3.5 text-[#D8A641]" />
                  </div>
                  <div className="rounded-2xl rounded-tl-none bg-white border border-[#EDE2CF] px-4 py-3 shadow-sm max-w-[85%]">
                    <p className="text-sm leading-6 text-[#183D2B]">
                      👋 <strong>Hello!</strong> Welcome to <strong>MilletMarg</strong>!<br />
                      I can answer your questions about our products, café, ordering, and more.
                    </p>
                    <p className="mt-1.5 text-xs text-[#879568]">Choose a question below ↓</p>
                  </div>
                </div>
              );
            }

            if (msg.type === "user") {
              return (
                <div key={i} className="flex justify-end">
                  <div className="rounded-2xl rounded-tr-none bg-[#183D2B] px-4 py-3 max-w-[85%]">
                    <p className="text-sm leading-6 text-white">{msg.text}</p>
                  </div>
                </div>
              );
            }

            if (msg.type === "bot") {
              return (
                <div key={i} className="flex items-start gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#183D2B]">
                    <Wheat className="h-3.5 w-3.5 text-[#D8A641]" />
                  </div>
                  <div className="rounded-2xl rounded-tl-none bg-white border border-[#EDE2CF] px-4 py-3 shadow-sm max-w-[85%]">
                    <p className="whitespace-pre-line text-sm leading-6 text-[#252820]">
                      {msg.text}
                    </p>
                  </div>
                </div>
              );
            }

            if (msg.type === "suggestions") {
              return (
                <div key={i} className="flex items-start gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#183D2B]">
                    <Wheat className="h-3.5 w-3.5 text-[#D8A641]" />
                  </div>
                  <div className="rounded-2xl rounded-tl-none bg-white border border-[#EDE2CF] px-4 py-3 shadow-sm max-w-[85%]">
                    <p className="text-xs text-[#879568]">Ask me another question:</p>
                    <button
                      onClick={() => setShowQuestions((v) => !v)}
                      className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#183D2B] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#10291E]"
                    >
                      <Send className="h-3 w-3" />
                      {showQuestions ? "Hide questions" : "Browse questions"}
                    </button>
                  </div>
                </div>
              );
            }

            return null;
          })}
          <div ref={bottomRef} />
        </div>

        {/* Question Picker Panel */}
        {showQuestions && (
          <div className="border-t border-[#EDE2CF] bg-white">
            {/* Category tabs */}
            <div className="flex gap-1.5 overflow-x-auto px-3 pt-3 pb-1">
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

            {/* Questions list */}
            <div className="max-h-44 overflow-y-auto px-3 pb-3 pt-2 space-y-1">
              {filteredQA.map((item) => (
                <button
                  key={item.question}
                  onClick={() => handleQuestionClick(item)}
                  className="w-full rounded-xl border border-[#EDE2CF] bg-[#F7F1E5] px-3 py-2.5 text-left text-xs font-medium text-[#183D2B] transition hover:border-[#C66A45]/40 hover:bg-[#EDE2CF]"
                >
                  {item.question}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
