import { NextResponse } from "next/server";
import { searchMovieByTitle } from "@/lib/tmdb";
import { CAMERA_MOVIES } from "@/lib/camerasAndMovies";

// Simple in-memory cache
const MOVIE_CACHE: Record<string, { movies: any[]; timestamp: number }> = {};
const CACHE_TTL = 1000 * 60 * 10; // 10 minutes

export async function GET(
  request: Request,
  context: { params: { camera: string } } // ✅ context type is correct
) {
  const { params } = context; // destructure properly
  const cameraId = decodeURIComponent(params.camera);
  const now = Date.now();

  // Check cache
  const cached = MOVIE_CACHE[cameraId];
  if (cached && now - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.movies);
  }

  const titles = CAMERA_MOVIES[cameraId] || [];
  if (!titles.length) return NextResponse.json([]);

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
}
