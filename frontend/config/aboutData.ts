/**
 * MilletMarg — About Us Page Configuration
 * 
 * IMPORTANT: Update this file with your actual business details,
 * founder identities, official café address, and Google Maps embed URL.
 * All fields are structured for seamless editing without touching UI components.
 */

export interface Founder {
  id: string;
  name: string;
  role: string;
  image: string;
  imageAlt: string;
  bio: string;
  motivation: string;
  vision: string;
}

export interface Milestone {
  period: string;
  title: string;
  description: string;
}

export interface ValueItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  iconName: string;
}

export interface ApproachItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  tag: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image: string;
  aspect: string;
}

export interface ShopConfig {
  name: string;
  tagline: string;
  addressLine1: string;
  addressLine2: string;
  cityStateZip: string;
  country: string;
  googleMapsDirectionsUrl: string;
  googleMapsEmbedUrl: string;
  phone: string;
  email: string;
  openingHours: {
    weekdays: string;
    weekends: string;
  };
  note: string;
}

export const shopConfig: ShopConfig = {
  name: "Millet-Marg | Healthy Cafe & Millet Store",
  tagline: "Farm-to-Table Millet Nutrition — Indore, Madhya Pradesh",
  addressLine1: "Millet-Marg | Healthy Cafe & Millet Store",
  addressLine2: "Indore, Madhya Pradesh",
  cityStateZip: "Indore, MP",
  country: "India",
  // Google Maps Directions link for the CTA button
  googleMapsDirectionsUrl: "https://www.google.com/maps/place/Millet+-+marg+%7C+Healthy+Cafe+%26+Millet+Store/@22.6955176,75.8307504,17z/data=!3m1!4b1!4m6!3m5!1s0x3962fd00372bf78b:0xb1d9bc3607fb0cd9!8m2!3d22.6955176!4d75.8333253!16s%2Fg%2F11wy5sb767?entry=ttu",
  // Responsive Google Maps Embed iframe src
  googleMapsEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3681.5!2d75.8307504!3d22.6955176!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3962fd00372bf78b%3A0xb1d9bc3607fb0cd9!2sMillet%20-%20marg%20%7C%20Healthy%20Cafe%20%26%20Millet%20Store!5e0!3m2!1sen!2sin!4v1698000000000!5m2!1sen!2sin",
  phone: "+91 7566713573",
  email: "tivafoods@gmail.com",
  openingHours: {
    weekdays: "Monday – Friday: 9:00 AM – 9:00 PM",
    weekends: "Saturday – Sunday: Closed",
  },
  note: "Indoor & open-air seating available · Takeaway counter · Fresh batches daily",
};

export const foundersList: Founder[] = [
  {
    id: "founder-1",
    name: "Raksha Acharya",
    role: "Director & Co-Founder",
    image: "/founders/raksha-acharya-clean.png",
    imageAlt: "Portrait of Raksha Acharya, Director of Tiva Food Services Private Limited",
    bio: "Raksha Acharya is an Indian corporate executive and Director of Tiva Food Services Private Limited, a private company incorporated in India. She serves as part of the primary board of directors, managing the enterprise alongside co-directors such as Tanmay Acharya. Her leadership brings a strong foundation in food service operations and corporate governance to MilletMarg.",
    motivation:
      "Driven by a deep belief that India's traditional grains deserve a modern stage, Raksha set out to build a food brand that bridges heritage with contemporary wellness — making millets not just nutritious, but truly craveable.",
    vision:
      "To establish MilletMarg as a trusted household name that champions India's millet heritage while inspiring a new generation to embrace thoughtful, grain-forward eating.",
  },
  {
    id: "founder-2",
    name: "Tanmay Acharya",
    role: "Managing Director & Co-Founder",
    image: "/founders/tanmay-acharya-clean.png",
    imageAlt: "Portrait of Tanmay Acharya, Managing Director of Tiva Food Services Private Limited",
    bio: "Tanmay Acharya is an entrepreneur and the Managing Director of Tiva Food Services Private Limited. He leads the company with clear purpose and is the vision behind MilletMarg — a dedicated healthy food and café brand focused on introducing nutritious, farm-to-table millet-based nutrition to modern households across India.",
    motivation:
      "Believing that true wellness starts at the table, Tanmay envisioned MilletMarg as a bridge between India's rich agricultural heritage and the health-conscious choices of today's generation — bringing millets from the farm directly to the fork.",
    vision:
      "To scale MilletMarg into a nationally recognized brand that redefines how Indians eat, making millet-based nutrition a delicious, accessible, and everyday lifestyle choice.",
  },
  {
    id: "founder-3",
    name: "Smt. Vandana Acharya",
    role: "Director & Co-Founder",
    image: "/founders/vandana-acharya-clean.png",
    imageAlt: "Portrait of Smt. Vandana Acharya, Director of Tiva Food Services Private Limited",
    bio: "Smt. Vandana Acharya serves as a Director at Tiva Food Services Private Limited, an Indore-based company operating in the food and beverage industry. An integral member of the Board of Directors since its incorporation on August 1, 2020, she plays a central role in guiding the strategic operations of the enterprise from its headquarters in Madhya Pradesh.",
    motivation:
      "With a deep-rooted connection to India's culinary traditions, Vandana brings wisdom and purpose to every strategic decision — ensuring MilletMarg stays true to its promise of wholesome, authentic, and nourishing food for every household.",
    vision:
      "To see MilletMarg grow into a movement that honours India's food legacy while empowering communities through nutrition, conscious choices, and sustainable food practices.",
  },
];

export const storyMilestones: Milestone[] = [
  {
    period: "Phase 1: The Spark",
    title: "Rediscovering Ancient Grains",
    description:
      "The realization that millets—once staples of Indian diets for millennia—had been largely forgotten in urban food culture despite their exceptional nutritional value and ecological resilience.",
  },
  {
    period: "Phase 2: The Pilot Kitchen",
    title: "Reimagining Traditional Recipes",
    description:
      "Months of recipe testing to ensure millet-based bowls, sourdoughs, and beverages delivered vibrant textures and irresistible culinary appeal, matching modern cafe standards.",
  },
  {
    period: "Phase 3: The First Café",
    title: "Opening the Doors of MilletMarg",
    description:
      "Creating a physical haven where guests can slow down, savor freshly prepared millet bowls, and experience modern millimilastic wellness in an earthy, warm atmosphere.",
  },
  {
    period: "Phase 4: Looking Forward",
    title: "A Growing Movement",
    description:
      "Continually expanding seasonal creations, fostering community dialogue around traditional supergrains, and inspiring more people to embrace nourishing food choices.",
  },
];

export const valuesList: ValueItem[] = [
  {
    id: "tradition",
    title: "Rooted in Tradition",
    subtitle: "Ancestral Food Knowledge",
    description:
      "Celebrating India's thousands of years of millet cultivation. We honor native grain varieties—foxtail, barnyard, kodo, little, and finger millets—drawing wisdom from timeless culinary traditions.",
    iconName: "Wheat",
  },
  {
    id: "wellness",
    title: "Wellness Through Food",
    subtitle: "Mindful, Everyday Nutrition",
    description:
      "Encouraging mindful nourishment through unpolished grains rich in natural dietary fiber, protein, and micro-nutrients, making wholesome food delightful rather than restrictive.",
    iconName: "Heart",
  },
  {
    id: "farm-future",
    title: "Farm-to-Future Thinking",
    subtitle: "Responsible Food Systems",
    description:
      "Recognizing the critical role of agricultural communities and climate-resilient crops. Millets require minimal water and restore soil vitality, forming the cornerstone of responsible eating.",
    iconName: "Sprout",
  },
  {
    id: "innovation",
    title: "Innovation with Purpose",
    subtitle: "Contemporary Food Experiences",
    description:
      "Reinventing ancient grains for modern lifestyles through artisan culinary techniques, vibrant colorful plating, and flavors that excite younger generations.",
    iconName: "Sparkles",
  },
];

export const approachItems: ApproachItem[] = [
  {
    id: "approach-1",
    title: "Traditional Indian Grains",
    subtitle: "Ancient Biodiversity",
    description:
      "Exploring diverse millet species—from golden foxtail to nutrient-packed ragi—bringing ancestral crop diversity back to contemporary plates.",
    image: "/millet-seasonal-bowl.png",
    tag: "Ancient Supergrains",
  },
  {
    id: "approach-2",
    title: "Modern Millet-Based Food",
    subtitle: "Artisan Culinary Craft",
    description:
      "Crafting gourmet bowls, sourdoughs, wraps, and seasonal smoothies that make healthy dining exciting and accessible for busy days.",
    image: "/millet-chickpea-bowl.png",
    tag: "Chef-Curated",
  },
  {
    id: "approach-3",
    title: "Everyday Wellness",
    subtitle: "Sustained Energy & Balance",
    description:
      "Focusing on slow-burning complex carbs and gut-friendly prebiotic fiber that support lasting vitality without blood sugar crashes.",
    image: "/millet-drink.png",
    tag: "Gut-Friendly",
  },
  {
    id: "approach-4",
    title: "Sustainable Food Awareness",
    subtitle: "Lighter Ecological Footprint",
    description:
      "Promoting drought-tolerant grains that conserve precious groundwater and nurture regenerative agricultural landscapes.",
    image: "/millet-dosa-plate.png",
    tag: "Eco-Conscious",
  },
];

export const cafeGalleryList: GalleryItem[] = [
  {
    id: "cafe-exterior",
    title: "Café Exterior & Welcoming Entrance",
    category: "Storefront",
    image: "/placeholders/cafe-exterior.svg",
    aspect: "aspect-4/3",
  },
  {
    id: "cafe-interior",
    title: "Warm Earthy Dining Nook",
    category: "Interior Ambience",
    image: "/placeholders/cafe-interior.svg",
    aspect: "aspect-4/3",
  },
  {
    id: "cafe-counter",
    title: "Fresh Grain Display & Coffee Bar",
    category: "Product Bar",
    image: "/placeholders/cafe-counter.svg",
    aspect: "aspect-4/3",
  },
  {
    id: "cafe-patio",
    title: "Open-Air Garden Seating",
    category: "Garden Space",
    image: "/placeholders/cafe-patio.svg",
    aspect: "aspect-4/3",
  },
];

export const futureGoalsList = [
  {
    number: "01",
    title: "Normalizing Millets for Youth & Gen Z",
    description:
      "Breaking the stereotype of millets as merely clinical or diet food by offering vibrant, craveable cafe menus that younger generations naturally reach for.",
  },
  {
    number: "02",
    title: "Inspiring Culinary Exploration",
    description:
      "Hosting workshops and community tasting events to demystify cooking with varied millet grains in home kitchens.",
  },
  {
    number: "03",
    title: "Broadening the Millet Creation Range",
    description:
      "Continuing to develop exciting pantry staples, breakfast granolas, ready-to-enjoy grain mixes, and seasonal artisan refreshments.",
  },
  {
    number: "04",
    title: "Championing India's Agricultural Heritage",
    description:
      "Fostering deeper public appreciation for the cultural history, folklore, and rural traditions surrounding indigenous supercrops.",
  },
  {
    number: "05",
    title: "Fostering Conscious Food Culture",
    description:
      "Encouraging an everyday dining mindset that prioritizes long-term well-being, mindfulness, and respect for natural ecological cycles.",
  },
];
