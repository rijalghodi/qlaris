package contract

type UserRes struct {
	ID              string  `json:"id"`
	Email           string  `json:"email"`
	Name            string  `json:"name"`
	Role            string  `json:"role"`
	GoogleImage     *string `json:"googleImage"`
	IsVerified      bool    `json:"isVerified"`
	BusinessName    *string `json:"businessName" validate:"omitempty"`
	BusinessAddress *string `json:"businessAddress" validate:"omitempty"`
	IsDataCompleted bool    `json:"isDataCompleted"`
	CreatedAt       string  `json:"createdAt"`
	UpdatedAt       string  `json:"updatedAt"`
}

type EditCurrentUserReq struct {
	Name            *string `json:"name" validate:"omitempty,max=255"`
	BusinessName    *string `json:"businessName" validate:"omitempty,max=255"`
	BusinessAddress *string `json:"businessAddress"`
}

type EditPasswordReq struct {
	CurrentPassword string `json:"currentPassword" validate:"required,min=8,max=50"`
	NewPassword     string `json:"newPassword" validate:"required,min=8,max=50"`
}
