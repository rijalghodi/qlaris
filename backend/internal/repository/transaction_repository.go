package repository

import (
	"app/internal/model"

	"gorm.io/gorm"
)

type TransactionRepository struct {
	db *gorm.DB
}

func NewTransactionRepository(db *gorm.DB) *TransactionRepository {
	return &TransactionRepository{db: db}
}

func (r *TransactionRepository) CreateTransaction(tx *model.Transaction) error {
	return r.db.Create(tx).Error
}

func (r *TransactionRepository) GetTransactionByID(id string) (*model.Transaction, error) {
	var transaction model.Transaction
	err := r.db.Where("id = ?", id).First(&transaction).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &transaction, nil
}

func (r *TransactionRepository) GetTransactionWithItems(id string) (*model.Transaction, error) {
	var transaction model.Transaction
	err := r.db.Where("id = ?", id).Preload("Items").First(&transaction).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &transaction, nil
}

func (r *TransactionRepository) GetTransactionByIDAndBusinessID(id, businessID string) (*model.Transaction, error) {
	var transaction model.Transaction
	err := r.db.Where("id = ? AND business_id = ?", id, businessID).Preload("Items").First(&transaction).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &transaction, nil
}

func (r *TransactionRepository) UpdateTransaction(tx *model.Transaction) error {
	return r.db.Save(tx).Error
}

func (r *TransactionRepository) UpdateTransactionStatus(id, status string) error {
	return r.db.Model(&model.Transaction{}).
		Where("id = ?", id).
		Update("status", status).Error
}

func (r *TransactionRepository) ListTransactionsByBusinessID(businessID string, page, pageSize int) ([]*model.Transaction, int64, error) {
	var transactions []*model.Transaction
	var total int64

	offset := (page - 1) * pageSize

	// Get total count
	if err := r.db.Model(&model.Transaction{}).Where("business_id = ?", businessID).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get paginated results with items preloaded
	err := r.db.Where("business_id = ?", businessID).
		Preload("Items").
		Order("created_at DESC").
		Limit(pageSize).
		Offset(offset).
		Find(&transactions).Error

	if err != nil {
		return nil, 0, err
	}

	return transactions, total, nil
}
