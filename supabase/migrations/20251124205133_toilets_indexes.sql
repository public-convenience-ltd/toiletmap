-- 1. Timestamp Indexes
-- Purpose: Optimizes sorting and filtering by recency (e.g., "Recently verified toilets" or data syncs).
-- These are standard B-tree indexes as we typically query ranges or sort order here.
CREATE INDEX IF NOT EXISTS "toilets_verified_at_idx" ON "public"."toilets" ("verified_at");
CREATE INDEX IF NOT EXISTS "toilets_updated_at_idx" ON "public"."toilets" ("updated_at");

-- 2. Composite Geohash Index
-- Purpose: Optimizes map queries that fetch "Active toilets within a specific area".
--
-- Technical Details:
-- A) "geohash text_pattern_ops":
--    Standard PostgreSQL indexes cannot always optimize "LIKE 'prefix%'" queries depending on locale.
--    We explicitly use "text_pattern_ops" to support fast prefix lookups (e.g., WHERE geohash LIKE 'gc7%').
--
-- B) Composite with "active":
--    Most map queries filter out inactive/closed toilets.
--    By including "active" as the second column, PostgreSQL can filter by location AND status
--    in a single index scan, avoiding a costly heap lookup for every potential match.
CREATE INDEX IF NOT EXISTS "idx_toilets_geohash_active"
  ON "public"."toilets" ("geohash" text_pattern_ops, "active");
