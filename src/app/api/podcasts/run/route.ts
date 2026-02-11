import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export const maxDuration = 300;

const TRACKED_PODCASTS = [
  { name: "all-in", label: "All-In", focus: "Tech, venture, macro" },
  { name: "a16z", label: "a16z Podcast", focus: "Tech, venture, AI" },
  { name: "bg2", label: "BG2 Pod", focus: "Business, growth, tech" },
  { name: "no-priors", label: "No Priors", focus: "AI, machine learning" },
  { name: "dwarkesh", label: "Dwarkesh Podcast", focus: "AI, technology, science" },
  { name: "big-tech", label: "Big Technology Podcast", focus: "Big tech industry" },
  { name: "excess-returns", label: "Excess Returns", focus: "Investing, markets" },
  { name: "bloomberg-tech", label: "Bloomberg Technology", focus: "Tech news, markets" },
  { name: "hard-fork", label: "Hard Fork (NYT)", focus: "Tech culture, AI" },
  { name: "odd-lots", label: "Odd Lots (Bloomberg)", focus: "Markets, economics, tech" },
  { name: "semi-doped", label: "Semi Doped", focus: "Semiconductors, chip industry" },
];

async function scanPodcast(podcast: typeof TRACKED_PODCASTS[0]): Promise<{
  podcastName: string;
  episodeTitle: string;
  episodeDate: string | null;
  insights: { topic: string; insight: string }[];
  status: string;
}> {
  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 2048,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 3 } as any],
      messages: [
        {
          role: "user",
          content: `Search for the most recent episode of the "${podcast.label}" podcast (focus: ${podcast.focus}). Find:
1. The episode title and approximate date
2. Key insights related to AI, semiconductors, technology companies, or markets

Respond ONLY with valid JSON (no markdown, no code fences):
{
  "episode_title": "Episode title here",
  "episode_date": "YYYY-MM-DD or null if unknown",
  "insights": [
    { "topic": "AI" or "Semiconductors" or "Cloud" or "Markets" or "Tech", "insight": "Brief insight summary" }
  ]
}

Extract 3-5 key insights. If you can't find a recent episode, return an empty insights array.`,
        },
      ],
    });

    const rawText = response.content
      .filter((block) => block.type === "text")
      .map((block) => ("text" in block ? block.text : ""))
      .join("");

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      }
    }

    if (parsed) {
      return {
        podcastName: podcast.name,
        episodeTitle: parsed.episode_title || "Unknown episode",
        episodeDate: parsed.episode_date || null,
        insights: parsed.insights || [],
        status: parsed.insights?.length > 0 ? "partial" : "not_found",
      };
    }

    return {
      podcastName: podcast.name,
      episodeTitle: "Episode not found",
      episodeDate: null,
      insights: [],
      status: "not_found",
    };
  } catch (error) {
    console.error(`Podcast scan error for ${podcast.name}:`, error);
    return {
      podcastName: podcast.name,
      episodeTitle: "Scan error",
      episodeDate: null,
      insights: [],
      status: "not_found",
    };
  }
}

export async function POST() {
  try {
    const { initializeDatabase, insertPodcastEpisode } = await import("@/lib/db");
    await initializeDatabase();

    const results = [];

    for (const podcast of TRACKED_PODCASTS) {
      const result = await scanPodcast(podcast);
      results.push(result);

      await insertPodcastEpisode({
        podcastName: result.podcastName,
        episodeTitle: result.episodeTitle,
        episodeDate: result.episodeDate,
        transcriptUrl: null,
        insightsJson: result.insights,
        status: result.status,
      });

      // Rate limit delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    return NextResponse.json({
      success: true,
      message: `Podcast scan complete. ${results.filter((r) => r.status !== "not_found").length}/${results.length} podcasts with insights.`,
      episodes: results,
    });
  } catch (error) {
    console.error("Podcast scan error:", error);
    return NextResponse.json(
      { success: false, message: "Podcast scan failed: " + String(error), episodes: [] },
      { status: 500 }
    );
  }
}
