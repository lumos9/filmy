"use client";

import ImaxMap from "@/components/ImaxMap";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShimmerSkeleton } from "@/components/unlumen-ui/shimmer-skeleton";
import { ShimmeringText } from "@/components/unlumen-ui/shimmering-text";
import { getScreensData, type ImaxCollection } from "@/lib/screens-data";
import { useEffect, useState } from "react";

export default function ScreensDisplay() {
  const [data, setData] = useState<ImaxCollection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Data is a prebuilt GeoJSON file (derived from src/data/screens.json), served
  // statically from /public and de-duplicated through a module-level cache so it
  // is fetched at most once per session. No database.
  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      setData(await getScreensData());
      setRetryCount(0);
    } catch (err) {
      console.error("❌ ScreensDisplay: failed to load screens:", err);
      setError(err instanceof Error ? err.message : "Failed to load screens data.");
      setRetryCount((prev) => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (error) {
    return (
      <div className="min-h-[70vh] w-full flex items-center justify-center">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <CardTitle className="text-2xl">Unable to Load Screens</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-destructive mb-4">{error}</p>
            {retryCount > 0 && (
              <p className="text-sm text-muted-foreground">
                Failed attempts: {retryCount}
              </p>
            )}
            <div className="flex gap-2 justify-center">
              <Button onClick={load} disabled={isLoading} variant="default">
                {isLoading ? "Retrying..." : "Retry"}
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                disabled={isLoading}
              >
                Refresh Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || !data) {
    // Centered, animated loader — a shimmering globe placeholder + shimmer text,
    // vertically and horizontally centered in the page.
    return (
      <div className="min-h-[70vh] w-full flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <ShimmerSkeleton className="size-40 md:size-52 rounded-full" />
          <span
            className="absolute inset-0 flex items-center justify-center text-5xl md:text-6xl opacity-70"
            aria-hidden
          >
            🌍
          </span>
        </div>
        <ShimmeringText
          text="Loading IMAX theaters worldwide…"
          className="text-base md:text-lg font-medium"
          duration={1.6}
        />
      </div>
    );
  }

  if (data.features.length === 0) {
    return (
      <div className="min-h-[70vh] w-full flex items-center justify-center">
        <Card className="max-w-screen mx-auto">
          <CardHeader className="text-center">
            <div className="text-6xl mb-4">📽️</div>
            <CardTitle className="text-2xl">Screens</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-muted/50 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2">No Screens Found</h3>
              <p className="text-muted-foreground">
                No screens available at the moment. Please check back later!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full md:container ms:mx-auto flex flex-col md:gap-4 gap-2">
      <h1 className="text-3xl font-semibold">IMAX Screens</h1>
      <ImaxMap data={data} />
    </div>
  );
}
