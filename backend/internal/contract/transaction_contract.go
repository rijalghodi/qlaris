package contract

// Request contracts

type TransactionItemReq struct {
	ProductID string `json:"product_id" validate:"required,uuid"`
	Quantity  int    `json:"quantity" validate:"required,min=1"`
}

type CreateTransactionReq struct {
	Items []TransactionItemReq `json:"items" validate:"required,min=1,dive"`
}

type UpdateTransactionReq struct {
	Items []TransactionItemReq `json:"items" validate:"required,min=1,dive"`
}

type PayTransactionReq struct {
	ReceivedAmount float64 `json:"received_amount" validate:"required,min=0"`
}

// Response contracts

type TransactionItemRes struct {
	ID          string  `json:"id"`
	ProductID   *string `json:"product_id"`
	ProductName string  `json:"product_name"`
	Price       float64 `json:"price"`
	Quantity    int     `json:"quantity"`
	Subtotal    float64 `json:"subtotal"`
}

type TransactionRes struct {
	ID             string               `json:"id"`
	BusinessID     string               `json:"business_id"`
	CreatedBy      string               `json:"created_by"`
	Creator        UserRes              `json:"creator"`
	TotalAmount    float64              `json:"total_amount"`
	ReceivedAmount float64              `json:"received_amount"`
	ChangeAmount   float64              `json:"change_amount"`
	Status         string               `json:"status"`
	PaidAt         *string              `json:"paid_at,omitempty"`
	ExpiredAt      string               `json:"expired_at"`
	CreatedAt      string               `json:"created_at"`
	Items          []TransactionItemRes `json:"items"`
}
