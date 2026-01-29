package handler

import (
	"app/internal/config"
	"app/internal/contract"
	"app/internal/middleware"
	"app/internal/usecase"
	"app/pkg/logger"
	"app/pkg/util"

	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type CategoryHandler struct {
	categoryUsecase *usecase.CategoryUsecase
}

func NewCategoryHandler(categoryUsecase *usecase.CategoryUsecase) *CategoryHandler {
	return &CategoryHandler{
		categoryUsecase: categoryUsecase,
	}
}

func (h *CategoryHandler) RegisterRoutes(app *fiber.App, db *gorm.DB) {
	categoryGroup := app.Group("/categories", middleware.AuthGuard(db))
	categoryGroup.Post("/", h.CreateCategory)
	categoryGroup.Patch("/:id", h.UpdateCategory)
	categoryGroup.Get("/:id", h.GetCategory)
	categoryGroup.Get("/", h.ListCategories)
	categoryGroup.Delete("/:id", h.DeleteCategory)
	categoryGroup.Post("/sort", h.SortCategories)
}

// @Tags Categories
// @Summary Create category
// @Description Create a new category for the authenticated user's business with auto-incremented sort_order
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body contract.CreateCategoryReq true "Create category request"
// @Success 201 {object} util.BaseResponse{data=contract.CategoryRes}
// @Failure 400 {object} util.BaseResponse
// @Failure 401 {object} util.BaseResponse
// @Failure 500 {object} util.BaseResponse
// @Router /categories [post]
func (h *CategoryHandler) CreateCategory(c *fiber.Ctx) error {
	var req contract.CreateCategoryReq
	if err := c.BodyParser(&req); err != nil {
		logger.Log.Warn("Failed to parse request body", zap.Error(err))
		return err
	}

	if err := util.ValidateStruct(&req); err != nil {
		logger.Log.Warn("Validation error", zap.Error(err))
		return err
	}

	claims := middleware.GetAuthClaims(c)

	if err := h.categoryUsecase.IsAllowedToAccess(claims, []config.Permission{config.CREATE_PRODUCT_ANY, config.CREATE_PRODUCT_ORG}, nil); err != nil {
		return err
	}

	category, err := h.categoryUsecase.CreateCategory(claims.BusinessID, &req)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusCreated).JSON(util.ToSuccessResponse(category))
}

// @Tags Categories
// @Summary Update category
// @Description Update an existing category
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Category ID"
// @Param request body contract.UpdateCategoryReq true "Update category request"
// @Success 200 {object} util.BaseResponse{data=contract.CategoryRes}
// @Failure 400 {object} util.BaseResponse
// @Failure 401 {object} util.BaseResponse
// @Failure 404 {object} util.BaseResponse
// @Failure 500 {object} util.BaseResponse
// @Router /categories/{id} [patch]
func (h *CategoryHandler) UpdateCategory(c *fiber.Ctx) error {
	categoryID := c.Params("id")
	if categoryID == "" {
		return fiber.NewError(fiber.StatusBadRequest, "Category ID is required")
	}

	var req contract.UpdateCategoryReq
	if err := c.BodyParser(&req); err != nil {
		logger.Log.Warn("Failed to parse request body", zap.Error(err))
		return err
	}

	if err := util.ValidateStruct(&req); err != nil {
		logger.Log.Warn("Validation error", zap.Error(err))
		return err
	}

	claims := middleware.GetAuthClaims(c)
	if err := h.categoryUsecase.IsAllowedToAccess(claims, []config.Permission{config.UPDATE_PRODUCT_ANY, config.UPDATE_PRODUCT_ORG}, &categoryID); err != nil {
		return err
	}

	category, err := h.categoryUsecase.UpdateCategory(categoryID, &req)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(util.ToSuccessResponse(category))
}

// @Tags Categories
// @Summary Get category
// @Description Get category details by ID
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Category ID"
// @Success 200 {object} util.BaseResponse{data=contract.CategoryRes}
// @Failure 401 {object} util.BaseResponse
// @Failure 404 {object} util.BaseResponse
// @Failure 500 {object} util.BaseResponse
// @Router /categories/{id} [get]
func (h *CategoryHandler) GetCategory(c *fiber.Ctx) error {
	categoryID := c.Params("id")
	if categoryID == "" {
		return fiber.NewError(fiber.StatusBadRequest, "Category ID is required")
	}

	claims := middleware.GetAuthClaims(c)

	if err := h.categoryUsecase.IsAllowedToAccess(claims, []config.Permission{config.READ_PRODUCT_ANY, config.READ_PRODUCT_ORG}, &categoryID); err != nil {
		return err
	}

	category, err := h.categoryUsecase.GetCategoryByID(categoryID)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(util.ToSuccessResponse(category))
}

// @Tags Categories
// @Summary List categories
// @Description List all categories for the authenticated user's business with pagination, ordered by sort_order
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param page query int false "Page number (default: 1)"
// @Param pageSize query int false "Page size (default: 10, max: 100)"
// @Success 200 {object} util.PaginatedResponse{data=[]contract.CategoryRes}
// @Failure 401 {object} util.BaseResponse
// @Failure 500 {object} util.BaseResponse
// @Router /categories [get]
func (h *CategoryHandler) ListCategories(c *fiber.Ctx) error {
	claims := middleware.GetAuthClaims(c)

	queries, err := util.ParsePaginationQueries(c)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	if err := h.categoryUsecase.IsAllowedToAccess(claims, []config.Permission{config.READ_PRODUCT_ANY, config.READ_PRODUCT_ORG}, nil); err != nil {
		return err
	}

	categories, total, err := h.categoryUsecase.ListCategories(claims.BusinessID, queries.Page, queries.PageSize)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(util.ToPaginatedResponse(categories, queries.Page, queries.PageSize, total))
}

// @Tags Categories
// @Summary Delete category
// @Description Permanently delete a category from the database
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Category ID"
// @Success 200 {object} util.BaseResponse
// @Failure 401 {object} util.BaseResponse
// @Failure 404 {object} util.BaseResponse
// @Failure 500 {object} util.BaseResponse
// @Router /categories/{id} [delete]
func (h *CategoryHandler) DeleteCategory(c *fiber.Ctx) error {
	categoryID := c.Params("id")
	if categoryID == "" {
		return fiber.NewError(fiber.StatusBadRequest, "Category ID is required")
	}

	claims := middleware.GetAuthClaims(c)
	if err := h.categoryUsecase.IsAllowedToAccess(claims, []config.Permission{config.DELETE_PRODUCT_ANY, config.DELETE_PRODUCT_ORG}, &categoryID); err != nil {
		return err
	}

	if err := h.categoryUsecase.DeleteCategory(categoryID); err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(util.ToSuccessResponse(nil))
}

// @Tags Categories
// @Summary Sort categories
// @Description Update the sort order of multiple categories in a single atomic operation
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body contract.SortCategoriesReq true "Sort categories request"
// @Success 200 {object} util.BaseResponse
// @Failure 400 {object} util.BaseResponse
// @Failure 401 {object} util.BaseResponse
// @Failure 500 {object} util.BaseResponse
// @Router /categories/sort [post]
func (h *CategoryHandler) SortCategories(c *fiber.Ctx) error {
	var req contract.SortCategoriesReq
	if err := c.BodyParser(&req); err != nil {
		logger.Log.Warn("Failed to parse request body", zap.Error(err))
		return err
	}

	if err := util.ValidateStruct(&req); err != nil {
		logger.Log.Warn("Validation error", zap.Error(err))
		return err
	}

	claims := middleware.GetAuthClaims(c)

	if err := h.categoryUsecase.IsAllowedToAccess(claims, []config.Permission{config.UPDATE_PRODUCT_ANY, config.UPDATE_PRODUCT_ORG}, nil); err != nil {
		return err
	}

	if err := h.categoryUsecase.SortCategories(claims.BusinessID, &req); err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(util.ToSuccessResponse(nil))
}
