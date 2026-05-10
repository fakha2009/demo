ALTER TABLE experiment_attempts
  ADD COLUMN IF NOT EXISTS reaction_slug TEXT,
  ADD COLUMN IF NOT EXISTS selected_reactants JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS equipment JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS used_heating BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS result_status TEXT,
  ADD COLUMN IF NOT EXISTS observation TEXT,
  ADD COLUMN IF NOT EXISTS duration_ms INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_experiment_attempts_reaction_id ON experiment_attempts (reaction_id);
CREATE INDEX IF NOT EXISTS idx_experiment_attempts_reaction_slug ON experiment_attempts (reaction_slug);
