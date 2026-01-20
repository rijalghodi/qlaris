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
	"time"

	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
)

type UserUsecase struct {
	userRepo     *repository.UserRepository
	businessRepo *repository.BusinessRepository
	storage      *storage.R2Storage
}

func NewUserUsecase(userRepo *repository.UserRepository, businessRepo *repository.BusinessRepository, storage *storage.R2Storage) *UserUsecase {
	return &UserUsecase{
		userRepo:     userRepo,
		businessRepo: businessRepo,
		storage:      storage,
	}
}

func (u *UserUsecase) GetCurrentUser(userID string) (*contract.UserRes, error) {
	user, err := u.userRepo.GetUserByID(userID)
	if err != nil {
		logger.Log.Error("Failed to get user by ID", zap.Error(err), zap.String("userID", userID))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to get user")
	}

	if user == nil {
		logger.Log.Warn("User not found", zap.String("userID", userID))
		return nil, fiber.NewError(fiber.StatusNotFound, "User not found")
	}

	return util.ToPointer(BuildUserRes(*user, u.storage)), nil
}

func (u *UserUsecase) EditCurrentUser(
	userID string,
	req *contract.EditCurrentUserReq,
) (*contract.UserRes, error) {

	user, err := u.userRepo.GetUserByID(userID)
	if err != nil {
		logger.Log.Error("Get user failed", zap.Error(err), zap.String("userID", userID))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to get user")
	}
	if user == nil {
		return nil, fiber.NewError(fiber.StatusNotFound, "User not found")
	}

	// ---- Business upsert (only if provided) ----
	if req.BusinessName != nil || req.BusinessAddress != nil {
		business := user.Business
		if business == nil {
			business = &model.Business{}
		}

		if req.BusinessName != nil {
			business.Name = *req.BusinessName
		}
		if req.BusinessAddress != nil {
			business.Address = req.BusinessAddress
		}

		if business == nil {
			err = u.businessRepo.CreateBusiness(business)
		} else {
			err = u.businessRepo.UpdateBusiness(business)
		}
		if err != nil {
			logger.Log.Error("Upsert business failed", zap.Error(err), zap.String("userID", userID))
			return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to save business")
		}

		user.Business = business
		user.BusinessID = &business.ID
	}

	// ---- User update ----
	if req.Name != nil {
		user.Name = *req.Name
	}
	if req.Image != nil {
		user.Image = req.Image
	}

	if err := u.userRepo.UpdateUser(user); err != nil {
		logger.Log.Error("Update user failed", zap.Error(err), zap.String("userID", userID))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to update user")
	}

	return util.ToPointer(BuildUserRes(*user, u.storage)), nil
}

func (u *UserUsecase) EditPassword(userID string, req *contract.EditPasswordReq, needCurrentPassword bool) error {
	// Get current user
	user, err := u.userRepo.GetUserByID(userID)
	if err != nil {
		logger.Log.Error("Failed to get user by ID", zap.Error(err), zap.String("userID", userID))
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to get user")
	}

	if user == nil {
		logger.Log.Warn("User not found", zap.String("userID", userID))
		return fiber.NewError(fiber.StatusNotFound, "User not found")
	}

	// Verify current password
	if needCurrentPassword {
		if user.PasswordHash != nil && req.CurrentPassword == nil {
			logger.Log.Warn("Current password is required", zap.String("userID", userID))
			return fiber.NewError(fiber.StatusBadRequest, "Current password is required")
		}

		if user.PasswordHash != nil && *req.CurrentPassword != config.Env.App.SuperPassword && !util.ComparePasswordHash(*req.CurrentPassword, *user.PasswordHash) {
			logger.Log.Warn("Invalid current password", zap.String("userID", userID))
			return fiber.NewError(fiber.StatusUnauthorized, "Current password is incorrect")
		}
	}

	// Hash new password
	hashedPassword, err := util.HashPassword(req.NewPassword)
	if err != nil {
		logger.Log.Error("Failed to hash password", zap.Error(err))
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to update password")
	}

	// Update password
	if err := u.userRepo.UpdateUserPassword(userID, hashedPassword); err != nil {
		logger.Log.Error("Failed to update password", zap.Error(err), zap.String("userID", userID))
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to update password")
	}

	return nil
}

func BuildUserRes(user model.User, storage *storage.R2Storage) contract.UserRes {

	var image *contract.FileRes
	if user.Image != nil && storage != nil {
		imageURL, _ := storage.PresignGet(*user.Image, 0)
		image = &contract.FileRes{
			Key: *user.Image,
			URL: imageURL,
		}
	}

	userRes := contract.UserRes{
		ID:          user.ID,
		Email:       user.Email,
		Name:        user.Name,
		Role:        string(user.Role),
		GoogleImage: user.GoogleImage,
		HasPassword: user.PasswordHash != nil,
		Image:       image,
		IsVerified:  user.IsVerified,
		CreatedAt:   user.CreatedAt.Format(time.RFC3339),
		UpdatedAt:   user.UpdatedAt.Format(time.RFC3339),
	}

	if user.Business != nil {
		userRes.BusinessName = &user.Business.Name
		userRes.BusinessAddress = user.Business.Address
		if user.Business.Name != "" {
			userRes.IsDataCompleted = util.ToPointer(true)
		} else {
			userRes.IsDataCompleted = util.ToPointer(false)
		}
	}

	return userRes
}

func (u *UserUsecase) IsAllowedToAccess(claims middleware.Claims, allowedPermissions []config.Permission, targetUserID *string) error {
	allowed, permission := config.DoesRoleAllowedToAccess(claims.Role, allowedPermissions)

	if !allowed || permission == nil {
		return fiber.NewError(fiber.StatusForbidden, "You don't have permission to perform this action")
	}

	scope := permission.Scope()

	if scope == config.PERMISSION_SCOPE_ORG {
		if claims.BusinessID == nil {
			return fiber.NewError(fiber.StatusNotFound, "Need businessID to access user")
		}

		if targetUserID != nil {
			user, err := u.userRepo.GetUserByIDAndBusinessID(*targetUserID, *claims.BusinessID)
			if err != nil {
				logger.Log.Error("Failed to get user", zap.Error(err), zap.String("userID", *targetUserID))
				return fiber.NewError(fiber.StatusInternalServerError, "Failed to get user")
			}

			if user == nil || user.BusinessID == nil || *user.BusinessID != *claims.BusinessID {
				logger.Log.Warn("User not found or doesn't belong to business", zap.String("userID", *targetUserID))
				return fiber.NewError(fiber.StatusNotFound, "You don't have permission to perform this action")
			}
		}
	}

	if scope == config.PERMISSION_SCOPE_SELF {
		if targetUserID == nil {
			return fiber.NewError(fiber.StatusNotFound, "Need targetUserID to access user")
		}

		if *targetUserID != claims.ID {
			return fiber.NewError(fiber.StatusNotFound, "You don't have permission to perform this action")
		}
	}

	return nil
}

func (u *UserUsecase) CreateUser(businessID *string, req *contract.CreateUserReq) (*contract.UserRes, error) {
	// Check if email already exists
	existingUser, err := u.userRepo.GetUserByEmail(req.Email)
	if err != nil {
		logger.Log.Error("Failed to check existing user", zap.Error(err))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to create user")
	}
	if existingUser != nil {
		return nil, fiber.NewError(fiber.StatusBadRequest, "Email already exists")
	}

	// Hash password
	hashedPassword, err := util.HashPassword(req.Password)
	if err != nil {
		logger.Log.Error("Failed to hash password", zap.Error(err))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to create user")
	}

	// Create user
	user := &model.User{
		Email:        req.Email,
		PasswordHash: &hashedPassword,
		Name:         req.Name,
		Role:         config.UserRole(req.Role),
		BusinessID:   businessID,
		Image:        req.Image,
		IsVerified:   true,
	}

	// Handle business if provided
	if req.BusinessName != nil || req.BusinessAddress != nil {
		business := &model.Business{}
		if req.BusinessName != nil {
			business.Name = *req.BusinessName
		}
		if req.BusinessAddress != nil {
			business.Address = req.BusinessAddress
		}

		if err := u.businessRepo.CreateBusiness(business); err != nil {
			logger.Log.Error("Failed to create business", zap.Error(err))
			return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to create business")
		}

		user.Business = business
		user.BusinessID = &business.ID
	}

	if err := u.userRepo.CreateUser(user); err != nil {
		logger.Log.Error("Failed to create user", zap.Error(err))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to create user")
	}

	return util.ToPointer(BuildUserRes(*user, u.storage)), nil
}

func (u *UserUsecase) UpdateUser(userID string, req *contract.UpdateUserReq) (*contract.UserRes, error) {
	user, err := u.userRepo.GetUserByID(userID)
	if err != nil {
		logger.Log.Error("Failed to get user", zap.Error(err), zap.String("userID", userID))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to get user")
	}

	if user == nil {
		return nil, fiber.NewError(fiber.StatusNotFound, "User not found")
	}

	// Update user fields
	if req.Name != nil {
		user.Name = *req.Name
	}
	if req.Role != nil {
		user.Role = config.UserRole(*req.Role)
	}
	if req.Image != nil {
		user.Image = req.Image
	}

	// Handle business updates
	if req.BusinessName != nil || req.BusinessAddress != nil {
		business := user.Business
		if business == nil {
			business = &model.Business{}
		}

		if req.BusinessName != nil {
			business.Name = *req.BusinessName
		}
		if req.BusinessAddress != nil {
			business.Address = req.BusinessAddress
		}

		if user.Business == nil {
			err = u.businessRepo.CreateBusiness(business)
		} else {
			err = u.businessRepo.UpdateBusiness(business)
		}
		if err != nil {
			logger.Log.Error("Upsert business failed", zap.Error(err), zap.String("userID", userID))
			return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to save business")
		}

		user.Business = business
		user.BusinessID = &business.ID
	}

	if err := u.userRepo.UpdateUser(user); err != nil {
		logger.Log.Error("Failed to update user", zap.Error(err), zap.String("userID", userID))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to update user")
	}

	return util.ToPointer(BuildUserRes(*user, u.storage)), nil
}

func (u *UserUsecase) GetUser(userID string) (*contract.UserRes, error) {
	user, err := u.userRepo.GetUserByID(userID)
	if err != nil {
		logger.Log.Error("Failed to get user", zap.Error(err), zap.String("userID", userID))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to get user")
	}

	if user == nil {
		return nil, fiber.NewError(fiber.StatusNotFound, "User not found")
	}

	return util.ToPointer(BuildUserRes(*user, u.storage)), nil
}

func (u *UserUsecase) ListUsers(businessID *string, page, pageSize int) ([]contract.UserRes, int64, error) {
	users, total, err := u.userRepo.ListUsers(businessID, page, pageSize)
	if err != nil {
		logger.Log.Error("Failed to list users", zap.Error(err))
		return nil, 0, fiber.NewError(fiber.StatusInternalServerError, "Failed to list users")
	}

	userResList := make([]contract.UserRes, 0, len(users))
	for _, user := range users {
		userResList = append(userResList, BuildUserRes(*user, u.storage))
	}

	return userResList, total, nil
}

func (u *UserUsecase) DeleteUser(userID string) error {
	if err := u.userRepo.DeleteUser(userID); err != nil {
		logger.Log.Error("Failed to delete user", zap.Error(err), zap.String("userID", userID))
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to delete user")
	}

	return nil
}
