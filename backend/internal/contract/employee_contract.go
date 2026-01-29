package contract

// Employee (staff/cashier/manager)
type EmployeeRes struct {
	ID        string       `json:"id"`
	Name      string       `json:"name"`
	Role      string       `json:"role"`
	Business  *BusinessRes `json:"business,omitempty"`
	Image     *FileRes     `json:"image"`
	CreatedAt string       `json:"createdAt"`
	UpdatedAt string       `json:"updatedAt"`
}

type CreateEmployeeReq struct {
	Name  string  `json:"name" validate:"required,max=255"`
	Pin   string  `json:"pin" validate:"required,numeric,len=6"`
	Role  string  `json:"role" validate:"required,oneof=cashier manager"`
	Image *string `json:"image"`
}

type UpdateEmployeeReq struct {
	Name  *string `json:"name" validate:"max=255"`
	Role  *string `json:"role" validate:"oneof=cashier manager"`
	Image *string `json:"image"`
}

type UpdateEmployeePinReq struct {
	Pin string `json:"pin" validate:"required,numeric,len=6"`
}
