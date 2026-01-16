package model

import "time"

type Transaction struct {
	ID             string     `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	BusinessID     string     `gorm:"type:uuid;not null;index:idx_transactions_business_id" json:"business_id"`
	StaffID        string     `gorm:"type:uuid;not null" json:"staff_id"`
	TotalAmount    float64    `gorm:"type:numeric(12,2);not null;check:total_amount >= 0" json:"total_amount"`
	PaymentMethod  string     `gorm:"type:text;not null;check:payment_method = 'cash'" json:"payment_method"`
	AmountReceived float64    `gorm:"type:numeric(12,2);not null;default:0;check:amount_received >= 0" json:"amount_received"`
	ChangeAmount   float64    `gorm:"type:numeric(12,2);not null;default:0;check:change_amount >= 0" json:"change_amount"`
	Status         string     `gorm:"type:transaction_status;not null;default:'pending'" json:"status"`
	PaidAt         *time.Time `gorm:"type:timestamp" json:"paid_at,omitempty"`
	ExpiredAt      time.Time  `gorm:"type:timestamp;not null" json:"expired_at"`
	CreatedAt      time.Time  `gorm:"not null;default:now()" json:"created_at"`
	UpdatedAt      time.Time  `gorm:"not null;default:now()" json:"updated_at"`

	// Relations
	Business Business          `gorm:"foreignKey:BusinessID" json:"-"`
	Items    []TransactionItem `gorm:"foreignKey:TransactionID;constraint:OnDelete:CASCADE" json:"items,omitempty"`
}
