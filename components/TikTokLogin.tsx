import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

interface TikTokLoginProps {
  onAuthSuccess: (code: string) => void;
}

function TikTokLoginContent({ onAuthSuccess }: TikTokLoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();

  // Handle the OAuth callback
  useEffect(() => {
    const error = searchParams.get("error");
    const code = searchParams.get("code");

    if (error) {
      toast.error(decodeURIComponent(error));
    } else if (code) {
      onAuthSuccess(code);
      toast.success("Successfully connected to TikTok!");
    }
  }, [searchParams, onAuthSuccess]);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/tiktok");
      const { authUrl } = await response.json();
      window.location.href = authUrl;
    } catch (error) {
      toast.error("Failed to initiate TikTok login");
      console.error("TikTok login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogin}
      disabled={isLoading}
      className="flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <span>Connecting...</span>
      ) : (
        <>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0011.14-4.02V9.41a8.16 8.16 0 004.65 1.46V7.43a4.85 4.85 0 01-1.2-.74z" />
          </svg>
          <span>Connect TikTok Account</span>
        </>
      )}
    </button>
  );
}

export default function TikTokLogin(props: TikTokLoginProps) {
  return (
    <Suspense
      fallback={
        <button
          disabled
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-300 text-gray-600 rounded-md cursor-not-allowed"
        >
          <span>Loading...</span>
        </button>
      }
    >
      <TikTokLoginContent {...props} />
    </Suspense>
  );
}
