package errors

const (
	ValidationError = "VALIDATION_ERROR"
	NotFoundError   = "NOT_FOUND"
	AuthError       = "AUTHENTICATION_ERROR"
	InternalError   = "INTERNAL_ERROR"
)

type GraphQLError struct {
	Message                string
	Code                   string
	Type                   string // "INLINE", "GLOBAL", or "TOAST"
	UserError              bool
	UserPresentableMessage string
	Path                   []interface{}
	Meta                   map[string]interface{}
	Fields                 []ErrorField
}

type ErrorField struct {
	Field   string
	Message string
}

// Constructor functions for different error types
func NewValidationError(message string, fields []ErrorField) *GraphQLError {
	return &GraphQLError{
		Message:   message,
		Code:      ValidationError,
		Type:      "INLINE",
		UserError: true,
		Fields:    fields,
	}
}

func NewGlobalError(message string, userMessage string) *GraphQLError {
	return &GraphQLError{
		Message:                message,
		Code:                   InternalError,
		Type:                   "GLOBAL",
		UserError:              true,
		UserPresentableMessage: userMessage,
	}
}

func NewToastError(message string, userMessage string) *GraphQLError {
	return &GraphQLError{
		Message:                message,
		Code:                   InternalError,
		Type:                   "TOAST",
		UserError:              true,
		UserPresentableMessage: userMessage,
	}
}

func (e *GraphQLError) Error() string {
	return e.Message
}
