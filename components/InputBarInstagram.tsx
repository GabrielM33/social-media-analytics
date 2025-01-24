"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useMetrics } from "@/lib/MetricsContext";

type ReelMetrics = {
  likes: number;
  comments: number;
  views: number;
  timestamp: string;
  title: string;
  top_comments: Array<{
    text: string;
    author: string;
    timestamp: string;
    likes: number;
  }>;
};

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
        top_comments: metrics.top_comments || [],
      });
    } else {
      setInstagramMetrics(null);
    }
  }, [metrics, setInstagramMetrics]);

  const fetchReelMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/instagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reelUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch reel metrics");
      }

      setMetrics(data);
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
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
        </div>
      )}

      {metrics && <MetricsDisplay metrics={metrics} />}
    </div>
  );
}

const MetricsDisplay = ({ metrics }: { metrics: ReelMetrics }) => (
  <Card className="w-full max-w-3xl mx-auto">
    <CardHeader>
      <CardTitle className="text-lg text-center truncate" title={metrics.title}>
        {metrics.title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Views", value: metrics.views },
          { label: "Likes", value: metrics.likes },
          { label: "Comments", value: metrics.comments },
        ].map(({ label, value }) => (
          <div key={label} className="text-center">
            <div className="text-sm text-muted-foreground">{label}</div>
            <div className="font-semibold">{formatNumber(value)}</div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="text-sm text-muted-foreground font-medium">
          Top Comments
        </div>
        {metrics.top_comments.length > 0 ? (
          metrics.top_comments.map((comment, index) => (
            <CommentCard key={index} comment={comment} />
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

const formatNumber = (num: number) => num.toLocaleString();

const CommentCard = ({
  comment,
}: {
  comment: ReelMetrics["top_comments"][0];
}) => (
  <div className="border-b border-border pb-3">
    <div className="flex items-start justify-between">
      <div className="font-medium text-sm">{comment.author}</div>
      <div className="text-xs text-muted-foreground">
        {new Date(comment.timestamp).toLocaleDateString()}
      </div>
    </div>
    <div className="text-sm mt-1">{comment.text}</div>
    <div className="text-xs text-muted-foreground mt-1">
      {formatNumber(comment.likes)} likes
    </div>
  </div>
);
