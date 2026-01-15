package contract

type CreateProductReq struct {
	Name     string  `json:"name" validate:"required,max=255"`
	Price    float64 `json:"price" validate:"required,gte=0"`
	Image    *string `json:"image" validate:"omitempty,url"`
	StockQty int     `json:"stockQty" validate:"required,gte=0"`
}

type UpdateProductReq struct {
	Name     *string  `json:"name" validate:"omitempty,max=255"`
	Price    *float64 `json:"price" validate:"omitempty,gte=0"`
	Image    *string  `json:"image" validate:"omitempty,url"`
	StockQty *int     `json:"stockQty" validate:"omitempty,gte=0"`
}

type ProductRes struct {
	ID         string  `json:"id"`
	BusinessID string  `json:"businessId"`
	Name       string  `json:"name"`
	Price      float64 `json:"price"`
	Image      *string `json:"image,omitempty"`
	StockQty   int     `json:"stockQty"`
	IsActive   bool    `json:"isActive"`
	CreatedAt  string  `json:"createdAt"`
	UpdatedAt  string  `json:"updatedAt"`
}

type ListProductsRes struct {
	Products []ProductRes `json:"products"`
}

// --- Toggle Product Status ---
type ToggleProductStatusReq struct {
	IsActive bool `json:"isActive"`
}
