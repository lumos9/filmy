"use client";

import { useEffect, useMemo, useState } from "react";
import { ScreensService } from "@/lib/screens.service";
import { ScreensTableV2 } from "./ScreensTableV2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

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

  // const totalPages = useMemo(
  //   () => Math.max(1, Math.ceil((totalCount || 0) / pageSize)),
  //   [totalCount, pageSize]
  // );
  // const currentPage = useMemo(
  //   () => Math.min(Math.max(1, page), totalPages),
  //   [page, totalPages]
  // );

  // const perPageOptions = [10, 25, 50, 100];

  // const numberedWithEllipsis = useMemo(() => {
  //   const list: (number | "ellipsis")[] = [];
  //   const add = (n: number) => {
  //     if (n >= 1 && n <= totalPages && !list.includes(n)) list.push(n);
  //   };
  //   add(1);
  //   add(2);
  //   add(currentPage - 1);
  //   add(currentPage);
  //   add(currentPage + 1);
  //   add(totalPages - 1);
  //   add(totalPages);
  //   const uniqueSorted = [
  //     ...new Set(list.filter((v) => v !== "ellipsis")),
  //   ].sort((a, b) => (a as number) - (b as number));
  //   const withEllipsis: (number | "ellipsis")[] = [];
  //   for (let i = 0; i < uniqueSorted.length; i++) {
  //     const n = uniqueSorted[i] as number;
  //     const prev = uniqueSorted[i - 1] as number | undefined;
  //     if (prev !== undefined && n - prev > 1) {
  //       withEllipsis.push("ellipsis");
  //     }
  //     withEllipsis.push(n);
  //   }
  //   return withEllipsis;
  // }, [currentPage, totalPages]);

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
      <Card className="max-w-2xl mx-auto">
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

  // const PaginationNav = (
  //   <Pagination>
  //     <PaginationContent>
  //       <PaginationItem>
  //         <PaginationPrevious
  //           href="#"
  //           aria-disabled={currentPage === 1}
  //           onClick={(e) => {
  //             e.preventDefault();
  //             if (currentPage > 1) setPage(currentPage - 1);
  //           }}
  //         />
  //       </PaginationItem>
  //       {numberedWithEllipsis.map((item, idx) =>
  //         item === "ellipsis" ? (
  //           <PaginationItem key={`e-${idx}`}>
  //             <PaginationEllipsis />
  //           </PaginationItem>
  //         ) : (
  //           <PaginationItem key={item}>
  //             <PaginationLink
  //               href="#"
  //               isActive={item === currentPage}
  //               onClick={(e) => {
  //                 e.preventDefault();
  //                 setPage(item as number);
  //               }}
  //             >
  //               {item}
  //             </PaginationLink>
  //           </PaginationItem>
  //         )
  //       )}
  //       <PaginationItem>
  //         <PaginationNext
  //           href="#"
  //           aria-disabled={currentPage >= totalPages}
  //           onClick={(e) => {
  //             e.preventDefault();
  //             if (currentPage < totalPages) setPage(currentPage + 1);
  //           }}
  //         />
  //       </PaginationItem>
  //     </PaginationContent>
  //   </Pagination>
  // );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-center md:justify-between flex-wrap gap-3">
        <div className="text-center md:text-left">
          <h1 className="text-2xl font-semibold">Screen Database</h1>
          <div className="flex items-center gap-2 text-muted-foreground mt-1">
            <span className="text-center">
              {isLoading
                ? "Loading screens..."
                : `Showing ${screens.length} of ${totalCount} screens`}
            </span>
            {/* {!isLoading && (
              <Badge variant="secondary">
                Page {currentPage} / {totalPages}
              </Badge>
            )} */}
          </div>
        </div>
        {/* <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Per page:</span>
          {perPageOptions.map((ps) => (
            <Button
              key={ps}
              variant={ps === pageSize ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setPage(1);
                setPageSize(ps);
              }}
            >
              {ps}
            </Button>
          ))}
        </div>*/}
        {/* <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Per page:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                {pageSize}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {[10, 20, 50, 100].map((ps) => (
                <DropdownMenuItem
                  key={ps}
                  onSelect={() => {
                    setPage(1);
                    setPageSize(ps);
                  }}
                >
                  {ps}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div> */}
      </div>

      {/* Top pagination */}
      {/* {PaginationNav} */}
      <Separator />

      {isLoading ? (
        <Card className="p-6">
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

      {/* Bottom pagination */}
      {/* {PaginationNav} */}
    </div>
  );
}
