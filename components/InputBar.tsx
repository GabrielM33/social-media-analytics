"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import YoutubeData from "@/components/YoutubeData";

export default function InputBar() {
  const [url, setUrl] = useState("");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted with URL:", url);

    if (!url) {
      setError("Please enter a URL");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        const extractedVideoId = extractYoutubeVideoId(url);
        console.log("Extracted videoId:", extractedVideoId);

        if (extractedVideoId) {
          setVideoId(extractedVideoId);
        } else {
          setError("Invalid YouTube URL. Please check the URL and try again.");
        }
      } else if (url.includes("instagram.com")) {
        console.log("Instagram URL detected");
        setError("Instagram integration coming soon!");
      } else if (url.includes("tiktok.com")) {
        console.log("TikTok URL detected");
        setError("TikTok integration coming soon!");
      } else {
        setError("Please enter a valid YouTube, Instagram, or TikTok URL");
      }
    } catch (error) {
      console.error("Error processing URL:", error);
      setError("Failed to process URL. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const extractYoutubeVideoId = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      let videoId = null;

      if (urlObj.hostname === "youtu.be") {
        videoId = urlObj.pathname.slice(1);
      } else if (
        urlObj.hostname === "www.youtube.com" ||
        urlObj.hostname === "youtube.com"
      ) {
        videoId = urlObj.searchParams.get("v");
      }

      console.log("Parsed URL:", urlObj.toString());
      console.log("Found videoId:", videoId);

      return videoId;
    } catch (error) {
      console.error("Error parsing URL:", error);
      return null;
    }
  };

  return (
    <div className="w-full max-w-xl space-y-4">
      <form onSubmit={handleUrlSubmit} className="flex gap-2">
        <Input
          type="url"
          placeholder="Paste YouTube, Instagram, or TikTok URL"
          value={url}
          onChange={(e) => {
            console.log("Input changed:", e.target.value);
            setUrl(e.target.value);
          }}
          className="flex-1"
        />
        <Button
          type="submit"
          disabled={isLoading}
          onClick={() => console.log("Button clicked")}
        >
          {isLoading ? "Loading..." : "Analyze"}
        </Button>
      </form>
      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      {videoId && (
        <div className="mt-6">
          <YoutubeData videoId={videoId} />
        </div>
      )}
    </div>
  );
}
