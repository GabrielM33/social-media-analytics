"use client";

import { useState } from "react";
import InputBarYoututbe from "@/components/InputBarYoututbe";
import InputBarTikTok from "@/components/InputBarTikTok";
import YoutubeData from "@/components/YoutubeData";
import TikTokData from "@/components/TikTokData";
import AggregateData from "@/components/AggregateData";

interface TikTokMetrics {
  viewCount: number;
  likeCount: number;
  commentCount: number;
  thumbnail?: string;
  topComments: Array<{
    text: string;
    createTime: string;
    likeCount: number;
  }>;
}

export default function Home() {
  const [tiktokData, setTiktokData] = useState<TikTokMetrics | null>(null);
  const [isTikTokLoading, setIsTikTokLoading] = useState(false);
  const [tiktokError, setTiktokError] = useState<string | null>(null);

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
