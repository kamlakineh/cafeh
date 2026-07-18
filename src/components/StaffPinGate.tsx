import React from "react";
import {
  Lock,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  LogOut,
  KeyRound,
  ChevronDown,
} from "lucide-react";
import { Employee } from "../types";

interface StaffPinGateProps {
  userRole: string;
  employees: Employee[];
  onAuthSuccess: (employee: Employee) => void;
  onCancel: () => void;
}

export default function StaffPinGate({
  userRole,
  employees,
  onAuthSuccess,
  onCancel,
}: StaffPinGateProps) {
  const [inputEmpId, setInputEmpId] = React.useState<string>("");
  const [showCheatSheet, setShowCheatSheet] = React.useState<boolean>(false);
  const [pin, setPin] = React.useState<string>("");
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  const handleKeyPress = (num: string) => {
    setErrorMsg(null);
    if (num === "CLEAR") {
      setPin("");
    } else if (num === "DELETE") {
      setPin((prev) => prev.slice(0, -1));
    } else {
      if (pin.length < 4) {
        setPin((prev) => prev + num);
      }
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputEmpId.trim()) {
      setErrorMsg("Please enter your Employee ID.");
      return;
    }
    if (pin.length < 4) {
      setErrorMsg("Please enter your complete 4-digit security PIN.");
      return;
    }

    try {
      const res = await fetch("/api/employees/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: inputEmpId.trim(), pin }),
      });

      if (!res.ok) {
        const data = await res.json();
        setErrorMsg(
          data.error ||
            "Invalid Employee ID or security PIN. Access attempt recorded.",
        );
        setPin("");
        return;
      }

      const data = await res.json();
      const employee = data.employee;

      if (!employee || !employee.name) {
        setErrorMsg("Authentication failed: Invalid server response.");
        setPin("");
        return;
      }

      // Success!
      setSuccessMsg(`Authorization Granted. Welcome back, ${employee.name}!`);
      setTimeout(() => {
        onAuthSuccess(employee);
      }, 800);
    } catch (err) {
      console.error("Authentication error:", err);
      setErrorMsg("Failed to connect to authentication server.");
      setPin("");
    }
  };

  // Auto submit when PIN reaches 4 digits and ID is present
  React.useEffect(() => {
    if (pin.length === 4 && inputEmpId.trim().length > 0) {
      handleSubmit();
    }
  }, [pin]);

  const targetDashboardLabel = () => {
    switch (userRole) {
      case "manager":
        return "Manager Command";
      case "owner":
        return "Owner Executive Intel";
      case "cashier":
        return "Reception / Cashier POS";
      case "waiter":
        return "Waiter Floor Grid";
      case "kitchen":
        return "Kitchen Display System (KDS)";
      default:
        return "Staff Dashboard";
    }
  };

  return (
    <div
      className="min-h-[85vh] flex items-center justify-center px-4 py-8 bg-[#0F172A]/50 animate-fadeIn"
      id="secure-staff-gate"
    >
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
        {/* Subtle decorative glow */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-[#2B6CB0] rounded-3xl opacity-15 blur-lg pointer-events-none" />

        <div className="text-center space-y-2 pb-2 relative z-10">
          <div className="mx-auto w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/30 animate-pulse">
            <Lock className="w-5 h-5 text-amber-500" />
          </div>
          <h2 className="font-serif text-lg font-bold text-white uppercase tracking-wider">
            Aura Staff Terminal
          </h2>
          <p className="text-[10px] font-mono text-[#2B6CB0] uppercase tracking-widest font-black">
            LOCKED • {targetDashboardLabel()}
          </p>
        </div>

        {/* Status Alerts */}
        {errorMsg && (
          <div className="mt-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl flex items-start space-x-2 animate-fadeIn font-sans">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-3 rounded-xl flex items-start space-x-2 animate-fadeIn font-sans">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4 relative z-10 font-sans"
        >
          {/* Employee ID input instead of select dropdown */}
          <div className="space-y-1">
            <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">
              Employee ID
            </label>
            <input
              type="text"
              value={inputEmpId}
              onChange={(e) => {
                setInputEmpId(e.target.value.toUpperCase());
                setErrorMsg(null);
                setPin("");
              }}
              placeholder="e.g. EMP-100"
              className="w-full bg-slate-950 border border-slate-850 text-amber-500 rounded-xl px-4 py-3 text-sm focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 outline-none transition-all font-mono uppercase tracking-widest text-center"
            />
          </div>

          {/* Hidden Password Indicator */}
          <div className="space-y-1.5 pt-2">
            <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold text-center">
              Enter 4-Digit PIN Code
            </label>
            <div className="flex justify-center space-x-4 py-2 lg:hidden">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                    pin.length > index
                      ? "bg-amber-500 border-amber-500 scale-110 shadow-[0_0_8px_#F59E0B]"
                      : "border-slate-700 bg-transparent"
                  }`}
                />
              ))}
            </div>
            {/* Real Password/PIN input for desktop/computer users */}
            <div className="hidden lg:block px-1">
              <input
                type="password"
                pattern="[0-9]*"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "");
                  setPin(val);
                  setErrorMsg(null);
                }}
                placeholder="••••"
                className="w-full bg-slate-950 border border-slate-850 text-amber-500 rounded-xl px-4 py-3 text-sm focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 outline-none transition-all font-mono text-center tracking-widest"
              />
            </div>
          </div>

          {/* Secure Touchscreen Keypad */}
          <div className="grid grid-cols-3 gap-2 bg-slate-950 p-4 rounded-2xl border border-slate-800 select-none lg:hidden">
            {[
              "1",
              "2",
              "3",
              "4",
              "5",
              "6",
              "7",
              "8",
              "9",
              "DELETE",
              "0",
              "CLEAR",
            ].map((keyChar) => (
              <button
                key={keyChar}
                type="button"
                onClick={() => handleKeyPress(keyChar)}
                className={`h-12 flex items-center justify-center font-mono rounded-xl transition-all active:scale-95 duration-100 ${
                  keyChar === "DELETE" || keyChar === "CLEAR"
                    ? "text-[10px] font-black text-slate-400 bg-slate-900/60 hover:bg-slate-900"
                    : "text-lg font-bold text-slate-200 bg-slate-900/80 hover:bg-slate-850 hover:text-white"
                }`}
              >
                {keyChar}
              </button>
            ))}
          </div>

          {/* Login Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-sans text-xs uppercase font-black rounded-xl tracking-wider transition-all duration-150 flex items-center justify-center space-x-2 shadow-[0_0_12px_rgba(245,158,11,0.2)] hover:shadow-[0_0_16px_rgba(245,158,11,0.4)] cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Login / Authenticate</span>
            </button>
          </div>

          {/* Quick Info & Cancel Action */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-800/60">
            <div className="flex items-center space-x-1 text-[10px] font-mono text-slate-500 uppercase">
              <KeyRound className="w-3 h-3 text-[#2B6CB0]" />
              <span>AES-256 Authentication</span>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="px-3.5 py-1.5 bg-slate-800/40 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-mono font-bold flex items-center space-x-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit To Public View</span>
            </button>
          </div>

          {/* Collapsible Demo credentials sheet */}
          <div className="pt-2 border-t border-slate-800/40">
            <button
              type="button"
              onClick={() => setShowCheatSheet(!showCheatSheet)}
              className="w-full flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase tracking-wider hover:text-slate-300 transition-colors py-1"
            >
              <span>
                {showCheatSheet ? "Hide" : "Show"} Active IDs & PINs (Demo)
              </span>
              <ChevronDown
                className={`w-3 h-3 transition-transform duration-200 ${showCheatSheet ? "rotate-180" : ""}`}
              />
            </button>
            {showCheatSheet && (
              <div className="mt-2 bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-1.5 animate-fadeIn font-mono text-[9px] text-slate-400">
                <div className="flex justify-between border-b border-slate-900 pb-1 text-slate-500 uppercase font-black">
                  <span>Role Dashboard</span>
                  <span>ID</span>
                  <span>PIN</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-500 font-bold">
                    Owner Dashboard
                  </span>
                  <span className="font-bold text-white">EMP-099</span>
                  <span className="text-amber-400 font-bold">9999</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#2B6CB0] font-bold">
                    Manager Dashboard
                  </span>
                  <span className="font-bold text-white">EMP-100</span>
                  <span className="text-amber-400 font-bold">5555</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-500 font-bold">
                    Kitchen Display (KDS)
                  </span>
                  <span className="font-bold text-white">EMP-101</span>
                  <span className="text-amber-400 font-bold">1111</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-400 font-bold">
                    Cashier Dashboard
                  </span>
                  <span className="font-bold text-white">EMP-104</span>
                  <span className="text-amber-400 font-bold">4444</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-rose-400 font-bold">
                    Waiter Floor Grid
                  </span>
                  <span className="font-bold text-white">EMP-105</span>
                  <span className="text-amber-400 font-bold">1234</span>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
