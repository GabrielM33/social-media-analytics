"use client";

import { useState } from "react";
import { Input } from "./ui/input";

interface InputBarProps {
  onSubmit: (videoId: string) => void;
  isLoading?: boolean;
}

export default function InputBar({
  onSubmit,
  isLoading = false,
}: InputBarProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const extractVideoId = (url: string): string | null => {
    // Match Instagram Reels URL patterns
    const patterns = [
      /instagram\.com\/reels?\/([A-Za-z0-9_-]+)/i,
      /instagram\.com\/p\/([A-Za-z0-9_-]+)/i,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!url.trim()) {
      setError("Please enter an Instagram Reels URL");
      return;
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      setError("Invalid Instagram Reels URL format");
      return;
    }

    onSubmit(videoId);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl space-y-2">
      <div className="flex gap-2">
        <Input
          type="url"
          placeholder="Enter Instagram Reels URL (e.g., https://www.instagram.com/reels/DDUVakdtlvP/)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isLoading}
          className="flex-1"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Loading..." : "Analyze"}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </form>
  );
}
