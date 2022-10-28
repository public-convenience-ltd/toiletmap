ALTER TABLE IF EXISTS public.toilets DROP COLUMN IF EXISTS location;

ALTER TABLE "toilets"
ADD COLUMN "location" jsonb
GENERATED ALWAYS AS (st_asgeojson((toilets.geography)::geometry)::jsonb) STORED;
