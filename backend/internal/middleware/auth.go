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

type UserRole struct {
	Role       config.UserRole `json:"role"`
	BusinessID string          `json:"business_id"`
}

type Claims struct {
	ID         string          `json:"id"`
	Roles      []UserRole      `json:"roles"`
	Type       string          `json:"type"`
	Role       config.UserRole `json:"role"`
	BusinessID string          `json:"business_id"`
}

func AuthGuard(db *gorm.DB, roles ...string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Extract token from Authorization header
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

		claims := Claims{
			ID:   jwtClaims.ID,
			Type: jwtClaims.Type,
		}

		// get user from DB with roles
		user := &model.User{}
		if err := db.Preload("Roles").First(user, "id = ?", claims.ID).Error; err != nil {
			logger.Log.Warn("User not found", "error", err, "user_id", claims.ID)
			return fiber.NewError(fiber.StatusUnauthorized, "Please authenticate")
		}

		// Map model roles to claims roles
		var userRoles []UserRole
		for _, r := range user.Roles {
			userRoles = append(userRoles, UserRole{
				Role:       r.Role,
				BusinessID: r.BusinessID,
			})
		}
		claims.Roles = userRoles

		if len(userRoles) == 0 {
			return fiber.NewError(fiber.StatusUnauthorized, "Please authenticate")
		}

		// find role with current business id
		for _, userRole := range userRoles {
			if userRole.BusinessID == jwtClaims.ActiveBusinessID {
				claims.Role = userRole.Role
				claims.BusinessID = userRole.BusinessID
				break
			}
		}

		hasPermission := false
		if slices.Contains(roles, string(claims.Role)) {
			hasPermission = true
		}

		if !hasPermission {
			logger.Log.Warn("Role not allowed", "roles:", claims.Roles, "allowed_roles:", roles)
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
