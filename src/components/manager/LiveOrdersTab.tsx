import React from "react";
import { 
  Star, MessageCircle, AlertCircle, XCircle, UserPlus, ShieldAlert, 
  Sparkles, Radio, RefreshCw, Eye, ChevronRight, Zap
} from "lucide-react";
import { Order, Employee } from "../../types";

interface LiveOrdersTabProps {
  orders: Order[];
  employees: Employee[];
  onUpdateOrderStatus: (id: string, status: Order["status"], extra?: Partial<Order>) => void;
}

export default function LiveOrdersTab({
  orders,
  employees,
  onUpdateOrderStatus
}: LiveOrdersTabProps) {
  
  // Local active order view modal
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);
  const [isWebSocketActive, setIsWebSocketActive] = React.useState(true);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Simulated WebSocket auto-update
  React.useEffect(() => {
    if (!isWebSocketActive) return;

    const interval = setInterval(() => {
      // Pick a random order that is not completed and progress its status
      const eligibleOrders = orders.filter(o => o.status !== "Completed");
      if (eligibleOrders.length === 0) return;

      const randomOrder = eligibleOrders[Math.floor(Math.random() * eligibleOrders.length)];
      
      let nextStatus: Order["status"] = randomOrder.status;
      if (randomOrder.status === "Pending") nextStatus = "Accepted";
      else if (randomOrder.status === "Accepted") nextStatus = "Preparing";
      else if (randomOrder.status === "Preparing") nextStatus = "Cooking";
      else if (randomOrder.status === "Cooking") nextStatus = "Ready";
      else if (randomOrder.status === "Ready") nextStatus = "Completed";

      if (nextStatus !== randomOrder.status) {
        onUpdateOrderStatus(randomOrder.id, nextStatus);
        showToast(`WebSocket Alert: Order ${randomOrder.id} progressed to ${nextStatus}!`);
      }
    }, 15000); // Progress an order every 15 seconds

    return () => clearInterval(interval);
  }, [isWebSocketActive, orders, onUpdateOrderStatus]);

  // Color mappings
  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "Pending": return "bg-amber-100 text-amber-700 border-amber-200";
      case "Accepted": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Preparing": return "bg-orange-100 text-orange-700 border-orange-200";
      case "Cooking": return "bg-red-100 text-red-700 border-red-200";
      case "Ready": return "bg-green-100 text-green-700 border-green-200";
      case "Completed": return "bg-slate-150 text-slate-700 border-slate-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const togglePriority = (ord: Order) => {
    onUpdateOrderStatus(ord.id, ord.status, { priority: !ord.priority });
    showToast(`Order ${ord.id} priority changed!`);
  };

  const handleAssignChef = (orderId: string, chefName: string) => {
    onUpdateOrderStatus(orderId, orders.find(o => o.id === orderId)?.status || "Pending", { chef: chefName });
    showToast(`Assigned ${chefName} to Order ${orderId}!`);
  };

  const handleEscalate = (orderId: string) => {
    onUpdateOrderStatus(orderId, "Delayed", { delayReason: "SLA Kitchen BottleNeck" });
    showToast(`Escalated Order ${orderId} to executive backlog!`);
  };

  const handleCancelOrder = (orderId: string) => {
    onUpdateOrderStatus(orderId, "Pending", { notes: "Canceled by Manager David" });
    showToast(`Canceled order ${orderId} request.`);
  };

  return (
    <div className="space-y-6" id="manager-live-orders-page">
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 bg-slate-900 text-white text-xs font-mono py-3 px-5 rounded-xl shadow-2xl z-50 animate-fadeIn flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* WebSocket Header & Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Radio className={`w-5 h-5 ${isWebSocketActive ? "text-green-500 animate-pulse" : "text-slate-400"}`} />
            {isWebSocketActive && (
              <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
            )}
          </div>
          <div>
            <h3 className="font-serif font-black text-sm text-slate-800">WebSocket Live Dispatch</h3>
            <p className="text-[10px] font-mono text-slate-400">
              {isWebSocketActive ? "ACTIVE CONNECTION • STREAMING CLIENT" : "CONNECTION PAUSED"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-slate-500">Live Update Simulator</span>
            <button
              onClick={() => setIsWebSocketActive(!isWebSocketActive)}
              className={`w-10 h-6 rounded-full p-1 transition-all ${isWebSocketActive ? "bg-green-500 text-right" : "bg-slate-300 text-left"}`}
            >
              <div className="w-4 h-4 bg-white rounded-full shadow-sm" style={{ transform: isWebSocketActive ? "translateX(16px)" : "translateX(0)" }} />
            </button>
          </div>

          <button
            onClick={() => showToast("Database synchronization forced successfully!")}
            className="p-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg hover:text-[#2B6CB0] hover:border-[#2B6CB0] transition-all text-xs font-mono flex items-center space-x-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Force Sync</span>
          </button>
        </div>
      </div>

      {/* Main Full-Screen Table Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-none">
            <thead className="bg-slate-50 font-mono text-slate-400 border-b border-slate-100">
              <tr>
                <th className="p-3.5 uppercase">Order ID</th>
                <th className="p-3.5 uppercase">Customer</th>
                <th className="p-3.5 uppercase">Type</th>
                <th className="p-3.5 uppercase">Branch</th>
                <th className="p-3.5 uppercase text-center">Status</th>
                <th className="p-3.5 uppercase">Assigned Staff</th>
                <th className="p-3.5 uppercase">Kitchen Progress</th>
                <th className="p-3.5 uppercase">Delivery Status</th>
                <th className="p-3.5 uppercase text-right">Total Bill</th>
                <th className="p-3.5 uppercase text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {orders.map((ord) => {
                // Calculate progress bar percent based on status
                let progressPercent = 0;
                if (ord.status === "Accepted") progressPercent = 20;
                else if (ord.status === "Preparing") progressPercent = 45;
                else if (ord.status === "Cooking") progressPercent = 75;
                else if (ord.status === "Ready") progressPercent = 90;
                else if (ord.status === "Completed") progressPercent = 100;

                return (
                  <tr key={ord.id} className="hover:bg-slate-50/50 transition-colors">
                    
                    {/* ID */}
                    <td className="p-3.5 font-mono font-black text-slate-800 flex items-center space-x-1">
                      <span>{ord.id}</span>
                      {ord.priority && (
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-current animate-pulse" />
                      )}
                    </td>

                    {/* Customer */}
                    <td className="p-3.5 font-sans font-bold text-slate-700">{ord.customerName}</td>

                    {/* Type */}
                    <td className="p-3.5 uppercase font-mono text-[9px] font-black tracking-wider text-slate-400">
                      {ord.type}
                    </td>

                    {/* Branch */}
                    <td className="p-3.5 font-sans font-medium text-slate-600">Manhattan Salon #1</td>

                    {/* Status badge */}
                    <td className="p-3.5 text-center">
                      <span className={`px-2.5 py-1 rounded-full font-mono text-[10px] font-bold border ${getStatusBadge(ord.status)}`}>
                        {ord.status}
                      </span>
                    </td>

                    {/* Assigned Employee */}
                    <td className="p-3.5">
                      <select
                        value={ord.chef || ""}
                        onChange={(e) => handleAssignChef(ord.id, e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg text-xs p-1 outline-none font-sans max-w-[120px]"
                      >
                        <option value="">Auto-assigned</option>
                        {employees.filter(e => e.status === "On duty").map((emp) => (
                          <option key={emp.id} value={emp.name}>{emp.name}</option>
                        ))}
                      </select>
                    </td>

                    {/* Kitchen Progress */}
                    <td className="p-3.5">
                      <div className="space-y-1 max-w-[120px]">
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${ord.status === "Delayed" ? "bg-red-500" : "bg-blue-600"}`} 
                            style={{ width: `${progressPercent}%` }} 
                          />
                        </div>
                        <span className="text-[9px] font-mono text-slate-400">{progressPercent}% done</span>
                      </div>
                    </td>

                    {/* Delivery Status */}
                    <td className="p-3.5">
                      {ord.type === "Delivery" ? (
                        <span className="text-[10px] font-mono bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-bold uppercase">
                          {ord.status === "Completed" ? "DELIVERED" : ord.status === "Ready" ? "READY FOR PICKUP" : "TRANSIT PREP"}
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400">N/A (Dine-in)</span>
                      )}
                    </td>

                    {/* Total */}
                    <td className="p-3.5 text-right font-mono font-black text-slate-800">${ord.total.toFixed(2)}</td>

                    {/* Actions row */}
                    <td className="p-3.5">
                      <div className="flex justify-center items-center space-x-1.5">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-all"
                          title="View order details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => togglePriority(ord)}
                          className={`p-1.5 rounded-lg transition-all border ${
                            ord.priority 
                              ? "bg-amber-100 border-amber-300 text-amber-600 hover:bg-amber-200" 
                              : "bg-slate-100 border-transparent text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                          }`}
                          title="Toggle High Priority"
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </button>

                        <button
                          onClick={() => handleEscalate(ord.id)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 rounded-lg transition-all"
                          title="Escalate delay issues"
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleCancelOrder(ord.id)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-500 rounded-lg transition-all"
                          title="Cancel Order Request"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-slate-400 font-mono">
                    No order dispatches active in queue.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal Panel */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-100 max-w-lg w-full p-6 shadow-2xl animate-scaleUp space-y-6">
            
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-serif font-black text-slate-800 text-lg flex items-center space-x-2">
                  <span>Order Details: {selectedOrder.id}</span>
                  {selectedOrder.priority && (
                    <span className="text-[9px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-mono font-bold animate-pulse">
                      PRIORITY STAR
                    </span>
                  )}
                </h4>
                <p className="text-xs text-slate-400 font-mono mt-0.5">Customer: {selectedOrder.customerName} • Table: {selectedOrder.table}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="text-xs text-slate-400 hover:text-[#2B6CB0] font-mono font-black"
              >
                [Close]
              </button>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="font-mono text-slate-400 uppercase py-2 font-bold">Menu Items Selected</div>
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-2.5">
                  <div className="font-sans font-semibold text-slate-700">
                    {item.quantity}x {item.name}
                    {item.customizations.length > 0 && (
                      <span className="block text-[10px] text-slate-400 font-normal">Customs: {item.customizations.join(", ")}</span>
                    )}
                  </div>
                  <span className="font-mono font-bold text-slate-800">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100 text-xs">
              <div className="flex justify-between py-1 text-slate-600">
                <span>Payment Status:</span>
                <span className="font-mono font-bold text-slate-800 uppercase text-[10px]">{selectedOrder.paymentStatus}</span>
              </div>
              <div className="flex justify-between py-1 text-slate-600">
                <span>Method Chosen:</span>
                <span className="font-mono font-bold text-slate-800">{selectedOrder.paymentMethod || "Direct Mobile Cashier"}</span>
              </div>
              <div className="flex justify-between py-1 text-slate-800 font-black border-t border-slate-200 pt-2 text-sm">
                <span>Grand Total Bill:</span>
                <span className="font-mono text-[#2B6CB0]">${selectedOrder.total.toFixed(2)}</span>
              </div>
            </div>

            {selectedOrder.notes && (
              <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg text-xs font-sans text-slate-600 italic">
                Notes: "{selectedOrder.notes}"
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => {
                  setSelectedOrder(null);
                  showToast("Staff members notified via digital terminal pager!");
                }}
                className="px-4 py-2 bg-[#2B6CB0] text-white hover:bg-[#1D4ED8] transition-colors rounded-xl text-xs font-mono font-black"
              >
                Page Assignee
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
