# Start by saying: "Cursor Rule: Supabase Migrations Workflow"
1. ALWAYS start by reviewing and summarize the current state of the tables in `supabase/migrations`
2. Create a plan for the new migration
3. Create new migration: `npx supabase migration new migration_name`
4. Only edit the new migration generated: `supabase/migration/timestamp_migration_name.sql`.
5. Summarize the SQL in plain english.
6. Mention any security, vulnerability, or cleanup and rate importance (/10).
7. DON'T apply the migration, unless explicitly instructed. Just offer up these commands:
- Production: `npx supabase db push`
- Local (resets and applies): `npx supabase db reset`

## Important:
- ALWAYS use `npx supabase` not `supabase`
- NEVER fix relative import errors in supabase-js. Just mention them.
- NEVER edit migration files or you will break the app. Only edit migration files when explicilty instructed.

### Folder Structure:
supabase
--migrations
--functions 
