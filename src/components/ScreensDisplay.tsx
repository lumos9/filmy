"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScreensService } from "@/lib/screens.service";
import { useEffect, useState } from "react";
import { GpsPoint } from "./Map";
import MapLibreMap from "./MapLibreMap";

export default function ScreensDisplay() {
  // const [page, setPage] = useState(1);
  // const [pageSize, setPageSize] = useState(25);
  const [screens, setScreens] = useState<
    Awaited<ReturnType<typeof ScreensService.getAllScreens>>["screens"]
  >([]);
  const [screensWithValidCoords, setScreensWithValidCoords] = useState<
    GpsPoint[]
  >([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState("map");
  const [useMapLibre, setUseMapLibre] = useState(false);

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

  useEffect(
    () => {
      let isMounted = true;
      setIsLoading(true);
      setError(null);

      ScreensService.getAllScreens()
        .then(({ screens, totalCount }) => {
          if (!isMounted) return;
          setScreens(screens);
          const screensWithCoords = screens
            .filter(
              (screen) =>
                typeof screen.latitude === "number" &&
                typeof screen.longitude === "number"
            )
            .map((screen) => ({
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
                opened: screen.opened_date
                  ? new Date(screen.opened_date)
                  : null,
              },
              nickname: classifyImax(screen.formats || []),
            }));
          setScreensWithValidCoords(screensWithCoords);
          setTotalCount(totalCount || 0);
        })
        .catch((e) => {
          if (!isMounted) return;
          setError(e?.message || "Failed to load screens");
        })
        .finally(() => {
          if (!isMounted) return;
          setIsLoading(false);
        });

      return () => {
        isMounted = false;
      };
    },
    [
      /* page, pageSize */
    ]
  );

  if (error) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Screens</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-destructive">{error}</p>
          {/* <Button onClick={() => setPage(1)}>Retry</Button> */}
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
    <div className="w-full md:container ms:mx-auto flex flex-col gap-4">
      <div className="flex flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-semibold">IMAX Screens</h1>
        {/* <button
          onClick={() => setUseMapLibre(!useMapLibre)}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Switch to {useMapLibre ? "Mapbox" : "MapLibre"}
        </button> */}
      </div>
      {/* <Tabs
        value={tab}
        onValueChange={setTab}
        className="w-full flex flex-col items-center justify-center"
      >
        <TabsList className="max-w-md flex justify-center items-center gap-2">
          <TabsTrigger
            value="map"
            className="flex items-center gap-2 cursor-pointer"
          >
            <MapPin className="w-4 h-4" />
            Map View
          </TabsTrigger>
          <TabsTrigger
            value="list"
            className="flex items-center gap-2 cursor-pointer"
          >
            <List className="w-4 h-4" />
            List View
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="map"
          forceMount
          className={`w-full mt-4 ${tab === "map" ? "block" : "hidden"}`}
        >
          <Map gpsPoints={screensWithValidCoords} />
        </TabsContent>

        <TabsContent
          value="list"
          forceMount
          className={`w-full mt-4 ${tab === "list" ? "block" : "hidden"}`}
        >
          {isLoading ? (
            <Card className="w-full p-6">
              <div className="space-y-2">
                <div className="h-6 w-48 bg-muted rounded" />
                <div className="h-6 w-64 bg-muted rounded" />
              </div>
              <div className="mt-6 h-64 w-full bg-muted rounded" />
            </Card>
          ) : (
            <div className="w-full flex flex-col items-center justify-center gap-2">
              <div className="text-sm text-muted-foreground">
                Showing {formatNumberHuman(screens.length)} screen locations
              </div>
              <ScreensTableV2 screenData={screens} />
            </div>
          )}
        </TabsContent>
      </Tabs> */}
      {/* <Map gpsPoints={screensWithValidCoords} /> */}
      <MapLibreMap gpsPoints={screensWithValidCoords} />
    </div>
  );
}
