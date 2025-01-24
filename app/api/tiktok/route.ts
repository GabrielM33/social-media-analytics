import { NextResponse } from "next/server";
import { ApifyClient } from "apify-client";

const extractVideoId = (url: string): string | null => {
  const pattern = /tiktok\.com\/@[\w.-]+\/video\/(\d+)/;
  const match = url.match(pattern);
  return match ? match[1] : null;
};

export async function POST(request: Request) {
  try {
    const { videoUrl } = await request.json();
    const videoId = extractVideoId(videoUrl);

    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid TikTok video URL format" },
        { status: 400 }
      );
    }

    const client = new ApifyClient({
      token: process.env.NEXT_PUBLIC_APIFY_API_TOKEN,
    });

    const normalizedUrl = `https://www.tiktok.com/video/${videoId}`;

    // Run both actors in parallel
    const [metricsRun, commentsRun] = await Promise.all([
      client.actor("S5h7zRLfKFEr8pdj7").call({
        postURLs: [normalizedUrl],
        shouldDownloadVideos: false,
        shouldDownloadCovers: false,
        shouldDownloadSubtitles: false,
        shouldDownloadSlideshowImages: false,
        maxItems: 1,
        proxy: {
          useApifyProxy: true,
          apifyProxyGroups: ["RESIDENTIAL"],
        },
      }),
      client.actor("BDec00yAmCm1QbMEI").call({
        postURLs: [normalizedUrl],
        maxItems: 1,
        commentsPerPost: 5,
        maxComments: 5,
        proxy: {
          useApifyProxy: true,
          apifyProxyGroups: ["RESIDENTIAL"],
        },
      }),
    ]);

    // Fetch results from both datasets in parallel
    const [metricsData, commentsData] = await Promise.all([
      client.dataset(metricsRun.defaultDatasetId).listItems(),
      client.dataset(commentsRun.defaultDatasetId).listItems(),
    ]);

    const metrics = metricsData.items?.[0] as Record<string, unknown>;
    const comments =
      (commentsData.items?.[0] as Record<string, unknown>)?.comments || [];

    if (!metrics) {
      return NextResponse.json(
        { error: "No data found for this video" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      likes: Number(metrics.diggCount || 0),
      comments: Number(metrics.commentCount || 0),
      views: Number(metrics.playCount || 0),
      timestamp: new Date().toISOString(),
      title: String(metrics.desc || "No description available"),
      commentsList: (comments as Record<string, unknown>[])
        .slice(0, 5)
        .map((comment) => ({
          text: String(comment.text || ""),
          author: String(comment.author || "Unknown"),
          timestamp: new Date().toISOString(),
          likes: Number(comment.likes || 0),
        })),
    });
  } catch (error) {
    console.error("Error fetching video metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch video metrics" },
      { status: 500 }
    );
  }
}
