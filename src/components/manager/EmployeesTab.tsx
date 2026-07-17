import React from "react";
import { Users, Grid, List, Mail, Calendar, Award, CheckCircle, Clock } from "lucide-react";
import { Employee } from "../../types";
import EmployeeManagementPanel from "../shared/EmployeeManagementPanel";

interface EmployeesTabProps {
  employees: Employee[];
}

export default function EmployeesTab({
  employees
}: EmployeesTabProps) {
  
  return (
    <div className="space-y-6" id="manager-employees-page">
      {/* Overview Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-mono uppercase block">Total Active Staff</span>
            <h4 className="text-xl font-bold font-mono text-slate-800 mt-1">
              {employees.length} Employees
            </h4>
            <p className="text-[10px] text-slate-400 font-sans mt-0.5">Managers & Floor Staff</p>
          </div>
          <div className="p-2.5 bg-blue-50 text-[#2B6CB0] rounded-xl">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-mono uppercase block">On-Duty Today</span>
            <h4 className="text-xl font-bold font-mono text-green-600 mt-1">
              {employees.filter(e => e.status === "On duty").length} Staff
            </h4>
            <p className="text-[10px] text-slate-400 font-sans mt-0.5">Active on terminal sessions</p>
          </div>
          <div className="p-2.5 bg-green-50 text-green-600 rounded-xl">
            <CheckCircle className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-mono uppercase block">Average Rating</span>
            <h4 className="text-xl font-bold font-mono text-indigo-600 mt-1">
              {Math.round(employees.reduce((acc, curr) => acc + (curr.performance || 90), 0) / (employees.length || 1))}%
            </h4>
            <p className="text-[10px] text-slate-400 font-sans mt-0.5">Efficiency Score average</p>
          </div>
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Award className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Embedded Live Management Panel */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <EmployeeManagementPanel currentUserRole="Manager" />
      </div>
    </div>
  );
}
