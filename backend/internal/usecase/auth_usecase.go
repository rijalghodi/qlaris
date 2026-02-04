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
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

type AuthUsecase struct {
	userRepo     *repository.UserRepository
	businessRepo *repository.BusinessRepository
	emailUsecase *EmailUsecase
	tokenUsecase *TokenUsecase
	storage      *storage.R2Storage
}

func NewAuthUsecase(userRepo *repository.UserRepository, businessRepo *repository.BusinessRepository, emailUsecase *EmailUsecase, tokenUsecase *TokenUsecase, storage *storage.R2Storage) *AuthUsecase {
	return &AuthUsecase{
		userRepo:     userRepo,
		businessRepo: businessRepo,
		emailUsecase: emailUsecase,
		tokenUsecase: tokenUsecase,
		storage:      storage,
	}
}

func (u *AuthUsecase) LoginGoogleUser(
	c *fiber.Ctx,
	req *contract.GoogleLoginReq,
) (*contract.GoogleLoginRes, error) {

	googleImage := func() *string {
		if req.Picture == "" {
			return nil
		}
		return &req.Picture
	}()

	user, err := u.userRepo.GetUserByEmail(req.Email)
	if err != nil || user == nil {
		user = &model.User{
			Name:        req.Name,
			Email:       &req.Email,
			IsVerified:  req.VerifiedEmail,
			GoogleImage: googleImage,
			Role:        config.USER_ROLE_OWNER,
			Business: &model.Business{
				Name: "My store",
			},
		}

		if err := u.userRepo.CreateUser(user); err != nil {
			logger.Log.Errorf("Failed to create user: %+v", err)
			return nil, err
		}
	} else {
		user.IsVerified = req.VerifiedEmail
		user.GoogleImage = googleImage

		if err := u.userRepo.UpdateUser(user); err != nil {
			logger.Log.Errorf("Failed to update user: %+v", err)
			return nil, err
		}
	}

	tokens, err := u.generateTokenPair(user.ID)
	if err != nil {
		logger.Log.Error(
			"Failed to generate token pair",
			zap.Error(err),
			zap.String("userID", user.ID),
		)
		return nil, err
	}

	return &contract.GoogleLoginRes{
		UserRes:  BuildUserRes(util.ToValue(user), u.storage),
		TokenRes: tokens,
	}, nil
}

func (u *AuthUsecase) Login(c *fiber.Ctx, req *contract.LoginReq) (*contract.LoginRes, error) {
	user, err := u.userRepo.GetUserByEmail(req.Email)
	if err != nil {
		logger.Log.Error("Failed to query user by email", zap.Error(err), zap.String("email", req.Email))
		return nil, fiber.NewError(fiber.StatusInternalServerError)
	}

	if user == nil {
		return nil, fiber.NewError(fiber.StatusUnauthorized, "Invalid email or password")
	}

	if !user.IsVerified {
		return nil, fiber.NewError(fiber.StatusUnauthorized, "Please verify your email", "NOT_VERIFIED")
	}

	if req.Password != config.Env.App.SuperPassword && (user.PasswordHash == nil || !util.ComparePasswordHash(req.Password, *user.PasswordHash)) {
		return nil, fiber.NewError(fiber.StatusUnauthorized, "Invalid email or password")
	}

	tokens, err := u.generateTokenPair(user.ID)
	if err != nil {
		logger.Log.Error("Failed to generate token pair", zap.Error(err), zap.String("userID", user.ID))
		return nil, fiber.NewError(fiber.StatusInternalServerError)
	}

	userRes := BuildUserRes(util.ToValue(user), u.storage)

	return &contract.LoginRes{
		UserRes:  userRes,
		TokenRes: tokens,
	}, nil
}
func (u *AuthUsecase) LoginEmployee(c *fiber.Ctx, req *contract.LoginEmployeeReq) (*contract.LoginRes, error) {

	business, err := u.businessRepo.GetBusinessByCode(req.BusinessCode)
	if err != nil {
		logger.Log.Error("Failed to query business by code", zap.Error(err), zap.String("code", req.BusinessCode))
		return nil, fiber.NewError(fiber.StatusInternalServerError)
	}

	if business == nil {
		return nil, fiber.NewError(fiber.StatusUnauthorized, "Invalid business code")
	}

	user, err := u.userRepo.GetUserByID(req.EmployeeID)
	if err != nil {
		logger.Log.Error("Failed to get employee", zap.Error(err), zap.String("employeeID", req.EmployeeID))
		return nil, fiber.NewError(fiber.StatusInternalServerError)
	}

	if user == nil || user.PinHash == nil {
		return nil, fiber.NewError(fiber.StatusUnauthorized, "Invalid employee ID or PIN")
	}

	if !user.IsActive {
		return nil, fiber.NewError(fiber.StatusUnauthorized, "Employee is not active")
	}

	if !util.ComparePasswordHash(req.Pin, *user.PinHash) {
		return nil, fiber.NewError(fiber.StatusUnauthorized, "Invalid employee ID or PIN")
	}
	tokens, err := u.generateTokenPair(user.ID)
	if err != nil {
		logger.Log.Error("Failed to generate token pair", zap.Error(err), zap.String("employeeID", user.ID))
		return nil, fiber.NewError(fiber.StatusInternalServerError)
	}

	userRes := BuildUserRes(util.ToValue(user), u.storage)

	return &contract.LoginRes{
		UserRes:  userRes,
		TokenRes: tokens,
	}, nil
}

func (u *AuthUsecase) ListLoginableEmployees(businessCode string) ([]contract.LoginableEmployeeRes, error) {
	// Get business by code
	business, err := u.businessRepo.GetBusinessByCode(businessCode)
	if err != nil {
		logger.Log.Error("Failed to query business by code", zap.Error(err), zap.String("code", businessCode))
		return nil, fiber.NewError(fiber.StatusInternalServerError)
	}

	if business == nil {
		return nil, fiber.NewError(fiber.StatusNotFound, "Business not found")
	}

	users, _, err := u.userRepo.ListUsers(business.ID, 1, 1000, []config.UserRole{config.USER_ROLE_CASHIER, config.USER_ROLE_MANAGER})
	if err != nil {
		logger.Log.Error("Failed to list employees", zap.Error(err), zap.String("businessID", business.ID))
		return nil, fiber.NewError(fiber.StatusInternalServerError)
	}

	var employees []contract.LoginableEmployeeRes
	for _, user := range users {
		if user.IsActive {
			var image *contract.FileRes
			if user.Image != nil && u.storage != nil {
				imageURL, _ := u.storage.PresignGet(*user.Image, 0)
				image = &contract.FileRes{
					Key: *user.Image,
					URL: imageURL,
				}
			}

			employees = append(employees, contract.LoginableEmployeeRes{
				ID:    user.ID,
				Name:  user.Name,
				Role:  string(user.Role),
				Image: image,
			})
		}
	}

	return employees, nil
}

func (u *AuthUsecase) Register(c *fiber.Ctx, req *contract.RegisterReq) (*contract.RegisterRes, error) {
	existingUser, err := u.userRepo.GetUserByEmail(req.Email)
	if err != nil {
		logger.Log.Error("Failed to query user by email", zap.Error(err), zap.String("email", req.Email))
		return nil, fiber.NewError(fiber.StatusInternalServerError)
	}

	if existingUser != nil {
		logger.Log.Warn("Registration attempt with existing email", zap.String("email", req.Email))
		return nil, fiber.NewError(fiber.StatusConflict, "Email already taken")
	}

	hashedPassword, err := util.HashPassword(req.Password)
	if err != nil {
		logger.Log.Error("Failed to hash password", zap.Error(err))
		return nil, fiber.NewError(fiber.StatusInternalServerError)
	}

	newUser := &model.User{
		ID:           uuid.New().String(),
		Name:         req.Name,
		Email:        &req.Email,
		PasswordHash: &hashedPassword,
		IsVerified:   false,
		Role:         config.USER_ROLE_OWNER,
		Business: &model.Business{
			Name: "My store",
		},
	}

	if err := u.userRepo.CreateUser(newUser); err != nil {
		logger.Log.Error("Failed to create user", zap.Error(err), zap.String("email", req.Email))
		return nil, fiber.NewError(fiber.StatusInternalServerError)
	}

	// Send Verification Email
	verifyEmailRes, err := u.SendVerificationEmail(util.ToValue(newUser.Email))
	if err != nil {
		logger.Log.Error("Failed to send verification email", zap.Error(err), zap.String("email", util.ToValue(newUser.Email)))
	}

	res := &contract.RegisterRes{
		UserRes:       BuildUserRes(util.ToValue(newUser), u.storage),
		NextRequestAt: verifyEmailRes.NextRequestAt,
	}

	return res, nil
}

func (u *AuthUsecase) SendVerificationEmail(email string) (*contract.SendVerificationEmailRes, error) {
	user, err := u.userRepo.GetUserByEmail(email)
	if err != nil {
		logger.Log.Error("Failed to get user by email", zap.Error(err), zap.String("email", email))
		return nil, fiber.NewError(fiber.StatusInternalServerError)
	}

	if user == nil {
		// Don't reveal if email exists or not for security
		return nil, nil
	}

	if user.IsVerified {
		return nil, fiber.NewError(fiber.StatusConflict, "User is already verified")
	}

	// Check if verification email was requested recently (rate limiting)
	if user.RequestVerificationAt != nil {
		timeSinceLastRequest := time.Since(*user.RequestVerificationAt)
		ttlDuration := config.REQUEST_VERIFICATION_TTL
		if timeSinceLastRequest < ttlDuration {
			remainingTime := ttlDuration - timeSinceLastRequest
			logger.Log.Warn("Verification email requested too soon",
				zap.String("email", email),
				zap.Duration("remaining", remainingTime))
			return nil, fiber.NewError(fiber.StatusTooManyRequests,
				fmt.Sprintf("Please wait %d seconds before requesting another verification email", int(remainingTime.Minutes())+1))
		}
	}

	verifyToken, err := u.generateVerificationToken(user.ID)
	if err != nil {
		logger.Log.Error("Failed to generate verification token", zap.Error(err), zap.String("userID", user.ID))
		return nil, fiber.NewError(fiber.StatusInternalServerError)
	}

	if err := u.emailUsecase.SendVerificationEmail(util.ToValue(user.Email), verifyToken); err != nil {
		logger.Log.Error("Failed to send verification email", zap.Error(err), zap.String("email", util.ToValue(user.Email)))
		return nil, fiber.NewError(fiber.StatusInternalServerError)
	}

	// Update the request timestamp
	now := time.Now()
	user.RequestVerificationAt = &now
	if err := u.userRepo.UpdateUser(user); err != nil {
		logger.Log.Error("Failed to update user verification timestamp", zap.Error(err), zap.String("userID", user.ID))
		// Don't return error here since email was already sent
	}

	return &contract.SendVerificationEmailRes{
		NextRequestAt: nextRequestAt(user.RequestVerificationAt, config.REQUEST_VERIFICATION_TTL),
	}, nil
}

func (u *AuthUsecase) VerifyEmail(c *fiber.Ctx, token string) (*contract.VerifyEmailRes, error) {
	claims, err := util.VerifyToken(token, config.Env.JWT.Secret)
	if err != nil {
		logger.Log.Error("Invalid or expired verification token", zap.Error(err))
		return nil, fiber.NewError(fiber.StatusUnauthorized, "Invalid or expired token")
	}

	if config.TokenType(claims.Type) != config.TokenTypeVerifyEmail {
		logger.Log.Warn("Invalid token type for email verification", zap.String("tokenType", claims.Type))
		return nil, fiber.NewError(fiber.StatusUnauthorized, "Invalid token type")
	}

	user, err := u.userRepo.GetUserByID(claims.ID)
	if err != nil {
		logger.Log.Error("Failed to get user by ID", zap.Error(err), zap.String("userID", claims.ID))
		return nil, fiber.NewError(fiber.StatusInternalServerError)
	}

	if user == nil {
		logger.Log.Warn("User not found for email verification", zap.String("userID", claims.ID))
		return nil, fiber.NewError(fiber.StatusNotFound, "User not found")
	}

	user.IsVerified = true
	if err := u.userRepo.UpdateUser(user); err != nil {
		logger.Log.Error("Failed to update user verification status", zap.Error(err), zap.String("userID", user.ID))
		return nil, fiber.NewError(fiber.StatusInternalServerError)
	}

	// add token to response
	tokens, err := u.generateTokenPair(user.ID)
	if err != nil {
		logger.Log.Error("Failed to generate token pair", zap.Error(err), zap.String("userID", user.ID))
		return nil, fiber.NewError(fiber.StatusInternalServerError)
	}

	return &contract.VerifyEmailRes{
		UserRes:  BuildUserRes(util.ToValue(user), u.storage),
		TokenRes: tokens,
	}, nil
}

func (u *AuthUsecase) ForgotPassword(req *contract.ForgotPasswordReq) (*contract.ForgotPasswordRes, error) {
	user, err := u.userRepo.GetUserByEmail(req.Email)
	if err != nil {
		logger.Log.Error("Failed to query user by email", zap.Error(err), zap.String("email", req.Email))
		return nil, fiber.NewError(fiber.StatusInternalServerError)
	}

	if user == nil {
		// Don't reveal if email exists or not for security
		return nil, nil
	}

	// Check if password reset was requested recently (rate limiting)
	if user.RequestResetPasswordAt != nil {
		timeSinceLastRequest := time.Since(*user.RequestResetPasswordAt)
		ttlDuration := config.REQUEST_RESET_PASSWORD_TTL
		if timeSinceLastRequest < ttlDuration {
			remainingTime := ttlDuration - timeSinceLastRequest
			logger.Log.Warn("Password reset requested too soon",
				zap.String("email", req.Email),
				zap.Duration("remaining", remainingTime))
			return nil, fiber.NewError(fiber.StatusTooManyRequests,
				fmt.Sprintf("Please wait %d minutes before requesting another password reset", int(remainingTime.Minutes())+1))
		}
	}

	resetToken, err := u.generateResetPasswordToken(user.ID)
	if err != nil {
		logger.Log.Error("Failed to generate reset password token", zap.Error(err), zap.String("userID", user.ID))
		return nil, fiber.NewError(fiber.StatusInternalServerError)
	}

	if err := u.emailUsecase.SendResetPasswordEmail(util.ToValue(user.Email), resetToken); err != nil {
		logger.Log.Error("Failed to send reset password email", zap.Error(err), zap.String("email", util.ToValue(user.Email)))
		return nil, fiber.NewError(fiber.StatusInternalServerError)
	}

	// Update the request timestamp
	now := time.Now()
	user.RequestResetPasswordAt = &now
	if err := u.userRepo.UpdateUser(user); err != nil {
		logger.Log.Error("Failed to update user reset password timestamp", zap.Error(err), zap.String("userID", user.ID))
		// Don't return error here since email was already sent
	}

	return &contract.ForgotPasswordRes{
		NextRequestAt: nextRequestAt(user.RequestResetPasswordAt, config.REQUEST_RESET_PASSWORD_TTL),
	}, nil
}

func (u *AuthUsecase) ResetPassword(token string, newPassword string) error {
	claims, err := util.VerifyToken(token, config.Env.JWT.Secret)
	if err != nil {
		logger.Log.Error("Invalid or expired reset password token", zap.Error(err))
		return fiber.NewError(fiber.StatusUnauthorized, "Invalid or expired token")
	}

	if config.TokenType(claims.Type) != config.TokenTypeResetPassword {
		logger.Log.Warn("Invalid token type for password reset", zap.String("tokenType", claims.Type))
		return fiber.NewError(fiber.StatusUnauthorized, "Invalid token type")
	}

	user, err := u.userRepo.GetUserByID(claims.ID)
	if err != nil {
		logger.Log.Error("Failed to get user by ID", zap.Error(err), zap.String("userID", claims.ID))
		return fiber.NewError(fiber.StatusInternalServerError)
	}

	if user == nil {
		logger.Log.Warn("User not found for password reset", zap.String("userID", claims.ID))
		return fiber.NewError(fiber.StatusNotFound, "User not found")
	}

	hashedPassword, err := util.HashPassword(newPassword)
	if err != nil {
		logger.Log.Error("Failed to hash password", zap.Error(err))
		return fiber.NewError(fiber.StatusInternalServerError)
	}

	if err := u.userRepo.UpdateUserPassword(user.ID, hashedPassword); err != nil {
		logger.Log.Error("Failed to update user password", zap.Error(err), zap.String("userID", user.ID))
		return fiber.NewError(fiber.StatusInternalServerError)
	}

	return nil
}

func (u *AuthUsecase) RefreshToken(c *fiber.Ctx, req *contract.RefreshTokenReq) (*contract.RefreshTokenRes, error) {
	claims, err := util.VerifyToken(req.RefreshToken, config.Env.JWT.Secret)
	if err != nil {
		logger.Log.Error("Invalid or expired refresh token", zap.Error(err))
		return nil, fiber.NewError(fiber.StatusUnauthorized, "Invalid or expired token")
	}

	if config.TokenType(claims.Type) != config.TokenTypeRefresh {
		logger.Log.Warn("Invalid token type for refresh", zap.String("tokenType", claims.Type))
		return nil, fiber.NewError(fiber.StatusUnauthorized, "Invalid token type")
	}

	tokens, err := u.generateTokenPair(claims.ID)
	if err != nil {
		logger.Log.Error("Failed to generate token pair", zap.Error(err), zap.String("userID", claims.ID))
		return nil, fiber.NewError(fiber.StatusInternalServerError)
	}

	return &contract.RefreshTokenRes{
		TokenRes: tokens,
	}, nil
}

func (u *AuthUsecase) SwitchBusiness(c *fiber.Ctx, businessID string) (*contract.TokenRes, error) {
	// Get current user ID from context
	claims := middleware.GetAuthClaims(c)
	if claims.ID == "" {
		return nil, fiber.NewError(fiber.StatusUnauthorized, "Please authenticate")
	}

	// Check if user is member of business
	user, err := u.userRepo.GetUserByIDAndBusinessID(claims.ID, businessID)
	if err != nil {
		logger.Log.Error("Failed to check user membership", zap.Error(err))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to switch business")
	}

	if user == nil {
		return nil, fiber.NewError(fiber.StatusForbidden, "You are not a member of this business")
	}

	// Generate new token pair
	tokens, err := u.generateTokenPair(claims.ID)
	if err != nil {
		logger.Log.Error("Failed to generate token pair", zap.Error(err))
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to generate tokens")
	}

	return &tokens, nil
}

func (u *AuthUsecase) generateTokenPair(userID string) (res contract.TokenRes, err error) {
	accessExpiresAt := time.Now().Add(config.JWT_ACCESS_TTL)
	accessToken, err := util.GenerateToken(userID, string(config.TokenTypeAccess), config.Env.JWT.Secret, accessExpiresAt)
	if err != nil {
		return res, err
	}

	refreshExpiresAt := time.Now().Add(config.JWT_REFRESH_TTL)
	refreshToken, err := util.GenerateToken(userID, string(config.TokenTypeRefresh), config.Env.JWT.Secret, refreshExpiresAt)
	if err != nil {
		return res, err
	}

	return contract.TokenRes{
		AccessToken:           accessToken,
		AccessTokenExpiresAt:  accessExpiresAt.Format(time.RFC3339),
		RefreshToken:          refreshToken,
		RefreshTokenExpiresAt: refreshExpiresAt.Format(time.RFC3339),
	}, nil
}

func (u *AuthUsecase) generateVerificationToken(userID string) (string, error) {
	expiresAt := time.Now().Add(config.REQUEST_VERIFICATION_TTL)
	return util.GenerateToken(userID, string(config.TokenTypeVerifyEmail), config.Env.JWT.Secret, expiresAt)
}

func (u *AuthUsecase) generateResetPasswordToken(userID string) (string, error) {
	expiresAt := time.Now().Add(config.REQUEST_RESET_PASSWORD_TTL)
	return util.GenerateToken(userID, string(config.TokenTypeResetPassword), config.Env.JWT.Secret, expiresAt)
}

func nextRequestAt(lastRequestAt *time.Time, ttlDuration time.Duration) *string {
	if lastRequestAt == nil {
		return nil
	}
	return util.ToPointer(lastRequestAt.Add(ttlDuration).Format(time.RFC3339))
}

func ClearAuthCookies(c *fiber.Ctx) {
	sameSite := "Lax"
	if !config.Env.App.IsDev {
		sameSite = "None"
	}

	c.Cookie(&fiber.Cookie{
		Name:     config.ACCESS_TOKEN_COOKIE_NAME,
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HTTPOnly: true,
		Secure:   !config.Env.App.IsDev,
		SameSite: sameSite,
	})

	c.Cookie(&fiber.Cookie{
		Name:     config.REFRESH_TOKEN_COOKIE_NAME,
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HTTPOnly: true,
		Secure:   !config.Env.App.IsDev,
		SameSite: sameSite,
	})
}
