"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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

export default function YoutubeData({
  videoId = "dQw4w9WgXcQ",
}: {
  videoId?: string;
}) {
  const [stats, setStats] = useState<VideoStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/youtube?videoId=${videoId}`);
        const data: VideoStats = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch video stats");
        }

        setStats(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch video stats"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [videoId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (!stats) {
    return null;
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-lg text-center truncate" title={stats.title}>
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
                  <div className="font-medium text-sm">{comment.author}</div>
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
  );
}
