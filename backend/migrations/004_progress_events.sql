ALTER TABLE progress_events
  ADD COLUMN IF NOT EXISTS attempt_id UUID REFERENCES experiment_attempts(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_progress_events_attempt_id ON progress_events (attempt_id);
CREATE INDEX IF NOT EXISTS idx_progress_events_event_type ON progress_events (event_type);
