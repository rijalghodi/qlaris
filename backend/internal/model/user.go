package model

import "time"

type User struct {
	ID                     string     `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name                   string     `gorm:"type:varchar(255);not null" json:"name"`
	Email                  string     `gorm:"type:varchar(255);not null" json:"email"`
	PasswordHash           *string    `gorm:"type:text" json:"-"` // Hidden from JSON, stores hashed password
	Role                   USER_ROLE  `gorm:"type:user_role;not null" json:"role"`
	GoogleImage            *string    `gorm:"type:text" json:"google_image,omitempty"`
	Image                  *string    `gorm:"type:text" json:"image,omitempty"`
	BusinessID             *string    `gorm:"type:uuid" json:"business_id,omitempty"`
	IsVerified             bool       `gorm:"not null;default:false" json:"is_verified"`
	RequestVerificationAt  *time.Time `json:"request_verification_at,omitempty"`
	RequestResetPasswordAt *time.Time `json:"request_reset_password_at,omitempty"`
	CreatedAt              time.Time  `gorm:"not null;default:now()" json:"created_at"`
	UpdatedAt              time.Time  `gorm:"not null;default:now()" json:"updated_at"`
	DeletedAt              *time.Time `gorm:"index" json:"deleted_at,omitempty"`

	// Relations
	Business *Business `gorm:"foreignKey:BusinessID;constraint:OnDelete:SET NULL" json:"-"`
}
