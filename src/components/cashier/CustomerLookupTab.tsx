import React from "react";
import { 
  Search, Users, Star, DollarSign, Gift, ArrowRight, Phone, Mail, 
  MapPin, Check, Plus, RefreshCw, ClipboardList
} from "lucide-react";

interface CustomerProfile {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  email: string;
  loyaltyPoints: number;
  walletBalance: number;
  coupons: string[];
  history: { id: string; date: string; items: string; total: number }[];
}

interface CustomerLookupTabProps {
  onTriggerToast: (msg: string) => void;
  onNavigateToTab: (tab: string) => void;
}

export default function CustomerLookupTab({
  onTriggerToast,
  onNavigateToTab
}: CustomerLookupTabProps) {
  
  const [profiles, setProfiles] = React.useState<CustomerProfile[]>([
    {
      id: "CUST-401",
      name: "Sarah Johnson",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      phone: "555-0199",
      email: "sarah.j@gmail.com",
      loyaltyPoints: 420,
      walletBalance: 120.00,
      coupons: ["LOYAL10 (10%)", "WAGYU5 (5%)"],
      history: [
        { id: "#ORD-930", date: "Today", items: "1x Truffle Wagyu, 2x Large Fries", total: 58.20 },
        { id: "#ORD-850", date: "3 days ago", items: "1x Spicy Crispy Chicken Burger", total: 15.99 },
        { id: "#ORD-720", date: "1 week ago", items: "1x Avocado Plant-Based, 1x Coke", total: 20.49 },
        { id: "#ORD-601", date: "2 weeks ago", items: "2x Double Cheese Golden Burgers", total: 37.98 },
        { id: "#ORD-544", date: "3 weeks ago", items: "1x Truffle Wagyu, 1x Fries", total: 34.99 }
      ]
    },
    {
      id: "CUST-402",
      name: "Liam Carter",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      phone: "555-0211",
      email: "liam@carter.io",
      loyaltyPoints: 150,
      walletBalance: 45.00,
      coupons: ["FRESHFRIESS"],
      history: [
        { id: "#ORD-928", date: "Today", items: "1x Truffle Wagyu Burger", total: 24.99 },
        { id: "#ORD-811", date: "5 days ago", items: "1x Double Cheese, 1x Garlic Cream", total: 20.49 }
      ]
    },
    {
      id: "CUST-403",
      name: "Michael Vance",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      phone: "555-0871",
      email: "vance@outlook.com",
      loyaltyPoints: 680,
      walletBalance: 250.00,
      coupons: ["VIP30 (30%)", "CHEFGOLD"],
      history: [
        { id: "#ORD-925", date: "Today", items: "2x Spicy Crispy Chicken, 4x Beer Pitchers", total: 112.90 },
        { id: "#ORD-704", date: "1 week ago", items: "1x Truffle Wagyu Burger, 1x Cheese Fries", total: 32.99 }
      ]
    }
  ]);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedProfile, setSelectedProfile] = React.useState<CustomerProfile>(profiles[0]);

  const handleSearch = () => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    const found = profiles.find(p => 
      p.name.toLowerCase().includes(query) || 
      p.phone.includes(query) || 
      p.email.toLowerCase().includes(query) ||
      p.history.some(h => h.id.toLowerCase().includes(query))
    );

    if (found) {
      setSelectedProfile(found);
      onTriggerToast(`Selected customer profile for '${found.name}'.`);
    } else {
      onTriggerToast("No customer match discovered in branch records.");
    }
  };

  const handleApplyCoupon = (coupon: string) => {
    onTriggerToast(`Applied Coupon '${coupon}' to customer cart workflow!`);
    onNavigateToTab("Walk-in Orders");
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="customer-registry-lookup">
      
      {/* Search Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="font-serif font-black text-sm text-slate-800">Branch Loyalty Customer Registry</h3>
          <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">Search via Name, Phone, Email or Order ID</p>
        </div>

        <div className="flex gap-2 max-w-sm w-full">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input 
              type="text"
              placeholder="e.g. Sarah, 555-0199..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />
          </div>
          <button 
            onClick={handleSearch}
            className="px-4 py-2 bg-slate-900 text-[#D4AF37] hover:bg-slate-800 font-mono font-bold text-xs rounded-xl uppercase transition-all"
          >
            Search
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Customer profile card details (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6 text-center relative">
          
          {selectedProfile && (
            <div className="space-y-6">
              
              <div className="space-y-3 relative">
                {/* Profile image with gold accent ring */}
                <div className="relative mx-auto w-24 h-24 rounded-full border-4 border-[#D4AF37] overflow-hidden shadow-md">
                  <img src={selectedProfile.avatar} className="w-full h-full object-cover" />
                </div>

                <div>
                  <h4 className="font-serif font-black text-slate-800 text-lg leading-tight">{selectedProfile.name}</h4>
                  <span className="text-[9px] font-mono font-bold text-[#D4AF37] uppercase bg-[#D4AF37]/10 px-2.5 py-0.5 rounded-full border border-[#D4AF37]/20 mt-1 inline-block">
                    GOLD MEMBER ARCHIVE
                  </span>
                </div>
              </div>

              {/* Contact parameters */}
              <div className="grid grid-cols-2 gap-2 text-left text-xs font-mono text-slate-500 pt-4 border-t border-slate-50">
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-400 block uppercase">Phone Number</span>
                  <span className="text-slate-800 font-bold flex items-center">
                    <Phone className="w-3.5 h-3.5 mr-1 text-[#D4AF37]" />
                    {selectedProfile.phone}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] text-slate-400 block uppercase">Email Address</span>
                  <span className="text-slate-800 font-bold flex items-center truncate">
                    <Mail className="w-3.5 h-3.5 mr-1 text-[#D4AF37]" />
                    {selectedProfile.email.split("@")[0]}
                  </span>
                </div>
              </div>

              {/* Loyalty & wallet counters */}
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                  <Star className="w-5 h-5 mx-auto text-[#D4AF37] fill-[#D4AF37] mb-1" />
                  <span className="text-[9px] text-slate-400 block uppercase">Loyalty Balance</span>
                  <span className="text-slate-800 text-sm font-black">{selectedProfile.loyaltyPoints} PTS</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                  <DollarSign className="w-5 h-5 mx-auto text-green-500 mb-1" />
                  <span className="text-[9px] text-slate-400 block uppercase">Wallet Balance</span>
                  <span className="text-slate-800 text-sm font-black">${selectedProfile.walletBalance.toFixed(2)}</span>
                </div>
              </div>

              {/* Available Coupons list */}
              <div className="space-y-2 text-left pt-4 border-t border-slate-50">
                <span className="block text-[9px] font-mono text-slate-400 uppercase tracking-widest">Coupons Available</span>
                <div className="flex flex-wrap gap-2">
                  {selectedProfile.coupons.map(coupon => (
                    <button
                      key={coupon}
                      onClick={() => handleApplyCoupon(coupon)}
                      className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-100 text-amber-800 rounded-xl text-[10px] font-mono font-bold flex items-center space-x-1"
                    >
                      <Gift className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{coupon}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Profile master actions */}
              <button
                onClick={() => {
                  onTriggerToast(`Loaded customized profile context for ${selectedProfile.name}.`);
                  onNavigateToTab("Walk-in Orders");
                }}
                className="w-full py-3 bg-slate-900 text-[#D4AF37] hover:bg-slate-800 font-mono font-bold text-xs uppercase rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <span>Initiate Ticket for {selectedProfile.name.split(" ")[0]}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          )}

        </div>

        {/* Right Column: Order History logs (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h4 className="font-serif font-black text-slate-800 text-sm border-b border-slate-50 pb-3">Past order dispatch history</h4>

          <div className="space-y-4">
            {selectedProfile && selectedProfile.history.map(item => (
              <div key={item.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs font-mono">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-slate-800 font-bold">
                    <ClipboardList className="w-4 h-4 text-slate-400" />
                    <span>{item.id}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({item.date})</span>
                  </div>
                  <p className="font-sans text-slate-600 font-medium italic">"{item.items}"</p>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black text-slate-800">${item.total.toFixed(2)}</span>
                  <span className="text-[9px] text-green-600 block uppercase font-bold">Paid</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
