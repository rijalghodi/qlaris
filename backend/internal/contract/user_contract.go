package contract

// Current user
type BusinessRes struct {
	ID           string   `json:"id"`
	Name         string   `json:"name"`
	Code         string   `json:"code"`
	Address      *string  `json:"address"`
	EmployeeSize *string  `json:"employeeSize"`
	Category     *string  `json:"category"`
	Logo         *FileRes `json:"logo"`
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
	Name                 *string `json:"name" validate:"max=255"`
	Image                *string `json:"image"`
	BusinessName         *string `json:"businessName" validate:"max=255"`
	BusinessCode         *string `json:"businessCode" validate:"max=16"`
	BusinessAddress      *string `json:"businessAddress"`
	BusinessLogo         *string `json:"businessLogo"`
	BusinessCategory     *string `json:"businessCategory" validate:"business_category"`
	BusinessEmployeeSize *string `json:"businessEmployeeSize" validate:"employee_size"`
}

// Edit password
type EditCurrentUserPasswordReq struct {
	OldPassword *string `json:"oldPassword" validate:"password"`
	NewPassword string  `json:"newPassword" validate:"required,password"`
}

// Edit business
type EditCurrentUserBusinessReq struct {
	Name         *string `json:"name" validate:"max=255"`
	Code         *string `json:"code" validate:"max=16"`
	Address      *string `json:"address"`
	Logo         *string `json:"logo"`
	Category     *string `json:"category"`
	EmployeeSize *string `json:"employeeSize" validate:"employee_size"`
}
