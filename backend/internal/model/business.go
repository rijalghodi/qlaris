package model

import "time"

type Business struct {
	ID        string    `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	OwnerID   string    `gorm:"type:uuid;not null" json:"owner_id"`
	Name      string    `gorm:"type:text;not null" json:"name"`
	Address   *string   `gorm:"type:text" json:"address,omitempty"`
	CreatedAt time.Time `gorm:"not null;default:now()" json:"created_at"`
	UpdatedAt time.Time `gorm:"not null;default:now()" json:"updated_at"`

	// Relations
	Owner User `gorm:"foreignKey:OwnerID;constraint:OnDelete:CASCADE" json:"-"`
}
