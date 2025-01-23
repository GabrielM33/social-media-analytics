"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ApifyClient } from "apify-client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useMetrics } from "@/lib/MetricsContext";

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

const formatNumber = (num: number) => num.toLocaleString();

export default function InputBarInstagram() {
  const [reelUrl, setReelUrl] = useState("");
  const [metrics, setMetrics] = useState<ReelMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setInstagramMetrics } = useMetrics();

  useEffect(() => {
    if (metrics) {
      setInstagramMetrics({
        views: metrics.views,
        likes: metrics.likes,
        comments: metrics.comments,
      });
    } else {
      setInstagramMetrics(null);
    }
  }, [metrics, setInstagramMetrics]);

  const extractReelId = (url: string): string | null => {
    // Remove @ and leading/trailing whitespace
    url = url.replace(/^@/, "").trim();

    // Try to extract reel ID from various URL formats
    const patterns = [
      /instagram\.com\/reels?\/([A-Za-z0-9_-]+)/, // Matches /reels/ or /reel/
      /instagram\.com\/p\/([A-Za-z0-9_-]+)/, // Matches /p/ format
      /^([A-Za-z0-9_-]+)$/, // Matches just the ID
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match?.[1]) return match[1];
    }

    return null;
  };

  const fetchReelMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      const reelId = extractReelId(reelUrl);
      if (!reelId) {
        throw new Error("Invalid Instagram reel URL format");
      }

      const normalizedUrl = `https://www.instagram.com/reel/${reelId}/`;
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
        maxRequestRetries: 3,
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
        timeout: 60,
      });

      const { items } = await client.dataset(run.defaultDatasetId).listItems();

      if (!items?.[0]) {
        throw new Error("No data found for this reel");
      }

      const reelData = items[0] as unknown as ApifyReelData;
      if (
        !reelData.likesCount ||
        !reelData.commentsCount ||
        !reelData.videoPlayCount
      ) {
        throw new Error("Invalid reel data received");
      }

      console.log("Fetched reel data:", reelData);

      const comments = reelData.comments || [];
      console.log("Found comments:", comments);

      setMetrics({
        likes: reelData.likesCount || 0,
        comments: reelData.commentsCount || 0,
        views: reelData.videoPlayCount || 0,
        timestamp: reelData.timestamp || new Date().toISOString(),
        title: reelData.caption || "No caption available",
        top_comments: comments.slice(0, 5).map((comment) => ({
          text: comment.text || "",
          author: comment.ownerUsername || "Unknown",
          timestamp: comment.timestamp || new Date().toISOString(),
          likes: comment.likesCount || 0,
        })),
      });
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
    <div className="w-full max-w-3xl mx-auto p-4">
      <div className="flex flex-row items-center justify-center gap-2 mb-6">
        <Input
          placeholder="Enter Instagram reel URL"
          value={reelUrl}
          onChange={(e) => setReelUrl(e.target.value)}
        />
        <Button onClick={fetchReelMetrics} disabled={loading || !reelUrl}>
          Confirm
        </Button>
      </div>

      {error && <div className="text-red-500 p-4">{error}</div>}

      {loading && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
        </div>
      )}

      {metrics && (
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle
              className="text-lg text-center truncate"
              title={metrics.title}
            >
              {metrics.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Views</div>
                <div className="font-semibold">
                  {formatNumber(metrics.views)}
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Likes</div>
                  <div className="font-semibold">
                    {formatNumber(metrics.likes)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Comments</div>
                  <div className="font-semibold">
                    {formatNumber(metrics.comments)}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-sm text-muted-foreground font-medium">
                Top Comments
              </div>
              {metrics.top_comments.length > 0 ? (
                metrics.top_comments.map((comment, index) => (
                  <div key={index} className="border-b border-border pb-3">
                    <div className="flex items-start justify-between">
                      <div className="font-medium text-sm">
                        {comment.author}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(comment.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-sm mt-1">{comment.text}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatNumber(comment.likes)} likes
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground italic">
                  No comments available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
