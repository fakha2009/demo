ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

UPDATE users SET role = 'user' WHERE role IN ('student', 'teacher');

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS experiments_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_experiment_title TEXT;

ALTER TABLE users
  ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'admin'));

ALTER TABLE substances
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS color TEXT,
  ADD COLUMN IF NOT EXISTS danger_level TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

UPDATE substances
SET
  state = COALESCE(state, data->>'visualState', data->>'state', 'solution'),
  danger_level = COALESCE(danger_level, safety_level, data->>'safetyLevel', 'low'),
  description = COALESCE(description, data->>'description', '')
WHERE state IS NULL OR danger_level IS NULL OR description IS NULL;

ALTER TABLE reactions
  ADD COLUMN IF NOT EXISTS reactant_a_id TEXT,
  ADD COLUMN IF NOT EXISTS reactant_b_id TEXT,
  ADD COLUMN IF NOT EXISTS required_temperature TEXT,
  ADD COLUMN IF NOT EXISTS requires_catalyst BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS catalyst_id TEXT,
  ADD COLUMN IF NOT EXISTS liquid_color_before TEXT,
  ADD COLUMN IF NOT EXISTS liquid_color_after TEXT,
  ADD COLUMN IF NOT EXISTS has_gas BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_precipitate BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_heat BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_smoke BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_flash BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS danger_level TEXT,
  ADD COLUMN IF NOT EXISTS observation TEXT,
  ADD COLUMN IF NOT EXISTS safety TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

UPDATE reactions
SET
  reactant_a_id = COALESCE(reactant_a_id, reactants->>0),
  reactant_b_id = COALESCE(reactant_b_id, reactants->>1),
  required_temperature = COALESCE(required_temperature, data #>> '{conditions,temperature}', ''),
  liquid_color_after = COALESCE(liquid_color_after, liquid_color),
  has_gas = COALESCE(has_gas, gas_label IS NOT NULL OR visual_effect ? 'gas'),
  has_precipitate = COALESCE(has_precipitate, precipitate_color IS NOT NULL OR visual_effect ? 'precipitate'),
  has_heat = COALESCE(has_heat, requires_heating),
  has_smoke = COALESCE(has_smoke, visual_effect->>'type' = 'steam'),
  has_flash = COALESCE(has_flash, false),
  danger_level = COALESCE(danger_level, data #>> '{safety,level}', 'low'),
  observation = COALESCE(observation, data->>'observation', description, ''),
  safety = COALESCE(safety, safety_note, data->>'safetyNote', '')
WHERE true;

CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  details_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs (user_id);
