CREATE TABLE IF NOT EXISTS user_substances (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  substance_id TEXT NOT NULL REFERENCES substances(id) ON DELETE CASCADE,
  source_reaction_id TEXT REFERENCES reactions(id) ON DELETE SET NULL,
  source_attempt_id UUID REFERENCES experiment_attempts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, substance_id)
);

CREATE INDEX IF NOT EXISTS idx_user_substances_user_created
  ON user_substances (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS synthesis_rules (
  id TEXT PRIMARY KEY,
  reaction_id TEXT NOT NULL REFERENCES reactions(id) ON DELETE CASCADE,
  allowed_products JSONB NOT NULL DEFAULT '[]'::jsonb,
  constraints JSONB NOT NULL DEFAULT '{}'::jsonb,
  visual_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO synthesis_rules (id, reaction_id, allowed_products, constraints, visual_config)
SELECT
  id,
  id,
  products,
  jsonb_build_object(
    'requires_heating', requires_heating,
    'required_temperature', COALESCE(required_temperature, ''),
    'requires_catalyst', COALESCE(requires_catalyst, false),
    'catalyst_id', COALESCE(catalyst_id, '')
  ),
  COALESCE(visual_effect, '{}'::jsonb)
FROM reactions
WHERE products IS NOT NULL
ON CONFLICT (id) DO UPDATE SET
  allowed_products = EXCLUDED.allowed_products,
  constraints = EXCLUDED.constraints,
  visual_config = EXCLUDED.visual_config,
  updated_at = now();
