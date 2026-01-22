package handler

import (
	"app/internal/middleware"
	"app/internal/usecase"
	"app/pkg/util"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type DashboardHandler struct {
	dashboardUsecase *usecase.DashboardUsecase
}

func NewDashboardHandler(dashboardUsecase *usecase.DashboardUsecase) *DashboardHandler {
	return &DashboardHandler{
		dashboardUsecase: dashboardUsecase,
	}
}

func (h *DashboardHandler) RegisterRoutes(app *fiber.App, db *gorm.DB) {
	dashboardGroup := app.Group("/dashboard", middleware.AuthGuard(db))
	dashboardGroup.Get("/summary", h.GetDashboardSummary)
}

// @Tags Dashboard
// @Summary Get dashboard summary
// @Description Get comprehensive dashboard statistics including today's and this week's sales, transactions, profit with comparisons, last transactions, and top products
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} util.BaseResponse{data=contract.DashboardSummaryRes}
// @Failure 401 {object} util.BaseResponse
// @Failure 404 {object} util.BaseResponse
// @Failure 500 {object} util.BaseResponse
// @Router /dashboard/summary [get]
func (h *DashboardHandler) GetDashboardSummary(c *fiber.Ctx) error {
	claims := middleware.GetAuthClaims(c)

	if claims.BusinessID == nil {
		return fiber.NewError(fiber.StatusNotFound, "Finish onboarding first")
	}

	summary, err := h.dashboardUsecase.GetDashboardSummary(*claims.BusinessID)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(util.ToSuccessResponse(summary))
}
