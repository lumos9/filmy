import { Suspense } from "react";
import { MoviesService } from "@/lib/movies.service";
import MovieCard from "@/components/MovieCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorBoundary from "@/components/ErrorBoundary";
import ScreensDisplay from "@/components/ScreensDisplay";
import ThemeToggle from "@/components/ThemeToggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Link from "next/link";
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

export default async function Home() {
  return (
    <div className="w-full flex flex-col items-center justify-center text-center">
      <h1 className="text-3xl font-bold mb-4">Home</h1>
    </div>
  );
}
