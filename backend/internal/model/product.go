package model

import (
	"app/internal/config"
	"time"
)

type Product struct {
	ID            string              `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	BusinessID    string              `gorm:"type:uuid;not null;index:idx_products_business_id" json:"business_id"`
	Name          string              `gorm:"type:varchar(255);not null" json:"name"`
	Price         float64             `gorm:"type:numeric(12,2);not null;check:price >= 0" json:"price"`
	Image         *string             `gorm:"type:text" json:"image,omitempty"`
	IsActive      bool                `gorm:"not null;default:true" json:"is_active"`
	CategoryID    *string             `gorm:"type:uuid" json:"category_id,omitempty"`
	EnableStock   bool                `gorm:"not null;default:false" json:"enable_stock"`
	StockQty      *int                `gorm:"not null;default:0;check:stock_qty >= 0" json:"stock_qty"`
	Unit          *string             `gorm:"type:varchar(36)" json:"unit,omitempty"`
	EnableBarcode bool                `gorm:"not null;default:false" json:"enable_barcode"`
	Cost          *float64            `gorm:"type:numeric(12,2);not null;check:cost >= 0" json:"cost"`
	BarcodeValue  *string             `gorm:"type:varchar(36)" json:"barcode_value,omitempty"`
	BarcodeType   *config.BarcodeType `gorm:"type:barcode_type" json:"barcode_type,omitempty"`
	CreatedAt     time.Time           `gorm:"not null;default:now()" json:"created_at"`
	UpdatedAt     time.Time           `gorm:"not null;default:now()" json:"updated_at"`

	// Relations
	Business Business  `gorm:"foreignKey:BusinessID;constraint:OnDelete:CASCADE" json:"-"`
	Category *Category `gorm:"foreignKey:CategoryID;constraint:OnDelete:SET NULL" json:"-"`
}
