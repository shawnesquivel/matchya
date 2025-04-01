GRANT USAGE ON SCHEMA ih TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA ih TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA ih TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA ih TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA ih GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA ih GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA ih GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;