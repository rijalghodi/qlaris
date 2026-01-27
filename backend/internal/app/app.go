package app

import (
	"app/internal/config"
	"app/internal/middleware"
	"app/pkg/logger"
	"context"
	"fmt"
	"os"
	"os/signal"
	"syscall"

	_ "app/docs" // Import docs for Swagger

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/compress"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/helmet"
	"github.com/gofiber/swagger"
	"go.uber.org/zap"
)

// Run starts the application server
func Run() error {
	logger.Init(logger.Config{
		Level:        config.Env.Logger.Level,
		Format:       config.Env.Logger.Format,
		EnableCaller: config.Env.Logger.EnableCaller,
	})

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	app := setupFiberApp()

	if err := setupRoutes(ctx, app); err != nil {
		logger.Log.Error("Failed to setup routes", zap.Error(err))
		return err
	}

	address := fmt.Sprintf("%s:%d", config.Env.App.Host, config.Env.App.Port)

	// Start server and handle graceful shutdown
	serverErrors := make(chan error, 1)
	go startServer(app, address, serverErrors)
	handleGracefulShutdown(ctx, app, serverErrors)

	return nil
}

func setupFiberApp() *fiber.App {
	app := fiber.New(config.FiberConfig())

	// Middleware setup
	app.Use("/auth", middleware.LimiterConfig())
	app.Use(middleware.LoggerConfig())
	app.Use(helmet.New())
	app.Use(compress.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins:     config.Env.Cors.Origins,
		AllowHeaders:     "Content-Type,Authorization,Accept,Origin,X-Requested-With",
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS",
		AllowCredentials: true,
	}))
	app.Use(middleware.RecoverConfig())

	return app
}

func setupRoutes(ctx context.Context, app *fiber.App) error {
	docs := app.Group("/docs")
	docs.Get("/*", swagger.HandlerDefault)

	InjectHTTPHandlers(ctx, app)
	return nil
}

func startServer(app *fiber.App, address string, errs chan<- error) {
	if err := app.Listen(address); err != nil {
		errs <- fmt.Errorf("error starting server: %w", err)
	}
}

// func closeDatabase(db *gorm.DB) {
// 	if db == nil {
// 		return
// 	}

// 	sqlDB, errDB := db.DB()
// 	if errDB != nil {
// 		logger.Log.Error("Error getting database instance", zap.Error(errDB))
// 		return
// 	}

// 	if err := sqlDB.Close(); err != nil {
// 		logger.Log.Error("Error closing database connection", zap.Error(err))
// 	} else {
// 		logger.Log.Info("Database connection closed successfully")
// 	}
// }

func handleGracefulShutdown(ctx context.Context, app *fiber.App, serverErrors <-chan error) {
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)

	select {
	case err := <-serverErrors:
		logger.Log.Error("Server error", zap.Error(err))
	case <-quit:
		logger.Log.Info("Shutting down server...")
		if err := app.Shutdown(); err != nil {
			logger.Log.Error("Error during server shutdown", zap.Error(err))
		}
	case <-ctx.Done():
		logger.Log.Info("Server exiting due to context cancellation")
	}

	logger.Log.Info("Server exited")
}
