const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export async function searchMovieByTitle(title: string) {
  const res = await fetch(
    `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
      title
    )}`
  );

  if (!res.ok) throw new Error("TMDB request failed");

  const data = await res.json();

  if (!data.results || data.results.length === 0) return null;

  // Filter out documentaries and select the most popular feature film
  const featureFilms = data.results.filter((movie: any) => {
    // Get movie details to check genre
    return !movie.genre_ids?.includes(99); // 99 is Documentary genre ID
  });

  if (featureFilms.length === 0) return null;

  // Sort by popularity (descending) and return the most popular
  featureFilms.sort((a: any, b: any) => b.popularity - a.popularity);

  return featureFilms[0];
}
