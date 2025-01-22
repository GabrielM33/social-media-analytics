"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import YoutubeData from "@/components/YoutubeData";
//import InstagramData from "@/components/InstagramData";
// import TikTokData from "@/components/TikTokData";

export default function InputBar() {
  const [url, setUrl] = useState("");
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);
  //const [instagramVideoId, setInstagramVideoId] = useState<string | null>(null);
  /*const [tiktokVideoId, setTiktokVideoId] = useState<string | null>(null); */
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
    //setInstagramVideoId(null);
    /*setTiktokVideoId(null); */

    try {
      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        const extractedVideoId = extractYoutubeVideoId(url);
        console.log("Extracted YouTube videoId:", extractedVideoId);

        if (extractedVideoId) {
          setYoutubeVideoId(extractedVideoId);
        } else {
          setError("Invalid YouTube URL. Please check the URL and try again.");
        }
      } else if (url.includes("instagram.com")) {
        const extractedVideoId = extractInstagramVideoId(url);
        console.log("Extracted Instagram videoId:", extractedVideoId);

        if (extractedVideoId) {
          //setInstagramVideoId(extractedVideoId);
        } else {
          setError(
            "Invalid Instagram URL. Please check the URL and try again."
          );
        }
      } else if (url.includes("tiktok.com")) {
        const extractedVideoId = extractTikTokVideoId(url);
        console.log("Extracted TikTok videoId:", extractedVideoId);

        if (extractedVideoId) {
          /*setTiktokVideoId(extractedVideoId); */
        } else {
          setError("Invalid TikTok URL. Please check the URL and try again.");
        }
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

  const extractInstagramVideoId = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      let videoId = null;

      if (
        urlObj.hostname === "www.instagram.com" ||
        urlObj.hostname === "instagram.com"
      ) {
        // Handle reel URLs: instagram.com/reel/[videoId] or instagram.com/reels/[videoId]
        if (
          urlObj.pathname.startsWith("/reel/") ||
          urlObj.pathname.startsWith("/reels/")
        ) {
          videoId = urlObj.pathname.split("/")[2];
        }
        // Handle post URLs: instagram.com/p/[videoId]
        else if (urlObj.pathname.startsWith("/p/")) {
          videoId = urlObj.pathname.split("/p/")[1].split("/")[0];
        }
      }

      console.log("Parsed Instagram URL:", urlObj.toString());
      console.log("Found Instagram videoId:", videoId);

      return videoId;
    } catch (error) {
      console.error("Error parsing Instagram URL:", error);
      return null;
    }
  };

  const extractTikTokVideoId = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      let videoId = null;

      // Handle various TikTok URL formats
      if (
        urlObj.hostname === "vm.tiktok.com" ||
        urlObj.hostname === "vt.tiktok.com"
      ) {
        // Short URL format
        videoId = urlObj.pathname.slice(1);
      } else if (
        urlObj.hostname === "www.tiktok.com" ||
        urlObj.hostname === "tiktok.com"
      ) {
        // Regular URL format
        const pathParts = urlObj.pathname.split("/");
        const videoIndex = pathParts.indexOf("video");
        if (videoIndex !== -1 && pathParts[videoIndex + 1]) {
          videoId = pathParts[videoIndex + 1];
        }
      }

      console.log("Parsed TikTok URL:", urlObj.toString());
      console.log("Found TikTok videoId:", videoId);

      return videoId;
    } catch (error) {
      console.error("Error parsing TikTok URL:", error);
      return null;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
      <form onSubmit={handleUrlSubmit} className="flex gap-2">
        <Input
          type="url"
          placeholder="Enter YouTube, Instagram, or TikTok URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Loading..." : "Analyze"}
        </Button>
      </form>

      {error && <div className="text-red-500">{error}</div>}

      <div className="flex flex-wrap gap-4">
        {youtubeVideoId && <YoutubeData videoId={youtubeVideoId} />}
        {/*{instagramVideoId && <InstagramData videoId={instagramVideoId} />}*/}
        {/*{tiktokVideoId && <TikTokData videoId={tiktokVideoId} />}*/}
      </div>
    </div>
  );
}
