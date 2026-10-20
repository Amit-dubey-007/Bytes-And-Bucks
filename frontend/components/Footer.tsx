import React from "react";
import Link from "next/link";
import { Clock, MapPin, Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer id="contact" className="bg-[#10291E] text-[#F7F1E5] border-t border-[#183D2B] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand column */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-full bg-[#F7F1E5] flex items-center justify-center text-[#183D2B] font-serif font-bold text-sm transition-transform group-hover:scale-105">
                MM
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-[#F7F1E5]">
                MilletMarg
              </span>
            </Link>
            <p className="text-xs text-[#F7F1E5]/70 leading-relaxed">
              Wholesome millet bowls crafted with nature&apos;s goodness, fresh ingredients, and a love for better food.
            </p>
            <p className="text-[11px] text-[#879568]">
              © 2026 MilletMarg. All rights reserved.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-base font-semibold text-[#D8A641] mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs text-[#F7F1E5]/80">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Cafe Hours */}
          <div>
            <h4 className="font-serif text-base font-semibold text-[#D8A641] mb-4">
              Wellness Cafe
            </h4>
            <ul className="space-y-2.5 text-xs text-[#F7F1E5]/80">
              <li className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#879568]" />
                <span>Mon - Fri: 8:00 AM – 8:30 PM</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#879568]" />
                <span>Sat - Sun: 9:00 AM – 9:00 PM</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#879568]" />
                <span>42 Harvest Avenue, Green Quarter</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-base font-semibold text-[#D8A641] mb-4">
              Connect
            </h4>
            <ul className="space-y-2.5 text-xs text-[#F7F1E5]/80">
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#879568]" />
                <span>hello@milletmarg.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#879568]" />
                <span>+1 (555) 349-MILLETS</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
