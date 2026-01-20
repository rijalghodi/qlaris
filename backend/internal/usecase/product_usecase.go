package usecase

import (
	"app/internal/config"
	"app/internal/contract"
	"app/internal/middleware"
	"app/internal/model"
	"app/internal/repository"
	"app/pkg/logger"
	"app/pkg/storage"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/jinzhu/copier"
	"go.uber.org/zap"
)

type ProductUsecase struct {
	productRepo  *repository.ProductRepository
	businessRepo *repository.BusinessRepository
	storage      *storage.R2Storage
}

func NewProductUsecase(productRepo *repository.ProductRepository, businessRepo *repository.BusinessRepository, storage *storage.R2Storage) *ProductUsecase {
	return &ProductUsecase{
		productRepo:  productRepo,
		businessRepo: businessRepo,
		storage:      storage,
	}
}

func (u *ProductUsecase) CreateProduct(businessID string, req *contract.CreateProductReq) (*contract.ProductRes, error) {

	product := &model.Product{}
	copier.Copy(product, req)

	product.BusinessID = businessID
	product.IsActive = true

	if err := u.productRepo.CreateProduct(product); err != nil {
		logger.Log.Error("Failed to create product", zap.Error(err), zap.String("businessID", businessID))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to create product")
	}

	return u.buildProductRes(product), nil
}

func (u *ProductUsecase) UpdateProduct(productID string, req *contract.UpdateProductReq) (*contract.ProductRes, error) {

	product, err := u.productRepo.GetProductByID(productID)
	if err != nil {
		logger.Log.Error("Failed to get product", zap.Error(err), zap.String("productID", productID))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to get product")
	}

	if product == nil {
		return nil, fiber.NewError(fiber.StatusNotFound, "Product not found")
	}

	copier.CopyWithOption(product, req, copier.Option{
		IgnoreEmpty: true,
	})

	if err := u.productRepo.UpdateProduct(product); err != nil {
		logger.Log.Error("Failed to update product", zap.Error(err), zap.String("productID", productID))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to update product")
	}

	return u.buildProductRes(product), nil
}

func (u *ProductUsecase) GetProductByID(productID string) (*contract.ProductRes, error) {
	product, err := u.productRepo.GetProductByID(productID)
	if err != nil {
		logger.Log.Error("Failed to get product", zap.Error(err), zap.String("productID", productID))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to get product")
	}

	if product == nil {
		return nil, fiber.NewError(fiber.StatusNotFound, "Product not found")
	}

	return u.buildProductRes(product), nil
}

func (u *ProductUsecase) ListProducts(businessID string, page, pageSize int) ([]contract.ProductRes, int64, error) {
	products, total, err := u.productRepo.ListProducts(businessID, page, pageSize)
	if err != nil {
		logger.Log.Error("Failed to list products", zap.Error(err), zap.String("businessID", businessID))
		return nil, 0, fiber.NewError(fiber.StatusInternalServerError, "Failed to list products")
	}

	productResList := make([]contract.ProductRes, 0, len(products))
	for _, product := range products {
		productResList = append(productResList, *u.buildProductRes(product))
	}

	return productResList, total, nil
}

func (u *ProductUsecase) DeleteProduct(productID string) error {
	if err := u.productRepo.DeleteProduct(productID); err != nil {
		logger.Log.Error("Failed to delete product", zap.Error(err), zap.String("productID", productID))
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to delete product")
	}

	return nil
}

func (u *ProductUsecase) ToggleProductStatus(userID, productID string, isActive bool) error {
	if err := u.productRepo.ToggleProductStatus(productID, isActive); err != nil {
		logger.Log.Error("Failed to toggle product status", zap.Error(err), zap.String("productID", productID))
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to toggle product status")
	}

	return nil
}

// Helper methods
func (u *ProductUsecase) buildProductRes(product *model.Product) *contract.ProductRes {
	// image
	var imageRes *contract.FileRes
	if product.Image != nil {
		URL, _ := u.storage.PresignGet(*product.Image, 0)
		imageRes = &contract.FileRes{
			Key: *product.Image,
			URL: URL,
		}
	}

	// category
	var categoryRes *contract.CategoryRes
	if product.Category != nil {
		categoryRes = &contract.CategoryRes{
			ID:   product.Category.ID,
			Name: product.Category.Name,
		}
	}

	return &contract.ProductRes{
		ID:         product.ID,
		BusinessID: product.BusinessID,
		Name:       product.Name,
		Price:      product.Price,
		Image:      imageRes,
		CategoryID: product.CategoryID,
		Category:   categoryRes,
		StockQty:   product.StockQty,
		IsActive:   product.IsActive,
		CreatedAt:  product.CreatedAt.Format(time.RFC3339),
		UpdatedAt:  product.UpdatedAt.Format(time.RFC3339),
	}
}

func (u *ProductUsecase) IsAllowedToAccess(claims middleware.Claims, allowedPermissions []config.Permission, productID *string) error {
	allowed, permission := config.DoesRoleAllowedToAccess(claims.Role, allowedPermissions)

	if !allowed || permission == nil {
		return fiber.NewError(fiber.StatusForbidden, "You don't have permission to perform this action")
	}

	scope := permission.Scope()

	if scope == config.PERMISSION_SCOPE_ORG {
		if claims.BusinessID == nil {
			return fiber.NewError(fiber.StatusNotFound, "Need businessID to access product")
		}

		if productID != nil {
			product, err := u.productRepo.GetProductByIDAndBusinessID(*productID, *claims.BusinessID)
			if err != nil {
				logger.Log.Error("Failed to get product", zap.Error(err), zap.String("productID", *productID))
				return fiber.NewError(fiber.StatusInternalServerError, "Failed to get product")
			}

			if product == nil {
				logger.Log.Warn("Product not found", zap.String("productID", *productID))
				return fiber.NewError(fiber.StatusNotFound, "You don't have permission to perform this action")
			}
		}
	}

	return nil
}
