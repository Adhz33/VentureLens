-- Enable required extensions for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Add unique constraint for deduplication of funding data
ALTER TABLE public.funding_data ADD CONSTRAINT funding_data_startup_round_unique 
  UNIQUE NULLS NOT DISTINCT (startup_name, funding_round);

-- Add url uniqueness constraint for data sources
ALTER TABLE public.data_sources ADD CONSTRAINT data_sources_url_unique UNIQUE (url);