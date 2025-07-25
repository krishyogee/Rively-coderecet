package main

import (
	"fmt"
	"log"
	"os"
	"os/exec"
	"path/filepath"

	"flint/graph/generated"
	"flint/graph/resolver"
	"flint/internal/auth/clerk"
	"flint/internal/middleware"
	"flint/internal/repository"
	"flint/internal/routes"
	"flint/internal/service"
	"flint/pkg/database"
	"flint/pkg/logger/audit"
	"flint/pkg/mail"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func runMigrations(url string) {
	fmt.Println("Running migrations...")
	migrationsDir := filepath.Join("..", "db", "migrations")
	if os.Getenv("ENV") == "prod" {
		migrationsDir = filepath.Join("db", "migrations")
	}
	os.Setenv("DBMATE_MIGRATIONS_DIR", migrationsDir)

	cmd := exec.Command("dbmate", "up")
	output, err := cmd.CombinedOutput()
	if err != nil {
		log.Fatalf("Failed to run migrations: %v\nOutput: %s", err, output)
	}
	fmt.Println("Migrations done!\n", string(output))
}

func main() {
	r := gin.Default()
	audit.InitConsoleLogger()
	defer audit.SyncConsoleLogger()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * 60 * 60,
	}))

	if os.Getenv("ENV") != "prod" {
		if err := godotenv.Load(); err != nil {
			log.Fatal("Cannot read .env file")
		}
	}

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL not set")
	}

	if err := database.InitDB(dbURL); err != nil {
		log.Fatalf("Database initialization failed: %v", err)
	} else {
		runMigrations(dbURL)
	}

	store := repository.NewStore()

	if os.Getenv("CLERK_SECRET_KEY") == "" {
		log.Fatal("CLERK_SECRET_KEY environment variable is not set")
	}
	clerkService, err := clerk.InitService()
	if err != nil {
		log.Fatalf("Failed to initialize Clerk service: %v", err)
	}

	// Initialize services
	authService := service.NewAuthService(store)
	userService := service.NewUserService(store)

	// Resolver setup
	res := resolver.NewResolver(authService, userService, clerkService)

	// Email service init
	mail.InitEmailService()

	// Define routes
	routes.SetupRoutes(r)

	// Set up GraphQL
	srv := handler.NewDefaultServer(generated.NewExecutableSchema(generated.Config{Resolvers: res}))
	srv.Use(middleware.NewErrorMiddleware())

	r.POST("/graphql", middleware.AuthMiddleware(), gin.WrapH(srv))
	r.GET("/", gin.WrapH(playground.Handler("GraphQL playground", "/graphql")))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	r.MaxMultipartMemory = 8 << 20

	log.Printf("Server running on http://localhost:%s/ ...", port)
	log.Fatal(r.Run(":" + port))
}
