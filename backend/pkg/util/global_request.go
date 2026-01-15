package util

import "github.com/gofiber/fiber/v2"

type PaginationQueries struct {
	Page     int    `query:"page"`
	PageSize int    `query:"pageSize"`
	Search   string `query:"search"`
}

func ParsePaginationQueries(c *fiber.Ctx) (PaginationQueries, error) {
	var params PaginationQueries
	if err := c.QueryParser(&params); err != nil {
		return PaginationQueries{}, err
	}
	// validate
	if params.Page < 1 {
		params.Page = 1
	}
	if params.PageSize < 1 {
		params.PageSize = 10
	}
	return params, nil
}
