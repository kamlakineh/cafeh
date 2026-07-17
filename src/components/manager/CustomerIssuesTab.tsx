import React from "react";
import { 
  AlertTriangle, CheckSquare, MessageCircle, RefreshCw, Star, 
  Trash2, UserPlus, Phone, Gift, ArrowUpRight, Flame
} from "lucide-react";
import { CustomerIssue, Employee } from "../../types";

interface CustomerIssuesTabProps {
  issues: CustomerIssue[];
  employees: Employee[];
  onUpdateIssueStatus?: (id: string, status: CustomerIssue["status"], extra?: Partial<CustomerIssue>) => void;
}

export default function CustomerIssuesTab({
  issues,
  employees,
  onUpdateIssueStatus
}: CustomerIssuesTabProps) {
  
  const [activeTab, setActiveTab] = React.useState<CustomerIssue["status"]>("Pending");
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // Fallback state if parent does not have updates
  const [localIssues, setLocalIssues] = React.useState<CustomerIssue[]>(issues);

  React.useEffect(() => {
    setLocalIssues(issues);
  }, [issues]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUpdate = (id: string, nextStatus: CustomerIssue["status"], extra?: Partial<CustomerIssue>) => {
    if (onUpdateIssueStatus) {
      onUpdateIssueStatus(id, nextStatus, extra);
    } else {
      setLocalIssues(prev => prev.map(issue => issue.id === id ? { ...issue, status: nextStatus, ...extra } : issue));
    }
  };

  const handleResolve = (id: string) => {
    handleUpdate(id, "Resolved");
    showToast(`Ticket ${id} resolved successfully.`);
  };

  const handleEscalate = (id: string) => {
    handleUpdate(id, "In Progress", { priority: 5 });
    showToast(`Ticket ${id} has been escalated to Critical Priority!`);
  };

  const handleIssueRefund = (id: string, name: string) => {
    handleUpdate(id, "Resolved", { message: "Refund processed in cashier terminal." });
    showToast(`Refund of $42.50 processed for ${name}!`);
  };

  const handleAssign = (id: string, empName: string) => {
    handleUpdate(id, "In Progress", { assignedTo: empName });
    showToast(`Assigned ${empName} to Ticket ${id}`);
  };

  const filtered = localIssues.filter(iss => iss.status === activeTab);

  // Color mapping by issue category
  const getTypeColor = (type: CustomerIssue["type"]) => {
    switch (type) {
      case "Wrong Order": return "bg-red-50 text-red-700 border-red-200";
      case "Late Delivery": return "bg-amber-50 text-amber-700 border-amber-200";
      case "Refund Request": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Food Quality": return "bg-orange-50 text-orange-700 border-orange-200";
      default: return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  return (
    <div className="space-y-6" id="manager-customer-tickets">
      
      {toastMessage && (
        <div className="fixed bottom-8 right-8 bg-slate-900 text-white text-xs font-mono py-3 px-5 rounded-xl shadow-2xl z-50 animate-fadeIn flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Stats and Navigation Tabs */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        
        <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
          {(["Pending", "In Progress", "Resolved"] as CustomerIssue["status"][]).map((tab) => {
            const count = localIssues.filter(i => i.status === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all uppercase flex items-center space-x-1.5 ${
                  activeTab === tab 
                    ? "bg-[#2B6CB0] text-white shadow-sm" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <span>{tab}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                  activeTab === tab ? "bg-white text-blue-800" : "bg-slate-200 text-slate-600"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <button 
          onClick={() => showToast("Database ticket cache updated with live server sync.")}
          className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono flex items-center space-x-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync Inbox</span>
        </button>

      </div>

      {/* Grid List of Tickets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((ticket) => (
          <div key={ticket.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4 hover:shadow-md transition-all relative">
            
            {/* Header: Name, Type, Time */}
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${getTypeColor(ticket.type)}`}>
                  {ticket.type}
                </span>
                <h4 className="font-serif font-black text-slate-800 text-sm mt-1">{ticket.customerName}</h4>
                <p className="text-[10px] text-slate-400 font-mono">Ticket Ref: {ticket.id} • Acknowledged: {ticket.time}</p>
              </div>

              {/* Priority Stars indicator */}
              <div className="flex items-center space-x-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-3.5 h-3.5 ${i < ticket.priority ? "text-amber-500 fill-current" : "text-slate-200"}`} 
                  />
                ))}
                {ticket.priority >= 4 && (
                  <Flame className="w-4 h-4 text-rose-500 ml-1 animate-bounce" />
                )}
              </div>
            </div>

            {/* Description message */}
            <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-600 leading-relaxed font-sans border border-slate-100">
              "{ticket.message}"
            </div>

            {/* Assigned Staff */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono">Assigned Pager:</span>
              <div className="flex items-center space-x-2">
                <select
                  value={ticket.assignedTo || ""}
                  onChange={(e) => handleAssign(ticket.id, e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg text-xs p-1 outline-none font-sans"
                >
                  <option value="">-- Unassigned --</option>
                  {employees.filter(e => e.status === "On duty").map(emp => (
                    <option key={emp.id} value={emp.name}>{emp.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons list */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-50">
              
              <button
                onClick={() => handleResolve(ticket.id)}
                className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-mono text-[10px] font-bold rounded-xl transition-all text-center border border-emerald-100"
              >
                Resolve
              </button>

              <button
                onClick={() => handleEscalate(ticket.id)}
                className="p-2 bg-red-50 hover:bg-red-100 text-red-700 font-mono text-[10px] font-bold rounded-xl transition-all text-center border border-red-100"
              >
                Escalate
              </button>

              <button
                onClick={() => handleIssueRefund(ticket.id, ticket.customerName)}
                className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-mono text-[10px] font-bold rounded-xl transition-all text-center border border-slate-200 flex items-center justify-center space-x-1"
              >
                <Gift className="w-3.5 h-3.5" />
                <span>Refund</span>
              </button>

              <button
                onClick={() => showToast(`Initiating VoIP call with ${ticket.customerName} on corporate SIP line...`)}
                className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-mono text-[10px] font-bold rounded-xl transition-all text-center border border-blue-100 flex items-center justify-center space-x-1"
              >
                <Phone className="w-3 h-3" />
                <span>Contact</span>
              </button>

            </div>

          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-2 py-16 text-center text-slate-400 font-mono bg-white rounded-2xl border border-dashed border-slate-200">
            All client tickets are resolved.
          </div>
        )}
      </div>

    </div>
  );
}
