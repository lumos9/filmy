"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "@/lib/database.types";
import { useEffect, useState } from "react";
import { GpsPoint } from "./Map";
import MapLibreMap from "./MapLibreMap";

type Screen = Database["public"]["Tables"]["screens"]["Row"];

export default function ScreensDisplay() {
  // const [page, setPage] = useState(1);
  // const [pageSize, setPageSize] = useState(25);
  const [screens, setScreens] = useState<Screen[]>([]);
  const [screensWithValidCoords, setScreensWithValidCoords] = useState<
    GpsPoint[]
  >([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState("map");
  const [useMapLibre, setUseMapLibre] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Direct API call function for retry functionality
  const fetchScreens = async () => {
    console.log(
      `🔄 ScreensDisplay: Fetching screens from API (attempt ${
        retryCount + 1
      })...`
    );
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/screens", {
        cache: "force-cache",
        next: {
          revalidate: 24 * 60 * 60, // 24 hours
          tags: ["screens"],
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch screens: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();
      const { screens, totalCount } = result;

      console.log(
        `📦 ScreensDisplay: Successfully loaded ${screens?.length || 0} screens`
      );
      setScreens(screens || []);

      const screensWithCoords = (screens || [])
        .filter(
          (screen: Screen) =>
            typeof screen.latitude === "number" &&
            typeof screen.longitude === "number"
        )
        .map((screen: Screen) => ({
          id: screen.id,
          coordinates: [
            screen.longitude as number,
            screen.latitude as number,
          ] as [number, number],
          metadata: {
            name: screen.organization || "Unknown",
            description: [screen.city, screen.state, screen.country]
              .filter(Boolean)
              .join(", "),
            projections: screen.projections || [],
            screenType: screen.screen_type || "",
            screenSizeFt: screen.screen_size_ft || "",
            formats: screen.formats || [],
            opened: screen.opened_date ? new Date(screen.opened_date) : null,
          },
          nickname: classifyImax(screen.formats || []),
        }));

      setScreensWithValidCoords(screensWithCoords);
      setTotalCount(totalCount || 0);
      setRetryCount(0); // Reset retry count on success

      console.log(
        `📍 ScreensDisplay: Processed ${screensWithCoords.length} screens with valid coordinates out of ${screens.length} total`
      );
    } catch (error) {
      console.error("❌ ScreensDisplay: Failed to load screens:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to load screens data. Please try again.";
      setError(errorMessage);
      setRetryCount((prev) => prev + 1);
    } finally {
      setIsLoading(false);
      console.log("✅ ScreensDisplay: Loading completed");
    }
  };

  function classifyImax(
    formats: string[]
  ): "True IMAX" | "LieMAX" | "Hybrid" | "Other" {
    if (!formats || formats.length === 0) return "Other";

    const has1570 = formats.includes("1570");
    const hasDigital = formats.some((f) => f.startsWith("D")); // D, DL, DL2, etc.

    if (has1570 && hasDigital) return "Hybrid";
    if (has1570) return "True IMAX";
    if (hasDigital) return "LieMAX";

    return "Other";
  }

  useEffect(() => {
    fetchScreens();
  }, []); // Only run once on mount

  if (error) {
    return (
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
            <Button
              onClick={fetchScreens}
              disabled={isLoading}
              variant="default"
            >
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
          {retryCount > 2 && (
            <p className="text-xs text-muted-foreground mt-4">
              If the problem persists, please check your internet connection or
              try again later.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!isLoading && screens.length === 0) {
    return (
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
    );
  }

  return (
    <div className="w-full md:container ms:mx-auto flex flex-col md:gap-4 gap-2">
      <h1 className="text-3xl font-semibold">IMAX Screens</h1>
      {isLoading ? (
        // <Card className="w-full p-8">
        //   <div className="space-y-4 text-center">
        //     <div className="text-6xl mb-4">🌍</div>
        //     <div className="space-y-2">
        //       <div className="h-6 w-64 bg-muted rounded mx-auto" />
        //       <div className="h-4 w-48 bg-muted rounded mx-auto" />
        //     </div>
        //     <div className="mt-8 h-96 w-full bg-muted rounded animate-pulse flex items-center justify-center">
        //       <div className="text-muted-foreground">
        //         Loading interactive globe...
        //       </div>
        //     </div>
        //   </div>
        // </Card>
        <LoadingSpinner size="lg" variant="spinner" className="h-full" />
      ) : (
        <MapLibreMap gpsPoints={screensWithValidCoords} />
      )}
    </div>
  );
}
