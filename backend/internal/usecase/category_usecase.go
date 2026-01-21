package usecase

import (
	"app/internal/config"
	"app/internal/contract"
	"app/internal/middleware"
	"app/internal/model"
	"app/internal/repository"
	"app/pkg/logger"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/jinzhu/copier"
	"go.uber.org/zap"
)

type CategoryUsecase struct {
	categoryRepo *repository.CategoryRepository
	businessRepo *repository.BusinessRepository
}

func NewCategoryUsecase(categoryRepo *repository.CategoryRepository, businessRepo *repository.BusinessRepository) *CategoryUsecase {
	return &CategoryUsecase{
		categoryRepo: categoryRepo,
		businessRepo: businessRepo,
	}
}

func (u *CategoryUsecase) CreateCategory(businessID string, req *contract.CreateCategoryReq) (*contract.CategoryRes, error) {
	// Get min sort_order and decrement by 1
	maxSortOrder, err := u.categoryRepo.GetMaxSortOrder(businessID)
	if err != nil {
		logger.Log.Error("Failed to get min sort_order", zap.Error(err), zap.String("businessID", businessID))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to create category")
	}

	category := &model.Category{
		BusinessID: businessID,
		Name:       req.Name,
		SortOrder:  maxSortOrder + 1,
	}

	if err := u.categoryRepo.CreateCategory(category); err != nil {
		logger.Log.Error("Failed to create category", zap.Error(err), zap.String("businessID", businessID))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to create category")
	}

	return u.buildCategoryRes(category), nil
}

func (u *CategoryUsecase) UpdateCategory(categoryID string, req *contract.UpdateCategoryReq) (*contract.CategoryRes, error) {
	category, err := u.categoryRepo.GetCategoryByID(categoryID)
	if err != nil {
		logger.Log.Error("Failed to get category", zap.Error(err), zap.String("categoryID", categoryID))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to get category")
	}

	if category == nil {
		return nil, fiber.NewError(fiber.StatusNotFound, "Category not found")
	}

	copier.CopyWithOption(category, req, copier.Option{
		IgnoreEmpty: true,
	})

	if err := u.categoryRepo.UpdateCategory(category); err != nil {
		logger.Log.Error("Failed to update category", zap.Error(err), zap.String("categoryID", categoryID))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to update category")
	}

	return u.buildCategoryRes(category), nil
}

func (u *CategoryUsecase) GetCategoryByID(categoryID string) (*contract.CategoryRes, error) {
	category, err := u.categoryRepo.GetCategoryByID(categoryID)
	if err != nil {
		logger.Log.Error("Failed to get category", zap.Error(err), zap.String("categoryID", categoryID))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to get category")
	}

	if category == nil {
		return nil, fiber.NewError(fiber.StatusNotFound, "Category not found")
	}

	return u.buildCategoryRes(category), nil
}

func (u *CategoryUsecase) ListCategories(businessID string, page, pageSize int) ([]contract.CategoryRes, int64, error) {
	categories, total, err := u.categoryRepo.ListCategories(businessID, page, pageSize)
	if err != nil {
		logger.Log.Error("Failed to list categories", zap.Error(err), zap.String("businessID", businessID))
		return nil, 0, fiber.NewError(fiber.StatusInternalServerError, "Failed to list categories")
	}

	categoryResList := make([]contract.CategoryRes, 0, len(categories))
	for _, category := range categories {
		categoryResList = append(categoryResList, *u.buildCategoryRes(category))
	}

	return categoryResList, total, nil
}

func (u *CategoryUsecase) DeleteCategory(categoryID string) error {
	if err := u.categoryRepo.DeleteCategory(categoryID); err != nil {
		logger.Log.Error("Failed to delete category", zap.Error(err), zap.String("categoryID", categoryID))
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to delete category")
	}

	return nil
}

func (u *CategoryUsecase) SortCategories(businessID string, req *contract.SortCategoriesReq) error {
	// Prepare updates for repository
	// Use the index in the array as the sort order
	updates := make([]struct {
		CategoryID string
		SortOrder  int
	}, len(req.CategoryIDs))

	for i, categoryID := range req.CategoryIDs {
		updates[i].CategoryID = categoryID
		updates[i].SortOrder = i
	}

	if err := u.categoryRepo.SortCategories(businessID, updates); err != nil {
		logger.Log.Error("Failed to sort categories", zap.Error(err), zap.String("businessID", businessID))
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to sort categories")
	}

	return nil
}

// Helper methods
func (u *CategoryUsecase) buildCategoryRes(category *model.Category) *contract.CategoryRes {
	return &contract.CategoryRes{
		ID:         category.ID,
		BusinessID: category.BusinessID,
		Name:       category.Name,
		SortOrder:  category.SortOrder,
		CreatedAt:  category.CreatedAt.Format(time.RFC3339),
		UpdatedAt:  category.UpdatedAt.Format(time.RFC3339),
	}
}

func (u *CategoryUsecase) IsAllowedToAccess(claims middleware.Claims, allowedPermissions []config.Permission, categoryID *string) error {
	allowed, permission := config.DoesRoleAllowedToAccess(claims.Role, allowedPermissions)

	if !allowed || permission == nil {
		return fiber.NewError(fiber.StatusForbidden, "You don't have permission to perform this action")
	}

	scope := permission.Scope()

	if scope == config.PERMISSION_SCOPE_ORG {
		if claims.BusinessID == nil {
			return fiber.NewError(fiber.StatusNotFound, "Need businessID to access category")
		}

		if categoryID != nil {
			category, err := u.categoryRepo.GetCategoryByIDAndBusinessID(*categoryID, *claims.BusinessID)
			if err != nil {
				logger.Log.Error("Failed to get category", zap.Error(err), zap.String("categoryID", *categoryID))
				return fiber.NewError(fiber.StatusInternalServerError, "Failed to get category")
			}

			if category == nil {
				logger.Log.Warn("Category not found", zap.String("categoryID", *categoryID))
				return fiber.NewError(fiber.StatusNotFound, "You don't have permission to perform this action")
			}
		}
	}

	return nil
}
