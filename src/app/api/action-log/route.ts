import { NextResponse } from "next/server";
import { getActionLog } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId") || undefined;
    const search = searchParams.get("search") || undefined;
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const logs = await getActionLog(companyId, limit);

    // Client-side search filter (simple approach)
    let entries = logs;
    if (search) {
      const q = search.toLowerCase();
      entries = logs.filter(
        (log: Record<string, unknown>) =>
          (log.summary as string)?.toLowerCase().includes(q) ||
          (log.company_id as string)?.toLowerCase().includes(q) ||
          (log.company_name as string)?.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Error fetching action log:", error);
    return NextResponse.json(
      { error: "Failed to fetch action log" },
      { status: 500 }
    );
  }
}
