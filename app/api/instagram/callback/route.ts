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

    const { access_token, user_id } = await response.json();

    // Create a response with cookies to store the access token securely
    const response_url = new URL("/?success=true", request.url);
    response_url.searchParams.set("instagram_user_id", user_id);

    const finalResponse = NextResponse.redirect(response_url);

    // Set a secure HTTP-only cookie with the access token
    finalResponse.cookies.set("instagram_access_token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return finalResponse;
  } catch (error) {
    console.error("Instagram callback error:", error);
    return NextResponse.redirect(new URL("/?error=server_error", request.url));
  }
}
