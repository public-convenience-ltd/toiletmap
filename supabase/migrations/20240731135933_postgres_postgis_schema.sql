-- We need to create the postgis extension in the extensions schema

-- Originally, the postgis extension is created in the public schema
-- which led to issues with the row level security policies because
-- it was created using system level permissions which can't be modified easily.
DROP EXTENSION postgis CASCADE;
CREATE EXTENSION postgis SCHEMA extensions;

-- Enable RLS on our tables
alter table "toilets" enable row level security;
alter table "areas" enable row level security;


-- Add the geography column back to the toilets table
ALTER TABLE public.toilets
ADD COLUMN geography geography;

-- Add the geohash column back as a generated column
ALTER TABLE public.toilets
ADD COLUMN geohash text GENERATED ALWAYS AS (st_geohash(geography)) STORED;

-- Add the location column back as a generated column
ALTER TABLE public.toilets
ADD COLUMN location jsonb GENERATED ALWAYS AS (st_asgeojson((geography)::geometry)::jsonb) STORED;


-- Add the geometry column back to the areas table
ALTER TABLE public.areas
ADD COLUMN geometry geography;
