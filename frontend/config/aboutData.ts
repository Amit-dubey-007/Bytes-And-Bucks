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
  name: "MilletMarg Café & Wellness Kitchen",
  tagline: "Modern Millimilastic Wellness with a Touch of Farm",
  addressLine1: "42 Harvest Avenue",
  addressLine2: "Green Quarter, Near Farmer's Guild",
  cityStateZip: "[City, State - PIN Code]",
  country: "India",
  // Google Maps Directions link for the CTA button
  googleMapsDirectionsUrl: "https://maps.google.com/?q=MilletMarg+Cafe",
  // Responsive Google Maps Embed iframe src (replace with actual Google Maps embed link)
  googleMapsEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d112061.234567!2d77.2090!3d28.6139!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjjCsDM2JzUwLjAiTiA3N8KwMTInMzIuNCJF!5e0!3m2!1sen!2sin!4v1600000000000!5m2!1sen!2sin",
  phone: "+91 (0) [Insert Phone Number]",
  email: "hello@milletmarg.com",
  openingHours: {
    weekdays: "Monday – Friday: 8:00 AM – 8:30 PM",
    weekends: "Saturday – Sunday: 9:00 AM – 9:00 PM",
  },
  note: "Indoor & open-air seating available · Takeaway counter · Fresh batches daily",
};

export const foundersList: Founder[] = [
  {
    id: "founder-1",
    name: "[Founder Name 1]",
    role: "Co-Founder & Culinary Director",
    image: "/placeholders/founder-1.svg",
    imageAlt: "Portrait of MilletMarg Co-Founder",
    bio: "Passionate about reviving ancient Indian grains and translating ancestral recipes into accessible, contemporary cafe experiences.",
    motivation:
      "Growing up with traditional kitchen wisdom, our founder noticed how refined grains replaced nutritious millets in urban diets and set out to bridge that divide.",
    vision:
      "To build a brand where enjoying wholesome millets is effortless, craveable, and celebrated across all generations.",
  },
  {
    id: "founder-2",
    name: "[Founder Name 2]",
    role: "Co-Founder & Head of Sourcing",
    image: "/placeholders/founder-2.svg",
    imageAlt: "Portrait of MilletMarg Co-Founder",
    bio: "Dedicated to agricultural heritage, connecting conscious consumers with the origins of ancient supergrains.",
    motivation:
      "Inspired by the resilience of rain-fed millets and the craftsmanship of rural growers, working to champion sustainable food culture.",
    vision:
      "Making MilletMarg a beacon for conscious hospitality that respects the land, the farmer, and the health of our community.",
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
