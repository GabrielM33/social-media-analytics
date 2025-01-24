import { NextResponse } from "next/server";
import { ApifyClient } from "apify-client";

const client = new ApifyClient({
  token: process.env.NEXT_PUBLIC_APIFY_API_TOKEN,
});

interface TikTokApiResponse {
  desc?: string;
  description?: string;
  title?: string;
  text?: string;
  videoTitle?: string;
  diggCount?: number;
  commentCount?: number;
  playCount?: number;
  stats?: {
    diggCount?: number;
    commentCount?: number;
    playCount?: number;
  };
}

export async function POST(request: Request) {
  try {
    const { videoUrl } = await request.json();

    if (!videoUrl) {
      return NextResponse.json(
        { error: "Video URL is required" },
        { status: 400 }
      );
    }

    // Prepare Actor input
    const input = {
      postURLs: [videoUrl],
      shouldDownloadVideos: false,
      shouldDownloadCovers: false,
      shouldDownloadSubtitles: false,
      shouldDownloadSlideshowImages: false,
    };

    // Run the Actor and wait for it to finish
    const run = await client.actor("S5h7zRLfKFEr8pdj7").call(input);

    // Fetch results from the run's dataset
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    if (!items?.[0]) {
      return NextResponse.json(
        { error: "No data found for this video" },
        { status: 404 }
      );
    }

    const tiktokData = items[0] as TikTokApiResponse;

    // Transform the data into our metrics format
    const transformedMetrics = {
      title:
        tiktokData.title ||
        tiktokData.videoTitle ||
        tiktokData.desc ||
        tiktokData.description ||
        tiktokData.text ||
        "No description available",
      likes: tiktokData.diggCount || tiktokData.stats?.diggCount || 0,
      comments: tiktokData.commentCount || tiktokData.stats?.commentCount || 0,
      views: tiktokData.playCount || tiktokData.stats?.playCount || 0,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(transformedMetrics);
  } catch (error) {
    console.error("Error fetching TikTok data:", error);
    return NextResponse.json(
      { error: "Failed to fetch video data" },
      { status: 500 }
    );
  }
}
