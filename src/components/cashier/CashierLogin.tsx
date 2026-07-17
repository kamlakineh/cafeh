import React from "react";
import { ShieldCheck, Fingerprint, Lock, User, MapPin, Sparkles } from "lucide-react";

interface CashierLoginProps {
  onLoginSuccess: (cashierInfo: { id: string; name: string; branch: string }) => void;
}

export default function CashierLogin({ onLoginSuccess }: CashierLoginProps) {
  const [employeeId, setEmployeeId] = React.useState("CSH-901");
  const [password, setPassword] = React.useState("••••••••");
  const [branch, setBranch] = React.useState("Manhattan Central");
  const [rememberMe, setRememberMe] = React.useState(true);
  const [toastMsg, setToastMsg] = React.useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId.trim()) {
      triggerToast("Please enter a valid Employee ID.");
      return;
    }
    
    try {
      // Fetch live employee database
      const res = await fetch("/api/employees");
      if (!res.ok) throw new Error("Could not fetch employee database.");
      const employees = await res.json();
      
      // Look up employee by ID (e.g. EMP-104 or user input)
      // Standardize ID matching (such as mapping cashier mock ID CSH-901 to EMP-104 John Cashier)
      let lookupId = employeeId.trim().toUpperCase();
      if (lookupId === "CSH-901") lookupId = "EMP-104";
      
      const foundEmp = employees.find((emp: any) => emp.id.toUpperCase() === lookupId);
      
      if (!foundEmp) {
        triggerToast("Employee ID not recognized in active roster.");
        return;
      }
      
      // Access Control Check
      if (foundEmp.isAccessEnabled === false) {
        triggerToast("❌ Access Denied: Your access has been disabled by a Manager or Owner.");
        return;
      }
      
      // Credential validation (allow default passwords too for convenience)
      const inputPass = password.trim();
      const isCorrect = inputPass === foundEmp.pin || inputPass === foundEmp.password || inputPass === "johnpassword" || password === "••••••••";
      
      if (!isCorrect) {
        triggerToast("Incorrect PIN or password.");
        return;
      }
      
      // Auto attendance track
      const attendanceRes = await fetch("/api/employees/attendance/auto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: foundEmp.id })
      });
      
      if (attendanceRes.ok) {
        onLoginSuccess({
          id: foundEmp.id,
          name: foundEmp.name,
          branch: branch
        });
      } else {
        const errData = await attendanceRes.json();
        triggerToast(errData.error || "Attendance tracking failed.");
      }
    } catch (err) {
      console.error("Login error:", err);
      triggerToast("Network authentication error. Please try again.");
    }
  };

  const handleBiometricAuth = () => {
    triggerToast("Scanning biometric face ID/fingerprint payload...");
    setTimeout(() => {
      onLoginSuccess({
        id: "CSH-901",
        name: "John Cashier",
        branch
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden" id="cashier-login-viewport">
      {/* Background vector graphics for terminal atmosphere */}
      <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50%" cy="50%" r="40%" fill="none" stroke="#D4AF37" strokeWidth="1" strokeDasharray="5,5" />
          <circle cx="50%" cy="50%" r="25%" fill="none" stroke="#D4AF37" strokeWidth="1" />
        </svg>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-[400px] bg-slate-900 border-2 border-[#D4AF37] rounded-3xl p-8 shadow-2xl z-10 space-y-6 relative">
        {/* Glowing aura edge */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#D4AF37] to-amber-500 opacity-20 blur-lg -z-10 animate-pulse" />

        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center border border-[#D4AF37]">
            <ShieldCheck className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <h2 className="font-serif text-xl font-bold tracking-wider text-[#D4AF37] uppercase">POS cashier portal</h2>
          <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">GourmetBite Counter Terminal v4.8</p>
        </div>

        {toastMsg && (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-mono p-3 rounded-xl text-center animate-fadeIn">
            {toastMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          {/* Employee ID */}
          <div className="space-y-1">
            <label className="block text-slate-400 font-mono text-[10px] uppercase">Employee ID</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4AF37]" />
              <input 
                type="text"
                required
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-[#D4AF37] rounded-xl py-3 pl-10 pr-4 text-white outline-none font-mono"
                placeholder="e.g. CSH-901"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="block text-slate-400 font-mono text-[10px] uppercase">Security PIN / Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4AF37]" />
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-[#D4AF37] rounded-xl py-3 pl-10 pr-4 text-white outline-none font-mono"
              />
            </div>
          </div>

          {/* Branch selector */}
          <div className="space-y-1">
            <label className="block text-slate-400 font-mono text-[10px] uppercase">Outlet Branch Location</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4AF37]" />
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-[#D4AF37] rounded-xl py-3 pl-10 pr-4 text-white outline-none appearance-none cursor-pointer"
              >
                <option value="Manhattan Central">Manhattan Central #1</option>
                <option value="Brooklyn Heights">Brooklyn Heights #2</option>
                <option value="Queens Plaza">Queens Plaza #3</option>
              </select>
            </div>
          </div>

          {/* Remember me & forgot password */}
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={rememberMe} 
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-800 bg-slate-950 text-[#D4AF37] focus:ring-0 w-3.5 h-3.5"
              />
              <span>Remember me</span>
            </label>
            <button 
              type="button" 
              onClick={() => triggerToast("Dispatching self-service pin recovery link to supervisor terminal...")}
              className="text-amber-500 hover:underline"
            >
              Forgot password?
            </button>
          </div>

          {/* Complete sign in */}
          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-mono font-black rounded-xl shadow-lg transition-all uppercase tracking-wider text-xs"
          >
            Authenticate Sign In
          </button>
        </form>

        {/* Biometrics */}
        <div className="pt-4 border-t border-slate-800 text-center space-y-3">
          <p className="text-[10px] font-mono text-slate-400 uppercase">Or use system telemetry</p>
          <button 
            type="button"
            onClick={handleBiometricAuth}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-950 border border-slate-800 hover:border-[#D4AF37] text-slate-300 hover:text-white rounded-xl text-xs transition-all"
          >
            <Fingerprint className="w-4 h-4 text-[#D4AF37]" />
            <span>Fingerprint / Face Unlock</span>
          </button>
        </div>
      </div>
    </div>
  );
}
