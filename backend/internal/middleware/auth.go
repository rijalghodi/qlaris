package middleware

import (
	"app/internal/config"
	"app/internal/model"
	"app/pkg/logger"
	"app/pkg/util"
	"slices"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type Claims struct {
	ID         string           `json:"id"`
	Type       config.TokenType `json:"type"`
	Role       config.JwtRole   `json:"role"`
	BusinessID *string          `json:"business_id"`
}

func AuthGuard(db *gorm.DB, roles ...string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Extract token from cookie
		token := extractToken(c)
		if token == "" {
			logger.Log.Warn("Token not found")
			return fiber.NewError(fiber.StatusUnauthorized, "Please authenticate")
		}

		// Verify and parse token
		jwtClaims, err := util.VerifyToken(token, config.Env.JWT.Secret)
		if err != nil {
			logger.Log.Warn("Token verification failed", "error", err)
			return fiber.NewError(fiber.StatusUnauthorized, "Please authenticate")
		}

		if config.TokenType(jwtClaims.Type) != config.TokenTypeAccess {
			logger.Log.Warn("Invalid token type")
			return fiber.NewError(fiber.StatusUnauthorized, "Please authenticate")
		}

		claims := Claims{
			ID:   jwtClaims.ID,
			Type: config.TokenType(jwtClaims.Type),
		}

		// try to get employee or user
		var employee model.Employee
		var user model.User
		if err := db.Preload("Business").First(&employee, "id = ?", jwtClaims.ID).Error; err == nil {
			claims.BusinessID = &employee.BusinessID
			claims.Role = config.JwtRole(employee.Role)
		} else if err := db.Preload("Business").First(&user, "id = ?", jwtClaims.ID).Error; err == nil {
			claims.BusinessID = user.BusinessID
			claims.Role = config.JwtRole(user.Role)
		} else {
			logger.Log.Warn("User not found", "error", err, "user_id", jwtClaims.ID)
			return fiber.NewError(fiber.StatusUnauthorized, "Please authenticate")
		}

		hasPermission := false
		if len(roles) == 0 || slices.Contains(roles, string(claims.Role)) {
			hasPermission = true
		}

		if !hasPermission {
			logger.Log.Warn("Role not allowed", "role:", claims.Role, "allowed_roles:", roles)
			return fiber.NewError(fiber.StatusForbidden, "You are not authorized to access this resource")
		}

		c.Locals("user", claims)
		return c.Next()
	}
}

func extractToken(c *fiber.Ctx) string {
	// Read token from cookie
	return c.Cookies(config.ACCESS_TOKEN_COOKIE_NAME)
}

// GetAuthClaims retrieves authenticated user claims from context
func GetAuthClaims(c *fiber.Ctx) Claims {
	claims, ok := c.Locals("user").(Claims)
	if !ok {
		return Claims{}
	}
	return claims
}
