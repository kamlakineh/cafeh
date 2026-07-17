import React from "react";
import { 
  Package, Star, MessageSquare, Megaphone, AlertTriangle, 
  Trash2, TrendingUp, Calendar, Send, Reply, CheckCircle, ShieldAlert
} from "lucide-react";
import { Order, InventoryItem } from "../../types";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

interface OperationsTabsProps {
  orders: Order[];
  inventory: InventoryItem[];
  activeTab: "Inventory Analytics" | "Marketing Performance" | "Customer Reviews";
}

export default function OperationsTabs({
  orders,
  inventory,
  activeTab
}: OperationsTabsProps) {
  // Local state
  const [reviewsList, setReviewsList] = React.useState([
    { id: 1, author: "Genevieve Dubois", rating: 5, branch: "Manhattan Salon #1", text: "The Golden Feast Burger was absolute perfection. Beautiful gold flakes and stellar premium beef. The service was pristine.", date: "2 hours ago", reply: "" as string },
    { id: 2, author: "Marcus Thompson", rating: 4, branch: "Brooklyn Reserve #2", text: "Very cozy vibe. The Truffle Wagyu Burger has a gorgeous flavor, although the fries were slightly cold on delivery.", date: "Yesterday", reply: "" as string },
    { id: 3, author: "Gabriella Rosas", rating: 3, branch: "Miami Beach Lounge #3", text: "Lovely location, but dispatch was delayed. Waited 25 minutes for our avocado plant burger. Food quality was great though.", date: "3 days ago", reply: "Hello Gabriella, we deeply apologize for this delay! We are scaling up our peak hours staff." as string }
  ]);
  const [draftReplyId, setDraftReplyId] = React.useState<number | null>(null);
  const [draftReplyText, setDraftReplyText] = React.useState("");
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handlePostReply = (id: number) => {
    if (!draftReplyText.trim()) return;
    setReviewsList((prev) => prev.map(r => r.id === id ? { ...r, reply: draftReplyText } : r));
    setDraftReplyId(null);
    setDraftReplyText("");
    showToast("Manager response published securely!");
  };

  // Inventory stats
  const turnoverByCategory = [
    { name: "Beef Raw", ratio: 9.4 },
    { name: "Cheese", ratio: 8.2 },
    { name: "Potatoes", ratio: 11.5 },
    { name: "Drinks", ratio: 6.4 },
    { name: "Vegetables", ratio: 12.1 }
  ];

  const wasteTrend = [
    { week: "Wk 1", waste: 120 },
    { week: "Wk 2", waste: 150 },
    { week: "Wk 3", waste: 95 },
    { week: "Wk 4", waste: 110 }
  ];

  // Marketing campaigns
  const campaignsList = [
    { name: "Golden Summer Feast Promo", type: "Social Influencer", duration: "30 days", budget: 1500, revenue: 4500, roi: "+200%", cac: 12.50, roas: 3.0 },
    { name: "Aura Loyalty Email Drive", type: "Email Newsletter", duration: "7 days", budget: 200, revenue: 820, roi: "+310%", cac: 2.10, roas: 4.1 },
    { name: "Brooklyn Opening Blast", type: "SMS Marketing", duration: "14 days", budget: 800, revenue: 3200, roi: "+300%", cac: 9.20, roas: 4.0 },
    { name: "Miami Weekend Flash SMS", type: "In-App Push", duration: "3 days", budget: 150, revenue: 620, roi: "+313%", cac: 1.50, roas: 4.1 }
  ];

  return (
    <div className="space-y-6 animate-fadeIn" id="owner-operations">

      {/* Local Toast alerts */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 bg-slate-900 text-white text-xs font-mono py-3 px-5 rounded-xl shadow-2xl z-50 animate-fadeIn flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* -------------------- 1. INVENTORY ANALYTICS -------------------- */}
      {activeTab === "Inventory Analytics" && (
        <div className="space-y-6">
          
          {/* Key Inventory Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-mono uppercase block">Inventory Turnover</span>
                <h4 className="text-xl font-bold font-mono text-slate-800 mt-1">8.4x Year</h4>
                <p className="text-[10px] text-green-600 font-sans mt-0.5">+1.2x industry average</p>
              </div>
              <div className="p-2 bg-blue-50 text-[#2B6CB0] rounded-lg">
                <Package className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-mono uppercase block">Waste Cost This Cycle</span>
                <h4 className="text-xl font-bold font-mono text-slate-800 mt-1">$420.50</h4>
                <p className="text-[10px] text-green-600 font-sans mt-0.5">-8.4% cost savings achieved</p>
              </div>
              <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                <Trash2 className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-mono uppercase block">Expired/Wasted Stock</span>
                <h4 className="text-xl font-bold font-mono text-slate-800 mt-1">$110.00</h4>
                <p className="text-[10px] text-rose-500 font-mono">2.8% of purchase index</p>
              </div>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-mono uppercase block">Supplier Score</span>
                <h4 className="text-xl font-bold font-mono text-slate-800 mt-1">92 / 100</h4>
                <p className="text-[10px] text-slate-400 font-sans mt-0.5">Reliable lead times</p>
              </div>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Turnover chart (7 Cols) */}
            <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-4">
              <h3 className="font-serif font-bold text-sm text-slate-800">Inventory Turnover Ratio by Category</h3>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={turnoverByCategory} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2F7" />
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="#A0AEC0" />
                    <YAxis tick={{ fontSize: 9 }} stroke="#A0AEC0" />
                    <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
                    <Bar dataKey="ratio" fill="#2B6CB0" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Waste trend line (5 Cols) */}
            <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-4">
              <h3 className="font-serif font-bold text-sm text-slate-800">Weekly Food Prep Waste ($)</h3>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={wasteTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2F7" />
                    <XAxis dataKey="week" tick={{ fontSize: 9 }} stroke="#A0AEC0" />
                    <YAxis tick={{ fontSize: 9 }} stroke="#A0AEC0" />
                    <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="waste" stroke="#E53E3E" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Supplier roster and stock level Warnings */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-4">
            <h3 className="font-serif text-sm font-bold text-slate-800">Critical Stock Auditing</h3>
            <div className="divide-y divide-slate-100">
              {inventory.filter(i => i.status !== "OK").map((inv, idx) => (
                <div key={idx} className="flex justify-between items-center py-3 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <span className="font-sans font-medium text-slate-700">{inv.item}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-slate-400 font-mono">Current: {inv.current} / Minimum requirement: {inv.min}</span>
                    <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-600 font-bold font-mono text-[9px] uppercase">
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* -------------------- 2. MARKETING PERFORMANCE -------------------- */}
      {activeTab === "Marketing Performance" && (
        <div className="space-y-6">
          
          {/* Key Marketing Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-2">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Avg. Customer Acquisition Cost (CAC)</span>
              <h4 className="text-2xl font-bold font-mono text-slate-800">$12.50</h4>
              <p className="text-xs text-green-600 font-mono">-18% due to high organic referral loops</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-2">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Return on Ad Spend (ROAS)</span>
              <h4 className="text-2xl font-bold font-mono text-slate-800">3.8x Yield</h4>
              <p className="text-xs text-green-600 font-mono">Strong conversion across social pipelines</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-2">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Average Campaign Conversion Rate</span>
              <h4 className="text-2xl font-bold font-mono text-slate-800">4.2%</h4>
              <p className="text-xs text-slate-400 font-sans">E-Mail click-through is leading with 8%</p>
            </div>

          </div>

          {/* Campaigns Ledger Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] p-6 space-y-6">
            <h3 className="font-serif text-base font-bold text-slate-800">Marketing Campaign ROI Matrix</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-none">
                <thead className="bg-slate-50 font-mono text-slate-400 border-b border-slate-100">
                  <tr>
                    <th className="p-3 uppercase">Campaign Name</th>
                    <th className="p-3 uppercase">Channel / Type</th>
                    <th className="p-3 uppercase">Duration</th>
                    <th className="p-3 uppercase text-right">Budget</th>
                    <th className="p-3 uppercase text-right">Revenue Generated</th>
                    <th className="p-3 uppercase text-center">ROI Percentage</th>
                    <th className="p-3 uppercase text-right">CAC Value</th>
                    <th className="p-3 uppercase text-right">ROAS Index</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {campaignsList.map((cp, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 font-serif font-bold text-slate-800">{cp.name}</td>
                      <td className="p-3 font-mono text-[10px] uppercase text-slate-400">{cp.type}</td>
                      <td className="p-3">{cp.duration}</td>
                      <td className="p-3 text-right font-mono">${cp.budget.toLocaleString()}</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-800">${cp.revenue.toLocaleString()}</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded bg-green-50 text-green-700 font-bold font-mono text-[10px]">
                          {cp.roi}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono">${cp.cac.toFixed(2)}</td>
                      <td className="p-3 text-right font-mono text-indigo-600 font-bold">{cp.roas}x</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* -------------------- 3. CUSTOMER REVIEWS -------------------- */}
      {activeTab === "Customer Reviews" && (
        <div className="space-y-6">
          
          {/* Sentiment Audit Dashboard */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-4">
            <h3 className="font-serif text-base font-bold text-slate-800">Review Sentiment Audit</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-green-600 font-bold">Positive Sentiment</span>
                  <span className="font-bold">85%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-green-500 h-full rounded-full" style={{ width: "85%" }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-amber-500 font-bold">Neutral Feedback</span>
                  <span className="font-bold">10%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: "10%" }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-rose-500 font-bold">Negative / Action Items</span>
                  <span className="font-bold">5%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: "5%" }} />
                </div>
              </div>

            </div>
          </div>

          {/* Feedback list */}
          <div className="space-y-4">
            {reviewsList.map((rev) => (
              <div key={rev.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-serif text-sm font-bold text-slate-800">{rev.author}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono uppercase font-bold">
                        {rev.branch}
                      </span>
                      <span className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                      <span className="text-[10px] text-slate-400 font-mono">{rev.date}</span>
                    </div>
                  </div>
                  
                  {/* Rating Stars */}
                  <div className="flex text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-3.5 h-3.5 ${i < rev.rating ? "fill-current" : "text-slate-200"}`} 
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-sans">{rev.text}</p>

                {/* Published Reply */}
                {rev.reply && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs space-y-1.5">
                    <div className="flex items-center space-x-1.5 text-[#2B6CB0] font-mono uppercase font-bold text-[9px]">
                      <Reply className="w-3.5 h-3.5" />
                      <span>Executive Response Published</span>
                    </div>
                    <p className="text-slate-600 font-sans italic">"{rev.reply}"</p>
                  </div>
                )}

                {/* Action: Compose Reply */}
                {!rev.reply && draftReplyId !== rev.id && (
                  <div className="flex justify-end">
                    <button 
                      onClick={() => {
                        setDraftReplyId(rev.id);
                        setDraftReplyText("");
                      }}
                      className="text-[10px] font-mono font-bold text-[#2B6CB0] hover:text-white bg-[#EBF8FF] hover:bg-[#2B6CB0] px-3 py-1.5 rounded-lg transition-all"
                    >
                      Compose Public Response
                    </button>
                  </div>
                )}

                {/* Compose Form */}
                {draftReplyId === rev.id && (
                  <div className="space-y-2 animate-scaleUp">
                    <textarea 
                      placeholder="Type official manager response here..."
                      rows={2}
                      value={draftReplyText}
                      onChange={(e) => setDraftReplyText(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:ring-1 focus:ring-[#2B6CB0] resize-none"
                    />
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => setDraftReplyId(null)}
                        className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-mono"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => handlePostReply(rev.id)}
                        className="px-3 py-1 bg-[#2B6CB0] text-white rounded-lg text-xs font-mono font-bold flex items-center space-x-1"
                      >
                        <Send className="w-3 h-3 mr-1" /> Publish Reply
                      </button>
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}
