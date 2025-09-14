import { Database } from "@/lib/database.types";
import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";

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

// Cache the database query for 24 hours
const getCachedScreens = unstable_cache(
  async (): Promise<{ screens: Screen[]; totalCount: number }> => {
    console.log(
      "🔄 Server cache miss - fetching fresh screens data from database"
    );

    const supabase = createServerOnlyClient();
    const batchSize = 1000;
    let from = 0;
    let to = batchSize - 1;
    let allData: Screen[] = [];
    let totalCount = 0;
    let done = false;

    while (!done) {
      const { data, error, count } = await supabase
        .from("screens")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        throw new Error(`Failed to fetch screens: ${error.message}`);
      }

      if (data) {
        allData = allData.concat(data);
      }
      if (count !== null && count !== undefined) {
        totalCount = count;
      }

      if (!data || data.length < batchSize) {
        done = true;
      } else {
        from += batchSize;
        to += batchSize;
      }
    }

    return {
      screens: allData,
      totalCount,
    };
  },
  ["screens-all"], // cache key
  {
    revalidate: 24 * 60 * 60, // 24 hours in seconds
    tags: ["screens"], // for cache invalidation
  }
);

export async function GET() {
  try {
    console.log("📦 API route: fetching screens with server-side cache");
    const result = await getCachedScreens();

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200", // 24h cache, 12h stale
      },
    });
  } catch (error) {
    console.error("Error in screens API route:", error);
    return NextResponse.json(
      { error: "Failed to fetch screens" },
      { status: 500 }
    );
  }
}
