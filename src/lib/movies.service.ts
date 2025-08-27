import { supabase } from "./supabase";
import { Database } from "./database.types";

type Movie = Database["public"]["Tables"]["movies"]["Row"];
type MovieInsert = Database["public"]["Tables"]["movies"]["Insert"];
type MovieUpdate = Database["public"]["Tables"]["movies"]["Update"];

export class MoviesService {
  /**
   * Get all movies with optional pagination
   */
  static async getAllMovies(page = 1, limit = 10) {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from("movies")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        throw new Error(`Failed to fetch movies: ${error.message}`);
      }

      return {
        movies: data || [],
        totalCount: count || 0,
        hasMore: (count || 0) > to + 1,
      };
    } catch (error) {
      console.error("Error fetching movies:", error);
      throw error;
    }
  }

  /**
   * Get a single movie by ID
   */
  static async getMovieById(id: string): Promise<Movie | null> {
    try {
      const { data, error } = await supabase
        .from("movies")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null; // Movie not found
        }
        throw new Error(`Failed to fetch movie: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error("Error fetching movie:", error);
      throw error;
    }
  }

  /**
   * Get a random movie for display
   */
  static async getRandomMovie(): Promise<Movie | null> {
    try {
      const { data, error } = await supabase
        .from("movies")
        .select("*")
        .limit(1)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch random movie: ${error.message}`);
      }

      return data?.[0] || null;
    } catch (error) {
      console.error("Error fetching random movie:", error);
      throw error;
    }
  }

  /**
   * Create a new movie
   */
  static async createMovie(movie: MovieInsert): Promise<Movie> {
    try {
      const { data, error } = await supabase
        .from("movies")
        .insert(movie)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create movie: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error("Error creating movie:", error);
      throw error;
    }
  }

  /**
   * Update an existing movie
   */
  static async updateMovie(id: string, updates: MovieUpdate): Promise<Movie> {
    try {
      const { data, error } = await supabase
        .from("movies")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update movie: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error("Error updating movie:", error);
      throw error;
    }
  }

  /**
   * Delete a movie
   */
  static async deleteMovie(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("movies").delete().eq("id", id);

      if (error) {
        throw new Error(`Failed to delete movie: ${error.message}`);
      }
    } catch (error) {
      console.error("Error deleting movie:", error);
      throw error;
    }
  }
}
