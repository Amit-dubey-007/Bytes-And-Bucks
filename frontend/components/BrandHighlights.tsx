import React from "react";
import { Sprout, Sparkles, HeartHandshake, UtensilsCrossed } from "lucide-react";

export default function BrandHighlights() {
  const highlights = [
    {
      title: "Farm to Bowl",
      description: "Directly harvested from regenerative certified local farms.",
      icon: Sprout,
      color: "#183D2B",
    },
    {
      title: "Millet Goodness",
      description: "Ancient unpolished grains naturally rich in protein and fiber.",
      icon: Sparkles,
      color: "#D8A641",
    },
    {
      title: "Supporting Farmers",
      description: "Fair-trade pricing that uplifts rural farming communities.",
      icon: HeartHandshake,
      color: "#C66A45",
    },
    {
      title: "Delicious & Fresh",
      description: "Small-batch culinary recipes crafted fresh every morning.",
      icon: UtensilsCrossed,
      color: "#879568",
    },
  ];

  return (
    <section className="relative z-20 -mt-6 sm:-mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-[#EDE2CF]/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 lg:p-10 shadow-lg border border-[#EDE2CF] transition-all duration-300">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-[#183D2B]/10">
          {highlights.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className={`flex items-start gap-4 ${
                  index > 0 ? "pt-5 sm:pt-0 sm:pl-6 lg:pl-8" : ""
                }`}
              >
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xs transition-transform duration-300 hover:scale-110"
                  style={{
                    backgroundColor: "#F7F1E5",
                    border: `1.5px solid ${item.color}30`,
                  }}
                >
                  <Icon className="w-5 h-5" style={{ color: item.color }} />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-base text-[#183D2B] tracking-tight">
                    {item.title}
                  </h2>
                  <p className="text-xs text-[#252820]/75 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
