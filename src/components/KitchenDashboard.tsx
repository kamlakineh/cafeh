import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChefHat,
  Flame,
  Bell,
  Clock,
  Check,
  AlertTriangle,
  Settings,
  Volume2,
  VolumeX,
  Database,
  HelpCircle,
  Sparkles,
  MessageSquare,
  Plus,
  Trash2,
  Maximize2,
  Minimize2,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  TrendingUp,
  BarChart2,
  Printer,
  Play,
  Pause,
  RotateCcw,
  User,
  CheckSquare,
  Shield,
  Clock3,
  AlertOctagon,
  BookOpen,
  Compass,
  BadgeCheck,
} from "lucide-react";
import { Order, InventoryItem, Employee } from "../types";

interface KitchenDashboardProps {
  orders: Order[];
  onUpdateOrderStatus: (
    id: string,
    status: Order["status"],
    extra?: Partial<Order>,
  ) => void;
  inventory: InventoryItem[];
  setUserRole?: (role: string) => void;
  authenticatedStaff?: Employee | null;
  onLogout?: () => void;
}

export default function KitchenDashboard({
  orders,
  onUpdateOrderStatus,
  inventory,
  setUserRole,
  authenticatedStaff,
  onLogout,
}: KitchenDashboardProps) {
  // Navigation State
  const [activeTab, setActiveTab] = React.useState<
    | "Dashboard"
    | "New"
    | "Preparing"
    | "Cooking"
    | "Ready"
    | "Completed"
    | "Delayed"
    | "Timers"
    | "Inventory"
    | "Reports"
  >("Dashboard");

  // Interactive Options
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [fullscreenMode, setFullscreenMode] = React.useState(false);
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const [selectedStation, setSelectedStation] =
    React.useState("Grill Station #2");
  const [activeChefsCount, setActiveChefsCount] = React.useState(4);
  const [emergencyAlert, setEmergencyAlert] = React.useState(false);
  const [viewDetailsOrderId, setViewDetailsOrderId] = React.useState<
    string | null
  >(null);

  // Authentication & Station Profiles dynamically sourced from active staff DB session
  const [currentChef, setCurrentChef] = React.useState({
    name: authenticatedStaff?.name || "Elena Rostova",
    role: authenticatedStaff?.role || "Senior Grill Station",
    avatar:
      authenticatedStaff?.role === "Executive Chef"
        ? "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150"
        : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
  });

  React.useEffect(() => {
    if (authenticatedStaff) {
      setCurrentChef({
        name: authenticatedStaff.name,
        role: authenticatedStaff.role,
        avatar:
          authenticatedStaff.role === "Executive Chef"
            ? "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150"
            : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      });
    }
  }, [authenticatedStaff]);

  // Rejection Security PIN Modal
  const [pinModalOpen, setPinModalOpen] = React.useState(false);
  const [rejoiningOrderId, setRejoiningOrderId] = React.useState<string | null>(
    null,
  );
  const [enteredPin, setEnteredPin] = React.useState("");
  const [pinError, setPinError] = React.useState<string | null>(null);

  // Delay Reason Modal
  const [delayModalOpen, setDelayModalOpen] = React.useState(false);
  const [delayOrderId, setDelayOrderId] = React.useState<string | null>(null);
  const [delayReason, setDelayReason] = React.useState("Kitchen backup");
  const [delayNotes, setDelayNotes] = React.useState("");

  // Ingredients Restock Modal
  const [restockModalOpen, setRestockModalOpen] = React.useState(false);
  const [selectedIngredient, setSelectedIngredient] = React.useState<
    string | null
  >(null);
  const [restockQty, setRestockQty] = React.useState("50");

  // Real-time Clock State
  const [currentTime, setCurrentTime] = React.useState(new Date());

  // Interactive checklist states for Preparing / Cooking
  const [checklistState, setChecklistState] = React.useState<
    Record<string, Record<string, boolean>>
  >({});

  // Timers List State (Kitchen Timers Page)
  const [timers, setTimers] = React.useState<
    Array<{
      id: string;
      label: string;
      time: number;
      maxTime: number;
      running: boolean;
      type: "Grill" | "Fryer" | "Oven" | "Custom";
    }>
  >([
    {
      id: "T1",
      label: "Grill #2 - Wagyu Patties",
      time: 240,
      maxTime: 240,
      running: true,
      type: "Grill",
    },
    {
      id: "T2",
      label: "Fryer #1 - Truffle Fries",
      time: 180,
      maxTime: 180,
      running: true,
      type: "Fryer",
    },
    {
      id: "T3",
      label: "Oven #1 - Brioche Buns",
      time: 60,
      maxTime: 60,
      running: false,
      type: "Oven",
    },
  ]);
  const [newTimerLabel, setNewTimerLabel] = React.useState("");
  const [newTimerType, setNewTimerType] = React.useState<
    "Grill" | "Fryer" | "Oven" | "Custom"
  >("Custom");
  const [newTimerSeconds, setNewTimerSeconds] = React.useState("120");

  // Audio Alerts Synthesizer Engine (Standard Web Audio API)
  const playSound = React.useCallback(
    (type: "ding-dong" | "beep" | "success" | "alarm") => {
      if (!soundEnabled) return;
      try {
        const ctx = new (
          window.AudioContext || (window as any).webkitAudioContext
        )();
        if (type === "ding-dong") {
          const osc1 = ctx.createOscillator();
          const gain1 = ctx.createGain();
          osc1.type = "sine";
          osc1.frequency.setValueAtTime(880, ctx.currentTime);
          gain1.gain.setValueAtTime(0.2, ctx.currentTime);
          gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
          osc1.connect(gain1);
          gain1.connect(ctx.destination);
          osc1.start();
          osc1.stop(ctx.currentTime + 0.4);

          setTimeout(() => {
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = "sine";
            osc2.frequency.setValueAtTime(659.25, ctx.currentTime);
            gain2.gain.setValueAtTime(0.2, ctx.currentTime);
            gain2.gain.exponentialRampToValueAtTime(
              0.01,
              ctx.currentTime + 0.4,
            );
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.start();
            osc2.stop(ctx.currentTime + 0.5);
          }, 180);
        } else if (type === "beep") {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(1200, ctx.currentTime);
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.15);
        } else if (type === "success") {
          const tones = [523.25, 659.25, 783.99];
          tones.forEach((freq, idx) => {
            setTimeout(() => {
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = "sine";
              osc.frequency.setValueAtTime(freq, ctx.currentTime);
              gain.gain.setValueAtTime(0.15, ctx.currentTime);
              gain.gain.exponentialRampToValueAtTime(
                0.01,
                ctx.currentTime + 0.18,
              );
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start();
              osc.stop(ctx.currentTime + 0.2);
            }, idx * 75);
          });
        } else if (type === "alarm") {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(440, ctx.currentTime);
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.3);
        }
      } catch (e) {
        console.warn("Audio Context blocked:", e);
      }
    },
    [soundEnabled],
  );

  // AI Kitchen Assistant chat drawer states
  const [aiChatOpen, setAiChatOpen] = React.useState(false);
  const [aiChatQuery, setAiChatQuery] = React.useState("");
  const [aiChatMessages, setAiChatMessages] = React.useState<
    Array<{ role: "user" | "ai"; text: string }>
  >([
    {
      role: "ai",
      text: "Salutations! I am the Gourmet Kitchen AI. I analyze live tickets, stock, and station telemetry to streamline preparation. Ask me how to optimize layout, predict prep times, or handle current backlogs.",
    },
  ]);
  const [aiLoading, setAiLoading] = React.useState(false);

  // Automatically tick clock and active timers every second
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());

      // Decrement custom timers
      setTimers((prev) =>
        prev.map((t) => {
          if (t.running && t.time > 0) {
            const nextTime = t.time - 1;
            if (nextTime === 0 && soundEnabled) {
              playSound("alarm");
            }
            return { ...t, time: nextTime };
          }
          return t;
        }),
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [soundEnabled, playSound]);

  // Play audio alert on new orders arriving (length change detection)
  const previousOrdersCount = React.useRef(orders.length);
  React.useEffect(() => {
    if (orders.length > previousOrdersCount.current) {
      const newOrders = orders.filter((o) => o.status === "Pending");
      if (newOrders.length > 0) {
        playSound("ding-dong");
      }
    }
    previousOrdersCount.current = orders.length;
  }, [orders, playSound]);

  // Silent auto attendance track for active kitchen staff (Elena: EMP-102, Marcus: EMP-101)
  React.useEffect(() => {
    const registerKitchenAttendance = async () => {
      try {
        await fetch("/api/employees/attendance/auto", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ employeeId: "EMP-102" }), // Chef Elena
        });
        await fetch("/api/employees/attendance/auto", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ employeeId: "EMP-101" }), // Chef Marcus
        });
      } catch (err) {
        console.warn("Silent kitchen attendance sync issue:", err);
      }
    };
    registerKitchenAttendance();
  }, []);

  // Periodic alarm if urgent orders (waiting >10 mins) exist in active list
  React.useEffect(() => {
    const checkUrgentOrdersInterval = setInterval(() => {
      const pendingAndPrep = orders.filter((o) =>
        ["Pending", "Preparing", "Cooking"].includes(o.status),
      );
      const now = new Date();
      const hasUrgent = pendingAndPrep.some((o) => {
        const orderTime = new Date(o.createdAt);
        const diffMins = (now.getTime() - orderTime.getTime()) / 60000;
        return diffMins > 10;
      });

      if (hasUrgent && soundEnabled) {
        playSound("beep");
      }
    }, 12000);

    return () => clearInterval(checkUrgentOrdersInterval);
  }, [orders, soundEnabled, playSound]);

  // Handle order status transition wrapper with audio cue
  const updateStatusWithAudio = (
    id: string,
    nextStatus: Order["status"],
    extra?: Partial<Order>,
  ) => {
    playSound("success");
    onUpdateOrderStatus(id, nextStatus, extra);
  };

  // Reject order handler with PIN confirmation
  const triggerRejectOrder = (id: string) => {
    setRejoiningOrderId(id);
    setEnteredPin("");
    setPinError(null);
    setPinModalOpen(true);
  };

  const verifyPinAndReject = () => {
    if (
      enteredPin === "1234" ||
      enteredPin === "7777" ||
      enteredPin === "0000"
    ) {
      if (rejoiningOrderId) {
        updateStatusWithAudio(rejoiningOrderId, "Cancelled" as any, {
          notes: "Rejected by Kitchen Manager",
        });
      }
      setPinModalOpen(false);
      setRejoiningOrderId(null);
      setEnteredPin("");
    } else {
      setPinError("Invalid Manager PIN. Access Denied.");
      playSound("alarm");
    }
  };

  // Delay trigger handler
  const triggerDelayOrder = (id: string) => {
    setDelayOrderId(id);
    setDelayReason("Kitchen backup");
    setDelayNotes("");
    setDelayModalOpen(true);
  };

  const saveDelayOrder = () => {
    if (delayOrderId) {
      onUpdateOrderStatus(delayOrderId, "Delayed", {
        notes: `DELAYED: [${delayReason}] ${delayNotes}`,
      });
    }
    setDelayModalOpen(false);
    setDelayOrderId(null);
  };

  // Launch New Timer
  const handleLaunchTimer = () => {
    if (!newTimerLabel.trim()) return;
    const seconds = parseInt(newTimerSeconds) || 120;
    setTimers((prev) => [
      ...prev,
      {
        id: "T-" + Date.now(),
        label: newTimerLabel,
        time: seconds,
        maxTime: seconds,
        running: true,
        type: newTimerType,
      },
    ]);
    setNewTimerLabel("");
    setNewTimerSeconds("120");
    playSound("success");
  };

  // Simulated ingredient restocking update
  const handleIngredientRestock = (item: string) => {
    setSelectedIngredient(item);
    setRestockQty("50");
    setRestockModalOpen(true);
  };

  const confirmRestock = () => {
    if (selectedIngredient) {
      const qty = parseInt(restockQty) || 50;
      fetch("/api/inventory/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item: selectedIngredient, current: qty }),
      }).then(() => {
        playSound("success");
      });
    }
    setRestockModalOpen(false);
    setSelectedIngredient(null);
  };

  // AI Kitchen Chat Response Engine
  const handleSendAiMessage = async () => {
    if (!aiChatQuery.trim()) return;
    const userMsg = aiChatQuery;
    setAiChatMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setAiChatQuery("");
    setAiLoading(true);

    try {
      const response = await fetch("/api/gemini/kitchen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queueLength: orders.length, question: userMsg }),
      });
      const data = await response.json();
      setAiChatMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text:
            data.text ||
            "Suggestion: Group burger tickets to grill #2 to save energy. Assign Elena to assembling.",
        },
      ]);
    } catch (err) {
      let answer =
        "Suggestion: Organize ticket groups by target temperatures. For Wagyu, maintain 550°F on Cast Iron. If bun backlog is building, reassign Station #3 to assist.";
      if (
        userMsg.toLowerCase().includes("prep") ||
        userMsg.toLowerCase().includes("time")
      ) {
        answer =
          "Predicted queue duration is currently 14 minutes. Suggest prioritizing VIP ticket ORD-101 immediately, as it contains Medium Rare Wagyu which has high sensitivity.";
      } else if (
        userMsg.toLowerCase().includes("stock") ||
        userMsg.toLowerCase().includes("alert")
      ) {
        answer =
          "Inventory check: Beef Patties are currently low (12 left). This will expire in 4 orders. Recommend clicking 'Request Restock' in Ingredient Alerts panel.";
      }
      setAiChatMessages((prev) => [...prev, { role: "ai", text: answer }]);
    } finally {
      setAiLoading(false);
    }
  };

  // Filter orders by status categories mapped from tabs
  const getOrdersForTab = () => {
    const now = new Date();
    switch (activeTab) {
      case "New":
        return orders.filter((o) => o.status === "Pending");
      case "Preparing":
        return orders.filter((o) => o.status === "Preparing");
      case "Cooking":
        return orders.filter(
          (o) => o.status === "Cooking" || o.status === "Preparing",
        );
      case "Ready":
        return orders.filter((o) => o.status === "Ready");
      case "Completed":
        return orders.filter((o) => o.status === "Completed");
      case "Delayed":
        return orders.filter((o) => {
          if (o.status === "Completed") return false;
          const orderTime = new Date(o.createdAt);
          const diffMins = (now.getTime() - orderTime.getTime()) / 60000;
          return (
            o.status === "Delayed" ||
            diffMins > 10 ||
            (o.notes && o.notes.toUpperCase().includes("DELAYED"))
          );
        });
      default:
        return orders;
    }
  };

  // Helper metrics
  const pendingOrders = orders.filter((o) => o.status === "Pending");
  const preparingOrders = orders.filter((o) => o.status === "Preparing");
  const cookingOrders = orders.filter((o) => o.status === "Cooking");
  const readyOrders = orders.filter((o) => o.status === "Ready");
  const completedOrders = orders.filter((o) => o.status === "Completed");

  const delayedOrdersCount = orders.filter((o) => {
    if (o.status === "Completed") return false;
    const orderTime = new Date(o.createdAt);
    const diffMins = (currentTime.getTime() - orderTime.getTime()) / 60000;
    return (
      o.status === "Delayed" ||
      diffMins > 10 ||
      (o.notes && o.notes.toUpperCase().includes("DELAYED"))
    );
  }).length;

  return (
    <div
      className="w-full bg-[#1A0F08] min-h-screen text-white font-sans flex flex-col relative"
      id="kitchen-display-system"
    >
      {/* EMERGENCY ALERT BANNER (WHITE & DARK BROWN COMPLIANT FLASHING) */}
      {emergencyAlert && (
        <div className="bg-white text-[#1A0F08] animate-pulse py-3 px-4 flex justify-between items-center text-xs font-mono font-black uppercase tracking-wider z-[100] border-b-4 border-[#3D2516]">
          <div className="flex items-center space-x-3">
            <AlertOctagon className="w-5 h-5 text-[#1A0F08]" />
            <span>
              CRITICAL KITCHEN EMERGENCY ACTIVATED: CHECK STATION TEMPERATURES /
              POWER SAFETY
            </span>
          </div>
          <button
            onClick={() => setEmergencyAlert(false)}
            className="bg-[#1A0F08] text-white hover:opacity-90 px-3 py-1 rounded text-[10px] font-bold"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* TOP DECORATIVE HIGH-CONTRAST SEPARATOR */}
      <div className="h-1 bg-white shrink-0" />

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLLAPSIBLE SIDEBAR NAVIGATION */}
        <aside
          className={`${
            fullscreenMode ? "hidden" : sidebarCollapsed ? "w-20" : "w-[240px]"
          } bg-[#120904] border-r border-[#3E2415] flex flex-col justify-between transition-all duration-300 shrink-0 z-40`}
          id="kds-navigation-sidebar"
        >
          {/* Top Logo & Status */}
          <div className="p-4 border-b border-[#3E2415]">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed ? (
                <div className="flex items-center space-x-2">
                  <div className="bg-white/10 p-1.5 rounded-lg border border-white/20">
                    <ChefHat className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-mono font-black text-sm text-white tracking-wider uppercase">
                      BROWN & WHITE KDS
                    </h2>
                    <p className="text-[8px] text-white/50 font-mono tracking-widest">
                      STATION OVERVIEW
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mx-auto bg-white/10 p-2 rounded-lg border border-white/20">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
              )}

              {!sidebarCollapsed && (
                <button
                  onClick={() => setSidebarCollapsed(true)}
                  className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
            </div>

            {sidebarCollapsed && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => setSidebarCollapsed(false)}
                  className="mx-auto text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors block"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 py-4 space-y-1 overflow-y-auto no-scrollbar">
            {[
              { id: "Dashboard", label: "Dashboard", icon: Compass, badge: 0 },
              {
                id: "New",
                label: "New Orders",
                icon: Bell,
                badge: pendingOrders.length,
                pulse: pendingOrders.length > 0,
              },
              {
                id: "Ready",
                label: "Ready",
                icon: BadgeCheck,
                badge: readyOrders.length,
              },
              {
                id: "Completed",
                label: "Completed",
                icon: CheckSquare,
                badge: completedOrders.length,
              },
              {
                id: "Delayed",
                label: "Delayed Orders",
                icon: AlertTriangle,
                badge: delayedOrdersCount,
                critical: delayedOrdersCount > 0,
              },
              {
                id: "Timers",
                label: "Kitchen Timers",
                icon: Clock3,
                badge: timers.filter((t) => t.running).length,
              },
              {
                id: "Inventory",
                label: "Ingredient Alerts",
                icon: Database,
                badge: inventory.filter((i) => i.status !== "OK").length,
              },
              { id: "Reports", label: "Reports", icon: BarChart2, badge: 0 },
            ].map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center py-3.5 px-4 transition-all duration-150 relative ${
                    isActive
                      ? "text-[#1A0F08] bg-white font-bold border-l-4 border-white"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                  title={item.label}
                >
                  <IconComp
                    className={`w-5 h-5 shrink-0 ${sidebarCollapsed ? "mx-auto" : "mr-3"}`}
                  />

                  {!sidebarCollapsed && (
                    <span className="text-xs uppercase font-mono tracking-wider">
                      {item.label}
                    </span>
                  )}

                  {item.badge > 0 && (
                    <span
                      className={`absolute ${
                        sidebarCollapsed ? "top-1 right-2" : "right-4"
                      } text-[10px] font-mono font-black h-5 min-w-5 px-1.5 flex items-center justify-center rounded-full ${
                        isActive
                          ? "bg-[#1A0F08] text-white"
                          : "bg-white text-[#1A0F08] animate-pulse"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom Settings / Profile info */}
          <div className="p-4 border-t border-[#3E2415] bg-[#120904] space-y-4 shrink-0">
            {/* User Station info */}
            {!sidebarCollapsed && (
              <div className="flex items-center space-x-3 bg-white/5 p-2.5 rounded-xl border border-[#3E2415]">
                <img
                  src={currentChef.avatar}
                  alt={currentChef.name}
                  className="w-10 h-10 rounded-full border border-white/30 object-cover"
                />
                <div className="min-w-0">
                  <p className="text-[10px] text-white font-mono font-black uppercase truncate">
                    {currentChef.name}
                  </p>
                  <p className="text-[8px] text-white/50 font-mono tracking-wider truncate">
                    {currentChef.role}
                  </p>
                </div>
              </div>
            )}

            {/* Quick Actions (White / Dark Brown Styled) */}
            <div
              className={`flex ${sidebarCollapsed ? "flex-col items-center space-y-3" : "justify-around"} text-white/70`}
            >
              {/* Fullscreen toggle */}
              <button
                onClick={() => setFullscreenMode(!fullscreenMode)}
                className="hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                title="Toggle KDS Fullscreen Focus Mode"
              >
                {fullscreenMode ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>

              {/* Sound toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-1.5 hover:bg-white/10 rounded-lg transition-colors ${soundEnabled ? "text-white" : "opacity-30"}`}
                title="Toggle Audio Alerts"
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </button>

              {/* Emergency button */}
              <button
                onClick={() => setEmergencyAlert(!emergencyAlert)}
                className={`p-1.5 hover:bg-white/10 rounded-lg transition-colors ${emergencyAlert ? "text-white animate-bounce" : "opacity-50 hover:opacity-100"}`}
                title="Trigger Kitchen Emergency Banner"
              >
                <AlertOctagon className="w-4 h-4" />
              </button>
            </div>

            {/* Shift end Logout */}
            {!sidebarCollapsed ? (
              <button
                onClick={() => setUserRole && setUserRole("customer")}
                className="w-full py-2 bg-white/10 hover:bg-white hover:text-[#1A0F08] text-white border border-white/20 font-mono text-[10px] uppercase font-bold rounded-lg transition-all text-center block"
              >
                SHIFT OVER / LOGOUT
              </button>
            ) : (
              <button
                onClick={() => setUserRole && setUserRole("customer")}
                className="mx-auto text-white/50 hover:text-white"
                title="Logout"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </aside>

        {/* CONTENT ZONE */}
        <main className="flex-1 flex flex-col bg-[#1A0F08] overflow-y-auto p-6 space-y-6">
          {/* HEADER ROW WITH CURRENT STATION & DIGITAL CLOCK */}
          <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#3E2415] pb-4 gap-4">
            <div className="flex items-center space-x-3">
              {fullscreenMode && (
                <button
                  onClick={() => setFullscreenMode(false)}
                  className="bg-white/10 border border-white/20 p-2 rounded-xl text-white hover:bg-white hover:text-[#1A0F08]"
                  title="Show sidebar navigation"
                >
                  <Menu className="w-4 h-4" />
                </button>
              )}
              <div>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 bg-white rounded-full animate-ping" />
                  <h1 className="font-mono font-black text-2xl text-white tracking-wide uppercase">
                    {activeTab} PANEL
                  </h1>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <select
                    value={selectedStation}
                    onChange={(e) => setSelectedStation(e.target.value)}
                    className="bg-[#120904] border border-[#3E2415] text-white font-mono text-[10px] py-1 px-2 rounded-lg focus:outline-none focus:border-white"
                  >
                    <option value="Grill Station #2">Grill Station #2</option>
                    <option value="Fryer Station #1">Fryer Station #1</option>
                    <option value="Prep & Assembly">
                      Prep & Assembly Station
                    </option>
                    <option value="Patisserie / Desserts">
                      Desserts Station
                    </option>
                  </select>
                  <span className="text-white/30 text-[10px]">•</span>
                  <span className="text-[10px] font-mono text-white/60">
                    {activeChefsCount} Chefs Clocked In
                  </span>
                </div>
              </div>
            </div>

            {/* MONOSPACE DIGITAL CLOCK */}
            <div className="flex items-end space-x-4">
              <div className="text-right">
                <span className="text-white/40 font-mono text-[10px] tracking-widest uppercase block">
                  KITCHEN SYSTEM CLOCK
                </span>
                <span className="text-3xl md:text-4xl font-mono font-black text-white tracking-tight">
                  {currentTime.toLocaleTimeString("en-US", { hour12: false })}
                </span>
              </div>
            </div>
          </header>

          {/* ---------------------------------------------------------------------------------- */}
          {/* TAB 1: DASHBOARD PAGE */}
          {/* ---------------------------------------------------------------------------------- */}
          {activeTab === "Dashboard" && (
            <div className="space-y-6 animate-fadeIn" id="kds-dashboard-page">
              {/* KPI CARD BLOCK - COMPACT 4 COLS (STRICTLY WHITE & DARK BROWN) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* 1. New orders waiting */}
                <div
                  onClick={() => setActiveTab("New")}
                  className={`cursor-pointer border p-4 rounded-2xl transition-all ${
                    pendingOrders.length > 5
                      ? "bg-white text-[#1A0F08] border-white shadow-[0_0_15px_rgba(255,255,255,0.15)] animate-pulse"
                      : "bg-[#120904] border-[#3E2415] hover:border-white"
                  }`}
                >
                  <div className="flex justify-between items-center text-white/50">
                    <span className="text-[10px] uppercase font-mono tracking-wider font-bold">
                      New Pending
                    </span>
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="mt-2 flex items-baseline space-x-2">
                    <span className="text-3xl font-mono font-black">
                      {pendingOrders.length}
                    </span>
                    <span className="text-[10px] opacity-70">tickets</span>
                  </div>
                  <div className="mt-2 text-[10px] font-mono opacity-80">
                    Needs immediate accept
                  </div>
                </div>

                {/* 2. Preparing / Cooking active */}
                <div
                  onClick={() => setActiveTab("Preparing")}
                  className="bg-[#120904] border border-[#3E2415] hover:border-white p-4 rounded-2xl transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-center text-white/50">
                    <span className="text-[10px] uppercase font-mono tracking-wider font-bold">
                      Preparing / Cooking
                    </span>
                    <Flame className="w-4 h-4" />
                  </div>
                  <div className="mt-2 flex items-baseline space-x-2">
                    <span className="text-3xl font-mono font-black text-white">
                      {preparingOrders.length + cookingOrders.length}
                    </span>
                    <span className="text-[10px] text-white/60">active</span>
                  </div>
                  <div className="mt-2 text-[10px] font-mono text-white/50">
                    Stove / Prep in progress
                  </div>
                </div>

                {/* 3. Ready waiting > 5 mins */}
                <div
                  onClick={() => setActiveTab("Ready")}
                  className="bg-[#120904] border border-[#3E2415] hover:border-white p-4 rounded-2xl transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-center text-white/50">
                    <span className="text-[10px] uppercase font-mono tracking-wider font-bold">
                      Ready At Pass
                    </span>
                    <Check className="w-4 h-4" />
                  </div>
                  <div className="mt-2 flex items-baseline space-x-2">
                    <span className="text-3xl font-mono font-black text-white">
                      {readyOrders.length}
                    </span>
                    <span className="text-[10px] text-white/60">plated</span>
                  </div>
                  <div className="mt-2 text-[10px] text-white/40 font-mono flex items-center space-x-1">
                    <Clock className="w-3 h-3 shrink-0" />
                    <span>
                      {readyOrders.length > 0
                        ? `${readyOrders.length} waiting >5m`
                        : "Clear at pass"}
                    </span>
                  </div>
                </div>

                {/* 4. Efficiency Metrics */}
                <div
                  onClick={() => setActiveTab("Reports")}
                  className="bg-[#120904] border border-[#3E2415] p-4 rounded-2xl transition-all cursor-pointer hover:border-white"
                >
                  <div className="flex justify-between items-center text-white/50">
                    <span className="text-[10px] uppercase font-mono tracking-wider font-bold">
                      Kitchen Efficiency
                    </span>
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div className="mt-2 flex items-baseline space-x-2">
                    <span className="text-3xl font-mono font-black text-white">
                      87%
                    </span>
                    <span className="text-[10px] text-white/60">on-time</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-[#1A0F08] h-1.5 rounded-full mt-2 overflow-hidden border border-[#3E2415]">
                    <div className="bg-white h-full" style={{ width: "87%" }} />
                  </div>
                </div>
              </div>

              {/* CORE CHARTS ROW */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Orders by Hour Bar Chart */}
                <div className="bg-[#120904] border border-[#3E2415] p-6 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-mono font-bold text-sm tracking-wide text-white uppercase">
                      Hourly Order Volume
                    </h3>
                    <span className="text-[10px] font-mono text-white/50">
                      Last 6 Hours
                    </span>
                  </div>
                  {/* Styled Pure HTML Bar Chart (WHITE BARS) */}
                  <div className="h-44 flex items-end justify-between px-2 pt-4">
                    {[
                      { hr: "11:00", val: 12 },
                      { hr: "12:00", val: 28 },
                      { hr: "13:00", val: 35 },
                      { hr: "14:00", val: 18 },
                      { hr: "15:00", val: 10 },
                      { hr: "16:00", val: 15 },
                    ].map((d, idx) => {
                      const pct = (d.val / 40) * 100;
                      return (
                        <div
                          key={idx}
                          className="flex flex-col items-center flex-1 group"
                        >
                          <span className="text-[9px] font-mono font-bold text-white mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {d.val}
                          </span>
                          <div
                            className="w-6 bg-white/25 border border-white/40 rounded-t-md hover:bg-white transition-all duration-200"
                            style={{ height: `${pct}%` }}
                          />
                          <span className="text-[8px] font-mono text-white/40 mt-2">
                            {d.hr}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Food Category Distribution */}
                <div className="bg-[#120904] border border-[#3E2415] p-6 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-mono font-bold text-sm tracking-wide text-white uppercase">
                      Category Distribution
                    </h3>
                    <span className="text-[10px] font-mono text-white/50">
                      Real-time counts
                    </span>
                  </div>
                  {/* Category Horizontal Bars */}
                  <div className="space-y-3.5 pt-2">
                    {[
                      { cat: "Luxury Burgers", val: 68 },
                      { cat: "Truffle Fries / Sides", val: 42 },
                      { cat: "Champagne / Drinks", val: 25 },
                      { cat: "Premium Desserts", val: 15 },
                    ].map((c, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono">
                          <span className="text-white/70">{c.cat}</span>
                          <span className="text-white font-bold">
                            {c.val} items
                          </span>
                        </div>
                        <div className="w-full bg-[#1A0F08] h-2 rounded-full overflow-hidden border border-[#3E2415]">
                          <div
                            className="bg-white h-full"
                            style={{ width: `${(c.val / 80) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* BOTTOM SECTION: RECENT FEED & CRITICAL INGREDIENT ALERTS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Recent Feed: Last 5 Orders Ticker */}
                <div className="lg:col-span-7 bg-[#120904] border border-[#3E2415] p-5 rounded-2xl space-y-4">
                  <h3 className="font-mono font-bold text-sm text-white uppercase">
                    Live Ticket Feed Ticker
                  </h3>
                  <div className="divide-y divide-[#3E2415] max-h-48 overflow-y-auto no-scrollbar space-y-1">
                    {orders.slice(0, 5).map((o, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center py-2 text-xs"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-white font-mono font-black">
                            {o.id}
                          </span>
                          <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/80">
                            {o.table}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-white/60 text-[10px]">
                            {o.items.reduce(
                              (sum, item) => sum + item.quantity,
                              0,
                            )}{" "}
                            Items
                          </span>
                          <span
                            className={`px-2 py-0.5 text-[9px] font-mono rounded font-bold uppercase border ${
                              o.status === "Ready"
                                ? "bg-white text-[#1A0F08] border-white"
                                : "bg-transparent text-white border-white/20"
                            }`}
                          >
                            {o.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ingredient Alerts Feed */}
                <div className="lg:col-span-5 bg-[#120904] border border-[#3E2415] p-5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-mono font-bold text-sm text-white uppercase">
                      Ingredient Watch
                    </h3>
                    <Database className="w-4 h-4 text-white" />
                  </div>
                  <div className="space-y-2.5 max-h-48 overflow-y-auto no-scrollbar">
                    {inventory
                      .filter((i) => i.status !== "OK")
                      .map((inv, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center bg-white/5 border border-white/20 p-2.5 rounded-xl"
                        >
                          <div>
                            <p className="text-xs font-bold text-white">
                              {inv.item}
                            </p>
                            <p className="text-[9px] text-white/50 font-mono">
                              Min: {inv.min} units
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-mono font-black text-white block">
                              {inv.current} left
                            </span>
                            <button
                              onClick={() => handleIngredientRestock(inv.item)}
                              className="text-[9px] text-white hover:underline uppercase font-black"
                            >
                              RESTOCK
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------------------------------- */}
          {/* TAB 2: NEW ORDERS PAGE */}
          {/* ---------------------------------------------------------------------------------- */}
          {activeTab === "New" && (
            <div className="space-y-6 animate-fadeIn" id="kds-new-orders-page">
              <div className="flex justify-between items-center">
                <h2 className="font-mono font-black text-lg text-white">
                  INCOMING TICKETS
                </h2>
                <span className="text-xs font-mono text-white/50">
                  Auto-refresh: 5s • Large click targets
                </span>
              </div>

              {pendingOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-[#120904] border border-[#3E2415] rounded-2xl text-center space-y-4">
                  <div className="p-4 bg-[#1A0F08] rounded-full border border-[#3E2415] text-white/40">
                    <BadgeCheck className="w-12 h-12 text-white" />
                  </div>
                  <div>
                    <h3 className="font-mono text-lg text-white font-black">
                      ALL ORDERS CLEARED
                    </h3>
                    <p className="text-xs text-white/50 max-w-sm mt-1">
                      Ready for the next rush. Station on standby.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingOrders.map((ord) => {
                    const orderAgeMins = Math.floor(
                      (currentTime.getTime() -
                        new Date(ord.createdAt).getTime()) /
                        60000,
                    );
                    const isUrgent = orderAgeMins >= 10;

                    return (
                      <motion.div
                        key={ord.id}
                        layoutId={`order-card-${ord.id}`}
                        className={`bg-[#120904] border rounded-2xl flex flex-col justify-between overflow-hidden shadow-xl transition-all ${
                          isUrgent
                            ? "border-white ring-4 ring-white/20 animate-pulse"
                            : "border-[#3E2415] hover:border-white"
                        }`}
                        style={{ minHeight: "420px" }}
                      >
                        {/* Header block */}
                        <div
                          className={`p-4 ${isUrgent ? "bg-white text-[#1A0F08]" : "bg-[#1A0F08] border-b border-[#3E2415] text-white"} flex justify-between items-center`}
                        >
                          <div>
                            <span
                              className={`text-xs font-mono px-2 py-0.5 rounded font-black border ${isUrgent ? "bg-[#1A0F08] text-white border-transparent" : "bg-white/10 text-white border-white/20"}`}
                            >
                              {ord.id}
                            </span>
                            <span className="text-[10px] font-bold ml-2 font-mono uppercase">
                              {ord.table === "Delivery"
                                ? "🚚 DELIV"
                                : ord.table.startsWith("Pickup")
                                  ? "🥡 PICK"
                                  : `🍽️ ${ord.table}`}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            {ord.priority && (
                              <span className="border border-white text-white text-[8px] font-mono font-black px-1.5 py-0.5 rounded">
                                VIP RUSH
                              </span>
                            )}
                            <span className="text-xs font-mono font-black">
                              {String(orderAgeMins).padStart(2, "0")}m ago
                            </span>
                          </div>
                        </div>

                        {/* Guest details bar */}
                        <div className="px-4 py-2 border-b border-[#3E2415]/40 bg-[#1A0F08]/10 flex justify-between items-center text-[10px]">
                          <span className="text-white/60 font-mono">
                            Guest:{" "}
                            <strong className="text-white">
                              {ord.customerName}
                            </strong>
                          </span>
                          <span className="text-white/40 font-mono">
                            {new Date(ord.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        {/* Food List (Main focus, very clear, 48px Qty target) */}
                        <div className="p-5 flex-1 overflow-y-auto no-scrollbar space-y-4">
                          {ord.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-start justify-between border-b border-[#3E2415]/50 pb-3 last:border-0"
                            >
                              <div className="flex-grow">
                                <div className="flex items-center space-x-3">
                                  <span className="text-4xl font-mono font-black text-white bg-white/10 px-3 py-1 rounded-lg border border-white/15">
                                    {item.quantity}x
                                  </span>
                                  <span className="text-sm font-mono font-bold text-white uppercase">
                                    {item.name}
                                  </span>
                                </div>
                                {item.customizations &&
                                  item.customizations.length > 0 && (
                                    <ul className="mt-1.5 pl-14 space-y-0.5 text-[10px] text-white/80 font-mono">
                                      {item.customizations.map((cust, cIdx) => (
                                        <li key={cIdx}>• {cust}</li>
                                      ))}
                                    </ul>
                                  )}
                              </div>
                            </div>
                          ))}

                          {/* Allergy & Special Notes */}
                          {ord.notes && (
                            <div className="bg-white text-[#1A0F08] border border-white p-2.5 rounded-xl text-[10px] font-mono font-bold mt-2">
                              <span className="block uppercase underline mb-0.5">
                                ⚠️ PREP ALERT:
                              </span>
                              <p className="uppercase">{ord.notes}</p>
                            </div>
                          )}
                        </div>

                        {/* Footer & Actions (TOUCH TARGET INSTRUCTIONS ACCORDING TO SPECS) */}
                        <div className="p-4 bg-[#1A0F08] border-t border-[#3E2415] space-y-3 shrink-0">
                          <div className="flex justify-between items-center text-[10px] text-white/50 font-mono">
                            <span>Predicted Prep Queue:</span>
                            <span className="text-white font-bold">14 min</span>
                          </div>

                          {/* Large touch targets minimum 60px height */}
                          <div className="grid grid-cols-4 gap-2">
                            <button
                              onClick={() => triggerRejectOrder(ord.id)}
                              className="bg-transparent text-rose-400 hover:bg-rose-950 hover:text-rose-100 px-1 h-[60px] rounded-xl border border-rose-500/30 text-[10px] font-mono uppercase font-black transition-all"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => triggerDelayOrder(ord.id)}
                              className="bg-transparent text-amber-400 hover:bg-amber-950 hover:text-amber-100 px-1 h-[60px] rounded-xl border border-amber-500/30 text-[10px] font-mono uppercase font-black transition-all"
                            >
                              Delay
                            </button>
                            <button
                              onClick={() =>
                                updateStatusWithAudio(ord.id, "Ready")
                              }
                              className="col-span-2 bg-white text-[#1A0F08] hover:bg-white/90 h-[60px] rounded-xl font-mono text-xs uppercase font-black tracking-widest transition-all"
                            >
                              👍 Accept (Ready)
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ---------------------------------------------------------------------------------- */}
          {/* TAB 3: PREPARING PAGE */}
          {/* ---------------------------------------------------------------------------------- */}
          {activeTab === "Preparing" && (
            <div className="space-y-6 animate-fadeIn" id="kds-preparing-page">
              <div className="flex justify-between items-center">
                <h2 className="font-mono font-black text-lg text-white">
                  PREPARATION CHECKLIST
                </h2>
                <span className="text-xs font-mono text-white/50">
                  {preparingOrders.length} tickets in preparation
                </span>
              </div>

              {preparingOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-[#120904] border border-[#3E2415] rounded-2xl text-center space-y-4">
                  <div className="p-4 bg-[#1A0F08] rounded-full border border-[#3E2415] text-white/40">
                    <Check className="w-12 h-12 text-white" />
                  </div>
                  <div>
                    <h3 className="font-mono text-lg text-white font-black">
                      NO ACTIVE PREPARATION
                    </h3>
                    <p className="text-xs text-white/50 max-w-sm mt-1">
                      Accept tickets from incoming tab to initialize checklist
                      loops.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {preparingOrders.map((ord) => {
                    const orderAgeMins = Math.floor(
                      (currentTime.getTime() -
                        new Date(ord.createdAt).getTime()) /
                        60000,
                    );

                    const tasks = [
                      "Gather ingredients",
                      "Prep luxury patties",
                      "Assemble bespoke sandwich",
                      "Garnish & inspect",
                    ];
                    const orderChecklist = checklistState[ord.id] || {};
                    const checkedCount = tasks.filter(
                      (t) => orderChecklist[t],
                    ).length;
                    const progressPct = (checkedCount / tasks.length) * 100;

                    return (
                      <div
                        key={ord.id}
                        className="bg-[#120904] border border-[#3E2415] rounded-2xl flex flex-col justify-between overflow-hidden"
                      >
                        {/* Header */}
                        <div className="p-4 bg-[#1A0F08] border-b border-[#3E2415] flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <span className="text-xs font-mono bg-[#120904] border border-[#3E2415] text-white px-2 py-0.5 rounded font-black">
                              {ord.id}
                            </span>
                            <span className="text-xs text-white/80 font-mono uppercase">
                              {ord.table}
                            </span>
                          </div>
                          <span className="text-xs font-mono text-white/50">
                            Elapsed: {orderAgeMins}m
                          </span>
                        </div>

                        {/* Body Checklist */}
                        <div className="p-5 flex-1 space-y-4">
                          <div>
                            <div className="flex justify-between text-[10px] font-mono text-white/60 mb-1">
                              <span>PREP CHECKLIST PROGRESS:</span>
                              <span className="text-white font-bold">
                                {checkedCount} / {tasks.length}
                              </span>
                            </div>
                            <div className="w-full bg-[#1A0F08] h-2 rounded-full overflow-hidden border border-[#3E2415]">
                              <div
                                className="bg-white h-full transition-all duration-300"
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                          </div>

                          {/* Tasks list with large Touch Targets */}
                          <div className="space-y-2">
                            {tasks.map((task, idx) => {
                              const isChecked = orderChecklist[task] || false;
                              return (
                                <label
                                  key={idx}
                                  className={`flex items-center p-3.5 rounded-xl border cursor-pointer select-none transition-all ${
                                    isChecked
                                      ? "bg-white/10 border-white text-white"
                                      : "bg-[#1A0F08] border-[#3E2415] text-white/60 hover:border-white"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      setChecklistState({
                                        ...checklistState,
                                        [ord.id]: {
                                          ...orderChecklist,
                                          [task]: e.target.checked,
                                        },
                                      });
                                      playSound("beep");
                                    }}
                                    className="sr-only"
                                  />
                                  <div
                                    className={`w-5 h-5 rounded border mr-3 flex items-center justify-center transition-all ${
                                      isChecked
                                        ? "bg-white border-white text-[#120904]"
                                        : "border-white/30 bg-[#1A0F08]"
                                    }`}
                                  >
                                    {isChecked && (
                                      <Check className="w-4 h-4 stroke-[4]" />
                                    )}
                                  </div>
                                  <span className="text-xs font-mono uppercase font-bold">
                                    {task}
                                  </span>
                                </label>
                              );
                            })}
                          </div>

                          {/* Food details */}
                          <div className="border-t border-[#3E2415] pt-3">
                            <span className="text-[9px] font-mono text-white/40 block uppercase">
                              TICKET SPECIFICATION:
                            </span>
                            {ord.items.map((i, idx) => (
                              <p
                                key={idx}
                                className="text-xs text-white font-mono uppercase font-bold mt-1"
                              >
                                {i.quantity}x {i.name}{" "}
                                {i.customizations.length > 0 &&
                                  `(${i.customizations.join(", ")})`}
                              </p>
                            ))}
                          </div>
                        </div>

                        {/* Actions h-[60px] greasy finger compliant */}
                        <div className="p-4 bg-[#1A0F08] border-t border-[#3E2415] grid grid-cols-3 gap-2">
                          <button
                            onClick={() => triggerDelayOrder(ord.id)}
                            className="bg-transparent text-white/80 border border-white/20 h-[60px] rounded-lg text-[10px] font-mono uppercase font-bold"
                          >
                            Delay Alert
                          </button>
                          <button
                            onClick={() => {
                              setSelectedIngredient("Beef Patty");
                              setRestockModalOpen(true);
                            }}
                            className="bg-transparent text-white/80 border border-white/20 h-[60px] rounded-lg text-[10px] font-mono uppercase font-bold"
                          >
                            Call Stock
                          </button>
                          <button
                            onClick={() =>
                              updateStatusWithAudio(ord.id, "Cooking")
                            }
                            className="bg-white text-[#120904] h-[60px] rounded-lg text-xs font-mono uppercase font-black text-center flex items-center justify-center space-x-1"
                          >
                            <Flame className="w-4 h-4 text-[#120904]" />
                            <span>Start Cook</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ---------------------------------------------------------------------------------- */}
          {/* TAB 4: COOKING PAGE */}
          {/* ---------------------------------------------------------------------------------- */}
          {activeTab === "Cooking" && (
            <div className="space-y-6 animate-fadeIn" id="kds-cooking-page">
              <div className="flex justify-between items-center">
                <h2 className="font-mono font-black text-lg text-white">
                  LIVE STATION TIMERS
                </h2>
                <span className="text-xs font-mono text-white/50">
                  Auto-timer decrements • Keep watch
                </span>
              </div>

              {orders.filter((o) => o.status === "Cooking").length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-[#120904] border border-[#3E2415] rounded-2xl text-center space-y-4">
                  <div className="p-4 bg-[#1A0F08] rounded-full border border-[#3E2415] text-white/40">
                    <Flame className="w-12 h-12 text-white/50" />
                  </div>
                  <div>
                    <h3 className="font-mono text-lg text-white font-black">
                      NO ACTIVE COOKING TIMERS
                    </h3>
                    <p className="text-xs text-white/50 max-w-sm mt-1">
                      Start cooking from the Preparing list. Timers
                      automatically trigger here.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {orders
                    .filter((o) => o.status === "Cooking")
                    .map((ord) => {
                      const timerSeconds =
                        ord.timeRemaining !== undefined
                          ? ord.timeRemaining
                          : 485;
                      const minutes = Math.floor(timerSeconds / 60);
                      const seconds = timerSeconds % 60;

                      const ratio = timerSeconds / 600;
                      // Standard color is white, flashing white for urgent alert
                      const strokeColor =
                        ratio < 0.25
                          ? "stroke-white animate-pulse"
                          : "stroke-white/80";
                      const timerColorClass =
                        ratio < 0.25
                          ? "text-white animate-pulse underline font-black"
                          : "text-white";

                      return (
                        <div
                          key={ord.id}
                          className="bg-[#120904] border border-[#3E2415] rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-center"
                        >
                          {/* Massive Timer with Progress Ring */}
                          <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                              <circle
                                cx="72"
                                cy="72"
                                r="64"
                                className="stroke-white/10 fill-none stroke-[6]"
                              />
                              <circle
                                cx="72"
                                cy="72"
                                r="64"
                                className={`${strokeColor} fill-none stroke-[6] transition-all`}
                                strokeDasharray="402"
                                strokeDashoffset={402 - 402 * ratio}
                              />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-[8px] font-mono text-white/50 tracking-wider">
                                TIMER
                              </span>
                              <span
                                className={`text-3xl font-mono font-black ${timerColorClass}`}
                              >
                                {String(minutes).padStart(2, "0")}:
                                {String(seconds).padStart(2, "0")}
                              </span>
                              <span className="text-[9px] font-mono text-white/75 mt-1">
                                {ord.id}
                              </span>
                            </div>
                          </div>

                          {/* Order Details & Checks */}
                          <div className="flex-1 flex flex-col justify-between h-full space-y-4 w-full">
                            <div>
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-mono font-black text-sm text-white uppercase">
                                    {ord.table}
                                  </h3>
                                  <p className="text-[10px] text-white/50 font-mono mt-0.5">
                                    Station: {selectedStation}
                                  </p>
                                </div>
                                <span className="text-[9px] font-mono bg-white/10 border border-white/20 px-2 py-0.5 rounded text-white font-bold">
                                  Medium Rare
                                </span>
                              </div>

                              {/* Food Checklist */}
                              <div className="mt-3 space-y-1 bg-[#1A0F08] p-2.5 rounded-xl border border-[#3E2415] max-h-24 overflow-y-auto no-scrollbar">
                                {ord.items.map((i, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center text-xs text-white/90"
                                  >
                                    <span className="w-1.5 h-1.5 bg-white rounded-full mr-2" />
                                    <span className="font-mono uppercase">
                                      {i.quantity}x {i.name}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Quick Actions (touch friendly h-[60px] greasy fingers) */}
                            <div className="grid grid-cols-3 gap-2">
                              <button
                                onClick={() => {
                                  onUpdateOrderStatus(ord.id, "Cooking", {
                                    timeRemaining: timerSeconds + 300,
                                  });
                                  playSound("beep");
                                }}
                                className="bg-transparent hover:bg-white/10 border border-white/20 text-[9px] text-white font-mono h-[50px] rounded-lg font-bold uppercase"
                              >
                                +5 Min
                              </button>
                              <button
                                onClick={() => {
                                  setEmergencyAlert(true);
                                  playSound("alarm");
                                }}
                                className="bg-transparent hover:bg-white/10 border border-white/40 text-white text-[9px] font-mono h-[50px] rounded-lg font-bold uppercase"
                              >
                                Problem
                              </button>
                              <button
                                onClick={() =>
                                  updateStatusWithAudio(ord.id, "Ready")
                                }
                                className="bg-white hover:bg-white/90 text-[#120904] text-[10px] font-mono h-[50px] rounded-lg font-black uppercase"
                              >
                                ✅ Done
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* ---------------------------------------------------------------------------------- */}
          {/* TAB 5: READY PAGE */}
          {/* ---------------------------------------------------------------------------------- */}
          {activeTab === "Ready" && (
            <div className="space-y-6 animate-fadeIn" id="kds-ready-page">
              <div className="flex justify-between items-center">
                <h2 className="font-mono font-black text-lg text-white">
                  READY FOR PICKUP
                </h2>
                <span className="text-xs font-mono text-white/50">
                  {readyOrders.length} tickets ready at the pass
                </span>
              </div>

              {readyOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-[#120904] border border-[#3E2415] rounded-2xl text-center space-y-4">
                  <div className="p-4 bg-[#1A0F08] rounded-full border border-[#3E2415] text-white/40">
                    <CheckSquare className="w-12 h-12 text-white" />
                  </div>
                  <div>
                    <h3 className="font-mono text-lg text-white font-black">
                      PASS IS CLEAR
                    </h3>
                    <p className="text-xs text-white/50 max-w-sm mt-1">
                      Stove plated items register here to synchronize floor
                      waiters.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {readyOrders.map((ord) => {
                    const orderAgeMins = Math.floor(
                      (currentTime.getTime() -
                        new Date(ord.createdAt).getTime()) /
                        60000,
                    );

                    return (
                      <div
                        key={ord.id}
                        className="bg-[#120904] border-2 border-white rounded-2xl p-5 flex flex-col justify-between min-h-[320px]"
                      >
                        <div>
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-3xl font-mono font-black text-white block">
                                {ord.id}
                              </span>
                              <span className="text-xs font-mono text-white/60 mt-1 block uppercase">
                                {ord.table} • Guest: {ord.customerName}
                              </span>
                            </div>
                            <span className="text-xs bg-white text-[#120904] font-mono font-black px-2 py-1 rounded animate-pulse">
                              READY
                            </span>
                          </div>

                          <div className="mt-4 space-y-2 border-t border-[#3E2415] pt-3">
                            <span className="text-[9px] font-mono text-white/40 block uppercase">
                              Pack Checklist:
                            </span>
                            {ord.items.map((i, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between text-xs text-white font-mono uppercase font-bold"
                              >
                                <span>{i.name}</span>
                                <span>x{i.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Actions (touch target high 60px friendly) */}
                        <div className="mt-6 space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => {
                                playSound("success");
                                alert(
                                  `Receipt Label printed for Ticket ${ord.id}`,
                                );
                              }}
                              className="bg-transparent hover:bg-white/10 border border-white/20 text-[10px] text-white font-mono py-3 rounded-lg font-bold uppercase flex items-center justify-center space-x-1"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Label Print</span>
                            </button>
                            <button
                              onClick={() => {
                                playSound("beep");
                                alert(
                                  `Floor waiters paged for Ticket ${ord.id}`,
                                );
                              }}
                              className="bg-white/10 hover:bg-white/20 border border-white/20 text-[10px] text-white font-mono py-3 rounded-lg font-bold uppercase"
                            >
                              🔔 Ping Floor
                            </button>
                          </div>

                          <button
                            onClick={() =>
                              updateStatusWithAudio(ord.id, "Completed")
                            }
                            className="w-full bg-white hover:bg-white/90 text-[#120904] font-mono text-xs py-4 rounded-lg font-black uppercase tracking-widest transition-all"
                          >
                            Mark Collected / Handed over
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ---------------------------------------------------------------------------------- */}
          {/* TAB 6: COMPLETED PAGE */}
          {/* ---------------------------------------------------------------------------------- */}
          {activeTab === "Completed" && (
            <div
              className="bg-[#120904] border border-[#3E2415] rounded-2xl p-6 space-y-6 animate-fadeIn"
              id="kds-completed-page"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-mono font-black text-lg text-white">
                    CHRONOLOGICAL DISPATCH HISTORY
                  </h2>
                  <p className="text-xs text-white/50 mt-1">
                    Completed items archive database
                  </p>
                </div>
                <span className="text-xs font-mono text-white bg-[#1A0F08] px-3 py-1.5 rounded-lg border border-[#3E2415]">
                  TOTAL DISPATCHED: {completedOrders.length}
                </span>
              </div>

              {completedOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-white/40 font-mono text-xs">
                  No tickets dispatched during this shift interval.
                </div>
              ) : (
                <div className="overflow-x-auto no-scrollbar border border-[#3E2415] rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#1A0F08] border-b border-[#3E2415] text-white/60 font-mono uppercase tracking-wider">
                        <th className="p-4">Order ID</th>
                        <th className="p-4">Guest Info</th>
                        <th className="p-4">Kitchen Station</th>
                        <th className="p-4">Completed At</th>
                        <th className="p-4">Dispatch Duration</th>
                        <th className="p-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#3E2415] font-mono text-white/80">
                      {completedOrders.map((o) => (
                        <tr key={o.id} className="hover:bg-white/5">
                          <td className="p-4 text-white font-black">{o.id}</td>
                          <td className="p-4 uppercase">
                            {o.customerName} ({o.table})
                          </td>
                          <td className="p-4">{selectedStation}</td>
                          <td className="p-4">
                            {new Date(o.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="p-4">12 min</td>
                          <td className="p-4 text-right">
                            <span className="bg-white text-[#120904] text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase">
                              Served
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ---------------------------------------------------------------------------------- */}
          {/* TAB 7: DELAYED ORDERS PAGE */}
          {/* ---------------------------------------------------------------------------------- */}
          {activeTab === "Delayed" && (
            <div
              className="bg-white/5 border-2 border-white/20 rounded-2xl p-6 space-y-6 animate-fadeIn"
              id="kds-delayed-page"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-mono font-black text-lg text-white">
                    CRITICAL DELAY ALERT PANEL
                  </h2>
                  <p className="text-xs text-white/50 mt-1">
                    Requires supervisor reallocations
                  </p>
                </div>
                <span className="text-xs font-mono text-white bg-white/15 px-3 py-1.5 rounded-lg border border-white/20">
                  Critical Backlog: {delayedOrdersCount}
                </span>
              </div>

              {delayedOrdersCount === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="p-4 bg-white/10 rounded-full border border-white/20 text-white">
                    <Check className="w-12 h-12" />
                  </div>
                  <div>
                    <h3 className="font-mono text-lg text-white font-black">
                      STATION RUNNING AT 100% TIMING
                    </h3>
                    <p className="text-xs text-white/50 max-w-sm mt-1">
                      All tickets are currently preparing within healthy timing
                      bounds.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {orders
                    .filter((o) => {
                      if (o.status === "Completed") return false;
                      const orderTime = new Date(o.createdAt);
                      const diffMins =
                        (currentTime.getTime() - orderTime.getTime()) / 60000;
                      return (
                        o.status === "Delayed" ||
                        diffMins > 10 ||
                        (o.notes && o.notes.toUpperCase().includes("DELAYED"))
                      );
                    })
                    .map((ord) => {
                      const orderAgeMins = Math.floor(
                        (currentTime.getTime() -
                          new Date(ord.createdAt).getTime()) /
                          60000,
                      );

                      return (
                        <div
                          key={ord.id}
                          className="bg-[#120904] border border-white rounded-2xl p-5 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex justify-between">
                              <span className="text-lg font-mono font-black text-white">
                                {ord.id}
                              </span>
                              <span className="text-xs font-mono text-white bg-white/10 px-2 py-0.5 rounded font-black">
                                Elapsed: {orderAgeMins} Mins
                              </span>
                            </div>

                            <p className="text-xs text-white/70 font-mono mt-1 uppercase">
                              {ord.table} • Guest: {ord.customerName}
                            </p>

                            {/* Food Summary */}
                            <div className="mt-3 bg-[#1A0F08] border border-[#3E2415] p-2.5 rounded-xl space-y-1">
                              {ord.items.map((i, idx) => (
                                <p
                                  key={idx}
                                  className="text-xs text-white font-mono font-bold uppercase"
                                >
                                  {i.quantity}x {i.name}
                                </p>
                              ))}
                            </div>
                          </div>

                          {/* Actions (touch target greasy fingers h-[60px] friendly) */}
                          <div className="mt-6 space-y-3">
                            <div className="flex justify-between items-center text-[10px] font-mono text-white/50">
                              <span>Delay Reason filed:</span>
                              <span className="text-white font-black uppercase">
                                {ord.notes?.includes("DELAYED")
                                  ? ord.notes
                                      .split("]")[0]
                                      .replace("DELAYED: [", "")
                                  : "Requires Filing"}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => triggerDelayOrder(ord.id)}
                                className="bg-transparent hover:bg-white/10 text-white font-mono text-[10px] h-[50px] rounded-lg font-bold uppercase border border-white/20"
                              >
                                File Reason
                              </button>
                              <button
                                onClick={() => {
                                  onUpdateOrderStatus(ord.id, ord.status, {
                                    priority: true,
                                  });
                                  playSound("success");
                                }}
                                className="bg-white text-[#120904] font-mono text-[10px] h-[50px] rounded-lg font-black uppercase"
                              >
                                🔥 Prioritize
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* ---------------------------------------------------------------------------------- */}
          {/* TAB 8: KITCHEN TIMERS PAGE */}
          {/* ---------------------------------------------------------------------------------- */}
          {activeTab === "Timers" && (
            <div
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn"
              id="kds-timers-page"
            >
              {/* Active Timers Grid */}
              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {timers.map((t) => {
                  const m = Math.floor(t.time / 60);
                  const s = t.time % 60;
                  const ratio = t.time / t.maxTime;
                  const strokeColor =
                    ratio < 0.2 ? "bg-white animate-pulse" : "bg-white/70";

                  return (
                    <div
                      key={t.id}
                      className="bg-[#120904] border border-[#3E2415] p-6 rounded-2xl flex flex-col justify-between space-y-4"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-mono font-black text-xs text-white uppercase">
                            {t.label}
                          </h4>
                          <span className="text-[8px] font-mono text-white/40 block mt-0.5 uppercase">
                            Type: {t.type}
                          </span>
                        </div>
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${t.running ? "bg-white animate-ping" : "bg-white/20"}`}
                        />
                      </div>

                      <div className="text-center py-4">
                        <span className="text-4xl font-mono font-black text-white block tracking-widest">
                          {String(m).padStart(2, "0")}:
                          {String(s).padStart(2, "0")}
                        </span>
                      </div>

                      {/* Progress Line */}
                      <div className="w-full bg-[#1A0F08] h-1.5 rounded-full overflow-hidden border border-[#3E2415]">
                        <div
                          className={`${strokeColor} h-full transition-all`}
                          style={{ width: `${ratio * 100}%` }}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setTimers(
                              timers.map((ti) =>
                                ti.id === t.id
                                  ? { ...ti, running: !ti.running }
                                  : ti,
                              ),
                            );
                            playSound("beep");
                          }}
                          className="bg-transparent hover:bg-white/10 border border-white/20 text-[10px] font-mono text-white py-1.5 rounded-lg"
                        >
                          {t.running ? "PAUSE" : "START"}
                        </button>
                        <button
                          onClick={() => {
                            setTimers(
                              timers.map((ti) =>
                                ti.id === t.id
                                  ? { ...ti, time: t.maxTime, running: false }
                                  : ti,
                              ),
                            );
                            playSound("beep");
                          }}
                          className="bg-transparent hover:bg-white/10 border border-white/20 text-[10px] font-mono text-white py-1.5 rounded-lg"
                        >
                          RESET
                        </button>
                        <button
                          onClick={() => {
                            setTimers(timers.filter((ti) => ti.id !== t.id));
                            playSound("beep");
                          }}
                          className="bg-white text-[#120904] text-[10px] font-mono py-1.5 rounded-lg font-black"
                        >
                          DELETE
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Custom Timer Form */}
              <div className="lg:col-span-4 bg-[#120904] border border-[#3E2415] p-6 rounded-2xl space-y-4">
                <h4 className="font-mono font-black text-sm text-white uppercase">
                  Launch Timer
                </h4>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-white/50 uppercase block">
                      Label Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Grill #3 - Steak"
                      value={newTimerLabel}
                      onChange={(e) => setNewTimerLabel(e.target.value)}
                      className="w-full bg-[#1A0F08] border border-[#3E2415] text-xs text-white p-3 rounded-xl focus:outline-none focus:border-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-white/50 uppercase block">
                      Station Type
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                      {["Grill", "Fryer", "Oven", "Custom"].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setNewTimerType(type as any)}
                          className={`py-2 px-3 rounded-lg border transition-all ${
                            newTimerType === type
                              ? "bg-white text-[#120904] border-white"
                              : "bg-[#1A0F08] border-[#3E2415] text-white/60"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-white/50 uppercase block">
                      Duration (Secs)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 180"
                      value={newTimerSeconds}
                      onChange={(e) => setNewTimerSeconds(e.target.value)}
                      className="w-full bg-[#1A0F08] border border-[#3E2415] text-xs text-white p-3 rounded-xl focus:outline-none focus:border-white"
                    />
                  </div>

                  <button
                    onClick={handleLaunchTimer}
                    className="w-full bg-white text-[#120904] hover:bg-white/90 font-mono text-xs uppercase font-black py-3 rounded-xl tracking-wider transition-colors"
                  >
                    Launch Timer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------------------------------- */}
          {/* TAB 9: INGREDIENT ALERTS PAGE */}
          {/* ---------------------------------------------------------------------------------- */}
          {activeTab === "Inventory" && (
            <div
              className="bg-[#120904] border border-[#3E2415] rounded-2xl p-6 space-y-6 animate-fadeIn"
              id="kds-inventory-alerts-page"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-mono font-black text-lg text-white uppercase">
                    Ingredient Threshold Alerts
                  </h2>
                  <p className="text-xs text-white/50 mt-1">
                    Real-time stock monitoring loops to secure preparation
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {inventory.map((inv, idx) => {
                  const isCritical =
                    inv.status === "Critical" || inv.current === 0;
                  const isLow = inv.status === "Low";

                  return (
                    <div
                      key={idx}
                      className={`border p-5 rounded-2xl flex flex-col justify-between space-y-4 transition-all ${
                        inv.current === 0
                          ? "bg-white text-[#120904] border-white shadow-[0_0_15px_rgba(255,255,255,0.2)] animate-pulse"
                          : isCritical
                            ? "bg-[#1A0F08] border-white"
                            : isLow
                              ? "bg-[#1A0F08] border-white/40"
                              : "bg-[#120904] border-[#3E2415]"
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-mono font-black uppercase text-white">
                            {inv.item}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded text-[8px] font-mono font-black uppercase border ${
                              inv.current === 0
                                ? "bg-white text-[#120904]"
                                : isCritical
                                  ? "bg-transparent text-white border-white"
                                  : "bg-transparent text-white/80 border-white/20"
                            }`}
                          >
                            {inv.current === 0 ? "OUT OF STOCK" : inv.status}
                          </span>
                        </div>

                        <p className="text-[10px] text-white/50 font-mono mt-1">
                          Min Threshold: {inv.min} units
                        </p>
                      </div>

                      <div className="flex justify-between items-end border-t border-white/10 pt-3">
                        <div>
                          <span className="text-[8px] font-mono text-white/40 block uppercase">
                            CURRENT LEVEL
                          </span>
                          <span className="font-mono text-base font-black text-white">
                            {inv.current} left
                          </span>
                        </div>
                        <button
                          onClick={() => handleIngredientRestock(inv.item)}
                          className="bg-white text-[#120904] hover:opacity-90 font-mono text-[9px] uppercase font-black px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Restock
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------------------------------- */}
          {/* TAB 10: REPORTS PAGE */}
          {/* ---------------------------------------------------------------------------------- */}
          {activeTab === "Reports" && (
            <div
              className="bg-[#120904] border border-[#3E2415] rounded-2xl p-6 space-y-6 animate-fadeIn"
              id="kds-reports-page"
            >
              <div className="flex justify-between items-center border-b border-[#3E2415] pb-4">
                <div>
                  <h2 className="font-mono font-black text-lg text-white">
                    SHIFT SPEED REPORTS
                  </h2>
                  <p className="text-xs text-white/50 mt-1">
                    Review speed, efficiency, and cancellation metrics
                  </p>
                </div>
                <button
                  onClick={() =>
                    alert("Downloading shifting reports summary...")
                  }
                  className="bg-white text-[#120904] hover:bg-white/90 font-mono text-xs uppercase font-bold py-2 px-4 rounded-lg"
                >
                  Download Summary (PDF)
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#1A0F08] p-5 rounded-2xl border border-[#3E2415] space-y-3">
                  <h4 className="text-white/50 font-mono text-xs uppercase">
                    Overall Dispatch Speed
                  </h4>
                  <p className="text-2xl font-mono font-black text-white">
                    11.8 min
                  </p>
                  <p className="text-[10px] text-white/60 font-sans">
                    Avg prep time. Down 1.2 min from yesterday.
                  </p>
                </div>

                <div className="bg-[#1A0F08] p-5 rounded-2xl border border-[#3E2415] space-y-3">
                  <h4 className="text-white/50 font-mono text-xs uppercase">
                    Cancellation / Waste Rate
                  </h4>
                  <p className="text-2xl font-mono font-black text-white">
                    1.4%
                  </p>
                  <p className="text-[10px] text-white/60 font-sans">
                    Rejected orders or custom remakes.
                  </p>
                </div>

                <div className="bg-[#1A0F08] p-5 rounded-2xl border border-[#3E2415] space-y-3">
                  <h4 className="text-white/50 font-mono text-xs uppercase">
                    Checklist Compliance Score
                  </h4>
                  <p className="text-2xl font-mono font-black text-white">
                    98.2%
                  </p>
                  <p className="text-[10px] text-white/60 font-sans">
                    Checklist completion on luxury tickets.
                  </p>
                </div>
              </div>

              {/* Detailed Performance Table */}
              <div className="space-y-4 pt-4">
                <h3 className="font-mono font-bold text-sm text-white uppercase">
                  Station Efficiency Table
                </h3>
                <div className="divide-y divide-[#3E2415] font-mono text-xs">
                  {[
                    {
                      station: "Grill Station #2",
                      completed: 48,
                      speed: "11.2 min",
                      efficiency: "94%",
                    },
                    {
                      station: "Fryer Station #1",
                      completed: 32,
                      speed: "4.5 min",
                      efficiency: "98%",
                    },
                    {
                      station: "Prep & Assembly",
                      completed: 51,
                      speed: "6.8 min",
                      efficiency: "91%",
                    },
                    {
                      station: "Patisserie / Desserts",
                      completed: 14,
                      speed: "14.1 min",
                      efficiency: "87%",
                    },
                  ].map((s, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center py-3"
                    >
                      <span className="font-bold text-white uppercase">
                        {s.station}
                      </span>
                      <div className="flex space-x-6 text-white/60">
                        <span>{s.completed} Tickets</span>
                        <span>Speed: {s.speed}</span>
                        <span className="text-white font-black">
                          Score: {s.efficiency}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ---------------------------------------------------------------------------------- */}
      {/* FLOATING AI ASSISTANT CHAT PANEL (STRICT WHITE & BROWN THEMED) */}
      {/* ---------------------------------------------------------------------------------- */}
      <div className="fixed bottom-6 right-6 z-50">
        {!aiChatOpen ? (
          <button
            onClick={() => setAiChatOpen(true)}
            className="w-14 h-14 bg-white hover:opacity-90 rounded-full flex items-center justify-center text-black shadow-2xl transition-all border-4 border-[#120904] group"
            title="Open AI Kitchen Assistant Drawer"
          >
            <Sparkles className="w-6 h-6 text-[#120904] animate-pulse" />
          </button>
        ) : (
          <div className="bg-[#120904] border-2 border-white rounded-3xl shadow-2xl w-[320px] h-[440px] flex flex-col justify-between overflow-hidden">
            {/* Header */}
            <div className="bg-white p-4 flex justify-between items-center text-[#120904]">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#120904]" />
                <span className="font-mono font-black text-xs uppercase tracking-wider">
                  AI Coordinator
                </span>
              </div>
              <button
                onClick={() => setAiChatOpen(false)}
                className="text-[#120904] hover:bg-black/10 p-1 rounded-full transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 no-scrollbar bg-[#1A0F08] text-[11px] font-sans">
              {aiChatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                      msg.role === "user"
                        ? "bg-white text-[#120904] font-black rounded-tr-none"
                        : "bg-[#120904] border border-[#3E2415] text-white rounded-tl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#120904] border border-[#3E2415] p-3 rounded-2xl text-white/50 animate-pulse font-mono">
                    Consulting gourmet models...
                  </div>
                </div>
              )}
            </div>

            {/* Quick Prompts */}
            <div className="px-3 py-1 bg-[#120904] flex gap-1 overflow-x-auto no-scrollbar border-t border-[#3E2415]">
              {[
                {
                  label: "Prep times?",
                  q: "What is my current queue preparation time analysis?",
                },
                {
                  label: "Patties low?",
                  q: "Beef patties are critical, how do I handle menu block?",
                },
                {
                  label: "Optimize?",
                  q: "How should I optimize chef station roles for burgers?",
                },
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setAiChatQuery(p.q);
                  }}
                  className="text-[8px] bg-[#1A0F08] border border-[#3E2415] hover:border-white text-white rounded px-2 py-1 shrink-0 whitespace-nowrap"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 bg-[#120904] border-t border-[#3E2415] flex space-x-2">
              <input
                type="text"
                placeholder="Ask Coordinator..."
                value={aiChatQuery}
                onChange={(e) => setAiChatQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendAiMessage();
                }}
                className="flex-1 bg-[#1A0F08] border border-[#3E2415] text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-white"
              />
              <button
                onClick={handleSendAiMessage}
                className="bg-white text-[#120904] hover:bg-white/90 p-2 rounded-xl text-xs font-black uppercase"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ---------------------------------------------------------------------------------- */}
      {/* SECURITY BYPASS PIN MODAL (STRICT WHITE & DARK BROWN) */}
      {/* ---------------------------------------------------------------------------------- */}
      <AnimatePresence>
        {pinModalOpen && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#120904] border-2 border-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl relative"
            >
              <div className="text-center">
                <Shield className="w-10 h-10 text-white mx-auto mb-2 animate-bounce" />
                <h3 className="font-mono font-black text-base text-white uppercase tracking-wide">
                  Manager Pin Required
                </h3>
                <p className="text-[10px] text-white/50 font-mono mt-1">
                  Action requires manager authorization bypass
                </p>
              </div>

              {pinError && (
                <div className="bg-white text-[#120904] p-2.5 rounded-xl text-center font-mono text-[10px] font-bold">
                  {pinError}
                </div>
              )}

              <div className="space-y-4">
                <input
                  type="password"
                  maxLength={4}
                  placeholder="••••"
                  value={enteredPin}
                  onChange={(e) => setEnteredPin(e.target.value)}
                  className="w-full text-center bg-[#1A0F08] border border-[#3E2415] text-xl font-mono text-white p-3 rounded-2xl focus:outline-none focus:border-white"
                />

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setPinModalOpen(false);
                      setRejoiningOrderId(null);
                    }}
                    className="bg-[#1A0F08] hover:bg-[#1A0F08]/80 text-white/70 py-3 rounded-xl border border-[#3E2415] font-mono text-[10px] uppercase font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={verifyPinAndReject}
                    className="bg-white hover:bg-white/90 text-[#120904] py-3 rounded-xl font-mono text-[10px] uppercase font-black"
                  >
                    Authorize Reject
                  </button>
                </div>
              </div>

              <div className="text-center">
                <span className="text-[9px] text-white/40 font-mono uppercase">
                  Shift Code: 1234, 7777, 0000
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ---------------------------------------------------------------------------------- */}
      {/* DELAY REASON MODAL (STRICT WHITE & DARK BROWN) */}
      {/* ---------------------------------------------------------------------------------- */}
      <AnimatePresence>
        {delayModalOpen && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#120904] border-2 border-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl"
            >
              <div className="text-center">
                <AlertTriangle className="w-10 h-10 text-white mx-auto mb-2" />
                <h3 className="font-mono font-black text-base text-white uppercase tracking-wide">
                  File Delay Reason
                </h3>
                <p className="text-[10px] text-white/50 font-mono mt-1">
                  Audit log updates waiter and reception dashboards
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-white/50 uppercase block">
                    Primary Reason
                  </label>
                  <select
                    value={delayReason}
                    onChange={(e) => setDelayReason(e.target.value)}
                    className="w-full bg-[#1A0F08] border border-[#3E2415] text-xs text-white p-3 rounded-xl focus:outline-none focus:border-white"
                  >
                    <option value="Kitchen backup">
                      Kitchen backup / High Traffic
                    </option>
                    <option value="Equipment failure">
                      Equipment failure / Grill down
                    </option>
                    <option value="Ingredient shortage">
                      Ingredient shortage
                    </option>
                    <option value="Complex order">
                      Complex burger specifications
                    </option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-white/50 uppercase block">
                    Extra Notes
                  </label>
                  <textarea
                    placeholder="e.g. Grilling double patty taking longer..."
                    value={delayNotes}
                    onChange={(e) => setDelayNotes(e.target.value)}
                    className="w-full bg-[#1A0F08] border border-[#3E2415] text-xs text-white p-3 rounded-xl h-20 focus:outline-none focus:border-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setDelayModalOpen(false);
                      setDelayOrderId(null);
                    }}
                    className="bg-[#1A0F08] hover:bg-[#1A0F08]/80 text-white/70 py-3 rounded-xl border border-[#3E2415] font-mono text-[10px] uppercase font-bold"
                  >
                    Discard
                  </button>
                  <button
                    onClick={saveDelayOrder}
                    className="bg-white hover:bg-white/90 text-[#120904] py-3 rounded-xl font-mono text-[10px] uppercase font-black"
                  >
                    File Alert
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ---------------------------------------------------------------------------------- */}
      {/* INGREDIENT RESTOCK MODAL (STRICT WHITE & DARK BROWN) */}
      {/* ---------------------------------------------------------------------------------- */}
      <AnimatePresence>
        {restockModalOpen && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#120904] border-2 border-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl"
            >
              <div className="text-center">
                <Database className="w-10 h-10 text-white mx-auto mb-2" />
                <h3 className="font-mono font-black text-base text-white uppercase tracking-wide">
                  Restock Refill
                </h3>
                <p className="text-[10px] text-white/50 font-mono mt-1">
                  Replenish item:{" "}
                  <strong className="text-white">{selectedIngredient}</strong>
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-white/50 uppercase block">
                    Refill Qty (units)
                  </label>
                  <input
                    type="number"
                    value={restockQty}
                    onChange={(e) => setRestockQty(e.target.value)}
                    className="w-full text-center bg-[#1A0F08] border border-[#3E2415] text-lg font-mono text-white p-3 rounded-2xl focus:outline-none focus:border-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setRestockModalOpen(false);
                      setSelectedIngredient(null);
                    }}
                    className="bg-[#1A0F08] hover:bg-[#1A0F08]/80 text-white/70 py-3 rounded-xl border border-[#3E2415] font-mono text-[10px] uppercase font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmRestock}
                    className="bg-white hover:bg-white/90 text-[#120904] py-3 rounded-xl font-mono text-[10px] uppercase font-black"
                  >
                    Confirm Refill
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
