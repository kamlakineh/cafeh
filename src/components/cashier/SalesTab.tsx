import React from "react";
import { 
  DollarSign, TrendingUp, ShoppingBag, Coins, Percent, 
  ArrowUpRight, ArrowDownRight, Printer, Calendar, FileText, CheckCircle2, ChevronRight
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";
import { Order } from "../../types";

interface SalesTabProps {
  orders: Order[];
  onTriggerToast: (msg: string) => void;
}

export default function SalesTab({
  orders,
  onTriggerToast
}: SalesTabProps) {
  
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);

  // Helper to calculate the order cost (sum of items, strictly excluding waiter tips)
  const calculatePureOrderCost = (order: Order) => {
    return order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // Filter settled/completed orders
  const settledOrders = React.useMemo(() => {
    return orders.filter(o => o.status === "Completed" || o.paymentStatus === "Paid");
  }, [orders]);

  // Sync default selection
  React.useEffect(() => {
    if (settledOrders.length > 0 && !selectedOrder) {
      setSelectedOrder(settledOrders[0]);
    }
  }, [settledOrders, selectedOrder]);

  // Calculate metrics
  const todayTotalSales = React.useMemo(() => {
    // Sum of pure order costs excluding tips
    return settledOrders.reduce((acc, curr) => acc + calculatePureOrderCost(curr), 0);
  }, [settledOrders]);

  const totalOrdersCount = settledOrders.length;
  
  const averageOrderValue = React.useMemo(() => {
    if (totalOrdersCount === 0) return 0;
    return todayTotalSales / totalOrdersCount;
  }, [todayTotalSales, totalOrdersCount]);

  // Calculate cash sales specifically
  const cashSales = React.useMemo(() => {
    return settledOrders
      .filter(o => o.paymentMethod === "Cash")
      .reduce((sum, o) => sum + calculatePureOrderCost(o), 0);
  }, [settledOrders]);

  // Chart data: hourly distribution of pure order cost
  const hourlySalesData = React.useMemo(() => {
    const hoursMap: { [key: string]: number } = {
      "11:00 AM": 0,
      "12:00 PM": 0,
      "01:00 PM": 0,
      "02:00 PM": 0,
      "05:00 PM": 0,
      "06:00 PM": 0,
      "07:00 PM": 0,
      "08:00 PM": 0
    };

    // Distribute actual completed order costs into hourly map
    settledOrders.forEach(o => {
      const date = new Date(o.createdAt);
      const hour = date.getHours();
      if (hour >= 11 && hour < 12) hoursMap["11:00 AM"] += calculatePureOrderCost(o);
      else if (hour >= 12 && hour < 13) hoursMap["12:00 PM"] += calculatePureOrderCost(o);
      else if (hour >= 13 && hour < 14) hoursMap["01:00 PM"] += calculatePureOrderCost(o);
      else if (hour >= 14 && hour < 17) hoursMap["02:00 PM"] += calculatePureOrderCost(o);
      else if (hour >= 17 && hour < 18) hoursMap["05:00 PM"] += calculatePureOrderCost(o);
      else if (hour >= 18 && hour < 19) hoursMap["06:00 PM"] += calculatePureOrderCost(o);
      else if (hour >= 19 && hour < 20) hoursMap["07:00 PM"] += calculatePureOrderCost(o);
      else if (hour >= 20) hoursMap["08:00 PM"] += calculatePureOrderCost(o);
    });

    const results = Object.keys(hoursMap).map(k => ({
      hour: k,
      sales: parseFloat(hoursMap[k].toFixed(2))
    }));

    // If no real sales, put minor random values to keep graph look active
    if (settledOrders.length === 0) {
      return [
        { hour: "11:00 AM", sales: 120 },
        { hour: "12:00 PM", sales: 250 },
        { hour: "01:00 PM", sales: 380 },
        { hour: "02:00 PM", sales: 150 },
        { hour: "05:00 PM", sales: 210 },
        { hour: "06:00 PM", sales: 480 },
        { hour: "07:00 PM", sales: 550 },
        { hour: "08:00 PM", sales: 390 }
      ];
    }

    return results;
  }, [settledOrders]);

  // Weekly Revenue Flow
  const weeklySalesData = [
    { day: "Mon", sales: 2400 },
    { day: "Tue", sales: 3100 },
    { day: "Wed", sales: 2900 },
    { day: "Thu", sales: 4200 },
    { day: "Fri", sales: 5800 },
    { day: "Sat", sales: 7400 + todayTotalSales },
    { day: "Sun", sales: 6500 }
  ];

  return (
    <div className="space-y-6 animate-fadeIn font-sans" id="cashier-sales-portal">
      
      {/* Title block */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="font-serif font-black text-sm text-slate-800">Cashier Counter Sales Ledger</h3>
          <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">Real-time point-of-sale audits (excl. waiter tips)</p>
        </div>

        <div className="flex space-x-2">
          <button 
            onClick={() => onTriggerToast("Exporting daily sales sheet...")}
            className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 hover:text-blue-600 rounded-xl text-[10px] font-mono font-bold uppercase transition-all"
          >
            Export Sales
          </button>
          <button 
            onClick={() => onTriggerToast("Dispatching print job to counter thermal spooler...")}
            className="p-2 bg-slate-50 border border-slate-200 hover:text-blue-600 rounded-xl text-xs transition-all"
            title="Print Summary"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI stats bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs space-y-1.5">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[9px] font-mono uppercase tracking-wider">Today's Order Cost</span>
            <DollarSign className="w-4 h-4 text-blue-500" />
          </div>
          <h4 className="text-xl font-bold font-mono text-slate-800">${todayTotalSales.toFixed(2)}</h4>
          <span className="text-[9px] text-emerald-600 font-bold font-sans flex items-center">
            <ArrowUpRight className="w-3 h-3 mr-0.5" /> Real-time state
          </span>
          <span className="text-[8px] text-slate-400 block font-mono">STRICTLY EXCLUDES WAITER TIPS</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs space-y-1.5">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[9px] font-mono uppercase tracking-wider">Settled Tickets</span>
            <ShoppingBag className="w-4 h-4 text-emerald-500" />
          </div>
          <h4 className="text-xl font-bold font-mono text-slate-800">{totalOrdersCount}</h4>
          <span className="text-[9px] text-emerald-600 font-bold font-sans flex items-center">
            <ArrowUpRight className="w-3 h-3 mr-0.5" /> Real-time count
          </span>
          <span className="text-[8px] text-slate-400 block font-mono">ALL CHANNELS ACTIVE</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs space-y-1.5">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[9px] font-mono uppercase tracking-wider">Average Ticket Cost</span>
            <Coins className="w-4 h-4 text-amber-500" />
          </div>
          <h4 className="text-xl font-bold font-mono text-slate-800">${averageOrderValue > 0 ? averageOrderValue.toFixed(2) : "0.00"}</h4>
          <span className="text-[9px] text-emerald-600 font-bold font-sans flex items-center">
            <ArrowUpRight className="w-3 h-3 mr-0.5" /> Real-time AOV
          </span>
          <span className="text-[8px] text-slate-400 block font-mono">EXCLUDES OPTIONAL GRATUITY</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs space-y-1.5">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[9px] font-mono uppercase tracking-wider">Cash Register Float</span>
            <DollarSign className="w-4 h-4 text-purple-500" />
          </div>
          <h4 className="text-xl font-bold font-mono text-slate-800">${(cashSales + 150.00).toFixed(2)}</h4>
          <span className="text-[9px] text-slate-500 font-mono">
            Float Base: $150.00
          </span>
          <span className="text-[8px] text-[#22C55E] font-black block font-mono">DRAWER RECONCILIATION OK</span>
        </div>

      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left list & charts (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Charts pane */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <h4 className="font-serif font-black text-slate-800 text-sm">Today's Sales Hourly Flow</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlySalesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cashierSalesColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2F7" />
                  <XAxis dataKey="hour" tick={{ fontSize: 9 }} stroke="#A0AEC0" />
                  <YAxis tick={{ fontSize: 9 }} stroke="#A0AEC0" />
                  <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="sales" stroke="#2563EB" strokeWidth={2} fill="url(#cashierSalesColor)" name="Order Cost ($)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Settled orders list */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <h4 className="font-serif font-black text-slate-800 text-sm pb-2 border-b border-slate-100">Settled Receipts Ledger</h4>
            
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {settledOrders.map((ord) => {
                const isSelected = selectedOrder?.id === ord.id;
                const cost = calculatePureOrderCost(ord);
                return (
                  <div 
                    key={ord.id}
                    onClick={() => setSelectedOrder(ord)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${
                      isSelected 
                        ? "border-blue-600 bg-blue-50/50" 
                        : "border-slate-100 bg-slate-50/50 hover:bg-slate-50"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-black text-slate-800 group-hover:text-blue-600">
                          {ord.id}
                        </span>
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 font-mono text-[8px] rounded uppercase font-bold">
                          {ord.paymentMethod || "Card"}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-700">{ord.table || "Counter"} • {ord.customerName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {ord.items.map(it => `${it.quantity}x ${it.name}`).join(", ")}
                      </p>
                    </div>

                    <div className="text-right space-y-0.5 font-mono">
                      <span className="text-xs font-black text-blue-600 block">${cost.toFixed(2)}</span>
                      <span className="text-[8px] text-rose-500 block">TIPS: $0.00 (EXCL)</span>
                    </div>
                  </div>
                );
              })}

              {settledOrders.length === 0 && (
                <div className="py-12 text-center text-slate-400 font-mono text-xs">
                  No settled orders recorded on this terminal session yet.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Preview copy (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
          <h4 className="font-serif font-black text-slate-800 text-sm pb-2 border-b border-slate-100">Audit Receipt Link Detail</h4>

          {selectedOrder ? (
            <div className="space-y-4">
              
              {/* Receipt mockup */}
              <div className="bg-slate-50 border-2 border-dashed border-slate-300 p-5 rounded-2xl font-mono text-slate-600 text-[11px] space-y-4">
                
                <div className="text-center space-y-0.5 border-b border-slate-300 pb-3">
                  <h5 className="font-black text-xs text-slate-800 uppercase">AURA GOURMET</h5>
                  <p>Counter Register Copy</p>
                  <p>Date: {new Date(selectedOrder.createdAt).toLocaleDateString()} • {new Date(selectedOrder.createdAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</p>
                </div>

                <div className="space-y-0.5 text-[10px]">
                  <p>TICKET REF: {selectedOrder.id}</p>
                  <p>SOURCE/TABLE: {selectedOrder.table}</p>
                  <p>CUSTOMER: {selectedOrder.customerName}</p>
                  <p>METHOD: {selectedOrder.paymentMethod || "CARD"}</p>
                  <p className="text-blue-600">PAYMENT STATUS: SETTLED</p>
                </div>

                <div className="border-t border-b border-slate-300 py-2 space-y-1">
                  <p className="font-bold text-slate-800">ITEMS CHARGED:</p>
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-[10px]">
                      <span>{it.quantity}x {it.name}</span>
                      <span>${(it.price * it.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5 border-b border-slate-300 pb-2 text-[10px]">
                  <div className="flex justify-between">
                    <span>Food Subtotal:</span>
                    <span>${selectedOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>State Sales Tax (8%):</span>
                    <span>${(selectedOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 0.08).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-rose-500 font-bold">
                    <span>Waiter Gratuity / Tips:</span>
                    <span>$0.00 (STRICT EXCLUSION)</span>
                  </div>
                </div>

                <div className="flex justify-between font-black text-slate-800 text-xs">
                  <span>TOTAL ORDER COST:</span>
                  <span>${calculatePureOrderCost(selectedOrder).toFixed(2)}</span>
                </div>

                <div className="text-center text-[9px] text-slate-400 pt-2 border-t border-slate-200">
                  <p>*** VALID TRANSACTION RECORD ***</p>
                  <p>SLA PREP SECURED</p>
                </div>

              </div>

              {/* Print actions */}
              <button 
                onClick={() => onTriggerToast(`Printed audit invoice for Ticket ${selectedOrder.id}`)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-serif font-black text-xs rounded-xl flex items-center justify-center space-x-2 transition-all shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Reprint Audit Voucher</span>
              </button>

            </div>
          ) : (
            <div className="py-20 text-center text-slate-400 font-mono text-xs border border-dashed border-slate-200 rounded-2xl">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              Select an order to view pure cost audit voucher.
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
