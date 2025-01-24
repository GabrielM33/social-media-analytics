"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useMetrics } from "@/lib/MetricsContext";

interface VideoStats {
  title: string;
  views: string;
  likes: string;
  comments: string;
  top_comments?: Array<{
    id: string;
    text: string;
    author: string;
    likeCount: number;
    publishedAt: string;
  }>;
  error?: string;
  commentsDisabled?: boolean;
}

const formatNumber = (num: number) => num.toLocaleString();

export default function InputBar() {
  const [url, setUrl] = useState("");
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<VideoStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const { setYoutubeMetrics } = useMetrics();

  useEffect(() => {
    if (stats) {
      setYoutubeMetrics({
        views: parseInt(stats.views) || 0,
        likes: parseInt(stats.likes) || 0,
        comments: parseInt(stats.comments) || 0,
        top_comments: stats.top_comments || [],
      });
    } else {
      setYoutubeMetrics(null);
    }
  }, [stats, setYoutubeMetrics]);

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted with URL:", url);

    if (!url) {
      setError("Please enter a URL");
      return;
    }

    setError(null);
    setIsLoading(true);
    setYoutubeVideoId(null);

    try {
      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        const extractedVideoId = extractYoutubeVideoId(url);
        console.log("Extracted YouTube videoId:", extractedVideoId);

        if (extractedVideoId) {
          setYoutubeVideoId(extractedVideoId);
        } else {
          setError("Invalid YouTube URL. Please check the URL and try again.");
        }
      } else {
        setError("Please enter a valid YouTube URL");
      }
    } catch (error) {
      console.error("Error processing URL:", error);
      setError("Failed to process URL. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const extractYoutubeVideoId = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      let videoId = null;

      if (urlObj.hostname === "youtu.be") {
        videoId = urlObj.pathname.slice(1);
      } else if (
        urlObj.hostname === "www.youtube.com" ||
        urlObj.hostname === "youtube.com"
      ) {
        if (urlObj.pathname.startsWith("/shorts/")) {
          videoId = urlObj.pathname.split("/shorts/")[1];
        } else {
          videoId = urlObj.searchParams.get("v");
        }
      }

      console.log("Parsed YouTube URL:", urlObj.toString());
      console.log("Found YouTube videoId:", videoId);

      return videoId;
    } catch (error) {
      console.error("Error parsing YouTube URL:", error);
      return null;
    }
  };

  useEffect(() => {
    if (!youtubeVideoId) {
      setStatsError(null);
      return;
    }

    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        setStatsError(null);

        const response = await fetch(`/api/youtube?videoId=${youtubeVideoId}`);
        const data: VideoStats = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch video stats");
        }

        setStats(data);
      } catch (err) {
        setStatsError(
          err instanceof Error ? err.message : "Failed to fetch video stats"
        );
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
    // Refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [youtubeVideoId]);

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <div className="flex flex-row items-center justify-center gap-2 mb-6">
        <Input
          placeholder="Enter a YouTube video URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <Button onClick={handleUrlSubmit} disabled={isLoading || !url}>
          Confirm
        </Button>
      </div>

      {error && <div className="text-red-500 p-4">{error}</div>}

      {statsLoading && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
        </div>
      )}

      {statsError && <div className="text-red-500 p-4">{statsError}</div>}

      {stats && (
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle
              className="text-lg text-center truncate"
              title={stats.title}
            >
              {stats.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Views</div>
                <div className="font-semibold">
                  {formatNumber(parseInt(stats.views))}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Likes</div>
                <div className="font-semibold">
                  {formatNumber(parseInt(stats.likes))}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Comments</div>
                <div className="font-semibold">
                  {formatNumber(parseInt(stats.comments))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-sm text-muted-foreground font-medium">
                Top Comments
              </div>
              {stats.commentsDisabled ? (
                <div className="text-sm text-muted-foreground italic">
                  Comments are disabled for this video
                </div>
              ) : stats.top_comments?.length ? (
                stats.top_comments.map((comment) => (
                  <div key={comment.id} className="border-b border-border pb-3">
                    <div className="flex items-start justify-between">
                      <div className="font-medium text-sm">
                        {comment.author}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(comment.publishedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-sm mt-1">{comment.text}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatNumber(comment.likeCount)} likes
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
