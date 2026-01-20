package handler

import (
	"app/internal/config"
	"app/internal/contract"
	"app/internal/middleware"
	"app/internal/usecase"
	"app/pkg/logger"
	"app/pkg/util"

	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type TransactionHandler struct {
	transactionUsecase *usecase.TransactionUsecase
}

func NewTransactionHandler(transactionUsecase *usecase.TransactionUsecase) *TransactionHandler {
	return &TransactionHandler{
		transactionUsecase: transactionUsecase,
	}
}

func (h *TransactionHandler) RegisterRoutes(app *fiber.App, db *gorm.DB) {
	transactionGroup := app.Group("/transactions", middleware.AuthGuard(db))
	transactionGroup.Post("/", h.CreateTransaction)
	transactionGroup.Get("/", h.ListTransactions)
	transactionGroup.Get("/:id", h.GetTransaction)
	transactionGroup.Put("/:id", h.UpdateTransaction)
	transactionGroup.Post("/:id/pay", h.PayTransaction)
}

// @Tags Transactions
// @Summary Create transaction (checkout)
// @Description Create a new transaction with items, decreases stock, sets 15-minute expiry
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body contract.CreateTransactionReq true "Create transaction request"
// @Success 201 {object} util.BaseResponse{data=contract.TransactionRes}
// @Failure 400 {object} util.BaseResponse
// @Failure 401 {object} util.BaseResponse
// @Failure 500 {object} util.BaseResponse
// @Router /transactions [post]
func (h *TransactionHandler) CreateTransaction(c *fiber.Ctx) error {
	var req contract.CreateTransactionReq
	if err := c.BodyParser(&req); err != nil {
		logger.Log.Warn("Failed to parse request body", zap.Error(err))
		return err
	}

	if err := util.ValidateStruct(&req); err != nil {
		logger.Log.Warn("Validation error", zap.Error(err))
		return err
	}

	claims := middleware.GetAuthClaims(c)
	if claims.BusinessID == nil {
		return fiber.NewError(fiber.StatusNotFound, "Finish onboarding first")
	}

	if err := h.transactionUsecase.IsAllowedToAccess(claims.Role, []config.Permission{config.CREATE_TRANSACTION_ANY, config.CREATE_TRANSACTION_ORG}, claims.BusinessID, nil); err != nil {
		return err
	}

	transaction, err := h.transactionUsecase.CreateTransaction(claims.ID, *claims.BusinessID, &req)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusCreated).JSON(util.ToSuccessResponse(transaction))
}

// @Tags Transactions
// @Summary List transactions
// @Description List all transactions for the authenticated user's business with pagination
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param page query int false "Page number (default: 1)"
// @Param pageSize query int false "Page size (default: 10, max: 100)"
// @Success 200 {object} util.PaginatedResponse{data=util.PaginatedData{items=[]contract.TransactionRes}}
// @Failure 401 {object} util.BaseResponse
// @Failure 500 {object} util.BaseResponse
// @Router /transactions [get]
func (h *TransactionHandler) ListTransactions(c *fiber.Ctx) error {
	claims := middleware.GetAuthClaims(c)

	if claims.BusinessID == nil {
		return fiber.NewError(fiber.StatusNotFound, "Finish onboarding first")
	}

	queries, err := util.ParsePaginationQueries(c)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	if err := h.transactionUsecase.IsAllowedToAccess(claims.Role, []config.Permission{config.READ_TRANSACTION_ANY, config.READ_TRANSACTION_ORG}, claims.BusinessID, nil); err != nil {
		return err
	}

	transactions, total, err := h.transactionUsecase.ListTransactions(*claims.BusinessID, queries.Page, queries.PageSize)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(util.ToPaginatedResponse(transactions, queries.Page, queries.PageSize, total))
}

// @Tags Transactions
// @Summary Get transaction
// @Description Get transaction details by ID
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Transaction ID"
// @Success 200 {object} util.BaseResponse{data=contract.TransactionRes}
// @Failure 401 {object} util.BaseResponse
// @Failure 404 {object} util.BaseResponse
// @Failure 500 {object} util.BaseResponse
// @Router /transactions/{id} [get]
func (h *TransactionHandler) GetTransaction(c *fiber.Ctx) error {
	transactionID := c.Params("id")
	if transactionID == "" {
		return fiber.NewError(fiber.StatusBadRequest, "Transaction ID is required")
	}

	claims := middleware.GetAuthClaims(c)

	if err := h.transactionUsecase.IsAllowedToAccess(claims.Role, []config.Permission{config.READ_TRANSACTION_ANY, config.READ_TRANSACTION_ORG}, claims.BusinessID, &transactionID); err != nil {
		return err
	}

	if claims.BusinessID == nil {
		return fiber.NewError(fiber.StatusNotFound, "Finish onboarding first")
	}

	transaction, err := h.transactionUsecase.GetTransaction(claims.ID, *claims.BusinessID, transactionID)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(util.ToSuccessResponse(transaction))
}

// @Tags Transactions
// @Summary Update transaction
// @Description Update a pending transaction before payment
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Transaction ID"
// @Param request body contract.UpdateTransactionReq true "Update transaction request"
// @Success 200 {object} util.BaseResponse{data=contract.TransactionRes}
// @Failure 400 {object} util.BaseResponse
// @Failure 401 {object} util.BaseResponse
// @Failure 404 {object} util.BaseResponse
// @Failure 500 {object} util.BaseResponse
// @Router /transactions/{id} [put]
func (h *TransactionHandler) UpdateTransaction(c *fiber.Ctx) error {
	transactionID := c.Params("id")
	if transactionID == "" {
		return fiber.NewError(fiber.StatusBadRequest, "Transaction ID is required")
	}

	var req contract.UpdateTransactionReq
	if err := c.BodyParser(&req); err != nil {
		logger.Log.Warn("Failed to parse request body", zap.Error(err))
		return err
	}

	if err := util.ValidateStruct(&req); err != nil {
		logger.Log.Warn("Validation error", zap.Error(err))
		return err
	}

	claims := middleware.GetAuthClaims(c)

	if err := h.transactionUsecase.IsAllowedToAccess(claims.Role, []config.Permission{config.UPDATE_TRANSACTION_ANY, config.UPDATE_TRANSACTION_ORG}, claims.BusinessID, &transactionID); err != nil {
		return err
	}

	if claims.BusinessID == nil {
		return fiber.NewError(fiber.StatusNotFound, "Finish onboarding first")
	}

	transaction, err := h.transactionUsecase.UpdateTransaction(claims.ID, *claims.BusinessID, transactionID, &req)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(util.ToSuccessResponse(transaction))
}

// @Tags Transactions
// @Summary Pay transaction
// @Description Finalize transaction with cash payment
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Transaction ID"
// @Param request body contract.PayTransactionReq true "Pay transaction request"
// @Success 200 {object} util.BaseResponse{data=contract.TransactionRes}
// @Failure 400 {object} util.BaseResponse
// @Failure 401 {object} util.BaseResponse
// @Failure 404 {object} util.BaseResponse
// @Failure 500 {object} util.BaseResponse
// @Router /transactions/{id}/pay [post]
func (h *TransactionHandler) PayTransaction(c *fiber.Ctx) error {
	transactionID := c.Params("id")
	if transactionID == "" {
		return fiber.NewError(fiber.StatusBadRequest, "Transaction ID is required")
	}

	var req contract.PayTransactionReq
	if err := c.BodyParser(&req); err != nil {
		logger.Log.Warn("Failed to parse request body", zap.Error(err))
		return err
	}

	if err := util.ValidateStruct(&req); err != nil {
		logger.Log.Warn("Validation error", zap.Error(err))
		return err
	}

	claims := middleware.GetAuthClaims(c)

	if err := h.transactionUsecase.IsAllowedToAccess(claims.Role, []config.Permission{config.PAY_TRANSACTION_ANY, config.PAY_TRANSACTION_ORG}, claims.BusinessID, &transactionID); err != nil {
		return err
	}

	if claims.BusinessID == nil {
		return fiber.NewError(fiber.StatusNotFound, "Finish onboarding first")
	}

	transaction, err := h.transactionUsecase.PayTransaction(claims.ID, *claims.BusinessID, transactionID, &req)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(util.ToSuccessResponse(transaction))
}
