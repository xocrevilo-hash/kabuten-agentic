import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { initializeDatabase, getPodcastEpisodes } = await import("@/lib/db");
    await initializeDatabase();
    const episodes = await getPodcastEpisodes();

    const lastScan = episodes.length > 0 ? episodes[0].processed_at || episodes[0].created_at : null;

    return NextResponse.json({
      episodes: episodes.map((e: Record<string, unknown>) => ({
        id: e.id,
        podcast_name: e.podcast_name,
        episode_title: e.episode_title,
        episode_date: e.episode_date,
        insights_json: e.insights_json,
        status: e.status,
        processed_at: e.processed_at,
      })),
      lastScan,
    });
  } catch {
    return NextResponse.json({ episodes: [], lastScan: null });
  }
}
