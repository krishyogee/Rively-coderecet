package service

import (
	"context"
	"flint/graph/model"
	"flint/internal/middleware"
	"flint/internal/repository"
	"fmt"
)

type UserService struct {
	store *repository.Store
}

func NewUserService(store *repository.Store) *UserService {
	return &UserService{store: store}
}

func (s *UserService) GetAccountUsers(ctx context.Context) ([]*model.User, error) {
	// Fetch the users from the database
	customerUID, err := middleware.GetCustomerUIDFromContext(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get customer UID: %w", err)
	}
	rows, err := s.store.Users.ListUsersByCustomerUID(ctx, customerUID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch users: %w", err)
	}

	// Process rows into the desired response format
	var users []*model.User
	for _, row := range rows {
		var namePtr *string
		if row.Name.Valid {
			namePtr = &row.Name.String
		} else {
			namePtr = nil
		}
		user := model.User{
			UserUID:    row.UserID.String(),
			ID:         row.UserID.String(),
			Name:       namePtr,
			Email:      row.Email,
			IsVerified: &row.IsVerified.Bool,
		}
		users = append(users, &user)
	}

	fmt.Println("rows", rows)
	return users, nil
}
