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

func (s *Store) FindConfirmedReaction(ctx context.Context, req models.ConstructorValidateRequest) (map[string]any, error) {
	a := strings.TrimSpace(req.ReactantA)
	b := strings.TrimSpace(req.ReactantB)
	if a == "" || b == "" || a == b {
		return nil, nil
	}
	catalyst := strings.TrimSpace(req.Catalyst)
	rows, err := s.db.QueryContext(ctx, `
		SELECT id, title, type, equation, reactants, products, requires_heating,
		       COALESCE(required_temperature, '') AS required_temperature,
		       COALESCE(requires_catalyst, false) AS requires_catalyst,
		       COALESCE(catalyst_id, '') AS catalyst_id,
		       visual_effect, COALESCE(observation, '') AS observation,
		       COALESCE(explanation, '') AS explanation,
		       COALESCE(safety, safety_note, '') AS safety,
		       COALESCE(danger_level, 'low') AS danger_level,
		       data
		FROM reactions
		WHERE is_active = true
		  AND reactants ? $1 AND reactants ? $2
		ORDER BY updated_at DESC
	`, a, b)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var id, title, typ, equation, requiredTemp, catalystID, observation, explanation, safety, danger string
		var reactants, products, visual, data json.RawMessage
		var requiresHeating, requiresCatalyst bool
		if err := rows.Scan(&id, &title, &typ, &equation, &reactants, &products, &requiresHeating, &requiredTemp, &requiresCatalyst, &catalystID, &visual, &observation, &explanation, &safety, &danger, &data); err != nil {
			return nil, err
		}
		if requiresHeating && !req.Heating {
			continue
		}
		if requiresCatalyst && !strings.EqualFold(catalystID, catalyst) {
			continue
		}
		if requiredTemp != "" && requiredTemp != "room" && !strings.EqualFold(requiredTemp, req.Temperature) && !(req.Heating && requiredTemp == "hot") {
			continue
		}
		return map[string]any{
			"id": id, "title": title, "type": typ, "equation": equation,
			"reactants":            rawJSONValue(reactants, []any{}),
			"products":             rawJSONValue(products, []any{}),
			"requires_heating":     requiresHeating,
			"required_temperature": requiredTemp,
			"requires_catalyst":    requiresCatalyst,
			"catalyst_id":          catalystID,
			"visual_effect":        rawJSONValue(visual, map[string]any{}),
			"observation":          observation,
			"explanation":          explanation,
			"safety":               safety,
			"danger_level":         danger,
			"data":                 rawJSONValue(data, map[string]any{}),
		}, nil
	}
	return nil, rows.Err()
}

func (s *Store) SaveSynthesizedProduct(ctx context.Context, userID, reactionID, productID string) (map[string]any, error) {
	var allowed bool
	if err := s.db.QueryRowContext(ctx, `SELECT products ? $1 FROM reactions WHERE id = $2 AND is_active = true`, productID, reactionID).Scan(&allowed); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("confirmed reaction not found")
		}
		return nil, err
	}
	if !allowed {
		return nil, errors.New("product is not allowed for this confirmed reaction")
	}

	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	var exists bool
	if err := tx.QueryRowContext(ctx, `SELECT EXISTS(SELECT 1 FROM substances WHERE id = $1)`, productID).Scan(&exists); err != nil {
		return nil, err
	}
	if !exists {
		payload, _ := json.Marshal(map[string]any{
			"id": productID, "name": productID, "formula": productID,
			"type": "synthesized", "category": "created",
			"state": "aqueous", "visualState": "solution",
			"safetyLevel":       "low",
			"description":       "Учебный продукт подтверждённой реакции " + reactionID,
			"createdByReaction": reactionID,
		})
		if _, err := tx.ExecContext(ctx, `
			INSERT INTO substances (id, slug, formula, name, type, category, state, color, danger_level, safety_level, description, ions, data, updated_at)
			VALUES ($1, $2, $1, $1, 'synthesized', 'created', 'aqueous', '#e0f2fe', 'low', 'low', $3, '{}'::jsonb, $4, now())
			ON CONFLICT (id) DO NOTHING
		`, productID, slugID(productID), "Учебный продукт подтверждённой реакции "+reactionID, payload); err != nil {
			return nil, err
		}
	}

	if _, err := tx.ExecContext(ctx, `
		INSERT INTO user_substances (user_id, substance_id, source_reaction_id)
		VALUES ($1, $2, $3)
		ON CONFLICT (user_id, substance_id) DO UPDATE SET source_reaction_id = EXCLUDED.source_reaction_id
	`, userID, productID, reactionID); err != nil {
		return nil, err
	}

	details, _ := json.Marshal(map[string]any{"reaction_id": reactionID, "product_id": productID})
	if _, err := tx.ExecContext(ctx, `
		INSERT INTO progress_events (user_id, event_type, payload)
		VALUES ($1, 'product_synthesized', $2)
	`, userID, details); err != nil {
		return nil, err
	}
	if _, err := tx.ExecContext(ctx, `
		INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details_json)
		VALUES ($1, 'product_synthesized', 'substance', $2, $3)
	`, userID, productID, details); err != nil {
		return nil, err
	}
	if err := tx.Commit(); err != nil {
		return nil, err
	}
	products, err := s.UserSubstances(ctx, userID)
	if err != nil {
		return nil, err
	}
	for _, product := range products {
		if fmt.Sprint(product["id"]) == productID {
			return product, nil
		}
	}
	return map[string]any{"id": productID, "formula": productID}, nil
}

func (s *Store) SaveConstructorProduct(ctx context.Context, userID string, req models.ConstructorSaveRequest) (map[string]any, error) {
	formula := strings.TrimSpace(req.Formula)
	if formula == "" {
		return nil, errors.New("formula is required")
	}
	productID := strings.TrimSpace(req.ProductID)
	if productID == "" {
		productID = formula
	}
	name := strings.TrimSpace(req.NameRu)
	if name == "" {
		name = formula
	}
	typ := strings.TrimSpace(req.Type)
	if typ == "" {
		typ = "synthesized"
	}
	state := strings.TrimSpace(req.State)
	if state == "" {
		state = "aqueous"
	}
	visualState := strings.TrimSpace(req.VisualState)
	if visualState == "" {
		visualState = state
	}
	color := strings.TrimSpace(req.Color)
	if color == "" {
		color = "#e0f2fe"
	}

	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	var existingID string
	alreadyExists := false
	err = tx.QueryRowContext(ctx, `SELECT id FROM substances WHERE id = $1 OR formula = $2 LIMIT 1`, productID, formula).Scan(&existingID)
	if err == nil {
		productID = existingID
		alreadyExists = true
	} else if !errors.Is(err, sql.ErrNoRows) {
		return nil, err
	}

	ions, _ := json.Marshal(map[string]string{"cation": req.Cation, "anion": req.Anion})
	payload, _ := json.Marshal(map[string]any{
		"id": productID, "name": name, "nameRu": name, "formula": formula,
		"type": typ, "category": typ, "state": state, "visualState": visualState,
		"color": color, "sourceMode": req.SourceMode, "sourceEquation": req.SourceEquation,
		"ions":           map[string]string{"cation": req.Cation, "anion": req.Anion},
		"simulationOnly": true,
	})
	if !alreadyExists {
		if _, err := tx.ExecContext(ctx, `
			INSERT INTO substances (id, slug, formula, name, type, category, state, color, danger_level, safety_level, description, ions, data, updated_at)
			VALUES ($1, $2, $3, $4, $5, $5, $6, $7, 'low', 'low', $8, $9, $10, now())
			ON CONFLICT (id) DO NOTHING
		`, productID, slugID(productID), formula, name, typ, state, color, "Создано в конструкторе ChemLab TJ", ions, payload); err != nil {
			return nil, err
		}
	}

	if _, err := tx.ExecContext(ctx, `
		INSERT INTO user_substances (user_id, substance_id, source_reaction_id)
		VALUES ($1, $2, NULL)
		ON CONFLICT (user_id, substance_id) DO UPDATE SET created_at = user_substances.created_at
	`, userID, productID); err != nil {
		return nil, err
	}

	var hasConstructorProducts bool
	_ = tx.QueryRowContext(ctx, `SELECT to_regclass('public.constructor_products') IS NOT NULL`).Scan(&hasConstructorProducts)
	if hasConstructorProducts {
		if _, err := tx.ExecContext(ctx, `
			INSERT INTO constructor_products (user_id, formula, name_ru, type, state, visual_state, color, source_mode, source_equation, cation, anion, substance_id)
			VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
		`, userID, formula, name, typ, state, visualState, color, req.SourceMode, req.SourceEquation, req.Cation, req.Anion, productID); err != nil {
			return nil, err
		}
	}

	details, _ := json.Marshal(map[string]any{"formula": formula, "product_id": productID, "source_mode": req.SourceMode})
	if _, err := tx.ExecContext(ctx, `
		INSERT INTO progress_events (user_id, event_type, payload)
		VALUES ($1, 'constructor_product_saved', $2)
	`, userID, details); err != nil {
		return nil, err
	}
	if _, err := tx.ExecContext(ctx, `
		INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details_json)
		VALUES ($1, 'constructor_product_saved', 'substance', $2, $3)
	`, userID, productID, details); err != nil {
		return nil, err
	}
	if err := tx.Commit(); err != nil {
		return nil, err
	}
	return map[string]any{
		"id": productID, "formula": formula, "name": name, "nameRu": name,
		"type": typ, "state": state, "visualState": visualState, "color": color,
		"description": "Создано в конструкторе ChemLab TJ", "already_exists": alreadyExists,
		"source_equation": req.SourceEquation,
		"data":            rawJSONValue(payload, map[string]any{}),
	}, nil
}

func (s *Store) UserSubstances(ctx context.Context, userID string) ([]map[string]any, error) {
	rows, err := s.db.QueryContext(ctx, `
		SELECT s.id, COALESCE(s.name, s.id), s.formula, COALESCE(s.type, ''),
		       COALESCE(s.category, ''), COALESCE(s.state, data->>'visualState', 'solution'),
		       COALESCE(s.color, ''), COALESCE(s.danger_level, s.safety_level, 'low'),
		       COALESCE(s.description, ''), COALESCE(us.source_reaction_id, ''),
		       us.created_at, s.data
		FROM user_substances us
		JOIN substances s ON s.id = us.substance_id
		WHERE us.user_id = $1
		ORDER BY us.created_at DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []map[string]any{}
	for rows.Next() {
		var id, name, formula, typ, category, state, color, danger, description, reactionID string
		var created time.Time
		var data json.RawMessage
		if err := rows.Scan(&id, &name, &formula, &typ, &category, &state, &color, &danger, &description, &reactionID, &created, &data); err != nil {
			return nil, err
		}
		out = append(out, map[string]any{
			"id": id, "name": name, "formula": formula, "type": typ, "category": category,
			"state": state, "color": color, "danger_level": danger, "description": description,
			"source_reaction_id": reactionID, "created_at": created,
			"data": rawJSONValue(data, map[string]any{}),
		})
	}
	return out, rows.Err()
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

func rawJSONValue(raw json.RawMessage, fallback any) any {
	if len(raw) == 0 {
		return fallback
	}
	var parsed any
	if json.Unmarshal(raw, &parsed) != nil {
		return fallback
	}
	return parsed
}

func slugID(value string) string {
	value = strings.ToLower(strings.TrimSpace(value))
	var b strings.Builder
	lastDash := false
	for _, r := range value {
		ok := (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9')
		if ok {
			b.WriteRune(r)
			lastDash = false
		} else if !lastDash {
			b.WriteRune('-')
			lastDash = true
		}
	}
	out := strings.Trim(b.String(), "-")
	if out == "" {
		return "substance"
	}
	return out
}
