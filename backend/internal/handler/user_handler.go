package handler

import (
	"app/internal/contract"
	"app/internal/middleware"
	"app/internal/usecase"
	"app/pkg/logger"
	"app/pkg/util"

	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type UserHandler struct {
	userUsecase *usecase.UserUsecase
}

func NewUserHandler(userUsecase *usecase.UserUsecase) *UserHandler {
	return &UserHandler{
		userUsecase: userUsecase,
	}
}

func (h *UserHandler) RegisterRoutes(app *fiber.App, db *gorm.DB) {
	userGroup := app.Group("/users", middleware.AuthGuard(db))
	// current
	currentUserGroup := userGroup.Group("/current")
	currentUserGroup.Get("", h.GetCurrentUser)
	currentUserGroup.Put("", h.EditCurrentUser)
	currentUserGroup.Put("/password", h.EditCurrentUserPassword)
	currentUserGroup.Put("/business", h.EditCurrentUserBusiness)

}

// @Tags User
// @Summary Get current user
// @Description Get authenticated user information with business data
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} util.BaseResponse{data=contract.UserRes}
// @Failure 401 {object} util.BaseResponse
// @Failure 500 {object} util.BaseResponse
// @Router /users/current [get]
func (h *UserHandler) GetCurrentUser(c *fiber.Ctx) error {
	claims := middleware.GetAuthClaims(c)
	user, err := h.userUsecase.GetCurrentUser(claims.ID, claims.BusinessID)
	if err != nil {
		return err
	}
	return c.Status(fiber.StatusOK).JSON(util.ToSuccessResponse(user))
}

// @Tags User
// @Summary Edit current user
// @Description Update authenticated user's profile and business information
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body contract.EditCurrentUserReq true "Edit user request"
// @Success 200 {object} util.BaseResponse{data=contract.UserRes}
// @Failure 400 {object} util.BaseResponse
// @Failure 401 {object} util.BaseResponse
// @Failure 500 {object} util.BaseResponse
// @Router /users/current [put]
func (h *UserHandler) EditCurrentUser(c *fiber.Ctx) error {
	var req contract.EditCurrentUserReq
	if err := c.BodyParser(&req); err != nil {
		logger.Log.Warn("Failed to parse request body", zap.Error(err))
		return err
	}

	if err := util.ValidateStruct(&req); err != nil {
		logger.Log.Warn("Validation error", zap.Error(err))
		return err
	}

	claims := middleware.GetAuthClaims(c)

	user, err := h.userUsecase.EditCurrentUser(claims.ID, &req)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(util.ToSuccessResponse(user))
}

// @Tags User
// @Summary Edit current user password
// @Description Change authenticated user's password
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body contract.EditPasswordReq true "Edit password request"
// @Success 200 {object} util.BaseResponse
// @Failure 400 {object} util.BaseResponse
// @Failure 401 {object} util.BaseResponse
// @Failure 500 {object} util.BaseResponse
// @Router /users/current/password [put]
func (h *UserHandler) EditCurrentUserPassword(c *fiber.Ctx) error {
	var req contract.EditCurrentUserPasswordReq
	if err := c.BodyParser(&req); err != nil {
		logger.Log.Warn("Failed to parse request body", zap.Error(err))
		return err
	}

	if err := util.ValidateStruct(&req); err != nil {
		logger.Log.Warn("Validation error", zap.Error(err))
		return err
	}

	claims := middleware.GetAuthClaims(c)
	if err := h.userUsecase.EditPassword(claims.ID, &req, true); err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(util.ToSuccessResponse("Password updated successfully"))
}

// @Tags User
// @Summary Edit current user business
// @Description Change authenticated user's business
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body contract.EditCurrentUserBusinessReq true "Edit business request"
// @Success 200 {object} util.BaseResponse
// @Failure 400 {object} util.BaseResponse
// @Failure 401 {object} util.BaseResponse
// @Failure 500 {object} util.BaseResponse
// @Router /users/current/business [put]
func (h *UserHandler) EditCurrentUserBusiness(c *fiber.Ctx) error {
	var req contract.EditCurrentUserBusinessReq
	if err := c.BodyParser(&req); err != nil {
		logger.Log.Warn("Failed to parse request body", zap.Error(err))
		return err
	}

	if err := util.ValidateStruct(&req); err != nil {
		logger.Log.Warn("Validation error", zap.Error(err))
		return err
	}

	claims := middleware.GetAuthClaims(c)
	res, err := h.userUsecase.EditBusiness(claims.ID, *claims.BusinessID, &req)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(util.ToSuccessResponse(res))
}
