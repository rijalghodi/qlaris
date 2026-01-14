package cmd

import (
	"app/internal/app"
)

// @title Qlaris API documentation
// @version 1.0.0
// @license.name MIT
// @license.url https://github.com/rijalghodi/qlaris/blob/main/LICENSE
// @host localhost:8000
// @BasePath /
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Example Value: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
func RunHTTP() error {
	return app.Run()
}
