"use client";

import React, { createContext, useContext, useState } from "react";

interface PlatformMetrics {
  views: number;
  likes: number;
  comments: number;
}

interface MetricsContextType {
  youtubeMetrics: PlatformMetrics | null;
  tiktokMetrics: PlatformMetrics | null;
  instagramMetrics: PlatformMetrics | null;
  setYoutubeMetrics: (metrics: PlatformMetrics | null) => void;
  setTiktokMetrics: (metrics: PlatformMetrics | null) => void;
  setInstagramMetrics: (metrics: PlatformMetrics | null) => void;
}

const MetricsContext = createContext<MetricsContextType | undefined>(undefined);

export function MetricsProvider({ children }: { children: React.ReactNode }) {
  const [youtubeMetrics, setYoutubeMetrics] = useState<PlatformMetrics | null>(
    null
  );
  const [tiktokMetrics, setTiktokMetrics] = useState<PlatformMetrics | null>(
    null
  );
  const [instagramMetrics, setInstagramMetrics] =
    useState<PlatformMetrics | null>(null);

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
