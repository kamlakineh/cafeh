import React from "react";
import { 
  Plus, Edit2, Trash2, Search, SlidersHorizontal, Image, DollarSign, 
  Clock, Flame, Check, AlertTriangle, X, ShieldAlert 
} from "lucide-react";
import { Product } from "../../types";

interface MenuControlTabProps {
  products: Product[];
  onFetchProducts?: () => void;
  onTriggerToast: (msg: string) => void;
}

export default function MenuControlTab({
  products,
  onFetchProducts,
  onTriggerToast
}: MenuControlTabProps) {
  const [search, setSearch] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("All");
  
  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
  
  // Form fields
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [category, setCategory] = React.useState<Product['category']>("Beef");
  const [price, setPrice] = React.useState("");
  const [originalPrice, setOriginalPrice] = React.useState("");
  const [prepTime, setPrepTime] = React.useState("");
  const [calories, setCalories] = React.useState("");
  const [image, setImage] = React.useState("");
  const [badge, setBadge] = React.useState("");
  const [ingredientsText, setIngredientsText] = React.useState("");
  const [allergensText, setAllergensText] = React.useState("");
  const [spiceLevel, setSpiceLevel] = React.useState("0");
  const [isAvailable, setIsAvailable] = React.useState(true);

  // Add-ons & Premium Sauces States
  const [hasExtraCheese, setHasExtraCheese] = React.useState(false);
  const [extraCheesePrice, setExtraCheesePrice] = React.useState("1.50");
  const [hasExtraPatty, setHasExtraPatty] = React.useState(false);
  const [extraPattyPrice, setExtraPattyPrice] = React.useState("3.00");
  const [selectedPremiumSauces, setSelectedPremiumSauces] = React.useState<string[]>([]);
  const [premiumSaucesPrice, setPremiumSaucesPrice] = React.useState("0.99");

  const categories: Product['category'][] = [
    "Beef", "Chicken", "Cheese", "Vegetarian", "Fries", "Drinks", "Desserts"
  ];

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName("");
    setDescription("");
    setCategory("Beef");
    setPrice("");
    setOriginalPrice("");
    setPrepTime("10 min");
    setCalories("600 kcal");
    setImage("https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80");
    setBadge("");
    setIngredientsText("Premium Bun, Lettuce, Tomato");
    setAllergensText("Gluten");
    setSpiceLevel("0");
    setIsAvailable(true);
    setHasExtraCheese(false);
    setExtraCheesePrice("1.50");
    setHasExtraPatty(false);
    setExtraPattyPrice("3.00");
    setSelectedPremiumSauces([]);
    setPremiumSaucesPrice("0.99");
    setIsFormOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setDescription(prod.description);
    setCategory(prod.category);
    setPrice(prod.price.toString());
    setOriginalPrice(prod.originalPrice ? prod.originalPrice.toString() : "");
    setPrepTime(prod.prepTime);
    setCalories(prod.calories);
    setImage(prod.image);
    setBadge(prod.badge || "");
    setIngredientsText(prod.ingredients.join(", "));
    setAllergensText(prod.allergens.join(", "));
    setSpiceLevel(prod.spiceLevel ? prod.spiceLevel.toString() : "0");
    setIsAvailable(prod.isAvailable !== false);

    // Parse addOns
    const extraCheese = prod.addOns?.find(a => a.name === "Extra Cheese");
    setHasExtraCheese(!!extraCheese);
    setExtraCheesePrice(extraCheese ? extraCheese.price.toString() : "1.50");

    const extraPatty = prod.addOns?.find(a => a.name === "Extra Patty");
    setHasExtraPatty(!!extraPatty);
    setExtraPattyPrice(extraPatty ? extraPatty.price.toString() : "3.00");

    const sauces = ["Truffle Mayo", "Spicy Sriracha", "Smoky BBQ", "Garlic Aioli"];
    const foundSauces = prod.addOns?.filter(a => sauces.includes(a.name)).map(a => a.name) || [];
    setSelectedPremiumSauces(foundSauces);
    const firstSauce = prod.addOns?.find(a => sauces.includes(a.name));
    setPremiumSaucesPrice(firstSauce ? firstSauce.price.toString() : "0.99");

    setIsFormOpen(true);
  };

  const handleToggleAvailability = async (prod: Product) => {
    const nextVal = prod.isAvailable === false ? true : false;
    try {
      const response = await fetch(`/api/products/${prod.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: nextVal })
      });
      if (response.ok) {
        onTriggerToast(`'${prod.name}' is now ${nextVal ? "ON (Available)" : "OFF (Unavailable)"}!`);
        if (onFetchProducts) {
          onFetchProducts();
        }
      } else {
        onTriggerToast("Failed to update availability.");
      }
    } catch (err) {
      console.error(err);
      onTriggerToast("Network error updating availability.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !price || !image) {
      onTriggerToast("Please fill in name, description, price, and image URL!");
      return;
    }

    const priceVal = parseFloat(price);
    if (isNaN(priceVal) || priceVal <= 0) {
      onTriggerToast("Price must be a valid positive number.");
      return;
    }

    const finalAddOns = [];
    if (hasExtraCheese) {
      finalAddOns.push({ name: "Extra Cheese", price: parseFloat(extraCheesePrice) || 1.50 });
    }
    if (hasExtraPatty) {
      finalAddOns.push({ name: "Extra Patty", price: parseFloat(extraPattyPrice) || 3.00 });
    }
    selectedPremiumSauces.forEach(sauce => {
      finalAddOns.push({ name: sauce, price: parseFloat(premiumSaucesPrice) || 0.99 });
    });

    const payload: Partial<Product> = {
      name,
      description,
      category,
      price: priceVal,
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      prepTime,
      calories,
      image,
      badge: badge || undefined,
      ingredients: ingredientsText.split(",").map(i => i.trim()).filter(Boolean),
      allergens: allergensText.split(",").map(a => a.trim()).filter(Boolean),
      spiceLevel: parseInt(spiceLevel),
      isAvailable,
      addOns: finalAddOns
    };

    try {
      let response;
      if (editingProduct) {
        // Edit
        response = await fetch(`/api/products/${editingProduct.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        // Add new
        response = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      if (response.ok) {
        onTriggerToast(editingProduct ? `Successfully updated ${name}!` : `Successfully added ${name}!`);
        setIsFormOpen(false);
        if (onFetchProducts) {
          onFetchProducts();
        }
      } else {
        onTriggerToast("Failed to save product on the server.");
      }
    } catch (err) {
      console.error(err);
      onTriggerToast("Network error trying to save product.");
    }
  };

  const handleDelete = async (prod: Product) => {
    if (!confirm(`Are you sure you want to permanently delete '${prod.name}' from the menu?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${prod.id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        onTriggerToast(`Deleted '${prod.name}' from menu!`);
        if (onFetchProducts) {
          onFetchProducts();
        }
      } else {
        onTriggerToast("Failed to delete product.");
      }
    } catch (err) {
      console.error(err);
      onTriggerToast("Network error trying to delete product.");
    }
  };

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fadeIn" id="menu-control-panel">
      
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="font-serif font-black text-slate-850 text-lg">Menu Control Center</h2>
          <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest mt-0.5">
            Add, Edit, and Delete live gourmet items visible to customers & waitstaff
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center space-x-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-mono font-black text-xs tracking-wider uppercase rounded-xl shadow-lg shadow-blue-500/10 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Menu Item</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search active menu items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl outline-none text-xs focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
          <button
            onClick={() => setCategoryFilter("All")}
            className={`px-3 py-1.5 rounded-lg font-mono text-[10px] font-bold uppercase transition-all ${
              categoryFilter === "All"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg font-mono text-[10px] font-bold uppercase transition-all whitespace-nowrap ${
                categoryFilter === cat
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-slate-500 text-xs font-mono">No matching gourmet items found.</p>
          </div>
        ) : (
          filtered.map(prod => (
            <div 
              key={prod.id}
              className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow"
            >
              <div>
                {/* Product Image & Badges */}
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                  {prod.image ? (
                    <img 
                      src={prod.image} 
                      alt={prod.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Image className="w-8 h-8" />
                    </div>
                  )}
                  
                  {prod.badge && (
                    <span className="absolute top-3 left-3 bg-blue-600 text-white font-mono font-bold text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
                      {prod.badge}
                    </span>
                  )}
                  
                  <span className="absolute top-3 right-3 bg-slate-900/85 text-white font-mono text-[9px] font-bold tracking-wider px-2.5 py-0.5 rounded-lg backdrop-blur-xs">
                    {prod.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-serif font-black text-sm text-slate-800 leading-tight">{prod.name}</h3>
                    <div className="text-right">
                      <p className="font-mono font-black text-blue-600 text-sm">${prod.price.toFixed(2)}</p>
                      {prod.originalPrice && (
                        <p className="font-mono text-[10px] text-slate-400 line-through">${prod.originalPrice.toFixed(2)}</p>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed font-sans line-clamp-2 min-h-[32px]">
                    {prod.description}
                  </p>

                  <div className="flex items-center space-x-3 text-[10px] text-slate-400 font-mono pt-1">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-300" />
                      <span>{prod.prepTime}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Flame className="w-3.5 h-3.5 text-slate-300" />
                      <span>{prod.calories}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-4 border-t border-[#f1f5f9] bg-slate-50/50 flex items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleAvailability(prod)}
                    className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition-all ${
                      prod.isAvailable !== false
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                        : "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                    }`}
                    title="Toggle product availability"
                  >
                    <span className={`w-2 h-2 rounded-full ${prod.isAvailable !== false ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}></span>
                    <span>{prod.isAvailable !== false ? "ON" : "OFF"}</span>
                  </button>
                </div>
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => handleOpenEdit(prod)}
                    className="p-2 bg-white hover:bg-blue-50 text-blue-600 border border-slate-200 hover:border-blue-200 rounded-lg transition-colors flex items-center justify-center"
                    title="Edit Item"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(prod)}
                    className="p-2 bg-white hover:bg-red-50 text-red-600 border border-slate-200 hover:border-red-200 rounded-lg transition-colors flex items-center justify-center"
                    title="Delete Item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full max-h-[85vh] overflow-y-auto no-scrollbar animate-scaleUp">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-serif font-black text-sm text-slate-800">
                  {editingProduct ? `Edit Menu Item: ${editingProduct.name}` : "Create New Menu Item"}
                </h3>
                <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">Define ingredients, categories and price levels</p>
              </div>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-100 border border-slate-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form body */}
            <form onSubmit={handleSave} className="p-5 space-y-4 text-xs font-sans">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-slate-500 font-medium">Product Title / Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Blue Cheese Sliders"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-500 font-medium">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Product['category'])}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono focus:border-blue-500"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-500 font-medium">Description</label>
                <textarea
                  rows={2}
                  placeholder="Gourmet description detailing meat origin, bun toppings, and molten sauces..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-slate-500 font-medium">Active Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="15.99"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono focus:border-blue-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-500 font-medium">Original Price ($ - Optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="19.99"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-500 font-medium">Prep Time</label>
                  <input
                    type="text"
                    placeholder="12 min"
                    value={prepTime}
                    onChange={(e) => setPrepTime(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-500 font-medium">Calories</label>
                  <input
                    type="text"
                    placeholder="750 kcal"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-500 font-medium">Spice Level (0-3)</label>
                  <select
                    value={spiceLevel}
                    onChange={(e) => setSpiceLevel(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono focus:border-blue-500"
                  >
                    <option value="0">0 - None</option>
                    <option value="1">1 - Mild</option>
                    <option value="2">2 - Medium</option>
                    <option value="3">3 - Intense</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-500 font-medium">Image URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-500 font-medium">Product Badge (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Bestseller, Chef Special, 10% Off"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-slate-500 font-medium">Ingredients (Comma-separated)</label>
                  <input
                    type="text"
                    placeholder="Wagyu beef, Cheddar, Truffle aioli"
                    value={ingredientsText}
                    onChange={(e) => setIngredientsText(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-500 font-medium">Allergens (Comma-separated)</label>
                  <input
                    type="text"
                    placeholder="Gluten, Dairy, Soy"
                    value={allergensText}
                    onChange={(e) => setAllergensText(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Product Availability & Customizations */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif font-black text-slate-800 text-[11px] uppercase">Availability & Status</h4>
                    <p className="text-[9px] text-slate-400 font-mono">Control whether this item is orderable</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={isAvailable}
                      onChange={(e) => setIsAvailable(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                <hr className="border-slate-200/60" />

                <div className="space-y-3">
                  <div>
                    <h4 className="font-serif font-black text-slate-800 text-[11px] uppercase">Gourmet Add-Ons & Premium Options</h4>
                    <p className="text-[9px] text-slate-400 font-mono">Configure custom upgrades and pricing</p>
                  </div>

                  {/* Extra Cheese */}
                  <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-slate-100">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox"
                        id="form-add-cheese"
                        checked={hasExtraCheese}
                        onChange={(e) => setHasExtraCheese(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                      />
                      <label htmlFor="form-add-cheese" className="font-medium text-slate-700">Extra Cheese</label>
                    </div>
                    {hasExtraCheese && (
                      <div className="flex items-center space-x-1">
                        <span className="text-slate-400 font-mono text-[10px]">$</span>
                        <input 
                          type="number"
                          step="0.01"
                          value={extraCheesePrice}
                          onChange={(e) => setExtraCheesePrice(e.target.value)}
                          className="w-16 p-1 bg-slate-50 border border-slate-200 rounded text-center font-mono text-[10px]"
                        />
                      </div>
                    )}
                  </div>

                  {/* Extra Patty */}
                  <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-slate-100">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox"
                        id="form-add-patty"
                        checked={hasExtraPatty}
                        onChange={(e) => setHasExtraPatty(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                      />
                      <label htmlFor="form-add-patty" className="font-medium text-slate-700">Extra Patty</label>
                    </div>
                    {hasExtraPatty && (
                      <div className="flex items-center space-x-1">
                        <span className="text-slate-400 font-mono text-[10px]">$</span>
                        <input 
                          type="number"
                          step="0.01"
                          value={extraPattyPrice}
                          onChange={(e) => setExtraPattyPrice(e.target.value)}
                          className="w-16 p-1 bg-slate-50 border border-slate-200 rounded text-center font-mono text-[10px]"
                        />
                      </div>
                    )}
                  </div>

                  {/* Premium Sauces Selection */}
                  <div className="p-2.5 bg-white rounded-lg border border-slate-100 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-slate-700">Premium Sauces</span>
                      <div className="flex items-center space-x-1">
                        <span className="text-slate-400 font-mono text-[10px]">$</span>
                        <input 
                          type="number"
                          step="0.01"
                          value={premiumSaucesPrice}
                          onChange={(e) => setPremiumSaucesPrice(e.target.value)}
                          className="w-16 p-1 bg-slate-50 border border-slate-200 rounded text-center font-mono text-[10px]"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {["Truffle Mayo", "Spicy Sriracha", "Smoky BBQ", "Garlic Aioli"].map(sauce => {
                        const isSel = selectedPremiumSauces.includes(sauce);
                        return (
                          <button
                            key={sauce}
                            type="button"
                            onClick={() => {
                              if (isSel) {
                                setSelectedPremiumSauces(selectedPremiumSauces.filter(s => s !== sauce));
                              } else {
                                setSelectedPremiumSauces([...selectedPremiumSauces, sauce]);
                              }
                            }}
                            className={`px-2 py-1.5 rounded-lg border text-[10px] font-mono text-left transition-all ${
                              isSel 
                                ? "bg-blue-50 text-blue-700 border-blue-300 font-bold" 
                                : "bg-slate-50/50 text-slate-500 border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            {isSel ? "✓ " : "+ "} {sauce}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 font-mono font-bold rounded-xl uppercase tracking-wider text-[10px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-mono font-bold rounded-xl uppercase tracking-wider text-[10px]"
                >
                  {editingProduct ? "Save Changes" : "Create Item"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
