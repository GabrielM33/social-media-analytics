import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");
    const error_description = url.searchParams.get("error_description");

    // Log the callback data for debugging
    console.log("TikTok callback received:", {
      code,
      state,
      error,
      error_description,
    });

    // Get the base URL without the /api/tiktok/callback part
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://foundermode.bio";

    if (error || !code) {
      console.error("TikTok auth error:", error_description || error);
      return NextResponse.redirect(
        `${baseUrl}?error=${encodeURIComponent(
          error_description || error || "Authorization failed"
        )}`
      );
    }

    // Successful authorization - redirect to the main page with the code
    return NextResponse.redirect(`${baseUrl}?code=${encodeURIComponent(code)}`);
  } catch (error) {
    console.error("Error in TikTok callback:", error);
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://foundermode.bio";
    return NextResponse.redirect(
      `${baseUrl}?error=${encodeURIComponent(
        "An error occurred during authorization"
      )}`
    );
  }
}
