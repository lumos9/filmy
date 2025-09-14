import { Database } from "@/lib/database.types";
import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

type Screen = Database["public"]["Tables"]["screens"]["Row"];

// Create a server-only client for cached functions (no cookies)
function createServerOnlyClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey);
}

// Cache paginated screens queries
const getCachedScreensPage = unstable_cache(
  async (
    page: number,
    limit: number
  ): Promise<{
    screens: Screen[];
    totalCount: number;
    hasMore: boolean;
  }> => {
    console.log(
      `🔄 Server cache miss - fetching screens page ${page} with limit ${limit}`
    );

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const supabase = createServerOnlyClient();
    const { data, error, count } = await supabase
      .from("screens")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      throw new Error(`Failed to fetch screens: ${error.message}`);
    }

    const totalCount = count || 0;
    const hasMore = totalCount > page * limit;

    return {
      screens: data || [],
      totalCount,
      hasMore,
    };
  },
  [], // dynamic cache key based on params
  {
    revalidate: 24 * 60 * 60, // 24 hours
    tags: ["screens"],
  }
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    // Validate parameters
    if (page < 1 || limit < 1 || limit > 1000) {
      return NextResponse.json(
        { error: "Invalid page or limit parameters" },
        { status: 400 }
      );
    }

    console.log(
      `📦 API route: fetching screens page ${page} with server-side cache`
    );

    // Create cache key that includes the parameters
    const cacheKey = `screens-page-${page}-limit-${limit}`;
    const result = await unstable_cache(
      () => getCachedScreensPage(page, limit),
      [cacheKey],
      {
        revalidate: 24 * 60 * 60,
        tags: ["screens"],
      }
    )();

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
      },
    });
  } catch (error) {
    console.error("Error in paginated screens API route:", error);
    return NextResponse.json(
      { error: "Failed to fetch screens" },
      { status: 500 }
    );
  }
}
