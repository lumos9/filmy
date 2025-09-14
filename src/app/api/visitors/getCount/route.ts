import { getUniqueVisitorCount } from "@/lib/analytics-store";
import { NextResponse } from "next/server";

export async function GET() {
  const count = await getUniqueVisitorCount({ days: 7 });
  return NextResponse.json({ uniqueVisitors: count });
}
