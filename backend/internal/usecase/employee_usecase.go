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

	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
)

type EmployeeUsecase struct {
	employeeRepo *repository.EmployeeRepository
	storage      *storage.R2Storage
}

func NewEmployeeUsecase(employeeRepo *repository.EmployeeRepository, storage *storage.R2Storage) *EmployeeUsecase {
	return &EmployeeUsecase{
		employeeRepo: employeeRepo,
		storage:      storage,
	}
}

func (u *EmployeeUsecase) CreateEmployee(businessID string, req *contract.CreateEmployeeReq) (*contract.EmployeeRes, error) {
	// Hash PIN
	hashedPin, err := util.HashPassword(req.Pin)
	if err != nil {
		logger.Log.Error("Failed to hash PIN", zap.Error(err))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to create employee")
	}

	// Create employee
	employee := &model.Employee{
		Name:       req.Name,
		Role:       config.EmployeeRole(req.Role),
		BusinessID: businessID,
		PinHash:    hashedPin,
		Image:      req.Image,
	}

	if err := u.employeeRepo.CreateEmployee(employee); err != nil {
		logger.Log.Error("Failed to create employee", zap.Error(err))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to create employee")
	}

	// Reload with relations
	employee, _ = u.employeeRepo.GetEmployeeByID(employee.ID)

	return util.ToPointer(BuildEmployeeRes(*employee, u.storage)), nil
}

func (u *EmployeeUsecase) UpdateEmployee(employeeID, businessID string, req *contract.UpdateEmployeeReq) (*contract.EmployeeRes, error) {
	employee, err := u.employeeRepo.GetEmployeeByIDAndBusinessID(employeeID, businessID)
	if err != nil {
		logger.Log.Error("Failed to get employee", zap.Error(err), zap.String("employeeID", employeeID))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to get employee")
	}

	if employee == nil {
		return nil, fiber.NewError(fiber.StatusNotFound, "Employee not found")
	}

	// Update fields
	if req.Name != nil {
		employee.Name = *req.Name
	}
	if req.Role != nil {
		employee.Role = config.EmployeeRole(*req.Role)
	}
	if req.Image != nil {
		employee.Image = req.Image
	}
	if req.Pin != nil {
		hashedPin, err := util.HashPassword(*req.Pin)
		if err != nil {
			logger.Log.Error("Failed to hash PIN", zap.Error(err))
			return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to create employee")
		}
		employee.PinHash = hashedPin
	}

	if err := u.employeeRepo.UpdateEmployee(employee); err != nil {
		logger.Log.Error("Failed to update employee", zap.Error(err), zap.String("employeeID", employeeID))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to update employee")
	}

	return util.ToPointer(BuildEmployeeRes(*employee, u.storage)), nil
}

// func (u *EmployeeUsecase) UpdateEmployeePin(employeeID, businessID string, req *contract.UpdateEmployeePinReq) error {
// 	employee, err := u.employeeRepo.GetEmployeeByIDAndBusinessID(employeeID, businessID)
// 	if err != nil {
// 		logger.Log.Error("Failed to get employee", zap.Error(err), zap.String("employeeID", employeeID))
// 		return fiber.NewError(fiber.StatusInternalServerError, "Failed to get employee")
// 	}

// 	if employee == nil {
// 		return fiber.NewError(fiber.StatusNotFound, "Employee not found")
// 	}

// 	// Hash new PIN
// 	hashedPin, err := util.HashPassword(req.Pin)
// 	if err != nil {
// 		logger.Log.Error("Failed to hash PIN", zap.Error(err))
// 		return fiber.NewError(fiber.StatusInternalServerError, "Failed to update PIN")
// 	}

// 	if err := u.employeeRepo.UpdateEmployeePin(employeeID, hashedPin); err != nil {
// 		logger.Log.Error("Failed to update PIN", zap.Error(err), zap.String("employeeID", employeeID))
// 		return fiber.NewError(fiber.StatusInternalServerError, "Failed to update PIN")
// 	}

// 	return nil
// }

func (u *EmployeeUsecase) GetEmployee(employeeID, businessID string) (*contract.EmployeeRes, error) {
	employee, err := u.employeeRepo.GetEmployeeByIDAndBusinessID(employeeID, businessID)
	if err != nil {
		logger.Log.Error("Failed to get employee", zap.Error(err), zap.String("employeeID", employeeID))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to get employee")
	}

	if employee == nil {
		return nil, fiber.NewError(fiber.StatusNotFound, "Employee not found")
	}

	return util.ToPointer(BuildEmployeeRes(*employee, u.storage)), nil
}

func (u *EmployeeUsecase) ListEmployees(businessID string, page, pageSize int) ([]contract.EmployeeRes, int64, error) {
	employees, total, err := u.employeeRepo.ListEmployees(businessID, page, pageSize)
	if err != nil {
		logger.Log.Error("Failed to list employees", zap.Error(err))
		return nil, 0, fiber.NewError(fiber.StatusInternalServerError, "Failed to list employees")
	}

	employeeResList := make([]contract.EmployeeRes, 0, len(employees))
	for _, employee := range employees {
		employeeResList = append(employeeResList, BuildEmployeeRes(*employee, u.storage))
	}

	return employeeResList, total, nil
}

func (u *EmployeeUsecase) DeleteEmployee(employeeID, businessID string) error {
	employee, err := u.employeeRepo.GetEmployeeByIDAndBusinessID(employeeID, businessID)
	if err != nil {
		logger.Log.Error("Failed to get employee", zap.Error(err), zap.String("employeeID", employeeID))
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to get employee")
	}

	if employee == nil {
		return fiber.NewError(fiber.StatusNotFound, "Employee not found")
	}

	if err := u.employeeRepo.DeleteEmployee(employeeID); err != nil {
		logger.Log.Error("Failed to delete employee", zap.Error(err), zap.String("employeeID", employeeID))
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to delete employee")
	}

	return nil
}

func (u *EmployeeUsecase) IsAllowedToAccess(claims middleware.Claims, allowedPermissions []config.Permission, targetEmployeeID *string) error {
	allowed, permission := config.DoesRoleAllowedToAccess(claims.Role, allowedPermissions)

	if !allowed || permission == nil {
		return fiber.NewError(fiber.StatusForbidden, "You don't have permission to perform this action")
	}

	scope := permission.Scope()

	if scope == config.PERMISSION_SCOPE_ORG {
		if claims.BusinessID == nil {
			return fiber.NewError(fiber.StatusNotFound, "Need businessID to access employee")
		}

		if targetEmployeeID != nil {
			employee, err := u.employeeRepo.GetEmployeeByIDAndBusinessID(*targetEmployeeID, *claims.BusinessID)
			if err != nil {
				logger.Log.Error("Failed to get employee", zap.Error(err), zap.String("employeeID", *targetEmployeeID))
				return fiber.NewError(fiber.StatusInternalServerError, "Failed to get employee")
			}

			if employee == nil {
				logger.Log.Warn("Employee not found or doesn't belong to business", zap.String("employeeID", *targetEmployeeID))
				return fiber.NewError(fiber.StatusNotFound, "You don't have permission to perform this action")
			}
		}
	}

	if scope == config.PERMISSION_SCOPE_SELF {
		if targetEmployeeID == nil {
			return fiber.NewError(fiber.StatusNotFound, "Need targetEmployeeID to access employee")
		}

		if *targetEmployeeID != claims.ID {
			return fiber.NewError(fiber.StatusNotFound, "You don't have permission to perform this action")
		}
	}

	return nil
}

func BuildEmployeeRes(employee model.Employee, storage *storage.R2Storage) contract.EmployeeRes {
	var image *contract.FileRes
	if employee.Image != nil && storage != nil {
		imageURL, _ := storage.PresignGet(*employee.Image, 0)
		image = &contract.FileRes{
			Key: *employee.Image,
			URL: imageURL,
		}
	}

	var business *contract.BusinessRes
	if employee.Business.ID != "" {
		business = util.ToPointer(BuildBusinessRes(employee.Business, storage))
	}

	return contract.EmployeeRes{
		ID:        employee.ID,
		Name:      employee.Name,
		Role:      string(employee.Role),
		Business:  business,
		Image:     image,
		IsActive:  employee.IsActive,
		CreatedAt: employee.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt: employee.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}
