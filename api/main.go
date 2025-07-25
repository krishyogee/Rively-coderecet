package main

// import (
// 	"flint/internal/auth/clerk"
// 	gq "flint/internal/graphql"
// 	"flint/internal/graphql/resolvers"
// 	"flint/internal/repository"
// 	"flint/internal/routes"
// 	"flint/pkg/database"
// 	"flint/pkg/logger/audit"
// 	"flint/pkg/mail"
// 	"fmt"
// 	"log"
// 	"os"

// 	"github.com/gin-contrib/cors"
// 	"github.com/gin-gonic/gin"
// 	"github.com/golang-migrate/migrate"
// 	"github.com/graphql-go/handler"
// 	"github.com/joho/godotenv"
// )

// func runMigrations(url string) {
// 	m, err := migrate.New("file://database/migrations", url)
// 	if err != nil {
// 		log.Fatal(err)
// 	}

// 	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
// 		log.Fatal(err)
// 	}
// }

// func main() {
// 	// Initialize Gin
// 	r := gin.Default()

// 	audit.InitConsoleLogger()
// 	defer audit.SyncConsoleLogger()

// 	// Add CORS middleware
// 	r.Use(cors.New(cors.Config{
// 		AllowOrigins:     []string{"*"},
// 		AllowMethods:     []string{"GET", "POST", "OPTIONS"},
// 		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
// 		ExposeHeaders:    []string{"Content-Length"},
// 		AllowCredentials: true,
// 		MaxAge:           12 * 60 * 60, // 12 hours
// 	}))

// 	err := godotenv.Load()
// 	if err != nil {
// 		panic("Cannot read env")
// 	}

// 	databaseConnectionURL := os.Getenv("DATABASE_URL")
// 	fmt.Println("DATABASEE")
// 	fmt.Println(databaseConnectionURL)

// 	err = database.InitDB(databaseConnectionURL)
// 	if err != nil {
// 		runMigrations(databaseConnectionURL)
// 	}

// 	// Initialize Clerk Service
// 	clerkService, err := clerk.InitService()
// 	if err != nil {
// 		log.Fatalf("Failed to initialize Clerk service: %v", err)
// 	}

// 	// Create store
// 	store := repository.NewStore()
// 	if store == nil {
// 		log.Fatal("Failed to create store")
// 	}

// 	if os.Getenv("CLERK_SECRET_KEY") == "" {
// 		log.Fatal("CLERK_SECRET_KEY environment variable is not set")
// 	}

// 	mail.InitEmailService()

// 	// repository.NewStore(database.GetDB().DB)

// 	routes.SetupRoutes(r)

// 	customerResolver := resolvers.NewCustomerResolver()
// 	authResolver := resolvers.NewAuthResolver(store, clerkService)
// 	schema, err := gq.NewSchema(customerResolver, authResolver)
// 	if err != nil {
// 		panic(err)
// 	}

// 	// Create handler
// 	h := handler.New(&handler.Config{
// 		Schema:   &schema,
// 		Pretty:   true,
// 		GraphiQL: true,
// 	})

// 	// Setup GraphQL endpoint
// 	r.POST("/graphql", gin.WrapH(h))
// 	r.GET("/graphql", gin.WrapH(h)) // For GraphiQL interface

// 	r.Run(":8080")
// }
