import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorBoundary from "@/components/ErrorBoundary";
import ScreensDisplay from "@/components/ScreensDisplay";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function LoadingSkeleton() {
  return (
    <Card className="max-w-screen mx-auto">
      <CardHeader className="text-center">
        <div className="text-6xl mb-4">🎬</div>
        <CardTitle className="text-2xl">Welcome to Filmy</CardTitle>
        <p className="text-muted-foreground">
          Loading your movie collection...
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-64 w-full rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function ScreensPage() {
  return (
    <div className="w-full flex flex-col items-center justify-center text-center p-4">
      {/* Content */}
      <ErrorBoundary>
        <Suspense fallback={<LoadingSkeleton />}>
          <ScreensDisplay />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
