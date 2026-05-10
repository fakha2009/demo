package config

import (
	"log"
	"os"
	"strings"
)

type Config struct {
	AppEnv      string
	Port        string
	DatabaseURL string
	JWTSecret   string
	CORSOrigins []string
}

func Load() Config {
	loadDotEnv(".env")
	loadDotEnv("backend/.env")

	appEnv := strings.TrimSpace(os.Getenv("APP_ENV"))
	if appEnv == "" {
		appEnv = "development"
	}
	isProduction := strings.EqualFold(appEnv, "production")

	port := envWithDefault("PORT", "8080", !isProduction)
	databaseURL := strings.TrimSpace(os.Getenv("DATABASE_URL"))
	if databaseURL == "" && !isProduction {
		databaseURL = "host=localhost port=5432 user=postgres password=postgres dbname=chemtj sslmode=disable"
	}
	if databaseURL == "" {
		log.Fatal("DATABASE_URL is required")
	}

	jwtSecret := strings.TrimSpace(os.Getenv("JWT_SECRET"))
	if jwtSecret == "" && !isProduction {
		jwtSecret = "dev-only-change-me"
	}
	if jwtSecret == "" {
		log.Fatal("JWT_SECRET is required")
	}
	if isProduction && jwtSecret == "dev-only-change-me" {
		log.Fatal("JWT_SECRET must be set to a strong production secret")
	}

	origins := splitCSV(envWithDefault("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173", !isProduction))

	return Config{
		AppEnv:      appEnv,
		Port:        port,
		DatabaseURL: databaseURL,
		JWTSecret:   jwtSecret,
		CORSOrigins: origins,
	}
}

func loadDotEnv(path string) {
	data, err := os.ReadFile(path)
	if err != nil {
		return
	}
	for _, line := range strings.Split(string(data), "\n") {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		key, value, ok := strings.Cut(line, "=")
		if !ok {
			continue
		}
		key = strings.TrimSpace(key)
		value = strings.Trim(strings.TrimSpace(value), `"'`)
		if key != "" && os.Getenv(key) == "" {
			_ = os.Setenv(key, value)
		}
	}
}

func envWithDefault(key, fallback string, allowDefault bool) string {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		if !allowDefault {
			return ""
		}
		return fallback
	}
	return value
}

func splitCSV(value string) []string {
	parts := strings.Split(value, ",")
	out := make([]string, 0, len(parts))
	for _, part := range parts {
		trimmed := strings.TrimSpace(part)
		if trimmed != "" {
			out = append(out, trimmed)
		}
	}
	return out
}
