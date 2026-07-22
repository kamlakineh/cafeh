import React from "react";
import { 
  Heart, Plus, Minus, ArrowRight, Star, Clock, Flame, 
  MapPin, Phone, Mail, Calendar, Sparkles, Send, Paperclip,
  CheckCircle, ChevronDown, MessageSquare, SendHorizontal, X,
  BadgePercent, ThumbsUp, Leaf, ShieldCheck, UserCheck, Eye, Share2, ShoppingCart, RefreshCw
} from "lucide-react";
import { Product, BlogPost, FAQItem, OrderItem, TeamMember } from "../types";

interface PublicPagesProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onAddToCart: (item: OrderItem) => void;
  cart: OrderItem[];
  setCart: React.Dispatch<React.SetStateAction<OrderItem[]>>;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  onCheckout: () => void;
  products?: Product[];
  blogPosts?: BlogPost[];
  teamMembers?: TeamMember[];
  faqs?: FAQItem[];
}

export default function PublicPages({
  currentTab,
  setCurrentTab,
  onAddToCart,
  cart,
  setCart,
  cartOpen,
  setCartOpen,
  onCheckout,
  products,
  blogPosts,
  teamMembers,
  faqs
}: PublicPagesProps) {
  const activeProducts = products || [];
  const activeBlogs = blogPosts || [];
  const activeTeamMembers = teamMembers || [];
  const activeFaqs = faqs || [];
  // Common states
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [selectedBlog, setSelectedBlog] = React.useState<BlogPost | null>(null);
  
  // Customization States for Product Popup
  const [qty, setQty] = React.useState(1);
  const [extras, setExtras] = React.useState<{ [key: string]: boolean }>({});
  const [sauces, setSauces] = React.useState<{ [key: string]: boolean }>({});
  const [specialInstructions, setSpecialInstructions] = React.useState("");

  // Menu Search / Filtering States
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("All");
  const [sortOption, setSortOption] = React.useState("Popular");
  const [selectedDiet, setSelectedDiet] = React.useState<string[]>([]);
  const [maxPrice, setMaxPrice] = React.useState(50);

  // Secure Checkout Portal State
  const [checkoutOpen, setCheckoutOpen] = React.useState(false);
  const [checkoutName, setCheckoutName] = React.useState("Guest User");
  const [checkoutTable, setCheckoutTable] = React.useState("Table 1");
  const [checkoutType, setCheckoutType] = React.useState<'Dine-in' | 'Pickup'>("Pickup");
  const [checkoutMethod, setCheckoutMethod] = React.useState<'Card' | 'MetaMask'>("Card");
  const [customerMetaMaskAddress, setCustomerMetaMaskAddress] = React.useState<string | null>(null);
  const [customerMetaMaskConnecting, setCustomerMetaMaskConnecting] = React.useState(false);
  const [customerMetaMaskError, setCustomerMetaMaskError] = React.useState<string | null>(null);

  const connectCustomerMetaMask = async () => {
    setCustomerMetaMaskConnecting(true);
    setCustomerMetaMaskError(null);
    try {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
        if (accounts && accounts.length > 0) {
          setCustomerMetaMaskAddress(accounts[0]);
        } else {
          throw new Error("No accounts found. Please unlock MetaMask.");
        }
      } else {
        // Fallback simulation
        await new Promise((resolve) => setTimeout(resolve, 800));
        const mockAddr = "0x71C7656EC7ab88b098defB751B7401B5f6d1476B";
        setCustomerMetaMaskAddress(mockAddr);
      }
    } catch (err: any) {
      console.error(err);
      setCustomerMetaMaskError(err.message || "Failed to connect to MetaMask");
    } finally {
      setCustomerMetaMaskConnecting(false);
    }
  };

  // Chatbot Widget State
  const [chatOpen, setChatOpen] = React.useState(false);
  const [chatMessage, setChatMessage] = React.useState("");
  const [chatHistory, setChatHistory] = React.useState<{ sender: 'user' | 'bot', text: string }[]>([
    { sender: 'bot', text: "Welcome to Real Gourmet! I am your luxury AI Concierge. How can I assist you with our fine dining menu or story today?" }
  ]);
  const [chatLoading, setChatLoading] = React.useState(false);

  // Contact Form State
  const [contactForm, setContactForm] = React.useState({ name: "", email: "", phone: "", subject: "General", message: "" });
  const [contactSuccess, setContactSuccess] = React.useState(false);

  // FAQ Accordion Active Index
  const [activeFaq, setActiveFaq] = React.useState<number | null>(null);

  // Countdown timer for Today's Special (The Golden Feast)
  const [timeLeft, setTimeLeft] = React.useState({ hours: 14, minutes: 32, seconds: 45 });
  React.useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 24, minutes: 0, seconds: 0 };
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Cafe feedback state with standard pre-populated reviews
  const [cafeReviews, setCafeReviews] = React.useState<Array<{ name: string; avatar: string; text: string; rating: number; date: string }>>(() => {
    const saved = localStorage.getItem("aura_cafe_reviews");
    if (saved) return JSON.parse(saved);
    return [
      { name: "Sarah Johnson", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", text: "The Truffle Wagyu is the best burger I've ever had. Absolute culinary perfection! Elegant modern atmosphere.", rating: 5, date: "March 15, 2026" },
      { name: "Liam Carter", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", text: "Unbelievable clean aesthetic and premium presentation. Truly a luxury dining experience. Highly recommended.", rating: 5, date: "April 2, 2026" },
      { name: "Michael Vance", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150", text: "Fries are crispy, burger is juicy, and the Golden Feast is worth every dollar. Outstanding client service.", rating: 5, date: "June 24, 2026" }
    ];
  });

  const [newCafeReviewName, setNewCafeReviewName] = React.useState("");
  const [newCafeReviewText, setNewCafeReviewText] = React.useState("");
  const [newCafeReviewRating, setNewCafeReviewRating] = React.useState(5);
  const [cafeReviewSuccess, setCafeReviewSuccess] = React.useState(false);

  const handleAddCafeReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCafeReviewName.trim() || !newCafeReviewText.trim()) return;
    const newRev = {
      name: newCafeReviewName,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(newCafeReviewName)}`,
      text: newCafeReviewText,
      rating: newCafeReviewRating,
      date: new Date().toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })
    };
    const updated = [newRev, ...cafeReviews];
    setCafeReviews(updated);
    localStorage.setItem("aura_cafe_reviews", JSON.stringify(updated));
    setNewCafeReviewName("");
    setNewCafeReviewText("");
    setNewCafeReviewRating(5);
    setCafeReviewSuccess(true);
    setTimeout(() => setCafeReviewSuccess(false), 3000);
  };

  // Filter products
  const filteredProducts = activeProducts.filter(prod => {
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          prod.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || prod.category === selectedCategory;
    const matchesDiet = selectedDiet.length === 0 || selectedDiet.every(d => prod.ingredients.includes(d) || prod.category === d);
    const matchesPrice = prod.price <= maxPrice;
    const matchesAvailable = prod.isAvailable !== false;
    return matchesSearch && matchesCategory && matchesDiet && matchesPrice && matchesAvailable;
  }).sort((a, b) => {
    if (sortOption === "Popular") return b.rating - a.rating;
    if (sortOption === "Highest Price") return b.price - a.price;
    if (sortOption === "Lowest Price") return a.price - b.price;
    return 0;
  });

  // Calculate Product customization totals dynamically
  const calculateModalTotal = () => {
    if (!selectedProduct) return 0;
    let base = selectedProduct.price;
    
    // Check custom addOns prices if defined
    Object.keys(extras).forEach(extraName => {
      if (extras[extraName]) {
        const foundAddon = selectedProduct.addOns?.find(a => a.name === extraName);
        if (foundAddon) {
          base += foundAddon.price;
        } else {
          // Defaults
          if (extraName === "Extra Cheese") base += 1.50;
          else if (extraName === "Extra Patty") base += 4.50;
          else if (extraName === "Smoked Bacon") base += 2.00;
        }
      }
    });

    Object.keys(sauces).forEach(sauceName => {
      if (sauces[sauceName]) {
        const foundAddon = selectedProduct.addOns?.find(a => a.name === sauceName);
        if (foundAddon) {
          base += foundAddon.price;
        } else {
          base += 0.99; // Default sauce price
        }
      }
    });

    return base * qty;
  };

  const handleAddCustomizedToCart = () => {
    if (!selectedProduct) return;
    const selectedExtras = Object.keys(extras).filter(k => extras[k]);
    const selectedSauces = Object.keys(sauces).filter(k => sauces[k]);
    const customizations = [...selectedExtras, ...selectedSauces];
    if (specialInstructions.trim()) {
      customizations.push(`Note: ${specialInstructions}`);
    }

    onAddToCart({
      id: `${selectedProduct.id}-${Date.now()}`,
      name: selectedProduct.name,
      quantity: qty,
      customizations,
      price: calculateModalTotal() / qty
    });

    // Reset popup
    setSelectedProduct(null);
    setQty(1);
    setExtras({});
    setSauces({});
    setSpecialInstructions("");
  };

  // Submit contact form
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email) return;
    setContactSuccess(true);
    setTimeout(() => {
      setContactSuccess(false);
      setContactForm({ name: "", email: "", phone: "", subject: "General", message: "" });
    }, 4000);
  };

  // Chatbot message submission
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    const userMsg = chatMessage;
    setChatMessage("");
    setChatHistory(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatLoading(true);

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg })
      });
      const data = await response.json();
      setChatHistory(prev => [...prev, { sender: 'bot', text: data.text || "Our apology, we experienced a minor delay on the signal. Please query again." }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { sender: 'bot', text: "Apologies, my luxury link experienced high traffic. Our menu is completely organic." }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="w-full bg-transparent text-slate-800 min-h-screen">
      
      {/* 1. HOME TAB */}
      {currentTab === "Home" && (
        <div className="animate-fadeIn">
          {/* HERO SECTION */}
          <section className="relative min-h-[90vh] flex items-center justify-between overflow-hidden max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            {/* Background Particles */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-[#2B6CB0]/20 animate-pulse"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 5}s`,
                    animationDuration: `${3 + Math.random() * 4}s`
                  }}
                />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full z-10">
              {/* Text Left */}
              <div className="lg:col-span-5 space-y-8">
                <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#2B6CB0]/10 text-[#2B6CB0] font-mono text-xs shadow-sm">
                  <BadgePercent className="w-4 h-4 animate-bounce" />
                  <span>20% OFF ALL CHEF SPECIALS TODAY</span>
                </div>
                <h1 className="font-serif font-bold text-5xl sm:text-6xl text-slate-900 leading-tight">
                  Savor the <br />
                  <span className="text-[#2B6CB0] italic">Extraordinary</span>
                </h1>
                <p className="text-slate-600 font-sans leading-relaxed text-sm sm:text-base max-w-lg">
                  Experience gourmet burgers crafted with passion, dry-aged Wagyu beef, 24kt gold leaf accents, and fresh organic ingredients.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button 
                    onClick={() => setCurrentTab("Menu")}
                    className="px-8 py-4 bg-[#2B6CB0] text-white hover:bg-[#1D4ED8] font-semibold text-sm rounded-full transition-all duration-300 transform hover:scale-105 shadow-sm flex items-center space-x-2"
                  >
                    <span>Order Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setCurrentTab("Menu")}
                    className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm rounded-full transition-all duration-300 shadow-sm border border-[#EDF2F7]"
                  >
                    View Menu
                  </button>
                </div>
              </div>

              {/* Floating Burger Image Right */}
              <div className="lg:col-span-7 flex justify-center relative">
                <div className="absolute inset-0 bg-radial from-[#2B6CB0]/10 to-transparent blur-3xl rounded-full z-0 pointer-events-none" />
                <img 
                  src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80" 
                  alt="Signature Burger" 
                  className="w-full max-w-lg rounded-3xl shadow-sm z-10 object-cover transform hover:scale-[1.02] transition-transform duration-700 hover:rotate-1"
                />
              </div>
            </div>
          </section>

          {/* FEATURED CATEGORIES */}
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center space-y-3 mb-16">
                <h2 className="font-serif text-3xl sm:text-4xl text-slate-800 font-medium">Explore Our Menu</h2>
                <div className="w-16 h-[2px] bg-[#2B6CB0] mx-auto rounded-full" />
                <p className="text-xs font-mono uppercase text-slate-400 tracking-widest">Finest Gourmet Selections</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { name: "Beef Burgers", count: "12 Items", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400" },
                  { name: "Chicken Burgers", count: "8 Items", image: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=400" },
                  { name: "Cheese Burgers", count: "6 Items", image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400" },
                  { name: "Vegetarian", count: "5 Items", image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400" },
                  { name: "Combo Meals", count: "4 Items", image: "https://images.unsplash.com/photo-1512152272829-e3139592d56f?w=400" },
                  { name: "Fries", count: "5 Items", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400" },
                  { name: "Drinks", count: "10 Items", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400" },
                  { name: "Desserts", count: "4 Items", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400" }
                ].map((cat, i) => (
                  <div 
                    key={i}
                    onClick={() => {
                      const mapping: { [key: string]: string } = {
                        "Beef Burgers": "Beef",
                        "Chicken Burgers": "Chicken",
                        "Cheese Burgers": "Cheese",
                        "Vegetarian": "Vegetarian",
                        "Fries": "Fries",
                        "Drinks": "Drinks",
                        "Desserts": "Desserts"
                      };
                      setSelectedCategory(mapping[cat.name] || "All");
                      setCurrentTab("Menu");
                    }}
                    className="group bg-white hover:bg-slate-50 transition-all duration-300 cursor-pointer rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:scale-[1.03] text-center p-6 border border-slate-100"
                  >
                    <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-4 bg-gray-100">
                      <img src={cat.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <h3 className="font-serif text-slate-800 font-medium text-base group-hover:text-[#2B6CB0] transition-colors">{cat.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 font-mono">{cat.count}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* BEST SELLERS */}
          <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-16">
              <div className="space-y-2 text-center sm:text-left">
                <h2 className="font-serif text-3xl sm:text-4xl font-medium text-slate-800">Customer Favorites</h2>
                <p className="text-xs font-mono uppercase text-[#2B6CB0] tracking-widest">Best Selling Selections</p>
              </div>
              <button 
                onClick={() => setCurrentTab("Menu")}
                className="mt-4 sm:mt-0 px-6 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-[#2B6CB0] font-medium text-xs rounded-full transition-colors tracking-wider uppercase shadow-sm"
              >
                Browse All Menu
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {activeProducts.slice(0, 3).map((prod) => (
                <div 
                  key={prod.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:scale-[1.02] transition-transform duration-300 group border border-slate-100"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img src={prod.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {prod.badge && (
                      <span className="absolute top-4 left-4 px-3 py-1 bg-[#2B6CB0] text-white text-[10px] font-mono font-bold uppercase rounded-full">
                        {prod.badge}
                      </span>
                    )}
                    <button className="absolute top-4 right-4 p-2 rounded-xl bg-white/90 hover:bg-[#2B6CB0] hover:text-white transition-all text-slate-700 shadow-sm">
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-lg font-bold text-slate-800">{prod.name}</h3>
                      <div className="flex items-center space-x-1 text-[#2B6CB0]">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="text-xs font-mono">{prod.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{prod.description}</p>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xl font-bold font-mono text-[#2B6CB0]">${prod.price}</span>
                      <button 
                        onClick={() => setSelectedProduct(prod)}
                        className="px-4 py-2 bg-[#2B6CB0] text-white hover:bg-[#1D4ED8] text-xs font-bold rounded-full transition-colors shadow-sm flex items-center space-x-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Quick Add</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* TODAY'S SPECIAL (The Golden Feast) */}
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-slate-50 to-blue-50/40 rounded-3xl p-8 sm:p-12 shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-slate-100">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#2B6CB0]/10 text-[#2B6CB0] text-[10px] font-mono tracking-widest uppercase rounded-full">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    <span>Special Reserve Experience</span>
                  </div>
                  <h2 className="font-serif text-4xl sm:text-5xl text-slate-900 font-bold leading-tight">
                    The Golden Feast Burger
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed font-sans">
                    Double 24k gold leaf wrapped dry-aged Wagyu patties, fresh luxury oscietra caviar, white truffle butter, and champagne-infused emulsion on our custom stamped luxury bun.
                  </p>
                  
                  {/* Countdown timer */}
                  <div className="space-y-2">
                    <p className="text-xs font-mono uppercase text-slate-400 tracking-wider">Offer expires in:</p>
                    <div className="flex space-x-4">
                      {[{ label: "HOURS", val: timeLeft.hours }, { label: "MINUTES", val: timeLeft.minutes }, { label: "SECONDS", val: timeLeft.seconds }].map((t, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-xl text-center min-w-20 shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-slate-100">
                          <p className="text-2xl font-mono font-bold text-[#2B6CB0]">{String(t.val).padStart(2, '0')}</p>
                          <p className="text-[9px] font-mono text-slate-400 mt-1">{t.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 pt-4">
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-mono">Special Price</p>
                      <p className="text-3xl font-serif font-bold text-[#2B6CB0]">$49.99 <span className="text-sm line-through text-slate-400 font-sans ml-2">$69.99</span></p>
                    </div>
                    <button 
                      onClick={() => setSelectedProduct(activeProducts.find(p => p.id === "b5") || activeProducts[0])}
                      className="px-8 py-4 bg-[#2B6CB0] text-white hover:bg-[#1D4ED8] font-bold text-sm rounded-full transition-all duration-300 shadow-sm"
                    >
                      Reserve Now
                    </button>
                  </div>
                </div>

                <div className="flex justify-center">
                  <img 
                    src="https://images.unsplash.com/photo-1512152272829-e3139592d56f?w=600&auto=format&fit=crop&q=80" 
                    alt="Golden Burger" 
                    className="w-full max-w-md rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] object-cover aspect-square"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* WHY CHOOSE US */}
          <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-3 mb-16">
              <h2 className="font-serif text-3xl sm:text-4xl text-slate-800 font-medium">The Premium Difference</h2>
              <div className="w-16 h-[2px] bg-[#2B6CB0] mx-auto rounded-full" />
              <p className="text-xs font-mono uppercase text-slate-400 tracking-widest">Why Gastronomes Select Aura</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: "Fresh Ingredients", desc: "No artificial preserves. Handpicked local organic rocket leaves and farm heirloom tomatoes daily.", icon: Leaf },
                { title: "Artisanal Buns", desc: "Our signature gold-brushed brioche buns are freshly baked at 5:00 AM every single morning.", icon: Sparkles },
                { title: "Master Chefs", desc: "Led by Michelin-experienced culinary directors specialized in Wagyu marbling and wood fires.", icon: UserCheck },
                { title: "Eco Sourcing", desc: "Pesticide-free regional farms, biodegradable premium packages, and zero-waste kitchen pipelines.", icon: CheckCircle },
                { title: "Express Dispatch", desc: "We utilize custom micro-thermal cases maintaining perfectly moist burgers in under 15 minutes.", icon: Clock },
                { title: "Secure Operations", desc: "Strict ISO compliance across all digital checkout portals and touchless mobile ordering.", icon: ShieldCheck }
              ].map((feat, idx) => (
                <div key={idx} className="bg-white p-8 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] text-center space-y-4 hover:-translate-y-1 transition-transform duration-300 border border-slate-100">
                  <div className="w-12 h-12 rounded-xl bg-[#2B6CB0]/10 flex items-center justify-center text-[#2B6CB0] mx-auto shadow-sm">
                    <feat.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-slate-800 font-bold text-lg">{feat.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-sans">{feat.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CUSTOMER REVIEWS */}
          <section className="py-20 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center space-y-3 mb-16">
                <h2 className="font-serif text-3xl sm:text-4xl text-slate-800 font-medium">Guest Memoirs</h2>
                <div className="w-16 h-[2px] bg-[#2B6CB0] mx-auto rounded-full" />
                <p className="text-xs font-mono uppercase text-slate-400 tracking-widest">Authentic Dining Reviews</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {activeFaqs.slice(0, 3).map((_, idx) => {
                  const mReview = [
                    { name: "Sarah Johnson", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", text: "The Truffle Wagyu is the best burger I've ever had. Absolute culinary perfection! Elegant modern atmosphere.", date: "March 15, 2026" },
                    { name: "Liam Carter", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", text: "Unbelievable clean aesthetic and premium presentation. Truly a luxury dining experience. Highly recommended.", date: "April 2, 2026" },
                    { name: "Michael Vance", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150", text: "Fries are crispy, burger is juicy, and the Golden Feast is worth every dollar. Outstanding client service.", date: "June 24, 2026" }
                  ][idx];
                  return (
                    <div key={idx} className="bg-white p-8 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] flex flex-col justify-between border border-slate-100">
                      <div className="space-y-4">
                        <div className="flex space-x-1 text-[#2B6CB0]">
                          {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                        </div>
                        <p className="text-xs italic text-slate-600 font-sans leading-relaxed">"{mReview.text}"</p>
                      </div>
                      <div className="flex items-center space-x-3 mt-6">
                        <img src={mReview.avatar} className="w-10 h-10 rounded-full object-cover" />
                        <div>
                          <p className="text-xs font-bold text-slate-800">{mReview.name}</p>
                          <p className="text-[10px] font-mono text-slate-400">{mReview.date}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* KITCHEN GALLERY */}
          <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-3 mb-16">
              <h2 className="font-serif text-3xl sm:text-4xl text-slate-800 font-medium">Inside Our Kitchen</h2>
              <div className="w-16 h-[2px] bg-[#2B6CB0] mx-auto rounded-full" />
              <p className="text-xs font-mono uppercase text-slate-400 tracking-widest">Our Culinary Artisans</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400",
                "https://images.unsplash.com/photo-1544025162-d76694265947?w=400",
                "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400",
                "https://images.unsplash.com/photo-1464226184884-fa280b87c3aa?w=400"
              ].map((img, i) => (
                <div key={i} className="h-64 rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.05)] group border border-slate-100">
                  <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
              ))}
            </div>
          </section>

          {/* NEWSLETTER */}
          <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-slate-50 to-blue-50/40 border border-slate-100 rounded-3xl p-8 sm:p-12 shadow-[0_2px_8px_rgba(0,0,0,0.03)] text-center max-w-3xl mx-auto space-y-6">
              <h2 className="font-serif text-3xl text-slate-900 font-bold">Join the Inner Circle</h2>
              <p className="text-xs text-slate-500 font-sans max-w-md mx-auto leading-relaxed">
                Unlock exclusive weekly private reserve offers, invitations to chef tasting banquets, and our gourmet newsletter.
              </p>
              <form onSubmit={handleContactSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input 
                  type="email" 
                  placeholder="your@email.com" 
                  required
                  className="flex-1 px-5 py-3.5 rounded-full bg-white text-xs text-slate-800 placeholder-slate-400 font-sans outline-none focus:ring-1 focus:ring-[#2B6CB0] border border-slate-200 shadow-sm"
                />
                <button 
                  type="submit"
                  className="px-6 py-3.5 bg-[#2B6CB0] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-full shadow-sm uppercase tracking-wider transition-colors"
                >
                  Join Now
                </button>
              </form>
            </div>
          </section>
        </div>
      )}

      {/* 2. MENU TAB */}
      {currentTab === "Menu" && (
        <div className="animate-fadeIn max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* Breadcrumbs */}
          <nav className="text-xs font-mono text-slate-400 mb-4">
            <span className="cursor-pointer hover:text-slate-800" onClick={() => setCurrentTab("Home")}>HOME</span>
            <span className="mx-2">&gt;</span>
            <span className="text-[#2B6CB0]">OUR GOURMET MENU</span>
          </nav>

          <h2 className="font-serif text-4xl font-bold text-slate-800 mb-8 text-center sm:text-left">Our Menu</h2>

          {/* Filter, Search, Sort Panel */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)] mb-10 border border-slate-100 space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative w-full md:w-96">
                <input 
                  type="text" 
                  placeholder="Search burgers, sides, drinks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-5 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-800 placeholder-slate-400 outline-none focus:ring-1 focus:ring-[#2B6CB0]"
                />
                <span className="absolute right-4 top-3.5 text-slate-400">
                  <Plus className="w-4 h-4 rotate-45" onClick={() => setSearchQuery("")} />
                </span>
              </div>

              {/* Sorting */}
              <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
                <span className="text-xs text-slate-500 font-mono">Sort by:</span>
                <select 
                  value={sortOption} 
                  onChange={(e) => setSortOption(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-[#2B6CB0] text-xs rounded-full py-2.5 px-4 outline-none font-mono cursor-pointer shadow-sm"
                >
                  <option value="Popular">Popularity</option>
                  <option value="Highest Price">Highest Price</option>
                  <option value="Lowest Price">Lowest Price</option>
                </select>
              </div>
            </div>

            {/* Category Navigation */}
            <div className="flex overflow-x-auto pb-2 gap-3 no-scrollbar scroll-smooth">
              {["All", "Beef", "Chicken", "Cheese", "Vegetarian", "Fries", "Drinks", "Desserts"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2.5 rounded-full text-xs transition-colors font-mono tracking-wider uppercase shrink-0 ${
                    selectedCategory === cat 
                      ? "bg-[#2B6CB0] text-white font-bold shadow-sm" 
                      : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Dietary Checkboxes & Price slider */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 text-xs text-slate-500">
              <div className="flex flex-wrap gap-4 items-center">
                <span className="font-mono">Dietary Preferences:</span>
                {["Gluten-Free", "Vegan", "Dairy-Free", "Wagyu"].map((diet) => (
                  <label key={diet} className="flex items-center space-x-2 cursor-pointer hover:text-slate-800">
                    <input 
                      type="checkbox"
                      checked={selectedDiet.includes(diet)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedDiet([...selectedDiet, diet]);
                        else setSelectedDiet(selectedDiet.filter(d => d !== diet));
                      }}
                      className="rounded border-slate-300 bg-slate-50 text-[#2B6CB0] focus:ring-0 w-4 h-4"
                    />
                    <span>{diet}</span>
                  </label>
                ))}
              </div>

              <div className="flex items-center space-x-4 justify-end">
                <span className="font-mono shrink-0">Max Price: ${maxPrice}</span>
                <input 
                  type="range" 
                  min="3" 
                  max="50" 
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full max-w-xs accent-[#2B6CB0] bg-slate-200 h-1.5 rounded-full"
                />
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
            {filteredProducts.map((prod) => (
              <div 
                key={prod.id}
                className="bg-white rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:scale-[1.01] transition-transform duration-300 flex flex-col justify-between border border-slate-100"
              >
                <div>
                  <div className="relative h-28 sm:h-36 overflow-hidden">
                    <img src={prod.image} className="w-full h-full object-cover" />
                    {prod.badge && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-[#2B6CB0] text-white text-[8px] sm:text-[9px] font-mono font-bold uppercase rounded-full">
                        {prod.badge}
                      </span>
                    )}
                  </div>
                  <div className="p-3 sm:p-4 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                      <h3 className="font-serif text-xs sm:text-sm font-bold text-slate-800 line-clamp-1">{prod.name}</h3>
                      <span className="text-xs sm:text-sm font-bold font-mono text-[#2B6CB0]">${prod.price}</span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-slate-400 leading-normal font-sans line-clamp-2">{prod.description}</p>
                  </div>
                </div>

                <div className="p-3 sm:p-4 border-t border-slate-50 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center text-[10px] sm:text-xs text-slate-400 font-mono">
                    <span className="flex items-center"><Clock className="w-3 h-3 text-slate-400 mr-1" /> {prod.prepTime}</span>
                  </div>
                  <button 
                    onClick={() => setSelectedProduct(prod)}
                    className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-[#2B6CB0] hover:bg-[#1D4ED8] text-white font-bold text-[10px] sm:text-xs rounded-full transition-colors shadow-sm flex items-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Order</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. BLOG TAB */}
      {currentTab === "Blog" && (
        <div className="animate-fadeIn max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center space-y-3 mb-16">
            <h2 className="font-serif text-4xl text-slate-800 font-bold">The Gourmet Journal</h2>
            <p className="text-xs font-mono uppercase text-slate-400 tracking-widest">Stories, recipes, and updates from our kitchen</p>
          </div>

          {/* Featured Article */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.05)] mb-12 border border-slate-100 grid grid-cols-1 lg:grid-cols-2 items-center">
            <img 
              src="https://images.unsplash.com/photo-1544025162-d76694265947?w=800" 
              className="h-96 w-full object-cover" 
            />
            <div className="p-8 sm:p-12 space-y-6">
              <span className="text-[10px] bg-[#2B6CB0]/10 text-[#2B6CB0] px-3 py-1 font-mono rounded-full uppercase tracking-widest">Featured Entry</span>
              <h3 className="font-serif text-2xl sm:text-3xl text-slate-800 font-bold leading-snug">The Art of the Perfect Patty</h3>
              <p className="text-xs text-slate-500 font-sans leading-relaxed">
                Discover the scientific precision and culinary secrets required to handle, grind, and sear Japanese Wagyu beef to absolute perfection.
              </p>
              <button 
                onClick={() => setSelectedBlog(activeBlogs[0])}
                className="px-6 py-3 bg-[#2B6CB0] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-full transition-colors uppercase tracking-wider shadow-sm flex items-center space-x-1"
              >
                <span>Read Full Article</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Blog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeBlogs.map((post) => (
              <div 
                key={post.id}
                className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.05)] flex flex-col justify-between hover:scale-[1.01] transition-transform duration-200 border border-slate-100"
              >
                <div>
                  <img src={post.image} className="h-52 w-full object-cover" />
                  <div className="p-6 space-y-3">
                    <span className="text-[10px] text-[#2B6CB0] uppercase tracking-wider font-mono">{post.category}</span>
                    <h4 className="font-serif text-lg font-bold text-slate-800 line-clamp-1">{post.title}</h4>
                    <p className="text-xs text-slate-500 font-sans line-clamp-3 leading-relaxed">{post.excerpt}</p>
                  </div>
                </div>

                <div className="p-6 pt-0 border-none flex items-center justify-between text-xs text-slate-400 font-mono">
                  <div className="flex items-center space-x-2">
                    <img src={post.authorAvatar} className="w-6 h-6 rounded-full object-cover" />
                    <span className="text-slate-600">{post.authorName}</span>
                  </div>
                  <span>{post.readTime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. ABOUT TAB */}
      {currentTab === "About" && (
        <div className="animate-fadeIn max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
          <div className="text-center space-y-3">
            <h2 className="font-serif text-4xl text-slate-800 font-bold">Our Story, Our Passion</h2>
            <p className="text-xs font-mono uppercase text-slate-400 tracking-widest">From a small food truck to gourmet excellence</p>
          </div>

          {/* Section 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="font-serif text-2xl text-[#2B6CB0] italic">Founded in 2015</h3>
              <p className="text-sm text-slate-600 font-sans leading-relaxed">
                Aura Gourmet began with a simple mission: to elevate the humble burger into a culinary masterpiece. We source dry-aged Wagyu beef from elite suppliers and craft each signature dish with fine-dining complexity.
              </p>
              <div className="grid grid-cols-2 gap-6 pt-4 font-serif">
                <div className="bg-white p-4 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-slate-100 text-center">
                  <p className="text-2xl text-[#2B6CB0] font-bold">100%</p>
                  <p className="text-xs text-slate-500 uppercase font-sans mt-1">Aged Wagyu</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-slate-100 text-center">
                  <p className="text-2xl text-[#2B6CB0] font-bold">0%</p>
                  <p className="text-xs text-slate-500 uppercase font-sans mt-1">Artificial Preserves</p>
                </div>
              </div>
            </div>
            <img 
              src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=600" 
              className="rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] w-full max-w-lg mx-auto h-80 object-cover" 
            />
          </div>

          {/* Timeline */}
          <div className="bg-white p-8 rounded-3xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-slate-100 space-y-8">
            <h3 className="font-serif text-xl font-bold text-slate-800 text-center mb-8">Culinary Milestones</h3>
            <div className="space-y-6 max-w-2xl mx-auto">
              {[
                { year: "2015", text: "Founded as a specialized private catering experience in New York." },
                { year: "2017", text: "Opened our premier brick-and-mortar boutique salon in Manhattan." },
                { year: "2021", text: "Honored with national gastropub gold medals for the Truffle Wagyu." },
                { year: "2026", text: "Expanding international reserve lounges with real-time digital suites." }
              ].map((m, idx) => (
                <div key={idx} className="flex space-x-6 items-start">
                  <span className="font-serif font-bold text-[#2B6CB0] text-lg bg-slate-50 border border-slate-100 px-3 py-1 rounded-lg shadow-sm shrink-0">{m.year}</span>
                  <p className="text-xs text-slate-500 leading-relaxed font-sans">{m.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Team Section */}
          <div className="space-y-12">
            <h3 className="font-serif text-2xl text-slate-800 font-medium text-center">Our Masters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {activeTeamMembers.map((chef, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-slate-100 text-center space-y-4">
                  <img src={chef.photo} className="w-24 h-24 rounded-full mx-auto object-cover" />
                  <div>
                    <h4 className="font-serif text-slate-800 font-bold text-lg">{chef.name}</h4>
                    <p className="text-xs text-[#2B6CB0] font-mono mt-0.5">{chef.role}</p>
                  </div>
                  <p className="text-xs text-slate-500 font-sans leading-relaxed">{chef.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. CONTACT TAB */}
      {currentTab === "Contact" && (
        <div className="animate-fadeIn max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
          <div className="text-center space-y-3">
            <h2 className="font-serif text-4xl text-slate-800 font-bold">Get in Touch</h2>
            <p className="text-xs font-mono uppercase text-slate-400 tracking-widest">We would love to hear from you</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              <h3 className="font-serif text-xl font-bold text-slate-800">Liaison Information</h3>
              <p className="text-xs text-slate-500 font-sans leading-relaxed">
                Connect with our guest managers for reservation bookings, event catering inquiries, or general feedback.
              </p>

              <div className="space-y-6">
                {[
                  { icon: MapPin, title: "Our Location", text: "123 Gourmet Avenue, New York, NY 10001" },
                  { icon: Phone, title: "Direct Line", text: "+1 (555) 123-4567" },
                  { icon: Mail, title: "Electronic Inquiries", text: "liaison@auragourmet.com" }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-4">
                    <div className="p-3 rounded-xl bg-slate-100 text-[#2B6CB0] border border-slate-150 shadow-sm">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold font-mono text-slate-800">{item.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dynamic Form */}
            <div className="bg-white p-8 rounded-3xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-slate-100">
              {contactSuccess ? (
                <div className="text-center py-12 space-y-4 animate-scaleUp">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mx-auto">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h4 className="font-serif text-xl text-slate-800 font-bold">Message Transmitted</h4>
                  <p className="text-xs text-slate-500 font-sans max-w-sm mx-auto">
                    Our guest liaison team has received your message and will respond within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-slate-400 uppercase">Full Name</label>
                      <input 
                        type="text" 
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl outline-none focus:ring-1 focus:ring-[#2B6CB0] shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-slate-400 uppercase">Email Address</label>
                      <input 
                        type="email" 
                        required
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl outline-none focus:ring-1 focus:ring-[#2B6CB0] shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-slate-400 uppercase">Message</label>
                    <textarea 
                      rows={4} 
                      required
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl outline-none focus:ring-1 focus:ring-[#2B6CB0] shadow-sm resize-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-4 bg-[#2B6CB0] text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#1D4ED8] transition-colors shadow-sm flex items-center justify-center space-x-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Message</span>
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* FAQ Accordion Section */}
          <div className="max-w-3xl mx-auto space-y-6 pt-12 border-none">
            <h3 className="font-serif text-2xl text-slate-800 font-medium text-center">Frequently Asked Questions</h3>
            <div className="space-y-3">
              {activeFaqs.map((faq, idx) => (
                <div key={idx} className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] overflow-hidden border border-slate-100 transition-all">
                  <button 
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full px-6 py-5 flex justify-between items-center text-left text-xs font-bold text-slate-850 hover:text-[#2B6CB0] transition-colors"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
                  </button>
                  {activeFaq === idx && (
                    <div className="px-6 pb-5 pt-1 text-xs text-slate-500 font-sans leading-relaxed border-t border-slate-50">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT DETAILS CUSTOMIZATION MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.1)] animate-scaleUp max-h-[90vh] flex flex-col justify-between border border-slate-100">
            <div className="overflow-y-auto p-6 space-y-6">
              
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-serif text-2xl text-slate-800 font-bold">{selectedProduct.name}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-1">{selectedProduct.category} Selection</p>
                </div>
                <button 
                  onClick={() => { setSelectedProduct(null); setQty(1); setExtras({}); setSauces({}); }}
                  className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Product Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                <img src={selectedProduct.image} className="rounded-xl w-full h-40 object-cover" />
                <div className="space-y-3">
                  <p className="text-xs text-slate-500 leading-relaxed font-sans">{selectedProduct.description}</p>
                  <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                    <span className="bg-slate-50 text-slate-500 border border-slate-100 px-2.5 py-1 rounded-md">Prep: {selectedProduct.prepTime}</span>
                    <span className="bg-slate-50 text-slate-500 border border-slate-100 px-2.5 py-1 rounded-md">Calories: {selectedProduct.calories}</span>
                  </div>
                </div>
              </div>

              {/* Extras Checkboxes */}
              {selectedProduct.category !== "Drinks" && selectedProduct.category !== "Desserts" && (
                <div className="space-y-3">
                  <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider">Enhance with Extras</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { name: "Extra Cheese", price: 1.50 },
                      { name: "Extra Patty", price: 4.50 },
                      { name: "Smoked Bacon", price: 2.00 }
                    ].map((ext) => (
                      <label key={ext.name} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors text-xs border border-slate-100">
                        <span className="text-slate-700 font-medium">{ext.name}</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-[#2B6CB0]">+${ext.price.toFixed(2)}</span>
                          <input 
                            type="checkbox"
                            checked={extras[ext.name] || false}
                            onChange={(e) => setExtras({ ...extras, [ext.name]: e.target.checked })}
                            className="rounded border-slate-300 text-[#2B6CB0] bg-white focus:ring-0 w-4 h-4"
                          />
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Sauces Selection */}
              {selectedProduct.category !== "Drinks" && selectedProduct.category !== "Desserts" && (
                <div className="space-y-3">
                  <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider">Select Premium Sauces</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {["Truffle Aioli", "BBQ Glaze", "Spicy Garlic Mayo", "Caviar Emulsion"].map((sauce) => (
                      <label key={sauce} className="flex items-center space-x-2 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 text-xs text-slate-700 border border-slate-100">
                        <input 
                          type="checkbox"
                          checked={sauces[sauce] || false}
                          onChange={(e) => setSauces({ ...sauces, [sauce]: e.target.checked })}
                          className="rounded border-slate-300 text-[#2B6CB0] bg-white focus:ring-0 w-4 h-4"
                        />
                        <span>{sauce}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Special Instructions */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider">Allergens & Special Instructions</h4>
                <textarea 
                  rows={2}
                  placeholder="e.g. No raw onion, extreme well-done, allergy context..."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 rounded-xl outline-none focus:ring-1 focus:ring-[#2B6CB0] shadow-sm resize-none"
                />
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center bg-white border border-slate-200 rounded-full p-1.5 shadow-sm">
                  <button 
                    disabled={qty <= 1}
                    onClick={() => setQty(qty - 1)}
                    className="p-1.5 rounded-full bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 text-xs font-bold font-mono text-slate-800">{qty}</span>
                  <button 
                    onClick={() => setQty(qty + 1)}
                    className="p-1.5 rounded-full bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-mono">Running Price</p>
                  <p className="text-lg font-bold font-mono text-[#2B6CB0]">${calculateModalTotal().toFixed(2)}</p>
                </div>
              </div>

              <button 
                onClick={handleAddCustomizedToCart}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#2B6CB0] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-full transition-colors uppercase tracking-wider shadow-sm flex items-center justify-center space-x-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* BLOG DEDICATED ARTICLE MODAL */}
      {selectedBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.1)] animate-scaleUp max-h-[95vh] flex flex-col justify-between border border-slate-100">
            <div className="overflow-y-auto p-6 space-y-6">
              <div className="flex justify-between items-start">
                <span className="text-[10px] bg-[#2B6CB0]/10 text-[#2B6CB0] px-3 py-1 font-mono rounded-full uppercase tracking-widest">{selectedBlog.category}</span>
                <button 
                  onClick={() => setSelectedBlog(null)}
                  className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h3 className="font-serif text-2xl text-slate-800 font-bold">{selectedBlog.title}</h3>

              <div className="flex items-center space-x-4 text-xs text-slate-500 font-mono">
                <img src={selectedBlog.authorAvatar} className="w-8 h-8 rounded-full object-cover" />
                <div>
                  <p className="text-slate-800 font-bold">{selectedBlog.authorName}</p>
                  <p className="text-[10px]">{selectedBlog.date} • {selectedBlog.readTime}</p>
                </div>
              </div>

              <img src={selectedBlog.image} className="rounded-xl w-full h-64 object-cover" />

              <div className="text-xs text-slate-600 leading-relaxed font-sans space-y-4">
                <p>{selectedBlog.content}</p>
                <div className="p-4 bg-slate-50 rounded-xl border-l-2 border-[#2B6CB0] italic text-[#2B6CB0] text-xs">
                  "Perfect temperature control and artisanal sourcing lies at the absolute heart of elite dining."
                </div>
                <p>
                  At Aura Gourmet, we strive daily to maintain these exact standards. Every single bun is baked fresh, every sauce prepared from scratch. We thank you for choosing our private table.
                </p>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-150 flex justify-between items-center text-xs text-slate-400">
              <div className="flex space-x-2">
                {selectedBlog.tags.map(t => (
                  <span key={t} className="bg-white border border-slate-100 px-2.5 py-1 rounded-md">#{t}</span>
                ))}
              </div>
              <button 
                onClick={() => setSelectedBlog(null)}
                className="px-5 py-2.5 bg-white border border-slate-250 hover:bg-slate-50 text-[#2B6CB0] font-bold rounded-full transition-colors"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHOPPING CART SIDEBAR */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end animate-fadeIn">
          <div className="bg-white w-full max-w-md h-full flex flex-col justify-between shadow-[0_0_24px_rgba(0,0,0,0.1)] animate-slideIn border-l border-slate-100 p-6">
            <div className="flex-1 flex flex-col min-h-0">
              {/* Header */}
              <div className="flex justify-between items-center pb-6 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="w-5 h-5 text-[#2B6CB0]" />
                  <h3 className="font-serif text-xl font-bold text-slate-800">Your Cart</h3>
                  <span className="text-xs font-mono bg-[#2B6CB0]/10 text-[#2B6CB0] px-2.5 py-0.5 rounded-full">{cart.reduce((acc, curr) => acc + curr.quantity, 0)} Items</span>
                </div>
                <button onClick={() => setCartOpen(false)} className="text-slate-400 hover:text-slate-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto py-6 space-y-4 no-scrollbar">
                {cart.length === 0 ? (
                  <div className="text-center py-20 space-y-3">
                    <ShoppingCart className="w-12 h-12 text-slate-200 mx-auto" />
                    <p className="text-xs text-slate-400 font-sans">Your shopping list is empty</p>
                    <button 
                      onClick={() => { setCartOpen(false); setCurrentTab("Menu"); }}
                      className="px-5 py-2 bg-[#2B6CB0]/10 text-[#2B6CB0] font-mono text-[10px] rounded-full uppercase hover:bg-[#2B6CB0]/20 transition-colors"
                    >
                      Browse Menu Now
                    </button>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="bg-slate-50 p-4 rounded-xl flex items-start justify-between shadow-sm border border-slate-100">
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-800">{item.name}</h4>
                        <div className="flex flex-wrap gap-1">
                          {item.customizations.map((cust, i) => (
                            <span key={i} className="text-[9px] font-mono bg-white text-slate-400 border border-slate-100 px-1.5 py-0.5 rounded">{cust}</span>
                          ))}
                        </div>
                        <p className="text-xs text-[#2B6CB0] font-mono pt-1">${item.price.toFixed(2)}</p>
                      </div>

                      <div className="flex flex-col items-end space-y-2">
                        <div className="flex items-center space-x-2 bg-white border border-slate-200 rounded-full p-1 shadow-sm">
                          <button 
                            onClick={() => {
                              if (item.quantity === 1) setCart(cart.filter(i => i.id !== item.id));
                              else setCart(cart.map(i => i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i));
                            }}
                            className="p-1 rounded-full bg-slate-50 text-slate-400 hover:text-slate-800"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-[10px] font-mono font-bold text-slate-800 px-2">{item.quantity}</span>
                          <button 
                            onClick={() => setCart(cart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))}
                            className="p-1 rounded-full bg-slate-50 text-slate-400 hover:text-slate-800"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Footer Summary */}
            {cart.length > 0 && (
              <div className="bg-slate-50 -mx-6 -mb-6 p-6 space-y-4 border-t border-slate-100">
                <div className="space-y-1.5 text-xs text-slate-500 font-mono">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="text-slate-850">${cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (8%):</span>
                    <span className="text-slate-850">${(cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0) * 0.08).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-slate-850 pt-2 border-t border-slate-200">
                    <span>Total Bill:</span>
                    <span className="text-[#2B6CB0] font-mono">${(cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0) * 1.08).toFixed(2)}</span>
                  </div>
                </div>

                <button 
                  onClick={() => setCheckoutOpen(true)}
                  className="w-full py-4 bg-[#2B6CB0] hover:bg-[#1D4ED8] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-sm flex items-center justify-center space-x-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Secure Checkout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FLOATING LIVE CHAT BOT WIDGET (BOTTOM RIGHT) */}
      <div className="fixed bottom-6 right-6 z-40">
        {chatOpen ? (
          <div className="bg-white w-80 h-96 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.1)] border border-slate-150 flex flex-col justify-between overflow-hidden animate-scaleUp">
            {/* Header */}
            <div className="bg-slate-50 border-b border-slate-150 px-4 py-3 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                <h4 className="font-serif text-sm font-bold text-slate-800">AI Lounge Liaison</h4>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-slate-400 hover:text-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans text-xs no-scrollbar">
              {chatHistory.map((ch, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${ch.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`p-3 rounded-2xl max-w-[80%] shadow-sm ${
                    ch.sender === 'user' 
                      ? 'bg-[#2B6CB0] text-white font-medium' 
                      : 'bg-slate-100 text-slate-850'
                  }`}>
                    {ch.text}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="p-3 rounded-2xl bg-slate-100 text-slate-400 font-mono text-[10px] flex items-center space-x-1">
                    <span className="animate-bounce">.</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendChat} className="p-3 bg-slate-50 border-t border-slate-150 flex items-center gap-2">
              <input 
                type="text" 
                placeholder="Query our luxury items or hours..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-full text-xs outline-none text-slate-800 placeholder-slate-450 focus:ring-1 focus:ring-[#2B6CB0] shadow-sm"
              />
              <button 
                type="submit"
                className="p-2 rounded-full bg-[#2B6CB0] text-white hover:bg-[#1D4ED8] transition-colors"
              >
                <SendHorizontal className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <button 
            onClick={() => setChatOpen(true)}
            className="p-4 rounded-full bg-[#2B6CB0] text-white hover:bg-[#1D4ED8] transition-all transform hover:scale-105 shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:rotate-6 flex items-center space-x-2"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="font-bold text-xs font-mono uppercase tracking-wider hidden sm:inline">AI concierge</span>
          </button>
        )}
      </div>

      {/* SECURE CHECKOUT PORTAL MODAL OVERLAY */}
      {checkoutOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden animate-scaleUp">
            
            {/* Header */}
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="font-serif font-black text-base text-[#D4AF37] uppercase tracking-wider">Aura Secure Checkout</h3>
                <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">Dual-channel encrypted settlement gateway</p>
              </div>
              <button 
                onClick={() => setCheckoutOpen(false)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-xs font-sans text-slate-600 max-h-[75vh] overflow-y-auto">
              
              {/* Order Summary Summary */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center font-mono">
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase">Settlement Total (with tax)</span>
                  <span className="text-[#2B6CB0] text-sm font-black">${(cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0) * 1.08).toFixed(2)}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[10px] block uppercase">Cart Volume</span>
                  <span className="text-slate-700 font-black">{cart.reduce((acc, curr) => acc + curr.quantity, 0)} Items</span>
                </div>
              </div>

              {/* Passenger Credentials */}
              <div className="space-y-3">
                <h4 className="font-serif font-black text-slate-800 uppercase tracking-wider text-[10px]">1. Order Credentials</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-mono text-[9px] uppercase">Your Name</label>
                    <input 
                      type="text"
                      value={checkoutName}
                      onChange={(e) => setCheckoutName(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-mono text-[9px] uppercase">Service Type</label>
                    <select
                      value={checkoutType}
                      onChange={(e: any) => setCheckoutType(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium"
                    >
                      <option value="Pickup">Pickup</option>
                      <option value="Dine-in">Dine-in Table</option>
                    </select>
                  </div>
                </div>

                {checkoutType === "Dine-in" && (
                  <div className="space-y-1 animate-fadeIn">
                    <label className="text-slate-400 font-mono text-[9px] uppercase">Table Designation</label>
                    <input 
                      type="text"
                      value={checkoutTable}
                      placeholder="e.g. Table 4"
                      onChange={(e) => setCheckoutTable(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Payment Instruments */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="font-serif font-black text-slate-800 uppercase tracking-wider text-[10px]">2. Select Settlement Channel</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setCheckoutMethod("Card")}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all ${
                      checkoutMethod === "Card"
                        ? "bg-slate-900 border-slate-900 text-[#D4AF37] font-black shadow-md"
                        : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-350"
                    }`}
                  >
                    <span className="text-base">💳</span>
                    <span className="font-mono text-[9px] uppercase tracking-wider">Credit Card</span>
                  </button>

                  <button
                    onClick={() => setCheckoutMethod("MetaMask")}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all ${
                      checkoutMethod === "MetaMask"
                        ? "bg-slate-900 border-slate-900 text-[#D4AF37] font-black shadow-md"
                        : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-350"
                    }`}
                  >
                    <span className="text-base">🦊</span>
                    <span className="font-mono text-[9px] uppercase tracking-wider">MetaMask Wallet</span>
                  </button>
                </div>

                {/* Card input field details */}
                {checkoutMethod === "Card" && (
                  <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-200/60 animate-fadeIn">
                    <div className="space-y-1">
                      <label className="text-slate-400 font-mono text-[9px] uppercase">Card Number</label>
                      <input 
                        type="text" 
                        placeholder="•••• •••• •••• 9021" 
                        disabled 
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 select-none"
                      />
                    </div>
                    <p className="text-[9px] text-slate-450 italic">
                      POS card terminal sandbox active. Real payment will use mock testing transactions.
                    </p>
                  </div>
                )}

                {/* MetaMask connection details */}
                {checkoutMethod === "MetaMask" && (
                  <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/60 animate-fadeIn">
                    <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                      <span className="font-mono text-slate-400 text-[9px] uppercase">Connection Status:</span>
                      <span className={`font-mono font-bold text-[9px] uppercase px-1.5 py-0.5 rounded ${
                        customerMetaMaskAddress 
                          ? "bg-green-100 text-green-800" 
                          : "bg-amber-100 text-amber-800"
                      }`}>
                        {customerMetaMaskAddress ? "Connected" : "Disconnected"}
                      </span>
                    </div>

                    {customerMetaMaskAddress ? (
                      <div className="space-y-2 text-[10px] font-mono text-slate-600">
                        <div className="flex justify-between items-center">
                          <span>CONNECTED ACCOUNT:</span>
                          <span className="text-slate-800 font-bold bg-slate-200 px-2 py-0.5 rounded text-[9px]">
                            {customerMetaMaskAddress.slice(0, 8)}...{customerMetaMaskAddress.slice(-6)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[9px] text-slate-400">
                          <span>WEB3 COMPLIANT HOST:</span>
                          <span>METAMASK EXTENSION PROVIDER</span>
                        </div>
                        <button
                          onClick={() => setCustomerMetaMaskAddress(null)}
                          className="w-full py-1 border border-rose-200 hover:bg-rose-50 text-rose-600 font-bold uppercase rounded-lg text-[9px] font-mono mt-1"
                        >
                          Disconnect Wallet
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3 py-1">
                        <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
                          Connect MetaMask to proceed with secure smart contract billing. Supports testnet or sandbox authorization.
                        </p>
                        
                        {customerMetaMaskError && (
                          <div className="p-2.5 bg-rose-50 border border-rose-100 text-rose-700 text-[10px] font-mono rounded-xl leading-normal">
                            {customerMetaMaskError}
                          </div>
                        )}

                        <button
                          onClick={connectCustomerMetaMask}
                          disabled={customerMetaMaskConnecting}
                          className="w-full py-2.5 bg-[#F59E0B] hover:bg-amber-600 text-white font-mono font-bold uppercase rounded-xl shadow-sm tracking-wider flex items-center justify-center space-x-1.5"
                        >
                          {customerMetaMaskConnecting ? (
                            <>
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              <span>Reaching MetaMask...</span>
                            </>
                          ) : (
                            <span>🦊 Connect MetaMask Wallet</span>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => setCheckoutOpen(false)}
                className="flex-1 py-3 border border-slate-200 text-slate-700 hover:bg-slate-100 font-mono font-bold rounded-xl text-[10px] uppercase tracking-wider transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (checkoutMethod === "MetaMask" && !customerMetaMaskAddress) {
                    setCustomerMetaMaskError("MetaMask connection is required for this settlement method.");
                    return;
                  }
                  // Authorized Checkout
                  onCheckout();
                  setCheckoutOpen(false);
                  setCustomerMetaMaskAddress(null);
                }}
                className="flex-grow py-3 bg-[#2B6CB0] hover:bg-[#1D4ED8] text-white font-mono font-bold rounded-xl text-[10px] uppercase tracking-wider transition-colors shadow-md"
              >
                Authorize Payment & Send Order
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
