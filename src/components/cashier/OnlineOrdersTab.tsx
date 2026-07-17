import React from "react";
import { 
  Check, X, RefreshCw, Printer, UserPlus, Sliders, Volume2, 
  VolumeX, HelpCircle, ArrowUpDown, ChevronDown, CheckCircle, Search
} from "lucide-react";
import { Order } from "../../types";

interface OnlineOrdersTabProps {
  orders: Order[];
  onUpdateOrderStatus: (id: string, status: Order['status'], extra?: Partial<Order>) => void;
  onTriggerToast: (msg: string) => void;
}

export default function OnlineOrdersTab({
  orders,
  onUpdateOrderStatus,
  onTriggerToast
}: OnlineOrdersTabProps) {
  
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const [filterType, setFilterType] = React.useState<"All" | "Pickup">("All");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [autoRefreshSecs, setAutoRefreshSecs] = React.useState(10);
  const [soundActivePulse, setSoundActivePulse] = React.useState(false);

  // Filter online/delivery orders
  const onlineOrders = orders.filter(o => o.type === "Delivery" || o.type === "Pickup");

  // Simulated chime triggered on auto refresh
  React.useEffect(() => {
    const timer = setInterval(() => {
      setAutoRefreshSecs(prev => {
        if (prev <= 1) {
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const prevSecsRef = React.useRef(autoRefreshSecs);
  React.useEffect(() => {
    if (autoRefreshSecs === 10 && prevSecsRef.current === 1) {
      if (soundEnabled) {
        setSoundActivePulse(true);
        const pulseTimer = setTimeout(() => setSoundActivePulse(false), 800);
        onTriggerToast("Simulated Chime: 1 new cloud order synchronized from API.");
        return () => clearTimeout(pulseTimer);
      }
    }
    prevSecsRef.current = autoRefreshSecs;
  }, [autoRefreshSecs, soundEnabled, onTriggerToast]);

  const handleAccept = (id: string) => {
    onUpdateOrderStatus(id, "Accepted");
    onTriggerToast(`Accepted Cloud Order ${id}! Dispatched to prep team and receipt prepared.`);
  };

  const handleReject = (id: string) => {
    onUpdateOrderStatus(id, "Completed", { paymentStatus: "Refunded" });
    onTriggerToast(`Dismissed & marked Order ${id} as Refunded.`);
  };

  const handlePrint = (id: string) => {
    const order = orders.find(o => o.id === id);
    if (order && order.status === "Pending") {
      onTriggerToast(`[Blocked] Cannot print receipt/dispatch voucher for unaccepted online orders. Accept the order first.`);
      return;
    }
    onTriggerToast(`Thermal dispatch voucher queued for print job ID #${id}.`);
  };

  const handleAssignCourier = (id: string) => {
    onTriggerToast(`Assigning nearest courier dispatch to Order ${id}...`);
  };

  const filtered = onlineOrders.filter(o => {
    if (filterType !== "All" && o.type !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6" id="online-orders-pos-tab">
      
      {/* Table Banner Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-50 pb-4">
        <div>
          <h3 className="font-serif font-black text-sm text-slate-800">Incoming online cloud orders</h3>
          <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">Live background polling synced via socket</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sound Toggle */}
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border flex items-center space-x-1.5 text-xs transition-all ${
              soundEnabled 
                ? "bg-amber-50 border-[#D4AF37] text-amber-800 font-bold" 
                : "bg-slate-50 border-slate-200 text-slate-400"
            }`}
          >
            {soundEnabled ? (
              <>
                <Volume2 className={`w-4 h-4 ${soundActivePulse ? "animate-bounce" : ""}`} />
                <span className="text-[10px] font-mono">Sound ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4" />
                <span className="text-[10px] font-mono">Chime Muted</span>
              </>
            )}
          </button>

          {/* Sync Timer display */}
          <div className="bg-slate-900 text-white font-mono text-[10px] py-2 px-3 rounded-xl flex items-center space-x-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>SYNCING IN {autoRefreshSecs}S</span>
          </div>
        </div>
      </div>

      {/* Filter and Search parameters */}
      <div className="flex flex-col md:flex-row justify-between gap-4 text-xs">
        <div className="flex bg-slate-50 border border-slate-150 p-1 rounded-xl">
          {(["All", "Pickup"] as any).map((f: string) => (
            <button
              key={f}
              onClick={() => setFilterType(f as any)}
              className={`px-4 py-1.5 rounded-lg font-serif transition-colors ${
                filterType === f 
                  ? "bg-white text-slate-900 font-bold shadow-xs" 
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Filter by Order ID or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 outline-none"
          />
        </div>
      </div>

      {/* Online orders table list */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-400 font-mono border-b border-slate-100">
            <tr>
              <th className="p-3 uppercase">Order #</th>
              <th className="p-3 uppercase">Customer</th>
              <th className="p-3 uppercase">Time Received</th>
              <th className="p-3 uppercase">Payment Mode</th>
              <th className="p-3 uppercase">Workflow Status</th>
              <th className="p-3 uppercase">Branch</th>
              <th className="p-3 uppercase">Method</th>
              <th className="p-3 uppercase">Total</th>
              <th className="p-3 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-600">
            {filtered.map(o => (
              <tr key={o.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="p-3 font-mono font-bold text-slate-800 group-hover:text-[#D4AF37]">{o.id}</td>
                <td className="p-3 font-sans font-semibold text-slate-700">{o.customerName}</td>
                <td className="p-3 font-mono text-[11px]">{o.createdAt ? new Date(o.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "02:08 AM"}</td>
                <td className="p-3 font-mono">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    o.paymentStatus === "Paid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {o.paymentStatus}
                  </span>
                </td>
                <td className="p-3 font-mono">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    o.status === "Pending" ? "bg-yellow-100 text-amber-800 animate-pulse border border-yellow-200" : "bg-blue-100 text-blue-800"
                  }`}>
                    {o.status}
                  </span>
                </td>
                <td className="p-3">Manhattan Central</td>
                <td className="p-3 font-mono text-[#2B6CB0]">{o.type}</td>
                <td className="p-3 font-mono font-black text-slate-800">${o.total.toFixed(2)}</td>
                <td className="p-3 text-right space-x-1">
                  {o.status === "Pending" ? (
                    <>
                      <button 
                        onClick={() => handleAccept(o.id)}
                        className="p-1.5 rounded-lg bg-green-50 text-green-600 border border-green-100 hover:bg-green-600 hover:text-white"
                        title="Accept Order"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      
                      <button 
                        onClick={() => handleReject(o.id)}
                        className="p-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-600 hover:text-white"
                        title="Reject Order"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-400">Accepted</span>
                  )}

                  <button 
                    onClick={() => handlePrint(o.id)}
                    className={`p-1.5 rounded-lg border transition-all ${
                      o.status === "Pending"
                        ? "bg-slate-50/50 text-slate-300 border-slate-100 cursor-not-allowed"
                        : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100 hover:text-slate-800"
                    }`}
                    title={o.status === "Pending" ? "Accept order first to prepare receipt" : "Print Dispatch Ticket"}
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>

                  <button 
                    onClick={() => handleAssignCourier(o.id)}
                    className="p-1.5 rounded-lg bg-slate-50 text-slate-400 border border-slate-200 hover:bg-blue-50 hover:text-blue-600"
                    title="Assign Courier"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-12 text-slate-400 font-mono">
                  No online cloud orders currently waiting.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
