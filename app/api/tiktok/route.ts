/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import axios from "axios";

const TIKTOK_API_URL = "https://open.tiktokapis.com/v2";
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://foundermode.bio";
const REDIRECT_URI = `${BASE_URL}/api/tiktok/callback`;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface TikTokMetrics {
  viewCount: number;
  likeCount: number;
  commentCount: number;
  thumbnail?: string;
}

// First step: Get the authorization URL
export function GET() {
  const authUrl =
    `https://www.tiktok.com/v2/auth/authorize?` +
    new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY!,
      redirect_uri: REDIRECT_URI,
      scope: "video.list,user.info.basic",
      response_type: "code",
      state: Math.random().toString(36).substring(7),
    });

  return NextResponse.json({ authUrl });
}

// Second step: Exchange code for access token
async function getAccessToken(code: string): Promise<string> {
  try {
    console.log("Getting access token with code:", code);
    const response = await axios.post(
      `${TIKTOK_API_URL}/oauth/token/`,
      {
        client_key: process.env.TIKTOK_CLIENT_KEY,
        client_secret: process.env.TIKTOK_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: REDIRECT_URI,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Token response:", response.data);
    return response.data.access_token;
  } catch (error: any) {
    console.error("Token error:", error.response?.data || error);
    throw error;
  }
}

// Third step: Get video metrics
async function getVideoMetrics(videoId: string, accessToken: string) {
  try {
    console.log("Getting video metrics for:", videoId);
    const response = await axios.post(
      `${TIKTOK_API_URL}/video/query/`,
      {
        filters: {
          video_ids: [videoId],
        },
        fields: ["statistics", "cover_url"],
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Video metrics response:", response.data);
    const video = response.data.data.videos[0];
    return {
      viewCount: video.statistics.view_count,
      likeCount: video.statistics.like_count,
      commentCount: video.statistics.comment_count,
      thumbnail: video.cover_url,
    };
  } catch (error: any) {
    console.error("Video metrics error:", error.response?.data || error);
    throw error;
  }
}

// Handle video metrics request
export async function POST(request: Request) {
  try {
    const { url, code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: "Authorization code required. Please authenticate first." },
        { status: 401 }
      );
    }

    const videoId = url.match(/\/video\/(\d+)/)?.[1];
    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid TikTok video URL" },
        { status: 400 }
      );
    }

    const accessToken = await getAccessToken(code);
    const metrics = await getVideoMetrics(videoId, accessToken);

    return NextResponse.json(metrics);
  } catch (error: any) {
    console.error("Error:", error.response?.data || error);
    return NextResponse.json(
      { error: error.response?.data?.error?.message || "API Error" },
      { status: error.response?.status || 500 }
    );
  }
}
