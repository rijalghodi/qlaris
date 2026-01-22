package usecase

import (
	"app/internal/contract"
	"app/internal/model"
	"app/internal/repository"
	"app/pkg/logger"
	"app/pkg/storage"
	"app/pkg/util"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
)

type DashboardUsecase struct {
	dashboardRepo   *repository.DashboardRepository
	transactionRepo *repository.TransactionRepository
	productRepo     *repository.ProductRepository
	storage         *storage.R2Storage
}

func NewDashboardUsecase(
	dashboardRepo *repository.DashboardRepository,
	transactionRepo *repository.TransactionRepository,
	productRepo *repository.ProductRepository,
	storage *storage.R2Storage,
) *DashboardUsecase {
	return &DashboardUsecase{
		dashboardRepo:   dashboardRepo,
		transactionRepo: transactionRepo,
		productRepo:     productRepo,
		storage:         storage,
	}
}

// GetDashboardSummary returns comprehensive dashboard statistics
func (u *DashboardUsecase) GetDashboardSummary(businessID string) (*contract.DashboardSummaryRes, error) {
	now := time.Now()

	// Define time periods
	todayStart := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	todayEnd := todayStart.Add(24 * time.Hour)
	yesterdayStart := todayStart.Add(-24 * time.Hour)
	yesterdayEnd := todayStart

	// Get start of this week (Monday)
	weekday := int(now.Weekday())
	if weekday == 0 {
		weekday = 7 // Sunday
	}
	thisWeekStart := todayStart.Add(-time.Duration(weekday-1) * 24 * time.Hour)
	thisWeekEnd := thisWeekStart.Add(7 * 24 * time.Hour)
	lastWeekStart := thisWeekStart.Add(-7 * 24 * time.Hour)
	lastWeekEnd := thisWeekStart

	// Fetch all stats in parallel
	todayStats, err := u.dashboardRepo.GetPeriodStats(businessID, todayStart, todayEnd)
	if err != nil {
		logger.Log.Error("Failed to get today stats", zap.Error(err))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to get dashboard stats")
	}

	yesterdayStats, err := u.dashboardRepo.GetPeriodStats(businessID, yesterdayStart, yesterdayEnd)
	if err != nil {
		logger.Log.Error("Failed to get yesterday stats", zap.Error(err))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to get dashboard stats")
	}

	thisWeekStats, err := u.dashboardRepo.GetPeriodStats(businessID, thisWeekStart, thisWeekEnd)
	if err != nil {
		logger.Log.Error("Failed to get this week stats", zap.Error(err))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to get dashboard stats")
	}

	lastWeekStats, err := u.dashboardRepo.GetPeriodStats(businessID, lastWeekStart, lastWeekEnd)
	if err != nil {
		logger.Log.Error("Failed to get last week stats", zap.Error(err))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to get dashboard stats")
	}

	// Get latest transactions
	latestTransactions, err := u.dashboardRepo.GetLatestTransactions(businessID, 5)
	if err != nil {
		logger.Log.Error("Failed to get latest transactions", zap.Error(err))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to get latest transactions")
	}

	// Get top products
	topProducts, err := u.dashboardRepo.GetTopProducts(businessID, 5)
	if err != nil {
		logger.Log.Error("Failed to get top products", zap.Error(err))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to get top products")
	}

	// Build response
	return &contract.DashboardSummaryRes{
		Today: contract.DayStatsRes{
			Sales:        todayStats.Sales,
			Transactions: todayStats.Transactions,
			Profit:       todayStats.Profit,
			CompareYesterday: &contract.ComparisonRes{
				SalesPercent:        calculatePercentChange(yesterdayStats.Sales, todayStats.Sales),
				TransactionsPercent: calculatePercentChange(float64(yesterdayStats.Transactions), float64(todayStats.Transactions)),
				ProfitPercent:       calculatePercentChange(yesterdayStats.Profit, todayStats.Profit),
			},
		},
		ThisWeek: contract.WeekStatsRes{
			Sales:        thisWeekStats.Sales,
			Transactions: thisWeekStats.Transactions,
			Profit:       thisWeekStats.Profit,
			CompareLastWeek: &contract.ComparisonRes{
				SalesPercent:        calculatePercentChange(lastWeekStats.Sales, thisWeekStats.Sales),
				TransactionsPercent: calculatePercentChange(float64(lastWeekStats.Transactions), float64(thisWeekStats.Transactions)),
				ProfitPercent:       calculatePercentChange(lastWeekStats.Profit, thisWeekStats.Profit),
			},
		},
		LastTransactions: buildTransactionList(latestTransactions),
		TopProducts:      buildProductList(topProducts, u.storage),
	}, nil
}

// calculatePercentChange calculates percentage change between two values
func calculatePercentChange(oldValue, newValue float64) float64 {
	if oldValue == 0 {
		if newValue == 0 {
			return 0
		}
		return 100 // If old value is 0 and new value is positive, it's 100% increase
	}
	return ((newValue - oldValue) / oldValue) * 100
}

// buildTransactionList builds transaction response list
func buildTransactionList(transactions []model.Transaction) []contract.TransactionRes {
	results := make([]contract.TransactionRes, len(transactions))
	for i, transaction := range transactions {
		items := make([]contract.TransactionItemRes, len(transaction.Items))
		for j, item := range transaction.Items {
			items[j] = contract.TransactionItemRes{
				ID:          item.ID,
				ProductID:   item.ProductID,
				ProductName: item.ProductName,
				Price:       item.Price,
				Quantity:    item.Quantity,
				Subtotal:    item.Subtotal,
			}
		}

		var paidAtStr *string
		if transaction.PaidAt != nil {
			str := transaction.PaidAt.Format(time.RFC3339)
			paidAtStr = &str
		}

		results[i] = contract.TransactionRes{
			ID:             transaction.ID,
			BusinessID:     transaction.BusinessID,
			InvoiceNumber:  transaction.InvoiceNumber,
			CreatedBy:      transaction.CreatedBy,
			CreatorName:    transaction.Creator.Name,
			TotalAmount:    transaction.TotalAmount,
			ReceivedAmount: transaction.ReceivedAmount,
			ChangeAmount:   transaction.ChangeAmount,
			Status:         string(transaction.Status),
			PaidAt:         paidAtStr,
			ExpiredAt:      transaction.ExpiredAt.Format(time.RFC3339),
			CreatedAt:      transaction.CreatedAt.Format(time.RFC3339),
			Items:          items,
		}
	}
	return results
}

// buildProductList builds product response list
func buildProductList(productSales []repository.ProductSales, storage *storage.R2Storage) []contract.ProductRes {
	results := make([]contract.ProductRes, len(productSales))
	for i, ps := range productSales {
		results[i] = buildProductRes(ps.Product, ps.QuantitySold, storage)
	}
	return results
}

// buildProductRes builds a single product response
func buildProductRes(product model.Product, quantitySold int, storage *storage.R2Storage) contract.ProductRes {
	var imageRes *contract.FileRes
	if product.Image != nil && *product.Image != "" {
		URL, _ := storage.PresignGet(*product.Image, 0)
		imageRes = &contract.FileRes{
			Key: *product.Image,
			URL: URL,
		}
	}

	var categoryRes *contract.CategoryRes
	if product.Category != nil {
		categoryRes = &contract.CategoryRes{
			ID:         product.Category.ID,
			BusinessID: product.Category.BusinessID,
			Name:       product.Category.Name,
			SortOrder:  product.Category.SortOrder,
			CreatedAt:  product.Category.CreatedAt.Format(time.RFC3339),
			UpdatedAt:  product.Category.UpdatedAt.Format(time.RFC3339),
		}
	}

	return contract.ProductRes{
		ID:            product.ID,
		QuantitySold:  quantitySold,
		BusinessID:    product.BusinessID,
		Name:          product.Name,
		Price:         product.Price,
		IsActive:      product.IsActive,
		Image:         imageRes,
		CategoryID:    product.CategoryID,
		Category:      categoryRes,
		EnableStock:   product.EnableStock,
		StockQty:      product.StockQty,
		Unit:          product.Unit,
		EnableBarcode: product.EnableBarcode,
		BarcodeValue:  product.BarcodeValue,
		BarcodeType:   util.ToPointer(string(util.ToValue(product.BarcodeType))),
		Cost:          product.Cost,
		CreatedAt:     product.CreatedAt.Format(time.RFC3339),
		UpdatedAt:     product.UpdatedAt.Format(time.RFC3339),
	}
}
