import React from "react";
import { 
  Search, Plus, Trash2, Edit, Save, CreditCard, DollarSign, 
  Smartphone, Wallet, Keyboard, Sparkles, Sliders, MessageSquare, Info, X
} from "lucide-react";
import { Product, OrderItem, Order } from "../../types";

interface WalkInOrdersTabProps {
  onPlaceOrder: (order: Partial<Order>) => void;
  onTriggerToast: (msg: string) => void;
  onNavigateToTab: (tab: string) => void;
  products?: Product[];
}

export default function WalkInOrdersTab({
  onPlaceOrder,
  onTriggerToast,
  onNavigateToTab,
  products
}: WalkInOrdersTabProps) {
  const activeProducts = products || [];
  
  // Category selection
  const [selectedCategory, setSelectedCategory] = React.useState<string>("All");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  
  // Cart, Client details
  const [cart, setCart] = React.useState<OrderItem[]>([]);
  const [customerName, setCustomerName] = React.useState<string>("Guest");
  const [discountPct, setDiscountPct] = React.useState<number>(0);
  const [paymentMethod, setPaymentMethod] = React.useState<'Cash' | 'Card' | 'Mobile Money' | 'Wallet'>("Cash");
  const [notes, setNotes] = React.useState<string>("");

  // Customization modal states
  const [customizingProduct, setCustomizingProduct] = React.useState<Product | null>(null);
  const [selectedExtras, setSelectedExtras] = React.useState<string[]>([]);
  const [customizationNote, setCustomizationNote] = React.useState<string>("");

  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const categories = ["All", "Beef", "Chicken", "Cheese", "Vegetarian", "Fries", "Drinks", "Desserts"];

  // Demo Customers database for fast selection
  const demoCustomers = [
    { name: "Guest", phone: "" },
    { name: "Sarah Johnson", phone: "555-0199" },
    { name: "Liam Carter", phone: "555-0211" },
    { name: "Michael Vance", phone: "555-0871" },
    { name: "Evelyn Monroe", phone: "555-0399" }
  ];

  // Customization choices
  const customizationsOptions = [
    "Extra Cheese (+$1.50)",
    "Gluten-Free Bun (+$2.00)",
    "No Onions",
    "Extra Sauce",
    "Spicy Cayenne Slaw (+$1.00)"
  ];

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmt = subtotal * (discountPct / 100);
  const tax = (subtotal - discountAmt) * 0.08;
  const totalBill = subtotal - discountAmt + tax;

  // Keyboard Shortcuts Handler
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F1") {
        e.preventDefault();
        handleNewOrder();
      } else if (e.key === "F2") {
        e.preventDefault();
        searchInputRef.current?.focus();
        onTriggerToast("Focused product search catalog!");
      } else if (e.key === "F3") {
        e.preventDefault();
        handleCompleteOrder();
      } else if (e.key === "F4") {
        e.preventDefault();
        onTriggerToast("Spooling print request for active customer draft...");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cart, customerName, totalBill, paymentMethod, notes]);

  const handleNewOrder = () => {
    setCart([]);
    setCustomerName("Guest");
    setNotes("");
    setDiscountPct(0);
    onTriggerToast("Cart cleared. Ready for new counter ticket!");
  };

  const openCustomizer = (product: Product) => {
    setCustomizingProduct(product);
    setSelectedExtras([]);
    setCustomizationNote("");
  };

  const handleAddCustomized = () => {
    if (!customizingProduct) return;
    
    // Calculate final price with extras
    let extraCost = 0;
    if (selectedExtras.includes("Extra Cheese (+$1.50)")) extraCost += 1.50;
    if (selectedExtras.includes("Gluten-Free Bun (+$2.00)")) extraCost += 2.00;
    if (selectedExtras.includes("Spicy Cayenne Slaw (+$1.00)")) extraCost += 1.00;

    const finalPrice = customizingProduct.price + extraCost;

    const existingIndex = cart.findIndex(
      item => item.id === customizingProduct.id && 
      JSON.stringify(item.customizations) === JSON.stringify(selectedExtras)
    );

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      setCart([
        ...cart,
        {
          id: customizingProduct.id,
          name: customizingProduct.name,
          price: finalPrice,
          quantity: 1,
          customizations: [...selectedExtras, ...(customizationNote ? [`Note: ${customizationNote}`] : [])]
        }
      ]);
    }

    onTriggerToast(`Added ${customizingProduct.name} with customizations!`);
    setCustomizingProduct(null);
  };

  const handleUpdateQuantity = (index: number, change: number) => {
    const updated = [...cart];
    updated[index].quantity += change;
    if (updated[index].quantity <= 0) {
      updated.splice(index, 1);
    }
    setCart(updated);
  };

  const handleCompleteOrder = () => {
    if (cart.length === 0) {
      onTriggerToast("Add items to cart before completing sale!");
      return;
    }

    onPlaceOrder({
      table: "Counter Walk-in",
      customerName: customerName || "Walk-In Guest",
      type: "Walk-in",
      status: "Accepted",
      items: cart,
      total: totalBill,
      paymentStatus: "Paid",
      paymentMethod: paymentMethod,
      priority: false,
      notes: notes || undefined
    });

    onTriggerToast(`Sale completed successfully! Transmitted to KDS display.`);
    setCart([]);
    setCustomerName("Guest");
    setNotes("");
    setDiscountPct(0);
  };

  const handleSaveDraft = () => {
    if (cart.length === 0) return;
    onTriggerToast("Counter ticket saved to local terminal draft registry.");
  };

  const handleSendToKitchen = () => {
    if (cart.length === 0) return;
    // Send to kitchen as pending payment or unpaid dine-in
    onPlaceOrder({
      table: "Counter Walk-in",
      customerName: customerName || "Guest",
      type: "Walk-in",
      status: "Pending",
      items: cart,
      total: totalBill,
      paymentStatus: "Pending",
      paymentMethod: paymentMethod,
      notes: notes
    });
    onTriggerToast("Unpaid order ticket dispatched directly to kitchen prep!");
    setCart([]);
  };

  // Filter products
  const filteredProducts = activeProducts.filter(prod => {
    const matchesCat = selectedCategory === "All" || prod.category === selectedCategory;
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          prod.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="walk-in-pos-view">
      
      {/* LEFT PANEL: Menu Browser (7 Cols) */}
      <div className="lg:col-span-7 space-y-4">
        
        {/* Search & Header */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-serif font-black text-sm text-slate-800">Product Menu Browser</h3>
            <span className="text-[10px] font-mono text-slate-400 uppercase">Shortcut: F2 to Search</span>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder="Search product code, keywords or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs outline-none focus:ring-1 focus:ring-[#D4AF37]"
            />
          </div>
        </div>

        {/* Categories Tab selector (horizontal scroll) */}
        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex space-x-2 overflow-x-auto pb-1 no-scrollbar scrollbar-thin">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-serif shrink-0 transition-all ${
                  selectedCategory === cat 
                    ? "bg-[#D4AF37] text-slate-950 font-black shadow-sm" 
                    : "bg-slate-50 border border-slate-100 text-slate-500 hover:text-slate-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filteredProducts.map(prod => (
            <div 
              key={prod.id}
              onClick={() => openCustomizer(prod)}
              className="bg-white hover:border-[#D4AF37] border border-slate-100 p-3.5 rounded-2xl shadow-sm cursor-pointer transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-2">
                <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-50">
                  <img src={prod.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  {prod.badge && (
                    <span className="absolute top-1.5 left-1.5 bg-[#D4AF37] text-slate-950 text-[8px] font-mono font-black px-1.5 py-0.5 rounded">
                      {prod.badge}
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-serif font-bold text-xs text-slate-800 truncate">{prod.name}</h4>
                  <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{prod.description}</p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                <span className="text-xs font-bold font-mono text-[#2B6CB0]">${prod.price.toFixed(2)}</span>
                <span className="p-1 bg-[#D4AF37]/10 text-[#D4AF37] rounded-lg group-hover:bg-[#D4AF37] group-hover:text-slate-950 transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 font-mono">
              No matching products found in database.
            </div>
          )}
        </div>

      </div>

      {/* RIGHT PANEL: Order Summary (4 Cols) */}
      <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
        
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-serif font-black text-sm text-slate-800">Active Sale ticket</h3>
            <p className="text-[9px] text-slate-400 font-mono uppercase mt-0.5">Terminal POS Draft #W-804</p>
          </div>
          <button 
            onClick={handleNewOrder}
            className="text-[10px] font-mono border border-slate-200 text-slate-400 hover:text-slate-800 hover:border-slate-400 px-2.5 py-1 rounded-xl transition-all"
          >
            Clear (F1)
          </button>
        </div>

        {/* Customer select and discount fields */}
        <div className="grid grid-cols-2 gap-3 text-xs font-sans">
          <div className="space-y-1">
            <label className="block text-slate-400 font-mono text-[9px] uppercase">Registered Customer</label>
            <select
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 outline-none text-xs"
            >
              {demoCustomers.map(c => (
                <option key={c.name} value={c.name}>{c.name} {c.phone ? `(${c.phone})` : ''}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-slate-400 font-mono text-[9px] uppercase">Coupon Discount %</label>
            <select
              value={discountPct}
              onChange={(e) => setDiscountPct(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 outline-none text-xs"
            >
              <option value="0">No Discount</option>
              <option value="10">Loyalty Promo (10%)</option>
              <option value="15">Staff Override (15%)</option>
              <option value="20">Manager Override (20%)</option>
              <option value="100">Complementary (100%)</option>
            </select>
          </div>
        </div>

        {/* Cart Item Row List */}
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {cart.map((item, idx) => (
            <div key={`${item.id}-${idx}`} className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-serif font-black text-slate-800">{item.name}</h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">${item.price.toFixed(2)} x {item.quantity}</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="flex border border-slate-250 bg-white rounded-lg">
                    <button 
                      onClick={() => handleUpdateQuantity(idx, -1)}
                      className="px-2 py-0.5 text-slate-500 hover:bg-slate-100 font-bold"
                    >
                      -
                    </button>
                    <span className="px-2.5 py-0.5 font-mono font-bold border-x border-slate-200 text-slate-700">
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => handleUpdateQuantity(idx, 1)}
                      className="px-2 py-0.5 text-slate-500 hover:bg-slate-100 font-bold"
                    >
                      +
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => {
                      const updated = [...cart];
                      updated.splice(idx, 1);
                      setCart(updated);
                    }}
                    className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Extras list badge display */}
              {item.customizations.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1.5 border-t border-slate-150">
                  {item.customizations.map((ext, eIdx) => (
                    <span key={eIdx} className="bg-amber-100 text-[#D4AF37] text-[8px] font-mono px-1.5 py-0.2 rounded">
                      {ext}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}

          {cart.length === 0 && (
            <div className="py-12 text-center text-slate-400 font-mono text-[11px] border border-dashed border-slate-200 rounded-xl bg-slate-50">
              No items in cart. Tap menu items to add.
            </div>
          )}
        </div>

        {/* Customer Ticket Notes */}
        <div className="space-y-1">
          <label className="block text-slate-400 font-mono text-[9px] uppercase">Special Kitchen Dispatch Notes</label>
          <input 
            type="text"
            placeholder="e.g. Allergies, extreme spice, serve raw onions on side..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl outline-none"
          />
        </div>

        {/* Totals Section */}
        <div className="space-y-1.5 text-xs text-slate-500 font-mono pt-3 border-t border-slate-100">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span className="text-slate-800 font-bold">${subtotal.toFixed(2)}</span>
          </div>
          {discountPct > 0 && (
            <div className="flex justify-between text-amber-600 font-bold">
              <span>Promo Discount ({discountPct}%):</span>
              <span>-${discountAmt.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Sales Tax (8.0%):</span>
            <span className="text-slate-800">${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-sm text-slate-800 pt-2 border-t border-slate-200">
            <span>Amount Due:</span>
            <span className="text-[#2B6CB0] text-base font-black">${totalBill.toFixed(2)}</span>
          </div>
        </div>

        {/* Settled Payment method Selector */}
        <div className="space-y-2 pt-2 border-t border-slate-150">
          <p className="text-[10px] font-mono text-slate-400 uppercase">Settlement Method</p>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: "Cash", icon: DollarSign },
              { id: "Card", icon: CreditCard },
              { id: "Mobile Money", icon: Smartphone },
              { id: "Wallet", icon: Wallet }
            ].map(m => {
              const IconComp = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id as any)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === m.id 
                      ? "bg-[#D4AF37]/10 border-[#D4AF37] text-amber-800 font-bold shadow-sm" 
                      : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <IconComp className="w-4 h-4" />
                  <span className="text-[8px] font-mono">{m.id}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pos checkout action buttons */}
        <div className="grid grid-cols-3 gap-2 text-[10px] font-mono uppercase font-black pt-3">
          <button
            onClick={handleSaveDraft}
            className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all"
          >
            Save Draft
          </button>
          
          <button
            onClick={handleSendToKitchen}
            className="py-3 bg-[#2B6CB0] hover:bg-blue-700 text-white rounded-xl transition-all"
          >
            Kitchen Prep
          </button>

          <button
            onClick={handleCompleteOrder}
            className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all"
          >
            Pay Now (F3)
          </button>
        </div>

        {/* Keyboard shortcut reference legend */}
        <div className="bg-slate-950 p-2.5 rounded-xl text-[9px] font-mono text-slate-400 flex items-center gap-2">
          <Keyboard className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
          <p>
            <strong className="text-white">F1</strong> New • <strong className="text-white">F2</strong> Find • <strong className="text-white">F3</strong> Pay • <strong className="text-white">F4</strong> Bill Print
          </p>
        </div>

      </div>

      {/* CUSTOMIZATION OVERLAY MODAL */}
      {customizingProduct && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-sm w-full p-6 space-y-4 shadow-2xl animate-scaleUp">
            
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-serif font-black text-base text-slate-800">{customizingProduct.name}</h3>
                <p className="text-[10px] text-slate-400 font-mono">Custom base rate: ${customizingProduct.price.toFixed(2)}</p>
              </div>
              <button 
                onClick={() => setCustomizingProduct(null)}
                className="p-1 rounded-full border border-slate-200 text-slate-400 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Selection checks */}
            <div className="space-y-2">
              <span className="block text-[9px] font-mono text-slate-400 uppercase tracking-widest">Select Extras / Modifiers</span>
              
              <div className="space-y-1.5">
                {customizationsOptions.map(opt => {
                  const selected = selectedExtras.includes(opt);
                  return (
                    <label 
                      key={opt}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        selected 
                          ? "bg-amber-50 border-[#D4AF37] text-amber-800 font-bold" 
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <span>{opt}</span>
                      <input 
                        type="checkbox"
                        checked={selected}
                        onChange={() => {
                          if (selected) {
                            setSelectedExtras(selectedExtras.filter(e => e !== opt));
                          } else {
                            setSelectedExtras([...selectedExtras, opt]);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Custom Notes input */}
            <div className="space-y-1">
              <span className="block text-[9px] font-mono text-slate-400 uppercase tracking-widest">Item instructions note</span>
              <input 
                type="text"
                placeholder="e.g. Well done patty, extra napkins..."
                value={customizationNote}
                onChange={(e) => setCustomizationNote(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 text-xs rounded-xl outline-none"
              />
            </div>

            <button
              onClick={handleAddCustomized}
              className="w-full py-3 bg-[#D4AF37] hover:bg-amber-500 text-slate-950 font-mono font-black rounded-xl text-xs uppercase"
            >
              Add with custom specifications
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
