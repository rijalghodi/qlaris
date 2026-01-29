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

	// User
	userGroup.Post("", h.CreateUser)
	userGroup.Get("", h.ListUser)
	userGroup.Put("/:id", h.UpdateUser)
	userGroup.Get("/:id", h.GetUser)
	userGroup.Delete("/:id", h.DeleteUser)
	userGroup.Put("/:id/", h.EditPassword)

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
	user, err := h.userUsecase.GetCurrentUser(claims.ID)
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

	// BusinessID is required if editing business
	businessID := ""
	if claims.BusinessID != "" {
		businessID = claims.BusinessID
	}

	user, err := h.userUsecase.EditCurrentUser(claims.ID, businessID, &req)
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
	var req contract.EditPasswordReq
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
// @Summary Create user
// @Description Create a new user for the organization
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body contract.CreateUserReq true "Create user request"
// @Success 201 {object} util.BaseResponse{data=contract.UserRes}
// @Failure 400 {object} util.BaseResponse
// @Failure 401 {object} util.BaseResponse
// @Failure 500 {object} util.BaseResponse
// @Router /users [post]
func (h *UserHandler) CreateUser(c *fiber.Ctx) error {
	var req contract.CreateUserReq
	if err := c.BodyParser(&req); err != nil {
		logger.Log.Warn("Failed to parse request body", zap.Error(err))
		return err
	}

	if err := util.ValidateStruct(&req); err != nil {
		logger.Log.Warn("Validation error", zap.Error(err))
		return err
	}

	claims := middleware.GetAuthClaims(c)
	if err := h.userUsecase.IsAllowedToAccess(claims, []config.Permission{config.CREATE_USER_ANY, config.CREATE_USER_ORG}, nil); err != nil {
		return err
	}

	user, err := h.userUsecase.CreateUser(claims.BusinessID, &req)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusCreated).JSON(util.ToSuccessResponse(user))
}

// @Tags User
// @Summary Update user
// @Description Update an existing user
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "User ID"
// @Param request body contract.UpdateUserReq true "Update user request"
// @Success 200 {object} util.BaseResponse{data=contract.UserRes}
// @Failure 400 {object} util.BaseResponse
// @Failure 401 {object} util.BaseResponse
// @Failure 404 {object} util.BaseResponse
// @Failure 500 {object} util.BaseResponse
// @Router /users/{id} [put]
func (h *UserHandler) UpdateUser(c *fiber.Ctx) error {
	userID := c.Params("id")
	if userID == "" {
		return fiber.NewError(fiber.StatusBadRequest, "User ID is required")
	}

	var req contract.UpdateUserReq
	if err := c.BodyParser(&req); err != nil {
		logger.Log.Warn("Failed to parse request body", zap.Error(err))
		return err
	}

	if err := util.ValidateStruct(&req); err != nil {
		logger.Log.Warn("Validation error", zap.Error(err))
		return err
	}

	claims := middleware.GetAuthClaims(c)
	if err := h.userUsecase.IsAllowedToAccess(claims, []config.Permission{config.EDIT_USER_ANY, config.EDIT_USER_ORG, config.EDIT_USER_SELF}, &userID); err != nil {
		return err
	}

	user, err := h.userUsecase.UpdateUser(userID, claims.BusinessID, &req)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(util.ToSuccessResponse(user))
}

// @Tags User
// @Summary Get user
// @Description Get user details by ID
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "User ID"
// @Success 200 {object} util.BaseResponse{data=contract.UserRes}
// @Failure 401 {object} util.BaseResponse
// @Failure 404 {object} util.BaseResponse
// @Failure 500 {object} util.BaseResponse
// @Router /users/{id} [get]
func (h *UserHandler) GetUser(c *fiber.Ctx) error {
	userID := c.Params("id")
	if userID == "" {
		return fiber.NewError(fiber.StatusBadRequest, "User ID is required")
	}

	claims := middleware.GetAuthClaims(c)
	if err := h.userUsecase.IsAllowedToAccess(claims, []config.Permission{config.READ_USER_ANY, config.READ_USER_ORG, config.READ_USER_SELF}, &userID); err != nil {
		return err
	}

	user, err := h.userUsecase.GetUser(userID)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(util.ToSuccessResponse(user))
}

// @Tags User
// @Summary List users
// @Description List all users with pagination
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param page query int false "Page number (default: 1)"
// @Param pageSize query int false "Page size (default: 10, max: 100)"
// @Success 200 {object} util.PaginatedResponse{data=[]contract.UserRes}
// @Failure 401 {object} util.BaseResponse
// @Failure 500 {object} util.BaseResponse
// @Router /users [get]
func (h *UserHandler) ListUser(c *fiber.Ctx) error {
	claims := middleware.GetAuthClaims(c)

	queries, err := util.ParsePaginationQueries(c)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	if err := h.userUsecase.IsAllowedToAccess(claims, []config.Permission{config.READ_USER_ANY, config.READ_USER_ORG}, nil); err != nil {
		return err
	}

	users, total, err := h.userUsecase.ListUsers(&claims.BusinessID, queries.Page, queries.PageSize)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(util.ToPaginatedResponse(users, queries.Page, queries.PageSize, total))
}

// @Tags User
// @Summary Delete user
// @Description Permanently delete a user from the database
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "User ID"
// @Success 200 {object} util.BaseResponse
// @Failure 401 {object} util.BaseResponse
// @Failure 404 {object} util.BaseResponse
// @Failure 500 {object} util.BaseResponse
// @Router /users/{id} [delete]
func (h *UserHandler) DeleteUser(c *fiber.Ctx) error {
	userID := c.Params("id")
	if userID == "" {
		return fiber.NewError(fiber.StatusBadRequest, "User ID is required")
	}

	claims := middleware.GetAuthClaims(c)
	if err := h.userUsecase.IsAllowedToAccess(claims, []config.Permission{config.DELETE_USER_ANY, config.DELETE_USER_ORG}, &userID); err != nil {
		return err
	}

	if err := h.userUsecase.DeleteUser(userID); err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(util.ToSuccessResponse(nil))
}

// @Tags User
// @Summary Edit user password
// @Description Change password for a specific user (admin function)
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "User ID"
// @Param request body contract.EditPasswordReq true "Edit password request"
// @Success 200 {object} util.BaseResponse
// @Failure 400 {object} util.BaseResponse
// @Failure 401 {object} util.BaseResponse
// @Failure 500 {object} util.BaseResponse
// @Router /users/{id}/password [put]
func (h *UserHandler) EditPassword(c *fiber.Ctx) error {
	userID := c.Params("id")
	if userID == "" {
		return fiber.NewError(fiber.StatusBadRequest, "User ID is required")
	}

	var req contract.EditPasswordReq
	if err := c.BodyParser(&req); err != nil {
		logger.Log.Warn("Failed to parse request body", zap.Error(err))
		return err
	}

	if err := util.ValidateStruct(&req); err != nil {
		logger.Log.Warn("Validation error", zap.Error(err))
		return err
	}

	claims := middleware.GetAuthClaims(c)
	if err := h.userUsecase.IsAllowedToAccess(claims, []config.Permission{config.EDIT_USER_ANY, config.EDIT_USER_ORG, config.EDIT_USER_SELF}, &userID); err != nil {
		return err
	}

	if err := h.userUsecase.EditPassword(userID, &req, false); err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(util.ToSuccessResponse("Password updated successfully"))
}
