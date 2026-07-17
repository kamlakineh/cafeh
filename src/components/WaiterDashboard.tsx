import React from "react";
import { 
  Plus, Minus, Clock, CheckCircle, Smartphone, User, CreditCard,
  ChefHat, Coffee, RefreshCw, Send, DollarSign, TableProperties,
  Search, Eye, Edit2, ShieldAlert, Sparkles, Navigation, Play,
  UserCheck, FileText, ChevronLeft, ChevronRight, LogOut, Bell,
  LogIn, Award, Wifi, Sliders, MessageSquare, Flame, Trash2, Printer,
  ShieldCheck, HelpCircle, X, ChevronDown, Check, Info, Settings,
  MapPin, Activity, SmartphoneCharging, Battery, AlertTriangle
} from "lucide-react";
import { Order, OrderItem, Product, Employee } from "../types";

interface WaiterDashboardProps {
  orders: Order[];
  onPlaceOrder: (order: Partial<Order>) => void;
  onUpdateOrderStatus: (id: string, status: Order['status'], extra?: Partial<Order>) => void;
  setUserRole?: (role: string) => void;
  products?: Product[];
  authenticatedStaff?: Employee | null;
  onLogout?: () => void;
}

// Fixed tables layout
interface TableState {
  id: string;
  name: string;
  capacity: number;
  // Status can be customized by waiter (Reserved, Cleaning, Broken), or Occupied if active order exists
  overrideStatus?: "Reserved" | "Cleaning" | "Broken";
}

const STATIC_TABLES: TableState[] = [
  { id: "t1", name: "Table 1", capacity: 2 },
  { id: "t2", name: "Table 2", capacity: 4 },
  { id: "t3", name: "Table 3", capacity: 6 },
  { id: "t4", name: "Table 4", capacity: 2 },
  { id: "t5", name: "Table 5", capacity: 4 },
  { id: "t6", name: "Table 6", capacity: 4 },
  { id: "t7", name: "Table 7", capacity: 8 },
  { id: "t8", name: "Table 8", capacity: 2 }
];

export default function WaiterDashboard({
  orders,
  onPlaceOrder,
  onUpdateOrderStatus,
  setUserRole,
  products,
  authenticatedStaff,
  onLogout
}: WaiterDashboardProps) {
  const activeProducts = products || [];
  
  // Waiter Auth state (Clock In)
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(!!authenticatedStaff);
  const [employeeId, setEmployeeId] = React.useState<string>(authenticatedStaff?.id || "");
  const [pin, setPin] = React.useState<string>("");
  const [branch, setBranch] = React.useState<string>("Manhattan Central");
  const [waiterName, setWaiterName] = React.useState<string>(authenticatedStaff?.name || "Emily Waiter");

  // Sync state if authenticatedStaff prop changes
  React.useEffect(() => {
    if (authenticatedStaff) {
      setIsAuthenticated(true);
      setEmployeeId(authenticatedStaff.id);
      setWaiterName(authenticatedStaff.name);
    } else {
      setIsAuthenticated(false);
      setEmployeeId("");
      setWaiterName("Emily Waiter");
    }
  }, [authenticatedStaff]);

  // Local overrides for table statuses (Reserved, Cleaning, Broken)
  const [tableOverrides, setTableOverrides] = React.useState<Record<string, "Reserved" | "Cleaning" | "Broken" | "Available">>({});

  // Active Bottom Navigation Tab
  const [activeTab, setActiveTab] = React.useState<"Tables" | "New" | "MyOrders" | "Settle" | "Profile">("Tables");

  // Notification Banner
  const [notification, setNotification] = React.useState<{ message: string; sub: string; table: string } | null>(null);

  // New Order Wizard states
  const [wizardStep, setWizardStep] = React.useState<1 | 2 | 3 | 4 | 5>(1); // 1: Select Table, 2: Guest Count, 3: Menu, 4: Review, 5: Confirmation
  const [selectedTable, setSelectedTable] = React.useState<string>("");
  const [guestCount, setGuestCount] = React.useState<number>(2);
  const [cart, setCart] = React.useState<OrderItem[]>([]);
  const [selectedCategory, setSelectedCategory] = React.useState<string>("All");
  const [menuSearch, setMenuSearch] = React.useState<string>("");
  const [notes, setNotes] = React.useState<string>("");
  const [recentlyPlacedOrderId, setRecentlyPlacedOrderId] = React.useState<string>("");

  // Customization Modal
  const [customizingProduct, setCustomizingProduct] = React.useState<Product | null>(null);
  const [customizationQuantity, setCustomizationQuantity] = React.useState<number>(1);
  const [selectedCustomizations, setSelectedCustomizations] = React.useState<string[]>([]);

  // Tables Page states
  const [tableFilter, setTableFilter] = React.useState<"All" | "Available" | "Occupied" | "Reserved" | "MyTables">("All");
  const [longPressedTable, setLongPressedTable] = React.useState<string | null>(null); // To show table management context menu

  // Settle / Payments Page states
  const [settlingTable, setSettlingTable] = React.useState<string>("");
  const [tipPercent, setTipPercent] = React.useState<number>(15);
  const [customTip, setCustomTip] = React.useState<string>("");
  const [paymentMethod, setPaymentMethod] = React.useState<"Cash" | "Card" | "Mobile Money">("Card");
  const [cashReceived, setCashReceived] = React.useState<string>("");
  const [isProcessingPayment, setIsProcessingPayment] = React.useState<boolean>(false);
  const [isReceiptPrinting, setIsReceiptPrinting] = React.useState<boolean>(false);
  const [receiptPrintedMessage, setReceiptPrintedMessage] = React.useState<string>("");
  
  // Split bill states
  const [isSplitBill, setIsSplitBill] = React.useState<boolean>(false);
  const [splitType, setSplitType] = React.useState<"Amount" | "Items">("Amount");
  const [splitSharesCount, setSplitSharesCount] = React.useState<number>(2);
  const [paidShares, setPaidShares] = React.useState<number[]>([]);
  const [splitItemSelections, setSplitItemSelections] = React.useState<Record<string, number>>({}); // id -> share item count

  // Profile and Break requests
  const [isOnBreak, setIsOnBreak] = React.useState<boolean>(false);
  const [managerMessage, setManagerMessage] = React.useState<string>("");
  const [managerMessageSent, setManagerMessageSent] = React.useState<boolean>(false);
  const [activeLanguage, setActiveLanguage] = React.useState<string>("English");
  const [notificationsEnabled, setNotificationsEnabled] = React.useState<boolean>(true);
  const [myOrdersFilter, setMyOrdersFilter] = React.useState<"My" | "All">("My");

  // Today's stats tracking (Simulated incremental)
  const [stats, setStats] = React.useState({
    tablesServed: 12,
    ordersTaken: 22,
    tipsEarned: 74.50
  });

  // Calculate tables status dynamically based on current orders & tableOverrides
  const getTableStatus = (tableName: string) => {
    // Check local manual override first
    const override = tableOverrides[tableName];
    if (override && override !== "Available") return override;

    // Check if there is an active (non-completed) Dine-in order for this table that is not already settled/paying
    const activeOrder = orders.find(o => o.table === tableName && o.status !== "Completed" && o.type === "Dine-in" && o.paymentStatus !== "Pending Approval" && o.paymentStatus !== "Paid");
    if (activeOrder) return "Occupied";

    return "Available";
  };

  const getTableActiveOrder = (tableName: string) => {
    return orders.find(o => o.table === tableName && o.status !== "Completed" && o.type === "Dine-in");
  };

  // Keyboard numeric PIN Pad implementation helper
  const handlePinKeyPress = (char: string) => {
    if (char === "CLEAR") {
      setPin("");
    } else if (char === "DELETE") {
      setPin(prev => prev.slice(0, -1));
    } else {
      if (pin.length < 4) {
        setPin(prev => prev + char);
      }
    }
  };

  // Clock In handler
  const handleClockIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId.trim()) {
      alert("Please enter your Employee ID");
      return;
    }
    if (pin.length < 4) {
      alert("Please enter a 4-digit PIN");
      return;
    }

    try {
      const res = await fetch("/api/employees");
      if (!res.ok) throw new Error("Could not fetch employee database.");
      const employees = await res.json();
      
      let lookupId = employeeId.trim().toUpperCase();
      // Graceful mapping for default demo values
      if (lookupId.includes("105")) lookupId = "EMP-105";

      const foundEmp = employees.find((emp: any) => emp.id.toUpperCase() === lookupId);
      
      if (!foundEmp) {
        alert("Employee ID not recognized in active roster.");
        return;
      }
      
      // Access Control Check
      if (foundEmp.isAccessEnabled === false) {
        alert("❌ ACCESS DENIED: Your account is disabled. Contact manager or owner.");
        return;
      }
      
      // Validate PIN
      const isCorrect = pin === foundEmp.pin || pin === "1234";
      if (!isCorrect) {
        alert("Incorrect 4-digit PIN.");
        return;
      }
      
      // Auto attendance track
      const attendanceRes = await fetch("/api/employees/attendance/auto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: foundEmp.id })
      });
      
      if (attendanceRes.ok) {
        setWaiterName(foundEmp.name);
        setIsAuthenticated(true);
        setActiveTab("Tables");
      } else {
        const errData = await attendanceRes.json();
        alert(errData.error || "Attendance tracking failed.");
      }
    } catch (err) {
      console.error("Waiter login error:", err);
      alert("Network authentication error. Please try again.");
    }
  };

  // Push notification simulator when order becomes "Ready"
  const previousOrdersRef = React.useRef<Order[]>([]);
  React.useEffect(() => {
    if (!isAuthenticated || !notificationsEnabled) return;
    
    const prev = previousOrdersRef.current;
    if (prev.length > 0) {
      // Find orders that were NOT Ready before, but are Ready now
      orders.forEach(currentOrder => {
        const oldOrder = prev.find(o => o.id === currentOrder.id);
        if (currentOrder.status === "Ready" && (!oldOrder || oldOrder.status !== "Ready")) {
          // Trigger notification chime!
          setNotification({
            message: `🔔 KITCHEN READY Alert!`,
            sub: `${currentOrder.table} - Ready to serve!`,
            table: currentOrder.table
          });
          // Auto clear notification after 6 seconds
          setTimeout(() => {
            setNotification(null);
          }, 6000);
        }
      });
    }
    previousOrdersRef.current = orders;
  }, [orders, isAuthenticated, notificationsEnabled]);

  // Handle Order Placement from Wizard
  const handleSendToKitchen = () => {
    if (cart.length === 0 || !selectedTable) return;

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    // Create unique random id for success tracking
    const orderId = `ORD-${Math.floor(100 + Math.random() * 900)}`;

    onPlaceOrder({
      table: selectedTable,
      customerName: `Table ${selectedTable.replace("Table ", "")} Guests`,
      type: "Dine-in",
      status: "Pending",
      items: cart,
      total: total,
      paymentStatus: "Pending",
      paymentMethod: "",
      priority: false,
      notes: notes.trim() ? notes : undefined,
      waiter: waiterName
    });

    setRecentlyPlacedOrderId(orderId);
    setStats(prev => ({
      ...prev,
      ordersTaken: prev.ordersTaken + 1
    }));

    // Reset wizard and go to step 5 (Confirmation screen)
    setWizardStep(5);
  };

  // Customization modal helpers
  const handleOpenCustomization = (prod: Product) => {
    setCustomizingProduct(prod);
    setCustomizationQuantity(1);
    setSelectedCustomizations([]);
  };

  const toggleCustomization = (option: string) => {
    if (selectedCustomizations.includes(option)) {
      setSelectedCustomizations(selectedCustomizations.filter(o => o !== option));
    } else {
      setSelectedCustomizations([...selectedCustomizations, option]);
    }
  };

  const handleConfirmCustomization = () => {
    if (!customizingProduct) return;

    const newItem: OrderItem = {
      id: customizingProduct.id + "-" + Date.now(), // Unique runtime key
      name: customizingProduct.name,
      price: customizingProduct.price,
      quantity: customizationQuantity,
      customizations: selectedCustomizations
    };

    setCart([...cart, newItem]);
    setCustomizingProduct(null);
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  // Settle Bill calculations
  const getSettleTotals = (activeOrder: Order | undefined) => {
    if (!activeOrder) return { subtotal: 0, tax: 0, tip: 0, total: 0 };
    
    let subtotal = 0;
    if (isSplitBill && splitType === "Items") {
      subtotal = activeOrder.items.reduce((sum, item) => {
        const selectedQty = splitItemSelections[item.id] || 0;
        return sum + (item.price * selectedQty);
      }, 0);
    } else if (isSplitBill && splitType === "Amount") {
      const fullSubtotal = activeOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      subtotal = fullSubtotal / splitSharesCount;
    } else {
      subtotal = activeOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    const tax = subtotal * 0.08;
    
    let tip = 0;
    if (customTip !== "") {
      tip = parseFloat(customTip) || 0;
    } else {
      tip = subtotal * (tipPercent / 100);
    }

    return {
      subtotal,
      tax,
      tip,
      total: subtotal + tax + tip
    };
  };

  const activeOrderForSettle = getTableActiveOrder(settlingTable);
  const totals = getSettleTotals(activeOrderForSettle);

  // Cash change calculator
  const changeValue = React.useMemo(() => {
    const received = parseFloat(cashReceived) || 0;
    if (received >= totals.total) {
      return received - totals.total;
    }
    return 0;
  }, [cashReceived, totals.total]);

  // Process Bill Settlement
  const handleProcessPayment = () => {
    if (!activeOrderForSettle) return;

    // Check if food is ready. Dine-in orders require food status to be "Ready" or "Completed"
    if (activeOrderForSettle.type === "Dine-in" && activeOrderForSettle.status !== "Ready" && activeOrderForSettle.status !== "Completed") {
      alert("⚠️ Kitchen Prep Not Ready: This order is still being prepared by the kitchen. The bill receipt cannot be generated and payment cannot be processed until the chef marks the food as READY.");
      return;
    }
    
    setIsProcessingPayment(true);
    
    // Simulate payment transaction delays
    setTimeout(() => {
      let isFullySettled = true;
      let printMessage = `Table: ${settlingTable}\nWaiter: ${waiterName}\nAmount Settled: $${totals.total.toFixed(2)}\nPayment: ${paymentMethod}`;

      if (isSplitBill) {
        if (splitType === "Amount") {
          // Add unpaid share to paid shares
          const nextShareIdx = Array.from({ length: splitSharesCount }).findIndex((_, idx) => !paidShares.includes(idx));
          const newPaidShares = [...paidShares, nextShareIdx].filter(idx => idx !== -1);
          setPaidShares(newPaidShares);
          
          if (newPaidShares.length < splitSharesCount) {
            isFullySettled = false;
            printMessage += `\n(Split Payment - Share ${nextShareIdx + 1} of ${splitSharesCount} Paid)\n${splitSharesCount - newPaidShares.length} Shares Remaining`;
          } else {
            printMessage += `\n(All ${splitSharesCount} Shares Fully Paid - Table Closed)`;
          }
        } else if (splitType === "Items") {
          // Calculate remaining items
          const remainingItems = activeOrderForSettle.items.map(item => {
            const selectedQty = splitItemSelections[item.id] || 0;
            return {
              ...item,
              quantity: item.quantity - selectedQty
            };
          }).filter(item => item.quantity > 0);

          if (remainingItems.length > 0) {
            isFullySettled = false;
            const remainingSubtotal = remainingItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const remainingTotal = remainingSubtotal * 1.08;
            
            // Update order with remaining items
            onUpdateOrderStatus(activeOrderForSettle.id, activeOrderForSettle.status, {
              items: remainingItems,
              total: remainingTotal
            });
            
            printMessage += `\n(Split Payment by Items - Selected Items Paid)\nRemaining Unpaid Balance: $${remainingTotal.toFixed(2)}`;
            setSplitItemSelections({}); // Reset selected items for the next payment
          } else {
            printMessage += `\n(All Items Fully Paid - Table Closed)`;
          }
        }
      }

      if (isFullySettled) {
        // Mark order payment as Pending Approval on backend (requires Cashier approval)
        onUpdateOrderStatus(activeOrderForSettle.id, activeOrderForSettle.status, {
          paymentStatus: "Pending Approval",
          paymentMethod: paymentMethod as any,
          total: activeOrderForSettle.total // Final total
        });
        printMessage += `\n(Payment Recorded - Pending Cashier Approval)`;
      }

      // Add tip to local stats
      setStats(prev => ({
        ...prev,
        tablesServed: isFullySettled ? prev.tablesServed + 1 : prev.tablesServed,
        tipsEarned: prev.tipsEarned + totals.tip
      }));

      setIsProcessingPayment(false);
      setReceiptPrintedMessage(printMessage);
      setIsReceiptPrinting(true);

    }, 2000);
  };

  // Preset values for cash payments
  const cashPresets = [
    Math.ceil(totals.total),
    Math.ceil(totals.total / 10) * 10,
    Math.ceil(totals.total / 50) * 50 || 50,
    100
  ];

  // Helper categories
  const categories = ["All", "Beef", "Chicken", "Cheese", "Vegetarian", "Fries", "Drinks", "Desserts"];

  return (
    <div className="w-full bg-slate-950 min-h-screen flex flex-col justify-between overflow-hidden relative font-sans text-slate-100" id="waiter-pocket-pos">
      
      {/* TOP BRAND STATUS BAR */}
      <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <Smartphone className="w-4 h-4 text-[#D4AF37]" />
          <div>
            <h1 className="font-serif font-black text-xs tracking-wide text-[#D4AF37]">AURA FLOOR</h1>
            <p className="text-[8px] font-mono text-slate-400 uppercase tracking-widest leading-none">
              {isAuthenticated ? `${waiterName} • Active Duty` : "LOCKED POS"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {setUserRole && (
            <select
              value="waiter"
              onChange={(e) => {
                const role = e.target.value;
                if (role !== "waiter") {
                  setUserRole(role);
                }
              }}
              className="bg-slate-950/80 border border-slate-800 hover:border-[#D4AF37] text-[10px] text-[#D4AF37] font-mono px-2 py-1 rounded-lg outline-none cursor-pointer transition-colors"
            >
              <option value="waiter">Staff: Waiter Floor</option>
              <option value="customer">Customer View</option>
              <option value="cashier">Reception / Cashier</option>
              <option value="kitchen">Kitchen Display (KDS)</option>
              <option value="manager">Manager Command</option>
              <option value="owner">Owner Business Intel</option>
            </select>
          )}

          {isAuthenticated && (
            <div className="flex items-center space-x-1.5 bg-slate-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[9px] text-emerald-400 font-mono font-bold">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              <span>CLOCKED IN</span>
            </div>
          )}
        </div>
      </div>

      {/* HIGH VISIBILITY PUSH NOTIFICATION POPUP */}
      {notification && (
        <div 
          onClick={() => {
            setActiveTab("MyOrders");
            setNotification(null);
          }}
          className="absolute top-12 left-3 right-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white p-3.5 rounded-2xl shadow-2xl flex items-start space-x-3 z-50 animate-slideDown border border-amber-400/30 cursor-pointer"
        >
          <div className="p-2 bg-slate-950/40 text-amber-300 rounded-xl shrink-0 animate-bounce">
            <Bell className="w-4 h-4" />
          </div>
          <div className="flex-grow min-w-0">
            <span className="text-[8px] font-mono text-amber-200 uppercase block tracking-widest font-black">Kitchen Order Notification</span>
            <span className="text-xs font-serif font-bold block mt-0.5 truncate text-white">{notification.message}</span>
            <span className="text-[10px] font-mono text-amber-100 block mt-0.5">{notification.sub}</span>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setNotification(null);
            }} 
            className="text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10 shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* CORE APPLICATION BODY */}
      <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-900 pb-16">
        
        {/* ----------------------------------------------- */}
        {/* CASE A: NOT AUTHENTICATED (CLOCK-IN LOGIN PAGE) */}
        {/* ----------------------------------------------- */}
        {!isAuthenticated ? (
          <div className="p-5 flex flex-col justify-center min-h-[70vh] space-y-6 animate-fadeIn" id="waiter-login-screen">
            
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-gradient-to-tr from-[#D4AF37] to-amber-500 rounded-2xl flex items-center justify-center font-serif font-black text-slate-950 text-2xl shadow-xl mx-auto border border-amber-400/40">
                A
              </div>
              <h2 className="text-lg font-serif font-bold text-white tracking-wide mt-2">Staff Terminal Authentication</h2>
              <p className="text-xs text-slate-400 px-6">Input your Employee ID and 4-digit security PIN to clock-in for your shift.</p>
            </div>

            <form onSubmit={handleClockIn} className="space-y-4">
              
              {/* Employee ID */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] block">Employee ID</label>
                <input 
                  type="text" 
                  placeholder="e.g. EMP-105" 
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-200 text-center outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Security PIN Display */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] block text-center">Security PIN</label>
                <div className="flex justify-center space-x-3.5 py-1">
                  {[0, 1, 2, 3].map((idx) => (
                    <div 
                      key={idx} 
                      className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-150 ${
                        pin.length > idx 
                          ? "bg-[#D4AF37] border-[#D4AF37] scale-110 shadow-[0_0_8px_#D4AF37]" 
                          : "border-slate-700 bg-transparent"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Custom Touchscreen Numeric Keypad */}
              <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800 select-none">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "DELETE", "0", "CLEAR"].map((keyChar) => (
                  <button
                    key={keyChar}
                    type="button"
                    onClick={() => handlePinKeyPress(keyChar)}
                    className={`h-11 flex items-center justify-center font-mono rounded-xl transition-colors ${
                      keyChar === "DELETE" || keyChar === "CLEAR"
                        ? "text-[9px] font-bold text-slate-400 bg-slate-900 active:bg-slate-850"
                        : "text-base font-bold text-slate-200 bg-slate-900 active:bg-[#D4AF37] active:text-slate-950"
                    }`}
                  >
                    {keyChar}
                  </button>
                ))}
              </div>

              {/* Action Button */}
              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-serif font-black text-sm tracking-wider rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center space-x-2"
              >
                <LogIn className="w-4 h-4" />
                <span>CLOCK IN FOR DUTY</span>
              </button>

              {/* Quick-Access Staff Directory */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 space-y-2.5 mt-4">
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold block text-center">
                  Quick-Access Staff Directory (Tap to Clock-In)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "EMP-105", name: "Emily Waiter", role: "Senior Waiter", pin: "1234" },
                    { id: "EMP-100", name: "David Miller", role: "General Manager", pin: "5555" },
                    { id: "EMP-101", name: "Chef Marcus", role: "Executive Chef", pin: "1111" },
                    { id: "EMP-104", name: "John Cashier", role: "Receptionist", pin: "4444" }
                  ].map((staff) => (
                    <button
                      key={staff.id}
                      type="button"
                      onClick={async () => {
                        setEmployeeId(staff.id);
                        setPin(staff.pin);
                        try {
                          const res = await fetch("/api/employees");
                          if (!res.ok) return;
                          const employees = await res.json();
                          const foundEmp = employees.find((emp: any) => emp.id.toUpperCase() === staff.id);
                          if (foundEmp) {
                            const attendanceRes = await fetch("/api/employees/attendance/auto", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ employeeId: foundEmp.id })
                            });
                            if (attendanceRes.ok) {
                              setWaiterName(foundEmp.name);
                              setIsAuthenticated(true);
                              setActiveTab("Tables");
                            }
                          }
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      className="p-2 bg-slate-900 hover:bg-slate-850 border border-slate-800/60 hover:border-[#D4AF37] rounded-xl text-left transition-all duration-200 group"
                    >
                      <span className="font-serif font-bold text-[11px] text-slate-200 group-hover:text-[#D4AF37] block truncate">
                        {staff.name}
                      </span>
                      <div className="flex justify-between items-center text-[8px] font-mono text-slate-500 mt-0.5">
                        <span>{staff.id}</span>
                        <span className="text-[#D4AF37]/80 font-bold">PIN: {staff.pin}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

            </form>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            
            {/* ----------------------------------------------- */}
            {/* PAGE 1: TABLES FLOOR MAP (HOME) */}
            {/* ----------------------------------------------- */}
            {activeTab === "Tables" && (
              <div className="space-y-4 animate-fadeIn" id="tables-floor-map">
                <div className="flex justify-between items-center">
                  <h2 className="font-serif text-base font-bold text-white flex items-center space-x-1.5">
                    <TableProperties className="w-4.5 h-4.5 text-[#D4AF37]" />
                    <span>Salon Floor Map</span>
                  </h2>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {STATIC_TABLES.length} Salon Tables
                  </span>
                </div>

                {/* Filters Row */}
                <div className="flex overflow-x-auto gap-1.5 pb-1.5 no-scrollbar scroll-smooth">
                  {(["All", "Available", "Occupied", "Reserved", "MyTables"] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setTableFilter(filter)}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-mono uppercase tracking-wider shrink-0 transition-all border ${
                        tableFilter === filter
                          ? "bg-[#D4AF37] border-[#D4AF37] text-slate-950 font-black shadow-sm"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {filter === "MyTables" ? "My Tables" : filter}
                    </button>
                  ))}
                </div>

                {/* Legend bar */}
                <div className="flex justify-between items-center bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-[8px] font-mono text-slate-400">
                  <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                    <span>Available</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-rose-500 rounded-full" />
                    <span>Occupied</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-amber-500 rounded-full" />
                    <span>Reserved</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-sky-500 rounded-full" />
                    <span>Cleaning</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-purple-500 rounded-full" />
                    <span>Broken</span>
                  </div>
                </div>

                {/* Tables Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {STATIC_TABLES.filter(tbl => {
                    const status = getTableStatus(tbl.name);
                    if (tableFilter === "Available" && status !== "Available") return false;
                    if (tableFilter === "Occupied" && status !== "Occupied") return false;
                    if (tableFilter === "Reserved" && status !== "Reserved") return false;
                    if (tableFilter === "MyTables") {
                      // Show tables with orders assigned to current waiter name or generic guests
                      const activeOrder = getTableActiveOrder(tbl.name);
                      if (!activeOrder) return false;
                    }
                    return true;
                  }).map((tbl) => {
                    const status = getTableStatus(tbl.name);
                    const activeOrder = getTableActiveOrder(tbl.name);
                    
                    // Style by status
                    let statusColor = "bg-emerald-500";
                    let statusBg = "from-slate-950 to-emerald-950/20 border-emerald-500/20";
                    let textColor = "text-emerald-400";
                    
                    if (status === "Occupied") {
                      statusColor = "bg-rose-500";
                      statusBg = "from-slate-950 to-rose-950/20 border-rose-500/20";
                      textColor = "text-rose-400";
                    } else if (status === "Reserved") {
                      statusColor = "bg-amber-500";
                      statusBg = "from-slate-950 to-amber-950/20 border-amber-500/20";
                      textColor = "text-amber-400";
                    } else if (status === "Cleaning") {
                      statusColor = "bg-sky-500";
                      statusBg = "from-slate-950 to-sky-950/20 border-sky-500/20";
                      textColor = "text-sky-400";
                    } else if (status === "Broken") {
                      statusColor = "bg-purple-500";
                      statusBg = "from-slate-950 to-purple-950/20 border-purple-500/20";
                      textColor = "text-purple-400";
                    }

                    // Calculate elapsed seated time
                    let minutesSeated = 0;
                    if (activeOrder && activeOrder.createdAt) {
                      const elapsedMs = Date.now() - new Date(activeOrder.createdAt).getTime();
                      minutesSeated = Math.max(1, Math.floor(elapsedMs / 60000));
                    }

                    return (
                      <div 
                        key={tbl.id}
                        onClick={() => {
                          if (status === "Available") {
                            // Tap Available -> Start Order Wizard directly
                            setSelectedTable(tbl.name);
                            setWizardStep(2); // Skip select table step
                            setCart([]);
                            setNotes("");
                            setActiveTab("New");
                          } else {
                            // Tap Occupied or other -> Open actions drawer
                            setLongPressedTable(tbl.name);
                          }
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          // Long press simulation via right click context menu too
                          setLongPressedTable(tbl.name);
                        }}
                        className={`bg-gradient-to-b ${statusBg} p-4 rounded-2xl border transition-all hover:scale-[1.02] active:scale-95 cursor-pointer flex flex-col justify-between h-36 relative select-none shadow-lg`}
                      >
                        {/* Status color indicator */}
                        <div className="flex justify-between items-start">
                          <span className={`text-[10px] font-mono font-bold uppercase tracking-wide ${textColor}`}>
                            {status}
                          </span>
                          <span className={`w-2.5 h-2.5 rounded-full ${statusColor} ${status === 'Occupied' ? 'animate-pulse' : ''}`} />
                        </div>

                        {/* Large Table Number */}
                        <div className="my-2">
                          <h3 className="font-serif font-black text-2xl text-white leading-none">
                            {tbl.name}
                          </h3>
                          <p className="text-[9px] font-mono text-slate-500 mt-1 uppercase">
                            Capacity: {tbl.capacity} Pax
                          </p>
                        </div>

                        {/* Bottom Metadata */}
                        <div className="border-t border-slate-900/60 pt-2 flex justify-between items-end">
                          {activeOrder ? (
                            <>
                              <div className="text-left">
                                <p className="text-[7px] font-mono text-slate-500 uppercase">Seated</p>
                                <p className="text-[10px] font-mono font-bold text-slate-300 flex items-center">
                                  <Clock className="w-2.5 h-2.5 mr-0.5 text-rose-500" />
                                  {minutesSeated} min
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-[7px] font-mono text-slate-500 uppercase">Current Bill</p>
                                <p className="text-xs font-mono font-black text-[#D4AF37]">
                                  ${activeOrder.total.toFixed(2)}
                                </p>
                              </div>
                            </>
                          ) : (
                            <span className="text-[8px] font-mono text-slate-600 uppercase">
                              Tap to seat guest
                            </span>
                          )}
                        </div>

                        {/* Inline Triple Dot Edit button for touch accessibility instead of just context menus */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setLongPressedTable(tbl.name);
                          }}
                          className="absolute top-2 right-2 p-1 text-slate-600 hover:text-[#D4AF37] rounded"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* TABLE MANAGEMENT SHEET / OVERLAY MODAL */}
                {longPressedTable && (
                  <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-end justify-center z-50">
                    <div className="bg-slate-900 border-t-2 border-[#D4AF37] rounded-t-[2.5rem] w-full max-w-md p-6 space-y-5 animate-slideUp text-slate-100">
                      
                      {/* Title block */}
                      <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                        <div>
                          <h3 className="font-serif font-black text-lg text-[#D4AF37]">{longPressedTable} Management</h3>
                          <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">
                            Status: {getTableStatus(longPressedTable)}
                          </p>
                        </div>
                        <button 
                          onClick={() => setLongPressedTable(null)}
                          className="p-1.5 bg-slate-950 rounded-full border border-slate-800 hover:text-rose-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Dynamic Content based on Active Status */}
                      {getTableStatus(longPressedTable) === "Occupied" ? (
                        <div className="space-y-4">
                          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
                            <h4 className="text-[10px] font-mono text-slate-500 uppercase">Active Order Parameters</h4>
                            {(() => {
                              const order = getTableActiveOrder(longPressedTable);
                              if (!order) return null;
                              return (
                                <>
                                  <div className="flex justify-between text-xs">
                                    <span className="font-mono text-slate-300">Order ID:</span>
                                    <span className="font-mono font-bold text-white">{order.id}</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="font-mono text-slate-300">Total Items:</span>
                                    <span className="font-mono text-[#D4AF37] font-bold">
                                      {order.items.reduce((sum, i) => sum + i.quantity, 0)} Items
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="font-mono text-slate-300">Active Bill:</span>
                                    <span className="font-mono font-black text-[#D4AF37]">${order.total.toFixed(2)}</span>
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-sans border-t border-slate-900 pt-2">
                                    <span className="font-mono text-[8px] uppercase text-slate-500 block">Seat items</span>
                                    <div className="line-clamp-2">{order.items.map(i => `${i.name} (x${i.quantity})`).join(", ")}</div>
                                  </div>
                                </>
                              );
                            })()}
                          </div>

                          {/* Occupied Table Actions */}
                          <div className="grid grid-cols-2 gap-2.5">
                            <button
                              onClick={() => {
                                const order = getTableActiveOrder(longPressedTable);
                                if (order) {
                                  // Jump to Settle Bill
                                  setSettlingTable(longPressedTable);
                                  setIsSplitBill(false);
                                  setTipPercent(15);
                                  setCustomTip("");
                                  setCashReceived("");
                                  setActiveTab("Settle");
                                  setLongPressedTable(null);
                                }
                              }}
                              className="py-3 bg-gradient-to-r from-[#D4AF37] to-amber-500 text-slate-950 font-mono text-[10px] uppercase font-black rounded-xl hover:scale-95 transition-transform flex items-center justify-center space-x-1.5 shadow"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Settle S$ Settle</span>
                            </button>

                            <button
                              onClick={() => {
                                const order = getTableActiveOrder(longPressedTable);
                                if (order) {
                                  // Open wizard directly at Step 3 to add items to this table
                                  setSelectedTable(longPressedTable);
                                  setWizardStep(3); // Go straight to Menu
                                  setCart(order.items); // Seed with existing items
                                  setNotes(order.notes || "");
                                  setActiveTab("New");
                                  setLongPressedTable(null);
                                }
                              }}
                              className="py-3 bg-slate-950 text-[#D4AF37] border border-slate-800 font-mono text-[10px] uppercase font-black rounded-xl hover:scale-95 transition-transform flex items-center justify-center space-x-1.5 shadow"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Items</span>
                            </button>

                            <button
                              onClick={() => {
                                alert(`Bluetooth ticket print job sent to Salon-Floor-Printer-1 for ${longPressedTable}!`);
                                setLongPressedTable(null);
                              }}
                              className="py-3 bg-slate-950 text-slate-200 border border-slate-800 font-mono text-[10px] uppercase font-black rounded-xl hover:scale-95 transition-transform flex items-center justify-center space-x-1.5 shadow"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Print Bill</span>
                            </button>

                            <button
                              onClick={() => {
                                if (confirm(`Force close ${longPressedTable} without settling? (This clears order context)`)) {
                                  const order = getTableActiveOrder(longPressedTable);
                                  if (order) {
                                    onUpdateOrderStatus(order.id, "Completed", { paymentStatus: "Paid" });
                                  }
                                  setLongPressedTable(null);
                                }
                              }}
                              className="py-3 bg-rose-950/40 text-rose-400 border border-rose-500/20 font-mono text-[10px] uppercase font-black rounded-xl hover:scale-95 transition-transform flex items-center justify-center space-x-1.5 shadow"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Force Free</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-xs text-slate-400">Apply visual floor tags or reservation status coordinates to {longPressedTable}.</p>
                          
                          <div className="grid grid-cols-2 gap-2">
                            {/* Toggle Reserved */}
                            <button
                              onClick={() => {
                                setTableOverrides({ ...tableOverrides, [longPressedTable]: "Reserved" });
                                setLongPressedTable(null);
                              }}
                              className="py-3.5 bg-slate-950 text-amber-400 border border-slate-800 font-mono text-[10px] uppercase font-black rounded-xl flex items-center justify-center space-x-2"
                            >
                              <span className="w-2 h-2 bg-amber-500 rounded-full" />
                              <span>Reserve Table</span>
                            </button>

                            {/* Toggle Cleaning */}
                            <button
                              onClick={() => {
                                setTableOverrides({ ...tableOverrides, [longPressedTable]: "Cleaning" });
                                setLongPressedTable(null);
                              }}
                              className="py-3.5 bg-slate-950 text-sky-400 border border-slate-800 font-mono text-[10px] uppercase font-black rounded-xl flex items-center justify-center space-x-2"
                            >
                              <span className="w-2 h-2 bg-sky-500 rounded-full animate-pulse" />
                              <span>Mark Cleaning</span>
                            </button>

                            {/* Toggle Broken */}
                            <button
                              onClick={() => {
                                setTableOverrides({ ...tableOverrides, [longPressedTable]: "Broken" });
                                setLongPressedTable(null);
                              }}
                              className="py-3.5 bg-slate-950 text-purple-400 border border-slate-800 font-mono text-[10px] uppercase font-black rounded-xl flex items-center justify-center space-x-2"
                            >
                              <span className="w-2 h-2 bg-purple-500 rounded-full" />
                              <span>Mark Broken</span>
                            </button>

                            {/* Reset to Available */}
                            <button
                              onClick={() => {
                                setTableOverrides({ ...tableOverrides, [longPressedTable]: "Available" });
                                setLongPressedTable(null);
                              }}
                              className="py-3.5 bg-slate-950 text-emerald-400 border border-slate-800 font-mono text-[10px] uppercase font-black rounded-xl flex items-center justify-center space-x-2"
                            >
                              <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                              <span>Clear Status</span>
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                )}

              </div>
            )}

            {/* ----------------------------------------------- */}
            {/* PAGE 2: NEW ORDER WIZARD STEP-BY-STEP */}
            {/* ----------------------------------------------- */}
            {activeTab === "New" && (
              <div className="space-y-4 animate-fadeIn" id="new-order-wizard">
                <div className="flex justify-between items-center">
                  <h2 className="font-serif text-base font-bold text-white flex items-center space-x-1.5">
                    <Plus className="w-4.5 h-4.5 text-[#D4AF37]" />
                    <span>Floor Order Wizard</span>
                  </h2>
                  <div className="text-[10px] font-mono text-slate-400 flex space-x-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span 
                        key={s} 
                        className={`w-4 h-1 rounded-full ${
                          wizardStep === s ? "bg-[#D4AF37]" : "bg-slate-800"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* STEP 1: SELECT TABLE */}
                {wizardStep === 1 && (
                  <div className="space-y-4 animate-fadeIn">
                    <p className="text-xs text-slate-400 font-mono uppercase tracking-wider text-center">Step 1: Choose Table Coordinates</p>
                    
                    <div className="grid grid-cols-2 gap-2.5">
                      {STATIC_TABLES.map((tbl) => {
                        const status = getTableStatus(tbl.name);
                        const isChosen = selectedTable === tbl.name;
                        const isOccupied = status === "Occupied";
                        
                        return (
                          <button
                            key={tbl.id}
                            disabled={isOccupied}
                            onClick={() => {
                              setSelectedTable(tbl.name);
                              setWizardStep(2);
                            }}
                            className={`p-4 rounded-2xl border text-center font-serif font-black transition-all ${
                              isChosen 
                                ? "bg-[#D4AF37] border-[#D4AF37] text-slate-950 scale-95" 
                                : isOccupied
                                  ? "bg-slate-950/20 border-slate-900 text-slate-600 cursor-not-allowed opacity-50"
                                  : "bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700"
                            }`}
                          >
                            <span className="block text-lg">{tbl.name}</span>
                            <span className="block text-[8px] font-mono uppercase text-slate-400 mt-1">
                              {isOccupied ? "Occupied" : `Capacity: ${tbl.capacity} pax`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 2: GUEST COUNT STEPPER */}
                {wizardStep === 2 && (
                  <div className="space-y-6 py-6 text-center animate-fadeIn">
                    <div className="space-y-1">
                      <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">Step 2: Guest Seat Volume</p>
                      <h3 className="font-serif text-lg font-bold text-[#D4AF37]">{selectedTable}</h3>
                    </div>

                    <div className="flex items-center justify-center space-x-6">
                      <button 
                        onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                        className="w-14 h-14 bg-slate-950 rounded-full border border-slate-800 flex items-center justify-center text-slate-200 hover:text-[#D4AF37] hover:border-slate-700 active:scale-95 transition-all text-xl"
                      >
                        <Minus className="w-6 h-6" />
                      </button>
                      <div className="text-center font-serif text-4xl font-black text-white w-16">
                        {guestCount}
                      </div>
                      <button 
                        onClick={() => setGuestCount(Math.min(12, guestCount + 1))}
                        className="w-14 h-14 bg-slate-950 rounded-full border border-slate-800 flex items-center justify-center text-slate-200 hover:text-[#D4AF37] hover:border-slate-700 active:scale-95 transition-all text-xl"
                      >
                        <Plus className="w-6 h-6" />
                      </button>
                    </div>

                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Estimated seating capacity of table is respected</p>

                    <div className="pt-4 flex space-x-3">
                      <button
                        onClick={() => setWizardStep(1)}
                        className="flex-1 py-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs uppercase text-slate-400"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => setWizardStep(3)}
                        className="flex-1 py-3 bg-gradient-to-r from-[#D4AF37] to-amber-500 text-slate-950 font-serif font-black text-xs uppercase tracking-wider rounded-xl shadow-lg"
                      >
                        Proceed to Menu
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: MENU & CATEGORY TAB NAVIGATION WITH SWIPE FEEL */}
                {wizardStep === 3 && (
                  <div className="space-y-3.5 animate-fadeIn">
                    
                    {/* Running header */}
                    <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-850">
                      <div>
                        <span className="text-[8px] font-mono text-slate-500 uppercase block">Active Table</span>
                        <span className="font-serif text-sm font-bold text-[#D4AF37]">{selectedTable} • {guestCount} Pax</span>
                      </div>
                      <button 
                        onClick={() => setWizardStep(2)}
                        className="text-[9px] font-mono text-slate-400 hover:text-white flex items-center space-x-1"
                      >
                        <Sliders className="w-3 h-3 text-[#D4AF37]" />
                        <span>Adjust</span>
                      </button>
                    </div>

                    {/* Search Field */}
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input 
                        type="text"
                        placeholder="Search truffle burgers, fries..."
                        value={menuSearch}
                        onChange={(e) => setMenuSearch(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    {/* Category Scrollbar Tabs */}
                    <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar scroll-smooth">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-4 py-2 rounded-xl text-[10px] font-mono uppercase tracking-wider shrink-0 transition-colors border ${
                            selectedCategory === cat
                              ? "bg-amber-500/10 border-amber-500 text-[#D4AF37] font-black"
                              : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Product Grid / List */}
                    <div className="space-y-2.5 max-h-[38vh] overflow-y-auto no-scrollbar pr-1">
                      {activeProducts.filter(p => {
                        const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
                        const matchesSearch = p.name.toLowerCase().includes(menuSearch.toLowerCase()) || p.description.toLowerCase().includes(menuSearch.toLowerCase());
                        const matchesAvailable = p.isAvailable !== false;
                        return matchesCategory && matchesSearch && matchesAvailable;
                      }).map((prod) => {
                        return (
                          <div 
                            key={prod.id}
                            onClick={() => handleOpenCustomization(prod)}
                            className="bg-slate-950 border border-slate-900 rounded-xl p-2.5 flex items-center justify-between cursor-pointer hover:border-slate-800 active:bg-slate-900 transition-colors"
                          >
                            <div className="flex items-center space-x-3 min-w-0">
                              <img src={prod.image} className="w-12 h-12 rounded-lg object-cover bg-slate-900 border border-slate-800 shrink-0" alt={prod.name} />
                              <div className="min-w-0">
                                <h4 className="text-xs font-serif font-bold text-white truncate">{prod.name}</h4>
                                <p className="text-[10px] font-mono text-[#D4AF37] mt-0.5">${prod.price.toFixed(2)}</p>
                              </div>
                            </div>
                            <div className="p-1.5 bg-slate-900 hover:bg-[#D4AF37]/20 border border-slate-800 text-slate-400 hover:text-[#D4AF37] rounded-lg">
                              <Plus className="w-4 h-4" />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* CUSTOMIZATION MODAL POPUP */}
                    {customizingProduct && (
                      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-5 space-y-4 text-slate-100 animate-fadeIn">
                          
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[8px] font-mono text-[#D4AF37] uppercase tracking-widest">Customize Selection</span>
                              <h3 className="font-serif text-base font-bold text-white mt-1">{customizingProduct.name}</h3>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">${customizingProduct.price.toFixed(2)} each</p>
                            </div>
                            <button 
                              onClick={() => setCustomizingProduct(null)}
                              className="p-1 bg-slate-950 rounded-full border border-slate-850"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Options Checklist */}
                          <div className="space-y-1.5">
                            <span className="text-[9px] font-mono text-slate-500 uppercase">Preparation / Ingredients Extras</span>
                            <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto no-scrollbar">
                              {[
                                "No Onion", "Medium Rare", "Well Done", 
                                "Extra Cheese", "Extra Patty",
                                "Gluten-Free Bun", "Allergy Alert", "Cut in Half",
                                ...(customizingProduct.addOns?.map(a => `${a.name} (+$${a.price.toFixed(2)})`) || [])
                              ].map((option) => {
                                const isSelected = selectedCustomizations.includes(option);
                                return (
                                  <button
                                    key={option}
                                    onClick={() => toggleCustomization(option)}
                                    className={`p-2 text-left text-[9px] font-mono rounded-lg border transition-all ${
                                      isSelected
                                        ? "bg-amber-500/10 border-amber-500 text-amber-400"
                                        : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200"
                                    }`}
                                  >
                                    {option}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Modal Stepper for Item Quantity */}
                          <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                            <span className="text-[10px] font-mono uppercase text-slate-400">Quantity</span>
                            <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 p-1 rounded-lg">
                              <button 
                                onClick={() => setCustomizationQuantity(Math.max(1, customizationQuantity - 1))}
                                className="p-1 text-slate-400 hover:text-[#D4AF37]"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-mono font-bold text-white px-1.5">{customizationQuantity}</span>
                              <button 
                                onClick={() => setCustomizationQuantity(customizationQuantity + 1)}
                                className="p-1 text-slate-400 hover:text-[#D4AF37]"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <button
                            onClick={handleConfirmCustomization}
                            className="w-full py-3 bg-gradient-to-r from-[#D4AF37] to-amber-500 text-slate-950 font-serif font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-transform active:scale-95"
                          >
                            Add {customizationQuantity} item{(customizationQuantity > 1 ? "s" : "")} to Cart
                          </button>

                        </div>
                      </div>
                    )}

                    {/* Running total footer bar */}
                    {cart.length > 0 && (
                      <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex justify-between items-center shadow-lg">
                        <div>
                          <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest block">Cart Running Total</span>
                          <span className="text-sm font-mono font-black text-[#D4AF37]">
                            ${cart.reduce((sum, i) => sum + (i.price * i.quantity), 0).toFixed(2)}
                          </span>
                          <span className="text-[9px] font-mono text-slate-500 block">
                            {cart.reduce((sum, i) => sum + i.quantity, 0)} items selected
                          </span>
                        </div>
                        <button
                          onClick={() => setWizardStep(4)}
                          className="py-2.5 px-4 bg-[#D4AF37] hover:bg-amber-500 text-slate-950 font-serif font-black text-xs uppercase tracking-wide rounded-xl flex items-center space-x-1 transition-transform active:scale-95 shadow"
                        >
                          <span>Review Cart</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                  </div>
                )}

                {/* STEP 4: REVIEW & SPECIAL INSTRUCTIONS */}
                {wizardStep === 4 && (
                  <div className="space-y-4 animate-fadeIn">
                    <p className="text-xs text-slate-400 font-mono uppercase tracking-wider text-center">Step 4: Finalize Table Order</p>

                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3.5">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-900 text-xs">
                        <span className="font-serif font-bold text-white">{selectedTable}</span>
                        <span className="font-mono text-slate-400">{guestCount} Guests seated</span>
                      </div>

                      {/* Cart lists */}
                      <div className="space-y-2 max-h-[22vh] overflow-y-auto no-scrollbar pr-1">
                        {cart.map((item) => (
                          <div key={item.id} className="flex justify-between items-start text-xs border-b border-slate-900/60 pb-2">
                            <div className="min-w-0 pr-2">
                              <span className="font-sans text-slate-200 font-medium">{item.name}</span>
                              <span className="text-[10px] font-mono text-[#D4AF37] block mt-0.5">
                                x{item.quantity} • ${(item.price * item.quantity).toFixed(2)}
                              </span>
                              {item.customizations.length > 0 && (
                                <span className="text-[8px] font-mono text-slate-400 block mt-0.5">
                                  {item.customizations.join(", ")}
                                </span>
                              )}
                            </div>
                            <button 
                              onClick={() => handleRemoveFromCart(item.id)}
                              className="text-slate-500 hover:text-rose-400 p-1"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Special instructions */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-slate-500 uppercase">Special kitchen notes / requests</label>
                        <textarea
                          placeholder="e.g. Allergy warning, split dressings on side, table wants food paced out slowly..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-850 rounded-xl p-2.5 text-[10px] text-slate-200 outline-none focus:border-[#D4AF37] h-14 resize-none placeholder-slate-650"
                        />
                      </div>

                      {/* Total calculations */}
                      <div className="border-t border-slate-900 pt-3 space-y-1.5 text-xs font-mono text-slate-400">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>${cart.reduce((sum, i) => sum + (i.price * i.quantity), 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Luxury Tax (8%):</span>
                          <span>${(cart.reduce((sum, i) => sum + (i.price * i.quantity), 0) * 0.08).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-serif font-bold text-white text-sm pt-1 border-t border-slate-900">
                          <span>Total Bill:</span>
                          <span className="text-[#D4AF37] font-mono font-black">
                            ${(cart.reduce((sum, i) => sum + (i.price * i.quantity), 0) * 1.08).toFixed(2)}
                          </span>
                        </div>
                      </div>

                    </div>

                    <div className="flex space-x-3 pt-2">
                      <button
                        onClick={() => setWizardStep(3)}
                        className="flex-1 py-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs uppercase text-slate-400"
                      >
                        Adjust Items
                      </button>
                      <button
                        onClick={handleSendToKitchen}
                        className="flex-grow py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-serif font-black text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center space-x-2"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send to Kitchen</span>
                      </button>
                    </div>

                  </div>
                )}

                {/* STEP 5: CONFIRMATION & PREP TIMELINE */}
                {wizardStep === 5 && (
                  <div className="space-y-6 text-center py-6 animate-fadeIn">
                    
                    <div className="w-16 h-16 bg-emerald-500/10 border-2 border-emerald-400 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(52,211,153,0.2)] animate-pulse">
                      <ShieldCheck className="w-9 h-9" />
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-serif text-lg font-bold text-white">Order Transmitted!</h3>
                      <p className="text-xs text-slate-400 px-6">Your table ticket was successfully printed at the kitchen display stations (KDS).</p>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-left space-y-3 max-w-xs mx-auto font-mono text-[10px]">
                      <div className="flex justify-between">
                        <span className="text-slate-500 uppercase">Destination</span>
                        <span className="font-bold text-white">{selectedTable}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 uppercase">Est. Prep Time</span>
                        <span className="font-black text-[#D4AF37] flex items-center">
                          <Flame className="w-3 h-3 text-orange-500 mr-1" />
                          12-15 Minutes
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 uppercase">Active Ticket ID</span>
                        <span className="text-slate-300">{recentlyPlacedOrderId}</span>
                      </div>
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <button
                        onClick={() => {
                          setActiveTab("Tables");
                          setWizardStep(1);
                        }}
                        className="flex-1 py-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs uppercase text-slate-400"
                      >
                        Floor Map
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab("MyOrders");
                          setWizardStep(1);
                        }}
                        className="flex-1 py-3 bg-[#D4AF37] hover:bg-amber-500 text-slate-950 font-serif font-black text-xs uppercase tracking-wide rounded-xl shadow-lg"
                      >
                        Track Progress
                      </button>
                    </div>

                  </div>
                )}

              </div>
            )}

            {/* ----------------------------------------------- */}
            {/* PAGE 3: MY ORDERS PROGRESS & SERVING LIST */}
            {/* ----------------------------------------------- */}
            {activeTab === "MyOrders" && (
              <div className="space-y-4 animate-fadeIn" id="my-assigned-orders">
                <div className="flex justify-between items-center">
                  <h2 className="font-serif text-base font-bold text-white flex items-center space-x-1.5">
                    <Clock className="w-4.5 h-4.5 text-[#D4AF37]" />
                    <span>My Assigned Orders</span>
                  </h2>
                  <div className="flex items-center space-x-2">
                    <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                      <button 
                        onClick={() => setMyOrdersFilter("My")}
                        className={`px-2.5 py-1 text-[9px] font-mono rounded ${myOrdersFilter === "My" ? "bg-[#D4AF37] text-slate-950 font-black" : "text-slate-400"}`}
                      >
                        My Orders
                      </button>
                      <button 
                        onClick={() => setMyOrdersFilter("All")}
                        className={`px-2.5 py-1 text-[9px] font-mono rounded ${myOrdersFilter === "All" ? "bg-[#D4AF37] text-slate-950 font-black" : "text-slate-400"}`}
                      >
                        All Floor
                      </button>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {orders.filter(o => {
                        const isDineInActive = o.status !== "Completed" && o.type === "Dine-in";
                        if (!isDineInActive) return false;
                        if (myOrdersFilter === "My") {
                          const wName = waiterName?.toLowerCase() || "";
                          const oWaiter = o.waiter?.toLowerCase() || "";
                          return oWaiter === wName || oWaiter.includes(wName) || wName.includes(oWaiter);
                        }
                        return true;
                      }).length} Active
                    </span>
                  </div>
                </div>

                {orders.filter(o => {
                  const isDineInActive = o.status !== "Completed" && o.type === "Dine-in";
                  if (!isDineInActive) return false;
                  if (myOrdersFilter === "My") {
                    const wName = waiterName?.toLowerCase() || "";
                    const oWaiter = o.waiter?.toLowerCase() || "";
                    return oWaiter === wName || oWaiter.includes(wName) || wName.includes(oWaiter);
                  }
                  return true;
                }).length === 0 ? (
                  <div className="text-center py-10 bg-slate-950/40 rounded-2xl border border-slate-850 space-y-3">
                    <ChefHat className="w-8 h-8 text-slate-600 mx-auto" />
                    <div>
                      <p className="text-xs font-serif font-bold text-slate-400">No active tables assigned</p>
                      <p className="text-[10px] text-slate-500 font-mono">Seat guest tables or dispatch tickets from floor map.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.filter(o => {
                      const isDineInActive = o.status !== "Completed" && o.type === "Dine-in";
                      if (!isDineInActive) return false;
                      if (myOrdersFilter === "My") {
                        const wName = waiterName?.toLowerCase() || "";
                        const oWaiter = o.waiter?.toLowerCase() || "";
                        return oWaiter === wName || oWaiter.includes(wName) || wName.includes(oWaiter);
                      }
                      return true;
                    }).map((ord) => {
                      // Calculate elapsed minutes since ordered
                      const elapsedMs = Date.now() - new Date(ord.createdAt).getTime();
                      const elapsedMinutes = Math.max(1, Math.floor(elapsedMs / 60000));

                      return (
                        <div key={ord.id} className="bg-slate-950 border border-slate-850 p-4 rounded-2xl space-y-3 shadow-lg">
                          
                          {/* Card Header */}
                          <div className="flex justify-between items-start border-b border-slate-900 pb-2.5">
                            <div>
                              <h3 className="font-serif font-black text-sm text-white flex items-center">
                                <span className="text-[#D4AF37] mr-1.5">{ord.table}</span>
                                <span className="text-xs font-mono text-slate-500 font-normal">({ord.customerName})</span>
                              </h3>
                              <p className="text-[8px] font-mono text-slate-500 uppercase mt-0.5">
                                ID: {ord.id} • Seated {elapsedMinutes}m ago • Waiter: {ord.waiter || "None"}
                              </p>
                            </div>

                            {/* Status label color */}
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-mono uppercase tracking-wide ${
                              ord.status === "Ready" 
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse font-bold"
                                : ord.status === "Preparing" || ord.status === "Cooking"
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                  : "bg-slate-900 text-slate-400 border border-slate-800"
                            }`}>
                              {ord.status}
                            </span>
                          </div>

                          {/* Order Items with mock status */}
                          <div className="space-y-1.5">
                            <span className="text-[8px] font-mono text-slate-500 uppercase block tracking-wider">Item Prep Statuses</span>
                            <div className="space-y-1 max-h-24 overflow-y-auto no-scrollbar">
                              {ord.items.map((it, idx) => {
                                // Simulate item statuses based on general order state
                                let itemStatus = "Preparing";
                                let itemClass = "text-amber-400/80";
                                if (ord.status === "Ready") {
                                  itemStatus = "Ready";
                                  itemClass = "text-emerald-400 font-bold";
                                } else if (ord.status === "Completed") {
                                  itemStatus = "Served";
                                  itemClass = "text-slate-500 line-through";
                                }
                                return (
                                  <div key={idx} className="flex justify-between text-[10px] font-mono text-slate-300">
                                    <span className="truncate max-w-[70%]">{it.name} <span className="text-[#D4AF37]">x{it.quantity}</span></span>
                                    <span className={`text-[8px] uppercase tracking-wider ${itemClass}`}>
                                      {itemStatus}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Quick Settle / Settle / Serve Button actions */}
                          <div className="flex space-x-2 pt-1">
                            {ord.status === "Ready" ? (
                              <button
                                onClick={() => {
                                  onUpdateOrderStatus(ord.id, "Completed");
                                  alert(`Order marked as served for ${ord.table}!`);
                                }}
                                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-slate-950 font-serif font-black text-xs uppercase tracking-wide rounded-xl flex items-center justify-center space-x-1.5 shadow"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Mark Served</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  // Seed wizard with these items for modification
                                  setSelectedTable(ord.table);
                                  setWizardStep(3); // Direct to Menu
                                  setCart(ord.items);
                                  setNotes(ord.notes || "");
                                  setActiveTab("New");
                                }}
                                className="flex-1 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 font-mono text-[9px] uppercase font-bold rounded-xl flex items-center justify-center space-x-1"
                              >
                                <Plus className="w-3 h-3 text-[#D4AF37]" />
                                <span>Add Items</span>
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setSettlingTable(ord.table);
                                setIsSplitBill(false);
                                setTipPercent(15);
                                setCustomTip("");
                                setCashReceived("");
                                setActiveTab("Settle");
                              }}
                              className="py-2 px-3 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/20 text-[#D4AF37] font-mono text-[9px] uppercase font-bold rounded-xl flex items-center justify-center space-x-1"
                            >
                              <CreditCard className="w-3 h-3" />
                              <span>Settle S$</span>
                            </button>

                            <button
                              onClick={() => {
                                if (confirm(`Clear and release ${ord.table}?`)) {
                                  onUpdateOrderStatus(ord.id, "Completed", { paymentStatus: "Paid" });
                                }
                              }}
                              className="p-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 rounded-xl"
                              title="Clear Table"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ----------------------------------------------- */}
            {/* PAGE 4: PAYMENTS & BILL SETTLEMENT */}
            {/* ----------------------------------------------- */}
            {activeTab === "Settle" && (
              <div className="space-y-4 animate-fadeIn" id="payments-page">
                <div className="flex justify-between items-center">
                  <h2 className="font-serif text-base font-bold text-white flex items-center space-x-1.5">
                    <CreditCard className="w-4.5 h-4.5 text-[#D4AF37]" />
                    <span>Table Billing & Settle</span>
                  </h2>
                  {settlingTable && (
                    <button 
                      onClick={() => setSettlingTable("")}
                      className="text-[9px] font-mono text-[#D4AF37] border border-slate-800 bg-slate-950 px-2 py-0.5 rounded-lg"
                    >
                      Change Table
                    </button>
                  )}
                </div>

                {/* 1. SELECT ACTIVE TABLE IF NONE SELECTED */}
                {!settlingTable ? (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-400 font-mono uppercase tracking-wider text-center">Select active table to process payment</p>
                    
                    {orders.filter(o => o.status !== "Completed" && o.type === "Dine-in").length === 0 ? (
                      <div className="text-center py-8 bg-slate-950/40 rounded-xl border border-slate-850 text-slate-500 font-mono text-xs">
                        No active tables with bills currently
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2.5">
                        {orders.filter(o => o.status !== "Completed" && o.type === "Dine-in").map((ord) => (
                          <button
                            key={ord.id}
                            onClick={() => {
                              setSettlingTable(ord.table);
                              setIsSplitBill(false);
                              setTipPercent(15);
                              setCustomTip("");
                              setCashReceived("");
                            }}
                            className="bg-slate-950 border border-slate-850 rounded-xl p-3 text-center space-y-1.5 hover:border-slate-700 transition-colors"
                          >
                            <h4 className="font-serif font-black text-sm text-white">{ord.table}</h4>
                            <p className="text-[10px] font-mono text-[#D4AF37]">${ord.total.toFixed(2)}</p>
                            <p className="text-[8px] font-mono text-slate-500 uppercase">Click to open bill</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  /* 2. ITEMISED BILL VIEW AND PAYMENT GATEWAY */
                  <div className="space-y-4">
                    
                    {/* Selected Table overview */}
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-3.5">
                      <div className="flex justify-between items-center pb-2.5 border-b border-slate-900 text-xs">
                        <div>
                          <span className="font-serif font-black text-white text-sm block">{settlingTable}</span>
                          <span className="text-[8px] font-mono text-slate-500 uppercase">Ticket ID: {activeOrderForSettle?.id}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] font-mono text-slate-400 block">Total Items</span>
                          <span className="font-mono text-[#D4AF37] font-bold">{activeOrderForSettle?.items.reduce((sum, i) => sum + i.quantity, 0)}</span>
                        </div>
                      </div>

                      {/* Itemised list */}
                      <div className="space-y-1.5 max-h-32 overflow-y-auto no-scrollbar">
                        {activeOrderForSettle?.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between text-[10px] font-mono text-slate-300">
                            <span>{it.name} <span className="text-slate-500">x{it.quantity}</span></span>
                            <span>${(it.price * it.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      {/* KDS Ready warning restriction banner */}
                      {activeOrderForSettle && activeOrderForSettle.type === "Dine-in" && activeOrderForSettle.status !== "Ready" && activeOrderForSettle.status !== "Completed" && (
                        <div className="bg-red-500/15 border border-red-500/30 p-3.5 rounded-xl flex items-start space-x-2 text-red-400 text-[10px] font-mono animate-pulse">
                          <AlertTriangle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-red-500" />
                          <div>
                            <p className="font-bold uppercase tracking-wider text-red-500">⚠️ KDS Prep Not Ready</p>
                            <p className="mt-1 text-[9px] text-slate-400 normal-case leading-normal">
                              The kitchen display system (KDS) has not marked this order as "READY" yet. Receipt print & payment settlement are strictly disabled until preparation is completed.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* SPLIT BILL ACTION BLOCK */}
                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-[9px] font-mono text-slate-400 uppercase font-black">Enable Split Bill</label>
                          <button
                            onClick={() => {
                              setIsSplitBill(!isSplitBill);
                              setSplitSharesCount(2);
                              setPaidShares([]);
                            }}
                            className={`px-3 py-1 rounded-lg text-[8px] font-mono uppercase tracking-widest border font-black transition-colors ${
                              isSplitBill
                                ? "bg-amber-500/10 border-amber-500 text-amber-400"
                                : "bg-slate-950 border-slate-800 text-slate-500"
                            }`}
                          >
                            {isSplitBill ? "ACTIVE" : "DISABLED"}
                          </button>
                        </div>

                        {isSplitBill && (
                          <div className="space-y-2 animate-fadeIn border-t border-slate-800/80 pt-2 text-[9px] font-mono">
                            <div className="flex justify-between items-center">
                              <span>Split Mechanism:</span>
                              <div className="flex space-x-1">
                                <button 
                                  onClick={() => setSplitType("Amount")}
                                  className={`px-2 py-0.5 rounded ${splitType === "Amount" ? "bg-[#D4AF37] text-slate-950" : "bg-slate-950"}`}
                                >
                                  By Amount
                                </button>
                                <button 
                                  onClick={() => setSplitType("Items")}
                                  className={`px-2 py-0.5 rounded ${splitType === "Items" ? "bg-[#D4AF37] text-slate-950" : "bg-slate-950"}`}
                                >
                                  By Item Selection
                                </button>
                              </div>
                            </div>

                            {splitType === "Amount" ? (
                              <div className="flex justify-between items-center bg-slate-950 p-2 rounded">
                                <span>Split Shares Count:</span>
                                <div className="flex items-center space-x-2">
                                  <button onClick={() => setSplitSharesCount(Math.max(2, splitSharesCount - 1))} className="p-0.5 bg-slate-900 text-slate-400 font-bold text-xs rounded">-</button>
                                  <span className="font-bold text-white text-xs">{splitSharesCount} Shares</span>
                                  <button onClick={() => setSplitSharesCount(Math.min(8, splitSharesCount + 1))} className="p-0.5 bg-slate-900 text-slate-400 font-bold text-xs rounded">+</button>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-slate-950 p-2 rounded-xl space-y-2">
                                <span className="text-[8px] uppercase text-[#D4AF37] font-bold block">Select Quantities to Pay Now:</span>
                                <div className="space-y-1.5 max-h-32 overflow-y-auto no-scrollbar">
                                  {activeOrderForSettle?.items.map((item) => {
                                    const selectedQty = splitItemSelections[item.id] || 0;
                                    return (
                                      <div key={item.id} className="flex justify-between items-center text-[10px] text-slate-300 py-1 border-b border-slate-900 last:border-0">
                                        <div className="min-w-0 flex-1 pr-2">
                                          <p className="truncate text-slate-200 font-bold">{item.name}</p>
                                          <p className="text-[8px] text-slate-500">${item.price.toFixed(2)} each (Ordered: {item.quantity})</p>
                                        </div>
                                        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">
                                          <button 
                                            type="button"
                                            onClick={() => {
                                              setSplitItemSelections({
                                                ...splitItemSelections,
                                                [item.id]: Math.max(0, selectedQty - 1)
                                              });
                                            }}
                                            className="text-slate-400 hover:text-[#D4AF37] px-1 font-mono font-bold text-xs"
                                          >
                                            -
                                          </button>
                                          <span className="font-mono font-bold text-white text-[10px]">{selectedQty}</span>
                                          <button 
                                            type="button"
                                            onClick={() => {
                                              setSplitItemSelections({
                                                ...splitItemSelections,
                                                [item.id]: Math.min(item.quantity, selectedQty + 1)
                                              });
                                            }}
                                            className="text-slate-400 hover:text-[#D4AF37] px-1 font-mono font-bold text-xs"
                                          >
                                            +
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {splitType === "Amount" && (
                              <div className="bg-slate-950 p-2 rounded space-y-1">
                                <div className="flex justify-between text-[10px] text-white">
                                  <span>Each Share:</span>
                                  <span className="font-bold text-[#D4AF37]">${(totals.total / splitSharesCount).toFixed(2)}</span>
                                </div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {Array.from({ length: splitSharesCount }).map((_, idx) => {
                                    const isPaid = paidShares.includes(idx);
                                    return (
                                      <button
                                        key={idx}
                                        onClick={() => {
                                          if (isPaid) {
                                            setPaidShares(paidShares.filter(s => s !== idx));
                                          } else {
                                            setPaidShares([...paidShares, idx]);
                                          }
                                        }}
                                        className={`px-1.5 py-0.5 rounded ${
                                          isPaid ? "bg-emerald-600 text-white" : "bg-slate-900 text-slate-400"
                                        }`}
                                      >
                                        Share {idx + 1} {isPaid ? "Paid" : "Unpaid"}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* TIP SELECTOR ROW */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-mono text-slate-500 uppercase block">Discretionary Service Tip</label>
                        <div className="grid grid-cols-4 gap-1.5">
                          {[10, 15, 18, 20].map((percent) => (
                            <button
                              key={percent}
                              onClick={() => {
                                setTipPercent(percent);
                                setCustomTip("");
                              }}
                              className={`py-2 text-[10px] font-mono rounded-lg border transition-all ${
                                tipPercent === percent && customTip === ""
                                  ? "bg-amber-500/10 border-amber-500 text-amber-400 font-black"
                                  : "bg-slate-950 border-slate-900 text-slate-400 hover:text-slate-200"
                              }`}
                            >
                              {percent}%
                            </button>
                          ))}
                        </div>
                        <input
                          type="text"
                          placeholder="Or custom dollar tip e.g. 10.00"
                          value={customTip}
                          onChange={(e) => {
                            setCustomTip(e.target.value);
                            setTipPercent(0);
                          }}
                          className="w-full bg-slate-900 border border-slate-850 rounded-lg px-3 py-1.5 text-[9px] font-mono text-slate-200 outline-none focus:border-[#D4AF37]"
                        />
                      </div>

                      {/* Calculation Box */}
                      <div className="border-t border-slate-900/60 pt-3 space-y-1.5 text-xs font-mono text-slate-400">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>${totals.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Luxury Tax (8%):</span>
                          <span>${totals.tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>Applied Staff Tip:</span>
                          <span className="text-emerald-400 font-bold">+${totals.tip.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-serif font-black text-white text-base pt-1 border-t border-slate-900">
                          <span>Total Settle Due:</span>
                          <span className="text-[#D4AF37] font-mono">
                            ${totals.total.toFixed(2)}
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* SELECT PAYMENT METHOD */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono text-slate-400 uppercase font-black">Select Payment Method</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { key: "Card", label: "CREDIT CARD", icon: CreditCard },
                          { key: "Cash", label: "CASH NOTES", icon: DollarSign },
                          { key: "Mobile Money", label: "MOBILE MONEY", icon: Smartphone }
                        ].map((method) => {
                          const IconComp = method.icon;
                          const isSelected = paymentMethod === method.key;
                          return (
                            <button
                              key={method.key}
                              onClick={() => setPaymentMethod(method.key as any)}
                              className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center space-y-1.5 transition-all ${
                                isSelected
                                  ? "bg-[#D4AF37] border-[#D4AF37] text-slate-950 font-black scale-95"
                                  : "bg-slate-950 border-slate-850 text-slate-400 hover:text-white"
                              }`}
                            >
                              <IconComp className="w-5 h-5 shrink-0" />
                              <span className="text-[7px] font-mono font-bold leading-none">{method.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* IF CASH PRESETS AND NUMERICAL keypad */}
                    {paymentMethod === "Cash" && (
                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-3 animate-fadeIn">
                        <div className="flex justify-between items-center text-xs font-mono">
                          <span className="text-slate-500">Cash Received:</span>
                          <input 
                            type="text" 
                            placeholder="0.00"
                            value={cashReceived}
                            onChange={(e) => setCashReceived(e.target.value)}
                            className="bg-slate-900 border border-slate-800 text-right px-2.5 py-1 text-white font-bold rounded outline-none focus:border-[#D4AF37] w-24"
                          />
                        </div>

                        {/* Quick Presets */}
                        <div className="flex space-x-1.5">
                          {cashPresets.map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setCashReceived(preset.toFixed(2))}
                              className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-[9px] font-mono text-slate-300"
                            >
                              ${preset}
                            </button>
                          ))}
                        </div>

                        {/* Change Display */}
                        {parseFloat(cashReceived) > 0 && (
                          <div className="flex justify-between text-xs font-mono pt-1.5 border-t border-slate-900/40">
                            <span className="text-slate-400">Change Due:</span>
                            <span className="text-emerald-400 font-bold">${changeValue.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* PROCESS ACTION BUTTON */}
                    <button
                      onClick={handleProcessPayment}
                      disabled={isProcessingPayment || (activeOrderForSettle?.type === "Dine-in" && activeOrderForSettle?.status !== "Ready" && activeOrderForSettle?.status !== "Completed") || (paymentMethod === "Cash" && (!cashReceived || parseFloat(cashReceived) < totals.total))}
                      className={`w-full py-4 text-slate-950 font-serif font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center space-x-2 ${
                        (activeOrderForSettle?.type === "Dine-in" && activeOrderForSettle?.status !== "Ready" && activeOrderForSettle?.status !== "Completed")
                          ? "bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500"
                      }`}
                    >
                      {isProcessingPayment ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                          <span>PROCESSING AUTH...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 text-slate-950" />
                          <span>AUTHORIZE & SETTLE BILL</span>
                        </>
                      )}
                    </button>

                  </div>
                )}

                {/* RECEIPTS PRINTER ANIMATION MODAL */}
                {isReceiptPrinting && (
                  <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xs flex items-center justify-center p-6 z-50">
                    <div className="bg-slate-900 border-2 border-[#D4AF37] rounded-3xl w-full max-w-sm p-6 text-center space-y-5 animate-scaleUp">
                      
                      <div className="space-y-1">
                        <Printer className="w-10 h-10 text-[#D4AF37] mx-auto animate-bounce" />
                        <h4 className="font-serif font-bold text-white">Bluetooth Spooling</h4>
                        <p className="text-[8px] font-mono text-slate-500">Connected to Mobile Epson-M30 • 203 DPI</p>
                      </div>

                      {/* Mock Thermal paper sliding down */}
                      <div className="bg-slate-950 p-4 border border-dashed border-slate-700 max-h-40 overflow-y-auto no-scrollbar rounded-xl text-[8px] font-mono text-left text-slate-300 uppercase space-y-1 leading-normal mx-4 select-none relative animate-pulse shadow-inner">
                        <p className="text-center font-bold tracking-widest">AURA GOURMET BURGERS</p>
                        <p className="text-center text-[7px] text-slate-500">--- DUPLICATE RECEIPT ---</p>
                        <p className="mt-2 text-[7px] text-slate-400">Date: {new Date().toLocaleDateString()}</p>
                        <p className="text-[7px] text-slate-400">Time: {new Date().toLocaleTimeString()}</p>
                        <p className="border-b border-dashed border-slate-800 my-1 pb-1">{receiptPrintedMessage}</p>
                        <p className="text-center text-[#D4AF37] font-bold text-[9px] mt-2">THANK YOU FOR THE TIP!</p>
                      </div>

                      <button
                        onClick={() => {
                          setIsReceiptPrinting(false);
                          setTableOverrides(prev => {
                            const next = { ...prev };
                            delete next[settlingTable];
                            return next;
                          });
                          setSettlingTable("");
                          setReceiptPrintedMessage("");
                          setActiveTab("Tables");
                        }}
                        className="w-full py-2.5 bg-[#D4AF37] hover:bg-amber-500 text-slate-950 font-serif font-black text-xs uppercase tracking-wide rounded-xl"
                      >
                        Finish & Release Table
                      </button>

                    </div>
                  </div>
                )}

              </div>
            )}

            {/* ----------------------------------------------- */}
            {/* PAGE 5: WAITER PROFILE & SETTINGS */}
            {/* ----------------------------------------------- */}
            {activeTab === "Profile" && (
              <div className="space-y-4 animate-fadeIn" id="waiter-performance-profile">
                
                {/* Header section with photo */}
                <div className="bg-slate-950 p-5 rounded-3xl border border-slate-850 flex items-center space-x-4 shadow-lg">
                  <div className="w-16 h-16 rounded-full border-2 border-[#D4AF37] p-0.5 overflow-hidden relative shrink-0">
                    <img 
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" 
                      className="w-full h-full object-cover rounded-full bg-slate-900" 
                      alt="Emily Waiter" 
                    />
                  </div>
                  <div className="min-w-0 flex-grow">
                    <h3 className="font-serif font-black text-base text-white truncate">{waiterName}</h3>
                    <p className="text-[9px] font-mono text-[#D4AF37] uppercase tracking-wider mt-0.5">Senior Floor Server</p>
                    <p className="text-[8px] font-mono text-slate-500 mt-1 uppercase">ID: EMP-105 • Active Shift</p>
                  </div>
                </div>

                {/* Duty Toggle and Quick Requests */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs font-serif font-bold text-slate-200">Current Server Status</span>
                      <p className="text-[9px] font-mono text-slate-500 uppercase mt-0.5">
                        {isOnBreak ? "Currently Resting on Break" : "Active on floor map"}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setIsOnBreak(!isOnBreak);
                        alert(isOnBreak ? "You are now Clocked in and active on Salon Floor!" : "Break request logged with manager.");
                      }}
                      className={`px-4 py-2 rounded-xl text-[9px] font-mono uppercase tracking-widest border font-black transition-colors ${
                        isOnBreak
                          ? "bg-purple-500/10 border-purple-500 text-purple-400"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {isOnBreak ? "ON BREAK" : "REQUEST BREAK"}
                    </button>
                  </div>

                  {/* Manager message center */}
                  <div className="border-t border-slate-900/60 pt-3 space-y-2">
                    <span className="text-[8px] font-mono text-slate-500 uppercase block tracking-wider">Contact Kitchen / Manager</span>
                    <div className="flex space-x-1.5">
                      <input 
                        type="text" 
                        placeholder="Type message: Need support Table 3..."
                        value={managerMessage}
                        onChange={(e) => {
                          setManagerMessage(e.target.value);
                          setManagerMessageSent(false);
                        }}
                        className="flex-grow bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-[10px] text-slate-200 outline-none focus:border-[#D4AF37]"
                      />
                      <button
                        onClick={() => {
                          if (managerMessage.trim()) {
                            setManagerMessageSent(true);
                            setManagerMessage("");
                            alert("Dispatched helper coordinate message to executive KDS display & manager app.");
                          }
                        }}
                        className="p-2 bg-slate-900 border border-slate-800 text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-xl transition-all"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                    {managerMessageSent && (
                      <span className="text-[8px] font-mono text-emerald-400 block animate-pulse">✓ Message broadcasted successfully</span>
                    )}
                  </div>
                </div>

                {/* Today's Shift Statistics */}
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { label: "Tables Closed", val: stats.tablesServed, icon: TableProperties },
                    { label: "Tips Collected", val: `$${stats.tipsEarned.toFixed(2)}`, icon: Award },
                    { label: "Avg Service Speed", val: "94% Score", icon: Activity }
                  ].map((s, idx) => {
                    const IconComponent = s.icon;
                    return (
                      <div key={idx} className="bg-slate-950 border border-slate-850 p-3 rounded-2xl shadow text-center space-y-1.5">
                        <IconComponent className="w-4.5 h-4.5 text-[#D4AF37] mx-auto opacity-80" />
                        <div>
                          <p className="text-xs font-mono font-black text-white">{s.val}</p>
                          <p className="text-[8px] text-slate-500 uppercase mt-0.5 leading-snug">{s.label}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Settings list */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-3.5 text-xs font-mono">
                  <span className="text-[8px] font-mono text-slate-500 uppercase block tracking-wider border-b border-slate-900 pb-1.5">Terminal Parameters</span>
                  
                  {/* Notification Toggle */}
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="flex items-center text-xs">
                      <Bell className="w-3.5 h-3.5 mr-2 text-[#D4AF37]" />
                      Push Notifications
                    </span>
                    <input 
                      type="checkbox" 
                      checked={notificationsEnabled}
                      onChange={(e) => setNotificationsEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 bg-slate-900 focus:ring-0 cursor-pointer"
                    />
                  </div>

                  {/* Language Selector */}
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="flex items-center text-xs">
                      <UserCheck className="w-3.5 h-3.5 mr-2 text-[#D4AF37]" />
                      Device Language
                    </span>
                    <select
                      value={activeLanguage}
                      onChange={(e) => setActiveLanguage(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-[10px] text-slate-300 outline-none"
                    >
                      <option value="English">English</option>
                      <option value="Español">Español</option>
                      <option value="Français">Français</option>
                    </select>
                  </div>

                  {/* Dark Mode constant indicator */}
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="flex items-center text-xs">
                      <Settings className="w-3.5 h-3.5 mr-2 text-[#D4AF37]" />
                      Dark Mode (Always On)
                    </span>
                    <span className="text-[8px] text-[#D4AF37] font-black border border-amber-500/20 px-1.5 py-0.5 rounded bg-[#D4AF37]/10 uppercase">
                      LOCKED SYSTEM
                    </span>
                  </div>
                </div>

                {/* Clock Out Terminate Shift */}
                <button
                  onClick={() => {
                    if (confirm("Proceed to clock out and terminate current terminal session?")) {
                      setIsAuthenticated(false);
                      setPin("");
                      setEmployeeId("");
                      if (onLogout) onLogout();
                    }
                  }}
                  className="w-full py-3.5 bg-rose-950/40 hover:bg-rose-950 border border-rose-500/20 hover:border-rose-500 text-rose-400 hover:text-white font-mono text-[10px] uppercase font-black rounded-2xl tracking-wider transition-all flex items-center justify-center space-x-1.5"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>CLOCK OUT SHIFT</span>
                </button>

              </div>
            )}

          </div>
        )}

      </div>

      {/* ----------------------------------------------- */}
      {/* STICKY BOTTOM NAVIGATION BAR (SMARTPHONE FRAME) */}
      {/* ----------------------------------------------- */}
      {isAuthenticated && (
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-slate-950 border-t border-slate-900/80 flex items-center justify-around px-2 rounded-none z-40 select-none pb-0 shrink-0" id="waiter-sticky-bottom-navigation">
          {[
            { id: "Tables", label: "Tables", icon: TableProperties },
            { id: "New", label: "New Order", icon: Plus },
            { id: "MyOrders", label: "My Orders", icon: Clock },
            { id: "Settle", label: "Payments", icon: CreditCard },
            { id: "Profile", label: "Profile", icon: User }
          ].map((btn) => {
            const IconComponent = btn.icon;
            const isActive = activeTab === btn.id;
            return (
              <button
                key={btn.id}
                onClick={() => {
                  setActiveTab(btn.id as any);
                  // Reset Wizard status when clicking "New Order" bottom tab
                  if (btn.id === "New") {
                    setWizardStep(1);
                    setSelectedTable("");
                    setCart([]);
                    setNotes("");
                  }
                }}
                className={`flex flex-col items-center justify-center py-1 transition-all w-14 ${
                  isActive ? "text-[#D4AF37] font-black scale-105" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <div className={`p-1 rounded-xl transition-colors ${isActive ? "bg-[#D4AF37]/10" : ""}`}>
                  <IconComponent className="w-5 h-5 shrink-0" />
                </div>
                <span className="text-[8px] font-mono uppercase tracking-wider mt-1 scale-90 truncate max-w-full">
                  {btn.label}
                </span>
              </button>
            );
          })}
        </div>
      )}

    </div>
  );
}
