package database

import (
	"database/sql"
	"fmt"
	"log"

	"github.com/golang-migrate/migrate"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/lib/pq"
)

var db *sql.DB

func RunMigrations(url string) {
	m, err := migrate.New("file://database/migrations", url)
	if err != nil {
		log.Fatal(err)
	}

	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		log.Fatal(err)
	}
}

func InitDB(url string) error {
	var err error
	dsn := url
	fmt.Println("DATABASE URL in postgres.go", dsn)

	// Connect to the database
	db, err = sql.Open("postgres", dsn)
	if err != nil {
		log.Fatal("Failed to connect to the database: ", err)
		return err
	}

	if err = db.Ping(); err != nil {
		log.Fatal("Failed to ping the database: ", err)
		return err
	}

	log.Println("Database connection established and migrations ran successfully")
	return nil
}

// GetDB returns the database instance.
func GetDB() *sql.DB {
	return db
}
