import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { shopConfig } from "@/config/aboutData";

export const metadata: Metadata = {
  title: "Contact Us | MilletMarg",
  description:
    "Contact MilletMarg, visit our café, find our location, or get in touch with our team.",
};

export default function ContactPage() {
  const phoneNumber = String(shopConfig.phone).replace(/\D/g, "");
  const email = shopConfig.email;

  const whatsappNumber = phoneNumber.startsWith("91")
    ? phoneNumber
    : `91${phoneNumber}`;

  const whatsappUrl = `https://wa.me/${whatsappNumber}`;
  const mapsUrl = shopConfig.googleMapsDirectionsUrl;

  const socialLinks = [
    {
      name: "Instagram",
      href: "https://www.instagram.com/milletmarg/",
    },
    {
      name: "Facebook",
      href: "https://www.facebook.com/Milletmarg",
    },
    {
      name: "YouTube",
      href: "https://www.youtube.com/@milletmarg",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F1E5] text-[#183D2B]">
      <Navbar />

      <main className="flex-1">
        {/* HERO */}
        <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#183D2B]/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest">
                <span className="h-2 w-2 rounded-full bg-[#C66A45]" />
                Contact MilletMarg
              </span>

              <h1 className="mt-6 font-serif text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                We Would Love to{" "}
                <span className="italic text-[#C66A45]">
                  Hear from You.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-8 text-[#252820]/75 sm:text-lg">
                Have a question about our products or want to visit our café?
                Get in touch with our team. We look forward to connecting with
                you.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href={`tel:+${phoneNumber}`}
                  className="inline-flex items-center gap-2 rounded-full bg-[#183D2B] px-6 py-3.5 text-sm font-semibold text-[#F7F1E5] transition-colors hover:bg-[#10291E]"
                >
                  <Phone className="h-4 w-4" />
                  Call Us
                </a>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-[#183D2B]/25 px-6 py-3.5 text-sm font-semibold transition-colors hover:bg-[#EDE2CF]"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp Us
                </a>
              </div>

              <div className="mt-10 flex items-start gap-4 border-t border-[#EDE2CF] pt-6">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#D8A641]/20">
                  <Mail className="h-5 w-5 text-[#C66A45]" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold">Email Us</p>
                  <a
                    href={`mailto:${email}`}
                    className="mt-1 block break-all text-sm text-[#252820]/70 transition-colors hover:text-[#C66A45]"
                  >
                    {email}
                  </a>
                </div>
              </div>
            </div>

            {/* HERO IMAGE */}
            <div className="relative mx-auto w-full max-w-xl">
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-[#EDE2CF]">
                <Image
                  src="/millet-bowl-hero.jpg"
                  alt="Wholesome millet-inspired food at MilletMarg"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#10291E]/80 via-transparent to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#D8A641]">
                    Welcome to MilletMarg
                  </p>

                  <h2 className="mt-3 max-w-md font-serif text-3xl font-bold leading-tight text-white sm:text-4xl">
                    Good Food. Good Roots. Good Living.
                  </h2>

                  <p className="mt-3 max-w-md text-sm leading-6 text-white/80">
                    We are here to help you discover more about MilletMarg.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* LOCATION AND CONTACT DETAILS */}
        <section className="border-y border-[#EDE2CF] bg-white/50 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#C66A45]">
                Visit Us
              </span>

              <h2 className="mt-4 font-serif text-3xl font-bold sm:text-4xl lg:text-5xl">
                Find Your Way to{" "}
                <span className="italic text-[#C66A45]">MilletMarg.</span>
              </h2>

              <p className="mt-4 text-base leading-7 text-[#252820]/75 sm:text-lg">
                Visit our café and experience the warmth of MilletMarg.
                We look forward to welcoming you.
              </p>
            </div>

            <div className="grid items-stretch gap-8 lg:grid-cols-12">
              {/* CONTACT DETAILS */}
              <div className="flex flex-col justify-between rounded-3xl border border-[#EDE2CF] bg-white p-6 sm:p-8 lg:col-span-5">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#C66A45]">
                    Our Café
                  </span>

                  <h3 className="mt-3 font-serif text-2xl font-bold sm:text-3xl">
                    {shopConfig.name}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[#252820]/70">
                    {shopConfig.tagline}
                  </p>

                  <div className="mt-8 space-y-7 border-t border-[#EDE2CF] pt-7">
                    {/* ADDRESS */}
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EDE2CF]/60">
                        <MapPin className="h-5 w-5 text-[#C66A45]" />
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold">Address</h4>

                        <p className="mt-2 text-sm leading-6 text-[#252820]/70">
                          {shopConfig.addressLine1}
                          {shopConfig.addressLine2 && (
                            <>
                              <br />
                              {shopConfig.addressLine2}
                            </>
                          )}
                          <br />
                          {shopConfig.cityStateZip}, {shopConfig.country}
                        </p>
                      </div>
                    </div>

                    {/* OPENING HOURS */}
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EDE2CF]/60">
                        <Clock className="h-5 w-5 text-[#C66A45]" />
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold">
                          Opening Hours
                        </h4>

                        <p className="mt-2 text-sm leading-6 text-[#252820]/70">
                          {shopConfig.openingHours.weekdays}
                          <br />
                          {shopConfig.openingHours.weekends}
                        </p>
                      </div>
                    </div>

                    {/* PHONE */}
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EDE2CF]/60">
                        <Phone className="h-5 w-5 text-[#C66A45]" />
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold">Phone</h4>

                        <a
                          href={`tel:+${phoneNumber}`}
                          className="mt-2 block text-sm text-[#252820]/70 transition-colors hover:text-[#C66A45]"
                        >
                          {shopConfig.phone}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 border-t border-[#EDE2CF] pt-6">
                  {shopConfig.note && (
                    <p className="mb-5 text-sm leading-6 text-[#252820]/70">
                      {shopConfig.note}
                    </p>
                  )}

                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#183D2B] px-6 py-3.5 text-sm font-semibold text-[#F7F1E5] transition-colors hover:bg-[#10291E]"
                  >
                    Get Directions
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>

              {/* GOOGLE MAP */}
              <div className="relative min-h-[350px] overflow-hidden rounded-3xl border border-[#EDE2CF] bg-[#EDE2CF] lg:col-span-7 lg:min-h-[480px]">
                <iframe
                  title="MilletMarg Café Location"
                  src={shopConfig.googleMapsEmbedUrl}
                  width="100%"
                  height="100%"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-0"
                />
              </div>
            </div>
          </div>
        </section>

        {/* SOCIAL LINKS */}
        <section className="bg-[#10291E] px-4 py-16 text-center text-[#F7F1E5] sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-3xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
              <MessageCircle className="h-7 w-7 text-[#D8A641]" />
            </div>

            <h2 className="mt-6 font-serif text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              Let&apos;s Connect.
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">
              Have questions or feedback? Reach out to our team or follow
              MilletMarg on social media.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center gap-2 rounded-full bg-[#D8A641] px-7 py-3.5 text-sm font-semibold text-[#10291E] transition-colors hover:bg-[#E7B94F]"
              >
                Email Us
                <ArrowRight className="h-4 w-4" />
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 px-7 py-3.5 text-sm font-semibold transition-colors hover:bg-white/10"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp Us
              </a>
            </div>

            <div className="mt-10 border-t border-white/10 pt-8">
              <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-[#D8A641]">
                Follow MilletMarg
              </p>

              <div className="flex flex-wrap justify-center gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-white/20 px-5 py-2.5 text-sm transition-colors hover:border-[#D8A641] hover:bg-[#D8A641] hover:text-[#10291E]"
                  >
                    {social.name}
                  </a>
                ))}
              </div>

              <Link
                href="/products"
                className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#D8A641] transition-colors hover:text-white"
              >
                Explore Our Products
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