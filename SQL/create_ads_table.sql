-- Create ads table if it doesn't exist
-- This script safely creates the ads table with all indexes

-- Create the ads table
CREATE TABLE IF NOT EXISTS public.ads (
	_id uuid NOT NULL,
	id varchar(255) NULL,
	ad_creation_time date NULL,
	ad_delivery_start_time timestamp NULL,
	ad_delivery_stop_time timestamp NULL,
	page_id varchar(255) NULL,
	page_name text NULL,
	target_gender varchar(50) NULL,
	eu_total_reach int4 NULL,
	snapshot_ad_creative_id varchar(255) NULL,
	snapshot_display_format varchar(50) NULL,
	snapshot_link_url text NULL,
	snapshot_creation_time int8 NULL,
	snapshot_instagram_actor_name text NULL,
	snapshot_page_like_count int4 NULL,
	snapshot_page_profile_uri text NULL,
	snapshot_cta_type varchar(50) NULL,
	snapshot_additional_info text NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	scraper_name varchar(255) DEFAULT 'new_ads_scraper'::character varying NULL,
	active bool DEFAULT true NULL,
	CONSTRAINT ads_pkey PRIMARY KEY (_id)
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_ad_delivery_stop_time ON public.ads USING btree (ad_delivery_stop_time);
CREATE INDEX IF NOT EXISTS idx_ads_created_at ON public.ads USING btree (created_at);
CREATE INDEX IF NOT EXISTS idx_ads_delivery_stop ON public.ads USING btree (ad_delivery_stop_time) WHERE (ad_delivery_stop_time IS NULL);
CREATE INDEX IF NOT EXISTS idx_ads_id_created_date ON public.ads USING btree (id, created_at);
CREATE INDEX IF NOT EXISTS idx_ads_page_id ON public.ads USING btree (page_id);
CREATE INDEX IF NOT EXISTS idx_ads_page_id_created_at ON public.ads USING btree (page_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ads_snapshot_ad_created_at ON public.ads USING btree (snapshot_ad_creative_id, created_at);
CREATE INDEX IF NOT EXISTS idx_scraper_name ON public.ads USING btree (scraper_name);

-- Note: The gin_trgm_ops index requires the pg_trgm extension
-- Enable pg_trgm extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_ads_snapshot_link_url_trgm ON public.ads USING gin (snapshot_link_url gin_trgm_ops);

-- Display confirmation
\echo 'Ads table and indexes created successfully!'
