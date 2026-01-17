package handler

import (
	"app/internal/contract"
	"app/internal/middleware"
	"app/internal/usecase"
	"app/pkg/logger"
	"app/pkg/util"

	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type ProductHandler struct {
	productUsecase *usecase.ProductUsecase
}

func NewProductHandler(productUsecase *usecase.ProductUsecase) *ProductHandler {
	return &ProductHandler{
		productUsecase: productUsecase,
	}
}

func (h *ProductHandler) RegisterRoutes(app *fiber.App, db *gorm.DB) {
	productGroup := app.Group("/products", middleware.AuthGuard(db))
	productGroup.Post("/", h.CreateProduct)
	productGroup.Put("/:id", h.UpdateProduct)
	productGroup.Get("/:id", h.GetProduct)
	productGroup.Get("/", h.ListProducts)
	productGroup.Delete("/:id", h.DeleteProduct)
	productGroup.Post("/:id/status", h.ToggleProductStatus)
}

// @Tags Products
// @Summary Create product
// @Description Create a new product for the authenticated user's business
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body contract.CreateProductReq true "Create product request"
// @Success 201 {object} util.BaseResponse{data=contract.ProductRes}
// @Failure 400 {object} util.BaseResponse
// @Failure 401 {object} util.BaseResponse
// @Failure 500 {object} util.BaseResponse
// @Router /products [post]
func (h *ProductHandler) CreateProduct(c *fiber.Ctx) error {
	var req contract.CreateProductReq
	if err := c.BodyParser(&req); err != nil {
		logger.Log.Warn("Failed to parse request body", zap.Error(err))
		return err
	}

	if err := util.ValidateStruct(&req); err != nil {
		logger.Log.Warn("Validation error", zap.Error(err))
		return err
	}

	claims := middleware.GetAuthClaims(c)
	product, err := h.productUsecase.CreateProduct(claims.BusinessID, &req)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusCreated).JSON(util.ToSuccessResponse(product))
}

// @Tags Products
// @Summary Update product
// @Description Update an existing product
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Product ID"
// @Param request body contract.UpdateProductReq true "Update product request"
// @Success 200 {object} util.BaseResponse{data=contract.ProductRes}
// @Failure 400 {object} util.BaseResponse
// @Failure 401 {object} util.BaseResponse
// @Failure 404 {object} util.BaseResponse
// @Failure 500 {object} util.BaseResponse
// @Router /products/{id} [put]
func (h *ProductHandler) UpdateProduct(c *fiber.Ctx) error {
	productID := c.Params("id")
	if productID == "" {
		return fiber.NewError(fiber.StatusBadRequest, "Product ID is required")
	}

	var req contract.UpdateProductReq
	if err := c.BodyParser(&req); err != nil {
		logger.Log.Warn("Failed to parse request body", zap.Error(err))
		return err
	}

	if err := util.ValidateStruct(&req); err != nil {
		logger.Log.Warn("Validation error", zap.Error(err))
		return err
	}

	claims := middleware.GetAuthClaims(c)
	if err := h.productUsecase.IsAllowedToAccessProduct(claims.ID, productID); err != nil {
		return err
	}
	product, err := h.productUsecase.UpdateProduct(productID, &req)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(util.ToSuccessResponse(product))
}

// @Tags Products
// @Summary Get product
// @Description Get product details by ID
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Product ID"
// @Success 200 {object} util.BaseResponse{data=contract.ProductRes}
// @Failure 401 {object} util.BaseResponse
// @Failure 404 {object} util.BaseResponse
// @Failure 500 {object} util.BaseResponse
// @Router /products/{id} [get]
func (h *ProductHandler) GetProduct(c *fiber.Ctx) error {
	productID := c.Params("id")
	if productID == "" {
		return fiber.NewError(fiber.StatusBadRequest, "Product ID is required")
	}

	claims := middleware.GetAuthClaims(c)

	if err := h.productUsecase.IsAllowedToAccessProduct(claims.ID, productID); err != nil {
		return err
	}

	product, err := h.productUsecase.GetProductByID(productID)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(util.ToSuccessResponse(product))
}

// @Tags Products
// @Summary List products
// @Description List all active products for the authenticated user's business with pagination
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param page query int false "Page number (default: 1)"
// @Param pageSize query int false "Page size (default: 10, max: 100)"
// @Param search query string false "Search query"
// @Success 200 {object} util.PaginatedResponse{data=util.PaginatedData{items=[]contract.ProductRes}}
// @Failure 401 {object} util.BaseResponse
// @Failure 500 {object} util.BaseResponse
// @Router /products [get]
func (h *ProductHandler) ListProducts(c *fiber.Ctx) error {
	claims := middleware.GetAuthClaims(c)

	if claims.BusinessID == "" {
		return fiber.NewError(fiber.StatusUnauthorized, "Finish onboarding first")
	}

	queries, err := util.ParsePaginationQueries(c)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	products, total, err := h.productUsecase.ListProducts(claims.BusinessID, queries.Page, queries.PageSize)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(util.ToPaginatedResponse(products, queries.Page, queries.PageSize, total))
}

// @Tags Products
// @Summary Delete product
// @Description Permanently delete a product from the database
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Product ID"
// @Success 200 {object} util.BaseResponse
// @Failure 401 {object} util.BaseResponse
// @Failure 404 {object} util.BaseResponse
// @Failure 500 {object} util.BaseResponse
// @Router /products/{id} [delete]
func (h *ProductHandler) DeleteProduct(c *fiber.Ctx) error {
	productID := c.Params("id")
	if productID == "" {
		return fiber.NewError(fiber.StatusBadRequest, "Product ID is required")
	}

	claims := middleware.GetAuthClaims(c)

	if err := h.productUsecase.IsAllowedToAccessProduct(claims.ID, productID); err != nil {
		return err
	}

	if err := h.productUsecase.DeleteProduct(claims.ID, productID); err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(util.ToSuccessResponse(nil))
}

// @Tags Products
// @Summary Toggle product status
// @Description Toggle the status of a product (sets is_active to true or false)
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Product ID"
// @Param request body contract.ToggleProductStatusReq true "Toggle product status request"
// @Success 200 {object} util.BaseResponse
// @Failure 401 {object} util.BaseResponse
// @Failure 404 {object} util.BaseResponse
// @Failure 500 {object} util.BaseResponse
// @Router /products/{id}/status [post]
func (h *ProductHandler) ToggleProductStatus(c *fiber.Ctx) error {
	productID := c.Params("id")
	if productID == "" {
		return fiber.NewError(fiber.StatusBadRequest, "Product ID is required")
	}

	var req contract.ToggleProductStatusReq
	if err := c.BodyParser(&req); err != nil {
		logger.Log.Warn("Failed to parse request body", zap.Error(err))
		return err
	}

	if err := util.ValidateStruct(&req); err != nil {
		logger.Log.Warn("Validation error", zap.Error(err))
		return err
	}

	claims := middleware.GetAuthClaims(c)
	if err := h.productUsecase.ToggleProductStatus(claims.ID, productID, req.IsActive); err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(util.ToSuccessResponse(nil))
}
