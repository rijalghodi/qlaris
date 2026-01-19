package model

import "time"

type TransactionItem struct {
	ID            string    `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	TransactionID string    `gorm:"type:uuid;not null;index:idx_transaction_items_transaction_id" json:"transaction_id"`
	ProductID     *string   `gorm:"type:uuid" json:"product_id,omitempty"`
	ProductName   string    `gorm:"type:varchar(255);not null" json:"product_name"`
	Price         float64   `gorm:"type:numeric(12,2);not null;check:price >= 0" json:"price"`
	Quantity      int       `gorm:"not null;check:quantity > 0" json:"quantity"`
	Subtotal      float64   `gorm:"type:numeric(12,2);not null;check:subtotal >= 0" json:"subtotal"`
	CreatedAt     time.Time `gorm:"not null;default:now()" json:"created_at"`
	UpdatedAt     time.Time `gorm:"not null;default:now()" json:"updated_at"`

	// Relations
	Transaction Transaction `gorm:"foreignKey:TransactionID;constraint:OnDelete:CASCADE" json:"-"`
	Product     *Product    `gorm:"foreignKey:ProductID;constraint:OnDelete:SET NULL" json:"-"`
}
