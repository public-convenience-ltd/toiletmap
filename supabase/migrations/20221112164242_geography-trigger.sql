-- Ensures that a relation is created between loos and the area that they belong to.

CREATE OR REPLACE FUNCTION determine_area_loo_is_within_on_upsert()
  RETURNS trigger AS
    $$
    BEGIN
      NEW.area_id := (
        SELECT a.id
        FROM areas AS a
        WHERE ST_WITHIN(NEW.geography::geometry, a.geometry::geometry)
        LIMIT 1
      );
      RETURN NEW;
    END;
    $$
  LANGUAGE 'plpgsql'
;

CREATE TRIGGER loo_area_trigger_update
  BEFORE UPDATE ON public.toilets
  FOR EACH ROW
  EXECUTE PROCEDURE determine_area_loo_is_within_on_upsert()
;

CREATE TRIGGER loo_area_trigger_insert
  BEFORE INSERT ON public.toilets
  FOR EACH ROW
  EXECUTE PROCEDURE determine_area_loo_is_within_on_upsert()
;

