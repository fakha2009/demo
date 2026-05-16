package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"

	"chemlab-tj/backend/internal/http/middleware"
	"chemlab-tj/backend/internal/repositories"
)

type AdminHandler struct {
	store *repositories.Store
}

func NewAdminHandler(store *repositories.Store) *AdminHandler {
	return &AdminHandler{store: store}
}

func (h *AdminHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	user, ok := h.adminUser(w, r)
	if !ok {
		return
	}
	path := strings.TrimPrefix(r.URL.Path, "/api/admin")
	path = strings.Trim(path, "/")
	parts := splitPath(path)

	switch {
	case path == "dashboard" && r.Method == http.MethodGet:
		h.dashboard(w, r)
	case path == "users" && r.Method == http.MethodGet:
		h.users(w, r)
	case len(parts) == 2 && parts[0] == "users" && r.Method == http.MethodPatch:
		h.updateUser(w, r, parts[1], user.ID)
	case path == "reactions" && r.Method == http.MethodGet:
		h.reactions(w, r)
	case path == "reactions" && r.Method == http.MethodPost:
		h.saveReaction(w, r, "", user.ID)
	case len(parts) == 2 && parts[0] == "reactions" && r.Method == http.MethodGet:
		h.oneReaction(w, r, parts[1])
	case len(parts) == 2 && parts[0] == "reactions" && r.Method == http.MethodPut:
		h.saveReaction(w, r, parts[1], user.ID)
	case len(parts) == 2 && parts[0] == "reactions" && r.Method == http.MethodDelete:
		h.deleteEntity(w, r, "reactions", parts[1], user.ID)
	case len(parts) == 3 && parts[0] == "reactions" && parts[2] == "toggle" && r.Method == http.MethodPatch:
		h.toggle(w, r, "reactions", parts[1], user.ID)
	case path == "substances" && r.Method == http.MethodGet:
		h.substances(w, r)
	case path == "substances" && r.Method == http.MethodPost:
		h.saveSubstance(w, r, "", user.ID)
	case len(parts) == 2 && parts[0] == "substances" && r.Method == http.MethodGet:
		h.oneSubstance(w, r, parts[1])
	case len(parts) == 2 && parts[0] == "substances" && r.Method == http.MethodPut:
		h.saveSubstance(w, r, parts[1], user.ID)
	case len(parts) == 2 && parts[0] == "substances" && r.Method == http.MethodDelete:
		h.deleteEntity(w, r, "substances", parts[1], user.ID)
	case len(parts) == 3 && parts[0] == "substances" && parts[2] == "toggle" && r.Method == http.MethodPatch:
		h.toggle(w, r, "substances", parts[1], user.ID)
	case path == "periodic-elements" && r.Method == http.MethodGet:
		h.elements(w, r)
	case len(parts) == 2 && parts[0] == "periodic-elements" && r.Method == http.MethodPut:
		h.updateElement(w, r, parts[1], user.ID)
	case path == "experiments" && r.Method == http.MethodGet:
		h.experiments(w, r)
	case path == "tasks" && r.Method == http.MethodGet:
		h.tasks(w, r)
	case path == "tasks" && r.Method == http.MethodPost:
		h.saveTask(w, r, "", user.ID)
	case len(parts) == 2 && parts[0] == "tasks" && r.Method == http.MethodPut:
		h.saveTask(w, r, parts[1], user.ID)
	case len(parts) == 2 && parts[0] == "tasks" && r.Method == http.MethodDelete:
		h.deleteEntity(w, r, "tasks", parts[1], user.ID)
	case len(parts) == 3 && parts[0] == "tasks" && parts[2] == "toggle" && r.Method == http.MethodPatch:
		h.toggle(w, r, "tasks", parts[1], user.ID)
	case path == "handbook" && r.Method == http.MethodGet:
		h.handbook(w, r)
	case path == "handbook" && r.Method == http.MethodPost:
		h.saveHandbook(w, r, "", user.ID)
	case len(parts) == 2 && parts[0] == "handbook" && r.Method == http.MethodPut:
		h.saveHandbook(w, r, parts[1], user.ID)
	case len(parts) == 2 && parts[0] == "handbook" && r.Method == http.MethodDelete:
		h.deleteEntity(w, r, "handbook_entries", parts[1], user.ID)
	case len(parts) == 3 && parts[0] == "handbook" && parts[2] == "toggle" && r.Method == http.MethodPatch:
		h.toggle(w, r, "handbook_entries", parts[1], user.ID)
	case path == "constructor/ions" && r.Method == http.MethodGet:
		h.constructorIons(w, r)
	case path == "constructor/ions" && r.Method == http.MethodPost:
		h.saveConstructorIon(w, r, "", user.ID)
	case len(parts) == 3 && parts[0] == "constructor" && parts[1] == "ions" && r.Method == http.MethodPut:
		h.saveConstructorIon(w, r, parts[2], user.ID)
	case len(parts) == 3 && parts[0] == "constructor" && parts[1] == "ions" && r.Method == http.MethodDelete:
		h.deleteConstructorTable(w, r, "constructor_ions", parts[2], user.ID)
	case path == "constructor/element-rules" && r.Method == http.MethodGet:
		h.constructorElementRules(w, r)
	case path == "constructor/element-rules" && r.Method == http.MethodPost:
		h.saveConstructorElementRule(w, r, "", user.ID)
	case len(parts) == 3 && parts[0] == "constructor" && parts[1] == "element-rules" && r.Method == http.MethodPut:
		h.saveConstructorElementRule(w, r, parts[2], user.ID)
	case len(parts) == 4 && parts[0] == "constructor" && parts[1] == "element-rules" && parts[3] == "toggle" && r.Method == http.MethodPatch:
		h.toggleConstructorElementRule(w, r, parts[2], user.ID)
	case len(parts) == 3 && parts[0] == "constructor" && parts[1] == "element-rules" && r.Method == http.MethodDelete:
		h.deleteConstructorTable(w, r, "constructor_element_rules", parts[2], user.ID)
	case path == "constructor/solubility" && r.Method == http.MethodGet:
		h.solubilityRules(w, r)
	case path == "constructor/solubility" && r.Method == http.MethodPost:
		h.saveSolubilityRule(w, r, "", user.ID)
	case len(parts) == 3 && parts[0] == "constructor" && parts[1] == "solubility" && r.Method == http.MethodPut:
		h.saveSolubilityRule(w, r, parts[2], user.ID)
	case len(parts) == 3 && parts[0] == "constructor" && parts[1] == "solubility" && r.Method == http.MethodDelete:
		h.deleteConstructorTable(w, r, "solubility_rules", parts[2], user.ID)
	case path == "constructor/products" && r.Method == http.MethodGet:
		h.constructorProducts(w, r)
	case len(parts) == 3 && parts[0] == "constructor" && parts[1] == "products" && r.Method == http.MethodDelete:
		h.deleteConstructorProduct(w, r, parts[2], user.ID)
	default:
		writeError(w, http.StatusNotFound, "admin endpoint not found")
	}
}

func splitPath(path string) []string {
	if path == "" {
		return nil
	}
	return strings.Split(path, "/")
}

func (h *AdminHandler) adminUser(w http.ResponseWriter, r *http.Request) (adminUser, bool) {
	userID, ok := middleware.UserID(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return adminUser{}, false
	}
	var user adminUser
	err := h.store.DB().QueryRowContext(r.Context(), "SELECT id::text, role FROM users WHERE id = $1", userID).Scan(&user.ID, &user.Role)
	if err != nil {
		writeError(w, http.StatusUnauthorized, "user not found")
		return adminUser{}, false
	}
	if user.Role != "admin" {
		writeError(w, http.StatusForbidden, "admin only")
		return adminUser{}, false
	}
	return user, true
}

type adminUser struct {
	ID   string
	Role string
}

func (h *AdminHandler) dashboard(w http.ResponseWriter, r *http.Request) {
	db := h.store.DB()
	writeJSON(w, http.StatusOK, map[string]any{
		"totalUsers":       count(db, "users"),
		"totalReactions":   count(db, "reactions"),
		"totalSubstances":  count(db, "substances"),
		"totalExperiments": count(db, "experiment_attempts"),
		"createdProducts":  count(db, "user_substances"),
		"popularReactions": queryList(r, db, `
			SELECT reaction_id, COUNT(*) AS attempts
			FROM experiment_attempts
			GROUP BY reaction_id
			ORDER BY attempts DESC
			LIMIT 6
		`),
		"recentExperiments": queryList(r, db, `
			SELECT id::text, user_id::text, reaction_id, COALESCE(observation, result_status, '') AS result, created_at
			FROM experiment_attempts ORDER BY created_at DESC LIMIT 8
		`),
		"recentActivities": queryList(r, db, `
			SELECT id::text, COALESCE(user_id::text, '') AS user_id, action, COALESCE(entity_type, '') AS entity_type,
			       COALESCE(entity_id, '') AS entity_id, details_json, created_at
			FROM activity_logs ORDER BY created_at DESC LIMIT 12
		`),
	})
}

func (h *AdminHandler) users(w http.ResponseWriter, r *http.Request) {
	rows := queryList(r, h.store.DB(), `
		SELECT id::text, email, name, role, status, created_at, updated_at, last_active_at,
		       experiments_count, COALESCE(last_experiment_title, '') AS last_experiment_title
		FROM users ORDER BY created_at DESC
	`)
	writeJSON(w, http.StatusOK, map[string]any{"users": rows})
}

func (h *AdminHandler) updateUser(w http.ResponseWriter, r *http.Request, id, adminID string) {
	var req map[string]any
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json")
		return
	}
	name := strings.TrimSpace(stringValue(req["name"]))
	role := strings.TrimSpace(stringValue(req["role"]))
	status := strings.TrimSpace(stringValue(req["status"]))
	if role != "" && role != "user" && role != "admin" {
		writeError(w, http.StatusBadRequest, "invalid role")
		return
	}
	if status != "" && status != "active" && status != "blocked" {
		writeError(w, http.StatusBadRequest, "invalid status")
		return
	}
	_, err := h.store.DB().ExecContext(r.Context(), `
		UPDATE users SET
			name = COALESCE(NULLIF($1, ''), name),
			role = COALESCE(NULLIF($2, ''), role),
			status = COALESCE(NULLIF($3, ''), status),
			updated_at = now()
		WHERE id = $4
	`, name, role, status, id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to update user")
		return
	}
	h.log(r, adminID, "admin_update_user", "user", id, req)
	h.users(w, r)
}

func (h *AdminHandler) reactions(w http.ResponseWriter, r *http.Request) {
	rows := queryList(r, h.store.DB(), `
		SELECT id, title, type, reactant_a_id, reactant_b_id, equation, products,
		       requires_heating, required_temperature, requires_catalyst, catalyst_id,
		       liquid_color_before, liquid_color_after, has_gas, gas_label AS gas_name,
		       has_precipitate, precipitate_color, has_heat, has_smoke, has_flash,
		       danger_level, observation, explanation, safety, is_active, created_at, updated_at
		FROM reactions ORDER BY updated_at DESC
	`)
	writeJSON(w, http.StatusOK, map[string]any{"reactions": rows})
}

func (h *AdminHandler) oneReaction(w http.ResponseWriter, r *http.Request, id string) {
	rows := queryList(r, h.store.DB(), `
		SELECT id, title, type, reactant_a_id, reactant_b_id, equation, products,
		       requires_heating, required_temperature, requires_catalyst, catalyst_id,
		       liquid_color_before, liquid_color_after, has_gas, gas_label AS gas_name,
		       has_precipitate, precipitate_color, has_heat, has_smoke, has_flash,
		       danger_level, observation, explanation, safety, is_active, created_at, updated_at
		FROM reactions WHERE id = $1
	`, id)
	if len(rows) == 0 {
		writeError(w, http.StatusNotFound, "reaction not found")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"reaction": rows[0]})
}

func (h *AdminHandler) saveReaction(w http.ResponseWriter, r *http.Request, id, adminID string) {
	var req map[string]any
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json")
		return
	}
	title := strings.TrimSpace(stringValue(req["title"]))
	if title == "" {
		writeError(w, http.StatusBadRequest, "title is required")
		return
	}
	if id == "" {
		id = slugID(title)
	}
	reactants, _ := json.Marshal([]string{stringValue(req["reactant_a_id"]), stringValue(req["reactant_b_id"])})
	products, _ := json.Marshal(req["products"])
	data, _ := json.Marshal(req)
	_, err := h.store.DB().ExecContext(r.Context(), `
		INSERT INTO reactions (
			id, slug, title, type, reactant_a_id, reactant_b_id, equation, products, reactants,
			requires_heating, required_temperature, requires_catalyst, catalyst_id,
			liquid_color_before, liquid_color_after, has_gas, gas_label, has_precipitate,
			precipitate_color, has_heat, has_smoke, has_flash, danger_level, observation,
			explanation, safety, data, updated_at
		) VALUES (
			$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,now()
		)
		ON CONFLICT (id) DO UPDATE SET
			title=EXCLUDED.title,type=EXCLUDED.type,reactant_a_id=EXCLUDED.reactant_a_id,reactant_b_id=EXCLUDED.reactant_b_id,
			equation=EXCLUDED.equation,products=EXCLUDED.products,reactants=EXCLUDED.reactants,requires_heating=EXCLUDED.requires_heating,
			required_temperature=EXCLUDED.required_temperature,requires_catalyst=EXCLUDED.requires_catalyst,catalyst_id=EXCLUDED.catalyst_id,
			liquid_color_before=EXCLUDED.liquid_color_before,liquid_color_after=EXCLUDED.liquid_color_after,has_gas=EXCLUDED.has_gas,
			gas_label=EXCLUDED.gas_label,has_precipitate=EXCLUDED.has_precipitate,precipitate_color=EXCLUDED.precipitate_color,
			has_heat=EXCLUDED.has_heat,has_smoke=EXCLUDED.has_smoke,has_flash=EXCLUDED.has_flash,danger_level=EXCLUDED.danger_level,
			observation=EXCLUDED.observation,explanation=EXCLUDED.explanation,safety=EXCLUDED.safety,data=EXCLUDED.data,updated_at=now()
	`, id, slugID(id), title, defaultString(req["type"], "other"), stringValue(req["reactant_a_id"]), stringValue(req["reactant_b_id"]),
		stringValue(req["equation"]), products, reactants, boolValue(req["requires_heating"]), stringValue(req["required_temperature"]),
		boolValue(req["requires_catalyst"]), stringValue(req["catalyst_id"]), stringValue(req["liquid_color_before"]),
		stringValue(req["liquid_color_after"]), boolValue(req["has_gas"]), stringValue(req["gas_name"]), boolValue(req["has_precipitate"]),
		stringValue(req["precipitate_color"]), boolValue(req["has_heat"]), boolValue(req["has_smoke"]), boolValue(req["has_flash"]),
		defaultString(req["danger_level"], "low"), stringValue(req["observation"]), stringValue(req["explanation"]), stringValue(req["safety"]), data)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to save reaction")
		return
	}
	h.log(r, adminID, "admin_save_reaction", "reaction", id, req)
	h.oneReaction(w, r, id)
}

func (h *AdminHandler) substances(w http.ResponseWriter, r *http.Request) {
	rows := queryList(r, h.store.DB(), `
		SELECT id, name, formula, type, state, color, ions->>'cation' AS cation, ions->>'anion' AS anion,
		       danger_level, description, is_active, created_at, updated_at
		FROM substances ORDER BY updated_at DESC
	`)
	writeJSON(w, http.StatusOK, map[string]any{"substances": rows})
}

func (h *AdminHandler) oneSubstance(w http.ResponseWriter, r *http.Request, id string) {
	rows := queryList(r, h.store.DB(), `
		SELECT id, name, formula, type, state, color, ions->>'cation' AS cation, ions->>'anion' AS anion,
		       danger_level, description, is_active, created_at, updated_at
		FROM substances WHERE id = $1
	`, id)
	if len(rows) == 0 {
		writeError(w, http.StatusNotFound, "substance not found")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"substance": rows[0]})
}

func (h *AdminHandler) saveSubstance(w http.ResponseWriter, r *http.Request, id, adminID string) {
	var req map[string]any
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json")
		return
	}
	name := strings.TrimSpace(stringValue(req["name"]))
	formula := strings.TrimSpace(stringValue(req["formula"]))
	if name == "" || formula == "" {
		writeError(w, http.StatusBadRequest, "name and formula are required")
		return
	}
	if id == "" {
		id = formula
	}
	ions, _ := json.Marshal(map[string]string{"cation": stringValue(req["cation"]), "anion": stringValue(req["anion"])})
	data, _ := json.Marshal(req)
	_, err := h.store.DB().ExecContext(r.Context(), `
		INSERT INTO substances (id, slug, name, formula, type, state, color, ions, danger_level, safety_level, description, data, updated_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$9,$10,$11,now())
		ON CONFLICT (id) DO UPDATE SET
			name=EXCLUDED.name, formula=EXCLUDED.formula, type=EXCLUDED.type, state=EXCLUDED.state,
			color=EXCLUDED.color, ions=EXCLUDED.ions, danger_level=EXCLUDED.danger_level,
			safety_level=EXCLUDED.safety_level, description=EXCLUDED.description, data=EXCLUDED.data, updated_at=now()
	`, id, slugID(id), name, formula, defaultString(req["type"], "other"), defaultString(req["state"], "solution"),
		stringValue(req["color"]), ions, defaultString(req["danger_level"], "low"), stringValue(req["description"]), data)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to save substance")
		return
	}
	h.log(r, adminID, "admin_save_substance", "substance", id, req)
	h.oneSubstance(w, r, id)
}

func (h *AdminHandler) deleteEntity(w http.ResponseWriter, r *http.Request, table, id, adminID string) {
	if table != "reactions" && table != "substances" && table != "tasks" && table != "handbook_entries" {
		writeError(w, http.StatusBadRequest, "invalid entity")
		return
	}
	_, err := h.store.DB().ExecContext(r.Context(), "DELETE FROM "+table+" WHERE id = $1", id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to delete")
		return
	}
	h.log(r, adminID, "admin_delete_"+table, table, id, nil)
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func (h *AdminHandler) toggle(w http.ResponseWriter, r *http.Request, table, id, adminID string) {
	if table != "reactions" && table != "substances" && table != "tasks" && table != "handbook_entries" {
		writeError(w, http.StatusBadRequest, "invalid entity")
		return
	}
	_, err := h.store.DB().ExecContext(r.Context(), "UPDATE "+table+" SET is_active = NOT is_active, updated_at = now() WHERE id = $1", id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to toggle")
		return
	}
	h.log(r, adminID, "admin_toggle_"+table, table, id, nil)
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func (h *AdminHandler) elements(w http.ResponseWriter, r *http.Request) {
	rows := queryList(r, h.store.DB(), `
		SELECT id, atomic_number, symbol, COALESCE(name_ru, name_en, symbol) AS name,
		       data->>'atomic_mass' AS atomic_mass,
		       NULLIF(data->>'group', '')::int AS group_number,
		       NULLIF(data->>'period', '')::int AS period,
		       COALESCE(data->>'category', data->>'color_group') AS category,
		       data->>'state' AS state,
		       data->>'electron_configuration' AS electron_configuration,
		       data->>'oxidation_states' AS oxidation_states,
		       data->>'electronegativity' AS electronegativity,
		       data->>'density' AS density,
		       data->>'melting_point' AS melting_point,
		       data->>'boiling_point' AS boiling_point,
		       data->>'discovered_by' AS discovered_by,
		       data->>'discovery_year' AS discovery_year,
		       data->>'applications' AS usage,
		       data->>'description' AS interesting_fact,
		       data->>'hazards' AS safety,
		       created_at, updated_at
		FROM elements ORDER BY atomic_number
	`)
	writeJSON(w, http.StatusOK, map[string]any{"elements": rows})
}

func (h *AdminHandler) updateElement(w http.ResponseWriter, r *http.Request, id, adminID string) {
	var req map[string]any
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json")
		return
	}
	patch, _ := json.Marshal(map[string]string{
		"applications":      stringValue(req["usage"]),
		"description":       stringValue(req["interesting_fact"]),
		"hazards":           stringValue(req["safety"]),
		"electronegativity": stringValue(req["electronegativity"]),
		"discovered_by":     stringValue(req["discovered_by"]),
		"discovery_year":    stringValue(req["discovery_year"]),
	})
	_, err := h.store.DB().ExecContext(r.Context(), "UPDATE elements SET data = data || $1::jsonb, updated_at = now() WHERE id = $2", patch, id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to update element")
		return
	}
	h.log(r, adminID, "admin_update_element", "periodic_element", id, req)
	h.elements(w, r)
}

func (h *AdminHandler) tasks(w http.ResponseWriter, r *http.Request) {
	rows := queryList(r, h.store.DB(), `
		SELECT id, title, level, goal, reagents, hints, reaction_id, points, is_active, created_at, updated_at
		FROM tasks ORDER BY updated_at DESC
	`)
	writeJSON(w, http.StatusOK, map[string]any{"tasks": rows})
}

func (h *AdminHandler) saveTask(w http.ResponseWriter, r *http.Request, id, adminID string) {
	var req map[string]any
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json")
		return
	}
	title := strings.TrimSpace(stringValue(req["title"]))
	if title == "" {
		writeError(w, http.StatusBadRequest, "title is required")
		return
	}
	if id == "" {
		id = slugID(title)
	}
	reagents, _ := json.Marshal(req["reagents"])
	hints, _ := json.Marshal(req["hints"])
	data, _ := json.Marshal(req)
	_, err := h.store.DB().ExecContext(r.Context(), `
		INSERT INTO tasks (id, title, level, goal, reagents, hints, reaction_id, points, data, updated_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,now())
		ON CONFLICT (id) DO UPDATE SET
			title=EXCLUDED.title, level=EXCLUDED.level, goal=EXCLUDED.goal, reagents=EXCLUDED.reagents,
			hints=EXCLUDED.hints, reaction_id=EXCLUDED.reaction_id, points=EXCLUDED.points,
			data=EXCLUDED.data, updated_at=now()
	`, id, title, defaultString(req["level"], "Базовый"), stringValue(req["goal"]), reagents, hints,
		stringValue(req["reaction_id"]), intValue(req["points"], 10), data)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to save task")
		return
	}
	h.log(r, adminID, "admin_save_task", "task", id, req)
	h.tasks(w, r)
}

func (h *AdminHandler) handbook(w http.ResponseWriter, r *http.Request) {
	rows := queryList(r, h.store.DB(), `
		SELECT id, category, icon, title, text, sort_order, is_active, created_at, updated_at
		FROM handbook_entries ORDER BY sort_order, title
	`)
	writeJSON(w, http.StatusOK, map[string]any{"entries": rows})
}

func (h *AdminHandler) saveHandbook(w http.ResponseWriter, r *http.Request, id, adminID string) {
	var req map[string]any
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json")
		return
	}
	title := strings.TrimSpace(stringValue(req["title"]))
	if title == "" {
		writeError(w, http.StatusBadRequest, "title is required")
		return
	}
	if id == "" {
		id = slugID(title)
	}
	_, err := h.store.DB().ExecContext(r.Context(), `
		INSERT INTO handbook_entries (id, category, icon, title, text, sort_order, updated_at)
		VALUES ($1,$2,$3,$4,$5,$6,now())
		ON CONFLICT (id) DO UPDATE SET
			category=EXCLUDED.category, icon=EXCLUDED.icon, title=EXCLUDED.title,
			text=EXCLUDED.text, sort_order=EXCLUDED.sort_order, updated_at=now()
	`, id, defaultString(req["category"], "Справочник"), stringValue(req["icon"]), title,
		stringValue(req["text"]), intValue(req["sort_order"], 0))
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to save handbook entry")
		return
	}
	h.log(r, adminID, "admin_save_handbook", "handbook", id, req)
	h.handbook(w, r)
}

func (h *AdminHandler) experiments(w http.ResponseWriter, r *http.Request) {
	rows := queryList(r, h.store.DB(), `
		SELECT id::text, user_id::text, reaction_id, COALESCE(reaction_slug, '') AS reaction_slug,
		       COALESCE(observation, result_status, '') AS result, created_at
		FROM experiment_attempts ORDER BY created_at DESC LIMIT 200
	`)
	writeJSON(w, http.StatusOK, map[string]any{"experiments": rows})
}

func (h *AdminHandler) constructorIons(w http.ResponseWriter, r *http.Request) {
	rows := queryList(r, h.store.DB(), `
		SELECT id, symbol, name_ru, charge, type, formula_part, color, common, description_ru, created_at, updated_at
		FROM constructor_ions ORDER BY type DESC, charge, symbol
	`)
	writeJSON(w, http.StatusOK, map[string]any{"ions": rows})
}

func (h *AdminHandler) saveConstructorIon(w http.ResponseWriter, r *http.Request, id, adminID string) {
	var req map[string]any
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json")
		return
	}
	if id == "" {
		id = strings.TrimSpace(stringValue(req["id"]))
	}
	if id == "" || stringValue(req["symbol"]) == "" || stringValue(req["type"]) == "" || intValue(req["charge"], 0) == 0 {
		writeError(w, http.StatusBadRequest, "id, symbol, type and charge are required")
		return
	}
	_, err := h.store.DB().ExecContext(r.Context(), `
		INSERT INTO constructor_ions (id, symbol, name_ru, charge, type, formula_part, color, common, description_ru, updated_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,now())
		ON CONFLICT (id) DO UPDATE SET
		  symbol=EXCLUDED.symbol,name_ru=EXCLUDED.name_ru,charge=EXCLUDED.charge,type=EXCLUDED.type,
		  formula_part=EXCLUDED.formula_part,color=EXCLUDED.color,common=EXCLUDED.common,
		  description_ru=EXCLUDED.description_ru,updated_at=now()
	`, id, stringValue(req["symbol"]), defaultString(req["name_ru"], stringValue(req["symbol"])), intValue(req["charge"], 0),
		stringValue(req["type"]), defaultString(req["formula_part"], stringValue(req["symbol"])), stringValue(req["color"]),
		boolValueDefault(req["common"], true), stringValue(req["description_ru"]))
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to save ion")
		return
	}
	h.log(r, adminID, "admin_save_constructor_ion", "constructor_ion", id, req)
	h.constructorIons(w, r)
}

func (h *AdminHandler) constructorElementRules(w http.ResponseWriter, r *http.Request) {
	rows := queryList(r, h.store.DB(), `
		SELECT id, reactant_a, reactant_b, equation, product_formula, product_name_ru, product_type,
		       product_state, visual_json, conditions_json, explanation_ru, safety_ru, simulation_only,
		       enabled, created_at, updated_at
		FROM constructor_element_rules ORDER BY updated_at DESC
	`)
	writeJSON(w, http.StatusOK, map[string]any{"rules": rows})
}

func (h *AdminHandler) saveConstructorElementRule(w http.ResponseWriter, r *http.Request, id, adminID string) {
	var req map[string]any
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json")
		return
	}
	if id == "" {
		id = defaultString(req["id"], slugID(stringValue(req["product_formula"])+"-"+stringValue(req["reactant_a"])+"-"+stringValue(req["reactant_b"])))
	}
	visual, _ := json.Marshal(jsonMapValue(req["visual_json"]))
	conditions, _ := json.Marshal(jsonMapValue(req["conditions_json"]))
	_, err := h.store.DB().ExecContext(r.Context(), `
		INSERT INTO constructor_element_rules (
		  id, reactant_a, reactant_b, equation, product_formula, product_name_ru, product_type, product_state,
		  visual_json, conditions_json, explanation_ru, safety_ru, simulation_only, enabled, updated_at
		) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,true,$13,now())
		ON CONFLICT (id) DO UPDATE SET
		  reactant_a=EXCLUDED.reactant_a,reactant_b=EXCLUDED.reactant_b,equation=EXCLUDED.equation,
		  product_formula=EXCLUDED.product_formula,product_name_ru=EXCLUDED.product_name_ru,
		  product_type=EXCLUDED.product_type,product_state=EXCLUDED.product_state,visual_json=EXCLUDED.visual_json,
		  conditions_json=EXCLUDED.conditions_json,explanation_ru=EXCLUDED.explanation_ru,safety_ru=EXCLUDED.safety_ru,
		  enabled=EXCLUDED.enabled,updated_at=now()
	`, id, stringValue(req["reactant_a"]), stringValue(req["reactant_b"]), stringValue(req["equation"]),
		stringValue(req["product_formula"]), defaultString(req["product_name_ru"], stringValue(req["product_formula"])),
		defaultString(req["product_type"], "salt"), defaultString(req["product_state"], "solid"), visual, conditions,
		stringValue(req["explanation_ru"]), stringValue(req["safety_ru"]), boolValueDefault(req["enabled"], true))
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to save rule")
		return
	}
	h.log(r, adminID, "admin_save_constructor_rule", "constructor_element_rule", id, req)
	h.constructorElementRules(w, r)
}

func (h *AdminHandler) solubilityRules(w http.ResponseWriter, r *http.Request) {
	rows := queryList(r, h.store.DB(), `
		SELECT compound_formula, soluble, kind, precipitate_color, note_ru, created_at, updated_at
		FROM solubility_rules ORDER BY compound_formula
	`)
	writeJSON(w, http.StatusOK, map[string]any{"rules": rows})
}

func (h *AdminHandler) saveSolubilityRule(w http.ResponseWriter, r *http.Request, id, adminID string) {
	var req map[string]any
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json")
		return
	}
	if id == "" {
		id = strings.TrimSpace(stringValue(req["compound_formula"]))
	}
	if id == "" {
		writeError(w, http.StatusBadRequest, "compound_formula is required")
		return
	}
	_, err := h.store.DB().ExecContext(r.Context(), `
		INSERT INTO solubility_rules (compound_formula, soluble, kind, precipitate_color, note_ru, updated_at)
		VALUES ($1,$2,$3,$4,$5,now())
		ON CONFLICT (compound_formula) DO UPDATE SET
		  soluble=EXCLUDED.soluble,kind=EXCLUDED.kind,precipitate_color=EXCLUDED.precipitate_color,
		  note_ru=EXCLUDED.note_ru,updated_at=now()
	`, id, boolValue(req["soluble"]), defaultString(req["kind"], "unknown"), stringValue(req["precipitate_color"]), stringValue(req["note_ru"]))
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to save solubility rule")
		return
	}
	h.log(r, adminID, "admin_save_solubility_rule", "solubility_rule", id, req)
	h.solubilityRules(w, r)
}

func (h *AdminHandler) constructorProducts(w http.ResponseWriter, r *http.Request) {
	rows := queryList(r, h.store.DB(), `
		SELECT id::text, user_id::text, COALESCE(substance_id, '') AS substance_id, formula, name_ru, type,
		       state, visual_state, color, source_mode, source_equation, cation, anion, created_at
		FROM constructor_products ORDER BY created_at DESC LIMIT 300
	`)
	writeJSON(w, http.StatusOK, map[string]any{"products": rows})
}

func (h *AdminHandler) toggleConstructorElementRule(w http.ResponseWriter, r *http.Request, id, adminID string) {
	_, err := h.store.DB().ExecContext(r.Context(), `UPDATE constructor_element_rules SET enabled = NOT enabled, updated_at = now() WHERE id = $1`, id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to toggle rule")
		return
	}
	h.log(r, adminID, "admin_toggle_constructor_rule", "constructor_element_rule", id, nil)
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func (h *AdminHandler) deleteConstructorTable(w http.ResponseWriter, r *http.Request, table, id, adminID string) {
	if table != "constructor_ions" && table != "constructor_element_rules" && table != "solubility_rules" {
		writeError(w, http.StatusBadRequest, "invalid constructor table")
		return
	}
	key := "id"
	if table == "solubility_rules" {
		key = "compound_formula"
	}
	_, err := h.store.DB().ExecContext(r.Context(), "DELETE FROM "+table+" WHERE "+key+" = $1", id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to delete")
		return
	}
	h.log(r, adminID, "admin_delete_"+table, table, id, nil)
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func (h *AdminHandler) deleteConstructorProduct(w http.ResponseWriter, r *http.Request, id, adminID string) {
	_, err := h.store.DB().ExecContext(r.Context(), `DELETE FROM constructor_products WHERE id = $1`, id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to delete product")
		return
	}
	h.log(r, adminID, "admin_delete_constructor_product", "constructor_product", id, nil)
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func (h *AdminHandler) log(r *http.Request, userID, action, entityType, entityID string, details any) {
	raw, _ := json.Marshal(details)
	_, _ = h.store.DB().ExecContext(r.Context(), `
		INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details_json)
		VALUES ($1, $2, $3, $4, $5)
	`, userID, action, entityType, entityID, raw)
}

func count(db *sql.DB, table string) int {
	var n int
	_ = db.QueryRow("SELECT COUNT(*) FROM " + table).Scan(&n)
	return n
}

func queryList(r *http.Request, db *sql.DB, query string, args ...any) []map[string]any {
	rows, err := db.QueryContext(r.Context(), query, args...)
	if err != nil {
		return []map[string]any{}
	}
	defer rows.Close()
	cols, _ := rows.Columns()
	out := []map[string]any{}
	for rows.Next() {
		values := make([]any, len(cols))
		ptrs := make([]any, len(cols))
		for i := range values {
			ptrs[i] = &values[i]
		}
		if rows.Scan(ptrs...) != nil {
			continue
		}
		item := map[string]any{}
		for i, col := range cols {
			switch v := values[i].(type) {
			case []byte:
				var parsed any
				if json.Unmarshal(v, &parsed) == nil {
					item[col] = parsed
				} else {
					item[col] = string(v)
				}
			default:
				item[col] = v
			}
		}
		out = append(out, item)
	}
	return out
}

func stringValue(v any) string {
	if s, ok := v.(string); ok {
		return s
	}
	return ""
}

func defaultString(v any, fallback string) string {
	if s := strings.TrimSpace(stringValue(v)); s != "" {
		return s
	}
	return fallback
}

func boolValue(v any) bool {
	b, _ := v.(bool)
	return b
}

func boolValueDefault(v any, fallback bool) bool {
	b, ok := v.(bool)
	if !ok {
		return fallback
	}
	return b
}

func jsonMapValue(v any) map[string]any {
	switch value := v.(type) {
	case map[string]any:
		return value
	case string:
		var parsed map[string]any
		if json.Unmarshal([]byte(value), &parsed) == nil {
			return parsed
		}
	}
	return map[string]any{}
}

func intValue(v any, fallback int) int {
	switch n := v.(type) {
	case float64:
		return int(n)
	case int:
		return n
	default:
		return fallback
	}
}

func slugID(value string) string {
	value = strings.ToLower(strings.TrimSpace(value))
	var b strings.Builder
	lastDash := false
	for _, r := range value {
		ok := (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') || (r >= 'а' && r <= 'я')
		if ok {
			b.WriteRune(r)
			lastDash = false
		} else if !lastDash {
			b.WriteRune('-')
			lastDash = true
		}
	}
	return strings.Trim(b.String(), "-")
}
