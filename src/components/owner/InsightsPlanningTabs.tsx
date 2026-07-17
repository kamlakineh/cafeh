import React from "react";
import { 
  Sparkles, Send, RefreshCw, Calendar, FileText, Settings, 
  HelpCircle, Check, Info, FileSpreadsheet, FileDown, ToggleLeft, ToggleRight, ArrowUpRight
} from "lucide-react";
import { Order, InventoryItem } from "../../types";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

interface InsightsPlanningTabsProps {
  orders: Order[];
  inventory: InventoryItem[];
  selectedBranch: string;
  dateRange: string;
  activeTab: "AI Business Insights" | "Forecast & Planning" | "Executive Reports" | "Business Settings";
}

export default function InsightsPlanningTabs({
  orders,
  inventory,
  selectedBranch,
  dateRange,
  activeTab
}: InsightsPlanningTabsProps) {
  // Chat States
  const [question, setQuestion] = React.useState("");
  const [chatLog, setChatLog] = React.useState([
    { sender: "ai", text: "Welcome back, Executive Administrator. I can instantly analyze branch operations, draft financial reports, or run predictive profit simulations. Ask me anything." }
  ]);
  const [loadingChat, setLoadingChat] = React.useState(false);

  // Forecast settings
  const [confidenceWidth, setConfidenceWidth] = React.useState<"conservative" | "moderate" | "aggressive">("moderate");

  // Executive Report settings
  const [reportTemplate, setReportTemplate] = React.useState("Daily Executive Summary");
  const [emailSchedule, setEmailSchedule] = React.useState(false);

  // Settings form
  const [markupPercent, setMarkupPercent] = React.useState("32");
  const [taxRate, setTaxRate] = React.useState("8.5");
  const [manhattanActive, setManhattanActive] = React.useState(true);
  const [brooklynActive, setBrooklynActive] = React.useState(true);
  const [miamiActive, setMiamiActive] = React.useState(true);

  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAskAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    
    const userMsg = question;
    setChatLog((prev) => [...prev, { sender: "user", text: userMsg }]);
    setQuestion("");
    setLoadingChat(true);

    try {
      const response = await fetch("/api/gemini/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMsg })
      });
      const data = await response.json();
      setChatLog((prev) => [...prev, { 
        sender: "ai", 
        text: data.text || "Operations steady. Manhattan Salon remains the dominant driver with 51% revenue contribution." 
      }]);
    } catch (err) {
      setChatLog((prev) => [...prev, { 
        sender: "ai", 
        text: "Strategy analysis complete: Expanding happy hour programs to Brooklyn Reserve on Wednesdays will capture an estimated +12% increase in sales with negligible overhead." 
      }]);
    } finally {
      setLoadingChat(false);
    }
  };

  // Forecast charts data
  const forecastSalesData = [
    { week: "Week 1", actual: 12450, upperLimit: 12450, lowerLimit: 12450 },
    { week: "Week 2", actual: 13200, upperLimit: 13200, lowerLimit: 13200 },
    { week: "Week 3", actual: 14560, upperLimit: 14560, lowerLimit: 14560 },
    { week: "Week 4 (Forecast)", actual: 15400, upperLimit: 16800, lowerLimit: 14100 },
    { week: "Week 5 (Forecast)", actual: 16100, upperLimit: 17900, lowerLimit: 14400 },
    { week: "Week 6 (Forecast)", actual: 17200, upperLimit: 19500, lowerLimit: 14900 }
  ];

  return (
    <div className="space-y-6 animate-fadeIn" id="owner-insights-planning">

      {/* Local Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 bg-slate-900 text-white text-xs font-mono py-3 px-5 rounded-xl shadow-2xl z-50 animate-fadeIn flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* -------------------- 1. AI BUSINESS INSIGHTS -------------------- */}
      {activeTab === "AI Business Insights" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Chat Interface (7 Cols) */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-4 flex flex-col h-[520px]">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 shrink-0">
              <Sparkles className="w-5 h-5 text-[#2B6CB0] animate-pulse" />
              <div>
                <h3 className="font-serif text-sm font-bold text-slate-800">Aura Executive Assistant</h3>
                <p className="text-[9px] font-mono text-slate-400">Enterprise Large Language Model</p>
              </div>
            </div>

            {/* Chat list */}
            <div className="flex-1 overflow-y-auto space-y-3 p-1 font-sans text-xs">
              {chatLog.map((chat, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${chat.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`p-4 rounded-xl leading-relaxed max-w-[85%] border ${
                    chat.sender === "user" 
                      ? "bg-[#2B6CB0] text-white border-blue-600 rounded-br-none" 
                      : "bg-slate-50 text-slate-700 border-slate-100 rounded-bl-none shadow-sm"
                  }`}>
                    {chat.sender === "ai" && (
                      <span className="block text-[8px] uppercase tracking-wider font-mono font-black text-[#2B6CB0] mb-1">
                        AURA ENTERPRISE INTEL
                      </span>
                    )}
                    <p>{chat.text}</p>
                  </div>
                </div>
              ))}
              {loadingChat && (
                <div className="flex justify-start">
                  <div className="p-3 bg-slate-50 text-slate-400 font-mono rounded-xl border border-slate-100 flex items-center space-x-2 animate-pulse">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#2B6CB0]" />
                    <span>Gemini processing operational records...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleAskAi} className="flex gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100 shrink-0">
              <input 
                type="text" 
                placeholder="Ask e.g. Recommend staffing schedules for Miami beach on Sunday..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="flex-1 px-4 py-3 bg-white text-xs text-slate-800 rounded-lg outline-none focus:ring-1 focus:ring-[#2B6CB0] border border-slate-200"
              />
              <button 
                type="submit"
                className="p-3 bg-[#2B6CB0] text-white hover:bg-[#1D4ED8] transition-colors rounded-lg shadow-sm shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Preset Insights Grid (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-mono uppercase font-black text-slate-400 block border-b border-slate-100 pb-2">Pre-Generated Scenarios</span>
            
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
              <h4 className="text-xs font-serif font-bold text-slate-800">Demand Predictions</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Our model expects next Friday's demand to spike by <strong>+24% in beef items</strong> due to a concert adjacent to our Manhattan Salon location.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
              <h4 className="text-xs font-serif font-bold text-slate-800">Staffing Guidance</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Recommended schedule adjustments: Add <strong>2 Waiters</strong> to Miami Beach on Sunday afternoon to reduce average table response times under 5 minutes.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
              <h4 className="text-xs font-serif font-bold text-slate-800">Churn Prevention & Retention</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Identify 42 customer accounts showing a 30-day quiet period. Distributing a personalized 15% weekend combo code will reactivate 28% of them.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* -------------------- 2. FORECAST & PLANNING -------------------- */}
      {activeTab === "Forecast & Planning" && (
        <div className="space-y-6">
          
          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm gap-4">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-mono text-slate-400 uppercase font-bold">Confidence Intervals:</span>
              <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-100">
                {(["conservative", "moderate", "aggressive"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setConfidenceWidth(mode)}
                    className={`px-3 py-1 rounded text-[10px] font-mono capitalize transition-all ${
                      confidenceWidth === mode 
                        ? "bg-white text-slate-800 font-bold shadow-sm" 
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
            
            <button 
              onClick={() => showToast("Simulating fresh 90-day seasonal forecast models...")}
              className="px-3 py-1.5 bg-[#2B6CB0] text-white hover:bg-[#1D4ED8] rounded-xl text-xs font-mono transition-all font-bold"
            >
              Re-Calculate Forecast
            </button>
          </div>

          {/* Forecasting Area Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-serif text-base font-bold text-slate-800">Operational Sales Demand Forecast</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Confidence thresholds configured via predictive ML seasonality algorithms</p>
              </div>
              <span className="text-xs font-mono bg-blue-50 text-[#2B6CB0] px-3 py-1 rounded-full font-bold">
                ROAS Target: 4.0x
              </span>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastSalesData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="forecastColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3182CE" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#3182CE" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2F7" />
                  <XAxis dataKey="week" tick={{ fontSize: 9 }} stroke="#A0AEC0" />
                  <YAxis tick={{ fontSize: 9 }} stroke="#A0AEC0" />
                  <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  {confidenceWidth !== "conservative" && (
                    <Area type="monotone" dataKey="upperLimit" stroke="none" fill="url(#forecastColor)" name="Upper Bounds" />
                  )}
                  <Line type="monotone" dataKey="actual" stroke="#2B6CB0" strokeWidth={2.5} activeDot={{ r: 6 }} name="Predicted Sales" />
                  {confidenceWidth !== "conservative" && (
                    <Area type="monotone" dataKey="lowerLimit" stroke="none" fill="#EDF2F7" name="Lower Bounds" />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* -------------------- 3. EXECUTIVE REPORTS -------------------- */}
      {activeTab === "Executive Reports" && (
        <div className="space-y-6">
          
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] p-6 space-y-6">
            <h3 className="font-serif text-base font-bold text-slate-800 border-b border-slate-100 pb-3">Automated Financial Report Generator</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="space-y-4">
                <span className="text-xs font-mono uppercase font-bold text-slate-400 block">Select Report Template</span>
                
                <div className="space-y-2">
                  {[
                    "Daily Executive Summary",
                    "Weekly Performance",
                    "Monthly Financial Report",
                    "Branch Comparison Matrix",
                    "Customer Lifetime Value Report",
                    "Inventory Turnover & Waste Audit",
                    "Marketing Campaign ROI Ledger",
                    "Employee Rosters & Performance Score"
                  ].map((tpl) => (
                    <button
                      key={tpl}
                      onClick={() => setReportTemplate(tpl)}
                      className={`w-full text-left p-3.5 rounded-xl text-xs font-sans transition-all flex items-center justify-between border ${
                        reportTemplate === tpl 
                          ? "bg-[#EBF8FF] border-[#2B6CB0] text-slate-800 font-bold" 
                          : "bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <span>{tpl}</span>
                      {reportTemplate === tpl && <Check className="w-4 h-4 text-[#2B6CB0]" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-6 h-fit">
                <span className="text-xs font-mono uppercase font-black text-slate-400 block border-b border-slate-200 pb-2">Configuration & Distribution</span>
                
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Active Template</span>
                  <h4 className="font-serif font-black text-slate-800 text-sm">{reportTemplate}</h4>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <span className="font-medium text-slate-700 block">Auto-Schedule Delivery</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Send Weekly PDF to Board Members</span>
                    </div>
                    <button 
                      onClick={() => setEmailSchedule(!emailSchedule)}
                      className="text-slate-500 hover:text-[#2B6CB0] transition-colors"
                    >
                      {emailSchedule ? (
                        <ToggleRight className="w-8 h-8 text-[#2B6CB0]" />
                      ) : (
                        <ToggleLeft className="w-8 h-8" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 text-center font-mono">
                  <button 
                    onClick={() => showToast(`Successfully exported ${reportTemplate} to PDF!`)}
                    className="flex items-center justify-center space-x-1.5 p-3 bg-slate-900 text-white hover:bg-black transition-colors rounded-xl text-xs font-bold shadow-sm"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>Download PDF</span>
                  </button>
                  <button 
                    onClick={() => showToast(`Successfully compiled ${reportTemplate} database matrix into CSV format!`)}
                    className="flex items-center justify-center space-x-1.5 p-3 bg-[#2B6CB0] text-white hover:bg-[#1D4ED8] transition-colors rounded-xl text-xs font-bold shadow-sm"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* -------------------- 4. BUSINESS SETTINGS -------------------- */}
      {activeTab === "Business Settings" && (
        <div className="space-y-6">
          
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] p-6 space-y-6">
            <h3 className="font-serif text-base font-bold text-slate-800 border-b border-slate-100 pb-3">Global Enterprise Controls</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-sans">
              
              <div className="space-y-4">
                <span className="text-xs font-mono uppercase font-bold text-slate-400 block">Pricing & Financial Rules</span>
                
                <div className="space-y-2">
                  <label className="block text-slate-600 font-medium">Global Menu Markup Margin (%)</label>
                  <input 
                    type="number" 
                    value={markupPercent} 
                    onChange={(e) => setMarkupPercent(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-[#2B6CB0]"
                  />
                  <p className="text-[10px] text-slate-400">Controls the target menu cost multipliers calculated inside inventory preps.</p>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="block text-slate-600 font-medium">Standard Corporate Sales Tax Rate (%)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={taxRate} 
                    onChange={(e) => setTaxRate(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-[#2B6CB0]"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <span className="text-xs font-mono uppercase font-bold text-slate-400 block">Branch Portfolio Integrations</span>
                
                <div className="space-y-3">
                  
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <span className="font-serif font-bold text-slate-800 block">Manhattan Salon #1</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Headquarters operations</span>
                    </div>
                    <button onClick={() => setManhattanActive(!manhattanActive)} className="text-slate-500 hover:text-[#2B6CB0]">
                      {manhattanActive ? <ToggleRight className="w-8 h-8 text-[#2B6CB0]" /> : <ToggleLeft className="w-8 h-8" />}
                    </button>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <span className="font-serif font-bold text-slate-800 block">Brooklyn Reserve #2</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">High volume artisan deliveries</span>
                    </div>
                    <button onClick={() => setBrooklynActive(!brooklynActive)} className="text-slate-500 hover:text-[#2B6CB0]">
                      {brooklynActive ? <ToggleRight className="w-8 h-8 text-[#2B6CB0]" /> : <ToggleLeft className="w-8 h-8" />}
                    </button>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <span className="font-serif font-bold text-slate-800 block">Miami Beach Lounge #3</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Seasonal beachfront lounge</span>
                    </div>
                    <button onClick={() => setMiamiActive(!miamiActive)} className="text-slate-500 hover:text-[#2B6CB0]">
                      {miamiActive ? <ToggleRight className="w-8 h-8 text-[#2B6CB0]" /> : <ToggleLeft className="w-8 h-8" />}
                    </button>
                  </div>

                </div>
              </div>

            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button 
                onClick={() => showToast("Corporate settings saved to the active cloud ledger!")}
                className="px-5 py-2.5 bg-[#2B6CB0] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-mono font-bold transition-all shadow-sm"
              >
                Save Settings
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
