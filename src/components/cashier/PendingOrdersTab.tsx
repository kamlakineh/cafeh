import React from "react";
import { 
  Star, Clock, AlertCircle, CheckCircle, XCircle, Search, 
  MapPin, HelpCircle, ArrowRight, Play, Check, RefreshCw
} from "lucide-react";
import { Order } from "../../types";

interface PendingOrdersTabProps {
  orders: Order[];
  onUpdateOrderStatus: (id: string, status: Order['status'], extra?: Partial<Order>) => void;
  onTriggerToast: (msg: string) => void;
}

export default function PendingOrdersTab({
  orders,
  onUpdateOrderStatus,
  onTriggerToast
}: PendingOrdersTabProps) {
  
  const [starFlagged, setStarFlagged] = React.useState<string[]>([]);
  const [elapsedTimes, setElapsedTimes] = React.useState<Record<string, number>>({});

  // Simulation of waiting times elapsed since order receipt
  React.useEffect(() => {
    // Initial times
    const initial: Record<string, number> = {};
    orders.forEach((o, idx) => {
      initial[o.id] = (idx * 90) + 120; // 2 minutes to 7 minutes back
    });
    setElapsedTimes(initial);

    const interval = setInterval(() => {
      setElapsedTimes(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(key => {
          next[key] = (next[key] || 0) + 1;
        });
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [orders]);

  const toggleStar = (id: string) => {
    if (starFlagged.includes(id)) {
      setStarFlagged(starFlagged.filter(x => x !== id));
      onTriggerToast(`Priority flag removed from Order ${id}.`);
    } else {
      setStarFlagged([...starFlagged, id]);
      onTriggerToast(`Priority flag set for Order ${id}!`);
    }
  };

  const formatElapsed = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}m ${secs < 10 ? "0" : ""}${secs}s`;
  };

  const handleAccept = (id: string) => {
    onUpdateOrderStatus(id, "Accepted");
    onTriggerToast(`Approved order ${id}! Sent to kitchen workflow.`);
  };

  const handleReject = (id: string) => {
    onUpdateOrderStatus(id, "Completed", { paymentStatus: "Refunded" });
    onTriggerToast(`Cancelled/Rejected order ${id}.`);
  };

  // Keep pending/accepted orders for visualization
  const activeQueue = orders.filter(o => o.status === "Pending" || o.status === "Accepted");

  // Sort queue so star flagged orders bubble to top
  const sortedQueue = [...activeQueue].sort((a, b) => {
    const aStarred = starFlagged.includes(a.id) ? 1 : 0;
    const bStarred = starFlagged.includes(b.id) ? 1 : 0;
    return bStarred - aStarred;
  });

  return (
    <div className="space-y-6" id="pending-orders-kanban-board">
      
      {/* Kanban Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-serif font-black text-sm text-slate-800">Pending & accepted dispatch queue</h3>
          <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">SLA waiting metrics (critical thresholds at 5:00)</p>
        </div>

        <div className="flex space-x-4 text-xs font-mono">
          <div className="flex items-center space-x-1.5 text-slate-500">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <span>Pending ({orders.filter(o => o.status === 'Pending').length})</span>
          </div>
          <div className="flex items-center space-x-1.5 text-slate-500">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>Accepted ({orders.filter(o => o.status === 'Accepted').length})</span>
          </div>
        </div>
      </div>

      {/* Grid of Pending Columns (Kanban Style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Column 1: Awaiting Acceptance (Pending status) */}
        <div className="space-y-4">
          <div className="p-3 bg-slate-100 rounded-xl flex justify-between items-center">
            <span className="font-mono text-xs font-bold uppercase text-slate-600 flex items-center">
              <Clock className="w-4 h-4 mr-1.5 text-amber-500 animate-pulse" />
              <span>Awaiting acceptance</span>
            </span>
            <span className="bg-white px-2 py-0.5 rounded-lg text-[10px] font-mono text-slate-500">
              {orders.filter(o => o.status === "Pending").length} Orders
            </span>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
            {orders.filter(o => o.status === "Pending").map(o => {
              const sec = elapsedTimes[o.id] || 60;
              const isOvertime = sec >= 300; // 5 minutes threshold
              const isStarred = starFlagged.includes(o.id);

              return (
                <div 
                  key={o.id}
                  className={`bg-white p-4 rounded-2xl border transition-all hover:shadow-md space-y-3 relative ${
                    isOvertime ? "border-rose-400 bg-rose-50/10" : "border-slate-100"
                  }`}
                >
                  {/* Top: Star Priority and Order title */}
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-mono font-bold text-slate-800 text-xs">{o.id}</h4>
                        <span className="px-2 py-0.2 bg-slate-50 border border-slate-150 text-[8px] rounded uppercase font-mono">
                          {o.type}
                        </span>
                      </div>
                      <p className="font-sans font-bold text-slate-700 text-xs mt-0.5">{o.customerName}</p>
                    </div>

                    <button 
                      onClick={() => toggleStar(o.id)}
                      className={`p-1 rounded-full transition-colors ${
                        isStarred ? "text-[#D4AF37] bg-amber-50" : "text-slate-300 hover:text-[#D4AF37]"
                      }`}
                    >
                      <Star className={`w-4 h-4 ${isStarred ? "fill-[#D4AF37]" : ""}`} />
                    </button>
                  </div>

                  {/* Items List */}
                  <div className="text-[11px] font-mono text-slate-500 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {o.items.map((it, idx) => (
                      <div key={`pending-${o.id}-${it.id || it.name}-${idx}`} className="flex justify-between">
                        <span>{it.name} x {it.quantity}</span>
                        <span>${it.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Time Waiting Indicators */}
                  <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                    <div className="flex items-center space-x-1.5 text-[10px] font-mono">
                      <Clock className={`w-3.5 h-3.5 ${isOvertime ? "text-rose-600 animate-spin" : "text-slate-400"}`} />
                      <span className={isOvertime ? "text-rose-600 font-bold" : "text-slate-500"}>
                        Elapsed: {formatElapsed(sec)}
                      </span>
                    </div>

                    <div className="flex space-x-1.5">
                      <button 
                        onClick={() => handleReject(o.id)}
                        className="px-2.5 py-1.5 bg-rose-50 text-rose-600 font-mono text-[9px] font-bold rounded-lg border border-rose-100 hover:bg-rose-100 transition-colors"
                      >
                        REJECT
                      </button>

                      <button 
                        onClick={() => handleAccept(o.id)}
                        className="px-2.5 py-1.5 bg-emerald-600 text-white font-mono text-[9px] font-bold rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>ACCEPT</span>
                      </button>
                    </div>
                  </div>

                  {/* Red indicator banner for late orders */}
                  {isOvertime && (
                    <div className="absolute top-2 right-12 bg-rose-600 text-white text-[8px] font-mono px-1.5 rounded uppercase animate-pulse font-bold">
                      SLA DELAY WARNING
                    </div>
                  )}

                </div>
              );
            })}

            {orders.filter(o => o.status === "Pending").length === 0 && (
              <div className="py-12 text-center text-slate-400 font-mono text-[11px] border border-dashed border-slate-200 rounded-xl bg-slate-50">
                No tickets waiting in acceptance queue.
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Accepted & Undergoing Prep */}
        <div className="space-y-4">
          <div className="p-3 bg-slate-100 rounded-xl flex justify-between items-center">
            <span className="font-mono text-xs font-bold uppercase text-slate-600 flex items-center">
              <Play className="w-4 h-4 mr-1.5 text-blue-500 animate-pulse" />
              <span>Accepted & active in kitchen</span>
            </span>
            <span className="bg-white px-2 py-0.5 rounded-lg text-[10px] font-mono text-slate-500">
              {orders.filter(o => o.status === "Accepted").length} Orders
            </span>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
            {orders.filter(o => o.status === "Accepted").map(o => {
              const sec = elapsedTimes[o.id] || 150;
              const isStarred = starFlagged.includes(o.id);

              return (
                <div 
                  key={o.id}
                  className="bg-white p-4 rounded-2xl border border-slate-100 transition-all hover:shadow-md space-y-3 relative"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-mono font-bold text-slate-800 text-xs">{o.id}</h4>
                        <span className="px-2 py-0.2 bg-slate-50 border border-slate-150 text-[8px] rounded uppercase font-mono">
                          {o.type}
                        </span>
                      </div>
                      <p className="font-sans font-bold text-slate-700 text-xs mt-0.5">{o.customerName}</p>
                    </div>

                    <button 
                      onClick={() => toggleStar(o.id)}
                      className={`p-1 rounded-full transition-colors ${
                        isStarred ? "text-[#D4AF37] bg-amber-50" : "text-slate-300 hover:text-[#D4AF37]"
                      }`}
                    >
                      <Star className={`w-4 h-4 ${isStarred ? "fill-[#D4AF37]" : ""}`} />
                    </button>
                  </div>

                  {/* Items List */}
                  <div className="text-[11px] font-mono text-slate-500 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {o.items.map((it, idx) => (
                      <div key={`accepted-${o.id}-${it.id || it.name}-${idx}`} className="flex justify-between">
                        <span>{it.name} x {it.quantity}</span>
                        <span>${it.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                    <span className="text-[10px] font-mono text-slate-400">
                      Dispatched to kitchen grill
                    </span>

                    <button 
                      onClick={() => {
                        onUpdateOrderStatus(o.id, "Ready");
                        onTriggerToast(`Marked Order ${o.id} as ready for pickup!`);
                      }}
                      className="px-3 py-1.5 bg-[#2B6CB0] text-white font-mono text-[9px] font-bold rounded-lg hover:bg-blue-700 transition-colors uppercase flex items-center space-x-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Ready for Handover</span>
                    </button>
                  </div>

                </div>
              );
            })}

            {orders.filter(o => o.status === "Accepted").length === 0 && (
              <div className="py-12 text-center text-slate-400 font-mono text-[11px] border border-dashed border-slate-200 rounded-xl bg-slate-50">
                No accepted orders currently in preparation.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
