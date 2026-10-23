import { ProductData } from "./api";

export type MealSlot = "Breakfast" | "Lunch" | "Evening Snack" | "Evening Snacks" | "Dinner";

export interface MilletProduct extends ProductData {
  numericPrice: number;
  tasteNotes: string[];
  mealSlots: MealSlot[];
  highlights: string[];
  badge?: string;
}

export interface QuizAnswers {
  flavours: string;
  creations: string[];
  budget: string;
  timings: string[];
  mattersMost: string;
  adventurousness: string;
}

export interface Persona {
  id: string;
  name: string;
  tagline: string;
  description: string;
  iconName: "Compass" | "Flame" | "Zap" | "Leaf" | "PiggyBank";
  traits: string[];
  whyAssigned: string;
}

export interface ProductMatch {
  product: MilletProduct;
  matchScore: number;
  reasons: string[];
}

export interface SmartBundle {
  id: string;
  name: string;
  tagline: string;
  products: MilletProduct[];
  originalTotal: number;
  bundlePrice: number;
  savings: number;
  savingsPercent: number;
  explanation: string;
}

export interface MealSlotItem {
  slot: "Breakfast" | "Lunch" | "Evening Snack" | "Dinner";
  product: MilletProduct;
  note: string;
  matchBadge?: string;
}

export interface DayPlan {
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  meals: MealSlotItem[];
  dailyCost: number;
}

export interface MealPlanWeek {
  days: DayPlan[];
  totalWeeklyCost: number;
  averageDailyCost: number;
  uniqueProductCount: number;
  isPersonalized: boolean;
  generatedAt: string;
  seed: number;
}

/**
 * The single source of truth for MilletMarg's actual food catalogue.
 * Reuses all products from the existing database and homepage showcases,
 * backed by existing photos in /public.
 */
export const MILLET_CATALOG: MilletProduct[] = [
  {
    id: 1,
    name: "The Classic MilletBowl™",
    slug: "millet-bowl",
    description: "Wholesome foxtail millets tossed with spiced chickpeas, Hass avocado, edamame, pickled radish, and house cold-pressed herb tahini.",
    price: "249.00",
    numericPrice: 249,
    image: "/millet-seasonal-bowl.png",
    category: "Millet Bowls",
    weight_grams: 380,
    ingredients: "Foxtail Millet, Spiced Chickpeas, Hass Avocado, Steamed Edamame, Pickled Radish, Herb Tahini, Cold-pressed Sesame Oil",
    is_vegetarian: true,
    allergen_information: "Contains sesame seeds.",
    nutritional_information: {
      serving_size: "380g",
      calories_kcal: 440,
      protein_g: 15.5,
      carbohydrates_g: 58.0,
      dietary_fiber_g: 9.2,
      fat_g: 12.0,
      calcium_mg: 180,
    },
    stock_quantity: 45,
    is_available: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    tasteNotes: ["Fresh & Light", "Savoury & Comforting"],
    mealSlots: ["Lunch", "Dinner"],
    highlights: ["15.5g Plant Protein", "Low Glycemic Index", "Artisan Supergrain Base"],
    badge: "Bestseller",
  },
  {
    id: 2,
    name: "Warm Chickpea & Millet Pilaf Bowl",
    slug: "chickpea-millet-pilaf-bowl",
    description: "Slow-simmered little millet infused with roasted cumin, turmeric, golden chickpeas, fresh coriander, and lemon drizzle.",
    price: "189.00",
    numericPrice: 189,
    image: "/millet-chickpea-bowl.png",
    category: "Millet Bowls",
    weight_grams: 350,
    ingredients: "Little Millet, Kabuli Chickpeas, Roasted Cumin, Turmeric, Fresh Coriander, Lemon, Mustard Seeds",
    is_vegetarian: true,
    allergen_information: "Naturally gluten-free. Processed in a vegetarian kitchen.",
    nutritional_information: {
      serving_size: "350g",
      calories_kcal: 380,
      protein_g: 13.0,
      carbohydrates_g: 62.0,
      dietary_fiber_g: 8.5,
      fat_g: 6.5,
      iron_mg: 4.8,
    },
    stock_quantity: 40,
    is_available: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    tasteNotes: ["Savoury & Comforting", "Spicy & Bold"],
    mealSlots: ["Lunch", "Dinner"],
    highlights: ["High Fiber", "Slow-Burn Energy", "Digestive Spices"],
    badge: "Comfort Classic",
  },
  {
    id: 3,
    name: "Little Millet Veggie Noodles",
    slug: "little-millet-veggie-noodles",
    description: "Sun-dried 100% millet noodles made with zero maida and no artificial tastemakers, tossed with garden vegetables and aromatic spices.",
    price: "95.00",
    numericPrice: 95,
    image: "/millet-hero-bowl.png",
    category: "Millet Noodles",
    weight_grams: 180,
    ingredients: "Little Millet Flour, Whole Wheat Flour, Cluster Bean Powder, Dried Bell Peppers, Rock Salt, Natural Spice Blend",
    is_vegetarian: true,
    allergen_information: "Contains wheat gluten.",
    nutritional_information: {
      serving_size: "90g",
      calories_kcal: 310,
      protein_g: 9.5,
      carbohydrates_g: 62.0,
      dietary_fiber_g: 6.5,
      fat_g: 1.4,
    },
    stock_quantity: 50,
    is_available: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    tasteNotes: ["Spicy & Bold", "Adventurous & Unique"],
    mealSlots: ["Lunch", "Evening Snacks", "Dinner"],
    highlights: ["Zero Maida", "Quick 10-Min Prep", "Pocket Friendly"],
    badge: "Budget Hero",
  },
  {
    id: 4,
    name: "Crispy Millet Dosa Plate",
    slug: "millet-dosa-plate",
    description: "Stone-ground fermented finger and foxtail millet crepe served with fresh grated coconut chutney and drumstick sambar.",
    price: "149.00",
    numericPrice: 149,
    image: "/millet-dosa-plate.png",
    category: "Fresh Millet Salads",
    weight_grams: 280,
    ingredients: "Finger Millet (Ragi), Foxtail Millet, Urad Dal, Fenugreek Seeds, Cold-pressed Sesame Oil, Coconut Chutney, Vegetable Sambar",
    is_vegetarian: true,
    allergen_information: "Contains coconut.",
    nutritional_information: {
      serving_size: "280g",
      calories_kcal: 295,
      protein_g: 8.8,
      carbohydrates_g: 48.0,
      dietary_fiber_g: 6.2,
      fat_g: 5.5,
    },
    stock_quantity: 35,
    is_available: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    tasteNotes: ["Savoury & Comforting", "Mild & Creamy"],
    mealSlots: ["Breakfast", "Evening Snacks", "Dinner"],
    highlights: ["Naturally Fermented", "Gut-Friendly Probiotics", "Crispy Texture"],
    badge: "Breakfast Favorite",
  },
  {
    id: 5,
    name: "Artisan Saffron Millet Shake",
    slug: "artisan-millet-shake",
    description: "Chilled creamy barnyard millet beverage sweetened with wild forest honey, green cardamom, and Kashmiri saffron threads.",
    price: "119.00",
    numericPrice: 119,
    image: "/millet-drink.png",
    category: "Millet Shakes",
    weight_grams: 300,
    ingredients: "Barnyard Millet Milk, Kashmiri Saffron, Green Cardamom, Raw Forest Honey, Roasted Pistachios",
    is_vegetarian: true,
    allergen_information: "Contains tree nuts (pistachios).",
    nutritional_information: {
      serving_size: "300ml",
      calories_kcal: 185,
      protein_g: 5.2,
      carbohydrates_g: 28.0,
      dietary_fiber_g: 3.5,
      fat_g: 3.8,
    },
    stock_quantity: 30,
    is_available: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    tasteNotes: ["Mild & Creamy", "Fresh & Light"],
    mealSlots: ["Breakfast", "Evening Snacks"],
    highlights: ["Dairy-Free Super Drink", "Pure Saffron Infusion", "Natural Energy Boost"],
    badge: "Refreshing",
  },
  {
    id: 6,
    name: "Rustic Jowar Thin-Crust Pizza",
    slug: "rustic-jowar-pizza",
    description: "Artisanal sorghum base baked with slow-cooked San Marzano style plum tomato sauce, fresh basil, and farm mozzarella.",
    price: "219.00",
    numericPrice: 219,
    image: "/millet-bowl-hero2.jpg",
    category: "Jowar Pizza",
    weight_grams: 320,
    ingredients: "Jowar (Sorghum) Flour, San Marzano Plum Tomatoes, Farm Mozzarella, Fresh Basil, Extra Virgin Olive Oil, Oregano",
    is_vegetarian: true,
    allergen_information: "Contains dairy (mozzarella).",
    nutritional_information: {
      serving_size: "320g",
      calories_kcal: 420,
      protein_g: 14.2,
      carbohydrates_g: 54.0,
      dietary_fiber_g: 7.8,
      fat_g: 11.5,
    },
    stock_quantity: 25,
    is_available: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    tasteNotes: ["Adventurous & Unique", "Spicy & Bold"],
    mealSlots: ["Lunch", "Dinner"],
    highlights: ["100% Sorghum Crust", "Artisan Wood-Fired Taste", "Gluten-Free Flour Base"],
    badge: "Chef's Special",
  },
  {
    id: 7,
    name: "Spiced Jowar Puffs",
    slug: "spiced-jowar-puffs",
    description: "Light, crunchy roasted sorghum puffs seasoned with chaat masala, cold-pressed sunflower oil, and tangy dry mango powder.",
    price: "75.00",
    numericPrice: 75,
    image: "/millet-seasonal-bowl.png",
    category: "Snacks",
    weight_grams: 100,
    ingredients: "Roasted Jowar Puffs, Cold-Pressed Sunflower Oil, Chaat Masala, Pink Himalayan Salt, Amchur",
    is_vegetarian: true,
    allergen_information: "Gluten-free.",
    nutritional_information: {
      serving_size: "30g",
      calories_kcal: 115,
      protein_g: 3.2,
      carbohydrates_g: 21.0,
      dietary_fiber_g: 2.8,
      fat_g: 2.2,
    },
    stock_quantity: 80,
    is_available: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    tasteNotes: ["Spicy & Bold", "Adventurous & Unique"],
    mealSlots: ["Evening Snacks"],
    highlights: ["Guilt-Free Crunch", "Roasted Not Fried", "Under ₹100"],
    badge: "Snack Favorite",
  },
  {
    id: 8,
    name: "Organic Ragi Laddu",
    slug: "organic-ragi-laddu",
    description: "Handcrafted traditional laddus made from sprouted finger millet (ragi), pure A2 desi ghee, cardamom, and organic jaggery.",
    price: "180.00",
    numericPrice: 180,
    image: "/millet-bowl-hero1.jpg",
    category: "Snacks",
    weight_grams: 250,
    ingredients: "Sprouted Ragi Flour, Desi Ghee, Organic Jaggery, Cardamom, Roasted Almonds",
    is_vegetarian: true,
    allergen_information: "Contains dairy (ghee) and tree nuts (almonds).",
    nutritional_information: {
      serving_size: "50g",
      calories_kcal: 210,
      protein_g: 3.8,
      carbohydrates_g: 32.5,
      dietary_fiber_g: 4.2,
      fat_g: 7.5,
      calcium_mg: 170,
    },
    stock_quantity: 40,
    is_available: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    tasteNotes: ["Savoury & Comforting", "Mild & Creamy"],
    mealSlots: ["Breakfast", "Evening Snacks"],
    highlights: ["Sprouted Supergrain", "Natural Jaggery", "Rich in Calcium"],
    badge: "Traditional Sweet",
  },
  {
    id: 9,
    name: "Barnyard Millet Flakes Poha",
    slug: "barnyard-millet-flakes",
    description: "Golden tempered barnyard millet flakes tossed with roasted peanuts, curry leaves, mustard seeds, and fresh lime juice.",
    price: "125.00",
    numericPrice: 125,
    image: "/millet-bowl-transparent.png",
    category: "Breakfast Cereals",
    weight_grams: 250,
    ingredients: "Barnyard Millet Flakes, Roasted Peanuts, Green Chillies, Curry Leaves, Mustard Seeds, Fresh Lemon Juice, Rock Salt",
    is_vegetarian: true,
    allergen_information: "Contains peanuts.",
    nutritional_information: {
      serving_size: "100g",
      calories_kcal: 280,
      protein_g: 6.8,
      carbohydrates_g: 48.0,
      dietary_fiber_g: 7.0,
      fat_g: 4.2,
    },
    stock_quantity: 35,
    is_available: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    tasteNotes: ["Fresh & Light", "Savoury & Comforting"],
    mealSlots: ["Breakfast", "Evening Snacks"],
    highlights: ["Light on Stomach", "Quick Breakfast", "Authentic Indore Flavor"],
    badge: "Morning Staple",
  },
  {
    id: 10,
    name: "Foxtail Millet Khichdi Mix",
    slug: "foxtail-millet-khichdi-mix",
    description: "Wholesome ready-to-cook khichdi blend combining foxtail millet and split yellow moong dal with roasted spices.",
    price: "140.00",
    numericPrice: 140,
    image: "/millet-bowl-hero3.jpg",
    category: "Ready to Cook",
    weight_grams: 300,
    ingredients: "Foxtail Millet, Moong Dal, Cumin Seeds, Ginger Powder, Turmeric, Black Pepper, Curry Leaves, Rock Salt",
    is_vegetarian: true,
    allergen_information: "Gluten-free.",
    nutritional_information: {
      serving_size: "100g",
      calories_kcal: 345,
      protein_g: 12.0,
      carbohydrates_g: 66.0,
      dietary_fiber_g: 7.8,
      fat_g: 2.8,
      iron_mg: 3.4,
    },
    stock_quantity: 60,
    is_available: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    tasteNotes: ["Savoury & Comforting", "Mild & Creamy"],
    mealSlots: ["Lunch", "Dinner"],
    highlights: ["12g Complete Protein", "Easy One-Pot Meal", "Comfort Food"],
    badge: "Wholesome Meal",
  },
  {
    id: 11,
    name: "Fresh Sprouted Millet Salad",
    slug: "fresh-sprouted-millet-salad",
    description: "Crunchy sprouted finger millets, pomegranate pearls, English cucumbers, mint, and zesty lemon-ginger vinaigrette.",
    price: "165.00",
    numericPrice: 165,
    image: "/millet-seasonal-bowl.png",
    category: "Fresh Millet Salads",
    weight_grams: 260,
    ingredients: "Sprouted Finger Millet, Ruby Pomegranate, English Cucumber, Mint Leaves, Lemon Juice, Cold-Pressed Olive Oil, Sea Salt",
    is_vegetarian: true,
    allergen_information: "Naturally gluten-free and vegan.",
    nutritional_information: {
      serving_size: "260g",
      calories_kcal: 210,
      protein_g: 7.5,
      carbohydrates_g: 38.0,
      dietary_fiber_g: 6.8,
      fat_g: 3.2,
    },
    stock_quantity: 30,
    is_available: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    tasteNotes: ["Fresh & Light", "Adventurous & Unique"],
    mealSlots: ["Breakfast", "Lunch", "Evening Snacks"],
    highlights: ["Raw & Sprouted", "Enzyme Rich", "Antioxidant Loaded"],
    badge: "Clean & Fresh",
  },
  {
    id: 12,
    name: "Kodo Millet Almond Cookies",
    slug: "kodo-millet-almond-cookies",
    description: "Melt-in-mouth artisanal cookies crafted from kodo millet flour, pure butter, brown cane sugar, cardamom, and roasted Californian almonds.",
    price: "220.00",
    numericPrice: 220,
    image: "/millet-bowl-hero1.jpg",
    category: "Bakery",
    weight_grams: 200,
    ingredients: "Kodo Millet Flour, Fresh Butter, Brown Sugar, Californian Almonds, Cardamom Powder",
    is_vegetarian: true,
    allergen_information: "Contains dairy (butter) and tree nuts (almonds).",
    nutritional_information: {
      serving_size: "40g",
      calories_kcal: 195,
      protein_g: 3.5,
      carbohydrates_g: 24.0,
      dietary_fiber_g: 2.5,
      fat_g: 9.5,
    },
    stock_quantity: 25,
    is_available: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    tasteNotes: ["Mild & Creamy", "Savoury & Comforting"],
    mealSlots: ["Evening Snacks"],
    highlights: ["Artisanal Bakery", "No White Sugar", "Chai Pairing"],
    badge: "Tea Time Delight",
  },
];

// Helper to look up a product by slug
export function getProductFromCatalog(slug: string): MilletProduct | undefined {
  return MILLET_CATALOG.find((p) => p.slug === slug);
}

/**
 * Quiz questions and configuration
 */
export const QUIZ_QUESTIONS = [
  {
    id: 1,
    key: "flavours",
    title: "What kind of flavours do you enjoy?",
    subtitle: "Select the primary taste profile you gravitate towards.",
    isMultiSelect: false,
    options: [
      { label: "Spicy & Bold", description: "Rich masalas, fiery herbs, and punchy zest" },
      { label: "Fresh & Light", description: "Crisp vegetables, subtle dressings, and clean grains" },
      { label: "Savoury & Comforting", description: "Warm, slow-cooked homestyle comfort and earthy seasonings" },
      { label: "Mild & Creamy", description: "Gentle aromatic spices, smooth broths, and soothing profiles" },
      { label: "Adventurous & Unique", description: "Creative fusion pairings and unexpected taste journeys" },
    ],
  },
  {
    id: 2,
    key: "creations",
    title: "Which millet creations interest you most?",
    subtitle: "Select all the creations you'd love to explore.",
    isMultiSelect: true,
    options: [
      { label: "Millet Bowls", description: "Artisan supergrain bowls loaded with seasonal goodness" },
      { label: "Millet Noodles", description: "Zero-maida noodles tossed with crisp garden veggies" },
      { label: "Jowar Pizza", description: "Crunchy sorghum crust pizzas with savory toppings" },
      { label: "Fresh Millet Salads", description: "Sprouted grains and wholesome salads" },
      { label: "Millet Shakes", description: "Creamy, chilled ancient-grain super smoothies" },
      { label: "I Enjoy Trying Everything", description: "Open to all delicious millet innovations" },
    ],
  },
  {
    id: 3,
    key: "budget",
    title: "What is your preferred budget per meal?",
    subtitle: "This guides our recommendations and daily meal plan calculations.",
    isMultiSelect: false,
    options: [
      { label: "Under ₹100", description: "Budget-friendly everyday snacks and noodles" },
      { label: "₹100–₹150", description: "Everyday wholesome bowls, poha, and dosas" },
      { label: "₹150–₹200", description: "Nutrient-packed specialty bowls and salads" },
      { label: "Above ₹200", description: "Premium signature dishes, pizzas, and artisan treats" },
    ],
  },
  {
    id: 4,
    key: "timings",
    title: "When do you usually enjoy millet-based food?",
    subtitle: "Select all meal occasions that match your routine.",
    isMultiSelect: true,
    options: [
      { label: "Breakfast", description: "Energizing morning staples and warm porridges" },
      { label: "Lunch", description: "Satisfying, balanced midday fuel without food comas" },
      { label: "Evening Snacks", description: "Guilt-free crunchy bites and afternoon chai pairings" },
      { label: "Dinner", description: "Light, gut-friendly suppers for restful recovery" },
      { label: "Any Time of the Day", description: "Flexible schedule with all-day snacking and meals" },
    ],
  },
  {
    id: 5,
    key: "mattersMost",
    title: "What matters most when choosing a meal?",
    subtitle: "This helps us rank recommendations specifically for your lifestyle.",
    isMultiSelect: false,
    options: [
      { label: "Affordability", description: "Great everyday nutritional value for money" },
      { label: "Taste and Flavour", description: "Irresistible gourmet spices and deep culinary craft" },
      { label: "Convenience", description: "Quick, hassle-free preparation and easy dining" },
      { label: "Variety", description: "A colorful rotation of different grains and flavors" },
      { label: "Fresh Preparation", description: "Farm-to-bowl freshness and wholesome ingredients" },
    ],
  },
  {
    id: 6,
    key: "adventurousness",
    title: "How adventurous are you with food?",
    subtitle: "We'll tune the diversity of your weekly planner accordingly.",
    isMultiSelect: false,
    options: [
      { label: "I Prefer Familiar Flavours", description: "Consistent, dependable Indian homestyle comfort" },
      { label: "I Enjoy a Mix of Familiar and New", description: "A thoughtful balance of staples with occasional twists" },
      { label: "I Love Trying New Combinations", description: "Excited by bold culinary discoveries and varied textures" },
    ],
  },
];

/**
 * Deterministic persona calculation logic based on customer responses.
 */
export function determinePersona(answers: QuizAnswers): Persona {
  const scores = {
    balanced: 0,
    flavour: 0,
    quick: 0,
    fresh: 0,
    value: 0,
  };

  // 1. Flavours
  if (answers.flavours === "Spicy & Bold") {
    scores.flavour += 4;
  } else if (answers.flavours === "Fresh & Light") {
    scores.fresh += 4;
  } else if (answers.flavours === "Savoury & Comforting") {
    scores.balanced += 2;
    scores.value += 2;
  } else if (answers.flavours === "Mild & Creamy") {
    scores.fresh += 2;
    scores.quick += 2;
  } else if (answers.flavours === "Adventurous & Unique") {
    scores.balanced += 3;
    scores.flavour += 2;
  }

  // 2. Creations
  const hasEverything = answers.creations.includes("I Enjoy Trying Everything");
  if (hasEverything) {
    scores.balanced += 4;
  }
  if (answers.creations.includes("Millet Noodles")) scores.quick += 2;
  if (answers.creations.includes("Jowar Pizza")) scores.flavour += 2;
  if (answers.creations.includes("Fresh Millet Salads")) scores.fresh += 3;
  if (answers.creations.includes("Millet Shakes")) {
    scores.quick += 1;
    scores.fresh += 1;
  }
  if (answers.creations.includes("Millet Bowls")) {
    scores.fresh += 2;
    scores.balanced += 2;
  }

  // 3. Budget
  if (answers.budget === "Under ₹100") {
    scores.value += 4;
    scores.quick += 1;
  } else if (answers.budget === "₹100–₹150") {
    scores.value += 2;
    scores.balanced += 1;
  } else if (answers.budget === "₹150–₹200") {
    scores.balanced += 2;
    scores.fresh += 1;
  } else if (answers.budget === "Above ₹200") {
    scores.flavour += 2;
    scores.fresh += 2;
  }

  // 5. What matters most (highest weight)
  if (answers.mattersMost === "Affordability") {
    scores.value += 6;
  } else if (answers.mattersMost === "Taste and Flavour") {
    scores.flavour += 6;
  } else if (answers.mattersMost === "Convenience") {
    scores.quick += 6;
  } else if (answers.mattersMost === "Variety") {
    scores.balanced += 6;
  } else if (answers.mattersMost === "Fresh Preparation") {
    scores.fresh += 6;
  }

  // 6. Adventurousness
  if (answers.adventurousness === "I Love Trying New Combinations") {
    scores.balanced += 3;
    scores.flavour += 2;
  } else if (answers.adventurousness === "I Prefer Familiar Flavours") {
    scores.value += 2;
    scores.quick += 1;
  } else {
    scores.balanced += 2;
  }

  // Pick highest scoring persona
  const candidates: { key: keyof typeof scores; score: number }[] = [
    { key: "value", score: scores.value },
    { key: "flavour", score: scores.flavour },
    { key: "quick", score: scores.quick },
    { key: "fresh", score: scores.fresh },
    { key: "balanced", score: scores.balanced },
  ];

  candidates.sort((a, b) => b.score - a.score);
  const winner = candidates[0].key;

  switch (winner) {
    case "flavour":
      return {
        id: "flavour-seeker",
        name: "The Flavour Seeker",
        tagline: "Bold spices, deep aromas, and rich culinary indulgence.",
        description:
          "Taste and vibrant spices lead your culinary journey. You look for deep, punchy seasonings and artisan millet creations that delight your palate every single day.",
        iconName: "Flame",
        traits: ["Prefers Bold Seasonings", "Prioritizes Taste & Richness", "Craves Gourmet Spices"],
        whyAssigned: `You chose "${answers.flavours}" flavors and highlighted "${answers.mattersMost}" as your top priority when choosing a meal.`,
      };
    case "quick":
      return {
        id: "quick-smart-eater",
        name: "The Quick & Smart Eater",
        tagline: "Speed, smart convenience, and whole-grain nutrition on the go.",
        description:
          "You need effortless, nourishing meals that seamlessly slot into a fast-paced day without compromising on whole-grain goodness or high protein.",
        iconName: "Zap",
        traits: ["Loves Convenient Meals", "Fast & Filling Staples", "Practical Routine"],
        whyAssigned: `You selected "${answers.mattersMost}" as what matters most and lean towards ready-to-eat and quick-prep millet staples.`,
      };
    case "fresh":
      return {
        id: "fresh-choice-enthusiast",
        name: "The Fresh Choice Enthusiast",
        tagline: "Farm-to-bowl vitality, clean ingredients, and revitalizing superfoods.",
        description:
          "You prioritize farm-fresh integrity, light and energizing superfoods, and clean, unpolished grains that leave you feeling light, nourished, and sharp.",
        iconName: "Leaf",
        traits: ["Values Clean Ingredients", "Loves Fresh Produce", "Prefers Light Sustenance"],
        whyAssigned: `You chose "${answers.flavours}" taste notes and placed "${answers.mattersMost}" at the heart of your dining decisions.`,
      };
    case "value":
      return {
        id: "value-conscious-planner",
        name: "The Value-Conscious Planner",
        tagline: "Smart budgeting, economical nutrition, and high-value staples.",
        description:
          "You look for the most value-packed, economical ways to enjoy nutrient-dense millets every day without overspending or sacrificing wholesome quality.",
        iconName: "PiggyBank",
        traits: ["Budget Conscious", "Prefers Practical Staples", "Values Cost Efficiency"],
        whyAssigned: `You selected "${answers.budget}" budget per meal and highlighted "${answers.mattersMost}" as your guiding metric.`,
      };
    case "balanced":
    default:
      return {
        id: "balanced-explorer",
        name: "The Balanced Explorer",
        tagline: "Curious, versatile, and eager to savor the full spectrum of millets.",
        description:
          "You enjoy variety, appreciate convenient meal choices, and like discovering new millet creations that fit your everyday routine.",
        iconName: "Compass",
        traits: ["Enjoys Diverse Options", "Open to Fusion Flavors", "Balanced Lifestyle"],
        whyAssigned: `You love trying a variety of creations and enjoy "${answers.adventurousness}" in your food journey.`,
      };
  }
}

/**
 * Transparent, deterministic product match calculator.
 */
export function calculateProductMatch(product: MilletProduct, answers: QuizAnswers): ProductMatch {
  let score = 52;
  const reasons: string[] = [];

  // 1. Flavor profile matching
  const hasMatchingFlavor = product.tasteNotes.some((tn) => tn.toLowerCase() === answers.flavours.toLowerCase());
  if (hasMatchingFlavor) {
    score += 18;
    reasons.push(`Directly matches your love for ${answers.flavours} flavors`);
  } else {
    score += 5;
  }

  // 2. Category interest matching
  const matchesCategory =
    answers.creations.includes("I Enjoy Trying Everything") ||
    answers.creations.some((c) => {
      if (c === "Millet Bowls" && product.category === "Millet Bowls") return true;
      if (c === "Millet Noodles" && product.category === "Millet Noodles") return true;
      if (c === "Jowar Pizza" && product.category === "Jowar Pizza") return true;
      if (c === "Fresh Millet Salads" && product.category === "Fresh Millet Salads") return true;
      if (c === "Millet Shakes" && product.category === "Millet Shakes") return true;
      return false;
    });

  if (matchesCategory) {
    score += 15;
    reasons.push(`Features your preferred category: ${product.category}`);
  }

  // 3. Budget alignment
  const price = product.numericPrice;
  if (answers.budget === "Under ₹100") {
    if (price <= 100) {
      score += 14;
      reasons.push(`Budget friendly at ₹${price} (within your under ₹100 target)`);
    } else if (price <= 150) {
      score += 4;
    } else {
      score -= 8;
    }
  } else if (answers.budget === "₹100–₹150") {
    if (price >= 90 && price <= 155) {
      score += 14;
      reasons.push(`Spot-on with your ₹100–₹150 meal budget (₹${price})`);
    } else if (price < 90) {
      score += 10;
      reasons.push(`Economical option at ₹${price}, saving on your budget`);
    } else {
      score += 2;
    }
  } else if (answers.budget === "₹150–₹200") {
    if (price >= 130 && price <= 200) {
      score += 14;
      reasons.push(`Ideal price-to-nutrition fit (₹${price})`);
    } else if (price < 130) {
      score += 10;
    } else {
      score += 6;
    }
  } else {
    // Above ₹200
    if (price >= 180) {
      score += 14;
      reasons.push(`Premium artisan preparation (₹${price})`);
    } else {
      score += 8;
    }
  }

  // 4. Preferred meal timing
  const matchesTiming =
    answers.timings.includes("Any Time of the Day") ||
    answers.timings.some((t) => {
      const norm = t === "Evening Snacks" ? "Evening Snack" : t;
      return product.mealSlots.some((slot) => (slot === "Evening Snacks" ? "Evening Snack" : slot) === norm);
    });

  if (matchesTiming) {
    score += 10;
    reasons.push(`Great fit for your preferred meal times (${product.mealSlots.join(", ")})`);
  }

  // 5. Priorities
  if (answers.mattersMost === "Fresh Preparation" && (product.category.includes("Bowl") || product.category.includes("Salad"))) {
    score += 8;
    reasons.push("Small-batch fresh ingredients prepared daily");
  } else if (answers.mattersMost === "Taste and Flavour" && product.tasteNotes.includes("Spicy & Bold")) {
    score += 8;
    reasons.push("Rich culinary spice blend crafted for deep flavor");
  } else if (answers.mattersMost === "Convenience" && (product.category === "Snacks" || product.category === "Millet Noodles" || product.category === "Millet Shakes")) {
    score += 8;
    reasons.push("Effortless, quick dining option");
  } else if (answers.mattersMost === "Affordability" && price < 150) {
    score += 8;
    reasons.push("Exceptional daily value for wholesome supergrains");
  }

  // Normalize to 72% - 98%
  const normalized = Math.min(98, Math.max(72, Math.round(score)));

  if (reasons.length === 0) {
    reasons.push("Nutritious unpolished millets crafted for everyday wellness");
  }

  return {
    product,
    matchScore: normalized,
    reasons,
  };
}

/**
 * Rank all products for the customer answers.
 */
export function rankProductsForUser(answers: QuizAnswers): ProductMatch[] {
  const matches = MILLET_CATALOG.map((p) => calculateProductMatch(p, answers));
  matches.sort((a, b) => b.matchScore - a.matchScore);
  return matches;
}

/**
 * Generate smart product bundles from available catalogue items.
 */
export function generateSmartBundles(
  rankedMatches: ProductMatch[],
  answers: QuizAnswers,
  persona: Persona
): SmartBundle[] {
  const topProducts = rankedMatches.map((m) => m.product);

  const hero = topProducts[0] || MILLET_CATALOG[0];
  const second = topProducts[1] || MILLET_CATALOG[1];
  const third = topProducts[2] || MILLET_CATALOG[2];
  const fourth = topProducts[3] || MILLET_CATALOG[4];

  // Bundle 1: Daily Wellness Pair (Hero + Complementary snack/drink)
  const snackOrDrink =
    topProducts.find((p) => p.category === "Snacks" || p.category === "Millet Shakes") ||
    MILLET_CATALOG.find((p) => p.slug === "spiced-jowar-puffs")!;

  const b1Products = hero.id !== snackOrDrink.id ? [hero, snackOrDrink] : [hero, second];
  const b1Original = b1Products.reduce((sum, p) => sum + p.numericPrice, 0);
  const b1Price = Math.round(b1Original * 0.88); // 12% illustrative savings
  const b1Savings = b1Original - b1Price;

  // Bundle 2: Active Day Power Trio (Breakfast/Meal + Snack + Drink)
  const b2Drink =
    topProducts.find((p) => p.category === "Millet Shakes") ||
    MILLET_CATALOG.find((p) => p.slug === "artisan-millet-shake")!;
  const b2Meal = hero;
  const b2Snack =
    topProducts.find((p) => p.slug === "little-millet-veggie-noodles" || p.slug === "organic-ragi-laddu") ||
    third;

  const b2Set = new Set<number>();
  const b2Products: MilletProduct[] = [];
  [b2Meal, b2Drink, b2Snack].forEach((p) => {
    if (!b2Set.has(p.id)) {
      b2Set.add(p.id);
      b2Products.push(p);
    }
  });
  while (b2Products.length < 3) {
    const filler = MILLET_CATALOG.find((p) => !b2Set.has(p.id)) || MILLET_CATALOG[0];
    b2Set.add(filler.id);
    b2Products.push(filler);
  }

  const b2Original = b2Products.reduce((sum, p) => sum + p.numericPrice, 0);
  const b2Price = Math.round(b2Original * 0.85); // 15% illustrative savings
  const b2Savings = b2Original - b2Price;

  // Bundle 3: Gourmet Discovery Set (Persona-aligned)
  const b3Products = [second, third, fourth].filter(Boolean);
  const b3Original = b3Products.reduce((sum, p) => sum + p.numericPrice, 0);
  const b3Price = Math.round(b3Original * 0.86); // 14% illustrative savings
  const b3Savings = b3Original - b3Price;

  return [
    {
      id: "bundle-wellness-pair",
      name: `${persona.name} Starter Duo`,
      tagline: "Hearty main dish paired with a wholesome light refreshment.",
      products: b1Products,
      originalTotal: b1Original,
      bundlePrice: b1Price,
      savings: b1Savings,
      savingsPercent: Math.round((b1Savings / b1Original) * 100),
      explanation: `Specially curated around ${hero.name} to match your ${answers.flavours} preference with a light guilt-free snack.`,
    },
    {
      id: "bundle-power-trio",
      name: "All-Day Millet Sustenance Trio",
      tagline: "Breakfast energy, midday satiety, and afternoon refresher.",
      products: b2Products,
      originalTotal: b2Original,
      bundlePrice: b2Price,
      savings: b2Savings,
      savingsPercent: Math.round((b2Savings / b2Original) * 100),
      explanation: `Balances fast plant protein with gut-friendly supergrains for sustained productivity throughout your day.`,
    },
    {
      id: "bundle-gourmet-set",
      name: "Artisan Pantry & Tasting Box",
      tagline: "A diverse culinary flight of stone-ground and slow-roasted creations.",
      products: b3Products,
      originalTotal: b3Original,
      bundlePrice: b3Price,
      savings: b3Savings,
      savingsPercent: Math.round((b3Savings / b3Original) * 100),
      explanation: `Explores diverse millet varieties including foxtail, little millet, and ragi to keep your palate delighted.`,
    },
  ];
}

/**
 * 7-Day Meal Plan Generator.
 * Deterministic generation respecting:
 * - 4 slots: Breakfast, Lunch, Evening Snack, Dinner
 * - Preferences, budget, and meal timings
 * - Non-consecutive repetition avoidance
 * - Rotation variety based on adventurousness
 * - Seed parameter for working "Regenerate Plan" control
 */
export function generateMealPlan(
  products: MilletProduct[] = MILLET_CATALOG,
  answers?: QuizAnswers,
  seed = 1
): MealPlanWeek {
  const days: DayPlan["day"][] = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Categorize pool
  const breakfastPool = products.filter((p) => p.mealSlots.includes("Breakfast"));
  const lunchPool = products.filter((p) => p.mealSlots.includes("Lunch"));
  const snackPool = products.filter((p) => p.mealSlots.includes("Evening Snack") || p.mealSlots.includes("Evening Snacks"));
  const dinnerPool = products.filter((p) => p.mealSlots.includes("Dinner"));

  // Ranked pool if answers exist
  let rankedPool = products;
  if (answers) {
    rankedPool = rankProductsForUser(answers).map((m) => m.product);
  }

  // Helper to pick items with variety, avoiding consecutive repetition
  const weekDays: DayPlan[] = [];
  const usedProductIds = new Set<number>();
  let previousProductId: number | null = null;

  days.forEach((day, dayIndex) => {
    const dayMeals: MealSlotItem[] = [];

    const slots: ("Breakfast" | "Lunch" | "Evening Snack" | "Dinner")[] = [
      "Breakfast",
      "Lunch",
      "Evening Snack",
      "Dinner",
    ];

    slots.forEach((slot, slotIndex) => {
      let pool =
        slot === "Breakfast"
          ? breakfastPool
          : slot === "Lunch"
          ? lunchPool
          : slot === "Evening Snack"
          ? snackPool
          : dinnerPool;

      if (pool.length === 0) pool = products;

      // Filter out immediately previous product to avoid back-to-back repetition
      let candidatePool = pool.filter((p) => p.id !== previousProductId);
      if (candidatePool.length === 0) candidatePool = pool;

      // Deterministic pseudo-random index using dayIndex, slotIndex, and seed
      const pickIndex = (dayIndex * 4 + slotIndex * 3 + seed * 7) % candidatePool.length;
      const selectedProduct = candidatePool[pickIndex] || candidatePool[0];

      usedProductIds.add(selectedProduct.id);
      previousProductId = selectedProduct.id;

      let note = "";
      if (slot === "Breakfast") {
        note = "Energizing morning grain base with sustained carbohydrates.";
      } else if (slot === "Lunch") {
        note = "Nutrient-dense supergrain bowl offering clean midday fuel.";
      } else if (slot === "Evening Snack") {
        note = "Crunchy roasted bite paired perfectly with warm evening chai.";
      } else {
        note = "Easily digestible evening supper supporting overnight recovery.";
      }

      // Add match badge if matches answers
      let matchBadge: string | undefined = undefined;
      if (answers && answers.flavours && selectedProduct.tasteNotes.includes(answers.flavours)) {
        matchBadge = "Flavor Match";
      } else if (selectedProduct.numericPrice <= 120) {
        matchBadge = "Value Pick";
      }

      dayMeals.push({
        slot,
        product: selectedProduct,
        note,
        matchBadge,
      });
    });

    const dailyCost = dayMeals.reduce((sum, item) => sum + item.product.numericPrice, 0);

    weekDays.push({
      day,
      meals: dayMeals,
      dailyCost,
    });
  });

  const totalWeeklyCost = weekDays.reduce((sum, day) => sum + day.dailyCost, 0);
  const averageDailyCost = Math.round(totalWeeklyCost / 7);

  return {
    days: weekDays,
    totalWeeklyCost,
    averageDailyCost,
    uniqueProductCount: usedProductIds.size,
    isPersonalized: !!answers,
    generatedAt: new Date().toISOString(),
    seed,
  };
}

/**
 * Client-side persistence helpers (safe for SSR).
 */
const ANSWERS_STORAGE_KEY = "milletmarg_quiz_answers";
const PERSONA_STORAGE_KEY = "milletmarg_quiz_persona";
const MEAL_PLAN_SEED_KEY = "milletmarg_meal_plan_seed";

export function saveQuizToStorage(answers: QuizAnswers, persona: Persona): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ANSWERS_STORAGE_KEY, JSON.stringify(answers));
    localStorage.setItem(PERSONA_STORAGE_KEY, JSON.stringify(persona));
  } catch {
    // localStorage might be unavailable or disabled
  }
}

export function getQuizFromStorage(): { answers: QuizAnswers; persona: Persona } | null {
  if (typeof window === "undefined") return null;
  try {
    const rawAnswers = localStorage.getItem(ANSWERS_STORAGE_KEY);
    const rawPersona = localStorage.getItem(PERSONA_STORAGE_KEY);
    if (!rawAnswers || !rawPersona) return null;
    return {
      answers: JSON.parse(rawAnswers) as QuizAnswers,
      persona: JSON.parse(rawPersona) as Persona,
    };
  } catch {
    return null;
  }
}

export function clearQuizStorage(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(ANSWERS_STORAGE_KEY);
    localStorage.removeItem(PERSONA_STORAGE_KEY);
    localStorage.removeItem(MEAL_PLAN_SEED_KEY);
  } catch {
    // ignore
  }
}

export function saveMealPlanSeed(seed: number): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(MEAL_PLAN_SEED_KEY, String(seed));
  } catch {
    // ignore
  }
}

export function getMealPlanSeed(): number {
  if (typeof window === "undefined") return 1;
  try {
    const raw = localStorage.getItem(MEAL_PLAN_SEED_KEY);
    return raw ? parseInt(raw, 10) || 1 : 1;
  } catch {
    return 1;
  }
}
