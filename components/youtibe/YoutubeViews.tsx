"use client";

import { useState, useEffect } from "react";

interface ViewsResponse {
  views?: string;
  error?: string;
}

export default function YoutubeViews({
  videoId = "dQw4w9WgXcQ",
}: {
  videoId?: string;
}) {
  const [views, setViews] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchViews = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/youtube?videoId=${videoId}`);
        const data: ViewsResponse = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch views");
        }

        if (data.views) {
          setViews(Number(data.views).toLocaleString());
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch views");
      } finally {
        setLoading(false);
      }
    };

    fetchViews();
    // Refresh views every 5 minutes
    const interval = setInterval(fetchViews, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [videoId]);

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
        <span>Loading views...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="text-2xl font-bold">Youtube</div>
      <div className="text-lg font-semibold">{views} views</div>
    </div>
  );
}
