import React from "react";
import { 
  ShoppingBag, ClipboardList, Check, X, RotateCcw, Search, 
  Printer, DollarSign, Calculator, Users, HelpCircle, AlertCircle,
  TrendingUp, Activity, ArrowUpRight, ArrowDownRight, CreditCard,
  Smartphone, Wallet, Eye, Edit2, ShieldAlert, Sparkles, Navigation,
  Home, Table, Play, UserCheck, ShieldClose, FileText, ChevronLeft, ChevronRight, LogOut, Bell
} from "lucide-react";
import { Order, Employee } from "../types";

// Import Modular Tabs
import CashierDashboardHome from "./cashier/CashierDashboardHome";
import OnlineOrdersTab from "./cashier/OnlineOrdersTab";
import PendingOrdersTab from "./cashier/PendingOrdersTab";
import TableOrdersTab from "./cashier/TableOrdersTab";
import PickupOrdersTab from "./cashier/PickupOrdersTab";
import PaymentProcessingTab from "./cashier/PaymentProcessingTab";
import ReceiptsTab from "./cashier/ReceiptsTab";
import CustomerLookupTab from "./cashier/CustomerLookupTab";
import RefundsTab from "./cashier/RefundsTab";
import SalesTab from "./cashier/SalesTab";
import CashierLogin from "./cashier/CashierLogin";

interface CashierDashboardProps {
  orders: Order[];
  onUpdateOrderStatus: (id: string, status: Order['status'], extra?: Partial<Order>) => void;
  onPlaceOrder: (order: Partial<Order>) => void;
  authenticatedStaff?: Employee | null;
  onLogout?: () => void;
}

export default function CashierDashboard({
  orders,
  onUpdateOrderStatus,
  onPlaceOrder,
  authenticatedStaff,
  onLogout
}: CashierDashboardProps) {
  
  // Auth state initialized from central gate
  const [isAuthenticated, setIsAuthenticated] = React.useState(!!authenticatedStaff);
  const [cashierInfo, setCashierInfo] = React.useState<{ id: string; name: string; branch: string } | null>(
    authenticatedStaff ? { id: authenticatedStaff.id, name: authenticatedStaff.name, branch: "Manhattan Central" } : null
  );

  // Sync state if authenticatedStaff prop changes
  React.useEffect(() => {
    if (authenticatedStaff) {
      setIsAuthenticated(true);
      setCashierInfo({ id: authenticatedStaff.id, name: authenticatedStaff.name, branch: "Manhattan Central" });
    } else {
      setIsAuthenticated(false);
      setCashierInfo(null);
    }
  }, [authenticatedStaff]);

  // Navigation
  const [activeTab, setActiveTab] = React.useState<string>("Dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  
  // Custom Toast state
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // Trigger global custom cashier toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Keyboard shortcut display and listeners
  React.useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveTab("Dashboard");
        triggerToast("Returned to terminal dashboard home.");
      }
    };
    window.addEventListener("keydown", handleGlobalShortcuts);
    return () => window.removeEventListener("keydown", handleGlobalShortcuts);
  }, []);

  // Sidemenu items
  const sidebarItems = [
    { name: "Dashboard", icon: Home },
    { name: "Online Orders", icon: ClipboardList, badge: orders.filter(o => o.type === "Pickup").length },
    { name: "Pending Orders", icon: Play, badge: orders.filter(o => o.status === "Pending").length },
    { name: "Table Orders", icon: Table },
    { name: "Pickup Orders", icon: Check },
    { name: "Payment Processing", icon: CreditCard },
    { name: "Receipts", icon: FileText, badge: orders.filter(o => o.paymentStatus === "Pending Approval").length },
    { name: "Customer Lookup", icon: UserCheck },
    { name: "Refunds", icon: ShieldAlert },
    { name: "Sales", icon: TrendingUp }
  ];

  if (!isAuthenticated) {
    return (
      <CashierLogin 
        onLoginSuccess={(info) => {
          setIsAuthenticated(true);
          setCashierInfo(info);
        }} 
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800" id="cashier-master-layout">
      
      {/* SIDEBAR NAVIGATION PANEL */}
      <aside 
        className={`bg-slate-900 text-white flex flex-col justify-between border-r border-slate-950 transition-all duration-300 relative ${
          sidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        
        {/* Collapse toggle arrow */}
        <button 
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-6 bg-slate-900 border border-slate-950 text-white p-1 rounded-full hover:text-[#D4AF37] hover:bg-slate-950 transition-colors z-20"
        >
          {sidebarCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>

        {/* Top brand header */}
        <div className="p-5 border-b border-slate-950/40 space-y-2">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-gradient-to-tr from-[#D4AF37] to-amber-500 rounded-xl flex items-center justify-center font-serif font-black text-slate-950 text-base shadow-lg shrink-0">
              G
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="font-serif font-black text-xs tracking-wider text-[#D4AF37]">GOURMETBITE</h1>
                <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest leading-none">POS TERMINAL</p>
              </div>
            )}
          </div>
        </div>

        {/* Menu list */}
        <nav className="flex-grow py-6 px-3 space-y-1.5 overflow-y-auto no-scrollbar max-h-[70vh]">
          {sidebarItems.map(item => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.name;

            return (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`w-full flex items-center p-3 rounded-xl transition-all relative ${
                  isActive 
                    ? "bg-slate-950 text-[#D4AF37] font-black border-l-4 border-[#D4AF37]" 
                    : "text-slate-400 hover:text-white hover:bg-slate-950/30"
                }`}
                title={item.name}
              >
                <IconComponent className={`w-4.5 h-4.5 shrink-0 ${isActive ? "text-[#D4AF37]" : ""}`} />
                {!sidebarCollapsed && (
                  <span className="ml-3 text-xs font-serif truncate">{item.name}</span>
                )}

                {/* Badge if any */}
                {item.badge && item.badge > 0 && !sidebarCollapsed && (
                  <span className="absolute right-3 bg-rose-600 text-white text-[8px] font-mono px-1.5 py-0.5 rounded font-black animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom User Profile */}
        <div className="p-4 border-t border-slate-950/40 space-y-3 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-slate-850 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] font-bold text-xs shrink-0">
              {cashierInfo?.name ? cashierInfo.name.split(" ").map(n => n[0]).join("") : "CS"}
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <p className="font-serif font-black text-xs text-slate-200 truncate">{cashierInfo?.name || "John Cashier"}</p>
                <p className="text-[9px] font-mono text-slate-400 leading-none truncate">{cashierInfo?.id || "CSH-901"} • {cashierInfo?.branch || "Manhattan Central"}</p>
              </div>
            )}
          </div>

          {!sidebarCollapsed && (
            <button 
              onClick={() => {
                if (confirm("Proceed to terminate current cashier session?")) {
                  setIsAuthenticated(false);
                  setCashierInfo(null);
                  triggerToast("Session terminated. Logging out...");
                  if (onLogout) onLogout();
                }
              }}
              className="w-full py-2 bg-slate-950 hover:bg-rose-950 text-slate-400 hover:text-rose-400 font-mono text-[9px] uppercase font-black rounded-xl border border-slate-950 transition-colors flex items-center justify-center space-x-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>TERMINATE SESSION</span>
            </button>
          )}
        </div>

      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-grow p-6 sm:p-8 overflow-y-auto max-h-screen relative no-scrollbar">
        
        {/* Render Active Tab Component */}
        {activeTab === "Dashboard" && (
          <CashierDashboardHome 
            orders={orders}
            onNavigateToTab={setActiveTab}
            onViewOrder={(order) => triggerToast(`View detailed parameters of Order ${order.id}`)}
            onEditOrder={(order) => triggerToast(`Opened inline POS editor for Order ${order.id}`)}
            onPrintReceipt={(order) => triggerToast(`Print spool job initialized for Ticket ${order.id}`)}
            onCancelOrder={(id) => onUpdateOrderStatus(id, "Completed", { paymentStatus: "Refunded" })}
            onTriggerToast={triggerToast}
          />
        )}

        {activeTab === "Online Orders" && (
          <OnlineOrdersTab 
            orders={orders}
            onUpdateOrderStatus={onUpdateOrderStatus}
            onTriggerToast={triggerToast}
          />
        )}

        {activeTab === "Pending Orders" && (
          <PendingOrdersTab 
            orders={orders}
            onUpdateOrderStatus={onUpdateOrderStatus}
            onTriggerToast={triggerToast}
          />
        )}

        {activeTab === "Table Orders" && (
          <TableOrdersTab 
            orders={orders}
            onUpdateOrderStatus={onUpdateOrderStatus}
            onTriggerToast={triggerToast}
            onNavigateToTab={setActiveTab}
          />
        )}

        {activeTab === "Pickup Orders" && (
          <PickupOrdersTab 
            onTriggerToast={triggerToast}
          />
        )}

        {activeTab === "Payment Processing" && (
          <PaymentProcessingTab 
            onTriggerToast={triggerToast}
          />
        )}

        {activeTab === "Receipts" && (
          <ReceiptsTab 
            orders={orders}
            onUpdateOrderStatus={onUpdateOrderStatus}
            onTriggerToast={triggerToast}
          />
        )}

        {activeTab === "Customer Lookup" && (
          <CustomerLookupTab 
            onTriggerToast={triggerToast}
            onNavigateToTab={setActiveTab}
          />
        )}

        {activeTab === "Refunds" && (
          <RefundsTab 
            onTriggerToast={triggerToast}
          />
        )}

        {activeTab === "Sales" && (
          <SalesTab 
            orders={orders}
            onTriggerToast={triggerToast}
          />
        )}

      </main>

      {/* REAL-TIME NOTIFICATION CHIME TOAST POPUP */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 border-2 border-[#D4AF37] text-white p-4 rounded-2xl shadow-2xl flex items-center space-x-3 max-w-sm z-50 animate-slideUp">
          <div className="p-2 bg-[#D4AF37]/10 text-[#D4AF37] rounded-xl shrink-0">
            <Bell className="w-4 h-4 animate-bounce" />
          </div>
          <div>
            <span className="text-[8px] font-mono text-slate-400 uppercase block tracking-widest">POS Notification Alert</span>
            <span className="text-xs font-serif font-black block mt-0.5 text-[#D4AF37]">
              {toastMessage}
            </span>
          </div>
        </div>
      )}

    </div>
  );
}
