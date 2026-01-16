package config

import (
	"app/pkg/util"
	"encoding/json"

	"github.com/gofiber/fiber/v2"
)

func FiberConfig() fiber.Config {
	return fiber.Config{
		CaseSensitive: true,
		ServerHeader:  "Qlaris",
		AppName:       "Qlaris API",
		ErrorHandler:  util.ErrorHandler,
		JSONEncoder:   json.Marshal,
		JSONDecoder:   json.Unmarshal,
	}
}
