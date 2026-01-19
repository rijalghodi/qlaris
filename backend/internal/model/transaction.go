package model

import "time"

type Transaction struct {
	ID             string             `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	BusinessID     string             `gorm:"type:uuid;not null;index:idx_transactions_business_id" json:"business_id"`
	CreatedBy      string             `gorm:"type:uuid;not null" json:"created_by"`
	TotalAmount    float64            `gorm:"type:numeric(12,2);not null;check:total_amount >= 0" json:"total_amount"`
	ReceivedAmount float64            `gorm:"type:numeric(12,2);not null;default:0;check:received_amount >= 0" json:"received_amount"`
	ChangeAmount   float64            `gorm:"type:numeric(12,2);not null;default:0;check:change_amount >= 0" json:"change_amount"`
	Status         TRANSACTION_STATUS `gorm:"type:transaction_status;not null;default:'pending'" json:"status"`
	InvoiceNumber  *string            `gorm:"type:varchar(36)" json:"invoice_number,omitempty"`
	PaidAt         *time.Time         `gorm:"type:timestamp" json:"paid_at,omitempty"`
	ExpiredAt      time.Time          `gorm:"type:timestamp;not null" json:"expired_at"`
	CreatedAt      time.Time          `gorm:"not null;default:now()" json:"created_at"`
	UpdatedAt      time.Time          `gorm:"not null;default:now()" json:"updated_at"`

	// Relations
	Business Business          `gorm:"foreignKey:BusinessID" json:"-"`
	Creator  User              `gorm:"foreignKey:CreatedBy" json:"-"`
	Items    []TransactionItem `gorm:"foreignKey:TransactionID;constraint:OnDelete:CASCADE" json:"items,omitempty"`
}
