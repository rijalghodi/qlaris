package repository

import (
	"app/internal/model"

	"gorm.io/gorm"
)

type CategoryRepository struct {
	db *gorm.DB
}

func NewCategoryRepository(db *gorm.DB) *CategoryRepository {
	return &CategoryRepository{db: db}
}

func (r *CategoryRepository) CreateCategory(category *model.Category) error {
	return r.db.Create(category).Error
}

func (r *CategoryRepository) UpdateCategory(category *model.Category) error {
	return r.db.Save(category).Error
}

func (r *CategoryRepository) GetCategoryByID(id string) (*model.Category, error) {
	var category model.Category
	err := r.db.Where("id = ?", id).First(&category).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &category, nil
}

func (r *CategoryRepository) GetCategoryByIDAndBusinessID(id string, businessID string) (*model.Category, error) {
	var category model.Category
	err := r.db.Where("id = ? AND business_id = ?", id, businessID).First(&category).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &category, nil
}

func (r *CategoryRepository) ListCategories(businessID string, page, pageSize int) ([]*model.Category, int64, error) {
	var categories []*model.Category
	var total int64

	// Count total records
	err := r.db.Model(&model.Category{}).
		Where("business_id = ?", businessID).
		Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	// Calculate offset
	offset := (page - 1) * pageSize

	// Fetch paginated records ordered by sort_order
	err = r.db.Model(&model.Category{}).
		Where("business_id = ?", businessID).
		Order("sort_order ASC").
		Limit(pageSize).
		Offset(offset).
		Find(&categories).Error
	if err != nil {
		return nil, 0, err
	}

	return categories, total, nil
}

func (r *CategoryRepository) DeleteCategory(id string) error {
	return r.db.Where("id = ?", id).
		Delete(&model.Category{}).Error
}

func (r *CategoryRepository) GetMaxSortOrder(businessID string) (int, error) {
	var result struct {
		MaxSortOrder *int
	}
	err := r.db.Model(&model.Category{}).
		Select("MAX(sort_order) as max_sort_order").
		Where("business_id = ?", businessID).
		Scan(&result).Error
	if err != nil {
		return 0, err
	}
	if result.MaxSortOrder == nil {
		return 0, nil
	}
	return *result.MaxSortOrder, nil
}

// SortCategories updates categories' sort_order in a single transaction with atomic shifting
// It handles the reordering by temporarily setting affected categories to negative values
// then updating them to their final positions
func (r *CategoryRepository) SortCategories(businessID string, updates []struct {
	CategoryID string
	SortOrder  int
}) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Step 1: Set all affected categories to negative values temporarily
		// This prevents unique constraint violations during the update
		for i, update := range updates {
			tempValue := -(i + 1)
			err := tx.Model(&model.Category{}).
				Where("id = ? AND business_id = ?", update.CategoryID, businessID).
				Update("sort_order", tempValue).Error
			if err != nil {
				return err
			}
		}

		// Step 2: Update all categories to their final sort_order values
		for _, update := range updates {
			err := tx.Model(&model.Category{}).
				Where("id = ? AND business_id = ?", update.CategoryID, businessID).
				Update("sort_order", update.SortOrder).Error
			if err != nil {
				return err
			}
		}

		return nil
	})
}
