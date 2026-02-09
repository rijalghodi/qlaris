package util

import (
	"fmt"
	"math/rand"
	"strings"
	"time"
	"unicode"
)

// ToCamelCase converts any string (First Name, first_name, FirstName) to camelCase (firstName)
func ToCamelCase(str string) string {
	if str == "" {
		return ""
	}

	// Replace common separators with spaces
	str = strings.ReplaceAll(str, "_", " ")
	str = strings.ReplaceAll(str, "-", " ")

	// Split by spaces
	words := strings.Fields(str)
	if len(words) == 0 {
		return ""
	}

	// Handle single word case (could be PascalCase or already camelCase)
	if len(words) == 1 {
		// Convert first character to lowercase
		runes := []rune(words[0])
		if len(runes) > 0 {
			runes[0] = unicode.ToLower(runes[0])
		}
		return string(runes)
	}

	// Multiple words: first word lowercase, capitalize first letter of subsequent words
	result := strings.Builder{}

	for i, word := range words {
		if word == "" {
			continue
		}

		runes := []rune(word)
		if i == 0 {
			// First word: all lowercase
			result.WriteString(strings.ToLower(word))
		} else {
			// Subsequent words: capitalize first letter, lowercase rest
			runes[0] = unicode.ToUpper(runes[0])
			for j := 1; j < len(runes); j++ {
				runes[j] = unicode.ToLower(runes[j])
			}
			result.WriteString(string(runes))
		}
	}

	return result.String()
}

// GenerateBusinessCode generates a random 6-digit business code
func GenerateBusinessCode() string {
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	code := r.Intn(1000000) // 0 to 999999
	return fmt.Sprintf("%06d", code)
}
