import React from "react";
import { 
  FileText, Calendar, Filter, Share2, Printer, CheckCircle, 
  ChevronRight, Download, BarChart, Users, Clock, ShoppingCart
} from "lucide-react";

export default function ReportsTab() {
  
  const [selectedReport, setSelectedReport] = React.useState("Daily Operations");
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const reportList = [
    { name: "Daily Operations", category: "Operations", desc: "Aggregated ticket performance, guest turnover speed & SLA fulfillment rate.", icon: FileText },
    { name: "Employee Performance", category: "Roster", desc: "Detailed staff checklist, shifts logged, and corporate rating index.", icon: Users },
    { name: "Kitchen Performance", category: "Kitchen", desc: "Chef-level cook timers, meal prep statistics, and delay bottlenecks.", icon: Clock },
    { name: "Delivery Performance", category: "Logistics", desc: "Courier dispatch times, driver transit mapping & ETA compliance indexes.", icon: Share2 },
    { name: "Sales Report", category: "Finance", desc: "Sales gross value, AOV indicators, discount impacts & net profit margins.", icon: BarChart },
    { name: "Customer Feedback", category: "Reviews", desc: "Organic satisfaction rating indices, sentiment alerts & negative review flags.", icon: Download },
    { name: "Attendance Report", category: "Roster", desc: "Clock-in/out schedules, late arrival summaries, and overtime sheets.", icon: CheckCircle }
  ];

  return (
    <div className="space-y-6" id="manager-reporting-center">
      
      {toastMessage && (
        <div className="fixed bottom-8 right-8 bg-slate-900 text-white text-xs font-mono py-3 px-5 rounded-xl shadow-2xl z-50 animate-fadeIn flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Date & Filter selectors */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Mock inputs */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="space-y-1">
            <span className="text-[9px] font-mono text-slate-400 uppercase block">Date Range Filter</span>
            <input 
              type="date" 
              defaultValue="2026-07-01"
              className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none" 
            />
          </div>
          
          <div className="space-y-1">
            <span className="text-[9px] font-mono text-slate-400 uppercase block">To Date</span>
            <input 
              type="date" 
              defaultValue="2026-07-15"
              className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none" 
            />
          </div>

          <div className="space-y-1">
            <span className="text-[9px] font-mono text-slate-400 uppercase block">Branch Location</span>
            <select className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none">
              <option value="Manhattan">Manhattan Salon #1</option>
              <option value="Brooklyn">Brooklyn Diner #4</option>
            </select>
          </div>
        </div>

        <div className="flex space-x-2 w-full md:w-auto justify-end">
          <button 
            onClick={() => showToast(`Successfully exported PDF for '${selectedReport}'`)}
            className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-xl text-xs font-mono flex items-center space-x-1 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
          
          <button 
            onClick={() => showToast(`Opening Excel compilation ledger for '${selectedReport}'`)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-xs font-mono hover:text-blue-600"
          >
            Export CSV
          </button>
        </div>

      </div>

      {/* Main layout splitting report selector cards & active report display preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left selector cards */}
        <div className="lg:col-span-5 space-y-3">
          {reportList.map((rep) => {
            const IconComponent = rep.icon;
            const isSelected = selectedReport === rep.name;

            return (
              <div
                key={rep.name}
                onClick={() => setSelectedReport(rep.name)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start space-x-3.5 ${
                  isSelected 
                    ? "bg-white border-[#2563EB] shadow-md ring-1 ring-[#2563EB]" 
                    : "bg-white border-slate-100 hover:border-slate-300 shadow-sm"
                }`}
              >
                <div className={`p-2.5 rounded-lg ${isSelected ? "bg-blue-50 text-[#2563EB]" : "bg-slate-50 text-slate-500"}`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-serif text-sm font-black text-slate-800">{rep.name}</h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase tracking-wider">{rep.category}</p>
                  <p className="text-[11px] text-slate-500 font-sans mt-1 line-clamp-2 leading-relaxed">{rep.desc}</p>
                </div>
                
                <ChevronRight className={`w-4 h-4 self-center ${isSelected ? "text-[#2563EB]" : "text-slate-300"}`} />
              </div>
            );
          })}
        </div>

        {/* Right Preview Panel */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6 min-h-[450px]">
          
          <div className="border-b border-slate-100 pb-4 flex justify-between items-start">
            <div>
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block">REPORT PREVIEW OVERVIEW</span>
              <h3 className="font-serif font-black text-lg text-slate-800 mt-1">{selectedReport}</h3>
              <p className="text-xs text-slate-400">Generated on July 15, 2026 for Manhattan Branch #1</p>
            </div>
            
            <button 
              onClick={() => showToast(`Initiating system print queue for '${selectedReport}'`)}
              className="p-1.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg hover:text-blue-600"
              title="Print Document Preview"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>

          {/* Simple Dynamic Preview Details depending on selection */}
          <div className="space-y-4">
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-xs font-mono font-bold text-slate-700 uppercase">Executive Executive Summary Abstract</h4>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-sans">
                This compiled index reviews standard operational indexes for the specified calendar filter. 
                Average service delivery response timing fits optimal SLA bands with minor deviations noted in active delivery channels. 
                Fulfillment curves remain steadily balanced across product divisions.
              </p>
            </div>

            {/* Table Mock detailing indexes */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono font-bold text-slate-700 uppercase">Key Performance Metric Indicators</h4>
              
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden text-xs">
                
                <div className="p-3 bg-white flex justify-between items-center">
                  <span className="font-sans font-medium text-slate-600">Primary Objective Fulfill Index:</span>
                  <span className="font-mono font-bold text-green-600">94.8% Done</span>
                </div>

                <div className="p-3 bg-white flex justify-between items-center">
                  <span className="font-sans font-medium text-slate-600">Staff Utilization Efficiency Rate:</span>
                  <span className="font-mono font-bold text-[#2B6CB0]">89.2% Active</span>
                </div>

                <div className="p-3 bg-white flex justify-between items-center">
                  <span className="font-sans font-medium text-slate-600">Critical Incident SLA Exceptions:</span>
                  <span className="font-mono font-bold text-red-500">2 Incidents</span>
                </div>

                <div className="p-3 bg-white flex justify-between items-center">
                  <span className="font-sans font-medium text-slate-600">System Cost Margin Balance:</span>
                  <span className="font-mono font-bold text-slate-800">$12,425.00</span>
                </div>

              </div>
            </div>

            <p className="text-[10px] text-slate-400 font-mono leading-relaxed bg-blue-50/50 p-3 rounded-lg border border-blue-50">
              ℹ Note: Report outputs are generated securely following administrative policies. To customize metrics or database queries, contact business settings coordinators.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}
