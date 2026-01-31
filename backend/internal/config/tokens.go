package config

type TokenType string

const (
	TokenTypeAccess        TokenType = "access"
	TokenTypeRefresh       TokenType = "refresh"
	TokenTypeResetPassword TokenType = "resetPassword"
	TokenTypeVerifyEmail   TokenType = "verifyEmail"
)
