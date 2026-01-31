package config

import (
	"app/pkg/util"
	"encoding/json"

	"github.com/gofiber/fiber/v2"
)

func FiberConfig() fiber.Config {
	return fiber.Config{
		CaseSensitive: true,
		ServerHeader:  APP_NAME,
		AppName:       APP_NAME + " API",
		ErrorHandler:  util.ErrorHandler,
		JSONEncoder:   json.Marshal,
		JSONDecoder:   json.Unmarshal,
	}
}
