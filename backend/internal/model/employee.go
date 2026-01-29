package model

import (
	"app/internal/config"
	"time"
)

type Employee struct {
	ID         string              `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name       string              `gorm:"type:varchar(255);not null" json:"name"`
	Role       config.EmployeeRole `gorm:"type:employee_role;not null" json:"role"`
	BusinessID string              `gorm:"type:uuid;not null" json:"business_id"`
	PinHash    string              `gorm:"type:text;not null" json:"-"` // Hidden from JSON, stores hashed password
	Image      *string             `gorm:"type:text" json:"image,omitempty"`
	CreatedAt  time.Time           `gorm:"not null;default:now()" json:"created_at"`
	UpdatedAt  time.Time           `gorm:"not null;default:now()" json:"updated_at"`

	// Relations
	Business Business `gorm:"foreignKey:BusinessID;constraint:OnDelete:CASCADE" json:"-"`
}
