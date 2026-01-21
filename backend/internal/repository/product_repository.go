package repository

import (
	"app/internal/model"

	"gorm.io/gorm"
)

type ProductRepository struct {
	db *gorm.DB
}

func NewProductRepository(db *gorm.DB) *ProductRepository {
	return &ProductRepository{db: db}
}

func (r *ProductRepository) CreateProduct(product *model.Product) error {
	return r.db.Create(product).Error
}

func (r *ProductRepository) UpdateProduct(product *model.Product) error {
	return r.db.Save(product).Error
}

func (r *ProductRepository) GetProductByID(id string) (*model.Product, error) {
	var product model.Product
	err := r.db.Preload("Category").Where("id = ?", id).First(&product).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &product, nil
}

func (r *ProductRepository) GetProductByIDAndBusinessID(id string, businessID string) (*model.Product, error) {
	var product model.Product
	err := r.db.Where("id = ? AND business_id = ?", id, businessID).First(&product).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &product, nil
}

func (r *ProductRepository) ListProducts(businessID string, page, pageSize int, search string) ([]*model.Product, int64, error) {
	var products []*model.Product
	var total int64

	// Build base query
	query := r.db.Model(&model.Product{}).
		Where("business_id = ?", businessID)

	// Add search filter if search term is provided
	if search != "" {
		query = query.Where("name ILIKE ?", "%"+search+"%")
	}

	// Count total records
	err := query.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	// Calculate offset
	offset := (page - 1) * pageSize

	// Fetch paginated records
	err = query.
		Preload("Category").
		Order("created_at DESC").
		Limit(pageSize).
		Offset(offset).
		Find(&products).Error
	if err != nil {
		return nil, 0, err
	}

	return products, total, nil
}

func (r *ProductRepository) DeleteProduct(id string) error {
	return r.db.Where("id = ?", id).
		Delete(&model.Product{}).Error
}

func (r *ProductRepository) ToggleProductStatus(id string, isActive bool) error {
	return r.db.Model(&model.Product{}).
		Where("id = ?", id).
		Update("is_active", isActive).Error
}

func (r *ProductRepository) GetProductsByIDs(ids []string) ([]*model.Product, error) {
	var products []*model.Product
	err := r.db.Where("id IN ?", ids).Find(&products).Error
	if err != nil {
		return nil, err
	}
	return products, nil
}

func (r *ProductRepository) DecreaseStock(productID string, quantity int) error {
	// Using raw SQL to ensure atomic operation with stock validation
	result := r.db.Exec(
		"UPDATE products SET stock_qty = stock_qty - ?, updated_at = now() WHERE id = ? AND stock_qty >= ?",
		quantity, productID, quantity,
	)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound // No rows updated means insufficient stock
	}
	return nil
}

func (r *ProductRepository) IncreaseStock(productID string, quantity int) error {
	return r.db.Model(&model.Product{}).
		Where("id = ?", productID).
		UpdateColumn("stock_qty", gorm.Expr("stock_qty + ?", quantity)).Error
}
