package model

import "time"

type Transaction struct {
	ID            string    `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	BusinessID    string    `gorm:"type:uuid;not null;index:idx_transactions_business_id" json:"business_id"`
	StaffID       string    `gorm:"type:uuid;not null" json:"staff_id"`
	TotalAmount   float64   `gorm:"type:numeric(12,2);not null;check:total_amount >= 0" json:"total_amount"`
	PaymentMethod string    `gorm:"type:text;not null;check:payment_method = 'cash'" json:"payment_method"`
	CreatedAt     time.Time `gorm:"not null;default:now();index:idx_transactions_created_at" json:"created_at"`

	// Relations
	Business Business          `gorm:"foreignKey:BusinessID" json:"-"`
	Staff    Staff             `gorm:"foreignKey:StaffID" json:"-"`
	Items    []TransactionItem `gorm:"foreignKey:TransactionID;constraint:OnDelete:CASCADE" json:"items,omitempty"`
}
