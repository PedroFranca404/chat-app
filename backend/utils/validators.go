package utils

import (
	"errors"
	"strings"
)

func ValidateInput(data string, maxLength int) error {
	trimmed := strings.TrimSpace(data)
	if trimmed == "" {
		return errors.New("input cannot be empty")
	}
	if len(trimmed) > maxLength {
		return errors.New("input exceeds maximum length")
	}
	return nil
}