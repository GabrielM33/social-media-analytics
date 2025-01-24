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

// Add timeout utility
const timeoutPromise = (ms: number) =>
  new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Operation timed out")), ms);
  });

async function runApifyActors(
  videoUrl: string
): Promise<{ metricsRun: ApifyRun; commentsRun: ApifyRun }> {
  try {
    const input = {
      postURLs: [videoUrl],
      shouldDownloadVideos: false,
      shouldDownloadCovers: false,
      shouldDownloadSubtitles: false,
      shouldDownloadSlideshowImages: false,
      maxItems: 1,
    };

    // Add 30s timeout for Apify operations
    const [metricsRun, commentsRun] = (await Promise.race([
      Promise.all([
        client.actor("S5h7zRLfKFEr8pdj7").call(input),
        client
          .actor("BDec00yAmCm1QbMEI")
          .call({ ...input, commentsPerPost: 5 }),
      ]),
      timeoutPromise(30000),
    ])) as [ApifyRun, ApifyRun];

    if (!metricsRun?.defaultDatasetId || !commentsRun?.defaultDatasetId) {
      throw new Error("Invalid Apify run response");
    }

    return { metricsRun, commentsRun };
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Operation timed out") {
      throw new Error("Request timed out. Please try again.");
    }
    throw error;
  }
}

async function fetchDatasets(
  metricsRun: ApifyRun,
  commentsRun: ApifyRun
): Promise<{ metricsData: ApifyDataset; commentsData: ApifyDataset }> {
  const isProduction = process.env.NODE_ENV === "production";
  const retryAttempts = isProduction ? 3 : 1;
  const waitTime = isProduction ? 3000 : 2000;

  for (let attempt = 1; attempt <= retryAttempts; attempt++) {
    try {
      await new Promise((resolve) => setTimeout(resolve, waitTime));

      const [metricsData, commentsData] = (await Promise.race([
        Promise.all([
          client.dataset(metricsRun.defaultDatasetId).listItems(),
          client.dataset(commentsRun.defaultDatasetId).listItems(),
        ]),
        timeoutPromise(10000),
      ])) as [ApifyDataset, ApifyDataset];

      if (metricsData?.items?.[0]) {
        return { metricsData, commentsData };
      }

      if (attempt === retryAttempts) {
        throw new Error("No data found after multiple attempts");
      }
    } catch (error: unknown) {
      if (attempt === retryAttempts) {
        if (error instanceof Error && error.message === "Operation timed out") {
          throw new Error("Data retrieval timed out. Please try again.");
        }
        throw error;
      }
    }
  }

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

    // Add overall route timeout
    const result = await Promise.race([
      (async () => {
        const { metricsRun, commentsRun } = await runApifyActors(videoUrl);
        const { metricsData, commentsData } = await fetchDatasets(
          metricsRun,
          commentsRun
        );

        const tiktokData = metricsData.items[0] as TikTokApiResponse;
        const comments = processComments(commentsData);

        return {
          title:
            tiktokData.title ||
            tiktokData.videoTitle ||
            tiktokData.desc ||
            tiktokData.description ||
            tiktokData.text ||
            "No description available",
          likes: tiktokData.diggCount || tiktokData.stats?.diggCount || 0,
          comments:
            tiktokData.commentCount || tiktokData.stats?.commentCount || 0,
          views: tiktokData.playCount || tiktokData.stats?.playCount || 0,
          timestamp: new Date().toISOString(),
          commentsList: comments,
        };
      })(),
      timeoutPromise(45000),
    ]);

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("TikTok API error:", error);

    // Ensure we always return a valid JSON response
    const errorMessage =
      error instanceof Error ? error.message : "Failed to process request";

    const isTimeout =
      error instanceof Error && error.message === "Operation timed out";

    return NextResponse.json(
      {
        error: isTimeout
          ? "Request timed out. Please try again."
          : errorMessage,
      },
      { status: isTimeout ? 504 : 500 }
    );
  }
}
