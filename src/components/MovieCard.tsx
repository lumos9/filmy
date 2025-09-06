import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Database } from "@/lib/database.types";
import Image from "next/image";

type Movie = Database["public"]["Tables"]["movies"]["Row"];

interface MovieCardProps {
  movie: Movie;
  className?: string;
}

export default function MovieCard({ movie, className = "" }: MovieCardProps) {
  const formatYear = (year: number | null) => {
    return year ? year.toString() : "Unknown";
  };

  const formatRating = (rating: number | null) => {
    if (!rating) return "No rating";
    return `${rating}/10`;
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      {movie.poster_url && (
        <div className="relative h-64 w-full">
          <Image
            src={movie.poster_url}
            alt={`Poster for ${movie.title}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}

      <CardHeader>
        <CardTitle className="text-2xl">{movie.title}</CardTitle>
        {movie.description && (
          <p className="text-muted-foreground line-clamp-3">
            {movie.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          {movie.director && (
            <div>
              <span className="font-medium text-muted-foreground">
                Director:
              </span>
              <p className="mt-1">{movie.director}</p>
            </div>
          )}

          {movie.genre && (
            <div>
              <span className="font-medium text-muted-foreground">Genre:</span>
              <p className="mt-1">{movie.genre}</p>
            </div>
          )}

          <div>
            <span className="font-medium text-muted-foreground">Year:</span>
            <p className="mt-1">{formatYear(movie.release_year)}</p>
          </div>

          <div>
            <span className="font-medium text-muted-foreground">Rating:</span>
            <p className="mt-1">{formatRating(movie.rating)}</p>
          </div>
        </div>

        <Separator />

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>ID: {movie.id}</span>
          <span>Added: {new Date(movie.created_at).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}
