import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId") || undefined;
    const search = searchParams.get("search") || undefined;
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Company-specific queries use the simple function (no pagination needed)
    if (companyId) {
      const { getActionLog } = await import("@/lib/db");
      const logs = await getActionLog(companyId, limit);
      return NextResponse.json({ entries: logs, total: logs.length });
    }

    // Paginated query excluding no_change
    const { getFilteredActionLog } = await import("@/lib/db");
    const { rows, total } = await getFilteredActionLog({
      excludeSeverities: ["no_change"],
      limit,
      offset,
    });

    let entries = rows as Record<string, unknown>[];
    if (search) {
      const q = search.toLowerCase();
      entries = entries.filter(
        (log) =>
          (log.summary as string)?.toLowerCase().includes(q) ||
          (log.company_id as string)?.toLowerCase().includes(q) ||
          (log.company_name as string)?.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({ entries, total });
  } catch (error) {
    console.error("Error fetching action log:", error);
    return NextResponse.json(
      { error: "Failed to fetch action log" },
      { status: 500 }
    );
  }
}
