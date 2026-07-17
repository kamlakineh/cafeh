import React from "react";
import { 
  Grid, User, DollarSign, Users, ShieldAlert, Sparkles, 
  RotateCcw, Sliders, Check, HelpCircle, AlertTriangle
} from "lucide-react";

interface TableItem {
  id: string;
  name: string;
  capacity: number;
  status: "Available" | "Occupied" | "Reserved" | "Cleaning";
  waiter: string;
  bill: number;
  x: number; // grid position percentage
  y: number; // grid position percentage
}

export default function TableManagementTab() {
  
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const [selectedTable, setSelectedTable] = React.useState<TableItem | null>(null);
  const [isLayoutMode, setIsLayoutMode] = React.useState(false);

  // Core visual tables state
  const [tables, setTables] = React.useState<TableItem[]>([
    { id: "T1", name: "Table 1", capacity: 4, status: "Occupied", waiter: "Lucia Santos", bill: 142.50, x: 20, y: 25 },
    { id: "T2", name: "Table 2", capacity: 2, status: "Available", waiter: "None", bill: 0, x: 50, y: 25 },
    { id: "T3", name: "Table 3", capacity: 6, status: "Reserved", waiter: "David Kim", bill: 0, x: 80, y: 25 },
    { id: "T4", name: "Table 4", capacity: 4, status: "Occupied", waiter: "Lucia Santos", bill: 85.00, x: 20, y: 65 },
    { id: "T5", name: "Table 5", capacity: 8, status: "Cleaning", waiter: "None", bill: 0, x: 50, y: 65 },
    { id: "T6", name: "Table 6", capacity: 4, status: "Available", waiter: "None", bill: 0, x: 80, y: 65 }
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const updateTable = (updated: TableItem) => {
    setTables(tables.map(t => t.id === updated.id ? updated : t));
    setSelectedTable(updated);
  };

  const handleStatusChange = (status: TableItem["status"]) => {
    if (!selectedTable) return;
    const updated = { ...selectedTable, status };
    if (status === "Available" || status === "Cleaning") {
      updated.bill = 0;
      updated.waiter = "None";
    }
    updateTable(updated);
    showToast(`${selectedTable.name} status updated to ${status}!`);
  };

  const handleWaiterChange = (waiter: string) => {
    if (!selectedTable) return;
    updateTable({ ...selectedTable, waiter });
    showToast(`Assigned ${waiter} to ${selectedTable.name}`);
  };

  const handleMerge = () => {
    showToast("Selected tables merged for large party service!");
  };

  const handleSplit = () => {
    showToast("Table bill split requested. Emitting cashier split-checks.");
  };

  const handleCloseBill = () => {
    if (!selectedTable) return;
    updateTable({ ...selectedTable, status: "Cleaning", bill: 0 });
    showToast(`${selectedTable.name} bill finalized and closed!`);
  };

  // Grid arrangement controls
  const moveTable = (direction: "up" | "down" | "left" | "right") => {
    if (!selectedTable) return;
    let { x, y } = selectedTable;
    if (direction === "up") y = Math.max(y - 5, 5);
    if (direction === "down") y = Math.min(y + 5, 90);
    if (direction === "left") x = Math.max(x - 5, 5);
    if (direction === "right") x = Math.min(x + 5, 90);

    const updated = { ...selectedTable, x, y };
    updateTable(updated);
  };

  const getStatusBg = (status: TableItem["status"]) => {
    switch (status) {
      case "Available": return "bg-emerald-500 border-emerald-600 text-white";
      case "Occupied": return "bg-red-500 border-red-600 text-white";
      case "Reserved": return "bg-[#D4AF37] border-amber-600 text-slate-900";
      case "Cleaning": return "bg-indigo-500 border-indigo-600 text-white";
    }
  };

  return (
    <div className="space-y-6" id="manager-table-operations">
      
      {toastMessage && (
        <div className="fixed bottom-8 right-8 bg-slate-900 text-white text-xs font-mono py-3 px-5 rounded-xl shadow-2xl z-50 animate-fadeIn flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Control Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="font-serif font-black text-sm text-slate-800">Visual Dining Floor Coordinator</h3>
          <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">Real-time occupancy and guest bill tracking</p>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <button
            onClick={() => setIsLayoutMode(!isLayoutMode)}
            className={`px-3.5 py-1.5 rounded-xl border font-bold transition-all ${
              isLayoutMode 
                ? "bg-amber-100 border-[#D4AF37] text-amber-800" 
                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            {isLayoutMode ? "💾 Lock Layout Coordinates" : "⚙ Rearrange Table Grid"}
          </button>
          
          <button
            onClick={() => showToast("Floor plan layouts reset to standard profile.")}
            className="p-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl"
            title="Reset Floor Layout"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Floor Map Stage Canvas (8 Cols) */}
        <div className="lg:col-span-8 bg-slate-100/60 border border-slate-200/50 rounded-2xl p-6 min-h-[400px] relative overflow-hidden shadow-inner flex flex-col justify-between">
          
          {/* Header Legend */}
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 bg-white p-2.5 rounded-xl shadow-sm border border-slate-150">
            <span className="font-bold uppercase">Main Dining Floor Zone</span>
            <div className="flex flex-wrap gap-3">
              <span className="flex items-center"><span className="w-2.5 h-2.5 rounded bg-emerald-500 mr-1 inline-block" /> Available</span>
              <span className="flex items-center"><span className="w-2.5 h-2.5 rounded bg-red-500 mr-1 inline-block" /> Occupied</span>
              <span className="flex items-center"><span className="w-2.5 h-2.5 rounded bg-[#D4AF37] mr-1 inline-block" /> Reserved</span>
              <span className="flex items-center"><span className="w-2.5 h-2.5 rounded bg-indigo-500 mr-1 inline-block" /> Cleaning</span>
            </div>
          </div>

          {/* Canvas Map Container */}
          <div className="relative flex-1 min-h-[300px] mt-4">
            {tables.map((table) => {
              const isSelected = selectedTable?.id === table.id;
              
              return (
                <div
                  key={table.id}
                  onClick={() => setSelectedTable(table)}
                  className={`absolute w-24 h-24 rounded-2xl border-2 flex flex-col justify-between p-2 cursor-pointer transition-all shadow-md ${getStatusBg(table.status)} ${
                    isSelected ? "ring-4 ring-offset-2 ring-blue-500 scale-105" : "hover:scale-102"
                  }`}
                  style={{ left: `${table.x}%`, top: `${table.y}%`, transform: "translate(-50%, -50%)" }}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-serif font-black text-xs">{table.name}</span>
                    <span className="text-[9px] font-mono flex items-center bg-white/25 px-1 rounded">
                      <Users className="w-2.5 h-2.5 mr-0.5" />
                      <span>{table.capacity}</span>
                    </span>
                  </div>

                  <div className="space-y-0.5 text-center">
                    {table.status === "Occupied" && (
                      <span className="block font-mono text-xs font-black">${table.bill.toFixed(0)}</span>
                    )}
                    <span className="block text-[8px] truncate font-sans uppercase font-bold opacity-90">
                      {table.status === "Occupied" ? table.waiter.split(" ")[0] : table.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[9px] text-slate-400 font-mono text-center mt-2">
            * Click table elements on stage floor coordinates to alter dining covers or check billing ledgers.
          </p>
        </div>

        {/* Selected Table Management Details Panel (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {selectedTable ? (
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-5">
              
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="font-serif font-black text-slate-800 text-base">{selectedTable.name} Details</h3>
                  <p className="text-[10px] text-slate-400 font-mono">Max Capacity: {selectedTable.capacity} Seats</p>
                </div>
                <button 
                  onClick={() => setSelectedTable(null)}
                  className="text-xs text-slate-400 font-mono"
                >
                  [Dismiss]
                </button>
              </div>

              {/* Table Position Controls in Layout Rearrange Mode */}
              {isLayoutMode && (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl space-y-2">
                  <span className="text-[9px] font-mono font-bold text-amber-800 uppercase block">Rearrange Stage Coordinate Placement</span>
                  <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                    <div />
                    <button onClick={() => moveTable("up")} className="p-1.5 bg-white border border-amber-300 rounded font-bold hover:bg-slate-50">▲</button>
                    <div />
                    <button onClick={() => moveTable("left")} className="p-1.5 bg-white border border-amber-300 rounded font-bold hover:bg-slate-50">◀</button>
                    <div className="p-1 text-[10px] font-mono flex items-center justify-center text-slate-400">{selectedTable.x}x{selectedTable.y}</div>
                    <button onClick={() => moveTable("right")} className="p-1.5 bg-white border border-amber-300 rounded font-bold hover:bg-slate-50">▶</button>
                    <div />
                    <button onClick={() => moveTable("down")} className="p-1.5 bg-white border border-amber-300 rounded font-bold hover:bg-slate-50">▼</button>
                    <div />
                  </div>
                </div>
              )}

              {/* State Controls Form */}
              <div className="space-y-3 text-xs font-sans">
                
                <div className="space-y-1">
                  <label className="block text-slate-500 font-medium">Occupancy Status</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {["Available", "Occupied", "Reserved", "Cleaning"].map((st) => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(st as any)}
                        className={`p-2 rounded-xl text-center font-mono text-[10px] border transition-all ${
                          selectedTable.status === st 
                            ? "bg-slate-900 border-slate-950 text-white font-bold" 
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-500 font-medium">Server Assigned Waiter</label>
                  <select
                    value={selectedTable.waiter}
                    onChange={(e) => handleWaiterChange(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="None">None (Unassigned)</option>
                    <option value="Lucia Santos">Lucia Santos</option>
                    <option value="David Kim">David Kim</option>
                  </select>
                </div>

                {selectedTable.status === "Occupied" && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Accumulated Bill Ticket:</span>
                      <strong className="font-mono text-slate-800">${selectedTable.bill.toFixed(2)}</strong>
                    </div>
                    <button
                      onClick={handleCloseBill}
                      className="w-full p-2 bg-emerald-600 hover:bg-emerald-700 text-white font-serif font-black rounded-xl transition-all uppercase tracking-wider text-[10px]"
                    >
                      💳 Close Bill & Finalize POS
                    </button>
                  </div>
                )}

              </div>

              {/* Layout splits */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={handleMerge}
                  className="p-2.5 bg-slate-50 border border-slate-200 hover:border-blue-500 hover:text-blue-600 rounded-xl text-[10px] font-mono font-bold"
                >
                  Merge Tables
                </button>
                <button
                  onClick={handleSplit}
                  className="p-2.5 bg-slate-50 border border-slate-200 hover:border-blue-500 hover:text-blue-600 rounded-xl text-[10px] font-mono font-bold"
                >
                  Split Checks
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center py-16 space-y-3">
              <HelpCircle className="w-8 h-8 text-slate-300 mx-auto" />
              <div>
                <h4 className="font-serif font-black text-slate-800 text-sm">Table Details Panel</h4>
                <p className="text-xs text-slate-400">Select a dining table element from the coordinate plan stage to launch billing modifications.</p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
