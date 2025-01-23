"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ApifyClient } from "apify-client";
import { useState } from "react";

interface ReelMetrics {
  likes: number;
  comments: number;
  views: number;
  timestamp: string;
  title: string;
}

interface ApifyReelData {
  likesCount: number;
  commentsCount: number;
  videoPlayCount: number;
  timestamp: string;
  type: string;
  caption: string;
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
        },
        fields: [
          "likesCount",
          "commentsCount",
          "videoPlayCount",
          "timestamp",
          "type",
          "caption",
        ],
      };

      const run = await client.actor("apify/instagram-scraper").call(input, {
        memory: 256,
        timeout: 30,
      });

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
          timestamp: reelData.timestamp || new Date().toISOString(),
          title: reelData.caption || "No caption available",
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
          <div className="col-span-2 text-center text-lg font-semibold mb-2">
            {metrics.title}
          </div>
          <h2 className="text-xl font-semibold mb-2">Metrics</h2>
          <div className="grid grid-cols-2 gap-2">
            <div>Likes: {metrics.likes.toLocaleString()}</div>
            <div>Comments: {metrics.comments.toLocaleString()}</div>
            <div>Views: {metrics.views.toLocaleString()}</div>
            <div>
              Posted: {new Date(metrics.timestamp).toLocaleDateString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
