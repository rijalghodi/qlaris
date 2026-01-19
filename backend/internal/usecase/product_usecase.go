package usecase

import (
	"app/internal/config"
	"app/internal/contract"
	"app/internal/model"
	"app/internal/repository"
	"app/pkg/logger"
	"slices"
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

// func (u *ProductUsecase) IsAllowedToAccessProduct(role model.USER_ROLE, businessID *string, productID *string) error {
// 	if role != model.USER_ROLE_SUPERADMIN && businessID == nil {
// 		return fiber.NewError(fiber.StatusNotFound, "Finish onboarding first")
// 	}

// 	if role != model.USER_ROLE_OWNER && productID == nil {
// 		return fiber.NewError(fiber.StatusNotFound, "Finish onboarding first")
// 	}

// 	product, err := u.productRepo.GetProductByIDAndBusinessID(productID, *businessID)
// 	if err != nil {
// 		logger.Log.Error("Failed to get product", zap.Error(err), zap.String("productID", productID))
// 		return fiber.NewError(fiber.StatusInternalServerError, "Failed to get product")
// 	}

// 	if product == nil {
// 		logger.Log.Warn("Product not found", zap.String("productID", productID))
// 		return fiber.NewError(fiber.StatusNotFound, "You don't have permission to modify this product")
// 	}

// 	return nil
// }

// type RoleAccess struct {
// 	Role     model.USER_ROLE
// 	Access   string
// 	IsInself string
// }

// type PRODUCT_RIGHT_ACCESS string

// const (
// 	CREATE_PRODUCT_OWNED PRODUCT_RIGHT_ACCESS = "create_product_owned"
// 	READ_PRODUCT_OWNED   PRODUCT_RIGHT_ACCESS = "read_product_owned"
// 	UPDATE_PRODUCT_OWNED PRODUCT_RIGHT_ACCESS = "update_product_owned"
// 	DELETE_PRODUCT_OWNED PRODUCT_RIGHT_ACCESS = "delete_product_owned"
// 	CREATE_PRODUCT       PRODUCT_RIGHT_ACCESS = "create_product"
// 	READ_PRODUCT         PRODUCT_RIGHT_ACCESS = "read_product"
// 	UPDATE_PRODUCT       PRODUCT_RIGHT_ACCESS = "update_product"
// 	DELETE_PRODUCT       PRODUCT_RIGHT_ACCESS = "delete_product"
// )

// var RoleAccessMap = map[model.USER_ROLE][]PRODUCT_RIGHT_ACCESS{
// 	model.USER_ROLE_SUPERADMIN: {CREATE_PRODUCT, READ_PRODUCT, UPDATE_PRODUCT, DELETE_PRODUCT},
// 	model.USER_ROLE_OWNER:      {CREATE_PRODUCT_OWNED, READ_PRODUCT_OWNED, UPDATE_PRODUCT_OWNED, DELETE_PRODUCT_OWNED},
// 	model.USER_ROLE_MANAGER:    {CREATE_PRODUCT, READ_PRODUCT, UPDATE_PRODUCT, DELETE_PRODUCT},
// 	model.USER_ROLE_CASHIER:    {CREATE_PRODUCT, READ_PRODUCT, UPDATE_PRODUCT, DELETE_PRODUCT},
// }

func (u *ProductUsecase) IsAllowedToAccess(role config.UserRole, allowedPermissions []config.Permission, businessID *string, productID *string) error {
	rolePermissions := config.RolePermissionMap[role]

	var permission *config.Permission
	for _, p := range rolePermissions {
		idx, found := slices.BinarySearch(allowedPermissions, p)
		if !found {
			continue
		}

		permission = &allowedPermissions[idx]
		break
	}

	if permission == nil {
		return fiber.NewError(fiber.StatusForbidden, "You don't have permission to perform this action")
	}

	scope := permission.Scope()

	if scope == config.PERMISSION_SCOPE_ORG {
		if businessID == nil {
			return fiber.NewError(fiber.StatusNotFound, "Need businessID to access product")
		}

		if productID != nil {
			product, err := u.productRepo.GetProductByIDAndBusinessID(*productID, *businessID)
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
