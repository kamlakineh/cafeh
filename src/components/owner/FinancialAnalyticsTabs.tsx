import React from "react";
import { 
  DollarSign, TrendingUp, TrendingDown, ArrowUpRight, 
  ArrowDownRight, FileDown, Plus, Download, Filter, Search, Percent
} from "lucide-react";
import { Order } from "../../types";
import {
  ResponsiveContainer,
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

interface FinancialAnalyticsTabsProps {
  orders: Order[];
  selectedBranch: string;
  dateRange: string;
  activeTab: "Financial Overview" | "Revenue Analytics" | "Profit & Loss";
}

export default function FinancialAnalyticsTabs({
  orders,
  selectedBranch,
  dateRange,
  activeTab
}: FinancialAnalyticsTabsProps) {
  // Local states
  const [revenuePivot, setRevenuePivot] = React.useState<"category" | "product" | "payment" | "custType" | "channel">("category");
  const [successToast, setSuccessToast] = React.useState<string | null>(null);

  const showToast = (message: string) => {
    setSuccessToast(message);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const grossSalesTotal = orders.reduce((acc, curr) => acc + (curr.paymentStatus === 'Paid' ? curr.total : 0), 0);
  const expensesVal = grossSalesTotal > 0 ? parseFloat((grossSalesTotal * 0.55).toFixed(2)) : 120.00;
  const netProfitVal = grossSalesTotal - expensesVal;

  // Chart Data: Stacked Income vs Expenses
  const stackedFinanceData = [
    { month: "Jan", Income: 14200, Expenses: 9100 },
    { month: "Feb", Income: 16800, Expenses: 10400 },
    { month: "Mar", Income: 18500, Expenses: 11100 },
    { month: "Apr", Income: 22100, Expenses: 13200 },
    { month: "May", Income: 24560, Expenses: 15400 }
  ];

  // Cash Flow Trend Data
  const cashFlowData = [
    { week: "Wk 1", Inflow: 4800, Outflow: 3100 },
    { week: "Wk 2", Inflow: 5600, Outflow: 4100 },
    { week: "Wk 3", Inflow: 6100, Outflow: 4500 },
    { week: "Wk 4", Inflow: 8060, Outflow: 5350 }
  ];

  // Expense breakdown donut chart
  const expenseBreakdown = [
    { name: "COGS (Ingredients)", value: 8250, color: "#E53E3E" },
    { name: "Labor (Salaries)", value: 4120, color: "#3182CE" },
    { name: "Rent & Leases", value: 2500, color: "#DD6B20" },
    { name: "Marketing & Promo", value: 1200, color: "#319795" },
    { name: "Utilities & Gas", value: 980, color: "#805AD5" }
  ];

  // Pivoted Revenue Data
  const pivotDataCategory = [
    { name: "Burgers & Beef", value: 16745 },
    { name: "Sides & Fries", value: 5420 },
    { name: "Beverages & Elixirs", value: 4890 },
    { name: "Desserts & Sweets", value: 3255 }
  ];

  const pivotDataProduct = [
    { name: "The Golden Feast Burger", value: 4999 },
    { name: "Truffle Wagyu Burger", value: 3748 },
    { name: "Double Cheese Golden Burger", value: 2848 },
    { name: "Avocado Burger", value: 1699 },
    { name: "Truffle Fries", value: 1250 }
  ];

  const pivotDataPayment = [
    { name: "Card Payments", value: 15400, color: "#3182CE" },
    { name: "Mobile Money", value: 5200, color: "#319795" },
    { name: "Cash Transactions", value: 3100, color: "#DD6B20" },
    { name: "Digital Wallets", value: 1860, color: "#805AD5" }
  ];

  const pivotDataCustomer = [
    { name: "New Customers", value: 16400, color: "#319795" },
    { name: "Returning Customers", value: 9160, color: "#2B6CB0" }
  ];

  const pivotDataChannel = [
    { name: "In-App Orders", value: 11200 },
    { name: "Web Orders", value: 7450 },
    { name: "Walk-in Displays", value: 4800 },
    { name: "Phone Bookings", value: 1110 }
  ];

  return (
    <div className="space-y-6 animate-fadeIn" id="owner-finance-analytics">
      
      {/* Dynamic Success Toast */}
      {successToast && (
        <div className="fixed top-24 right-8 bg-slate-900 text-white text-xs font-mono py-3 px-5 rounded-xl shadow-2xl z-50 animate-bounce flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>{successToast}</span>
        </div>
      )}

      {/* -------------------- 1. FINANCIAL OVERVIEW -------------------- */}
      {activeTab === "Financial Overview" && (
        <div className="space-y-6">
          
          {/* Accounting style Summary matrix */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
            <h3 className="font-serif text-lg font-bold text-slate-800 mb-6">Accounting Profitability Ledger</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              
              <div className="space-y-2 pr-4">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">Enterprise Revenue</span>
                <div className="flex items-baseline justify-between">
                  <h4 className="text-xl font-bold font-mono text-slate-800">${grossSalesTotal.toFixed(2)}</h4>
                  <span className="text-[10px] text-green-600 font-mono">Synced</span>
                </div>
                <p className="text-[10px] text-slate-400 font-sans leading-relaxed">Calculated dynamically from real database sales orders.</p>
              </div>

              <div className="space-y-2 md:pl-6 pr-4 pt-4 md:pt-0">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">Total Expenses</span>
                <div className="flex items-baseline justify-between">
                  <h4 className="text-xl font-bold font-mono text-slate-800">${expensesVal.toFixed(2)}</h4>
                  <span className="text-[10px] text-amber-600 font-mono">55% Est.</span>
                </div>
                <p className="text-[10px] text-slate-400 font-sans leading-relaxed">Estimated COGS, wages, utilities, lease and operation costs.</p>
              </div>

              <div className="space-y-2 md:pl-6 pr-4 pt-4 md:pt-0">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">Operating Profit</span>
                <div className="flex items-baseline justify-between">
                  <h4 className="text-xl font-bold font-mono text-slate-800">${netProfitVal.toFixed(2)}</h4>
                  <span className="text-[10px] text-green-600 font-mono">45% Yield</span>
                </div>
                <p className="text-[10px] text-slate-400 font-sans leading-relaxed">Operating profit yield after subtracting standard utilities & lease bills.</p>
              </div>

              <div className="space-y-2 md:pl-6 pt-4 md:pt-0">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">Net Cash Flow</span>
                <div className="flex items-baseline justify-between">
                  <h4 className="text-xl font-bold font-mono text-slate-800">${netProfitVal.toFixed(2)}</h4>
                  <span className="text-[10px] text-green-600 font-mono">Synced</span>
                </div>
                <p className="text-[10px] text-slate-400 font-sans leading-relaxed">Cash Inflow (${grossSalesTotal.toFixed(2)}) minus outflow cash payouts (${expensesVal.toFixed(2)}) this cycle.</p>
              </div>

            </div>
          </div>

          {/* Charts Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: Income vs Expenses Stacked Bar (8 Cols) */}
            <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-4">
              <h3 className="font-serif font-bold text-sm text-slate-800">Monthly Revenue vs Operating Costs</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stackedFinanceData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2F7" />
                    <XAxis dataKey="month" tick={{ fontSize: 9 }} stroke="#A0AEC0" />
                    <YAxis tick={{ fontSize: 9 }} stroke="#A0AEC0" />
                    <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Bar dataKey="Income" fill="#2B6CB0" stackId="a" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="Expenses" fill="#E53E3E" stackId="b" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right: Cash Flow Trend (4 Cols) */}
            <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-4">
              <h3 className="font-serif font-bold text-sm text-slate-800">Expense Breakdown Share</h3>
              <div className="h-64 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {expenseBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Cash flow weekly line chart */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-4">
            <h3 className="font-serif font-bold text-sm text-slate-800">Weekly Cash Inflow vs Outflow</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cashFlowData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2F7" />
                  <XAxis dataKey="week" tick={{ fontSize: 9 }} stroke="#A0AEC0" />
                  <YAxis tick={{ fontSize: 9 }} stroke="#A0AEC0" />
                  <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Line type="monotone" dataKey="Inflow" stroke="#319795" strokeWidth={2} />
                  <Line type="monotone" dataKey="Outflow" stroke="#DD6B20" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* -------------------- 2. REVENUE ANALYTICS -------------------- */}
      {activeTab === "Revenue Analytics" && (
        <div className="space-y-6">
          
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm gap-4">
            <div className="flex flex-wrap gap-2">
              {[
                { label: "By Category", val: "category" },
                { label: "By Product", val: "product" },
                { label: "Payment Channel", val: "payment" },
                { label: "Customer Segment", val: "custType" },
                { label: "Ordering Channel", val: "channel" }
              ].map((btn) => (
                <button
                  key={btn.val}
                  onClick={() => setRevenuePivot(btn.val as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
                    revenuePivot === btn.val 
                      ? "bg-[#2B6CB0] text-white font-bold" 
                      : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => showToast("Exporting Custom Revenue Report to PDF...")}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 hover:text-[#2B6CB0] hover:border-[#2B6CB0] rounded-xl text-xs font-mono transition-all"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>
              <button 
                onClick={() => showToast("Exporting Revenue Matrix to CSV...")}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 hover:text-[#2B6CB0] hover:border-[#2B6CB0] rounded-xl text-xs font-mono transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
            </div>
          </div>

          {/* Drill-down Analytics Display */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-6">
            <h3 className="font-serif text-base font-bold text-slate-800 capitalize">
              Revenue Breakdown: {revenuePivot.replace("custType", "Customer Segment").replace("channel", "Ordering Channel")}
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Chart View (7 Cols) */}
              <div className="lg:col-span-7 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  {revenuePivot === "payment" || revenuePivot === "custType" ? (
                    <PieChart>
                      <Pie
                        data={revenuePivot === "payment" ? pivotDataPayment : pivotDataCustomer}
                        cx="50%"
                        cy="50%"
                        innerRadius={revenuePivot === "custType" ? 0 : 50}
                        outerRadius={80}
                        paddingAngle={revenuePivot === "custType" ? 0 : 3}
                        dataKey="value"
                      >
                        {(revenuePivot === "payment" ? pivotDataPayment : pivotDataCustomer).map((entry: any, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                    </PieChart>
                  ) : (
                    <BarChart 
                      data={revenuePivot === "category" ? pivotDataCategory : revenuePivot === "product" ? pivotDataProduct : pivotDataChannel} 
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2F7" />
                      <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="#A0AEC0" />
                      <YAxis tick={{ fontSize: 9 }} stroke="#A0AEC0" />
                      <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
                      <Bar dataKey="value" fill="#2B6CB0" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>

              {/* Right Table View (5 Cols) */}
              <div className="lg:col-span-5 space-y-4">
                <span className="text-xs font-mono uppercase font-bold text-slate-400 block border-b border-slate-100 pb-2">Tabular Auditing</span>
                <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                  {(revenuePivot === "category" ? pivotDataCategory :
                    revenuePivot === "product" ? pivotDataProduct :
                    revenuePivot === "payment" ? pivotDataPayment :
                    revenuePivot === "custType" ? pivotDataCustomer : pivotDataChannel).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-3 text-xs">
                      <span className="font-sans font-medium text-slate-700">{item.name}</span>
                      <div className="flex items-center space-x-3">
                        <span className="font-mono font-bold text-slate-800">${item.value.toLocaleString()}</span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {((item.value / grossSalesTotal) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* -------------------- 3. PROFIT & LOSS (P&L) -------------------- */}
      {activeTab === "Profit & Loss" && (
        <div className="space-y-6">
          
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center border-b border-slate-100 pb-4 gap-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-800">Aura Gourmet Global P&L Statement</h3>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">Report Period: YTD Fiscal Year 2026</p>
              </div>
              <button 
                onClick={() => showToast("Exporting P&L Statement to Excel format...")}
                className="flex items-center space-x-2 px-4 py-2 bg-[#2B6CB0] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-mono font-bold transition-all shadow-sm"
              >
                <FileDown className="w-4 h-4" />
                <span>Export P&L</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-none">
                <thead className="bg-slate-50 font-mono text-slate-500 border-y border-slate-100">
                  <tr>
                    <th className="p-3 uppercase">Line Item</th>
                    <th className="p-3 text-right uppercase">Current Month</th>
                    <th className="p-3 text-right uppercase">vs Last Month</th>
                    <th className="p-3 text-right uppercase">YTD Cumulative</th>
                    <th className="p-3 text-right uppercase">Variance %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600 font-sans">
                  
                  {/* Category: Revenue */}
                  <tr className="bg-slate-50/20 font-bold text-slate-800">
                    <td className="p-3">Total Enterprise Revenue</td>
                    <td className="p-3 text-right font-mono">${grossSalesTotal.toFixed(2)}</td>
                    <td className="p-3 text-right font-mono text-green-600 flex items-center justify-end">
                      <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +12.4%
                    </td>
                    <td className="p-3 text-right font-mono">$124,560.00</td>
                    <td className="p-3 text-right font-mono text-green-600">+10.2%</td>
                  </tr>

                  {/* COGS */}
                  <tr>
                    <td className="p-3 pl-6">Cost of Goods Sold (COGS)</td>
                    <td className="p-3 text-right font-mono">-$8,250.00</td>
                    <td className="p-3 text-right font-mono text-amber-600">-$240.00</td>
                    <td className="p-3 text-right font-mono">-$41,300.00</td>
                    <td className="p-3 text-right font-mono text-amber-600">+2.9%</td>
                  </tr>

                  {/* Gross Profit */}
                  <tr className="bg-slate-50/10 font-semibold text-slate-800 border-y border-slate-100">
                    <td className="p-3">Gross Profit Margin</td>
                    <td className="p-3 text-right font-mono">${(grossSalesTotal - 8250).toFixed(2)}</td>
                    <td className="p-3 text-right font-mono text-green-600">+$2,110.00</td>
                    <td className="p-3 text-right font-mono">$83,260.00</td>
                    <td className="p-3 text-right font-mono text-green-600">+14.1%</td>
                  </tr>

                  {/* Operating Expenses */}
                  <tr>
                    <td className="p-3 pl-6">Labor & Chef Salaries</td>
                    <td className="p-3 text-right font-mono">-$4,120.00</td>
                    <td className="p-3 text-right font-mono text-slate-400">Stable</td>
                    <td className="p-3 text-right font-mono">-$20,600.00</td>
                    <td className="p-3 text-right font-mono text-slate-400">0.0%</td>
                  </tr>
                  <tr>
                    <td className="p-3 pl-6">Rent & Physical Leases</td>
                    <td className="p-3 text-right font-mono">-$2,500.00</td>
                    <td className="p-3 text-right font-mono text-slate-400">Stable</td>
                    <td className="p-3 text-right font-mono">-$12,500.00</td>
                    <td className="p-3 text-right font-mono text-slate-400">0.0%</td>
                  </tr>
                  <tr>
                    <td className="p-3 pl-6">Marketing & Ads Campaigns</td>
                    <td className="p-3 text-right font-mono">-$1,200.00</td>
                    <td className="p-3 text-right font-mono text-amber-600">+$150.00</td>
                    <td className="p-3 text-right font-mono">-$5,800.00</td>
                    <td className="p-3 text-right font-mono text-amber-600">+6.5%</td>
                  </tr>
                  <tr>
                    <td className="p-3 pl-6">Utilities & Gas Rates</td>
                    <td className="p-3 text-right font-mono">-$980.00</td>
                    <td className="p-3 text-right font-mono text-green-600">-$45.00</td>
                    <td className="p-3 text-right font-mono">-$4,910.00</td>
                    <td className="p-3 text-right font-mono text-green-600">-2.1%</td>
                  </tr>

                  {/* Operating Income */}
                  <tr className="bg-slate-50/20 font-bold text-slate-800 border-t border-slate-100">
                    <td className="p-3">Operating Profit (EBITDA)</td>
                    <td className="p-3 text-right font-mono">${(grossSalesTotal - 8250 - 8800).toFixed(2)}</td>
                    <td className="p-3 text-right font-mono text-green-600">+$1,820.50</td>
                    <td className="p-3 text-right font-mono">$39,450.00</td>
                    <td className="p-3 text-right font-mono text-green-600">+19.2%</td>
                  </tr>

                  {/* Taxes and Interest */}
                  <tr>
                    <td className="p-3 pl-6">State Corporate Tax (15%)</td>
                    <td className="p-3 text-right font-mono">-$1,180.50</td>
                    <td className="p-3 text-right font-mono">-$120.00</td>
                    <td className="p-3 text-right font-mono">-$5,917.50</td>
                    <td className="p-3 text-right font-mono text-amber-600">+15.1%</td>
                  </tr>

                  {/* Net Income */}
                  <tr className="bg-[#EBF8FF] font-black text-[#2B6CB0] border-y-2 border-[#2B6CB0]">
                    <td className="p-3 uppercase">Net Profit Margin (GAAP)</td>
                    <td className="p-3 text-right font-mono">${((grossSalesTotal - 8250 - 8800) * 0.85).toFixed(2)}</td>
                    <td className="p-3 text-right font-mono text-[#2B6CB0] flex items-center justify-end">
                      <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +15.5%
                    </td>
                    <td className="p-3 text-right font-mono">$33,532.50</td>
                    <td className="p-3 text-right font-mono text-green-600">+17.8%</td>
                  </tr>

                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
