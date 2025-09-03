import { NextResponse, NextRequest } from "next/server";
import { searchMovieByTitle } from "@/lib/tmdb";
import { CAMERA_MOVIES } from "@/lib/camerasAndMovies";

// Simple in-memory cache
const MOVIE_CACHE: Record<string, { movies: any[]; timestamp: number }> = {};
const CACHE_TTL = 1000 * 60 * 10; // 10 minutes

export async function GET(request: NextRequest) {
  try {
    // Extract camera from the URL
    const segments = request.nextUrl.pathname.split("/");
    const cameraEncoded = segments[segments.length - 1]; // last segment
    const cameraId = decodeURIComponent(cameraEncoded);

    const now = Date.now();

    // Serve from cache if available
    const cached = MOVIE_CACHE[cameraId];
    if (cached && now - cached.timestamp < CACHE_TTL) {
      console.log("Serving from cache for camera:", cameraId);
      return NextResponse.json(cached.movies);
    }

    const titles = CAMERA_MOVIES[cameraId] || [];
    if (!titles.length) {
      console.warn("No movie titles found for camera:", cameraId);
      return NextResponse.json([]);
    }

    const movies = await Promise.all(
      titles.map(async (title) => {
        const result = await searchMovieByTitle(title);
        if (!result) return null;
        return {
          id: result.id,
          title: result.title,
          releaseDate: result.release_date,
          poster: result.poster_path
            ? `https://image.tmdb.org/t/p/w500${result.poster_path}`
            : null,
        };
      })
    );

    MOVIE_CACHE[cameraId] = { movies: movies.filter(Boolean), timestamp: now };
    return NextResponse.json(movies.filter(Boolean));
  } catch (err) {
    console.error("API Error:", err);
    return NextResponse.json([], { status: 500 });
  }
}
