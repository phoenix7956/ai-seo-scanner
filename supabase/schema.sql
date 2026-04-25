-- AISEO Scanner Database Schema (Supabase/PostgreSQL)

-- Users table (tracks credits per browser session/device)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id TEXT UNIQUE NOT NULL, -- browser cookie/localStorage ID
  credits INTEGER DEFAULT 1,       -- start with 1 free scan
  is_first_purchase BOOLEAN DEFAULT TRUE, -- track first purchase offer
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Scans table
CREATE TABLE IF NOT EXISTS scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  visitor_id TEXT NOT NULL,
  url TEXT NOT NULL,
  overall_score INTEGER,
  score_schema INTEGER,
  score_content INTEGER,
  score_technical INTEGER,
  score_trust INTEGER,
  critical_count INTEGER DEFAULT 0,
  issues JSONB, -- full issue list (paid only)
  is_paid BOOLEAN DEFAULT FALSE,
  credits_used INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Purchases table (track what user bought)
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  visitor_id TEXT NOT NULL,
  lemonsqueezy_order_id TEXT UNIQUE,
  product_name TEXT,
  credits_purchased INTEGER DEFAULT 5, -- first offer: $0.99 = 5 scans
  amount_cents INTEGER,               -- e.g. 99 = $0.99
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending',       -- pending, completed, refunded
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_visitor_id ON users(visitor_id);
CREATE INDEX IF NOT EXISTS idx_scans_visitor_id ON scans(visitor_id);
CREATE INDEX IF NOT EXISTS idx_scans_user_id ON scans(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_visitor_id ON purchases(visitor_id);
CREATE INDEX IF NOT EXISTS idx_purchases_order_id ON purchases(lemonsqueezy_order_id);

-- RLS (Row Level Security) - allow all for now, tighten later
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Allow all operations (we'll use API routes as middleware)
DROP POLICY IF EXISTS "Allow all" ON users;
CREATE POLICY "Allow all" ON users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all" ON scans;
CREATE POLICY "Allow all" ON scans FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all" ON purchases;
CREATE POLICY "Allow all" ON purchases FOR ALL USING (true) WITH CHECK (true);
