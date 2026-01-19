package usecase

import (
	"app/internal/contract"
	"app/internal/model"
	"app/internal/repository"
	"app/pkg/logger"
	"app/pkg/util"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type TransactionUsecase struct {
	transactionRepo     *repository.TransactionRepository
	transactionItemRepo *repository.TransactionItemRepository
	productRepo         *repository.ProductRepository
	businessRepo        *repository.BusinessRepository
	db                  *gorm.DB
}

func NewTransactionUsecase(
	transactionRepo *repository.TransactionRepository,
	transactionItemRepo *repository.TransactionItemRepository,
	productRepo *repository.ProductRepository,
	businessRepo *repository.BusinessRepository,
	db *gorm.DB,
) *TransactionUsecase {
	return &TransactionUsecase{
		transactionRepo:     transactionRepo,
		transactionItemRepo: transactionItemRepo,
		productRepo:         productRepo,
		businessRepo:        businessRepo,
		db:                  db,
	}
}

// CreateTransaction handles the checkout process
func (u *TransactionUsecase) CreateTransaction(userID, businessID string, req *contract.CreateTransactionReq) (*contract.TransactionRes, error) {
	// Start transaction
	tx := u.db.Begin()
	if tx.Error != nil {
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to start transaction")
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Get all product IDs
	productIDs := make([]string, len(req.Items))
	for i, item := range req.Items {
		productIDs[i] = item.ProductID
	}

	// Fetch all products
	products, err := u.productRepo.GetProductsByIDs(productIDs)
	if err != nil {
		tx.Rollback()
		logger.Log.Error("Failed to fetch products", zap.Error(err))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to fetch products")
	}

	// Create product map for quick lookup
	productMap := make(map[string]*model.Product)
	for _, p := range products {
		productMap[p.ID] = p
	}

	// Validate all products exist, are active, and belong to the business
	for _, item := range req.Items {
		product, exists := productMap[item.ProductID]
		if !exists {
			tx.Rollback()
			return nil, fiber.NewError(fiber.StatusBadRequest, fmt.Sprintf("Product %s not found", item.ProductID))
		}
		if !product.IsActive {
			tx.Rollback()
			return nil, fiber.NewError(fiber.StatusBadRequest, fmt.Sprintf("Product %s is not active", product.Name))
		}
		if product.BusinessID != businessID {
			tx.Rollback()
			return nil, fiber.NewError(fiber.StatusForbidden, "You don't have permission to sell this product")
		}
		if !product.EnableStock {
			continue
		}
		if product.StockQty != nil && util.ToValue(product.StockQty) < item.Quantity {
			tx.Rollback()
			return nil, fiber.NewError(fiber.StatusBadRequest, fmt.Sprintf("Insufficient stock for product %s. Available: %d, Requested: %d", product.Name, product.StockQty, item.Quantity))
		}
	}

	// Calculate total and create transaction items
	var totalAmount float64
	transactionItems := make([]*model.TransactionItem, len(req.Items))

	for i, item := range req.Items {
		product := productMap[item.ProductID]
		subtotal := product.Price * float64(item.Quantity)
		totalAmount += subtotal

		transactionItems[i] = &model.TransactionItem{
			ProductID:   &item.ProductID,
			ProductName: product.Name,
			Price:       product.Price,
			Quantity:    item.Quantity,
			Subtotal:    subtotal,
		}
	}

	// Create transaction
	now := time.Now()
	expiredAt := now.Add(15 * time.Minute)

	transaction := &model.Transaction{
		BusinessID:     businessID,
		CreatedBy:      userID,
		TotalAmount:    totalAmount,
		ReceivedAmount: 0,
		ChangeAmount:   0,
		Status:         "pending",
		ExpiredAt:      expiredAt,
	}

	if err := tx.Create(transaction).Error; err != nil {
		tx.Rollback()
		logger.Log.Error("Failed to create transaction", zap.Error(err))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to create transaction")
	}

	// Set transaction ID for items
	for _, item := range transactionItems {
		item.TransactionID = transaction.ID
	}

	// Create transaction items
	if err := tx.Create(&transactionItems).Error; err != nil {
		tx.Rollback()
		logger.Log.Error("Failed to create transaction items", zap.Error(err))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to create transaction items")
	}

	// Decrease stock for all products
	for _, item := range req.Items {
		product := productMap[item.ProductID]
		if !product.EnableStock {
			continue
		}
		if err := u.productRepo.DecreaseStock(item.ProductID, item.Quantity); err != nil {
			tx.Rollback()
			logger.Log.Error("Failed to decrease stock", zap.Error(err), zap.String("productID", item.ProductID))
			return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to update stock")
		}
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		logger.Log.Error("Failed to commit transaction", zap.Error(err))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to complete checkout")
	}

	// Load items for response
	transaction.Items = make([]model.TransactionItem, len(transactionItems))
	for i, item := range transactionItems {
		transaction.Items[i] = *item
	}

	return util.ToPointer(buildTransactionRes(util.ToValue(transaction))), nil
}

// UpdateTransaction updates a pending transaction
func (u *TransactionUsecase) UpdateTransaction(userID, businessID, transactionID string, req *contract.UpdateTransactionReq) (*contract.TransactionRes, error) {
	// Start transaction
	tx := u.db.Begin()
	if tx.Error != nil {
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to start transaction")
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Get existing transaction
	transaction, err := u.transactionRepo.GetTransactionByIDAndBusinessID(transactionID, businessID)
	if err != nil {
		tx.Rollback()
		logger.Log.Error("Failed to get transaction", zap.Error(err))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to get transaction")
	}

	if transaction == nil {
		tx.Rollback()
		return nil, fiber.NewError(fiber.StatusNotFound, "Transaction not found")
	}

	// Validate transaction status
	if transaction.Status != "pending" {
		tx.Rollback()
		return nil, fiber.NewError(fiber.StatusBadRequest, "Can only update pending transactions")
	}

	// Check if expired
	if time.Now().After(transaction.ExpiredAt) {
		tx.Rollback()
		return nil, fiber.NewError(fiber.StatusBadRequest, "Transaction has expired")
	}

	// Get old items for stock restoration
	oldItems := transaction.Items

	// Get all new product IDs
	productIDs := make([]string, len(req.Items))
	for i, item := range req.Items {
		productIDs[i] = item.ProductID
	}

	// Fetch all products
	products, err := u.productRepo.GetProductsByIDs(productIDs)
	if err != nil {
		tx.Rollback()
		logger.Log.Error("Failed to fetch products", zap.Error(err))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to fetch products")
	}

	// Create product map
	productMap := make(map[string]*model.Product)
	for _, p := range products {
		productMap[p.ID] = p
	}

	// Validate all products
	for _, item := range req.Items {
		product, exists := productMap[item.ProductID]
		if !exists {
			tx.Rollback()
			return nil, fiber.NewError(fiber.StatusBadRequest, fmt.Sprintf("Product %s not found", item.ProductID))
		}
		if !product.IsActive {
			tx.Rollback()
			return nil, fiber.NewError(fiber.StatusBadRequest, fmt.Sprintf("Product %s is not active", product.Name))
		}
		if product.BusinessID != businessID {
			tx.Rollback()
			return nil, fiber.NewError(fiber.StatusForbidden, "You don't have permission to sell this product")
		}
	}

	// Restore stock from old items
	for _, oldItem := range oldItems {
		if err := u.productRepo.IncreaseStock(*oldItem.ProductID, oldItem.Quantity); err != nil {
			tx.Rollback()
			logger.Log.Error("Failed to restore stock", zap.Error(err))
			return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to restore stock")
		}
	}

	// Decrease stock for new items and validate
	for _, item := range req.Items {
		product := productMap[item.ProductID]
		if !product.EnableStock {
			continue
		}
		if product.StockQty != nil && util.ToValue(product.StockQty) < item.Quantity {
			tx.Rollback()
			return nil, fiber.NewError(fiber.StatusBadRequest, fmt.Sprintf("Insufficient stock for product %s. Available: %d, Requested: %d", product.Name, product.StockQty, item.Quantity))
		}

		if err := u.productRepo.DecreaseStock(item.ProductID, item.Quantity); err != nil {
			tx.Rollback()
			logger.Log.Error("Failed to decrease stock", zap.Error(err))
			return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to update stock")
		}
	}

	// Delete old transaction items
	if err := tx.Where("transaction_id = ?", transactionID).Delete(&model.TransactionItem{}).Error; err != nil {
		tx.Rollback()
		logger.Log.Error("Failed to delete old items", zap.Error(err))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to update transaction")
	}

	// Calculate new total and create new items
	var totalAmount float64
	transactionItems := make([]*model.TransactionItem, len(req.Items))

	for i, item := range req.Items {
		product := productMap[item.ProductID]
		subtotal := product.Price * float64(item.Quantity)
		totalAmount += subtotal

		transactionItems[i] = &model.TransactionItem{
			TransactionID: transactionID,
			ProductID:     &item.ProductID,
			ProductName:   product.Name,
			Price:         product.Price,
			Quantity:      item.Quantity,
			Subtotal:      subtotal,
		}
	}

	// Update transaction total
	transaction.TotalAmount = totalAmount

	if err := tx.Save(transaction).Error; err != nil {
		tx.Rollback()
		logger.Log.Error("Failed to update transaction", zap.Error(err))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to update transaction")
	}

	// Create new items
	if err := tx.Create(&transactionItems).Error; err != nil {
		tx.Rollback()
		logger.Log.Error("Failed to create new items", zap.Error(err))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to create transaction items")
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		logger.Log.Error("Failed to commit transaction", zap.Error(err))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to update transaction")
	}

	// Load items for response
	transaction.Items = make([]model.TransactionItem, len(transactionItems))
	for i, item := range transactionItems {
		transaction.Items[i] = *item
	}

	return util.ToPointer(buildTransactionRes(util.ToValue(transaction))), nil
}

// PayTransaction finalizes a transaction with cash payment
func (u *TransactionUsecase) PayTransaction(userID, businessID, transactionID string, req *contract.PayTransactionReq) (*contract.TransactionRes, error) {
	// Get transaction
	transaction, err := u.transactionRepo.GetTransactionByIDAndBusinessID(transactionID, businessID)
	if err != nil {
		logger.Log.Error("Failed to get transaction", zap.Error(err))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to get transaction")
	}

	if transaction == nil {
		return nil, fiber.NewError(fiber.StatusNotFound, "Transaction not found")
	}

	// Validate transaction status
	if transaction.Status != "pending" {
		return nil, fiber.NewError(fiber.StatusBadRequest, "Transaction is not pending")
	}

	// Check if expired
	if time.Now().After(transaction.ExpiredAt) {
		return nil, fiber.NewError(fiber.StatusBadRequest, "Transaction has expired")
	}

	// Validate amount received
	if req.ReceivedAmount < transaction.TotalAmount {
		return nil, fiber.NewError(fiber.StatusBadRequest, fmt.Sprintf("Insufficient payment. Required: %.2f, Received: %.2f", transaction.TotalAmount, req.ReceivedAmount))
	}

	// Calculate change
	change := req.ReceivedAmount - transaction.TotalAmount

	// Update transaction
	now := time.Now()
	transaction.ReceivedAmount = req.ReceivedAmount
	transaction.ChangeAmount = change
	transaction.Status = "paid"
	transaction.PaidAt = &now

	if err := u.transactionRepo.UpdateTransaction(transaction); err != nil {
		logger.Log.Error("Failed to update transaction", zap.Error(err))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to finalize payment")
	}

	return util.ToPointer(buildTransactionRes(util.ToValue(transaction))), nil
}

// GetTransaction gets a transaction by ID
func (u *TransactionUsecase) GetTransaction(userID, businessID, transactionID string) (*contract.TransactionRes, error) {
	transaction, err := u.transactionRepo.GetTransactionByIDAndBusinessID(transactionID, businessID)
	if err != nil {
		logger.Log.Error("Failed to get transaction", zap.Error(err))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to get transaction")
	}

	if transaction == nil {
		return nil, fiber.NewError(fiber.StatusNotFound, "Transaction not found")
	}

	return util.ToPointer(buildTransactionRes(util.ToValue(transaction))), nil
}

// Helper method to build transaction response
func buildTransactionRes(transaction model.Transaction) contract.TransactionRes {
	items := make([]contract.TransactionItemRes, len(transaction.Items))
	for i, item := range transaction.Items {
		items[i] = contract.TransactionItemRes{
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

	return contract.TransactionRes{
		ID:             transaction.ID,
		BusinessID:     transaction.BusinessID,
		CreatedBy:      transaction.CreatedBy,
		Creator:        BuildUserRes(transaction.Creator),
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

// IsAllowedToAccessTransaction checks if a user has access to a transaction
func (u *TransactionUsecase) IsAllowedToAccessTransaction(userID string, transactionID string) error {
	business, err := u.businessRepo.GetBusinessByUserID(userID)
	if err != nil {
		logger.Log.Error("Failed to get user business", zap.Error(err), zap.String("userID", userID))
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to get user business")
	}

	if business == nil {
		logger.Log.Warn("Business not found for user", zap.String("userID", userID))
		return fiber.NewError(fiber.StatusNotFound, "Business not found. Please create a business first.")
	}

	transaction, err := u.transactionRepo.GetTransactionByIDAndBusinessID(transactionID, business.ID)
	if err != nil {
		logger.Log.Error("Failed to get transaction", zap.Error(err), zap.String("transactionID", transactionID))
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to get transaction")
	}

	if transaction == nil {
		logger.Log.Warn("Transaction not found", zap.String("transactionID", transactionID))
		return fiber.NewError(fiber.StatusNotFound, "You don't have permission to access this transaction")
	}

	return nil
}

// ListTransactions lists transactions with pagination
func (u *TransactionUsecase) ListTransactions(businessID string, page, pageSize int) ([]contract.TransactionRes, int64, error) {
	transactions, total, err := u.transactionRepo.ListTransactionsByBusinessID(businessID, page, pageSize)
	if err != nil {
		logger.Log.Error("Failed to list transactions", zap.Error(err))
		return nil, 0, fiber.NewError(fiber.StatusInternalServerError, "Failed to list transactions")
	}

	results := make([]contract.TransactionRes, len(transactions))
	for i, transaction := range transactions {
		results[i] = buildTransactionRes(transaction)
	}

	return results, total, nil
}
