package config

import "time"

const (
	APP_NAME                   = "Qlaris"
	ACCESS_TOKEN_COOKIE_NAME   = "qlaris.access-token"
	REFRESH_TOKEN_COOKIE_NAME  = "qlaris.refresh-token"
	REQUEST_RESET_PASSWORD_TTL = 5 * time.Minute
	REQUEST_VERIFICATION_TTL   = 5 * time.Minute
	TRANSACTION_EXPIRY_TIME    = 15 * time.Minute
	JWT_ACCESS_TTL             = 15 * time.Minute
	JWT_REFRESH_TTL            = 7 * 24 * time.Hour
)

type UserRole string

const (
	USER_ROLE_OWNER      UserRole = "owner"
	USER_ROLE_SUPERADMIN UserRole = "superadmin"
)

type EmployeeRole string

const (
	EMPLOYEE_ROLE_CASHIER EmployeeRole = "cashier"
	EMPLOYEE_ROLE_MANAGER EmployeeRole = "manager"
)

type JwtRole string

const (
	JWT_ROLE_USER       JwtRole = "user"
	JWT_ROLE_EMPLOYEE   JwtRole = "employee"
	JWT_ROLE_SUPERADMIN JwtRole = "superadmin"
	JWT_ROLE_OWNER      JwtRole = "owner"
)

type BarcodeType string

const (
	BARCODE_TYPE_EAN13 BarcodeType = "ean13"
	BARCODE_TYPE_EAN8  BarcodeType = "ean8"
	BARCODE_TYPE_UPC   BarcodeType = "upc"
)

type TransactionStatus string

const (
	TRANSACTION_STATUS_PENDING   TransactionStatus = "pending"
	TRANSACTION_STATUS_PAID      TransactionStatus = "paid"
	TRANSACTION_STATUS_EXPIRED   TransactionStatus = "expired"
	TRANSACTION_STATUS_CANCELLED TransactionStatus = "cancelled"
)
