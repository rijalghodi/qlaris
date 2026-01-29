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
	businessID string,
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
		businessReq := &contract.EditBusinessReq{
			Name:    req.BusinessName,
			Address: req.BusinessAddress,
		}
		if err := u.UpsertBusiness(userID, businessID, businessReq); err != nil {
			return nil, err
		}
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

// Upsert business
func (u *UserUsecase) UpsertBusiness(userID string, businessID string, req *contract.EditBusinessReq) error {
	user, err := u.userRepo.GetUserByID(userID)
	if err != nil {
		return err
	}
	if user == nil {
		return fiber.NewError(fiber.StatusNotFound, "User not found")
	}

	var business *model.Business

	// If businessID provided, user wants to update existing business
	if businessID != "" {
		// Check permission: User must be OWNER of this business
		isOwner := false
		for _, r := range user.Roles {
			if r.BusinessID == businessID && r.Role == config.USER_ROLE_OWNER {
				isOwner = true
				break
			}
		}

		if !isOwner {
			return fiber.NewError(fiber.StatusForbidden, "You don't have permission to update this business")
		}

		b, err := u.businessRepo.GetBusinessByID(businessID)
		if err != nil {
			return err
		}
		if b == nil {
			return fiber.NewError(fiber.StatusNotFound, "Business not found")
		}
		business = b
	} else {
		// Create new business
		business = &model.Business{}
	}

	if req.Name != nil {
		business.Name = *req.Name
	}
	if req.Address != nil {
		business.Address = req.Address
	}

	if business.ID == "" {
		if err := u.businessRepo.CreateBusiness(business); err != nil {
			return err
		}

		// Link as owner since it's a new business
		role := &model.UserRole{
			UserID:     userID,
			BusinessID: business.ID,
			Role:       config.USER_ROLE_OWNER,
		}
		if err := u.userRepo.CreateUserRole(role); err != nil {
			return err
		}
	} else {
		if err := u.businessRepo.UpdateBusiness(business); err != nil {
			return err
		}
	}

	return nil
}

func (u *UserUsecase) CreateUser(businessID string, req *contract.CreateUserReq) (*contract.UserRes, error) {
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
		Image:        req.Image,
		IsVerified:   true,
	}

	if err := u.userRepo.CreateUser(user); err != nil {
		logger.Log.Error("Failed to create user", zap.Error(err))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to create user")
	}

	// Create Role
	userRole := &model.UserRole{
		UserID:     user.ID,
		BusinessID: businessID,
		Role:       config.UserRole(req.Role),
	}
	if err := u.userRepo.CreateUserRole(userRole); err != nil {
		return nil, err
	}
	// Reload user with roles
	user, _ = u.userRepo.GetUserByID(user.ID)

	return util.ToPointer(BuildUserRes(*user, u.storage)), nil
}

func (u *UserUsecase) UpdateUser(userID string, businessID string, req *contract.UpdateUserReq) (*contract.UserRes, error) {
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
	if req.Image != nil {
		user.Image = req.Image
	}

	if err := u.userRepo.UpdateUser(user); err != nil {
		logger.Log.Error("Failed to update user", zap.Error(err), zap.String("userID", userID))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to update user")
	}

	// Update Role if provided
	if req.Role != nil && businessID != "" {
		// Find role for this business
		var userRole *model.UserRole
		for _, r := range user.Roles {
			if r.BusinessID == businessID {
				userRole = &r
				break
			}
		}

		if userRole != nil {
			exists := false
			for _, r := range user.Roles {
				if r.BusinessID == businessID && string(r.Role) == *req.Role {
					exists = true
					break
				}
			}

			if !exists {
				// Create new role
				newRole := &model.UserRole{
					UserID:     userID,
					BusinessID: businessID,
					Role:       config.UserRole(*req.Role),
				}
				if err := u.userRepo.CreateUserRole(newRole); err != nil {
					return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to update role")
				}
			}
		} else {
			// Create new role assignment
			newRole := &model.UserRole{
				UserID:     userID,
				BusinessID: businessID,
				Role:       config.UserRole(*req.Role),
			}
			if err := u.userRepo.CreateUserRole(newRole); err != nil {
				return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to assign role")
			}
		}
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

func (u *UserUsecase) IsAllowedToAccess(claims middleware.Claims, allowedPermissions []config.Permission, targetUserID *string) error {
	allowed, permission := config.DoesRoleAllowedToAccess(claims.Role, allowedPermissions)

	if !allowed || permission == nil {
		return fiber.NewError(fiber.StatusForbidden, "You don't have permission to perform this action")
	}

	scope := permission.Scope()

	if scope == config.PERMISSION_SCOPE_ORG {
		if claims.BusinessID == "" {
			return fiber.NewError(fiber.StatusNotFound, "Need businessID to access user")
		}

		if targetUserID != nil {
			user, err := u.userRepo.GetUserByIDAndBusinessID(*targetUserID, claims.BusinessID)
			if err != nil {
				logger.Log.Error("Failed to get user", zap.Error(err), zap.String("userID", *targetUserID))
				return fiber.NewError(fiber.StatusInternalServerError, "Failed to get user")
			}

			if user == nil {
				logger.Log.Warn("User not found or doesn't belong to business", zap.String("userID", *targetUserID))
				return fiber.NewError(fiber.StatusNotFound, "You don't have permission to perform this action")
			}

			// Verify user belongs to business
			belongs := false
			for _, r := range user.Roles {
				if r.BusinessID == claims.BusinessID {
					belongs = true
					break
				}
			}
			if !belongs {
				return fiber.NewError(fiber.StatusNotFound, "User not found in this business")
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

func BuildUserRes(user model.User, storage *storage.R2Storage) contract.UserRes {
	var image *contract.FileRes
	if user.Image != nil && storage != nil {
		imageURL, _ := storage.PresignGet(*user.Image, 0)
		image = &contract.FileRes{
			Key: *user.Image,
			URL: imageURL,
		}
	}

	roles := []contract.RoleRes{}
	for _, role := range user.Roles {
		roles = append(roles, contract.RoleRes{
			Role:         string(role.Role),
			BusinessName: role.Business.Name,
		})
	}

	userRes := contract.UserRes{
		ID:          user.ID,
		Email:       user.Email,
		Name:        user.Name,
		Roles:       roles,
		GoogleImage: user.GoogleImage,
		HasPassword: user.PasswordHash != nil,
		Image:       image,
		IsVerified:  user.IsVerified,
		CreatedAt:   user.CreatedAt.Format(time.RFC3339),
		UpdatedAt:   user.UpdatedAt.Format(time.RFC3339),
	}

	return userRes
}
