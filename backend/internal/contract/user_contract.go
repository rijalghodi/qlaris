package contract

type UserRes struct {
	ID              string   `json:"id"`
	Email           string   `json:"email"`
	Name            string   `json:"name"`
	Role            string   `json:"role"`
	GoogleImage     *string  `json:"googleImage"`
	Image           *FileRes `json:"image"`
	IsVerified      bool     `json:"isVerified"`
	HasPassword     bool     `json:"hasPassword"`
	BusinessName    *string  `json:"businessName,omitempty"`
	BusinessAddress *string  `json:"businessAddress,omitempty"`
	IsDataCompleted *bool    `json:"isDataCompleted,omitempty"`
	CreatedAt       string   `json:"createdAt"`
	UpdatedAt       string   `json:"updatedAt"`
}

type EditCurrentUserReq struct {
	Name            *string `json:"name" validate:"max=255"`
	Image           *string `json:"image" validate:"max=255"`
	BusinessName    *string `json:"businessName" validate:"max=255"`
	BusinessAddress *string `json:"businessAddress"`
}

type EditPasswordReq struct {
	CurrentPassword *string `json:"currentPassword" validate:"password"`
	NewPassword     string  `json:"newPassword" validate:"required,password"`
}

type CreateUserReq struct {
	Email           string  `json:"email" validate:"required,email,max=255"`
	Password        string  `json:"password" validate:"required,password"`
	Name            string  `json:"name" validate:"required,max=255"`
	Role            string  `json:"role" validate:"required,oneof=owner manager cashier"`
	BusinessID      *string `json:"businessId"`
	Image           *string `json:"image" validate:"max=255"`
	BusinessName    *string `json:"businessName" validate:"max=255"`
	BusinessAddress *string `json:"businessAddress"`
}

type UpdateUserReq struct {
	Name            *string `json:"name" validate:"max=255"`
	Role            *string `json:"role" validate:"oneof=owner manager cashier"`
	Image           *string `json:"image" validate:"max=255"`
	BusinessName    *string `json:"businessName" validate:"max=255"`
	BusinessAddress *string `json:"businessAddress"`
}
