import { useState } from "react";

export default function InstagramLogin() {
  const [isLoading, setIsLoading] = useState(false);

  const handleInstagramLogin = async () => {
    setIsLoading(true);
    try {
      const clientId = process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID;
      const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/instagram/callback`;
      const scopes = [
        "instagram_business_basic",
        "instagram_business_manage_messages",
        "instagram_business_manage_comments",
        "instagram_business_content_publish",
        "instagram_business_manage_insights",
      ].join("%2C");

      const authUrl = `https://www.instagram.com/oauth/authorize?enable_fb_login=0&force_authentication=1&client_id=${clientId}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&response_type=code&scope=${scopes}`;

      window.location.href = authUrl;
    } catch (error) {
      console.error("Instagram business login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleInstagramLogin}
      disabled={isLoading}
      className={`flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:from-purple-700 hover:to-pink-700 transition-all
        ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
      {isLoading ? "Connecting..." : "Connect Instagram Business"}
    </button>
  );
}
