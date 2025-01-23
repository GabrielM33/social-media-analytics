import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.redirect(new URL("/?error=no_code", request.url));
    }

    // Exchange the authorization code for an access token
    const response = await fetch(
      "https://api.instagram.com/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: process.env.INSTAGRAM_CLIENT_ID || "",
          client_secret: process.env.INSTAGRAM_CLIENT_SECRET || "",
          grant_type: "authorization_code",
          redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/instagram/callback`,
          code,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Instagram token exchange error:", error);
      return NextResponse.redirect(
        new URL("/?error=token_exchange", request.url)
      );
    }

    const data = await response.json();

    // Here you would typically:
    // 1. Store the access token securely
    // 2. Fetch user data if needed
    // 3. Create a session or handle authentication

    // Redirect back to the main page with success
    return NextResponse.redirect(new URL("/?success=true", request.url));
  } catch (error) {
    console.error("Instagram callback error:", error);
    return NextResponse.redirect(new URL("/?error=server_error", request.url));
  }
}
