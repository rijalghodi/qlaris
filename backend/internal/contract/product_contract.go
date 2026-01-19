package contract

type CreateProductReq struct {
	Name          string   `json:"name" validate:"required,max=255"`
	Price         float64  `json:"price" validate:"required,gte=0"`
	Image         *string  `json:"image" validate:"omitempty,url"`
	CategoryID    *string  `json:"categoryId" validate:"omitempty"`
	IsFavorite    bool     `json:"isFavorite"`
	EnableStock   bool     `json:"enableStock"`
	StockQty      *int     `json:"stockQty" validate:"omitempty,gte=0"`
	Unit          *string  `json:"unit,omitempty"`
	EnableBarcode bool     `json:"enableBarcode"`
	BarcodeValue  *string  `json:"barcodeValue,omitempty"`
	BarcodeType   *string  `json:"barcodeType,omitempty"`
	Cost          *float64 `json:"cost,omitempty"`
}

type UpdateProductReq struct {
	Name          *string  `json:"name" validate:"omitempty,max=255"`
	Price         *float64 `json:"price" validate:"omitempty,gte=0"`
	Image         *string  `json:"image" validate:"omitempty,url"`
	CategoryID    *string  `json:"categoryId" validate:"omitempty"`
	IsFavorite    *bool    `json:"isFavorite"`
	IsActive      *bool    `json:"isActive"`
	EnableStock   *bool    `json:"enableStock"`
	StockQty      *int     `json:"stockQty" validate:"omitempty,gte=0"`
	Unit          *string  `json:"unit,omitempty"`
	EnableBarcode *bool    `json:"enableBarcode"`
	BarcodeValue  *string  `json:"barcodeValue,omitempty"`
	BarcodeType   *string  `json:"barcodeType,omitempty"`
	Cost          *float64 `json:"cost,omitempty"`
}

type ProductRes struct {
	ID            string   `json:"id"`
	BusinessID    string   `json:"businessId"`
	Name          string   `json:"name"`
	Price         float64  `json:"price"`
	IsActive      bool     `json:"isActive"`
	Image         *string  `json:"image,omitempty"`
	EnableStock   bool     `json:"enableStock"`
	StockQty      *int     `json:"stockQty"`
	Unit          *string  `json:"unit,omitempty"`
	EnableBarcode bool     `json:"enableBarcode"`
	BarcodeValue  *string  `json:"barcodeValue,omitempty"`
	BarcodeType   *string  `json:"barcodeType,omitempty"`
	Cost          *float64 `json:"cost,omitempty"`
	CreatedAt     string   `json:"createdAt"`
	UpdatedAt     string   `json:"updatedAt"`
}

type ListProductsRes struct {
	Products []ProductRes `json:"products"`
}

// --- Toggle Product Status ---
type ToggleProductStatusReq struct {
	IsActive bool `json:"isActive"`
}
