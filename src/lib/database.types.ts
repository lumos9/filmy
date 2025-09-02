export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      movies: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          release_year: number | null;
          genre: string | null;
          director: string | null;
          rating: number | null;
          poster_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          release_year?: number | null;
          genre?: string | null;
          director?: string | null;
          rating?: number | null;
          poster_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          release_year?: number | null;
          genre?: string | null;
          director?: string | null;
          rating?: number | null;
          poster_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      screens: {
        Row: {
          id: string;
          country: string | null;
          city: string | null;
          state: string | null;
          organization: string | null;
          screen_type: string | null;
          seats: number | null;
          screen_size_ft: string | null;
          screen_size_m: string | null;
          formats: string[]; // array of formats
          dimensions: string[]; // array of dimensions
          projections: string[]; // array of projections
          opened_date: string | null;
          created_at: string;
          updated_at: string;
          latitude?: number | null;
          longitude?: number | null;
        };
        Insert: {
          id?: string;
          country?: string | null;
          city?: string | null;
          state?: string | null;
          organization?: string | null;
          screen_type?: string | null;
          seats?: number | null;
          screen_size_ft?: string | null;
          screen_size_m?: string | null;
          formats?: string[]; // optional array
          dimensions?: string[]; // optional array
          projections?: string[]; // optional array
          opened_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          country?: string | null;
          city?: string | null;
          state?: string | null;
          organization?: string | null;
          screen_type?: string | null;
          seats?: number | null;
          screen_size_ft?: string | null;
          screen_size_m?: string | null;
          formats?: string[]; // optional array
          dimensions?: string[]; // optional array
          projections?: string[]; // optional array
          opened_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
