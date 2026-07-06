import { loadScreens } from "@/lib/screens";
import { NextRequest, NextResponse } from "next/server";

// Paginated view over the local screens dataset (formerly Supabase-backed).
export function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    if (page < 1 || limit < 1 || limit > 1000) {
      return NextResponse.json(
        { error: "Invalid page or limit parameters" },
        { status: 400 }
      );
    }

    const all = loadScreens();
    const totalCount = all.length;
    const from = (page - 1) * limit;
    const screens = all.slice(from, from + limit);
    const hasMore = totalCount > page * limit;

    return NextResponse.json(
      { screens, totalCount, hasMore },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=86400, stale-while-revalidate=43200",
        },
      }
    );
  } catch (error) {
    console.error("Error in paginated screens API route:", error);
    return NextResponse.json(
      { error: "Failed to fetch screens" },
      { status: 500 }
    );
  }
}
