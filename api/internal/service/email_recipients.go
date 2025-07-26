package service

import (
	"context"
	"flint/graph/model"
	"flint/internal/middleware"
	"flint/internal/repository"
	"flint/internal/repository/email_recipients"
	"flint/internal/utils/jwt"
	"fmt"
	"time"

	"github.com/google/uuid"
)

type EmailRecipients struct {
	store *repository.Store
}

func NewEmailRecipientsService(store *repository.Store) *EmailRecipients {
	return &EmailRecipients{store: store}
}

func (s *EmailRecipients) InviteEmailRecipient(ctx context.Context, input model.InviteEmailRecipientInput) (*model.InviteEmailRecipientResponse, error) {
	// Get customer UID from context
	customerUID, err := middleware.GetCustomerUIDFromContext(ctx)
	if err != nil {
		return nil, fmt.Errorf("customer UID not found in context: %w", err)
	}

	// Validate that the department exists
	departmentUUID, err := uuid.Parse(input.DepartmentUID)
	if err != nil {
		return nil, fmt.Errorf("invalid department UID: %w", err)
	}

	// Check if department exists
	_, err = s.store.Departments.GetDepartmentByUID(ctx, departmentUUID)
	if err != nil {
		return nil, fmt.Errorf("department not found: %w", err)
	}

	// Generate invite token
	inviteToken, err := jwt.GenerateInviteToken(input.DepartmentUID, customerUID.UUID.String())
	if err != nil {
		return nil, fmt.Errorf("failed to generate invite token: %w", err)
	}

	return &model.InviteEmailRecipientResponse{
		InviteToken: inviteToken,
	}, nil
}

func (s *EmailRecipients) ValidateInvite(ctx context.Context, input model.ValidateInviteInput) (*model.InviteData, error) {
	// Validate the invite token by decoding it and checking if it is still valid
	claims, err := jwt.ValidateInviteToken(input.Token)
	if err != nil {
		return nil, fmt.Errorf("invalid invite token: %w", err)
	}

	// Convert time.Time to string for GraphQL DateTime scalar (RFC3339 format)
	expiresAt := claims.ExpiresAt.Format(time.RFC3339)
	createdAt := claims.CreatedAt.Format(time.RFC3339)

	return &model.InviteData{
		DepartmentUID: claims.DepartmentUID,
		CustomerUID:   claims.CustomerUID,
		IsValid:       claims.IsValid && time.Now().Before(claims.ExpiresAt),
		ExpiresAt:     expiresAt,
		CreatedAt:     createdAt,
	}, nil
}

func (s *EmailRecipients) CreateEmailRecipient(ctx context.Context, input model.CreateEmailRecipientInput) (*model.EmailRecipient, error) {
	// Get customer UID from context
	customerUID, err := middleware.GetCustomerUIDFromContext(ctx)
	if err != nil {
		return nil, fmt.Errorf("customer UID not found in context: %w", err)
	}

	// Parse UUIDs
	departmentUUID, err := uuid.Parse(input.DepartmentUID)
	if err != nil {
		return nil, fmt.Errorf("invalid department UID: %w", err)
	}

	// Verify department exists
	_, err = s.store.Departments.GetDepartmentByUID(ctx, departmentUUID)
	if err != nil {
		return nil, fmt.Errorf("department not found: %w", err)
	}

	// Check if email recipient already exists
	_, err = s.store.EmailRecipients.GetEmailRecipientByEmail(ctx, input.Email)
	if err == nil {
		return nil, fmt.Errorf("email recipient with this email already exists")
	}

	// Create email recipient
	createParams := email_recipients.CreateEmailRecipientParams{
		Name:          input.Name,
		Email:         input.Email,
		DepartmentUid: departmentUUID,
		CustomerUid:   customerUID.UUID,
	}

	recipient, err := s.store.EmailRecipients.CreateEmailRecipient(ctx, createParams)
	if err != nil {
		return nil, fmt.Errorf("failed to create email recipient: %w", err)
	}

	// Convert to GraphQL model
	return &model.EmailRecipient{
		ID:                int(recipient.ID),
		EmailRecipientUID: recipient.EmailRecipientUid.String(),
		Name:              recipient.Name,
		Email:             recipient.Email,
		IsActive:          recipient.IsActive,
		DepartmentUID:     recipient.DepartmentUid.String(),
		CustomerUID:       recipient.CustomerUid.String(),
		CreatedAt:         recipient.CreatedAt.Format(time.RFC3339),
	}, nil
}

// GetEmailRecipientsByCustomer returns all email recipients for a customer
func (s *EmailRecipients) GetEmailRecipients(ctx context.Context) ([]*model.EmailRecipient, error) {
	// Get customer UID from context
	customerUID, err := middleware.GetCustomerUIDFromContext(ctx)
	if err != nil {
		return nil, fmt.Errorf("customer UID not found in context: %w", err)
	}

	recipients, err := s.store.EmailRecipients.ListEmailRecipientsByCustomer(ctx, customerUID.UUID)
	if err != nil {
		return nil, fmt.Errorf("failed to get email recipients: %w", err)
	}

	// Convert to GraphQL models
	var result []*model.EmailRecipient
	for _, recipient := range recipients {
		result = append(result, &model.EmailRecipient{
			ID:                int(recipient.ID),
			EmailRecipientUID: recipient.EmailRecipientUid.String(),
			Name:              recipient.Name,
			Email:             recipient.Email,
			IsActive:          recipient.IsActive,
			DepartmentUID:     recipient.DepartmentUid.String(),
			CustomerUID:       recipient.CustomerUid.String(),
			CreatedAt:         recipient.CreatedAt.Format(time.RFC3339),
		})
	}

	return result, nil
}

// GetEmailRecipientsByDepartment returns all email recipients for a department
func (s *EmailRecipients) GetEmailRecipientsByDepartment(ctx context.Context, departmentUID string) ([]*model.EmailRecipient, error) {
	// Get customer UID from context for security (only return recipients that belong to this customer)
	customerUID, err := middleware.GetCustomerUIDFromContext(ctx)
	if err != nil {
		return nil, fmt.Errorf("customer UID not found in context: %w", err)
	}

	departmentUUID, err := uuid.Parse(departmentUID)
	if err != nil {
		return nil, fmt.Errorf("invalid department UID: %w", err)
	}

	// Verify department exists
	_, err = s.store.Departments.GetDepartmentByUID(ctx, departmentUUID)
	if err != nil {
		return nil, fmt.Errorf("department not found: %w", err)
	}

	recipients, err := s.store.EmailRecipients.ListEmailRecipientsByDepartment(ctx, departmentUUID)
	if err != nil {
		return nil, fmt.Errorf("failed to get email recipients: %w", err)
	}

	// Filter recipients to only include those belonging to the current customer
	var result []*model.EmailRecipient
	for _, recipient := range recipients {
		if recipient.CustomerUid.String() == customerUID.UUID.String() {
			result = append(result, &model.EmailRecipient{
				ID:                int(recipient.ID),
				EmailRecipientUID: recipient.EmailRecipientUid.String(),
				Name:              recipient.Name,
				Email:             recipient.Email,
				IsActive:          recipient.IsActive,
				DepartmentUID:     recipient.DepartmentUid.String(),
				CustomerUID:       recipient.CustomerUid.String(),
				CreatedAt:         recipient.CreatedAt.Format(time.RFC3339),
			})
		}
	}

	return result, nil
}

// UpdateEmailRecipient updates an email recipient's information
func (s *EmailRecipients) UpdateEmailRecipient(ctx context.Context, id int, name, email string) (*model.EmailRecipient, error) {
	// Get customer UID from context
	customerUID, err := middleware.GetCustomerUIDFromContext(ctx)
	if err != nil {
		return nil, fmt.Errorf("customer UID not found in context: %w", err)
	}

	// Get existing recipient to verify ownership
	recipient, err := s.store.EmailRecipients.GetEmailRecipientById(ctx, int32(id))
	if err != nil {
		return nil, fmt.Errorf("email recipient not found: %w", err)
	}

	// Verify recipient belongs to customer
	if recipient.CustomerUid.String() != customerUID.UUID.String() {
		return nil, fmt.Errorf("email recipient does not belong to customer")
	}

	// Update recipient
	updateParams := email_recipients.UpdateEmailRecipientParams{
		EmailRecipientUid: recipient.EmailRecipientUid,
		Name:              name,
		Email:             email,
		IsActive:          recipient.IsActive, // Keep existing value for now
	}

	err = s.store.EmailRecipients.UpdateEmailRecipient(ctx, updateParams)
	if err != nil {
		return nil, fmt.Errorf("failed to update email recipient: %w", err)
	}

	// Get updated recipient
	updatedRecipient, err := s.store.EmailRecipients.GetEmailRecipientByUID(ctx, recipient.EmailRecipientUid)
	if err != nil {
		return nil, fmt.Errorf("failed to get updated email recipient: %w", err)
	}

	// Convert to GraphQL model
	return &model.EmailRecipient{
		ID:                int(updatedRecipient.ID),
		EmailRecipientUID: updatedRecipient.EmailRecipientUid.String(),
		Name:              updatedRecipient.Name,
		Email:             updatedRecipient.Email,
		IsActive:          updatedRecipient.IsActive,
		DepartmentUID:     updatedRecipient.DepartmentUid.String(),
		CustomerUID:       updatedRecipient.CustomerUid.String(),
		CreatedAt:         updatedRecipient.CreatedAt.Format(time.RFC3339),
	}, nil
}

// UpdateEmailRecipientByInput updates an email recipient's information using GraphQL input
func (s *EmailRecipients) UpdateEmailRecipientByInput(ctx context.Context, input model.UpdateEmailRecipientInput) (*model.EmailRecipient, error) {
	// Get customer UID from context
	customerUID, err := middleware.GetCustomerUIDFromContext(ctx)
	if err != nil {
		return nil, fmt.Errorf("customer UID not found in context: %w", err)
	}

	// Parse email recipient UID
	emailRecipientUID, err := uuid.Parse(input.EmailRecipientUID)
	if err != nil {
		return nil, fmt.Errorf("invalid email recipient UID: %w", err)
	}

	// Get existing recipient to verify ownership
	recipient, err := s.store.EmailRecipients.GetEmailRecipientByUID(ctx, emailRecipientUID)
	if err != nil {
		return nil, fmt.Errorf("email recipient not found: %w", err)
	}

	// Verify recipient belongs to customer
	if recipient.CustomerUid.String() != customerUID.UUID.String() {
		return nil, fmt.Errorf("email recipient does not belong to customer")
	}

	// Prepare update values - use existing values if not provided in input
	name := recipient.Name
	email := recipient.Email
	isActive := recipient.IsActive
	departmentUID := recipient.DepartmentUid

	if input.Name != nil {
		name = *input.Name
	}
	if input.Email != nil {
		email = *input.Email
	}
	if input.IsActive != nil {
		isActive = *input.IsActive
	}
	if input.DepartmentUID != nil {
		departmentUUID, err := uuid.Parse(*input.DepartmentUID)
		if err != nil {
			return nil, fmt.Errorf("invalid department UID: %w", err)
		}
		// Verify department exists
		_, err = s.store.Departments.GetDepartmentByUID(ctx, departmentUUID)
		if err != nil {
			return nil, fmt.Errorf("department not found: %w", err)
		}
		departmentUID = departmentUUID
	}

	// Update recipient
	updateParams := email_recipients.UpdateEmailRecipientParams{
		EmailRecipientUid: emailRecipientUID,
		Name:              name,
		Email:             email,
		IsActive:          isActive,
		DepartmentUid:     departmentUID,
	}

	err = s.store.EmailRecipients.UpdateEmailRecipient(ctx, updateParams)
	if err != nil {
		return nil, fmt.Errorf("failed to update email recipient: %w", err)
	}

	// Get updated recipient
	updatedRecipient, err := s.store.EmailRecipients.GetEmailRecipientByUID(ctx, emailRecipientUID)
	if err != nil {
		return nil, fmt.Errorf("failed to get updated email recipient: %w", err)
	}

	// Convert to GraphQL model
	return &model.EmailRecipient{
		ID:                int(updatedRecipient.ID),
		EmailRecipientUID: updatedRecipient.EmailRecipientUid.String(),
		Name:              updatedRecipient.Name,
		Email:             updatedRecipient.Email,
		IsActive:          updatedRecipient.IsActive,
		DepartmentUID:     updatedRecipient.DepartmentUid.String(),
		CustomerUID:       updatedRecipient.CustomerUid.String(),
		CreatedAt:         updatedRecipient.CreatedAt.Format(time.RFC3339),
	}, nil
}

// DeleteEmailRecipient deletes an email recipient
func (s *EmailRecipients) DeleteEmailRecipient(ctx context.Context, id int) error {
	// Get customer UID from context
	customerUID, err := middleware.GetCustomerUIDFromContext(ctx)
	if err != nil {
		return fmt.Errorf("customer UID not found in context: %w", err)
	}

	// Get existing recipient to verify ownership
	recipient, err := s.store.EmailRecipients.GetEmailRecipientById(ctx, int32(id))
	if err != nil {
		return fmt.Errorf("email recipient not found: %w", err)
	}

	// Verify recipient belongs to customer
	if recipient.CustomerUid.String() != customerUID.UUID.String() {
		return fmt.Errorf("email recipient does not belong to customer")
	}

	// Delete recipient
	err = s.store.EmailRecipients.DeleteEmailRecipient(ctx, recipient.EmailRecipientUid)
	if err != nil {
		return fmt.Errorf("failed to delete email recipient: %w", err)
	}

	return nil
}

// DeleteEmailRecipientByUID deletes an email recipient using GraphQL input
func (s *EmailRecipients) DeleteEmailRecipientByUID(ctx context.Context, input model.DeleteEmailRecipientInput) (*model.DeleteEmailRecipientResponse, error) {
	// Get customer UID from context
	customerUID, err := middleware.GetCustomerUIDFromContext(ctx)
	if err != nil {
		return nil, fmt.Errorf("customer UID not found in context: %w", err)
	}

	// Parse email recipient UID
	emailRecipientUID, err := uuid.Parse(input.EmailRecipientUID)
	if err != nil {
		return nil, fmt.Errorf("invalid email recipient UID: %w", err)
	}

	// Get existing recipient to verify ownership
	recipient, err := s.store.EmailRecipients.GetEmailRecipientByUID(ctx, emailRecipientUID)
	if err != nil {
		return nil, fmt.Errorf("email recipient not found: %w", err)
	}

	// Verify recipient belongs to customer
	if recipient.CustomerUid.String() != customerUID.UUID.String() {
		return nil, fmt.Errorf("email recipient does not belong to customer")
	}

	// Delete recipient
	err = s.store.EmailRecipients.DeleteEmailRecipient(ctx, recipient.EmailRecipientUid)
	if err != nil {
		return nil, fmt.Errorf("failed to delete email recipient: %w", err)
	}

	return &model.DeleteEmailRecipientResponse{
		Success: true,
	}, nil
}
