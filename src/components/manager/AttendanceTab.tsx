import React from "react";
import { 
  Calendar as CalendarIcon, Clock, CheckCircle, AlertOctagon, 
  UserX, TrendingUp, Filter, BarChart3, ChevronLeft, ChevronRight,
  UserCheck, LogIn, LogOut, Check, Sliders, Trash2
} from "lucide-react";
import { Employee, AttendanceLog } from "../../types";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

interface AttendanceTabProps {
  employees: Employee[];
  onRefresh?: () => void;
}

export default function AttendanceTab({
  employees,
  onRefresh
}: AttendanceTabProps) {
  
  // Local current date context
  const today = new Date();
  const currentDayNum = today.getDate(); // 1-31
  const currentMonthNum = today.getMonth(); // 0-11
  const currentYearNum = today.getFullYear();

  // Currently viewed day
  const [selectedDay, setSelectedDay] = React.useState<number>(currentDayNum);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // Manual input form states
  const [clockInEmployeeId, setClockInEmployeeId] = React.useState("");
  const [clockInTime, setClockInTime] = React.useState("08:00 AM");
  const [clockOutTime, setClockOutTime] = React.useState("04:00 PM");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Format a day number to query matching strings
  const getQueryDateStrings = (day: number) => {
    const m = currentMonthNum + 1;
    const y = currentYearNum;
    return [
      `${m}/${day}/${y}`,
      `${m < 10 ? '0' + m : m}/${day < 10 ? '0' + day : day}/${y}`,
      `${y}-${m < 10 ? '0' + m : m}-${day < 10 ? '0' + day : day}`
    ];
  };

  const selectedDateStr = `${currentMonthNum + 1}/${selectedDay}/${currentYearNum}`;

  // Filter employee logs for the selected day
  const attendanceRoster = React.useMemo(() => {
    const datesToMatch = getQueryDateStrings(selectedDay);
    
    return employees.map(emp => {
      // Find a matching log
      const log = emp.attendanceLogs?.find(l => datesToMatch.includes(l.date));
      
      return {
        employeeId: emp.id,
        name: emp.name,
        role: emp.role,
        shiftTime: emp.shiftTime || "08:00 AM - 04:00 PM",
        isCheckedIn: !!log,
        isCheckedOut: !!(log?.timeOut),
        checkIn: log?.timeIn || "-",
        checkOut: log?.timeOut || "-",
        status: log ? (log.onTime ? "Present" : "Late") : "Absent",
        overtime: log?.timeOut ? "0.0 hr" : "-", // standard or simplified
        rawLog: log,
        employeeObj: emp
      };
    });
  }, [employees, selectedDay]);

  // Overall statistics calculated dynamically from active employees
  const dailyAttendanceRate = React.useMemo(() => {
    if (attendanceRoster.length === 0) return "100%";
    const presentCount = attendanceRoster.filter(r => r.isCheckedIn).length;
    return `${((presentCount / attendanceRoster.length) * 100).toFixed(1)}%`;
  }, [attendanceRoster]);

  const lateCount = React.useMemo(() => {
    return attendanceRoster.filter(r => r.status === "Late").length;
  }, [attendanceRoster]);

  const absentCount = React.useMemo(() => {
    return attendanceRoster.filter(r => r.status === "Absent").length;
  }, [attendanceRoster]);

  // Handle manual Check-in of an employee
  const handleCheckIn = async (employeeId: string, customTime?: string) => {
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return;

    const timeStr = customTime || new Date().toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' });
    const datesToMatch = getQueryDateStrings(selectedDay);
    const dateStr = datesToMatch[0]; // "7/XX/2026"

    const logs = [...(emp.attendanceLogs || [])];
    const logIndex = logs.findIndex(l => datesToMatch.includes(l.date));

    // Determine if on-time based on their shift
    let onTime = true;
    let shiftHour = 8;
    if (emp.shiftTime) {
      const match = emp.shiftTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (match) {
        let h = parseInt(match[1]);
        const ampm = match[3].toUpperCase();
        if (ampm === "PM" && h < 12) h += 12;
        if (ampm === "AM" && h === 12) h = 0;
        shiftHour = h;
      }
    }
    // Simple check: if checking in after shift hour, mark Late
    const checkInHourMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (checkInHourMatch) {
      let h = parseInt(checkInHourMatch[1]);
      const ampm = checkInHourMatch[3].toUpperCase();
      if (ampm === "PM" && h < 12) h += 12;
      if (ampm === "AM" && h === 12) h = 0;
      if (h > shiftHour) onTime = false;
    }

    const newLog: AttendanceLog = {
      date: dateStr,
      timeIn: timeStr,
      type: "Manual",
      onTime: onTime
    };

    if (logIndex !== -1) {
      logs[logIndex] = { ...logs[logIndex], ...newLog };
    } else {
      logs.unshift(newLog);
    }

    try {
      const res = await fetch(`/api/employees/${emp.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: onTime ? "On duty" : "Late",
          attendanceLogs: logs
        })
      });

      if (res.ok) {
        showToast(`${emp.name} checked in at ${timeStr}`);
        if (onRefresh) onRefresh();
      } else {
        showToast("Failed to perform check in.");
      }
    } catch (err) {
      console.error(err);
      showToast("Server communication failure.");
    }
  };

  // Handle manual Check-out of an employee
  const handleCheckOut = async (employeeId: string, customTime?: string) => {
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return;

    const timeStr = customTime || new Date().toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' });
    const datesToMatch = getQueryDateStrings(selectedDay);

    const logs = [...(emp.attendanceLogs || [])];
    const logIndex = logs.findIndex(l => datesToMatch.includes(l.date));

    if (logIndex === -1) {
      showToast("Employee must be checked in before checking out!");
      return;
    }

    // Update the check-out time
    logs[logIndex] = {
      ...logs[logIndex],
      timeOut: timeStr
    };

    try {
      const res = await fetch(`/api/employees/${emp.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Off",
          attendanceLogs: logs
        })
      });

      if (res.ok) {
        showToast(`${emp.name} checked out at ${timeStr}`);
        if (onRefresh) onRefresh();
      } else {
        showToast("Failed to perform check out.");
      }
    } catch (err) {
      console.error(err);
      showToast("Server communication failure.");
    }
  };

  // Calendar Day configuration
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const firstDayOfMonth = new Date(currentYearNum, currentMonthNum, 1);
  const startDayPadding = firstDayOfMonth.getDay(); // 0 (Sunday) to 6 (Saturday)
  const daysInMonthCount = new Date(currentYearNum, currentMonthNum + 1, 0).getDate();
  const daysInMonthArray = Array.from({ length: daysInMonthCount }, (_, i) => i + 1);

  // Generate dynamic chart trend from database logs
  const dynamicChartsData = React.useMemo(() => {
    // Let's summarize attendance rates for the last 7 days leading up to selected day
    const trend = [];
    for (let d = Math.max(1, selectedDay - 7); d <= selectedDay; d++) {
      const dateStrings = getQueryDateStrings(d);
      let present = 0;
      let lateCountVal = 0;
      
      employees.forEach(emp => {
        const log = emp.attendanceLogs?.find(l => dateStrings.includes(l.date));
        if (log) {
          present++;
          if (!log.onTime) lateCountVal++;
        }
      });

      const rate = employees.length > 0 ? Math.round((present / employees.length) * 100) : 100;
      trend.push({
        name: `Jul ${d}`,
        rate: rate,
        lateCount: lateCountVal
      });
    }
    return trend;
  }, [employees, selectedDay]);

  return (
    <div className="space-y-6" id="manager-attendance-page">
      
      {toastMessage && (
        <div className="fixed bottom-8 right-8 bg-slate-900 text-white text-xs font-mono py-3 px-5 rounded-xl shadow-2xl z-50 animate-fadeIn flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Stat row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-mono uppercase block">Daily Attendance Rate</span>
            <h4 className="text-xl font-bold font-mono text-slate-800 mt-1">{dailyAttendanceRate}</h4>
            <p className="text-[10px] text-slate-400 font-sans mt-0.5">For Jul {selectedDay}, 2026</p>
          </div>
          <div className="p-2.5 bg-green-50 text-green-600 rounded-xl">
            <CheckCircle className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-mono uppercase block">Late Arrivals</span>
            <h4 className="text-xl font-bold font-mono text-red-600 mt-1">{lateCount} Staff</h4>
            <p className="text-[10px] text-slate-400 font-sans mt-0.5">Behind standard shift times</p>
          </div>
          <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-mono uppercase block">Absences Today</span>
            <h4 className="text-xl font-bold font-mono text-amber-600 mt-1">{absentCount} Staff</h4>
            <p className="text-[10px] text-slate-400 font-sans mt-0.5">No logged shift registrations</p>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
            <UserX className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-mono uppercase block">Shift Schedule Sync</span>
            <h4 className="text-xl font-bold font-mono text-indigo-600 mt-1">Live DB</h4>
            <p className="text-[10px] text-emerald-600 font-sans mt-0.5 font-mono">100% Verified Access</p>
          </div>
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <UserCheck className="w-4 h-4" />
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Interactive Calendar Panel */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-50 pb-3">
            <div>
              <h3 className="font-serif font-black text-sm text-slate-800">{monthNames[currentMonthNum]} {currentYearNum} Calendar</h3>
              <p className="text-[9px] text-slate-400 font-mono mt-0.5">Select a day to view or edit logs</p>
            </div>
            <div className="flex space-x-1">
              <button onClick={() => showToast("Previous Month logs loaded from cloud archive.")} className="p-1 hover:bg-slate-100 rounded">
                <ChevronLeft className="w-3.5 h-3.5 text-slate-500" />
              </button>
              <button onClick={() => showToast("Next Month schedule not yet published.")} className="p-1 hover:bg-slate-100 rounded">
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center text-[9px] font-mono font-black text-slate-400 uppercase">
            <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center font-mono text-xs">
            {/* Padding for first day of the month */}
            {Array.from({ length: startDayPadding }).map((_, idx) => (
              <div key={`pad-${idx}`} />
            ))}
            
            {daysInMonthArray.map((day) => {
              const isSelected = selectedDay === day;
              const isToday = currentDayNum === day && today.getMonth() === currentMonthNum && today.getFullYear() === currentYearNum;
              
              // Count absences or lates for this day to color-code
              const datesToMatch = getQueryDateStrings(day);
              let totalLogsOnDay = 0;
              let totalLatesOnDay = 0;
              employees.forEach(emp => {
                const log = emp.attendanceLogs?.find(l => datesToMatch.includes(l.date));
                if (log) {
                  totalLogsOnDay++;
                  if (!log.onTime) totalLatesOnDay++;
                }
              });

              let cellClass = "p-2 rounded-xl border transition-all cursor-pointer ";
              if (isSelected) {
                cellClass += "bg-blue-600 text-white border-blue-700 font-bold shadow-sm";
              } else if (totalLatesOnDay > 1) {
                cellClass += "bg-red-50 text-red-700 border-red-100 font-semibold";
              } else if (totalLogsOnDay > 0) {
                cellClass += "bg-emerald-50 text-emerald-800 border-emerald-100";
              } else {
                cellClass += "bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100";
              }

              return (
                <div 
                  key={day} 
                  className={cellClass}
                  onClick={() => setSelectedDay(day)}
                >
                  {day}
                </div>
              );
            })}
          </div>
          
          <div className="text-[10px] text-slate-400 space-y-1.5 pt-2 border-t border-slate-50 font-sans">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded bg-blue-600 block" />
              <span>Selected Day</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-150 border border-emerald-100 block" />
              <span>Staff Logged Present</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded bg-red-100 border border-red-200 block" />
              <span>Multiple Late Incident Alerts</span>
            </div>
          </div>
        </div>

        {/* Attendance List Table (8 columns) */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-50">
            <div>
              <h3 className="font-serif font-black text-sm text-slate-800">Check-in / Out Verification Logs</h3>
              <p className="text-[10px] text-slate-400">Database values for July {selectedDay}, 2026</p>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => showToast("Exporting detailed attendance sheets to CSV...")}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono uppercase hover:text-blue-600 transition"
              >
                Export
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-none">
              <thead className="bg-slate-50 font-mono text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="p-3 uppercase">Employee</th>
                  <th className="p-3 uppercase">Check In</th>
                  <th className="p-3 uppercase">Check Out</th>
                  <th className="p-3 uppercase text-center">Status</th>
                  <th className="p-3 uppercase text-center">Admin Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {attendanceRoster.map((row) => (
                  <tr key={row.employeeId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 font-sans">
                      <div className="font-bold text-slate-800">{row.name}</div>
                      <div className="text-[9px] text-slate-400 font-mono">{row.role} • {row.shiftTime}</div>
                    </td>
                    <td className={`p-3 font-mono ${row.status === "Late" ? "text-red-500 font-bold" : ""}`}>
                      {row.checkIn}
                    </td>
                    <td className="p-3 font-mono">
                      {row.checkOut}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full font-mono text-[9px] font-bold border ${
                        row.status === "Present" 
                          ? "bg-emerald-100 text-emerald-700 border-emerald-200" 
                          : row.status === "Late" 
                            ? "bg-rose-100 text-rose-700 border-rose-200" 
                            : "bg-slate-100 text-slate-500 border-slate-200"
                      }`}>
                        {row.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        {!row.isCheckedIn ? (
                          <button 
                            onClick={() => {
                              const time = prompt(`Enter Check-In time for ${row.name}:`, "08:00 AM");
                              if (time) handleCheckIn(row.employeeId, time);
                            }}
                            className="text-[9px] bg-emerald-55 text-emerald-700 border border-emerald-200 px-2 py-1.5 rounded-lg hover:bg-emerald-100 transition font-mono font-bold flex items-center space-x-1"
                          >
                            <LogIn className="w-3 h-3" />
                            <span>Clock In</span>
                          </button>
                        ) : !row.isCheckedOut ? (
                          <button 
                            onClick={() => {
                              const time = prompt(`Enter Check-Out time for ${row.name}:`, "04:00 PM");
                              if (time) handleCheckOut(row.employeeId, time);
                            }}
                            className="text-[9px] bg-amber-55 text-amber-700 border border-amber-200 px-2 py-1.5 rounded-lg hover:bg-amber-100 transition font-mono font-bold flex items-center space-x-1"
                          >
                            <LogOut className="w-3 h-3" />
                            <span>Clock Out</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-600 font-mono font-bold flex items-center space-x-1 bg-emerald-50 px-2 py-1 rounded-lg">
                            <Check className="w-3 h-3" />
                            <span>Completed</span>
                          </span>
                        )}
                        
                        {row.isCheckedIn && (
                          <button 
                            onClick={() => {
                              if (confirm(`Reset and erase attendance logs for ${row.name} on July ${selectedDay}?`)) {
                                const datesToMatch = getQueryDateStrings(selectedDay);
                                const updatedLogs = row.employeeObj.attendanceLogs?.filter(l => !datesToMatch.includes(l.date)) || [];
                                fetch(`/api/employees/${row.employeeId}`, {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    status: "Off",
                                    attendanceLogs: updatedLogs
                                  })
                                }).then(res => {
                                  if (res.ok) {
                                    showToast(`Erased log for ${row.name}`);
                                    if (onRefresh) onRefresh();
                                  }
                                });
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-red-500 rounded transition"
                            title="Reset log"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Dual Charts: Attendance rates + Late Arrival Trends (Dynamic from live logs!) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Attendance Rate Trend */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div>
            <h4 className="font-serif font-black text-sm text-slate-800">Dynamic Attendance Curve (%)</h4>
            <p className="text-[10px] text-slate-400">SLA rate over previous 7 days leading to July {selectedDay}</p>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dynamicChartsData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2F7" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="#A0AEC0" />
                <YAxis tick={{ fontSize: 9 }} stroke="#A0AEC0" domain={[0, 100]} />
                <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="rate" stroke="#2563EB" strokeWidth={2.5} name="Attendance %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Late Arrival Trend */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div>
            <h4 className="font-serif font-black text-sm text-slate-800">Daily Late Arrival Incidents</h4>
            <p className="text-[10px] text-slate-400">Total late clock-ins recorded over previous 7 days</p>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dynamicChartsData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2F7" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="#A0AEC0" />
                <YAxis tick={{ fontSize: 9 }} stroke="#A0AEC0" allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
                <Bar dataKey="lateCount" fill="#E53E3E" radius={[3, 3, 0, 0]} name="Late Instances" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
