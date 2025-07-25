package service

import (
	"context"
	"database/sql"
	"errors"
	"flint/graph/model"
	"flint/internal/repository"
	"flint/internal/repository/customers"
	"flint/internal/repository/users"
	"flint/internal/utils/constants"
	"flint/internal/utils/helpers"
	"flint/pkg/logger/audit"
	"flint/pkg/mail"
	"flint/pkg/mail/templates"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/google/uuid"
)

type SignupCreateUser struct {
	Email    string
	Password string
	Customer string
	ClerkId  string
}

// type UpdateUserCustomerIDParams {

// }

type AuthService struct {
	store *repository.Store
}

func NewAuthService(store *repository.Store) *AuthService {
	// store := repository.NewStore()
	if store == nil {
		panic("store cannot be nil")
	}

	return &AuthService{store: store}
}

func (s *AuthService) SignupCreateUser(ctx context.Context, input SignupCreateUser) (*model.User, error) {

	//  Start a transaction using WithTx
	txStore, err := s.store.WithTx(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to start transaction: %w", err)
	}
	// Ensure rollback in case of error
	defer func() {
		if err != nil {
			if rbErr := txStore.Rollback(); rbErr != nil {
				// Log rollback error but don't override the original error
				fmt.Printf("rollback error: %v\n", rbErr)
			}
		}
	}()

	// 1. Create user first (without customer_id)
	createUserParams := users.CreateUserParams{
		Email:      input.Email,
		IsVerified: sql.NullBool{Bool: false, Valid: true},
		CustomerUid: uuid.NullUUID{}, // Initially NULL
		ClerkID:    sql.NullString{String: input.ClerkId, Valid: true},
	}

	user, err := txStore.Users.CreateUser(ctx, createUserParams)
	if err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	// 2. Create customer with user as owner
	createCustomerParams := customers.CreateCustomerParams{
		Email: input.Email,
		IsVerified: sql.NullBool{Bool: false, Valid: true},
	}
 
	fmt.Println("CUSTOMER PARAMS:",input.Email, helpers.GetDomainFromEmail(input.Email), createCustomerParams)

	customer, err := txStore.Customers.CreateCustomer(ctx, createCustomerParams)
	fmt.Println("Added customer", customer)
	if err != nil {
		return nil, fmt.Errorf("failed to create customer: %w", err)
	}

	// 3. Update user with customer_id
	updateUserParams := users.UpdateUserCustomerIDParams{
		ID:         user.ID,
		CustomerUid: helpers.StringToNullUUID(customer.CustomerUid.String())  ,
	}

	_, err = txStore.Users.UpdateUserCustomerID(ctx, updateUserParams)
	if err != nil {
		fmt.Println("Failed while updating user with customer ID")
		return nil, fmt.Errorf("failed to update user with customer ID: %w", err)
	}

	// 4. Update customer with owner id
	updateCustomerParams := customers.UpdateCustomerOwnerIDParams{
		ID: customer.ID,
		OwnerID: sql.NullInt32{
			Int32: user.ID,
			Valid: true,
		},
	}
	_, err = txStore.Customers.UpdateCustomerOwnerID(ctx, updateCustomerParams)
	if err != nil {
		fmt.Println("Failed while updating customer with owner")
		return nil, fmt.Errorf("failed while updating customer with owner: %w", err)
	}
	// updatedCustomer, err := txStore.Customers.UpdateCustomer(ctx, )
	token, err := helpers.GenerateToken(18)
	if err != nil {
		fmt.Println("error generating token", err)
	}
	fmt.Println("CUSTOMERRRRRRRR", customer)
	// Combine customerID and token into a single string
	compositeToken := fmt.Sprintf("%s.%s", customer.CustomerUid.String(), token)

	customerToken := customers.UpdateCustomerVerificationTokenParams{
		ID: customer.ID,
		VerificationToken: sql.NullString{
			String: token,
			Valid:  true,
		},
	}

	err = txStore.Customers.UpdateCustomerVerificationToken(ctx, customerToken)
	if err != nil {
		audit.GetConsoleLogger().Error("Error while generating token")
		fmt.Println("Error while updatig token", err)
		return nil, errors.New("error while generating token")
	}

	subject := "Welcome to Rively - Verify Your Email"
	var verificationLink string

	if os.Getenv("ENV") == constants.LOCAL_ENV {
		verificationLink = fmt.Sprintf("http://localhost:3000/verify-account/%s", compositeToken)
	}else {
		verificationLink = fmt.Sprintf("https://loop-nu-two.vercel.app/verify-account/%s", compositeToken)
	}

	// Create template data
	// emailData := templates.{
	// 	VerificationLink: verificationLink,
	// 	EmailAddress:     "mohamedarifcbe@gmail.com",
	// }

	// Get parsed HTML
	htmlBody, err := templates.GetVerificationEmail(verificationLink, input.Email)
	if err != nil {
		return nil, err
	}

	err = mail.GetEmailService().SendMail(input.Email, subject, htmlBody)
	if err != nil {
		return nil, fmt.Errorf("failed to send email: %w", err)
	}
	err =  txStore.Customers.UpdateCustomer(ctx, customers.UpdateCustomerParams{
		CustomerUid: customer.CustomerUid,
		VerificationTokenSentAt: sql.NullTime{
			Time:  time.Now(),
			Valid: true,
		},
		Email: customer.Email,
		Domain: helpers.StringToNullString(helpers.GetDomainFromEmail(input.Email)),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to update customer 174: %w", err)
	}

	audit.GetConsoleLogger().Info("Email sent")

	// get user
	newUser, err := txStore.Users.GetUserById(ctx, user.ID)

	// Commit the transaction
	if err = txStore.Commit(); err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	return &model.User{
		ID: newUser.UserID.String(),
		UserUID: newUser.UserID.String(),
		Email: newUser.Email,
		IsVerified: &newUser.IsVerified.Bool,
		// CustomerUID: &newUser.CustomerUid.UUID.String(),
		// CreatedAt: newUser.CreatedAt.Time.String(),
	}, nil
}

func (s *AuthService) VerifyCustomer(ctx context.Context, token string) (*customers.GetCustomerByUIDRow, error) {
	fmt.Println("inside service--------------")
	parts := strings.Split(token, ".")

	if len(parts) != 2 {
		fmt.Println("Invalid token format")
		return nil, nil
	}

	customerUID := parts[0] // this is the customerUID in string format
	fmt.Println("customerUID", customerUID)
	// Convert customerUID string to uuid.UUID
	customerUUID, err := uuid.Parse(customerUID)
	if err != nil {
		fmt.Println("Invalid customer UID:", err)
		return nil, nil
	}

	customer, err := s.store.Customers.GetCustomerByUID(ctx, customerUUID)
	if err != nil {
		fmt.Println(err)
	}


	fmt.Println("Updatng i  db 196", customer.VerificationToken.String)

	if customer.VerificationToken.Valid && customer.VerificationToken.String == parts[1] {
		fmt.Println("validdddduuuu")
		err = s.store.Customers.UpdateCustomerVerification(ctx, customers.UpdateCustomerVerificationParams{
			CustomerUid: customerUUID,
			IsVerified: sql.NullBool{
				Bool:  true,
				Valid: true,
			},
		})
		if err != nil {
			return nil, err
		}
	}

	if err != nil {
		return nil, err
	}

	fmt.Println("iupdates", &customer.IsVerified.Bool, customerUUID)


	return &customer, nil
}
