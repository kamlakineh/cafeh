import React from "react";
import { 
  Search, Printer, Mail, Clock, ShieldCheck, 
  CheckCircle2, FileText, ChevronRight, UserCheck, Check, AlertCircle, Sparkles
} from "lucide-react";
import { Order } from "../../types";

interface ReceiptsTabProps {
  orders: Order[];
  onUpdateOrderStatus: (id: string, status: Order['status'], extra?: Partial<Order>) => void;
  onTriggerToast: (msg: string) => void;
}

interface PastReceipt {
  id: string;
  orderId: string;
  customer: string;
  time: string;
  method: string;
  total: number;
  itemsSummary: string;
  status: string;
  paymentStatus: string;
  table: string;
  type: string;
  rawOrder?: Order;
}

export default function ReceiptsTab({
  orders,
  onUpdateOrderStatus,
  onTriggerToast
}: ReceiptsTabProps) {
  
  // Archival mock receipts for demo purposes
  const [staticReceipts] = React.useState<PastReceipt[]>([
    { id: "REC-942", orderId: "ORD-930", customer: "Sarah Johnson", time: "01:45 AM", method: "Card", total: 58.20, itemsSummary: "1x Truffle Wagyu, 2x Large Fries", status: "Completed", paymentStatus: "Paid", table: "Table 4", type: "Dine-in" },
    { id: "REC-941", orderId: "ORD-928", customer: "Liam Carter", time: "01:20 AM", method: "Cash", total: 24.99, itemsSummary: "1x Truffle Wagyu Burger", status: "Completed", paymentStatus: "Paid", table: "Table 1", type: "Dine-in" },
    { id: "REC-940", orderId: "ORD-925", customer: "Michael Vance", time: "12:50 AM", method: "Wallet", total: 112.90, itemsSummary: "2x Spicy Crispy Chicken, 4x Beer Pitchers", status: "Completed", paymentStatus: "Paid", table: "Table 8", type: "Dine-in" },
    { id: "REC-939", orderId: "ORD-920", customer: "Evelyn Monroe", time: "12:05 AM", method: "Card", total: 19.50, itemsSummary: "1x Avocado Plant-Based Burger", status: "Completed", paymentStatus: "Paid", table: "Online Pickup", type: "Pickup" },
    { id: "REC-938", orderId: "ORD-915", customer: "Guest", time: "11:30 PM", method: "Cash", total: 31.98, itemsSummary: "2x Cheeseburger Sliders", status: "Completed", paymentStatus: "Paid", table: "Table 3", type: "Dine-in" }
  ]);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [emailInput, setEmailInput] = React.useState("");
  const [activeSubTab, setActiveSubTab] = React.useState<"approvals" | "ledger">("approvals");

  // Transform active orders into receipts structure
  const liveReceipts = React.useMemo<PastReceipt[]>(() => {
    return orders
      .filter(ord => {
        // If it's an online order (Delivery or Pickup), only prepare receipt once accepted/cooking (status is not Pending)
        if (ord.type === "Delivery" || ord.type === "Pickup") {
          return ord.status !== "Pending";
        }
        // Waiter / dine-in / walk-in orders are prepared instantly in real-time
        return true;
      })
      .map(ord => ({
        id: `REC-${ord.id.replace("ORD-", "")}`,
        orderId: ord.id,
        customer: ord.customerName || ord.table,
        time: new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        method: ord.paymentMethod || "Card",
        total: ord.total,
        itemsSummary: ord.items.map(i => `${i.quantity}x ${i.name}`).join(", "),
        status: ord.status,
        paymentStatus: ord.paymentStatus,
        table: ord.table,
        type: ord.type,
        rawOrder: ord
      }));
  }, [orders]);

  // Filter orders needing cashier approval
  const pendingApprovals = React.useMemo(() => {
    return liveReceipts.filter(r => r.paymentStatus === "Pending Approval");
  }, [liveReceipts]);

  // Combine live settled receipts and static mock database
  const settledReceipts = React.useMemo(() => {
    const liveSettled = liveReceipts.filter(r => r.paymentStatus === "Paid" || r.paymentStatus === "Refunded");
    return [...liveSettled, ...staticReceipts];
  }, [liveReceipts, staticReceipts]);

  const [selectedReceipt, setSelectedReceipt] = React.useState<PastReceipt | null>(null);

  // Sync selected receipt when subtab transitions
  React.useEffect(() => {
    if (activeSubTab === "approvals") {
      if (pendingApprovals.length > 0) {
        setSelectedReceipt(pendingApprovals[0]);
      } else {
        setSelectedReceipt(null);
      }
    } else {
      if (settledReceipts.length > 0) {
        setSelectedReceipt(settledReceipts[0]);
      } else {
        setSelectedReceipt(null);
      }
    }
  }, [activeSubTab, pendingApprovals.length, settledReceipts.length]);

  const handleApprovePayment = (receipt: PastReceipt) => {
    onUpdateOrderStatus(receipt.orderId, "Completed", {
      paymentStatus: "Paid"
    });
    onTriggerToast(`Approved payment of $${receipt.total.toFixed(2)} for ${receipt.table}!`);
  };

  const filteredSettled = settledReceipts.filter(r => 
    r.customer.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.table.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn font-sans" id="receipts-approvals-terminal">
      
      {/* Page header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="font-serif font-black text-sm text-slate-800">Payment Settlements & Receipts Archival</h3>
          <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">Approve waiter receipts & search counter files</p>
        </div>

        {activeSubTab === "ledger" && (
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search table, customer, order, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>
        )}
      </div>

      {/* Primary tab triggers */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab("approvals")}
          className={`px-6 py-3 font-serif font-black text-xs uppercase tracking-wider border-b-2 transition-all relative ${
            activeSubTab === "approvals"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Waiter Approvals Needed
          {pendingApprovals.length > 0 && (
            <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white font-mono text-[9px] rounded-full font-black animate-pulse">
              {pendingApprovals.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab("ledger")}
          className={`px-6 py-3 font-serif font-black text-xs uppercase tracking-wider border-b-2 transition-all ${
            activeSubTab === "ledger"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          All Receipts & Orders Ledger
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left List Pane (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
          <h4 className="font-serif font-black text-slate-800 text-sm pb-2 border-b border-slate-100">
            {activeSubTab === "approvals" ? "Awaiting Cashier Settlement Release" : "Settled Transactions Ledger"}
          </h4>

          <div className="space-y-3">
            {activeSubTab === "approvals" ? (
              <>
                {pendingApprovals.map(r => {
                  const isSelected = selectedReceipt?.orderId === r.orderId;
                  return (
                    <div 
                      key={r.orderId}
                      onClick={() => setSelectedReceipt(r)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${
                        isSelected 
                          ? "border-blue-600 bg-blue-50/50 shadow-xs" 
                          : "border-slate-100 bg-slate-50/50 hover:bg-slate-50"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-black text-slate-800 group-hover:text-blue-600">
                            {r.table}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ({r.orderId})
                          </span>
                        </div>
                        <p className="font-sans font-bold text-slate-700 text-xs">Waiter settlement request</p>
                        <p className="text-[10px] text-slate-400 font-mono line-clamp-1">{r.itemsSummary}</p>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right space-y-1 font-mono">
                          <span className="text-xs font-black text-[#22C55E] block">${r.total.toFixed(2)}</span>
                          <span className="text-[9px] text-slate-400 block uppercase">{r.time} • {r.method}</span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApprovePayment(r);
                          }}
                          className="px-3 py-1.5 bg-[#22C55E] hover:bg-emerald-600 text-white font-serif font-bold text-[10px] rounded-lg shadow-xs transition-colors"
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  );
                })}

                {pendingApprovals.length === 0 && (
                  <div className="py-12 text-center text-slate-400 font-mono text-xs space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-[#22C55E] mx-auto animate-bounce" />
                    <p className="font-bold text-slate-700">All waiter payments approved!</p>
                    <p className="text-[10px] text-slate-400">No pending floor settlements in the queue.</p>
                  </div>
                )}
              </>
            ) : (
              <>
                {filteredSettled.map(r => {
                  const isSelected = selectedReceipt?.orderId === r.orderId;
                  return (
                    <div 
                      key={r.orderId + r.id}
                      onClick={() => setSelectedReceipt(r)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${
                        isSelected 
                          ? "border-blue-600 bg-blue-50/50 shadow-xs" 
                          : "border-slate-100 bg-slate-50/50 hover:bg-slate-50"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-black text-slate-800 group-hover:text-blue-600">
                            {r.id}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ({r.orderId})
                          </span>
                        </div>
                        <p className="font-sans font-bold text-slate-700 text-xs">
                          {r.table} <span className="font-mono text-[9px] text-slate-400 uppercase">({r.type})</span>
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono line-clamp-1">{r.itemsSummary}</p>
                      </div>

                      <div className="text-right space-y-1 font-mono">
                        <span className="text-xs font-black text-blue-600 block">${r.total.toFixed(2)}</span>
                        <span className="text-[9px] text-slate-400 block uppercase">{r.time} • {r.method}</span>
                      </div>
                    </div>
                  );
                })}

                {filteredSettled.length === 0 && (
                  <div className="py-12 text-center text-slate-400 font-mono text-xs">
                    No matching receipts found in counter archival files.
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Preview Pane (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
          <h4 className="font-serif font-black text-slate-800 text-sm border-b border-slate-100 pb-3">Thermal Paper Copy Preview</h4>

          {selectedReceipt ? (
            <div className="space-y-4">
              
              {/* Receipt template container */}
              <div className="bg-slate-50 border-2 border-dashed border-slate-300 p-5 rounded-2xl font-mono text-slate-600 text-[11px] space-y-4 relative overflow-hidden">
                {selectedReceipt.paymentStatus === "Pending Approval" && (
                  <div className="absolute top-2 right-2 bg-amber-500 text-white font-sans text-[8px] font-bold px-2 py-0.5 rounded-full uppercase animate-pulse">
                    UNAPPROVED
                  </div>
                )}
                
                {/* Header */}
                <div className="text-center space-y-0.5 border-b border-slate-300 pb-3">
                  <h5 className="font-black text-xs text-slate-800 uppercase">GourmetBite Manhattan</h5>
                  <p>Branch #1 Counter Terminal</p>
                  <p>TEL: (555) 101-9021</p>
                  <p className="text-[10px] text-slate-400">Date: Today • {selectedReceipt.time}</p>
                </div>

                {/* Metadata */}
                <div className="space-y-1 text-[10px]">
                  <p>RECEIPT NO: {selectedReceipt.id}</p>
                  <p>ORDER ID: {selectedReceipt.orderId}</p>
                  <p>SOURCE: {selectedReceipt.table}</p>
                  <p>TYPE: {selectedReceipt.type}</p>
                  <p>METHOD: {selectedReceipt.method || "TBD"}</p>
                </div>

                {/* Detailed items or fallback summary */}
                <div className="border-t border-b border-slate-300 py-2">
                  <p className="font-bold text-slate-800">ITEMS DETAILS SUMMARY:</p>
                  {selectedReceipt.rawOrder ? (
                    <div className="space-y-1 mt-1">
                      {selectedReceipt.rawOrder.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-[10px]">
                          <span>{it.quantity}x {it.name}</span>
                          <span>${(it.price * it.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] italic mt-1 text-slate-500">{selectedReceipt.itemsSummary}</p>
                  )}
                </div>

                {/* Calculation */}
                <div className="space-y-1 text-[10px] border-b border-slate-300 pb-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${(selectedReceipt.total / 1.08).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sales Tax (8%):</span>
                    <span>${(selectedReceipt.total - (selectedReceipt.total / 1.08)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-rose-500 font-bold">
                    <span>Waiter Tips (Excluded):</span>
                    <span>$0.00 (Pure Order Cost)</span>
                  </div>
                </div>

                <div className="flex justify-between font-black text-slate-800 text-xs border-b border-slate-300 py-1">
                  <span>TOTAL CASH MOUNT/PAID:</span>
                  <span>${selectedReceipt.total.toFixed(2)}</span>
                </div>

                {/* Receipt Footer */}
                <div className="text-center text-[10px] text-slate-400 space-y-1">
                  <p>Thank you for dining with us!</p>
                  <p>WiFi credentials: GourmetBiteVIP</p>
                  <p className="font-bold">*** CUSTOMER COPY ***</p>
                </div>
              </div>

              {/* Quick actions panel */}
              <div className="space-y-2 text-xs">
                {selectedReceipt.paymentStatus === "Pending Approval" ? (
                  <button 
                    onClick={() => handleApprovePayment(selectedReceipt)}
                    className="w-full py-3 bg-[#22C55E] hover:bg-emerald-600 text-white font-serif font-bold rounded-xl flex items-center justify-center space-x-2 transition-colors shadow-xs"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve Payment & Finalize</span>
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => onTriggerToast(`Print job dispatched successfully for receipt ${selectedReceipt.id}.`)}
                      className="w-full py-2.5 bg-blue-600 text-white font-serif font-black rounded-xl flex items-center justify-center space-x-2 hover:bg-blue-700 transition-colors shadow-xs"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Reprint Receipt Copy</span>
                    </button>

                    <div className="flex gap-2">
                      <input 
                        type="email" 
                        placeholder="Send PDF copy to email..."
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="flex-grow p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs focus:border-blue-500"
                      />
                      <button 
                        onClick={() => {
                          if (!emailInput) return;
                          onTriggerToast(`PDF receipt copy sent to ${emailInput}!`);
                          setEmailInput("");
                        }}
                        className="p-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-slate-600 transition-colors"
                        title="Send PDF by Email"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>

            </div>
          ) : (
            <div className="py-20 text-center text-slate-400 font-mono text-xs border border-dashed border-slate-200 rounded-2xl">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              Select an item on the left to preview thermal copy.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
