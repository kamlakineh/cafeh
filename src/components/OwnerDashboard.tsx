import React from "react";
import { 
  LayoutDashboard, Coins, BarChart3, LineChart, Building, Users, 
  UtensilsCrossed, Briefcase, Package, Megaphone, Star, Sparkles, 
  Calendar, FileText, Settings, Filter, ChevronRight, Menu, X, Sparkle, RefreshCw
} from "lucide-react";
import { Order, InventoryItem, Employee } from "../types";

// Import modular sub-components
import ExecutiveDashboardTab from "./owner/ExecutiveDashboardTab";
import FinancialAnalyticsTabs from "./owner/FinancialAnalyticsTabs";
import PerformanceTabs from "./owner/PerformanceTabs";
import OperationsTabs from "./owner/OperationsTabs";
import InsightsPlanningTabs from "./owner/InsightsPlanningTabs";

interface OwnerDashboardProps {
  orders: Order[];
  inventory: InventoryItem[];
  authenticatedStaff?: Employee | null;
  onLogout?: () => void;
}

export default function OwnerDashboard({
  orders,
  inventory,
  authenticatedStaff,
  onLogout
}: OwnerDashboardProps) {
  // Navigation State
  const [activeOwnerTab, setActiveOwnerTab] = React.useState<string>("Executive Dashboard");
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  // Filter States
  const [dateRange, setDateRange] = React.useState("Last 30 Days");
  const [selectedBranch, setSelectedBranch] = React.useState("All Branches");

  // Sidebar Items Definition
  const sidebarItems = [
    { name: "Executive Dashboard", icon: LayoutDashboard, category: "Core" },
    { name: "Financial Overview", icon: Coins, category: "Financials" },
    { name: "Revenue Analytics", icon: BarChart3, category: "Financials" },
    { name: "Profit & Loss", icon: LineChart, category: "Financials" },
    { name: "Customer Analytics", icon: Users, category: "Operations" },
    { name: "Product Performance", icon: UtensilsCrossed, category: "Operations" },
    { name: "Employee Performance", icon: Briefcase, category: "Operations" },
    { name: "Inventory Analytics", icon: Package, category: "Operations" },
    { name: "Marketing Performance", icon: Megaphone, category: "Marketing" },
    { name: "Customer Reviews", icon: Star, category: "Marketing" },
    { name: "AI Business Insights", icon: Sparkles, category: "Intelligence" },
    { name: "Forecast & Planning", icon: Calendar, category: "Intelligence" },
    { name: "Executive Reports", icon: FileText, category: "Audits" },
    { name: "Business Settings", icon: Settings, category: "System" },
  ];

  // Group items by category for high visual structure
  const categories = ["Core", "Financials", "Operations", "Marketing", "Intelligence", "Audits", "System"];

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col lg:flex-row text-slate-850" id="owner-dashboard-container">
      
      {/* MOBILE HEADER FOR SIDEBAR TOGGLE */}
      <div className="lg:hidden bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm shrink-0">
        <div className="flex items-center space-x-2">
          <Sparkle className="w-5 h-5 text-[#2B6CB0] animate-pulse" />
          <span className="font-serif font-black text-slate-800 text-sm">Aura Executive Command</span>
        </div>
        <button 
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-[#2B6CB0] transition-colors"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* LEFT SIDEBAR PANEL (Sticky, sleek, professional BI look) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-100 flex flex-col justify-between transform transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen lg:z-10
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="flex flex-col h-full overflow-hidden">
          
          {/* Sidebar Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-[#EBF8FF] text-[#2B6CB0] shadow-sm">
                <Sparkle className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <div>
                <h2 className="font-serif font-black text-slate-800 text-sm tracking-tight">Executive Command</h2>
                <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-wider">Aura Gourmet Global</span>
              </div>
            </div>
            <button className="lg:hidden p-1 text-slate-400 hover:text-slate-600" onClick={() => setMobileSidebarOpen(false)}>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Sidebar Navigation Items grouped by category */}
          <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-thin">
            {categories.map((cat) => {
              const items = sidebarItems.filter(i => i.category === cat);
              if (items.length === 0) return null;
              return (
                <div key={cat} className="space-y-1.5">
                  <span className="text-[9px] uppercase tracking-wider font-mono font-black text-slate-400 px-3 block">
                    {cat}
                  </span>
                  <div className="space-y-1">
                    {items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeOwnerTab === item.name;
                      return (
                        <button
                          key={item.name}
                          onClick={() => {
                            setActiveOwnerTab(item.name);
                            setMobileSidebarOpen(false);
                          }}
                          className={`
                            w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all duration-200
                            ${isActive 
                              ? "bg-[#EBF8FF] text-[#2B6CB0] font-bold shadow-sm" 
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"}
                          `}
                        >
                          <div className="flex items-center space-x-2.5">
                            <Icon className={`w-4 h-4 ${isActive ? "text-[#2B6CB0]" : "text-slate-400"}`} />
                            <span className="font-sans leading-none">{item.name}</span>
                          </div>
                          {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#2B6CB0]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Sidebar Footer User Badge */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
            <div className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
              <div className="w-9 h-9 bg-[#2B6CB0] text-white rounded-full flex items-center justify-center font-serif font-black text-sm border-2 border-[#EBF8FF] shadow-sm">
                O
              </div>
              <div>
                <h4 className="font-serif text-xs font-bold text-slate-800">Owner Terminal</h4>
                <p className="text-[9px] font-mono text-slate-400 font-bold uppercase mt-0.5">Enterprise Root</p>
              </div>
            </div>
          </div>

        </div>
      </aside>

      {/* MAIN LAYOUT (Scrollable on desktop) */}
      <main className="flex-1 lg:h-screen lg:overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* TOP METRICS & CONTROLS LEDGER */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-serif text-2xl font-black text-slate-800 tracking-tight flex items-center space-x-2">
              <span>{activeOwnerTab}</span>
              <span className="text-xs bg-[#2B6CB0]/10 text-[#2B6CB0] px-2.5 py-0.5 rounded-full font-mono font-bold">
                Enterprise Active
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono mt-1 uppercase tracking-wider">
              CEO PORTFOLIO COMMAND • LIVE OPERATIONAL DATABASES
            </p>
          </div>

          {/* Interactive Filters row */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            
            {/* Date filter */}
            <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-100 p-1 rounded-xl">
              <span className="text-[9px] font-mono uppercase font-bold text-slate-400 px-1.5">Period:</span>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="text-xs font-mono font-bold bg-white border border-slate-200 rounded-lg p-1 px-2.5 outline-none text-slate-700 focus:ring-1 focus:ring-[#2B6CB0]"
              >
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="This Month">This Month</option>
                <option value="This Year">This Year</option>
              </select>
            </div>

          </div>
        </div>

        {/* COMPONENT ROUTER CONTAINER */}
        <div className="w-full">
          
          {/* TAB 1: EXECUTIVE DASHBOARD */}
          {activeOwnerTab === "Executive Dashboard" && (
            <ExecutiveDashboardTab 
              orders={orders}
              inventory={inventory}
              selectedBranch={selectedBranch}
              dateRange={dateRange}
            />
          )}

          {/* TAB 2, 3, 4: FINANCIALS GROUP */}
          {(activeOwnerTab === "Financial Overview" || 
            activeOwnerTab === "Revenue Analytics" || 
            activeOwnerTab === "Profit & Loss") && (
            <FinancialAnalyticsTabs 
              orders={orders}
              selectedBranch={selectedBranch}
              dateRange={dateRange}
              activeTab={activeOwnerTab as any}
            />
          )}

          {/* TAB 5, 6, 7, 8: OPERATIONS & PERFORMANCE GROUP */}
          {(activeOwnerTab === "Branch Performance" || 
            activeOwnerTab === "Customer Analytics" || 
            activeOwnerTab === "Product Performance" || 
            activeOwnerTab === "Employee Performance") && (
            <PerformanceTabs 
              orders={orders}
              inventory={inventory}
              selectedBranch={selectedBranch}
              dateRange={dateRange}
              activeTab={activeOwnerTab as any}
            />
          )}

          {/* TAB 9, 10, 11: INVENTORY, MARKETING, REVIEWS GROUP */}
          {(activeOwnerTab === "Inventory Analytics" || 
            activeOwnerTab === "Marketing Performance" || 
            activeOwnerTab === "Customer Reviews") && (
            <OperationsTabs 
              orders={orders}
              inventory={inventory}
              activeTab={activeOwnerTab as any}
            />
          )}

          {/* TAB 12, 13, 14, 15: INTELLIGENCE, REPORTS, SETTINGS GROUP */}
          {(activeOwnerTab === "AI Business Insights" || 
            activeOwnerTab === "Forecast & Planning" || 
            activeOwnerTab === "Executive Reports" || 
            activeOwnerTab === "Business Settings") && (
            <InsightsPlanningTabs 
              orders={orders}
              inventory={inventory}
              selectedBranch={selectedBranch}
              dateRange={dateRange}
              activeTab={activeOwnerTab as any}
            />
          )}

        </div>

      </main>
    </div>
  );
}
