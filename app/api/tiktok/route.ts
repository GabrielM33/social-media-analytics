/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://foundermode.bio";
const REDIRECT_URI = `${BASE_URL}/api/tiktok/callback`;

// Get auth URL
export async function GET() {
  const params = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY || "",
    response_type: "code",
    scope: "video.list",
    redirect_uri: REDIRECT_URI,
    state: "state",
    test_app: "1",
  });

  return NextResponse.json({
    authUrl: `https://www.tiktok.com/v2/auth/authorize?${params}`,
  });
}

// Handle auth callback and get videos
export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: "Code required" }, { status: 400 });
    }

    // Exchange code for token
    const tokenResponse = await axios.post(
      "https://open.tiktokapis.com/v2/oauth/token/",
      {
        client_key: process.env.TIKTOK_CLIENT_KEY,
        client_secret: process.env.TIKTOK_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: REDIRECT_URI,
        test_app: "1",
      }
    );

    const accessToken = tokenResponse.data?.data?.access_token;
    if (!accessToken) {
      return NextResponse.json(
        { error: "Failed to get access token" },
        { status: 401 }
      );
    }

    // Get videos
    const videosResponse = await axios.post(
      "https://open.tiktokapis.com/v2/video/list/",
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
        test_app: "1",
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json({
      videos: videosResponse.data?.data?.videos || [],
    });
  } catch (error: any) {
    console.error("TikTok API error:", error.response?.data || error.message);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
