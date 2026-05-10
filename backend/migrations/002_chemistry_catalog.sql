ALTER TABLE substances
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS safety_level TEXT,
  ADD COLUMN IF NOT EXISTS ions JSONB NOT NULL DEFAULT '{}'::jsonb;

UPDATE substances SET slug = lower(regexp_replace(id, '[^a-zA-Z0-9]+', '-', 'g')) WHERE slug IS NULL;

ALTER TABLE substances
  ALTER COLUMN slug SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_substances_slug_unique ON substances (slug);

ALTER TABLE reactions
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS equation TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS reactants JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS products JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS required_equipment JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS requires_heating BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS visual_effect JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS liquid_color TEXT,
  ADD COLUMN IF NOT EXISTS precipitate_color TEXT,
  ADD COLUMN IF NOT EXISTS gas_label TEXT,
  ADD COLUMN IF NOT EXISTS safety_note TEXT,
  ADD COLUMN IF NOT EXISTS explanation TEXT,
  ADD COLUMN IF NOT EXISTS difficulty TEXT NOT NULL DEFAULT 'medium';

UPDATE reactions SET slug = lower(regexp_replace(id, '[^a-zA-Z0-9]+', '-', 'g')) WHERE slug IS NULL;

ALTER TABLE reactions
  ALTER COLUMN slug SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_reactions_slug_unique ON reactions (slug);

CREATE TABLE IF NOT EXISTS reaction_substances (
  reaction_id TEXT NOT NULL REFERENCES reactions(id) ON DELETE CASCADE,
  substance_id TEXT NOT NULL REFERENCES substances(id) ON DELETE RESTRICT,
  role TEXT NOT NULL CHECK (role IN ('reactant', 'product')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (reaction_id, substance_id, role)
);

CREATE INDEX IF NOT EXISTS idx_reaction_substances_reaction_id ON reaction_substances (reaction_id);
CREATE INDEX IF NOT EXISTS idx_reaction_substances_substance_id ON reaction_substances (substance_id);
