package services

import (
	"context"
	"database/sql"
	"errors"
	"strings"

	"chemlab-tj/backend/internal/auth"
	"chemlab-tj/backend/internal/models"
	"chemlab-tj/backend/internal/repositories"
)

type AuthService struct {
	store     *repositories.Store
	jwtSecret string
}

func NewAuthService(store *repositories.Store, jwtSecret string) *AuthService {
	return &AuthService{store: store, jwtSecret: jwtSecret}
}

func (s *AuthService) Register(ctx context.Context, req models.RegisterRequest) (models.AuthResponse, error) {
	email := strings.TrimSpace(strings.ToLower(req.Email))
	name := strings.TrimSpace(req.Name)
	if email == "" || !strings.Contains(email, "@") {
		return models.AuthResponse{}, errors.New("valid email is required")
	}
	if len(req.Password) < 8 {
		return models.AuthResponse{}, errors.New("password with at least 8 characters is required")
	}
	if name == "" {
		name = email
	}

	hash, err := auth.HashPassword(req.Password)
	if err != nil {
		return models.AuthResponse{}, err
	}
	user, err := s.store.CreateUser(ctx, email, name, hash)
	if err != nil {
		return models.AuthResponse{}, err
	}
	token, err := auth.IssueToken(s.jwtSecret, user)
	if err != nil {
		return models.AuthResponse{}, err
	}
	return models.AuthResponse{Token: token, User: user}, nil
}

func (s *AuthService) Login(ctx context.Context, req models.LoginRequest) (models.AuthResponse, error) {
	user, err := s.store.UserByEmail(ctx, req.Email)
	if errors.Is(err, sql.ErrNoRows) {
		return models.AuthResponse{}, errors.New("invalid credentials")
	}
	if err != nil {
		return models.AuthResponse{}, err
	}
	if !auth.CheckPassword(user.PasswordHash, req.Password) {
		return models.AuthResponse{}, errors.New("invalid credentials")
	}
	s.store.TouchUser(ctx, user.ID)
	token, err := auth.IssueToken(s.jwtSecret, user)
	if err != nil {
		return models.AuthResponse{}, err
	}
	return models.AuthResponse{Token: token, User: user}, nil
}
