package usecase

import (
	"app/internal/contract"
	"app/internal/model"
	"app/internal/repository"
	"app/pkg/logger"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/jinzhu/copier"
	"go.uber.org/zap"
)

type ProductUsecase struct {
	productRepo  *repository.ProductRepository
	businessRepo *repository.BusinessRepository
}

func NewProductUsecase(productRepo *repository.ProductRepository, businessRepo *repository.BusinessRepository) *ProductUsecase {
	return &ProductUsecase{
		productRepo:  productRepo,
		businessRepo: businessRepo,
	}
}

func (u *ProductUsecase) CreateProduct(businessID string, req *contract.CreateProductReq) (*contract.ProductRes, error) {
	product := &model.Product{
		BusinessID: businessID,
		Name:       req.Name,
		Price:      req.Price,
		Image:      req.Image,
		StockQty:   req.StockQty,
		IsActive:   true,
	}

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

	// Apply partial updates
	// if req.Name != nil {
	// 	product.Name = *req.Name
	// }
	// if req.Price != nil {
	// 	product.Price = *req.Price
	// }
	// if req.Image != nil {
	// 	product.Image = req.Image
	// }
	// if req.StockQty != nil {
	// 	product.StockQty = *req.StockQty
	// }

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

func (u *ProductUsecase) DeleteProduct(userID, productID string) error {
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
	return &contract.ProductRes{
		ID:         product.ID,
		BusinessID: product.BusinessID,
		Name:       product.Name,
		Price:      product.Price,
		Image:      product.Image,
		StockQty:   product.StockQty,
		IsActive:   product.IsActive,
		CreatedAt:  product.CreatedAt.Format(time.RFC3339),
		UpdatedAt:  product.UpdatedAt.Format(time.RFC3339),
	}
}

func (u *ProductUsecase) IsAllowedToAccessProduct(userID string, productID string) error {
	business, err := u.businessRepo.GetBusinessByUserID(userID)
	if err != nil {
		logger.Log.Error("Failed to get user business", zap.Error(err), zap.String("userID", userID))
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to get user business")
	}

	if business == nil {
		logger.Log.Warn("Business not found for user", zap.String("userID", userID))
		return fiber.NewError(fiber.StatusNotFound, "Business not found. Please create a business first.")
	}

	product, err := u.productRepo.GetProductByIDAndBusinessID(productID, business.ID)
	if err != nil {
		logger.Log.Error("Failed to get product", zap.Error(err), zap.String("productID", productID))
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to get product")
	}

	if product == nil {
		logger.Log.Warn("Product not found", zap.String("productID", productID))
		return fiber.NewError(fiber.StatusNotFound, "You don't have permission to modify this product")
	}

	return nil
}
