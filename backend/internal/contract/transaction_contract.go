package contract

// Request contracts

type TransactionItemReq struct {
	ProductID string `json:"productId" validate:"required,uuid"`
	Quantity  int    `json:"quantity" validate:"required,min=1"`
}

type CreateTransactionReq struct {
	Items []TransactionItemReq `json:"items" validate:"required,min=1,dive"`
}

type UpdateTransactionReq struct {
	Items []TransactionItemReq `json:"items" validate:"required,min=1,dive"`
}

type PayTransactionReq struct {
	ReceivedAmount float64 `json:"receivedAmount" validate:"required,min=0"`
}

// Response contracts

type TransactionItemRes struct {
	ID          string  `json:"id"`
	ProductID   *string `json:"productId"`
	ProductName string  `json:"productName"`
	Price       float64 `json:"price"`
	Quantity    int     `json:"quantity"`
	Subtotal    float64 `json:"subtotal"`
}

type TransactionRes struct {
	ID             string               `json:"id"`
	BusinessID     string               `json:"businessId"`
	CreatedBy      string               `json:"createdBy"`
	CreatorName    string               `json:"creatorName"`
	TotalAmount    float64              `json:"totalAmount"`
	ReceivedAmount float64              `json:"receivedAmount"`
	ChangeAmount   float64              `json:"changeAmount"`
	Status         string               `json:"status"`
	PaidAt         *string              `json:"paidAt,omitempty"`
	ExpiredAt      string               `json:"expiredAt"`
	CreatedAt      string               `json:"createdAt"`
	Items          []TransactionItemRes `json:"items"`
}
