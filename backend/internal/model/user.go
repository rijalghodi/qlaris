package model

import "time"

type User struct {
	ID           string     `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name         string     `gorm:"type:varchar(255);not null" json:"name"`
	Email        string     `gorm:"type:varchar(255);not null" json:"email"`
	GoogleImage  *string    `gorm:"type:text" json:"google_image"`
	Role         ROLE       `gorm:"type:role;not null;default:'owner'" json:"role"`
	PasswordHash *string    `gorm:"type:text" json:"-"` // Hidden from JSON, stores hashed password
	IsVerified   bool       `gorm:"not null;default:false" json:"is_verified"`
	CreatedAt    time.Time  `gorm:"not null;default:now()" json:"created_at"`
	UpdatedAt    time.Time  `gorm:"not null;default:now()" json:"updated_at"`
	DeletedAt    *time.Time `gorm:"index" json:"deleted_at,omitempty"`
}
