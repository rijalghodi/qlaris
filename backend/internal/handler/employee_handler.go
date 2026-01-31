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

type EmployeeHandler struct {
	employeeUsecase *usecase.EmployeeUsecase
}

func NewEmployeeHandler(employeeUsecase *usecase.EmployeeUsecase) *EmployeeHandler {
	return &EmployeeHandler{
		employeeUsecase: employeeUsecase,
	}
}

func (h *EmployeeHandler) RegisterRoutes(app *fiber.App, db *gorm.DB) {
	employeeGroup := app.Group("/employees", middleware.AuthGuard(db))
	employeeGroup.Post("/", h.CreateEmployee)
	employeeGroup.Get("/", h.ListEmployees)
	employeeGroup.Get("/:id", h.GetEmployee)
	employeeGroup.Put("/:id", h.UpdateEmployee)
	employeeGroup.Delete("/:id", h.DeleteEmployee)
}

// @Tags Employees
// @Summary Create employee
// @Description Create a new employee for the business
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body contract.CreateEmployeeReq true "Create employee request"
// @Success 201 {object} util.BaseResponse{data=contract.EmployeeRes}
// @Failure 400 {object} util.BaseResponse
// @Failure 401 {object} util.BaseResponse
// @Failure 500 {object} util.BaseResponse
// @Router /employees [post]
func (h *EmployeeHandler) CreateEmployee(c *fiber.Ctx) error {
	var req contract.CreateEmployeeReq
	if err := c.BodyParser(&req); err != nil {
		logger.Log.Warn("Failed to parse request body", zap.Error(err))
		return err
	}

	if err := util.ValidateStruct(&req); err != nil {
		logger.Log.Warn("Validation error", zap.Error(err))
		return err
	}

	claims := middleware.GetAuthClaims(c)
	if err := h.employeeUsecase.IsAllowedToAccess(claims, []config.Permission{config.CREATE_USER_ANY, config.CREATE_USER_ORG}, nil); err != nil {
		return err
	}

	employee, err := h.employeeUsecase.CreateEmployee(*claims.BusinessID, &req)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusCreated).JSON(util.ToSuccessResponse(employee))
}

// @Tags Employees
// @Summary Update employee
// @Description Update an existing employee
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Employee ID"
// @Param request body contract.UpdateEmployeeReq true "Update employee request"
// @Success 200 {object} util.BaseResponse{data=contract.EmployeeRes}
// @Failure 400 {object} util.BaseResponse
// @Failure 401 {object} util.BaseResponse
// @Failure 404 {object} util.BaseResponse
// @Failure 500 {object} util.BaseResponse
// @Router /employees/{id} [put]
func (h *EmployeeHandler) UpdateEmployee(c *fiber.Ctx) error {
	employeeID := c.Params("id")
	if employeeID == "" {
		return fiber.NewError(fiber.StatusBadRequest, "Employee ID is required")
	}

	var req contract.UpdateEmployeeReq
	if err := c.BodyParser(&req); err != nil {
		logger.Log.Warn("Failed to parse request body", zap.Error(err))
		return err
	}

	if err := util.ValidateStruct(&req); err != nil {
		logger.Log.Warn("Validation error", zap.Error(err))
		return err
	}

	claims := middleware.GetAuthClaims(c)
	if err := h.employeeUsecase.IsAllowedToAccess(claims, []config.Permission{config.EDIT_USER_ANY, config.EDIT_USER_ORG, config.EDIT_USER_SELF}, &employeeID); err != nil {
		return err
	}

	employee, err := h.employeeUsecase.UpdateEmployee(employeeID, *claims.BusinessID, &req)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(util.ToSuccessResponse(employee))
}

// // @Tags Employees
// // @Summary Update employee PIN
// // @Description Update employee's PIN code
// // @Accept json
// // @Produce json
// // @Security BearerAuth
// // @Param id path string true "Employee ID"
// // @Param request body contract.UpdateEmployeePinReq true "Update PIN request"
// // @Success 200 {object} util.BaseResponse
// // @Failure 400 {object} util.BaseResponse
// // @Failure 401 {object} util.BaseResponse
// // @Failure 404 {object} util.BaseResponse
// // @Failure 500 {object} util.BaseResponse
// // @Router /employees/{id}/pin [put]
// func (h *EmployeeHandler) UpdateEmployeePin(c *fiber.Ctx) error {
// 	employeeID := c.Params("id")
// 	if employeeID == "" {
// 		return fiber.NewError(fiber.StatusBadRequest, "Employee ID is required")
// 	}

// 	var req contract.UpdateEmployeePinReq
// 	if err := c.BodyParser(&req); err != nil {
// 		logger.Log.Warn("Failed to parse request body", zap.Error(err))
// 		return err
// 	}

// 	if err := util.ValidateStruct(&req); err != nil {
// 		logger.Log.Warn("Validation error", zap.Error(err))
// 		return err
// 	}

// 	claims := middleware.GetAuthClaims(c)
// 	if err := h.employeeUsecase.IsAllowedToAccess(claims, []config.Permission{config.EDIT_USER_ANY, config.EDIT_USER_ORG, config.EDIT_USER_SELF}, &employeeID); err != nil {
// 		return err
// 	}

// 	if err := h.employeeUsecase.UpdateEmployeePin(employeeID, *claims.BusinessID, &req); err != nil {
// 		return err
// 	}

// 	return c.Status(fiber.StatusOK).JSON(util.ToSuccessResponse("PIN updated successfully"))
// }

// @Tags Employees
// @Summary Get employee
// @Description Get employee details by ID
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Employee ID"
// @Success 200 {object} util.BaseResponse{data=contract.EmployeeRes}
// @Failure 401 {object} util.BaseResponse
// @Failure 404 {object} util.BaseResponse
// @Failure 500 {object} util.BaseResponse
// @Router /employees/{id} [get]
func (h *EmployeeHandler) GetEmployee(c *fiber.Ctx) error {
	employeeID := c.Params("id")
	if employeeID == "" {
		return fiber.NewError(fiber.StatusBadRequest, "Employee ID is required")
	}

	claims := middleware.GetAuthClaims(c)
	if err := h.employeeUsecase.IsAllowedToAccess(claims, []config.Permission{config.READ_USER_ANY, config.READ_USER_ORG, config.READ_USER_SELF}, &employeeID); err != nil {
		return err
	}

	employee, err := h.employeeUsecase.GetEmployee(employeeID, *claims.BusinessID)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(util.ToSuccessResponse(employee))
}

// @Tags Employees
// @Summary List employees
// @Description List all employees with pagination
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param page query int false "Page number (default: 1)"
// @Param pageSize query int false "Page size (default: 10, max: 100)"
// @Success 200 {object} util.PaginatedResponse{data=[]contract.EmployeeRes}
// @Failure 401 {object} util.BaseResponse
// @Failure 500 {object} util.BaseResponse
// @Router /employees [get]
func (h *EmployeeHandler) ListEmployees(c *fiber.Ctx) error {
	claims := middleware.GetAuthClaims(c)

	queries, err := util.ParsePaginationQueries(c)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	if err := h.employeeUsecase.IsAllowedToAccess(claims, []config.Permission{config.READ_USER_ANY, config.READ_USER_ORG}, nil); err != nil {
		return err
	}

	employees, total, err := h.employeeUsecase.ListEmployees(*claims.BusinessID, queries.Page, queries.PageSize)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(util.ToPaginatedResponse(employees, queries.Page, queries.PageSize, total))
}

// @Tags Employees
// @Summary Delete employee
// @Description Permanently delete an employee from the database
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Employee ID"
// @Success 200 {object} util.BaseResponse
// @Failure 401 {object} util.BaseResponse
// @Failure 404 {object} util.BaseResponse
// @Failure 500 {object} util.BaseResponse
// @Router /employees/{id} [delete]
func (h *EmployeeHandler) DeleteEmployee(c *fiber.Ctx) error {
	employeeID := c.Params("id")
	if employeeID == "" {
		return fiber.NewError(fiber.StatusBadRequest, "Employee ID is required")
	}

	claims := middleware.GetAuthClaims(c)
	if err := h.employeeUsecase.IsAllowedToAccess(claims, []config.Permission{config.DELETE_USER_ANY, config.DELETE_USER_ORG}, &employeeID); err != nil {
		return err
	}

	if err := h.employeeUsecase.DeleteEmployee(employeeID, *claims.BusinessID); err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(util.ToSuccessResponse(nil))
}
