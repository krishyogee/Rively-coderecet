package resolver

import (
	"flint/internal/auth/clerk"
	"flint/internal/service"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

type Resolver struct {
	authService            *service.AuthService
	customerService        *service.CustomerService
	userService            *service.UserService
	clerkService           *clerk.Service
	trackedCompanyService  *service.TrackedCompanyService
	companyUpdateService   *service.CompanyUpdateService
	departmentsService     *service.DepartmentService
	emailRecipientsService *service.EmailRecipients
}

// NewResolver initializes the Resolver with the required services
func NewResolver(authService *service.AuthService, customerService *service.CustomerService, userService *service.UserService, clerkService *clerk.Service, trackedCompanyService *service.TrackedCompanyService, companyUpdateService *service.CompanyUpdateService, departmentService *service.DepartmentService, emailRecipientsService *service.EmailRecipients) *Resolver {
	return &Resolver{
		customerService:        customerService,
		authService:            authService,
		userService:            userService,
		clerkService:           clerkService,
		trackedCompanyService:  trackedCompanyService,
		companyUpdateService:   companyUpdateService,
		departmentsService:     departmentService,
		emailRecipientsService: emailRecipientsService,
	}
}
