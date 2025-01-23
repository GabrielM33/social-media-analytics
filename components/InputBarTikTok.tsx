"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ApifyClient } from "apify-client";

interface VideoMetrics {
  title: string;
  likes: number;
  comments: number;
  views: number;
  timestamp: string;
  top_comments: CommentData[];
}

interface CommentData {
  text: string;
  author: string;
  timestamp: string;
  likes: number;
}

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
  comments?: Array<{
    text?: string;
    author?: string;
    uniqueId?: string;
    createTime?: number;
    diggCount?: number;
  }>;
}

const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

const client = new ApifyClient({
  token: process.env.NEXT_PUBLIC_APIFY_API_TOKEN,
});

export default function InputBarTiktok() {
  const [videoUrl, setVideoUrl] = useState("");
  const [metrics, setMetrics] = useState<VideoMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async () => {
    if (!videoUrl) {
      setError("Please enter a TikTok URL");
      return;
    }

    try {
      setLoading(true);
      setError(null);

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
      console.log("Raw TikTok data:", items);

      if (!items?.[0]) {
        throw new Error("No data found for this video");
      }

      const tiktokData = items[0] as TikTokApiResponse;

      // Debug logging for title fields
      console.log("Title fields in response:", {
        title: tiktokData.title,
        videoTitle: tiktokData.videoTitle,
        desc: tiktokData.desc,
        description: tiktokData.description,
        text: tiktokData.text,
      });

      // Transform the data into our metrics format
      const transformedMetrics: VideoMetrics = {
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
        top_comments: (tiktokData.comments || [])
          .slice(0, 5)
          .map((comment) => ({
            text: comment.text || "",
            author: comment.author || comment.uniqueId || "Unknown",
            timestamp: new Date((comment.createTime || 0) * 1000).toISOString(),
            likes: comment.diggCount || 0,
          })),
      };

      setMetrics(transformedMetrics);
    } catch (err) {
      console.error("Error fetching TikTok data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch video data"
      );
    } finally {
      setLoading(false);
    }
  };

  const MetricItem = ({ label, value }: { label: string; value: number }) => (
    <div className="text-center">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="font-semibold">{formatNumber(value)}</div>
    </div>
  );

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <div className="flex flex-row items-center justify-center gap-2 mb-6">
        <Input
          placeholder="Enter TikTok video URL"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
        />
        <Button onClick={handleFetch} disabled={loading || !videoUrl}>
          {loading ? "Loading..." : "Confirm"}
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
              <MetricItem label="Views" value={metrics.views} />
              <MetricItem label="Likes" value={metrics.likes} />
              <MetricItem label="Comments" value={metrics.comments} />
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
