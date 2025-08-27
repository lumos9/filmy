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
          projection: string | null;
          format: string | null;
          dimension: string | null;
          screen_type: string | null;
          seats: number | null;
          screen_size: string | null;
          opened_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          country?: string | null;
          city?: string | null;
          state?: string | null;
          organization?: string | null;
          projection?: string | null;
          format?: string | null;
          dimension?: string | null;
          screen_type?: string | null;
          seats?: number | null;
          screen_size?: string | null;
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
          projection?: string | null;
          format?: string | null;
          dimension?: string | null;
          screen_type?: string | null;
          seats?: number | null;
          screen_size?: string | null;
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
