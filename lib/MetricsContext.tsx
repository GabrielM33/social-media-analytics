"use client";

import React, { createContext, useContext, useState } from "react";

interface YouTubeComment {
  text: string;
  author: string;
  publishedAt: string;
  likeCount: number;
}

interface TikTokComment {
  text: string;
  author: string;
  timestamp: string | null;
  likes: number;
}

interface InstagramComment {
  text: string;
  author: string;
  timestamp: string;
  likes: number;
}

interface BasePlatformMetrics {
  views: number;
  likes: number;
  comments: number;
}

interface YouTubeMetrics extends BasePlatformMetrics {
  top_comments?: YouTubeComment[];
}

interface TikTokMetrics extends BasePlatformMetrics {
  commentsList?: TikTokComment[];
}

interface InstagramMetrics extends BasePlatformMetrics {
  top_comments?: InstagramComment[];
}

interface MetricsContextType {
  youtubeMetrics: YouTubeMetrics | null;
  tiktokMetrics: TikTokMetrics | null;
  instagramMetrics: InstagramMetrics | null;
  setYoutubeMetrics: (metrics: YouTubeMetrics | null) => void;
  setTiktokMetrics: (metrics: TikTokMetrics | null) => void;
  setInstagramMetrics: (metrics: InstagramMetrics | null) => void;
}

const MetricsContext = createContext<MetricsContextType | undefined>(undefined);

export function MetricsProvider({ children }: { children: React.ReactNode }) {
  const [youtubeMetrics, setYoutubeMetrics] = useState<YouTubeMetrics | null>(
    null
  );
  const [tiktokMetrics, setTiktokMetrics] = useState<TikTokMetrics | null>(
    null
  );
  const [instagramMetrics, setInstagramMetrics] =
    useState<InstagramMetrics | null>(null);

  return (
    <MetricsContext.Provider
      value={{
        youtubeMetrics,
        tiktokMetrics,
        instagramMetrics,
        setYoutubeMetrics,
        setTiktokMetrics,
        setInstagramMetrics,
      }}
    >
      {children}
    </MetricsContext.Provider>
  );
}

export function useMetrics() {
  const context = useContext(MetricsContext);
  if (context === undefined) {
    throw new Error("useMetrics must be used within a MetricsProvider");
  }
  return context;
}
