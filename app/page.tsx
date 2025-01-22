"use client";

// import { Suspense } from "react";
import InputBarYoututbe from "@/components/InputBarYoututbe";
import YoutubeData from "@/components/YoutubeData";
//import InputBarTikTok from "@/components/InputBarTikTok";
// import TikTokData from "@/components/TikTokData";
import AggregateData from "@/components/AggregateData";
import TikTokLogin from "@/components/TikTokLogin";
import { useState } from "react";

/*
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
*/

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleTikTokAuthSuccess = () => {
    setIsAuthenticated(true);
    // You can add additional logic here after successful authentication
  };

  //const [tiktokData, setTiktokData] = useState<TikTokMetrics | null>(null);
  //const [isTikTokLoading, setIsTikTokLoading] = useState(false);
  //const [tiktokError, setTiktokError] = useState<string | null>(null);

  /*  
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
*/

  return (
    <div className="flex flex-col items-center justify-center py-10">
      <h1 className="text-4xl font-bold text-center">
        Social Media API Project
      </h1>
      <div className="p-10 w-full max-w-4xl">
        <div className="flex justify-center">
          {!isAuthenticated ? (
            <TikTokLogin onAuthSuccess={handleTikTokAuthSuccess} />
          ) : (
            <div className="text-green-600 font-medium mb-4">
              ✓ Connected to TikTok
            </div>
          )}
        </div>
        <div className="space-y-8">
          {/* TikTok Section */}
          {isAuthenticated && (
            <section>
              <h2 className="text-2xl font-semibold mb-4">TikTok Analytics</h2>
              {/* TikTok content will be enabled when authentication is implemented */}
            </section>
          )}

          {/* YouTube Section */}
          <section>
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
