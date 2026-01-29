package model

import "time"

type Business struct {
	ID            string    `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name          string    `gorm:"type:text;not null" json:"name"`
	Address       *string   `gorm:"type:text" json:"address,omitempty"`
	Logo          *string   `gorm:"type:text" json:"logo,omitempty"`
	EmployeeCount *int      `gorm:"type:int" json:"employee_count,omitempty"`
	Category      *string   `gorm:"type:varchar(32)" json:"category,omitempty"`
	CreatedAt     time.Time `gorm:"not null;default:now()" json:"created_at"`
	UpdatedAt     time.Time `gorm:"not null;default:now()" json:"updated_at"`
}
