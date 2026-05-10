package main

import (
	"log"
	"net/http"
	"time"

	"chemlab-tj/backend/internal/config"
	"chemlab-tj/backend/internal/db"
	apphttp "chemlab-tj/backend/internal/http/routes"
	"chemlab-tj/backend/internal/repositories"
)

func main() {
	cfg := config.Load()
	log.Printf("startup app_env=%s port=%s db_config=%s cors_origins=%v", cfg.AppEnv, cfg.Port, configuredStatus(cfg.DatabaseURL), cfg.CORSOrigins)

	conn, err := db.Open(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("database connection failed: %v", err)
	}
	defer conn.Close()

	store := repositories.NewStore(conn)
	router := apphttp.NewRouter(cfg, store)

	server := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           router,
		ReadHeaderTimeout: 5 * time.Second,
	}

	log.Printf("ChemLab TJ API listening on :%s", cfg.Port)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("server failed: %v", err)
	}
}

func configuredStatus(value string) string {
	if value == "" {
		return "not configured"
	}
	return "configured"
}
