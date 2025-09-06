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
      console.log(
        `Returning ${cached.movies.length} cached movies for camera: '${cameraId}'`
      );
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

    // Filter out null results, deduplicate by id, and sort by release date (latest first)
    const validMovies = movies.filter(
      (movie): movie is NonNullable<typeof movie> => movie !== null
    );

    // Deduplicate by id, keeping the movie with the latest release date if duplicates exist
    const uniqueMoviesMap = new Map<
      number,
      NonNullable<(typeof validMovies)[0]>
    >();
    validMovies.forEach((movie) => {
      const existing = uniqueMoviesMap.get(movie.id);
      if (
        !existing ||
        (movie.releaseDate &&
          (!existing.releaseDate || movie.releaseDate > existing.releaseDate))
      ) {
        uniqueMoviesMap.set(movie.id, movie);
      }
    });

    // Convert to array and sort by release date (latest first)
    const uniqueMovies = Array.from(uniqueMoviesMap.values()).sort((a, b) => {
      if (!a.releaseDate && !b.releaseDate) return 0;
      if (!a.releaseDate) return 1;
      if (!b.releaseDate) return -1;
      return (
        new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
      );
    });

    MOVIE_CACHE[cameraId] = { movies: uniqueMovies, timestamp: now };
    //console.log(movies);
    console.log(
      `Returning ${uniqueMovies.length} movies for camera: '${cameraId}'`
    );
    return NextResponse.json(uniqueMovies);
  } catch (err) {
    console.error("API Error:", err);
    return NextResponse.json([], { status: 500 });
  }
}
