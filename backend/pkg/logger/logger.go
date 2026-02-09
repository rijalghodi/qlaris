package logger

import (
	"log"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

var Log *zap.SugaredLogger

// Config holds logger configuration
type Config struct {
	Level        string // debug, info, warn, error
	Format       string // json, console
	EnableCaller bool   // show caller info
}

// Init initializes the global logger with the given configuration
// Compatible with Google Cloud Logging structured logging format
func Init(cfg Config) {
	var level zapcore.Level
	switch cfg.Level {
	case "debug":
		level = zapcore.DebugLevel
	case "info":
		level = zapcore.InfoLevel
	case "warn":
		level = zapcore.WarnLevel
	case "error":
		level = zapcore.ErrorLevel
	default:
		level = zapcore.InfoLevel
	}

	var config zap.Config
	if cfg.Format == "console" {
		config = zap.NewDevelopmentConfig()
		config.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
		config.EncoderConfig.TimeKey = "timestamp"
		config.EncoderConfig.EncodeTime = zapcore.TimeEncoderOfLayout("15:04:05.00")
	} else {
		// Google Cloud Logging compatible configuration
		config = zap.NewProductionConfig()

		// Use "severity" field name for GCP compatibility
		config.EncoderConfig.LevelKey = "severity"

		// Use uppercase severity levels (DEBUG, INFO, WARNING, ERROR) for GCP
		config.EncoderConfig.EncodeLevel = zapcore.CapitalLevelEncoder

		// Use "timestamp" field with RFC3339 format for GCP
		config.EncoderConfig.TimeKey = "timestamp"
		config.EncoderConfig.EncodeTime = zapcore.RFC3339TimeEncoder

		// Use "message" field name for GCP
		config.EncoderConfig.MessageKey = "message"
	}

	config.Level = zap.NewAtomicLevelAt(level)
	config.DisableCaller = !cfg.EnableCaller
	config.DisableStacktrace = true

	logger, err := config.Build()
	if err != nil {
		log.Fatalf("Could not initialize logger: %s", err.Error())
	}

	Log = logger.Sugar()
}

// InitDefault initializes the logger with default settings
// Uses Google Cloud Logging compatible format
func InitDefault() {
	Init(Config{
		Level:        "info",
		Format:       "json",
		EnableCaller: false,
	})
}
