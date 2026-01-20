package usecase

import (
	"app/internal/config"
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
