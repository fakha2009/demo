package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"chemlab-tj/backend/internal/http/middleware"
	"chemlab-tj/backend/internal/models"
	"chemlab-tj/backend/internal/repositories"
)

type ProgressHandler struct {
	store *repositories.Store
}

func NewProgressHandler(store *repositories.Store) *ProgressHandler {
	return &ProgressHandler{store: store}
}

func (h *ProgressHandler) CreateAttempt(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	userID, ok := middleware.UserID(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	var req models.ExperimentAttemptRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json")
		return
	}
	req.ReactionID = strings.TrimSpace(req.ReactionID)
	req.ReactionSlug = strings.TrimSpace(req.ReactionSlug)
	req.ResultStatus = strings.TrimSpace(req.ResultStatus)
	if req.ReactionID == "" {
		writeError(w, http.StatusBadRequest, "reaction_id is required")
		return
	}
	if req.ResultStatus == "" {
		req.ResultStatus = "unknown"
	}
	if req.DurationMS < 0 {
		req.DurationMS = 0
	}
	attempt, err := h.store.CreateAttempt(r.Context(), userID, req)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create attempt")
		return
	}
	writeJSON(w, http.StatusCreated, attempt)
}

func (h *ProgressHandler) MyProgress(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	userID, ok := middleware.UserID(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))
	progress, err := h.store.ProgressForUser(r.Context(), userID, limit, offset)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to load progress")
		return
	}
	writeJSON(w, http.StatusOK, progress)
}
