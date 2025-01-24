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

interface RawComment {
  text?: string;
  author?: {
    uniqueId?: string;
    nickname?: string;
  };
  diggCount?: number;
  createTime?: number;
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

    if (!process.env.NEXT_PUBLIC_APIFY_API_TOKEN) {
      return NextResponse.json(
        { error: "API configuration error. Please contact support." },
        { status: 500 }
      );
    }

    // Prepare Actor inputs
    const metricsInput = {
      postURLs: [videoUrl],
      shouldDownloadVideos: false,
      shouldDownloadCovers: false,
      shouldDownloadSubtitles: false,
      shouldDownloadSlideshowImages: false,
    };

    const commentsInput = {
      postURLs: [videoUrl],
      commentsPerPost: 5,
    };

    let metricsRun, commentsRun;
    try {
      console.log("Starting Apify actors with URL:", videoUrl);
      // Run both actors in parallel with timeout
      [metricsRun, commentsRun] = await Promise.all([
        client.actor("S5h7zRLfKFEr8pdj7").call(metricsInput),
        client.actor("BDec00yAmCm1QbMEI").call(commentsInput),
      ]);
      console.log("Apify actors completed successfully");
    } catch (error) {
      console.error("Detailed Apify error:", {
        error:
          error instanceof Error
            ? {
                message: error.message,
                name: error.name,
                stack: error.stack,
              }
            : error,
        videoUrl,
        apiToken: process.env.NEXT_PUBLIC_APIFY_API_TOKEN
          ? "Present"
          : "Missing",
      });
      return NextResponse.json(
        {
          error:
            "Failed to fetch TikTok data. Please ensure the URL is in the correct format (e.g., https://www.tiktok.com/@username/video/1234567890).",
        },
        { status: 500 }
      );
    }

    if (!metricsRun?.defaultDatasetId || !commentsRun?.defaultDatasetId) {
      console.error("Invalid Apify run response:", { metricsRun, commentsRun });
      return NextResponse.json(
        {
          error: "Invalid response from TikTok data service. Please try again.",
        },
        { status: 500 }
      );
    }

    let metricsData, commentsData;
    try {
      // Fetch results from both datasets in parallel
      [metricsData, commentsData] = await Promise.all([
        client.dataset(metricsRun.defaultDatasetId).listItems(),
        client.dataset(commentsRun.defaultDatasetId).listItems(),
      ]);
    } catch (error) {
      console.error("Error fetching data from Apify datasets:", error);
      return NextResponse.json(
        { error: "Failed to process video data. Please try again." },
        { status: 500 }
      );
    }

    if (!metricsData?.items?.[0]) {
      return NextResponse.json(
        {
          error:
            "No data found for this video. Please check if the URL is correct and the video is public.",
        },
        { status: 404 }
      );
    }

    const tiktokData = metricsData.items[0] as TikTokApiResponse;

    // Process comments
    const comments =
      Array.isArray(commentsData.items) && commentsData.items.length > 0
        ? commentsData.items.slice(0, 5).map((comment: RawComment) => ({
            text: comment.text || "",
            author:
              comment.author?.nickname ||
              comment.author?.uniqueId ||
              "Anonymous",
            likes: comment.diggCount || 0,
            timestamp: comment.createTime
              ? new Date(comment.createTime * 1000).toISOString()
              : null,
          }))
        : [];

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
      commentsList: comments,
    };

    return NextResponse.json(transformedMetrics);
  } catch (error) {
    console.error("Request error:", error);
    return NextResponse.json(
      { error: "Invalid request format" },
      { status: 400 }
    );
  }
}
