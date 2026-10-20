import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Clock,
  MapPin,
  Mail,
  Phone,
  ArrowUpRight,
  Leaf,
} from "lucide-react";

// ========================================
// MILLETMARG BUSINESS INFORMATION
// ========================================

const BRAND = {
  email: "tivafoods@gmail.com",
  phoneDisplay: "+91 75667 13573",
  phoneNumber: "7566713573",
  whatsappNumber: "917566713573",

  facebookUrl: "https://www.facebook.com/Milletmarg",
  instagramUrl: "https://www.instagram.com/milletmarg",
  youtubeUrl: "https://www.youtube.com/@milletmarg",

  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=22.695518%2C75.833325",

  address: "MilletMarg, Indore, Madhya Pradesh, India",

  cafeHours: "12:00 AM – 10:45 PM",
  supportDays: "Monday – Friday",
  supportHours: "9:00 AM – 9:00 PM",
};

// ========================================
// SOCIAL MEDIA ICONS
// ========================================

function FacebookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V8c0-.9.3-1.5 1.6-1.5h1.7V3.7c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2H7.3V13h2.8v8h3.4Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M23.2 6.2a3 3 0 0 0-2.1-2.1C19.3 3.6 12 3.6 12 3.6s-7.3 0-9.1.5A3 3 0 0 0 .8 6.2 31 31 0 0 0 .3 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.8.5 9.1.5 9.1.5s7.3 0 9.1-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-5.8 31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M20.5 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20l1.2-4.7A8.5 8.5 0 1 1 20.5 11.5Z" />
      <path d="M8.5 8.5c.4 2.8 2.2 4.6 5 5" />
      <path d="M8.5 8.5 9.8 7.7l1.3 2-1 1" />
      <path d="m13.5 13.5 1-1 2 1.3-.8 1.2" />
    </svg>
  );
}

// ========================================
// FOOTER COMPONENT
// ========================================

export default function Footer() {
  const whatsappMessage = encodeURIComponent(
    "Hello MilletMarg! I would like to know more about your products."
  );

  const whatsappUrl = `https://wa.me/${BRAND.whatsappNumber}?text=${whatsappMessage}`;

  const socialLinks = [
    {
      name: "Facebook",
      href: BRAND.facebookUrl,
      icon: FacebookIcon,
    },
    {
      name: "Instagram",
      href: BRAND.instagramUrl,
      icon: InstagramIcon,
    },
    {
      name: "YouTube",
      href: BRAND.youtubeUrl,
      icon: YouTubeIcon,
    },
    {
      name: "WhatsApp",
      href: whatsappUrl,
      icon: WhatsAppIcon,
    },
  ];

  const navigationLinks = [
    { label: "Home", href: "/" },
    { label: "Our Products", href: "/products" },
    { label: "About Us", href: "/about" },
    { label: "Contact Us", href: "/contact" },
  ];

  return (
    <footer
      id="footer"
      className="relative overflow-hidden bg-[#10291E] text-[#F7F1E5]"
    >
      {/* DECORATIVE BACKGROUND */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border border-[#879568]/10"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 -top-12 h-60 w-60 rounded-full border border-[#879568]/10"
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* MAIN FOOTER COLUMNS */}
        <div className="grid grid-cols-1 gap-12 py-14 sm:grid-cols-2 lg:grid-cols-12 lg:gap-10 lg:py-16">
          {/* BRAND AND SOCIAL LINKS */}
          <div className="lg:col-span-4">
            <Link
              href="/"
              aria-label="MilletMarg home"
              className="inline-flex items-center rounded-xl bg-[#F7F1E5] px-4 py-2.5 transition-opacity hover:opacity-90"
            >
              <Image
                src="/logo.png"
                alt="MilletMarg — Your Way to Healthier Life"
                width={260}
                height={100}
                className="h-[76px] w-auto max-w-[250px] object-contain"
              />
            </Link>

            <p className="mt-6 max-w-sm text-sm leading-7 text-[#F7F1E5]/75">
              Bringing the goodness of traditional millets into modern living.
              Discover wholesome food, celebrate our roots, and make every bowl
              a little better.
            </p>

            {/* SOCIAL LINKS */}
            <div className="mt-7">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#D8A641]">
                Follow Our Journey
              </p>

              <div className="flex flex-wrap gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;

                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Visit MilletMarg on ${social.name}`}
                      title={social.name}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-[#F7F1E5]/15 bg-[#183D2B] transition-all duration-300 hover:-translate-y-1 hover:border-[#D8A641] hover:bg-[#D8A641] hover:text-[#10291E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D8A641]"
                    >
                      <Icon />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* NAVIGATION */}
          <div className="lg:col-span-2 lg:pl-5">
            <h3 className="mb-6 font-serif text-xl font-semibold text-[#D8A641]">
              Explore
            </h3>

            <ul className="space-y-4">
              {navigationLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-2 text-sm text-[#F7F1E5]/75 transition-colors hover:text-[#D8A641]"
                  >
                    {link.label}

                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CAFE INFORMATION */}
          <div className="lg:col-span-3">
            <h3 className="mb-6 font-serif text-xl font-semibold text-[#D8A641]">
              Visit Our Café
            </h3>

            <div className="space-y-5">
              {/* CAFE HOURS */}
              <div className="flex items-start gap-3">
                <Clock className="mt-1 h-5 w-5 shrink-0 text-[#D8A641]" />

                <div className="text-sm leading-6 text-[#F7F1E5]/75">
                  <p className="font-medium text-[#F7F1E5]">Café Hours</p>
                  <p className="mt-1">All Days</p>
                  <p>{BRAND.cafeHours}</p>
                </div>
              </div>

              {/* SUPPORT HOURS */}
              <div className="flex items-start gap-3">
                <Clock className="mt-1 h-5 w-5 shrink-0 text-[#D8A641]" />

                <div className="text-sm leading-6 text-[#F7F1E5]/75">
                  <p className="font-medium text-[#F7F1E5]">
                    Corporate &amp; Backend Support
                  </p>
                  <p className="mt-1">{BRAND.supportDays}</p>
                  <p>{BRAND.supportHours}</p>
                </div>
              </div>

              {/* LOCATION */}
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 h-5 w-5 shrink-0 text-[#D8A641]" />

                <div className="text-sm leading-6 text-[#F7F1E5]/75">
                  <p className="font-medium text-[#F7F1E5]">Our Location</p>
                  <p className="mt-1">{BRAND.address}</p>

                  <a
                    href={BRAND.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 font-semibold text-[#D8A641] transition-colors hover:text-[#F7F1E5]"
                  >
                    Get Directions
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* CONTACT DETAILS */}
          <div className="lg:col-span-3">
            <h3 className="mb-6 font-serif text-xl font-semibold text-[#D8A641]">
              Get in Touch
            </h3>

            <p className="mb-6 text-sm leading-6 text-[#F7F1E5]/75">
              Have questions about our products, café, or corporate services?
              Get in touch with our team.
            </p>

            <div className="space-y-5">
              {/* EMAIL */}
              <a
                href={`mailto:${BRAND.email}`}
                className="flex items-start gap-3 break-all text-sm text-[#F7F1E5]/80 transition-colors hover:text-[#D8A641]"
              >
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-[#D8A641]" />
                <span>{BRAND.email}</span>
              </a>

              {/* PHONE */}
              <a
                href={`tel:+91${BRAND.phoneNumber}`}
                className="flex items-start gap-3 text-sm text-[#F7F1E5]/80 transition-colors hover:text-[#D8A641]"
              >
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-[#D8A641]" />
                <span>{BRAND.phoneDisplay}</span>
              </a>

              {/* WHATSAPP */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#D8A641] px-4 py-3 text-sm font-semibold text-[#10291E] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#E7B94F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D8A641]"
              >
                <WhatsAppIcon />
                Message Us on WhatsApp
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* BRAND STATEMENT */}
        <div className="flex flex-col items-center justify-center gap-3 border-t border-[#F7F1E5]/10 py-7 text-center sm:flex-row sm:gap-4">
          <Leaf className="h-5 w-5 shrink-0 text-[#879568]" />

          <p className="font-serif text-base italic text-[#F7F1E5]/85 sm:text-lg">
            Ancient Grains. Modern Wellness. A Better Tomorrow.
          </p>
        </div>

        {/* COPYRIGHT */}
        <div className="border-t border-[#F7F1E5]/10 py-6 text-center">
          <p className="text-xs leading-5 text-[#F7F1E5]/55">
            © {new Date().getFullYear()} MilletMarg. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}