# Historical Migrations

> **⚠️ This folder is for reference only**

The migrations in this folder were used during initial development. For the current schema, use the files in `../schema/` folder.

## Current Schema

The database schema is now organized in `../schema/`:

```
schema/
├── 000_extensions.sql       # PostgreSQL extensions
├── 001_tables.sql           # All table definitions
├── 002_indexes.sql          # Performance indexes
├── 003_rls_policies.sql     # Row Level Security policies
├── 004_functions.sql        # Stored procedures & functions
├── 005_triggers.sql         # Database triggers
├── 006_views.sql            # Analytics views
└── 007_grants.sql           # Permission grants
```

## For New Databases

Run the schema files in order (000 → 007) in Supabase SQL Editor.

## For Existing Databases

The schema files are idempotent (safe to re-run). They use:
- `CREATE TABLE IF NOT EXISTS`
- `CREATE INDEX IF NOT EXISTS`
- `DROP POLICY IF EXISTS` before `CREATE POLICY`
- `CREATE OR REPLACE FUNCTION`
- `DROP TRIGGER IF EXISTS` before `CREATE TRIGGER`
