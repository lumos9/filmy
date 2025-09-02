"use client";

import { useEffect, useState } from "react";
import { ScreensService } from "@/lib/screens.service";
import { ScreensTableV2 } from "./ScreensTableV2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { List, MapPin } from "lucide-react";
import Map from "./Map";
import { GpsPoint } from "./Map";

// const theaters = [
//   {
//     name: "Boeing IMAX Theatre (Pacific Science Center, Seattle)",
//     latitude: 47.6192,
//     longitude: -122.3511,
//   },
//   {
//     name: "Regal Issaquah Highlands 12 & IMAX",
//     latitude: 47.5427, // Approx for 940 NE Park Dr
//     longitude: -122.0330,
//   },
//   {
//     name: "AMC Kent Station 14 & IMAX",
//     latitude: 47.3836, // Approx for 426 Ramsay Way
//     longitude: -122.2348,
//   },
//   {
//     name: "Regal Martin Village Stadium 16 & IMAX",
//     latitude: 47.0225, // Approx for 5400 E Martin Way, Lacey, WA
//     longitude: -122.7727,
//   },
//   {
//     name: "AMC Alderwood Mall 16 & IMAX",
//     latitude: 47.8272, // Approx for Alderwood Mall Blvd, Lynnwood, WA
//     longitude: -122.2752,
//   },
//   {
//     name: "PACCAR IMAX Theatre (Pacific Science Center, Seattle)",
//     latitude: 47.6205,
//     longitude: -122.3514,
//   },
//   {
//     name: "Regal Thornton Place Stadium 14 & IMAX",
//     latitude: 47.7031, // Approx for 301 NE Thornton Pl, Seattle
//     longitude: -122.3265,
//   },
//   {
//     name: "AMC River Park Square 20 & IMAX",
//     latitude: 47.6596,
//     longitude: -117.4234,
//   },
//   {
//     name: "AMC Southcenter 16 & IMAX",
//     latitude: 47.4634, // Approx for 3600 Southcenter Mall, Tukwila
//     longitude: -122.2545,
//   },
//   {
//     name: "Regal Cascade Stadium 16 & IMAX",
//     latitude: 45.6322, // Approx for 1101 SE 160th Ave, Vancouver, WA
//     longitude: -122.5064,
//   },
// ];

// export const theaters: GpsPoint[] = [
//   {
//     id: "1",
//     coordinates: [-122.3511, 47.6192],
//     metadata: {
//       name: "Boeing IMAX Theatre",
//       description: "Pacific Science Center, Seattle, WA",
//     },
//   },
//   {
//     id: "2",
//     coordinates: [-122.033, 47.5427],
//     metadata: {
//       name: "Regal Issaquah Highlands 12 & IMAX",
//       description: "Issaquah, WA, USA",
//     },
//   },
//   {
//     id: "3",
//     coordinates: [-122.2348, 47.3836],
//     metadata: {
//       name: "AMC Kent Station 14 & IMAX",
//       description: "Kent, WA, USA",
//     },
//   },
//   {
//     id: "4",
//     coordinates: [-122.7727, 47.0225],
//     metadata: {
//       name: "Regal Martin Village Stadium 16 & IMAX",
//       description: "Lacey, WA, USA",
//     },
//   },
//   {
//     id: "5",
//     coordinates: [-122.2752, 47.8272],
//     metadata: {
//       name: "AMC Alderwood Mall 16 & IMAX",
//       description: "Lynnwood, WA, USA",
//     },
//   },
//   {
//     id: "6",
//     coordinates: [-122.3514, 47.6205],
//     metadata: {
//       name: "PACCAR IMAX Theatre",
//       description: "Pacific Science Center, Seattle, WA",
//     },
//   },
//   {
//     id: "7",
//     coordinates: [-122.3265, 47.7031],
//     metadata: {
//       name: "Regal Thornton Place Stadium 14 & IMAX",
//       description: "Seattle, WA, USA",
//     },
//   },
//   {
//     id: "8",
//     coordinates: [-117.4234, 47.6596],
//     metadata: {
//       name: "AMC River Park Square 20 & IMAX",
//       description: "Spokane, WA, USA",
//     },
//   },
//   {
//     id: "9",
//     coordinates: [-122.2545, 47.4634],
//     metadata: {
//       name: "AMC Southcenter 16 & IMAX",
//       description: "Tukwila, WA, USA",
//     },
//   },
//   {
//     id: "10",
//     coordinates: [-122.5064, 45.6322],
//     metadata: {
//       name: "Regal Cascade Stadium 16 & IMAX",
//       description: "Vancouver, WA, USA",
//     },
//   },
// ];

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
              },
              nickname: classifyImax(screen.formats || []),
            }));
          setScreensWithValidCoords(screensWithCoords);

          console.log("screens with valid cords fetched:", screensWithCoords);
          console.log(
            "screens with valid cords fetched count:",
            screensWithCoords.length
          );
          //console.log("screens with fake data:", theaters);
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
        <h1 className="text-2xl font-semibold">Screens</h1>
        <div className="flex items-center justify-center gap-2 text-muted-foreground mt-1">
          <span className="text-center">
            {isLoading && "Loading screens information..."}
          </span>
        </div>
      </div>
      <Tabs
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
        <TabsContent value="map" className="w-full mt-4">
          {isLoading ? (
            <Card className="w-full p-6 min-h-[400px] flex flex-col items-center justify-center">
              <div className="space-y-2 w-full flex flex-col items-center">
                <div className="h-6 w-48 bg-muted rounded" />
                <div className="h-6 w-64 bg-muted rounded" />
              </div>
              <div className="mt-6 h-64 w-full bg-muted rounded" />
            </Card>
          ) : (
            <Map gpsPoints={screensWithValidCoords} />
            // <div className="w-full flex flex-col items-center justify-center gap-2">
            //   <div className="text-sm text-muted-foreground">
            //     Showing {screensWithValidCoords.length} geo-located screen
            //     locations
            //   </div>

            // </div>
          )}
        </TabsContent>
        <TabsContent value="list" className="w-full mt-4">
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
                Showing {screens.length} screen locations
              </div>
              <ScreensTableV2 screenData={screens} />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
