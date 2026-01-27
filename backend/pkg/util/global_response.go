package util

type BaseResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Data    any    `json:"data,omitempty"`
	Details any    `json:"details,omitempty"`
}

func ToSuccessResponse(data any) BaseResponse {
	return BaseResponse{Success: true, Message: "success", Data: data}
}

func ToErrorResponse(msg string, details any) BaseResponse {
	return BaseResponse{Success: false, Message: msg, Details: details}
}

type Pagination struct {
	Page       int   `json:"page"`
	PageSize   int   `json:"pageSize"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"totalPages"`
}

type PaginatedResponse struct {
	Success    bool       `json:"success"`
	Message    string     `json:"message"`
	Data       any        `json:"data,omitempty"`
	Pagination Pagination `json:"pagination,omitempty"`
}

func ToPaginatedResponse(items any, page, pageSize int, total int64) PaginatedResponse {
	totalPages := int((total + int64(pageSize) - 1) / int64(pageSize))

	return PaginatedResponse{
		Success: true,
		Message: "success",
		Data:    items,
		Pagination: Pagination{
			Page:       page,
			PageSize:   pageSize,
			Total:      total,
			TotalPages: totalPages,
		},
	}
}
