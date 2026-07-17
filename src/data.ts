import { Product, BlogPost, TeamMember, FAQItem } from "./types";

export const PRODUCTS: Product[] = [
  {
    id: "b1",
    name: "Truffle Wagyu Burger",
    description: "Aged Japanese Wagyu beef patty, black truffle aioli, melted Gruyère cheese, caramelized onions, wild rocket greens on an artisanal toasted brioche bun.",
    category: "Beef",
    price: 24.99,
    rating: 4.9,
    reviewsCount: 128,
    prepTime: "12 min",
    calories: "820 kcal",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
    badge: "Bestseller",
    ingredients: ["Japanese Wagyu", "Truffle Aioli", "Gruyère Cheese", "Caramelized Onions", "Rocket Greens"],
    allergens: ["Gluten", "Dairy", "Eggs"],
    spiceLevel: 0
  },
  {
    id: "b2",
    name: "Double Cheese Golden Burger",
    description: "Double premium Angus beef patties, aged cheddar, molten gold Monterey Jack, house-made pickle relish, smoked hickory sauce on a sesame bun.",
    category: "Cheese",
    price: 18.99,
    rating: 4.8,
    reviewsCount: 94,
    prepTime: "10 min",
    calories: "950 kcal",
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80",
    badge: "Popular",
    ingredients: ["Double Angus Patty", "Aged Cheddar", "Monterey Jack", "Relish", "Sesame Bun"],
    allergens: ["Gluten", "Dairy"],
    spiceLevel: 0
  },
  {
    id: "b3",
    name: "Spicy Crispy Chicken Burger",
    description: "Crispy buttermilk chicken breast tossed in hot cayenne-glaze, jalapeño lime slaw, cooling garlic herb cream on an premium bun.",
    category: "Chicken",
    price: 15.99,
    originalPrice: 19.99,
    rating: 4.7,
    reviewsCount: 76,
    prepTime: "15 min",
    calories: "740 kcal",
    image: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600&auto=format&fit=crop&q=80",
    badge: "20% Off Today",
    ingredients: ["Buttermilk Chicken", "Cayenne Glaze", "Jalapeño Slaw", "Garlic Cream"],
    allergens: ["Gluten", "Eggs"],
    spiceLevel: 3
  },
  {
    id: "b4",
    name: "Avocado Plant-Based Burger",
    description: "Flame-grilled house vegetarian patty, sliced hass avocado, beefsteak tomato, crisp alfalfa sprouts, coriander vegan mayo on a multigrain bun.",
    category: "Vegetarian",
    price: 16.99,
    rating: 4.6,
    reviewsCount: 52,
    prepTime: "8 min",
    calories: "610 kcal",
    image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80",
    ingredients: ["Plant-Based Patty", "Hass Avocado", "Tomato", "Alfalfa Sprouts", "Vegan Mayo"],
    allergens: ["Gluten", "Soy"],
    spiceLevel: 0
  },
  {
    id: "b5",
    name: "The Golden Feast Burger",
    description: "The ultimate culinary opulence. Double 24k gold leaf wrapped dry-aged Wagyu patties, fresh oscietra caviar, white truffle butter, champagne-infused emulsion on a custom stamped luxury bun.",
    category: "Beef",
    price: 49.99,
    originalPrice: 69.99,
    rating: 5.0,
    reviewsCount: 38,
    prepTime: "20 min",
    calories: "1,100 kcal",
    image: "https://images.unsplash.com/photo-1512152272829-e3139592d56f?w=600&auto=format&fit=crop&q=80",
    badge: "Limited Time Special",
    ingredients: ["24k Gold Leaf", "Dry-Aged Wagyu", "Oscietra Caviar", "White Truffle Butter", "Champagne Emulsion"],
    allergens: ["Gluten", "Dairy", "Shellfish"],
    spiceLevel: 0
  },
  {
    id: "s1",
    name: "Truffle Fries",
    description: "Thick-cut hand-stretched Idaho potatoes tossed with high-grade Italian white truffle oil, grated Parmigiano-Reggiano, and chopped rosemary greens.",
    category: "Fries",
    price: 6.99,
    rating: 4.9,
    reviewsCount: 220,
    prepTime: "5 min",
    calories: "450 kcal",
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80",
    badge: "Side Pick",
    ingredients: ["Idaho Potatoes", "Truffle Oil", "Parmigiano-Reggiano", "Rosemary"],
    allergens: ["Dairy"],
    spiceLevel: 0
  },
  {
    id: "d1",
    name: "Craft Cola",
    description: "House-crafted micro-brewed sugar cane cola infused with premium Madagascan vanilla pods, organic cassia bark, and essential citrus oils.",
    category: "Drinks",
    price: 3.50,
    rating: 4.5,
    reviewsCount: 88,
    prepTime: "2 min",
    calories: "150 kcal",
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80",
    ingredients: ["Brewed Cola", "Sugarcane", "Vanilla Pods", "Cassia Bark"],
    allergens: [],
    spiceLevel: 0
  },
  {
    id: "d2",
    name: "Champagne Infused Fizz",
    description: "Brut Champagne blended with wild elderflower syrup, cold-pressed lime zest, and club soda, served on sphere artisanal ice blocks.",
    category: "Drinks",
    price: 12.00,
    rating: 4.8,
    reviewsCount: 61,
    prepTime: "3 min",
    calories: "120 kcal",
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80",
    badge: "Luxury",
    ingredients: ["Brut Champagne", "Elderflower Syrup", "Lime Zest", "Artisanal Ice"],
    allergens: ["Alcohol"],
    spiceLevel: 0
  },
  {
    id: "de1",
    name: "Gourmet Lava Cake",
    description: "Warm Belgian dark chocolate lava cake with a soft molten core, accompanied by gourmet Madagascar vanilla gelato and wild berries coulis.",
    category: "Desserts",
    price: 8.99,
    rating: 4.9,
    reviewsCount: 110,
    prepTime: "10 min",
    calories: "550 kcal",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80",
    ingredients: ["Belgian Dark Chocolate", "Madagascar Gelato", "Vanilla Pods", "Berry Coulis"],
    allergens: ["Gluten", "Dairy", "Eggs"],
    spiceLevel: 0
  }
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "blog-1",
    title: "The Art of the Perfect Wagyu Patty",
    category: "Recipes",
    excerpt: "Discover the scientific precision and culinary secrets required to handle, grind, and sear Japanese Wagyu beef to absolute perfection.",
    content: "Grinding Wagyu requires ice-cold equipment to maintain the marbling structure intact. At Aura Gourmet, our executive chefs blend chuck, brisket, and short-rib cuts at exactly 0°C before shaping them. Searing is done on a high-temperature cast-iron grill to create a thick caramelized crust, preserving the rich oleic fats inside for an unbelievable burst of umami with every bite. To top it off, we rest the meat for exactly two minutes under foil before serving.",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80",
    authorName: "Chef Elena Marcus",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    date: "July 12, 2026",
    readTime: "5 min read",
    tags: ["Burgers", "Wagyu", "Gourmet Techniques"]
  },
  {
    id: "blog-2",
    title: "Inside the Golden Feast: Why 24k Gold?",
    category: "Behind the Scenes",
    excerpt: "Is it just aesthetic, or does 24k gold leaf add a unique texture and flair to our signature masterpiece? Let's take you inside our kitchen.",
    content: "The Golden Feast is our ultimate signature statement. Gold leaf has a historic place in fine gastronomy dating back to Renaissance banquets. While tasteless, the razor-thin 24k gold leaf alters the mechanical chew of the dry-aged Wagyu patty, creating a crisp, micro-textural shield that captures the oscietra caviar and champagne emulsion, delivering a multi-sensory symphony to the palate.",
    image: "https://images.unsplash.com/photo-1581546129595-c28701a75225?w=800&auto=format&fit=crop&q=80",
    authorName: "Chef Marcus Vance",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    date: "June 30, 2026",
    readTime: "4 min read",
    tags: ["Luxury Dining", "Gold Leaf", "Gastronomy"]
  },
  {
    id: "blog-3",
    title: "Sourcing local: From organic farms to your table",
    category: "News",
    excerpt: "Learn about our strict sourcing partners, guaranteeing that every rocket leaf and tomato has been handpicked from ethical family farms.",
    content: "Our commitment to sustainability starts from the soil. Every morning, local pesticide-free farms supply us with fresh rocket greens, organic heirloom beefsteak tomatoes, and non-GMO multigrain wheat. By supporting regional family-owned organic cooperatives, we reduce carbon footprint while guaranteeing pristine, nutrient-rich ingredients for our guests.",
    image: "https://images.unsplash.com/photo-1464226184884-fa280b87c3aa?w=800&auto=format&fit=crop&q=80",
    authorName: "Sarah Johnson",
    authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    date: "May 15, 2026",
    readTime: "3 min read",
    tags: ["Sourcing", "Sustainability", "Organic"]
  }
];

export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Chef Marcus Vance",
    role: "Executive Culinary Director",
    photo: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&auto=format&fit=crop&q=80",
    bio: "With over 18 years of fine-dining experience in Michelin-starred kitchens across Paris and Tokyo, Chef Marcus leads the burger revolution."
  },
  {
    name: "Elena Rostova",
    role: "Master Grill & Wagyu Specialist",
    photo: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&auto=format&fit=crop&q=80",
    bio: "Elena's precise control over smoke, hickory, and cast-iron searing temperatures makes our Aged Wagyu burgers legendary."
  },
  {
    name: "David Miller",
    role: "Head of Operations & Wine Sommelier",
    photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80",
    bio: "David orchestrates our seamless cashier and kitchen pipelines while curating champagne and wine pairings for luxury guests."
  }
];

export const FAQS: FAQItem[] = [
  {
    question: "Do you offer premium contactless delivery?",
    answer: "Yes, we offer premium luxury delivery packaged in climate-controlled containers to ensure your burger arrives at the absolute perfect temperature ($10.00 flat fee, or free for inner circle subscribers)."
  },
  {
    question: "Can I customize the Wagyu patty cooking level?",
    answer: "Absolutely. We recommend 'Medium Rare' to enjoy the Wagyu marbling fully, but you can select Rare, Medium, or Well Done in our customization popup."
  },
  {
    question: "Are there vegan/gluten-free options?",
    answer: "Yes, we offer our 'Avocado Plant-Based Burger' with a gluten-free bun option and vegan mayo. Let our chefs know of any allergen constraints via the special instructions box."
  },
  {
    question: "How do I make a group reservation?",
    answer: "You can make a reservations request directly on our Contact page or contact our guest liaison at reservations@auragourmet.com."
  }
];
