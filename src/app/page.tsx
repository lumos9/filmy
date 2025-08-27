import { Suspense } from "react";
import { MoviesService } from "@/lib/movies.service";
import MovieCard from "@/components/MovieCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorBoundary from "@/components/ErrorBoundary";
import ScreensDisplay from "@/components/ScreensDisplay";
import ThemeToggle from "@/components/ThemeToggle";

async function MovieDisplay() {
  try {
    const movie = await MoviesService.getRandomMovie();

    if (!movie) {
      return (
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Filmy
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Your movie database is empty. Add some movies to get started!
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-medium text-yellow-800 mb-2">
              No Movies Found
            </h3>
            <p className="text-yellow-700">
              Please add some movies to your database to see them displayed
              here.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Filmy
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Here's a movie from your collection:
        </p>
        <div className="max-w-md mx-auto">
          <MovieCard movie={movie} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching movie:", error);
    throw new Error("Failed to load movie data");
  }
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Theme Toggle */}
        <div className="flex justify-end mb-8">
          <ThemeToggle />
        </div>

        <ErrorBoundary>
          <Suspense
            fallback={
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Welcome to Filmy
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                  Loading screens information...
                </p>
                <LoadingSpinner size="lg" />
              </div>
            }
          >
            <ScreensDisplay />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}
