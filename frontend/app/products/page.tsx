import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products — MilletMarg",
  description: "Wholesome millet products crafted with nature's goodness.",
};

export default function ProductsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F7F1E5] text-[#183D2B]">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full flex items-center justify-center">
        {/* Initially empty main content area reserved for upcoming products development */}
      </main>
      <Footer />
    </div>
  );
}
