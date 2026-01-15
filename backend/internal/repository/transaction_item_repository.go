package repository

import (
	"app/internal/model"

	"gorm.io/gorm"
)

type TransactionItemRepository struct {
	db *gorm.DB
}

func NewTransactionItemRepository(db *gorm.DB) *TransactionItemRepository {
	return &TransactionItemRepository{db: db}
}

func (r *TransactionItemRepository) CreateTransactionItems(items []*model.TransactionItem) error {
	if len(items) == 0 {
		return nil
	}
	return r.db.Create(&items).Error
}

func (r *TransactionItemRepository) DeleteByTransactionID(transactionID string) error {
	return r.db.Where("transaction_id = ?", transactionID).Delete(&model.TransactionItem{}).Error
}
