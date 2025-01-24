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

interface ApifyRun {
  defaultDatasetId: string;
}

interface ApifyDataset {
  items: TikTokApiResponse[];
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
      // Simpler scraping approach
      extendOutputFunction: `async ({ page }) => {
        try {
          // Wait for the video to load
          await page.waitForFunction(() => {
            const likes = document.querySelector('strong[data-e2e="like-count"]');
            const comments = document.querySelector('strong[data-e2e="comment-count"]');
            const views = document.querySelector('strong[data-e2e="video-views"]');
            return likes && comments && views;
          }, { timeout: 15000 });

          // Get text content directly from the DOM
          const likes = document.querySelector('strong[data-e2e="like-count"]')?.textContent || "0";
          const comments = document.querySelector('strong[data-e2e="comment-count"]')?.textContent || "0";
          const views = document.querySelector('strong[data-e2e="video-views"]')?.textContent || "0";
          const desc = document.querySelector('div[data-e2e="video-desc"]')?.textContent || "";

          return {
            diggCount: likes,
            commentCount: comments,
            playCount: views,
            desc: desc
          };
        } catch (e) {
          console.error('Scraping error:', e);
          return {
            diggCount: "0",
            commentCount: "0",
            playCount: "0",
            desc: "No description available"
          };
        }
      }`,
    };

    // Increase memory limit and timeout for production
    const actorOptions = {
      memory: process.env.NODE_ENV === "production" ? 2048 : 1024,
      timeoutSecs: process.env.NODE_ENV === "production" ? 120 : 60,
    };

    // Run only metrics actor with increased resources
    const metricsRun = await client
      .actor("S5h7zRLfKFEr8pdj7")
      .call(input, actorOptions);

    if (!metricsRun?.defaultDatasetId) {
      throw new Error("Invalid Apify run response");
    }

    // Use a dummy comments run
    const commentsRun = { defaultDatasetId: "dummy" };

    return { metricsRun, commentsRun };
  } catch (error: unknown) {
    console.error("Detailed Apify error:", error);
    throw new Error("Failed to fetch TikTok data. Please try again.");
  }
}

async function fetchDatasets(
  metricsRun: ApifyRun
): Promise<{ metricsData: ApifyDataset }> {
  const isProduction = process.env.NODE_ENV === "production";
  const waitTime = isProduction ? 5000 : 2000;

  // Wait for initial dataset population
  await new Promise((resolve) => setTimeout(resolve, waitTime));

  try {
    const metricsData = await client
      .dataset(metricsRun.defaultDatasetId)
      .listItems();

    if (!metricsData?.items?.[0]) {
      throw new Error("No data found in the dataset");
    }

    return { metricsData };
  } catch (error) {
    console.error("Dataset fetch error:", error);
    throw new Error("Failed to retrieve TikTok data");
  }
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
        const { metricsRun } = await runApifyActors(videoUrl);
        const { metricsData } = await fetchDatasets(metricsRun);

        const tiktokData = metricsData.items[0] as TikTokApiResponse;

        if (!tiktokData) {
          throw new Error("No data returned from TikTok");
        }

        // Parse numeric values safely
        return {
          title: tiktokData.desc || "No description available",
          likes: parseNumber(tiktokData.diggCount),
          comments: parseNumber(tiktokData.commentCount),
          views: parseNumber(tiktokData.playCount),
          timestamp: new Date().toISOString(),
          commentsList: [],
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
