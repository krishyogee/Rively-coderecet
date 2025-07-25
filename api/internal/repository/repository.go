package repository

import (
	"context"
	"database/sql"
	"flint/internal/repository/company_updates"
	"flint/internal/repository/customers"
	"flint/internal/repository/departments"
	"flint/internal/repository/email_recipients"
	"flint/internal/repository/tracked_companies"
	"flint/internal/repository/users"

	"flint/pkg/database"
	"fmt"
	"log"
)

type Store struct {
	db               *sql.DB
	tx               *sql.Tx // Add transaction field
	Customers        *customers.Queries
	Users            *users.Queries
	TrackedCompanies *tracked_companies.Queries
	CompanyUpdates   *company_updates.Queries
	Departments      *departments.Queries      // Add departments field
	EmailRecipients  *email_recipients.Queries // Add email recipients field
}

func NewStore() *Store {
	db := database.GetDB()
	if db == nil {
		log.Fatal("Database connection is nil")
	}

	return &Store{
		db:               db,
		Customers:        customers.New(db),
		Users:            users.New(db),
		TrackedCompanies: tracked_companies.New(db),
		CompanyUpdates:   company_updates.New(db),
		Departments:      departments.New(db),      // Initialize departments queries
		EmailRecipients:  email_recipients.New(db), // Initialize email recipients queries
	}
}

// WithTx starts a new transaction and returns a new Store instance with the transaction
func (s *Store) WithTx(ctx context.Context) (*Store, error) {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}

	// Create a new store with the transaction
	txStore := &Store{
		db:               s.db,
		tx:               tx,
		Customers:        s.Customers.WithTx(tx),
		Users:            s.Users.WithTx(tx),
		TrackedCompanies: s.TrackedCompanies.WithTx(tx),
		CompanyUpdates:   s.CompanyUpdates.WithTx(tx),
		Departments:      s.Departments.WithTx(tx),
		EmailRecipients:  s.EmailRecipients.WithTx(tx),
	}

	return txStore, nil
}

// Commit commits the transaction if one exists
func (s *Store) Commit() error {
	if s.tx != nil {
		return s.tx.Commit()
	}
	return nil
}

// Rollback rolls back the transaction if one exists
func (s *Store) Rollback() error {
	if s.tx != nil {
		return s.tx.Rollback()
	}
	return nil
}
