package service

import (
	"context"
	"flint/graph/model"
	"flint/internal/repository"
	"fmt"
)

type DepartmentService struct {
	store *repository.Store
}

func NewDepartmentService(store *repository.Store) *DepartmentService {
	return &DepartmentService{store: store}
}

func (s *DepartmentService) GetDepartments(ctx context.Context) ([]*model.Department, error) {

	departments, err := s.store.Departments.GetAllDepartments(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get departments: %w", err)
	}

	// Convert repository models to GraphQL models
	var result []*model.Department
	for _, dept := range departments {
		result = append(result, &model.Department{
			DepartmentUID: dept.DepartmentUid.String(),
			Name:          dept.Name,
		})
	}

	return result, nil
}
