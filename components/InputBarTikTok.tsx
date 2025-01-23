import { useState } from "react";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

interface InputBarTikTokProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export default function InputBarTikTok({
  onSubmit,
  isLoading,
}: InputBarTikTokProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      toast.error("Please enter a TikTok video URL");
      return;
    }

    try {
      onSubmit(url.trim());
      setUrl("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="url"
          placeholder="Enter TikTok video URL (e.g., https://www.tiktok.com/@username/video/1234567890)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isLoading}
          className="flex-1"
        />
        <button
          type="submit"
          disabled={isLoading}
          className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors
            ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isLoading ? "Loading..." : "Analyze"}
        </button>
      </form>
    </div>
  );
}
