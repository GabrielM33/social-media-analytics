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

    const params = {
      client_key: process.env.TIKTOK_CLIENT_KEY,
      redirect_uri: REDIRECT_URI,
      scope: "video.list,user.info.basic",
      response_type: "code",
      state: Math.random().toString(36).substring(7),
      test_app: "1",
    };

    console.log("Auth URL parameters:", {
      ...params,
      client_key: "[REDACTED]",
    });

    const authUrl = `https://www.tiktok.com/v2/auth/authorize?${new URLSearchParams(
      params
    )}`;

    console.log(
      "Generated auth URL (with redacted client_key):",
      authUrl.replace(process.env.TIKTOK_CLIENT_KEY || "", "[REDACTED]")
    );

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
    if (!process.env.TIKTOK_CLIENT_KEY || !process.env.TIKTOK_CLIENT_SECRET) {
      throw new Error("Missing TikTok API credentials");
    }

    console.log("Attempting to exchange code for access token");

    const tokenRequestBody = {
      client_key: process.env.TIKTOK_CLIENT_KEY,
      client_secret: process.env.TIKTOK_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: REDIRECT_URI,
      test_app: "1",
    };

    console.log("Token request body:", {
      ...tokenRequestBody,
      client_secret: "[REDACTED]",
    });

    const response = await axios.post(
      "https://open.tiktokapis.com/v2/oauth/token/",
      tokenRequestBody,
      {
        headers: {
          "Cache-Control": "no-cache",
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Raw token response:", response.data);

    if (!response.data) {
      throw new Error("Empty response from token endpoint");
    }

    // For sandbox mode, the response might be nested differently
    let accessToken = null;
    const responseData = response.data;

    if (responseData.access_token) {
      accessToken = responseData.access_token;
    } else if (responseData.data?.access_token) {
      accessToken = responseData.data.access_token;
    } else if (responseData.token) {
      accessToken = responseData.token;
    } else if (responseData.data?.token) {
      accessToken = responseData.data.token;
    }

    if (!accessToken) {
      console.error("Token response structure:", {
        hasData: !!responseData,
        topLevelKeys: Object.keys(responseData),
        nestedDataKeys: responseData.data ? Object.keys(responseData.data) : [],
        fullResponse: responseData,
      });
      throw new Error("No access token in response");
    }

    console.log("Successfully extracted access token");
    return accessToken;
  } catch (error: any) {
    console.error("Token exchange error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      endpoint: "https://open.tiktokapis.com/v2/oauth/token/",
      redirectUri: REDIRECT_URI,
      clientKeyPresent: !!process.env.TIKTOK_CLIENT_KEY,
      clientSecretPresent: !!process.env.TIKTOK_CLIENT_SECRET,
      code: code ? "present" : "missing",
    });

    if (error.response?.data?.error) {
      const errorData = error.response.data.error;
      throw new Error(
        `TikTok Auth Error: ${
          errorData.message || errorData.code || JSON.stringify(errorData)
        }`
      );
    }
    throw new Error(error.message || "Failed to get access token");
  }
}

// Third step: Get user videos
async function getUserVideos(accessToken: string): Promise<TikTokVideo[]> {
  try {
    if (!accessToken) {
      throw new Error("Access token is required");
    }

    console.log(
      "Fetching videos with access token:",
      accessToken ? `${accessToken.slice(0, 10)}...` : "undefined"
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
        test_app: "1",
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data) {
      throw new Error("Empty response from TikTok API");
    }

    console.log("Video API Response structure:", {
      hasData: !!response.data,
      dataKeys: Object.keys(response.data),
      videosArray: response.data.data?.videos ? "present" : "missing",
    });

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

    console.log(
      "Processing request with code:",
      code ? `${code.slice(0, 10)}...` : "undefined"
    );

    const accessToken = await getAccessToken(code);

    if (!accessToken) {
      throw new Error("Failed to obtain access token");
    }

    console.log("Access token obtained successfully");

    const videos = await getUserVideos(accessToken);
    console.log(`Successfully fetched ${videos.length} videos`);

    return NextResponse.json({ videos });
  } catch (error: any) {
    const errorDetails = {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status || 500,
    };

    console.error("Error processing request:", errorDetails);

    return NextResponse.json(
      { error: error.message || "Failed to process request" },
      { status: errorDetails.status }
    );
  }
}
