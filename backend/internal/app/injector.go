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
	defer closeDatabase(db.DB)

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
	db, _, err := InjectLibraries()
	if err != nil {
		logger.Log.Error("Failed to inject libraries", zap.Error(err))
		return
	}

	// Hello
	helloHandler := handler.NewHelloHandler()
	helloHandler.RegisterRoutes(app)

	// Auth setup
	userRepo := repository.NewUserRepository(db)
	emailUsecase := usecase.NewEmailUsecase()
	tokenUsecase := usecase.NewTokenUsecase()
	authUsecase := usecase.NewAuthUsecase(userRepo, emailUsecase, tokenUsecase)

	// handler
	authHandler := handler.NewAuthHandler(authUsecase)
	authHandler.RegisterRoutes(app, db)

	// Product setup
	businessRepo := repository.NewBusinessRepository(db)
	productRepo := repository.NewProductRepository(db)
	productUsecase := usecase.NewProductUsecase(productRepo, businessRepo)
	productHandler := handler.NewProductHandler(productUsecase)
	productHandler.RegisterRoutes(app, db)

	// Transaction setup
	transactionRepo := repository.NewTransactionRepository(db)
	transactionItemRepo := repository.NewTransactionItemRepository(db)
	transactionUsecase := usecase.NewTransactionUsecase(transactionRepo, transactionItemRepo, productRepo, businessRepo, db)
	transactionHandler := handler.NewTransactionHandler(transactionUsecase)
	transactionHandler.RegisterRoutes(app, db)

}
