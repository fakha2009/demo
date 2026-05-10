package repositories

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"chemlab-tj/backend/internal/models"
)

type Store struct {
	db *sql.DB
}

func NewStore(db *sql.DB) *Store {
	return &Store{db: db}
}

func (s *Store) DB() *sql.DB {
	return s.db
}

func (s *Store) Ping(ctx context.Context) error {
	ctx, cancel := context.WithTimeout(ctx, 2*time.Second)
	defer cancel()
	return s.db.PingContext(ctx)
}

func (s *Store) CatalogDocument(ctx context.Context, table, field, fallbackFile string, limit, offset int) (json.RawMessage, error) {
	if limit <= 0 || limit > 500 {
		limit = 200
	}
	if offset < 0 {
		offset = 0
	}

	where := ""
	if table == "substances" || table == "reactions" {
		where = " WHERE is_active = true"
	}
	rows, err := s.db.QueryContext(ctx, fmt.Sprintf("SELECT data FROM %s%s ORDER BY sort_order, id LIMIT $1 OFFSET $2", table, where), limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []json.RawMessage
	for rows.Next() {
		var raw json.RawMessage
		if err := rows.Scan(&raw); err != nil {
			return nil, err
		}
		items = append(items, raw)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	if len(items) == 0 {
		return readSeedData(fallbackFile)
	}

	doc, err := json.Marshal(map[string]any{
		field: items,
		"pagination": map[string]int{
			"limit":  limit,
			"offset": offset,
			"count":  len(items),
		},
	})
	if err != nil {
		return nil, err
	}
	return doc, nil
}

func (s *Store) ReactionByID(ctx context.Context, id string) (json.RawMessage, bool, error) {
	var raw json.RawMessage
	err := s.db.QueryRowContext(ctx, "SELECT data FROM reactions WHERE (id = $1 OR slug = $1) AND is_active = true", id).Scan(&raw)
	if err == nil {
		return raw, true, nil
	}
	if !errors.Is(err, sql.ErrNoRows) {
		return nil, false, err
	}

	doc, err := readSeedData("reactions.json")
	if err != nil {
		return nil, false, err
	}
	var parsed struct {
		Reactions []json.RawMessage `json:"reactions"`
	}
	if err := json.Unmarshal(doc, &parsed); err != nil {
		return nil, false, err
	}
	for _, reaction := range parsed.Reactions {
		var probe struct {
			ID string `json:"id"`
		}
		if json.Unmarshal(reaction, &probe) == nil && probe.ID == id {
			return reaction, true, nil
		}
	}
	return nil, false, nil
}

func (s *Store) CreateUser(ctx context.Context, email, name, passwordHash string) (models.User, error) {
	var user models.User
	err := s.db.QueryRowContext(ctx, `
		INSERT INTO users (email, name, role, password_hash)
		VALUES ($1, $2, 'user', $3)
		RETURNING id::text, email, name, role, status, password_hash, created_at, updated_at, last_active_at, experiments_count, COALESCE(last_experiment_title, '')
	`, strings.ToLower(email), name, passwordHash).Scan(
		&user.ID, &user.Email, &user.Name, &user.Role, &user.Status, &user.PasswordHash, &user.CreatedAt, &user.UpdatedAt, &user.LastActiveAt, &user.ExperimentsCount, &user.LastExperimentTitle,
	)
	return user, err
}

func (s *Store) UserByEmail(ctx context.Context, email string) (models.User, error) {
	var user models.User
	err := s.db.QueryRowContext(ctx, `
		SELECT id::text, email, name, role, status, password_hash, created_at, updated_at, last_active_at, experiments_count, COALESCE(last_experiment_title, '')
		FROM users
		WHERE email = $1
	`, strings.ToLower(email)).Scan(
		&user.ID, &user.Email, &user.Name, &user.Role, &user.Status, &user.PasswordHash, &user.CreatedAt, &user.UpdatedAt, &user.LastActiveAt, &user.ExperimentsCount, &user.LastExperimentTitle,
	)
	return user, err
}

func (s *Store) UserByID(ctx context.Context, id string) (models.User, error) {
	var user models.User
	err := s.db.QueryRowContext(ctx, `
		SELECT id::text, email, name, role, status, password_hash, created_at, updated_at, last_active_at, experiments_count, COALESCE(last_experiment_title, '')
		FROM users
		WHERE id = $1
	`, id).Scan(&user.ID, &user.Email, &user.Name, &user.Role, &user.Status, &user.PasswordHash, &user.CreatedAt, &user.UpdatedAt, &user.LastActiveAt, &user.ExperimentsCount, &user.LastExperimentTitle)
	return user, err
}

func (s *Store) TouchUser(ctx context.Context, id string) {
	_, _ = s.db.ExecContext(ctx, "UPDATE users SET last_active_at = now(), updated_at = now() WHERE id = $1", id)
}

func (s *Store) CreateAttempt(ctx context.Context, userID string, req models.ExperimentAttemptRequest) (models.ExperimentAttempt, error) {
	input := normalizeJSON(req.Input)
	result := normalizeJSON(req.Result)
	selectedReactants := normalizeJSONArray(req.SelectedReactants)
	equipment := normalizeJSONArray(req.Equipment)

	var attempt models.ExperimentAttempt
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return attempt, err
	}
	defer tx.Rollback()

	err = tx.QueryRowContext(ctx, `
		INSERT INTO experiment_attempts (
			user_id, reaction_id, reaction_slug, selected_reactants, equipment,
			used_heating, result_status, observation, duration_ms, input, result
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		RETURNING
			id::text, user_id::text, reaction_id, COALESCE(reaction_slug, ''),
			selected_reactants, equipment, used_heating, COALESCE(result_status, ''),
			COALESCE(observation, ''), duration_ms, input, result, created_at
	`, userID, req.ReactionID, req.ReactionSlug, selectedReactants, equipment, req.UsedHeating, req.ResultStatus, req.Observation, req.DurationMS, input, result).Scan(
		&attempt.ID, &attempt.UserID, &attempt.ReactionID, &attempt.ReactionSlug,
		&attempt.SelectedReactants, &attempt.Equipment, &attempt.UsedHeating,
		&attempt.ResultStatus, &attempt.Observation, &attempt.DurationMS,
		&attempt.Input, &attempt.Result, &attempt.CreatedAt,
	)
	if err != nil {
		return attempt, err
	}

	payload, _ := json.Marshal(map[string]any{
		"attempt_id":  attempt.ID,
		"reaction_id": attempt.ReactionID,
		"status":      attempt.ResultStatus,
		"observation": attempt.Observation,
	})
	title := attempt.ReactionID
	_ = tx.QueryRowContext(ctx, `SELECT COALESCE(title, id) FROM reactions WHERE id = $1`, attempt.ReactionID).Scan(&title)
	_, err = tx.ExecContext(ctx, `
		UPDATE users
		SET experiments_count = experiments_count + 1,
		    last_experiment_title = $1,
		    last_active_at = now(),
		    updated_at = now()
		WHERE id = $2
	`, title, userID)
	if err != nil {
		return attempt, err
	}
	_, err = tx.ExecContext(ctx, `
		INSERT INTO progress_events (user_id, attempt_id, event_type, payload)
		VALUES ($1, $2, 'experiment_attempt_created', $3)
	`, userID, attempt.ID, payload)
	if err != nil {
		return attempt, err
	}
	_, err = tx.ExecContext(ctx, `
		INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details_json)
		VALUES ($1, 'experiment_run', 'reaction', $2, $3)
	`, userID, attempt.ReactionID, payload)
	if err != nil {
		return attempt, err
	}

	return attempt, tx.Commit()
}

func (s *Store) ProgressForUser(ctx context.Context, userID string, limit, offset int) (map[string]any, error) {
	attempts, err := s.attemptsForUser(ctx, userID, limit, offset)
	if err != nil {
		return nil, err
	}
	events, err := s.eventsForUser(ctx, userID)
	if err != nil {
		return nil, err
	}
	return map[string]any{
		"attempts": attempts,
		"events":   events,
		"summary":  progressSummary(attempts),
	}, nil
}

func (s *Store) attemptsForUser(ctx context.Context, userID string, limit, offset int) ([]models.ExperimentAttempt, error) {
	if limit <= 0 || limit > 100 {
		limit = 50
	}
	if offset < 0 {
		offset = 0
	}
	rows, err := s.db.QueryContext(ctx, `
		SELECT
			id::text, user_id::text, reaction_id, COALESCE(reaction_slug, ''),
			selected_reactants, equipment, used_heating, COALESCE(result_status, ''),
			COALESCE(observation, ''), duration_ms, input, result, created_at
		FROM experiment_attempts
		WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`, userID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var attempts []models.ExperimentAttempt
	for rows.Next() {
		var attempt models.ExperimentAttempt
		if err := rows.Scan(
			&attempt.ID, &attempt.UserID, &attempt.ReactionID, &attempt.ReactionSlug,
			&attempt.SelectedReactants, &attempt.Equipment, &attempt.UsedHeating,
			&attempt.ResultStatus, &attempt.Observation, &attempt.DurationMS,
			&attempt.Input, &attempt.Result, &attempt.CreatedAt,
		); err != nil {
			return nil, err
		}
		attempts = append(attempts, attempt)
	}
	return attempts, rows.Err()
}

func (s *Store) eventsForUser(ctx context.Context, userID string) ([]models.ProgressEvent, error) {
	rows, err := s.db.QueryContext(ctx, `
		SELECT id::text, user_id::text, event_type, payload, created_at
		FROM progress_events
		WHERE user_id = $1
		ORDER BY created_at DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var events []models.ProgressEvent
	for rows.Next() {
		var event models.ProgressEvent
		if err := rows.Scan(&event.ID, &event.UserID, &event.EventType, &event.Payload, &event.CreatedAt); err != nil {
			return nil, err
		}
		events = append(events, event)
	}
	return events, rows.Err()
}

func readSeedData(name string) (json.RawMessage, error) {
	candidates := []string{
		filepath.Join("seeddata", name),
		filepath.Join("backend", "seeddata", name),
		filepath.Join("..", "seeddata", name),
		filepath.Join("..", "backend", "seeddata", name),
	}
	for _, candidate := range candidates {
		data, err := os.ReadFile(candidate)
		if err == nil {
			return data, nil
		}
	}
	return nil, fmt.Errorf("seed data %s not found", name)
}

func normalizeJSON(raw json.RawMessage) json.RawMessage {
	if len(raw) == 0 || !json.Valid(raw) {
		return json.RawMessage(`{}`)
	}
	return raw
}

func normalizeJSONArray(raw json.RawMessage) json.RawMessage {
	if len(raw) == 0 || !json.Valid(raw) {
		return json.RawMessage(`[]`)
	}
	var probe []any
	if json.Unmarshal(raw, &probe) != nil {
		return json.RawMessage(`[]`)
	}
	return raw
}

func progressSummary(attempts []models.ExperimentAttempt) map[string]any {
	completed := 0
	var lastReaction string
	var lastAttemptAt any
	seen := map[string]bool{}
	for i, attempt := range attempts {
		if i == 0 {
			lastReaction = attempt.ReactionID
			lastAttemptAt = attempt.CreatedAt
		}
		if attempt.ResultStatus == "success" || attempt.ResultStatus == "completed" {
			completed++
			seen[attempt.ReactionID] = true
		}
	}
	totalAvailable := 5
	percent := 0
	if totalAvailable > 0 {
		percent = int(float64(len(seen)) / float64(totalAvailable) * 100)
	}
	return map[string]any{
		"completed_attempts": completed,
		"unique_completed":   len(seen),
		"total_available":    totalAvailable,
		"progress_percent":   percent,
		"last_reaction":      lastReaction,
		"last_attempt_at":    lastAttemptAt,
	}
}
