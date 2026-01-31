package util

import (
	"errors"
	"fmt"

	"github.com/go-playground/validator/v10"
)

var customMessages = map[string]string{
	"required":          "Field %s must be filled",
	"email":             "Invalid email address for field %s",
	"min":               "Field %s must have a minimum length of %s characters",
	"max":               "Field %s must have a maximum length of %s characters",
	"len":               "Field %s must be exactly %s characters long",
	"number":            "Field %s must be a number",
	"positive":          "Field %s must be a positive number",
	"alphanum":          "Field %s must contain only alphanumeric characters",
	"oneof":             "Invalid value for field %s",
	"password":          "Field %s must contain at least 8 characters",
	"employee_size":     "Invalid value for field %s. Must be one of: 0, 1-5, 6-10, 11-25, 26+",
	"business_category": "Invalid value for field %s. Must be one of: cafe, restaurant, food_stall, retail, grocery, minimarket, bakery, pharmacy, fashion, laundry, barbershop, printing, other",
}

func CustomErrorMessages(err error) map[string]string {
	var validationErrors validator.ValidationErrors
	if errors.As(err, &validationErrors) {
		return generateErrorMessages(validationErrors)
	}
	return nil
}

func generateErrorMessages(validationErrors validator.ValidationErrors) map[string]string {
	errorsMap := make(map[string]string)
	for _, err := range validationErrors {
		fieldName := ToCamelCase(err.Field())
		tag := err.Tag()

		customMessage := customMessages[tag]
		if customMessage != "" {
			errorsMap[fieldName] = formatErrorMessage(customMessage, err, tag)
		} else {
			errorsMap[fieldName] = defaultErrorMessage(err)
		}
	}
	return errorsMap
}

func formatErrorMessage(customMessage string, err validator.FieldError, tag string) string {
	if tag == "min" || tag == "max" || tag == "len" {
		return fmt.Sprintf(customMessage, err.Field(), err.Param())
	}
	return fmt.Sprintf(customMessage, err.Field())
}

func defaultErrorMessage(err validator.FieldError) string {
	return fmt.Sprintf("Field validation for '%s' failed on the '%s' tag", ToCamelCase(err.Field()), err.Tag())
}

func Password(fl validator.FieldLevel) bool {
	password := fl.Field().String()

	if len(password) < 8 {
		return false
	}

	return true

	// hasLetter := false
	// hasNumber := false

	// for _, char := range password {
	// 	if (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') {
	// 		hasLetter = true
	// 	}
	// 	if char >= '0' && char <= '9' {
	// 		hasNumber = true
	// 	}
	// }

	// return hasLetter && hasNumber
}

func EmployeeSize(fl validator.FieldLevel) bool {
	val := fl.Field().String()

	allowedVal := []string{
		"0",
		"1-5",
		"6-10",
		"11-25",
		"26+",
	}
	for _, v := range allowedVal {
		if val == v {
			return true
		}
	}

	return false
}

func BusinessCategory(fl validator.FieldLevel) bool {
	val := fl.Field().String()

	allowedVal := []string{
		"cafe",
		"restaurant",
		"food_stall",
		"retail",
		"grocery",
		"minimarket",
		"bakery",
		"pharmacy",
		"fashion",
		"laundry",
		"barbershop",
		"printing",
		"other",
	}
	for _, v := range allowedVal {
		if val == v {
			return true
		}
	}

	return false
}

func Validator() *validator.Validate {
	validate := validator.New()

	if err := validate.RegisterValidation("password", Password); err != nil {
		return nil
	}
	if err := validate.RegisterValidation("employee_size", EmployeeSize); err != nil {
		return nil
	}
	if err := validate.RegisterValidation("business_category", BusinessCategory); err != nil {
		return nil
	}

	return validate
}

func ValidateStruct(s interface{}) error {
	validate := Validator()
	if validate == nil {
		return errors.New("failed to create validator")
	}

	if err := validate.Struct(s); err != nil {
		// this error will be handled by ErrorHandler
		return err
	}
	return nil
}
