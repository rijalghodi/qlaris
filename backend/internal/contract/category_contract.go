package contract

type CreateCategoryReq struct {
	Name string `json:"name" validate:"required,max=255"`
}

type UpdateCategoryReq struct {
	Name *string `json:"name" validate:"omitempty,max=255"`
}

type SortCategoryReq struct {
	CategoryID string `json:"categoryId" validate:"required"`
	SortOrder  int    `json:"sortOrder" validate:"required,gte=0"`
}

type SortCategoriesReq struct {
	Categories []SortCategoryReq `json:"categories" validate:"required,min=1,dive"`
}

type CategoryRes struct {
	ID         string `json:"id"`
	BusinessID string `json:"businessId"`
	Name       string `json:"name"`
	SortOrder  int    `json:"sortOrder"`
	CreatedAt  string `json:"createdAt"`
	UpdatedAt  string `json:"updatedAt"`
}
