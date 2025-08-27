import { Suspense } from "react";
import { MoviesService } from "@/lib/movies.service";
import MovieCard from "@/components/MovieCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorBoundary from "@/components/ErrorBoundary";
import ScreensDisplay from "@/components/ScreensDisplay";
import ThemeToggle from "@/components/ThemeToggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

async function MovieDisplay() {
  try {
    const movie = await MoviesService.getRandomMovie();

    if (!movie) {
      return (
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="text-6xl mb-4">🎬</div>
            <CardTitle className="text-2xl">Welcome to Filmy</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground text-lg">
              Your movie database is empty. Add some movies to get started!
            </p>
            <div className="bg-muted/50 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2">No Movies Found</h3>
              <p className="text-muted-foreground">
                Please add some movies to your database to see them displayed
                here.
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="text-6xl mb-4">🎬</div>
          <CardTitle className="text-2xl">Welcome to Filmy</CardTitle>
          <p className="text-muted-foreground">
            Here's a movie from your collection:
          </p>
        </CardHeader>
        <CardContent>
          <MovieCard movie={movie} />
        </CardContent>
      </Card>
    );
  } catch (error) {
    console.error("Error fetching movie:", error);
    throw new Error("Failed to load movie data");
  }
}

function LoadingSkeleton() {
  return (
    <Card className="max-w-2xl mx-auto">
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

export default function Home() {
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Filmy</h1>
            <p className="text-muted-foreground">
              Your movie and screen database
            </p>
          </div>
          <ThemeToggle />
        </div>

        <Separator />

        {/* Content */}
        <ErrorBoundary>
          <Suspense fallback={<LoadingSkeleton />}>
            <ScreensDisplay />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}
