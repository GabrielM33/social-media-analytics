"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useMetrics } from "@/lib/MetricsContext";

interface VideoMetrics {
  title: string;
  likes: number;
  comments: number;
  views: number;
  timestamp: string;
  commentsList: CommentData[];
}

interface CommentData {
  text: string;
  author: string;
  timestamp: string | null;
  likes: number;
}

const formatNumber = (num: number | undefined | null): string => {
  return num?.toLocaleString() || "0";
};

export default function InputBarTikTok() {
  const [videoUrl, setVideoUrl] = useState("");
  const [metrics, setMetrics] = useState<VideoMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setTiktokMetrics } = useMetrics();

  useEffect(() => {
    if (metrics) {
      setTiktokMetrics({
        views: metrics.views,
        likes: metrics.likes,
        comments: metrics.comments,
      });
    } else {
      setTiktokMetrics(null);
    }
  }, [metrics, setTiktokMetrics]);

  const handleFetch = async () => {
    if (!videoUrl) {
      setError("Please enter a TikTok URL");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/tiktok", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch video data");
      }

      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      console.error("Error fetching TikTok data:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch data");
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
          Confirm
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
        </div>
      )}

      {error && <div className="text-red-500 p-4">{error}</div>}
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
              {metrics.commentsList.length > 0 ? (
                metrics.commentsList.map((comment, index) => (
                  <div key={index} className="border-b border-border pb-3">
                    <div className="flex items-start justify-between">
                      <div className="font-medium text-sm">
                        {comment.author}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {comment.timestamp
                          ? new Date(comment.timestamp).toLocaleDateString()
                          : "No date"}
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
