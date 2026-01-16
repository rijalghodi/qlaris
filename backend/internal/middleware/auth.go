package middleware

import (
	"app/internal/config"
	"app/internal/model"
	"app/pkg/util"
	"slices"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type Claims struct {
	util.JWTClaims
	BusinessID string `json:"business_id"`
}

func AuthGuard(db *gorm.DB, roles ...string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Extract token from Authorization header
		token := extractToken(c)
		if token == "" {
			return fiber.NewError(fiber.StatusUnauthorized, "Please authenticate")
		}

		// Verify and parse token
		jwtClaims, err := util.VerifyToken(token, config.Env.JWT.Secret)
		if err != nil {
			return fiber.NewError(fiber.StatusUnauthorized, "Please authenticate")
		}

		claims := Claims{
			JWTClaims: jwtClaims,
		}

		// Check role permissions if roles are specified
		if len(roles) > 0 && !slices.Contains(roles, claims.Role) {
			return fiber.NewError(fiber.StatusForbidden, "You are not authorized to access this resource")
		}

		// get user from DB
		business := &model.Business{}
		if err := db.First(business, "owner_id = ?", claims.ID).Error; err != nil {
			return fiber.NewError(fiber.StatusUnauthorized, "Please authenticate")
		}

		claims.BusinessID = business.ID

		c.Locals("user", claims)
		return c.Next()
	}
}

func extractToken(c *fiber.Ctx) string {
	// Read token from cookie
	return c.Cookies("qlaris.access-token")
}

// GetAuthClaims retrieves authenticated user claims from context
func GetAuthClaims(c *fiber.Ctx) Claims {
	claims, ok := c.Locals("user").(Claims)
	if !ok {
		return Claims{}
	}
	return claims
}
