import React from "react";
import { 
  CheckCircle, XCircle, HelpCircle, FileText, Gift, Percent, 
  Trash2, UserX, Clock, Calendar, ShieldCheck, ClipboardList
} from "lucide-react";

interface ApprovalItem {
  id: string;
  type: "Refund Request" | "Large Discount" | "Inventory Adjustment" | "Purchase Order" | "Employee Leave" | "Overtime";
  title: string;
  amount?: string;
  reason: string;
  submittedBy: string;
  time: string;
  notes?: string;
}

interface ApprovalsTabProps {
  onUpdatePendingCount?: (count: number) => void;
}

export default function ApprovalsTab({
  onUpdatePendingCount
}: ApprovalsTabProps) {
  
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // Local approvals queue state
  const [approvals, setApprovals] = React.useState<ApprovalItem[]>([
    { id: "AP-101", type: "Refund Request", title: "Customer Order #ORD-942 Refund", amount: "$42.50", reason: "Late cold delivery - guest complaint", submittedBy: "Arthur Dent (Courier)", time: "12 mins ago" },
    { id: "AP-102", type: "Large Discount", title: "VIP Client Corporate Lunch (30% discount)", amount: "$124.00", reason: "Special authorization code required", submittedBy: "Lucia Santos (Waiter)", time: "30 mins ago" },
    { id: "AP-103", type: "Inventory Adjustment", title: "Write-off: Spoiled Fresh Strawberries", amount: "12 lbs", reason: "Batch spoiled due to cooler temperature drop", submittedBy: "Chef Marcus", time: "1 hour ago" },
    { id: "AP-104", type: "Purchase Order", title: "Replenish Prime Beef Brisket (Sysco)", amount: "$850.00", reason: "Low stock critical trigger warning", submittedBy: "Chef Marcus", time: "2 hours ago" },
    { id: "AP-105", type: "Employee Leave", title: "Sofia Rossi: 1-Day Sick Leave request", reason: "Medical appointment verification attached", submittedBy: "Sofia Rossi", time: "4 hours ago" },
    { id: "AP-106", type: "Overtime", title: "Alexander Cook: 2.0hr shift extension", amount: "2.0 Hours", reason: "Delayed service rush coverage", submittedBy: "Alexander Cook", time: "5 hours ago" }
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  React.useEffect(() => {
    if (onUpdatePendingCount) {
      onUpdatePendingCount(approvals.length);
    }
  }, [approvals, onUpdatePendingCount]);

  const handleApprove = (id: string, name: string) => {
    setApprovals(prev => prev.filter(app => app.id !== id));
    showToast(`Approved Request ${id} ('${name}') successfully.`);
  };

  const handleReject = (id: string, name: string) => {
    setApprovals(prev => prev.filter(app => app.id !== id));
    showToast(`Rejected and dismissed Request ${id} ('${name}').`);
  };

  const handleMoreInfo = (id: string) => {
    showToast(`Information query dispatched to request submitter.`);
  };

  // Icon selector helper
  const getApprovalIcon = (type: ApprovalItem["type"]) => {
    switch (type) {
      case "Refund Request": return Gift;
      case "Large Discount": return Percent;
      case "Inventory Adjustment": return Trash2;
      case "Purchase Order": return ClipboardList;
      case "Employee Leave": return UserX;
      default: return Clock;
    }
  };

  const getTypeColor = (type: ApprovalItem["type"]) => {
    switch (type) {
      case "Refund Request": return "bg-rose-50 text-rose-700 border-rose-150";
      case "Large Discount": return "bg-[#D4AF37]/10 text-amber-800 border-amber-200";
      case "Inventory Adjustment": return "bg-slate-100 text-slate-700 border-slate-200";
      case "Purchase Order": return "bg-blue-50 text-blue-700 border-blue-200";
      case "Employee Leave": return "bg-purple-50 text-purple-700 border-purple-200";
      default: return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
  };

  return (
    <div className="space-y-6" id="manager-approvals-queue">
      
      {toastMessage && (
        <div className="fixed bottom-8 right-8 bg-slate-900 text-white text-xs font-mono py-3 px-5 rounded-xl shadow-2xl z-50 animate-fadeIn flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Stats row */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="font-serif font-black text-sm text-slate-800">Operational Authorization Center</h3>
          <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">Manager signature overrides queue</p>
        </div>

        <div className="flex bg-slate-50 border border-slate-150 p-2 rounded-xl text-xs font-mono font-bold text-slate-600">
          Pending Audits: {approvals.length} Requests Awaiting
        </div>
      </div>

      {/* Grid Queue List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {approvals.map((app) => {
          const IconComponent = getApprovalIcon(app.type);

          return (
            <div key={app.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition-all relative flex flex-col justify-between">
              
              <div className="space-y-3">
                {/* Header row */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2.5">
                    <div className={`p-2 rounded-lg ${getTypeColor(app.type)}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[9px] font-mono font-bold uppercase block text-slate-400">{app.type}</span>
                      <h4 className="font-serif font-black text-slate-800 text-sm mt-0.5">{app.title}</h4>
                    </div>
                  </div>

                  <span className="text-[9px] font-mono text-slate-400 uppercase">{app.time}</span>
                </div>

                {/* Amount Highlight */}
                {app.amount && (
                  <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 font-mono text-xs font-black text-slate-700 flex justify-between items-center">
                    <span>Authorized Value:</span>
                    <span className="text-[#2B6CB0] text-sm">{app.amount}</span>
                  </div>
                )}

                {/* Reason description */}
                <div className="text-xs text-slate-600 font-sans leading-relaxed bg-slate-50/30 p-3 rounded-xl border border-dashed border-slate-200">
                  <strong className="text-slate-400 block font-mono text-[9px] uppercase">Reason Statement</strong>
                  "{app.reason}"
                </div>

                <div className="text-[10px] text-slate-400 font-mono">
                  Submitted by: <strong className="text-slate-600">{app.submittedBy}</strong>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-50 mt-4 text-xs font-mono font-bold">
                
                <button
                  onClick={() => handleApprove(app.id, app.title)}
                  className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-center transition-colors shadow-sm flex items-center justify-center space-x-1"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Approve</span>
                </button>

                <button
                  onClick={() => handleReject(app.id, app.title)}
                  className="p-2 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 rounded-xl text-center transition-colors"
                >
                  Reject
                </button>

                <button
                  onClick={() => handleMoreInfo(app.id)}
                  className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 rounded-xl text-center transition-colors"
                >
                  Query Info
                </button>

                <button
                  onClick={() => {
                    const text = prompt("Add a corporate override note for this request:");
                    if (text) {
                      showToast(`Audit note appended successfully!`);
                    }
                  }}
                  className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 rounded-xl text-center transition-colors"
                >
                  + Add Note
                </button>

              </div>

            </div>
          );
        })}

        {approvals.length === 0 && (
          <div className="col-span-2 py-16 text-center text-slate-400 font-mono bg-white rounded-2xl border border-dashed border-slate-200">
            No pending operational approvals in queue.
          </div>
        )}
      </div>

    </div>
  );
}
