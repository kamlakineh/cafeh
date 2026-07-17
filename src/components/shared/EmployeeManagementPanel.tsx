import React from "react";
import { 
  Users, UserCheck, ShieldAlert, Key, Trash2, Shield, 
  ToggleLeft, ToggleRight, Plus, RefreshCw, Clock, Star, X, CheckSquare, Sparkles 
} from "lucide-react";
import { Employee } from "../../types";

interface EmployeeManagementPanelProps {
  currentUserRole: "Manager" | "Owner";
}

export default function EmployeeManagementPanel({
  currentUserRole
}: EmployeeManagementPanelProps) {
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // Form States for adding new employee
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [name, setName] = React.useState("");
  const [role, setRole] = React.useState("Senior Waiter");
  const [pin, setPin] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [shiftTime, setShiftTime] = React.useState("08:00 AM - 04:00 PM");

  // Selection state for viewing logs
  const [selectedEmp, setSelectedEmp] = React.useState<Employee | null>(null);

  // Reset PIN/Password modal
  const [resettingEmp, setResettingEmp] = React.useState<Employee | null>(null);
  const [newPin, setNewPin] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/employees");
      if (res.ok) {
        const data = await res.json();
        setEmployees(data);
      }
    } catch (err) {
      console.error("Error fetching employees:", err);
      showToast("Failed to fetch employee roster.");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchEmployees();
  }, []);

  // Check if current user has permission to manage a specific employee
  const canManage = (emp: Employee) => {
    if (currentUserRole === "Owner") {
      return true; // Owner can manage everyone including Manager
    }
    // Manager can manage everyone except General Manager / Owner
    const isTargetManager = emp.role.toLowerCase().includes("manager") || emp.role.toLowerCase().includes("owner") || emp.id === "EMP-100";
    return !isTargetManager;
  };

  // Add Employee
  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Please enter a name.");
      return;
    }
    if (pin.length < 4) {
      showToast("PIN must be 4 digits.");
      return;
    }

    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, role, pin, password, shiftTime })
      });

      if (res.ok) {
        showToast(`Registered ${name} as ${role} successfully!`);
        setName("");
        setRole("Senior Waiter");
        setPin("");
        setPassword("");
        setShowAddForm(false);
        fetchEmployees();
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to add employee.");
      }
    } catch (err) {
      showToast("Network error. Could not add employee.");
    }
  };

  // Delete Employee
  const handleDeleteEmployee = async (id: string, empName: string) => {
    if (!confirm(`Are you sure you want to permanently delete ${empName}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        showToast(`Employee ${empName} has been deleted.`);
        if (selectedEmp?.id === id) setSelectedEmp(null);
        fetchEmployees();
      } else {
        showToast("Failed to delete employee.");
      }
    } catch (err) {
      showToast("Network error. Could not delete employee.");
    }
  };

  // Toggle access control
  const handleToggleAccess = async (emp: Employee) => {
    const currentStatus = emp.isAccessEnabled !== false;
    const nextStatus = !currentStatus;

    try {
      const res = await fetch(`/api/employees/${emp.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAccessEnabled: nextStatus })
      });

      if (res.ok) {
        showToast(`Access for ${emp.name} is now ${nextStatus ? "ENABLED" : "DISABLED"}`);
        fetchEmployees();
        // Update selected employee details if active
        if (selectedEmp?.id === emp.id) {
          setSelectedEmp({ ...emp, isAccessEnabled: nextStatus });
        }
      } else {
        showToast("Failed to update access control.");
      }
    } catch (err) {
      showToast("Error updating access state.");
    }
  };

  // Reset Password & PIN
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingEmp) return;

    if (newPin && newPin.length < 4) {
      showToast("New PIN must be at least 4 digits.");
      return;
    }

    try {
      const payload: any = {};
      if (newPin) payload.pin = newPin;
      if (newPassword) payload.password = newPassword;

      const res = await fetch(`/api/employees/${resettingEmp.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast(`Credentials reset successfully for ${resettingEmp.name}!`);
        setNewPin("");
        setNewPassword("");
        setResettingEmp(null);
        fetchEmployees();
      } else {
        showToast("Failed to update credentials.");
      }
    } catch (err) {
      showToast("Network error during credentials reset.");
    }
  };

  return (
    <div className="space-y-6" id="shared-employee-management">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 bg-slate-900 text-white text-xs font-mono py-3 px-5 rounded-xl shadow-2xl z-50 animate-fadeIn flex items-center space-x-2 border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Title & Actions Row */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-serif text-lg font-black text-slate-800 flex items-center space-x-2">
            <Users className="w-5 h-5 text-[#2B6CB0]" />
            <span>Operational Roster ({employees.length} Active Staff)</span>
          </h2>
          <p className="text-[10px] text-slate-400 font-mono uppercase mt-1">
            Access Control, PIN Management, and Automatic Attendance Logs
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => fetchEmployees()}
            className="p-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl transition-all"
            title="Refresh Roster"
          >
            <RefreshCw className="w-4 h-4 text-slate-600" />
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-[#2B6CB0] text-white hover:bg-[#1D4ED8] rounded-xl text-xs font-mono font-bold transition-all shadow-sm flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Register Employee</span>
          </button>
        </div>
      </div>

      {/* Add Employee Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-slate-200 shadow-sm animate-fadeIn">
          <div className="flex justify-between items-center mb-4 border-b border-slate-50 pb-3">
            <h3 className="font-serif font-black text-sm text-slate-800 uppercase tracking-wide">
              New Employee Registration Ledger
            </h3>
            <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleAddEmployee} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-mono font-bold text-slate-400">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Thomas Shelby"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#2B6CB0]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-mono font-bold text-slate-400">Assigned Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#2B6CB0]"
              >
                {currentUserRole === "Owner" && (
                  <option value="General Manager">General Manager (GM)</option>
                )}
                <option value="Executive Chef">Executive Chef</option>
                <option value="Grill Specialist">Grill Specialist</option>
                <option value="Fry Specialist">Fry Specialist</option>
                <option value="Senior Waiter">Senior Waiter</option>
                <option value="Junior Waiter">Junior Waiter</option>
                <option value="Receptionist">Receptionist</option>
                <option value="Delivery Rider">Delivery Rider</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-mono font-bold text-slate-400">Shift Schedule</label>
              <input
                type="text"
                required
                value={shiftTime}
                onChange={(e) => setShiftTime(e.target.value)}
                placeholder="e.g. 08:00 AM - 04:00 PM"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#2B6CB0] font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-mono font-bold text-slate-400">Security PIN (4-Digits)</label>
              <input
                type="text"
                required
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                placeholder="e.g. 1234"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#2B6CB0] font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-mono font-bold text-slate-400">Web Portal Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#2B6CB0] font-mono"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2.5 bg-[#2B6CB0] hover:bg-[#1D4ED8] text-white font-mono font-bold text-xs uppercase rounded-xl shadow transition-all"
              >
                Confirm Register
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Split Layout: Roster Table & Selected Employee Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Employee Table */}
        <div className={`${selectedEmp ? "lg:col-span-7" : "lg:col-span-12"} bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-none">
              <thead className="bg-slate-50 font-mono text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="p-3 uppercase">Employee</th>
                  <th className="p-3 uppercase">Role & Schedule</th>
                  <th className="p-3 uppercase text-center">Status</th>
                  <th className="p-3 uppercase text-center">Access</th>
                  <th className="p-3 uppercase text-right">Rating</th>
                  <th className="p-3 uppercase text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {employees.map((emp) => {
                  const hasAccess = emp.isAccessEnabled !== false;
                  const canAct = canManage(emp);

                  return (
                    <tr 
                      key={emp.id} 
                      className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${selectedEmp?.id === emp.id ? "bg-slate-50" : ""}`}
                      onClick={() => setSelectedEmp(emp)}
                    >
                      <td className="p-3">
                        <div>
                          <span className="font-sans font-bold text-slate-800 text-sm block">{emp.name}</span>
                          <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">{emp.id}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="space-y-0.5">
                          <span className="font-mono text-[10px] uppercase font-bold text-indigo-600">{emp.role}</span>
                          <span className="text-[9px] text-slate-400 block font-mono">{emp.shiftTime || "08:00 AM - 04:00 PM"}</span>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold ${
                          emp.status === "On duty" ? "bg-green-100 text-green-700" :
                          emp.status === "Late" ? "bg-red-100 text-red-700 animate-pulse" :
                          emp.status === "Break" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"
                        }`}>
                          {emp.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          disabled={!canAct}
                          onClick={() => handleToggleAccess(emp)}
                          className={`p-1.5 rounded-lg transition-all ${
                            !canAct ? "opacity-30 cursor-not-allowed" : ""
                          }`}
                          title={hasAccess ? "Disable System Login" : "Enable System Login"}
                        >
                          {hasAccess ? (
                            <ToggleRight className="w-6 h-6 text-green-600 hover:text-green-700" />
                          ) : (
                            <ToggleLeft className="w-6 h-6 text-slate-300 hover:text-slate-400" />
                          )}
                        </button>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-[#2B6CB0]">
                        <div className="flex items-center justify-end space-x-1">
                          <Star className="w-3 h-3 text-amber-500 fill-current" />
                          <span>{emp.performance}%</span>
                        </div>
                      </td>
                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            disabled={!canAct}
                            onClick={() => {
                              setResettingEmp(emp);
                              setNewPin(emp.pin || "");
                              setNewPassword(emp.password || "");
                            }}
                            className={`p-1.5 text-slate-500 hover:text-[#2B6CB0] rounded hover:bg-slate-50 border border-slate-200 transition-all ${
                              !canAct ? "opacity-30 cursor-not-allowed" : ""
                            }`}
                            title="Reset Credentials"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>
                          <button
                            disabled={!canAct}
                            onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                            className={`p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 border border-slate-200 transition-all ${
                              !canAct ? "opacity-30 cursor-not-allowed" : ""
                            }`}
                            title="Delete Employee"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Employee Details Panel & Attendance Logs */}
        {selectedEmp && (
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-5 animate-slideIn">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-serif text-sm font-bold text-slate-800">Operational Log Card</h3>
                <p className="text-[10px] text-slate-400 font-mono">Detailed performance metrics</p>
              </div>
              <button onClick={() => setSelectedEmp(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Detail Header */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white rounded-full border border-slate-200 flex items-center justify-center text-[#2B6CB0] font-serif font-black text-base shadow-sm">
                  {selectedEmp.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <h4 className="font-serif font-black text-sm text-slate-800">{selectedEmp.name}</h4>
                  <p className="text-[10px] font-mono uppercase tracking-wide text-indigo-600 mt-0.5">
                    {selectedEmp.role} • {selectedEmp.id}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono border-t border-slate-200/60 pt-2.5">
                <div>
                  <span className="text-slate-400 block uppercase">Default PIN</span>
                  <span className="font-bold text-slate-700 bg-white border border-slate-200 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                    {selectedEmp.pin || "Not set"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase">Portal Password</span>
                  <span className="font-bold text-slate-700 bg-white border border-slate-200 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                    {selectedEmp.password ? "••••••••" : "Not set"}
                  </span>
                </div>
              </div>
            </div>

            {/* Attendance Curve & Punctuality Scoring */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-serif text-xs font-bold text-slate-800 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Attendance History</span>
                </h4>
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">
                  Automatic Tracker Active
                </span>
              </div>

              {/* Recalculated Score Details */}
              <div className="bg-[#2B6CB0]/5 border border-[#2B6CB0]/10 p-3 rounded-xl flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono font-bold text-[#2B6CB0] uppercase">Performance Impact</span>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Live clock-in times directly scale the score dynamically.
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-black text-lg text-[#2B6CB0]">{selectedEmp.performance}%</span>
                  <span className="text-[9px] block text-slate-400 font-mono">Rating</span>
                </div>
              </div>

              {/* Logs List */}
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {!selectedEmp.attendanceLogs || selectedEmp.attendanceLogs.length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-slate-100 rounded-xl text-slate-400 text-[10px] font-mono uppercase">
                    No registered attendance logs yet.
                  </div>
                ) : (
                  selectedEmp.attendanceLogs.map((log, idx) => (
                    <div 
                      key={idx} 
                      className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center hover:bg-slate-50 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold font-mono text-slate-700 block">{log.date}</span>
                        <span className="text-[9px] font-sans text-slate-400 block">Type: {log.type} tracker</span>
                      </div>
                      <div className="text-right space-y-1">
                        <span className="text-xs font-mono font-bold text-slate-700 block">{log.timeIn}</span>
                        <span className={`px-2 py-0.5 rounded font-mono text-[8px] font-bold ${
                          log.onTime !== false ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700 animate-pulse"
                        }`}>
                          {log.onTime !== false ? "ON TIME" : "LATE (+15m)"}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reset PIN / Password Modal */}
      {resettingEmp && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-100 shadow-2xl space-y-4 animate-slideUp">
            <div className="flex justify-between items-center border-b border-slate-50 pb-2">
              <div className="flex items-center space-x-1.5 text-[#2B6CB0]">
                <Key className="w-4 h-4" />
                <h3 className="font-serif font-black text-sm text-slate-800 uppercase">
                  Reset Staff Credentials
                </h3>
              </div>
              <button onClick={() => setResettingEmp(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Updating authentication codes for <strong>{resettingEmp.name}</strong>. Provide a new 4-digit PIN for device clock-in and/or a portal password.
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-[9px] uppercase font-mono font-bold text-slate-400">New 4-Digit Device PIN</label>
                <input
                  type="text"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g. 5678"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#2B6CB0] font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] uppercase font-mono font-bold text-slate-400">New Portal Password</label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new strong password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#2B6CB0] font-mono"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResettingEmp(null)}
                  className="w-1/2 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-mono font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 bg-[#2B6CB0] hover:bg-[#1D4ED8] text-white font-mono font-bold rounded-xl shadow"
                >
                  Save Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
