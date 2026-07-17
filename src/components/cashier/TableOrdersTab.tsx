import React from "react";
import { 
  Grid, HelpCircle, ArrowRight, Printer, RefreshCw, Layers, 
  Trash2, UserCheck, ShieldAlert, Sparkles, Navigation, Edit2, Split, CheckSquare
} from "lucide-react";
import { Order } from "../../types";

interface TableItem {
  id: string;
  guests: number;
  capacity: number;
  status: "Available" | "Occupied" | "Reserved" | "Cleaning";
  bill?: number;
  timeOccupied?: string;
}

interface TableOrdersTabProps {
  orders: Order[];
  onUpdateOrderStatus: (id: string, status: Order['status'], extra?: Partial<Order>) => void;
  onTriggerToast: (msg: string) => void;
  onNavigateToTab: (tab: string) => void;
}

export default function TableOrdersTab({
  orders,
  onUpdateOrderStatus,
  onTriggerToast,
  onNavigateToTab
}: TableOrdersTabProps) {
  
  const staticTables = [
    { id: "Table 1", capacity: 2 },
    { id: "Table 2", capacity: 4 },
    { id: "Table 3", capacity: 6 },
    { id: "Table 4", capacity: 2 },
    { id: "Table 5", capacity: 4 },
    { id: "Table 6", capacity: 4 },
    { id: "Table 7", capacity: 8 },
    { id: "Table 8", capacity: 2 }
  ];

  // Compute tables dynamically based on centralized active dine-in orders
  const tables: TableItem[] = staticTables.map(tbl => {
    const activeOrder = orders.find(
      o => o.table === tbl.id && o.status !== "Completed" && o.type === "Dine-in"
    );

    return {
      id: tbl.id,
      capacity: tbl.capacity,
      guests: activeOrder ? 2 : 0,
      status: activeOrder ? "Occupied" : "Available",
      bill: activeOrder ? activeOrder.total : undefined,
      timeOccupied: activeOrder ? "Active" : undefined
    };
  });

  const [activeContextMenu, setActiveContextMenu] = React.useState<string | null>(null);

  const handleTableAction = (id: string, action: string) => {
    setActiveContextMenu(null);
    switch (action) {
      case "take":
        onTriggerToast(`Redirecting terminal to POS order builder for ${id}...`);
        onNavigateToTab("Walk-in Orders");
        break;
      case "print":
        onTriggerToast(`Thermal bill invoice dispatched for printing at ${id}.`);
        break;
      case "transfer":
        const newTable = prompt(`Enter target table code to transfer ${id}:`);
        if (newTable) {
          onTriggerToast(`Transferred active guest registry from ${id} to ${newTable}.`);
        }
        break;
      case "split":
        onTriggerToast(`Split-payment calculator loaded for ${id}.`);
        break;
      case "close": {
        const activeOrder = orders.find(o => o.table === id && o.status !== "Completed" && o.type === "Dine-in");
        if (activeOrder) {
          onUpdateOrderStatus(activeOrder.id, "Completed", { paymentStatus: "Paid" });
          onTriggerToast(`Settle complete! Order ${activeOrder.id} marked as Paid & Completed. Table is now available.`);
        } else {
          onTriggerToast(`Closed table bill for ${id}.`);
        }
        break;
      }
      case "available":
        onTriggerToast(`Marked ${id} as ready and Available!`);
        break;
      default:
        break;
    }
  };

  const getStatusColor = (status: TableItem["status"]) => {
    switch (status) {
      case "Available": return "bg-green-500 text-green-700 border-green-200";
      case "Occupied": return "bg-rose-500 text-rose-700 border-rose-200";
      case "Reserved": return "bg-blue-500 text-blue-700 border-blue-200";
      case "Cleaning": return "bg-purple-500 text-purple-700 border-purple-200";
      default: return "bg-slate-400";
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="tables-floorplan-dashboard">
      
      {/* Control Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="font-serif font-black text-sm text-slate-800">Visual Seating Floor Layout</h3>
          <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">Left-click table card to open quick actions</p>
        </div>

        <div className="flex flex-wrap gap-2 text-[10px] font-mono">
          <span className="px-2 py-1 rounded-lg border border-green-100 bg-green-50 text-green-700 font-bold">● Available</span>
          <span className="px-2 py-1 rounded-lg border border-rose-100 bg-rose-50 text-rose-700 font-bold">● Occupied</span>
          <span className="px-2 py-1 rounded-lg border border-blue-100 bg-blue-50 text-blue-700 font-bold">● Reserved</span>
          <span className="px-2 py-1 rounded-lg border border-purple-100 bg-purple-50 text-purple-700 font-bold">● Cleaning</span>
        </div>
      </div>

      {/* Grid of Restaurant Tables */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative">
        {tables.map((tbl) => {
          const isOpen = activeContextMenu === tbl.id;

          return (
            <div 
              key={tbl.id}
              onClick={() => setActiveContextMenu(isOpen ? null : tbl.id)}
              onContextMenu={(e) => {
                e.preventDefault();
                setActiveContextMenu(tbl.id);
              }}
              className="bg-white hover:shadow-md border border-slate-100 p-5 rounded-2xl cursor-pointer relative transition-all text-center space-y-4 select-none group"
            >
              {/* Table Seating Graphic representation */}
              <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
                {/* Visual Chairs around table */}
                <span className={`absolute -top-1 w-3 h-3 rounded-full border-2 border-white ${tbl.status === "Occupied" ? "bg-rose-400" : "bg-slate-200"}`} />
                <span className={`absolute -bottom-1 w-3 h-3 rounded-full border-2 border-white ${tbl.status === "Occupied" ? "bg-rose-400" : "bg-slate-200"}`} />
                <span className={`absolute -left-1 w-3 h-3 rounded-full border-2 border-white ${tbl.status === "Occupied" ? "bg-rose-400" : "bg-slate-200"}`} />
                <span className={`absolute -right-1 w-3 h-3 rounded-full border-2 border-white ${tbl.status === "Occupied" ? "bg-rose-400" : "bg-slate-200"}`} />

                {/* Main Table Plate */}
                <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-colors ${
                  tbl.status === "Occupied" 
                    ? "bg-rose-50 border-rose-400 text-rose-700" 
                    : tbl.status === "Reserved" 
                      ? "bg-blue-50 border-blue-400 text-blue-700" 
                      : tbl.status === "Cleaning" 
                        ? "bg-purple-50 border-purple-400 text-purple-700" 
                        : "bg-green-50 border-green-400 text-green-700"
                }`}>
                  <span className="font-serif font-black text-xs uppercase">{tbl.id.replace("Table ", "T-")}</span>
                </div>
              </div>

              {/* Seating metrics */}
              <div className="space-y-1">
                <span className={`mx-auto w-fit px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border ${
                  tbl.status === "Occupied" 
                    ? "bg-rose-100 text-rose-700 border-rose-200" 
                    : tbl.status === "Reserved" 
                      ? "bg-blue-100 text-blue-700 border-blue-200" 
                      : tbl.status === "Cleaning" 
                        ? "bg-purple-100 text-purple-700 border-purple-200 animate-pulse" 
                        : "bg-green-100 text-green-700 border-green-200"
                }`}>
                  {tbl.status}
                </span>

                <div className="pt-2 text-xs">
                  <p className="text-[10px] text-slate-400 font-mono">Guests: {tbl.guests}/{tbl.capacity}</p>
                  {tbl.bill && (
                    <p className="font-mono font-bold text-[#2B6CB0] text-sm mt-0.5">${tbl.bill.toFixed(2)}</p>
                  )}
                  {tbl.timeOccupied && (
                    <p className="text-[9px] text-slate-400 font-mono italic mt-0.5">Seated: {tbl.timeOccupied}</p>
                  )}
                </div>
              </div>

              {/* Context menu actions popover */}
              {isOpen && (
                <div 
                  className="absolute left-1/2 -translate-x-1/2 top-4 w-44 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-950 p-2 z-30 text-left text-[11px] font-mono space-y-1 animate-scaleUp"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-2 py-1 border-b border-slate-800 text-slate-400 text-[9px] uppercase tracking-wider font-bold">
                    {tbl.id} OPTIONS
                  </div>
                  
                  {tbl.status !== "Occupied" && tbl.status !== "Cleaning" ? (
                    <button 
                      onClick={() => handleTableAction(tbl.id, "take")}
                      className="w-full text-left p-1.5 hover:bg-slate-800 rounded flex items-center space-x-1.5"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Take Order</span>
                    </button>
                  ) : null}

                  {tbl.status === "Occupied" ? (
                    <>
                      <button 
                        onClick={() => handleTableAction(tbl.id, "print")}
                        className="w-full text-left p-1.5 hover:bg-slate-800 rounded flex items-center space-x-1.5"
                      >
                        <Printer className="w-3.5 h-3.5 text-blue-400" />
                        <span>Print Bill</span>
                      </button>

                      <button 
                        onClick={() => handleTableAction(tbl.id, "transfer")}
                        className="w-full text-left p-1.5 hover:bg-slate-800 rounded flex items-center space-x-1.5"
                      >
                        <Navigation className="w-3.5 h-3.5 text-amber-400" />
                        <span>Transfer Table</span>
                      </button>

                      <button 
                        onClick={() => handleTableAction(tbl.id, "split")}
                        className="w-full text-left p-1.5 hover:bg-slate-800 rounded flex items-center space-x-1.5"
                      >
                        <Split className="w-3.5 h-3.5 text-purple-400" />
                        <span>Split Bill</span>
                      </button>

                      <button 
                        onClick={() => handleTableAction(tbl.id, "close")}
                        className="w-full text-left p-1.5 hover:bg-slate-800 text-rose-400 rounded flex items-center space-x-1.5"
                      >
                        <CheckSquare className="w-3.5 h-3.5 text-rose-500" />
                        <span>Close & Settle</span>
                      </button>
                    </>
                  ) : null}

                  {tbl.status === "Cleaning" ? (
                    <button 
                      onClick={() => handleTableAction(tbl.id, "available")}
                      className="w-full text-left p-1.5 hover:bg-slate-800 text-green-400 rounded flex items-center space-x-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-green-500" />
                      <span>Finish Cleaning</span>
                    </button>
                  ) : null}

                  <button 
                    onClick={() => setActiveContextMenu(null)}
                    className="w-full text-center p-1 border-t border-slate-800 text-slate-500 hover:text-white mt-1.5"
                  >
                    Cancel
                  </button>

                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
}
