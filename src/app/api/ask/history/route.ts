import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { initializeDatabase, getAskKabutenLog } = await import("@/lib/db");
    await initializeDatabase();
    const logs = await getAskKabutenLog(50);
    return NextResponse.json({ history: logs });
  } catch (error) {
    console.error("Ask history error:", error);
    return NextResponse.json({ history: [] });
  }
}
