package cmd

import (
	"app/internal/app"
)

// @title Qlaris API documentation
// @version 1.0.0
// @license.name MIT
// @Contact.name	Rijal Ghodi
// @Contact.email	rijalghodi.dev@gmail.com
// @host localhost:8000
// @BasePath /
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Example Value: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
func RunHTTP() error {
	return app.Run()
}
