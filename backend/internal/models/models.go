package models

import (
	"encoding/json"
	"time"
)

type User struct {
	ID                  string     `json:"id"`
	Email               string     `json:"email"`
	Name                string     `json:"name"`
	Role                string     `json:"role"`
	Status              string     `json:"status,omitempty"`
	PasswordHash        string     `json:"-"`
	CreatedAt           time.Time  `json:"created_at"`
	UpdatedAt           *time.Time `json:"updated_at,omitempty"`
	LastActiveAt        *time.Time `json:"last_active_at,omitempty"`
	ExperimentsCount    int        `json:"experiments_count"`
	LastExperimentTitle string     `json:"last_experiment_title,omitempty"`
}

type RegisterRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Name     string `json:"name"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

type ExperimentAttemptRequest struct {
	ReactionID        string          `json:"reaction_id"`
	ReactionSlug      string          `json:"reaction_slug"`
	SelectedReactants json.RawMessage `json:"selected_reactants"`
	Equipment         json.RawMessage `json:"equipment"`
	UsedHeating       bool            `json:"used_heating"`
	ResultStatus      string          `json:"result_status"`
	Observation       string          `json:"observation"`
	DurationMS        int             `json:"duration_ms"`
	Input             json.RawMessage `json:"input"`
	Result            json.RawMessage `json:"result"`
}

type ExperimentAttempt struct {
	ID                string          `json:"id"`
	UserID            string          `json:"user_id"`
	ReactionID        string          `json:"reaction_id"`
	ReactionSlug      string          `json:"reaction_slug"`
	SelectedReactants json.RawMessage `json:"selected_reactants"`
	Equipment         json.RawMessage `json:"equipment"`
	UsedHeating       bool            `json:"used_heating"`
	ResultStatus      string          `json:"result_status"`
	Observation       string          `json:"observation"`
	DurationMS        int             `json:"duration_ms"`
	Input             json.RawMessage `json:"input"`
	Result            json.RawMessage `json:"result"`
	CreatedAt         time.Time       `json:"created_at"`
}

type ProgressEvent struct {
	ID        string          `json:"id"`
	UserID    string          `json:"user_id"`
	EventType string          `json:"event_type"`
	Payload   json.RawMessage `json:"payload"`
	CreatedAt time.Time       `json:"created_at"`
}
