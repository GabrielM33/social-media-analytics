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
      part: ["statistics"],
      id: [videoId],
    });

    if (!response.data.items?.[0]?.statistics) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const views = response.data.items[0].statistics.viewCount;

    // Cache the response for 1 hour
    return NextResponse.json(
      { views },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    console.error("YouTube API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch video views" },
      { status: 500 }
      // add hot toast
    );
  }
}
