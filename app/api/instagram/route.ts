import { NextResponse } from "next/server";
import { ApifyClient } from "apify-client";

type Comment = {
  text: string;
  author: string;
  timestamp: string;
  likes: number;
};

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

const extractComments = (
  data: Record<string, unknown>[]
): Record<string, unknown>[] => {
  const firstItem = data[0] as Record<string, unknown> | undefined;

  if (!firstItem) return [];

  if (Array.isArray(firstItem.comments)) return firstItem.comments;

  const results = firstItem.results as Record<string, unknown>[] | undefined;
  if (
    results?.[0] &&
    Array.isArray((results[0] as Record<string, unknown>).comments)
  ) {
    return (results[0] as Record<string, unknown>).comments as Record<
      string,
      unknown
    >[];
  }

  return data;
};

const formatComment = (comment: Record<string, unknown>): Comment => ({
  text: String(comment.text || comment.content || comment.message || ""),
  author: String(
    comment.ownerUsername ||
      comment.username ||
      comment.author ||
      (comment.user as Record<string, unknown>)?.username ||
      "Unknown"
  ),
  timestamp: String(
    comment.timestamp ||
      comment.created ||
      comment.createdAt ||
      new Date().toISOString()
  ),
  likes: Number(comment.likesCount || comment.likes || 0),
});

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

    const normalizedUrl = `https://www.instagram.com/reel/${reelId}/`;

    // Run both actors in parallel
    const [metricsRun, commentsRun] = await Promise.all([
      client.actor("apify/instagram-scraper").call({
        directUrls: [normalizedUrl],
        resultsLimit: 1,
        proxy: { useApifyProxy: true },
        maxRequestRetries: 3,
        fields: [
          "likesCount",
          "commentsCount",
          "videoPlayCount",
          "timestamp",
          "caption",
        ],
      }),
      client.actor("SbK00X0JYCPblD2wp").call({
        directUrls: [normalizedUrl],
        resultsLimit: 5,
        maxComments: 5,
        commentsPerPost: 5,
        scrapePostComments: true,
      }),
    ]);

    // Fetch results from both datasets in parallel
    const [metricsData, commentsData] = await Promise.all([
      client.dataset(metricsRun.defaultDatasetId).listItems(),
      client.dataset(commentsRun.defaultDatasetId).listItems(),
    ]);

    console.log(
      "Full comments response:",
      JSON.stringify(commentsData, null, 2)
    );
    console.log("Comments items:", commentsData.items);

    const metrics = metricsData.items?.[0] as Record<string, unknown>;

    if (!metrics) {
      return NextResponse.json(
        { error: "No data found for this reel" },
        { status: 404 }
      );
    }

    const extractedComments = extractComments(
      commentsData.items as Record<string, unknown>[]
    );

    return NextResponse.json({
      likes: Number(metrics.likesCount) || 0,
      comments: Number(metrics.commentsCount) || 0,
      views: Number(metrics.videoPlayCount) || 0,
      timestamp: String(metrics.timestamp || new Date().toISOString()),
      title: String(metrics.caption || "No caption available"),
      top_comments: extractedComments
        .map(formatComment)
        .sort((a, b) => b.likes - a.likes)
        .slice(0, 5),
    });
  } catch (error) {
    console.error("Error fetching reel metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch reel metrics" },
      { status: 500 }
    );
  }
}
