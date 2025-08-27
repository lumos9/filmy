import Image from 'next/image'
import { Database } from '@/lib/database.types'

type Movie = Database['public']['Tables']['movies']['Row']

interface MovieCardProps {
  movie: Movie
  className?: string
}

export default function MovieCard({ movie, className = '' }: MovieCardProps) {
  const formatYear = (year: number | null) => {
    return year ? year.toString() : 'Unknown'
  }

  const formatRating = (rating: number | null) => {
    if (!rating) return 'No rating'
    return `${rating}/10`
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
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
      
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {movie.title}
        </h2>
        
        {movie.description && (
          <p className="text-gray-600 mb-4 line-clamp-3">
            {movie.description}
          </p>
        )}
        
        <div className="space-y-2">
          {movie.director && (
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-500 w-20">Director:</span>
              <span className="text-sm text-gray-900">{movie.director}</span>
            </div>
          )}
          
          {movie.genre && (
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-500 w-20">Genre:</span>
              <span className="text-sm text-gray-900">{movie.genre}</span>
            </div>
          )}
          
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-500 w-20">Year:</span>
            <span className="text-sm text-gray-900">{formatYear(movie.release_year)}</span>
          </div>
          
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-500 w-20">Rating:</span>
            <span className="text-sm text-gray-900">{formatRating(movie.rating)}</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-xs text-gray-500">
            <span>ID: {movie.id}</span>
            <span>Added: {new Date(movie.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
