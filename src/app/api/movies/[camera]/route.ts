import { NextResponse, NextRequest } from "next/server";
import { searchMovieByTitle } from "@/lib/tmdb";
import { CAMERA_MOVIES } from "@/lib/camerasAndMovies";
import scrapedData from "@/data/camera-movies.scraped.json";

// Latest films-per-camera scraped from ShotOnWhat at build time (regenerated on
// each deploy). Merged as a UNION over the curated list so newly-released films
// show up automatically, while curated titles remain a guaranteed fallback.
const SCRAPED: Record<string, string[]> =
  (scrapedData as { cameras?: Record<string, string[]> }).cameras ?? {};

/** Curated ∪ scraped titles for a camera, de-duplicated. */
function titlesForCamera(cameraId: string): string[] {
  const merged = [...(CAMERA_MOVIES[cameraId] || []), ...(SCRAPED[cameraId] || [])];
  return Array.from(new Set(merged.map((t) => t.trim()).filter(Boolean)));
}

// Simple in-memory cache. Data is static per deploy, so a long TTL just trims
// TMDB calls; a fresh deploy (new scrape) runs in a new function instance.
const MOVIE_CACHE: Record<string, { movies: any[]; timestamp: number }> = {};
const CACHE_TTL = 1000 * 60 * 60 * 6; // 6 hours

export async function GET(request: NextRequest) {
  try {
    // Extract camera from the URL
    const segments = request.nextUrl.pathname.split("/");
    const cameraEncoded = segments[segments.length - 1]; // last segment
    const cameraId = decodeURIComponent(cameraEncoded);

    const now = Date.now();

    // Shared cache headers: cache at the edge but revalidate, so a redeploy's
    // fresh scrape is never served stale.
    const cacheHeaders = {
      "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400",
    };

    // Serve from cache if available
    const cached = MOVIE_CACHE[cameraId];
    if (cached && now - cached.timestamp < CACHE_TTL) {
      console.log(
        `Returning ${cached.movies.length} cached movies for camera: '${cameraId}'`
      );
      return NextResponse.json(cached.movies, { headers: cacheHeaders });
    }

    const titles = titlesForCamera(cameraId);
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
    console.log(
      `Returning ${uniqueMovies.length} movies for camera: '${cameraId}'`
    );
    return NextResponse.json(uniqueMovies, { headers: cacheHeaders });
  } catch (err) {
    console.error("API Error:", err);
    return NextResponse.json([], { status: 500 });
  }
}
