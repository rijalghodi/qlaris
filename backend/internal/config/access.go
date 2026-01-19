package config

import "strings"

type Permission string

const (
	CREATE_PRODUCT_ORG Permission = "create_product:org"
	READ_PRODUCT_ORG   Permission = "read_product:org"
	UPDATE_PRODUCT_ORG Permission = "update_product:org"
	DELETE_PRODUCT_ORG Permission = "delete_product:org"

	CREATE_PRODUCT_ANY Permission = "create_product:any"
	READ_PRODUCT_ANY   Permission = "read_product:any"
	UPDATE_PRODUCT_ANY Permission = "update_product:any"
	DELETE_PRODUCT_ANY Permission = "delete_product:any"
)

var RolePermissionMap = map[UserRole][]Permission{
	USER_ROLE_SUPERADMIN: {
		CREATE_PRODUCT_ANY,
		READ_PRODUCT_ANY,
		UPDATE_PRODUCT_ANY,
		DELETE_PRODUCT_ANY,
	},
	USER_ROLE_OWNER: {
		CREATE_PRODUCT_ORG,
		READ_PRODUCT_ORG,
		UPDATE_PRODUCT_ORG,
		DELETE_PRODUCT_ORG,
	},
	USER_ROLE_MANAGER: {
		CREATE_PRODUCT_ORG,
		READ_PRODUCT_ORG,
		UPDATE_PRODUCT_ORG,
		DELETE_PRODUCT_ORG,
	},
	USER_ROLE_CASHIER: {
		READ_PRODUCT_ORG,
	},
}

type PermissionScope string

const (
	PERMISSION_SCOPE_ORG PermissionScope = "org"
	PERMISSION_SCOPE_ANY PermissionScope = "any"
)

func (p Permission) Scope() PermissionScope {
	if idx := strings.LastIndex(string(p), ":"); idx != -1 {
		return PermissionScope(string(p)[idx+1:])
	}
	return ""
}
