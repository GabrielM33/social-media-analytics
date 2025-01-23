"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import YoutubeData from "@/components/YoutubeData";

export default function InputBar() {
  const [url, setUrl] = useState("");
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);
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
    setYoutubeVideoId(null);

    try {
      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        const extractedVideoId = extractYoutubeVideoId(url);
        console.log("Extracted YouTube videoId:", extractedVideoId);

        if (extractedVideoId) {
          setYoutubeVideoId(extractedVideoId);
        } else {
          setError("Invalid YouTube URL. Please check the URL and try again.");
        }
      } else {
        setError("Please enter a valid YouTube URL");
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
        if (urlObj.pathname.startsWith("/shorts/")) {
          videoId = urlObj.pathname.split("/shorts/")[1];
        } else {
          videoId = urlObj.searchParams.get("v");
        }
      }

      console.log("Parsed YouTube URL:", urlObj.toString());
      console.log("Found YouTube videoId:", videoId);

      return videoId;
    } catch (error) {
      console.error("Error parsing YouTube URL:", error);
      return null;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
      <form onSubmit={handleUrlSubmit} className="flex gap-2">
        <Input
          type="url"
          placeholder="Enter a YouTube video URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Loading..." : "Confirm"}
        </Button>
      </form>

      {error && <div className="text-red-500">{error}</div>}

      <div className="flex flex-wrap gap-4">
        {youtubeVideoId && <YoutubeData videoId={youtubeVideoId} />}
      </div>
    </div>
  );
}
