package service

import (
	"context"
	"flint/graph/model"
	"flint/internal/auth/clerk"
	"flint/internal/middleware"
	"flint/internal/repository/customers"
	"flint/internal/repository/email_recipients"
	"flint/internal/repository/users"
	"flint/internal/utils/helpers"
	"fmt"

	// "flint/internal/repository/customers"
	"flint/internal/repository"

	"github.com/google/uuid"
)

type CustomerService struct {
	store *repository.Store
}

func NewCustomerService(store *repository.Store) *CustomerService {
	return &CustomerService{store: store}
}

func (s *CustomerService) GetCustomer(ctx context.Context, customerUid uuid.UUID) (*customers.GetCustomerByUIDRow, error) {
	txStore, err := s.store.WithTx(ctx)
	if err != nil {
		return nil, err
	}
	customer, err := txStore.Customers.GetCustomerByUID(ctx, customerUid)
	if err != nil {
		return nil, err
	}
	return &customer, nil
}


func (s *CustomerService) UpdateCustomerAndUser(ctx context.Context, input model.UpdateCustomerAndUserInput) (*customers.GetCustomerByUIDRow, error) {
	// Step 1: Extract UIDs from context
	userUID, err := middleware.GetUserUIDFromContext(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get user UID from context: %w", err)
	}

	customerUID, err := middleware.GetCustomerUIDFromContext(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get customer UID from context: %w", err)
	}

	clerkUserID, err := middleware.GetClerkUserIDFromContext(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get Clerk user ID from context: %w", err)
	}

	LeaderShipDepartmentUID, err := s.store.Departments.GetLeadershipUID(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get Leadership department UID: %w", err)
	}

	CustomerEmail, err := s.store.Customers.GetCustomerEmailByUID(ctx, customerUID.UUID)
	if err != nil {
		return nil, fmt.Errorf("failed to get customer email: %w", err)	
	}

	_, err = s.store.EmailRecipients.CreateEmailRecipient(ctx, email_recipients.CreateEmailRecipientParams{
		Name:          input.Name,
		Email:         CustomerEmail,
		DepartmentUid: LeaderShipDepartmentUID,
		CustomerUid:   customerUID.UUID,
	})
	if err != nil {	
		return nil, fmt.Errorf("failed to create email recipient: %w", err)
	}
				

	// Step 2: Update customers table with Domain
	_, err = s.store.Customers.UpdateCustomerDomain(ctx, customers.UpdateCustomerDomainParams{
		Domain:      helpers.StringToNullString(input.Domain),
		CustomerUid: customerUID.UUID,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to update customer domain: %w", err)
	}

	// Step 3: Update users table with Name and Role
	_, err = s.store.Users.UpdateUserNameAndRole(ctx, users.UpdateUserNameAndRoleParams{
		Name:   helpers.StringToNullString(input.Name),
		Role:   helpers.StringToNullString(input.Role),
		UserID: userUID.UUID, // Assumes UserID is uuid.UUID
	})
	if err != nil {
		return nil, fmt.Errorf("failed to update user name and role: %w", err)
	}

	// Step 4: Initialize Clerk service and update public metadata
	clerkService, err := clerk.InitService()
	if err != nil {
		return nil, fmt.Errorf("failed to initialize clerk service: %w", err)
	}

	// Check if userUID is valid (for database consistency)
	if !userUID.Valid {
		return nil, fmt.Errorf("invalid user UID")
	}

	// Use clerkUserID for Clerk API
	err = clerkService.UpdateUserPublicMetadata(ctx, clerkUserID, input.Name, input.Role)
	if err != nil {
		return nil, fmt.Errorf("failed to update clerk metadata: %w", err)
	}

	// Step 5: Fetch updated customer details
	customerData, err := s.store.Customers.GetCustomerByUID(ctx, customerUID.UUID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch updated customer: %w", err)
	}

	return &customerData, nil
}