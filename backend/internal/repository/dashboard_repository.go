package repository

import (
	"app/internal/model"
	"time"

	"gorm.io/gorm"
)

type DashboardRepository struct {
	db *gorm.DB
}

func NewDashboardRepository(db *gorm.DB) *DashboardRepository {
	return &DashboardRepository{db: db}
}

// PeriodStats represents aggregated stats for a time period
type PeriodStats struct {
	Sales        float64
	Transactions int64
	Profit       float64
}

// GetPeriodStats gets aggregated stats for a time period
func (r *DashboardRepository) GetPeriodStats(businessID string, start, end time.Time) (*PeriodStats, error) {
	var result struct {
		TotalSales  float64
		TotalCount  int64
		TotalProfit float64
	}

	// Subquery to get transaction items with their costs
	subQuery := r.db.Model(&model.TransactionItem{}).
		Select("transaction_items.transaction_id, transaction_items.subtotal, "+
			"COALESCE(products.cost, 0) * transaction_items.quantity as item_cost").
		Joins("LEFT JOIN products ON products.id = transaction_items.product_id").
		Where("products.business_id = ?", businessID)

	// Main query to aggregate transaction data
	err := r.db.Model(&model.Transaction{}).
		Select("COALESCE(SUM(transactions.total_amount), 0) as total_sales, "+
			"COUNT(*) as total_count, "+
			"COALESCE(SUM(transactions.total_amount - items.total_cost), 0) as total_profit").
		Joins("LEFT JOIN (SELECT transaction_id, SUM(item_cost) as total_cost FROM (?) as costs GROUP BY transaction_id) as items ON items.transaction_id = transactions.id", subQuery).
		Where("transactions.business_id = ?", businessID).
		Where("transactions.status = ?", "paid").
		Where("transactions.created_at >= ? AND transactions.created_at < ?", start, end).
		Scan(&result).Error

	if err != nil {
		return nil, err
	}

	return &PeriodStats{
		Sales:        result.TotalSales,
		Transactions: result.TotalCount,
		Profit:       result.TotalProfit,
	}, nil
}

// GetLatestTransactions retrieves the latest N transactions
func (r *DashboardRepository) GetLatestTransactions(businessID string, limit int) ([]model.Transaction, error) {
	var transactions []model.Transaction

	err := r.db.Where("business_id = ?", businessID).
		Preload("Items").
		Preload("Creator").
		Order("created_at DESC").
		Limit(limit).
		Find(&transactions).Error

	if err != nil {
		return nil, err
	}

	return transactions, nil
}

// ProductSales represents product with sales count
type ProductSales struct {
	Product      model.Product
	QuantitySold int
}

// GetTopProducts retrieves top N products by quantity sold
func (r *DashboardRepository) GetTopProducts(businessID string, limit int) ([]ProductSales, error) {
	var results []struct {
		ProductID    string
		QuantitySold int
	}

	// Get top products by quantity sold
	err := r.db.Model(&model.TransactionItem{}).
		Select("transaction_items.product_id, SUM(transaction_items.quantity) as quantity_sold").
		Joins("JOIN transactions ON transactions.id = transaction_items.transaction_id").
		Where("transactions.business_id = ?", businessID).
		Where("transactions.status = ?", "paid").
		Where("transaction_items.product_id IS NOT NULL").
		Group("transaction_items.product_id").
		Order("quantity_sold DESC").
		Limit(limit).
		Scan(&results).Error

	if err != nil {
		return nil, err
	}

	// Fetch full product details
	productSales := make([]ProductSales, 0, len(results))
	for _, result := range results {
		var product model.Product
		if err := r.db.Where("id = ?", result.ProductID).
			Preload("Category").
			First(&product).Error; err != nil {
			continue
		}

		productSales = append(productSales, ProductSales{
			Product:      product,
			QuantitySold: result.QuantitySold,
		})
	}

	return productSales, nil
}
