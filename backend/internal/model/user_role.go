package model

import (
	"app/internal/config"
	"time"
)

type UserRole struct {
	UserID     string          `gorm:"type:uuid;not null" json:"user_id"`
	BusinessID string          `gorm:"type:uuid;not null" json:"business_id"`
	Role       config.UserRole `gorm:"type:user_role;not null" json:"role"`
	CreatedAt  time.Time       `gorm:"not null;default:now()" json:"created_at"`
	UpdatedAt  time.Time       `gorm:"not null;default:now()" json:"updated_at"`

	// Relations
	Business Business `gorm:"foreignKey:BusinessID;constraint:OnDelete:CASCADE" json:"-"`
	User     User     `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
}
