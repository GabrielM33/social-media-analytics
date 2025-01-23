"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ApifyClient } from "apify-client";
import { useState } from "react";

interface ReelMetrics {
  likes: number;
  comments: number;
  views: number;
  caption: string;
  timestamp: string;
}

interface ApifyReelData {
  likesCount: number;
  commentsCount: number;
  videoPlayCount: number;
  caption: string;
  timestamp: string;
  type: string;
}

export default function InputBarInstagram() {
  const [reelUrl, setReelUrl] = useState("");
  const [metrics, setMetrics] = useState<ReelMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReelMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      const client = new ApifyClient({
        token: process.env.NEXT_PUBLIC_APIFY_API_TOKEN,
      });

      const input = {
        directUrls: [reelUrl],
        resultsLimit: 1,
        proxy: {
          useApifyProxy: true,
          apifyProxyGroups: ["RESIDENTIAL"],
        },
      };

      const run = await client.actor("apify/instagram-scraper").call(input);
      const { items } = await client.dataset(run.defaultDatasetId).listItems();

      if (items.length > 0) {
        const reelData = items[0] as unknown as ApifyReelData;

        if (reelData.type !== "Video") {
          throw new Error("The provided URL is not a reel");
        }

        setMetrics({
          likes: reelData.likesCount,
          comments: reelData.commentsCount,
          views: reelData.videoPlayCount,
          caption: reelData.caption,
          timestamp: reelData.timestamp || new Date().toISOString(),
        });
      } else {
        throw new Error("No data found for this reel");
      }
    } catch (error) {
      console.error("Error fetching reel metrics:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch reel metrics"
      );
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold">Instagram Reel Metrics</h1>
      <div className="flex flex-row items-center justify-center gap-2 mb-10 mt-2">
        <Input
          placeholder="Enter Instagram reel URL (e.g., https://www.instagram.com/reel/xyz)"
          value={reelUrl}
          onChange={(e) => setReelUrl(e.target.value)}
        />
        <Button onClick={fetchReelMetrics} disabled={loading || !reelUrl}>
          {loading ? "Loading..." : "Fetch Metrics"}
        </Button>
      </div>

      {error && (
        <div className="mt-4 p-4 border border-red-200 rounded-lg bg-red-50 text-red-600">
          {error}
        </div>
      )}

      {metrics && (
        <div className="mt-4 p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Metrics</h2>
          <div className="grid grid-cols-2 gap-2">
            <div>Likes: {metrics.likes.toLocaleString()}</div>
            <div>Comments: {metrics.comments.toLocaleString()}</div>
            <div>Views: {metrics.views.toLocaleString()}</div>
            <div>
              Posted: {new Date(metrics.timestamp).toLocaleDateString()}
            </div>
          </div>
          {metrics.caption && (
            <div className="mt-2">
              <strong>Caption:</strong>
              <p className="text-sm mt-1">{metrics.caption}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
