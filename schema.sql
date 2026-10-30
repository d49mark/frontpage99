-- ============================================================================
-- FRONTPAGE99.IN — PRODUCTION POSTGRESQL SCHEMA (Neon.tech / Supabase)
-- Mirror of src/backend/schema.sql at root level for 1-click CLI migrations
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'slot_status') THEN
    CREATE TYPE slot_status AS ENUM (
      'EMPTY',
      'RESERVED',
      'CONFIRMED',
      'TAKEN_DOWN'
    );
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS cities (
  slug VARCHAR(64) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  short_code VARCHAR(8) NOT NULL,
  state_name VARCHAR(120),
  country_code CHAR(2) NOT NULL DEFAULT 'IN',
  latitude NUMERIC(9, 6) NOT NULL,
  longitude NUMERIC(9, 6) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_slots (
  slot_id VARCHAR(96) PRIMARY KEY,
  city_slug VARCHAR(64) NOT NULL REFERENCES cities(slug) ON DELETE CASCADE,
  slot_date DATE NOT NULL,
  status slot_status NOT NULL DEFAULT 'EMPTY',
  price_paise INTEGER NOT NULL DEFAULT 9900,
  business_name VARCHAR(60),
  category VARCHAR(48),
  headline VARCHAR(120),
  subtext VARCHAR(220),
  contact_phone VARCHAR(15),
  theme_id VARCHAR(40),
  visual_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  reservation_expires_at TIMESTAMPTZ,
  gateway_order_id VARCHAR(96),
  gateway_payment_id VARCHAR(96),
  merchant_upi_vpa VARCHAR(120),
  secret_takedown_token CHAR(6),
  booked_at TIMESTAMPTZ,
  taken_down_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_city_slot_date UNIQUE (city_slug, slot_date)
);

CREATE TABLE IF NOT EXISTS slot_analytics (
  slot_id VARCHAR(96) PRIMARY KEY REFERENCES daily_slots(slot_id) ON DELETE CASCADE,
  city_slug VARCHAR(64) NOT NULL,
  views_count BIGINT NOT NULL DEFAULT 0,
  claims_count BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_view_logs (
  id BIGSERIAL PRIMARY KEY,
  slot_id VARCHAR(96) NOT NULL REFERENCES daily_slots(slot_id) ON DELETE CASCADE,
  client_hash CHAR(64) NOT NULL,
  event_type VARCHAR(16) NOT NULL DEFAULT 'view',
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_slot_client UNIQUE (slot_id, client_hash, event_type)
);
