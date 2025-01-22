interface TikTokMetrics {
  viewCount: number;
  likeCount: number;
  commentCount: number;
  topComments: Array<{
    text: string;
    createTime: string;
    likeCount: number;
  }>;
  thumbnail?: string;
}

interface TikTokDataProps {
  data: TikTokMetrics | null;
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
      <div className="w-full max-w-2xl mx-auto mt-8 p-4 bg-white rounded-lg shadow animate-pulse">
        <div className="h-48 bg-gray-200 rounded-md mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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

  if (!data) {
    return null;
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 space-y-6">
      {/* Metrics Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Video Metrics</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Views</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatNumber(data.viewCount)}
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Likes</p>
            <p className="text-2xl font-bold text-red-600">
              {formatNumber(data.likeCount)}
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Comments</p>
            <p className="text-2xl font-bold text-green-600">
              {formatNumber(data.commentCount)}
            </p>
          </div>
        </div>
      </div>

      {/* Top Comments */}
      {data.topComments.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Top Comments</h2>
          <div className="space-y-4">
            {data.topComments.map((comment, index) => (
              <div
                key={index}
                className="border-b last:border-b-0 pb-3 last:pb-0"
              >
                <p className="text-gray-800">{comment.text}</p>
                <div className="flex justify-between mt-2 text-sm text-gray-500">
                  <span>
                    {new Date(comment.createTime).toLocaleDateString()}
                  </span>
                  <span>{formatNumber(comment.likeCount)} likes</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
