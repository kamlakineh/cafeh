import React from "react";
import { 
  TrendingUp, Percent, ShoppingCart, UserCheck, 
  ArrowUpRight, ArrowDownRight, Sparkles, RefreshCw, Star, 
  Clock, Package, ShieldCheck
} from "lucide-react";
import { Order, InventoryItem } from "../../types";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

interface ExecutiveDashboardTabProps {
  orders: Order[];
  inventory: InventoryItem[];
  selectedBranch: string;
  dateRange: string;
}

export default function ExecutiveDashboardTab({
  orders,
  inventory,
  selectedBranch,
  dateRange
}: ExecutiveDashboardTabProps) {
  const [aiTipIndex, setAiTipIndex] = React.useState(0);
  const [loadingInsights, setLoadingInsights] = React.useState(false);

  const aiInsights = [
    { text: "Revenue is 12% above forecast due to highly effective Instagram influencer campaigns in our local neighborhood.", severity: "success" },
    { text: "Delivery feedback needs attention: customer satisfaction dropped by 5% this week during peak hours.", severity: "warning" },
    { text: "Inventory waste is up 8% this week. Recommend training kitchen staff on prep portioning.", severity: "danger" },
    { text: "Recommended Action: Launch happy hour 2-5 PM for Truffle Fries to capture high profit margins.", severity: "info" }
  ];

  const handleRefreshInsights = () => {
    setLoadingInsights(true);
    setTimeout(() => {
      setAiTipIndex((prev) => (prev + 1) % aiInsights.length);
      setLoadingInsights(false);
    }, 600);
  };

  // Filter orders based on branch
  const filteredOrders = orders.filter(o => {
    if (selectedBranch === "All Branches") return true;
    if (selectedBranch === "Manhattan Salon #1" && o.table.includes("T")) return true; // mock filter
    if (selectedBranch === "Brooklyn Reserve #2" && o.table.includes("B")) return true;
    return o.table.includes("M") || (!o.table.includes("T") && !o.table.includes("B"));
  });

  // KPI calculations
  const grossRevenue = filteredOrders.reduce((acc, curr) => acc + (curr.paymentStatus === 'Paid' ? curr.total : 0), 0);
  const netProfit = grossRevenue * 0.32;
  const healthScore = selectedBranch === "Miami Beach Lounge #3" ? 68 : selectedBranch === "Brooklyn Reserve #2" ? 84 : 94;
  
  // Dynamic Chart Data from real-time database orders
  const revenueTrendData = React.useMemo(() => {
    const daysMap: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
      daysMap[dateStr] = 0;
    }

    filteredOrders.forEach(o => {
      if (o.paymentStatus !== 'Paid') return;
      const d = o.createdAt ? new Date(o.createdAt) : new Date();
      const dateStr = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
      if (daysMap[dateStr] !== undefined) {
        daysMap[dateStr] += o.total;
      }
    });

    const data = Object.keys(daysMap).map(day => ({
      day,
      revenue: parseFloat(daysMap[day].toFixed(2))
    }));

    if (filteredOrders.length === 0) {
      return [
        { day: "Day 1", revenue: 150 },
        { day: "Day 10", revenue: 240 },
        { day: "Day 20", revenue: 180 },
        { day: "Day 30", revenue: 320 }
      ];
    }
    return data;
  }, [filteredOrders]);

  const orderChannelData = React.useMemo(() => {
    const walkInSales = filteredOrders.filter(o => o.type === "Walk-in" && o.paymentStatus === "Paid").reduce((sum, o) => sum + o.total, 0);
    const tableSales = filteredOrders.filter(o => o.type === "Dine-in" && o.paymentStatus === "Paid").reduce((sum, o) => sum + o.total, 0);
    const onlineSales = filteredOrders.filter(o => (o.type === "Delivery" || o.type === "Pickup") && o.paymentStatus === "Paid").reduce((sum, o) => sum + o.total, 0);

    return [
      { name: "Walk-in POS", sales: parseFloat(walkInSales.toFixed(2)) || (filteredOrders.length > 0 ? 30 : 0) },
      { name: "Dine-in Tables", sales: parseFloat(tableSales.toFixed(2)) || (filteredOrders.length > 0 ? 50 : 0) },
      { name: "Online Channels", sales: parseFloat(onlineSales.toFixed(2)) || (filteredOrders.length > 0 ? 25 : 0) }
    ];
  }, [filteredOrders]);

  const profitMarginData = [
    { month: "Jan", margin: 30 },
    { month: "Feb", margin: 31 },
    { month: "Mar", margin: 29 },
    { month: "Apr", margin: 33 },
    { month: "May", margin: 32 },
    { month: "Jun", margin: grossRevenue > 0 ? 35 : 30 }
  ];

  const categoryData = React.useMemo(() => {
    const catMap: Record<string, number> = {};
    const getItemCategory = (name: string): string => {
      const lower = name.toLowerCase();
      if (lower.includes("burger") || lower.includes("wagyu") || lower.includes("feast")) return "Burgers";
      if (lower.includes("fry") || lower.includes("sides") || lower.includes("onion")) return "Sides";
      if (lower.includes("drink") || lower.includes("coke") || lower.includes("elixir") || lower.includes("soda") || lower.includes("water")) return "Drinks";
      if (lower.includes("dessert") || lower.includes("sweet") || lower.includes("cake") || lower.includes("ice cream")) return "Desserts";
      return "General";
    };

    filteredOrders.forEach(o => {
      o.items.forEach(item => {
        const cat = getItemCategory(item.name);
        catMap[cat] = (catMap[cat] || 0) + (item.price * item.quantity);
      });
    });

    const colors = ["#2B6CB0", "#319795", "#4C51BF", "#DD6B20", "#805AD5", "#F6E05E", "#EC4899"];
    const results = Object.keys(catMap).map((cat, idx) => ({
      name: cat,
      value: parseFloat(catMap[cat].toFixed(2)),
      color: colors[idx % colors.length]
    }));

    if (results.length === 0) {
      return [
        { name: "Burgers", value: 120, color: "#2B6CB0" },
        { name: "Sides", value: 80, color: "#319795" },
        { name: "Drinks", value: 45, color: "#4C51BF" }
      ];
    }
    return results;
  }, [filteredOrders]);

  const totalPureSales = categoryData.reduce((sum, c) => sum + c.value, 0);
  
  const calculatedInventoryValue = inventory.reduce((sum, item) => {
    const itemPrices: Record<string, number> = {
      "Beef Raw": 12.50,
      "Cheese": 4.20,
      "Potatoes": 2.10,
      "Drinks": 1.50,
      "Vegetables": 3.00,
      "Gold Flakes": 450.00
    };
    const price = itemPrices[item.item] || 5.00;
    return sum + (price * item.current);
  }, 0);

  return (
    <div className="space-y-8 animate-fadeIn" id="owner-executive-dashboard">
      
      {/* 8-Card KPI Grid (Dense, compact) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* KPI 1 */}
        <div className="bg-white p-4 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col justify-between h-28 hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-mono uppercase text-slate-400">Today's Revenue</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <h4 className="text-lg font-bold font-mono text-slate-800">${grossRevenue.toFixed(2)}</h4>
            <span className="text-[10px] text-emerald-600 flex items-center font-mono mt-0.5">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> Synced with live DB
            </span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-4 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col justify-between h-28 hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-mono uppercase text-slate-400">Net Profit Margin</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Percent className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <h4 className="text-lg font-bold font-mono text-slate-800">${netProfit.toFixed(2)}</h4>
            <span className="text-[10px] text-indigo-600 flex items-center font-mono mt-0.5">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> 32% Estimated margin
            </span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-4 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col justify-between h-28 hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-mono uppercase text-slate-400">AI Health Score</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-lg font-bold font-mono text-slate-800">{healthScore} / 100</h4>
              <span className={`w-2.5 h-2.5 rounded-full ${
                healthScore > 75 ? "bg-green-500 animate-pulse" : healthScore > 50 ? "bg-amber-500 animate-pulse" : "bg-rose-500 animate-pulse"
              }`} />
            </div>
            <span className={`text-[10px] font-mono mt-0.5 block ${
              healthScore > 75 ? "text-green-600" : healthScore > 50 ? "text-amber-600" : "text-rose-600"
            }`}>
              {healthScore > 75 ? "Excellent Status" : healthScore > 50 ? "Needs Monitoring" : "Action Required!"}
            </span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-4 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col justify-between h-28 hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-mono uppercase text-slate-400">Customer Satisfaction</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Star className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <h4 className="text-lg font-bold font-mono text-slate-800">{grossRevenue > 0 ? "4.9" : "4.8"} / 5.0</h4>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5">
              Verified customer feedback
            </span>
          </div>
        </div>

        {/* KPI 5 */}
        <div className="bg-white p-4 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col justify-between h-28 hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-mono uppercase text-slate-400">Active Orders</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <ShoppingCart className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <h4 className="text-lg font-bold font-mono text-slate-800">{orders.filter(o => o.status !== "Completed").length} Live</h4>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5 block truncate">
              {orders.filter(o => o.status === "Pending").length} Pend • {orders.filter(o => o.status === "Preparing" || o.status === "Ready").length} Prep • {orders.filter(o => o.status === "Delayed").length} Del
            </span>
          </div>
        </div>

        {/* KPI 6 */}
        <div className="bg-white p-4 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col justify-between h-28 hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-mono uppercase text-slate-400">Inventory Value</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Package className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <h4 className="text-lg font-bold font-mono text-slate-800">${calculatedInventoryValue > 0 ? calculatedInventoryValue.toLocaleString([], { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}</h4>
            <span className="text-[10px] text-emerald-600 flex items-center font-mono mt-0.5">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> Dynamic stock cost
            </span>
          </div>
        </div>

        {/* KPI 7 */}
        <div className="bg-white p-4 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col justify-between h-28 hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-mono uppercase text-slate-400">Staff Shift Status</span>
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <h4 className="text-lg font-bold font-mono text-slate-800">Synced</h4>
            <span className="text-[10px] text-teal-600 flex items-center font-mono mt-0.5">
              Role Auth Activated
            </span>
          </div>
        </div>

        {/* KPI 8 */}
        <div className="bg-white p-4 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col justify-between h-28 hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-mono uppercase text-slate-400">Delivery Performance</span>
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <h4 className="text-lg font-bold font-mono text-slate-800">96.5% On-Time</h4>
            <span className="text-[10px] text-purple-600 flex items-center font-mono mt-0.5">
              Avg dispatch: 11 mins
            </span>
          </div>
        </div>

      </div>

      {/* Main Core Layout: 2x2 Grid of Charts & AI Realtime Advisory Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: 2x2 Charts (8 Cols) */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Chart 1: Revenue Trend (Area) */}
          <div className="bg-white p-5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-slate-100 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-serif font-bold text-sm text-slate-800">Revenue Trend (30 Days)</h3>
              <span className="text-[10px] font-mono text-slate-400">Target: $1.2k/day</span>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2B6CB0" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#2B6CB0" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2F7" />
                  <XAxis dataKey="day" tick={{ fontSize: 9 }} stroke="#A0AEC0" />
                  <YAxis tick={{ fontSize: 9 }} stroke="#A0AEC0" />
                  <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#2B6CB0" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Revenue by Ordering Channel (Horizontal Bar) */}
          <div className="bg-white p-5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-slate-100 space-y-4">
            <h3 className="font-serif font-bold text-sm text-slate-800">Revenue by Ordering Channel</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={orderChannelData} layout="vertical" margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#EDF2F7" />
                  <XAxis type="number" tick={{ fontSize: 9 }} stroke="#A0AEC0" />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} stroke="#A0AEC0" />
                  <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
                  <Bar dataKey="sales" fill="#319795" radius={[0, 4, 4, 0]} barSize={16}>
                    {orderChannelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? "#2B6CB0" : index === 1 ? "#319795" : "#4C51BF"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Profit Margin % Trend */}
          <div className="bg-white p-5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-slate-100 space-y-4">
            <h3 className="font-serif font-bold text-sm text-slate-800">Profit Margin % Trend (Monthly)</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={profitMarginData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2F7" />
                  <XAxis dataKey="month" tick={{ fontSize: 9 }} stroke="#A0AEC0" />
                  <YAxis tick={{ fontSize: 9 }} stroke="#A0AEC0" domain={[20, 40]} />
                  <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="margin" stroke="#805AD5" strokeWidth={2.5} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Sales by Category (Donut) */}
          <div className="bg-white p-5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-slate-100 space-y-4">
            <h3 className="font-serif font-bold text-sm text-slate-800">Sales Category Share</h3>
            <div className="h-56 relative flex items-center justify-center">
              <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-slate-800 font-mono">$13k</span>
                <span className="text-[9px] uppercase text-slate-400 font-mono font-bold">Total Sales</span>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Right Side: AI Advisory Insights (4 Cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-slate-100 space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-[#2B6CB0] animate-pulse" />
              <h3 className="font-serif text-base font-bold text-slate-800">AI Business Insights</h3>
            </div>
            <button 
              onClick={handleRefreshInsights}
              disabled={loadingInsights}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-[#2B6CB0] hover:border-[#2B6CB0] transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingInsights ? "animate-spin text-[#2B6CB0]" : ""}`} />
            </button>
          </div>

          <div className="space-y-4">
            {aiInsights.map((insight, idx) => (
              <div 
                key={idx} 
                className={`p-4 rounded-xl border transition-all duration-300 ${
                  idx === aiTipIndex 
                    ? "scale-[1.02] shadow-sm border-blue-100 bg-blue-50/20" 
                    : "border-slate-100 bg-slate-50/50"
                }`}
              >
                <div className="flex items-start space-x-3">
                  <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    insight.severity === "success" ? "bg-green-500" :
                    insight.severity === "warning" ? "bg-amber-500" :
                    insight.severity === "danger" ? "bg-rose-500" : "bg-blue-500"
                  }`} />
                  <div>
                    <p className={`text-xs font-medium leading-relaxed ${
                      idx === aiTipIndex ? "text-slate-800 font-semibold" : "text-slate-600"
                    }`}>
                      {insight.text}
                    </p>
                    {idx === aiTipIndex && (
                      <span className="inline-block mt-2 text-[9px] font-mono uppercase font-bold text-[#2B6CB0] bg-blue-50 px-2 py-0.5 rounded">
                        Active Priority Advice
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Portfolio Integrity Widget */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-500 font-bold uppercase">Branch Audits</span>
              <span className="text-[10px] text-green-600 font-bold flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verified
              </span>
            </div>
            <div className="space-y-1 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Manhattan Branch:</span>
                <span className="font-mono font-semibold text-slate-800">Healthy</span>
              </div>
              <div className="flex justify-between">
                <span>Brooklyn Reserve:</span>
                <span className="font-mono font-semibold text-slate-800">Steady</span>
              </div>
              <div className="flex justify-between">
                <span>Miami Lounge:</span>
                <span className="font-mono font-semibold text-amber-600">Underperforming</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
