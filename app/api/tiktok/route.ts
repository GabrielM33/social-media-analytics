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
  diggCount?: string;
  commentCount?: string;
  playCount?: string;
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
      proxyConfiguration: {
        useApifyProxy: true,
        apifyProxyGroups: ["RESIDENTIAL"],
      },
      // Simplified data extraction
      extendOutputFunction: `async ({ page, request }) => {
        try {
          await page.waitForSelector('strong[data-e2e="like-count"]', { timeout: 10000 });
          
          const data = {
            diggCount: await page.$eval('strong[data-e2e="like-count"]', el => el.textContent || "0"),
            commentCount: await page.$eval('strong[data-e2e="comment-count"]', el => el.textContent || "0"),
            playCount: await page.$eval('strong[data-e2e="video-views"]', el => el.textContent || "0"),
            desc: await page.$eval('div[data-e2e="video-desc"]', el => el.textContent || "")
          };
          return data;
        } catch (e) {
          console.error('Error in extendOutputFunction:', e);
          return null;
        }
      }`,
    };

    // Increase timeout for production
    const timeout = process.env.NODE_ENV === "production" ? 60000 : 30000;

    // Run only metrics actor since we're having issues
    const metricsRun = (await Promise.race([
      client.actor("S5h7zRLfKFEr8pdj7").call(input),
      timeoutPromise(timeout),
    ])) as ApifyRun;

    if (!metricsRun?.defaultDatasetId) {
      throw new Error("Invalid Apify run response");
    }

    // Use a dummy comments run to maintain interface compatibility
    const commentsRun = { defaultDatasetId: "dummy" };

    return { metricsRun, commentsRun };
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Operation timed out") {
      throw new Error("Request timed out. Please try again.");
    }
    console.error("Apify actor error:", error);
    throw new Error("Failed to fetch data from TikTok. Please try again.");
  }
}

async function fetchDatasets(
  metricsRun: ApifyRun,
  commentsRun: ApifyRun
): Promise<{ metricsData: ApifyDataset; commentsData: ApifyDataset }> {
  const isProduction = process.env.NODE_ENV === "production";
  const retryAttempts = isProduction ? 5 : 1; // More retries in production
  const waitTime = isProduction ? 5000 : 2000; // Longer wait in production
  const timeout = isProduction ? 20000 : 10000; // Longer timeout in production

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retryAttempts; attempt++) {
    try {
      await new Promise((resolve) => setTimeout(resolve, waitTime));

      // In production, fetch sequentially to reduce memory usage
      if (isProduction) {
        const metricsData = (await Promise.race([
          client.dataset(metricsRun.defaultDatasetId).listItems(),
          timeoutPromise(timeout),
        ])) as ApifyDataset;

        const commentsData = (await Promise.race([
          client.dataset(commentsRun.defaultDatasetId).listItems(),
          timeoutPromise(timeout),
        ])) as ApifyDataset;

        if (metricsData?.items?.[0]) {
          return { metricsData, commentsData };
        }
      } else {
        // In development, fetch in parallel
        const [metricsData, commentsData] = (await Promise.race([
          Promise.all([
            client.dataset(metricsRun.defaultDatasetId).listItems(),
            client.dataset(commentsRun.defaultDatasetId).listItems(),
          ]),
          timeoutPromise(timeout),
        ])) as [ApifyDataset, ApifyDataset];

        if (metricsData?.items?.[0]) {
          return { metricsData, commentsData };
        }
      }

      console.log(`Attempt ${attempt}/${retryAttempts}: No data yet`);
    } catch (error: unknown) {
      lastError =
        error instanceof Error ? error : new Error("Unknown error occurred");
      console.error(`Attempt ${attempt}/${retryAttempts} failed:`, lastError);

      if (attempt === retryAttempts) {
        if (error instanceof Error && error.message === "Operation timed out") {
          throw new Error("Data retrieval timed out. Please try again.");
        }
        throw lastError;
      }
    }
  }

  throw lastError || new Error("Failed to fetch data after all retries");
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

function parseNumber(value: string | number | undefined): number {
  if (typeof value === "number") return value;
  if (!value) return 0;
  // Remove any non-numeric characters except dots
  const cleaned = value.toString().replace(/[^0-9.]/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
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

    const result = await Promise.race([
      (async () => {
        const { metricsRun, commentsRun } = await runApifyActors(videoUrl);
        const { metricsData, commentsData } = await fetchDatasets(
          metricsRun,
          commentsRun
        );

        const tiktokData = metricsData.items[0] as TikTokApiResponse;

        if (!tiktokData) {
          throw new Error("No data returned from TikTok");
        }

        const comments = processComments(commentsData);

        // Parse numeric values safely
        return {
          title: tiktokData.desc || "No description available",
          likes: parseNumber(tiktokData.diggCount),
          comments: parseNumber(tiktokData.commentCount),
          views: parseNumber(tiktokData.playCount),
          timestamp: new Date().toISOString(),
          commentsList: comments,
        };
      })(),
      timeoutPromise(45000),
    ]);

    // Validate the result before sending
    if (!result || typeof result !== "object") {
      throw new Error("Invalid response format");
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("TikTok API error:", error);

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
