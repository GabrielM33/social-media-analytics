import { NextResponse } from "next/server";
import { google } from "googleapis";

const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get("videoId");

    if (!videoId) {
      return NextResponse.json(
        { error: "Video ID is required" },
        { status: 400 }
      );
    }

    const response = await youtube.videos.list({
      part: ["statistics", "snippet"],
      id: [videoId],
    });

    if (!response.data.items?.[0]) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const { statistics, snippet } = response.data.items[0];

    if (!statistics) {
      return NextResponse.json(
        { error: "Statistics not found" },
        { status: 404 }
      );
    }

    // Fetch top comments
    const commentsResponse = await youtube.commentThreads.list({
      part: ["snippet"],
      videoId: videoId,
      maxResults: 5,
      order: "relevance",
    });

    const comments =
      commentsResponse.data.items?.map((item) => ({
        id: item.id,
        text: item.snippet?.topLevelComment?.snippet?.textDisplay || "",
        author: item.snippet?.topLevelComment?.snippet?.authorDisplayName || "",
        likeCount: item.snippet?.topLevelComment?.snippet?.likeCount || 0,
        publishedAt: item.snippet?.topLevelComment?.snippet?.publishedAt || "",
      })) || [];

    const data = {
      title: snippet?.title || "",
      views: statistics.viewCount || "0",
      likes: statistics.likeCount || "0",
      top_comments: comments,
    };

    // Cache the response for 1 hour
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("YouTube API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch video data" },
      { status: 500 }
    );
  }
}
