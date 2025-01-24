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

interface ApifyRun {
  defaultDatasetId: string;
}

interface ApifyDataset {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: any[];
}

async function runApifyActors(
  videoUrl: string
): Promise<{ metricsRun: ApifyRun; commentsRun: ApifyRun }> {
  const input = {
    postURLs: [videoUrl],
    shouldDownloadVideos: false,
    shouldDownloadCovers: false,
    shouldDownloadSubtitles: false,
    shouldDownloadSlideshowImages: false,
  };

  const [metricsRun, commentsRun] = await Promise.all([
    client.actor("S5h7zRLfKFEr8pdj7").call(input),
    client.actor("BDec00yAmCm1QbMEI").call({ ...input, commentsPerPost: 5 }),
  ]);

  if (!metricsRun?.defaultDatasetId || !commentsRun?.defaultDatasetId) {
    throw new Error("Invalid Apify run response");
  }

  return { metricsRun, commentsRun };
}

async function fetchDatasets(
  metricsRun: ApifyRun,
  commentsRun: ApifyRun
): Promise<{ metricsData: ApifyDataset; commentsData: ApifyDataset }> {
  // Wait longer in production for datasets to be ready
  const isProduction = process.env.NODE_ENV === "production";
  const retryAttempts = isProduction ? 3 : 1;
  const waitTime = isProduction ? 3000 : 2000;

  for (let attempt = 1; attempt <= retryAttempts; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, waitTime));

    try {
      const [metricsData, commentsData] = await Promise.all([
        client.dataset(metricsRun.defaultDatasetId).listItems(),
        client.dataset(commentsRun.defaultDatasetId).listItems(),
      ]);

      if (metricsData?.items?.[0]) {
        return { metricsData, commentsData };
      }

      if (attempt === retryAttempts) {
        throw new Error(`No data found after ${retryAttempts} attempts`);
      }

      console.log(`Attempt ${attempt}: No data yet, retrying...`);
    } catch (error) {
      if (attempt === retryAttempts) {
        throw error;
      }
      console.log(`Attempt ${attempt}: Failed to fetch data, retrying...`);
    }
  }

  // TypeScript needs this, but it will never be reached
  throw new Error("Failed to fetch data");
}

function processComments(commentsData: ApifyDataset) {
  return Array.isArray(commentsData.items) && commentsData.items.length > 0
    ? commentsData.items.slice(0, 5).map((comment: RawComment) => ({
        text: comment.text || "",
        author:
          comment.author?.nickname || comment.author?.uniqueId || "Anonymous",
        likes: comment.diggCount || 0,
        timestamp: comment.createTime
          ? new Date(comment.createTime * 1000).toISOString()
          : null,
      }))
    : [];
}

export async function POST(request: Request) {
  try {
    const { videoUrl } = await request.json();
    if (!videoUrl || !process.env.NEXT_PUBLIC_APIFY_API_TOKEN) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const { metricsRun, commentsRun } = await runApifyActors(videoUrl);
    const { metricsData, commentsData } = await fetchDatasets(
      metricsRun,
      commentsRun
    );

    const tiktokData = metricsData.items[0] as TikTokApiResponse;
    const comments = processComments(commentsData);

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error("TikTok API error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to process request",
      },
      { status: 500 }
    );
  }
}
