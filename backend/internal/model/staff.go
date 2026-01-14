package model

import "time"

type Staff struct {
	ID         string    `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	BusinessID string    `gorm:"type:uuid;not null;index:idx_staff_business_id" json:"business_id"`
	Name       string    `gorm:"type:varchar(255);not null" json:"name"`
	PinHash    string    `gorm:"type:text;not null" json:"-"` // Hidden from JSON
	IsActive   bool      `gorm:"not null;default:true" json:"is_active"`
	CreatedAt  time.Time `gorm:"not null;default:now()" json:"created_at"`
	UpdatedAt  time.Time `gorm:"not null;default:now()" json:"updated_at"`

	// Relations
	Business Business `gorm:"foreignKey:BusinessID;constraint:OnDelete:CASCADE" json:"-"`
}
