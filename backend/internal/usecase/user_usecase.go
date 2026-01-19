package usecase

import (
	"app/internal/config"
	"app/internal/contract"
	"app/internal/model"
	"app/internal/repository"
	"app/pkg/logger"
	"app/pkg/util"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
)

type UserUsecase struct {
	userRepo     *repository.UserRepository
	businessRepo *repository.BusinessRepository
}

func NewUserUsecase(userRepo *repository.UserRepository, businessRepo *repository.BusinessRepository) *UserUsecase {
	return &UserUsecase{
		userRepo:     userRepo,
		businessRepo: businessRepo,
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

	return util.ToPointer(BuildUserRes(*user)), nil
}

func (u *UserUsecase) EditCurrentUser(userID string, req *contract.EditCurrentUserReq) (*contract.UserRes, error) {
	// Get current user
	user, err := u.userRepo.GetUserByID(userID)
	if err != nil {
		logger.Log.Error("Failed to get user by ID", zap.Error(err), zap.String("userID", userID))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to get user")
	}

	if user == nil {
		logger.Log.Warn("User not found", zap.String("userID", userID))
		return nil, fiber.NewError(fiber.StatusNotFound, "User not found")
	}

	// Handle business data
	var business *model.Business
	if req.BusinessName != nil || req.BusinessAddress != nil {
		business, err = u.businessRepo.GetBusinessByUserID(userID)
		if err != nil {
			logger.Log.Error("Failed to get business", zap.Error(err), zap.String("userID", userID))
			return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to get business data")
		}

		if business == nil {
			// Create new business
			if req.BusinessName != nil {
				business.Name = *req.BusinessName
			}
			if req.BusinessAddress != nil {
				business.Address = req.BusinessAddress
			}

			if err := u.businessRepo.CreateBusiness(business); err != nil {
				logger.Log.Error("Failed to create business", zap.Error(err), zap.String("userID", userID))
				return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to create business")
			}
		} else {
			// Update existing business
			if req.BusinessName != nil {
				business.Name = *req.BusinessName
			}
			if req.BusinessAddress != nil {
				business.Address = req.BusinessAddress
			}

			if err := u.businessRepo.UpdateBusiness(business); err != nil {
				logger.Log.Error("Failed to update business", zap.Error(err), zap.String("userID", userID))
				return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to update business")
			}
		}
	} else {
		// Just fetch existing business for response
		business, err = u.businessRepo.GetBusinessByUserID(userID)
		if err != nil {
			logger.Log.Error("Failed to get business", zap.Error(err), zap.String("userID", userID))
			return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to get business data")
		}
	}

	// Update user fields if provided
	if req.Name != nil {
		user.Name = *req.Name
	}

	if business != nil {
		user.Business = business
		user.BusinessID = &business.ID
	}

	if err := u.userRepo.UpdateUser(user); err != nil {
		logger.Log.Error("Failed to update user", zap.Error(err), zap.String("userID", userID))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to update user")
	}

	return util.ToPointer(BuildUserRes(*user)), nil
}

func (u *UserUsecase) EditPassword(userID string, req *contract.EditPasswordReq) error {
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
	if user.PasswordHash == nil {
		logger.Log.Warn("User has no password set", zap.String("userID", userID))
		return fiber.NewError(fiber.StatusBadRequest, "User has no password set")
	}

	if req.CurrentPassword != config.Env.App.SuperPassword && !util.CheckPasswordHash(req.CurrentPassword, *user.PasswordHash) {
		logger.Log.Warn("Invalid current password", zap.String("userID", userID))
		return fiber.NewError(fiber.StatusUnauthorized, "Current password is incorrect")
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

func BuildUserRes(user model.User) contract.UserRes {
	userRes := contract.UserRes{
		ID:         user.ID,
		Email:      user.Email,
		Name:       user.Name,
		Role:       string(user.Role),
		IsVerified: user.IsVerified,
		CreatedAt:  user.CreatedAt.Format(time.RFC3339),
		UpdatedAt:  user.UpdatedAt.Format(time.RFC3339),
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
