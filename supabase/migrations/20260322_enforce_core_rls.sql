-- Enforce Row Level Security (RLS) on core tables for production

-- 1. PROFILES
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Users can fully manage their own profiles"
    ON public.profiles
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. SAVED RESUMES
ALTER TABLE IF EXISTS public.saved_resumes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Users can fully manage their own saved_resumes"
    ON public.saved_resumes
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. OPT STATUS
ALTER TABLE IF EXISTS public.opt_status ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Users can fully manage their own opt_status"
    ON public.opt_status
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 4. CASE STATUS
ALTER TABLE IF EXISTS public.case_status ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Users can fully manage their own case_status"
    ON public.case_status
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 5. DOCUMENTS
ALTER TABLE IF EXISTS public.documents ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Users can fully manage their own documents"
    ON public.documents
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 6. JOB APPLICATIONS
ALTER TABLE IF EXISTS public.job_applications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Users can fully manage their own job_applications"
    ON public.job_applications
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 7. H1B_SPONSORS
-- Public registry or read-only directory
ALTER TABLE IF EXISTS public.h1b_sponsors ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Anyone can read h1b_sponsors"
    ON public.h1b_sponsors
    FOR SELECT
    USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;
