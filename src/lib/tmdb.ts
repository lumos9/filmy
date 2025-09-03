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
  return data.results?.[0] || null; // first best match
}
