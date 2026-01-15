package repository

import (
	"app/internal/model"

	"gorm.io/gorm"
)

type BusinessRepository struct {
	db *gorm.DB
}

func NewBusinessRepository(db *gorm.DB) *BusinessRepository {
	return &BusinessRepository{db: db}
}

func (r *BusinessRepository) GetBusinessByUserID(userID string) (*model.Business, error) {
	var business model.Business
	err := r.db.Where("owner_id = ?", userID).First(&business).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &business, nil
}

func (r *BusinessRepository) CreateBusiness(business *model.Business) error {
	return r.db.Create(business).Error
}
