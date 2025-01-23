"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useMetrics } from "@/lib/MetricsContext";

interface AggregateMetrics {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
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

  const metrics = calculateTotalMetrics();
  const formatNumber = (num: number) => num.toLocaleString();

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
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Total Views</div>
              <div className="font-semibold">
                {formatNumber(metrics.totalViews)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
