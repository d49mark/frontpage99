-- ============================================================================
-- FRONTPAGE99.IN — PRODUCTION POSTGRESQL SCHEMA (Neon.tech / Supabase)
-- Strict 2-Day Window (Today & Tomorrow) • Flat ₹99/day • Section 79 IT Act & DPDP Compliant
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Slot Lifecycle Status Enum
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

-- 2. Verified Indian Cities Registry (Cached from Open-Meteo Geocoding API)
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

CREATE INDEX IF NOT EXISTS idx_cities_country_code ON cities(country_code);

-- 3. Daily Billboard Slots (Strictly 1 Slot Per City Per IST Calendar Date)
CREATE TABLE IF NOT EXISTS daily_slots (
  slot_id VARCHAR(96) PRIMARY KEY, -- e.g. 'bengaluru-2026-10-29'
  city_slug VARCHAR(64) NOT NULL REFERENCES cities(slug) ON DELETE CASCADE,
  slot_date DATE NOT NULL,         -- IST Date (YYYY-MM-DD)
  status slot_status NOT NULL DEFAULT 'EMPTY',
  price_paise INTEGER NOT NULL DEFAULT 9900, -- Flat ₹99.00 (9900 paise)

  -- Constrained Poster Typography & Visual Metadata
  business_name VARCHAR(60),
  category VARCHAR(48),
  headline VARCHAR(120),
  subtext VARCHAR(220),
  contact_phone VARCHAR(15),
  theme_id VARCHAR(40),

  -- JSONB for Brand Logo mode, Google Maps Trust badge, Animated Stickers & Vector Doodles
  visual_payload JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- 5-Minute Concurrency Lock & Razorpay/Cashfree Order Tracking
  reservation_expires_at TIMESTAMPTZ,
  gateway_order_id VARCHAR(96),
  gateway_payment_id VARCHAR(96),

  -- 180-Day CERT-In / IT Act KYC Audit Trail & Self-Serve Takedown Token
  merchant_upi_vpa VARCHAR(120),
  secret_takedown_token CHAR(6),
  booked_at TIMESTAMPTZ,
  taken_down_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_city_slot_date UNIQUE (city_slug, slot_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_slots_city_date ON daily_slots(city_slug, slot_date);
CREATE INDEX IF NOT EXISTS idx_daily_slots_anti_squatter
  ON daily_slots(city_slug, slot_date, contact_phone, merchant_upi_vpa);

-- 4. Aggregated Slot Analytics (Synced from Upstash Redis / Atomic Postgres Fallback)
CREATE TABLE IF NOT EXISTS slot_analytics (
  slot_id VARCHAR(96) PRIMARY KEY REFERENCES daily_slots(slot_id) ON DELETE CASCADE,
  city_slug VARCHAR(64) NOT NULL,
  views_count BIGINT NOT NULL DEFAULT 0,
  claims_count BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. DPDP-Compliant Daily Salted SHA-256 View Deduplication Logs
-- Zero raw IP storage: stores SHA-256(client_ip || user_agent || slot_date || DPDP_HASH_SALT)
CREATE TABLE IF NOT EXISTS daily_view_logs (
  id BIGSERIAL PRIMARY KEY,
  slot_id VARCHAR(96) NOT NULL REFERENCES daily_slots(slot_id) ON DELETE CASCADE,
  client_hash CHAR(64) NOT NULL,
  event_type VARCHAR(16) NOT NULL DEFAULT 'view', -- 'view' or 'claim'
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_slot_client UNIQUE (slot_id, client_hash, event_type)
);

CREATE INDEX IF NOT EXISTS idx_daily_view_logs_slot ON daily_view_logs(slot_id);
