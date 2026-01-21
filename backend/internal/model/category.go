package model

import "time"

type Category struct {
	ID         string    `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	BusinessID string    `gorm:"type:uuid;not null" json:"business_id"`
	Name       string    `gorm:"type:varchar(255);not null" json:"name"`
	SortOrder  int       `gorm:"type:int" json:"sort_order"`
	CreatedAt  time.Time `gorm:"not null;default:now()" json:"created_at"`
	UpdatedAt  time.Time `gorm:"not null;default:now()" json:"updated_at"`

	// Relations
	Business Business `gorm:"foreignKey:BusinessID;constraint:OnDelete:CASCADE" json:"-"`
}
