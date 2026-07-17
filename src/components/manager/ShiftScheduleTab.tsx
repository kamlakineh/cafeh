import React from "react";
import { 
  Calendar, Clock, CheckSquare, AlertTriangle, Printer, 
  Send, Sparkles, UserPlus, Info, Check, ShieldAlert, CheckCircle2
} from "lucide-react";
import { Employee } from "../../types";

interface ShiftScheduleTabProps {
  employees: Employee[];
}

interface ShiftItem {
  id: string;
  day: string;
  slot: "Morning (8am-4pm)" | "Evening (4pm-12am)";
  employeeId: string;
  dept: "Kitchen" | "Service" | "Cashier" | "Delivery";
}

export default function ShiftScheduleTab({
  employees
}: ShiftScheduleTabProps) {
  
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const [selectedShift, setSelectedShift] = React.useState<ShiftItem | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = React.useState(false);
  
  // Local shifts state
  const [shifts, setShifts] = React.useState<ShiftItem[]>([
    { id: "S1", day: "Monday", slot: "Morning (8am-4pm)", employeeId: "E1", dept: "Kitchen" },
    { id: "S2", day: "Monday", slot: "Evening (4pm-12am)", employeeId: "E3", dept: "Service" },
    { id: "S3", day: "Tuesday", slot: "Morning (8am-4pm)", employeeId: "E4", dept: "Cashier" },
    { id: "S4", day: "Tuesday", slot: "Evening (4pm-12am)", employeeId: "E2", dept: "Kitchen" },
    { id: "S5", day: "Wednesday", slot: "Morning (8am-4pm)", employeeId: "E1", dept: "Kitchen" }, // Double booking case to demo conflict
    { id: "S6", day: "Wednesday", slot: "Morning (8am-4pm)", employeeId: "E3", dept: "Service" },
    { id: "S7", day: "Thursday", slot: "Morning (8am-4pm)", employeeId: "E4", dept: "Cashier" },
    { id: "S8", day: "Friday", slot: "Evening (4pm-12am)", employeeId: "E5", dept: "Delivery" }
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const shiftSlots = ["Morning (8am-4pm)", "Evening (4pm-12am)"] as const;

  // Department colors mapping
  const getDeptColor = (dept: string) => {
    switch (dept) {
      case "Kitchen": return "bg-red-50 text-red-700 border-red-200 hover:bg-red-100";
      case "Service": return "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100";
      case "Cashier": return "bg-green-50 text-green-700 border-green-200 hover:bg-green-100";
      default: return "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100";
    }
  };

  // Helper: check if employee has conflict (double-booked on same day in same slot or multiple shifts in a single day)
  const getConflicts = () => {
    const conflicts: { [shiftId: string]: string } = {};
    
    shifts.forEach((s) => {
      // Find other shifts on same day assigned to same employee
      const doubleBooked = shifts.filter(other => other.id !== s.id && other.day === s.day && other.employeeId === s.employeeId);
      if (doubleBooked.length > 0) {
        conflicts[s.id] = `Warning: ${employees.find(e => e.id === s.employeeId)?.name || "Employee"} is double-booked on ${s.day}!`;
      }
    });

    return conflicts;
  };

  const conflicts = getConflicts();

  // Create or Update shift assignment
  const handleAssignClick = (day: string, slot: typeof shiftSlots[number]) => {
    // Find if a shift already exists for this slot & day
    const existing = shifts.find(s => s.day === day && s.slot === slot);
    if (existing) {
      setSelectedShift(existing);
    } else {
      setSelectedShift({
        id: "S_" + Date.now(),
        day,
        slot,
        employeeId: "",
        dept: "Kitchen"
      });
    }
    setIsAssignModalOpen(true);
  };

  const saveShift = (empId: string, dept: "Kitchen" | "Service" | "Cashier" | "Delivery") => {
    if (!selectedShift) return;
    const updated = { ...selectedShift, employeeId: empId, dept };
    
    // If it's a new shift, append. Else, replace.
    const exists = shifts.some(s => s.id === selectedShift.id);
    if (exists) {
      setShifts(shifts.map(s => s.id === selectedShift.id ? updated : s));
      showToast("Shift updated successfully!");
    } else {
      setShifts([...shifts, updated]);
      showToast("New shift assigned!");
    }
    setIsAssignModalOpen(false);
    setSelectedShift(null);
  };

  const deleteShift = (id: string) => {
    setShifts(shifts.filter(s => s.id !== id));
    showToast("Shift assignment deleted.");
    setIsAssignModalOpen(false);
    setSelectedShift(null);
  };

  return (
    <div className="space-y-6" id="manager-shift-scheduler">
      
      {toastMessage && (
        <div className="fixed bottom-8 right-8 bg-slate-900 text-white text-xs font-mono py-3 px-5 rounded-xl shadow-2xl z-50 animate-fadeIn flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Control Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="font-serif font-black text-sm text-slate-800">Weekly Shift Planner</h3>
          <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">July 13 - July 19, 2026</p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <button
            onClick={() => showToast("Weekly shift schedule successfully published to employee app feeds!")}
            className="px-3.5 py-1.5 bg-[#2B6CB0] text-white rounded-xl font-bold flex items-center hover:bg-blue-700 transition-all shadow-sm"
          >
            <Send className="w-3.5 h-3.5 mr-1" />
            <span>Publish Schedule</span>
          </button>
          
          <button
            onClick={() => showToast("Sending push notifications to all employees...")}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl hover:text-blue-600 hover:border-blue-500 transition-all"
          >
            Notify Staff
          </button>

          <button
            onClick={() => showToast("Opening Print layout dialog...")}
            className="p-1.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl hover:text-[#2B6CB0] transition-all"
            title="Print Schedule"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Roster Conflict Alerts (if any) */}
      {Object.keys(conflicts).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 animate-pulse flex items-start space-x-3 text-xs text-red-800">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold">SLA Conflict Alert Detected</h4>
            <div className="mt-1 space-y-1">
              {Object.values(conflicts).map((msg, idx) => (
                <p key={idx}>{msg}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Calendar Shift Table Grid */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-none table-fixed min-w-[800px]">
            <thead className="bg-slate-50 font-mono text-slate-400 border-b border-slate-100">
              <tr>
                <th className="p-4 uppercase w-32">Shift Slot</th>
                {daysOfWeek.map((day) => (
                  <th key={day} className="p-4 uppercase text-center font-bold">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600 font-sans">
              {shiftSlots.map((slot) => (
                <tr key={slot} className="hover:bg-slate-50/20 transition-colors">
                  
                  {/* Slot Label header */}
                  <td className="p-4 font-mono font-bold text-slate-800 border-r border-slate-100 align-middle">
                    <span className="block font-black text-xs text-slate-900">{slot.split(" ")[0]}</span>
                    <span className="text-[9px] text-slate-400 font-normal">{slot.split(" ")[1]}</span>
                  </td>

                  {/* Days */}
                  {daysOfWeek.map((day) => {
                    const shiftList = shifts.filter(s => s.day === day && s.slot === slot);

                    return (
                      <td 
                        key={day} 
                        onClick={() => handleAssignClick(day, slot)}
                        className="p-3 border-r border-slate-100 text-center cursor-pointer hover:bg-slate-50 relative min-h-[100px]"
                      >
                        <div className="space-y-2">
                          {shiftList.map((s) => {
                            const emp = employees.find(e => e.id === s.employeeId);
                            const hasConflict = !!conflicts[s.id];

                            return (
                              <div 
                                key={s.id} 
                                className={`p-2.5 rounded-xl border text-left text-[11px] font-medium leading-tight relative shadow-sm transition-all ${getDeptColor(s.dept)} ${hasConflict ? "ring-2 ring-red-500 animate-pulse" : ""}`}
                              >
                                <div className="flex justify-between items-start">
                                  <span className="font-bold truncate">{emp?.name || "Vacant Slot"}</span>
                                  {hasConflict && (
                                    <AlertTriangle className="w-3 h-3 text-red-600 animate-bounce" />
                                  )}
                                </div>
                                <span className="block text-[8px] opacity-80 uppercase font-mono mt-0.5 tracking-wider">{s.dept}</span>
                              </div>
                            );
                          })}
                          
                          {shiftList.length === 0 && (
                            <div className="text-[10px] text-slate-300 font-mono border-dashed border border-slate-200 py-3 rounded-xl flex flex-col items-center justify-center">
                              <UserPlus className="w-3.5 h-3.5 mb-1 text-slate-300" />
                              <span>Assign Slot</span>
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Shift Modal */}
      {isAssignModalOpen && selectedShift && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-100 max-w-sm w-full p-6 shadow-2xl animate-scaleUp space-y-4">
            
            <div>
              <h4 className="font-serif font-black text-slate-800 text-base">Assign Weekly Shift</h4>
              <p className="text-xs text-slate-400 font-mono uppercase mt-0.5">{selectedShift.day} • {selectedShift.slot}</p>
            </div>

            <div className="space-y-4 text-xs font-sans">
              
              <div className="space-y-1">
                <label className="block text-slate-500 font-medium">Select Staff Member</label>
                <select
                  id="shift-employee-select"
                  defaultValue={selectedShift.employeeId}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                >
                  <option value="">-- Choose Employee --</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-500 font-medium">Department</label>
                <select
                  id="shift-dept-select"
                  defaultValue={selectedShift.dept}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                >
                  <option value="Kitchen">Kitchen</option>
                  <option value="Service">Service</option>
                  <option value="Cashier">Cashier</option>
                  <option value="Delivery">Delivery</option>
                </select>
              </div>

            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              {shifts.some(s => s.id === selectedShift.id) ? (
                <button
                  onClick={() => deleteShift(selectedShift.id)}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 rounded-xl text-xs font-mono"
                >
                  Delete
                </button>
              ) : <div />}

              <div className="flex space-x-2">
                <button
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-xl text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const empId = (document.getElementById("shift-employee-select") as HTMLSelectElement).value;
                    const dept = (document.getElementById("shift-dept-select") as HTMLSelectElement).value as any;
                    saveShift(empId, dept);
                  }}
                  className="px-4 py-1.5 bg-[#2B6CB0] text-white hover:bg-[#1D4ED8] rounded-xl text-xs font-mono font-bold"
                >
                  Save Assignment
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
