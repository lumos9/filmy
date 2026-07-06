import { loadScreens } from "@/lib/screens";
import { NextResponse } from "next/server";

// Screens now come from a committed local file (src/data/screens.json), validated
// by loadScreens(). The retired Supabase DB is no longer involved. The map itself
// loads the prebuilt /screens.geojson; this endpoint returns the raw rows for any
// tabular/programmatic use.
export function GET() {
  try {
    const screens = loadScreens();
    return NextResponse.json(
      { screens, totalCount: screens.length },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=86400, stale-while-revalidate=43200",
        },
      }
    );
  } catch (error) {
    console.error("Error in screens API route:", error);
    return NextResponse.json(
      { error: "Failed to fetch screens" },
      { status: 500 }
    );
  }
}
