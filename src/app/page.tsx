import { Button } from "@/components/ui/button";
import { Film, Globe, Sparkles } from "lucide-react";
import Link from "next/link";
import { MoviesService } from "@/lib/movies.service";
import MovieCard from "@/components/MovieCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorBoundary from "@/components/ErrorBoundary";
import ScreensDisplay from "@/components/ScreensDisplay";
import ThemeToggle from "@/components/ThemeToggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
    <div className="relative w-full flex items-center justify-center overflow-hidden bg-black">
      {/* Fullscreen background image with overlay */}
      <img
        src="/assets/images/bg.jpeg"
        alt="Cinema background"
        className="fixed inset-0 w-full h-full object-cover object-center opacity-70 md:opacity-60 blur-sm md:blur-none scale-105 z-0 select-none pointer-events-none transition-all duration-700"
        draggable={false}
        aria-hidden="true"
        loading="eager"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/70 to-[#0f172a]/90 z-10" />

      {/* Hero content */}
      <main className="relative z-20 flex flex-col items-center justify-center text-center px-4 py-24 gap-8 w-full">
        <div className="flex flex-col items-center gap-4">
          <span className="inline-flex items-center gap-2 text-primary font-bold text-4xl md:text-6xl tracking-tight drop-shadow-lg animate-pop">
            <Film className="w-8 h-8 md:w-12 md:h-12 text-primary animate-pop" />
            Filmy
          </span>
          <span className="text-lg md:text-2xl text-muted-foreground font-medium max-w-2xl animate-fade-in">
            The global movie & screen knowledge platform. Explore, compare, and
            contribute to the world of cinema technology—one screen at a time.
          </span>
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-center mt-4 animate-fade-in">
          <Link href="/screens">
            <Button
              size="lg"
              className="text-lg font-semibold px-8 py-5 shadow-xl"
            >
              <Globe className="w-5 h-5" /> Explore Screens
            </Button>
          </Link>
          <Link href="/about">
            <Button
              variant="outline"
              size="lg"
              className="text-lg font-semibold px-8 py-5 border-primary/30"
            >
              <Sparkles className="w-5 h-5 text-primary" /> Learn More
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
