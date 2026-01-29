package model

import (
	"app/internal/config"
	"time"
)

type Role struct {
	UserID     string          `gorm:"type:uuid;not null" json:"user_id"`
	Role       config.UserRole `gorm:"type:user_role;not null" json:"role"`
	BusinessID *string         `gorm:"type:uuid" json:"business_id"` // superadmin has no businessId, so it ""
	CreatedAt  time.Time       `gorm:"not null;default:now()" json:"created_at"`
	UpdatedAt  time.Time       `gorm:"not null;default:now()" json:"updated_at"`

	// Relations
	Business *Business `gorm:"foreignKey:BusinessID;constraint:OnDelete:CASCADE" json:"-"`
	User     User      `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
}
