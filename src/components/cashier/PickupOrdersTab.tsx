import React from "react";
import { 
  ShoppingBag, Clock, ShieldAlert, Sparkles, Navigation, CheckCircle2, 
  Phone, Check, QrCode, Search, RefreshCw, X
} from "lucide-react";

interface PickupItem {
  id: string;
  ticketNo: string;
  customer: string;
  itemsCount: number;
  readyIn: number; // minutes remaining
  paymentStatus: "Paid" | "Unpaid";
  status: "Cooking" | "Ready" | "Completed";
  phone: string;
}

interface PickupOrdersTabProps {
  onTriggerToast: (msg: string) => void;
}

export default function PickupOrdersTab({
  onTriggerToast
}: PickupOrdersTabProps) {
  
  const [pickups, setPickups] = React.useState<PickupItem[]>([
    { id: "PK-101", ticketNo: "PK-501", customer: "Arthur Dent", itemsCount: 3, readyIn: 8, paymentStatus: "Paid", status: "Cooking", phone: "+1 555-0199" },
    { id: "PK-102", ticketNo: "PK-504", customer: "Ford Prefect", itemsCount: 1, readyIn: 0, paymentStatus: "Paid", status: "Ready", phone: "+1 555-0177" },
    { id: "PK-103", ticketNo: "PK-507", customer: "Tricia McMillan", itemsCount: 5, readyIn: 14, paymentStatus: "Unpaid", status: "Cooking", phone: "+1 555-0144" },
    { id: "PK-104", ticketNo: "PK-510", customer: "Zaphod Beeblebrox", itemsCount: 2, readyIn: 0, paymentStatus: "Paid", status: "Ready", phone: "+1 555-0155" }
  ]);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [viewingQrItem, setViewingQrItem] = React.useState<PickupItem | null>(null);

  // Tick down ready countdown timer dynamically every 15 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      setPickups(prev => prev.map(p => {
        if (p.readyIn > 1) {
          return { ...p, readyIn: p.readyIn - 1 };
        } else if (p.readyIn === 1) {
          onTriggerToast(`Pickup ticket ${p.ticketNo} is now ready for collection!`);
          return { ...p, readyIn: 0, status: "Ready" };
        }
        return p;
      }));
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const handleMarkReady = (id: string, ticketNo: string) => {
    setPickups(pickups.map(p => p.id === id ? { ...p, status: "Ready", readyIn: 0 } : p));
    onTriggerToast(`Ticket ${ticketNo} is designated as READY. Customer notified.`);
  };

  const handleHandover = (id: string, ticketNo: string) => {
    setPickups(prev => prev.filter(p => p.id !== id));
    onTriggerToast(`Handed over Ticket ${ticketNo}. Archive updated.`);
  };

  const handleCall = (customer: string, phone: string) => {
    onTriggerToast(`Calling customer ${customer} at ${phone}...`);
  };

  const filtered = pickups.filter(p => 
    p.customer.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.ticketNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6" id="pickup-orders-pos-board">
      
      {/* Pickup Header Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="font-serif font-black text-sm text-slate-800">Counter collection & pickup list</h3>
          <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">Automated collection codes & ready alerts</p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input 
            type="text"
            placeholder="Search Pickup ID or customer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs outline-none"
          />
        </div>
      </div>

      {/* Grid of Pickup cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((item) => (
          <div 
            key={item.id} 
            className={`bg-white p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 shadow-sm relative ${
              item.status === "Ready" ? "border-emerald-300 bg-emerald-50/10" : "border-slate-100"
            }`}
          >
            {/* Header row: Ticket # & Countdown */}
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[32px] font-mono font-black text-slate-800 tracking-tight leading-none block">
                  {item.ticketNo}
                </span>
                <div>
                  <h4 className="font-serif font-black text-slate-700 text-sm">{item.customer}</h4>
                  <p className="text-[10px] text-slate-400 font-mono">Contains: {item.itemsCount} Items</p>
                </div>
              </div>

              {/* Status Indicator / Countdown */}
              {item.status === "Ready" ? (
                <span className="px-3 py-1 bg-emerald-600 text-white border border-emerald-500 font-mono text-[9px] font-black rounded-lg uppercase animate-pulse">
                  Ready for collection
                </span>
              ) : (
                <div className="p-2.5 bg-slate-900 text-white rounded-xl text-center min-w-20 border border-slate-950 font-mono">
                  <span className="text-[9px] text-slate-400 block uppercase font-bold">READY IN</span>
                  <span className="text-sm font-black text-[#D4AF37]">{item.readyIn} mins</span>
                </div>
              )}
            </div>

            {/* Middle Row: payment & QR triggers */}
            <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
              <div className="space-y-0.5">
                <span className="text-[9px] text-slate-400 font-mono block uppercase">POS Payment status</span>
                <span className={`font-mono font-black ${item.paymentStatus === "Paid" ? "text-green-600" : "text-rose-600 animate-pulse"}`}>
                  ● {item.paymentStatus}
                </span>
              </div>

              {/* Visual QR Trigger */}
              <button 
                onClick={() => setViewingQrItem(item)}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-400 text-slate-600 rounded-xl flex items-center space-x-1.5 font-mono text-[10px]"
              >
                <QrCode className="w-4 h-4 text-slate-500" />
                <span>Show QR Code</span>
              </button>
            </div>

            {/* Card Operational action row */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-50 text-xs font-mono font-bold">
              <button
                onClick={() => handleCall(item.customer, item.phone)}
                className="p-2 border border-slate-200 hover:border-blue-400 text-slate-500 hover:text-blue-600 rounded-xl"
                title="Call Customer"
              >
                <Phone className="w-4 h-4" />
              </button>

              <div className="flex space-x-2">
                {item.status !== "Ready" && (
                  <button
                    onClick={() => handleMarkReady(item.id, item.ticketNo)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all"
                  >
                    Mark Ready
                  </button>
                )}

                <button
                  onClick={() => handleHandover(item.id, item.ticketNo)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-sm flex items-center space-x-1"
                >
                  <Check className="w-4 h-4" />
                  <span>Handed Over</span>
                </button>
              </div>
            </div>

          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-400 font-mono bg-white rounded-2xl border border-dashed border-slate-200">
            No counter pickup tickets matching filter.
          </div>
        )}
      </div>

      {/* QR MODAL PREVIEW OVERLAY */}
      {viewingQrItem && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl max-w-sm w-full space-y-4 text-center animate-scaleUp">
            <div className="flex justify-between items-center border-b border-slate-50 pb-2">
              <span className="font-mono text-xs text-slate-400 uppercase">Verification Payload</span>
              <button 
                onClick={() => setViewingQrItem(null)}
                className="p-1 border border-slate-200 hover:border-slate-400 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="font-serif font-black text-slate-800 text-base">{viewingQrItem.customer}</h3>
              <p className="text-xs font-mono text-slate-400 uppercase">Collection Code: {viewingQrItem.ticketNo}</p>
            </div>

            {/* Stylized QR Code SVG graphic */}
            <div className="p-4 bg-slate-900 rounded-2xl inline-block border border-slate-950">
              <svg className="w-44 h-44 mx-auto text-white" viewBox="0 0 100 100">
                <rect x="10" y="10" width="20" height="20" fill="currentColor" />
                <rect x="14" y="14" width="12" height="12" fill="#0F172A" />
                <rect x="17" y="17" width="6" height="6" fill="currentColor" />

                <rect x="70" y="10" width="20" height="20" fill="currentColor" />
                <rect x="74" y="14" width="12" height="12" fill="#0F172A" />
                <rect x="77" y="17" width="6" height="6" fill="currentColor" />

                <rect x="10" y="70" width="20" height="20" fill="currentColor" />
                <rect x="14" y="74" width="12" height="12" fill="#0F172A" />
                <rect x="17" y="77" width="6" height="6" fill="currentColor" />

                <rect x="40" y="40" width="20" height="20" fill="currentColor" />
                <rect x="70" y="70" width="10" height="10" fill="currentColor" />
                <rect x="45" y="15" width="8" height="8" fill="currentColor" />
                <rect x="45" y="75" width="12" height="6" fill="currentColor" />
                <rect x="75" y="45" width="6" height="12" fill="currentColor" />
              </svg>
            </div>

            <p className="text-[10px] font-mono text-slate-400 uppercase">
              Scan via scanner terminal to complete dispatch handover
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
