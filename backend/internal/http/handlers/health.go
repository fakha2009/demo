package handlers

import (
	"net/http"

	"chemlab-tj/backend/internal/repositories"
)

type HealthHandler struct {
	store *repositories.Store
}

func NewHealthHandler(store *repositories.Store) *HealthHandler {
	return &HealthHandler{store: store}
}

func (h *HealthHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	dbOK := h.store.Ping(r.Context()) == nil
	status := http.StatusOK
	if !dbOK {
		status = http.StatusServiceUnavailable
	}
	writeJSON(w, status, map[string]any{
		"status": "ok",
		"db":     dbOK,
	})
}
