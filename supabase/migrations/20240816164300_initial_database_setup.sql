-- Create a limited service role for toilet map.
-- Give the role login privileges.

DO
$$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'toiletmap_web') THEN
        CREATE ROLE toiletmap_web WITH LOGIN;
    END IF;
END
$$;

ALTER ROLE toiletmap_web WITH PASSWORD 'toiletmap_web';
ALTER ROLE toiletmap_web SET search_path = "\$user", public, extensions, audit;

-- Enable postgis extension
CREATE EXTENSION IF NOT EXISTS postgis SCHEMA extensions;

/*
    Generic Audit Trigger
    Linear Time Record Version History

    Date:
        2022-02-03

    Purpose:
        Generic audit history for tables including an identifier
        to enable indexed linear time lookup of a primary key's version history

    Repository: https://github.com/supabase/supa_audit
*/

-- Create audit schema if not exists
CREATE SCHEMA IF NOT EXISTS audit;

-- Create enum type for SQL operations
CREATE TYPE audit.operation AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE'
);

-- Create audit record_version table
CREATE TABLE IF NOT EXISTS audit.record_version (
    id             BIGSERIAL PRIMARY KEY,  -- unique auto-incrementing id
    record_id      UUID,  -- identifies a record by primary key [primary key + table_oid]
    old_record_id  UUID,  -- identifies a record before update/delete
    op             audit.operation NOT NULL,  -- SQL operation
    ts             TIMESTAMPTZ NOT NULL DEFAULT NOW(),  -- timestamp of the operation
    table_oid      OID NOT NULL,  -- table object ID
    table_schema   NAME NOT NULL,  -- table schema name
    table_name     NAME NOT NULL,  -- table name
    record         JSONB,  -- contents of the new record
    old_record     JSONB,  -- previous record contents for UPDATE/DELETE
    auth_uid       UUID DEFAULT auth.uid(),  -- authenticated user ID
    auth_role      TEXT DEFAULT auth.role(),  -- authenticated user role
    CHECK (COALESCE(record_id, old_record_id) IS NOT NULL OR op = 'TRUNCATE'),
    CHECK (op IN ('INSERT', 'UPDATE') = (record_id IS NOT NULL)),
    CHECK (op IN ('INSERT', 'UPDATE') = (record IS NOT NULL)),
    CHECK (op IN ('UPDATE', 'DELETE') = (old_record_id IS NOT NULL)),
    CHECK (op IN ('UPDATE', 'DELETE') = (old_record IS NOT NULL))
);

-- Create indexes on record_version table for efficient querying
CREATE INDEX IF NOT EXISTS record_version_record_id ON audit.record_version(record_id) WHERE record_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS record_version_old_record_id ON audit.record_version(old_record_id) WHERE old_record_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS record_version_ts ON audit.record_version USING BRIN(ts);
CREATE INDEX IF NOT EXISTS record_version_table_oid ON audit.record_version(table_oid);

-- Functions to manage primary key columns and record IDs
CREATE OR REPLACE FUNCTION audit.primary_key_columns(entity_oid OID) RETURNS TEXT[] STABLE SECURITY DEFINER LANGUAGE SQL AS $$
    SELECT COALESCE(array_agg(pa.attname::text ORDER BY pa.attnum), array[]::text[])
    FROM pg_index pi
    JOIN pg_attribute pa ON pi.indrelid = pa.attrelid AND pa.attnum = ANY(pi.indkey)
    WHERE indrelid = $1 AND indisprimary
$$;

CREATE OR REPLACE FUNCTION audit.to_record_id(entity_oid OID, pkey_cols TEXT[], rec JSONB) RETURNS UUID STABLE LANGUAGE SQL AS $$
    SELECT CASE
        WHEN rec IS NULL THEN NULL
        WHEN pkey_cols = array[]::text[] THEN extensions.uuid_generate_v4()
        ELSE (
            SELECT uuid_generate_v5(
                'fd62bc3d-8d6e-43c2-919c-802ba3762271',
                (jsonb_build_array(to_jsonb($1)) || jsonb_agg($3 ->> key_))::text
            )
            FROM unnest($2) x(key_)
        )
    END
$$;

-- Trigger functions for audit logging
CREATE OR REPLACE FUNCTION audit.insert_update_delete_trigger() RETURNS TRIGGER SECURITY DEFINER LANGUAGE plpgsql AS $$
DECLARE
    pkey_cols TEXT[] = audit.primary_key_columns(TG_RELID);
    record_jsonb JSONB = TO_JSONB(NEW);
    record_id UUID = audit.to_record_id(TG_RELID, pkey_cols, record_jsonb);
    old_record_jsonb JSONB = TO_JSONB(OLD);
    old_record_id UUID = audit.to_record_id(TG_RELID, pkey_cols, old_record_jsonb);
BEGIN
    INSERT INTO audit.record_version(
        record_id,
        old_record_id,
        op,
        table_oid,
        table_schema,
        table_name,
        record,
        old_record
    ) VALUES (
        record_id,
        old_record_id,
        TG_OP::audit.operation,
        TG_RELID,
        TG_TABLE_SCHEMA,
        TG_TABLE_NAME,
        record_jsonb,
        old_record_jsonb
    );
    RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION audit.truncate_trigger() RETURNS TRIGGER SECURITY DEFINER SET search_path = '' LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO audit.record_version(op, table_oid, table_schema, table_name)
    VALUES (TG_OP::audit.operation, TG_RELID, TG_TABLE_SCHEMA, TG_TABLE_NAME);
    RETURN COALESCE(OLD, NEW);
END;
$$;

-- Functions to enable or disable audit tracking on a table
CREATE OR REPLACE FUNCTION audit.enable_tracking(regclass) RETURNS VOID VOLATILE SECURITY DEFINER SET search_path='' LANGUAGE plpgsql AS $$
DECLARE
    statement_row TEXT = FORMAT('
        CREATE TRIGGER audit_i_u_d
        AFTER INSERT OR UPDATE OR DELETE
        ON %s
        FOR EACH ROW
        EXECUTE FUNCTION audit.insert_update_delete_trigger();', $1);
    statement_stmt TEXT = FORMAT('
        CREATE TRIGGER audit_t
        AFTER TRUNCATE
        ON %s
        FOR EACH STATEMENT
        EXECUTE FUNCTION audit.truncate_trigger();', $1);
    pkey_cols TEXT[] = audit.primary_key_columns($1);
BEGIN
    IF pkey_cols = array[]::text[] THEN
        RAISE EXCEPTION 'Table % can not be audited because it has no primary key', $1;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgrelid = $1 AND tgname = 'audit_i_u_d') THEN
        EXECUTE statement_row;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgrelid = $1 AND tgname = 'audit_t') THEN
        EXECUTE statement_stmt;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION audit.disable_tracking(regclass) RETURNS VOID VOLATILE SECURITY DEFINER SET search_path='' LANGUAGE plpgsql AS $$
DECLARE
    statement_row TEXT = FORMAT('DROP TRIGGER IF EXISTS audit_i_u_d ON %s;', $1);
    statement_stmt TEXT = FORMAT('DROP TRIGGER IF EXISTS audit_t ON %s;', $1);
BEGIN
    EXECUTE statement_row;
    EXECUTE statement_stmt;
END;
$$;

-- Setup row-level security on audit.record_version
ALTER TABLE audit.record_version enable row level security;
GRANT ALL ON TABLE audit.record_version TO authenticated;
GRANT ALL ON TABLE audit.record_version TO service_role;
GRANT ALL ON TABLE audit.record_version TO anon;
GRANT ALL ON TABLE audit.record_version TO postgres;

-- End supa_audit

-- Create or update the public.areas table
CREATE TABLE IF NOT EXISTS public.areas (
    id CHARACTER(24) PRIMARY KEY,
    geometry GEOGRAPHY,
    name TEXT UNIQUE,
    priority INTEGER,
    type TEXT,
    dataset_id INTEGER,
    version INTEGER
);

-- Setup row-level security on public.areas
ALTER TABLE public.areas enable row level security;

-- Grant permissions on public.areas
ALTER TABLE IF EXISTS public.areas OWNER TO postgres;
GRANT ALL ON TABLE public.areas TO authenticated;
GRANT ALL ON TABLE public.areas TO service_role;
GRANT ALL ON TABLE public.areas TO anon;
GRANT ALL ON TABLE public.areas TO postgres;

-- Create audit triggers for public.areas
CREATE TRIGGER audit_i_u_d
    AFTER INSERT OR UPDATE OR DELETE
    ON public.areas
    FOR EACH ROW
    EXECUTE FUNCTION audit.insert_update_delete_trigger();

CREATE TRIGGER audit_t
    AFTER TRUNCATE
    ON public.areas
    FOR EACH STATEMENT
    EXECUTE FUNCTION audit.truncate_trigger();

-- Create or update the public.toilets table
CREATE TABLE IF NOT EXISTS public.toilets (
    id CHARACTER(24) PRIMARY KEY,
    created_at TIMESTAMPTZ,
    contributors TEXT[],
    accessible BOOLEAN,
    active BOOLEAN,
    attended BOOLEAN,
    automatic BOOLEAN,
    baby_change BOOLEAN,
    men BOOLEAN,
    name TEXT,
    no_payment BOOLEAN,
    notes TEXT,
    payment_details TEXT,
    radar BOOLEAN,
    removal_reason TEXT,
    women BOOLEAN,
    updated_at TIMESTAMPTZ,
    geography GEOGRAPHY,
    urinal_only BOOLEAN,
    all_gender BOOLEAN,
    children BOOLEAN,
    geohash TEXT GENERATED ALWAYS AS (st_geohash(geography)) STORED,
    verified_at TIMESTAMPTZ,
    area_id CHARACTER(24),
    opening_times JSONB,
    location JSONB GENERATED ALWAYS AS (st_asgeojson((geography)::geometry)::jsonb) STORED,
    CONSTRAINT toilets___area_id_fk FOREIGN KEY (area_id)
        REFERENCES public.areas (id)
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

-- Grant permissions on public.toilets
ALTER TABLE IF EXISTS public.toilets OWNER TO postgres;
GRANT ALL ON TABLE public.toilets TO authenticated;
GRANT ALL ON TABLE public.toilets TO service_role;
GRANT ALL ON TABLE public.toilets TO anon;
GRANT ALL ON TABLE public.toilets TO postgres;

-- Setup row-level security on public.toilets
ALTER TABLE public.toilets enable row level security;

-- Create audit triggers for public.toilets
CREATE TRIGGER audit_i_u_d
    AFTER INSERT OR UPDATE OR DELETE
    ON public.toilets
    FOR EACH ROW
    EXECUTE FUNCTION audit.insert_update_delete_trigger();

CREATE TRIGGER audit_t
    AFTER TRUNCATE
    ON public.toilets
    FOR EACH STATEMENT
    EXECUTE FUNCTION audit.truncate_trigger();

-- Function to automatically determine area_id based on geography
CREATE OR REPLACE FUNCTION public.determine_area_loo_is_within_on_upsert() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.area_id := (
        SELECT a.id
        FROM public.areas AS a
        WHERE ST_WITHIN(NEW.geography::geometry, a.geometry::geometry)
        LIMIT 1
    );
    RETURN NEW;
END;
$$;

-- Triggers to update area_id on insert or update
CREATE TRIGGER loo_area_trigger_update
    BEFORE UPDATE ON public.toilets
    FOR EACH ROW
    EXECUTE FUNCTION public.determine_area_loo_is_within_on_upsert();

CREATE TRIGGER loo_area_trigger_insert
    BEFORE INSERT ON public.toilets
    FOR EACH ROW
    EXECUTE FUNCTION public.determine_area_loo_is_within_on_upsert();

-- Begin service Role PERMISSIONS / RLS setup ---
GRANT USAGE ON SCHEMA public TO toiletmap_web;
GRANT USAGE ON SCHEMA audit TO toiletmap_web;
GRANT USAGE ON SCHEMA extensions TO toiletmap_web;

-- Grant permissions on extensions.spatial_ref_sys for correct PostGIS operation.
GRANT SELECT ON TABLE extensions.spatial_ref_sys TO toiletmap_web;

-- Grant permissions on public.toilets and modify RLS policies.
GRANT INSERT ON TABLE public.toilets TO toiletmap_web;
GRANT SELECT ON TABLE public.toilets TO toiletmap_web;
GRANT UPDATE ON TABLE public.toilets TO toiletmap_web;
GRANT REFERENCES ON TABLE public.toilets TO toiletmap_web;
GRANT TRIGGER ON TABLE public.toilets TO toiletmap_web;

GRANT EXECUTE ON FUNCTION public.determine_area_loo_is_within_on_upsert() TO toiletmap_web;
GRANT EXECUTE ON FUNCTION public.determine_area_loo_is_within_on_upsert() TO toiletmap_web;

CREATE POLICY select_policy ON public.toilets
    FOR SELECT
    TO toiletmap_web
    USING ( true );  -- Allows all selects

CREATE POLICY insert_policy ON public.toilets
    FOR INSERT
    TO toiletmap_web
    WITH CHECK (true);  -- Allows all inserts

CREATE POLICY update_policy ON public.toilets
    FOR UPDATE
    TO toiletmap_web
    USING (true);  -- Allows all updates

-- Grant permissions on public.areas and set RLS policies.
GRANT SELECT ON TABLE public.areas TO toiletmap_web;

CREATE POLICY select_policy ON public.areas
    FOR SELECT
    TO toiletmap_web
    USING ( true );  -- Allows all selects


-- Grant permissions on audit.record_version and set RLS policies.
GRANT SELECT ON TABLE audit.record_version TO toiletmap_web;
GRANT INSERT ON TABLE audit.record_version TO toiletmap_web;
GRANT UPDATE ON TABLE audit.record_version TO toiletmap_web;

CREATE POLICY select_policy ON audit.record_version
    FOR SELECT
    TO toiletmap_web
    USING ( true );  -- Allows all selects

CREATE POLICY insert_policy ON audit.record_version
    FOR INSERT
    TO toiletmap_web
    WITH CHECK (true);  -- Allows all inserts

CREATE POLICY update_policy ON audit.record_version
    FOR UPDATE
    TO toiletmap_web
    USING (true);  -- Allows all updates

-- End service Role PERMISSIONS / RLS setup ---
