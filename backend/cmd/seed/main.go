package main

import (
	"context"
	"database/sql"
	"log"
	"os"
	"strings"
	"time"

	"chemlab-tj/backend/internal/auth"
	"chemlab-tj/backend/internal/config"
	"chemlab-tj/backend/internal/db"
)

func main() {
	cfg := config.Load()
	conn, err := db.Open(cfg.DatabaseURL)
	if err != nil {
		log.Fatal(err)
	}
	defer conn.Close()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	seedUser(ctx, conn, "Администратор ChemLab TJ", "admin@chemlab.local", "Admin12345", "admin")
	seedUser(ctx, conn, "Демо пользователь", "user@chemlab.local", "User12345", "user")
	log.Println("Demo users seeded. Catalog seed is handled by migrations/006_seed_catalog_data.sql.")
}

func seedUser(ctx context.Context, conn *sql.DB, name, email, password, role string) {
	hash, err := auth.HashPassword(password)
	if err != nil {
		log.Fatal(err)
	}
	_, err = conn.ExecContext(ctx, `
		INSERT INTO users (name, email, password_hash, role)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (email) DO UPDATE SET
			name = EXCLUDED.name,
			role = EXCLUDED.role,
			updated_at = now()
	`, name, strings.ToLower(email), hash, role)
	if err != nil {
		log.Fatalf("seed user %s: %v", email, err)
	}
}

func init() {
	if os.Getenv("APP_ENV") == "" {
		_ = os.Setenv("APP_ENV", "development")
	}
}
