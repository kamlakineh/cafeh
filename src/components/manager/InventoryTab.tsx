import React from "react";
import { 
  Package, AlertTriangle, Calendar, FileCheck, Trash2, 
  ChevronRight, ArrowUpRight, Zap, Mail, ShieldCheck, CheckSquare,
  Plus, Edit, X, RefreshCw
} from "lucide-react";
import { InventoryItem } from "../../types";

interface InventoryTabProps {
  inventory: InventoryItem[];
  onRefresh?: () => void;
}

export default function InventoryTab({
  inventory,
  onRefresh
}: InventoryTabProps) {
  
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // State for inventory form
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [formMode, setFormMode] = React.useState<"create" | "edit">("create");
  const [oldItemName, setOldItemName] = React.useState("");
  const [formItem, setFormItem] = React.useState("");
  const [formCurrent, setFormCurrent] = React.useState<number>(50);
  const [formMin, setFormMin] = React.useState<number>(20);

  const openCreateForm = () => {
    setFormMode("create");
    setOldItemName("");
    setFormItem("");
    setFormCurrent(50);
    setFormMin(20);
    setIsFormOpen(true);
  };

  const openEditForm = (inv: InventoryItem) => {
    setFormMode("edit");
    setOldItemName(inv.item);
    setFormItem(inv.item);
    setFormCurrent(inv.current);
    setFormMin(inv.min);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formItem.trim()) {
      showToast("Item name is required!");
      return;
    }

    try {
      if (formMode === "create") {
        const res = await fetch("/api/inventory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            item: formItem.trim(),
            current: formCurrent,
            min: formMin
          })
        });
        if (res.ok) {
          showToast(`Item "${formItem}" added successfully!`);
          setIsFormOpen(false);
          if (onRefresh) onRefresh();
        } else {
          const errData = await res.json();
          showToast(`Error: ${errData.error || "failed to create item"}`);
        }
      } else {
        const res = await fetch(`/api/inventory/${encodeURIComponent(oldItemName)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            item: formItem.trim(),
            current: formCurrent,
            min: formMin
          })
        });
        if (res.ok) {
          showToast(`Item updated successfully!`);
          setIsFormOpen(false);
          if (onRefresh) onRefresh();
        } else {
          const errData = await res.json();
          showToast(`Error: ${errData.error || "failed to update item"}`);
        }
      }
    } catch (err) {
      console.error("Inventory save error:", err);
      showToast("Failed to connect to backend server.");
    }
  };

  const handleDelete = async (itemName: string) => {
    if (!confirm(`Are you sure you want to delete "${itemName}" from inventory?`)) return;
    try {
      const res = await fetch(`/api/inventory/${encodeURIComponent(itemName)}`, {
        method: "DELETE"
      });
      if (res.ok) {
        showToast(`Item "${itemName}" removed successfully.`);
        if (onRefresh) onRefresh();
      } else {
        showToast("Failed to delete item.");
      }
    } catch (err) {
      console.error("Delete inventory error:", err);
      showToast("Failed to connect to backend server.");
    }
  };

  // Mock secondary inventory metrics
  const expiringCount = 4;
  const pendingOrdersCount = 2;
  const wasteTodayVal = "$124.50";

  // Low stock calculation
  const lowStockItems = inventory.filter(i => i.status !== "OK");

  return (
    <div className="space-y-6" id="manager-inventory-overview">
      
      {toastMessage && (
        <div className="fixed bottom-8 right-8 bg-slate-900 text-white text-xs font-mono py-3 px-5 rounded-xl shadow-2xl z-50 animate-fadeIn flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Stats Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Stat 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-mono uppercase block">Low Stock Items</span>
            <h4 className="text-xl font-bold font-mono text-red-600 mt-1">{lowStockItems.length} Warnings</h4>
            <p className="text-[10px] text-slate-400 font-sans mt-0.5">Below critical thresholds</p>
          </div>
          <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-mono uppercase block">Expiring Soon</span>
            <h4 className="text-xl font-bold font-mono text-amber-600 mt-1">{expiringCount} Batches</h4>
            <p className="text-[10px] text-slate-400 font-sans mt-0.5">Expires within 48 hours</p>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
            <Calendar className="w-4 h-4" />
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-mono uppercase block">Pending Purchase Orders</span>
            <h4 className="text-xl font-bold font-mono text-blue-600 mt-1">{pendingOrdersCount} Awaiting</h4>
            <p className="text-[10px] text-slate-400 font-sans mt-0.5">Requires manager sign-off</p>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <FileCheck className="w-4 h-4" />
          </div>
        </div>

        {/* Stat 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-mono uppercase block">Recorded Waste Today</span>
            <h4 className="text-xl font-bold font-mono text-purple-600 mt-1">{wasteTodayVal}</h4>
            <p className="text-[10px] text-slate-400 font-sans mt-0.5">Prep kitchen scrap logs</p>
          </div>
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
            <Trash2 className="w-4 h-4" />
          </div>
        </div>

      </div>

      {/* Optional Form Overlay (Create/Edit) */}
      {isFormOpen && (
        <div className="bg-slate-900/60 backdrop-blur-sm fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-md overflow-hidden animate-fadeIn">
            <div className="bg-slate-50 border-b border-slate-100 p-4 flex justify-between items-center">
              <h3 className="font-serif font-black text-sm text-slate-800">
                {formMode === "create" ? "Add Inventory Item" : "Edit Inventory Item"}
              </h3>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="block text-slate-500 font-medium">Ingredient Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Fresh Truffles"
                  value={formItem}
                  onChange={(e) => setFormItem(e.target.value)}
                  disabled={formMode === "edit"} // Don't allow changing primary key if they want to avoid duplicates easily
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none disabled:opacity-60"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-slate-500 font-medium">In Stock Quantity</label>
                  <input 
                    type="number"
                    value={formCurrent}
                    onChange={(e) => setFormCurrent(parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-500 font-medium">Safety Minimum Buffer</label>
                  <input 
                    type="number"
                    value={formMin}
                    onChange={(e) => setFormMin(parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[10px] rounded-xl font-bold uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-mono text-[10px] rounded-xl font-bold uppercase"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Grid: Stock Ledger & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Table List of Stock Warnings */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-50">
            <div>
              <h3 className="font-serif font-black text-sm text-slate-800">Enterprise Inventory Ledger</h3>
              <p className="text-xs text-slate-400">Complete listing of tracked branch assets</p>
            </div>
            
            <div className="flex items-center space-x-2">
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl transition"
                  title="Refresh Database"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              )}
              <button 
                onClick={openCreateForm}
                className="text-[10px] font-mono bg-blue-600 text-white border border-blue-700 px-3 py-1.5 rounded-xl uppercase hover:bg-blue-700 flex items-center space-x-1 font-bold"
              >
                <Plus className="w-3 h-3" />
                <span>Add Item</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-none">
              <thead className="bg-slate-50 font-mono text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="p-3 uppercase">Ingredient Item</th>
                  <th className="p-3 uppercase text-right">In Stock</th>
                  <th className="p-3 uppercase text-right">Safety Min</th>
                  <th className="p-3 uppercase text-center">Status</th>
                  <th className="p-3 uppercase text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {inventory.map((inv) => (
                  <tr key={inv.item} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 font-sans font-bold text-slate-800">{inv.item}</td>
                    <td className="p-3 text-right font-mono font-medium">{inv.current} units</td>
                    <td className="p-3 text-right font-mono">{inv.min} units</td>
                    <td className="p-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full font-mono text-[9px] font-bold border ${
                        inv.status === "Critical" 
                          ? "bg-rose-100 text-rose-700 border-rose-200 animate-pulse" 
                          : inv.status === "Low" 
                            ? "bg-amber-100 text-amber-700 border-amber-200" 
                            : "bg-emerald-100 text-emerald-700 border-emerald-200"
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-3 text-center flex items-center justify-center space-x-2">
                      <button 
                        onClick={() => openEditForm(inv)}
                        className="p-1 text-blue-600 hover:text-blue-800 transition"
                        title="Edit Item"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(inv.item)}
                        className="p-1 text-rose-600 hover:text-rose-800 transition"
                        title="Delete Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick actions panel */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-serif font-black text-sm text-slate-800">Operational Links</h3>
            
            <div className="space-y-2">
              <button 
                onClick={() => showToast("Loading Enterprise Supply Chain Management Database...")}
                className="w-full p-3 bg-[#2B6CB0] text-white rounded-xl hover:bg-blue-700 transition-all text-xs font-mono font-bold flex justify-between items-center"
              >
                <span>Open Inventory Dashboard</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button 
                onClick={() => showToast("All pending supplier purchase orders authorized successfully!")}
                className="w-full p-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl transition-all text-xs font-mono font-bold flex justify-between items-center border border-emerald-100"
              >
                <span>Approve All Purchase Orders</span>
                <ShieldCheck className="w-4 h-4" />
              </button>

              <button 
                onClick={() => showToast("Auto-drafting mail to Sysco Food Supplies and US Foods...")}
                className="w-full p-3 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-xl transition-all text-xs font-mono font-bold flex justify-between items-center border border-slate-200"
              >
                <span>Contact Supplier Direct Pager</span>
                <Mail className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <h4 className="font-serif font-black text-xs text-slate-800">Expiring Stock Checklist</h4>
            <div className="space-y-2 text-xs divide-y divide-slate-100">
              <div className="py-2 flex justify-between items-center">
                <span className="font-sans font-medium text-slate-700">Prime Beef Brisket</span>
                <span className="font-mono text-red-500 font-bold bg-red-50 px-1.5 py-0.5 rounded">Expires 6h</span>
              </div>
              <div className="py-2 flex justify-between items-center">
                <span className="font-sans font-medium text-slate-700">Fresh Cheddar Cheese</span>
                <span className="font-mono text-red-500 font-bold bg-red-50 px-1.5 py-0.5 rounded">Expires 12h</span>
              </div>
              <div className="py-2 flex justify-between items-center">
                <span className="font-sans font-medium text-slate-700">Brioche Burger Buns</span>
                <span className="font-mono text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded">Expires 24h</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
