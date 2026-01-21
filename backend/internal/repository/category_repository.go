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

func (r *CategoryRepository) GetMinSortOrder(businessID string) (int, error) {
	var result struct {
		MinSortOrder *int
	}
	err := r.db.Model(&model.Category{}).
		Select("MIN(sort_order) as min_sort_order").
		Where("business_id = ?", businessID).
		Scan(&result).Error
	if err != nil {
		return 0, err
	}
	if result.MinSortOrder == nil {
		return 0, nil
	}
	return *result.MinSortOrder, nil
}

func (r *CategoryRepository) SortCategories(
	businessID string,
	updates []struct {
		CategoryID string
		SortOrder  int
	},
) error {
	if len(updates) == 0 {
		return nil
	}

	return r.db.Transaction(func(tx *gorm.DB) error {
		ids := make([]string, 0, len(updates))
		args := make([]any, 0, len(updates)*2)

		for _, u := range updates {
			ids = append(ids, u.CategoryID)
			args = append(args, u.CategoryID, u.SortOrder)
		}

		// 1. Lock rows
		if err := tx.Exec(`
			SELECT 1 FROM categories
			WHERE business_id = ? AND id IN ?
			FOR UPDATE
		`, businessID, ids).Error; err != nil {
			return err
		}

		// 2. Move to safe temp range
		if err := tx.Exec(`
			UPDATE categories
			SET sort_order = sort_order - 1000000
			WHERE business_id = ? AND id IN ?
		`, businessID, ids).Error; err != nil {
			return err
		}

		// 3. Final update (single statement)
		caseSQL := "CASE id"
		for range updates {
			caseSQL += " WHEN ? THEN ?::INTEGER"
		}
		caseSQL += " END"

		args = append(args, businessID, ids)

		return tx.Exec(`
			UPDATE categories
			SET sort_order = `+caseSQL+`
			WHERE business_id = ? AND id IN ?
		`, args...).Error
	})
}
