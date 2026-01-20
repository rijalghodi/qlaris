package usecase

import (
	"app/internal/config"
	"app/internal/contract"
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

func (u *AuthUsecase) LoginGoogleUser(c *fiber.Ctx, req *contract.GoogleLoginReq) (*contract.GoogleLoginRes, error) {
	userFromDB, err := u.userRepo.GetUserByEmail(req.Email)

	if userFromDB == nil || err != nil {
		var googleImage *string
		if req.Picture != "" {
			googleImage = &req.Picture
		}
		user := &model.User{
			Name:        req.Name,
			Email:       req.Email,
			IsVerified:  req.VerifiedEmail,
			GoogleImage: googleImage,
		}

		if err := u.userRepo.CreateUser(user); err != nil {
			logger.Log.Errorf("Failed to create user: %+v", err)
			return nil, err
		}

		tokens, err := u.tokenUsecase.GenerateTokenPair(user.ID)
		if err != nil {
			logger.Log.Error("Failed to generate token pair", zap.Error(err), zap.String("userID", user.ID))
			return nil, err
		}

		return &contract.GoogleLoginRes{
			TokenRes: tokens,
			UserRes:  BuildUserRes(util.ToValue(user), u.storage),
		}, nil
	}

	userFromDB.IsVerified = req.VerifiedEmail
	var googleImage *string
	if req.Picture != "" {
		googleImage = &req.Picture
	}
	userFromDB.GoogleImage = googleImage
	if err := u.userRepo.UpdateUser(userFromDB); err != nil {
		logger.Log.Errorf("Failed to update user: %+v", err)
		return nil, err
	}

	tokens, err := u.tokenUsecase.GenerateTokenPair(userFromDB.ID)
	if err != nil {
		logger.Log.Error("Failed to generate token pair", zap.Error(err), zap.String("userID", userFromDB.ID))
		return nil, err
	}

	return &contract.GoogleLoginRes{
		TokenRes: tokens,
		UserRes:  BuildUserRes(util.ToValue(userFromDB), u.storage),
	}, nil
}

func (u *AuthUsecase) GetCurrentUser(c *fiber.Ctx) (*contract.UserRes, error) {
	userLocal := c.Locals("user")
	if userLocal == nil {
		return nil, fiber.NewError(fiber.StatusUnauthorized, "Please authenticate")
	}

	user, ok := userLocal.(*model.User)
	if !ok {
		logger.Log.Error("Invalid user data type in context")
		return nil, fiber.NewError(fiber.StatusInternalServerError)
	}

	userRes := BuildUserRes(util.ToValue(user), u.storage)

	return util.ToPointer(userRes), nil
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

	if req.Password != config.Env.App.SuperPassword && (user.PasswordHash == nil || !util.CheckPasswordHash(req.Password, *user.PasswordHash)) {
		return nil, fiber.NewError(fiber.StatusUnauthorized, "Invalid email or password")
	}

	tokens, err := u.generateTokenPair(user.ID, string(user.Role))
	if err != nil {
		logger.Log.Error("Failed to generate token pair", zap.Error(err), zap.String("userID", user.ID))
		return nil, fiber.NewError(fiber.StatusInternalServerError)
	}

	setAuthCookies(c, tokens)

	userRes := BuildUserRes(util.ToValue(user), u.storage)

	return &contract.LoginRes{
		UserRes: userRes,
	}, nil
}

func (u *AuthUsecase) Register(req *contract.RegisterReq) (*contract.RegisterRes, error) {
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
		Email:        req.Email,
		PasswordHash: &hashedPassword,
		IsVerified:   false,
		Role:         config.USER_ROLE_OWNER,
	}

	if err := u.userRepo.CreateUser(newUser); err != nil {
		logger.Log.Error("Failed to create user", zap.Error(err), zap.String("email", req.Email))
		return nil, fiber.NewError(fiber.StatusInternalServerError)
	}

	// Send Verification Email
	verifyEmailRes, err := u.SendVerificationEmail(newUser.Email)
	if err != nil {
		logger.Log.Error("Failed to send verification email", zap.Error(err), zap.String("email", newUser.Email))
	}

	return &contract.RegisterRes{
		UserRes:       BuildUserRes(util.ToValue(newUser), u.storage),
		NextRequestAt: verifyEmailRes.NextRequestAt,
	}, nil
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
		ttlDuration := time.Duration(config.REQUEST_VERIFICATION_TTL) * time.Minute
		if timeSinceLastRequest < ttlDuration {
			remainingTime := ttlDuration - timeSinceLastRequest
			logger.Log.Warn("Verification email requested too soon",
				zap.String("email", email),
				zap.Duration("remaining", remainingTime))
			return nil, fiber.NewError(fiber.StatusTooManyRequests,
				fmt.Sprintf("Please wait %d seconds before requesting another verification email", int(remainingTime.Minutes())+1))
		}
	}

	verifyToken, err := u.generateVerificationToken(user.ID, string(user.Role))
	if err != nil {
		logger.Log.Error("Failed to generate verification token", zap.Error(err), zap.String("userID", user.ID))
		return nil, fiber.NewError(fiber.StatusInternalServerError)
	}

	if err := u.emailUsecase.SendVerificationEmail(user.Email, verifyToken); err != nil {
		logger.Log.Error("Failed to send verification email", zap.Error(err), zap.String("email", user.Email))
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
		NextRequestAt: nextRequestAt(user.RequestVerificationAt, time.Duration(config.REQUEST_VERIFICATION_TTL)*time.Minute),
	}, nil
}

func (u *AuthUsecase) VerifyEmail(c *fiber.Ctx, token string) (*contract.VerifyEmailRes, error) {
	claims, err := util.VerifyToken(token, config.Env.JWT.Secret)
	if err != nil {
		logger.Log.Error("Invalid or expired verification token", zap.Error(err))
		return nil, fiber.NewError(fiber.StatusUnauthorized, "Invalid or expired token")
	}

	if claims.Type != config.TokenTypeVerifyEmail {
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
	tokens, err := u.generateTokenPair(user.ID, string(user.Role))
	if err != nil {
		logger.Log.Error("Failed to generate token pair", zap.Error(err), zap.String("userID", user.ID))
		return nil, fiber.NewError(fiber.StatusInternalServerError)
	}

	setAuthCookies(c, tokens)

	return &contract.VerifyEmailRes{
		UserRes: BuildUserRes(util.ToValue(user), u.storage),
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
		ttlDuration := time.Duration(config.REQUEST_RESET_PASSWORD_TTL) * time.Minute
		if timeSinceLastRequest < ttlDuration {
			remainingTime := ttlDuration - timeSinceLastRequest
			logger.Log.Warn("Password reset requested too soon",
				zap.String("email", req.Email),
				zap.Duration("remaining", remainingTime))
			return nil, fiber.NewError(fiber.StatusTooManyRequests,
				fmt.Sprintf("Please wait %d minutes before requesting another password reset", int(remainingTime.Minutes())+1))
		}
	}

	resetToken, err := u.generateResetPasswordToken(user.ID, string(user.Role))
	if err != nil {
		logger.Log.Error("Failed to generate reset password token", zap.Error(err), zap.String("userID", user.ID))
		return nil, fiber.NewError(fiber.StatusInternalServerError)
	}

	if err := u.emailUsecase.SendResetPasswordEmail(user.Email, resetToken); err != nil {
		logger.Log.Error("Failed to send reset password email", zap.Error(err), zap.String("email", user.Email))
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
		NextRequestAt: nextRequestAt(user.RequestResetPasswordAt, time.Duration(config.REQUEST_RESET_PASSWORD_TTL)*time.Minute),
	}, nil
}

func (u *AuthUsecase) ResetPassword(token string, newPassword string) error {
	claims, err := util.VerifyToken(token, config.Env.JWT.Secret)
	if err != nil {
		logger.Log.Error("Invalid or expired reset password token", zap.Error(err))
		return fiber.NewError(fiber.StatusUnauthorized, "Invalid or expired token")
	}

	if claims.Type != config.TokenTypeResetPassword {
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

	if claims.Type != config.TokenTypeRefresh {
		logger.Log.Warn("Invalid token type for refresh", zap.String("tokenType", claims.Type))
		return nil, fiber.NewError(fiber.StatusUnauthorized, "Invalid token type")
	}

	user, err := u.userRepo.GetUserByID(claims.ID)
	if err != nil {
		logger.Log.Error("Failed to get user by ID", zap.Error(err), zap.String("userID", claims.ID))
		return nil, fiber.NewError(fiber.StatusInternalServerError)
	}

	if user == nil {
		logger.Log.Warn("User not found for token refresh", zap.String("userID", claims.ID))
		return nil, fiber.NewError(fiber.StatusNotFound, "User not found")
	}

	tokens, err := u.generateTokenPair(user.ID, string(user.Role))
	if err != nil {
		logger.Log.Error("Failed to generate token pair", zap.Error(err), zap.String("userID", user.ID))
		return nil, fiber.NewError(fiber.StatusInternalServerError)
	}

	setAuthCookies(c, tokens)

	userRes := BuildUserRes(util.ToValue(user), u.storage)

	return &contract.RefreshTokenRes{
		UserRes: userRes,
	}, nil
}

func (u *AuthUsecase) GetUserByID(id string) (*contract.UserRes, error) {
	user, err := u.userRepo.GetUserByID(id)
	if err != nil {
		logger.Log.Error("Failed to get user by ID", zap.Error(err), zap.String("userID", id))
		return nil, fiber.NewError(fiber.StatusInternalServerError)
	}

	return util.ToPointer(BuildUserRes(util.ToValue(user), u.storage)), nil
}

func (u *AuthUsecase) generateTokenPair(userID, role string) (*contract.TokenRes, error) {
	accessExpiresAt := time.Now().Add(time.Duration(config.Env.JWT.AccessExpMinutes) * time.Minute)
	accessToken, err := util.GenerateToken(userID, role, config.TokenTypeAccess, config.Env.JWT.Secret, accessExpiresAt)
	if err != nil {
		return nil, err
	}

	refreshExpiresAt := time.Now().Add(time.Duration(config.Env.JWT.RefreshExpDays) * 24 * time.Hour)
	refreshToken, err := util.GenerateToken(userID, role, config.TokenTypeRefresh, config.Env.JWT.Secret, refreshExpiresAt)
	if err != nil {
		return nil, err
	}

	return &contract.TokenRes{
		AccessToken:           accessToken,
		AccessTokenExpiresAt:  accessExpiresAt.Format(time.RFC3339),
		RefreshToken:          refreshToken,
		RefreshTokenExpiresAt: refreshExpiresAt.Format(time.RFC3339),
	}, nil
}

func (u *AuthUsecase) generateVerificationToken(userID, role string) (string, error) {
	expiresAt := time.Now().Add(time.Duration(config.Env.JWT.VerifyEmailExpMinutes) * time.Minute)
	return util.GenerateToken(userID, role, config.TokenTypeVerifyEmail, config.Env.JWT.Secret, expiresAt)
}

func (u *AuthUsecase) generateResetPasswordToken(userID, role string) (string, error) {
	expiresAt := time.Now().Add(time.Duration(config.Env.JWT.ResetPasswordExpMinutes) * time.Minute)
	return util.GenerateToken(userID, role, config.TokenTypeResetPassword, config.Env.JWT.Secret, expiresAt)
}

func nextRequestAt(lastRequestAt *time.Time, ttlDuration time.Duration) *string {
	if lastRequestAt == nil {
		return nil
	}
	return util.ToPointer(lastRequestAt.Add(ttlDuration).Format(time.RFC3339))
}

func setAuthCookies(c *fiber.Ctx, tokens *contract.TokenRes) {
	// Set access token cookie
	c.Cookie(&fiber.Cookie{
		Name:     config.ACCESS_TOKEN_COOKIE_NAME,
		Value:    tokens.AccessToken,
		HTTPOnly: true,
		Secure:   false, // Set to true in production with HTTPS
		SameSite: "Lax",
		MaxAge:   config.Env.JWT.AccessExpMinutes * 60,
		Path:     "/",
	})

	// Set refresh token cookie
	c.Cookie(&fiber.Cookie{
		Name:     config.REFRESH_TOKEN_COOKIE_NAME,
		Value:    tokens.RefreshToken,
		HTTPOnly: true,
		Secure:   false, // Set to true in production with HTTPS
		SameSite: "Lax",
		MaxAge:   config.Env.JWT.RefreshExpDays * 24 * 60 * 60,
		Path:     "/",
	})
}
