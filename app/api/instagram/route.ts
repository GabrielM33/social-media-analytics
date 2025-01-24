import { NextResponse } from "next/server";
import { ApifyClient } from "apify-client";

const extractReelId = (url: string): string | null => {
  const patterns = [
    /instagram\.com\/(?:reels?|p)\/([A-Za-z0-9_-]+)/, // Matches both /reel/ and /p/
    /^([A-Za-z0-9_-]+)$/, // Matches just the ID
  ];

  return (
    patterns
      .map((pattern) => url.trim().replace(/^@/, "").match(pattern)?.[1])
      .find(Boolean) || null
  );
};

export async function POST(request: Request) {
  try {
    const { reelUrl } = await request.json();
    const reelId = extractReelId(reelUrl);

    if (!reelId) {
      return NextResponse.json(
        { error: "Invalid Instagram reel URL format" },
        { status: 400 }
      );
    }

    const client = new ApifyClient({
      token: process.env.NEXT_PUBLIC_APIFY_API_TOKEN,
    });

    const run = await client.actor("apify/instagram-scraper").call({
      directUrls: [`https://www.instagram.com/reel/${reelId}/`],
      resultsLimit: 1,
      proxy: { useApifyProxy: true },
      maxRequestRetries: 3,
      fields: [
        "likesCount",
        "commentsCount",
        "videoPlayCount",
        "timestamp",
        "caption",
        "comments",
      ],
    });

    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    const rawData = items?.[0] as Record<string, unknown>;

    if (!rawData) {
      return NextResponse.json(
        { error: "No data found for this reel" },
        { status: 404 }
      );
    }

    const responseData = {
      likes: Number(rawData.likesCount) || 0,
      comments: Number(rawData.commentsCount) || 0,
      views: Number(rawData.videoPlayCount) || 0,
      timestamp: String(rawData.timestamp || new Date().toISOString()),
      title: String(rawData.caption || "No caption available"),
      top_comments: Array.isArray(rawData.comments)
        ? (rawData.comments as Array<Record<string, unknown>>)
            .slice(0, 5)
            .map((comment) => ({
              text: String(comment.text || ""),
              author: String(comment.ownerUsername || "Unknown"),
              timestamp: String(comment.timestamp || new Date().toISOString()),
              likes: Number(comment.likesCount || 0),
            }))
        : [],
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching reel metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch reel metrics" },
      { status: 500 }
    );
  }
}
