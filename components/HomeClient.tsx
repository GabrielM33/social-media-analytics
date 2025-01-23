"use client";

import InputBarYoututbe from "@/components/InputBarYoututbe";
import YoutubeData from "@/components/YoutubeData";
import TikTokData from "@/components/TikTokData";
import TikTokLogin from "@/components/TikTokLogin";
import InstagramLogin from "@/components/InstagramLogin";
import AggregateData from "@/components/AggregateData";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

interface TikTokVideo {
  id: string;
  title: string;
  cover_url: string;
  share_url: string;
  video_description: string;
  duration: number;
  create_time: number;
}

export default function HomeClient() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tiktokVideos, setTiktokVideos] = useState<TikTokVideo[] | null>(null);
  const [isTikTokLoading, setIsTikTokLoading] = useState(false);
  const [tiktokError, setTiktokError] = useState<string | undefined>();
  const [tikTokAuthCode, setTikTokAuthCode] = useState<string | null>(() => {
    // Initialize from localStorage if available
    if (typeof window !== "undefined") {
      const savedCode = localStorage.getItem("tiktokAuthCode");
      return savedCode;
    }
    return null;
  });
  const searchParams = useSearchParams();

  // Check for auth code in URL on mount and fetch videos if authenticated
  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      handleTikTokAuthSuccess(code);
    }
  }, [searchParams]);

  // Set initial authentication state based on auth code
  useEffect(() => {
    setIsAuthenticated(!!tikTokAuthCode);
    if (tikTokAuthCode) {
      fetchTikTokVideos(tikTokAuthCode);
    }
  }, [tikTokAuthCode]);

  const handleTikTokAuthSuccess = (code: string) => {
    setIsAuthenticated(true);
    setTikTokAuthCode(code);
    if (typeof window !== "undefined") {
      localStorage.setItem("tiktokAuthCode", code);
    }
  };

  const fetchTikTokVideos = async (code: string) => {
    setIsTikTokLoading(true);
    setTiktokError(undefined);

    try {
      const response = await fetch("/api/tiktok", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch TikTok videos");
      }

      const data = await response.json();
      setTiktokVideos(data.videos);
    } catch (err) {
      setTiktokError(err instanceof Error ? err.message : "An error occurred");
      setTiktokVideos(null);
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
              <h2 className="text-2xl font-semibold mb-4">
                Your TikTok Videos
              </h2>
              <TikTokData
                data={tiktokVideos}
                isLoading={isTikTokLoading}
                error={tiktokError}
              />
            </section>
          )}
          {/* Instagram Section */}
          <section className="flex justify-center py-4">
            <InstagramLogin />
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
