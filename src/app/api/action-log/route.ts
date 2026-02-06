import { NextResponse } from "next/server";
import { getActionLog } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId") || undefined;
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const logs = await getActionLog(companyId, limit);
    return NextResponse.json(logs);
  } catch (error) {
    console.error("Error fetching action log:", error);
    return NextResponse.json(
      { error: "Failed to fetch action log" },
      { status: 500 }
    );
  }
}
