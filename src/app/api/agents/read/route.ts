import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/agents/read
 * Marks a sector as read — updates last_read_at to NOW().
 * Body: { sector_key: string }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sector_key } = body;

    if (!sector_key) {
      return NextResponse.json(
        { error: "sector_key is required" },
        { status: 400 }
      );
    }

    const { markSectorRead } = await import("@/lib/db");
    await markSectorRead(sector_key);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
