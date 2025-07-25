package main

import (
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
	"fmt"
	"log"
	"os"
	"os/exec"
	"path/filepath"

	// _ "github.com/go-sql-driver/postgres"

	_ "github.com/golang-migrate/migrate/v4/database/postgres"

	_ "github.com/golang-migrate/migrate/v4/source/file"
	//"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"

	_ "github.com/golang-migrate/migrate/v4/source/file"
	//"github.com/golang-migrate/migrate/v4/source/iofs"
	_ "github.com/lib/pq"
	_ "github.com/mattes/migrate/source/file"

	// _ "github.com/mattes/migrate/source/file"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	// "github.com/golang-migrate/migrate"
	"github.com/joho/godotenv"
)

func runMigrations(url string) {
	fmt.Println("Running migrations...", url)
	var migrationsDir string
	if os.Getenv("ENV") == "prod" {
		migrationsDir = filepath.Join("db", "migrations")
	} else {
		migrationsDir = filepath.Join("..", "db", "migrations") // Adjust the path as necessary
	}
	os.Setenv("DBMATE_MIGRATIONS_DIR", migrationsDir)

	// Prepare the dbmate command
	cmd := exec.Command("dbmate", "up")

	// Run the command and capture the output
	output, err := cmd.CombinedOutput()
	if err != nil {
		log.Fatalf("Failed to run migrations: %v\nOutput: %s", err, output)
	}

	fmt.Println("Migrations done!")
	fmt.Println(string(output))
}

func main() {
	r := gin.Default()
	audit.InitConsoleLogger()
	defer audit.SyncConsoleLogger()

	// Add CORS middleware
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * 60 * 60, // 12 hours
	}))

	fmt.Println("ENV", os.Getenv("ENV"))
	if os.Getenv("ENV") != "prod" {
		err := godotenv.Load()
		if err != nil {
			panic("Cannot read env")
		}
	}
	databaseConnectionURL := os.Getenv("DATABASE_URL")
	fmt.Println("DATABASEE")
	fmt.Println(databaseConnectionURL)

	err := database.InitDB(databaseConnectionURL)
	fmt.Println("DB connection established Err", err)
	if err == nil {
		runMigrations(databaseConnectionURL)
	}

	store := repository.NewStore()
	if store == nil {
		log.Fatal("Failed to create store")
	}

	if os.Getenv("CLERK_SECRET_KEY") == "" {
		log.Fatal("CLERK_SECRET_KEY environment variable is not set")
	}

	clerkService, err := clerk.InitService()
	authService := service.NewAuthService(store)
	customerService := service.NewCustomerService(store)
	userService := service.NewUserService(store)
	trackedCompanyService := service.NewTrackedCompanyService(store)
	companyUpdateService := service.NewCompanyUpdateService(store)
	departmentService := service.NewDepartmentService(store)
	emailRecipientsService := service.NewEmailRecipientsService(store)

	resolver := resolver.NewResolver(
		authService,
		customerService,
		userService,
		clerkService,
		trackedCompanyService,
		companyUpdateService,
		departmentService,
		emailRecipientsService,
	)

	fmt.Println(clerkService)
	audit.GetConsoleLogger().Info("clrerkservuce")

	if err != nil {
		log.Fatalf("Failed to initialize Clerk service: %v", err)
	}

	mail.InitEmailService()
	routes.SetupRoutes(r)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	r.MaxMultipartMemory = 8 << 20
	// Set up GraphQL handler and playground via Gin
	srv := handler.NewDefaultServer(generated.NewExecutableSchema(generated.Config{Resolvers: resolver}))
	srv.Use(middleware.NewErrorMiddleware())
	r.POST("/graphql", middleware.AuthMiddleware(), gin.WrapH(srv))
	r.GET("/", gin.WrapH(playground.Handler("GraphQL playground", "/graphql")))

	// Run the server with Gin
	log.Printf("connect to http://localhost:%s/ for GraphQL playground", port)
	log.Fatal(r.Run(":" + port))
}
