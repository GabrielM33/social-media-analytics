interface TikTokVideo {
  id: string;
  title: string;
  cover_url: string;
  share_url: string;
  video_description: string;
  duration: number;
  create_time: number;
}

interface TikTokDataProps {
  data: TikTokVideo[] | null;
  isLoading: boolean;
  error?: string;
}

export default function TikTokData({
  data,
  isLoading,
  error,
}: TikTokDataProps) {
  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-8 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-gray-600 text-center">No videos found</p>
      </div>
    );
  }

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((video) => (
          <div
            key={video.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <div className="relative">
              <img
                src={video.cover_url}
                alt={video.title}
                className="w-full h-48 object-cover"
              />
              <span className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                {formatDuration(video.duration)}
              </span>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                {video.title}
              </h3>
              <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                {video.video_description}
              </p>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>{formatDate(video.create_time)}</span>
                <a
                  href={video.share_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Watch on TikTok
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
