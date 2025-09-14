import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

const redis = new Redis({
  url: process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function POST(req: NextRequest) {
  try {
    const event = await req.json();

    // Example event fields (Vercel sends visitorId + more)
    const { visitorId, timestamp } = event;

    if (!visitorId) {
      return NextResponse.json(
        { success: false, error: "visitorId is required in event data" },
        { status: 400 }
      );
    }

    if (!timestamp || typeof timestamp !== "string") {
      return NextResponse.json(
        { success: false, error: "timestamp is required and must be a string" },
        { status: 400 }
      );
    }

    // Validate timestamp format (should be ISO string)
    const timestampDate = new Date(timestamp);
    if (isNaN(timestampDate.getTime())) {
      return NextResponse.json(
        { success: false, error: "timestamp must be a valid ISO date string" },
        { status: 400 }
      );
    }

    // Group visitors by day key using client's timestamp
    const dayKey = `unique-visitors:${timestamp.slice(0, 10)}`;

    // Store in a Redis SET (unique by visitorId)
    await redis.sadd(dayKey, visitorId);

    // Expire after 30 days to save space
    await redis.expire(dayKey, 60 * 60 * 24 * 30);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Drain error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "Analytics drain is active" });
}
