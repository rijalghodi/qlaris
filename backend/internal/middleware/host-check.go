package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"
)

func HostCheck(allowedHostsStr string) fiber.Handler {
	var allowedHosts = map[string]bool{}

	for h := range strings.SplitSeq(allowedHostsStr, ",") {
		allowedHosts[strings.TrimSpace(h)] = true
	}
	return func(c *fiber.Ctx) error {
		if !allowedHosts[c.Hostname()] {
			return c.SendStatus(403)
		}
		return c.Next()
	}
}
