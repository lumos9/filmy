import { NextResponse } from "next/server";
import { searchMovieByTitle } from "@/lib/tmdb";
import { CAMERA_MOVIES } from "@/lib/camerasAndMovies";

// Simple in-memory cache: { [cameraId]: { movies: Movie[], timestamp: number } }
const MOVIE_CACHE: Record<string, { movies: any[]; timestamp: number }> = {};
const CACHE_TTL = 1000 * 60 * 10; // 10 minutes
const CACHE_LIMIT = 100;

export async function GET(req: Request, ctx: { params: { camera: string } }) {
  // Await params for Next.js dynamic API route compatibility
  const params = await (ctx.params as any);
  // Check cache first
  const cameraId = decodeURIComponent(params.camera);
  const now = Date.now();
  const cached = MOVIE_CACHE[cameraId];
  if (cached && now - cached.timestamp < CACHE_TTL) {
    console.log(`Serving cached movies for camera: ${cameraId}`);
    // Return up to 100 cached movies
    return NextResponse.json(cached.movies.slice(0, CACHE_LIMIT));
  }
  const cameraName = decodeURIComponent(params.camera);
  const titles = CAMERA_MOVIES[cameraName] || [];

  console.log(`movies for camera / sensor : ${titles}`);

  if (titles.length === 0) {
    console.warn(`No titles found for camera: '${cameraName}'`);
    return NextResponse.json([]);
  }

  const movies = await Promise.all(
    titles.map(async (title) => {
      const result = await searchMovieByTitle(title);
      return result
        ? {
            id: result.id,
            title: result.title,
            releaseDate: result.release_date,
            poster: `https://image.tmdb.org/t/p/w500${result.poster_path}`,
          }
        : null;
    })
  );

  // Cache up to 100 movies for this camera
  MOVIE_CACHE[cameraId] = {
    movies: movies.slice(0, CACHE_LIMIT),
    timestamp: Date.now(),
  };
  return NextResponse.json(movies.filter(Boolean));
}
