package config

import "strings"

type Permission string

const (
	CREATE_USER_SELF Permission = "create_user:self"
	READ_USER_SELF   Permission = "read_user:self"
	EDIT_USER_SELF   Permission = "edit_user:self"
	DELETE_USER_SELF Permission = "delete_user:self"

	CREATE_USER_ORG Permission = "create_user:org"
	READ_USER_ORG   Permission = "read_user:org"
	EDIT_USER_ORG   Permission = "edit_user:org"
	DELETE_USER_ORG Permission = "delete_user:org"

	CREATE_USER_ANY Permission = "create_user:any"
	READ_USER_ANY   Permission = "read_user:any"
	EDIT_USER_ANY   Permission = "edit_user:any"
	DELETE_USER_ANY Permission = "delete_user:any"

	CREATE_PRODUCT_ORG Permission = "create_product:org"
	READ_PRODUCT_ORG   Permission = "read_product:org"
	UPDATE_PRODUCT_ORG Permission = "update_product:org"
	DELETE_PRODUCT_ORG Permission = "delete_product:org"

	CREATE_PRODUCT_ANY Permission = "create_product:any"
	READ_PRODUCT_ANY   Permission = "read_product:any"
	UPDATE_PRODUCT_ANY Permission = "update_product:any"
	DELETE_PRODUCT_ANY Permission = "delete_product:any"

	CREATE_TRANSACTION_ORG Permission = "create_transaction:org"
	READ_TRANSACTION_ORG   Permission = "read_transaction:org"
	UPDATE_TRANSACTION_ORG Permission = "update_transaction:org"
	PAY_TRANSACTION_ORG    Permission = "pay_transaction:org"

	CREATE_TRANSACTION_ANY Permission = "create_transaction:any"
	READ_TRANSACTION_ANY   Permission = "read_transaction:any"
	UPDATE_TRANSACTION_ANY Permission = "update_transaction:any"
	PAY_TRANSACTION_ANY    Permission = "pay_transaction:any"
)

var RolePermissionMap = map[UserRole][]Permission{
	USER_ROLE_SUPERADMIN: {
		CREATE_USER_ANY,
		READ_USER_ANY,
		EDIT_USER_ANY,
		DELETE_USER_ANY,
		CREATE_PRODUCT_ANY,
		READ_PRODUCT_ANY,
		UPDATE_PRODUCT_ANY,
		DELETE_PRODUCT_ANY,
		CREATE_TRANSACTION_ANY,
		READ_TRANSACTION_ANY,
		UPDATE_TRANSACTION_ANY,
		PAY_TRANSACTION_ANY,
	},
	USER_ROLE_OWNER: {
		CREATE_USER_ORG,
		READ_USER_ORG,
		EDIT_USER_ORG,
		DELETE_USER_ORG,
		CREATE_PRODUCT_ORG,
		READ_PRODUCT_ORG,
		UPDATE_PRODUCT_ORG,
		DELETE_PRODUCT_ORG,
		CREATE_TRANSACTION_ORG,
		READ_TRANSACTION_ORG,
		UPDATE_TRANSACTION_ORG,
		PAY_TRANSACTION_ORG,
	},
	USER_ROLE_MANAGER: {
		READ_USER_SELF,
		EDIT_USER_SELF,
		CREATE_PRODUCT_ORG,
		READ_PRODUCT_ORG,
		UPDATE_PRODUCT_ORG,
		DELETE_PRODUCT_ORG,
		CREATE_TRANSACTION_ORG,
		READ_TRANSACTION_ORG,
		UPDATE_TRANSACTION_ORG,
		PAY_TRANSACTION_ORG,
	},
	USER_ROLE_CASHIER: {
		READ_USER_SELF,
		EDIT_USER_SELF,
		READ_PRODUCT_ORG,
		CREATE_TRANSACTION_ORG,
		READ_TRANSACTION_ORG,
		PAY_TRANSACTION_ORG,
	},
}

type PermissionScope string

const (
	PERMISSION_SCOPE_SELF PermissionScope = "self"
	PERMISSION_SCOPE_ORG  PermissionScope = "org"
	PERMISSION_SCOPE_ANY  PermissionScope = "any"
)

func (p Permission) Scope() PermissionScope {
	if idx := strings.LastIndex(string(p), ":"); idx != -1 {
		return PermissionScope(string(p)[idx+1:])
	}
	return ""
}

func DoesRoleAllowedToAccess(role UserRole, permissions []Permission) (bool, *Permission) {
	for _, p := range RolePermissionMap[role] {
		for _, permission := range permissions {
			if p == permission {
				return true, &p
			}
		}
	}
	return false, nil
}
