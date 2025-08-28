# Filmy - Movie Database with Supabase

A modern Next.js application with Supabase integration for managing and displaying movie information.

## Features

- 🎬 Display movie information with beautiful cards
- 🗄️ Supabase database integration
- 🔒 Type-safe database operations
- ⚡ Server-side rendering with Next.js 15
- 🎨 Modern UI with Tailwind CSS
- 🛡️ Error boundaries and loading states
- 📱 Responsive design

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (ready for future use)

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd filmy
npm install
```

### 2. Set up Supabase

1. Go to [Supabase](https://supabase.com) and create a new project
2. Once your project is created, go to Settings > API
3. Copy your Project URL and anon/public key

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set up Database Schema

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase-schema.sql` to create the movies table
4. Copy and paste the contents of `screens-schema.sql` to create the screens table
5. Run both scripts to create the tables and sample data

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   └── globals.css     # Global styles
├── components/         # React components
│   ├── MovieCard.tsx   # Movie display component
│   ├── LoadingSpinner.tsx # Loading indicator
│   └── ErrorBoundary.tsx  # Error handling
└── lib/               # Utility functions
    ├── supabase.ts    # Supabase client configuration
    ├── supabase-server.ts # Server-side Supabase client
    ├── movies.service.ts  # Database operations
    └── database.types.ts  # TypeScript types
```

## Database Schema

### Movies Table
The `movies` table includes:

- `id`: UUID primary key
- `title`: Movie title (required)
- `description`: Movie description
- `release_year`: Year of release
- `genre`: Movie genre
- `director`: Movie director
- `rating`: Rating out of 10
- `poster_url`: URL to movie poster
- `created_at`: Timestamp of creation
- `updated_at`: Timestamp of last update

### Screens Table
The `screens` table includes:

- `id`: UUID primary key
- `country`: Country name
- `city`: City name
- `state`: State/province name
- `organization`: Organization/company name
- `projection`: Projection type
- `format`: Format (e.g., 4K, 70mm)
- `dimension`: 2D or 3D
- `screen_type`: Flat or dome
- `seats`: Number of seats
- `screen_size`: Screen dimensions
- `opened_date`: Date when screen opened
- `created_at`: Timestamp of creation
- `updated_at`: Timestamp of last update

## API Usage

The application includes service layers for database operations:

### Movies Service
```typescript
import { MoviesService } from '@/lib/movies.service'

// Get all movies with pagination
const { movies, totalCount, hasMore } = await MoviesService.getAllMovies(1, 10)

// Get a single movie
const movie = await MoviesService.getMovieById('movie-id')

// Get a random movie
const randomMovie = await MoviesService.getRandomMovie()

// Create a new movie
const newMovie = await MoviesService.createMovie({
  title: 'New Movie',
  description: 'Movie description',
  release_year: 2024,
  genre: 'Action',
  director: 'Director Name',
  rating: 8.5
})
```

### Screens Service
```typescript
import { ScreensService } from '@/lib/screens.service'

// Get all screens with pagination
const { screens, totalCount, hasMore } = await ScreensService.getAllScreens(1, 50)

// Get a single screen
const screen = await ScreensService.getScreenById('screen-id')

// Create a new screen
const newScreen = await ScreensService.createScreen({
  country: 'USA',
  city: 'New York',
  state: 'New York',
  organization: 'AMC Theatres',
  projection: 'Digital IMAX',
  format: '4K',
  dimension: '3D',
  screen_type: 'flat',
  seats: 300,
  screen_size: '60ft x 30ft',
  opened_date: '2023-01-15'
})
```

## Production Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Make sure to set these in your production environment:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Security Considerations

- Row Level Security (RLS) is enabled on the movies table
- Environment variables are properly configured
- Error boundaries prevent sensitive information leakage
- Type-safe database operations prevent SQL injection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
