-- Create the screens table
CREATE TABLE IF NOT EXISTS public.screens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    country TEXT,
    city TEXT,
    state TEXT,
    organization TEXT,
    projection TEXT,
    format TEXT,
    dimension TEXT CHECK (dimension IN ('2D', '3D')),
    screen_type TEXT CHECK (screen_type IN ('flat', 'dome')),
    seats INTEGER,
    screen_size TEXT,
    opened_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_screens_country ON public.screens(country);
CREATE INDEX IF NOT EXISTS idx_screens_city ON public.screens(city);
CREATE INDEX IF NOT EXISTS idx_screens_organization ON public.screens(organization);
CREATE INDEX IF NOT EXISTS idx_screens_dimension ON public.screens(dimension);
CREATE INDEX IF NOT EXISTS idx_screens_screen_type ON public.screens(screen_type);
CREATE INDEX IF NOT EXISTS idx_screens_created_at ON public.screens(created_at DESC);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_screens_updated_at 
    BEFORE UPDATE ON public.screens 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.screens ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for now (you can restrict this later)
CREATE POLICY "Allow all operations on screens" ON public.screens
    FOR ALL USING (true);

-- Insert some sample data
INSERT INTO public.screens (country, city, state, organization, projection, format, dimension, screen_type, seats, screen_size, opened_date) VALUES
    ('USA', 'Los Angeles', 'California', 'IMAX Corporation', 'Digital IMAX', '70mm', '3D', 'dome', 450, '80ft x 60ft', '2020-01-15'),
    ('Canada', 'Toronto', 'Ontario', 'Cineplex Entertainment', 'Digital IMAX', '4K', '2D', 'flat', 320, '60ft x 30ft', '2019-06-20'),
    ('UK', 'London', 'England', 'ODEON Cinemas', 'Digital IMAX', '4K', '3D', 'flat', 280, '50ft x 25ft', '2021-03-10'),
    ('Australia', 'Sydney', 'New South Wales', 'Event Cinemas', 'Digital IMAX', '4K', '2D', 'dome', 380, '70ft x 55ft', '2018-11-05'),
    ('Germany', 'Berlin', 'Berlin', 'UCI Kinowelt', 'Digital IMAX', '4K', '3D', 'flat', 250, '45ft x 22ft', '2022-07-12'),
    ('Japan', 'Tokyo', 'Tokyo', 'Toho Cinemas', 'Digital IMAX', '4K', '2D', 'flat', 300, '55ft x 28ft', '2020-09-18'),
    ('France', 'Paris', 'Île-de-France', 'Pathé Cinémas', 'Digital IMAX', '4K', '3D', 'dome', 420, '75ft x 58ft', '2021-12-03'),
    ('Brazil', 'São Paulo', 'São Paulo', 'Cinemark', 'Digital IMAX', '4K', '2D', 'flat', 290, '52ft x 26ft', '2019-04-25'),
    ('India', 'Mumbai', 'Maharashtra', 'PVR Cinemas', 'Digital IMAX', '4K', '3D', 'flat', 310, '58ft x 29ft', '2022-01-30'),
    ('South Korea', 'Seoul', 'Seoul', 'CGV', 'Digital IMAX', '4K', '2D', 'dome', 360, '65ft x 50ft', '2020-08-14');
