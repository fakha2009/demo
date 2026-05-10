CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique ON users (email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_elements_symbol_unique ON elements (symbol);
CREATE UNIQUE INDEX IF NOT EXISTS idx_substances_slug_unique ON substances (slug);
CREATE UNIQUE INDEX IF NOT EXISTS idx_reactions_slug_unique ON reactions (slug);

CREATE INDEX IF NOT EXISTS idx_experiment_attempts_user_id ON experiment_attempts (user_id);
CREATE INDEX IF NOT EXISTS idx_progress_events_user_id ON progress_events (user_id);

CREATE INDEX IF NOT EXISTS idx_reactions_reactants_gin ON reactions USING GIN (reactants);
CREATE INDEX IF NOT EXISTS idx_reactions_products_gin ON reactions USING GIN (products);
CREATE INDEX IF NOT EXISTS idx_reactions_required_equipment_gin ON reactions USING GIN (required_equipment);
CREATE INDEX IF NOT EXISTS idx_reactions_visual_effect_gin ON reactions USING GIN (visual_effect);
