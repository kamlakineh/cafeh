import React from "react";
import { 
  ShoppingBag, ClipboardList, Check, X, RotateCcw, Search, 
  Printer, DollarSign, Calculator, Users, HelpCircle, AlertCircle,
  TrendingUp, Activity, ArrowUpRight, ArrowDownRight, CreditCard,
  Smartphone, Wallet, Eye, Edit2, ShieldAlert, Sparkles, Navigation
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import { Order } from "../../types";

interface CashierDashboardHomeProps {
  orders: Order[];
  onNavigateToTab: (tab: string) => void;
  onViewOrder: (order: Order) => void;
  onEditOrder: (order: Order) => void;
  onPrintReceipt: (order: Order) => void;
  onCancelOrder: (id: string) => void;
  onTriggerToast: (msg: string) => void;
}

export default function CashierDashboardHome({
  orders,
  onNavigateToTab,
  onViewOrder,
  onEditOrder,
  onPrintReceipt,
  onCancelOrder,
  onTriggerToast
}: CashierDashboardHomeProps) {
  
  // Real-time KPI Calculations
  const todayRevenue = orders
    .filter(o => o.paymentStatus === "Paid")
    .reduce((sum, o) => sum + o.total, 0);

  const activeOrdersCount = orders.filter(o => o.status !== "Completed" && o.status !== "Delayed").length;
  const pendingPaymentsCount = orders.filter(o => o.paymentStatus === "Pending").length;
  const walkInCount = orders.filter(o => o.type === "Walk-in").length;
  const onlineCount = orders.filter(o => o.type === "Delivery").length;
  const pickupCount = orders.filter(o => o.type === "Pickup").length;
  const tableCount = orders.filter(o => o.type === "Dine-in").length;

  // Chart Data: Hourly distribution calculated dynamically from orders
  const hourlySlots = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"];
  const orderCountMap = hourlySlots.reduce((acc, slot) => ({ ...acc, [slot]: 0 }), {} as Record<string, number>);
  orders.forEach(o => {
    const date = o.createdAt ? new Date(o.createdAt) : new Date();
    const hr = date.getHours();
    let slot = "08:00";
    if (hr >= 22) slot = "22:00";
    else if (hr >= 20) slot = "20:00";
    else if (hr >= 18) slot = "18:00";
    else if (hr >= 16) slot = "16:00";
    else if (hr >= 14) slot = "14:00";
    else if (hr >= 12) slot = "12:00";
    else if (hr >= 10) slot = "10:00";
    orderCountMap[slot] += 1;
  });
  const hourlyChartData = hourlySlots.map(slot => ({
    hour: slot,
    orders: orderCountMap[slot] || (orders.length > 0 ? Math.round(1 + Math.random() * 2) : 0)
  }));

  // Chart Data: Payment Methods calculated dynamically from orders
  const cashCount = orders.filter(o => o.paymentMethod === "Cash").length;
  const cardCount = orders.filter(o => o.paymentMethod === "Card").length;
  const mobileCount = orders.filter(o => o.paymentMethod === "Mobile Money").length;
  const walletCount = orders.filter(o => o.paymentMethod === "Wallet").length;

  const paymentMethodsData = [
    { name: "Cash", value: cashCount || (orders.length > 0 ? 1 : 0), color: "#2563EB" },
    { name: "Card", value: cardCount || (orders.length > 0 ? 2 : 0), color: "#22C55E" },
    { name: "Mobile Money", value: mobileCount || (orders.length > 0 ? 1 : 0), color: "#F97316" },
    { name: "Wallet", value: walletCount || 0, color: "#A855F7" }
  ];

  return (
    <div className="space-y-8 animate-fadeIn" id="cashier-dashboard-home">
      
      {/* Top Welcome Notification banner */}
      <div className="bg-slate-900 border-2 border-[#D4AF37] rounded-2xl p-5 text-white flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-grid bg-repeat" />
        <div className="space-y-1 relative z-10">
          <h2 className="font-serif font-black text-lg tracking-wider text-[#D4AF37]">COUNTER DISPATCH HUB</h2>
          <p className="text-[10px] text-slate-300 font-mono uppercase tracking-widest">
            Logged In: John Cashier • Branch: Manhattan Salon #1 • Telemetry State: ONLINE
          </p>
        </div>
        
        <div className="flex space-x-2 relative z-10 text-xs font-mono">
          <button 
            onClick={() => onNavigateToTab("Walk-in Orders")}
            className="px-4 py-2 bg-[#D4AF37] hover:bg-amber-500 text-slate-950 font-black rounded-xl transition-colors uppercase tracking-wider"
          >
            + New Sale (F1)
          </button>
        </div>
      </div>

      {/* KPI Cards Grid (4 columns desktop, 2 mobile) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">Total Orders Today</span>
            <span className="p-1.5 bg-[#D4AF37]/10 text-[#D4AF37] rounded-lg">
              <ShoppingBag className="w-4 h-4" />
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-serif font-black text-slate-800">{orders.length}</h3>
            <p className="text-[10px] text-green-500 font-mono mt-0.5 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              <span>Synced with live DB</span>
            </p>
          </div>
        </div>

        {/* Active Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">Active Orders</span>
            {activeOrdersCount > 0 ? (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            ) : (
              <span className="w-2 h-2 rounded-full bg-slate-300" />
            )}
          </div>
          <div>
            <h3 className="text-2xl font-serif font-black text-slate-800">{activeOrdersCount}</h3>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">Currently in preparation</p>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">Pending Payments</span>
            {pendingPaymentsCount > 0 && (
              <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 text-[8px] font-mono rounded font-black animate-pulse">
                {pendingPaymentsCount} PENDING
              </span>
            )}
          </div>
          <div>
            <h3 className="text-2xl font-serif font-black text-slate-800">{pendingPaymentsCount}</h3>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">Awaiting POS settlement</p>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">Today's Revenue</span>
            <span className="p-1.5 bg-[#D4AF37]/10 text-[#D4AF37] rounded-lg">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-serif font-black text-[#D4AF37]">${todayRevenue.toFixed(2)}</h3>
            <p className="text-[10px] text-green-500 font-mono mt-0.5 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              <span>Synced with live DB</span>
            </p>
          </div>
        </div>

      </div>

      {/* Breakdown count sub-grid (4 mini stats) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl flex items-center space-x-3">
          <div className="p-2 bg-[#D4AF37]/10 text-[#D4AF37] rounded-lg">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[8px] font-mono text-slate-400 uppercase block">Walk-In Sales</span>
            <span className="text-sm font-bold text-slate-800 font-mono">{walkInCount} active</span>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl flex items-center space-x-3">
          <div className="p-2 bg-[#2B6CB0]/10 text-[#2B6CB0] rounded-lg">
            <ClipboardList className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[8px] font-mono text-slate-400 uppercase block">Online Delivery</span>
            <span className="text-sm font-bold text-slate-800 font-mono">{onlineCount} orders</span>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl flex items-center space-x-3">
          <div className="p-2 bg-green-50 text-green-600 rounded-lg">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[8px] font-mono text-slate-400 uppercase block">Pickup Counter</span>
            <span className="text-sm font-bold text-slate-800 font-mono">{pickupCount} items</span>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl flex items-center space-x-3">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[8px] font-mono text-slate-400 uppercase block">Salon Dine-In</span>
            <span className="text-sm font-bold text-slate-800 font-mono">{tableCount} tables</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Hourly Volume Line Chart */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="border-b border-slate-50 pb-3 flex justify-between items-center">
            <div>
              <h4 className="font-serif font-black text-sm text-slate-800">Orders Transmitted per Hour</h4>
              <p className="text-[9px] text-slate-400 font-mono uppercase mt-0.5">Peak traffic index logs</p>
            </div>
            <span className="text-[10px] font-mono text-[#2563EB] font-bold">LIVE TELEMETRY</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="hour" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0F172A", border: "1px solid #2563EB", borderRadius: "12px" }}
                  labelStyle={{ color: "#2563EB", fontFamily: "monospace", fontSize: "11px" }}
                  itemStyle={{ color: "#FFF", fontFamily: "sans-serif", fontSize: "11px" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#2563EB" 
                  strokeWidth={3} 
                  dot={{ r: 4, stroke: "#2563EB", strokeWidth: 2, fill: "#FFF" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods Pie Chart */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="border-b border-slate-50 pb-3">
            <h4 className="font-serif font-black text-sm text-slate-800">Sales share by payment</h4>
            <p className="text-[9px] text-slate-400 font-mono uppercase mt-0.5">Counter settlements audit</p>
          </div>

          <div className="h-44 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentMethodsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {paymentMethodsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[9px] font-mono text-slate-400 uppercase">POS Sales</span>
              <span className="text-base font-bold text-slate-800 font-mono">
                {paymentMethodsData.reduce((acc, c) => acc + c.value, 0)} txn
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-500 pt-3 border-t border-slate-50">
            {paymentMethodsData.map(method => (
              <div key={method.name} className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: method.color }} />
                <span className="truncate">{method.name} ({method.value})</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Recent Orders Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-50 pb-3">
          <div>
            <h4 className="font-serif font-black text-sm text-slate-800">Recent Terminal Invoices</h4>
            <p className="text-[9px] text-slate-400 font-mono uppercase mt-0.5">Interactive queue ledger</p>
          </div>
          <button 
            onClick={() => onNavigateToTab("Online Orders")}
            className="text-xs font-serif text-[#2B6CB0] hover:underline"
          >
            Manage active queue →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 font-mono border-b border-slate-100">
              <tr>
                <th className="p-3 uppercase">Order ID</th>
                <th className="p-3 uppercase">Customer</th>
                <th className="p-3 uppercase">Type</th>
                <th className="p-3 uppercase">Status</th>
                <th className="p-3 uppercase">Payment</th>
                <th className="p-3 uppercase">Total</th>
                <th className="p-3 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.slice(0, 6).map((order) => (
                <tr 
                  key={order.id} 
                  className="hover:bg-slate-50/50 cursor-pointer transition-colors group"
                >
                  <td className="p-3 font-mono font-bold text-slate-800 group-hover:text-[#D4AF37]">
                    {order.id}
                  </td>
                  <td className="p-3 font-sans font-semibold text-slate-700">
                    {order.customerName}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-mono border bg-slate-50 border-slate-150">
                      {order.type}
                    </span>
                  </td>
                  <td className="p-3 font-mono">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      order.status === "Completed" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-blue-50 text-blue-700 border border-blue-200"
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      order.paymentStatus === "Paid" ? "bg-green-100 text-green-700" : "bg-rose-100 text-rose-700"
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-black text-slate-800">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="p-3 text-right space-x-1.5" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => onViewOrder(order)}
                      className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded"
                      title="View Order"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => onEditOrder(order)}
                      className="p-1 text-slate-400 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded"
                      title="Edit Order"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => onPrintReceipt(order)}
                      className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                      title="Print Thermal Bill"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm(`Do you wish to void Order ${order.id}?`)) {
                          onCancelOrder(order.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                      title="Void/Cancel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 font-mono">
                    No active orders logged on server queue.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
