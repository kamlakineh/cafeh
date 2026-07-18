import { NextRequest, NextResponse } from "next/server";
import { dbSelectEmployees, dbSaveEmployee } from "@/lib/db";
import type { AttendanceLog } from "@/src/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { employeeId } = body;
    if (!employeeId) {
      return NextResponse.json(
        { error: "employeeId is required" },
        { status: 400 },
      );
    }
    const allEmps = await dbSelectEmployees();
    const emp = allEmps.find((e) => e.id === employeeId);
    if (!emp) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 },
      );
    }
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-CA");
    const timeStr = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    let onTime = true;
    if (emp.shiftTime) {
      const shiftStart = emp.shiftTime.split(" - ")[0];
      if (shiftStart) {
        const shiftHour = parseInt(shiftStart.split(":")[0]);
        const shiftMin = parseInt(shiftStart.split(":")[1]);
        const shiftAmPm = shiftStart.includes("PM") ? "PM" : "AM";
        const shiftTotalMin =
          (shiftHour % 12) * 60 + shiftMin + (shiftAmPm === "PM" ? 12 * 60 : 0);
        const nowTotalMin = now.getHours() * 60 + now.getMinutes();
        onTime = nowTotalMin <= shiftTotalMin + 15;
      }
    }

    const newLog: AttendanceLog = {
      date: dateStr,
      timeIn: timeStr,
      type: "Auto",
      onTime,
    };
    const updatedLogs = [...(emp.attendanceLogs || []), newLog];
    const updated = {
      ...emp,
      attendanceLogs: updatedLogs,
      status: "On duty" as const,
    };
    await dbSaveEmployee(updated);
    const { password, ...safe } = updated;
    return NextResponse.json({ ...safe, pin: safe.pin ? "****" : undefined });
  } catch (error) {
    console.error("POST /api/employees/attendance/auto error:", error);
    return NextResponse.json(
      { error: "Failed to record attendance" },
      { status: 500 },
    );
  }
}
