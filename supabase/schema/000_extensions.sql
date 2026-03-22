-- ╔══════════════════════════════════════════════════════════════════════════════╗
-- ║                           TRACKMYOPT DATABASE                                 ║
-- ║                         PostgreSQL Extensions                                 ║
-- ╠══════════════════════════════════════════════════════════════════════════════╣
-- ║  File: 000_extensions.sql                                                     ║
-- ║  Purpose: Enable required PostgreSQL extensions                               ║
-- ║  Run: FIRST - Before any other schema files                                   ║
-- ╚══════════════════════════════════════════════════════════════════════════════╝

-- =============================================================================
-- REQUIRED EXTENSIONS
-- =============================================================================
-- These extensions are required for TrackMyOPT functionality

-- UUID Generation (for primary keys)
-- Provides uuid_generate_v4() function
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- Cryptographic Functions (for password hashing)
-- Provides pgcrypto functions like crypt(), gen_salt()
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

-- =============================================================================
-- VERIFICATION
-- =============================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Extensions enabled successfully';
  RAISE NOTICE '   - uuid-ossp (UUID generation)';
  RAISE NOTICE '   - pgcrypto (Cryptographic functions)';
END $$;
