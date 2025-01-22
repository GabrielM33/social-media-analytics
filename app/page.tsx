"use client";

import { useState } from "react";
import InputBar from "@/components/InputBar";
import InputBarYoututbe from "@/components/InputBarYoututbe";
import InputBarTikTok from "@/components/InputBarTikTok";
import InstagramData from "@/components/InstagramData";
import YoutubeData from "@/components/YoutubeData";
import TikTokData from "@/components/TikTokData";
import AggregateData from "@/components/AggregateData";

interface InstagramMetrics {
  views: string;
  likes: string;
  comments: string;
  top_comments: Array<{
    id: string;
    text: string;
    author: string;
    likeCount: number;
    publishedAt: string;
  }>;
}

interface TikTokMetrics {
  viewCount: number;
  likeCount: number;
  commentCount: number;
  topComments: Array<{
    text: string;
    createTime: string;
    likeCount: number;
  }>;
  thumbnail?: string;
}

export default function Home() {
  const [instagramData, setInstagramData] = useState<InstagramMetrics | null>(
    null
  );
  const [tiktokData, setTiktokData] = useState<TikTokMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTikTokLoading, setIsTikTokLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tiktokError, setTiktokError] = useState<string | null>(null);

  const handleInstagramSubmit = async (videoId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/instagram?videoId=${videoId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch Instagram data");
      }

      const data = await response.json();
      setInstagramData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setInstagramData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTikTokSubmit = async (url: string) => {
    setIsTikTokLoading(true);
    setTiktokError(null);

    try {
      const response = await fetch("/api/tiktok", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch TikTok data");
      }

      const data = await response.json();
      setTiktokData(data);
    } catch (err) {
      setTiktokError(err instanceof Error ? err.message : "An error occurred");
      setTiktokData(null);
    } finally {
      setIsTikTokLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-10">
      <h1 className="text-4xl font-bold text-center">
        Social Media API Project
      </h1>
      <div className="p-10 w-full max-w-4xl">
        <div className="space-y-8">
          {/* Instagram Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Instagram Analytics</h2>
            <InputBar onSubmit={handleInstagramSubmit} isLoading={isLoading} />
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}
            {instagramData && <InstagramData data={instagramData} />}
          </section>

          {/* TikTok Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">TikTok Analytics</h2>
            <InputBarTikTok
              onSubmit={handleTikTokSubmit}
              isLoading={isTikTokLoading}
            />
            <TikTokData
              data={tiktokData}
              isLoading={isTikTokLoading}
              error={tiktokError || undefined}
            />
          </section>

          {/* YouTube Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">YouTube Analytics</h2>
            <InputBarYoututbe />
            <YoutubeData />
          </section>
        </div>

        <div className="mt-12">
          <AggregateData />
        </div>
      </div>
    </div>
  );
}
