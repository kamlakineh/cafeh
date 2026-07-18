import { NextRequest, NextResponse } from "next/server";
import { dbSelectEmployees, dbSaveEmployee } from "@/lib/db";
import type { Employee } from "@/src/types";

export async function GET() {
  try {
    const emps = await dbSelectEmployees();
    const sanitized = emps.map(({ pin, password, ...rest }) => ({
      ...rest,
      pin: pin ? "****" : undefined,
      password: password ? "****" : undefined,
    }));
    return NextResponse.json(sanitized);
  } catch (error) {
    console.error("GET /api/employees error:", error);
    return NextResponse.json(
      { error: "Failed to fetch employees" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newEmp: Employee = {
      id: body.id || `EMP-${Date.now()}`,
      name: body.name || "",
      role: body.role || "Staff",
      status: body.status || "On duty",
      performance: body.performance ?? 100,
      shiftTime: body.shiftTime,
      pin: body.pin,
      password: body.password,
      isAccessEnabled: body.isAccessEnabled ?? true,
      attendanceLogs: body.attendanceLogs || [],
    };
    await dbSaveEmployee(newEmp);
    const { pin, password, ...safe } = newEmp;
    return NextResponse.json(
      {
        ...safe,
        pin: pin ? "****" : undefined,
        password: password ? "****" : undefined,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/employees error:", error);
    return NextResponse.json(
      { error: "Failed to create employee" },
      { status: 500 },
    );
  }
}
