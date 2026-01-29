package usecase

import (
	"app/internal/config"
	"app/internal/contract"
	"app/internal/middleware"
	"app/internal/model"
	"app/internal/repository"
	"app/pkg/logger"
	"app/pkg/storage"
	"app/pkg/util"
	"fmt"
	"math/rand"
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
	storage *storage.R2Storage,
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

	// Validate products and build items
	productMap, err := u.fetchAndValidateProducts(req.Items, businessID)
	if err != nil {
		return nil, err
	}

	// Create transaction items and calculate total
	totalAmount, transactionItems := u.buildTransactionItems(req.Items, productMap, "")

	// For cash payment
	status := config.TRANSACTION_STATUS_PENDING
	var receivedAmount, changeAmount float64
	var paidAt *time.Time

	if req.IsCashPaid {
		if req.ReceivedAmount == nil {
			return nil, fiber.NewError(fiber.StatusBadRequest, "Received amount is required")
		}

		receivedAmount = *req.ReceivedAmount
		changeAmount = receivedAmount - totalAmount

		if changeAmount < 0 {
			return nil, fiber.NewError(fiber.StatusBadRequest, "Received amount is less than total amount")
		}

		// status

		status = config.TRANSACTION_STATUS_PAID
		paidAt = util.ToPointer(time.Now())

	}

	// Start transaction
	tx := u.db.Begin()
	if tx.Error != nil {
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to start transaction")
	}
	defer handlePanic(tx)

	// Create transaction
	transaction := &model.Transaction{
		BusinessID:     businessID,
		CreatedBy:      userID,
		TotalAmount:    totalAmount,
		InvoiceNumber:  generateInvoiceNumber(),
		ReceivedAmount: receivedAmount,
		ChangeAmount:   changeAmount,
		Status:         status,
		PaidAt:         paidAt,
		ExpiredAt:      time.Now().Add(config.TRANSACTION_EXPIRY_TIME),
	}

	if err := tx.Create(transaction).Error; err != nil {
		tx.Rollback()
		logger.Log.Error("Failed to create transaction", zap.Error(err))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to create transaction")
	}

	// Set transaction ID for items and create them
	for _, item := range transactionItems {
		item.TransactionID = transaction.ID
	}

	if err := tx.Create(&transactionItems).Error; err != nil {
		tx.Rollback()
		logger.Log.Error("Failed to create transaction items", zap.Error(err))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to create transaction items")
	}

	// Update stock
	if err := u.updateStock(tx, req.Items, productMap, false); err != nil {
		tx.Rollback()
		return nil, err
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		logger.Log.Error("Failed to commit transaction", zap.Error(err))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to complete checkout")
	}

	// Load items for response
	transaction.Items = convertToTransactionItems(transactionItems)
	return util.ToPointer(buildTransactionRes(util.ToValue(transaction))), nil
}

// UpdateTransaction updates a pending transaction
func (u *TransactionUsecase) UpdateTransaction(userID, businessID, transactionID string, req *contract.UpdateTransactionReq) (*contract.TransactionRes, error) {
	// Get and validate existing transaction
	transaction, err := u.getAndValidatePendingTransaction(transactionID, businessID)
	if err != nil {
		return nil, err
	}

	oldItems := transaction.Items

	// Validate new products
	productMap, err := u.fetchAndValidateProducts(req.Items, businessID)
	if err != nil {
		return nil, err
	}

	tx := u.db.Begin()
	if tx.Error != nil {
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to start transaction")
	}
	defer handlePanic(tx)

	// Restore stock from old items
	if err := u.restoreStock(tx, oldItems); err != nil {
		tx.Rollback()
		return nil, err
	}

	// Update stock with new items
	if err := u.updateStock(tx, req.Items, productMap, false); err != nil {
		tx.Rollback()
		return nil, err
	}

	// Delete old transaction items
	if err := tx.Where("transaction_id = ?", transactionID).Delete(&model.TransactionItem{}).Error; err != nil {
		tx.Rollback()
		logger.Log.Error("Failed to delete old items", zap.Error(err))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to update transaction")
	}

	// Create new items and update total
	totalAmount, transactionItems := u.buildTransactionItems(req.Items, productMap, transactionID)
	transaction.TotalAmount = totalAmount

	// For cash payment
	if req.IsCashPaid {
		status := config.TRANSACTION_STATUS_PENDING
		var receivedAmount, changeAmount float64
		if req.ReceivedAmount == nil {
			return nil, fiber.NewError(fiber.StatusBadRequest, "Received amount is required")
		}

		receivedAmount = *req.ReceivedAmount
		changeAmount = receivedAmount - totalAmount

		if changeAmount < 0 {
			return nil, fiber.NewError(fiber.StatusBadRequest, "Received amount is less than total amount")
		}

		// status
		if req.IsCashPaid {
			status = config.TRANSACTION_STATUS_PAID
		}

		transaction.Status = status
		transaction.ReceivedAmount = receivedAmount
		transaction.ChangeAmount = changeAmount
		transaction.PaidAt = util.ToPointer(time.Now())
	}

	if err := tx.Save(transaction).Error; err != nil {
		tx.Rollback()
		logger.Log.Error("Failed to update transaction", zap.Error(err))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to update transaction")
	}

	if err := tx.Create(&transactionItems).Error; err != nil {
		tx.Rollback()
		logger.Log.Error("Failed to create new items", zap.Error(err))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to create transaction items")
	}

	if err := tx.Commit().Error; err != nil {
		logger.Log.Error("Failed to commit transaction", zap.Error(err))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to update transaction")
	}

	transaction.Items = convertToTransactionItems(transactionItems)
	return util.ToPointer(buildTransactionRes(util.ToValue(transaction))), nil
}

// PayTransaction finalizes a transaction with cash payment
func (u *TransactionUsecase) PayTransaction(userID, businessID, transactionID string, req *contract.PayTransactionReq) (*contract.TransactionRes, error) {
	transaction, err := u.getAndValidatePendingTransaction(transactionID, businessID)
	if err != nil {
		return nil, err
	}

	// Validate amount received
	if req.ReceivedAmount < transaction.TotalAmount {
		return nil, fiber.NewError(fiber.StatusBadRequest, fmt.Sprintf("Insufficient payment. Required: %.2f, Received: %.2f", transaction.TotalAmount, req.ReceivedAmount))
	}

	// Update transaction
	now := time.Now()
	transaction.ReceivedAmount = req.ReceivedAmount
	transaction.ChangeAmount = req.ReceivedAmount - transaction.TotalAmount
	transaction.Status = config.TRANSACTION_STATUS_PAID
	transaction.PaidAt = &now

	if err := u.transactionRepo.UpdateTransaction(transaction); err != nil {
		logger.Log.Error("Failed to update transaction", zap.Error(err))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to finalize payment")
	}

	return util.ToPointer(buildTransactionRes(util.ToValue(transaction))), nil
}

// GetTransaction gets a transaction by ID
func (u *TransactionUsecase) GetTransaction(transactionID string) (*contract.TransactionRes, error) {
	transaction, err := u.transactionRepo.GetTransactionByID(transactionID)
	if err != nil {
		logger.Log.Error("Failed to get transaction", zap.Error(err))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to get transaction")
	}

	if transaction == nil {
		return nil, fiber.NewError(fiber.StatusNotFound, "Transaction not found")
	}

	return util.ToPointer(buildTransactionRes(util.ToValue(transaction))), nil
}

// ListTransactions lists transactions with pagination
func (u *TransactionUsecase) ListTransactions(businessID string, page, pageSize int, search string) ([]contract.TransactionRes, int64, error) {
	transactions, total, err := u.transactionRepo.ListTransactionsByBusinessID(businessID, page, pageSize, search)
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

// IsAllowedToAccess checks if user has permission to access transactions
func (u *TransactionUsecase) IsAllowedToAccess(claims middleware.Claims, allowedPermissions []config.Permission, transactionID *string) error {
	allowed, permission := config.DoesRoleAllowedToAccess(claims.Role, allowedPermissions)

	if !allowed || permission == nil {
		return fiber.NewError(fiber.StatusForbidden, "You don't have permission to perform this action")
	}
	scope := permission.Scope()

	if scope == config.PERMISSION_SCOPE_ORG {
		if transactionID != nil {
			transaction, err := u.transactionRepo.GetTransactionByIDAndBusinessID(*transactionID, *claims.BusinessID)
			if err != nil {
				logger.Log.Error("Failed to get transaction", zap.Error(err), zap.String("transactionID", *transactionID))
				return fiber.NewError(fiber.StatusInternalServerError, "Failed to get transaction")
			}

			if transaction == nil {
				logger.Log.Warn("Transaction not found", zap.String("transactionID", *transactionID))
				return fiber.NewError(fiber.StatusNotFound, "You don't have permission to perform this action")
			}
		}
	}

	return nil
}

// ============================================================================
// Helper Functions
// ============================================================================

// handlePanic recovers from panics and rolls back the transaction
func handlePanic(tx *gorm.DB) {
	if r := recover(); r != nil {
		tx.Rollback()
	}
}

// fetchAndValidateProducts fetches products and validates them
func (u *TransactionUsecase) fetchAndValidateProducts(items []contract.TransactionItemReq, businessID string) (map[string]*model.Product, error) {
	// Get product IDs
	productIDs := make([]string, len(items))
	for i, item := range items {
		productIDs[i] = item.ProductID
	}

	// Fetch products
	products, err := u.productRepo.GetProductsByIDs(productIDs)
	if err != nil {
		logger.Log.Error("Failed to fetch products", zap.Error(err))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to fetch products")
	}

	// Create product map
	productMap := make(map[string]*model.Product)
	for _, p := range products {
		productMap[p.ID] = p
	}

	// Validate products
	for _, item := range items {
		product, exists := productMap[item.ProductID]
		if !exists {
			return nil, fiber.NewError(fiber.StatusBadRequest, fmt.Sprintf("Product %s not found", item.ProductID))
		}
		if !product.IsActive {
			return nil, fiber.NewError(fiber.StatusBadRequest, fmt.Sprintf("Product %s is not active", product.Name))
		}
		if product.BusinessID != businessID {
			return nil, fiber.NewError(fiber.StatusForbidden, "You don't have permission to sell this product")
		}

		// Check stock if enabled
		if product.EnableStock && product.StockQty != nil && util.ToValue(product.StockQty) < item.Quantity {
			return nil, fiber.NewError(fiber.StatusBadRequest, fmt.Sprintf("Insufficient stock for product %s. Available: %d, Requested: %d", product.Name, *product.StockQty, item.Quantity))
		}
	}

	return productMap, nil
}

// buildTransactionItems creates transaction items and calculates total
func (u *TransactionUsecase) buildTransactionItems(items []contract.TransactionItemReq, productMap map[string]*model.Product, transactionID string) (float64, []*model.TransactionItem) {
	var totalAmount float64
	transactionItems := make([]*model.TransactionItem, len(items))

	for i, item := range items {
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

	return totalAmount, transactionItems
}

// updateStock updates product stock quantities
func (u *TransactionUsecase) updateStock(tx *gorm.DB, items []contract.TransactionItemReq, productMap map[string]*model.Product, increase bool) error {
	for _, item := range items {
		product := productMap[item.ProductID]
		if !product.EnableStock {
			continue
		}

		var err error
		if increase {
			err = u.productRepo.IncreaseStock(tx, item.ProductID, item.Quantity)
		} else {
			err = u.productRepo.DecreaseStock(tx, item.ProductID, item.Quantity)
		}

		if err != nil {
			logger.Log.Error("Failed to update stock", zap.Error(err), zap.String("productID", item.ProductID))
			return fiber.NewError(fiber.StatusInternalServerError, "Failed to update stock")
		}
	}
	return nil
}

// restoreStock restores stock from transaction items
func (u *TransactionUsecase) restoreStock(tx *gorm.DB, items []model.TransactionItem) error {
	for _, item := range items {
		if item.ProductID == nil {
			continue
		}

		// Get product to check if stock management is enabled
		product, err := u.productRepo.GetProductByID(*item.ProductID)
		if err != nil || product == nil || !product.EnableStock {
			continue
		}

		if err := u.productRepo.IncreaseStock(tx, *item.ProductID, item.Quantity); err != nil {
			logger.Log.Error("Failed to restore stock", zap.Error(err))
			return fiber.NewError(fiber.StatusInternalServerError, "Failed to restore stock")
		}
	}
	return nil
}

// getAndValidatePendingTransaction retrieves and validates a pending transaction
func (u *TransactionUsecase) getAndValidatePendingTransaction(transactionID, businessID string) (*model.Transaction, error) {
	transaction, err := u.transactionRepo.GetTransactionByIDAndBusinessID(transactionID, businessID)
	if err != nil {
		logger.Log.Error("Failed to get transaction", zap.Error(err))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to get transaction")
	}

	if transaction == nil {
		return nil, fiber.NewError(fiber.StatusNotFound, "Transaction not found")
	}

	if transaction.Status != config.TRANSACTION_STATUS_PENDING {
		return nil, fiber.NewError(fiber.StatusBadRequest, "Can only modify pending transactions")
	}

	if time.Now().After(transaction.ExpiredAt) {
		return nil, fiber.NewError(fiber.StatusBadRequest, "Transaction has expired")
	}

	return transaction, nil
}

// convertToTransactionItems converts pointer slice to value slice
func convertToTransactionItems(items []*model.TransactionItem) []model.TransactionItem {
	result := make([]model.TransactionItem, len(items))
	for i, item := range items {
		result[i] = *item
	}
	return result
}

// buildTransactionRes builds transaction response
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

func generateInvoiceNumber() string {
	// Format: DDMMYY + 3 random uppercase letters, example 130126JTY
	const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

	now := time.Now()
	datePart := now.Format("020106")

	b := make([]byte, 3)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}

	return datePart + string(b)
}
