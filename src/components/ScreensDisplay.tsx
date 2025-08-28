"use client";

import { useEffect, useState } from "react";
import { ScreensService } from "@/lib/screens.service";
import { ScreensTableV2 } from "./ScreensTableV2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ScreensDisplay() {
  // const [page, setPage] = useState(1);
  // const [pageSize, setPageSize] = useState(25);
  const [screens, setScreens] = useState<
    Awaited<ReturnType<typeof ScreensService.getAllScreens>>["screens"]
  >([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(
    () => {
      let isMounted = true;
      setIsLoading(true);
      setError(null);

      ScreensService.getAllScreens()
        .then(({ screens, totalCount }) => {
          if (!isMounted) return;
          setScreens(screens);
          console.log("Total screens fetched:", totalCount);
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
          <CardTitle className="text-2xl">Screen Database</CardTitle>
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
          <CardTitle className="text-2xl">Screen Database</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground text-lg">
            Your screen database is empty. Add some screens to get started!
          </p>
          <div className="bg-muted/50 rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-2">No Screens Found</h3>
            <p className="text-muted-foreground">
              Please add some screens to your database to see them displayed
              here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full md:container ms:mx-auto flex flex-col items-center justify-center flex-wrap gap-3">
      <div className="flex flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-semibold">Screen Database</h1>
        <div className="flex items-center justify-center gap-2 text-muted-foreground mt-1">
          <span className="text-center">
            {isLoading
              ? "Loading screens information..."
              : `Showing ${screens.length} of ${totalCount} screens`}
          </span>
        </div>
      </div>
      {isLoading ? (
        <Card className="w-full p-6">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-muted rounded" />
            <div className="h-6 w-64 bg-muted rounded" />
          </div>
          <div className="mt-6 h-64 w-full bg-muted rounded" />
        </Card>
      ) : (
        // <ScreensTableV2 data={screens} />
        <ScreensTableV2 screenData={screens} />
      )}
    </div>
  );
}
