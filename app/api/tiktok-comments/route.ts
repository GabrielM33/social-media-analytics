import { ApifyClient } from "apify-client";
import { NextResponse } from "next/server";

// Initialize the ApifyClient with API token
const client = new ApifyClient({
  token: process.env.NEXT_PUBLIC_APIFY_API_TOKEN,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { postURLs } = body;

    if (!postURLs || !Array.isArray(postURLs)) {
      return NextResponse.json(
        { error: "postURLs must be provided as an array" },
        { status: 400 }
      );
    }

    // Prepare Actor input
    const input = {
      postURLs,
      commentsPerPost: 5,
    };

    // Run the Actor and wait for it to finish
    const run = await client.actor("BDec00yAmCm1QbMEI").call(input);

    // Fetch Actor results from the run's dataset
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    return NextResponse.json({ comments: items });
  } catch (error) {
    console.error("Error processing TikTok comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch TikTok comments" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: "Please use POST request with postURLs in the body" },
    { status: 405 }
  );
}
