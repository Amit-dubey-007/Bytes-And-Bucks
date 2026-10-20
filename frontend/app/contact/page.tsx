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
  Sparkles,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { shopConfig, cafeGalleryList } from "@/config/aboutData";

export default function ContactUs() {
  const phoneNumber = String(shopConfig.phone).replace(/[^\d]/g, "");
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
        {/* HERO SECTION */}
        <section className="relative overflow-hidden px-5 py-20 sm:px-8 lg:py-28">
          <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[#D8A641]/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-[#879568]/15 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#183D2B]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em]">
                <span className="h-2 w-2 rounded-full bg-[#C66A45]" />
                Get in Touch
              </div>

              <h1 className="font-serif text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                We Would Love to{" "}
                <span className="italic text-[#C66A45]">Hear from You.</span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-8 text-[#252820]/75 sm:text-lg">
                Have a question about our products, want to visit our café, or
                want to learn more about millet-based food? We are here to help.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href={`tel:+${phoneNumber}`}
                  className="inline-flex items-center gap-2 rounded-full bg-[#183D2B] px-6 py-3.5 text-sm font-semibold text-[#F7F1E5] transition hover:bg-[#10291E]"
                >
                  <Phone className="h-4 w-4" />
                  Call Us
                </a>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-[#183D2B]/25 px-6 py-3.5 text-sm font-semibold transition hover:bg-[#EDE2CF]"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp Us
                </a>
              </div>

              <div className="mt-10 flex items-center gap-3 border-t border-[#183D2B]/10 pt-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#D8A641]/20">
                  <Sparkles className="h-5 w-5 text-[#C66A45]" />
                </div>

                <p className="text-sm text-[#252820]/75">
                  <span className="block font-semibold text-[#183D2B]">
                    Ancient Grains. Modern Wellness.
                  </span>
                  Your journey towards wholesome food starts here.
                </p>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl">
              <div className="absolute -right-3 -top-3 h-full w-full rounded-3xl border border-[#D8A641]/50 sm:-right-5 sm:-top-5" />

              <div className="relative overflow-hidden rounded-3xl bg-[#EDE2CF] p-3 shadow-xl">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                  <Image
                    src="/millet-bowl-hero.jpg"
                    alt="Wholesome millet food at MilletMarg"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#10291E]/80 via-transparent to-transparent" />

                  <div className="absolute bottom-6 left-6 right-6 text-[#F7F1E5]">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D8A641]">
                      Welcome to MilletMarg
                    </p>

                    <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">
                      Good Food. Good Roots. Good Living.
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT CARDS */}
        <section className="border-y border-[#EDE2CF] bg-white/50 px-5 py-14 sm:px-8">
          <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <a
              href={`tel:+${phoneNumber}`}
              className="group rounded-2xl border border-[#EDE2CF] bg-white p-7 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#183D2B]/10">
                <Phone className="h-5 w-5 text-[#C66A45]" />
              </div>

              <h3 className="mt-5 font-serif text-xl font-bold">
                Call Our Team
              </h3>

              <p className="mt-2 text-sm text-[#252820]/70">
                Speak with us about our café and products.
              </p>

              <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">
                {shopConfig.phone}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </a>

            <a
              href={`mailto:${email}`}
              className="group rounded-2xl border border-[#EDE2CF] bg-white p-7 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#D8A641]/20">
                <Mail className="h-5 w-5 text-[#C66A45]" />
              </div>

              <h3 className="mt-5 font-serif text-xl font-bold">Email Us</h3>

              <p className="mt-2 text-sm text-[#252820]/70">
                Send us your questions or business enquiries.
              </p>

              <span className="mt-4 inline-flex items-center gap-2 break-all text-sm font-semibold">
                {email}
                <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
              </span>
            </a>

            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl border border-[#EDE2CF] bg-white p-7 transition hover:-translate-y-1 hover:shadow-lg sm:col-span-2 lg:col-span-1"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#C66A45]/10">
                <MapPin className="h-5 w-5 text-[#C66A45]" />
              </div>

              <h3 className="mt-5 font-serif text-xl font-bold">
                Visit Our Café
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#252820]/70">
                {shopConfig.addressLine1}
                {shopConfig.addressLine2
                  ? `, ${shopConfig.addressLine2}`
                  : ""}
                {`, ${shopConfig.cityStateZip}, ${shopConfig.country}`}
              </p>

              <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">
                Get Directions
                <ExternalLink className="h-4 w-4" />
              </span>
            </a>
          </div>
        </section>

        {/* LOCATION AND OPENING HOURS */}
        <section className="px-5 py-20 sm:px-8 lg:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#183D2B]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider">
                <MapPin className="h-4 w-4 text-[#C66A45]" />
                Find Us
              </div>

              <h2 className="mt-5 font-serif text-3xl font-bold sm:text-4xl lg:text-5xl">
                Come Experience{" "}
                <span className="italic text-[#C66A45]">MilletMarg.</span>
              </h2>

              <p className="mt-5 text-base leading-8 text-[#252820]/75">
                Visit us to explore wholesome millet-based food and experience
                the warmth of our café. We look forward to welcoming you.
              </p>
            </div>

            <div className="grid items-stretch gap-8 lg:grid-cols-12">
              <div className="flex flex-col justify-between rounded-3xl border border-[#EDE2CF] bg-white p-7 shadow-sm sm:p-9 lg:col-span-5">
                <div>
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#C66A45]">
                    Our Café
                  </span>

                  <h3 className="mt-2 font-serif text-2xl font-bold">
                    {shopConfig.name}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[#252820]/70">
                    {shopConfig.tagline}
                  </p>

                  <div className="mt-8 space-y-7 border-t border-[#EDE2CF] pt-7">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EDE2CF]/60">
                        <MapPin className="h-5 w-5 text-[#C66A45]" />
                      </div>

                      <div>
                        <h4 className="font-semibold">Address</h4>

                        <p className="mt-1 text-sm leading-6 text-[#252820]/70">
                          {shopConfig.addressLine1}
                          <br />
                          {shopConfig.addressLine2}
                          <br />
                          {shopConfig.cityStateZip}, {shopConfig.country}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EDE2CF]/60">
                        <Clock className="h-5 w-5 text-[#C66A45]" />
                      </div>

                      <div>
                        <h4 className="font-semibold">Café & Store Hours</h4>

                        <p className="mt-1 text-sm leading-6 text-[#252820]/70">
                          {shopConfig.openingHours.weekdays}
                          <br />
                          {shopConfig.openingHours.weekends}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EDE2CF]/60">
                        <Phone className="h-5 w-5 text-[#C66A45]" />
                      </div>

                      <div>
                        <h4 className="font-semibold">Contact</h4>

                        <a
                          href={`tel:+${phoneNumber}`}
                          className="mt-1 block text-sm text-[#252820]/70 hover:text-[#C66A45]"
                        >
                          {shopConfig.phone}
                        </a>

                        <a
                          href={`mailto:${email}`}
                          className="mt-1 block break-all text-sm text-[#252820]/70 hover:text-[#C66A45]"
                        >
                          {email}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 border-t border-[#EDE2CF] pt-6">
                  <p className="mb-5 text-sm leading-6 text-[#252820]/70">
                    {shopConfig.note}
                  </p>

                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#183D2B] px-6 py-3.5 text-sm font-semibold text-[#F7F1E5] transition hover:bg-[#10291E]"
                  >
                    Get Directions on Google Maps
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>

              <div className="relative min-h-[400px] overflow-hidden rounded-3xl border border-[#EDE2CF] bg-white shadow-sm lg:col-span-7">
                <iframe
                  title="MilletMarg Café Location"
                  src={shopConfig.googleMapsEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: "400px" }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* CAFÉ GALLERY */}
        <section className="border-y border-[#EDE2CF] bg-[#EDE2CF]/30 px-5 py-20 sm:px-8 lg:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#183D2B]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="h-4 w-4 text-[#C66A45]" />
                Our Space
              </div>

              <h2 className="mt-5 font-serif text-3xl font-bold sm:text-4xl lg:text-5xl">
                A Glimpse of{" "}
                <span className="italic text-[#C66A45]">MilletMarg.</span>
              </h2>

              <p className="mt-4 text-base leading-7 text-[#252820]/75">
                Explore our café and discover the space where wholesome food
                and tradition come together.
              </p>
            </div>

            {cafeGalleryList.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {cafeGalleryList.map((item) => (
                  <div
                    key={item.id}
                    className="group overflow-hidden rounded-2xl border border-[#EDE2CF] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#EDE2CF]">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>

                    <div className="p-5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#C66A45]">
                        {item.category}
                      </p>

                      <h3 className="mt-2 font-serif text-lg font-bold">
                        {item.title}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-[#252820]/70">
                Café photos will be added soon.
              </p>
            )}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="bg-[#10291E] px-5 py-20 text-[#F7F1E5] sm:px-8 lg:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#D8A641]/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#D8A641]">
              <MessageCircle className="h-4 w-4" />
              Let's Connect
            </div>

            <h2 className="mt-6 font-serif text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              Have Something on Your Mind?
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#F7F1E5]/75">
              We would be happy to answer your questions and help you discover
              more about MilletMarg.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center gap-2 rounded-full bg-[#D8A641] px-7 py-3.5 text-sm font-semibold text-[#10291E] transition hover:bg-[#E7B94F]"
              >
                Email Our Team
                <ArrowRight className="h-4 w-4" />
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[#F7F1E5]/25 px-7 py-3.5 text-sm font-semibold transition hover:bg-white/10"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp Us
              </a>
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-5">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-[#F7F1E5]/20 px-5 py-2.5 text-sm transition hover:border-[#D8A641] hover:bg-[#D8A641] hover:text-[#10291E]"
                >
                  {social.name}
                </a>
              ))}
            </div>

            <Link
              href="/products"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#D8A641] transition hover:text-white"
            >
              Explore Our Products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}