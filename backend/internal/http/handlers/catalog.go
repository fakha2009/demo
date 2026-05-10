package handlers

import (
	"net/http"
	"strconv"
	"strings"

	"chemlab-tj/backend/internal/repositories"
)

type CatalogHandler struct {
	store *repositories.Store
}

func NewCatalogHandler(store *repositories.Store) *CatalogHandler {
	return &CatalogHandler{store: store}
}

func (h *CatalogHandler) Elements(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	limit, offset := pagination(r)
	doc, err := h.store.CatalogDocument(r.Context(), "elements", "elements", "elements.json", limit, offset)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to load elements")
		return
	}
	writeRawJSON(w, http.StatusOK, doc)
}

func (h *CatalogHandler) PeriodicElements(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	db := h.store.DB()
	rows := queryList(r, db, `
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
		       data AS raw,
		       created_at, updated_at
		FROM elements ORDER BY atomic_number
	`)
	writeJSON(w, http.StatusOK, map[string]any{"elements": rows})
}

func (h *CatalogHandler) PeriodicElementBySymbol(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	symbol := strings.TrimPrefix(r.URL.Path, "/api/periodic-elements/")
	if symbol == "" || strings.Contains(symbol, "/") {
		writeError(w, http.StatusNotFound, "element not found")
		return
	}
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
		       data AS raw,
		       created_at, updated_at
		FROM elements WHERE lower(symbol) = lower($1)
	`, symbol)
	if len(rows) == 0 {
		writeError(w, http.StatusNotFound, "element not found")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"element": rows[0]})
}

func (h *CatalogHandler) Substances(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	limit, offset := pagination(r)
	doc, err := h.store.CatalogDocument(r.Context(), "substances", "substances", "substances.json", limit, offset)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to load substances")
		return
	}
	writeRawJSON(w, http.StatusOK, doc)
}

func (h *CatalogHandler) SubstanceByID(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	id := strings.TrimPrefix(r.URL.Path, "/api/substances/")
	if id == "" || strings.Contains(id, "/") {
		writeError(w, http.StatusNotFound, "substance not found")
		return
	}
	rows := queryList(r, h.store.DB(), "SELECT data FROM substances WHERE id = $1 AND is_active = true", id)
	if len(rows) == 0 {
		writeError(w, http.StatusNotFound, "substance not found")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"substance": rows[0]["data"]})
}

func (h *CatalogHandler) Reactions(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	limit, offset := pagination(r)
	doc, err := h.store.CatalogDocument(r.Context(), "reactions", "reactions", "reactions.json", limit, offset)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to load reactions")
		return
	}
	writeRawJSON(w, http.StatusOK, doc)
}

func pagination(r *http.Request) (int, int) {
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))
	return limit, offset
}

func (h *CatalogHandler) ReactionByID(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	id := strings.TrimPrefix(r.URL.Path, "/api/reactions/")
	if id == "" || strings.Contains(id, "/") {
		writeError(w, http.StatusNotFound, "reaction not found")
		return
	}
	doc, ok, err := h.store.ReactionByID(r.Context(), id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to load reaction")
		return
	}
	if !ok {
		writeError(w, http.StatusNotFound, "reaction not found")
		return
	}
	writeRawJSON(w, http.StatusOK, doc)
}

func (h *CatalogHandler) Tasks(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	rows := queryList(r, h.store.DB(), `
		SELECT id, title, level, goal, reagents, hints, reaction_id, points, is_active, created_at, updated_at
		FROM tasks WHERE is_active = true ORDER BY updated_at DESC
	`)
	writeJSON(w, http.StatusOK, map[string]any{"tasks": rows})
}

func (h *CatalogHandler) Handbook(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	rows := queryList(r, h.store.DB(), `
		SELECT id, category, icon, title, text, sort_order, is_active, created_at, updated_at
		FROM handbook_entries WHERE is_active = true ORDER BY sort_order, title
	`)
	writeJSON(w, http.StatusOK, map[string]any{"entries": rows})
}
