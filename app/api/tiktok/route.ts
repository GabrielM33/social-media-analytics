/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import axios from "axios";

const TIKTOK_API_URL = "https://open.tiktokapis.com/v2";
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://foundermode.bio";
const REDIRECT_URI = `${BASE_URL}/api/tiktok/callback`;

interface TikTokVideo {
  id: string;
  title: string;
  cover_url: string;
  share_url: string;
  video_description: string;
  duration: number;
  create_time: number;
}

// First step: Get the authorization URL
export function GET() {
  try {
    if (!process.env.TIKTOK_CLIENT_KEY) {
      console.error("Missing TIKTOK_CLIENT_KEY");
      return NextResponse.json(
        { error: "TikTok API configuration error" },
        { status: 500 }
      );
    }

    const authUrl =
      `https://www.tiktok.com/v2/auth/authorize?` +
      new URLSearchParams({
        client_key: process.env.TIKTOK_CLIENT_KEY,
        redirect_uri: REDIRECT_URI,
        scope: "video.list,user.info.basic",
        response_type: "code",
        state: Math.random().toString(36).substring(7),
      });

    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error("Error generating auth URL:", error);
    return NextResponse.json(
      { error: "Failed to initialize TikTok authentication" },
      { status: 500 }
    );
  }
}

// Second step: Exchange code for access token
async function getAccessToken(code: string): Promise<string> {
  try {
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

    return response.data.access_token;
  } catch (error: any) {
    console.error("Token error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.error?.message || "Failed to get access token"
    );
  }
}

// Third step: Get user videos
async function getUserVideos(accessToken: string): Promise<TikTokVideo[]> {
  try {
    console.log(
      "Fetching videos with access token:",
      accessToken.slice(0, 10) + "..."
    );

    const response = await axios.post(
      `${TIKTOK_API_URL}/video/list/`,
      {
        fields: [
          "id",
          "title",
          "cover_url",
          "share_url",
          "video_description",
          "duration",
          "create_time",
        ],
        max_count: 20,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Video API Response:", response.data);

    if (!response.data.data?.videos) {
      throw new Error("No videos data in response");
    }

    return response.data.data.videos;
  } catch (error: any) {
    console.error("Video fetch error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
    });

    if (error.response?.data?.error?.code) {
      throw new Error(
        `TikTok API Error: ${error.response.data.error.message} (Code: ${error.response.data.error.code})`
      );
    }
    throw new Error(error.message || "Failed to fetch videos");
  }
}

// Handle POST request with authorization code
export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: "No authorization code provided" },
        { status: 400 }
      );
    }

    console.log("Processing request with code:", code.slice(0, 10) + "...");

    const accessToken = await getAccessToken(code);
    console.log("Successfully obtained access token");

    const videos = await getUserVideos(accessToken);
    console.log(`Successfully fetched ${videos.length} videos`);

    return NextResponse.json({ videos });
  } catch (error: any) {
    console.error("Error processing request:", {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
    });

    return NextResponse.json(
      { error: error.message || "Failed to process request" },
      { status: error.response?.status || 500 }
    );
  }
}
