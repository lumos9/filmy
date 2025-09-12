import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

const DAILY_LIMIT = 1600;
const MONTHLY_LIMIT = 50000;

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("map_loads")
      .select(
        "daily_count, monthly_count, last_daily_reset, last_monthly_reset"
      )
      .single();

    if (error || !data) {
      return NextResponse.json(
        {
          dailyCount: 0,
          monthlyCount: 0,
          dailyLimitReached: false,
          monthlyLimitReached: false,
        },
        { status: 200 }
      );
    }

    // Check if we need to reset counters
    const now = new Date();
    const lastDailyReset = new Date(data.last_daily_reset);
    const lastMonthlyReset = new Date(data.last_monthly_reset);

    // Reset daily count if it's a new day
    const isNewDay = now.toDateString() !== lastDailyReset.toDateString();
    // Reset monthly count if it's a new month
    const isNewMonth =
      now.getMonth() !== lastMonthlyReset.getMonth() ||
      now.getFullYear() !== lastMonthlyReset.getFullYear();

    let dailyCount = data.daily_count;
    let monthlyCount = data.monthly_count;

    if (isNewDay) {
      dailyCount = 0;
      await supabase
        .from("map_loads")
        .update({ daily_count: 0, last_daily_reset: now.toISOString() })
        .eq("id", 1);
    }

    if (isNewMonth) {
      monthlyCount = 0;
      await supabase
        .from("map_loads")
        .update({ monthly_count: 0, last_monthly_reset: now.toISOString() })
        .eq("id", 1);
    }

    return NextResponse.json({
      dailyCount,
      monthlyCount,
      dailyLimitReached: dailyCount >= DAILY_LIMIT,
      monthlyLimitReached: monthlyCount >= MONTHLY_LIMIT,
    });
  } catch (error) {
    console.error("Error fetching map loads:", error);
    return NextResponse.json(
      {
        dailyCount: 0,
        monthlyCount: 0,
        dailyLimitReached: false,
        monthlyLimitReached: false,
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const { data, error } = await supabase
      .from("map_loads")
      .select(
        "daily_count, monthly_count, last_daily_reset, last_monthly_reset"
      )
      .single();

    if (error || !data) {
      // Initialize the counters if they don't exist
      const now = new Date();
      await supabase.from("map_loads").upsert({
        id: 1,
        daily_count: 1,
        monthly_count: 1,
        last_daily_reset: now.toISOString(),
        last_monthly_reset: now.toISOString(),
        updated_at: now.toISOString(),
      });

      return NextResponse.json({
        dailyCount: 1,
        monthlyCount: 1,
        dailyLimitReached: false,
        monthlyLimitReached: false,
      });
    }

    // Check if we need to reset counters
    const now = new Date();
    const lastDailyReset = new Date(data.last_daily_reset);
    const lastMonthlyReset = new Date(data.last_monthly_reset);

    // Reset daily count if it's a new day
    const isNewDay = now.toDateString() !== lastDailyReset.toDateString();
    // Reset monthly count if it's a new month
    const isNewMonth =
      now.getMonth() !== lastMonthlyReset.getMonth() ||
      now.getFullYear() !== lastMonthlyReset.getFullYear();

    let dailyCount = isNewDay ? 0 : data.daily_count;
    let monthlyCount = isNewMonth ? 0 : data.monthly_count;

    const newDailyCount = dailyCount + 1;
    const newMonthlyCount = monthlyCount + 1;

    // Check limits
    if (newDailyCount > DAILY_LIMIT) {
      return NextResponse.json(
        {
          limitReached: true,
          limitType: "daily",
          message: `Daily limit of ${DAILY_LIMIT} map loads exceeded`,
        },
        { status: 429 }
      );
    }

    if (newMonthlyCount > MONTHLY_LIMIT) {
      return NextResponse.json(
        {
          limitReached: true,
          limitType: "monthly",
          message: `Monthly limit of ${MONTHLY_LIMIT} map loads exceeded`,
        },
        { status: 429 }
      );
    }

    // Update counters
    await supabase
      .from("map_loads")
      .update({
        daily_count: newDailyCount,
        monthly_count: newMonthlyCount,
        last_daily_reset: isNewDay ? now.toISOString() : data.last_daily_reset,
        last_monthly_reset: isNewMonth
          ? now.toISOString()
          : data.last_monthly_reset,
        updated_at: now.toISOString(),
      })
      .eq("id", 1);

    return NextResponse.json({
      dailyCount: newDailyCount,
      monthlyCount: newMonthlyCount,
      dailyLimitReached: false,
      monthlyLimitReached: false,
    });
  } catch (error) {
    console.error("Error updating map loads:", error);
    return NextResponse.json(
      { error: "Failed to update map load count" },
      { status: 500 }
    );
  }
}
