import React from "react";
import { 
  ShieldAlert, RefreshCcw, DollarSign, HelpCircle, Sparkles, Check, 
  Trash2, Search, ArrowRight, UserCheck, Key, X
} from "lucide-react";

interface RefundsTabProps {
  onTriggerToast: (msg: string) => void;
}

export default function RefundsTab({
  onTriggerToast
}: RefundsTabProps) {
  
  const [receiptId, setReceiptId] = React.useState("");
  const [refundReason, setRefundReason] = React.useState("Order error");
  const [refundAmount, setRefundAmount] = React.useState<number>(24.99);
  const [showPasscodeModal, setShowPasscodeModal] = React.useState(false);
  const [passcode, setPasscode] = React.useState("");

  const handleTriggerRefund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptId) {
      onTriggerToast("Receipt reference ID is required!");
      return;
    }
    // High level refund triggers Manager Approval
    setShowPasscodeModal(true);
  };

  const handleConfirmPasscode = () => {
    if (passcode === "1234" || passcode === "8888") {
      onTriggerToast(`Refund authorization granted. Processed return of $${refundAmount.toFixed(2)} on ${receiptId}!`);
      setShowPasscodeModal(false);
      setPasscode("");
      setReceiptId("");
    } else {
      onTriggerToast("Invalid manager override passcode! Authorization denied.");
    }
  };

  return (
    <div className="max-w-xl mx-auto" id="refunds-operational-dashboard">
      
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
        
        {/* Header */}
        <div className="border-b border-slate-50 pb-4 text-center">
          <div className="inline-block p-3 bg-rose-50 text-rose-600 rounded-full border border-rose-100 mb-2">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="font-serif font-black text-slate-800 text-sm">Manager Authorized Refund Registry</h3>
          <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">Void settlements, return payments or issue vouchers</p>
        </div>

        {/* Form */}
        <form onSubmit={handleTriggerRefund} className="space-y-4 text-xs">
          
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Settled Receipt ID</label>
            <input 
              type="text"
              placeholder="e.g. REC-942, REC-941..."
              value={receiptId}
              onChange={(e) => setReceiptId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Refund Amount ($)</label>
              <input 
                type="number"
                step="0.01"
                placeholder="24.99"
                value={refundAmount}
                onChange={(e) => setRefundAmount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Void Reason</label>
              <select
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none"
              >
                <option value="Order error">Order/Item error</option>
                <option value="Customer complaint">Quality customer complaint</option>
                <option value="Overcharge"> POS Overcharged error</option>
                <option value="Cancelled order">Guest changed mind/Cancelled</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-mono font-bold text-xs uppercase rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
          >
            <RefreshCcw className="w-4 h-4 animate-spin-slow" />
            <span>Process manager override refund</span>
          </button>

        </form>

      </div>

      {/* SECURE MANAGER PASSCODE OVERWRITE MODAL */}
      {showPasscodeModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 max-w-sm w-full text-center space-y-4 shadow-2xl animate-scaleUp">
            
            <div className="flex justify-between items-center border-b border-slate-50 pb-2">
              <span className="font-mono text-xs text-slate-400 uppercase">Operational Security Override</span>
              <button 
                onClick={() => setShowPasscodeModal(false)}
                className="p-1 border border-slate-200 hover:border-slate-400 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <Key className="w-8 h-8 text-[#D4AF37] mx-auto animate-bounce" />
              <h4 className="font-serif font-black text-slate-800 text-sm">Manager Security Passcode</h4>
              <p className="text-[10px] text-slate-400 font-mono">
                Voiding requires terminal override code (Hint: use 1234 or 8888)
              </p>
            </div>

            <input 
              type="password"
              placeholder="••••"
              maxLength={4}
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-center font-mono tracking-widest text-lg w-32"
            />

            <button
              onClick={handleConfirmPasscode}
              className="w-full py-2.5 bg-slate-900 text-[#D4AF37] hover:bg-slate-800 font-mono font-black text-xs uppercase rounded-xl transition-all"
            >
              Verify Passcode
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
