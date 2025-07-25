package resolver

import (
	"flint/internal/service"
)

// Resolver struct holds your application's core services
type Resolver struct {
	AuthService    *service.AuthService
	UserService    *service.UserService
	CompanyService *service.CompanyService
}

// NewResolver initializes the Resolver with the required services
func NewResolver() *Resolver {
	// Example: Initialize services (here we’re simulating empty constructors)
	authService := service.NewAuthService()
	userService := service.NewUserService()
	companyService := service.NewCompanyService()

	return &Resolver{
		AuthService:    authService,
		UserService:    userService,
		CompanyService: companyService,
	}
}
