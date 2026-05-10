package routes

import (
	"net/http"

	"chemlab-tj/backend/internal/config"
	"chemlab-tj/backend/internal/http/handlers"
	"chemlab-tj/backend/internal/http/middleware"
	"chemlab-tj/backend/internal/repositories"
	"chemlab-tj/backend/internal/services"
)

func NewRouter(cfg config.Config, store *repositories.Store) http.Handler {
	mux := http.NewServeMux()

	healthHandler := handlers.NewHealthHandler(store)
	catalogHandler := handlers.NewCatalogHandler(store)
	authService := services.NewAuthService(store, cfg.JWTSecret)
	authHandler := handlers.NewAuthHandler(authService, store)
	progressHandler := handlers.NewProgressHandler(store)
	adminHandler := handlers.NewAdminHandler(store)
	authMiddleware := middleware.Auth(cfg.JWTSecret)

	mux.Handle("/api/health", healthHandler)
	mux.HandleFunc("/api/elements", catalogHandler.Elements)
	mux.HandleFunc("/api/periodic-elements", catalogHandler.PeriodicElements)
	mux.HandleFunc("/api/periodic-elements/", catalogHandler.PeriodicElementBySymbol)
	mux.HandleFunc("/api/substances", catalogHandler.Substances)
	mux.HandleFunc("/api/substances/", catalogHandler.SubstanceByID)
	mux.HandleFunc("/api/reactions", catalogHandler.Reactions)
	mux.HandleFunc("/api/reactions/", catalogHandler.ReactionByID)
	mux.HandleFunc("/api/tasks", catalogHandler.Tasks)
	mux.HandleFunc("/api/handbook", catalogHandler.Handbook)
	mux.HandleFunc("/api/auth/register", authHandler.Register)
	mux.HandleFunc("/api/auth/login", authHandler.Login)
	mux.Handle("/api/auth/logout", authMiddleware(http.HandlerFunc(authHandler.Logout)))
	mux.Handle("/api/me", authMiddleware(http.HandlerFunc(authHandler.Me)))
	mux.Handle("/api/experiments", authMiddleware(http.HandlerFunc(progressHandler.CreateAttempt)))
	mux.Handle("/api/experiments/attempts", authMiddleware(http.HandlerFunc(progressHandler.CreateAttempt)))
	mux.Handle("/api/progress/me", authMiddleware(http.HandlerFunc(progressHandler.MyProgress)))
	mux.Handle("/api/admin/", authMiddleware(adminHandler))

	return middleware.Recovery(middleware.Logging(middleware.CORS(cfg.CORSOrigins)(mux)))
}
