import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MilletMarg — Good Millets. Brighter Tomorrows.",
  description:
    "Wholesome millet bowls crafted with nature's goodness, fresh ingredients, and a love for better food. Modern millimilastic wellness with a touch of farm.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${plusJakarta.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-[#F7F1E5] text-[#183D2B] font-sans selection:bg-[#D8A641]/30 selection:text-[#183D2B]">
        {children}
      </body>
    </html>
  );
}
