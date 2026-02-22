import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId") || undefined;
    const search = searchParams.get("search") || undefined;
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Company-specific queries — paginated with all severities (full audit trail)
    if (companyId) {
      const { getCompanyActionLogPaginated } = await import("@/lib/db");
      const { rows, total } = await getCompanyActionLogPaginated(companyId, limit, offset);
      let entries = rows as Record<string, unknown>[];
      if (search) {
        const q = search.toLowerCase();
        entries = entries.filter(
          (log) =>
            (log.summary as string)?.toLowerCase().includes(q) ||
            (log.company_name as string)?.toLowerCase().includes(q)
        );
      }
      return NextResponse.json({ entries, total });
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
