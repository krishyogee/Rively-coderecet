package service

import (
	"context"
	"flint/graph/model"
	"flint/internal/middleware"
	"flint/internal/repository"
	"flint/internal/repository/tracked_companies"
	"flint/internal/utils/helpers"
)

type TrackedCompanyService struct {
	store *repository.Store
}

func NewTrackedCompanyService(store *repository.Store) *TrackedCompanyService {
	return &TrackedCompanyService{store: store}
}

func (s *TrackedCompanyService) CreateTrackedCompany(ctx context.Context, input model.CreateTrackedCompanyInput) (*model.TrackedCompany, error) {
    // Fetch customer UID from the context
    customerUID, err := middleware.GetCustomerUIDFromContext(ctx)
    if err != nil {
        return nil, err
    }
	
    // Call repository to create the product
    createdCompany, err := s.store.TrackedCompanies.CreateTrackedCompany(ctx, tracked_companies.CreateTrackedCompanyParams{
        Name:        input.Name,
        Domain:      input.Domain,
        Type:        input.Type,
        Interests:   input.Interests,
        CustomerUid: customerUID.UUID,
    })
    if err != nil {
        return nil, err
    }
    
    return &model.TrackedCompany{
        Name:        createdCompany.Name,
        Domain:      createdCompany.Domain,
        Type:        createdCompany.Type,
        Interests:   createdCompany.Interests,
        CustomerUID: customerUID.UUID.String(),
		TrackedCompanyUID: createdCompany.TrackedCompanyUid.String(),
    }, nil
}

func (s *TrackedCompanyService) GetAllTrackedCompanies(ctx context.Context) ([]*model.TrackedCompany, error) {
	
    customerUID, err := middleware.GetCustomerUIDFromContext(ctx)
    if err != nil {
        return nil, err
    }
    companies, err := s.store.TrackedCompanies.GetAllTrackedCompanies(ctx, customerUID.UUID)
	if err != nil {
		return nil, err
	}

	var trackedCompanies []*model.TrackedCompany
	for _, company := range companies {
		trackedCompanies = append(trackedCompanies, &model.TrackedCompany{
			Name:        company.Name,
			Domain:      company.Domain,
			Type:        company.Type,
			Interests:   company.Interests,
			CustomerUID: company.CustomerUid.String(),
			IsActive:    company.Isactive,
			TrackedCompanyUID: company.TrackedCompanyUid.String(),
		})
	}

	return trackedCompanies, nil
}

func (s *TrackedCompanyService) UpdateTrackedCompany(ctx context.Context, input model.UpdateTrackedCompanyInput) (*model.TrackedCompany, error) {
	trackedCompanyUID, err := helpers.StringToUUID(input.TrackedCompanyUID)
	if err != nil {
		return nil, err
	}

	// Call repository to update the product
	updatedCompany, err := s.store.TrackedCompanies.UpdateTrackedCompany(ctx, tracked_companies.UpdateTrackedCompanyParams{
		TrackedCompanyUid: trackedCompanyUID,
		Type:              helpers.PtrToString(input.Type),
		Interests:         input.Interests,
		Isactive:          helpers.PtrToBool(input.IsActive),
	})
	if err != nil {
		return nil, err
	}

	return &model.TrackedCompany{
		Name:        updatedCompany.Name,
		Domain:      updatedCompany.Domain,
		Type:        updatedCompany.Type,
		Interests:   updatedCompany.Interests,
		IsActive:    updatedCompany.Isactive,
		TrackedCompanyUID: updatedCompany.TrackedCompanyUid.String(),
	}, nil
}

func (s *TrackedCompanyService) DeleteTrackedCompany(ctx context.Context, input model.DeleteTrackedCompanyInput) (bool, error) {
	trackedCompanyUID, err := helpers.StringToUUID(input.TrackedCompanyUID)
	if err != nil {
		return false, err
	}

	// Call repository to delete the product
	err = s.store.TrackedCompanies.DeleteTrackedCompany(ctx, trackedCompanyUID)
	if err != nil {
		return false, err
	}

	return true, nil
}

