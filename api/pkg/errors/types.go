// errors/types.go
package errors

import (
	"github.com/vektah/gqlparser/v2/ast"
)

type ErrorCode string
type ErrorType string

const (
	// Error Codes
	AuthenticationError ErrorCode = "AUTHENTICATION_ERROR"
	AuthorizationError  ErrorCode = "AUTHORIZATION_ERROR"
	ValidationError     ErrorCode = "VALIDATION_ERROR"
	NotFoundError       ErrorCode = "NOT_FOUND"
	InternalError       ErrorCode = "INTERNAL_ERROR"

	// Error Types
	InlineError ErrorType = "INLINE"
	GlobalError ErrorType = "GLOBAL"
	ToastError  ErrorType = "TOAST"
)

// FieldError represents an error for a specific field
type FieldError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

type GraphQLError struct {
	Message                string                 `json:"message"`
	Path                   ast.Path               `json:"path,omitempty"`
	Code                   ErrorCode              `json:"code"`
	Type                   ErrorType              `json:"type"` // Type of error (INLINE, GLOBAL, TOAST)
	UserError              bool                   `json:"userError"`
	UserPresentableMessage string                 `json:"userPresentableMessage,omitempty"`
	Fields                 []FieldError           `json:"fields,omitempty"` // For inline field errors
	Meta                   map[string]interface{} `json:"meta,omitempty"`
}

func (e *GraphQLError) Error() string {
	return e.Message
}

// Helper constructors for different types of errors
func NewInlineError(code ErrorCode, fields []FieldError) *GraphQLError {
	messages := make([]string, len(fields))
	for i, f := range fields {
		messages[i] = f.Message
	}

	return &GraphQLError{
		Message:   "Validation failed",
		Code:      code,
		Type:      InlineError,
		UserError: true,
		Fields:    fields,
	}
}

func NewGlobalError(code ErrorCode, message string) *GraphQLError {
	return &GraphQLError{
		Message:   message,
		Code:      code,
		Type:      GlobalError,
		UserError: true,
	}
}

func NewToastError(code ErrorCode, message string) *GraphQLError {
	return &GraphQLError{
		Message:   message,
		Code:      code,
		Type:      ToastError,
		UserError: true,
	}
}

// Helper to create path from strings
func PathFromStrings(paths ...string) ast.Path {
	result := make(ast.Path, len(paths))
	for i, p := range paths {
		result[i] = ast.PathName(p)
	}
	return result
}
