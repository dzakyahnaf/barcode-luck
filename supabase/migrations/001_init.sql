-- =============================================
-- QR Campaign Database Schema
-- =============================================

-- Table: scan_entries
-- Stores every unique participant (one row per identifier)
CREATE TABLE scan_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL UNIQUE, -- SHA-256 hash of phone number
  ip_address TEXT,
  won BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: winner_codes
-- Stores unique redemption codes for winners
CREATE TABLE winner_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,              -- 8-char alphanumeric uppercase
  scan_entry_id UUID REFERENCES scan_entries(id) ON DELETE SET NULL,
  claimed BOOLEAN NOT NULL DEFAULT false,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Performance indexes
CREATE INDEX idx_scan_entries_identifier ON scan_entries(identifier);
CREATE INDEX idx_winner_codes_code ON winner_codes(code);
CREATE INDEX idx_winner_codes_claimed ON winner_codes(claimed);

-- Enable Row Level Security (RLS)
-- All reads/writes go through service role key on the server
ALTER TABLE scan_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE winner_codes ENABLE ROW LEVEL SECURITY;

-- No public access policies — service role bypasses RLS by default
-- Anon users cannot read or write to any table
