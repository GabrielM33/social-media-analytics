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
  top_comments: CommentData[];
}

interface CommentData {
  text: string;
  author: string;
  timestamp: string;
  likes: number;
}

interface ApifyReelData {
  likesCount: number;
  commentsCount: number;
  videoPlayCount: number;
  timestamp: string;
  type: string;
  caption: string;
  comments: Array<{
    text: string;
    ownerUsername: string;
    timestamp: string;
    likesCount: number;
  }>;
}

export default function InputBarInstagram() {
  const [reelUrl, setReelUrl] = useState("");
  const [metrics, setMetrics] = useState<ReelMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizeInstagramUrl = (url: string): string => {
    // Remove @ symbol if present at the start
    url = url.replace(/^@/, "");

    // If URL doesn't start with http/https, add https://
    if (!url.startsWith("http")) {
      url = "https://" + url;
    }

    try {
      const urlObj = new URL(url);
      // Convert www.instagram.com to instagram.com for consistency
      urlObj.hostname = urlObj.hostname.replace(
        "www.instagram.com",
        "instagram.com"
      );

      // Handle different URL patterns
      if (urlObj.pathname.includes("/reels/")) {
        // Format: instagram.com/reels/CODE/
        const code = urlObj.pathname.split("/reels/")[1].replace(/\/$/, "");
        return `https://instagram.com/reel/${code}`;
      } else if (urlObj.pathname.includes("/reel/")) {
        // Format: instagram.com/reel/CODE/
        return urlObj.toString();
      }
      return url;
    } catch {
      return url;
    }
  };

  const fetchReelMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      const normalizedUrl = normalizeInstagramUrl(reelUrl);
      console.log("Normalized URL:", normalizedUrl);

      const client = new ApifyClient({
        token: process.env.NEXT_PUBLIC_APIFY_API_TOKEN,
      });

      const input = {
        directUrls: [normalizedUrl],
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
          "comments",
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
          top_comments: (reelData.comments || [])
            .slice(0, 5)
            .map((comment) => ({
              text: comment.text,
              author: comment.ownerUsername,
              timestamp: comment.timestamp,
              likes: comment.likesCount,
            })),
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
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div>Likes: {metrics.likes.toLocaleString()}</div>
            <div>Comments: {metrics.comments.toLocaleString()}</div>
            <div>Views: {metrics.views.toLocaleString()}</div>
            <div>
              Posted: {new Date(metrics.timestamp).toLocaleDateString()}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Top Comments</h3>
            <div className="space-y-4">
              {metrics.top_comments.length > 0 ? (
                metrics.top_comments.map((comment, index) => (
                  <div key={index} className="border-b pb-3">
                    <div className="flex justify-between items-start">
                      <span className="font-medium">{comment.author}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(comment.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-1 text-sm">{comment.text}</p>
                    <div className="mt-1 text-sm text-gray-500">
                      {comment.likes.toLocaleString()} likes
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No comments available</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
