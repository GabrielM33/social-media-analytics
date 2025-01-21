"use client";

import { useState, useEffect } from "react";

interface VideoStats {
  title: string;
  views: string;
  likes: string;
  comments: string;
  error?: string;
}

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
    <div className="rounded-xl shadow-lg p-6 max-w-sm w-full">
      <h2 className="text-lg font-semibold mb-4 truncate" title={stats.title}>
        {stats.title}
      </h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-sm text-gray-500">Views</div>
          <div className="font-semibold">
            {Number(stats.views).toLocaleString()}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-500">Likes</div>
          <div className="font-semibold">
            {Number(stats.likes).toLocaleString()}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-500">Comments</div>
          <div className="font-semibold">
            {Number(stats.comments).toLocaleString()}
          </div>
        </div>
      </div>
      <div className="mt-4">
        <div className="text-sm text-gray-500">Comments</div>
        <div className="font-semibold">
          {/* TODO: Add top 5 comments */}
          {stats.comments}
        </div>
      </div>
    </div>
  );
}
