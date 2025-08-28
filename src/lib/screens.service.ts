import { getSupabaseClient } from "./supabase";
import { Database } from "./database.types";

type Screen = Database["public"]["Tables"]["screens"]["Row"];
type ScreenInsert = Database["public"]["Tables"]["screens"]["Insert"];
type ScreenUpdate = Database["public"]["Tables"]["screens"]["Update"];

export class ScreensService {
  /**
   * Get all screens (no pagination)
   */
  static async getAllScreens() {
    try {
      const supabase = getSupabaseClient();
      const batchSize = 1000;
      let from = 0;
      let to = batchSize - 1;
      let allData: Screen[] = [];
      let totalCount = 0;
      let done = false;

      while (!done) {
        const { data, error, count } = await supabase
          .from("screens")
          .select("*", { count: "exact" })
          .order("created_at", { ascending: false })
          .range(from, to);

        if (error) {
          throw new Error(`Failed to fetch screens: ${error.message}`);
        }

        if (data) {
          allData = allData.concat(data);
        }
        if (count !== null && count !== undefined) {
          totalCount = count;
        }

        if (!data || data.length < batchSize) {
          done = true;
        } else {
          from += batchSize;
          to += batchSize;
        }
      }

      return {
        screens: allData,
        totalCount,
      };
    } catch (error) {
      console.error("Error fetching all screens:", error);
      throw error;
    }
  }

  /**
   * Get all screens with optional pagination
   */
  static async getAllScreensByPageSize(page = 1, limit = 50) {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const supabase = getSupabaseClient();
      const { data, error, count } = await supabase
        .from("screens")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        throw new Error(`Failed to fetch screens: ${error.message}`);
      }

      return {
        screens: data || [],
        totalCount: count || 0,
        hasMore: (count || 0) > to + 1,
      };
    } catch (error) {
      console.error("Error fetching screens:", error);
      throw error;
    }
  }

  /**
   * Get a single screen by ID
   */
  static async getScreenById(id: string): Promise<Screen | null> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("screens")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if ((error as any).code === "PGRST116") {
          return null; // Screen not found
        }
        throw new Error(`Failed to fetch screen: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error("Error fetching screen:", error);
      throw error;
    }
  }

  /**
   * Create a new screen
   */
  static async createScreen(screen: ScreenInsert): Promise<Screen> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("screens")
        .insert(screen)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create screen: ${error.message}`);
      }

      return data as Screen;
    } catch (error) {
      console.error("Error creating screen:", error);
      throw error;
    }
  }

  /**
   * Update an existing screen
   */
  static async updateScreen(
    id: string,
    updates: ScreenUpdate
  ): Promise<Screen> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("screens")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update screen: ${error.message}`);
      }

      return data as Screen;
    } catch (error) {
      console.error("Error updating screen:", error);
      throw error;
    }
  }

  /**
   * Delete a screen
   */
  static async deleteScreen(id: string): Promise<void> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from("screens").delete().eq("id", id);

      if (error) {
        throw new Error(`Failed to delete screen: ${error.message}`);
      }
    } catch (error) {
      console.error("Error deleting screen:", error);
      throw error;
    }
  }
}
