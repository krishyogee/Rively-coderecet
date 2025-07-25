package service

import (
	"context"
	"flint/graph/model"
	"flint/internal/middleware"
	"flint/internal/repository"
	"flint/internal/utils/helpers"
	"fmt"
)

type CompanyUpdateService struct {
	store *repository.Store
}

func NewCompanyUpdateService(store *repository.Store) *CompanyUpdateService {
	return &CompanyUpdateService{store: store}
}

func (s *CompanyUpdateService) GetAllCompanyUpdates(ctx context.Context) ([]*model.CompanyUpdate, error) {

	customerUID, err := middleware.GetCustomerUIDFromContext(ctx)
	if err != nil {
		return nil, err
	}

	company_updates, err := s.store.CompanyUpdates.GetAllCompanyUpdates(ctx, customerUID.UUID)
	if err != nil {
		return nil, fmt.Errorf("failed to get company updates: %w", err)
	}

	var companyUpdates []*model.CompanyUpdate
	for _, company := range company_updates {
		companyUpdates = append(companyUpdates, &model.CompanyUpdate{
			CompanyUpdateUID:  company.CompanyUpdateUid.String(),
			Title:             company.Title,
			Description:       company.Description,
			UpdateCategory:    company.UpdateCategory,
			UpdateType:        company.UpdateType,
			SourceType:        company.SourceType,
			SourceURL:         company.SourceUrl,
			PostedAt:          helpers.NullTimeToString(company.PostedAt, "2006-01-02T15:04:05Z"),
			CreatedAt:         helpers.NullTimeToString(company.CreatedAt.Time, "2006-01-02T15:04:05Z"),
			ActionPoint:       helpers.NullStringToPtr(company.ActionPoint),
			TrackedCompanyUID: company.TrackedCompanyUid.String(),
			Domain:            company.Domain,
		})
	}
	return companyUpdates, nil
}
