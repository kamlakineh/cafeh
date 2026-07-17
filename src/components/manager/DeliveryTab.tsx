import React from "react";
import { 
  Truck, MapPin, Phone, MessageSquare, ShieldAlert, Sparkles, 
  Map, UserCheck, RefreshCw, Navigation, Star, Send
} from "lucide-react";

interface DeliveryItem {
  id: string;
  orderId: string;
  courier: string;
  destination: string;
  status: "Transit" | "Arrived" | "Delayed" | "Assigned";
  eta: string;
  phone: string;
  routePct: number; // percentage of completion
}

export default function DeliveryTab() {
  
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const [deliveries, setDeliveries] = React.useState<DeliveryItem[]>([
    { id: "D1", orderId: "#ORD-954", courier: "Arthur Dent", destination: "742 Evergreen Terrace", status: "Transit", eta: "8 mins", phone: "+1 555-0199", routePct: 65 },
    { id: "D2", orderId: "#ORD-958", courier: "Tricia McMillan", destination: "42 Wallaby Way, Sydney", status: "Arrived", eta: "Arrived", phone: "+1 555-0144", routePct: 100 },
    { id: "D3", orderId: "#ORD-961", courier: "Ford Prefect", destination: "15 Hanbury St, London", status: "Delayed", eta: "18 mins", phone: "+1 555-0177", routePct: 35 },
    { id: "D4", orderId: "#ORD-965", courier: "Zaphod Beeblebrox", destination: "Heart of Gold Ave 101", status: "Assigned", eta: "25 mins", phone: "+1 555-0155", routePct: 0 }
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleReassign = (id: string, courierName: string) => {
    setDeliveries(deliveries.map(d => d.id === id ? { ...d, courier: courierName } : d));
    showToast(`Reassigned Delivery ${id} to Courier ${courierName}!`);
  };

  return (
    <div className="space-y-6" id="manager-delivery-logistics">
      
      {toastMessage && (
        <div className="fixed bottom-8 right-8 bg-slate-900 text-white text-xs font-mono py-3 px-5 rounded-xl shadow-2xl z-50 animate-fadeIn flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Control Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="font-serif font-black text-sm text-slate-800">Courier Dispatch Logistics Panel</h3>
          <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">Live transit telemetry & ETA status mapping</p>
        </div>

        <div className="flex space-x-2">
          <button 
            onClick={() => showToast("Broadcasting global dispatch status signal to all drivers...")}
            className="px-3.5 py-1.5 bg-[#2B6CB0] text-white hover:bg-blue-700 transition-all font-bold rounded-xl text-xs font-mono flex items-center"
          >
            <Send className="w-3.5 h-3.5 mr-1" />
            <span>Broadcast Status</span>
          </button>
          
          <button 
            onClick={() => showToast("Logistics database synchronized with driver GPS...")}
            className="p-1.5 bg-slate-50 border border-slate-200 hover:border-blue-500 rounded-xl"
            title="Refresh GPS Coordinates"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Live Driver Map Tracker (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900 rounded-2xl p-5 border border-slate-950 shadow-lg min-h-[400px] flex flex-col justify-between text-white relative overflow-hidden">
          
          {/* Map Header Overlay */}
          <div className="bg-slate-800/80 border border-slate-700 backdrop-blur-sm p-3 rounded-xl flex justify-between items-center text-xs z-10">
            <span className="font-mono font-black text-[#D4AF37] flex items-center">
              <Navigation className="w-4 h-4 mr-1 animate-pulse" />
              <span>LIVE BROADCAST TRACKING</span>
            </span>
            <span className="text-[10px] font-mono opacity-80 text-slate-300">4 ACTIVE COURIERS</span>
          </div>

          {/* Map Vector Graphic Background */}
          <div className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-center">
            {/* Elegant SVG schematic representing a stylized street map layout */}
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <path d="M 0,100 L 800,100 M 0,300 L 800,300 M 150,0 L 150,500 M 450,0 L 450,500 M 650,0 L 650,500" stroke="#FFF" strokeWidth="2" strokeDasharray="5,5" />
              <circle cx="150" cy="100" r="10" fill="none" stroke="#FFF" strokeWidth="2" />
              <circle cx="450" cy="300" r="15" fill="none" stroke="#FFF" strokeWidth="2" />
            </svg>
          </div>

          {/* Gold Pin overlay markers mapping active driver coordinates */}
          <div className="flex-1 relative min-h-[250px] mt-4">
            {deliveries.map((del, idx) => {
              // Distribute pins dynamically across canvas based on completion
              const xPos = 20 + (idx * 22);
              const yPos = 80 - (del.routePct * 0.6);

              return (
                <div 
                  key={del.id}
                  onClick={() => showToast(`Paging live telemetry coordinates for Driver ${del.courier}`)}
                  className="absolute cursor-pointer group transition-all"
                  style={{ left: `${xPos}%`, top: `${yPos}%`, transform: "translate(-50%, -50%)" }}
                >
                  <div className="relative">
                    <MapPin className={`w-6 h-6 text-[#D4AF37] drop-shadow-md transition-transform group-hover:scale-115 ${
                      del.status === "Transit" ? "animate-bounce" : ""
                    }`} />
                    <span className="absolute -top-1 -right-1 bg-[#D4AF37] text-slate-900 w-3 h-3 rounded-full text-[8px] font-mono font-black flex items-center justify-center">
                      {idx + 1}
                    </span>
                  </div>
                  
                  {/* Hover tooltip label */}
                  <span className="absolute top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-[8px] font-mono py-0.5 px-1.5 rounded whitespace-nowrap border border-slate-700 shadow opacity-90">
                    {del.courier.split(" ")[0]} ({del.eta})
                  </span>
                </div>
              );
            })}
          </div>

          <p className="text-[9px] text-slate-400 font-mono text-center mt-2 z-10">
            ▲ Map simulation updates courier pins at 5-second intervals via live satellite payload.
          </p>
        </div>

        {/* Courier Dispatcher List (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-serif font-black text-sm text-slate-800">Dispatch Queue</h3>

            <div className="space-y-4">
              {deliveries.map((del) => (
                <div key={del.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                  
                  {/* Top line: courier, status */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-sans font-bold text-slate-800 text-xs">{del.courier}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">Order: {del.orderId} • ETA: {del.eta}</p>
                    </div>

                    <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold uppercase border ${
                      del.status === "Transit" 
                        ? "bg-blue-100 text-blue-700 border-blue-200" 
                        : del.status === "Arrived" 
                          ? "bg-green-100 text-green-700 border-green-200" 
                          : del.status === "Delayed" 
                            ? "bg-red-100 text-red-700 border-red-200 animate-pulse" 
                            : "bg-slate-150 text-slate-500 border-slate-200"
                    }`}>
                      {del.status}
                    </span>
                  </div>

                  {/* Destination */}
                  <div className="text-[11px] font-sans text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100">
                    📍 {del.destination}
                  </div>

                  {/* Route Progress */}
                  <div className="space-y-1">
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="bg-[#D4AF37] h-full rounded-full transition-all" style={{ width: `${del.routePct}%` }} />
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 block text-right">{del.routePct}% route completed</span>
                  </div>

                  {/* Operational actions */}
                  <div className="flex justify-between items-center pt-2.5 border-t border-slate-150 text-xs">
                    <select
                      onChange={(e) => handleReassign(del.id, e.target.value)}
                      className="bg-white border border-slate-250 rounded-lg p-1 text-[11px] outline-none font-sans text-slate-600"
                    >
                      <option value="">Reassign Courier</option>
                      <option value="Marvin Android">Marvin Android</option>
                      <option value="Slartibartfast">Slartibartfast</option>
                    </select>

                    <div className="flex space-x-1.5">
                      <button 
                        onClick={() => showToast(`VoIP call initiated to Courier ${del.courier}...`)}
                        className="p-1.5 bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-500 rounded-lg transition-all"
                        title="Contact Driver"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </button>
                      
                      <button 
                        onClick={() => showToast(`Direct SMS dispatch page sent to customer destination...`)}
                        className="p-1.5 bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-500 rounded-lg transition-all"
                        title="Contact Customer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
