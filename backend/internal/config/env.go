package config

import (
	"log"

	"github.com/caarlos0/env/v11"
	"github.com/joho/godotenv"
)

type Environment struct {
	App         App
	Logger      Logger
	Postgres    Postgres
	JWT         JWT
	SMTPGoogle  SMTPGoogle
	Storage     Storage
	Firebase    Firebase
	OpenAI      OpenAI
	GoogleOAuth GoogleOAuth
	Auth        Auth
	Cors        Cors
}

type App struct {
	Name                    string `env:"APP_NAME"`
	Host                    string `env:"APP_HOST"`
	Port                    int    `env:"APP_PORT"`
	BaseURL                 string `env:"APP_BASE_URL"`
	SuperPassword           string `env:"APP_SUPER_PASSWORD"`
	RequestResetPasswordTtl int    `env:"APP_REQUEST_RESET_PASSWORD_TTL" envDefault:"5"`
	RequestVerificationTtl  int    `env:"APP_REQUEST_VERIFICATION_TTL" envDefault:"5"`
}

type Logger struct {
	Level        string `env:"LOGGER_LEVEL"`
	Format       string `env:"LOGGER_FORMAT"`
	EnableCaller bool   `env:"LOGGER_ENABLE_CALLER"`
}

type Postgres struct {
	MigrationDirectory string `env:"POSTGRES_MIGRATION_DIRECTORY"`
	MigrationDialect   string `env:"POSTGRES_MIGRATION_DIALECT"`
	Host               string `env:"POSTGRES_HOST"`
	Port               string `env:"POSTGRES_PORT"`
	User               string `env:"POSTGRES_USER"`
	Password           string `env:"POSTGRES_PASSWORD"`
	DBName             string `env:"POSTGRES_DBNAME"`
	SSLMode            string `env:"POSTGRES_SSL_MODE"`
	MaxOpenConns       int    `env:"POSTGRES_MAX_OPEN_CONNS" envDefault:"50"`
	MaxIdleConns       int    `env:"POSTGRES_MAX_IDLE_CONNS" envDefault:"5"`
	ConnMaxLifetime    int    `env:"POSTGRES_CONN_MAX_LIFETIME" envDefault:"120"`  // in seconds
	ConnMaxIdleTime    int    `env:"POSTGRES_CONN_MAX_IDLE_TIME" envDefault:"120"` // in seconds
}

type JWT struct {
	Secret                  string `env:"JWT_SECRET"`
	AccessExpMinutes        int    `env:"JWT_ACCESS_EXP_MINUTES"`
	RefreshExpDays          int    `env:"JWT_REFRESH_EXP_DAYS"`
	ResetPasswordExpMinutes int    `env:"JWT_RESET_PASSWORD_EXP_MINUTES"`
	VerifyEmailExpMinutes   int    `env:"JWT_VERIFY_EMAIL_EXP_MINUTES"`
}

type SMTPGoogle struct {
	Host     string `env:"SMTP_GOOGLE_HOST"`
	Port     int    `env:"SMTP_GOOGLE_PORT"`
	Sender   string `env:"SMTP_GOOGLE_SENDER_NAME"`
	Email    string `env:"SMTP_GOOGLE_EMAIL"`
	Password string `env:"SMTP_GOOGLE_PASSWORD"`
}

type Firebase struct {
	ServiceAccountKeyPath string `env:"FIREBASE_SERVICE_ACCOUNT_KEY_PATH"`
}

type OpenAI struct {
	APIKey string `env:"OPENAI_API_KEY"`
}

type GoogleOAuth struct {
	RedirectURI       string `env:"GOOGLE_OAUTH_REDIRECT_URI"`
	ClientID          string `env:"GOOGLE_OAUTH_CLIENT_ID"`
	ClientSecret      string `env:"GOOGLE_OAUTH_CLIENT_SECRET"`
	ClientCallbackURI string `env:"GOOGLE_OAUTH_CLIENT_CALLBACK_URI"`
}

type Auth struct {
	ResetPasswordURL string `env:"AUTH_RESET_PASSWORD_URL"`
	VerifyEmailURL   string `env:"AUTH_VERIFY_EMAIL_URL"`
}

type Storage struct {
	Endpoint   string `env:"STORAGE_ENDPOINT"`
	Region     string `env:"STORAGE_REGION"`
	AccessKey  string `env:"STORAGE_ACCESS_KEY"`
	SecretKey  string `env:"STORAGE_SECRET_KEY"`
	BucketName string `env:"STORAGE_BUCKET_NAME"`
	PublicURL  string `env:"STORAGE_PUBLIC_URL"`
	DefaultTTL int    `env:"STORAGE_DEFAULT_TTL"`
}

type Cors struct {
	Origins string `env:"CORS_ORIGINS"`
	Headers string `env:"CORS_HEADERS"`
	Methods string `env:"CORS_METHODS"`
}

var Env Environment

func init() {
	_ = godotenv.Load()
	if err := env.Parse(&Env); err != nil {
		log.Fatalf("Could not parse env!, err: %s", err.Error())
	}
}
