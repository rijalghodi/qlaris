package app

import (
	"app/internal/config"
	"app/internal/handler"
	"app/internal/repository"
	"app/internal/usecase"
	"app/pkg/logger"
	"app/pkg/postgres"
	"app/pkg/storage"
	"context"

	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

func InjectLibraries() (*gorm.DB, *storage.R2Storage, error) {
	// Postgres
	db, err := postgres.NewPostgres(postgres.PostgresConfig{
		MigrationDirectory: config.Env.Postgres.MigrationDirectory,
		MigrationDialect:   config.Env.Postgres.MigrationDialect,
		Host:               config.Env.Postgres.Host,
		User:               config.Env.Postgres.User,
		Password:           config.Env.Postgres.Password,
		Port:               config.Env.Postgres.Port,
		DBName:             config.Env.Postgres.DBName,
		SSLMode:            config.Env.Postgres.SSLMode,
		MaxOpenConns:       config.Env.Postgres.MaxOpenConns,
		MaxIdleConns:       config.Env.Postgres.MaxIdleConns,
		ConnMaxLifetime:    config.Env.Postgres.ConnMaxLifetime,
		ConnMaxIdleTime:    config.Env.Postgres.ConnMaxIdleTime,
	})
	if err != nil {
		logger.Log.Error("Failed to connect to database", zap.Error(err))
		return nil, nil, err
	}

	// Storage
	storage := storage.NewR2Storage(
		config.Env.Storage.Endpoint,
		config.Env.Storage.AccessKey,
		config.Env.Storage.SecretKey,
		config.Env.Storage.BucketName,
		config.Env.Storage.PublicURL,
		config.Env.Storage.DefaultTTL,
	)

	return db.DB, storage, nil
}

func InjectHTTPHandlers(ctx context.Context, app *fiber.App) {

	// Inject libraries
	db, storage, err := InjectLibraries()
	if err != nil {
		logger.Log.Error("Failed to inject libraries", zap.Error(err))
		return
	}

	// Hello
	helloHandler := handler.NewHelloHandler()
	helloHandler.RegisterRoutes(app)

	// File
	fileHandler := handler.NewFileHandler(storage)
	fileHandler.RegisterRoutes(app)

	// Auth setup
	userRepo := repository.NewUserRepository(db)
	businessRepo := repository.NewBusinessRepository(db)
	emailUsecase := usecase.NewEmailUsecase()
	tokenUsecase := usecase.NewTokenUsecase()
	authUsecase := usecase.NewAuthUsecase(userRepo, businessRepo, emailUsecase, tokenUsecase, storage)

	// handler
	authHandler := handler.NewAuthHandler(authUsecase)
	authHandler.RegisterRoutes(app, db)

	// Product setup
	productRepo := repository.NewProductRepository(db)
	productUsecase := usecase.NewProductUsecase(productRepo, businessRepo, storage)
	productHandler := handler.NewProductHandler(productUsecase)
	productHandler.RegisterRoutes(app, db)

	// Category setup
	categoryRepo := repository.NewCategoryRepository(db)
	categoryUsecase := usecase.NewCategoryUsecase(categoryRepo, businessRepo)
	categoryHandler := handler.NewCategoryHandler(categoryUsecase)
	categoryHandler.RegisterRoutes(app, db)

	// Transaction setup
	transactionRepo := repository.NewTransactionRepository(db)
	transactionItemRepo := repository.NewTransactionItemRepository(db)
	transactionUsecase := usecase.NewTransactionUsecase(transactionRepo, transactionItemRepo, productRepo, businessRepo, db, storage)
	transactionHandler := handler.NewTransactionHandler(transactionUsecase)
	transactionHandler.RegisterRoutes(app, db)

	// User setup
	userUsecase := usecase.NewUserUsecase(userRepo, businessRepo, storage)
	userHandler := handler.NewUserHandler(userUsecase)
	userHandler.RegisterRoutes(app, db)

	// Dashboard setup
	dashboardRepo := repository.NewDashboardRepository(db)
	dashboardUsecase := usecase.NewDashboardUsecase(dashboardRepo, transactionRepo, productRepo, storage)
	dashboardHandler := handler.NewDashboardHandler(dashboardUsecase)
	dashboardHandler.RegisterRoutes(app, db)

}
