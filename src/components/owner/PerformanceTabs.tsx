import React from "react";
import { 
  Building, Star, Users, UserCheck, UtensilsCrossed, 
  ArrowUpRight, ArrowDownRight, Sparkles, Filter, Search, 
  ChevronRight, Calendar, Download, RefreshCw, Briefcase, Award, ShieldAlert
} from "lucide-react";
import { Order, InventoryItem } from "../../types";
import EmployeeManagementPanel from "../shared/EmployeeManagementPanel";
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

interface PerformanceTabsProps {
  orders: Order[];
  inventory: InventoryItem[];
  selectedBranch: string;
  dateRange: string;
  activeTab: "Branch Performance" | "Customer Analytics" | "Product Performance" | "Employee Performance";
}

export default function PerformanceTabs({
  orders,
  inventory,
  selectedBranch,
  dateRange,
  activeTab
}: PerformanceTabsProps) {
  // Local states
  const [branchSortBy, setBranchSortBy] = React.useState<"revenue" | "rating" | "active" | "margin">("revenue");
  const [productCategoryFilter, setProductCategoryFilter] = React.useState<string>("All");
  const [selectedBranchDrilldown, setSelectedBranchDrilldown] = React.useState<string | null>(null);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Branch Performance Data
  const branchList = [
    { id: "B1", name: "Manhattan Salon #1", manager: "Chef Arthur", revenue: 14560, rating: 4.9, staff: 12, inventoryVal: 6450, activeOrders: 4, avgOrder: 24.50, margin: 34 },
    { id: "B2", name: "Brooklyn Reserve #2", manager: "Sofia Rossi", revenue: 9230, rating: 4.8, staff: 8, inventoryVal: 4200, activeOrders: 2, avgOrder: 22.10, margin: 31 },
    { id: "B3", name: "Miami Beach Lounge #3", manager: "Danilo Silva", revenue: 8120, rating: 4.7, staff: 9, inventoryVal: 3600, activeOrders: 3, avgOrder: 21.80, margin: 29 }
  ];

  // Sorting logic for branches
  const sortedBranches = [...branchList].sort((a, b) => {
    if (branchSortBy === "revenue") return b.revenue - a.revenue;
    if (branchSortBy === "rating") return b.rating - a.rating;
    if (branchSortBy === "active") return b.activeOrders - a.activeOrders;
    return b.margin - a.margin;
  });

  // Customer CLV data
  const clvDistribution = [
    { range: "$0-50", count: 420 },
    { range: "$50-150", count: 850 },
    { range: "$150-300", count: 1100 },
    { range: "$300+", count: 320 }
  ];

  // Customer Retention cohort metrics
  const cohortData = [
    { cohort: "Jan Signups", m1: "100%", m2: "78%", m3: "65%", m4: "58%" },
    { cohort: "Feb Signups", m1: "100%", m2: "82%", m3: "70%", m4: "-" },
    { cohort: "Mar Signups", m1: "100%", m2: "85%", m3: "-", m4: "-" }
  ];

  // Customer Growth over time
  const customerGrowthData = [
    { month: "Jan", activeCustomers: 1200 },
    { month: "Feb", activeCustomers: 1450 },
    { month: "Mar", activeCustomers: 1900 },
    { month: "Apr", activeCustomers: 2200 },
    { month: "May", activeCustomers: 2650 }
  ];

  // Menu Product Performance
  const productList = [
    { name: "The Golden Feast Burger", category: "Beef", orders: 245, revenue: 12247, margin: "45%", rating: 5.0, returnRate: "1.2%" },
    { name: "Truffle Wagyu Burger", category: "Beef", orders: 150, revenue: 3748, margin: "38%", rating: 4.9, returnRate: "2.1%" },
    { name: "Double Cheese Golden Burger", category: "Cheese", orders: 120, revenue: 2278, margin: "35%", rating: 4.8, returnRate: "1.8%" },
    { name: "Spicy Chicken Burger", category: "Chicken", orders: 95, revenue: 1614, margin: "4%", rating: 4.2, returnRate: "5.4%" },
    { name: "Truffle Fries", category: "Fries", orders: 180, revenue: 1250, margin: "72%", rating: 4.7, returnRate: "0.5%" },
    { name: "Golden Sunrise Elixir", category: "Drinks", orders: 320, revenue: 2560, margin: "68%", rating: 4.9, returnRate: "0.1%" }
  ];

  const filteredProducts = productList.filter(p => {
    if (productCategoryFilter === "All") return true;
    return p.category === productCategoryFilter;
  });

  // Employee data
  const employeeList = [
    { id: "E1", name: "Chef Marcus Aurelius", role: "Head Chef", score: 96, attendance: "98%", rating: 4.95, sales: "$0 (Kitchen)", speed: "9.2 min avg" },
    { id: "E2", name: "Alexander Cook", role: "Line Cook", score: 88, attendance: "95%", rating: 4.82, sales: "$0 (Kitchen)", speed: "11.5 min avg" },
    { id: "E3", name: "Lucia Santos", role: "Senior Waiter", score: 94, attendance: "100%", rating: 4.91, sales: "$4,560", speed: "5.4 min response" },
    { id: "E4", name: "David Kim", role: "Junior Cashier", score: 85, attendance: "94%", rating: 4.75, sales: "$8,120", speed: "1.8 min payment" },
    { id: "E5", name: "Ravi Patel", role: "Delivery Rider", score: 72, attendance: "88%", rating: 4.20, sales: "$0 (Delivery)", speed: "19.5 min transit" }
  ];

  return (
    <div className="space-y-6 animate-fadeIn" id="owner-performance">

      {/* Local Toast alerts */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 bg-slate-900 text-white text-xs font-mono py-3 px-5 rounded-xl shadow-2xl z-50 animate-fadeIn flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* -------------------- 1. BRANCH PERFORMANCE -------------------- */}
      {activeTab === "Branch Performance" && (
        <div className="space-y-6">
          
          <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-slate-400 uppercase font-bold">Sort Branches By:</span>
              <select 
                value={branchSortBy} 
                onChange={(e) => setBranchSortBy(e.target.value as any)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-sans outline-none focus:ring-1 focus:ring-[#2B6CB0]"
              >
                <option value="revenue">Gross Revenue</option>
                <option value="rating">Satisfaction Rating</option>
                <option value="active">Active Orders</option>
                <option value="margin">Net Profit Margin</option>
              </select>
            </div>
            <button 
              onClick={() => showToast("Exporting multi-branch performance metrics summary...")}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 hover:border-[#2B6CB0] text-slate-600 hover:text-[#2B6CB0] rounded-xl text-xs font-mono transition-all"
            >
              Export Branch Comparison
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Branches Rank & Table (8 Cols) */}
            <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-6">
              <h3 className="font-serif text-base font-bold text-slate-800">Operational Region Metrics</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-none">
                  <thead className="bg-slate-50 font-mono text-slate-400 border-b border-slate-100">
                    <tr>
                      <th className="p-3 uppercase">Branch Name</th>
                      <th className="p-3 uppercase">General Manager</th>
                      <th className="p-3 uppercase text-right">Revenue</th>
                      <th className="p-3 uppercase text-center">Rating</th>
                      <th className="p-3 uppercase text-right">Active Orders</th>
                      <th className="p-3 uppercase text-right">Profit Margin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    {sortedBranches.map((br) => (
                      <tr 
                        key={br.id} 
                        onClick={() => setSelectedBranchDrilldown(br.name)}
                        className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                      >
                        <td className="p-3 font-serif font-bold text-slate-800 flex items-center space-x-2">
                          <Building className="w-3.5 h-3.5 text-[#2B6CB0]" />
                          <span>{br.name}</span>
                        </td>
                        <td className="p-3">{br.manager}</td>
                        <td className="p-3 text-right font-mono font-bold text-slate-800">${br.revenue.toLocaleString()}</td>
                        <td className="p-3 text-center">
                          <span className="inline-flex items-center text-amber-500 font-mono">
                            <Star className="w-3 h-3 fill-current mr-0.5" /> {br.rating}
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono text-blue-600 font-semibold">{br.activeOrders} Live</td>
                        <td className="p-3 text-right font-mono font-bold text-green-600">{br.margin}% Net</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Branch Comparison Bar Chart (4 Cols) */}
            <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-4">
              <h3 className="font-serif font-bold text-sm text-slate-800">Regional Revenue Chart</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={branchList} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2F7" />
                    <XAxis dataKey="name" tick={{ fontSize: 8 }} stroke="#A0AEC0" />
                    <YAxis tick={{ fontSize: 9 }} stroke="#A0AEC0" />
                    <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
                    <Bar dataKey="revenue" fill="#319795" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Drilldown Detailed Branch Card Modal/Panel */}
          {selectedBranchDrilldown && (
            <div className="bg-[#EBF8FF]/40 border border-[#2B6CB0]/20 p-6 rounded-2xl animate-scaleUp space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-serif font-bold text-slate-800 text-sm">Detailed Audit: {selectedBranchDrilldown}</h4>
                <button 
                  onClick={() => setSelectedBranchDrilldown(null)}
                  className="text-xs text-slate-400 hover:text-[#2B6CB0] font-mono"
                >
                  [Close Audit]
                </button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="bg-white p-4 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Total Employees</span>
                  <p className="font-mono font-bold text-slate-800 text-base mt-1">
                    {branchList.find(b => b.name === selectedBranchDrilldown)?.staff} On Staff
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Active Inventory Value</span>
                  <p className="font-mono font-bold text-slate-800 text-base mt-1">
                    ${branchList.find(b => b.name === selectedBranchDrilldown)?.inventoryVal.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Average Ticket Size</span>
                  <p className="font-mono font-bold text-slate-800 text-base mt-1">
                    ${branchList.find(b => b.name === selectedBranchDrilldown)?.avgOrder.toFixed(2)}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Operational Status</span>
                  <span className="inline-block mt-2 text-[10px] bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-bold font-mono">
                    ONLINE & ACTIVE
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* -------------------- 2. CUSTOMER ANALYTICS -------------------- */}
      {activeTab === "Customer Analytics" && (
        <div className="space-y-6">
          
          {/* Key Customer Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: "New vs Returning", val: "65% / 35%", desc: "Direct Ratio" },
              { label: "Cust. Lifetime Value", val: "$185.40", desc: "+$12 MoM avg" },
              { label: "Retention Rate", val: "78.5%", desc: "Top 10% in industry" },
              { label: "Loyalty Enrolled", val: "1,420 Mem.", desc: "84% Active usage" },
              { label: "Average Churn", val: "4.2%", desc: "-1.1% decrease" }
            ].map((stat, i) => (
              <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <span className="text-[10px] text-slate-400 font-mono uppercase block">{stat.label}</span>
                <h4 className="text-base font-bold font-mono text-slate-800 mt-1">{stat.val}</h4>
                <p className="text-[10px] text-slate-400 font-sans mt-0.5">{stat.desc}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Customer growth (7 Cols) */}
            <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-4">
              <h3 className="font-serif font-bold text-sm text-slate-800">Monthly Customer Database Growth</h3>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={customerGrowthData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2F7" />
                    <XAxis dataKey="month" tick={{ fontSize: 9 }} stroke="#A0AEC0" />
                    <YAxis tick={{ fontSize: 9 }} stroke="#A0AEC0" />
                    <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="activeCustomers" stroke="#3182CE" strokeWidth={2.5} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Customer CLV Buckets (5 Cols) */}
            <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-4">
              <h3 className="font-serif font-bold text-sm text-slate-800">Lifetime Value (CLV) distribution</h3>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={clvDistribution} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2F7" />
                    <XAxis dataKey="range" tick={{ fontSize: 9 }} stroke="#A0AEC0" />
                    <YAxis tick={{ fontSize: 9 }} stroke="#A0AEC0" />
                    <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
                    <Bar dataKey="count" fill="#4C51BF" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Retention Heatmap block */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-4">
            <h3 className="font-serif text-sm font-bold text-slate-800">Retention Cohort Analytics</h3>
            <p className="text-[11px] text-slate-400">Tracking user lifetime engagement percentage relative to signup cohort month</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {cohortData.map((co, index) => (
                <div key={index} className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col justify-between">
                  <span className="text-xs font-serif font-bold text-slate-800">{co.cohort}</span>
                  <div className="grid grid-cols-4 gap-2 mt-4 text-center font-mono">
                    <div className="bg-emerald-100 text-emerald-800 p-2 rounded text-xs font-bold">
                      <span className="block text-[8px] uppercase text-slate-400">M1</span>
                      {co.m1}
                    </div>
                    <div className="bg-blue-100 text-blue-800 p-2 rounded text-xs font-bold">
                      <span className="block text-[8px] uppercase text-slate-400">M2</span>
                      {co.m2}
                    </div>
                    <div className="bg-indigo-50 text-indigo-800 p-2 rounded text-xs font-bold">
                      <span className="block text-[8px] uppercase text-slate-400">M3</span>
                      {co.m3}
                    </div>
                    <div className="bg-slate-200 text-slate-600 p-2 rounded text-xs font-bold">
                      <span className="block text-[8px] uppercase text-slate-400">M4</span>
                      {co.m4}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* -------------------- 3. PRODUCT PERFORMANCE -------------------- */}
      {activeTab === "Product Performance" && (
        <div className="space-y-6">
          
          {/* Category Filter Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm gap-4">
            <div className="flex flex-wrap gap-2">
              {["All", "Beef", "Chicken", "Cheese", "Fries", "Drinks"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setProductCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
                    productCategoryFilter === cat 
                      ? "bg-[#2B6CB0] text-white font-bold" 
                      : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            
            <button 
              onClick={() => showToast("Exporting menu pricing analysis report...")}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-xs font-mono"
            >
              Export Product Audit
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Table (8 Cols) */}
            <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
              <h3 className="font-serif text-base font-bold text-slate-800 mb-6">Menu Popularity & Profit Ledger</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-none">
                  <thead className="bg-slate-50 font-mono text-slate-400 border-b border-slate-100">
                    <tr>
                      <th className="p-3 uppercase">Product</th>
                      <th className="p-3 uppercase">Category</th>
                      <th className="p-3 uppercase text-right">Orders</th>
                      <th className="p-3 uppercase text-right">Revenue</th>
                      <th className="p-3 uppercase text-right">Profit Margin</th>
                      <th className="p-3 uppercase text-center">Rating</th>
                      <th className="p-3 uppercase text-right">Return Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    {filteredProducts.map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3 font-serif font-bold text-slate-800">{p.name}</td>
                        <td className="p-3 font-mono text-[10px] uppercase text-slate-400">{p.category}</td>
                        <td className="p-3 text-right font-mono">{p.orders}</td>
                        <td className="p-3 text-right font-mono font-bold text-slate-800">${p.revenue.toLocaleString()}</td>
                        <td className="p-3 text-right font-mono text-green-600 font-bold">{p.margin} Profit</td>
                        <td className="p-3 text-center">
                          <span className="inline-flex items-center text-amber-500 font-mono">
                            <Star className="w-3 h-3 fill-current mr-0.5" /> {p.rating}
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono text-rose-500 font-medium">{p.returnRate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Advisor Actions (4 Cols) */}
            <div className="lg:col-span-4 space-y-6">
              
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-4">
                <div className="flex items-center space-x-2 text-[#2B6CB0]">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  <h3 className="font-serif text-sm font-bold text-slate-800">AI Menu Recommendations</h3>
                </div>
                
                <div className="space-y-4 text-xs">
                  
                  <div className="bg-rose-50/50 border border-rose-100 p-3 rounded-xl">
                    <span className="text-[9px] uppercase font-bold text-rose-600 font-mono">Action Required</span>
                    <p className="text-slate-600 leading-relaxed mt-1">
                      Remove <strong>Spicy Chicken Burger</strong> from the Brooklyn branch. It represents under 4% profit margin and is responsible for a 5.4% return rate.
                    </p>
                  </div>

                  <div className="bg-teal-50/50 border border-teal-100 p-3 rounded-xl">
                    <span className="text-[9px] uppercase font-bold text-teal-600 font-mono">Growth Opportunity</span>
                    <p className="text-slate-600 leading-relaxed mt-1">
                      Promote <strong>Truffle Fries</strong> heavily. It holds a magnificent <strong>72% profit margin</strong> but is currently seeing low order conversion.
                    </p>
                  </div>

                  <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-xl">
                    <span className="text-[9px] uppercase font-bold text-[#2B6CB0] font-mono">Combo Recommendation</span>
                    <p className="text-slate-600 leading-relaxed mt-1">
                      Create combo: <strong>Golden Feast Burger + Golden Sunrise Elixir</strong>. Frequently purchased together. Bundling will lift average order value by 18%.
                    </p>
                  </div>

                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* -------------------- 4. EMPLOYEE PERFORMANCE -------------------- */}
      {activeTab === "Employee Performance" && (
        <div className="space-y-6">
          <EmployeeManagementPanel currentUserRole="Owner" />
        </div>
      )}

    </div>
  );
}
