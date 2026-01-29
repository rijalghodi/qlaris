package contract

// Current user
type BusinessRes struct {
	ID      string   `json:"id"`
	Name    string   `json:"name"`
	Address *string  `json:"address"`
	Logo    *FileRes `json:"logo"`
}

type RoleRes struct {
	Role     string       `json:"role"`
	Business *BusinessRes `json:"business,omitempty"`
}

type UserRes struct {
	ID          string       `json:"id"`
	Email       string       `json:"email"`
	Name        string       `json:"name"`
	Role        string       `json:"role"`
	Business    *BusinessRes `json:"business,omitempty"`
	GoogleImage *string      `json:"googleImage"`
	Image       *FileRes     `json:"image"`
	IsVerified  bool         `json:"isVerified"`
	HasPassword bool         `json:"hasPassword"`
	CreatedAt   string       `json:"createdAt"`
	UpdatedAt   string       `json:"updatedAt"`
}

type EditCurrentUserReq struct {
	Name  *string `json:"name" validate:"max=255"`
	Image *string `json:"image"`
	EditCurrentUserBusinessReq
}

// Edit password
type EditCurrentUserPasswordReq struct {
	OldPassword *string `json:"oldPassword" validate:"password"`
	NewPassword string  `json:"newPassword" validate:"required,password"`
}

// Edit business
type EditCurrentUserBusinessReq struct {
	Name          *string `json:"name" validate:"max=255"`
	Address       *string `json:"address"`
	Logo          *string `json:"logo"`
	Category      *string `json:"category"`
	EmployeeCount *int    `json:"employeeCount"`
}

// User (Employee)
type CreateUserReq struct {
	Email string  `json:"email" validate:"required,email,max=255"`
	Pin   string  `json:"pin" validate:"required,numeric,len=6"`
	Name  string  `json:"name" validate:"required,max=255"`
	Role  string  `json:"role" validate:"required,oneof=manager cashier"`
	Image *string `json:"image"`
}

type UpdateUserReq struct {
	Name  *string `json:"name" validate:"max=255"`
	Role  *string `json:"role" validate:"oneof=manager cashier"`
	Pin   *string `json:"pin" validate:"omitempty,numeric,len=6"`
	Image *string `json:"image"`
}
