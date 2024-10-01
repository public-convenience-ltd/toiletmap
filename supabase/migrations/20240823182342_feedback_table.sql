-- We use this to store feedback from our users
CREATE TABLE IF NOT EXISTS public.feedback (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255),
    feedback_text VARCHAR(5000) NOT NULL,
    route VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Grant permissions on public.feedback
ALTER TABLE IF EXISTS public.feedback OWNER TO postgres;
GRANT ALL ON TABLE public.feedback TO anon;
GRANT ALL ON TABLE public.feedback TO authenticated;
GRANT ALL ON TABLE public.feedback TO service_role;
GRANT ALL ON TABLE public.feedback TO postgres;

GRANT SELECT ON TABLE public.feedback TO toiletmap_web;
GRANT INSERT ON TABLE public.feedback TO toiletmap_web;
GRANT USAGE, SELECT ON SEQUENCE public.feedback_id_seq TO toiletmap_web;

-- Setup row-level security on public.feedback
ALTER TABLE public.feedback enable row level security;

CREATE POLICY select_policy ON public.feedback
    FOR SELECT
    TO toiletmap_web
    USING (true);

-- Allow only inserts
CREATE POLICY insert_policy ON public.feedback
    FOR INSERT
    TO toiletmap_web
    WITH CHECK (true);  -- Allows all inserts
