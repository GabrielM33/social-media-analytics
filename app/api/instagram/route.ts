import { NextResponse } from 'next/server';

const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const INSTAGRAM_API_VERSION = 'v18.0';

interface InstagramResponse {
  id: string;
  comments_count: number;
  like_count: number;
  video_view_count: number;
  comments: {
    data: Array<{
      id: string;
      text: string;
      username: string;
      like_count: number;
      timestamp: string;
    }>;
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    if (!INSTAGRAM_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'Instagram access token not configured' },
        { status: 500 }
      );
    }

    // Fetch video data using Instagram Graph API
    const response = await fetch(
      `https://graph.facebook.com/${INSTAGRAM_API_VERSION}/${videoId}?fields=comments_count,like_count,video_view_count,comments{text,username,like_count,timestamp}&access_token=${INSTAGRAM_ACCESS_TOKEN}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to fetch Instagram data');
    }

    const data: InstagramResponse = await response.json();

    // Format the response
    return NextResponse.json({
      views: data.video_view_count.toLocaleString(),
      likes: data.like_count.toLocaleString(),
      comments: data.comments_count.toLocaleString(),
      top_comments: data.comments.data
        .slice(0, 5)
        .map(comment => ({
          id: comment.id,
          text: comment.text,
          author: comment.username,
          likeCount: comment.like_count,
          publishedAt: comment.timestamp
        }))
    });
  } catch (error) {
    console.error('Instagram API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch Instagram data' },
      { status: 500 }
    );
  }
}