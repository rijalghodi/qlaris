package model

import "time"

type Product struct {
	ID         string    `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	BusinessID string    `gorm:"type:uuid;not null;index:idx_products_business_id" json:"business_id"`
	Name       string    `gorm:"type:varchar(255);not null" json:"name"`
	Price      float64   `gorm:"type:numeric(12,2);not null;check:price >= 0" json:"price"`
	Image      *string   `gorm:"type:text" json:"image,omitempty"`
	StockQty   int       `gorm:"not null;default:0;check:stock_qty >= 0" json:"stock_qty"`
	IsActive   bool      `gorm:"not null;default:true" json:"is_active"`
	CreatedAt  time.Time `gorm:"not null;default:now()" json:"created_at"`
	UpdatedAt  time.Time `gorm:"not null;default:now()" json:"updated_at"`

	// Relations
	Business Business `gorm:"foreignKey:BusinessID;constraint:OnDelete:CASCADE" json:"-"`
}
