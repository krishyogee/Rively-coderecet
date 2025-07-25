package clerk

import (
	"context"
	"encoding/json"
	"fmt"
	"os"

	"github.com/clerk/clerk-sdk-go/v2"
	"github.com/clerk/clerk-sdk-go/v2/signintoken"
	"github.com/clerk/clerk-sdk-go/v2/user"
	"go.uber.org/zap"
	"github.com/google/uuid"
	audit "flint/pkg/logger/audit"
)

func stringPtr(s string) *string {
	return &s
}

type Service struct {
}

func InitService() (*Service, error) {
	clerk.SetKey(os.Getenv("CLERK_SECRET_KEY"))
	return &Service{}, nil
}

type UserData struct {
	ID                    string               `json:"id"`
	Username              *string              `json:"username"`
	FirstName             *string              `json:"first_name"`
	LastName              *string              `json:"last_name"`
	ProfileImageURL       string               `json:"profile_image_url"`
	PrimaryEmailAddressID *string              `json:"primary_email_address_id"`
	EmailAddresses        []clerk.EmailAddress `json:"email_addresses"`
}

type SignInParams struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type SignInResponse struct {
	Token     string    `json:"token"`
	SessionID string    `json:"sessionId"`
	User      *UserData `json:"user"`
}

func (s *Service) CreateUser(ctx context.Context, email string, password string) (*clerk.User, error) {
	fmt.Println("Creating user in clerk auth ", email, password)
	userDetails := user.CreateParams{
		EmailAddresses: &[]string{email},
		Password:       stringPtr(password),
	}
	fmt.Println("user details passing", s)

	user, err := user.Create(ctx, &userDetails)
	if err != nil {
		fmt.Println("Error creating user:", err)
		return nil, err
	}

	_, err = json.MarshalIndent(user.ID, "", "  ")
	if err != nil {
		fmt.Println("Error marshalling user to JSON:", err)
		return nil, err
	}

	return user, nil
}

func (s *Service) SignIn(ctx context.Context, userID string) (string, error) {
	signInToken, err := signintoken.Create(ctx, &signintoken.CreateParams{
		UserID: &userID,
	})
	if err != nil {
		audit.GetConsoleLogger().Error("Error while generating token", zap.String("userID", userID), zap.String("error", err.Error()))
		return "", err
	}
	fmt.Println("SignInToken", signInToken)

	return signInToken.Token, nil
}

func (s *Service) UpdateTokenParamsWithCustomerID(ctx context.Context, clerkID string, userID string, customerID uuid.UUID, role string) (bool, error) {
	fmt.Println("UpdateTokenParamsWithCustomerID", userID, customerID, role)
	metadata := map[string]interface{}{
		"customerID": customerID.String(), // Ensure UUID is string
		"userUID":    userID,
		"verified":   true,
		"role":       role,
	}

	metadataJSON, err := json.Marshal(metadata)
	if err != nil {
		return false, fmt.Errorf("failed to marshal metadata: %w", err)
	}

	fmt.Printf("Updating Clerk user %s with metadata: %s\n", clerkID, string(metadataJSON))

	_, err = user.UpdateMetadata(ctx, clerkID, &user.UpdateMetadataParams{
		PublicMetadata: (*json.RawMessage)(&metadataJSON),
	})
	if err != nil {
		return false, fmt.Errorf("failed to update clerk user metadata: %w", err)
	}

	return true, nil
}

func (s *Service) UpdateTokenParamsWithUserName(ctx context.Context, userID string, userName string) (bool, error) {
	metadata := map[string]interface{}{
		"userName": userName,
	}

	metadataJSON, err := json.Marshal(metadata)
	if err != nil {
		return false, fmt.Errorf("failed to marshal metadata: %w", err)
	}

	fmt.Printf("Updating Clerk user %s with metadata: %s\n", userID, string(metadataJSON))

	res, err := user.UpdateMetadata(ctx, userID, &user.UpdateMetadataParams{
		PublicMetadata: (*json.RawMessage)(&metadataJSON),
	})
	if err != nil {
		return false, fmt.Errorf("failed to update clerk user metadata: %w", err)
	}

	fmt.Printf("Clerk response: %+v\n", res.PublicMetadata)
	return true, nil
}

func (s *Service) UpdateUserPublicMetadata(ctx context.Context, userID, name, role string) error {
	metadata := map[string]interface{}{
		"userName": name,
		"role":     role,
	}

	metadataJSON, err := json.Marshal(metadata)
	if err != nil {
		return fmt.Errorf("failed to marshal clerk metadata: %w", err)
	}

	fmt.Printf("Updating Clerk user %s with metadata: %s\n", userID, string(metadataJSON))

	_, err = user.UpdateMetadata(ctx, userID, &user.UpdateMetadataParams{
		PublicMetadata: (*json.RawMessage)(&metadataJSON),
	})
	if err != nil {
		return fmt.Errorf("failed to update clerk user metadata: %w", err)
	}

	fmt.Println("Successfully updated Clerk user metadata for user", userID)
	return nil
}