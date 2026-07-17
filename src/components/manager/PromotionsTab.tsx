import React from "react";
import { 
  Megaphone, Percent, Award, ShieldAlert, Sparkles, Plus, 
  Trash2, Play, Pause, Copy, Edit, RefreshCw, BarChart
} from "lucide-react";

interface CampaignItem {
  id: string;
  name: string;
  type: "Flash Sale" | "Happy Hour" | "Combo" | "Coupon";
  discount: string;
  status: "Active" | "Paused";
  redemptions: number;
  revenue: number;
  participation: string;
}

export default function PromotionsTab() {
  
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  
  // Local active list
  const [campaigns, setCampaigns] = React.useState<CampaignItem[]>([
    { id: "C1", name: "Summer Burger Flash Sale", type: "Flash Sale", discount: "20% Off", status: "Active", redemptions: 142, revenue: 2840, participation: "High" },
    { id: "C2", name: "Afternoon Sliders Happy Hour", type: "Happy Hour", discount: "Buy 1 Get 1", status: "Active", redemptions: 89, revenue: 1120, participation: "Medium" },
    { id: "C3", name: "Deluxe Feast Family Combo", type: "Combo", discount: "$15 Flat discount", status: "Paused", redemptions: 45, revenue: 1850, participation: "Low" },
    { id: "C4", name: "First Order Delivery Coupon", type: "Coupon", discount: "Free Delivery", status: "Active", redemptions: 210, revenue: 3150, participation: "High" }
  ]);

  // Form states
  const [newName, setNewName] = React.useState("");
  const [newType, setNewType] = React.useState<CampaignItem["type"]>("Flash Sale");
  const [newDiscount, setNewDiscount] = React.useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleStatus = (id: string) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === id) {
        const nextStatus = c.status === "Active" ? "Paused" : "Active";
        showToast(`Campaign '${c.name}' has been ${nextStatus.toLowerCase()}!`);
        return { ...c, status: nextStatus };
      }
      return c;
    }));
  };

  const deleteCampaign = (id: string) => {
    const c = campaigns.find(item => item.id === id);
    setCampaigns(prev => prev.filter(item => item.id !== id));
    showToast(`Campaign '${c?.name}' deleted.`);
  };

  const duplicateCampaign = (id: string) => {
    const c = campaigns.find(item => item.id === id);
    if (!c) return;
    const duplicated: CampaignItem = {
      ...c,
      id: "C_" + Date.now(),
      name: `${c.name} (Copy)`,
      redemptions: 0,
      revenue: 0,
      status: "Paused"
    };
    setCampaigns(prev => [...prev, duplicated]);
    showToast(`Duplicated '${c.name}' campaign!`);
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newDiscount) {
      showToast("Please fill in all campaign fields!");
      return;
    }

    const newItem: CampaignItem = {
      id: "C_" + Date.now(),
      name: newName,
      type: newType,
      discount: newDiscount,
      status: "Active",
      redemptions: 0,
      revenue: 0,
      participation: "High"
    };

    setCampaigns(prev => [...prev, newItem]);
    showToast(`Successfully launched '${newName}' campaign!`);
    
    // Reset form
    setNewName("");
    setNewDiscount("");
  };

  return (
    <div className="space-y-6" id="manager-promotions-center">
      
      {toastMessage && (
        <div className="fixed bottom-8 right-8 bg-slate-900 text-white text-xs font-mono py-3 px-5 rounded-xl shadow-2xl z-50 animate-fadeIn flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Campaign Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Campaign Creator Form (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="border-b border-slate-50 pb-3">
            <h3 className="font-serif font-black text-sm text-slate-800">Launch New Marketing Campaign</h3>
            <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">Automated discount dispatcher</p>
          </div>

          <form onSubmit={handleCreateCampaign} className="space-y-4 text-xs font-sans">
            
            <div className="space-y-1">
              <label className="block text-slate-500 font-medium">Campaign Target Title</label>
              <input 
                type="text"
                placeholder="e.g. Black Friday Gourmet Bundle"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-700"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-slate-500 font-medium">Promotion Type Category</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-700 font-mono"
              >
                <option value="Flash Sale">Flash Sale</option>
                <option value="Happy Hour">Happy Hour</option>
                <option value="Combo">Combo</option>
                <option value="Coupon">Coupon</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-slate-500 font-medium">Discount Value Index</label>
              <input 
                type="text"
                placeholder="e.g. 25% Off / Buy 2 Get 1 Free"
                value={newDiscount}
                onChange={(e) => setNewDiscount(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-700"
              />
            </div>

            <button
              type="submit"
              className="w-full p-3 bg-[#D4AF37] text-slate-900 font-serif font-black rounded-xl hover:bg-amber-500 transition-colors text-center text-xs tracking-wider"
            >
              🚀 Launch Campaign Active
            </button>

          </form>
        </div>

        {/* Active Campaigns Ledger List (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-50 pb-3">
            <div>
              <h3 className="font-serif font-black text-sm text-slate-800">Active Campaign Ledger</h3>
              <p className="text-[10px] text-slate-400">Conversion rates and revenue impact stats</p>
            </div>
            
            <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-[#D4AF37] rounded-lg text-[10px] font-mono font-bold uppercase">
              {campaigns.filter(c => c.status === "Active").length} Running
            </span>
          </div>

          <div className="space-y-4">
            {campaigns.map((c) => (
              <div key={c.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-serif font-bold text-slate-800 text-sm">{c.name}</span>
                    <span className="text-[9px] bg-white border border-slate-200 text-slate-500 px-1.5 py-0.2 rounded font-mono uppercase">{c.type}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-[10px] font-mono text-slate-400">
                    <span>Discount: <strong className="text-slate-700">{c.discount}</strong></span>
                    <span>Redemptions: <strong className="text-slate-700">{c.redemptions}</strong></span>
                    <span>Generated: <strong className="text-green-600">${c.revenue.toLocaleString()}</strong></span>
                    <span>Reach: <strong className="text-slate-700">{c.participation}</strong></span>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  
                  {/* Play Pause */}
                  <button
                    onClick={() => toggleStatus(c.id)}
                    className={`p-1.5 rounded-lg border transition-all ${
                      c.status === "Active"
                        ? "bg-amber-100 border-amber-200 text-amber-700 hover:bg-amber-200"
                        : "bg-slate-200 border-slate-300 text-slate-600 hover:bg-slate-300"
                    }`}
                    title={c.status === "Active" ? "Pause Campaign" : "Activate Campaign"}
                  >
                    {c.status === "Active" ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>

                  {/* Duplicate */}
                  <button
                    onClick={() => duplicateCampaign(c.id)}
                    className="p-1.5 bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-500 rounded-lg transition-all"
                    title="Duplicate Campaign"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => deleteCampaign(c.id)}
                    className="p-1.5 bg-rose-50 border border-rose-150 text-rose-600 hover:bg-rose-100 rounded-lg transition-all"
                    title="Delete Campaign"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                </div>

              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}
