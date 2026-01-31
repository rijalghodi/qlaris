package model

import (
	"app/internal/config"
	"time"
)

type User struct {
	ID                     string          `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name                   string          `gorm:"type:varchar(255);not null" json:"name"`
	Email                  *string         `gorm:"type:varchar(255)" json:"email"`
	Role                   config.UserRole `gorm:"type:user_role;not null" json:"role"`
	BusinessID             *string         `gorm:"type:uuid" json:"business_id"`
	PasswordHash           *string         `gorm:"type:text" json:"-"`
	PinHash                *string         `gorm:"type:text" json:"-"`
	GoogleImage            *string         `gorm:"type:text" json:"google_image,omitempty"`
	Image                  *string         `gorm:"type:text" json:"image,omitempty"`
	IsVerified             bool            `gorm:"not null;default:false" json:"is_verified"`
	IsActive               bool            `gorm:"not null;default:true" json:"is_active"`
	RequestVerificationAt  *time.Time      `json:"request_verification_at,omitempty"`
	RequestResetPasswordAt *time.Time      `json:"request_reset_password_at,omitempty"`
	CreatedAt              time.Time       `gorm:"not null;default:now()" json:"created_at"`
	UpdatedAt              time.Time       `gorm:"not null;default:now()" json:"updated_at"`
	DeletedAt              *time.Time      `gorm:"index" json:"deleted_at,omitempty"`

	// Relations
	Business *Business `gorm:"foreignKey:BusinessID;constraint:OnDelete:CASCADE" json:"-"`
}
