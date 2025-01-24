"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useMetrics } from "@/lib/MetricsContext";

interface AggregateMetrics {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
}

interface Comment {
  text: string;
  author: string;
  timestamp: string | null;
  likes: number;
  platform: string;
}

export default function AggregateData() {
  const { youtubeMetrics, tiktokMetrics, instagramMetrics } = useMetrics();

  const calculateTotalMetrics = (): AggregateMetrics => {
    const total = {
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
    };

    if (youtubeMetrics) {
      total.totalViews += youtubeMetrics.views;
      total.totalLikes += youtubeMetrics.likes;
      total.totalComments += youtubeMetrics.comments;
    }

    if (tiktokMetrics) {
      total.totalViews += tiktokMetrics.views;
      total.totalLikes += tiktokMetrics.likes;
      total.totalComments += tiktokMetrics.comments;
    }

    if (instagramMetrics) {
      total.totalViews += instagramMetrics.views;
      total.totalLikes += instagramMetrics.likes;
      total.totalComments += instagramMetrics.comments;
    }

    return total;
  };

  const getAllComments = (): Comment[] => {
    const allComments: Comment[] = [];

    if (youtubeMetrics?.top_comments) {
      allComments.push(
        ...youtubeMetrics.top_comments.map((comment) => ({
          text: comment.text,
          author: comment.author,
          timestamp: comment.publishedAt,
          likes: comment.likeCount,
          platform: "YouTube",
        }))
      );
    }

    if (tiktokMetrics?.commentsList) {
      allComments.push(
        ...tiktokMetrics.commentsList.map((comment) => ({
          text: comment.text,
          author: comment.author,
          timestamp: comment.timestamp,
          likes: comment.likes,
          platform: "TikTok",
        }))
      );
    }

    if (instagramMetrics?.top_comments) {
      allComments.push(
        ...instagramMetrics.top_comments.map((comment) => ({
          text: comment.text,
          author: comment.author,
          timestamp: comment.timestamp,
          likes: comment.likes,
          platform: "Instagram",
        }))
      );
    }

    return allComments
      .sort((a, b) => (b.likes || 0) - (a.likes || 0))
      .slice(0, 15);
  };

  const metrics = calculateTotalMetrics();
  const formatNumber = (num: number) => num.toLocaleString();
  const comments = getAllComments();

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-lg text-center truncate">
            Total Engagement Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Total Views</div>
              <div className="font-semibold">
                {formatNumber(metrics.totalViews)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Total Likes</div>
              <div className="font-semibold">
                {formatNumber(metrics.totalLikes)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">
                Total Comments
              </div>
              <div className="font-semibold">
                {formatNumber(metrics.totalComments)}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-sm text-muted-foreground font-medium">
              Top Comments Across Platforms
            </div>
            {comments.length > 0 ? (
              comments.map((comment, index) => (
                <div key={index} className="border-b border-border pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-sm">
                        {comment.author}
                      </div>
                      <div className="text-xs bg-muted px-2 py-0.5 rounded">
                        {comment.platform}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {comment.timestamp
                        ? new Date(comment.timestamp).toLocaleDateString()
                        : "No date"}
                    </div>
                  </div>
                  <div className="text-sm mt-1">{comment.text}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatNumber(comment.likes || 0)} likes
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
    </div>
  );
}
